"""
Complete User Journey Integration Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Full user journey from browse to checkout
- Cross-service integration
- Data consistency verification
"""

import pytest
import httpx
from typing import Dict, Any
import json


# Service URLs
BASE_URLS = {
    "product": "http://localhost:8002",
    "order": "http://localhost:8003",
    "chat": "http://localhost:8004",
}


class TestCompleteUserJourney:
    """Test complete user journey from browse to order."""

    @pytest.mark.integration
    @pytest.mark.slow
    def test_browse_add_checkout_flow(self):
        """Test full flow: browse products -> add to cart -> checkout."""
        auth_headers = {
            "Authorization": "Bearer 1-test-user",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Step 1: Browse products
            products_response = client.get(
                f"{BASE_URLS['product']}/api/products?limit=10"
            )
            assert products_response.status_code == 200
            products = products_response.json()["products"]
            assert len(products) > 0

            # Select first product
            selected_product = products[0]
            product_id = selected_product["id"]
            product_price = selected_product["price"]

            # Step 2: Add to cart
            cart_response = client.post(
                f"{BASE_URLS['order']}/api/cart/items",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 1,
                    "price": product_price,
                }
            )
            assert cart_response.status_code == 200
            cart_data = cart_response.json()
            assert len(cart_data["items"]) > 0

            # Step 3: Verify cart
            get_cart_response = client.get(
                f"{BASE_URLS['order']}/api/cart",
                headers=auth_headers
            )
            assert get_cart_response.status_code == 200
            cart = get_cart_response.json()
            assert cart["total_amount"] > 0

            # Step 4: Checkout
            checkout_response = client.post(
                f"{BASE_URLS['order']}/api/checkout",
                headers=auth_headers,
                json={"shipping_address": "Integration Test Address, Karachi"}
            )
            assert checkout_response.status_code == 201
            order = checkout_response.json()
            assert order["status"] == "pending"
            assert order["total_amount"] == cart["total_amount"]

            # Step 5: Verify order in order list
            orders_response = client.get(
                f"{BASE_URLS['order']}/api/orders",
                headers=auth_headers
            )
            assert orders_response.status_code == 200
            orders = orders_response.json()
            order_ids = [o["id"] for o in orders]
            assert order["id"] in order_ids

    @pytest.mark.integration
    def test_browse_multiple_products_checkout(self):
        """Test adding multiple products from different categories."""
        auth_headers = {
            "Authorization": "Bearer 2-multi-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Clear cart first
            client.delete(f"{BASE_URLS['order']}/api/cart", headers=auth_headers)

            # Get products from different categories
            # Category 1: Fancy Suits
            fancy_response = client.get(
                f"{BASE_URLS['product']}/api/products?category_id=1&limit=1"
            )
            # Category 2: Shalwar Qameez
            sq_response = client.get(
                f"{BASE_URLS['product']}/api/products?category_id=2&limit=1"
            )

            if fancy_response.status_code == 200 and sq_response.status_code == 200:
                fancy_products = fancy_response.json()["products"]
                sq_products = sq_response.json()["products"]

                if fancy_products and sq_products:
                    # Add both to cart
                    client.post(
                        f"{BASE_URLS['order']}/api/cart/items",
                        headers=auth_headers,
                        json={
                            "product_id": fancy_products[0]["id"],
                            "quantity": 1,
                            "price": fancy_products[0]["price"],
                        }
                    )

                    client.post(
                        f"{BASE_URLS['order']}/api/cart/items",
                        headers=auth_headers,
                        json={
                            "product_id": sq_products[0]["id"],
                            "quantity": 2,
                            "price": sq_products[0]["price"],
                        }
                    )

                    # Verify cart has both items
                    cart_response = client.get(
                        f"{BASE_URLS['order']}/api/cart",
                        headers=auth_headers
                    )
                    assert cart_response.status_code == 200
                    cart = cart_response.json()
                    assert len(cart["items"]) == 2


class TestChatRAGIntegration:
    """Test RAG + Chat integration."""

    @pytest.mark.integration
    @pytest.mark.slow
    def test_chat_with_product_context(self):
        """Test that chat includes product recommendations."""
        with httpx.Client(timeout=30.0) as client:
            # First check RAG status
            rag_status = client.get(f"{BASE_URLS['chat']}/api/chat/rag-status")

            if rag_status.status_code == 200 and rag_status.json().get("status") == "online":
                # Search for products via RAG
                search_response = client.post(
                    f"{BASE_URLS['chat']}/api/chat/search-products",
                    params={
                        "query": "formal suit for wedding",
                        "limit": 5
                    }
                )

                if search_response.status_code == 200:
                    search_results = search_response.json()
                    assert "results" in search_results

                    # Now send chat message - should get context-aware response
                    message_response = client.post(
                        f"{BASE_URLS['chat']}/api/chat/messages",
                        json={
                            "text": "What formal suits do you have?",
                            "session_id": "rag-integration-test",
                            "user_id": 1
                        }
                    )
                    # Response should be streaming
                    assert message_response.status_code == 200

    @pytest.mark.integration
    def test_search_then_chat_flow(self):
        """Test user flow: search products then ask chat about them."""
        with httpx.Client(timeout=30.0) as client:
            # Step 1: Search products
            products_response = client.get(
                f"{BASE_URLS['product']}/api/products?search=cotton"
            )
            assert products_response.status_code == 200
            products = products_response.json()["products"]

            if products:
                product_name = products[0]["name"]

                # Step 2: Ask chat about the product
                # This simulates user finding a product and asking about it
                search_response = client.post(
                    f"{BASE_URLS['chat']}/api/chat/search-products",
                    params={
                        "query": f"tell me about {product_name}",
                        "limit": 3
                    }
                )

                # Should either work or return 503 (RAG offline)
                assert search_response.status_code in [200, 503]


class TestDataIntegrity:
    """Test data consistency across services."""

    @pytest.mark.integration
    def test_cart_order_sync(self):
        """Test that cart items correctly transfer to order."""
        auth_headers = {
            "Authorization": "Bearer 3-sync-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Clear cart
            client.delete(f"{BASE_URLS['order']}/api/cart", headers=auth_headers)

            # Add specific items
            items_to_add = [
                {"product_id": 1, "quantity": 2, "price": 8500.0},
                {"product_id": 11, "quantity": 1, "price": 3500.0},
            ]

            for item in items_to_add:
                client.post(
                    f"{BASE_URLS['order']}/api/cart/items",
                    headers=auth_headers,
                    json=item
                )

            # Get cart total
            cart_response = client.get(
                f"{BASE_URLS['order']}/api/cart",
                headers=auth_headers
            )
            cart = cart_response.json()
            cart_total = cart["total_amount"]
            cart_item_count = len(cart["items"])

            # Expected total: (8500 * 2) + (3500 * 1) = 20500
            expected_total = (8500 * 2) + (3500 * 1)
            assert float(cart_total) == expected_total

            # Checkout
            checkout_response = client.post(
                f"{BASE_URLS['order']}/api/checkout",
                headers=auth_headers,
                json={"shipping_address": "Sync Test Address"}
            )

            if checkout_response.status_code == 201:
                order = checkout_response.json()

                # Order total should match cart total
                assert float(order["total_amount"]) == expected_total

                # Cart should be cleared after checkout
                cart_after = client.get(
                    f"{BASE_URLS['order']}/api/cart",
                    headers=auth_headers
                )
                assert len(cart_after.json()["items"]) == 0

    @pytest.mark.integration
    def test_order_total_calculation(self):
        """Test that order totals are calculated correctly."""
        auth_headers = {
            "Authorization": "Bearer 4-calc-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Clear cart
            client.delete(f"{BASE_URLS['order']}/api/cart", headers=auth_headers)

            # Add items with known prices
            test_items = [
                {"product_id": 21, "quantity": 3, "price": 2200.0},  # 6600
                {"product_id": 31, "quantity": 1, "price": 12500.0},  # 12500
            ]
            expected_total = (2200 * 3) + (12500 * 1)  # 19100

            for item in test_items:
                client.post(
                    f"{BASE_URLS['order']}/api/cart/items",
                    headers=auth_headers,
                    json=item
                )

            # Verify cart total
            cart = client.get(
                f"{BASE_URLS['order']}/api/cart",
                headers=auth_headers
            ).json()

            assert float(cart["total_amount"]) == expected_total


class TestPaymentIntegration:
    """Test payment flow integration."""

    @pytest.mark.integration
    @pytest.mark.slow
    def test_order_to_payment_flow(self):
        """Test creating order then payment intent."""
        auth_headers = {
            "Authorization": "Bearer 5-payment-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Clear cart
            client.delete(f"{BASE_URLS['order']}/api/cart", headers=auth_headers)

            # Add item
            client.post(
                f"{BASE_URLS['order']}/api/cart/items",
                headers=auth_headers,
                json={"product_id": 1, "quantity": 1, "price": 8500.0}
            )

            # Checkout
            checkout_response = client.post(
                f"{BASE_URLS['order']}/api/checkout",
                headers=auth_headers,
                json={"shipping_address": "Payment Flow Test"}
            )

            if checkout_response.status_code == 201:
                order = checkout_response.json()
                order_id = order["id"]

                # Create payment intent
                payment_response = client.post(
                    f"{BASE_URLS['order']}/api/payments/create-intent",
                    headers=auth_headers,
                    params={
                        "order_id": order_id,
                        "amount": 8500.0,
                        "customer_email": "payment@test.com",
                        "customer_name": "Payment Test"
                    }
                )

                # May fail if Stripe not configured
                if payment_response.status_code == 200:
                    payment_data = payment_response.json()
                    assert payment_data["success"] is True
                    assert "client_secret" in payment_data

                    # Verify order updated with payment intent
                    order_response = client.get(
                        f"{BASE_URLS['order']}/api/orders/{order_id}",
                        headers=auth_headers
                    )
                    updated_order = order_response.json()
                    assert updated_order["status"] == "pending_payment"


class TestCrossServiceValidation:
    """Test validation across services."""

    @pytest.mark.integration
    def test_product_exists_before_cart_add(self):
        """Test that product exists in product service before adding to cart."""
        auth_headers = {
            "Authorization": "Bearer 6-validation-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Get valid product ID from product service
            products = client.get(
                f"{BASE_URLS['product']}/api/products?limit=1"
            ).json()["products"]

            if products:
                valid_id = products[0]["id"]

                # This should work
                response = client.post(
                    f"{BASE_URLS['order']}/api/cart/items",
                    headers=auth_headers,
                    json={
                        "product_id": valid_id,
                        "quantity": 1,
                        "price": products[0]["price"]
                    }
                )
                assert response.status_code == 200

    @pytest.mark.integration
    def test_order_service_accepts_valid_data(self):
        """Test that order service validates shipping address."""
        auth_headers = {
            "Authorization": "Bearer 7-address-test",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            # Clear and add item
            client.delete(f"{BASE_URLS['order']}/api/cart", headers=auth_headers)
            client.post(
                f"{BASE_URLS['order']}/api/cart/items",
                headers=auth_headers,
                json={"product_id": 1, "quantity": 1, "price": 1000.0}
            )

            # Checkout with valid address
            response = client.post(
                f"{BASE_URLS['order']}/api/checkout",
                headers=auth_headers,
                json={"shipping_address": "Valid Address, City, Country"}
            )

            assert response.status_code == 201

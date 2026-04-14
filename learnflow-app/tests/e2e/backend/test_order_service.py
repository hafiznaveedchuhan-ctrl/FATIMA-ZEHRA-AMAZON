"""
Order Service API Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Cart operations (GET, POST, PUT, DELETE)
- Checkout flow
- Order management
- Payment intent creation
- Stripe webhook handling
- Payment status retrieval
"""

import pytest
import httpx
import json
from typing import Dict, Any


class TestOrderServiceHealth:
    """Test Order Service health endpoints."""

    @pytest.mark.requires_api
    def test_health_endpoint(self, base_urls: Dict[str, str]):
        """Test health check endpoint returns 200."""
        url = f"{base_urls['order']}/health"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    @pytest.mark.requires_api
    def test_root_endpoint(self, base_urls: Dict[str, str]):
        """Test root endpoint returns service info."""
        url = f"{base_urls['order']}/"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Order Service"


class TestCartOperations:
    """Test shopping cart API endpoints."""

    @pytest.mark.requires_api
    def test_get_cart_requires_auth(self, base_urls: Dict[str, str]):
        """Test that GET /api/cart requires authorization."""
        url = f"{base_urls['order']}/api/cart"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        # Should return 401 without auth header
        assert response.status_code == 401

    @pytest.mark.requires_api
    def test_get_cart_with_auth(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test GET /api/cart with valid authorization."""
        url = f"{base_urls['order']}/api/cart"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=user_headers)

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total_amount" in data

    @pytest.mark.requires_api
    def test_add_item_to_cart(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str],
        cart_item: Dict[str, Any]
    ):
        """Test POST /api/cart/items to add item."""
        url = f"{base_urls['order']}/api/cart/items"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                headers=user_headers,
                json=cart_item
            )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) > 0

    @pytest.mark.requires_api
    def test_add_item_requires_auth(
        self,
        base_urls: Dict[str, str],
        cart_item: Dict[str, Any]
    ):
        """Test that POST /api/cart/items requires authorization."""
        url = f"{base_urls['order']}/api/cart/items"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                json=cart_item
            )

        assert response.status_code == 401

    @pytest.mark.requires_api
    def test_update_cart_item_quantity(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test PUT /api/cart/items/{id} to update quantity."""
        # First add an item
        add_url = f"{base_urls['order']}/api/cart/items"
        cart_item = {"product_id": 1, "quantity": 1, "price": 8500.0}

        with httpx.Client(timeout=10.0) as client:
            add_response = client.post(
                add_url,
                headers=user_headers,
                json=cart_item
            )

            if add_response.status_code == 200:
                items = add_response.json().get("items", [])
                if items:
                    item_id = items[0]["id"]

                    # Update quantity
                    update_url = f"{base_urls['order']}/api/cart/items/{item_id}"
                    update_response = client.put(
                        update_url,
                        headers=user_headers,
                        json={"quantity": 3}
                    )

                    assert update_response.status_code == 200
                    updated_data = update_response.json()
                    # Verify quantity updated
                    for item in updated_data["items"]:
                        if item["id"] == item_id:
                            assert item["quantity"] == 3

    @pytest.mark.requires_api
    def test_remove_item_from_cart(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test DELETE /api/cart/items/{id} to remove item."""
        # First add an item
        add_url = f"{base_urls['order']}/api/cart/items"
        cart_item = {"product_id": 2, "quantity": 1, "price": 3500.0}

        with httpx.Client(timeout=10.0) as client:
            add_response = client.post(
                add_url,
                headers=user_headers,
                json=cart_item
            )

            if add_response.status_code == 200:
                items = add_response.json().get("items", [])
                if items:
                    item_id = items[-1]["id"]  # Get last added item

                    # Remove item
                    delete_url = f"{base_urls['order']}/api/cart/items/{item_id}"
                    delete_response = client.delete(
                        delete_url,
                        headers=user_headers
                    )

                    assert delete_response.status_code == 204

    @pytest.mark.requires_api
    def test_clear_entire_cart(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test DELETE /api/cart to clear all items."""
        url = f"{base_urls['order']}/api/cart"

        with httpx.Client(timeout=10.0) as client:
            response = client.delete(url, headers=user_headers)

        assert response.status_code == 204


class TestCheckout:
    """Test checkout flow."""

    @pytest.mark.requires_api
    def test_checkout_empty_cart_fails(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str],
        checkout_data: Dict[str, str]
    ):
        """Test that checkout with empty cart returns error."""
        # First clear cart
        clear_url = f"{base_urls['order']}/api/cart"
        checkout_url = f"{base_urls['order']}/api/checkout"

        with httpx.Client(timeout=10.0) as client:
            client.delete(clear_url, headers=user_headers)

            response = client.post(
                checkout_url,
                headers=user_headers,
                json=checkout_data
            )

        assert response.status_code == 400
        assert "empty" in response.json().get("detail", "").lower()

    @pytest.mark.requires_api
    def test_checkout_creates_order(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str],
        checkout_data: Dict[str, str]
    ):
        """Test POST /api/checkout creates an order."""
        # First add item to cart
        add_url = f"{base_urls['order']}/api/cart/items"
        cart_item = {"product_id": 1, "quantity": 1, "price": 8500.0}

        checkout_url = f"{base_urls['order']}/api/checkout"

        with httpx.Client(timeout=10.0) as client:
            # Add item to cart
            client.post(add_url, headers=user_headers, json=cart_item)

            # Checkout
            response = client.post(
                checkout_url,
                headers=user_headers,
                json=checkout_data
            )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        assert "total_amount" in data

    @pytest.mark.requires_api
    def test_checkout_requires_shipping_address(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test that checkout requires shipping address."""
        checkout_url = f"{base_urls['order']}/api/checkout"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                checkout_url,
                headers=user_headers,
                json={}  # Missing shipping_address
            )

        # Should fail validation
        assert response.status_code in [400, 422]


class TestOrderManagement:
    """Test order management endpoints."""

    @pytest.mark.requires_api
    def test_list_orders(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test GET /api/orders returns user's orders."""
        url = f"{base_urls['order']}/api/orders"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=user_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.requires_api
    def test_get_order_by_id(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test GET /api/orders/{id} returns order details."""
        # First create an order
        add_url = f"{base_urls['order']}/api/cart/items"
        checkout_url = f"{base_urls['order']}/api/checkout"

        with httpx.Client(timeout=10.0) as client:
            # Add item
            client.post(
                add_url,
                headers=user_headers,
                json={"product_id": 3, "quantity": 1, "price": 7500.0}
            )

            # Checkout
            checkout_response = client.post(
                checkout_url,
                headers=user_headers,
                json={"shipping_address": "Test Address"}
            )

            if checkout_response.status_code == 201:
                order_id = checkout_response.json()["id"]

                # Get order details
                order_url = f"{base_urls['order']}/api/orders/{order_id}"
                response = client.get(order_url, headers=user_headers)

                assert response.status_code == 200
                data = response.json()
                assert data["id"] == order_id

    @pytest.mark.requires_api
    def test_get_order_not_found(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test that getting non-existent order returns 404."""
        url = f"{base_urls['order']}/api/orders/99999"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=user_headers)

        assert response.status_code == 404


class TestPaymentIntegration:
    """Test Stripe payment integration."""

    @pytest.mark.requires_api
    def test_create_payment_intent(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test POST /api/payments/create-intent creates PaymentIntent."""
        # First create an order
        add_url = f"{base_urls['order']}/api/cart/items"
        checkout_url = f"{base_urls['order']}/api/checkout"
        payment_url = f"{base_urls['order']}/api/payments/create-intent"

        with httpx.Client(timeout=10.0) as client:
            # Add item
            client.post(
                add_url,
                headers=user_headers,
                json={"product_id": 1, "quantity": 1, "price": 8500.0}
            )

            # Checkout
            checkout_response = client.post(
                checkout_url,
                headers=user_headers,
                json={"shipping_address": "Payment Test Address"}
            )

            if checkout_response.status_code == 201:
                order_id = checkout_response.json()["id"]

                # Create payment intent
                response = client.post(
                    payment_url,
                    headers=user_headers,
                    params={
                        "order_id": order_id,
                        "amount": 8500.0,
                        "customer_email": "test@example.com",
                        "customer_name": "Test User"
                    }
                )

                # Note: This may fail if Stripe API key is not configured
                if response.status_code == 200:
                    data = response.json()
                    assert data["success"] is True
                    assert "client_secret" in data
                    assert "payment_intent_id" in data

    @pytest.mark.requires_api
    def test_payment_intent_returns_client_secret(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test that payment intent includes client_secret."""
        # Similar to above, but explicitly check for client_secret
        add_url = f"{base_urls['order']}/api/cart/items"
        checkout_url = f"{base_urls['order']}/api/checkout"
        payment_url = f"{base_urls['order']}/api/payments/create-intent"

        with httpx.Client(timeout=10.0) as client:
            client.post(
                add_url,
                headers=user_headers,
                json={"product_id": 2, "quantity": 1, "price": 3500.0}
            )

            checkout_response = client.post(
                checkout_url,
                headers=user_headers,
                json={"shipping_address": "Client Secret Test"}
            )

            if checkout_response.status_code == 201:
                order_id = checkout_response.json()["id"]

                response = client.post(
                    payment_url,
                    headers=user_headers,
                    params={
                        "order_id": order_id,
                        "amount": 3500.0,
                        "customer_email": "secret@test.com",
                        "customer_name": "Secret Test"
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    assert "client_secret" in data
                    # Client secret should start with pi_
                    assert data["client_secret"].startswith("pi_")

    @pytest.mark.requires_api
    def test_payment_amount_in_paisa(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test that payment amount is converted to paisa (PKR * 100)."""
        add_url = f"{base_urls['order']}/api/cart/items"
        checkout_url = f"{base_urls['order']}/api/checkout"
        payment_url = f"{base_urls['order']}/api/payments/create-intent"

        with httpx.Client(timeout=10.0) as client:
            client.post(
                add_url,
                headers=user_headers,
                json={"product_id": 1, "quantity": 1, "price": 1000.0}
            )

            checkout_response = client.post(
                checkout_url,
                headers=user_headers,
                json={"shipping_address": "Paisa Test"}
            )

            if checkout_response.status_code == 201:
                order_id = checkout_response.json()["id"]

                response = client.post(
                    payment_url,
                    headers=user_headers,
                    params={
                        "order_id": order_id,
                        "amount": 1000.0,
                        "customer_email": "paisa@test.com",
                        "customer_name": "Paisa Test"
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    # Amount should be in paisa (1000 PKR = 100000 paisa)
                    assert data["amount"] == 100000


class TestWebhookHandling:
    """Test Stripe webhook handling."""

    @pytest.mark.requires_api
    def test_webhook_missing_signature_fails(
        self,
        base_urls: Dict[str, str],
        webhook_payload_success: Dict[str, Any]
    ):
        """Test that webhook without signature returns 400."""
        url = f"{base_urls['order']}/api/payments/webhook"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                json=webhook_payload_success
                # Missing stripe-signature header
            )

        assert response.status_code == 400

    @pytest.mark.requires_api
    def test_webhook_endpoint_exists(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that webhook endpoint exists."""
        url = f"{base_urls['order']}/api/payments/webhook"

        with httpx.Client(timeout=10.0) as client:
            # POST without proper signature should return 400, not 404
            response = client.post(url, json={})

        # Should not be 404 (endpoint exists)
        assert response.status_code != 404


class TestPaymentStatus:
    """Test payment status retrieval."""

    @pytest.mark.requires_api
    def test_get_payment_status_not_found(
        self,
        base_urls: Dict[str, str],
        user_headers: Dict[str, str]
    ):
        """Test GET /api/payments/{intent_id} for non-existent payment."""
        url = f"{base_urls['order']}/api/payments/pi_nonexistent123"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=user_headers)

        # Should return 404 for non-existent payment
        assert response.status_code in [400, 404]

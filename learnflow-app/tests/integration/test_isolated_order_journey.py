"""
Isolated Order Service Integration Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests the complete cart-to-order journey using TestClient.
Separated from user-service tests to avoid 'app' module namespace collision.
"""

import os
import sys
import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock

os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder-key-for-unit-tests"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder_for_unit_tests"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_secret"

BACKEND_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend")

from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

# Import order service
ORDER_SVC_PATH = os.path.join(BACKEND_BASE, "order-service")
sys.path.insert(0, ORDER_SVC_PATH)

from app.main import app as order_app
from app.database import get_session as order_get_session


# ---------------------------------------------------------------------------
# Order Service: Cart -> Checkout -> Order Journey
# ---------------------------------------------------------------------------

class TestOrderJourneyIsolated:
    """Full cart to order journey using isolated TestClient."""

    @pytest.fixture
    def order_client(self):
        """Create isolated order service TestClient."""
        engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        SQLModel.metadata.create_all(engine)

        def override():
            with Session(engine) as session:
                yield session

        order_app.dependency_overrides[order_get_session] = override
        client = TestClient(order_app)
        yield client
        order_app.dependency_overrides.clear()

    @pytest.mark.integration
    def test_full_cart_checkout_order_journey(self, order_client):
        """Test: empty cart -> add items -> update quantity -> checkout -> verify order."""
        h = {"Authorization": "Bearer 1-journey", "Content-Type": "application/json"}

        # 1. Empty cart
        cart = order_client.get("/api/cart", headers=h)
        assert cart.status_code == 200
        assert cart.json()["items"] == []

        # 2. Add first product
        r1 = order_client.post("/api/cart/items", headers=h,
                                json={"product_id": 1, "quantity": 1, "price": 8500.0})
        assert r1.status_code == 200
        assert len(r1.json()["items"]) == 1

        # 3. Add second product
        r2 = order_client.post("/api/cart/items", headers=h,
                                json={"product_id": 11, "quantity": 2, "price": 3500.0})
        assert r2.status_code == 200
        assert len(r2.json()["items"]) == 2

        # 4. Verify totals
        cart = order_client.get("/api/cart", headers=h).json()
        assert float(cart["total_amount"]) == 8500.0 + (3500.0 * 2)  # 15500
        assert cart["item_count"] == 2

        # 5. Update quantity of first item
        item_id = cart["items"][0]["id"]
        upd = order_client.put(f"/api/cart/items/{item_id}", headers=h,
                                json={"quantity": 3})
        assert upd.status_code == 200

        # 6. Checkout
        checkout = order_client.post("/api/checkout", headers=h,
                                      json={"shipping_address": "Integration Street, Karachi"})
        assert checkout.status_code == 201
        order = checkout.json()
        assert order["status"] == "pending"
        assert len(order["items"]) == 2

        # 7. Cart empty after checkout
        empty_cart = order_client.get("/api/cart", headers=h).json()
        assert len(empty_cart["items"]) == 0

        # 8. Order appears in list
        orders = order_client.get("/api/orders", headers=h).json()
        assert len(orders) >= 1
        assert any(o["id"] == order["id"] for o in orders)

        # 9. Get order detail
        detail = order_client.get(f"/api/orders/{order['id']}", headers=h).json()
        assert detail["shipping_address"] == "Integration Street, Karachi"

    @pytest.mark.integration
    def test_empty_cart_checkout_blocked(self, order_client):
        """Test that checkout is blocked when cart is empty."""
        h = {"Authorization": "Bearer 1-empty", "Content-Type": "application/json"}
        order_client.delete("/api/cart", headers=h)
        r = order_client.post("/api/checkout", headers=h,
                               json={"shipping_address": "Should Fail Street"})
        assert r.status_code == 400

    @pytest.mark.integration
    def test_cart_user_isolation(self, order_client):
        """Test that carts are isolated between users."""
        h1 = {"Authorization": "Bearer 1-iso", "Content-Type": "application/json"}
        h2 = {"Authorization": "Bearer 2-iso", "Content-Type": "application/json"}

        # User 1 adds item
        order_client.post("/api/cart/items", headers=h1,
                           json={"product_id": 1, "quantity": 1, "price": 1000.0})

        # User 2 cart should be empty
        cart2 = order_client.get("/api/cart", headers=h2).json()
        assert len(cart2["items"]) == 0

    @pytest.mark.integration
    def test_add_same_product_increases_quantity(self, order_client):
        """Test that adding the same product increases quantity."""
        h = {"Authorization": "Bearer 1-dup", "Content-Type": "application/json"}
        item = {"product_id": 5, "quantity": 1, "price": 5000.0}

        order_client.post("/api/cart/items", headers=h, json=item)
        r2 = order_client.post("/api/cart/items", headers=h, json=item)

        assert r2.status_code == 200
        data = r2.json()
        product_items = [i for i in data["items"] if i["product_id"] == 5]
        assert len(product_items) == 1
        assert product_items[0]["quantity"] == 2

    @pytest.mark.integration
    def test_checkout_clears_cart(self, order_client):
        """Test that checkout clears the cart."""
        h = {"Authorization": "Bearer 1-clear", "Content-Type": "application/json"}

        # Add item and checkout
        order_client.post("/api/cart/items", headers=h,
                           json={"product_id": 1, "quantity": 1, "price": 1000.0})
        order_client.post("/api/checkout", headers=h,
                           json={"shipping_address": "Clear Cart St"})

        # Cart should be empty
        cart = order_client.get("/api/cart", headers=h).json()
        assert len(cart["items"]) == 0

    @pytest.mark.integration
    def test_order_contains_correct_items(self, order_client):
        """Test that order items match what was in the cart."""
        h = {"Authorization": "Bearer 1-items", "Content-Type": "application/json"}

        order_client.post("/api/cart/items", headers=h,
                           json={"product_id": 10, "quantity": 3, "price": 2500.0})
        order_client.post("/api/cart/items", headers=h,
                           json={"product_id": 20, "quantity": 1, "price": 7500.0})

        checkout = order_client.post("/api/checkout", headers=h,
                                      json={"shipping_address": "Item Match St"})
        assert checkout.status_code == 201
        items = checkout.json()["items"]
        assert len(items) == 2

        product_ids = {i["product_id"] for i in items}
        assert 10 in product_ids
        assert 20 in product_ids

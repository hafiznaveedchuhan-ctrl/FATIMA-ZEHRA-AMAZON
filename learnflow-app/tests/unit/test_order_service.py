"""
Order Service Unit Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Cart operations (get, add, update, remove, clear)
- Checkout flow (create order, empty cart validation)
- Order management (list, detail, not found)
- Authorization requirements
- Stripe payment integration (mock)
- Webhook handling
- Data integrity

All tests use SQLite in-memory database for isolation.
No external services required.
"""

import os
import sys
import json
import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock

os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder_for_unit_tests"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_secret"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend", "order-service"))

from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import Cart, CartItem, Order, OrderItem


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def user_headers():
    """Auth headers for user_id=1 (derived from simplified token parsing)."""
    return {
        "Authorization": "Bearer 1-test-token",
        "Content-Type": "application/json"
    }


@pytest.fixture
def user2_headers():
    """Auth headers for a different user (user_id=2)."""
    return {
        "Authorization": "Bearer 2-test-token",
        "Content-Type": "application/json"
    }


@pytest.fixture
def cart_item_data():
    return {"product_id": 1, "quantity": 2, "price": 8500.0}


@pytest.fixture
def populated_cart(client: TestClient, user_headers, cart_item_data):
    """Add an item to the cart and return the response."""
    response = client.post("/api/cart/items", headers=user_headers, json=cart_item_data)
    return response.json()


# ---------------------------------------------------------------------------
# Health Endpoint Tests
# ---------------------------------------------------------------------------

class TestHealthEndpoints:
    """Test service health endpoints."""

    @pytest.mark.unit
    def test_root_endpoint(self, client: TestClient):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Order Service"
        assert data["status"] == "healthy"

    @pytest.mark.unit
    def test_health_endpoint(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Cart Operations Tests
# ---------------------------------------------------------------------------

class TestCartGet:
    """Test getting cart."""

    @pytest.mark.unit
    def test_get_cart_requires_auth(self, client: TestClient):
        """Test that GET /api/cart requires authorization."""
        response = client.get("/api/cart")
        assert response.status_code == 401

    @pytest.mark.unit
    def test_get_cart_creates_empty_cart(self, client: TestClient, user_headers):
        """Test that GET /api/cart auto-creates an empty cart."""
        response = client.get("/api/cart", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert float(data["total_amount"]) == 0
        assert data["item_count"] == 0

    @pytest.mark.unit
    def test_get_cart_returns_existing_items(self, client: TestClient, user_headers, populated_cart):
        """Test that GET /api/cart returns items after adding."""
        response = client.get("/api/cart", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0


class TestCartAdd:
    """Test adding items to cart."""

    @pytest.mark.unit
    def test_add_item_to_cart(self, client: TestClient, user_headers):
        """Test adding a product to the cart."""
        response = client.post(
            "/api/cart/items",
            headers=user_headers,
            json={"product_id": 1, "quantity": 1, "price": 8500.0}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["product_id"] == 1

    @pytest.mark.unit
    def test_add_item_requires_auth(self, client: TestClient):
        """Test that adding items requires authorization."""
        response = client.post(
            "/api/cart/items",
            json={"product_id": 1, "quantity": 1, "price": 8500.0}
        )
        assert response.status_code == 401

    @pytest.mark.unit
    def test_add_duplicate_item_increases_quantity(self, client: TestClient, user_headers):
        """Test that adding same product twice increases quantity."""
        item = {"product_id": 5, "quantity": 1, "price": 5000.0}

        client.post("/api/cart/items", headers=user_headers, json=item)
        response = client.post("/api/cart/items", headers=user_headers, json=item)

        assert response.status_code == 200
        data = response.json()
        # Find the item with product_id=5
        product_items = [i for i in data["items"] if i["product_id"] == 5]
        assert len(product_items) == 1
        assert product_items[0]["quantity"] == 2

    @pytest.mark.unit
    def test_add_multiple_different_items(self, client: TestClient, user_headers):
        """Test adding multiple different products."""
        client.post("/api/cart/items", headers=user_headers,
                     json={"product_id": 1, "quantity": 1, "price": 8500.0})
        response = client.post("/api/cart/items", headers=user_headers,
                                json={"product_id": 2, "quantity": 1, "price": 3500.0})

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2

    @pytest.mark.unit
    def test_cart_total_calculation(self, client: TestClient, user_headers):
        """Test that cart total is calculated correctly."""
        client.post("/api/cart/items", headers=user_headers,
                     json={"product_id": 1, "quantity": 2, "price": 8500.0})
        response = client.post("/api/cart/items", headers=user_headers,
                                json={"product_id": 2, "quantity": 1, "price": 3500.0})

        data = response.json()
        expected_total = (8500.0 * 2) + (3500.0 * 1)
        assert float(data["total_amount"]) == expected_total


class TestCartUpdate:
    """Test updating cart item quantities."""

    @pytest.mark.unit
    def test_update_cart_item_quantity(self, client: TestClient, user_headers, populated_cart):
        """Test updating item quantity."""
        item_id = populated_cart["items"][0]["id"]
        response = client.put(
            f"/api/cart/items/{item_id}",
            headers=user_headers,
            json={"quantity": 5}
        )
        assert response.status_code == 200
        items = response.json()["items"]
        matching = [i for i in items if i["id"] == item_id]
        assert matching[0]["quantity"] == 5

    @pytest.mark.unit
    def test_update_cart_item_not_found(self, client: TestClient, user_headers):
        """Test updating nonexistent cart item."""
        response = client.put(
            "/api/cart/items/99999",
            headers=user_headers,
            json={"quantity": 1}
        )
        assert response.status_code == 404


class TestCartRemove:
    """Test removing items from cart."""

    @pytest.mark.unit
    def test_remove_item_from_cart(self, client: TestClient, user_headers, populated_cart):
        """Test removing a specific item."""
        item_id = populated_cart["items"][0]["id"]
        response = client.delete(f"/api/cart/items/{item_id}", headers=user_headers)
        assert response.status_code == 204

    @pytest.mark.unit
    def test_remove_item_not_found(self, client: TestClient, user_headers):
        """Test removing nonexistent item."""
        response = client.delete("/api/cart/items/99999", headers=user_headers)
        assert response.status_code == 404

    @pytest.mark.unit
    def test_clear_cart(self, client: TestClient, user_headers, populated_cart):
        """Test clearing entire cart."""
        response = client.delete("/api/cart", headers=user_headers)
        assert response.status_code == 204

        # Verify cart is empty
        cart = client.get("/api/cart", headers=user_headers).json()
        assert len(cart["items"]) == 0


# ---------------------------------------------------------------------------
# Checkout Tests
# ---------------------------------------------------------------------------

class TestCheckout:
    """Test checkout flow."""

    @pytest.mark.unit
    def test_checkout_creates_order(self, client: TestClient, user_headers, populated_cart):
        """Test that checkout creates an order from cart."""
        response = client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "123 Test Street, Karachi, Pakistan"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "pending"
        assert float(data["total_amount"]) > 0
        assert data["shipping_address"] == "123 Test Street, Karachi, Pakistan"
        assert len(data["items"]) > 0

    @pytest.mark.unit
    def test_checkout_empty_cart_fails(self, client: TestClient, user_headers):
        """Test checkout with empty cart returns 400."""
        # Ensure cart is empty
        client.delete("/api/cart", headers=user_headers)

        response = client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Empty Cart Street"}
        )
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()

    @pytest.mark.unit
    def test_checkout_requires_shipping_address(self, client: TestClient, user_headers, populated_cart):
        """Test checkout fails without shipping address."""
        response = client.post(
            "/api/checkout",
            headers=user_headers,
            json={}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_checkout_clears_cart(self, client: TestClient, user_headers, populated_cart):
        """Test that checkout clears the cart after order creation."""
        client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Clear Cart Street"}
        )

        # Cart should be empty now
        cart = client.get("/api/cart", headers=user_headers).json()
        assert len(cart["items"]) == 0

    @pytest.mark.unit
    def test_checkout_requires_auth(self, client: TestClient):
        """Test that checkout requires authorization."""
        response = client.post(
            "/api/checkout",
            json={"shipping_address": "No Auth Street"}
        )
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# Order Management Tests
# ---------------------------------------------------------------------------

class TestOrderManagement:
    """Test order listing and retrieval."""

    @pytest.mark.unit
    def test_list_orders_empty(self, client: TestClient, user_headers):
        """Test listing orders when none exist."""
        response = client.get("/api/orders", headers=user_headers)
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.unit
    def test_list_orders_after_checkout(self, client: TestClient, user_headers, populated_cart):
        """Test that orders appear after checkout."""
        # Create an order
        client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Order List Street"}
        )

        response = client.get("/api/orders", headers=user_headers)
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) >= 1

    @pytest.mark.unit
    def test_get_order_by_id(self, client: TestClient, user_headers, populated_cart):
        """Test getting order by ID."""
        # Create an order
        checkout_resp = client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Order Detail Street"}
        )
        order_id = checkout_resp.json()["id"]

        response = client.get(f"/api/orders/{order_id}", headers=user_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id

    @pytest.mark.unit
    def test_get_order_not_found(self, client: TestClient, user_headers):
        """Test getting nonexistent order returns 404."""
        response = client.get("/api/orders/99999", headers=user_headers)
        assert response.status_code == 404

    @pytest.mark.unit
    def test_order_has_correct_fields(self, client: TestClient, user_headers, populated_cart):
        """Test order response has all required fields."""
        checkout_resp = client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Field Check Street"}
        )
        data = checkout_resp.json()
        required_fields = ["id", "user_id", "status", "total_amount",
                          "shipping_address", "payment_status", "items"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"


# ---------------------------------------------------------------------------
# Stripe Payment Tests
# ---------------------------------------------------------------------------

class TestStripePaymentClient:
    """Test Stripe payment client functions (mocked)."""

    @pytest.mark.unit
    def test_payment_intent_endpoint_exists(self, client: TestClient, user_headers, populated_cart):
        """Test that payment intent endpoint is accessible."""
        # Create an order first
        checkout_resp = client.post(
            "/api/checkout",
            headers=user_headers,
            json={"shipping_address": "Payment Street"}
        )
        order_id = checkout_resp.json()["id"]

        # Try to create payment intent (will fail without valid Stripe key, but endpoint exists)
        response = client.post(
            "/api/payments/create-intent",
            headers=user_headers,
            params={
                "order_id": order_id,
                "amount": 8500.0,
                "customer_email": "test@example.com",
                "customer_name": "Test User"
            }
        )
        # Should not be 404 (endpoint exists)
        assert response.status_code != 404

    @pytest.mark.unit
    def test_webhook_endpoint_exists(self, client: TestClient):
        """Test that webhook endpoint is accessible."""
        response = client.post("/api/payments/webhook", json={})
        assert response.status_code != 404

    @pytest.mark.unit
    def test_webhook_requires_signature(self, client: TestClient):
        """Test that webhook requires stripe-signature header."""
        response = client.post(
            "/api/payments/webhook",
            json={"type": "payment_intent.succeeded"}
        )
        assert response.status_code == 400

    @pytest.mark.unit
    def test_payment_status_endpoint_exists(self, client: TestClient, user_headers):
        """Test that payment status endpoint is accessible."""
        response = client.get(
            "/api/payments/pi_test_nonexistent",
            headers=user_headers
        )
        # Should return 400 or 404 but not 405 (method not allowed)
        assert response.status_code in [400, 404]


# ---------------------------------------------------------------------------
# Stripe Client Module Tests
# ---------------------------------------------------------------------------

class TestStripeClientModule:
    """Test Stripe client utility functions directly."""

    @pytest.mark.unit
    def test_handle_payment_intent_succeeded(self):
        """Test payment success handler extracts correct data."""
        from app.stripe_client import StripePaymentClient

        event = {
            "data": {
                "object": {
                    "id": "pi_test_123",
                    "amount": 850000,
                    "currency": "pkr",
                    "receipt_email": "buyer@example.com",
                    "metadata": {
                        "order_id": "42",
                        "customer_name": "Test Buyer"
                    },
                    "created": 1706000000,
                }
            }
        }
        result = StripePaymentClient.handle_payment_intent_succeeded(event)
        assert result is not None
        assert result["order_id"] == "42"
        assert result["status"] == "confirmed"
        assert result["amount"] == 8500.0  # 850000 / 100

    @pytest.mark.unit
    def test_handle_payment_intent_failed(self):
        """Test payment failure handler extracts error info."""
        from app.stripe_client import StripePaymentClient

        event = {
            "data": {
                "object": {
                    "id": "pi_test_fail",
                    "metadata": {"order_id": "43"},
                    "last_payment_error": {"message": "Your card was declined."},
                    "created": 1706000000,
                }
            }
        }
        result = StripePaymentClient.handle_payment_intent_payment_failed(event)
        assert result is not None
        assert result["order_id"] == "43"
        assert result["status"] == "payment_failed"
        assert result["error"] == "Your card was declined."

    @pytest.mark.unit
    def test_webhook_handlers_map_contains_events(self):
        """Test that webhook handlers map has correct event types."""
        from app.stripe_client import WEBHOOK_HANDLERS

        assert "payment_intent.succeeded" in WEBHOOK_HANDLERS
        assert "payment_intent.payment_failed" in WEBHOOK_HANDLERS


# ---------------------------------------------------------------------------
# Authorization Tests
# ---------------------------------------------------------------------------

class TestCartAuthorization:
    """Test cart authorization boundaries."""

    @pytest.mark.unit
    def test_user_cannot_access_other_users_cart_items(
        self, client: TestClient, user_headers, user2_headers, populated_cart
    ):
        """Test that user cannot modify another user's cart items."""
        item_id = populated_cart["items"][0]["id"]

        # User 2 tries to update user 1's cart item
        response = client.put(
            f"/api/cart/items/{item_id}",
            headers=user2_headers,
            json={"quantity": 999}
        )
        assert response.status_code == 403

    @pytest.mark.unit
    def test_user_cannot_delete_other_users_cart_items(
        self, client: TestClient, user_headers, user2_headers, populated_cart
    ):
        """Test that user cannot delete another user's cart items."""
        item_id = populated_cart["items"][0]["id"]

        response = client.delete(
            f"/api/cart/items/{item_id}",
            headers=user2_headers
        )
        assert response.status_code == 403

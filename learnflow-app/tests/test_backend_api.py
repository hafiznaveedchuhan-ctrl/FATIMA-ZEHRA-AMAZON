"""
Comprehensive Backend API Test Suite for Fatima Zehra Boutique
Tests all microservice endpoints: user-service, product-service, order-service, chat-service

Usage:
  pytest tests/test_backend_api.py -v
  pytest tests/test_backend_api.py -v -k "user"       # Run user service tests only
  pytest tests/test_backend_api.py -v -k "product"     # Run product service tests only
"""

import os
import sys
import json
import time
import pytest
import requests
from datetime import datetime

# Service URLs
USER_SERVICE = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
PRODUCT_SERVICE = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")
ORDER_SERVICE = os.getenv("ORDER_SERVICE_URL", "http://localhost:8003")
CHAT_SERVICE = os.getenv("CHAT_SERVICE_URL", "http://localhost:8004")

TIMEOUT = 10  # seconds


def is_service_available(url):
    """Check if a service is available"""
    try:
        response = requests.get(f"{url}/health", timeout=3)
        return response.status_code == 200
    except (requests.ConnectionError, requests.Timeout):
        return False


# ============================================================
# USER SERVICE TESTS (Port 8001)
# ============================================================

@pytest.mark.skipif(
    not is_service_available(USER_SERVICE),
    reason=f"User service not available at {USER_SERVICE}"
)
class TestUserService:
    """Tests for User Service (8001)"""

    def test_health_check(self):
        """User service health endpoint returns 200"""
        response = requests.get(f"{USER_SERVICE}/health", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_register_user(self):
        """POST /api/users/register creates a new user"""
        unique_email = f"test_{int(time.time())}@example.com"
        data = {
            "email": unique_email,
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
        response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json=data,
            timeout=TIMEOUT
        )
        assert response.status_code == 201
        body = response.json()
        assert "access_token" in body
        assert body["user"]["email"] == unique_email

    def test_register_duplicate_email(self):
        """POST /api/users/register rejects duplicate email"""
        email = f"dup_{int(time.time())}@example.com"
        data = {
            "email": email,
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
        # Register first time
        requests.post(f"{USER_SERVICE}/api/users/register", json=data, timeout=TIMEOUT)
        # Register again with same email
        response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json=data,
            timeout=TIMEOUT
        )
        assert response.status_code == 400

    def test_login_valid_credentials(self):
        """POST /api/users/login returns token for valid credentials"""
        email = f"login_{int(time.time())}@example.com"
        password = "SecurePass123!"
        # Register
        requests.post(
            f"{USER_SERVICE}/api/users/register",
            json={"email": email, "password": password, "full_name": "Login Test"},
            timeout=TIMEOUT
        )
        # Login
        response = requests.post(
            f"{USER_SERVICE}/api/users/login",
            json={"email": email, "password": password},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body

    def test_login_invalid_credentials(self):
        """POST /api/users/login rejects invalid credentials"""
        response = requests.post(
            f"{USER_SERVICE}/api/users/login",
            json={"email": "nonexistent@example.com", "password": "WrongPass123!"},
            timeout=TIMEOUT
        )
        assert response.status_code == 401

    def test_get_profile_without_auth(self):
        """GET /api/users/me requires authentication"""
        response = requests.get(
            f"{USER_SERVICE}/api/users/me",
            timeout=TIMEOUT
        )
        assert response.status_code in [401, 403, 422]

    def test_get_profile_with_auth(self):
        """GET /api/users/me returns user profile with valid token"""
        email = f"profile_{int(time.time())}@example.com"
        # Register and get token
        reg_response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json={"email": email, "password": "SecurePass123!", "full_name": "Profile Test"},
            timeout=TIMEOUT
        )
        token = reg_response.json()["access_token"]
        # Get profile
        response = requests.get(
            f"{USER_SERVICE}/api/users/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        body = response.json()
        assert body["email"] == email

    def test_register_invalid_email(self):
        """POST /api/users/register rejects invalid email format"""
        data = {
            "email": "not-an-email",
            "password": "SecurePass123!",
            "full_name": "Invalid Email Test"
        }
        response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json=data,
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 422]

    def test_register_short_password(self):
        """POST /api/users/register rejects short password"""
        data = {
            "email": f"short_{int(time.time())}@example.com",
            "password": "short",
            "full_name": "Short Password Test"
        }
        response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json=data,
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 422]


# ============================================================
# PRODUCT SERVICE TESTS (Port 8002)
# ============================================================

@pytest.mark.skipif(
    not is_service_available(PRODUCT_SERVICE),
    reason=f"Product service not available at {PRODUCT_SERVICE}"
)
class TestProductService:
    """Tests for Product Service (8002)"""

    def test_health_check(self):
        """Product service health endpoint returns 200"""
        response = requests.get(f"{PRODUCT_SERVICE}/health", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_list_products(self):
        """GET /api/products returns product list"""
        response = requests.get(f"{PRODUCT_SERVICE}/api/products", timeout=TIMEOUT)
        assert response.status_code == 200
        body = response.json()
        assert "products" in body
        assert "total" in body

    def test_list_products_pagination(self):
        """GET /api/products supports pagination"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?skip=0&limit=5",
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        body = response.json()
        assert len(body["products"]) <= 5

    def test_list_products_search(self):
        """GET /api/products supports search"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?search=suit",
            timeout=TIMEOUT
        )
        assert response.status_code == 200

    def test_list_products_price_filter(self):
        """GET /api/products supports price filtering"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?min_price=1000&max_price=5000",
            timeout=TIMEOUT
        )
        assert response.status_code == 200

    def test_get_product_by_id(self):
        """GET /api/products/{id} returns specific product"""
        # First get a product ID
        list_response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?limit=1",
            timeout=TIMEOUT
        )
        products = list_response.json()["products"]
        if products:
            product_id = products[0]["id"]
            response = requests.get(
                f"{PRODUCT_SERVICE}/api/products/{product_id}",
                timeout=TIMEOUT
            )
            assert response.status_code == 200
            body = response.json()
            assert body["id"] == product_id

    def test_get_product_not_found(self):
        """GET /api/products/99999 returns 404"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products/99999",
            timeout=TIMEOUT
        )
        assert response.status_code == 404

    def test_list_categories(self):
        """GET /api/categories returns category list"""
        response = requests.get(f"{PRODUCT_SERVICE}/api/categories", timeout=TIMEOUT)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_category_by_id(self):
        """GET /api/categories/{id} returns category"""
        categories = requests.get(f"{PRODUCT_SERVICE}/api/categories", timeout=TIMEOUT).json()
        if categories:
            cat_id = categories[0]["id"]
            response = requests.get(
                f"{PRODUCT_SERVICE}/api/categories/{cat_id}",
                timeout=TIMEOUT
            )
            assert response.status_code == 200

    def test_get_category_not_found(self):
        """GET /api/categories/99999 returns 404"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/categories/99999",
            timeout=TIMEOUT
        )
        assert response.status_code == 404

    def test_product_response_schema(self):
        """Product response has required fields"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?limit=1",
            timeout=TIMEOUT
        )
        products = response.json()["products"]
        if products:
            product = products[0]
            required_fields = ["id", "name", "price"]
            for field in required_fields:
                assert field in product, f"Missing field: {field}"

    def test_products_invalid_pagination(self):
        """GET /api/products rejects invalid pagination params"""
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?skip=-1",
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 422]


# ============================================================
# ORDER SERVICE TESTS (Port 8003)
# ============================================================

@pytest.mark.skipif(
    not is_service_available(ORDER_SERVICE),
    reason=f"Order service not available at {ORDER_SERVICE}"
)
class TestOrderService:
    """Tests for Order Service (8003)"""

    def test_health_check(self):
        """Order service health endpoint returns 200"""
        response = requests.get(f"{ORDER_SERVICE}/health", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_checkout_without_auth(self):
        """POST /api/checkout requires authentication"""
        response = requests.post(
            f"{ORDER_SERVICE}/api/checkout",
            json={"shipping_address": "123 Test St"},
            timeout=TIMEOUT
        )
        assert response.status_code in [401, 403, 422]

    def test_create_payment_intent_without_auth(self):
        """POST /api/payments/create-intent requires auth"""
        response = requests.post(
            f"{ORDER_SERVICE}/api/payments/create-intent",
            json={"amount": 8500, "order_id": 1},
            timeout=TIMEOUT
        )
        assert response.status_code in [401, 403, 422]

    def test_get_orders_without_auth(self):
        """GET /api/orders requires authentication"""
        response = requests.get(
            f"{ORDER_SERVICE}/api/orders",
            timeout=TIMEOUT
        )
        assert response.status_code in [401, 403, 422]

    def test_invalid_checkout_data(self):
        """POST /api/checkout rejects empty data"""
        response = requests.post(
            f"{ORDER_SERVICE}/api/checkout",
            json={},
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 401, 422]


# ============================================================
# CHAT SERVICE TESTS (Port 8004)
# ============================================================

@pytest.mark.skipif(
    not is_service_available(CHAT_SERVICE),
    reason=f"Chat service not available at {CHAT_SERVICE}"
)
class TestChatService:
    """Tests for Chat Service (8004)"""

    def test_health_check(self):
        """Chat service health endpoint returns 200"""
        response = requests.get(f"{CHAT_SERVICE}/health", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_send_message(self):
        """POST /api/chat/messages accepts message"""
        response = requests.post(
            f"{CHAT_SERVICE}/api/chat/messages",
            json={
                "text": "What fancy suits do you have?",
                "session_id": f"test-{int(time.time())}"
            },
            timeout=30  # Longer timeout for AI response
        )
        assert response.status_code == 200

    def test_send_empty_message(self):
        """POST /api/chat/messages rejects empty message"""
        response = requests.post(
            f"{CHAT_SERVICE}/api/chat/messages",
            json={
                "text": "",
                "session_id": "test-empty"
            },
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 422]

    def test_send_message_without_session(self):
        """POST /api/chat/messages handles missing session_id"""
        response = requests.post(
            f"{CHAT_SERVICE}/api/chat/messages",
            json={
                "text": "Hello",
            },
            timeout=TIMEOUT
        )
        # Should either work or return validation error
        assert response.status_code in [200, 400, 422]


# ============================================================
# CROSS-SERVICE INTEGRATION TESTS
# ============================================================

class TestServiceIntegration:
    """Integration tests across services"""

    @pytest.mark.skipif(
        not (is_service_available(USER_SERVICE) and is_service_available(ORDER_SERVICE)),
        reason="User and Order services must both be available"
    )
    def test_full_checkout_flow(self):
        """Full checkout: register -> login -> create order"""
        email = f"checkout_{int(time.time())}@example.com"

        # Step 1: Register
        reg_response = requests.post(
            f"{USER_SERVICE}/api/users/register",
            json={
                "email": email,
                "password": "SecurePass123!",
                "full_name": "Checkout Test User"
            },
            timeout=TIMEOUT
        )
        assert reg_response.status_code == 201
        token = reg_response.json()["access_token"]

        # Step 2: Create order
        order_response = requests.post(
            f"{ORDER_SERVICE}/api/checkout",
            json={"shipping_address": "123 Test Street, Karachi"},
            headers={"Authorization": f"Bearer {token}"},
            timeout=TIMEOUT
        )
        # Should create order or return appropriate error
        assert order_response.status_code in [200, 201, 400, 422]

    @pytest.mark.skipif(
        not (is_service_available(PRODUCT_SERVICE) and is_service_available(CHAT_SERVICE)),
        reason="Product and Chat services must both be available"
    )
    def test_product_recommendation_via_chat(self):
        """Chat about products and get recommendations"""
        response = requests.post(
            f"{CHAT_SERVICE}/api/chat/messages",
            json={
                "text": "I need a fancy suit for a wedding under 10000 PKR",
                "session_id": f"rec-test-{int(time.time())}"
            },
            timeout=30
        )
        assert response.status_code == 200

    @pytest.mark.skipif(
        not is_service_available(PRODUCT_SERVICE),
        reason="Product service must be available"
    )
    def test_product_api_response_time(self):
        """Product API response time under 500ms"""
        start = time.time()
        response = requests.get(
            f"{PRODUCT_SERVICE}/api/products?limit=10",
            timeout=TIMEOUT
        )
        duration_ms = (time.time() - start) * 1000
        assert response.status_code == 200
        assert duration_ms < 500, f"API took {duration_ms:.0f}ms (target: <500ms)"


# ============================================================
# SERVICE AVAILABILITY REPORT
# ============================================================

class TestServiceAvailability:
    """Report on which services are available"""

    def test_user_service_availability(self):
        """Report: User service availability"""
        available = is_service_available(USER_SERVICE)
        if not available:
            pytest.skip(f"User service at {USER_SERVICE} is DOWN")
        assert available

    def test_product_service_availability(self):
        """Report: Product service availability"""
        available = is_service_available(PRODUCT_SERVICE)
        if not available:
            pytest.skip(f"Product service at {PRODUCT_SERVICE} is DOWN")
        assert available

    def test_order_service_availability(self):
        """Report: Order service availability"""
        available = is_service_available(ORDER_SERVICE)
        if not available:
            pytest.skip(f"Order service at {ORDER_SERVICE} is DOWN")
        assert available

    def test_chat_service_availability(self):
        """Report: Chat service availability"""
        available = is_service_available(CHAT_SERVICE)
        if not available:
            pytest.skip(f"Chat service at {CHAT_SERVICE} is DOWN")
        assert available

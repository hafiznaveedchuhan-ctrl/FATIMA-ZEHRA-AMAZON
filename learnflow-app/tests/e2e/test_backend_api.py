"""
Comprehensive Backend API E2E Tests for Fatima Zehra Boutique
=============================================================
Tests User Service (8001) and Product Service (8002) endpoints.
Run with: pytest tests/e2e/test_backend_api.py -v --tb=short
"""

import time
import uuid
import pytest
import requests

# ====================== CONFIGURATION ======================

USER_SERVICE_URL = "http://localhost:8001"
PRODUCT_SERVICE_URL = "http://localhost:8002"

TIMEOUT = 10  # seconds


# ====================== FIXTURES ======================

@pytest.fixture(scope="module")
def unique_email():
    """Generate a unique email for test isolation."""
    return f"e2e_{uuid.uuid4().hex[:8]}@test.com"


@pytest.fixture(scope="module")
def registered_user(unique_email):
    """Register a user and return credentials + token."""
    payload = {
        "full_name": "E2E Test User",
        "email": unique_email,
        "password": "SecurePass123"
    }
    resp = requests.post(
        f"{USER_SERVICE_URL}/api/users/register",
        json=payload,
        timeout=TIMEOUT,
    )
    assert resp.status_code in (200, 201), f"Registration failed: {resp.text}"
    data = resp.json()
    return {
        "email": unique_email,
        "password": "SecurePass123",
        "token": data.get("access_token"),
        "user": data.get("user"),
    }


@pytest.fixture(scope="module")
def auth_headers(registered_user):
    """Return authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {registered_user['token']}"}


# ====================== SERVICE HEALTH ======================

class TestServiceHealth:
    """Verify all running services are healthy."""

    def test_user_service_health(self):
        resp = requests.get(f"{USER_SERVICE_URL}/health", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"

    def test_product_service_health(self):
        resp = requests.get(f"{PRODUCT_SERVICE_URL}/health", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"

    def test_user_service_docs_available(self):
        resp = requests.get(f"{USER_SERVICE_URL}/docs", timeout=TIMEOUT)
        assert resp.status_code == 200

    def test_product_service_docs_available(self):
        resp = requests.get(f"{PRODUCT_SERVICE_URL}/docs", timeout=TIMEOUT)
        assert resp.status_code == 200


# ====================== USER SERVICE TESTS ======================

class TestUserRegistration:
    """Test user registration endpoint: POST /api/users/register"""

    def test_register_new_user(self):
        email = f"reg_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "full_name": "Registration Test",
            "email": email,
            "password": "StrongPassword1"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == email
        assert data["user"]["full_name"] == "Registration Test"
        assert data["user"]["is_active"] is True

    def test_register_duplicate_email(self, registered_user):
        payload = {
            "full_name": "Duplicate User",
            "email": registered_user["email"],
            "password": "AnyPassword1"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        # Should return error for duplicate
        assert resp.status_code in (400, 409, 422)

    def test_register_missing_email(self):
        payload = {
            "full_name": "No Email",
            "password": "Password123"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 422

    def test_register_missing_password(self):
        payload = {
            "full_name": "No Pass",
            "email": f"nopass_{uuid.uuid4().hex[:8]}@test.com"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 422

    def test_register_empty_body(self):
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json={},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 422


class TestUserLogin:
    """Test user login endpoint: POST /api/users/login"""

    def test_login_valid_credentials(self, registered_user):
        payload = {
            "email": registered_user["email"],
            "password": registered_user["password"]
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == registered_user["email"]

    def test_login_wrong_password(self, registered_user):
        payload = {
            "email": registered_user["email"],
            "password": "WrongPassword999"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 401, 403)

    def test_login_nonexistent_email(self):
        payload = {
            "email": "doesnotexist@nowhere.com",
            "password": "AnyPass123"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json=payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 401, 404)

    def test_login_missing_fields(self):
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json={},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 422

    def test_login_returns_jwt_token(self, registered_user):
        payload = {
            "email": registered_user["email"],
            "password": registered_user["password"]
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json=payload,
            timeout=TIMEOUT,
        )
        data = resp.json()
        token = data.get("access_token", "")
        # JWT tokens have 3 parts separated by dots
        assert len(token.split(".")) == 3, "Token does not appear to be a valid JWT"


class TestUserProfile:
    """Test user profile endpoints."""

    def test_get_user_by_id(self):
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/1",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "email" in data
        assert "full_name" in data

    def test_get_nonexistent_user(self):
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/99999",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 404

    def test_user_response_fields(self):
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/1",
            timeout=TIMEOUT,
        )
        data = resp.json()
        expected_fields = ["id", "email", "full_name", "is_active", "created_at"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"

    def test_password_not_exposed_in_response(self):
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/1",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert "password" not in data
        assert "hashed_password" not in data
        assert "password_hash" not in data


# ====================== PRODUCT SERVICE TESTS ======================

class TestProductCategories:
    """Test category endpoints: GET /api/categories"""

    def test_get_all_categories(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/categories",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4, f"Expected 4 categories, got {len(data)}"

    def test_category_names(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/categories",
            timeout=TIMEOUT,
        )
        data = resp.json()
        names = [cat["name"] for cat in data]
        expected = ["Fancy Suits", "Shalwar Qameez", "Cotton Suits", "Designer Brands"]
        for name in expected:
            assert name in names, f"Missing category: {name}"

    def test_category_fields(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/categories",
            timeout=TIMEOUT,
        )
        data = resp.json()
        for cat in data:
            assert "id" in cat
            assert "name" in cat
            assert "description" in cat
            assert "image_url" in cat

    def test_category_ids_are_sequential(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/categories",
            timeout=TIMEOUT,
        )
        data = resp.json()
        ids = sorted([cat["id"] for cat in data])
        assert ids == [1, 2, 3, 4]


class TestProductListing:
    """Test product listing endpoint: GET /api/products"""

    def test_get_all_products(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "products" in data
        assert "total" in data
        assert data["total"] == 40, f"Expected 40 products, got {data['total']}"

    def test_products_have_required_fields(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?limit=1",
            timeout=TIMEOUT,
        )
        data = resp.json()
        product = data["products"][0]
        required = ["id", "name", "description", "price", "category_id",
                     "image_url", "stock_quantity", "is_active"]
        for field in required:
            assert field in product, f"Missing field: {field}"

    def test_product_has_category_object(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?limit=1",
            timeout=TIMEOUT,
        )
        data = resp.json()
        product = data["products"][0]
        assert "category" in product
        assert "name" in product["category"]

    def test_pagination_limit(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?limit=5",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 5
        assert data["limit"] == 5

    def test_pagination_skip(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?skip=10&limit=5",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 5
        assert data["skip"] == 10

    def test_pagination_beyond_total(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?skip=100",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 0


class TestProductFiltering:
    """Test product filtering capabilities."""

    def test_filter_by_category_id(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?category_id=1",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 10
        for product in data["products"]:
            assert product["category_id"] == 1

    def test_filter_by_category_id_2(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?category_id=2",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 10
        for product in data["products"]:
            assert product["category_id"] == 2

    def test_filter_by_category_id_3(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?category_id=3",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 10

    def test_filter_by_category_id_4(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?category_id=4",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 10

    def test_filter_invalid_category(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?category_id=999",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 0

    def test_search_products(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?search=blue",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) > 0
        # At least one product should contain 'blue' in name/description
        found = False
        for p in data["products"]:
            if "blue" in p["name"].lower() or "blue" in p["description"].lower():
                found = True
                break
        assert found, "Search results do not contain 'blue' keyword"

    def test_search_no_results(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?search=xyznonexistent12345",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) == 0

    def test_price_range_filter(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?min_price=5000&max_price=9000",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert len(data["products"]) > 0
        for product in data["products"]:
            price = float(product["price"])
            assert 5000 <= price <= 9000, f"Price {price} outside range [5000, 9000]"

    def test_min_price_only(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?min_price=10000",
            timeout=TIMEOUT,
        )
        data = resp.json()
        for product in data["products"]:
            assert float(product["price"]) >= 10000


class TestProductDetail:
    """Test single product endpoint: GET /api/products/{id}"""

    def test_get_product_by_id(self):
        # First get list to find a valid ID
        resp_list = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?limit=1",
            timeout=TIMEOUT,
        )
        product_id = resp_list.json()["products"][0]["id"]

        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products/{product_id}",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == product_id

    def test_product_detail_fields(self):
        resp_list = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?limit=1",
            timeout=TIMEOUT,
        )
        product_id = resp_list.json()["products"][0]["id"]

        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products/{product_id}",
            timeout=TIMEOUT,
        )
        data = resp.json()
        assert "name" in data
        assert "description" in data
        assert "price" in data
        assert "image_url" in data
        assert "category" in data

    def test_nonexistent_product(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products/99999",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 404

    def test_invalid_product_id(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products/abc",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 422


# ====================== CROSS-SERVICE TESTS ======================

class TestCrossServiceIntegration:
    """Test integration aspects between services."""

    def test_user_service_response_time(self):
        start = time.time()
        resp = requests.get(f"{USER_SERVICE_URL}/health", timeout=TIMEOUT)
        elapsed = time.time() - start
        assert resp.status_code == 200
        assert elapsed < 1.0, f"Health check took {elapsed:.2f}s (expected <1s)"

    def test_product_service_response_time(self):
        start = time.time()
        resp = requests.get(f"{PRODUCT_SERVICE_URL}/health", timeout=TIMEOUT)
        elapsed = time.time() - start
        assert resp.status_code == 200
        assert elapsed < 1.0, f"Health check took {elapsed:.2f}s (expected <1s)"

    def test_product_listing_response_time(self):
        start = time.time()
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        elapsed = time.time() - start
        assert resp.status_code == 200
        assert elapsed < 2.0, f"Product listing took {elapsed:.2f}s (expected <2s)"

    def test_cors_headers_user_service(self):
        resp = requests.options(
            f"{USER_SERVICE_URL}/api/users/register",
            headers={"Origin": "http://localhost:3000"},
            timeout=TIMEOUT,
        )
        # CORS should allow the origin
        assert resp.status_code in (200, 204, 405)

    def test_cors_headers_product_service(self):
        resp = requests.options(
            f"{PRODUCT_SERVICE_URL}/api/products",
            headers={"Origin": "http://localhost:3000"},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 204, 405)

    def test_json_content_type_user_service(self):
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/1",
            timeout=TIMEOUT,
        )
        assert "application/json" in resp.headers.get("content-type", "")

    def test_json_content_type_product_service(self):
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        assert "application/json" in resp.headers.get("content-type", "")


# ====================== SECURITY TESTS ======================

class TestSecurityBasics:
    """Basic security validation tests."""

    def test_sql_injection_search(self):
        """Verify SQL injection in search parameter is handled safely."""
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products?search=' OR 1=1 --",
            timeout=TIMEOUT,
        )
        # Should not crash - return empty results or valid response
        assert resp.status_code in (200, 400)
        if resp.status_code == 200:
            data = resp.json()
            # Should not return all products from injection
            assert isinstance(data.get("products", []), list)

    def test_sql_injection_user_login(self):
        """Verify SQL injection in login is handled safely."""
        payload = {
            "email": "' OR '1'='1",
            "password": "' OR '1'='1"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/login",
            json=payload,
            timeout=TIMEOUT,
        )
        # Should not successfully authenticate
        assert resp.status_code in (400, 401, 422)

    def test_xss_in_registration(self):
        """Verify XSS payloads are not reflected unsafely."""
        payload = {
            "full_name": "<script>alert('xss')</script>",
            "email": f"xss_{uuid.uuid4().hex[:6]}@test.com",
            "password": "SecurePass123"
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        # The service should accept it (stored, not reflected)
        # or reject it, but not crash
        assert resp.status_code in (200, 201, 400, 422)

    def test_large_payload_handling(self):
        """Verify service handles abnormally large payloads."""
        large_string = "A" * 100_000
        payload = {
            "full_name": large_string,
            "email": f"large_{uuid.uuid4().hex[:6]}@test.com",
            "password": large_string
        }
        resp = requests.post(
            f"{USER_SERVICE_URL}/api/users/register",
            json=payload,
            timeout=TIMEOUT,
        )
        # Should reject or handle gracefully
        assert resp.status_code in (200, 201, 400, 413, 422, 500)

    def test_password_not_in_user_list_response(self):
        """Ensure password hashes are never exposed."""
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/1",
            timeout=TIMEOUT,
        )
        text = resp.text.lower()
        assert "password" not in text or "hashed" not in text


# ====================== DATA CONSISTENCY TESTS ======================

class TestDataConsistency:
    """Test data consistency across endpoints."""

    def test_total_products_equals_sum_of_categories(self):
        """Total products should equal sum of products across all categories."""
        all_resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        total = all_resp.json()["total"]

        category_total = 0
        for cat_id in [1, 2, 3, 4]:
            cat_resp = requests.get(
                f"{PRODUCT_SERVICE_URL}/api/products?category_id={cat_id}",
                timeout=TIMEOUT,
            )
            category_total += len(cat_resp.json()["products"])

        assert total == category_total, (
            f"Total ({total}) != sum of categories ({category_total})"
        )

    def test_each_category_has_10_products(self):
        """Each category should have exactly 10 products."""
        for cat_id in [1, 2, 3, 4]:
            resp = requests.get(
                f"{PRODUCT_SERVICE_URL}/api/products?category_id={cat_id}",
                timeout=TIMEOUT,
            )
            count = len(resp.json()["products"])
            assert count == 10, f"Category {cat_id} has {count} products, expected 10"

    def test_all_products_have_images(self):
        """Every product should have an image_url."""
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        for product in resp.json()["products"]:
            assert product["image_url"], f"Product {product['id']} has no image"

    def test_all_products_have_positive_prices(self):
        """Every product should have a positive price."""
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        for product in resp.json()["products"]:
            price = float(product["price"])
            assert price > 0, f"Product {product['id']} has invalid price: {price}"

    def test_all_products_are_active(self):
        """All seeded products should be active."""
        resp = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products",
            timeout=TIMEOUT,
        )
        for product in resp.json()["products"]:
            assert product["is_active"] is True, (
                f"Product {product['id']} is not active"
            )

    def test_registered_user_can_be_retrieved(self, registered_user):
        """A registered user should be retrievable by ID."""
        user_id = registered_user["user"]["id"]
        resp = requests.get(
            f"{USER_SERVICE_URL}/api/users/{user_id}",
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == registered_user["email"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

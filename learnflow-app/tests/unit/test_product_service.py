"""
Product Service Unit Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Product listing with pagination
- Product filtering (category, price range, featured, search)
- Product CRUD operations (create, read, update, soft delete)
- Category CRUD operations
- Data validation
- Edge cases (empty results, boundary values)

All tests use SQLite in-memory database for isolation.
No external services required.
"""

import os
import sys
import pytest
from decimal import Decimal

os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend", "product-service"))

from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import Category, Product


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
def seed_categories(session: Session):
    """Seed test categories into the database."""
    categories = [
        Category(id=1, name="Fancy Suits", description="Elegant formal suits"),
        Category(id=2, name="Shalwar Qameez", description="Traditional Pakistani wear"),
        Category(id=3, name="Cotton Suits", description="Comfortable daily wear"),
        Category(id=4, name="Designer Brands", description="Premium designer collections"),
    ]
    for cat in categories:
        session.add(cat)
    session.commit()
    return categories


@pytest.fixture
def seed_products(session: Session, seed_categories):
    """Seed test products into the database."""
    products = []
    names = {
        1: ["Royal Embroidered", "Gold Thread", "Maroon Velvet", "Navy Formal", "Pearl White"],
        2: ["Classic White", "Premium Cotton", "Karachi Style", "Peshawar Cut", "Lawn Classic"],
        3: ["Pure Cotton Comfort", "Soft Weave", "Summer Breeze", "Daily Essential", "Casual Chic"],
        4: ["Maria B Premium", "Gul Ahmed Luxury", "Sapphire Elite", "Khaadi Signature", "Bonanza Designer"],
    }
    prices = {1: 8500, 2: 3500, 3: 2200, 4: 12500}

    idx = 1
    for cat_id in range(1, 5):
        for i, name in enumerate(names[cat_id]):
            product = Product(
                id=idx,
                name=name,
                description=f"Premium {name} from our collection",
                price=Decimal(str(prices[cat_id] + (i * 500))),
                category_id=cat_id,
                image_url=f"/images/cat{cat_id}/product-{idx:02d}.jpg",
                stock_quantity=50 - i,
                is_active=True,
                featured=(i == 0),
            )
            session.add(product)
            products.append(product)
            idx += 1
    session.commit()
    return products


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
        assert data["service"] == "Product Service"
        assert data["status"] == "healthy"

    @pytest.mark.unit
    def test_health_endpoint(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Category Tests
# ---------------------------------------------------------------------------

class TestCategories:
    """Test category CRUD endpoints."""

    @pytest.mark.unit
    def test_list_categories_empty(self, client: TestClient):
        """Test listing categories when none exist."""
        response = client.get("/api/categories")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.unit
    def test_create_category(self, client: TestClient):
        """Test creating a new category."""
        response = client.post(
            "/api/categories",
            json={
                "name": "New Category",
                "description": "A new category"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Category"
        assert data["id"] is not None

    @pytest.mark.unit
    def test_create_duplicate_category(self, client: TestClient):
        """Test creating a category with duplicate name fails."""
        client.post("/api/categories", json={"name": "Duplicate", "description": "first"})
        response = client.post("/api/categories", json={"name": "Duplicate", "description": "second"})
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    @pytest.mark.unit
    def test_list_categories(self, client: TestClient, seed_categories):
        """Test listing all categories."""
        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4

    @pytest.mark.unit
    def test_get_category_by_id(self, client: TestClient, seed_categories):
        """Test getting a category by ID."""
        response = client.get("/api/categories/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == "Fancy Suits"

    @pytest.mark.unit
    def test_get_category_not_found(self, client: TestClient):
        """Test getting nonexistent category returns 404."""
        response = client.get("/api/categories/99999")
        assert response.status_code == 404

    @pytest.mark.unit
    def test_category_names_match_expected(self, client: TestClient, seed_categories):
        """Test that all expected category names exist."""
        response = client.get("/api/categories")
        names = [cat["name"] for cat in response.json()]
        for expected in ["Fancy Suits", "Shalwar Qameez", "Cotton Suits", "Designer Brands"]:
            assert expected in names


# ---------------------------------------------------------------------------
# Product Listing Tests
# ---------------------------------------------------------------------------

class TestProductListing:
    """Test product listing with pagination."""

    @pytest.mark.unit
    def test_list_products_empty(self, client: TestClient):
        """Test listing products when none exist."""
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert data["products"] == []
        assert data["total"] == 0

    @pytest.mark.unit
    def test_list_products_default_pagination(self, client: TestClient, seed_products):
        """Test default pagination (limit=10)."""
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 10
        assert data["skip"] == 0
        assert data["limit"] == 10

    @pytest.mark.unit
    def test_list_products_custom_limit(self, client: TestClient, seed_products):
        """Test products with custom limit."""
        response = client.get("/api/products?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 5

    @pytest.mark.unit
    def test_list_products_second_page(self, client: TestClient, seed_products):
        """Test fetching second page."""
        response = client.get("/api/products?skip=10&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 10

    @pytest.mark.unit
    def test_list_products_all(self, client: TestClient, seed_products):
        """Test fetching all products."""
        response = client.get("/api/products?limit=100")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 20  # 5 per category * 4 categories

    @pytest.mark.unit
    def test_product_response_has_required_fields(self, client: TestClient, seed_products):
        """Test that product response contains all required fields."""
        response = client.get("/api/products?limit=1")
        product = response.json()["products"][0]
        required_fields = ["id", "name", "price", "description", "is_active", "featured"]
        for field in required_fields:
            assert field in product, f"Missing field: {field}"


# ---------------------------------------------------------------------------
# Product Filtering Tests
# ---------------------------------------------------------------------------

class TestProductFiltering:
    """Test product filtering functionality."""

    @pytest.mark.unit
    def test_filter_by_category(self, client: TestClient, seed_products):
        """Test filtering products by category_id."""
        response = client.get("/api/products?category_id=1&limit=100")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 5
        for product in data["products"]:
            assert product["category_id"] == 1

    @pytest.mark.unit
    def test_filter_by_featured(self, client: TestClient, seed_products):
        """Test filtering featured products."""
        response = client.get("/api/products?featured=true&limit=100")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["featured"] is True

    @pytest.mark.unit
    def test_filter_by_min_price(self, client: TestClient, seed_products):
        """Test filtering by minimum price."""
        response = client.get("/api/products?min_price=10000&limit=100")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert float(product["price"]) >= 10000

    @pytest.mark.unit
    def test_filter_by_max_price(self, client: TestClient, seed_products):
        """Test filtering by maximum price."""
        response = client.get("/api/products?max_price=3000&limit=100")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert float(product["price"]) <= 3000

    @pytest.mark.unit
    def test_filter_by_price_range(self, client: TestClient, seed_products):
        """Test filtering by price range."""
        response = client.get("/api/products?min_price=3000&max_price=9000&limit=100")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            price = float(product["price"])
            assert 3000 <= price <= 9000

    @pytest.mark.unit
    def test_search_by_name(self, client: TestClient, seed_products):
        """Test searching products by name."""
        response = client.get("/api/products?search=Royal&limit=100")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) > 0
        for product in data["products"]:
            assert "royal" in product["name"].lower() or "royal" in (product.get("description") or "").lower()

    @pytest.mark.unit
    def test_search_case_insensitive(self, client: TestClient, seed_products):
        """Test that search is case-insensitive."""
        upper = client.get("/api/products?search=COTTON&limit=100").json()
        lower = client.get("/api/products?search=cotton&limit=100").json()
        assert len(upper["products"]) == len(lower["products"])

    @pytest.mark.unit
    def test_search_no_results(self, client: TestClient, seed_products):
        """Test search with no matching results."""
        response = client.get("/api/products?search=nonexistent12345xyz&limit=100")
        assert response.status_code == 200
        assert len(response.json()["products"]) == 0

    @pytest.mark.unit
    def test_combined_filters(self, client: TestClient, seed_products):
        """Test combining category filter with price filter."""
        response = client.get("/api/products?category_id=1&min_price=8000&limit=100")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["category_id"] == 1
            assert float(product["price"]) >= 8000


# ---------------------------------------------------------------------------
# Product Detail Tests
# ---------------------------------------------------------------------------

class TestProductDetail:
    """Test single product retrieval."""

    @pytest.mark.unit
    def test_get_product_by_id(self, client: TestClient, seed_products):
        """Test getting a product by ID."""
        response = client.get("/api/products/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == "Royal Embroidered"

    @pytest.mark.unit
    def test_get_product_not_found(self, client: TestClient, seed_products):
        """Test getting nonexistent product returns 404."""
        response = client.get("/api/products/99999")
        assert response.status_code == 404

    @pytest.mark.unit
    def test_get_product_includes_category(self, client: TestClient, seed_products):
        """Test that product detail includes category info."""
        response = client.get("/api/products/1")
        data = response.json()
        assert "category" in data or "category_id" in data

    @pytest.mark.unit
    def test_product_has_image_url(self, client: TestClient, seed_products):
        """Test that product has image_url field."""
        response = client.get("/api/products/1")
        data = response.json()
        assert "image_url" in data
        assert data["image_url"].startswith("/images/")


# ---------------------------------------------------------------------------
# Product CRUD Tests
# ---------------------------------------------------------------------------

class TestProductCRUD:
    """Test product create, update, delete operations."""

    @pytest.mark.unit
    def test_create_product(self, client: TestClient, seed_categories):
        """Test creating a new product."""
        response = client.post(
            "/api/products",
            json={
                "name": "New Test Product",
                "description": "A brand new product",
                "price": 5000.00,
                "category_id": 1,
                "stock_quantity": 25,
                "featured": False
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Test Product"
        assert float(data["price"]) == 5000.00

    @pytest.mark.unit
    def test_create_product_invalid_category(self, client: TestClient):
        """Test creating product with invalid category returns 400."""
        response = client.post(
            "/api/products",
            json={
                "name": "Bad Category Product",
                "price": 1000.00,
                "category_id": 99999,
                "stock_quantity": 1
            }
        )
        assert response.status_code == 400

    @pytest.mark.unit
    def test_update_product(self, client: TestClient, seed_products):
        """Test updating a product."""
        response = client.put(
            "/api/products/1",
            json={"name": "Updated Product Name", "price": 9999.00}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product Name"
        assert float(data["price"]) == 9999.00

    @pytest.mark.unit
    def test_update_product_not_found(self, client: TestClient):
        """Test updating nonexistent product returns 404."""
        response = client.put(
            "/api/products/99999",
            json={"name": "Ghost Product"}
        )
        assert response.status_code == 404

    @pytest.mark.unit
    def test_delete_product_soft_delete(self, client: TestClient, seed_products):
        """Test that delete performs soft delete (sets is_active=False)."""
        response = client.delete("/api/products/1")
        assert response.status_code == 204

        # Product should no longer appear in active listings
        list_response = client.get("/api/products/1")
        assert list_response.status_code == 404

    @pytest.mark.unit
    def test_delete_product_not_found(self, client: TestClient):
        """Test deleting nonexistent product returns 404."""
        response = client.delete("/api/products/99999")
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Data Validation Tests
# ---------------------------------------------------------------------------

class TestProductValidation:
    """Test product data validation."""

    @pytest.mark.unit
    def test_all_products_have_positive_prices(self, client: TestClient, seed_products):
        """Test all products have positive prices."""
        response = client.get("/api/products?limit=100")
        for product in response.json()["products"]:
            assert float(product["price"]) > 0

    @pytest.mark.unit
    def test_all_products_have_names(self, client: TestClient, seed_products):
        """Test all products have non-empty names."""
        response = client.get("/api/products?limit=100")
        for product in response.json()["products"]:
            assert len(product["name"]) > 0

    @pytest.mark.unit
    def test_all_products_have_stock(self, client: TestClient, seed_products):
        """Test all products have non-negative stock."""
        response = client.get("/api/products?limit=100")
        for product in response.json()["products"]:
            assert product["stock_quantity"] >= 0

    @pytest.mark.unit
    def test_pagination_boundary_skip_negative(self, client: TestClient, seed_products):
        """Test that negative skip value is rejected."""
        response = client.get("/api/products?skip=-1")
        assert response.status_code == 422

    @pytest.mark.unit
    def test_pagination_boundary_limit_zero(self, client: TestClient, seed_products):
        """Test that limit=0 is rejected."""
        response = client.get("/api/products?limit=0")
        assert response.status_code == 422

    @pytest.mark.unit
    def test_pagination_boundary_limit_over_max(self, client: TestClient, seed_products):
        """Test that limit > 100 is rejected."""
        response = client.get("/api/products?limit=101")
        assert response.status_code == 422

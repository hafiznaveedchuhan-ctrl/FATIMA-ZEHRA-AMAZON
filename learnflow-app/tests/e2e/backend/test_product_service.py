"""
Product Service API Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Product listing endpoint
- Product filtering by category
- Product search functionality
- Product detail retrieval
- Category endpoints
"""

import pytest
import httpx
from typing import Dict, Any


class TestProductServiceHealth:
    """Test Product Service health endpoints."""

    @pytest.mark.requires_api
    def test_health_endpoint(self, base_urls: Dict[str, str]):
        """Test health check endpoint returns 200."""
        url = f"{base_urls['product']}/health"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    @pytest.mark.requires_api
    def test_root_endpoint(self, base_urls: Dict[str, str]):
        """Test root endpoint returns service info."""
        url = f"{base_urls['product']}/"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "status" in data


class TestProductListing:
    """Test product listing endpoints."""

    @pytest.mark.requires_api
    def test_list_products_returns_40_products(self, base_urls: Dict[str, str]):
        """Test that product listing returns 40 products."""
        url = f"{base_urls['product']}/api/products?limit=100"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert data["total"] == 40

    @pytest.mark.requires_api
    def test_list_products_pagination(self, base_urls: Dict[str, str]):
        """Test product pagination with skip and limit."""
        url = f"{base_urls['product']}/api/products?skip=0&limit=10"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 10
        assert data["skip"] == 0
        assert data["limit"] == 10

    @pytest.mark.requires_api
    def test_list_products_second_page(self, base_urls: Dict[str, str]):
        """Test fetching second page of products."""
        url = f"{base_urls['product']}/api/products?skip=10&limit=10"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 10


class TestProductFiltering:
    """Test product filtering functionality."""

    @pytest.mark.requires_api
    def test_filter_by_category_fancy_suits(self, base_urls: Dict[str, str]):
        """Test filtering products by Fancy Suits category."""
        url = f"{base_urls['product']}/api/products?category_id=1"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        # All products should be from category_id 1
        for product in data["products"]:
            assert product.get("category_id") == 1 or "Fancy" in product.get("name", "")

    @pytest.mark.requires_api
    def test_filter_by_min_price(self, base_urls: Dict[str, str]):
        """Test filtering products by minimum price."""
        url = f"{base_urls['product']}/api/products?min_price=5000"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["price"] >= 5000

    @pytest.mark.requires_api
    def test_filter_by_max_price(self, base_urls: Dict[str, str]):
        """Test filtering products by maximum price."""
        url = f"{base_urls['product']}/api/products?max_price=5000"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["price"] <= 5000

    @pytest.mark.requires_api
    def test_filter_by_price_range(self, base_urls: Dict[str, str]):
        """Test filtering products by price range."""
        url = f"{base_urls['product']}/api/products?min_price=3000&max_price=8000"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert 3000 <= product["price"] <= 8000

    @pytest.mark.requires_api
    def test_filter_featured_products(self, base_urls: Dict[str, str]):
        """Test filtering featured products."""
        url = f"{base_urls['product']}/api/products?featured=true"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        # Response should be valid
        assert "products" in data


class TestProductSearch:
    """Test product search functionality."""

    @pytest.mark.requires_api
    def test_search_fancy_suit(self, base_urls: Dict[str, str]):
        """Test searching for 'fancy suit'."""
        url = f"{base_urls['product']}/api/products?search=fancy%20suit"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) > 0
        # Results should contain 'fancy' or 'suit'
        for product in data["products"]:
            name_lower = product["name"].lower()
            desc_lower = product.get("description", "").lower()
            assert "fancy" in name_lower or "suit" in name_lower or \
                   "fancy" in desc_lower or "suit" in desc_lower

    @pytest.mark.requires_api
    def test_search_cotton(self, base_urls: Dict[str, str]):
        """Test searching for 'cotton'."""
        url = f"{base_urls['product']}/api/products?search=cotton"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) > 0

    @pytest.mark.requires_api
    def test_search_designer(self, base_urls: Dict[str, str]):
        """Test searching for 'designer'."""
        url = f"{base_urls['product']}/api/products?search=designer"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) > 0

    @pytest.mark.requires_api
    def test_search_no_results(self, base_urls: Dict[str, str]):
        """Test search with no matching results."""
        url = f"{base_urls['product']}/api/products?search=nonexistent12345"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 0


class TestProductDetail:
    """Test product detail endpoint."""

    @pytest.mark.requires_api
    def test_get_product_by_id(self, base_urls: Dict[str, str]):
        """Test fetching product by ID."""
        url = f"{base_urls['product']}/api/products/1"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "name" in data
        assert "price" in data
        assert "description" in data

    @pytest.mark.requires_api
    def test_get_product_has_required_fields(self, base_urls: Dict[str, str]):
        """Test that product detail has all required fields."""
        url = f"{base_urls['product']}/api/products/1"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        required_fields = ["id", "name", "price", "description"]
        for field in required_fields:
            assert field in data

    @pytest.mark.requires_api
    def test_get_product_not_found(self, base_urls: Dict[str, str]):
        """Test fetching non-existent product returns 404."""
        url = f"{base_urls['product']}/api/products/99999"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 404

    @pytest.mark.requires_api
    def test_get_product_image_url_format(self, base_urls: Dict[str, str]):
        """Test that product image URL is correctly formatted."""
        url = f"{base_urls['product']}/api/products/1"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        if "image" in data or "image_url" in data:
            image = data.get("image") or data.get("image_url")
            assert image.startswith("/images/") or image.startswith("http")


class TestCategories:
    """Test category endpoints."""

    @pytest.mark.requires_api
    def test_list_categories(self, base_urls: Dict[str, str]):
        """Test listing all categories."""
        url = f"{base_urls['product']}/api/categories"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4  # 4 categories

    @pytest.mark.requires_api
    def test_category_names(self, base_urls: Dict[str, str]):
        """Test that all expected categories exist."""
        url = f"{base_urls['product']}/api/categories"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        category_names = [cat["name"] for cat in data]
        expected = ["Fancy Suits", "Shalwar Qameez", "Cotton Suits", "Designer Brands"]

        for name in expected:
            assert name in category_names

    @pytest.mark.requires_api
    def test_get_category_by_id(self, base_urls: Dict[str, str]):
        """Test fetching category by ID."""
        url = f"{base_urls['product']}/api/categories/1"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "name" in data

    @pytest.mark.requires_api
    def test_get_category_not_found(self, base_urls: Dict[str, str]):
        """Test fetching non-existent category returns 404."""
        url = f"{base_urls['product']}/api/categories/99999"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 404


class TestProductValidation:
    """Test product data validation."""

    @pytest.mark.requires_api
    def test_all_products_have_positive_prices(self, base_urls: Dict[str, str]):
        """Test that all products have positive prices."""
        url = f"{base_urls['product']}/api/products?limit=100"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        for product in data["products"]:
            assert product["price"] > 0

    @pytest.mark.requires_api
    def test_all_products_have_names(self, base_urls: Dict[str, str]):
        """Test that all products have non-empty names."""
        url = f"{base_urls['product']}/api/products?limit=100"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        for product in data["products"]:
            assert len(product["name"]) > 0

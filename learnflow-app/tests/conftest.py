"""
Root-Level Pytest Configuration and Shared Fixtures
Fatima Zehra Boutique - Phase 5 Comprehensive Testing

This conftest provides shared fixtures used across all test modules:
- Database session fixtures with SQLite for isolation
- Test data factories for users, products, orders
- Authentication helpers
- Service client factories
"""

import os
import sys
import pytest
from typing import Generator, Dict, Any
from datetime import datetime
from decimal import Decimal

# Add backend service paths for imports
BACKEND_BASE = os.path.join(os.path.dirname(__file__), "..", "app", "backend")
for service in ["user-service", "product-service", "order-service", "chat-service"]:
    service_path = os.path.join(BACKEND_BASE, service)
    if service_path not in sys.path:
        sys.path.insert(0, service_path)


# ---------------------------------------------------------------------------
# Environment setup for test isolation
# ---------------------------------------------------------------------------

# Override JWT secret to a known test value (>= 32 chars) BEFORE any imports
os.environ.setdefault(
    "JWT_SECRET",
    "test-secret-key-for-unit-tests-minimum-32-chars-long"
)
os.environ.setdefault("DATABASE_URL", "sqlite:///")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-placeholder-key-for-unit-tests")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_placeholder_for_unit_tests")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_secret")


# ---------------------------------------------------------------------------
# Marker configuration
# ---------------------------------------------------------------------------

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "unit: Unit tests (no external services)")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "e2e: End-to-end tests")
    config.addinivalue_line("markers", "slow: Slow running tests")
    config.addinivalue_line("markers", "requires_db: Requires database")
    config.addinivalue_line("markers", "requires_api: Requires running API")
    config.addinivalue_line("markers", "requires_stripe: Requires Stripe key")
    config.addinivalue_line("markers", "requires_rag: Requires RAG/Qdrant")


# ---------------------------------------------------------------------------
# Test data factories
# ---------------------------------------------------------------------------

@pytest.fixture
def user_data() -> Dict[str, str]:
    """Factory for user registration data."""
    return {
        "email": "testuser@fatimazehra.com",
        "password": "SecurePass123!",
        "full_name": "Test User"
    }


@pytest.fixture
def user_data_factory():
    """Factory that generates unique user data for each call."""
    counter = 0

    def _create(**overrides):
        nonlocal counter
        counter += 1
        data = {
            "email": f"user{counter}@fatimazehra.com",
            "password": "SecurePass123!",
            "full_name": f"Test User {counter}"
        }
        data.update(overrides)
        return data

    return _create


@pytest.fixture
def product_data() -> Dict[str, Any]:
    """Factory for product creation data."""
    return {
        "name": "Royal Embroidered Fancy Suit",
        "description": "Elegant hand-embroidered fancy suit for weddings and formal events",
        "price": 8500.00,
        "category_id": 1,
        "image_url": "/images/fancy-suits/fancy-suits-01.jpg",
        "stock_quantity": 50,
        "featured": True
    }


@pytest.fixture
def product_data_factory():
    """Factory that generates unique product data for each call."""
    counter = 0

    def _create(**overrides):
        nonlocal counter
        counter += 1
        data = {
            "name": f"Test Product {counter}",
            "description": f"Test product description {counter}",
            "price": 1000.00 + (counter * 500),
            "category_id": 1,
            "image_url": f"/images/test/test-{counter:02d}.jpg",
            "stock_quantity": 10 + counter,
            "featured": counter % 2 == 0
        }
        data.update(overrides)
        return data

    return _create


@pytest.fixture
def category_data() -> Dict[str, Any]:
    """Factory for category creation data."""
    return {
        "name": "Fancy Suits",
        "description": "Elegant suits for formal occasions",
        "image_url": "/images/categories/fancy-suits.jpg"
    }


@pytest.fixture
def cart_item_data() -> Dict[str, Any]:
    """Factory for cart item data."""
    return {
        "product_id": 1,
        "quantity": 2,
        "price": 8500.00
    }


@pytest.fixture
def checkout_data() -> Dict[str, str]:
    """Factory for checkout data."""
    return {
        "shipping_address": "123 Test Street, Gulshan, Karachi, Pakistan"
    }


@pytest.fixture
def chat_message_data() -> Dict[str, Any]:
    """Factory for chat message data."""
    return {
        "text": "I am looking for a formal suit for a wedding",
        "session_id": "test-session-001",
        "user_id": 1
    }


@pytest.fixture
def stripe_webhook_success() -> Dict[str, Any]:
    """Stripe webhook payload for successful payment."""
    return {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_123456",
                "status": "succeeded",
                "amount": 850000,
                "currency": "pkr",
                "receipt_email": "test@fatimazehra.com",
                "metadata": {
                    "order_id": "1",
                    "customer_name": "Test User"
                },
                "created": 1706000000,
            }
        }
    }


@pytest.fixture
def stripe_webhook_failed() -> Dict[str, Any]:
    """Stripe webhook payload for failed payment."""
    return {
        "type": "payment_intent.payment_failed",
        "data": {
            "object": {
                "id": "pi_test_failed_789",
                "status": "failed",
                "amount": 850000,
                "currency": "pkr",
                "metadata": {
                    "order_id": "2",
                    "customer_name": "Test User"
                },
                "last_payment_error": {
                    "message": "Your card was declined."
                },
                "created": 1706000000,
            }
        }
    }

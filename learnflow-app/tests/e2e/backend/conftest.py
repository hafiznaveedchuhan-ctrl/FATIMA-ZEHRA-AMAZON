"""
Pytest Configuration and Fixtures for Backend API Tests
Fatima Zehra Boutique - Phase 5 Testing
"""

import os
import pytest
import asyncio
from typing import Generator, Dict, Any

# Test configuration
BASE_URLS = {
    "user": os.getenv("USER_SERVICE_URL", "http://localhost:8001"),
    "product": os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002"),
    "order": os.getenv("ORDER_SERVICE_URL", "http://localhost:8003"),
    "chat": os.getenv("CHAT_SERVICE_URL", "http://localhost:8004"),
}

# Test user credentials
TEST_USER = {
    "email": "test@fatimazehra.com",
    "password": "TestPassword123!",
    "name": "Test User",
}

# Test product data
TEST_PRODUCTS = [
    {
        "id": 1,
        "name": "Royal Embroidered Fancy Suit",
        "price": 8500,
        "category": "Fancy Suits",
    },
    {
        "id": 11,
        "name": "Classic White Shalwar Qameez",
        "price": 3500,
        "category": "Shalwar Qameez",
    },
    {
        "id": 21,
        "name": "Pure Cotton Comfort Suit",
        "price": 2200,
        "category": "Cotton Suits",
    },
    {
        "id": 31,
        "name": "Maria B Premium Collection",
        "price": 12500,
        "category": "Designer Brands",
    },
]


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def base_urls() -> Dict[str, str]:
    """Provide base URLs for all services."""
    return BASE_URLS.copy()


@pytest.fixture
def test_user() -> Dict[str, str]:
    """Provide test user credentials."""
    return TEST_USER.copy()


@pytest.fixture
def test_products() -> list:
    """Provide test product data."""
    return TEST_PRODUCTS.copy()


@pytest.fixture
def auth_token() -> str:
    """Provide a mock authentication token for testing.

    In production tests, this would be obtained from actual login.
    For demo purposes, we use a simplified token format.
    """
    return "Bearer 1-test-token"


@pytest.fixture
def user_headers(auth_token: str) -> Dict[str, str]:
    """Provide headers with authentication for API requests."""
    return {
        "Authorization": auth_token,
        "Content-Type": "application/json",
    }


@pytest.fixture
def cart_item() -> Dict[str, Any]:
    """Provide sample cart item data."""
    return {
        "product_id": 1,
        "quantity": 2,
        "price": 8500.0,
    }


@pytest.fixture
def checkout_data() -> Dict[str, str]:
    """Provide sample checkout data."""
    return {
        "shipping_address": "123 Test Street, Karachi, Pakistan",
    }


@pytest.fixture
def payment_data() -> Dict[str, Any]:
    """Provide sample payment data."""
    return {
        "order_id": 1,
        "amount": 8500.0,
        "customer_email": "test@fatimazehra.com",
        "customer_name": "Test User",
    }


@pytest.fixture
def chat_message() -> Dict[str, str]:
    """Provide sample chat message data."""
    return {
        "text": "I want a formal suit for wedding",
        "session_id": "test-session-001",
        "user_id": 1,
    }


@pytest.fixture
def stripe_test_card() -> Dict[str, str]:
    """Provide Stripe test card details."""
    return {
        "number": "4242424242424242",
        "exp_month": "12",
        "exp_year": "2028",
        "cvc": "123",
    }


@pytest.fixture
def webhook_payload_success() -> Dict[str, Any]:
    """Provide sample Stripe webhook payload for successful payment."""
    return {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_123",
                "status": "succeeded",
                "amount": 850000,  # In paisa (PKR * 100)
                "currency": "pkr",
                "metadata": {
                    "order_id": "1",
                },
            },
        },
    }


@pytest.fixture
def webhook_payload_failed() -> Dict[str, Any]:
    """Provide sample Stripe webhook payload for failed payment."""
    return {
        "type": "payment_intent.payment_failed",
        "data": {
            "object": {
                "id": "pi_test_456",
                "status": "failed",
                "amount": 850000,
                "currency": "pkr",
                "metadata": {
                    "order_id": "2",
                },
                "last_payment_error": {
                    "message": "Card declined",
                },
            },
        },
    }


# Markers for test categories
def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "e2e: End-to-end tests")
    config.addinivalue_line("markers", "slow: Tests that take longer to run")
    config.addinivalue_line("markers", "requires_db: Tests that require database")
    config.addinivalue_line("markers", "requires_api: Tests that require running API")

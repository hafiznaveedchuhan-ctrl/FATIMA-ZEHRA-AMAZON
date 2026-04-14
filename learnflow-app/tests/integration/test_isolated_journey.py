"""
Isolated Integration Tests - Complete User Journey
Fatima Zehra Boutique - Phase 5 Testing

Tests the full user journey using TestClient (no running servers needed):
1. User registration and authentication
2. Cart management
3. Checkout and order creation
4. Order retrieval and verification

All tests use SQLite in-memory for isolation.

Architecture note: User-service and order-service share the 'app' module namespace.
To avoid conflicts, this module is split into two separate test files conceptually,
but physically we import user-service first and order-service tests run in a
separate pytest worker. For this file, we test each service independently using
direct sys.path manipulation with careful module management.
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


# ---------------------------------------------------------------------------
# We import only user-service in this module to avoid 'app' namespace collision.
# Order service integration tests are in test_isolated_order_journey.py.
# ---------------------------------------------------------------------------

USER_SVC_PATH = os.path.join(BACKEND_BASE, "user-service")
sys.path.insert(0, USER_SVC_PATH)


# ---------------------------------------------------------------------------
# User Service Integration Tests
# ---------------------------------------------------------------------------

class TestUserJourneyIsolated:
    """Full user registration journey using isolated TestClient."""

    @pytest.fixture
    def user_client(self):
        """Create isolated user service TestClient."""
        from app.main import app as user_app
        from app.database import get_session as user_get_session

        engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        SQLModel.metadata.create_all(engine)

        def override():
            with Session(engine) as session:
                yield session

        user_app.dependency_overrides[user_get_session] = override
        client = TestClient(user_app)
        yield client
        user_app.dependency_overrides.clear()

    @pytest.mark.integration
    def test_register_login_profile_update(self, user_client):
        """Test complete user lifecycle: register -> login -> profile -> update."""

        # Step 1: Register
        reg = user_client.post("/api/users/register", json={
            "email": "journey@isolated.com",
            "password": "IsolatedPass123!",
            "full_name": "Isolated Journey User"
        })
        assert reg.status_code == 201
        assert reg.json()["user"]["email"] == "journey@isolated.com"

        # Step 2: Login
        login = user_client.post("/api/users/login", json={
            "email": "journey@isolated.com",
            "password": "IsolatedPass123!"
        })
        assert login.status_code == 200
        login_token = login.json()["access_token"]

        # Step 3: Get profile
        profile = user_client.get("/api/users/me",
                                   headers={"Authorization": f"Bearer {login_token}"})
        assert profile.status_code == 200
        assert profile.json()["email"] == "journey@isolated.com"

        # Step 4: Update profile
        update = user_client.put("/api/users/me",
                                  headers={"Authorization": f"Bearer {login_token}"},
                                  json={"full_name": "Updated User", "phone": "+923009999999"})
        assert update.status_code == 200
        assert update.json()["full_name"] == "Updated User"

        # Step 5: Verify update persisted
        verify = user_client.get("/api/users/me",
                                  headers={"Authorization": f"Bearer {login_token}"})
        assert verify.json()["full_name"] == "Updated User"
        assert verify.json()["phone"] == "+923009999999"

    @pytest.mark.integration
    def test_duplicate_registration_blocked(self, user_client):
        """Test that duplicate email registration is blocked."""
        user_client.post("/api/users/register", json={
            "email": "unique@isolated.com",
            "password": "UniquePass123!",
            "full_name": "First User"
        })
        dup = user_client.post("/api/users/register", json={
            "email": "unique@isolated.com",
            "password": "DifferentPass123!",
            "full_name": "Second User"
        })
        assert dup.status_code == 400

    @pytest.mark.integration
    def test_wrong_password_login_blocked(self, user_client):
        """Test that wrong password login is blocked."""
        user_client.post("/api/users/register", json={
            "email": "secure@isolated.com",
            "password": "CorrectPass123!",
            "full_name": "Secure User"
        })
        bad_login = user_client.post("/api/users/login", json={
            "email": "secure@isolated.com",
            "password": "WrongPass123!"
        })
        assert bad_login.status_code == 401

    @pytest.mark.integration
    def test_token_reuse_across_requests(self, user_client):
        """Test that a JWT token works across multiple requests."""
        reg = user_client.post("/api/users/register", json={
            "email": "token@isolated.com",
            "password": "TokenTest123!",
            "full_name": "Token User"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Multiple profile reads should all succeed
        for _ in range(3):
            resp = user_client.get("/api/users/me", headers=headers)
            assert resp.status_code == 200
            assert resp.json()["email"] == "token@isolated.com"

    @pytest.mark.integration
    def test_invalid_token_rejected(self, user_client):
        """Test that invalid tokens are rejected."""
        headers = {"Authorization": "Bearer completely-invalid-token"}
        resp = user_client.get("/api/users/me", headers=headers)
        assert resp.status_code == 401

    @pytest.mark.integration
    def test_missing_auth_header(self, user_client):
        """Test that missing auth header returns 403."""
        resp = user_client.get("/api/users/me")
        assert resp.status_code == 403

    @pytest.mark.integration
    def test_register_returns_all_required_fields(self, user_client):
        """Test that registration response has all required fields."""
        reg = user_client.post("/api/users/register", json={
            "email": "fields@isolated.com",
            "password": "FieldTest123!",
            "full_name": "Field User"
        })
        data = reg.json()
        assert "access_token" in data
        assert "token_type" in data
        assert "user" in data
        assert data["user"]["email"] == "fields@isolated.com"
        assert data["user"]["is_active"] is True
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]

"""
User Service Unit Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- User registration (happy path, validation, duplicate email)
- User login (valid credentials, invalid password, nonexistent user, inactive user)
- Profile retrieval (authenticated, unauthenticated)
- Profile update (partial, full)
- Password hashing and verification
- JWT token creation and decoding
- Health check endpoints

All tests use SQLite in-memory database for isolation.
No external services required.
"""

import os
import sys
import pytest
from datetime import timedelta

# Add user-service to path (env vars and engine patches set in conftest.py)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend", "user-service"))

from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import User, UserCreate, UserResponse
from app.auth import hash_password, verify_password, create_access_token, decode_token


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(name="engine")
def engine_fixture():
    """Create an in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a database session tied to the test engine."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a FastAPI TestClient with overridden session."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client: TestClient):
    """Register a user and return token + user data."""
    response = client.post(
        "/api/users/register",
        json={
            "email": "registered@fatimazehra.com",
            "password": "SecurePass123!",
            "full_name": "Registered User"
        }
    )
    return response.json()


@pytest.fixture
def auth_headers(registered_user):
    """Return auth headers for authenticated requests."""
    return {"Authorization": f"Bearer {registered_user['access_token']}"}


# ---------------------------------------------------------------------------
# Auth Module Tests
# ---------------------------------------------------------------------------

class TestPasswordHashing:
    """Test password hashing and verification."""

    @pytest.mark.unit
    def test_hash_password_returns_string(self):
        """Test that hash_password returns a bcrypt hash string."""
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert hashed.startswith("$2b$")

    @pytest.mark.unit
    def test_hash_password_different_for_same_input(self):
        """Test that hashing the same password twice produces different hashes (salting)."""
        hash1 = hash_password("mypassword")
        hash2 = hash_password("mypassword")
        assert hash1 != hash2

    @pytest.mark.unit
    def test_verify_password_correct(self):
        """Test that verify_password returns True for correct password."""
        hashed = hash_password("mypassword")
        assert verify_password("mypassword", hashed) is True

    @pytest.mark.unit
    def test_verify_password_incorrect(self):
        """Test that verify_password returns False for wrong password."""
        hashed = hash_password("mypassword")
        assert verify_password("wrongpassword", hashed) is False

    @pytest.mark.unit
    def test_verify_password_empty_string(self):
        """Test verify_password with empty string."""
        hashed = hash_password("mypassword")
        assert verify_password("", hashed) is False

    @pytest.mark.unit
    def test_verify_password_invalid_hash(self):
        """Test verify_password with invalid hash returns False."""
        assert verify_password("password", "not-a-valid-hash") is False


class TestJWTToken:
    """Test JWT token creation and decoding."""

    @pytest.mark.unit
    def test_create_access_token_returns_string(self):
        """Test that create_access_token returns a JWT string."""
        token = create_access_token({"sub": "user@example.com", "id": 1})
        assert isinstance(token, str)
        assert len(token) > 50

    @pytest.mark.unit
    def test_decode_token_returns_payload(self):
        """Test that decode_token correctly decodes a valid token."""
        data = {"sub": "user@example.com", "id": 1}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user@example.com"
        assert payload["id"] == 1

    @pytest.mark.unit
    def test_decode_token_contains_expiration(self):
        """Test that decoded token contains expiration claim."""
        token = create_access_token({"sub": "user@example.com", "id": 1})
        payload = decode_token(token)
        assert "exp" in payload

    @pytest.mark.unit
    def test_decode_token_invalid_returns_none(self):
        """Test that decode_token returns None for invalid token."""
        result = decode_token("invalid.token.here")
        assert result is None

    @pytest.mark.unit
    def test_decode_token_empty_returns_none(self):
        """Test that decode_token returns None for empty string."""
        result = decode_token("")
        assert result is None

    @pytest.mark.unit
    def test_create_access_token_with_custom_expiry(self):
        """Test token creation with custom expiration."""
        token = create_access_token(
            {"sub": "user@example.com", "id": 1},
            expires_delta=timedelta(minutes=30)
        )
        payload = decode_token(token)
        assert payload is not None


# ---------------------------------------------------------------------------
# Health Endpoint Tests
# ---------------------------------------------------------------------------

class TestHealthEndpoints:
    """Test service health endpoints."""

    @pytest.mark.unit
    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint returns service info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "User Service"
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"

    @pytest.mark.unit
    def test_health_endpoint(self, client: TestClient):
        """Test health check returns ok."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Registration Tests
# ---------------------------------------------------------------------------

class TestUserRegistration:
    """Test user registration endpoint."""

    @pytest.mark.unit
    def test_register_user_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/api/users/register",
            json={
                "email": "newuser@fatimazehra.com",
                "password": "SecurePass123!",
                "full_name": "New User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "newuser@fatimazehra.com"
        assert data["user"]["full_name"] == "New User"
        assert data["user"]["is_active"] is True

    @pytest.mark.unit
    def test_register_user_returns_jwt(self, client: TestClient):
        """Test that registration returns a valid JWT."""
        response = client.post(
            "/api/users/register",
            json={
                "email": "jwt@fatimazehra.com",
                "password": "SecurePass123!",
                "full_name": "JWT User"
            }
        )
        assert response.status_code == 201
        token = response.json()["access_token"]
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "jwt@fatimazehra.com"

    @pytest.mark.unit
    def test_register_duplicate_email(self, client: TestClient):
        """Test registration with duplicate email fails."""
        user_data = {
            "email": "duplicate@fatimazehra.com",
            "password": "SecurePass123!",
            "full_name": "First User"
        }
        # First registration
        client.post("/api/users/register", json=user_data)
        # Second registration with same email
        response = client.post(
            "/api/users/register",
            json={**user_data, "full_name": "Second User"}
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.unit
    def test_register_missing_email(self, client: TestClient):
        """Test registration without email fails validation."""
        response = client.post(
            "/api/users/register",
            json={"password": "SecurePass123!", "full_name": "No Email"}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_register_missing_password(self, client: TestClient):
        """Test registration without password fails validation."""
        response = client.post(
            "/api/users/register",
            json={"email": "nopw@test.com", "full_name": "No Password"}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_register_short_password(self, client: TestClient):
        """Test registration with short password fails (min 8 chars)."""
        response = client.post(
            "/api/users/register",
            json={
                "email": "short@test.com",
                "password": "short",
                "full_name": "Short Pass"
            }
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_register_missing_full_name(self, client: TestClient):
        """Test registration without full_name fails."""
        response = client.post(
            "/api/users/register",
            json={"email": "noname@test.com", "password": "SecurePass123!"}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_register_response_excludes_password(self, client: TestClient):
        """Test that registration response never contains password."""
        response = client.post(
            "/api/users/register",
            json={
                "email": "nopw@fatimazehra.com",
                "password": "SecurePass123!",
                "full_name": "No PW Visible"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]


# ---------------------------------------------------------------------------
# Login Tests
# ---------------------------------------------------------------------------

class TestUserLogin:
    """Test user login endpoint."""

    @pytest.mark.unit
    def test_login_success(self, client: TestClient, registered_user):
        """Test successful login with valid credentials."""
        response = client.post(
            "/api/users/login",
            json={
                "email": "registered@fatimazehra.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "registered@fatimazehra.com"

    @pytest.mark.unit
    def test_login_invalid_password(self, client: TestClient, registered_user):
        """Test login with wrong password fails."""
        response = client.post(
            "/api/users/login",
            json={
                "email": "registered@fatimazehra.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    @pytest.mark.unit
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent email fails."""
        response = client.post(
            "/api/users/login",
            json={
                "email": "nobody@fatimazehra.com",
                "password": "AnyPass123!"
            }
        )
        assert response.status_code == 401

    @pytest.mark.unit
    def test_login_missing_email(self, client: TestClient):
        """Test login without email fails validation."""
        response = client.post(
            "/api/users/login",
            json={"password": "SomePass123!"}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_login_missing_password(self, client: TestClient):
        """Test login without password fails validation."""
        response = client.post(
            "/api/users/login",
            json={"email": "test@test.com"}
        )
        assert response.status_code == 422

    @pytest.mark.unit
    def test_login_returns_valid_jwt(self, client: TestClient, registered_user):
        """Test that login returns a decodable JWT."""
        response = client.post(
            "/api/users/login",
            json={
                "email": "registered@fatimazehra.com",
                "password": "SecurePass123!"
            }
        )
        token = response.json()["access_token"]
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "registered@fatimazehra.com"


# ---------------------------------------------------------------------------
# Profile Tests
# ---------------------------------------------------------------------------

class TestUserProfile:
    """Test user profile endpoints."""

    @pytest.mark.unit
    def test_get_profile_authenticated(self, client: TestClient, auth_headers):
        """Test getting profile with valid token."""
        response = client.get("/api/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "registered@fatimazehra.com"
        assert data["full_name"] == "Registered User"
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.unit
    def test_get_profile_unauthenticated(self, client: TestClient):
        """Test getting profile without token returns 403."""
        response = client.get("/api/users/me")
        assert response.status_code == 403

    @pytest.mark.unit
    def test_get_profile_invalid_token(self, client: TestClient):
        """Test getting profile with invalid token."""
        response = client.get(
            "/api/users/me",
            headers={"Authorization": "Bearer invalid-token-xyz"}
        )
        assert response.status_code == 401

    @pytest.mark.unit
    def test_update_profile_full_name(self, client: TestClient, auth_headers):
        """Test updating profile full_name."""
        response = client.put(
            "/api/users/me",
            headers=auth_headers,
            json={"full_name": "Updated Name"}
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Name"

    @pytest.mark.unit
    def test_update_profile_phone(self, client: TestClient, auth_headers):
        """Test updating profile phone number."""
        response = client.put(
            "/api/users/me",
            headers=auth_headers,
            json={"phone": "+923001234567"}
        )
        assert response.status_code == 200
        assert response.json()["phone"] == "+923001234567"

    @pytest.mark.unit
    def test_update_profile_address(self, client: TestClient, auth_headers):
        """Test updating profile address."""
        response = client.put(
            "/api/users/me",
            headers=auth_headers,
            json={"address": "456 Garden Road, Karachi"}
        )
        assert response.status_code == 200
        assert response.json()["address"] == "456 Garden Road, Karachi"

    @pytest.mark.unit
    def test_update_profile_multiple_fields(self, client: TestClient, auth_headers):
        """Test updating multiple profile fields at once."""
        response = client.put(
            "/api/users/me",
            headers=auth_headers,
            json={
                "full_name": "Complete Update",
                "phone": "+923009876543",
                "address": "789 Ocean View, Clifton"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Complete Update"
        assert data["phone"] == "+923009876543"
        assert data["address"] == "789 Ocean View, Clifton"

    @pytest.mark.unit
    def test_update_profile_unauthenticated(self, client: TestClient):
        """Test that update profile requires authentication."""
        response = client.put(
            "/api/users/me",
            json={"full_name": "Hacker"}
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Get User By ID Tests
# ---------------------------------------------------------------------------

class TestGetUserById:
    """Test public user endpoint."""

    @pytest.mark.unit
    def test_get_user_by_id(self, client: TestClient, registered_user):
        """Test getting user by ID."""
        user_id = registered_user["user"]["id"]
        response = client.get(f"/api/users/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "registered@fatimazehra.com"

    @pytest.mark.unit
    def test_get_user_not_found(self, client: TestClient):
        """Test getting nonexistent user returns 404."""
        response = client.get("/api/users/99999")
        assert response.status_code == 404

    @pytest.mark.unit
    def test_get_user_response_excludes_password(self, client: TestClient, registered_user):
        """Test that public user endpoint never shows password."""
        user_id = registered_user["user"]["id"]
        response = client.get(f"/api/users/{user_id}")
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data

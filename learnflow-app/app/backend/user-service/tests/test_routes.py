"""User Service Route Tests"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import User


# Test database
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
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


def test_register_user(client: TestClient):
    """Test user registration"""
    response = client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["full_name"] == "Test User"


def test_register_duplicate_email(client: TestClient):
    """Test registration with duplicate email"""
    # First registration
    client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )

    # Second registration with same email
    response = client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_user(client: TestClient):
    """Test user login"""
    # Register user
    client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )

    # Login
    response = client.post(
        "/api/users/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_password(client: TestClient):
    """Test login with invalid password"""
    # Register user
    client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )

    # Login with wrong password
    response = client.post(
        "/api/users/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_user(client: TestClient):
    """Test login with non-existent user"""
    response = client.post(
        "/api/users/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401


def test_get_current_user_profile(client: TestClient):
    """Test getting current user profile"""
    # Register user
    register_response = client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    token = register_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"


def test_get_profile_without_auth(client: TestClient):
    """Test getting profile without authentication"""
    response = client.get("/api/users/me")
    assert response.status_code == 403


def test_update_user_profile(client: TestClient):
    """Test updating user profile"""
    # Register user
    register_response = client.post(
        "/api/users/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    token = register_response.json()["access_token"]

    # Update profile
    response = client.put(
        "/api/users/me",
        json={
            "full_name": "Updated Name",
            "phone": "+1234567890",
            "address": "123 Main St"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "+1234567890"
    assert data["address"] == "123 Main St"


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

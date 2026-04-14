"""User Service Models - SQLModel Schemas"""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


# Database Model
class User(SQLModel, table=True):
    """User table in database"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Request Models
class UserCreate(SQLModel):
    """Schema for user registration"""
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=100)
    full_name: str = Field(max_length=255)


class UserLogin(SQLModel):
    """Schema for user login"""
    email: str = Field(max_length=255)
    password: str = Field(max_length=100)


class UserUpdate(SQLModel):
    """Schema for user profile update"""
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None)


# Response Models
class UserResponse(SQLModel):
    """Schema for user response (no password)"""
    id: int
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LoginResponse(SQLModel):
    """Schema for login response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(SQLModel):
    """Schema for JWT token data"""
    email: Optional[str] = None
    user_id: Optional[int] = None

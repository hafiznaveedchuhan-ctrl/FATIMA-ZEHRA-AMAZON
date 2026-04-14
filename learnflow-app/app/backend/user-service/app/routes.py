"""User Service Routes - API Endpoints"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .models import (
    User, UserCreate, UserLogin, UserUpdate, UserResponse, LoginResponse
)
from .database import get_session
from .auth import hash_password, verify_password, create_access_token
from .dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Register a new user

    - **email**: User email (unique)
    - **password**: Password (min 8 chars)
    - **full_name**: User's full name
    """
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    db_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        is_active=True
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    # Generate JWT token
    access_token = create_access_token(
        {"sub": db_user.email, "id": db_user.id}
    )

    return LoginResponse(
        access_token=access_token,
        user=UserResponse.from_orm(db_user)
    )


@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin, session: Session = Depends(get_session)):
    """
    Login user and get JWT token

    - **email**: User email
    - **password**: User password
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Generate JWT token
    access_token = create_access_token(
        {"sub": user.email, "id": user.id}
    )

    return LoginResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile (requires authentication)"""
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user profile (requires authentication)"""
    # Fetch fresh user from database
    user = session.exec(
        select(User).where(User.id == current_user.id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.utcnow()

    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse.from_orm(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: Session = Depends(get_session)):
    """Get user by ID (public endpoint - limited info)"""
    user = session.exec(select(User).where(User.id == user_id)).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse.from_orm(user)

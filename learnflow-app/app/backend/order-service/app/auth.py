"""JWT decoding for order-service (shared secret with user-service)."""

import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"

if len(JWT_SECRET) < 32:
    raise ValueError("JWT_SECRET must be at least 32 characters (set in .env)")

_security = HTTPBearer(auto_error=False)


def _decode(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


def get_current_user_id(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_security),
) -> int:
    """Extract verified user_id from Bearer JWT."""
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = _decode(creds.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("id")
    if not isinstance(user_id, int):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user id",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id

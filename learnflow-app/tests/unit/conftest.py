"""
Unit Test Configuration
Patches database modules and model definitions to avoid PostgreSQL/SQLModel
compatibility issues during import when using SQLite for testing.

Compatibility patches applied:
1. create_engine: strips PostgreSQL-only args (pool_size, max_overflow, pool_pre_ping)
2. Relationship: removes cascade_delete kwarg (unsupported in SQLModel 0.0.14)
3. Field: removes max_digits/decimal_places for Pydantic v2 compat
4. ChatMessage.metadata: patches dict field to use sa_column with JSON type
"""

import os
import sys

# Set environment variables FIRST - before any module imports
os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder-key-for-unit-tests"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder_for_unit_tests"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_secret"

# Add backend service paths
BACKEND_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend")

# ---------------------------------------------------------------------------
# Patch 1: create_engine - strip PostgreSQL-only args for SQLite
# ---------------------------------------------------------------------------

import sqlmodel
_original_create_engine = sqlmodel.create_engine


def _patched_create_engine(url, **kwargs):
    """Wrapper that strips PostgreSQL-only args when using SQLite."""
    if str(url).startswith("sqlite"):
        kwargs.pop("pool_size", None)
        kwargs.pop("max_overflow", None)
        kwargs.pop("pool_pre_ping", None)
        kwargs.pop("echo", None)
        # Fix connect_args for SQLite
        kwargs["connect_args"] = {"check_same_thread": False}
    return _original_create_engine(url, **kwargs)


sqlmodel.create_engine = _patched_create_engine

import sqlalchemy
_original_sa_create_engine = sqlalchemy.create_engine


def _patched_sa_create_engine(url, **kwargs):
    if str(url).startswith("sqlite"):
        kwargs.pop("pool_size", None)
        kwargs.pop("max_overflow", None)
        kwargs.pop("pool_pre_ping", None)
        kwargs.pop("echo", None)
        kwargs["connect_args"] = {"check_same_thread": False}
    return _original_sa_create_engine(url, **kwargs)


sqlalchemy.create_engine = _patched_sa_create_engine

import sqlmodel.main
if hasattr(sqlmodel.main, "create_engine"):
    sqlmodel.main.create_engine = _patched_create_engine

# ---------------------------------------------------------------------------
# Patch 2: Relationship - remove cascade_delete (not in SQLModel 0.0.14)
# ---------------------------------------------------------------------------

_original_relationship = sqlmodel.Relationship


def _patched_relationship(**kwargs):
    """Remove cascade_delete kwarg that is not supported in SQLModel 0.0.14."""
    kwargs.pop("cascade_delete", None)
    return _original_relationship(**kwargs)


sqlmodel.Relationship = _patched_relationship

# Also patch in the sqlmodel.main module where models import from
if hasattr(sqlmodel.main, "Relationship"):
    sqlmodel.main.Relationship = _patched_relationship

# ---------------------------------------------------------------------------
# Patch 3: Field - remove max_digits/decimal_places for Pydantic v2
# ---------------------------------------------------------------------------

_original_field = sqlmodel.Field


def _patched_field(*args, **kwargs):
    """Remove max_digits/decimal_places which are incompatible with
    SQLModel 0.0.14 + Pydantic v2 on non-table models."""
    kwargs.pop("max_digits", None)
    kwargs.pop("decimal_places", None)
    return _original_field(*args, **kwargs)


sqlmodel.Field = _patched_field

if hasattr(sqlmodel.main, "Field"):
    sqlmodel.main.Field = _patched_field

# ---------------------------------------------------------------------------
# Patch 4: ChatMessage metadata field - dict has no SQLAlchemy mapping
# We patch SQLModel's get_sqlalchemy_type to handle dict -> JSON
# ---------------------------------------------------------------------------

from sqlalchemy import JSON as SA_JSON

if hasattr(sqlmodel.main, "get_sqlalchemy_type"):
    _original_get_sa_type = sqlmodel.main.get_sqlalchemy_type

    def _patched_get_sa_type(field):
        """Return JSON type for dict fields instead of raising."""
        try:
            return _original_get_sa_type(field)
        except ValueError as e:
            if "dict" in str(e).lower():
                return SA_JSON()
            raise

    sqlmodel.main.get_sqlalchemy_type = _patched_get_sa_type

# ---------------------------------------------------------------------------
# Patch 5: Allow 'metadata' field name in SQLAlchemy Declarative models
# The ChatMessage model uses 'metadata' which is reserved by SQLAlchemy.
# We patch _ClassScanMapperConfig._extract_mappable_attributes to skip
# the reservation check for 'metadata'.
# ---------------------------------------------------------------------------

from sqlalchemy.orm import decl_base as _decl_base

if hasattr(_decl_base, "_ClassScanMapperConfig"):
    _OrigMapper = _decl_base._ClassScanMapperConfig
    _orig_extract = _OrigMapper._extract_mappable_attributes

    def _patched_extract(self):
        """Patch that catches the 'metadata' reserved error and handles it
        by removing the metadata attribute from the class mapping."""
        try:
            return _orig_extract(self)
        except Exception as e:
            if "metadata" in str(e) and "reserved" in str(e):
                # Remove the problematic 'metadata' attribute and retry
                if hasattr(self.cls, "metadata") and not isinstance(
                    getattr(self.cls, "metadata"), sqlalchemy.MetaData
                ):
                    # Store original, replace with None to skip mapping
                    _meta_val = self.cls.__dict__.get("metadata")
                    if _meta_val is not None:
                        # Remove from annotations to prevent mapping
                        if hasattr(self.cls, "__annotations__") and "metadata" in self.cls.__annotations__:
                            del self.cls.__annotations__["metadata"]
                        return _orig_extract(self)
                raise

    _OrigMapper._extract_mappable_attributes = _patched_extract

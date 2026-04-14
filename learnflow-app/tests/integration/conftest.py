"""
Integration Test Configuration
Same SQLModel/SQLAlchemy patches as unit tests, needed for isolated integration
tests that use TestClient with SQLite in-memory databases.
"""

import os
import sys

# Set environment variables FIRST
os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder-key-for-unit-tests"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder_for_unit_tests"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_secret"

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
# Patch 2: Relationship - remove cascade_delete
# ---------------------------------------------------------------------------

_original_relationship = sqlmodel.Relationship


def _patched_relationship(**kwargs):
    kwargs.pop("cascade_delete", None)
    return _original_relationship(**kwargs)


sqlmodel.Relationship = _patched_relationship
if hasattr(sqlmodel.main, "Relationship"):
    sqlmodel.main.Relationship = _patched_relationship

# ---------------------------------------------------------------------------
# Patch 3: Field - remove max_digits/decimal_places
# ---------------------------------------------------------------------------

_original_field = sqlmodel.Field


def _patched_field(*args, **kwargs):
    kwargs.pop("max_digits", None)
    kwargs.pop("decimal_places", None)
    return _original_field(*args, **kwargs)


sqlmodel.Field = _patched_field
if hasattr(sqlmodel.main, "Field"):
    sqlmodel.main.Field = _patched_field

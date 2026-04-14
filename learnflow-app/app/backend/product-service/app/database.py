"""Database Configuration - Neon PostgreSQL"""

import os
from typing import Generator
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel, create_engine, Session

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/learnflow")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10}
)

# For Netlify (serverless), use NullPool to avoid connection issues
if os.getenv("ENVIRONMENT") == "production":
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        poolclass=NullPool,
        connect_args={"connect_timeout": 10}
    )


def init_db():
    """Initialize database - create all tables"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency injection for database session"""
    with Session(engine) as session:
        yield session

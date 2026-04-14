"""Product Service Models - SQLModel Schemas"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import Numeric


# Database Models
class Category(SQLModel, table=True):
    """Product category table"""
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=100)
    description: Optional[str] = Field(default=None)
    image_url: Optional[str] = Field(default=None, max_length=500)

    # Relationships
    products: list["Product"] = Relationship(back_populates="category")


class Product(SQLModel, table=True):
    """Product table"""
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None)
    price: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2)))
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    image_url: Optional[str] = Field(default=None, max_length=500)
    stock_quantity: int = Field(default=0)
    is_active: bool = Field(default=True, index=True)
    featured: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    category: Optional[Category] = Relationship(back_populates="products")


# Request Models
class CategoryCreate(SQLModel):
    """Create category"""
    name: str = Field(max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)


class CategoryUpdate(SQLModel):
    """Update category"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)


class ProductCreate(SQLModel):
    """Create product"""
    name: str = Field(max_length=255)
    description: Optional[str] = None
    price: Decimal = Field()
    category_id: Optional[int] = None
    image_url: Optional[str] = Field(None, max_length=500)
    stock_quantity: int = Field(default=0)
    featured: bool = Field(default=False)


class ProductUpdate(SQLModel):
    """Update product"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None)
    category_id: Optional[int] = None
    image_url: Optional[str] = Field(None, max_length=500)
    stock_quantity: Optional[int] = None
    featured: Optional[bool] = None
    is_active: Optional[bool] = None


# Response Models
class CategoryResponse(SQLModel):
    """Category response"""
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]


class ProductResponse(SQLModel):
    """Product response"""
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    category_id: Optional[int]
    category: Optional[CategoryResponse]
    image_url: Optional[str]
    stock_quantity: int
    is_active: bool
    featured: bool
    created_at: datetime
    updated_at: datetime


class ProductListResponse(SQLModel):
    """Product list response"""
    products: list[ProductResponse]
    total: int
    skip: int
    limit: int

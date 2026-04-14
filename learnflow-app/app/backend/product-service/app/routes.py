"""Product Service Routes - API Endpoints"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func

from .models import (
    Category, Product,
    CategoryCreate, CategoryUpdate,
    ProductCreate, ProductUpdate,
    CategoryResponse, ProductResponse, ProductListResponse
)
from .database import get_session

router = APIRouter(tags=["products"])


# Category Endpoints
@router.get("/api/categories", response_model=list[CategoryResponse])
async def list_categories(session: Session = Depends(get_session)):
    """Get all product categories"""
    categories = session.exec(select(Category)).all()
    return categories


@router.get("/api/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, session: Session = Depends(get_session)):
    """Get category by ID"""
    category = session.exec(
        select(Category).where(Category.id == category_id)
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return category


@router.post("/api/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session)
):
    """Create new category"""
    existing = session.exec(
        select(Category).where(Category.name == category_data.name)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists"
        )

    db_category = Category(**category_data.dict())
    session.add(db_category)
    session.commit()
    session.refresh(db_category)

    return db_category


# Product Endpoints
@router.get("/api/products", response_model=ProductListResponse)
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    session: Session = Depends(get_session)
):
    """
    List products with filtering and search

    - **skip**: Number of products to skip (pagination)
    - **limit**: Number of products to return (default 10, max 100)
    - **category_id**: Filter by category
    - **featured**: Filter featured products
    - **search**: Search in product name/description
    - **min_price**: Filter by minimum price
    - **max_price**: Filter by maximum price
    """
    query = select(Product).where(Product.is_active == True)

    # Apply filters
    if category_id:
        query = query.where(Product.category_id == category_id)

    if featured is not None:
        query = query.where(Product.featured == featured)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_term)) |
            (Product.description.ilike(search_term))
        )

    if min_price is not None:
        query = query.where(Product.price >= min_price)

    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Get total count
    total = session.exec(select(func.count(Product.id)).select_from(Product)).one()

    # Apply pagination
    products = session.exec(query.offset(skip).limit(limit)).all()

    return ProductListResponse(
        products=[ProductResponse.from_orm(p) for p in products],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/api/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, session: Session = Depends(get_session)):
    """Get product by ID"""
    product = session.exec(
        select(Product).where(
            (Product.id == product_id) &
            (Product.is_active == True)
        )
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return ProductResponse.from_orm(product)


@router.post("/api/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    session: Session = Depends(get_session)
):
    """Create new product (admin only - requires admin token in production)"""
    # Validate category exists
    if product_data.category_id:
        category = session.exec(
            select(Category).where(Category.id == product_data.category_id)
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

    db_product = Product(**product_data.dict())
    session.add(db_product)
    session.commit()
    session.refresh(db_product)

    return ProductResponse.from_orm(db_product)


@router.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Session = Depends(get_session)
):
    """Update product (admin only - requires admin token in production)"""
    product = session.exec(
        select(Product).where(Product.id == product_id)
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Validate category if changing it
    if product_data.category_id:
        category = session.exec(
            select(Category).where(Category.id == product_data.category_id)
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    product.updated_at = datetime.utcnow()

    session.add(product)
    session.commit()
    session.refresh(product)

    return ProductResponse.from_orm(product)


@router.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: Session = Depends(get_session)
):
    """Delete product (actually disables it - soft delete)"""
    product = session.exec(
        select(Product).where(Product.id == product_id)
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product.is_active = False
    product.updated_at = datetime.utcnow()

    session.add(product)
    session.commit()

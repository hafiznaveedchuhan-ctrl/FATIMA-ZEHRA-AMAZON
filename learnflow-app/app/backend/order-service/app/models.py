"""Order Service Models - SQLModel Schemas"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import Numeric, ForeignKey


# Database Models
class Cart(SQLModel, table=True):
    """Shopping cart table"""
    __tablename__ = "carts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    items: list["CartItem"] = Relationship(
        back_populates="cart",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class CartItem(SQLModel, table=True):
    """Cart items table"""
    __tablename__ = "cart_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="carts.id", index=True)
    product_id: int = Field(index=True)
    quantity: int = Field(default=1, ge=1)
    price: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2)))

    # Relationships
    cart: Optional[Cart] = Relationship(back_populates="items")


class Order(SQLModel, table=True):
    """Orders table"""
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    status: str = Field(default="pending", max_length=50, index=True)
    total_amount: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2)))
    shipping_address: str
    payment_status: str = Field(default="pending", max_length=50)
    payment_intent_id: Optional[str] = Field(default=None, max_length=255, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    items: list["OrderItem"] = Relationship(
        back_populates="order",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class OrderItem(SQLModel, table=True):
    """Order items table"""
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", index=True)
    product_id: int = Field(index=True)
    product_name: str = Field(max_length=255)
    quantity: int = Field(ge=1)
    price: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2)))

    # Relationships
    order: Optional[Order] = Relationship(back_populates="items")


# Request Models
class AddToCartRequest(SQLModel):
    """Add item to cart"""
    product_id: int
    quantity: int = Field(default=1, ge=1)
    price: Decimal = Field(max_digits=10, decimal_places=2)


class UpdateCartItemRequest(SQLModel):
    """Update cart item quantity"""
    quantity: int = Field(ge=1)


class CheckoutRequest(SQLModel):
    """Create order from cart"""
    shipping_address: str


class CreatePaymentIntentRequest(SQLModel):
    """Create Stripe PaymentIntent request body"""
    order_id: int
    amount: float = Field(gt=0)
    customer_email: str
    customer_name: str


# Response Models
class CartItemResponse(SQLModel):
    """Cart item response"""
    id: int
    product_id: int
    quantity: int
    price: Decimal


class CartResponse(SQLModel):
    """Cart response"""
    id: int
    user_id: int
    items: list[CartItemResponse]
    total_amount: Decimal
    item_count: int


class OrderItemResponse(SQLModel):
    """Order item response"""
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: Decimal


class OrderResponse(SQLModel):
    """Order response"""
    id: int
    user_id: int
    status: str
    total_amount: Decimal
    shipping_address: str
    payment_status: str
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

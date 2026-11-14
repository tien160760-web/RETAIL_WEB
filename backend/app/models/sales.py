from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.catalog import ProductVariant
    from app.models.rbac import Branch, User


class Cart(Base):
    __tablename__ = "carts"

    cart_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), unique=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(back_populates="cart")


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (Index("ix_cart_items_cart_variant", "cart_id", "variant_id", unique=True),)

    cart_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.cart_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    cart: Mapped["Cart"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship(back_populates="cart_items")


class Coupon(Base):
    __tablename__ = "coupons"

    coupon_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    discount_type: Mapped[str] = mapped_column(String(20), nullable=False)
    discount_value: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    min_order_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0"), server_default="0", nullable=False
    )
    max_discount_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        default=True, server_default="true", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="coupon")


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    processed_by_staff_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    coupon_id: Mapped[int | None] = mapped_column(ForeignKey("coupons.coupon_id"), nullable=True)
    recipient_name: Mapped[str] = mapped_column(String(100), nullable=False)
    recipient_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    shipping_address: Mapped[str] = mapped_column(Text, nullable=False)
    subtotal_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0"), server_default="0", nullable=False
    )
    shipping_fee: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0"), server_default="0", nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    payment_status: Mapped[str] = mapped_column(
        String(30), default="UNPAID", server_default="UNPAID", nullable=False
    )
    order_status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING_CONFIRMATION",
        server_default="PENDING_CONFIRMATION",
        nullable=False,
    )
    cancel_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancelled_by: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    customer: Mapped["User"] = relationship(foreign_keys=[customer_user_id])
    branch: Mapped["Branch"] = relationship()
    processed_by: Mapped["User | None"] = relationship(foreign_keys=[processed_by_staff_id])
    coupon: Mapped["Coupon | None"] = relationship(back_populates="orders")
    cancelling_user: Mapped["User | None"] = relationship(foreign_keys=[cancelled_by])
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order")
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(back_populates="order")
    payments: Mapped[list["Payment"]] = relationship(back_populates="order")
    shipment: Mapped["Shipment | None"] = relationship(back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (Index("ix_order_items_order_variant", "order_id", "variant_id", unique=True),)

    order_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship(back_populates="order_items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    history_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_by: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    order: Mapped["Order"] = relationship(back_populates="status_history")
    changed_by_user: Mapped["User | None"] = relationship(foreign_keys=[changed_by])


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    transaction_ref: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", server_default="PENDING", nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    order: Mapped["Order"] = relationship(back_populates="payments")


class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.order_id"), unique=True, nullable=False
    )
    carrier_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tracking_number: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    shipping_status: Mapped[str] = mapped_column(
        String(30), default="WAITING_PICKUP", server_default="WAITING_PICKUP", nullable=False
    )
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order: Mapped["Order"] = relationship(back_populates="shipment")
    updater: Mapped["User | None"] = relationship(foreign_keys=[updated_by])

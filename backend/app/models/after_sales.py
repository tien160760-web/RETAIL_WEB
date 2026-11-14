from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.catalog import Product, ProductVariant
    from app.models.rbac import Branch, User
    from app.models.sales import Coupon, Order, OrderItem


class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    usage_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    coupon_id: Mapped[int] = mapped_column(ForeignKey("coupons.coupon_id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.order_id"), unique=True, nullable=False
    )
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    coupon: Mapped["Coupon"] = relationship()
    user: Mapped["User"] = relationship()
    order: Mapped["Order"] = relationship()


class ProductReview(Base):
    __tablename__ = "product_reviews"
    __table_args__ = (
        Index("ix_product_reviews_product_id", "product_id"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_product_reviews_rating_range"),
    )

    review_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_item_id: Mapped[int] = mapped_column(
        ForeignKey("order_items.order_item_id"), unique=True, nullable=False
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    order_item: Mapped["OrderItem"] = relationship(back_populates="product_review")
    user: Mapped["User"] = relationship()
    product: Mapped["Product"] = relationship()


class Return(Base, TimestampMixin):
    __tablename__ = "returns"
    __table_args__ = (
        Index("ix_returns_order_id", "order_id"),
        Index("ix_returns_return_branch_id", "return_branch_id"),
    )

    return_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    return_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"), nullable=False)
    customer_user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    return_branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.branch_id"), nullable=False
    )
    processed_by_staff_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_images: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="REQUESTED", server_default="REQUESTED", nullable=False
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped["Order"] = relationship(back_populates="returns")
    customer: Mapped["User"] = relationship(foreign_keys=[customer_user_id])
    branch: Mapped["Branch"] = relationship(foreign_keys=[return_branch_id])
    processed_by: Mapped["User | None"] = relationship(foreign_keys=[processed_by_staff_id])
    items: Mapped[list["ReturnItem"]] = relationship(
        back_populates="return_record", cascade="all, delete-orphan"
    )
    refund: Mapped["Refund | None"] = relationship(back_populates="return_record")


class ReturnItem(Base):
    __tablename__ = "return_items"
    __table_args__ = (
        Index("ix_return_items_return_order_item", "return_id", "order_item_id", unique=True),
        CheckConstraint(
            "requested_qty > 0 "
            "AND (received_qty IS NULL OR received_qty >= 0) "
            "AND (restock_qty IS NULL OR restock_qty >= 0) "
            "AND (received_qty IS NULL OR restock_qty IS NULL OR restock_qty <= received_qty)",
            name="chk_return_items_quantity_valid",
        ),
    )

    return_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    return_id: Mapped[int] = mapped_column(ForeignKey("returns.return_id"), nullable=False)
    order_item_id: Mapped[int] = mapped_column(
        ForeignKey("order_items.order_item_id"), nullable=False
    )
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    requested_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    received_qty: Mapped[int | None] = mapped_column(
        Integer, default=0, server_default="0", nullable=True
    )
    restock_qty: Mapped[int | None] = mapped_column(
        Integer, default=0, server_default="0", nullable=True
    )
    item_condition: Mapped[str | None] = mapped_column(String(50), nullable=True)
    refund_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0"), server_default="0", nullable=False
    )

    return_record: Mapped["Return"] = relationship(back_populates="items")
    order_item: Mapped["OrderItem"] = relationship()
    variant: Mapped["ProductVariant"] = relationship()


class Refund(Base):
    __tablename__ = "refunds"

    refund_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"), nullable=False)
    return_id: Mapped[int | None] = mapped_column(
        ForeignKey("returns.return_id"), unique=True, nullable=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    refund_method: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", server_default="PENDING", nullable=False
    )
    processed_by: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    transaction_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    order: Mapped["Order"] = relationship(back_populates="refunds")
    return_record: Mapped["Return | None"] = relationship(back_populates="refund")
    processor: Mapped["User | None"] = relationship(foreign_keys=[processed_by])

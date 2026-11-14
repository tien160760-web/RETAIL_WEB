from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.catalog import ProductVariant, Supplier
    from app.models.rbac import Branch, User


class InventoryLevel(Base):
    __tablename__ = "inventory_levels"
    __table_args__ = (
        Index("ix_inventory_levels_branch_variant", "branch_id", "variant_id", unique=True),
        Index("ix_inventory_levels_variant_id", "variant_id"),
        CheckConstraint(
            "on_hand_qty >= 0 AND reserved_qty >= 0 AND reserved_qty <= on_hand_qty",
            name="chk_inventory_levels_qty_valid",
        ),
        CheckConstraint(
            "reorder_level >= 0", name="chk_inventory_levels_reorder_non_negative"
        ),
    )

    inventory_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    on_hand_qty: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    reserved_qty: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    reorder_level: Mapped[int] = mapped_column(
        Integer, default=5, server_default="5", nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    branch: Mapped["Branch"] = relationship()
    variant: Mapped["ProductVariant"] = relationship(back_populates="inventory_levels")

    @property
    def available_qty(self) -> int:
        return self.on_hand_qty - self.reserved_qty


class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"
    __table_args__ = (
        Index("ix_purchase_orders_supplier_id", "supplier_id"),
        Index("ix_purchase_orders_branch_id", "branch_id"),
        CheckConstraint("total_amount >= 0", name="chk_purchase_orders_total_non_negative"),
    )

    po_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    po_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.supplier_id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    expected_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0"), server_default="0", nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING_RECEIPT", server_default="PENDING_RECEIPT", nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    supplier: Mapped["Supplier"] = relationship(back_populates="purchase_orders")
    branch: Mapped["Branch"] = relationship()
    creator: Mapped["User"] = relationship(foreign_keys=[created_by])
    items: Mapped[list["PurchaseOrderItem"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )
    receipts: Mapped[list["PurchaseReceipt"]] = relationship(back_populates="purchase_order")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    __table_args__ = (
        Index("ix_purchase_order_items_po_variant", "po_id", "variant_id", unique=True),
        CheckConstraint(
            "ordered_qty > 0 AND received_qty >= 0 AND received_qty <= ordered_qty",
            name="chk_po_items_qty_valid",
        ),
        CheckConstraint(
            "unit_cost > 0 AND line_total >= 0", name="chk_po_items_cost_valid"
        ),
    )

    po_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    po_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.po_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    ordered_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    received_qty: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship(back_populates="purchase_order_items")


class PurchaseReceipt(Base):
    __tablename__ = "purchase_receipts"
    __table_args__ = (
        Index("ix_purchase_receipts_po_id", "po_id"),
        Index("ix_purchase_receipts_branch_id", "branch_id"),
    )

    receipt_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    po_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.po_id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    received_by: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="receipts")
    branch: Mapped["Branch"] = relationship()
    receiver: Mapped["User"] = relationship(foreign_keys=[received_by])
    items: Mapped[list["PurchaseReceiptItem"]] = relationship(
        back_populates="receipt", cascade="all, delete-orphan"
    )


class PurchaseReceiptItem(Base):
    __tablename__ = "purchase_receipt_items"
    __table_args__ = (
        Index("ix_purchase_receipt_items_receipt_variant", "receipt_id", "variant_id", unique=True),
        CheckConstraint(
            "received_qty > 0 AND unit_cost > 0",
            name="chk_receipt_items_qty_cost_valid",
        ),
    )

    receipt_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    receipt_id: Mapped[int] = mapped_column(ForeignKey("purchase_receipts.receipt_id"), nullable=False)
    po_item_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_order_items.po_item_id"), nullable=False
    )
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    received_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    receipt: Mapped["PurchaseReceipt"] = relationship(back_populates="items")
    po_item: Mapped["PurchaseOrderItem"] = relationship()
    variant: Mapped["ProductVariant"] = relationship(back_populates="purchase_receipt_items")


class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    __table_args__ = (
        Index("ix_stock_transfers_from_branch_id", "from_branch_id"),
        Index("ix_stock_transfers_to_branch_id", "to_branch_id"),
        Index("ix_stock_transfers_status", "status"),
        CheckConstraint(
            "from_branch_id <> to_branch_id",
            name="chk_stock_transfers_different_branches",
        ),
    )

    transfer_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transfer_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    from_branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.branch_id"), nullable=False
    )
    to_branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    approved_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    received_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", server_default="PENDING", nullable=False
    )
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    from_branch: Mapped["Branch"] = relationship(foreign_keys=[from_branch_id])
    to_branch: Mapped["Branch"] = relationship(foreign_keys=[to_branch_id])
    requester: Mapped["User"] = relationship(foreign_keys=[requested_by])
    approver: Mapped["User | None"] = relationship(foreign_keys=[approved_by])
    receiver: Mapped["User | None"] = relationship(foreign_keys=[received_by])
    items: Mapped[list["StockTransferItem"]] = relationship(
        back_populates="transfer", cascade="all, delete-orphan"
    )


class StockTransferItem(Base):
    __tablename__ = "stock_transfer_items"
    __table_args__ = (
        Index("ix_stock_transfer_items_transfer_variant", "transfer_id", "variant_id", unique=True),
        CheckConstraint(
            "shipped_qty > 0 AND (received_qty IS NULL OR received_qty >= 0)",
            name="chk_transfer_items_qty_valid",
        ),
    )

    transfer_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transfer_id: Mapped[int] = mapped_column(ForeignKey("stock_transfers.transfer_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    shipped_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    received_qty: Mapped[int | None] = mapped_column(
        Integer, default=0, server_default="0", nullable=True
    )

    transfer: Mapped["StockTransfer"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship(back_populates="stock_transfer_items")


class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"

    adjustment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    adjustment_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    approved_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING_APPROVAL", server_default="PENDING_APPROVAL", nullable=False
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    branch: Mapped["Branch"] = relationship()
    creator: Mapped["User"] = relationship(foreign_keys=[created_by])
    approver: Mapped["User | None"] = relationship(foreign_keys=[approved_by])
    items: Mapped[list["InventoryAdjustmentItem"]] = relationship(
        back_populates="adjustment", cascade="all, delete-orphan"
    )


class InventoryAdjustmentItem(Base):
    __tablename__ = "inventory_adjustment_items"
    __table_args__ = (
        Index(
            "ix_inventory_adjustment_items_adjustment_variant",
            "adjustment_id",
            "variant_id",
            unique=True,
        ),
        CheckConstraint(
            "system_qty >= 0 AND actual_qty >= 0 AND diff_qty = actual_qty - system_qty",
            name="chk_adjustment_items_qty_valid",
        ),
    )

    adjustment_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    adjustment_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_adjustments.adjustment_id"), nullable=False
    )
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    system_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    diff_qty: Mapped[int] = mapped_column(Integer, nullable=False)

    adjustment: Mapped["InventoryAdjustment"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship(
        back_populates="inventory_adjustment_items"
    )


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (
        Index(
            "idx_stock_movements_branch_variant_time",
            "branch_id",
            "variant_id",
            text("created_at DESC"),
        ),
        Index("ix_stock_movements_variant_id", "variant_id"),
        CheckConstraint(
            "qty_change <> 0 AND balance_after >= 0",
            name="chk_stock_movements_valid",
        ),
    )

    movement_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.branch_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.variant_id"), nullable=False
    )
    movement_type: Mapped[str] = mapped_column(String(40), nullable=False)
    reference_type: Mapped[str] = mapped_column(String(50), nullable=False)
    reference_id: Mapped[int] = mapped_column(Integer, nullable=False)
    qty_change: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    branch: Mapped["Branch"] = relationship()
    variant: Mapped["ProductVariant"] = relationship(back_populates="stock_movements")
    creator: Mapped["User | None"] = relationship(foreign_keys=[created_by])

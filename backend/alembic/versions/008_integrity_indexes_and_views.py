"""Add model checks, query indexes, and reporting views."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "chk_inventory_levels_qty_valid",
        "inventory_levels",
        "on_hand_qty >= 0 AND reserved_qty >= 0 AND reserved_qty <= on_hand_qty",
    )
    op.create_check_constraint(
        "chk_inventory_levels_reorder_non_negative",
        "inventory_levels",
        "reorder_level >= 0",
    )
    op.create_check_constraint(
        "chk_purchase_orders_total_non_negative",
        "purchase_orders",
        "total_amount >= 0",
    )
    op.create_check_constraint(
        "chk_po_items_qty_valid",
        "purchase_order_items",
        "ordered_qty > 0 AND received_qty >= 0 AND received_qty <= ordered_qty",
    )
    op.create_check_constraint(
        "chk_po_items_cost_valid",
        "purchase_order_items",
        "unit_cost > 0 AND line_total >= 0",
    )
    op.create_check_constraint(
        "chk_receipt_items_qty_cost_valid",
        "purchase_receipt_items",
        "received_qty > 0 AND unit_cost > 0",
    )
    op.create_check_constraint(
        "chk_stock_transfers_different_branches",
        "stock_transfers",
        "from_branch_id <> to_branch_id",
    )
    op.create_check_constraint(
        "chk_transfer_items_qty_valid",
        "stock_transfer_items",
        "shipped_qty > 0 AND (received_qty IS NULL OR received_qty >= 0)",
    )
    op.create_check_constraint(
        "chk_adjustment_items_qty_valid",
        "inventory_adjustment_items",
        "system_qty >= 0 AND actual_qty >= 0 AND diff_qty = actual_qty - system_qty",
    )
    op.create_check_constraint(
        "chk_stock_movements_valid",
        "stock_movements",
        "qty_change <> 0 AND balance_after >= 0",
    )
    op.create_check_constraint(
        "chk_cart_items_quantity_positive",
        "cart_items",
        "quantity > 0",
    )
    op.create_check_constraint(
        "chk_coupons_dates_and_discount",
        "coupons",
        "end_date > start_date AND discount_value > 0",
    )
    op.create_check_constraint(
        "chk_order_items_quantity_positive",
        "order_items",
        "quantity > 0",
    )
    op.create_check_constraint(
        "chk_product_reviews_rating_range",
        "product_reviews",
        "rating BETWEEN 1 AND 5",
    )
    op.create_check_constraint(
        "chk_return_items_quantity_valid",
        "return_items",
        "requested_qty > 0 "
        "AND (received_qty IS NULL OR received_qty >= 0) "
        "AND (restock_qty IS NULL OR restock_qty >= 0) "
        "AND (received_qty IS NULL OR restock_qty IS NULL OR restock_qty <= received_qty)",
    )

    indexes = (
        ("idx_products_category_active_price", "products", "(category_id, is_active, base_price)"),
        ("ix_product_variants_product_id", "product_variants", "(product_id)"),
        ("ix_product_images_product_id", "product_images", "(product_id)"),
        ("ix_product_images_variant_id", "product_images", "(variant_id)"),
        ("ix_purchase_orders_supplier_id", "purchase_orders", "(supplier_id)"),
        ("ix_purchase_orders_branch_id", "purchase_orders", "(branch_id)"),
        ("ix_purchase_receipts_po_id", "purchase_receipts", "(po_id)"),
        ("ix_purchase_receipts_branch_id", "purchase_receipts", "(branch_id)"),
        ("ix_stock_transfers_from_branch_id", "stock_transfers", "(from_branch_id)"),
        ("ix_stock_transfers_to_branch_id", "stock_transfers", "(to_branch_id)"),
        ("ix_stock_transfers_status", "stock_transfers", "(status)"),
        ("idx_stock_movements_branch_variant_time", "stock_movements", "(branch_id, variant_id, created_at DESC)"),
        ("ix_stock_movements_variant_id", "stock_movements", "(variant_id)"),
        ("idx_orders_branch_status_created", "orders", "(branch_id, order_status, created_at DESC)"),
        ("idx_orders_customer_created", "orders", "(customer_user_id, created_at DESC)"),
        ("ix_order_items_variant_id", "order_items", "(variant_id)"),
        ("ix_order_status_history_order_id", "order_status_history", "(order_id)"),
        ("ix_payments_order_id", "payments", "(order_id)"),
        ("ix_product_reviews_product_id", "product_reviews", "(product_id)"),
        ("ix_returns_order_id", "returns", "(order_id)"),
        ("ix_returns_return_branch_id", "returns", "(return_branch_id)"),
    )
    for name, table, columns in indexes:
        op.execute(
            sa.text(
                f"CREATE INDEX IF NOT EXISTS {name} ON {table} {columns}"
            )
        )

    op.execute(
        """
        CREATE OR REPLACE VIEW vw_branch_daily_sales_report AS
        SELECT
            b.branch_id,
            b.branch_code,
            b.branch_name,
            DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS report_date,
            COUNT(DISTINCT o.order_id) AS total_orders,
            SUM(oi.quantity) AS total_items_sold,
            SUM(o.subtotal_amount) AS gross_sales,
            SUM(o.discount_amount) AS total_discounts,
            SUM(o.total_amount - o.shipping_fee) AS net_revenue,
            SUM(oi.quantity * oi.unit_cost) AS total_cogs,
            SUM((oi.quantity * oi.unit_price) - (oi.quantity * oi.unit_cost))
                - SUM(DISTINCT o.discount_amount) AS gross_profit
        FROM branches b
        JOIN orders o ON b.branch_id = o.branch_id
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_status = 'COMPLETED'
          AND o.payment_status = 'PAID'
        GROUP BY
            b.branch_id,
            b.branch_code,
            b.branch_name,
            DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
        """
    )
    op.execute(
        """
        CREATE OR REPLACE VIEW vw_branch_inventory_status AS
        SELECT
            il.inventory_id,
            b.branch_id,
            b.branch_code,
            b.branch_name,
            p.product_id,
            p.product_name,
            c.category_name,
            pv.variant_id,
            pv.sku,
            pv.color,
            pv.size,
            pv.price AS retail_price,
            pv.cost_price,
            il.on_hand_qty,
            il.reserved_qty,
            (il.on_hand_qty - il.reserved_qty) AS available_qty,
            il.reorder_level,
            CASE
                WHEN (il.on_hand_qty - il.reserved_qty) <= 0 THEN 'OUT_OF_STOCK'
                WHEN (il.on_hand_qty - il.reserved_qty) <= il.reorder_level THEN 'LOW_STOCK'
                ELSE 'IN_STOCK'
            END AS stock_status
        FROM inventory_levels il
        JOIN branches b ON il.branch_id = b.branch_id
        JOIN product_variants pv ON il.variant_id = pv.variant_id
        JOIN products p ON pv.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id
        """
    )


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS vw_branch_inventory_status")
    op.execute("DROP VIEW IF EXISTS vw_branch_daily_sales_report")

    indexes = (
        "ix_returns_return_branch_id",
        "ix_returns_order_id",
        "ix_product_reviews_product_id",
        "ix_payments_order_id",
        "ix_order_status_history_order_id",
        "ix_order_items_variant_id",
        "idx_orders_customer_created",
        "idx_orders_branch_status_created",
        "ix_stock_movements_variant_id",
        "idx_stock_movements_branch_variant_time",
        "ix_stock_transfers_status",
        "ix_stock_transfers_to_branch_id",
        "ix_stock_transfers_from_branch_id",
        "ix_purchase_receipts_branch_id",
        "ix_purchase_receipts_po_id",
        "ix_purchase_orders_branch_id",
        "ix_purchase_orders_supplier_id",
        "ix_product_images_variant_id",
        "ix_product_images_product_id",
        "ix_product_variants_product_id",
        "idx_products_category_active_price",
    )
    for name in indexes:
        op.execute(sa.text(f"DROP INDEX IF EXISTS {name}"))

    op.drop_constraint("chk_return_items_quantity_valid", "return_items", type_="check")
    op.drop_constraint(
        "chk_product_reviews_rating_range", "product_reviews", type_="check"
    )
    op.drop_constraint(
        "chk_order_items_quantity_positive", "order_items", type_="check"
    )
    op.drop_constraint(
        "chk_coupons_dates_and_discount", "coupons", type_="check"
    )
    op.drop_constraint(
        "chk_cart_items_quantity_positive", "cart_items", type_="check"
    )
    op.drop_constraint("chk_stock_movements_valid", "stock_movements", type_="check")
    op.drop_constraint(
        "chk_adjustment_items_qty_valid", "inventory_adjustment_items", type_="check"
    )
    op.drop_constraint(
        "chk_transfer_items_qty_valid", "stock_transfer_items", type_="check"
    )
    op.drop_constraint(
        "chk_stock_transfers_different_branches", "stock_transfers", type_="check"
    )
    op.drop_constraint(
        "chk_receipt_items_qty_cost_valid", "purchase_receipt_items", type_="check"
    )
    op.drop_constraint("chk_po_items_cost_valid", "purchase_order_items", type_="check")
    op.drop_constraint("chk_po_items_qty_valid", "purchase_order_items", type_="check")
    op.drop_constraint(
        "chk_purchase_orders_total_non_negative", "purchase_orders", type_="check"
    )
    op.drop_constraint(
        "chk_inventory_levels_reorder_non_negative", "inventory_levels", type_="check"
    )
    op.drop_constraint(
        "chk_inventory_levels_qty_valid", "inventory_levels", type_="check"
    )

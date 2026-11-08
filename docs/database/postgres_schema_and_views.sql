-- 1. VIEW BÁO CÁO DOANH THU, LỢI NHUẬN THEO CHI NHÁNH & THỜI GIAN (UC25)

CREATE OR REPLACE VIEW vw_branch_daily_sales_report AS
WITH order_item_totals AS (
    SELECT 
        oi.order_id,
        SUM(oi.quantity) AS order_items_qty,
        SUM(oi.quantity * oi.unit_cost) AS order_cogs
    FROM order_items oi
    GROUP BY oi.order_id
)
SELECT 
    b.branch_id,
    b.branch_code,
    b.branch_name,
    DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS report_date,
    COUNT(o.order_id) AS total_orders,
    SUM(oit.order_items_qty) AS total_items_sold,
    SUM(o.subtotal_amount) AS gross_sales,
    SUM(o.discount_amount) AS total_discounts,
    SUM(o.total_amount - o.shipping_fee) AS net_revenue,
    SUM(oit.order_cogs) AS total_cogs,
    SUM((o.subtotal_amount - o.discount_amount) - oit.order_cogs) AS gross_profit
FROM branches b
JOIN orders o ON b.branch_id = o.branch_id
JOIN order_item_totals oit ON o.order_id = oit.order_id
WHERE o.order_status = 'COMPLETED'
  AND o.payment_status = 'PAID'
GROUP BY 
    b.branch_id, 
    b.branch_code, 
    b.branch_name, 
    DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- 2. VIEW KIỂM TRA TỒN KHO CHI TIẾT TẠI CHI NHÁNH (UC10 & UC25)

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
JOIN categories c ON p.category_id = c.category_id;


-- 3. CÁC COMPOSITE INDEX PHỤC VỤ TỐI ƯU TRUY VẤN (EXPLAIN ANALYZE BUFFERS)

-- Tối ưu truy vấn lọc đơn hàng theo chi nhánh, trạng thái và khoảng thời gian (UC17, UC25)
CREATE INDEX idx_orders_branch_status_created 
ON orders (branch_id, order_status, created_at DESC);

-- Tối ưu truy vấn lịch sử đơn hàng của khách hàng (UC16)
CREATE INDEX idx_orders_customer_created 
ON orders (customer_user_id, created_at DESC);

-- Tối ưu truy vết biến động tồn kho theo chi nhánh, biến thể và thời gian (UC09, UC11, UC12)
CREATE INDEX idx_stock_movements_branch_variant_time 
ON stock_movements (branch_id, variant_id, created_at DESC);

-- Tối ưu tìm kiếm và lọc sản phẩm theo danh mục, giá và trạng thái hoạt động (UC05)
CREATE INDEX idx_products_category_active_price 
ON products (category_id, is_active, base_price);
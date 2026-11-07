# Tài liệu thiết kế Cơ sở Dữ liệu & Schema PostgreSQL

**Dự án:** Web bán hàng (`RETAIL_WEB`)  
**Môn học:** Cơ sở dữ liệu Web và hệ thống thông tin – Project cuối kỳ 2026  
**Người phụ trách thiết kế:** Phạm Đức Thắng 
**Người kiểm tra (Reviewer):** Dương Đức Tiến
**Thành viên phối hợp:** Vũ Mạnh Hiếu, Phạm Ngọc Tài
**Hệ quản trị CSDL:** PostgreSQL 16+  
**ORM & Migration Tool:** SQLAlchemy 2.0 & Alembic  

---

## 1. Tổng quan & Chiến lược phân tầng Schema

Để giải quyết bài toán vận hành chuỗi bán lẻ đa chi nhánh theo tài liệu **Đặc tả 26 Use Case (UC01–UC26)** và tài liệu **Phạm vi dự án M1**, cơ sở dữ liệu được chuẩn hóa thành **33 bảng** chia thành 2 mức triển khai rõ rệt:

1. **Core Schema:**
   * Tập trung phục vụ trọn vẹn **3 luồng nghiệp vụ trọng tâm**:
     * Luồng A: Nhập hàng vào chi nhánh (UC08 → UC09).
     * Luồng B: Mua hàng trực tuyến và xử lý đơn (UC13 → UC14 → UC15 → UC17 → UC18/UC19).
     * Luồng C: Điều chuyển kho giữa các chi nhánh (UC10 → UC11).
   * Phục vụ các Use Case hỗ trợ bắt buộc: Xác thực & RBAC (UC01–UC04), Danh mục sản phẩm (UC05–UC06), Nhà cung cấp (UC07), Chi nhánh (UC26) và Báo cáo quản trị (UC25).
2. **Extended Schema**
   * Bao gồm các nghiệp vụ nâng cao: Kiểm kê & điều chỉnh kho (UC12), Khuyến mại & mã giảm giá (UC20–UC21), Đánh giá sản phẩm đã mua (UC22), Đổi trả hàng & hoàn tiền (UC23–UC24).

---

## 2. Danh mục Bảng dữ liệu theo Phân hệ Nghiệp vụ

### Phân hệ 1: Tài khoản, Phân quyền & Chi nhánh (RBAC & Branches)
*Đáp ứng: UC01, UC02, UC03, UC04, UC26*

| STT | Tên bảng | Ý nghĩa nghiệp vụ | Phân loại |
|:---:|---|---|:---:|
| 1 | `users` | Tài khoản dùng chung cho cả Khách hàng và Nhân sự nội bộ | Core |
| 2 | `roles` | Danh mục vai trò (`ADMIN`, `BRANCH_MANAGER`, `WAREHOUSE_STAFF`, `SALES_STAFF`, `CUSTOMER`) | Core |
| 3 | `permissions` | Danh mục mã quyền thao tác chi tiết (`USER_MANAGE`, `PRODUCT_MANAGE`...) | Core |
| 4 | `user_roles` | Bảng trung gian gán vai trò cho người dùng (Khóa chính ghép `(user_id, role_id)`) | Core |
| 5 | `role_permissions`| Bảng trung gian gán quyền cho vai trò (Khóa chính ghép `(role_id, permission_id)`) | Core |
| 6 | `branches` | Danh mục thông tin chi nhánh cửa hàng kèm `manager_user_id` | Core |
| 7 | `user_branch_access` | Giới hạn phạm vi chi nhánh của nhân viên (Khóa chính ghép `(user_id, branch_id)`) | Core |
| 8 | `customer_addresses`| Sổ địa chỉ giao hàng của khách hàng (Quan hệ 1-N với `users`) | Core |

### Phân hệ 2: Danh mục, Sản phẩm & Nhà cung cấp (Catalog & Suppliers)
*Đáp ứng: UC05, UC06, UC07*

| STT | Tên bảng | Ý nghĩa nghiệp vụ | Phân loại |
|:---:|---|---|:---:|
| 9 | `categories` | Cây danh mục sản phẩm (hỗ trợ danh mục cha - con qua `parent_id`) | Core |
| 10 | `products` | Thông tin sản phẩm chung (tên, slug, mô tả, giá sàn) | Core |
| 11 | `product_variants`| Biến thể chi tiết (SKU, màu sắc, kích thước, giá bán, giá vốn hiện tại) | Core |
| 12 | `product_images` | Danh mục hình ảnh sản phẩm/biến thể | Core |
| 13 | `suppliers` | Danh mục nhà cung cấp hàng hóa cho doanh nghiệp | Core |

### Phân hệ 3: Tồn kho, Nhập hàng & Điều chuyển (Inventory & Procurement)
*Đáp ứng: Luồng A (UC08, UC09), Luồng C (UC10, UC11) & UC12*

| STT | Tên bảng | Ý nghĩa nghiệp vụ | Phân loại |
|:---:|---|---|:---:|
| 14 | `inventory_levels` | Mức tồn kho theo cặp `(branch_id, variant_id)`: tồn thực tế và tồn giữ | Core |
| 15 | `purchase_orders` | Đơn đặt hàng nhập gửi nhà cung cấp do Quản lý chi nhánh lập | Core |
| 16 | `purchase_order_items` | Chi tiết mặt hàng và số lượng đặt nhập | Core |
| 17 | `purchase_receipts` | Phiếu tiếp nhận hàng thực tế do Nhân viên kho lập | Core |
| 18 | `purchase_receipt_items` | Chi tiết số lượng thực nhận từng đợt của đơn nhập | Core |
| 19 | `stock_transfers` | Phiếu điều chuyển hàng giữa 2 chi nhánh | Core |
| 20 | `stock_transfer_items` | Chi tiết mặt hàng xuất chuyển và thực nhận tại đích | Core |
| 21 | `stock_movements` | Sổ nhật ký biến động kho trung tâm (audit trail tồn kho) | Core |
| 22 | `inventory_adjustments` | Phiếu kiểm kê kho do Nhân viên tạo, Quản lý duyệt | Extended (UC12) |
| 23 | `inventory_adjustment_items`| Chi tiết số lượng lệch thực tế so với hệ thống khi kiểm kê | Extended (UC12) |

### Phân hệ 4: Giỏ hàng, Đơn hàng, Thanh toán & Giao vận (Sales & Fulfillment)
*Đáp ứng: Luồng B (UC13, UC14, UC15, UC17, UC18, UC19)*

| STT | Tên bảng | Ý nghĩa nghiệp vụ | Phân loại |
|:---:|---|---|:---:|
| 24 | `carts` | Giỏ hàng trực tuyến của khách hàng (Quan hệ 1-1 với `users`) | Core |
| 25 | `cart_items` | Danh sách biến thể và số lượng trong giỏ hàng | Core |
| 26 | `orders` | Đơn đặt hàng bán kèm snapshot thông tin giao nhận | Core |
| 27 | `order_items` | Chi tiết sản phẩm bán: snapshot cả giá bán (`unit_price`) và giá vốn (`unit_cost`) | Core |
| 28 | `order_status_history` | Lịch sử tiến trình chuyển trạng thái đơn hàng (phục vụ UC16) | Core |
| 29 | `payments` | Giao dịch thanh toán đơn hàng (hỗ trợ COD và chuyển khoản trực tuyến) | Core |
| 30 | `shipments` | Quản lý vận đơn và trạng thái giao hàng của đơn vị vận chuyển | Core |

### Phân hệ 5: Khuyến mãi, Đánh giá & Hậu mãi (Promotions, Reviews & Returns)
*Đáp ứng: UC20, UC21, UC22, UC23, UC24*

| STT | Tên bảng | Ý nghĩa nghiệp vụ | Phân loại |
|:---:|---|---|:---:|
| 31 | `coupons` | Danh mục mã giảm giá và điều kiện khuyến mãi | Extended (UC20) |
| 32 | `coupon_usages` | Nhật ký sử dụng mã giảm giá của từng khách hàng trên đơn hàng | Extended (UC21) |
| 33 | `product_reviews` | Đánh giá sao và nhận xét (chỉ dành cho khách đã mua hàng) | Extended (UC22) |
| 34 | `returns` | Đơn yêu cầu trả hàng từ khách hàng | Extended (UC23) |
| 35 | `return_items` | Chi tiết số lượng trả, tình trạng hàng và số lượng nhập lại kho | Extended (UC24) |
| 36 | `refunds` | Giao dịch hoàn tiền cho đơn hủy hoặc đơn trả hàng | Extended (UC19/24)|

---

## 3. Các Quy tắc Toàn vẹn Dữ liệu Quan trọng (Data Integrity Rules)

### 3.1. Ràng buộc khóa & duy nhất (`UNIQUE Constraints`)
* `inventory_levels`: `UNIQUE (branch_id, variant_id)` – Đảm bảo mỗi biến thể tại một chi nhánh chỉ có một bản ghi theo dõi tồn kho duy nhất.
* `carts`: `UNIQUE (user_id)` – Mỗi khách hàng chỉ có duy nhất một giỏ hàng hoạt động.
* `cart_items`: `UNIQUE (cart_id, variant_id)` – Biến thể trùng trong giỏ sẽ cộng dồn số lượng.
* `product_reviews`: `UNIQUE (order_item_id)` – Mỗi lần mua một mặt hàng trong đơn hàng chỉ được gửi đúng 1 lần đánh giá, ngăn chặn triệt để tình trạng spam hoặc đánh giá ảo khi chưa mua hàng.
* `stock_transfer_items`: `UNIQUE (transfer_id, variant_id)`.
* `purchase_order_items`: `UNIQUE (po_id, variant_id)`.

### 3.2. Ràng buộc Kiểm tra Hợp lệ (`CHECK Constraints`)
* **Chống âm kho và chống bán vượt tồn:**
  ```sql
  ALTER TABLE inventory_levels 
  ADD CONSTRAINT chk_inventory_qty_valid 
  CHECK (on_hand_qty >= 0 AND reserved_qty >= 0 AND on_hand_qty >= reserved_qty);
  ```
* **Chống điều chuyển nội bộ trùng chi nhánh:**
  ```sql
  ALTER TABLE stock_transfers 
  ADD CONSTRAINT chk_transfers_distinct_branches 
  CHECK (from_branch_id <> to_branch_id);
  ```
* **Ràng buộc tiến độ nhận hàng:**
  ```sql
  ALTER TABLE purchase_order_items 
  ADD CONSTRAINT chk_po_items_qty_valid 
  CHECK (ordered_qty > 0 AND received_qty >= 0 AND received_qty <= ordered_qty AND unit_cost > 0);
  ```
* **Ràng buộc đánh giá hợp lệ:**
  ```sql
  ALTER TABLE product_reviews 
  ADD CONSTRAINT chk_reviews_rating_range 
  CHECK (rating BETWEEN 1 AND 5);
  ```
* **Ràng buộc số lượng nhập lại kho khi trả hàng:**
  ```sql
  ALTER TABLE return_items 
  ADD CONSTRAINT chk_returns_restock_qty 
  CHECK (requested_qty > 0 AND received_qty >= 0 AND restock_qty >= 0 AND restock_qty <= received_qty);
  ```

### 3.3. Quy tắc cập nhật và xóa dữ liệu (`ON DELETE` / `ON UPDATE`)
* **`ON DELETE RESTRICT` (Mặc định cho toàn bộ dữ liệu nghiệp vụ):**
  * Không cho phép xóa vật lý (Hard Delete) đối với `users`, `branches`, `products`, `product_variants`, `suppliers`, `orders`, `purchase_orders`. Khi ngừng hoạt động, cập nhật cờ logic `is_active = FALSE`.
* **`ON DELETE CASCADE` (Chỉ dùng cho dữ liệu phụ thuộc vòng đời):**
  * Áp dụng cho: `user_roles`, `role_permissions`, `user_branch_access`, `customer_addresses`, `product_images`, `cart_items`, `order_status_history`.
* **`ON DELETE SET NULL` (Dành cho người kiểm duyệt/xử lý):**
  * Áp dụng cho: `branches.manager_user_id`, `orders.processed_by_staff_id`, `orders.cancelled_by`, `stock_transfers.approved_by`.

---

## 4. Thiết kế Quản lý Giao dịch (ACID Transactions) & Concurrency Control

### 4.1. Luồng A: Tiếp nhận hàng và cập nhật tồn kho (UC09)
* **Mục tiêu:** Cập nhật tăng tồn kho chi nhánh đồng thời ghi nhận lịch sử biến động trong cùng một transaction; nếu có lỗi giữa chừng phải rollback toàn bộ.
* **Quy trình thực thi:**
  1. `BEGIN TRANSACTION;`
  2. Khóa dòng bản ghi đơn đặt mua:  
     `SELECT ordered_qty, received_qty FROM purchase_order_items WHERE po_item_id = :id FOR UPDATE;`
  3. Kiểm tra tính hợp lệ: `(received_qty + :new_received_qty) <= ordered_qty`.
  4. Ghi nhận phiếu nhập: `INSERT INTO purchase_receipts` và `INSERT INTO purchase_receipt_items`.
  5. Cập nhật tăng tồn kho thực tế:  
     `UPDATE inventory_levels SET on_hand_qty = on_hand_qty + :new_received_qty WHERE branch_id = :b_id AND variant_id = :v_id;`
  6. Ghi nhật ký biến động kho:  
     `INSERT INTO stock_movements (branch_id, variant_id, movement_type, reference_type, reference_id, qty_change, balance_after) VALUES (:b_id, :v_id, 'PO_RECEIPT', 'purchase_receipts', :receipt_id, +:new_received_qty, :new_balance);`
  7. Cập nhật trạng thái đơn đặt mua `purchase_orders.status` (`PARTIALLY_RECEIVED` hoặc `COMPLETED`).
  8. `COMMIT;` (Nếu có bất kỳ ngoại lệ nào xảy ra $\rightarrow$ `ROLLBACK;`).

### 4.2. Luồng B: Đặt hàng trực tuyến & Kiểm soát tranh chấp (UC14 - Concurrency Control)
* **Kịch bản tranh chấp:** Hai khách hàng cùng bấm đặt mua biến thể sản phẩm có số lượng tồn khả dụng giới hạn cùng một thời điểm.
* **Giải pháp:** Áp dụng kỹ thuật khóa dòng bi quan (**Pessimistic Locking**) bằng `SELECT ... FOR UPDATE`:
  1. `BEGIN TRANSACTION;`
  2. Khóa dòng kiểm tra tồn kho tại chi nhánh chỉ định:  
     `SELECT on_hand_qty, reserved_qty FROM inventory_levels WHERE branch_id = :b_id AND variant_id = :v_id FOR UPDATE;`
  3. Tính toán tồn khả dụng: `available_qty = on_hand_qty - reserved_qty`.
  4. Nếu `available_qty < :order_qty`: `ROLLBACK;` và trả về lỗi `HTTP 400: Sản phẩm không đủ số lượng tồn kho khả dụng`.
  5. Nếu đủ số lượng:
     * Cập nhật giữ hàng: `UPDATE inventory_levels SET reserved_qty = reserved_qty + :order_qty WHERE ...;`
     * Tạo bản ghi `orders` và `order_items` (lưu snapshot `unit_price` và `unit_cost`).
     * Xóa sản phẩm tương ứng khỏi giỏ hàng `cart_items`.
     * Ghi nhận lịch sử `order_status_history` trạng thái `PENDING_CONFIRMATION` hoặc `PENDING_PAYMENT`.
  6. `COMMIT;`
* **Vòng đời chuyển đổi hàng giữ:**
  * **Hủy đơn (UC19):** `reserved_qty = reserved_qty - order_qty` (giải phóng hàng giữ).
  * **Bàn giao vận chuyển (UC18):** `on_hand_qty -= order_qty` và `reserved_qty -= order_qty`, ghi nhật ký `stock_movements` với loại `SALE_OUT` (`qty_change = -order_qty`).

### 4.3. Luồng C: Điều chuyển hàng giữa các chi nhánh (UC11)
* **Mục tiêu:** Không để thất thoát hàng hóa; hàng đang điều chuyển không được tự động cộng vào kho đích trước khi có xác nhận kiểm đếm thực tế.
* **Quy trình:**
  1. **Tạo yêu cầu:** Kiểm tra `(on_hand_qty - reserved_qty) >= :shipped_qty` tại chi nhánh xuất (`from_branch_id`). Tăng `reserved_qty` để giữ hàng.
  2. **Duyệt xuất (`IN_TRANSIT`):** Trừ cả `on_hand_qty` và `reserved_qty` tại chi nhánh xuất; tạo bản ghi `stock_movements` loại `TRANSFER_OUT` (`qty_change = -shipped_qty`). Lượng hàng trên đường vận chuyển được quản lý bởi các phiếu có trạng thái `IN_TRANSIT`.
  3. **Tiếp nhận tại chi nhánh đích (`COMPLETED`):** Nhân viên kho đích kiểm đếm số lượng thực nhận `received_qty`. Hệ thống cộng `on_hand_qty` tại chi nhánh nhận (`to_branch_id`) và ghi `stock_movements` loại `TRANSFER_IN` (`qty_change = +received_qty`).

---

## 5. SQL Nâng cao, Views Báo cáo & Index Tối ưu Hiệu năng

Theo yêu cầu kỹ thuật của học phần, cơ sở dữ liệu cung cấp sẵn các `VIEW` nghiệp vụ được ứng dụng thực tế và hệ thống Index phức hợp:

### 5.1. View Báo cáo Kinh doanh Doanh thu & Lợi nhuận (UC25)
* Tên View: `vw_branch_daily_sales_report`
* Mục đích: Tổng hợp doanh thu, giá vốn bán hàng (COGS), chiết khấu và lợi nhuận gộp theo từng chi nhánh và theo từng ngày từ dữ liệu giao dịch thực tế.
* Phục vụ: Màn hình Báo cáo Quản trị của Admin và Quản lý chi nhánh.

### 5.2. View Tra cứu Tồn kho Chi tiết & Cảnh báo Hết hàng (UC10, UC25)
* Tên View: `vw_branch_inventory_status`
* Mục đích: Tính toán trực tiếp số lượng tồn khả dụng (`on_hand_qty - reserved_qty`) và tự động gắn nhãn cảnh báo: `OUT_OF_STOCK` (Hết hàng), `LOW_STOCK` (Sắp hết), `IN_STOCK` (Còn hàng).

### 5.3. Chiến lược Đánh chỉ mục (Indexing Strategy) phục vụ Benchmark
Cơ sở dữ liệu thiết lập các Composite Index để đáp ứng kiểm thử `EXPLAIN (ANALYZE, BUFFERS)` trên bộ dữ liệu lớn:
* `idx_orders_branch_status_created`: Đánh trên `orders(branch_id, order_status, created_at DESC)` – Tối ưu truy vấn lọc đơn theo chi nhánh và khoảng thời gian.
* `idx_stock_movements_branch_variant_time`: Đánh trên `stock_movements(branch_id, variant_id, created_at DESC)` – Tối ưu truy vấn lịch sử biến động kho cho bảng dữ liệu dự kiến $\ge 100.000$ bản ghi.
* `idx_products_category_active_price`: Đánh trên `products(category_id, is_active, base_price)` – Tối ưu bộ lọc tìm kiếm sản phẩm phân trang ở Frontend.

*(Chi tiết mã nguồn tạo View và Index được lưu tại file `postgres_schema_and_views.sql`).*

---

## 6. Kế hoạch Bộ dữ liệu Lớn (Benchmark Dataset Plan)

Để đáp ứng tiêu chí kiểm thử hiệu năng với bộ dữ liệu lớn, script sinh dữ liệu (`scripts/seed_large_data.py`) sẽ phân bổ số lượng bản ghi như sau:
1. `stock_movements`: **$\ge 100.000$ bản ghi** (Bảng nhật ký biến động kho trung tâm).
2. `order_items`: **$\ge 40.000$ bản ghi** (Bảng chi tiết đơn hàng).
3. `orders`: **$\ge 15.000$ bản ghi** (Bảng giao dịch đơn hàng).
4. `inventory_levels`: **$\ge 10.000$ bản ghi** (Phân bổ trên 10 chi nhánh và 1.000 biến thể sản phẩm).

---


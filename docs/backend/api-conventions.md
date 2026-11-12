# API Conventions – RETAIL_WEB

## 1. Quy ước chung

Backend sử dụng FastAPI, cung cấp REST API cho Frontend Next.js.

- Prefix: `/api/v1`
- Dữ liệu request/response: JSON
- Xác thực: JWT Bearer Token
- Đặt tên endpoint bằng chữ thường, dùng dấu `-` khi cần.
- Sử dụng danh từ số nhiều cho tài nguyên như `/products`, `/orders`, `/users`.
- API quản lý nội bộ phải kiểm tra vai trò và quyền truy cập chi nhánh khi cần.

## 2. HTTP Methods

| Method | Mục đích | Ví dụ |
|---|---|---|
| GET | Lấy dữ liệu | `GET /products` |
| POST | Tạo dữ liệu | `POST /orders` |
| PUT | Cập nhật toàn bộ hoặc theo quy ước endpoint | `PUT /auth/me` |
| PATCH | Cập nhật một phần | `PATCH /products/{product_id}` |
| DELETE | Xóa dữ liệu | `DELETE /cart/items/{item_id}` |

## 3. Quy ước URL

- Danh sách: `GET /api/v1/products`
- Chi tiết: `GET /api/v1/products/{product_id}`
- Tạo mới: `POST /api/v1/products`
- Cập nhật: `PATCH /api/v1/products/{product_id}`
- Xóa: `DELETE /api/v1/products/{product_id}`

Các endpoint thao tác đặc biệt như xác nhận, hủy đơn hàng có thể dùng dạng:

`POST /api/v1/orders/{order_id}/cancel`

## 4. Phân trang và lọc

Các API trả danh sách có thể sử dụng:

- `page`: Trang hiện tại, mặc định 1.
- `page_size`: Số bản ghi mỗi trang, mặc định 20.
- `search`: Từ khóa tìm kiếm.
- Các tham số lọc tùy nghiệp vụ, ví dụ `status`, `branch_id`.

## 5. Response và xử lý lỗi

- GET thành công: HTTP 200.
- POST tạo mới thành công: HTTP 201.
- DELETE thành công: HTTP 204 hoặc 200 nếu cần trả dữ liệu.
- Lỗi API sử dụng cấu trúc JSON thống nhất trong `error-validation-conventions.md`.
- Validation sử dụng Pydantic Schema.
- Không trả mật khẩu, password hash hoặc thông tin nhạy cảm.

## 6. Phân chia trách nhiệm

- **Tiến:** Authentication, Authorization, Cart, Order và Payment.
- **Thắng:** Product, Inventory và Purchasing.
- **Hiếu:** Frontend khách hàng.
- **Tài:** Frontend quản trị và báo cáo.

Các thành viên thống nhất API Contract trước khi tích hợp Frontend và Backend.
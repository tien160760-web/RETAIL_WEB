# API Contract – RETAIL_WEB

## 1. Quy ước chung

- Backend: FastAPI
- API Prefix: `/api/v1`
- Dữ liệu trao đổi: JSON
- Xác thực: JWT Bearer Token
- API quản lý nội bộ yêu cầu phân quyền theo vai trò và chi nhánh.
- Quy tắc HTTP và xử lý lỗi tuân theo `api-conventions.md` và `error-validation-conventions.md`.

## 2. Authentication & User Management (UC01–UC04)

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản khách hàng | Public |
| POST | `/auth/login` | Đăng nhập, nhận JWT | Public |
| GET | `/auth/me` | Xem thông tin cá nhân | Đã đăng nhập |
| PUT | `/auth/me` | Cập nhật thông tin cá nhân | Đã đăng nhập |
| GET | `/auth/me/addresses` | Danh sách địa chỉ giao hàng | CUSTOMER |
| POST | `/auth/me/addresses` | Thêm địa chỉ | CUSTOMER |
| PUT | `/auth/me/addresses/{address_id}` | Sửa địa chỉ | CUSTOMER |
| DELETE | `/auth/me/addresses/{address_id}` | Xóa địa chỉ | CUSTOMER |
| GET | `/staff` | Danh sách nhân viên | ADMIN |
| POST | `/staff` | Admin tạo tài khoản nhân viên | ADMIN |
| PATCH | `/staff/{user_id}` | Cập nhật nhân viên, trạng thái tài khoản | ADMIN |
| PUT | `/staff/{user_id}/access` | Gán vai trò và chi nhánh | ADMIN |

**Lưu ý:** Đăng xuất với JWT hiện tại do Frontend thực hiện bằng cách xóa token hoặc phiên đăng nhập. Chưa xây dựng API thu hồi token phía Server.

## 3. Cart – Giỏ hàng (UC13)

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| GET | `/cart` | Xem giỏ hàng | CUSTOMER |
| POST | `/cart/items` | Thêm sản phẩm vào giỏ | CUSTOMER |
| PATCH | `/cart/items/{item_id}` | Thay đổi số lượng | CUSTOMER |
| DELETE | `/cart/items/{item_id}` | Xóa sản phẩm khỏi giỏ | CUSTOMER |

Hệ thống kiểm tra số lượng hợp lệ và tính lại tổng tiền khi giỏ hàng thay đổi. Giá bán và tồn kho được kiểm tra lại khi đặt hàng.

## 4. Order – Đơn hàng (UC14, UC16, UC17, UC19)

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| POST | `/orders` | Tạo đơn hàng từ giỏ hàng | CUSTOMER |
| GET | `/orders/my` | Xem lịch sử đơn hàng cá nhân | CUSTOMER |
| GET | `/orders/{order_id}` | Xem chi tiết và trạng thái đơn hàng | Chủ đơn / Nhân viên có quyền |
| GET | `/orders` | Danh sách đơn hàng để xử lý | STAFF / ADMIN |
| PATCH | `/orders/{order_id}/status` | Cập nhật trạng thái xử lý | Nhân viên có quyền |
| POST | `/orders/{order_id}/cancel` | Hủy đơn hàng | Chủ đơn / Nhân viên có quyền |

Khi tạo đơn hàng, hệ thống kiểm tra giá bán, tồn kho và địa chỉ giao hàng, sau đó tạo đơn và giữ số lượng hàng cần thiết.

Khi hủy đơn, hệ thống phải kiểm tra điều kiện hủy và giải phóng tồn kho đã giữ nếu có.

## 5. Payment – Thanh toán (UC15)

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| GET | `/orders/{order_id}/payment` | Xem thông tin thanh toán | Chủ đơn / Nhân viên có quyền |
| POST | `/orders/{order_id}/payments` | Chọn và thực hiện thanh toán | CUSTOMER |

Đồ án hỗ trợ COD và thanh toán trực tuyến mô phỏng.

- COD: Ghi nhận phương thức thanh toán, chưa đánh dấu đã thu tiền.
- Thanh toán mô phỏng thành công: Cập nhật trạng thái đã thanh toán.
- Thanh toán thất bại: Ghi nhận kết quả, không đánh dấu đơn đã thanh toán.

## 6. Shipping – Giao hàng (UC18)

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| GET | `/orders/{order_id}/shipping` | Xem trạng thái giao hàng | Chủ đơn / Nhân viên có quyền |
| PATCH | `/orders/{order_id}/shipping` | Cập nhật trạng thái giao hàng | Nhân viên có quyền |

Phạm vi đồ án chỉ cần quản lý trạng thái giao hàng trong hệ thống, chưa bắt buộc tích hợp API vận chuyển thực tế.

## 7. Request/Response minh họa

### Đăng nhập – UC02

**POST** `/api/v1/auth/login`

Request:

```json
{
  "username": "customer01",
  "password": "password123"
}
```

Response thành công (minh họa):

```json
{
  "access_token": "<JWT_TOKEN>",
  "token_type": "bearer",
  "user_id": 1,
  "username": "customer01",
  "roles": ["CUSTOMER"],
  "branch_ids": []
}
```

### Thêm sản phẩm vào giỏ – UC13

**POST** `/api/v1/cart/items`

Request dự kiến:

```json
{
  "variant_id": 101,
  "quantity": 2
}
```

Response dự kiến:

```json
{
  "item_id": 1,
  "variant_id": 101,
  "quantity": 2,
  "message": "Đã thêm vào giỏ hàng"
}
```

## 8. Phân trang và lọc dữ liệu

Các API danh sách sử dụng:

- `page`: Số trang, mặc định 1.
- `page_size`: Số bản ghi mỗi trang, mặc định 20.
- `search`: Tìm kiếm khi cần.
- `status`, `branch_id`: Lọc đơn hàng theo trạng thái hoặc chi nhánh.

Nhân viên chỉ được xem và thao tác trên đơn hàng thuộc phạm vi chi nhánh được cấp quyền.

## 9. Trạng thái triển khai

- **Đã có Router:** Đăng ký, đăng nhập, xem và cập nhật hồ sơ cá nhân.
- **Đã xây dựng bộ khung:** JWT, RBAC, phân quyền chi nhánh và xử lý lỗi chung.
- **Chưa triển khai:** Quản lý nhân viên, địa chỉ, giỏ hàng, đơn hàng, thanh toán và giao hàng.

Các endpoint chưa triển khai là bản thiết kế API dự kiến, có thể điều chỉnh khi thống nhất với các thành viên và Model CSDL chính thức.
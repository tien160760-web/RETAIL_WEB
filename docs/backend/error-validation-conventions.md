# Quy ước xử lý lỗi và Validation – RETAIL_WEB

## 1. Mục đích

Thống nhất cách kiểm tra dữ liệu đầu vào và xử lý lỗi giữa các API của hệ thống bán hàng đa chi nhánh RETAIL_WEB.

Backend sử dụng **FastAPI, Pydantic và SQLAlchemy**. Các module Authentication, Product, Inventory và Order áp dụng chung quy ước này.

## 2. Cấu trúc phản hồi lỗi

Khi xảy ra lỗi, API trả về JSON theo mẫu:

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email đã được sử dụng",
    "details": null
  }
}
```

Trong đó:

- `code`: Mã lỗi để Frontend nhận biết.
- `message`: Thông báo lỗi cho người dùng.
- `details`: Thông tin chi tiết, chủ yếu dùng cho lỗi validation.

## 3. Quy ước HTTP Status Code

| HTTP | Ý nghĩa | Ví dụ |
|---|---|---|
| 400 | Yêu cầu không hợp lệ về nghiệp vụ | Số lượng đặt hàng không hợp lệ |
| 401 | Chưa xác thực hoặc đăng nhập sai | Sai mật khẩu |
| 403 | Không có quyền thao tác | Nhân viên truy cập sai chi nhánh |
| 404 | Không tìm thấy dữ liệu | Đơn hàng không tồn tại |
| 409 | Xung đột dữ liệu hoặc trạng thái | Email đã tồn tại, không đủ tồn kho |
| 422 | Dữ liệu đầu vào không đúng định dạng | Email sai định dạng |
| 500 | Lỗi hệ thống | Lỗi máy chủ hoặc cấu hình |

## 4. Validation và xử lý lỗi

- **Schema (Pydantic):** Kiểm tra trường bắt buộc, kiểu dữ liệu, định dạng email, độ dài và giá trị hợp lệ.
- **Service:** Kiểm tra quy tắc nghiệp vụ và phát sinh `AppException` khi có lỗi.
- **Repository:** Thực hiện truy vấn và thao tác với PostgreSQL.
- **Router/Controller:** Tiếp nhận request, gọi Service và trả kết quả.
- **Global Exception Handler:** Chuyển lỗi thành HTTP Status và JSON thống nhất.

Ví dụ lỗi validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Du lieu dau vao khong hop le",
    "details": [
      {
        "field": "body.email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

## 5. Một số lỗi nghiệp vụ

| Mã lỗi | HTTP | Use Case |
|---|---|---|
| `USERNAME_ALREADY_EXISTS` | 409 | UC01 – Đăng ký |
| `EMAIL_ALREADY_EXISTS` | 409 | UC01 – Đăng ký |
| `HTTP_401` | 401 | UC02 – Đăng nhập |
| `HTTP_403` | 403 | UC02, UC04 – Xác thực và phân quyền |
| `INSUFFICIENT_STOCK` | 409 | UC14 – Đặt hàng |
| `HTTP_404` | 404 | Đường dẫn API không tồn tại |
| `VALIDATION_ERROR` | 422 | Dữ liệu đầu vào không hợp lệ |
| `INTERNAL_SERVER_ERROR` | 500 | Lỗi hệ thống không dự kiến |

Các mã lỗi chưa triển khai là quy ước dự kiến cho các module tiếp theo.

**Nguyên tắc chung:** Backend phải kiểm tra dữ liệu và quyền truy cập; không trả thông tin nhạy cảm hoặc traceback cho Frontend. Các nghiệp vụ ghi nhiều bảng phải sử dụng transaction và rollback khi thất bại.
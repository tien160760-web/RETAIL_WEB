# Frontend Admin – RETAIL_WEB (Issue #14)

**Phân hệ:** Giao diện Quản trị & Quản lý Sản phẩm (Admin Backoffice)  
**Người phụ trách:** Phạm Ngọc Tài  
**Người kiểm tra (Reviewer):** Vũ Mạnh Hiếu  
**Thành viên phối hợp:** Dương Đức Tiến, Phạm Đức Thắng  

---

## 1. Cấu trúc tính năng đã triển khai

### 1.1. Khu vực quản trị & Phân quyền (Mục 2.1)
- **Định tuyến quản trị (`src/App.tsx`)**:
  - `/login`: Trang đăng nhập quản trị & đăng ký tài khoản khách hàng.
  - `/products`: Danh sách sản phẩm quản trị (hiển thị cả trạng thái **Đang bán** và **Tạm ẩn**), bộ lọc theo trạng thái, danh mục, tìm kiếm theo tên/SKU/màu/size, chế độ xem Bảng & Lưới ảnh.
  - `/products/new`: Mở trực tiếp form thêm sản phẩm mới.
  - `/products/:id/edit`: Mở trực tiếp form chỉnh sửa sản phẩm theo ID.
  - `/suppliers`: Quản lý nhà cung cấp (dành cho Quản lý chi nhánh & Admin).
  - `/staff`: Quản lý tài khoản và phân quyền nhân viên (chỉ dành riêng cho Admin).
- **Bảo vệ Route & Xác thực phiên (`src/context/AdminContext.tsx`, `src/config/api.ts`)**:
  - Tự động gọi `GET /api/v1/auth/me` khi tải lại trang hoặc khi người dùng nhập URL trực tiếp.
  - Tài khoản `CUSTOMER` bị chặn truy cập khu vực quản trị (hiển thị màn hình `403 Forbidden`).
  - Xử lý tập trung phản hồi `401 Unauthorized` (xóa token, đưa về `/login` kèm thông báo) và `403 Forbidden` (hiển thị cảnh báo quyền hạn).

### 1.2. Quản lý sản phẩm, biến thể và hình ảnh (Mục 2.2)
- **Tải nhiều hình ảnh**: Hỗ trợ tải tối đa 9 ảnh từ máy tính, dán URL hoặc chọn ảnh mẫu, đặt ảnh bìa.
- **Phân loại 2 cấp (Màu sắc × Kích cỡ)**: Tự động sinh bảng biến thể SKU, giá bán và tồn kho, hỗ trợ áp dụng giá/tồn/tiền tố SKU đồng loạt.
- **Nạp dữ liệu theo ID từ API**: Khi mở `/products/:id/edit`, gọi `GET /api/v1/admin/products/{id}` để nạp chính xác sản phẩm và danh sách biến thể hiện có.
- **Xác nhận lưu từ Backend & Giữ dữ liệu khi lỗi**:
  - Chỉ hiển thị thông báo thành công và đóng form sau khi Backend xác nhận `HTTP 200/201`.
  - Khi Backend trả lỗi (`409` trùng SKU, `422` dữ liệu không hợp lệ, `403` không đủ quyền), form giữ nguyên toàn bộ dữ liệu người dùng đang nhập để chỉnh sửa và gửi lại.

---

## 2. Hướng dẫn cấu hình và chạy trên Local

### Bước 1: Cấu hình biến môi trường Frontend
Tạo file `frontend/.env` từ file mẫu `frontend/.env.example`:

```bash
cd frontend
cp .env.example .env
```

Nội dung `frontend/.env`:
```env
# Để trống để dùng Vite Proxy tự động chuyển tiếp /api -> http://127.0.0.1:8000
# Hoặc chỉ định rõ địa chỉ Backend, ví dụ: VITE_API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=
```

### Bước 2: Cài đặt thư viện và chạy Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- Kiểm tra Backend đang chạy tại: `http://localhost:8000/health`
- Xem tài liệu Swagger API tại: `http://localhost:8000/docs`

### Bước 3: Cài đặt thư viện và chạy Frontend Admin (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
- Truy cập giao diện quản trị tại: `http://localhost:5173/`

### Tài khoản thử nghiệm mặc định
| Vai trò | Email | Mật khẩu | Phạm vi truy cập |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@retail.vn` | `123` | Toàn quyền: Sản phẩm, Danh mục, Nhà cung cấp, Nhân viên |
| **Quản lý chi nhánh** | `manager.hn@retail.vn` | `123` | Quản lý Nhà cung cấp, Tra cứu Sản phẩm (không có quyền sửa SP / quản lý nhân viên) |
| **Nhân viên kho** | `warehouse.dn@retail.vn` | `123` | Chỉ xem & tra cứu Sản phẩm |
| **Nhân viên bán hàng** | `sales.hcm@retail.vn` | `123` | Chỉ xem & tra cứu Sản phẩm |
| **Tài khoản bị khóa** | `locked@retail.vn` | `123` | Bị chặn đăng nhập (`403`) |

---

## 3. Kết quả kiểm tra tích hợp (Mục 2.3 – Issue #14)

Tất cả 5 tiêu chí hoàn thành của Issue #14 đã được kiểm thử qua Vite Proxy (`http://localhost:5173/api/v1` → FastAPI `http://127.0.0.1:8000/api/v1`):

| STT | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :---: |
| 1 | Admin đăng nhập (`POST /auth/login`), tạo sản phẩm mới kèm 2 biến thể (`POST /products`) và tải lại trang | Trả về `HTTP 201` (ID tự tăng), tải lại danh sách `GET /admin/products` thấy đúng sản phẩm đã lưu | **PASS** |
| 2 | Mở form sửa theo ID (`/products/:id/edit` → `GET /admin/products/{id}`), cập nhật tên, giá và lưu (`PUT /products/{id}`) | Nạp đủ 2 biến thể hiện có; sau khi lưu trả `HTTP 200`, dữ liệu giao diện khớp với Database | **PASS** |
| 3 | Đối chiếu hiển thị công khai vs ẩn trên API Customer (`GET /products`, `GET /products/{id}`) | Khi `isActive = true`: API công khai trả `HTTP 200`. Khi Admin đổi sang Tạm ẩn (`isActive = false`): API công khai loại khỏi danh sách và trả `HTTP 404` cho đường dẫn chi tiết | **PASS** |
| 4 | Kiểm tra phân quyền: thiếu token (`401`) và dùng token `CUSTOMER` truy cập trang quản trị / gửi yêu cầu ghi (`403`) | Thiếu token trả `HTTP 401`; đăng nhập tài khoản `CUSTOMER` bị chặn màn hình quản trị và mọi yêu cầu ghi `POST /products` hoặc đọc `GET /admin/products` đều trả `HTTP 403 Forbidden` | **PASS** |
| 5 | Nhập mã SKU trùng lặp (`POST /products`) hoặc dữ liệu không hợp lệ | Backend trả `HTTP 409 Conflict` kèm thông báo mã SKU trùng; Form giữ nguyên dữ liệu đang nhập để người dùng sửa và gửi lại | **PASS** |

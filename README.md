# RETAIL_WEB – Website bán hàng đa chi nhánh

> **Đồ án cuối kỳ – Cơ sở dữ liệu Web và Hệ thống thông tin (2026)**  
> **Trạng thái:** Giai đoạn M1 – Phân tích và thiết kế hệ thống. Các phần chức năng được nêu trong tài liệu là **phạm vi dự kiến triển khai**, không phải tính năng đã hoàn thành.

## 1. Giới thiệu

**RETAIL_WEB** là hệ thống thông tin Web phục vụ hoạt động bán hàng của **một doanh nghiệp có nhiều chi nhánh**. Hệ thống hỗ trợ khách hàng mua sắm trực tuyến và nhân sự nội bộ quản lý sản phẩm, nhập hàng, tồn kho theo chi nhánh, điều chuyển hàng, xử lý đơn hàng và theo dõi báo cáo.

Đề tài đặt trọng tâm vào **thiết kế CSDL quan hệ, truy vấn SQL, tính toàn vẹn và tính đúng đắn của các luồng nghiệp vụ**. Phạm vi được chọn theo yêu cầu Project cuối kỳ, tránh biến đồ án thành một website chỉ có giao diện và CRUD.

Tài liệu phạm vi: [`docs/project-scope.md`](docs/project-scope.md).

## 2. Mục tiêu và các luồng nghiệp vụ trọng tâm

Ba luồng nghiệp vụ được ưu tiên triển khai **từ đầu đến cuối**:

1. **Nhập hàng:** Quản lý chi nhánh lập đơn nhập → nhân viên kho tiếp nhận thực tế → lưu phiếu nhập, tăng tồn kho, ghi lịch sử biến động (**UC08–UC09**).
2. **Bán hàng trực tuyến:** Khách quản lý giỏ → đặt hàng/giữ tồn kho → lựa chọn thanh toán → nhân viên xử lý đơn (**UC13–UC15, UC17**); phối hợp UC05, UC10 và UC16–UC19 khi cần để hoàn chỉnh luồng.
3. **Điều chuyển hàng giữa chi nhánh:** Tra cứu tồn → tạo/duyệt điều chuyển → xuất hàng → xác nhận nhận tại chi nhánh đích → cập nhật tồn và lịch sử biến động (**UC10–UC11**).

Các chức năng hỗ trợ gồm xác thực và phân quyền, danh mục/sản phẩm/biến thể, thông tin chi nhánh và **ít nhất hai báo cáo/thống kê sử dụng dữ liệu thật từ PostgreSQL**. Xem bảng phân loại UC tại [`docs/project-scope.md`](docs/project-scope.md).

## 3. Công nghệ

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React; nhóm dự kiến dùng **Next.js** | **Cần xác nhận với giảng viên** nếu Next.js được xem là lựa chọn khác công nghệ quy định |
| Backend / API | Python, FastAPI | REST API, xác thực, phân quyền và nghiệp vụ |
| Cơ sở dữ liệu | PostgreSQL | CSDL quan hệ chính; không dùng mock data thay thế dữ liệu nghiệp vụ |
| Quản lý mã nguồn | Git, GitHub | Issue → Branch → Commit → Pull Request → Review → Merge |
| Đóng gói và triển khai | Docker, **3 VM riêng** | VM Frontend; VM Backend; VM PostgreSQL + storage |
| Thiết kế | Figma (hoặc tương đương), ERD | Thiết kế giao diện và mô hình dữ liệu |

## 4. Nhóm thực hiện và phân công

| Thành viên | GitHub | Vai trò / hạng mục chính | Người kiểm tra chính | Bàn giao dự kiến |
|---|---|---|---|---|
| **Dương Đức Tiến** | [`tien160760-web`](https://github.com/tien160760-web) | Trưởng nhóm; thiết kế và phát triển Backend Auth/Order; tích hợp, phát hành | Phạm Đức Thắng | Kiến trúc/API, code, test, PR, release |
| **Phạm Đức Thắng** | [`pdt37012-blip`](https://github.com/pdt37012-blip) | CSDL PostgreSQL, ERD, migration, truy vấn, nghiệp vụ nhập hàng/tồn kho | Dương Đức Tiến | ERD, schema, SQL, data scripts, test, PR |
| **Vũ Mạnh Hiếu** | [`vmhus`](https://github.com/vmhus) | Thiết kế và phát triển Frontend khách hàng | Phạm Ngọc Tài | Figma, giao diện kết nối API, test, PR |
| **Phạm Ngọc Tài** | [`PhamNgocTai-73`](https://github.com/PhamNgocTai-73) | Frontend quản trị và báo cáo; kiểm thử; đầu mối hạ tầng 3 VM | Vũ Mạnh Hiếu | Dashboard, báo cáo, test, tài liệu triển khai, PR |

### Các Issues của giai đoạn M1

- [#2 – Thống nhất phạm vi và yêu cầu](https://github.com/tien160760-web/RETAIL_WEB/issues/2) – Tiến.
- [#3 – Thiết kế ERD và schema PostgreSQL](https://github.com/tien160760-web/RETAIL_WEB/issues/3) – Thắng.
- [#4 – Thiết kế giao diện quản trị và thống kê](https://github.com/tien160760-web/RETAIL_WEB/issues/4) – Tài.
- [#5 – Thiết kế giao diện khách hàng](https://github.com/tien160760-web/RETAIL_WEB/issues/5) – Hiếu.
- [#6 – Thiết kế kiến trúc Backend và quy ước API](https://github.com/tien160760-web/RETAIL_WEB/issues/6) – Tiến.

Theo dõi: [Issues](https://github.com/tien160760-web/RETAIL_WEB/issues) · [Repository](https://github.com/tien160760-web/RETAIL_WEB).

## 5. Các yêu cầu nghiệm thu quan trọng

Theo thông báo của giảng viên, hệ thống hoàn chỉnh cần đáp ứng ít nhất:

| Nhóm yêu cầu | Mốc phải đáp ứng |
|---|---|
| Nghiệp vụ | ≥ 3 luồng hoàn chỉnh; ≥ 2 nhóm quyền sử dụng |
| CSDL | ≥ 6 **bảng nghiệp vụ có ý nghĩa**, có khóa và ràng buộc phù hợp; ERD khớp schema |
| Dữ liệu | Bộ demo và bộ dữ liệu lớn cùng schema; ≥ 3 bảng nghiệp vụ có ≥ 10.000 bản ghi/bảng; ≥ 1 bảng ≥ 100.000 bản ghi |
| SQL, báo cáo | ≥ 8 truy vấn nghiệp vụ khác nhau; ≥ 1 VIEW dùng trong hệ thống; ≥ 2 báo cáo/thống kê trên giao diện |
| Transaction và đồng thời | ≥ 1 nghiệp vụ ghi từ 2 bảng trong transaction, thử rollback; ≥ 1 kiểm thử hai kết nối/yêu cầu chạy chồng lấn |
| Chỉ mục/hiệu năng | ≥ 2 index ngoài PK/UNIQUE; so sánh ≥ 2 truy vấn trước/sau tối ưu bằng `EXPLAIN (ANALYZE, BUFFERS)` |
| Quản lý CSDL | ≥ 1 migration có phiên bản trên DB đã có dữ liệu; backup và khôi phục đã kiểm tra |
| Triển khai | **3 VM có hệ điều hành khách và địa chỉ mạng riêng**, Docker/config, dữ liệu bền vững |
| GitHub | Issue, nhánh, commit, PR, review kỹ thuật, test, bàn giao có thể truy vết |


## 6. Cấu trúc dự án dự kiến

```text
RETAIL_WEB/
├── README.md
├── docs/
│   ├── project-scope.md
│   ├── business-rules.md           # Bổ sung sau khi chốt chi tiết quy tắc
│   ├── meeting-notes.md           # Biên bản họp nhóm
│   ├── backend/                   # Thiết kế API và kiến trúc
│   └── database/                  # ERD, từ điển bảng, SQL
├── frontend/                      # Dự kiến: React/Next.js
├── backend/                       # Dự kiến: FastAPI
├── database/                      # Dự kiến: migrations, seed, SQL, scripts
├── tests/                         # Dự kiến: tự động và tích hợp
└── deployment/                    # Dự kiến: Docker, 3 VM, hướng dẫn vận hành
```

## 7. Quy trình làm việc GitHub

1. Mỗi công việc có **Issue**: mục tiêu, người phụ trách, người kiểm tra, checklist, sản phẩm bàn giao.
2. Tạo nhánh riêng từ **nhánh tích hợp đã thống nhất**; ví dụ `feat/12-order-checkout`, `db/3-erd-schema`, `docs/2-project-scope`, `fix/18-stock-validation`.
3. Commit mô tả thay đổi thực tế, tham chiếu Issue khi phù hợp.
4. Push nhánh và tạo **Pull Request**; mô tả cách kiểm thử và ảnh hưởng đến các phần khác.
5. Thành viên khác review kỹ thuật, yêu cầu sửa nếu cần; hoàn thành review rồi mới merge.
6. Chỉ đóng Issue khi có sản phẩm bàn giao và tiêu chí nghiệm thu được đáp ứng.


## 8. Tiến độ và tài liệu

- **M1 – Phân tích và thiết kế hệ thống:** deadline nội bộ dự kiến **12/11/2026**, cần theo dõi trên Milestone GitHub.
- Các giai đoạn tiếp theo (phát triển, dữ liệu/SQL, kiểm thử, tối ưu, triển khai và phát hành) được cập nhật theo Milestones/Issues của nhóm; chưa ghi mốc cứng nếu chưa thống nhất.

Tài liệu hiện có:
- [Phạm vi dự án và phân loại Use Case](docs/project-scope.md)
- [Thông báo Project cuối kỳ 2026](https://github.com/user-attachments/files/34435468/Thong_bao_Project_cuoi_ky_2026.pdf)
- [Đặc tả 26 Use Case](https://github.com/user-attachments/files/34435467/Use_Case_He_Thong_Ban_Hang_26_UC.docx)

## 9. Cài đặt và chạy dự án

> **Chưa có hướng dẫn chạy ổn định:** phần này sẽ được cập nhật khi Backend, Frontend và PostgreSQL đã có cấu hình thực tế. Khi bàn giao cần bổ sung yêu cầu môi trường, `.env.example`, lệnh migration/seed, lệnh chạy test, Dockerfile và hướng dẫn triển khai trên 3 VM; không ghi lệnh giả định khi chưa kiểm tra.

## 10. Trạng thái dự án

Tài liệu này được khởi tạo cho **giai đoạn thiết kế**, không phải tuyên bố hệ thống đã hoàn thành. Các thay đổi về phạm vi, quy tắc nghiệp vụ, công nghệ hoặc phân công phải được cập nhật tại đây và trong Issue liên quan.

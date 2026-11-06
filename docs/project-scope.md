# Phạm vi dự án – RETAIL_WEB

**Dự án:** Website bán hàng đa chi nhánh  
**Môn học:** Cơ sở dữ liệu Web và Hệ thống thông tin – Project cuối kỳ 2026  
**Tài liệu nền:** Thông báo Project cuối kỳ 2026; Đặc tả 26 Use Case (UC01–UC26)  
**Trạng thái:** Bản ghi phạm vi giai đoạn M1. Những quyết định chi tiết chưa được ghi trong hai tài liệu nguồn được đánh dấu **cần xác nhận**.

## 1. Bối cảnh và mục tiêu

Hệ thống phục vụ **một doanh nghiệp bán hàng có nhiều chi nhánh**, với kênh mua sắm cho khách hàng và khu vực quản trị cho nhân sự nội bộ. Dữ liệu sản phẩm/biến thể, đơn nhập, nhập kho, tồn kho chi nhánh, điều chuyển, đơn bán và thanh toán được quản lý thống nhất trong PostgreSQL.

Mục tiêu là xây dựng **ít nhất 3 luồng nghiệp vụ hoàn chỉnh**, sử dụng CSDL thật, có kiểm chứng tính toàn vẹn, transaction, xử lý đồng thời, truy vấn SQL, báo cáo và triển khai được trên **3 VM riêng**. Trọng tâm đánh giá là tính đúng đắn của dữ liệu và nghiệp vụ, không chỉ số lượng giao diện hay bảng.

## 2. Tác nhân và phạm vi quyền

Các Actor có trong tài liệu đặc tả 26 UC:

| Actor | Công việc chính | UC tiêu biểu |
|---|---|---|
| **Khách hàng** | Đăng ký/đăng nhập, xem hàng, giỏ hàng, đặt và thanh toán, theo dõi đơn | UC01–UC03, UC05, UC13–UC16, UC19, UC21–UC23 |
| **Quản trị viên (Admin)** | Quản lý tài khoản nhân viên/phân quyền, sản phẩm, mã giảm giá, báo cáo, chi nhánh | UC04, UC06, UC20, UC25–UC26 |
| **Quản lý chi nhánh** | Nhà cung cấp, đơn nhập, tồn kho, điều chuyển, kiểm kê, báo cáo theo chi nhánh | UC07–UC08, UC10–UC12, UC25 |
| **Nhân viên kho** | Tiếp nhận hàng, tồn kho, điều chuyển, kiểm kê | UC09–UC12 |
| **Nhân viên bán hàng** | Xử lý đơn, cập nhật giao hàng, hủy đơn, xử lý trả/hoàn | UC17–UC19, UC24 |

**Nguyên tắc:** Có ít nhất hai nhóm quyền (khách hàng và nhân sự nội bộ), đồng thời kiểm tra quyền ở Backend. Nhân viên được **Admin tạo tài khoản** theo phương án tổ chức nhóm đã chọn; không sử dụng luồng đăng ký nhân viên tự do như khách hàng.

**Cần cụ thể hóa trong `business-rules.md`:** ma trận quyền theo từng vai trò, giới hạn dữ liệu theo chi nhánh, quy tắc nhân viên được gán nhiều chi nhánh hay một chi nhánh.

## 3. Ba luồng nghiệp vụ trọng tâm

### 3.1. Luồng A – Nhập hàng vào chi nhánh (UC08 → UC09)

**Actor:** Quản lý chi nhánh, nhân viên kho.  
**Đầu vào:** Nhà cung cấp, chi nhánh nhận, biến thể sản phẩm, số lượng và giá nhập.

1. Quản lý chi nhánh tạo đơn nhập và các dòng chi tiết (`purchase_orders`, `purchase_order_items`).
2. Nhân viên kho chọn đơn chờ nhận, ghi số lượng thực nhận.
3. Hệ thống kiểm tra số lượng, lưu phiếu nhập và chi tiết (`purchase_receipts`, `purchase_receipt_items`).
4. Cùng transaction, hệ thống tăng tồn kho tại chi nhánh (`inventory_levels`), ghi biến động (`stock_movements`) và cập nhật trạng thái đơn nhập.
5. Nếu có lỗi giữa chừng, rollback toàn bộ phần ghi liên quan; không để tồn kho tăng khi phiếu nhập chưa lưu thành công.

**Đầu ra/kiểm thử:** Tra cứu được đơn/phiếu, tồn kho thay đổi đúng; kiểm thử trường hợp thành công, số lượng không hợp lệ và lỗi rollback.

### 3.2. Luồng B – Mua hàng và xử lý đơn (UC13 → UC14 → UC15 → UC17)

**Actor:** Khách hàng, nhân viên bán hàng.  
**Điều kiện hỗ trợ:** Có tài khoản, sản phẩm/biến thể, tồn kho khả dụng và thông tin nhận hàng.

1. Khách hàng thêm, sửa hoặc xóa sản phẩm trong giỏ (UC13).
2. Khi đặt hàng (UC14), hệ thống kiểm tra giá, tồn kho và thông tin nhận hàng; tạo đơn cùng chi tiết và **giữ tồn kho cần thiết**.
3. Thanh toán (UC15): COD ghi nhận **chưa thu tiền**; thanh toán trực tuyến có thể thực hiện hoặc **mô phỏng** và lưu kết quả.
4. Nhân viên bán hàng thuộc phạm vi chi nhánh được phân công xác nhận và xử lý đơn (UC17).
5. Khách theo dõi trạng thái (UC16); khi hủy đơn hợp lệ, giải phóng lượng hàng đã giữ (UC19). UC18 hỗ trợ cập nhật giao hàng khi triển khai luồng tới trạng thái hoàn tất.

**Đầu ra/kiểm thử:** Đơn và chi tiết khớp nhau, không bán vượt tồn khả dụng, không ghi COD là đã thu tiền; kiểm tra rollback và tranh chấp hai yêu cầu đặt hàng đồng thời.

**Cần xác nhận:** Quy tắc chọn chi nhánh xử lý đơn, thời điểm chuyển hàng giữ thành đã bán, danh sách trạng thái đơn, thời hạn giữ hàng và phạm vi thanh toán trực tuyến mô phỏng.

### 3.3. Luồng C – Điều chuyển kho giữa các chi nhánh (UC10 → UC11)

**Actor:** Quản lý chi nhánh, nhân viên kho.

1. Tra cứu tồn kho khả dụng tại chi nhánh xuất (UC10).
2. Tạo yêu cầu chuyển hàng với chi nhánh xuất/nhận và số lượng từng biến thể.
3. Hệ thống kiểm tra không chọn trùng chi nhánh, số lượng hợp lệ và còn đủ tồn khả dụng.
4. Khi được duyệt xuất, ghi giảm lượng khả dụng tại nơi xuất và chuyển phiếu sang **Đang vận chuyển**.
5. Khi nhận hàng, nhân viên kho chi nhánh đích xác nhận số lượng; hệ thống cập nhật tồn ở chi nhánh nhận, ghi lịch sử biến động hai bên và hoàn tất phiếu.

**Đầu ra/kiểm thử:** Có phiếu điều chuyển và chi tiết (`stock_transfers`, `stock_transfer_items`), tồn kho/biến động đúng, không xuất vượt tồn; kiểm thử thiếu hàng, sai chi nhánh và nhận lệch số lượng.

**Cần xác nhận:** Cách biểu diễn hàng đang vận chuyển và cách xử lý số lượng thực nhận lệch so với số lượng xuất; không tự giả định số lượng lệch sẽ tự động được cộng hết vào kho đích.

## 4. Phân loại 26 Use Case

Bảng dưới là **đề xuất phạm vi triển khai** dựa trên ba luồng trọng tâm; nhóm có thể điều chỉnh theo thời gian, nhưng vẫn phải giữ đầy đủ yêu cầu của giảng viên.

| UC | Tên Use Case theo tài liệu | Phân loại đề xuất | Lý do |
|---|---|---|---|
| UC01 | Đăng ký tài khoản | Hỗ trợ cốt lõi | Khách hàng sử dụng hệ thống |
| UC02 | Đăng nhập / Đăng xuất | Hỗ trợ cốt lõi | Xác thực nhiều vai trò |
| UC03 | Quản lý thông tin cá nhân | Hỗ trợ cốt lõi | Địa chỉ nhận hàng |
| UC04 | Quản lý tài khoản và phân quyền nhân viên | Hỗ trợ cốt lõi | Admin tạo tài khoản và RBAC |
| UC05 | Xem, tìm kiếm và lựa chọn sản phẩm | Hỗ trợ cốt lõi | Bắt đầu luồng mua |
| UC06 | Quản lý danh mục, sản phẩm, biến thể và hình ảnh | Hỗ trợ cốt lõi | Danh mục/biến thể cho bán và kho |
| UC07 | Quản lý nhà cung cấp | Hỗ trợ cốt lõi | Dữ liệu đầu vào nhập hàng |
| UC08 | Lập đơn nhập hàng | **Luồng A – bắt buộc** | Tạo chứng từ nhập |
| UC09 | Tiếp nhận hàng và lập phiếu nhập | **Luồng A – bắt buộc** | Transaction tăng tồn |
| UC10 | Kiểm tra tồn kho tại chi nhánh | **Luồng C – bắt buộc** | Xác định tồn khả dụng |
| UC11 | Điều chuyển hàng giữa các chi nhánh | **Luồng C – bắt buộc** | Nghiệp vụ đa chi nhánh |
| UC12 | Kiểm kê và điều chỉnh tồn kho | Mở rộng | Xử lý chênh lệch thực tế |
| UC13 | Quản lý giỏ hàng | **Luồng B – bắt buộc** | Chuẩn bị đặt hàng |
| UC14 | Đặt hàng trực tuyến | **Luồng B – bắt buộc** | Tạo đơn và giữ tồn |
| UC15 | Thanh toán đơn hàng | **Luồng B – bắt buộc** | COD/thanh toán mô phỏng |
| UC16 | Theo dõi trạng thái đơn hàng | Hỗ trợ cốt lõi | Hiển thị tiến trình đơn |
| UC17 | Xử lý đơn hàng | **Luồng B – bắt buộc** | Nhân viên xác nhận/xử lý |
| UC18 | Quản lý giao hàng | Hỗ trợ cốt lõi | Hoàn chỉnh tiến trình giao/hoàn tất |
| UC19 | Hủy đơn hàng | Hỗ trợ cốt lõi | Giải phóng tồn đã giữ |
| UC20 | Quản lý mã giảm giá | Mở rộng | Khuyến mại |
| UC21 | Áp dụng mã giảm giá | Mở rộng | Phụ thuộc UC20 |
| UC22 | Đánh giá sản phẩm đã mua | Mở rộng | Không ảnh hưởng ba luồng chính |
| UC23 | Yêu cầu trả hàng | Mở rộng | Nghiệp vụ hậu mãi |
| UC24 | Xử lý trả hàng và hoàn tiền | Mở rộng | Cần quy tắc hoàn kho/hoàn tiền riêng |
| UC25 | Thống kê và báo cáo kinh doanh | **Bắt buộc** | Ít nhất 2 báo cáo từ CSDL |
| UC26 | Quản lý thông tin chi nhánh | Hỗ trợ cốt lõi | Dữ liệu chi nhánh xuất/nhận |

> **Lưu ý:** “Bắt buộc” ở cột trên là **phạm vi ưu tiên nội bộ đề xuất**, không đồng nghĩa giảng viên yêu cầu từng UC cụ thể. Thông báo giảng viên yêu cầu **ba luồng nghiệp vụ hoàn chỉnh**, **hai nhóm quyền**, **hai báo cáo**, cùng các tiêu chí CSDL và triển khai.

## 5. Báo cáo và truy vấn dự kiến

Ưu tiên ít nhất hai màn hình báo cáo từ **PostgreSQL thật** (UC25):

1. **Báo cáo doanh thu/đơn hàng theo thời gian và chi nhánh:** tổng doanh thu hợp lệ, số đơn theo trạng thái, bộ lọc thời gian/chi nhánh.
2. **Báo cáo tồn kho theo chi nhánh và biến thể:** số lượng thực tế, đang giữ, khả dụng; có thể thống kê mặt hàng sắp hết hoặc lịch sử nhập/xuất.

Làm rõ định nghĩa “doanh thu” (đơn đã thanh toán, đã giao hay đã hoàn tất) trong `business-rules.md` để tránh thống kê sai.

Nhóm xây dựng **ít nhất 8 truy vấn nghiệp vụ khác nhau**, có JOIN, tổng hợp, truy vấn con/EXISTS, CTE, window function, tìm kiếm/lọc/phân trang; **ít nhất 1 VIEW** được ứng dụng thực tế. Danh sách truy vấn và view cụ thể sẽ được thiết kế ở giai đoạn Database/Backend.

## 6. Phạm vi dữ liệu và kỹ thuật phải hoàn thành

- **Schema và toàn vẹn:** ít nhất 6 bảng nghiệp vụ có ý nghĩa, đầy đủ PK/FK và ràng buộc phù hợp; ERD khớp PostgreSQL thực tế.
- **Hai bộ dữ liệu:** bộ demo dễ kiểm chứng và bộ dữ liệu lớn cùng schema, có script tái tạo; ít nhất 3 bảng nghiệp vụ ≥ 10.000 dòng và 1 bảng ≥ 100.000 dòng.
- **Transaction:** ít nhất một luồng ghi ≥ 2 bảng trong cùng transaction, có ca lỗi chứng minh rollback. Luồng nhập hàng UC09 là ứng viên phù hợp.
- **Concurrency:** ít nhất một kịch bản **hai kết nối thực sự chạy chồng lấn**, chẳng hạn đặt mua cùng biến thể có tồn kho hạn chế; chứng minh không bán vượt số lượng.
- **Index/benchmark:** ít nhất 2 index ngoài PK/UNIQUE, phân tích 2 truy vấn trước/sau tối ưu, có `EXPLAIN (ANALYZE, BUFFERS)`, một truy vấn trên bảng ≥ 100.000 dòng.
- **Migration:** ít nhất một thay đổi schema versioned trên CSDL đã có dữ liệu; kiểm tra dữ liệu cũ.
- **Backup/restore:** sao lưu và thử khôi phục, có kết quả đối chiếu.
- **3 VM:** Frontend, Backend và PostgreSQL + storage chạy trên 3 máy ảo riêng, có địa chỉ mạng riêng; không thay bằng 3 container trên cùng VM.
- **Kiểm thử và minh chứng:** test tự động cho nghiệp vụ dữ liệu, bằng chứng Issue/branch/commit/PR/review, tài liệu chạy/triển khai, minh chứng cá nhân.

**Số bảng:** nhóm có thể hướng tới mô hình nhiều bảng nếu nghiệp vụ thực sự cần, nhưng **20–30 bảng không phải ngưỡng bắt buộc của thông báo giảng viên**; ưu tiên mô hình hợp lý, không tạo bảng dư thừa.

## 7. Ranh giới phạm vi

### Trong phạm vi ưu tiên

- Cửa hàng của một doanh nghiệp, nhiều chi nhánh.
- Tài khoản khách hàng và tài khoản nhân viên do Admin quản lý.
- Quản lý danh mục, sản phẩm, biến thể, tồn kho theo chi nhánh.
- Ba luồng nhập hàng, đặt hàng, điều chuyển kho có kiểm thử.
- Xử lý trạng thái đơn, hủy và giải phóng tồn theo điều kiện.
- Báo cáo doanh thu và tồn kho dùng SQL trên PostgreSQL.
- Công việc SQL, transaction, concurrency, hiệu năng, migration, backup/restore và 3 VM theo thông báo giảng viên.

### Ngoài phạm vi ưu tiên / mở rộng nếu còn thời gian

- Kiểm kê/chỉnh tồn chi tiết (UC12).
- Mã giảm giá và áp mã giảm giá (UC20–UC21).
- Đánh giá sản phẩm (UC22).
- Trả hàng và hoàn tiền (UC23–UC24).
- Tích hợp thanh toán hoặc vận chuyển với nhà cung cấp thực tế: **không được yêu cầu rõ là bắt buộc** trong tài liệu 26 UC; mô phỏng phù hợp được đề cập tại UC15. Nếu muốn tích hợp thật, cần cân đối phạm vi và công sức.

**Không cắt bỏ** các chức năng tối thiểu cần để ba luồng nghiệp vụ thật sự hoàn chỉnh hoặc các tiêu chí kỹ thuật do giảng viên quy định.

## 8. Phân công và bàn giao giai đoạn M1

| Issue | Phụ trách | Sản phẩm chính |
|---|---|---|
| [#2 – Planning](https://github.com/tien160760-web/RETAIL_WEB/issues/2) | Dương Đức Tiến | Thống nhất phạm vi, phân công, tài liệu, quy trình |
| [#3 – Database](https://github.com/tien160760-web/RETAIL_WEB/issues/3) | Phạm Đức Thắng | ERD, danh sách bảng, thiết kế schema |
| [#4 – Admin UI](https://github.com/tien160760-web/RETAIL_WEB/issues/4) | Phạm Ngọc Tài | Figma quản trị, báo cáo |
| [#5 – Customer UI](https://github.com/tien160760-web/RETAIL_WEB/issues/5) | Vũ Mạnh Hiếu | Figma khách hàng |
| [#6 – Backend](https://github.com/tien160760-web/RETAIL_WEB/issues/6) | Dương Đức Tiến | Kiến trúc FastAPI, module và API Contract |

Mỗi Issue cần được người kiểm tra review và có sản phẩm bàn giao tương ứng. Deadline nội bộ dự kiến của M1: **12/11/2026**.

## 9. Các quyết định cần ghi nhận chi tiết / xác nhận

Các mục dưới đây **không được quy định đầy đủ trong hai tài liệu nguồn** hoặc chưa có văn bản ghi rõ lựa chọn cuối cùng của nhóm. Cần cụ thể hóa trước khi đóng thiết kế:

- [ ] Quyền truy cập dữ liệu của từng vai trò, đặc biệt dữ liệu theo chi nhánh.
- [ ] Chính sách chọn chi nhánh bán hàng và xử lý một đơn qua nhiều chi nhánh (nếu có).
- [ ] Trạng thái đơn, điều kiện hủy, thời điểm giữ/giải phóng/trừ tồn.
- [ ] Phạm vi mô phỏng thanh toán online; thời điểm ghi nhận doanh thu.
- [ ] Trạng thái điều chuyển, hàng đang vận chuyển và chênh lệch thực nhận.
- [ ] Giới hạn/phê duyệt sử dụng Next.js so với yêu cầu React của giảng viên.
- [ ] Nhánh Git tích hợp chính và quy tắc review/merge.
- [ ] Danh sách bảng dự kiến cho bộ 10.000/100.000 dòng và định nghĩa báo cáo.

Các quyết định sau khi thống nhất nên được ghi vào `docs/business-rules.md` và biên bản họp, có đường dẫn trong Issue #2, #3 và #6.

## 10. Nguồn tài liệu

1. [Thông báo Project cuối kỳ 2026](https://github.com/user-attachments/files/34435468/Thong_bao_Project_cuoi_ky_2026.pdf) – yêu cầu chấm và nghiệm thu của giảng viên.
2. [Tài liệu đặc tả 26 Use Case](https://github.com/user-attachments/files/34435467/Use_Case_He_Thong_Ban_Hang_26_UC.docx) – UC01 đến UC26, Actor, luồng chính, ngoại lệ và kết quả.
3. [Issue #2 – Planning](https://github.com/tien160760-web/RETAIL_WEB/issues/2) – nơi theo dõi thống nhất phạm vi và phân công.

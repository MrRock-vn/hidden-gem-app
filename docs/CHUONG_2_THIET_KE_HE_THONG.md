# CHƯƠNG 2: THIẾT KẾ HỆ THỐNG

---

## 2.1. Mô tả bài toán thực tế của ứng dụng Hidden Gem

Trong bối cảnh nhu cầu trải nghiệm không gian độc đáo và chia sẻ địa điểm ngày càng gia tăng, việc thiết kế một ứng dụng di động định vị kết hợp mạng xã hội như **Hidden Gem** hướng đến mục tiêu giải quyết cụ thể các bài toán thực tế sau:

### 2.1.1. Tối ưu hóa quá trình khám phá không gian của người dùng
Người dùng cần một giải pháp trực quan hỗ trợ việc tìm kiếm, phân loại và định vị các địa điểm mới lạ xung quanh vị trí hiện tại. 

Hệ thống phải cung cấp giao diện bản đồ động tương tác tốt, hiển thị khoảng cách địa lý thực tế dựa trên dữ liệu GPS, giúp người dùng đưa ra quyết định di chuyển nhanh chóng và chính xác.

### 2.1.2. Xây dựng môi trường chia sẻ thông tin khách quan và tính tương tác cao
Hệ thống cần cung cấp các chức năng tương tác cộng đồng chuẩn mực như thích bài viết, thảo luận chi tiết thông qua các bình luận phân nhánh, theo dõi các tài khoản có cùng sở thích trải nghiệm. 

Việc chia sẻ các bài đăng địa điểm kèm hình ảnh thực tế chất lượng cao giúp duy trì tính khách quan của nguồn thông tin, giảm thiểu sự ảnh hưởng từ các hoạt động quảng cáo thương mại.

### 2.1.3. Đảm bảo an toàn thông tin và nâng cao quyền riêng tư cá nhân
Hệ thống phải thiết lập các cơ chế bảo vệ thông tin cá nhân của người dùng ở mức độ cao. 

Yêu cầu này bao gồm việc mã hóa mật khẩu đăng nhập bằng các thuật toán một chiều an toàn, cung cấp công cụ kiểm soát quyền riêng tư (chế độ tài khoản riêng tư) và triển khai chức năng chặn người dùng (Block) hiệu quả nhằm hạn chế các tương tác quấy rối không mong muốn.

### 2.1.4. Tối ưu hóa hiệu năng truy vấn không gian địa lý thời gian thực
Quy trình tìm kiếm địa điểm theo tọa độ bán kính cần được tối ưu hóa ở tầng cơ sở dữ liệu để đảm bảo tốc độ phản hồi nhanh chóng dưới 1 giây. 

Hệ thống phải xử lý mượt mà việc tải dữ liệu bản đồ động và danh sách địa điểm đồng thời, ngay cả khi có số lượng lớn người dùng cùng truy cập vào các giờ cao điểm.

### 2.1.5. Khả năng mở rộng kiến trúc và lưu trữ dữ liệu bất đồng bộ
Kiến trúc hệ thống cần hỗ trợ khả năng lưu trữ lượng lớn hình ảnh chất lượng cao và dữ liệu định vị phức tạp. 

Đồng thời, ứng dụng di động phải tích hợp cơ chế lưu trữ bộ nhớ đệm (caching) thông minh, giúp người dùng có thể duyệt thông tin ngoại tuyến và đồng bộ trạng thái bất đồng bộ ngay khi thiết bị kết nối Internet trở lại.

---

## 2.2. Đặc tả Quy trình Đăng ký và Đăng nhập hệ thống

Để bảo vệ quyền lợi người dùng và đảm bảo tính nhất quán của dữ liệu tương tác, hệ thống yêu cầu người dùng thiết lập tài khoản cá nhân. Quy trình xác thực được thiết kế dựa trên giao thức Email và hệ thống mã khóa bảo mật JWT.

### 2.2.1. Quy trình Đăng ký tài khoản (Sign Up Flow)
1. **Thu thập dữ liệu đầu vào:** Người dùng cung cấp Tên hiển thị (username), Địa chỉ Email và Mật khẩu (độ dài tối thiểu 6 ký tự) thông qua giao diện đăng ký.
2. **Kiểm duyệt dữ liệu (Client-side Validation):** Ứng dụng kiểm tra định dạng email và độ mạnh mật khẩu tại chỗ trước khi gửi yêu cầu lên máy chủ để tối ưu thời gian phản hồi.
3. **Mã hóa và Tạo bản ghi (Server-side Hashing & DB Creation):** Máy chủ thực hiện kiểm tra tính duy nhất của Email và Username trong cơ sở dữ liệu. Nếu hợp lệ, hệ thống tiến hành băm mật khẩu bằng thuật toán **BCrypt** với hệ số muối phù hợp, tạo bản ghi người dùng mới và phản hồi trạng thái thành công.

### 2.2.2. Quy trình Đăng nhập tài khoản (Sign In Flow)
1. **Yêu cầu đăng nhập:** Người dùng nhập địa chỉ Email đăng ký và Mật khẩu tại giao diện màn hình Đăng nhập.
2. **Xác thực và Cấp phát Token (Authentication & JWT Issuance):** Máy chủ truy vấn thông tin tài khoản theo Email, thực hiện so sánh đối chiếu mật khẩu nhập vào với chuỗi băm trong cơ sở dữ liệu bằng hàm so khớp của BCrypt. Nếu trùng khớp, hệ thống tạo bộ đôi mã khóa bảo mật bao gồm **Access Token** (thời hạn ngắn) và **Refresh Token** (thời hạn dài) chứa chữ ký số bảo mật JWT.
3. **Lưu trữ bảo mật tại Client (Secure Store Storage):** Máy chủ gửi phản hồi chứa thông tin người dùng và bộ mã khóa về ứng dụng di động. Ứng dụng tiến hành lưu trữ các token này một cách an toàn vào vùng nhớ bảo mật **SecureStore** của thiết bị để duy trì trạng thái đăng nhập.

### 2.2.3. Các tính năng bảo mật bổ sung trong quy trình xác thực
* **Tự động đăng nhập:** Mỗi lần người dùng khởi động ứng dụng, hệ thống tự động kiểm tra Access Token có sẵn trong thiết bị. Nếu token hết hạn, hệ thống sẽ tự động gọi API Refresh Token để cấp phát mã mới mà không yêu cầu người dùng nhập lại thông tin.
* **Đổi mật khẩu bảo mật:** Người dùng có thể chủ động thay đổi mật khẩu đăng nhập trong phân hệ cài đặt bằng cách cung cấp mật khẩu hiện tại làm điều kiện xác thực bắt buộc.
* **Hủy đăng nhập an toàn:** Khi người dùng thực hiện Đăng xuất, hệ thống sẽ thu hồi Refresh Token trên máy chủ và xóa sạch toàn bộ khóa bảo mật lưu trữ trong SecureStore của thiết bị di động.

---

## 2.3. Yêu cầu về chức năng hệ thống (Functional Requirements)

Ứng dụng **Hidden Gem** cần đáp ứng đầy đủ các yêu cầu chức năng nghiệp vụ chi tiết được chia thành 5 phân hệ cốt lõi sau:

### 2.3.1. Phân hệ Quản lý tài khoản và Quyền riêng tư
* **Đăng ký / Đăng nhập:** Cho phép tạo tài khoản và xác thực đăng nhập an toàn qua giao thức bảo mật JWT.
* **Quản lý thông tin cá nhân:** Hỗ trợ người dùng thay đổi ảnh đại diện, cập nhật tên hiển thị, viết tiểu sử ngắn và cập nhật địa điểm sinh sống.
* **Thiết lập quyền riêng tư:**
  * Hỗ trợ bật/tắt chế độ Tài khoản riêng tư (chỉ những tài khoản được duyệt theo dõi mới được xem bài đăng).
  * Hỗ trợ bật/tắt nhận thông báo hoạt động từ hệ thống.
* **Quản lý danh sách chặn (Block List):**
  * Hỗ trợ chức năng chặn người dùng đối với các tài khoản không phù hợp.
  * Tự động xóa mối quan hệ theo dõi giữa hai người dùng ở cả hai chiều ngay khi lệnh chặn được thực thi.
  * Hiển thị danh sách các tài khoản đang bị chặn và hỗ trợ thao tác bỏ chặn an toàn.

### 2.3.2. Phân hệ Khám phá và Định vị địa điểm
* **Dòng bảng tin địa điểm (Home Feed):** Hiển thị danh sách các bài đăng chia sẻ địa điểm từ cộng đồng dưới dạng các thẻ thông tin, cho phép lọc nhanh địa điểm theo các danh mục được định nghĩa sẵn.
* **Tìm kiếm nâng cao:** Hỗ trợ tìm kiếm địa điểm theo từ khóa văn bản, lọc nâng cao theo danh mục hoặc theo các hashtag chủ đề.
* **Bản đồ tương tác GPS:**
  * Hiển thị trực quan vị trí địa điểm dưới dạng các marker màu sắc đặc trưng trên bản đồ.
  * Tự động di chuyển góc nhìn camera bản đồ và zoom về tọa độ hiện tại của thiết bị người dùng.
  * Hỗ trợ cơ chế phản hồi điều hướng: Tự động di chuyển bản đồ đến tọa độ địa điểm mục tiêu và hiển thị thẻ xem nhanh khi có yêu cầu chuyển tiếp từ trang thông tin chi tiết.

### 2.3.3. Phân hệ Đóng góp và Xem chi tiết địa điểm
* **Đăng tải địa điểm mới:** Cho phép người dùng tạo bài viết đóng góp địa điểm bằng cách tải lên nhiều hình ảnh thực tế, nhập tên, mô tả chi tiết, địa chỉ, chọn danh mục phân loại và chấm tọa độ địa lý trực tiếp trên bản đồ nhỏ.
* **Xem chi tiết địa điểm:** Cung cấp thông tin đầy đủ về địa điểm (ảnh Carousel chất lượng cao, thông tin người đăng bài, nội dung mô tả, thẻ hashtag) và các liên kết điều hướng định vị sang tab bản đồ chính.

### 2.3.4. Phân hệ Tương tác mạng xã hội và Thông báo
* **Thích bài viết:** Hỗ trợ chức năng thích địa điểm với cơ chế cập nhật trạng thái giao diện tức thời ở phía Client nhằm nâng cao trải nghiệm phản hồi.
* **Thảo luận bình luận:** Cho phép viết bình luận chi tiết dưới các bài đăng địa điểm, hỗ trợ trả lời bình luận theo dạng phân nhánh để tối ưu hóa luồng hội thoại.
* **Theo dõi người dùng:** Hỗ trợ tính năng theo dõi giữa các tài khoản người dùng để thiết lập kết nối cộng đồng.
* **Thông báo hoạt động:** Tự động gửi thông báo đến tài khoản người dùng khi phát sinh các tương tác liên quan như có lượt thích mới, bình luận mới hoặc có tài khoản khác theo dõi.

### 2.3.5. Phân hệ Lưu trữ bộ sưu tập (Bookmarks)
* **Lưu địa điểm:** Cho phép người dùng lưu trữ các địa điểm ưa thích vào thư viện cá nhân.
* **Quản lý bộ sưu tập:** Hỗ trợ phân loại các địa điểm đã lưu vào các thư mục bộ sưu tập riêng biệt được cá nhân hóa theo từng mục đích sử dụng.

---

## 2.4. Yêu cầu phi chức năng (Non-Functional Requirements)

Bên cạnh các nghiệp vụ chức năng, hệ thống phải tuân thủ nghiêm ngặt các tiêu chuẩn phi chức năng sau để đảm bảo chất lượng vận hành thực tế:

### 2.4.1. Hiệu năng hệ thống (Performance)
* Thời gian phản hồi của các API dịch vụ cốt lõi (như đăng nhập, tải bảng tin, truy vấn địa điểm xung quanh) phải đạt mức dưới **1 giây** trong điều kiện kết nối mạng tiêu chuẩn.
* Cơ chế truy vấn không gian địa lý của PostGIS phải được tối ưu bằng các chỉ mục GIST để xử lý hàng ngàn bản ghi địa điểm mà không làm tăng thời gian phản hồi của máy chủ.

### 2.4.2. Khả năng bảo mật (Security)
* Toàn bộ dữ liệu truyền tải giữa thiết bị di động và máy chủ backend phải được mã hóa bảo mật thông qua giao thức HTTPS.
* Mật khẩu người dùng bắt buộc phải được mã hóa băm bằng thuật toán **BCrypt** trước khi lưu trữ trong cơ sở dữ liệu PostgreSQL.
* Token truy cập JWT phải được ký bằng thuật toán mã hóa khóa bí mật an toàn trên máy chủ và được lưu giữ tại vùng nhớ bảo mật SecureStore của thiết bị di động.

### 2.4.3. Độ tin cậy và Khả năng chịu lỗi (Reliability)
* Hệ thống phải đạt chỉ số sẵn sàng tối thiểu **99.9%** thời gian vận hành.
* Ứng dụng di động cần tích hợp cơ chế xử lý lỗi kết nối mạng thông minh thông qua React Query, tự động thử lại (retry) khi gặp sự cố gián đoạn kết nối mạng tạm thời và giữ nguyên dữ liệu đệm cũ để phục vụ trải nghiệm xem offline.

### 2.4.4. Tính tương thích và Khả năng sử dụng (Usability & Compatibility)
* Giao diện ứng dụng di động phải có tính tương thích cao với cả hai nền tảng hệ điều hành di động phổ biến hiện nay là **Android (phiên bản 8.0 trở lên)** và **iOS (phiên bản 13 trở lên)**.
* Hệ thống hỗ trợ Dark/Light theme chuyển đổi động tức thời, đảm bảo độ tương phản màu sắc đạt tiêu chuẩn bảo vệ thị lực của người dùng theo quy chuẩn hiển thị di động.

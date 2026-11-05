# Sổ tay làm việc repo Mark học AI

README.md mô tả cấu trúc trang và cách chạy script; file này là luật làm việc cho mọi phiên Claude.

- **Sang** là chủ dự án. PR được gộp khi Sang gắn nhãn `duyet` (workflow `tu-merge.yml` chờ check xanh rồi merge). Không ai khác tự gộp.
- Viết cho Sang bằng tiếng Việt, gọi "Sang", xưng "mình".
- Mỗi luồng Claude một nhánh `claude/...`, một PR. Không đẩy thẳng lên `main`, không đẩy lên nhánh của luồng khác.

## Luật GitHub an toàn (Sang chốt 30/10/2026)

Tài khoản sangdaden từng bị GitHub khóa hai lần (28/10 và 30/10), nhiều khả năng vì dùng GitHub chứa video cho Metricool và vì hoạt động tự động dồn dập. Mọi phiên Claude làm việc với repo này phải theo các luật sau.

- **G1. Không để media trên GitHub cho dịch vụ ngoài.** Không dùng raw.githubusercontent, releases, GitHub Pages (kể cả tên miền riêng markhocai.com) hay jsDelivr làm nơi chứa video, ảnh cho Metricool hay mạng xã hội. Media tải thẳng lên Metricool hoặc Google Drive.
- **G2. Một người, một tài khoản.** Đang bị khóa thì không tạo tài khoản mới, không thử đăng nhập nhiều lần, chỉ kháng nghị trong một ticket.
- **G3. Mỗi lúc chỉ một luồng đẩy code.** Các luồng khác giữ thay đổi thành file patch trong thư mục dự án. Mỗi giờ tối đa 1 PR mới, mỗi ngày khoảng 10 lần đẩy.
- **G4. 48 giờ yên lặng sau khi mở khóa.** Chỉ Sang dọn dẹp bằng tay. Không phiên Claude, lịch hẹn hay đẩy code nào trong thời gian này.
- **G5. Lịch hẹn đụng GitHub phải giãn ra.** Khi bị khóa thì tạm dừng hết. Sau khi mở lại, bật từng cái, mỗi ngày một cái, không để hai lịch đẩy code trong cùng một giờ.
- **G6. Actions chỉ để build, test, deploy.** Không render clip mạng xã hội trong Actions. Dùng `concurrency` với `cancel-in-progress: true`, giữ artifact 1–3 ngày. (Lịch chạy hằng ngày của `pages.yml` là deploy để bài báo tự mở đúng ngày, được phép.)
- **G7. Repo chỉ chứa code và asset cần cho trang web.** `*.mp4`, `*.mov` và thư mục render xem trước nằm trong `.gitignore`. File trên 10 MB phải hỏi Sang trước. Bốn video nhỏ (~1 MB) của trang Dịch vụ trong `assets/dich-vu/` là nội dung của chính trang nên được giữ; thêm video mới cho trang thì hỏi Sang và thêm bằng `git add -f`.

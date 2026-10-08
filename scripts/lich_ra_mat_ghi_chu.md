# Lịch ra mắt video (`data/lich-ra-mat.json`)

File này ghép số video (chuỗi) với ngày ra mắt `YYYY-MM-DD`, ví dụ `{"17": "2026-10-09"}`.

**Cách làm:** đọc lịch đăng trên Metricool (brand 7273613, múi giờ Asia/Ho_Chi_Minh, chỉ đọc), lấy ngày của bài TikTok dọc cho từng video, rồi so tiêu đề với `data/videos.json` để ra số video. Các video 03–11 đã đăng được đối chiếu thêm bằng số liệu TikTok.

**Trang dùng nó thế nào:**
- `app.js`: video có ngày sau hôm nay (giờ Việt Nam) hiện chip "Ra mắt dd/mm" thay cho "▶ YouTube". Dải "Hôm nay trên kênh" liệt kê video ra mắt đúng hôm nay. Thêm `?hom-nay=2026-10-09` vào link để thử một ngày khác.
- `bai-viet.js`: trang bài viết đổi nút "▶ Xem video" thành link kênh kèm ghi chú "Video ra mắt dd/mm".
- Video không có trong file thì được coi là đã ra mắt.

**Phải cập nhật file này mỗi khi lên lịch video mới** (hoặc dời lịch) trên Metricool. Nếu quên, video mới sẽ hiện link YouTube trước khi có video, và không xuất hiện trong dải "Hôm nay trên kênh".

Lúc tạo file (08/10/2026), lịch có đủ 114 video trong `videos.json`, từ 06/10 đến 29/10/2026.

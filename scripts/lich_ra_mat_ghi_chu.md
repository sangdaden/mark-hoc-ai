# Lịch ra mắt video (`data/lich-ra-mat.json`)

File này ghép số video (chuỗi) với ngày ra mắt `YYYY-MM-DD`, ví dụ `{"17": "2026-10-09"}`.

**Cách làm:** đọc lịch đăng trên Metricool (brand 7273613, múi giờ Asia/Ho_Chi_Minh, chỉ đọc), lấy ngày của bài TikTok dọc cho từng video, rồi so tiêu đề với `data/videos.json` để ra số video. Các video 03–11 đã đăng được đối chiếu thêm bằng số liệu TikTok.

**Trang dùng nó thế nào:**
- `app.js`: video có ngày sau hôm nay (giờ Việt Nam) hiện chip "Ra mắt dd/mm" thay cho "▶ YouTube". Dải "Hôm nay trên kênh" liệt kê video ra mắt đúng hôm nay. Thêm `?hom-nay=2026-10-09` vào link để thử một ngày khác.
- `bai-viet.js`: trang bài viết đổi nút "▶ Xem video" thành link kênh kèm ghi chú "Video ra mắt dd/mm".
- Video không có trong file thì được coi là đã ra mắt.

**Phải cập nhật file này mỗi khi lên lịch video mới** (hoặc dời lịch) trên Metricool. Nếu quên, video mới sẽ hiện link YouTube trước khi có video, và không xuất hiện trong dải "Hôm nay trên kênh".

Lúc tạo file (08/10/2026), lịch có đủ 114 video trong `videos.json`, từ 06/10 đến 29/10/2026.

Cập nhật 08/10/2026: thêm video 100 (tập đặc biệt, bản dọc 25/10) và 118–162 (29/10 đến 07/11/2026), lấy từ ngày bài TikTok dọc trên Metricool, khớp với `videos/ke-hoach-148-162/lich-dang-132-162.md`. Lịch có 160 video, từ 06/10 đến 07/11/2026.

Cập nhật 09/10/2026 (giờ VN): thêm video 01, 02 (series "Nhập môn AI", làm lại), bản dọc 01 đăng 9/10 00:40 và 02 đăng 9/10 07:00 trên TikTok/FB/IG (chưa có YouTube Shorts).

## Thêm video mới (từ 163 trở đi)
1. `python3 scripts/gom_video.py /mnt/project-files/videos <số cuối>` (hoặc nâng số mặc định `DEN` trong script). Chỉ đưa lên video đã render và đã lên lịch.
2. Đọc Metricool (chỉ đọc, `getScheduledPosts`, brand 7273613, múi giờ Asia/Ho_Chi_Minh, mỗi lần vài ngày), lấy ngày bài TikTok dọc của từng video, ghi vào file này (`"163": "YYYY-MM-DD"`). Đối chiếu với file `lich-dang-*.md` trong thư mục kế hoạch.
3. Series mới: thêm vào `data/series.json` (id, ten, tu, den, mo_ta, tags) và `data/en/series.json`. Không cần `sap_ra_mat`: chip "Ra mắt dd/mm" và nhãn "Sắp ra mắt" chạy theo ngày ở đây.
4. Tiêu đề SEO vào `data/bai-viet.json` và `data/en/bai-viet.json`; tên và mô tả tiếng Anh vào `data/en/videos.json`; bài dịch vào `data/en/bai/<số>-<slug>.json` (mỗi cảnh một mục, cảnh THỬ NGAY có `"try": true`, có prompt mẫu thì thêm `"prompt"`).
5. `python3 scripts/tao_bai_viet.py /mnt/project-files/videos` để tạo lại bài viết hai thứ tiếng và `sitemap.xml`. Không có "CẢNH BÁO" là đủ bản dịch.

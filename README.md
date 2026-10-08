# Mark học AI

Trang web của kênh **Mark học AI**: giới thiệu kênh, danh sách video theo series, link sang YouTube, TikTok và Facebook.

Trang tĩnh (HTML, CSS, JS thuần), đăng bằng GitHub Pages qua `.github/workflows/pages.yml`.

## Cấu trúc
- `index.html`, `style.css`, `app.js`: trang chính.
- `data/videos.json`: danh sách video (số, chủ đề, tiêu đề, mô tả). Tạo bằng `python3 scripts/gom_video.py /mnt/project-files/videos 117` (số cuối là video mới nhất đưa lên trang).
- `data/series.json`: tên, mô tả, khoảng số và thuật ngữ của từng series. Đổi `sap_ra_mat` thành `false` khi series đã đăng.
- `data/ban-do.json`: phần "Bắt đầu từ đây" (`#bat-dau`, link trong bio): 7 vùng của bản đồ kênh (video 97) và lộ trình 3 bước (video 99). Mỗi mục trỏ tới video đầu tiên bằng số `so`.
- `data/kenh.json`: link kênh và email liên hệ (để trống thì trang ẩn email).
- `assets/`: logo, ảnh đại diện, ảnh chia sẻ, mascot Mark và Bit (`mark-*.svg`, bản gốc ở `brand/mascot/chinh-thuc/`).

## Thêm video mới
1. Chạy `python3 scripts/gom_video.py` để cập nhật `data/videos.json`.
2. Nếu là series mới, thêm một mục vào `data/series.json`.
3. Commit và push lên `main`; GitHub Pages tự đăng lại.

## Gắn tên miền riêng
Tạo file `CNAME` chứa tên miền (ví dụ `markhocai.com`), rồi trỏ DNS theo hướng dẫn của GitHub Pages.

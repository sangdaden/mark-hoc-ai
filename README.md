# Mark học AI

Trang web của kênh **Mark học AI**: giới thiệu kênh, danh sách video theo series, link sang YouTube, TikTok và Facebook.

Trang tĩnh (HTML, CSS, JS thuần), đăng bằng GitHub Pages qua `.github/workflows/pages.yml`.

## Cấu trúc
- `index.html`, `style.css`, `app.js`: trang chính.
- `data/videos.json`: danh sách video (số, chủ đề, tiêu đề, mô tả). Tạo bằng `python3 scripts/gom_video.py /mnt/project-files/videos 162` (số cuối là video mới nhất đưa lên trang; mặc định 162). Từ video 132, tên video lấy từ `SERIES` và `NAME` trong `nguon/script.py`.
- `data/series.json`: tên, mô tả, khoảng số và thuật ngữ của từng series. Chữ "Sắp ra mắt" giờ theo ngày trong `data/lich-ra-mat.json` (series mới không cần `sap_ra_mat`). `"le": true` là nhóm video lẻ (không tính là series), như tập đặc biệt #100.
- `data/ban-do.json`: phần "Bắt đầu từ đây" (`#bat-dau`, link trong bio): 7 vùng của bản đồ kênh (video 97) và lộ trình 3 bước (video 99). Mỗi mục trỏ tới video đầu tiên bằng số `so`.
- `data/kenh.json`: link kênh và email liên hệ (để trống thì trang ẩn email).
- `bai/*.html`: một bài viết cho mỗi video (cho Google tìm thấy), `tu-dien.html` (Từ điển AI), `kiem-tra.html` (bài kiểm tra 10 câu) và `sitemap.xml`. Tạo bằng `python3 scripts/tao_bai_viet.py /mnt/project-files/videos` từ `nguon/script.py` và `tieu-de-mo-ta.md` của từng video. Đừng sửa tay các file này, sửa nguồn rồi chạy lại.
- `en/`: bản tiếng Anh của cả trang (cùng tên file). `en/index.html` viết tay, dùng chung `app.js` với dữ liệu dịch trong `data/en/`; `en/bai/*.html`, `en/tu-dien.html`, `en/kiem-tra.html` do cùng script tạo ra từ bản dịch `data/en/bai/*.json`, `data/en/series.json`, `data/en/videos.json`, `data/en/tu-dien.json`, `data/en/kiem-tra.json` (chỉ tạo bản tiếng Anh: `python3 scripts/tao_bai_viet.py --lang en`). Video mới cần thêm bản dịch vào các file này; chưa dịch thì bài tiếng Anh tạm dùng bản tiếng Việt. Nút EN/VI trên thanh đầu (`cai-dat.js`) chuyển qua lại giữa hai bản.
- `data/bai-viet.json`: tiêu đề SEO của từng bài (viết như câu người ta gõ tìm). `data/tu-dien.json`: thuật ngữ của Từ điển AI. `data/kiem-tra.json`: câu hỏi bài kiểm tra (từ video 98).
- `sach.html` (sách miễn phí), `lo-trinh-7-ngay.html` (Lộ trình 7 ngày, có giấy chứng nhận vẽ bằng `lo-trinh.js`), `hop-tac.html` (media kit cho nhãn hàng): cũng do `scripts/tao_bai_viet.py` tạo, kèm bản tiếng Anh trong `en/`. Nội dung lộ trình ở `data/lo-trinh-7-ngay.json` (bản dịch `data/en/lo-trinh-7-ngay.json`); số liệu trang hợp tác lấy từ dữ liệu video, không ghi số người theo dõi.
- `lam-theo.html` (Làm theo video): file mẫu, notebook Colab và prompt của các video hướng dẫn chuyên sâu (301, 302). Nội dung ở `data/lam-theo.json` (có sẵn bản vi và en), file tải ở `assets/lam-theo/`; cũng do `scripts/tao_bai_viet.py` tạo. Nút "Mở trong Google Colab" mở thẳng notebook trong repo này, nên repo phải để công khai.
- `assets/sach/`: ebook PDF, ảnh bìa và ảnh xem trước. Ebook dựng lại thì chạy `python3 scripts/cap_nhat_sach.py /mnt/project-files/ebook` (chép PDF, nén ảnh, ghi mục lục vào `data/sach.json`; tên chương tiếng Anh ở `data/en/sach.json`) rồi chạy lại `scripts/tao_bai_viet.py`.
- `assets/50-prompt-mau.pdf`: file PDF "50 prompt mẫu" (trang chủ và Từ điển AI đã có link tải, cần thêm file).
- `assets/`: logo, ảnh đại diện, ảnh chia sẻ, mascot Mark và Bit (`mark-*.svg`, bản gốc ở `brand/mascot/chinh-thuc/`).

## Thêm video mới
1. Chạy `python3 scripts/gom_video.py /mnt/project-files/videos <số cuối>` để cập nhật `data/videos.json`, và thêm ngày ra mắt vào `data/lich-ra-mat.json` (xem `scripts/lich_ra_mat_ghi_chu.md`).
2. Nếu là series mới, thêm một mục vào `data/series.json`.
3. Thêm tiêu đề SEO cho video mới vào `data/bai-viet.json` (và thuật ngữ mới vào `data/tu-dien.json`), bản dịch vào `data/en/` (`videos.json`, `series.json`, `bai-viet.json`, `bai/<số>-<slug>.json`), rồi chạy `python3 scripts/tao_bai_viet.py /mnt/project-files/videos`.
4. Commit và push lên `main`; GitHub Pages tự đăng lại.

## Gắn tên miền riêng
Trang chạy ở https://markhocai.com (file `CNAME`). Tên miền mua ở Namecheap, DNS trỏ về GitHub Pages: 4 bản ghi A cho `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) và CNAME `www` → `sangdaden.github.io`. Trong Settings → Pages của repo, ô Custom domain là `markhocai.com` và đã bật Enforce HTTPS. Đổi tên miền thì sửa cả `BASE` trong `scripts/tao_bai_viet.py`.

## Icon

`assets/icons.svg` gom các icon cần dùng từ [Lucide](https://lucide.dev) v0.460.0 (giấy phép ISC). Dùng: `<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#i-TEN"/></svg>`. Thêm icon mới: lấy file từ gói `lucide-static` rồi thêm một `<symbol id="i-TEN">`.

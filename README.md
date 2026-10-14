# Mark học AI

Trang web của kênh **Mark học AI**: giới thiệu kênh, danh sách video theo series, link sang YouTube, TikTok và Facebook.

Trang tĩnh (HTML, CSS, JS thuần), đăng bằng GitHub Pages qua `.github/workflows/pages.yml`.

## Cấu trúc
- `index.html`, `style.css`, `app.js`: trang chính.
- `data/videos.json`: danh sách video (số, chủ đề, tiêu đề, mô tả). Tạo bằng `python3 scripts/gom_video.py /mnt/project-files/videos 300` (số cuối là video mới nhất đưa lên trang; mặc định 300). Script cũng điền ngày ra mắt còn thiếu vào `data/lich-ra-mat.json` từ `so-cai.json`. Từ video 132, tên video lấy từ `SERIES` và `NAME` trong `nguon/script.py`.
- `data/series.json`: tên, mô tả, khoảng số và thuật ngữ của từng series. Chữ "Sắp ra mắt" giờ theo ngày trong `data/lich-ra-mat.json` (series mới không cần `sap_ra_mat`). `"le": true` là nhóm video lẻ (không tính là series), như tập đặc biệt #100.
- `data/ban-do.json`: phần "Bắt đầu từ đây" (`#bat-dau`, link trong bio): 7 vùng của bản đồ kênh (video 97) và lộ trình 3 bước (video 99). Mỗi mục trỏ tới video đầu tiên bằng số `so`.
- `data/kenh.json`: link kênh và email liên hệ (để trống thì trang ẩn email).
- `bai/*.html`: một bài viết cho mỗi video (cho Google tìm thấy), `tu-dien.html` (Từ điển AI), `kiem-tra.html` (bài kiểm tra 10 câu) và `sitemap.xml`. Tạo bằng `python3 scripts/tao_bai_viet.py /mnt/project-files/videos` từ `nguon/script.py` và `tieu-de-mo-ta.md` của từng video. Đừng sửa tay các file này, sửa nguồn rồi chạy lại.
- `en/`: bản tiếng Anh của cả trang (cùng tên file). `en/index.html` viết tay, dùng chung `app.js` với dữ liệu dịch trong `data/en/`; `en/bai/*.html`, `en/tu-dien.html`, `en/kiem-tra.html` do cùng script tạo ra từ bản dịch `data/en/bai/*.json`, `data/en/series.json`, `data/en/videos.json`, `data/en/tu-dien.json`, `data/en/bo-kiem-tra.json` (chỉ tạo bản tiếng Anh: `python3 scripts/tao_bai_viet.py --lang en`). Video mới cần thêm bản dịch vào các file này; chưa dịch thì bài tiếng Anh tạm dùng bản tiếng Việt. Nút EN/VI trên thanh đầu (`cai-dat.js`) chuyển qua lại giữa hai bản.
- `data/bai-viet.json`: tiêu đề SEO của từng bài (viết như câu người ta gõ tìm). `data/tu-dien.json`: thuật ngữ của Từ điển AI. `data/bo-kiem-tra.json`: các bộ câu hỏi của trang kiểm tra (4 bộ kiến thức chung, 8 bộ theo ngành; câu đúng/sai hoặc 4 lựa chọn), bản dịch `data/en/bo-kiem-tra.json` phải đủ và cùng thứ tự, thiếu là script dừng. Chấm điểm ở `kiem-tra.js`.
- `chung-nhan.html` (cả `en/`, viết tay) và `chung-nhan.js`: chứng nhận người học tự tạo trên máy (chủ đề, chuyên ngành, toàn diện), tải PNG, in PDF, thêm vào LinkedIn, link xác minh `?xm=`. Điểm lưu trong trình duyệt (`mhai-kiem-tra`), không có máy chủ nên đây không phải bằng cấp chính thức.
- `sach.html` (sách miễn phí), `lo-trinh-7-ngay.html` (Lộ trình 7 ngày, có giấy chứng nhận vẽ bằng `lo-trinh.js`), `hop-tac.html` (media kit cho nhãn hàng): cũng do `scripts/tao_bai_viet.py` tạo, kèm bản tiếng Anh trong `en/`. Nội dung lộ trình ở `data/lo-trinh-7-ngay.json` (bản dịch `data/en/lo-trinh-7-ngay.json`); số liệu trang hợp tác lấy từ dữ liệu video, không ghi số người theo dõi.
- `lam-theo.html` (Làm theo video): file mẫu, notebook Colab và prompt của các video hướng dẫn chuyên sâu (301, 302). Nội dung ở `data/lam-theo.json` (có sẵn bản vi và en), file tải ở `assets/lam-theo/`; cũng do `scripts/tao_bai_viet.py` tạo. Nút "Mở trong Google Colab" mở thẳng notebook trong repo này, nên repo phải để công khai.
- `hoi-bit.html` + `en/hoi-bit.html` (Hỏi Bit, viết tay): gõ câu hỏi tự nhiên, `hoi-bit.js` chấm điểm ngay trên trình duyệt các đoạn của mọi bài video và Từ điển AI rồi trả lời bằng đúng đoạn đó, kèm link tới bài. Dữ liệu `data/hoi-dap.json` và `data/en/hoi-dap.json` tạo bằng `python3 scripts/tao_hoi_dap.py` (đọc `bai/*.html`, `en/bai/*.html`), chạy lại sau mỗi lần chạy `scripts/tao_bai_viet.py`. Ô tìm trang chủ và menu Bit có lối tắt sang trang này.
- `vu-tru-khac.html` (Mark ở vũ trụ khác, viết tay; bản Anh `en/vu-tru-khac.html` "Another Universe"): góc đọc sách ngoài chủ đề AI. Lối vào: nút `.vtk-nut` (vòng tròn quỹ đạo `i-orbit` kèm chữ "Vũ Trụ Khác"), đứng đầu hàng nút mạng xã hội ở chân trang mọi trang (cả `en/`), cách YouTube một khoảng, và khoảng 1/6 phiên Bit rủ ghé một lần (`bit-tro-ly.js`). Bài từng cuốn ở `vu-tru-khac/<slug>.html` và `en/vu-tru-khac/<slug>.html` (bản dịch ở `books/<slug>/<slug>.en.html`), tạo bằng `python3 scripts/tao_vu_tru_khac.py /mnt/project-files/books` từ bài phân tích của dự án Book Research (`books/<slug>/<slug>.html`); danh sách bài ở `data/vu-tru-khac.json`, mỗi bài thuộc một chủ đề qua `"loai"` (thiếu thì là `"sach"`), các chủ đề ở `data/vu-tru-khac-chu-de.json`. Script bỏ mục "Ghi chú riêng" và nhãn bản nháp, rồi viết lại chip lọc và các khối chủ đề trong `vu-tru-khac.html` (giữa `<!-- vtk:dau -->` và `<!-- vtk:cuoi -->`). Ở góc này Bit ngủ (`assets/bit-ngu.svg`): không tự nói, bấm vào thì nói mớ và dẫn về Mark học AI. Đừng sửa tay `vu-tru-khac/*.html`. Trước khi mở PR thêm sách, cập nhật nhánh theo `main` rồi chạy lại script, để trang mới có đủ giao diện chung (`assets/vu-tru-khac/doc.css`, `doc.js`) và cả các trang sách cũ cũng được tạo lại theo bản mới nhất.
- Discord: khu "📚 MARK Ở VŨ TRỤ KHÁC" trên server Mark học AI (`bài-mới` chỉ đọc, `bàn-về-sách`, `gợi-ý-sách`) tạo bằng `python3 scripts/tao_discord_vu_tru_khac.py` (cùng cách với `tao_server.py` lúc dựng server: dùng bot "Mark hoc AI Setup", dán token khi chạy, `--thu` để chạy thử). Chạy lại an toàn: cái gì đã có thì bỏ qua.
- `assets/sach/`: ebook PDF, ảnh bìa và ảnh xem trước. Ebook dựng lại thì chạy `python3 scripts/cap_nhat_sach.py /mnt/project-files/ebook` (chép PDF, nén ảnh, ghi mục lục vào `data/sach.json`; tên chương tiếng Anh ở `data/en/sach.json`) rồi chạy lại `scripts/tao_bai_viet.py`.
- `assets/50-prompt-mau.pdf`: file PDF "50 prompt mẫu" (trang chủ và Từ điển AI đã có link tải, cần thêm file).
- `assets/`: logo, ảnh đại diện, ảnh chia sẻ, mascot Mark và Bit (`mark-*.svg`, bản gốc ở `brand/mascot/chinh-thuc/`).

## Thêm video mới
1. Chạy `python3 scripts/gom_video.py /mnt/project-files/videos <số cuối>` để cập nhật `data/videos.json`, và thêm ngày ra mắt vào `data/lich-ra-mat.json` (xem `scripts/lich_ra_mat_ghi_chu.md`).
2. Nếu là series mới, thêm một mục vào `data/series.json`.
3. Thêm tiêu đề SEO cho video mới vào `data/bai-viet.json` (và thuật ngữ mới vào `data/tu-dien.json`), bản dịch vào `data/en/` (`videos.json`, `series.json`, `bai-viet.json`, `bai/<số>-<slug>.json`), rồi chạy `python3 scripts/tao_bai_viet.py /mnt/project-files/videos`.
4. Commit và push lên `main`; GitHub Pages tự đăng lại.

## Kiểm tra trước khi merge
Mỗi PR chạy `.github/workflows/kiem-tra.yml` (`python3 scripts/kiem_tra_trang.py`): trang tiếng Việt và tiếng Anh phải đi thành cặp (`X.html` ↔ `en/X.html`, cả `bai/` và `vu-tru-khac/`), mọi trang (trừ trang chuyển hướng) nạp `theo-doi.js`, link và ảnh nội bộ trỏ tới file có thật, `data/**/*.json` đọc được, mọi địa chỉ trong `sitemap.xml` có file. PR vừa sửa góc Vũ Trụ Khác vừa sửa phần khác thì có cảnh báo (không chặn). Chạy tay trước khi mở PR: `python3 scripts/kiem_tra_trang.py`.

## Gắn tên miền riêng
Trang chạy ở https://markhocai.com (file `CNAME`). Tên miền mua ở Namecheap, DNS trỏ về GitHub Pages: 4 bản ghi A cho `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) và CNAME `www` → `sangdaden.github.io`. Trong Settings → Pages của repo, ô Custom domain là `markhocai.com` và đã bật Enforce HTTPS. Đổi tên miền thì sửa cả `BASE` trong `scripts/tao_bai_viet.py`.

## Icon

`assets/icons.svg` gom các icon cần dùng từ [Lucide](https://lucide.dev) v0.460.0 (giấy phép ISC). Dùng: `<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#i-TEN"/></svg>`. Thêm icon mới: lấy file từ gói `lucide-static` rồi thêm một `<symbol id="i-TEN">`.

`assets/nen-tang.svg` gom biểu tượng YouTube, TikTok, Facebook, Instagram, Threads, Discord từ [Simple Icons](https://simpleicons.org) v13.21.0 (CC0), tô đúng màu hãng trên ô tròn trắng (`.nt`, `.nt-<tên>` trong `style.css`). Chỉ dùng làm link tới kênh của Mark học AI; link lấy từ `data/kenh.json`.

## Ảnh của video mới (từ video 303)
`python3 scripts/tao_anh.py /mnt/project-files/videos` tạo ảnh WebP vào `assets/anh/` và ghi danh sách vào `data/anh.json`: ảnh bìa video (thẻ 640 px trong danh sách, 1280 px đầu bài viết) lấy từ `<tên>_thumbnail_ngang-16x9.png`; không có thì dùng ảnh dọc đặt trên nền mờ, không có nữa thì tự vẽ ảnh mẫu có Mark và Bit. Script cũng cắt 2-3 khung hình minh họa từ video (mỗi ảnh ở gần cuối một cảnh giải thích, mốc cảnh lấy từ `_moc.json` hoặc khoảng lặng giữa các cảnh trong tiếng) đặt dưới đoạn giải thích tương ứng trong bài, kèm chú thích. Chạy lại bao nhiêu lần cũng được (ảnh đã có thì bỏ qua, `--lam-lai` để tạo lại). Chỉ làm cho video có số từ `VIDEO_MOI_TU` trong `scripts/video_moi.py` (hiện là 303); video 01–302 cố ý không có ảnh riêng (Sang chốt 9/10/2026), trang giữ thẻ chữ như cũ, nên lúc này `data/anh.json` còn rỗng. Chạy trước `scripts/tao_bai_viet.py`.

## Logo công cụ trong bài (video mới, từ 303)
`scripts/tao_bai_viet.py` dò tên công cụ (ChatGPT, Claude, Gemini, Gmail, Excel, Python... bảng `CONG_CU`) trong tiêu đề và nội dung bài tiếng Việt: công cụ có trong tiêu đề hoặc được nhắc từ 2 lần thì hiện ô "Công cụ trong bài" với logo trong `assets/cong-cu/` (chép nguyên từ `brand/icon-dich-vu/`, không sửa), cuối bài có dòng miễn trừ. Bài chuyện tiêu cực (lừa đảo, deepfake, sự cố...) không có logo. Theo `brand/quy-tac-dung-thuong-hieu.md`. Chỉ cho video từ `VIDEO_MOI_TU`.

## Ảnh bìa series
Cũng do `scripts/tao_anh.py` tạo (mọi series, không theo ngưỡng video mới): `assets/anh/series/<id>.webp` (480x270, đầu series) và `<id>-nho.webp` (96x54, nút chọn series), danh sách ở `data/series-bia.json`. Nguồn: thumbnail bản ngang trọn bộ trong `videos/ke-hoach-*/` (bảng `TRON_BO` trong script nối series với tên file khi tên không khớp), không có thì thumbnail phần 1, không có nữa thì ảnh mẫu có tên series. Series mới có bản trọn bộ: chạy lại script với `--lam-lai` hoặc xóa ảnh cũ của series đó.

## Mark và Bit chuyển động
`python3 scripts/tao_mascot.py` lấy 8 trong 16 khung của từng trạng thái ở `brand/mascot/chinh-thuc/trang-thai/dong/<tên>/`, ghi WebP động nhỏ (cao 150 px, 16-37 KB) và một ảnh đứng yên vào `assets/mascot/`. Dùng ở: câu trả lời bài kiểm tra và câu hỏi Lộ trình 7 ngày (đúng, chưa đúng), tìm không ra video, khung sách và khung Lộ trình trên trang chủ, Bit lúc đang nói. Người bật "giảm chuyển động" thấy ảnh đứng yên (`<source media="(prefers-reduced-motion: reduce)">`).

## Trình phát YouTube trong bài (video mới, từ 303)
`python3 scripts/cap_nhat_youtube.py` (chạy mỗi tuần, sau khi cập nhật sổ cái) đọc `videos/so-cai/so-cai.json`, lấy mã các bài YouTube đã đăng (`PUBLISHED`, `publicUrl`), ưu tiên video dài rồi tới Short, ghi `data/youtube-id.json` cho video từ `VIDEO_MOI_TU`. Bài có mã thì đầu bài là ảnh bìa có nút phát, bấm mới tải trình phát `youtube-nocookie.com` (`bai-viet.js`); chưa có mã thì ảnh bìa kèm biểu tượng các nền tảng. Thử giao diện: `--thu 303=<mã 11 ký tự>` (đừng dùng khi đăng thật). Chạy xong thì chạy `scripts/tao_bai_viet.py`.

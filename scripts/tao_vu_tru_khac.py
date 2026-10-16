#!/usr/bin/env python3
"""Tạo góc "Mark ở vũ trụ khác": các bài phân tích sách (ngoài chủ đề AI) từ dự án Book Research.

Dùng: python3 scripts/tao_vu_tru_khac.py /mnt/project-files/books

- Danh sách sách ở data/vu-tru-khac.json (mỗi mục một slug, chữ tiếng Anh trong "en", kể cả "ten" khi tên sách tiếng Việt khác tên tiếng Anh). Mục "bia" lấy màu từ bìa
  sách cho nền đầu bài (chữ đầu bài luôn màu kem nên nền phải tối): nen_1 (màu nền chính), nen_2 (màu sáng hơn ở góc), nhan (màu nhấn: viền, nhãn, chip),
  hoa_tiet ("trang" = trăng khuyết, "but-chi" = dải bút chì, "song" = dải sóng nước, "hong-tam" = hồng tâm đỏ trắng, "bon-mau" = dải bốn màu xanh/đỏ/vàng/lục, bỏ trống = không có). Thiếu "bia" thì dùng navy/cam.
  Bìa thật: lấy màu và một hình đơn giản gợi nhớ bìa (Sang 13/10: hình phải nhận ra được cuốn sách), tự vẽ lại; không chép bố cục, chữ tựa hay tranh của bìa.
  "minh_hoa" (chữ mô tả hình, tiếng Anh trong "en") = hình tự vẽ ở assets/vu-tru-khac/minh-hoa/<slug>.svg,
  script chèn thay dải SVG dưới tiêu đề của bài gốc (hoặc thêm sau tiêu đề nếu bài không có). Bài gốc:
  <thư mục sách>/<slug>/<slug>.html (tiếng Việt) và <slug>.en.html (bản dịch tiếng Anh; thiếu thì bản
  tiếng Anh tạm dùng bài tiếng Việt và script báo). Đó là trang Artifact không có khung <html>/<head>;
  script bọc khung, thêm thanh quay về trang và giao diện chung assets/vu-tru-khac/doc.css (đặt cuối trang để phủ CSS
  riêng của bài: màu navy/cam, font Mark học AI, mục lục cột trái) cùng doc.js (thanh tiến độ đọc, tô sáng mục
  đang đọc), rồi ghi ra vu-tru-khac/<slug>.html và en/vu-tru-khac/<slug>.html.
  Đừng sửa tay các file đó, sửa bài gốc rồi chạy lại.
- Bỏ phần "Ghi chú riêng" (để Sang tự điền, không đăng công khai) và nhãn bản nháp.
- Trang chủ góc (vu-tru-khac.html, en/vu-tru-khac.html) chia theo chủ đề vì góc sẽ không chỉ có sách (Sang 13/10):
  các chủ đề ở data/vu-tru-khac-chu-de.json (ma, ten, nhan = chữ trên thẻ, dem = chữ sau số bài, ho_so = chữ trên tab thẻ thông tin
  ở đầu bài, tiếng Anh trong "en"),
  mỗi mục trong data/vu-tru-khac.json thuộc một chủ đề qua "loai" (thiếu thì là "sach"). Script viết lại hàng chip lọc
  và các khối chủ đề giữa <!-- vtk:dau --> và <!-- vtk:cuoi -->; thẻ mỗi bài là bìa thu nhỏ vẽ từ tên, tác giả, "bia" (màu, hoạ tiết), hình tự vẽ assets/vu-tru-khac/bia/<slug>.svg nếu có và một tư thế Mark ("mark": doc-sach, thac-mac, a-ra-the, cam-sach,
  vui-mung, ngac-nhien, like, chao, buon-ngu), bên dưới chỉ có số bài, tên, tác giả · năm · điểm. Mỗi khối chỉ hiện một hàng (ít nhất 4 thẻ), còn lại sau nút "Xem thêm". Chủ đề chưa có bài thì
  chưa hiện. Thêm chủ đề mới = thêm một dòng chủ đề rồi thêm bài có "loai" đó; đường dẫn bài vẫn là vu-tru-khac/<slug>.html.
- Tạo lại sitemap.xml (scripts/tao_sitemap.py; file này không lưu trong git, pages.yml tạo khi đăng web).
"""
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

R = Path(__file__).resolve().parent.parent
BASE = "https://markhocai.com/"
esc = lambda s: html.escape(str(s or ""), quote=True)


def dong_sitemap(tien_to=""):
    """Các dòng sitemap của góc sách cho một ngôn ngữ ("" hoặc "en/")."""
    sach = json.loads((R / "data" / "vu-tru-khac.json").read_text(encoding="utf-8"))
    dong = [f"  <url><loc>{BASE}{tien_to}vu-tru-khac.html</loc><priority>0.5</priority></url>"]
    dong += [f'  <url><loc>{BASE}{tien_to}vu-tru-khac/{b["slug"]}.html</loc><priority>0.5</priority></url>'
             for b in sorted(sach, key=lambda b: b["so"])]
    return dong


def cap_nhat_sitemap():
    # sitemap.xml tạo từ chính các file .html (scripts/tao_sitemap.py), không lưu trong git
    import tao_sitemap
    print(f"  sitemap.xml: {tao_sitemap.ghi()} trang")


def lam_sach(s, en=False):
    # Bỏ mục "Ghi chú riêng" và link tới nó trong mục lục
    s = re.sub(r'\s*<section id="ghi-chu">.*?</section>', "", s, flags=re.S)
    s = re.sub(r'<a href="#ghi-chu">[^<]*</a>', "", s)
    # Nhãn nháp ở đầu bài và chân bài
    s = re.sub(r'<span class="draft">[^<]*</span>', f'<span class="draft">{"Mark ở vũ trụ khác · Another Universe" if en else "Mark ở vũ trụ khác"}</span>', s, count=1)
    s = re.sub(r"\s*·\s*(Kho nghiên cứu sách cá nhân|Personal book research|Mark Ở Vũ Trụ Khác)\s*·\s*(Bản nháp|Draft) [^.<]*\.", ".", s)
    return s


def chen_minh_hoa(bai, b, mo_ta):
    """Thay dải SVG dưới tiêu đề bài bằng hình tự vẽ (chỉ sửa bản bọc, không sửa bài gốc)."""
    hinh = (R / "assets/vu-tru-khac/minh-hoa" / f'{b["slug"]}.svg').read_text(encoding="utf-8").strip()
    hinh = hinh.replace(' xmlns="http://www.w3.org/2000/svg"', "").replace(
        "<svg ", f'<svg class="minh-hoa" style="max-width:100%" role="img" aria-label="{esc(mo_ta)}" ', 1)
    dau = re.search(r"<header\b.*?</header>", bai, re.S)
    if not dau:
        sys.exit(f'{b["slug"]}: bài không có <header> để chèn hình minh hoạ')
    h = dau.group(0)
    h2, n = re.subn(r"<svg\b.*?</svg>", lambda m: hinh, h, count=1, flags=re.S)
    if not n:
        h2 = re.sub(r"(</h1>)", lambda m: m.group(1) + "\n" + hinh, h, count=1)
    return bai[:dau.start()] + h2 + bai[dau.end():]


def chen_chia_se(bai, b, en, p):
    """Khối chia sẻ cuối bài, ngay trước <footer> của bài gốc (Sang 15/10, giống bài viết Mark học AI): nút chia sẻ của máy
    (điện thoại: Zalo, Messenger...), Facebook, chép link. Nút máy và chép link do doc.js bật; theo-doi.js đếm sự kiện "chia-se"."""
    if 'class="vtk-chia-se"' in bai:
        return bai
    e = b.get("en", {}) if en else b
    url = f'{BASE}{"en/" if en else ""}vu-tru-khac/{b["slug"]}.html'
    fb = "https://www.facebook.com/sharer/sharer.php?u=" + quote(url, safe="")
    ic = lambda n: f'<svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-{n}"/></svg>'
    khoi = (f'<aside class="vtk-chia-se" aria-label="{"Share this article" if en else "Chia sẻ bài này"}">'
            f'<p>{"Found this useful? Send it to a friend" if en else "Thấy bài có ích? Gửi cho một người bạn"}</p><div>'
            f'<button type="button" data-chia-se data-url="{esc(url)}" data-tieu-de="{esc(e.get("ten", b["ten"]))}" hidden>{ic("share")}{"Share" if en else "Chia sẻ"}</button>'
            f'<a href="{esc(fb)}" target="_blank" rel="noopener"><svg class="ic" aria-hidden="true"><use href="{p}assets/nen-tang.svg#nt-facebook"/></svg>Facebook</a>'
            f'<button type="button" data-chep-link="{esc(url)}" hidden>{ic("link")}{"Copy link" if en else "Chép link"}</button>'
            '</div></aside>\n')
    i = bai.rfind("<footer")
    return bai[:i] + khoi + bai[i:] if i >= 0 else bai + "\n" + khoi


def trang_sach(b, goc, en=False, cd=None, sau=None):
    e = b.get("en", {}) if en else b
    ten = (f'{e.get("ten", b["ten"])} ({b["tac_gia"]}): summary, review and lessons | Another Universe' if en
           else f'{b["ten"]} ({b["tac_gia"]}): tóm tắt, đánh giá và bài học | Mark ở vũ trụ khác')
    url = f'{BASE}{"en/" if en else ""}vu-tru-khac/{b["slug"]}.html'
    p = "../../" if en else "../"   # đường về thư mục gốc (assets)
    bai = lam_sach(goc, en)
    # Bỏ <title> của Artifact, dùng tiêu đề của trang
    bai = re.sub(r"^\s*<title>.*?</title>\s*", "", bai, flags=re.S)
    if b.get("minh_hoa"):
        bai = chen_minh_hoa(bai, b, e.get("minh_hoa", b["minh_hoa"]))
    bai = chen_ray(bai, b, en, cd, sau, p)
    bai = chen_video(bai, b, en, p)
    # Ô góc trống của bảng là ô thường, không phải tiêu đề cột (axe: empty-table-header)
    bai = bai.replace("<th></th>", "<td></td>")
    bai = chen_chia_se(bai, b, en, p)
    bia = b.get("bia", {})
    mau_bia = "".join(f"--bia-{k}: {bia[v]}; " for k, v in (("1", "nen_1"), ("2", "nen_2"), ("nhan", "nhan")) if bia.get(v))
    mau_bia = f"\nbody, body header {{ {mau_bia}}}" if mau_bia else ""
    if bia.get("nhan"):
        mau_bia += f"\n:root {{ --vtk-nhan: {bia['nhan']}; }}"
    # Chữ trên tab của thẻ thông tin ở đầu bài (doc.css): "ho_so" của chủ đề, ví dụ "Thẻ sách", "Hồ sơ vụ việc"
    ho_so = ((cd or {}).get("en", {}) if en else (cd or {})).get("ho_so")
    if ho_so:
        mau_bia += "\nbody header { --ho-so: " + json.dumps(ho_so, ensure_ascii=False) + "; }"
    lop_bia = f' class="bia-{esc(bia["hoa_tiet"])}"' if bia.get("hoa_tiet") else ""
    return f'''<!doctype html>
<html lang="{"en" if en else "vi"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(ten)}</title>
<meta name="description" content="{esc(e.get("mo_ta", b["mo_ta"]))}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="vi" href="{BASE}vu-tru-khac/{b["slug"]}.html">
<link rel="alternate" hreflang="en" href="{BASE}en/vu-tru-khac/{b["slug"]}.html">
<link rel="alternate" hreflang="x-default" href="{BASE}vu-tru-khac/{b["slug"]}.html">
<meta property="og:site_name" content="Mark học AI">
<meta property="og:locale" content="{"en_US" if en else "vi_VN"}">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(ten)}">
<meta property="og:description" content="{esc(e.get("mo_ta", b["mo_ta"]))}">
<meta property="og:url" content="{url}">
{the_og(b, en, e.get("ten", b["ten"]))}
<meta name="theme-color" content="#0F172A">
<link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon-32.png?v=dev">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png?v=dev">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;800&family=Inter:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<script>try{{var t=localStorage.getItem("mhai-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<script src="{p}theo-doi.js?v=dev" defer></script>
<style>
body {{ margin: 0; }}
.mhai-thanh {{ position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 12px;
  margin: 0 -16px; padding: 8px 16px; background: #0F172A; border-bottom: 2px solid #F59E0B;
  font: 600 .92rem/1.2 system-ui, sans-serif; }}
.mhai-thanh a, .mhai-thanh button {{ color: #FFF7ED; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }}
.mhai-thanh a:hover, .mhai-thanh button:hover {{ color: #FBBF24; }}
/* Nút quay về góc và nút đổi giao diện: viên thuốc viền hổ phách, cao 44px cho dễ bấm (Sang 13/10: nút cũ nhỏ quá) */
.mhai-thanh .vtk-ve, .mhai-thanh .mhai-theme {{ min-height: 44px; box-sizing: border-box; padding: 4px 16px 4px 10px; border: 1.5px solid rgb(251 191 36 / .55);
  border-radius: 999px; background: rgb(255 255 255 / .06); font: inherit; cursor: pointer; transition: background .15s, border-color .15s; }}
.mhai-thanh .vtk-ve:hover, .mhai-thanh .mhai-theme:hover {{ background: rgb(251 191 36 / .14); border-color: #FBBF24; }}
.mhai-thanh .vtk-ve > i {{ font: 700 1.6rem/1 system-ui, sans-serif; font-style: normal; color: #FBBF24; margin-top: -3px; }}
.mhai-thanh .vtk-ve img {{ height: 38px; width: auto; }}
.mhai-thanh .mhai-theme {{ padding: 4px 14px; }}
.mhai-thanh .mhai-theme svg {{ width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }}
.mhai-thanh .mhai img {{ width: 24px; height: 24px; border-radius: 50%; }}
.mhai-thanh span {{ display: inline-flex; gap: 14px; align-items: center; }}
@media (max-width: 560px) {{ .mhai-thanh .mhai b, .mhai-thanh .mhai-theme b {{ display: none; }} .mhai-thanh .mhai-theme {{ padding: 4px 11px; }} }}
@media (max-width: 380px) {{ .mhai-thanh .vtk-ve img {{ height: 30px; }} .mhai-thanh span {{ gap: 10px; }} }}{mau_bia}
</style>
</head>
<body{lop_bia}>
<nav class="mhai-thanh" aria-label="{"Site" if en else "Điều hướng web"}"><a class="vtk-ve" href="../vu-tru-khac.html" aria-label="{"Back to Another Universe" if en else "Về Mark ở vũ trụ khác"}"><i aria-hidden="true">‹</i><img src="{p}assets/vu-tru-khac/logo-ngang-toi.webp" alt="Mark ở vũ trụ khác" width="760" height="168"></a><span><button type="button" class="mhai-theme" hidden></button>{'<a href="../../vu-tru-khac/' + b["slug"] + '.html" hreflang="vi" lang="vi">VI</a>' if en else '<a href="../en/vu-tru-khac/' + b["slug"] + '.html" hreflang="en" lang="en">EN</a>'}<a class="mhai" href="../" aria-label="Mark học AI"><img src="{p}assets/logo.png" alt="" width="24" height="24"><b>Mark học AI</b></a></span></nav>
<main id="noi-dung">
{bai.strip()}
</main>
<link rel="stylesheet" href="{p}assets/vu-tru-khac/doc.css?v=dev">{tro_choi(b, p)}
<script src="{p}assets/vu-tru-khac/doc.js?v=dev" defer></script>
</body>
</html>
'''


def the_og(b, en, ten):
    """Ảnh chia sẻ riêng của bài (Sang 15/10): ảnh 1200×630 do scripts/tao_vu_tru_khac_og.js xuất từ bìa ở trang góc,
    vì Facebook không đọc ảnh SVG. Chưa có ảnh thì dùng ảnh chung của web. Kèm thẻ twitter:card ảnh lớn."""
    tep = f'assets/vu-tru-khac/og/{"en/" if en else ""}{b["slug"]}.jpg'
    if not (R / tep).exists():
        return (f'<meta property="og:image" content="{BASE}assets/og.png">\n<meta name="twitter:card" content="summary_large_image">')
    alt = (f"Cover of {ten}: Mark in Another Universe" if en else f"Bìa {ten}: Mark ở vũ trụ khác")
    return (f'<meta property="og:image" content="{BASE}{tep}">\n<meta property="og:image:type" content="image/jpeg">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            f'<meta property="og:image:alt" content="{esc(alt)}">\n<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:image" content="{BASE}{tep}">')


def ma_youtube(b, en=False):
    """Mã video YouTube của bài: trường "youtube" trong data/vu-tru-khac.json (link dạng watch?v=, youtu.be/, shorts/ hay mã 11 ký tự);
    bản EN dùng "youtube" trong b["en"] nếu có video tiếng Anh, không thì dùng video tiếng Việt."""
    link = ((b.get("en") or {}).get("youtube") if en else None) or b.get("youtube")
    if not link:
        return None, False
    m = re.search(r"(?:v=|youtu\.be/|shorts/|embed/|live/)([\w-]{11})", link) or re.fullmatch(r"([\w-]{11})", link.strip())
    if not m:
        sys.exit(f'{b["slug"]}: không đọc được mã video từ "youtube": {link}')
    return m.group(1), bool(en and not (b.get("en") or {}).get("youtube"))


def chen_video(bai, b, en, p):
    """Bài có video YouTube (Sang 15/10): khối "Xem video" ngay dưới đầu bài, mục đầu tiên trong mục lục, nút trong cột tiện ích.
    Ảnh xem trước tự vẽ theo màu bìa (hình bìa + Mark), bấm vào thì mới nạp trình phát youtube-nocookie ngay trong trang (doc.js);
    kèm link mở trên YouTube. Bài chưa có video thì trang giữ nguyên."""
    ma, tieng_viet = ma_youtube(b, en)
    if not ma:
        return bai
    e = b.get("en", {}) if en else b
    ten = e.get("ten", b["ten"])
    tep = R / "assets/vu-tru-khac/bia" / f'{b["slug"]}.svg'
    hinh = ('<span class="h">' + tep.read_text(encoding="utf-8").strip().replace(' xmlns="http://www.w3.org/2000/svg"', "") + "</span>") if tep.exists() else ""
    mark = b.get("mark") if b.get("mark") in TU_THE else TU_THE[(b["so"] - 1) % len(TU_THE)]
    xem = f"https://www.youtube.com/watch?v={ma}"
    khoi = (f'<section id="video" class="vtk-video">\n<h2>{"Watch the video" if en else "Xem video"}</h2>\n'
            f'<p class="vtk-video-mo">{"Prefer watching? Mark tells this story in a short video." if en else "Thích xem hơn đọc? Mark kể lại câu chuyện này trong một video ngắn."}'
            f'{" <span>(in Vietnamese)</span>" if tieng_viet else ""}</p>\n'
            f'<div class="vtk-video-khung"><button type="button" class="vtk-video-xem" data-ma="{ma}" data-ten="{esc(ten)}" '
            f'aria-label="{("Play video: " if en else "Phát video: ") + esc(ten)}">'
            f'<span class="vtk-video-bia" aria-hidden="true"><i>{esc(ten)}</i>{hinh}<img src="{p}assets/vu-tru-khac/mark/{mark}.svg" alt="" width="300" height="340" loading="lazy"></span>'
            f'<span class="vtk-video-nut" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span></button></div>\n'
            f'<p class="vtk-video-yt"><a href="{xem}" target="_blank" rel="noopener">{"Open on YouTube" if en else "Mở trên YouTube"} ↗</a></p>\n</section>\n')
    # Đặt sau mục lục (điện thoại: hàng chip mục lục vẫn ngay dưới đầu bài), bài không có mục lục thì sau đầu bài
    bai, n = re.subn(r'(<nav class="toc"[^>]*>.*?</nav>\s*)', lambda m: m.group(1) + khoi, bai, count=1, flags=re.S)
    if not n:
        bai, n = re.subn(r"(</header>\s*)", lambda m: m.group(1) + khoi, bai, count=1)
    if not n:
        sys.exit(f'{b["slug"]}: bài không có mục lục hay </header> để chèn khối video')
    toc = f'<a class="vtk-toc-video" href="#video">{"Watch the video" if en else "Xem video"}</a>'
    bai = re.sub(r'(<nav class="toc"[^>]*>)', lambda m: m.group(1) + toc, bai, count=1)
    nut = (f'<a class="vtk-ray-video" href="#video"><svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-play"/></svg>'
           f'<span><small>{"Video" if en else "Video"}</small>{"Watch on this page" if en else "Xem ngay trong trang"}</span></a>')
    return re.sub(r'(<p class="vtk-ray-o"><small>)', lambda m: nut + m.group(1), bai, count=1)


def chen_ray(bai, b, en, cd, sau, p):
    """Cột tiện ích bên phải trang đọc trên máy tính (Sang 13/10): bìa nhỏ của bài (hình bìa tự vẽ + tư thế Mark như thẻ ở
    trang góc), thời gian đọc còn lại (doc.js cập nhật khi cuộn), nút tới trò chơi của bài, bài tiếp theo cùng chủ đề.
    Thêm Mark đọc sách dưới mục lục. doc.css chỉ hiện cột từ 1280px, Mark dưới mục lục từ 1000px."""
    e = b.get("en", {}) if en else b
    ten = e.get("ten", b["ten"])
    so_chu = len(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style|svg)\b.*?</\1>", " ", bai, flags=re.S)).split())
    phut = max(1, round(so_chu / 200))
    tep = R / "assets/vu-tru-khac/bia" / f'{b["slug"]}.svg'
    hinh = ('<span class="h">' + tep.read_text(encoding="utf-8").strip().replace(' xmlns="http://www.w3.org/2000/svg"', "") + "</span>") if tep.exists() else ""
    mark = b.get("mark") if b.get("mark") in TU_THE else TU_THE[(b["so"] - 1) % len(TU_THE)]
    ra = [f'<aside class="vtk-ray" aria-label="{"Reading tools" if en else "Tiện ích đọc"}">',
          f'<div class="vtk-ray-bia" aria-hidden="true"><i>{esc(ten)}</i>{hinh}<img src="{p}assets/vu-tru-khac/mark/{mark}.svg" alt="" width="300" height="340"></div>',
          f'<p class="vtk-ray-o"><small>{"Time left" if en else "Còn lại"}</small><b class="vtk-con-lai" data-phut="{phut}" data-chu="{"en" if en else "vi"}">'
          f'{f"about {phut} min read" if en else f"khoảng {phut} phút đọc"}</b></p>']
    tc = R / "data" / "vu-tru-khac-tro-choi.json"
    tro = json.loads(tc.read_text(encoding="utf-8")).get(b["slug"]) if tc.exists() else None
    for g in ([tro] if isinstance(tro, dict) else tro or []):
        nhan = (g.get("en" if en else "vi") or {}).get("nhan", "")
        ra.append(f'<a class="vtk-ray-choi" href="#{esc(g["id"])}"><svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-gamepad"/></svg>'
                  f'<span><small>{"Play" if en else "Chơi thử"}</small>{esc(nhan)}</span></a>')
    if sau:
        es = sau.get("en", {}) if en else sau
        ra.append(f'<a class="vtk-ray-o vtk-ray-tiep" href="{esc(sau["slug"])}.html"><small>{"Up next" if en else "Bài tiếp theo"}</small>'
                  f'<b>{esc(es.get("ten", sau["ten"]))}</b><span>{esc(((cd or {}).get("en", {}) if en else (cd or {})).get("nhan", ""))} #{sau["so"]:03d} →</span></a>')
    ra.append("</aside>")
    bai = re.sub(r'(<div class="wrap">)', lambda m: m.group(1) + "\n" + "".join(ra), bai, count=1)
    mark_toc = (f'<span class="vtk-toc-mark" aria-hidden="true"><img src="{p}assets/vu-tru-khac/mark-doc-sach.svg" alt="" width="150" height="170">'
                f'<small>{"Mark is reading with you" if en else "Mark đang đọc cùng bạn"}</small></span>')
    return re.sub(r'(<nav class="toc"[^>]*>.*?)(</nav>)', lambda m: m.group(1) + mark_toc + m.group(2), bai, count=1, flags=re.S)


def tro_choi(b, p):
    """Trò chơi tương tác của bài (data/vu-tru-khac-tro-choi.json, khuôn ở assets/vu-tru-khac/tro-choi.js), đặt trước doc.js để mục lục có link tới trò."""
    tc = R / "data" / "vu-tru-khac-tro-choi.json"
    ds = json.loads(tc.read_text(encoding="utf-8")).get(b["slug"]) if tc.exists() else None
    if not ds:
        return ""
    du_lieu = json.dumps(ds, ensure_ascii=False).replace("</", "<\\/")
    return (f'\n<link rel="stylesheet" href="{p}assets/vu-tru-khac/tro-choi.css?v=dev">'
            f'\n<script type="application/json" id="vtk-tro-choi">{du_lieu}</script>'
            f'\n<script src="{p}assets/vu-tru-khac/tro-choi.js?v=dev" defer></script>')


# Tư thế Mark trên bìa thu nhỏ: SVG gốc ở assets/vu-tru-khac/mark/<tư thế>.svg (chép từ branding/mark-chuan, không vẽ lại, không lật).
# Mỗi bài chọn bằng "mark" trong data/vu-tru-khac.json; thiếu thì lấy lần lượt theo số bài.
TU_THE = ["doc-sach", "thac-mac", "a-ra-the", "cam-sach", "vui-mung", "ngac-nhien", "like", "chao", "buon-ngu"]


def co_tro_choi():
    """Các slug có trò chơi tương tác (khoá trong data/vu-tru-khac-tro-choi.json, bỏ khoá ghi chú bắt đầu bằng _)."""
    tc = R / "data" / "vu-tru-khac-tro-choi.json"
    return {k for k in json.loads(tc.read_text(encoding="utf-8")) if not k.startswith("_")} if tc.exists() else set()


def the_bai(b, cd, en=False):
    e = b.get("en", {}) if en else b
    bia = b.get("bia") or {}
    mau = "".join(f"--{k}: {esc(bia[v])};" for k, v in (("bia-1", "nen_1"), ("bia-2", "nen_2"), ("bia-nhan", "nhan")) if bia.get(v))
    ten = e.get("ten", b["ten"])
    tg = " · ".join(esc(x) for x in (b.get("tac_gia"), b.get("nam"), b.get("diem")) if x)
    mark = b.get("mark") if b.get("mark") in TU_THE else TU_THE[(b["so"] - 1) % len(TU_THE)]
    lop = (" bia-" + esc(bia["hoa_tiet"]) if bia.get("hoa_tiet") else "") + (" dai" if max(map(len, str(ten).split())) > 8 else "")
    # Bìa tự vẽ cho bài không phải sách (thí nghiệm, thảm hoạ...): có assets/vu-tru-khac/bia/<slug>.svg thì chèn hình đó lên bìa thẻ
    tep_hinh = R / "assets/vu-tru-khac/bia" / f'{b["slug"]}.svg'
    hinh = ""
    if tep_hinh.exists():
        hinh = '<span class="vtk-hinh">' + tep_hinh.read_text(encoding="utf-8").strip().replace(' xmlns="http://www.w3.org/2000/svg"', "") + "</span>"
        lop += " co-hinh"
    # Bài có trò chơi tương tác (data/vu-tru-khac-tro-choi.json): gắn nhãn "Tương tác" kiểu nhãn Xem nhiều/Mới bên trang AI (.hh)
    nhan = ""
    if b["slug"] in co_tro_choi():
        nhan = (f'<span class="hh hh-choi vtk-nhan"><svg class="ic" aria-hidden="true"><use href="{"../" if en else ""}assets/icons.svg#i-gamepad"/></svg>'
                f'{"Interactive" if en else "Tương tác"}</span>')
    # Bài có video YouTube: nút phát tròn màu đỏ ló ra ở góc trái bìa (chỉ biểu tượng, để không đụng nhãn "Tương tác" trên bìa hẹp)
    if ma_youtube(b, en)[0]:
        nhan += (f'<span class="vtk-nhan-video" title="{"Has a video" if en else "Có video"}" aria-hidden="true" '
                 f'style="position:absolute;z-index:3;top:-12px;left:-12px;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;'
                 f'background:#E11D2E;color:#fff;box-shadow:0 4px 12px -4px rgba(15,23,42,.6),0 0 0 2px rgb(255 255 255 / .85)">'
                 f'<svg viewBox="0 0 24 24" style="width:15px;height:15px;margin-left:2px;fill:currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>')
    return (f'<a class="vtk-the" href="vu-tru-khac/{esc(b["slug"])}.html" title="{esc(e.get("mo_ta", b.get("mo_ta")))}"{f" style={chr(34)}{mau}{chr(34)}" if mau else ""}>'
            f'{nhan}<span class="vtk-bia{lop}" aria-hidden="true"><i>{esc(ten)}</i>{hinh}'
            f'<img src="{"../" if en else ""}assets/vu-tru-khac/mark/{mark}.svg" alt="" width="300" height="340" loading="lazy"><small>{esc(b.get("tac_gia"))}</small></span>'
            f'<span class="vtk-so">{esc(cd["nhan"])} #{b["so"]:03d}</span>'
            f'<b>{esc(ten)}</b><span class="vtk-tg">{tg}</span></a>')


def trang_chu(sach, chu_de, en=False):
    """Hàng chip lọc + mỗi chủ đề một khối thẻ, bài có trò chơi trước rồi mới nhất trước. Lọc bằng script nhỏ trong trang (không có JS thì chip là link tới khối)."""
    cds = [dict(c, **c.get("en", {})) if en else c for c in chu_de]
    # Bài có trò chơi tương tác lên đầu khối (Sang 13/10) để thấy ngay không cần bấm "Xem thêm"; còn lại mới nhất trước
    choi = co_tro_choi()
    co = [(c, sorted((b for b in sach if b.get("loai", "sach") == c["ma"]), key=lambda b: (b["slug"] not in choi, -b["so"]))) for c in cds]
    co = [(c, ds) for c, ds in co if ds]
    tong = sum(len(ds) for _, ds in co)
    chip = [f'<a href="#tat-ca" data-loc="" aria-current="true">{"All" if en else "Tất cả"} <small>{tong}</small></a>']
    chip += [f'<a href="#{esc(c["ma"])}" data-loc="{esc(c["ma"])}">{esc(c["ten"])} <small>{len(ds)}</small></a>' for c, ds in co]
    chip.append(f'<span class="vtk-sap">{"+ New topics coming" if en else "+ Chủ đề mới · sắp mở"}</span>')
    ra = [f'  <nav class="vtk-loc" id="tat-ca" aria-label="{"Topics" if en else "Chủ đề"}">' + "".join(chip) + "</nav>"]
    for c, ds in co:
        ra.append(f'  <section class="vtk-khoi" id="{esc(c["ma"])}" data-loai="{esc(c["ma"])}">\n'
                  f'    <div class="vtk-khoi-dau"><h2 class="vtk-h">{esc(c["ten"])}</h2><span>{len(ds)} {esc(c["dem"])}</span></div>\n'
                  f'    <div class="vtk-ds">\n' + "\n".join("      " + the_bai(b, c, en) for b in ds) + "\n    </div>\n"
                  f'    <button class="vtk-them" type="button" hidden data-mo="{"Read more" if en else "Xem thêm"}" data-dong="{"Show less" if en else "Thu gọn"}">{"Read more" if en else "Xem thêm"}</button>\n  </section>')
    return "\n".join(ra), tong


def kiem_duong_dan(tep):
    """Mọi src/href tương đối trong các trang vừa tạo (cả VI lẫn en/) phải trỏ tới file có thật, tránh lỗi như ảnh Mark
    trên bìa bản tiếng Anh từng trỏ nhầm en/assets/ (13/10). Trả về danh sách lỗi."""
    loi = []
    for f in tep:
        s = f.read_text(encoding="utf-8")
        s = re.sub(r"<script>.*?</script>", "", s, flags=re.S)  # bỏ mã trong trang, chỉ xét thuộc tính HTML
        for u in re.findall(r'(?:src|href)="([^"]+)"', s):
            if re.match(r"^(?:[a-z]+:|//|#|data:)", u):
                continue
            duong = u.split("#")[0].split("?")[0]
            if duong and not (f.parent / duong).resolve().exists():
                loi.append(f"{f.relative_to(R)}: {u}")
    return loi


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    thu_muc = Path(sys.argv[1])
    sach = json.loads((R / "data" / "vu-tru-khac.json").read_text(encoding="utf-8"))
    chu_de = json.loads((R / "data" / "vu-tru-khac-chu-de.json").read_text(encoding="utf-8"))
    for b in sach:
        if b.get("loai", "sach") not in {c["ma"] for c in chu_de}:
            print(f"  {b['slug']}: \"loai\" = {b['loai']!r} chưa có trong data/vu-tru-khac-chu-de.json nên chưa hiện ở trang chủ góc")
    for en, goc_ra in ((False, R), (True, R / "en")):
        (goc_ra / "vu-tru-khac").mkdir(parents=True, exist_ok=True)
        for b in sach:
            nguon = thu_muc / b["slug"] / f'{b["slug"]}.html'
            if en:
                dich = thu_muc / b["slug"] / f'{b["slug"]}.en.html'
                if dich.exists():
                    nguon = dich
                else:
                    print(f"  CHƯA DỊCH {b['slug']}: bản tiếng Anh tạm dùng bài tiếng Việt (thiếu {dich})")
                if "en" not in b:
                    print(f"  CHƯA DỊCH {b['slug']}: data/vu-tru-khac.json thiếu mục \"en\"")
            if not nguon.exists():
                print(f"  bỏ qua {b['slug']}: không thấy {nguon}")
                continue
            ra = goc_ra / "vu-tru-khac" / f'{b["slug"]}.html'
            cd = next((c for c in chu_de if c["ma"] == b.get("loai", "sach")), None)
            # Bài tiếp theo cùng chủ đề (số kế tiếp, hết thì quay về bài đầu) cho cột tiện ích
            cung = sorted((x for x in sach if x.get("loai", "sach") == b.get("loai", "sach")), key=lambda x: x["so"])
            sau = next((x for x in cung if x["so"] > b["so"]), cung[0]) if len(cung) > 1 else None
            ra.write_text(trang_sach(b, nguon.read_text(encoding="utf-8"), en, cd, sau), encoding="utf-8")
            print(f"  {ra.relative_to(R)}")
        hub = goc_ra / "vu-tru-khac.html"
        s = hub.read_text(encoding="utf-8")
        khoi, tong = trang_chu(sach, chu_de, en)
        s, n = re.subn(r"(<!-- vtk:dau -->).*?(<!-- vtk:cuoi -->)", lambda m: m.group(1) + "\n" + khoi + "\n" + m.group(2), s, flags=re.S)
        if not n:
            sys.exit(f"{hub}: thiếu <!-- vtk:dau --> / <!-- vtk:cuoi -->")
        hub.write_text(s, encoding="utf-8")
        print(f"  {hub.relative_to(R)}: {tong} bài")
    cap_nhat_sitemap()
    tep = [R / "vu-tru-khac.html", R / "en" / "vu-tru-khac.html"] + sorted((R / "vu-tru-khac").glob("*.html")) + sorted((R / "en" / "vu-tru-khac").glob("*.html"))
    loi = kiem_duong_dan(tep)
    if loi:
        sys.exit("Đường dẫn hỏng (file không tồn tại):\n  " + "\n  ".join(loi))
    print(f"  kiểm tra đường dẫn: {len(tep)} trang, không có link hỏng")


if __name__ == "__main__":
    main()

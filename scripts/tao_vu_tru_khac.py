#!/usr/bin/env python3
"""Tạo góc "Mark ở vũ trụ khác": các bài phân tích sách (ngoài chủ đề AI) từ dự án Book Research.

Dùng: python3 scripts/tao_vu_tru_khac.py /mnt/project-files/books

- Danh sách sách ở data/vu-tru-khac.json (mỗi mục một slug). Bài gốc: <thư mục sách>/<slug>/<slug>.html,
  là trang Artifact không có khung <html>/<head>; script bọc khung, thêm thanh quay về trang và ghi ra
  vu-tru-khac/<slug>.html. Đừng sửa tay file đó, sửa bài gốc rồi chạy lại.
- Bỏ phần "Ghi chú riêng" (để Sang tự điền, không đăng công khai) và nhãn "Bản nháp".
- Viết lại danh sách thẻ sách trong vu-tru-khac.html, giữa <!-- sach:dau --> và <!-- sach:cuoi -->.
"""
import html
import json
import re
import sys
from pathlib import Path

R = Path(__file__).resolve().parent.parent
BASE = "https://markhocai.com/"
esc = lambda s: html.escape(str(s or ""), quote=True)


def lam_sach(s):
    # Bỏ mục "Ghi chú riêng" và link tới nó trong mục lục
    s = re.sub(r'\s*<section id="ghi-chu">.*?</section>', "", s, flags=re.S)
    s = re.sub(r'<a href="#ghi-chu">[^<]*</a>', "", s)
    # Nhãn nháp ở đầu bài và chân bài
    s = re.sub(r'<span class="draft">[^<]*</span>', '<span class="draft">Mark ở vũ trụ khác</span>', s, count=1)
    s = re.sub(r"\s*·\s*Kho nghiên cứu sách cá nhân\s*·\s*Bản nháp [0-9/]+\.", ".", s)
    return s


def trang_sach(b, goc):
    ten = f'{b["ten"]} ({b["tac_gia"]}): tóm tắt, đánh giá và bài học | Mark ở vũ trụ khác'
    url = f'{BASE}vu-tru-khac/{b["slug"]}.html'
    bai = lam_sach(goc)
    # Bỏ <title> của Artifact, dùng tiêu đề của trang
    bai = re.sub(r"^\s*<title>.*?</title>\s*", "", bai, flags=re.S)
    return f'''<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(ten)}</title>
<meta name="description" content="{esc(b["mo_ta"])}">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Mark học AI">
<meta property="og:locale" content="vi_VN">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(ten)}">
<meta property="og:description" content="{esc(b["mo_ta"])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}assets/og.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png?v=dev">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png?v=dev">
<script>try{{var t=localStorage.getItem("mhai-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<style>
body {{ margin: 0; }}
.mhai-thanh {{ position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 12px;
  margin: 0 -16px; padding: 10px 16px; background: var(--paper, #fff); border-bottom: 1px solid var(--rule, #ddd);
  font: 600 .92rem/1.2 system-ui, sans-serif; }}
.mhai-thanh a {{ color: var(--ink, #111); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }}
.mhai-thanh a:hover {{ color: var(--night, #2c3c8c); }}
.mhai-thanh img {{ width: 26px; height: 26px; border-radius: 50%; }}
</style>
</head>
<body>
<div class="mhai-thanh"><a href="../vu-tru-khac.html">‹ Mark ở vũ trụ khác</a><a href="../"><img src="../assets/logo.png" alt="" width="26" height="26">Mark học AI</a></div>
{bai.strip()}
</body>
</html>
'''


def the_sach(b):
    return (f'<a class="vtk-sach" href="vu-tru-khac/{esc(b["slug"])}.html">'
            f'<span class="vtk-so">Sách #{b["so"]:03d} · {esc(b["chu_de"])}</span>'
            f'<b>{esc(b["ten"])}</b><span class="vtk-tg">{esc(b["tac_gia"])} · {esc(b["nam"])}</span>'
            f'<span>{esc(b["mo_ta"])}</span><em>Đọc bài · {esc(b["diem"])} ›</em></a>')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    thu_muc = Path(sys.argv[1])
    sach = json.loads((R / "data" / "vu-tru-khac.json").read_text(encoding="utf-8"))
    (R / "vu-tru-khac").mkdir(exist_ok=True)
    for b in sach:
        nguon = thu_muc / b["slug"] / f'{b["slug"]}.html'
        if not nguon.exists():
            print(f"  bỏ qua {b['slug']}: không thấy {nguon}")
            continue
        (R / "vu-tru-khac" / f'{b["slug"]}.html').write_text(trang_sach(b, nguon.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"  vu-tru-khac/{b['slug']}.html")
    hub = R / "vu-tru-khac.html"
    s = hub.read_text(encoding="utf-8")
    the = "\n".join("      " + the_sach(b) for b in sorted(sach, key=lambda b: -b["so"]))
    s = re.sub(r"(<!-- sach:dau -->\n).*?(\s*<!-- sach:cuoi -->)", lambda m: m.group(1) + the + m.group(2), s, flags=re.S)
    hub.write_text(s, encoding="utf-8")
    print(f"  vu-tru-khac.html: {len(sach)} cuốn")


if __name__ == "__main__":
    main()

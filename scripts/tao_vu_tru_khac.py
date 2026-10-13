#!/usr/bin/env python3
"""Tạo góc "Mark ở vũ trụ khác": các bài phân tích sách (ngoài chủ đề AI) từ dự án Book Research.

Dùng: python3 scripts/tao_vu_tru_khac.py /mnt/project-files/books

- Danh sách sách ở data/vu-tru-khac.json (mỗi mục một slug, chữ tiếng Anh trong "en"). Bài gốc:
  <thư mục sách>/<slug>/<slug>.html (tiếng Việt) và <slug>.en.html (bản dịch tiếng Anh; thiếu thì bản
  tiếng Anh tạm dùng bài tiếng Việt và script báo). Đó là trang Artifact không có khung <html>/<head>;
  script bọc khung, thêm thanh quay về trang và ghi ra vu-tru-khac/<slug>.html và en/vu-tru-khac/<slug>.html.
  Đừng sửa tay các file đó, sửa bài gốc rồi chạy lại.
- Bỏ phần "Ghi chú riêng" (để Sang tự điền, không đăng công khai) và nhãn bản nháp.
- Viết lại danh sách thẻ sách trong vu-tru-khac.html và en/vu-tru-khac.html, giữa <!-- sach:dau --> và <!-- sach:cuoi -->.
- Cập nhật sitemap.xml: trang góc sách và từng cuốn, cả hai thứ tiếng (scripts/tao_bai_viet.py dùng cùng hàm dong_sitemap).
"""
import html
import json
import re
import sys
from pathlib import Path

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
    # Bỏ dòng góc sách cũ rồi chèn lại ngay sau trang phiêu lưu của từng ngôn ngữ (đúng thứ tự tao_bai_viet.py ghi)
    f = R / "sitemap.xml"
    dong = [d for d in f.read_text(encoding="utf-8").splitlines() if "vu-tru-khac" not in d]
    ra = []
    for d in dong:
        ra.append(d)
        for tien_to in ("", "en/"):
            if f"<loc>{BASE}{tien_to}phieu-luu.html</loc>" in d:
                ra += dong_sitemap(tien_to)
    f.write_text("\n".join(ra) + "\n", encoding="utf-8")
    print(f"  sitemap.xml: {sum('vu-tru-khac' in d for d in ra)} dòng góc sách")


def lam_sach(s, en=False):
    # Bỏ mục "Ghi chú riêng" và link tới nó trong mục lục
    s = re.sub(r'\s*<section id="ghi-chu">.*?</section>', "", s, flags=re.S)
    s = re.sub(r'<a href="#ghi-chu">[^<]*</a>', "", s)
    # Nhãn nháp ở đầu bài và chân bài
    s = re.sub(r'<span class="draft">[^<]*</span>', f'<span class="draft">{"Mark ở vũ trụ khác · Another Universe" if en else "Mark ở vũ trụ khác"}</span>', s, count=1)
    s = re.sub(r"\s*·\s*(Kho nghiên cứu sách cá nhân|Personal book research)\s*·\s*(Bản nháp|Draft) [0-9/]+\.", ".", s)
    return s


def trang_sach(b, goc, en=False):
    e = b.get("en", {}) if en else b
    ten = (f'{b["ten"]} ({b["tac_gia"]}): summary, review and lessons | Another Universe' if en
           else f'{b["ten"]} ({b["tac_gia"]}): tóm tắt, đánh giá và bài học | Mark ở vũ trụ khác')
    url = f'{BASE}{"en/" if en else ""}vu-tru-khac/{b["slug"]}.html'
    p = "../../" if en else "../"   # đường về thư mục gốc (assets)
    bai = lam_sach(goc, en)
    # Bỏ <title> của Artifact, dùng tiêu đề của trang
    bai = re.sub(r"^\s*<title>.*?</title>\s*", "", bai, flags=re.S)
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
<meta property="og:image" content="{BASE}assets/og.png">
<link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon-32.png?v=dev">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png?v=dev">
<script>try{{var t=localStorage.getItem("mhai-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<style>
body {{ margin: 0; }}
.mhai-thanh {{ position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 12px;
  margin: 0 -16px; padding: 8px 16px; background: #0F172A; border-bottom: 2px solid #F59E0B;
  font: 600 .92rem/1.2 system-ui, sans-serif; }}
.mhai-thanh a {{ color: #FFF7ED; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }}
.mhai-thanh a:hover {{ color: #FBBF24; }}
.mhai-thanh .vtk-ve img {{ height: 30px; width: auto; }}
.mhai-thanh .mhai img {{ width: 24px; height: 24px; border-radius: 50%; }}
.mhai-thanh span {{ display: inline-flex; gap: 16px; align-items: center; }}
@media (max-width: 420px) {{ .mhai-thanh .mhai b {{ display: none; }} }}
</style>
</head>
<body>
<div class="mhai-thanh"><a class="vtk-ve" href="../vu-tru-khac.html" aria-label="{"Back to Another Universe" if en else "Về Mark ở vũ trụ khác"}">‹ <img src="{p}assets/vu-tru-khac/logo-ngang-toi.webp" alt="Mark ở vũ trụ khác" width="760" height="168"></a><span>{'<a href="../../vu-tru-khac/' + b["slug"] + '.html" hreflang="vi" lang="vi">VI</a>' if en else '<a href="../en/vu-tru-khac/' + b["slug"] + '.html" hreflang="en" lang="en">EN</a>'}<a class="mhai" href="../"><img src="{p}assets/logo.png" alt="" width="24" height="24"><b>Mark học AI</b></a></span></div>
{bai.strip()}
</body>
</html>
'''


def the_sach(b, en=False):
    e = b.get("en", {}) if en else b
    return (f'<a class="vtk-sach" href="vu-tru-khac/{esc(b["slug"])}.html">'
            f'<span class="vtk-so">{"Book" if en else "Sách"} #{b["so"]:03d} · {esc(e.get("chu_de", b["chu_de"]))}</span>'
            f'<b>{esc(b["ten"])}</b><span class="vtk-tg">{esc(b["tac_gia"])} · {esc(b["nam"])}</span>'
            f'<span>{esc(e.get("mo_ta", b["mo_ta"]))}</span><em>{"Read" if en else "Đọc bài"} · {esc(b["diem"])} ›</em></a>')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    thu_muc = Path(sys.argv[1])
    sach = json.loads((R / "data" / "vu-tru-khac.json").read_text(encoding="utf-8"))
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
            ra.write_text(trang_sach(b, nguon.read_text(encoding="utf-8"), en), encoding="utf-8")
            print(f"  {ra.relative_to(R)}")
        hub = goc_ra / "vu-tru-khac.html"
        s = hub.read_text(encoding="utf-8")
        the = "\n".join("      " + the_sach(b, en) for b in sorted(sach, key=lambda b: -b["so"]))
        s = re.sub(r"(<!-- sach:dau -->\n).*?(\s*<!-- sach:cuoi -->)", lambda m: m.group(1) + the + m.group(2), s, flags=re.S)
        hub.write_text(s, encoding="utf-8")
        print(f"  {hub.relative_to(R)}: {len(sach)} cuốn")
    cap_nhat_sitemap()


if __name__ == "__main__":
    main()

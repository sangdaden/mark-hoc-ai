#!/usr/bin/env python3
"""Tạo góc "Bài báo AI": bài phân tích bài báo khoa học, mở sau video khoảng 1 tuần (Sang chốt 15/10/2026).

Dùng: python3 scripts/tao_bai_bao.py [--hom-nay YYYY-MM-DD] [--ra THƯ_MỤC]

- Nguồn ở bai-bao-nguon/: bai-bao.json (danh sách bài, đáp án mở khóa) và <slug>.vi.frag, <slug>.en.frag
  (đoạn HTML của thân bài, gồm các <section>; đuôi .frag để kiểm tra trang không coi là trang web). Thư mục này bị xoá khỏi bản đăng web (.github/workflows/pages.yml),
  nên trang web không bao giờ chứa đáp án hay chữ của bài chưa mở.
- Mỗi bài có "video" (số tập). Ngày video lên lấy từ "ngay_video", nếu trống thì từ data/lich-ra-mat.json.
  Ngày mở = "ngay_mo", nếu trống thì ngày video + 7.
- Trạng thái theo ngày hôm nay (giờ Việt Nam):
    sap  : chưa có ngày video hoặc video chưa lên -> chưa có trang, thẻ ở trang góc ghi "Sắp có video".
    khoa : video đã lên, chưa tới ngày mở -> trang hé lộ (tinh hoa, video, đếm ngược). Thân bài được mã hoá
           AES-GCM; khoá nội dung được bọc bằng khoá suy ra (PBKDF2) từ từng đáp án. Gõ đúng đáp án là đọc được
           ngay (assets/bai-bao/mo-khoa.js); xem mã nguồn trang cũng không đọc trộm được.
    mo   : tới ngày mở -> trang đầy đủ, có trong sitemap.
- Workflow đăng trang chạy script này mỗi ngày lúc 00:05 giờ Việt Nam, nên bài tự mở đúng ngày, không ai phải bấm gì.
- Ghi ra: bai-bao.html, en/bai-bao.html, bai-bao/<slug>.html, en/bai-bao/<slug>.html và các dòng bai-bao trong sitemap.xml.
  Đừng sửa tay các file đó, sửa nguồn rồi chạy lại.
- "thu" (không bắt buộc): thẻ "Thử ngay" cuối bài trỏ sang công cụ đi kèm, vd. Máy tính đời thật ?may=tu-do-ai:
  {"url": "...", "vi": {"ten", "mo"}, "en": {...}}. Hiện cả khi bài còn khóa (công cụ không chứa đáp án).
- Đáp án so theo dạng chuẩn hoá (bỏ dấu, đ -> d, chữ thường, chỉ giữ a-z0-9): "20%", "20 %" đều thành "20".
  Ghi mọi cách đúng đã chuẩn hoá vào "dap_an". mo-khoa.js chuẩn hoá y hệt.
"""
import argparse
import base64
import datetime as dt
import html
import json
import os
import re
import shutil
import unicodedata
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

R = Path(__file__).resolve().parent.parent
NGUON = R / "bai-bao-nguon"
BASE = "https://markhocai.com/"
LAP = 150_000  # số vòng PBKDF2, mo-khoa.js đọc từ dữ liệu trang
esc = lambda s: html.escape(str(s or ""), quote=True)
b64 = lambda b: base64.b64encode(b).decode()

CHU = {
    "vi": {
        "goc_ten": "Bài báo AI", "goc_eyebrow": "Bài báo AI · đọc giùm bạn",
        "goc_h1": "Bài báo AI, đọc giùm bạn",
        "goc_lead": "Mỗi số là một bài báo khoa học về AI, kể lại dễ hiểu: thí nghiệm làm gì, kết quả ra sao, tin được đến đâu và bạn áp dụng thế nào. Video lên kênh trước, bài phân tích đầy đủ mở sau đó một tuần.",
        "goc_desc": "Bài báo khoa học về AI kể lại dễ hiểu: thí nghiệm, kết quả, kiểm chứng và bài học áp dụng. Xem video trước, bài phân tích mở sau một tuần.",
        "nhom": {"doi-that": "AI ngoài đời thật", "nen-mong": "Bài báo làm nên AI"},
        "so": "Số", "sap": "Sắp có video", "khoa": "Mở ngày {d}", "mo": "Đã mở", "doc": "Đọc bài", "xem": "Xem hé lộ",
        "bai_bao": "Bài báo", "tac_gia": "Tác giả", "cong_bo": "Công bố", "loai": "Loại",
        "tinh_hoa": "Tinh hoa", "video": "Xem video trước", "xem_yt": "Xem trên YouTube",
        "khoa_h": "Bài phân tích đầy đủ đang khóa",
        "khoa_p": "Bài mở cho mọi người vào ngày {d}. Đã xem video rồi thì trả lời câu hỏi dưới đây để đọc ngay.",
        "con": "Còn", "ngay": "ngày", "gio": "giờ", "phut": "phút", "dang_mo": "Đang mở bài, tải lại trang sau vài phút nhé.",
        "o_dap": "Câu trả lời của bạn", "nut": "Mở bài", "sai": "Chưa đúng. Xem lại video rồi thử lại nhé.",
        "dung": "Đúng rồi! Bài đã mở ở bên dưới.", "loi": "Trình duyệt này chưa mở được bài. Bạn thử trình duyệt khác nhé.",
        "ve_goc": "Tất cả bài báo AI", "title_sfx": "Bài báo AI",
        "chua_co": "Số đầu tiên đang làm video. Theo dõi kênh để xem trước nhé.",
        "nguon_vid": "Video số {n}",
        "thu_eyebrow": "Công cụ đi kèm", "thu_nut": "Thử ngay",
    },
    "en": {
        "goc_ten": "AI papers", "goc_eyebrow": "AI papers · read for you",
        "goc_h1": "AI papers, read for you",
        "goc_lead": "Each issue is one scientific paper about AI, retold plainly: what the experiment did, what it found, how far to trust it and how you can use it. The video comes first; the full write-up opens a week later.",
        "goc_desc": "Scientific papers about AI, retold plainly: the experiment, the result, a fact check and a lesson you can use. Watch the video first; the write-up opens a week later.",
        "nhom": {"doi-that": "AI in real life", "nen-mong": "Papers that built AI"},
        "so": "No.", "sap": "Video coming soon", "khoa": "Opens {d}", "mo": "Open", "doc": "Read", "xem": "Preview",
        "bai_bao": "Paper", "tac_gia": "Authors", "cong_bo": "Published", "loai": "Type",
        "tinh_hoa": "In short", "video": "Watch the video first", "xem_yt": "Watch on YouTube",
        "khoa_h": "The full write-up is locked",
        "khoa_p": "It opens for everyone on {d}. Seen the video? Answer the question below to read it now.",
        "con": "Opens in", "ngay": "days", "gio": "hours", "phut": "min", "dang_mo": "Opening now, reload in a few minutes.",
        "o_dap": "Your answer", "nut": "Unlock", "sai": "Not quite. Rewatch the video and try again.",
        "dung": "Correct! The write-up is open below.", "loi": "This browser can't unlock the write-up. Please try another browser.",
        "ve_goc": "All AI papers", "title_sfx": "AI papers",
        "chua_co": "The first issue's video is in production. Follow the channel to watch it first.",
        "nguon_vid": "Video no. {n}",
        "thu_eyebrow": "Companion tool", "thu_nut": "Try it now",
    },
}


def chuan_hoa(s):
    s = unicodedata.normalize("NFD", str(s).lower()).replace("đ", "d")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s)


def ngay_vn(d, lg):
    return f"{d.day}/{d.month}/{d.year}" if lg == "vi" else d.strftime("%-d %b %Y")


def ma_hoa(than, dap_an):
    """Mã hoá thân bài bằng khoá ngẫu nhiên, rồi bọc khoá đó bằng khoá suy ra từ từng đáp án."""
    khoa = AESGCM.generate_key(bit_length=256)
    iv = os.urandom(12)
    ct = AESGCM(khoa).encrypt(iv, than.encode("utf-8"), None)
    muoi = os.urandom(16)
    boc = []
    for da in dict.fromkeys(chuan_hoa(x) for x in dap_an):
        k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=muoi, iterations=LAP).derive(da.encode())
        iv2 = os.urandom(12)
        boc.append({"iv": b64(iv2), "ct": b64(AESGCM(k).encrypt(iv2, khoa, None))})
    return {"muoi": b64(muoi), "lap": LAP, "iv": b64(iv), "ct": b64(ct), "boc": boc}


# ---------- khung trang: lấy đầu và chân trang từ dich-vu.html để luôn giống phần còn lại của web ----------
def khung(lg):
    goc = (R / ("en/dich-vu.html" if lg == "en" else "dich-vu.html")).read_text(encoding="utf-8")
    dau_icon = goc[goc.index('<link rel="icon"'):goc.index("</head>")]
    than_dau = goc[goc.index("<body"):goc.index("</header>") + len("</header>")]
    chan = goc[goc.index('<footer'):]
    return dau_icon, than_dau, chan


def doi_duong(s, tien_to):
    """Thêm tiền tố cho mọi đường dẫn tương đối: mọi link trong file này viết như trang nằm ở gốc."""
    if not tien_to:
        return s

    def sua(m):
        thuoc, nhay, duong = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|mailto:|tel:|data:|#|/|javascript:)", duong):
            return m.group(0)
        if duong == "./":
            duong = ""
        elif duong.startswith("./"):
            duong = duong[2:]
        return f"{thuoc}={nhay}{tien_to}{duong}{nhay}"
    return re.sub(r'\b(href|src)=(["\'])([^"\']*)\2', sua, s)


def trang(lg, duong, title, desc, band, main, anh=None, them_cuoi="", sau=False):
    dau_icon, than_dau, chan = khung(lg)
    vi_url = BASE + duong
    en_url = BASE + "en/" + duong
    url = en_url if lg == "en" else vi_url
    tien_to = "../" if sau else ""
    tai = "../" if lg == "en" else ""  # tài nguyên chung nằm ở gốc, trang tiếng Anh ở en/
    them_cuoi = them_cuoi.replace("{tai}", tai)
    dau = f"""<!doctype html>
<html lang="{lg}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="vi" href="{vi_url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="x-default" href="{vi_url}">
<meta property="og:site_name" content="Mark học AI">
<meta property="og:locale" content="{'en_US' if lg == 'en' else 'vi_VN'}">
<meta property="og:type" content="{'article' if sau else 'website'}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{anh or BASE + 'assets/og.png'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2563EB">
{dau_icon}<link rel="stylesheet" href="{tai}assets/bai-bao/bai-bao.css?v=dev">
</head>
"""
    than = f"""{than_dau}
{band}
</div>
</div>
<main class="bb-main" id="noi-dung">
{main}
</main>
{chan}"""
    if them_cuoi:
        than = than.replace("</body>", them_cuoi + "\n</body>")
    return doi_duong(dau + than, tien_to)


# ---------- các phần của trang ----------
def the_thong_tin(b, c):
    hang = [(c["bai_bao"], b["bai_bao"]), (c["tac_gia"], b["tac_gia"]), (c["cong_bo"], b["cong_bo"]), (c["loai"], b["loai"])]
    return '<dl class="bb-meta">' + "".join(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in hang) + "</dl>"


def khoi_tinh_hoa(b, c):
    return (f'<section class="bb-tinh-hoa" aria-labelledby="tinh-hoa"><h2 id="tinh-hoa">{c["tinh_hoa"]}</h2><ul>'
            + "".join(f"<li>{esc(x)}</li>" for x in b["tinh_hoa"]) + "</ul></section>")


def khoi_video(muc, c, lg):
    yt = muc.get("youtube")
    lien = f"https://www.youtube.com/watch?v={yt}" if yt else "https://www.youtube.com/@markhocai"
    return (f'<section class="bb-video" aria-labelledby="xem-video"><h2 id="xem-video">{c["video"]}</h2>'
            f'<p class="muted">{esc(c["nguon_vid"].format(n=muc["video"]))}</p>'
            f'<a class="btn btn-yt" href="{lien}" target="_blank" rel="noopener">{c["xem_yt"]}</a></section>')


def khoi_thu(muc, c, lg):
    """Thẻ "Thử ngay" trỏ sang công cụ đi kèm bài (mục "thu" trong bai-bao.json, url viết như trang nằm ở gốc). Không có thì rỗng."""
    thu = muc.get("thu")
    if not thu:
        return ""
    x = thu[lg]
    return (f'\n<aside class="bb-thu" aria-labelledby="thu-h"><div><p class="bb-thu-eyebrow">{c["thu_eyebrow"]}</p>'
            f'<h2 id="thu-h">{esc(x["ten"])}</h2><p>{esc(x["mo"])}</p></div>'
            f'<a class="btn bb-thu-nut" href="{esc(thu["url"])}">{c["thu_nut"]} →</a></aside>')


def band_bai(muc, b, c, lg):
    return f"""<div class="band-in page-head bb-head">
<p class="eyebrow"><a href="bai-bao.html">{c['goc_ten']}</a> · {c['so']} {muc['so']}</p>
<h1>{esc(b['ten'])}</h1>
<p class="lead">{esc(b['phu'])}</p>
{the_thong_tin(b, c)}"""


def trang_bai(muc, lg, trang_thai, ngay_mo):
    c = CHU[lg]
    b = muc[lg]
    than = (NGUON / f"{muc['slug']}.{lg}.frag").read_text(encoding="utf-8")
    band = band_bai(muc, b, c, lg)
    title = f"{b['ten']} | {c['title_sfx']} | Mark học AI"
    desc = " ".join(b["tinh_hoa"])[:300]
    if trang_thai == "mo":
        main = khoi_tinh_hoa(b, c) + f'\n<article class="bb-than">\n{than}\n</article>\n' + khoi_video(muc, c, lg)
        cuoi = ""
    else:
        mo_luc = f"{ngay_mo.isoformat()}T00:00:00+07:00"
        du_lieu = ma_hoa(than, muc["dap_an"])
        du_lieu.update({"slug": muc["slug"], "mo_luc": mo_luc})
        chu_js = {k: c[k] for k in ("con", "ngay", "gio", "phut", "dang_mo", "sai", "dung", "loi")}
        main = (khoi_tinh_hoa(b, c) + khoi_video(muc, c, lg) + f"""
<section class="bb-khoa" id="khoa" aria-labelledby="khoa-h">
<h2 id="khoa-h">{c['khoa_h']}</h2>
<p>{esc(c['khoa_p'].format(d=ngay_vn(ngay_mo, lg)))}</p>
<p class="bb-dem" data-mo="{mo_luc}" aria-live="polite"></p>
<form class="bb-form" novalidate>
<label for="dap-an">{esc(b['cau_hoi'])}</label>
<div class="bb-o"><input id="dap-an" name="dap-an" autocomplete="off" placeholder="{esc(b['goi_y'])}"><button class="btn" type="submit">{c['nut']}</button></div>
<p class="bb-bao" role="status"></p>
</form>
</section>
<article class="bb-than" id="than" hidden></article>
<script type="application/json" id="bb-du-lieu">{json.dumps(du_lieu)}</script>
<script type="application/json" id="bb-chu">{json.dumps(chu_js, ensure_ascii=False)}</script>""")
        cuoi = '<script src="{tai}assets/bai-bao/mo-khoa.js?v=dev" defer></script>'
    main += khoi_thu(muc, c, lg)
    main += f'\n<p class="bb-ve"><a href="bai-bao.html">← {c["ve_goc"]}</a></p>'
    return trang(lg, f"bai-bao/{muc['slug']}.html", title, desc, band, main, them_cuoi=cuoi, sau=True)


def trang_goc(ds, lg):
    c = CHU[lg]
    band = f"""<div class="band-in page-head">
<p class="eyebrow">{c['goc_eyebrow']}</p>
<h1>{c['goc_h1']}</h1>
<p class="lead">{c['goc_lead']}</p>"""
    the = []
    for muc, trang_thai, ngay_mo in ds:
        b = muc[lg]
        nhan = {"sap": c["sap"], "khoa": c["khoa"].format(d=ngay_vn(ngay_mo, lg)) if ngay_mo else "", "mo": c["mo"]}[trang_thai]
        ten = esc(b["ten"])
        if trang_thai != "sap":
            ten = f'<a href="bai-bao/{muc["slug"]}.html">{ten}</a>'
        the.append(f"""<li class="bb-the-bai bb-{trang_thai}">
<span class="bb-so">{c['so']} {muc['so']}</span>
<span class="bb-nhom">{esc(c['nhom'].get(muc.get('nhom'), ''))}</span>
<h2>{ten}</h2>
<p>{esc(b['phu'])}</p>
<span class="bb-nhan">{esc(nhan)}</span>
</li>""")
    main = '<ul class="bb-ds-bai">' + "\n".join(the) + "</ul>" if the else f'<p class="muted">{c["chua_co"]}</p>'
    title = f"{c['goc_h1']} | Mark học AI"
    return trang(lg, "bai-bao.html", title, c["goc_desc"], band, main)


# ---------- chạy ----------
def cap_nhat_sitemap(mo):
    f = R / "sitemap.xml"
    if not f.exists():  # sitemap.xml không lưu trong git: chạy scripts/tao_sitemap.py trước (pages.yml làm vậy)
        return
    cua_goc = re.compile(rf"<loc>{re.escape(BASE)}(en/)?bai-bao(\.html|/)")  # chỉ trang của góc này, không đụng vu-tru-khac/bai-bao-*
    dong = [d for d in f.read_text(encoding="utf-8").splitlines() if not cua_goc.search(d)]
    ra = []
    for d in dong:
        ra.append(d)
        for tt in ("", "en/"):
            if f"<loc>{BASE}{tt}phieu-luu.html</loc>" in d:
                ra.append(f"  <url><loc>{BASE}{tt}bai-bao.html</loc><priority>0.6</priority></url>")
                ra += [f"  <url><loc>{BASE}{tt}bai-bao/{s}.html</loc><priority>0.6</priority></url>" for s in mo]
    f.write_text("\n".join(ra) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--hom-nay", help="giả lập ngày hôm nay (YYYY-MM-DD), để xem trước")
    ap.add_argument("--ra", help="ghi vào thư mục khác (xem trước), không đụng sitemap")
    a = ap.parse_args()
    hom_nay = (dt.date.fromisoformat(a.hom_nay) if a.hom_nay
               else (dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=7)).date())
    ra = Path(a.ra) if a.ra else R
    lich = json.loads((R / "data" / "lich-ra-mat.json").read_text(encoding="utf-8"))
    ds_nguon = json.loads((NGUON / "bai-bao.json").read_text(encoding="utf-8"))

    ds, mo = [], []
    for muc in sorted(ds_nguon, key=lambda m: m["so"]):
        nv = muc.get("ngay_video") or lich.get(str(muc["video"]))
        ngay_video = dt.date.fromisoformat(nv) if nv else None
        ngay_mo = (dt.date.fromisoformat(muc["ngay_mo"]) if muc.get("ngay_mo")
                   else ngay_video + dt.timedelta(days=7) if ngay_video else None)
        if ngay_mo and hom_nay >= ngay_mo:
            tt = "mo"
        elif ngay_video and hom_nay >= ngay_video:
            tt = "khoa"
        else:
            tt = "sap"
        ds.append((muc, tt, ngay_mo))
        print(f"  #{muc['so']} {muc['slug']}: {tt} (video {ngay_video}, mở {ngay_mo})")

    for lg, tt in (("vi", ""), ("en", "en/")):
        thu_muc = ra / tt / "bai-bao"
        if thu_muc.exists():
            shutil.rmtree(thu_muc)
        (ra / tt).mkdir(parents=True, exist_ok=True)
        (ra / tt / "bai-bao.html").write_text(trang_goc(ds, lg), encoding="utf-8")
        for muc, trang_thai, ngay_mo in ds:
            if trang_thai == "sap":
                continue
            thu_muc.mkdir(parents=True, exist_ok=True)
            (thu_muc / f"{muc['slug']}.html").write_text(trang_bai(muc, lg, trang_thai, ngay_mo), encoding="utf-8")
            if trang_thai == "mo" and lg == "vi":
                mo.append(muc["slug"])
    if not a.ra:
        cap_nhat_sitemap(mo)
    print(f"Xong: {len(ds)} bài, {len(mo)} bài đã mở.")


if __name__ == "__main__":
    main()

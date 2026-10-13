#!/usr/bin/env python3
"""Tạo góc "Mark ở vũ trụ khác": các bài phân tích sách (ngoài chủ đề AI) từ dự án Book Research.

Dùng: python3 scripts/tao_vu_tru_khac.py /mnt/project-files/books

- Danh sách sách ở data/vu-tru-khac.json (mỗi mục một slug, chữ tiếng Anh trong "en", kể cả "ten" khi tên sách tiếng Việt khác tên tiếng Anh). Mục "bia" lấy màu từ bìa
  sách cho nền đầu bài (chữ đầu bài luôn màu kem nên nền phải tối): nen_1 (màu nền chính), nen_2 (màu sáng hơn ở góc), nhan (màu nhấn: viền, nhãn, chip),
  hoa_tiet ("trang" = trăng khuyết, "but-chi" = dải bút chì, "song" = dải sóng nước, "hong-tam" = hồng tâm đỏ trắng, "bon-mau" = dải bốn màu xanh/đỏ/vàng/lục, bỏ trống = không có). Thiếu "bia" thì dùng navy/cam. Bài gốc:
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
  và các khối chủ đề giữa <!-- vtk:dau --> và <!-- vtk:cuoi -->; thẻ mỗi bài là bìa thu nhỏ vẽ từ tên, tác giả, "bia" (màu, hoạ tiết) và một tư thế Mark ("mark": doc-sach, thac-mac, a-ra-the, cam-sach,
  vui-mung, ngac-nhien, like, chao, buon-ngu), bên dưới chỉ có số bài, tên, tác giả · năm · điểm. Mỗi khối chỉ hiện một hàng (ít nhất 4 thẻ), còn lại sau nút "Xem thêm". Chủ đề chưa có bài thì
  chưa hiện. Thêm chủ đề mới = thêm một dòng chủ đề rồi thêm bài có "loai" đó; đường dẫn bài vẫn là vu-tru-khac/<slug>.html.
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
    s = re.sub(r"\s*·\s*(Kho nghiên cứu sách cá nhân|Personal book research|Mark Ở Vũ Trụ Khác)\s*·\s*(Bản nháp|Draft) [^.<]*\.", ".", s)
    return s


def trang_sach(b, goc, en=False, cd=None):
    e = b.get("en", {}) if en else b
    ten = (f'{e.get("ten", b["ten"])} ({b["tac_gia"]}): summary, review and lessons | Another Universe' if en
           else f'{b["ten"]} ({b["tac_gia"]}): tóm tắt, đánh giá và bài học | Mark ở vũ trụ khác')
    url = f'{BASE}{"en/" if en else ""}vu-tru-khac/{b["slug"]}.html'
    p = "../../" if en else "../"   # đường về thư mục gốc (assets)
    bai = lam_sach(goc, en)
    # Bỏ <title> của Artifact, dùng tiêu đề của trang
    bai = re.sub(r"^\s*<title>.*?</title>\s*", "", bai, flags=re.S)
    bia = b.get("bia", {})
    mau_bia = "".join(f"--bia-{k}: {bia[v]}; " for k, v in (("1", "nen_1"), ("2", "nen_2"), ("nhan", "nhan")) if bia.get(v))
    mau_bia = f"\nbody header {{ {mau_bia}}}" if mau_bia else ""
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
<meta property="og:image" content="{BASE}assets/og.png">
<link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon-32.png?v=dev">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png?v=dev">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;800&family=Inter:ital,wght@0,400;0,500;0,600;1,400&display=swap">
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
@media (max-width: 420px) {{ .mhai-thanh .mhai b {{ display: none; }} }}{mau_bia}
</style>
</head>
<body{lop_bia}>
<div class="mhai-thanh"><a class="vtk-ve" href="../vu-tru-khac.html" aria-label="{"Back to Another Universe" if en else "Về Mark ở vũ trụ khác"}">‹ <img src="{p}assets/vu-tru-khac/logo-ngang-toi.webp" alt="Mark ở vũ trụ khác" width="760" height="168"></a><span>{'<a href="../../vu-tru-khac/' + b["slug"] + '.html" hreflang="vi" lang="vi">VI</a>' if en else '<a href="../en/vu-tru-khac/' + b["slug"] + '.html" hreflang="en" lang="en">EN</a>'}<a class="mhai" href="../"><img src="{p}assets/logo.png" alt="" width="24" height="24"><b>Mark học AI</b></a></span></div>
{bai.strip()}
<link rel="stylesheet" href="{p}assets/vu-tru-khac/doc.css?v=dev">{tro_choi(b, p)}
<script src="{p}assets/vu-tru-khac/doc.js?v=dev" defer></script>
</body>
</html>
'''


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


def the_bai(b, cd, en=False):
    e = b.get("en", {}) if en else b
    bia = b.get("bia") or {}
    mau = "".join(f"--{k}: {esc(bia[v])};" for k, v in (("bia-1", "nen_1"), ("bia-2", "nen_2"), ("bia-nhan", "nhan")) if bia.get(v))
    ten = e.get("ten", b["ten"])
    tg = " · ".join(esc(x) for x in (b.get("tac_gia"), b.get("nam"), b.get("diem")) if x)
    mark = b.get("mark") if b.get("mark") in TU_THE else TU_THE[(b["so"] - 1) % len(TU_THE)]
    lop = (" bia-" + esc(bia["hoa_tiet"]) if bia.get("hoa_tiet") else "") + (" dai" if max(map(len, str(ten).split())) > 8 else "")
    return (f'<a class="vtk-the" href="vu-tru-khac/{esc(b["slug"])}.html" title="{esc(e.get("mo_ta", b.get("mo_ta")))}"{f" style={chr(34)}{mau}{chr(34)}" if mau else ""}>'
            f'<span class="vtk-bia{lop}" aria-hidden="true"><i>{esc(ten)}</i>'
            f'<img src="{"../" if en else ""}assets/vu-tru-khac/mark/{mark}.svg" alt="" width="300" height="340" loading="lazy"><small>{esc(b.get("tac_gia"))}</small></span>'
            f'<span class="vtk-so">{esc(cd["nhan"])} #{b["so"]:03d}</span>'
            f'<b>{esc(ten)}</b><span class="vtk-tg">{tg}</span></a>')


def trang_chu(sach, chu_de, en=False):
    """Hàng chip lọc + mỗi chủ đề một khối thẻ, mới nhất trước. Lọc bằng script nhỏ trong trang (không có JS thì chip là link tới khối)."""
    cds = [dict(c, **c.get("en", {})) if en else c for c in chu_de]
    co = [(c, sorted((b for b in sach if b.get("loai", "sach") == c["ma"]), key=lambda b: -b["so"])) for c in cds]
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
            ra.write_text(trang_sach(b, nguon.read_text(encoding="utf-8"), en, cd), encoding="utf-8")
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

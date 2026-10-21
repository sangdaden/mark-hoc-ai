"""Tạo các trang tĩnh cho SEO: một bài viết cho mỗi video (bai/*.html), Từ điển AI (tu-dien.html),
bài kiểm tra "Bạn hiểu AI tới đâu?" (kiem-tra.html), sách miễn phí (sach.html), Lộ trình 7 ngày (lo-trinh-7-ngay.html),
trang hợp tác (hop-tac.html), trang làm theo video (lam-theo.html), bản tiếng Anh của tất cả (en/...) và sitemap.xml.

Chạy lại mỗi khi có video mới (sau scripts/gom_video.py) hoặc khi sửa data/bai-viet.json, data/tu-dien.json, data/bo-kiem-tra.json
hay bản dịch trong data/en/ (xong thì chạy tiếp scripts/tao_hoi_dap.py để trang Hỏi Bit có nội dung mới):
    python3 scripts/tao_bai_viet.py /mnt/project-files/videos            # cả tiếng Việt lẫn tiếng Anh
    python3 scripts/tao_bai_viet.py --lang en                            # chỉ bản tiếng Anh (không cần thư mục video)

Nguồn của mỗi bài tiếng Việt: SCENES trong <thư mục video>/nguon/script.py (tiêu đề cảnh thành tiêu đề mục, lời đọc thành đoạn văn,
cảnh THỬ NGAY thành hộp "Thử ngay") và tieu-de-mo-ta.md (mô tả cho thẻ meta). Script chỉ đọc thư mục video, không ghi vào đó.

Bản tiếng Anh (en/): bài dịch nằm ở data/en/bai/<số>-<slug>.json (meta, prompt, thu, muc: chip/title/text/try),
tên series ở data/en/series.json, tên và mô tả video ở data/en/videos.json, tiêu đề SEO ở data/en/bai-viet.json,
từ điển ở data/en/tu-dien.json, câu hỏi kiểm tra ở data/en/bo-kiem-tra.json. Bài nào chưa dịch thì tạm dùng bản tiếng Việt (có cảnh báo).
"""
import ast, html, json, pathlib, re, sys, unicodedata
from urllib.parse import quote

THAM_SO = [a for a in sys.argv[1:] if not a.startswith("--")]
CHON = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--lang=")), None)
if "--lang" in sys.argv[1:]:
    i = sys.argv.index("--lang")
    CHON = sys.argv[i + 1] if i + 1 < len(sys.argv) else None
    THAM_SO = [a for a in THAM_SO if a != CHON]
CHON = CHON or "all"
ROOT = pathlib.Path(THAM_SO[0] if THAM_SO else "/mnt/project-files/videos")
R = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://markhocai.com/"
SITE = "Mark học AI"
PDF = "assets/50-prompt-mau.pdf"

def load(name):
    return json.loads((R / "data" / f"{name}.json").read_text(encoding="utf-8"))

kenh, series, videos = load("kenh"), load("series"), load("videos")
seo = load("bai-viet")["tieu_de_seo"]
seo_vi, CHU_DE_VI = dict(seo), {v["so"]: v["chu_de"] for v in videos}  # bản tiếng Việt, dùng khi dò công cụ trong bài (cả bài tiếng Anh)
tu_dien = load("tu-dien")["thuat_ngu"]
TD_CHU_DE = load("tu-dien")["chu_de"]  # chủ đề của Từ điển AI (tên VI + EN)
TD_NHAN_VAT = load("tu-dien")["nhan_vat"]  # nhân vật phụ vẽ trên vài thẻ (Mây Bịa, Chữ Con)
kiem_tra = load("bo-kiem-tra")  # {"dat", "nhom", "bo": [bộ câu hỏi]}
video_phu = load("video-phu")["series"]  # tập phụ số thập phân (5.1, 69.1...) nối tiếp một video chính, xem _ghi_chu trong file
# Ảnh của video mới (scripts/tao_anh.py): ảnh bìa, ảnh cảnh trong bài. Video không có trong file thì bài giữ như cũ.
from video_moi import VIDEO_MOI_TU
import tao_sitemap
import anh_chia_se
import tro_choi
# Trình phát YouTube: mọi video đã đăng YouTube, kể cả 01-302 và tập phụ ("5.1"), Sang duyệt 16/10 (scripts/cap_nhat_youtube.py)
YT_ID = load("youtube-id") if (R / "data" / "youtube-id.json").exists() else {}
# Ảnh riêng từng video (scripts/tao_anh.py) chỉ dành cho video mới, số >= VIDEO_MOI_TU (scripts/video_moi.py)
ANH = {k: v for k, v in (load("anh") if (R / "data" / "anh.json").exists() else {}).items() if int(k) >= VIDEO_MOI_TU}
esc = lambda s: html.escape(s or "", quote=True)

# Ngôn ngữ đang tạo: "vi" (gốc, ở thư mục gốc) hoặc "en" (ở en/). t("chữ Việt", "English") chọn theo ngôn ngữ đó.
LG = "vi"
GOC = ""  # tiền tố đường dẫn của ngôn ngữ đang tạo: "" hoặc "en/"
def t(vi, en):
    return en if LG == "en" else vi

# ---------- chữ ----------
def bo_emoji(s):
    s = "".join(c for c in s if unicodedata.category(c) not in ("So", "Sk", "Cs", "Co") and c not in "‍️⃣")
    return re.sub(r"\s+", " ", s).strip()

def norm(s):
    s = unicodedata.normalize("NFD", (s or "").replace("đ", "d").replace("Đ", "D"))
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()

def cat_ngan(s, n=158):
    if len(s) <= n:
        return s
    return s[:n].rsplit(" ", 1)[0].rstrip(",;:·-– ") + "…"

def viet_hoa(s):
    return s[:1].upper() + s[1:] if s else s

# Số đọc bằng chữ sau chữ "video" ("video hai mươi lăm") -> "video 25" kèm link tới bài đó
SO = {"một": 1, "hai": 2, "ba": 3, "bốn": 4, "tư": 4, "năm": 5, "lăm": 5, "sáu": 6, "bảy": 7, "tám": 8, "chín": 9, "mốt": 1}
TU_SO = "một|hai|ba|bốn|tư|năm|lăm|sáu|bảy|tám|chín|mười|mươi|mốt"
CUM_SO = rf"(?:\d{{1,3}}|(?:(?:{TU_SO})\s?)+)"

def doc_so(chu):
    chu = chu.strip()
    if chu.isdigit():
        return int(chu)
    w = chu.split()
    if w[0] == "mười":
        return 10 + (SO.get(w[1], 0) if len(w) > 1 else 0) if len(w) <= 2 else None
    if len(w) >= 2 and w[1] == "mươi" and w[0] in SO:
        return SO[w[0]] * 10 + (SO.get(w[2], 0) if len(w) > 2 else 0) if len(w) <= 3 else None
    if len(w) == 1 and w[0] in SO and w[0] not in ("lăm", "mốt", "tư"):
        return SO[w[0]]
    return None

# ---------- dữ liệu video ----------
def tach_tieu_de(v):
    m = re.match(r"^.*?\(((?:Phần|Part) \d+/\d+)\):\s*(.*)$", v["chu_de"])
    return (m.group(2), m.group(1)) if m else (v["chu_de"], "")

def ten_file(v):
    so = v["so"]
    if isinstance(so, str):  # tập phụ "5.1" -> thư mục và trang 05-1-<slug>
        cha, phu = so.split(".")
        return f"{int(cha):02d}-{phu}-{v['slug']}"
    return f"{so:02d}-{v['slug']}"

def ev(x):
    if isinstance(x, ast.Call) and getattr(x.func, "id", None) == "dict":
        return {k.arg: ev(k.value) for k in x.keywords}
    if isinstance(x, ast.List):
        return [ev(e) for e in x.elts]
    if isinstance(x, ast.Dict):
        return {ev(k): ev(v) for k, v in zip(x.keys, x.values)}
    return ast.literal_eval(x)

def doc_canh(thu_muc):
    # Đọc SCENES bằng AST (không chạy file script.py)
    t = ast.parse((thu_muc / "nguon" / "script.py").read_text(encoding="utf-8"))
    for node in t.body:
        if isinstance(node, ast.Assign) and any(getattr(x, "id", None) == "SCENES" for x in node.targets):
            return [s for s in ev(node.value) if not s.get("outro")]
    raise SystemExit(f"Không thấy SCENES trong {thu_muc}")

def doc_mo_ta(thu_muc):
    """Trả về (mô tả cho thẻ meta, câu 'Thử ngay' trong mô tả nếu có)."""
    f = thu_muc / "tieu-de-mo-ta.md"
    lines = f.read_text(encoding="utf-8").splitlines()
    khoi = []  # mỗi mục "**Mô tả:**": danh sách dòng tới dòng trống đầu tiên
    thu = ""
    for i, l in enumerate(lines):
        if l.strip().startswith("**Mô tả"):
            buf = []
            for n in lines[i + 1:]:
                if not n.strip():
                    if buf:
                        break
                    continue
                if n.startswith("#") or n.startswith("**"):
                    break
                buf.append(n.strip())
            khoi.append(buf)
        m = re.search(r"Thử ngay:\s*(.+)", l)
        if m and not thu:
            thu = bo_emoji(m.group(1))
    # Ưu tiên bản ngang (đoạn văn liền), không có thì lấy bản dọc
    buf = khoi[-1] if khoi else []
    # bỏ cả số trong emoji đánh số "1️⃣" (bo_emoji chỉ bỏ phần emoji, còn sót chữ số lạc trong mô tả)
    return cat_ngan(bo_emoji(re.sub(r"[0-9#*]\ufe0f?\u20e3\s*", "", " ".join(buf)))), thu

# Câu trong ngoặc kép ở dòng "Thử ngay" nhưng không phải câu lệnh gửi AI (tên tùy chọn, từ khóa tìm kiếm)
KHONG_PHAI_PROMPT = {75, 77, 80, 200}

def doc_prompt(thu_muc, so):
    """Prompt mẫu để nút "Sao chép prompt" chép: dòng sau "...chép dùng ngay:" trong tieu-de-mo-ta.md,
    không có thì các câu trong ngoặc kép (từ 5 chữ) ở dòng "Thử ngay"/"Áp dụng ngay". Không có gì thì trả về chuỗi rỗng."""
    if so in KHONG_PHAI_PROMPT:
        return ""
    lines = [l.strip() for l in (thu_muc / "tieu-de-mo-ta.md").read_text(encoding="utf-8").splitlines()]
    for i, l in enumerate(lines):
        if re.search(r"chép dùng ngay:\s*$", l):
            sau = next((n for n in lines[i + 1:] if n), "")
            if sau:
                return sau
    cau = []
    for i, l in enumerate(lines):
        moc = next((m for m in ("Thử ngay", "Áp dụng ngay") if m in l), None)
        if not moc:
            continue
        for q in re.findall(r'["“]([^"“”]+)["”]', l.split(moc, 1)[1]):
            q = q.strip()
            if len(q.split()) >= 5 and q not in cau:
                cau.append(q)
        if cau:
            break
    # nhiều câu ngắn thì nối bằng dấu chấm cho thành một prompt
    return " ".join(q if q[-1] in ".?!" or len(cau) == 1 else q + "." for q in cau)

VI = {"series": series, "videos": videos, "seo": seo, "tu_dien": tu_dien, "kiem_tra": kiem_tra, "phu": video_phu}
VIDEO_VI = {v["so"]: v for v in videos}  # tìm video trên YouTube luôn bằng tiêu đề tiếng Việt

def ghep_kiem_tra_en(kt_en):
    """Bản dịch bộ câu hỏi: cùng id, cùng thứ tự câu và lựa chọn; đáp án, video lấy từ bản Việt. Thiếu hay lệch là dừng (web luôn đủ hai thứ tiếng)."""
    en = {b["id"]: b for b in kt_en["bo"]}
    bo = []
    for b in kiem_tra["bo"]:
        e = en.get(b["id"])
        assert e and len(e["cau_hoi"]) == len(b["cau_hoi"]), f"data/en/bo-kiem-tra.json thiếu hoặc lệch số câu của bộ {b['id']}"
        cau = []
        for c, x in zip(b["cau_hoi"], e["cau_hoi"]):
            assert len(x.get("lua_chon", [])) == len(c.get("lua_chon", [])), f"bộ {b['id']}: lựa chọn tiếng Anh lệch với câu: {c['cau']}"
            cau.append({**c, **{k: x[k] for k in ("cau", "lua_chon", "giai_thich") if k in x}})
        bo.append({**b, "ten": e["ten"], "mo_ta": e["mo_ta"], "cau_hoi": cau})
    return {**kiem_tra, "nhom": kt_en["nhom"], "bo": bo}

def du_lieu_en():
    """Ghép bản dịch trong data/en/ vào cấu trúc gốc (số, slug, khoảng series, số video của thuật ngữ lấy từ bản tiếng Việt)."""
    d = R / "data" / "en"
    ld_en = lambda n: json.loads((d / f"{n}.json").read_text(encoding="utf-8"))
    s_en, v_en, seo_en = ld_en("series"), ld_en("videos"), ld_en("bai-viet")["tieu_de_seo"]
    td_en, kt_en = ld_en("tu-dien")["thuat_ngu"], ld_en("bo-kiem-tra")
    thieu = [str(v["so"]) for v in videos if str(v["so"]) not in v_en or str(v["so"]) not in seo_en]
    if thieu:
        print("CẢNH BÁO: chưa dịch tiêu đề/mô tả video:", ", ".join(thieu))
    return {
        "series": [{**s, **{k: s_en[s["id"]][k] for k in ("ten", "mo_ta") if k in s_en.get(s["id"], {})}} for s in series],
        "videos": [{**v, **{k: v_en[str(v["so"])][k] for k in ("chu_de", "mo_ta") if k in v_en.get(str(v["so"]), {})}} for v in videos],
        "seo": {k: seo_en.get(k, x) for k, x in seo.items()},
        "tu_dien": [{**x, "thuat_ngu": td_en.get(x["id"], {}).get("thuat_ngu", x["thuat_ngu"]),
                     "tieng_viet": td_en.get(x["id"], {}).get("ten_khac", ""),
                     "giai_thich": td_en.get(x["id"], {}).get("giai_thich", x["giai_thich"])} for x in tu_dien],
        "kiem_tra": ghep_kiem_tra_en(kt_en),
        "phu": ghep_phu_en(ld_en("video-phu")),
    }

def ghep_phu_en(p_en):
    """Tên series và tên, mô tả từng tập phụ bằng tiếng Anh. Thiếu là dừng (web luôn đủ hai thứ tiếng)."""
    ds = []
    for s in video_phu:
        assert s["id"] in p_en["series"], f"data/en/video-phu.json thiếu tên series {s['id']}"
        tap = []
        for x in s["tap"]:
            assert x["so"] in p_en["tap"], f"data/en/video-phu.json thiếu tập {x['so']}"
            tap.append({**x, **p_en["tap"][x["so"]]})
        ds.append({**s, "ten": p_en["series"][s["id"]], "tap": tap})
    return ds

def dat_ngon_ngu(lg):
    global LG, GOC, series, videos, seo, tu_dien, kiem_tra, nhom, nhom_cua, thu_tu, co_bai, phu, phu_cua
    LG, GOC = lg, ("en/" if lg == "en" else "")
    d = du_lieu_en() if lg == "en" else VI
    series, videos, seo, tu_dien, kiem_tra, phu = d["series"], d["videos"], d["seo"], d["tu_dien"], d["kiem_tra"], d["phu"]
    phu_cua = {s["cha"]: s for s in phu}
    nhom = []
    for s in series:
        items = [v for v in videos if s["tu"] <= v["so"] <= s["den"]]
        if items:
            nhom.append({**s, "items": items})
    nhom_cua = {v["so"]: g for g in nhom for v in g["items"]}
    thu_tu = [v for g in nhom for v in g["items"]]
    co_bai = {v["so"]: v for v in thu_tu}

dat_ngon_ngu("vi")

def link_bai(so, prefix):
    v = co_bai[so]
    return f"{prefix}bai/{ten_file(v)}.html"

def gan_link_video(text, prefix, so_hien_tai):
    """Đổi 'video hai mươi lăm' thành 'video 25' có link, cả chuỗi 'video 28, 66 và 67'."""
    def mot_so(chu):
        n = doc_so(chu)
        if n is None:
            return esc(chu)
        if n in co_bai and n != so_hien_tai:
            return f'<a href="{link_bai(n, prefix)}">{n}</a>'
        return str(n)
    if LG == "en":
        # bản tiếng Anh viết số bằng chữ số: "video 25", "videos 28, 66 and 67"
        def thay(m):
            so = [int(x) for x in re.findall(r"\d+", m.group(2))]
            phan = re.split(r"(\d+)", m.group(2))
            return esc(m.group(1)) + " " + "".join(
                (f'<a href="{link_bai(int(x), prefix)}">{x}</a>' if int(x) in co_bai and int(x) != so_hien_tai else x) if x.isdigit() else esc(x)
                for x in phan)
        out, last = [], 0
        for m in re.finditer(r"\b([Vv]ideos?) (\d{1,3}(?:(?:, | and )\d{1,3})*)\b", text):
            out.append(esc(text[last:m.start()]) + thay(m))
            last = m.end()
        out.append(esc(text[last:]))
        return "".join(out)
    pat = re.compile(rf"\b([Vv]ideo)( số)? ({CUM_SO})((?:(?:, | và | · ){CUM_SO})*)(?![\wÀ-ỹ])")
    out, last = [], 0
    for m in pat.finditer(text):
        if doc_so(m.group(3)) is None:
            continue
        out.append(esc(text[last:m.start()]))
        phan = [mot_so(m.group(3))]
        tach = [a + b for a, b in re.findall(rf"(, | và | · )({CUM_SO})", m.group(4))]
        for sep, chu in re.findall(rf"(, | và | · )({CUM_SO})", m.group(4)):
            n = doc_so(chu)
            if n is None or (n < 10 and not chu.isdigit()):  # ", một hãng..." không phải số video
                break
            phan.append(esc(sep) + mot_so(chu))
        out.append(m.group(1) + " " + "".join(phan))
        last = m.end(3) + sum(len(x) for x in tach[:len(phan) - 1])
    out.append(esc(text[last:]))
    return "".join(out)

def thanh_doan(lines):
    s = " ".join(l.strip() for l in lines if l.strip())
    if s and s[-1] not in ".?!…:\"”)":
        s += "."
    return s

def bo_tien_to_thu(s):
    s = re.sub(r"^\s*Thử ngay[^:]{0,20}:\s*", "", s)
    return viet_hoa(s)

# ---------- khung trang ----------
FONT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">'

def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + "</script>"

def ic(p, n):
    return f'<svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-{n}"/></svg>'

# Ngày video lên kênh (data/lich-ra-mat.json, cập nhật khi lên lịch video mới): ghi trên đầu bài.
# Chưa tới ngày thì bai-viet.js đổi chữ "Lên kênh" thành "Ra mắt".
LICH = load("lich-ra-mat")
# Ngày đăng cho Google (ld+json datePublished, article:published_time) chỉ ghi khi video đã ra; bài lên web trước video
# thì bỏ ngày (trước 18/10/2026 Google thấy 261 bài "đăng năm 2027"). Chữ "Ra mắt" trên trang vẫn do bai-viet.js lo theo data-ngay.
import datetime as _dt
HOM_NAY = _dt.datetime.now(_dt.timezone(_dt.timedelta(hours=7))).strftime("%Y-%m-%d")
def ngay_da_ra(ngay):
    return ngay if ngay and ngay <= HOM_NAY else None
THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
def nhan_ngay(d):
    if not d:
        return ""
    y, m, dd = d.split("-")
    return f' · <time class="ngay-dang" datetime="{d}">{t("Lên kênh", "Published")} {t(f"{dd}/{m}/{y}", f"{THANG_EN[int(m) - 1]} {int(dd)}, {y}")}</time>'

# Ảnh chia sẻ riêng cho từng bài (scripts/anh_chia_se.py): 1200x630, VI ở assets/anh/chia-se/, EN ở assets/anh/chia-se/en/.
SERIES_BIA = load("series-bia")
def anh_chia_se_bai(goc, tieu_de, nhan, so, ngay, bia, ten_series=""):
    ngay_chu = ""
    if ngay:
        y, m, dd = ngay.split("-")
        ngay_chu = t(f"{dd}/{m}/{y}", f"{THANG_EN[int(m) - 1]} {int(dd)}, {y}")
    ten = goc.split("/")[-1].replace(".html", ".jpg")
    return anh_chia_se.ve(f'assets/anh/chia-se/{t("", "en/")}{ten}', tieu_de, nhan, so, ngay_chu, bia, ten_series)

def khoi_chia_se(url, tieu_de, p):
    """Cuối bài: nút chia sẻ của máy (điện thoại), Facebook, chép link. Không chạy được JS thì chỉ còn nút Facebook (link thường)."""
    fb = "https://www.facebook.com/sharer/sharer.php?u=" + quote(url, safe="")
    return (f'<div class="chia-se">\n<p class="chia-se-h">{t("Thấy bài có ích? Gửi cho một người bạn", "Found this useful? Send it to a friend")}</p>\n<div class="cta">'
            f'<button type="button" class="btn" data-chia-se data-url="{esc(url)}" data-tieu-de="{esc(tieu_de)}" hidden>{ic(p, "share")}{t("Chia sẻ", "Share")}</button>'
            f'<a class="btn" href="{esc(fb)}" target="_blank" rel="noopener"><span class="nt nt-sm nt-facebook" aria-hidden="true"><svg><use href="{p}assets/nen-tang.svg#nt-facebook"/></svg></span>Facebook</a>'
            f'<button type="button" class="btn" data-chep-link="{esc(url)}" hidden>{ic(p, "link")}{t("Chép link", "Copy link")}</button>'
            '</div>\n</div>')

def header(p, hien_tai="", q=None):
    # p: đường về thư mục gốc (assets, style, js); q: đường về trang chủ của ngôn ngữ đang tạo (bản Việt: q = p)
    q = p if q is None else q
    def a(href, ten, key, cls=""):
        cur = ' aria-current="page"' if key == hien_tai else ""
        return f'<a class="{cls}" href="{href}"{cur}>{ten}</a>' if cls else f'<a href="{href}"{cur}>{ten}</a>'
    return (f'<header class="top">\n  <a class="brand" href="{q or "./"}"><img src="{p}assets/logo.png" alt="" width="40" height="40"><span>Mark học <b>AI</b></span></a>\n'
            f'  <nav class="top-links" aria-label="{t("Trang", "Pages")}">\n    {a((q or "./") + "#bat-dau", t("Bắt đầu từ đây", "Start here"), "bat-dau", "nav-start")}\n'
            f'    {a(q + "lo-trinh-7-ngay.html", t("Lộ trình 7 ngày", "7-day path"), "lo-trinh")}\n'
            f'    {a(q + "tu-dien.html", t("Từ điển AI", "AI glossary"), "tu-dien")}\n    {a(q + "kiem-tra.html", t("Kiểm tra", "Quiz"), "kiem-tra")}\n'
            f'    {a(q + "game.html", "Game", "game")}\n'
            f'    {a(q + "sach.html", t("Sách miễn phí", "Free ebook"), "sach")}\n'
            f'    {a(q + "bai-bao.html", t("Bài báo AI", "AI papers"), "bai-bao")}\n'
            f'    <a class="nav-yt" href="{esc(kenh["youtube"])}" target="_blank" rel="noopener"><span class="nt nt-sm nt-youtube" aria-hidden="true"><svg><use href="{p}assets/nen-tang.svg#nt-youtube"/></svg></span>YouTube</a>\n  </nav>\n</header>')

# Biểu tượng nền tảng (assets/nen-tang.svg, Simple Icons CC0): link kênh dạng icon tròn, có nhãn cho trình đọc màn hình
NEN_TANG = {"youtube": "YouTube", "tiktok": "TikTok", "facebook": "Facebook", "instagram": "Instagram", "threads": "Threads", "discord": "Discord"}
def nut_nen_tang(k, p, cls="nt"):
    ten = NEN_TANG[k]
    nhan = t("Vào cộng đồng Discord của Mark học AI", "Join the Mark học AI Discord community") if k == "discord" else t(f"Mark học AI trên {ten}", f"Mark học AI on {ten}")
    return (f'<a class="{cls} nt-{k}" href="{esc(kenh[k])}" target="_blank" rel="noopener" aria-label="{nhan}" title="{ten}">'
            f'<svg aria-hidden="true"><use href="{p}assets/nen-tang.svg#nt-{k}"/></svg></a>')

FANPAGE_VTK = "https://www.facebook.com/markovutrukhac/"

def footer(p, q=None):
    q = p if q is None else q
    # Nút tròn có logo biểu tượng "Mark ở vũ trụ khác" kèm chữ, đứng đầu hàng ngay trước YouTube, cách nhóm mạng xã hội một khoảng (Sang 13/10).
    # Từ 13/10 nút dẫn tới fanpage Facebook của góc, mở tab mới như các nút mạng xã hội; góc trên web vẫn vào từ nút ở đầu trang và Bit gợi ý.
    ten_vtk = t("Vũ Trụ Khác", "Another Universe")
    links = (f'\n      <a class="vtk-nut" href="{esc(FANPAGE_VTK)}" target="_blank" rel="noopener" title="{t("Mark ở vũ trụ khác trên Facebook", "Mark ở vũ trụ khác on Facebook")}"><span class="nt nt-vtk" aria-hidden="true">'
             f'<img src="{p}assets/vu-tru-khac/logo-bieu-tuong.svg" alt="" width="28" height="28"></span>{ten_vtk}</a>')
    links += "".join("\n      " + nut_nen_tang(k, p) for k in NEN_TANG if kenh.get(k))
    return (f'<footer class="foot-band">\n  <div class="foot">\n    <a class="brand" href="{q or "./"}"><img src="{p}assets/logo.png" alt="" width="36" height="36" loading="lazy"><span>Mark học <b>AI</b></span></a>\n'
            f'    <p class="foot-line">{t("Hiểu AI trong một phút, dùng được ngay sau đó.", "Understand AI in a minute, use it right after.")}</p>\n'
            f'    <nav class="foot-links" aria-label="{t("Kênh ở chân trang", "Channel links")}">{links}\n    </nav>\n'
            f'    <nav class="foot-hoc" aria-label="{t("Học và thực hành", "Learn and practice")}"><b>{t("Học", "Learn")}</b>'
            f'<a href="{q}lo-trinh-7-ngay.html">{t("Lộ trình 7 ngày", "7-day path")}</a><a href="{q}lo-trinh-4-tuan.html">{t("Lộ trình 4 tuần", "4-week path")}</a><a href="{q}lo-trinh-nganh.html">{t("Lộ trình theo nghề", "Path for your job")}</a>'
            f'<a href="{q}kiem-tra.html">{t("Kiểm tra", "Quizzes")}</a><a href="{q}chung-nhan.html">{t("Chứng nhận", "Certificates")}</a>'
            f'<a href="{q}ho-so.html">{t("Hồ sơ học", "My profile")}</a><a href="{q}bai-bao.html">{t("Bài báo AI", "AI papers")}</a>'
            f'<b>{t("Thực hành", "Practice")}</b><a href="{q}thuc-hanh.html">{t("Góc thực hành", "Practice corner")}</a>'
            f'<a href="{q}ai-hoc-sinh.html">{t("Học sinh", "Students")}</a><a href="{q}ai-van-phong.html">{t("Công chức", "Civil servants")}</a><a href="{q}ai-y-te.html">{t("Y tế", "Healthcare")}</a><a href="{q}bo-hoc-lieu-ai.html">{t("Học liệu 12 tiết", "12-lesson kit")}</a></nav>\n'
            f'    <span class="foot-copy">© 2026 Mark học AI · <a href="{q}tu-dien.html">{t("Từ điển AI", "AI glossary")}</a> · '
            f'<a href="{q}kiem-tra.html">{t("Bạn hiểu AI tới đâu?", "How well do you know AI?")}</a>'
            f' · <a href="{q}sach.html">{t("Sách miễn phí", "Free ebook")}</a> · <a href="{q}hop-tac.html">{t("Hợp tác cùng kênh", "Work with us")}</a>'
            f' · <a href="{q}dich-vu.html">{t("Làm video cho bạn", "Video services")}</a> · <a href="{q}bo-giao-vien.html">{t("Bộ bài giảng", "Lesson kits")}</a> · <a href="{q}workshop.html">Workshop</a>'
            f' · <a href="{q}ung-ho.html">{t("Ủng hộ kênh", "Support us")}</a> · <a href="{q}quyen-rieng-tu.html">{t("Quyền riêng tư", "Privacy")}</a> · <a href="{q}dieu-khoan.html">{t("Điều khoản", "Terms")}</a>'
            + (f' · <a href="mailto:{esc(kenh["email"])}">{esc(kenh["email"])}</a>' if kenh.get("email") else "")
            + '</span>\n  </div>\n</footer>')

def lien_ket_ngon_ngu(goc):
    """Thẻ hreflang: cùng một trang ở hai ngôn ngữ (đường dẫn giống hệt, bản Anh nằm trong en/)."""
    return (f'<link rel="alternate" hreflang="vi" href="{BASE}{goc}">\n<link rel="alternate" hreflang="en" href="{BASE}en/{goc}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{BASE}{goc}">')

# Popup "Cách chơi" (Bit dẫn đường): trang có data/huong-dan/<tên trang>.json tự có, xem scripts/huong_dan.py
import huong_dan

def video_object(so, ten, mo_ta, anh, ngay):
    """Dữ liệu VideoObject cho bài có video đã lên YouTube (data/youtube-id.json) và đã ra mắt; không có thì None."""
    yt = YT_ID.get(str(so))
    ngay = ngay_da_ra(ngay)
    if not yt or not ngay:
        return None
    return {"@context": "https://schema.org", "@type": "VideoObject", "name": ten[:100], "description": mo_ta, "thumbnailUrl": [anh],
            "uploadDate": ngay, "contentUrl": yt_url(yt), "embedUrl": f"https://www.youtube-nocookie.com/embed/{yt['id']}", "inLanguage": "vi"}

# Tối ưu chung cho mọi trang (thêm 18/10/2026, theo rà soát SEO và tốc độ):
#  - tiêu đề dài hơn 60 ký tự thì bỏ đuôi " | Mark học AI" (Google cắt quanh 60 ký tự, tên trang quan trọng hơn tên web);
#  - mô tả dài hơn 160 ký tự thì cắt ở chữ gần 155 ký tự, thêm "…";
#  - ảnh trong <main> trừ ảnh đầu tiên được thêm loading="lazy" decoding="async" nếu chưa có.
# Dùng lại được cho file HTML có sẵn (bài video tiếng Việt khi không có thư mục video): toi_uu_html(s) không đổi gì nếu đã tối ưu.
DUOI_TEN = " | " + SITE
def _rut_mo_ta(s):
    if len(s) <= 160:
        return s
    c = s[:155].rsplit(" ", 1)[0].rstrip(" ,.;:–-")
    return c + "…"

def toi_uu_html(s):
    m = re.search(r"<title>(.*?)</title>", s, re.S)
    if m:
        ten = html.unescape(m.group(1))
        if len(ten) > 60 and ten.endswith(DUOI_TEN):
            moi = esc(ten[: -len(DUOI_TEN)])
            s = s.replace(m.group(0), f"<title>{moi}</title>", 1)
            s = s.replace(f'<meta property="og:title" content="{m.group(1)}">', f'<meta property="og:title" content="{moi}">', 1)
    m = re.search(r'<meta name="description" content="([^"]*)">', s)
    if m:
        mt = html.unescape(m.group(1))
        moi = _rut_mo_ta(mt)
        if moi != mt:
            s = s.replace(m.group(0), f'<meta name="description" content="{esc(moi)}">', 1)
            s = s.replace(f'<meta property="og:description" content="{m.group(1)}">', f'<meta property="og:description" content="{esc(moi)}">', 1)
    i = s.find("<main")
    if i >= 0:
        dau = [True]
        def lazy(mm):
            if dau[0]:
                dau[0] = False
                return mm.group(0)
            return mm.group(0) if "loading=" in mm.group(0) else mm.group(0).replace("<img ", '<img loading="lazy" decoding="async" ', 1)
        s = s[:i] + re.sub(r"<img\s[^>]*>", lazy, s[i:])
    return s

def trang(*a, **k):
    return toi_uu_html(_trang(*a, **k))

def _trang(goc, title, desc, band, main, p, hien_tai="", og_type="article", jsonld=(), cuoi="", q=None, anh=None, co_anh=None, ngay=None):
    # goc: đường dẫn trang không kèm tiền tố ngôn ngữ (vd. "bai/03-prompt.html"); trang thật nằm ở GOC + goc
    url = BASE + GOC + goc
    return f"""<!doctype html>
<html lang="{LG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
{lien_ket_ngon_ngu(goc)}
<meta property="og:site_name" content="{SITE}">
<meta property="og:locale" content="{t("vi_VN", "en_US")}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}{anh or "assets/og.png"}">
<meta property="og:image:width" content="{(co_anh or ((1280, 720) if anh else (1200, 630)))[0]}">
<meta property="og:image:height" content="{(co_anh or ((1280, 720) if anh else (1200, 630)))[1]}">
{f'<meta property="og:image:alt" content="{esc(title)}">{chr(10)}' if co_anh else ""}{f'<meta property="article:published_time" content="{ngay}">{chr(10)}' if ngay else ""}<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2563EB">
<link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon-32.png?v=dev">
<link rel="icon" type="image/png" sizes="16x16" href="{p}assets/favicon-16.png?v=dev">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png?v=dev">
<link rel="icon" type="image/svg+xml" href="{p}assets/logo.svg?v=dev">
<link rel="manifest" href="{p}site.webmanifest">
{FONT}
<link rel="stylesheet" href="{p}style.css?v=dev">
<script>try{{var t=localStorage.getItem("mhai-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}if(self!==top&&/[?&]nhung=1/.test(location.search))document.documentElement.classList.add("nhung")</script>
<script src="{p}theo-doi.js?v=dev" defer></script>
<script src="{p}tien-do.js?v=dev" defer></script>
{chr(10).join(ld(j) for j in jsonld)}
</head>
<body class="sub">
<div class="band">
{header(p, hien_tai, q)}
<div class="band-in page-head">
{band}
</div>
</div>
{main}
{footer(p, q)}
<script src="{p}len-dau.js?v=dev" defer></script>
<script src="{p}cai-dat.js?v=dev" defer></script>
<script src="{p}cuon-hien.js?v=dev" defer></script>
<script src="{p}bit-tro-ly.js?v=dev" defer></script>
{cuoi}{huong_dan.the(goc, p, LG)}</body>
</html>
"""

# Trang riêng (trò chơi, công cụ, trang bán): hàm tạo trang gắn @trang_rieng("<tên>.html") tự vào vòng tạo trang (cả VI
# lẫn EN), không phải thêm tên vào danh sách chung nào. sitemap.xml tự có trang mới (scripts/tao_sitemap.py đọc file .html),
# tham số ưu tiên thứ hai giữ lại cho file cũ, không còn dùng.
# Trang mới nên viết thành file riêng scripts/trang/<tên>.py (xem scripts/trang/README.md), để các PR không sửa chung chỗ.
TRANG_RIENG = []
def trang_rieng(duong, uu_tien="0.7"):
    def gan(ham):
        TRANG_RIENG.append((duong, uu_tien, ham))
        return ham
    return gan

TO_CHUC = {"@type": "Organization", "name": SITE, "url": BASE, "logo": {"@type": "ImageObject", "url": BASE + "assets/logo.png"}}

def yt_url(yt):
    return f'https://www.youtube.com/watch?v={yt["id"]}' if yt.get("loai") == "dai" else f'https://www.youtube.com/shorts/{yt["id"]}'

def yt_link(v):
    if str(v["so"]) in YT_ID:  # đã đăng: mở thẳng video
        return yt_url(YT_ID[str(v["so"])])
    tieu_de, _ = tach_tieu_de(VIDEO_VI[v["so"]])  # video tiếng Việt: tìm bằng tiêu đề gốc
    return kenh["youtube"] + "/search?query=" + quote(tieu_de, safe="")

# data-so + data-kenh: bai-viet.js đổi nút thành link kênh và ghi "Video ra mắt dd/mm" khi video chưa tới ngày
def nut_video(v, g, p):
    gan = f'data-so="{v["so"]}" data-kenh="{esc(kenh["youtube"])}"'
    if g.get("sap_ra_mat"):
        return (f'<a class="btn btn-yt" {gan} href="{esc(kenh["youtube"])}" target="_blank" rel="noopener">{t("Theo dõi kênh YouTube", "Follow on YouTube")}</a>'
                f'<span class="soon-note">{t("Video này sắp ra mắt", "Coming soon")}</span>')
    return f'<a class="btn btn-yt" {gan} href="{esc(yt_link(v))}" target="_blank" rel="noopener">{ic(p, "play")}{t("Xem video", "Watch video")}</a>'

def khoi_prompt(so, prompt, p):
    """Prompt mẫu + nút chép (ẩn sẵn, bai-viet.js mở ra khi chạy được)."""
    if not prompt:
        return ""
    return (f'\n  <p class="try-prompt" id="prompt-{so}">{esc(prompt)}</p>'
            f'\n  <button class="btn copy-btn" type="button" data-chep="prompt-{so}" hidden>{ic(p, "copy")}{t("Sao chép prompt", "Copy prompt")}</button>')

# ---------- bài viết ----------
def noi_dung_vi(v):
    """Nội dung bài tiếng Việt từ thư mục video: (các mục, mô tả meta, câu 'Thử ngay' của mô tả, prompt mẫu)."""
    thu_muc = ROOT / ten_file(v)
    muc = []
    for s in doc_canh(thu_muc):
        chip, ten, lines = s.get("chip", ""), s.get("title", ""), s.get("lines", [])
        if chip == "THỬ NGAY":
            muc.append({"try": True, "title": ten, "text": thanh_doan([bo_tien_to_thu(lines[0])] + lines[1:]) if lines else ""})
        else:
            muc.append({"chip": chip, "title": ten, "text": thanh_doan(lines)})
    meta, thu_mo_ta = doc_mo_ta(thu_muc)
    return muc, meta, thu_mo_ta, doc_prompt(thu_muc, v["so"])

def noi_dung_en(v):
    """Bài đã dịch: data/en/bai/<số>-<slug>.json. Chưa dịch thì tạm lấy bản tiếng Việt."""
    f = R / "data" / "en" / "bai" / f"{ten_file(v)}.json"
    if not f.exists():
        print("CẢNH BÁO: chưa dịch bài", f.name, "- tạm dùng bản tiếng Việt")
        return noi_dung_vi(v)
    d = json.loads(f.read_text(encoding="utf-8"))
    muc = [{"try": bool(m.get("try")), "chip": m.get("chip", ""), "title": m.get("title", ""), "text": thanh_doan([m.get("text", "")])}
           for m in d.get("muc", [])]
    return muc, d.get("meta", ""), d.get("thu", ""), d.get("prompt", "")

def ten_video(v):
    """Tên video để làm chữ thay ảnh (alt): tên ngắn trong chu_de, bỏ phần series."""
    return tach_tieu_de(v)[0]

def trinh_phat(yt, ten, anh=None):
    """Ảnh bìa + nút phát YouTube (ten đã esc). Không có ảnh riêng thì dùng ảnh bìa của YouTube."""
    anh = anh or (f'<img src="https://i.ytimg.com/vi/{yt["id"]}/hqdefault.jpg" width="480" height="360" alt="{ten}" decoding="async" '
                  f'fetchpriority="high">')
    return (f'<figure class="post-cover yt-lite" data-yt="{yt["id"]}" data-tieu-de="{ten}">{anh}'
            f'<a class="yt-play" href="{yt_url(yt)}" target="_blank" rel="noopener" aria-label="{t("Phát video", "Play video")}: {ten}">'
            f'<svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-nen" d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6c5.3 1.4 26.5 1.4 26.5 1.4s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z"/>'
            f'<path fill="#fff" d="M27 34.5 45 24 27 13.5z"/></svg></a></figure>\n')

def anh_dau_bai(v, p):
    """Đầu bài:
    - có mã YouTube (data/youtube-id.json, scripts/cap_nhat_youtube.py): ảnh bìa + nút phát, bấm mới tải trình phát
      youtube-nocookie (bai-viet.js), nên trang không tải gì của YouTube khi chưa bấm. Không tự phát: YouTube không
      tính lượt xem cho video nhúng tự phát;
    - chưa có mã: ảnh bìa (data/anh.json, chỉ video mới) kèm biểu tượng các nền tảng để xem video.
    Video 01-302 chưa đăng YouTube thì không có gì ở đây."""
    a, yt = ANH.get(str(v["so"])), YT_ID.get(str(v["so"]))
    ten = esc(ten_video(v))
    if a and a.get("bia"):
        anh = (f'<img src="{p}{a["bia"]}" srcset="{p}{a["the"]} 640w, {p}{a["bia"]} 1280w" sizes="(max-width: 800px) 100vw, 696px" '
               f'width="1280" height="720" alt="{ten}" decoding="async" fetchpriority="high">')
    elif yt:
        anh = (f'<img src="https://i.ytimg.com/vi/{yt["id"]}/hqdefault.jpg" width="480" height="360" alt="{ten}" decoding="async" '
               f'fetchpriority="high">')
    else:
        return ""
    if yt:
        return trinh_phat(yt, ten, anh)
    xem = "".join(nut_nen_tang(k, p, "nt nt-sm") for k in ("youtube", "tiktok", "facebook", "instagram") if kenh.get(k))
    return (f'<figure class="post-cover">{anh}</figure>\n'
            f'<p class="post-xem"><span>{t("Xem video trên", "Watch on")}</span>{xem}</p>\n')

def anh_canh(v, i, ten, p):
    """Khung hình trong video đặt dưới đoạn giải thích của mục i (chỉ video mới có trong data/anh.json)."""
    for c in ANH.get(str(v["so"]), {}).get("canh", []):
        if c.get("muc") == i:
            return (f'\n<figure class="post-still"><img src="{p}{c["anh"]}" width="720" height="576" loading="lazy" decoding="async" '
                    f'alt="{esc(ten)}"><figcaption>{t("Cảnh trong video", "From the video")} #{v["so"]:02d}: {esc(ten)}</figcaption></figure>')
    return ""

# ---------- logo công cụ trong bài (chỉ video mới, số >= VIDEO_MOI_TU) ----------
# Theo brand/quy-tac-dung-thuong-hieu.md: logo chỉ ở bài nói về đúng sản phẩm đó, giữ nguyên file gốc (assets/cong-cu/
# chép nguyên từ brand/icon-dich-vu), nhỏ hơn logo kênh, không ở bài chuyện tiêu cực; có dòng miễn trừ ở cuối bài.
CONG_CU = [  # (file, tên hiện, mẫu tìm trong tiêu đề và nội dung tiếng Việt)
    ("chatgpt", "ChatGPT", r"\bChatGPT\b"), ("claude", "Claude", r"\bClaude\b"), ("gemini", "Gemini", r"\bGemini\b"),
    ("gmail", "Gmail", r"\bGmail\b"), ("drive", "Google Drive", r"\bGoogle Drive\b"), ("calendar", "Google Calendar", r"\bGoogle Calendar\b|\bLịch Google\b"),
    ("colab", "Google Colab", r"\bColab\b"), ("chrome", "Chrome", r"\bChrome\b"), ("google", "Google", r"\bGoogle\b(?! (?:Drive|Calendar|Colab|Docs|Sheets))"),
    ("excel", "Excel", r"\bExcel\b"), ("word", "Word", r"\b(?:Microsoft Word|file Word|tệp Word|bản Word)\b"), ("powerpoint", "PowerPoint", r"\bPowerPoint\b"),
    ("python", "Python", r"\bPython\b"), ("pandas", "pandas", r"\bpandas\b"), ("scikit-learn", "scikit-learn", r"\bscikit-learn\b"), ("pdf", "PDF", r"\bPDF\b"),
]
TIEU_CUC = re.compile(r"lừa đảo|lừa|deepfake|giả giọng|giả mạo|sự cố|bê bối|rò rỉ|lộ dữ liệu|tấn công|hack|scam", re.I)
_cong_cu = {}

def cong_cu_trong_bai(v):
    """Các công cụ bài này nói tới: tên có trong tiêu đề, hoặc được nhắc ít nhất 2 lần trong bài. Chuyện tiêu cực: không logo."""
    so = v["so"]
    if so < VIDEO_MOI_TU:
        return []
    if so not in _cong_cu:
        muc = noi_dung_vi(v)[0]
        tieu_de = CHU_DE_VI.get(so, "") + " " + seo_vi.get(str(so), "")
        noi_dung = " ".join(m.get("title", "") + " " + m.get("text", "") for m in muc)
        if TIEU_CUC.search(tieu_de + " " + noi_dung) or nhom_cua[so]["id"] in SERIES_TIEU_CUC:
            _cong_cu[so] = []
        else:
            _cong_cu[so] = [(f, ten) for f, ten, mau in CONG_CU
                            if re.search(mau, tieu_de) or len(re.findall(mau, noi_dung)) >= 2]
    return _cong_cu[so]

SERIES_TIEU_CUC = {"dung-de-ai-lua", "mat-trai-ai", "an-toan-so-2"}

def khoi_cong_cu(v, p):
    ds = cong_cu_trong_bai(v)
    if not ds:
        return "", ""
    the = "".join(f'<li><img src="{p}assets/cong-cu/{f}.svg" alt="" width="22" height="22" loading="lazy" decoding="async">{esc(ten)}</li>' for f, ten in ds)
    dau = f'<div class="post-tools"><p>{t("Công cụ trong bài", "Tools in this article")}</p><ul>{the}</ul></div>\n'
    cuoi = (f'<p class="post-mien-tru">{t("Tên và logo sản phẩm thuộc về các công ty sở hữu, chỉ dùng để minh họa trong nội dung giáo dục. Mark học AI không liên kết hay được tài trợ bởi các công ty này.", "Product names and logos belong to their respective owners and are used only to illustrate educational content. Mark học AI is not affiliated with or sponsored by these companies.")}</p>\n')
    return dau, cuoi

def than_bai(v, muc_nd, thu_mo_ta, prompt, p, q):
    """Các mục của bài (đoạn giải thích, hộp Thử ngay), dùng chung cho video chính và tập phụ."""
    so, thu_nhan = v["so"], t("Thử ngay", "Try it now")
    muc, co_thu = [], False
    for i_muc, s in enumerate(muc_nd):
        chip, ten, doan = s.get("chip", ""), s.get("title", ""), s.get("text", "")
        if s.get("try"):
            co_thu = True
            muc.append(f'<aside class="try" aria-labelledby="thu-{so}">\n  <img src="{p}assets/mark-a-ra-the.svg" alt="" width="96" height="91" loading="lazy">\n'
                       f'  <div><p class="try-label">{thu_nhan}</p>\n  <h2 id="thu-{so}">{esc(ten)}</h2>\n  <p>{gan_link_video(doan, q, so)}</p>{khoi_prompt(so, prompt, p)}</div>\n</aside>')
            continue
        nhan = f'<p class="sec-chip">{esc(chip)}</p>\n' if chip else ""
        # Tiêu đề là câu hỏi: có Bit đứng cạnh (Sang góp ý 8/10)
        if ten and ten.rstrip().endswith("?"):
            h2 = f'<h2 class="h-hoi"><img src="{p}assets/bit-y-tuong.svg" alt="" width="44" height="53">{esc(ten)}</h2>\n'
        else:
            h2 = f"<h2>{esc(ten)}</h2>\n" if ten else ""
        muc.append(f'<section>\n{nhan}{h2}<p>{gan_link_video(doan, q, so)}</p>{anh_canh(v, i_muc, ten, p)}\n</section>')
    if not co_thu and thu_mo_ta:
        muc.append(f'<aside class="try" aria-labelledby="thu-{so}">\n  <img src="{p}assets/mark-a-ra-the.svg" alt="" width="96" height="91" loading="lazy">\n'
                   f'  <div><p class="try-label">{thu_nhan}</p>\n  <h2 id="thu-{so}">{t("Làm ngay hôm nay", "Do it today")}</h2>\n'
                   f'  <p>{gan_link_video(thanh_doan([viet_hoa(thu_mo_ta)]), q, so)}</p>{khoi_prompt(so, prompt, p)}</div>\n</aside>')

    return muc

# Bài của video có ca trong trò chơi "Lừa đảo hay thật?" (data/lua-dao.json) có thêm thẻ mời chơi
VIDEO_LUA_DAO = {c["video"] for c in load("lua-dao")["ca"]}
SO_CA_LUA_DAO = len(load("lua-dao")["ca"])

def the_lua_dao(so, q):
    if so not in VIDEO_LUA_DAO:
        return ""
    return (f'<a class="next-step next-step-ld" href="{q}lua-dao-hay-that.html"><b>{t("Lừa đảo hay thật?", "Scam or real?")}</b>'
            f'<span>{t(f"Thử nhận ra chiêu lừa trong {SO_CA_LUA_DAO} tình huống trên điện thoại.", f"Spot the tricks in {SO_CA_LUA_DAO} phone situations.")}</span></a>\n')

# Bài của video về câu lệnh (data/ghep-cau-lenh.json, "video_lien_quan") có thêm thẻ mời chơi "Thợ ghép câu lệnh"
VIDEO_GHEP = set(load("ghep-cau-lenh")["video_lien_quan"])

def the_ghep(so, q):
    if so not in VIDEO_GHEP:
        return ""
    return (f'<a class="next-step next-step-gh" href="{q}tho-ghep-cau-lenh.html"><b>{t("Thợ ghép câu lệnh", "Prompt builder")}</b>'
            f'<span>{t("Ghép từng mảnh câu lệnh, xem câu trả lời của AI tốt lên ra sao.", "Snap prompt pieces together and watch the AI answer improve.")}</span></a>\n')

# Thẻ "Tương tác" (giống nhãn Tương tác bên Vũ Trụ Khác): video nào có trò chơi trên web. Khoá là số video dạng chữ ("108", "5.1").
# Dùng cho dòng thẻ dưới tiêu đề trang bài, và ghi ra data/tuong-tac.json để trang chủ (app.js) gắn nhãn lên thẻ series và từng video.
# Danh sách trò chơi: mỗi trò chơi một file data/tro-choi/<tên>.json (scripts/tro_choi.py), để các PR trò chơi không sửa chung một chỗ.
TUONG_TAC = tro_choi.tuong_tac()

# Hình xem trước nhỏ trên thẻ "Chơi thử" (HTML + CSS, không ảnh): người xem nhìn là biết trò chơi làm gì
# Hình xem trước của trò chơi mới: đăng ký trong file riêng scripts/trang/<tên>.py, vd.
#   HINH_CHOI["ten-hinh"] = lambda: f'<span class="ct-hinh ct-...">...</span>'
HINH_CHOI = {}
def hinh_choi(hinh):
    if hinh in HINH_CHOI:
        return HINH_CHOI[hinh]()
    if hinh == "goi":
        return (f'<span class="ct-hinh ct-goi" aria-hidden="true"><span class="ct-goi-av">M</span><b>{t("Số không lưu", "Unknown number")}</b>'
                f'<span class="ct-goi-noi">{t("“Mẹ ơi cứu con…”", "“Mom, help me…”")}</span>'
                f'<span class="ct-chon"><span class="ct-gia">{t("Từ chối", "Decline")}</span><span>{t("Nghe", "Answer")}</span></span></span>')
    if hinh == "ghep":
        manh = [("vai", t("Vai trò", "Role")), ("boi", t("Bối cảnh", "Context")), ("viec", t("Nhiệm vụ", "Task")), ("dang", t("Định dạng", "Format"))]
        return ('<span class="ct-hinh ct-ghep" aria-hidden="true">' + "".join(f'<span class="ct-manh ct-{k}">{ten}</span>' for k, ten in manh) +
                '<span class="ct-sao">★★★</span></span>')
    if hinh == "bat-loi":
        return (f'<span class="ct-hinh ct-bl" aria-hidden="true"><span class="ct-tin">{t("Marathon dài", "A marathon is")} <span class="ct-sai">26,2 km</span></span>'
                f'<span class="ct-tin">{t("Đặt lò 350 độ C", "Set the oven to 350°C")}</span><span class="ct-kinh"></span></span>')
    if hinh == "lua-dao":
        return (f'<span class="ct-hinh ct-ld" aria-hidden="true"><span class="ct-tin">{t("Mẹ ơi con đây, chuyển gấp cho con 20 triệu…", "Mom, it&#39;s me, send me 20 million now…")}</span>'
                f'<span class="ct-chon"><span>{t("Thật", "Real")}</span><span class="ct-gia">{t("Lừa đảo", "Scam")}</span></span></span>')
    if hinh == "cat-manh":
        return ('<span class="ct-hinh ct-cm" aria-hidden="true"><span class="ct-cau">' +
                "".join(f'<span>{m}</span>' for m in (["Xin", " ch", "ào", " Việt", " Nam"] if LG != "en" else ["Hello", " Vietnam", "!"])) +
                f'</span><span class="ct-dem">{t("5 mảnh", "3 tokens")}</span></span>')
    if hinh == "doan-chu":
        return (f'<span class="ct-hinh ct-dc" aria-hidden="true"><span class="ct-cau">{t("Bạn có thể", "You can")} <i>▍</i></span><span class="ct-chon">' +
                "".join(f'<span>{w} <b>{p}%</b></span>' for w, p in ([("bị", 25), ("bịa", 15), ("làm", 12)] if LG != "en" else [("click", 19), ("use", 14), ("ask", 14)])) +
                '</span></span>')
    if hinh == "vong-quay":
        return (f'<span class="ct-hinh ct-vq" aria-hidden="true"><span class="ct-banh"></span><span class="ct-nhiet">{t("Nhiệt độ", "Temperature")} <b>0.7</b></span></span>')
    if hinh == "thien-vi":
        hs = [("is-tuyen", "✓"), ("is-tuyen", "✓"), ("is-loai", "✗"), ("is-loai", "✗")]
        return ('<span class="ct-hinh ct-tv" aria-hidden="true">' + "".join(f'<span class="ct-hs {c}"><i></i><i></i><b>{k}</b></span>' for c, k in hs) +
                f'<span class="ct-tv-can">{t("Máy lọc", "Filter")} ⚖️</span></span>')
    if hinh == "dan":
        return (f'<span class="ct-hinh ct-dk" aria-hidden="true"><span class="ct-tin">{t("Mã OTP của bạn là 482 913…", "Your OTP is 482 913…")}</span>'
                f'<span class="ct-chon"><span>{t("Dán", "Paste")}</span><span class="ct-che">{t("Che", "Mask")}</span><span class="ct-gia">{t("Đừng", "Don&#39;t")}</span></span></span>')
    if hinh == "may-tinh":
        return (f'<span class="ct-hinh ct-mt" aria-hidden="true"><span class="ct-mt-o"><small>{t("Quảng cáo", "Advertised")}</small>12%</span>'
                f'<span class="ct-mt-o ct-mt-that"><small>{t("Lãi thật", "Real rate")}</small>{t("21,5%", "21.5%")}</span><span class="ct-mt-f">= f(x)</span></span>')
    return ('<span class="ct-hinh ct-cb" aria-hidden="true"><span class="ct-vong"></span><span class="ct-vong"></span><span class="ct-vong"></span>'
            '<span class="ct-cam"><span>LiDAR</span><span>Radar</span><span>Camera</span></span></span>')

# Khối "Xem 60 giây, thử 60 giây" ở cuối bài có trò chơi (Sang: đọc bài trước, xem video, rồi mới chơi): video bên trái, trò chơi bên phải (điện thoại: trên dưới).
# Trò chơi thu gọn thành thẻ giới thiệu; bấm "Chơi ngay ở đây" thì bai-viet.js tải trang trò chơi vào iframe (?nhung=1)
# và mở rộng tràn chiều ngang web. Không có JS thì nút là link sang trang trò chơi. Video không có trò chơi: trả về "".
def xem_choi(so, q, p, video):
    tro = TUONG_TAC.get(str(so))
    if not tro:
        return ""
    url, ten, moi, hinh = tro[0]
    them = "".join(f'<a class="xc-them" href="{q}{u}">+ {t("Chơi thêm", "Also try")}: {t(*tn)}</a>' for u, tn, _, _ in tro[1:])
    xem = ""
    if video:
        xem = (f'<div class="xc-o xc-xem"><p class="xc-h"><span class="so">1</span>{t("Xem 60 giây", "Watch 60 seconds")}</p>{video}'
               f'<button type="button" class="xc-lai" hidden>{ic(p, "play")}{t("Xem lại video", "Watch the video again")}</button></div>')
    dau = (t("Đọc xong rồi? Giờ xem video và chơi thử", "Done reading? Now watch the video and try it") if xem
           else t("Đọc xong rồi? Giờ chơi thử", "Done reading? Now try it yourself"))
    return (f'<section class="xem-choi{"" if xem else " chi-choi"}" id="thu-choi" aria-labelledby="xc-dau">\n<h2 class="xc-dau" id="xc-dau">{dau}</h2>\n{xem}'
            f'<div class="xc-o xc-choi" data-url="{q}{url}" data-ten="{esc(t(*ten))}"><p class="xc-h"><span class="so">{"2" if xem else "★"}</span>'
            f'<span class="xc-tieu">{t("Thử 60 giây", "Try it in 60 seconds")}<span class="xc-ten-mo">: {t(*ten)}</span></span>'
            f'<span class="hh hh-choi"><svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-gamepad"/></svg>{t("Tương tác", "Interactive")}</span></p>'
            f'<div class="xc-gon">{hinh_choi(hinh)}<b class="xc-ten">{t(*ten)}</b><p class="xc-moi">{t(*moi)}</p>'
            f'<a class="ct-nut xc-mo" href="{q}{url}">{t("Chơi ngay ở đây", "Play right here")} ↓</a>'
            f'<span class="xc-meo">{t("Trò chơi mở ngay trong trang, không cần chuyển trang.", "The game opens right on this page.")}</span>{them}</div>'
            f'<button type="button" class="xc-dong" hidden>{t("Thu gọn trò chơi", "Collapse the game")} ↑</button></div>\n</section>\n')

# Mục lục "Trong bài": gắn id cho các h2 trong thân bài, trả về (thân bài, danh sách (id, chữ))
def muc_luc(muc):
    ds, dem = [], [0]
    def gan(m):
        mo, cls, noi = m.group(0), m.group(1) or "", m.group(2)
        cu = re.search(r'id="([^"]+)"', cls)
        if cu:
            hid = cu.group(1)
        else:
            dem[0] += 1
            hid = f"muc-{dem[0]}"
            mo = f'<h2 id="{hid}"{cls}>{noi}</h2>'
        ds.append((hid, re.sub(r"<[^>]+>", "", noi).strip()))
        return mo
    than = re.sub(r'<h2((?:\s[^>]*)?)>(.*?)</h2>', gan, "\n".join(muc), flags=re.S)
    return than, ds

# Cột bên (máy tính rộng): mục lục bám theo khi cuộn + thẻ chơi thử nhỏ + nút xem video
def cot_ben(ds, so, q, p, nut):
    if len(ds) < 3:
        return ""
    ml = "".join(f'<li><a href="#{i}">{esc(html.unescape(x))}</a></li>' for i, x in ds)
    choi = ""
    for u, ten, _, _ in TUONG_TAC.get(str(so), []):
        choi += (f'<a class="ben-choi" href="#thu-choi" data-mo-choi><svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-gamepad"/></svg>'
                 f'<span><small>{t("Chơi thử", "Try it")}</small>{t(*ten)}</span></a>')
    return (f'<aside class="doc-ben" aria-label="{t("Trong bài", "In this article")}"><div class="ben-dinh">'
            f'<p class="ben-h">{t("Trong bài", "In this article")}</p><ol class="ben-ml">{ml}</ol>{choi}'
            f'<div class="ben-xem">{nut}</div></div></aside>\n')

# Cuối bài video (thêm 18/10/2026): "Xem thêm" 4 bài cùng thuật ngữ hoặc cùng series (trước đó 277/310 bài có tối đa 3 link
# sang bài khác), và thẻ mời theo nghề dẫn sang trang thực hành hoặc trang dịch vụ hợp với video (đếm lượt bấm qua data-cta).
_CTA_NGHE = [  # (ngành trong data/lo-trinh-nganh.json, trang, tiêu đề, mô tả)
    ("giao-vien", "bo-giao-vien.html", ("Bộ bài giảng AI cho giáo viên", "AI lesson kit for teachers"), ("Slide, phiếu bài tập và video dùng ngay trong lớp.", "Slides, worksheets and videos ready for class.")),
    ("van-phong", "workshop.html", ("Workshop AI cho công việc", "AI at work workshop"), ("Một buổi thực hành cùng cả nhóm, có tài liệu mang về.", "A hands-on session for your team, with take-home notes.")),
    ("ban-hang", "ai-ban-hang.html", ("AI cho người bán hàng", "AI for small sellers"), ("11 trạm thực hành: caption, khách giận, chatbot của tiệm.", "11 practice stations: captions, upset customers, a shop chatbot.")),
    ("noi-dung", "dich-vu.html", ("Làm video giải thích cho bạn", "Explainer videos for you"), ("Kênh làm video ngắn theo yêu cầu cho doanh nghiệp, trường học.", "Short explainer videos made to order.")),
    ("hoc-sinh", "ai-hoc-sinh.html", ("AI cho học sinh cấp 3", "AI for high school students"), ("11 trạm: học cùng AI hay làm hộ, thật hay bịa, gia sư AI.", "11 stations: learn with AI or cheat, true or made up, AI tutor.")),
    ("gia-dinh", "ai-gia-dinh.html", ("AI cho gia đình", "AI for families"), ("11 trạm: cuộc gọi giả giọng, tin lừa đảo, luật dùng AI trong nhà.", "11 stations: fake-voice calls, scam texts, house rules for AI.")),
]
def _so_nganh():
    d = load("lo-trinh-nganh")["nganh"]
    chung = {s for b in d["moi-bat-dau"]["buoc"] for s in b.get("so", [])}
    return {k: {s for b in d[k]["buoc"] for s in b.get("so", [])} - chung for k, *_ in _CTA_NGHE if k in d}
_SO_NGANH = _so_nganh()

def the_cta_nghe(so, q):
    for k, trang_, ten, mo in _CTA_NGHE:
        if so in _SO_NGANH.get(k, ()):
            return (f'<a class="next-step next-step-cta" href="{q}{trang_}" data-cta="{k}">'
                    f'<b>{t(*ten)}</b><span>{t(*mo)}</span></a>\n')
    return ""

def khoi_xem_them(v, q):
    so, i = v["so"], thu_tu.index(v)
    bo = {so} | {thu_tu[j]["so"] for j in (i - 1, i + 1) if 0 <= j < len(thu_tu)}
    ds = []
    for x in tu_dien:  # cùng thuật ngữ trước
        if so in x["video"]:
            for s in x["video"]:
                if s not in bo and s in co_bai and s not in ds:
                    ds.append(s)
    for x in nhom_cua[so]["items"]:  # rồi cùng series
        if x["so"] not in bo and x["so"] not in ds:
            ds.append(x["so"])
    ds = ds[:4]
    if not ds:
        return ""
    return (f'<section class="related xem-them" aria-labelledby="xt-{so}">\n<h2 id="xt-{so}">{t("Xem thêm", "Read next")}</h2>\n<ul class="xt-ds">'
            + "".join(f'<li><a href="{q}bai/{ten_file(co_bai[s])}.html"><span class="num">#{s:02d}</span>{esc(seo[str(s)])}</a></li>' for s in ds)
            + '</ul>\n</section>\n')

def tao_bai(v):
    so, g = v["so"], nhom_cua[v["so"]]
    muc_nd, meta, thu_mo_ta, prompt = noi_dung_en(v) if LG == "en" else noi_dung_vi(v)
    tieu_de, phan = tach_tieu_de(v)
    h1 = seo[str(so)]
    p = t("../", "../../")  # về thư mục gốc (assets, js)
    q = "../"               # về trang chủ của ngôn ngữ này
    goc = f"bai/{ten_file(v)}.html"
    muc = than_bai(v, muc_nd, thu_mo_ta, prompt, p, q)

    # điều hướng series: phần trước/sau; hết series thì nối sang series kề bên
    i = thu_tu.index(v)
    def the(vv, nhan):
        return (f'<a class="nav-card" href="{q}bai/{ten_file(vv)}.html"><span class="nav-dir">{nhan}</span>'
                f'<b>#{vv["so"]:02d} · {esc(seo[str(vv["so"])])}</b></a>')
    truoc = thu_tu[i - 1] if i > 0 else None
    sau = thu_tu[i + 1] if i + 1 < len(thu_tu) else None
    nav = []
    if truoc:
        nav.append(the(truoc, t("‹ Phần trước", "‹ Previous part") if nhom_cua[truoc["so"]] is g and not g.get("le") else (t("‹ Video trước", "‹ Previous video") if nhom_cua[truoc["so"]] is g else t("‹ Series trước: ", "‹ Previous series: ") + esc(nhom_cua[truoc["so"]]["ten"]))))
    else:
        nav.append("<span></span>")
    if sau:
        nav.append(the(sau, (t("Phần tiếp theo ›", "Next part ›") if not g.get("le") else t("Video tiếp theo ›", "Next video ›")) if nhom_cua[sau["so"]] is g else t("Series tiếp theo: ", "Next series: ") + esc(nhom_cua[sau["so"]]["ten"]) + " ›").replace('class="nav-card"', 'class="nav-card next"'))
    so_phan = f"{g['items'].index(v) + 1}/{len(g['items'])}"

    lien_quan = [x for x in tu_dien if so in x["video"]]
    tu_html = ""
    if lien_quan:
        tu_html = (f'<section class="related" aria-labelledby="tu-lq">\n<h2 id="tu-lq">{t("Thuật ngữ trong bài", "Terms in this article")}</h2>\n<ul class="term-chips">' +
                   "".join(f'<li><a href="{q}tu-dien.html#{x["id"]}">{esc(x["thuat_ngu"])}</a></li>' for x in lien_quan) +
                   f'</ul>\n<p class="related-more">{t("Xem giải thích từng chữ trong", "See each term explained in the")} <a href="{q}tu-dien.html">{t("Từ điển AI", "AI glossary")}</a>.</p>\n</section>')

    lead = thanh_doan([bo_emoji(v["mo_ta"])])
    ghi_chu = t("", '<span class="lang-note">Video in Vietnamese</span>')  # video của kênh nói tiếng Việt
    band = (f'<nav class="crumbs" aria-label="{t("Đường dẫn", "Breadcrumb")}"><a href="{q}">{t("Trang chủ", "Home")}</a> › <a href="{q}#{g["id"]}">{esc(g["ten"])}</a> › <span>#{so:02d}</span></nav>\n'
            f'<p class="eyebrow">Video #{so:02d} · {esc(g["ten"])}{" · " + phan if phan else ""}{nhan_ngay(LICH.get(str(so)))}</p>\n'
            f'<h1>{esc(h1)}</h1>\n<p class="lead">{esc(lead)}</p>\n<div class="cta">{nut_video(v, g, p)}{ghi_chu}</div>')
    than, ds_muc = muc_luc(muc)
    dau_video = anh_dau_bai(v, p)
    khoi_choi = xem_choi(so, q, p, dau_video)
    if khoi_choi:
        dau_video = ""
    ket = t(f'Đây là bài viết từ video <b>{esc(tieu_de)}</b> của kênh Mark học AI. Xem video để thấy phần minh họa bằng hình động.',
            f'This article is based on the video <b>{esc(tieu_de)}</b> from the Mark học AI channel. Watch the video (in Vietnamese) to see the animations.')
    dau_nav = (t("Video lẻ", "Standalone videos") if g.get("le") else "Series")
    vi_tri = "#" + format(so, "02d") if g.get("le") else t("Phần ", "Part ") + so_phan
    cc_dau, cc_cuoi = khoi_cong_cu(v, p)
    main = (f'<main class="doc doc-bai">\n<div class="doc-chinh">\n<article class="post">\n' + dau_video + cc_dau + than +
            f'\n<div class="post-end">\n<p>{ket}</p>\n<div class="cta">{nut_video(v, g, p)}</div>\n{cc_cuoi}{khoi_chia_se(BASE + GOC + goc, h1, p)}</div>\n</article>\n</div>\n'
            + cot_ben(ds_muc, so, q, p, nut_video(v, g, p)) + '</main>\n' + khoi_choi + '<div class="doc doc-cuoi">\n' +
            f'{tu_html}\n{khoi_xem_them(v, q)}<nav class="series-nav" aria-label="{t("Trong series", "In this series")}">\n<p class="series-nav-head">{dau_nav} <a href="{q}#{g["id"]}">{esc(g["ten"])}</a> · {vi_tri}</p>\n'
            f'<div class="nav-cards">{"".join(nav)}</div>\n</nav>\n' + khoi_tap_phu(so, q) +
            f'<aside class="next-steps">\n{the_cta_nghe(so, q)}{the_lua_dao(so, q)}{the_ghep(so, q)}<a class="next-step" href="{q}kiem-tra.html"><b>{t("Bạn hiểu AI tới đâu?", "How well do you know AI?")}</b><span>{t("Nhiều bộ câu hỏi, đạt 80% nhận giấy chứng nhận.", "Several quizzes, score 80% for a certificate.")}</span></a>\n'
            f'<a class="next-step" href="{q}#bat-dau"><b>{t("Mới đến kênh?", "New to the channel?")}</b><span>{t("Bản đồ 7 vùng và lộ trình cho người mới.", "A 7-region map and a path for beginners.")}</span></a>\n</aside>\n</div>')
    url = BASE + GOC + goc
    ngay = LICH.get(str(so))
    og = anh_chia_se_bai(goc, tieu_de, g["ten"] + (" · " + phan if phan else ""), f"{so:02d}", ngay, SERIES_BIA.get(g["id"], {}).get("bia"))
    jsonld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": h1[:110], "description": meta, "inLanguage": LG,
         "url": url, "mainEntityOfPage": url, "image": [BASE + og], **({"datePublished": ngay_da_ra(ngay)} if ngay_da_ra(ngay) else {}), "author": TO_CHUC, "publisher": TO_CHUC,
         "isPartOf": {"@type": "CreativeWorkSeries", "name": g["ten"]},
         **({"about": [{"@type": "DefinedTerm", "name": x["thuat_ngu"], "url": BASE + GOC + "tu-dien.html#" + x["id"]} for x in lien_quan]} if lien_quan else {})},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Mark học AI", "item": BASE + GOC},
            {"@type": "ListItem", "position": 2, "name": g["ten"], "item": BASE + GOC + "#" + g["id"]},
            {"@type": "ListItem", "position": 3, "name": h1, "item": url}]},
    ]
    vo = video_object(so, h1, meta or lead, BASE + og, ngay)
    if vo:
        jsonld.append(vo)
    return GOC + goc, trang(goc, f"{h1} | {SITE}", meta or lead, band, main, p, jsonld=jsonld, q=q,
                            cuoi=f'<script src="{p}bai-viet.js?v=dev" defer></script>\n', anh=og, co_anh=(1200, 630), ngay=ngay_da_ra(ngay))

# ---------- tập phụ (5.1-5.7, 69.1-69.3): bài riêng cho video số thập phân nối tiếp một video chính ----------
# Dữ liệu: data/video-phu.json (+ data/en/video-phu.json, data/en/bai/<cha>-<phụ>-<slug>.json). Trang: bai/05-1-<slug>.html.
# Tập phụ không vào lưới trang chủ (app.js chỉ biết số nguyên): trang video chính có khối "Series tiếp nối" dẫn sang.
NAM = {"hai nghìn không trăm hai mươi" + (" " + k if k else ""): str(2020 + n)
       for k, n in (("", 0), ("mốt", 1), ("hai", 2), ("ba", 3), ("bốn", 4), ("tư", 4), ("lăm", 5), ("sáu", 6))}

def so_nam(text):
    """Lời đọc viết năm bằng chữ ("năm hai nghìn không trăm hai mươi hai"); trên trang viết số cho dễ đọc."""
    for chu in sorted(NAM, key=len, reverse=True):
        text = re.sub(rf"\b{chu}(?![\wÀ-ỹ])", NAM[chu], text)
    return text

def nhan_so(so):
    return so if isinstance(so, str) else f"{so:02d}"

def chuoi_phu(s):
    """Thứ tự đọc của series tập phụ: video chính trước, rồi các tập phụ."""
    return [co_bai[s["cha"]]] + s["tap"]

def ten_trong_chuoi(x):
    return x["tieu_de"] if isinstance(x["so"], str) else seo[str(x["so"])]

def khoi_tap_phu(so, q):
    """Trang video chính có tập phụ: các thẻ dẫn sang từng phần của series tiếp nối."""
    s = phu_cua.get(so)
    if not s:
        return ""
    lech = s["tong"] - len(s["tap"])  # video chính là phần 1 khi series có thêm 1 phần
    the = "".join(f'<a class="nav-card" href="{q}bai/{ten_file(x)}.html"><span class="nav-dir">{t("Phần", "Part")} {i + 1 + lech}/{s["tong"]}</span>'
                  f'<b>#{x["so"]} · {esc(x["tieu_de"])}</b></a>' for i, x in enumerate(s["tap"]))
    dau = (t("Video này là phần 1 của series", "This video is part 1 of the series") if lech else t("Xem sâu hơn trong series", "Go deeper in the series"))
    return (f'<nav class="series-nav" aria-label="{esc(s["ten"])}">\n<p class="series-nav-head">{dau} <b>{esc(s["ten"])}</b></p>\n'
            f'<div class="nav-cards">{the}</div>\n</nav>\n')

def tao_bai_phu(s, x):
    so, cha = x["so"], co_bai[s["cha"]]
    g = nhom_cua[cha["so"]]
    muc_nd, meta, thu_mo_ta, prompt = noi_dung_en(x) if LG == "en" else noi_dung_vi(x)
    if LG == "vi":
        muc_nd = [{**m, "text": so_nam(m.get("text", ""))} for m in muc_nd]
        meta = so_nam(meta)
    p, q = t("../", "../../"), "../"
    goc = f"bai/{ten_file(x)}.html"
    chuoi = chuoi_phu(s)
    i = chuoi.index(x)
    lech = s["tong"] - len(s["tap"])
    phan = f'{t("Phần", "Part")} {s["tap"].index(x) + 1 + lech}/{s["tong"]}'
    muc = than_bai(x, muc_nd, thu_mo_ta, prompt, p, q)

    def the(vv, nhan, cls="nav-card"):
        return (f'<a class="{cls}" href="{q}bai/{ten_file(vv)}.html"><span class="nav-dir">{nhan}</span>'
                f'<b>#{nhan_so(vv["so"])} · {esc(ten_trong_chuoi(vv))}</b></a>')
    truoc = chuoi[i - 1] if i > 0 else None
    sau = chuoi[i + 1] if i + 1 < len(chuoi) else None
    nav = [the(truoc, t("‹ Video gốc", "‹ Original video") if truoc is cha and not lech else t("‹ Phần trước", "‹ Previous part")) if truoc else "<span></span>"]
    if sau:
        nav.append(the(sau, t("Phần tiếp theo ›", "Next part ›"), "nav-card next"))

    # Nút xem: tìm đúng tiêu đề tiếng Việt trên kênh YouTube; chưa tới ngày ra mắt thì bai-viet.js đổi thành link kênh (data-ngay)
    yt = YT_ID.get(so)
    tim = yt_url(yt) if yt else kenh["youtube"] + "/search?query=" + quote(next(y["tieu_de"] for y in video_phu_vi(s["id"]) if y["so"] == so), safe="")
    gan = f'data-so="{so}" data-ngay="{x.get("ra_mat", "")}" data-kenh="{esc(kenh["youtube"])}"'
    nut = f'<a class="btn btn-yt" {gan} href="{esc(tim)}" target="_blank" rel="noopener">{ic(p, "play")}{t("Xem video", "Watch video")}</a>'
    xem = "".join(nut_nen_tang(k, p, "nt nt-sm") for k in ("youtube", "tiktok", "facebook", "instagram") if kenh.get(k))
    ghi_chu = t("", '<span class="lang-note">Video in Vietnamese</span>')
    band = (f'<nav class="crumbs" aria-label="{t("Đường dẫn", "Breadcrumb")}"><a href="{q}">{t("Trang chủ", "Home")}</a> › <a href="{q}#{g["id"]}">{esc(g["ten"])}</a> › '
            f'<a href="{q}bai/{ten_file(cha)}.html">#{nhan_so(cha["so"])}</a> › <span>#{so}</span></nav>\n'
            f'<p class="eyebrow">Video #{so} · {esc(s["ten"])} · {phan}{nhan_ngay(x.get("ra_mat"))}</p>\n'
            f'<h1>{esc(x["tieu_de"])}</h1>\n<p class="lead">{esc(x["mo_ta"])}</p>\n<div class="cta">{nut}{ghi_chu}</div>')
    than, ds_muc = muc_luc(muc)
    ket = t(f'Đây là bài viết từ video <b>{esc(x["tieu_de"])}</b> của kênh Mark học AI. Xem video để thấy phần minh họa bằng hình động.',
            f'This article is based on the video <b>{esc(x["tieu_de"])}</b> from the Mark học AI channel. Watch the video (in Vietnamese) to see the animations.')
    dau = (trinh_phat(yt, esc(x["tieu_de"])) if yt else "") + f'<p class="post-xem"><span>{t("Xem video trên", "Watch on")}</span>{xem}</p>\n'
    khoi_choi = xem_choi(so, q, p, trinh_phat(yt, esc(x["tieu_de"])) if yt else "")
    if khoi_choi and yt:
        dau = dau.replace(trinh_phat(yt, esc(x["tieu_de"])), "", 1)
    main = (f'<main class="doc doc-bai">\n<div class="doc-chinh">\n<article class="post">\n{dau}' + than +
            f'\n<div class="post-end">\n<p>{ket}</p>\n<div class="cta">{nut}</div>\n{khoi_chia_se(BASE + GOC + goc, x["tieu_de"], p)}</div>\n</article>\n</div>\n'
            + cot_ben(ds_muc, so, q, p, nut) + '</main>\n' + khoi_choi + '<div class="doc doc-cuoi">\n'
            f'<nav class="series-nav" aria-label="{t("Trong series", "In this series")}">\n<p class="series-nav-head">Series <b>{esc(s["ten"])}</b> · {phan}</p>\n'
            f'<div class="nav-cards">{"".join(nav)}</div>\n</nav>\n'
            f'<aside class="next-steps">\n<a class="next-step" href="{q}kiem-tra.html"><b>{t("Bạn hiểu AI tới đâu?", "How well do you know AI?")}</b><span>{t("Nhiều bộ câu hỏi, đạt 80% nhận giấy chứng nhận.", "Several quizzes, score 80% for a certificate.")}</span></a>\n'
            f'<a class="next-step" href="{q}#bat-dau"><b>{t("Mới đến kênh?", "New to the channel?")}</b><span>{t("Bản đồ 7 vùng và lộ trình cho người mới.", "A 7-region map and a path for beginners.")}</span></a>\n</aside>\n</div>')
    url = BASE + GOC + goc
    ngay = x.get("ra_mat")
    og = anh_chia_se_bai(goc, x["tieu_de"], s["ten"] + " · " + phan, so, ngay, None, s["ten"])
    jsonld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": x["tieu_de"][:110], "description": meta, "inLanguage": LG,
         "url": url, "mainEntityOfPage": url, "image": [BASE + og], **({"datePublished": ngay_da_ra(ngay)} if ngay_da_ra(ngay) else {}), "author": TO_CHUC, "publisher": TO_CHUC,
         "isPartOf": {"@type": "CreativeWorkSeries", "name": s["ten"]}},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Mark học AI", "item": BASE + GOC},
            {"@type": "ListItem", "position": 2, "name": g["ten"], "item": BASE + GOC + "#" + g["id"]},
            {"@type": "ListItem", "position": 3, "name": seo[str(cha["so"])], "item": BASE + GOC + f"bai/{ten_file(cha)}.html"},
            {"@type": "ListItem", "position": 4, "name": x["tieu_de"], "item": url}]},
    ]
    return GOC + goc, trang(goc, f'{x["tieu_de"]} | {SITE}', meta or x["mo_ta"], band, main, p, jsonld=jsonld, q=q,
                            cuoi=f'<script src="{p}bai-viet.js?v=dev" defer></script>\n', anh=og, co_anh=(1200, 630), ngay=ngay_da_ra(ngay))

def video_phu_vi(sid):
    return next(s["tap"] for s in video_phu if s["id"] == sid)

def cac_bai_phu():
    return [(s, x) for s in phu for x in s["tap"]]

# ---------- từ điển ----------
def tao_tu_dien():
    # Thẻ ảnh theo chủ đề (Sang chọn mockup A 20/10): ô Hỏi Bit ở đầu, thẻ "Từ hôm nay", mỗi chủ đề một hàng thẻ vuốt ngang.
    # Ảnh thẻ = bìa series của video chính. Hỏi Bit (hoi-bit.js) chạy ngay trên trang này; hoi-bit.html chỉ còn chuyển hướng về đây.
    p = t("", "../")  # về thư mục gốc; trang nằm cạnh index của ngôn ngữ nên link bài viết vẫn là "bai/..."
    ds = sorted(tu_dien, key=lambda x: norm(x["thuat_ngu"]))
    def bia(x):
        b = SERIES_BIA.get(nhom_cua[x["video"][0]]["id"], {}).get("bia")
        return p + b if b else p + "assets/og.png"
    def xem(x):
        so = x["video"][0]
        return yt_url(YT_ID[str(so)]) if str(so) in YT_ID else f'bai/{ten_file(co_bai[so])}.html'
    def anh(x, lazy=True):
        # Thẻ có nhân vật phụ: hình nhân vật trên nền màu, kèm tên; còn lại là bìa series
        tai = ' loading="lazy" decoding="async"' if lazy else ""
        if x.get("nhan_vat"):
            nv = TD_NHAN_VAT[x["nhan_vat"]]
            return (f'<span class="tdai-nv tdai-nv-{x["nhan_vat"]}"><img src="{p}assets/nhan-vat/{x["nhan_vat"]}.svg" alt="" width="200" height="240"{tai}>'
                    f'<span class="tdai-nv-ten">{esc(t(nv["ten"], nv["en"]))}</span></span>')
        return f'<img src="{bia(x)}" alt="" width="480" height="270"{tai}>'
    def the(x):
        chinh = co_bai[x["video"][0]]
        return (f'<li class="tdai-the" id="{x["id"]}" data-xem="{esc(xem(x))}">\n<a href="bai/{ten_file(chinh)}.html">'
                f'{anh(x)}\n<span class="tdai-chu">'
                f'<b class="tdai-ten">{esc(x["thuat_ngu"])}</b>' + (f'<span class="tdai-vi">{esc(x["tieng_viet"])}</span>' if x.get("tieng_viet") else "") +
                f'<span class="tdai-nghia">{esc(x["giai_thich"])}</span><span class="tdai-so">{t("Video", "Video")} #{chinh["so"]:02d} ›</span></span></a>\n</li>')
    khoi = []
    for cd in TD_CHU_DE:
        ts = sorted((x for x in ds if x.get("chu_de") == cd["id"]), key=lambda x: (x["video"][0], norm(x["thuat_ngu"])))
        if not ts:
            continue
        ten = t(cd["ten"], cd["en"])
        khoi.append(f'<section class="tdai-ke" id="cd-{cd["id"]}" aria-labelledby="h-{cd["id"]}">\n<div class="tdai-ke-dau"><h2 id="h-{cd["id"]}">{esc(ten)} '
                    f'<span>{len(ts)} {t("chữ", "terms")}</span></h2><button type="button" class="tdai-het" aria-expanded="false" aria-controls="ds-{cd["id"]}">{t("Xem hết", "See all")}</button></div>\n'
                    f'<ul class="tdai-hang" id="ds-{cd["id"]}">\n' + "\n".join(the(x) for x in ts) + "\n</ul>\n</section>")
    n = len(ds)
    x0 = ds[0]
    desc = t(f"Giải thích {n} thuật ngữ AI bằng tiếng Việt dễ hiểu, xếp theo {len(khoi)} chủ đề: token, embedding, prompt, RAG, MCP, deepfake… Mỗi chữ một thẻ, kèm video. Hỏi Bit bất cứ chữ nào.",
             f"{n} AI terms explained in plain English, grouped into {len(khoi)} topics: token, embedding, prompt, RAG, MCP, deepfake… One card per term, with a video. Ask Bit about any word.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{n} {t("thuật ngữ", "terms")} · {len(khoi)} {t("chủ đề", "topics")}</p>\n<h1>{t("Từ điển AI", "AI glossary")}</h1>\n'
            f'<p class="lead">{t("Gặp chữ lạ trên báo hay trong app AI? Mỗi chữ một thẻ giải thích bằng tiếng Việt đời thường, kèm video để hiểu kỹ hơn.", "Saw a strange word in the news or in an AI app? Each term gets one card in everyday words, plus a video (in Vietnamese) if you want to go deeper.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-chao.svg" alt="{t("Mark vẫy tay chào", "Mark waving hello")}" width="180" height="170"></div>')
    goi_y = t(["Deepfake là gì?", "Vì sao AI bịa mà vẫn tự tin?", "Token là gì?", "Có nên dán mật khẩu vào chatbot?"],
              ["What is a deepfake?", "Why does AI make things up?", "What is a token?", "Should I paste passwords into a chatbot?"])
    hoi = (f'<section class="tdai-hoi" id="hoi-bit" aria-labelledby="h-hoi">\n<div class="tdai-hoi-dau"><img src="{p}assets/bit-giai-thich.svg" alt="" width="56" height="56">'
           f'<div><h2 id="h-hoi">{t("Hỏi Bit", "Ask Bit")}</h2><p>{t("Gõ chữ lạ hoặc cả câu hỏi, Bit chỉ đúng đoạn video giải thích.", "Type a word or a whole question, and Bit points to the exact part of a video that explains it.")}</p></div></div>\n'
           f'<form class="hb-form" id="hb-form" role="search"><label class="sr" for="hb-q">{t("Câu hỏi của bạn", "Your question")}</label>'
           f'<input id="hb-q" type="search" name="q" placeholder="{t("Ví dụ: token là gì?", "e.g. what is a token?")}" autocomplete="off" enterkeyhint="search">'
           f'<button class="btn btn-yt" type="submit">{t("Hỏi", "Ask")}</button></form>\n'
           f'<div class="hb-goi-y">' + "".join(f'<button type="button">{esc(g)}</button>' for g in goi_y) + '</div>\n'
           f'<div class="hb-kq" id="hb-kq" aria-live="polite"></div>\n</section>')
    hom_nay = (f'<section class="tdai-nay" aria-labelledby="tdai-nay-ten">\n<div class="tdai-nay-anh" id="tdai-nay-anh">{anh(x0, lazy=False)}</div>\n<div class="tdai-nay-chu">'
               f'<p class="tdai-nhan">{t("Từ hôm nay", "Word of the day")}<span id="tdai-nay-ngay"></span></p>'
               f'<h2 id="tdai-nay-ten">{esc(x0["thuat_ngu"])}</h2><p class="tdai-vi" id="tdai-nay-vi">{esc(x0.get("tieng_viet", ""))}</p>'
               f'<p id="tdai-nay-nghia">{esc(x0["giai_thich"])}</p>\n<div class="cta"><a class="btn btn-yt" id="tdai-nay-xem" href="{esc(xem(x0))}">{t("Xem video", "Watch video")} #{x0["video"][0]:02d}</a>'
               f'<a class="btn" id="tdai-nay-doc" href="bai/{ten_file(co_bai[x0["video"][0]])}.html">{t("Đọc bài", "Read the article")}</a></div>\n</div>\n</section>')
    main = (f'<main class="dict tdai">\n<link rel="stylesheet" href="{p}assets/tu-dien.css?v=dev">\n{hoi}\n{hom_nay}\n' + "\n".join(khoi) +
            f'\n<aside class="pdf-card">\n<div><b>{t("Tải 50 prompt mẫu (PDF)", "50 prompt templates (PDF, in Vietnamese)")}</b><span>{t("Prompt viết sẵn cho việc hằng ngày, điền chỗ trống là dùng được.", "Ready-made prompts for everyday tasks: fill in the blanks and use them. The PDF is in Vietnamese.")}</span></div>\n'
            f'<a class="btn btn-yt" href="{p}{PDF}" download>{t("Tải 50 prompt mẫu (PDF)", "Download the PDF")}</a>\n</aside>\n</main>')
    js = f"""<script src="{p}hoi-bit.js?v=dev" defer></script>
<script>
(function () {{
  // Từ hôm nay: mỗi ngày một thẻ, theo ngày giờ máy người xem, ai vào cùng ngày cũng thấy cùng chữ
  var the = document.querySelectorAll(".tdai-the"), now = new Date();
  if (the.length) {{
    var ngay = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 864e5);
    var c = the[(ngay * 37) % the.length], $ = function (id) {{ return document.getElementById(id); }};
    var vi = c.querySelector(".tdai-vi"), so = c.querySelector(".tdai-so").textContent.match(/#\\d+/)[0];
    $("tdai-nay-anh").innerHTML = c.querySelector("a").firstElementChild.outerHTML.replace(' loading="lazy"', "");
    $("tdai-nay-ten").textContent = c.querySelector(".tdai-ten").textContent;
    $("tdai-nay-vi").textContent = vi ? vi.textContent : "";
    $("tdai-nay-nghia").textContent = c.querySelector(".tdai-nghia").textContent;
    $("tdai-nay-xem").textContent = {t('"Xem video "', '"Watch video "')} + so;
    $("tdai-nay-xem").href = c.getAttribute("data-xem");
    $("tdai-nay-doc").href = c.querySelector("a").getAttribute("href");
    $("tdai-nay-ngay").textContent = " · " + now.getDate() + "/" + (now.getMonth() + 1);
  }}
  // Xem hết: hàng vuốt ngang mở thành lưới
  document.querySelectorAll(".tdai-het").forEach(function (b) {{
    var ke = b.closest(".tdai-ke"), mo = {t('"Xem hết"', '"See all"')}, gon = {t('"Thu gọn"', '"Show less"')};
    b.addEventListener("click", function () {{
      var m = !ke.classList.contains("mo");
      ke.classList.toggle("mo", m);
      b.setAttribute("aria-expanded", m);
      b.textContent = m ? gon : mo;
      if (!m) ke.scrollIntoView({{ block: "nearest" }});
    }});
  }});
}})();
</script>
"""
    url = BASE + GOC + "tu-dien.html"
    jsonld = [{"@context": "https://schema.org", "@type": "DefinedTermSet", "name": t("Từ điển AI", "AI glossary"), "url": url, "inLanguage": LG,
               "description": desc, "publisher": TO_CHUC,
               "hasDefinedTerm": [{"@type": "DefinedTerm", "@id": url + "#" + x["id"], "name": x["thuat_ngu"],
                                   **({"alternateName": x["tieng_viet"]} if x.get("tieng_viet") else {}), "description": x["giai_thich"],
                                   "url": url + "#" + x["id"]} for x in ds]}]
    return GOC + "tu-dien.html", trang("tu-dien.html", t(f"Từ điển AI: {n} thuật ngữ AI giải thích bằng tiếng Việt | {SITE}", f"AI glossary: {n} AI terms explained in plain English | {SITE}"),
                                       desc, band, main, p, hien_tai="tu-dien", og_type="website", jsonld=jsonld, cuoi=js, q="")

# ---------- bài kiểm tra ----------
# Nhiều bộ câu hỏi (data/bo-kiem-tra.json, bản dịch data/en/bo-kiem-tra.json): bộ cơ bản theo chủ đề và một bộ cho mỗi ngành.
# Câu "dung-sai" (đúng hay sai) hoặc "chon" (4 lựa chọn, dap_an là vị trí đáp án). Chấm, xáo câu, lưu điểm cao nhất và mở khóa chứng nhận: kiem-tra.js, chung-nhan.js.
NHANH_KT = json.loads((R / "data" / "lo-trinh-nganh.json").read_text(encoding="utf-8"))["nhanh"]

def video_kt(n):
    """Link cho một video trong câu hỏi: bài viết nếu có, video nhánh (303 trở đi) thì trỏ về lộ trình ngành."""
    if n in co_bai:
        return {"so": n, "url": f"bai/{ten_file(co_bai[n])}.html", "ten": seo[str(n)]}
    vn = json.loads((R / "data" / "video-nhanh.json").read_text(encoding="utf-8"))
    vn_en = json.loads((R / "data" / "en" / "video-nhanh.json").read_text(encoding="utf-8")) if LG == "en" else {}
    nh = next(k for k, x in NHANH_KT.items() if x["tu"] <= n <= x["den"])
    ten = re.sub(r"^.*?· (?:Phần|Part) \d+/\d+:\s*", "", vn_en.get(str(n)) or vn[str(n)]["ten"])
    return {"so": n, "url": f"lo-trinh-nganh.html?ai={nh}", "ten": ten}

def dap_an_kt(c):
    return c["lua_chon"][c["dap_an"]] if c["loai"] == "chon" else (t("Đúng", "True") if c["dung"] else t("Sai", "False"))

def tao_kiem_tra():
    p = t("", "../")
    bo = kiem_tra["bo"]
    so_cau = sum(len(b["cau_hoi"]) for b in bo)
    du_lieu = json.dumps({"url": BASE + GOC + "kiem-tra.html", "dat": kiem_tra["dat"],
                          "bo": [{**{k: b[k] for k in ("id", "ten", "mo_ta", "nhom") if k in b},
                                  **({"nhanh": b["nhanh"], "nhan": NHANH_KT[b["nhanh"]]["nhan"], "mau": NHANH_KT[b["nhanh"]]["mau"]} if b.get("nhanh") else {}),
                                  "cau_hoi": [{**c, "video": [video_kt(n) for n in c["video"]]} for c in b["cau_hoi"]]} for b in bo],
                          "goi_y_gioi": [video_kt(n) for n in (97, 99)]},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t(f"{len(bo)} bộ câu hỏi kiểm tra kiến thức AI ({so_cau} câu): hiểu lầm về AI, viết prompt, dùng AI an toàn, AI trong công việc và 8 ngành dữ liệu, công nghệ. Có giải thích ngay, đạt 80% nhận giấy chứng nhận có tên bạn.",
             f"{len(bo)} AI quizzes ({so_cau} questions): AI misconceptions, prompting, staying safe, AI at work and 8 data and tech fields. Explanations right away, and score 80% to get a certificate with your name.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t(f"{len(bo)} bộ câu hỏi · đạt 80% nhận giấy chứng nhận", f"{len(bo)} quizzes · score 80% for a certificate")}</p>\n<h1>{t("Bạn hiểu AI tới đâu?", "How well do you know AI?")}</h1>\n'
            f'<p class="lead">{t("Chọn một bộ câu hỏi, trả lời từng câu và xem giải thích ngay. Câu hỏi đổi thứ tự mỗi lần làm. Đạt từ 80% là mở khóa giấy chứng nhận có tên bạn.", "Pick a quiz, answer each question and see the explanation right away. The order changes every time. Score 80% or more to unlock a certificate with your name.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="{t("Mark đang thắc mắc", "Mark wondering")}" width="180" height="170"></div>')

    def the(b):
        nh = NHANH_KT.get(b.get("nhanh", ""))
        tag = (f'<span class="ltn-tag" style="--a:{nh["mau"][0]};--b:{nh["mau"][1]}' + (f';--c:{nh["chu"]}' if nh.get("chu") else "") + f'">{esc(nh["nhan"])}</span>') if nh else ""
        return (f'<li><a class="kt-the" href="?bo={b["id"]}" data-bo="{b["id"]}"><b>{tag}{esc(b["ten"])}</b><span>{esc(b["mo_ta"])}</span>'
                f'<small class="kt-the-chan"><span>{t(f"{len(b["cau_hoi"])} câu", f"{len(b["cau_hoi"])} questions")}</span><span class="kt-diem" data-diem="{b["id"]}"></span></small></a></li>')
    nhom = "".join(f'<h3 class="kt-nhom">{esc(n["ten"])}</h3><ul class="kt-ds">' + "".join(the(b) for b in bo if b["nhom"] == n["id"]) + "</ul>" for n in kiem_tra["nhom"])
    dau = bo[0]
    static = "\n".join(f'<li><p><b>{esc(c["cau"])}</b></p><p>{esc(dap_an_kt(c))}. {esc(c["giai_thich"])}</p></li>' for c in dau["cau_hoi"])
    main = f"""<main class="quiz-wrap">
<section class="kt-bo" id="kt-bo" aria-labelledby="kt-bo-h">
  <div class="kt-bo-dau"><h2 id="kt-bo-h">{t("Chọn bộ câu hỏi", "Pick a quiz")}</h2><span class="kt-bo-nut"><a class="btn" href="phieu-luu.html">{t("Chơi game Mark phiêu lưu", "Play Mark's Adventure")}</a><a class="btn" href="chung-nhan.html">{ic(p, "award")}{t("Giấy chứng nhận của bạn", "Your certificates")}</a></span></div>
  {nhom}
  <noscript><p>{t(f"Trang này cần JavaScript để chấm điểm. Đáp án bộ “{esc(dau['ten'])}”:", f"This page needs JavaScript to score your answers. Answers to “{esc(dau['ten'])}”:")}</p><ol class="quiz-static">{static}</ol></noscript>
</section>
<section class="quiz" id="quiz" aria-live="polite" hidden>
  <p class="kt-ten-bo"><b id="kt-ten-bo"></b><button type="button" class="kt-doi" id="kt-doi">{t("Đổi bộ khác", "Pick another quiz")}</button></p>
  <div class="kt-dinh"><div class="quiz-top"><b id="tien-do"></b><span class="quiz-score" id="diem-tam"></span></div>
  <div class="kt-chang" id="kt-chang" aria-hidden="true"></div></div>
  <div id="khung"></div>
</section>
</main>"""
    js = f'<script type="application/json" id="du-lieu">{du_lieu}</script>\n<script src="{p}chung-nhan.js?v=dev" defer></script>\n<script src="{p}kiem-tra.js?v=dev" defer></script>\n'
    jsonld = [{"@context": "https://schema.org", "@type": "Quiz", "name": b["ten"], "url": BASE + GOC + "kiem-tra.html?bo=" + b["id"], "inLanguage": LG,
               "description": b["mo_ta"], "publisher": TO_CHUC, "educationalLevel": "beginner",
               "hasPart": [{"@type": "Question", "eduQuestionType": "True/False" if c["loai"] == "dung-sai" else "Multiple choice", "text": c["cau"],
                            **({"suggestedAnswer": [{"@type": "Answer", "text": x} for i, x in enumerate(c["lua_chon"]) if i != c["dap_an"]]} if c["loai"] == "chon" else {}),
                            "acceptedAnswer": {"@type": "Answer", "text": dap_an_kt(c) + ". " + c["giai_thich"]}} for c in b["cau_hoi"]]} for b in bo]
    return GOC + "kiem-tra.html", trang("kiem-tra.html", t(f"Bạn hiểu AI tới đâu? {len(bo)} bộ câu hỏi kiểm tra AI, có giấy chứng nhận | {SITE}", f"How well do you know AI? {len(bo)} AI quizzes with certificates | {SITE}"),
                                        desc, band, main, p, hien_tai="kiem-tra", og_type="website", jsonld=jsonld, cuoi=js, q="")

# ---------- ebook (sach.html) ----------
def tao_sach():
    p = t("", "../")
    S = json.loads((R / "data" / "sach.json").read_text(encoding="utf-8"))
    ten_en = json.loads((R / "data" / "en" / "sach.json").read_text(encoding="utf-8"))["chuong"] if LG == "en" else None
    pdf = p + S["pdf"]
    mb = (f'{S["dung_luong_mb"]:.1f}'.replace(".", ",") if LG == "vi" else f'{S["dung_luong_mb"]:.1f}') + " MB"
    so_muc = sum(len(c["muc"]) for c in S["chuong"])
    nut_tai = (f'<a class="btn btn-yt" href="{pdf}" download="mark-hoc-ai-ebook.pdf" type="application/pdf">{ic(p, "download")}'
               f'{t("Tải sách miễn phí", "Download the free ebook")} <small class="btn-sub">PDF · {mb}</small></a>')
    desc = t(f"Tải miễn phí ebook Mark học AI: {S['so_trang']} trang PDF, 20 chương giải thích AI bằng tiếng Việt dễ hiểu, từ prompt, ảo giác, an toàn số tới dùng AI trong việc thật. Không cần đăng ký.",
             f"Download the free Mark học AI ebook: a {S['so_trang']}-page PDF with 20 chapters explaining AI in plain words, from prompts and hallucinations to online safety and AI at work. Written in Vietnamese. No sign-up.")
    band = (f'<div class="head-row book-head"><div>\n<p class="eyebrow">{t(f"Ebook miễn phí · PDF · {S["so_trang"]} trang", f"Free ebook · PDF · {S["so_trang"]} pages")}</p>\n'
            f'<h1>{t("Sách Mark học AI: hiểu AI dễ như trò chuyện", "The Mark học AI book: understand AI as easily as chatting")}</h1>\n'
            f'<p class="lead">{t(f"Cả kênh gom lại thành một cuốn sách: 20 chương, {so_muc} mục, viết cho người không rành kỹ thuật. Đọc trên điện thoại, máy tính hay in ra đều được.", f"The whole channel in one book: 20 chapters and {so_muc} sections, written for people who are not tech experts. Read it on your phone, your computer, or print it.")}</p>\n'
            + t("", '<p class="lead book-lang"><b>Note:</b> the book is written in Vietnamese. The English articles on this site cover the same ideas, video by video.</p>\n')
            + f'<div class="cta">{nut_tai}<a class="btn" href="#muc-luc">{t("Xem mục lục", "See the chapters")}</a></div>\n'
            f'<p class="book-free">{ic(p, "check")}{t("Không cần đăng ký, không cần email. Bấm là tải.", "No sign-up, no email. Just click and download.")}</p>\n'
            f'</div><picture class="book-cover"><source srcset="{p}assets/sach/bia.webp" type="image/webp">'
            f'<img src="{p}assets/sach/bia.jpg" alt="{t("Bìa sách Mark học AI: Mark vẫy tay chào cùng robot Bit", "Cover of the Mark học AI book: Mark waving hello with Bit the robot")}" width="560" height="794"></picture></div>')
    diem = [("book-open", t("20 chương, đi từ dễ tới khó", "20 chapters, from easy to advanced"),
             t("Bắt đầu từ AI là gì, rồi prompt, bên trong bộ não AI, agent, an toàn số, tới AI trong nghề và đời sống.", "From what AI is, to prompts, the inside of an AI brain, agents, online safety, and AI at work and at home.")),
            ("sparkles", t("Khung \"Gõ cho AI\" và \"Thử ngay\"", "\"Type this to AI\" and \"Try it now\" boxes"),
             t("Mỗi chương có prompt mẫu chép là dùng được, và một việc nhỏ để làm liền.", "Each chapter has sample prompts you can copy, and a small task to do right away.")),
            ("clapperboard", t("Mỗi mục ghi số video", "Every section lists its video"),
             t(f"Đọc chỗ nào chưa rõ thì mở đúng video đó xem lại. Cả sách gom {S['so_video']} video của kênh.", f"Not clear? Open that exact video. The book collects {S['so_video']} of the channel's videos (in Vietnamese).")),
            ("lightbulb", t("Mark hỏi, Bit giải thích", "Mark asks, Bit explains"),
             t("Giọng văn như trò chuyện, thuật ngữ giữ tiếng Anh, cuối sách có bảng thuật ngữ để tra.", "A chatty style, AI terms kept in English, and a glossary at the end."))]
    the_diem = "".join(f'<li class="feat"><span class="feat-ic">{ic(p, i)}</span><div><h3>{esc(a)}</h3><p>{esc(b)}</p></div></li>' for i, a, b in diem)
    if LG == "en":
        chuong = "".join(f'<li class="chap chap-flat"><span class="chap-no">{c["so"]}</span><span class="chap-name">{esc(ten_en[i])}</span>'
                         f'<span class="chap-meta">p. {c["trang"]} · {len(c["muc"])} sections</span></li>' for i, c in enumerate(S["chuong"]))
    else:
        chuong = "".join(f'<li class="chap"><details><summary><span class="chap-no">{c["so"]}</span><span class="chap-name">{esc(c["ten"])}</span>'
                         f'<span class="chap-meta">trang {c["trang"]} · {len(c["muc"])} mục</span></summary>'
                         f'<ul class="chap-items">' + "".join(f"<li>{esc(m)}</li>" for m in c["muc"]) + "</ul></details></li>" for c in S["chuong"])
    cuoi_sach = t(f'Phần cuối: {esc(S["phan_cuoi"])}.', "At the end: a glossary of AI terms and a list of all the videos.")
    main = f"""<main class="book">
<section class="book-sec" aria-labelledby="co-gi">
<h2 id="co-gi">{t("Trong sách có gì?", "What's inside?")}</h2>
<ul class="feats">{the_diem}</ul>
</section>
<section class="book-sec" aria-labelledby="xem-truoc">
<h2 id="xem-truoc">{t("Xem trước vài trang", "A peek inside")}</h2>
<div class="peek">
<figure><img src="{p}assets/sach/trang-mo-chuong.webp" alt="{t("Hai trang mở đầu chương 19, Sáng tạo với AI: Mark hỏi, kèm khung Gõ cho AI", "Two pages opening chapter 19, Getting creative with AI, with Mark's question and a prompt box")}" width="1200" height="847" loading="lazy"><figcaption>{t("Mở đầu một chương: Mark đặt câu hỏi, sách trả lời bằng lời dễ hiểu.", "A chapter opening: Mark asks, the book answers in plain words.")}</figcaption></figure>
<figure><img src="{p}assets/sach/trang-trong.webp" alt="{t("Hai trang bên trong sách với lời nhắc của Bit và khung Thử ngay", "Two inside pages with a tip from Bit and a Try it now box")}" width="1200" height="847" loading="lazy"><figcaption>{t("Trang bên trong: lời nhắc của Bit và khung \"Thử ngay\".", "Inside pages: a tip from Bit and a \"Try it now\" box.")}</figcaption></figure>
</div>
</section>
<section class="book-sec" id="muc-luc" aria-labelledby="muc-luc-h">
<h2 id="muc-luc-h">{t("Mục lục 20 chương", "The 20 chapters")}</h2>
<p class="book-sub">{t("Bấm vào một chương để xem các mục bên trong.", "Chapter titles translated from Vietnamese.")}</p>
<ol class="chaps">{chuong}</ol>
<p class="book-sub">{cuoi_sach}</p>
</section>
<aside class="pdf-card book-end">
<div><b>{t("Tải về, đọc lúc nào cũng được", "Download it and read anytime")}</b><span>{t(f"PDF {S['so_trang']} trang khổ {S['kho']}, {mb}. Miễn phí, cứ chia sẻ cho người thân và bạn bè.", f"{S['so_trang']}-page {S['kho']} PDF, {mb}, in Vietnamese. Free to share with family and friends.")}</span></div>
{nut_tai}
</aside>
<aside class="next-steps">
<a class="next-step" href="lo-trinh-7-ngay.html"><b>{t("Lộ trình 7 ngày", "The 7-day path")}</b><span>{t("Mỗi ngày 3 video và 1 câu hỏi, xong nhận giấy chứng nhận.", "3 videos and 1 question a day, with a certificate at the end.")}</span></a>
<a class="next-step" href="tu-dien.html"><b>{t("Từ điển AI", "AI glossary")}</b><span>{t("Tra nhanh token, RAG, MCP… mỗi chữ một dòng tiếng Việt.", "Look up token, RAG, MCP… one plain line per term.")}</span></a>
</aside>
</main>"""
    jsonld = [{"@context": "https://schema.org", "@type": "Book", "name": "Mark học AI", "inLanguage": "vi", "bookFormat": "https://schema.org/EBook",
               "numberOfPages": S["so_trang"], "isAccessibleForFree": True, "url": BASE + GOC + "sach.html", "image": BASE + "assets/sach/bia.jpg",
               "description": desc, "author": TO_CHUC, "publisher": TO_CHUC}]
    return GOC + "sach.html", trang("sach.html", t(f"Tải sách Mark học AI miễn phí (PDF {S['so_trang']} trang) | {SITE}", f"Free Mark học AI ebook (PDF, {S['so_trang']} pages) | {SITE}"),
                                    desc, band, main, p, hien_tai="sach", og_type="website", jsonld=jsonld, q="")

# ---------- lộ trình 7 ngày (lo-trinh-7-ngay.html) ----------
# Ô "Thử ngay" mỗi ngày: trò chơi gắn với 3 video của ngày (data/tro-choi) + một trạm hợp ngày đó ở mỗi trang thực hành
# (trường "lo_trinh" của trạm trong data/thuc-hanh/*.json, data/ai-y-te.json "nang_cao" và "tram_lien_ket").
_TH_NHOM = [x for x in [("ai-hoc-sinh", "🎒", ("Học sinh", "Students")), ("ai-van-phong", "🏛️", ("Công chức", "Civil servants")), ("ai-y-te", "🏥", ("Y tế", "Healthcare")),
                        ("ai-giao-vien", "🍎", ("Giáo viên", "Teachers")), ("ai-gia-dinh", "🏡", ("Gia đình", "Families")), ("ai-ban-hang", "🛍️", ("Bán hàng", "Sellers"))]
            if x[0] == "ai-y-te" or (R / "data" / "thuc-hanh" / f"{x[0]}.json").exists()]
_TRANG_TH = {f + ".html" for f, _, _ in _TH_NHOM}

def _tram_theo_trang(ten):
    """[(id, ten {vi,en}, ngay, nang_cao)] của một trang thực hành."""
    if ten == "ai-y-te":
        y = load("ai-y-te")
        co_ban = [(k, v["ten"], v.get("lo_trinh"), False) for k, v in y.get("tram_lien_ket", {}).items() if isinstance(v, dict) and "ten" in v]
        return co_ban + [(x["id"], x["ten"], x.get("lo_trinh"), True) for x in y.get("nang_cao", [])]
    d = json.loads((R / "data" / "thuc-hanh" / f"{ten}.json").read_text(encoding="utf-8"))
    return [(x["id"], x["ten"], x.get("lo_trinh"), x.get("cap") == "nang-cao") for x in d["tram"]]

def thu_ngay(d, i):
    L = 1 if LG == "en" else 0
    chip, da, chinh = [], set(), ""
    if d.get("tro_choi"):
        # Trò chơi chính của ngày: thẻ lớn có hình xem trước; lo-trinh.js đánh dấu "Đã chơi" khi trang đó đã mở (tien-do.js)
        g = json.loads((R / "data" / "tro-choi" / f'{d["tro_choi"]}.json').read_text(encoding="utf-8"))
        url = d.get("tro_choi_url") or (g["url"].split("?")[0] if "{so}" in g["url"] else g["url"])
        da.add(url)
        chinh = (f'<a class="day-game" href="{esc(url)}" data-mo="{esc(url.split("?")[0])}">{hinh_choi(g.get("hinh", ""))}'
                 f'<span class="day-game-t"><b>{esc(g["ten"]["en" if L else "vi"])}</b><span>{esc(g["moi"]["en" if L else "vi"])}</span></span>'
                 f'<span class="day-game-nut">{t("Chơi ngay", "Play now")} ›</span><span class="day-game-xong" hidden>✓ {t("Đã chơi", "Played")}</span></a>')
    for s in d["video"]:
        for url, ten, _moi, _hinh in TUONG_TAC.get(str(s), []):
            if url.split("?")[0] in _TRANG_TH or url in da:
                continue
            da.add(url)
            chip.append(f'<a class="day-thu-c" href="{esc(url)}"><span aria-hidden="true">🧩</span>{esc(ten[L])}</a>')
    for f, bt, nhom in _TH_NHOM:
        ds = sorted((x for x in _tram_theo_trang(f) if x[2] == i), key=lambda x: x[3])
        if ds:
            id_, ten, _n, _nc = ds[0]
            chip.append(f'<a class="day-thu-c" href="{f}.html#{id_}"><span aria-hidden="true">{bt}</span>{esc(ten["en"] if L else ten["vi"])}<small>{nhom[L]}</small></a>')
    if not chip and not chinh:
        return ""
    if not chinh:
        return (f'<div class="day-thu"><p class="try-label">{t("Thử ngay · 5 phút", "Try it now · 5 minutes")}</p>'
                f'<div class="day-thu-ds">{"".join(chip)}</div></div>')
    them = (f'<details class="day-thu-them"><summary>{t(f"Thêm {len(chip)} trò để thử, có bài theo nghề", f"{len(chip)} more to try, including job practice") if len(chip) > 2 else t(f"Thêm {len(chip)} trò để thử", f"{len(chip)} more to try")}</summary>'
            f'<div class="day-thu-ds">{"".join(chip)}</div></details>') if chip else ""
    return (f'<div class="day-thu"><p class="try-label">{t("Trò chơi hôm nay · 5 phút", "Today’s game · 5 minutes")}</p>{chinh}{them}</div>')

def tao_lo_trinh():
    p = t("", "../")
    goc_vi = json.loads((R / "data" / "lo-trinh-7-ngay.json").read_text(encoding="utf-8"))["ngay"]
    ngay = goc_vi
    if LG == "en":
        en = json.loads((R / "data" / "en" / "lo-trinh-7-ngay.json").read_text(encoding="utf-8"))["ngay"]
        ngay = [{**a, **b, "cau_hoi": {**a["cau_hoi"], **b["cau_hoi"]}} for a, b in zip(goc_vi, en)]
    so_video = sum(len(d["video"]) for d in ngay)
    desc = t(f"Khóa học AI miễn phí 7 ngày cho người mới: mỗi ngày 3 video ngắn, 1 việc thực hành 10 phút và 1 câu hỏi. Hoàn thành cả 7 ngày để nhận giấy chứng nhận Mark học AI cơ bản.",
             f"A free 7-day AI course for beginners: each day has 3 short videos, a 10-minute task and 1 question. Finish all 7 days to get your Mark học AI basics certificate.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("7 ngày · mỗi ngày khoảng 15 phút · miễn phí", "7 days · about 15 minutes a day · free")}</p>\n'
            f'<h1>{t("Lộ trình 7 ngày: Mark học AI cơ bản", "The 7-day path: Mark học AI basics")}</h1>\n'
            f'<p class="lead">{t(f"Mỗi ngày 3 video ngắn, 1 việc làm thử 10 phút và 1 câu hỏi nhỏ. Xong cả 7 ngày, bạn tự in giấy chứng nhận có tên mình.", f"Each day: 3 short videos, a 10-minute task and 1 small question. Finish all 7 days and make a certificate with your name on it.")}</p>\n'
            + t("", '<p class="lead book-lang">The videos are in Vietnamese; each one links to a full English article.</p>\n')
            + f'<div class="cta"><a class="btn btn-yt" href="#ngay-1" id="nut-bat-dau">{t("Bắt đầu ngày 1", "Start day 1")} ›</a><a class="btn" href="#chung-nhan">{ic(p, "award")}{t("Giấy chứng nhận", "Certificate")}</a></div>\n'
            f'</div><img class="head-art" src="{p}assets/mark-chao.svg" alt="{t("Mark vẫy tay chào", "Mark waving hello")}" width="180" height="170"></div>')
    the = []
    for i, d in enumerate(ngay, 1):
        vids = "".join(
            f'<li data-so="{n}"><a href="bai/{ten_file(co_bai[n])}.html"><span class="num">#{n:02d}</span><span class="dv-t">{esc(tach_tieu_de(co_bai[n])[0])}</span></a></li>'
            for n in d["video"])
        q = d["cau_hoi"]
        opts = "".join(f'<button type="button" class="day-opt" data-i="{j}"><span class="opt-k">{"ABCD"[j]}</span><span>{esc(o)}</span></button>'
                       for j, o in enumerate(q["lua_chon"]))
        the.append(f'''<li class="day" id="ngay-{i}" data-ngay="{i}">
<div class="day-head"><span class="day-num">{t("Ngày", "Day")}<b>{i}</b></span><div class="day-title"><h2>{esc(d["ten"])}</h2><p class="day-goal">{esc(d["muc_tieu"])}</p></div><span class="day-tag" hidden>{ic(p, "check")}{t("Đã xong", "Done")}</span></div>
<div class="day-body">
<div class="day-col">
<h3 class="day-h">{t("3 video hôm nay", "Today's 3 videos")}</h3>
<ol class="day-videos">{vids}</ol>
{thu_ngay(d, i)}
<div class="day-task"><p class="try-label">{t("Việc 10 phút", "10-minute task")}</p><p>{esc(d["viec"])}</p></div>
</div>
<div class="day-quiz" data-dung="{q["dung"]}">
<h3 class="day-h">{t("Câu hỏi của ngày", "Question of the day")}</h3>
<p class="day-q" id="cau-{i}">{esc(q["cau"])}</p>
<div class="day-opts" role="group" aria-labelledby="cau-{i}">{opts}</div>
<div class="day-fb" role="status" aria-live="polite"></div>
<p class="day-why" hidden>{esc(q["giai_thich"])}</p>
<div class="day-act"><button type="button" class="btn btn-yt day-xong" disabled>{ic(p, "check")}{t(f"Đánh dấu xong ngày {i}", f"Mark day {i} done")}</button><button type="button" class="day-lai" hidden>{t("Học lại ngày này", "Redo this day")}</button></div>
</div>
</div>
</li>''')
    url = BASE + GOC + "lo-trinh-7-ngay.html"
    du_lieu = json.dumps({"url": url, "so_video": so_video, "so_ngay": len(ngay), "goc": p}, ensure_ascii=False).replace("</", "<\\/")
    main = f"""<main class="course">
<link rel="stylesheet" href="{p}assets/lo-trinh-tiep.css?v=dev">
<section class="course-bar" aria-label="{t("Tiến độ", "Progress")}">
<div class="course-bar-top"><b id="tien-do">{t(f"Đã xong 0/{len(ngay)} ngày", f"0/{len(ngay)} days done")}</b><span><a href="ho-so.html">{t("Hồ sơ học · Ôn hôm nay", "Profile · Today's review")} ›</a> · <a href="#chung-nhan">{t("Giấy chứng nhận", "Certificate")} ›</a></span></div>
<div class="bar" aria-hidden="true"><i id="thanh"></i></div>
<p class="course-note">{t("Tiến độ lưu ngay trên trình duyệt này, không cần tài khoản. Học theo thứ tự nào cũng được, nhưng đi từ ngày 1 là dễ nhất.", "Your progress is saved in this browser, no account needed. Any order works, but day 1 first is easiest.")}</p>
<noscript><p class="course-note">{t("Bật JavaScript để chấm câu hỏi, lưu tiến độ và tạo giấy chứng nhận. Các video vẫn xem được bình thường.", "Turn on JavaScript to check answers, save progress and make the certificate. The videos still work without it.")}</p></noscript>
</section>
<ol class="days">
{chr(10).join(the)}
</ol>
<section class="cert" id="chung-nhan" aria-labelledby="cn-h">
<div class="cert-head"><img src="{p}assets/mark-a-ra-the.svg" alt="" width="130" height="123" loading="lazy"><div>
<p class="eyebrow">{t("Phần thưởng cuối lộ trình", "Your reward")}</p>
<h2 id="cn-h">{t("Giấy chứng nhận", "Certificate")}</h2>
<p id="cn-khoa">{t(f"Hoàn thành đủ {len(ngay)} ngày để mở khóa giấy chứng nhận có tên bạn.", f"Finish all {len(ngay)} days to unlock a certificate with your name.")}</p>
</div></div>
<div class="cert-form" id="cn-form" hidden>
<label for="ten-hv">{t("Tên của bạn (in trên giấy chứng nhận)", "Your name (printed on the certificate)")}</label>
<div class="cert-row"><input id="ten-hv" type="text" maxlength="40" autocomplete="name" placeholder="{t("Ví dụ: Nguyễn Thị Lan", "e.g. Alex Nguyen")}"><button type="button" class="btn btn-yt" id="tao-cn">{ic(p, "award")}{t("Tạo giấy chứng nhận", "Make my certificate")}</button></div>
<p class="cert-err" id="cn-loi" role="alert"></p>
<figure class="cert-preview" id="cn-xem" hidden><img id="cn-anh" alt="" width="1600" height="1131"></figure>
<div class="q-actions" id="cn-nut" hidden><a class="btn btn-yt" id="tai-cn" href="#" download="{t("chung-nhan-mark-hoc-ai.png", "mark-hoc-ai-certificate.png")}">{ic(p, "download")}{t("Tải ảnh PNG", "Download PNG")}</a><button type="button" class="btn" id="chia-se">{ic(p, "share-2")}{t("Chia sẻ", "Share")}</button></div>
<p class="cert-cheer" id="cn-loi-khen" hidden>{t("Giỏi lắm! 7 ngày, 21 video, 7 việc làm thật. Đăng ảnh lên và rủ một người bạn cùng học tuần này nhé, học có bạn thì nhớ lâu hơn.", "Well done! 7 days, 21 videos, 7 real tasks. Post your certificate and invite a friend to start this week. Learning with a friend makes it stick.")}</p>
<p class="share-msg" id="bao" role="status"></p>
</div>
<figure class="cert-mau" id="cn-mau"><canvas id="cn-mau-canvas" width="1600" height="1131" role="img" aria-label="{t("Giấy chứng nhận mẫu", "Sample certificate")}"></canvas>
<figcaption id="cn-mau-chu" aria-live="polite">{t("Bản mẫu: xong cả 7 ngày là có tên bạn.", "Sample: finish all 7 days and it shows your name.")}</figcaption></figure>
<canvas id="cn-canvas" width="1600" height="1131" hidden></canvas>
</section>
<aside class="next-steps">
<a class="next-step" href="lo-trinh-4-tuan.html"><b>{t("Đi tiếp: lộ trình 4 tuần", "Next: the 4-week path")}</b><span>{t("Tuần 2 thực hành theo nghề, tuần 3 nâng cao, tuần 4 ôn trộn và chứng nhận.", "Week 2 practice for your job, week 3 advanced, week 4 mixed review and a certificate.")}</span></a>
<a class="next-step" href="lo-trinh-nganh.html"><b>{t("Lộ trình theo nghề", "Path for your job")}</b><span>{t("Chọn nghề của bạn, nhận danh sách video theo thứ tự.", "Pick your job and get its videos in order.")}</span></a>
<a class="next-step" href="thuc-hanh.html"><b>{t("Góc thực hành", "Practice corner")}</b><span>{t("Mọi trò chơi và trạm thực hành ở một chỗ, có dấu ✓ cho phần đã làm.", "Every game and practice station in one place, with ✓ for what you have done.")}</span></a>
<a class="next-step" href="sach.html"><b>{t("Sách miễn phí", "Free ebook")}</b><span>{t("Cả kênh gom thành một cuốn PDF, đọc lại lúc nào cũng được.", "The whole channel in one PDF (in Vietnamese).")}</span></a>
</aside>
</main>"""
    js = f'<script type="application/json" id="du-lieu">{du_lieu}</script>\n<script src="{p}lo-trinh-tiep.js?v=dev" defer></script>\n<script src="{p}lo-trinh.js?v=dev" defer></script>\n'
    jsonld = [{"@context": "https://schema.org", "@type": "Course", "name": t("Lộ trình 7 ngày: Mark học AI cơ bản", "The 7-day path: Mark học AI basics"), "url": url, "inLanguage": LG,
               "description": desc, "provider": TO_CHUC, "isAccessibleForFree": True, "educationalLevel": "beginner",
               "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "courseWorkload": "PT15M"},
               "offers": {"@type": "Offer", "price": 0, "priceCurrency": "VND", "category": "Free"}}]
    return GOC + "lo-trinh-7-ngay.html", trang("lo-trinh-7-ngay.html", t(f"Lộ trình 7 ngày học AI cho người mới, có giấy chứng nhận | {SITE}", f"7-day AI course for beginners, with a certificate | {SITE}"),
                                                desc, band, main, p, hien_tai="lo-trinh", og_type="website", jsonld=jsonld, cuoi=js, q="")

# ---------- hợp tác (hop-tac.html) ----------
def tao_hop_tac():
    p = t("", "../")
    so_video = len(thu_tu)
    so_series = len([g for g in nhom if not g.get("le")])
    so_tu = len(tu_dien)
    S = json.loads((R / "data" / "sach.json").read_text(encoding="utf-8"))
    email = kenh.get("email", "")
    tieu_de_mail = quote(t("Hợp tác với Mark học AI", "Partnership with Mark học AI"))
    nut_mail = (f'<a class="btn btn-yt" href="mailto:{esc(email)}?subject={tieu_de_mail}">{ic(p, "mail")}{esc(email)}</a>' if email else "")
    desc = t(f"Media kit kênh Mark học AI: video giải thích AI bằng tiếng Việt cho người không chuyên trên YouTube, TikTok, Facebook, Instagram, Threads. Định dạng, nền tảng, hình thức hợp tác và liên hệ.",
             f"Media kit for Mark học AI: Vietnamese AI explainer videos for non-experts on YouTube, TikTok, Facebook, Instagram and Threads. Formats, platforms, partnership options and contact.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Media kit · dành cho nhãn hàng và đối tác", "Media kit · for brands and partners")}</p>\n'
            f'<h1>{t("Hợp tác cùng Mark học AI", "Work with Mark học AI")}</h1>\n'
            f'<p class="lead">{t("Kênh giải thích AI bằng tiếng Việt cho người không chuyên. Nếu sản phẩm của bạn giúp người Việt dùng AI tốt hơn, an toàn hơn, mình cùng làm một nội dung thật sự hữu ích cho người xem.", "A channel that explains AI in Vietnamese for non-experts. If your product helps Vietnamese people use AI better and more safely, let us make something genuinely useful for viewers together.")}</p>\n'
            f'<div class="cta">{nut_mail}<a class="btn" href="#hinh-thuc">{t("Các hình thức hợp tác", "Ways to work together")}</a>'
            f'<button type="button" class="btn" data-in-trang>{ic(p, "download")}{t("Lưu media kit (PDF)", "Save media kit (PDF)")}</button></div>\n'
            f'</div><img class="head-art" src="{p}assets/mark-va-bit.svg" alt="{t("Mark và robot Bit", "Mark and Bit the robot")}" width="200" height="189"></div>')
    doi_tuong = [("briefcase", t("Dân văn phòng", "Office workers"), t("Email, Excel, báo cáo, họp hành: muốn AI làm nhanh hơn mà không sai.", "Email, spreadsheets, reports, meetings: they want AI to speed things up without mistakes.")),
                 ("graduation-cap", t("Giáo viên, học sinh, sinh viên", "Teachers and students"), t("Soạn bài, ôn thi, học ngoại ngữ, dùng AI mà không đạo văn.", "Lesson plans, exam prep, languages, using AI without plagiarism.")),
                 ("wrench", t("Chủ tiệm, người bán hàng online", "Shop owners and online sellers"), t("Mô tả sản phẩm, trả lời khách, livestream, sổ sách.", "Product descriptions, customer replies, livestreams, bookkeeping.")),
                 ("users", t("Phụ huynh và gia đình", "Parents and families"), t("Con dùng AI làm bài tập, ông bà tránh lừa đảo giả giọng.", "Kids using AI for homework, grandparents avoiding voice-clone scams."))]
    the_dt = "".join(f'<li class="feat"><span class="feat-ic">{ic(p, i)}</span><div><h3>{esc(a)}</h3><p>{esc(b)}</p></div></li>' for i, a, b in doi_tuong)
    so = [(f"{so_video}+", t("video giải thích AI, mỗi ngày thêm video mới", "AI explainer videos, with new ones every day")),
          (f"{so_series}+", t("series theo chủ đề, đánh số Phần X/N", "themed series, numbered Part X/N")),
          (f"{so_tu}+", t("thuật ngữ trong Từ điển AI trên web", "terms in the website's AI glossary")),
          (f"{S['so_trang']}+", t("trang ebook miễn phí, 20 chương", "pages in the free ebook, 20 chapters"))]
    # Số người theo dõi và lượt xem: data/so-lieu-kenh.json, cập nhật mỗi tháng từ Metricool
    K = json.loads((R / "data" / "so-lieu-kenh.json").read_text(encoding="utf-8"))
    def tron(n):
        # làm tròn xuống như app.js (soGon) để trang chủ và trang Hợp tác ghi cùng một số
        if n >= 10000: return f"{n // 1000}K+"
        if n >= 1000: return f"{n // 100 / 10:g}K+".replace(".", t(",", "."))
        return f"{n // 50 * 50 if n >= 100 else n}+"
    def so_gon(n):  # số nhỏ trên thẻ nền tảng: 463, 1,3K, 24K
        if n >= 10000: return f"{n // 1000}K"
        if n >= 1000: return f"{n // 100 / 10:g}K".replace(".", t(",", "."))
        return str(n)
    NT = K.get("nen_tang", {})
    KG = K.get("khan_gia")
    so = [(tron(K["nguoi_theo_doi"]), t(f"người theo dõi trên {K['so_nen_tang']} nền tảng", f"followers across {K['so_nen_tang']} platforms")),
          (tron(K["luot_xem"]), t("lượt xem video từ ngày ra mắt 6/10/2026", "video views since launch on 6 Oct 2026"))] + so
    nam, thang, _ = K["cap_nhat"].split("-")
    the_so = "".join(f'<li class="stat"><b>{a}</b><span>{esc(b)}</span></li>' for a, b in so)
    khoi_khan_gia = ""
    if KG:
        pt = lambda x: f"{round(x * 100)}%"
        ten_kg = NEN_TANG.get(KG.get("nen_tang", ""), "")
        khoi_khan_gia = (f'<div class="kg"><h3>{t("Khán giả", "Audience")} <span>{esc(t(f"theo số liệu {ten_kg}", f"from {ten_kg} data"))}</span></h3><div class="kg-hang">'
            f'<div class="kg-the"><b>{pt(KG["viet_nam"])}</b><span>{t("ở Việt Nam", "in Vietnam")}</span><span class="kg-thanh" aria-hidden="true"><i style="width:{pt(KG["viet_nam"])}"></i></span></div>'
            f'<div class="kg-the"><b>{pt(KG["nam"])} · {pt(KG["nu"])}</b><span>{t("nam · nữ", "men · women")}</span><span class="kg-thanh kg-hai" aria-hidden="true"><i style="width:{pt(KG["nam"])}"></i><i style="width:{pt(KG["nu"])}"></i></span></div>'
            f'</div></div>')
    dinh_dang = [("smartphone", t("Video dọc ngắn (9:16)", "Short vertical video (9:16)"), "TikTok · YouTube Shorts · Facebook Reels · Instagram Reels",
                  t("Khoảng một phút, một ý, có phụ đề tiếng Việt. Mark hỏi, Bit giải thích bằng hình động, cuối video là một việc làm thử ngay.", "About a minute, one idea, Vietnamese subtitles. Mark asks, Bit explains with animation, and each video ends with something to try.")),
                 ("monitor", t("Video YouTube dạng dài (16:9)", "Long-form YouTube video (16:9)"), "YouTube",
                  t("Bản ngang để đi sâu một chủ đề hoặc gom cả series, cho người xem trên máy tính và TV.", "Horizontal version to go deeper on a topic or tie a whole series together, for viewers on computers and TVs.")),
                 ("images", t("Carousel ảnh", "Image carousels"), "Instagram · Facebook",
                  t("Bộ 7 slide tóm tắt một video: lưu lại để xem sau, dễ chia sẻ.", "A 7-slide summary of a video: easy to save and share.")),
                 ("message-circle", t("Bài Threads hằng ngày", "Daily Threads posts"), "Threads",
                  t("Bài ngắn mỗi ngày kèm ảnh thẻ prompt mẫu, chép là dùng được.", "A short daily post with a sample-prompt card people can copy.")),
                 ("file-text", t("Bài viết trên web", "Website articles"), "markhocai.com",
                  t("Mỗi video có một bài viết tiếng Việt và tiếng Anh, có Từ điển AI và bài kiểm tra, để Google tìm thấy lâu dài.", "Every video has an article in Vietnamese and English, plus a glossary and a quiz, so it stays findable on Google."))]
    the_dd = "".join(f'<li class="fmt"><span class="feat-ic">{ic(p, i)}</span><div><h3>{esc(a)}</h3><p class="fmt-where">{esc(b)}</p><p>{esc(c)}</p></div></li>' for i, a, b, c in dinh_dang)
    nen_tang = [(k, t("Discord (cộng đồng)", "Discord (community)") if k == "discord" else ten) for k, ten in NEN_TANG.items() if kenh.get(k)]
    # Thẻ nền tảng có số liệu: icon + tên + @tên kênh một dòng, 2 ô số, thanh so sánh số theo dõi; nhiều người theo dõi nhất lên đầu.
    # Nền tảng không có số (Discord) và trang web đi riêng một hàng nút nhỏ bên dưới.
    co_so = sorted([x for x in nen_tang if NT.get(x[0])], key=lambda x: -NT[x[0]]["theo_doi"])
    khac = [x for x in nen_tang if not NT.get(x[0])]
    max_td = max([NT[k]["theo_doi"] for k, _ in co_so] or [1])
    def ten_kenh(k):
        return "@" + re.sub(r"^@", "", kenh[k].rstrip("/").rsplit("/", 1)[-1])
    def icon_nt(k):
        return f'<span class="nt nt-{k}" aria-hidden="true"><svg><use href="{p}assets/nen-tang.svg#nt-{k}"/></svg></span>'
    the_nt = "".join(
        f'<li><a class="ntk" href="{esc(kenh[k])}" target="_blank" rel="noopener">'
        f'<span class="ntk-dau">{icon_nt(k)}<span class="ntk-ten"><b>{esc(ten)}</b><span>{esc(ten_kenh(k))}</span></span></span>'
        f'<span class="ntk-so"><span><b>{so_gon(NT[k]["theo_doi"])}</b>{t("theo dõi", "followers")}</span><span><b>{so_gon(NT[k]["luot_xem"])}</b>{t("lượt xem", "views")}</span></span>'
        f'<span class="ntk-thanh" aria-hidden="true"><i style="width:{max(4, round(NT[k]["theo_doi"] * 100 / max_td))}%"></i></span></a></li>'
        for k, ten in co_so)
    the_lk = "".join(f'<li><a class="ntl" href="{esc(kenh[k])}" target="_blank" rel="noopener">{icon_nt(k)}<b>{esc(NEN_TANG[k])}</b></a></li>' for k, ten in khac)
    the_lk += f'<li><a class="ntl" href="{BASE}"><img src="{p}assets/logo-trong-suot.svg" alt="" width="28" height="28" loading="lazy"><b>markhocai.com</b></a></li>'
    hinh_thuc = [(t("Video giải thích có tài trợ", "Sponsored explainer"),
                  t("Kênh giải thích một khái niệm AI mà sản phẩm của bạn giải quyết, rồi dùng sản phẩm làm ví dụ thật. Người xem học được điều mới, dù có dùng sản phẩm hay không.", "We explain an AI concept your product deals with, then use your product as a real example. Viewers learn something new whether or not they use it.")),
                 (t("Review công cụ", "Tool review"),
                  t("Mark dùng thử thật trong việc hằng ngày, nói cả điểm mạnh lẫn điểm còn yếu và ai nên hoặc không nên dùng. Nhãn hàng góp ý thông tin cho đúng, kênh giữ quyền kết luận.", "Mark actually uses the tool in everyday tasks and covers strengths, weaknesses, and who should or should not use it. You can correct facts; the channel keeps the final verdict.")),
                 (t("Gói nhiều định dạng", "Multi-format package"),
                  t("Một chủ đề, nhiều nơi: video dọc, bản ngang YouTube, carousel, bài Threads và bài viết trên web.", "One topic, many places: vertical video, a YouTube version, a carousel, a Threads post and a website article."))]
    the_ht = "".join(f'<li class="way"><span class="way-no">{i}</span><h3>{esc(a)}</h3><p>{esc(b)}</p></li>' for i, (a, b) in enumerate(hinh_thuc, 1))
    nguyen_tac = [t("Chỉ nhận sản phẩm kênh đã dùng thử và thấy có ích thật cho người xem.", "We only take on products we have tried and find genuinely useful for viewers."),
                  t("Ghi rõ \"Có tài trợ\" hoặc \"Hợp tác quảng cáo\" ngay trong video và ở dòng đầu mô tả.", "\"Sponsored\" or \"Paid partnership\" is stated clearly in the video and at the top of the description."),
                  t("Video không tài trợ có nhắc tới sản phẩm thì ghi rõ kênh không liên kết hay được tài trợ bởi hãng đó.", "Unsponsored videos that mention a product say clearly that the channel is not affiliated with or sponsored by that company."),
                  t("Không dùng chữ \"đối tác chính thức\", không đặt logo hãng cạnh logo kênh kiểu đồng thương hiệu, không sửa logo của hãng.", "No \"official partner\" wording, no co-branded logo lockups, and no altering a brand's logo."),
                  t("Không nhận nội dung hứa hẹn quá sự thật, đầu tư, vay tiền, cờ bạc hay bất cứ thứ gì có thể hại người xem.", "No exaggerated claims, investment, lending, gambling, or anything that could harm viewers."),
                  # Sang chọn 18/10/2026: giữ review có tài trợ nhưng siết luật để giữ độ tin của kênh dạy dùng AI an toàn
                  t("Không nhận tiền để xếp hạng, so sánh hay chọn \"công cụ AI tốt nhất\". Bài so sánh của kênh luôn là bài không tài trợ.", "We never take money to rank, compare or pick \"the best AI tool\". Our comparisons are always unsponsored."),
                  t("Không nhận tài trợ cho video về an toàn, lừa đảo và quyền riêng tư; kênh chỉ nhận tài trợ cho series an toàn số từ đơn vị không bán công cụ AI (ví dụ ngân hàng, nhà mạng).", "No sponsorship on videos about safety, scams or privacy; safety series may be sponsored only by organisations that don't sell AI tools (e.g. banks, telecoms)."),
                  t("Review có tài trợ luôn nêu ít nhất một điểm yếu và người không nên dùng, và nhãn hàng không được xem trước kết luận.", "Every sponsored review names at least one weakness and who should not use the tool, and the brand never previews the verdict.")]
    the_nt2 = "".join(f'<li>{ic(p, "shield-check")}<span>{esc(x)}</span></li>' for x in nguyen_tac)
    main = f"""<main class="kit">
<section class="book-sec" aria-labelledby="cho-ai">
<h2 id="cho-ai">{t("Kênh dành cho ai?", "Who is the channel for?")}</h2>
<p class="book-sub">{t("Người Việt không làm kỹ thuật nhưng muốn dùng AI cho việc thật. Mỗi video một ý, lời dễ hiểu, thuật ngữ giữ tiếng Anh để người xem nhận ra khi gặp lại.", "Vietnamese people who don't work in tech but want to use AI for real tasks. One idea per video, plain words, AI terms kept in English so viewers recognize them later.")}</p>
<ul class="feats">{the_dt}</ul>
</section>
<section class="book-sec" aria-labelledby="con-so">
<h2 id="con-so">{t("Nội dung bằng con số", "Content in numbers")}</h2>
<ul class="stats-grid">{the_so}</ul>
{khoi_khan_gia}
<p class="kit-note">{ic(p, "mail")}<span>{t(f"Số liệu cập nhật mỗi tháng, lần gần nhất tháng {int(thang)}/{nam}. Tỉ lệ tương tác và số liệu theo từng video: kênh gửi bản mới nhất khi bạn liên hệ.", f"Figures are updated monthly, last in {['January','February','March','April','May','June','July','August','September','October','November','December'][int(thang)-1]} {nam}. Engagement rates and per-video figures: we send the latest when you get in touch.")}</span></p>
</section>
<section class="book-sec" aria-labelledby="dinh-dang">
<h2 id="dinh-dang">{t("Định dạng nội dung", "Formats")}</h2>
<ul class="fmts">{the_dd}</ul>
</section>
<section class="book-sec" aria-labelledby="nen-tang">
<h2 id="nen-tang">{t("Nền tảng", "Platforms")}</h2>
<ul class="ntk-ds">{the_nt}</ul>
<ul class="ntl-ds">{the_lk}</ul>
</section>
<section class="book-sec" id="hinh-thuc" aria-labelledby="hinh-thuc-h">
<h2 id="hinh-thuc-h">{t("Các hình thức hợp tác", "Ways to work together")}</h2>
<ol class="ways">{the_ht}</ol>
<div class="rules">
<h3>{t("Nguyên tắc của kênh", "Our ground rules")}</h3>
<p>{t("Người xem tin kênh vì kênh nói thật. Mọi hợp tác đều theo mấy điều này:", "Viewers trust the channel because it tells the truth. Every partnership follows these rules:")}</p>
<ul>{the_nt2}</ul>
</div>
</section>
<aside class="pdf-card kit-contact">
<div><b>{t("Liên hệ hợp tác", "Get in touch")}</b><span>{t("Gửi kèm tên sản phẩm, mục tiêu, thời gian dự kiến và ngân sách (nếu có). Kênh trả lời trong vài ngày làm việc.", "Include your product, goals, timing and budget (if any). We reply within a few working days.")}</span></div>
{nut_mail}
</aside>
</main>"""
    return GOC + "hop-tac.html", trang("hop-tac.html", t(f"Hợp tác và tài trợ: media kit kênh Mark học AI | {SITE}", f"Partnerships and sponsorship: Mark học AI media kit | {SITE}"),
                                       desc, band, main, p, hien_tai="hop-tac", og_type="website", q="",
                                       cuoi='<script>document.querySelectorAll("[data-in-trang]").forEach(function(b){b.addEventListener("click",function(){window.print()})})</script>\n')

# ---------- dịch vụ làm video (dich-vu.html): nhận làm video giải thích cho trung tâm, shop, công ty ----------
def tao_dich_vu():
    p = t("", "../")
    email = kenh.get("email", "")
    mess = "https://m.me/markhocai"
    tieu_de_mail = quote(t("Đặt làm video giải thích", "Explainer video request"))
    nut_mess = f'<a class="btn btn-yt" href="{mess}" target="_blank" rel="noopener">{ic(p, "message-circle")}{t("Nhắn Messenger", "Message us on Messenger")}</a>'
    nut_mail = (f'<a class="btn" href="mailto:{esc(email)}?subject={tieu_de_mail}">{ic(p, "mail")}{esc(email)}</a>' if email else "")
    desc = t("Mark học AI nhận làm video giải thích ngắn cho trung tâm dạy học, shop và công ty nhỏ: kịch bản, hình minh họa động, giọng đọc, phụ đề, bản dọc 9:16 và ngang 16:9. Xem video mẫu và bảng giá.",
             "Mark học AI makes short explainer videos for schools, shops and small businesses: script, animation, voiceover, subtitles, vertical 9:16 and horizontal 16:9. See samples and prices.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Dịch vụ · cho trung tâm, shop và công ty nhỏ", "Services · for schools, shops and small businesses")}</p>\n'
            f'<h1>{t("Làm video giải thích cho bạn", "Explainer videos made for you")}</h1>\n'
            f'<p class="lead">{t("Cùng cách làm các video của kênh: bạn gửi nội dung, mình viết kịch bản, vẽ hình động, lồng giọng và phụ đề. Video khoảng một phút, dễ hiểu, đăng được ngay lên TikTok, Reels, Shorts và Facebook.", "Made the same way as the channel videos: you send the content, we write the script, animate it, add voiceover and subtitles. About a minute long, easy to follow, ready for TikTok, Reels, Shorts and Facebook.")}</p>\n'
            f'<div class="cta">{nut_mess}<a class="btn" href="#bang-gia">{t("Xem bảng giá", "See prices")}</a></div>\n'
            f'</div><img class="head-art" src="{p}assets/mark-va-bit.svg" alt="{t("Mark và robot Bit", "Mark and Bit the robot")}" width="200" height="189"></div>')
    mau = [("dv-a-hien-tai-hoan-thanh", t("Trung tâm tiếng Anh", "English school"), t("Thì hiện tại hoàn thành trong 60 giây", "The present perfect in 60 seconds"),
            t("Gói Cơ bản: dùng nhân vật Mark và Bit, cuối video có chỗ cho logo trung tâm.", "Basic plan: uses Mark and Bit, with space for the school's logo at the end.")),
           ("dv-b-binh-giu-nhiet", t("Shop gia dụng", "Homeware shop"), t("Vì sao bình giữ nhiệt giữ nóng 12 tiếng?", "Why does a vacuum flask stay hot for 12 hours?"),
            t("Gói Tiêu chuẩn: màu và logo theo thương hiệu (\"Nhà Mát\" là tên giả lập để làm mẫu).", "Standard plan: brand colors and logo (\"Nhà Mát\" is a made-up brand for this sample).")),
           ("dv-c-cao-rang", t("Phòng khám nha khoa", "Dental clinic"), t("Vì sao đánh răng mỗi ngày vẫn có cao răng?", "Why do you still get tartar if you brush every day?"),
            t("Gói Tiêu chuẩn: màu xanh ngọc của phòng khám (\"Nha khoa Nụ Cười\" là tên giả lập).", "Standard plan: the clinic's teal colors (\"Nha khoa Nụ Cười\" is a made-up name).")),
           ("dv-d-cold-brew", t("Quán cà phê", "Coffee shop"), t("Cold brew khác cà phê đá ở chỗ nào?", "How is cold brew different from iced coffee?"),
            t("Gói Tiêu chuẩn: màu nâu cam của quán (\"Cà phê Gác Nhỏ\" là tên giả lập).", "Standard plan: the café's warm brown colors (\"Cà phê Gác Nhỏ\" is a made-up name)."))]
    the_mau = "".join(f'<li class="dv-mau"><video controls playsinline preload="none" poster="{p}assets/dich-vu/{f}.jpg" width="540" height="960">'
                      f'<source src="{p}assets/dich-vu/{f}.mp4" type="video/mp4"></video>'
                      f'<p class="fmt-where">{esc(a)}</p><h3>{esc(b)}</h3><p>{esc(c)}</p></li>' for f, a, b, c in mau)
    goi = [(t("Cơ bản", "Basic"), "300.000đ", t("mỗi video", "per video"), False,
            [t("Video khoảng 60 giây, khổ dọc 9:16", "About 60 seconds, vertical 9:16"), t("Nhân vật Mark và Bit có sẵn", "Ready-made Mark and Bit characters"),
             t("Giọng đọc và phụ đề tiếng Việt", "Vietnamese voiceover and subtitles"), t("Sửa 1 lần", "1 round of edits")]),
           (t("Tiêu chuẩn", "Standard"), "500.000đ – 700.000đ", t("mỗi video", "per video"), True,
            [t("Màu sắc và logo theo thương hiệu của bạn", "Your brand colors and logo"), t("Cả bản dọc 9:16 và ngang 16:9", "Both vertical 9:16 and horizontal 16:9"),
             t("Phụ đề hai ngôn ngữ Việt và Anh", "Bilingual Vietnamese and English subtitles"), t("Sửa 2 lần", "2 rounds of edits")]),
           (t("Gói 10 video", "10-video pack"), "4 – 5 triệu đ", t("cho cả bộ", "for the set"), False,
            [t("Rẻ hơn khoảng 30% so với mua lẻ", "About 30% cheaper than buying one by one"), t("Hợp với trung tâm cần cả một bộ bài", "Great for schools that need a whole lesson series"),
             t("Cùng một phong cách cho cả bộ", "One consistent style across the set"), t("Lịch giao theo tuần", "Weekly delivery schedule")])]
    the_goi = "".join(f'<li class="dv-goi{" dv-goi-chinh" if chinh else ""}">' + (f'<span class="dv-nhan">{t("Phổ biến", "Popular")}</span>' if chinh else "")
                      + f'<h3>{esc(ten)}</h3><p class="dv-gia"><b>{esc(gia)}</b> <span>{esc(don_vi)}</span></p><ul>'
                      + "".join(f'<li>{ic(p, "check")}<span>{esc(x)}</span></li>' for x in y) + '</ul></li>' for ten, gia, don_vi, chinh, y in goi)
    buoc = [(t("Bạn gửi nội dung", "You send the content"), t("Chủ đề, ý chính, hình sản phẩm hoặc logo. Chưa rõ thì nhắn mình để cùng chọn chủ đề.", "Topic, key points, product photos or logo. Not sure yet? Message us and we will pick a topic together.")),
            (t("Mình gửi kịch bản", "We send the script"), t("Lời đọc và mô tả từng cảnh. Bạn duyệt xong mình mới làm video.", "Narration and a scene-by-scene outline. We only start the video once you approve it.")),
            (t("Dựng video", "We make the video"), t("Hình động, giọng đọc, phụ đề, kiểm tra lời đọc từng chữ.", "Animation, voiceover, subtitles, and a word-by-word check of the narration.")),
            (t("Giao và sửa", "Delivery and edits"), t("Gửi file MP4 để bạn xem. Sửa theo số lần của gói, rồi bạn đăng ngay.", "We send the MP4 for review, edit within your plan's rounds, and you post it right away."))]
    the_buoc = "".join(f'<li class="way"><span class="way-no">{i}</span><h3>{esc(a)}</h3><p>{esc(b)}</p></li>' for i, (a, b) in enumerate(buoc, 1))
    luu_y = [t("3 khách hàng đầu tiên được giảm 50%, đổi lại cho kênh dùng video làm mẫu và viết vài dòng nhận xét.", "Our first 3 clients get 50% off in exchange for letting us show the video as a sample and a short review."),
             t("Giọng đọc được tạo bằng AI (ElevenLabs); video ghi rõ điều này khi nền tảng yêu cầu.", "The voiceover is AI-generated (ElevenLabs); videos are labeled as such where platforms require it."),
             t("Không nhận nội dung sai sự thật, hứa hẹn quá mức, cờ bạc, vay tiền hay gây hại cho người xem.", "We don't take on misleading claims, exaggerated promises, gambling, lending, or anything harmful to viewers.")]
    the_luu_y = "".join(f'<li>{ic(p, "shield-check")}<span>{esc(x)}</span></li>' for x in luu_y)
    # Chính sách sửa video và hoàn tiền (soát checklist.design 15/10): bản đầy đủ ở dieu-khoan.html#dich-vu
    chinh_sach = [t("Kịch bản được sửa đến khi bạn duyệt, không giới hạn số lần. Bạn duyệt kịch bản xong mình mới dựng video.", "You can revise the script as many times as you like. We only start the video once you approve it."),
                  t("Sau khi giao, video được sửa theo số lần của gói. Lỗi do phía mình (sai chữ, sai lời so với kịch bản đã duyệt) thì sửa miễn phí, không tính vào số lần.", "After delivery, edits follow your plan's rounds. Our own mistakes (typos, narration that differs from the approved script) are fixed free and don't count as a round."),
                  t("Muốn sửa thêm ngoài số lần của gói hoặc đổi nội dung đã duyệt, mình báo giá trước và chỉ làm khi bạn đồng ý.", "Extra rounds or changes to approved content are quoted first and only done if you agree."),
                  t("Hủy trước khi duyệt kịch bản: hoàn lại toàn bộ tiền đã trả. Hủy sau khi duyệt kịch bản, trước khi nhận video: hoàn 50%.", "Cancel before approving the script: full refund. Cancel after approving the script but before delivery: 50% refund."),
                  t("Video không đúng kịch bản đã duyệt và sửa hết số lần vẫn chưa đạt: hoàn 100%. Tiền hoàn chuyển khoản trong 7 ngày kể từ khi bạn báo.", "If the video doesn't match the approved script and still isn't right after all rounds: 100% refund. Refunds are sent by bank transfer within 7 days of your request.")]
    the_chinh_sach = "".join(f'<li>{ic(p, "check")}<span>{esc(x)}</span></li>' for x in chinh_sach)
    main = f"""<main class="kit">
<section class="book-sec" aria-labelledby="video-mau">
<h2 id="video-mau">{t("Video mẫu", "Samples")}</h2>
<p class="book-sub">{t("Bốn video cho bốn ngành khác nhau, làm theo đúng quy trình bên dưới. Bấm để xem có tiếng.", "Four videos for four different businesses, made with the process below. Tap to play with sound.")}</p>
<ul class="dv-maus">{the_mau}</ul>
</section>
<section class="book-sec" id="bang-gia" aria-labelledby="bang-gia-h">
<h2 id="bang-gia-h">{t("Bảng giá", "Prices")}</h2>
<ul class="dv-gois">{the_goi}</ul>
</section>
<section class="book-sec" aria-labelledby="quy-trinh">
<h2 id="quy-trinh">{t("Quy trình 4 bước", "How it works")}</h2>
<ol class="ways dv-buoc">{the_buoc}</ol>
<div class="rules">
<h3>{t("Lưu ý", "Good to know")}</h3>
<ul>{the_luu_y}</ul>
</div>
<div class="rules" id="sua-va-hoan-tien">
<h3>{t("Sửa video và hoàn tiền", "Edits and refunds")}</h3>
<ul>{the_chinh_sach}</ul>
<p class="rules-more">{t("Chi tiết trong", "Full details in our")} <a href="dieu-khoan.html#dich-vu">{t("Điều khoản sử dụng", "Terms of use")}</a>.</p>
</div>
</section>
<aside class="pdf-card kit-contact">
<div><b>{t("Đặt làm video", "Order a video")}</b><span>{t("Nhắn chủ đề bạn muốn làm, số lượng video và thời gian cần có. Mình trả lời trong ngày.", "Tell us your topic, how many videos and when you need them. We reply the same day.")}</span></div>
<div class="cta">{nut_mess}{nut_mail}</div>
</aside>
</main>"""
    return GOC + "dich-vu.html", trang("dich-vu.html", t(f"Dịch vụ làm video giải thích bằng AI | {SITE}", f"Explainer video service | {SITE}"),
                                       desc, band, main, p, hien_tai="dich-vu", og_type="website", q="")

# ---------- sản phẩm số: bộ bài giảng cho giáo viên (bo-giao-vien.html) và workshop 2 giờ (workshop.html) ----------
GIA_BO_GV = "99.000đ"
def _the_anh(p, thu_muc, ds):
    # thẻ có ảnh xem trước: (file ảnh, nhãn, tiêu đề, mô tả)
    return "".join(f'<li class="sp-the"><img src="{p}assets/san-pham/{thu_muc}/{f}" alt="" width="640" height="{c}" loading="lazy">'
                   f'<div><p class="fmt-where">{esc(a)}</p><h3>{esc(b)}</h3><p>{esc(m)}</p></div></li>' for f, c, a, b, m in ds)

def _the_so(ds):
    return "".join(f'<li class="stat"><b>{esc(a)}</b><span>{esc(b)}</span></li>' for a, b in ds)

def _nut_lien_he(p, chu_de_vi, chu_de_en):
    email = kenh.get("email", "")
    nut_mess = f'<a class="btn btn-yt" href="https://m.me/markhocai" target="_blank" rel="noopener">{ic(p, "message-circle")}{t("Nhắn Messenger", "Message us on Messenger")}</a>'
    nut_mail = (f'<a class="btn" href="mailto:{esc(email)}?subject={quote(t(chu_de_vi, chu_de_en))}">{ic(p, "mail")}{esc(email)}</a>' if email else "")
    return nut_mess, nut_mail

def _khoi_qr(p, noi_dung_ck):
    return (f'<div class="sp-qr"><img class="uh-qr" src="{p}assets/ung-ho/qr-vietcombank.jpg" alt="{t("Mã QR chuyển khoản Vietcombank, PHAN THANH SANG, số tài khoản 1021026372", "Vietcombank transfer QR code, PHAN THANH SANG, account 1021026372")}" width="600" height="1073" loading="lazy">'
            f'<p class="uh-stk">Vietcombank · PHAN THANH SANG · <b>1021026372</b></p>'
            f'<p class="sp-ck">{t("Nội dung chuyển khoản", "Transfer note")}: <b>{esc(noi_dung_ck)}</b></p></div>')

@trang_rieng("bo-giao-vien.html", "0.6")
def tao_bo_giao_vien():
    p = t("", "../")
    nut_mess, nut_mail = _nut_lien_he(p, "Mua bộ bài giảng Kiểm chứng thông tin với AI", "Buying the Fact-checking with AI lesson kit")
    desc = t(f"Bộ bài giảng 45 phút \"Kiểm chứng thông tin với AI\" cho giáo viên THCS, THPT: slide có ghi chú, phiếu bài tập, quiz 10 câu kèm đáp án, hướng dẫn tiết dạy và 5 video ngắn. Giá {GIA_BO_GV}, chuyển khoản QR, nhận file trong ngày.",
             f"A 45-minute \"Fact-checking with AI\" lesson kit for secondary teachers: slides with notes, worksheet, 10-question quiz with answers, lesson guide and 5 short videos. {GIA_BO_GV}, pay by QR transfer, files the same day. Materials are in Vietnamese.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Sản phẩm số · cho giáo viên", "Digital product · for teachers")}</p>\n'
            f'<h1>{t("Bộ bài giảng: Kiểm chứng thông tin với AI", "Lesson kit: Fact-checking with AI")}</h1>\n'
            f'<p class="lead">{t("Một tiết 45 phút soạn sẵn từ series 5 video của kênh. Học sinh tập nhận ra tin sức khỏe lan truyền, ảnh cũ gán chuyện mới, nguồn do AI bịa, biểu đồ gây hiểu lầm, rồi nhớ 3 bước kiểm tra trước khi chia sẻ.", "A ready-to-teach 45-minute lesson built from the channel's 5-video series. Students practice spotting viral health claims, old photos with new stories, AI-invented sources and misleading charts, then learn 3 steps to check before sharing.")}</p>\n'
            f'<div class="cta"><a class="btn btn-yt" href="#mua">{t("Mua bộ bài giảng", "Buy the kit")} · {GIA_BO_GV}</a><a class="btn" href="#trong-bo">{t("Xem trong bộ có gì", "See what's inside")}</a></div>\n'
            f'<p class="lead-note">🆓 {t("Dạy 12 tiết AI theo Khung của Bộ GD&ĐT?", "Teaching the 12 core AI lessons?")} <a href="bo-hoc-lieu-ai.html">{t("Xem bộ học liệu miễn phí", "See the free kit")} ›</a></p>\n'
            f'</div><img class="head-art sp-bia" src="{p}assets/san-pham/bo-giao-vien/bia.jpg" alt="{t("Bìa bộ bài giảng Kiểm chứng thông tin với AI", "Cover of the Fact-checking with AI lesson kit")}" width="600" height="450"></div>')
    so = [("45'", t("một tiết học trọn vẹn, có bảng thời gian", "one full lesson with a timeline")),
          ("16", t("slide trình chiếu kèm lời giảng", "slides with speaker notes")),
          ("10", t("câu quiz in được, có đáp án và giải thích", "printable quiz questions with answers")),
          ("5", t("video ngắn đi kèm để chiếu trên lớp", "short videos included to show in class"))]
    trong_bo = [("slide-1.jpg", 360, t("Slide trình chiếu", "Slides"), t("16 slide, chữ to, ít chữ", "16 slides, big type, little text"), t("Mỗi slide có ghi chú: thầy cô nói gì, mất mấy phút, hỏi lớp câu nào.", "Every slide has notes: what to say, how long, which question to ask the class.")),
                ("slide-2.jpg", 360, t("Hoạt động trên lớp", "Class activities"), t("\"Cả lớp thử\" sau mỗi phần", "\"Try it together\" after each part"), t("Ví dụ gần gũi để cả lớp cùng soi, kèm phiếu ra cửa (exit ticket) cuối giờ.", "Everyday examples to examine together, plus an exit ticket at the end.")),
                ("phieu.jpg", 905, t("Phiếu bài tập", "Worksheet"), t("2 trang A4 cho học sinh", "2 A4 pages for students"), t("Bài tập theo đúng 5 phần của tiết học và ô ghi nhớ 3 bước kiểm tra.", "Exercises for each of the 5 parts and a box with the 3-step check.")),
                ("quiz.jpg", 905, t("Quiz 10 câu", "10-question quiz"), t("In ra hoặc chiếu lên màn hình", "Print it or project it"), t("Trang đáp án riêng cho giáo viên, có giải thích từng câu.", "A separate answer page for teachers, with an explanation for each question."))]
    video = [(223, t("Tin sức khỏe lan truyền", "Viral health claims")), (224, t("Ảnh cũ gán chuyện mới", "Old photos, new stories")), (225, t("AI bịa nguồn", "AI-invented sources")),
             (226, t("Biểu đồ gây hiểu lầm", "Misleading charts")), (227, t("3 bước kiểm tra tin nóng", "3 steps for breaking news"))]
    the_video = ""
    for so_tap, ten in video:
        v = next((x for x in thu_tu if x.get("so") == so_tap), None)
        if not v: continue
        the_video += f'<li><a class="sp-video" href="{p}bai/{ten_file(v)}.html"><span class="sp-so">#{so_tap}</span><span>{esc(ten)}</span>{ic(p, "play")}</a></li>'
    buoc = [(t("Chuyển khoản", "Transfer"), t(f"Quét mã QR, chuyển {GIA_BO_GV} với nội dung \"BGV\" kèm email của bạn.", f"Scan the QR code and transfer {GIA_BO_GV} with the note \"BGV\" plus your email.")),
            (t("Nhắn cho kênh", "Message us"), t("Gửi ảnh chụp chuyển khoản qua Messenger hoặc email.", "Send a screenshot of the transfer via Messenger or email.")),
            (t("Nhận file", "Get the files"), t("Kênh gửi file ZIP (slide PowerPoint, 3 file PDF) và link tải 5 video trong ngày, thường trong vài giờ.", "We send the ZIP (PowerPoint slides, 3 PDFs) and download links for the 5 videos the same day, usually within a few hours."))]
    the_buoc = "".join(f'<li class="way"><span class="way-no">{i}</span><h3>{esc(a)}</h3><p>{esc(b)}</p></li>' for i, (a, b) in enumerate(buoc, 1))
    luu_y = [t("Một lần mua dùng cho tất cả các lớp bạn dạy. Vui lòng không đăng lại file lên mạng.", "One purchase covers all the classes you teach. Please don't re-upload the files online."),
             t("File không mở được hoặc thiếu: báo kênh để gửi lại. Bộ không đúng như mô tả trên trang này: hoàn tiền 100% trong 7 ngày.", "Files won't open or are missing: tell us and we'll resend. The kit isn't as described here: 100% refund within 7 days."),
             t("Tài liệu bằng tiếng Việt, soạn cho học sinh THCS và THPT. Video là của kênh Mark học AI, được chiếu trên lớp.", "Materials are in Vietnamese, written for lower and upper secondary students. The videos are Mark học AI's own and may be shown in class.")]
    the_luu_y = "".join(f'<li>{ic(p, "shield-check")}<span>{esc(x)}</span></li>' for x in luu_y)
    main = f"""<main class="kit">
<section class="book-sec">
<ul class="stats-grid sp-so-4">{_the_so(so)}</ul>
</section>
<section class="book-sec" id="trong-bo" aria-labelledby="trong-bo-h">
<h2 id="trong-bo-h">{t("Trong bộ có gì", "What's inside")}</h2>
<ul class="sp-thes">{_the_anh(p, "bo-giao-vien", trong_bo)}</ul>
<div class="rules sp-ghi">
<h3>{t("Thêm: hướng dẫn tiết dạy", "Plus: lesson guide")}</h3>
<p>{t("1-2 trang: mục tiêu bài học, bảng thời gian 45 phút, cách dùng 5 video, gợi ý cho lớp khá và lớp yếu, cách chấm.", "1-2 pages: objectives, a 45-minute timeline, how to use the 5 videos, tips for stronger and weaker classes, and assessment.")}</p>
</div>
</section>
<section class="book-sec" aria-labelledby="video-h">
<h2 id="video-h">{t("5 video đi kèm", "The 5 videos included")}</h2>
<p class="book-sub">{t("Mỗi phần của tiết học dựa trên một video. Video lên kênh từ 18/1/2027; mua bộ là nhận luôn 5 file video MP4 để chiếu trên lớp. Bài viết của từng phần đọc miễn phí ngay bây giờ.", "Each part of the lesson is based on one video. The videos go live on the channel from 18 Jan 2027; buyers get all 5 MP4 files right away to show in class. Each part's article is free to read now.")}</p>
<ul class="sp-videos">{the_video}</ul>
</section>
<section class="book-sec" id="mua" aria-labelledby="mua-h">
<h2 id="mua-h">{t("Mua bộ bài giảng", "Buy the kit")}</h2>
<div class="sp-mua">
<div class="dv-goi dv-goi-chinh sp-gia"><span class="dv-nhan">{t("Trọn bộ", "Full kit")}</span><h3>{t("Kiểm chứng thông tin với AI", "Fact-checking with AI")}</h3><p class="dv-gia"><b>{GIA_BO_GV}</b> <span>{t("một lần", "one-off")}</span></p>
<ol class="ways sp-buoc">{the_buoc}</ol>
<div class="cta">{nut_mess}{nut_mail}</div></div>
{_khoi_qr(p, "BGV + email")}
</div>
<div class="rules">
<h3>{t("Lưu ý", "Good to know")}</h3>
<ul>{the_luu_y}</ul>
<p class="rules-more">{t("Chi tiết trong", "Full details in our")} <a href="dieu-khoan.html#san-pham-so">{t("Điều khoản sử dụng", "Terms of use")}</a>.</p>
</div>
</section>
<aside class="pdf-card kit-contact">
<div><b>{t("Muốn bộ cho chủ đề khác?", "Want a kit on another topic?")}</b><span>{t("Nhắn chủ đề và khối lớp bạn dạy. Bộ tiếp theo sẽ làm theo chủ đề được hỏi nhiều nhất.", "Tell us the topic and grade you teach. The next kit will cover the most requested topic.")}</span></div>
<div class="cta"><a class="btn" href="workshop.html">{t("Xem workshop 2 giờ", "See the 2-hour workshop")}</a></div>
</aside>
</main>"""
    jsonld = [{"@context": "https://schema.org", "@type": "Product", "name": t("Bộ bài giảng: Kiểm chứng thông tin với AI", "Lesson kit: Fact-checking with AI"), "description": desc,
               "image": BASE + "assets/san-pham/bo-giao-vien/bia.jpg", "brand": {"@type": "Brand", "name": SITE},
               "offers": {"@type": "Offer", "price": 99000, "priceCurrency": "VND", "availability": "https://schema.org/InStock", "url": BASE + GOC + "bo-giao-vien.html"}}]
    return GOC + "bo-giao-vien.html", trang("bo-giao-vien.html", t(f"Bộ bài giảng Kiểm chứng thông tin với AI cho giáo viên | {SITE}", f"Fact-checking with AI lesson kit for teachers | {SITE}"),
                                            desc, band, main, p, hien_tai="bo-giao-vien", og_type="website", jsonld=jsonld, q="")

@trang_rieng("workshop.html", "0.6")
def tao_workshop():
    p = t("", "../")
    nut_mess, nut_mail = _nut_lien_he(p, "Đăng ký workshop Dùng AI cho công việc", "Workshop sign-up: Using AI at work")
    desc = t("Workshop 2 giờ \"Dùng AI cho công việc\" cho dân văn phòng, giáo viên và chủ shop: viết prompt cho ra kết quả, prompt mẫu theo nghề, an toàn và kiểm chứng. Học online hoặc mở lớp tại công ty.",
             "A 2-hour \"Using AI at work\" workshop for office workers, teachers and shop owners: prompts that get results, ready prompts by job, safety and fact-checking. Online or at your company. Taught in Vietnamese.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Workshop · online hoặc tại công ty", "Workshop · online or at your company")}</p>\n'
            f'<h1>{t("Dùng AI cho công việc trong 2 giờ", "Using AI at work, in 2 hours")}</h1>\n'
            f'<p class="lead">{t("Buổi học thực hành cho người không làm kỹ thuật. Ra về với công thức viết prompt, bộ prompt mẫu cho đúng nghề của mình và thói quen kiểm tra lại trước khi dùng kết quả.", "A hands-on session for non-technical people. Leave with a prompt formula, ready prompts for your own job and the habit of checking AI output before you use it.")}</p>\n'
            f'<div class="cta"><a class="btn btn-yt" href="#dang-ky">{t("Đăng ký giữ chỗ", "Save a seat")}</a><a class="btn" href="#noi-dung">{t("Xem nội dung buổi học", "See the agenda")}</a></div>\n'
            f'</div><img class="head-art sp-bia" src="{p}assets/san-pham/workshop/bia.jpg" alt="{t("Bìa workshop Dùng AI cho công việc", "Workshop cover: Using AI at work")}" width="600" height="450"></div>')
    so = [("2h", t("gồm 10 phút nghỉ giữa giờ", "including a 10-minute break")),
          ("3", t("nhóm nghề: văn phòng, giáo viên, bán hàng", "job tracks: office, teaching, sales")),
          ("9+", t("prompt mẫu theo nghề, chép về dùng ngay", "job-specific prompts to copy and use")),
          ("6", t("trang sổ tay học viên PDF mang về", "pages of participant handbook (PDF) to keep"))]
    phan = [("10'", t("Mở đầu", "Kick-off"), t("Mục tiêu buổi học và bạn đã dùng AI cho việc gì.", "Goals, and what you already use AI for.")),
            ("15'", t("AI làm được gì, không làm được gì", "What AI can and can't do"), t("Chatbot là gì, vì sao AI có lúc bịa, dữ liệu nào không được dán vào.", "What a chatbot is, why AI sometimes makes things up, what data never to paste in.")),
            ("25'", t("Viết prompt cho ra kết quả", "Prompts that get results"), t("Công thức 5 phần, ví dụ trước và sau, hỏi tiếp để sửa. Có bài tập tại chỗ.", "A 5-part formula, before-and-after examples, follow-ups to refine. With a live exercise.")),
            ("35'", t("Việc thật theo nghề", "Real tasks by job"), t("Email, tóm tắt họp, Excel; giáo án, đề 3 mức, nhận xét; mô tả sản phẩm, trả lời khách, kịch bản livestream.", "Emails, meeting notes, spreadsheets; lesson plans, tiered tests, feedback; product copy, customer replies, livestream scripts.")),
            ("10'", t("An toàn và kiểm chứng", "Safety and fact-checking"), t("3 bước kiểm tra kết quả, lừa đảo giả giọng và giả mặt.", "3 steps to check output, voice and face clone scams.")),
            ("15'", t("Tổng kết và hỏi đáp", "Wrap-up and Q&A"), t("Kế hoạch tập 7 ngày và tài liệu học tiếp miễn phí.", "A 7-day practice plan and free resources to keep learning."))]
    the_phan = "".join(f'<li class="way"><span class="way-no">{esc(a)}</span><h3>{esc(b)}</h3><p>{esc(c)}</p></li>' for a, b, c in phan)
    xem = [("slide-1.jpg", 360, t("Slide buổi học", "Session slides"), t("Mở đầu", "Opening"), t("Slide chữ to, mỗi slide một ý.", "Big type, one idea per slide.")),
           ("slide-2.jpg", 360, t("Slide buổi học", "Session slides"), t("Công thức viết prompt", "The prompt formula"), t("5 phần dễ nhớ, dùng cho mọi công cụ AI.", "5 easy parts that work with any AI tool.")),
           ("slide-3.jpg", 360, t("Slide buổi học", "Session slides"), t("Thẻ prompt mẫu", "Prompt cards"), t("Chép, đổi vài chữ là dùng được cho việc của bạn.", "Copy, change a few words, and use it for your own work."))]
    goi = [(t("Lớp online mở", "Open online class"), "149.000đ", t("mỗi người", "per person"), True,
            [t("Học qua Google Meet hoặc Zoom", "Live on Google Meet or Zoom"), t("Có sổ tay học viên PDF", "Participant handbook PDF"), t("Có bài tập thực hành tại chỗ", "Hands-on exercises in class"), t("Lịch học công bố trên fanpage", "Dates announced on our Facebook page")]),
           (t("Lớp tại công ty", "In-company class"), t("từ 2,5 triệu đ", "from 2.5 million VND"), t("mỗi buổi", "per session"), False,
            [t("Tối đa 30 người, online hoặc tại chỗ", "Up to 30 people, online or on site"), t("Chọn nhóm nghề theo đội của bạn", "Job tracks picked for your team"), t("Prompt mẫu soạn theo việc thật của công ty", "Prompts written for your real tasks"), t("Báo giá theo số người và địa điểm", "Quote based on headcount and location")])]
    the_goi = "".join(f'<li class="dv-goi{" dv-goi-chinh" if chinh else ""}">' + (f'<span class="dv-nhan">{t("Mở đăng ký", "Open")}</span>' if chinh else "")
                      + f'<h3>{esc(ten)}</h3><p class="dv-gia"><b>{esc(gia)}</b> <span>{esc(don_vi)}</span></p><ul>'
                      + "".join(f'<li>{ic(p, "check")}<span>{esc(x)}</span></li>' for x in y) + '</ul></li>' for ten, gia, don_vi, chinh, y in goi)
    buoc = [(t("Nhắn đăng ký", "Message us"), t("Ghi tên, nghề của bạn và chọn lớp online hay lớp tại công ty.", "Tell us your name, your job, and online or in-company.")),
            (t("Nhận lịch học", "Get the date"), t("Kênh báo ngày giờ buổi gần nhất. Lớp công ty thì hẹn ngày theo đội của bạn.", "We send the next session's date. For companies, we set a date with your team.")),
            (t("Giữ chỗ", "Confirm your seat"), t("Chuyển khoản qua mã QR bên cạnh với nội dung \"WS\" kèm số điện thoại, kênh gửi link vào lớp.", "Pay with the QR code here, note \"WS\" plus your phone number, and we send the class link."))]
    the_buoc = "".join(f'<li class="way"><span class="way-no">{i}</span><h3>{esc(a)}</h3><p>{esc(b)}</p></li>' for i, (a, b) in enumerate(buoc, 1))
    luu_y = [t("Báo nghỉ trước buổi học 24 giờ: hoàn 100% hoặc chuyển sang buổi sau. Kênh dời buổi học: hoàn 100% nếu bạn không học được ngày mới.", "Cancel 24 hours before: full refund or move to a later session. If we reschedule and you can't make it: full refund."),
             t("Mang theo máy tính hoặc điện thoại có tài khoản một công cụ AI miễn phí (ChatGPT, Gemini hoặc Claude).", "Bring a laptop or phone with a free account on one AI tool (ChatGPT, Gemini or Claude)."),
             t("Buổi học bằng tiếng Việt. Không cần biết lập trình.", "The session is taught in Vietnamese. No coding needed.")]
    the_luu_y = "".join(f'<li>{ic(p, "shield-check")}<span>{esc(x)}</span></li>' for x in luu_y)
    main = f"""<main class="kit">
<section class="book-sec">
<ul class="stats-grid sp-so-4">{_the_so(so)}</ul>
</section>
<section class="book-sec" id="noi-dung" aria-labelledby="noi-dung-h">
<h2 id="noi-dung-h">{t("Nội dung 2 giờ", "The 2-hour agenda")}</h2>
<ol class="ways sp-lich">{the_phan}</ol>
</section>
<section class="book-sec" aria-labelledby="xem-h">
<h2 id="xem-h">{t("Xem trước slide", "Slide preview")}</h2>
<ul class="sp-thes sp-thes-3">{_the_anh(p, "workshop", xem)}</ul>
</section>
<section class="book-sec" id="bang-gia" aria-labelledby="bang-gia-h">
<h2 id="bang-gia-h">{t("Học phí", "Prices")}</h2>
<ul class="dv-gois sp-gois-2">{the_goi}</ul>
</section>
<section class="book-sec" id="dang-ky" aria-labelledby="dang-ky-h">
<h2 id="dang-ky-h">{t("Đăng ký", "Sign up")}</h2>
<div class="sp-mua">
<div class="dv-goi sp-gia"><ol class="ways sp-buoc">{the_buoc}</ol>
<div class="cta">{nut_mess}{nut_mail}</div></div>
{_khoi_qr(p, "WS + SĐT")}
</div>
<div class="rules">
<h3>{t("Lưu ý", "Good to know")}</h3>
<ul>{the_luu_y}</ul>
<p class="rules-more">{t("Chi tiết trong", "Full details in our")} <a href="dieu-khoan.html#san-pham-so">{t("Điều khoản sử dụng", "Terms of use")}</a>.</p>
</div>
</section>
<aside class="pdf-card kit-contact">
<div><b>{t("Là giáo viên?", "A teacher?")}</b><span>{t("Có sẵn bộ bài giảng 45 phút về kiểm chứng thông tin để dạy ngay trên lớp.", "There's a ready 45-minute lesson kit on fact-checking you can teach right away.")}</span></div>
<div class="cta"><a class="btn" href="bo-giao-vien.html">{t("Xem bộ bài giảng", "See the lesson kit")}</a></div>
</aside>
</main>"""
    return GOC + "workshop.html", trang("workshop.html", t(f"Workshop Dùng AI cho công việc trong 2 giờ | {SITE}", f"Using AI at work: 2-hour workshop | {SITE}"),
                                        desc, band, main, p, hien_tai="workshop", og_type="website", q="")

# ---------- Phòng thí nghiệm cảm biến 3D (phong-thi-nghiem-cam-bien.html): LiDAR, camera, radar ----------
# Dữ liệu và chữ ở data/cam-bien.json, cảnh 3D ở cam-bien.js (Three.js r160 để sẵn trong assets/vendor/three, không gọi CDN).
@trang_rieng("phong-thi-nghiem-cam-bien.html", "0.7")
def tao_cam_bien():
    p = t("", "../")
    D = load("cam-bien")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x
    def video(so):
        so = str(so)
        if "." in so:
            cha, phu_so = so.split(".")
            x = next(x for ss in video_phu for x in ss["tap"] if x["so"] == so)
            ten = x["tieu_de"] if L == "vi" else load("en/video-phu")["tap"].get(so, {}).get("tieu_de", x["tieu_de"])
            return {"so": so, "ten": ten, "url": f"bai/{int(cha):02d}-{phu_so}-{x['slug']}.html"}
        v = co_bai[int(so)]
        return {"so": so, "ten": seo[so], "url": f"bai/{ten_file(v)}.html"}
    cb = {k: {"ten": chu(x["ten"]), "mo_ta": chu(x["mo_ta"]), "video": video(x["video"]),
              "bo_phan": [{"id": b["id"], "ten": chu(b["ten"]), "chu": chu(b["chu"])} for b in x["bo_phan"]]} for k, x in D["cam_bien"].items()}
    tt = [{"id": c["id"], "thoi_tiet": c["thoi_tiet"], "can": c["can"], "de": chu(c["de"]), "giai": chu(c["giai"]), "video": video(c["video"])} for c in D["thu_thach"]]
    nhan = {
        "tach": t("Tách rời", "Explode"), "gop": t("Lắp lại", "Assemble"), "cham": t("Chạm vào một bộ phận để xem nó làm gì. Kéo để xoay, chụm hai ngón để phóng to.", "Tap a part to see what it does. Drag to rotate, pinch to zoom."),
        "xem_video": t("Xem video", "Watch video"), "ban": t("Bắn tia laser", "Fire the laser"), "khoang": t("Khoảng cách tới vật", "Distance to object"),
        "thoi_gian": t("Thời gian đi và về", "Round-trip time"), "cong_thuc": t("Ánh sáng đi 30 cm mỗi nano giây (ns). Tia phải đi tới vật rồi quay về, nên khoảng cách = thời gian × 30 cm ÷ 2.", "Light travels 30 cm per nanosecond (ns). The pulse goes out and back, so distance = time × 30 cm ÷ 2."),
        "ns": "ns", "m": "m", "nhin": t("Nhìn bằng", "View with"), "mat": t("Mắt người", "Human eye"),
        "muc": [t("Không biết", "Can't tell"), t("Mờ, ước chừng", "Rough guess"), t("Rõ", "Clear")],
        "ghep": t("Ghép cả ba (sensor fusion)", "All three (sensor fusion)"), "bang": t("Cảm biến này biết gì?", "What does this sensor know?"),
        "chon_cb": t("Chọn ít cảm biến nhất mà vẫn đủ", "Pick the fewest sensors that still do the job"), "kiem": t("Kiểm tra", "Check"), "tiep": t("Thử thách tiếp", "Next challenge"),
        "dung_gon": t("Chuẩn, và gọn nhất!", "Right, and as lean as it gets!"), "dung_thua": t("Đủ rồi, nhưng có thể bỏ bớt một cảm biến.", "That works, but you could drop a sensor."), "thieu": t("Chưa đủ.", "Not enough."),
        "thieu_gi": t("Còn thiếu", "Still missing"), "ket": t("Bạn giải gọn", "Solved leanly"), "lai": t("Làm lại", "Try again"), "thu_thach": t("Thử thách", "Challenge"),
        "khong_3d": t("Máy của bạn chưa chạy được đồ họa 3D (WebGL). Bạn vẫn xem được bảng và thử thách bên dưới, hoặc xem video.", "Your device can't run 3D graphics (WebGL). The tables and challenges below still work, or watch the videos."),
        "nguoi": t("Người đi bộ", "Pedestrian"), "xe_may": t("Xe máy", "Motorbike"), "kmh": "km/h",
        "doc_den": t("Camera đọc: đèn ĐỎ", "Camera reads: RED light"), "doc_bien": t("Biển: tối đa 40 km/h", "Sign: 40 km/h limit"),
    }
    du_lieu = json.dumps({"cb": cb, "thoi_tiet": {k: chu(x) for k, x in D["thoi_tiet"].items()}, "thong_tin": {k: chu(x) for k, x in D["thong_tin"].items()},
                          "muc": D["muc"], "ly_do": {k: chu(x) for k, x in D["ly_do"].items()}, "thu_thach": tt, "nhan": nhan, "p": p},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Mô hình 3D chơi ngay trên web: tách rời LiDAR, camera, radar xem từng bộ phận, bắn tia laser đo khoảng cách, đổi trời nắng, đêm, mưa, sương mù để xem mỗi cảm biến của xe tự lái thấy gì.",
             "Interactive 3D models: take apart a LiDAR, camera and radar, fire a laser to measure distance, and switch between sun, night, rain and fog to see what each self-driving sensor sees.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Phòng thí nghiệm 3D · Ba con mắt của AI", "3D lab · The three eyes of AI")}</p>\n'
            f'<h1>{t("Phòng thí nghiệm cảm biến", "Sensor lab")}</h1>\n'
            f'<p class="lead">{t("Tự tay tách rời LiDAR, camera, radar, bắn tia laser đo khoảng cách, rồi đổi thời tiết để xem xe tự lái nhìn thấy gì qua từng con mắt.", "Take apart a LiDAR, a camera and a radar, fire a laser to measure distance, then change the weather to see what a self-driving car sees through each eye.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-a-ra-the.svg" alt="" width="180" height="170"></div>')
    tabs = [("mo-xe", t("Mổ xẻ cảm biến", "Inside the sensors")), ("do-sang", t("Đo bằng ánh sáng", "Measuring with light")),
            ("con-pho", t("Con phố 4 kiểu trời", "One street, four weathers")), ("thu-thach", t("Thử thách", "Challenge"))]
    nut_tab = "".join(f'<button type="button" role="tab" class="cb-tab" id="cb-tab-{k}" aria-controls="cb-khu" aria-selected="{"true" if i == 0 else "false"}" data-tab="{k}">{esc(ten)}</button>' for i, (k, ten) in enumerate(tabs))
    main = f"""<main class="cb" id="cb">
<div class="cb-tabs" role="tablist" aria-label="{t("Các phần của phòng thí nghiệm", "Lab sections")}">{nut_tab}</div>
<div class="cb-o" id="cb-khu" role="tabpanel">
<div class="cb-san" id="cb-san"><canvas id="cb-canvas" aria-label="{t("Mô hình 3D", "3D model")}"></canvas><div class="cb-nhan-3d" id="cb-nhan-3d" aria-hidden="true"></div><p class="cb-loi" id="cb-loi" hidden>{t("Máy của bạn chưa chạy được đồ họa 3D (WebGL). Bạn vẫn dùng được bảng và thử thách bên cạnh.", "Your device can't run 3D graphics (WebGL). The panels and challenges still work.")}</p></div>
<div class="cb-ben" id="cb-ben" aria-live="polite"></div>
</div>
<p class="cb-ghi">{t("Mô hình đơn giản hóa để dễ hiểu, không phải bản vẽ kỹ thuật của một hãng nào. Mức nhận biết theo thời tiết lấy từ series", "Simplified models for learning, not any manufacturer's design. Weather performance follows the series")} <a href="bai/{ten_file(co_bai[5])}.html">{t("Ba con mắt của AI", "The three eyes of AI")}</a>.</p>
<noscript><p>{t("Phòng thí nghiệm cần JavaScript. Bạn vẫn xem được video", "The lab needs JavaScript. You can still watch the video")} <a href="bai/{ten_file(co_bai[5])}.html">LiDAR</a>.</p></noscript>
<script type="application/json" id="cb-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "phong-thi-nghiem-cam-bien.html", trang("phong-thi-nghiem-cam-bien.html", t(f"Phòng thí nghiệm cảm biến 3D: LiDAR, camera, radar | {SITE}", f"3D sensor lab: LiDAR, camera, radar | {SITE}"),
                                                        desc, band, main, p, og_type="website", q="",
                                                        cuoi=f'<script type="module" src="{p}cam-bien.js?v=dev"></script>\n')

# ---------- trò chơi "Lừa đảo hay thật?" (lua-dao-hay-that.html): ca giả lập dựa trên video 14, 15, 108-112, 122, 214, 223, 266, 269 ----------
LUOT_LUA_DAO = 10
# Nội dung ở data/lua-dao.json (cả hai ngôn ngữ), cách chơi ở lua-dao.js. Trang chỉ nhúng chữ của ngôn ngữ đang tạo.
@trang_rieng("lua-dao-hay-that.html", "0.7")
def tao_lua_dao():
    p = t("", "../")
    D = load("lua-dao")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) else x
    ca = []
    for c in D["ca"]:
        v = co_bai[c["video"]]
        ca.append({"id": c["id"], "loai": c["loai"], "dap_an": c["dap_an"], "co_khung": c.get("co_khung", ""),
                   "khung": {k: chu(x) for k, x in c["khung"].items()},
                   "dong": [{"tu": d["tu"], "doan": [{"chu": chu(x), "co": x.get("co", "")} for x in d["doan"]]} for d in c["dong"]],
                   "co": {k: chu(x) for k, x in c["co"].items()}, "giai": chu(c["giai"]),
                   **({"nut": {k: chu(x) for k, x in c["nut"].items()}} if c.get("nut") else {}),
                   "video": {"so": v["so"], "ten": seo[str(v["so"])], "url": f"bai/{ten_file(v)}.html"}})
    luot = min(LUOT_LUA_DAO, len(ca))  # mỗi lượt chơi lấy ngẫu nhiên chừng này ca (lua-dao.js)
    nhan = {
        "ca": t("Ca", "Case"), "diem": t("Điểm", "Score"), "huong": t("Chạm vào những chỗ bạn thấy đáng ngờ, rồi chọn.", "Tap anything that looks suspicious, then decide."),
        "danh_dau": t("Đã đánh dấu", "Marked"), "cho": t("chỗ", "spots"), "lua": t("Lừa đảo", "Scam"), "that": t("Thật", "Real"),
        "dung": t("Chuẩn rồi!", "Spot on!"), "sai": t("Chưa đúng!", "Not quite!"), "la_lua": t("Đây là lừa đảo.", "This is a scam."), "la_that": t("Đây là thật.", "This one is real."),
        "tim_thay": t("Bạn tìm ra", "You found"), "bo_sot": t("Bạn bỏ sót", "You missed"), "khong_co": t("Không có dấu hiệu lừa đảo nào ở ca này.", "There are no scam signs in this case."),
        "nham": t("Chỗ này bình thường", "This part is fine"), "xem_video": t("Xem video", "Watch video"), "tiep": t("Ca tiếp theo", "Next case"), "xem_ket": t("Xem kết quả", "See your result"),
        "goi_den": t("Cuộc gọi đến", "Incoming call"), "goi_video": t("Cuộc gọi video", "Video call"), "nguoi_goi": t("Người gọi nói", "The caller says"),
        "tai_tro": t("Quảng cáo", "Ad"), "ban": t("Bạn", "You"),
        "hang": [[round(luot * .9), t("Thám tử chống lừa", "Scam detective")], [round(luot * .7), t("Khá tỉnh táo", "Pretty sharp")], [0, t("Nên ôn lại một chút", "Worth a quick refresher")]],
        "dau_hieu": t("dấu hiệu", "signs"), "on_lai": t("Ôn lại các video bạn trả lời sai", "Rewatch the videos for the cases you missed"), "het_sai": t("Bạn không sai ca nào. Gửi trò này cho bố mẹ thử xem!", "You got every case right. Send this to your parents to try!"),
        "choi_lai": t("Chơi lại", "Play again"),
        "cao": t("Lật mặt rồi! Kẻ đứng sau ca này là Cáo Giả. Gặp lại mấy dấu hiệu trên là bạn nhận ra nó ngay.",
                 "Unmasked! Faker Fox was behind this one. Spot those signs again and you'll know it's him."),
    }
    du_lieu = json.dumps({"ca": ca, "nhan": nhan, "p": p, "luot": luot}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    so_ca, so_lua = len(ca), sum(c["dap_an"] == "lua" for c in ca)
    desc = t(f"Trò chơi miễn phí: {so_ca} tình huống giả lập trên điện thoại, cuộc gọi giả giọng người thân, gọi video deepfake, tin nhắn ngân hàng giả, quảng cáo đầu tư, ảnh tin nóng do AI tạo, cuộc họp video toàn người giả, quảng cáo thuốc deepfake, việc lương cao ở nước ngoài. Bạn nhận ra đâu là lừa đảo, đâu là thật?",
             f"Free game: {so_ca} simulated phone situations, cloned-voice calls, deepfake video calls, fake bank texts, investment ads, AI-made news photos, all-fake video meetings, deepfake medicine ads and too-good jobs abroad. Can you tell the fakes from the real ones?")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 3 phút · chơi trên điện thoại", "Game · 3 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Lừa đảo hay thật?", "Scam or real?")}</h1>\n'
            f'<p class="lead">{t(f"{so_ca} tình huống trên điện thoại, mỗi lượt {luot} ca ngẫu nhiên. Chạm vào chỗ đáng ngờ, rồi chọn Lừa đảo hay Thật. Mỗi ca có Bit giải thích và video để xem lại.", f"{so_ca} situations on a phone screen, {luot} random ones per round. Tap what looks suspicious, then pick Scam or Real. Bit explains each case and links the video.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="ld" id="ld">
<div class="ld-dau"><p class="ld-tien" id="ld-tien" aria-live="polite"></p><p class="ld-diem" id="ld-diem"></p></div>
<div class="ld-san" id="ld-san"></div>
<section class="ld-ket" id="ld-ket" hidden aria-live="polite">
<div class="ld-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="ld-ket-so" id="ld-ket-so"></p><p class="ld-ket-hang" id="ld-ket-hang"></p><p class="ld-ket-phu" id="ld-ket-phu"></p></div></div>
<h2 class="ld-ket-h" id="ld-ket-h"></h2>
<div class="ld-ket-video" id="ld-ket-video"></div>
<div class="cta"><button type="button" class="btn" id="ld-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "lua-dao-hay-that.html", t("Lừa đảo hay thật? Thử nhận ra chiêu lừa bằng AI", "Scam or real? Try spotting AI scams"), p)}
</section>
<p class="ld-ghi">{t("Mọi tên người, ngân hàng, trang, số điện thoại và đường link trong trò chơi đều là hư cấu để luyện tập.", "All names, banks, pages, phone numbers and links in this game are made up for practice.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem series", "The game needs JavaScript. You can still watch the series")} <a href="bai/{ten_file(co_bai[108])}.html">{t("Đừng để AI lừa", "Don't get fooled by AI")}</a>.</p></noscript>
<script type="application/json" id="ld-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "lua-dao-hay-that.html", trang("lua-dao-hay-that.html", t(f"Lừa đảo hay thật? Trò chơi nhận ra lừa đảo bằng AI | {SITE}", f"Scam or real? A game for spotting AI scams | {SITE}"),
                                                desc, band, main, p, og_type="website", q="",
                                                cuoi=f'<script src="{p}chia-se.js?v=dev" defer></script>\n<script src="{p}lua-dao.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- trò chơi "Thợ ghép câu lệnh" (tho-ghep-cau-lenh.html): ghép mảnh câu lệnh, xem AI trả lời tốt lên ----------
# Nội dung ở data/ghep-cau-lenh.json (cả hai ngôn ngữ), cách chơi ở ghep-cau-lenh.js. Câu trả lời của AI viết sẵn, không gọi AI thật.
@trang_rieng("tho-ghep-cau-lenh.html", "0.7")
def tao_ghep_cau_lenh():
    p = t("", "../")
    D = load("ghep-cau-lenh")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x
    def video(so):
        v = co_bai[so]
        return {"so": so, "ten": seo[str(so)], "url": f"bai/{ten_file(v)}.html"}
    loai = {k: {"ten": x[L], "mau": x["mau"]} for k, x in D["loai"].items()}
    viec = [{"id": c["id"], "ten": chu(c["ten"]), "goc": chu(c["goc"]), "video": video(c["video"]),
             "manh": [{"id": m["id"], "loai": m["loai"], "chu": chu(m["chu"]), "giai": chu(m["giai"]), "can": bool(m.get("can")),
                       "chinh": bool(m.get("chinh")), "bay": m.get("bay", "")} for m in c["manh"]],
             "tra_loi": {k: chu(x) for k, x in c["tra_loi"].items()}, "sai_khi_tho": chu(c.get("sai_khi_tho", ""))} for c in D["viec"]]
    mau = {"video": video(D["mau"]["video"]), "dong": [{"loai": d["loai"], "chu": d[L]} for d in D["mau"]["dong"]]}
    nhan = {
        "viec": t("Việc", "Task"), "sao": t("Sao", "Stars"), "cau_lenh": t("Câu lệnh của bạn", "Your prompt"), "goc": t("Câu gốc", "Starting line"),
        "manh": t("Mảnh để ghép", "Pieces to add"), "huong": t("Chạm vào mảnh để thêm vào câu lệnh, chạm lần nữa để bỏ ra. Chỉ chọn mảnh thật sự giúp AI hiểu đúng ý.", "Tap a piece to add it to the prompt, tap again to remove it. Only pick pieces that really help the AI."),
        "gui": t("Gửi cho AI", "Send to AI"), "ai": t("AI trả lời", "AI answers"), "sua": t("Sửa câu lệnh", "Edit prompt"),
        "tiep": t("Việc tiếp theo", "Next task"), "xem_ket": t("Xem kết quả", "See your result"), "xem_video": t("Xem video", "Watch video"),
        "chep": t("Chép câu lệnh", "Copy prompt"), "da_chep": t("Đã chép!", "Copied!"),
        "muc": {"tho": t("Câu trả lời chung chung", "A generic answer"), "kha": t("Khá hơn rồi, còn thiếu chút", "Better, still missing something"), "tot": t("Đúng ý luôn!", "Spot on!")},
        "co": t("Mảnh bạn đã dùng", "Pieces you used"), "thieu": t("Còn thiếu", "Still missing"), "bay": t("Mảnh nên bỏ", "Pieces to drop"),
        "bay_loai": {"mo-ho": t("Mơ hồ", "Vague"), "nguoc": t("Làm kết quả tệ đi", "Makes it worse"), "nguy": t("Không nên giao cho AI", "Don't hand this to AI"), "lo-du-lieu": t("Lộ dữ liệu riêng tư", "Leaks private data")},
        "canh_bao": t("Câu lệnh có dữ liệu riêng tư. Đừng dán thứ này vào AI thật.", "This prompt contains private data. Don't paste this into a real AI."),
        "canh_bao_nguy": t("Việc này cần người thật, AI chỉ nên giúp bạn chuẩn bị câu hỏi.", "This needs a real person; AI should only help you prepare questions."),
        "trong": t("Chưa có mảnh nào. Gửi thử câu gốc cũng được, để xem AI trả lời ra sao.", "No pieces yet. You can send the bare line to see what happens."),
        "hang": [[round(len(viec) * 18 / 7), t("Thợ ghép bậc thầy", "Master prompt builder")], [round(len(viec) * 12 / 7), t("Thợ ghép lành nghề", "Skilled prompt builder")], [0, t("Thợ học việc", "Apprentice prompt builder")]],
        "mau_h": t("Mẫu câu lệnh để dùng mãi", "A prompt template to keep"), "mau_lead": t("Gom mọi mảnh vào một mẫu có chỗ trống. Lần tới nhờ AI, chỉ cần điền vào.", "All the pieces in one fill-in template. Next time you ask an AI, just fill in the blanks."),
        "on_lai": t("Xem lại video cho những việc chưa được 3 sao", "Rewatch the videos for tasks under 3 stars"), "het": t("Bạn được 3 sao mọi việc. Thử dùng mẫu bên dưới cho việc thật của bạn!", "Three stars on every task. Try the template below on a real task!"),
        "choi_lai": t("Chơi lại", "Play again"), "phu": t("Mảnh bỏ đúng", "Traps avoided"),
    }
    du_lieu = json.dumps({"viec": viec, "loai": loai, "mau": mau, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    so_viec = len(viec)
    desc = t(f"Trò chơi miễn phí: {so_viec} việc nhờ AI, từ bài đăng bán hàng tới báo cáo tuần. Ghép vai trò, bối cảnh, ví dụ, định dạng vào câu lệnh và xem câu trả lời của AI tốt lên ra sao.",
             f"Free game: {so_viec} everyday AI tasks, from a sales post to a weekly report. Snap role, context, examples and format into your prompt and watch the AI answer get better.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 10 phút · chơi trên điện thoại", "Game · 10 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Thợ ghép câu lệnh", "Prompt builder")}</h1>\n'
            f'<p class="lead">{t(f"{so_viec} việc hằng ngày, mỗi việc bắt đầu bằng một câu lệnh mơ hồ. Ghép thêm mảnh, gửi cho AI, xem câu trả lời đổi ra sao. Cẩn thận vài mảnh bẫy!", f"{so_viec} everyday tasks, each starting with a vague prompt. Add pieces, send it to the AI and see how the answer changes. Watch out for a few trap pieces!")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="gh" id="gh">
<div class="gh-dau"><p class="gh-tien" id="gh-tien" aria-live="polite"></p><p class="gh-diem" id="gh-diem"></p></div>
<div class="gh-san" id="gh-san"></div>
<section class="gh-ket" id="gh-ket" hidden aria-live="polite">
<div class="gh-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="gh-ket-so" id="gh-ket-so"></p><p class="gh-ket-hang" id="gh-ket-hang"></p><p class="gh-ket-phu" id="gh-ket-phu"></p></div></div>
<h2 class="gh-ket-h" id="gh-ket-h"></h2>
<div class="gh-ket-video" id="gh-ket-video"></div>
<div class="gh-mau" id="gh-mau"></div>
<div class="cta"><button type="button" class="btn" id="gh-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "tho-ghep-cau-lenh.html", t("Thợ ghép câu lệnh: ghép prompt, xem AI trả lời tốt lên", "Prompt builder: snap a prompt together and watch the AI improve"), p)}
</section>
<p class="gh-ghi">{t("Câu trả lời của AI trong trò chơi được viết sẵn để minh họa, không gọi AI thật. Tên người và tên gói cước là hư cấu.", "The AI answers in this game are pre-written to illustrate the idea; no real AI is called. Names and phone plans are made up.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem series", "The game needs JavaScript. You can still watch the series")} <a href="bai/{ten_file(co_bai[101])}.html">{t("Hỏi AI cho ra kết quả", "Getting real results from AI")}</a>.</p></noscript>
<script type="application/json" id="gh-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "tho-ghep-cau-lenh.html", trang("tho-ghep-cau-lenh.html", t(f"Thợ ghép câu lệnh: trò chơi luyện viết prompt | {SITE}", f"Prompt builder: a game for writing better prompts | {SITE}"),
                                                 desc, band, main, p, og_type="website", q="",
                                                 cuoi=f'<script src="{p}ghep-cau-lenh.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# Hình xem trước của trạm 8 (thẻ "Chơi thử" trong bài video 26): dùng lại khuôn .ct-ld / .ct-tin / .ct-chon có sẵn trong style.css
HINH_CHOI["nghi-truoc"] = lambda: (f'<span class="ct-hinh ct-ld" aria-hidden="true"><span class="ct-tin">{t("1 kg sắt hay 1 kg bông nặng hơn?", "1 kg of iron or 1 kg of cotton?")}</span>'
                                   f'<span class="ct-chon"><span class="ct-gia">⚡ {t("Nói ngay", "Answer now")}</span><span>🧠 {t("Nghĩ trước", "Think first")}</span></span></span>')
# ---------- Phòng thí nghiệm bộ não AI (phong-thi-nghiem-bo-nao.html): bàn thí nghiệm, ngăn kéo trạm bên trái ----------
# Cách chạy ở bo-nao.js. Trạm 1 dùng bộ tách mảnh thật (assets/vendor/gpt-tokenizer), trạm 6 dùng data/bo-nao/doan-chu*.json
# (scripts/tao_doan_chu.py). Mỗi trạm mở riêng được bằng ?tram=<id> (data/tro-choi/bo-nao-*.json nhúng từng trạm vào bài của video).
@trang_rieng("phong-thi-nghiem-bo-nao.html", "0.7")
def tao_bo_nao():
    p = t("", "../")
    D = load(t("bo-nao/doan-chu", "bo-nao/doan-chu-en"))
    tram = [
        ("cat-manh", "1", t("Cắt mảnh", "Tokens"), "19 · 146", True),
        ("ban-do", "2", t("Bản đồ nghĩa", "Meaning map"), "20", False),
        ("thu-tu", "3", t("Thứ tự chữ", "Word order"), "200", False),
        ("attention", "4", t("Attention: chữ “nó”", "Attention: the word “it”"), "21", False),
        ("tang", "5", t("Qua 12 tầng", "Through 12 layers"), "43", False),
        ("doan-chu", "6", t("Đoán chữ tiếp", "Next word"), "7", True),
        ("vong-quay", "7", t("Vòng quay nhiệt độ", "Temperature wheel"), "24", True),
        ("nghi-truoc", "8", t("Nghĩ trước khi nói", "Think before answering"), "26", True),
    ]
    def li(x):
        id_, so, ten, ep, mo = x
        if mo:
            return f'<li><button type="button" class="bn-nut" data-tram="{id_}" aria-controls="tram-{id_}"><span class="bn-so">{so}</span><span class="bn-ten">{ten}<small>{t("Video", "Video")} {ep}</small></span></button></li>'
        return f'<li><span class="bn-nut bn-sap" aria-disabled="true"><span class="bn-so">{so}</span><span class="bn-ten">{ten}<small>{t("Sắp mở", "Coming soon")}</small></span></span></li>'
    ngan = (f'<nav class="bn-ngan" aria-label="{t("Các trạm", "Stations")}"><p class="bn-cau" title="{t("Câu mẫu đi suốt các trạm (video 21)", "Sample sentence used across stations (video 21)")}">'
            f'{t("Con mèo không nhảy qua bức tường vì nó quá mệt", "The cat did not jump over the wall because it was too tired")}</p><ol>' + "".join(li(x) for x in tram) + "</ol></nav>")
    mau_vi = [("Con mèo không nhảy qua bức tường vì nó quá mệt", "The cat did not jump over the wall because it was too tired"),
              ("Hôm nay trời nắng, mình đi uống cà phê với bạn.", "It is sunny today, so I am going for coffee with a friend."),
              ("Nghiêng ngả, nguệch ngoạc, khuỷu tay", "Leaning, scribbled, elbow")]
    if LG == "en":
        mau = [(b, a) for a, b in mau_vi]
    else:
        mau = mau_vi
    nut_mau = "".join(f'<button type="button" class="chip" data-cm-mau="{a}" data-cap=\'{json.dumps([a, b], ensure_ascii=False)}\'>{a[:28]}{"…" if len(a) > 28 else ""}</button>' for a, b in mau)
    nut_mau += f'<button type="button" class="chip" data-cm-mau="{t("Mark học AI 🤖 markhocai.com", "Mark học AI 🤖 markhocai.com")}">{t("Có emoji và link", "Emoji and a link")}</button>'
    cm = f'''<section class="bn-tram" id="tram-cat-manh" hidden aria-labelledby="h-cat-manh">
<p class="bn-nhan">{t("Trạm 1 · Video 19, 146, 60", "Station 1 · Videos 19, 146, 60")}</p>
<h2 id="h-cat-manh">{t("Gõ gì cũng được, xem AI cắt thành mảnh nào", "Type anything, see which tokens the AI cuts it into")}</h2>
<p class="bn-mo">{t("AI không đọc từng chữ cái mà đọc từng <b>mảnh</b> (token). Mỗi màu dưới đây là một mảnh. Đây là bộ tách mảnh thật, cùng loại các chatbot đang dùng.", "AI doesn't read letter by letter. It reads <b>tokens</b>. Each colour below is one token. This is a real tokenizer, the same kind chatbots use.")}</p>
<div class="nv bn-cc"><img src="{p}assets/nhan-vat/chu-con.svg" alt="" width="64" height="77"><p class="nv-loi"><b>{t("Chữ Con:", "The Token Kids:")}</b> {t("Tụi mình chính là các mảnh đó! Câu nào vào AI cũng bị cắt thành một hàng Chữ Con, rồi AI mới đọc.", "We are those tokens! Every sentence gets cut into a line of Token Kids before the AI reads it.")}</p></div>
<label class="bn-lbl" for="cm-chu">{t("Câu của bạn", "Your sentence")}</label>
<textarea id="cm-chu" class="bn-o" rows="2" maxlength="600">{mau[0][0]}</textarea>
<div class="bn-mau" role="group" aria-label="{t("Câu mẫu", "Sample sentences")}">{nut_mau}</div>
<div class="cm-manh" id="cm-manh" aria-live="polite"></div>
<p class="cm-so" id="cm-so"></p>
<p class="cm-bot" id="cm-bot" aria-live="polite"></p>
<div class="cm-them" id="cm-them" data-cap='{json.dumps([mau[0][0], mau[0][1]], ensure_ascii=False)}'>
<p class="bn-lbl">{t("Cùng một ý, hai thứ tiếng", "Same idea, two languages")}</p>
<div class="cm-hang"><span>{t("Tiếng Việt", "Vietnamese") if LG != "en" else "Vietnamese"}</span><span class="cm-thanh"><i class="{"cm-a" if LG != "en" else "cm-b"}"></i></span><b class="{"cm-a-so" if LG != "en" else "cm-b-so"}"></b></div>
<div class="cm-hang"><span>{t("Tiếng Anh", "English")}</span><span class="cm-thanh"><i class="{"cm-b" if LG != "en" else "cm-a"}"></i></span><b class="{"cm-b-so" if LG != "en" else "cm-a-so"}"></b></div>
<p class="bn-ghi">{t("Tiếng Việt thường tốn nhiều mảnh hơn vì chữ có dấu ít gặp hơn trong dữ liệu học. Nhiều mảnh hơn nghĩa là tốn tiền hơn và nhanh đầy trí nhớ hơn (video 146).", "Vietnamese usually costs more tokens because accented letters are rarer in training data. More tokens means higher cost and a context window that fills up faster (video 146).")}</p>
</div>
<details class="bn-nap"><summary>{t("Mở nắp: mảnh là gì bên trong máy?", "Under the hood: what is a token inside the machine?")}</summary>
<p>{t("Mỗi mảnh là một con số trong một cuốn từ điển khoảng 200 nghìn mục. Chữ hay gặp như “the” chiếm trọn một mục, chữ có dấu ít gặp bị cắt nhỏ. Dấu ◇ là mảnh chỉ mang nửa chữ: một chữ có dấu bị cắt đôi.", "Each token is a number in a vocabulary of about 200,000 entries. Common words like “the” get a whole entry; rarer accented words are cut smaller. A ◇ marks a token that holds only half a character: one accented letter split in two.")}</p>
<label class="bn-chk"><input type="checkbox" id="cm-tt"> {t("Hiện số thứ tự của mỗi mảnh trong từ điển", "Show each token's number in the vocabulary")}</label>
<p>{t("Bộ tách mảnh ở đây là o200k_base, dùng trong các model GPT-4o. Claude, Gemini mỗi hãng có bộ riêng nên số mảnh lệch vài phần, nhưng cách cắt giống nhau về nguyên lý.", "This tokenizer is o200k_base, used by the GPT-4o models. Claude and Gemini each have their own, so counts differ a little, but the idea is the same.")}</p>
</details>
<div class="cm-tien"><label class="bn-lbl" for="cm-gia">{t("Giá ví dụ (đô la cho mỗi triệu mảnh)", "Example price (dollars per million tokens)")}</label>
<input id="cm-gia" class="bn-so-o" type="number" min="0" step="0.1" value="3"><p id="cm-tien" class="bn-ghi"></p>
<p class="bn-ghi">{t("Giá thật mỗi model khác nhau, xem trên trang của nhà cung cấp. Video 60 giải thích vì sao mỗi câu hỏi đều tốn tiền.", "Real prices differ by model; check the provider's page. Video 60 explains why every question costs money.")}</p></div>
</section>'''
    dc = f'''<section class="bn-tram" id="tram-doan-chu" hidden aria-labelledby="h-doan-chu">
<p class="bn-nhan">{t("Trạm 6 · Video 7, 242", "Station 6 · Videos 7, 242")}</p>
<h2 id="h-doan-chu">{t("Tự làm “chatbot”: chọn chữ tiếp theo từng chữ một", "Be the chatbot: pick the next word, one at a time")}</h2>
<p class="bn-mo">{t("Chatbot thật ra chỉ đoán chữ tiếp theo, rồi lặp lại. Gõ vài chữ, máy đưa ra những chữ dễ đến tiếp theo kèm phần trăm. Bấm một chữ để nối vào câu.", "A chatbot really just guesses the next word, then repeats. Type a few words and the machine lists likely next words with their odds. Tap one to add it.")}</p>
<label class="bn-lbl" for="dc-cau">{t("Câu đang viết", "Sentence so far")}</label>
<textarea id="dc-cau" class="bn-o" rows="2">{t("Bạn có thể", "You can")} </textarea>
<p class="dc-cach" id="dc-cach"></p>
<div class="dc-ds" id="dc-ds" aria-live="polite"></div>
<div class="bn-hang"><button type="button" class="btn" id="dc-chay">{t("Tự chạy 12 chữ", "Auto-write 12 words")}</button><button type="button" class="btn btn-nhe" id="dc-lai">{t("Viết lại từ đầu", "Start over")}</button></div>
<details class="bn-nap"><summary>{t("Mở nắp: bộ đoán này học từ đâu?", "Under the hood: where did this guesser learn?")}</summary>
<p>{t(f"Nó đã đọc {D['so_bai']} bài viết và {D['so_kich_ban']} kịch bản của chính kênh Mark học AI (khoảng {round(D['so_chu'] / 1000)} nghìn chữ) và đếm: sau 2 chữ này thì chữ nào hay đến. Vì thế nó viết ra câu có giọng Mark và Bit.", f"It read the {D['so_bai']} articles on this site (about {round(D['so_chu'], -3):,} words) and counted which word tends to follow each pair of words.")}</p>
<p>{t("Chatbot thật học từ hàng nghìn tỷ chữ và nhìn cả đoạn hội thoại dài, không chỉ 2 chữ cuối. Nhìn được cả câu là nhờ attention, trạm 4.", "Real chatbots learn from trillions of words and look at the whole conversation, not just the last 2 words. Seeing the whole sentence is what attention does (station 4).")}</p>
</details>
</section>'''
    vd = [("Hôm nay tôi muốn uống", "Today I want to drink")]
    vq = f'''<section class="bn-tram" id="tram-vong-quay" hidden aria-labelledby="h-vong-quay">
<p class="bn-nhan">{t("Trạm 7 · Video 24", "Station 7 · Video 24")}</p>
<h2 id="h-vong-quay">{t("Vòng quay may mắn: vì sao hỏi 2 lần ra 2 đáp án", "The lucky wheel: why the same question gets two answers")}</h2>
<p class="bn-mo">{t("AI chấm điểm mọi chữ có thể nói tiếp, rồi bốc thăm theo tỉ lệ đó. Ô càng to càng dễ trúng. Núm <b>nhiệt độ</b> làm các ô phình ra hay xẹp lại.", "The AI scores every word it could say next, then draws one by those odds. Bigger slices win more often. The <b>temperature</b> knob makes the slices bulge or even out.")}</p>
<p class="vq-cau" id="vq-cau"></p>
<div class="vq-ban">
<canvas id="vq-ve" width="320" height="320" role="img" aria-label="{t("Vòng quay các chữ có thể nói tiếp", "Wheel of possible next words")}"></canvas>
<div class="vq-ben">
<label class="bn-lbl" for="vq-nhiet">{t("Nhiệt độ", "Temperature")} <b id="vq-nhiet-so"></b></label>
<input type="range" id="vq-nhiet" min="0.1" max="2" step="0.1" value="1">
<p class="bn-ghi" id="vq-giai" aria-live="polite"></p>
<label class="bn-lbl" for="vq-topp">{t("Chỉ giữ các ô lớn (top-p)", "Keep only the big slices (top-p)")} <b id="vq-topp-so"></b></label>
<input type="range" id="vq-topp" min="0.5" max="1" step="0.05" value="1">
<p class="bn-ghi" id="vq-giu"></p>
<div class="bn-hang"><button type="button" class="btn" id="vq-quay">{t("Quay", "Spin")}</button><button type="button" class="btn btn-nhe" id="vq-quay20">{t("Quay 20 lần", "Spin 20 times")}</button><button type="button" class="btn btn-nhe" id="vq-xoa">{t("Xóa đếm", "Clear tally")}</button></div>
<p class="vq-kq" id="vq-dem" aria-live="polite"></p>
</div></div>
<ul class="vq-ds" id="vq-ds"></ul>
<p class="bn-ghi">{t("Vạch mảnh là tỉ lệ ban đầu, cột màu là tỉ lệ sau khi chỉnh nhiệt độ. Số bên phải là số lần đã trúng.", "The thin mark is the original odds; the coloured bar is the odds after temperature. The number on the right counts wins.")}</p>
<div class="bn-hang"><button type="button" class="chip" id="vq-video">{t("Số ví dụ trong video 24", "Example from video 24")}</button><button type="button" class="chip" id="vq-tram6">{t("Lấy tỉ lệ thật từ câu ở trạm 6", "Use real odds from the station 6 sentence")}</button></div>
<p class="bn-ghi" id="vq-nguon"></p>
<details class="bn-nap"><summary>{t("Mở nắp: công thức nhiệt độ", "Under the hood: the temperature formula")}</summary>
<p>{t("Mỗi tỉ lệ được nâng lên lũy thừa 1/nhiệt độ rồi chia lại cho tổng bằng 100%. Nhiệt độ 0,5 làm ô to càng to; nhiệt độ 2 kéo các ô về gần nhau. Top-p giữ nhóm ô lớn nhất cộng lại đủ phần trăm đã chọn, bỏ hết ô nhỏ.", "Each probability is raised to the power 1/temperature, then rescaled to add up to 100%. Temperature 0.5 makes big slices bigger; 2 pulls them together. Top-p keeps the biggest slices that add up to the chosen share and drops the rest.")}</p>
<p>{t("Trong app chat thường không chỉnh được nhiệt độ. Mẹo từ video: việc sáng tạo thì bấm “tạo lại” vài lần rồi chọn ý hay; việc cần chính xác thì bảo AI làm từng bước và tự kiểm lại.", "Chat apps usually hide the temperature. The tip from the video: for creative tasks, regenerate a few times and pick the best; for exact tasks, ask the AI to work step by step and check itself.")}</p>
</details>
</section>'''
    # Trạm 8 Nghĩ trước khi nói (video 26): câu hỏi và giấy nháp viết sẵn ở data/bo-nao/nghi-truoc.json, nhúng vào trang theo ngôn ngữ
    N = load("bo-nao/nghi-truoc")
    ng = "en" if LG == "en" else "vi"
    nt_cau = [{"id": c["id"], "bt": c["bieu_tuong"], "loai": c["loai"][ng], "hoi": c["hoi"][ng], "don_gian": bool(c.get("don_gian")),
               "ngay": {"tl": c["ngay"]["tra_loi"][ng], "dung": c["ngay"]["dung"], "giay": c["ngay"]["giay"], "manh": c["ngay"]["manh"]},
               "nghi": {"buoc": [{"loai": b["loai"], "chu": b[ng]} for b in c["nghi"]["buoc"]], "tl": c["nghi"]["tra_loi"][ng],
                        "giay": c["nghi"]["giay"], "manh": c["nghi"]["manh"]},
               "bai_hoc": c["bai_hoc"][ng]} for c in N["cau"]]
    nt_du = json.dumps({"cau": nt_cau, "nhan": {k: v[ng] for k, v in N["nhan_buoc"].items()}, "p": p},
                       ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    o_cau = "".join(f'<button type="button" class="nt-o-cau" data-nt="{c["id"]}" aria-pressed="{"true" if k == 0 else "false"}">'
                    f'<span class="nt-bt" aria-hidden="true">{c["bt"]}</span><span class="nt-loai">{esc(c["loai"])}</span></button>' for k, c in enumerate(nt_cau))
    def o_do(che):
        return (f'<div class="nt-do" id="nt-do-{che}">'
                f'<div class="nt-dong"><span>⏱ {t("Thời gian", "Time")}</span><span class="nt-thanh"><i class="nt-giay"></i></span><b class="nt-giay-so">–</b></div>'
                f'<div class="nt-dong"><span>🧩 {t("Mảnh", "Tokens")}</span><span class="nt-thanh"><i class="nt-manh"></i></span><b class="nt-manh-so">–</b></div></div>')
    nt = f'''<section class="bn-tram" id="tram-nghi-truoc" hidden aria-labelledby="h-nghi-truoc">
<link rel="stylesheet" href="{p}assets/bo-nao-nghi.css?v=dev">
<p class="bn-nhan">{t("Trạm 8 · Video 26", "Station 8 · Video 26")}</p>
<h2 id="h-nghi-truoc">{t("Nghĩ trước khi nói: trả lời nhanh hay nháp cho kỹ?", "Think before answering: quick reply or careful draft?")}</h2>
<p class="bn-mo">{t("Mô hình suy luận được dạy thêm một việc: <b>viết nháp trước</b>. Chia bài thành từng bước, thử, tự kiểm lại, sai thì sửa, rồi mới trả lời. Chọn một câu hỏi, cho AI trả lời ngay rồi cho nó nghĩ trước, xem bên nào đúng và bên nào tốn hơn.", "Reasoning models are taught one more thing: <b>write a draft first</b>. Break the problem into steps, try, check, fix, and only then answer. Pick a question, let the AI answer right away, then let it think first, and see which one is right and which one costs more.")}</p>
<p class="bn-lbl">{t("1. Chọn một câu hỏi", "1. Pick a question")}</p>
<div class="nt-cau" id="nt-cau" role="group" aria-label="{t("Câu hỏi", "Questions")}">{o_cau}</div>
<p class="nt-de" id="nt-de" aria-live="polite">{esc(nt_cau[0]["hoi"])}</p>
<p class="bn-lbl">{t("2. Cho AI trả lời theo hai cách", "2. Let the AI answer two ways")}</p>
<div class="nt-kq">
<div class="nt-the nt-the-ngay" id="nt-o-ngay">
<button type="button" class="btn nt-nut" id="nt-ngay">⚡ {t("Trả lời ngay", "Answer right away")}</button>
<p class="nt-trong" id="nt-ngay-cho">{t("Đoán từng chữ, chữ nào ra là ra luôn.", "Guesses word by word; whatever comes out stays.")}</p>
<p class="nt-tl" id="nt-ngay-tl" hidden></p>
{o_do("ngay")}
</div>
<div class="nt-the nt-the-nghi" id="nt-o-nghi">
<button type="button" class="btn nt-nut" id="nt-nghi">🧠 {t("Nghĩ trước", "Think first")}</button>
<div class="nt-nhap"><p class="nt-nhap-h">✏️ {t("Giấy nháp", "Scratch paper")} <span id="nt-dang"></span></p><ol class="nt-buoc" id="nt-nhap"></ol>
<p class="nt-trong" id="nt-nghi-cho">{t("Chia bước, thử, kiểm lại, sửa, rồi mới trả lời.", "Break it down, try, check, fix, then answer.")}</p></div>
<p class="nt-tl" id="nt-nghi-tl" hidden></p>
{o_do("nghi")}
</div>
</div>
<div class="nt-bit"><img id="nt-bit-anh" src="{p}assets/bit-giai-thich.svg" alt="" width="56" height="56"><p id="nt-bit" aria-live="polite">{t("Bấm một trong hai nút. Thử cả hai để so.", "Press either button. Try both to compare.")}</p></div>
<p class="nt-tong" id="nt-tong"></p>
<details class="bn-nap"><summary>{t("Mở nắp: khi nào nên bật chế độ suy nghĩ?", "Under the hood: when should you turn thinking on?")}</summary>
<p>{t("Phần nháp cũng là chữ AI viết ra, nên cũng tính tiền theo mảnh và cũng mất thời gian. Vì thế nghĩ trước chậm hơn và tốn hơn.", "The draft is text the AI writes too, so it is billed per token and takes time. That's why thinking first is slower and costs more.")}</p>
<p>{t("Nên bật: toán, câu đố mẹo, đếm, lập kế hoạch, so sánh nhiều lựa chọn. Nên tắt: tra một dữ kiện, dịch một câu, viết lại cho gọn. Trong app chat, đó là nút kiểu “Suy nghĩ”, “Think”, hoặc model có chữ “reasoning”.", "Turn it on for maths, trick questions, counting, planning and comparing many options. Turn it off for looking up a fact, translating a sentence or tidying up text. In chat apps it's a button like “Think”, or a model labelled “reasoning”.")}</p>
</details>
<p class="bn-ghi">{t("Câu trả lời và giấy nháp ở đây được viết sẵn để minh họa, không gọi AI thật. Số giây và số mảnh là số ước lượng cho dễ so.", "The answers and drafts here are pre-written to illustrate the idea; no real AI is called. Seconds and token counts are rough estimates for comparison.")}</p>
<script type="application/json" id="nt-du-lieu">{nt_du}</script>
</section>'''
    tieu = t("Phòng thí nghiệm bộ não AI: tự tay thử token, đoán chữ, nhiệt độ", "AI brain lab: try tokens, next-word guessing and temperature yourself")
    desc = t("Phòng thí nghiệm miễn phí: gõ một câu xem AI cắt thành mảnh nào bằng bộ tách token thật, tự làm chatbot đoán chữ tiếp theo, quay vòng nhiệt độ để hiểu vì sao hỏi 2 lần ra 2 đáp án.",
             "Free hands-on lab: type a sentence and see the real tokenizer split it, build a next-word guesser yourself, and spin the temperature wheel to see why the same question gets two answers.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Phòng thí nghiệm · chạy ngay trên trình duyệt · không gọi AI thật", "Lab · runs in your browser · no real AI calls")}</p>\n'
            f'<h1>{t("Phòng thí nghiệm bộ não AI", "AI brain lab")}</h1>\n'
            f'<p class="lead">{t("Tự tay làm những gì loạt video “Bên trong bộ não AI” giải thích. Chọn một trạm bên trái, mỗi trạm chừng một phút.", "Do by hand what the “Inside the AI brain” videos explain. Pick a station on the left; each takes about a minute.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    main = (f'<main class="bn" id="bn">\n{ngan}\n<div class="bn-ban">\n{cm}\n{dc}\n{vq}\n{nt}\n'
            f'{khoi_chia_se(BASE + GOC + "phong-thi-nghiem-bo-nao.html", tieu, p)}\n'
            f'<p class="gh-ghi">{t("Mọi thứ chạy trên máy bạn, không gọi AI thật và không gửi gì đi đâu. Các trạm còn lại sẽ mở dần cùng các video.", "Everything runs on your device: no real AI calls, nothing is sent anywhere. The remaining stations open over time alongside the videos.")}</p>\n'
            f'<noscript><p>{t("Phòng thí nghiệm cần JavaScript.", "The lab needs JavaScript.")}</p></noscript>\n</div>\n</main>')
    return GOC + "phong-thi-nghiem-bo-nao.html", trang("phong-thi-nghiem-bo-nao.html", f"{tieu} | {SITE}", desc, band, main, p, og_type="website", q="",
                                                       cuoi=f'<script src="{p}bo-nao.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')
# ---------- trò chơi "Bit bắt lỗi" (bit-bat-loi.html): một khuôn tìm chỗ sai, mỗi tập một bộ ca ----------
# Nội dung ở data/bit-bat-loi.json (chữ là [vi, en]), ảnh ở data/bit-bat-loi-hinh/*.svg, cách chơi ở bat-loi.js.
# ?tap=N chơi ngay các ca của video N (khối "Thử 60 giây" trong trang bài mở kiểu này), ?bo=<id> chơi một bộ.
@trang_rieng("bit-bat-loi.html", "0.7")
def tao_bat_loi():
    p = t("", "../")
    D = load("bit-bat-loi")
    L = 0 if LG == "vi" else 1
    chu = lambda x: x[L] if isinstance(x, list) else x
    def video(so):
        v = co_bai.get(so)
        return {"so": so, "ten": seo[str(so)] if v else "", "url": f"bai/{ten_file(v)}.html" if v else ""}
    def hinh(k):
        svg = (R / "data" / "bit-bat-loi-hinh" / f"{k['file']}.svg").read_text(encoding="utf-8").strip()
        for khoa, x in k.get("chu", {}).items():
            svg = svg.replace(f"@{khoa}@", esc(chu(x)))
        assert "@" not in re.sub(r'"[^"]*"', "", svg.split(">", 1)[1]), f"bit-bat-loi: {k['file']}.svg còn chữ @...@ chưa có trong 'chu'"
        return svg.replace(' xmlns="http://www.w3.org/2000/svg"', "", 1)
    def khung(k):
        o = {"loai": k["loai"], "ten": chu(k.get("ten", "")), "phu": chu(k.get("phu", ""))}
        if k["loai"] == "chat":
            o["kieu"] = k.get("kieu", "chat")
            o["dong"] = [{"tu": d["tu"], "doan": [{"chu": x[L] if len(x) > 1 else x[0], "loi": x[2] if len(x) > 2 else ""} for x in d["doan"]]} for d in k["dong"]]
        elif k["loai"] == "hinh":
            o["svg"] = hinh(k)
        else:
            o.update({"tieu_de": chu(k["tieu_de"]), "cot": [[chu(n), v] for n, v in k["cot"]], "tu": k.get("tu", 0),
                      "loi_truc": k.get("loi_truc", ""), "chu_thich": chu(k.get("chu_thich", "")), "loi_chu_thich": k.get("loi_chu_thich", "")})
        return o
    def khoa_trong(k):
        if k["loai"] == "chat":
            return {x[2] for d in k["dong"] for x in d["doan"] if len(x) > 2}
        if k["loai"] == "hinh":
            return set(re.findall(r'data-loi="([^"]+)"', (R / "data" / "bit-bat-loi-hinh" / f"{k['file']}.svg").read_text(encoding="utf-8")))
        return {x for x in (k.get("loi_truc"), k.get("loi_chu_thich")) if x}
    ca = []
    for c in D["ca"]:
        co = set().union(*(khoa_trong(k) for k in c["khung"]))
        assert co == set(c["loi"]), f"bit-bat-loi: ca {c['id']} có chỗ sai {sorted(co)} nhưng lời giải cho {sorted(c['loi'])}"
        ca.append({"id": c["id"], "bo": c["bo"], "video": video(c["video"]), "de": chu(c["de"]),
                   "khung": [khung(k) for k in c["khung"]], "loi": {k: chu(x) for k, x in c["loi"].items()}, "kiem": chu(c["kiem"])})
    bo = [{"id": b["id"], "ten": chu(b["ten"]), "moi": chu(b["moi"]), "mau": b["mau"]} for b in D["bo"]]
    nhan = {
        "ca": t("Ca", "Case"), "tim": t("Tìm", "Find"), "da_bat": t("Đã bắt", "Caught"), "nham": t("Chạm nhầm", "Wrong taps"),
        "huong": t("Chạm thẳng vào chữ hoặc chỗ trên ảnh mà bạn thấy sai.", "Tap the words or the spot in the picture that look wrong."),
        "chiu": t("Chịu, xem đáp án", "I give up, show me"), "on": t("Chỗ này ổn", "This part is fine"),
        "bat_het": t("Bắt hết rồi!", "You caught them all!"), "bat_duoc": t("Bạn bắt được", "You caught"), "bo_sot": t("Bạn bỏ sót", "You missed"),
        "da_tim": t("Bắt được", "Caught"), "cach_kiem": t("Cách kiểm", "How to check"), "tiep": t("Ca tiếp theo", "Next case"), "xem_ket": t("Xem kết quả", "See your result"),
        "xem_video": t("Xem video", "Watch video"), "sap_ra": t("sắp ra mắt", "coming soon"),
        "ai": t("AI trả lời · bản minh họa do kênh viết", "AI answer · example written by the channel"), "ban": t("Bạn", "You"),
        "may_ten": t("Mây Bịa", "Fib Cloud"), "may_noi": t("Câu trả lời này chuẩn 100%, khỏi kiểm tra! (Bit nói nhỏ: Mây Bịa hay bịa lắm, bạn bắt lỗi giúp Bit nhé.)",
                                                          "This answer is 100% right, no need to check! (Bit whispers: Fib Cloud makes things up a lot. Help me catch the mistakes.)"),
        "truc_tu": t("Trục dọc bắt đầu từ", "Vertical axis starts at"), "keo_truc": t("Kéo trục về 0", "Drag the axis to 0"),
        "tai_tro": t("Được tài trợ", "Sponsored"),
        "tron": t("Trộn 8 ca", "Mixed, 8 cases"), "tron_moi": t("Hai ca mỗi bộ, đổi mỗi lần chơi", "Two cases from each set, new every time"),
        "bo_cua": t("Bộ ca của video", "Cases from video"), "choi_bo_khac": t("Chơi bộ khác", "Play another set"), "choi_lai": t("Chơi lại", "Play again"),
        "so_ca": t("ca", "cases"), "loi": t("lỗi", "errors"),
        "hang": [[0.9, t("Mắt thần của Bit", "Bit's eagle eye")], [0.7, t("Thám tử tỉnh táo", "Sharp detective")], [0.4, t("Đang luyện mắt", "Eye in training")], [0, t("Cần soi kỹ hơn", "Look a little closer")]],
        "on_lai": t("Xem lại video cho những ca còn sót", "Rewatch the videos for the cases you missed"), "het_sot": t("Không sót lỗi nào. Gửi thẻ điểm cho bạn bè thử sức!", "Not a single miss. Send your score card to a friend!"),
        "the_diem": t("Thẻ điểm của bạn", "Your score card"), "luu_anh": t("Lưu ảnh", "Save image"), "chia_se_anh": t("Gửi thẻ điểm", "Share score card"),
        "the_kicker": t("BIT BẮT LỖI", "BIT'S ERROR HUNT"), "the_bat": t("lỗi đã bắt", "errors caught"), "the_moi": t("Bạn bắt được mấy lỗi?", "How many can you catch?"),
        "the_file": t("bit-bat-loi-diem", "bit-error-hunt-score"), "url": BASE + GOC + "bit-bat-loi.html",
    }
    du_lieu = json.dumps({"ca": ca, "bo": bo, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    so_ca, so_tap = len(ca), len({c["video"] for c in D["ca"]})
    dem = {b["id"]: sum(c["bo"] == b["id"] for c in ca) for b in bo}
    the_bo = "".join(f'<button type="button" class="bl-bo" data-bo="{b["id"]}" style="--mau:{b["mau"]}"><span class="bl-bo-so">{dem[b["id"]]}<small>{t("ca", "cases")}</small></span>'
                     f'<b>{esc(b["ten"])}</b><span>{esc(b["moi"])}</span></button>' for b in bo)
    desc = t(f"Trò chơi miễn phí: {so_ca} tình huống từ {so_tap} video, chạm vào chỗ sai trong tin nhắn lừa đảo, ảnh lộ thông tin, biểu đồ cắt trục và câu trả lời AI tính sai. Cuối game có thẻ điểm để chia sẻ.",
             f"Free game: {so_ca} cases from {so_tap} videos. Tap the mistake in scam texts, oversharing photos, cut-axis charts and wrong AI answers, then share your score card.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 3 phút · chơi trên điện thoại", "Game · 3 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Bit bắt lỗi", "Bit&#39;s error hunt")}</h1>\n'
            f'<p class="lead">{t("Mỗi ca giấu vài chỗ sai: chữ lừa, chi tiết lộ, trục cắt, phép tính trật. Chạm thẳng vào chỗ đó, Bit chỉ cách kiểm và video để xem lại.", "Every case hides a few mistakes: a scammy line, a leaky detail, a cut axis, a botched sum. Tap right on it, and Bit shows how to check and which video to rewatch.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-giai-thich.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="bl" id="bl">
<section class="bl-mo" id="bl-mo" aria-labelledby="bl-mo-h">
<h2 class="bl-mo-h" id="bl-mo-h">{t("Chọn một bộ ca", "Pick a set")}</h2>
<div class="bl-bo-ds"><button type="button" class="bl-bo bl-bo-tron" data-bo="tron"><span class="bl-bo-so">8<small>{t("ca", "cases")}</small></span><b>{t("Trộn 8 ca", "Mixed, 8 cases")}</b><span>{t("Hai ca mỗi bộ, đổi mỗi lần chơi", "Two cases from each set, new every time")}</span></button>{the_bo}</div>
</section>
<div class="bl-dau" id="bl-dau" hidden><p class="bl-tien" id="bl-tien" aria-live="polite"></p><p class="bl-diem" id="bl-diem"></p></div>
<div class="bl-san" id="bl-san" hidden></div>
<section class="bl-ket" id="bl-ket" hidden aria-live="polite">
<div class="bl-ket-o">
<figure class="bl-the"><img id="bl-the-anh" alt="" width="540" height="675"><figcaption>{t("Thẻ điểm của bạn", "Your score card")}</figcaption></figure>
<div class="bl-ket-ben">
<div class="bl-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="88" height="88"><div><p class="bl-ket-so" id="bl-ket-so"></p><p class="bl-ket-hang" id="bl-ket-hang"></p><p class="bl-ket-phu" id="bl-ket-phu"></p></div></div>
<div class="cta"><button type="button" class="btn btn-yt" id="bl-chia-anh" hidden>{ic(p, "share")}{t("Gửi thẻ điểm", "Share score card")}</button><a class="btn" id="bl-luu-anh" download>{t("Lưu ảnh", "Save image")}</a></div>
<h2 class="bl-ket-h" id="bl-ket-h"></h2>
<div class="bl-ket-video" id="bl-ket-video"></div>
<div class="cta"><button type="button" class="btn" id="bl-lai">{t("Chơi lại", "Play again")}</button><button type="button" class="btn" id="bl-khac">{t("Chơi bộ khác", "Play another set")}</button></div>
</div>
</div>
{khoi_chia_se(BASE + GOC + "bit-bat-loi.html", t("Bit bắt lỗi: bạn bắt được mấy lỗi?", "Bit's error hunt: how many mistakes can you catch?"), p)}
</section>
<p class="bl-ghi">{t("Tên người, trang, cửa hàng, ngân hàng và đường link trong trò chơi đều là hư cấu. Câu trả lời của AI là bản minh họa do kênh viết theo kiểu lỗi AI hay mắc, ảnh do kênh tự vẽ.", "All names, pages, shops, banks and links in this game are made up. AI answers are examples the channel wrote in the style of common AI mistakes, and the pictures are drawn by the channel.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem video", "The game needs JavaScript. You can still watch the video")} <a href="bai/{ten_file(co_bai[226])}.html">{t("Biểu đồ gây hiểu lầm", "Misleading charts")}</a>.</p></noscript>
<script type="application/json" id="bl-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "bit-bat-loi.html", trang("bit-bat-loi.html", t(f"Bit bắt lỗi: trò chơi tìm chỗ sai, lừa đảo, ảnh và AI | {SITE}", f"Bit's error hunt: spot the mistake in scams, photos and AI answers | {SITE}"),
                                           desc, band, main, p, og_type="website", q="",
                                           cuoi=f'<script src="{p}bat-loi.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- mô phỏng "Tự dạy máy lọc hồ sơ" (bo-loc-thien-vi.html): video 118 "AI cũng thiên vị" ----------
# Hồ sơ hư cấu ở data/bo-loc-thien-vi.json, máy học (hồi quy logistic nhỏ) và cách chơi ở bo-loc-thien-vi.js.
@trang_rieng("bo-loc-thien-vi.html", "0.7")
def tao_bo_loc():
    p = t("", "../")
    D = load("bo-loc-thien-vi")
    L = LG
    v = co_bai[118]
    hd = {k: {"chu": x[L], "nu": x["nu"]} for k, x in D["hoat_dong"].items()}
    nhan = {
        "nam": t("Nam", "Male"), "nu": t("Nữ", "Female"), "ky_nang": t("Kỹ năng", "Skills"), "nam_kn": t("năm kinh nghiệm", "years of experience"),
        "da_tuyen": t("Đã tuyển", "Hired"), "khong_tuyen": t("Không tuyển", "Rejected"), "gioi": t("Giỏi nhất", "Top talent"),
        "dac": {"kn": t("Kỹ năng", "Skills"), "exp": t("Kinh nghiệm", "Experience"), "nam": t("Là nam", "Is male"), "nu": t("Có chữ “nữ” trong hồ sơ", "Says “women's” on the CV")},
        "da_giau": t("đã giấu", "hidden"),
        "ts_chu": t("Thanh xanh: máy cộng điểm. Thanh đỏ: máy trừ điểm. Máy tự rút ra từ hồ sơ cũ, không ai dạy nó luật này.", "Green bar: the machine adds points. Red bar: it takes points away. It worked this out from the old CVs; nobody wrote these rules."),
        "nu_duoc_moi": t("Nữ được mời phỏng vấn", "Women invited to interview"), "gioi_bi_loai": t("Người giỏi nhất bị loại", "Top candidates rejected"),
        "moi_pv": t("Mời phỏng vấn", "Invite to interview"), "bi_loai": t("Bị loại", "Rejected"),
        "cham_the": t("Chạm vào một hồ sơ để xem máy cộng, trừ điểm vì sao.", "Tap a CV to see why the machine added or took away points."),
        "vi_sao": t("Máy chấm điểm như sau:", "How the machine scored it:"),
        "b1": t("Hồ sơ năm ngoái", "Last year's CVs"),
        "b1_lead": t("Công ty Sao Mai (hư cấu) muốn có máy tự lọc hồ sơ. Họ đưa máy xem 20 hồ sơ năm ngoái và ai đã được tuyển. Năm ngoái, người tuyển dụng thường chọn nam.",
                     "Sao Mai Ltd. (made up) wants a machine to screen CVs. It shows the machine 20 CVs from last year and who got hired. Last year, the recruiters mostly picked men."),
        "nam_tuyen": t("Nam được tuyển", "Men hired"), "nu_tuyen": t("Nữ được tuyển", "Women hired"),
        "day_may": t("Dạy máy học 20 hồ sơ này", "Train the machine on these 20 CVs"),
        "b2": t("Máy học được gì?", "What did the machine learn?"),
        "b2_lead": t("Máy không được dặn phải thích nam. Nó chỉ tìm điểm chung của những người từng được tuyển. Giờ có 8 hồ sơ mới, máy chọn 4 người đi phỏng vấn.",
                     "Nobody told the machine to prefer men. It just looked for what past hires had in common. Now 8 new CVs arrive and it picks 4 people to interview."),
        "moi_nop": t("8 hồ sơ mới nộp", "8 new applications"),
        "b2_bit": t("Máy loại những người giỏi nhất, vì hồ sơ của họ không giống người được tuyển năm ngoái. AI không cố ý thiên vị, nó học lại đúng cái lệch có sẵn trong dữ liệu.",
                    "The machine rejected some of the strongest people because their CVs don't look like last year's hires. AI isn't biased on purpose; it copies the skew already in the data."),
        "sua_may": t("Thử sửa bộ lọc", "Try to fix the filter"),
        "b3": t("Sửa bộ lọc", "Fix the filter"),
        "b3_lead": t("Bật, tắt từng cách sửa. Máy học lại ngay và chọn lại 4 người. Mục tiêu: không bỏ sót người giỏi nhất.",
                     "Switch each fix on or off. The machine retrains instantly and picks 4 people again. Goal: don't miss the top candidates."),
        "hoi": t("Đoán trước: chỉ cần giấu ô giới tính là máy hết thiên vị?", "Guess first: does hiding the gender box make the machine fair?"),
        "hoi_het": t("Hết thiên vị", "Yes, it's fair"), "hoi_chua": t("Chưa hết", "Not yet"),
        "hoi_dung": t("Đoán đúng!", "Good call!"), "hoi_sai": t("Chưa đúng!", "Not quite!"),
        "hoi_giai": t("Hồ sơ vẫn còn chữ như “CLB cờ vua nữ”. Máy học được chữ đó đi kèm với “không tuyển”, nên vẫn trừ điểm. Bật thử từng cách bên dưới để xem.",
                      "CVs still say things like “women's chess club”. The machine learned that word goes with “not hired”, so it still takes points off. Try each fix below."),
        "cong_an": t("Giấu ô giới tính", "Hide the gender box"), "cong_an_phu": t("Máy không được thấy nam hay nữ", "The machine can't see male or female"),
        "cong_xoa": t("Xóa chữ lộ giới tính", "Remove gender giveaways"), "cong_xoa_phu": t("Bỏ chữ “nữ” trong tên câu lạc bộ, giải thưởng", "Strip “women's” from clubs and awards"),
        "cong_them": t("Thêm 28 hồ sơ tuyển công bằng", "Add 28 fairly hired CVs"), "cong_them_phu": t("Hồ sơ 3 năm gần đây, tuyển theo năng lực", "From the last 3 years, hired on skill"),
        "nx_goc": t("Chưa sửa gì: máy vẫn học theo cái lệch năm ngoái.", "No fix yet: the machine still copies last year's skew."),
        "nx_an": t("Giấu ô giới tính chưa đủ: máy chuyển sang trừ điểm chữ “nữ” trong hồ sơ.", "Hiding gender isn't enough: the machine now punishes the word “women's” instead."),
        "nx_xoa": t("Xóa chữ “nữ” mà máy vẫn thấy ô giới tính, nên nó trừ thẳng vào đó.", "The word is gone, but the machine can still see the gender box, so it punishes that directly."),
        "nx_them": t("Dữ liệu công bằng hơn giúp được một phần, nhưng cái lệch cũ vẫn còn kéo điểm.", "Fairer data helps, but the old skew still drags scores down."),
        "nx_tot": t("Máy giờ chọn theo kỹ năng và kinh nghiệm. Không bỏ sót người giỏi nào.", "The machine now picks on skills and experience. No top candidate missed."),
        "b4": t("Sửa được rồi! Nhưng người thật vẫn phải xem lại.", "Fixed! But a real person still needs to check."),
        "b4_chu": t("Ngoài đời, dấu vết giới tính, tuổi, quê quán nằm ở rất nhiều chỗ khó thấy. Với việc quyết định về con người như tuyển dụng hay cho vay, để AI gợi ý, còn người thật xem lại và chịu trách nhiệm.",
                    "In real life, clues about gender, age or hometown hide in many places. For decisions about people, like hiring or loans, let AI suggest and have a real person review and take responsibility."),
        "xem_ket": t("Xem kết quả", "See your result"),
        "ket_phu": t("Nữ được mời phỏng vấn: {a} → {b} người", "Women invited to interview: {a} → {b}"),
    }
    du_lieu = json.dumps({"ho_so_cu": D["ho_so_cu"], "them": D["them"], "ho_so_moi": D["ho_so_moi"], "so_moi": D["so_moi"], "hoat_dong": hd, "nhan": nhan, "p": p},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Mô phỏng miễn phí: tự dạy một máy lọc hồ sơ bằng 20 hồ sơ cũ, xem nó loại người giỏi vì giống dữ liệu năm ngoái, rồi thử sửa cho công bằng. Hiểu bias (thiên kiến) của AI trong 3 phút.",
             "Free simulation: train a CV-screening machine on 20 old CVs, watch it reject strong candidates because they don't match last year's hires, then try to make it fair. Understand AI bias in 3 minutes.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Mô phỏng · 3 phút · chơi trên điện thoại", "Simulation · 3 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Tự dạy máy lọc hồ sơ", "Train a CV filter")}</h1>\n'
            f'<p class="lead">{t("Cho máy học hồ sơ năm ngoái, xem nó chọn ai đi phỏng vấn, rồi tìm cách sửa khi nó thiên vị.", "Teach a machine with last year&#39;s CVs, see who it picks for interviews, then find a way to fix it when it turns out biased.")}</p>\n'
            f'</div><img class="head-art head-nv" src="{p}assets/nhan-vat/nhai.svg" alt="{t("Nhai, con quái vật ăn dữ liệu", "Munch, the data-eating monster")}" width="180" height="216"></div>')
    rut = [("1", t("Máy học lại cái lệch cũ", "It copies the old skew"), t("Dữ liệu năm ngoái lệch thì máy lệch theo, dù không ai dặn.", "Skewed history makes a skewed machine, even if nobody asked.")),
           ("2", t("Giấu một ô là chưa đủ", "Hiding one box isn't enough"), t("Máy tìm ra dấu vết khác, như chữ “nữ” trong hồ sơ.", "It finds other clues, like the word “women's”.")),
           ("3", t("Dữ liệu sạch, người thật duyệt", "Clean data, human review"), t("Quyết định về con người: AI gợi ý, người chịu trách nhiệm.", "Decisions about people: AI suggests, a person decides."))]
    the_rut = "".join(f'<div class="tv-rut"><span class="tv-so">{s}</span><b>{a}</b><p>{b}</p></div>' for s, a, b in rut)
    main = f"""<main class="tv" id="tv">
<div class="tv-san" id="tv-san"></div>
<section class="tv-ket" id="tv-ket" hidden aria-live="polite">
<div class="ld-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="ld-ket-so" id="tv-ket-so"></p><p class="ld-ket-hang">{t("Người giỏi nhất bị loại", "Top candidates rejected")}</p><p class="ld-ket-phu" id="tv-ket-phu"></p></div></div>
<h2 class="ld-ket-h">{t("Ba điều rút ra", "Three takeaways")}</h2>
<div class="tv-rut-ds">{the_rut}</div>
<h2 class="ld-ket-h">{t("Xem video của bài này", "Watch the video")}</h2>
<div class="ld-ket-video"><a class="ld-vid" id="tv-xem-video" href="bai/{ten_file(v)}.html"><span class="ld-vid-so">#118</span><b>{esc(seo["118"])}</b></a></div>
<div class="cta"><button type="button" class="btn" id="tv-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "bo-loc-thien-vi.html", t("Tự dạy máy lọc hồ sơ: xem AI thiên vị ra sao", "Train a CV filter and watch AI bias happen"), p)}
</section>
<p class="ld-ghi">{t("Công ty, tên người và hồ sơ đều là hư cấu. Máy trong trang là một mô hình học máy nhỏ chạy ngay trên trình duyệt của bạn, không gọi AI thật.", "The company, names and CVs are made up. The machine here is a tiny machine learning model running in your browser; no real AI is called.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Mô phỏng cần JavaScript. Bạn vẫn có thể xem", "The simulation needs JavaScript. You can still watch")} <a href="bai/{ten_file(v)}.html">{t("video AI cũng thiên vị", "the AI bias video")}</a>.</p></noscript>
<script type="application/json" id="tv-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "bo-loc-thien-vi.html", trang("bo-loc-thien-vi.html", t(f"Tự dạy máy lọc hồ sơ: mô phỏng AI thiên vị (bias) | {SITE}", f"Train a CV filter: an AI bias simulation | {SITE}"),
                                               desc, band, main, p, og_type="website", q="",
                                               cuoi=f'<script src="{p}bo-loc-thien-vi.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- trò chơi "Dán hay không dán?" (dan-hay-khong.html): video 121 "Dữ liệu của bạn đi đâu khi chat với AI" ----------
# Thẻ ở data/dan-hay-khong.json (cả hai ngôn ngữ), cách chơi ở dan-hay-khong.js. Tên, số, địa chỉ trong thẻ đều hư cấu.
@trang_rieng("dan-hay-khong.html", "0.7")
def tao_dan_hay_khong():
    p = t("", "../")
    D = load("dan-hay-khong")
    L = LG
    the = [{"id": c["id"], "dap_an": c["dap_an"], "viec": c["viec"][L], "giai": c["giai"][L],
            "doan": [dict({"chu": x[L]}, **({"thay": x["thay"][L]} if "thay" in x else {}), **({"nhay": 1} if x.get("nhay") else {})) for x in c["doan"]]}
           for c in D["the"]]
    n = len(the)
    nhan = {
        "the": t("Thẻ", "Card"), "diem": t("Điểm", "Score"), "tro_ly": t("Nhai, trợ lý AI", "Munch, the AI assistant"), "tk_ca_nhan": t("Tài khoản cá nhân", "Personal account"),
        "ban_dinh": t("Bạn định nhờ:", "You want to:"), "dang_dan": t("Đang dán vào ô chat", "About to paste"),
        "hoi": t("Dán đoạn này vào chatbot được không?", "Can you paste this into the chatbot?"),
        "dan": t("Dán thoải mái", "Paste it"), "che": t("Che bớt rồi dán", "Mask, then paste"), "khong": t("Đừng dán", "Don't paste"),
        "da_che": t("Đã che, dán được", "Masked, safe to paste"), "an_toan": t("An toàn", "Safe"),
        "dung": t("Chuẩn rồi!", "Spot on!"), "sai": t("Chưa đúng!", "Not quite!"),
        "tiep": t("Thẻ tiếp theo", "Next card"), "xem_ket": t("Xem kết quả", "See your result"),
        "hang": [[n, t("Người giữ kín bậc thầy", "Privacy pro")], [round(n * .75), t("Khá cẩn thận", "Pretty careful")], [0, t("Nên ôn lại một chút", "Worth a quick refresher")]],
        "lu": t("Gâu gâu! Khoan dán đã. Trong đoạn này có thứ không được cho Nhai ăn, che đi hoặc giữ lại nhé.", "Woof! Hold on. There’s something in here Munch must not eat. Mask it or keep it to yourself."),
        "sai_nhieu": t("Bạn còn nhầm ở nhóm:", "You slipped on:"), "het_sai": t("Bạn không nhầm thẻ nào. Gửi trò này cho đồng nghiệp thử xem!", "No slip-ups. Send this to a colleague!"),
    }
    du_lieu = json.dumps({"the": the, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t(f"Trò chơi miễn phí: {n} thứ bạn định dán vào chatbot AI, từ bảng lương, mã OTP tới kết quả xét nghiệm. Chọn dán thoải mái, che bớt rồi dán, hay đừng dán, và xem cách che dữ liệu mà AI vẫn làm đúng việc.",
             f"Free game: {n} things you might paste into an AI chatbot, from payroll and OTP codes to a blood test. Pick paste, mask then paste, or don't paste, and learn how to mask data so the AI still does the job.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 2 phút · chơi trên điện thoại", "Game · 2 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Dán hay không dán?", "Paste or don&#39;t paste?")}</h1>\n'
            f'<p class="lead">{t(f"{n} thứ bạn định dán vào chatbot. Chọn dán thoải mái, che bớt rồi dán, hay đừng dán. Xem tận mắt cách che tên thật mà AI vẫn làm đúng việc.", f"{n} things you might paste into a chatbot. Pick paste, mask then paste, or don&#39;t paste. See how masking real names still lets the AI do the job.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    thoi_quen = [("✂️", t("Che trước khi dán", "Mask before pasting"), t("Tên thật thành Nhân viên A, B, C; địa chỉ thành [địa chỉ].", "Real names become Employee A, B, C; addresses become [address].")),
                 ("🕶️", t("Dùng chat tạm thời", "Use temporary chat"), t("Cuộc trò chuyện không nằm lại trong lịch sử.", "The chat doesn't stay in your history.")),
                 ("🏢", t("Việc công ty, tài khoản công ty", "Work data, work account"), t("Loại tài khoản cam kết không dùng dữ liệu để huấn luyện.", "One that promises not to train on your data."))]
    the_tq = "".join(f'<div class="tv-rut"><span class="tv-so" aria-hidden="true">{a}</span><b>{b}</b><p>{c}</p></div>' for a, b, c in thoi_quen)
    vids = "".join(f'<a class="ld-vid" data-so-video="{so}" href="bai/{ten_file(co_bai[so])}.html"><span class="ld-vid-so">#{so}</span><b>{esc(seo[str(so)])}</b></a>' for so in (121, 15))
    main = f"""<main class="ld dk" id="dk">
<div class="ld-dau"><p class="ld-tien" id="dk-tien" aria-live="polite"></p><p class="ld-diem" id="dk-diem"></p></div>
<div class="ld-san" id="dk-san"></div>
<section class="ld-ket" id="dk-ket" hidden aria-live="polite">
<div class="ld-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="ld-ket-so" id="dk-ket-so"></p><p class="ld-ket-hang" id="dk-ket-hang"></p><p class="ld-ket-phu" id="dk-ket-phu"></p></div></div>
<h2 class="ld-ket-h">{t("Ba thói quen giữ dữ liệu an toàn", "Three habits that keep your data safe")}</h2>
<div class="tv-rut-ds">{the_tq}</div>
<label class="dk-viec-30"><input type="checkbox" id="dk-cai-dat"><span><b>{t("Việc 30 giây:", "30-second task:")}</b> {t("mở Settings của ứng dụng AI bạn dùng, tìm mục Privacy hay Data controls, chọn có cho dùng cuộc trò chuyện để huấn luyện hay không.", "open Settings in the AI app you use, find Privacy or Data controls, and choose whether your chats can be used for training.")}</span></label>
<h2 class="ld-ket-h">{t("Xem lại video", "Watch the videos")}</h2>
<div class="ld-ket-video">{vids}</div>
<div class="cta"><button type="button" class="btn" id="dk-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "dan-hay-khong.html", t("Dán hay không dán? Thử xem bạn có lỡ dán nhầm gì vào AI", "Paste or don't paste? See what you shouldn't share with AI"), p)}
</section>
<p class="ld-ghi">{t("Mọi tên người, số, địa chỉ và công ty trong trò chơi đều là hư cấu. Trò chơi không gọi AI thật.", "All names, numbers, addresses and companies in this game are made up. No real AI is called.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem", "The game needs JavaScript. You can still watch")} <a href="bai/{ten_file(co_bai[121])}.html">{t("video Dữ liệu của bạn đi đâu", "the video on where your data goes")}</a>.</p></noscript>
<script type="application/json" id="dk-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "dan-hay-khong.html", trang("dan-hay-khong.html", t(f"Dán hay không dán? Trò chơi giữ dữ liệu an toàn khi dùng AI | {SITE}", f"Paste or don't paste? A game about keeping your data safe with AI | {SITE}"),
                                             desc, band, main, p, og_type="website", q="",
                                             cuoi=f'<script src="{p}chia-se.js?v=dev" defer></script>\n<script src="{p}dan-hay-khong.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')
# ---------- Máy tính đời thật (may-tinh-doi-that.html): 7 máy tính theo video, mỗi máy hiện công thức và nguồn ----------
# Hằng số và nguồn ở data/may-tinh.json (cả hai ngôn ngữ), cách tính ở may-tinh.js. Mở thẳng một máy bằng ?may=<id>.
@trang_rieng("may-tinh-doi-that.html", "0.7")
def tao_may_tinh():
    p = t("", "../")
    D = load("may-tinh")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x
    def video(so):
        v = co_bai.get(so)
        return {"so": so, "ten": seo.get(str(so), ""), "url": f"bai/{ten_file(v)}.html" if v else ""}
    may = []
    for m in D["may"]:
        x = {k: m[k] for k in m if k not in ("ten", "ngan", "mo", "nguon", "prompt", "video", "mau", "vi_du", "doc", "loai")}
        x.update({"ten": chu(m["ten"]), "ngan": chu(m["ngan"]), "mo": chu(m["mo"]), "prompt": chu(m["prompt"]),
                  "video": [video(so) for so in m["video"]],
                  "nguon": [{"ten": chu(n["ten"]), "so": chu(n["so"]), "url": n["url"]} for n in m["nguon"]]})
        if "mau" in m:
            x["mau"] = {k: dict(v, ten=chu(v["ten"])) for k, v in m["mau"].items()}
        if "vi_du" in m:  # câu ghi thay cho "Số trong ô là số ví dụ của video"
            x["vi_du"] = chu(m["vi_du"])
        if "doc" in m:  # link đọc thêm (vd. Bài báo AI) cạnh số video
            x["doc"] = {"url": m["doc"]["url"], "ten": chu(m["doc"]["ten"])}
        if "loai" in m:
            x["loai"] = {k: chu(v) for k, v in m["loai"].items()}
        may.append(x)
    nhan = {
        "dong": {k: chu(v) for k, v in D["nhan_dong"].items()},
        "cong_thuc": t("Công thức", "Formula"), "nguon": t("Nguồn số liệu", "Sources"), "vi_du": t("Số trong ô là số ví dụ của video. Thay bằng số của bạn.", "The numbers in the boxes are the video's examples. Swap in your own."),
        "xem_video": t("Xem video", "Watch video"), "sap_ra": t("Video sắp ra", "Video coming soon"),
        "chep": t("Chép câu lệnh", "Copy prompt"), "da_chep": t("Đã chép!", "Copied!"), "prompt_h": t("Nhờ AI kiểm lại cho số thật của bạn", "Ask AI to check it with your real numbers"),
        "prompt_meo": t("AI đoán chữ chứ không bấm máy tính, nên nhờ nó viết công thức rồi để bảng tính tự cộng.", "AI predicts words, it doesn't calculate, so have it write formulas and let the spreadsheet add up."),
        "d": "đ", "nam": t("năm", "year"), "thang": t("tháng", "months"), "thang1": t("tháng", "month"),
        # điện nước
        "dn_chu": t("Câu hỏi bằng chữ mỗi ngày", "Text questions per day"), "dn_anh": t("Ảnh AI tạo mỗi ngày", "AI images per day"), "dn_video": t("Video 5 giây mỗi tuần", "5-second videos per week"),
        "dn_uoc": t("Số đo của ai cho câu hỏi chữ?", "Whose figure for a text question?"), "dn_google": "Google (0,24 Wh)" if L == "vi" else "Google (0.24 Wh)", "dn_openai": "OpenAI (0,34 Wh)" if L == "vi" else "OpenAI (0.34 Wh)",
        "dn_dien": t("Điện cả năm", "Power per year"), "dn_tien": t("Tiền điện cả năm", "Power bill per year"), "dn_am": t("Bằng số ấm nước sôi", "Kettles boiled"), "dn_nuoc": t("Nước làm mát cả năm", "Cooling water per year"),
        "dn_chia": t("Phần điện theo loại", "Where the power goes"), "dn_loai": [t("Chữ", "Text"), t("Ảnh", "Images"), t("Video", "Video")],
        "dn_1video": t("1 video 5 giây tốn điện bằng", "One 5-second video uses as much power as"), "dn_cau": t("câu hỏi chữ", "text questions"),
        "dn_the_gioi": t("Cả thế giới: điện cho trung tâm dữ liệu", "The whole world: data-centre electricity"), "dn_nuoc_ghi": t("Nước chỉ tính cho câu hỏi chữ: chưa có số công bố cho ảnh, video.", "Water counts text questions only: no published figure for images or video yet."),
        "dn_giot": t("giọt", "drops"), "dn_am_don": t("ấm 1 lít", "1-litre kettles"),
        # lãi vay
        "lv_tien": t("Số tiền vay", "Loan amount"), "lv_lai": t("Lãi quảng cáo (%/tháng)", "Advertised rate (% per month)"), "lv_ky": t("Số tháng trả góp", "Months to repay"), "lv_phi": t("Phí trừ ngay khi giải ngân (%)", "Fees taken at payout (%)"),
        "lv_cach": t("Lãi tính trên", "Interest charged on"), "lv_phang": t("Dư nợ ban đầu", "Original amount"), "lv_giam": t("Dư nợ giảm dần", "Declining balance"),
        "lv_moi_thang": t("Trả mỗi tháng", "Monthly payment"), "lv_tong": t("Tổng phải trả", "Total repaid"), "lv_lai_phi": t("Lãi và phí", "Interest and fees"),
        "lv_qc": t("Quảng cáo nhân 12", "Advert × 12"), "lv_that": t("Lãi thật mỗi năm", "Real yearly rate"), "lv_nam": t("%/năm", "%/year"),
        "lv_bieu": t("Tiền lãi từng tháng", "Interest each month"), "lv_bieu_phang": t("Tính trên dư nợ ban đầu", "On the original amount"), "lv_bieu_giam": t("Nếu tính trên dư nợ còn lại", "If charged on what's left"),
        "lv_tran": t("Trên 20%/năm: nếu bên cho vay không phải ngân hàng hay công ty tài chính, mức này vượt trần lãi của Bộ luật Dân sự.", "Above 20% a year: if the lender isn't a bank or finance company, this exceeds the Civil Code's interest cap."),
        "lv_ghi": t("Chỉ để học cách đọc giấy tờ vay, không phải lời khuyên tài chính. Hỏi lại ngân hàng con số trong hợp đồng của bạn.", "For learning to read loan papers only, not financial advice. Check the figures in your own contract with the lender."),
        # quỹ khẩn cấp
        "qk_chi": t("Chi thiết yếu mỗi tháng", "Essential costs per month"), "qk_thang": t("Phòng thân bao nhiêu tháng", "Months to cover"), "qk_co": t("Đã có sẵn", "Already saved"),
        "qk_ke_hoach": t("Muốn đủ trong (tháng)", "Reach it within (months)"), "qk_de_duoc": t("Hoặc: mỗi tháng để được", "Or: you can save per month"),
        "qk_tong_chi": t("Chi thiết yếu một tháng", "Essentials per month"), "qk_muc_tieu": t("Mục tiêu quỹ", "Fund target"), "qk_moi_thang": t("Cần để dành mỗi tháng", "Save per month"), "qk_bao_lau": t("Để vậy thì đủ sau", "At that pace, done in"),
        "qk_goi_y": t("Nhiều nguồn khuyên 3 đến 6 tháng. Có người phụ thuộc hay thu nhập không đều thì để nhiều hơn.", "Most sources say 3 to 6 months. More if others depend on you or your income is irregular."),
        "qk_ghi": t("Chỉ ghi số tiền, đừng ghi số tài khoản. Gửi tiền ở đâu thì hỏi người có chuyên môn.", "Write amounts only, never account numbers. Ask a professional where to keep the money."),
        "qk_du": t("Đã đủ quỹ!", "Fund complete!"),
        # mâm cưới
        "mc_gia": t("Giá mâm trên thực đơn", "Menu price per table"), "mc_phu_phi": t("Phụ phí phục vụ (%)", "Service surcharge (%)"), "mc_bia": t("Bia nước mỗi mâm", "Drinks per table"),
        "mc_mam": t("Số mâm", "Tables"), "mc_ngan_sach": t("Ngân sách", "Budget"), "mc_co_dinh": t("Khoản cố định (thêm khách không đổi)", "Fixed costs (don't change with guests)"),
        "mc_that": t("Giá thật mỗi mâm", "Real cost per table"), "mc_tong": t("Tổng thật", "Real total"), "mc_ngay_tho": t("Chỉ nhân giá thực đơn", "Menu price × tables only"),
        "mc_thieu": t("Thiếu so với tổng thật", "Short of the real total"), "mc_con": t("Còn lại", "Left over"), "mc_vuot": t("Vượt ngân sách", "Over budget"), "mc_them": t("Đủ thêm tối đa", "Room for up to"), "mc_mam_don": t("mâm", "tables"),
        "mc_thanh": [t("Cố định", "Fixed"), t("Theo mâm", "Per table"), t("Còn trống", "Spare")],
        "mc_ghi": t("Phụ phí và bia nước tính thế nào tùy hợp đồng từng nhà hàng. Hỏi rõ trước khi ký.", "How surcharges and drinks are billed depends on each venue's contract. Ask before signing."),
        # xếp bàn
        "xb_ghe": t("Mỗi bàn ngồi", "Seats per table"), "xb_cong": t("Cộng thẳng 3 danh sách (chưa lọc trùng)", "Three lists added up (before removing duplicates)"), "xb_nguoi": t("người", "people"),
        "xb_nhom": t("Số người thật từng nhóm (đã lọc trùng)", "Real headcount per group (duplicates removed)"),
        "xb_tu_do": t("Ngồi tự do", "Anyone anywhere"), "xb_rieng": t("Mỗi nhóm bàn riêng", "Each group on its own"), "xb_ghep": t("Ghép người lẻ cùng phía", "Same-side leftovers share"),
        "xb_ban": t("bàn", "tables"), "xb_tong": t("Tổng khách thật", "Real guest total"), "xb_du": t("Cộng thẳng là dư", "Adding lists straight up over-books"), "xb_tien": t("tiền oan, tính theo giá thật mỗi mâm", "wasted, at the real cost per table"),
        "xb_so_do": t("Sơ đồ bàn (ghép người lẻ cùng phía)", "Table map (same-side leftovers share)"), "xb_le": t("bàn ghép", "shared table"),
        # giá vốn
        "gv_mau": t("Chọn mẫu", "Pick an example"), "gv_dong": t("Chi cho một cái", "Cost lines for one item"), "gv_hong": t("Cứ bao nhiêu cái thì hỏng 1 (0 = không hỏng)", "One spoiled in every … (0 = none)"),
        "gv_gia_ban": t("Giá bán", "Selling price"), "gv_phi": t("Phí sàn (%)", "Marketplace fee (%)"), "gv_von": t("Vốn ban đầu (dụng cụ, làm thử, chụp ảnh)", "Starting capital (tools, test batches, photos)"),
        "gv_gia_von": t("Giá vốn một cái", "Unit cost"), "gv_loi": t("Dư mỗi cái", "Profit per item"), "gv_hoa_von": t("Bán bao nhiêu thì hòa vốn", "Sales to break even"), "gv_cai": t("cái", "items"),
        "gv_lo": t("Lỗ mỗi cái, không bao giờ hòa vốn", "Losing money on every item: never breaks even"),
        "gv_nham": t("Lỗi hay gặp: chỉ cộng nguyên liệu chính", "Common mistake: adding only the main ingredients"), "gv_tuong": t("tưởng dư", "you think you make"),
        "gv_san": t("Thử bán trên sàn, phí 15% (giả định)", "Try a marketplace at 15% fee (assumed)"),
        "gv_ghi": t("Phí sàn 15% là giả định để minh họa, không phải biểu phí của sàn nào.", "The 15% fee is an assumption for illustration, not any marketplace's real rate."),
        # tự đo AI (thí nghiệm METR, video 407)
        "td_demo": t("Thử nhanh 1 phút", "Quick 1-minute demo"), "td_xoa": t("Xóa làm lại", "Clear and restart"),
        "td_xoa_hoi": t("Bấm lần nữa để xóa hết", "Click again to delete everything"),
        "td_dang_demo": t("Bạn đang xem dữ liệu mẫu: 10 email, 5 có AI, 5 tự làm.", "You're looking at sample data: 10 emails, 5 with AI, 5 without."),
        "td_ve_cua_toi": t("Quay lại dữ liệu của tôi", "Back to my data"),
        "td_b1": t("Đoán trước khi làm", "Guess before you start"), "td_b1_mo": t("AI sẽ giúp bạn nhanh hơn bao nhiêu phần trăm? Số âm là chậm hơn.", "How many percent faster will AI make you? Negative means slower."),
        "td_chua_doan": t("Chưa ghi", "Not yet"),
        "td_b2": t("Chọn việc giống nhau, rồi tung đồng xu", "Pick similar tasks, then flip a coin"),
        "td_b2_mo": t("Chọn loại việc bạn làm hằng tuần. Đổi tên từng việc cho đúng việc thật.", "Pick a kind of task you do every week. Rename each one to match the real task."),
        "td_loai": t("Loại việc", "Kind of task"), "td_ten_viec": t("Tên việc", "Task name"), "td_them": t("Thêm việc", "Add a task"), "td_bo": t("Bỏ việc này", "Remove this task"),
        "td_tung": t("Tung đồng xu", "Flip the coin"), "td_tung_lai": t("Tung lại", "Flip again"),
        "td_tung_khoa": t("Đã bắt đầu bấm giờ nên không tung lại, để chia việc vẫn công bằng.", "Timing has started, so no re-flips: that keeps the split fair."),
        "td_ai": t("Dùng AI", "With AI"), "td_tu": t("Tự làm", "Without AI"), "td_chua": t("Chưa tung", "Not flipped"),
        "td_b3": t("Bấm giờ từng việc", "Time each task"),
        "td_b3_mo": t("Tính cả lúc viết prompt, chờ AI và sửa lại kết quả. Quên bấm thì gõ số phút.", "Include writing the prompt, waiting for AI and fixing its output. Forgot the timer? Type the minutes."),
        "td_bat_dau": t("Bắt đầu", "Start"), "td_dung": t("Dừng", "Stop"), "td_phut": t("phút", "min"), "td_go_phut": t("Số phút", "Minutes"),
        "td_cam": t("Làm xong, bạn thấy AI giúp thế nào so với tự làm?", "Done. Compared with doing it yourself, how did AI feel?"),
        "td_cham": t("chậm hơn", "slower"), "td_nhanh": t("nhanh hơn", "faster"), "td_nhu_nhau": t("như nhau", "same"),
        "td_can_tung": t("Tung đồng xu ở bước 2 để biết việc nào dùng AI.", "Flip the coin in step 2 to see which tasks use AI."),
        "td_tien_do": t("Đã đo", "Timed"),
        "td_doan": t("Đoán", "Guess"), "td_tuong": t("Tưởng", "Felt"), "td_dong_ho": t("Đồng hồ", "Clock"),
        "td_doan_phu": t("trước khi làm", "before starting"), "td_tuong_phu": t("cảm giác sau khi làm", "how it felt after"), "td_dong_ho_phu": t("trung vị số phút đo được", "median of measured minutes"),
        "td_metr": "METR", "td_ban": t("Bạn", "You"),
        "td_ket_h": t("Đồng hồ nói gì", "What the clock says"),
        "td_so_sanh": t("Bạn và 16 lập trình viên của METR", "You vs METR's 16 developers"),
        "td_phut_h": t("Số phút từng việc", "Minutes per task"), "td_trung_vi": t("trung vị", "median"),
        "td_canh": t("Mới có {ai} việc dùng AI và {tu} việc tự làm có số phút. Cần ít nhất {n} việc mỗi nhóm thì kết quả mới đáng tin một chút.", "Only {ai} AI tasks and {tu} non-AI tasks have times so far. You need at least {n} per group before the result means much."),
        "td_chua_co": t("Chưa có số đo. Làm vài việc rồi quay lại, hoặc bấm Thử nhanh 1 phút để xem mẫu.", "No measurements yet. Do a few tasks and come back, or press Quick 1-minute demo to see an example."),
        "td_lech": t("Cảm giác lệch đồng hồ {d} điểm phần trăm.", "Your feeling is {d} percentage points off the clock."),
        "td_ket_nhanh": t("Với loại việc này, AI giúp bạn nhanh hơn thật. Lưu prompt thành mẫu để dùng lại.", "For this kind of task AI really speeds you up. Save the prompt as a template."),
        "td_ket_cham": t("Với loại việc này, AI đang làm bạn chậm hơn. Thử tự làm, hoặc đổi cách dùng AI rồi đo lại.", "For this kind of task AI is slowing you down. Do it yourself, or change how you use AI and measure again."),
        "td_ket_hoa": t("Gần như hòa: chênh chưa tới 5%. Đo thêm việc để chắc hơn.", "Roughly a tie: under 5% apart. Measure more tasks to be sure."),
        "td_ghi": t("Trung vị là việc nằm giữa khi xếp theo số phút, nên một việc lâu bất thường không kéo lệch kết quả. 10 việc vẫn là mẫu nhỏ: xem đây là gợi ý, không phải kết luận.", "The median is the middle task when sorted by minutes, so one unusually long task can't skew the result. Ten tasks is still a small sample: treat this as a hint, not a verdict."),
        "td_luu": t("Tiến độ chỉ lưu trên trình duyệt này, không gửi đi đâu.", "Progress is saved in this browser only and never sent anywhere."),
        "td_ct_ai": t("Trung vị có AI", "Median with AI"), "td_ct_tu": t("Trung vị tự làm", "Median without AI"),
        "td_ct_tuong": t("Tưởng: trung bình cảm giác", "Felt: average feeling"),
        "td_doc": t("Đọc bài báo", "Read the paper write-up"),
    }
    du_lieu = json.dumps({"may": may, "nhan": nhan, "lg": L, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("7 máy tính miễn phí theo video Mark học AI: điện và nước cho mỗi câu hỏi AI, lãi thật của khoản vay, quỹ khẩn cấp, giá thật mỗi mâm cưới, xếp bàn, giá vốn, tự đo AI có giúp bạn nhanh hơn. Mỗi kết quả hiện công thức và nguồn.",
             "7 free calculators from Mark học AI videos: power and water per AI question, a loan's real interest, an emergency fund, the real cost per wedding table, seating, unit cost, and a test of whether AI really speeds you up. Every result shows its formula and source.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Công cụ · 7 máy tính · chơi trên điện thoại", "Tools · 7 calculators · works on your phone")}</p>\n'
            f'<h1>{t("Máy tính đời thật", "Real-life calculators")}</h1>\n'
            f'<p class="lead">{t("Đổi con số của chính bạn, xem kết quả ngay. Công thức và nguồn nằm ngay bên dưới, để bạn kiểm lại từng phép tính.", "Plug in your own numbers and see the result at once. The formula and sources sit right below, so you can check every step.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    nut_tab = "".join(f'<button type="button" role="tab" class="cb-tab mt-tab" id="mt-tab-{m["id"]}" aria-controls="mt-khu" aria-selected="{"true" if i == 0 else "false"}" data-tab="{m["id"]}">{esc(m["ngan"])}</button>'
                      for i, m in enumerate(may))
    main = f"""<main class="mt" id="mt">
<div class="cb-tabs mt-tabs" role="tablist" aria-label="{t("Chọn máy tính", "Pick a calculator")}">{nut_tab}</div>
<div class="mt-khu" id="mt-khu" role="tabpanel"></div>
{khoi_chia_se(BASE + GOC + "may-tinh-doi-that.html", t("Máy tính đời thật: tự tính lãi vay, quỹ khẩn cấp, mâm cưới, điện nước của AI", "Real-life calculators: loan interest, emergency fund, wedding tables, AI power"), p)}
<p class="gh-ghi">{t("Máy chỉ tính trên máy bạn, không gửi con số nào đi đâu. Kết quả để học cách tính, không phải lời khuyên tài chính.", "Everything is calculated on your device; no numbers are sent anywhere. Results are for learning, not financial advice.")}</p>
<noscript><p>{t("Máy tính cần JavaScript. Bạn vẫn có thể xem video", "The calculators need JavaScript. You can still watch the video")} <a href="bai/{ten_file(co_bai[212])}.html">{t("Lãi thật của khoản vay", "The real interest on a loan")}</a>.</p></noscript>
<script type="application/json" id="mt-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "may-tinh-doi-that.html", trang("may-tinh-doi-that.html", t(f"Máy tính đời thật: lãi vay, quỹ khẩn cấp, mâm cưới, điện nước của AI | {SITE}", f"Real-life calculators: loans, emergency fund, weddings, AI power | {SITE}"),
                                                 desc, band, main, p, og_type="website", q="",
                                                 cuoi=f'<script src="{p}may-tinh.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- trò chơi "Cuộc gọi giả giọng" (cuoc-goi-gia-giong.html): mô phỏng cuộc gọi rẽ nhánh, video 108, 109, 112 ----------
# Nội dung ở data/cuoc-goi.json (cả hai ngôn ngữ), cách chơi ở cuoc-goi.js. Cuối trò: đặt mật khẩu gia đình, in hoặc tải thẻ nhỏ.
@trang_rieng("cuoc-goi-gia-giong.html", "0.7")
def tao_cuoc_goi():
    p = t("", "../")
    D = load("cuoc-goi")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x
    def video(so):
        v = co_bai[so]
        return {"so": so, "ten": seo[str(so)], "url": f"bai/{ten_file(v)}.html"}
    cuoc = []
    for c in D["cuoc"]:
        nut = {}
        for k, n in c["nut"].items():
            x = {"dong": [{"tu": d["tu"], "chu": chu(d["chu"]), "cam": chu(d.get("cam", ""))} for d in n.get("dong", [])]}
            if "ket" in n:
                x["ket"] = n["ket"]
            else:
                x["chon"] = [{"chu": chu(o["chu"]), "muc": o["muc"], "toi": o["toi"]} for o in n["chon"]]
            nut[k] = x
        cuoc.append({"id": c["id"], "ten": chu(c["ten"]), "vai": chu(c["vai"]), "khung": {k: chu(x) for k, x in c["khung"].items()},
                     "nut": nut, "dau_hieu": [chu(x) for x in c["dau_hieu"]], "giai": chu(c["giai"]), "video": video(c["video"])})
    nhan = {
        "cuoc": t("Cuộc gọi", "Call"), "khien": t("Khiên", "Shields"), "goi_den": t("Cuộc gọi đến", "Incoming call"), "goi_video": t("Cuộc gọi video", "Video call"),
        "nghe": t("Nghe", "Answer"), "tu_choi": t("Từ chối", "Decline"), "reo": t("Điện thoại đang reo. Bạn làm gì?", "Your phone is ringing. What do you do?"),
        "ban_noi": t("Bạn chọn", "Your move"), "ban": t("Bạn", "You"), "tin": t("Tin nhắn", "Text message"), "dang_noi": t("Đang nói…", "Speaking…"),
        "ket_thuc": t("Cuộc gọi kết thúc", "Call ended"),
        "ket": {"an-toan": t("An toàn!", "Safe!"), "tam": t("Tạm ổn, nhưng còn rủi ro", "OK, but risky"), "mat": t("Bạn đã mất tiền", "You lost the money")},
        "dau_hieu": t("Dấu hiệu trong cuộc gọi này", "Signs in this call"), "dau_hieu_that": t("Vì sao lần này là thật", "Why this one was real"),
        "duong_di": t("Các lựa chọn của bạn", "Your choices"), "xem_video": t("Xem video", "Watch video"), "tiep": t("Cuộc gọi tiếp theo", "Next call"),
        "xem_ket": t("Xem kết quả", "See your result"), "bo_qua": t("Bỏ qua, đặt mật khẩu gia đình ngay", "Skip to making a family safe word"),
        "hang": [[9, t("Người gác cổng của cả nhà", "Your family's gatekeeper")], [6, t("Khá tỉnh táo", "Pretty sharp")], [0, t("Nên tập thêm một lần", "Worth another try")]],
        "on_lai": t("Xem lại video cho các cuộc gọi chưa trọn khiên", "Rewatch the videos for calls without full shields"),
        "het_sai": t("Ba cuộc gọi, trọn chín khiên. Gửi trò này cho bố mẹ thử nhé!", "Three calls, all nine shields. Send this to your parents to try!"),
        "phu": t("khiên", "shields"), "phu_ket": t("khiên bạn giữ được qua 3 cuộc gọi", "shields kept across 3 calls"),
        "kiem": {"dai": t("Từ 3 tiếng trở lên", "At least 2 words"), "so": t("Không có số hay ngày tháng", "No numbers or dates"), "de": t("Không phải từ dễ đoán", "Not an easy guess")},
        "the": {"h": t("Mật khẩu gia đình", "Family safe word"), "nha": t("Nhà mình", "Our family"), "mk": t("Mật khẩu:", "Safe word:"),
                "luat": [t("Ai gọi đòi tiền gấp: cúp máy, gọi lại số đã lưu.", "Urgent money call? Hang up and call the saved number."),
                         t("Không gọi lại được: hỏi mật khẩu. Sai hay ấp úng là cúp.", "Can't reach them? Ask the safe word. Wrong or stalling means hang up."),
                         t("Không đọc mã OTP cho bất kỳ ai.", "Never read an OTP code to anyone."),
                         t("Chuyện tiền không bao giờ vội.", "Money is never that urgent.")]},
    }
    mk = D["mat_khau"][L]
    du_lieu = json.dumps({"cuoc": cuoc, "nhan": nhan, "mat_khau": mk, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    so_cuoc = len(cuoc)
    desc = t(f"Trò chơi miễn phí: {so_cuoc} cuộc gọi giả lập, người thân khóc xin tiền, bạn thân gọi video deepfake. Chọn từng câu đáp, xem cuộc gọi rẽ ra sao, rồi đặt mật khẩu gia đình và in thẻ dán tủ lạnh.",
             f"Free game: {so_cuoc} simulated calls, a crying relative asking for money, a deepfake video call from a friend. Pick each reply, see where the call goes, then make a family safe word and print a fridge card.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 4 phút · chơi trên điện thoại", "Game · 4 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Cuộc gọi giả giọng", "The fake-voice call")}</h1>\n'
            f'<p class="lead">{t(f"{so_cuoc} cuộc gọi đổ chuông. Bạn chọn nghe hay không, nói gì, có chuyển tiền không. Cuối cùng tự đặt mật khẩu gia đình và in một thẻ nhỏ cho cả nhà.", f"{so_cuoc} calls ring in. You choose whether to answer, what to say and whether to send money. Then make your own family safe word and print a small card for everyone.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/nhan-vat/ba-nam.svg" alt="{t("Bà Năm, bà ngoại của Mark, cầm điện thoại", "Grandma Nam, Mark’s grandmother, holding her phone")}" width="160" height="192"></div>')
    main = f"""<main class="cg" id="cg">
<div class="cg-dau"><p class="cg-tien" id="cg-tien" aria-live="polite"></p><a class="cg-bo-qua" id="cg-bo-qua" href="#cg-mk">{t("Đặt mật khẩu gia đình ngay", "Make a family safe word now")} ↓</a><p class="cg-diem" id="cg-diem"></p></div>
<div class="nv cg-ba"><img src="{p}assets/nhan-vat/ba-nam.svg" alt="" width="64" height="77"><p class="nv-loi"><b>{t("Bà Năm:", "Grandma Nam:")}</b> {t("Điện thoại bà cứ reo hoài mà bà không biết ai thật ai giả. Cháu nghe giúp bà, chọn giùm bà nên nói gì nhé!", "My phone keeps ringing and I can’t tell who’s real. Answer for me, dear, and pick what I should say!")}</p></div>
<div class="cg-san" id="cg-san"></div>
<section class="cg-ket" id="cg-ket" hidden aria-live="polite">
<div class="ld-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="ld-ket-so" id="cg-ket-so"></p><p class="ld-ket-hang" id="cg-ket-hang"></p><p class="ld-ket-phu" id="cg-ket-phu"></p></div></div>
<h2 class="ld-ket-h" id="cg-ket-h"></h2>
<div class="ld-ket-video" id="cg-ket-video"></div>
</section>
<section class="cg-mk" id="cg-mk" aria-labelledby="cg-mk-h">
<p class="cg-mk-buoc">{t("Bước cuối", "Last step")}</p>
<h2 id="cg-mk-h">{t("Đặt mật khẩu gia đình", "Make a family safe word")}</h2>
<p class="cg-mk-lead">{t("Một cụm từ bí mật cả nhà cùng biết. Ai gọi đòi tiền gấp mà không nói đúng, cúp máy ngay. Chọn cụm dễ nhớ mà khó đoán: đừng dùng tên thú cưng hay ngày sinh.", "A secret phrase the whole family knows. If someone calls asking for money and can't say it, hang up. Pick something easy to remember but hard to guess: no pet names or birthdays.")}</p>
<div class="cg-mk-o">
<div class="cg-mk-tao">
<label class="cg-mk-nhan" for="cg-mk-o">{t("Mật khẩu của nhà bạn", "Your family's safe word")}</label>
<div class="cg-mk-hang"><input id="cg-mk-o" type="text" autocomplete="off" spellcheck="false" maxlength="40" placeholder="{t("ví dụ: bánh xèo con diều tím", "e.g. purple kite pancake")}"><button type="button" class="btn" id="cg-mk-goi-y">{ic(p, "sparkles")}{t("Gợi ý", "Suggest")}</button></div>
<ul class="cg-mk-kiem" id="cg-mk-kiem" aria-live="polite"></ul>
<label class="cg-mk-nhan" for="cg-mk-nha">{t("Tên nhà (không bắt buộc)", "Family name (optional)")}</label>
<input id="cg-mk-nha" type="text" autocomplete="off" maxlength="24" placeholder="{t("ví dụ: Nhà bà Tư", "e.g. The Nguyens")}">
<label class="cg-mk-in"><input type="checkbox" id="cg-mk-ghi"> {t("In luôn mật khẩu lên thẻ", "Print the safe word on the card")}</label>
<p class="cg-mk-meo">{t("Nên để trống rồi viết tay: thẻ dán tủ lạnh thì khách tới nhà cũng đọc được. Đừng nhắn mật khẩu qua tin nhắn hay đăng lên mạng, hãy nói trực tiếp trong bữa cơm.", "Better to leave it blank and write it by hand: guests can read a card on the fridge. Never text the safe word or post it online; tell everyone in person over dinner.")}</p>
</div>
<div class="cg-mk-xem">
<div class="cg-the" id="cg-the"></div>
<div class="cta"><button type="button" class="btn btn-yt" id="cg-in">{ic(p, "file-text")}{t("In thẻ", "Print card")}</button><button type="button" class="btn" id="cg-tai">{ic(p, "download")}{t("Tải ảnh thẻ", "Download card image")}</button></div>
</div>
</div>
</section>
<div class="cta cg-cuoi"><button type="button" class="btn" id="cg-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "cuoc-goi-gia-giong.html", t("Cuộc gọi giả giọng: thử xem bạn có bị lừa không", "The fake-voice call: would you fall for it?"), p)}
<p class="ld-ghi">{t("Mọi tên người, số điện thoại và tài khoản trong trò chơi đều là hư cấu để luyện tập.", "All names, phone numbers and accounts in this game are made up for practice.")}
{t("Mật khẩu bạn gõ và kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "The safe word you type and your results stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem video", "The game needs JavaScript. You can still watch")} <a href="bai/{ten_file(co_bai[108])}.html">{t("Cuộc gọi giả giọng người thân", "The cloned-voice call")}</a>.</p></noscript>
<script type="application/json" id="cg-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "cuoc-goi-gia-giong.html", trang("cuoc-goi-gia-giong.html", t(f"Cuộc gọi giả giọng: trò chơi chống lừa đảo AI | {SITE}", f"The fake-voice call: a game against AI scams | {SITE}"),
                                                  desc, band, main, p, og_type="website", q="",
                                                  cuoi=f'<script src="{p}chia-se.js?v=dev" defer></script>\n<script src="{p}cuoc-goi.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- chạy ----------
# ---------- làm theo video (lam-theo.html): file mẫu, notebook, prompt của video hướng dẫn chuyên sâu ----------
def tao_lam_theo():
    p = t("", "../")
    D = load("lam-theo")
    L = LG
    khoi = []
    for v in D["video"]:
        nut = [f'<a class="btn btn-yt" href="{p}{D["file_mau"]}" download>{ic(p, "download")}{t("Tải file mẫu", "Download the sample file")} <small class="btn-sub">Excel · {t("dữ liệu giả", "fake data")}</small></a>']
        if v["so"] == 302:
            nut.append(f'<a class="btn" href="{esc(D["colab"])}" target="_blank" rel="noopener">{ic(p, "play")}{t("Mở trong Google Colab", "Open in Google Colab")}</a>')
            nut.append(f'<a class="btn" href="{p}{D["notebook"]}" download>{ic(p, "download")}{t("Tải notebook", "Download the notebook")} <small class="btn-sub">.ipynb</small></a>')
        buoc = "".join(f"<li>{esc(b[L])}</li>" for b in v["buoc"])
        pr = "".join(f'<div class="lt-prompt"><h4>{esc(x["nhan"][L])}</h4><p class="try-prompt" id="prompt-{v["so"]}-{i}">{esc(x[L])}</p>'
                     f'<button class="btn copy-btn" type="button" data-chep="prompt-{v["so"]}-{i}" hidden>{ic(p, "copy")}{t("Sao chép prompt", "Copy prompt")}</button></div>'
                     for i, x in enumerate(v["prompt"]))
        khoi.append(f"""<section class="book-sec" id="{v["id"]}" aria-labelledby="{v["id"]}-h">
<p class="sec-chip">Video {v["so"]}</p>
<h2 id="{v["id"]}-h">{esc(v["ten"][L])}</h2>
<p class="book-sub">{esc(v["mo_ta"][L])}</p>
<div class="cta lt-cta">{"".join(nut)}</div>
<ol class="lt-steps">{buoc}</ol>
{pr}
</section>""")
    desc = t("Tải file mẫu sổ bán hàng, notebook Google Colab và chép các prompt trong video hướng dẫn phân tích dữ liệu và machine learning của kênh Mark học AI.",
             "Download the sample sales log and the Google Colab notebook, and copy the prompts from Mark học AI's data analysis and machine learning tutorials.")
    band = (f'<p class="eyebrow">{t("Làm theo video", "Follow along")}</p>\n'
            f'<h1>{t("File mẫu và prompt để làm theo video", "Sample files and prompts to follow along")}</h1>\n'
            f'<p class="lead">{t("Mọi thứ cần để tự làm lại các video hướng dẫn chuyên sâu: file Excel mẫu (dữ liệu giả), notebook chạy được, và các prompt chép là dùng.", "Everything you need to redo the in-depth tutorials yourself: a sample Excel file (fake data), a working notebook, and prompts ready to copy.")}</p>\n'
            + t("", '<p class="lead book-lang"><b>Note:</b> the videos, sample file and notebook are in Vietnamese.</p>\n'))
    main = f"""<main class="book">
{chr(10).join(khoi)}
<aside class="next-steps">
<a class="next-step" href="sach.html"><b>{t("Sách miễn phí", "Free ebook")}</b><span>{t("Cả kênh gom lại thành một cuốn sách PDF.", "The whole channel in one PDF book.")}</span></a>
<a class="next-step" href="tu-dien.html"><b>{t("Từ điển AI", "AI glossary")}</b><span>{t("Tra nhanh data cleaning, overfitting, data leakage…", "Look up data cleaning, overfitting, data leakage…")}</span></a>
</aside>
</main>"""
    return GOC + "lam-theo.html", trang("lam-theo.html", t(f"File mẫu và prompt làm theo video | {SITE}", f"Sample files and prompts to follow along | {SITE}"),
                                        desc, band, main, p, og_type="website", cuoi=f'<script src="{p}bai-viet.js?v=dev" defer></script>\n', q="")

# Trang riêng viết trong file riêng: scripts/trang/*.py chạy chung không gian tên với script này (dùng được trang(), t(), header()...)
for _f in sorted((R / "scripts" / "trang").glob("*.py")):
    exec(compile(_f.read_text(encoding="utf-8"), str(_f), "exec"), globals())

def chay():
    def ghi(duong, noi_dung):
        f = R / duong
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(noi_dung, encoding="utf-8")

    ngon_ngu = ["vi", "en"] if CHON == "all" else [CHON]
    for lg in ngon_ngu:
        dat_ngon_ngu(lg)
        bai_dir = R / GOC / "bai"
        if bai_dir.exists():
            for f in bai_dir.glob("*.html"):
                f.unlink()
        for v in thu_tu:
            ghi(*tao_bai(v))
        for s, x in cac_bai_phu():
            ghi(*tao_bai_phu(s, x))
        for ham in (tao_tu_dien, tao_kiem_tra, tao_sach, tao_lo_trinh, tao_hop_tac, tao_dich_vu, tao_lam_theo):
            ghi(*ham())
        for _, _, ham in TRANG_RIENG:
            ghi(*ham())
        print(lg, ":", len(thu_tu), "bài viết, tu-dien.html, kiem-tra.html, sach.html, lo-trinh-7-ngay.html, hop-tac.html, dich-vu.html, lam-theo.html")
    dat_ngon_ngu("vi")
    if CHON == "all":
        anh_chia_se.luu()

    # sitemap.xml: tạo từ chính các file .html (scripts/tao_sitemap.py), không lưu trong git
    so_trang = tao_sitemap.ghi()
    tro_choi.ghi_tuong_tac(TUONG_TAC)
    import tao_link_ngan
    print("t/:", tao_link_ngan.ghi(), "link ngắn cho video (markhocai.com/t/<số>)")
    print("sitemap.xml:", so_trang, "trang (không lưu trong git, pages.yml tạo lại khi đăng)")

if __name__ == "__main__":
    chay()

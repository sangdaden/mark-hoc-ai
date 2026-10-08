"""Tạo các trang tĩnh cho SEO: một bài viết cho mỗi video (bai/*.html), Từ điển AI (tu-dien.html),
bài kiểm tra "Bạn hiểu AI tới đâu?" (kiem-tra.html) và sitemap.xml.

Chạy lại mỗi khi có video mới (sau scripts/gom_video.py) hoặc khi sửa data/bai-viet.json, data/tu-dien.json, data/kiem-tra.json:
    python3 scripts/tao_bai_viet.py /mnt/project-files/videos

Nguồn của mỗi bài: SCENES trong <thư mục video>/nguon/script.py (tiêu đề cảnh thành tiêu đề mục, lời đọc thành đoạn văn,
cảnh THỬ NGAY thành hộp "Thử ngay") và tieu-de-mo-ta.md (mô tả cho thẻ meta). Script chỉ đọc thư mục video, không ghi vào đó.
"""
import ast, html, json, pathlib, re, sys, unicodedata
from urllib.parse import quote

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/videos")
R = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://sangdaden.github.io/mark-hoc-ai/"
SITE = "Mark học AI"
PDF = "assets/50-prompt-mau.pdf"

def load(name):
    return json.loads((R / "data" / f"{name}.json").read_text(encoding="utf-8"))

kenh, series, videos = load("kenh"), load("series"), load("videos")
seo = load("bai-viet")["tieu_de_seo"]
tu_dien = load("tu-dien")["thuat_ngu"]
kiem_tra = load("kiem-tra")["cau_hoi"]
esc = lambda s: html.escape(s or "", quote=True)

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
    m = re.match(r"^.*?\((Phần \d+/\d+)\):\s*(.*)$", v["chu_de"])
    return (m.group(2), m.group(1)) if m else (v["chu_de"], "")

def ten_file(v):
    return f"{v['so']:02d}-{v['slug']}"

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
    return cat_ngan(bo_emoji(" ".join(buf))), thu

# Câu trong ngoặc kép ở dòng "Thử ngay" nhưng không phải câu lệnh gửi AI (tên tùy chọn, từ khóa tìm kiếm)
KHONG_PHAI_PROMPT = {75, 77, 80}

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

nhom = []
for s in series:
    items = [v for v in videos if s["tu"] <= v["so"] <= s["den"]]
    if items:
        nhom.append({**s, "items": items})
nhom_cua = {v["so"]: g for g in nhom for v in g["items"]}
thu_tu = [v for g in nhom for v in g["items"]]
co_bai = {v["so"]: v for v in thu_tu}

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

def header(p, hien_tai=""):
    def a(href, ten, key, cls=""):
        cur = ' aria-current="page"' if key == hien_tai else ""
        return f'<a class="{cls}" href="{href}"{cur}>{ten}</a>' if cls else f'<a href="{href}"{cur}>{ten}</a>'
    return (f'<header class="top">\n  <a class="brand" href="{p or "./"}"><img src="{p}assets/logo.png" alt="" width="40" height="40"><span>Mark học <b>AI</b></span></a>\n'
            f'  <nav class="top-links" aria-label="Trang">\n    {a((p or "./") + "#bat-dau", "Bắt đầu từ đây", "bat-dau", "nav-start")}\n'
            f'    {a(p + "tu-dien.html", "Từ điển AI", "tu-dien")}\n    {a(p + "kiem-tra.html", "Kiểm tra", "kiem-tra")}\n'
            f'    <a class="nav-yt" href="{esc(kenh["youtube"])}" target="_blank" rel="noopener">YouTube</a>\n  </nav>\n</header>')

def footer(p):
    links = "".join(f'\n      <a href="{esc(kenh[k])}" target="_blank" rel="noopener">{t}</a>' for k, t in
                    (("youtube", "YouTube"), ("tiktok", "TikTok"), ("instagram", "Instagram"), ("facebook", "Facebook")) if kenh.get(k))
    return (f'<footer class="foot-band">\n  <div class="foot">\n    <a class="brand" href="{p or "./"}"><img src="{p}assets/logo.png" alt="" width="36" height="36"><span>Mark học <b>AI</b></span></a>\n'
            f'    <p class="foot-line">Hiểu AI trong một phút, dùng được ngay sau đó.</p>\n    <nav class="foot-links" aria-label="Kênh ở chân trang">{links}\n    </nav>\n'
            f'    <span class="foot-copy">© 2026 Mark học AI · <a href="{p}tu-dien.html">Từ điển AI</a> · <a href="{p}kiem-tra.html">Bạn hiểu AI tới đâu?</a></span>\n  </div>\n</footer>')

def trang(duong_dan, title, desc, band, main, p, hien_tai="", og_type="article", jsonld=(), cuoi=""):
    url = BASE + duong_dan
    return f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="{SITE}">
<meta property="og:locale" content="vi_VN">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2563EB">
<link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon-32.png">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png">
{FONT}
<link rel="stylesheet" href="{p}style.css?v=dev">
{chr(10).join(ld(j) for j in jsonld)}
</head>
<body class="sub">
<div class="band">
{header(p, hien_tai)}
<div class="band-in page-head">
{band}
</div>
</div>
{main}
{footer(p)}
<script src="{p}len-dau.js?v=dev" defer></script>
{cuoi}</body>
</html>
"""

TO_CHUC = {"@type": "Organization", "name": SITE, "url": BASE, "logo": {"@type": "ImageObject", "url": BASE + "assets/logo.png"}}

def yt_link(v):
    tieu_de, _ = tach_tieu_de(v)
    return kenh["youtube"] + "/search?query=" + quote(tieu_de, safe="")

# data-so + data-kenh: bai-viet.js đổi nút thành link kênh và ghi "Video ra mắt dd/mm" khi video chưa tới ngày
def nut_video(v, g):
    gan = f'data-so="{v["so"]}" data-kenh="{esc(kenh["youtube"])}"'
    if g.get("sap_ra_mat"):
        return (f'<a class="btn btn-yt" {gan} href="{esc(kenh["youtube"])}" target="_blank" rel="noopener">Theo dõi kênh YouTube</a>'
                '<span class="soon-note">Video này sắp ra mắt</span>')
    return f'<a class="btn btn-yt" {gan} href="{esc(yt_link(v))}" target="_blank" rel="noopener">▶ Xem video</a>'

def khoi_prompt(so, prompt):
    """Prompt mẫu + nút chép (ẩn sẵn, bai-viet.js mở ra khi chạy được)."""
    if not prompt:
        return ""
    return (f'\n  <p class="try-prompt" id="prompt-{so}">{esc(prompt)}</p>'
            f'\n  <button class="btn copy-btn" type="button" data-chep="prompt-{so}" hidden>Sao chép prompt</button>')

# ---------- bài viết ----------
def tao_bai(v):
    so, g = v["so"], nhom_cua[v["so"]]
    thu_muc = ROOT / ten_file(v)
    canh = doc_canh(thu_muc)
    meta, thu_mo_ta = doc_mo_ta(thu_muc)
    prompt = doc_prompt(thu_muc, so)
    tieu_de, phan = tach_tieu_de(v)
    h1 = seo[str(so)]
    p = "../"
    duong = f"bai/{ten_file(v)}.html"

    muc, co_thu = [], False
    for s in canh:
        chip, ten, lines = s.get("chip", ""), s.get("title", ""), s.get("lines", [])
        if chip == "THỬ NGAY":
            co_thu = True
            doan = thanh_doan([bo_tien_to_thu(lines[0])] + lines[1:]) if lines else ""
            muc.append(f'<aside class="try" aria-labelledby="thu-{so}">\n  <img src="{p}assets/mark-a-ra-the.svg" alt="" width="96" height="91">\n'
                       f'  <div><p class="try-label">Thử ngay</p>\n  <h2 id="thu-{so}">{esc(ten)}</h2>\n  <p>{gan_link_video(doan, p, so)}</p>{khoi_prompt(so, prompt)}</div>\n</aside>')
            continue
        nhan = f'<p class="sec-chip">{esc(chip)}</p>\n' if chip else ""
        h2 = f"<h2>{esc(ten)}</h2>\n" if ten else ""
        muc.append(f'<section>\n{nhan}{h2}<p>{gan_link_video(thanh_doan(lines), p, so)}</p>\n</section>')
    if not co_thu and thu_mo_ta:
        muc.append(f'<aside class="try" aria-labelledby="thu-{so}">\n  <img src="{p}assets/mark-a-ra-the.svg" alt="" width="96" height="91">\n'
                   f'  <div><p class="try-label">Thử ngay</p>\n  <h2 id="thu-{so}">Làm ngay hôm nay</h2>\n  <p>{gan_link_video(thanh_doan([viet_hoa(thu_mo_ta)]), p, so)}</p>{khoi_prompt(so, prompt)}</div>\n</aside>')

    # điều hướng series: phần trước/sau; hết series thì nối sang series kề bên
    i = thu_tu.index(v)
    def the(vv, nhan):
        t2, ph2 = tach_tieu_de(vv)
        return (f'<a class="nav-card" href="{p}bai/{ten_file(vv)}.html"><span class="nav-dir">{nhan}</span>'
                f'<b>#{vv["so"]:02d} · {esc(seo[str(vv["so"])])}</b></a>')
    truoc = thu_tu[i - 1] if i > 0 else None
    sau = thu_tu[i + 1] if i + 1 < len(thu_tu) else None
    nav = []
    if truoc:
        nav.append(the(truoc, "‹ Phần trước" if nhom_cua[truoc["so"]] is g and not g.get("le") else ("‹ Video trước" if nhom_cua[truoc["so"]] is g else "‹ Series trước: " + esc(nhom_cua[truoc["so"]]["ten"]))))
    else:
        nav.append("<span></span>")
    if sau:
        nav.append(the(sau, ("Phần tiếp theo ›" if not g.get("le") else "Video tiếp theo ›") if nhom_cua[sau["so"]] is g else "Series tiếp theo: " + esc(nhom_cua[sau["so"]]["ten"]) + " ›").replace('class="nav-card"', 'class="nav-card next"'))
    so_phan = f"{g['items'].index(v) + 1}/{len(g['items'])}"

    lien_quan = [t for t in tu_dien if so in t["video"]]
    tu_html = ""
    if lien_quan:
        tu_html = ('<section class="related" aria-labelledby="tu-lq">\n<h2 id="tu-lq">Thuật ngữ trong bài</h2>\n<ul class="term-chips">' +
                   "".join(f'<li><a href="{p}tu-dien.html#{t["id"]}">{esc(t["thuat_ngu"])}</a></li>' for t in lien_quan) +
                   f'</ul>\n<p class="related-more">Xem giải thích từng chữ trong <a href="{p}tu-dien.html">Từ điển AI</a>.</p>\n</section>')

    lead = thanh_doan([bo_emoji(v["mo_ta"])])
    band = (f'<nav class="crumbs" aria-label="Đường dẫn"><a href="{p}">Trang chủ</a> › <a href="{p}#{g["id"]}">{esc(g["ten"])}</a> › <span>#{so:02d}</span></nav>\n'
            f'<p class="eyebrow">Video #{so:02d} · {esc(g["ten"])}{" · " + phan if phan else ""}</p>\n'
            f'<h1>{esc(h1)}</h1>\n<p class="lead">{esc(lead)}</p>\n<div class="cta">{nut_video(v, g)}</div>')
    main = (f'<main class="doc">\n<article class="post">\n' + "\n".join(muc) +
            f'\n<div class="post-end">\n<p>Đây là bài viết từ video <b>{esc(tieu_de)}</b> của kênh Mark học AI. Xem video để thấy phần minh họa bằng hình động.</p>\n<div class="cta">{nut_video(v, g)}</div>\n</div>\n</article>\n'
            f'{tu_html}\n<nav class="series-nav" aria-label="Trong series">\n<p class="series-nav-head">{"Video lẻ" if g.get("le") else "Series"} <a href="{p}#{g["id"]}">{esc(g["ten"])}</a> · {"#" + format(so, "02d") if g.get("le") else "Phần " + so_phan}</p>\n'
            f'<div class="nav-cards">{"".join(nav)}</div>\n</nav>\n'
            f'<aside class="next-steps">\n<a class="next-step" href="{p}kiem-tra.html"><b>Bạn hiểu AI tới đâu?</b><span>10 câu đúng hay sai, có giải thích ngay.</span></a>\n'
            f'<a class="next-step" href="{p}#bat-dau"><b>Mới đến kênh?</b><span>Bản đồ 7 vùng và lộ trình cho người mới.</span></a>\n</aside>\n</main>')
    url = BASE + duong
    jsonld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": h1[:110], "description": meta, "inLanguage": "vi",
         "url": url, "mainEntityOfPage": url, "image": [BASE + "assets/og.png"], "author": TO_CHUC, "publisher": TO_CHUC,
         "isPartOf": {"@type": "CreativeWorkSeries", "name": g["ten"]},
         **({"about": [{"@type": "DefinedTerm", "name": t["thuat_ngu"], "url": BASE + "tu-dien.html#" + t["id"]} for t in lien_quan]} if lien_quan else {})},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Mark học AI", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": g["ten"], "item": BASE + "#" + g["id"]},
            {"@type": "ListItem", "position": 3, "name": h1, "item": url}]},
    ]
    return duong, trang(duong, f"{h1} | {SITE}", meta or lead, band, main, p, jsonld=jsonld,
                         cuoi=f'<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- từ điển ----------
def tao_tu_dien():
    p = ""
    ds = sorted(tu_dien, key=lambda t: norm(t["thuat_ngu"]))
    nhom_chu = {}
    for t in ds:
        nhom_chu.setdefault(norm(t["thuat_ngu"])[0].upper(), []).append(t)
    def muc(t):
        vs = t["video"]
        chinh = co_bai[vs[0]]
        khac = "".join(f'<a href="bai/{ten_file(co_bai[n])}.html">#{n:02d}</a>' for n in vs[1:])
        key = norm(" ".join([t["thuat_ngu"], t.get("tieng_viet", ""), t["giai_thich"]]))
        return (f'<li class="term" id="{t["id"]}" data-k="{esc(key)}">\n<h3>{esc(t["thuat_ngu"])}' +
                (f' <span class="term-vi">{esc(t["tieng_viet"])}</span>' if t.get("tieng_viet") else "") +
                f'</h3>\n<p>{esc(t["giai_thich"])}</p>\n<p class="term-links"><a class="term-main" href="bai/{ten_file(chinh)}.html">Đọc bài #{chinh["so"]:02d}: {esc(seo[str(chinh["so"])])}</a>' +
                (f'<span class="term-more">Xem thêm {khac}</span>' if khac else "") + "</p>\n</li>")
    chu_cai = "".join(f'<a href="#chu-{c}">{c}</a>' for c in nhom_chu)
    khoi = "\n".join(f'<section class="letter" id="chu-{c}" aria-labelledby="h-{c}">\n<h2 id="h-{c}">{c}</h2>\n<ul class="terms">\n' + "\n".join(muc(t) for t in ts) + "\n</ul>\n</section>" for c, ts in nhom_chu.items())
    n = len(ds)
    desc = f"Giải thích {n} thuật ngữ AI bằng tiếng Việt dễ hiểu: token, embedding, attention, prompt, context, RAG, fine-tuning, MCP… Mỗi chữ một dòng, kèm bài viết và video."
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{n} thuật ngữ · cập nhật theo video mới</p>\n<h1>Từ điển AI</h1>\n'
            '<p class="lead">Gặp chữ lạ trên báo hay trong app AI? Mỗi thuật ngữ một dòng giải thích bằng tiếng Việt đời thường, kèm bài viết và video để hiểu kỹ hơn. Thuật ngữ giữ nguyên tiếng Anh để bạn nhận ra khi gặp lại.</p>\n'
            '</div><img class="head-art" src="assets/mark-chao.svg" alt="Mark vẫy tay chào" width="180" height="170"></div>')
    main = (f'<main class="dict">\n<div class="dict-tools">\n<label class="search" for="loc"><span class="sr">Lọc thuật ngữ</span>'
            '<input id="loc" type="search" placeholder="Lọc: token, RAG, nhái giọng…" autocomplete="off"></label>\n'
            f'<p class="dict-count" id="dem" aria-live="polite">{n} thuật ngữ</p>\n</div>\n<nav class="az" aria-label="Theo chữ cái">{chu_cai}</nav>\n'
            f'{khoi}\n<div class="empty" id="rong" hidden><img src="assets/mark-thac-mac.svg" alt="" width="120" height="113"><p>Chưa có thuật ngữ này. Thử chữ khác, hoặc tìm trong <a href="./#video">danh sách video</a>.</p></div>\n'
            f'<aside class="pdf-card">\n<div><b>Tải 50 prompt mẫu (PDF)</b><span>Prompt viết sẵn cho việc hằng ngày, điền chỗ trống là dùng được.</span></div>\n'
            f'<a class="btn btn-yt" href="{PDF}" download>Tải 50 prompt mẫu (PDF)</a>\n</aside>\n</main>')
    js = """<script>
(function () {
  var norm = function (s) { return (s || "").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(); };
  var input = document.getElementById("loc"), dem = document.getElementById("dem"), rong = document.getElementById("rong");
  var items = Array.prototype.slice.call(document.querySelectorAll(".term"));
  var letters = Array.prototype.slice.call(document.querySelectorAll(".letter"));
  var az = document.querySelector(".az");
  function loc() {
    var q = norm(input.value.trim()), words = q ? q.split(/\\s+/) : [], n = 0;
    items.forEach(function (li) {
      var ok = words.every(function (w) { return li.getAttribute("data-k").indexOf(w) !== -1; });
      li.hidden = !ok; if (ok) n++;
    });
    letters.forEach(function (s) { s.hidden = !s.querySelector(".term:not([hidden])"); });
    az.hidden = !!q;
    dem.textContent = q ? n + " / " + items.length + " thuật ngữ" : items.length + " thuật ngữ";
    rong.hidden = n > 0;
  }
  input.addEventListener("input", loc);
})();
</script>
"""
    jsonld = [{"@context": "https://schema.org", "@type": "DefinedTermSet", "name": "Từ điển AI", "url": BASE + "tu-dien.html", "inLanguage": "vi",
               "description": desc, "publisher": TO_CHUC,
               "hasDefinedTerm": [{"@type": "DefinedTerm", "@id": BASE + "tu-dien.html#" + t["id"], "name": t["thuat_ngu"],
                                   **({"alternateName": t["tieng_viet"]} if t.get("tieng_viet") else {}), "description": t["giai_thich"],
                                   "url": BASE + "tu-dien.html#" + t["id"]} for t in ds]}]
    return "tu-dien.html", trang("tu-dien.html", f"Từ điển AI: {n} thuật ngữ AI giải thích bằng tiếng Việt | {SITE}", desc, band, main, p,
                                 hien_tai="tu-dien", og_type="website", jsonld=jsonld, cuoi=js)

# ---------- bài kiểm tra ----------
def tao_kiem_tra():
    p = ""
    cau = []
    for c in kiem_tra:
        cau.append({"cau": c["cau"], "dung": c["dung"], "giai_thich": c["giai_thich"],
                    "video": [{"so": n, "url": f"bai/{ten_file(co_bai[n])}.html", "ten": seo[str(n)]} for n in c["video"]]})
    du_lieu = json.dumps({"cau_hoi": cau, "url": BASE + "kiem-tra.html",
                          "goi_y_gioi": [{"so": n, "url": f"bai/{ten_file(co_bai[n])}.html", "ten": seo[str(n)]} for n in (97, 99)]},
                         ensure_ascii=False).replace("</", "<\\/")
    desc = "Bài kiểm tra 10 câu đúng hay sai về AI: AI có hiểu như người, có tự tra mạng, có nhớ hết lời bạn nói? Trả lời từng câu, xem giải thích ngay, biết nên xem video nào."
    band = ('<div class="head-row"><div>\n<p class="eyebrow">10 câu · khoảng 2 phút</p>\n<h1>Bạn hiểu AI tới đâu?</h1>\n'
            '<p class="lead">Mười câu nói về AI mà ai cũng từng nghe. Câu nào đúng, câu nào là hiểu lầm? Chọn từng câu, xem giải thích ngay, cuối bài biết nên xem video nào tiếp.</p>\n'
            '</div><img class="head-art" src="assets/mark-thac-mac.svg" alt="Mark đang thắc mắc" width="180" height="170"></div>')
    static = "\n".join(f'<li><p><b>{esc(c["cau"])}</b></p><p>{"Đúng" if c["dung"] else "Sai"}. {esc(c["giai_thich"])}</p></li>' for c in kiem_tra)
    main = f"""<main class="quiz-wrap">
<section class="quiz" id="quiz" aria-live="polite">
  <div class="quiz-top"><span id="tien-do">Câu 1/10</span><span class="quiz-score" id="diem-tam">Đúng 0</span></div>
  <div class="bar" aria-hidden="true"><i id="thanh"></i></div>
  <div id="khung">
    <noscript><p>Trang này cần JavaScript để chấm điểm. Đáp án cả 10 câu:</p><ol class="quiz-static">{static}</ol></noscript>
  </div>
</section>
<p class="quiz-src">Câu hỏi lấy từ video <a href="{link_bai(98, p)}">#98 · 10 hiểu lầm phổ biến về AI</a>.</p>
</main>"""
    js = """<script type="application/json" id="du-lieu">""" + du_lieu + """</script>
<script>
(function () {
  var D = JSON.parse(document.getElementById("du-lieu").textContent);
  var Q = D.cau_hoi, i = 0, dung = 0, sai = [];
  var khung = document.getElementById("khung"), tienDo = document.getElementById("tien-do"), diemTam = document.getElementById("diem-tam"), thanh = document.getElementById("thanh");
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var link = function (v) { return '<a href="' + v.url + '">#' + String(v.so).padStart(2, "0") + " · " + esc(v.ten) + "</a>"; };
  function capNhat(soHien) {
    tienDo.textContent = soHien ? "Câu " + soHien + "/" + Q.length : "Kết quả";
    diemTam.textContent = "Đúng " + dung;
    thanh.style.width = (Math.min(i, Q.length) / Q.length * 100) + "%";
  }
  function cauHoi() {
    var q = Q[i];
    capNhat(i + 1);
    khung.innerHTML = '<p class="q-num">Câu ' + (i + 1) + '</p><h2 class="q-text" tabindex="-1">' + esc(q.cau) + '</h2>' +
      '<div class="q-btns"><button class="q-btn" data-v="1">Đúng</button><button class="q-btn" data-v="0">Sai</button></div><div id="giai"></div>';
    khung.querySelector(".q-text").focus({ preventScroll: true });
  }
  function tra(v) {
    var q = Q[i], ok = (v === "1") === q.dung;
    if (ok) dung++; else sai.push(q);
    khung.querySelectorAll(".q-btn").forEach(function (b) {
      b.disabled = true;
      if ((b.getAttribute("data-v") === "1") === q.dung) b.classList.add("is-right");
      else if (b.getAttribute("data-v") === v) b.classList.add("is-wrong");
    });
    var cuoi = i === Q.length - 1;
    document.getElementById("giai").innerHTML = '<div class="q-fb ' + (ok ? "ok" : "no") + '"><p class="q-verdict">' + (ok ? "Chính xác!" : "Chưa đúng.") +
      " Câu này " + (q.dung ? "đúng" : "là hiểu lầm") + '.</p><p>' + esc(q.giai_thich) + '</p><p class="q-more">Xem thêm: ' + q.video.map(link).join(", ") + '</p></div>' +
      '<button class="btn btn-yt q-next" id="tiep">' + (cuoi ? "Xem kết quả" : "Câu tiếp theo ›") + "</button>";
    i++;
    capNhat(i);
    var tiep = document.getElementById("tiep");
    tiep.addEventListener("click", function () { if (i < Q.length) cauHoi(); else ketQua(); });
    tiep.focus({ preventScroll: true });
    tiep.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function ketQua() {
    capNhat();
    var loi = dung === Q.length ? "Xuất sắc! Bạn không dính hiểu lầm nào. Rủ bạn bè làm thử xem họ được mấy điểm."
      : dung >= 8 ? "Rất tốt! Bạn hiểu AI hơn phần lớn mọi người. Xem lại vài video bên dưới là đủ 10/10."
      : dung >= 5 ? "Khá ổn. Vài hiểu lầm vẫn còn, mấy video bên dưới sẽ gỡ giúp bạn."
      : "Không sao, ai cũng từng nghĩ vậy. Bắt đầu với các video bên dưới, mỗi video chỉ khoảng một phút.";
    var goiY = [], daCo = {};
    (sai.length ? sai : []).forEach(function (q) { q.video.forEach(function (v) { if (!daCo[v.so]) { daCo[v.so] = 1; goiY.push(v); } }); });
    if (!goiY.length) goiY = D.goi_y_gioi;
    var tieuDe = sai.length ? "Nên xem tiếp" : "Đi tiếp cùng kênh";
    khung.innerHTML = '<div class="result"><img src="assets/mark-a-ra-the.svg" alt="" width="140" height="132"><div>' +
      '<p class="q-num">Kết quả</p><h2 class="score" tabindex="-1">' + dung + "/" + Q.length + ' câu đúng</h2><p>' + loi + "</p></div></div>" +
      '<h3 class="rec-h">' + tieuDe + '</h3><ul class="rec">' + goiY.map(function (v) { return "<li>" + link(v) + "</li>"; }).join("") + "</ul>" +
      '<div class="q-actions"><button class="btn btn-yt" id="chia-se">Chia sẻ kết quả</button><button class="btn" id="lam-lai">Làm lại</button>' +
      '<a class="btn" href="tu-dien.html">Từ điển AI</a></div><p class="share-msg" id="bao" role="status"></p>';
    khung.querySelector(".score").focus({ preventScroll: true });
    document.getElementById("lam-lai").addEventListener("click", function () { i = 0; dung = 0; sai = []; cauHoi(); });
    document.getElementById("chia-se").addEventListener("click", function () { chiaSe(dung); });
  }
  function chiaSe(d) {
    var text = "Mình được " + d + "/" + Q.length + " câu trong bài kiểm tra \\"Bạn hiểu AI tới đâu?\\" của Mark học AI. Bạn được mấy câu?";
    var bao = document.getElementById("bao");
    var chep = function () {
      var all = text + " " + D.url;
      var xong = function () { bao.textContent = "Đã chép link, dán vào tin nhắn để gửi bạn bè."; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(all).then(xong, function () { thuCu(all, xong); });
      } else thuCu(all, xong);
    };
    if (navigator.share) {
      navigator.share({ title: "Bạn hiểu AI tới đâu?", text: text, url: D.url }).catch(function (e) { if (!e || e.name !== "AbortError") chep(); });
    } else chep();
  }
  function thuCu(all, xong) {
    var t = document.createElement("textarea");
    t.value = all; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t);
    if (ok) xong(); else document.getElementById("bao").textContent = "Chép link này để gửi bạn bè: " + all;
  }
  khung.addEventListener("click", function (e) {
    var b = e.target.closest(".q-btn");
    if (b && !b.disabled) tra(b.getAttribute("data-v"));
  });
  cauHoi();
})();
</script>
"""
    jsonld = [{"@context": "https://schema.org", "@type": "Quiz", "name": "Bạn hiểu AI tới đâu?", "url": BASE + "kiem-tra.html", "inLanguage": "vi",
               "description": desc, "publisher": TO_CHUC, "educationalLevel": "beginner",
               "hasPart": [{"@type": "Question", "eduQuestionType": "True/False", "text": c["cau"],
                            "acceptedAnswer": {"@type": "Answer", "text": ("Đúng. " if c["dung"] else "Sai. ") + c["giai_thich"]}} for c in kiem_tra]}]
    return "kiem-tra.html", trang("kiem-tra.html", f"Bạn hiểu AI tới đâu? Kiểm tra 10 câu đúng sai về AI | {SITE}", desc, band, main, p,
                                  hien_tai="kiem-tra", og_type="website", jsonld=jsonld, cuoi=js)

# ---------- chạy ----------
def ghi(duong, noi_dung):
    f = R / duong
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(noi_dung, encoding="utf-8")

bai_dir = R / "bai"
if bai_dir.exists():
    for f in bai_dir.glob("*.html"):
        f.unlink()
trang_da_tao = ["", ]
for v in thu_tu:
    duong, nd = tao_bai(v)
    ghi(duong, nd)
    trang_da_tao.append(duong)
for ham in (tao_tu_dien, tao_kiem_tra):
    duong, nd = ham()
    ghi(duong, nd)
    trang_da_tao.append(duong)

uu_tien = {"": "1.0", "tu-dien.html": "0.8", "kiem-tra.html": "0.8"}
sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for d in sorted(trang_da_tao, key=lambda d: (d.startswith("bai/"), d)):
    sitemap.append(f"  <url><loc>{BASE}{d}</loc><priority>{uu_tien.get(d, '0.6')}</priority></url>")
sitemap.append("</urlset>")
ghi("sitemap.xml", "\n".join(sitemap) + "\n")
print(len(thu_tu), "bài viết, tu-dien.html, kiem-tra.html, sitemap.xml:", len(trang_da_tao), "trang")

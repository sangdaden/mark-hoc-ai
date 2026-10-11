"""Tạo dữ liệu cho trang Hỏi Bit (hoi-bit.html, en/hoi-bit.html): mỗi video là các đoạn nội dung lấy từ bài viết bai/*.html
(tiêu đề mục + lời đọc + hộp Thử ngay), cộng các mục Từ điển AI. Trang hỏi đáp chấm điểm các đoạn này ngay trên trình duyệt,
nên chỉ trả lời bằng nội dung của kênh.

Chạy lại sau scripts/tao_bai_viet.py (mỗi khi có bài mới hoặc sửa bài/từ điển):
    python3 scripts/tao_hoi_dap.py
Ghi ra data/hoi-dap.json và data/en/hoi-dap.json:
    {"v": [[số, "bai/<file>.html", "tiêu đề bài", "Series · Phần X/N", [["tiêu đề mục", "nội dung"], ...]], ...],
     "t": [["id", "thuật ngữ", "giải thích", [số video]], ...]}
"""
import html, json, pathlib, re

R = pathlib.Path(__file__).resolve().parent.parent


def sach(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def doc_bai(p):
    h = p.read_text(encoding="utf-8")
    so = int(p.name.split("-", 1)[0])
    h1 = sach(re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S).group(1))
    m = re.search(r'<p class="series-nav-head">(.*?)</p>', h, re.S)
    series = re.sub(r"\s*·\s*#\d+$", "", sach(m.group(1)).removeprefix("Series ").strip()) if m else ""
    bai = re.search(r'<article class="post">(.*?)<div class="post-end">', h, re.S)
    muc = []
    for khoi in re.finditer(r"<section>(.*?)</section>|<aside class=\"try\"[^>]*>(.*?)</aside>", bai.group(1) if bai else "", re.S):
        k = khoi.group(1) or khoi.group(2)
        chip = re.search(r'<p class="sec-chip">(.*?)</p>', k, re.S)
        sau = bool(chip and re.fullmatch(r"(PHẦN|PART) (\d+|SAU|CUỐI)|LAST PART|NEXT( PART)?|TIẾP THEO", sach(chip.group(1)).upper()))
        t = re.search(r"<h2[^>]*>(.*?)</h2>", k, re.S)
        tieu_de = sach(t.group(1)) if t else ""
        noi_dung = " ".join(sach(x) for x in re.findall(r"<p(?! class=\"(?:sec-chip|try-label)\")[^>]*>(.*?)</p>", k, re.S))
        if khoi.group(2):  # hộp Thử ngay
            nhan = sach(re.search(r'<p class="try-label">(.*?)</p>', k, re.S).group(1))
            tieu_de = nhan + ": " + tieu_de
        if noi_dung:
            muc.append([tieu_de, noi_dung, sau])
    while muc and muc[-1][2]:  # thẻ giới thiệu phần sau ở cuối bài, không phải nội dung của video này
        muc.pop()
    muc = [m[:2] for m in muc]
    return [so, None, h1, series, muc]


def tao(thu_muc, tu_dien, ra):
    vids = []
    for p in sorted((R / thu_muc).glob("*.html"), key=lambda p: int(p.name.split("-", 1)[0])):
        v = doc_bai(p)
        v[1] = "bai/" + p.name
        if v[4]:
            vids.append(v)
    out = {"v": vids, "t": tu_dien}
    (R / ra).write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(ra, len(vids), "bài,", sum(len(v[4]) for v in vids), "đoạn,", len(tu_dien), "thuật ngữ")


td = json.loads((R / "data/tu-dien.json").read_text(encoding="utf-8"))["thuat_ngu"]
td_en = json.loads((R / "data/en/tu-dien.json").read_text(encoding="utf-8"))["thuat_ngu"]
tao("bai", [[t["id"], t["thuat_ngu"] + (" (" + t["tieng_viet"] + ")" if t.get("tieng_viet") else ""), t["giai_thich"], t.get("video", [])] for t in td],
    "data/hoi-dap.json")
tao("en/bai", [[t["id"], t["thuat_ngu"], td_en.get(t["id"], {}).get("giai_thich", t["giai_thich"]), t.get("video", [])] for t in td],
    "data/en/hoi-dap.json")

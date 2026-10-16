"""Tạo bộ đoán chữ tiếp theo (trạm 6, 7 của Phòng thí nghiệm bộ não AI) từ chính các bài viết của kênh.

Mô hình n-gram nhỏ: đếm trong các bài bai/*.html (tiếng Việt) và en/bai/*.html (tiếng Anh)
xem sau 2 chữ (hoặc 1 chữ) nào thì chữ nào hay đến tiếp theo. Giữ tối đa 8 chữ tiếp theo mỗi ngữ cảnh.
Thêm --kich-ban <thư mục videos> để đếm cả lời đọc (dòng "> ") trong các kịch bản tiếng Việt.
Ra data/bo-nao/doan-chu.json và data/bo-nao/doan-chu-en.json. Chạy lại khi có thêm nhiều bài mới:
  python3 scripts/tao_doan_chu.py --kich-ban /mnt/project-files/videos
"""
import argparse, glob, html, json, re
from collections import Counter, defaultdict
from pathlib import Path

R = Path(__file__).resolve().parent.parent
TOI_DA = 8

def van_ban(f):
    s = Path(f).read_text(encoding="utf-8")
    m = re.search(r'<article class="post">(.*?)</article>', s, re.S)
    if not m:
        return ""
    s = re.sub(r"<(script|style|figure|nav|aside)\b.*?</\1>", " ", m.group(1), flags=re.S)
    s = re.sub(r"</(h[1-6]|p|li|blockquote|div|td|th)>", " . ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(s)

def tach(s):
    # Chữ (cả số, dấu nối) hoặc dấu câu đứng riêng; viết thường để đếm
    return [w.lower() for w in re.findall(r"[\w%]+(?:[-'’][\w%]+)*|[.,!?:;]", s)]

def loi_doc(f):
    # Chỉ lấy lời đọc: các dòng bắt đầu bằng "> " trong kịch bản
    return " . ".join(l[2:] for l in Path(f).read_text(encoding="utf-8", errors="ignore").splitlines() if l.startswith("> "))

def dem(files, them=()):
    ba, hai, mot = defaultdict(Counter), defaultdict(Counter), Counter()
    tong = 0
    for f, doc in [(f, van_ban) for f in files] + [(f, loi_doc) for f in them]:
        ws = tach(doc(f))
        ws = [w for i, w in enumerate(ws) if not (w == "." and i and ws[i - 1] in ".!?:")]
        tong += len(ws)
        for i, w in enumerate(ws):
            mot[w] += 1
            if i >= 1:
                hai[ws[i - 1]][w] += 1
            if i >= 2:
                ba[ws[i - 2] + " " + ws[i - 1]][w] += 1
    def gon(d, it):
        out = {}
        for k, c in d.items():
            if sum(c.values()) >= it:
                out[k] = [[w, n] for w, n in c.most_common(TOI_DA)]
        return out
    return {"so_bai": len(files), "so_kich_ban": len(them), "so_chu": tong,
            "ba": gon(ba, 3), "hai": gon(hai, 2),
            "mot": [[w, n] for w, n in mot.most_common(40)]}

def chay():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kich-ban", help="thư mục videos chứa kịch bản tiếng Việt")
    a = ap.parse_args()
    kb = []
    if a.kich_ban:
        kb = sorted(set(glob.glob(a.kich_ban + "/*/kich-ban.md") + glob.glob(a.kich_ban + "/*/kich-ban-*.md")))
    ra = R / "data" / "bo-nao"
    ra.mkdir(parents=True, exist_ok=True)
    for ten, mau in (("doan-chu.json", "bai/*.html"), ("doan-chu-en.json", "en/bai/*.html")):
        d = dem(sorted(glob.glob(str(R / mau))), kb if ten == "doan-chu.json" else ())
        d["_ghi_chu"] = "Tự tạo bởi scripts/tao_doan_chu.py từ các bài viết của kênh. ba: sau 2 chữ; hai: sau 1 chữ; mot: chữ hay gặp nhất."
        (ra / ten).write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(ten, d["so_bai"], "bài,", d["so_kich_ban"], "kịch bản,", d["so_chu"], "chữ,", len(d["ba"]), "ngữ cảnh 2 chữ,", len(d["hai"]), "ngữ cảnh 1 chữ")

if __name__ == "__main__":
    chay()

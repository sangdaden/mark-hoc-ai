"""Gom tiêu đề video từ thư mục dự án thành data/videos.json (chạy lại khi có video mới)."""
import json, re, sys, pathlib

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/videos")
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "videos.json"
SKIP = {"01-claude-lam-video", "02-lidar"}  # bản thử đầu tiên 6/10 (đã làm lại thành 01-ai-la-gi, 02-bat-dau-dung-ai)
DEN = int(sys.argv[2]) if len(sys.argv) > 2 else 162  # số video cuối được đưa lên trang (video mới: nâng số này, xem scripts/lich_ra_mat_ghi_chu.md)

out = []
for d in sorted(ROOT.iterdir()):
    m = re.match(r"(\d+)-(.+)", d.name)
    if not m or d.name in SKIP or int(m.group(1)) > DEN:
        continue
    f = next(iter(sorted(d.rglob("tieu-de-mo-ta.md"))), None)
    if not f:
        continue
    lines = f.read_text(encoding="utf-8").splitlines()
    h1 = next((l[2:] for l in lines if l.startswith("# ")), d.name)
    topic = re.split(r"Tiêu đề và mô tả\s*[:,]?\s*", h1)[-1].strip()
    topic = re.sub(r"\s*\(video \d+\)$", "", topic)
    # Từ video 132, tiêu đề H1 là tiêu đề đăng ("Câu hỏi? Series (Phần 1/4) 🤖"); script.py có SERIES và NAME
    # nên ghép lại đúng khuôn "Series (Phần x/N): Tên" mà trang dùng để tách tên series và số phần
    sp = d / "nguon" / "script.py"
    if sp.exists():
        src = sp.read_text(encoding="utf-8")
        ms = re.search(r"^SERIES\s*=\s*['\"](.+?)\s*·\s*Phần (\d+/\d+)['\"]", src, re.M)
        mn = re.search(r"^NAME\s*=\s*['\"](.+?)['\"]\s*$", src, re.M)
        if ms and mn:
            topic = f"{ms.group(1)} (Phần {ms.group(2)}): {mn.group(1)}"
    def after(label):
        for i, l in enumerate(lines):
            if l.strip().startswith(label):
                for n in lines[i + 1:]:
                    if n.strip():
                        return n.strip()
        return ""
    out.append({"so": int(m.group(1)), "slug": m.group(2), "chu_de": topic,
                "tieu_de": after("**Tiêu đề"), "mo_ta": after("**Mô tả")})
out.sort(key=lambda v: v["so"])
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(out), "video ->", OUT)

"""Gom tiêu đề video từ thư mục dự án thành data/videos.json (chạy lại khi có video mới)."""
import json, re, sys, pathlib

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/videos")
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "videos.json"
SKIP = {"01", "02", "100"}  # 01/02 bản cũ, 100 là tập đặc biệt chưa đăng
DEN = int(sys.argv[2]) if len(sys.argv) > 2 else 117  # số video cuối được đưa lên trang (118 trở đi chưa đăng)

out = []
for d in sorted(ROOT.iterdir()):
    m = re.match(r"(\d+)-(.+)", d.name)
    if not m or m.group(1) in SKIP or int(m.group(1)) > DEN:
        continue
    f = next(iter(sorted(d.rglob("tieu-de-mo-ta.md"))), None)
    if not f:
        continue
    lines = f.read_text(encoding="utf-8").splitlines()
    h1 = next((l[2:] for l in lines if l.startswith("# ")), d.name)
    topic = re.split(r"Tiêu đề và mô tả\s*[:,]?\s*", h1)[-1].strip()
    topic = re.sub(r"\s*\(video \d+\)$", "", topic)
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

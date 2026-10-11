# Ghi data/video-nhanh.json: tên và ngày ra mắt của các video nhánh 303-376 (DA, DS, DE, DevOps, Cloud, ML, DL, Robotics, AI × 8 nhánh)
# cho trang "Lộ trình theo ngành" (lo-trinh-nganh.html). Các video này chưa có trong data/videos.json nên chưa có bài viết riêng.
#   python3 scripts/tao_video_nhanh.py /mnt/project-files/videos
# Tên: dòng "Tiêu đề" trong NNN-*/tieu-de-mo-ta.md, không có thì lấy tiêu đề "## NNN · ..." trong nhanh-ngoai-ai/kich-ban-*.md.
# Ngày: bài đăng sớm nhất trùng "Series · Phần X/N" trong lich-dang-moi/ke-hoach-doi-lich.json (giờ Việt Nam). Video chưa lên lịch thì không có ngày (trang ghi "Sắp ra mắt").
import json, re, sys
from pathlib import Path

GOC = Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/videos")
RA = Path(__file__).resolve().parent.parent / "data" / "video-nhanh.json"
TU, DEN = 303, 376

def bo_emoji(s):
    s = re.sub(r"\s*#Shorts?\b", "", s)
    return re.sub(r"[\s\U0001F000-\U0001FAFF⌀-⏿☀-➿️]+$", "", s).strip()

ten = {}
for f in sorted((GOC / "nhanh-ngoai-ai").glob("kich-ban-*.md")):
    if f.name.startswith("kich-ban-thu"):
        continue
    for m in re.finditer(r"^## (\d{3}) · (.+)$", f.read_text(encoding="utf-8"), re.M):
        ten.setdefault(int(m.group(1)), m.group(2).strip())
for d in GOC.glob("3[0-9][0-9]-*"):
    so = int(d.name[:3])
    f = d / "tieu-de-mo-ta.md"
    if TU <= so <= DEN and f.exists():
        m = re.search(r"^\*\*Tiêu đề:\*\*\s*\n(.+)$", f.read_text(encoding="utf-8"), re.M)
        if m:
            ten[so] = bo_emoji(m.group(1))

ngay = {}
lich = GOC / "lich-dang-moi" / "ke-hoach-doi-lich.json"
dang = json.loads(lich.read_text(encoding="utf-8")) if lich.exists() else []
for so, t in ten.items():
    dau = t.split(":")[0]
    if "· Phần" not in dau:
        continue
    hit = sorted(r["moi"] for r in dang if (r.get("title") or "").startswith(dau + ":"))
    if hit:
        ngay[so] = hit[0][:10]

ra = {str(so): {"ten": ten[so], **({"ngay": ngay[so]} if so in ngay else {})} for so in sorted(ten) if TU <= so <= DEN}
RA.write_text("{\n" + ",\n".join(json.dumps(k) + ": " + json.dumps(v, ensure_ascii=False) for k, v in ra.items()) + "\n}\n", encoding="utf-8")
print(f"Ghi {len(ra)} video vào {RA.name}, {len(ngay)} video có ngày ra mắt")
thieu = [so for so in range(TU, DEN + 1) if so not in ten]
# Bản tiếng Anh (en/lo-trinh-nganh.html) dùng data/en/video-nhanh.json, dịch tay; trang nào cũng phải đủ hai thứ tiếng
EN = RA.parent / "en" / "video-nhanh.json"
thieu_en = [so for so in ra if so not in (json.loads(EN.read_text(encoding="utf-8")) if EN.exists() else {})]
if thieu_en:
    print("CẢNH BÁO: data/en/video-nhanh.json thiếu tên tiếng Anh cho", thieu_en)
if thieu:
    print("CẢNH BÁO: thiếu tên video", thieu)

"""Chép ebook vào trang web: PDF, ảnh bìa và 2 trang xem trước (nén nhẹ), mục lục vào data/sach.json.
Chạy lại mỗi khi ebook được dựng lại, rồi chạy scripts/tao_bai_viet.py để tạo lại sach.html:
    python3 scripts/cap_nhat_sach.py /mnt/project-files/ebook
Cần Pillow; số trang đọc bằng pypdf (không có thì lấy từ dòng "Xem video (trang N)" cuối muc-luc.md).
"""
import json, pathlib, re, shutil, sys
from PIL import Image

NGUON = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/ebook")
R = pathlib.Path(__file__).resolve().parent.parent
DICH = R / "assets" / "sach"
DICH.mkdir(parents=True, exist_ok=True)

pdf = DICH / "mark-hoc-ai-ebook.pdf"
shutil.copyfile(NGUON / "mark-hoc-ai-ebook.pdf", pdf)
xem = NGUON / "xem-truoc"
bia = Image.open(xem / "01-bia.png").convert("RGB")
bia = bia.resize((560, round(560 * bia.height / bia.width)), Image.LANCZOS)
bia.save(DICH / "bia.webp", quality=84, method=6)
bia.save(DICH / "bia.jpg", quality=82, optimize=True, progressive=True)
for ten_goc, ten in (("03-mo-chuong", "trang-mo-chuong"), ("04-trang-trong", "trang-trong")):
    im = Image.open(xem / f"{ten_goc}.png").convert("RGB")
    im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS).save(DICH / f"{ten}.webp", quality=80, method=6)

md = (NGUON / "muc-luc.md").read_text(encoding="utf-8")
dong = re.findall(r"^\| (\d+) \| (.+?) \| (\d+) \| (.+?) \|$", md, re.M)
muc = {int(m.group(1)): [l[2:].strip() for l in m.group(2).strip().split("\n")]
       for m in re.finditer(r"^### Chương (\d+)\. .+?\n((?:- .+\n?)+)", md, re.M)}
cuoi = re.search(r"^Phần cuối:\s*(.+?)\.?$", md, re.M)
try:
    import pypdf
    so_trang = len(pypdf.PdfReader(str(pdf)).pages)
except ImportError:
    so_trang = int(re.findall(r"trang (\d+)", cuoi.group(1))[-1])
d = {"_ghi_chu": "Ebook Mark học AI (sach.html). Tạo bằng scripts/cap_nhat_sach.py từ muc-luc.md của ebook; đừng sửa tay. Tên chương tiếng Anh ở data/en/sach.json.",
     "pdf": "assets/sach/mark-hoc-ai-ebook.pdf", "so_trang": so_trang, "kho": "A5",
     "dung_luong_mb": round(pdf.stat().st_size / 1048576, 1), "so_video": 300,
     "phan_cuoi": cuoi.group(1) if cuoi else "",
     "chuong": [{"so": int(a), "ten": b, "trang": int(c), "video": v, "muc": muc.get(int(a), [])} for a, b, c, v in dong]}
assert len(d["chuong"]) == 20 and all(c["muc"] for c in d["chuong"]), "Mục lục không đủ 20 chương"
(R / "data" / "sach.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("sach:", so_trang, "trang,", d["dung_luong_mb"], "MB,", sum(len(c["muc"]) for c in d["chuong"]), "mục")

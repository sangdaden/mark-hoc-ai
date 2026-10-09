"""Tạo ảnh WebP cho trang web từ thư mục video (chạy lại bao nhiêu lần cũng được, ảnh đã có thì bỏ qua).

    python3 scripts/tao_anh.py /mnt/project-files/videos            # ảnh bìa video (thẻ + đầu bài viết)
    python3 scripts/tao_anh.py /mnt/project-files/videos --lam-lai  # tạo lại kể cả ảnh đã có
    python3 scripts/tao_anh.py ... --tu 303 --den 400               # khoảng số video (mặc định từ VIDEO_MOI_TU)

Chỉ làm cho video mới: số >= VIDEO_MOI_TU trong scripts/video_moi.py (hiện là 303). Video 01-302 giữ thẻ chữ
như cũ (Sang chốt 9/10/2026), kể cả khi truyền --tu nhỏ hơn: script tự nâng lên ngưỡng.

Ảnh bìa mỗi video (assets/anh/video/<số>-<slug>-the.webp 640x360 cho thẻ, -bia.webp 1280x720 cho đầu bài):
  1. <thư mục>/<tên>_thumbnail_ngang-16x9.png (bản ngang, đa số video)
  2. không có thì ảnh dọc <tên>_thumbnail_doc-9x16.png đặt giữa nền là chính ảnh đó phóng to, làm mờ
  3. không có gì thì ảnh mẫu: nền màu logo, số video, tên video, Mark và Bit
Danh sách ảnh ghi vào data/anh.json (scripts/tao_bai_viet.py và app.js đọc file này): {"<số>": {"the", "bia", "nguon"}}.
Script chỉ đọc thư mục video, không ghi vào đó.
"""
import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from video_moi import VIDEO_MOI_TU
from PIL import Image, ImageDraw, ImageFilter, ImageFont

R = pathlib.Path(__file__).resolve().parent.parent
THAM_SO = [a for a in sys.argv[1:] if not a.startswith("--")]
def co(ten, mac_dinh):
    if ten in sys.argv:
        return int(sys.argv[sys.argv.index(ten) + 1])
    return mac_dinh
TU, DEN = co("--tu", VIDEO_MOI_TU), co("--den", 9999)
THAM_SO = [a for a in THAM_SO if a not in (str(TU), str(DEN))]
TU = max(TU, VIDEO_MOI_TU)
ROOT = pathlib.Path(THAM_SO[0] if THAM_SO else "/mnt/project-files/videos")
BRAND = ROOT.parent / "brand"
LAM_LAI = "--lam-lai" in sys.argv
OUT = R / "assets" / "anh" / "video"
DS = R / "data" / "anh.json"
SKIP = {"01-claude-lam-video", "02-lidar"}  # giống scripts/gom_video.py


def ds_video():
    """Các video trong khoảng TU..DEN, đọc thẳng từ thư mục (không cần data/videos.json đã có video đó)."""
    ten_vi = {v["so"]: v["chu_de"] for v in json.loads((R / "data" / "videos.json").read_text(encoding="utf-8"))}
    out = []
    for d in sorted(ROOT.iterdir()):
        m = re.match(r"(\d+)-(.+)", d.name)
        if not m or d.name in SKIP or d.name.endswith("-ban-hoi-bit-tra-loi") or not TU <= int(m.group(1)) <= DEN:
            continue
        if not (d / "tieu-de-mo-ta.md").exists():
            continue
        so, ten = int(m.group(1)), ten_vi.get(int(m.group(1)), "")
        sp = d / "nguon" / "script.py"
        if not ten and sp.exists():
            mn = re.search(r"^NAME\s*=\s*['\"](.+?)['\"]\s*$", sp.read_text(encoding="utf-8"), re.M)
            ten = mn.group(1) if mn else ""
        out.append({"so": so, "slug": m.group(2), "chu_de": ten or m.group(2).replace("-", " ")})
    return sorted(out, key=lambda v: v["so"])

FONT_DAM = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
FONT_VUA = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"


def ten_file(v):
    return f"{v['so']:02d}-{v['slug']}"


def luu(im, duong, rong, chat=72):
    im = im.convert("RGB")
    if im.width != rong:
        im = im.resize((rong, round(im.height * rong / im.width)), Image.LANCZOS)
    duong.parent.mkdir(parents=True, exist_ok=True)
    im.save(duong, "WEBP", quality=chat, method=6)


def tu_anh_doc(png):
    """Ảnh dọc 9:16 đặt giữa khung 16:9, nền là chính ảnh đó phóng to và làm mờ."""
    doc = Image.open(png).convert("RGB")
    W, H = 1280, 720
    nen = doc.resize((W, round(doc.height * W / doc.width)), Image.LANCZOS)
    y = (nen.height - H) // 2
    nen = nen.crop((0, y, W, y + H)).filter(ImageFilter.GaussianBlur(28))
    nen = Image.blend(nen, Image.new("RGB", (W, H), (15, 23, 42)), 0.25)
    giua = doc.resize((round(doc.width * H / doc.height), H), Image.LANCZOS)
    nen.paste(giua, ((W - giua.width) // 2, 0))
    return nen


def gradient(W, H):
    a, b, c = (37, 99, 235), (14, 165, 233), (6, 214, 160)
    im = Image.new("RGB", (W, H))
    px = im.load()
    for x in range(W):
        for y in range(0, H, 1):
            t = min(1, max(0, (x / W) * 0.8 + (y / H) * 0.2))
            if t < 0.55:
                k = t / 0.55; col = tuple(round(a[i] + (b[i] - a[i]) * k) for i in range(3))
            else:
                k = (t - 0.55) / 0.45; col = tuple(round(b[i] + (c[i] - b[i]) * k) for i in range(3))
            px[x, y] = col
    return im


def xuong_dong(d, chu, font, rong):
    dong, cur = [], ""
    for w in chu.split():
        thu = (cur + " " + w).strip()
        if d.textlength(thu, font=font) <= rong or not cur:
            cur = thu
        else:
            dong.append(cur); cur = w
    if cur:
        dong.append(cur)
    return dong


_NEN = None
def anh_mau(v):
    """Ảnh mẫu khi video chưa có thumbnail: nền màu logo, số video, tên video, Mark và Bit."""
    global _NEN
    W, H = 1280, 720
    if _NEN is None:
        _NEN = gradient(W, H)
    im = _NEN.copy().convert("RGBA")
    d = ImageDraw.Draw(im)
    logo = Image.open(R / "assets" / "logo.png").convert("RGBA").resize((88, 88), Image.LANCZOS)
    o = Image.new("RGBA", (104, 104), (255, 255, 255, 255))
    m = Image.new("L", (104, 104), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 103, 103), 24, fill=255)
    im.paste(o, (56, 48), m); im.alpha_composite(logo, (64, 56))
    d.text((180, 100), "Mark học AI", font=ImageFont.truetype(FONT_DAM, 40), fill="white", anchor="lm")
    ten = re.sub(r"^.*?\((?:Phần|Part) \d+/\d+\):\s*", "", v["chu_de"])
    f = ImageFont.truetype(FONT_DAM, 64)
    dong = xuong_dong(d, ten, f, 640)[:4]
    y = max(270, 390 - len(dong) * 40)
    d.rounded_rectangle((60, y - 92, 60 + d.textlength(f"#{v['so']}", font=ImageFont.truetype(FONT_VUA, 34)) + 44, y - 36), 28, fill=(250, 204, 21))
    d.text((82, y - 64), f"#{v['so']}", font=ImageFont.truetype(FONT_VUA, 34), fill=(15, 23, 42), anchor="lm")
    for i, l in enumerate(dong):
        d.text((60, y + i * 80), l, font=f, fill="white")
    mb = BRAND / "mascot" / "chinh-thuc" / "mark-va-bit.png"
    if mb.exists():
        mv = Image.open(mb).convert("RGBA")
        mv = mv.resize((round(mv.width * 520 / mv.height), 520), Image.LANCZOS)
        im.alpha_composite(mv, (W - mv.width - 30, H - mv.height - 40))
    return im.convert("RGB")


def anh_bia():
    ds = json.loads(DS.read_text(encoding="utf-8")) if DS.exists() else {}
    ds = {k: v for k, v in ds.items() if int(k) >= VIDEO_MOI_TU}  # bỏ mục cũ dưới ngưỡng nếu có
    dem = {"ngang": 0, "doc": 0, "mau": 0, "bo-qua": 0}
    for v in ds_video():
        ten = ten_file(v)
        thu_muc = ROOT / ten
        the, bia = OUT / f"{ten}-the.webp", OUT / f"{ten}-bia.webp"
        muc = ds.get(str(v["so"]), {})
        if the.exists() and bia.exists() and not LAM_LAI and muc.get("the"):
            dem["bo-qua"] += 1
            continue
        ngang = thu_muc / f"{ten}_thumbnail_ngang-16x9.png"
        doc = thu_muc / f"{ten}_thumbnail_doc-9x16.png"
        if ngang.exists():
            im, nguon = Image.open(ngang), "ngang"
        elif doc.exists():
            im, nguon = tu_anh_doc(doc), "doc"
        else:
            im, nguon = anh_mau(v), "mau"
        if im.size[0] * 9 != im.size[1] * 16:  # cắt cho đúng 16:9
            W, H = im.size; h = round(W * 9 / 16)
            im = im.crop((0, (H - h) // 2, W, (H - h) // 2 + h)) if h <= H else im
        luu(im, bia, 1280, 70)
        luu(im, the, 640, 72)
        muc.update({"the": f"assets/anh/video/{ten}-the.webp", "bia": f"assets/anh/video/{ten}-bia.webp", "nguon": nguon})
        ds[str(v["so"])] = muc
        dem[nguon] += 1
    return ds, dem


def ghi(ds):
    ds = {k: ds[k] for k in sorted(ds, key=int)}
    DS.write_text(json.dumps(ds, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    ds, dem = anh_bia()
    ghi(ds)
    print("ảnh bìa video:", dem)

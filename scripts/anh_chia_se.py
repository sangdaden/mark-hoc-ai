"""Ảnh chia sẻ 1200x630 cho từng bài video (thẻ og:image khi dán link lên Facebook, Zalo, Messenger).

scripts/tao_bai_viet.py gọi ve() cho mỗi bài, VI và EN riêng: assets/anh/chia-se/<tên bài>.jpg và
assets/anh/chia-se/en/<tên bài>.jpg. Ảnh gồm nền màu logo, tên series và phần, tên video thật to, số video, ngày lên
kênh, bên phải là ảnh bìa series (data/series-bia.json) đặt nghiêng như một thẻ video có nút phát.
Ảnh đã có và nội dung không đổi thì bỏ qua (dấu vân tay nội dung ghi trong data/anh-chia-se.json).
"""
import hashlib, json, pathlib
from PIL import Image, ImageDraw, ImageFilter, ImageFont

R = pathlib.Path(__file__).resolve().parent.parent
W, H = 1200, 630
FONT_DAM = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_VUA = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
PHIEN_BAN = "3"  # đổi khi đổi bố cục để vẽ lại hết
DAU = R / "data" / "anh-chia-se.json"
_dau = json.loads(DAU.read_text(encoding="utf-8")) if DAU.exists() else {}
_dung = set()
_nen = None


def _nen_mau():
    """Nền chuyển màu như assets/og.png: xanh dương góc trái trên sang xanh ngọc góc phải dưới."""
    global _nen
    if _nen is None:
        a, b, c = (37, 99, 235), (14, 165, 233), (6, 196, 160)
        nho = Image.new("RGB", (120, 63))
        px = nho.load()
        for y in range(63):
            for x in range(120):
                k = (x / 119) * 0.75 + (y / 62) * 0.25
                m, n, kk = (a, b, k / 0.5) if k < 0.5 else (b, c, (k - 0.5) / 0.5)
                px[x, y] = tuple(round(m[i] + (n[i] - m[i]) * kk) for i in range(3))
        _nen = nho.resize((W, H), Image.BICUBIC)
    return _nen.copy()


def _xuong_dong(d, chu, font, rong):
    dong, cur = [], ""
    for tu in chu.split():
        thu = (cur + " " + tu).strip()
        if d.textlength(thu, font=font) <= rong or not cur:
            cur = thu
        else:
            dong.append(cur)
            cur = tu
    if cur:
        dong.append(cur)
    return dong


def _bia_chu(so, ten_series, rong, cao):
    """Series chưa có ảnh bìa riêng (tập phụ 5.x, 69.x): ô màu mực với số video thật to và tên series."""
    anh = Image.new("RGB", (rong, cao), (15, 23, 42))
    d = ImageDraw.Draw(anh)
    d.ellipse((rong - 190, -90, rong + 90, 190), fill=(30, 58, 138))
    d.ellipse((-80, cao - 120, 140, cao + 100), fill=(17, 94, 89))
    d.text((36, 34), f"#{so}", font=ImageFont.truetype(FONT_DAM, 100), fill=(250, 204, 21))
    f = ImageFont.truetype(FONT_VUA, 30)
    y = 162
    for x in _xuong_dong(d, ten_series, f, rong - 140)[:2]:
        d.text((42, y), x, font=f, fill="white")
        y += 42
    return anh


def _the_bia(bia, so, ten_series):
    """Ảnh bìa series thành thẻ bo góc, viền trắng, nút phát ở giữa, xoay nhẹ, có bóng."""
    rong, cao, vien = 440, 248, 9
    if bia and (R / bia).exists():
        anh = Image.open(R / bia).convert("RGB").resize((rong, cao), Image.LANCZOS)
    else:
        anh = _bia_chu(so, ten_series, rong, cao)
    the = Image.new("RGBA", (rong + 2 * vien, cao + 2 * vien), (0, 0, 0, 0))
    mask = Image.new("L", the.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, the.width - 1, the.height - 1), 26, fill=255)
    nen = Image.new("RGBA", the.size, (255, 255, 255, 255))
    the.paste(nen, (0, 0), mask)
    m2 = Image.new("L", (rong, cao), 0)
    ImageDraw.Draw(m2).rounded_rectangle((0, 0, rong - 1, cao - 1), 18, fill=255)
    the.paste(anh, (vien, vien), m2)
    d = ImageDraw.Draw(the)
    cx, cy, r = the.width - 64, the.height - 64, 32  # nút phát nhỏ ở góc, không che chữ trên ảnh bìa
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(15, 23, 42, 215))
    k = r / 46
    d.polygon([(cx - 14 * k, cy - 22 * k), (cx - 14 * k, cy + 22 * k), (cx + 24 * k, cy)], fill=(255, 255, 255, 255))
    the = the.rotate(4, resample=Image.BICUBIC, expand=True)
    bong = Image.new("RGBA", (the.width + 60, the.height + 60), (0, 0, 0, 0))
    bong.paste((15, 23, 42, 110), (30, 42), the.split()[3])
    bong = bong.filter(ImageFilter.GaussianBlur(16))
    bong.alpha_composite(the, (30, 30))
    return bong


def ve(duong_dan, tieu_de, nhan, so, ngay_chu, bia, ten_series="", logo="assets/logo.png"):
    """Vẽ (nếu cần) ảnh chia sẻ, trả về đường dẫn tương đối để ghi vào og:image."""
    _dung.add(duong_dan)
    vt = hashlib.sha1(json.dumps([PHIEN_BAN, tieu_de, nhan, so, ngay_chu, bia, ten_series], ensure_ascii=False).encode()).hexdigest()[:12]
    dich = R / duong_dan
    if _dau.get(duong_dan) == vt and dich.exists():
        return duong_dan
    im = _nen_mau().convert("RGBA")
    d = ImageDraw.Draw(im)

    # bên phải: thẻ ảnh bìa series
    the = _the_bia(bia, so, ten_series)
    im.alpha_composite(the, (W - the.width + 4, (H - the.height) // 2 + 6))

    # trên cùng: logo kênh
    lg = Image.open(R / logo).convert("RGBA").resize((64, 64), Image.LANCZOS)
    o = Image.new("RGBA", (76, 76), (0, 0, 0, 0))
    ImageDraw.Draw(o).rounded_rectangle((0, 0, 75, 75), 18, fill=(255, 255, 255, 255))
    o.alpha_composite(lg, (6, 6))
    im.alpha_composite(o, (60, 48))
    f_kenh = ImageFont.truetype(FONT_DAM, 36)
    d.text((152, 86), "Mark học", font=f_kenh, fill="white", anchor="lm")
    d.text((152 + d.textlength("Mark học ", font=f_kenh), 86), "AI", font=f_kenh, fill=(250, 204, 21), anchor="lm")

    # nhãn vàng: series · phần
    rong_chu = 580
    f_nhan = ImageFont.truetype(FONT_VUA, 26)
    if d.textlength(nhan, font=f_nhan) > rong_chu - 40:
        while d.textlength(nhan + "…", font=f_nhan) > rong_chu - 40:
            nhan = nhan[:-1]
        nhan = nhan.rstrip(" ·") + "…"
    y_nhan = 168
    d.rounded_rectangle((60, y_nhan, 60 + d.textlength(nhan, font=f_nhan) + 40, y_nhan + 50), 25, fill=(250, 204, 21))
    d.text((80, y_nhan + 25), nhan, font=f_nhan, fill=(15, 23, 42), anchor="lm")

    # tên video: cỡ chữ lớn nhất mà vừa 3 dòng
    y_day = H - 104 - 26  # chữ không chạm hàng số video bên dưới
    for co in (76, 70, 64, 58, 52, 47, 42):
        f = ImageFont.truetype(FONT_DAM, co)
        dong = _xuong_dong(d, tieu_de, f, rong_chu)
        if (len(dong) <= 3 and all(d.textlength(x, font=f) <= rong_chu for x in dong)
                and y_nhan + 74 + len(dong) * round(co * 1.16) <= y_day):
            break
    dong = dong[:3]
    cao_dong = round(co * 1.16)
    y = y_nhan + 74
    for x in dong:
        d.text((58, y), x, font=f, fill="white")
        y += cao_dong

    # dưới cùng: số video + ngày lên kênh
    f_so = ImageFont.truetype(FONT_DAM, 30)
    f_ngay = ImageFont.truetype(FONT_VUA, 24)
    y0 = H - 104
    nhan_so = f"#{so}"
    r_so = d.textlength(nhan_so, font=f_so) + 44
    d.rounded_rectangle((60, y0, 60 + r_so, y0 + 56), 28, fill=(15, 23, 42))
    d.text((60 + r_so / 2, y0 + 28), nhan_so, font=f_so, fill="white", anchor="mm")
    if ngay_chu:
        x0 = 60 + r_so + 14
        r_ng = d.textlength(ngay_chu, font=f_ngay) + 40 + 30
        lop = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(lop).rounded_rectangle((x0, y0, x0 + r_ng, y0 + 56), 28, fill=(255, 255, 255, 46), outline=(255, 255, 255, 150), width=2)
        im.alpha_composite(lop)
        d = ImageDraw.Draw(im)
        # biểu tượng lịch nhỏ, rồi ngày (không ghi "lên kênh" hay "ra mắt" để ảnh đúng cả trước lẫn sau ngày đó)
        lx, ly = x0 + 20, y0 + 16
        d.rounded_rectangle((lx, ly + 2, lx + 24, ly + 26), 5, outline="white", width=3)
        d.line((lx, ly + 10, lx + 24, ly + 10), fill="white", width=3)
        d.line((lx + 7, ly - 2, lx + 7, ly + 5), fill="white", width=3)
        d.line((lx + 17, ly - 2, lx + 17, ly + 5), fill="white", width=3)
        d.text((x0 + 56, y0 + 28), ngay_chu, font=f_ngay, fill="white", anchor="lm")

    dich.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(dich, "JPEG", quality=74, optimize=True, progressive=True)
    _dau[duong_dan] = vt
    return duong_dan


def luu():
    """Ghi dấu vân tay; ảnh của bài không còn thì xóa khỏi danh sách (file ảnh để nguyên, không tự xóa)."""
    giu = {k: v for k, v in sorted(_dau.items()) if k in _dung}
    DAU.write_text(json.dumps(giu, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")

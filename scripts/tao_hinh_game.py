"""Hình Mark + Bit cho trang Game và đầu mỗi trang game (Sang chọn 20/10/2026: mỗi game một cặp tư thế riêng,
không dùng lại "Mark chào" của Từ điển AI, Lộ trình). Ghép hai PNG tư thế chính thức thành một WebP nền trong.

    python3 scripts/tao_hinh_game.py     # đọc /mnt/project-files/brand/mascot/chinh-thuc/trang-thai, ghi assets/game/<tên>.webp

Đổi cặp tư thế: sửa CAP rồi chạy lại.
"""
import pathlib
from PIL import Image

R = pathlib.Path(__file__).resolve().parent.parent
NGUON = pathlib.Path("/mnt/project-files/brand/mascot/chinh-thuc/trang-thai")
OUT = R / "assets" / "game"
W, H = 400, 378          # gấp đôi khung head-art 200x189 cho màn hình nét

CAP = {
    "game": ("mark-ngau", "bit-ngau"),                    # trang Thế giới game
    "phieu-luu": ("mark-chien-thang", "bit-cuoi-lon"),
    "chan-lua": ("mark-dien-thoai", "bit-canh-bao"),
    "dem-lai-xe": ("mark-thac-mac", "bit-giai-thich"),
    "duong-doan-chu": ("mark-ok", "bit-bay"),
}


def cat(p):
    im = Image.open(p).convert("RGBA")
    return im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())


def lam(ten, mark, bit):
    m, b = cat(NGUON / f"{mark}.png"), cat(NGUON / f"{bit}.png")
    m.thumbnail((int(W * 0.72), H - 6), Image.LANCZOS)
    b.thumbnail((int(W * 0.34), int(H * 0.42)), Image.LANCZOS)
    nen = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    nen.alpha_composite(m, (int(W * 0.04), H - m.height))
    nen.alpha_composite(b, (W - b.width - 4, 6))
    nen.save(OUT / f"{ten}.webp", "WEBP", quality=86, method=6)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for ten, (mark, bit) in CAP.items():
        lam(ten, mark, bit)
        print(ten, (OUT / f"{ten}.webp").stat().st_size, "byte")

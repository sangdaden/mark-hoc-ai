"""Mark và Bit chuyển động cho trang web: WebP động nhỏ + một ảnh đứng yên (cho người bật "giảm chuyển động").

    python3 scripts/tao_mascot.py                    # đọc /mnt/project-files/brand/mascot/chinh-thuc/trang-thai/dong
    python3 scripts/tao_mascot.py <thư mục dong> --lam-lai

Nguồn: mỗi trạng thái là một thư mục 16 khung PNG nền trong (00.png ... 15.png), chạy vòng lặp.
Script lấy 8 khung (cách một khung), cắt sát hình theo khung bao chung của mọi khung (để hình không nhảy),
thu về cao CAO px, ghi assets/mascot/<tên>.webp (động, lặp mãi) và assets/mascot/<tên>-tinh.webp (khung đầu).
Chạy lại bao nhiêu lần cũng được: ảnh đã có thì bỏ qua (--lam-lai để tạo lại). Kích thước ảnh in ra cuối,
dùng cho width/height trong HTML (mỗi chỗ dùng: xem DUNG_O).
"""
import json, pathlib, sys
from PIL import Image

R = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
NGUON = pathlib.Path(args[0] if args else "/mnt/project-files/brand/mascot/chinh-thuc/trang-thai/dong")
OUT = R / "assets" / "mascot"
LAM_LAI = "--lam-lai" in sys.argv
CAO = 150          # px; hiển thị nhỏ hơn (40-150 px) nên vẫn nét trên màn hình mật độ cao
KHUNG_MS = 170     # mỗi khung (8 khung, vòng ~1,4 s)

# Trạng thái dùng trên trang và chỗ dùng
DUNG_O = {
    "mark-chien-thang": "bài kiểm tra và câu hỏi Lộ trình 7 ngày: trả lời đúng",
    "mark-dau-dau": "bài kiểm tra và câu hỏi Lộ trình 7 ngày: trả lời chưa đúng",
    "mark-nhun-vai": "trang chủ: tìm không ra video nào",
    "mark-trinh-bay": "trang chủ: khung giới thiệu sách miễn phí",
    "mark-chi-len": "trang chủ: khung mời Lộ trình 7 ngày",
    "bit-dang-noi": "Bit trợ lý: lúc Bit đang nói (bóng thoại)",
}


def lam(ten):
    d = NGUON / ten
    khung = [Image.open(d / f"{i:02d}.png").convert("RGBA") for i in range(0, 16, 2)]
    hop = None
    for k in khung:
        b = k.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        hop = b if hop is None else (min(hop[0], b[0]), min(hop[1], b[1]), max(hop[2], b[2]), max(hop[3], b[3]))
    pad = 6
    hop = (max(0, hop[0] - pad), max(0, hop[1] - pad), min(khung[0].width, hop[2] + pad), min(khung[0].height, hop[3] + pad))
    rong = round((hop[2] - hop[0]) * CAO / (hop[3] - hop[1]))
    khung = [k.crop(hop).resize((rong, CAO), Image.LANCZOS) for k in khung]
    OUT.mkdir(parents=True, exist_ok=True)
    khung[0].save(OUT / f"{ten}.webp", save_all=True, append_images=khung[1:], duration=KHUNG_MS, loop=0,
                  quality=55, alpha_quality=40, method=6)
    khung[0].save(OUT / f"{ten}-tinh.webp", quality=72, alpha_quality=70, method=6)
    return rong, CAO


if __name__ == "__main__":
    for ten in DUNG_O:
        f = OUT / f"{ten}.webp"
        if f.exists() and (OUT / f"{ten}-tinh.webp").exists() and not LAM_LAI:
            w, h = Image.open(f).size
        else:
            w, h = lam(ten)
        kb = (f.stat().st_size + (OUT / f"{ten}-tinh.webp").stat().st_size) / 1024
        print(f"{ten}: {w}x{h}, {kb:.0f} KB  ({DUNG_O[ten]})")

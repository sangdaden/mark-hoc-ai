"""Cập nhật data/youtube-id.json: mã video YouTube đã đăng của từng video mới, để bài viết nhúng trình phát.

    python3 scripts/cap_nhat_youtube.py                         # đọc /mnt/project-files/videos/so-cai/so-cai.json
    python3 scripts/cap_nhat_youtube.py <đường dẫn so-cai.json>
    python3 scripts/cap_nhat_youtube.py --thu 303=aaaaaaaaaaa  # thêm mã giả để thử giao diện (không dùng khi đăng thật)

Chạy lại mỗi tuần (sau khi cập nhật sổ cái), rồi chạy scripts/tao_bai_viet.py.
Nguồn: bai_metricool trong sổ cái, bài có networks[].network == "youtube", status "PUBLISHED" và publicUrl;
số video lấy từ trường _video ("<số>-<slug>_<bản>"). Bài tổng hợp (tron-bo) không gắn với một số video nên bỏ qua.
Mỗi video chọn: bản ngang (video dài) trước, rồi bản dọc chính (Short), cuối cùng mới tới clip cắt từ video.
Chỉ ghi video có số >= VIDEO_MOI_TU (scripts/video_moi.py); video 01-302 giữ nút "Xem video" như cũ.
Kết quả: {"<số>": {"id": "<mã 11 ký tự>", "loai": "dai" | "short"}}.
"""
import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from video_moi import VIDEO_MOI_TU

R = pathlib.Path(__file__).resolve().parent.parent
OUT = R / "data" / "youtube-id.json"
args = [a for a in sys.argv[1:] if not a.startswith("--") and "=" not in a]
SO_CAI = pathlib.Path(args[0] if args else "/mnt/project-files/videos/so-cai/so-cai.json")


def ma_youtube(url):
    m = re.search(r"(?:v=|youtu\.be/|/shorts/|/embed/)([A-Za-z0-9_-]{11})", url or "")
    return m.group(1) if m else None


def uu_tien(ban):
    if "clip" in ban:
        return 0, "short"
    if "ngang" in ban:
        return 2, "dai"
    return 1, "short"


def doc_so_cai():
    d = json.loads(SO_CAI.read_text(encoding="utf-8"))
    chon = {}
    for bai in d.get("bai_metricool", []):
        m = re.match(r"(\d+)-[^_]+_(.+)$", bai.get("_video") or "")
        if not m:
            continue
        so, ban = int(m.group(1)), m.group(2)
        for n in bai.get("networks", []):
            ma = ma_youtube(n.get("publicUrl")) if n.get("network") == "youtube" and n.get("status") == "PUBLISHED" else None
            if not ma:
                continue
            diem, loai = uu_tien(ban)
            if so not in chon or diem > chon[so][0]:
                chon[so] = (diem, {"id": ma, "loai": loai})
    return {so: x for so, (_, x) in chon.items()}


if __name__ == "__main__":
    tat_ca = doc_so_cai() if SO_CAI.exists() else {}
    if not SO_CAI.exists():
        print("không thấy sổ cái", SO_CAI)
    for a in [x for x in sys.argv[1:] if re.match(r"\d+=[A-Za-z0-9_-]{11}(:dai|:short)?$", x)] if "--thu" in sys.argv else []:
        so, ma = a.split("=")
        ma, _, loai = ma.partition(":")
        tat_ca[int(so)] = {"id": ma, "loai": loai or "dai"}
    moi = {str(so): tat_ca[so] for so in sorted(tat_ca) if so >= VIDEO_MOI_TU}
    OUT.write_text(json.dumps(moi, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"YouTube đã đăng: {len(tat_ca)} video (số nhỏ nhất {min(tat_ca) if tat_ca else '-'}), "
          f"ghi {len(moi)} video từ {VIDEO_MOI_TU} vào {OUT.relative_to(R)}")

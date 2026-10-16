"""Danh sách trò chơi trên web gắn với video: mỗi trò chơi (hoặc mỗi trạm) là MỘT file data/tro-choi/<tên>.json.

Thêm trò chơi mới = thêm một file mới ở đây, không sửa danh sách chung nào, nên các PR trò chơi không còn
đụng nhau (trước 16/10 danh sách nằm trong scripts/tao_bai_viet.py, PR nào cũng sửa cùng chỗ).

Mỗi file:
  "thu_tu":  số để xếp thứ tự thẻ "Chơi thử" trong bài (nhỏ trước; trò mới lấy số lớn hơn, trùng số cũng được)
  "url":     trang trò chơi, có thể kèm ?tram=...; "{so}" được thay bằng số video
  "ten", "moi": {"vi": ..., "en": ...}  tên và câu mời chơi
  "hinh":    kiểu hình xem trước nhỏ (hinh_choi() trong tao_bai_viet.py)
  video gắn trò chơi, một trong hai cách:
    "video": ["19", "60"]                                   ghi thẳng
    "video_tu": {"file": "cuoc-goi", "duong": "video_lien_quan"}   lấy từ data/<file>.json
        "duong" đi theo khóa, "x[]" là duyệt từng phần tử của danh sách x: "ca[].video", "may[].video[]"
  "theo_video" (không bắt buộc): bài của mỗi video mở thẳng đúng phần của nó, vd. Máy tính đời thật:
    {"file": "may-tinh", "danh_sach": "may", "video": "video", "them": "?may={id}"}

    python3 scripts/tro_choi.py    # ghi data/tuong-tac.json (tao_bai_viet.py cũng tự ghi khi chạy)
"""
import json, pathlib

R = pathlib.Path(__file__).resolve().parent.parent
THU_MUC = R / "data" / "tro-choi"


def _doc(ten):
    return json.loads((R / "data" / f"{ten}.json").read_text(encoding="utf-8"))


def _theo_duong(d, duong):
    cur = [d]
    for buoc in duong.split("."):
        ds = buoc.endswith("[]")
        khoa = buoc[:-2] if ds else buoc
        cur = [x[khoa] for x in cur] if khoa else cur
        if ds:
            cur = [y for x in cur for y in x]
    return cur


def video_cua(g):
    if "video" in g:
        ds = g["video"]
    else:
        nguon = g["video_tu"]
        ds = _theo_duong(_doc(nguon["file"]), nguon["duong"])
        if len(ds) == 1 and isinstance(ds[0], list):
            ds = ds[0]
    return {str(x) for x in ds}


def doc_tro_choi():
    """Các trò chơi theo thứ tự (thu_tu, tên file)."""
    ds = []
    for f in sorted(THU_MUC.glob("*.json")):
        g = json.loads(f.read_text(encoding="utf-8"))
        g["_file"] = f.stem
        ds.append(g)
    return sorted(ds, key=lambda g: (g.get("thu_tu", 999), g["_file"]))


def tuong_tac():
    """{số video: [(url, (tên vi, en), (mời vi, en), hình)]} theo thứ tự trò chơi."""
    kq = {}
    for g in doc_tro_choi():
        them = {}
        tv = g.get("theo_video")
        if tv:
            for m in _doc(tv["file"])[tv["danh_sach"]]:
                for so in m[tv["video"]]:
                    them[str(so)] = tv["them"].format(**m)
        for so in video_cua(g):
            kq.setdefault(so, []).append((g["url"].replace("{so}", so) + them.get(so, ""),
                                          (g["ten"]["vi"], g["ten"]["en"]), (g["moi"]["vi"], g["moi"]["en"]), g["hinh"]))
    return kq


def ghi_tuong_tac(tt=None):
    tt = tuong_tac() if tt is None else tt
    so_key = lambda k: [float(x) for x in k.split(".")]
    (R / "data" / "tuong-tac.json").write_text(json.dumps({"_ghi_chu": "Tự tạo bởi scripts/tro_choi.py từ data/tro-choi/*.json: số video có trò chơi tương tác trên web, app.js gắn nhãn Tương tác.",
                                                          "video": sorted(tt, key=so_key)}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    ghi_tuong_tac()
    print("data/tuong-tac.json:", len(tuong_tac()), "video")

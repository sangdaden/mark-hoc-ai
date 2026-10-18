"""Popup "Cách chơi" cho trò chơi trên web (Bit dẫn đường, huong-dan.js + assets/huong-dan.css).

Trang nào có file data/huong-dan/<tên trang>.json (vd. lua-dao-hay-that.json cho lua-dao-hay-that.html) thì trang()
trong tao_bai_viet.py tự nhúng các bước của ngôn ngữ đang tạo và nạp popup. Trò chơi mới chỉ cần thêm một file như vậy.

Mỗi file:
  "buoc": [ {"chon": ".ld-chon", "vi": "...", "en": "..."}, ... ]
      chon: bộ chọn CSS của chỗ cần chỉ (lấy class/id có sẵn trong trò). Khớp nhiều chỗ thì lấy chỗ đầu tiên đang hiện.
            Bỏ trống, hoặc chỗ đó chưa hiện, thì lời Bit nằm giữa màn hình.
      "bo_neu_an": true  bỏ qua bước này khi chỗ của nó không hiện (vd. ngăn trạm bị ẩn khi trò mở trong trang bài)
      vi/en: lời Bit, có thể thêm dấu nhấn (huong-dan.js dựng thành thẻ, lồng nhau được):
            **đậm**, *nghiêng*, [[tên nút]], !!lưu ý!! (cam đỏ), ++mẹo, điều tốt++ (xanh lá)
  hoặc "nhom": [ {"id": "cat-manh", "khi": "#tram-cat-manh", "buoc": [...]}, ... ]
      trang nhiều trạm: nhóm đầu tiên có "khi" đang hiện là nhóm dùng; mỗi nhóm tự mở ở lần đầu vào trạm đó.
"""
import json, pathlib

R = pathlib.Path(__file__).resolve().parent.parent
THU_MUC = R / "data" / "huong-dan"


def _buoc(ds, lg):
    kq = []
    for b in ds:
        x = {"chon": b.get("chon", ""), "chu": b[lg]}
        if b.get("bo_neu_an"):
            x["bo_neu_an"] = True
        kq.append(x)
    return kq


def du_lieu(ten, lg):
    f = THU_MUC / f"{ten}.json"
    if not f.exists():
        return None
    d = json.loads(f.read_text(encoding="utf-8"))
    kq = {"ten": ten}
    if "nhom" in d:
        kq["nhom"] = [{"id": g["id"], "khi": g["khi"], "buoc": _buoc(g["buoc"], lg)} for g in d["nhom"]]
    else:
        kq["buoc"] = _buoc(d["buoc"], lg)
    return kq


def the(goc, p, lg):
    """Đoạn HTML chèn cuối trang (rỗng nếu trang không có hướng dẫn). goc: vd. "lua-dao-hay-that.html"."""
    if "/" in goc or not goc.endswith(".html"):
        return ""
    d = du_lieu(goc[:-5], lg)
    if d is None:
        return ""
    js = json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return (f'<link rel="stylesheet" href="{p}assets/huong-dan.css?v=dev">\n'
            f'<script type="application/json" id="huong-dan-du-lieu" data-p="{p}">{js}</script>\n'
            f'<script src="{p}huong-dan.js?v=dev" defer></script>\n')

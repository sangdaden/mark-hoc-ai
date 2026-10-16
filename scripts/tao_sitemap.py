"""Tạo sitemap.xml từ chính các trang .html đang có (cả VI lẫn EN).

sitemap.xml không lưu trong git: pages.yml chạy script này lúc đăng web (trước tao_bai_bao.py, script đó tự chèn
các bài Bài báo AI đã mở), kiem-tra.yml chạy trước khi kiểm tra PR, và tao_bai_viet.py / tao_vu_tru_khac.py gọi lại
khi chạy ở máy. Nhờ vậy các PR thêm trang không còn cùng sửa một file (trước 16/10 PR trò chơi nào cũng conflict ở đây).

Trang nào vào sitemap: mọi file .html ở thư mục gốc, bai/, vu-tru-khac/ và bản en/ tương ứng, trừ trang có
<meta name="robots" content="noindex"> (404, chứng chỉ) và góc Bài báo AI (tao_bai_bao.py lo phần đó theo ngày mở).
Ưu tiên: bảng UU_TIEN bên dưới; trang trò chơi (url trong data/tro-choi/*.json) 0.7; bài video 0.6; Vũ Trụ Khác 0.5;
còn lại 0.6.

    python3 scripts/tao_sitemap.py
"""
import json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import tro_choi

R = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://markhocai.com/"
UU_TIEN = {"": "1.0", "tu-dien.html": "0.8", "kiem-tra.html": "0.8", "lo-trinh-7-ngay.html": "0.8", "sach.html": "0.8",
           "hoi-bit.html": "0.8", "lo-trinh-nganh.html": "0.8", "phieu-luu.html": "0.7", "hop-tac.html": "0.5",
           "ung-ho.html": "0.4", "quyen-rieng-tu.html": "0.3", "dieu-khoan.html": "0.3"}
NOINDEX = re.compile(r'<meta\s+name="robots"\s+content="[^"]*noindex', re.I)


def _co_lap_chi_muc(f):
    return not NOINDEX.search(f.read_text(encoding="utf-8", errors="ignore")[:4000])


def _trang(thu_muc):
    """Đường dẫn trang (không kèm en/) theo thứ tự: trang gốc, bài video, Vũ Trụ Khác."""
    goc = sorted(f.name for f in thu_muc.glob("*.html")
                 if not f.name.startswith("bai-bao") and _co_lap_chi_muc(f))
    goc = ["" if g == "index.html" else g for g in goc]
    goc.sort(key=lambda g: (g != "", g))
    bai = sorted(f"bai/{f.name}" for f in (thu_muc / "bai").glob("*.html") if _co_lap_chi_muc(f))
    sach = json.loads((R / "data" / "vu-tru-khac.json").read_text(encoding="utf-8"))
    vtk = [f'vu-tru-khac/{b["slug"]}.html' for b in sorted(sach, key=lambda b: b["so"])
           if (thu_muc / "vu-tru-khac" / f'{b["slug"]}.html').exists()]
    return goc, bai, vtk


def tao():
    tro = {g["url"].split("?")[0] for g in tro_choi.doc_tro_choi()}
    dong = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for tien_to in ("", "en/"):
        goc, bai, vtk = _trang(R / tien_to if tien_to else R)
        for d in goc:
            u = UU_TIEN.get(d) or ("0.7" if d in tro else ("0.5" if d == "vu-tru-khac.html" else "0.6"))
            dong.append(f"  <url><loc>{BASE}{tien_to}{d}</loc><priority>{u}</priority></url>")
        dong += [f"  <url><loc>{BASE}{tien_to}{d}</loc><priority>0.6</priority></url>" for d in bai]
        dong += [f"  <url><loc>{BASE}{tien_to}{d}</loc><priority>0.5</priority></url>" for d in vtk]
    dong.append("</urlset>")
    return dong


def ghi():
    dong = tao()
    (R / "sitemap.xml").write_text("\n".join(dong) + "\n", encoding="utf-8")
    return len(dong) - 3


if __name__ == "__main__":
    print("sitemap.xml:", ghi(), "trang")

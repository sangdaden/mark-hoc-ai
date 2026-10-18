"""Link ngắn cho video: markhocai.com/t/<số video> mở thẳng trạm thực hành hoặc trò chơi của video đó.

Cuối video đọc "Thử ngay ở markhocai chấm com gạch t gạch <số>" (hoặc hiện mã QR) thay vì đưa người xem về trang chủ.
Mỗi link là một trang chuyển hướng t/<số>/index.html (noindex, không vào sitemap), tạo từ:
  1. trò chơi riêng gắn video đó (data/tro-choi/*.json trừ các trang thực hành theo nghề, scripts/tro_choi.py);
  2. nếu không có: trạm ở các trang thực hành có "video" chứa số đó (data/thuc-hanh/*.json, data/ai-y-te.json "nang_cao" và
     "tram_lien_ket"), trạm Cơ bản trước trạm Nâng cao;
  3. cuối cùng: trang thực hành theo nghề gắn video đó.
Xóa rồi tạo lại cả thư mục t/ mỗi lần chạy. tao_bai_viet.py tự gọi; chạy riêng: python3 scripts/tao_link_ngan.py
"""
import json, pathlib, shutil, sys

R = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / "scripts"))
import tro_choi  # noqa: E402


def _tram():
    """[(số video, url, nâng cao?)] từ mọi trang thực hành."""
    ds = []
    for f in sorted((R / "data" / "thuc-hanh").glob("*.json")):
        for x in json.loads(f.read_text(encoding="utf-8"))["tram"]:
            for s in x.get("video", []):
                ds.append((str(s), f"{f.stem}.html?tram={x['id']}", x.get("cap") == "nang-cao"))
    y = json.loads((R / "data" / "ai-y-te.json").read_text(encoding="utf-8"))
    for k, v in y.get("tram_lien_ket", {}).items():
        if isinstance(v, dict):
            ds += [(str(s), f"ai-y-te.html?tram={k}", False) for s in v.get("video", [])]
    for x in y.get("nang_cao", []):
        ds += [(str(s), f"ai-y-te.html?tram={x['id']}", True) for s in x.get("video", [])]
    return ds


def ban_do():
    """{số video: url đích (tương đối với gốc trang)}."""
    dich, trang_th = {}, {f.stem + ".html" for f in (R / "data" / "thuc-hanh").glob("*.json")} | {"ai-y-te.html"}
    tc = tro_choi.tuong_tac()
    for s, ds in tc.items():  # trò chơi riêng của video (Thợ ghép, Cuộc gọi giả giọng...) đúng ý video nhất
        for url, *_ in ds:
            if url.split("?")[0] not in trang_th:
                dich.setdefault(s, url.replace("{so}", s))
    for s, url, nc in sorted(_tram(), key=lambda x: x[2]):
        dich.setdefault(s, url)
    for s, ds in tc.items():
        for url, *_ in ds:
            dich.setdefault(s, url.replace("{so}", s))
    return dict(sorted(dich.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 10**9))


def ghi():
    thu_muc = R / "t"
    if thu_muc.exists():
        shutil.rmtree(thu_muc)
    dich = ban_do()
    for s, url in dich.items():
        f = thu_muc / s / "index.html"
        f.parent.mkdir(parents=True, exist_ok=True)
        u = "../../" + url
        f.write_text(f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Thử ngay video {s} | Mark học AI</title>
<!-- Link ngắn của video {s} (scripts/tao_link_ngan.py, tạo tự động, đừng sửa tay) -->
<script>location.replace("{u}")</script>
<meta http-equiv="refresh" content="0; url={u}">
</head>
<body><p><a href="{u}">Mở phần thực hành của video {s}.</a></p></body>
</html>
""", encoding="utf-8")
    return len(dich)


if __name__ == "__main__":
    print("t/:", ghi(), "link ngắn")

#!/usr/bin/env python3
"""Tạo một số "Bản tin tuần" cho markhocai.com (Sang 15/10/2026), ghi vào data/ban-tin.json.

Bản tin hiện thành thẻ sau khi người xem đã chọn ngành/nghề (ban-tin.js), mỗi số mới hiện một lần,
và trang ban-tin.html / en/ban-tin.html liệt kê mọi số. Mỗi số có hai phần:
  - Mark học AI: video ra mắt trong tuần (data/lich-ra-mat.json + data/video-phu.json), bài "Bài báo AI" vừa mở,
    video xem nhiều trên kênh (data/noi-bat.json "pho_bien", script gom_video.py ghi từ sổ cái mỗi thứ Hai),
    trang đọc nhiều trên web (Umami, chỉ lấy thứ hạng, không đưa con số lên web) và tính năng web mới (data/ban-tin-web.json).
  - Mark Ở Vũ Trụ Khác: bài mới trong tuần (data/vu-tru-khac.json "ngay") và bài đọc nhiều (Umami).
  - Ở khu phố tuần này (Vũ Trụ Mark D3, 30/10): game Mèo Giao Bánh Mì và clip mới trong tuần (data/ban-tin-khu-pho.json),
    cộng sách của tháng đang đọc (data/vu-tru-khac-sach-thang.json).

Dùng:
  python3 scripts/tao_ban_tin.py                    # số kết thúc hôm nay (giờ VN), 7 ngày
  python3 scripts/tao_ban_tin.py --den 2026-10-19   # số kết thúc ngày khác
  --umami <file>   số liệu Umami do luồng "Đo tương tác trên web" kéo mỗi sáng
                   (mặc định /mnt/project-files/web/so-lieu/du-lieu/moi-nhat.json; thiếu file thì bỏ phần "đọc nhiều")
Chạy lại cùng ngày thì số đó được thay, các số cũ giữ nguyên (tối đa GIU số).
Tính năng web mới: mỗi PR web có thể thêm một dòng {ngay, goc, vi, en, link} vào data/ban-tin-web.json (goc = hoc-ai | vtk).
"""
import argparse
import datetime as dt
import json
import pathlib
import re
from collections import Counter

R = pathlib.Path(__file__).resolve().parent.parent
D = R / "data"
VN = dt.timezone(dt.timedelta(hours=7))
GIU = 60
MOI_TOI_DA = 40

# Trang nội dung của Mark học AI được tính vào "đọc nhiều" (trang chủ, trang pháp lý, trang dịch vụ thì không)
TRANG = {
    "phieu-luu.html": ("Game phiêu lưu cùng Mark", "Adventure game with Mark"),
    "kiem-tra.html": ("Bạn hiểu AI tới đâu? Bài kiểm tra", "How well do you know AI? Quiz"),
    "tu-dien.html": ("Từ điển AI", "AI dictionary"),
    "sach.html": ("Sách miễn phí", "Free book"),
    "lo-trinh-7-ngay.html": ("Lộ trình 7 ngày", "7-day path"),
    "bai-bao.html": ("Bài báo AI, đọc giùm bạn", "AI papers, read for you"),
    "lam-theo.html": ("Bài làm theo từng bước", "Step-by-step walkthroughs"),
    "hoi-bit.html": ("Hỏi Bit", "Ask Bit"),
    "chung-chi.html": ("Chứng chỉ Mark học AI", "Mark học AI certificate"),
}


def doc(p, mac_dinh=None):
    try:
        return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return mac_dinh


def bo_dau_trang(chu_de):
    # "Nhập môn AI (Phần 1/2): AI là gì?" giữ nguyên: tên series giúp người xem biết video thuộc chuỗi nào
    return chu_de.strip()


def video_chinh():
    vi = {v["so"]: v for v in doc(D / "videos.json", [])}
    en = doc(D / "en" / "videos.json", {})
    out = {}
    for so, v in vi.items():
        f = f"bai/{so:02d}-{v['slug']}.html"
        out[str(so)] = {"so": str(so), "ten": bo_dau_trang(v["chu_de"]),
                        "ten_en": (en.get(str(so)) or {}).get("chu_de") or v["chu_de"],
                        "link": f if (R / f).exists() else ""}
    return out


def video_phu():
    vp = doc(D / "video-phu.json", {"series": []})
    en = (doc(D / "en" / "video-phu.json", {}) or {}).get("tap", {})
    out = {}
    for s in vp.get("series", []):
        for t in s["tap"]:
            cha, phu = t["so"].split(".")
            f = f"bai/{int(cha):02d}-{phu}-{t['slug']}.html"
            out[t["so"]] = {"so": t["so"], "ten": t["tieu_de"], "ten_en": (en.get(t["so"]) or {}).get("tieu_de") or t["tieu_de"],
                            "link": f if (R / f).exists() else "", "ngay": t.get("ra_mat")}
    return out


def bang_series():
    """số video -> series (id, tên VI/EN, ảnh bìa) để bản tin gom video mới theo series và có ảnh."""
    ds = doc(D / "series.json", []) or []
    en = doc(D / "en" / "series.json", {}) or {}
    bia = doc(D / "series-bia.json", {}) or {}
    out = {}
    for x in ds:
        for so in range(x["tu"], x["den"] + 1):
            out[so] = {"id": x["id"], "ten": x["ten"], "ten_en": (en.get(x["id"]) or {}).get("ten") or x["ten"],
                       "bia": (bia.get(x["id"]) or {}).get("bia", "")}
    return out


def trong(ngay, tu, den):
    return bool(ngay) and tu.isoformat() <= ngay <= den.isoformat()


def xep_umami(ds, khop):
    """ds = [{"x": đường dẫn, "y": lượt}], khop(file) -> mục hoặc None. Gộp bản VI/EN và #, ? rồi xếp hạng."""
    dem, muc = Counter(), {}
    for d in ds or []:
        p = re.sub(r"[?#].*$", "", d.get("x", "")).lstrip("/")
        if p.startswith("en/"):
            p = p[3:]
        m = khop(p)
        if m:
            dem[m["link"]] += d.get("y", 0)
            muc[m["link"]] = m
    return [muc[k] for k, _ in dem.most_common(3)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--den", help="ngày cuối của số (YYYY-MM-DD), mặc định hôm nay giờ VN")
    ap.add_argument("--so-ngay", type=int, default=7)
    ap.add_argument("--umami", default="/mnt/project-files/web/so-lieu/du-lieu/moi-nhat.json")
    a = ap.parse_args()
    den = dt.date.fromisoformat(a.den) if a.den else dt.datetime.now(VN).date()
    tu = den - dt.timedelta(days=a.so_ngay - 1)

    chinh, phu = video_chinh(), video_phu()
    lich = doc(D / "lich-ra-mat.json", {})

    # ---- Mark học AI: mới trong tuần ----
    moi = []
    for so, ngay in lich.items():
        if trong(ngay, tu, den) and so in chinh:
            moi.append(dict(chinh[so], ngay=ngay, loai="video"))
    for so, v in phu.items():
        if trong(v.get("ngay"), tu, den):
            moi.append(dict(v, loai="video"))
    for b in doc(R / "bai-bao-nguon" / "bai-bao.json", []) or []:
        mo = b.get("ngay_mo") or (b.get("ngay_video") and (dt.date.fromisoformat(b["ngay_video"]) + dt.timedelta(days=7)).isoformat())
        if trong(mo, tu, den):
            f = f"bai-bao/{b['slug']}.html"
            moi.append({"so": str(b.get("video") or ""), "ten": "Bài báo AI: " + b["vi"]["ten"], "ten_en": "AI paper: " + b["en"]["ten"],
                        "link": f if (R / f).exists() else "bai-bao.html", "ngay": mo, "loai": "bai-bao"})
    moi.sort(key=lambda m: (m["ngay"], m["loai"] == "bai-bao"), reverse=True)
    tong_moi = len(moi)

    # Gom video mới theo series (tập phụ 5.x, 69.x theo series riêng; chưa có ảnh bìa riêng nên trang vẽ nền màu kèm tên)
    ser = bang_series()
    vp = doc(D / "video-phu.json", {"series": []}) or {"series": []}
    vp_en = (doc(D / "en" / "video-phu.json", {}) or {}).get("series", {})
    ser_phu = {t["so"]: {"id": x["id"], "ten": x["ten"], "ten_en": vp_en.get(x["id"], x["ten"]), "bia": ""}
               for x in vp.get("series", []) for t in x["tap"]}
    nhom_moi = {}
    for m in moi:
        if m["loai"] != "video":
            continue
        g = ser_phu.get(m["so"]) or ser.get(int(m["so"])) if m["so"].replace(".", "").isdigit() else None
        if not g:
            continue
        n = nhom_moi.setdefault(g["id"], dict(g, so=[], link=m["link"], ngay=m["ngay"]))
        n["so"].append(m["so"])
        if m["ngay"] > n["ngay"]:
            n["ngay"] = m["ngay"]
    for n in nhom_moi.values():
        n["so"].sort(key=lambda x: [int(p) for p in x.split(".")])
        dau = n["so"][0]
        n["link"] = next((m["link"] for m in moi if m["so"] == dau), n["link"])
    nhom_moi = sorted(nhom_moi.values(), key=lambda n: (n["ngay"], len(n["so"])), reverse=True)

    noi_bat = doc(D / "noi-bat.json", {}) or {}
    xem_nhieu = [dict(chinh[str(s)], bia=(ser.get(int(s)) or {}).get("bia", "")) for s in noi_bat.get("pho_bien", []) if str(s) in chinh][:3]

    web_goc = [w for w in (doc(D / "ban-tin-web.json", []) or []) if trong(w.get("ngay"), tu, den)]
    web = lambda g: [{"ten": w["vi"], "ten_en": w["en"], "link": w.get("link", "")} for w in web_goc if w.get("goc", "hoc-ai") == g]

    # ---- Umami (chỉ thứ hạng) ----
    um = doc(a.umami)
    trang = ((um or {}).get("nay") or {}).get("trang") or {}
    file_video = {pathlib.Path(v["link"]).name: v for v in list(chinh.values()) + list(phu.values()) if v["link"]}

    def khop_hoc_ai(p):
        if p.startswith("bai/") and p[4:] in file_video:
            return {k: file_video[p[4:]][k] for k in ("so", "ten", "ten_en", "link")}
        if p in TRANG:
            return {"ten": TRANG[p][0], "ten_en": TRANG[p][1], "link": p}
        return None
    doc_nhieu = xep_umami(trang.get("hoc-ai"), khop_hoc_ai)

    # ---- Mark Ở Vũ Trụ Khác ----
    vtk = doc(D / "vu-tru-khac.json", []) or []
    chu_de = {c["ma"]: c for c in doc(D / "vu-tru-khac-chu-de.json", []) or []}
    def muc_vtk(x):
        c = chu_de.get(x.get("loai", "sach"), {})
        return {"ten": x["ten"], "ten_en": (x.get("en") or {}).get("ten") or x["ten"], "link": f"vu-tru-khac/{x['slug']}.html",
                "bia": f"assets/vu-tru-khac/bia/{x['slug']}.svg" if (R / f"assets/vu-tru-khac/bia/{x['slug']}.svg").exists() else "",
                "mau": [(x.get("bia") or {}).get("nen_1", "#0B1F3A"), (x.get("bia") or {}).get("nen_2", "#1F3A75")],
                "nhom": c.get("nhan") or c.get("ten", ""), "nhom_en": (c.get("en") or {}).get("nhan") or (c.get("en") or {}).get("ten", "")}
    vtk_moi_goc = sorted([x for x in vtk if trong(x.get("ngay"), tu, den) and (R / f"vu-tru-khac/{x['slug']}.html").exists()],
                         key=lambda x: (x["ngay"], x.get("so", 0)), reverse=True)
    dem_nhom = Counter(x.get("loai", "sach") for x in vtk_moi_goc)
    nhom = [{"ten": chu_de[m]["ten"], "ten_en": chu_de[m]["en"]["ten"], "dem": n, "link": "vu-tru-khac.html#" + m}
            for m, n in dem_nhom.most_common() if m in chu_de]
    theo_slug = {x["slug"]: x for x in vtk}
    def khop_vtk(p):
        m = re.fullmatch(r"vu-tru-khac/(.+)\.html", p)
        return muc_vtk(theo_slug[m.group(1)]) if m and m.group(1) in theo_slug else None
    vtk_doc_nhieu = xep_umami(trang.get("vu-tru-khac"), khop_vtk)

    # ---- Ở khu phố tuần này (game, clip, sách của tháng) ----
    pho = [{"ten": w["vi"], "ten_en": w["en"], "link": w.get("link", ""), "loai": w.get("loai", "game")}
           for w in (doc(D / "ban-tin-khu-pho.json", []) or []) if trong(w.get("ngay"), tu, den)]
    sach = None
    thang = [t for t in (doc(D / "vu-tru-khac-sach-thang.json", []) or []) if t["thang"] <= den.isoformat()[:7]]
    if thang:
        t = max(thang, key=lambda t: t["thang"])
        x = theo_slug.get(t["slug"])
        if x:
            sach = dict(muc_vtk(x), thang=t["thang"], loi=t["loi"], loi_en=(t.get("en") or {}).get("loi") or t["loi"])

    so_moi = {
        "id": den.isoformat(), "tu": tu.isoformat(), "den": den.isoformat(),
        "hoc_ai": {"moi": moi[:MOI_TOI_DA], "tong_moi": tong_moi, "nhom_moi": nhom_moi, "xem_nhieu": xem_nhieu, "doc_nhieu": doc_nhieu, "web": web("hoc-ai")},
        "vtk": {"moi": [muc_vtk(x) for x in vtk_moi_goc[:MOI_TOI_DA]], "tong_moi": len(vtk_moi_goc), "nhom": nhom, "doc_nhieu": vtk_doc_nhieu, "web": web("vtk")},
        "khu_pho": {"moi": pho, "sach": sach},
        "umami": ((um or {}).get("ky") or {}) and {"tu": um["ky"]["tu"], "den": um["ky"]["den"]},
    }

    out = D / "ban-tin.json"
    cu = doc(out, {}) or {}
    ds = [s for s in cu.get("so", []) if s["id"] != so_moi["id"]] + [so_moi]
    ds.sort(key=lambda s: s["id"], reverse=True)
    du_lieu = {"_ghi_chu": "Bản tin tuần (Sang 15/10/2026). Tạo bằng scripts/tao_ban_tin.py, mới nhất đứng đầu. "
               "ban-tin.js hiện số đầu tiên sau khi người xem chọn ngành; ban-tin.html liệt kê mọi số. "
               "'doc_nhieu' chỉ là thứ hạng từ Umami, không ghi lượt xem.", "so": ds[:GIU]}
    out.write_text(json.dumps(du_lieu, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    h, v = so_moi["hoc_ai"], so_moi["vtk"]
    print(f"Bản tin {tu} → {den}: Mark học AI {h['tong_moi']} mới, {len(h['xem_nhieu'])} xem nhiều, {len(h['doc_nhieu'])} đọc nhiều, "
          f"{len(h['web'])} tính năng web; Vũ Trụ Khác {v['tong_moi']} bài mới, {len(v['doc_nhieu'])} đọc nhiều, {len(v['web'])} tính năng; khu phố {len(so_moi['khu_pho']['moi'])} tin -> {out.relative_to(R)}")
    if not um:
        print("  (không có file Umami, bỏ phần đọc nhiều)")


if __name__ == "__main__":
    main()

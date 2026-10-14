#!/usr/bin/env python3
"""Kiểm tra cả trang web trước khi merge (chạy trong GitHub Actions cho mỗi PR).

Lỗi (làm PR đỏ):
  1. Trang tiếng Việt và tiếng Anh phải đi thành cặp: X.html <-> en/X.html,
     bai/X.html <-> en/bai/X.html, vu-tru-khac/X.html <-> en/vu-tru-khac/X.html.
  2. Mọi trang (trừ trang chuyển hướng) phải nạp theo-doi.js.
  3. Link và ảnh nội bộ (href/src tương đối) phải trỏ tới file có thật.
  4. Mọi file data/**/*.json phải đọc được.
  5. Mọi địa chỉ trong sitemap.xml phải có file tương ứng.

Cảnh báo (không làm PR đỏ):
  - PR vừa sửa file của góc Vũ Trụ Khác vừa sửa phần khác của trang
    (dễ đụng nhau với dự án Mark Ở Vũ Trụ Khác).

Chạy tay: python3 scripts/kiem_tra_trang.py
So với nhánh gốc (để có cảnh báo Vũ Trụ Khác): python3 scripts/kiem_tra_trang.py --goc origin/main
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

GOC = Path(__file__).resolve().parent.parent
BO_QUA_THU_MUC = {".git", "node_modules", ".github"}
NHOM_CAP = ["", "bai/", "vu-tru-khac/"]
VTK = ("vu-tru-khac/", "en/vu-tru-khac/", "assets/vu-tru-khac/", "vu-tru-khac.html",
       "en/vu-tru-khac.html", "data/vu-tru-khac", "scripts/tao_vu_tru_khac.py",
       "scripts/tao_discord_vu_tru_khac.py")

RE_LINK = re.compile(r'''(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
RE_CHUYEN = re.compile(r'http-equiv\s*=\s*["\']refresh', re.I)
RE_LOC = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>")


def cac_trang():
    for duong_dan in sorted(GOC.rglob("*.html")):
        rel = duong_dan.relative_to(GOC)
        if rel.parts[0] in BO_QUA_THU_MUC:
            continue
        yield rel


def kiem_cap(trang, loi):
    co = {str(t) for t in trang}
    for nhom in NHOM_CAP:
        vi = {t[len(nhom):] for t in co if t.startswith(nhom) and "/" not in t[len(nhom):]}
        en = {t[len("en/" + nhom):] for t in co
              if t.startswith("en/" + nhom) and "/" not in t[len("en/" + nhom):]}
        for ten in sorted(vi - en):
            loi.append(f"thiếu bản tiếng Anh: en/{nhom}{ten} (có {nhom}{ten})")
        for ten in sorted(en - vi):
            loi.append(f"thiếu bản tiếng Việt: {nhom}{ten} (có en/{nhom}{ten})")


def kiem_trang(rel, noi_dung, loi):
    if not RE_CHUYEN.search(noi_dung) and "theo-doi.js" not in noi_dung:
        loi.append(f"{rel}: chưa nạp theo-doi.js (đo tương tác)")
    for link in sorted(set(RE_LINK.findall(noi_dung))):
        if link.startswith(("#", "data:", "mailto:", "tel:", "javascript:", "//")):
            continue
        u = urlparse(link)
        if u.scheme or u.netloc:
            continue
        duong = unquote(u.path)
        if not duong or "${" in duong or "{{" in duong:
            continue
        if duong.startswith("/"):
            dich = GOC / duong.lstrip("/")
        else:
            dich = (GOC / rel).parent / duong
        if duong.endswith("/"):
            dich = dich / "index.html"
        if not dich.exists():
            loi.append(f"{rel}: link hỏng -> {link}")


def kiem_json(loi):
    for f in sorted((GOC / "data").rglob("*.json")):
        try:
            json.loads(f.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            loi.append(f"{f.relative_to(GOC)}: JSON lỗi ({e})")


def kiem_sitemap(loi):
    sm = GOC / "sitemap.xml"
    if not sm.exists():
        loi.append("thiếu sitemap.xml")
        return
    for loc in RE_LOC.findall(sm.read_text(encoding="utf-8")):
        duong = unquote(urlparse(loc).path).lstrip("/")
        dich = GOC / duong
        if not duong or duong.endswith("/"):
            dich = dich / "index.html"
        if not dich.exists():
            loi.append(f"sitemap.xml: không có file cho {loc}")


def canh_bao_vtk(goc):
    try:
        ra = subprocess.run(["git", "diff", "--name-only", f"{goc}...HEAD"], cwd=GOC,
                            capture_output=True, text=True, check=True).stdout.split()
    except Exception:  # noqa: BLE001
        return []
    vtk = [f for f in ra if f.startswith(VTK)]
    khac = [f for f in ra if not f.startswith(VTK)]
    if vtk and khac:
        return [f"PR sửa cả {len(vtk)} file Vũ Trụ Khác lẫn {len(khac)} file khác; "
                "kiểm tra không đè việc của dự án Mark Ở Vũ Trụ Khác "
                f"(vd. {vtk[0]})"]
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--goc", help="nhánh gốc để so (vd. origin/main) cho cảnh báo Vũ Trụ Khác")
    args = ap.parse_args()

    loi = []
    trang = list(cac_trang())
    kiem_cap(trang, loi)
    for rel in trang:
        kiem_trang(rel, (GOC / rel).read_text(encoding="utf-8", errors="replace"), loi)
    kiem_json(loi)
    kiem_sitemap(loi)
    canh = canh_bao_vtk(args.goc) if args.goc else []

    gha = os.environ.get("GITHUB_ACTIONS") == "true"
    for c in canh:
        print(f"::warning::{c}" if gha else f"CẢNH BÁO: {c}")
    for l in loi:
        print(f"::error::{l}" if gha else f"LỖI: {l}")
    print(f"\nĐã kiểm {len(trang)} trang: {len(loi)} lỗi, {len(canh)} cảnh báo.")
    return 1 if loi else 0


if __name__ == "__main__":
    sys.exit(main())

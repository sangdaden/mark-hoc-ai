#!/usr/bin/env python3
"""Thêm khu "Mark Ở Vũ Trụ Khác" (góc đọc sách) vào server Discord của Mark học AI.

Làm giống tao_server.py lúc dựng server Mark học AI: dùng lại bot "Mark hoc AI Setup" (đã ở trong server,
quyền Administrator), chạy trên máy:
    python3 tao_discord_vu_tru_khac.py --thu   # chạy thử: in ra sẽ tạo gì, không đổi gì trên server
    python3 tao_discord_vu_tru_khac.py         # tạo thật
Script hỏi token khi chạy (dán vào, không hiện chữ), hoặc đọc từ biến DISCORD_BOT_TOKEN. Token cũ đã Reset sau
lần dựng server, nên lấy token mới: Developer Portal → Mark hoc AI Setup → Bot → Reset Token. Xong việc thì Reset lần nữa.

- Server tự tìm qua bot (bot chỉ ở trong một server). Bot ở nhiều server thì đặt DISCORD_GUILD_ID.
- Tạo category KHU và các kênh trong KENH, đặt tên theo kiểu server đang dùng (category chữ in hoa có emoji,
  kênh chữ thường có dấu nối gạch). Chạy lại bao nhiêu lần cũng được: cái gì đã có (trùng tên) thì bỏ qua,
  không sửa, không xoá.
- Kênh "bài-mới" chỉ để đăng bài mới: mọi người đọc được nhưng không gửi tin (chặn Send Messages cho @everyone).
  Server bật Community thì tạo dạng Announcement để người khác "Follow" về server họ; không thì tạo kênh chữ thường.
- Chỉ dùng thư viện chuẩn của Python. Đừng ghi token vào file.
"""
import getpass
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://discord.com/api/v10"
GUI_TIN = 1 << 11  # quyền Send Messages
GUI_TIN_LUONG = 1 << 38  # quyền Send Messages in Threads

KHU = "📚 MARK Ở VŨ TRỤ KHÁC"
KENH = [
    {"ten": "bài-mới", "loai": "thong-bao",
     "chu_de": "Bài phân tích sách mới của Mark Ở Vũ Trụ Khác. Đọc đủ ở markhocai.com/vu-tru-khac.html"},
    {"ten": "bàn-về-sách", "loai": "chu",
     "chu_de": "Bàn về cuốn sách đang lên: điều bạn đồng ý, không đồng ý, và đã áp dụng thử."},
    {"ten": "gợi-ý-sách", "loai": "chu",
     "chu_de": "Gợi ý cuốn Mark nên đọc tiếp. Mỗi tin một cuốn: tên sách, tác giả, vì sao nên đọc."},
]

LOAI_CHU, LOAI_CATEGORY, LOAI_THONG_BAO = 0, 4, 5


TOKEN = ""


class LoiDiscord(Exception):
    pass


def goi(phuong_thuc, duong_dan, du_lieu=None):
    body = json.dumps(du_lieu).encode() if du_lieu is not None else None
    for _ in range(5):
        req = urllib.request.Request(API + duong_dan, data=body, method=phuong_thuc, headers={
            "Authorization": f"Bot {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "DiscordBot (https://markhocai.com, 1.0)",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read() or "null")
        except urllib.error.HTTPError as e:
            noi_dung = e.read().decode(errors="replace")
            if e.code == 429:  # bị giới hạn tốc độ: chờ đúng thời gian Discord báo rồi thử lại
                time.sleep(float(json.loads(noi_dung).get("retry_after", 1)) + 0.5)
                continue
            raise LoiDiscord(f"{phuong_thuc} {duong_dan} → {e.code}: {noi_dung}") from None
    raise LoiDiscord(f"{phuong_thuc} {duong_dan}: bị giới hạn tốc độ quá nhiều lần")


def chuan(ten):
    return ten.strip().casefold()


def quyen_kenh(kenh, guild_id):
    if kenh["loai"] != "thong-bao":
        return []
    # Role @everyone có ID trùng ID server
    return [{"id": guild_id, "type": 0, "allow": "0", "deny": str(GUI_TIN | GUI_TIN_LUONG)}]


def xem(guild_id):
    guild = goi("GET", f"/guilds/{guild_id}")
    ds = goi("GET", f"/guilds/{guild_id}/channels")
    print(f'Server: {guild["name"]} (Community: {"có" if "COMMUNITY" in guild.get("features", []) else "không"})')
    cat = {c["id"]: c for c in ds if c["type"] == LOAI_CATEGORY}
    nhom = {}
    for c in ds:
        if c["type"] != LOAI_CATEGORY:
            nhom.setdefault(c.get("parent_id"), []).append(c)
    for pid in [None] + sorted(cat, key=lambda i: cat[i]["position"]):
        if pid:
            print(f'\n[{cat[pid]["name"]}]')
        for c in sorted(nhom.get(pid, []), key=lambda c: c["position"]):
            print(f'  #{c["name"]}  (loại {c["type"]})')


def tao(guild_id, chay_thu):
    guild = goi("GET", f"/guilds/{guild_id}")
    ds = goi("GET", f"/guilds/{guild_id}/channels")
    print(f'Server: {guild["name"]}')
    community = "COMMUNITY" in guild.get("features", [])
    tien_to = "[chạy thử] " if chay_thu else ""

    khu = next((c for c in ds if c["type"] == LOAI_CATEGORY and chuan(c["name"]) == chuan(KHU)), None)
    if khu:
        print(f"Bỏ qua category đã có: {KHU}")
        khu_id = khu["id"]
    elif chay_thu:
        print(f"{tien_to}Sẽ tạo category: {KHU}")
        khu_id = None
    else:
        khu_id = goi("POST", f"/guilds/{guild_id}/channels", {"name": KHU, "type": LOAI_CATEGORY})["id"]
        print(f"Đã tạo category: {KHU}")

    da_co = {chuan(c["name"]) for c in ds if khu_id and c.get("parent_id") == khu_id}
    for k in KENH:
        if chuan(k["ten"]) in da_co:
            print(f"  Bỏ qua kênh đã có: #{k['ten']}")
            continue
        loai = LOAI_THONG_BAO if k["loai"] == "thong-bao" and community else LOAI_CHU
        mo_ta = "thông báo" if loai == LOAI_THONG_BAO else ("chữ, chỉ đọc" if k["loai"] == "thong-bao" else "chữ")
        if chay_thu:
            print(f"  {tien_to}Sẽ tạo kênh #{k['ten']} ({mo_ta})")
            continue
        goi("POST", f"/guilds/{guild_id}/channels", {
            "name": k["ten"], "type": loai, "parent_id": khu_id, "topic": k["chu_de"],
            "permission_overwrites": quyen_kenh(k, guild_id),
        })
        print(f"  Đã tạo kênh #{k['ten']} ({mo_ta})")


def tim_server():
    gid = os.environ.get("DISCORD_GUILD_ID", "").strip()
    if gid:
        return gid
    ds = goi("GET", "/users/@me/guilds")
    if len(ds) != 1:
        ten = ", ".join(g["name"] for g in ds) or "chưa có server nào"
        sys.exit(f"Bot đang ở {len(ds)} server ({ten}). Đặt DISCORD_GUILD_ID là ID server Mark học AI rồi chạy lại.")
    return ds[0]["id"]


def main():
    global TOKEN
    co = set(a for a in sys.argv[1:] if a.startswith("--"))
    la = co - {"--thu", "--xem"}
    if la:
        sys.exit(f"Không hiểu tuỳ chọn: {' '.join(sorted(la))}. Dùng --thu (chạy thử) hoặc --xem (liệt kê kênh).")
    TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip() or getpass.getpass("Dán token của bot rồi Enter: ").strip()
    if not TOKEN:
        sys.exit("Chưa có token.")
    try:
        guild_id = tim_server()
        if "--xem" in co:
            xem(guild_id)
        else:
            tao(guild_id, "--thu" in co)
    except LoiDiscord as e:
        sys.exit(f"Lỗi Discord: {e}\n(401 là token sai hoặc đã Reset; 403 là bot thiếu quyền hoặc chưa vào server.)")


if __name__ == "__main__":
    main()

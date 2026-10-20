# ---------- Góc thực hành (thuc-hanh.html, en/thuc-hanh.html) ----------
# Một chỗ cho mọi trò chơi và trạm thực hành: 3 trang theo nghề (đếm trạm đã làm, khóa mhai-tram) và mọi file data/tro-choi/*.json
# chia nhóm theo _GTH_NHOM. Trò chơi mới chưa có trong nhóm nào tự vào nhóm "Khác", nên thêm trò chơi không bắt buộc sửa file này.
# Dấu "Đã mở" và số trạm do goc-thuc-hanh.js đọc từ tien-do.js (chỉ trên máy người xem).

_GTH_NHOM = [
    ("an-toan", "🛡️", ("An toàn và lừa đảo", "Safety and scams"),
     ["lua-dao-hay-that", "cuoc-goi-gia-giong", "dan-hay-khong", "bit-bat-loi", "do-in-gia-dinh"]),
    ("dung-ai", "✍️", ("Dùng AI mỗi ngày", "Everyday AI"),
     ["nghe-cua-ban", "tho-ghep-cau-lenh", "nhap-vai", "may-tinh-doi-that", "ban-do-ai-an"]),
    ("ben-trong", "🧠", ("Bên trong bộ não AI", "Inside the AI brain"),
     ["bo-nao-cat-manh", "bo-nao-doan-chu", "bo-nao-vong-quay", "bo-loc-thien-vi", "dong-thoi-gian-ai", "ai-choi-caro", "ai-choi-thuyen"]),
    ("du-lieu", "📊", ("Dữ liệu, robot và cảm biến", "Data, robots and sensors"),
     ["du-lieu-bieu-do", "du-lieu-nguong", "du-lieu-hoc-vet", "du-lieu-pid", "du-lieu-dinh-vi", "du-lieu-a-sao",
      "phong-thi-nghiem-cam-bien", "du-bao-lu", "tach-giong-nhac"]),
]


def _ghi_tram_thuc_hanh(tro):
    """data/tram-thuc-hanh.json cho Giấy chứng nhận thực hành (chung-nhan.js): mỗi trang thực hành, tên, màu, danh sách trạm."""
    ds = []
    for f, bt, nhom in _TH_NHOM:
        if f == "ai-y-te":
            mau = load("ai-y-te").get("nhom_nc", {}).get("mau")
        else:
            mau = json.loads((R / "data" / "thuc-hanh" / f"{f}.json").read_text(encoding="utf-8")).get("nhom_nc", {}).get("mau")
        ds.append({"id": f, "bt": bt, "ten": tro[f]["ten"], "mau": mau or ["#2563EB", "#06D6A0"], "tram": [x[0] for x in _tram_theo_trang(f)]})
    (R / "data" / "tram-thuc-hanh.json").write_text(json.dumps({"_ghi_chu": "Tạo tự động bởi scripts/trang/goc-thuc-hanh.py, đừng sửa tay.", "trang": ds},
                                                               ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


@trang_rieng("thuc-hanh.html", "0.8")
def tao_goc_thuc_hanh():
    p = t("", "../")
    L = "en" if LG == "en" else "vi"
    tro = {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in sorted((R / "data" / "tro-choi").glob("*.json"))}
    _ghi_tram_thuc_hanh(tro)
    nghe_ten = {f for f, _, _ in _TH_NHOM}

    # 3 trang theo nghề: tổng số trạm để JS ghi "đã làm x/y"
    the_nghe = []
    for f, bt, _ in _TH_NHOM:
        x = tro[f]
        tong = len(_tram_theo_trang(f))
        the_nghe.append(f'<a class="gth-nghe" href="{f}.html" data-trang="{f}" data-tong="{tong}"><span class="gth-bt" aria-hidden="true">{bt}</span>'
                        f'<b>{esc(x["ten"][L])}</b><span class="gth-moi">{esc(x["moi"][L])}</span>'
                        f'<span class="gth-dem"><span class="gth-thanh" aria-hidden="true"><i></i></span><span class="gth-so">{t(f"{tong} trạm", f"{tong} stations")}</span></span></a>')

    def the(ten, x):
        url = x["url"].split("?tap=")[0]
        so = [int(s) for s in x.get("video", []) if str(s).isdigit() and int(s) in co_bai]
        video = f'<small class="gth-video">▶ {t("Video", "Video")} #{so[0]:02d}</small>' if so else ""
        return (f'<li><a class="gth-the" href="{esc(url)}" data-mo="{esc(url.split("?")[0])}">{hinh_choi(x.get("hinh", ""))}'
                f'<b>{esc(x["ten"][L])}</b><span class="gth-moi">{esc(x["moi"][L])}</span>{video}'
                f'<span class="gth-da" hidden>✓ {t("Đã mở", "Opened")}</span></a></li>')

    # Game nhiều màn ("loai": "game") ở trang Thế giới game (game.html), không lẫn vào đây; chỉ để một thẻ dẫn sang
    da_xep = set(nghe_ten) | {k for k, x in tro.items() if x.get("loai") == "game"}
    nhom_html = []
    nhom = [(k, bt, ten, [s for s in ds if s in tro]) for k, bt, ten, ds in _GTH_NHOM]
    for _, _, _, ds in nhom:
        da_xep.update(ds)
    con = [s for s in sorted(tro, key=lambda s: tro[s].get("thu_tu", 999)) if s not in da_xep]
    if con:
        nhom.append(("khac", "✨", ("Khác", "More"), con))
    tong_tro = sum(len(ds) for *_, ds in nhom)
    for k, bt, ten, ds in nhom:
        if not ds:
            continue
        nhom_html.append(f'<section class="gth-nhom" id="{k}" aria-labelledby="gth-{k}"><h2 id="gth-{k}"><span aria-hidden="true">{bt}</span> {t(*ten)}'
                         f'<small>{len(ds)}</small></h2><ul class="gth-luoi">{"".join(the(s, tro[s]) for s in ds)}</ul></section>')

    desc = t(f"Mọi trò chơi và trạm thực hành AI của Mark học AI ở một chỗ: {len(_TH_NHOM)} trang theo nghề và {tong_tro} trò chơi ngắn. Miễn phí, không cần tài khoản, tiến độ lưu trên máy bạn.",
             f"Every Mark học AI game and practice station in one place: {len(_TH_NHOM)} job pages and {tong_tro} short games. Free, no account, progress saved on your device.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t(f"{len(_TH_NHOM)} trang theo nghề · {tong_tro} trò chơi · miễn phí", f"{len(_TH_NHOM)} job pages · {tong_tro} games · free")}</p>\n'
            f'<h1>{t("Góc thực hành", "Practice corner")}</h1>\n'
            f'<p class="lead">{t("Xem xong video thì vào đây thử tay. Mỗi trò chừng 1–5 phút, chạy ngay trên máy bạn.", "Watched a video? Try it here. Each one takes 1–5 minutes and runs right on your device.")}</p>\n'
            f'<div class="cta"><a class="btn btn-yt" href="lo-trinh-7-ngay.html">{t("Học theo Lộ trình 7 ngày", "Follow the 7-day path")} ›</a></div>\n'
            f'</div><img class="head-art" src="{p}assets/bit-giai-thich.svg" alt="" width="180" height="170"></div>')
    main = (f'<main class="gth">\n<link rel="stylesheet" href="{p}assets/goc-thuc-hanh.css?v=dev">\n'
            f'<section class="gth-nhom" aria-labelledby="gth-nghe"><h2 id="gth-nghe"><span aria-hidden="true">🧑‍💼</span> {t("Thực hành theo nghề", "Practice for your job")}</h2>'
            f'<div class="gth-nghe-ds">{"".join(the_nghe)}</div></section>\n'
            + "\n".join(nhom_html)
            + f'\n<a class="gth-game" href="game.html"><img src="{p}assets/game/game.webp" alt="" width="200" height="189" loading="lazy">'
              f'<span><b>{t("Tìm game nhiều màn, có tim, có sao?", "Looking for games with levels, hearts and stars?")}</b>'
              f'{t("Mark chặn lừa, Đường đoán chữ, Đêm lái xe, Mark phiêu lưu ở Thế giới game", "Mark blocks the scams, the Next-Word Road, Night drive and Mark’s Adventure live in the game world")} ›</span></a>'
            + f'\n<p class="gth-ghi">{t("Dấu ✓ chỉ lưu trên trình duyệt này, không gửi đi đâu.", "The ✓ marks are saved in this browser only and never sent anywhere.")}</p>\n</main>')
    return GOC + "thuc-hanh.html", trang("thuc-hanh.html", t(f"Góc thực hành AI: trò chơi và bài tập miễn phí | {SITE}", f"AI practice corner: free games and exercises | {SITE}"),
                                         desc, band, main, p, og_type="website", q="",
                                         cuoi=f'<script src="{p}goc-thuc-hanh.js?v=dev" defer></script>\n')

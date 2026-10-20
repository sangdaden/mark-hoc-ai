# ---------- game "Đêm lái xe" (dem-lai-xe.html): G2 trong "Thế giới game Mark", video 5 và series 5.1-5.7 Ba con mắt của AI ----------
# Lái xe tự hành về nhà qua nắng, đêm, mưa, sương; mỗi lúc bật một con mắt (LiDAR, radar, camera). Vật cản rõ, mờ hay tàng hình
# theo bảng "muc" của data/cam-bien.json (chung với Phòng thí nghiệm cảm biến). Cách chơi ở dem-lai-xe.js, CSS ở
# assets/tro-choi/dem-lai-xe.css, khung toàn màn hình dùng lại các lớp .pl của style.css (giống Mark phiêu lưu).
# Trang có manifest riêng (dem-lai-xe.webmanifest, display fullscreen) để "Thêm vào MH chính" trên iPhone chơi không có thanh Safari.


HINH_CHOI["dem-lai-xe"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="align-content:end;gap:8px;background:linear-gradient(#0B1222,#1E293B);border-radius:12px;padding:10px">'
    '<span style="display:block;height:56px;background:#334155;clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);position:relative">'
    '<span style="position:absolute;left:46%;top:38%;width:8%;height:30%;border-radius:4px;background:#38BDF8;opacity:.8"></span></span>'
    '<span style="display:flex;gap:6px;justify-content:center;font:700 12px/1 var(--f-body)">'
    '<span style="padding:5px 8px;border-radius:99px;background:#38BDF8;color:#0F172A">LiDAR</span>'
    '<span style="padding:5px 8px;border-radius:99px;background:#FACC15;color:#0F172A">Radar</span>'
    '<span style="padding:5px 8px;border-radius:99px;background:#F8FAFC;color:#0F172A">Camera</span></span></span>')


@trang_rieng("dem-lai-xe.html", "0.7")
def tao_dem_lai_xe():
    p = t("", "../")
    D = load("cam-bien")
    L = LG

    def video(so):
        if "." in so:
            cha, phu_so = so.split(".")
            x = next(x for ss in video_phu for x in ss["tap"] if x["so"] == so)
            ten = x["tieu_de"] if L == "vi" else load("en/video-phu")["tap"].get(so, {}).get("tieu_de", x["tieu_de"])
            return {"ten": ten, "url": f"{p}bai/{int(cha):02d}-{phu_so}-{x['slug']}.html"}
        return {"ten": seo[so], "url": f"{p}bai/{ten_file(co_bai[int(so)])}.html"}

    vids = {so: video(so) for so in ("5", "5.1", "5.2", "5.4")}
    du_lieu = json.dumps({"muc": D["muc"], "ten": {k: x["ten"][L] for k, x in D["cam_bien"].items()}, "video": vids, "p": p},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Game miễn phí: lái xe tự hành về nhà qua nắng, đêm, mưa và sương mù. Mỗi lúc chỉ bật được một con mắt LiDAR, radar hay camera; chọn sai là vật cản tàng hình. Chơi ngay trên điện thoại.",
             "Free game: drive a self-driving car home through sun, night, rain and fog. Only one eye works at a time, LiDAR, radar or camera; pick the wrong one and obstacles vanish. Play on your phone.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Game miễn phí · Ba con mắt của AI", "Free game · The three eyes of AI")}</p>\n'
            f'<h1>{t("Đêm lái xe", "Night drive")}</h1>\n'
            f'<p class="lead">{t("Đưa xe tự lái về nhà qua nắng, đêm, mưa và sương. Trời đổi thì đổi con mắt: bật sai là người, xe, đèn đỏ đều tàng hình.", "Get a self-driving car home through sun, night, rain and fog. When the weather changes, change the eye: pick the wrong one and people, bikes and red lights vanish.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/game/dem-lai-xe.webp" alt="{t("Mark thắc mắc, Bit giải thích", "Mark wondering, Bit explaining")}" width="200" height="189"></div>')
    mat = "".join(f'<button type="button" class="dx-mat dx-mat-{k}" data-cb="{k}" aria-pressed="false">{esc(D["cam_bien"][k]["ten"][L])}</button>' for k in ("lidar", "radar", "camera"))
    lien = [("phong-thi-nghiem-cam-bien.html", t("Phòng thí nghiệm cảm biến 3D", "3D sensor lab"), t("Tách rời từng con mắt, đổi trời xem chúng thấy gì.", "Take each eye apart and switch the weather.")),
            (vids["5"]["url"][len(p):], t("Series Ba con mắt của AI", "The three eyes of AI series"), t("8 video: LiDAR, radar, camera và ghép cảm biến.", "8 videos: LiDAR, radar, camera and sensor fusion."))]
    the_lien = "".join(f'<a class="dx-lien" href="{p}{u}"><b>{a}</b><span>{b}</span></a>' for u, a, b in lien)
    main = f"""<main class="pl pl-game dx" id="dx">
  <div class="pl-dau"><p class="pl-tong" id="dx-tong" aria-live="polite"></p><button type="button" class="pl-xoa" id="dx-xoa"></button></div>
  <div class="pl-khung dx-khung" id="dx-khung">
    <canvas class="pl-canvas" id="dx-canvas" tabindex="0"></canvas>
    <div class="pl-nut-tren"><button type="button" class="pl-toan" id="dx-toan" aria-label="{t("Chơi toàn màn hình", "Play full screen")}" aria-pressed="false"></button><button type="button" class="pl-menu" id="dx-menu" hidden></button></div>
    <div class="dx-bit" id="dx-bit" hidden role="status"><img src="{p}assets/bit-y-tuong.svg" alt="" width="44" height="44"><p id="dx-bit-chu"></p></div>
    <div class="pl-man" id="dx-man"></div>
  </div>
  <div class="dx-dk" id="dx-dk" role="group" aria-label="{t("Nút điều khiển", "Controls")}">
    <div class="dx-lan"><button type="button" data-k="trai" aria-label="{t("Sang làn trái", "Left lane")}">◀</button><button type="button" data-k="phai" aria-label="{t("Sang làn phải", "Right lane")}">▶</button></div>
    <div class="dx-mat-ds" role="group" aria-label="{t("Con mắt đang bật", "Active eye")}">{mat}</div>
    <button type="button" class="dx-phanh" data-k="phanh">{t("Phanh", "Brake")}</button>
  </div>
  <p class="pl-huong"><b>{t("Cách chơi:", "How to play:")}</b> {t("phím ← → hoặc A D để đổi làn, giữ Space hoặc ↓ để phanh, phím 1 2 3 để bật LiDAR, radar, camera. Trên điện thoại, game tự chuyển sang toàn màn hình nằm ngang; bạn cầm ngang máy và dùng các nút trên màn hình. Gặp đèn đỏ thì giữ Phanh tới khi đèn xanh.", "← → or A D to change lanes, hold Space or ↓ to brake, keys 1 2 3 switch on LiDAR, radar, camera. On a phone the game goes full screen in landscape: hold the phone sideways and use the on-screen buttons. At a red light, hold Brake until it turns green.")}</p>
  <p class="pl-bao" id="dx-bao" role="status" hidden></p>
  <div class="dx-lien-ds">{the_lien}</div>
  <p class="pl-ghi">{t("Mức nhìn rõ, mờ hay không thấy của từng con mắt theo từng kiểu trời lấy đúng bảng của series Ba con mắt của AI. Game đơn giản hóa: xe thật bật cả ba con mắt cùng lúc. Tiến độ lưu trên trình duyệt này, không gửi đi đâu.", "How clearly each eye sees in each weather follows the table from The three eyes of AI series. The game simplifies: real cars run all three eyes at once. Progress is saved in this browser only.")}</p>
  <noscript><p>{t("Game cần JavaScript. Bạn vẫn có thể vào", "The game needs JavaScript. You can still try the")} <a href="{p}phong-thi-nghiem-cam-bien.html">{t("Phòng thí nghiệm cảm biến", "sensor lab")}</a>.</p></noscript>
  <script type="application/json" id="dx-du-lieu">{du_lieu}</script>
</main>"""
    html_trang = trang("dem-lai-xe.html", t(f"Đêm lái xe: game xe tự lái chọn đúng LiDAR, radar, camera | {SITE}", f"Night drive: a self-driving game with LiDAR, radar and camera | {SITE}"),
                       desc, band, main, p, og_type="website", q="",
                       cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/dem-lai-xe.css?v=dev">\n<script src="{p}dem-lai-xe.js?v=dev" defer></script>\n')
    # Manifest riêng để mở từ Màn hình chính ở chế độ toàn màn hình nằm ngang.
    html_trang = html_trang.replace(f'<link rel="manifest" href="{p}site.webmanifest">',
                                    f'<link rel="manifest" href="dem-lai-xe.webmanifest">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
                                    f'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="{t("Đêm lái xe", "Night drive")}">', 1)
    return GOC + "dem-lai-xe.html", html_trang

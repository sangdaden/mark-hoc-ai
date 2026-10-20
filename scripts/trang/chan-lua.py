# ---------- trò chơi G1 "Mark chặn lừa" (chan-lua.html): video 14, 108-112, 223, 269, A1; 4 màn ----------
# Tin nhắn, cuộc gọi bay về điện thoại của bà: chạm tin lừa để Mark bắn hạ, để tin thật bay qua. Cuối màn là trùm, một ca
# trong data/lua-dao.json: chạm đúng các câu có dấu hiệu lừa để hạ. Bài học nằm trong luật chơi, không dừng lại hỏi.
# Dữ liệu data/chan-lua.json, cách chơi chan-lua.js, CSS assets/tro-choi/chan-lua.css. Khung chơi ngang toàn màn hình
# trên điện thoại theo kiểu phieu-luu.js (chép mẫu sang file riêng, không dùng chung code).

VIDEO_CHAN_LUA = [
    ("14", "bai/14-deepfake.html", ("Deepfake: mặt và giọng giả bằng AI", "Deepfakes: AI-faked faces and voices")),
    ("108", "bai/108-gia-giong-nguoi-than.html", ("Giả giọng người thân", "Cloned voices of loved ones")),
    ("109", "bai/109-video-call-gia.html", ("Video call giả", "Fake video calls")),
    ("110", "bai/110-nguoi-noi-tieng-gia.html", ("Người nổi tiếng giả", "Fake celebrities")),
    ("111", "bai/111-tin-nhan-lua-dao.html", ("Tin nhắn lừa đảo", "Scam text messages")),
    ("112", "bai/112-mat-khau-gia-dinh.html", ("Mật khẩu gia đình", "A family password")),
]

# Hình xem trước trên thẻ "Chơi thử" trong bài: tin lừa đỏ, tin thật xanh, bay về điện thoại.
HINH_CHOI["chan-lua"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:linear-gradient(#1E3A8A,#38BDF8);border-radius:14px;padding:10px">'
    '<span style="display:grid;gap:6px">'
    f'<span style="padding:5px 9px;border-radius:10px;background:#FEE2E2;border:2px solid #DC2626;color:#7F1D1D;font:600 12px/1.3 var(--f-body)">{t("Đọc giúp cháu mã OTP…", "Read me your code…")}</span>'
    f'<span style="padding:5px 9px;border-radius:10px;background:#DCFCE7;border:2px solid #16A34A;color:#14532D;font:600 12px/1.3 var(--f-body)">{t("Mẹ ơi tối con về ăn cơm", "Mom, home for dinner")}</span>'
    '</span><span style="width:34px;height:60px;border-radius:8px;background:#0F172A;border:4px solid #0F172A;box-shadow:inset 0 0 0 30px #E0F2FE"></span></span>')


@trang_rieng("chan-lua.html", "0.7")
def tao_chan_lua():
    p = t("", "../")
    soat = [("1", t("Đòi tiền hay đòi mã?", "Asking for money or a code?"), t("Chuyển khoản, mã OTP, mật khẩu: dừng lại ngay.", "A transfer, a one-time code, a password: stop right there.")),
            ("2", t("Thúc làm gấp?", "Rushing you?"), t("Càng hối càng phải chậm. Hỏi người nhà trước đã.", "The bigger the rush, the slower you go. Ask family first.")),
            ("3", t("Số lạ, link lạ?", "Unknown number or link?"), t("Tự gọi lại số đã lưu, tự mở app chính thức.", "Call back the saved number, open the official app yourself."))]
    the_soat = "".join(f'<div class="cl-soat-the"><span class="cl-soat-so">{s}</span><b>{a}</b><p>{b}</p></div>' for s, a, b in soat)
    the_video = "".join(f'<a class="ld-vid" href="{duong}" data-so-video="{so}"><span class="ld-vid-so">#{so}</span><b>{t(*ten)}</b></a>' for so, duong, ten in VIDEO_CHAN_LUA)
    desc = t("Game miễn phí: tin nhắn, cuộc gọi lừa đảo bay về điện thoại của bà. Chạm tin lừa để bắn hạ, để tin thật bay qua, rồi hạ trùm cuộc gọi giả giọng. Học nhận ra lừa đảo bằng AI ngay khi chơi.",
             "Free game: scam texts and calls fly at Grandma's phone. Tap the scams to shoot them down, let the real ones through, then beat the fake-voice call boss. Learn to spot AI scams while you play.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Game miễn phí · chơi ngang trên điện thoại", "Free game · play sideways on your phone")}</p>\n'
            f'<h1>{t("Mark chặn lừa", "Mark blocks the scams")}</h1>\n'
            f'<p class="lead">{t("Tin nhắn bay về điện thoại của bà. Chạm tin lừa để bắn hạ, để tin thật đi qua. Bắn nhầm tin của con cháu là mất tim.", "Messages fly toward Grandma’s phone. Tap the scams to shoot them down and let the real ones through. Shoot a message from family and you lose a heart.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-chao.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="cl cl-game" id="cl">
<div class="cl-dau"><p class="cl-tong" id="cl-tong" aria-live="polite"></p><button type="button" class="cl-xoa" id="cl-xoa">{t("Chơi lại từ đầu", "Reset progress")}</button></div>
<div class="cl-khung" id="cl-khung">
<canvas class="cl-canvas" id="cl-canvas" aria-label="{t("Màn hình game", "Game screen")}"></canvas>
<div class="cl-lop" id="cl-lop"></div>
<div class="cl-nut-tren"><button type="button" class="cl-toan" id="cl-toan" aria-pressed="false"></button><button type="button" class="cl-menu" id="cl-menu" hidden>{t("☰ Các màn", "☰ Levels")}</button></div>
<button type="button" class="cl-cham" id="cl-cham" hidden></button>
<div class="cl-bao" id="cl-bao" hidden aria-live="polite"><img id="cl-bao-bit" src="{p}assets/bit-giai-thich.svg" alt="" width="48" height="48"><div><b id="cl-bao-dau"></b><p id="cl-bao-chu"></p></div></div>
<div class="cl-man" id="cl-man"></div>
</div>
<p class="cl-huong"><b>{t("Cách chơi:", "How to play:")}</b> {t("chạm (hoặc bấm chuột) vào tin lừa để Mark bắn hạ. Tin thật thì để yên cho bay tới điện thoại của bà. Nút 🐢 Chậm lại làm mọi thứ chậm hẳn trong vài giây để bạn kịp đọc. Trên điện thoại, game tự chuyển sang toàn màn hình nằm ngang.", "tap (or click) a scam message and Mark shoots it down. Leave real messages alone so they reach Grandma’s phone. The 🐢 Slow down button slows everything for a few seconds so you can read. On phones the game goes full screen and sideways.")}</p>
<p class="cl-thong" id="cl-thong" role="status" hidden></p>
<section class="cl-cuoi" id="cl-soat">
<h2 class="ld-ket-h">{t("3 câu soát trước khi làm theo một tin nhắn", "3 checks before you act on a message")}</h2>
<div class="cl-soat">{the_soat}</div>
<h2 class="ld-ket-h">{t("Xem video của game này", "Watch the videos behind this game")}</h2>
<div class="ld-ket-video">{the_video}</div>
{khoi_chia_se(BASE + GOC + "chan-lua.html", t("Mark chặn lừa: bạn chặn được bao nhiêu tin lừa?", "Mark blocks the scams: how many can you stop?"), p)}
</section>
<p class="cl-ghi">{t("Mọi tin nhắn, số điện thoại và đường link trong game là hư cấu, viết theo các kiểu lừa có thật trong video của kênh. Game chạy ngay trên trình duyệt, tiến độ lưu trên máy này, không gửi đi đâu. Chơi thêm: ", "All messages, numbers and links in the game are made up, modeled on real scam patterns from the channel’s videos. The game runs in your browser and saves progress on this device only. Play more: ")}<a href="lua-dao-hay-that.html">{t("Lừa đảo hay thật?", "Scam or real?")}</a></p>
<noscript><p>{t("Game cần JavaScript.", "The game needs JavaScript.")}</p></noscript>
</main>"""
    html = trang("chan-lua.html", t(f"Mark chặn lừa: game nhận ra tin nhắn lừa đảo bằng AI | {SITE}", f"Mark blocks the scams: a game for spotting AI scam messages | {SITE}"),
                 desc, band, main, p, og_type="website", q="",
                 cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/chan-lua.css?v=dev">\n<script src="{p}chia-se.js?v=dev" defer></script>\n<script src="{p}chan-lua.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')
    # Thêm vào Màn hình chính trên iPhone: mở toàn màn hình nằm ngang như Mark phiêu lưu (manifest riêng của game).
    ten_app = t("Mark chặn lừa", "Mark vs scams")
    html = html.replace(f'<link rel="manifest" href="{p}site.webmanifest">',
                        f'<link rel="manifest" href="chan-lua.webmanifest">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
                        f'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="{ten_app}">', 1)
    return GOC + "chan-lua.html", html

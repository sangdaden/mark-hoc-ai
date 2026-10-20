# ---------- Trạm chống lừa đảo AI (tram-chong-lua-dao.html): một chỗ gom mọi thứ chống lừa đảo của kênh ----------
# Sang chọn mockup A + B, C ngày 20/10/2026 (https://claude.ai/artifact/BA2FXiu9XsBkTeovCusUFZ):
# Kiểm tra nhanh 30 giây ở trên cùng, Danh bạ chiêu lừa (thẻ, lọc theo người hay bị nhắm), đường tập 4 trò chơi,
# đồ cho cả nhà + Gửi cho bố mẹ, và khối "Lỡ chuyển tiền rồi". Nội dung ở data/chong-lua-dao.json, cách chạy ở tram-lua-dao.js,
# CSS ở assets/tro-choi/tram-lua-dao.css. Mở thẳng một thẻ chiêu lừa: ?chieu=<id>. Chạy chung không gian tên với tao_bai_viet.py.

# Biểu tượng nét (24x24) cho tình huống và thẻ chiêu lừa; icons.svg chung chưa có các hình này
TL_ICON = {
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    "video": '<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    "pill": '<path d="m10.5 20.5 10-10a4.9 4.9 0 0 0-7-7l-10 10a4.9 4.9 0 0 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
    "job": '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    "app": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17.5 14v7M14 17.5h7"/>',
    "chart": '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/><path d="M15 7h5v5"/>',
    "message": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/>',
    "key": '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "print": '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    "route": '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
}


def tl_icon(ten, cls="tl-ic"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{TL_ICON[ten]}</svg>'


@trang_rieng("tram-chong-lua-dao.html", "0.8")
def tao_tram_chong_lua_dao():
    p = t("", "../")
    D = load("chong-lua-dao")
    L = LG
    chu = lambda x: x[L]

    def bai(so):
        v = co_bai.get(so)
        return (f"bai/{ten_file(v)}.html" if v else ""), (seo.get(str(so), "") if v else "")

    # ----- 1. Kiểm tra nhanh -----
    chon = "".join(
        f'<button type="button" class="tl-th" data-th="{x["id"]}"><span class="tl-th-ic">{tl_icon(x["icon"])}</span><span>{esc(chu(x["ten"]))}</span></button>'
        for x in D["tinh_huong"])
    kt = f"""<section class="tl-khoi tl-kt" id="kiem-tra-nhanh" aria-labelledby="tl-kt-h">
<p class="tl-nhan">{t("Kiểm tra trong 30 giây", "Check in 30 seconds")}</p>
<h2 id="tl-kt-h">{t("Vừa nhận cuộc gọi, tin nhắn hay quảng cáo lạ?", "Just got a strange call, message or ad?")}</h2>
<p class="tl-dan">{t("Chọn điều bạn vừa gặp, trả lời 3 câu có hoặc không. Bạn sẽ biết mức nguy hiểm và việc cần làm ngay.", "Pick what just happened and answer 3 yes-or-no questions. You'll see how risky it is and what to do right now.")}</p>
<div class="tl-chon" role="group" aria-label="{t("Bạn vừa gặp gì?", "What happened?")}">{chon}</div>
<div class="tl-hoi" id="tl-hoi" hidden aria-live="polite"></div>
<div class="tl-kq" id="tl-kq" hidden aria-live="polite"></div>
</section>"""

    # ----- 2. Danh bạ chiêu lừa -----
    loc = "".join(
        f'<button type="button" class="tl-loc-nut" data-ai="{g["id"]}" aria-pressed="{"true" if i == 0 else "false"}">{esc(chu(g))}</button>'
        for i, g in enumerate(D["nhom_ai"]))
    the, chi_tiet = [], []
    ten_tro = {x["url"]: chu(x["phu"]).split(" · ")[0] for x in D["tap"] if x["url"]}
    for c in D["chieu"]:
        cid = c["id"]
        cham = "".join(f'<i class="{"on" if i < c["muc"] else ""}"></i>' for i in range(5))
        so_tap = " · ".join(f"#{s}" for s in c["video"])
        the.append(
            f'<button type="button" class="tl-the tl-m-{c["mau"]}" data-chieu="{cid}" data-ai="{" ".join(c["ai"])}" aria-expanded="false" aria-controls="chieu-{cid}">'
            f'<span class="tl-the-bia">{tl_icon(c["icon"])}<b>{esc(chu(c["ten"]))}</b></span>'
            f'<span class="tl-the-chan"><span>{so_tap}</span><span class="tl-cham" role="img" aria-label="{t("Mức nguy hiểm", "Danger level")} {c["muc"]}/5">{cham}</span></span></button>')
        video = "".join(
            f'<a class="tl-vd" href="{u}" data-tl="video-{s}">{ic(p, "play")}<span><b>#{s}</b> {esc(ten)}</span></a>'
            for s in c["video"] for u, ten in [bai(s)] if u)
        chi_tiet.append(f"""<article class="tl-ct tl-m-{c["mau"]}" id="chieu-{cid}" hidden aria-labelledby="chieu-{cid}-h">
<div class="tl-ct-dau"><span class="tl-ct-ic">{tl_icon(c["icon"])}</span><div><h3 id="chieu-{cid}-h">{esc(chu(c["ten"]))}</h3><p>{esc(chu(c["ngan"]))}</p></div>
<button type="button" class="tl-ct-dong" aria-label="{t("Đóng thẻ", "Close card")}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>
<div class="tl-ct-hai">
<div><p class="tl-ct-nhan tl-do-chu">{t("Dấu hiệu", "Red flags")}</p><ul class="tl-co">{"".join(f"<li>{esc(chu(x))}</li>" for x in c["dau_hieu"])}</ul></div>
<div><p class="tl-ct-nhan tl-xanh-chu">{t("Làm ngay", "Do this")}</p><ul class="tl-lam">{"".join(f"<li>{esc(chu(x))}</li>" for x in c["lam"])}</ul></div>
</div>
<div class="tl-ct-di">{video}<a class="btn tl-tro" href="{c["tro"]}" data-tl="tro-{cid}">{ic(p, "gamepad")}{t("Tập nhận ra", "Practise")}: {esc(ten_tro.get(c["tro"], ""))}</a></div>
</article>""")
    chieu = f"""<section class="tl-khoi tl-chieu" id="chieu-lua" aria-labelledby="tl-chieu-h">
<p class="tl-nhan">{t("Danh bạ chiêu lừa", "Scam field guide")}</p>
<h2 id="tl-chieu-h">{t(f"{len(D['chieu'])} chiêu lừa dùng AI hay gặp nhất", f"The {len(D['chieu'])} most common AI scams")}</h2>
<div class="tl-loc" role="group" aria-label="{t("Hay nhắm vào ai", "Who it targets")}">{loc}</div>
<div class="tl-luoi">{"".join(the)}</div>
<div class="tl-cts">{"".join(chi_tiet)}</div>
</section>"""

    # ----- 3. Đường tập 4 trò chơi -----
    buoc = []
    for i, x in enumerate(D["tap"], 1):
        trong = (f'<span class="tl-buoc-anh"><img src="{p}assets/{x["anh"]}" alt="" width="56" height="56" loading="lazy" decoding="async"></span>'
                 f'<span class="tl-buoc-chu"><b>{esc(chu(x["ten"]))}</b><small>{esc(chu(x["phu"]))}</small></span>')
        if x["url"]:
            o = f'<a class="tl-buoc-the" href="{x["url"]}" data-tap="{x["id"]}">{trong}<span class="tl-da">{ic(p, "check")}{t("Đã ghé", "Visited")}</span></a>'
        else:
            o = f'<span class="tl-buoc-the tl-sap">{trong}<span class="tl-sap-nhan">{t("Sắp có", "Coming soon")}</span></span>'
        buoc.append(f'<li class="tl-buoc" data-buoc="{x["id"]}"><span class="tl-buoc-so">{i}</span>{o}</li>')
    so_choi = sum(1 for x in D["tap"] if x["url"])
    tap = f"""<section class="tl-khoi tl-tap" id="tap-nhan-ra" aria-labelledby="tl-tap-h">
<p class="tl-nhan">{t("Phòng tập", "Practice room")}</p>
<h2 id="tl-tap-h">{t("Tập nhận ra trước khi gặp thật", "Practise spotting scams before you meet one")}</h2>
<div class="tl-tien"><span class="tl-tien-thanh"><span id="tl-tien-dai"></span></span><span class="tl-tien-so" id="tl-tien-so" data-tong="{so_choi}">0/{so_choi}</span></div>
<ol class="tl-duong">{"".join(buoc)}</ol>
</section>"""

    # ----- 4. Đồ cho cả nhà + Gửi cho bố mẹ -----
    do = [
        ("key", t("Thẻ mật khẩu gia đình", "Family safe-word card"), t("Đặt một từ bí mật, in dán tủ lạnh", "Pick a secret word, print it for the fridge"), f"cuoc-goi-gia-giong.html#cg-mk", "mat-khau"),
        ("print", t("Đồ in cho gia đình", "Family printables"), t("Luật dùng AI, sổ tay chữ to cho ông bà", "AI rules, a large-print phone guide"), f"do-in-gia-dinh.html", "do-in"),
        ("route", t("Lộ trình chống lừa đảo", "Anti-scam learning path"), t("Các video chống lừa đảo theo thứ tự", "The anti-scam videos in order"), f"lo-trinh-nganh.html?ai=an-toan", "lo-trinh"),
        ("clock", t("Phiếu “Giờ vàng”", "“Golden hour” sheet"), t("Việc cần làm trong giờ đầu sau khi bị lừa", "What to do in the first hour after a scam"), "", "gio-vang"),
    ]
    o_do = "".join(
        (f'<a class="tl-do" href="{u}" data-tl="{k}">' if u else '<span class="tl-do tl-sap">') +
        f'<span class="tl-do-ic">{tl_icon(i)}</span><span class="tl-o-chu"><b>{esc(a)}</b><small>{esc(b)}</small></span>' +
        ("</a>" if u else f'<span class="tl-sap-nhan">{t("Sắp có", "Coming soon")}</span></span>')
        for i, a, b, u, k in do)
    url_gui = BASE + GOC + "tram-chong-lua-dao.html?utm_source=chia-se&utm_campaign=tram-lua-dao"
    fb = "https://www.facebook.com/sharer/sharer.php?u=" + quote(url_gui, safe="")
    tieu_gui = t("Trạm chống lừa đảo AI: kiểm tra cuộc gọi, tin nhắn lạ trong 30 giây", "AI scam help desk: check a strange call or message in 30 seconds")
    nha = f"""<section class="tl-khoi tl-nha" id="cho-ca-nha" aria-labelledby="tl-nha-h">
<p class="tl-nhan">{t("Cho cả nhà", "For the whole family")}</p>
<h2 id="tl-nha-h">{t("Rào trước cho bố mẹ, ông bà", "Protect your parents ahead of time")}</h2>
<div class="tl-do-luoi">{o_do}</div>
<div class="chia-se tl-gui">
<img class="tl-gui-anh" src="{p}assets/bit-giai-thich.svg" alt="" width="84" height="80" loading="lazy" decoding="async">
<div><p class="chia-se-h">{t("Gửi trạm này cho bố mẹ", "Send this page to your parents")}</p>
<p class="tl-gui-dan">{t("Kẻ gian nhắm vào người lớn tuổi nhiều nhất. Một tin nhắn hôm nay giúp cả nhà biết phải làm gì khi điện thoại reo lúc nửa đêm.", "Scammers target older people the most. One message today helps your family know what to do when the phone rings at midnight.")}</p>
<div class="cta"><button type="button" class="btn btn-yt" data-chia-se data-url="{esc(url_gui)}" data-tieu-de="{esc(tieu_gui)}" hidden>{ic(p, "share")}{t("Gửi qua Zalo", "Send by message")}</button>
<a class="btn" href="{esc(fb)}" target="_blank" rel="noopener" data-tl="gui-fb"><span class="nt nt-sm nt-facebook" aria-hidden="true"><svg><use href="{p}assets/nen-tang.svg#nt-facebook"/></svg></span>Facebook</a>
<button type="button" class="btn" data-chep-link="{esc(url_gui)}" hidden>{ic(p, "link")}{t("Chép link", "Copy link")}</button></div></div>
</div>
</section>"""

    # ----- 5. Lỡ bị lừa rồi -----
    sos_ds = "".join(f"<li>{esc(chu(x))}</li>" for x in D["sos"])
    o_so = [("113", t("Công an", "Police (Vietnam)")), (t("Số sau thẻ", "Card hotline"), t("Ngân hàng của bạn", "Your bank")),
            ("canhbao.khonggianmang.vn", t("Phản ánh lừa đảo trên mạng", "Report online scams (Vietnam)"))]
    sos = f"""<section class="tl-khoi tl-sos" id="lo-bi-lua" aria-labelledby="tl-sos-h">
<p class="tl-nhan">{t("Lỡ bị lừa rồi", "Already scammed")}</p>
<h2 id="tl-sos-h">{t("Lỡ chuyển tiền hay lộ mã OTP? Làm ngay theo thứ tự", "Sent money or shared an OTP? Do this now, in order")}</h2>
<div class="tl-sos-o">{"".join(f'<span class="tl-so"><b>{esc(a)}</b><small>{esc(b)}</small></span>' for a, b in o_so)}</div>
<ol class="tl-sos-ds">{sos_ds}</ol>
</section>"""

    # Dữ liệu cho tram-lua-dao.js: chỉ phần Kiểm tra nhanh, phần còn lại đã nằm trong HTML
    du_lieu = json.dumps({
        "th": [{"id": x["id"], "ten": chu(x["ten"]), "chieu": x["chieu"], "hoi": [chu(h) for h in x["hoi"]], "lam": [chu(h) for h in x["lam"]]} for x in D["tinh_huong"]],
        "muc": [{"ten": chu(m), "giai": chu(m["giai"])} for m in D["muc"]],
        "ten_chieu": {c["id"]: chu(c["ten"]) for c in D["chieu"]},
        "nhan": {"cau": t("Câu", "Question"), "co": t("Có", "Yes"), "khong": t("Không", "No"), "doi": t("Chọn tình huống khác", "Pick another situation"),
                 "lam_lai": t("Kiểm tra lại", "Check again"), "lam_ngay": t("Làm ngay", "Do this now"), "co_dau": t("dấu hiệu", "signs"),
                 "xem_chieu": t("Xem chiêu này trong danh bạ", "See this scam in the field guide"), "lo": t("Lỡ chuyển tiền rồi?", "Already sent money?"),
                 "muc": t("Mức nguy hiểm", "Risk level")},
    }, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    desc = t("Trạm chống lừa đảo AI miễn phí: kiểm tra cuộc gọi giả giọng, video call deepfake, tin nhắn, quảng cáo lạ trong 30 giây, 8 chiêu lừa hay gặp, trò chơi tập nhận ra và việc cần làm khi lỡ bị lừa.",
             "A free AI scam help desk: check a fake-voice call, deepfake video call, strange text or ad in 30 seconds, see the 8 most common AI scams, practise with games, and know what to do if you've been scammed.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("An toàn số cho cả nhà · miễn phí · không lưu gì", "Online safety for the whole family · free · nothing saved")}</p>\n'
            f'<h1>{t("Trạm chống lừa đảo AI", "AI scam help desk")}</h1>\n'
            f'<p class="lead">{t("Giọng giả, mặt giả, tin nhắn giả. Kiểm tra điều bạn vừa gặp, xem kẻ gian hay dùng chiêu gì, tập nhận ra, rồi gửi cho bố mẹ.", "Fake voices, fake faces, fake messages. Check what just happened, learn the tricks scammers use, practise spotting them, then send this to your parents.")}</p>\n'
            f'<nav class="tl-nhay" aria-label="{t("Trong trang", "On this page")}"><a href="#kiem-tra-nhanh">{t("Kiểm tra nhanh", "Quick check")}</a><a href="#chieu-lua">{t("Chiêu lừa", "Scams")}</a>'
            f'<a href="#hoi-dap">{t("Hỏi đáp", "Q&amp;A")}</a><a href="#tap-nhan-ra">{t("Tập nhận ra", "Practise")}</a><a href="#cho-ca-nha">{t("Cho cả nhà", "Family")}</a><a href="#lo-bi-lua" class="tl-nhay-sos">{t("Lỡ bị lừa", "Scammed?")}</a></nav>\n'
            f'</div><img class="head-art" src="{p}assets/bit-sai-roi.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="tl" id="tl">
{kt}
{chieu}
{hoi_dap_khoi(p)}
{tap}
{nha}
{sos}
<p class="gh-ghi">{t("Câu trả lời của bạn chỉ nằm trên máy bạn, không gửi đi đâu. Trang này giúp nhận ra dấu hiệu, không thay cho ngân hàng hay công an: khi nghi ngờ, hỏi thẳng họ.", "Your answers stay on your device; nothing is sent. This page helps you spot warning signs; it doesn't replace your bank or the police. When in doubt, ask them directly.")}</p>
<script type="application/json" id="tl-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "tram-chong-lua-dao.html", trang("tram-chong-lua-dao.html", t(f"Trạm chống lừa đảo AI: kiểm tra cuộc gọi, tin nhắn lạ trong 30 giây | {SITE}", f"AI scam help desk: check a strange call or message in 30 seconds | {SITE}"),
                                                  desc, band, main, p, og_type="website", q="",
                                                  cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/tram-lua-dao.css?v=dev">\n<link rel="stylesheet" href="{p}assets/tro-choi/hoi-dap-lua-dao.css?v=dev">\n<script src="{p}tram-lua-dao.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

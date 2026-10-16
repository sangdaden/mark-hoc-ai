# ---------- trò chơi "Bản đồ AI ẩn" (ban-do-ai-an.html): 4 bức tranh, 24 đồ vật, mỗi đồ vật một video (408-413, 423-428, 438-443, 501-506) ----------
# Nội dung ở data/ban-do-ai-an.json (cả hai ngôn ngữ), tranh và mô phỏng ở ban-do-ai-an.js, CSS ở assets/tro-choi/ban-do-ai-an.css.
# Video chưa có bài trên web thì thẻ ghi "Video sắp ra"; bài lên web rồi thì nút "Đọc bài" tự hiện (co_bai).

def _bd_chu(x):
    if isinstance(x, dict) and set(x) <= {"vi", "en"} and x:
        return x[LG]
    if isinstance(x, dict):
        return {k: _bd_chu(v) for k, v in x.items()}
    if isinstance(x, list):
        return [_bd_chu(v) for v in x]
    return x


HINH_CHOI["ban-do"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="padding:0;overflow:hidden">'
    '<svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block">'
    '<rect width="200" height="120" fill="#E0F2FE"/><rect y="84" width="200" height="36" fill="#BFDBFE"/>'
    '<rect x="70" y="18" width="60" height="40" rx="5" fill="#0F172A"/><rect x="74" y="22" width="52" height="32" fill="#2563EB"/>'
    '<ellipse cx="46" cy="96" rx="20" ry="8" fill="#fff" stroke="#0F172A" stroke-width="2"/><rect x="150" y="56" width="32" height="40" rx="4" fill="#fff" stroke="#0F172A" stroke-width="2"/>'
    '<circle cx="164" cy="78" r="9" fill="#06D6A0"/><rect x="20" y="40" width="16" height="30" rx="7" fill="#0F172A"/>'
    '<g fill="none" stroke="#FACC15" stroke-width="4"><circle cx="46" cy="94" r="16"/><circle cx="100" cy="38" r="22"/><circle cx="166" cy="76" r="20"/><circle cx="28" cy="54" r="16"/></g>'
    f'<rect x="58" y="96" width="84" height="18" rx="9" fill="#0F172A"/><text x="100" y="109" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Inter,sans-serif">{t("Đã tìm 0/24", "Found 0/24")}</text>'
    '</svg></span>')


@trang_rieng("ban-do-ai-an.html", "0.7")
def tao_ban_do_ai_an():
    p = t("", "../")
    D = load("ban-do-ai-an")
    canh = [_bd_chu(c) for c in D["canh"]]
    diem = []
    for d in D["diem"]:
        x = _bd_chu({k: v for k, v in d.items()})
        so = d["video"][0]
        v = co_bai.get(so)
        x["video"] = so
        x["bai"] = f"bai/{ten_file(v)}.html" if v else ""
        diem.append(x)
    nhan = {
        "video": "Video", "bat_dau": t("Bấm vào một thứ trong tranh", "Tap something in the picture"),
        "xong_canh": t("Bạn đã tìm hết AI ẩn trong tranh này!", "You found every hidden AI in this picture!"),
        "kieu": {"truot": t("Kéo thử", "Drag it"), "chon": t("Đoán trước", "Guess first"), "xac_suat": t("Đoán như AI", "Guess like the AI"), "phan_loai": t("Xếp vào ngăn", "Sort it")},
        "dung": t("Chuẩn rồi!", "Spot on!"), "chua_dung": t("Chưa đúng, xem lời giải ở trên.", "Not quite, see the explanation above."),
        "vong": t("Lượt", "Round"), "vong_tiep": t("Lượt tiếp", "Next round"), "xem_giai": t("Xem Bit giải thích", "See Bit's explanation"),
        "trung_ai": t("Bạn đoán trùng AI!", "You matched the AI!"), "ai_chon": t("AI chọn", "The AI picks"),
        "ban_doan_trung": t("Bạn đoán trùng AI", "You matched the AI"), "ban_xep_dung": t("Bạn xếp đúng", "You sorted right"), "dung_la": t("Đúng ra là", "It belongs in"),
        "bit_noi": t("Bit giải thích", "Bit explains"), "thu": t("Thử ngay hôm nay", "Try it today"),
        "doc_bai": t("Đọc bài và xem video", "Read the article and watch"), "sap_ra": t("Video sắp ra", "Video coming soon"),
        "ai_tiep": t("AI ẩn tiếp theo", "Next hidden AI"),
    }
    du_lieu = json.dumps({"canh": canh, "diem": diem, "nhan": nhan, "lg": LG, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    n = len(diem)
    desc = t(f"Trò chơi miễn phí: tìm {n} AI chạy ngầm trong điện thoại, ngoài phố, trong nhà và ở siêu thị. Bấm từng đồ vật, thử mô phỏng 30 giây, xem Bit giải thích.",
             f"Free game: find {n} AIs hiding in your phone, on the street, at home and at the supermarket. Tap each thing, try a 30-second simulation, hear Bit explain.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t(f"Trò chơi · {n} AI ẩn · 4 bức tranh", f"Game · {n} hidden AIs · 4 pictures")}</p>\n'
            f'<h1>{t("Bản đồ AI ẩn", "The hidden AI map")}</h1>\n'
            f'<p class="lead">{t("AI đang chạy ngầm quanh bạn mỗi ngày. Bấm vào từng thứ trong tranh, thử 30 giây là hiểu nó làm gì.", "AI quietly runs all around you every day. Tap each thing in the picture and in 30 seconds you will see what it does.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="bd" id="bd">
<link rel="stylesheet" href="{p}assets/tro-choi/ban-do-ai-an.css?v=dev">
<div class="bd-tren">
<div class="cb-tabs bd-tabs" role="tablist" aria-label="{t("Chọn bức tranh", "Pick a picture")}"></div>
<p class="bd-dem">{t("Đã tìm", "Found")} <b>0/{n}</b><span class="bd-dem-thanh"><i></i></span></p>
</div>
<div class="bd-khu">
<div class="bd-trai">
<div class="bd-tranh" role="group"></div>
<div class="bd-hang" aria-label="{t("Các thứ trong tranh", "Things in the picture")}"></div>
</div>
<section class="bd-the is-trong" aria-live="polite" aria-labelledby="bd-the-ten"></section>
</div>
{khoi_chia_se(BASE + GOC + "ban-do-ai-an.html", t("Bản đồ AI ẩn: điện thoại, nhà bạn, ngoài phố có bao nhiêu AI chạy ngầm?", "The hidden AI map: how many AIs hide in your phone, home and street?"), p)}
<p class="gh-ghi">{t("Các ca trong trò là ví dụ minh họa, tên người và nơi chốn đều hư cấu. Con số lấy từ kịch bản video; số nào là ví dụ thì có ghi.", "The cases are illustrations with made-up people and places. Figures come from the video scripts; examples are marked.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript.", "This game needs JavaScript.")}</p></noscript>
<script type="application/json" id="bd-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "ban-do-ai-an.html", trang("ban-do-ai-an.html", t(f"Bản đồ AI ẩn: tìm AI chạy ngầm quanh bạn | {SITE}", f"The hidden AI map: find the AI all around you | {SITE}"),
                                            desc, band, main, p, og_type="website", q="",
                                            cuoi=f'<script src="{p}ban-do-ai-an.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

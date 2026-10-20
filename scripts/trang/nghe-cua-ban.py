# ---------- mô phỏng "Nghề của bạn với AI" (nghe-cua-ban.html): chọn nghề, xem AI gánh được việc nào trong ngày, rồi đấu với AI 3 vòng ----------
# Nghề, việc và bài đấu ở data/nghe-cua-ban.json (cả hai ngôn ngữ), cách chơi ở nghe-cua-ban.js, CSS ở assets/tro-choi/nghe-cua-ban.css.
# Mỗi việc dẫn sang trạm cùng chủ đề ở trang thực hành của nghề (ai-<nhóm>.html?tram=<id>); cuối trang có lộ trình video của nghề.
# Mở thẳng một nghề bằng ?nghe=<id>. Nằm trong Góc thực hành (nhóm "Dùng AI mỗi ngày"), không phải trang Game.

HINH_CHOI["nghe-cua-ban"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;align-content:center;gap:6px;padding:0 8px">'
    + "".join(f'<span style="display:flex;align-items:center;gap:8px;width:min(100%,300px);justify-self:center;padding:6px 10px;border-radius:10px;background:var(--panel);border:1px solid var(--edge);font:600 12.5px/1.3 var(--f-body)">'
              f'<b style="flex:none;width:38px;font:700 11.5px/1 var(--f-mono);color:var(--muted)">{g}</b><span style="flex:1">{v}</span>'
              f'<span style="flex:none;padding:3px 8px;border-radius:999px;background:{n};color:{c};font:700 11px/1.2 var(--f-body)">{m}</span></span>'
              for g, v, m, n, c in [("6:45", t("Soạn giáo án", "Plan a lesson"), t("AI làm nháp", "AI drafts"), "#CCFBF1", "#0F766E"),
                                    ("14:00", t("Chấm bài", "Mark work"), t("AI phụ", "AI helps"), "#FEF3C7", "#92400E"),
                                    ("20:00", t("Nghe học trò", "Listen"), t("Chỉ bạn", "Only you"), "#E2E8F0", "#334155")])
    + '</span>')


def _nc_ngu(x, L):
    if isinstance(x, dict):
        if set(x) <= {"vi", "en"} and "vi" in x:
            return x.get(L, x["vi"])
        return {k: _nc_ngu(v, L) for k, v in x.items()}
    if isinstance(x, list):
        return [_nc_ngu(v, L) for v in x]
    return x


@trang_rieng("nghe-cua-ban.html", "0.7")
def tao_nghe_cua_ban():
    p = t("", "../")
    L = "en" if LG == "en" else "vi"
    D = load("nghe-cua-ban")
    LT = load("lo-trinh-nganh")
    tro = {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in sorted((R / "data" / "tro-choi").glob("*.json"))}

    def video(so):
        v = co_bai.get(so)
        return {"so": so, "ten": seo.get(str(so), ""), "url": f"{p}bai/{ten_file(v)}.html"} if v else None

    nghe = []
    for x in D["nghe"]:
        y = _nc_ngu({k: v for k, v in x.items() if k not in ("tu_khoa", "video_so", "lo_trinh_nghe")}, L)
        y["tu_khoa"] = x.get("tu_khoa", [])
        if x.get("lo_trinh"):
            buoc = LT["nganh"].get(x["lo_trinh"], {}).get("buoc", [])
            # video của bước sát nghề nhất (bước 2 của lộ trình), đủ 3 cái thì thôi
            so = [s for b in buoc[1:] + buoc[:1] for s in b.get("so", [])]
            y["lt_url"] = "lo-trinh-nganh.html?ai=" + x["lo_trinh"]
        else:
            # nghề chưa có lộ trình riêng (y tế): video ghi thẳng, lộ trình mở theo chữ gõ như ô "nghề khác"
            so = x.get("video_so", [])
            y["lt_url"] = "lo-trinh-nganh.html?nghe=" + quote(x["lo_trinh_nghe"])
        y["video"] = [v for v in (video(s) for s in so) if v][:3]
        y["trang_ten"] = tro.get(x["trang"], {}).get("ten", {}).get(L, "")
        tram = _tram_theo_trang(x["trang"])
        y["so_tram"], y["tram_ten"] = len(tram), {k: ten[L] for k, ten, _, _ in tram}
        # Cô Hạnh (nhân vật phụ) mặc đồ theo nghề: assets/nhan-vat/co-hanh-<id>.svg
        if (R / "assets" / "nhan-vat" / f'co-hanh-{x["id"]}.svg').exists():
            y["hinh"] = f'{p}assets/nhan-vat/co-hanh-{x["id"]}.svg'
        nghe.append(y)
    # nghề người xem tự gõ mà chưa có mô phỏng: dẫn sang lộ trình theo ngành
    LT_EN = load("en/lo-trinh-nganh")["nganh"] if L == "en" else {}
    khac = [{"id": k, "ten": LT_EN.get(k, v)["ngan"], "tu_khoa": v.get("tu_khoa", []) + LT_EN.get(k, {}).get("tu_khoa", [])}
            for k, v in LT["nganh"].items() if k not in {x.get("lo_trinh") for x in D["nghe"]} and v.get("tu_khoa")]

    nhan = {
        "muc": {"nhap": t("AI làm nháp", "AI drafts it"), "phu": t("AI phụ một tay", "AI lends a hand"), "nguoi": t("Chỉ bạn làm", "Only you")},
        "ai": t("AI làm", "AI does"), "ban": t("Bạn vẫn làm", "You still"), "thu_tram": t("Thử ở trạm", "Try it at"),
        "dau_viec": t("Đem việc này ra đấu với AI", "Take on AI at this task"),
        "dau_ngan": t("Đấu với AI", "Take on AI"),
        "hanh_alt": t("Cô Hạnh trong trang phục nghề: {x}", "Ms. Hanh dressed for the job: {x}"),
        "chua_co": t("Nghề “{x}” chưa có mô phỏng. Mình mở lộ trình video sát nghề này cho bạn nhé.", "“{x}” has no simulation yet. Here's the video path closest to it."),
        "mo_lo_trinh": t("Mở lộ trình video", "Open the video path"),
        "gan_nghe": t("Gần nhất với nghề của bạn:", "Closest to your job:"),
        "v": t("Vòng {n}/3", "Round {n}/3"),
        "v1": t("Tốc độ", "Speed"), "v2": t("Bắt lỗi", "Catch the mistake"), "v3": t("Hợp với người nhận", "Right for your people"),
        "ban_ten": t("Bạn", "You"), "ai_ten": "AI",
        "bat_dau": t("Bắt đầu tự làm", "Start writing"), "xong": t("Xong", "Done"),
        "ai_dang": t("AI đang soạn…", "AI is writing…"),
        "ket_v1": t("Bạn viết 1 dòng trong {g} giây. AI viết {n} dòng trong {a} giây.", "You wrote 1 line in {g} s. AI wrote {n} lines in {a} s."),
        "giay": t("giây", "s"),
        "thang": {"ban": t("Bạn thắng", "You win"), "ai": t("AI thắng", "AI wins"), "hoa": t("Hòa", "Draw")},
        "tiep": t("Vòng tiếp", "Next round"), "xem_ket": t("Xem kết quả", "See the result"),
        "dung_bat": t("Bắt đúng! AI không tự thấy lỗi này, bạn thì thấy.", "Caught it! AI didn't spot its own mistake, you did."),
        "sai_bat": t("Câu này đúng. Lỗi nằm ở câu {n}.", "That one's right. The mistake is in question {n}."),
        "dap_an": t("Đáp án", "Answer"), "goc": t("Để đối chiếu", "To check against"),
        "dung_chon": t("Chuẩn!", "Spot on!"), "sai_chon": t("Chưa phải.", "Not quite."),
        "ti_so": t("Bạn {a} : {b} AI", "You {a} : {b} AI"),
        "ket": {"thang": t("Bạn thắng. AI nhanh, nhưng người bắt lỗi và hiểu người nhận là bạn.", "You win. AI is fast, but you're the one who catches mistakes and knows your people."),
                "hoa": t("Hòa. Thử lại vòng bắt lỗi: đó là phần AI cần bạn nhất.", "A draw. Try the mistake round again: that's where AI needs you most."),
                "thua": t("AI thắng lần này. Chơi lại và soi kỹ bản AI viết nhé.", "AI wins this time. Play again and read AI's draft more carefully.")},
        "ket_rut": t("AI làm nháp nhanh. Bạn kiểm, sửa và quyết. Bạn cộng AI là đội tốt nhất.", "AI drafts fast. You check, fix and decide. You plus AI is the best team."),
        "luyen": t("Luyện tiếp", "Keep practising"), "tram_ds": t("{n} trạm thực hành", "{n} practice stations"),
        "lo_trinh": t("Lộ trình video cho nghề này", "Video path for this job"),
        "choi_lai": t("Đấu lại", "Play again"), "doi_nghe": t("Chọn nghề khác", "Pick another job"),
        "minh_hoa": t("Bản AI ở đây do kênh viết để minh họa, không gọi AI thật.", "AI's drafts here were written by the channel as an illustration; no real AI is called."),
    }
    du_lieu = json.dumps({"nghe": nghe, "khac": khac, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    def chip_hinh(x):
        if x.get("hinh"):
            return f'<span class="nc-chip-hinh"><img src="{x["hinh"]}" alt="" width="40" height="48"></span>'
        return f'<span aria-hidden="true">{x["bt"]}</span>'
    chip = "".join(f'<button type="button" class="nc-chip" data-nghe="{esc(x["id"])}" aria-pressed="false">{chip_hinh(x)}{esc(x["ten"])}</button>' for x in nghe)
    desc = t("Mô phỏng miễn phí: chọn nghề của bạn, xem việc nào trong ngày AI làm được, việc nào chỉ bạn làm, rồi đấu với AI 3 vòng tốc độ, bắt lỗi và chọn bản đúng.",
             "Free simulation: pick your job, see which daily tasks AI can do and which only you can, then take on AI in 3 rounds: speed, catching mistakes and picking the right version.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Mô phỏng · 3 phút · chơi trên điện thoại", "Simulation · 3 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Nghề của bạn với AI", "Your job with AI")}</h1>\n'
            f'<p class="lead">{t("AI gánh được việc nào trong một ngày làm việc của bạn? Xem từng việc, rồi đấu thử với AI.", "Which of your daily tasks can AI take on? Go through your day, then take AI on.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="nc" id="nc">
<div class="nc-dau"><p class="nc-tien" id="nc-tien" aria-live="polite">{t("Bước 1 · Chọn nghề", "Step 1 · Pick your job")}</p><span class="hd-cho" data-hd-cho></span></div>
<section class="nc-khoi" id="nc-chon" aria-labelledby="nc-chon-h">
<h2 class="nc-h" id="nc-chon-h">{t("Bạn làm nghề gì?", "What do you do?")}</h2>
<div class="nc-chip-ds" role="group" aria-label="{t("Nghề", "Jobs")}">{chip}</div>
<form class="nc-go" id="nc-go"><label for="nc-o">{t("Nghề khác", "Something else")}</label>
<span class="nc-go-hang"><input id="nc-o" type="text" autocomplete="off" placeholder="{t("Gõ nghề của bạn, ví dụ: kế toán", "Type your job, e.g. accountant")}"><button type="submit" class="btn">{t("Tìm", "Go")}</button></span></form>
<p class="nc-bao" id="nc-bao" role="status" hidden></p>
</section>
<section class="nc-khoi" id="nc-ngay" hidden aria-labelledby="nc-ngay-h"></section>
<section class="nc-khoi" id="nc-dau-tri" hidden aria-labelledby="nc-dau-h"></section>
<section class="nc-khoi nc-ket" id="nc-ket" hidden aria-live="polite"></section>
<p class="ld-ghi">{nhan["minh_hoa"]} {t("Mức AI làm được của từng việc là nhận định của kênh cho cách dùng chatbot phổ biến hiện nay. Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "How much AI can do for each task is the channel's judgement for today's common chatbots. Your answers stay on your device.")}</p>
<noscript><p>{t("Mô phỏng cần JavaScript. Bạn vẫn có thể vào", "The simulation needs JavaScript. You can still open the")} <a href="{p}lo-trinh-nganh.html">{t("Lộ trình theo ngành", "learning paths")}</a>.</p></noscript>
<script type="application/json" id="nc-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "nghe-cua-ban.html", trang("nghe-cua-ban.html", t(f"Nghề của bạn với AI: AI làm được việc nào của bạn? | {SITE}", f"Your job with AI: which of your tasks can AI do? | {SITE}"),
                                            desc, band, main, p, og_type="website", q="",
                                            cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/nghe-cua-ban.css?v=dev">\n<script src="{p}nghe-cua-ban.js?v=dev" defer></script>\n')

# ---------- trò chơi "Xếp mốc lịch sử AI" (dong-thoi-gian-ai.html): series 512-517 "Lịch sử AI trong sáu tập" ----------
# Mốc ở data/dong-thoi-gian-ai.json (cả hai ngôn ngữ), cách chơi ở dong-thoi-gian-ai.js, CSS ở assets/tro-choi/dong-thoi-gian-ai.css.
# Vòng 1: chạm một mốc rồi chạm đúng năm trên dòng thời gian. Vòng 2: dòng thời gian "chatbot vẽ" có 2 năm sai, khoanh chỗ sai.

HINH_CHOI["dong-thoi-gian"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="align-content:center;gap:10px">'
    '<span style="position:relative;display:flex;justify-content:space-between;padding:0 4px">'
    '<span style="position:absolute;left:0;right:0;top:50%;height:3px;border-radius:3px;background:var(--grad)"></span>'
    + "".join(f'<span style="position:relative;padding:2px 7px;border-radius:999px;background:var(--panel);border:1.5px solid var(--edge);font:700 12px/1.4 var(--f-mono)">{n}</span>' for n in ("1950", "1956", "1997", "2017"))
    + '</span><span style="display:flex;gap:6px;justify-content:center">'
    f'<span style="padding:5px 10px;border-radius:10px;background:var(--panel);border:1.5px dashed var(--blue);font:700 12.5px/1.3 var(--f-body)">{t("Deep Blue thắng cờ", "Deep Blue wins")}</span>'
    f'<span style="padding:5px 10px;border-radius:10px;background:var(--panel);border:1.5px dashed var(--blue);font:700 12.5px/1.3 var(--f-body)">{t("Mùa đông AI", "AI winter")}</span>'
    '</span></span>')


@trang_rieng("dong-thoi-gian-ai.html", "0.7")
def tao_dong_thoi_gian_ai():
    p = t("", "../")
    D = load("dong-thoi-gian-ai")
    L = LG
    moc = [{"id": m["id"], "nam": m["nam"], "tap": m["tap"], "mau": m["mau"], "ten": m["ten"][L], "goi_y": m["goi_y"][L], "chu": m["chu"][L]} for m in D["moc"]]
    chatbot = [{"id": c["id"], "nam": c["nam"], "sai": c["sai"], "giai": c["giai"][L] if c.get("giai") else ""} for c in D["chatbot"]]
    nhan = {
        "v1": t("Vòng 1 · Xếp mốc vào đúng năm", "Round 1 · Put each milestone in its year"),
        "v1_lead": t("Chạm một mốc ở dưới, rồi chạm năm của nó trên dòng thời gian. Đặt nhầm thì chạm lại để gỡ ra.",
                     "Tap a milestone below, then tap its year on the timeline. Put one in the wrong place? Tap it again to take it back."),
        "chua_dat": t("Mốc chưa xếp", "Milestones to place"), "chon_moc": t("Chọn một mốc trước", "Pick a milestone first"),
        "dang_chon": t("Đang cầm:", "Holding:"), "cham_nam": t("chạm vào năm của nó", "now tap its year"),
        "kiem": t("Kiểm tra dòng thời gian", "Check my timeline"), "con": t("Còn {n} mốc chưa xếp", "{n} left to place"),
        "dung_v1": t("Bạn xếp đúng {a}/{b} mốc", "You placed {a}/{b} correctly"),
        "dung_het": t("Chuẩn từng năm! Bạn nhớ lịch sử AI giỏi hơn nhiều chatbot.", "Spot on! You know AI history better than many chatbots."),
        "sai_mot": t("Mốc đỏ đã về đúng chỗ. Đọc một câu dưới mỗi mốc để nhớ lâu hơn.", "The red ones have moved to their real years. Read the one-liner under each to make it stick."),
        "phan": t("Phần {n}/6", "Part {n}/6"), "dat_sai": t("bạn đặt ở", "you put it at"),
        "sang_v2": t("Sang vòng 2", "On to round 2"),
        "v2": t("Vòng 2 · Chatbot vẽ dòng thời gian", "Round 2 · A chatbot's timeline"),
        "v2_lead": t("Mark nhờ một chatbot: “Vẽ dòng thời gian lịch sử AI gồm 6 mốc từ năm 1950.” Có 2 năm bị sai. Chạm vào 2 dòng bạn nghi rồi bấm kiểm tra.",
                     "Mark asked a chatbot: “Draw a timeline of AI history with 6 milestones from 1950.” Two years are wrong. Tap the 2 rows you suspect, then check."),
        "chatbot": t("Chatbot", "Chatbot"), "minh_hoa": t("bản minh họa do kênh viết", "written by the channel as an illustration"),
        "hoi": t("Vẽ dòng thời gian lịch sử AI gồm 6 mốc từ năm 1950.", "Draw a timeline of AI history with 6 milestones from 1950."),
        "da_chon": t("Đã khoanh {n}/2", "Circled {n}/2"), "kiem2": t("Kiểm tra chỗ khoanh", "Check my circles"),
        "bat_dung": t("Bắt đúng", "Caught"), "bo_sot": t("Bỏ sót", "Missed"), "nham": t("Năm này đúng mà", "This year is right"),
        "xem_ket": t("Xem kết quả", "See your result"),
        "hang": [[8, t("Nhà sử học AI", "AI historian")], [6, t("Người kể chuyện AI", "AI storyteller")], [3, t("Đang học lịch sử", "History in progress")], [0, t("Xem lại series nhé", "Rewatch the series")]],
        "ket_phu": t("Vòng 1: {a}/6 mốc · Vòng 2: bắt {b}/2 lỗi", "Round 1: {a}/6 milestones · Round 2: caught {b}/2 errors"),
    }
    du_lieu = json.dumps({"moc": moc, "chatbot": chatbot, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Trò chơi miễn phí: xếp 6 mốc lịch sử AI từ Turing 1950 tới Transformer 2017 vào đúng năm, rồi bắt lỗi dòng thời gian do chatbot vẽ. Đi kèm series Lịch sử AI trong sáu tập.",
             "Free game: place 6 AI history milestones, from Turing in 1950 to the Transformer in 2017, in the right year, then catch the mistakes in a chatbot's timeline. Goes with the six-part AI history series.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 2 phút · chơi trên điện thoại", "Game · 2 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Xếp mốc lịch sử AI", "Build the AI timeline")}</h1>\n'
            f'<p class="lead">{t("Sáu mốc, bảy mươi năm. Bạn có xếp đúng năm hơn chatbot không?", "Six milestones, seventy years. Can you get the years right better than a chatbot?")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    rut = [("1", t("Ý tưởng có trước máy", "Ideas came before machines"), t("Câu hỏi của Turing có từ 1950, chatbot đến hơn 70 năm sau.", "Turing's question dates from 1950; chatbots came 70 years later.")),
           ("2", t("Hứa quá thì có mùa đông", "Overpromise, then winter"), t("Kết quả không theo kịp lời hứa thì tiền nghiên cứu bị cắt.", "When results lag behind promises, funding gets cut.")),
           ("3", t("Năm do chatbot ghi phải kiểm", "Check a chatbot's dates"), t("Máy đoán chữ tiếp theo, nên năm có thể lệch. Luôn so với nguồn.", "A model predicts the next token, so years can slip. Always check a source."))]
    the_rut = "".join(f'<div class="dt-rut"><span class="dt-so">{s}</span><b>{a}</b><p>{b}</p></div>' for s, a, b in rut)
    vid = "".join(f'<a class="ld-vid" href="{esc(kenh["youtube"])}" target="_blank" rel="noopener" data-so-video="{m["tap"]}"><span class="ld-vid-so">#{m["tap"]}</span><b>{esc(m["ten"])}</b><small class="muted">{t("Sắp ra mắt trên kênh", "Coming soon on the channel")}</small></a>' for m in moc)
    main = f"""<main class="dt" id="dt">
<p class="dt-tien" aria-live="polite"><span id="dt-vong"></span></p>
<div class="dt-san" id="dt-san"></div>
<section class="ld-ket dt-ket" id="dt-ket" hidden aria-live="polite">
<div class="ld-ket-the"><img src="{p}assets/bit-vui.svg" alt="" width="96" height="96"><div><p class="ld-ket-so" id="dt-ket-so"></p><p class="ld-ket-hang" id="dt-ket-hang"></p><p class="ld-ket-phu" id="dt-ket-phu"></p></div></div>
<h2 class="ld-ket-h">{t("Ba điều rút ra", "Three takeaways")}</h2>
<div class="dt-rut-ds">{the_rut}</div>
<h2 class="ld-ket-h">{t("Xem series Lịch sử AI trong sáu tập", "Watch the six-part AI history series")}</h2>
<div class="ld-ket-video">{vid}</div>
<div class="cta"><button type="button" class="btn" id="dt-lai">{t("Chơi lại", "Play again")}</button></div>
{khoi_chia_se(BASE + GOC + "dong-thoi-gian-ai.html", t("Xếp mốc lịch sử AI: bạn có nhớ đúng năm hơn chatbot?", "Build the AI timeline: can you beat a chatbot on dates?"), p)}
</section>
<p class="ld-ghi">{t("Năm và con số lấy từ nguồn đã kiểm trong kịch bản series. Mùa đông AI ghi “khoảng” vì các nguồn lệch nhau vài năm. Dòng thời gian của chatbot ở vòng 2 do kênh viết để minh họa, không gọi AI thật. Tên máy và tổ chức chỉ dùng để kể lịch sử.", "Years and numbers come from the sources checked for the series scripts. The AI winter is “around” because sources differ by a few years. The chatbot timeline in round 2 was written by the channel as an illustration; no real AI is called. Machine and organisation names are only used to tell the history.")}
{t("Kết quả chỉ nằm trên máy bạn, không gửi đi đâu.", "Your answers stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript.", "The game needs JavaScript.")}</p></noscript>
<script type="application/json" id="dt-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "dong-thoi-gian-ai.html", trang("dong-thoi-gian-ai.html", t(f"Xếp mốc lịch sử AI: trò chơi dòng thời gian 1950-2017 | {SITE}", f"Build the AI timeline: a 1950-2017 history game | {SITE}"),
                                                 desc, band, main, p, og_type="website", q="",
                                                 cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/dong-thoi-gian-ai.css?v=dev">\n<script src="{p}dong-thoi-gian-ai.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

# ---------- trò chơi "Phòng dự báo lũ" (du-bao-lu.html): video 564 "Dự báo lũ sớm bảy ngày" (AI và Trái Đất) ----------
# Số ví dụ ở data/du-bao-lu.json (đúng dãy số của video khi mưa 120 mm, đất ẩm), cách chơi ở du-bao-lu.js, CSS ở assets/tro-choi/du-bao-lu.css.
# Kéo lượng mưa, chọn độ ẩm của đất, bật "hồ xả nước" (thứ model không thấy) và xem mực nước 7 ngày, vùng ngập của một xã hư cấu.

HINH_CHOI["du-bao-lu"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="align-content:end;gap:6px">'
    '<span style="display:flex;align-items:end;gap:6px;height:70px;position:relative;width:100%;min-width:200px">'
    '<span style="position:absolute;left:0;right:0;bottom:46px;border-top:2px dashed #EF4444"></span>'
    + "".join(f'<span style="flex:1;height:{h}px;border-radius:6px 6px 2px 2px;background:{"#EF4444" if h > 46 else "var(--sky)"}"></span>' for h in (16, 26, 40, 56, 50, 36, 24))
    + f'</span><span style="display:flex;justify-content:space-between;gap:12px;font:700 12px/1.3 var(--f-mono)"><span>{t("Mưa 120 mm", "Rain 120 mm")}</span><span style="color:#EF4444">{t("Ngày 4 ⚠", "Day 4 ⚠")}</span></span></span>')


@trang_rieng("du-bao-lu.html", "0.7")
def tao_du_bao_lu():
    p = t("", "../")
    D = load("du-bao-lu")
    L = LG
    dat = [{"id": d["id"], "ra_song": d["ra_song"], "ten": d["ten"][L], "phu": d["phu"][L]} for d in D["dat"]]
    so_lieu = {k: D[k] for k in ("luu_vuc_km2", "goc_trieu_m3", "nen_m", "tang_m", "mu", "bao_dong", "ho_xa_m", "nha")}
    nhan = {
        "mm": "mm", "trieu_m3": t("triệu m³", "million m³"), "m": "m",
        "mua": t("Mưa trên thượng nguồn", "Rain upstream"), "luu_vuc": t("Lưu vực", "Basin"),
        "nuoc_mua": t("Nước mưa đổ xuống", "Rain that falls"), "ra_song": t("Chảy ra sông", "Reaches the river"),
        "ngay": t("Ngày {n}", "Day {n}"), "hom_nay": t("Hôm nay", "Today"),
        "bd": [t("Báo động 1", "Alarm 1"), t("Báo động 2", "Alarm 2"), t("Báo động 3", "Alarm 3")],
        "du_bao": t("AI dự báo", "AI forecast"), "thuc_te": t("Thực tế (hồ xả nước)", "What happens (dam release)"),
        "vuot": t("Ngày {d} vượt báo động 2 · báo trước {n} ngày", "Day {d} passes alarm 2 · {n} days' warning"),
        "vuot_ngay": t("Vượt báo động 2 ngay hôm nay: không còn thời gian báo trước", "Passes alarm 2 today: no time left to warn"),
        "khong_vuot": t("Không vượt báo động 2 trong 7 ngày", "Stays below alarm 2 for all 7 days"),
        "dinh": t("Đỉnh lũ {m} m vào ngày {d}", "Peak {m} m on day {d}"),
        "nha_ngap": t("{n}/{t} nhà bị ngập", "{n}/{t} homes flooded"), "nha_kho": t("Chưa nhà nào ngập", "No homes flooded"),
        "xem_ngay": t("Xem ngày", "Show day"), "chay": t("Chạy 7 ngày", "Play 7 days"),
        "ho_chu": t("Hồ thượng nguồn xả nước: nước thật vượt dự báo. Model chỉ học từ mưa và đất, không biết lịch xả hồ, nên cần tin chính thức.",
                    "The upstream dam releases water: the real river beats the forecast. The model only learned rain and soil; it can't see the dam schedule, so official warnings matter."),
        "do_dung": t("Đúng rồi! Từ khoảng 100 mm (đất ẩm), ngày 4 nước chạm 6,0 m. Kéo thử 90 rồi 100 để thấy ranh giới.", "Right! From about 100 mm (damp soil), the river hits 6.0 m on day 4. Drag to 90, then 100 to see the line."),
        "do_sai": t("Chưa đúng. Với đất ẩm, cần khoảng 100 mm thì ngày 4 nước mới chạm 6,0 m. Kéo thử 90 rồi 100 để thấy ranh giới.", "Not quite. With damp soil it takes about 100 mm for the river to reach 6.0 m on day 4. Drag to 90, then 100 to see the line."),
    }
    du_lieu = json.dumps({"dat": dat, "so": so_lieu, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Trò chơi miễn phí: kéo lượng mưa trên thượng nguồn, chọn độ ẩm của đất, xem mực nước 7 ngày và vùng ngập của một xã hư cấu lan ra. Hiểu AI dự báo lũ sớm thế nào và giới hạn của nó.",
             "Free game: drag the upstream rainfall, pick how wet the soil is, and watch a 7-day river forecast and the flood spread across a made-up village. See how AI forecasts floods early, and where it falls short.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Mô phỏng · 3 phút · chơi trên điện thoại", "Simulation · 3 minutes · works on your phone")}</p>\n'
            f'<h1>{t("Phòng dự báo lũ", "Flood forecast room")}</h1>\n'
            f'<p class="lead">{t("Mưa hôm nay trên núi, lũ về ngày kia ở đồng bằng. Kéo lượng mưa và xem nước dâng tới nhà nào.", "Rain on the mountains today, floodwater in the valley days later. Drag the rainfall and see whose homes the water reaches.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    gioi_han = [("ho", t("Hồ chứa xả nước", "Reservoir releases"), t("Lịch xả hồ không nằm trong dữ liệu mưa.", "Release schedules aren't in the rain data.")),
                ("de", t("Đê vỡ", "Broken dikes"), t("Một chỗ vỡ đổi hẳn đường nước chảy.", "One breach changes where the water goes.")),
                ("suoi", t("Lũ quét suối nhỏ", "Flash floods on streams"), t("Đến quá nhanh, quá cục bộ để báo trước nhiều ngày.", "Too fast and too local for days of warning."))]
    the_gh = "".join(f'<div class="lu-gh lu-gh-{k}"><span class="lu-gh-ic" aria-hidden="true"></span><b>{a}</b><p>{b}</p></div>' for k, a, b in gioi_han)
    rut = [("1", t("Mưa đi trước, lũ theo sau", "Rain first, flood later"), t("Nước mất vài ngày từ thượng nguồn xuống, đó là khoảng để báo trước.", "Water takes days to travel downstream; that gap is the warning time.")),
           ("2", t("Học từ hàng nghìn trạm", "Learned from thousands of gauges"), t("Model học hơn 5.000 trạm đo nên đoán được cả sông chưa có trạm.", "Learning from 5,000+ gauges lets it forecast rivers that have none.")),
           ("3", t("Tin chính thức là tin cuối", "Official alerts come first"), t("Hồ xả, đê vỡ, lũ quét: nghe cơ quan khí tượng thủy văn và chính quyền.", "Dam releases, dike breaks, flash floods: follow the weather agency and local authorities."))]
    the_rut = "".join(f'<div class="lu-rut"><span class="lu-so">{s}</span><b>{a}</b><p>{b}</p></div>' for s, a, b in rut)
    dat_html = "".join(f'<button type="button" class="lu-dat" data-dat="{d["id"]}" role="radio" aria-checked="false"><b>{esc(d["ten"])}</b><small>{esc(d["phu"])}</small></button>' for d in dat)
    main = f"""<main class="lu" id="lu">
<section class="lu-do" aria-labelledby="lu-do-h">
<img src="{p}assets/bit-y-tuong.svg" alt="" width="64" height="64">
<div><h2 id="lu-do-h">{t("Đoán trước đã", "Guess first")}</h2>
<p>{t("Lưu vực 500 km², đất ẩm. Mưa ít nhất bao nhiêu thì nước ở xã Bến Mây vượt báo động 2 (6,0 m)?", "A 500 km² basin, damp soil. How much rain does it take for the river at Ben May village to pass alarm level 2 (6.0 m)?")}</p>
<div class="lu-do-chon" id="lu-do-chon"><button type="button" class="btn btn-nhe" data-mm="60">60 mm</button><button type="button" class="btn btn-nhe" data-mm="100">100 mm</button><button type="button" class="btn btn-nhe" data-mm="150">150 mm</button></div>
<p class="lu-do-ph" id="lu-do-ph" aria-live="polite"></p></div>
</section>
<section class="lu-ban" aria-label="{t("Bảng điều khiển", "Controls")}">
<label class="lu-truot"><span>{nhan["mua"]}: <b id="lu-mm-chu">120 mm</b></span><input type="range" id="lu-mm" min="20" max="250" step="10" value="120"></label>
<div class="lu-dat-ds" id="lu-dat-ds" role="radiogroup" aria-label="{t("Đất trên lưu vực", "Soil in the basin")}">{dat_html}</div>
<label class="lu-cong"><input type="checkbox" id="lu-ho"><span><b>{t("Hồ thượng nguồn xả nước", "Upstream dam releases water")}</b><small>{t("Thứ model không thấy trong dữ liệu", "Something the model can't see in its data")}</small></span></label>
</section>
<section class="lu-tinh" id="lu-tinh" aria-live="polite"></section>
<section class="lu-bo">
<div class="lu-the lu-bieu"><h2>{t("Mực nước 7 ngày tới", "River level, next 7 days")}</h2><svg id="lu-bieu" viewBox="0 0 640 316" role="img" aria-labelledby="lu-kl"></svg>
<p class="lu-kl" id="lu-kl"></p></div>
<div class="lu-the lu-cat"><h2>{t("Xã Bến Mây (hư cấu), cắt ngang thung lũng", "Ben May village (made up), across the valley")}</h2><svg id="lu-cat" viewBox="0 0 640 260" role="img" aria-labelledby="lu-nha"></svg>
<div class="lu-ngay-bo"><label class="lu-ngay"><span id="lu-ngay-chu"></span><input type="range" id="lu-ngay" min="1" max="7" step="1" value="4"></label><button type="button" class="btn btn-nhe" id="lu-chay">▶ {nhan["chay"]}</button></div>
<p class="lu-nha" id="lu-nha"></p></div>
</section>
<p class="lu-ho-chu" id="lu-ho-chu" hidden>{nhan["ho_chu"]}</p>
<section class="lu-cuoi">
<h2 class="ld-ket-h">{t("Ba thứ model khó đoán", "Three things the model struggles with")}</h2>
<div class="lu-gh-ds">{the_gh}</div>
<h2 class="ld-ket-h">{t("Ba điều rút ra", "Three takeaways")}</h2>
<div class="lu-rut-ds">{the_rut}</div>
<div class="lu-thu"><img src="{p}assets/mark-a-ra-the.svg" alt="" width="72" height="68"><p><b>{t("Thử ngay:", "Try it:")}</b> {t("nhờ chatbot cho biết nơi bạn ở thuộc lưu vực sông nào, rồi tìm kênh cảnh báo thiên tai chính thức của tỉnh và bật thông báo.", "ask a chatbot which river basin your home is in, then find your province's official disaster alert channel and turn on notifications.")}</p></div>
<h2 class="ld-ket-h">{t("Xem video của bài này", "Watch the video")}</h2>
<div class="ld-ket-video"><a class="ld-vid" href="{esc(kenh["youtube"])}" target="_blank" rel="noopener" data-so-video="564"><span class="ld-vid-so">#564</span><b>{t("Dự báo lũ sớm bảy ngày", "Flood forecasts a week ahead")}</b><small class="muted">{t("Sắp ra mắt trên kênh", "Coming soon on the channel")}</small></a></div>
{khoi_chia_se(BASE + GOC + "du-bao-lu.html", t("Phòng dự báo lũ: kéo lượng mưa, xem nước dâng tới đâu", "Flood forecast room: drag the rain, watch the river rise"), p)}
</section>
<p class="ld-ghi">{t("Mọi con số là ví dụ, tính theo cách của video (120 mm × 500 km² = 60 triệu m³). Ngưỡng báo động thật mỗi trạm mỗi khác. Xã Bến Mây và các ngôi nhà là hư cấu; mô phỏng chạy ngay trên trình duyệt, không gọi AI thật. Khi có lũ, làm theo tin của cơ quan khí tượng thủy văn và chính quyền địa phương.", "All numbers are examples, worked out the way the video does (120 mm × 500 km² = 60 million m³). Real alarm levels differ at every gauge. Ben May village and its homes are made up; the simulation runs in your browser and calls no real AI. In a real flood, follow the weather agency and local authorities.")}</p>
<noscript><p>{t("Mô phỏng cần JavaScript.", "The simulation needs JavaScript.")}</p></noscript>
<script type="application/json" id="lu-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "du-bao-lu.html", trang("du-bao-lu.html", t(f"Phòng dự báo lũ: mô phỏng AI báo lũ trước 7 ngày | {SITE}", f"Flood forecast room: simulate a 7-day AI flood forecast | {SITE}"),
                                         desc, band, main, p, og_type="website", q="",
                                         cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/du-bao-lu.css?v=dev">\n<script src="{p}du-bao-lu.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

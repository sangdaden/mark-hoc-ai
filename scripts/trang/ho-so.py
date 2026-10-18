# ---------- Hồ sơ học (ho-so.html, en/ho-so.html) ----------
# Gom mọi tiến độ trên máy người học (tien-do.js, lo-trinh.js, kiem-tra) vào một trang: số ngày học tuần này (không dùng chuỗi ngày
# để khỏi "mất chuỗi"), việc tiếp theo, Ôn hôm nay (ôn giãn cách kiểu hộp Leitner: đúng thì lùi hạn 1 → 3 → 7 → 14 → 30 ngày,
# sai thì ôn lại ngày mai), nhắc ôn bằng tệp lịch .ics, mã chuyển tiến độ sang máy khác. ho-so.js lo phần chạy.
#
# Câu ôn: câu hỏi của từng ngày trong Lộ trình 7 ngày + câu "Kiến thức chung" ở kiem-tra có video trùng với video của ngày đó.
# Học xong ngày nào thì câu của ngày đó vào hàng ôn; xong cả 7 ngày thì thêm các câu Kiến thức chung còn lại.


def _hs_cau_hoi():
    L = 1 if LG == "en" else 0
    lt = json.loads((R / "data" / "lo-trinh-7-ngay.json").read_text(encoding="utf-8"))["ngay"]
    kt = json.loads((R / "data" / "bo-kiem-tra.json").read_text(encoding="utf-8"))
    if L:
        lt_en = json.loads((R / "data" / "en" / "lo-trinh-7-ngay.json").read_text(encoding="utf-8"))["ngay"]
        lt = [{**a, **b, "cau_hoi": {**a["cau_hoi"], **b["cau_hoi"]}} for a, b in zip(lt, lt_en)]
        kt_en = json.loads((R / "data" / "en" / "bo-kiem-tra.json").read_text(encoding="utf-8"))["bo"]
        bo = [{**a, "cau_hoi": [{**x, **y} for x, y in zip(a["cau_hoi"], b["cau_hoi"])]} for a, b in zip(kt["bo"], kt_en)]
    else:
        bo = kt["bo"]
    cau, ngay_cua = [], {}
    for i, d in enumerate(lt, 1):
        q = d["cau_hoi"]
        cau.append({"id": f"n{i}", "cau": q["cau"], "lua_chon": q["lua_chon"], "dung": q["dung"], "giai": q["giai_thich"], "ngay": i})
    for b in bo:
        if b.get("nhom") != "co-ban":
            continue
        for k, q in enumerate(b["cau_hoi"]):
            vs = set(q.get("video", []))
            ngay = next((i for i, d in enumerate(lt, 1) if vs & set(d["video"])), 8)  # 8: chỉ vào hàng ôn khi xong cả 7 ngày
            x = {"id": f"{b['id']}-{k}", "cau": q["cau"], "giai": q["giai_thich"], "ngay": ngay}
            if q["loai"] == "dung-sai":
                x["lua_chon"] = [t("Đúng", "True"), t("Sai", "False")]
                x["dung"] = 0 if q["dung"] else 1
            else:
                x["lua_chon"] = q["lua_chon"]
                x["dung"] = q["dap_an"]
            cau.append(x)
    return cau, [d["ten"] for d in lt]


def _hs_nang_luc():
    """Bản đồ năng lực 4 chiều × 3 mức (data/nang-luc.json): tên theo ngôn ngữ đang tạo."""
    d = load("nang-luc")
    L = "en" if LG == "en" else "vi"
    return {"chieu": [{"id": c["id"], "bt": c["bt"], "ten": c["ten"][L]} for c in d["chieu"]], "muc": [m["ten"][L] for m in d["muc"]],
            "ngay": d["ngay"], "tram": d["tram"]}


@trang_rieng("ho-so.html", "0.6")
def tao_ho_so():
    p = t("", "../")
    L = 1 if LG == "en" else 0
    cau, ten_ngay = _hs_cau_hoi()
    tram = {f: [{"id": x[0], "ten": x[1]["en"] if L else x[1]["vi"], "nc": x[3]} for x in _tram_theo_trang(f)] for f, _, _ in _TH_NHOM}
    so_bo = sum(1 for b in json.loads((R / "data" / "bo-kiem-tra.json").read_text(encoding="utf-8"))["bo"])
    du_lieu = json.dumps({"cau": cau, "ten_ngay": ten_ngay, "tram": tram, "nhom": [[f, bt, nhom[L]] for f, bt, nhom in _TH_NHOM],
                          "so_bo": so_bo, "url": BASE + GOC + "ho-so.html", "nang_luc": _hs_nang_luc()}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Hồ sơ học AI của bạn: số ngày học tuần này, việc nên làm tiếp, ôn lại vài câu mỗi ngày và nhắc ôn vào lịch. Không cần tài khoản, mọi thứ lưu trên máy bạn.",
             "Your AI learning profile: days learned this week, what to do next, a few review questions a day and calendar reminders. No account; everything stays on your device.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Không cần tài khoản · lưu trên máy bạn", "No account · saved on your device")}</p>\n'
            f'<h1>{t("Hồ sơ học của bạn", "Your learning profile")}</h1>\n'
            f'<p class="lead">{t("Mỗi ngày vài phút: làm việc tiếp theo, ôn 3–5 câu. Ôn cách quãng giúp nhớ lâu hơn học dồn.", "A few minutes a day: do the next step, review 3–5 questions. Spaced review sticks better than cramming.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-a-ra-the.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="hs" id="hs">
<link rel="stylesheet" href="{p}assets/ho-so.css?v=dev">
<section class="hs-the hs-tuan" aria-labelledby="hs-tuan-h"><h2 id="hs-tuan-h">📅 {t("Tuần này", "This week")}</h2><ol class="hs-ngay" id="hs-ngay"></ol><p class="hs-tuan-chu" id="hs-tuan-chu"></p></section>
<section class="hs-the hs-tiep" aria-labelledby="hs-tiep-h"><h2 id="hs-tiep-h">👉 {t("Việc tiếp theo", "Next step")}</h2><div id="hs-tiep"></div></section>
<section class="hs-the hs-on" id="on" aria-labelledby="hs-on-h"><h2 id="hs-on-h">🔁 {t("Ôn hôm nay", "Today's review")}</h2><div id="hs-on" aria-live="polite"></div></section>
<section class="hs-the hs-nl" aria-labelledby="hs-nl-h"><h2 id="hs-nl-h">🧭 {t("Bản đồ năng lực", "Skills map")}</h2>
<p class="hs-nhe">{t("4 chiều × 3 mức, dựa trên khung năng lực AI cho học sinh của UNESCO (2024). Ô càng đậm, bạn làm càng nhiều ở đó.", "4 areas × 3 levels, based on UNESCO's AI competency framework for students (2024). The darker the cell, the more you have done there.")}</p>
<div class="hs-nl-luoi" id="hs-nl" role="table" aria-label="{t("Bản đồ năng lực", "Skills map")}"></div></section>
<section class="hs-the hs-tien" aria-labelledby="hs-tien-h"><h2 id="hs-tien-h">📈 {t("Tiến độ", "Progress")}</h2><ul class="hs-thanh-ds" id="hs-tien"></ul></section>
<section class="hs-the hs-nhac" aria-labelledby="hs-nhac-h"><h2 id="hs-nhac-h">⏰ {t("Nhắc tôi ôn", "Remind me")}</h2>
<p>{t("Chọn giờ bạn thường rảnh. Bấm nút để thêm 3 lời nhắc (sau 1, 3 và 7 ngày) vào lịch điện thoại. Không cần email.", "Pick a time you are usually free. Add 3 reminders (in 1, 3 and 7 days) to your phone calendar. No email needed.")}</p>
<div class="hs-hang"><label for="hs-gio">{t("Tôi sẽ ôn lúc", "I will review at")}</label><input type="time" id="hs-gio" value="20:00"><button type="button" class="btn btn-yt" id="hs-ics">📆 {t("Thêm vào lịch", "Add to calendar")}</button></div></section>
<section class="hs-the hs-ma" aria-labelledby="hs-ma-h"><h2 id="hs-ma-h">📲 {t("Chuyển sang máy khác", "Move to another device")}</h2>
<p>{t("Chép mã rồi dán vào trang này trên máy kia. Mã chứa tiến độ học, không chứa gì khác.", "Copy the code and paste it on this page on the other device. It holds your progress and nothing else.")}</p>
<div class="hs-hang"><button type="button" class="btn" id="hs-chep">📋 {t("Chép mã tiến độ", "Copy progress code")}</button><span class="hs-bao" id="hs-bao" role="status"></span></div>
<details class="hs-nhap"><summary>{t("Dán mã từ máy khác", "Paste a code from another device")}</summary>
<textarea id="hs-ma-o" rows="3" spellcheck="false" aria-label="{t("Mã tiến độ", "Progress code")}"></textarea>
<button type="button" class="btn btn-yt" id="hs-nhap">{t("Nhập tiến độ", "Import progress")}</button></details>
<p class="hs-nhe"><button type="button" class="btn" data-xoa-du-lieu>🗑️ {t("Xóa dữ liệu học trên máy này", "Delete learning data on this device")}</button> <span class="td-xoa-bao" role="status"></span> <a href="quyen-rieng-tu.html">{t("Web lưu gì?", "What is stored?")}</a></p></section>
<noscript><p>{t("Trang cần JavaScript.", "This page needs JavaScript.")}</p></noscript>
<script type="application/json" id="hs-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "ho-so.html", trang("ho-so.html", t(f"Hồ sơ học AI của bạn | {SITE}", f"Your AI learning profile | {SITE}"), desc, band, main, p,
                                     og_type="website", q="", cuoi=f'<script src="{p}ho-so.js?v=dev" defer></script>\n')

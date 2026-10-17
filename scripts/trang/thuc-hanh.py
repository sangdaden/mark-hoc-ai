# ---------- Trang thực hành theo đối tượng: mỗi file data/thuc-hanh/<trang>.json thành <trang>.html và en/<trang>.html ----------
# Cùng khung phòng thí nghiệm (cột trạm .bn-ngan, trạm .bn-tram, lời Bit, popup Cách chơi ở data/huong-dan/<trang>.json).
# Mỗi trạm có "loai" là một trong chín kiểu của thuc-hanh.js (phan-loai, bo-phieu, ghep, chat, tim-loi, sua-loi, chon-ban,
# giong, ke-hoach) và dữ liệu riêng của kiểu đó. Chữ viết dạng {"vi": ..., "en": ...} ở bất cứ đâu, hàm ngu() chọn đúng ngôn ngữ.
# Thêm trang cho đối tượng mới = thêm một file JSON (và file popup), không sửa code.


def _th_ngu(x, L):
    if isinstance(x, dict):
        if set(x) <= {"vi", "en"} and "vi" in x:
            return x.get(L, x["vi"])
        return {k: _th_ngu(v, L) for k, v in x.items()}
    if isinstance(x, list):
        return [_th_ngu(v, L) for v in x]
    return x


def _th_tao(ten_file):
    def tao():
        p = t("", "../")
        L = "en" if LG == "en" else "vi"
        D = _th_ngu(json.loads((R / "data" / "thuc-hanh" / ten_file).read_text(encoding="utf-8")), L)
        trang_ten = D["trang"]
        tram = D["tram"]
        ngan = (f'<nav class="bn-ngan" aria-label="{t("Các trạm", "Stations")}"><p class="bn-cau">{esc(D["bn_cau"])}</p><ol>'
                + "".join(f'<li><button type="button" class="bn-nut" data-tram="{x["id"]}" aria-controls="tram-{x["id"]}"><span class="bn-so">{k + 1}</span>'
                          f'<span class="bn-ten">{esc(x["ten"])}<small>{esc(x["nho"])}</small></span></button></li>' for k, x in enumerate(tram))
                + '</ol></nav>')
        tram_html = "".join(
            f'<section class="bn-tram th-tram" id="tram-{x["id"]}" hidden aria-labelledby="h-{x["id"]}" data-loai="{x["loai"]}">\n'
            f'<p class="bn-nhan">{t("Trạm", "Station")} {k + 1} · {esc(x["nho"])}</p>\n<h2 id="h-{x["id"]}">{esc(x["h2"])}</h2>\n'
            + (f'<p class="bn-mo">{esc(x["mo"])}</p>\n' if x.get("mo") else "")
            + f'<div class="th-o" id="th-o-{x["id"]}"></div>\n</section>\n' for k, x in enumerate(tram))
        nhan = {
            "da_chep": t("Đã chép ✓", "Copied ✓"), "khong_chep": t("Không chép được", "Couldn't copy"),
            "lam_lai": t("Làm lại", "Start over"), "tiep": t("Câu tiếp", "Next"), "the": t("Các thẻ", "Cards"),
            "dung_la": t("Đúng là:", "Answer:"), "chon_ro": t("Giờ chạm vào rổ bạn chọn.", "Now tap the basket you pick."), "chon_the": t("Chạm vào một thẻ trước nhé.", "Tap a card first."),
            "phan_dem": t("Đã xếp {n}/{tong} · đúng {d}", "Sorted {n}/{tong} · {d} right"), "phan_xong": t("Xong! Bạn xếp đúng {n}/{tong}.", "Done! You got {n}/{tong} right."),
            "ai_noi": t("AI nói:", "The AI says:"), "phieu_dem": t("Câu {n}/{tong} · đúng {d}", "Question {n}/{tong} · {d} right"),
            "phieu_xong": t("Bạn đúng {d}/{tong} câu.", "You got {d}/{tong}."), "dung_roi": t("Đúng rồi!", "Right!"), "chua_dung": t("Chưa đúng.", "Not quite."),
            "chon_viec": t("Chọn việc", "Choose a task"), "cau_lenh": t("Câu lệnh của bạn", "Your prompt"), "manh": t("Mảnh để ghép", "Pieces"),
            "gui": t("Gửi cho AI", "Send to AI"), "chep_lenh": t("Chép câu lệnh", "Copy prompt"), "ghep_lai": t("Ghép lại", "Start over"),
            "cau_goc": t("Câu gốc", "Starting line"), "lenh_trong": t("Chưa có mảnh nào. Câu gốc quá mơ hồ, AI sẽ đoán bừa.", "No pieces yet. The starting line is too vague; the AI will guess."),
            "lenh_bat_dau": t("Câu gốc chỉ có một dòng mơ hồ. Chạm vào mảnh bên dưới để ghép thêm.", "The starting line is one vague sentence. Tap the pieces below to add to it."),
            "lenh_dem": t("Đã ghép {n}/5 mảnh cần.", "{n} of 5 needed pieces added."),
            "lenh_du": t("Đủ 5 mảnh! Bấm Gửi cho AI xem câu trả lời đổi ra sao.", "All 5 pieces! Press Send to AI to see the difference."),
            "lenh_khoa": t("Còn mảnh bẫy trong câu lệnh. Bỏ ra rồi mới chép được nhé.", "There's a trap piece in the prompt. Remove it before copying."),
            "ai_tra_loi": t("AI trả lời (viết sẵn để minh họa)", "AI answer (pre-written example)"), "muc": {"tho": t("Thô", "Weak"), "kha": t("Khá", "OK"), "tot": t("Tốt", "Good")},
            "gui_tho": t("Câu lệnh mơ hồ nên AI trả lời chung chung, đọc xong không dùng được gì.", "A vague prompt gets a generic answer you can't use."),
            "gui_kha": t("Khá hơn rồi. Thêm đủ 5 mảnh để AI trả lời đúng định dạng và không vượt quá việc của nó.", "Better. Add all 5 pieces so the AI uses the right format and stays in its lane."),
            "gui_tot": t("Đủ 5 mảnh nên câu trả lời gọn và đúng việc. Chép câu lệnh về dùng nhé!", "With all 5 pieces the answer is tight and on-task. Copy the prompt and use it!"),
            "ten_ai": "AI", "ten_ban": t("Bạn", "You"),
            "tim_dem": t("Tìm được {n}/{tong}.", "Found {n} of {tong}."), "tim_het": t("Bạn tìm đủ {tong} chỗ!", "You found all {tong}!"),
            "cau_on": t("Câu này ổn.", "This one is fine."), "hien_dap_an": t("Hiện đáp án", "Show answers"),
            "sua_hoi": t("Câu này sai. Sửa thành câu nào?", "This sentence is wrong. Fix it with:"), "sua_sai": t("Chưa đúng, thử lựa chọn khác.", "Not that one, try another."),
            "van_goc": t("Văn bản gốc", "Original"), "chon_ban_hoi": t("Bản tóm tắt nào trung thực nhất?", "Which summary is most faithful?"),
            "ban_nhap": t("Bản nháp", "Draft"), "chon_giong": t("Chọn giọng văn", "Choose a tone"), "ai_viet_lai": t("AI viết lại (viết sẵn để minh họa)", "AI rewrite (pre-written example)"),
            "chep_ban": t("Chép bản này", "Copy this version"),
            "kh_tuan": t("Còn bao nhiêu tuần tới kỳ thi:", "Weeks until the exam:"), "kh_gio": t("Mỗi ngày học được (giờ):", "Hours of study a day:"),
            "kh_mon": t("Môn cần ôn", "Subjects"), "kh_tuan_ngan": t("Tuần", "Week"),
            "kh_hoc": t("học lại kiến thức", "relearn"), "kh_luyen": t("luyện đề", "practice papers"), "kh_thi_thu": t("thi thử, xem lỗi sai", "mock exam, review mistakes"),
            "kh_on_tuan": t("ôn cả tuần, nghỉ sớm", "weekly review, rest early"), "kh_nghi_truoc": t("nghỉ ngơi trước thi", "rest before the exam"),
            "kh_on_lai": t("tự kiểm tra 15 phút bài cũ", "15-min self-quiz on old topics"),
            "kh_chua_mon": t("Chọn ít nhất một môn nhé.", "Pick at least one subject."),
            "kh_bit": t("Kế hoạch {w} tuần cho {n} môn, khoảng {g} giờ học. Mỗi môn quay lại nhiều lần thay vì học dồn: nhớ lâu hơn hẳn.", "A {w}-week plan for {n} subjects, about {g} study hours. Each subject comes back again and again instead of cramming: you remember far longer."),
            "kh_lenh_h": t("Câu lệnh nhờ AI chỉnh kế hoạch", "Prompt to have AI adjust the plan"),
            "kh_lenh": t("Mình là học sinh lớp 12, còn {w} tuần tới kỳ thi, mỗi ngày học được {g} giờ. Các môn cần ôn: {mon}.\nHãy chỉnh kế hoạch ôn tập theo tuần cho mình: xen kẽ các môn, mỗi môn quay lại ít nhất hai lần một tuần, có buổi tự kiểm tra ngắn và một ngày nghỉ.\nĐừng làm bài hộ mình. Nếu mình hỏi bài, hãy gợi ý từng bước để mình tự giải.",
                        "I'm a final-year high school student with {w} weeks until my exams and {g} hours a day to study. Subjects: {mon}.\nAdjust my weekly revision plan: mix subjects, bring each one back at least twice a week, add short self-quizzes and one rest day.\nDon't do my work for me. If I ask about a problem, give step-by-step hints so I can solve it myself."),
        }
        du_lieu = json.dumps({"nhan": nhan, "lg": L, "p": p, "trang": trang_ten, "tram": tram}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
        band = (f'<div class="head-row"><div>\n<p class="eyebrow">{esc(D["eyebrow"])}</p>\n<h1>{esc(D["h1"])}</h1>\n<p class="lead">{esc(D["lead"])}</p>\n'
                f'</div><img class="head-art" src="{p}assets/{D.get("hinh", "bit-giai-thich.svg")}" alt="" width="180" height="170"></div>')
        main = (f'<main class="bn th" id="th">\n<link rel="stylesheet" href="{p}assets/thuc-hanh.css?v=dev">\n'
                f'{ngan}\n<div class="bn-ban">\n{tram_html}<p class="th-ghi">{esc(D["ghi"])}</p>\n'
                f'{khoi_chia_se(BASE + GOC + trang_ten + ".html", D["tieu"], p)}\n</div>\n'
                f'<noscript><p>{t("Trang cần JavaScript.", "This page needs JavaScript.")}</p></noscript>\n'
                f'<script type="application/json" id="th-du-lieu">{du_lieu}</script>\n</main>')
        return GOC + trang_ten + ".html", trang(trang_ten + ".html", f'{D["tieu"]} | {SITE}', D["desc"], band, main, p, og_type="website", q="",
                                                cuoi=f'<script src="{p}thuc-hanh.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')
    return tao


for _f in sorted((R / "data" / "thuc-hanh").glob("*.json")):
    trang_rieng(_f.stem + ".html", "0.7")(_th_tao(_f.name))

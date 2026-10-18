# ---------- Trang thực hành theo đối tượng: mỗi file data/thuc-hanh/<trang>.json thành <trang>.html và en/<trang>.html ----------
# Cùng khung phòng thí nghiệm (cột trạm .bn-ngan, trạm .bn-tram, lời Bit, popup Cách chơi ở data/huong-dan/<trang>.json).
# Mỗi trạm có "loai" là một trong các kiểu của thuc-hanh.js (phan-loai, bo-phieu, ghep, chat, tim-loi, sua-loi, chon-ban,
# giong, ke-hoach; tầng Nâng cao thêm xep-buoc, cham-tieu-chi, vi-du, bayes) và dữ liệu riêng của kiểu đó.
# Trạm có "cap": "nang-cao" nằm trong nhóm 🚀 Nâng cao ở cột trạm. Chữ viết dạng {"vi": ..., "en": ...} ở bất cứ đâu, hàm ngu() chọn đúng ngôn ngữ.
# Thêm trang cho đối tượng mới = thêm một file JSON (và file popup), không sửa code.

# Hình xem trước trong thẻ "Chơi thử" ở bài video liên quan (data/tro-choi/ai-hoc-sinh.json, ai-van-phong.json)
HINH_CHOI["th-hoc-sinh"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;align-content:center;gap:8px">'
    f'<span style="justify-self:center;padding:7px 12px;border-radius:12px;background:var(--panel);border:2px dashed var(--edge);font:600 13px/1.3 var(--f-body)">📸 {t("Chụp đề, chép lời giải", "Snap the quiz, copy answers")}</span>'
    '<span style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:min(100%,320px);justify-self:center;font:700 12px/1.2 var(--f-body);text-align:center">'
    f'<span style="padding:8px 4px;border-radius:12px;border:2px solid #10B981;background:color-mix(in srgb,#10B981 14%,var(--panel))">📚 {t("Học cùng AI", "Learn with AI")}</span>'
    f'<span style="padding:8px 4px;border-radius:12px;border:2px solid #DC2626;background:color-mix(in srgb,#DC2626 12%,var(--panel))">🚫 {t("Làm hộ", "AI does it")}</span></span></span>')
HINH_CHOI["th-van-phong"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;place-items:center"><span style="display:grid;gap:5px;width:min(100%,300px);padding:10px 14px;border-radius:8px;background:#fff;color:#111;border:1px solid #CBD5E1;box-shadow:0 6px 16px rgb(15 23 42 / .12)">'
    + "".join(f'<span style="display:flex;justify-content:space-between;gap:10px;padding-bottom:4px;border-bottom:1px dotted #CBD5E1;font:500 12px/1.4 var(--f-body)">'
              f'<span style="color:#64748B">{n}</span><b style="padding:1px 6px;border-radius:5px;background:#0F172A;color:#fff;font:700 11px/1.3 var(--f-mono)">🔒 {v}</b></span>'
              for n, v in [(t("Họ tên", "Name"), t("[HỌ TÊN]", "[NAME]")), (t("Số CCCD", "ID no."), t("[SỐ CCCD]", "[ID NO.]")), (t("Địa chỉ", "Address"), t("[ĐỊA CHỈ]", "[ADDRESS]"))])
    + '</span></span>')


def _th_ngu(x, L):
    if isinstance(x, dict):
        if set(x) <= {"vi", "en"} and "vi" in x:
            return x.get(L, x["vi"])
        return {k: _th_ngu(v, L) for k, v in x.items()}
    if isinstance(x, list):
        return [_th_ngu(v, L) for v in x]
    return x


def _th_nhan():
    """Nhãn chữ của thuc-hanh.js. Dùng chung cho trang thực hành và tầng Nâng cao của ai-y-te.html."""
    return {
        "da_chep": t("Đã chép ✓", "Copied ✓"), "khong_chep": t("Không chép được", "Couldn't copy"),
        "lam_lai": t("Làm lại", "Start over"), "tiep": t("Câu tiếp", "Next"), "the": t("Các thẻ", "Cards"),
        "dung_la": t("Đúng là", "Should be"), "chon_the": t("Chạm vào một thẻ trước nhé.", "Tap a card first."),
        "phan_dem": t("Đã xếp {n}/{tong}, đúng {d}", "Sorted {n}/{tong}, {d} right"), "diem": t("⭐ {d}/{tong}", "⭐ {d}/{tong}"),
        "ai_noi": t("AI nói:", "The AI says:"), "chac": t("💯 Chắc chắn", "💯 Totally sure"), "phieu_dem": t("Câu {n}/{tong}, đúng {d}", "Question {n}/{tong}, {d} right"),
        "dung_roi": t("Đúng rồi!", "Right!"), "chua_dung": t("Chưa đúng.", "Not quite."),
        "chon_viec": t("Chọn việc", "Choose a task"), "cau_lenh": t("Câu lệnh của bạn", "Your prompt"), "manh": t("Mảnh để ghép", "Pieces"),
        "gui": t("Gửi cho AI", "Send to AI"), "chep_lenh": t("Chép câu lệnh", "Copy prompt"), "ghep_lai": t("Ghép lại", "Start over"),
        "cau_goc": t("Câu gốc", "Starting line"), "lenh_trong": t("Chưa có mảnh nào. AI sẽ đoán bừa.", "No pieces yet. The AI will guess."),
        "lenh_bat_dau": t("Chạm mảnh bên dưới để ghép 👇", "Tap the pieces below to build 👇"),
        "lenh_dem": t("Đã ghép {n}/5 mảnh.", "{n}/5 pieces added."),
        "lenh_du": t("Đủ 5 mảnh! Bấm Gửi cho AI 🚀", "All 5 pieces! Press Send to AI 🚀"),
        "lenh_khoa": t("Còn mảnh bẫy 🪤 Bỏ ra mới chép được.", "There's a trap piece 🪤 Remove it to copy."),
        "ai_tra_loi": t("AI trả lời (mẫu)", "AI answer (sample)"), "muc": {"tho": t("Thô", "Weak"), "kha": t("Khá", "OK"), "tot": t("Tốt", "Good")},
        "gui_tho": t("Câu lệnh mơ hồ, AI trả lời chung chung.", "Vague prompt, generic answer."),
        "gui_kha": t("Khá hơn! Đủ 5 mảnh sẽ còn tốt hơn.", "Better! All 5 pieces makes it great."),
        "gui_tot": t("Gọn và đúng việc. Chép về dùng nhé!", "Tight and on-task. Copy it and use it!"),
        "ten_ai": "AI", "ten_ban": t("Bạn", "You"),
        "tim_dem": t("Tìm được {n}/{tong}", "Found {n}/{tong}"), "cau_on": t("Chỗ này ổn 👍", "This part is fine 👍"), "da_che": t("🔒 Đã che", "🔒 Hidden"),
        "hien_dap_an": t("Hiện đáp án", "Show answers"),
        "sua_hoi": t("Sửa thành:", "Fix it to:"), "sua_sai": t("Chưa đúng, thử cái khác.", "Not that one, try another."),
        "van_goc": t("Văn bản gốc", "Original"), "xem_goc": t("📄 Xem văn bản gốc", "📄 Read the original"), "chon_ban_hoi": t("Bản nào trung thực nhất?", "Which is most faithful?"),
        "ban_nhap": t("Bản nháp", "Draft"), "chon_giong": t("Chọn giọng văn", "Choose a tone"), "ai_viet_lai": t("AI viết lại (mẫu)", "AI rewrite (sample)"),
        "chep_ban": t("Chép bản này", "Copy this version"),
        "kh_tuan": t("⏳ Số tuần tới kỳ thi:", "⏳ Weeks to the exam:"), "kh_gio": t("⏰ Giờ học mỗi ngày:", "⏰ Study hours a day:"),
        "kh_mon": t("Môn cần ôn", "Subjects"),
        "kh_hoc": t("Học lại", "Relearn"), "kh_luyen": t("Luyện đề", "Practice papers"), "kh_thi_thu": t("Thi thử", "Mock exam"),
        "kh_on_tuan": t("Ôn cả tuần", "Weekly review"), "kh_nghi_truoc": t("Nghỉ trước thi", "Rest before exam"),
        "kh_on_lai": t("Tự kiểm tra 15 phút", "15-min self-quiz"),
        "kh_chua_mon": t("Chọn ít nhất một môn nhé.", "Pick at least one subject."),
        "kh_bit": t("{w} tuần · {n} môn · khoảng {g} giờ. Mỗi môn quay lại nhiều lần: nhớ lâu hơn học dồn.", "{w} weeks · {n} subjects · about {g} hours. Each subject keeps coming back: you remember longer than cramming."),
        "kh_lenh_h": t("Câu lệnh nhờ AI chỉnh kế hoạch", "Prompt to have AI adjust the plan"),
        "kh_lenh": t("Mình là học sinh lớp 12, còn {w} tuần tới kỳ thi, mỗi ngày học được {g} giờ. Các môn cần ôn: {mon}.\nHãy chỉnh kế hoạch ôn tập theo tuần cho mình: xen kẽ các môn, mỗi môn quay lại ít nhất hai lần một tuần, có buổi tự kiểm tra ngắn và một ngày nghỉ.\nĐừng làm bài hộ mình. Nếu mình hỏi bài, hãy gợi ý từng bước để mình tự giải.",
                    "I'm a final-year high school student with {w} weeks until my exams and {g} hours a day to study. Subjects: {mon}.\nAdjust my weekly revision plan: mix subjects, bring each one back at least twice a week, add short self-quizzes and one rest day.\nDon't do my work for me. If I ask about a problem, give step-by-step hints so I can solve it myself."),
        "xb_kho": t("Các bước (chạm để xếp vào ô trống)", "Steps (tap to place them)"), "xb_trong": t("chạm một thẻ bên dưới", "tap a card below"),
        "xb_kiem": t("Kiểm tra", "Check"), "xb_con": t("Còn {n} ô trống.", "{n} slots left."), "xb_du": t("Đủ ô rồi. Bấm Kiểm tra nhé.", "All slots filled. Press Check."),
        "xb_day": t("Ô đã đầy. Chạm một thẻ đã xếp để lấy ra.", "All slots are full. Tap a placed card to take it out."),
        "xb_dem": t("Đúng chỗ {d}/{tong} bước.", "{d}/{tong} steps in the right place."), "xb_thu_lai": t("Đổi chỗ vài thẻ rồi kiểm tra lại.", "Swap a few cards and check again."),
        "xb_dung": t("Chuẩn! Mỗi bước là một câu lệnh riêng, làm xong bước này mới sang bước sau.", "Spot on! Each step is its own prompt; finish one before the next."),
        "xb_chuoi": t("Chuỗi câu lệnh", "Prompt chain"), "chep_chuoi": t("Chép cả chuỗi", "Copy the chain"),
        "ct_tieu_chi": t("Tiêu chí", "Criteria"), "ct_cham": t("Chấm", "Mark it"), "ct_huong_dan": t("Bảng chấm: chạm ô để đổi ? → ✓ đạt → ✗ chưa đạt", "Score sheet: tap a cell to cycle ? → ✓ meets → ✗ doesn't"),
        "ct_con": t("Còn {n} ô chưa chấm.", "{n} cells left to mark."), "ct_du": t("Chấm đủ rồi. Bấm Chấm để so đáp án.", "All marked. Press Mark it to compare."),
        "ct_khop": t("Bạn chấm khớp {d}/{tong} ô.", "You matched {d}/{tong} cells."), "ct_thang": t("Bản đạt nhiều tiêu chí nhất: {ten} ({d}/{tong}).", "Best draft: {ten} ({d}/{tong})."),
        "vd_mau": t("Ví dụ mẫu: chọn {n}", "Examples: pick {n}"), "vd_nhan": t("Ví dụ {n}:", "Example {n}:"), "vd_trong": t("chọn một ví dụ bên dưới", "pick an example below"),
        "vd_bat_dau": t("Chọn ví dụ mẫu để AI bắt chước 👇", "Pick examples for the AI to copy 👇"),
        "vd_du": t("Đủ {n} ví dụ rồi. Bỏ một cái ra để đổi.", "That's {n} already. Remove one to swap."),
        "vd_khong": t("Không có ví dụ, AI tự đoán kiểu trình bày, mỗi lần ra một kiểu.", "No examples: the AI guesses the format, and it changes every time."),
        "vd_sai": t("AI bắt chước luôn cả lỗi trong ví dụ:", "The AI copied the example's flaw too:"),
        "vd_them": t("Tốt! Thêm một ví dụ nữa thì AI càng chắc kiểu.", "Good! One more example makes the pattern stick."),
        "vd_tot": t("Ví dụ chuẩn, AI làm đúng kiểu. Chép câu lệnh về dùng nhé!", "Clean examples, consistent output. Copy the prompt!"),
        "by_ty_le": t("Tỷ lệ mắc trong nhóm:", "Prevalence:"), "by_nhay": t("Độ nhạy:", "Sensitivity:"), "by_dac": t("Độ đặc hiệu:", "Specificity:"),
        "by_tp": t("bệnh thật, AI báo đúng", "ill, flagged"), "by_fp": t("không bệnh, AI báo nhầm", "healthy, wrongly flagged"),
        "by_fn": t("bệnh nhưng AI bỏ sót", "ill but missed"), "by_tn": t("không bệnh, AI báo âm", "healthy, cleared"),
        "by_ppv": t("trong {d} người AI báo dương tính là bệnh thật ({tp} người).", "of the {d} people the AI flags are truly ill ({tp} people)."),
        "dau_thap_phan": t(",", "."),
    }


def _th_nc(x):
    return x.get("cap") == "nang-cao"


def _th_nut(k, x, ds, them=""):
    """Một nút trong cột trạm. Trạm đầu tiên của tầng Nâng cao có thêm dòng tiêu đề nhóm phía trên."""
    nhom = (f'<li class="bn-nhom"><span>🚀 {t("Nâng cao", "Advanced")}</span></li>'
            if _th_nc(x) and (k == 0 or not _th_nc(ds[k - 1])) else "")
    return (nhom + f'<li><button type="button" class="bn-nut{" bn-nut-nc" if _th_nc(x) else ""}" data-tram="{x["id"]}" aria-controls="tram-{x["id"]}">'
            f'<span class="bn-so">{k + 1}</span><span class="bn-ten">{esc(x["ten"])}<small>{esc(x["nho"])}</small></span></button></li>')


def _th_tram(k, x, lop="th-tram"):
    """Khung một trạm; nội dung do thuc-hanh.js dựng vào .th-o."""
    nc = f'🚀 {t("Nâng cao", "Advanced")} · ' if _th_nc(x) else ""
    return (f'<section class="bn-tram {lop}" id="tram-{x["id"]}" hidden aria-labelledby="h-{x["id"]}" data-loai="{x["loai"]}">\n'
            f'<p class="bn-nhan">{t("Trạm", "Station")} {k + 1} · {nc}{esc(x["nho"])}</p>\n<h2 id="h-{x["id"]}">{esc(x["h2"])}</h2>\n'
            + (f'<p class="bn-mo">{esc(x["mo"])}</p>\n' if x.get("mo") else "")
            + f'<div class="th-o" id="th-o-{x["id"]}"></div>\n</section>\n')


def _th_tao(ten_file):
    def tao():
        p = t("", "../")
        L = "en" if LG == "en" else "vi"
        D = _th_ngu(json.loads((R / "data" / "thuc-hanh" / ten_file).read_text(encoding="utf-8")), L)
        trang_ten = D["trang"]
        tram = D["tram"]
        ngan = (f'<nav class="bn-ngan" aria-label="{t("Các trạm", "Stations")}"><p class="bn-cau">{esc(D["bn_cau"])}</p><ol>'
                + "".join(_th_nut(k, x, tram) for k, x in enumerate(tram)) + '</ol></nav>')
        tram_html = "".join(_th_tram(k, x) for k, x in enumerate(tram))
        nhan = _th_nhan()
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

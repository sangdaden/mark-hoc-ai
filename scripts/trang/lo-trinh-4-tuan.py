# ---------- Lộ trình 4 tuần (lo-trinh-4-tuan.html, en/) ----------
# Nối mọi thứ thành một đường đi: Tuần 1 = Lộ trình 7 ngày; Tuần 2 = 7 trạm cơ bản ở trang thực hành của nghề bạn chọn;
# Tuần 3 = trạm Nâng cao + Lộ trình theo nghề; Tuần 4 = ôn trộn (Hồ sơ học), 4 bộ Kiến thức chung, chứng nhận.
# Đầu trang có bài xếp trình độ 5 câu (lấy từ câu ôn của ho-so.py) để gợi ý bắt đầu từ tuần nào; kết quả lưu ở mhai-xep.
# Không khóa tuần nào (Sang 18/10/2026: chỉ gợi ý thứ tự, không khóa cứng). lo-trinh-4-tuan.js tính tiến độ từ tien-do.js.

_L4_XEP = ["n1", "hieu-lam-1", "prompt-1", "an-toan-0", "cong-viec-0"]


@trang_rieng("lo-trinh-4-tuan.html", "0.8")
def tao_lo_trinh_4_tuan():
    p = t("", "../")
    L = 1 if LG == "en" else 0
    cau, _ = _hs_cau_hoi()
    xep = [next(q for q in cau if q["id"] == i) for i in _L4_XEP]
    nghe = [[f, bt, nhom[L], [x[0] for x in _tram_theo_trang(f) if not x[3]], [x[0] for x in _tram_theo_trang(f) if x[3]]] for f, bt, nhom in _TH_NHOM]
    co_ban = [b["id"] for b in json.loads((R / "data" / "bo-kiem-tra.json").read_text(encoding="utf-8"))["bo"] if b.get("nhom") == "co-ban"]
    du_lieu = json.dumps({"xep": xep, "nghe": nghe, "co_ban": co_ban}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    def tuan(n, bt, ten, mo, noi_dung):
        return (f'<li class="l4-tuan" id="tuan-{n}" data-tuan="{n}"><div class="l4-dau"><span class="l4-so">{t("Tuần", "Week")}<b>{n}</b></span>'
                f'<div><h2>{bt} {ten}</h2><p>{mo}</p></div><span class="l4-trang" hidden>✓ {t("Xong", "Done")}</span></div>'
                f'<div class="l4-than">{noi_dung}<div class="l4-thanh" aria-hidden="true"><i></i></div><p class="l4-dem"></p></div></li>')

    nut = lambda href, chu, cls="btn": f'<a class="{cls}" href="{href}">{chu}</a>'
    chon_nghe = "".join(f'<button type="button" class="l4-nghe" data-trang="{f}" aria-pressed="false"><span aria-hidden="true">{bt}</span>{esc(ten)}</button>'
                        for f, bt, ten, _, _ in nghe)
    ds = [
        tuan(1, "🧭", t("Nền tảng", "Foundations"), t("Lộ trình 7 ngày: mỗi ngày 3 video, 1 việc, 1 câu hỏi và ô Thử ngay.", "The 7-day path: 3 videos, 1 task, 1 question and a Try-it box each day."),
             nut("lo-trinh-7-ngay.html", t("Mở Lộ trình 7 ngày ›", "Open the 7-day path ›"), "btn btn-yt")),
        tuan(2, "🛠️", t("Dùng AI cho nghề của bạn", "AI for your job"), t("Chọn nghề, làm 7 trạm cơ bản. Mỗi trạm 3–5 phút.", "Pick your job and do the 7 core stations, 3–5 minutes each."),
             f'<div class="l4-nghe-ds" role="group" aria-label="{t("Chọn nghề", "Pick your job")}">{chon_nghe}</div>' + nut("thuc-hanh.html", t("Mở trang thực hành ›", "Open the practice page ›"), "btn btn-yt l4-mo-nghe")),
        tuan(3, "🚀", t("Đưa vào việc thật", "Real work"), t("4 trạm Nâng cao của nghề bạn và Lộ trình theo nghề để xem tiếp video.", "The 4 advanced stations for your job, plus the job path for more videos."),
             nut("thuc-hanh.html", t("Mở trạm Nâng cao ›", "Open advanced stations ›"), "btn btn-yt l4-mo-nc") + nut("lo-trinh-nganh.html", t("Lộ trình theo nghề ›", "Path for your job ›"))),
        tuan(4, "🏅", t("Ôn trộn và chứng nhận", "Mixed review and certificate"), t("Ôn hôm nay vài lần trong tuần, làm 4 bộ Kiến thức chung (đạt 80%), rồi nhận chứng nhận.", "Do Today's review a few times, pass the 4 core quizzes (80%), then get your certificate."),
             nut("ho-so.html#on", t("Ôn hôm nay ›", "Today's review ›"), "btn btn-yt") + nut("kiem-tra.html", t("Bài kiểm tra ›", "Quizzes ›")) + nut("chung-nhan.html", t("Chứng nhận ›", "Certificates ›"))),
    ]
    desc = t("Lộ trình 4 tuần học AI miễn phí: tuần 1 nền tảng, tuần 2 thực hành theo nghề, tuần 3 nâng cao, tuần 4 ôn trộn và nhận chứng nhận. Có bài xếp trình độ 5 câu.",
             "A free 4-week AI path: week 1 foundations, week 2 practice for your job, week 3 advanced, week 4 mixed review and a certificate. Starts with a 5-question placement check.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("4 tuần · mỗi ngày 10–15 phút · không khóa tuần nào", "4 weeks · 10–15 minutes a day · nothing locked")}</p>\n'
            f'<h1>{t("Lộ trình 4 tuần", "The 4-week path")}</h1>\n'
            f'<p class="lead">{t("Học, thử tay, rồi ôn lại cách quãng. Chưa biết bắt đầu từ đâu thì làm 5 câu dưới đây.", "Learn, try it, then review spaced out. Not sure where to start? Answer the 5 questions below.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-chao.svg" alt="" width="180" height="170"></div>')
    main = (f'<main class="l4" id="l4">\n<link rel="stylesheet" href="{p}assets/lo-trinh-4-tuan.css?v=dev">\n'
            f'<section class="l4-xep" id="xep" aria-labelledby="l4-xep-h"><h2 id="l4-xep-h">🎯 {t("Bắt đầu từ tuần nào?", "Which week should you start?")}</h2>'
            f'<p class="l4-nhe">{t("5 câu, chừng 1 phút. Không tính điểm, chỉ để gợi ý.", "5 questions, about a minute. No score, just a suggestion.")}</p><div id="l4-xep" aria-live="polite"></div></section>\n'
            f'<ol class="l4-ds">{"".join(ds)}</ol>\n'
            f'<p class="l4-nhe">{t("Tiến độ lấy từ máy bạn (Lộ trình 7 ngày, trạm thực hành, kiểm tra, Hồ sơ học). Không gửi đi đâu.", "Progress comes from your device (7-day path, stations, quizzes, profile). Nothing is sent anywhere.")}</p>\n'
            f'<noscript><p>{t("Bật JavaScript để thấy tiến độ.", "Turn on JavaScript to see your progress.")}</p></noscript>\n'
            f'<script type="application/json" id="l4-du-lieu">{du_lieu}</script>\n</main>')
    jsonld = [{"@context": "https://schema.org", "@type": "Course", "name": t("Lộ trình 4 tuần học AI", "The 4-week AI path"), "url": BASE + GOC + "lo-trinh-4-tuan.html",
               "inLanguage": LG, "description": desc, "provider": TO_CHUC, "isAccessibleForFree": True, "educationalLevel": "beginner",
               "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "courseWorkload": "P4W"}}]
    return GOC + "lo-trinh-4-tuan.html", trang("lo-trinh-4-tuan.html", t(f"Lộ trình 4 tuần học AI, có xếp trình độ | {SITE}", f"The 4-week AI path with a placement check | {SITE}"),
                                               desc, band, main, p, hien_tai="lo-trinh", og_type="website", jsonld=jsonld, q="",
                                               cuoi=f'<script src="{p}lo-trinh-4-tuan.js?v=dev" defer></script>\n')

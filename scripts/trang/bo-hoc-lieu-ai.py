# ---------- Bộ học liệu 12 tiết AI (bo-hoc-lieu-ai.html, en/) ----------
# Học liệu miễn phí cho giáo viên theo Khung nội dung giáo dục AI (QĐ 2422/QĐ-BGDĐT, CV 5588/BGDĐT-GDPT): mỗi cấp 12 tiết,
# tiết nào "san_sang" thì có đủ mục tiêu, chuẩn bị, tiến trình 45 phút, video, trạm thực hành, phiếu in, tiêu chí đánh giá
# và cách dạy khi không có mạng. Dữ liệu: data/hoc-lieu-12-tiet.json. Nút "In tiết này" chỉ in đúng tiết đó (bo-hoc-lieu-ai.js).
# Sang chọn ngày 18/10/2026: học liệu miễn phí, thu ở phần tập huấn; làm THCS trước.
from urllib.parse import quote as _hl_quote


@trang_rieng("bo-hoc-lieu-ai.html", "0.8")
def tao_bo_hoc_lieu_ai():
    p = t("", "../")
    L = "en" if LG == "en" else "vi"
    D = _th_ngu(load("hoc-lieu-12-tiet"), L)
    mach = D["mach"]
    email = kenh.get("email", "")

    def chip(m):
        return f'<span class="hl-mach hl-mach-{m[0]}" title="{esc(mach.get(m[0], ""))}">{esc(m)}</span>'

    def bai(s):
        n = int(s)
        if n not in co_bai:
            return ""
        return f'<li><a href="bai/{ten_file(co_bai[n])}.html">▶ #{n:02d} · {esc(seo[str(n)])}</a></li>'

    def tiet(c, x):
        dau = (f'<span class="hl-so">{x["so"]}</span><span class="hl-ten"><b>{esc(x["ten"])}</b>'
               f'<span class="hl-chips">{"".join(chip(m) for m in x["mach"])}</span></span>')
        if not x.get("san_sang"):
            return (f'<li class="hl-tiet is-sap"><div class="hl-dau">{dau}<span class="hl-tt">{t("Đang soạn", "In progress")}</span></div>'
                    + (f'<p class="hl-y">{esc(x["y"])}</p>' if x.get("y") else "") + '</li>')
        hd = "".join(f'<tr><td class="hl-phut">{h["phut"]}′</td><td><b>{esc(h["ten"])}</b><br>{esc(h["mo_ta"])}</td></tr>' for h in x["hoat_dong"])
        dg = "".join(f'<tr><th scope="row">{esc(d["tieu_chi"])}</th>' + "".join(f"<td>{esc(m)}</td>" for m in d["muc"]) + "</tr>" for d in x["danh_gia"])
        phieu = "".join(f'<li>{esc(re.sub(r"^\s*\d+[.)]\s*", "", q))}<span class="hl-dong" aria-hidden="true"></span></li>' for q in x["phieu"]["cau"])
        tram = "".join(f'<li><a href="{esc(r["url"])}">🧩 {esc(r["ten"])}</a></li>' for r in x.get("tram", []))
        idt = f'{c["id"]}-{x["so"]}'
        the_in = "".join(
            f'<section class="hl-the-in"><h3>✂️ {t("Thẻ in", "Printable cards")}: {esc(g["tieu_de"])}</h3>'
            + (f'<p class="hl-hd">👩‍🏫 {esc(g["huong_dan"])}</p>' if g.get("huong_dan") else "")
            + f'<ul class="hl-the">{"".join(f"<li>{esc(c2)}</li>" for c2 in g["the"])}</ul></section>'
            for g in x.get("the_in", []))
        return f'''<li class="hl-tiet is-san" id="tiet-{idt}">
<details class="hl-chi-tiet"><summary class="hl-dau">{dau}<span class="hl-tt is-san">✓ {t("Sẵn sàng", "Ready")}</span></summary>
<div class="hl-than" id="in-{idt}">
<p class="hl-in-dau">Mark học AI · {esc(c["ten"])} · {t("Tiết", "Lesson")} {x["so"]}: {esc(x["ten"])}</p>
<div class="hl-hai">
<section><h3>🎯 {t("Mục tiêu", "Objectives")}</h3><ul>{"".join(f"<li>{esc(m)}</li>" for m in x["muc_tieu"])}</ul></section>
<section><h3>🧰 {t("Chuẩn bị", "Preparation")}</h3><ul>{"".join(f"<li>{esc(m)}</li>" for m in x["chuan_bi"])}</ul></section>
</div>
<section><h3>⏱️ {t("Tiến trình 45 phút", "45-minute plan")}</h3><table class="hl-bang hl-tien"><tbody>{hd}</tbody></table></section>
<div class="hl-hai hl-khong-in">
<section><h3>🎬 {t("Video", "Videos")}</h3><ul class="hl-lien">{"".join(bai(s) for s in x.get("video", []))}</ul></section>
<section><h3>🕹️ {t("Thực hành trên web", "Practice on the web")}</h3><ul class="hl-lien">{tram}</ul></section>
</div>
<section class="hl-phieu"><h3>📝 {esc(re.sub(r"^(Phiếu|Worksheet)\s*:\s*", "", x["phieu"]["tieu_de"]))}</h3>
<p class="hl-ten-hs">{t("Họ tên", "Name")}: <span></span> {t("Lớp", "Class")}: <span></span></p><ol>{phieu}</ol></section>
{the_in}
<section><h3>✅ {t("Tiêu chí đánh giá (quá trình, không chấm điểm)", "Assessment criteria (formative, no marks)")}</h3>
<table class="hl-bang hl-dg"><thead><tr><th></th><th>{t("Chưa đạt", "Not yet")}</th><th>{t("Đạt", "Met")}</th><th>{t("Tốt", "Strong")}</th></tr></thead><tbody>{dg}</tbody></table></section>
<p class="hl-khong-mang">📴 <b>{t("Không có mạng hay máy chiếu", "No internet or projector")}:</b> {esc(x["khong_mang"])}</p>
<p class="hl-nut"><button type="button" class="btn btn-yt" data-in-tiet="in-{idt}">🖨️ {t("In tiết này", "Print this lesson")}</button></p>
</div></details></li>'''

    cap_html = []
    for c in D["cap"]:
        so_san = sum(1 for x in c["tiet"] if x.get("san_sang"))
        cap_html.append(f'<section class="hl-cap" aria-labelledby="hl-{c["id"]}"><h2 id="hl-{c["id"]}">{esc(c["ten"])}'
                        f'<small>{t(f"{so_san}/12 tiết sẵn sàng", f"{so_san}/12 lessons ready")}</small></h2>'
                        f'<ol class="hl-ds">{"".join(tiet(c, x) for x in c["tiet"])}</ol></section>')
    tieu_de_mail = _hl_quote(t("Tập huấn học liệu AI 12 tiết cho trường", "AI 12-lesson kit training for our school"))
    nut_mail = (f'<a class="btn btn-yt" href="mailto:{esc(email)}?subject={tieu_de_mail}" data-cta="tap-huan-12-tiet">✉️ {t("Đặt tập huấn cho trường", "Book a training for your school")}</a>' if email else "")
    desc = t("Học liệu AI miễn phí cho giáo viên THCS theo Khung nội dung giáo dục AI (QĐ 2422/QĐ-BGDĐT): 12 tiết, mỗi tiết có tiến trình 45 phút, video, thực hành, phiếu in và tiêu chí đánh giá, dạy được cả khi không có mạng.",
             "Free AI lesson kit for lower-secondary teachers, following Vietnam's AI education framework: 12 lessons, each with a 45-minute plan, videos, practice, a printable worksheet and assessment criteria, usable offline.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Theo QĐ 2422/QĐ-BGDĐT · miễn phí · in được", "Follows Vietnam’s AI framework · free · printable")}</p>\n'
            f'<h1>{t("Bộ học liệu AI 12 tiết", "The 12-lesson AI kit")}</h1>\n'
            f'<p class="lead">{t("Cho giáo viên dạy 12 tiết AI cốt lõi mỗi năm học. Dạy được khi không có mạng, học sinh không cần tài khoản AI.", "For teachers running the 12 core AI lessons each school year. Works offline; students need no AI account.")}</p>\n'
            f'<div class="cta">{nut_mail}<a class="btn" href="ai-giao-vien.html">{t("Trạm thực hành cho giáo viên", "Practice stations for teachers")} ›</a></div>\n'
            f'</div><img class="head-art" src="{p}assets/mark-a-ra-the.svg" alt="" width="180" height="170"></div>')
    mach_html = "".join(f'<li>{chip(k)} {esc(v)}</li>' for k, v in mach.items())
    main = (f'<main class="hl" id="hl">\n<link rel="stylesheet" href="{p}assets/bo-hoc-lieu-ai.css?v=dev">\n'
            f'<section class="hl-can-cu"><p>{esc(D["can_cu"])}</p><ul class="hl-mach-ds">{mach_html}</ul></section>\n'
            + "\n".join(cap_html)
            + f'\n<section class="hl-cuoi"><h2>{t("Trường bạn muốn dùng bộ này?", "Want to use this kit at your school?")}</h2>'
              f'<p>{t("Học liệu miễn phí, không bắt học sinh mua gì. Kênh nhận tập huấn giáo viên theo cụm trường, Phòng hoặc Sở, và làm video riêng theo yêu cầu.", "The kit is free and asks students to buy nothing. The channel offers teacher training for school clusters and districts, and custom videos on request.")}</p>'
              f'<div class="cta">{nut_mail}<a class="btn" href="dich-vu.html">{t("Làm video riêng", "Custom videos")} ›</a></div></section>\n'
            + f'<noscript><p>{t("Nút In cần JavaScript; bạn vẫn in được cả trang bằng Ctrl+P.", "The Print button needs JavaScript; you can still print the page with Ctrl+P.")}</p></noscript>\n</main>')
    jsonld = [{"@context": "https://schema.org", "@type": "LearningResource", "name": t("Bộ học liệu AI 12 tiết", "The 12-lesson AI kit"),
               "url": BASE + GOC + "bo-hoc-lieu-ai.html", "inLanguage": LG, "description": desc, "isAccessibleForFree": True,
               "educationalLevel": t("Trung học cơ sở", "Lower secondary"), "audience": {"@type": "EducationalAudience", "educationalRole": "teacher"},
               "publisher": TO_CHUC}]
    return GOC + "bo-hoc-lieu-ai.html", trang("bo-hoc-lieu-ai.html", t(f"Bộ học liệu AI 12 tiết miễn phí cho giáo viên | {SITE}", f"Free 12-lesson AI kit for teachers | {SITE}"),
                                              desc, band, main, p, og_type="website", jsonld=jsonld, q="",
                                              cuoi=f'<script src="{p}bo-hoc-lieu-ai.js?v=dev" defer></script>\n')

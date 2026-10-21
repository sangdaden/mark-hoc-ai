# ---------- Hỏi đáp chống lừa đảo (hoi-dap-<id>.html): 10 trang trả lời câu người Việt hay tìm trên Google ----------
# Sang chọn ý 5 trang "Cải thiện vòng 4" ngày 20/10/2026: kéo người đọc từ Google (Google mới mang về 23 lượt, Facebook 464).
# Nội dung ở data/hoi-dap-lua-dao.json (lấy từ kịch bản đã duyệt 701, 702, 704). Mỗi trang có dữ liệu FAQPage cho Google,
# dẫn về Trạm chống lừa đảo AI (tram-chong-lua-dao.html), mở thẳng thẻ chiêu lừa (?chieu=<id>) và trò chơi tập nhận ra.
# Dùng lại CSS và biểu tượng tl_icon() của Trạm (scripts/trang/tram-chong-lua-dao.py); phần riêng ở assets/tro-choi/hoi-dap-lua-dao.css.
# hoi_dap_khoi(p) là khối thẻ 10 câu hỏi mà Trạm gắn vào trang của nó. Chạy chung không gian tên với tao_bai_viet.py.

HOI_DAP = load("hoi-dap-lua-dao")["trang"]


def hoi_dap_url(x):
    return f'hoi-dap-{x["id"]}.html'


def hoi_dap_the(x, cls="hl-the"):
    """Thẻ một câu hỏi: biểu tượng màu theo chiêu lừa + câu hỏi ngắn + nhãn trả lời."""
    return (f'<a class="{cls} tl-m-{x["mau"]}" href="{hoi_dap_url(x)}" data-tl="hoi-dap-{x["id"]}">'
            f'<span class="hl-the-ic">{tl_icon(x["icon"])}</span>'
            f'<span class="hl-the-chu"><b>{esc(x["ngan"][LG])}</b><small>{esc(x["ket"][LG])}</small></span></a>')


def hoi_dap_khoi(p):
    """Khối Câu hỏi hay gặp trên trang Trạm chống lừa đảo AI."""
    return f"""<section class="tl-khoi hl-khoi" id="hoi-dap" aria-labelledby="hl-khoi-h">
<p class="tl-nhan">{t("Hỏi đáp", "Questions people ask")}</p>
<h2 id="hl-khoi-h">{t("Câu hỏi hay được tìm nhất", "The questions people search most")}</h2>
<div class="hl-luoi">{"".join(hoi_dap_the(x) for x in HOI_DAP)}</div>
</section>"""


def _tao_hoi_dap(x):
    p = t("", "../")
    L = LG
    chu = lambda o: o[L]
    goc = hoi_dap_url(x)
    theo_id = {y["id"]: y for y in HOI_DAP}
    hoi, tra_loi = chu(x["hoi"]), chu(x["tra_loi"])

    # ----- 1. Trả lời ngắn + ô số liệu -----
    o_so = "".join(
        f'<div class="hl-so"><b>{esc(chu(s["so"]))}</b><span>{esc(chu(s["nhan"]))}</span>'
        + (f'<small>{t("Nguồn", "Source")}: {esc(chu(s["nguon"]))}</small>' if s["nguon"] else "") + "</div>"
        for s in x.get("so", []))
    ngan = f"""<section class="tl-khoi hl-tra-loi tl-m-{x["mau"]}" aria-labelledby="hl-tl-h">
<div class="hl-ket"><span class="hl-ket-ic">{tl_icon(x["icon"])}</span><div><p class="tl-nhan">{t("Trả lời ngắn", "Short answer")}</p><h2 id="hl-tl-h">{esc(chu(x["ket"]))}</h2></div></div>
<p class="hl-doan">{esc(tra_loi)}</p>
{f'<div class="hl-so-hang">{o_so}</div>' if o_so else ""}
</section>"""

    # ----- 2. Cái bẫy đi thế nào (chuỗi bước) -----
    duong = ""
    if x.get("duong"):
        buoc = "".join(f'<li><span class="hl-buoc-so">{i}</span><span>{esc(chu(b))}</span></li>' for i, b in enumerate(x["duong"], 1))
        duong = f"""<section class="tl-khoi hl-duong-khoi" aria-labelledby="hl-duong-h">
<p class="tl-nhan">{t("Cái bẫy đi thế nào", "How the trap works")}</p>
<h2 id="hl-duong-h" class="hl-an">{t("Các bước của cái bẫy", "Steps of the trap")}</h2>
<ol class="hl-duong">{buoc}</ol>
</section>"""

    # ----- 3. Dấu hiệu | Làm ngay -----
    def the_y(ds, cls):
        return "".join(f'<li class="{cls}"><b>{esc(chu(d["b"]))}</b><span>{esc(chu(d["s"]))}</span></li>' for d in ds)
    hai = f"""<section class="hl-hai" aria-label="{t("Dấu hiệu và việc cần làm", "Warning signs and what to do")}">
<div class="tl-khoi hl-cot"><p class="tl-nhan tl-do-chu">{t("Dấu hiệu", "Red flags")}</p><h2 class="hl-an">{t("Dấu hiệu", "Red flags")}</h2><ul class="hl-ds hl-ds-do">{the_y(x["dau_hieu"], "hl-y")}</ul></div>
<div class="tl-khoi hl-cot"><p class="tl-nhan tl-xanh-chu">{t("Làm ngay", "Do this")}</p><h2 class="hl-an">{t("Làm ngay", "Do this")}</h2><ol class="hl-ds hl-ds-xanh">{the_y(x["lam"], "hl-y")}</ol></div>
</section>"""

    # ----- 4. Đi tiếp: kiểm tra nhanh, thẻ chiêu lừa, trò chơi, lỡ bị lừa -----
    ten_tro = {"lua-dao-hay-that.html": t("Lừa đảo hay thật", "Scam or real"), "cuoc-goi-gia-giong.html": t("Cuộc gọi giả giọng", "Fake-voice call"),
               "dan-hay-khong.html": t("Dán hay không", "Paste or not"), "chan-lua.html": t("Mark chặn lừa", "Mark blocks scams")}
    di = [("shield", t("Kiểm tra nhanh 30 giây", "30-second check"), t("Chọn điều bạn vừa gặp, trả lời 3 câu", "Pick what happened, answer 3 questions"), "tram-chong-lua-dao.html#kiem-tra-nhanh", "kiem-tra")]
    if x["chieu"]:
        di.append(("message", t("Thẻ chiêu lừa này", "This scam's card"), t("Dấu hiệu, việc làm, video liên quan", "Signs, steps and related videos"), f'tram-chong-lua-dao.html?chieu={x["chieu"]}#chieu-lua', "chieu"))
    di.append(("app", t("Tập nhận ra", "Practise spotting it"), ten_tro.get(x["tro"], ""), x["tro"], "tro"))
    if x["id"] != "lo-chuyen-tien-cho-ke-lua-dao":
        di.append(("clock", t("Lỡ chuyển tiền rồi?", "Already sent money?"), t("5 việc làm ngay trong giờ đầu", "5 things to do in the first hour"), "hoi-dap-lo-chuyen-tien-cho-ke-lua-dao.html", "lo"))
    else:
        di.append(("key", t("Thẻ mật khẩu gia đình", "Family safe-word card"), t("Rào trước cho lần sau", "Be ready next time"), "cuoc-goi-gia-giong.html#cg-mk", "mat-khau"))
    o_di = "".join(f'<a class="tl-do" href="{u}" data-tl="hd-{k}"><span class="tl-do-ic">{tl_icon(i)}</span><span class="tl-o-chu"><b>{esc(a)}</b><small>{esc(b)}</small></span></a>'
                   for i, a, b, u, k in di)
    di_tiep = f"""<section class="tl-khoi" aria-labelledby="hl-di-h">
<p class="tl-nhan">{t("Trạm chống lừa đảo AI", "AI scam help desk")}</p>
<h2 id="hl-di-h">{t("Kiểm tra, tập nhận ra, rào trước", "Check, practise, prepare")}</h2>
<div class="tl-do-luoi">{o_di}</div>
</section>"""

    # ----- 5. Hỏi thêm (FAQ) -----
    hoi_them = "".join(f'<details class="hl-hoi"><summary>{esc(chu(f["q"]))}</summary><p>{esc(chu(f["a"]))}</p></details>' for f in x["faq"])
    faq = f"""<section class="tl-khoi" aria-labelledby="hl-faq-h">
<p class="tl-nhan">{t("Hỏi thêm", "More questions")}</p>
<h2 id="hl-faq-h">{t("Người ta còn hỏi", "People also ask")}</h2>
<div class="hl-hoi-ds">{hoi_them}</div>
</section>"""

    # ----- 6. Gửi cho bố mẹ -----
    url_gui = BASE + GOC + goc + "?utm_source=chia-se&utm_campaign=hoi-dap-lua-dao"
    fb = "https://www.facebook.com/sharer/sharer.php?u=" + quote(url_gui, safe="")
    gui = f"""<section class="tl-khoi" aria-label="{t("Gửi cho bố mẹ", "Send to your parents")}"><div class="chia-se tl-gui hl-gui">
<img class="tl-gui-anh" src="{p}assets/bit-giai-thich.svg" alt="" width="84" height="80" loading="lazy" decoding="async">
<div><p class="chia-se-h">{t("Gửi câu trả lời này cho bố mẹ", "Send this answer to your parents")}</p>
<p class="tl-gui-dan">{t("Kẻ gian nhắm vào người lớn tuổi nhiều nhất. Một tin nhắn hôm nay giúp cả nhà biết phải làm gì.", "Scammers target older people the most. One message today helps your family know what to do.")}</p>
<div class="cta"><button type="button" class="btn btn-yt" data-chia-se data-url="{esc(url_gui)}" data-tieu-de="{esc(hoi)}" hidden>{ic(p, "share")}{t("Gửi qua Zalo", "Send by message")}</button>
<a class="btn" href="{esc(fb)}" target="_blank" rel="noopener" data-tl="hd-gui-fb"><span class="nt nt-sm nt-facebook" aria-hidden="true"><svg><use href="{p}assets/nen-tang.svg#nt-facebook"/></svg></span>Facebook</a>
<button type="button" class="btn" data-chep-link="{esc(url_gui)}" hidden>{ic(p, "link")}{t("Chép link", "Copy link")}</button></div></div>
</div></section>"""

    # ----- 7. Câu hỏi khác: câu liên quan trước, rồi các câu còn lại -----
    khac = [theo_id[i] for i in x["lien_quan"]] + [y for y in HOI_DAP if y["id"] != x["id"] and y["id"] not in x["lien_quan"]]
    khac_khoi = f"""<section class="tl-khoi hl-khoi" aria-labelledby="hl-khac-h">
<p class="tl-nhan">{t("Hỏi đáp chống lừa đảo", "Anti-scam Q&amp;A")}</p>
<h2 id="hl-khac-h">{t("Câu hỏi khác", "Other questions")}</h2>
<div class="hl-luoi">{"".join(hoi_dap_the(y) for y in khac)}</div>
</section>"""

    nguon = " · ".join(esc(chu(n)) for n in x["nguon"])
    main = f"""<main class="tl hl" id="tl">
{ngan}
{duong}
{hai}
{di_tiep}
{faq}
{gui}
{khac_khoi}
<p class="gh-ghi">{t("Nguồn", "Sources")}: {nguon}. {t("Trang này giúp nhận ra dấu hiệu, không thay cho ngân hàng hay công an: khi nghi ngờ, hỏi thẳng họ.", "This page helps you spot warning signs; it doesn't replace your bank or the police. When in doubt, ask them directly.")}</p>
</main>"""

    # Đầu trang: cảnh Bà Năm (nhân vật phụ, assets/nhan-vat/) cầm điện thoại cho 4 trang giọng giả, video giả; còn lại là ô biểu tượng
    if x.get("ba_nam"):
        dau_anh = (f'<figure class="hl-canh tl-m-{x["mau"]}"><span class="hl-canh-loi">{esc(chu(x["ba_nam"]))}</span>'
                   f'<span class="hl-canh-hinh"><img src="{p}assets/nhan-vat/ba-nam.svg" alt="{t("Bà Năm, bà ngoại của Mark", "Grandma Nam, Mark's grandmother")}" width="150" height="180" decoding="async">'
                   f'<span class="hl-canh-dt" aria-hidden="true">{tl_icon(x["icon"])}</span></span></figure>')
    else:
        dau_anh = f'<span class="hl-dau tl-m-{x["mau"]}" aria-hidden="true">{tl_icon(x["icon"], "hl-dau-ic")}</span>'
    band = (f'<div class="head-row"><div>\n'
            f'<nav class="hl-duong-dan" aria-label="{t("Đường dẫn", "Breadcrumb")}"><a href="tram-chong-lua-dao.html">{t("Trạm chống lừa đảo AI", "AI scam help desk")}</a><span aria-hidden="true">›</span><a href="tram-chong-lua-dao.html#hoi-dap">{t("Hỏi đáp", "Q&amp;A")}</a></nav>\n'
            f'<h1>{esc(hoi)}</h1>\n'
            f'<p class="lead">{t("Trả lời trong một phút, kèm dấu hiệu nhận ra và việc cần làm ngay.", "Answered in a minute, with the warning signs and what to do right now.")}</p>\n'
            f'</div>{dau_anh}</div>')

    # Dữ liệu cho Google: FAQPage (câu chính + 3 câu hỏi thêm) và đường dẫn
    jsonld = (
        {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": LG,
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                        for q, a in [(hoi, tra_loi)] + [(chu(f["q"]), chu(f["a"])) for f in x["faq"]]]},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": SITE, "item": BASE + GOC},
            {"@type": "ListItem", "position": 2, "name": t("Trạm chống lừa đảo AI", "AI scam help desk"), "item": BASE + GOC + "tram-chong-lua-dao.html"},
            {"@type": "ListItem", "position": 3, "name": hoi, "item": BASE + GOC + goc}]},
    )
    return GOC + goc, trang(goc, f"{hoi} | {SITE}", cat_ngan(tra_loi), band, main, p, og_type="article", jsonld=jsonld, q="",
                            cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/tram-lua-dao.css?v=dev">\n<link rel="stylesheet" href="{p}assets/tro-choi/hoi-dap-lua-dao.css?v=dev">\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')


for _x in HOI_DAP:
    trang_rieng(hoi_dap_url(_x), "0.7")(lambda x=_x: _tao_hoi_dap(x))

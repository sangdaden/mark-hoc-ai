# ---------- "AI cho người làm y tế" (ai-y-te.html): bộ công cụ đi kèm series "AI cho người làm y tế" (601-610) và
# "Công cụ AI chuyên ngành y tế" (611-615). Cùng khung với các phòng thí nghiệm (cột trạm bên trái .bn-ngan, trạm .bn-tram,
# lời Bit trong khung .yt-bit, popup "Cách chơi" ở data/huong-dan/ai-y-te.json). Bảy trạm, mở thẳng bằng ?tram=<id> hoặc #<id>:
#   che (603), lenh (604, 606, 608, 609), soat (605), de-hieu (607), quy-tac (610), ban-do (611-614), danh-gia (615: ba tờ chào hàng giả để chấm thử, và phiếu trống cho công cụ thật).
# Tầng 🚀 Nâng cao (data/ai-y-te.json "nang_cao") dùng khuôn trạm của thuc-hanh.js / thuc-hanh.css, xem scripts/trang/thuc-hanh.py.
# Nội dung ở data/ai-y-te.json, cách chạy ở ai-y-te.js, giao diện ở assets/ai-y-te.css. Chạy hết trên trình duyệt.

# Thẻ "Chơi thử" trong bài video 134, 177, 223: data/tro-choi/ai-y-te.json, hình xem trước là một dòng ghi chép đã che tên.

HINH_CHOI["th-y-te"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;align-content:center;gap:8px">'
    '<span style="justify-self:center;padding:8px 12px;border-radius:12px;background:var(--panel);border:1.5px solid var(--edge);font:500 13px/1.7 var(--f-body)">'
    + t("BN", "Pt") + ' <b style="padding:1px 6px;border-radius:5px;background:#0F172A;color:#fff;font:700 11px/1 var(--f-mono)">🔒 ' + t("[TÊN]", "[NAME]") + '</b>, '
    + t("sốt 3 ngày, SĐT", "fever 3 days, tel") + ' <b style="padding:1px 6px;border-radius:5px;background:#0F172A;color:#fff;font:700 11px/1 var(--f-mono)">🔒 ' + t("[SĐT]", "[PHONE]") + '</b></span>'
    f'<span style="justify-self:center;font:700 12px/1 var(--f-mono);color:var(--ink)">🏥 {t("7 công cụ", "7 tools")}</span></span>')


@trang_rieng("ai-y-te.html", "0.7")
def tao_ai_y_te():
    p = t("", "../")
    L = "en" if LG == "en" else "vi"
    D = load("ai-y-te")
    chon = lambda x: x[L] if isinstance(x, dict) and L in x else x

    tram = [("che", "603", t("Che thông tin", "De-identify")),
            ("lenh", "604", t("Câu lệnh 5 phần", "5-part prompt")),
            ("soat", "605", t("Soát 5 bước", "5 checks")),
            ("de-hieu", "607", t("Viết dễ hiểu", "Plain language")),
            ("quy-tac", "610", t("Quy tắc của khoa", "Department rules")),
            ("ban-do", "611–614", t("5 loại công cụ AI", "5 kinds of AI tools")),
            ("danh-gia", "615", t("6 câu hỏi trước khi dùng", "6 questions first"))]
    # Tầng Nâng cao: trạm theo khuôn của thuc-hanh.js (data/ai-y-te.json "nang_cao"), thuc-hanh.js dựng nội dung, ai-y-te.js lo chuyển trạm
    nc = _th_ngu(D.get("nang_cao", []), L)
    ngan = _th_ngan(t("Một khoa nội, từ ghi chép trong ca tới chọn công cụ AI cho cả khoa", "One hospital ward, from shift notes to choosing an AI tool"),
                    [f'<li><button type="button" class="bn-nut" data-tram="{i}" aria-controls="tram-{i}"><span class="bn-so">{k + 1}</span>'
                     f'<span class="bn-ten">{ten}<small>{t("Video", "Video")} {so}</small></span></button></li>' for k, (i, so, ten) in enumerate(tram)],
                    [_th_nut(len(tram) + k, x) for k, x in enumerate(nc)])

    def dau(i, k, video, tieu, mo=""):
        return (f'<section class="bn-tram yt-tram" id="tram-{i}" hidden aria-labelledby="h-{i}">\n'
                f'<p class="bn-nhan">{t("Trạm", "Station")} {k} · {t("Video", "Video")} {video}</p>\n'
                f'<h2 id="h-{i}">{tieu}</h2>\n' + (f'<p class="bn-mo">{mo}</p>\n' if mo else ""))

    bit = lambda i: f'<div class="yt-bit" id="{i}" aria-live="polite" hidden></div>'
    chep = lambda i, nhan: f'<button type="button" class="btn btn-chinh yt-chep" id="{i}">{ic(p, "copy")}{nhan}</button>'

    che = (dau("che", 1, "603", t("Che thông tin trước khi dán vào AI", "Hide identifying details before pasting into AI"),
               t("Dán ghi chép vào, bấm Che. Bit thay mọi chỗ lộ danh tính bằng nhãn.", "Paste your notes and press Hide. Bit swaps anything identifying for a label."))
           + f'''<div class="yt-hai">
<textarea id="che-vao" class="bn-o" rows="8" spellcheck="false" aria-label="{t("Ghi chép gốc", "Original notes")}" placeholder="{t("Dán ghi chép vào đây…", "Paste notes here…")}"></textarea>
<textarea id="che-ra" class="bn-o yt-ra-o" rows="8" spellcheck="false" aria-label="{t("Bản đã che", "De-identified text")}" placeholder="{t("Bản đã che hiện ở đây", "The de-identified text appears here")}"></textarea>
</div>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="che-chay">🔒 {t("Che", "Hide")}</button><button type="button" class="btn btn-nhe" id="che-mau">{t("Thử ca mẫu", "Try a sample")}</button>{chep("che-chep", t("Chép bản đã che", "Copy"))}</div>
{bit("che-bit")}
<ul class="yt-ds-che" id="che-ds" aria-label="{t("Những chỗ đã tìm thấy", "Items found")}"></ul>
<div class="yt-hang yt-them" id="che-them-hang" hidden><input type="text" id="che-them-o" class="bn-o yt-o-ngan" autocomplete="off" aria-label="{t("Chữ cần che thêm", "Word to hide")}" placeholder="{t("Còn sót chữ nào? Gõ vào đây", "Missed something? Type it here")}"><button type="button" class="btn btn-nhe" id="che-them">+ {t("Che thêm", "Hide it")}</button></div>
</section>''')

    lenh = (dau("lenh", 2, "604 · 606 · 608 · 609", t("Ghép câu lệnh 5 phần cho việc của bạn", "Build a 5-part prompt for your task"),
                t("Chọn việc, rồi chạm vào mảnh để ghép. Cẩn thận vài mảnh bẫy!", "Pick a task, then tap pieces to build it. Watch out for traps!"))
            + '<div class="yt-the" id="lenh-chon" role="group" aria-label="' + t("Chọn việc", "Choose a task") + '">'
            + "".join(f'<button type="button" class="yt-chon" data-i="{k}" aria-pressed="false"><span aria-hidden="true">{m["bieu_tuong"]}</span>{esc(chon(m["ten"]))}</button>' for k, m in enumerate(D["mau_lenh"]))
            + f'''</div>
<div class="gh-o yt-gh">
<div class="gh-trai">
<div class="gh-lenh"><p class="gh-lenh-nhan">{t("Câu lệnh của bạn", "Your prompt")}</p><div class="gh-lenh-ds" id="lenh-ds" aria-live="polite"></div></div>
<p class="gh-khay-nhan">{t("Mảnh để ghép", "Pieces")}</p>
<div class="gh-khay" id="lenh-khay"></div>
<div class="yt-hang yt-hang-gh"><button type="button" class="btn btn-chinh" id="lenh-gui">{t("Gửi cho AI", "Send to AI")} ›</button>{chep("lenh-chep", t("Chép câu lệnh", "Copy prompt"))}<button type="button" class="btn btn-nhe" id="lenh-lai">↺ {t("Ghép lại", "Start over")}</button></div>
</div>
<div class="gh-ben" id="lenh-ben">
<div class="gh-cho" id="lenh-cho"><img src="{p}assets/bit-y-tuong.svg" alt="" width="88" height="88"><p>{t("Ghép vài mảnh rồi bấm Gửi cho AI để xem câu trả lời đổi ra sao.", "Add some pieces, then press Send to AI to see how the answer changes.")}</p></div>
<div id="lenh-tl" hidden></div>
{bit("lenh-bit")}
</div>
</div>
</section>''')

    buoc = [("nguon", "🔗", t("Nguồn có thật", "Sources exist"), t("Mở được, nói đúng điều AI tóm tắt", "Open them; they say what the AI claims")),
            ("so", "🔢", t("Con số, liều đã đối chiếu", "Numbers and doses checked"), t("So với dược thư, phác đồ", "Against the formulary or protocol")),
            ("doi-tuong", "👶", t("Đối tượng đặc biệt", "Special groups"), t("Trẻ em, thai phụ, người già, suy thận", "Children, pregnancy, elderly, kidney disease")),
            ("bi-mat", "🔒", t("Không còn định danh", "No identifiers left"), t("Tên, ngày sinh, số giấy tờ, ảnh", "Names, birth dates, ID numbers, photos")),
            ("ky", "✍️", t("Có người ký duyệt", "Signed off"), t("Người có chuyên môn chịu trách nhiệm", "A qualified person takes responsibility"))]
    soat = (dau("soat", 3, "605", t("Bản nháp này có 5 lỗi. Bạn tìm ra mấy lỗi?", "This draft has 5 mistakes. How many can you find?"),
                t("Chạm vào câu bạn thấy sai. Mỗi lỗi ứng với một bước soát.", "Tap any sentence you think is wrong. Each mistake matches one check."))
            + f'<div class="yt-nhap"><p class="yt-nhap-tieu">{esc(chon(D["ban_nhap"]["tieu"]))}<span class="yt-nhap-dem" id="soat-dem">0/5</span></p><div class="yt-nhap-than" id="soat-nhap"></div></div>'
            + '<div class="yt-buoc" id="soat-ds">'
            + "".join(f'<label class="yt-buoc-o"><input type="checkbox" data-buoc="{i}"><span class="yt-buoc-bt" aria-hidden="true">{bt}</span><span><b>{ten}</b><small>{giai}</small></span></label>' for i, bt, ten, giai in buoc)
            + f'''</div>
<div class="yt-thanh" aria-hidden="true"><span id="soat-thanh"></span></div>
{bit("soat-bit")}
<div class="yt-hang"><button type="button" class="btn btn-nhe" id="soat-dap">{t("Hiện đáp án", "Show answers")}</button><button type="button" class="btn btn-nhe" id="soat-lai">↺ {t("Làm lại", "Start over")}</button></div>
<p class="bn-ghi">{t("Dùng thật: khi soát bản nháp AI viết cho khoa, tick từng thẻ như danh sách kiểm.", "For real use: tick the cards as a checklist when you review an AI draft for your ward.")}</p>
</section>''')

    de_hieu = (dau("de-hieu", 4, "607", t("Người bệnh đọc tờ này có hiểu không?", "Will patients understand this leaflet?"),
                   t("Dán tờ hướng dẫn vào. Bit tô câu dài và thuật ngữ khó.", "Paste the leaflet. Bit highlights long sentences and medical terms."))
               + f'''<textarea id="dh-vao" class="bn-o" rows="5" aria-label="{t("Tờ hướng dẫn", "Leaflet text")}" placeholder="{t("Dán nội dung vào đây…", "Paste the text here…")}"></textarea>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="dh-chay">🔍 {t("Kiểm tra", "Check")}</button><button type="button" class="btn btn-nhe" id="dh-mau">{t("Thử ví dụ", "Try an example")}</button>
<label class="bn-lbl yt-keo" for="dh-dai">{t("Câu dài khi quá", "Long sentence over")} <b id="dh-dai-so">15</b> {t("chữ", "words")}<input type="range" id="dh-dai" min="10" max="25" value="15"></label></div>
{bit("dh-bit-trong")}
<div id="dh-ket" class="yt-ket-khoi" hidden>
<div class="yt-so4" id="dh-so" aria-live="polite"></div>
<div class="yt-xem" id="dh-xem"></div>
<p class="bn-ghi"><mark class="yt-dai">{t("câu dài", "long sentence")}</mark> <mark class="yt-tn">{t("thuật ngữ", "medical term")}</mark></p>
<p class="gh-khay-nhan yt-h-nho" id="dh-tn-h">{t("Nên nói dễ hiểu hơn", "Say it more simply")}</p>
<dl class="yt-ds-tn" id="dh-tn" aria-labelledby="dh-tn-h"></dl>
{bit("dh-bit")}
<details class="bn-nap"><summary>{t("Câu lệnh nhờ AI viết lại", "Prompt to have AI rewrite it")}</summary><pre class="yt-ra" id="dh-lenh" tabindex="0"></pre><div class="yt-hang">{chep("dh-chep", t("Chép câu lệnh", "Copy prompt"))}</div></details>
</div>
</section>''')

    duoc = chon(D["quy_tac"]["duoc"])
    cam = chon(D["quy_tac"]["cam"])
    o_chk = lambda nhom, ds: "".join(f'<label class="bn-chk"><input type="checkbox" data-{nhom}="{k}" checked> {esc(x)}</label>' for k, x in enumerate(ds))
    quy_tac = (dau("quy-tac", 5, "610", t("Một trang quy tắc dùng AI cho khoa", "A one-page AI policy for your department"),
                   t("Điền vài ô, xem trước bên phải, rồi in.", "Fill in a few boxes, check the preview, then print."))
               + f'''<div class="yt-hai">
<div class="yt-form">
<label class="bn-lbl" for="qt-khoa">{t("Khoa, phòng", "Department")}</label><input type="text" id="qt-khoa" class="bn-o" placeholder="{t("Khoa Nội tổng hợp", "General Medicine")}">
<label class="bn-lbl" for="qt-cong-cu">{t("Công cụ AI được phép", "Approved AI tools")}</label><input type="text" id="qt-cong-cu" class="bn-o" placeholder="{t("Tên công cụ, tài khoản được cấp", "Tool names, accounts provided")}">
<label class="bn-lbl" for="qt-duyet">{t("Ai duyệt bản cuối", "Who signs off")}</label><input type="text" id="qt-duyet" class="bn-o" placeholder="{t("Bác sĩ điều trị", "Treating doctor")}">
<label class="bn-lbl" for="qt-su-co">{t("Báo sự cố ở đâu", "Report incidents to")}</label><input type="text" id="qt-su-co" class="bn-o" placeholder="{t("Trưởng khoa", "Head of department")}">
<details class="bn-nap"><summary>{t("Sửa danh sách được và không được", "Edit the allowed and not-allowed lists")}</summary>
<p class="bn-lbl">✓ {t("Được dùng AI cho", "AI may be used for")}</p>{o_chk("duoc", duoc)}
<p class="bn-lbl">✕ {t("Không được", "Not allowed")}</p>{o_chk("cam", cam)}
<label class="bn-lbl" for="qt-ngay">{t("Ngày ban hành", "Date issued")}</label><input type="date" id="qt-ngay" class="bn-o yt-o-ngan">
<label class="bn-lbl" for="qt-ra-soat">{t("Rà soát lại sau", "Review after")}</label><select id="qt-ra-soat" class="bn-o yt-o-ngan"><option value="3">3 {t("tháng", "months")}</option><option value="6" selected>6 {t("tháng", "months")}</option><option value="12">12 {t("tháng", "months")}</option></select>
</details>
</div>
<div><div class="yt-giay" id="qt-giay" aria-live="polite"></div>
<div class="yt-hang"><button type="button" class="btn btn-chinh" data-in="qt-giay">🖨️ {t("In trang này", "Print")}</button></div></div>
</div>
</section>''')

    ngay = D["cap_nhat"]
    ngay_hien = "/".join(str(int(v)) for v in reversed(ngay.split("-"))) if L == "vi" else ngay
    ban_do = (dau("ban-do", 6, "611–614", t("5 loại công cụ AI trong bệnh viện", "5 kinds of AI tools in hospitals"),
                  t("Chọn một loại để xem nó làm gì và ai là người quyết định.", "Pick one to see what it does and who decides."))
              + '<div class="yt-the yt-the-5" id="bd-chon" role="group" aria-label="' + t("Loại công cụ", "Kind of tool") + '">'
              + "".join(f'<button type="button" class="yt-chon yt-chon-dung" data-bd="{k}" aria-pressed="false"><span aria-hidden="true">{x["bieu_tuong"]}</span>{esc(chon(x["ngan"]))}</button>' for k, x in enumerate(D["ban_do"]))
              + f'</div>\n<article class="yt-bd" id="bd-the" aria-live="polite" hidden></article>\n'
              + f'<p class="bn-ghi">{t(f"Tra ngày {ngay_hien}. Không xếp hạng, không quảng cáo. Số liệu do hãng công bố chưa được kiểm chứng độc lập. Tên sản phẩm thuộc về các công ty sở hữu.", f"Checked {ngay_hien}. No rankings, no endorsements. Vendor figures are not independently verified. Product names belong to their owners.")}</p>\n</section>')

    hoi = "".join(
        f'<fieldset class="yt-hoi" data-hoi="{x["id"]}"{" data-chan" if x["chan"] else ""}><legend><span class="yt-hoi-bt" aria-hidden="true">{x["bieu_tuong"]}</span>'
        f'<b>{esc(chon(x["ngan"]))}{" ★" if x["chan"] else ""}</b><span>{esc(chon(x["hoi"]))}</span></legend><div class="yt-tl">'
        + "".join(f'<label class="yt-tl-{v}"><input type="radio" name="dg-{x["id"]}" value="{v}"><span>{nhan}</span></label>' for v, nhan in (("co", t("Có", "Yes")), ("chua", t("Chưa rõ", "Unclear")), ("khong", t("Không", "No"))))
        + '</div></fieldset>' for x in D["danh_gia"])
    chao = (f'<div class="yt-the yt-the-4" id="dg-chon" role="group" aria-label="{t("Chọn công cụ để chấm", "Pick a tool to check")}">'
            + "".join(f'<button type="button" class="yt-chon yt-chon-dung" data-dg="{k}" aria-pressed="false"><span aria-hidden="true">{x["bieu_tuong"]}</span>{esc(chon(x["nut"]))}</button>' for k, x in enumerate(D["chao_hang"]))
            + f'<button type="button" class="yt-chon yt-chon-dung" data-dg="ban" aria-pressed="false"><span aria-hidden="true">📝</span>{t("Công cụ của khoa bạn", "Your own tool")}</button></div>')
    danh_gia = (dau("danh-gia", 7, "615", t("Hãng chào bán AI: có nên dùng thử?", "A vendor pitches an AI tool: trial it?"),
                    t("Đọc tờ giới thiệu, trả lời 6 câu, rồi xem Bit chấm. Ba câu có dấu ★ phải là Có thì mới dùng thử.", "Read the pitch, answer 6 questions, then see how Bit marks it. The three ★ questions must be Yes before any trial."))
                + chao + f'''
<article class="yt-to" id="dg-to" aria-live="polite"></article>
<input type="text" id="dg-ten" class="bn-o yt-o-ngan" aria-label="{t("Tên công cụ", "Tool name")}" placeholder="{t("Tên công cụ, hãng", "Tool and vendor")}" hidden>
<div id="dg-phieu" class="yt-phieu">{hoi}</div>
{bit("dg-bit")}
<div class="yt-hang" id="dg-in" hidden><button type="button" class="btn btn-chinh" data-in="tram-danh-gia">🖨️ {t("In phiếu", "Print the form")}</button></div>
</section>''')

    nhan = {
        "da_chep": t("Đã chép ✓", "Copied ✓"), "khong_chep": t("Không chép được, hãy chọn chữ rồi chép tay.", "Couldn't copy: select the text and copy it manually."),
        "che_trong": t("Dán ghi chép vào ô bên trái trước nhé.", "Paste some notes into the left box first."),
        "che_xong": t("Đã che {n} chỗ. Bỏ tick chỗ không cần che, gõ thêm chữ còn sót, rồi đọc lại một lượt trước khi chép.", "Hid {n} items. Untick anything that doesn't need hiding, add anything missed, then read it through before copying."),
        "che_khong": t("Không thấy gì cần che. Vẫn nên đọc lại một lượt.", "Nothing found to hide. Still read it through."),
        "goi_y_ten": t("có thể là tên", "maybe a name"),
        "loai": {"ten": t("HỌ TÊN", "NAME"), "ngay": t("NGÀY", "DATE"), "nam-sinh": t("NĂM SINH", "BIRTH YEAR"), "cccd": t("SỐ CCCD", "ID NO."),
                 "bhyt": t("SỐ BHYT", "INSURANCE NO."), "sdt": t("SĐT", "PHONE"), "email": "EMAIL", "ma": t("MÃ HỒ SƠ", "RECORD NO."),
                 "giuong": t("GIƯỜNG", "BED"), "dia-chi": t("ĐỊA CHỈ", "ADDRESS"), "them": t("ĐÃ CHE", "HIDDEN")},
        "mau_che": t("BN Nguyễn Văn Hùng, nam, sinh ngày 12/03/1968, giường số 14, mã BA: 24-018273.\nĐịa chỉ: số 45 đường Lê Lợi, phường Bến Thành, TP.HCM. SĐT người nhà (chị Trần Thị Mai): 0903 123 456.\nCCCD 079068001234, thẻ BHYT DN4797915123456.\nVào viện vì sốt 3 ngày, ho khạc đờm vàng. Sáng nay T 38,6 độ, mạch 102, SpO2 94%. Đã cấy máu, chờ kết quả.\n(Ca giả để thử công cụ.)",
                     "Patient Mr John Carter, male, DOB 12/03/1968, bed 14, MRN: 24-018273.\nAddress: 45 Elm Street, Springfield. Next of kin (Mrs Anna Carter): +44 7700 900123, anna.carter@example.com.\nNHS no. 943 476 5919.\nAdmitted with 3 days of fever and productive cough. This morning T 38.6, HR 102, SpO2 94%. Blood cultures sent, awaiting results.\n(Fictional case for testing.)"),
        "lenh_goc": t("Câu gốc", "Starting line"), "lenh_trong": t("Chưa có mảnh nào. Câu gốc quá mơ hồ, AI sẽ đoán bừa.", "No pieces yet. The starting line is too vague; the AI will guess."),
        "lenh_bat_dau": t("Câu gốc chỉ có một dòng mơ hồ. Chạm vào mảnh bên dưới để ghép thêm.", "The starting line is one vague sentence. Tap the pieces below to add to it."),
        "lenh_dem": t("Đã ghép {n}/5 mảnh cần.", "{n} of 5 needed pieces added."),
        "lenh_du": t("Đủ 5 mảnh! Chép câu lệnh, rồi thay chỗ [ngoặc vuông] bằng nội dung thật đã che. Video {v}.", "All 5 pieces! Copy it, then replace the [square brackets] with your real, de-identified content. Video {v}."),
        "lenh_khoa": t("Bỏ mảnh bẫy ra rồi mới chép được nhé.", "Remove the trap piece before copying."),
        "ai": t("AI trả lời (viết sẵn để minh họa)", "AI answer (pre-written example)"), "muc": {"tho": t("Thô", "Weak"), "kha": t("Khá", "OK"), "tot": t("Tốt", "Good")},
        "gui_tho": t("Câu lệnh mơ hồ nên AI trả lời chung chung, đọc xong không dùng được gì.", "A vague prompt gets a generic answer you can't use."),
        "gui_kha": t("Khá hơn rồi. Thêm đủ 5 mảnh để AI trả lời đúng định dạng và không vượt quá việc của nó.", "Better. Add all 5 pieces so the AI uses the right format and stays in its lane."),
        "gui_tot": t("Đủ 5 mảnh nên câu trả lời gọn, đúng việc, chỗ thiếu thì AI ghi rõ thay vì tự đoán. Chép câu lệnh về dùng nhé!", "With all 5 pieces the answer is tight and on-task, and gaps are flagged instead of guessed. Copy the prompt and use it!"),
        "canh_lo": t("⚠ Bạn vừa gửi họ tên, ngày sinh, mã hồ sơ của người bệnh cho AI. Thông tin này có thể bị lưu trên máy chủ của hãng.", "⚠ You just sent the patient's name, birth date and record number to the AI. It may be stored on the vendor's servers."),
        "canh_nguy": t("⚠ AI tự đưa chẩn đoán và liều thuốc, nghe rất chắc nhưng không ai kiểm. Đây là việc của bác sĩ.", "⚠ The AI made up a diagnosis and a dose. It sounds confident, but nobody has checked it. That's the doctor's job."),
        "nguy_them": t("**Chẩn đoán:** viêm phổi. **Thuốc:** thuốc A 1 viên × 3 lần/ngày, 10 ngày.", "**Diagnosis:** pneumonia. **Medicine:** drug A, 1 tablet 3 times a day for 10 days."),
        "soat_tim": t("Tìm được {n}/5 lỗi.", "Found {n} of 5."), "soat_het": t("Bạn tìm đủ 5 lỗi! Mỗi lỗi ứng với một bước soát: đó là lý do không dùng bản nháp AI khi chưa soát.", "You found all 5! Each one matches a check: that's why no AI draft is used unchecked."),
        "soat_con": t("Còn {n} bước. Chưa dùng bản nháp này nhé.", "{n} checks to go. Don't use this draft yet."),
        "soat_xong": t("Đủ 5 bước. Bản nháp sẵn sàng dùng.", "All 5 checks done. The draft is ready to use."),
        "dh_cau": t("câu", "sentences"), "dh_dai": t("câu dài", "long"), "dh_tn": t("thuật ngữ", "terms"), "dh_tb": t("chữ / câu", "words / sentence"),
        "dh_trong": t("Dán tờ hướng dẫn vào trước nhé.", "Paste the leaflet text first."),
        "dh_bit": t("Trước khi người bệnh ra về, hỏi lại họ:", "Before the patient leaves, ask them:"),
        "dh_bit_tot": t("Tờ này dễ đọc rồi. Trước khi người bệnh ra về, vẫn hỏi lại họ:", "This reads well. Before the patient leaves, still ask them:"),
        "dh_tb_chung": [t("Về nhà mình cần làm những việc gì?", "What do you need to do at home?"),
                        t("Có dấu hiệu nào thì phải đi khám ngay?", "Which signs mean you should get help straight away?"),
                        t("Có điều gì trong tờ này mình chưa rõ không?", "Is anything in this leaflet unclear?")],
        "dh_lenh": t("Viết lại tờ hướng dẫn dưới đây cho người lớn tuổi, đọc chậm, không quen thuật ngữ y khoa.\n- Câu ngắn dưới {n} chữ.\n- Thay các thuật ngữ sau bằng việc cụ thể: {tn}.\n- Giữ nguyên mọi con số, liều và mốc thời gian; không thêm lời khuyên mới. Chỗ nào không rõ thì ghi [HỎI BÁC SĨ].\n- Cuối bài thêm 3 câu hỏi teach-back.\n\n[DÁN TỜ HƯỚNG DẪN ĐÃ CHE THÔNG TIN]",
                     "Rewrite the leaflet below for an older adult who reads slowly and doesn't know medical terms.\n- Short sentences under {n} words.\n- Replace these terms with concrete, everyday words: {tn}.\n- Keep every number, dose and time exactly; add no new advice. Mark anything unclear [ASK THE DOCTOR].\n- End with 3 teach-back questions.\n\n[PASTE THE DE-IDENTIFIED LEAFLET]"),
        "dh_khong_co": t("(không có)", "(none)"),
        "mau_dh": t("Sau phẫu thuật, người bệnh cần tránh gắng sức trong 2 tuần đầu. Uống kháng sinh theo chỉ định, sau ăn no, ngày 2 lần sáng và tối, đủ 7 ngày, không tự ý ngưng thuốc kể cả khi đã hết sốt. Theo dõi vết mổ hằng ngày, nếu có dấu hiệu nhiễm trùng như sưng nóng đỏ đau hoặc có dịch tiết thì đến cơ sở y tế gần nhất. Hạn chế muối trong chế độ ăn. Tái khám sau 7 ngày để cắt chỉ, mang theo giấy ra viện.",
                    "Following surgery, the patient should avoid strenuous activity for the first two weeks. Take the antibiotic as indicated, after meals, twice daily for seven days, and do not stop even if the fever resolves. Monitor the incision daily and if there are signs of infection such as redness, heat, swelling, pain or discharge, attend the nearest health facility. Follow a low-sodium diet. Attend follow-up after seven days for suture removal and bring your discharge papers."),
        "qt_tieu": t("Quy tắc dùng AI", "AI use policy"), "qt_khoa_trong": t("[Tên khoa]", "[Department]"),
        "qt_cong_cu": t("Chỉ dùng công cụ AI bệnh viện đã cho phép", "Only use AI tools approved by the hospital"),
        "qt_duoc": t("Được dùng AI cho", "AI may be used for"), "qt_cam": t("Không được", "Not allowed"),
        "qt_luon": t("Luôn luôn", "Always"),
        "qt_luon_ds": [t("Che thông tin người bệnh trước khi dán vào AI.", "Remove identifying patient details before pasting into AI."),
                       t("Soát 5 bước: nguồn, con số và liều, đối tượng đặc biệt, thông tin định danh, người ký duyệt.", "Run the 5 checks: sources, numbers and doses, special groups, identifiers, sign-off."),
                       t("Ghi rõ bản nào có AI hỗ trợ soạn khi lưu vào hồ sơ.", "Note when AI helped draft anything filed in the record.")],
        "qt_duyet": t("Người duyệt bản cuối", "Final sign-off"), "qt_su_co": t("Báo sự cố", "Report incidents to"),
        "qt_su_co_them": t("Báo để cả khoa rút kinh nghiệm, không phải để trách ai.", "Report so the whole team learns, not to blame anyone."),
        "qt_ngay": t("Ban hành", "Issued"), "qt_ra_soat": t("rà soát lại sau {n} tháng", "review after {n} months"), "qt_chua": t("chưa điền", "not filled in"),
        "bd_nhan": {"lam_gi": t("Làm gì", "What it does"), "vi_du": t("Ví dụ", "Examples"), "kiem": t("Cần kiểm", "Check"), "nguoi": t("Ai quyết định", "Who decides")},
        "dg_chua": t("Còn {n} câu chưa trả lời.", "{n} questions to go."),
        "dg_chan": t("Chưa nên dùng: câu {ds} là Không, mà đây là điều kiện bắt buộc.", "Not ready: question {ds} is No, and it's required."),
        "dg_chua_ro": t("Hỏi thêm hãng trước khi quyết:", "Ask the vendor before deciding:"),
        "dg_thu": t("Đủ điều kiện dùng thử có kiểm soát ở một khoa vài tuần, đo thời gian và lỗi thật rồi mới mở rộng.", "Ready for a controlled trial in one department for a few weeks; measure real time saved and errors before scaling up."),
        "dg_vi_du": t("Ví dụ giả định", "Fictional example"), "dg_hoi_tiep": t("Chỗ nào tờ giới thiệu không nói tới thì chọn Chưa rõ.", "If the pitch doesn't say, pick Unclear."),
        "dg_khop": t("Bạn chấm khớp {n}/6 câu.", "You matched {n} of 6."), "dg_dap": t("Đáp án", "Answer"), "dg_dung": t("Đúng", "Right"), "dg_ket": t("Kết luận cho {ten}:", "Verdict for {ten}:"),
        "dg_tl": {"co": t("Có", "Yes"), "chua": t("Chưa rõ", "Unclear"), "khong": t("Không", "No")},
        "dg_ban": t("Dùng phiếu này khi có hãng đến chào công cụ thật. Ghi tên công cụ, trả lời 6 câu rồi in ra nộp hội đồng khoa.", "Use this form when a vendor pitches a real tool. Add its name, answer the 6 questions, then print it for your committee."),
        "dg_thu_luu_y": t("Lưu ý câu {ds} là Không: ghi rõ cách xử lý trong kế hoạch dùng thử.", "Note that question {ds} is No: plan how to handle it in the trial."),
    }
    du_lieu = json.dumps({"nhan": nhan, "lg": L, "p": p, "mau_lenh": [{k: ({mu: chon(x) for mu, x in v.items()} if k == "tra_loi" else chon(v)) for k, v in m.items()} for m in D["mau_lenh"]],
                          "ban_nhap": [{"chu": chon(x["chu"]), "loi": x["loi"], "bit": chon(x["bit"])} for x in D["ban_nhap"]["doan"]],
                          "gioi_han_chung": chon(D["gioi_han_chung"]),
                          "loai_manh": {k: {"ten": chon(v), "mau": v["mau"]} for k, v in D["loai_manh"].items()},
                          "bay": [{"id": x["id"], "loai": x["loai"], "chu": chon(x["chu"]), "bit": chon(x["bit"]), "muc": x["muc"]} for x in D["bay"]], "thuat_ngu": D["thuat_ngu"][L], "teach_back": D["teach_back"][L],
                          "duoc": duoc, "cam": cam,
                          "ban_do": [{k: chon(x[k]) for k in ("ten", "video", "lam_gi", "vi_du", "kiem", "nguoi", "bieu_tuong")} for x in D["ban_do"]],
                          "danh_gia": [{"id": x["id"], "chan": x["chan"], "ngan": chon(x["ngan"]), "goi_y": chon(x["goi_y"])} for x in D["danh_gia"]],
                          "chao_hang": [{"ten": x["ten"], "hang": chon(x["hang"]), "cau": chon(x["cau"]), "bieu_tuong": x["bieu_tuong"], "dap": x["dap"],
                                         "dong": [{"bt": y["bt"], "chu": chon(y["chu"]), "nho": chon(y["nho"]) if "nho" in y else ""} for y in x["dong"]],
                                         "giai": {k: chon(g) for k, g in x["giai"].items()}} for x in D["chao_hang"]]},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    du_nc = json.dumps({"nhan": _th_nhan(), "lg": L, "p": p, "trang": "ai-y-te", "tram": nc}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tieu = t("AI cho người làm y tế: 7 công cụ thực hành", "AI for healthcare staff: 7 hands-on tools")
    desc = t("Bảy công cụ miễn phí theo series AI cho người làm y tế: che thông tin người bệnh trước khi dán vào AI, câu lệnh 5 phần (SBAR, tờ hướng dẫn, biên bản, tóm tắt bài báo), soát 5 bước, viết cho người bệnh dễ hiểu, quy tắc dùng AI cho khoa, 5 loại công cụ AI y tế và 6 câu hỏi trước khi dùng. Chạy trên trình duyệt, không gửi dữ liệu đi đâu.",
             "Seven free tools from the AI for healthcare staff series: de-identify patient notes, 5-part prompts (SBAR, leaflets, minutes, paper summaries), 5 checks, plain-language leaflets, a department AI policy, 5 kinds of healthcare AI tools and 6 questions before adopting one. Runs in your browser; nothing is sent anywhere.")
    dong_dau = (t(f"Thực hành · 7 trạm cơ bản + {len(nc)} trạm nâng cao · chạy trên trình duyệt", f"Hands-on · 7 core + {len(nc)} advanced stations · runs in your browser") if nc
                else t("Thực hành · 7 trạm · chạy trên trình duyệt", "Hands-on · 7 stations · runs in your browser"))
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{dong_dau}</p>\n'
            f'<h1>{t("AI cho người làm y tế", "AI for healthcare staff")}</h1>\n'
            f'<p class="lead">{t("AI soạn nháp, người làm y tế quyết định. Thông tin người bệnh không rời máy bạn.", "AI drafts, healthcare staff decide. Patient details never leave your device.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-giai-thich.svg" alt="" width="180" height="170"></div>')
    main = (f'<main class="bn yt" id="yt">\n<link rel="stylesheet" href="{p}assets/ai-y-te.css?v=dev">\n'
            + (f'<link rel="stylesheet" href="{p}assets/thuc-hanh.css?v=dev">\n' if nc else "")
            + f'{ngan}\n<div class="bn-ban">\n{che}\n{lenh}\n{soat}\n{de_hieu}\n{quy_tac}\n{ban_do}\n{danh_gia}\n'
            + "".join(_th_tram(len(tram) + k, x, "yt-tram th-tram th") for k, x in enumerate(nc))
            + f'<p class="yt-ghi">{t("Công cụ học tập, không phải thiết bị y tế: không dùng để chẩn đoán, chỉ định hay kê đơn. Mọi ví dụ là ca giả. Chữ bạn dán vào chỉ nằm trên máy bạn, không gửi đi đâu.", "A learning tool, not a medical device: not for diagnosis, orders or prescribing. All examples are fictional. What you paste stays on your device and is never sent.")}</p>\n'
            f'{khoi_chia_se(BASE + GOC + "ai-y-te.html", tieu, p)}\n</div>\n'
            f'<noscript><p>{t("Công cụ cần JavaScript.", "These tools need JavaScript.")}</p></noscript>\n'
            f'<script type="application/json" id="yt-du-lieu">{du_lieu}</script>\n'
            + (f'<script type="application/json" id="th-du-lieu">{du_nc}</script>\n' if nc else "") + '</main>')
    return GOC + "ai-y-te.html", trang("ai-y-te.html", f"{tieu} | {SITE}", desc, band, main, p, og_type="website", q="",
                                       cuoi=f'<script src="{p}ai-y-te.js?v=dev" defer></script>\n'
                                       + (f'<script src="{p}thuc-hanh.js?v=dev" defer></script>\n' if nc else "") + f'<script src="{p}bai-viet.js?v=dev" defer></script>\n')

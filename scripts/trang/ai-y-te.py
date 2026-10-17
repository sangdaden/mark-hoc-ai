# ---------- "Bộ công cụ AI cho người làm y tế" (ai-y-te.html): series "AI cho người làm y tế" (601-610) và
# "Công cụ AI chuyên ngành y tế" (611-615). Bảy trạm, mở thẳng bằng ?tram=<id> hoặc #<id>:
#   che (603: che thông tin người bệnh), lenh (604, 606, 608, 609: khung câu lệnh 5 phần), soat (605: soát 5 bước),
#   de-hieu (607: viết cho người bệnh dễ hiểu + teach-back), quy-tac (610: một trang quy tắc cho khoa),
#   ban-do (611-614: các loại công cụ AI chuyên ngành), danh-gia (615: phiếu 6 câu hỏi trước khi dùng một công cụ).
# Nội dung (mẫu câu lệnh, thuật ngữ, bản đồ công cụ, câu hỏi đánh giá) ở data/ai-y-te.json; cách chạy ở ai-y-te.js;
# giao diện ở assets/ai-y-te.css. Mọi thứ chạy trên trình duyệt, không gửi chữ người dùng dán vào đi đâu.


@trang_rieng("ai-y-te.html", "0.7")
def tao_ai_y_te():
    p = t("", "../")
    L = "en" if LG == "en" else "vi"
    D = load("ai-y-te")
    chon = lambda x: x[L] if isinstance(x, dict) and L in x else x

    tram = [("che", "603", t("Che thông tin người bệnh", "De-identify patient notes"), t("Trước khi dán vào AI", "Before pasting into AI")),
            ("lenh", "604", t("Khung câu lệnh y tế", "Healthcare prompt builder"), t("Câu lệnh 5 phần cho 8 việc", "5-part prompts for 8 tasks")),
            ("soat", "605", t("Soát câu trả lời AI", "Check the AI's answer"), t("5 bước trước khi dùng", "5 checks before use")),
            ("de-hieu", "607", t("Viết cho người bệnh dễ hiểu", "Plain language for patients"), t("Tô thuật ngữ, câu dài, teach-back", "Flags jargon, long sentences, teach-back")),
            ("quy-tac", "610", t("Quy tắc dùng AI cho khoa", "AI rules for your department"), t("Một trang để in", "One printable page")),
            ("ban-do", "611–614", t("Bản đồ công cụ AI y tế", "Map of healthcare AI tools"), t("5 loại, làm gì, kiểm gì", "5 kinds: what they do, what to check")),
            ("danh-gia", "615", t("Phiếu đánh giá công cụ AI", "AI tool assessment form"), t("6 câu hỏi trước khi dùng", "6 questions before adopting"))]
    ngan = (f'<nav class="yt-ngan" aria-label="{t("Các công cụ", "Tools")}">' +
            "".join(f'<button type="button" class="yt-nut" data-tram="{i}" aria-controls="tram-{i}"><span class="yt-nut-so">{so}</span>'
                    f'<span><b>{ten}</b><small>{phu}</small></span></button>' for i, so, ten, phu in tram) + '</nav>')

    def dau(i, so_tram, video, tieu, mo):
        return (f'<section class="yt-tram" id="tram-{i}" hidden aria-labelledby="h-{i}">\n'
                f'<p class="yt-nhan">{t("Công cụ", "Tool")} {so_tram} · {t("Video", "Video")} {video}</p>\n'
                f'<h2 id="h-{i}">{tieu}</h2>\n<p class="yt-mo">{mo}</p>\n')

    rieng_tu = f'<p class="yt-rieng"><svg class="ic" aria-hidden="true"><use href="{p}assets/icons.svg#i-lock"/></svg>{t("Chạy ngay trên máy bạn. Chữ bạn dán vào không được gửi đi đâu.", "Runs on your device. Nothing you paste is sent anywhere.")}</p>'

    che = (dau("che", 1, "603", t("Che thông tin người bệnh trước khi dán vào AI", "De-identify patient notes before pasting them into AI"),
               t("Dán ghi chép vào, công cụ tìm và thay họ tên (sau các chữ như BN, bệnh nhân, ông, bà), ngày sinh, số CCCD, số thẻ BHYT, số điện thoại, email, mã bệnh án, số giường và địa chỉ bằng nhãn chung. Bỏ tick chỗ không cần che, gõ thêm chữ cần che, rồi mới chép sang AI.",
                 "Paste your notes and the tool finds names (after words like patient, Mr, Mrs), dates of birth, ID and insurance numbers, phone numbers, emails, record and bed numbers and addresses, and swaps them for placeholders. Untick anything that doesn't need hiding, add words it missed, then copy it to the AI."))
           + rieng_tu +
           f'''<div class="yt-hai">
<div><label class="yt-lbl" for="che-vao">{t("Ghi chép gốc", "Original notes")}</label>
<textarea id="che-vao" class="yt-o" rows="10" spellcheck="false" placeholder="{t("Dán ghi chép vào đây…", "Paste notes here…")}"></textarea>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="che-chay">{t("Che thông tin", "De-identify")}</button><button type="button" class="btn btn-nhe" id="che-mau">{t("Dùng ca mẫu (giả)", "Use a sample (fictional)")}</button></div></div>
<div><label class="yt-lbl" for="che-ra">{t("Bản đã che (sửa thêm được)", "De-identified text (you can edit it)")}</label>
<textarea id="che-ra" class="yt-o" rows="10" spellcheck="false" readonly></textarea>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="che-chep" disabled>{t("Chép bản đã che", "Copy de-identified text")}</button><span class="yt-tb" id="che-tb" aria-live="polite"></span></div></div>
</div>
<div class="yt-them"><label class="yt-lbl" for="che-them-o">{t("Che thêm một chữ công cụ bỏ sót (tên riêng, tên đường…)", "Hide a word the tool missed (a name, a street…)")}</label>
<div class="yt-hang"><input type="text" id="che-them-o" class="yt-o yt-o-ngan" autocomplete="off"><button type="button" class="btn" id="che-them">{t("Che thêm", "Hide it")}</button></div></div>
<h3 class="yt-h3" id="che-ds-h" hidden>{t("Đã tìm thấy", "Found")}</h3>
<ul class="yt-ds-che" id="che-ds" aria-labelledby="che-ds-h"></ul>
<p class="yt-luu-y">{t("Công cụ không bắt được mọi thứ, nhất là tên viết thường hay chi tiết hiếm gặp (nghề nghiệp đặc biệt, sự kiện lên báo). Luôn đọc lại cả bản đã che trước khi chép đi, và chỉ dùng công cụ AI bệnh viện đã cho phép.", "It can't catch everything, especially names written in lower case or rare details (an unusual job, an event in the news). Always reread the whole de-identified text before copying it, and only use AI tools your hospital has approved.")}</p>
</section>''')

    lenh = (dau("lenh", 2, "604 · 606 · 608 · 609", t("Khung câu lệnh 5 phần cho người làm y tế", "The 5-part prompt for healthcare staff"),
                t("Chọn việc, sửa năm ô cho đúng ca của bạn, rồi chép câu lệnh. Ô Giới hạn luôn có thêm câu không chẩn đoán, không đưa liều thuốc.",
                  "Pick a task, adjust the five boxes for your case, then copy the prompt. The Limits box always adds a line forbidding diagnoses and doses."))
            + f'''<div class="yt-chon" id="lenh-chon" role="group" aria-label="{t("Chọn việc", "Choose a task")}"></div>
<div class="yt-hai">
<div class="yt-o-5">
<label class="yt-lbl" for="lenh-vai_tro"><span class="yt-so">1</span>{t("Vai trò", "Role")}</label><textarea id="lenh-vai_tro" class="yt-o" rows="2"></textarea>
<label class="yt-lbl" for="lenh-boi_canh"><span class="yt-so">2</span>{t("Bối cảnh (đã che thông tin)", "Context (de-identified)")}</label><textarea id="lenh-boi_canh" class="yt-o" rows="4"></textarea>
<label class="yt-lbl" for="lenh-viec"><span class="yt-so">3</span>{t("Việc cần làm", "Task")}</label><textarea id="lenh-viec" class="yt-o" rows="2"></textarea>
<label class="yt-lbl" for="lenh-dinh_dang"><span class="yt-so">4</span>{t("Định dạng", "Format")}</label><textarea id="lenh-dinh_dang" class="yt-o" rows="2"></textarea>
<label class="yt-lbl" for="lenh-gioi_han"><span class="yt-so">5</span>{t("Giới hạn", "Limits")}</label><textarea id="lenh-gioi_han" class="yt-o" rows="3"></textarea>
</div>
<div><p class="yt-lbl" id="lenh-ra-h">{t("Câu lệnh để chép", "Your prompt")}</p>
<pre class="yt-ra" id="lenh-ra" aria-labelledby="lenh-ra-h" tabindex="0"></pre>
<label class="yt-chk"><input type="checkbox" id="lenh-da-che"> {t("Tôi đã che hết thông tin định danh của người bệnh", "I have removed all identifying patient details")}</label>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="lenh-chep" disabled>{t("Chép câu lệnh", "Copy prompt")}</button><span class="yt-tb" id="lenh-tb" aria-live="polite"></span></div>
<p class="yt-luu-y" id="lenh-luu-y"></p></div>
</div>
</section>''')

    buoc = [("nguon", t("Nguồn có thật", "The sources exist"), t("Mọi tài liệu, bài báo, hướng dẫn AI nhắc tới đều mở ra được và nói đúng điều AI tóm tắt.", "Every document, paper or guideline the AI mentions can be opened and says what the AI claims.")),
            ("so", t("Con số, liều đã đối chiếu", "Numbers and doses checked"), t("Liều, chỉ số, ngày, tỉ lệ đều so với dược thư, hướng dẫn của Bộ Y tế hoặc phác đồ bệnh viện.", "Doses, values, dates and rates are checked against the formulary, national guidelines or local protocols.")),
            ("doi-tuong", t("Đối tượng đặc biệt", "Special groups"), t("Lời khuyên đúng cho trẻ em, thai phụ, người cao tuổi, người suy gan, suy thận (nếu người đọc thuộc nhóm này).", "Advice is right for children, pregnant women, older adults and people with liver or kidney disease (if the reader is one of them).")),
            ("bi-mat", t("Không còn thông tin định danh", "No identifying details left")), ("ky", t("Có người có chuyên môn ký duyệt", "Signed off by a qualified person"))]
    buoc[3] = buoc[3] + (t("Không còn họ tên, ngày sinh, số giấy tờ, mã bệnh án, địa chỉ, số điện thoại, ảnh có mặt người bệnh.", "No names, dates of birth, ID numbers, record numbers, addresses, phone numbers or photos showing a face."),)
    buoc[4] = buoc[4] + (t("Bản nào dùng cho người bệnh hoặc lưu vào hồ sơ đều có người có chuyên môn đọc và chịu trách nhiệm.", "Anything used with patients or filed in the record is read and owned by a qualified person."),)
    soat = (dau("soat", 3, "605", t("Năm bước soát câu trả lời của AI trước khi dùng", "Five checks before you use an AI's answer"),
                t("Bản nháp của AI giống bản nháp của học viên: hữu ích, nhưng phải có người soát. Tick đủ năm bước mới dùng.",
                  "An AI draft is like a trainee's draft: useful, but someone has to check it. Tick all five before you use it."))
            + '<ol class="yt-buoc" id="soat-ds">' +
            "".join(f'<li><label class="yt-buoc-o"><input type="checkbox" data-buoc="{i}"><span><b>{ten}</b><small>{giai}</small></span></label></li>' for i, ten, giai in buoc)
            + f'''</ol>
<div class="yt-ket" id="soat-ket" aria-live="polite"></div>
<label class="yt-lbl" for="soat-ten">{t("Người duyệt (không bắt buộc, để ghi vào bản in)", "Reviewer (optional, shown when printed)")}</label>
<input type="text" id="soat-ten" class="yt-o yt-o-ngan" autocomplete="off">
<div class="yt-hang"><button type="button" class="btn" id="soat-lai">{t("Soát bản khác", "Check another draft")}</button></div>
</section>''')

    de_hieu = (dau("de-hieu", 4, "607", t("Viết cho người bệnh dễ hiểu", "Write so patients understand"),
                   t("Dán tờ hướng dẫn vào. Công cụ tô câu dài và thuật ngữ chuyên môn (kèm từ thay thế), rồi gợi ý câu hỏi teach-back: nhờ người bệnh nhắc lại bằng lời của mình.",
                     "Paste a leaflet. The tool highlights long sentences and medical terms (with plain alternatives), then suggests teach-back questions: asking the patient to repeat it in their own words."))
               + rieng_tu +
               f'''<label class="yt-lbl" for="dh-vao">{t("Tờ hướng dẫn", "Leaflet text")}</label>
<textarea id="dh-vao" class="yt-o" rows="7" placeholder="{t("Dán nội dung vào đây…", "Paste the text here…")}"></textarea>
<div class="yt-hang"><label class="yt-lbl yt-lbl-ngang" for="dh-dai">{t("Câu dài khi quá", "Long sentence above")} <b id="dh-dai-so">15</b> {t("chữ", "words")}</label><input type="range" id="dh-dai" min="10" max="25" value="15"></div>
<div class="yt-hang"><button type="button" class="btn btn-chinh" id="dh-chay">{t("Kiểm tra", "Check")}</button><button type="button" class="btn btn-nhe" id="dh-mau">{t("Dùng ví dụ", "Use an example")}</button></div>
<div id="dh-ket" hidden>
<div class="yt-so4" id="dh-so" aria-live="polite"></div>
<div class="yt-xem" id="dh-xem"></div>
<p class="yt-chu-giai"><mark class="yt-dai">{t("câu dài", "long sentence")}</mark> <mark class="yt-tn">{t("thuật ngữ", "medical term")}</mark> {t("Rê chuột hoặc chạm vào thuật ngữ để xem từ thay thế.", "Hover or tap a term to see a plainer word.")}</p>
<h3 class="yt-h3">{t("Thuật ngữ nên thay", "Terms to replace")}</h3><ul class="yt-ds-tn" id="dh-tn"></ul>
<h3 class="yt-h3">{t("Câu hỏi teach-back gợi ý", "Suggested teach-back questions")}</h3><ol class="yt-ds-tb" id="dh-tb"></ol>
<h3 class="yt-h3">{t("Câu lệnh nhờ AI viết lại", "Prompt to have AI rewrite it")}</h3>
<pre class="yt-ra" id="dh-lenh" tabindex="0"></pre>
<div class="yt-hang"><button type="button" class="btn" id="dh-chep">{t("Chép câu lệnh", "Copy prompt")}</button><span class="yt-tb" id="dh-tb-chep" aria-live="polite"></span></div>
</div>
<p class="yt-luu-y">{t("Con số, liều và mốc thời gian do bác sĩ điều trị quyết định. Bản viết lại vẫn phải qua 5 bước soát.", "Numbers, doses and timings are the treating doctor's call. The rewrite still goes through the 5 checks.")}</p>
</section>''')

    duoc = chon(D["quy_tac"]["duoc"])
    cam = chon(D["quy_tac"]["cam"])
    o_chk = lambda nhom, ds: "".join(f'<label class="yt-chk"><input type="checkbox" data-{nhom}="{k}" checked> {esc(x)}</label>' for k, x in enumerate(ds))
    quy_tac = (dau("quy-tac", 5, "610", t("Một trang quy tắc dùng AI cho khoa phòng", "A one-page AI policy for your department"),
                   t("Điền vài ô, bỏ tick mục không hợp, rồi in và dán ở phòng hành chính khoa. Đây là bản đề xuất để trưởng khoa duyệt, không thay quy định của bệnh viện.",
                     "Fill in a few boxes, untick what doesn't apply, then print it for the department office. It's a draft for your head of department to approve, not a substitute for hospital policy."))
               + f'''<div class="yt-hai">
<div class="yt-form">
<label class="yt-lbl" for="qt-khoa">{t("Khoa, phòng", "Department")}</label><input type="text" id="qt-khoa" class="yt-o" placeholder="{t("Khoa Nội tổng hợp", "General Medicine")}">
<label class="yt-lbl" for="qt-cong-cu">{t("Công cụ AI bệnh viện đã cho phép", "AI tools approved by the hospital")}</label><input type="text" id="qt-cong-cu" class="yt-o" placeholder="{t("Ghi tên công cụ và tài khoản được cấp", "Tool names and the accounts provided")}">
<fieldset class="yt-nhom"><legend>{t("Được dùng AI cho", "AI may be used for")}</legend>{o_chk("duoc", duoc)}</fieldset>
<fieldset class="yt-nhom"><legend>{t("Không được", "Not allowed")}</legend>{o_chk("cam", cam)}</fieldset>
<label class="yt-lbl" for="qt-duyet">{t("Ai duyệt bản cuối", "Who signs off the final version")}</label><input type="text" id="qt-duyet" class="yt-o" placeholder="{t("Bác sĩ điều trị / điều dưỡng trưởng khoa", "Treating doctor / ward manager")}">
<label class="yt-lbl" for="qt-su-co">{t("Báo sự cố ở đâu", "Where to report incidents")}</label><input type="text" id="qt-su-co" class="yt-o" placeholder="{t("Trưởng khoa, sổ báo cáo sự cố y khoa", "Head of department, incident log")}">
<label class="yt-lbl" for="qt-ngay">{t("Ngày ban hành", "Date issued")}</label><input type="date" id="qt-ngay" class="yt-o yt-o-ngan">
<label class="yt-lbl" for="qt-ra-soat">{t("Rà soát lại sau", "Review after")}</label><select id="qt-ra-soat" class="yt-o yt-o-ngan"><option value="3">3 {t("tháng", "months")}</option><option value="6" selected>6 {t("tháng", "months")}</option><option value="12">12 {t("tháng", "months")}</option></select>
</div>
<div><div class="yt-giay" id="qt-giay" aria-live="polite"></div>
<div class="yt-hang"><button type="button" class="btn btn-chinh" data-in="qt-giay">{t("In trang này", "Print this page")}</button></div></div>
</div>
</section>''')

    loai_ten = {x["loai"]: chon(x["ten"]) for x in D["ban_do"]}
    the = "".join(
        f'<article class="yt-the" data-loai="{x["loai"]}"><p class="yt-the-nhan">{t("Video", "Video")} {x["video"]}</p><h3>{esc(chon(x["ten"]))}</h3>'
        f'<dl><dt>{t("Làm gì", "What it does")}</dt><dd>{esc(chon(x["lam_gi"]))}</dd>'
        f'<dt>{t("Ví dụ", "Examples")}</dt><dd>{esc(chon(x["vi_du"]))}</dd>'
        f'<dt>{t("Cần kiểm", "Check")}</dt><dd>{esc(chon(x["kiem"]))}</dd>'
        f'<dt>{t("Người quyết định", "Who decides")}</dt><dd>{esc(chon(x["nguoi"]))}</dd></dl></article>' for x in D["ban_do"])
    ngay = D["cap_nhat"]
    ngay_hien = "/".join(str(int(v)) for v in reversed(ngay.split("-"))) if L == "vi" else ngay
    ban_do = (dau("ban-do", 6, "611–614", t("Bản đồ công cụ AI chuyên ngành y tế", "Map of specialist healthcare AI tools"),
                  t("Năm loại công cụ AI đang có trong bệnh viện: mỗi loại làm gì, ví dụ sản phẩm, cần kiểm gì và ai là người quyết định. Không xếp hạng, không giá, không phải lời giới thiệu sản phẩm.",
                    "Five kinds of AI tools found in hospitals: what each does, example products, what to check and who decides. No rankings, no prices, no endorsements."))
              + f'<div class="yt-loc" role="group" aria-label="{t("Lọc theo loại", "Filter by kind")}"><button type="button" class="chip" data-loc="" aria-pressed="true">{t("Tất cả", "All")}</button>'
              + "".join(f'<button type="button" class="chip" data-loc="{k}" aria-pressed="false">{esc(v)}</button>' for k, v in loai_ten.items())
              + f'</div>\n<div class="yt-ds-the" id="bd-ds">{the}</div>\n'
              + f'<p class="yt-luu-y">{t(f"Thông tin tra ngày {ngay_hien} từ trang tổng hợp và tài liệu của hãng. Số liệu do hãng công bố chưa được kiểm chứng độc lập. Tên sản phẩm thuộc về các công ty sở hữu; Mark học AI không liên kết hay được tài trợ bởi các công ty này.", f"Information checked on {ngay_hien} from industry round-ups and vendor material. Vendor figures are not independently verified. Product names belong to their owners; Mark học AI is not affiliated with or sponsored by them.")}</p>\n</section>')

    hoi = "".join(
        f'<fieldset class="yt-hoi" data-hoi="{x["id"]}"{" data-chan" if x["chan"] else ""}><legend><span class="yt-so">{k + 1}</span>{esc(chon(x["hoi"]))}</legend>'
        f'<p class="yt-goi-y">{esc(chon(x["goi_y"]))}</p><div class="yt-tl">'
        + "".join(f'<label><input type="radio" name="dg-{x["id"]}" value="{v}"> {nhan}</label>' for v, nhan in (("co", t("Có", "Yes")), ("chua", t("Chưa rõ", "Unclear")), ("khong", t("Không", "No"))))
        + f'</div><input type="text" class="yt-o yt-o-ghi" aria-label="{t("Ghi chú", "Notes")}" placeholder="{t("Ghi chú (không bắt buộc)", "Notes (optional)")}"></fieldset>' for k, x in enumerate(D["danh_gia"]))
    danh_gia = (dau("danh-gia", 7, "615", t("Sáu câu hỏi trước khi bệnh viện dùng một công cụ AI", "Six questions before your hospital adopts an AI tool"),
                    t("Điền khi có hãng giới thiệu công cụ mới. Giấy phép, dữ liệu và trách nhiệm là ba câu bắt buộc phải là Có. In ra để nộp cho hội đồng khoa hoặc phòng vật tư.",
                      "Fill it in when a vendor pitches a new tool. Licence, data and accountability must all be Yes. Print it for your department committee or procurement."))
                + f'''<div class="yt-hang yt-hang-o">
<label class="yt-lbl" for="dg-ten">{t("Tên công cụ", "Tool")}<input type="text" id="dg-ten" class="yt-o"></label>
<label class="yt-lbl" for="dg-hang">{t("Hãng", "Vendor")}<input type="text" id="dg-hang" class="yt-o"></label>
<label class="yt-lbl" for="dg-viec">{t("Định dùng cho việc gì", "Intended use")}<input type="text" id="dg-viec" class="yt-o"></label>
</div>
<div id="dg-phieu">{hoi}</div>
<div class="yt-ket" id="dg-ket" aria-live="polite"></div>
<div class="yt-hang"><button type="button" class="btn btn-chinh" data-in="tram-danh-gia">{t("In phiếu", "Print the form")}</button></div>
</section>''')

    nhan = {
        "da_chep": t("Đã chép ✓", "Copied ✓"), "khong_chep": t("Không chép được, hãy chọn chữ rồi chép tay.", "Couldn't copy: select the text and copy it manually."),
        "che_trong": t("Dán ghi chép vào ô bên trái trước.", "Paste some notes into the left box first."),
        "che_xong": t("Đã che {n} chỗ. Đọc lại một lượt trước khi chép.", "Hid {n} items. Read it through once before copying."),
        "che_khong": t("Không tìm thấy gì cần che. Vẫn nên đọc lại.", "Nothing found to hide. Still read it through."),
        "goi_y_ten": t("có thể là tên", "may be a name"),
        "loai": {"ten": t("HỌ TÊN", "NAME"), "ngay": t("NGÀY", "DATE"), "nam-sinh": t("NĂM SINH", "BIRTH YEAR"), "cccd": t("SỐ CCCD", "ID NO."),
                 "bhyt": t("SỐ BHYT", "INSURANCE NO."), "sdt": t("SĐT", "PHONE"), "email": "EMAIL", "ma": t("MÃ HỒ SƠ", "RECORD NO."),
                 "giuong": t("GIƯỜNG", "BED"), "dia-chi": t("ĐỊA CHỈ", "ADDRESS"), "them": t("ĐÃ CHE", "HIDDEN")},
        "mau_che": t("BN Nguyễn Văn Hùng, nam, sinh ngày 12/03/1968, giường số 14, mã BA: 24-018273.\nĐịa chỉ: số 45 đường Lê Lợi, phường Bến Thành, TP.HCM. SĐT người nhà (chị Trần Thị Mai): 0903 123 456.\nCCCD 079068001234, thẻ BHYT DN4797915123456.\nVào viện vì sốt 3 ngày, ho khạc đờm vàng. Sáng nay T 38,6 độ, mạch 102, SpO2 94%. Đã cấy máu, chờ kết quả.\n(Ca giả để thử công cụ.)",
                     "Patient Mr John Carter, male, DOB 12/03/1968, bed 14, MRN: 24-018273.\nAddress: 45 Elm Street, Springfield. Next of kin (Mrs Anna Carter): +44 7700 900123, anna.carter@example.com.\nNHS no. 943 476 5919.\nAdmitted with 3 days of fever and productive cough. This morning T 38.6, HR 102, SpO2 94%. Blood cultures sent, awaiting results.\n(Fictional case for testing.)"),
        "lenh_nhan": {"vai_tro": t("Vai trò", "Role"), "boi_canh": t("Bối cảnh", "Context"), "viec": t("Việc cần làm", "Task"), "dinh_dang": t("Định dạng", "Format"), "gioi_han": t("Giới hạn", "Limits")},
        "lenh_che": t("Tick ô xác nhận đã che thông tin để chép câu lệnh.", "Tick the box confirming you've removed identifying details to copy the prompt."),
        "lenh_mo": t("Ô Bối cảnh còn chữ trong ngoặc vuông: thay bằng nội dung thật (đã che) trước khi gửi.", "The Context box still has text in square brackets: replace it with your real (de-identified) content before sending."),
        "lenh_video": t("Video {v}", "Video {v}"),
        "soat_con": t("Còn {n} bước. Chưa dùng bản nháp này.", "{n} checks left. Don't use this draft yet."),
        "soat_xong": t("Đủ 5 bước: sẵn sàng dùng.", "All 5 checks done: ready to use."),
        "soat_duyet": t("Người duyệt: {ten}", "Reviewed by: {ten}"),
        "dh_cau": t("câu", "sentences"), "dh_dai": t("câu dài", "long sentences"), "dh_tn": t("thuật ngữ", "medical terms"), "dh_tb": t("chữ / câu (trung bình)", "words per sentence (avg)"),
        "dh_khong_tn": t("Không thấy thuật ngữ nào trong danh sách. Vẫn nên đọc lại.", "No listed terms found. Still read it through."),
        "dh_trong": t("Dán tờ hướng dẫn vào trước.", "Paste the leaflet text first."),
        "dh_tb_chung": [t("Bác/anh/chị nhắc lại giúp: về nhà mình cần làm những việc gì?", "In your own words, what do you need to do at home?"),
                        t("Có dấu hiệu nào thì mình phải đi khám ngay?", "Which signs mean you should get help straight away?"),
                        t("Có điều gì trong tờ này mình chưa rõ không?", "Is there anything in this leaflet that isn't clear?")],
        "dh_lenh": t("Viết lại tờ hướng dẫn dưới đây cho người lớn tuổi, đọc chậm, không quen thuật ngữ y khoa.\n- Câu ngắn dưới {n} chữ.\n- Thay các thuật ngữ sau bằng việc cụ thể: {tn}.\n- Giữ nguyên mọi con số, liều và mốc thời gian; không thêm lời khuyên mới. Chỗ nào không rõ thì ghi [HỎI BÁC SĨ].\n- Cuối bài thêm 3 câu hỏi teach-back.\n\n[DÁN TỜ HƯỚNG DẪN ĐÃ CHE THÔNG TIN]",
                     "Rewrite the leaflet below for an older adult who reads slowly and doesn't know medical terms.\n- Short sentences under {n} words.\n- Replace these terms with concrete, everyday words: {tn}.\n- Keep every number, dose and time exactly; add no new advice. Mark anything unclear [ASK THE DOCTOR].\n- End with 3 teach-back questions.\n\n[PASTE THE DE-IDENTIFIED LEAFLET]"),
        "dh_khong_co": t("(không có)", "(none)"),
        "mau_dh": t("Sau phẫu thuật, người bệnh cần tránh gắng sức trong 2 tuần đầu. Uống kháng sinh theo chỉ định, sau ăn no, ngày 2 lần sáng và tối, đủ 7 ngày, không tự ý ngưng thuốc kể cả khi đã hết sốt. Theo dõi vết mổ hằng ngày, nếu có dấu hiệu nhiễm trùng như sưng nóng đỏ đau hoặc có dịch tiết thì đến cơ sở y tế gần nhất. Hạn chế muối trong chế độ ăn. Tái khám sau 7 ngày để cắt chỉ, mang theo giấy ra viện.",
                    "Following surgery, the patient should avoid strenuous activity for the first two weeks. Take the antibiotic as indicated, after meals, twice daily for seven days, and do not stop even if the fever resolves. Monitor the incision daily and if there are signs of infection such as redness, heat, swelling, pain or discharge, attend the nearest health facility. Follow a low-sodium diet. Attend follow-up after seven days for suture removal and bring your discharge papers."),
        "qt_tieu": t("Quy tắc dùng AI", "AI use policy"), "qt_khoa_trong": t("[Tên khoa]", "[Department]"),
        "qt_cong_cu": t("Chỉ dùng các công cụ AI đã được bệnh viện cho phép", "Only use AI tools approved by the hospital"),
        "qt_duoc": t("Được dùng AI cho", "AI may be used for"), "qt_cam": t("Không được", "Not allowed"),
        "qt_luon": t("Luôn luôn", "Always"),
        "qt_luon_ds": [t("Che thông tin người bệnh trước khi dán vào AI.", "Remove identifying patient details before pasting into AI."),
                       t("Soát 5 bước: nguồn, con số và liều, đối tượng đặc biệt, thông tin định danh, người ký duyệt.", "Run the 5 checks: sources, numbers and doses, special groups, identifying details, sign-off."),
                       t("Ghi rõ bản nào có AI hỗ trợ soạn khi lưu vào hồ sơ.", "Note when AI helped draft anything filed in the record.")],
        "qt_duyet": t("Người duyệt bản cuối", "Final sign-off"), "qt_su_co": t("Báo sự cố", "Report incidents to"),
        "qt_su_co_them": t("Báo để cả khoa rút kinh nghiệm, không phải để trách ai.", "Report so the whole team learns, not to blame anyone."),
        "qt_ngay": t("Ban hành", "Issued"), "qt_ra_soat": t("rà soát lại sau {n} tháng", "review after {n} months"), "qt_chua": t("chưa điền", "not filled in"),
        "dg_chua": t("Còn {n} câu chưa trả lời.", "{n} questions still unanswered."),
        "dg_chan": t("Chưa nên dùng: câu {ds} là Không. Đây là điều kiện bắt buộc.", "Not ready: question {ds} is No. These are required."),
        "dg_chua_ro": t("Cần hỏi thêm hãng: câu {ds} chưa rõ. Chưa nên quyết định.", "Ask the vendor more: question {ds} is unclear. Don't decide yet."),
        "dg_thu": t("Đủ điều kiện dùng thử có kiểm soát ở một khoa trong vài tuần, đo thời gian và lỗi thật trước khi mở rộng.", "Ready for a controlled trial in one department for a few weeks; measure real time saved and errors before scaling up."),
        "dg_thu_luu_y": t("Lưu ý câu {ds} là Không: ghi rõ cách xử lý trong kế hoạch dùng thử.", "Note that question {ds} is No: plan how to handle it in the trial."),
    }
    du_lieu = json.dumps({"nhan": nhan, "lg": L, "mau_lenh": [{**{k: chon(v) for k, v in m.items()}} for m in D["mau_lenh"]],
                          "gioi_han_chung": chon(D["gioi_han_chung"]), "thuat_ngu": D["thuat_ngu"][L], "teach_back": D["teach_back"][L],
                          "duoc": duoc, "cam": cam, "danh_gia": [{"id": x["id"], "chan": x["chan"]} for x in D["danh_gia"]]},
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    tieu = t("Bộ công cụ AI cho người làm y tế: che thông tin người bệnh, câu lệnh mẫu, soát câu trả lời", "AI toolkit for healthcare staff: de-identify notes, prompt templates, check AI answers")
    desc = t("Bảy công cụ miễn phí theo series AI cho người làm y tế: che thông tin người bệnh trước khi dán vào AI, câu lệnh 5 phần cho 8 việc (SBAR, tờ hướng dẫn, biên bản, tóm tắt bài báo), soát 5 bước, viết cho người bệnh dễ hiểu, quy tắc dùng AI cho khoa, bản đồ công cụ AI y tế và phiếu đánh giá. Chạy trên trình duyệt, không gửi dữ liệu đi đâu.",
             "Seven free tools from the AI for healthcare staff series: de-identify patient notes before pasting into AI, 5-part prompts for 8 tasks (SBAR, leaflets, minutes, paper summaries), 5 checks, plain-language patient leaflets, a department AI policy, a map of healthcare AI tools and an assessment form. Runs in your browser; nothing is sent anywhere.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Công cụ · 7 trạm · chạy ngay trên trình duyệt", "Tools · 7 stations · run in your browser")}</p>\n'
            f'<h1>{t("AI cho người làm y tế", "AI for healthcare staff")}</h1>\n'
            f'<p class="lead">{t("Dùng AI cho phần chữ nghĩa của bệnh viện mà vẫn giữ bí mật người bệnh. AI soạn nháp, người làm y tế quyết định.", "Use AI for the paperwork side of healthcare while keeping patient information private. AI drafts; healthcare staff decide.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-giai-thich.svg" alt="" width="180" height="170"></div>')
    main = (f'<link rel="stylesheet" href="{p}assets/ai-y-te.css?v=dev">\n'
            f'<main class="yt" id="yt">\n'
            f'<p class="yt-canh">{t("Công cụ học tập, không phải thiết bị y tế. Không dùng để chẩn đoán, chỉ định hay kê đơn, và không thay hướng dẫn chuyên môn, phác đồ của cơ sở hay quy định của Bộ Y tế.", "A learning tool, not a medical device. Not for diagnosis, orders or prescribing, and no substitute for clinical guidelines, local protocols or your health authority's rules.")}</p>\n'
            f'{ngan}\n{che}\n{lenh}\n{soat}\n{de_hieu}\n{quy_tac}\n{ban_do}\n{danh_gia}\n'
            f'{khoi_chia_se(BASE + GOC + "ai-y-te.html", tieu, p)}\n'
            f'<noscript><p>{t("Công cụ cần JavaScript.", "These tools need JavaScript.")}</p></noscript>\n'
            f'<script type="application/json" id="yt-du-lieu">{du_lieu}</script>\n</main>')
    return GOC + "ai-y-te.html", trang("ai-y-te.html", f"{tieu} | {SITE}", desc, band, main, p, og_type="website", q="",
                                       cuoi=f'<script src="{p}ai-y-te.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

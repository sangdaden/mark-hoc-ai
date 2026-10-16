# ---------- Đồ in cho gia đình (do-in-gia-dinh.html): 4 tờ in theo video 141, 143, 422, 430 ----------
# Mỗi tờ: chơi hoặc chọn bên trái, tờ in xem trước bên phải, bấm In (hoặc lưu PDF). Nội dung ở data/do-in-gia-dinh.json,
# cách chơi ở do-in.js, CSS ở assets/tro-choi/do-in.css. Mở thẳng một tờ bằng ?to=<id>. Chạy chung không gian tên với tao_bai_viet.py.

# Hình xem trước trên thẻ "Chơi thử" của trang bài: một tờ giấy có dòng kẻ và nút In. Kiểu viết thẳng trong thẻ (style=)
# vì trang bài chỉ nạp style.css, không nạp CSS riêng của trò chơi.
HINH_CHOI["do-in"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center">'
    '<span style="position:relative;display:grid;gap:6px;width:62%;max-width:190px;padding:12px 14px 14px;border-radius:6px;background:#fff;'
    'box-shadow:0 6px 16px rgba(15,23,42,.18);transform:rotate(-3deg)">'
    f'<b style="font:800 12px/1.2 var(--f-display);color:#1D4ED8">{t("Luật dùng AI của nhà mình", "Our family AI rules")}</b>'
    + "".join(f'<span style="display:flex;gap:6px;align-items:center"><i style="flex:none;width:12px;height:12px;border-radius:50%;background:#DBEAFE;'
              f'font:800 8px/12px var(--f-body);font-style:normal;text-align:center;color:#1D4ED8">{i}</i>'
              f'<i style="height:5px;flex:1;border-radius:3px;background:#CBD5E1;max-width:{w}%"></i></span>' for i, w in ((1, 90), (2, 70), (3, 82)))
    + f'<span style="position:absolute;right:-14px;bottom:-12px;padding:5px 10px;border-radius:999px;background:#FACC15;color:#0F172A;'
      f'font:800 11px/1 var(--f-body);transform:rotate(3deg)">{t("In ra", "Print")}</span></span></span>')


@trang_rieng("do-in-gia-dinh.html", "0.7")
def tao_do_in():
    p = t("", "../")
    D = load("do-in-gia-dinh")
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x

    def video(so):
        v = co_bai.get(so)
        return {"so": so, "ten": seo.get(str(so), ""), "url": f"bai/{ten_file(v)}.html" if v else ""}

    def doi(x):
        # đổi mọi {"vi":..., "en":...} trong một phần thành chữ của ngôn ngữ đang tạo; "sua_en" thay "sua" ở bản Anh
        if isinstance(x, dict):
            if set(x) <= {"vi", "en"} and L in x:
                return x[L]
            kq = {k: doi(v) for k, v in x.items() if k not in ("sua_en", "vi", "en")}
            if ("vi" in x or "en" in x) and L in x:
                kq["chu"] = x[L]
            if L == "en" and "sua_en" in x:
                kq["sua"] = x["sua_en"]
            return kq
        if isinstance(x, list):
            return [doi(v) for v in x]
        return x

    to = []
    for x in D["to"]:
        y = doi(x)
        y["video"] = [video(so) for so in x["video"]]
        to.append(y)

    nhan = {
        "xem_video": t("Xem video", "Watch video"), "sap_ra": t("Video sắp ra", "Video coming soon"),
        "lam": t("Làm", "Make it"), "to_in": t("Tờ in", "Your printout"), "in": t("In tờ này", "Print this sheet"),
        "in_meo": t("Muốn gửi qua tin nhắn? Trong hộp in, chọn “Lưu thành PDF”.", "Want to send it by message? In the print dialog, choose “Save as PDF”."),
        "nguon": "markhocai.com · Mark học AI", "video": "Video",
        "dung": t("Đúng rồi!", "Got it!"), "chua": t("Chưa phải", "Not quite"),
        "tiep": t("Câu tiếp theo", "Next one"), "xong": t("Xong cả 3!", "All 3 done!"), "lam_lai": t("Chơi lại", "Play again"),
        "da_bat": t("lỗi đã bắt", "mistakes caught"), "lan_cham": t("lần chạm", "taps"),
        # bắt lỗi (141)
        "bl_hoi": t("Con hỏi AI", "Your child asks AI"), "bl_ai": t("AI trả lời", "AI answers"),
        "bl_huong": t("Một câu trong câu trả lời này sai. Chạm vào câu đó.", "One sentence in this answer is wrong. Tap it."),
        "bl_cau_dung": t("Câu này đúng. Dò câu khác xem.", "That one's right. Try another sentence."),
        "bl_su_that": t("Sự thật", "The fact"), "bl_kiem": t("Kiểm bằng cách", "How to check"),
        "bl_to_h": t("Phiếu bắt lỗi AI · 7 tối", "AI error hunt · 7 nights"),
        "bl_to_phu": t("Mỗi tối hỏi AI một câu, cả nhà cùng tìm chỗ sai. Ai bắt được thì tô một ô.", "Each night, ask AI one question and hunt for the mistake together. Whoever catches it colours a box."),
        "bl_nguoi": t("Người chơi", "Players"), "bl_nguoi_goi_y": [t("Mẹ", "Mom"), t("Bố", "Dad"), t("Con", "Kid"), ""],
        "bl_cot": [t("Tối", "Night"), t("Câu hỏi cho AI", "Question for AI"), t("AI sai ở đâu", "What AI got wrong"), t("Kiểm bằng", "Checked with")],
        "bl_kiem_ngan": {"nguon": t("Nguồn", "Source"), "sach": t("Sách", "Book"), "thay": t("Thầy cô", "Teacher")},
        "bl_vi_du": t("Ví dụ", "Example"), "bl_3_thoi_quen": t("3 thói quen kiểm tra AI", "3 habits for checking AI"),
        "bl_toi_nay": t("Tối nay thử: hỏi AI một câu về nơi nhà mình ở (món đặc sản, tên trường), rồi cùng xem đúng hay sai.",
                        "Tonight: ask AI about where you live (a local dish, a school's name) and check together whether it's right."),
        # luật trong nhà (143)
        "ln_ten_nha": t("Tên nhà mình", "Family name"), "ln_ten_goi_y": t("vd. Mai", "e.g. the Tran family"),
        "ln_chon": t("Chọn luật (tối đa 6)", "Pick rules (up to 6)"), "ln_4_goc": t("4 luật trong video", "The 4 rules from the video"), "ln_them": t("Thêm nếu cần", "Add if you like"),
        "ln_rieng": t("Luật riêng của nhà mình", "A rule of your own"), "ln_rieng_goi_y": t("vd. Hỏi AI xong thì kể cho cả nhà nghe", "e.g. Share what you asked AI at dinner"),
        "ln_du": t("Đủ 6 luật rồi. Bỏ bớt một luật để thêm luật khác.", "That's 6 rules. Remove one to add another."),
        "ln_nguoi": t("Ai ký tên", "Who signs"), "ln_nguoi_goi_y": t("Tên, cách nhau bằng dấu phẩy", "Names, separated by commas"),
        "ln_xem_lai": t("Ngày cả nhà xem lại", "Review date"), "ln_mau": t("Màu tờ in", "Colour"),
        "ln_mau_ds": [["xanh", t("Trời xanh", "Sky blue")], ["vang", t("Nắng vàng", "Sunny yellow")], ["la", t("Lá xanh", "Leaf green")]],
        "ln_to_h": t("Luật dùng AI của", "AI rules for"), "ln_to_h_trong": t("Luật dùng AI của nhà mình", "Our family AI rules"),
        "ln_ky": t("Cả nhà đồng ý", "We all agree"), "ln_hen": t("Cả nhà cùng xem lại vào ngày", "We'll review these together on"),
        "ln_so_luat": t("luật", "rules"),
        # sổ tay chữ to (422)
        "st_cho_ai": t("Sổ tay của", "Phone guide for"), "st_cho_ai_goi_y": t("vd. bà Năm", "e.g. Grandma"),
        "st_dien": t("Điền đúng máy của ông bà", "Fill in their phone's details"), "st_viec": t("Chọn việc ông bà hay làm", "Pick the tasks they use"),
        "st_co": t("Cỡ chữ khi in", "Print text size"), "st_buoc": t("bước", "steps"),
        "st_dong": t("Dòng ước tính", "Estimated lines"), "st_vua": t("Một trang A4 vừa khoảng", "One A4 page fits about"),
        "st_qua": t("Dài hơn một trang. Bỏ bớt việc ít dùng, hoặc chọn cỡ chữ nhỏ hơn (từ 16 trở lên).", "Longer than one page. Drop a rarely used task, or pick a smaller size (16 or more)."),
        "st_vua_1": t("Vừa một trang", "Fits on one page"), "st_khong": t("KHÔNG BAO GIỜ LÀM", "NEVER DO THIS"),
        "st_goi": t("Nghi ngờ thì gọi", "When in doubt, call"), "st_to_h": t("SỔ TAY ĐIỆN THOẠI CỦA", "PHONE GUIDE FOR"), "st_to_h_trong": t("ÔNG BÀ", "GRANDMA AND GRANDPA"),
        "st_meo": t("In xong, cầm máy của ông bà làm thử từng dòng. Dòng nào sai thì sửa rồi in lại.", "After printing, test every line on their actual phone. Fix anything wrong and print again."),
        "st_co_ghi": t("Chữ to cho người mắt kém thường từ cỡ 16 trở lên. Bản mẫu trong video dùng cỡ 20.", "Large print for low vision usually starts at size 16. The video's sample uses 20."),
        # bài toán sai (430)
        "bs_de": t("Đề", "Problem"), "bs_bai_vy": t("Bài làm của Vy", "Vy's work"), "bs_huong": t("Chạm vào bước sai ĐẦU TIÊN.", "Tap the FIRST wrong step."),
        "bs_dung_roi": t("Bước này đúng. Dò tiếp xuống dưới.", "This step is right. Keep going down."),
        "bs_sai_theo": t("Bước này sai thật, nhưng là sai theo bước trước. Tìm bước sai đầu tiên.", "This step is wrong, but only because of an earlier one. Find the first."),
        "bs_buoc": t("Bước", "Step"), "bs_goi_y": t("Câu gợi ý (chưa có đáp số)", "Hint question (no answer yet)"), "bs_xem_sua": t("Xem cách sửa", "Show the fix"),
        "bs_sua": t("Vy tự sửa", "Vy's fix"), "bs_nho": t("Ghi vào sổ lỗi", "Into the mistake log"),
        "bs_prompt_h": t("Câu dặn AI chấm bài, không giải hộ", "Prompt: AI marks your work, doesn't solve it"),
        "bs_prompt_meo": t("AI có thể đọc nhầm chữ viết tay. So đề nó chép lại với đề thật, và thử đáp số bằng máy tính cầm tay.", "AI can misread handwriting. Compare the problem it copied with the real one, and check the answer on a calculator."),
        "chep": t("Chép câu lệnh", "Copy prompt"), "da_chep": t("Đã chép!", "Copied!"),
        "bs_ten": t("Sổ lỗi của", "Mistake log for"), "bs_ten_goi_y": t("tên em", "your name"),
        "bs_dien_san": t("Ghi sẵn các lỗi vừa tìm được", "Pre-fill the mistakes you just found"),
        "bs_dong": t("Số dòng trống", "Blank rows"),
        "bs_to_h": t("SỔ LỖI TOÁN", "MATH MISTAKE LOG"),
        "bs_cot": [t("Ngày", "Date"), t("Dạng bài", "Topic"), t("Bước sai đầu tiên, vì sao", "First wrong step, and why"), t("Cách nhớ", "How to remember"), t("Làm lại", "Redo")],
        "bs_luat": t("Làm lại đúng 2 lần liên tiếp thì coi là đã chắc. Hỏi AI ba lần vẫn chưa hiểu thì mang câu đó hỏi thầy cô.",
                     "Right twice in a row counts as learned. Still stuck after asking AI three times? Take it to your teacher."),
    }
    du_lieu = json.dumps({"to": to, "nhan": nhan, "lg": L, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("4 tờ in miễn phí theo video Mark học AI: phiếu cùng con bắt lỗi AI, luật dùng AI trong nhà, sổ tay chữ to cho ông bà, sổ lỗi Toán. Chơi thử rồi in ra dán tủ lạnh.",
             "4 free printables from Mark học AI videos: an AI error hunt for kids, family AI rules, a large-print phone guide for grandparents and a math mistake log. Try it, then print it for the fridge.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Đồ in · 4 tờ · in hoặc lưu PDF", "Printables · 4 sheets · print or save as PDF")}</p>\n'
            f'<h1>{t("Đồ in cho gia đình", "Family printables")}</h1>\n'
            f'<p class="lead">{t("Chơi thử vài giây, chọn những gì hợp với nhà mình, rồi in ra một tờ dán tủ lạnh hay cạnh chỗ sạc điện thoại.", "Play for a moment, pick what fits your family, then print a sheet for the fridge or next to the phone charger.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-vui.svg" alt="" width="180" height="170"></div>')
    the = "".join(
        f'<button type="button" role="tab" class="di-tab" id="di-tab-{x["id"]}" aria-controls="di-khu" aria-selected="{"true" if i == 0 else "false"}" data-tab="{x["id"]}">'
        f'{ic(p, x["icon"])}<span><b>{esc(x["ngan"])}</b><small>{" · ".join("#" + str(v["so"]) for v in x["video"])}</small></span></button>'
        for i, x in enumerate(to))
    main = f"""<main class="di" id="di">
<div class="di-tabs" role="tablist" aria-label="{t("Chọn tờ in", "Pick a printable")}">{the}</div>
<div class="di-khu" id="di-khu" role="tabpanel"></div>
{khoi_chia_se(BASE + GOC + "do-in-gia-dinh.html", t("Đồ in cho gia đình: luật dùng AI trong nhà, sổ tay chữ to cho ông bà, phiếu bắt lỗi AI", "Family printables: AI rules for home, a large-print phone guide, an AI error hunt"), p)}
<p class="gh-ghi">{t("Mọi thứ bạn gõ chỉ nằm trên máy bạn, không gửi đi đâu và không lưu lại. Mọi nhân vật và câu trả lời của AI trên trang là ví dụ do kênh viết.", "Everything you type stays on your device; nothing is sent or saved. All characters and AI answers on this page are examples written by the channel.")}</p>
<noscript><p>{t("Trang này cần JavaScript để tạo tờ in.", "This page needs JavaScript to build the printouts.")}</p></noscript>
<script type="application/json" id="di-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "do-in-gia-dinh.html", trang("do-in-gia-dinh.html", t(f"Đồ in cho gia đình: luật AI trong nhà, sổ tay chữ to, phiếu bắt lỗi AI | {SITE}", f"Family printables: AI rules, large-print phone guide, AI error hunt | {SITE}"),
                                              desc, band, main, p, og_type="website", q="",
                                              cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/do-in.css?v=dev">\n<script src="{p}do-in.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

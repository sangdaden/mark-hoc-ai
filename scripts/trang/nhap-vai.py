# ---------- trò chơi "Nhập vai rẽ nhánh" (nhap-vai.html): phỏng vấn thử 230, nói chuyện lương 231, năm khách khó tính 258 + 377 ----------
# Nội dung ở data/nhap-vai.json (cả hai ngôn ngữ), cách chơi ở nhap-vai.js, CSS ở assets/tro-choi/nhap-vai.css.
# Mỗi vai có một hoặc nhiều lượt (vai khách: 5 khách). Mỗi lượt là một cây nút: nút có lời của người kia ("dong") và các lựa chọn;
# lựa chọn có lời đáp lại ("dap"), đổi thanh đo ("doi" cộng thêm, "dat" đặt hẳn), lời Bit nhận xét ("bit"), và "toi" nút kế (hoặc "het").
# Kết của lượt tính từ thanh đo theo "do.muc"; vai khách: lượt có lời hứa vượt chính sách ("hua") thì cao nhất là "vua".
# Mở thẳng một vai: nhap-vai.html?vai=phong-van|luong|khach (bài 230, 231, 258 tự mở đúng vai, xem data/tro-choi/nhap-vai.json).


def _kiem_nhap_vai(D):
    """Mọi lượt phải đi tới "het" từ nút đầu, không vòng lặp, không nút thừa: sai là dừng tạo trang."""
    for v in D["vai"]:
        for l in v["luot"]:
            nut, da = l["nut"], set()
            def di(k, duong):
                assert k in nut, f"nhap-vai: {v['id']} thiếu nút {k}"
                assert k not in duong, f"nhap-vai: {v['id']} vòng lặp ở {k}"
                da.add(k)
                assert nut[k]["chon"], f"nhap-vai: {v['id']} nút {k} không có lựa chọn"
                for c in nut[k]["chon"]:
                    if c["toi"] != "het":
                        di(c["toi"], duong | {k})
            di(l["dau"], set())
            assert da == set(nut), f"nhap-vai: {v['id']} có nút không tới được: {set(nut) - da}"


@trang_rieng("nhap-vai.html", "0.7")
def tao_nhap_vai():
    p = t("", "../")
    D = load("nhap-vai")
    _kiem_nhap_vai(D)
    L = LG
    chu = lambda x: x[L] if isinstance(x, dict) and L in x else x
    def sau(x):  # dịch mọi {"vi","en"} lồng bên trong
        if isinstance(x, dict):
            return x[L] if set(x) == {"vi", "en"} else {k: sau(y) for k, y in x.items()}
        if isinstance(x, list):
            return [sau(y) for y in x]
        return x
    vai = []
    for v in D["vai"]:
        x = sau({k: y for k, y in v.items() if k != "video"})
        x["video"] = [{"so": so, "ten": seo[str(so)], "url": f"bai/{ten_file(co_bai[so])}.html"} for so in v["video"] if so in co_bai]
        vai.append(x)
    nhan = {
        "luot": t("Khách", "Customer"), "ban": t("Bạn", "You"), "ban_chon": t("Bạn nói gì?", "What do you say?"), "dang_noi": t("Đang nhập…", "Typing…"),
        "bit": t("Bit nhận xét", "Bit's note"), "tiep": t("Tiếp", "Continue"), "khach_tiep": t("Khách tiếp theo", "Next customer"),
        "xem_ket": t("Xem kết quả", "See your result"), "het": t("Kết thúc", "The end"),
        "duong_di": t("Các câu bạn đã chọn", "The lines you picked"), "yeu_nhat": t("Câu yếu nhất, ghi lại để tập", "Your weakest line: note it and practise"),
        "tap_that": t("Tập tiếp với AI thật", "Practise with a real AI"), "tap_meo": t("Chép prompt này vào chatbot bạn hay dùng. Thay chỗ trong ngoặc vuông bằng thông tin của bạn.", "Paste this prompt into your usual chatbot. Replace the parts in square brackets with your own details."),
        "chep": t("Chép prompt", "Copy prompt"), "da_chep": t("Đã chép", "Copied"), "xem_video": t("Xem video", "Watch video"),
        "choi_lai": t("Chơi lại vai này", "Replay this role"), "vai_khac": t("Thử vai khác", "Try another role"),
        "khach_nguoi": t("khách nguội trong 5 khách", "of 5 customers calmed down"), "khach_hua": t("lời hứa vượt chính sách", "promises beyond policy"),
        "an_tuong": t("điểm ấn tượng", "impression score"), "luong_chot": t("lương chốt", "final salary"),
        "doi_vai": t("Đổi vai", "Switch role"), "hua": t("Hứa vượt chính sách", "Promise beyond policy"), "tien": t("Lượt", "Turn"),
    }
    du_lieu = json.dumps({"vai": vai, "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    the_vai = ""
    for v in vai:
        so = " · ".join(f"#{x['so']}" for x in v["video"])
        chan = f'<span>Video {so}</span>' if so else ""
        nguoi = "".join(f'<span class="nv-av nv-av-nho">{esc(l["nguoi"]["av"])}</span>' for l in v["luot"])
        the_vai += (f'<a class="nv-the nv-mau-{v["mau"]}" href="?vai={v["id"]}" data-vai="{v["id"]}">'
                    f'<span class="nv-the-hinh" aria-hidden="true"><span class="nv-the-nguoi">{nguoi}</span><span class="nv-the-do nv-do-{v["do"]["kieu"]}"><i></i></span></span>'
                    f'<b class="nv-the-ten">{esc(v["ten"])}</b><span class="nv-the-moi">{esc(v["moi"])}</span>'
                    f'<span class="nv-the-chan">{chan}<span class="nv-the-nut">{t("Vào vai", "Play")} ›</span></span></a>')
    desc = t("Trò chơi miễn phí: phỏng vấn thử, nói chuyện lương và trả lời năm khách khó tính. Chọn từng câu, xem người kia đổi thái độ ra sao, Bit nhận xét từng lựa chọn, rồi lấy prompt để tập tiếp với AI.",
             "Free game: a mock interview, a salary talk and five tough customers. Pick each line, watch the other person react, get Bit's note on every choice, then grab a prompt to keep practising with AI.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 3 vai · chơi trên điện thoại", "Game · 3 roles · works on your phone")}</p>\n'
            f'<h1>{t("Nhập vai rẽ nhánh", "Branching role-play")}</h1>\n'
            f'<p class="lead">{t("Tập trước những cuộc nói chuyện khó: phỏng vấn, deal lương, khách đang giận. Mỗi câu bạn chọn làm câu chuyện rẽ sang hướng khác.", "Rehearse the tough conversations: a job interview, a salary talk, an angry customer. Every line you pick sends the story a different way.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="nv" id="nv">
<div class="nv-chon-vai" id="nv-chon-vai">{the_vai}</div>
<section class="nv-san" id="nv-san" hidden aria-live="polite"></section>
<section class="nv-ket" id="nv-ket" hidden aria-live="polite"></section>
{khoi_chia_se(BASE + GOC + "nhap-vai.html", t("Nhập vai rẽ nhánh: tập phỏng vấn, deal lương, trả lời khách khó tính", "Branching role-play: practise interviews, salary talks and tough customers"), p)}
<p class="ld-ghi">{t("Mọi người, công ty, tiệm và con số lương trong trò chơi đều là hư cấu để luyện tập.", "All people, companies, shops and salary figures in this game are made up for practice.")}
{t("Lựa chọn của bạn chỉ nằm trên máy bạn, không gửi đi đâu.", "Your choices stay on your device.")}</p>
<noscript><p>{t("Trò chơi cần JavaScript. Bạn vẫn có thể xem video", "The game needs JavaScript. You can still watch")} <a href="bai/{ten_file(co_bai[230])}.html">{esc(seo["230"])}</a>.</p></noscript>
<script type="application/json" id="nv-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "nhap-vai.html", trang("nhap-vai.html", t(f"Nhập vai rẽ nhánh: phỏng vấn, deal lương, khách khó tính | {SITE}", f"Branching role-play: interviews, salary talks, tough customers | {SITE}"),
                                        desc, band, main, p, og_type="website", q="",
                                        cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/nhap-vai.css?v=dev">\n<script src="{p}nhap-vai.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')


# Hình xem trước trên thẻ "Chơi thử" trong bài: tin nhắn khách giận, thanh tâm trạng, hai câu đáp (style nội tuyến vì trang bài không nạp CSS riêng của trò)
HINH_CHOI["nhap-vai"] = lambda: (
    f'<span class="ct-hinh ct-ld" aria-hidden="true"><span class="ct-tin">{t("Hẹn thứ Tư, giờ thứ Sáu vẫn chưa thấy hàng!!!", "Promised Wednesday, it&#39;s Friday and still nothing!!!")}</span>'
    '<span style="display:block;position:relative;height:8px;border-radius:999px;background:linear-gradient(90deg,#F87171,#FACC15,#4ADE80)">'
    '<span style="position:absolute;left:62%;top:-4px;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #0F172A"></span></span>'
    f'<span class="ct-chon"><span class="ct-gia">{t("Theo quy định…", "Per our policy…")}</span><span>{t("Em xin lỗi chị…", "I&#39;m so sorry…")}</span></span></span>')

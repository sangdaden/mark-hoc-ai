# ---------- trò chơi "Đường đoán chữ" (duong-doan-chu.html): game G3 của "Thế giới game Mark" ----------
# Đi cảnh nhảy bục chữ: mỗi bục là một chữ có thể đứng sau, bục càng rộng chữ càng hay gặp, nút nhiệt độ đổi độ rộng
# (video 7 chatbot đoán chữ, 24, 8 ảo giác). Màn chơi ở data/duong-doan-chu.json, cách chơi ở duong-doan-chu.js,
# CSS riêng ở assets/tro-choi/duong-doan-chu.css; khung toàn màn hình dùng chung class .pl-* của Mark phiêu lưu.
# Trang có manifest riêng (duong-doan-chu.webmanifest) để "Thêm vào MH chính" mở thẳng game toàn màn hình.


@trang_rieng("duong-doan-chu.html", "0.7")
def tao_duong_doan_chu():
    p = t("", "../")
    D = load("duong-doan-chu")
    L = LG
    man = [{"id": m["id"], "ten": m["ten"][L], "dau": m["dau"][L], "cuoi": m["cuoi"][L],
            "buoc": [{"truoc": b["truoc"][L], "chu": [{"chu": c[L], "p": c["p"], **({"bia": True} if c.get("bia") else {})} for c in b["chu"]]}
                     for b in m["buoc"]]} for m in D["man"]]
    v7 = co_bai[7]
    nhan = {
        "nhiet": t("Nhiệt độ", "Temperature"), "vucTen": t("ẢO GIÁC", "HALLUCINATION"),
        "lac": t("Chữ này lạ quá…", "That word makes no sense…"),
        "phoBien": t("Chữ hay gặp", "Common word"), "sangTao": t("Sáng tạo", "Creative"),
        "aoGiac": t("Rơi xuống Ảo giác!", "You fell into Hallucination!"),
        "aoGiacBia": t("Ảo giác! Chữ vô nghĩa thì câu sập", "Hallucination! A nonsense word breaks the sentence"),
        "nhietThap": t("Nhiệt độ thấp: bục hay gặp phình to, bục hiếm mờ đi", "Low temperature: common words grow, rare ones fade"),
        "nhietVua": t("Nhiệt độ 1: bục đúng theo tỉ lệ ban đầu", "Temperature 1: platforms match the real odds"),
        "nhietCao": t("Nhiệt độ cao: bục gần bằng nhau, rung, chữ lạ hiện ra", "High temperature: platforms even out, shake, odd words appear"),
        "toanVao": t("Chơi toàn màn hình", "Play full screen"), "toanRa": t("Thoát toàn màn hình", "Exit full screen"), "dong": t("Đóng", "Close"),
        "meoIos": t("Mẹo iPhone: bấm nút Chia sẻ rồi chọn “Thêm vào MH chính”. Mở game từ biểu tượng đó sẽ không còn thanh Safari che.",
                    "iPhone tip: tap Share, then “Add to Home Screen”. Open the game from that icon to play without Safari’s bars."),
        "y1": t("Bục rộng = chữ hay gặp", "Wide platform = common word"),
        "y1c": t("Nhảy lên bục để chọn chữ tiếp theo, như chatbot.", "Jump onto a platform to pick the next word, like a chatbot."),
        "y2": t("Nút 🌡 đổi nhiệt độ", "🌡 changes the temperature"),
        "y2c": t("Cao thì chữ lạ to ra, nhưng bục rung.", "Higher makes rare words bigger, but platforms shake."),
        "y3": t("Dưới vực là Ảo giác", "Below is Hallucination"),
        "y3c": t("Chữ vô nghĩa đứng lên là vỡ.", "Nonsense words crumble under you."),
        "batDau": t("Bắt đầu", "Start"), "daChoi": t("lần trước", "last time"),
        "qua": t("Viết xong câu!", "Sentence finished!"),
        "s1": t("Đi hết câu", "Finish the sentence"), "s2": t("Không rơi xuống Ảo giác", "Never fall into Hallucination"),
        "cauBan": t("Câu của bạn", "Your sentence"), "cauMay": t("Chatbot ở nhiệt độ thấp sẽ viết", "A chatbot at low temperature writes"),
        "bitDau": t("Chatbot cũng đi đúng như vậy", "That's exactly how a chatbot works"),
        "bitChu": t("Mỗi bước nó chọn một chữ theo tỉ lệ đã học. Nhiệt độ thấp thì luôn chọn chữ hay gặp nhất: an toàn nhưng câu nào cũng giống nhau. Nhiệt độ cao thì câu sáng tạo hơn, nhưng dễ chọn trúng chữ vô nghĩa: đó là lúc AI bịa.",
                    "At every step it picks one word by the odds it learned. Low temperature always takes the most common word: safe, but every answer sounds the same. High temperature is more creative, but it can land on a word that makes no sense: that's when AI makes things up."),
        "thua": t("Hết tim rồi", "Out of hearts"),
        "thuaBia": t("Bit nhắn: bục chữ vô nghĩa nào cũng vỡ. Thử hạ nhiệt độ xuống, chữ lạ sẽ mờ đi.", "Bit says: nonsense words always crumble. Try a lower temperature so the odd words fade away."),
        "thuaChu": t("Bit nhắn: bục rộng dễ đứng hơn. Thử lại nhé!", "Bit says: wide platforms are easier to land on. Try again!"),
        "lai": t("Chơi lại", "Play again"), "xemVideo": t("Xem video Chatbot đoán chữ", "Watch the next-word video"),
        "phongNao": t("Tự đoán chữ ở Phòng bộ não", "Guess words in the Brain Lab"),
        "manSo": t("Màn {n}", "Level {n}"),  # {n} do duong-doan-chu.js thay
        "s3": t("Câu sáng tạo: ít nhất 2 chữ không phải chữ hay gặp nhất (bạn có {n})", "Creative sentence: at least 2 words that aren't the most common one (you have {n})"),
    }
    du_lieu = json.dumps({"man": man, "nhan": nhan, "p": p, "video": f"{p}bai/{ten_file(v7)}.html"}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Game miễn phí: nhảy qua các bục chữ để viết câu đúng cách chatbot đoán chữ tiếp theo. Bục càng rộng chữ càng hay gặp, kéo nhiệt độ lên thì chữ lạ to ra và dễ rơi xuống Ảo giác. Chơi ngay trên điện thoại.",
             "Free game: jump across word platforms to write a sentence the way a chatbot guesses the next word. Wider platforms are more common words; turn up the temperature and odd words grow, and so does the risk of falling into Hallucination. Plays on your phone.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Game miễn phí · bản thử màn 1", "Free game · level 1 preview")}</p>\n'
            f'<h1>{t("Đường đoán chữ", "The Next-Word Road")}</h1>\n'
            f'<p class="lead">{t("Mark viết câu bằng cách nhảy lên bục chữ, y như chatbot đoán chữ tiếp theo. Bục rộng là chữ hay gặp. Đổi nhiệt độ để xem câu sáng tạo hơn hay bịa hơn.", "Mark writes a sentence by jumping onto word platforms, just like a chatbot guessing the next word. Wide platforms are common words. Change the temperature and see whether the sentence gets more creative or more made up.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-chao.svg" alt="" width="180" height="170"></div>')
    main = f"""<main class="pl pl-game ddc" id="ddc">
  <div class="pl-khung ddc-khung" id="ddc-khung">
    <canvas class="pl-canvas" id="ddc-canvas" tabindex="0" aria-label="{t("Màn hình game", "Game screen")}"></canvas>
    <div class="pl-nut-tren"><button type="button" class="pl-toan" id="ddc-toan" aria-label="{t("Chơi toàn màn hình", "Play full screen")}" aria-pressed="false"></button></div>
    <div class="pl-man" id="ddc-man"></div>
  </div>
  <div class="pl-dk ddc-dk" id="ddc-dk" role="group" aria-label="{t("Nút điều khiển", "Controls")}"><button type="button" data-k="trai" aria-label="{t("Sang trái", "Left")}">◀</button><button type="button" data-k="phai" aria-label="{t("Sang phải", "Right")}">▶</button><button type="button" data-k="nhiet" class="ddc-nhiet" id="ddc-nhiet" aria-label="{t("Đổi nhiệt độ", "Change temperature")}">🌡</button><button type="button" data-k="nhay" class="is-nhay">{t("Nhảy", "Jump")}</button></div>
  <p class="pl-huong"><b>{t("Cách chơi:", "How to play:")}</b> {t("phím ← → hoặc A D để chạy, Space hoặc ↑ để nhảy, T để đổi nhiệt độ. Trên điện thoại, game tự chuyển sang toàn màn hình nằm ngang, bạn cầm ngang máy và dùng các nút trên màn hình.", "← → or A D to run, Space or ↑ to jump, T to change the temperature. On a phone the game switches to landscape full screen; hold your phone sideways and use the on-screen buttons.")}</p>
  <p class="pl-ghi">{t("Tỉ lệ trên các bục là ví dụ minh họa cho dễ chơi. Tiến độ lưu trên trình duyệt này, không gửi đi đâu.", "The odds on the platforms are simplified examples. Progress stays in this browser.")}</p>
  <noscript><p>{t("Game cần JavaScript. Bạn vẫn có thể", "The game needs JavaScript. You can still")} <a href="phong-thi-nghiem-bo-nao.html?tram=doan-chu">{t("đoán chữ ở Phòng bộ não", "guess words in the Brain Lab")}</a>.</p></noscript>
  <script type="application/json" id="ddc-du-lieu">{du_lieu}</script>
</main>"""
    html = trang("duong-doan-chu.html", t(f"Đường đoán chữ: game chatbot đoán chữ tiếp theo | {SITE}", f"The Next-Word Road: a game about how chatbots guess | {SITE}"),
                 desc, band, main, p, hien_tai="game", og_type="website", q="",
                 cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/duong-doan-chu.css?v=dev">\n<script src="{p}duong-doan-chu.js?v=dev" defer></script>\n')
    # Manifest riêng: "Thêm vào MH chính" mở thẳng game, toàn màn hình, nằm ngang (như phieu-luu.html)
    html = html.replace(f'<link rel="manifest" href="{p}site.webmanifest">',
                        '<link rel="manifest" href="duong-doan-chu.webmanifest">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
                        f'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="{t("Đường đoán chữ", "Next-Word Road")}">', 1)
    return GOC + "duong-doan-chu.html", html

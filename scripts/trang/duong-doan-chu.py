# ---------- trò chơi "Đường đoán chữ" (duong-doan-chu.html): game G3 của "Thế giới game Mark" ----------
# Câu cá chữ: mỗi đàn cá là một chữ có thể đứng sau, chữ càng hay gặp đàn càng đông, nút nhiệt độ khuấy hồ đổi số cá
# (video 7 chatbot đoán chữ, 24, 8 ảo giác). Màn chơi ở data/duong-doan-chu.json, cách chơi ở duong-doan-chu.js,
# CSS riêng ở assets/tro-choi/duong-doan-chu.css, thẻ "Chơi thử" trong bài ở data/tro-choi/duong-doan-chu.json; khung toàn màn hình dùng chung class .pl-* của Mark phiêu lưu.
# Trang có manifest riêng (duong-doan-chu.webmanifest) để "Thêm vào MH chính" mở thẳng game toàn màn hình.

# Hình xem trước trên thẻ "Chơi thử" trong bài: câu đang viết dở, ba con cá chữ (đàn hay gặp đông hơn), một cá rác.
HINH_CHOI["duong-doan-chu"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;gap:6px;align-content:center;background:linear-gradient(#7DD3FC 0 30%,#0EA5E9 30%,#0C4A6E);border-radius:14px;padding:8px 10px">'
    f'<span style="justify-self:center;padding:2px 8px;border-radius:8px;background:#fff;color:#0F172A;font:700 12px/1.3 var(--f-display)">{t("Hôm nay trời rất …", "Today the weather is very …")}</span>'
    '<span style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center">'
    + "".join(f'<span style="padding:2px 9px;border-radius:999px;background:{m};color:{c};font:700 11.5px/1.4 var(--f-body)">{w}</span>'
              for w, m, c in [(t("đẹp", "nice"), "#2563EB", "#fff"), (t("đẹp", "nice"), "#2563EB", "#fff"), (t("nóng", "hot"), "#0EA5E9", "#fff"),
                              (t("lạnh", "cold"), "#64748B", "#fff"), (t("cá?", "banana?"), "#4C1D95", "#FCA5A5")])
    + '</span></span>')


@trang_rieng("duong-doan-chu.html", "0.7")
def tao_duong_doan_chu():
    p = t("", "../")
    D = load("duong-doan-chu")
    L = LG
    man = [{"id": m["id"], "ten": m["ten"][L], "dau": m["dau"][L], "cuoi": m["cuoi"][L],
            **({"meo": m["meo"][L]} if m.get("meo") else {}), **({"giau": True} if m.get("giau") else {}), **({"toc": m["toc"]} if m.get("toc") else {}),
            "buoc": [{"truoc": b["truoc"][L], "chu": [{"chu": c[L], "p": c["p"], **({"bia": True} if c.get("bia") else {})} for c in b["chu"]]}
                     for b in m["buoc"]]} for m in D["man"]]
    v7 = co_bai[7]
    nhan = {
        "goiY": t("Chạm xuống hồ để thả câu", "Tap the lake to cast your line"),
        "phoBien": t("Chữ hay gặp", "Common word"), "sangTao": t("Sáng tạo", "Creative"),
        "aoGiac": t("Câu phải cá rác: ảo giác!", "You hooked a junk fish: hallucination!"),
        "nhietThap": t("Nhiệt độ thấp: đàn cá chữ hay gặp đông hơn, cá chữ hiếm lặn mất", "Low temperature: common-word fish multiply, rare ones vanish"),
        "nhietVua": t("Nhiệt độ 1: số cá đúng theo tỉ lệ ban đầu", "Temperature 1: the fish match the real odds"),
        "nhietCao": t("Nhiệt độ cao: hồ khuấy lên, cá bơi loạn, cá rác nổi lên", "High temperature: the lake churns, fish dart around, junk fish surface"),
        "toanVao": t("Chơi toàn màn hình", "Play full screen"), "toanRa": t("Thoát toàn màn hình", "Exit full screen"), "dong": t("Đóng", "Close"),
        "meoIos": t("Mẹo iPhone: bấm nút Chia sẻ rồi chọn “Thêm vào MH chính”. Mở game từ biểu tượng đó sẽ không còn thanh Safari che.",
                    "iPhone tip: tap Share, then “Add to Home Screen”. Open the game from that icon to play without Safari’s bars."),
        "y1": t("Đàn cá đông = chữ hay gặp", "Big school = common word"),
        "y1c": t("Câu một con cá để chọn chữ tiếp theo, như chatbot.", "Hook a fish to pick the next word, like a chatbot."),
        "y2": t("Nút 🌡 khuấy hồ", "🌡 stirs the lake"),
        "y2c": t("Nóng thì cá chữ lạ đông hơn, nhưng bơi loạn.", "Hotter brings more rare-word fish, but they dart around."),
        "y3": t("Coi chừng cá rác", "Watch out for junk fish"),
        "y3c": t("Chữ vô nghĩa là ảo giác, mất một tim.", "A nonsense word is a hallucination: you lose a heart."),
        "batDau": t("Bắt đầu", "Start"), "daChoi": t("lần trước", "last time"),
        "qua": t("Viết xong câu!", "Sentence finished!"),
        "s1": t("Viết hết câu", "Finish the sentence"), "s2": t("Không câu phải cá rác", "No junk fish hooked"),
        "cauBan": t("Câu của bạn", "Your sentence"), "cauMay": t("Chatbot ở nhiệt độ thấp sẽ viết", "A chatbot at low temperature writes"),
        "bitDau": t("Chatbot cũng câu chữ đúng như vậy", "That's exactly how a chatbot picks words"),
        "bitChu": t("Mỗi bước nó bốc một chữ theo tỉ lệ đã học, như thả câu vào hồ: chữ nào đông thì dễ trúng. Nhiệt độ thấp thì gần như luôn ra chữ hay gặp nhất: an toàn nhưng câu nào cũng giống nhau. Nhiệt độ cao thì câu sáng tạo hơn, nhưng dễ bốc trúng chữ vô nghĩa: đó là lúc AI bịa.",
                    "At every step it draws one word by the odds it learned, like casting into a lake: the bigger the school, the likelier the catch. Low temperature almost always lands the most common word: safe, but every answer sounds the same. High temperature is more creative, but it can hook a word that makes no sense: that's when AI makes things up."),
        "thua": t("Hết tim rồi", "Out of hearts"),
        "thuaChu": t("Bit nhắn: cá rác chỉ đông lên khi hồ nóng. Thử hạ nhiệt độ xuống rồi câu lại nhé!", "Bit says: junk fish only show up when the lake is hot. Turn the temperature down and try again!"),
        "lai": t("Chơi lại", "Play again"), "xemVideo": t("Xem video Chatbot đoán chữ", "Watch the next-word video"),
        "phongNao": t("Tự đoán chữ ở Phòng bộ não", "Guess words in the Brain Lab"),
        "manSo": t("Màn {n}", "Level {n}"),  # {n} do duong-doan-chu.js thay
        "manTiep": t("Màn tiếp", "Next level"), "chonMan": t("Chọn màn", "Pick a level"), "khoa": t("Thắng màn trước để mở", "Win the previous level to unlock"),
        "hetMan": t("Bạn đã chơi hết {n} màn! Thử lại ở nhiệt độ khác xem câu đổi ra sao.", "You've finished all {n} levels! Replay at another temperature and see how the sentence changes."),
        "s3": t("Câu sáng tạo: ít nhất 2 chữ không phải chữ hay gặp nhất (bạn có {n})", "Creative sentence: at least 2 words that aren't the most common one (you have {n})"),
    }
    du_lieu = json.dumps({"man": man, "nhan": nhan, "p": p, "video": f"{p}bai/{ten_file(v7)}.html"}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Game miễn phí: thả câu xuống hồ cá chữ để viết câu đúng cách chatbot đoán chữ tiếp theo. Chữ càng hay gặp thì đàn cá càng đông, tăng nhiệt độ thì cá chữ lạ đông lên và dễ câu phải cá rác ảo giác. Chơi ngay trên điện thoại.",
             "Free game: cast into a lake of word fish to write a sentence the way a chatbot guesses the next word. Common words swim in big schools; turn up the temperature and rare words multiply, and so do the junk fish of hallucination. Plays on your phone.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t(f"Game miễn phí · {len(D['man'])} màn", f"Free game · {len(D['man'])} levels")}</p>\n'
            f'<h1>{t("Đường đoán chữ", "The Next-Word Road")}</h1>\n'
            f'<p class="lead">{t("Mark câu từng chữ trong hồ để viết câu, y như chatbot đoán chữ tiếp theo. Chữ hay gặp thì cá đông. Khuấy nhiệt độ để xem câu sáng tạo hơn hay bịa hơn.", "Mark fishes one word at a time to write a sentence, just like a chatbot guessing the next word. Common words come in big schools. Stir the temperature and see whether the sentence gets more creative or more made up.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/game/duong-doan-chu.webp" alt="{t("Mark ra dấu OK, Bit bay bên cạnh", "Mark making an OK sign, Bit flying beside him")}" width="200" height="189"></div>')
    main = f"""<main class="pl pl-game ddc" id="ddc">
  <div class="pl-khung ddc-khung" id="ddc-khung">
    <canvas class="pl-canvas" id="ddc-canvas" tabindex="0" aria-label="{t("Màn hình game", "Game screen")}"></canvas>
    <div class="pl-nut-tren"><button type="button" class="pl-toan" id="ddc-toan" aria-label="{t("Chơi toàn màn hình", "Play full screen")}" aria-pressed="false"></button></div>
    <div class="pl-man" id="ddc-man"></div>
  </div>
  <div class="pl-dk ddc-dk" id="ddc-dk" role="group" aria-label="{t("Nút điều khiển", "Controls")}"><button type="button" data-k="nhiet" class="ddc-nhiet" id="ddc-nhiet" aria-label="{t("Đổi nhiệt độ", "Change temperature")}">🌡</button></div>
  <p class="pl-huong"><b>{t("Cách chơi:", "How to play:")}</b> {t("chạm hoặc bấm chuột xuống hồ để thả câu ở chỗ đó, Space để thả câu, T để đổi nhiệt độ. Trên điện thoại, game tự chuyển sang toàn màn hình nằm ngang, bạn cầm ngang máy rồi chạm thẳng xuống hồ.", "tap or click the lake to cast there, Space to cast, T to change the temperature. On a phone the game switches to landscape full screen; hold your phone sideways and tap the lake.")}</p>
  <p class="pl-ghi">{t("Tỉ lệ số cá là ví dụ minh họa cho dễ chơi. Tiến độ lưu trên trình duyệt này, không gửi đi đâu.", "The fish odds are simplified examples. Progress stays in this browser.")}</p>
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

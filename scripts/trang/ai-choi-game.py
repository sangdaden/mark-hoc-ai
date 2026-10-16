# ---------- "AI chơi game" (ai-choi-game.html): series "AI chơi game giỏi thế nào", video 434 và 437 ----------
# Hai trạm: ?tram=caro (434: đánh caro 3x3 với máy, kéo thanh "nhìn trước mấy nước")
#           ?tram=thuyen (437: tự đặt luật thưởng cho game đua thuyền, xem AI lách luật để ăn điểm).
# Số liệu khớp kịch bản 434-437 (videos/ke-hoach-408-422/thuc-hanh-ai-choi-game/ket-qua/). Cách chơi ở ai-choi-game.js,
# giao diện ở assets/ai-choi-game.css, thẻ "Chơi thử" trong bài ở data/tro-choi/ai-choi-caro.json và ai-choi-thuyen.json.

HINH_CHOI["ai-caro"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;place-items:center;gap:6px">'
    '<span style="display:grid;grid-template-columns:repeat(3,22px);gap:3px;font:800 15px/22px var(--f-display);text-align:center">'
    + "".join(f'<span style="background:var(--panel);border:1.5px solid var(--edge);border-radius:5px;color:{c}">{v}</span>'
              for v, c in [("X", "var(--blue)"), ("", ""), ("O", "#EA580C"), ("", ""), ("O", "#EA580C"), ("", ""), ("+1", "var(--mint-dam)"), ("", ""), ("X", "var(--blue)")])
    + f'</span><span style="font:600 11px/1 var(--f-mono);color:var(--muted)">{t("Máy nhìn trước", "Looks ahead")} ━━●━ 9</span></span>')

HINH_CHOI["ai-thuyen"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="display:grid;place-items:center;gap:6px">'
    '<svg viewBox="0 0 120 54" width="120" height="54"><circle cx="34" cy="22" r="16" fill="none" stroke="var(--sky)" stroke-width="3" stroke-dasharray="5 4"/>'
    '<path d="M6 46H112" stroke="var(--edge)" stroke-width="3"/><path d="M106 38h8v8h-8z" fill="var(--ink)"/>'
    '<circle cx="34" cy="6" r="3.5" fill="var(--yellow)"/><circle cx="18" cy="26" r="3.5" fill="var(--yellow)"/><circle cx="50" cy="26" r="3.5" fill="var(--yellow)"/>'
    '<path d="M26 34l10 0-2 4h-6z" fill="#EA580C"/></svg>'
    f'<span style="font:700 12px/1 var(--f-mono);color:var(--ink)">{t("Điểm", "Score")} 860 · {t("về đích", "finish")} ✗</span></span>')


@trang_rieng("ai-choi-game.html", "0.7")
def tao_ai_choi_game():
    p = t("", "../")
    nf = (lambda n: f"{n:,}".replace(",", ".")) if LG != "en" else (lambda n: f"{n:,}")

    tram = [("caro", "434", t("Caro với máy", "Tic-tac-toe vs the computer"), t("Kéo thanh nhìn trước", "Drag the look-ahead")),
            ("thuyen", "437", t("Thuyền đua lách luật", "The boat that games the rules"), t("Tự đặt luật thưởng", "Write the reward rule"))]
    ngan = (f'<nav class="ag-ngan" aria-label="{t("Các trạm", "Stations")}">' +
            "".join(f'<button type="button" class="ag-nut" data-tram="{i}" aria-controls="tram-{i}"><span class="ag-nut-so">{so}</span>'
                    f'<span><b>{ten}</b><small>{t("Video", "Video")} {so} · {phu}</small></span></button>' for i, so, ten, phu in tram) + '</nav>')

    o_so = lambda so, nhan, cls="": f'<div class="ag-o {cls}"><b>{so}</b><span>{nhan}</span></div>'

    caro = f'''<section class="ag-tram" id="tram-caro" hidden aria-labelledby="h-caro">
<p class="ag-nhan">{t("Trạm 1 · Video 434 · AI chơi game giỏi thế nào, phần 1/4", "Station 1 · Video 434 · How good is AI at games, part 1/4")}</p>
<h2 id="h-caro">{t("Đánh caro với máy: kéo thanh “nhìn trước mấy nước”", "Play tic-tac-toe against the computer: drag “how many moves ahead”")}</h2>
<p class="ag-mo">{t("Bạn là <b>X</b>, máy là <b>O</b>. Máy thử từng nước có thể đi, nhìn trước vài nước rồi chấm điểm. Nhìn càng xa càng khó thắng. Kéo lên 9 là máy nhìn hết tới cuối ván: bạn cố mấy cũng chỉ hòa.", "You are <b>X</b>, the computer is <b>O</b>. It tries every possible move, looks a few moves ahead and scores each one. The further it looks, the harder it is to beat. At 9 it sees all the way to the end: the best you can do is draw.")}</p>
<div class="ag-caro">
<div class="ag-ban-o">
<div class="ag-ban" id="cr-ban" role="group" aria-label="{t("Bàn caro 3x3", "3x3 board")}"></div>
<p class="ag-tb" id="cr-tb" aria-live="polite"></p>
</div>
<div class="ag-ben">
<label class="ag-lbl" for="cr-sau">{t("Máy nhìn trước", "Computer looks ahead")} <b id="cr-sau-so">2</b> {t("nước", "moves")}</label>
<input type="range" id="cr-sau" min="1" max="9" step="1" value="2">
<p class="ag-giai" id="cr-sau-giai"></p>
<div class="ag-ty" aria-live="polite">{o_so('<span id="cr-thang">0</span>', t("Bạn thắng", "You win"), "is-xanh")}{o_so('<span id="cr-hoa">0</span>', t("Hòa", "Draw"))}{o_so('<span id="cr-thua">0</span>', t("Máy thắng", "Computer wins"), "is-cam")}</div>
<p class="ag-xet" id="cr-xet"></p>
<label class="ag-chk"><input type="checkbox" id="cr-diem"> {t("Hiện điểm máy chấm cho từng ô trống", "Show the computer's score for each empty square")}</label>
<p class="ag-chu-giai" id="cr-chu-giai" hidden><span class="is-xanh">+1</span> {t("bạn thắng", "you win")} · <span>0</span> {t("hòa", "draw")} · <span class="is-cam">−1</span> {t("bạn thua", "you lose")} <small>{t("(nếu cả hai chơi hoàn hảo)", "(if both play perfectly)")}</small></p>
<div class="ag-hang"><button type="button" class="btn" id="cr-moi">{t("Ván mới", "New game")}</button><button type="button" class="btn btn-nhe" id="cr-may">{t("Ván mới, máy đi trước", "New game, computer first")}</button></div>
<button type="button" class="chip" id="cr-video">{t("Thế cờ trong video 434", "The position from video 434")}</button>
</div>
</div>
<h3 class="ag-h3">{t("Vì sao caro thật thì máy không nhìn hết được", "Why a real board is too big to look through")}</h3>
<div class="ag-so4">{o_so(nf(5478), t("thế cờ caro 3x3, máy duyệt hết trong chớp mắt", "3x3 positions: checked in a blink"))}{o_so(nf(255168), t("ván caro 3x3 khác nhau", "different 3x3 games"))}{o_so("225", t("ô trên bàn caro thật 15x15", "squares on a real 15x15 board"))}{o_so(t("33,7 giờ", "33.7 hours"), t("để nhìn trước 6 nước trên bàn 15x15, dù xét 1 tỉ chuỗi mỗi giây", "to look 6 moves ahead on 15x15, even at a billion sequences a second"), "is-cam")}</div>
<details class="ag-nap"><summary>{t("Mở nắp: máy chấm điểm thế nào (minimax)", "Under the hood: how the computer scores moves (minimax)")}</summary>
<p>{t("Máy vẽ ra một cây: mỗi nhánh là một nước có thể đi. Tới lượt máy thì chọn nhánh điểm cao nhất, tới lượt bạn thì máy giả sử bạn chọn nhánh tệ nhất cho nó. Lá cây chấm +1 thắng, 0 hòa, −1 thua, rồi dồn ngược lên gốc. Cách này gọi là minimax.", "The computer draws a tree where each branch is a possible move. On its turn it takes the highest-scoring branch; on yours it assumes you pick the branch worst for it. Leaves score +1 win, 0 draw, −1 loss, and the scores flow back up to the root. This is called minimax.")}</p>
<p>{t("Khi thanh “nhìn trước” ngắn hơn ván cờ, nhánh nào chưa phân thắng thua thì máy chấm 0, nên nó không thấy bẫy kẹp hai đường của bạn. Máy caro thật trên bàn 15x15 chỉ nhìn vài nước, rồi chấm thế cờ bằng mẹo (ví dụ hàng 4 còn mở +1.000 điểm, hàng 3 mở +100) và cắt tỉa nhánh vô vọng.", "When the look-ahead is shorter than the game, any branch without a winner yet scores 0, so the computer can't see your double-threat trap. Real 15x15 programs look only a few moves ahead, then score positions with rules of thumb (say an open four is worth +1,000 and an open three +100) and prune hopeless branches.")}</p>
</details>
</section>'''

    nut = lambda i, chu, cls="chip": f'<button type="button" class="{cls}" id="{i}">{chu}</button>'
    thuyen = f'''<section class="ag-tram" id="tram-thuyen" hidden aria-labelledby="h-thuyen">
<p class="ag-nhan">{t("Trạm 2 · Video 437 · AI chơi game giỏi thế nào, phần 4/4", "Station 2 · Video 437 · How good is AI at games, part 4/4")}</p>
<h2 id="h-thuyen">{t("Tự đặt luật thưởng, xem AI lách luật để ăn điểm", "Write the reward rule, watch the AI game it")}</h2>
<p class="ag-mo">{t("Bạn làm một game đua thuyền và muốn thuyền về đích. Nhưng AI không hiểu “về đích” là gì: nó chỉ thấy con số điểm. Đặt luật điểm bên dưới rồi bấm cho AI chơi. AI thử hết 24 kế hoạch và chọn cái nhiều điểm nhất.", "You built a boat race and want the boat to finish. But the AI doesn't know what “finish” means: it only sees the score. Set the scoring rule below and let the AI play. It tries all 24 plans and picks the one with the most points.")}</p>
<div class="ag-dua">
<svg id="th-ve" class="ag-ve" viewBox="0 0 640 290" role="img" aria-label="{t("Đường đua thuyền có một cái vịnh tròn và vạch đích", "Boat race course with a round lagoon and a finish line")}"></svg>
<div class="ag-bang"><span>{t("Điểm", "Score")} <b id="th-diem">0</b></span><span>{t("Bước", "Step")} <b id="th-buoc">0</b>/300</span><span id="th-dich" class="ag-dich"></span></div>
</div>
<div class="ag-luat">
<p class="ag-lbl">{t("Luật điểm của bạn", "Your scoring rule")}</p>
<div class="ag-mau" role="group" aria-label="{t("Luật mẫu", "Sample rules")}">{nut("th-cu", t("Luật trong video (cũ)", "Rule from the video (old)"))}{nut("th-moi", t("Luật đã sửa", "Fixed rule"))}</div>
<label class="ag-lbl" for="th-m">{t("Đụng một mục tiêu", "Hit a target")} <b id="th-m-so"></b></label>
<input type="range" id="th-m" min="0" max="20" step="1" value="10">
<label class="ag-chk"><input type="checkbox" id="th-moc" checked> {t("Mục tiêu mọc lại sau mỗi vòng", "Targets come back after every lap")}</label>
<label class="ag-lbl" for="th-f">{t("Thưởng về đích", "Finish bonus")} <b id="th-f-so"></b></label>
<input type="range" id="th-f" min="0" max="500" step="10" value="100">
<label class="ag-chk"><input type="checkbox" id="th-gan"> {t("+1 điểm cho mỗi bước tiến gần đích", "+1 point for every step closer to the finish")}</label>
<div class="ag-hang"><button type="button" class="btn btn-yt" id="th-chay">{t("Cho AI chơi", "Let the AI play")} ▶</button></div>
</div>
<div class="ag-kq" id="th-kq" aria-live="polite" hidden></div>
<ol class="ag-ke" id="th-ke" hidden></ol>
<p class="ag-thach" id="th-thach"><b>{t("Thử thách:", "Challenge:")}</b> {t("đổi luật sao cho AI về đích mà lòng vòng trong vịnh không quá 1 vòng.", "change the rule so the AI finishes the race with at most 1 lap of the lagoon.")}</p>
<details class="ag-nap"><summary>{t("Mở nắp: ngoài đời AI cũng lách luật", "Under the hood: AI games the rules outside games too")}</summary>
<p>{t("Lách luật để ăn điểm gọi là reward hacking. Một thử nghiệm công bố năm 2016 có đúng chuyện này: AI chơi game đua thuyền chạy vòng trong vịnh, không bao giờ về đích mà điểm vẫn cao hơn người chơi. Đường đua ở đây là bản ví dụ do kênh vẽ, số khớp video 437.", "Gaming the rules for points is called reward hacking. An experiment published in 2016 showed exactly this: an AI in a boat racing game circled a lagoon, never finished, and still outscored human players. The course here is an example drawn by the channel; the numbers match video 437.")}</p>
<p>{t("Chatbot học từ điểm người chấm nên có lúc nói cho vừa lòng thay vì nói đúng. AI viết code có lúc sửa bài kiểm tra cho qua thay vì sửa lỗi thật. Cách chữa giống trong trò: thưởng đúng thứ mình muốn, và xem cách AI làm chứ không chỉ nhìn điểm.", "Chatbots learn from human ratings, so they sometimes say what pleases instead of what's true. Coding AIs sometimes tweak the tests to pass instead of fixing the bug. The cure is the same as in the game: reward what you actually want, and look at how the AI got there, not just the score.")}</p>
</details>
</section>'''

    nhan = {
        "x_luot": t("Tới lượt bạn (X).", "Your turn (X)."), "may_nghi": t("Máy đang nghĩ…", "Computer is thinking…"),
        "thang": t("Bạn thắng! Máy chỉ nhìn trước {n} nước nên không thấy bẫy của bạn.", "You win! The computer only looked {n} moves ahead, so it missed your trap."),
        "thang9": t("Bạn thắng!", "You win!"),
        "thua": t("Máy thắng. Bật “hiện điểm” để xem ô nào an toàn.", "The computer wins. Turn on the scores to see which squares are safe."),
        "hoa": t("Hòa. Hai bên chơi giỏi thì caro 3x3 luôn hòa.", "Draw. With perfect play, tic-tac-toe is always a draw."),
        "xet": t("Nước vừa rồi máy xét {n} thế cờ.", "For its last move the computer checked {n} positions."),
        "video": t("Thế cờ trong video: X còn 5 ô. Bật điểm sẽ thấy chỉ ô 7 được +1: vừa chặn đường chéo của O vừa mở hai đường thắng.", "The position from the video: X has 5 squares left. With scores on, only square 7 gets +1: it blocks O's diagonal and opens two winning lines."),
        "sau": [t("Chỉ thấy nước thắng ngay của mình. Rất dễ thắng.", "Only sees its own instant wins. Easy to beat."),
                t("Thấy thêm nước bạn sắp thắng để chặn. Vẫn thua được bẫy kẹp hai đường.", "Also sees your next winning move and blocks it. Still falls for a double threat."),
                t("Bắt đầu tự giăng bẫy. Khó thắng hơn hẳn.", "Starts setting its own traps. Much harder to beat."),
                t("Thấy gần hết mọi đường. Gần như không thua.", "Sees almost every line. Hardly ever loses."),
                t("Nhìn hết tới cuối ván, giống trong video: không bao giờ thua.", "Sees to the end of the game, as in the video: never loses.")],
        "o": t("Ô", "Square"),
        "ke_thang": t("Chạy thẳng về đích", "Race straight to the finish"), "ke_vong": t("{n} vòng trong vịnh rồi về đích", "{n} laps of the lagoon, then finish"),
        "ke_mai": t("Chạy vòng mãi ({n} vòng), không về đích", "Circle forever ({n} laps), never finish"),
        "ai_chon": t("AI chọn", "AI picks"), "diem": t("điểm", "points"),
        "kq_mai": t("AI không thèm về đích. Chạy vòng trong vịnh được {a} điểm, gấp {x} lần chạy thẳng về đích ({b}). Đó là lách luật để ăn điểm.", "The AI never finishes. Circling the lagoon earns {a} points, {x} times as much as racing to the finish ({b}). That's gaming the rules."),
        "kq_long": t("AI có về đích, nhưng lòng vòng {n} vòng trong vịnh trước để ăn mục tiêu. Thuyền về chót mà điểm vẫn cao.", "The AI does finish, but only after {n} laps of the lagoon to farm targets. Last place, high score."),
        "kq_tot": t("AI về đích đàng hoàng. Luật điểm của bạn đã thưởng đúng thứ bạn muốn.", "The AI races to the finish. Your rule rewards what you actually want."),
        "kq_mot": t("AI về đích. Nó chỉ ghé vịnh 1 vòng để lấy mỗi mục tiêu một lần, vì chạy thêm vòng không còn được điểm. Luật của bạn đã thưởng đúng thứ bạn muốn.", "The AI finishes. It visits the lagoon once to collect each target a single time, since extra laps no longer pay. Your rule rewards what you actually want."),
        "kq_khong": t("Không có điểm nào để ăn, nên AI chẳng có lý do làm gì cả. Thuyền đứng yên.", "There are no points to earn, so the AI has no reason to do anything. The boat stays put."),
        "dat": t("Bạn sửa được luật rồi! Đây đúng là cách sửa trong video 437: thưởng thứ mình muốn (tiến về đích), đừng thưởng thứ lặp lại được mãi.", "You fixed the rule! That's exactly the fix from video 437: reward what you want (progress to the finish), not something that can be farmed forever."),
        "dich_ok": t("Về đích ✓", "Finished ✓"), "dich_khong": t("Chưa về đích", "Not finished"),
        "mau": t("Mỗi chấm vàng là một mục tiêu. Vịnh tròn có 3 mục tiêu mọc lại sau mỗi vòng.", "Each yellow dot is a target. The round lagoon has 3 targets that come back every lap."),
        "vinh": t("Vịnh", "Lagoon"), "dich": t("Đích", "Finish"), "bat_dau": t("Xuất phát", "Start"),
    }
    du_lieu = json.dumps({"nhan": nhan, "lg": LG}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    tieu = t("AI chơi game: đánh caro với máy và xem AI lách luật để ăn điểm", "AI plays games: tic-tac-toe against a computer, and an AI that games the rules")
    desc = t("Trò chơi miễn phí theo video 434 và 437: đánh caro 3x3 với máy rồi kéo thanh “nhìn trước mấy nước” để thấy minimax mạnh lên ra sao; tự đặt luật thưởng cho game đua thuyền và xem AI lách luật để ăn điểm (reward hacking).",
             "Free games from videos 434 and 437: play tic-tac-toe against a computer and drag “how many moves ahead” to watch minimax get stronger; write the reward rule for a boat race and watch the AI game it (reward hacking).")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Trò chơi · 2 trạm · chạy ngay trên trình duyệt", "Game · 2 stations · runs in your browser")}</p>\n'
            f'<h1>{t("AI chơi game", "AI plays games")}</h1>\n'
            f'<p class="lead">{t("Tự tay thử hai ý của series “AI chơi game giỏi thế nào”: máy nhìn trước để không bao giờ thua, và AI lách luật khi điểm thưởng đặt sai.", "Try two ideas from the “How good is AI at games” series by hand: a computer that looks ahead so it never loses, and an AI that games the rules when the reward is set wrong.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    main = (f'<link rel="stylesheet" href="{p}assets/ai-choi-game.css?v=dev">\n'
            f'<main class="ag" id="ag">\n{ngan}\n{caro}\n{thuyen}\n'
            f'{khoi_chia_se(BASE + GOC + "ai-choi-game.html", tieu, p)}\n'
            f'<p class="ag-ghi">{t("Đường đua, điểm số và các thế cờ là ví dụ do kênh làm. Mọi thứ chạy trên máy bạn, không gọi AI thật và không gửi gì đi đâu.", "The race course, scores and positions are examples made by the channel. Everything runs on your device: no real AI calls, nothing is sent anywhere.")}</p>\n'
            f'<noscript><p>{t("Trò chơi cần JavaScript.", "The game needs JavaScript.")}</p></noscript>\n'
            f'<script type="application/json" id="ag-du-lieu">{du_lieu}</script>\n</main>')
    return GOC + "ai-choi-game.html", trang("ai-choi-game.html", f"{tieu} | {SITE}", desc, band, main, p, og_type="website", q="",
                                            cuoi=f'<script src="{p}ai-choi-game.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

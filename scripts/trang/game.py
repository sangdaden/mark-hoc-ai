# ---------- Thế giới game (game.html, en/game.html): nút "Game" trên menu mở trang này ----------
# Sang chọn mẫu C ngày 20/10/2026: một game nổi bật ở băng lớn (game đầu danh sách data/game.json), các game còn lại trên kệ "Chơi thêm"
# (máy tính: lưới; điện thoại: vuốt ngang). Game là trò nhiều màn, có tim, có sao; trò thử nhanh 1-5 phút ở Góc thực hành (thuc-hanh.html),
# nên data/tro-choi/<id>.json của game có "loai": "game" để Góc thực hành bỏ qua. Mỗi game một cặp Mark + Bit riêng (assets/game/<id>.webp).


def _ds_game():
    L = "en" if LG == "en" else "vi"
    ds = []
    for g in load("game")["game"]:
        f = R / "data" / "tro-choi" / f'{g["id"]}.json'
        tro = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
        ds.append({"id": g["id"], "url": g["url"], "mau": g["mau"], "nhan": g["nhan"][L], "chip": g["chip"][L],
                   "ten": (g.get("ten") or tro["ten"])[L], "moi": (g.get("moi") or tro["moi"])[L]})
    return ds


@trang_rieng("game.html", "0.8")
def tao_game():
    p = t("", "../")
    ds = _ds_game()
    noi, con = ds[0], ds[1:]
    nen = lambda g: f'background:linear-gradient(135deg,{g["mau"][0]},{g["mau"][1]})'
    hinh = lambda g, w, h: f'<img src="{p}assets/game/{g["id"]}.webp" alt="" width="{w}" height="{h}" loading="lazy" decoding="async">'

    the_noi = (f'<section class="gm-noi" style="{nen(noi)}" aria-labelledby="gm-noi-ten">'
               f'<div class="gm-noi-chu"><p class="gm-nhan">{esc(noi["nhan"])}</p>'
               f'<h2 id="gm-noi-ten">{esc(noi["ten"])}</h2><p>{esc(noi["moi"])}</p>'
               f'<a class="btn btn-yt gm-choi" href="{noi["url"]}" data-gm="{noi["id"]}">{t("Chơi ngay", "Play now")} ›</a></div>'
               f'<a class="gm-noi-hinh" href="{noi["url"]}" tabindex="-1" aria-hidden="true">{hinh(noi, 400, 378)}</a></section>')

    def the(g):
        return (f'<li><a class="gm-the" href="{g["url"]}" data-gm="{g["id"]}">'
                f'<span class="gm-bia" style="{nen(g)}"><span class="gm-chip">{esc(g["chip"])}</span>{hinh(g, 400, 378)}</span>'
                f'<span class="gm-than"><b>{esc(g["ten"])}</b><span class="gm-moi">{esc(g["moi"])}</span>'
                f'<small>{esc(g["nhan"])}</small><span class="gm-nut">{t("Chơi", "Play")} ›</span></span></a></li>')

    n = len(ds)
    desc = t(f"{n} game miễn phí của Mark học AI: chặn tin lừa đảo, câu chữ như chatbot, lái xe tự hành qua mưa sương, phiêu lưu qua cổng câu hỏi. Chơi ngay trên điện thoại, không cần tài khoản.",
             f"{n} free Mark học AI games: block scam messages, fish for words like a chatbot, drive a self-driving car through rain and fog, adventure through question gates. Play on your phone, no account needed.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t(f"{n} game · miễn phí · chơi ngay trên web", f"{n} games · free · play in your browser")}</p>\n'
            f'<h1>{t("Thế giới game Mark", "Mark’s game world")}</h1>\n'
            f'<p class="lead">{t("Mỗi game là một bài học về AI giấu trong màn chơi: qua màn, giữ tim, gom sao. Chơi trên điện thoại thì xoay ngang máy cho đã tay.", "Every game hides an AI lesson inside the level: clear the stage, keep your hearts, collect stars. On a phone, turn it sideways for the full experience.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/game/game.webp" alt="{t("Mark và Bit đeo kính đen", "Mark and Bit in sunglasses")}" width="200" height="189"></div>')
    main = (f'<main class="gm">\n<link rel="stylesheet" href="{p}assets/game/game.css?v=dev">\n{the_noi}\n'
            f'<section class="gm-ke-khoi" aria-labelledby="gm-them"><h2 id="gm-them">{t("Chơi thêm", "More games")}</h2>'
            f'<ul class="gm-ke">{"".join(the(g) for g in con)}</ul></section>\n'
            f'<a class="gm-sang" href="thuc-hanh.html"><b>{t("Muốn thử nhanh 1-5 phút?", "Got 1-5 minutes?")}</b>'
            f'<span>{t("Góc thực hành có hơn 40 trò thử tay ngắn, mỗi trò đúng một ý trong video.", "The practice corner has 40+ short hands-on tries, each on one idea from a video.")}</span></a>\n'
            f'<p class="gm-ghi">{t("Tiến độ và số sao lưu trên trình duyệt này, không gửi đi đâu.", "Progress and stars stay in this browser and are never sent anywhere.")}</p>\n</main>')
    return GOC + "game.html", trang("game.html", t(f"Thế giới game Mark: game học AI miễn phí | {SITE}", f"Mark’s game world: free games to learn AI | {SITE}"),
                                    desc, band, main, p, hien_tai="game", og_type="website", q="")

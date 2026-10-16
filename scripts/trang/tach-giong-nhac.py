# ---------- trò chơi "Bàn tách giọng ca" (tach-giong-nhac.html): video 555 "Tách giọng ca và nhạc nền" (AI trong âm nhạc) ----------
# Dữ liệu ở data/tach-giong-nhac.json, âm thanh và cách chơi ở tach-giong-nhac.js, CSS ở assets/tro-choi/tach-giong-nhac.css.
# Bài nhạc là đoạn hư cấu trình duyệt tự tổng hợp (WebAudio), không tải bản thu nào. Ba phần: bàn trộn 4 rãnh, ảnh phổ + mặt nạ, máy tách.

HINH_CHOI["tach-giong"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="align-content:center;gap:6px">'
    + "".join(f'<span style="display:flex;align-items:center;gap:8px;width:100%;min-width:200px"><b style="flex:none;width:62px;font:700 12px/1.3 var(--f-body)">{ten}</b>'
              f'<span style="flex:1;height:10px;border-radius:6px;background:{mau};opacity:{op}"></span></span>'
              for ten, mau, op in ((t("Giọng", "Vocals"), "#F97316", 1), (t("Trống", "Drums"), "#8B5CF6", .35), ("Bass", "#0EA5E9", .35), (t("Đàn", "Keys"), "#10B981", .35)))
    + '</span>')


@trang_rieng("tach-giong-nhac.html", "0.7")
def tao_tach_giong_nhac():
    p = t("", "../")
    D = load("tach-giong-nhac")
    L = LG
    rang = [{"id": r["id"], "mau": r["mau"], "ten": r["ten"][L]} for r in D["rang"]]
    nhan = {
        "phat": t("Phát bài nhạc", "Play the song"), "dung": t("Dừng", "Stop"),
        "bat": t("Đang bật", "On"), "tat": t("Đã tắt", "Off"),
        "tron": t("Bản trộn: cả 4 rãnh trong một file", "The mix: all 4 tracks in one file"),
        "o_chon": t("Chạm một ô trên ảnh phổ để xem máy chia nó ra sao.", "Tap a cell on the spectrogram to see how the machine splits it."),
        "o_nl": t("Năng lượng", "Energy"), "o_mn": t("Mặt nạ giọng", "Vocal mask"),
        "o_giong": t("Phần giọng", "Voice part"), "o_nhac": t("Phần nhạc", "Music part"),
        "o_cao": t("Cao độ", "Pitch"), "o_tg": t("Thời điểm", "Time"), "giay": t("giây", "s"),
        "o_kho": t("Mặt nạ gần 0,5: giọng và nhạc chồng lên nhau, máy đành chia đôi.", "Mask near 0.5: voice and music overlap, so the machine just splits it."),
        "o_ro": t("Mặt nạ rõ ràng: ô này gần như chỉ có một bên.", "A clear mask: this cell belongs mostly to one side."),
        "hoi_dung": t("Đúng rồi! 8 × 0,5 = 4 cho giọng, 4 cho nhạc.", "Right! 8 × 0.5 = 4 for the voice, 4 for the music."),
        "hoi_sai": t("Chưa đúng. Phần giọng = năng lượng × mặt nạ = 8 × 0,5 = 4.", "Not quite. Voice part = energy × mask = 8 × 0.5 = 4."),
        "ro_muc": [t("Mới học vài bài", "A handful of songs"), t("Học ít", "Little training"), t("Học vừa", "Some training"), t("Học nhiều", "Lots of training"), t("Học rất nhiều", "Huge training set")],
        "sot": t("Phần còn sót", "Leftover bleed"),
        "che_do": {"tron": t("Bản trộn gốc", "Original mix"), "giong": t("Chỉ giọng", "Vocals only"), "karaoke": t("Karaoke (bỏ giọng)", "Karaoke (no vocals)")},
        "nx": {
            "tron": t("Đây là file gốc, chưa tách gì.", "This is the original file, nothing split yet."),
            "giong": t("Máy giữ phần giọng của từng ô. Nghe kỹ: còn sót tiếng đàn, trống và tiếng lạo xạo không?", "The machine keeps each cell's voice part. Listen closely: any keys, drums or crackle leaking through?"),
            "karaoke": t("Máy bỏ phần giọng của từng ô. Giọng còn vọng lại bao nhiêu?", "The machine removes each cell's voice part. How much voice still echoes through?")},
        "ghi_kho": t("Đàn cùng dải hoặc có tiếng vang: nhiều ô mặt nạ quanh 0,5, tách khó hơn hẳn.", "Keys in the same range or echo: many cells sit near a 0.5 mask, so splitting gets much harder."),
        "can_phat": t("Bấm phát để nghe", "Press play to listen"),
    }
    du_lieu = json.dumps({"rang": rang, "o_vi_du": D["o_vi_du"], "nhan": nhan, "p": p}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    desc = t("Trò chơi miễn phí: bật tắt giọng ca, trống, bass, đàn trong một bài nhạc, xem ảnh phổ và mặt nạ, rồi tự chỉnh máy tách giọng để làm karaoke. Hiểu AI tách giọng làm thế nào trong 3 phút.",
             "Free game: switch vocals, drums, bass and keys on and off in a song, explore the spectrogram and the mask, then tune a vocal splitter to make karaoke. See how AI separates vocals in 3 minutes.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Phòng thử · 3 phút · bật loa nhé", "Lab · 3 minutes · turn your sound on")}</p>\n'
            f'<h1>{t("Bàn tách giọng ca", "Vocal splitter desk")}</h1>\n'
            f'<p class="lead">{t("Bài hát thu chung một file, vậy mà máy vẫn rút được giọng ca ra. Tự tay thử xem nó làm thế nào.", "A song is mixed into one file, yet a machine can still pull the vocals out. Try it yourself and see how.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/mark-thac-mac.svg" alt="" width="180" height="170"></div>')
    rang_html = "".join(
        f'<div class="tg-rang" data-rang="{r["id"]}" style="--mau:{r["mau"]}"><button type="button" class="tg-bat" aria-pressed="true" data-rang="{r["id"]}">'
        f'<span class="tg-cham" aria-hidden="true"></span><b>{esc(r["ten"])}</b><small>{nhan["bat"]}</small></button>'
        f'<canvas class="tg-song" width="600" height="56" aria-hidden="true"></canvas></div>' for r in rang)
    o4 = "".join(
                 f'<div class="tg-vd"><span class="tg-vd-so">{t("Ô", "Cell")} {i + 1}</span><span class="tg-vd-ct">{so_vn(o["nang_luong"])} × {so_vn(o["mat_na"])}</span>'
                 f'<span class="tg-chia"><i style="flex:{o["nang_luong"] * o["mat_na"]:.2f}"></i><i style="flex:{o["nang_luong"] * (1 - o["mat_na"]):.2f}"></i></span>'
                 f'<small>{t("giọng", "voice")} {so_vn(round(o["nang_luong"] * o["mat_na"], 1))} · {t("nhạc", "music")} {so_vn(round(o["nang_luong"] * (1 - o["mat_na"]), 1))}</small></div>'
                 for i, o in enumerate(D["o_vi_du"]))
    rut = [("1", t("Âm thanh thành ảnh", "Sound becomes a picture"), t("Máy cắt âm thanh thành hàng nghìn ô theo cao độ và thời gian.", "The machine cuts sound into thousands of cells by pitch and time.")),
           ("2", t("Mỗi ô một mặt nạ", "One mask per cell"), t("Model đoán phần của giọng trong từng ô, học từ bài có phần thu riêng.", "The model guesses the voice's share of each cell, learned from songs with separate tracks.")),
           ("3", t("Tách được chưa phải của mình", "Splitting isn't owning"), t("Hát ở nhà khác đăng lên mạng. Chỉ tách bản thu bạn có quyền dùng.", "Singing at home isn't posting online. Only split recordings you have the rights to."))]
    the_rut = "".join(f'<div class="tg-rut"><span class="tg-so">{s}</span><b>{a}</b><p>{b}</p></div>' for s, a, b in rut)
    main = f"""<main class="tg" id="tg">
<section class="tg-phan" aria-labelledby="tg-h1">
<p class="tg-buoc">1/3</p><h2 id="tg-h1">{t("Bàn trộn: bài hát có 4 rãnh", "The mixing desk: a song has 4 tracks")}</h2>
<p class="tg-lead">{t("Phòng thu ghi từng phần riêng rồi trộn lại thành một file. Bấm phát, rồi tắt bật từng rãnh để nghe mỗi phần.", "Studios record each part separately, then mix them into one file. Press play, then switch tracks on and off to hear each part.")}</p>
<div class="tg-ban">
<button type="button" class="btn btn-yt tg-phat" id="tg-phat"><span class="tg-phat-ic" aria-hidden="true">▶</span><span id="tg-phat-chu">{nhan["phat"]}</span></button>
<div class="tg-rang-ds" id="tg-rang-ds">{rang_html}</div>
<div class="tg-tron"><span>{nhan["tron"]}</span><canvas class="tg-song" id="tg-song-tron" width="600" height="56" aria-hidden="true"></canvas></div>
</div>
</section>
<section class="tg-phan" aria-labelledby="tg-h2">
<p class="tg-buoc">2/3</p><h2 id="tg-h2">{t("Ảnh phổ và mặt nạ", "Spectrogram and mask")}</h2>
<p class="tg-lead">{t("Máy biến âm thanh thành ảnh phổ: trục ngang là thời gian, trục dọc là cao độ. Model chấm mỗi ô một số từ 0 tới 1, gọi là mặt nạ: phần của giọng trong ô đó.", "The machine turns sound into a spectrogram: time across, pitch up the side. The model gives every cell a number from 0 to 1 called the mask: the voice's share of that cell.")}</p>
<div class="tg-pho-bo">
<div class="tg-pho-khung"><span class="tg-truc-y">{t("Cao độ", "Pitch")} ↑</span><div class="tg-pho" id="tg-pho" role="grid" aria-label="{t("Ảnh phổ", "Spectrogram")}"></div><span class="tg-truc-x">{t("Thời gian", "Time")} →</span>
<p class="tg-chu-giai"><span class="tg-cg tg-cg-g"></span>{t("giọng", "voice")}<span class="tg-cg tg-cg-n"></span>{t("nhạc", "music")}<span class="tg-cg tg-cg-l"></span>{t("lẫn nhau", "mixed")}</p></div>
<div class="tg-o-the" id="tg-o-the" aria-live="polite"><p class="muted">{nhan["o_chon"]}</p></div>
</div>
<div class="tg-do">
<p class="tg-do-hoi"><b>{t("Đố nhanh:", "Quick quiz:")}</b> {t("Ô có năng lượng 8, mặt nạ giọng 0,5. Phần của giọng là bao nhiêu?", "A cell has energy 8 and a vocal mask of 0.5. How much goes to the voice?")}</p>
<div class="tg-do-chon" id="tg-do-chon"><button type="button" class="btn btn-nhe" data-dap="2">2</button><button type="button" class="btn btn-nhe" data-dap="4">4</button><button type="button" class="btn btn-nhe" data-dap="8">8</button></div>
<p class="tg-do-ph" id="tg-do-ph" aria-live="polite"></p>
<div class="tg-vd-ds" id="tg-vd-ds" hidden>{o4}</div>
</div>
</section>
<section class="tg-phan" aria-labelledby="tg-h3">
<p class="tg-buoc">3/3</p><h2 id="tg-h3">{t("Máy tách: tự làm karaoke", "The splitter: make your own karaoke")}</h2>
<p class="tg-lead">{t("Model học từ những bài có sẵn từng phần thu riêng. Học càng nhiều, mặt nạ càng chuẩn. Chọn kiểu nghe, kéo mức học, rồi thử làm khó máy.", "The model learns from songs that come with separate tracks. More training, sharper masks. Pick what to hear, drag the training level, then try making it harder.")}</p>
<div class="tg-may">
<div class="tg-che-do" id="tg-che-do" role="radiogroup" aria-label="{t("Kiểu nghe", "Listen to")}"></div>
<label class="tg-truot"><span>{t("Model đã học", "Model training")}: <b id="tg-muc-chu"></b></span><input type="range" id="tg-muc" min="0" max="4" step="1" value="1"></label>
<div class="tg-kho">
<label class="tg-cong"><input type="checkbox" id="tg-cung-dai"><span><b>{t("Đàn chơi cùng dải với giọng", "Keys play in the vocal range")}</b><small>{t("Đàn nhảy lên đúng quãng giọng hát", "The keys move up into the singer's range")}</small></span></label>
<label class="tg-cong"><input type="checkbox" id="tg-vang"><span><b>{t("Thu trong phòng có tiếng vang", "Recorded in an echoey room")}</b><small>{t("Giọng dội lại, đuôi tiếng kéo dài", "The voice bounces back with a long tail")}</small></span></label>
</div>
<div class="tg-sot"><span>{nhan["sot"]}</span><span class="tg-sot-thanh"><i id="tg-sot-i"></i></span><b id="tg-sot-so"></b></div>
<p class="tg-nx" id="tg-nx" aria-live="polite"></p>
</div>
</section>
<section class="tg-phan tg-cuoi">
<h2 class="ld-ket-h">{t("Ba điều rút ra", "Three takeaways")}</h2>
<div class="tg-rut-ds">{the_rut}</div>
<div class="tg-thu"><img src="{p}assets/mark-a-ra-the.svg" alt="" width="72" height="68"><p><b>{t("Thử ngay:", "Try it:")}</b> {t("thu một đoạn bạn vừa hát vừa bật nhạc nền, mở tính năng tách giọng trong app chỉnh âm, nghe phần giọng còn sót tiếng gì.", "record yourself singing over background music, open the vocal-separation feature in an audio app, and listen for what leaks into the vocal track.")}</p></div>
<h2 class="ld-ket-h">{t("Xem video của bài này", "Watch the video")}</h2>
<div class="ld-ket-video"><a class="ld-vid" href="{esc(kenh["youtube"])}" target="_blank" rel="noopener" data-so-video="555"><span class="ld-vid-so">#555</span><b>{t("Tách giọng ca và nhạc nền", "Separating vocals from the backing track")}</b><small class="muted">{t("Sắp ra mắt trên kênh", "Coming soon on the channel")}</small></a></div>
{khoi_chia_se(BASE + GOC + "tach-giong-nhac.html", t("Bàn tách giọng ca: tự xem AI rút giọng ra khỏi bài hát", "Vocal splitter desk: see how AI pulls vocals out of a song"), p)}
</section>
<p class="ld-ghi">{t("Bài nhạc trong trang là đoạn hư cấu do trình duyệt của bạn tự tạo ra, không dùng bài hát hay giọng ca sĩ thật. Máy tách ở đây là mô phỏng để thấy cách mặt nạ hoạt động, không gọi AI thật; số trên ô là ví dụ trong video.", "The song on this page is a made-up tune your own browser generates; no real song or singer is used. The splitter here is a simulation of how masks work, not a real AI; the cell numbers are the examples from the video.")}
{t("Không có gì gửi đi đâu.", "Nothing is sent anywhere.")}</p>
<noscript><p>{t("Phòng thử cần JavaScript.", "The lab needs JavaScript.")}</p></noscript>
<script type="application/json" id="tg-du-lieu">{du_lieu}</script>
</main>"""
    return GOC + "tach-giong-nhac.html", trang("tach-giong-nhac.html", t(f"Bàn tách giọng ca: AI tách giọng khỏi nhạc nền thế nào | {SITE}", f"Vocal splitter desk: how AI separates vocals from music | {SITE}"),
                                               desc, band, main, p, og_type="website", q="",
                                               cuoi=f'<link rel="stylesheet" href="{p}assets/tro-choi/tach-giong-nhac.css?v=dev">\n<script src="{p}tach-giong-nhac.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')


def so_vn(x):
    """Số kiểu Việt (0,8) hoặc kiểu Anh (0.8), bỏ đuôi .0"""
    s = f"{x:g}"
    return s.replace(".", ",") if LG != "en" else s

# ---------- Phòng thí nghiệm dữ liệu và robot (phong-thi-nghiem-du-lieu.html): cùng bàn ngăn kéo với Phòng thí nghiệm bộ não AI ----------
# Một chuỗi trà sữa 3 chi nhánh đi suốt 6 trạm: chọn biểu đồ (309), ngưỡng gửi voucher (346), học vẹt (348, cả 42 và 241),
# chỉnh PID (362), định vị bằng mốc trần (363), bản đồ và A* (364), rồi trạm 7 xuống núi trong sương mù (series AI học như thế nào, 38-41). Cách chạy ở phong-du-lieu.js, CSS ở assets/tro-choi/phong-du-lieu.css.
# Số liệu: data/phong-du-lieu/so-lieu.json (scripts/tao_phong_du_lieu.py, chạy lại notebook và code thực hành của các video).
# Mỗi trạm mở riêng bằng ?tram=<id> (data/tro-choi/du-lieu-*.json nhúng từng trạm vào bài của video).

HINH_CHOI["du-lieu-bieu-do"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<rect x="8" y="22" width="12" height="40" rx="2" fill="#2563EB"/><rect x="22" y="32" width="12" height="30" rx="2" fill="#93C5FD"/>'
    '<rect x="44" y="40" width="12" height="22" rx="2" fill="#2563EB"/><rect x="58" y="39" width="12" height="23" rx="2" fill="#93C5FD"/>'
    '<polyline points="80,40 88,30 96,36 104,18 114,24" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>'
    '<line x1="4" y1="62" x2="116" y2="62" stroke="currentColor" stroke-opacity=".4"/></svg></span>')
HINH_CHOI["du-lieu-nguong"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    + "".join(f'<circle cx="{10 + i * 10}" cy="{40 + (i % 3 - 1) * 9}" r="4" fill="{"#EF4444" if i in (6, 8, 9, 10) else "#3B82F6"}"/>' for i in range(11))
    + '<line x1="72" y1="18" x2="72" y2="62" stroke="#8B5CF6" stroke-width="3"/><circle cx="72" cy="16" r="5" fill="#8B5CF6"/></svg></span>')
HINH_CHOI["du-lieu-hoc-vet"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<polyline points="10,50 30,44 50,32 70,22 90,14 110,8" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>'
    '<polyline points="10,52 30,46 50,44 70,48 90,54 110,58" fill="none" stroke="#F97316" stroke-width="3" stroke-linecap="round"/>'
    '<line x1="10" y1="64" x2="110" y2="64" stroke="currentColor" stroke-opacity=".4"/></svg></span>')
HINH_CHOI["du-lieu-pid"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<line x1="6" y1="24" x2="114" y2="24" stroke="currentColor" stroke-opacity=".45" stroke-dasharray="4 3"/>'
    '<path d="M6 62 C 22 62, 26 12, 38 16 S 52 30, 60 24 S 70 24, 76 24 L 80 24 L 82 38 C 88 40, 92 24, 114 24" fill="none" stroke="#10B981" stroke-width="3"/>'
    '</svg></span>')
HINH_CHOI["du-lieu-dinh-vi"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<rect x="6" y="6" width="108" height="58" rx="6" fill="none" stroke="currentColor" stroke-opacity=".35"/>'
    '<path d="M20 50 L100 50 L100 20 L40 20 Z" fill="none" stroke="#2563EB" stroke-width="2.5"/>'
    '<path d="M20 50 L98 54 L106 26 L50 14 Z" fill="none" stroke="#F97316" stroke-width="2" stroke-dasharray="4 3"/>'
    + "".join(f'<path d="M{x - 4} {y}h8M{x} {y - 4}v8" stroke="#8B5CF6" stroke-width="2"/>' for x, y in ((30, 36), (70, 36), (96, 12), (60, 58)))
    + '</svg></span>')
HINH_CHOI["du-lieu-xuong-nui"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<path d="M6 8 Q60 118 114 14 L114 66 L6 66 Z" fill="#10B981" fill-opacity=".25"/>'
    '<path d="M6 8 Q60 118 114 14" fill="none" stroke="#059669" stroke-width="3"/>'
    '<path d="M4 2H116V66H4Z M12 38a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z" fill="#CBD5E1" fill-opacity=".8" fill-rule="evenodd"/>'
    '<polyline points="18,24 30,38 44,48" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="4 3"/>'
    '<path d="M30 38 L42 49" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="38" r="5" fill="#2563EB"/></svg></span>')
HINH_CHOI["du-lieu-a-sao"] = lambda: (
    '<span class="ct-hinh" aria-hidden="true" style="place-items:center"><svg viewBox="0 0 120 70" width="150" height="88">'
    '<rect x="40" y="26" width="14" height="14" fill="currentColor" fill-opacity=".45"/><rect x="74" y="8" width="18" height="18" fill="currentColor" fill-opacity=".45"/>'
    '<polyline points="12,14 30,44 62,50 100,40" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linejoin="round"/>'
    '<circle cx="12" cy="14" r="5" fill="#10B981"/><circle cx="100" cy="40" r="5" fill="#EF4444"/></svg></span>')


@trang_rieng("phong-thi-nghiem-du-lieu.html", "0.7")
def tao_phong_du_lieu():
    p = t("", "../")
    D = load("phong-du-lieu/so-lieu")
    tram = [
        ("bieu-do", "1", t("Chọn biểu đồ", "Pick the chart"), "309"),
        ("nguong", "2", t("Ngưỡng gửi voucher", "Voucher threshold"), "346"),
        ("hoc-vet", "3", t("Học vẹt hay học hiểu", "Memorize or learn"), "348"),
        ("pid", "4", t("Chỉnh PID bánh xe", "Tune the wheel PID"), "362"),
        ("dinh-vi", "5", t("Định vị bằng mốc trần", "Ceiling landmarks"), "363"),
        ("a-sao", "6", t("Bản đồ và A*", "Map and A*"), "364"),
        ("xuong-nui", "7", t("Xuống núi trong sương mù", "Downhill in the fog"), "38-41"),
    ]
    li = "".join(f'<li><button type="button" class="bn-nut" data-tram="{i}" aria-controls="tram-{i}"><span class="bn-so">{so}</span>'
                 f'<span class="bn-ten">{ten}<small>{t("Video", "Video")} {ep}</small></span></button></li>' for i, so, ten, ep in tram)
    ngan = (f'<nav class="bn-ngan pdl-ngan" aria-label="{t("Các trạm", "Stations")}"><p class="bn-cau">'
            f'{t("Một tiệm trà sữa 3 chi nhánh, đi từ bảng số bán hàng tới robot giao ly", "One 3-branch milk tea shop, from the sales sheet to the delivery robot")}</p>'
            f'<ol>{li}</ol></nav>')

    def mo_dau(id_, nhan, h2, mo):
        return (f'<section class="bn-tram" id="tram-{id_}" hidden aria-labelledby="h-{id_}">\n<p class="bn-nhan">{nhan}</p>\n'
                f'<h2 id="h-{id_}">{h2}</h2>\n<p class="bn-mo">{mo}</p>\n')

    # Trạm 1: chọn biểu đồ (309)
    cau_hoi = [("nhom", "📊", t("Tháng 9 nhóm món nào tụt?", "Which product group dropped in September?")),
               ("ngay", "📅", t("Doanh thu 61 ngày lên xuống ra sao?", "How did 61 days of sales move?")),
               ("tuan", "🧋", t("Tuần nào trà sữa biến mất, khách chuyển đi đâu?", "Which week did milk tea vanish, and where did buyers go?")),
               ("quan1", "🏪", t("Quận 1 giảm bao nhiêu?", "How much did District 1 drop?"))]
    loai = [("cot", t("Cột", "Bars")), ("duong", t("Đường", "Line")), ("tron", t("Tròn", "Pie")), ("chong", t("Cột chồng", "Stacked"))]
    bd = mo_dau("bieu-do", t("Trạm 1 · Video 309", "Station 1 · Video 309"),
                t("Cùng một bảng số, chọn biểu đồ nào kể đúng chuyện?", "Same numbers: which chart tells the true story?"),
                t("Bảng bán hàng 2 tháng của tiệm có 2.390 dòng. Chọn một câu hỏi, rồi chọn loại biểu đồ. Bit sẽ nói biểu đồ đó giúp hay làm người xem hiểu sai.",
                  "Two months of the shop's sales. Pick a question, then a chart type. Bit tells you whether that chart helps or misleads.")) + (
        f'<p class="bn-lbl">{t("1. Câu hỏi của sếp", "1. The boss asks")}</p>\n<div class="pdl-the" role="group" id="bd-cau">'
        + "".join(f'<button type="button" class="pdl-chon" data-bd-cau="{k}"><span aria-hidden="true">{e}</span>{ch}</button>' for k, e, ch in cau_hoi)
        + f'</div>\n<p class="bn-lbl">{t("2. Bạn vẽ bằng", "2. You draw it as")}</p>\n<div class="pdl-loai" role="group" id="bd-loai">'
        + "".join(f'<button type="button" class="pdl-chon" data-bd-loai="{k}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><use href="#pdl-{k}"/></svg>{ten}</button>' for k, ten in loai)
        + '</div>\n<figure class="pdl-hinh"><svg id="bd-ve" class="pdl-svg" viewBox="0 0 640 300" role="img" aria-label=""></svg>'
        f'<figcaption id="bd-chu" class="pdl-chu"></figcaption></figure>\n'
        f'<label class="bn-chk" id="bd-cat-o" hidden><input type="checkbox" id="bd-cat"> {t("Cắt trục dọc, bắt đầu từ 14 triệu", "Cut the axis: start at 14 million")}</label>\n'
        '<div class="pdl-bit" id="bd-bit" aria-live="polite" hidden></div>\n'
        f'<p class="pdl-diem" id="bd-diem"></p>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: quy tắc chọn biểu đồ", "Under the hood: the chart rules")}</summary>'
        f'<p>{t("So các nhóm với nhau: cột. Theo thời gian: đường. Cơ cấu đổi thế nào: cột chồng theo tuần. Tránh biểu đồ tròn khi có nhiều phần hoặc cần so hai thời điểm, vì mắt người so góc rất kém. Trục dọc của biểu đồ cột phải bắt đầu từ 0.", "Compare groups: bars. Over time: a line. How the mix changes: stacked bars by week. Avoid pies with many slices or two dates to compare; eyes are bad at comparing angles. A bar chart axis must start at 0.")}</p>'
        f'<p>{t("Số liệu là chuỗi trà sữa giả lập dùng xuyên các series Data Analysis, Data Science của kênh.", "The data is the simulated milk tea chain used across the channel's data series.")}</p></details>\n</section>')

    # Trạm 2: ngưỡng (346)
    N = D["nguong"]
    ng = mo_dau("nguong", t("Trạm 2 · Video 346", "Station 2 · Video 346"),
                t("Gửi voucher cho ai? Kéo ngưỡng, xem precision và recall đổi chỗ", "Who gets a voucher? Drag the threshold, watch precision and recall trade places"),
                t(f"Model đoán xác suất bỏ quán của {N['thi']} khách thành viên mà nó chưa từng thấy. Mỗi chấm là một khách: đỏ là khách thật sự bỏ, xanh là khách ở lại. Ai nằm bên phải vạch tím thì nhận voucher.",
                  f"The model scores the chance of leaving for {N['thi']} member customers it never saw. Each dot is a customer: red really left, blue stayed. Everyone right of the purple line gets a voucher.")) + (
        '<figure class="pdl-hinh"><svg id="ng-ve" class="pdl-svg" viewBox="0 0 640 200" role="img" aria-label=""></svg></figure>\n'
        f'<label class="bn-lbl" for="ng-nguong">{t("Ngưỡng: báo “sắp bỏ” khi xác suất từ", "Threshold: flag “leaving” when the probability is at least")} <b id="ng-nguong-so"></b></label>\n'
        '<input type="range" id="ng-nguong" min="0.05" max="0.95" step="0.05" value="0.5">\n'
        f'<div class="bn-hang"><button type="button" class="chip" data-ng-dat="0.5">{t("Mặc định 0,5", "Default 0.5")}</button>'
        f'<button type="button" class="chip" data-ng-dat="0.3">{t("Video hạ xuống 0,3", "The video’s 0.3")}</button></div>\n'
        '<div class="pdl-o4" id="ng-bang" aria-live="polite"></div>\n'
        '<div class="pdl-thanh2" id="ng-thanh"></div>\n'
        f'<div class="pdl-tien"><p class="bn-lbl">{t("Chọn ngưỡng là câu hỏi kinh doanh. Đổi giá theo tiệm của bạn (giả định):", "Picking the threshold is a business call. Plug in your own numbers (assumptions):")}</p>'
        f'<div class="pdl-o2"><label>{t("Một voucher tốn", "One voucher costs")} <input class="bn-so-o" type="number" id="ng-gia" min="0" step="5000" value="20000"> đ</label>'
        f'<label>{t("Giữ được một khách đáng", "Keeping one customer is worth")} <input class="bn-so-o" type="number" id="ng-khach" min="0" step="10000" value="150000"> đ</label></div>'
        '<p class="pdl-loi" id="ng-loi" aria-live="polite"></p>'
        f'<button type="button" class="btn btn-nhe" id="ng-tot">{t("Tìm ngưỡng lời nhất", "Find the most profitable threshold")}</button></div>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: precision và recall", "Under the hood: precision and recall")}</summary>'
        f'<p>{t("Precision (độ chuẩn): trong số khách được gửi voucher, bao nhiêu phần bỏ thật. Recall (độ phủ): trong số khách bỏ thật, bao nhiêu phần được gửi. Hạ ngưỡng thì bắt được nhiều khách hơn (recall lên) nhưng gửi nhầm nhiều hơn (precision xuống).", "Precision: of the customers who got a voucher, how many really left. Recall: of the customers who really left, how many got one. Lower the threshold and you catch more leavers (recall up) but waste more vouchers (precision down).")}</p>'
        f'<p>{t(f"Xác suất lấy từ model LogisticRegression trong notebook thực hành của video ({N['hoc']} khách để học, {N['thi']} khách để thi). Ở ngưỡng 0,5 và 0,3 số trên trang khớp đúng video. Giá voucher và giá trị khách là giả định.", f"Probabilities come from the LogisticRegression model in the video's notebook ({N['hoc']} customers to learn, {N['thi']} to test). At 0.5 and 0.3 the numbers match the video exactly. Voucher cost and customer value are assumptions.")}</p></details>\n</section>')

    # Trạm 3: học vẹt (348)
    H = D["hoc_vet"]
    hv = mo_dau("hoc-vet", t("Trạm 3 · Video 348, 42, 241", "Station 3 · Videos 348, 42, 241"),
                t("Kéo độ sâu của cây: tới lúc nào thì model học thuộc lòng?", "Grow the tree deeper: when does the model start memorizing?"),
                t("Cây quyết định hỏi từng câu có hoặc không để đoán khách có bỏ quán không. Cây càng sâu càng hỏi nhiều câu. Điểm học là điểm trên khách nó đã thấy, điểm thi là điểm trên khách lạ.",
                  "A decision tree asks yes/no questions to guess whether a customer will leave. Deeper trees ask more questions. The train score is on customers it has seen; the test score is on new ones.")) + (
        '<div class="pdl-hv"><figure class="pdl-hinh"><svg id="hv-ve" class="pdl-svg" viewBox="0 0 640 260" role="img" aria-label=""></svg></figure>'
        '<figure class="pdl-hinh pdl-cay"><svg id="hv-cay" class="pdl-svg" viewBox="0 0 260 200" role="img" aria-label=""></svg><figcaption id="hv-la" class="pdl-chu"></figcaption></figure></div>\n'
        f'<label class="bn-lbl" for="hv-sau">{t("Độ sâu tối đa (max_depth)", "Maximum depth (max_depth)")} <b id="hv-sau-so"></b></label>\n'
        f'<input type="range" id="hv-sau" min="1" max="{len(H["cay"])}" step="1" value="2">\n'
        '<div class="pdl-o4 pdl-o3" id="hv-o" aria-live="polite"></div>\n'
        '<div class="pdl-bit" id="hv-bit" aria-live="polite"></div>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: vì sao điểm thi tụt", "Under the hood: why the test score drops")}</summary>'
        f'<p>{t("Chỉ có 235 khách và 2 tháng dữ liệu. Cây càng sâu càng nhớ được cả những chi tiết ngẫu nhiên của từng khách (có lá chỉ chứa đúng 1 khách), nên gặp khách lạ thì đoán sai. Mẹo: luôn in điểm học cạnh điểm thi, chênh càng nhiều càng phải nghi overfitting.", "There are only 235 customers and 2 months of data. A deeper tree memorizes random details of single customers (some leaves hold just 1 customer), so it guesses wrong on new ones. Tip: always print the train score next to the test score; the bigger the gap, the more you should suspect overfitting.")}</p>'
        f'<p>{t("Mọi điểm số chạy thật bằng DecisionTreeClassifier trong notebook của video, độ sâu 1 tới 13 (13 là cây tự do).", "Every score was really computed with DecisionTreeClassifier in the video’s notebook, depth 1 to 13 (13 is the unlimited tree).")}</p></details>\n</section>')

    # Trạm 4: PID (362)
    bo_pid = [("1", "0", "0", "P Kp=1"), ("4", "0", "0", "P Kp=4"), ("1", "8", "0", "PI"), ("1", "8", "0.02", "PID")]
    pid = mo_dau("pid", t("Trạm 4 · Video 362", "Station 4 · Video 362"),
                 t("Giữ bánh xe quay đúng 10 rad/s khi khách đặt thêm 4 ly", "Keep the wheel at 10 rad/s when 4 cups land on the tray"),
                 t("Robot giao trà sữa đo tốc độ bánh 100 lần mỗi giây rồi sửa điện áp. Vặn 3 núm P, I, D rồi bấm Chạy. Giây thứ 2, nhân viên đặt 4 ly lên khay.",
                   "The delivery robot measures its wheel speed 100 times a second and corrects the voltage. Turn the P, I and D knobs, then press Run. At second 2, staff put 4 cups on the tray.")) + (
        '<div class="pdl-pid"><figure class="pdl-hinh"><svg id="pid-ve" class="pdl-svg" viewBox="0 0 640 280" role="img" aria-label=""></svg></figure>'
        '<div class="pdl-num">'
        + "".join(f'<label class="bn-lbl" for="pid-{k}">{ten} <b id="pid-{k}-so"></b></label><input type="range" id="pid-{k}" min="0" max="{mx}" step="{st}" value="{v}">'
                  for k, ten, mx, st, v in (("kp", t("P · đẩy theo sai số", "P · push by the error"), "6", "0.1", "1"),
                                            ("ki", t("I · cộng dồn sai số", "I · add up the error"), "16", "0.5", "0"),
                                            ("kd", t("D · phanh trước", "D · brake early"), "0.1", "0.005", "0")))
        + f'<label class="bn-chk"><input type="checkbox" id="pid-tai" checked> {t("Đặt 4 ly lên khay ở giây 2", "Put 4 cups on the tray at second 2")}</label>'
        + f'<div class="bn-hang"><button type="button" class="btn" id="pid-chay">{t("Chạy", "Run")}</button></div>'
        + f'<p class="bn-lbl">{t("Bộ số trong video", "Settings from the video")}</p><div class="bn-hang">'
        + "".join(f'<button type="button" class="chip" data-pid="{kp},{ki},{kd}">{ten}</button>' for kp, ki, kd, ten in bo_pid)
        + '</div></div></div>\n<div class="pdl-o4" id="pid-o" aria-live="polite"></div>\n<div class="pdl-bit" id="pid-bit" aria-live="polite"></div>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: mô hình động cơ", "Under the hood: the motor model")}</summary>'
        f'<p>{t("Trang chạy đúng mô hình của video: động cơ τ·dω/dt = K·u − ω − tải (K = 2, τ = 0,15 s), lệnh điện áp tới trễ 30 ms, điện áp giới hạn ±12 V, encoder 360 vạch lấy trung bình 5 lần đo. Phần I có chống cộng dồn khi điện áp chạm trần.", "This page runs the exact model from the video: a motor τ·dω/dt = K·u − ω − load (K = 2, τ = 0.15 s), voltage arriving 30 ms late, ±12 V limit, a 360-tick encoder averaged over 5 readings. The I term stops adding up when the voltage hits the limit.")}</p>'
        f'<p>{t("Thử ngay như cuối video: đổi D lên 0,05 và xem điện áp rung thêm bao nhiêu.", "Try the video’s challenge: raise D to 0.05 and see how much more the voltage shakes.")}</p></details>\n</section>')

    # Trạm 5: định vị (363)
    dv = mo_dau("dinh-vi", t("Trạm 5 · Video 363", "Station 5 · Video 363"),
                t("Tắt bớt mốc trên trần, xem robot còn biết mình ở đâu không", "Switch off ceiling markers and see if the robot still knows where it is"),
                t("Robot chạy 3 vòng giao hàng. Chỉ đếm vòng bánh (odometry) thì lệch dần vì bánh phải mòn. EKF trộn thêm 8 mốc dán trần để tự sửa. Bấm vào mốc để tắt hoặc bật, rồi bấm Chạy.",
                  "The robot drives 3 delivery laps. Counting wheel turns alone (odometry) drifts because the right wheel is worn. The EKF mixes in 8 ceiling markers to correct itself. Tap a marker to switch it off or on, then press Run.")) + (
        '<figure class="pdl-hinh"><svg id="dv-ve" class="pdl-svg pdl-quan" viewBox="0 0 640 400" role="img" aria-label=""></svg>'
        f'<figcaption class="pdl-chu pdl-chu-mau"><span class="k-that">{t("Đường thật", "True path")}</span><span class="k-odo">{t("Chỉ odometry", "Odometry only")}</span>'
        f'<span class="k-ekf">EKF</span><span class="k-moc">{t("Mốc trần", "Ceiling marker")}</span></figcaption></figure>\n'
        f'<div class="bn-hang"><button type="button" class="btn" id="dv-chay">{t("Chạy 3 vòng", "Run 3 laps")}</button>'
        f'<button type="button" class="chip" id="dv-4">{t("Chỉ giữ 4 mốc (thử ngay của video)", "Keep only 4 markers (the video’s challenge)")}</button>'
        f'<button type="button" class="chip" id="dv-8">{t("Bật lại đủ 8 mốc", "All 8 markers back on")}</button></div>\n'
        f'<fieldset class="pdl-radio"><legend class="bn-lbl">{t("Khai cho EKF biết odometry đáng tin bao nhiêu", "Tell the EKF how much to trust odometry")}</legend>'
        f'<label><input type="radio" name="dv-q" value="that" checked> {t("Khai thật", "Honest")}</label>'
        f'<label><input type="radio" name="dv-q" value="qua"> {t("Khai quá tin", "Over-trusting")}</label></fieldset>\n'
        '<div class="pdl-o4" id="dv-o" aria-live="polite"></div>\n<div class="pdl-bit" id="dv-bit" aria-live="polite"></div>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: EKF làm gì mỗi bước", "Under the hood: what the EKF does each step")}</summary>'
        f'<p>{t("Mỗi 50 ms, EKF dự đoán vị trí mới từ encoder và vòng tròn không chắc chắn to ra. Camera ngửa lên trần 10 lần mỗi giây; thấy mốc nào trong vòng 1 m thì sửa vị trí theo mốc và vòng tròn co lại. Nguồn nào chính xác hơn được tin nhiều hơn.", "Every 50 ms the EKF predicts the new position from the encoders and its uncertainty circle grows. The upward camera looks 10 times a second; any marker within 1 m corrects the position and the circle shrinks. The more accurate source gets more weight.")}</p>'
        f'<p>{t("Trang chạy lại đúng mô phỏng của video ngay trên máy bạn (bánh phải to hơn 0,5%, mỗi bánh trượt ngẫu nhiên khoảng 1%). Trượt ngẫu nhiên nên số mỗi lần chạy lệch chút so với video: odometry lệch 2,9 m, EKF sai trung bình 1,8 cm.", "This page re-runs the video's simulation on your device (right wheel 0.5% bigger, about 1% random slip per wheel). Slip is random, so each run differs a little from the video: odometry 2.9 m off, EKF 1.8 cm average error.")}</p></details>\n</section>')

    # Trạm 6: A* (364)
    ban = "".join(f'<button type="button" class="chip" data-as-ban="{k}">{t("Bàn", "Table")} {k}</button>' for k in sorted(D["ban_do"]["ban"]))
    asao = mo_dau("a-sao", t("Trạm 6 · Video 364", "Station 6 · Video 364"),
                  t("Tìm đường cho robot giao trà sữa bằng A*", "Plan the delivery robot’s route with A*"),
                  t("Đây là bản đồ robot tự vẽ bằng LiDAR (xám nhạt là chỗ chưa biết, coi như cấm). Vật cản được phình thêm cho vừa thân robot. Chọn bàn cần giao rồi xem A* tìm đường, so với Dijkstra.",
                    "This is the map the robot drew with LiDAR (light grey is unknown, treated as blocked). Obstacles are padded to fit the robot's body. Pick a table and watch A* find the way, then compare with Dijkstra.")) + (
        '<figure class="pdl-hinh"><canvas id="as-ve" class="pdl-ban-do" width="640" height="400" role="img" aria-label=""></canvas>'
        f'<figcaption class="pdl-chu pdl-chu-mau"><span class="k-phinh">{t("Vùng phình", "Padding")}</span><span class="k-mo">{t("Ô đã mở", "Cells explored")}</span>'
        f'<span class="k-duong">{t("Đường đi", "Route")}</span></figcaption></figure>\n'
        f'<p class="bn-lbl">{t("Giao tới", "Deliver to")}</p><div class="bn-hang" id="as-ban">{ban}</div>\n'
        f'<fieldset class="pdl-radio"><legend class="bn-lbl">{t("Thuật toán", "Algorithm")}</legend>'
        f'<label><input type="radio" name="as-cach" value="a" checked> A*</label><label><input type="radio" name="as-cach" value="d"> Dijkstra</label></fieldset>\n'
        f'<label class="bn-lbl" for="as-chua">{t("Chừa thêm quanh thân robot (bán kính 25 cm)", "Extra margin around the robot (radius 25 cm)")} <b id="as-chua-so"></b></label>\n'
        '<input type="range" id="as-chua" min="0" max="20" step="5" value="10">\n'
        f'<fieldset class="pdl-radio"><legend class="bn-lbl">{t("Bấm lên bản đồ để", "Tap the map to")}</legend>'
        f'<label><input type="radio" name="as-bam" value="cot" checked> {t("Dời cây cột tới đó", "Move the pillar there")}</label>'
        f'<label><input type="radio" name="as-bam" value="nguoi"> {t("Thêm một khách đứng chắn", "Add a customer standing there")}</label></fieldset>\n'
        f'<div class="bn-hang"><button type="button" class="btn btn-nhe" id="as-lai">{t("Đặt lại bản đồ", "Reset the map")}</button></div>\n'
        '<div class="pdl-o4" id="as-o" aria-live="polite"></div>\n<div class="pdl-bit" id="as-bit" aria-live="polite"></div>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: A* chấm điểm ô thế nào", "Under the hood: how A* scores a cell")}</summary>'
        f'<p>{t("Mỗi ô có điểm f = g + h: g là quãng đã đi từ chỗ robot, h là quãng ước lượng còn lại tới bàn (đi 8 hướng, không cắt góc). A* luôn mở ô có f nhỏ nhất nên lao về phía đích. Dijkstra bỏ h nên loang đều ra mọi phía, cùng đường ngắn nhất nhưng mở nhiều ô hơn.", "Each cell scores f = g + h: g is the distance already travelled, h is the estimated distance left to the table (8 directions, no corner cutting). A* always opens the lowest f, so it heads for the goal. Dijkstra drops h and spreads evenly in every direction: same shortest path, many more cells opened.")}</p>'
        f'<p>{t("Bản đồ là lưới ô 5 cm, 160 x 100 ô, lấy đúng từ lần khảo sát 43 giây trong video. Thử ngay như cuối video: dời cây cột rồi so đường mới với đường cũ.", "The map is a 5 cm grid, 160 x 100 cells, taken from the video's 43-second survey run. The video's challenge: move the pillar and compare the new route with the old one.")}</p></details>\n</section>')

    # Trạm 7: xuống núi trong sương mù (series "AI học như thế nào": 38 núm vặn, 39 sai số, 40 xuống dốc, 41 truy ngược lỗi)
    xn = mo_dau("xuong-nui", t("Trạm 7 · Video 38, 39, 40, 41", "Station 7 · Videos 38, 39, 40, 41"),
                t("Xuống núi trong sương mù: tự vặn núm, rồi để máy bước xuống dốc", "Downhill in the fog: turn the knob yourself, then let the machine step down"),
                t("Tiệm muốn đoán mỗi giờ bán bao nhiêu ly từ số khách vào quán. Model chỉ có một núm vặn w: số ly = w × số khách. Ngọn núi sai số cho biết mỗi vị trí núm sai bao nhiêu, nhưng phủ đầy sương: bạn chỉ thấy quanh chỗ mình đứng.",
                  "The shop wants to guess how many cups it sells each hour from how many customers walk in. The model has one knob, w: cups = w × customers. The loss mountain shows how wrong every knob position is, but it's covered in fog: you only see around where you stand.")) + (
        '<div class="pdl-xn"><figure class="pdl-hinh"><svg id="xn-cua" class="pdl-svg" viewBox="0 0 400 260" role="img" aria-label=""></svg>'
        f'<figcaption class="pdl-chu">{t("Mỗi chấm là một giờ bán hàng. Đường cam là model đoán, vạch đỏ là chỗ đoán lệch.", "Each dot is one hour of sales. The orange line is the model’s guess; red dashes show how far off it is.")}</figcaption></figure>'
        '<figure class="pdl-hinh"><svg id="xn-nui" class="pdl-svg" viewBox="0 0 400 260" role="img" aria-label=""></svg>'
        f'<figcaption class="pdl-chu">{t("Độ cao là sai số. Chấm xanh là bạn, mũi tên vàng là hướng xuống dốc dò được dưới chân.", "Height is the loss. The blue dot is you; the yellow arrow is the downhill direction your feet can feel.")}</figcaption></figure></div>\n'
        '<div class="pdl-o4" id="xn-o" aria-live="polite"></div>\n'
        '<div class="pdl-xn-dk"><div>'
        f'<h3>{t("1. Tự vặn núm bằng tay", "1. Turn the knob by hand")}</h3>'
        f'<label class="bn-lbl" for="xn-w">{t("Núm w: mỗi khách mua bao nhiêu ly. Nhìn con số sai số (video 39)", "Knob w: cups per customer. Watch the loss number (video 39)")}</label>'
        '<input type="range" id="xn-w" min="0" max="3" step="0.01" value="0.2">'
        f'<p class="pdl-diem" id="xn-tot" aria-live="polite">{t("Kéo núm, xem ô Sai số tăng hay giảm.", "Drag the knob and watch the Loss tile go up or down.")}</p>'
        '</div><div>'
        f'<h3>{t("2. Để máy tự bước xuống dốc", "2. Let the machine step downhill")}</h3>'
        f'<label class="bn-lbl" for="xn-lr">{t("Độ dài bước (learning rate)", "Step size (learning rate)")} <b id="xn-lr-so"></b></label>'
        '<input type="range" id="xn-lr" min="0" max="9" step="1" value="1">'
        f'<div class="bn-hang"><button type="button" class="btn" id="xn-buoc">{t("Bước xuống", "Step down")}</button>'
        f'<button type="button" class="btn btn-nhe" id="xn-5">{t("Đi 5 bước", "Take 5 steps")}</button>'
        f'<button type="button" class="chip" id="xn-dinh">{t("Về đỉnh", "Back to the top")}</button></div>'
        f'<div class="bn-hang"><button type="button" class="chip" data-xn-lr="1">{t("Bước ngắn", "Short steps")}</button>'
        f'<button type="button" class="chip" data-xn-lr="4">{t("Bước vừa", "Just right")}</button>'
        f'<button type="button" class="chip" data-xn-lr="8">{t("Bước dài", "Long steps")}</button></div>'
        '</div></div>\n'
        f'<div class="pdl-thu" id="xn-thu" aria-live="polite"><span aria-hidden="true">🏁</span><p></p></div>\n'
        '<div class="pdl-bit" id="xn-bit" aria-live="polite" hidden></div>\n'
        f'<label class="bn-chk"><input type="checkbox" id="xn-vem"> {t("Vén sương xem cả ngọn núi (máy thật không bao giờ được thấy thế này)", "Lift the fog to see the whole mountain (a real machine never gets this view)")}</label>\n'
        f'<details class="bn-nap"><summary>{t("Mở nắp: máy tính độ dốc thế nào", "Under the hood: how the machine finds the slope")}</summary>'
        f'<p>{t("Sai số là trung bình bình phương độ lệch giữa số ly đoán và số ly thật của 10 giờ bán hàng. Độ dốc dưới chân là đạo hàm của sai số theo w. Mỗi bước: w mới = w − độ dài bước × độ dốc. Dốc càng đứng thì bước càng xa, tới đáy thì dốc gần 0 nên tự dừng.", "The loss is the average squared gap between the guessed and the real cups over 10 hours of sales. The slope under your feet is the derivative of the loss with respect to w. Each step: new w = w − step size × slope. The steeper the slope, the bigger the move; at the bottom the slope is almost 0, so it stops by itself.")}</p>'
        f'<p>{t("Ở đây chỉ có một núm nên núi là một đường cong. Chatbot lớn có hàng trăm tỷ núm, núi có hàng trăm tỷ chiều, và mỗi bước vặn mọi núm cùng lúc. Độ dốc của từng núm được tính bằng lan truyền ngược (video 41): lỗi ở đầu ra chảy ngược về từng lớp.", "Here there is one knob, so the mountain is a single curve. A large chatbot has hundreds of billions of knobs, a mountain with hundreds of billions of dimensions, and each step turns every knob at once. The slope for each knob comes from backpropagation (video 41): the error at the output flows back through every layer.")}</p></details>\n</section>')

    ky_hieu = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
               '<symbol id="pdl-cot" viewBox="0 0 24 24"><rect x="3" y="10" width="4" height="11" rx="1" fill="currentColor"/><rect x="10" y="5" width="4" height="16" rx="1" fill="currentColor"/><rect x="17" y="13" width="4" height="8" rx="1" fill="currentColor"/></symbol>'
               '<symbol id="pdl-duong" viewBox="0 0 24 24"><polyline points="2,18 8,11 13,14 22,4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>'
               '<symbol id="pdl-tron" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 12V3M12 12l7 5" stroke="currentColor" stroke-width="2.5" fill="none"/></symbol>'
               '<symbol id="pdl-chong" viewBox="0 0 24 24"><rect x="4" y="12" width="6" height="9" fill="currentColor"/><rect x="4" y="5" width="6" height="7" fill="currentColor" opacity=".45"/><rect x="14" y="9" width="6" height="12" fill="currentColor"/><rect x="14" y="3" width="6" height="6" fill="currentColor" opacity=".45"/></symbol>'
               '</svg>')
    du_lieu = json.dumps(D, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tieu = t("Phòng thí nghiệm dữ liệu và robot: biểu đồ, precision, overfitting, PID, EKF, A*, xuống dốc",
             "Data and robot lab: charts, precision, overfitting, PID, EKF, A*, gradient descent")
    desc = t("Phòng thí nghiệm miễn phí với số thật của một tiệm trà sữa: chọn biểu đồ đúng, kéo ngưỡng xem precision và recall, xem cây quyết định học vẹt, chỉnh PID bánh xe, tắt mốc định vị EKF, tìm đường A* cho robot giao hàng, dẫn model xuống núi sai số trong sương mù.",
             "Free hands-on lab with a milk tea shop's real numbers: pick the right chart, drag a threshold to trade precision for recall, watch a decision tree overfit, tune a wheel PID, switch off EKF landmarks, plan a delivery robot's route with A*, and walk a model down the foggy loss mountain.")
    band = (f'<div class="head-row"><div>\n<p class="eyebrow">{t("Phòng thí nghiệm · chạy ngay trên trình duyệt · số thật từ video", "Lab · runs in your browser · real numbers from the videos")}</p>\n'
            f'<h1>{t("Phòng thí nghiệm dữ liệu và robot", "Data and robot lab")}</h1>\n'
            f'<p class="lead">{t("Tự tay làm những gì các series Data Analysis, Machine Learning và Robotics giải thích, trên cùng một tiệm trà sữa. Chọn một trạm bên trái, mỗi trạm chừng một phút.", "Do by hand what the Data Analysis, Machine Learning and Robotics series explain, all on the same milk tea shop. Pick a station on the left; each takes about a minute.")}</p>\n'
            f'</div><img class="head-art" src="{p}assets/bit-y-tuong.svg" alt="" width="180" height="170"></div>')
    main = (f'<main class="bn pdl" id="pdl">\n<link rel="stylesheet" href="{p}assets/tro-choi/phong-du-lieu.css?v=dev">\n{ky_hieu}\n{ngan}\n<div class="bn-ban">\n'
            f'{bd}\n{ng}\n{hv}\n{pid}\n{dv}\n{asao}\n{xn}\n'
            f'{khoi_chia_se(BASE + GOC + "phong-thi-nghiem-du-lieu.html", tieu, p)}\n'
            f'<p class="gh-ghi">{t("Mọi thứ chạy trên máy bạn, không gửi gì đi đâu. Tiệm trà sữa, khách và robot là dữ liệu giả lập để học, số liệu lấy từ notebook và code thực hành của từng video.", "Everything runs on your device; nothing is sent anywhere. The shop, its customers and the robot are simulated for learning; the numbers come from each video's notebook and practice code.")}</p>\n'
            f'<noscript><p>{t("Phòng thí nghiệm cần JavaScript.", "The lab needs JavaScript.")}</p></noscript>\n</div>\n'
            f'<script type="application/json" id="pdl-du-lieu">{du_lieu}</script>\n</main>')
    return GOC + "phong-thi-nghiem-du-lieu.html", trang("phong-thi-nghiem-du-lieu.html", f"{tieu} | {SITE}", desc, band, main, p, og_type="website", q="",
                                                         cuoi=f'<script src="{p}phong-du-lieu.js?v=dev" defer></script>\n<script src="{p}bai-viet.js?v=dev" defer></script>\n')

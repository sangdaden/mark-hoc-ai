// Trò chơi tương tác trên trang đọc "Mark ở vũ trụ khác" (mọi chủ đề).
// Dữ liệu từng bài ở data/vu-tru-khac-tro-choi.json; scripts/tao_vu_tru_khac.py chép phần của bài vào
// <script type="application/json" id="vtk-tro-choi"> và gắn file này trước doc.js (để mục lục có link "Chơi thử").
// Khuôn: quyet-dinh (bạn quyết định, biểu đồ chấm có nhóm ẩn), doan (quay số rồi đoán), doan-so (đoán một con số), phan-loai (kéo thả vào ngăn);
// bản 2 thêm: bac-thang (nhập vai), thu-tu (xếp dòng thời gian), dem-cham (thử chú ý), phan-xa (bấm giờ), dieu-khien (phòng điều khiển),
// soi-loi (soi tài liệu), hop-thu (hộp thư khẩn), ban-thai (máy tính bán thải), tri-nho (thử trí nhớ), dam-dong (áp lực đám đông);
// bản 3 (cảnh có đồ vật kéo thả, hoạt cảnh): doan-tau (nối toa), domino (chuỗi nguyên nhân), pho-mai (lớp chắn có lỗ), lo-phan-ung (thanh điều khiển),
// cho-keo (chờ viên kẹo), lap-rap (tự lắp kệ rồi ra giá), ten-lua (chọn nhiệt độ rồi phóng).
// bản 4 (cảnh mới cho Lầm tưởng, Thất bại kinh doanh, Sự kiện): ve-duong (vẽ đường đoán), can-thang-bang (cái cân), chia-nhom (phòng thí nghiệm),
// lan-theo-nguon (bảng điều tra), kim-tu-thap (tin xấu đi lên), xay-thap (tháp vay nợ), dong-tien (ống tiền ngầm), doan-vi-tri (cắm cờ trên thước),
// nao-chia-doi (não chia đôi), ban-tron (lời, giọng, mặt), hop-nhom (hai phòng họp), nhan-chung (nhân chứng), cham-mu (chấm khi bị dặn trước),
// hau-truong (sau tấm rèm), tong-dai (thử mù rồi tổng đài), pheu (phễu người dùng), ket-sat (két và màn hình), nhap-vai (nhập vai nhiều cảnh).
// đợt 1 (cảnh riêng cho Sách, Thí nghiệm): gay-bong (gậy và bóng), cung-dien (cung điện trí nhớ), kenh-dong-chay (kênh dòng chảy),
// ban-chu-y (bàn 4 ô chú ý), vong-may (thở cùng đám mây, không điểm), vong-quan-he (giữ lửa quan hệ), cau-chuyen-chung (vượt 150 người),
// khoang-trong (khoảng trống trước khi đáp), ban-viec-do (việc bị ngắt), ban-mut (bàn thử mứt), mo-neo (vòng quay và mỏ neo),
// san-bong (sân bóng và đèn pin chú ý), may-photo (hàng photocopy), phong-asch (phòng thử thị giác), lop-hoc (cô giáo lớp 1), bien-the (bốn mươi chiếc ghế).
// đợt 2 (Thảm họa, Lầm tưởng): quy-dao (quỹ đạo trôi), song-radio (hai sóng radio trong sương), tau-chim (đạt chuẩn, thiếu xuồng),
// slide-giau-dong (tấm slide và mảnh bọt), may-chu (tám máy chủ), buong-lai (buồng lái rung), ly-gio-luyen (ly giờ luyện), be-ca (bể cá học giờ ăn);
// ten-lua thêm bieu_do, lo-phan-ung thêm an_bien, pho-mai thêm dung_o và dong_ho (đều tùy chọn).
// đợt 3 (Sự kiện lớn): ban-dieu-phoi (bàn điều phối COVID-19), phong-may-y2k (phòng máy Y2K), bom-bong-bong (bơm bong bóng dot-com),
// thang-leo-thang (thang leo thang Cuba), vong-khoanh (khoanh vùng SARS), pho-ngan-hang (phố ngân hàng 1929), van-cfc (van CFC tầng ozone),
// van-dau (van dầu 1973), thap-vay-ngan (tháp vay ngắn châu Á 1997), va-de (vá đê Katrina).
// đợt 4 (Bài báo đổi cách ta học): duong-cong-on (đường cong quên và lịch ôn), gom-cum (gom cụm, con số 7), hai-duong-nho (hai đường nhớ của H.M.),
// lan-bien (học trên bờ, dưới nước), ban-chat (bàn chật, tải nhận thức), tua-tuan (đọc hay tự kiểm tra), xep-cach-hoc (xếp 10 cách học),
// duong-cong-sigma (kéo đường cong 2 sigma), nua-doi-on-tu (nửa đời của một từ), dap-an-hay-goi-y (xin đáp án hay xin gợi ý).
// Kéo thả dùng pointer events (chuột và cảm ứng), thêm cách chạm câu rồi chạm ngăn, và bàn phím (Enter/Space).
(function () {
  var nguon = document.getElementById("vtk-tro-choi");
  if (!nguon) return;
  var ds;
  try { ds = JSON.parse(nguon.textContent); } catch (e) { return; }
  var en = document.documentElement.lang === "en";
  var NS = "http://www.w3.org/2000/svg";
  var giam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tao(ten, lop, chu) {
    var e = document.createElement(ten);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function svg(cha, ten, thuoc, chu) {
    var e = document.createElementNS(NS, ten);
    for (var k in thuoc) e.setAttribute(k, thuoc[k]);
    if (chu != null) e.textContent = chu;
    cha.appendChild(e);
    return e;
  }
  function dien(mau, gt) { return mau.replace(/\{(\w+)\}/g, function (_, k) { return gt[k]; }); }
  function nut(chu, chinh) { var b = tao("button", "tc-nut" + (chinh ? " tc-chinh" : ""), chu); b.type = "button"; return b; }

  function khung(g, t) {
    var s = tao("section", "tc-khoi");
    s.id = g.id;
    s.setAttribute("aria-label", t.nhan);
    s.setAttribute("translate", "no"); // trình duyệt tự dịch thay chữ trong cảnh đang chạy và làm hỏng trò chơi; người đọc tiếng Anh dùng bản /en/
    s.appendChild(tao("span", "tc-muc", t.muc));
    s.appendChild(tao("h2", "", t.nhan));
    s.appendChild(tao("p", "tc-hoi", t.hoi));
    return s;
  }
  function chanNguon(s, t) { s.appendChild(tao("p", "tc-nguon", t.nguon)); }

  // ---------- Khuôn 1: bạn quyết định ----------
  function quyetDinh(g, t) {
    var s = khung(g, t), b = g.bieu_do;
    if (t.dan) s.appendChild(tao("p", "", t.dan));
    var hop = tao("div", "tc-bieu-do");
    var W = 480, H = 250, L = 34, R = 470, T = 26, D = 200;
    var c = svg(hop, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": t.truc_x + " / " + t.truc_y });
    var X = function (v) { return L + (v - b.x_min) * (R - L) / (b.x_max - b.x_min); };
    var Y = function (v) { return D - v * (D - T - 20) / b.y_max; };
    for (var v = 0; v <= b.y_max; v++) {
      svg(c, "line", { x1: L, x2: R, y1: Y(v), y2: Y(v), class: v ? "tc-luoi" : "tc-truc" });
      svg(c, "text", { x: L - 8, y: Y(v) + 4, "text-anchor": "end" }, v);
    }
    for (var x = Math.ceil(b.x_min / b.x_buoc) * b.x_buoc; x <= b.x_max; x += b.x_buoc)
      svg(c, "text", { x: X(x), y: D + 20, "text-anchor": "middle" }, x + b.x_don_vi);
    svg(c, "text", { x: (L + R) / 2, y: H - 4, "text-anchor": "middle", class: "tc-nhan-truc" }, t.truc_x);
    svg(c, "text", { x: 4, y: 16, class: "tc-nhan-truc" }, t.truc_y);
    if (b.vach != null) {
      svg(c, "line", { x1: X(b.vach), x2: X(b.vach), y1: T, y2: D, class: "tc-vach" });
      svg(c, "text", { x: X(b.vach) + 6, y: T + 12, class: "tc-nhan-vach" }, t.nhan_vach);
    }
    // Chấm trùng chỗ thì xếp lệch nhau cho thấy đủ số lượng
    var dem = {};
    function cham(cha, d, lop) {
      var k = d[0] + "_" + d[1], n = dem[k] = (dem[k] || 0) + 1;
      var cx = X(d[0]) + (d[1] ? (n - 1) * 10 : 0), cy = Y(d[1]) - (d[1] ? 0 : (n - 1) * 11 + 6);
      svg(cha, "circle", { cx: cx, cy: cy, r: d[1] ? 6.5 : 5, class: lop });
    }
    var an = svg(c, "g", { class: "tc-an" });
    (b.an || []).forEach(function (d) { cham(an, d, "tc-cham-0"); });
    b.diem.forEach(function (d) { cham(c, d, "tc-cham"); });
    s.appendChild(hop);

    var hang = tao("div", "tc-hang"), dap = tao("p", "tc-dap"), ket = tao("p", "tc-dap tc-ket");
    dap.hidden = ket.hidden = true;
    var moAn = nut(t.nut_an, false);
    t.chon.forEach(function (ch, i) {
      var bt = nut(ch.nhan, i === 0);
      bt.onclick = function () {
        hang.querySelectorAll("button").forEach(function (x) { x.disabled = true; x.classList.remove("tc-chinh"); });
        bt.classList.add("tc-da-chon");
        dap.textContent = ch.dap; dap.hidden = false;
        moAn.classList.add("tc-chinh");
      };
      hang.appendChild(bt);
    });
    moAn.onclick = function () { an.classList.add("tc-hien"); moAn.disabled = true; ket.textContent = t.ket; ket.hidden = false; };
    var hang2 = tao("div", "tc-hang"); hang2.appendChild(moAn);
    s.appendChild(hang); s.appendChild(dap); s.appendChild(hang2); s.appendChild(ket);
    chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn 2: quay số rồi đoán ----------
  function doan(g, t) {
    var s = khung(g, t);
    var hang = tao("div", "tc-quay");
    var banh = tao("div", "tc-banh");
    var c = svg(banh, "svg", { viewBox: "-100 -100 200 200", "aria-hidden": "true" });
    var n = 20;
    for (var i = 0; i < n; i++) {
      var a0 = i / n * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / n * 2 * Math.PI - Math.PI / 2, am = (a0 + a1) / 2;
      svg(c, "path", { d: "M0 0L" + 92 * Math.cos(a0) + " " + 92 * Math.sin(a0) + "A92 92 0 0 1 " + 92 * Math.cos(a1) + " " + 92 * Math.sin(a1) + "Z", class: i % 2 ? "tc-o2" : "tc-o1" });
      svg(c, "text", { x: 72 * Math.cos(am), y: 72 * Math.sin(am) + 3.5, "text-anchor": "middle" }, i * 5);
    }
    svg(c, "circle", { r: 9, class: "tc-tam" });
    banh.appendChild(tao("i", "tc-kim"));
    var ben = tao("div", "tc-ben");
    var quay = nut(t.nut_quay, true);
    var so = tao("b", "tc-so", "?");
    var dong = tao("p", ""); dong.appendChild(document.createTextNode(t.dung_o + " ")); dong.appendChild(so);
    ben.appendChild(quay); ben.appendChild(dong);
    hang.appendChild(banh); hang.appendChild(ben);
    s.appendChild(hang);

    var hoi = tao("div", "tc-doan"); hoi.hidden = true;
    var idThanh = g.id + "-thanh";
    var nhan = tao("label", "", t.cau + " "); nhan.htmlFor = idThanh;
    var gt = tao("b", "tc-so-nho", "50%"); nhan.appendChild(gt);
    var thanh = tao("input", ""); thanh.type = "range"; thanh.min = 0; thanh.max = 100; thanh.value = 50; thanh.id = idThanh;
    thanh.oninput = function () { gt.textContent = thanh.value + "%"; };
    var chot = nut(t.nut_chot, true);
    var h2 = tao("div", "tc-hang"); h2.appendChild(chot);
    hoi.appendChild(nhan); hoi.appendChild(thanh); hoi.appendChild(h2);
    s.appendChild(hoi);
    var ket = tao("div", "tc-doan"); ket.hidden = true;
    s.appendChild(ket);

    var moc = null, goc = 0;
    quay.onclick = function () {
      quay.disabled = true;
      moc = g.quay[Math.floor(Math.random() * g.quay.length)];
      var o = moc / 5;
      goc += 360 * 5 + (360 - (o + 0.5) * 360 / n) - (goc % 360);
      c.style.transform = "rotate(" + goc + "deg)";
      setTimeout(function () { so.textContent = moc; hoi.hidden = false; thanh.focus({ preventScroll: true }); }, giam ? 0 : 2400);
    };
    chot.onclick = function () {
      chot.disabled = thanh.disabled = true;
      var me = +thanh.value, khac = g.quay.filter(function (x) { return x !== moc; })[0];
      ket.appendChild(tao("p", "tc-dap", dien(t.ket, { a: moc, me: me, g: g.ket_qua[moc], b: khac, h: g.ket_qua[khac] })));
      var cot = tao("div", "tc-cot");
      [[t.ban, me, "tc-c-ban"]].concat(g.quay.map(function (q) { return [dien(t.nhom, { a: q }), g.ket_qua[q], q === moc ? "tc-c-cung" : "tc-c-khac"]; }))
        .forEach(function (r) {
          cot.appendChild(tao("span", "", r[0]));
          var o = tao("span", "tc-o"), v = tao("i", r[2]); v.style.width = r[1] + "%"; o.appendChild(v); cot.appendChild(o);
          cot.appendChild(tao("span", "tc-so-nho", r[1] + "%"));
        });
      ket.appendChild(cot);
      ket.hidden = false;
    };
    chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn 4: đoán một con số rồi so với kết quả thật ----------
  // g.so: [{ vi, en, so, hien }] các mốc để so (so = giá trị vẽ thanh, hien = chữ hiển thị, ví dụ "36,8%")
  function doanSo(g, t) {
    var s = khung(g, t);
    var hoi = tao("div", "tc-doan");
    var idThanh = g.id + "-thanh";
    var nhan = tao("label", "", t.cau + " "); nhan.htmlFor = idThanh;
    var gt = tao("b", "tc-so-nho", "50%"); nhan.appendChild(gt);
    var thanh = tao("input", ""); thanh.type = "range"; thanh.min = 0; thanh.max = 100; thanh.value = 50; thanh.id = idThanh;
    thanh.oninput = function () { gt.textContent = thanh.value + "%"; };
    var chot = nut(t.nut_chot, true);
    var h2 = tao("div", "tc-hang"); h2.appendChild(chot);
    hoi.appendChild(nhan); hoi.appendChild(thanh); hoi.appendChild(h2);
    s.appendChild(hoi);
    var ket = tao("div", "tc-doan"); ket.hidden = true;
    s.appendChild(ket);
    chot.onclick = function () {
      chot.disabled = thanh.disabled = true;
      var me = +thanh.value;
      ket.appendChild(tao("p", "tc-dap", dien(t.ket, { me: me })));
      var cot = tao("div", "tc-cot");
      [{ nhan: t.ban, so: me, hien: me + "%", lop: "tc-c-ban" }].concat(g.so.map(function (r, i) {
        return { nhan: r[en ? "en" : "vi"], so: r.so, hien: (en && r.hien_en) || r.hien, lop: i === g.so.length - 1 ? "tc-c-khac" : "tc-c-cung" };
      })).forEach(function (r) {
        cot.appendChild(tao("span", "", r.nhan));
        var o = tao("span", "tc-o"), v = tao("i", r.lop); v.style.width = Math.max(r.so, 1) + "%"; o.appendChild(v); cot.appendChild(o);
        cot.appendChild(tao("span", "tc-so-nho", r.hien));
      });
      ket.appendChild(cot);
      ket.hidden = false;
    };
    chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn 3: kéo thả vào ngăn ----------
  // Thẻ đặt vào ngăn rồi vẫn đổi được: kéo hoặc chạm sang ngăn khác, hay về hàng thẻ ban đầu. Chỉ chấm khi bấm "Kiểm tra" (bật khi đã xếp hết).
  function phanLoai(g, t) {
    var s = khung(g, t);
    var dong = tao("div", "tc-dong");
    dong.setAttribute("aria-label", en ? "Unsorted claims" : "Các câu chưa xếp");
    dong.tabIndex = 0; dong.setAttribute("role", "button");
    var ngan = tao("div", "tc-ngan");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var kiem = nut(t.nut_kiem || (en ? "Check answers" : "Kiểm tra"), true);
    var hangKiem = tao("div", "tc-hang"); hangKiem.appendChild(kiem);
    var chon = null, xong = false;
    var cacNgan = Object.keys(t.ngan).map(function (k) {
      var n = tao("div", "tc-o-ngan tc-k-" + k);
      n.dataset.k = k; n.tabIndex = 0; n.setAttribute("role", "button");
      n.appendChild(tao("b", "", t.ngan[k]));
      ngan.appendChild(n);
      return n;
    });
    var dich = cacNgan.concat([dong]);   // nơi thả được: ba ngăn và hàng thẻ ban đầu
    // Xáo thứ tự để không đoán được nhãn theo vị trí
    var the = g.the.slice();
    for (var j = the.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)), tam = the[j]; the[j] = the[r]; the[r] = tam; }
    the.forEach(function (th) {
      var x = th[en ? "en" : "vi"];
      var e = tao("div", "tc-the", x[0]);
      e.tabIndex = 0; e.setAttribute("role", "button"); e.setAttribute("aria-pressed", "false");
      e.dataset.k = th.k; e.dataset.ly = x[1];
      dong.appendChild(e);
    });
    function capNhat() {
      var con = dong.querySelectorAll(".tc-the").length;
      kiem.disabled = con > 0;
      dong.classList.toggle("tc-trong", con === 0);
    }
    function boChon() {
      s.querySelectorAll(".tc-the").forEach(function (x) { x.classList.remove("tc-dang"); x.setAttribute("aria-pressed", "false"); });
      chon = null; s.classList.remove("tc-dang-chon");
    }
    function tha(e, n) {
      if (!e || xong || !n) return;
      boChon();
      if (e.parentNode !== n) n.appendChild(e);
      capNhat();
    }
    function bam(e) {
      if (!e || xong) return;
      var lai = e === chon; boChon();
      if (!lai) { chon = e; e.classList.add("tc-dang"); e.setAttribute("aria-pressed", "true"); s.classList.add("tc-dang-chon"); }
    }
    kiem.onclick = function () {
      if (xong) return;
      xong = true; boChon();
      var dung = 0;
      cacNgan.forEach(function (n) {
        n.querySelectorAll(".tc-the").forEach(function (e) {
          var ok = e.dataset.k === n.dataset.k; if (ok) dung++;
          e.classList.add(ok ? "tc-dung" : "tc-sai");
          e.removeAttribute("role"); e.removeAttribute("aria-pressed"); e.tabIndex = -1;
          e.appendChild(tao("small", "", (ok ? t.dung + " " : t.dap_an + " " + t.ngan[e.dataset.k] + ". ") + e.dataset.ly));
        });
        n.removeAttribute("role"); n.tabIndex = -1;
      });
      dong.removeAttribute("role"); dong.tabIndex = -1;
      s.classList.add("tc-xong");
      hangKiem.hidden = true;
      ket.textContent = dien(t.ket, { d: dung, n: g.the.length }); ket.hidden = false;
    };
    // Chạm hoặc Enter: lần đầu chọn thẻ, lần sau chạm vào ngăn khác (hay hàng thẻ ban đầu) để chuyển thẻ đó sang.
    function chamVao(ev) {
      var e = ev.target.closest(".tc-the"), n = ev.target.closest(".tc-o-ngan, .tc-dong");
      if (chon && n && n !== chon.parentNode) { tha(chon, n); return true; }
      if (e) { bam(e); return true; }
      return false;
    }
    s.addEventListener("click", function (ev) { if (!keo && !xong) chamVao(ev); });
    s.addEventListener("keydown", function (ev) {
      if (xong || (ev.key !== "Enter" && ev.key !== " ")) return;
      if (chamVao(ev)) ev.preventDefault();
    });
    // Kéo bằng chuột hoặc ngón tay: chỉ thành "kéo" khi đã di quá 8px, dưới mức đó là chạm để chọn
    var dang = null, bong = null, x0 = 0, y0 = 0, keo = false;
    s.addEventListener("pointerdown", function (ev) {
      var e = ev.target.closest(".tc-the");
      if (!e || xong || ev.button > 0) return;
      dang = e; x0 = ev.clientX; y0 = ev.clientY; keo = false;
    });
    function tren(ev) {
      var thay = null;
      dich.forEach(function (n) {
        var r = n.getBoundingClientRect();
        var o = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
        n.classList.toggle("tc-tren", o); if (o) thay = n;
      });
      return thay;
    }
    addEventListener("pointermove", function (ev) {
      if (!dang) return;
      if (!keo && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 8) return;
      if (!keo) {
        keo = true; boChon(); bong = dang.cloneNode(true); bong.classList.add("tc-bong");
        bong.style.width = dang.offsetWidth + "px"; document.body.appendChild(bong); dang.classList.add("tc-mo");
        s.classList.add("tc-dang-keo");
      }
      ev.preventDefault();
      bong.style.left = ev.clientX - 24 + "px"; bong.style.top = ev.clientY - 18 + "px";
      tren(ev);
    }, { passive: false });
    function het(ev) {
      if (!dang) return;
      if (keo) {
        var n = ev && ev.type === "pointerup" ? tren(ev) : null;
        dich.forEach(function (x) { x.classList.remove("tc-tren"); });
        bong.remove(); dang.classList.remove("tc-mo"); s.classList.remove("tc-dang-keo");
        if (n) tha(dang, n);
        setTimeout(function () { keo = false; }, 0);
      }
      dang = null;
    }
    addEventListener("pointerup", het);
    addEventListener("pointercancel", het);
    s.appendChild(dong); s.appendChild(ngan); s.appendChild(hangKiem); s.appendChild(ket);
    capNhat();
    chanNguon(s, t);
    return s;
  }


  // ===== Các khuôn thêm sau (bản 2): mỗi khuôn một kiểu chơi khác nhau =====
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var r = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[r]; a[r] = x; } return a; }
  function so(x, le) { var c = x.toFixed(le || 0); return en ? c : c.replace(".", ","); }
  function ketVoiNut(ket, chu, nutLai, lam) {
    ket.textContent = chu; ket.hidden = false;
    if (nutLai) { var b = nut(nutLai, false); b.classList.add("tc-sau-ket"); b.onclick = lam; ket.appendChild(b); }
  }

  // ---------- Khuôn: nhập vai bậc thang (bấm mức cao dần, có câu thúc khi muốn dừng) ----------
  // g.buoc, g.toi_da, g.nguy (từ mức này tô đỏ); t.su_kien {mức: câu}, t.thuc [4 câu thúc], t.keu (câu hoặc danh sách câu kêu ở các mức nhỏ)
  function bacThang(g, t) {
    var s = khung(g, t), n = g.toi_da / g.buoc;
    var bang = tao("div", "tc-bang-cong-tac"); bang.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) bang.appendChild(tao("i"));
    bang.style.gridTemplateColumns = "repeat(" + n + ",1fr)";
    var nhan = tao("div", "tc-bang-nhan"); t.nhan_bang.forEach(function (x) { nhan.appendChild(tao("span", "", x)); });
    var chat = tao("div", "tc-chat"); chat.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bam = nut(dien(t.nut_bam, { v: g.buoc }), true), dung = nut(t.nut_dung, false);
    hang.appendChild(bam); hang.appendChild(dung);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var v, thuc, xong;
    function noi(chu, lop) { chat.appendChild(tao("p", lop, chu)); while (chat.children.length > 3) chat.removeChild(chat.firstChild); }
    function ve() { bang.querySelectorAll("i").forEach(function (x, k) { x.className = k < v / g.buoc ? (k >= g.nguy / g.buoc - 1 ? "tc-bat tc-nong" : "tc-bat") : ""; }); }
    function batDau() { v = 0; thuc = 0; xong = false; chat.innerHTML = ""; noi(t.mo, "tc-sep"); ket.hidden = true; bam.disabled = dung.disabled = false; bam.textContent = dien(t.nut_bam, { v: g.buoc }); dung.textContent = t.nut_dung; ve(); }
    function het(chu) { xong = true; bam.disabled = dung.disabled = true; ketVoiNut(ket, chu, t.nut_lai, batDau); }
    bam.onclick = function () {
      if (xong) return; thuc = 0; v += g.buoc; ve();
      if (t.su_kien[v]) noi(t.su_kien[v], "tc-nguoi-hoc");
      else if (t.keu && g.keu_tu <= v && v < g.keu_den && v % (2 * g.buoc) === g.buoc) {
        // t.keu có thể là một câu hoặc danh sách câu tăng dần, để không lặp y hệt hai dòng liền nhau
        var ds = [].concat(t.keu), k = Math.min(ds.length - 1, Math.floor((v - g.keu_tu) / (2 * g.buoc)));
        noi(ds[k], "tc-nguoi-hoc");
      }
      if (v >= g.toi_da) return het(t.het);
      bam.textContent = dien(t.nut_bam, { v: v + g.buoc }); dung.textContent = t.nut_dung;
    };
    dung.onclick = function () {
      if (xong) return;
      if (thuc < t.thuc.length) {
        noi(t.thuc[thuc], "tc-sep"); thuc++;
        dung.textContent = thuc < t.thuc.length ? t.nut_van_dung : t.nut_nhat; bam.textContent = dien(t.nut_thoi, { v: v + g.buoc });
        return;
      }
      het((v ? dien(t.dung_o, { v: v }) : t.khong_bam) + " " + (v < g.nguy ? t.som : t.muon));
    };
    s.appendChild(bang); s.appendChild(nhan); s.appendChild(chat); s.appendChild(hang); s.appendChild(ket);
    batDau(); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: xếp lại thứ tự (chạm theo thứ tự xảy ra) ----------
  // t.cac: [[mốc, câu], ...] đúng thứ tự
  function thuTu(g, t) {
    var s = khung(g, t), ds = tao("div", "tc-thu-tu"), ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var hang = tao("div", "tc-hang"), kiem = nut(t.nut_kiem, true), lai = nut(t.nut_lai, false);
    hang.appendChild(kiem); hang.appendChild(lai);
    var thu = [], the = [], xong = false;
    function ve() { the.forEach(function (b) { var k = thu.indexOf(+b.dataset.i); b.classList.toggle("tc-da-xep", k >= 0); b.firstChild.textContent = k >= 0 ? k + 1 : "?"; b.setAttribute("aria-pressed", k >= 0); }); kiem.disabled = thu.length < t.cac.length; }
    function batDau() {
      ds.innerHTML = ""; thu = []; xong = false; ket.hidden = true;
      var vt = t.cac.map(function (_, i) { return i; });
      do { vt = tron(vt); } while (vt.every(function (x, i) { return x === i; }));
      the = vt.map(function (i) {
        var b = nut("", false); b.className = "tc-buoc"; b.dataset.i = i;
        b.appendChild(tao("b", "", "?")); var c = tao("span", "", t.cac[i][1]); b.appendChild(c);
        b.onclick = function () { if (xong) return; var k = thu.indexOf(i); if (k >= 0) thu.splice(k, 1); else thu.push(i); ve(); };
        ds.appendChild(b); return b;
      });
      ve();
    }
    kiem.onclick = function () {
      xong = true; kiem.disabled = true; var d = 0;
      the.forEach(function (b) {
        var i = +b.dataset.i, k = thu.indexOf(i), ok = k === i; if (ok) d++;
        b.classList.add(ok ? "tc-dung" : "tc-sai");
        b.lastChild.appendChild(tao("small", "", t.cac[i][0] + " · " + (ok ? t.dung_cho : dien(t.sai_cho, { n: i + 1 }))));
      });
      the.slice().sort(function (a, b) { return a.dataset.i - b.dataset.i; }).forEach(function (b) { ds.appendChild(b); });
      ket.textContent = dien(t.ket, { d: d, n: t.cac.length }); ket.hidden = false;
    };
    lai.onclick = batDau;
    s.appendChild(ds); s.appendChild(hang); s.appendChild(ket);
    batDau(); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: đếm chấm (thử chú ý trên chính người đọc) ----------
  // Chấm trắng và đen nảy trong khung; người chơi đếm chấm trắng chạm cạnh trên. Giữa chừng một chữ thập xám đi ngang.
  function demCham(g, t) {
    var s = khung(g, t); if (t.dan) s.appendChild(tao("p", "", t.dan));
    var san = tao("div", "tc-san"), cv = tao("canvas"); cv.width = 640; cv.height = 300; cv.setAttribute("role", "img"); cv.setAttribute("aria-label", t.mo_ta);
    var phu = tao("div", "tc-phu"), bd = nut(t.nut_bat_dau, true); phu.appendChild(bd);
    san.appendChild(cv); san.appendChild(phu);
    var hoi = tao("div", "tc-hang tc-hoi-dem"); hoi.hidden = true;
    var idSo = g.id + "-so", lb = tao("label", "", t.dem_duoc + " "); lb.htmlFor = idSo;
    var o = tao("input", "tc-o-so"); o.type = "number"; o.min = 0; o.max = 99; o.id = idSo; o.inputMode = "numeric";
    hoi.appendChild(lb); hoi.appendChild(o); hoi.appendChild(tao("span", "", t.hoi_la));
    var co = nut(t.co, false), khong = nut(t.khong, false); hoi.appendChild(co); hoi.appendChild(khong);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var cx = cv.getContext("2d"), W = 640, H = 300, cham = [], dem = 0, raf = 0, t0 = 0, DAI = 16000;
    function mau(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888"; }
    function gieo() { var h = [[1.6, 1.1], [-1.3, 1.5], [1.1, -1.7], [-1.8, -1.0]]; cham = []; for (var i = 0; i < 8; i++) { var w = i < 4, v = h[i % 4]; cham.push({ x: 80 + i * 65, y: 60 + (i % 3) * 80, vx: v[0] * (w ? 1 : 1.15), vy: v[1] * (w ? 1 : 0.9), w: w }); } }
    function nen() { cx.fillStyle = mau("--paper"); cx.fillRect(0, 0, W, H); cx.strokeStyle = mau("--rule"); cx.lineWidth = 2; cx.strokeRect(1, 1, W - 2, H - 2); }
    function khung1(ts) {
      if (!t0) t0 = ts; var tt = ts - t0; nen();
      if (tt > 5000 && tt < 11000) { var p = (tt - 5000) / 6000, x = -30 + p * (W + 60), y = H / 2; cx.fillStyle = mau("--muted"); cx.fillRect(x - 22, y - 6, 44, 12); cx.fillRect(x - 6, y - 22, 12, 44); }
      cham.forEach(function (d) {
        d.x += d.vx * 1.3; d.y += d.vy * 1.3;
        if (d.x < 14) { d.x = 14; d.vx *= -1; } if (d.x > W - 14) { d.x = W - 14; d.vx *= -1; }
        if (d.y < 14) { d.y = 14; d.vy *= -1; if (d.w) dem++; } if (d.y > H - 14) { d.y = H - 14; d.vy *= -1; }
        cx.beginPath(); cx.arc(d.x, d.y, 12, 0, 7); cx.fillStyle = d.w ? "#ffffff" : "#0b0f19"; cx.fill();
        cx.strokeStyle = d.w ? "#9aa3b5" : mau("--muted"); cx.lineWidth = 2; cx.stroke();
      });
      if (tt < DAI) raf = requestAnimationFrame(khung1);
      else { phu.innerHTML = ""; phu.appendChild(tao("p", "", t.het_gio)); phu.hidden = false; hoi.hidden = false; o.focus({ preventScroll: true }); }
    }
    function chay() { cancelAnimationFrame(raf); gieo(); dem = 0; t0 = 0; phu.hidden = true; ket.hidden = true; hoi.hidden = true; o.value = ""; raf = requestAnimationFrame(khung1); }
    function tra(thay) {
      hoi.hidden = true; var b = parseInt(o.value, 10);
      ketVoiNut(ket, (isNaN(b) ? "" : dien(t.so_dem, { b: b, m: dem }) + " ") + t.lo + " " + (thay ? t.ket_co : t.ket_khong) + " " + t.ket, t.xem_lai, chay);
    }
    bd.onclick = chay; co.onclick = function () { tra(true); }; khong.onclick = function () { tra(false); };
    gieo(); nen();
    s.appendChild(san); s.appendChild(hoi); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: phản xạ có bấm giờ (buồng lái) ----------
  // t.coi: các đèn báo; t.lua: [[chữ nút, câu phản hồi]] với phản hồi rỗng = nút đúng
  function phanXa(g, t) {
    var s = khung(g, t); if (t.dan) s.appendChild(tao("p", "", t.dan));
    var buong = tao("div", "tc-buong"), den = tao("div", "tc-den"), troi = tao("div", "tc-troi"), doc = tao("p", "tc-doc"), hang = tao("div", "tc-hang");
    den.setAttribute("aria-live", "polite"); troi.setAttribute("aria-hidden", "true"); troi.appendChild(tao("i"));
    buong.appendChild(den); buong.appendChild(troi); buong.appendChild(doc); buong.appendChild(hang);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var t0 = 0, mui = 0, hen = null, dang = false, loi = "", loiDen = 0;
    function ve() { var x = 50 - mui * 12; troi.style.background = "linear-gradient(#3a6fd8 " + x + "%, #7a4a22 " + x + "%)"; }
    function lai() { hang.innerHTML = ""; den.innerHTML = ""; mui = 0; ve(); doc.textContent = t.binh_thuong; var b = nut(t.nut_go, true); b.onclick = catCanh; hang.appendChild(b); }
    function catCanh() { hang.innerHTML = ""; ket.hidden = true; doc.textContent = t.dang_len; setTimeout(su, 1500 + Math.random() * 2500); }
    function su() {
      dang = true;
      t.coi.forEach(function (c) { den.appendChild(tao("span", giam ? "" : "tc-nhay", c)); });
      tron(t.lua).forEach(function (l) {
        var b = nut(l[0], false);
        b.onclick = l[1] ? function () { loi = l[1]; loiDen = performance.now() + 1500; if (l[2]) mui = Math.max(0, mui - l[2]); } : function () { dung(false); };
        hang.appendChild(b);
      });
      t0 = performance.now();
      hen = setInterval(function () {
        var gi = (performance.now() - t0) / 1000; mui = Math.min(g.toi_da, mui + g.toc_do / 10); ve();
        doc.textContent = (performance.now() < loiDen ? loi + " · " : "") + dien(t.dong_ho, { m: so(mui, 2), s: so(gi, 1) });
        if (gi > 20) dung(true);
      }, 100);
    }
    function dung(tre) {
      if (!dang) return; dang = false; clearInterval(hen); den.innerHTML = ""; hang.innerHTML = "";
      ketVoiNut(ket, (tre ? t.qua_lau : dien(t.mat, { s: so((performance.now() - t0) / 1000, 1) })) + " " + t.ket, t.nut_lai, lai);
    }
    lai();
    s.appendChild(buong); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: phòng điều khiển (tìm và tắt máy hỏng trong khi đồng hồ lỗ chạy) ----------
  // g.tong (triệu), g.phut, g.may, g.gio_mo, g.phut_mo
  function dieuKhien(g, t) {
    var s = khung(g, t); if (t.dan) s.appendChild(tao("p", "", t.dan));
    var dau = tao("div", "tc-hang tc-dong-ho"), lo = tao("b", "tc-so", ""), gio = tao("span", "tc-so-nho", "");
    dau.appendChild(lo); dau.appendChild(gio);
    var luoi = tao("div", "tc-may"), hang = tao("div", "tc-hang"), mo = nut(t.nut_mo, true), go = nut(t.nut_go_ban, false);
    hang.appendChild(mo); hang.appendChild(go);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var toc = g.tong / g.phut, hong, nhip = null, p = 0, mat = 0, may = [], goHet = false, dangDoc = false;
    function soHong() { var n = 0; may.forEach(function (m, i) { if (!m.tat && (goHet || i === hong)) n++; }); return n; }
    function hienGio() { var m = g.phut_mo + p; gio.textContent = (g.gio_mo + Math.floor(m / 60)) + ":" + String(m % 60).padStart(2, "0"); }
    function batDau() {
      luoi.innerHTML = ""; may = []; hong = Math.floor(Math.random() * g.may); goHet = false; p = 0; mat = 0; ket.hidden = true; mo.disabled = false; go.disabled = true;
      lo.textContent = "0" + t.don_vi; hienGio();
      for (var i = 0; i < g.may; i++) (function (i) {
        var b = nut("", false); b.className = "tc-o-may"; b.appendChild(document.createTextNode(dien(t.may, { n: i + 1 })));
        var nho = tao("small", "", t.chua_kiem); b.appendChild(nho);
        b.onclick = function () {
          if (!nhip || dangDoc || may[i].tat) return; dangDoc = true; nho.textContent = t.dang_doc;
          setTimeout(function () {
            dangDoc = false;
            if (i === hong || goHet) { may[i].tat = true; b.classList.add("tc-hong"); b.disabled = true; nho.textContent = t.hong; if (!soHong()) het(true); }
            else nho.textContent = t.on;
          }, 1000);
        };
        luoi.appendChild(b); may.push({ b: b, tat: false });
      })(i);
    }
    function het(kip) {
      clearInterval(nhip); nhip = null; go.disabled = true;
      ketVoiNut(ket, (kip ? dien(t.kip, { p: p, l: Math.round(mat) }) : t.khong_kip) + " " + t.ket, t.nut_lai, batDau);
    }
    mo.onclick = function () {
      mo.disabled = true; go.disabled = false;
      nhip = setInterval(function () { p++; mat += toc * soHong(); lo.textContent = Math.round(mat) + t.don_vi; hienGio(); if (p >= g.phut) het(false); }, 1000);
    };
    go.onclick = function () { goHet = true; go.disabled = true; may.forEach(function (m) { if (!m.tat) m.b.lastChild.textContent = t.da_go; }); };
    s.appendChild(dau); s.appendChild(luoi); s.appendChild(hang); s.appendChild(ket);
    batDau(); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: soi tài liệu tìm dòng lỗi, rồi hiện biểu đồ hậu quả ----------
  // t.dong: [{chu, tieu_de?, loi?}]; t.cot: [{nhan, gt, hien, nong?}], t.nguong: {gt, nhan}
  function soiLoi(g, t) {
    var s = khung(g, t), tl = tao("div", "tc-tai-lieu"), ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    t.dong.forEach(function (d) {
      if (d.tieu_de) { tl.appendChild(tao("span", "tc-tieu-de", d.chu)); return; }
      var b = nut(d.chu, false); b.className = "tc-dong-tl";
      b.onclick = function () {
        if (d.loi) { b.classList.add("tc-dung"); tl.querySelectorAll("button").forEach(function (x) { x.disabled = true; }); ket.textContent = t.dung; ket.hidden = false; if (bd) bd.hidden = false; }
        else { b.classList.add("tc-sai"); ket.textContent = t.sai; ket.hidden = false; }
      };
      tl.appendChild(b);
    });
    s.appendChild(tl); s.appendChild(ket);
    var bd = null;
    if (t.cot) {
      bd = tao("div", "tc-bieu-do"); bd.hidden = true;
      var max = Math.max.apply(null, t.cot.map(function (c) { return c.gt; })) * 1.12, L = 150, R = 540, hcot = 40;
      var c = svg(bd, "svg", { viewBox: "0 0 560 " + (t.cot.length * hcot + 46), role: "img", "aria-label": t.mo_ta_bd });
      var X = function (v) { return L + v / max * (R - L); };
      t.cot.forEach(function (k, i) {
        var y = 14 + i * hcot;
        svg(c, "text", { x: L - 8, y: y + 15, "text-anchor": "end", class: "tc-nhan-truc" }, k.nhan);
        svg(c, "rect", { x: L, y: y, width: Math.max(2, X(k.gt) - L), height: 20, rx: 4, class: k.nong ? "tc-cot-nong" : "tc-cot-thuong" });
        var xc = X(k.gt) + 6; if (t.nguong && Math.abs(xc - X(t.nguong.gt)) < 40) xc = Math.max(xc, X(t.nguong.gt) + 6);
        svg(c, "text", { x: xc, y: y + 15 }, k.hien);
      });
      if (t.nguong) {
        var yb = t.cot.length * hcot + 14;
        svg(c, "line", { x1: X(t.nguong.gt), x2: X(t.nguong.gt), y1: 6, y2: yb, class: "tc-vach-do" });
        svg(c, "text", { x: X(t.nguong.gt) + 4, y: yb + 16, class: "tc-nhan-do" }, t.nguong.nhan);
      }
      s.appendChild(bd);
    }
    chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: hộp thư khẩn (chuyển lên hay để sau, rồi lộ chuyện thật) ----------
  // t.thu: [{gio, tu, chu, khan: true|false, that}]
  function hopThu(g, t) {
    var s = khung(g, t), hop = tao("div", "tc-hop-thu"), ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var con = t.thu.length, len = 0, tong = t.thu.filter(function (m) { return m.khan; }).length;
    t.thu.forEach(function (m) {
      var d = tao("div", "tc-thu"); d.appendChild(tao("span", "tc-thu-dau", m.gio + " · " + m.tu)); d.appendChild(tao("span", "", m.chu));
      var h = tao("div", "tc-hang"), a = nut(t.nut_chuyen, false), b = nut(t.nut_de, false); h.appendChild(a); h.appendChild(b); d.appendChild(h);
      function chon(lenTren) {
        h.remove(); d.classList.add("tc-da-xu"); if (m.khan) d.classList.add("tc-khan"); if (lenTren && m.khan) len++;
        d.appendChild(tao("span", "tc-thu-ket", (lenTren ? t.ban_chuyen : t.ban_de) + " " + (m.khan ? t.that_ra + " " + m.that : t.tin_thuong)));
        if (--con === 0) { ket.textContent = dien(t.ket, { d: len, n: tong }); ket.hidden = false; }
      }
      a.onclick = function () { chon(true); }; b.onclick = function () { chon(false); };
      hop.appendChild(d);
    });
    s.appendChild(hop); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: máy tính bán thải (ly cuối và giờ ngủ → phần trăm còn lại) ----------
  function banThai(g, t) {
    var s = khung(g, t), hai = tao("div", "tc-hai-cot");
    function thanh(id, chu, min, max, gt) {
      var l = tao("label", "tc-o-nhap"); l.htmlFor = g.id + "-" + id; l.appendChild(document.createTextNode(chu + " ")); var b = tao("b", "tc-so-nho"); l.appendChild(b);
      var i = tao("input"); i.type = "range"; i.min = min; i.max = max; i.step = 0.5; i.value = gt; i.id = g.id + "-" + id; l.appendChild(i); hai.appendChild(l); return [i, b];
    }
    var ly = thanh("ly", t.ly, 6, 22, g.ly), ngu = thanh("ngu", t.ngu, 20, 26, g.ngu);
    var bd = tao("div", "tc-bieu-do tc-duong"), c = svg(bd, "svg", { viewBox: "0 0 560 200", role: "img", "aria-label": t.mo_ta_bd });
    var ket = tao("p", "tc-dap");
    function hh(h) { h = ((h % 24) + 24) % 24; return Math.floor(h) + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0"); }
    function ve() {
      var a = +ly[0].value, b = Math.max(+ngu[0].value, a + 0.5); ly[1].textContent = hh(a); ngu[1].textContent = hh(b);
      while (c.firstChild) c.removeChild(c.firstChild);
      var x0 = 40, x1 = 540, y0 = 170, y1 = 20, h0 = 6, h1 = 30, X = function (h) { return x0 + (h - h0) / (h1 - h0) * (x1 - x0); }, Y = function (p) { return y0 - p * (y0 - y1); };
      [1, 0.5, 0.25].forEach(function (p) { svg(c, "line", { x1: x0, x2: x1, y1: Y(p), y2: Y(p), class: "tc-luoi" }); svg(c, "text", { x: x0 - 6, y: Y(p) + 4, "text-anchor": "end" }, p * 100 + "%"); });
      svg(c, "line", { x1: x0, x2: x1, y1: y0, y2: y0, class: "tc-truc" });
      for (var k = 6; k <= 30; k += 4) svg(c, "text", { x: X(k), y: 190, "text-anchor": "middle" }, hh(k));
      var duong = "", vung = "M" + X(a) + "," + Y(0);
      for (var h = a; h <= h1 + 0.01; h += 0.25) { var p = Math.pow(0.5, (h - a) / g.ban_thai), d = X(h).toFixed(1) + "," + Y(p).toFixed(1); duong += (duong ? "L" : "M") + d; vung += "L" + d; }
      vung += "L" + X(h1) + "," + Y(0) + "Z";
      svg(c, "path", { d: vung, class: "tc-vung" }); svg(c, "path", { d: duong, class: "tc-net" });
      var pb = Math.pow(0.5, (b - a) / g.ban_thai);
      svg(c, "line", { x1: X(b), x2: X(b), y1: y1, y2: y0, class: "tc-vach" }); svg(c, "circle", { cx: X(b), cy: Y(pb), r: 5, class: "tc-diem-ngu" });
      svg(c, "text", { x: Math.min(X(b) + 8, 450), y: Y(pb) - 10, class: "tc-nhan-vach" }, Math.round(pb * 100) + "% " + t.luc_ngu);
      ket.textContent = dien(t.ket, { ngu: hh(b), p: Math.round(pb * 100), ly: hh(a) }) + " " + (pb > 0.25 ? t.cao : t.thap);
    }
    ly[0].oninput = ngu[0].oninput = ve;
    s.appendChild(hai); s.appendChild(bd); s.appendChild(ket); ve(); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: thử trí nhớ hai vòng (nhớ thường, rồi nhớ bằng câu chuyện) ----------
  function triNho(g, t) {
    var s = khung(g, t), san = tao("div", "tc-tu"), hang = tao("div", "tc-hang"), di = nut(t.nut_v1, true), dh = tao("span", "tc-so-nho", "");
    hang.appendChild(di); hang.appendChild(dh);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var vong = 1, d1 = 0, hen = null;
    san.appendChild(tao("p", "tc-ghi", t.dan));
    function hien(ds, chuyen) {
      san.innerHTML = ""; ket.hidden = true; di.disabled = true;
      if (chuyen) san.appendChild(tao("p", "tc-dap tc-ca-hang", chuyen));
      ds.forEach(function (w) { san.appendChild(tao("span", "tc-chu", w)); });
      var giay = chuyen ? 30 : 20, xong = nut(t.nho_xong, false); xong.classList.add("tc-ca-hang");
      xong.onclick = function () { clearInterval(hen); hoi(ds); }; san.appendChild(xong);
      dh.textContent = dien(t.giay, { s: giay });
      hen = setInterval(function () { giay--; dh.textContent = dien(t.giay, { s: giay }); if (giay <= 0) { clearInterval(hen); hoi(ds); } }, 1000);
    }
    function hoi(ds) {
      san.innerHTML = ""; var chon = [];
      function demChon() { dh.textContent = t.chon + " · " + chon.length + "/" + ds.length; }
      demChon();
      tron(ds.concat(t.nhieu)).forEach(function (w) {
        var b = nut(w, false); b.className = "tc-chu";
        b.onclick = function () {
          var k = chon.indexOf(w);
          if (k < 0 && chon.length >= ds.length) return; // chỉ được chọn đúng bằng số thứ cần nhớ
          if (k >= 0) chon.splice(k, 1); else chon.push(w);
          b.classList.toggle("tc-da-chon-chu", k < 0); b.setAttribute("aria-pressed", k < 0); demChon();
        };
        san.appendChild(b);
      });
      var cham = nut(t.cham, true); cham.classList.add("tc-ca-hang"); san.appendChild(cham);
      cham.onclick = function () {
        var d = 0, sai = 0;
        san.querySelectorAll("button.tc-chu").forEach(function (b) { var w = b.textContent, co = ds.indexOf(w) >= 0, c = chon.indexOf(w) >= 0; b.disabled = true; if (c && co) { b.classList.add("tc-dung"); d++; } else if (c) { b.classList.add("tc-sai"); sai++; } else if (co) b.classList.add("tc-sot"); });
        cham.remove(); dh.textContent = "";
        // điểm = số đúng trừ số chọn nhầm (không âm), để bấm bừa không được điểm
        var diem = Math.max(0, d - sai);
        if (vong === 1) { d1 = diem; ket.textContent = dien(t.ket1, { d: d, s: sai, diem: diem }); di.textContent = t.nut_v2; vong = 2; }
        else { ket.textContent = dien(t.ket2, { d: d, s: sai, diem: diem, d1: d1 }); di.textContent = t.nut_lai; vong = 3; }
        ket.hidden = false; di.disabled = false;
      };
    }
    di.onclick = function () { if (vong === 3) vong = 1; if (vong === 1) hien(t.v1, null); else hien(t.v2, t.chuyen); };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Khuôn: áp lực đám đông (vài người trả lời trước, rồi tới bạn) ----------
  // g.luot: [{mau, abc: [3 độ dài], dung, nhom}]
  function damDong(g, t) {
    var s = khung(g, t), hinh = tao("div", "tc-bieu-do tc-duong-thang"), c = svg(hinh, "svg", { viewBox: "0 0 520 170", role: "img", "aria-label": t.mo_ta });
    var nguoi = tao("div", "tc-nguoi-ds"), hang = tao("div", "tc-hang"), ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var r = 0, theo = 0, kho = 0, K = ["A", "B", "C"];
    function ve(q) {
      while (c.firstChild) c.removeChild(c.firstChild);
      svg(c, "line", { x1: 60, x2: 60, y1: 150, y2: 150 - q.mau, class: "tc-net-dam" }); svg(c, "text", { x: 60, y: 167, "text-anchor": "middle", class: "tc-nhan-truc" }, t.mau);
      K.forEach(function (k, i) { var x = 260 + i * 90; svg(c, "line", { x1: x, x2: x, y1: 150, y2: 150 - q.abc[i], class: "tc-net-dam" }); svg(c, "text", { x: x, y: 167, "text-anchor": "middle", class: "tc-nhan-truc" }, k); });
    }
    function hangNguoi() {
      nguoi.innerHTML = "";
      t.ten.concat([t.ban]).forEach(function (n, i) { var p = tao("div", "tc-nguoi" + (i === t.ten.length ? " tc-ban" : "")); p.appendChild(tao("b", "", i === t.ten.length ? "?" : "")); p.appendChild(document.createTextNode(n)); nguoi.appendChild(p); });
    }
    function nutTiep(chu) { hang.innerHTML = ""; var b = nut(chu, true); b.onclick = choi; hang.appendChild(b); }
    function choi() {
      var q = g.luot[r]; ve(q); hangNguoi(); hang.innerHTML = ""; ket.hidden = true;
      var ps = nguoi.querySelectorAll(".tc-nguoi:not(.tc-ban)"), i = 0;
      (function tiep() {
        if (i < ps.length) { ps[i].classList.add("tc-da-noi"); ps[i].firstChild.textContent = q.nhom; i++; setTimeout(tiep, giam ? 150 : 550); return; }
        K.forEach(function (k) {
          var b = nut(dien(t.chon, { k: k }), false);
          b.onclick = function () {
            nguoi.querySelector(".tc-ban b").textContent = k; if (q.nhom !== q.dung) { kho++; if (k === q.nhom) theo++; } r++;
            if (r < g.luot.length) nutTiep(dien(t.nut_luot, { n: r + 1, t: g.luot.length }));
            else { hang.innerHTML = ""; ketVoiNut(ket, dien(t.ket, { c: kho, f: theo }), t.nut_lai, function () { r = 0; theo = 0; kho = 0; choi(); }); }
          };
          hang.appendChild(b);
        });
      })();
    }
    ve(g.luot[0]); hangNguoi(); nutTiep(dien(t.nut_luot, { n: 1, t: g.luot.length }));
    s.appendChild(hinh); s.appendChild(nguoi); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ===== Bản 3: các cảnh có đồ vật kéo thả và hoạt cảnh (SVG/canvas) =====
  function diemSvg(c, ev) { var p = c.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(c.getScreenCTM().inverse()); }
  function cotChu(g, x, y, ds, lop, lh) { ds.forEach(function (s, i) { svg(g, "text", { x: x, y: y + i * (lh || 15), "text-anchor": "middle", class: lop }, s); }); }
  function mau(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888"; }
  function canh(nen) { var d = tao("div", "tc-canh" + (nen ? " " + nen : "")); return d; }

  // Bảng chỗ đặt: kéo vật vào chỗ, đổi chỗ nếu đã có vật, chạm để đọc, Enter để đưa vào chỗ kế tiếp
  function bangCho(c, o) {
    var vat = o.vat.map(function (v, i) {
      var g = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": v.full });
      o.ve(g, v); v.g = g; v.nha = o.bai[i]; v.o = null; return v;
    });
    var cho = o.cho.map(function () { return null; });
    function dat(v, p, muot) { v.g.style.transition = muot && !giam ? "transform .25s" : ""; v.g.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); v.p = p; }
    vat.forEach(function (v) { dat(v, v.nha); });
    var cam = null, lech, dau, dichuyen;
    function vao(v, k) {
      var khac = cho[k], tu = v.o;
      if (tu != null) cho[tu] = null;
      if (khac && khac !== v) { if (tu != null) { cho[tu] = khac; khac.o = tu; dat(khac, o.cho[tu], true); } else { khac.o = null; dat(khac, khac.nha, true); } }
      cho[k] = v; v.o = k; dat(v, o.cho[k], true);
    }
    c.addEventListener("pointerdown", function (ev) {
      if (o.khoa && o.khoa()) return; var g = ev.target.closest("g.tc-keo"); if (!g) return;
      cam = vat.filter(function (v) { return v.g === g; })[0]; if (!cam) return;
      var p = diemSvg(c, ev); lech = { x: p.x - cam.p.x, y: p.y - cam.p.y }; dau = p; dichuyen = false;
      c.appendChild(g); g.style.transition = ""; c.setPointerCapture(ev.pointerId); ev.preventDefault();
    });
    c.addEventListener("pointermove", function (ev) { if (!cam) return; var p = diemSvg(c, ev); if (Math.abs(p.x - dau.x) + Math.abs(p.y - dau.y) > 6) dichuyen = true; if (dichuyen) dat(cam, { x: p.x - lech.x, y: p.y - lech.y }); });
    function tha() {
      if (!cam) return; var v = cam; cam = null;
      if (!dichuyen) { dat(v, v.o != null ? o.cho[v.o] : v.nha, true); o.doc(v); return; }
      var tam = { x: v.p.x + o.w / 2, y: v.p.y + o.h / 2 }, gan = -1, kc = 1e9;
      o.cho.forEach(function (s, k) { var d = Math.hypot(s.x + o.w / 2 - tam.x, s.y + o.h / 2 - tam.y); if (d < kc) { kc = d; gan = k; } });
      if (kc < o.w * 0.75) vao(v, gan);
      else { if (v.o != null) cho[v.o] = null; v.o = null; dat(v, v.nha, true); }
      o.doc(v); o.doi(cho);
    }
    c.addEventListener("pointerup", tha); c.addEventListener("pointercancel", tha);
    c.addEventListener("keydown", function (ev) {
      var g = ev.target.closest && ev.target.closest("g.tc-keo"); if (!g || (ev.key !== "Enter" && ev.key !== " ")) return;
      ev.preventDefault(); if (o.khoa && o.khoa()) return;
      var v = vat.filter(function (x) { return x.g === g; })[0]; vao(v, ((v.o != null ? v.o : -1) + 1) % o.cho.length); o.doc(v); o.doi(cho);
    });
    return {
      vat: vat, cho: cho,
      lai: function () { cho.forEach(function (_, k) { cho[k] = null; }); var ns = tron(o.bai); vat.forEach(function (v, i) { v.o = null; v.nha = ns[i]; dat(v, v.nha, true); }); o.doi(cho); }
    };
  }

  // ---------- Cảnh: đoàn tàu sự kiện (nối toa theo thứ tự, đúng thì tàu chạy) ----------
  // t.toa: [{d, a:[2 dòng], full}] đúng thứ tự (toa 1 sát đầu máy)
  function doanTau(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), chay = nut(t.nut_chay, true), lai = nut(t.nut_lai, false); hang.appendChild(chay); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = t.toa.length, W = 96, H = 58, MAU = ["#c2410c", "#2563eb", "#15803d", "#7c3aed", "#b45309", "#0e7490"];
    svg(c, "rect", { x: 0, y: 150, width: 600, height: 150, class: "tc-f-dat" });
    svg(c, "text", { x: 12, y: 22, class: "tc-t-nho" }, t.bai);
    for (var x = 4; x < 600; x += 22) svg(c, "rect", { x: x, y: 262, width: 14, height: 7, rx: 2, class: "tc-f-go" });
    svg(c, "line", { x1: 0, x2: 600, y1: 262, y2: 262, class: "tc-ray" });
    var dm = svg(c, "g", {}); svg(dm, "rect", { x: 0, y: 16, width: 78, height: 46, rx: 6, class: "tc-f-muc" }); svg(dm, "rect", { x: 46, y: 0, width: 28, height: 26, rx: 3, class: "tc-f-muc" });
    svg(dm, "rect", { x: 8, y: 4, width: 12, height: 14, class: "tc-f-muc" }); svg(dm, "rect", { x: 51, y: 5, width: 18, height: 12, rx: 2, class: "tc-f-cam" });
    [14, 40, 64].forEach(function (cx) { svg(dm, "circle", { cx: cx, cy: 64, r: 9, class: "tc-f-thep" }); });
    var khoi = svg(dm, "g", {}); dm.setAttribute("transform", "translate(510,190)");
    var cho = []; for (var i = 0; i < n; i++) cho.push({ x: 504 - (i + 1) * (W + 4), y: 198 });
    cho.forEach(function (p, i) { svg(c, "rect", { x: p.x, y: p.y, width: W, height: H, rx: 6, class: "tc-o-cho" }); svg(c, "text", { x: p.x + W / 2, y: p.y + H + 30, "text-anchor": "middle", class: "tc-t-nho" }, dien(t.ten_toa, { n: i + 1 })); });
    var bai = []; for (i = 0; i < n; i++) bai.push({ x: 20 + i * 110 * 5 / n, y: 34 });
    var khoa = false, vien = svg(c, "g", {});
    var B = bangCho(c, {
      w: W, h: H, cho: cho, bai: bai, khoa: function () { return khoa; },
      vat: tron(t.toa.map(function (v, k) { return { k: k, d: v.d, a: v.a, full: v.full }; })),
      ve: function (gg, v) {
        svg(gg, "rect", { x: 0, y: 0, width: W, height: H, rx: 6, style: "fill:" + MAU[v.k % MAU.length] });
        svg(gg, "text", { x: W / 2, y: 24, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:20px" }, v.d); cotChu(gg, W / 2, 40, v.a, "tc-t-trang", 12);
        svg(gg, "circle", { cx: 20, cy: H + 4, r: 8, class: "tc-f-thep" }); svg(gg, "circle", { cx: W - 20, cy: H + 4, r: 8, class: "tc-f-thep" });
      },
      doc: function (v) { cap.textContent = v.full; },
      doi: function (o) { chay.disabled = o.some(function (x) { return !x; }); ket.hidden = true; vien.innerHTML = ""; }
    });
    chay.onclick = function () {
      khoa = true; chay.disabled = true; vien.innerHTML = ""; c.appendChild(vien); var d = 0;
      B.cho.forEach(function (v, i) { var ok = !!v && v.k === i; if (ok) d++; svg(vien, "rect", { x: cho[i].x - 3, y: cho[i].y - 3, width: W + 6, height: H + 6, rx: 8, class: ok ? "tc-vien-dung" : "tc-vien-sai" }); });
      ket.hidden = false;
      if (d < n) { ket.textContent = dien(t.sai, { d: d, n: n }); khoa = false; chay.disabled = false; return; }
      ket.textContent = t.dung; vien.innerHTML = "";
      var ds = [dm].concat(B.cho.map(function (v) { return v.g; })), goc = ds.map(function (gg) { var m = gg.getAttribute("transform").match(/translate\(([-\d.]+),([-\d.]+)/); return { x: +m[1], y: +m[2] }; }), t0 = null;
      ds.forEach(function (gg) { gg.style.transition = ""; });
      (function chayTau(ts) {
        if (!t0) t0 = ts; var dx = Math.min(720, (ts - t0) * 0.25);
        ds.forEach(function (gg, k) { gg.setAttribute("transform", "translate(" + (goc[k].x + dx) + "," + goc[k].y + ")"); });
        if (Math.random() < 0.2) { var o = svg(khoi, "circle", { cx: 14, cy: -4, r: 6, class: "tc-f-khoi" }); setTimeout(function () { o.remove(); }, 500); }
        if (dx < 720 && !giam) requestAnimationFrame(chayTau);
      })(performance.now());
    };
    lai.onclick = function () { khoa = false; dm.setAttribute("transform", "translate(510,190)"); B.lai(); cap.textContent = t.doc_mac; };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: domino nguyên nhân (dựng, đẩy cho đổ, rút một quân xem chuỗi có dừng) ----------
  // t.quan: [{y, a, full, sua}] đúng thứ tự; g.khong_rut: chỉ số quân không rút được (thiên nhiên)
  function domino(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 320", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), day = nut(t.nut_day, true), rut = nut(t.nut_rut, false), lai = nut(t.nut_lai, false); rut.hidden = true;
    hang.appendChild(day); hang.appendChild(rut); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = t.quan.length, W = 82, H = 150, buoc = 560 / n;
    svg(c, "rect", { x: 0, y: 296, width: 600, height: 24, class: "tc-f-dat" }); svg(c, "text", { x: 12, y: 18, class: "tc-t-nho" }, t.khay);
    var cho = []; for (var i = 0; i < n; i++) cho.push({ x: 20 + i * buoc + (buoc - W) / 2, y: 146 });
    cho.forEach(function (p) { svg(c, "rect", { x: p.x, y: p.y, width: W, height: H, rx: 8, class: "tc-o-cho" }); });
    var bai = cho.map(function (p) { return { x: p.x, y: 12 }; });
    var buocChoi = "xep", khoa = false, bo = -1, vien = svg(c, "g", {});
    var B = bangCho(c, {
      w: W, h: H, cho: cho, bai: bai, khoa: function () { return khoa; },
      vat: tron(t.quan.map(function (v, k) { return { k: k, y: v.y, a: v.a, full: v.full, sua: v.sua }; })),
      ve: function (gg, v) {
        var o = svg(gg, "g", {}); svg(o, "rect", { x: 0, y: 0, width: W, height: H, rx: 8, class: "tc-f-muc" }); svg(o, "rect", { x: 4, y: 4, width: W - 8, height: H - 8, rx: 6, class: "tc-f-giay" });
        svg(o, "line", { x1: 10, x2: W - 10, y1: H / 2, y2: H / 2, class: "tc-net-mo" });
        svg(o, "text", { x: W / 2, y: 30, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:" + (v.y.length > 6 ? 11 : 15) + "px" }, v.y);
        svg(o, "circle", { cx: W / 2, cy: 52, r: 5, class: "tc-f-muc" });
        cotChu(o, W / 2, 100, v.a, "tc-t-dam", 16); o.querySelectorAll("text").forEach(function (x, k) { if (k > 0) x.style.fontSize = "12px"; });
        v.mat = o;
      },
      doc: function (v) { cap.textContent = v.full; },
      doi: function (o) { day.disabled = o.some(function (x) { return !x; }); ket.hidden = true; vien.innerHTML = ""; }
    });
    function dung() { B.vat.forEach(function (v) { v.mat.style.transition = ""; v.mat.style.transform = ""; v.g.style.opacity = ""; v.g.onclick = null; }); }
    function lat(xong) {
      var i = 0;
      (function tiep() {
        if (i >= n || i === bo) { xong(i); return; }
        var v = B.cho[i]; v.mat.style.transformBox = "fill-box"; v.mat.style.transformOrigin = "100% 100%";
        v.mat.style.transition = giam ? "" : "transform .35s ease-in";
        v.mat.style.transform = "rotate(" + (i === n - 1 || i + 1 === bo ? 55 : 24) + "deg)";
        i++; setTimeout(tiep, giam ? 0 : 260);
      })();
    }
    day.onclick = function () {
      khoa = true; day.disabled = true; vien.innerHTML = ""; c.appendChild(vien); var d = 0;
      B.cho.forEach(function (v, i) { var ok = !!v && v.k === i; if (ok) d++; svg(vien, "rect", { x: cho[i].x - 3, y: cho[i].y - 3, width: W + 6, height: H + 6, rx: 10, class: ok ? "tc-vien-dung" : "tc-vien-sai" }); });
      if (d < n && buocChoi === "xep") { ket.hidden = false; ket.textContent = dien(t.sai, { d: d, n: n }); khoa = false; day.disabled = false; return; }
      vien.innerHTML = "";
      lat(function () {
        ket.hidden = false;
        if (bo < 0) { ket.textContent = t.do_het; rut.hidden = false; buocChoi = "rut"; }
        else ket.textContent = dien(t.dung_o, { n: bo + 1 }) + " " + t.quan[bo].sua;
      });
    };
    rut.onclick = function () {
      dung(); bo = -1; khoa = true; day.disabled = true; ket.hidden = false; ket.textContent = t.chon_rut;
      B.vat.forEach(function (v) {
        v.g.onclick = function () {
          if (buocChoi !== "rut") return;
          if (v.k === g.khong_rut) { ket.textContent = t.khong_rut_duoc; return; }
          B.vat.forEach(function (x) { x.g.onclick = null; }); bo = v.k; v.g.style.opacity = ".15";
          ket.textContent = dien(t.da_rut, { y: v.y }); day.disabled = false;
        };
      });
    };
    lai.onclick = function () { dung(); khoa = false; bo = -1; buocChoi = "xep"; rut.hidden = true; B.lai(); cap.textContent = t.doc_mac; };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: phô mai Thụy Sĩ (các lớp chắn có lỗ; kéo lệch để chặn dòng khí) ----------
  // g.dung_o (tùy chọn, số thứ tự lát từ 1): khí chạm lát này thì dừng, hiện hai đồng hồ g.dong_ho [số, số] với t.dong_ho [{ten, so}],
  // câu t.dung_hoi và hai nút t.dung_chon [cho qua, kiểm lại]; t.dung_dap [hai câu]. Chọn kiểm lại thì lát đó được vá kín (t.da_va).
  function phoMai(g, t) {
    var s = khung(g, t), san = canh(), cv = tao("canvas"); cv.width = 720; cv.height = 320; cv.setAttribute("role", "img"); cv.setAttribute("aria-label", t.mo_ta); san.appendChild(cv);
    var hang = tao("div", "tc-hang"), dem = tao("span", "tc-so-nho", ""), xem = nut(t.nut_that, false), tronL = nut(t.nut_tron, false);
    xem.classList.add("tc-nut-do"); hang.appendChild(dem); hang.appendChild(xem); hang.appendChild(tronL);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var cx = cv.getContext("2d"), W = 720, H = 320, n = t.lop.length;
    var lop = t.lop.map(function (_, i) { return { x: 170 + i * 480 / n, lech: 0, lo: [] }; });
    function gieo() { lop.forEach(function (l) { l.lech = 0; l.lo = [{ y: 60 + Math.random() * 200, r: 22 }]; if (Math.random() < 0.5) l.lo.push({ y: 60 + Math.random() * 200, r: 16 }); }); }
    gieo();
    var hat = [], lot = 0, che = "choi", cam = null, y0 = 0, l0 = 0, chay = false;
    var kD = g.dung_o ? g.dung_o - 1 : -1, dung = kD >= 0 ? "cho" : "xong", hoiD = null, capD = null;
    if (kD >= 0) {
      hoiD = tao("div", "tc-pm-hoi"); hoiD.hidden = true; hoiD.appendChild(tao("p", "", t.dung_hoi));
      var hD = tao("div", "tc-hang"); hoiD.appendChild(hD);
      t.dung_chon.forEach(function (ch, i) {
        var bt = nut(ch, i === 1); hD.appendChild(bt);
        bt.onclick = function () { dung = "xong"; hoiD.hidden = true; if (i === 1) lop[kD].kin = true; capD.textContent = t.dung_dap[i]; capD.hidden = false; };
      });
      capD = tao("p", "tc-cap"); capD.hidden = true; capD.setAttribute("aria-live", "polite");
    }
    function thung(l, y) { if (l.kin) return false; return l.lo.some(function (h) { return Math.abs(y - (h.y + l.lech)) < h.r - 3; }); }
    function ve() {
      cx.fillStyle = mau("--tc-troi"); cx.fillRect(0, 0, W, H);
      cx.fillStyle = mau("--tc-dat"); cx.fillRect(0, 0, 70, H);
      cx.font = "700 13px system-ui, sans-serif"; cx.textAlign = "center"; cx.fillStyle = mau("--ink"); cx.fillText(t.gieng, 35, 22);
      cx.fillStyle = mau("--tc-thep"); cx.fillRect(650, 40, 60, 240); cx.fillStyle = "#fff"; cx.fillText(t.gian, 680, 165);
      lop.forEach(function (l, i) {
        cx.save(); cx.beginPath(); cx.rect(l.x - 18, 20, 36, H - 60); cx.clip();
        cx.fillStyle = mau("--tc-pho-mai"); cx.fillRect(l.x - 18, 20, 36, H - 60);
        if (!l.kin) l.lo.forEach(function (h) { cx.fillStyle = mau("--tc-troi"); cx.beginPath(); cx.ellipse(l.x, h.y + l.lech, 14, h.r, 0, 0, 7); cx.fill(); });
        cx.restore(); cx.strokeStyle = l.kin ? mau("--tc-dung") : cam === l ? mau("--cam") : "rgba(0,0,0,.25)"; cx.lineWidth = l.kin || cam === l ? 3 : 1.5; cx.strokeRect(l.x - 18, 20, 36, H - 60);
        if (l.kin) { cx.fillStyle = mau("--tc-dung"); cx.font = "700 12px system-ui, sans-serif"; cx.fillText(t.da_va, l.x, H - 34); cx.font = "600 12px system-ui, sans-serif"; }
        cx.fillStyle = mau("--ink"); cx.font = "600 12px system-ui, sans-serif"; cx.fillText(t.lop[i], l.x, H - 18);
        cx.fillStyle = mau("--muted"); cx.fillText("⇕", l.x, 14);
      });
      hat.forEach(function (p) { cx.fillStyle = p.chet ? "rgba(120,120,120,.4)" : mau("--tc-sai"); cx.beginPath(); cx.arc(p.x, p.y, 4, 0, 7); cx.fill(); });
      if (dung === "dang") veDongHo();
    }
    // Hai đồng hồ của phép thử áp suất âm (kim theo g.dong_ho, thang 0..1.500 chỉ để vẽ)
    function veDongHo() {
      cx.fillStyle = "rgba(11,18,32,.88)"; cx.fillRect(196, 44, 340, 196);
      cx.fillStyle = "#e2e8f0"; cx.font = "700 13px system-ui, sans-serif"; cx.textAlign = "center"; cx.fillText(t.lop[kD], 366, 66);
      g.dong_ho.forEach(function (v, i) {
        var ox = 286 + i * 160, oy = 136, r = 50, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, a = a0 + (a1 - a0) * Math.min(1, v / 1500);
        cx.lineWidth = 8; cx.strokeStyle = "#334155"; cx.beginPath(); cx.arc(ox, oy, r, a0, a1); cx.stroke();
        cx.strokeStyle = v ? "#f87171" : "#4ade80"; cx.beginPath(); cx.arc(ox, oy, r, a0, Math.max(a0 + 0.04, a)); cx.stroke();
        cx.lineWidth = 3; cx.strokeStyle = "#f8fafc"; cx.beginPath(); cx.moveTo(ox, oy); cx.lineTo(ox + Math.cos(a) * (r - 10), oy + Math.sin(a) * (r - 10)); cx.stroke();
        cx.fillStyle = "#f8fafc"; cx.beginPath(); cx.arc(ox, oy, 5, 0, 7); cx.fill();
        cx.font = "800 16px ui-monospace, monospace"; cx.fillStyle = v ? "#fca5a5" : "#86efac"; cx.fillText(t.dong_ho[i].so, ox, oy + 60);
        cx.font = "600 12px system-ui, sans-serif"; cx.fillStyle = "#cbd5e1"; cx.fillText(t.dong_ho[i].ten, ox, oy + 80);
      });
      cx.font = "600 12px system-ui, sans-serif";
    }
    function buoc() {
      if (dung === "dang") { ve(); if (chay) requestAnimationFrame(buoc); return; }
      if (Math.random() < 0.45) hat.push({ x: 72, y: che === "that" ? 150 + (Math.random() - 0.5) * 70 : 40 + Math.random() * (H - 100), v: 2.2 + Math.random() * 1.2 });
      hat.forEach(function (p) {
        if (p.chet) { p.t--; return; } var nx = p.x + p.v;
        if (dung === "cho" && che === "choi" && p.x < lop[kD].x - 18 && nx >= lop[kD].x - 18) { dung = "dang"; hoiD.hidden = false; cam = null; }
        lop.forEach(function (l) { if (p.x < l.x - 18 && nx >= l.x - 18 && !thung(l, p.y)) { p.chet = true; p.t = 18; nx = l.x - 20; } });
        p.x = nx; if (p.x > 648) { p.toi = true; lot++; }
      });
      hat = hat.filter(function (p) { return !p.toi && !(p.chet && p.t < 0); });
      dem.textContent = dien(t.dem, { n: lot }); ve();
      if (chay) requestAnimationFrame(buoc);
    }
    // Chỉ chạy hạt khi khung đang hiện trên màn hình
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var v = e[e.length - 1].isIntersecting; if (v && !chay) { chay = true; requestAnimationFrame(buoc); } else if (!v) chay = false; }).observe(cv);
    else { chay = true; requestAnimationFrame(buoc); }
    function dc(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; }
    cv.addEventListener("pointerdown", function (ev) { if (che !== "choi" || dung === "dang") return; var p = dc(ev); cam = lop.filter(function (l) { return Math.abs(p.x - l.x) < 34; })[0] || null; if (cam) { y0 = p.y; l0 = cam.lech; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); } });
    cv.addEventListener("pointermove", function (ev) { if (!cam) return; cam.lech = Math.max(-160, Math.min(160, l0 + dc(ev).y - y0)); });
    function bo() { cam = null; } cv.addEventListener("pointerup", bo); cv.addEventListener("pointercancel", bo);
    xem.onclick = function () {
      che = "that"; lot = 0; if (kD >= 0) { dung = "xong"; hoiD.hidden = true; capD.hidden = true; } lop.forEach(function (l) { l.kin = false; var h = l.lo[0]; h.r = 34; l.dich = 150 - h.y; });
      var k = 0; (function truot() { k++; lop.forEach(function (l) { l.lech += (l.dich - l.lech) * 0.15; }); if (k < 40) requestAnimationFrame(truot); })();
      ket.innerHTML = ""; ket.appendChild(document.createTextNode(t.mo_dau)); var ol = tao("ol"); t.ly_do.forEach(function (x) { ol.appendChild(tao("li", "", x)); }); ket.appendChild(ol);
      ket.appendChild(tao("p", "", t.ket)); ket.hidden = false;
    };
    tronL.onclick = function () { che = "choi"; gieo(); lot = 0; hat = []; ket.hidden = true; if (kD >= 0) { dung = "cho"; hoiD.hidden = true; capD.hidden = true; lop.forEach(function (l) { l.kin = false; }); } };
    s.appendChild(san); if (hoiD) { s.appendChild(hoiD); s.appendChild(capD); } s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: lò phản ứng (rút/cắm thanh để giữ công suất, rồi nhấn nút dừng) ----------
  // g.thanh: số thanh vẽ (mỗi thanh = 2), g.toi_thieu, g.nguong (≤ thì nút dừng làm vọt), g.giay
  // g.an_bien (tùy chọn): sau lượt đầu hiện nút t.nut_dem cho lượt "như đêm đó": che dòng biên (t.bien_an) tới cuối lượt, rồi mở t.mo_bien {n}; t.nut_thuong để về lượt thường
  function loPhanUng(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 330", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), az = nut(t.nut_az, false), chu = tao("span", "tc-so-nho", "");
    az.classList.add("tc-nut-do"); az.disabled = true; hang.appendChild(bd); hang.appendChild(az); hang.appendChild(chu);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var N = g.thanh;
    svg(c, "rect", { x: 30, y: 40, width: 400, height: 250, rx: 14, style: "fill:#1e293b;stroke:#334155;stroke-width:3" });
    var sang = svg(c, "rect", { x: 40, y: 150, width: 380, height: 130, rx: 10, style: "fill:#38bdf8;opacity:.15" });
    svg(c, "text", { x: 230, y: 30, "text-anchor": "middle", style: "fill:#94a3b8;font:600 12px ui-monospace,monospace" }, t.tieu_de);
    var thanh = [], trong = [];
    for (var i = 0; i < N; i++) {
      var x = 50 + i * 372 / N, gg = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": dien(t.ten_thanh, { n: i + 1 }) });
      svg(gg, "rect", { x: x - 6, y: -10, width: 30, height: 170, style: "fill:transparent" }); svg(gg, "rect", { x: x, y: 0, width: 18, height: 150, rx: 3, style: "fill:#cbd5e1" }); svg(gg, "rect", { x: x, y: 138, width: 18, height: 12, style: "fill:#64748b" });
      thanh.push(gg); trong.push(true);
    }
    svg(c, "rect", { x: 460, y: 40, width: 110, height: 250, rx: 12, style: "fill:#0f172a;stroke:#334155;stroke-width:2" });
    svg(c, "text", { x: 515, y: 64, "text-anchor": "middle", style: "fill:#94a3b8;font:600 12px ui-monospace,monospace" }, "MW");
    var mw = svg(c, "text", { x: 515, y: 100, "text-anchor": "middle", style: "fill:#fde68a;font:800 26px ui-monospace,monospace" }, "0");
    svg(c, "rect", { x: 500, y: 120, width: 30, height: 150, rx: 4, style: "fill:#1e293b" }); var cot = svg(c, "rect", { x: 500, y: 270, width: 30, height: 0, rx: 4, style: "fill:#fbbf24" });
    svg(c, "rect", { x: 496, y: 270 - 150 * 220 / 700, width: 38, height: 150 * 40 / 700, style: "fill:none;stroke:#4ade80;stroke-width:2;stroke-dasharray:4 3" });
    var bien = svg(c, "text", { x: 230, y: 316, "text-anchor": "middle", style: "fill:#e2e8f0;font:700 14px system-ui,sans-serif" }, "");
    var P = 0, xe = 0, tg = 0, hen = null, pha = "nghi", cam = -1, yy, che = false;
    var doiLuot = null;
    if (g.an_bien) { doiLuot = nut(t.nut_dem, false); doiLuot.hidden = true; hang.insertBefore(doiLuot, chu); }
    function soTrong() { return 2 * trong.filter(Boolean).length; }
    function datThanh(i, v) { trong[i] = v; thanh[i].style.transition = giam ? "" : "transform .2s"; thanh[i].setAttribute("transform", "translate(0," + (v ? 140 : 40) + ")"); }
    function hien() {
      var k = soTrong(), h = Math.min(150, 150 * P / 700); cot.setAttribute("y", 270 - h); cot.setAttribute("height", h); mw.textContent = Math.round(P);
      sang.style.opacity = Math.min(0.9, 0.1 + P / 900);
      if (che) { bien.textContent = t.bien_an; bien.style.fill = "#94a3b8"; return; }
      bien.textContent = dien(t.bien, { n: k }) + (k < g.toi_thieu ? "  ⚠ " + dien(t.canh_bao, { m: g.toi_thieu }) : ""); bien.style.fill = k < g.toi_thieu ? "#fca5a5" : "#e2e8f0";
    }
    function moHinh() { var ra = N - soTrong() / 2; P += (Math.max(0, 40 + ra * 64 - xe * 260) - P) * 0.12; }
    function batDau() { for (var j = 0; j < N; j++) datThanh(j, j % 4 !== 0); P = 40 + (N - soTrong() / 2) * 64; hien(); }
    batDau();
    if (doiLuot) doiLuot.onclick = function () {
      che = !che; doiLuot.textContent = che ? t.nut_thuong : t.nut_dem; ket.hidden = true; chu.textContent = ""; sang.style.fill = "#38bdf8"; batDau();
    };
    c.addEventListener("pointerdown", function (ev) { var gg = ev.target.closest("g.tc-keo"); if (!gg || pha === "het") return; cam = thanh.indexOf(gg); yy = diemSvg(c, ev).y; c.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    c.addEventListener("pointerup", function (ev) { if (cam < 0) return; var dy = diemSvg(c, ev).y - yy; datThanh(cam, Math.abs(dy) < 6 ? !trong[cam] : dy > 0); cam = -1; hien(); });
    c.addEventListener("keydown", function (ev) { var gg = ev.target.closest && ev.target.closest("g.tc-keo"); if (!gg || pha === "het" || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var k = thanh.indexOf(gg); datThanh(k, !trong[k]); hien(); });
    bd.onclick = function () {
      bd.disabled = true; az.disabled = true; ket.hidden = true; pha = "thu"; tg = 0; xe = 0; sang.style.fill = "#38bdf8"; if (doiLuot) doiLuot.disabled = true;
      hen = setInterval(function () {
        tg += 0.1; xe = Math.min(1, tg / (g.giay * 0.8)); moHinh(); hien(); chu.textContent = dien(t.con, { s: Math.max(0, Math.ceil(g.giay - tg)) });
        if (tg >= g.giay) { clearInterval(hen); pha = "az"; az.disabled = false; chu.textContent = t.het_gio; }
      }, 100);
    };
    az.onclick = function () {
      az.disabled = true; pha = "het"; var k = soTrong();
      for (var j = 0; j < N; j++) if (!trong[j]) datThanh(j, true);
      var lan = 0, vot = k <= g.nguong;
      var h = setInterval(function () {
        lan++; P *= vot ? 1.35 : 0.7; hien(); if (vot) sang.style.fill = "#f97316";
        if (lan > 12) {
          clearInterval(h); if (vot) mw.textContent = "!!!";
          ket.textContent = vot ? dien(t.no, { n: k }) : (k < g.toi_thieu ? dien(t.dung_duoi, { n: k }) : dien(t.dung_an_toan, { n: k })) + " " + t.sau;
          if (che) { ket.textContent = dien(t.mo_bien, { n: k }) + " " + ket.textContent; bien.textContent = dien(t.bien, { n: k }); bien.style.fill = k < g.toi_thieu ? "#fca5a5" : "#e2e8f0"; }
          ket.hidden = false; bd.disabled = false; pha = "nghi"; if (!vot) sang.style.fill = "#38bdf8";
          if (doiLuot) { doiLuot.hidden = false; doiLuot.disabled = false; if (!che) doiLuot.classList.add("tc-chinh"); else doiLuot.classList.remove("tc-chinh"); }
        }
      }, 120);
    };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: chờ viên kẹo (đếm giây, có mẹo úp bát và nghĩ là đám mây) ----------
  function choKeo(g, t) {
    var s = khung(g, t), san = canh("tc-canh-am"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), may = nut(t.nut_may, false), dh = tao("span", "tc-so-nho", "");
    may.disabled = true; hang.appendChild(bd); hang.appendChild(may); hang.appendChild(dh);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 210, width: 600, height: 90, class: "tc-f-go" });
    svg(c, "ellipse", { cx: 260, cy: 214, rx: 110, ry: 22, class: "tc-f-giay tc-net-vien" });
    var keo = svg(c, "g", { class: "tc-cham-duoc" }), than = svg(keo, "rect", { x: -34, y: -62, width: 68, height: 62, rx: 22, style: "fill:#fff;stroke:#e5ddd0;stroke-width:3" });
    svg(keo, "ellipse", { cx: 0, cy: -58, rx: 30, ry: 8, style: "fill:#fdfbf7" });
    var may2 = svg(keo, "g", { opacity: "0" }); [[-26, -30, 22], [0, -44, 26], [26, -30, 22], [0, -22, 24]].forEach(function (k) { svg(may2, "circle", { cx: k[0], cy: k[1], r: k[2], style: "fill:#e0f2fe" }); });
    keo.setAttribute("transform", "translate(260,206)");
    var bong = svg(c, "g", { opacity: "0" }); svg(bong, "rect", { x: 300, y: 40, width: 170, height: 44, rx: 20, class: "tc-f-giay tc-net-vien" }); var loi = svg(bong, "text", { x: 385, y: 68, "text-anchor": "middle", class: "tc-t-dam" }, "");
    var chuong = svg(c, "g", { class: "tc-cham-duoc" }); svg(chuong, "path", { d: "M-24 0 Q-24 -40 0 -44 Q24 -40 24 0 Z", class: "tc-f-cam" }); svg(chuong, "rect", { x: -30, y: 0, width: 60, height: 8, rx: 4, class: "tc-f-cam" });
    svg(chuong, "circle", { cx: 0, cy: -48, r: 5, class: "tc-f-cam" }); svg(chuong, "text", { x: 0, y: 28, "text-anchor": "middle", class: "tc-t-nho" }, t.chuong); chuong.setAttribute("transform", "translate(500,200)");
    var bat = svg(c, "g", { class: "tc-keo" }); svg(bat, "path", { d: "M-62 0 Q-62 -70 0 -74 Q62 -70 62 0 Z", style: "fill:#2563eb;opacity:.92" }); svg(bat, "rect", { x: -66, y: -4, width: 132, height: 8, rx: 4, style: "fill:#2563eb" });
    svg(bat, "text", { x: 0, y: -30, "text-anchor": "middle", class: "tc-t-trang" }, t.bat);
    var bp = { x: 80, y: 206 }; function datBat() { bat.setAttribute("transform", "translate(" + bp.x + "," + bp.y + ")"); } datBat();
    var dang = false, tg = 0, hen = null, up = false, nghi = false, cam = false, lech;
    c.addEventListener("pointerdown", function (ev) { if (!ev.target.closest("g.tc-keo")) return; cam = true; var p = diemSvg(c, ev); lech = { x: p.x - bp.x, y: p.y - bp.y }; c.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    c.addEventListener("pointermove", function (ev) { if (!cam) return; var p = diemSvg(c, ev); bp = { x: Math.max(60, Math.min(540, p.x - lech.x)), y: Math.max(80, Math.min(214, p.y - lech.y)) }; datBat(); });
    c.addEventListener("pointerup", function () { if (!cam) return; cam = false; up = Math.abs(bp.x - 260) < 40 && bp.y > 180; if (up) { bp = { x: 260, y: 210 }; datBat(); } });
    function giay() { return so(tg, 1); }
    function het(du, lyDo) {
      dang = false; clearInterval(hen); bd.disabled = false; may.disabled = true; bong.setAttribute("opacity", "0");
      ket.textContent = (du ? dien(t.du, { t: g.giay }) + (up || nghi ? t.meo : "") + "." : lyDo) + " " + t.ket; ket.hidden = false;
    }
    keo.addEventListener("click", function () { if (!dang || up) return; keo.setAttribute("opacity", "0"); het(false, dien(t.an, { s: giay() })); });
    chuong.addEventListener("click", function () { if (dang) het(false, dien(t.rung, { s: giay() })); });
    may.onclick = function () { nghi = !nghi; may2.setAttribute("opacity", nghi ? "1" : "0"); than.style.opacity = nghi ? "0" : "1"; may.textContent = nghi ? t.nut_may_lai : t.nut_may; };
    bd.onclick = function () {
      dang = true; tg = 0; bd.disabled = true; may.disabled = false; ket.hidden = true; keo.setAttribute("opacity", "1");
      hen = setInterval(function () {
        tg += 0.1; dh.textContent = dien(t.da_cho, { s: giay(), t: g.giay });
        var du = !up && !nghi, lac = du && !giam ? Math.sin(tg * 9) * (tg % 3 < 1 ? 5 : 1.5) : 0; keo.setAttribute("transform", "translate(260,206) rotate(" + lac + ")");
        if (du && Math.round(tg * 10) % 30 === 0) { loi.textContent = t.du_do[Math.floor(Math.random() * t.du_do.length)]; bong.setAttribute("opacity", "1"); } else if (!du) bong.setAttribute("opacity", "0");
        if (tg >= g.giay) het(true);
      }, 100);
    };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tự tay lắp (kéo tấm vào khung, rồi ra giá) ----------
  function lapRap(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 320", role: "img", "aria-label": t.mo_ta });
    var gia = tao("div", "tc-doan"); gia.hidden = true;
    var idT = g.id + "-gia", nh = tao("label", "", t.gia_hoi + " "); nh.htmlFor = idT; var gv = tao("b", "tc-so-nho", ""); nh.appendChild(gv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = 2; th.step = 0.01; th.value = 0.5; th.id = idT;
    var chot = nut(t.nut_chot, true), h2 = tao("div", "tc-hang"); h2.appendChild(chot); gia.appendChild(nh); gia.appendChild(th); gia.appendChild(h2);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    function usd(x) { return so(x, 2) + " USD"; }
    th.oninput = function () { gv.textContent = usd(+th.value); }; th.oninput();
    svg(c, "text", { x: 16, y: 22, class: "tc-t-nho" }, t.goi); svg(c, "text", { x: 330, y: 22, class: "tc-t-nho" }, t.khung);
    var F = { x: 350, y: 40 }, T = [{ w: 26, h: 240, tx: 0, ty: 0 }, { w: 26, h: 240, tx: 196, ty: 0 }, { w: 170, h: 24, tx: 26, ty: 0 }, { w: 170, h: 24, tx: 26, ty: 216 }, { w: 170, h: 22, tx: 26, ty: 109 }];
    T.forEach(function (p, i) { p.n = t.tam[i]; svg(c, "rect", { x: F.x + p.tx, y: F.y + p.ty, width: p.w, height: p.h, rx: 2, class: "tc-o-cho" }); });
    var nha = [{ x: 20, y: 40 }, { x: 60, y: 40 }, { x: 110, y: 50 }, { x: 110, y: 120 }, { x: 110, y: 190 }], xong = 0, cam = null, lech;
    function dat(p, muot) { p.g.style.transition = muot && !giam ? "transform .2s" : ""; p.g.setAttribute("transform", "translate(" + p.pos.x + "," + p.pos.y + ")"); }
    T.forEach(function (p, i) {
      var gg = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": p.n });
      svg(gg, "rect", { x: -10, y: -10, width: p.w + 20, height: p.h + 20, style: "fill:transparent" }); svg(gg, "rect", { x: 0, y: 0, width: p.w, height: p.h, rx: 2, class: "tc-f-go", style: "stroke:rgba(0,0,0,.3)" });
      if (p.w > p.h) svg(gg, "text", { x: p.w / 2, y: p.h - 6, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:13px" }, p.n);
      p.g = gg; p.pos = nha[i]; p.xong = false; dat(p);
    });
    function vaoKhung(p) {
      var vua = T.filter(function (q) { return !q.xong && q.w === p.w && q.h === p.h && Math.hypot(F.x + q.tx - p.pos.x, F.y + q.ty - p.pos.y) < 36; })[0];
      if (!vua) { dat(p); return; }
      if (vua !== p) { var a = p.tx, b = p.ty; p.tx = vua.tx; p.ty = vua.ty; vua.tx = a; vua.ty = b; }
      p.pos = { x: F.x + p.tx, y: F.y + p.ty }; p.xong = true; dat(p, true); xong++;
      [[4, 4], [p.w - 8, 4], [4, p.h - 8], [p.w - 8, p.h - 8]].forEach(function (k) { svg(p.g, "circle", { cx: k[0] + 2, cy: k[1] + 2, r: 2.2, class: "tc-f-muc" }); });
      if (xong === T.length) { gia.hidden = false; svg(c, "text", { x: F.x + 111, y: F.y + 268, "text-anchor": "middle", class: "tc-t-dam" }, t.xong); }
    }
    c.addEventListener("pointerdown", function (ev) { var gg = ev.target.closest("g.tc-keo"); if (!gg) return; cam = T.filter(function (p) { return p.g === gg; })[0]; if (cam.xong) { cam = null; return; } var q = diemSvg(c, ev); lech = { x: q.x - cam.pos.x, y: q.y - cam.pos.y }; c.appendChild(gg); c.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    c.addEventListener("pointermove", function (ev) { if (!cam) return; var q = diemSvg(c, ev); cam.pos = { x: q.x - lech.x, y: q.y - lech.y }; dat(cam); });
    c.addEventListener("pointerup", function () { if (!cam) return; var p = cam; cam = null; vaoKhung(p); });
    c.addEventListener("keydown", function (ev) { var gg = ev.target.closest && ev.target.closest("g.tc-keo"); if (!gg || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var p = T.filter(function (x) { return x.g === gg; })[0]; if (p.xong) return; var q = T.filter(function (x) { return !x.xong && x.w === p.w && x.h === p.h; })[0]; p.pos = { x: F.x + q.tx, y: F.y + q.ty }; vaoKhung(p); });
    chot.onclick = function () { ket.textContent = dien(t.ket, { g: usd(+th.value) }); ket.hidden = false; };
    s.appendChild(san); s.appendChild(gia); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tên lửa (chọn nhiệt độ, phóng, xem chuyến bay) ----------
  // g.lanh: dưới mức này phát lại chuyến bay thật; g.su_kien: [[giây, chữ]] của chuyến bay thật; g.vo: giây tàu vỡ
  function tenLua(g, t) {
    var s = khung(g, t), san = canh("tc-canh-troi"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var idT = g.id + "-nhiet", nh = tao("label", "tc-o-nhap", t.nhiet + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 25; th.max = 85; th.step = 1; th.value = 31; th.id = idT; nh.appendChild(th);
    var hang = tao("div", "tc-hang"), phong = nut(t.nut_phong, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(phong); hang.appendChild(lai);
    var nhat = tao("ol", "tc-nhat-ky"); nhat.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    // Bàn họp 27/1 (tùy chọn g.bieu_do, cùng dạng dữ liệu với quyet-dinh: x_min, x_max, x_buoc, x_don_vi, y_max, diem, an):
    // biểu đồ chỉ các chuyến hư; nút t.nut_an thả các chuyến không hư xuống trục 0; vạch nhiệt độ chạy theo thanh kéo.
    // Chữ thêm: ban_tieu_de, ban_mo_ta, truc_x, truc_y, dan, nut_an, ban_ket, da_xem_0, chua_xem_0.
    var b = g.bieu_do, xem0 = false, ban = null, banCap = null, banHang = null, nutAn = null, an0 = null, vachBan = null, chuVach = null, XB = null;
    if (b) {
      ban = canh("tc-tl-ban"); var cb = svg(ban, "svg", { viewBox: "0 0 600 220", role: "img", "aria-label": t.ban_mo_ta });
      var BL = 48, BR = 586, BT = 54, BD = 176;
      XB = function (v) { return BL + (v - b.x_min) * (BR - BL) / (b.x_max - b.x_min); };
      var YB = function (v) { return BD - v * (BD - BT - 14) / b.y_max; };
      svg(cb, "rect", { x: 4, y: 4, width: 592, height: 212, rx: 10, class: "tc-tl-giay" });
      svg(cb, "text", { x: 16, y: 24, class: "tc-tl-tieu" }, t.ban_tieu_de);
      for (var yv = 0; yv <= b.y_max; yv++) {
        svg(cb, "line", { x1: BL, x2: BR, y1: YB(yv), y2: YB(yv), class: yv ? "tc-tl-luoi" : "tc-tl-truc" });
        svg(cb, "text", { x: BL - 8, y: YB(yv) + 4, "text-anchor": "end", class: "tc-tl-so" }, yv);
      }
      for (var xv = Math.ceil(b.x_min / b.x_buoc) * b.x_buoc; xv <= b.x_max; xv += b.x_buoc)
        svg(cb, "text", { x: XB(xv), y: BD + 16, "text-anchor": "middle", class: "tc-tl-so" }, xv + b.x_don_vi);
      svg(cb, "text", { x: (BL + BR) / 2, y: 212, "text-anchor": "middle", class: "tc-tl-so" }, t.truc_x);
      svg(cb, "text", { x: BL - 34, y: BT - 10, class: "tc-tl-so" }, t.truc_y);
      vachBan = svg(cb, "line", { x1: 0, x2: 0, y1: BT - 6, y2: BD, class: "tc-tl-vach" });
      chuVach = svg(cb, "text", { x: 0, y: BT - 10, "text-anchor": "middle", class: "tc-tl-chu-vach" }, "");
      var demB = {};
      var chamB = function (cha, d, lop, k) {
        var key = d[0] + "_" + d[1], n = demB[key] = (demB[key] || 0) + 1;
        var cx2 = XB(d[0]) + (d[1] ? (n - 1) * 10 : 0), cy2 = YB(d[1]) - (d[1] ? 0 : (n - 1) * 10 + 6);
        var o = svg(cha, "circle", { cx: cx2, cy: cy2, r: d[1] ? 6.5 : 5, class: lop });
        if (k != null) o.style.transitionDelay = (k * 0.06) + "s";
      };
      an0 = svg(cb, "g", { class: "tc-tl-an" });
      (b.an || []).forEach(function (d, k) { chamB(an0, d, "tc-tl-0", k); });
      b.diem.forEach(function (d) { chamB(cb, d, "tc-tl-hu"); });
      banCap = tao("p", "tc-cap", t.dan); banCap.setAttribute("aria-live", "polite");
      banHang = tao("div", "tc-hang"); nutAn = nut(t.nut_an, false); banHang.appendChild(nutAn);
      nutAn.onclick = function () { xem0 = true; an0.classList.add("tc-hien"); nutAn.disabled = true; banCap.textContent = t.ban_ket; };
    }
    function anLai0() { if (!b) return; xem0 = false; an0.classList.remove("tc-hien"); nutAn.disabled = false; banCap.textContent = t.dan; }
    function datKet(chu) { ket.textContent = chu + (b ? " " + (xem0 ? t.da_xem_0 : t.chua_xem_0) : ""); }
    // nền: đất, bệ phóng, nhiệt kế, khung gioăng
    // mặt đất và bệ phóng trôi xuống khi tàu lên cao, để tàu luôn ở trong khung; vệt mây trôi cho cảm giác bay
    var may = svg(c, "g", {}), vet = [];
    for (var v = 0; v < 7; v++) vet.push(svg(may, "rect", { x: 30 + v * 47, y: -20, width: 3, height: 26, rx: 1.5, style: "fill:#fff;opacity:0" }));
    var nen = svg(c, "g", {});
    svg(nen, "rect", { x: 0, y: 300, width: 600, height: 40, class: "tc-f-dat" });
    svg(nen, "rect", { x: 150, y: 210, width: 12, height: 90, class: "tc-f-thep" }); svg(nen, "rect", { x: 150, y: 210, width: 60, height: 6, class: "tc-f-thep" });
    var tau = svg(c, "g", {});
    svg(tau, "rect", { x: -16, y: -110, width: 32, height: 150, rx: 14, style: "fill:#d97706" });
    svg(tau, "rect", { x: -32, y: -80, width: 14, height: 120, rx: 6, style: "fill:#f8fafc;stroke:#94a3b8" }); svg(tau, "rect", { x: 18, y: -80, width: 14, height: 120, rx: 6, style: "fill:#f8fafc;stroke:#94a3b8" });
    svg(tau, "path", { d: "M-32 -80 l7 -16 l7 16 Z M18 -80 l7 -16 l7 16 Z", style: "fill:#f8fafc;stroke:#94a3b8" });
    svg(tau, "path", { d: "M16 -60 q22 0 22 30 v50 l18 20 h-40 Z", style: "fill:#f8fafc;stroke:#64748b" });
    svg(tau, "line", { x1: 18, x2: 32, y1: 0, y2: 0, style: "stroke:#475569;stroke-width:2" });
    var lua = svg(tau, "g", { opacity: "0" }); [-25, 25].forEach(function (x) { svg(lua, "path", { d: "M" + (x - 7) + " 40 q7 40 7 60 q0 -20 7 -60 Z", style: "fill:#fb923c" }); });
    var khoiKhop = svg(tau, "g", {});
    function datTau(x, y, r) { tau.setAttribute("transform", "translate(" + x + "," + y + ") rotate(" + (r || 0) + ")"); }
    datTau(200, 260);
    var nk = svg(c, "g", {}); svg(nk, "rect", { x: 520, y: 40, width: 22, height: 200, rx: 11, class: "tc-f-giay tc-net-vien" }); svg(nk, "circle", { cx: 531, cy: 250, r: 18, style: "fill:#ef4444" });
    var cotNk = svg(nk, "rect", { x: 526, y: 100, width: 10, height: 150, rx: 5, style: "fill:#ef4444" });
    var soNk = svg(nk, "text", { x: 531, y: 30, "text-anchor": "middle", class: "tc-t-dam" }, "");
    // gioăng phóng to: tròn đàn hồi khi ấm, cứng khi lạnh
    var gio = svg(c, "g", {}); svg(gio, "rect", { x: 356, y: 40, width: 148, height: 120, rx: 12, class: "tc-f-giay tc-net-vien" });
    svg(gio, "text", { x: 430, y: 60, "text-anchor": "middle", class: "tc-t-nho" }, t.gioang);
    svg(gio, "rect", { x: 384, y: 80, width: 40, height: 60, style: "fill:#94a3b8" }); svg(gio, "rect", { x: 436, y: 80, width: 40, height: 60, style: "fill:#94a3b8" });
    var vong = svg(gio, "ellipse", { cx: 430, cy: 110, rx: 10, ry: 10, style: "fill:#1f2937" });
    var khe = svg(gio, "text", { x: 430, y: 154, "text-anchor": "middle", class: "tc-t-nho" }, "");
    function capNhat() {
      var f = +th.value, cdo = Math.round((f - 32) * 5 / 9); nv.textContent = f + "°F (" + cdo + "°C)"; soNk.textContent = f + "°F";
      var h = 150 * (f - 20) / 70; cotNk.setAttribute("y", 250 - h); cotNk.setAttribute("height", h);
      var lanh = f < g.lanh_gioang; vong.setAttribute("rx", lanh ? 6 : 12); vong.setAttribute("ry", lanh ? 10 : 12); vong.style.fill = lanh ? "#1e3a8a" : "#1f2937";
      khe.textContent = lanh ? t.gioang_cung : t.gioang_kin;
      if (b) { var xb = XB(Math.max(b.x_min, Math.min(b.x_max, f))); vachBan.setAttribute("x1", xb); vachBan.setAttribute("x2", xb); chuVach.setAttribute("x", Math.max(100, Math.min(570, xb))); chuVach.textContent = f + "°F"; }
    }
    th.oninput = capNhat; capNhat();
    var chay = false, no = null;
    function ghi(giay, chu) { var li = tao("li", "", (giay != null ? "T+" + so(giay, (String(giay).split(".")[1] || "").length) + " s · " : "") + chu); nhat.appendChild(li); }
    function khoi(x, y, mauK, r) { var o = svg(khoiKhop, "circle", { cx: x, cy: y, r: r || 6, style: "fill:" + mauK + ";opacity:.85" }); return o; }
    phong.onclick = function () {
      if (chay) return; chay = true; phong.disabled = true; th.disabled = true; nhat.innerHTML = ""; ket.hidden = true; khoiKhop.innerHTML = "";
      if (b) nutAn.disabled = true;
      var f = +th.value, that = f <= g.lanh, t0 = null, toc = giam ? 40 : 8, sk = g.su_kien.slice(), vo = false;
      lua.setAttribute("opacity", "1");
      (function bay(ts) {
        if (!t0) t0 = ts; var tg = (ts - t0) / 1000 * toc;
        var len = Math.min(1, tg / 12), y = 260 - len * 110, x = 200 + Math.min(1, tg / 80) * 70, r = Math.min(24, tg * 0.4);
        if (!vo) datTau(x, y, r);
        nen.setAttribute("transform", "translate(0," + Math.min(400, Math.max(0, tg - 4) * 12) + ")");
        vet.forEach(function (o, k) { o.setAttribute("y", ((tg * 55 + k * 53) % 380) - 30); o.style.opacity = tg > 6 && !vo ? ".55" : "0"; });
        if (that) {
          while (sk.length && sk[0][0] <= tg) { var e = sk.shift(); ghi(e[0], t.su_kien[e[1]]); if (e[0] < 3) for (var k = 0; k < 3; k++) khoi(30, 10 - k * 8, k ? "#111827" : "#6b7280", 5); if (e[0] > 55 && e[0] < 60) svg(khoiKhop, "path", { d: "M32 0 q16 10 10 40 q-6 -16 -10 -40 Z", style: "fill:#f97316" }); }
          if (tg >= g.vo && !vo) {
            vo = true; lua.setAttribute("opacity", "0");
            no = svg(c, "g", {}); for (var j = 0; j < 14; j++) svg(no, "circle", { cx: x + (Math.random() - 0.5) * 70, cy: y - 40 + (Math.random() - 0.5) * 60, r: 12 + Math.random() * 18, style: "fill:" + (j % 3 ? "#f8fafc" : "#fb923c") + ";opacity:.9" });
            tau.setAttribute("opacity", "0"); datKet(t.ket_that); ket.hidden = false; lai.hidden = false; chay = false; return;
          }
        } else if (tg > 85) {
          lua.setAttribute("opacity", "0"); datKet(f < 66 ? t.ket_vua : t.ket_am); ket.hidden = false; lai.hidden = false; chay = false; return;
        }
        requestAnimationFrame(bay);
      })(performance.now());
      ghi(0, that ? dien(t.phong_that, { f: f }) : dien(t.phong_khac, { f: f }));
    };
    lai.onclick = function () { lai.hidden = true; phong.disabled = false; th.disabled = false; ket.hidden = true; nhat.innerHTML = ""; khoiKhop.innerHTML = ""; tau.setAttribute("opacity", "1"); lua.setAttribute("opacity", "0"); datTau(200, 260); nen.removeAttribute("transform"); vet.forEach(function (o) { o.style.opacity = "0"; }); if (no) { no.remove(); no = null; } anLai0(); };
    if (b) { s.appendChild(ban); s.appendChild(banCap); s.appendChild(banHang); }
    s.appendChild(san); s.appendChild(nh); s.appendChild(hang); s.appendChild(nhat); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ===== Bản 4: thêm cảnh kéo thả (đồ thị đoán, cân, phòng thí nghiệm, tháp, dòng tiền, bảng điều tra, kim tự tháp) =====
  // Kéo một vật trong SVG: goi lam(p) khi di, xong(p, keo) khi thả (keo = có di chuyển hay chỉ chạm)
  function keoSvg(c, chon, lam, xong) {
    var cam = null, dau, dichuyen;
    c.addEventListener("pointerdown", function (ev) {
      var e = ev.target.closest && ev.target.closest(chon); if (!e || !c.contains(e)) return;
      var r = lam(e, null, "bat"); if (r === false) return;
      cam = e; dau = diemSvg(c, ev); dichuyen = false; c.setPointerCapture(ev.pointerId); ev.preventDefault();
    });
    c.addEventListener("pointermove", function (ev) { if (!cam) return; var p = diemSvg(c, ev); if (Math.abs(p.x - dau.x) + Math.abs(p.y - dau.y) > 5) dichuyen = true; if (dichuyen) lam(cam, p, "di", dau); });
    function tha(ev) { if (!cam) return; var e = cam; cam = null; xong(e, dichuyen ? diemSvg(c, ev) : null); }
    c.addEventListener("pointerup", tha); c.addEventListener("pointercancel", tha);
  }

  // ---------- Cảnh: vẽ đường đoán (kéo các điểm, rồi so với số thật) ----------
  // g.x: nhãn trục ngang; g.that: số thật; g.y_min, g.y_max, g.doan (giá trị khởi đầu), g.le (số lẻ)
  function veDuong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 320", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(xem); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = g.x.length, X0 = 70, X1 = 570, Y0 = 34, Y1 = 262, lo = g.y_min, hi = g.y_max;
    function px(i) { return n === 1 ? (X0 + X1) / 2 : X0 + i * (X1 - X0) / (n - 1); }
    function py(v) { return Y1 - (v - lo) / (hi - lo) * (Y1 - Y0); }
    function vy(y) { return lo + (Y1 - y) / (Y1 - Y0) * (hi - lo); }
    for (var k = 0; k <= 4; k++) { var v = lo + k * (hi - lo) / 4; svg(c, "line", { x1: X0, x2: X1, y1: py(v), y2: py(v), class: "tc-net-mo" }); svg(c, "text", { x: X0 - 8, y: py(v) + 4, "text-anchor": "end", class: "tc-t-nho" }, so(v, g.le)); }
    g.x.forEach(function (l, i) { svg(c, "text", { x: px(i), y: Y1 + 22, "text-anchor": "middle", class: "tc-t-nho" }, l); });
    svg(c, "text", { x: 14, y: 18, class: "tc-t-nho" }, t.truc_y);
    var duongThat = svg(c, "polyline", { points: g.that.map(function (v, i) { return px(i) + "," + py(v); }).join(" "), class: "tc-duong-that", pathLength: 1 }); duongThat.style.opacity = 0;
    var nhomThat = svg(c, "g", { opacity: "0" });
    g.that.forEach(function (v, i) { svg(nhomThat, "circle", { cx: px(i), cy: py(v), r: 6, class: "tc-f-cam" }); svg(nhomThat, "text", { x: px(i), y: py(v) - 12, "text-anchor": "middle", class: "tc-t-dam" }, so(v, g.le_that != null ? g.le_that : g.le)); });
    var doan = g.x.map(function () { return g.doan; }), duong = svg(c, "polyline", { class: "tc-duong-doan" }), tay = [], chu = [];
    g.x.forEach(function (_, i) {
      var h = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "slider", "aria-label": t.nhan_doan + " " + g.x[i], "data-i": i });
      svg(h, "circle", { cx: 0, cy: 0, r: 22, style: "fill:transparent" }); svg(h, "circle", { cx: 0, cy: 0, r: 10, class: "tc-tay-keo" }); tay.push(h);
      chu.push(svg(c, "text", { x: px(i), y: 0, "text-anchor": "middle", class: "tc-t-nho" }, ""));
    });
    var khoa = false;
    function ve() {
      duong.setAttribute("points", doan.map(function (v, i) { return px(i) + "," + py(v); }).join(" "));
      tay.forEach(function (h, i) { h.setAttribute("transform", "translate(" + px(i) + "," + py(doan[i]) + ")"); h.setAttribute("aria-valuenow", doan[i]); chu[i].setAttribute("y", py(doan[i]) + 28); chu[i].textContent = so(doan[i], g.le); });
    }
    ve();
    function dat(i, v) { var b = Math.pow(10, -(g.le || 0)); doan[i] = Math.max(lo, Math.min(hi, Math.round(v / b) * b)); ve(); }
    keoSvg(c, "g.tc-keo", function (e, p) { if (khoa) return false; if (p) dat(+e.getAttribute("data-i"), vy(p.y)); }, function () {});
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-keo"); if (!e || khoa) return; var i = +e.getAttribute("data-i"), b = (hi - lo) / 20;
      if (ev.key === "ArrowUp") { dat(i, doan[i] + b); ev.preventDefault(); } if (ev.key === "ArrowDown") { dat(i, doan[i] - b); ev.preventDefault(); } });
    xem.onclick = function () {
      khoa = true; xem.disabled = true; lai.hidden = false; nhomThat.setAttribute("opacity", "1"); duongThat.style.opacity = 1; chu.forEach(function (x) { x.setAttribute("opacity", "0"); });
      if (!giam) { duongThat.style.strokeDasharray = "1"; duongThat.style.strokeDashoffset = "1"; duongThat.getBoundingClientRect(); duongThat.style.transition = "stroke-dashoffset 1.6s ease-out"; duongThat.style.strokeDashoffset = "0"; }
      var lech = doan.reduce(function (a, v, i) { return a + Math.abs(v - g.that[i]); }, 0) / n;
      ket.textContent = dien(t.ket, { lech: so(lech, g.le) }); ket.hidden = false;
    };
    lai.onclick = function () { khoa = false; xem.disabled = false; lai.hidden = true; ket.hidden = true; nhomThat.setAttribute("opacity", "0"); duongThat.style.opacity = 0; duongThat.style.transition = ""; chu.forEach(function (x) { x.setAttribute("opacity", "1"); }); doan = g.x.map(function () { return g.doan; }); ve(); };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: cái cân (kéo quả cân vào đĩa đúng; khối lượng hiện ra khi đặt) ----------
  // g.vat: [{gt, ben: "t"|"p"}]; t.vat: [{nhan, full}] cùng thứ tự; t.trai, t.phai: tên hai đĩa
  function canThangBang(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "path", { d: "M300 120 L270 300 L330 300 Z", class: "tc-f-thep" }); svg(c, "rect", { x: 230, y: 298, width: 140, height: 10, rx: 4, class: "tc-f-thep" });
    var don = svg(c, "g", {}), L = 200;
    svg(don, "rect", { x: -L, y: -5, width: 2 * L, height: 10, rx: 5, class: "tc-f-muc" }); svg(don, "circle", { cx: 0, cy: 0, r: 9, class: "tc-f-cam" });
    var dia = [-L, L].map(function (x, k) {
      var d = svg(c, "g", {}); svg(d, "line", { x1: -60, y1: 70, x2: 0, y2: 0, class: "tc-day-can" }); svg(d, "line", { x1: 60, y1: 70, x2: 0, y2: 0, class: "tc-day-can" });
      svg(d, "path", { d: "M-80 70 Q0 96 80 70 Z", class: "tc-f-giay tc-net-vien" });
      svg(d, "text", { x: 0, y: 112, "text-anchor": "middle", class: "tc-t-dam" }, k ? t.phai : t.trai);
      var tong = svg(d, "text", { x: 0, y: 128, "text-anchor": "middle", class: "tc-t-nho" }, ""); d.tong = tong; d.vat = []; return d;
    });
    var vat = g.vat.map(function (v, i) {
      var r = 16 + 22 * Math.sqrt(v.gt / Math.max.apply(null, g.vat.map(function (x) { return x.gt; })));
      var e = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": t.vat[i].full, "data-i": i });
      svg(e, "rect", { x: -r, y: -r * 1.2, width: 2 * r, height: r * 1.2, rx: 6, class: "tc-qua-can" });
      svg(e, "rect", { x: -6, y: -r * 1.2 - 8, width: 12, height: 10, rx: 3, class: "tc-qua-can" });
      var nh = svg(e, "text", { x: 0, y: -r * 0.55, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:11px" }, "?");
      return { i: i, gt: v.gt, ben: v.ben, e: e, r: r, nh: nh, o: null, nha: { x: 50 + i * 500 / Math.max(1, g.vat.length - 1), y: 336 } };
    });
    var goc = 0;
    function datVat(v, p, muot) { v.e.style.transition = muot && !giam ? "transform .25s" : ""; v.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); v.p = p; }
    function viTriDia(k) { var a = goc * Math.PI / 180, x = 300 + (k ? L : -L) * Math.cos(a), y = 120 + (k ? L : -L) * Math.sin(a); return { x: x, y: y }; }
    function canLai() {
      var tr = dia[0].vat.reduce(function (a, v) { return a + v.gt; }, 0), ph = dia[1].vat.reduce(function (a, v) { return a + v.gt; }, 0);
      goc = tr + ph ? Math.max(-14, Math.min(14, 14 * (ph - tr) / Math.max(tr, ph))) : 0;
      don.setAttribute("transform", "translate(300,120) rotate(" + goc + ")"); don.style.transition = giam ? "" : "transform .6s";
      dia.forEach(function (d, k) {
        var p = viTriDia(k); d.style.transition = giam ? "" : "transform .6s"; d.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
        d.tong.textContent = d.vat.length ? dien(t.tong, { n: so(k ? ph : tr, g.le) }) : "";
        var rong = d.vat.reduce(function (a, v) { return a + 2 * v.r + 4; }, -4), x0 = p.x - rong / 2;
        d.vat.forEach(function (v) { datVat(v, { x: x0 + v.r, y: p.y + 74 }, true); x0 += 2 * v.r + 4; });
      });
      return { tr: tr, ph: ph };
    }
    vat.forEach(function (v) { datVat(v, v.nha); }); canLai();
    function xong() { if (vat.every(function (x) { return x.o != null; })) { var tg = canLai(); ket.textContent = dien(t.ket, { t: so(tg.tr, g.le), p: so(tg.ph, g.le) }); ket.hidden = false; } }
    // Vật "x" là bẫy: không thuộc đĩa nào, đặt lên đâu cũng bị trả về và gạch đi
    function bay(v) { v.o = "x"; v.nh.textContent = so(v.gt, g.le); datVat(v, v.nha, true); v.e.classList.add("tc-vat-bay"); cap.textContent = t.vat[v.i].full; xong(); }
    function tha(v, k) {
      if (v.ben === "x") { bay(v); return; }
      if (v.ben !== (k ? "p" : "t")) { datVat(v, v.nha, true); cap.textContent = dien(t.sai_dia, { d: k ? t.phai : t.trai }) + " " + t.vat[v.i].full; return; }
      v.o = k; dia[k].vat.push(v); v.nh.textContent = so(v.gt, g.le); cap.textContent = t.vat[v.i].full;
      canLai(); xong();
    }
    keoSvg(c, "g.tc-keo", function (e, p, buoc, dau) {
      var v = vat[+e.getAttribute("data-i")]; if (v.o != null) return false;
      if (buoc === "bat") { c.appendChild(e); v.lech = null; return; }
      if (!v.lech) v.lech = { x: dau.x - v.p.x, y: dau.y - v.p.y };
      datVat(v, { x: p.x - v.lech.x, y: p.y - v.lech.y });
    }, function (e, p) {
      var v = vat[+e.getAttribute("data-i")];
      if (!p) { cap.textContent = t.vat[v.i].full; return; }
      var gan = [0, 1].map(function (k) { var q = viTriDia(k); return Math.hypot(q.x - v.p.x, q.y + 70 - v.p.y); });
      if (Math.min(gan[0], gan[1]) < 130) tha(v, gan[0] < gan[1] ? 0 : 1); else datVat(v, v.nha, true);
    });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-keo"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var v = vat[+e.getAttribute("data-i")]; if (v.o == null) tha(v, v.ben === "p" ? 1 : 0); });
    s.appendChild(san); s.appendChild(cap); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: phòng thí nghiệm (đặt cúp vào phòng bạn đoán thắng, rồi chạy) ----------
  // g.nhom: [{gt}]; t.nhom: [{ten, mo_ta, nhan}]; g.hat: số hạt bay lên mỗi phòng tỉ lệ với gt
  function chiaNhom(g, t) {
    var s = khung(g, t), n = g.nhom.length, W = 600, H = 330, san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), chay = nut(t.nut_chay, true), lai = nut(t.nut_lai, false); chay.disabled = true; lai.hidden = true; hang.appendChild(chay); hang.appendChild(lai);
    var cap = tao("p", "tc-cap", t.chon_cup); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var rw = (W - 40 - (n - 1) * 16) / n, phong = [], max = Math.max.apply(null, g.nhom.map(function (x) { return x.gt; }));
    g.nhom.forEach(function (gn, i) {
      var x = 20 + i * (rw + 16), p = svg(c, "g", { class: "tc-cham-duoc", tabindex: "0", role: "button", "aria-label": t.nhom[i].ten, "data-i": i });
      var nen = svg(p, "rect", { x: x, y: 40, width: rw, height: 200, rx: 12, class: "tc-phong" });
      svg(p, "text", { x: x + rw / 2, y: 62, "text-anchor": "middle", class: "tc-t-dam" }, t.nhom[i].ten);
      cotChu(p, x + rw / 2, 80, [t.nhom[i].mo_ta], "tc-t-nho");
      var nguoi = [], so_ng = gn.nguoi || 4;
      for (var k = 0; k < so_ng; k++) { var ng = svg(p, "g", {}), nx = x + rw / 2 + (k - (so_ng - 1) / 2) * Math.min(34, (rw - 20) / so_ng), ny = 200;
        svg(ng, "circle", { cx: 0, cy: -26, r: 9, class: "tc-f-muc" }); svg(ng, "path", { d: "M-12 8 Q-12 -14 0 -14 Q12 -14 12 8 Z", class: "tc-f-muc" }); ng.setAttribute("transform", "translate(" + nx + "," + ny + ")"); nguoi.push({ e: ng, x: nx, y: ny }); }
      var cot = svg(c, "rect", { x: x + 10, y: 300, width: rw - 20, height: 0, rx: 4, class: "tc-f-cam" });
      var so_ = svg(c, "text", { x: x + rw / 2, y: 292, "text-anchor": "middle", class: "tc-t-dam" }, "");
      phong.push({ p: p, nen: nen, x: x, nguoi: nguoi, cot: cot, so: so_, hat: svg(c, "g", {}) });
    });
    svg(c, "line", { x1: 10, x2: W - 10, y1: 300, y2: 300, class: "tc-net-vien" });
    svg(c, "text", { x: 14, y: 24, class: "tc-t-nho" }, t.truc);
    var cup = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": t.cup });
    svg(cup, "path", { d: "M-14 -30 h28 v10 q0 18 -14 20 q-14 -2 -14 -20 Z", class: "tc-f-cam" }); svg(cup, "rect", { x: -4, y: -2, width: 8, height: 10, class: "tc-f-cam" }); svg(cup, "rect", { x: -12, y: 8, width: 24, height: 6, rx: 2, class: "tc-f-cam" });
    svg(cup, "path", { d: "M-14 -26 q-10 0 -8 8 q2 6 8 6 M14 -26 q10 0 8 8 q-2 6 -8 6", style: "fill:none;stroke:var(--cam);stroke-width:3" });
    var CUP0 = { x: W - 34, y: 30 }, chon = -1, dang = false;
    function datCup(p) { cup.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); cup.p = p; }
    datCup(CUP0);
    function vaoPhong(i) { chon = i; phong.forEach(function (ph, k) { ph.nen.classList.toggle("tc-phong-chon", k === i); }); datCup({ x: phong[i].x + phong[i].nen.getAttribute("width") / 2, y: 128 }); chay.disabled = false; cap.textContent = dien(t.da_chon, { p: t.nhom[i].ten }); }
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { if (dang || lai.hidden === false) return false; if (b === "bat") { cup.lech = null; return; } if (!cup.lech) cup.lech = { x: dau.x - cup.p.x, y: dau.y - cup.p.y }; datCup({ x: p.x - cup.lech.x, y: p.y - cup.lech.y }); },
      function (e, p) { if (!p) return; var k = -1; phong.forEach(function (ph, i) { if (cup.p.x > ph.x && cup.p.x < ph.x + rw) k = i; }); if (k >= 0) vaoPhong(k); else datCup(chon >= 0 ? cup.p : CUP0); });
    phong.forEach(function (ph, i) { ph.p.addEventListener("click", function () { if (!dang && lai.hidden) vaoPhong(i); }); ph.p.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && !dang && lai.hidden) { ev.preventDefault(); vaoPhong(i); } }); });
    chay.onclick = function () {
      dang = true; chay.disabled = true; var t0 = null, T = giam ? 1 : 2600;
      (function buoc(ts) {
        if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T);
        phong.forEach(function (ph, i) {
          var v = g.nhom[i].gt, h = 50 * v / max * f; ph.cot.setAttribute("y", 300 - h); ph.cot.setAttribute("height", h); ph.so.setAttribute("y", 294 - h);
          ph.so.textContent = f >= 1 ? t.nhom[i].nhan : "";
          ph.nguoi.forEach(function (ng, k) { ng.e.setAttribute("transform", "translate(" + ng.x + "," + (ng.y - (f < 1 && !giam ? Math.abs(Math.sin(ts / 180 + k + i)) * 6 : 0)) + ")"); });
          if (f < 1 && !giam && Math.random() < 0.12 * v / max) { var o = svg(ph.hat, "circle", { cx: ph.x + 20 + Math.random() * (rw - 40), cy: 170, r: 5, class: "tc-hat-y" }); o.style.transition = "transform 1s, opacity 1s"; o.getBoundingClientRect(); o.style.transform = "translateY(-70px)"; o.style.opacity = "0"; setTimeout(function () { o.remove(); }, 1000); }
        });
        if (f < 1) requestAnimationFrame(buoc);
        else {
          var thang = 0; g.nhom.forEach(function (x, i) { if (x.gt > g.nhom[thang].gt) thang = i; });
          var hoa = g.nhom.filter(function (x) { return Math.abs(x.gt - g.nhom[thang].gt) <= (g.hoa || 0); }).length > 1;
          ket.textContent = (hoa ? t.hoa : chon === thang ? t.dung : t.sai) + " " + t.ket; ket.hidden = false; lai.hidden = false; dang = false;
        }
      })(performance.now());
    };
    lai.onclick = function () { lai.hidden = true; ket.hidden = true; chon = -1; datCup(CUP0); cap.textContent = t.chon_cup; phong.forEach(function (ph) { ph.nen.classList.remove("tc-phong-chon"); ph.cot.setAttribute("height", 0); ph.cot.setAttribute("y", 300); ph.so.textContent = ""; }); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bảng điều tra (kéo kính lúp vào tờ kế tiếp để lần ngược nguồn, chỉ đỏ nối các tờ) ----------
  // t.to: [{tieu, dong: [..], full}] từ lời đồn đang lan (tờ 0) lần ngược về gốc
  function lanTheoNguon(g, t) {
    var s = khung(g, t), san = canh("tc-canh-ban"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.to[0].full); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), lai = nut(t.nut_lai, false); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = t.to.length, VT = [];
    for (var i = 0; i < n; i++) VT.push({ x: 20 + i * (560 - 150) / Math.max(1, n - 1), y: i % 2 ? 150 : 40 });
    var chi = svg(c, "g", {}), to = t.to.map(function (d, i) {
      var e = svg(c, "g", { "data-i": i }); e.setAttribute("transform", "translate(" + VT[i].x + "," + VT[i].y + ") rotate(" + (i % 2 ? 2 : -2) + ")");
      svg(e, "rect", { x: 0, y: 0, width: 150, height: 120, rx: 4, class: "tc-to-giay" });
      svg(e, "circle", { cx: 75, cy: 6, r: 6, class: "tc-ghim" });
      var noi = svg(e, "g", {}); svg(noi, "text", { x: 10, y: 30, class: "tc-t-dam", style: "font-size:12px" }, d.tieu); cotChu(noi, 75, 52, d.dong, "tc-t-nho", 15); noi.querySelectorAll("text").forEach(function (x, k) { if (k) { x.setAttribute("x", 10); x.setAttribute("text-anchor", "start"); } });
      var up = svg(e, "g", {}); svg(up, "rect", { x: 0, y: 0, width: 150, height: 120, rx: 4, class: "tc-to-up" }); svg(up, "text", { x: 75, y: 68, "text-anchor": "middle", class: "tc-t-nho", style: "font-size:22px" }, "?");
      if (!i) up.setAttribute("opacity", "0");
      return { e: e, up: up, mo: !i };
    });
    var kinh = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": t.kinh });
    svg(kinh, "circle", { cx: 0, cy: 0, r: 26, style: "fill:rgba(255,255,255,.35);stroke:var(--ink);stroke-width:5" }); svg(kinh, "line", { x1: 18, y1: 18, x2: 40, y2: 40, style: "stroke:var(--ink);stroke-width:9;stroke-linecap:round" });
    var K0 = { x: 545, y: 290 }, ke = 1;
    function datK(p) { kinh.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); kinh.p = p; } datK(K0);
    function mo(i) {
      if (i !== ke) return false; var a = VT[i - 1], b = VT[i];
      var l = svg(chi, "line", { x1: a.x + 75, y1: a.y + 6, x2: b.x + 75, y2: b.y + 6, class: "tc-chi-do", pathLength: 1 });
      if (!giam) { l.style.strokeDasharray = "1"; l.style.strokeDashoffset = "1"; l.getBoundingClientRect(); l.style.transition = "stroke-dashoffset .6s"; l.style.strokeDashoffset = "0"; }
      to[i].up.style.transition = giam ? "" : "opacity .5s .4s"; to[i].up.setAttribute("opacity", "0"); to[i].mo = true; cap.textContent = t.to[i].full; ke++;
      if (ke === n) { ket.textContent = t.ket; ket.hidden = false; }
      return true;
    }
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { if (b === "bat") { kinh.lech = null; return; } if (!kinh.lech) kinh.lech = { x: dau.x - kinh.p.x, y: dau.y - kinh.p.y }; datK({ x: p.x - kinh.lech.x, y: p.y - kinh.lech.y }); },
      function (e, p) {
        if (!p) { if (ke < n) mo(ke); return; }
        var trung = -1; VT.forEach(function (v, i) { if (kinh.p.x > v.x - 10 && kinh.p.x < v.x + 160 && kinh.p.y > v.y - 10 && kinh.p.y < v.y + 130) trung = i; });
        if (trung >= 0 && to[trung].mo) cap.textContent = t.to[trung].full; else if (trung >= 0 && !mo(trung)) cap.textContent = t.chua_toi;
      });
    c.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest && ev.target.closest("g.tc-keo")) { ev.preventDefault(); if (ke < n) mo(ke); } });
    to.forEach(function (x, i) { x.e.addEventListener("click", function () { if (x.mo) cap.textContent = t.to[i].full; }); });
    lai.onclick = function () { chi.innerHTML = ""; ke = 1; ket.hidden = true; datK(K0); cap.textContent = t.to[0].full; to.forEach(function (x, i) { if (i) { x.mo = false; x.up.style.transition = ""; x.up.setAttribute("opacity", "1"); } }); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tin xấu đi lên (mỗi tầng bạn chọn nói thẳng hay nói nhẹ; thẻ tin nhạt dần) ----------
  // t.tang: [{ten, ap_luc, nhe}] từ dưới lên; tầng trên cùng chỉ nghe (không chọn); t.tin_ngan: tin gốc
  function kimTuThap(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), n = t.tang.length, c = svg(san, "svg", { viewBox: "0 0 600 " + (60 + n * 64), role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", ""); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), thang = nut(t.nut_thang, true), nhe = nut(t.nut_nhe, false), lai = nut(t.nut_lai, false); lai.hidden = true;
    hang.appendChild(thang); hang.appendChild(nhe); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var H = 60 + n * 64, Y = function (i) { return H - 40 - i * 64; };
    t.tang.forEach(function (tg, i) {
      var w = 520 - i * (360 / n);
      svg(c, "rect", { x: 300 - w / 2, y: Y(i) - 26, width: w, height: 52, rx: 8, class: "tc-tang" });
      svg(c, "text", { x: 300 - w / 2 + 12, y: Y(i) + 5, class: "tc-t-dam", style: "font-size:12px" }, tg.ten);
    });
    var the = svg(c, "g", {}), nen = svg(the, "rect", { x: -95, y: -20, width: 190, height: 40, rx: 8 }), chu = svg(the, "text", { x: 0, y: 5, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:12px" }, "");
    var muc = 0, giamDi = 0;
    var lan = n - 1;
    function datThe() {
      var p = 1 - giamDi / lan, mauT = "hsl(" + Math.round(4 + 120 * (1 - p)) + ",70%," + (40 + 8 * (1 - p)) + "%)";
      nen.style.fill = mauT; the.style.transition = giam ? "" : "transform .6s"; the.setAttribute("transform", "translate(" + (300 + 110 - muc * 8) + "," + Y(Math.min(muc, n - 1)) + ")");
    }
    function batDau() { muc = 0; giamDi = 0; chu.textContent = t.tin_ngan; datThe(); cap.textContent = t.tang[0].ap_luc; thang.disabled = nhe.disabled = false; thang.hidden = nhe.hidden = false; lai.hidden = true; ket.hidden = true; }
    function di(nheDi) {
      if (nheDi) { giamDi++; chu.textContent = t.tang[muc].nhe; }
      muc++; datThe();
      if (muc >= lan) { thang.hidden = nhe.hidden = true; lai.hidden = false; cap.textContent = dien(t.dinh_nghe, { tin: chu.textContent }); ket.textContent = (giamDi ? dien(t.ket_nhe, { n: giamDi }) : t.ket_thang) + " " + t.ket; ket.hidden = false; return; }
      cap.textContent = t.tang[muc].ap_luc;
    }
    thang.onclick = function () { di(false); }; nhe.onclick = function () { di(true); }; lai.onclick = batDau;
    batDau();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tháp vay nợ (chồng khối vay lên khối vốn, rồi cho giá giảm) ----------
  // g.von: số khối vốn (1), g.toi_da: số khối vay tối đa, g.that: số khối vay thật, g.buoc, g.le_bay, g.giam: % giảm thử; t.nut_repo + g.repo_khoi: tùy chọn giấu bớt khối vay
  function xayThap(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 360", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", ""); cap.setAttribute("aria-live", "polite");
    var idT = g.id + "-vay", nh = tao("label", "tc-o-nhap", t.vay_hoi + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = g.toi_da; th.step = g.buoc || 1; th.value = 5; th.id = idT; nh.appendChild(th);
    var hang = tao("div", "tc-hang"), sap = nut(dien(t.nut_giam, { p: so(g.giam, 1) }), true), that = nut(t.nut_that, false), lai = nut(t.nut_lai, false); lai.hidden = true;
    sap.classList.add("tc-nut-do"); hang.appendChild(that); hang.appendChild(sap);
    var repo = null; if (t.nut_repo) { repo = nut(t.nut_repo, false); hang.appendChild(repo); }
    hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 330, width: 600, height: 30, class: "tc-f-dat" });
    var thap = svg(c, "g", {}), khoi = [], BH = 300 / (g.toi_da + g.von), BW = 150;
    function veThap(k) {
      thap.innerHTML = ""; khoi = [];
      for (var i = 0; i < g.von + k; i++) {
        var la = i < g.von, b = svg(thap, "rect", { x: 225, y: 330 - (i + 1) * BH, width: BW, height: BH - 1, rx: 1.5, class: la ? "tc-khoi-von" : "tc-khoi-vay" });
        khoi.push(b);
      }
      svg(thap, "text", { x: 300 + BW / 2 + 12, y: 330 - g.von * BH / 2 + 4, class: "tc-t-dam", style: "font-size:12px" }, t.von);
      if (k) svg(thap, "text", { x: 300 + BW / 2 + 12, y: 330 - (g.von + k / 2) * BH, class: "tc-t-nho" }, t.vay);
      var tong = g.von + k; nv.textContent = dien(t.don_bay, { n: so(tong / g.von, g.le_bay || 0) });
      cap.textContent = dien(t.mat, { p: so(100 * g.von / tong, 1) });
    }
    th.oninput = function () { veThap(+th.value); ket.hidden = true; }; veThap(+th.value);
    that.onclick = function () { th.value = g.that; th.oninput(); cap.textContent = t.that_la + " " + cap.textContent; };
    if (repo) repo.onclick = function () { var m = khoi.length; for (var i = 0; i < Math.min(g.repo_khoi, m - g.von); i++) khoi[m - 1 - i].classList.add("tc-khoi-an"); cap.textContent = t.repo; };
    sap.onclick = function () {
      sap.disabled = that.disabled = th.disabled = true; if (repo) repo.disabled = true; lai.hidden = false;
      var tong = g.von + +th.value, lo = tong * g.giam / 100, sap_ = lo >= g.von;
      for (var i = 0; i < g.von; i++) khoi[i].classList.add("tc-khoi-mat");
      if (sap_) khoi.forEach(function (b, i) { if (giam) { b.setAttribute("opacity", "0.2"); return; } b.style.transformBox = "fill-box"; b.style.transformOrigin = "50% 100%"; b.style.transition = "transform 1.1s cubic-bezier(.5,0,.8,.4) " + (i * 18) + "ms"; b.style.transform = "translate(" + ((i % 2 ? 1 : -1) * (40 + i * 4)) + "px," + (i * 2) + "px) rotate(" + ((i % 2 ? 1 : -1) * (30 + i)) + "deg)"; });
      ket.textContent = (sap_ ? dien(t.sap, { p: so(g.giam, 1) }) : dien(t.dung_vung, { p: so(g.giam, 1), con: so(100 * (g.von - lo) / g.von, 0) })) + " " + t.ket; ket.hidden = false;
    };
    lai.onclick = function () { sap.disabled = that.disabled = th.disabled = false; if (repo) repo.disabled = false; lai.hidden = true; ket.hidden = true; veThap(+th.value); };
    s.appendChild(san); s.appendChild(nh); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: dòng tiền (đồng xu chạy giữa các hộp; soi từng hộp để lộ ống ngầm) ----------
  // g.hop: [{x, y}], g.ong: [{tu, den, an}]; t.hop: [{ten, soi}], t.ong: [nhãn]
  function dongTien(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 330", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var dem = tao("p", "tc-so-nho", ""), ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var HW = 130, HH = 56, ong = g.ong.map(function (o, i) {
      var a = g.hop[o.tu], b = g.hop[o.den], d = "M" + a.x + " " + a.y + " L" + b.x + " " + b.y;
      var e = svg(c, "path", { d: d, class: o.an ? "tc-ong tc-ong-an" : "tc-ong" });
      var nh = svg(c, "text", { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8, "text-anchor": "middle", class: "tc-t-nho tc-nhan-ong" }, t.ong[i]);
      if (o.an) { e.setAttribute("opacity", "0"); nh.setAttribute("opacity", "0"); }
      return { o: o, e: e, nh: nh, lo: !o.an, a: a, b: b };
    });
    var xu = svg(c, "g", {});
    var hop = g.hop.map(function (h, i) {
      var e = svg(c, "g", { class: "tc-cham-duoc", tabindex: "0", role: "button", "aria-label": t.hop[i].ten });
      svg(e, "rect", { x: h.x - HW / 2, y: h.y - HH / 2, width: HW, height: HH, rx: 10, class: "tc-hop-tien" });
      cotChu(e, h.x, h.y - 2, t.hop[i].ten.split("\n"), "tc-t-dam", 15);
      e.addEventListener("click", function () { soi(i); }); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); soi(i); } });
      return e;
    });
    var an = ong.filter(function (x) { return x.o.an; }).length;
    function capDem() { var lo = ong.filter(function (x) { return x.o.an && x.lo; }).length; dem.textContent = dien(t.dem, { k: lo, n: an }); return lo; }
    function soi(i) {
      cap.textContent = t.hop[i].soi;
      ong.forEach(function (x) { if (x.o.an && !x.lo && (x.o.tu === i || x.o.den === i) && x.o.lo_o === i) { x.lo = true; x.e.style.transition = x.nh.style.transition = giam ? "" : "opacity .6s"; x.e.setAttribute("opacity", "1"); x.nh.setAttribute("opacity", "1"); } });
      if (capDem() === an && ket.hidden) { ket.textContent = t.ket; ket.hidden = false; }
    }
    capDem();
    var chay = false;
    if ("IntersectionObserver" in window && !giam) new IntersectionObserver(function (e) { chay = e[0].isIntersecting; if (chay) requestAnimationFrame(buoc); }).observe(c);
    var dong = [];
    function buoc(ts) {
      if (!chay) return;
      ong.forEach(function (x) { if (x.lo && Math.random() < 0.03) dong.push({ x: x, f: 0, e: svg(xu, "circle", { r: 6, class: x.o.an ? "tc-xu-do" : "tc-xu" }) }); });
      dong = dong.filter(function (d) { d.f += 0.012; if (d.f >= 1) { d.e.remove(); return false; } d.e.setAttribute("cx", d.x.a.x + (d.x.b.x - d.x.a.x) * d.f); d.e.setAttribute("cy", d.x.a.y + (d.x.b.y - d.x.a.y) * d.f); return true; });
      requestAnimationFrame(buoc);
    }
    s.appendChild(san); s.appendChild(cap); s.appendChild(dem); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: cắm cờ đoán vị trí (kéo cờ trên thước, rồi các nhân vật chạy tới số thật) ----------
  // g.max, g.vach (khoảng vạch), g.le, g.hinh: "ca" | "nguoi" | "quan"; g.that: [số]; g.moc: [số] vạch mốc cố định
  // t.that: [nhãn từng nhân vật], t.moc: [nhãn mốc], t.don_vi, t.co, t.nut_xem, t.nut_lai, t.ket ({doan})
  function doanViTri(g, t) {
    var s = khung(g, t), san = canh(g.hinh === "ca" ? "tc-canh-nuoc" : "tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 290", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(xem); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var X0 = 40, X1 = 560, Y = 240;
    function px(v) { return X0 + v / g.max * (X1 - X0); }
    function vx(x) { return (x - X0) / (X1 - X0) * g.max; }
    svg(c, "line", { x1: X0, x2: X1, y1: Y, y2: Y, class: "tc-thuoc" });
    for (var v = 0; v <= g.max + 1e-9; v += g.vach) { svg(c, "line", { x1: px(v), x2: px(v), y1: Y, y2: Y + 8, class: "tc-thuoc" }); svg(c, "text", { x: px(v), y: Y + 24, "text-anchor": "middle", class: "tc-t-nho" }, so(v, 0)); }
    svg(c, "text", { x: X1, y: Y + 42, "text-anchor": "end", class: "tc-t-nho" }, t.don_vi);
    (g.moc || []).forEach(function (m, i) {
      svg(c, "line", { x1: px(m), x2: px(m), y1: 26, y2: Y, class: "tc-vach-moc" });
      svg(c, "text", { x: px(m) + 4, y: 22 + (i % 2) * 14, class: "tc-t-nho" }, t.moc[i]);
    });
    var vat = g.that.map(function (gt, i) {
      var e = svg(c, "g", { class: "tc-vat-chay" }), y = g.that.length > 1 ? 84 + i * (140 / g.that.length) : 120;
      if (g.hinh === "ca") { svg(e, "ellipse", { cx: 0, cy: 0, rx: 18, ry: 10, style: "fill:#f59e0b" }); svg(e, "path", { d: "M-16 0 L-30 -10 L-30 10 Z", style: "fill:#f59e0b" }); svg(e, "circle", { cx: 9, cy: -3, r: 2, style: "fill:#111" }); }
      else if (g.hinh === "quan") { svg(e, "circle", { cx: 0, cy: -16, r: 8, class: "tc-f-muc" }); svg(e, "path", { d: "M-7 -10 L-11 8 L11 8 L7 -10 Z", class: "tc-f-muc" }); svg(e, "rect", { x: -14, y: 8, width: 28, height: 6, rx: 2, class: "tc-f-muc" }); }
      else { svg(e, "circle", { cx: 0, cy: -22, r: 7, class: "tc-f-muc" }); svg(e, "line", { x1: 0, y1: -15, x2: 0, y2: 2, class: "tc-net-nguoi" }); var chan = svg(e, "path", { d: "M-7 16 L0 2 L7 16", class: "tc-net-nguoi" }); e.chan = chan; }
      var nh = svg(c, "text", { x: 0, y: 0, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:12px" }, ""); nh.setAttribute("opacity", "0");
      var o = { gt: gt, e: e, y: y, nh: nh, i: i }; e.setAttribute("transform", "translate(" + px(0) + "," + y + ")"); return o;
    });
    var co = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "slider", "aria-label": t.co });
    svg(co, "rect", { x: -16, y: -60, width: 40, height: 80, style: "fill:transparent" }); svg(co, "line", { x1: 0, y1: -50, x2: 0, y2: 10, style: "stroke:var(--ink);stroke-width:3" });
    svg(co, "path", { d: "M0 -50 L22 -42 L0 -34 Z", class: "tc-f-cam" });
    var coSo = svg(c, "text", { x: 0, y: -56, "text-anchor": "middle", class: "tc-t-dam" }, "");
    var doan = g.doan != null ? g.doan : g.max / 2, khoa = false;
    function datCo() { co.setAttribute("transform", "translate(" + px(doan) + "," + (Y - 10) + ")"); coSo.setAttribute("x", px(doan)); coSo.setAttribute("y", Y - 66); coSo.textContent = so(doan, g.le); co.setAttribute("aria-valuenow", doan); }
    datCo();
    function dat(v) { var b = g.buoc || 1; doan = Math.max(0, Math.min(g.max, Math.round(v / b) * b)); datCo(); }
    keoSvg(c, "g.tc-keo", function (e, p) { if (khoa) return false; if (p) dat(vx(p.x)); }, function () {});
    c.addEventListener("keydown", function (ev) { if (!ev.target.closest || !ev.target.closest("g.tc-keo") || khoa) return; var b = (g.buoc || 1) * Math.max(1, Math.round(g.max / 100 / (g.buoc || 1)));
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { dat(doan + b); ev.preventDefault(); } if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { dat(doan - b); ev.preventDefault(); } });
    xem.onclick = function () {
      khoa = true; xem.disabled = true; var t0 = null, T = giam ? 1 : 3200, max = Math.max.apply(null, g.that);
      (function buoc(ts) {
        if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T);
        vat.forEach(function (o) {
          var fo = Math.min(1, f * max / o.gt), x = px(o.gt * (1 - Math.pow(1 - fo, 2))), lac = fo < 1 && !giam ? Math.sin(ts / 90 + o.i) * 3 : 0;
          o.e.setAttribute("transform", "translate(" + x + "," + (o.y + lac) + ")");
          if (o.e.chan) o.e.chan.setAttribute("d", fo < 1 ? (Math.sin(ts / 70) > 0 ? "M-7 16 L0 2 L5 16" : "M-4 16 L0 2 L7 16") : "M-7 16 L0 2 L7 16");
          if (fo >= 1 && o.nh.getAttribute("opacity") === "0") { o.nh.setAttribute("x", x); o.nh.setAttribute("text-anchor", x > 470 ? "end" : x < 130 ? "start" : "middle"); o.nh.setAttribute("y", o.y - 30); o.nh.textContent = t.that[o.i]; o.nh.setAttribute("opacity", "1"); }
        });
        if (f < 1) requestAnimationFrame(buoc);
        else { ket.textContent = dien(t.ket, { doan: so(doan, g.le) }); ket.hidden = false; lai.hidden = false; }
      })(performance.now());
    };
    lai.onclick = function () { khoa = false; xem.disabled = false; lai.hidden = true; ket.hidden = true; vat.forEach(function (o) { o.e.setAttribute("transform", "translate(" + px(0) + "," + o.y + ")"); o.nh.setAttribute("opacity", "0"); }); };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: não chia đôi (kéo chữ vào nửa trái hoặc phải màn hình, xem bán cầu nào nhận) ----------
  // t.tu: chữ chiếu; t.do_vat: tên đồ vật trên khay, g.dung: vật đúng; t.noi_thay/noi_khong: câu bệnh nhân nói
  function naoChiaDoi(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 360", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), noi = nut(t.nut_noi, false), lai = nut(t.nut_lai, false); hang.appendChild(noi); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    // màn hình
    svg(c, "rect", { x: 150, y: 14, width: 300, height: 110, rx: 8, class: "tc-man-hinh" });
    svg(c, "line", { x1: 300, x2: 300, y1: 20, y2: 118, class: "tc-net-mo", style: "stroke-dasharray:4 4" });
    svg(c, "circle", { cx: 300, cy: 69, r: 4, style: "fill:#fbbf24" });
    svg(c, "text", { x: 225, y: 112, "text-anchor": "middle", class: "tc-t-nho", style: "fill:#94a3b8" }, t.nua_trai);
    svg(c, "text", { x: 375, y: 112, "text-anchor": "middle", class: "tc-t-nho", style: "fill:#94a3b8" }, t.nua_phai);
    // não nhìn từ trên: bán cầu trái bên trái hình
    var bt = svg(c, "path", { d: "M296 160 C230 150 205 200 210 245 C215 300 260 330 296 325 Z", class: "tc-ban-cau" });
    var bp = svg(c, "path", { d: "M304 160 C370 150 395 200 390 245 C385 300 340 330 304 325 Z", class: "tc-ban-cau" });
    svg(c, "text", { x: 250, y: 240, "text-anchor": "middle", class: "tc-t-nho" }, t.ban_trai); svg(c, "text", { x: 350, y: 240, "text-anchor": "middle", class: "tc-t-nho" }, t.ban_phai);
    svg(c, "text", { x: 250, y: 256, "text-anchor": "middle", class: "tc-t-nho" }, t.ngon_ngu);
    var the_chai = svg(c, "line", { x1: 300, x2: 300, y1: 175, y2: 310, class: "tc-the-chai" });
    var tinHieu = svg(c, "circle", { cx: 0, cy: 0, r: 7, class: "tc-f-cam", opacity: "0" });
    // bóng thoại và khay đồ
    var bong = svg(c, "g", { opacity: "0" }); svg(bong, "rect", { x: 412, y: 150, width: 180, height: 50, rx: 14, class: "tc-f-giay tc-net-vien" }); var loi = svg(bong, "text", { x: 502, y: 180, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:12px" }, "");
    var khay = svg(c, "g", {}); svg(khay, "rect", { x: 14, y: 250, width: 170, height: 80, rx: 10, class: "tc-f-giay tc-net-vien" }); svg(khay, "text", { x: 99, y: 268, "text-anchor": "middle", class: "tc-t-nho" }, t.khay);
    var dov = t.do_vat.map(function (ten, i) { var e = svg(khay, "g", {}); svg(e, "rect", { x: 22 + i * 54, y: 278, width: 48, height: 40, rx: 6, class: "tc-o-do" }); svg(e, "text", { x: 46 + i * 54, y: 302, "text-anchor": "middle", class: "tc-t-nho", style: "font-size:10px" }, ten); return e; });
    var the = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": t.tu });
    svg(the, "rect", { x: -48, y: -16, width: 96, height: 32, rx: 6, style: "fill:#fde68a" }); svg(the, "text", { x: 0, y: 5, "text-anchor": "middle", class: "tc-t-dam", style: "fill:#1b1305" }, t.tu);
    var T0 = { x: 520, y: 60 }; function datThe(p) { the.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); the.p = p; } datThe(T0);
    var cat = true, da = {};
    function chieu(ben) {
      datThe({ x: ben ? 375 : 225, y: 60 }); bong.setAttribute("opacity", "0"); dov.forEach(function (e) { e.classList.remove("tc-do-chon"); });
      var a = { x: ben ? 375 : 225, y: 70 }, b = { x: ben ? 250 : 350, y: 220 }, t0 = null, T = giam ? 1 : 900;
      [bt, bp].forEach(function (x) { x.classList.remove("tc-ban-sang"); });
      tinHieu.setAttribute("opacity", "1");
      (function buoc(ts) {
        if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T); tinHieu.setAttribute("cx", a.x + (b.x - a.x) * f); tinHieu.setAttribute("cy", a.y + (b.y - a.y) * f);
        if (f < 1) { requestAnimationFrame(buoc); return; }
        tinHieu.setAttribute("opacity", "0"); (ben ? bt : bp).classList.add("tc-ban-sang");
        if (!cat) (ben ? bp : bt).classList.add("tc-ban-sang");
        var nhan = ben || !cat; loi.textContent = nhan ? t.noi_thay : t.noi_khong; bong.setAttribute("opacity", "1");
        if (!ben || !cat) dov[g.dung].classList.add("tc-do-chon");
        cap.textContent = !cat ? t.giai_lien : ben ? t.giai_phai : t.giai_trai; da[ben ? "p" : "t"] = true;
        if (da.p && da.t && cat) { ket.textContent = t.ket; ket.hidden = false; }
      })(performance.now());
    }
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { if (b === "bat") { the.lech = null; return; } if (!the.lech) the.lech = { x: dau.x - the.p.x, y: dau.y - the.p.y }; datThe({ x: p.x - the.lech.x, y: p.y - the.lech.y }); },
      function (e, p) { if (!p) { chieu(!da.p); return; } if (the.p.y < 140 && the.p.x > 140 && the.p.x < 460) chieu(the.p.x > 300); else datThe(T0); });
    c.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest && ev.target.closest("g.tc-keo")) { ev.preventDefault(); chieu(!!da.t && !da.p); } });
    noi.onclick = function () { cat = !cat; the_chai.classList.toggle("tc-the-chai-lien", !cat); noi.textContent = cat ? t.nut_noi : t.nut_cat; cap.textContent = cat ? t.doc_mac : t.doc_lien; bong.setAttribute("opacity", "0"); [bt, bp].forEach(function (x) { x.classList.remove("tc-ban-sang"); }); datThe(T0); };
    lai.onclick = function () { da = {}; cat = false; noi.onclick(); ket.hidden = true; dov.forEach(function (e) { e.classList.remove("tc-do-chon"); }); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bàn trộn lời, giọng, mặt (kiểu thí nghiệm Mehrabian) ----------
  // t.kenh: [{ten, muc: [3 nhãn: thiện cảm, trung tính, ác cảm]}] theo thứ tự lời, giọng, mặt; g.trong: [7, 38, 55]
  function banTron(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 320", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var chon = [null, null, null], GT = [1, 0, -1], thu = { lech: false, khop: false };
    var nut3 = t.kenh.map(function (k, ci) {
      var x = 20 + ci * 128;
      svg(c, "text", { x: x + 58, y: 22, "text-anchor": "middle", class: "tc-t-dam" }, k.ten);
      return k.muc.map(function (m, mi) {
        var e = svg(c, "g", { class: "tc-cham-duoc tc-nut-tron", tabindex: "0", role: "button", "aria-label": k.ten + ": " + m });
        svg(e, "rect", { x: x, y: 34 + mi * 62, width: 116, height: 54, rx: 10, class: "tc-o-tron" });
        if (ci === 1) svg(e, "path", { d: "M" + (x + 14) + " " + (58 + mi * 62) + [" q10 -10 20 0 t20 0 t20 0 t20 0", " h80", " l8 -12 l8 22 l8 -22 l8 22 l8 -22 l8 22 l8 -12 h24"][mi], class: "tc-song" });
        else if (ci === 2) { var cy = 56 + mi * 62; svg(e, "circle", { cx: x + 58, cy: cy, r: 14, class: "tc-mat" }); svg(e, "path", { d: ["M" + (x + 51) + " " + (cy + 4) + " q7 6 14 0", "M" + (x + 51) + " " + (cy + 5) + " h14", "M" + (x + 51) + " " + (cy + 8) + " q7 -6 14 0"][mi], class: "tc-mieng" }); }
        svg(e, "text", { x: x + 58, y: (ci === 0 ? 66 : 82) + mi * 62, "text-anchor": "middle", class: ci === 0 ? "tc-t-dam" : "tc-t-nho", style: ci ? "font-size:10px" : "" }, m);
        e.addEventListener("click", function () { bam(ci, mi); }); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); bam(ci, mi); } });
        return e;
      });
    });
    // người nghe
    svg(c, "text", { x: 500, y: 22, "text-anchor": "middle", class: "tc-t-dam" }, t.nguoi_nghe);
    svg(c, "circle", { cx: 500, cy: 110, r: 46, class: "tc-mat" }); svg(c, "circle", { cx: 484, cy: 98, r: 4, class: "tc-f-muc" }); svg(c, "circle", { cx: 516, cy: 98, r: 4, class: "tc-f-muc" });
    var mieng = svg(c, "path", { d: "M480 128 h40", class: "tc-mieng" });
    svg(c, "rect", { x: 420, y: 186, width: 160, height: 14, rx: 7, class: "tc-o-tron" }); var kim = svg(c, "rect", { x: 497, y: 180, width: 6, height: 26, rx: 3, class: "tc-f-cam" });
    svg(c, "text", { x: 420, y: 218, class: "tc-t-nho" }, t.ac_cam); svg(c, "text", { x: 580, y: 218, "text-anchor": "end", class: "tc-t-nho" }, t.thien_cam);
    var chuDiem = svg(c, "text", { x: 500, y: 244, "text-anchor": "middle", class: "tc-t-dam" }, "");
    svg(c, "text", { x: 300, y: 300, "text-anchor": "middle", class: "tc-t-nho" }, t.cong_thuc);
    function bam(ci, mi) {
      chon[ci] = mi; nut3[ci].forEach(function (e, k) { e.classList.toggle("tc-dang-chon-o", k === mi); });
      if (chon.some(function (x) { return x == null; })) { cap.textContent = t.chon_tiep; return; }
      var d = (g.trong[0] * GT[chon[0]] + g.trong[1] * GT[chon[1]] + g.trong[2] * GT[chon[2]]) / 100;
      kim.style.transition = giam ? "" : "transform .5s"; kim.setAttribute("transform", "translate(" + (d * 77) + ",0)");
      mieng.setAttribute("d", "M480 " + (128 - d * 4) + " q20 " + (d * 16) + " 40 0");
      chuDiem.textContent = dien(t.diem, { d: so(d * 100, 0) });
      var lech = !(chon[0] === chon[1] && chon[1] === chon[2]); thu[lech ? "lech" : "khop"] = true;
      cap.textContent = lech ? t.khi_lech : t.khi_khop;
      if (thu.lech && thu.khop) { ket.textContent = t.ket; ket.hidden = false; }
    }
    s.appendChild(san); s.appendChild(cap); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: hai phòng họp (mô phỏng chờ lượt nói so với viết riêng) ----------
  // g.giay: thời gian mô phỏng; t.phong: [tên phòng họp chung, tên phòng viết riêng]
  function hopNhom(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(bd); hang.appendChild(lai);
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var P = [0, 1].map(function (k) {
      var x0 = 14 + k * 296;
      svg(c, "rect", { x: x0, y: 10, width: 276, height: 250, rx: 12, class: "tc-phong" });
      svg(c, "text", { x: x0 + 138, y: 32, "text-anchor": "middle", class: "tc-t-dam" }, t.phong[k]);
      if (!k) svg(c, "ellipse", { cx: x0 + 138, cy: 170, rx: 70, ry: 34, class: "tc-f-go" });
      var ng = [0, 1, 2, 3].map(function (i) {
        var x = k ? x0 + 38 + (i % 2) * 140 : x0 + 138 + [-86, -30, 30, 86][i], y = k ? 120 + Math.floor(i / 2) * 90 : 160 + (i % 2 ? -50 : 40);
        if (k) svg(c, "rect", { x: x - 30, y: y + 10, width: 60, height: 8, rx: 3, class: "tc-f-go" });
        var e = svg(c, "g", {}); svg(e, "circle", { cx: x, cy: y - 18, r: 9, class: "tc-f-muc" }); svg(e, "path", { d: "M" + (x - 12) + " " + (y + 8) + " Q" + (x - 12) + " " + (y - 8) + " " + x + " " + (y - 8) + " Q" + (x + 12) + " " + (y - 8) + " " + (x + 12) + " " + (y + 8) + " Z", class: "tc-f-muc" });
        return { x: x, y: y, e: e, cho: [] };
      });
      var dem = svg(c, "text", { x: x0 + 138, y: 252, "text-anchor": "middle", class: "tc-t-dam" }, "");
      return { x0: x0, ng: ng, dem: dem, so: 0, hat: svg(c, "g", {}) };
    });
    var mic = svg(c, "circle", { r: 6, class: "tc-f-cam", opacity: "0" });
    var dang = false, hen = null;
    function bong(ph, n, mau, len) { var o = svg(ph.hat, "circle", { cx: n.x + (Math.random() - 0.5) * 20, cy: n.y - 34, r: 6, class: mau }); o.style.transition = giam ? "" : "transform 1s, opacity 1s"; o.getBoundingClientRect(); o.style.transform = "translateY(" + (len || -30) + "px)"; o.style.opacity = "0"; setTimeout(function () { o.remove(); }, 1000); }
    bd.onclick = function () {
      dang = true; bd.disabled = true; ket.hidden = true; P.forEach(function (p) { p.so = 0; p.dem.textContent = ""; p.ng.forEach(function (n) { n.cho = []; }); });
      var tg = 0, luot = 0, quen = 0; mic.setAttribute("opacity", "1");
      hen = setInterval(function () {
        tg += 0.1;
        // phòng họp chung: ai cũng nảy ý, nhưng chỉ người cầm lượt được nói; ý chờ lâu thì quên
        var A = P[0];
        A.ng.forEach(function (n, i) { if (Math.random() < 0.05) n.cho.push(tg); n.cho = n.cho.filter(function (t0) { if (tg - t0 > 2.2) { quen++; bong(A, n, "tc-hat-quen", 10); return false; } return true; }); });
        if (Math.round(tg * 10) % 8 === 0) { luot = (luot + 1) % 4; }
        var nn = A.ng[luot]; mic.setAttribute("cx", nn.x); mic.setAttribute("cy", nn.y - 40);
        if (nn.cho.length && Math.random() < 0.25) { nn.cho.shift(); A.so++; bong(A, nn, "tc-hat-y"); }
        // phòng viết riêng: ai nảy ý thì ghi ngay
        var B = P[1]; B.ng.forEach(function (n) { if (Math.random() < 0.05) { B.so++; bong(B, n, "tc-hat-y"); } });
        A.dem.textContent = dien(t.dem, { n: A.so }); B.dem.textContent = dien(t.dem, { n: B.so });
        cap.textContent = dien(t.dang_chay, { q: quen });
        if (tg >= g.giay) {
          clearInterval(hen); dang = false; mic.setAttribute("opacity", "0"); lai.hidden = false;
          ket.textContent = dien(t.ket_mo, { a: A.so, b: B.so }) + " " + t.ket; ket.hidden = false;
        }
      }, giam ? 10 : 100);
    };
    lai.onclick = function () { lai.hidden = true; bd.disabled = false; bd.onclick(); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: nhân chứng (xem đoạn phim va chạm, trả lời câu hỏi có động từ ngẫu nhiên) ----------
  // g.dong_tu: [số dặm/giờ trung bình]; t.dong_tu: [chữ]; câu hỏi kính vỡ một tuần sau, kết quả ghi trong t.ket_kinh
  function nhanChung(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 260", role: "img", "aria-label": t.mo_ta });
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true); hang.appendChild(xem);
    var hoi = tao("div", "tc-doan"); hoi.hidden = true;
    var k = Math.floor(Math.random() * g.dong_tu.length), idT = g.id + "-toc";
    var nh = tao("label", "", dien(t.hoi_toc, { dt: t.dong_tu[k] }) + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 10; th.max = 70; th.step = 1; th.value = 30; th.id = idT;
    var h2 = tao("div", "tc-hang"), chot = nut(t.nut_chot, true); h2.appendChild(chot); hoi.appendChild(nh); hoi.appendChild(th); hoi.appendChild(h2);
    var hoi2 = tao("div", "tc-doan"); hoi2.hidden = true; hoi2.appendChild(tao("p", "tc-hoi", t.hoi_kinh)); var h3 = tao("div", "tc-hang"), co = nut(t.co, false), khong = nut(t.khong, false); h3.appendChild(co); h3.appendChild(khong); hoi2.appendChild(h3);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    th.oninput = function () { nv.textContent = th.value + " " + t.dv + " (≈ " + Math.round(th.value * 1.609) + " km/h)"; }; th.oninput();
    svg(c, "rect", { x: 0, y: 150, width: 600, height: 110, class: "tc-f-dat" });
    svg(c, "rect", { x: 0, y: 176, width: 600, height: 56, style: "fill:#475569" }); for (var x = 10; x < 600; x += 50) svg(c, "rect", { x: x, y: 202, width: 26, height: 4, style: "fill:#f8fafc" });
    function xe(mauX) { var e = svg(c, "g", {}); svg(e, "rect", { x: -40, y: -16, width: 80, height: 26, rx: 8, style: "fill:" + mauX }); svg(e, "rect", { x: -24, y: -30, width: 44, height: 18, rx: 6, style: "fill:" + mauX }); svg(e, "rect", { x: -18, y: -27, width: 32, height: 12, rx: 3, style: "fill:#bae6fd" }); svg(e, "circle", { cx: -22, cy: 12, r: 8, class: "tc-f-muc" }); svg(e, "circle", { cx: 22, cy: 12, r: 8, class: "tc-f-muc" }); return e; }
    var a = xe("#dc2626"), b = xe("#2563eb"), sao = svg(c, "g", { opacity: "0" });
    for (var i = 0; i < 8; i++) { var gc = i * Math.PI / 4; svg(sao, "line", { x1: 300 + Math.cos(gc) * 14, y1: 190 + Math.sin(gc) * 14, x2: 300 + Math.cos(gc) * 34, y2: 190 + Math.sin(gc) * 34, style: "stroke:#f59e0b;stroke-width:4;stroke-linecap:round" }); }
    function datXe(xa, xb, r) { a.setAttribute("transform", "translate(" + xa + ",196) rotate(" + r + ")"); b.setAttribute("transform", "translate(" + xb + ",196) rotate(" + (-r) + ") scale(-1,1)"); }
    datXe(60, 540, 0);
    var bieu = svg(c, "g", { opacity: "0" });
    xem.onclick = function () {
      xem.disabled = true; bieu.setAttribute("opacity", "0"); sao.setAttribute("opacity", "0"); var t0 = null, T = giam ? 1 : 2400;
      (function buoc(ts) {
        if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T), va = Math.min(1, f / 0.6);
        var xa = 60 + va * 200, xb = 540 - va * 200, r = f > 0.6 ? Math.min(12, (f - 0.6) * 40) : 0;
        if (f > 0.6) { xa = 260 - (f - 0.6) * 60; xb = 340 + (f - 0.6) * 60; sao.setAttribute("opacity", f < 0.8 ? "1" : "0"); }
        datXe(xa, xb, r);
        if (f < 1) requestAnimationFrame(buoc); else { hoi.hidden = false; xem.textContent = t.nut_xem_lai; xem.disabled = false; }
      })(performance.now());
    };
    chot.onclick = function () { chot.disabled = th.disabled = true; hoi2.hidden = false; };
    function tra(coThay) {
      co.disabled = khong.disabled = true;
      var max = 45; bieu.innerHTML = ""; c.appendChild(bieu); bieu.setAttribute("opacity", "1");
      svg(bieu, "rect", { x: 20, y: 10, width: 560, height: 132, rx: 10, class: "tc-f-giay tc-net-vien", style: "opacity:.95" });
      g.dong_tu.forEach(function (v, i) {
        var y = 22 + i * 22, w = 300 * v / max;
        svg(bieu, "text", { x: 150, y: y + 12, "text-anchor": "end", class: "tc-t-nho" }, t.dong_tu[i]);
        svg(bieu, "rect", { x: 160, y: y, width: w, height: 16, rx: 3, class: i === k ? "tc-f-cam" : "tc-cot-xam" });
        svg(bieu, "text", { x: 166 + w, y: y + 12, class: "tc-t-nho" }, so(v, 1));
      });
      ket.innerHTML = ""; ket.appendChild(tao("p", "", dien(t.ket_toc, { dt: t.dong_tu[k], b: th.value, v: so(g.dong_tu[k], 1) })));
      ket.appendChild(tao("p", "", (coThay ? t.da_thay : t.khong_thay) + " " + t.ket_kinh)); ket.appendChild(tao("p", "", t.ket)); ket.hidden = false;
    }
    co.onclick = function () { tra(true); }; khong.onclick = function () { tra(false); };
    s.appendChild(san); s.appendChild(hang); s.appendChild(hoi); s.appendChild(hoi2); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: chấm khi bị dặn trước (xem bé chơi, chấm mức hiếu động; lời dặn bốc ngẫu nhiên) ----------
  // t.loi: [lời dặn "có đường", lời dặn "giả dược"]
  function chamMu(g, t) {
    var s = khung(g, t), san = canh("tc-canh-am"), c = svg(san, "svg", { viewBox: "0 0 600 260", role: "img", "aria-label": t.mo_ta });
    var dan = tao("p", "tc-dap", ""), hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true); hang.appendChild(xem);
    var cham = tao("div", "tc-doan"); cham.hidden = true;
    var idT = g.id + "-cham", nh = tao("label", "", t.hoi_cham + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 1; th.max = 10; th.step = 1; th.value = 5; th.id = idT;
    var h2 = tao("div", "tc-hang"), chot = nut(t.nut_chot, true), doi = nut(t.nut_doi, false); doi.hidden = true; h2.appendChild(chot); h2.appendChild(doi);
    cham.appendChild(nh); cham.appendChild(th); cham.appendChild(h2);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    th.oninput = function () { nv.textContent = th.value + "/10"; }; th.oninput();
    svg(c, "rect", { x: 0, y: 200, width: 600, height: 60, class: "tc-f-go" });
    svg(c, "rect", { x: 60, y: 60, width: 110, height: 80, rx: 6, class: "tc-f-giay tc-net-vien" }); svg(c, "rect", { x: 420, y: 150, width: 120, height: 50, rx: 8, style: "fill:#7c3aed;opacity:.7" });
    var bong = svg(c, "circle", { cx: 0, cy: 0, r: 12, style: "fill:#ef4444" });
    var be = svg(c, "g", {}); svg(be, "circle", { cx: 0, cy: -44, r: 14, style: "fill:#fcd34d" }); svg(be, "rect", { x: -12, y: -30, width: 24, height: 30, rx: 8, style: "fill:#22c55e" });
    var chanT = svg(be, "line", { x1: -5, y1: 0, x2: -8, y2: 22, class: "tc-net-be" }), chanP = svg(be, "line", { x1: 5, y1: 0, x2: 8, y2: 22, class: "tc-net-be" });
    var tay = svg(be, "path", { d: "M-12 -24 L-24 -10 M12 -24 L24 -10", class: "tc-net-be" });
    var coc = svg(c, "g", {}); svg(coc, "path", { d: "M250 176 L256 200 L274 200 L280 176 Z", style: "fill:#bfdbfe;stroke:#60a5fa" }); svg(coc, "text", { x: 265, y: 168, "text-anchor": "middle", class: "tc-t-nho" }, t.coc);
    // cùng một đoạn chơi cho mọi người: chạy, nhảy, ném bóng, ngồi
    function datBe(f) {
      var x = 120 + 360 * (0.5 - 0.5 * Math.cos(f * Math.PI * 4)), y = 200 - Math.abs(Math.sin(f * Math.PI * 10)) * (f > 0.4 && f < 0.6 ? 30 : 8);
      be.setAttribute("transform", "translate(" + x + "," + (y - 22) + ")");
      var buoc = Math.sin(f * 120); chanT.setAttribute("x2", -8 + buoc * 6); chanP.setAttribute("x2", 8 - buoc * 6);
      tay.setAttribute("d", f > 0.6 && f < 0.75 ? "M-12 -24 L-22 -46 M12 -24 L22 -46" : "M-12 -24 L-24 -10 M12 -24 L24 -10");
      var bf = Math.max(0, Math.min(1, (f - 0.7) / 0.2)); bong.setAttribute("cx", 100 + bf * 400); bong.setAttribute("cy", 188 - Math.sin(bf * Math.PI) * 120);
    }
    datBe(0);
    var nhom = Math.random() < 0.5 ? 0 : 1, lan = 0, diem = [];
    function dien_dan() { dan.textContent = t.loi[nhom]; }
    dien_dan();
    xem.onclick = function () {
      xem.disabled = true; cham.hidden = true; var t0 = null, T = giam ? 1 : 7000;
      (function buoc(ts) { if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T); datBe(f); if (f < 1) requestAnimationFrame(buoc); else { cham.hidden = false; chot.disabled = th.disabled = false; } })(performance.now());
    };
    chot.onclick = function () {
      chot.disabled = th.disabled = true; diem[nhom] = +th.value; lan++;
      if (lan === 1) { ket.textContent = t.lat_bai + " " + t.ket_1; doi.hidden = false; }
      else { ket.textContent = dien(t.ket_2, { a: diem[0], b: diem[1] }) + " " + t.ket_1; doi.hidden = true; }
      ket.hidden = false;
    };
    doi.onclick = function () { nhom = 1 - nhom; dien_dan(); doi.hidden = true; ket.hidden = true; th.value = 5; th.oninput(); xem.disabled = false; xem.textContent = t.nut_xem_lai; cham.hidden = true; datBe(0); };
    s.appendChild(dan); s.appendChild(san); s.appendChild(hang); s.appendChild(cham); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: sau tấm rèm (kéo ống máu vào máy, rồi kéo rèm xem mẫu thật đi đâu) ----------
  // g.ong: số ống; g.vao_may: số ống thật sự chạy trên máy riêng (phần còn lại sang máy hãng khác)
  function hauTruong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), rem = nut(t.nut_rem, true), lai = nut(t.nut_lai, false); rem.disabled = true; lai.hidden = true; hang.appendChild(rem); hang.appendChild(lai);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 250, width: 600, height: 50, class: "tc-f-go" });
    svg(c, "text", { x: 16, y: 22, class: "tc-t-nho" }, t.khay);
    // máy riêng ở giữa sân khấu
    var may = svg(c, "g", {}); svg(may, "rect", { x: 200, y: 120, width: 130, height: 130, rx: 16, style: "fill:#f8fafc;stroke:#cbd5e1;stroke-width:2" });
    svg(may, "rect", { x: 222, y: 140, width: 86, height: 34, rx: 6, style: "fill:#0f172a" }); var manMay = svg(may, "text", { x: 265, y: 162, "text-anchor": "middle", style: "fill:#4ade80;font:700 12px ui-monospace,monospace" }, "READY");
    svg(may, "rect", { x: 248, y: 196, width: 34, height: 10, rx: 5, style: "fill:#cbd5e1" }); svg(may, "text", { x: 265, y: 236, "text-anchor": "middle", class: "tc-t-nho" }, t.ten_may);
    // hậu trường: máy hãng khác, che bởi rèm
    var sau = svg(c, "g", {});
    svg(sau, "path", { d: "M330 200 C360 200 370 170 400 170", style: "fill:none;stroke:#94a3b8;stroke-width:6;stroke-dasharray:2 6" });
    [0, 1, 2].forEach(function (i) { svg(sau, "rect", { x: 400 + i * 62, y: 130 + (i % 2) * 20, width: 56, height: 100, rx: 6, style: "fill:#64748b" }); svg(sau, "rect", { x: 408 + i * 62, y: 142 + (i % 2) * 20, width: 40, height: 16, rx: 3, style: "fill:#1e293b" }); });
    svg(sau, "text", { x: 493, y: 274, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:11px" }, t.may_khac);
    var trongSau = svg(sau, "g", {});
    var mRem = svg(c, "g", {}); var vai = svg(mRem, "rect", { x: 380, y: 30, width: 220, height: 220, class: "tc-rem" });
    for (var k = 0; k < 8; k++) svg(mRem, "line", { x1: 392 + k * 27, x2: 392 + k * 27, y1: 30, y2: 250, style: "stroke:rgba(0,0,0,.18);stroke-width:3" });
    svg(mRem, "text", { x: 490, y: 140, "text-anchor": "middle", class: "tc-t-trang" }, t.rem);
    var dem = 0, ong = [];
    for (var i = 0; i < g.ong; i++) {
      var e = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": dien(t.ong, { n: i + 1 }), "data-i": i });
      svg(e, "rect", { x: -9, y: -26, width: 18, height: 52, rx: 8, style: "fill:#fef2f2;stroke:#94a3b8" }); svg(e, "rect", { x: -9, y: 0, width: 18, height: 26, rx: 8, style: "fill:#dc2626" }); svg(e, "rect", { x: -10, y: -32, width: 20, height: 9, rx: 3, style: "fill:#7c3aed" });
      var o = { e: e, nha: { x: 30 + (i % 5) * 32, y: 70 + Math.floor(i / 5) * 76 }, xong: false }; ong.push(o); datO(o, o.nha);
    }
    function datO(o, p, muot) { o.e.style.transition = muot && !giam ? "transform .3s" : ""; o.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); o.p = p; }
    function vaoMay(o) {
      o.xong = true; datO(o, { x: 265, y: 200 }, true); setTimeout(function () { o.e.setAttribute("opacity", "0"); }, giam ? 0 : 320);
      dem++; manMay.textContent = "✓ " + dem; cap.textContent = dien(t.da_chay, { n: dem }); if (dem >= 3) rem.disabled = false;
    }
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { var o = ong[+e.getAttribute("data-i")]; if (o.xong) return false; if (b === "bat") { c.appendChild(e); o.lech = null; return; } if (!o.lech) o.lech = { x: dau.x - o.p.x, y: dau.y - o.p.y }; datO(o, { x: p.x - o.lech.x, y: p.y - o.lech.y }); },
      function (e, p) { var o = ong[+e.getAttribute("data-i")]; if (!p) { vaoMay(o); return; } if (o.p.x > 190 && o.p.x < 340 && o.p.y > 90) vaoMay(o); else datO(o, o.nha, true); });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-keo"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var o = ong[+e.getAttribute("data-i")]; if (!o.xong) vaoMay(o); });
    rem.onclick = function () {
      rem.disabled = true; mRem.style.transition = giam ? "" : "transform 1.2s ease-in-out"; mRem.style.transform = "translateY(-260px)";
      var vao = Math.min(dem, g.vao_may), qua = dem - vao;
      for (var j = 0; j < qua; j++) { var x = svg(trongSau, "g", {}); svg(x, "rect", { x: -7, y: -18, width: 14, height: 36, rx: 6, style: "fill:#dc2626" }); x.setAttribute("transform", "translate(" + (416 + (j % 6) * 26) + "," + (100 - Math.floor(j / 6) * 40) + ")"); }
      manMay.textContent = "✓ " + vao;
      ket.innerHTML = ""; ket.appendChild(tao("p", "", dien(t.lo_ra, { n: dem, m: vao, k: qua })));
      var bang = tao("ul"); t.so_sanh.forEach(function (x) { var li = tao("li", ""); li.appendChild(tao("b", "", x[0] + " ")); li.appendChild(document.createTextNode("→ " + x[1])); bang.appendChild(li); }); ket.appendChild(bang);
      ket.appendChild(tao("p", "", t.ket)); ket.hidden = false; lai.hidden = false;
    };
    lai.onclick = function () { dem = 0; manMay.textContent = "READY"; trongSau.innerHTML = ""; mRem.style.transform = ""; ket.hidden = true; lai.hidden = true; rem.disabled = true; cap.textContent = t.doc_mac; ong.forEach(function (o) { o.xong = false; o.e.setAttribute("opacity", "1"); datO(o, o.nha); }); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tổng đài (thử mù hai cốc, rồi ngày chạy, điện thoại reo; kéo lon cũ về kệ khi bạn thấy cần) ----------
  // g.ngay_that: số ngày thật; g.goi: [[ngày, cuộc/ngày]] mốc có nguồn (đường giữa các mốc là minh họa); g.so_may: số điện thoại vẽ
  function tongDai(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.buoc_1); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); bd.hidden = true; lai.hidden = true; hang.appendChild(bd); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    // hai cốc thử mù
    var coc = [0, 1].map(function (k) {
      var e = svg(c, "g", { class: "tc-cham-duoc", tabindex: "0", role: "button", "aria-label": t.coc[k] });
      svg(e, "path", { d: "M-26 -40 L-20 30 L20 30 L26 -40 Z", style: "fill:#7c2d12;stroke:#e5e7eb;stroke-width:3" }); svg(e, "rect", { x: -26, y: -46, width: 52, height: 8, rx: 3, style: "fill:#e5e7eb" });
      svg(e, "text", { x: 0, y: 56, "text-anchor": "middle", class: "tc-t-dam" }, t.coc[k]);
      e.setAttribute("transform", "translate(" + (220 + k * 160) + ",140)");
      e.addEventListener("click", function () { chonCoc(k); }); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chonCoc(k); } });
      return e;
    });
    // cảnh tổng đài
    var dai = svg(c, "g", { opacity: "0", style: "pointer-events:none" });
    svg(dai, "rect", { x: 20, y: 30, width: 150, height: 220, rx: 8, class: "tc-f-giay tc-net-vien" }); svg(dai, "text", { x: 95, y: 22, "text-anchor": "middle", class: "tc-t-nho" }, t.ke);
    svg(dai, "line", { x1: 30, x2: 160, y1: 140, y2: 140, class: "tc-net-vien" }); svg(dai, "line", { x1: 30, x2: 160, y1: 240, y2: 240, class: "tc-net-vien" });
    function lon(mauL, chu) { var e = svg(c, "g", {}); svg(e, "rect", { x: -18, y: -50, width: 36, height: 50, rx: 6, style: "fill:" + mauL }); svg(e, "text", { x: 0, y: -22, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:9px" }, chu); return e; }
    var moi = lon("#b91c1c", t.lon_moi); moi.setAttribute("opacity", "0"); moi.setAttribute("transform", "translate(70,238)");
    var cu = lon("#7f1d1d", t.lon_cu); cu.classList.add("tc-keo"); cu.setAttribute("tabindex", "0"); cu.setAttribute("role", "button"); cu.setAttribute("aria-label", t.lon_cu); cu.setAttribute("opacity", "0");
    var CU0 = { x: 120, y: 138 }, KHO = { x: 300, y: 290 };
    function datCu(p, muot) { cu.style.transition = muot && !giam ? "transform .5s" : ""; cu.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); cu.p = p; }
    datCu(CU0);
    var dt = []; for (var i = 0; i < g.so_may; i++) { var e = svg(dai, "g", {}); var x = 220 + (i % 6) * 60, y = 60 + Math.floor(i / 6) * 70; svg(e, "rect", { x: x - 22, y: y - 14, width: 44, height: 30, rx: 8, class: "tc-dien-thoai" }); svg(e, "path", { d: "M" + (x - 18) + " " + (y - 14) + " q18 -16 36 0", style: "fill:none;stroke:var(--ink);stroke-width:5;stroke-linecap:round" }); dt.push(e); }
    var lich = svg(dai, "text", { x: 400, y: 248, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:16px" }, ""); var muc = svg(dai, "text", { x: 400, y: 272, "text-anchor": "middle", class: "tc-t-nho" }, "");
    var hen = null, ngay = 0, xong = false;
    function goiNgay(d) { var a = g.goi[0], b = g.goi[g.goi.length - 1]; for (var k = 0; k < g.goi.length - 1; k++) if (d >= g.goi[k][0] && d <= g.goi[k + 1][0]) { a = g.goi[k]; b = g.goi[k + 1]; } if (d >= b[0]) return b[1]; return a[1] + (b[1] - a[1]) * (d - a[0]) / Math.max(1, b[0] - a[0]); }
    function chonCoc(k) {
      if (dai.getAttribute("opacity") === "1") return;
      coc[k].classList.add("tc-coc-chon"); cap.textContent = t.sau_thu; bd.hidden = false;
    }
    function het(d, tuDung) {
      clearInterval(hen); xong = true; dt.forEach(function (e) { e.classList.remove("tc-reo"); }); lai.hidden = false;
      ket.textContent = (tuDung ? dien(t.ban_dung, { d: d, n: g.ngay_that }) : dien(t.khong_dung, { n: g.ngay_that })) + " " + t.ket; ket.hidden = false;
    }
    bd.onclick = function () {
      bd.hidden = true; coc.forEach(function (e) { e.setAttribute("opacity", "0"); e.style.pointerEvents = "none"; }); dai.setAttribute("opacity", "1"); dai.style.pointerEvents = ""; moi.setAttribute("opacity", "1"); cu.setAttribute("opacity", "1");
      datCu(KHO, true); cap.textContent = t.buoc_2; ngay = 0; xong = false;
      hen = setInterval(function () {
        ngay++; var n = goiNgay(ngay), max = g.goi[g.goi.length - 1][1];
        lich.textContent = dien(t.ngay, { d: ngay }); muc.textContent = dien(t.goi_ngay, { n: String(Math.round(n / 10) * 10).replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : ".") });
        dt.forEach(function (e, k) { e.classList.toggle("tc-reo", Math.random() < n / max * 0.8 && k < g.so_may * n / max + 1); });
        if (ngay >= g.ngay_that + 30) het(ngay, false);
      }, giam ? 20 : 110);
    };
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { if (xong || !hen) return false; if (b === "bat") { cu.lech = null; return; } if (!cu.lech) cu.lech = { x: dau.x - cu.p.x, y: dau.y - cu.p.y }; datCu({ x: p.x - cu.lech.x, y: p.y - cu.lech.y }); },
      function (e, p) { if (!p || (cu.p.x < 180 && cu.p.y < 250)) { datCu(CU0, true); het(ngay, true); } else datCu(KHO, true); });
    c.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest && ev.target.closest("g.tc-keo") && hen && !xong) { ev.preventDefault(); datCu(CU0, true); het(ngay, true); } });
    lai.onclick = function () { lai.hidden = true; ket.hidden = true; datCu(KHO); bd.onclick(); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: phễu (đoán bao nhiêu % đi hết phễu, rồi thả hạt chạy qua) ----------
  // g.dau, g.cuoi: số người đầu và cuối; g.ngay: độ dài giai đoạn; g.so_sanh: [%] mốc so sánh; t.so_sanh: [nhãn]
  function pheu(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 320", role: "img", "aria-label": t.mo_ta });
    var idT = g.id + "-doan", nh = tao("label", "tc-o-nhap", t.hoi_doan + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = 100; th.step = 1; th.value = 40; th.id = idT; nh.appendChild(th);
    var hang = tao("div", "tc-hang"), chay = nut(t.nut_chay, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(chay); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    th.oninput = function () { nv.textContent = th.value + "%"; }; th.oninput();
    svg(c, "path", { d: "M120 40 L480 40 L340 220 L340 290 L260 290 L260 220 Z", class: "tc-pheu" });
    svg(c, "text", { x: 300, y: 30, "text-anchor": "middle", class: "tc-t-dam" }, dien(t.tren, { n: so(g.dau, 0) }));
    svg(c, "text", { x: 300, y: 312, "text-anchor": "middle", class: "tc-t-dam" }, t.duoi);
    var lich = svg(c, "text", { x: 520, y: 140, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:18px" }, ""), chu = svg(c, "text", { x: 520, y: 160, "text-anchor": "middle", class: "tc-t-nho" }, t.don_vi_ngay);
    var hat = svg(c, "g", {});
    chay.onclick = function () {
      chay.disabled = th.disabled = true; hat.innerHTML = ""; var N = 100, qua = Math.round(N * g.cuoi / g.dau), ds = [];
      for (var i = 0; i < N; i++) ds.push({ e: svg(hat, "circle", { r: 5, class: "tc-hat-y" }), x: 140 + Math.random() * 320, y: 44 + Math.random() * 30, o: i < qua, ra: 0 });
      ds = tron(ds); var t0 = null, T = giam ? 1 : 5000;
      (function buoc(ts) {
        if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T); lich.textContent = Math.round(f * g.ngay);
        ds.forEach(function (d, i) {
          var fd = Math.max(0, Math.min(1, f * 1.4 - i / ds.length * 0.4));
          if (d.o) { var y = 50 + fd * 236, w = y < 220 ? 180 - (y - 40) * 140 / 180 : 40; d.e.setAttribute("cx", 300 + (d.x - 300) * w / 180); d.e.setAttribute("cy", y); }
          else { var yy = 50 + Math.min(fd, 0.55) * 236, ra = Math.max(0, fd - 0.55) / 0.45; d.e.setAttribute("cx", 300 + (d.x - 300) * (1 - (yy - 40) / 260) + (d.x > 300 ? 1 : -1) * ra * 220); d.e.setAttribute("cy", yy + ra * 30); if (ra > 0) d.e.setAttribute("class", "tc-hat-quen"); }
        });
        if (f < 1) requestAnimationFrame(buoc);
        else {
          var pt = 100 * g.cuoi / g.dau; ket.textContent = dien(t.ket_doan, { b: th.value, p: so(pt, 0) }) + " " + t.ket; ket.hidden = false; lai.hidden = false;
          g.so_sanh.forEach(function (v, k) { svg(hat, "text", { x: 300, y: 270 - k * 16, "text-anchor": "middle", class: "tc-t-nho" }, t.so_sanh[k]); });
        }
      })(performance.now());
    };
    lai.onclick = function () { chay.disabled = th.disabled = false; lai.hidden = true; ket.hidden = true; hat.innerHTML = ""; lich.textContent = ""; };
    s.appendChild(san); s.appendChild(nh); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: két và màn hình (nạp tiền, xem tiền thật đi đâu, rồi mọi người cùng rút) ----------
  // g.khach: số khách; g.vao_ket: số khoản nạp thật sự nằm trong két (còn lại sang quỹ anh em); t.khach: [tên]
  function ketSat(g, t) {
    var s = khung(g, t), san = canh(), c = svg(san, "svg", { viewBox: "0 0 600 330", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), soi = nut(t.nut_soi, false), rut = nut(t.nut_rut, true), lai = nut(t.nut_lai, false); soi.disabled = rut.disabled = true; lai.hidden = true;
    hang.appendChild(soi); hang.appendChild(rut); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = g.khach, KH = [];
    // màn hình số dư
    svg(c, "rect", { x: 220, y: 14, width: 160, height: 150, rx: 14, style: "fill:#0f172a" }); svg(c, "text", { x: 300, y: 36, "text-anchor": "middle", style: "fill:#94a3b8;font:600 11px ui-monospace,monospace" }, t.man_hinh);
    var soDu = []; for (var i = 0; i < n; i++) soDu.push(svg(c, "text", { x: 236, y: 58 + i * 20, style: "fill:#4ade80;font:600 12px ui-monospace,monospace" }, ""));
    // két sàn và tài khoản quỹ anh em
    svg(c, "rect", { x: 220, y: 190, width: 160, height: 110, rx: 10, class: "tc-f-thep" }); svg(c, "circle", { cx: 300, cy: 245, r: 22, style: "fill:none;stroke:#e2e8f0;stroke-width:4" }); svg(c, "text", { x: 300, y: 318, "text-anchor": "middle", class: "tc-t-dam" }, t.ket_san);
    var trongKet = svg(c, "g", {});
    var quy = svg(c, "g", { opacity: "0.15" }); svg(quy, "rect", { x: 440, y: 190, width: 140, height: 110, rx: 10, style: "fill:#7c3aed" }); svg(quy, "text", { x: 510, y: 214, "text-anchor": "middle", class: "tc-t-trang" }, t.quy); svg(quy, "path", { d: "M380 230 C410 230 410 230 440 230", style: "stroke:#7c3aed;stroke-width:6;fill:none" });
    var trongQuy = svg(c, "g", {});
    for (i = 0; i < n; i++) {
      var y = 40 + i * 56, e = svg(c, "g", {}); svg(e, "circle", { cx: 40, cy: y, r: 14, class: "tc-f-muc" }); svg(e, "text", { x: 62, y: y + 4, class: "tc-t-nho" }, t.khach[i]);
      var xu = svg(c, "g", { class: "tc-keo", tabindex: "0", role: "button", "aria-label": dien(t.nap, { k: t.khach[i] }), "data-i": i }); svg(xu, "circle", { cx: 0, cy: 0, r: 13, class: "tc-xu" }); svg(xu, "text", { x: 0, y: 4, "text-anchor": "middle", style: "font:800 11px system-ui;fill:#78350f" }, "$");
      var k = { e: e, xu: xu, nha: { x: 150, y: y }, nap: false, y: y, x: null }; KH.push(k); xu.setAttribute("transform", "translate(150," + y + ")"); xu.p = k.nha;
    }
    var daNap = 0, daSoi = false;
    function chay(el, a, b, xong) { var t0 = null, T = giam ? 1 : 700; (function bu(ts) { if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T); el.setAttribute("transform", "translate(" + (a.x + (b.x - a.x) * f) + "," + (a.y + (b.y - a.y) * f - Math.sin(f * Math.PI) * 40) + ")"); if (f < 1) requestAnimationFrame(bu); else if (xong) xong(); })(performance.now()); }
    function nap(k) {
      if (k.nap) return; k.nap = true; daNap++;
      var thuc = daNap > g.vao_ket; // phần lớn tiền đi thẳng sang quỹ
      k.vao = thuc ? "quy" : "ket"; var dich = thuc ? { x: 470 + (daNap % 3) * 30, y: 270 - Math.floor(daNap / 3) * 22 } : { x: 270 + daNap * 20, y: 280 };
      chay(k.xu, k.xu.p, { x: 300, y: 200 }, function () { chay(k.xu, { x: 300, y: 200 }, dich); k.xu.p = dich; });
      soDu[KH.indexOf(k)].textContent = t.khach[KH.indexOf(k)] + ": " + t.so_du;
      cap.textContent = dien(t.da_nap, { n: daNap }); if (daNap === n) { soi.disabled = false; rut.disabled = false; }
    }
    keoSvg(c, "g.tc-keo", function (e, p, b, dau) { var k = KH[+e.getAttribute("data-i")]; if (k.nap) return false; if (b === "bat") { k.lech = null; return; } if (!k.lech) k.lech = { x: dau.x - k.xu.p.x, y: dau.y - k.xu.p.y }; k.xu.p = { x: p.x - k.lech.x, y: p.y - k.lech.y }; k.xu.setAttribute("transform", "translate(" + k.xu.p.x + "," + k.xu.p.y + ")"); },
      function (e, p) { var k = KH[+e.getAttribute("data-i")]; if (!p || k.xu.p.x > 200) nap(k); else { k.xu.p = k.nha; k.xu.setAttribute("transform", "translate(" + k.nha.x + "," + k.nha.y + ")"); } });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-keo"); if (e && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); nap(KH[+e.getAttribute("data-i")]); } });
    soi.onclick = function () { daSoi = true; quy.style.transition = giam ? "" : "opacity .6s"; quy.setAttribute("opacity", "1"); cap.textContent = t.soi; };
    rut.onclick = function () {
      rut.disabled = soi.disabled = true; if (!daSoi) soi.onclick(); var tra = 0;
      KH.forEach(function (k, i) {
        setTimeout(function () {
          if (k.vao === "ket") { tra++; chay(k.xu, k.xu.p || { x: 300, y: 280 }, { x: 150, y: k.y }); soDu[i].style.fill = "#4ade80"; soDu[i].textContent = t.khach[i] + ": " + t.da_rut; }
          else { soDu[i].style.fill = "#f87171"; soDu[i].textContent = t.khach[i] + ": " + t.khong_rut; svg(c, "text", { x: 180, y: k.y + 5, class: "tc-t-dam", style: "fill:var(--tc-sai);font-size:18px" }, "✗"); }
          if (i === n - 1) { ket.textContent = dien(t.ket_rut, { a: tra, n: n }) + " " + t.ket; ket.hidden = false; lai.hidden = false; }
        }, giam ? 0 : i * 500);
      });
    };
    lai.onclick = function () { var moi = ketSat(g, t); s.parentNode.replaceChild(moi, s); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: nhập vai nhiều cảnh (dòng thời gian chạy, hồ sơ lật theo từng mốc) ----------
  // t.canh: [{moc, biet, hoi, chon: [{nhan, dap}], that, chuyen_that}]; t.nut_tiep, t.nut_lai, t.ket ({d}/{n}), t.biet_nhan, t.that_nhan
  function nhapVai(g, t) {
    var s = khung(g, t), n = t.canh.length, san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 70", role: "img", "aria-label": t.mo_ta || t.nhan });
    svg(c, "line", { x1: 30, x2: 570, y1: 34, y2: 34, class: "tc-thuoc" });
    var cham = t.canh.map(function (k, i) { var x = n === 1 ? 300 : 30 + i * 540 / (n - 1); var e = svg(c, "circle", { cx: x, cy: 34, r: 8, class: "tc-moc-cham" }); svg(c, "text", { x: x, y: 60, "text-anchor": "middle", class: "tc-t-nho" }, k.moc); return { e: e, x: x }; });
    var kim = svg(c, "path", { d: "M-8 0 L8 0 L0 12 Z", class: "tc-f-cam" });
    var the = tao("div", "tc-ho-so"), mat = tao("div", "tc-ho-so-mat"); the.appendChild(mat);
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_tiep, true); tiep.hidden = true; hang.appendChild(tiep);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var i = 0, d = 0;
    function dung(k) { var x = cham[k].x; kim.style.transition = giam ? "" : "transform .6s"; kim.setAttribute("transform", "translate(" + x + ",12)"); }
    function ve() {
      var k = t.canh[i]; mat.innerHTML = ""; the.classList.remove("tc-lat"); void the.offsetWidth; if (!giam) the.classList.add("tc-lat");
      dung(i); cham.forEach(function (x, j) { x.e.classList.toggle("tc-moc-qua", j < i); x.e.classList.toggle("tc-moc-nay", j === i); });
      mat.appendChild(tao("span", "tc-muc", k.moc));
      var b = tao("p", "tc-biet"); b.appendChild(tao("b", "", t.biet_nhan + " ")); b.appendChild(document.createTextNode(k.biet)); mat.appendChild(b);
      mat.appendChild(tao("p", "tc-hoi", k.hoi));
      var h = tao("div", "tc-hang"), nuts = k.chon.map(function (o, j) { var x = nut(o.nhan, false); x.onclick = function () { chon(j, nuts); }; h.appendChild(x); return x; }); mat.appendChild(h);
      tiep.hidden = true;
    }
    function chon(j, nuts) {
      var k = t.canh[i]; nuts.forEach(function (x, m) { x.disabled = true; if (m === j) x.classList.add("tc-da-chon"); if (m === k.that) x.classList.add("tc-nguoi-that"); });
      if (j === k.that) d++;
      mat.appendChild(tao("p", "tc-dap", k.chon[j].dap));
      var p = tao("p", "tc-dap tc-chuyen-that"); p.appendChild(tao("b", "", t.that_nhan + " ")); p.appendChild(document.createTextNode(k.chuyen_that)); mat.appendChild(p);
      if (i < n - 1) { tiep.textContent = t.nut_tiep; tiep.hidden = false; }
      else { ket.textContent = dien(t.ket, { d: d, n: n }); ket.hidden = false; tiep.textContent = t.nut_lai; tiep.hidden = false; cham[i].e.classList.add("tc-moc-qua"); }
    }
    tiep.onclick = function () { if (i < n - 1 && ket.hidden) { i++; ve(); } else { i = 0; d = 0; ket.hidden = true; ve(); } };
    ve();
    s.appendChild(san); s.appendChild(the); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ==== ĐỢT 1 A BẮT ĐẦU ====
  // ---------- Cảnh: gậy và bóng (Nhanh đáp liền; kéo giá bóng trên thước, Chậm soi hai điều kiện trên cái cân) ----------
  // g.tong, g.hon: tổng và phần chênh của câu đố (xu); g.nhanh: câu trả lời trực giác (xu); g.max: đầu thước (xu)
  // t: de, nhanh, cham, gay, bong, gia ("{v} $"), xu ("{v} xu"), dk_tong {v}, dk_hon {v}, nut_hoi, nut_lai, doc_mac, keo,
  //    nhanh_noi, nhanh_xong, cham_thu, cham_sai {v}, cham_dung, ket
  function gayBong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), hoi = nut(t.nut_hoi, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(hoi); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var TONG = g.tong, HON = g.hon, MAX = g.max, X0 = 130, X1 = 470, b = 0, mo = false, khoa = false, hen = [];
    function tien(x) { return dien(t.gia, { v: so(x / 100, 2) }); }
    svg(c, "text", { x: 300, y: 30, "text-anchor": "middle", class: "tc-t-dam tc-gb-de" }, t.de);
    function den(x) { var e = svg(c, "g", { class: "tc-gb-den" }); svg(e, "circle", { cx: x, cy: 58, r: 8 }); var tx = svg(e, "text", { x: x + 14, y: 63, class: "tc-t-dam" }, ""); return { e: e, tx: tx }; }
    var d1 = den(62), d2 = den(322);
    // cái cân: đĩa trái là gậy, đĩa phải là bóng cộng quả cân 1 $
    svg(c, "path", { d: "M300 116 L284 300 L316 300 Z", class: "tc-f-thep" }); svg(c, "rect", { x: 252, y: 298, width: 96, height: 9, rx: 4, class: "tc-f-thep" });
    var L = 125, don = svg(c, "g", {});
    svg(don, "rect", { x: -L, y: -5, width: 2 * L, height: 10, rx: 5, class: "tc-f-muc" }); svg(don, "circle", { cx: 0, cy: 0, r: 8, class: "tc-f-cam" });
    var dia = [0, 1].map(function (k) {
      var d = svg(c, "g", {});
      svg(d, "line", { x1: -55, y1: 62, x2: 0, y2: 0, class: "tc-day-can" }); svg(d, "line", { x1: 55, y1: 62, x2: 0, y2: 0, class: "tc-day-can" });
      if (!k) { svg(d, "path", { d: "M-52 56 L34 46 Q48 44 50 52 Q50 60 36 60 Z", class: "tc-f-go" }); svg(d, "rect", { x: -58, y: 54, width: 14, height: 6, rx: 3, class: "tc-f-muc" }); }
      else {
        var bo = svg(d, "g", { transform: "translate(-24,46)" }); svg(bo, "circle", { r: 14, class: "tc-gb-bong" }); svg(bo, "path", { d: "M-8 -11 Q-2 0 -8 11 M8 -11 Q2 0 8 11", class: "tc-gb-chi" });
        svg(d, "rect", { x: 2, y: 30, width: 44, height: 30, rx: 5, class: "tc-qua-can" }); svg(d, "text", { x: 24, y: 50, "text-anchor": "middle", class: "tc-t-trang" }, tien(HON));
      }
      svg(d, "path", { d: "M-70 62 Q0 86 70 62 Z", class: "tc-f-giay tc-net-vien" });
      d.tag = svg(d, "text", { x: 0, y: 96, "text-anchor": "middle", class: "tc-t-dam" }, ""); return d;
    });
    // hai nhân vật và bong bóng lời
    function nguoi(x, lop, ten) {
      var e = svg(c, "g", { class: lop, transform: "translate(" + x + ",300)" });
      svg(e, "path", { d: "M-20 44 Q-20 10 0 10 Q20 10 20 44 Z", class: "tc-gb-than" }); svg(e, "circle", { cx: 0, cy: -8, r: 17, class: "tc-gb-dau" });
      svg(e, "circle", { cx: -6, cy: -10, r: 2.2, class: "tc-gb-mat" }); svg(e, "circle", { cx: 6, cy: -10, r: 2.2, class: "tc-gb-mat" });
      if (lop.indexOf("nhanh") >= 0) svg(e, "path", { d: "M2 14 L-6 28 L0 28 L-4 40 L8 24 L2 24 L6 14 Z", class: "tc-gb-set" });
      else { svg(e, "circle", { cx: -6, cy: -10, r: 6, class: "tc-gb-kinh" }); svg(e, "circle", { cx: 6, cy: -10, r: 6, class: "tc-gb-kinh" }); }
      svg(c, "text", { x: x, y: 362, "text-anchor": "middle", class: "tc-t-nho" }, ten);
      var bb = svg(c, "g", { class: "tc-gb-noi", opacity: "0", transform: "translate(" + (x < 300 ? 82 : 518) + ",252)" });
      svg(bb, "rect", { x: -76, y: -22, width: 152, height: 32, rx: 12, class: "tc-f-giay tc-gb-vien" });
      svg(bb, "path", { d: x < 300 ? "M-40 10 L-30 26 L-24 10 Z" : "M40 10 L30 26 L24 10 Z", class: "tc-f-giay tc-gb-vien" });
      var tx = svg(bb, "text", { x: 0, y: -1, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:12.5px" }, "");
      return { e: e, bb: bb, tx: tx };
    }
    var nh = nguoi(55, "tc-gb-nhanh", t.nhanh), ch = nguoi(545, "tc-gb-cham", t.cham);
    function noi(ai, chu) { ai.tx.textContent = chu; ai.bb.setAttribute("opacity", chu ? "1" : "0"); ai.bb.classList.remove("tc-gb-bat-ra"); void ai.bb.getBBox(); if (chu && !giam) ai.bb.classList.add("tc-gb-bat-ra"); }
    // thước giá bóng
    svg(c, "line", { x1: X0, x2: X1, y1: 372, y2: 372, class: "tc-thuoc" });
    for (var v = 0; v <= MAX; v += 10) { var xv = X0 + v * (X1 - X0) / MAX; svg(c, "line", { x1: xv, x2: xv, y1: 366, y2: 378, class: "tc-thuoc" }); svg(c, "text", { x: xv, y: 394, "text-anchor": "middle", class: "tc-t-nho" }, v); }
    var tay = svg(c, "g", { class: "tc-keo tc-gb-tay", tabindex: "0", role: "slider", "aria-label": t.keo, "aria-valuemin": 0, "aria-valuemax": MAX });
    svg(tay, "circle", { r: 24, style: "fill:transparent" }); svg(tay, "circle", { r: 14, class: "tc-gb-bong" }); svg(tay, "path", { d: "M-8 -11 Q-2 0 -8 11 M8 -11 Q2 0 8 11", class: "tc-gb-chi" });
    var giaTay = svg(c, "text", { x: X0, y: 346, "text-anchor": "middle", class: "tc-t-dam" }, "");
    function veB(muot) {
      var x = X0 + b * (X1 - X0) / MAX; tay.style.transition = muot && !giam ? "transform .6s ease-out" : ""; tay.setAttribute("transform", "translate(" + x + ",372)");
      tay.setAttribute("aria-valuenow", b); tay.setAttribute("aria-valuetext", dien(t.xu, { v: b }));
      giaTay.setAttribute("x", x); giaTay.textContent = mo || b ? dien(t.xu, { v: b }) : "?";
      var lech = (b + HON) - (TONG - b), goc = Math.max(-8, Math.min(8, lech * 0.5));
      if (!mo && !b) goc = 0;
      don.style.transition = giam ? "" : "transform .5s"; don.setAttribute("transform", "translate(300,116) rotate(" + goc + ")");
      dia.forEach(function (d, k) {
        var a = goc * Math.PI / 180, q = { x: 300 + (k ? L : -L) * Math.cos(a), y: 116 + (k ? L : -L) * Math.sin(a) };
        d.style.transition = giam ? "" : "transform .5s"; d.setAttribute("transform", "translate(" + q.x + "," + q.y + ")");
      });
      dia[0].tag.textContent = t.gay + " " + (mo || b ? tien(TONG - b) : "?");
      dia[1].tag.textContent = t.bong + " " + (mo || b ? tien(b) : "?");
      if (mo) {
        var dung = TONG - 2 * b === HON;
        d1.tx.textContent = dien(t.dk_tong, { v: tien(TONG) }) + " ✓"; d1.e.setAttribute("class", "tc-gb-den tc-gb-xanh");
        d2.tx.textContent = dien(t.dk_hon, { v: tien(TONG - 2 * b) }) + (dung ? " ✓" : " ✗"); d2.e.setAttribute("class", "tc-gb-den " + (dung ? "tc-gb-xanh" : "tc-gb-do"));
      } else { d1.tx.textContent = dien(t.dk_tong, { v: "?" }); d2.tx.textContent = dien(t.dk_hon, { v: "?" }); d1.e.setAttribute("class", "tc-gb-den"); d2.e.setAttribute("class", "tc-gb-den"); }
    }
    function kiem() {
      if (!mo || khoa) return;
      if (TONG - 2 * b === HON) {
        khoa = true; noi(ch, t.cham_dung); noi(nh, t.nhanh_xong); c.classList.add("tc-gb-xong");
        ket.textContent = t.ket; ket.hidden = false; lai.hidden = false; cap.textContent = t.cham_dung;
      } else noi(ch, dien(t.cham_sai, { v: tien(TONG - 2 * b) }));
    }
    function datX(x) { b = Math.max(0, Math.min(MAX, Math.round((x - X0) / (X1 - X0) * MAX))); veB(false); }
    var keo = false;
    c.addEventListener("pointerdown", function (ev) { if (!mo || khoa) return; var p = diemSvg(c, ev); if (p.y < 326) return; keo = true; c.setPointerCapture(ev.pointerId); ev.preventDefault(); datX(p.x); });
    c.addEventListener("pointermove", function (ev) { if (keo) datX(diemSvg(c, ev).x); });
    function tha() { if (!keo) return; keo = false; kiem(); }
    c.addEventListener("pointerup", tha); c.addEventListener("pointercancel", tha);
    tay.addEventListener("keydown", function (ev) {
      if (!mo || khoa) return; var k = ev.key, d = k === "ArrowRight" || k === "ArrowUp" ? 1 : k === "ArrowLeft" || k === "ArrowDown" ? -1 : 0;
      if (d) { ev.preventDefault(); b = Math.max(0, Math.min(MAX, b + d)); veB(false); kiem(); } else if (k === "Enter" || k === " ") { ev.preventDefault(); kiem(); }
    });
    function sau(ms, f) { hen.push(setTimeout(f, giam ? 0 : ms)); }
    hoi.onclick = function () {
      hoi.disabled = true; noi(nh, t.nhanh_noi);
      sau(250, function () { b = g.nhanh; veB(true); });
      sau(1000, function () { noi(ch, t.cham_thu); });
      sau(1900, function () { mo = true; veB(false); kiem(); cap.textContent = t.keo; });
    };
    lai.onclick = function () {
      hen.forEach(clearTimeout); hen = []; mo = false; khoa = false; b = 0; c.classList.remove("tc-gb-xong");
      noi(nh, ""); noi(ch, ""); ket.hidden = true; lai.hidden = true; hoi.disabled = false; cap.textContent = t.doc_mac; veB(false);
    };
    veB(false);
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: cung điện ba phòng (vòng 1 nhớ danh sách chữ; vòng 2 đặt từng món lên lộ trình trong nhà rồi đi lại) ----------
  // g.giay: số giây xem danh sách vòng 1; g.vat: 10 mã hình vẽ (trung, chuoi, sua, o, bong, khoa, dongho, coc, nen, sach)
  // t: v1[10], nhieu[10], vat[10] (tên món theo g.vat), cho[10] (tên 10 điểm), phong[3], lo[] (mẫu {vat} {cho}), nut_v1, nut_xong, nut_cham,
  //    nut_v2, nut_di, nut_lai, doc_mac, giay {s}, chon_v1, ket1 {d}, dat_vat, da_dat {n}, di_hoi {n}{cho}, dung, sai {vat}, ket {d}{d1}
  function cungDien(g, t) {
    var s = khung(g, t), N = g.vat.length;
    var o1 = tao("div", "tc-tu"); o1.hidden = true;
    var san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), b1 = nut(t.nut_v1, true), xong1 = nut(t.nut_xong, false), cham1 = nut(t.nut_cham, true), b2 = nut(t.nut_v2, true), di = nut(t.nut_di, true), lai = nut(t.nut_lai, false);
    [xong1, cham1, b2, di, lai].forEach(function (x) { x.hidden = true; }); [b1, xong1, cham1, b2, di, lai].forEach(function (x) { hang.appendChild(x); });
    var chonO = tao("div", "tc-hang tc-cd-chon"); chonO.hidden = true;
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var DIEM = [[62, 105], [62, 240], [170, 240], [170, 105], [275, 105], [275, 240], [365, 240], [455, 240], [545, 240], [500, 105]];
    // mặt bằng: ba phòng, đồ đạc, lộ trình một chiều
    [[10, 230], [230, 410], [410, 590]].forEach(function (p, k) {
      svg(c, "rect", { x: p[0], y: 34, width: p[1] - p[0], height: 256, class: "tc-cd-phong" });
      svg(c, "text", { x: (p[0] + p[1]) / 2, y: 54, "text-anchor": "middle", class: "tc-t-nho" }, t.phong[k]);
    });
    svg(c, "polyline", { points: DIEM.map(function (d) { return d.join(","); }).join(" "), class: "tc-cd-lo-trinh" });
    var cho = DIEM.map(function (d, i) {
      var e = svg(c, "g", { transform: "translate(" + d[0] + "," + d[1] + ")" });
      svg(e, "rect", { x: -32, y: -17, width: 64, height: 34, rx: 8, class: "tc-cd-do" });
      svg(e, "circle", { cx: -32, cy: -17, r: 10, class: "tc-f-cam" }); svg(e, "text", { x: -32, y: -13, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:11px" }, i + 1);
      svg(e, "text", { x: 0, y: 36, "text-anchor": "middle", class: "tc-t-nho" }, t.cho[i]);
      var vong = svg(e, "circle", { r: 22, class: "tc-cd-vong", opacity: "0" });
      return { e: e, x: d[0], y: d[1], vat: null, vong: vong };
    });
    // các món (hình vẽ đơn giản, tâm ở 0,0)
    function ve(e, ma) {
      var h = {
        trung: function () { svg(e, "ellipse", { rx: 12, ry: 16, style: "fill:#FFF7E6;stroke:#B98B4E;stroke-width:2" }); },
        chuoi: function () { svg(e, "path", { d: "M-15 -6 Q-4 20 16 -4 Q14 -14 10 -12 Q2 8 -10 -8 Z", style: "fill:#FACC15;stroke:#A16207;stroke-width:2" }); },
        sua: function () { svg(e, "path", { d: "M-11 -8 L0 -18 L11 -8 Z", style: "fill:#BFDBFE;stroke:#1D4ED8;stroke-width:2" }); svg(e, "rect", { x: -11, y: -8, width: 22, height: 24, style: "fill:#fff;stroke:#1D4ED8;stroke-width:2" }); svg(e, "rect", { x: -11, y: 0, width: 22, height: 7, style: "fill:#60A5FA" }); },
        o: function () { svg(e, "path", { d: "M-17 0 Q0 -26 17 0 Z", style: "fill:#DC2626;stroke:#7F1D1D;stroke-width:2" }); svg(e, "path", { d: "M0 0 L0 13 Q0 18 -5 16", style: "fill:none;stroke:#334155;stroke-width:2.5" }); },
        bong: function () { svg(e, "circle", { r: 15, style: "fill:#F97316;stroke:#7C2D12;stroke-width:2" }); svg(e, "path", { d: "M-15 0 H15 M0 -15 Q-8 0 0 15 M0 -15 Q8 0 0 15", style: "fill:none;stroke:#7C2D12;stroke-width:1.5" }); },
        khoa: function () { svg(e, "circle", { cx: -8, cy: 0, r: 7, style: "fill:none;stroke:#CA8A04;stroke-width:4" }); svg(e, "path", { d: "M-1 0 H16 M10 0 V6 M15 0 V5", style: "fill:none;stroke:#CA8A04;stroke-width:4" }); },
        dongho: function () { svg(e, "circle", { r: 15, style: "fill:#fff;stroke:#334155;stroke-width:3" }); svg(e, "path", { d: "M0 0 V-9 M0 0 L7 4", style: "fill:none;stroke:#334155;stroke-width:2.5;stroke-linecap:round" }); },
        coc: function () { svg(e, "path", { d: "M-11 -12 L-8 14 L8 14 L11 -12 Z", style: "fill:#60A5FA;stroke:#1E3A8A;stroke-width:2" }); svg(e, "path", { d: "M10 -6 Q19 -4 9 6", style: "fill:none;stroke:#1E3A8A;stroke-width:2.5" }); },
        nen: function () { svg(e, "rect", { x: -6, y: -6, width: 12, height: 22, rx: 2, style: "fill:#FDE68A;stroke:#B45309;stroke-width:2" }); svg(e, "path", { d: "M0 -18 Q6 -11 0 -7 Q-6 -11 0 -18 Z", style: "fill:#F97316" }); },
        sach: function () { svg(e, "rect", { x: -13, y: -15, width: 26, height: 30, rx: 3, style: "fill:#7C3AED;stroke:#4C1D95;stroke-width:2" }); svg(e, "path", { d: "M-7 -7 H7 M-7 -1 H7", style: "stroke:#EDE9FE;stroke-width:2" }); }
      }[ma]; if (h) h(); else svg(e, "circle", { r: 14, class: "tc-f-cam" });
    }
    var vat = g.vat.map(function (ma, i) {
      var nha = { x: 40 + (i % 5) * 116, y: 330 + Math.floor(i / 5) * 46 };
      var e = svg(c, "g", { class: "tc-keo tc-cd-mon", tabindex: "-1", role: "button", "aria-label": t.vat[i], "data-i": i });
      svg(e, "rect", { x: -20, y: -20, width: 40, height: 40, rx: 10, class: "tc-cd-nen-mon" });
      var trong = svg(e, "g", { class: "tc-cd-hinh" }); ve(trong, ma);
      var ten = svg(c, "text", { x: nha.x + 26, y: nha.y + 4, class: "tc-t-dam", style: "font-size:12px" }, t.vat[i]);
      return { i: i, e: e, trong: trong, ten: ten, nha: nha, p: nha, o: null };
    });
    var nguoiDi = svg(c, "g", { opacity: "0", class: "tc-cd-nguoi" });
    svg(nguoiDi, "circle", { cx: 0, cy: -20, r: 8, class: "tc-f-cam" }); svg(nguoiDi, "path", { d: "M-9 10 Q-9 -10 0 -10 Q9 -10 9 10 Z", class: "tc-f-cam" });
    var pha = 0, d1 = 0, d2 = 0, hen = null, buoc = 0, dat = 0;
    function datV(v, p, muot) { v.e.style.transition = muot && !giam ? "transform .3s" : ""; v.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); v.p = p; }
    function khay(hien) { vat.forEach(function (v) { v.e.style.opacity = hien ? "" : ".35"; v.ten.style.opacity = hien ? "" : ".35"; v.e.setAttribute("tabindex", hien ? "0" : "-1"); }); }
    function batDau() {
      pha = 0; d1 = d2 = dat = buoc = 0; clearInterval(hen); o1.hidden = true; o1.innerHTML = ""; ket.hidden = true; chonO.hidden = true; chonO.innerHTML = "";
      b1.hidden = false; [xong1, cham1, b2, di, lai].forEach(function (x) { x.hidden = true; x.disabled = false; });
      cho.forEach(function (k) { k.vat = null; k.vong.setAttribute("opacity", "0"); k.vong.setAttribute("class", "tc-cd-vong"); });
      vat.forEach(function (v) { v.o = null; v.e.style.visibility = ""; v.e.classList.remove("tc-cd-lo"); datV(v, v.nha); v.ten.style.visibility = ""; });
      nguoiDi.setAttribute("opacity", "0"); khay(false); cap.textContent = t.doc_mac;
    }
    // vòng 1
    var chon1 = [];
    b1.onclick = function () {
      pha = 1; b1.hidden = true; xong1.hidden = false; o1.hidden = false; o1.innerHTML = "";
      t.v1.forEach(function (w) { o1.appendChild(tao("div", "tc-chu", w)); });
      var con = g.giay; cap.textContent = dien(t.giay, { s: con });
      hen = setInterval(function () { con--; cap.textContent = dien(t.giay, { s: con }); if (con <= 0) xong1.onclick(); }, 1000);
    };
    xong1.onclick = function () {
      clearInterval(hen); pha = 2; xong1.hidden = true; cham1.hidden = false; o1.innerHTML = ""; chon1 = []; cap.textContent = t.chon_v1;
      tron(t.v1.concat(t.nhieu)).forEach(function (w) {
        var bt = tao("button", "tc-chu", w); bt.type = "button";
        bt.onclick = function () { var k = chon1.indexOf(w); if (k >= 0) { chon1.splice(k, 1); bt.classList.remove("tc-da-chon-chu"); } else { chon1.push(w); bt.classList.add("tc-da-chon-chu"); } bt.setAttribute("aria-pressed", k < 0); };
        bt.setAttribute("aria-pressed", "false"); o1.appendChild(bt);
      });
    };
    cham1.onclick = function () {
      cham1.hidden = true; d1 = 0;
      Array.prototype.forEach.call(o1.children, function (bt) {
        var w = bt.textContent, that = t.v1.indexOf(w) >= 0, da = chon1.indexOf(w) >= 0; bt.disabled = true;
        if (da && that) { bt.classList.add("tc-dung"); d1++; } else if (da) bt.classList.add("tc-sai"); else if (that) bt.classList.add("tc-sot");
      });
      cap.textContent = dien(t.ket1, { d: d1 }); b2.hidden = false;
    };
    // vòng 2: đặt món lên lộ trình
    b2.onclick = function () { pha = 3; b2.hidden = true; o1.hidden = true; khay(true); cap.textContent = t.dat_vat; di.hidden = false; di.disabled = true; };
    function vaoCho(v, k) {
      var cu = cho[k].vat;
      if (v.o != null) cho[v.o].vat = null;
      if (cu && cu !== v) { if (v.o != null) { cho[v.o].vat = cu; cu.o = v.o; datV(cu, { x: cho[v.o].x, y: cho[v.o].y }, true); } else { cu.o = null; datV(cu, cu.nha, true); cu.ten.style.visibility = ""; } }
      cho[k].vat = v; v.o = k; datV(v, { x: cho[k].x, y: cho[k].y }, true); v.ten.style.visibility = "hidden";
      v.e.classList.remove("tc-cd-lo"); void v.e.getBBox(); if (!giam) v.e.classList.add("tc-cd-lo");
      dat = cho.filter(function (x) { return x.vat; }).length;
      cap.textContent = dien(t.lo[(k + v.i) % t.lo.length], { vat: t.vat[v.i], cho: t.cho[k] }) + " · " + dien(t.da_dat, { n: dat });
      di.disabled = dat < N;
    }
    function trongKe(v) { for (var k = 0; k < cho.length; k++) if (!cho[k].vat) return k; return v.o != null ? (v.o + 1) % cho.length : 0; }
    keoSvg(c, "g.tc-cd-mon", function (e, p, bc, dau) {
      if (pha !== 3) return false; var v = vat[+e.getAttribute("data-i")];
      if (bc === "bat") { c.appendChild(e); v.lech = null; return; }
      if (!v.lech) v.lech = { x: dau.x - v.p.x, y: dau.y - v.p.y };
      datV(v, { x: p.x - v.lech.x, y: p.y - v.lech.y });
    }, function (e, p) {
      var v = vat[+e.getAttribute("data-i")];
      if (!p) { vaoCho(v, trongKe(v)); return; }
      var gan = -1, kc = 1e9; cho.forEach(function (k, i) { var d = Math.hypot(k.x - v.p.x, k.y - v.p.y); if (d < kc) { kc = d; gan = i; } });
      if (kc < 48) vaoCho(v, gan);
      else { if (v.o != null) { cho[v.o].vat = null; v.o = null; } datV(v, v.nha, true); v.ten.style.visibility = ""; dat = cho.filter(function (x) { return x.vat; }).length; di.disabled = dat < N; cap.textContent = dien(t.da_dat, { n: dat }); }
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-cd-mon"); if (!e || pha !== 3 || (ev.key !== "Enter" && ev.key !== " ")) return;
      ev.preventDefault(); var v = vat[+e.getAttribute("data-i")]; vaoCho(v, trongKe(v));
    });
    // đi lại lộ trình: dừng ở từng điểm, chọn món đã đặt ở đó
    function dungO(k) {
      var d = cho[k]; nguoiDi.style.transition = giam ? "" : "transform .6s"; nguoiDi.setAttribute("transform", "translate(" + (d.x - 46) + "," + (d.y + 4) + ")");
      d.vong.setAttribute("opacity", "1"); d.vong.setAttribute("class", "tc-cd-vong tc-cd-dang");
      cap.textContent = dien(t.di_hoi, { n: k + 1, cho: t.cho[k] });
    }
    di.onclick = function () {
      pha = 4; di.hidden = true; khay(false); buoc = 0; d2 = 0;
      vat.forEach(function (v) { v.e.style.visibility = "hidden"; v.ten.style.visibility = "hidden"; });
      nguoiDi.setAttribute("opacity", "1"); chonO.hidden = false; chonO.innerHTML = "";
      tron(vat).forEach(function (v) { var bt = nut(t.vat[v.i], false); bt.onclick = function () { tra(v); }; chonO.appendChild(bt); });
      dungO(0);
    };
    function tra(v) {
      if (pha !== 4) return; var d = cho[buoc], dung = d.vat === v; if (dung) d2++;
      d.vat.e.style.visibility = ""; d.vat.e.classList.remove("tc-cd-lo"); d.vat.e.style.opacity = dung ? "" : ".55";
      d.vong.setAttribute("class", "tc-cd-vong " + (dung ? "tc-cd-dung" : "tc-cd-sai"));
      buoc++;
      if (buoc < N) { dungO(buoc); cap.textContent = (dung ? t.dung : dien(t.sai, { vat: t.vat[d.vat.i] })) + " " + cap.textContent; }
      else {
        pha = 5; chonO.hidden = true; nguoiDi.setAttribute("opacity", "0"); cap.textContent = dung ? t.dung : dien(t.sai, { vat: t.vat[d.vat.i] });
        ket.textContent = dien(t.ket, { d: d2, d1: d1 }); ket.hidden = false; lai.hidden = false;
      }
    }
    lai.onclick = batDau;
    batDau();
    s.appendChild(o1); s.appendChild(san); s.appendChild(cap); s.appendChild(chonO); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: giữ Alex trong kênh dòng chảy (kỹ năng tự tăng, kéo độ khó để ở lại trong dải) ----------
  // g.giay: độ dài lượt; g.ky_dau, g.ky_cuoi: kỹ năng đầu/cuối lượt (0..1, minh họa); g.rong: nửa bề rộng kênh; g.kho_dau: độ khó lúc đầu
  // t: truc_x, truc_y, lo_au, chan, kenh, doi_thu[4], trang[3] (dòng chảy, chán, lo âu), dong_ho, keo, nut_bd, nut_lai, doc_mac, con {s}, ket {p}
  function kenhDongChay(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var chonDt = tao("div", "tc-hang tc-kd-doi");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(bd); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var X0 = 70, X1 = 390, Y0 = 20, Y1 = 290, W = g.rong;
    function px(k) { return X0 + k * (X1 - X0); } function py(v) { return Y1 - v * (Y1 - Y0); }
    svg(c, "rect", { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, class: "tc-kd-nen" });
    svg(c, "polygon", { points: [[0, 0], [0, W], [1 - W, 1], [1, 1], [1, 1 - W], [W, 0]].map(function (q) { return px(q[0]) + "," + py(q[1]); }).join(" "), class: "tc-kd-kenh" });
    svg(c, "text", { x: px(0.24), y: py(0.8), "text-anchor": "middle", class: "tc-t-dam tc-kd-lo" }, t.lo_au);
    svg(c, "text", { x: px(0.76), y: py(0.2), "text-anchor": "middle", class: "tc-t-dam tc-kd-chan" }, t.chan);
    var gocK = -Math.atan2(Y1 - Y0, X1 - X0) * 180 / Math.PI;
    svg(c, "text", { x: px(0.5), y: py(0.5) + 4, "text-anchor": "middle", class: "tc-t-dam tc-kd-chu-kenh", transform: "rotate(" + gocK + " " + px(0.5) + " " + (py(0.5) + 4) + ")" }, t.kenh);
    svg(c, "line", { x1: X0, x2: X1, y1: Y1, y2: Y1, class: "tc-thuoc" });
    svg(c, "text", { x: X1, y: Y1 + 20, "text-anchor": "end", class: "tc-t-nho" }, t.truc_x);
    svg(c, "text", { x: 14, y: py(0.5), "text-anchor": "middle", class: "tc-t-nho", transform: "rotate(-90 14 " + py(0.5) + ")" }, t.truc_y);
    // thanh độ khó bên trái
    svg(c, "line", { x1: 40, x2: 40, y1: Y0, y2: Y1, class: "tc-kd-ray" });
    var vet = svg(c, "polyline", { class: "tc-kd-vet", points: "" });
    var vach = svg(c, "line", { x1: 40, x2: X1, class: "tc-kd-vach" });
    var cham = svg(c, "g", {}); svg(cham, "circle", { r: 10, class: "tc-f-cam" }); svg(cham, "text", { y: 4, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:11px" }, "A");
    var tay = svg(c, "g", { class: "tc-keo tc-kd-tay", tabindex: "0", role: "slider", "aria-label": t.keo, "aria-valuemin": 0, "aria-valuemax": 100 });
    svg(tay, "circle", { r: 22, style: "fill:transparent" }); svg(tay, "rect", { x: -13, y: -9, width: 26, height: 18, rx: 6, class: "tc-tay-keo" });
    // khung nhỏ: Alex chơi tennis
    svg(c, "rect", { x: 410, y: 20, width: 180, height: 270, rx: 14, class: "tc-f-giay tc-net-vien" });
    var trangChu = svg(c, "text", { x: 500, y: 46, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:15px" }, "");
    var doiChu = svg(c, "text", { x: 500, y: 66, "text-anchor": "middle", class: "tc-t-nho" }, "");
    var dh = svg(c, "g", { transform: "translate(500,112)" }); svg(dh, "circle", { r: 22, class: "tc-f-giay tc-kd-dh" });
    var kimDh = svg(dh, "line", { x1: 0, y1: 0, x2: 0, y2: -16, class: "tc-kd-kim" }); svg(dh, "circle", { r: 3, class: "tc-f-muc" });
    svg(c, "text", { x: 500, y: 150, "text-anchor": "middle", class: "tc-t-nho" }, t.dong_ho);
    svg(c, "line", { x1: 420, x2: 580, y1: 262, y2: 262, class: "tc-net-vien" }); svg(c, "line", { x1: 512, x2: 512, y1: 236, y2: 262, class: "tc-net-vien" });
    var alex = svg(c, "g", { transform: "translate(448,224)" });
    svg(alex, "circle", { cx: 0, cy: -26, r: 9, class: "tc-f-muc" }); svg(alex, "path", { d: "M0 -16 V10 M0 10 L-8 36 M0 10 L8 36 M0 -8 L14 -14", class: "tc-net-nguoi" });
    svg(alex, "ellipse", { cx: 20, cy: -22, rx: 6, ry: 9, class: "tc-kd-vot" });
    var moHoi = svg(alex, "g", { opacity: "0" }); svg(moHoi, "path", { d: "M-14 -34 q-3 6 0 8 q3 -2 0 -8 M-18 -22 q-3 6 0 8 q3 -2 0 -8", class: "tc-kd-mo-hoi" });
    var ngap = svg(alex, "text", { x: -12, y: -40, class: "tc-t-nho", opacity: "0" }, "z z");
    var doi = svg(c, "g", {});
    var bong = svg(c, "circle", { r: 5, class: "tc-kd-bong" });
    var ky, kho = g.kho_dau, dang = false, t0 = 0, trong = 0, truoc = 0, gocDh = 0, diem = [], hen = 0;
    function tenDoi(v) { return t.doi_thu[Math.min(3, Math.floor(v * 4))]; }
    function veDoi() {
      var k = Math.min(3, Math.floor(kho * 4)); if (doi.k === k) return; doi.k = k; doi.innerHTML = "";
      if (!k) svg(doi, "rect", { x: 566, y: 196, width: 14, height: 66, class: "tc-f-thep" });
      else { var e = svg(doi, "g", { transform: "translate(560,224)" }); svg(e, "circle", { cx: 0, cy: -26, r: 9, class: k > 2 ? "tc-f-cam" : "tc-f-thep" }); svg(e, "path", { d: "M0 -16 V10 M0 10 L-8 36 M0 10 L8 36 M0 -8 L-14 -14", class: "tc-net-nguoi" }); }
    }
    function trangThai() { var d = kho - ky; return d > W ? 2 : d < -W ? 1 : 0; }
    function ve(ts) {
      cham.setAttribute("transform", "translate(" + px(ky) + "," + py(kho) + ")");
      tay.setAttribute("transform", "translate(40," + py(kho) + ")"); tay.setAttribute("aria-valuenow", Math.round(kho * 100)); tay.setAttribute("aria-valuetext", tenDoi(kho));
      vach.setAttribute("y1", py(kho)); vach.setAttribute("y2", py(kho)); vach.setAttribute("x2", px(ky));
      var tt = trangThai(); trangChu.textContent = t.trang[tt]; trangChu.setAttribute("class", "tc-t-dam tc-kd-tt" + tt); doiChu.textContent = tenDoi(kho); veDoi();
      moHoi.setAttribute("opacity", tt === 2 ? "1" : "0"); ngap.setAttribute("opacity", tt === 1 ? "1" : "0");
      var f = giam || !dang ? 0.5 : (ts / (tt === 2 ? 600 : 1100)) % 1, bx, by;
      if (tt === 0) { var di = Math.floor(ts / 1100) % 2 && !giam && dang; bx = di ? 556 - 92 * f : 464 + 92 * f; by = 222 - Math.sin(Math.PI * f) * 46; }
      else if (tt === 1) { bx = 472 + (giam || !dang ? 0 : Math.sin(ts / 400) * 6); by = 257; }
      else { bx = 556 - 140 * f; by = 210 - 150 * f; if (bx < 418) bx = 418; }
      bong.setAttribute("cx", bx); bong.setAttribute("cy", by);
      kimDh.setAttribute("transform", "rotate(" + gocDh + ")");
    }
    function lap(ts) {
      if (!dang) return;
      var tg = ts - t0, f = Math.min(1, tg / (g.giay * 1000)), dt = ts - truoc; truoc = ts;
      ky = g.ky_dau + (g.ky_cuoi - g.ky_dau) * f;
      var tt = trangThai(); if (!tt) trong += dt;
      gocDh = (gocDh + dt * (tt ? 0.06 : 0.36)) % 360;
      if (tg - hen > 250) { hen = tg; diem.push(px(ky) + "," + py(kho)); vet.setAttribute("points", diem.join(" ")); }
      cap.textContent = dien(t.con, { s: Math.ceil(g.giay - tg / 1000) });
      ve(ts);
      if (f >= 1) {
        dang = false; var p = Math.round(100 * trong / (g.giay * 1000));
        ket.textContent = dien(t.ket, { p: p }); ket.hidden = false; lai.hidden = false; cap.textContent = t.trang[trangThai()];
      } else requestAnimationFrame(lap);
    }
    function datKho(v) { kho = Math.max(0, Math.min(1, v)); ve(performance.now()); }
    t.doi_thu.forEach(function (ten, k) { var bt = nut(ten, false); bt.onclick = function () { datKho((k + 0.5) / 4); }; chonDt.appendChild(bt); });
    var keo = false;
    c.addEventListener("pointerdown", function (ev) { var p = diemSvg(c, ev); if (p.x > X1 + 10 || p.y < Y0 - 10 || p.y > Y1 + 10) return; keo = true; c.setPointerCapture(ev.pointerId); ev.preventDefault(); datKho((Y1 - p.y) / (Y1 - Y0)); });
    c.addEventListener("pointermove", function (ev) { if (keo) datKho((Y1 - diemSvg(c, ev).y) / (Y1 - Y0)); });
    function tha() { keo = false; } c.addEventListener("pointerup", tha); c.addEventListener("pointercancel", tha);
    tay.addEventListener("keydown", function (ev) { var d = ev.key === "ArrowUp" || ev.key === "ArrowRight" ? 0.05 : ev.key === "ArrowDown" || ev.key === "ArrowLeft" ? -0.05 : 0; if (d) { ev.preventDefault(); datKho(kho + d); } });
    function batDau() { ky = g.ky_dau; kho = g.kho_dau; trong = 0; diem = []; vet.setAttribute("points", ""); gocDh = 0; dang = false; ket.hidden = true; lai.hidden = true; bd.hidden = false; cap.textContent = t.doc_mac; ve(0); }
    bd.onclick = function () { bd.hidden = true; dang = true; t0 = truoc = performance.now(); hen = -1e9; requestAnimationFrame(lap); };
    lai.onclick = batDau;
    batDau();
    s.appendChild(san); s.appendChild(chonDt); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bàn làm việc 4 ô (đặt việc chính, chặn trước xao nhãng, rồi xem bàn tràn) ----------
  // g.giay: độ dài lượt; g.nhip: số giây giữa hai món bay tới; g.toc: số dòng mỗi giây khi bàn chỉ có việc chính (minh họa); g.xao: [{chan}] món nào chặn trước được
  // t: viec, xao[] (\n xuống dòng), ban, hang_doi, san, hop, dong {n}, nut_bd, nut_lai, doc_mac, khong_chan {x}, da_chan {x}, can_viec, san_sang, toi {x}, con {s}{n}, roi {x}, du_am {x},
  //    ket_luot {n}{kieu}, kieu_mac, kieu_chan, so_sanh {a}{b}, goi_y, ket
  function banChuY(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); bd.disabled = true; lai.hidden = true; hang.appendChild(bd); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var O = [0, 1, 2, 3].map(function (k) { return { x: 72 + k * 116, y: 34 }; }), OW = 108, OH = 104, CW = 88, CH = 58;
    svg(c, "rect", { x: 60, y: 22, width: 480, height: 128, rx: 12, class: "tc-f-go" });
    O.forEach(function (o) { svg(c, "rect", { x: o.x, y: o.y, width: OW, height: OH, rx: 10, class: "tc-bc-o" }); });
    svg(c, "text", { x: 300, y: 15, "text-anchor": "middle", class: "tc-t-nho" }, t.ban);
    svg(c, "text", { x: 12, y: 174, class: "tc-t-nho" }, t.hang_doi);
    svg(c, "rect", { x: 10, y: 258, width: 372, height: 136, rx: 12, class: "tc-bc-san" }); svg(c, "text", { x: 20, y: 252, class: "tc-t-nho" }, t.san);
    var hop = svg(c, "rect", { x: 398, y: 258, width: 192, height: 136, rx: 12, class: "tc-bc-hop" }); svg(c, "text", { x: 408, y: 252, class: "tc-t-nho" }, t.hop);
    function the(lop, w, h, nhan) {
      var e = svg(c, "g", { class: "tc-keo " + lop, tabindex: "0", role: "button", "aria-label": nhan });
      svg(e, "rect", { x: 0, y: 0, width: w, height: h, rx: 9, class: "tc-bc-the" });
      return e;
    }
    // việc chính: bản báo cáo chiếm 2 ô, các dòng chữ mọc dần
    var R = { e: the("tc-bc-bc", 2 * OW + 8, OH, t.viec), lon: 2, nha: { x: 24, y: 272 } };
    svg(R.e, "text", { x: 12, y: 22, class: "tc-t-dam" }, t.viec);
    var dongR = svg(R.e, "g", {}), soR = svg(R.e, "text", { x: 2 * OW - 4, y: 22, "text-anchor": "end", class: "tc-t-nho" }, "");
    var bongMo = svg(R.e, "text", { x: OW + 4, y: 70, "text-anchor": "middle", class: "tc-bc-bong-mo", opacity: "0" }, "");
    var X = g.xao.map(function (x, i) {
      var e = the("tc-bc-xn", CW, CH, t.xao[i].replace(/\n/g, " ")), dong = t.xao[i].split("\n");
      dong.forEach(function (d, k) { svg(e, "text", { x: CW / 2, y: CH / 2 + 5 + (k - (dong.length - 1) / 2) * 15, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:12px" }, d); });
      if (x.chan) svg(e, "circle", { cx: CW - 8, cy: 8, r: 4, class: "tc-f-cam" });
      return { i: i, e: e, lon: 1, chan: x.chan, nha: { x: 12 + i * 98, y: 184 }, ten: t.xao[i].replace(/\n/g, " ") };
    });
    var pha = 0, ban = [], roi = [], chan = [], dong = 0, t0 = 0, truoc = 0, den = 0, duAm = 0, kq = {}, hangDoi = [];
    function datE(v, p, muot, nghieng) { v.e.style.transition = muot && !giam ? "transform .45s ease-out" : ""; v.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")" + (nghieng ? " rotate(" + nghieng + ")" : "")); v.p = p; }
    function xepBan() {
      var k = 0; ban.forEach(function (v) { var o = O[k]; datE(v, v.lon === 2 ? { x: o.x, y: o.y } : { x: o.x + (OW - CW) / 2, y: o.y + (OH - CH) / 2 }, true); k += v.lon; });
      chan.forEach(function (v, k) { datE(v, { x: 406 + (k % 2) * 92, y: 266 + Math.floor(k / 2) * 62 }, true); });
      roi.forEach(function (v, k) { if (v === R) datE(v, R.nha, true, -3); else datE(v, { x: 250 + (k % 3) * 8, y: 276 + (k % 4) * 22 }, true, (k % 2 ? 8 : -10)); v.e.classList.add("tc-bc-roi"); });
    }
    function dangBan() { return ban.reduce(function (a, v) { return a + v.lon; }, 0); }
    function vaoBan(v) {
      ban = ban.filter(function (x) { return x !== v; }); roi = roi.filter(function (x) { return x !== v; }); v.e.classList.remove("tc-bc-roi");
      ban.push(v); var rot = [];
      while (dangBan() > 4) { var cu = ban.shift(); roi.push(cu); rot.push(cu); }
      xepBan(); return rot;
    }
    function veDong() {
      var n = Math.floor(dong); soR.textContent = dien(t.dong, { n: n });
      var can = Math.min(5, n); while (dongR.childNodes.length < can) { var k = dongR.childNodes.length; svg(dongR, "rect", { x: 12, y: 36 + k * 12, width: 60 + ((k * 53) % 130), height: 6, rx: 3, class: "tc-bc-chu" }); }
      while (dongR.childNodes.length > can) dongR.removeChild(dongR.lastChild);
    }
    function batDau() {
      pha = 0; ban = []; roi = []; chan = []; dong = 0; duAm = 0; veDong(); bongMo.setAttribute("opacity", "0");
      datE(R, R.nha); R.e.classList.remove("tc-bc-roi"); X.forEach(function (v) { v.e.classList.remove("tc-bc-roi"); v.e.style.visibility = ""; datE(v, v.nha); });
      bd.disabled = true; bd.hidden = false; lai.hidden = true; ket.hidden = true; cap.textContent = t.doc_mac;
    }
    function nhanDuAm(v) { duAm = 3000; bongMo.textContent = v.ten; bongMo.setAttribute("opacity", ".4"); cap.textContent = dien(t.du_am, { x: v.ten }); }
    // chạm / thả: lúc chuẩn bị thì đặt việc chính và chặn trước; lúc chạy thì dẹp món khỏi bàn hoặc nhặt báo cáo lên
    function hanhDong(v, p) {
      var trenBan = p && p.y + 30 < 156, trongHop = p && p.x + CW / 2 > 398 && p.y + CH / 2 > 258;
      if (pha === 0) {
        if (v === R) { if (!p || trenBan) { vaoBan(R); cap.textContent = t.san_sang; bd.disabled = false; } else { ban = []; datE(R, R.nha, true); bd.disabled = true; } return; }
        var daChan = chan.indexOf(v) >= 0;
        if (p ? trongHop : !daChan) {
          if (!v.chan) { datE(v, v.nha, true); cap.textContent = dien(t.khong_chan, { x: v.ten }); return; }
          if (!daChan) chan.push(v); xepBan(); cap.textContent = dien(t.da_chan, { x: v.ten });
        } else { chan = chan.filter(function (x) { return x !== v; }); datE(v, v.nha, true); xepBan(); }
        return;
      }
      if (pha !== 1) { xepBan(); return; }
      if (v === R) { if (ban.indexOf(R) < 0 && (!p || trenBan)) { vaoBan(R); var ds = roi.filter(function (x) { return x !== R; }); if (ds.length) nhanDuAm(ds[ds.length - 1]); } else xepBan(); return; }
      if (ban.indexOf(v) >= 0 && (!p || !trenBan)) { ban = ban.filter(function (x) { return x !== v; }); roi.push(v); xepBan(); if (ban.indexOf(R) >= 0) nhanDuAm(v); return; }
      xepBan();
    }
    var tatCa = [R].concat(X);
    function timV(e) { return tatCa.filter(function (v) { return v.e === e; })[0]; }
    keoSvg(c, "g.tc-keo", function (e, p, b2, dau) {
      var v = timV(e); if (pha > 1 || (pha === 1 && hangDoi.indexOf(v) >= 0) || (pha === 1 && roi.indexOf(v) >= 0 && v !== R)) return false;
      if (b2 === "bat") { c.appendChild(e); v.lech = null; return; }
      if (!v.lech) v.lech = { x: dau.x - v.p.x, y: dau.y - v.p.y };
      datE(v, { x: p.x - v.lech.x, y: p.y - v.lech.y });
    }, function (e, p) { var v = timV(e); hanhDong(v, p ? v.p : null); });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-keo"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var v = timV(e); if (pha === 1 && hangDoi.indexOf(v) >= 0) return; hanhDong(v, null); });
    function lap(ts) {
      if (pha !== 1) return;
      var tg = ts - t0, dt = Math.min(100, ts - truoc); truoc = ts;
      if (hangDoi.length && tg >= (den + 0.5) * g.nhip * 1000) {
        den++; var v = hangDoi.shift(), rot = vaoBan(v);
        cap.textContent = rot.indexOf(R) >= 0 ? dien(t.roi, { x: t.viec }) : dien(t.toi, { x: v.ten });
      }
      if (duAm > 0) { duAm -= dt; if (duAm <= 0) bongMo.setAttribute("opacity", "0"); }
      if (ban.indexOf(R) >= 0) dong += dt / 1000 * g.toc / (1 + ban.length - 1) * (duAm > 0 ? 0.4 : 1);
      veDong();
      var con = Math.ceil(g.giay - tg / 1000);
      if (con <= 0) {
        pha = 2; var n = Math.floor(dong), kieu = chan.length ? "chan" : "mac"; kq[kieu] = n;
        var chu = dien(t.ket_luot, { n: n, kieu: t["kieu_" + kieu] }) + " ";
        if (kq.mac != null && kq.chan != null) chu += dien(t.so_sanh, { a: kq.mac, b: kq.chan }) + " "; else chu += (kieu === "mac" ? t.goi_y : "") + " ";
        ket.textContent = (chu + t.ket).replace(/\s+/g, " "); ket.hidden = false; lai.hidden = false; cap.textContent = dien(t.dong, { n: n });
        return;
      }
      if (duAm <= 0 && tg - (den - 0.5) * g.nhip * 1000 > 1200) cap.textContent = dien(t.con, { s: con, n: Math.floor(dong) });
      requestAnimationFrame(lap);
    }
    bd.onclick = function () {
      if (ban.indexOf(R) < 0) { cap.textContent = t.can_viec; return; }
      pha = 1; bd.hidden = true; den = 0; dong = 0; hangDoi = X.filter(function (v) { return chan.indexOf(v) < 0; });
      t0 = truoc = performance.now(); requestAnimationFrame(lap);
    };
    lai.onclick = batDau;
    batDau();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 1 A KẾT THÚC ====
  // ==== ĐỢT 1 B BẮT ĐẦU ====
  // Giữ để làm (chuột, cảm ứng, phím Space/Enter giữ): bat() khi bắt đầu giữ, tha() khi thả. cho(ev) trả false để bỏ qua lần bấm đó.
  function b1Giu(e, bat, tha, cho) {
    var dang = false;
    function len(ev) { if (dang || (cho && cho(ev) === false)) return; dang = true; if (ev && ev.pointerId != null) { try { e.setPointerCapture(ev.pointerId); } catch (x) {} } bat(); }
    function xuong() { if (!dang) return; dang = false; tha(); }
    e.addEventListener("pointerdown", function (ev) { if (ev.button > 0) return; len(ev); if (dang) ev.preventDefault(); });
    e.addEventListener("pointerup", xuong); e.addEventListener("pointercancel", xuong); e.addEventListener("lostpointercapture", xuong);
    e.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
    e.addEventListener("keydown", function (ev) { if (ev.key !== " " && ev.key !== "Enter") return; ev.preventDefault(); if (!ev.repeat) len(ev); });
    e.addEventListener("keyup", function (ev) { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); xuong(); } });
    e.addEventListener("focusout", xuong);
  }
  function b1Mo(e, v) { e.style.opacity = v; }

  // ---------- Cảnh: ba hơi thở, một đám mây (thực tập, không điểm, không đồng hồ) ----------
  // Giữ vòng tròn để hít vào, thả để thở ra; mỗi hơi thở trọn đưa cảnh: mây → mưa, sông → chén trà → hơi bay lên lại thành mây.
  // Sau một vòng hiện câu kết và nút xem sóng và nước (kéo con sóng lên xuống, nước bên dưới không đổi).
  // t.chang: [4 câu cho 4 chặng]; t.giu, t.hit, t.tho, t.sau (chữ dưới vòng thở); t.nut_tho (nhãn cho trình đọc); t.nut_song, t.nut_may, t.nut_lai;
  // t.song_tren, t.song_duoi, t.song_cap, t.song_cao, t.song_thap, t.keo_song; t.ket
  function vongMay(g, t) {
    var s = khung(g, t), san = canh("tc-vm-nen"), c = svg(san, "svg", { viewBox: "0 0 600 360", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.chang[0]); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), nutSong = nut(t.nut_song, false), lai = nut(t.nut_lai, false); nutSong.hidden = true; hang.appendChild(nutSong); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var MO = giam ? "opacity .5s" : "opacity 1.4s ease";
    function lop(e) { e.style.transition = MO; return e; }
    // Thế giới mây
    var the = lop(svg(c, "g", {}));
    svg(the, "path", { d: "M0 248 C90 222 170 238 260 250 S430 226 600 244 L600 360 L0 360 Z", class: "tc-vm-doi" });
    var DS = "M-10 320 C90 298 170 338 280 320 S470 294 610 318";
    svg(the, "path", { d: DS, class: "tc-vm-long" });
    var nuoc = lop(svg(the, "path", { d: DS, class: "tc-vm-nuoc" }));
    var mua = lop(svg(the, "g", { class: "tc-vm-mua" }));
    for (var i = 0; i < 16; i++) { var x = -62 + (i * 37) % 124, y = 20 + (i * 53) % 130; svg(mua, "line", { x1: x, y1: y, x2: x - 3, y2: y + 16, style: "animation-delay:-" + (i * 0.13).toFixed(2) + "s" }); }
    // chén trà
    var chen = svg(the, "g", { transform: "translate(470,212)" });
    svg(chen, "ellipse", { cx: 0, cy: 36, rx: 40, ry: 6, class: "tc-vm-dia" });
    svg(chen, "path", { d: "M27 6 q20 0 18 13 q-3 11 -21 9", class: "tc-vm-quai" });
    svg(chen, "path", { d: "M-30 0 h60 v8 q0 26 -30 26 q-30 0 -30 -26 Z", class: "tc-vm-chen" });
    var tra = lop(svg(chen, "ellipse", { cx: 0, cy: 3, rx: 27, ry: 4.5, class: "tc-vm-tra" }));
    var hoi = lop(svg(chen, "g", { class: "tc-vm-hoi" }));
    [-12, 0, 12].forEach(function (dx, k) { svg(hoi, "path", { d: "M" + dx + " -6 q-8 -12 0 -22 q8 -10 0 -22", style: "animation-delay:-" + k * 0.9 + "s" }); });
    var bay = lop(svg(the, "path", { d: "M470 190 C440 160 500 130 470 104", class: "tc-vm-bay" }));
    // đám mây (một đám, đổi chỗ khi đã tan)
    var may = lop(svg(the, "g", {})), mayTrong = svg(may, "g", { class: "tc-vm-may" });
    [[-44, 10, 20], [-16, -6, 30], [20, -2, 26], [46, 12, 18]].forEach(function (q) { svg(mayTrong, "circle", { cx: q[0], cy: q[1], r: q[2] }); });
    svg(mayTrong, "rect", { x: -62, y: 8, width: 126, height: 24, rx: 12 });
    var A = { x: 140, y: 78 }, B = { x: 470, y: 72 };
    function choMay(p) { may.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); mua.setAttribute("transform", "translate(" + p.x + "," + (p.y + 36) + ")"); }
    // vòng thở
    var vong = svg(c, "g", { class: "tc-vm-vong", tabindex: "0", role: "button", "aria-label": t.nut_tho });
    svg(vong, "circle", { cx: 300, cy: 130, r: 68, class: "tc-vm-khung" });
    var tron_ = svg(vong, "circle", { cx: 300, cy: 130, r: 36, class: "tc-vm-tron" });
    svg(vong, "circle", { cx: 300, cy: 130, r: 4, class: "tc-f-cam" });
    var goi = svg(c, "text", { x: 300, y: 226, "text-anchor": "middle", class: "tc-vm-goi" }, t.giu);
    var cham = [0, 1, 2].map(function (k) { return svg(c, "circle", { cx: 284 + k * 16, cy: 24, r: 5, class: "tc-vm-cham" }); });
    // Thế giới sóng và nước
    var songG = lop(svg(c, "g", {})); songG.style.display = "none"; b1Mo(songG, 0);
    var BASE = 214, h = 46;
    var mat = svg(songG, "path", { class: "tc-vm-bien" });
    svg(songG, "line", { x1: 16, x2: 584, y1: 292, y2: 292, class: "tc-vm-ranh" });
    svg(songG, "text", { x: 20, y: 34, class: "tc-vm-chu" }, t.song_tren);
    svg(songG, "text", { x: 20, y: 324, class: "tc-vm-chu tc-vm-chu-nuoc" }, t.song_duoi);
    var tay = svg(songG, "g", { class: "tc-keo tc-vm-tay", tabindex: "0", role: "slider", "aria-label": t.keo_song, "aria-valuemin": "0", "aria-valuemax": "130" });
    svg(tay, "circle", { r: 24, style: "fill:transparent" }); svg(tay, "circle", { r: 11, class: "tc-tay-keo" });
    function G(x, m) { return Math.exp(-Math.pow((x - m) / 58, 2)); }
    function veSong() {
      var d = "M0 360 L0 " + BASE;
      for (var x = 0; x <= 600; x += 10) d += " L" + x + " " + (BASE - h * (G(x, 300) - 0.5 * G(x, 188) - 0.5 * G(x, 412))).toFixed(1);
      mat.setAttribute("d", d + " L600 360 Z"); tay.setAttribute("transform", "translate(300," + (BASE - h) + ")"); tay.setAttribute("aria-valuenow", Math.round(h));
    }
    function datSong(v) { h = Math.max(0, Math.min(130, v)); veSong(); cap.textContent = h > 90 ? t.song_cao : h < 12 ? t.song_thap : t.song_cap; }
    veSong();
    keoSvg(c, "g.tc-vm-tay", function (e, p) { if (p) datSong(BASE - p.y); }, function () {});
    tay.addEventListener("keydown", function (ev) { if (ev.key === "ArrowUp") { datSong(h + 10); ev.preventDefault(); } if (ev.key === "ArrowDown") { datSong(h - 10); ev.preventDefault(); } });
    var cheDo = "may";
    nutSong.onclick = function () {
      cheDo = cheDo === "may" ? "song" : "may"; var la = cheDo === "song";
      songG.style.display = ""; songG.getBoundingClientRect(); b1Mo(songG, la ? 1 : 0); b1Mo(the, la ? 0 : 1); b1Mo(vong, la ? 0 : 1); b1Mo(goi, la ? 0 : 1); cham.forEach(function (e) { b1Mo(e, la ? 0 : 1); });
      vong.style.visibility = la ? "hidden" : ""; songG.style.pointerEvents = la ? "" : "none";
      nutSong.textContent = la ? t.nut_may : t.nut_song; cap.textContent = la ? t.song_cap : t.chang[3];
    };
    // Trạng thái: st = số hơi thở trọn đã thở (0..3, sau 3 thì vòng lại 1..3 quanh đám mây mới)
    var st = 0, buoc = 0;
    function ve() {
      var k = st === 0 ? 0 : (st - 1) % 3 + 1;
      b1Mo(may, [1, 0.35, 0, 1][k]); b1Mo(mua, [0, 1, 0, 0][k]); b1Mo(nuoc, [0, 1, 1, 1][k]); b1Mo(tra, [0, 0, 1, 0.45][k]); b1Mo(hoi, [0, 0, 1, 0.5][k]); b1Mo(bay, [0, 0, 0, 1][k]);
      if (k === 0) choMay(A); if (k === 2) setTimeout(function () { if ((st - 1) % 3 + 1 === 2) choMay(B); }, giam ? 600 : 1500);
      cham.forEach(function (e, j) { e.classList.toggle("tc-vm-qua", st > 0 && j < k); });
      cap.textContent = t.chang[k];
      if (st >= 3 && ket.hidden) { ket.textContent = t.ket; ket.hidden = false; nutSong.hidden = false; }
    }
    choMay(A); ve();
    // Hơi thở: b từ 0 tới 1 khi giữ, về 0 khi thả. Hít đủ sâu (b ≥ 0,85) rồi thở ra hết mới tính là một hơi trọn.
    var b = 0, giu = false, sau = false, chay = false, t0 = 0;
    function khung_(ts) {
      var dt = Math.min(80, ts - t0); t0 = ts;
      b = Math.max(0, Math.min(1, b + (giu ? dt / 3200 : -dt / 3600)));
      if (b >= 0.85) sau = true;
      tron_.setAttribute("r", (36 + 30 * b).toFixed(1));
      goi.textContent = giu ? t.hit : b > 0 ? (sau ? t.tho : t.sau) : t.giu;
      if (!giu && b <= 0.02 && sau) { sau = false; st++; ve(); }
      if (!giu && b <= 0) { chay = false; goi.textContent = t.giu; return; }
      requestAnimationFrame(khung_);
    }
    function batDau() { if (!chay) { chay = true; t0 = performance.now(); requestAnimationFrame(khung_); } }
    b1Giu(c, function () { giu = true; batDau(); }, function () { giu = false; batDau(); }, function (ev) {
      if (cheDo !== "may") return false;
      if (ev && ev.type === "keydown") return ev.target === vong;
      return !(ev && ev.target && ev.target.closest && ev.target.closest(".tc-vm-tay"));
    });
    lai.onclick = function () {
      if (cheDo === "song") nutSong.onclick();
      st = 0; b = 0; sau = false; giu = false; ket.hidden = true; nutSong.hidden = true; h = 46; veSong(); choMay(A); ve(); tron_.setAttribute("r", 36); goi.textContent = t.giu;
    };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: một năm giữ lửa (ba vòng quan hệ, đèn mờ dần; kéo bong bóng "ping" vào người để đèn sáng lại) ----------
  // g.vong: [số người vòng trong, giữa, ngoài]; g.phai: [số tháng để đèn sáng hẳn tắt hẳn ở mỗi vòng] (minh họa); g.dau: [độ sáng lúc đầu mỗi vòng]
  // g.ping: số bong bóng mỗi tháng (không cộng dồn); g.thang_ms: độ dài một tháng (ms); g.moi: [tháng có người mới]; g.cho_ms: độ dài vòng "24 giờ";
  // g.tia: [số tia tin việc tối đa mỗi người theo vòng] (minh họa theo hướng liên kết yếu)
  // t.nguoi: [[tên vòng trong], [giữa], [ngoài]]; t.moi: [tên người mới]; t.vong: [nhãn 3 vòng]; t.ping: [3 loại bong bóng]; t.ban, t.thang {n}, t.khay,
  // t.nut_bd, t.nut_lai, t.doc_mac, t.da_ping {p}, t.het_ping, t.moi_den {p}, t.moi_vao {p}, t.moi_mat {p}, t.ai_nhi, t.gio, t.bien_co, t.tin {n}, t.ket_ban {n}{y}, t.ket
  function vongQuanHe(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 420", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(bd); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var O = { x: 236, y: 214 }, R = [64, 122, 180];
    R.forEach(function (r, k) { svg(c, "circle", { cx: O.x, cy: O.y, r: r, class: "tc-vq-vong" }); svg(c, "text", { x: O.x, y: O.y - r - 5, "text-anchor": "middle", class: "tc-t-nho tc-vq-nhan" }, t.vong[k]); });
    var tiaG = svg(c, "g", {});
    svg(c, "circle", { cx: O.x, cy: O.y, r: 22, class: "tc-f-cam" }); svg(c, "text", { x: O.x, y: O.y + 4, "text-anchor": "middle", class: "tc-t-trang" }, t.ban);
    var demTin = svg(c, "text", { x: 14, y: 46, class: "tc-t-dam" }, "");
    var thangChu = svg(c, "text", { x: 14, y: 24, class: "tc-t-dam", style: "font-size:15px" }, "");
    // các ngọn đèn: góc tránh nhãn vòng ở đỉnh
    var den = [];
    function taoDen(k, a, ten, sang) {
      var x = O.x + R[k] * Math.cos(a), y = O.y + R[k] * Math.sin(a);
      var e = svg(c, "g", { class: "tc-cham-duoc tc-vq-den", tabindex: "0", role: "button", "aria-label": ten });
      var hao = svg(e, "circle", { cx: x, cy: y, r: 20, class: "tc-vq-hao" }), loi = svg(e, "circle", { cx: x, cy: y, r: 9, class: "tc-vq-loi" });
      svg(e, "text", { x: x, y: y + 25, "text-anchor": "middle", class: "tc-vq-ten" }, ten);
      var d = { k: k, x: x, y: y, e: e, hao: hao, loi: loi, sang: sang, ten: ten }; den.push(d);
      e.addEventListener("click", function () { ping(d); });
      e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ping(d); } });
      veDen(d); return d;
    }
    function veDen(d) { b1Mo(d.hao, (0.12 + 0.6 * d.sang).toFixed(2)); d.loi.classList.toggle("tc-vq-tat", d.sang < 0.08); d.e.classList.toggle("tc-vq-mo", d.sang < 0.08); }
    var cho = [];
    function dungDen() {
      den.forEach(function (d) { d.e.remove(); }); den = []; cho = [];
      g.vong.forEach(function (n, k) {
        var tong = n + (k === 2 ? g.moi.length : 0);
        for (var j = 0; j < tong; j++) {
          var hoTren = [0.8, 0.6, 0.45][k], a = -Math.PI / 2 + hoTren + (j + 0.5) * (2 * Math.PI - 2 * hoTren) / tong;
          if (j < n) taoDen(k, a, t.nguoi[k][j], g.dau[k]); else cho.push(a);
        }
      });
    }
    // khay bong bóng
    svg(c, "rect", { x: 462, y: 36, width: 126, height: 300, rx: 16, class: "tc-vq-khay" });
    svg(c, "text", { x: 525, y: 58, "text-anchor": "middle", class: "tc-t-nho" }, t.khay);
    var bong = [], bongG = svg(c, "g", {});
    function oBong(i) { return { x: 525, y: 98 + i * 64 }; }
    function datBong(o, p) { o.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); o.p = p; }
    function napBong() {
      bongG.innerHTML = ""; bong = [];
      for (var i = 0; i < g.ping; i++) {
        var e = svg(bongG, "g", { class: "tc-keo tc-vq-bong", tabindex: "0", role: "button", "aria-label": t.ping[i % 3], "data-i": i });
        svg(e, "circle", { r: 21, class: "tc-vq-bong-v" }); svg(e, "text", { y: 4, "text-anchor": "middle", class: "tc-vq-bieu" }, ["✦", "✉", "◉"][i % 3]);
        svg(e, "text", { y: 36, "text-anchor": "middle", class: "tc-t-nho" }, t.ping[i % 3]);
        var o = { e: e, i: i, nha: oBong(i) }; datBong(o, o.nha); bong.push(o);
      }
    }
    var moiG = svg(c, "g", {}), moi = [], dang = false, xong = false, tg = 0, thang = 0, t0 = 0;
    function conBong() { return bong.filter(function (o) { return !o.dung; }); }
    function dungBong(o, d) {
      o.dung = true; o.e.style.pointerEvents = "none";
      var a = o.p, b = { x: d.x, y: d.y }, s0 = null, T = giam ? 1 : 380;
      (function bu(ts) { if (!s0) s0 = ts; var f = Math.min(1, (ts - s0) / T); datBong(o, { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }); o.e.setAttribute("opacity", 1 - f); if (f < 1) requestAnimationFrame(bu); })(performance.now());
    }
    function ping(d, o) {
      if (!dang) { cap.textContent = xong ? cap.textContent : t.doc_mac; return; }
      o = o || conBong()[0];
      if (!o) { cap.textContent = t.het_ping; return; }
      dungBong(o, d); d.sang = 1; veDen(d); cap.textContent = dien(t.da_ping, { p: d.ten });
    }
    keoSvg(c, "g.tc-vq-bong", function (e, p, b, dau) {
      var o = bong[+e.getAttribute("data-i")]; if (!dang || o.dung) return false;
      if (b === "bat") { o.lech = null; return; }
      if (!o.lech) o.lech = { x: dau.x - o.p.x, y: dau.y - o.p.y }; datBong(o, { x: p.x - o.lech.x, y: p.y - o.lech.y });
    }, function (e, p) {
      var o = bong[+e.getAttribute("data-i")]; if (o.dung) return;
      if (!p) { datBong(o, o.nha); cap.textContent = t.doc_mac; return; }
      var gan = null, kc = 46;
      den.forEach(function (d) { var k = Math.hypot(d.x - o.p.x, d.y - o.p.y); if (k < kc) { kc = k; gan = d; } });
      if (gan) ping(gan, o); else datBong(o, o.nha);
    });
    // người mới ở rìa, có vòng đếm "24 giờ"
    var CHO_MOI = [{ x: 40, y: 380 }, { x: 40, y: 70 }, { x: 440, y: 396 }];
    function nguoiMoi(j) {
      var p = CHO_MOI[j % 3], e = svg(moiG, "g", { class: "tc-cham-duoc tc-vq-moi", tabindex: "0", role: "button", "aria-label": t.moi[j] });
      svg(e, "circle", { cx: p.x, cy: p.y, r: 22, class: "tc-vq-dem-nen" });
      var vongDem = svg(e, "circle", { cx: p.x, cy: p.y, r: 22, class: "tc-vq-dem", pathLength: 100, "stroke-dasharray": "100 100", transform: "rotate(-90 " + p.x + " " + p.y + ")" });
      svg(e, "circle", { cx: p.x, cy: p.y, r: 9, class: "tc-vq-loi" });
      var chu = svg(e, "text", { x: p.x, y: p.y - 30, "text-anchor": "middle", class: "tc-vq-ten" }, t.moi[j] + " · " + t.gio);
      var m = { j: j, e: e, vong: vongDem, chu: chu, bat: tg, xong: false }; moi.push(m);
      function nhan() { if (!dang || m.xong) return; m.xong = true; e.remove(); taoDen(2, cho[j], t.moi[j], 1); cap.textContent = dien(t.moi_vao, { p: t.moi[j] }); }
      e.addEventListener("click", nhan); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); nhan(); } });
      cap.textContent = dien(t.moi_den, { p: t.moi[j] });
    }
    function chay(ts) {
      if (!dang) return;
      var dt = Math.min(100, ts - t0); t0 = ts; tg += dt;
      var th = Math.min(12, Math.floor(tg / g.thang_ms) + 1);
      if (th !== thang) { thang = th; thangChu.textContent = dien(t.thang, { n: thang }); napBong(); g.moi.forEach(function (mm, j) { if (mm === thang) nguoiMoi(j); }); }
      den.forEach(function (d) { d.sang = Math.max(0, d.sang - dt / (g.phai[d.k] * g.thang_ms)); veDen(d); });
      moi.forEach(function (m) {
        if (m.xong) return; var f = (tg - m.bat) / g.cho_ms;
        m.vong.setAttribute("stroke-dasharray", Math.max(0, 100 * (1 - f)).toFixed(1) + " 100");
        if (f >= 1) { m.xong = true; m.e.classList.add("tc-vq-mat"); m.chu.textContent = t.ai_nhi; cap.textContent = dien(t.moi_mat, { p: t.moi[m.j] }); }
      });
      if (tg >= 12 * g.thang_ms) { cuoiNam(); return; }
      requestAnimationFrame(chay);
    }
    function cuoiNam() {
      dang = false; xong = true; bongG.innerHTML = ""; cap.textContent = t.bien_co;
      var tong = 0, yeu = 0, ds = [];
      den.forEach(function (d) { var n = d.sang > 0.12 ? Math.round(d.sang * g.tia[d.k] + 0.49) : 0; for (var q = 0; q < n; q++) ds.push(d); tong += n; if (d.k > 0) yeu += n; });
      ds.forEach(function (d, q) {
        var lech = (q % 3 - 1) * 5, l = svg(tiaG, "line", { x1: d.x, y1: d.y, x2: O.x + lech, y2: O.y + lech, pathLength: 1, class: "tc-vq-tia" + (d.k ? "" : " tc-vq-tia-than") });
        l.style.strokeDasharray = "1"; l.style.strokeDashoffset = giam ? "0" : "1";
        if (!giam) setTimeout(function () { l.style.strokeDashoffset = "0"; }, 60 * q + 30);
      });
      setTimeout(function () {
        demTin.textContent = dien(t.tin, { n: tong });
        ket.textContent = dien(t.ket_ban, { n: tong, y: yeu }) + " " + t.ket; ket.hidden = false; lai.hidden = false;
      }, giam ? 0 : 60 * ds.length + 500);
    }
    function moDau() { tiaG.innerHTML = ""; moiG.innerHTML = ""; moi = []; demTin.textContent = ""; thangChu.textContent = dien(t.thang, { n: 1 }); dungDen(); napBong(); bong.forEach(function (o) { o.e.setAttribute("opacity", "0.5"); }); }
    moDau();
    bd.onclick = function () { bd.hidden = true; dang = true; xong = false; tg = 0; thang = 0; t0 = performance.now(); cap.textContent = t.doc_mac; requestAnimationFrame(chay); };
    lai.onclick = function () { lai.hidden = true; ket.hidden = true; xong = false; bd.hidden = false; cap.textContent = t.doc_mac; moDau(); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: vượt qua con số 150 (kéo thêm người vào bộ lạc, sợi buôn chuyện đứt dần; cắm một lá cờ chung; rồi bớt người tin) ----------
  // g.dau: số người lúc đầu; g.them: số người mỗi lần kéo; g.toi_da; g.moi_hinh: số người mỗi hình; g.truc_max: đầu phải trục; g.dunbar; g.dai: [thấp, cao] (dải mờ);
  // g.dut: [bắt đầu đứt, đứt hết] (minh họa); t.co: [{ten, full}] 3 lá cờ (thần linh, đồng tiền, công ty; không vẽ logo thật);
  // t.doan_moi, t.dem {n}, t.dai_nhan, t.dai_ghi, t.doc_mac, t.cap_nho, t.cap_lon, t.cap_vo, t.co_khoa, t.cap_co {c}, t.dem_lon[3], t.tin_nhan, t.song, t.cap_tin, t.cap_sap, t.ket, t.nut_lai
  function cauChuyenChung(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), W = 600, c = svg(san, "svg", { viewBox: "0 0 600 380", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var idT = g.id + "-tin", nh = tao("label", "tc-o-nhap", t.tin_nhan + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", "100%"); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = 100; th.step = 1; th.value = 100; th.id = idT; nh.appendChild(th); nh.hidden = true;
    var hang = tao("div", "tc-hang"), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    // trục số người, điểm "đứt" vẽ thành dải mờ
    function X(n) { return 60 + n * 400 / g.truc_max; }
    var de = svg(c, "defs", {}), gd = svg(de, "linearGradient", { id: g.id + "-dai", gradientUnits: "userSpaceOnUse", x1: X(g.dai[0]), x2: X(g.dai[1]), y1: 0, y2: 0 });
    var dinh = (g.dunbar - g.dai[0]) / (g.dai[1] - g.dai[0]);
    [[0, 0.08], [dinh * 0.55, 0.35], [dinh, 0.75], [dinh + (1 - dinh) * 0.35, 0.3], [1, 0.06]].forEach(function (q) { svg(gd, "stop", { offset: q[0].toFixed(3), style: "stop-color:var(--cam);stop-opacity:" + q[1] }); });
    svg(c, "rect", { x: X(g.dai[0]), y: 26, width: X(g.dai[1]) - X(g.dai[0]), height: 18, rx: 9, fill: "url(#" + g.id + "-dai)" });
    svg(c, "line", { x1: X(0), x2: X(g.truc_max), y1: 35, y2: 35, class: "tc-thuoc" });
    svg(c, "text", { x: X(0), y: 60, "text-anchor": "middle", class: "tc-t-nho" }, "0");
    svg(c, "text", { x: X(g.dunbar), y: 60, "text-anchor": "middle", class: "tc-t-dam" }, t.dai_nhan);
    svg(c, "text", { x: X(g.dai[1]), y: 60, "text-anchor": "middle", class: "tc-t-nho" }, "500+");
    svg(c, "text", { x: X(0), y: 78, class: "tc-t-nho" }, t.dai_ghi);
    var kim = svg(c, "path", { d: "M-7 -10 L7 -10 L0 2 Z", class: "tc-f-cam" });
    // dòng sông (thực tại khách quan) chảy dưới đáy, không phụ thuộc ai tin
    svg(c, "path", { d: "M0 352 C120 336 220 366 330 350 S520 334 600 350 L600 380 L0 380 Z", class: "tc-ccc-song" });
    svg(c, "path", { d: "M0 360 C120 344 220 374 330 358 S520 342 600 358", class: "tc-ccc-gon" });
    svg(c, "text", { x: 14, y: 374, class: "tc-ccc-song-chu" }, t.song);
    // bãi đất, người que
    var CX = 262, CY = 214, RX = 176, RY = 66, N = g.toi_da / g.moi_hinh;
    svg(c, "ellipse", { cx: CX, cy: CY, rx: RX + 22, ry: RY + 22, class: "tc-ccc-bai" });
    var dongG = svg(c, "g", {}), soi = svg(dongG, "g", {}), tiaG = svg(dongG, "g", {}), dongDuc = svg(dongG, "g", {}), nguoiG = svg(dongG, "g", {}), cai = svg(c, "g", {});
    var dem = svg(c, "text", { x: CX, y: 124, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:15px" }, "");
    var hinh = [];
    for (var i = 0; i < N; i++) {
      var r = Math.sqrt((i + 0.5) / N), a = i * 2.39996;
      var x = CX + RX * r * Math.cos(a), y = CY + RY * r * Math.sin(a);
      var e = svg(nguoiG, "g", { class: "tc-ccc-nguoi" });
      svg(e, "circle", { cx: 0, cy: -9, r: 3.6 }); svg(e, "path", { d: "M0 -5 V3 M-4 -2 H4 M0 3 L-3 9 M0 3 L3 9" });
      hinh.push({ x: x, y: y, ben: x < CX ? -1 : 1, e: e });
    }
    // mỗi người nối với 2 người gần nhất đã có trước (sợi buôn chuyện)
    var day = [];
    hinh.forEach(function (h, i) {
      hinh.slice(0, i).map(function (q, j) { return { j: j, d: Math.hypot(q.x - h.x, q.y - h.y) }; }).sort(function (u, v) { return u.d - v.d; }).slice(0, 2)
        .forEach(function (q) { day.push({ a: i, b: q.j, l: svg(soi, "line", {}), h: ((i * 7919 + q.j * 104729) % 997) / 997 }); });
    });
    var n = g.dau, f = 0, daCo = -1;
    function viTri(h, k) { return { x: h.x + h.ben * 70 * k, y: h.y + (k ? (h.ben * 8 * k) : 0) }; }
    function ve() {
      var m = Math.round(n / g.moi_hinh); f = Math.max(0, Math.min(1, (n - g.dut[0]) / (g.dut[1] - g.dut[0])));
      var k = daCo >= 0 ? 0 : f * f;
      kim.setAttribute("transform", "translate(" + X(Math.min(n, g.truc_max)) + ",24)");
      hinh.forEach(function (h, i) { var p = viTri(h, k); h.p = p; h.e.setAttribute("transform", "translate(" + p.x.toFixed(1) + "," + p.y.toFixed(1) + ")"); h.e.style.display = i < m ? "" : "none"; });
      day.forEach(function (d) {
        var A = hinh[d.a].p, B = hinh[d.b].p, hien = d.a < m && daCo < 0;
        var dut = hinh[d.a].ben !== hinh[d.b].ben ? f > 0.12 : d.h < f * 0.45;
        d.l.setAttribute("x1", A.x); d.l.setAttribute("y1", A.y - 4); d.l.setAttribute("x2", B.x); d.l.setAttribute("y2", B.y - 4);
        d.l.setAttribute("class", dut ? "tc-ccc-dut" : "tc-ccc-soi"); d.l.style.display = hien ? "" : "none";
      });
      cai.innerHTML = "";
      if (daCo < 0 && f > 0.5) for (var q = 0; q < 3; q++) svg(cai, "path", { d: "M" + (CX - 8) + " " + (CY - 40 + q * 34) + " l8 -6 l-4 10 l10 -5", class: "tc-ccc-cai" });
      if (daCo < 0) dem.textContent = dien(t.dem, { n: n });
      cap.textContent = daCo >= 0 ? cap.textContent : f >= 0.9 ? t.cap_vo : f > 0.05 ? t.cap_lon : t.cap_nho;
      doan.e.classList.toggle("tc-ccc-het", n >= g.toi_da || daCo >= 0);
      co.forEach(function (o) { o.e.classList.toggle("tc-ccc-khoa", f < 0.9 && daCo < 0); });
    }
    // đoàn người mới (kéo vào bãi hoặc chạm)
    var doan = { e: svg(c, "g", { class: "tc-keo tc-ccc-doan", tabindex: "0", role: "button", "aria-label": t.doan_moi }), nha: { x: 40, y: 150 } };
    svg(doan.e, "circle", { r: 28, class: "tc-ccc-doan-v" });
    [-10, 0, 10].forEach(function (dx) { var q = svg(doan.e, "g", { class: "tc-ccc-nguoi", transform: "translate(" + dx + ",2)" }); svg(q, "circle", { cx: 0, cy: -9, r: 3.6 }); svg(q, "path", { d: "M0 -5 V3 M-4 -2 H4 M0 3 L-3 9 M0 3 L3 9" }); });
    svg(doan.e, "text", { y: -36, "text-anchor": "middle", class: "tc-t-dam" }, "+" + g.them);
    function datDoan(p) { doan.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); doan.p = p; }
    datDoan(doan.nha);
    function them() { if (daCo >= 0 || n >= g.toi_da) return; n = Math.min(g.toi_da, n + g.them); ve(); }
    // ba lá cờ
    var CO = [{ x: 548, y: 112 }, { x: 548, y: 196 }, { x: 548, y: 280 }];
    var co = t.co.map(function (o, i) {
      var e = svg(c, "g", { class: "tc-keo tc-ccc-co", tabindex: "0", role: "button", "aria-label": o.ten + ". " + o.full, "data-i": i });
      svg(e, "rect", { x: -34, y: -42, width: 68, height: 90, style: "fill:transparent" });
      svg(e, "line", { x1: -20, y1: -34, x2: -20, y2: 22, class: "tc-ccc-can" });
      var vai = svg(e, "g", { class: "tc-ccc-vai" }); svg(vai, "path", { d: "M-20 -34 h42 l-6 13 l6 13 h-42 Z", class: "tc-ccc-vai" });
      if (i === 0) { svg(vai, "circle", { cx: 0, cy: -21, r: 5, class: "tc-ccc-hinh" }); for (var q = 0; q < 8; q++) { var a = q * Math.PI / 4; svg(vai, "line", { x1: 7 * Math.cos(a), y1: -21 + 7 * Math.sin(a), x2: 10 * Math.cos(a), y2: -21 + 10 * Math.sin(a), class: "tc-ccc-net" }); } }
      if (i === 1) { svg(vai, "circle", { cx: 0, cy: -21, r: 9, class: "tc-ccc-hinh" }); svg(vai, "circle", { cx: 0, cy: -21, r: 5, class: "tc-ccc-net", style: "fill:none" }); }
      if (i === 2) svg(vai, "path", { d: "M-10 -14 v-10 l6 4 v-4 l6 4 v-4 l6 4 v-2 h3 v8 Z", class: "tc-ccc-hinh" });
      var nut_ = svg(e, "path", { d: "M-14 -30 l10 8 l-4 6 l9 6", class: "tc-ccc-nut" }); nut_.style.display = "none";
      svg(e, "text", { x: 0, y: 38, "text-anchor": "middle", class: "tc-t-nho" }, o.ten);
      var v = { e: e, i: i, vai: vai, nut: nut_, nha: CO[i] }; e.setAttribute("transform", "translate(" + CO[i].x + "," + CO[i].y + ")"); v.p = CO[i]; return v;
    });
    function datCo(v, p, muot) { v.e.style.transition = muot && !giam ? "transform .5s" : ""; v.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); v.p = p; }
    // đám đông hàng triệu (minh họa): chấm nhỏ, mỗi chấm có thứ tự "bỏ tin" riêng
    var DUC = 420, duc = [], tia = [];
    function camCo(v) {
      if (daCo >= 0) return; if (f < 0.9) { datCo(v, v.nha, true); cap.textContent = t.co_khoa; return; }
      daCo = v.i; datCo(v, { x: CX + 20, y: CY - 30 }, true); co.forEach(function (o) { if (o !== v) o.e.classList.add("tc-ccc-khac"); });
      ve(); nguoiG.style.transition = giam ? "" : "transform 1.6s ease"; nguoiG.style.transformOrigin = CX + "px " + CY + "px"; nguoiG.style.transform = "scale(.45)";
      for (var i = 0; i < DUC; i++) {
        var r = Math.sqrt(Math.random()), a = Math.random() * 2 * Math.PI, x = CX + (RX + 20) * r * Math.cos(a), y = CY + (RY + 20) * r * Math.sin(a);
        var o = svg(dongDuc, "circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.7, class: "tc-ccc-cham" }); o.style.opacity = 0;
        duc.push({ e: o, bo: Math.random() * 100 });
        if (i % 7 === 0) { var l = svg(tiaG, "line", { x1: x, y1: y, x2: CX + 20, y2: CY - 4, class: "tc-ccc-tia" }); l.style.opacity = 0; tia.push({ e: l, bo: duc[i].bo }); }
      }
      cap.textContent = dien(t.cap_co, { c: t.co[v.i].ten }) + " " + t.co[v.i].full;
      var buoc = 0, cac = [String(n)].concat(t.dem_lon);
      (function lon() {
        var f2 = Math.min(1, (buoc + 1) / cac.length);
        duc.forEach(function (d, i) { if (i < DUC * f2) d.e.style.opacity = 1; }); tia.forEach(function (d, i) { if (i < tia.length * f2) d.e.style.opacity = 1; });
        dem.textContent = buoc === 0 ? dien(t.dem, { n: n }) : cac[buoc];
        if (++buoc < cac.length) setTimeout(lon, giam ? 0 : 700); else { nh.hidden = false; }
      })();
    }
    keoSvg(c, "g.tc-ccc-doan, g.tc-ccc-co", function (e, p, b, dau) {
      var v = e === doan.e ? doan : co[+e.getAttribute("data-i")];
      if (daCo >= 0 || (v === doan && n >= g.toi_da)) return false;
      if (b === "bat") { c.appendChild(e); v.lech = null; return; }
      if (!v.lech) v.lech = { x: dau.x - v.p.x, y: dau.y - v.p.y };
      var q = { x: p.x - v.lech.x, y: p.y - v.lech.y }; if (v === doan) datDoan(q); else datCo(v, q);
    }, function (e, p) {
      if (e === doan.e) { if (!p || Math.abs(doan.p.x - CX) < RX + 30) them(); datDoan(doan.nha); return; }
      var v = co[+e.getAttribute("data-i")];
      if (!p) { if (f < 0.9) cap.textContent = t.co_khoa; else camCo(v); return; }
      if (Math.abs(v.p.x - CX) < RX + 10 && Math.abs(v.p.y - CY) < RY + 60) camCo(v); else datCo(v, v.nha, true);
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-ccc-doan, g.tc-ccc-co"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault();
      if (e === doan.e) them(); else { var v = co[+e.getAttribute("data-i")]; if (f < 0.9) cap.textContent = t.co_khoa; else camCo(v); }
    });
    th.oninput = function () {
      var p = +th.value, v = co[daCo]; nv.textContent = p + "%";
      duc.forEach(function (d) { d.e.style.opacity = d.bo < p ? 1 : 0; }); tia.forEach(function (d) { d.e.style.opacity = d.bo < p ? 1 : 0; });
      if (v) { b1Mo(v.vai, (0.3 + 0.7 * p / 100).toFixed(2)); v.nut.style.display = p <= 20 ? "" : "none"; v.vai.setAttribute("transform", p <= 20 ? "rotate(18 -20 -34)" : ""); }
      dem.textContent = p >= 60 ? t.dem_lon[2] : p >= 25 ? t.dem_lon[1] : p > 5 ? t.dem_lon[0] : "";
      cap.textContent = p <= 20 ? t.cap_sap : t.cap_tin;
      if (p <= 5 && ket.hidden) { ket.textContent = t.ket; ket.hidden = false; lai.hidden = false; }
    };
    lai.onclick = function () {
      daCo = -1; n = g.dau; duc = []; tia = []; dongDuc.innerHTML = ""; tiaG.innerHTML = ""; nguoiG.style.transform = ""; nh.hidden = true; th.value = 100; nv.textContent = "100%";
      co.forEach(function (o) { o.e.classList.remove("tc-ccc-khac"); b1Mo(o.vai, 1); o.nut.style.display = "none"; o.vai.setAttribute("transform", ""); datCo(o, o.nha); });
      ket.hidden = true; lai.hidden = true; ve(); cap.textContent = t.doc_mac;
    };
    ve(); cap.textContent = t.doc_mac;
    s.appendChild(san); s.appendChild(cap); s.appendChild(nh); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: khoảng trống trước khi đáp (nhập vai nhẹ, không điểm: đáp ngay, hoặc Dừng, Thở, Nhận, Nghĩ, Đáp) ----------
  // t.loi_sep: [dòng lời sếp]; t.doc_mac; t.nut_ngay, t.nut_dung; t.gat: [{nhan, hau_qua}]; t.tua; t.nut_thu_lai; t.buoc: [5 tên bước];
  // t.cap_dung, t.nut_tho, t.cap_tho, t.tho_xong, t.cap_nhan; t.vung: [4 chỗ trên cơ thể]; t.cap_vung {v}; t.hoi_ten; t.ten_cx: [từ]; t.cap_ten {c};
  // t.cap_nghi; t.p3: [{hoi, bi, lac}]; t.cap_dap; t.dap: [{nhan, hau_qua}]; t.trai, t.phai, t.mac_dinh (nếu chưa đáp ngay lần nào: lấy gat[0]); t.cung_nhu_toi; t.ket; t.nut_lai
  function khoangTrong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var buocH = tao("div", "tc-kt-buoc"); buocH.setAttribute("aria-hidden", "true");
    var chip = t.buoc.map(function (b, i) { var x = tao("span", "", (i + 1) + " · " + b); buocH.appendChild(x); return x; });
    var bang = tao("div", "tc-kt-bang");
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    // phòng họp
    svg(c, "rect", { x: 0, y: 236, width: 600, height: 64, class: "tc-kt-ban" });
    var sep = svg(c, "g", { class: "tc-kt-sep" });
    svg(sep, "circle", { cx: 96, cy: 128, r: 24, class: "tc-kt-da" }); svg(sep, "path", { d: "M62 236 V186 q0 -30 34 -30 q34 0 34 30 V236 Z", class: "tc-kt-ao-sep" });
    var may_ = svg(sep, "path", { d: "M84 120 l8 3 M108 120 l-8 3", class: "tc-kt-net" }), mieng = svg(sep, "path", { d: "M88 138 q8 -4 16 0", class: "tc-kt-net" });
    svg(c, "path", { d: "M24 20 h270 a12 12 0 0 1 12 12 v42 a12 12 0 0 1 -12 12 h-160 l-18 18 v-18 h-92 a12 12 0 0 1 -12 -12 v-42 a12 12 0 0 1 12 -12 Z", class: "tc-kt-boi" });
    t.loi_sep.forEach(function (l, i) { svg(c, "text", { x: 36, y: 46 + i * 20, class: "tc-kt-loi" }, l); });
    var nhom = svg(c, "g", { class: "tc-kt-nhom" });
    [236, 316].forEach(function (x) { svg(nhom, "circle", { cx: x, cy: 168, r: 16 }); svg(nhom, "path", { d: "M" + (x - 24) + " 236 V206 q0 -20 24 -20 q24 0 24 20 V236 Z" }); });
    // bạn
    var ban = svg(c, "g", {});
    svg(ban, "path", { d: "M430 236 V186 q0 -36 46 -36 q46 0 46 36 V236 Z", class: "tc-kt-ao" });
    var nguc = svg(ban, "ellipse", { cx: 476, cy: 192, rx: 34, ry: 26, class: "tc-kt-do" });
    svg(ban, "circle", { cx: 476, cy: 110, r: 32, class: "tc-kt-da" });
    var mat = svg(ban, "circle", { cx: 476, cy: 110, r: 32, class: "tc-kt-do" });
    svg(ban, "path", { d: "M464 104 v4 M488 104 v4", class: "tc-kt-net" }); var mBan = svg(ban, "path", { d: "M466 126 q10 -5 20 0", class: "tc-kt-net" });
    // cốc nước bùn
    svg(c, "path", { d: "M354 172 h52 l-5 64 h-42 Z", class: "tc-kt-coc" });
    var duc = svg(c, "path", { d: "M356 184 h48 l-4 50 h-40 Z", class: "tc-kt-duc" });
    var bun = [];
    for (var i = 0; i < 28; i++) bun.push({ e: svg(c, "circle", { r: 2.3, class: "tc-kt-bun" }), x: 362 + (i * 13) % 36, y: 190 + (i * 29) % 40, lx: 362 + (i * 5) % 36, ly: 230 - (i % 3) * 3, ph: i });
    // chỗ trên cơ thể để chạm
    var VUNG = [{ x: 476, y: 110, r: 30 }, { x: 476, y: 186, r: 24 }, { x: 476, y: 222, r: 13 }, { x: 434, y: 214, r: 14 }];
    var vungG = svg(c, "g", {}); vungG.style.display = "none";
    var vung = VUNG.map(function (v, i) { var e = svg(vungG, "circle", { cx: v.x, cy: v.y, r: v.r, class: "tc-kt-vung tc-cham-duoc", tabindex: "0", role: "button", "aria-label": t.vung[i] }); return e; });
    var DO = 0, lang = 0, giuTho = false, chay = false, tt = 0, buoc = -1, nhanh = null;
    function datDo(v) { DO = v; b1Mo(mat, (0.7 * v).toFixed(2)); b1Mo(nguc, (0.65 * v).toFixed(2)); mBan.setAttribute("d", v > 0.5 ? "M466 128 q10 -5 20 0" : "M466 124 q10 4 20 0"); }
    function veBun(ts) {
      bun.forEach(function (b) {
        var j = giam ? 0 : Math.sin((ts || 0) / 300 + b.ph) * 3 * (1 - lang);
        b.e.setAttribute("cx", (b.x + (b.lx - b.x) * lang + j).toFixed(1)); b.e.setAttribute("cy", (b.y + (b.ly - b.y) * lang + j * 0.6).toFixed(1));
      });
      b1Mo(duc, (0.55 * (1 - lang)).toFixed(2));
    }
    function vong(ts) {
      var dt = Math.min(80, ts - tt); tt = ts;
      if (giuTho && buoc === 1) { lang = Math.min(1, lang + dt / 3600); datDo(0.85 - 0.2 * lang); if (lang >= 1) cap.textContent = t.tho_xong; }
      veBun(ts);
      if ((lang < 1 && !giam) || (giuTho && lang < 1)) requestAnimationFrame(vong); else { chay = false; veBun(ts); }
    }
    function batVong() { if (!chay) { chay = true; tt = performance.now(); requestAnimationFrame(vong); } }
    function danhDau(k) { chip.forEach(function (x, i) { x.className = i < k ? "tc-kt-xong" : i === k ? "tc-kt-nay" : ""; }); }
    function nutDs(ds, lam, chinh) { var h = tao("div", "tc-hang"); ds.forEach(function (o, i) { var b = nut(o.nhan || o, !!chinh); b.onclick = function () { lam(i, b, h); }; h.appendChild(b); }); return h; }
    function xoa() { bang.innerHTML = ""; }
    function dau() {
      buoc = -1; lang = 0; giuTho = false; danhDau(-1); xoa(); ket.hidden = true; vungG.style.display = "none"; nhom.classList.remove("tc-kt-dung"); sep.classList.remove("tc-kt-gat");
      vung.forEach(function (v) { v.classList.remove("tc-kt-vung-chon"); }); veBun(0); datDo(0); cap.textContent = t.doc_mac;
      setTimeout(function () { datDo(0.85); }, giam ? 0 : 300); batVong();
      var h = tao("div", "tc-hang"), a = nut(t.nut_ngay, false), b = nut(t.nut_dung, true); h.appendChild(a); h.appendChild(b); bang.appendChild(h);
      a.onclick = function () {
        xoa(); bang.appendChild(nutDs(t.gat, function (i, x, hh) {
          nhanh = t.gat[i]; hh.querySelectorAll("button").forEach(function (y) { y.disabled = true; }); x.classList.add("tc-da-chon");
          datDo(1); sep.classList.add("tc-kt-gat"); cap.textContent = t.tua + " " + nhanh.hau_qua;
          var l = nut(t.nut_thu_lai, true); l.onclick = function () { dau(); sang(0); }; var h2 = tao("div", "tc-hang"); h2.appendChild(l); bang.appendChild(h2);
        }));
      };
      b.onclick = function () { sang(0); };
    }
    function sang(k) {
      buoc = k; danhDau(k); xoa();
      if (k === 0) { nhom.classList.add("tc-kt-dung"); cap.textContent = t.cap_dung; var h = tao("div", "tc-hang"), x = nut(t.buoc[1], true); h.appendChild(x); bang.appendChild(h); x.onclick = function () { sang(1); }; return; }
      if (k === 1) {
        cap.textContent = t.cap_tho; var gt = nut(t.nut_tho, true); gt.classList.add("tc-kt-giu"); var h1 = tao("div", "tc-hang"); h1.appendChild(gt); bang.appendChild(h1);
        // sang bước sau khi đã thả tay (chờ chút để cú chạm không rơi vào nút mới hiện)
        b1Giu(gt, function () { giuTho = true; gt.classList.add("tc-kt-dang"); batVong(); }, function () { giuTho = false; gt.classList.remove("tc-kt-dang"); if (lang >= 1 && buoc === 1) { buoc = 1.5; setTimeout(function () { sang(2); }, 350); } });
        return;
      }
      if (k === 2) {
        cap.textContent = t.cap_nhan; vungG.style.display = "";
        var chon = function (i) { if (buoc !== 2) return; vung.forEach(function (v, j) { v.classList.toggle("tc-kt-vung-chon", j === i); }); cap.textContent = dien(t.cap_vung, { v: t.vung[i] }); xoa();
          bang.appendChild(tao("p", "", t.hoi_ten)); bang.appendChild(nutDs(t.ten_cx, function (j, x, hh) {
            hh.querySelectorAll("button").forEach(function (y) { y.disabled = true; }); x.classList.add("tc-da-chon"); datDo(0.4); cap.textContent = dien(t.cap_ten, { c: t.ten_cx[j] });
            var h3 = tao("div", "tc-hang"), tiep = nut(t.buoc[3], true); tiep.onclick = function () { sang(3); }; h3.appendChild(tiep); bang.appendChild(h3);
          })); };
        vung.forEach(function (v, i) { v.onclick = function () { chon(i); }; v.onkeydown = function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chon(i); } }; });
        bang.appendChild(nutDs(t.vung, function (i) { chon(i); }));
        return;
      }
      if (k === 3) {
        vungG.style.display = "none"; cap.textContent = t.cap_nghi; var doi = 0, bg = tao("div", "tc-kt-p3");
        t.p3.forEach(function (r) {
          bg.appendChild(tao("span", "", r.hoi)); var b = nut(r.bi, false); b.classList.add("tc-kt-bi"); bg.appendChild(b);
          b.onclick = function () { if (b.classList.contains("tc-kt-lac")) return; b.classList.remove("tc-kt-bi"); b.classList.add("tc-kt-lac"); b.textContent = r.lac; doi++; datDo(0.4 - 0.08 * doi);
            if (doi === t.p3.length) { var h4 = tao("div", "tc-hang"), x = nut(t.buoc[4], true); x.onclick = function () { sang(4); }; h4.appendChild(x); bang.appendChild(h4); } };
        });
        bang.appendChild(bg); return;
      }
      if (k === 4) {
        cap.textContent = t.cap_dap;
        bang.appendChild(nutDs(t.dap, function (i, x, hh) {
          hh.querySelectorAll("button").forEach(function (y) { y.disabled = true; }); x.classList.add("tc-da-chon"); danhDau(5); datDo(0.1); sep.classList.remove("tc-kt-gat");
          var d = t.dap[i], n0 = nhanh || t.gat[0]; cap.textContent = d.hau_qua;
          ket.innerHTML = ""; var hai = tao("div", "tc-kt-hai");
          [[t.trai + (nhanh ? "" : " " + t.mac_dinh), n0], [t.phai, d]].forEach(function (q) { var o = tao("div", "tc-kt-o"); o.appendChild(tao("b", "", q[0])); o.appendChild(tao("p", "tc-kt-cau", "“" + q[1].nhan + "”")); o.appendChild(tao("p", "", q[1].hau_qua)); hai.appendChild(o); });
          ket.appendChild(hai); ket.appendChild(tao("p", "", t.cung_nhu_toi)); ket.appendChild(tao("p", "", t.ket));
          var l = nut(t.nut_lai, false); l.classList.add("tc-sau-ket"); l.onclick = function () { nhanh = null; dau(); }; ket.appendChild(l); ket.hidden = false;
        }));
      }
    }
    dau();
    s.appendChild(san); s.appendChild(buocH); s.appendChild(cap); s.appendChild(bang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 1 B KẾT THÚC ====
  // ==== ĐỢT 1 C BẮT ĐẦU ====
  // Hoạt cảnh từ 0 tới 1 trong ms (giảm chuyển động: nhảy thẳng tới cuối); trả về hàm hủy
  function cHoat(ms, buoc, xong) {
    var t0 = null, huy = false, T = giam ? 0 : ms;
    function f(ts) { if (huy) return; if (t0 === null) t0 = ts; var k = T ? Math.min(1, (ts - t0) / T) : 1; buoc(k); if (k < 1) requestAnimationFrame(f); else if (xong) xong(); }
    requestAnimationFrame(f);
    return function () { huy = true; };
  }
  // Dời một nhóm SVG bằng CSS transform (có chuyển động mượt nếu ms > 0); nhớ vị trí ở e._x, e._y
  function cDoi(e, x, y, ms, them) { e.style.transition = ms && !giam ? "transform " + ms + "ms ease" : ""; e.style.transform = "translate(" + x + "px," + y + "px)" + (them || ""); e._x = x; e._y = y; }
  // Hẹn giờ chỉ chạy khi cảnh còn trên trang (bấm Chơi lại thì cảnh cũ bị thay)
  function cHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected) fn(); }, giam ? Math.min(ms, 250) : ms); }
  function cNghin(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : "."); }
  function cChoiLai(s, lam, g, t) { var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function cBam(e, fn) { e.addEventListener("click", fn); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(ev); } }); }

  // ---------- Cảnh: bàn làm việc bị ngắt (Zeigarnik): làm 8 việc nhỏ, một bàn tay ngắt 4 việc; rồi hỏi bất ngờ đã làm những gì ----------
  // g.viec: kiểu từng việc (o, so, hat, manh, sao, dau, khoi, cay); g.ngat: số việc bị ngắt; g.tu_do: giây tự do cuối cảnh
  // g.moc / t.moc: mốc trên thước tỉ lệ (số / nhãn); g.gop / t.gop: các điểm kim nghiên cứu trượt qua; t.viec: tên việc; t.moi: thẻ mồi; t.phieu: [tiêu đề, 3 dòng]
  function banViecDo(g, t) {
    var s = khung(g, t), san = canh("tc-vd-nen"), c = svg(san, "svg", { viewBox: "0 0 600 360", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), nop = nut(t.nut_nop, true), ghi = nut(t.nut_phieu, false), lai = nut(t.nut_lai, false);
    nop.hidden = ghi.hidden = lai.hidden = true; [bd, nop, ghi, lai].forEach(function (b) { hang.appendChild(b); });
    var thuoc = tao("div", "tc-vd-thuoc"); thuoc.hidden = true;
    var phieu = tao("div", "tc-vd-phieu"); phieu.hidden = true;
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var n = g.viec.length, ngat = tron(g.viec.map(function (_, j) { return j; })).slice(0, g.ngat), trang = [], i = -1, khoa = true, pha = 0, the = [], trong = [], kq = null;
    var dai = svg(c, "g", {}), khay = g.viec.map(function (_, j) {
      var e = svg(dai, "g", { class: "tc-vd-o", transform: "translate(" + (14 + j * 72.5) + ",10)" });
      svg(e, "rect", { x: 0, y: 0, width: 64, height: 50, rx: 9 });
      svg(e, "text", { x: 32, y: 22, "text-anchor": "middle", class: "tc-t-dam" }, j + 1);
      return { e: e, dau: svg(e, "text", { x: 32, y: 42, "text-anchor": "middle", class: "tc-t-dam" }, "") };
    });
    function danhDau(j, tt) { khay[j].e.setAttribute("class", "tc-vd-o tc-vd-k-" + tt); khay[j].dau.textContent = tt === "xong" ? "✓" : tt === "do" ? "…" : ""; }
    var lam = svg(c, "g", {}), tay = svg(c, "g", { "aria-hidden": "true" });
    // bàn tay người làm thí nghiệm thò vào từ bên phải: tay áo, bàn tay, ngón, bong bóng lời
    svg(tay, "rect", { x: 0, y: -18, width: 260, height: 36, rx: 12, class: "tc-vd-ao" });
    svg(tay, "rect", { x: -40, y: -15, width: 44, height: 30, rx: 10, class: "tc-vd-da" });
    [-14, -4, 6].forEach(function (y) { svg(tay, "rect", { x: -66, y: y, width: 34, height: 8, rx: 4, class: "tc-vd-da" }); });
    svg(tay, "rect", { x: -30, y: -25, width: 18, height: 10, rx: 5, class: "tc-vd-da" });
    var bong = svg(tay, "g", {}); svg(bong, "rect", { x: -180, y: -84, width: 330, height: 42, rx: 14, class: "tc-vd-bong" });
    svg(bong, "text", { x: -15, y: -57, "text-anchor": "middle", class: "tc-t-dam" }, t.ngat_noi);
    cDoi(tay, 780, 250);
    // bàn trống lúc đầu
    svg(lam, "rect", { x: 40, y: 76, width: 520, height: 274, rx: 16, class: "tc-vd-mat" });
    cotChu(lam, 300, 205, [t.cho], "tc-t-dam");

    var SO = { o: 3, so: 5, hat: 4, manh: 3, sao: 4, dau: 3, khoi: 4, cay: 3 };
    function sao(r) { var d = ""; for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; d += (k ? "L" : "M") + (rr * Math.cos(a)).toFixed(1) + " " + (rr * Math.sin(a)).toFixed(1); } return d + "Z"; }
    function veViec(k, moi) {
      lam.innerHTML = ""; cDoi(lam, 0, 0); khoa = false;
      svg(lam, "rect", { x: 40, y: 76, width: 520, height: 274, rx: 16, class: "tc-vd-mat" });
      var N = SO[k], b = 0;
      function vat(x, y, nhan, ve, lam1) {
        var e = svg(lam, "g", { class: "tc-cham-duoc tc-vd-dich", tabindex: "0", role: "button", "aria-label": nhan });
        cDoi(e, x, y); ve(e);
        cBam(e, function () { if (khoa || e.xong) return; if (lam1(e) === false) return; e.xong = true; e.setAttribute("tabindex", "-1"); b++; moi(b, N); });
        return e;
      }
      function nh(j) { return dien(t.buoc, { n: j + 1 }); }
      var ds = [];
      for (var j = 0; j < N; j++) ds.push(j);
      if (k === "o") ds.forEach(function (j) { vat(190 + j * 110, 213, nh(j), function (e) { svg(e, "rect", { x: -40, y: -40, width: 80, height: 80, rx: 8, class: "tc-vd-hinh" }); }, function (e) { e.classList.add("tc-vd-to"); }); });
      if (k === "so") { var vt = tron([[150, 140], [300, 290], [450, 150], [215, 255], [395, 235]]);
        ds.forEach(function (j) { vat(vt[j][0], vt[j][1], String(j + 1), function (e) { svg(e, "circle", { r: 32, class: "tc-vd-hinh" }); svg(e, "text", { y: 8, "text-anchor": "middle", class: "tc-t-dam tc-vd-so" }, j + 1); },
          function (e) { if (j !== b) { e.classList.add("tc-vd-sai"); setTimeout(function () { e.classList.remove("tc-vd-sai"); }, 350); return false; } e.classList.add("tc-vd-to"); }); }); }
      if (k === "hat") { svg(lam, "path", { d: "M130 150 L470 150", class: "tc-vd-day" }); svg(lam, "circle", { cx: 130, cy: 150, r: 7, class: "tc-f-cam" });
        ds.forEach(function (j) { vat(180 + j * 80, 285, nh(j), function (e) { svg(e, "circle", { r: 22, style: "fill:" + ["#DC2626", "#2563EB", "#16A34A", "#9333EA"][j] }); svg(e, "circle", { r: 5, style: "fill:#fff;opacity:.8" }); },
          function (e) { cDoi(e, 200 + b * 62, 150, 350); }); }); }
      if (k === "manh") { var hinh = ["M-28 -28h56v56h-56Z", "M0 -32L32 26H-32Z", "M28 0A28 28 0 1 1 -28 0A28 28 0 1 1 28 0Z"], vtm = tron([190, 300, 410]);
        hinh.forEach(function (d, j) { svg(lam, "path", { d: d, class: "tc-o-cho", transform: "translate(" + (190 + j * 110) + ",150)" }); });
        ds.forEach(function (j) { vat(vtm[j], 285, nh(j), function (e) { svg(e, "path", { d: hinh[j], class: "tc-vd-manh" }); }, function (e) { cDoi(e, 190 + j * 110, 150, 350); }); }); }
      if (k === "sao") ds.forEach(function (j) { vat(165 + j * 90, 213, nh(j), function (e) { svg(e, "path", { d: sao(36), class: "tc-vd-hinh" }); }, function (e) { e.classList.add("tc-vd-to"); }); });
      if (k === "dau") ds.forEach(function (j) { vat(190 + j * 110, 213, nh(j), function (e) {
          svg(e, "rect", { x: -40, y: -55, width: 80, height: 110, rx: 4, class: "tc-f-giay tc-net-vien" }); [-30, -16, -2].forEach(function (y) { svg(e, "line", { x1: -28, x2: 28, y1: y, y2: y, class: "tc-net-mo" }); });
          var d = svg(e, "g", { class: "tc-vd-dau" }); svg(d, "circle", { cy: 26, r: 22 }); svg(d, "text", { y: 32, "text-anchor": "middle" }, "OK"); },
        function (e) { e.classList.add("tc-vd-to"); }); });
      if (k === "khoi") { svg(lam, "rect", { x: 395, y: 332, width: 70, height: 6, class: "tc-f-thep" });
        ds.forEach(function (j) { vat(110 + j * 64, 310, nh(j), function (e) { svg(e, "rect", { x: -25, y: -20, width: 50, height: 40, rx: 5, style: "fill:" + ["#F59E0B", "#0EA5E9", "#22C55E", "#EC4899"][j] + ";stroke:rgba(0,0,0,.25);stroke-width:2" }); },
          function (e) { cDoi(e, 430, 312 - b * 42, 350); }); }); }
      if (k === "cay") ds.forEach(function (j) { vat(190 + j * 110, 300, nh(j), function (e) {
          var cay = svg(svg(e, "g", { transform: "translate(0,-26)" }), "g", { class: "tc-vd-cay" });
          svg(cay, "path", { d: "M0 0 V-80", style: "stroke:#16A34A;stroke-width:5;stroke-linecap:round" });
          svg(cay, "ellipse", { cx: -16, cy: -50, rx: 16, ry: 8, style: "fill:#22C55E" }); svg(cay, "ellipse", { cx: 16, cy: -66, rx: 16, ry: 8, style: "fill:#22C55E" }); svg(cay, "circle", { cy: -84, r: 9, style: "fill:#F472B6" });
          svg(e, "path", { d: "M-30 -26 H30 L22 26 H-22 Z", style: "fill:#B45309;stroke:#78350F;stroke-width:2" }); },
        function (e) { e.classList.add("tc-vd-to"); }); });
    }
    function batViec() {
      i++; if (i >= n) { hoi(); return; }
      danhDau(i, "dang"); cap.textContent = dien(t.dang_lam, { n: i + 1, m: n, ten: t.viec[i] });
      var bi = ngat.indexOf(i) >= 0;
      veViec(g.viec[i], function (b, N) {
        if (bi && b >= Math.max(1, Math.floor(N / 2))) { khoa = true; ngatNgang(); }
        else if (b >= N) { khoa = true; trang[i] = "xong"; danhDau(i, "xong"); cap.textContent = dien(t.xong_viec, { ten: t.viec[i] }); cHen(s, batViec, 650); }
      });
    }
    function ngatNgang() {
      trang[i] = "do"; cap.textContent = "“" + t.ngat_noi + "”"; cDoi(tay, 420, 250, 450);
      cHen(s, function () {
        cDoi(tay, 900, 250, 500); cDoi(lam, 660, 0, 500); danhDau(i, "do");
        cHen(s, function () { cDoi(tay, 780, 250); batViec(); }, 600);
      }, 1200);
    }
    function vaoHop(d, vao) {
      var k = trong.indexOf(d); if (vao && k < 0) trong.push(d); if (!vao && k >= 0) trong.splice(k, 1); d.o = vao;
      the.forEach(function (x) { if (!x.o) cDoi(x.e, x.nha.x, x.nha.y, 250); x.e.setAttribute("aria-pressed", x.o ? "true" : "false"); });
      trong.forEach(function (x, k) { cDoi(x.e, 312 + (k % 2) * 140, 46 + Math.floor(k / 2) * 51, 250); });
      nop.disabled = !trong.length; cap.textContent = dien(t.da_chon, { n: trong.length });
    }
    function hoi() {
      pha = 1; lam.innerHTML = ""; cDoi(lam, 0, 0); dai.style.transition = giam ? "" : "opacity .6s"; dai.style.opacity = "0";
      cap.textContent = t.hoi_bat_ngo; nop.hidden = false; nop.disabled = true;
      svg(lam, "rect", { x: 304, y: 38, width: 290, height: 314, rx: 12, class: "tc-vd-hop" });
      svg(lam, "text", { x: 150, y: 28, "text-anchor": "middle", class: "tc-t-dam" }, t.chong);
      svg(lam, "text", { x: 449, y: 28, "text-anchor": "middle", class: "tc-t-dam" }, t.o_nho);
      var ds = g.viec.map(function (_, j) { return { ten: t.viec[j], loai: trang[j] }; }).concat(t.moi.map(function (x) { return { ten: x, loai: "moi" }; }));
      the = tron(ds).map(function (d, j) {
        var e = svg(lam, "g", { class: "tc-keo tc-vd-the", tabindex: "0", role: "button", "aria-pressed": "false", "aria-label": d.ten, "data-j": j });
        svg(e, "rect", { x: 0, y: 0, width: 136, height: 42, rx: 8 });
        svg(e, "text", { x: 68, y: 26, "text-anchor": "middle", style: d.ten.length > 17 ? "font-size:11px" : "" }, d.ten);
        d.e = e; d.o = false; d.nha = { x: 12 + (j % 2) * 144, y: 46 + Math.floor(j / 2) * 51 }; cDoi(e, d.nha.x, d.nha.y); return d;
      });
    }
    keoSvg(c, "g.tc-vd-the", function (e, p, b, dau) {
      if (pha !== 1) return false; var d = the[+e.getAttribute("data-j")];
      if (b === "bat") { lam.appendChild(e); d.lech = null; return; }
      if (!d.lech) d.lech = { x: dau.x - e._x, y: dau.y - e._y }; cDoi(e, p.x - d.lech.x, p.y - d.lech.y);
    }, function (e, p) { var d = the[+e.getAttribute("data-j")]; if (!p) vaoHop(d, !d.o); else vaoHop(d, e._x + 68 > 300); });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-vd-the"); if (!e || pha !== 1 || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var d = the[+e.getAttribute("data-j")]; vaoHop(d, !d.o); });
    nop.onclick = function () {
      pha = 2; nop.hidden = true; var I = 0, C = 0, D = 0;
      trong.forEach(function (d) { if (d.loai === "do") I++; else if (d.loai === "xong") C++; else D++; });
      the.forEach(function (d) { d.e.classList.add("tc-vd-t-" + d.loai); if (!d.o) d.e.classList.add("tc-vd-ngoai"); d.e.removeAttribute("role"); d.e.setAttribute("tabindex", "-1"); });
      var r = C ? I / C : null;
      kq = { i: I, c: C, d: D, nd: g.ngat, nx: n - g.ngat, r: r != null ? so(r, 2) : I ? t.vo_cuc : t.khong_tinh };
      cap.textContent = dien(t.dem, kq);
      cHen(s, function () { veThuoc(r, I); tuDo(); }, 2200);
    };
    function veThuoc(r, I) {
      thuoc.hidden = false;
      var cv = svg(thuoc, "svg", { viewBox: "0 0 600 178", role: "img", "aria-label": t.mo_ta_thuoc });
      var X = function (v) { return 40 + Math.min(v, 3) / 3 * 520; };
      svg(cv, "line", { x1: X(0), x2: X(3), y1: 96, y2: 96, class: "tc-thuoc" });
      [0, 1, 2, 3].forEach(function (v) { svg(cv, "line", { x1: X(v), x2: X(v), y1: 90, y2: 102, class: "tc-thuoc" }); svg(cv, "text", { x: X(v), y: 118, "text-anchor": "middle", class: "tc-c-nho" }, v === 1 ? t.ngang : v); });
      svg(cv, "line", { x1: X(1), x2: X(1), y1: 56, y2: 96, class: "tc-vach-moc" });
      var hang_ = [136, 136, 154, 172];
      g.moc.forEach(function (v, k) { var x = X(v), a = x > 470 ? "end" : x < 120 ? "start" : "middle";
        svg(cv, "circle", { cx: x, cy: 96, r: 5, class: "tc-vd-moc" }); svg(cv, "line", { x1: x, x2: x, y1: 101, y2: hang_[k] - 11, class: "tc-net-mo" });
        svg(cv, "text", { x: a === "end" ? x + 6 : a === "start" ? x - 6 : x, y: hang_[k], "text-anchor": a, class: "tc-c-nho tc-vd-chu-moc" }, t.moc[k]); });
      if (r != null || I) {
        var b = svg(cv, "g", {}); svg(b, "line", { x1: 0, x2: 0, y1: 52, y2: 94, class: "tc-vd-kim-ban" }); svg(b, "path", { d: "M-7 84 L7 84 L0 95 Z", class: "tc-vd-kim-ban-dau" });
        var xb = X(r != null ? r : 3); svg(b, "text", { x: 0, y: 46, "text-anchor": xb > 520 ? "end" : xb < 80 ? "start" : "middle", class: "tc-t-dam tc-vd-chu-ban" }, t.ban + ": " + (r != null ? so(r, 2) : "> 3")); cDoi(b, xb, 0);
      }
      var kim = svg(cv, "g", {}), chu = svg(kim, "text", { x: 0, y: 18, "text-anchor": "middle", class: "tc-t-dam" }, t.gop[0]);
      svg(kim, "line", { x1: 0, x2: 0, y1: 24, y2: 94, class: "tc-vd-kim" }); svg(kim, "path", { d: "M-8 82 L8 82 L0 95 Z", class: "tc-f-cam" });
      cDoi(kim, X(g.gop[0]), 0);
      g.gop.slice(1).forEach(function (v, k) { cHen(s, function () { cDoi(kim, X(v), 0, 900); chu.textContent = t.gop[k + 1]; }, 1500 * (k + 1)); });
    }
    var dem = 0, hen = null, xong = false;
    function tuDo() {
      pha = 3; lam.innerHTML = ""; dem = g.tu_do; cap.textContent = t.tu_do;
      var dang = trang.map(function (x, j) { return x === "do" ? j : -1; }).filter(function (j) { return j >= 0; });
      dang.forEach(function (j, k) {
        var e = svg(lam, "g", { class: "tc-cham-duoc tc-vd-o tc-vd-k-do tc-vd-sang", tabindex: "0", role: "button", "aria-label": dien(t.lam_tiep, { ten: t.viec[j] }) });
        cDoi(e, 300 + (k - (dang.length - 1) / 2) * 136 - 60, 110);
        svg(e, "rect", { x: 0, y: 0, width: 120, height: 110, rx: 12 });
        svg(e, "text", { x: 60, y: 46, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:22px" }, j + 1);
        var dauE = svg(e, "text", { x: 60, y: 78, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:20px" }, "…");
        cotChu(lam, e._x + 60, 248, [t.viec[j]], "tc-c-nho");
        cBam(e, function () { if (xong) return; e.setAttribute("class", "tc-vd-o tc-vd-k-xong"); dauE.textContent = "✓"; ketThuc(true); });
      });
      var dh = svg(lam, "text", { x: 300, y: 312, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:24px" }, dem);
      hen = setInterval(function () { if (!s.isConnected) { clearInterval(hen); return; } dem--; dh.textContent = Math.max(0, dem); if (dem <= 0) ketThuc(false); }, 1000);
    }
    function ketThuc(lamTiep) {
      if (xong) return; xong = true; clearInterval(hen);
      cap.textContent = lamTiep ? t.lam_not : t.het_tu_do;
      ket.textContent = dien(t.ket, kq) + " " + (lamTiep ? t.ket_lam_not : t.ket_khong_lam); ket.hidden = false;
      ghi.hidden = false; lai.hidden = false;
    }
    ghi.onclick = function () {
      ghi.disabled = true; phieu.innerHTML = ""; phieu.appendChild(tao("b", "", t.phieu[0]));
      var ul = tao("ol"); t.phieu.slice(1).forEach(function (x) { ul.appendChild(tao("li", "", x)); }); phieu.appendChild(ul); phieu.hidden = false;
    };
    bd.onclick = function () { bd.hidden = true; batViec(); };
    lai.onclick = function () { cChoiLai(s, banViecDo, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(thuoc); s.appendChild(ket); s.appendChild(phieu); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bàn thử mứt (Iyengar và Lepper): đẩy xe qua bàn 24 hũ rồi bàn 6 hũ; nếm, kéo hũ vào xe hoặc đi tiếp ----------
  // Rồi dòng người thật chảy qua hai bàn, và cán cân gộp nhiều nghiên cứu (D = 0,02) với bốn đèn điều kiện.
  // g.ban: [24, 6]; g.di_qua: số người đi ngang; g.ghe, g.mua: %; g.so_ghe, g.nguoi_mua: số người; t.vi: tên vị (minh họa); t.dk: 4 điều kiện ("dòng 1|dòng 2")
  function banMut(g, t) {
    var s = khung(g, t), san = canh("tc-bm-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_ban[0], true), di = nut(t.nut_di, false), lai = nut(t.nut_lai, false);
    di.hidden = lai.hidden = true; hang.appendChild(tiep); hang.appendChild(di); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var MAU = ["#B91C1C", "#9F1239", "#7E22CE", "#C2410C", "#BE123C", "#6D28D9", "#DB2777", "#A16207"];
    var nen = svg(c, "g", {});
    svg(nen, "rect", { x: 0, y: 0, width: 600, height: 122, class: "tc-bm-ke" });
    for (var k = 0; k < 30; k++) { var hh = 14 + (k * 7) % 14; svg(nen, "rect", { x: 8 + (k % 15) * 40, y: (k < 15 ? 38 : 80) - hh, width: 30, height: hh, rx: 3, class: "tc-bm-hop", style: "fill:" + ["#94A3B8", "#CBD5E1", "#A8A29E", "#D6D3D1"][k % 4] }); }
    [38, 80, 118].forEach(function (y) { svg(nen, "rect", { x: 0, y: y, width: 600, height: 4, class: "tc-bm-thanh" }); });
    var nhom = svg(c, "g", {}), xe = svg(c, "g", { "aria-hidden": "true" });
    svg(xe, "path", { d: "M0 0 L96 0 L86 48 L10 48 Z", class: "tc-bm-xe" });
    for (var v = 1; v < 4; v++) svg(xe, "line", { x1: v * 24, x2: v * 22 + 4, y1: 2, y2: 46, class: "tc-bm-xe-nan" });
    svg(xe, "path", { d: "M96 0 L112 -20", class: "tc-bm-xe-nan", style: "stroke-width:4" });
    svg(xe, "circle", { cx: 20, cy: 60, r: 8, class: "tc-f-muc" }); svg(xe, "circle", { cx: 76, cy: 60, r: 8, class: "tc-f-muc" });
    var phieuXe = svg(xe, "g", {}); svg(phieuXe, "rect", { x: 14, y: 14, width: 68, height: 22, rx: 4, class: "tc-bm-phieu" }); svg(phieuXe, "text", { x: 48, y: 30, "text-anchor": "middle", class: "tc-bm-chu-phieu" }, t.phieu);
    var gio = svg(c, "text", { x: 588, y: 24, "text-anchor": "end", class: "tc-t-dam tc-bm-gio" }, "");
    cDoi(xe, 20, 250);
    var vong = -1, t0 = 0, hen = null, ghi = [], dang = false, hu = [];
    function veBan(v) {
      nhom.innerHTML = ""; hu.forEach(function (h) { h.e.remove(); });
      var N = g.ban[v], to = N <= 8;
      svg(nhom, "rect", { x: 60, y: 128, width: 410, height: 150, rx: 8, class: "tc-bm-mat" });
      svg(nhom, "rect", { x: 60, y: 276, width: 410, height: 30, class: "tc-bm-khan" });
      svg(nhom, "text", { x: 265, y: 296, "text-anchor": "middle", class: "tc-t-trang" }, dien(t.bien, { n: N }));
      hu = tron(t.vi).slice(0, N).map(function (ten, j) {
        var x = to ? 115 + j * 60 : 97 + (j % 8) * 48, y = to ? 236 : 178 + Math.floor(j / 8) * 46;
        var e = svg(c, "g", { class: "tc-keo tc-bm-hu", tabindex: "0", role: "button", "aria-label": ten, "data-j": j });
        var b = svg(e, "g", { transform: to ? "scale(1.4)" : "" });
        svg(b, "rect", { x: -13, y: -30, width: 26, height: 30, rx: 6, class: "tc-bm-thuy" });
        svg(b, "rect", { x: -11, y: -23, width: 22, height: 13, rx: 2, style: "fill:" + MAU[j % MAU.length] });
        svg(b, "rect", { x: -11, y: -19, width: 22, height: 4, style: "fill:#FDF6E3" });
        var nap = svg(b, "rect", { x: -14, y: -37, width: 28, height: 8, rx: 3, class: "tc-bm-nap" });
        cDoi(e, x, y); return { e: e, ten: ten, nap: nap, x: x, y: y, nem: false };
      });
    }
    function nem(h) {
      if (!dang) return; if (!h.nem) { h.nem = true; ghi[vong].nem++; h.nap.setAttribute("transform", "translate(-8,-6) rotate(-25)"); }
      cap.textContent = dien(t.nem, { vi: h.ten });
    }
    function mua(h) { if (!dang) return; ghi[vong].mua = h.ten; nem(h); cDoi(h.e, 530, 262, 250); hetVong(); }
    keoSvg(c, "g.tc-bm-hu", function (e, p, b, dau) {
      var h = hu[+e.getAttribute("data-j")]; if (!dang || !h) return false;
      if (b === "bat") { c.appendChild(e); h.lech = null; return; }
      if (!h.lech) h.lech = { x: dau.x - e._x, y: dau.y - e._y }; cDoi(e, p.x - h.lech.x, p.y - h.lech.y);
    }, function (e, p) {
      var h = hu[+e.getAttribute("data-j")]; if (!h || !dang) return;
      if (!p) { nem(h); return; }
      if (e._x > 455 && e._y > 205) mua(h); else cDoi(e, h.x, h.y, 250);
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-bm-hu"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault();
      var h = hu[+e.getAttribute("data-j")]; if (h.nem) mua(h); else nem(h);
    });
    function vaoBan() {
      vong++; dang = true; veBan(vong); tiep.hidden = true; di.hidden = false; ket.hidden = true;
      ghi[vong] = { nem: 0, mua: null, giay: 0 };
      cDoi(xe, -130, 250); xe.getBoundingClientRect(); cDoi(xe, 480, 250, 900);
      cap.textContent = dien(t.cap_ban, { n: g.ban[vong] });
      t0 = performance.now(); gio.textContent = dien(t.gio, { s: 0 });
      hen = setInterval(function () { if (!s.isConnected) return clearInterval(hen); gio.textContent = dien(t.gio, { s: Math.floor((performance.now() - t0) / 1000) }); }, 250);
    }
    function hetVong() {
      dang = false; clearInterval(hen); var r = ghi[vong]; r.giay = Math.max(1, Math.round((performance.now() - t0) / 1000)); di.hidden = true;
      cHen(s, function () { cDoi(xe, 720, 250, 800); hu.forEach(function (h) { if (h.ten === r.mua) cDoi(h.e, 770, 262, 800); }); }, 300);
      cap.textContent = dien(t.xong_vong, { s: r.giay, n: r.nem, mua: r.mua ? dien(t.da_mua, { vi: r.mua }) : t.khong_mua });
      tiep.textContent = vong === 0 ? t.nut_ban[1] : t.nut_dong; tiep.hidden = false;
    }
    function dongNguoi() {
      vong = 2; tiep.hidden = true; nhom.innerHTML = ""; hu.forEach(function (h) { h.e.remove(); }); hu = []; gio.textContent = ""; nen.setAttribute("opacity", "0");
      svg(nhom, "rect", { x: 0, y: 0, width: 600, height: 340, class: "tc-bm-san" });
      var cham = [], T = 6500;
      [0, 1].forEach(function (k) {
        var y = k ? 222 : 62;
        svg(nhom, "text", { x: 10, y: y - 30, class: "tc-t-dam" }, dien(t.lan, { n: g.ban[k], d: g.di_qua[k] }));
        svg(nhom, "line", { x1: 0, x2: 600, y1: y, y2: y, class: "tc-bm-loi" });
        svg(nhom, "rect", { x: 250, y: y + 24, width: 100, height: 26, rx: 6, class: "tc-bm-mat" }); svg(nhom, "text", { x: 300, y: y + 42, "text-anchor": "middle", class: "tc-c-nho tc-bm-chu-ban" }, dien(t.ban_nho, { n: g.ban[k] }));
        svg(nhom, "rect", { x: 500, y: y + 24, width: 92, height: 26, rx: 6, class: "tc-bm-quay" }); svg(nhom, "text", { x: 546, y: y + 42, "text-anchor": "middle", class: "tc-t-trang", style: "font-size:11px" }, t.quay);
        var N = Math.round(g.di_qua[k] / 5), ghe = Math.round(N * g.ghe[k] / 100), mu = Math.max(1, Math.round(g.nguoi_mua[k] / 5));
        for (var j = 0; j < N; j++) cham.push({ e: svg(nhom, "circle", { r: 4.5, class: "tc-bm-nguoi", cx: -20, cy: y }), y: y, lech: (Math.random() - 0.5) * 14, tre: Math.random() * 0.5, loai: j < mu ? 2 : j < ghe ? 1 : 0, ox: 262 + Math.random() * 76, mx: 512 + (j % 6) * 13 });
        var c1 = svg(nhom, "text", { x: 300, y: y + 68, "text-anchor": "middle", class: "tc-t-dam", opacity: "0" }, dien(t.ghe, { p: g.ghe[k], n: g.so_ghe[k] }));
        var c2 = svg(nhom, "text", { x: 592, y: y + 88, "text-anchor": "end", class: "tc-t-dam tc-bm-chu-mua", opacity: "0" }, dien(t.mua, { p: g.mua[k], n: g.nguoi_mua[k] }));
        cham.push({ chu: [c1, c2] });
      });
      svg(nhom, "text", { x: 300, y: 334, "text-anchor": "middle", class: "tc-c-nho" }, t.moi_cham);
      var dots = cham.filter(function (d) { return d.e; });
      cHoat(T, function (f) {
        dots.forEach(function (d) {
          var u = Math.max(0, Math.min(1, (f - d.tre) / 0.5)), x, y = d.y + d.lech;
          if (d.loai === 0) x = -20 + u * 640;
          else if (u < 0.45) x = -20 + u / 0.45 * (d.ox + 20);
          else if (u < 0.65) { x = d.ox; y = d.y + 12 + d.lech / 3; }
          else { var w = (u - 0.65) / 0.35; y = d.y + 12 + d.lech / 3; if (d.loai === 2) { x = d.ox + w * (d.mx - d.ox); } else { x = d.ox + w * (640 - d.ox); y = d.y + d.lech; if (w > 0) d.e.setAttribute("class", "tc-bm-nguoi tc-hat-quen"); } }
          d.e.setAttribute("cx", x.toFixed(1)); d.e.setAttribute("cy", y.toFixed(1));
        });
      }, function () {
        cham.forEach(function (d) { if (d.chu) d.chu.forEach(function (x) { x.setAttribute("opacity", "1"); }); });
        var a = ghi[0], b = ghi[1];
        cap.textContent = dien(t.so_ban, { m1: a.mua ? t.co_mua : t.khong_mua, m2: b.mua ? t.co_mua : t.khong_mua, n1: a.nem, n2: b.nem });
        tiep.textContent = t.nut_gop; tiep.hidden = false;
      });
    }
    function canCan() {
      vong = 3; tiep.hidden = true; nhom.innerHTML = "";
      svg(nhom, "rect", { x: 0, y: 0, width: 600, height: 340, class: "tc-bm-san" });
      svg(nhom, "text", { x: 300, y: 24, "text-anchor": "middle", class: "tc-t-dam" }, t.can_tieu);
      var O = { x: 300, y: 172 }, R = 118;
      svg(nhom, "path", { d: "M" + (O.x - R) + " " + O.y + " A" + R + " " + R + " 0 0 1 " + O.x + " " + (O.y - R) + " L" + O.x + " " + O.y + " Z", class: "tc-bm-loi-ich" });
      svg(nhom, "path", { d: "M" + O.x + " " + (O.y - R) + " A" + R + " " + R + " 0 0 1 " + (O.x + R) + " " + O.y + " L" + O.x + " " + O.y + " Z", class: "tc-bm-co-hai" });
      svg(nhom, "text", { x: O.x - R - 10, y: O.y - 30, "text-anchor": "end", class: "tc-t-dam" }, t.loi);
      svg(nhom, "text", { x: O.x + R + 10, y: O.y - 30, "text-anchor": "start", class: "tc-t-dam" }, t.hai);
      var kim = svg(nhom, "g", {}); svg(kim, "line", { x1: 0, y1: 0, x2: 0, y2: -R + 10, class: "tc-bm-kim" }); svg(kim, "circle", { r: 9, class: "tc-f-muc" });
      var chuD = svg(nhom, "text", { x: O.x, y: O.y + 30, "text-anchor": "middle", class: "tc-t-dam", style: "font-size:16px", opacity: "0" }, t.d_nhan);
      var chuD2 = svg(nhom, "text", { x: O.x, y: O.y + 47, "text-anchor": "middle", class: "tc-c-nho", opacity: "0" }, t.d_nho);
      function quayKim(a) { kim.setAttribute("transform", "translate(" + O.x + "," + O.y + ") rotate(" + a + ")"); }
      quayKim(-75);
      var den = t.dk.map(function (d, k) {
        var x = 75 + k * 150, e = svg(nhom, "circle", { cx: x, cy: 262, r: 13, class: "tc-bm-den" });
        cotChu(nhom, x, 292, d.split("|"), "tc-c-nho", 14); return e;
      });
      var a = ghi[0], b = ghi[1], ban = svg(nhom, "text", { x: 75, y: 240, "text-anchor": "middle", class: "tc-t-dam tc-bm-chu-mua", opacity: "0" }, dien(t.ban_phan_van, { a: a.giay, b: b.giay }));
      svg(nhom, "text", { x: 300, y: 334, "text-anchor": "middle", class: "tc-c-nho" }, t.dk_nguon);
      cHoat(2600, function (f) { var goc = 1.2 + (-76) * Math.exp(-4 * f) * Math.cos(f * 13); quayKim(f >= 1 ? 1.2 : goc); }, function () {
        chuD.setAttribute("opacity", "1"); chuD2.setAttribute("opacity", "1");
        den.forEach(function (e, k) { cHen(s, function () { e.classList.add("tc-bm-sang"); if (!k) ban.setAttribute("opacity", "1"); if (k === den.length - 1) xong(); }, 450 * (k + 1)); });
      });
      function xong() { ket.textContent = dien(t.ket, { a: a.giay, b: b.giay }); ket.hidden = false; lai.hidden = false; cap.textContent = t.cap_can; }
    }
    tiep.onclick = function () { if (vong < 1) vaoBan(); else if (vong === 1) dongNguoi(); else if (vong === 2) canCan(); };
    di.onclick = function () { if (dang) hetVong(); };
    lai.onclick = function () { cChoiLai(s, banMut, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: vòng quay và cái mỏ neo (Tversky và Kahneman): quay (chỉ dừng ở 10 hoặc 65), rồi kéo thuyền tới số mình đoán; dây buộc thuyền vào mỏ neo ----------
  // g.quay: [10, 65]; g.ket_qua: {"10": 25, "65": 45}; g.tich: {tang: 512, giam: 2250, dung: 40320}
  function moNeo(g, t) {
    var s = khung(g, t), san = canh("tc-mn-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), quay = nut(t.nut_quay, true), cao = nut(t.nut_cao, false), thap = nut(t.nut_thap, false), chot = nut(t.nut_chot, true), phu = nut(t.nut_phu, true), bo = nut(t.nut_bo, false), lai = nut(t.nut_lai, false);
    var nuts = [quay, cao, thap, chot, phu, bo, lai]; nuts.forEach(function (b) { hang.appendChild(b); });
    function hien() { var ds = [].slice.call(arguments); nuts.forEach(function (b) { b.hidden = ds.indexOf(b) < 0; }); }
    hien(quay);
    var dap = tao("p", "tc-dap"); dap.hidden = true;
    var vp = tao("div", "tc-mn-phu"); vp.hidden = true;
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var the = tao("div", "tc-mn-the"); the.hidden = true;
    // ---- vòng quay hội chợ
    var banh = svg(c, "g", {}), O = { x: 300, y: 172 }, R = 140;
    svg(banh, "path", { d: "M300 172 L250 340 M300 172 L350 340", class: "tc-mn-chan" });
    var nut0 = svg(banh, "g", { class: "tc-keo tc-mn-banh", tabindex: "0", role: "button", "aria-label": t.nut_quay, transform: "translate(300,172)" });
    svg(nut0, "circle", { r: R + 10, class: "tc-mn-vanh" });
    var rot = svg(nut0, "g", {});
    for (var k = 0; k < 20; k++) {
      var a0 = k / 20 * 2 * Math.PI - Math.PI / 2, a1 = (k + 1) / 20 * 2 * Math.PI - Math.PI / 2, am = (a0 + a1) / 2;
      svg(rot, "path", { d: "M0 0L" + (R * Math.cos(a0)).toFixed(1) + " " + (R * Math.sin(a0)).toFixed(1) + "A" + R + " " + R + " 0 0 1 " + (R * Math.cos(a1)).toFixed(1) + " " + (R * Math.sin(a1)).toFixed(1) + "Z", class: k % 2 ? "tc-mn-o2" : "tc-mn-o1" });
      svg(rot, "text", { x: (R * 0.78 * Math.cos(am)).toFixed(1), y: (R * 0.78 * Math.sin(am) + 5).toFixed(1), "text-anchor": "middle", class: "tc-mn-so", transform: "rotate(" + (am * 180 / Math.PI + 90).toFixed(1) + " " + (R * 0.78 * Math.cos(am)).toFixed(1) + " " + (R * 0.78 * Math.sin(am)).toFixed(1) + ")" }, k * 5);
    }
    for (k = 0; k < 20; k++) { var ab = k / 20 * 2 * Math.PI; svg(nut0, "circle", { cx: ((R + 5) * Math.cos(ab)).toFixed(1), cy: ((R + 5) * Math.sin(ab)).toFixed(1), r: 3, class: "tc-mn-bong-den" + (k % 2 ? " tc-mn-le" : "") }); }
    svg(nut0, "circle", { r: 16, class: "tc-f-cam" });
    var kim = svg(banh, "g", { transform: "translate(300,18)" }); svg(kim, "path", { d: "M-13 -8 L13 -8 L0 22 Z", class: "tc-mn-kim" });
    var nhanSo = svg(banh, "text", { x: 540, y: 180, "text-anchor": "middle", class: "tc-t-dam tc-mn-so-to" }, "");
    // ---- biển, thước, mỏ neo, thuyền
    var bien = svg(c, "g", { opacity: "0", style: "pointer-events:none" });
    svg(bien, "rect", { x: 0, y: 0, width: 600, height: 100, class: "tc-mn-troi" });
    svg(bien, "rect", { x: 0, y: 100, width: 600, height: 200, class: "tc-mn-nuoc" });
    svg(bien, "path", { d: "M0 100 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0", class: "tc-mn-song" });
    svg(bien, "rect", { x: 0, y: 296, width: 600, height: 44, class: "tc-mn-day" });
    var X = function (v) { return 50 + v * 5; };
    svg(bien, "line", { x1: X(0), x2: X(100), y1: 306, y2: 306, class: "tc-thuoc" });
    for (k = 0; k <= 100; k += 10) { svg(bien, "line", { x1: X(k), x2: X(k), y1: 301, y2: 311, class: "tc-thuoc" }); svg(bien, "text", { x: X(k), y: 328, "text-anchor": "middle", class: "tc-c-nho" }, k + "%"); }
    var lopDay = svg(bien, "g", {}), lopThuyen = svg(bien, "g", {});
    function veNeo(v) {
      var e = svg(lopDay, "g", { transform: "translate(" + X(v) + ",298)" });
      svg(e, "path", { d: "M0 -46 V0 M-12 -36 H12 M-22 -12 Q-20 6 0 6 Q20 6 22 -12", class: "tc-mn-neo" }); svg(e, "circle", { cx: 0, cy: -52, r: 6, class: "tc-mn-neo", style: "fill:none" });
      svg(e, "text", { x: -12, y: -46, "text-anchor": "end", class: "tc-t-dam tc-mn-chu-neo" }, v);
      return { x: X(v), y: 246 };
    }
    function veThuyen(lop, mauBuom, nhan, yNhan) {
      var e = svg(lop, "g", {}), d = svg(lopDay, "path", { class: "tc-mn-day-neo" });
      svg(e, "path", { d: "M-36 -8 L36 -8 L26 9 L-26 9 Z", class: "tc-mn-than" }); svg(e, "line", { x1: 0, x2: 0, y1: -8, y2: -56, class: "tc-mn-cot" });
      svg(e, "path", { d: "M3 -54 L32 -14 L3 -14 Z", class: mauBuom });
      var chu = svg(e, "text", { x: 0, y: yNhan, "text-anchor": "middle", class: nhan }, "");
      return { e: e, day: d, chu: chu };
    }
    function capNhat(th, neo, v) {
      var x = X(v), y = 100, dx = x - neo.x, dy = (y + 9) - neo.y, dai = Math.hypot(dx, dy), L0 = 205, cang = dai >= L0;
      var sag = cang ? 0 : Math.min(80, (L0 - dai) * 0.9), mx = (x + neo.x) / 2 - (cang ? 0 : sag * 0.3 * Math.sign(dx || 1)), my = (y + 9 + neo.y) / 2 + sag * 0.4;
      th.day.setAttribute("d", "M" + neo.x + " " + neo.y + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + x.toFixed(1) + " " + (y + 9));
      th.day.setAttribute("class", "tc-mn-day-neo" + (cang ? " tc-mn-cang" : ""));
      th.e.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y + ") rotate(" + (cang ? -Math.sign(dx) * 7 : 0) + ")");
    }
    var th = 0, dangQuay = false, moc = null, neoBan = null, ban = null, gtBan = 0, keoDuoc = false, tl = "", truoc = null;
    function oDuoiKim(a) { return Math.floor((((-a) % 360) + 360) % 360 / 18); }
    function chayQuay() {
      if (dangQuay || moc !== null) return; dangQuay = true; quay.disabled = true;
      moc = g.quay[Math.floor(Math.random() * g.quay.length)];
      var dich = -(moc / 5 + 0.5) * 18 + (Math.random() - 0.5) * 10, a0 = th, them = ((dich - th) % 360 + 360) % 360 + 360 * 4, cu = oDuoiKim(th), lac = 0;
      cHoat(4200, function (f) {
        th = a0 + them * (1 - Math.pow(1 - f, 3)); rot.setAttribute("transform", "rotate(" + th.toFixed(2) + ")");
        var o = oDuoiKim(th); if (o !== cu) { cu = o; lac = 26; } lac *= 0.82; kim.setAttribute("transform", "translate(300,18) rotate(" + (-lac).toFixed(1) + ")");
        nhanSo.textContent = o * 5;
      }, function () {
        dangQuay = false; kim.setAttribute("transform", "translate(300,18)"); nhanSo.textContent = moc;
        nut0.setAttribute("tabindex", "-1");
        cap.textContent = dien(t.cau_1, { a: moc }); hien(cao, thap); cao.focus({ preventScroll: true });
      });
    }
    function gocCua(p) { return Math.atan2(p.y - O.y, p.x - O.x) * 180 / Math.PI; }
    keoSvg(c, "g.tc-mn-banh", function (e, p, b, dau) {
      if (dangQuay || moc !== null) return false;
      if (b === "bat") { truoc = null; return; }
      if (truoc === null) truoc = gocCua(dau);
      var a = gocCua(p), d = a - truoc; if (d > 180) d -= 360; if (d < -180) d += 360; truoc = a; th += d; rot.setAttribute("transform", "rotate(" + th.toFixed(2) + ")");
    }, function () { chayQuay(); });
    nut0.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chayQuay(); } });
    quay.onclick = chayQuay;
    function traLoi(caoHon) {
      tl = caoHon ? t.nut_cao : t.nut_thap; hien(chot);
      banh.style.transition = giam ? "" : "opacity .6s"; banh.setAttribute("opacity", "0"); banh.style.pointerEvents = "none";
      bien.style.transition = giam ? "" : "opacity .6s"; bien.setAttribute("opacity", "1"); bien.style.pointerEvents = "";
      neoBan = veNeo(moc); ban = veThuyen(lopThuyen, "tc-mn-buom", "tc-t-dam tc-mn-chu-ban", 36);
      ban.e.setAttribute("class", "tc-keo tc-mn-thuyen"); ban.e.setAttribute("tabindex", "0"); ban.e.setAttribute("role", "slider");
      ban.e.setAttribute("aria-label", t.cau_2); ban.e.setAttribute("aria-valuemin", "0"); ban.e.setAttribute("aria-valuemax", "100");
      svg(ban.e, "rect", { x: -44, y: -64, width: 88, height: 84, style: "fill:transparent" });
      keoDuoc = true; datThuyen(moc); cap.textContent = t.cau_2;
      ban.e.focus({ preventScroll: true });
    }
    function datThuyen(v) { gtBan = Math.max(0, Math.min(100, Math.round(v))); ban.chu.textContent = gtBan + "%"; ban.e.setAttribute("aria-valuenow", gtBan); capNhat(ban, neoBan, gtBan); }
    cao.onclick = function () { traLoi(true); }; thap.onclick = function () { traLoi(false); };
    keoSvg(c, "g.tc-mn-thuyen", function (e, p, b) { if (!keoDuoc) return false; if (b === "bat") return; datThuyen((p.x - 50) / 5); }, function () {});
    c.addEventListener("keydown", function (ev) {
      if (!keoDuoc || !(ev.target.closest && ev.target.closest("g.tc-mn-thuyen"))) return;
      var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[ev.key]; if (d) { ev.preventDefault(); datThuyen(gtBan + d); }
    });
    chot.onclick = function () {
      keoDuoc = false; hien(); ban.e.setAttribute("tabindex", "-1"); ban.chu.textContent = dien(t.ban_doan, { v: gtBan });
      var khac = g.quay.filter(function (x) { return x !== moc; })[0];
      g.quay.forEach(function (q, k) {
        var neo = q === moc ? neoBan : veNeo(q), nh = veThuyen(lopThuyen, k ? "tc-mn-buom-2" : "tc-mn-buom-1", "tc-t-dam tc-mn-chu-nhom", k ? -64 : -82);
        nh.chu.textContent = dien(t.nhom, { a: q, g: g.ket_qua[q] }); lopThuyen.insertBefore(nh.e, lopThuyen.firstChild);
        cHoat(1800, function (f) { capNhat(nh, neo, q + (g.ket_qua[q] - q) * (1 - Math.pow(1 - f, 2))); }, k ? function () {
          dap.textContent = dien(t.kq, { a: moc, me: gtBan, tl: tl, g: g.ket_qua[moc], b: khac, h: g.ket_qua[khac] }); dap.hidden = false;
          cap.textContent = t.cap_phu; hien(phu, bo);
        } : null);
      });
    };
    var thuTu = Math.random() < 0.5 ? "tang" : "giam", gtPhu = 0;
    phu.onclick = function () {
      hien(); vp.hidden = false; vp.innerHTML = "";
      var day = tao("p", "tc-mn-day-so", (thuTu === "tang" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]).join(" × ")), dh = tao("p", "tc-so-nho", "");
      vp.appendChild(tao("p", "", t.phu_hoi)); vp.appendChild(day); vp.appendChild(dh);
      var con = 5; dh.textContent = dien(t.con_giay, { s: con });
      var hen = setInterval(function () {
        if (!s.isConnected) return clearInterval(hen);
        con--; dh.textContent = dien(t.con_giay, { s: con });
        if (con <= 0) { clearInterval(hen); day.textContent = "? × ? × ? × ? × ? × ? × ? × ?"; day.classList.add("tc-mn-an"); dh.remove(); hoiPhu(); }
      }, 1000);
    };
    function hoiPhu() {
      var id = g.id + "-tich", nh = tao("label", "tc-o-nhap", t.phu_doan + " "); nh.htmlFor = id; var b = tao("b", "tc-so-nho", ""); nh.appendChild(b);
      var r = tao("input"); r.type = "range"; r.min = 0; r.max = 100; r.value = 50; r.id = id; nh.appendChild(r);
      function gt() { var x = Math.pow(10, 1 + r.value / 100 * 3.7), m = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / m) * m; }
      r.oninput = function () { gtPhu = gt(); b.textContent = cNghin(gtPhu); }; r.oninput();
      var c2 = nut(t.nut_chot, true), h = tao("div", "tc-hang"); h.appendChild(c2);
      vp.appendChild(nh); vp.appendChild(h); r.focus({ preventScroll: true });
      c2.onclick = function () {
        r.disabled = c2.disabled = true; h.remove();
        var cot = tao("div", "tc-mn-cot"), max = Math.max(g.tich.dung, gtPhu);
        [[t.ban, gtPhu, "tc-mn-c-ban"], [t.nhom_tang, g.tich.tang, thuTu === "tang" ? "tc-mn-c-cung" : "tc-mn-c-khac"], [t.nhom_giam, g.tich.giam, thuTu === "giam" ? "tc-mn-c-cung" : "tc-mn-c-khac"], [t.dap_an, g.tich.dung, "tc-mn-c-dung"]].forEach(function (x) {
          cot.appendChild(tao("span", "", x[0])); var o = tao("span", "tc-mn-o"), v = tao("i", x[2]); v.style.width = Math.max(0.6, x[1] / max * 100) + "%"; o.appendChild(v); cot.appendChild(o); cot.appendChild(tao("span", "tc-so-nho", cNghin(x[1])));
        });
        vp.appendChild(cot); vp.appendChild(tao("p", "tc-mn-chu-nho", dien(t.phu_kq, { day: thuTu === "tang" ? t.day_tang : t.day_giam })));
        ketThuc(true);
      };
    }
    function ketThuc(daChoiPhu) {
      hien(lai); var khac = g.quay.filter(function (x) { return x !== moc; })[0];
      ket.textContent = dien(t.ket, { a: moc, me: gtBan, g: g.ket_qua[moc], b: khac, h: g.ket_qua[khac] }); ket.hidden = false;
      the.innerHTML = ""; the.appendChild(tao("b", "", t.the_tieu)); the.appendChild(tao("p", "", t.the_chu)); the.hidden = false;
      cap.textContent = daChoiPhu ? t.cap_xong : t.cap_bo;
    }
    bo.onclick = function () { ketThuc(false); };
    lai.onclick = function () { cChoiLai(s, moNeo, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(dap); s.appendChild(vp); s.appendChild(ket); s.appendChild(the); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: sân bóng và đèn pin chú ý (Simons và Chabris): đếm đường chuyền của áo trắng; giữa chừng gorilla đi ngang, rèm đổi màu, một cầu thủ rời sân ----------
  // Rồi xem lại với "đèn pin" chỉ chiếu theo bóng áo trắng, và thanh số liệu thật. Lịch chuyền tạo từ hạt giống cố định nên xem lại y hệt lần chơi.
  // g.ms: thời lượng; g.gorilla, g.rem, g.roi: [bắt đầu, kết thúc] (ms); g.so: [%] cho t.so: [nhãn]; g.ban_so: chỉ số thanh ứng với việc của bạn
  function sanBong(g, t) {
    var s = khung(g, t), san = canh("tc-sb-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var T = g.ms, NHA = [[120, 225], [205, 305], [300, 205], [380, 300], [470, 230], [535, 305]], ROI = 5;
    var defs = svg(c, "defs", {}), idm = g.id + "-den-pin", mk = svg(defs, "mask", { id: idm, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 600, height: 340 });
    svg(mk, "rect", { x: 0, y: 0, width: 600, height: 340, fill: "#fff" }); var lo = svg(mk, "circle", { r: 62, cx: -200, cy: -200, fill: "#000" });
    var rem = svg(c, "rect", { x: 0, y: 0, width: 600, height: 122 });
    for (var k = 0; k < 15; k++) svg(c, "line", { x1: 20 + k * 40, x2: 20 + k * 40, y1: 0, y2: 122, class: "tc-sb-nep" });
    svg(c, "rect", { x: 0, y: 122, width: 600, height: 218, class: "tc-sb-san" });
    svg(c, "path", { d: "M0 160 H600 M300 160 V340 M230 340 A70 70 0 0 1 370 340", class: "tc-sb-vach" });
    // gorilla: hình bóng vẽ tay, không dùng ảnh
    var gor = svg(c, "g", { opacity: "0" });
    svg(gor, "rect", { x: -20, y: -34, width: 15, height: 36, rx: 7, class: "tc-sb-gor" }); svg(gor, "rect", { x: 5, y: -34, width: 15, height: 36, rx: 7, class: "tc-sb-gor" });
    svg(gor, "ellipse", { cx: 0, cy: -60, rx: 27, ry: 32, class: "tc-sb-gor" }); svg(gor, "circle", { cx: 0, cy: -100, r: 15, class: "tc-sb-gor" });
    svg(gor, "ellipse", { cx: 0, cy: -96, rx: 9, ry: 6, style: "fill:#57534E" });
    var tayXuong = svg(gor, "g", {}); svg(tayXuong, "rect", { x: -40, y: -80, width: 14, height: 50, rx: 7, class: "tc-sb-gor" }); svg(tayXuong, "rect", { x: 26, y: -80, width: 14, height: 50, rx: 7, class: "tc-sb-gor" });
    var tayLen = svg(gor, "g", { opacity: "0" }); svg(tayLen, "path", { d: "M-34 -82 L-14 -64 M34 -82 L14 -64", style: "stroke:#1C1917;stroke-width:14;stroke-linecap:round" });
    // cầu thủ: 0, 2, 4 áo trắng; 1, 3, 5 áo đen
    var ng = NHA.map(function (h, p) {
      var e = svg(c, "g", {}), trang = p % 2 === 0;
      svg(e, "path", { d: "M-6 0 L-4 -22 M6 0 L4 -22", class: "tc-sb-chan" });
      svg(e, "rect", { x: -12, y: -52, width: 24, height: 32, rx: 7, class: trang ? "tc-sb-ao-trang" : "tc-sb-ao-den" });
      svg(e, "circle", { cx: 0, cy: -61, r: 9, class: "tc-sb-mat" });
      return e;
    });
    var bong = [svg(c, "circle", { r: 7, class: "tc-sb-bong" }), svg(c, "circle", { r: 7, class: "tc-sb-bong tc-sb-bong-den" })];
    var toi = svg(c, "rect", { x: 0, y: 0, width: 600, height: 340, mask: "url(#" + idm + ")", class: "tc-sb-toi", opacity: "0" });
    var nhan = svg(c, "g", { opacity: "0" });
    var vGor = svg(nhan, "g", {}); svg(vGor, "ellipse", { cx: 0, cy: -60, rx: 52, ry: 70, class: "tc-sb-vong" }); svg(vGor, "text", { x: 0, y: -140, "text-anchor": "middle", class: "tc-sb-chu-sang" }, t.l_gor);
    svg(nhan, "rect", { x: 4, y: 4, width: 592, height: 114, rx: 8, class: "tc-sb-vong" }); svg(nhan, "text", { x: 300, y: 40, "text-anchor": "middle", class: "tc-sb-chu-sang" }, t.l_rem);
    var vRoi = svg(nhan, "g", {}); svg(vRoi, "ellipse", { cx: 0, cy: -32, rx: 30, ry: 44, class: "tc-sb-vong" }); svg(vRoi, "text", { x: -30, y: -84, "text-anchor": "end", class: "tc-sb-chu-sang" }, t.l_roi);
    // lịch chuyền tạo sẵn từ hạt giống: xem lại y hệt
    function rng(a) { return function () { a = a + 0x6D2B79F5 | 0; var x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
    var lich = [[], []];
    function taoLich(hat) {
      var R = rng(hat); lich = [[], []];
      [0, 1].forEach(function (d) {
        var doi = d ? [1, 3, 5] : [0, 2, 4], cam = doi[0], tt = 300 + R() * 500;
        while (tt < T - 1000) {
          var co = doi.filter(function (x) { return x !== cam && !(x === ROI && tt > g.roi[0] - 2000); });
          var den = co[Math.floor(R() * co.length)], D = 650 + R() * 200;
          lich[d].push({ tu: cam, den: den, t0: tt, D: D, kieu: R() < 0.5 ? 0 : 1 }); cam = den; tt += D + 450 + R() * 600;
        }
      });
    }
    function viTri(p, tt) {
      var h = NHA[p], w = tt / 1000, bien = giam ? 0.25 : 1, x = h[0] + 30 * bien * Math.cos(w * 0.9 + p * 1.7), y = h[1] + 12 * bien * Math.sin(w * 1.3 + p);
      if (p === ROI && tt > g.roi[0]) { var f = Math.min(1, (tt - g.roi[0]) / (g.roi[1] - g.roi[0])); x += f * (680 - x); }
      return { x: x, y: y };
    }
    function tay(p, tt) { var v = viTri(p, tt); return { x: v.x + 13, y: v.y - 40 }; }
    function viTriBong(d, tt) {
      var ds = lich[d], cam = ds.length ? ds[0].tu : d;
      for (var j = 0; j < ds.length; j++) {
        var q = ds[j]; if (tt < q.t0) break;
        if (tt < q.t0 + q.D) {
          var f = (tt - q.t0) / q.D, a = tay(q.tu, tt), b = tay(q.den, tt), x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
          if (q.kieu === 0) y -= Math.sin(Math.PI * f) * 55;
          else { var san_ = Math.max(viTri(q.tu, tt).y, viTri(q.den, tt).y) - 4; y = f < 0.5 ? a.y + (san_ - a.y) * f * 2 : san_ + (b.y - san_) * (f - 0.5) * 2; }
          return { x: x, y: y };
        }
        cam = q.den;
      }
      return tay(cam, tt);
    }
    function ve(tt) {
      var f = Math.max(0, Math.min(1, (tt - g.rem[0]) / (g.rem[1] - g.rem[0]))), m0 = [142, 44, 58], m1 = [58, 92, 148];
      rem.setAttribute("fill", "rgb(" + m0.map(function (v, i) { return Math.round(v + (m1[i] - v) * f); }).join(",") + ")");
      ng.forEach(function (e, p) { var v = viTri(p, tt); e.setAttribute("transform", "translate(" + v.x.toFixed(1) + "," + v.y.toFixed(1) + ")"); });
      var b0 = viTriBong(0, tt), b1 = viTriBong(1, tt);
      bong[0].setAttribute("cx", b0.x.toFixed(1)); bong[0].setAttribute("cy", b0.y.toFixed(1)); bong[1].setAttribute("cx", b1.x.toFixed(1)); bong[1].setAttribute("cy", b1.y.toFixed(1));
      var g0 = g.gorilla[0], g1 = g.gorilla[1], gx = null, dam = false;
      if (tt >= g0 && tt <= g1) { var u = (tt - g0) / (g1 - g0); if (u < 0.44) gx = 650 - (u / 0.44) * 320; else if (u < 0.64) { gx = 330; dam = true; } else gx = 330 - (u - 0.64) / 0.36 * 400; }
      gor.setAttribute("opacity", gx === null ? "0" : "1");
      if (gx !== null) { var nhun = dam || giam ? 0 : Math.abs(Math.sin(tt / 140)) * 4; gor.setAttribute("transform", "translate(" + gx.toFixed(1) + "," + (262 - nhun).toFixed(1) + ")"); var len = dam && Math.floor(tt / 150) % 2 === 0; tayLen.setAttribute("opacity", len ? "1" : "0"); tayXuong.setAttribute("opacity", len ? "0" : "1"); vGor.setAttribute("transform", "translate(" + gx.toFixed(1) + ",262)"); }
      vGor.setAttribute("opacity", gx === null ? "0" : "1");
      var vr = viTri(ROI, tt); vRoi.setAttribute("transform", "translate(" + vr.x.toFixed(1) + "," + vr.y.toFixed(1) + ")"); vRoi.setAttribute("opacity", tt > g.roi[0] - 800 && vr.x < 620 ? "1" : "0");
      return b0;
    }
    // giao diện
    var phu = tao("div", "tc-sb-phu"), cheDo = tao("label", "tc-sb-kho"), kho = tao("input"); kho.type = "checkbox"; cheDo.appendChild(kho); cheDo.appendChild(document.createTextNode(" " + t.che_do_kho));
    var bd = nut(t.nut_bd, true); phu.appendChild(bd); phu.appendChild(cheDo); san.appendChild(phu);
    var dem = tao("div", "tc-hang tc-sb-dem"), d1 = nut("", true), d2 = nut("", true); d1.classList.add("tc-sb-nut-dem"); d2.classList.add("tc-sb-nut-dem"); dem.appendChild(d1); dem.appendChild(d2); dem.hidden = true;
    var hoi = tao("div", "tc-sb-hoi"); hoi.hidden = true;
    var bang = tao("div", "tc-sb-cot"); bang.hidden = true;
    var hang = tao("div", "tc-hang"), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var bam = [0, 0], dangChay = false, laKho = false, hat = 0, raf = 0;
    function nhanDem() { if (laKho) { d1.textContent = dien(t.dem_bong, { n: bam[0] }); d2.textContent = dien(t.dem_dat, { n: bam[1] }); } else d1.textContent = dien(t.dem_1, { n: bam[0] }); }
    d1.onclick = function () { if (dangChay) { bam[0]++; nhanDem(); } }; d2.onclick = function () { if (dangChay) { bam[1]++; nhanDem(); } };
    function chay() {
      laKho = kho.checked; hat = (Math.random() * 1e9) | 0; taoLich(hat); bam = [0, 0]; dangChay = true;
      phu.hidden = true; dem.hidden = false; d2.hidden = !laKho; nhanDem(); d1.focus({ preventScroll: true });
      cap.textContent = laKho ? t.dan_kho : t.dan_de;
      var t0 = null;
      (function buoc(ts) {
        if (!s.isConnected) return; if (t0 === null) t0 = ts; var tt = ts - t0; ve(Math.min(tt, T));
        if (tt < T) raf = requestAnimationFrame(buoc); else xongChay();
      })(performance.now());
    }
    function xongChay() {
      dangChay = false; dem.hidden = true;
      var tr = lich[0].filter(function (q) { return q.t0 + q.D <= T; }), m = [tr.filter(function (q) { return q.kieu === 0; }).length, tr.filter(function (q) { return q.kieu === 1; }).length];
      hoi.innerHTML = "";
      hoi.appendChild(tao("p", "", laKho ? dien(t.dem_kq_kho, { b1: bam[0], m1: m[0], b2: bam[1], m2: m[1] }) : dien(t.dem_kq, { b: bam[0], m: tr.length })));
      var fs = tao("fieldset", "tc-sb-chon"); fs.appendChild(tao("legend", "", t.hoi_la));
      var o = [t.o_gor, t.o_rem, t.o_roi].map(function (x) { var l = tao("label"), i = tao("input"); i.type = "checkbox"; l.appendChild(i); l.appendChild(document.createTextNode(" " + x)); fs.appendChild(l); return i; });
      hoi.appendChild(fs);
      var xem = nut(t.nut_xem, true), h = tao("div", "tc-hang"); h.appendChild(xem); hoi.appendChild(h); hoi.hidden = false; cap.textContent = t.het_gio;
      xem.onclick = function () { var thay = o.map(function (i) { return i.checked; }); o.forEach(function (i) { i.disabled = true; }); xem.disabled = true; h.remove(); xemLai(thay); };
    }
    function xemLai(thay) {
      cap.textContent = t.den_pin; toi.setAttribute("opacity", "1"); nhan.setAttribute("opacity", "1");
      function denPin(tt) { var b = ve(tt); lo.setAttribute("cx", b.x.toFixed(1)); lo.setAttribute("cy", b.y.toFixed(1)); }
      if (giam) { denPin((g.gorilla[0] + g.gorilla[1]) / 2); vRoi.setAttribute("opacity", "1"); return soLieu(thay); }
      var t0 = null, NHANH = 2.5;
      (function buoc(ts) {
        if (!s.isConnected) return; if (t0 === null) t0 = ts; var tt = (ts - t0) * NHANH; denPin(Math.min(tt, T));
        if (tt < T) requestAnimationFrame(buoc); else { denPin((g.gorilla[0] + g.gorilla[1]) / 2); vRoi.setAttribute("opacity", "1"); soLieu(thay); }
      })(performance.now());
    }
    function soLieu(thay) {
      bang.innerHTML = ""; bang.hidden = false;
      g.so.forEach(function (v, k) {
        var r = tao("div", "tc-sb-dong" + (k === g.ban_so ? " tc-sb-cua-ban" : "")); r.appendChild(tao("span", "", t.so[k]));
        var o = tao("span", "tc-mn-o"), i = tao("i", "tc-mn-c-cung"); i.style.width = "0%"; o.appendChild(i); r.appendChild(o); r.appendChild(tao("b", "tc-so-nho", v + "%"));
        bang.appendChild(r); cHen(s, function () { i.style.width = v + "%"; }, 120 * k + 60);
      });
      var n = thay.filter(Boolean).length;
      ket.textContent = dien(t.ket_ban, { n: n }) + " " + (laKho ? t.ket_kho : t.ket_de) + " " + t.ket; ket.hidden = false; lai.hidden = false;
    }
    bd.onclick = chay;
    lai.onclick = function () { cancelAnimationFrame(raf); cChoiLai(s, sanBong, g, t); };
    taoLich(1); ve(0);
    s.appendChild(san); s.appendChild(cap); s.appendChild(dem); s.appendChild(hoi); s.appendChild(bang); s.appendChild(ket); s.appendChild(hang); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 1 C KẾT THÚC ====
  // ==== ĐỢT 1 D BẮT ĐẦU ====
  // Người hoạt hình đơn giản (đầu + thân), gốc ở chân; di chuyển bằng style.transform để có chuyển động mượt
  function dNguoi(cha, lop, k) {
    var e = svg(cha, "g", {}), b = svg(e, "g", { class: lop || "tc-dd-ng" });
    if (k && k !== 1) b.setAttribute("transform", "scale(" + k + ")");
    svg(b, "circle", { cx: 0, cy: -31, r: 9 }); svg(b, "path", { d: "M-13 0 Q-13 -20 0 -20 Q13 -20 13 0 Z" });
    e.than = b; return e;
  }
  function dDat(e, x, y, ms, them) {
    e.style.transition = ms && !giam ? "transform " + ms + "ms ease-in-out, opacity " + ms + "ms" : "";
    e.style.transform = "translate(" + x + "px," + y + "px)" + (them || ""); e.x = x; e.y = y;
  }
  function dSo(v) { return so(v, v % 1 ? 1 : 0); }

  // ---------- Cảnh: hàng photocopy (người lạ xin chen; bạn cho hay không; rồi lưới kết quả thật, gộp kiểu Gelman) ----------
  // g.nguoi: [{trang, kieu}] (kieu 0 không lý do, 1 lý do rỗng, 2 lý do thật); g.that: {"5": [3 %], "20": [3 %]}; g.n: cùng dạng (số người);
  // g.gop: [3 %], g.sai_so (điểm %). t.cau: [3 câu có {p}], t.kieu: [3 nhãn], t.trang ("{p} trang"), t.cho_them ("{n}"), t.ban_cho, t.ban_khong,
  // t.nguoi_thu {i}{n}, t.da_cho, t.da_khong, t.nut_cho, t.nut_khong, t.nut_gop, t.nut_lai, t.ket_luoi {c}{n}, t.ket_gop, t.gop_tieu, t.may, t.ban, t.doc_mac
  function mayPhoto(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 300", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), co = nut(t.nut_cho, true), khong = nut(t.nut_khong, false), gop = nut(t.nut_gop, true), lai = nut(t.nut_lai, false);
    [co, khong, gop, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var hen = [], chay = null, q = [], i = 0, kq = [], them = 0, soBan = 0, khoa = true, dem, thanh, chuThem, bong, bongChu, giay;
    function sau(f, ms) { hen.push(setTimeout(f, giam ? Math.min(ms, 80) : ms)); }
    function don() { hen.forEach(clearTimeout); hen = []; clearInterval(chay); chay = null; c.innerHTML = ""; }
    function capThem() { thanh.setAttribute("width", Math.min(230, them * 230 / 60)); chuThem.textContent = dien(t.cho_them, { n: them }); }
    function veCanh() {
      don();
      svg(c, "rect", { x: 0, y: 262, width: 600, height: 38, class: "tc-mp-san" });
      svg(c, "rect", { x: 30, y: 112, width: 160, height: 150, rx: 10, class: "tc-mp-may" });
      svg(c, "rect", { x: 24, y: 100, width: 172, height: 16, rx: 5, class: "tc-mp-nap" });
      svg(c, "rect", { x: 48, y: 130, width: 80, height: 30, rx: 5, class: "tc-mp-man" });
      dem = svg(c, "text", { x: 88, y: 151, "text-anchor": "middle", class: "tc-mp-so" }, "0");
      svg(c, "text", { x: 110, y: 230, "text-anchor": "middle", class: "tc-dd-nho" }, t.may);
      svg(c, "rect", { x: 186, y: 178, width: 44, height: 6, rx: 2, class: "tc-mp-nap" });
      giay = svg(c, "g", {});
      var ban = dNguoi(c, "tc-dd-ban", 1.5); dDat(ban, 262, 262);
      svg(c, "text", { x: 262, y: 288, "text-anchor": "middle", class: "tc-dd-chu" }, t.ban);
      chuThem = svg(c, "text", { x: 340, y: 26, class: "tc-dd-nho" }, "");
      svg(c, "rect", { x: 340, y: 36, width: 230, height: 12, rx: 6, class: "tc-mp-ray" });
      thanh = svg(c, "rect", { x: 340, y: 36, width: 0, height: 12, rx: 6, class: "tc-mp-thanh" });
      bong = svg(c, "g", { opacity: 0 });
      svg(bong, "rect", { x: 290, y: 150, width: 84, height: 30, rx: 12, class: "tc-mp-bong" }); svg(bong, "path", { d: "M318 180 L326 192 L334 180 Z", class: "tc-mp-bong" });
      bongChu = svg(bong, "text", { x: 332, y: 171, "text-anchor": "middle", class: "tc-dd-chu" }, "");
    }
    function toBay() {
      var to = svg(giay, "rect", { x: 0, y: 0, width: 26, height: 4, class: "tc-mp-to" }); dDat(to, 168, 174);
      to.getBoundingClientRect(); dDat(to, 200, 172, 500); sau(function () { to.remove(); }, 600);
    }
    function nguoiXep(p, k) {
      var e = dNguoi(c, "tc-mp-ng" + (k % 3), 1.45), x = svg(e, "g", { class: "tc-mp-xap" }), n = p.trang === 5 ? 2 : 7;
      for (var j = 0; j < n; j++) svg(x, "rect", { x: -38, y: -26 - j * 3.2, width: 26, height: 4, class: "tc-mp-to" });
      dDat(x, 0, 0); e.xap = x; e.p = p; return e;
    }
    function batDau() {
      veCanh(); q = tron(g.nguoi).map(nguoiXep); q.forEach(function (e, k) { dDat(e, 410 + k * 56, 262); });
      i = 0; kq = []; them = 0; soBan = 0; khoa = true; capThem(); ket.hidden = true; gop.hidden = lai.hidden = true; co.hidden = khong.hidden = false;
      co.disabled = khong.disabled = true; cap.textContent = t.doc_mac;
      if (!giam) chay = setInterval(function () { soBan++; dem.textContent = soBan; toBay(); }, 900);
      sau(moi, 500);
    }
    function moi() {
      var e = q[i]; dDat(e, 336, 262, 600); q.slice(i + 1).forEach(function (x, k) { dDat(x, 410 + k * 56, 262, 600); });
      sau(function () {
        bongChu.textContent = dien(t.trang, { p: e.p.trang }); bong.setAttribute("opacity", 1);
        cap.textContent = dien(t.nguoi_thu, { i: i + 1, n: q.length }) + " " + dien(t.cau[e.p.kieu], { p: e.p.trang });
        khoa = false; co.disabled = khong.disabled = false;
      }, 650);
    }
    function quyet(cho) {
      if (khoa) return; khoa = true; co.disabled = khong.disabled = true; bong.setAttribute("opacity", 0);
      var e = q[i]; kq.push({ p: e.p, cho: cho });
      if (cho) {
        them += e.p.trang; capThem(); cap.textContent = dien(t.da_cho, { p: e.p.trang });
        dDat(e.xap, 110 - 336 + 25, 108 - 262 + 26, 500); sau(function () { e.xap.style.opacity = 0; }, 500);
        var k = 0, nhip = setInterval(function () { k++; dem.textContent = k; if (k >= e.p.trang) clearInterval(nhip); }, giam ? 1 : 40); hen.push(nhip);
        sau(function () { dem.textContent = soBan; dDat(e, 700, 262, 900); e.style.opacity = 0; }, 1100);
      } else {
        cap.textContent = t.da_khong; dDat(e, 700, 262, 900); e.style.opacity = 0;
      }
      i++; if (i < q.length) sau(moi, cho ? 1500 : 900); else sau(lat, cho ? 1500 : 900);
    }
    co.onclick = function () { quyet(true); }; khong.onclick = function () { quyet(false); };
    keoSvg(c, "g.tc-mp-xap", function (e, p, buoc, dau) {
      if (khoa || !q[i] || e !== q[i].xap) return false;
      if (buoc === "di") dDat(e, p.x - dau.x, p.y - dau.y);
    }, function (e, p) { if (p && p.x < 215 && p.y < 262) quyet(true); else { dDat(e, 0, 0, 200); if (!p) cap.textContent = t.keo_goi_y; } });
    function ve(f) {
      c.innerHTML = ""; var bars = [];
      t.kieu.forEach(function (k, j) { svg(c, "text", { x: 205 + j * 152, y: 30, "text-anchor": "middle", class: "tc-dd-chu" }, k); });
      ["5", "20"].forEach(function (tr, r) {
        var y0 = 46 + r * 120;
        svg(c, "text", { x: 14, y: y0 + 50, class: "tc-dd-chu" }, dien(t.trang, { p: tr }));
        svg(c, "text", { x: 14, y: y0 + 72, class: "tc-dd-nho" }, "n = " + Math.min.apply(null, g.n[tr]) + "–" + Math.max.apply(null, g.n[tr]));
        g.that[tr].forEach(function (v, j) {
          var x0 = 135 + j * 152, minh = kq.filter(function (o) { return String(o.p.trang) === tr && o.p.kieu === j; })[0];
          svg(c, "rect", { x: x0, y: y0, width: 140, height: 104, rx: 10, class: "tc-mp-o" });
          svg(c, "text", { x: x0 + 12, y: y0 + 26, class: minh && minh.cho ? "tc-mp-co" : "tc-mp-khong" }, minh ? (minh.cho ? "✓ " + t.ban_cho : "✗ " + t.ban_khong) : "");
          svg(c, "rect", { x: x0 + 12, y: y0 + 42, width: 116, height: 14, rx: 7, class: "tc-mp-ray" });
          bars.push({ e: svg(c, "rect", { x: x0 + 12, y: y0 + 42, width: 0, height: 14, rx: 7, class: "tc-mp-cot" }), v: v });
          svg(c, "text", { x: x0 + 12, y: y0 + 88, class: "tc-mp-pt" }, dSo(v) + "%");
          svg(c, "text", { x: x0 + 128, y: y0 + 88, "text-anchor": "end", class: "tc-dd-nho" }, "n=" + g.n[tr][j]);
        });
      });
      bars.forEach(function (b) { b.e.setAttribute("width", 116 * b.v / 100 * f); });
      return bars;
    }
    function lat() {
      don(); co.hidden = khong.hidden = true; cap.textContent = t.lat_cap;
      var bars = ve(0), t0 = null, T = giam ? 1 : 900;
      (function buoc(ts) { if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T); bars.forEach(function (b) { b.e.setAttribute("width", 116 * b.v / 100 * f); }); if (f < 1) requestAnimationFrame(buoc); })(performance.now());
      var soCho = kq.filter(function (o) { return o.cho; }).length;
      ket.textContent = dien(t.ket_luoi, { c: soCho, n: kq.length }); ket.hidden = false; gop.hidden = false;
    }
    gop.onclick = function () {
      c.innerHTML = ""; gop.hidden = true; cap.textContent = t.gop_tieu;
      svg(c, "text", { x: 14, y: 26, class: "tc-dd-chu" }, t.gop_tieu);
      var Y = function (v) { return 262 - v * 1.9; };
      svg(c, "line", { x1: 60, x2: 560, y1: 262, y2: 262, class: "tc-net-vien" });
      [50, 100].forEach(function (v) { svg(c, "line", { x1: 60, x2: 560, y1: Y(v), y2: Y(v), class: "tc-net-mo" }); svg(c, "text", { x: 54, y: Y(v) + 5, "text-anchor": "end", class: "tc-dd-nho" }, v + "%"); });
      g.gop.forEach(function (v, j) {
        var x = 160 + j * 150, cot = svg(c, "rect", { x: x - 40, y: 262, width: 80, height: 0, class: "tc-mp-cot" });
        var ss = svg(c, "g", { opacity: 0 }), lo = Y(v - g.sai_so), hi = Y(v + g.sai_so);
        svg(ss, "line", { x1: x, x2: x, y1: lo, y2: hi, class: "tc-mp-ss" }); svg(ss, "line", { x1: x - 12, x2: x + 12, y1: lo, y2: lo, class: "tc-mp-ss" }); svg(ss, "line", { x1: x - 12, x2: x + 12, y1: hi, y2: hi, class: "tc-mp-ss" });
        svg(ss, "text", { x: x + 46, y: Y(v) + 8, class: "tc-mp-pt" }, dSo(v) + "%");
        svg(c, "text", { x: x, y: 286, "text-anchor": "middle", class: "tc-dd-chu" }, t.kieu[j]);
        var t0 = null, T = giam ? 1 : 800;
        (function buoc(ts) { if (!t0) t0 = ts; var f = Math.min(1, (ts - t0) / T), h = v * 1.9 * f; cot.setAttribute("y", 262 - h); cot.setAttribute("height", h); if (f < 1) requestAnimationFrame(buoc); else ss.setAttribute("opacity", 1); })(performance.now());
      });
      ketVoiNut(ket, ket.textContent + " " + t.ket_gop, null); lai.hidden = false;
    };
    lai.onclick = batDau;
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    batDau();
    return s;
  }

  // ---------- Cảnh: phòng thử thị giác (7 ghế, bạn ghế 6; nhóm nói to, bạn chọn A/B/C; biến thể đồng minh, nhóm 2 người, viết kín) ----------
  // g.luot: [{mau, abc:[3], dung, nhom, kieu: "thuong"|"nhat-tri"|"dong-minh"|"hai-nguoi"|"kin", that: số % hoặc null}]; g.dong_minh: ghế đồng minh (0-based)
  // t.ten: [6 tên], t.ban, t.mau, t.kieu {kieu: mô tả}, t.luot {n}{t}, t.den_ban, t.viet_kin, t.khac_nhom, t.theo_nhom, t.dung_ca, t.xi_xao,
  // t.chon {k}, t.nut_bd, t.nut_tiep, t.nut_xem, t.nut_lai, t.hang[6] (nhãn hàng kết quả), t.that[6] (chữ số thật), t.ban_dung, t.ban_theo, t.ket {f}{n}, t.bieu_tieu
  function phongAsch(g, t) {
    var s = khung(g, t), san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 340", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hangChon = tao("div", "tc-hang"), K = ["A", "B", "C"], chon = K.map(function (k) { var b = nut(dien(t.chon, { k: k }), false); b.onclick = function () { tra(k); }; hangChon.appendChild(b); return b; });
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), lai = nut(t.nut_lai, false); hang.appendChild(bd); hang.appendChild(lai);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var N = 7, BAN = 5, X = function (i) { return 60 + i * 80; }, hen = [], r = 0, dangChoi = false, kq = [], ghe = [], duong, hop, phieu;
    function sau(f, ms) { hen.push(setTimeout(f, giam ? Math.min(ms, 60) : ms)); }
    function veCanh() {
      hen.forEach(clearTimeout); hen = []; c.innerHTML = ""; ghe = [];
      svg(c, "line", { x1: 180, x2: 160, y1: 150, y2: 196, class: "tc-pa-chan" }); svg(c, "line", { x1: 420, x2: 440, y1: 150, y2: 196, class: "tc-pa-chan" });
      svg(c, "rect", { x: 120, y: 8, width: 360, height: 146, rx: 8, class: "tc-pa-bang" });
      svg(c, "line", { x1: 240, x2: 240, y1: 20, y2: 142, class: "tc-pa-ke" });
      duong = svg(c, "g", {});
      hop = svg(c, "g", { opacity: 0 });
      svg(hop, "rect", { x: 500, y: 100, width: 76, height: 54, rx: 6, class: "tc-pa-hop" }); svg(hop, "rect", { x: 520, y: 98, width: 36, height: 6, rx: 3, class: "tc-pa-khe" });
      svg(hop, "text", { x: 538, y: 136, "text-anchor": "middle", class: "tc-dd-trang" }, t.hop);
      for (var i = 0; i < N; i++) {
        var x = X(i), gh = svg(c, "g", {});
        svg(gh, "rect", { x: x - 18, y: 262, width: 36, height: 7, rx: 3, class: "tc-pa-ghe" }); svg(gh, "rect", { x: x - 16, y: 268, width: 4, height: 22, class: "tc-pa-ghe" }); svg(gh, "rect", { x: x + 12, y: 268, width: 4, height: 22, class: "tc-pa-ghe" });
        var ng = dNguoi(c, i === BAN ? "tc-dd-ban" : "tc-dd-ng", 1.3); dDat(ng, x, 262);
        var mat = svg(ng.than, "g", { class: "tc-pa-mat" }); svg(mat, "circle", { cx: -3.5, cy: -32, r: 2 }); svg(mat, "circle", { cx: 3.5, cy: -32, r: 2 });
        var b = svg(c, "g", { opacity: 0 });
        svg(b, "rect", { x: x - 24, y: 170, width: 48, height: 32, rx: 12, class: "tc-pa-bong" }); svg(b, "path", { d: "M" + (x - 6) + " 201 L" + x + " 210 L" + (x + 6) + " 201 Z", class: "tc-pa-bong" });
        var bc = svg(b, "text", { x: x, y: 194, "text-anchor": "middle", class: "tc-pa-chu-bong" }, "");
        var xx = svg(c, "text", { x: x, y: 166, "text-anchor": "middle", class: "tc-dd-nho", opacity: 0 }, t.xi_xao);
        svg(c, "text", { x: x, y: 312, "text-anchor": "middle", class: i === BAN ? "tc-dd-chu" : "tc-dd-nho" }, i === BAN ? t.ban : t.ten[i < BAN ? i : i - 1]);
        ghe.push({ ng: ng, mat: mat, b: b, bc: bc, xx: xx });
      }
    }
    function veDuong(L) {
      duong.innerHTML = ""; var day = 132, k = 0.75;
      svg(duong, "line", { x1: 180, x2: 180, y1: day, y2: day - L.mau * k, class: "tc-pa-net" }); svg(duong, "text", { x: 180, y: 150, "text-anchor": "middle", class: "tc-pa-chu" }, t.mau);
      L.abc.forEach(function (h, j) { var x = 300 + j * 60; svg(duong, "line", { x1: x, x2: x, y1: day, y2: day - h * k, class: "tc-pa-net" }); svg(duong, "text", { x: x, y: 150, "text-anchor": "middle", class: "tc-pa-chu" }, K[j]); });
    }
    function coMat(i, L) { return L.kieu !== "hai-nguoi" || i === BAN || i === BAN - 1 || i === BAN - 2; }
    function dap(i, L) { return L.kieu === "thuong" || (L.kieu === "dong-minh" && i === g.dong_minh) ? L.dung : L.nhom; }
    function noi(i, chu) { var o = ghe[i]; o.bc.textContent = chu; o.b.setAttribute("opacity", 1); if (!giam) { o.b.style.transition = "transform .25s"; o.b.style.transform = "translateY(6px)"; o.b.getBoundingClientRect(); o.b.style.transform = ""; } }
    function luot() {
      var L = g.luot[r]; veDuong(L); hop.setAttribute("opacity", L.kieu === "kin" ? 1 : 0); if (phieu) { phieu.remove(); phieu = null; }
      ghe.forEach(function (o, i) { o.b.setAttribute("opacity", 0); o.xx.setAttribute("opacity", 0); o.mat.setAttribute("transform", ""); o.ng.style.opacity = coMat(i, L) ? 1 : 0.12; dDat(o.ng, X(i), 262); });
      bd.hidden = true; chon.forEach(function (b) { b.disabled = true; b.classList.remove("tc-da-chon"); });
      cap.textContent = dien(t.luot, { n: r + 1, t: g.luot.length }) + " " + t.kieu[L.kieu];
      var truoc = []; for (var i = 0; i < BAN; i++) if (coMat(i, L)) truoc.push(i);
      truoc.forEach(function (i, k) { sau(function () { noi(i, dap(i, L)); }, 900 + k * 700); });
      sau(function () { cap.textContent = L.kieu === "kin" ? t.viet_kin : t.den_ban; chon.forEach(function (b) { b.disabled = false; }); }, 900 + truoc.length * 700);
    }
    function tra(k) {
      var L = g.luot[r]; chon.forEach(function (b) { b.disabled = true; b.classList.toggle("tc-da-chon", b.textContent === dien(t.chon, { k: k })); });
      kq.push({ dung: k === L.dung, theo: L.kieu !== "thuong" && k === L.nhom });
      if (L.kieu === "kin") {
        phieu = svg(c, "g", {}); svg(phieu, "rect", { x: -14, y: -10, width: 28, height: 20, rx: 2, class: "tc-mp-to" }); svg(phieu, "text", { x: 0, y: 5, "text-anchor": "middle", class: "tc-pa-chu", style: "font-size:13px" }, k);
        dDat(phieu, X(BAN), 210); phieu.getBoundingClientRect(); dDat(phieu, 538, 100, 900); sau(function () { phieu.style.opacity = 0; }, 900);
        cap.textContent = t.kin_xong;
      } else {
        noi(BAN, k);
        if (L.kieu === "thuong" ? k !== L.dung : k !== L.nhom) {
          ghe.forEach(function (o, i) { if (i !== BAN && coMat(i, L)) o.mat.setAttribute("transform", "translate(" + (i < BAN ? 3 : -3) + ",0)"); });
          [BAN - 2, BAN - 1, BAN + 1].forEach(function (i, n) { if (coMat(i, L)) sau(function () { ghe[i].xx.setAttribute("opacity", 1); }, 200 + n * 250); });
          cap.textContent = L.kieu === "thuong" ? t.sai_ca : t.khac_nhom;
        } else if (L.kieu !== "thuong") {
          ghe.forEach(function (o, i) { if (i !== BAN && coMat(i, L) && !giam) { dDat(o.ng, X(i), 266, 180); sau(function () { dDat(o.ng, X(i), 262, 180); }, 200); } });
          cap.textContent = t.theo_nhom;
        } else cap.textContent = t.dung_ca;
      }
      for (var i = BAN + 1; i < N; i++) if (coMat(i, L)) (function (i) { sau(function () { noi(i, dap(i, L)); }, 900); })(i);
      sau(function () { bd.textContent = r < g.luot.length - 1 ? t.nut_tiep : t.nut_xem; bd.hidden = false; }, 1100);
    }
    function ketQua() {
      hen.forEach(clearTimeout); hen = []; c.innerHTML = ""; bd.hidden = true; hangChon.hidden = true; cap.hidden = true;
      svg(c, "text", { x: 14, y: 24, class: "tc-dd-chu" }, t.bieu_tieu);
      g.luot.forEach(function (L, j) {
        var y = 44 + j * 48, o = kq[j];
        svg(c, "text", { x: 14, y: y + 22, class: "tc-dd-chu" }, t.hang[j]);
        var ng = dNguoi(c, o.dung ? "tc-dd-ban" : "tc-dd-ng", 0.8); dDat(ng, 250, y + 34);
        svg(c, "text", { x: 268, y: y + 26, class: "tc-dd-nho" }, o.dung ? t.ban_dung : o.theo ? t.ban_theo : t.ban_sai);
        if (L.that != null) { var w = Math.max(3, L.that * 4); var bar = svg(c, "rect", { x: 380, y: y + 10, width: 0, height: 16, rx: 4, class: "tc-mp-cot" }); (function (bar, w) { sau(function () { bar.style.transition = giam ? "" : "width .8s"; bar.setAttribute("width", w); }, 50 + j * 120); })(bar, w); }
        svg(c, "text", { x: L.that != null ? 386 + L.that * 4 : 380, y: y + 24, class: "tc-dd-nho" }, t.that[j]);
      });
      var n = g.luot.filter(function (L) { return L.kieu !== "thuong"; }).length, f = kq.filter(function (o) { return o.theo; }).length;
      ketVoiNut(ket, dien(t.ket, { f: f, n: n }), null); lai.hidden = false;
    }
    bd.onclick = function () { if (!dangChoi) { dangChoi = true; luot(); } else if (r < g.luot.length - 1) { r++; luot(); } else ketQua(); };
    function batDau() { veCanh(); r = 0; kq = []; dangChoi = false; cap.hidden = false; ket.hidden = true; lai.hidden = true; hangChon.hidden = false; bd.textContent = t.nut_bd; bd.hidden = false; chon.forEach(function (b) { b.disabled = true; b.classList.remove("tc-da-chon"); }); cap.textContent = t.doc_mac; veDuong(g.luot[0]); }
    lai.onclick = batDau;
    batDau();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hangChon); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bạn là cô giáo lớp 1 (phong bì khoanh 2 em, 3 tiết trao đồ qua 4 kênh, cây mọc; lật: danh sách là bốc thăm) ----------
  // g.tiet: số tiết; g.nhan: số em được khoanh; g.iq: [nhóm có nhãn, nhóm còn lại]; g.lop: [lớp 1, lớp 2]; g.d: [4 d theo tuần]; g.d_tb
  // t.ten: [10 tên], t.kenh: [{ten, nhom}] (4 kênh), t.phong_bi, t.but_pha, t.tiet {i}{n}, t.nut_mo, t.nut_tiep, t.nut_lat, t.nut_lai, t.chon_do {do}, t.da_cho {do}{ten},
  // t.het_tiet, t.lat {a}{b}, t.nhan_co, t.nhan_khong, t.iq_tieu, t.iq_nhom[2], t.lop_chu, t.d_tieu, t.tuan[4], t.d_chu {d}, t.ket, t.doc_mac
  function lopHoc(g, t) {
    var s = khung(g, t), N = t.ten.length, san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 380", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), mo = nut(t.nut_mo, true), tiep = nut(t.nut_tiep, true), lat = nut(t.nut_lat, true), lai = nut(t.nut_lai, false);
    [mo, tiep, lat, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket tc-lh-ket"); ket.hidden = true;
    var hen = [], em = [], nhan = [], tiet = 0, con = 0, chonDo = null, khoa = true, khay, bangChu, pb;
    function sau(f, ms) { hen.push(setTimeout(f, giam ? Math.min(ms, 60) : ms)); }
    function vt(i) { return { x: 66 + (i % 5) * 117, y: 150 + Math.floor(i / 5) * 106 }; }
    function veCanh() {
      hen.forEach(clearTimeout); hen = []; c.innerHTML = ""; em = [];
      svg(c, "rect", { x: 40, y: 8, width: 520, height: 44, rx: 6, class: "tc-lh-bang" });
      bangChu = svg(c, "text", { x: 300, y: 37, "text-anchor": "middle", class: "tc-lh-phan" }, "");
      for (var i = 0; i < N; i++) {
        var p = vt(i), o = { i: i, dem: [0, 0, 0, 0] };
        o.g = svg(c, "g", { class: "tc-cham-duoc tc-lh-cho", tabindex: "0", role: "button", "aria-label": t.ten[i], "data-i": i });
        o.nong = svg(o.g, "rect", { x: p.x - 54, y: p.y - 70, width: 108, height: 104, rx: 10, class: "tc-lh-nong", opacity: 0 });
        o.vong = svg(o.g, "rect", { x: p.x - 54, y: p.y - 70, width: 108, height: 104, rx: 10, class: "tc-lh-vong", opacity: 0 });
        var ng = dNguoi(o.g, "tc-dd-ng", 1.05); dDat(ng, p.x - 12, p.y - 4);
        svg(o.g, "rect", { x: p.x - 40, y: p.y - 12, width: 80, height: 18, rx: 4, class: "tc-lh-ban" });
        svg(o.g, "path", { d: "M" + (p.x + 18) + " " + (p.y - 22) + " h18 l-3 10 h-12 Z", class: "tc-lh-chau" });
        o.cay = svg(o.g, "line", { x1: p.x + 27, x2: p.x + 27, y1: p.y - 22, y2: p.y - 26, class: "tc-lh-cay" });
        o.la = svg(o.g, "g", {}); o.p = p;
        o.sao = svg(o.g, "text", { x: p.x - 44, y: p.y - 48, class: "tc-lh-sao", opacity: 0 }, "★");
        o.so = svg(o.g, "text", { x: p.x + 44, y: p.y - 50, "text-anchor": "end", class: "tc-dd-chu", opacity: 0 }, "");
        svg(o.g, "text", { x: p.x, y: p.y + 24, "text-anchor": "middle", class: "tc-dd-nho" }, t.ten[i]);
        o.g.addEventListener("click", (function (o) { return function () { if (chonDo != null) cho(o, chonDo); }; })(o));
        o.g.addEventListener("keydown", (function (o) { return function (ev) { if ((ev.key === "Enter" || ev.key === " ") && chonDo != null) { ev.preventDefault(); cho(o, chonDo); } }; })(o));
        em.push(o);
      }
      svg(c, "rect", { x: 70, y: 300, width: 460, height: 74, rx: 12, class: "tc-lh-khay" });
      khay = svg(c, "g", {});
      pb = svg(c, "g", {});
      svg(pb, "rect", { x: 170, y: 90, width: 260, height: 160, rx: 10, class: "tc-lh-pb" });
      svg(pb, "path", { d: "M170 92 L300 180 L430 92", class: "tc-lh-nep" });
      cotChu(pb, 300, 222, [t.phong_bi], "tc-lh-pb-chu");
    }
    function grow(o) {
      var n = o.dem.reduce(function (a, b) { return a + b; }, 0), h = 4 + Math.min(n, 9) * 6;
      o.cay.style.transition = giam ? "" : "all .5s"; o.cay.setAttribute("y2", o.p.y - 22 - h);
      o.la.innerHTML = ""; for (var k = 0; k < Math.min(n, 6); k++) svg(o.la, "ellipse", { cx: o.p.x + 27 + (k % 2 ? 6 : -6), cy: o.p.y - 28 - k * 7, rx: 5, ry: 3, class: "tc-lh-la" });
    }
    function veDo(k) {
      var x = 135 + k * 110, e = svg(khay, "g", { class: "tc-keo tc-lh-do", tabindex: "0", role: "button", "aria-label": t.kenh[k].ten + " (" + t.kenh[k].nhom + ")", "data-k": k });
      var nen = svg(e, "circle", { cx: 0, cy: 0, r: 20, class: "tc-lh-tron" });
      if (k === 0) { svg(e, "circle", { cx: -6, cy: -5, r: 2.2, class: "tc-lh-ky" }); svg(e, "circle", { cx: 6, cy: -5, r: 2.2, class: "tc-lh-ky" }); svg(e, "path", { d: "M-8 4 Q0 12 8 4", class: "tc-lh-net" }); }
      if (k === 1) { svg(e, "rect", { x: -9, y: -12, width: 18, height: 24, rx: 2, class: "tc-lh-giay" }); [-6, -1, 4].forEach(function (y) { svg(e, "line", { x1: -5, x2: 5, y1: y, y2: y, class: "tc-lh-net" }); }); }
      if (k === 2) { svg(e, "path", { d: "M-8 -11 h16 l-16 22 h16 Z", class: "tc-lh-ky" }); }
      if (k === 3) { svg(e, "path", { d: "M-12 -9 h24 v14 h-14 l-6 6 v-6 h-4 Z", class: "tc-lh-giay" }); svg(e, "text", { x: 0, y: 3, "text-anchor": "middle", class: "tc-lh-dau" }, "!"); }
      svg(khay, "text", { x: x, y: 366, "text-anchor": "middle", class: "tc-dd-nho" }, t.kenh[k].ten);
      e.nen = nen; e.k = k; e.nha = { x: x, y: 330 }; dDat(e, x, 330); return e;
    }
    function moTiet() {
      tiet++; khay.innerHTML = ""; chonDo = null; con = t.kenh.length; khoa = false;
      bangChu.textContent = dien(t.tiet, { i: tiet, n: g.tiet });
      for (var k = 0; k < t.kenh.length; k++) veDo(k);
      tiep.hidden = true; cap.textContent = t.huong_dan;
    }
    function boChon() { khay.querySelectorAll(".tc-lh-do").forEach(function (x) { x.classList.remove("tc-lh-dang"); }); }
    function cho(o, e) {
      if (khoa || !e || e.da) return; e.da = true; boChon(); chonDo = null;
      dDat(e, o.p.x + 27, o.p.y - 40, 350); sau(function () { e.style.opacity = 0; }, 350);
      o.dem[e.k]++; grow(o); con--;
      cap.textContent = dien(t.da_cho, { do: t.kenh[e.k].ten, ten: t.ten[o.i] });
      if (con === 0) { khoa = true; if (tiet < g.tiet) { tiep.textContent = dien(t.nut_tiep, { i: tiet + 1 }); tiep.hidden = false; cap.textContent = t.het_tiet; } else { lat.hidden = false; cap.textContent = t.het_ca; } }
    }
    keoSvg(c, "g.tc-lh-do", function (e, p, buoc, dau) {
      if (khoa || e.da) return false;
      if (buoc === "bat") { e.lech = null; return; }
      if (!e.lech) e.lech = { x: dau.x - e.x, y: dau.y - e.y };
      dDat(e, p.x - e.lech.x, p.y - e.lech.y);
    }, function (e, p) {
      if (!p) { boChon(); e.classList.add("tc-lh-dang"); chonDo = e; cap.textContent = dien(t.chon_do, { do: t.kenh[e.k].ten }); return; }
      var gan = null, kc = 1e9; em.forEach(function (o) { var d = Math.hypot(o.p.x - e.x, o.p.y - 20 - e.y); if (d < kc) { kc = d; gan = o; } });
      if (kc < 70) cho(gan, e); else dDat(e, e.nha.x, e.nha.y, 250);
    });
    c.addEventListener("keydown", function (ev) { var e = ev.target.closest && ev.target.closest("g.tc-lh-do"); if (!e || khoa || e.da || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); boChon(); e.classList.add("tc-lh-dang"); chonDo = e; cap.textContent = dien(t.chon_do, { do: t.kenh[e.k].ten }); });
    mo.onclick = function () {
      mo.hidden = true; nhan = tron(em.map(function (o) { return o.i; })).slice(0, g.nhan);
      pb.innerHTML = "";
      svg(pb, "rect", { x: 150, y: 70, width: 300, height: 190, rx: 10, class: "tc-lh-the" });
      cotChu(pb, 300, 104, ["Harvard Test of", "Inflected Acquisition"], "tc-lh-the-chu", 20);
      svg(pb, "text", { x: 300, y: 172, "text-anchor": "middle", class: "tc-lh-the-nho" }, t.but_pha);
      svg(pb, "text", { x: 300, y: 212, "text-anchor": "middle", class: "tc-lh-the-ten" }, nhan.map(function (i) { return t.ten[i]; }).join(" · "));
      if (!giam) { pb.style.transition = "transform .5s"; pb.style.transform = "scale(.6)"; pb.style.transformOrigin = "300px 160px"; pb.getBoundingClientRect(); pb.style.transform = ""; }
      cap.textContent = dien(t.mo_cap, { a: t.ten[nhan[0]], b: t.ten[nhan[1]] });
      sau(function () {
        pb.style.transition = giam ? "" : "opacity .5s"; pb.style.opacity = 0; sau(function () { pb.innerHTML = ""; pb.style.opacity = 1; }, 520);
        nhan.forEach(function (i) { em[i].vong.setAttribute("opacity", 1); em[i].sao.setAttribute("opacity", 1); });
        moTiet();
      }, 2600);
    };
    tiep.onclick = moTiet;
    lat.onclick = function () {
      lat.hidden = true; khay.innerHTML = "";
      var tong = em.map(function (o) { return o.dem.reduce(function (a, b) { return a + b; }, 0); }), max = Math.max.apply(null, tong.concat([1]));
      em.forEach(function (o, i) { o.nong.style.transition = giam ? "" : "opacity .8s"; o.nong.setAttribute("opacity", 0.08 + 0.42 * tong[i] / max); o.so.textContent = tong[i]; o.so.setAttribute("opacity", 1); });
      bangChu.textContent = t.bang_lat;
      function tb(ds, k) { return ds.reduce(function (a, i) { return a + (k == null ? tong[i] : em[i].dem[k]); }, 0) / ds.length; }
      var khac = em.map(function (o) { return o.i; }).filter(function (i) { return nhan.indexOf(i) < 0; });
      ket.innerHTML = "";
      ket.appendChild(tao("p", "", dien(t.lat, { a: so(tb(nhan), 1), b: so(tb(khac), 1) })));
      var nh = tao("div", "tc-lh-nhiet"); nh.appendChild(tao("span", "", "")); nh.appendChild(tao("b", "", t.nhan_co)); nh.appendChild(tao("b", "", t.nhan_khong));
      var mx = 0.01; t.kenh.forEach(function (_, k) { mx = Math.max(mx, tb(nhan, k), tb(khac, k)); });
      t.kenh.forEach(function (kn, k) {
        nh.appendChild(tao("span", "", kn.ten + " · " + kn.nhom));
        [tb(nhan, k), tb(khac, k)].forEach(function (v) { var o = tao("i", "", so(v, 1)); o.style.setProperty("--a", (0.12 + 0.88 * v / mx).toFixed(2)); nh.appendChild(o); });
      });
      ket.appendChild(nh);
      // kết quả thật
      var bd = svg(ket, "svg", { viewBox: "0 0 600 270", role: "img", "aria-label": t.bieu_mo_ta, class: "tc-lh-bd" });
      svg(bd, "text", { x: 10, y: 20, class: "tc-dd-chu" }, t.iq_tieu);
      g.iq.forEach(function (v, j) { var y = 30 + j * 30; svg(bd, "text", { x: 10, y: y + 17, class: "tc-dd-nho" }, t.iq_nhom[j]); svg(bd, "rect", { x: 200, y: y, width: v * 16, height: 22, rx: 4, class: j ? "tc-cot-xam" : "tc-mp-cot" }); svg(bd, "text", { x: 208 + v * 16, y: y + 17, class: "tc-dd-chu" }, "+" + v); });
      svg(bd, "text", { x: 10, y: 108, class: "tc-dd-nho" }, dien(t.lop_chu, { a: g.lop[0], b: g.lop[1] }));
      svg(bd, "text", { x: 10, y: 140, class: "tc-dd-chu" }, dien(t.d_tieu, { d: so(g.d_tb, 2) }));
      var y0 = 215; svg(bd, "line", { x1: 10, x2: 590, y1: y0, y2: y0, class: "tc-net-vien" });
      g.d.forEach(function (v, j) { var x = 40 + j * 140, h = Math.abs(v) * 140; svg(bd, "rect", { x: x, y: v >= 0 ? y0 - h : y0, width: 80, height: Math.max(h, 2), rx: 3, class: v > 0.1 ? "tc-mp-cot" : "tc-cot-xam" }); svg(bd, "text", { x: x + 40, y: v >= 0 ? y0 - h - 6 : y0 + 22, "text-anchor": "middle", class: "tc-dd-chu" }, so(v, 2)); svg(bd, "text", { x: x + 40, y: 262, "text-anchor": "middle", class: "tc-dd-nho" }, t.tuan[j]); });
      ket.appendChild(tao("p", "", t.ket));
      ket.hidden = false; lai.hidden = false; cap.textContent = t.lat_cap;
    };
    function batDau() { veCanh(); tiet = 0; nhan = []; khoa = true; chonDo = null; ket.hidden = true; mo.hidden = false; tiep.hidden = lat.hidden = lai.hidden = true; cap.textContent = t.doc_mac; bangChu.textContent = t.lop; }
    lai.onclick = batDau;
    batDau();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bốn mươi chiếc ghế (người đọc là nhà nghiên cứu nhìn hoàn cảnh; không có điện, không tiếng kêu, không chấm điểm) ----------
  // g.n: 40; g.goc: số người đi đến cuối ở bản gốc; g.dk: [6 %]; g.yale. t.dk: [{ten, mo}], t.hoi_doan {k}{p}, t.yale, t.nut_lat, t.lat {k}{p}, t.hoi_dk, t.nhieu, t.it,
  // t.dk_ket {ten}{p}{k}{d}, t.nut_buoc3, t.hoi_thang, t.thang[5], t.hoi_cach, t.cach[3], t.ket {b}{c}, t.bang, t.nut_lai, t.buoc[3]
  function bienThe(g, t) {
    var s = khung(g, t), N = g.n, san = canh("tc-canh-nen"), c = svg(san, "svg", { viewBox: "0 0 600 330", role: "img", "aria-label": t.mo_ta });
    var buoc = tao("p", "tc-muc", ""), cap = tao("p", "tc-cap", ""); cap.setAttribute("aria-live", "polite");
    var idT = g.id + "-doan", nh = tao("label", "tc-o-nhap", ""); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = N; th.step = 1; th.id = idT; nh.appendChild(th);
    var hang = tao("div", "tc-hang"), latB = nut(t.nut_lat, true), b3 = nut(t.nut_buoc3, true), lai = nut(t.nut_lai, false);
    var hangDk = tao("div", "tc-hang tc-bt-dk"), hangDoan = tao("div", "tc-hang"), thang = tao("div", "tc-bt-thang"), hangCach = tao("div", "tc-hang");
    [latB, b3, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var ng = [], thuTu = [], hen = [], dk = -1, bac = -1;
    function sau(f, ms) { hen.push(setTimeout(f, giam ? 0 : ms)); }
    svg(c, "rect", { x: 40, y: 10, width: 520, height: 30, rx: 6, class: "tc-bt-bang" });
    for (var k = 0; k < 30; k++) svg(c, "rect", { x: 52 + k * 16.6, y: 18, width: 10, height: 14, rx: 2, class: "tc-bt-cong" });
    svg(c, "text", { x: 300, y: 60, "text-anchor": "middle", class: "tc-dd-nho" }, t.bang);
    for (var i = 0; i < N; i++) {
      var x = 75 + (i % 8) * 64, y = 112 + Math.floor(i / 8) * 46;
      svg(c, "rect", { x: x - 15, y: y, width: 30, height: 6, rx: 2, class: "tc-bt-ghe" }); svg(c, "rect", { x: x - 15, y: y + 5, width: 4, height: 12, class: "tc-bt-ghe" }); svg(c, "rect", { x: x + 11, y: y + 5, width: 4, height: 12, class: "tc-bt-ghe" });
      var e = dNguoi(c, "tc-bt-ng", 0.85); dDat(e, x, y); e.nx = x; e.ny = y; ng.push(e);
    }
    function datNgoi(n, cham) {
      hen.forEach(clearTimeout); hen = [];
      thuTu.forEach(function (j, k) {
        var e = ng[j], dung = k >= n;
        sau(function () { dDat(e, e.nx, dung ? e.ny - 12 : e.ny, 400); e.style.opacity = dung ? 0.18 : 1; }, cham ? (dung ? (k - n) * 70 : 0) : 0);
      });
    }
    function veDoan() { var k = +th.value; nv.textContent = dien(t.hoi_doan, { k: k, p: dSo(k * 100 / N) }); ng.forEach(function (e, j) { e.than.classList.toggle("tc-bt-doan", j < k); }); }
    th.oninput = veDoan;
    latB.onclick = function () {
      th.disabled = true; latB.hidden = true; ng.forEach(function (e) { e.than.classList.remove("tc-bt-doan"); });
      datNgoi(g.goc, true);
      cap.textContent = dien(t.lat, { k: th.value, p: dSo(th.value * 100 / N) });
      sau(function () { buoc.textContent = t.buoc[1]; hangDk.hidden = false; }, 1400);
    };
    t.dk.forEach(function (d, j) {
      var b = nut(d.ten, false); hangDk.appendChild(b);
      b.onclick = function () {
        dk = j; hangDk.querySelectorAll("button").forEach(function (x) { x.classList.toggle("tc-da-chon", x === b); });
        cap.textContent = d.mo + " " + t.hoi_dk; hangDoan.hidden = false; hangDoan.querySelectorAll("button").forEach(function (x) { x.disabled = false; });
      };
    });
    [t.nhieu, t.it].forEach(function (chu, j) {
      var b = nut(chu, false); hangDoan.appendChild(b);
      b.onclick = function () {
        hangDoan.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
        var p = g.dk[dk], n = Math.round(p * N / 100); datNgoi(n, true);
        cap.textContent = dien(t.dk_ket, { ten: t.dk[dk].ten, p: dSo(p), k: n, d: chu });
        hangDk.querySelectorAll("button")[dk].classList.add("tc-bt-xem"); b3.hidden = false;
      };
    });
    b3.onclick = function () {
      b3.hidden = true; nh.hidden = true; hangDk.hidden = hangDoan.hidden = true; buoc.textContent = t.buoc[2]; cap.textContent = t.hoi_thang; thang.hidden = false;
      datNgoi(Math.round(g.tb * N / 100), false);
    };
    t.thang.forEach(function (chu, j) {
      var b = nut((j + 1) + " · " + chu, false); thang.appendChild(b);
      b.onclick = function () { bac = j; thang.querySelectorAll("button").forEach(function (x, m) { x.classList.toggle("tc-da-chon", m === j); x.classList.toggle("tc-bt-tren", m > j); }); cap.textContent = t.hoi_cach; hangCach.hidden = false; };
    });
    t.cach.forEach(function (chu) {
      var b = nut(chu, false); hangCach.appendChild(b);
      b.onclick = function () {
        hangCach.querySelectorAll("button").forEach(function (x) { x.disabled = true; x.classList.toggle("tc-da-chon", x === b); }); thang.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
        ket.textContent = dien(t.ket, { b: bac + 1, c: chu }); ket.hidden = false; lai.hidden = false; cap.textContent = t.cuoi;
      };
    });
    function batDau() {
      hen.forEach(clearTimeout); hen = []; thuTu = tron(ng.map(function (_, j) { return j; })); dk = -1; bac = -1;
      ng.forEach(function (e) { dDat(e, e.nx, e.ny); e.style.opacity = 1; });
      nh.hidden = false; th.disabled = false; th.value = 20; veDoan(); buoc.textContent = t.buoc[0]; cap.textContent = t.yale;
      latB.hidden = false; b3.hidden = lai.hidden = true; hangDk.hidden = hangDoan.hidden = thang.hidden = hangCach.hidden = true; ket.hidden = true;
      [hangDk, thang, hangCach].forEach(function (h) { h.querySelectorAll("button").forEach(function (x) { x.disabled = false; x.classList.remove("tc-da-chon", "tc-bt-xem", "tc-bt-tren"); }); });
    }
    lai.onclick = batDau;
    batDau();
    [san, buoc, cap, nh, hangDk, hangDoan, thang, hangCach, hang, ket].forEach(function (x) { s.appendChild(x); });
    chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 1 D KẾT THÚC ====
  // ==== ĐỢT 2 G BẮT ĐẦU ====
  // ---------- Cảnh: ly giờ luyện (chọn lĩnh vực, kéo vạch đoán, rót giờ luyện vào ly "khác biệt thành tích") ----------
  // g.linh_vuc: [% giờ luyện giải thích, theo thứ tự t.linh_vuc]; g.doan: vạch đoán ban đầu (%)
  // t: linh_vuc [{ten, so, ghi?}], chon, da_chon {l}, binh (\n xuống dòng), coc, con_lai, vach, doan {p}, nut_rot, nut_lai, ket_doan {l}{d}{s}, ket, cap_con_lai
  function lyGioLuyen(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi tc-lg-san"), c = svg(san, "svg", { viewBox: "0 0 600 360", role: "img", "aria-label": t.mo_ta });
    var chon = tao("div", "tc-hang tc-lg-chon"); chon.setAttribute("role", "group"); chon.setAttribute("aria-label", t.chon);
    var hang = tao("div", "tc-hang"), rot = nut(t.nut_rot, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(rot); hang.appendChild(lai);
    var cap = tao("p", "tc-cap", t.chon); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var GT = 80, GD = 320, GH = GD - GT, cid = g.id + "-ly";
    function Y(p) { return GD - GH * p / 100; }
    // cái ly: hình thang, chất lỏng cắt theo lòng ly
    var hinhLy = "M222 " + GT + " L378 " + GT + " L364 " + GD + " L236 " + GD + " Z";
    var defs = svg(c, "defs", {}), cp = svg(defs, "clipPath", { id: cid }); svg(cp, "path", { d: hinhLy });
    svg(c, "path", { d: hinhLy, class: "tc-lg-long" });
    var long = svg(c, "g", { "clip-path": "url(#" + cid + ")" });
    var nuoc = svg(long, "rect", { x: 200, y: GD, width: 200, height: 0, class: "tc-lg-nuoc" });
    var mat = svg(long, "ellipse", { cx: 300, cy: GD, rx: 80, ry: 4, class: "tc-lg-mat" });
    var dong = svg(c, "path", { d: "", class: "tc-lg-dong" });
    svg(c, "path", { d: "M222 " + GT + " L236 " + GD + " L364 " + GD + " L378 " + GT, class: "tc-lg-vo" });
    [0, 25, 50, 75, 100].forEach(function (p) { var xv = 364 + 14 * p / 100; svg(c, "line", { x1: xv - 8, x2: xv, y1: Y(p), y2: Y(p), class: "tc-lg-khac" }); svg(c, "text", { x: xv + 6, y: Y(p) + 4, class: "tc-lg-so" }, p + "%"); });
    svg(c, "text", { x: 300, y: 344, "text-anchor": "middle", class: "tc-lg-nhan" }, t.coc);
    var chuNuoc = svg(c, "text", { x: 300, y: GD - 8, "text-anchor": "middle", class: "tc-lg-chu-nuoc" }, "");
    var chuCon = svg(c, "text", { x: 300, y: GT + 34, "text-anchor": "middle", class: "tc-lg-chu-con", opacity: "0" }, t.con_lai);
    // bình giờ luyện: nghiêng khi rót
    var binh = svg(c, "g", {}); svg(binh, "path", { d: "M-34 -50 L30 -50 L40 -36 L30 -36 L30 40 Q30 50 20 50 L-24 50 Q-34 50 -34 40 Z", class: "tc-lg-binh" });
    svg(binh, "rect", { x: -28, y: -10, width: 52, height: 54, rx: 6, class: "tc-lg-nuoc" });
    svg(binh, "path", { d: "M-34 -30 Q-58 -20 -56 6 Q-54 26 -34 26", class: "tc-lg-quai" });
    var chuBinh = svg(c, "g", {}); cotChu(chuBinh, 100, 186, String(t.binh).split("\n"), "tc-lg-nhan", 16);
    function datBinh(r) { binh.setAttribute("transform", "translate(100,110) rotate(" + r + " 30 -40)"); } datBinh(0);
    // vạch đoán kéo được
    var doan = g.doan, tay = svg(c, "g", { class: "tc-keo tc-lg-tay", tabindex: "0", role: "slider", "aria-label": t.vach, "aria-valuemin": "0", "aria-valuemax": "100" });
    svg(tay, "rect", { x: 160, y: -34, width: 230, height: 52, style: "fill:transparent" });
    svg(tay, "line", { x1: 214, x2: 386, y1: 0, y2: 0, class: "tc-lg-vach" });
    svg(tay, "circle", { cx: 200, cy: 0, r: 14, class: "tc-lg-num" }); svg(tay, "path", { d: "M195 -3 L200 -8 L205 -3 M195 3 L200 8 L205 3", class: "tc-lg-mui" });
    var chuDoan = svg(tay, "text", { x: 200, y: -20, "text-anchor": "middle", class: "tc-lg-chu-doan" }, "");
    function datDoan(p) { doan = Math.max(0, Math.min(100, Math.round(p))); tay.setAttribute("transform", "translate(0," + Y(doan) + ")"); chuDoan.textContent = dien(t.doan, { p: doan }); tay.setAttribute("aria-valuenow", doan); tay.setAttribute("aria-valuetext", doan + "%"); }
    datDoan(doan);
    // kệ ống: kết quả từng lĩnh vực đã rót
    var ong = g.linh_vuc.map(function (v, i) {
      var y = 96 + i * 46, o = svg(c, "g", {});
      svg(o, "text", { x: 440, y: y, class: "tc-lg-ten-ong" }, t.linh_vuc[i].ten);
      svg(o, "rect", { x: 440, y: y + 7, width: 146, height: 12, rx: 6, class: "tc-lg-ong" });
      var day = svg(o, "rect", { x: 440, y: y + 7, width: 0, height: 12, rx: 6, class: "tc-lg-nuoc" });
      var so2 = svg(o, "text", { x: 586, y: y, "text-anchor": "end", class: "tc-lg-so" }, "?");
      return { day: day, so: so2, xong: false };
    });
    svg(c, "text", { x: 440, y: 330, class: "tc-lg-so" }, "0"); svg(c, "text", { x: 586, y: 330, "text-anchor": "end", class: "tc-lg-so" }, "100%");
    var dang = 0, dangRot = false, daRot = false, nutLv = [];
    function datMuc(p) { var y = Y(p); nuoc.setAttribute("y", y); nuoc.setAttribute("height", GD - y + 2); mat.setAttribute("cy", y); mat.style.opacity = p > 0.3 ? "1" : "0"; }
    function chonLv(i) {
      if (dangRot) return; dang = i; daRot = false; nutLv.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); b.classList.toggle("tc-chinh", k === i); });
      datMuc(0); chuNuoc.textContent = ""; chuCon.setAttribute("opacity", "0"); rot.disabled = false; cap.textContent = dien(t.da_chon, { l: t.linh_vuc[i].ten });
    }
    t.linh_vuc.forEach(function (lv, i) { var b = nut(lv.ten, false); b.setAttribute("aria-pressed", "false"); b.onclick = function () { chonLv(i); }; nutLv.push(b); chon.appendChild(b); });
    keoSvg(c, "g.tc-lg-tay", function (e, p, buoc) { if (dangRot) return false; if (buoc === "di") datDoan((GD - p.y) * 100 / GH); }, function (e, p) { if (p) datDoan((GD - p.y) * 100 / GH); });
    tay.addEventListener("keydown", function (ev) {
      var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[ev.key]; if (!d || dangRot) return;
      ev.preventDefault(); datDoan(doan + d);
    });
    function xongRot() {
      var v = g.linh_vuc[dang], lv = t.linh_vuc[dang]; dangRot = false; daRot = true; datBinh(0); dong.setAttribute("d", "");
      chuNuoc.textContent = lv.so; chuNuoc.setAttribute("y", Math.min(GD - 8, Y(v) - 8)); chuCon.setAttribute("opacity", "1");
      var o = ong[dang]; o.xong = true; o.day.setAttribute("width", Math.max(4, 146 * v / 100)); o.so.textContent = lv.so;
      cap.textContent = t.cap_con_lai + (lv.ghi ? " " + lv.ghi : "");
      ket.textContent = dien(t.ket_doan, { l: lv.ten, d: doan, s: lv.so }) + " " + t.ket; ket.hidden = false; lai.hidden = false;
      nutLv.forEach(function (b) { b.disabled = false; });
    }
    rot.onclick = function () {
      if (dangRot) return; if (daRot) datMuc(0);
      dangRot = true; rot.disabled = true; chuNuoc.textContent = ""; chuCon.setAttribute("opacity", "0"); nutLv.forEach(function (b) { b.disabled = true; });
      var v = g.linh_vuc[dang];
      if (giam) { datMuc(v); xongRot(); return; }
      datBinh(-50); var t0 = null;
      (function chay(ts) {
        if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1700), muc = v * Math.min(1, Math.max(0, (k - 0.15) / 0.75)), yb = Y(muc), lac = Math.sin(ts / 90) * 2;
        datMuc(muc);
        dong.setAttribute("d", k > 0.06 && k < 0.92 ? "M158 66 Q 210 66 " + (297 + lac) + " " + yb + " L " + (303 + lac) + " " + yb + " Q 214 74 162 72 Z" : "");
        mat.setAttribute("ry", 3 + Math.sin(ts / 70) * 1.5);
        if (k < 1) requestAnimationFrame(chay); else xongRot();
      })(performance.now());
    };
    lai.onclick = function () {
      ong.forEach(function (o) { o.xong = false; o.day.setAttribute("width", 0); o.so.textContent = "?"; });
      ket.hidden = true; lai.hidden = true; datDoan(g.doan); chonLv(0);
    };
    chonLv(0);
    s.appendChild(chon); s.appendChild(san); s.appendChild(hang); s.appendChild(cap); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bể cá học giờ ăn (đoán, tua vài ngày, rồi thả dây câu lần ngược con số "8 giây") ----------
  // g.ngay: số ngày tua (minh họa); g.gio_an: chỗ khung giờ ăn 1 giờ trên trục một ngày (0..1, minh họa)
  // t: doan_hoi, doan [2 lựa chọn], mot_ngay, gio_an, can, ngay {d}{n}, bam (\n), sau_ca [2 câu theo lựa chọn],
  //    cau_hoi, mo_ta_2, loi_don, chuoi [{tieu, dong}] (ô cuối là ô trống), day_cau, nut_tha, nut_lai, ket
  function beCa(g, t) {
    var s = khung(g, t), N = g.ngay, W0 = g.gio_an, W1 = g.gio_an + 1 / 24;
    var san = canh("tc-canh-nuoc tc-bca-san"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var hoi = tao("div", "tc-bca-hoi"); hoi.appendChild(tao("p", "", t.doan_hoi)); var hD = tao("div", "tc-hang"); hoi.appendChild(hD);
    var cap = tao("p", "tc-cap", ""); cap.hidden = true; cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var lai = nut(t.nut_lai, false), hangLai = tao("div", "tc-hang"); hangLai.appendChild(lai); hangLai.hidden = true;
    // trục một ngày, khung giờ ăn
    var L = 40, R = 440; function X(u) { return L + (R - L) * u; }
    svg(c, "text", { x: L, y: 18, class: "tc-t-nho" }, t.mot_ngay);
    svg(c, "rect", { x: L, y: 28, width: R - L, height: 10, rx: 5, class: "tc-bca-truc" });
    svg(c, "rect", { x: X(W0), y: 25, width: X(W1) - X(W0), height: 16, rx: 3, class: "tc-bca-khung" });
    svg(c, "text", { x: X(W1) + 8, y: 18, class: "tc-t-nho" }, t.gio_an);
    var mt = svg(c, "circle", { cx: L, cy: 33, r: 8, class: "tc-bca-mat-troi" });
    var chuNgay = svg(c, "text", { x: 586, y: 22, "text-anchor": "end", class: "tc-t-dam" }, "");
    // bể: sỏi, rong, cần bấm, máng thức ăn
    svg(c, "path", { d: "M70 246 Q58 206 76 172 Q92 140 78 108 M92 246 Q104 214 94 186", class: "tc-bca-rong" });
    svg(c, "rect", { x: 0, y: 240, width: 600, height: 20, class: "tc-bca-soi" });
    for (var k = 0; k < 30; k++) svg(c, "circle", { cx: 10 + k * 20 + (k % 3) * 3, cy: 242 + (k % 2) * 6, r: 5 + (k % 3), class: "tc-bca-hon" });
    var can = svg(c, "g", {}); svg(can, "rect", { x: 527, y: 48, width: 6, height: 90, class: "tc-bca-can" }); svg(can, "circle", { cx: 530, cy: 142, r: 10, class: "tc-bca-num" });
    svg(c, "rect", { x: 500, y: 40, width: 60, height: 10, rx: 3, class: "tc-bca-can" });
    svg(c, "text", { x: 530, y: 172, "text-anchor": "middle", class: "tc-t-nho" }, t.can);
    var thucAn = svg(c, "g", {});
    // bảng các lần bấm cần: mỗi ngày một hàng
    var RT = 274, RH = Math.min(22, 112 / N);
    svg(c, "rect", { x: L, y: RT - 4, width: R - L, height: N * RH + 8, rx: 6, class: "tc-bca-bang" });
    svg(c, "rect", { x: X(W0), y: RT - 4, width: X(W1) - X(W0), height: N * RH + 8, class: "tc-bca-khung", opacity: ".5" });
    for (var d = 0; d < N; d++) svg(c, "text", { x: L - 8, y: RT + d * RH + RH / 2 + 4, "text-anchor": "end", class: "tc-t-nho" }, d + 1);
    cotChu(c, 520, RT + 22, String(t.bam).split("\n"), "tc-t-nho", 15);
    var vach = svg(c, "g", {});
    // con cá
    var ca = svg(c, "g", {}), than = svg(ca, "g", {});
    svg(than, "path", { d: "M-22 0 L-40 -13 L-35 0 L-40 13 Z", class: "tc-bca-vay" });
    svg(than, "ellipse", { cx: 0, cy: 0, rx: 25, ry: 14, class: "tc-bca-ca" }); svg(than, "path", { d: "M-6 -12 Q3 -25 12 -12 Z", class: "tc-bca-vay" });
    svg(than, "circle", { cx: 13, cy: -4, r: 3, style: "fill:#111" });
    var CAN = { x: 506, y: 142 }, P = { x: 230, y: 160, h: 1 }, dich = { x: 230, y: 160 }, ngay = 0, u = 0, chay = false, chon = -1;
    function datCa(lac) { ca.setAttribute("transform", "translate(" + P.x + "," + P.y + ") scale(" + P.h + ",1)"); than.setAttribute("transform", "rotate(" + (lac || 0) + ")"); }
    datCa();
    function hocDuoc() { return N > 1 ? ngay / (N - 1) : 1; }
    // Một bước mô phỏng (minh họa): ngày đầu bơi lung tung, bấm cần rải rác; càng về sau càng tới cần ngay trước giờ ăn
    function buoc(du) {
      var hoc = hocDuoc(), sap = u > W0 - 0.11 && u < W1 + 0.01;
      if (Math.random() < 0.02 * du || Math.hypot(dich.x - P.x, dich.y - P.y) < 6) {
        if (sap && Math.random() < hoc + 0.05) dich = CAN;
        else if (Math.random() < 0.3 * (1 - hoc) + 0.03) dich = CAN;
        else dich = { x: 130 + (Math.random() * (1 - hoc * 0.5) + hoc * 0.5) * 320, y: 80 + Math.random() * 140 };
      }
      if (sap && hoc > 0.5) dich = CAN;
      var dx = dich.x - P.x, dy = dich.y - P.y, dd = Math.hypot(dx, dy), v = (dich === CAN ? 7 : 4.2) * du;
      if (dd > 1) { P.x += dx / dd * Math.min(v, dd); P.y += dy / dd * Math.min(v, dd); if (Math.abs(dx) > 2) P.h = dx > 0 ? 1 : -1; }
      if (Math.hypot(CAN.x - P.x, CAN.y - P.y) < 14 && Math.random() < 0.45 * du) bam();
      u += (Math.abs(u - (W0 + W1) / 2) < 0.12 ? 0.0026 : 0.011) * du; // tua chậm lại quanh giờ ăn để thấy rõ
    }
    function bam() {
      var trong = u >= W0 && u <= W1;
      svg(vach, "line", { x1: X(Math.min(1, u)), x2: X(Math.min(1, u)), y1: RT + ngay * RH + 2, y2: RT + (ngay + 1) * RH - 2, class: trong ? "tc-bca-vach-an" : "tc-bca-vach" });
      can.setAttribute("transform", "rotate(8 530 48)"); setTimeout(function () { can.removeAttribute("transform"); }, 120);
      if (trong && !giam && thucAn.childNodes.length < 6) svg(thucAn, "circle", { cx: 515 + Math.random() * 30, cy: 54, r: 3.5, class: "tc-bca-hat" });
    }
    function hatRoi() { Array.prototype.slice.call(thucAn.childNodes).forEach(function (h) { var y = +h.getAttribute("cy") + 2; if (y > 236 || Math.hypot(+h.getAttribute("cx") - P.x, y - P.y) < 18) h.remove(); else h.setAttribute("cy", y); }); }
    function veNgay() { chuNgay.textContent = dien(t.ngay, { d: Math.min(ngay + 1, N), n: N }); mt.setAttribute("cx", X(Math.min(1, u))); }
    function het() { chay = false; veNgay(); cap.textContent = t.sau_ca[chon]; cap.hidden = false; phan2.hidden = false; tha.disabled = false; hangLai.hidden = false; }
    function chayNgay() {
      if (giam) { while (ngay < N) { while (u < 1) buoc(1); u = 0; ngay++; } ngay = N - 1; u = 1; P = { x: CAN.x, y: CAN.y, h: 1 }; datCa(); het(); return; }
      var tr = null;
      (function khung2(ts) {
        if (!chay) return; var du = tr ? Math.min(3, (ts - tr) / 16.7) : 1; tr = ts;
        buoc(du); hatRoi(); datCa(Math.sin(ts / 120) * 6); veNgay();
        if (u >= 1) { if (ngay >= N - 1) { het(); return; } u = 0; ngay++; }
        requestAnimationFrame(khung2);
      })(performance.now());
    }
    t.doan.forEach(function (ch, i) {
      var b = nut(ch, false); hD.appendChild(b);
      b.onclick = function () { if (chay || chon >= 0) return; chon = i; hD.querySelectorAll("button").forEach(function (x) { x.disabled = true; }); b.classList.add("tc-da-chon"); chay = true; chayNgay(); };
    });
    // Phần 2: thả dây câu xuống đáy, lần ngược con số qua từng tay
    var phan2 = tao("div", "tc-bca-p2"); phan2.hidden = true;
    phan2.appendChild(tao("p", "tc-hoi", t.cau_hoi));
    var n = t.chuoi.length, D2 = 96 + n * 64, san2 = canh("tc-canh-toi tc-bca-sau"), c2 = svg(san2, "svg", { viewBox: "0 0 600 " + D2, role: "img", "aria-label": t.mo_ta_2 });
    phan2.appendChild(san2);
    var hang2 = tao("div", "tc-hang"), tha = nut(t.nut_tha, true); hang2.appendChild(tha); phan2.appendChild(hang2);
    svg(c2, "rect", { x: 0, y: 0, width: 600, height: 70, class: "tc-bca-mat-nuoc" });
    svg(c2, "rect", { x: 150, y: 12, width: 436, height: 44, rx: 10, class: "tc-bca-loi" });
    svg(c2, "text", { x: 368, y: 40, "text-anchor": "middle", class: "tc-bca-loi-chu" }, t.loi_don);
    svg(c2, "path", { d: "M30 52 L112 52 L100 66 L42 66 Z", class: "tc-bca-thuyen" }); svg(c2, "line", { x1: 86, y1: 52, x2: 118, y2: 12, class: "tc-bca-day" });
    var day = svg(c2, "line", { x1: 118, y1: 12, x2: 118, y2: 68, class: "tc-bca-day" });
    var the = t.chuoi.map(function (o, i) {
      var y = 82 + i * 64, cuoi = i === n - 1, gg = svg(c2, "g", { class: "tc-bca-the" + (cuoi ? " tc-bca-trong" : "") });
      svg(gg, "rect", { x: 150, y: y, width: 436, height: 52, rx: 8, class: cuoi ? "tc-bca-o-trong" : "tc-bca-o" });
      svg(gg, "text", { x: 166, y: y + 22, class: "tc-bca-tieu" }, o.tieu); svg(gg, "text", { x: 166, y: y + 42, class: "tc-bca-dong" }, o.dong);
      return { g: gg, y: y + 26 };
    });
    var moc = svg(c2, "g", { class: "tc-keo tc-bca-moc", tabindex: "0", role: "button", "aria-label": t.day_cau });
    svg(moc, "rect", { x: -26, y: -24, width: 52, height: 50, style: "fill:transparent" });
    svg(moc, "path", { d: "M0 -8 L0 8 Q0 18 -9 16 Q-15 14 -14 8", class: "tc-bca-luoi-cau" }); svg(moc, "circle", { cx: 0, cy: -12, r: 5, class: "tc-bca-chi" });
    var my = 80, toi = -1;
    function datMoc(y) {
      my = Math.max(80, Math.min(D2 - 14, y)); moc.setAttribute("transform", "translate(118," + my + ")"); day.setAttribute("y2", my - 16);
      the.forEach(function (o, i) { if (my >= o.y - 8 && i > toi) { toi = i; o.g.classList.add("tc-bca-mo"); } });
      if (toi === n - 1 && ket.hidden) { ket.textContent = t.ket; ket.hidden = false; tha.disabled = true; }
    }
    datMoc(80);
    keoSvg(c2, "g.tc-bca-moc", function (e, p, buoc) { if (phan2.hidden) return false; if (buoc === "di") datMoc(Math.max(my, p.y)); }, function (e, p) { if (!p) xuong(); });
    function xuong() {
      var dich2 = toi + 1 < n ? the[toi + 1].y : D2 - 14, y0 = my, t0 = null;
      if (giam) { datMoc(dich2); return; }
      (function di(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 500); datMoc(y0 + (dich2 - y0) * k); if (k < 1) requestAnimationFrame(di); })(performance.now());
    }
    tha.onclick = xuong;
    moc.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " " || ev.key === "ArrowDown") { ev.preventDefault(); xuong(); } });
    lai.onclick = function () {
      chay = false; chon = -1; ngay = 0; u = 0; vach.innerHTML = ""; thucAn.innerHTML = ""; P = { x: 230, y: 160, h: 1 }; dich = { x: 230, y: 160 }; datCa(); veNgay();
      hD.querySelectorAll("button").forEach(function (x) { x.disabled = false; x.classList.remove("tc-da-chon"); });
      toi = -1; the.forEach(function (o) { o.g.classList.remove("tc-bca-mo"); }); datMoc(80);
      cap.hidden = true; phan2.hidden = true; ket.hidden = true; hangLai.hidden = true; tha.disabled = false;
    };
    veNgay();
    s.appendChild(san); s.appendChild(hoi); s.appendChild(cap); s.appendChild(phan2); s.appendChild(ket); s.appendChild(hangLai); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 2 G KẾT THÚC ====
  // ==== ĐỢT 2 E BẮT ĐẦU ====
  // Ba cảnh thảm họa: quy-dao (Mars Climate Orbiter), song-radio (Tenerife), tau-chim (Titanic). Sân khấu nền tối cố định nên dùng màu riêng (tc-e-*).
  function eHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected) fn(); }, giam ? 0 : ms); }
  function eLai(s, lam, g, t) { var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  // Hoạt cảnh f: 0 → 1 trong ms; khi giảm chuyển động thì nhảy thẳng tới cuối
  function eChay(s, ms, buoc, xong) {
    if (giam || ms <= 0) { buoc(1); if (xong) xong(); return; }
    var t0 = null;
    (function f(ts) { if (!s.isConnected) return; if (t0 == null) t0 = ts; var x = Math.min(1, (ts - t0) / ms); buoc(x); if (x < 1) requestAnimationFrame(f); else if (xong) xong(); })(performance.now());
  }
  function eSo(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : "."); }
  function eDat(e, x, y, them) { e.setAttribute("transform", "translate(" + x + "," + y + ")" + (them || "")); }
  function eMuot(e, ms) { e.style.transition = giam ? "" : "transform " + ms + "ms ease"; }

  // ---------- Cảnh: quỹ đạo trôi (băng chuyền thẻ AMD, hai khe đổi đơn vị, đường bay lệch dần, đồng hồ độ cao có ngưỡng) ----------
  // g.the: số thẻ; g.khoang: [ms giữa hai thẻ] (dày dần); g.chay_ms: thời gian một thẻ chạy hết băng; g.email_sau: thẻ thứ mấy thì email đến;
  // g.nham, g.cuoi, g.nguong: km; g.moc: [km] chuỗi độ cao thật. t.moc: [{nhan, hien}] cùng độ dài với g.moc.
  function quyDao(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 420", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), xem = nut(t.nut_that, true), lai = nut(t.nut_lai, false);
    xem.hidden = lai.hidden = true; [bd, xem, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    for (var i = 0; i < 46; i++) svg(c, "circle", { cx: (i * 137 + 23) % 600, cy: (i * 71 + 9) % 232, r: i % 5 ? 0.9 : 1.6, class: "tc-qd-sao" });
    // Trái Đất, Sao Hỏa, vành khí quyển tới ngưỡng sống sót
    svg(c, "circle", { cx: 46, cy: 192, r: 20, class: "tc-qd-dat" }); svg(c, "path", { d: "M34 184 q8 -9 15 -1 q4 9 -5 13 q-9 0 -10 -12 Z", class: "tc-qd-luc" });
    svg(c, "text", { x: 46, y: 230, "text-anchor": "middle", class: "tc-e-nho" }, t.trai_dat);
    var MX = 520, MY = 152, MR = 40, K = 0.22;
    svg(c, "circle", { cx: MX, cy: MY, r: MR + g.nguong * K, class: "tc-qd-khi" });
    svg(c, "circle", { cx: MX, cy: MY, r: MR, class: "tc-qd-hoa" });
    svg(c, "text", { x: MX, y: MY + MR + 48, "text-anchor": "middle", class: "tc-e-do" }, t.vanh);
    svg(c, "text", { x: MX, y: MY + MR + 30, "text-anchor": "middle", class: "tc-e-nho" }, t.sao_hoa);
    function yP(a) { return MY - MR - a * K; }
    function duong(a) { return "M46 172 C140 10 360 " + yP(a) + " " + MX + " " + yP(a); }
    function diem(a, f) {
      var y = yP(a), X = [46, 140, 360, MX], Y = [172, 10, y, y], u = 1 - f, w = [u * u * u, 3 * u * u * f, 3 * u * f * f, f * f * f];
      return { x: w[0] * X[0] + w[1] * X[1] + w[2] * X[2] + w[3] * X[3], y: w[0] * Y[0] + w[1] * Y[1] + w[2] * Y[2] + w[3] * Y[3] };
    }
    svg(c, "path", { d: duong(g.nham), class: "tc-qd-du" });
    var thatD = svg(c, "path", { d: duong(g.nham), class: "tc-qd-that" });
    function veTau(lop) {
      var e = svg(c, "g", { class: lop }); svg(e, "rect", { x: -6, y: -5, width: 12, height: 10, rx: 2 }); svg(e, "rect", { x: -26, y: -3, width: 18, height: 6 }); svg(e, "circle", { cx: 9, cy: -6, r: 3 }); return e;
    }
    var bong = veTau("tc-qd-bong"), tau = veTau("tc-qd-tau");
    // Phiếu sự cố ISA (góc trên trái) và email
    var isaO = svg(c, "g", {}); var isaR = svg(isaO, "rect", { x: 12, y: 12, width: 200, height: 46, rx: 10, class: "tc-qd-isa" });
    svg(isaO, "text", { x: 112, y: 41, "text-anchor": "middle", class: "tc-e-chu" }, t.isa);
    // Băng chuyền và hai khe
    var bang = svg(c, "g", {}), BY = 262, CW = 92, CH = 48;
    svg(bang, "text", { x: 300, y: 252, "text-anchor": "middle", class: "tc-e-nho" }, t.bang);
    svg(bang, "rect", { x: 0, y: BY, width: 600, height: 58, class: "tc-qd-bang" });
    svg(bang, "line", { x1: 0, x2: 600, y1: BY + 55, y2: BY + 55, class: "tc-qd-lan" });
    svg(bang, "path", { d: "M590 322 q8 8 -2 18", class: "tc-qd-mui" });
    var KHE = [{ x: 14, ten: t.khe_doi, phu: t.khe_doi_phu, lop: "tc-qd-khe-doi" }, { x: 308, ten: t.khe_thang, phu: t.khe_thang_phu, lop: "tc-qd-khe-thang" }];
    KHE.forEach(function (k) {
      svg(bang, "rect", { x: k.x, y: 334, width: 278, height: 80, rx: 12, class: "tc-qd-khe " + k.lop });
      svg(bang, "text", { x: k.x + 14, y: 359, class: "tc-e-chu" }, k.ten); svg(bang, "text", { x: k.x + 14, y: 378, class: "tc-e-nho" }, k.phu);
      k.dem = svg(bang, "text", { x: k.x + 264, y: 362, "text-anchor": "end", class: "tc-qd-dem" }, "0"); k.n = 0;
    });
    var lop = svg(bang, "g", {}), the = [];
    function datThe(o) { eDat(o.e, o.x, o.y); }
    function taoThe(i) {
      var e = svg(lop, "g", { class: "tc-qd-the", tabindex: "0", role: "button", "aria-label": dien(t.the_aria, { n: i + 1 }), "data-i": i });
      svg(e, "rect", { x: 0, y: 0, width: CW, height: CH, rx: 7, class: "tc-qd-giay" });
      svg(e, "text", { x: 8, y: 16, class: "tc-qd-the-nho" }, "AMD #" + (i + 1));
      svg(e, "text", { x: 8, y: 40, class: "tc-qd-the-so" }, so(0.21 + ((i * 37) % 53) / 100, 2));
      svg(e, "text", { x: CW - 6, y: 40, "text-anchor": "end", class: "tc-qd-the-nho" }, "lbf·s");
      var o = { i: i, e: e, x: -CW - 4, y: BY + 5, tt: "bang" }; the.push(o); datThe(o); return o;
    }
    // Đồ thị độ cao thật (hiện ở chỗ băng chuyền khi xem chuyện thật)
    var dt = svg(c, "g", { visibility: "hidden" }), ax = function (km) { return 40 + km * 2.08; };
    svg(dt, "rect", { x: 0, y: 238, width: 600, height: 182, class: "tc-qd-nen-dt" });
    svg(dt, "text", { x: 20, y: 266, class: "tc-e-nho" }, t.do_cao);
    svg(dt, "line", { x1: 40, x2: 560, y1: 360, y2: 360, class: "tc-qd-truc" });
    [0, 50, 100, 150, 200, 250].forEach(function (km) { svg(dt, "line", { x1: ax(km), x2: ax(km), y1: 355, y2: 365, class: "tc-qd-truc" }); });
    svg(dt, "text", { x: 40, y: 352, "text-anchor": "middle", class: "tc-e-nho" }, "0"); svg(dt, "text", { x: 566, y: 386, "text-anchor": "end", class: "tc-e-nho" }, "250 km");
    svg(dt, "line", { x1: ax(g.nguong), x2: ax(g.nguong), y1: 280, y2: 372, class: "tc-qd-nguong" });
    svg(dt, "text", { x: ax(g.nguong) - 6, y: 292, "text-anchor": "end", class: "tc-e-do" }, t.nguong);
    var mocG = g.moc.map(function (km, j) {
      var e = svg(dt, "g", { visibility: "hidden" }), x = ax(km), tren = j % 2 === 0;
      svg(e, "circle", { cx: x, cy: 360, r: 7, class: km < g.nguong ? "tc-qd-cham-do" : "tc-qd-cham" });
      svg(e, "text", { x: x, y: tren ? 318 : 386, "text-anchor": "middle", class: "tc-e-nho" }, t.moc[j].nhan);
      svg(e, "text", { x: x, y: tren ? 338 : 406, "text-anchor": "middle", class: km < g.nguong ? "tc-e-do" : "tc-e-chu" }, t.moc[j].hien);
      return e;
    });
    var dang = false, keoO = null, isa = false, thang = 0, xong = 0, pHien = 0, sinh = 0, tc = 0, tg = 0, aTau = g.nham, email = null;
    var V = (600 + 4) / g.chay_ms, lich = [0];
    g.khoang.forEach(function (k, j) { lich.push(lich[j] + k); });
    function aNay() { return g.nham - (g.nham - g.cuoi) * thang / g.the; }
    function datTau() { var p = diem(aTau, pHien), q = diem(g.nham, pHien); eDat(tau, p.x, p.y); eDat(bong, q.x, q.y); }
    datTau();
    function roi(o, k) {
      o.tt = "xong"; xong++; var kh = KHE[k]; kh.n++; kh.dem.textContent = kh.n; if (k) thang++;
      o.e.classList.add(k ? "tc-qd-the-sai" : "tc-qd-the-dung"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true");
      eMuot(o.e, 450); eDat(o.e, kh.x + 14 + (kh.n - 1) * 15, 388, " scale(.28)");
      aTau = aNay(); thatD.setAttribute("d", duong(aTau));
      cap.textContent = dien(k ? t.the_thang : t.the_doi, { n: o.i + 1 });
    }
    function moEmail() {
      email = svg(c, "g", { class: "tc-qd-email", tabindex: "0", role: "button", "aria-label": t.email_aria });
      svg(email, "rect", { x: 0, y: 0, width: 132, height: 44, rx: 6, class: "tc-qd-phong-bi" });
      svg(email, "path", { d: "M0 2 L66 26 L132 2", class: "tc-qd-nep" });
      svg(email, "text", { x: 66, y: 38, "text-anchor": "middle", class: "tc-qd-email-chu" }, t.email);
      email.p = { x: 280, y: 14 }; eDat(email, 640, 14); email.getBoundingClientRect(); eMuot(email, 700); eDat(email, 280, 14);
      setTimeout(function () { if (email) email.style.transition = ""; }, 750);
      cap.textContent = t.email_den;
    }
    function nopIsa() {
      if (isa || !email) return; isa = true; eMuot(email, 400); eDat(email, 46, 14, " scale(.5)"); email.classList.add("tc-qd-da-nop"); email.removeAttribute("tabindex");
      isaR.setAttribute("class", "tc-qd-isa tc-qd-isa-mo"); cap.textContent = t.da_isa;
    }
    function vong(ts) {
      if (!s.isConnected || !dang) return;
      var d = Math.min(50, ts - tg); tg = ts; tc += d;
      while (sinh < g.the && tc >= lich[sinh]) { taoThe(sinh); if (sinh === g.email_sau) moEmail(); sinh++; }
      the.forEach(function (o) { if (o.tt !== "bang" || o === keoO) return; o.x += V * d; if (o.x > 600 - CW - 4) roi(o, 1); else datThe(o); });
      pHien += (xong / g.the * 0.88 - pHien) * Math.min(1, d / 300); datTau();
      if (xong >= g.the) { dang = false; denNoi(); return; }
      requestAnimationFrame(vong);
    }
    function denNoi() {
      if (isa) { aTau = g.nham; thatD.setAttribute("d", duong(aTau)); }
      var p0 = pHien;
      eChay(s, 1300, function (f) { pHien = p0 + (1 - p0) * f; datTau(); }, function () {
        var chay = aTau < g.nguong; if (chay) tau.classList.add("tc-qd-chay");
        cap.textContent = (isa ? t.toi_tcm : dien(t.toi, { a: eSo(aTau) })) + " " + (chay ? t.duoi_nguong : t.tren_nguong);
        xem.hidden = false; xem.focus({ preventScroll: true });
      });
    }
    keoSvg(c, "g.tc-qd-the", function (e, p, b, dau) {
      var o = the[+e.getAttribute("data-i")]; if (!o || o.tt !== "bang" || !dang) return false;
      if (b === "bat") { keoO = o; o.lech = null; lop.appendChild(e); return; }
      if (!o.lech) o.lech = { x: dau.x - o.x, y: dau.y - o.y };
      o.x = p.x - o.lech.x; o.y = p.y - o.lech.y; datThe(o);
    }, function (e, p) {
      var o = the[+e.getAttribute("data-i")]; keoO = null; if (!o || o.tt !== "bang") return;
      var cx = o.x + CW / 2, cy = o.y + CH / 2;
      if (p && cy > 326) roi(o, cx < 300 ? 0 : 1);
      else { o.y = BY + 5; datThe(o); if (!p) cap.textContent = t.goi_y; }
    });
    keoSvg(c, "g.tc-qd-email", function (e, p, b, dau) {
      if (isa) return false; if (b === "bat") { email.lech = null; return; }
      if (!email.lech) email.lech = { x: dau.x - email.p.x, y: dau.y - email.p.y };
      email.p = { x: p.x - email.lech.x, y: p.y - email.lech.y }; eDat(email, email.p.x, email.p.y);
    }, function (e, p) { if (!p || email.p.x < 230 && email.p.y < 80) nopIsa(); else { email.p = { x: 280, y: 14 }; eMuot(email, 300); eDat(email, 280, 14); } });
    c.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return; var e = ev.target.closest && ev.target.closest("g.tc-qd-the, g.tc-qd-email"); if (!e) return; ev.preventDefault();
      if (e === email) { nopIsa(); return; }
      var o = the[+e.getAttribute("data-i")]; if (o && o.tt === "bang" && dang) roi(o, 0);
    });
    bd.onclick = function () { bd.hidden = true; dang = true; cap.textContent = t.dang; tg = performance.now(); requestAnimationFrame(vong); };
    xem.onclick = function () {
      xem.hidden = true; bang.setAttribute("visibility", "hidden"); dt.setAttribute("visibility", "visible");
      if (email) email.setAttribute("visibility", "hidden");
      tau.classList.remove("tc-qd-chay"); aTau = g.cuoi; thatD.setAttribute("d", duong(aTau)); thatD.classList.add("tc-qd-that-do"); pHien = 0.3; datTau();
      var n = g.moc.length;
      g.moc.forEach(function (_, j) {
        eHen(s, function () {
          mocG[j].setAttribute("visibility", "visible"); cap.textContent = t.moc[j].nhan + ": " + t.moc[j].hien;
          var p0 = pHien; eChay(s, 800, function (f) { pHien = p0 + (0.3 + 0.7 * (j + 1) / n - p0) * f; datTau(); });
        }, 1000 * j);
      });
      eHen(s, function () {
        tau.classList.add("tc-qd-chay"); cap.textContent = t.mat;
        ket.textContent = dien(t.ket, { d: thang, n: g.the }) + " " + (isa ? t.ket_isa : t.ket_khong); ket.hidden = false; lai.hidden = false;
      }, 1000 * n + 300);
    };
    lai.onclick = function () { eLai(s, quyDao, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: hai sóng radio trong sương (đường băng phủ sương, trục thời gian có khối sóng kéo được) ----------
  // g.truc: [giây đầu, giây cuối] của trục (phút 17:06); g.thap: [bắt đầu, kết thúc, giây bắt đầu "stand by"]; g.panam: [bắt đầu, kết thúc];
  // g.duong_bang, g.tam_nhin: mét (bán kính vòng nhìn thấy trong sương); g.toc: tua nhanh bao nhiêu lần.
  function songRadio(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 440", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), phat = nut(t.nut_1, true), sang3 = nut(t.nut_3, false), lai = nut(t.nut_lai, false);
    sang3.hidden = lai.hidden = true; [phat, sang3, lai].forEach(function (b) { hang.appendChild(b); });
    var chonH = tao("div", "tc-hang"), hoiB = nut(t.chon_hoi, false), dungB = nut(t.chon_dung, false); chonH.appendChild(hoiB); chonH.appendChild(dungB); chonH.hidden = true;
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var id = g.id;
    // Sân bay nhìn từ trên xuống
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 222, class: "tc-sr-co" });
    svg(c, "rect", { x: 0, y: 146, width: 600, height: 14, class: "tc-sr-lan-xe" });
    [190, 280, 370, 460].forEach(function (x, j) {
      svg(c, "path", { d: "M" + (x - 8) + " 110 L" + (x + 22) + " 146 L" + (x + 40) + " 146 L" + (x + 10) + " 110 Z", class: "tc-sr-lan-xe" });
    });
    svg(c, "rect", { x: 20, y: 70, width: 560, height: 40, class: "tc-sr-bang" });
    for (var i = 0; i < 27; i++) svg(c, "rect", { x: 34 + i * 20, y: 89, width: 9, height: 2, class: "tc-sr-vach" });
    function mayBay(lop, quay) {
      var e = svg(c, "g", { class: lop }), h = svg(e, "g", quay ? { transform: "rotate(180)" } : {});
      svg(h, "path", { d: "M-24 -3.5 L16 -4 Q26 0 16 4 L-24 3.5 Z" });
      svg(h, "path", { d: "M-2 -3 L-10 -24 L-3 -24 L9 -3 Z M-2 3 L-10 24 L-3 24 L9 3 Z" });
      svg(h, "path", { d: "M-20 -2 L-26 -11 L-21 -11 L-14 -2 Z M-20 2 L-26 11 L-21 11 L-14 2 Z" });
      return e;
    }
    var klm = mayBay("tc-sr-klm", false), pa = mayBay("tc-sr-pa", true);
    var R = 560 * g.tam_nhin / g.duong_bang;
    var defs = svg(c, "defs", {}), rg = svg(defs, "radialGradient", { id: id + "-rg" });
    svg(rg, "stop", { offset: "0.55", "stop-color": "#000" }); svg(rg, "stop", { offset: "1", "stop-color": "#fff" });
    var mk = svg(defs, "mask", { id: id + "-mk", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 600, height: 222 });
    svg(mk, "rect", { x: 0, y: 0, width: 600, height: 222, fill: "#fff" });
    var lo1 = svg(mk, "circle", { r: R, fill: "url(#" + id + "-rg)" }), lo2 = svg(mk, "circle", { r: R, fill: "url(#" + id + "-rg)" });
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 222, class: "tc-sr-suong", mask: "url(#" + id + "-mk)" });
    var nhK = svg(c, "text", { "text-anchor": "middle", class: "tc-sr-ten" }, "KLM"), nhP = svg(c, "text", { "text-anchor": "middle", class: "tc-sr-ten" }, "Pan Am");
    svg(c, "text", { x: 300, y: 28, "text-anchor": "middle", class: "tc-sr-chu-suong" }, t.suong);
    [190, 280, 370, 460].forEach(function (x, j) { svg(c, "text", { x: x + 44, y: 138, class: "tc-sr-nho-toi" }, "C-" + (j + 1)); });
    var vt = { k: 0, p: 0 };
    function datMay(xk, xp) {
      vt.k = xk; vt.p = xp; eDat(klm, xk, 90); eDat(pa, xp, 90); lo1.setAttribute("cx", xk); lo1.setAttribute("cy", 90); lo2.setAttribute("cx", xp); lo2.setAttribute("cy", 90);
      nhK.setAttribute("x", xk); nhK.setAttribute("y", 58); nhP.setAttribute("x", xp); nhP.setAttribute("y", 58);
    }
    // Tai nghe KLM
    svg(c, "rect", { x: 12, y: 168, width: 576, height: 46, rx: 10, class: "tc-sr-tai" });
    svg(c, "text", { x: 24, y: 186, class: "tc-sr-nho-toi" }, t.tai_nghe);
    var dongHo = svg(c, "text", { x: 576, y: 186, "text-anchor": "end", class: "tc-sr-nho-toi" }, "");
    var nghe = svg(c, "text", { x: 24, y: 206, class: "tc-sr-nghe" }, "…");
    // Băng tần radio
    var T0 = g.truc[0], T1 = g.truc[1], PX = 540 / (T1 - T0);
    function X(sec) { return 30 + (sec - T0) * PX; }
    svg(c, "rect", { x: 0, y: 222, width: 600, height: 218, class: "tc-sr-dai" });
    svg(c, "text", { x: 16, y: 248, class: "tc-e-nho" }, t.bang_tan);
    svg(c, "line", { x1: 30, x2: 570, y1: 404, y2: 404, class: "tc-sr-truc" });
    for (var k = T0; k <= T1; k++) { svg(c, "line", { x1: X(k), x2: X(k), y1: 400, y2: 410, class: "tc-sr-truc" }); svg(c, "text", { x: X(k), y: 428, "text-anchor": "middle", class: "tc-e-nho" }, ":" + k); }
    var chongG = svg(c, "g", {}), chongR = svg(chongG, "rect", { y: 256, height: 132, class: "tc-sr-chong" }), rang = svg(chongG, "polyline", { class: "tc-sr-rang" });
    var LT = g.thap[1] - g.thap[0], SB = g.thap[2] - g.thap[0], LP = g.panam[1] - g.panam[0];
    var kh = [
      { ten: t.thap, y: 262, dai: LT, bd: g.thap[0], lop: "tc-sr-k-thap", aria: t.aria_thap },
      { ten: "Pan Am", y: 328, dai: LP, bd: g.panam[0], lop: "tc-sr-k-pa", aria: t.aria_pa }
    ].map(function (o, j) {
      o.e = svg(c, "g", { class: "tc-sr-khoi " + o.lop, "data-j": j, "aria-label": o.aria });
      var w = o.dai * PX; svg(o.e, "rect", { x: 0, y: 0, width: w, height: 52, rx: 8, class: "tc-sr-nen-k" });
      svg(o.e, "text", { x: 8, y: 17, class: "tc-sr-k-nho" }, o.ten);
      if (j === 0) {
        svg(o.e, "rect", { x: SB * PX, y: 3, width: w - SB * PX - 3, height: 46, rx: 6, class: "tc-sr-sb" });
        svg(o.e, "text", { x: 8, y: 41, class: "tc-sr-k-chu" }, "“OK…”"); svg(o.e, "text", { x: SB * PX + 8, y: 41, class: "tc-sr-k-chu" }, "“stand by…”");
      } else svg(o.e, "text", { x: 8, y: 41, class: "tc-sr-k-chu" }, "“still taxiing”");
      o.goc = o.bd; return o;
    });
    var dauDoc = svg(c, "line", { y1: 252, y2: 410, class: "tc-sr-dau" }); dauDoc.setAttribute("visibility", "hidden");
    function chong() { var a = Math.max(kh[0].bd, kh[1].bd), b = Math.min(kh[0].bd + LT, kh[1].bd + LP); return b > a ? [a, b] : null; }
    function veKhoi() {
      kh.forEach(function (o) { eDat(o.e, X(o.bd), o.y); });
      var ch = chong(); chongG.setAttribute("visibility", ch ? "visible" : "hidden");
      if (ch) {
        var a = X(ch[0]), b = X(ch[1]), pts = []; chongR.setAttribute("x", a); chongR.setAttribute("width", b - a);
        for (var x = a, u = 0; x <= b; x += 6, u++) pts.push(x + "," + (u % 2 ? 315 : 329)); rang.setAttribute("points", pts.join(" "));
      }
    }
    // KLM nghe được gì đến giây tau
    function doan() {
      var ch = chong();
      return [{ a: kh[0].bd, b: kh[0].bd + SB, chu: t.nghe_ok, ok: 1 }, { a: kh[0].bd + SB, b: kh[0].bd + LT, chu: t.nghe_sb, sb: 1 }, { a: kh[1].bd, b: kh[1].bd + LP, chu: t.nghe_pa, pa: 1 }]
        .map(function (e) { e.bi = !!ch && (e.ok ? ch[0] <= e.a : ch[0] < e.b && ch[1] > e.a); return e; }).sort(function (x, y) { return x.a - y.a; });
    }
    function loiNghe(tau) {
      var out = [];
      doan().forEach(function (e) { if (tau < e.a) return; var chu = e.bi ? t.rit : e.chu; if (out[out.length - 1] !== chu) out.push(chu); });
      return out.slice(-2).join(" ") || "…";
    }
    function dungLai() { var r = null; doan().forEach(function (e) { if (!e.bi && (e.sb || e.pa) && (r == null || e.a < r)) r = e.a; }); return r; }
    function gio(sec) { var x = sec.toFixed(1); return "17:06:" + (sec < 10 ? "0" : "") + (en ? x : x.replace(".", ",")); }
    var keoDuoc = false, luot = 1, dangChay = false;
    function choKeo(b) { keoDuoc = b; kh.forEach(function (o) { o.e.classList.toggle("tc-keo", b); if (b) { o.e.setAttribute("tabindex", "0"); o.e.setAttribute("role", "slider"); o.e.setAttribute("aria-valuetext", gio(o.bd)); } else { o.e.removeAttribute("tabindex"); o.e.removeAttribute("role"); } }); }
    function dau() { datMay(60, 440); nghe.textContent = "…"; nghe.setAttribute("class", "tc-sr-nghe"); dongHo.textContent = ""; }
    dau(); veKhoi();
    // Phát lại đoạn T0 → T1, tua nhanh g.toc lần; KLM tăng tốc, dừng lại nếu nghe được lời cảnh báo (quãng phanh minh họa)
    function phatLai(xong) {
      dangChay = true; choKeo(false); dau(); dauDoc.setAttribute("visibility", "visible");
      var dung = dungLai(), x = 60, v = 4, xp = 440, ms = (T1 - T0) * 1000 / g.toc, truoc = T0;
      function khung_(tau) {
        var d = tau - truoc; truoc = tau;
        if (dung != null && tau >= dung) v = Math.max(0, v - 12 * d); else v += 2.4 * d;
        x += v * d; xp -= 2 * d; datMay(x, xp);
        var l = loiNghe(tau); nghe.textContent = l; nghe.setAttribute("class", "tc-sr-nghe" + (l.indexOf(t.rit) >= 0 && l.lastIndexOf(t.rit) === l.length - t.rit.length ? " tc-sr-nghe-rit" : ""));
        dongHo.textContent = gio(tau); dauDoc.setAttribute("x1", X(tau)); dauDoc.setAttribute("x2", X(tau));
      }
      if (giam) { for (var u = T0; u <= T1 + 1e-9; u += 0.1) khung_(Math.min(u, T1)); dangChay = false; xong(dung); return; }
      eChay(s, ms, function (f) { khung_(T0 + (T1 - T0) * f); }, function () { dangChay = false; xong(dung); });
    }
    phat.onclick = function () {
      if (dangChay) return; phat.disabled = true;
      phatLai(function (dung) {
        phat.disabled = false;
        if (luot === 1) { luot = 2; cap.textContent = t.sau_1; phat.textContent = t.nut_2; choKeo(true); return; }
        cap.textContent = dung != null ? t.sau_2_thong : t.sau_2_chong; choKeo(true); sang3.hidden = false;
      });
    };
    sang3.onclick = function () {
      luot = 3; phat.hidden = sang3.hidden = true; choKeo(false); kh.forEach(function (o) { o.bd = o.goc; }); veKhoi();
      dauDoc.setAttribute("visibility", "hidden"); datMay(210, 420); nghe.textContent = t.nghe_luot3; nghe.setAttribute("class", "tc-sr-nghe"); dongHo.textContent = "17:06:32";
      cap.textContent = t.luot_3; chonH.hidden = false; hoiB.focus({ preventScroll: true });
    };
    function chon(dung) {
      hoiB.disabled = dungB.disabled = true; (dung ? dungB : hoiB).classList.add("tc-da-chon"); hoiB.classList.add("tc-nguoi-that");
      nghe.textContent = dung ? t.tra_dung : t.tra_hoi;
      var x0 = vt.k, xp0 = vt.p, xd = dung ? x0 + 60 : xp0 - 2 * R - 6;
      eChay(s, 2200, function (f) { var e = dung ? 1 - (1 - f) * (1 - f) : f * f; datMay(x0 + (xd - x0) * e, xp0 - 8 * f); dongHo.textContent = dung ? "" : gio(32 + 15 * f); }, function () {
        if (!dung) { nghe.textContent = t.va_cham; dongHo.textContent = "17:06:47"; }
        cap.textContent = dung ? t.sau_dung : t.sau_hoi;
        ket.textContent = t.ket; ket.hidden = false; lai.hidden = false;
      });
    }
    hoiB.onclick = function () { chon(false); }; dungB.onclick = function () { chon(true); };
    keoSvg(c, "g.tc-sr-khoi", function (e, p, b, d) {
      if (!keoDuoc || dangChay) return false; var o = kh[+e.getAttribute("data-j")];
      if (b === "bat") { o.bd0 = o.bd; return; }
      o.bd = Math.max(T0, Math.min(T1 - o.dai, o.bd0 + (p.x - d.x) / PX)); veKhoi();
    }, function (e) { var o = kh[+e.getAttribute("data-j")]; o.e.setAttribute("aria-valuetext", gio(o.bd)); var ch = chong(); cap.textContent = ch ? t.van_chong : t.het_chong; });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-sr-khoi"); if (!e || !keoDuoc || dangChay) return;
      var d = ev.key === "ArrowLeft" ? -0.25 : ev.key === "ArrowRight" ? 0.25 : 0; if (!d) return; ev.preventDefault();
      var o = kh[+e.getAttribute("data-j")]; o.bd = Math.max(T0, Math.min(T1 - o.dai, o.bd + d)); veKhoi(); o.e.setAttribute("aria-valuetext", gio(o.bd));
      cap.textContent = chong() ? t.van_chong : t.het_chong;
    });
    lai.onclick = function () { eLai(s, songRadio, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(chonH); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: đạt chuẩn, thiếu xuồng (kéo xuồng lên giá cho đạt luật, mặt cắt khoang ngập, hạ xuồng khi nước dâng) ----------
  // g.xuong: [sức chứa từng xuồng]; g.tren_tau: số người trên tàu; g.luat: số chỗ luật đòi; g.khoang: số khoang; g.chiu: ngập tối đa bao nhiêu khoang vẫn nổi;
  // g.rach: số khoang rách thật; g.cham: số người mỗi chấm; g.ha_ms: thời gian (ms) cho màn hạ xuồng; g.day_ms: ms để xuồng 65 chỗ đầy (minh họa)
  function tauChim(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var trang = tao("p", "tc-tx-trang"); trang.hidden = true;
    var idR = g.id + "-rach", dk = tao("label", "tc-o-nhap tc-tx-dk", ""); dk.htmlFor = idR; var dkChu = tao("span", "", ""); dk.appendChild(dkChu);
    var th = tao("input"); th.type = "range"; th.min = 1; th.max = g.rach; th.step = 1; th.value = 2; th.id = idR; dk.appendChild(th); dk.hidden = true;
    var hang = tao("div", "tc-hang"), het = nut(t.nut_het, false), sang2 = nut(t.nut_2, true), nuoc = nut(t.nut_nuoc, true), that6 = nut(t.nut_that, false),
      sang3 = nut(t.nut_3, true), ha = nut(t.nut_ha, true), lai = nut(t.nut_lai, false);
    var nuts = [het, sang2, nuoc, that6, sang3, ha, lai]; nuts.forEach(function (b) { b.hidden = true; hang.appendChild(b); }); sang2.hidden = false; sang2.disabled = true;
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    // Trời, biển, bến
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 400, class: "tc-tx-troi" });
    for (var i = 0; i < 30; i++) svg(c, "circle", { cx: (i * 151 + 17) % 600, cy: 70 + (i * 53) % 120, r: i % 4 ? 0.8 : 1.4, class: "tc-qd-sao" });
    var califG = svg(c, "g", { visibility: "hidden" }); svg(califG, "circle", { cx: 592, cy: 197, r: 3.5, class: "tc-tx-den" });
    svg(califG, "text", { x: 590, y: 390, "text-anchor": "end", class: "tc-e-cam" }, t.californian);
    var bangG = svg(c, "g", { visibility: "hidden" }); svg(bangG, "path", { d: "M600 150 L582 168 L570 205 L578 236 L600 240 Z", class: "tc-tx-bang" });
    // Con tàu: mũi bên phải; cả nhóm nghiêng quanh điểm (300, 205)
    var tau = svg(c, "g", {});
    svg(tau, "path", { d: "M35 150 L565 150 L548 222 L62 222 Q40 196 35 150 Z", class: "tc-tx-than" });
    svg(tau, "path", { d: "M39 196 L554 196 L548 222 L62 222 Q46 210 39 196 Z", class: "tc-tx-day" });
    svg(tau, "rect", { x: 118, y: 128, width: 356, height: 22, class: "tc-tx-thuong" });
    [168, 236, 304, 372].forEach(function (x) { svg(tau, "rect", { x: x, y: 92, width: 20, height: 36, class: "tc-tx-ong" }); svg(tau, "rect", { x: x, y: 92, width: 20, height: 8, class: "tc-tx-ong-den" }); });
    for (var p = 0; p < 22; p++) svg(tau, "circle", { cx: 64 + p * 22, cy: 166, r: 2.2, class: "tc-tx-cua" });
    // Mặt cắt khoang (màn 2)
    var khG = svg(tau, "g", { visibility: "hidden" }), CX0 = 52, CX1 = 548, CWk = (CX1 - CX0) / g.khoang, DAY = 220, DINH = 170, nuocO = [];
    svg(khG, "rect", { x: CX0, y: 152, width: CX1 - CX0, height: 68, class: "tc-tx-trong" });
    for (var j = 0; j < g.khoang; j++) nuocO.push(svg(khG, "rect", { x: CX1 - (j + 1) * CWk, width: CWk, y: DAY, height: 0, class: "tc-tx-nuoc" }));
    for (var j2 = 1; j2 < g.khoang; j2++) svg(khG, "line", { x1: CX1 - j2 * CWk, x2: CX1 - j2 * CWk, y1: DAY, y2: DINH, class: "tc-tx-vach" });
    svg(khG, "line", { x1: CX0, x2: CX1, y1: DINH, y2: DINH, class: "tc-tx-dinh" });
    var rachL = svg(khG, "line", { y1: 206, y2: 206, x2: CX1, class: "tc-tx-rach" });
    // Người (màn 3): mỗi chấm = g.cham người
    var nguoiG = svg(tau, "g", { visibility: "hidden" }), cham = [], soCham = Math.round(g.tren_tau / g.cham);
    for (var q = 0; q < soCham; q++) { var cx = 128 + (q % 46) * 7.4, cy = 102 + Math.floor(q / 46) * 5.4; cham.push({ e: svg(nguoiG, "circle", { cx: cx, cy: cy, r: 2.1, class: "tc-tx-nguoi" }), x: cx, y: cy, di: false }); }
    // Giá xuồng (davit) trên tàu
    var n = g.xuong.length, GX = function (k) { return 126 + k * (348 / (n - 1)); }, giaO = [];
    for (var k = 0; k < n; k++) giaO.push(svg(tau, "path", { d: "M" + (GX(k) - 7) + " 128 L" + (GX(k) - 7) + " 122 L" + (GX(k) - 3) + " 122", class: "tc-tx-gia" }));
    var nuocBien = svg(c, "rect", { x: 0, y: 205, width: 600, height: 195, class: "tc-tx-bien" });
    // Bến 1912: thước luật, kho xuồng
    var benG = svg(c, "g", {}); svg(benG, "rect", { x: 0, y: 236, width: 600, height: 164, class: "tc-tx-ben" });
    var thuoc = svg(c, "g", {}), TX = function (ng) { return 20 + 560 * ng / g.tren_tau; };
    svg(thuoc, "rect", { x: 20, y: 32, width: 560, height: 16, rx: 4, class: "tc-tx-thuoc" });
    var day = svg(thuoc, "rect", { x: 20, y: 32, width: 0, height: 16, rx: 4, class: "tc-tx-day-thuoc" });
    svg(thuoc, "line", { x1: TX(g.luat), x2: TX(g.luat), y1: 26, y2: 54, class: "tc-tx-vach-luat" });
    svg(thuoc, "text", { x: TX(g.luat), y: 70, "text-anchor": "middle", class: "tc-e-cam" }, t.vach_luat);
    var choT = svg(thuoc, "text", { x: 20, y: 22, class: "tc-e-chu" }, dien(t.cho, { n: 0 }));
    svg(thuoc, "text", { x: 580, y: 22, "text-anchor": "end", class: "tc-e-nho" }, t.tren_tau);
    var dau = svg(c, "g", { visibility: "hidden", transform: "translate(528,92) rotate(-12)" });
    var dauT = svg(dau, "g", {}); svg(dauT, "rect", { x: -50, y: -19, width: 100, height: 38, rx: 6, class: "tc-tx-dau" }); svg(dauT, "text", { x: 0, y: 8, "text-anchor": "middle", class: "tc-tx-dau-chu" }, t.dat);
    var xuong = g.xuong.map(function (cap_, i) {
      var e = svg(c, "g", { class: "tc-keo tc-tx-xuong", tabindex: "0", role: "button", "aria-label": dien(t.xuong_aria, { c: cap_ }), "data-i": i });
      svg(e, "path", { d: "M0 3 L86 3 L76 25 L10 25 Z", class: "tc-tx-vo" }); svg(e, "text", { x: 43, y: 20, "text-anchor": "middle", class: "tc-tx-so" }, cap_);
      var o = { i: i, c: cap_, e: e, nha: { x: 26 + (i % 5) * 114, y: 250 + Math.floor(i / 5) * 36 }, gia: -1, ngoi: 0 }; o.p = o.nha; eDat(e, o.nha.x, o.nha.y); return o;
    });
    var daLap = [], tongCho = 0, dat = false, man = 1;
    function lap(o) {
      if (o.gia >= 0 || man !== 1) return; o.gia = daLap.length; daLap.push(o); tongCho += o.c;
      o.e.classList.remove("tc-keo"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true"); tau.appendChild(o.e);
      eMuot(o.e, 400); eDat(o.e, GX(o.gia) - 7, 122, " scale(.17)");
      choT.textContent = dien(t.cho, { n: eSo(tongCho) }); day.setAttribute("width", 560 * tongCho / g.tren_tau);
      if (!dat && tongCho >= g.luat) { dat = true; dau.setAttribute("visibility", "visible"); dauT.classList.add("tc-tx-dong-dau"); sang2.disabled = false; cap.textContent = dien(t.da_dat, { n: eSo(tongCho) }); if (daLap.length < n) het.hidden = false; }
      else if (!dat) cap.textContent = dien(t.lap, { c: o.c, n: eSo(tongCho) });
      if (daLap.length === n) { het.hidden = true; cap.textContent = dien(t.du_20, { n: eSo(tongCho), p: Math.round(100 * tongCho / g.tren_tau) }); }
    }
    keoSvg(c, "g.tc-tx-xuong", function (e, p, b, d) {
      var o = xuong[+e.getAttribute("data-i")]; if (o.gia >= 0 || man !== 1) return false;
      if (b === "bat") { o.lech = null; c.appendChild(e); e.style.transition = ""; return; }
      if (!o.lech) o.lech = { x: d.x - o.p.x, y: d.y - o.p.y }; o.p = { x: p.x - o.lech.x, y: p.y - o.lech.y }; eDat(e, o.p.x, o.p.y);
    }, function (e, p) {
      var o = xuong[+e.getAttribute("data-i")]; if (o.gia >= 0) return;
      if (!p || o.p.y < 200) lap(o); else { o.p = o.nha; eMuot(e, 250); eDat(e, o.nha.x, o.nha.y); }
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-tx-xuong"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); lap(xuong[+e.getAttribute("data-i")]);
    });
    het.onclick = function () { het.hidden = true; xuong.filter(function (o) { return o.gia < 0; }).forEach(function (o, k) { eHen(s, function () { lap(o); }, 70 * k); }); };
    // Màn 2: 23:40, vết rách và các khoang
    var gioT = svg(c, "text", { x: 20, y: 30, class: "tc-tx-gio", visibility: "hidden" }, "23:40");
    function nghieng(a) { tau.setAttribute("transform", "rotate(" + a + " 300 205)"); }
    function gioPhut(m) { m = Math.round(m) % 1440; var h = Math.floor(m / 60), p = m % 60; return h + ":" + (p < 10 ? "0" : "") + p; }
    function veRach() { var k = +th.value; rachL.setAttribute("x1", CX1 - k * CWk); dkChu.textContent = dien(t.rach, { k: k }) + " "; }
    th.oninput = veRach;
    sang2.onclick = function () {
      man = 2; [het, sang2].forEach(function (b) { b.hidden = true; }); thuoc.setAttribute("visibility", "hidden"); dau.setAttribute("visibility", "hidden");
      benG.setAttribute("visibility", "hidden"); bangG.setAttribute("visibility", "visible"); khG.setAttribute("visibility", "visible"); gioT.setAttribute("visibility", "visible");
      xuong.forEach(function (o) { if (o.gia < 0) o.e.setAttribute("visibility", "hidden"); });
      dk.hidden = false; nuoc.hidden = false; veRach(); cap.textContent = t.man_2; nuoc.focus({ preventScroll: true });
    };
    var ngap = false;
    function choNuoc(k) {
      if (ngap) return; ngap = true; nuoc.disabled = that6.disabled = th.disabled = true; th.value = k; veRach();
      nuocO.forEach(function (r) { r.setAttribute("y", DAY); r.setAttribute("height", 0); }); nghieng(0); gioT.textContent = "23:40";
      var H = DAY - DINH;
      eChay(s, 1200, function (f) { for (var j = 0; j < k; j++) { nuocO[j].setAttribute("y", DAY - H * f); nuocO[j].setAttribute("height", H * f); } nghieng(1.2 * f * k / g.chiu); }, function () {
        if (k <= g.chiu) { ngap = false; nuoc.disabled = that6.disabled = th.disabled = false; that6.hidden = false; cap.textContent = dien(t.noi, { k: k }); return; }
        var con = g.khoang - k;
        eChay(s, 3000, function (f) {
          for (var j = k; j < g.khoang; j++) { var u = Math.max(0, Math.min(1, f * con - (j - k))); nuocO[j].setAttribute("y", DAY - H * u); nuocO[j].setAttribute("height", H * u); }
          nghieng(1.2 * k / g.chiu + 5 * f); gioT.textContent = gioPhut(23 * 60 + 40 + 160 * f);
        }, function () { gioT.textContent = "2:20"; cap.textContent = dien(t.chim, { k: k }); nuoc.hidden = that6.hidden = true; dk.hidden = true; sang3.hidden = false; sang3.focus({ preventScroll: true }); });
      });
    }
    nuoc.onclick = function () { choNuoc(+th.value); }; that6.onclick = function () { choNuoc(g.rach); };
    // Màn 3: 0:45 → 2:05, hạ từng xuồng; chờ thì xuồng đầy hơn nhưng nước dâng (tốc độ là minh họa)
    var hien = 0, ngoi = 0, cuu = 0, daHa = 0, choi3 = false, tg3 = 0, tc3 = 0, LAN = 0.9;
    function xuongNay() { return daLap[hien]; }
    function veTrang() { var o = xuongNay(); trang.textContent = o ? dien(t.trang, { i: hien + 1, n: daLap.length, k: Math.floor(ngoi), c: o.c, g: gioPhut(45 + 80 * tc3 / g.ha_ms) }) : ""; }
    function chamVao(o, so_) {
      var can = Math.floor(so_ / g.cham);
      while (o.ngoi < can) {
        var bx = GX(o.gia), tot = null, kc = 1e9;
        cham.forEach(function (ch) { if (!ch.di) { var d = Math.abs(ch.x - bx) + Math.abs(ch.y - 120) * 0.5; if (d < kc) { kc = d; tot = ch; } } });
        if (!tot) break; tot.di = true; o.ngoi++; tot.e.style.transition = giam ? "" : "transform .35s, opacity .35s";
        tot.e.style.transform = "translate(" + (bx - tot.x) + "px," + (124 - tot.y) + "px)"; tot.e.style.opacity = "0";
      }
    }
    function haXuong() {
      var o = xuongNay(); if (!o || !choi3) return; var k = Math.floor(ngoi); o.so = k; cuu += k; daHa++;
      var dx = 40 + (daHa - 1) % 10 * 56, dy = 266 + Math.floor((daHa - 1) / 10) * 56;
      c.appendChild(o.e); eMuot(o.e, 700); eDat(o.e, dx, dy, " scale(.5)");
      svg(c, "text", { x: dx + 21, y: dy + 30, "text-anchor": "middle", class: "tc-e-nho" }, k + "/" + o.c);
      giaO[o.gia].setAttribute("class", "tc-tx-gia");
      hien++; ngoi = 0; if (xuongNay()) giaO[xuongNay().gia].setAttribute("class", "tc-tx-gia tc-tx-gia-nay");
      cap.textContent = dien(t.da_ha, { k: k, c: o.c }); veTrang();
      if (hien >= daLap.length) xong3();
    }
    function vong3(ts) {
      if (!s.isConnected || !choi3) return; var d = Math.min(50, ts - tg3); tg3 = ts; tc3 += d;
      var o = xuongNay(); if (o) { ngoi = Math.min(o.c, ngoi + 65 * d / g.day_ms); chamVao(o, ngoi); }
      nghieng(LAN + 6 * tc3 / g.ha_ms); veTrang();
      if (tc3 >= g.ha_ms) { xong3(); return; }
      requestAnimationFrame(vong3);
    }
    function xong3() {
      if (!choi3) return; choi3 = false; ha.hidden = true; trang.hidden = true; califG.setAttribute("visibility", "visible");
      daLap.forEach(function (o) { if (o.so == null) o.e.setAttribute("opacity", ".35"); });
      ket.innerHTML = "";
      ket.appendChild(tao("p", "", dien(t.ket_ban, { n: eSo(cuu), b: daHa, x: daLap.length, c: eSo(tongCho) })));
      var ul = tao("ul"); t.that.forEach(function (x) { ul.appendChild(tao("li", "", x)); }); ket.appendChild(ul);
      ket.appendChild(tao("p", "", t.ket)); ket.hidden = false; lai.hidden = false; cap.textContent = t.sau_3;
    }
    sang3.onclick = function () {
      man = 3; sang3.hidden = true; khG.setAttribute("visibility", "hidden"); bangG.setAttribute("visibility", "hidden"); nguoiG.setAttribute("visibility", "visible");
      LAN = 0.9; nghieng(LAN); gioT.textContent = "0:45"; trang.hidden = false; ha.hidden = false;
      svg(c, "text", { x: 580, y: 94, "text-anchor": "end", class: "tc-e-nho" }, dien(t.moi_cham, { n: g.cham }));
      if (daLap[0]) giaO[daLap[0].gia].setAttribute("class", "tc-tx-gia tc-tx-gia-nay");
      cap.textContent = t.man_3; choi3 = true; tg3 = performance.now(); veTrang(); ha.focus({ preventScroll: true });
      requestAnimationFrame(function (ts) { tg3 = ts; vong3(ts); });
      var dh = setInterval(function () { if (!s.isConnected || !choi3) { clearInterval(dh); return; } gioT.textContent = gioPhut(45 + 80 * tc3 / g.ha_ms); }, 500);
    };
    ha.onclick = haXuong;
    lai.onclick = function () { eLai(s, tauChim, g, t); };
    cap.textContent = t.doc_mac;
    s.appendChild(san); s.appendChild(cap); s.appendChild(trang); s.appendChild(dk); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 2 E KẾT THÚC ====
  // ==== ĐỢT 2 F BẮT ĐẦU ====
  // Chung cho 3 cảnh của worker F: dựng lại cả cảnh khi chơi lại (hẹn giờ cũ tự bỏ vì cảnh cũ đã rời trang), hẹn giờ ngắn lại khi giảm chuyển động
  function fMoi(s, lam, g, t) { s._dung = true; var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function fHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected && !s._dung) fn(); }, giam ? Math.min(ms, 200) : ms); }
  function fNut(e, fn) { e.addEventListener("click", fn); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(ev); } }); }
  function fNghin(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : "."); }
  function fGio(phut) { return Math.floor(phut / 60) + ":" + String(phut % 60).padStart(2, "0"); }

  // ---------- Cảnh: tấm slide và mảnh bọt (kéo sắp lại dòng trên slide; dòng chốt lên đầu thì lộ so sánh thể tích; rồi cú va; rồi bậc thang con dấu) ----------
  // g.chot: chỉ số dòng chốt trong t.dong; g.ti_le: tỉ lệ thể tích (hai khối lập phương vẽ theo căn bậc ba); g.that: chỉ số con dấu thật trong t.chon
  // t: tieu_de[2], tieu_de_moi, dong[{chu, dich, an?}], keo, khoi_nho, khoi_lon, lan, mo_khoa, doc_mac, binh, canh, tam, va[6], va_dau, va_xong,
  //    buc[{moc, dau}], moc_cuoi, thang_dau, thang_hoi, chon[3], nasa {n}, nut_tiep1, nut_tiep2, nut_lai, ket_chon {c}{n}, ket
  function slideGiauDong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 380", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_tiep1, true), lai = nut(t.nut_lai, false); tiep.disabled = true; hang.appendChild(tiep); hang.appendChild(lai);
    var chonH = tao("div", "tc-hang"); chonH.hidden = true; chonH.setAttribute("role", "group"); chonH.setAttribute("aria-label", t.thang_hoi);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var buoc = 1, mo = false;
    // ---- màn 1: tấm slide phác lại ----
    var v1 = svg(c, "g", {});
    svg(v1, "rect", { x: 16, y: 10, width: 568, height: 262, rx: 6, class: "tc-sg-slide" });
    var tde = svg(v1, "g", { class: "tc-sg-tieu" });
    t.tieu_de.forEach(function (d, i) { svg(tde, "text", { x: 32, y: 40 + i * 23 }, d); });
    var moiT = svg(v1, "text", { x: 32, y: 96, class: "tc-sg-moi", opacity: 0 }, t.tieu_de_moi);
    var SL = [130, 166, 202, 238], CO = [17, 15, 13.5, 11.5];
    var dong = t.dong.map(function (d, k) {
      var e = svg(v1, "g", { class: "tc-keo tc-sg-dong", tabindex: "0", role: "button", "aria-label": d.dich, "data-k": k });
      svg(e, "rect", { x: 24, y: -22, width: 552, height: 32, rx: 5, class: "tc-sg-nen" });
      if (d.an) { svg(e, "rect", { x: 40, y: -11, width: 250, height: 8, rx: 4, class: "tc-sg-xam" }); svg(e, "rect", { x: 300, y: -11, width: 140, height: 8, rx: 4, class: "tc-sg-xam" }); }
      var tx = svg(e, "text", { x: 40, y: 0, class: "tc-sg-chu" }, d.an ? "" : d.chu);
      svg(e, "path", { d: "M558 -11 l5 -5 l5 5 M558 -3 l5 5 l5 -5", class: "tc-sg-tay" });
      return { e: e, tx: tx, o: k };
    });
    var thu = dong.map(function (_, k) { return k; });
    var goi = svg(v1, "text", { x: 300, y: 322, "text-anchor": "middle", class: "tc-sg-goi" }, t.keo);
    // hai khối lập phương: cạnh tỉ lệ theo căn bậc ba của tỉ lệ thể tích
    var khoi = svg(v1, "g", { class: "tc-sg-khoi", opacity: 0 });
    function lapPhuong(x, y, a, lop) {
      var d = a * 0.45;
      svg(khoi, "path", { d: "M" + x + " " + y + " h" + a + " v" + (-a) + " h" + (-a) + " Z", class: lop });
      svg(khoi, "path", { d: "M" + x + " " + (y - a) + " l" + d + " " + (-d) + " h" + a + " l" + (-d) + " " + d + " Z", class: lop + " tc-sg-sang" });
      svg(khoi, "path", { d: "M" + (x + a) + " " + y + " l" + d + " " + (-d) + " v" + (-a) + " l" + (-d) + " " + d + " Z", class: lop + " tc-sg-toi" });
    }
    var aL = 54; lapPhuong(34, 368, aL / Math.cbrt(g.ti_le), "tc-sg-k1"); lapPhuong(70, 368, aL, "tc-sg-k2");
    svg(khoi, "text", { x: 172, y: 304, class: "tc-sg-nhan" }, t.khoi_nho);
    svg(khoi, "text", { x: 172, y: 328, class: "tc-sg-nhan" }, t.khoi_lon);
    svg(khoi, "text", { x: 172, y: 362, class: "tc-sg-lan" }, t.lan);
    function veHang(muot) {
      thu.forEach(function (k, o) {
        var d = dong[k]; d.o = o; d.e.style.transition = muot && !giam ? "transform .25s" : "";
        d.e.setAttribute("transform", "translate(0," + SL[o] + ")"); d.tx.style.fontSize = CO[o] + "px";
        d.e.classList.toggle("tc-sg-dau", o === 0);
      });
      if (!mo && thu[0] === g.chot) moKhoa();
    }
    function moKhoa() {
      mo = true; tde.classList.add("tc-sg-sai"); moiT.setAttribute("opacity", 1); goi.setAttribute("opacity", 0);
      khoi.setAttribute("opacity", 1); khoi.classList.add("tc-sg-hien"); cap.textContent = t.mo_khoa; tiep.disabled = false;
    }
    function doi(k, o) { thu.splice(thu.indexOf(k), 1); thu.splice(o, 0, k); cap.textContent = t.dong[k].dich; veHang(true); }
    var y0 = 0;
    keoSvg(c, "g.tc-sg-dong", function (e, p, b, dau) {
      if (buoc !== 1) return false; var d = dong[+e.getAttribute("data-k")];
      if (b === "bat") { v1.appendChild(e); e.style.transition = ""; y0 = SL[d.o]; return; }
      e.setAttribute("transform", "translate(0," + Math.max(110, Math.min(262, y0 + p.y - dau.y)) + ")");
    }, function (e, p) {
      var k = +e.getAttribute("data-k");
      if (!p) { cap.textContent = t.dong[k].dich; veHang(true); return; }
      var m = (e.getAttribute("transform") || "").match(/,([-\d.]+)\)/), y = m ? +m[1] : SL[dong[k].o];
      doi(k, Math.max(0, Math.min(SL.length - 1, Math.round((y - SL[0]) / (SL[1] - SL[0])))));
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-sg-dong"); if (!e || buoc !== 1) return;
      var mv = ev.key === "ArrowUp" || ev.key === "Enter" || ev.key === " " ? -1 : ev.key === "ArrowDown" ? 1 : 0; if (!mv) return;
      ev.preventDefault(); var k = +e.getAttribute("data-k"); doi(k, Math.max(0, Math.min(SL.length - 1, dong[k].o + mv))); e.focus();
    });
    veHang(false);
    // ---- màn 2: giây 81,7 (hình phác, minh họa) ----
    var v2 = svg(c, "g", { display: "none" });
    for (var i = 0; i < 26; i++) svg(v2, "circle", { cx: (i * 137) % 590 + 5, cy: (i * 71) % 370 + 5, r: i % 3 ? 1 : 1.6, class: "tc-sg-sao" });
    svg(v2, "rect", { x: 30, y: 36, width: 540, height: 70, rx: 35, class: "tc-sg-binh" });
    svg(v2, "text", { x: 340, y: 77, "text-anchor": "middle", class: "tc-sg-chu-binh" }, t.binh);
    svg(v2, "path", { d: "M106 106 l10 14 h16 l10 -14 Z", class: "tc-sg-de" });
    svg(v2, "rect", { x: 60, y: 136, width: 470, height: 44, rx: 22, class: "tc-sg-than" });
    svg(v2, "path", { d: "M230 180 L520 180 L520 330 L440 330 Z", class: "tc-sg-canh" });
    var A = { x: 230, y: 180 }, B = { x: 440, y: 330 }, N = 11;
    function mep(f) { return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f }; }
    for (var k = 0; k < N; k++) { var p1 = mep(k / N + 0.006), p2 = mep((k + 1) / N - 0.006); svg(v2, "line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: "tc-sg-tam" + (k === 7 ? " tc-sg-tam8" : k % 2 ? " tc-sg-tam-le" : "") }); }
    var p8 = mep(7.5 / N);
    svg(v2, "text", { x: p8.x + 30, y: p8.y + 6, class: "tc-sg-so8" }, t.tam);
    svg(v2, "text", { x: 500, y: 352, "text-anchor": "middle", class: "tc-sg-nhan-nho" }, t.canh);
    var lo = svg(v2, "g", { opacity: 0 });
    svg(lo, "circle", { cx: p8.x, cy: p8.y, r: 26, class: "tc-sg-chop" }); svg(lo, "ellipse", { cx: p8.x, cy: p8.y, rx: 8, ry: 6, class: "tc-sg-lo" });
    var bot = svg(v2, "path", { d: "M-9 -5 L7 -7 L10 3 L-4 7 Z", class: "tc-sg-bot" });
    var dh = svg(v2, "text", { x: 584, y: 128, "text-anchor": "end", class: "tc-sg-gio" }, "");
    var vaT = t.va.map(function (x, i) { return svg(v2, "text", { x: 22, y: 220 + i * 24, class: "tc-sg-nhan", opacity: 0 }, x); });
    function hienVa(a, b) { for (var i = a; i <= b; i++) vaT[i].setAttribute("opacity", 1); }
    function chayVa() {
      var t0 = null, T = giam ? 0 : 1600, P0 = { x: 124, y: 118 }, C = { x: 250, y: 118 };
      hienVa(0, 1);
      (function buocVa(ts) {
        if (!s.isConnected) return; if (t0 == null) t0 = ts;
        var f = T ? Math.min(1, (ts - t0) / T) : 1, u = 1 - f;
        bot.setAttribute("transform", "translate(" + (u * u * P0.x + 2 * u * f * C.x + f * f * p8.x) + "," + (u * u * P0.y + 2 * u * f * C.y + f * f * p8.y) + ") rotate(" + Math.round(f * 540) + ")");
        dh.textContent = "T+ " + so(81.7 + 0.2 * f, 1) + " s";
        if (f < 1) requestAnimationFrame(buocVa); else vaCham();
      })(performance.now());
    }
    function vaCham() {
      bot.setAttribute("opacity", 0); lo.setAttribute("opacity", 1); lo.classList.add("tc-sg-no"); hienVa(2, 3);
      fHen(s, function () { hienVa(4, 5); cap.textContent = t.va_xong; tiep.textContent = t.nut_tiep2; tiep.disabled = false; }, 900);
    }
    // ---- màn 3: bậc thang con dấu ----
    var v3 = svg(c, "g", { display: "none" }), MAU = ["#F87171", "#FB923C", "#FBBF24", "#CBD5E1"], dau = [], Y5 = 14 + 4 * 72;
    t.buc.concat([{ moc: t.moc_cuoi }]).forEach(function (b, i) {
      var y = 14 + i * 72;
      svg(v3, "rect", { x: 14, y: y, width: 572, height: 62, rx: 8, class: "tc-sg-the" + (i === 4 ? " tc-sg-the-cuoi" : "") });
      svg(v3, "text", { x: 30, y: y + 37, class: "tc-sg-moc" }, b.moc);
      if (i < 4) dau.push(conDau(420, y + 31, b.dau, MAU[i], -4));
      else svg(v3, "rect", { x: 290, y: y + 10, width: 260, height: 42, rx: 6, class: "tc-sg-o" });
    });
    function conDau(x, y, chu, mauVien, goc) {
      var e = svg(v3, "g", { transform: "translate(" + x + "," + y + ") rotate(" + goc + ")", opacity: 0 });
      var b = svg(e, "g", { class: "tc-sg-dau-in" });
      svg(b, "rect", { x: -128, y: -20, width: 256, height: 40, rx: 6, class: "tc-sg-dau-nen", style: "stroke:" + mauVien });
      var tx = svg(b, "text", { x: 0, y: 7, "text-anchor": "middle", class: "tc-sg-dau-chu", style: "fill:" + mauVien }, chu);
      try { if (tx.getComputedTextLength() > 236) { tx.setAttribute("textLength", 236); tx.setAttribute("lengthAdjust", "spacingAndGlyphs"); } } catch (er) {}
      return e;
    }
    function an(e) { e.setAttribute("opacity", 1); e.firstChild.classList.add("tc-sg-dap"); }
    t.chon.forEach(function (x, k) {
      var b = nut(x, false);
      b.onclick = function () {
        [].forEach.call(chonH.children, function (n) { n.disabled = true; }); b.classList.add("tc-da-chon");
        var cua = conDau(420, Y5 + 31, x, "#E8EDF7", -3); an(cua);
        fHen(s, function () {
          if (k !== g.that) { cua.setAttribute("opacity", 0); an(conDau(420, Y5 + 31, dien(t.nasa, { n: t.chon[g.that] }), "#F87171", 3)); }
          ket.innerHTML = ""; ket.appendChild(tao("p", "", dien(t.ket_chon, { c: x, n: t.chon[g.that] }))); ket.appendChild(tao("p", "", t.ket)); ket.hidden = false;
        }, 700);
      };
      chonH.appendChild(b);
    });
    tiep.onclick = function () {
      if (buoc === 1) { buoc = 2; v1.setAttribute("display", "none"); v2.removeAttribute("display"); tiep.disabled = true; cap.textContent = t.va_dau; chayVa(); }
      else if (buoc === 2) {
        buoc = 3; v2.setAttribute("display", "none"); v3.removeAttribute("display"); tiep.hidden = true; cap.textContent = t.thang_dau;
        dau.forEach(function (d, i) { fHen(s, function () { an(d); if (i === dau.length - 1) { chonH.hidden = false; cap.textContent = t.thang_hoi; } }, 400 + i * 650); });
      }
    };
    lai.onclick = function () { fMoi(s, slideGiauDong, g, t); };
    [san, cap, chonH, hang, ket].forEach(function (x) { s.appendChild(x); }); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tám máy chủ (8:00 kéo gói bản mới vào 8 tủ, một lần thả trượt không báo; 9:30 mở sàn, tìm và ngắt máy phun lệnh) ----------
  // g.may, g.phut (số phút thật), g.nhip (ms cho mỗi phút trong trò), g.email, g.khop, g.co_phieu, g.mua (tỷ USD); số đếm chạy đều theo phút là minh họa
  // t: goi, keo, may {n}, san, hop_thu, dem[3], ty {v}, kiem, nut_mo, nut_go, nut_kill, nut_lai, doc_mac, da_cai {n}, co_roi {n}, kiem_tim {n}, kiem_ok,
  //    mo_san, mo_on, on {n}, ngat {n}, da_go, cu, tat, ket_dung {p}, ket_het, ket_on, chuoi[3], lo_nhan, lo[[số, nguồn]], ket
  function mayChu(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var kiem = tao("label", "tc-mc-kiem"), hop = tao("input"); hop.type = "checkbox"; kiem.appendChild(hop); kiem.appendChild(document.createTextNode(" " + t.kiem));
    var hang = tao("div", "tc-hang"), mo = nut(t.nut_mo, true), go = nut(t.nut_go, false), kill = nut(t.nut_kill, false), lai = nut(t.nut_lai, false);
    mo.disabled = true; go.hidden = true; kill.hidden = true; kill.disabled = true; kill.classList.add("tc-mc-kill");
    [mo, go, kill, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 36, class: "tc-mc-thanh" });
    var hopThu = svg(c, "text", { x: 16, y: 24, class: "tc-mc-thu" }, "✉ 0 " + t.hop_thu);
    svg(c, "text", { x: 300, y: 24, "text-anchor": "middle", class: "tc-mc-nho" }, t.san);
    var gio = svg(c, "text", { x: 584, y: 25, "text-anchor": "end", class: "tc-mc-gio" }, "8:00");
    svg(c, "rect", { x: 10, y: 292, width: 580, height: 26, rx: 6, class: "tc-mc-cho" });
    svg(c, "text", { x: 300, y: 310, "text-anchor": "middle", class: "tc-mc-nho" }, t.thi_truong);
    var W = 58, may = [], pha = 1, dem = 0, truot = 2 + Math.floor(Math.random() * 5), timThay = 0;
    function X(i) { return 26 + i * 70; }
    for (var i = 0; i < g.may; i++) (function (i) {
      var e = svg(c, "g", { class: "tc-mc-tu", tabindex: "0", role: "button", "aria-label": dien(t.may, { n: i + 1 }), transform: "translate(" + X(i) + ",122)" });
      svg(e, "rect", { x: 0, y: 0, width: W, height: 150, rx: 6, class: "tc-mc-vo" });
      svg(e, "text", { x: W / 2, y: 21, "text-anchor": "middle", class: "tc-mc-so" }, i + 1);
      for (var k = 0; k < 4; k++) { svg(e, "rect", { x: 8, y: 32 + k * 19, width: W - 16, height: 12, rx: 3, class: "tc-mc-khe" }); svg(e, "circle", { cx: W - 14, cy: 38 + k * 19, r: 2.6, class: "tc-mc-led" }); }
      var nhan = svg(e, "text", { x: W / 2, y: 124, "text-anchor": "middle", class: "tc-mc-nhan" }, "");
      svg(e, "rect", { x: 8, y: 134, width: W - 16, height: 7, rx: 3.5, class: "tc-mc-ray" });
      var thanh = svg(e, "rect", { x: 8, y: 134, width: 0, height: 7, rx: 3.5, class: "tc-mc-day" });
      fNut(e, function () { bam(i); });
      may.push({ e: e, nhan: nhan, thanh: thanh, cai: false, moi: false, tat: false });
    })(i);
    // gói bản mới, kéo vào tủ
    var goi = svg(c, "g", { class: "tc-keo tc-mc-goi", tabindex: "0", role: "button", "aria-label": t.goi });
    svg(goi, "rect", { x: 0, y: 0, width: 96, height: 56, rx: 8, class: "tc-mc-hop" });
    svg(goi, "text", { x: 48, y: 26, "text-anchor": "middle", class: "tc-mc-hop-chu" }, "RLP"); svg(goi, "text", { x: 48, y: 45, "text-anchor": "middle", class: "tc-mc-hop-nho" }, t.goi);
    var NHA = { x: 22, y: 50 }, gp = NHA;
    function datGoi(p, muot) { goi.style.transition = muot && !giam ? "transform .3s" : ""; goi.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); gp = p; }
    datGoi(NHA);
    var goiY = svg(c, "text", { x: 134, y: 84, class: "tc-mc-nho" }, t.keo);
    var dk = [0, 0, 0], soDem = [0, 1, 2].map(function (k) {
      var x = 100 + k * 200; svg(c, "text", { x: x, y: 384, "text-anchor": "middle", class: "tc-mc-nho" }, t.dem[k]);
      return svg(c, "text", { x: x, y: 360, "text-anchor": "middle", class: "tc-mc-dem" }, "0");
    });
    function veDem() { soDem[0].textContent = fNghin(dk[0]); soDem[1].textContent = fNghin(dk[1]); soDem[2].textContent = dien(t.ty, { v: so(dk[2], 2) }); }
    veDem();
    var hatG = svg(c, "g", {});
    function day(o, muot) {
      var w = o.moi ? W - 16 : 0; if (!muot || giam) { o.thanh.setAttribute("width", w); return; }
      var t0 = null; (function b(ts) { if (t0 == null) t0 = ts; var f = Math.min(1, (ts - t0) / 600); o.thanh.setAttribute("width", w * f); if (f < 1 && s.isConnected) requestAnimationFrame(b); })(performance.now());
    }
    function phun(o) { return pha === 2 && !o.tat && (goHet || !o.moi); }
    function soPhun() { return may.filter(phun).length; }
    function veTu(o) {
      var ph = phun(o); o.e.classList.toggle("tc-mc-phun", ph); o.e.classList.toggle("tc-mc-tat", o.tat);
      o.nhan.textContent = pha === 1 ? "" : o.tat ? t.tat : ph ? t.cu : "RLP";
    }
    function cai(i) {
      var o = may[i];
      if (!o.cai) { o.cai = true; dem++; o.moi = dem !== truot; day(o, true); }
      else if (!o.moi) { o.moi = true; day(o, true); }
      else { cap.textContent = dien(t.co_roi, { n: i + 1 }); return; }
      cap.textContent = dien(t.da_cai, { n: i + 1 });
      hopThu.textContent = "✉ " + Math.round(g.email * dem / g.may) + " " + t.hop_thu; gio.textContent = fGio(480 + dem * 11);
      if (dem === g.may) mo.disabled = false;
    }
    function tiepTheo() { for (var k = 0; k < may.length; k++) if (!may[k].cai) return k; return -1; }
    var lech = null;
    keoSvg(c, "g.tc-mc-goi", function (e, p, b, dau) {
      if (pha !== 1) return false; if (b === "bat") { lech = null; c.appendChild(e); return; }
      if (!lech) lech = { x: dau.x - gp.x, y: dau.y - gp.y }; datGoi({ x: p.x - lech.x, y: p.y - lech.y });
    }, function (e, p) {
      if (!p) { var k0 = tiepTheo(); if (k0 >= 0) cai(k0); datGoi(NHA, true); return; }
      var cx = gp.x + 48, cy = gp.y + 28, k = -1;
      may.forEach(function (o, i) { if (cx > X(i) - 6 && cx < X(i) + W + 6 && cy > 96 && cy < 300) k = i; });
      if (k >= 0) cai(k); datGoi(NHA, true);
    });
    goi.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && pha === 1) { ev.preventDefault(); var k = tiepTheo(); if (k >= 0) cai(k); } });
    var p = 0, nhip = null, goHet = false, hat = [], cuoi = 0;
    function bam(i) {
      if (pha === 1) { cai(i); return; }
      if (pha !== 2) return; var o = may[i];
      if (phun(o)) { o.tat = true; veTu(o); cap.textContent = dien(t.ngat, { n: i + 1 }); if (!soPhun()) het("dung"); }
      else if (!o.tat) cap.textContent = dien(t.on, { n: i + 1 });
    }
    mo.onclick = function () {
      mo.hidden = true; hop.disabled = true; goi.setAttribute("display", "none"); goiY.setAttribute("display", "none");
      gio.textContent = "9:30"; hopThu.textContent = "✉ " + g.email + " " + t.hop_thu;
      if (hop.checked) soi(0); else batSan();
    };
    function soi(i) {
      if (i >= may.length) { if (!timThay) cap.textContent = t.kiem_ok; fHen(s, batSan, 700); return; }
      var o = may[i]; o.e.classList.add("tc-mc-soi");
      fHen(s, function () {
        o.e.classList.remove("tc-mc-soi");
        if (!o.moi) { o.moi = true; timThay = i + 1; day(o, true); cap.textContent = dien(t.kiem_tim, { n: i + 1 }); fHen(s, function () { soi(i + 1); }, 1400); }
        else soi(i + 1);
      }, 280);
    }
    function batSan() {
      pha = 2; var loi = soPhun() > 0; cap.textContent = loi ? t.mo_san : t.mo_on;
      if (loi) { go.hidden = false; kill.hidden = false; }
      may.forEach(veTu);
      nhip = setInterval(function () {
        if (!s.isConnected) { clearInterval(nhip); return; }
        p++; gio.textContent = fGio(570 + p);
        if (soPhun()) { dk = [g.khop, g.co_phieu, g.mua].map(function (v, k) { return Math.min(v, dk[k] + v / g.phut); }); veDem(); }
        if (!loi && p >= 6) het("on"); else if (p >= g.phut) het("het");
      }, g.nhip);
      if (!giam) requestAnimationFrame(vongHat);
    }
    function vongHat(ts) {
      if (!s.isConnected) return;
      if (pha !== 2) { hatG.innerHTML = ""; hat = []; return; }
      if (ts - cuoi > 240) { cuoi = ts; var i = Math.floor(Math.random() * may.length); if (!may[i].tat) hat.push({ e: svg(hatG, "circle", { r: 4, class: "tc-mc-me" }), x: X(i) + W / 2, y: 40, vx: 0, vy: 2.4, me: true }); }
      may.forEach(function (o, i) { if (phun(o) && hat.length < 260) for (var n = 0; n < 2; n++) hat.push({ e: svg(hatG, "circle", { r: 2.4, class: "tc-mc-con" }), x: X(i) + W / 2 + (Math.random() - 0.5) * 30, y: 272, vx: (Math.random() - 0.5) * 5, vy: 1.4 + Math.random() * 2.2 }); });
      hat = hat.filter(function (h) {
        h.x += h.vx; h.y += h.vy;
        if ((h.me && h.y >= 118) || (!h.me && h.y > 316)) { h.e.remove(); return false; }
        h.e.setAttribute("cx", h.x); h.e.setAttribute("cy", h.y); return true;
      });
      requestAnimationFrame(vongHat);
    }
    go.onclick = function () { goHet = true; go.disabled = true; cap.textContent = t.da_go; may.forEach(veTu); };
    function het(kieu) {
      clearInterval(nhip); pha = 3; go.disabled = true; may.forEach(function (o) { o.e.classList.remove("tc-mc-phun"); });
      ket.innerHTML = "";
      ket.appendChild(tao("p", "", kieu === "dung" ? dien(t.ket_dung, { p: p }) : kieu === "het" ? t.ket_het : t.ket_on));
      var ch = tao("p", "tc-mc-chuoi"); t.chuoi.forEach(function (x, k) { if (k) ch.appendChild(document.createTextNode(" → ")); ch.appendChild(tao("b", "", x)); }); ket.appendChild(ch);
      ket.appendChild(tao("p", "", t.lo_nhan));
      var ul = tao("ul"); t.lo.forEach(function (x) { var li = tao("li"); li.appendChild(tao("b", "", x[0])); li.appendChild(document.createTextNode(" · " + x[1])); ul.appendChild(li); }); ket.appendChild(ul);
      ket.appendChild(tao("p", "", t.ket)); ket.hidden = false;
    }
    lai.onclick = function () { fMoi(s, mayChu, g, t); };
    [san, cap, kiem, hang, ket].forEach(function (x) { s.appendChild(x); }); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: buồng lái rung (MCAS chúi mũi theo một cảm biến; kéo bánh trim ngược, mở nắp rồi gạt hai công tắc CUTOUT; lượt 2 là bản sửa 2020) ----------
  // g.toc_do (°/giây), g.toi_da (° mỗi lần), g.lech (° cảm biến sai), g.gia_dinh, g.thu (giây), g.nghi (ms MCAS chờ sau mỗi lần trim ngược, minh họa), g.het (giây tối đa)
  // t: coi[4], trai, phai, lech, so_sanh, trim, len, keo_trim, cutout, nap {n}, gat {n}, moc_gd, moc_thu, ban, dong_ho {m}{s}, dang_len, doc_mac, mcas_lai,
  //    nap_mo, cat_mot, nut_go, nut_go2, nut_lai, mat {s}, qua_lau, ket1, sua, sua_ket, ket
  function buongLai(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), go = nut(t.nut_go, true), go2 = nut(t.nut_go2, true), lai = nut(t.nut_lai, false);
    go2.hidden = true; lai.hidden = true; [go, go2, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var kr = svg(c, "g", { class: "tc-bl-khung" }), defs = svg(kr, "defs", {});
    var den = t.coi.map(function (x, i) {
      var e = svg(kr, "g", { class: "tc-bl-den", transform: "translate(" + (14 + i * 145) + ",10)" });
      svg(e, "rect", { x: 0, y: 0, width: 137, height: 28, rx: 5 }); svg(e, "text", { x: 68.5, y: 19, "text-anchor": "middle" }, x); return e;
    });
    // đường chân trời nhân tạo
    var CX = 240, CY = 166, R = 92, cp = g.id + "-cp", cl = svg(defs, "clipPath", { id: cp }); svg(cl, "circle", { cx: CX, cy: CY, r: R });
    svg(kr, "circle", { cx: CX, cy: CY, r: R + 8, class: "tc-bl-o" });
    var troi = svg(svg(kr, "g", { "clip-path": "url(#" + cp + ")" }), "g", {});
    svg(troi, "rect", { x: CX - 120, y: CY - 400, width: 240, height: 400, class: "tc-bl-troi" }); svg(troi, "rect", { x: CX - 120, y: CY, width: 240, height: 400, class: "tc-bl-dat" });
    svg(troi, "line", { x1: CX - 120, x2: CX + 120, y1: CY, y2: CY, class: "tc-bl-vach" });
    [-3, -2, -1, 1, 2, 3].forEach(function (k) { var w = k % 2 ? 16 : 30; svg(troi, "line", { x1: CX - w, x2: CX + w, y1: CY + k * 18, y2: CY + k * 18, class: "tc-bl-thang" }); });
    svg(kr, "path", { d: "M" + (CX - 62) + " " + CY + " h38 l24 12 l24 -12 h38", class: "tc-bl-may-bay" }); svg(kr, "circle", { cx: CX, cy: CY, r: 4, class: "tc-bl-tam" });
    // hai cánh cảm biến góc tấn
    function canhGio(x, nhan) {
      var e = svg(kr, "g", { transform: "translate(" + x + "," + CY + ")" }); svg(e, "circle", { r: 26, class: "tc-bl-o" });
      var la = svg(e, "path", { d: "M0 0 L-5 -6 L-24 -3 L-24 3 L-5 6 Z", class: "tc-bl-la" }); svg(e, "circle", { r: 4, class: "tc-bl-tam" });
      svg(kr, "text", { x: x, y: CY - 38, "text-anchor": "middle", class: "tc-bl-nho" }, nhan); return la;
    }
    var laT = canhGio(62, t.trai), laP = canhGio(400, t.phai);
    var lechT = svg(kr, "text", { x: 62, y: CY + 50, "text-anchor": "middle", class: "tc-bl-do", opacity: 0 }, t.lech);
    var soSanh = svg(kr, "text", { x: 400, y: CY + 50, "text-anchor": "middle", class: "tc-bl-xanh", opacity: 0 }, t.so_sanh);
    // bánh xe trim
    var TX = 482, TY = 66, TW = 56, TH = 186, ct = g.id + "-ct", cl2 = svg(defs, "clipPath", { id: ct }); svg(cl2, "rect", { x: TX, y: TY, width: TW, height: TH, rx: 10 });
    svg(kr, "text", { x: TX + TW / 2, y: TY - 8, "text-anchor": "middle", class: "tc-bl-nho" }, t.trim);
    var banh = svg(kr, "g", { class: "tc-keo tc-bl-banh", tabindex: "0", role: "button", "aria-label": t.keo_trim });
    svg(banh, "rect", { x: TX - 14, y: TY - 4, width: TW + 28, height: TH + 8, rx: 12, style: "fill:transparent" });
    svg(banh, "rect", { x: TX, y: TY, width: TW, height: TH, rx: 10, class: "tc-bl-trong" });
    var soc = svg(svg(banh, "g", { "clip-path": "url(#" + ct + ")" }), "g", {});
    for (var k = -1; k < 15; k++) svg(soc, "rect", { x: TX, y: TY + k * 14, width: TW, height: 6, class: "tc-bl-soc" });
    svg(kr, "text", { x: TX + TW / 2, y: TY + TH + 20, "text-anchor": "middle", class: "tc-bl-nho" }, t.len);
    // hai công tắc CUTOUT có nắp che
    var cong = [0, 1].map(function (k) {
      var x = 482 + k * 76, e = svg(kr, "g", { class: "tc-cham-duoc tc-bl-cong", tabindex: "0", role: "button", "aria-label": dien(t.nap, { n: k + 1 }) });
      svg(e, "rect", { x: x - 28, y: 294, width: 56, height: 60, rx: 6, class: "tc-bl-de" });
      var can = svg(e, "line", { x1: x, y1: 330, x2: x, y2: 306, class: "tc-bl-can" }); svg(e, "circle", { cx: x, cy: 330, r: 6, class: "tc-bl-goc" });
      var nap = svg(e, "g", { class: "tc-bl-nap" });
      svg(nap, "rect", { x: x - 30, y: 292, width: 60, height: 64, rx: 6, class: "tc-bl-nap-nen" });
      for (var j = 0; j < 4; j++) svg(nap, "line", { x1: x - 26 + j * 16, y1: 352, x2: x - 10 + j * 16, y2: 296, class: "tc-bl-soc-nap" });
      svg(kr, "text", { x: x, y: 372, "text-anchor": "middle", class: "tc-bl-nho" }, k + 1);
      var o = { e: e, can: can, nap: nap, mo: false, cat: false };
      fNut(e, function () {
        if (pha !== "su" || luot !== 1 || o.cat) return;
        if (!o.mo) { o.mo = true; nap.classList.add("tc-bl-nap-mo"); e.setAttribute("aria-label", dien(t.gat, { n: k + 1 })); loi = t.nap_mo; loiDen = performance.now() + 2500; }
        else { o.cat = true; can.setAttribute("y2", 352); e.classList.add("tc-bl-da-cat"); if (cong.every(function (q) { return q.cat; })) xong("cat"); else { loi = t.cat_mot; loiDen = performance.now() + 2500; } }
      });
      return o;
    });
    svg(kr, "text", { x: 520, y: 392, "text-anchor": "middle", class: "tc-bl-nho" }, t.cutout);
    // thước giây
    var R0 = 30, R1 = 390, RY = 344; function sx(v) { return R0 + v * (R1 - R0) / g.het; }
    svg(kr, "line", { x1: R0, x2: R1, y1: RY, y2: RY, class: "tc-bl-thuoc" });
    for (var v = 0; v <= g.het; v += 2) svg(kr, "line", { x1: sx(v), x2: sx(v), y1: RY - 4, y2: RY + 4, class: "tc-bl-thuoc" });
    svg(kr, "text", { x: R0, y: RY + 18, "text-anchor": "middle", class: "tc-bl-nho" }, "0 s"); svg(kr, "text", { x: R1, y: RY + 18, "text-anchor": "middle", class: "tc-bl-nho" }, g.het + " s");
    svg(kr, "line", { x1: sx(g.gia_dinh), x2: sx(g.gia_dinh), y1: 300, y2: RY, class: "tc-bl-moc-gd" }); svg(kr, "text", { x: sx(g.gia_dinh), y: 294, "text-anchor": "middle", class: "tc-bl-vang" }, t.moc_gd);
    svg(kr, "line", { x1: sx(g.thu), x2: sx(g.thu), y1: 318, y2: RY, class: "tc-bl-moc-thu" }); svg(kr, "text", { x: sx(g.thu), y: 313, "text-anchor": "start", class: "tc-bl-do" }, t.moc_thu);
    var dau = svg(kr, "g", { opacity: 0 }); svg(dau, "path", { d: "M0 4 l-8 13 h16 Z", class: "tc-bl-dau" }); svg(dau, "text", { x: 0, y: 34, "text-anchor": "middle", class: "tc-bl-trang" }, t.ban);
    // trạng thái
    var pha = "cho", luot = 1, m = 0, lan = 0, nghiDen = 0, choLai = false, t0 = 0, nhip = null, loi = "", loiDen = 0;
    function ve() { troi.setAttribute("transform", "translate(0," + (-Math.min(84, m * 14)) + ")"); soc.setAttribute("transform", "translate(0," + ((m * 30) % 14).toFixed(1) + ")"); }
    function catCanh() {
      go.hidden = true; go2.hidden = true; lai.hidden = true; pha = "len"; m = 0; lan = 0; ve(); cap.textContent = t.dang_len;
      fHen(s, suCo, 1500 + Math.random() * 1500);
    }
    function suCo() {
      pha = "su"; t0 = performance.now(); nghiDen = 0; choLai = false; laT.setAttribute("transform", "rotate(" + g.lech + ")"); lechT.setAttribute("opacity", 1);
      if (luot === 2) { soSanh.setAttribute("opacity", 1); cap.textContent = t.sua; fHen(s, function () { xong("sua"); }, 3800); return; }
      den.forEach(function (d) { d.classList.add("tc-bl-bat"); }); c.classList.add("tc-bl-rung");
      nhip = setInterval(buoc, 100); buoc();
    }
    function buoc() {
      if (!s.isConnected) { clearInterval(nhip); return; }
      var bay = performance.now(), gi = (bay - t0) / 1000;
      if (bay >= nghiDen) {
        if (choLai) { choLai = false; loi = t.mcas_lai; loiDen = bay + 2000; }
        var d = g.toc_do / 10; m += d; lan += d; if (lan >= g.toi_da) { lan = 0; nghiDen = bay + g.nghi; }
      }
      ve(); cap.textContent = (bay < loiDen ? loi + " · " : "") + dien(t.dong_ho, { m: so(m, 2), s: so(gi, 1) });
      if (gi >= g.het) xong("lau");
    }
    function keoTrim(dy) { if (dy <= 0 || pha !== "su" || luot !== 1) return; m = Math.max(0, m - dy * 0.02); lan = 0; nghiDen = performance.now() + g.nghi; choLai = true; ve(); }
    var yTruoc = null;
    keoSvg(c, "g.tc-bl-banh", function (e, p, b, dau0) {
      if (pha !== "su" || luot !== 1) return false; if (b === "bat") { yTruoc = null; return; }
      if (yTruoc == null) yTruoc = dau0.y; keoTrim(yTruoc - p.y); yTruoc = p.y;
    }, function (e, p) { if (!p) keoTrim(20); });
    banh.addEventListener("keydown", function (ev) { if (ev.key === "ArrowUp" || ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); keoTrim(20); } });
    function xong(kieu) {
      clearInterval(nhip); pha = "xong"; var gi = (performance.now() - t0) / 1000;
      c.classList.remove("tc-bl-rung"); den.forEach(function (d) { d.classList.remove("tc-bl-bat"); });
      if (luot === 1) {
        if (kieu === "cat") { dau.setAttribute("transform", "translate(" + sx(Math.min(gi, g.het)) + "," + RY + ")"); dau.setAttribute("opacity", 1); }
        var dong1 = kieu === "cat" ? dien(t.mat, { s: so(gi, 1) }) : t.qua_lau;
        cap.textContent = dong1; ket.innerHTML = ""; ket.appendChild(tao("p", "", dong1 + " " + t.ket1)); ket.hidden = false; go2.hidden = false; lai.hidden = false;
      } else {
        cap.textContent = t.sua; ket.appendChild(tao("p", "", t.sua_ket)); ket.appendChild(tao("p", "tc-bl-346", t.ket)); lai.hidden = false;
      }
    }
    go.onclick = catCanh;
    go2.onclick = function () {
      luot = 2; laT.setAttribute("transform", ""); lechT.setAttribute("opacity", 0);
      cong.forEach(function (o, k) { o.mo = o.cat = false; o.nap.classList.remove("tc-bl-nap-mo"); o.e.classList.remove("tc-bl-da-cat"); o.can.setAttribute("y2", 306); o.e.setAttribute("aria-label", dien(t.nap, { n: k + 1 })); });
      catCanh();
    };
    lai.onclick = function () { fMoi(s, buongLai, g, t); };
    ve();
    [san, cap, hang, ket].forEach(function (x) { s.appendChild(x); }); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 2 F KẾT THÚC ====
  // ==== ĐỢT 3 H BẮT ĐẦU ====
  // Ba cảnh Nhìn lại sự kiện lớn: ban-dieu-phoi (COVID-19), phong-may-y2k (Y2K), bom-bong-bong (dot-com).
  // Sân khấu nền tối cố định (tc-canh-toi), nên màu riêng (tc-h-*, tc-dp-*, tc-y2-*, tc-bb-*) giống nhau ở chế độ sáng và tối.
  function hHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected && !s._dung) fn(); }, giam ? Math.min(ms, 120) : ms); }
  function hLai(s, lam, g, t) { s._dung = true; var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function hChay(s, ms, buoc, xong) {
    if (giam || ms <= 0) { buoc(1); if (xong) xong(); return; }
    var t0 = null;
    (function f(ts) { if (!s.isConnected || s._dung) return; if (t0 == null) t0 = ts; var x = Math.min(1, (ts - t0) / ms); buoc(x); if (x < 1) requestAnimationFrame(f); else if (xong) xong(); })(performance.now());
  }
  function hDat(e, x, y, them) { e.setAttribute("transform", "translate(" + x + "," + y + ")" + (them || "")); }
  function hSo2(x) { var p = x.toFixed(2).split("."); return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : ".") + (en ? "." : ",") + p[1]; }
  function hBat(b, on) { b.classList.toggle("tc-h-bat", !!on); b.setAttribute("aria-pressed", on ? "true" : "false"); }

  // ---------- Cảnh: bàn điều phối thành phố (COVID-19) ----------
  // Dải lịch 1–6/2020 theo tuần, 5 làn biện pháp; mỗi tấm có mức chắc chắn và ngày xem lại. Đường cong là mô hình minh họa:
  // mỗi tuần nhân 2^(7/g.nhan_doi × (1 − tổng giảm)). g.bp: [{giam, ton, giuong?}] (minh họa); g.cong_suat; g.tran (trần trục = tran × công suất);
  // g.ngan_sach: tổng "giờ làm"; g.xem: [0, 2, 4, 8] tuần; g.giu: hẹn thêm khi giữ; g.mac_dinh: tuần đặt khi chạm; g.khau_trang, g.tuan_kt;
  // g.manh: [chỉ số biện pháp mạnh], g.tuan_that: tuần của biện pháp mạnh thật; g.tin: [ngày trong năm] khớp t.tin; g.moc: [[ngày đầu, ngày cuối]] khớp t.moc;
  // g.tu_vong: [báo cáo, dư] triệu; g.nhip: ms mỗi tuần.
  function banDieuPhoi(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi tc-dp"), c = svg(san, "svg", { viewBox: "0 0 600 480", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var bang = tao("div", "tc-h-bang"), tinB = tao("div", "tc-h-bang tc-dp-tin"), doanB = tao("div", "tc-h-bang");
    bang.hidden = tinB.hidden = doanB.hidden = true;
    var hang = tao("div", "tc-hang"), chay = nut(t.nut_chay, true), xemThat = nut(t.nut_that, true), lai = nut(t.nut_lai, false);
    xemThat.hidden = lai.hidden = true; [chay, xemThat, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var N = g.tuan, X0 = 44, X1 = 584, CW = (X1 - X0) / N, YT = 66, YB = 250, LY = 262, LH = 24, KY = 412;
    var THANG = [0, 31, 60, 91, 121, 152, 182];
    function xT(w) { return X0 + w * CW; }
    function xN(d) { return X0 + d / 7 * CW; }
    function ngay(w) { var d = new Date(2020, 0, 1 + 7 * w); return en ? d.getDate() + " " + t.thang_ngan[d.getMonth()] : d.getDate() + "/" + (d.getMonth() + 1); }
    function Y(v) { return Math.max(YT, YB - v / (g.tran * g.cong_suat) * (YB - YT)); }
    function KX(k) { return 11 + k * 118; }
    // Đầu sân khấu: hai đồng hồ, ngày, thành phố và bệnh viện
    svg(c, "text", { x: 14, y: 20, class: "tc-h-nho" }, t.long_tin);
    svg(c, "rect", { x: 14, y: 28, width: 120, height: 12, rx: 6, class: "tc-dp-ray" });
    var tinR = svg(c, "rect", { x: 14, y: 28, width: 120, height: 12, rx: 6, class: "tc-dp-tin-r" });
    svg(c, "text", { x: 150, y: 20, class: "tc-h-nho" }, t.gio_lam);
    svg(c, "rect", { x: 150, y: 28, width: 120, height: 12, rx: 6, class: "tc-dp-ray" });
    var gioR = svg(c, "rect", { x: 150, y: 28, width: 120, height: 12, rx: 6, class: "tc-dp-gio-r" });
    var ngayT = svg(c, "text", { x: 286, y: 40, class: "tc-h-chu" }, dien(t.tuan, { d: ngay(0) }));
    var pho = svg(c, "g", { class: "tc-dp-pho" }), cua = [];
    [[424, 18, 20, 38], [448, 28, 16, 28], [468, 10, 18, 46]].forEach(function (k) {
      svg(pho, "rect", { x: k[0], y: k[1], width: k[2], height: k[3], class: "tc-dp-nha" });
      for (var yy = k[1] + 5; yy < k[1] + k[3] - 5; yy += 9) for (var xx = k[0] + 4; xx < k[0] + k[2] - 4; xx += 7) cua.push(svg(pho, "rect", { x: xx, y: yy, width: 4, height: 5, class: "tc-dp-cua" }));
    });
    svg(c, "rect", { x: 494, y: 12, width: 64, height: 44, rx: 3, class: "tc-dp-bv" });
    svg(c, "rect", { x: 520, y: 20, width: 12, height: 28, class: "tc-dp-cong" }); svg(c, "rect", { x: 512, y: 28, width: 28, height: 12, class: "tc-dp-cong" });
    svg(c, "rect", { x: 566, y: 12, width: 14, height: 44, rx: 3, class: "tc-dp-ray" });
    var giuongR = svg(c, "rect", { x: 566, y: 56, width: 14, height: 0, rx: 3, class: "tc-dp-giuong" });
    // Biểu đồ
    svg(c, "rect", { x: X0, y: YT - 4, width: X1 - X0, height: YB - YT + 4, rx: 6, class: "tc-dp-nen" });
    var trucT = svg(c, "text", { x: X0 + 8, y: YT + 14, class: "tc-h-nho" }, t.truc);
    var capL = svg(c, "polyline", { points: "", class: "tc-dp-cap" });
    var capT = svg(c, "text", { x: X1 - 6, y: Y(g.cong_suat) - 6, "text-anchor": "end", class: "tc-dp-cap-chu" }, t.suc_chua);
    var duong = svg(c, "polyline", { points: "", class: "tc-dp-duong" });
    var kim = svg(c, "line", { x1: X0, x2: X0, y1: YT - 4, y2: LY + 5 * LH - 4, class: "tc-dp-kim", visibility: "hidden" });
    function veCap(ds) { capL.setAttribute("points", ds.map(function (p) { return p[0] + "," + p[1]; }).join(" ")); }
    veCap([[X0, Y(g.cong_suat)], [X1, Y(g.cong_suat)]]);
    // Làn lịch
    for (var k = 0; k < 5; k++) { svg(c, "rect", { x: X0, y: LY + k * LH, width: X1 - X0, height: LH - 4, rx: 4, class: "tc-dp-lan" }); svg(c, "circle", { cx: X0 - 16, cy: LY + k * LH + 10, r: 7, class: "tc-dp-c" + k }); }
    for (var w = 1; w < N; w++) svg(c, "line", { x1: xT(w), x2: xT(w), y1: LY, y2: LY + 5 * LH - 4, class: "tc-dp-luoi" });
    THANG.forEach(function (d, m) {
      if (m) svg(c, "line", { x1: xN(d), x2: xN(d), y1: YT - 4, y2: LY + 5 * LH, class: "tc-dp-thang-l" });
      if (m < 6) svg(c, "text", { x: (xN(d) + xN(THANG[m + 1])) / 2, y: 398, "text-anchor": "middle", class: "tc-h-nho" }, t.thang[m]);
    });
    var chipL = svg(c, "g", {}), thatL = svg(c, "g", { visibility: "hidden" }), bdL = svg(c, "g", { visibility: "hidden" });
    // Khay biện pháp
    var khay = t.bp.map(function (b, k) {
      var e = svg(c, "g", { class: "tc-dp-khay", tabindex: "0", role: "button", "aria-label": b.full, "data-k": k });
      svg(e, "rect", { x: 0, y: 0, width: 106, height: 56, rx: 8, class: "tc-dp-the" });
      svg(e, "rect", { x: 0, y: 0, width: 9, height: 56, rx: 3, class: "tc-dp-c" + k });
      cotChu(e, 58, 24, b.a, "tc-dp-the-chu", 17);
      hDat(e, KX(k), KY); return e;
    });
    var M = g.bp.map(function (_, k) { return { k: k, w: null, chac: 1, xem: 0, het: null, ghim: null }; });
    var chon = -1, pha = "dat", T = 3, B = g.ngan_sach, kiet = false, ktMat = false, vuot = -1, Iv = 1, diem = [], capDiem = [], keoK = null;
    function hoatDong(m, w) { return m.w != null && m.w <= w && (m.het == null || w < m.het); }
    function datGhim(m) { var r = m.w + g.xem[m.xem]; m.ghim = m.xem && r < N ? r : null; }
    function veDongHo() { tinR.setAttribute("width", 120 * T / 3); gioR.setAttribute("width", 120 * Math.max(0, B) / g.ngan_sach); }
    function veChip() {
      var f = document.activeElement, fk = f && f.closest && c.contains(f) && f.closest("g.tc-dp-chip") ? f.getAttribute("data-k") : null;
      chipL.innerHTML = "";
      M.forEach(function (m) {
        khay[m.k].classList.toggle("tc-dp-da", m.w != null);
        if (m.w == null) return;
        var y = LY + m.k * LH, x = xT(m.w), x2 = xT(m.het != null ? m.het : N);
        var e = svg(chipL, "g", { class: "tc-dp-chip" + (chon === m.k ? " tc-dp-chon" : ""), "data-k": m.k, tabindex: "0", role: "button", "aria-label": dien(t.chip_aria, { b: t.bp[m.k].ten, d: ngay(m.w) }) });
        svg(e, "rect", { x: x, y: y, width: Math.max(CW, x2 - x), height: LH - 4, rx: 4, class: "tc-dp-c" + m.k + " tc-dp-thanh" });
        svg(e, "rect", { x: x, y: y, width: CW, height: LH - 4, rx: 4, class: "tc-dp-dau" });
        for (var j = 0; j <= m.chac; j++) svg(e, "circle", { cx: x + 5 + j * 5.5, cy: y + 10, r: 2.2, class: "tc-dp-cham" });
        if (m.ghim != null && (m.het == null || m.ghim < m.het)) {
          var gx = xT(m.ghim); svg(e, "line", { x1: gx, x2: gx, y1: y - 2, y2: y + LH - 4, class: "tc-dp-ghim-l" }); svg(e, "circle", { cx: gx, cy: y - 1, r: 4.5, class: "tc-dp-ghim" });
        }
      });
      if (fk != null) { var n = chipL.querySelector('[data-k="' + fk + '"]'); if (n) n.focus({ preventScroll: true }); }
    }
    // Bảng mặt sau của tấm đang chọn
    var bTen = tao("p", "tc-h-ten"), hC = tao("div", "tc-hang tc-h-nut-nho"), hX = tao("div", "tc-hang tc-h-nut-nho"), hD = tao("div", "tc-hang tc-h-nut-nho");
    hC.appendChild(tao("span", "tc-h-nhan", t.chac)); hX.appendChild(tao("span", "tc-h-nhan", t.xem_nhan));
    var nC = t.chac_ds.map(function (x, i) { var b = nut(x); b.onclick = function () { if (chon < 0) return; M[chon].chac = i; capNhat(); }; hC.appendChild(b); return b; });
    var nX = t.xem_ds.map(function (x, i) { var b = nut(x); b.onclick = function () { if (chon < 0) return; M[chon].xem = i; datGhim(M[chon]); capNhat(); }; hX.appendChild(b); return b; });
    var lui = nut("◀"), toi = nut("▶"), veK = nut(t.ve_khay); lui.setAttribute("aria-label", t.lui); toi.setAttribute("aria-label", t.toi);
    [lui, toi, veK].forEach(function (b) { hD.appendChild(b); });
    [bTen, hC, hX, hD].forEach(function (e) { bang.appendChild(e); });
    function capNhat() {
      veChip(); bang.hidden = chon < 0 || pha !== "dat"; if (bang.hidden) return;
      var m = M[chon]; bTen.textContent = dien(t.dat, { b: t.bp[chon].ten, d: ngay(m.w) }) + (m.ghim != null ? " · " + dien(t.xem_luc, { d: ngay(m.ghim) }) : "");
      nC.forEach(function (b, i) { hBat(b, i === m.chac); }); nX.forEach(function (b, i) { hBat(b, i === m.xem); });
    }
    function tuanTai(x) { return Math.max(0, Math.min(N - 1, Math.floor((x - X0) / CW))); }
    function datBP(k, w) { var m = M[k]; m.w = Math.max(0, Math.min(N - 1, w)); m.het = null; datGhim(m); chon = k; capNhat(); cap.textContent = t.mat_sau; }
    lui.onclick = function () { if (chon >= 0) datBP(chon, M[chon].w - 1); };
    toi.onclick = function () { if (chon >= 0) datBP(chon, M[chon].w + 1); };
    veK.onclick = function () { if (chon < 0) return; var k = chon; M[k].w = null; M[k].ghim = null; chon = -1; capNhat(); khay[k].focus({ preventScroll: true }); };
    keoSvg(c, "g.tc-dp-khay, g.tc-dp-chip", function (e, p, b, dau) {
      if (pha !== "dat") return false;
      var k = +e.getAttribute("data-k");
      if (b === "bat") { keoK = { k: k, khay: e.classList.contains("tc-dp-khay"), e: e }; if (keoK.khay) c.appendChild(e); return; }
      if (!keoK) return;
      if (keoK.khay) hDat(e, KX(k) + p.x - dau.x, KY + p.y - dau.y);
      else if (p.y < 400) { M[k].w = tuanTai(p.x); M[k].het = null; datGhim(M[k]); veChip(); }
    }, function (e, p) {
      var o = keoK; keoK = null; if (!o) return; var k = o.k;
      if (o.khay) {
        hDat(o.e, KX(k), KY);
        if (!p) { datBP(k, M[k].w != null ? M[k].w : g.mac_dinh); return; }
        if (p.y > LY - 40 && p.y < LY + 5 * LH + 10 && p.x > X0 - 20 && p.x < X1 + 20) datBP(k, tuanTai(p.x)); else cap.textContent = t.goi_y;
      } else if (!p) { chon = k; capNhat(); }
      else if (p.y > 400) { M[k].w = null; M[k].ghim = null; if (chon === k) chon = -1; capNhat(); }
      else datBP(k, tuanTai(p.x));
    });
    c.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return; var e = ev.target.closest && ev.target.closest("g.tc-dp-khay, g.tc-dp-chip"); if (!e) return;
      ev.preventDefault(); if (pha !== "dat") return; var k = +e.getAttribute("data-k");
      if (M[k].w == null) datBP(k, g.mac_dinh); else { chon = k; capNhat(); }
    });
    // Thời gian chạy
    function tinGanNhat(w) { var r = t.tin_chua; g.tin.forEach(function (d, i) { if (d < 7 * w + 7) r = t.tin[i]; }); return r; }
    function veDuong() { duong.setAttribute("points", diem.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ")); veCap(capDiem); capT.setAttribute("y", capDiem[capDiem.length - 1][1] - 6); }
    function hoiXem(m, w) {
      tinB.innerHTML = "";
      tinB.appendChild(tao("p", "tc-h-ten", dien(t.xem_lai, { b: t.bp[m.k].ten, d: ngay(w) })));
      tinB.appendChild(tao("p", "tc-dp-the-tin", tinGanNhat(w)));
      var h = tao("div", "tc-hang"), giu = nut(t.giu, true), go = nut(t.go, false); h.appendChild(giu); h.appendChild(go); tinB.appendChild(h);
      function tiep() { tinB.hidden = true; veChip(); buoc(w); }
      giu.onclick = function () { m.ghim = m.ghim + g.giu < N ? m.ghim + g.giu : null; cap.textContent = dien(t.da_giu, { b: t.bp[m.k].ten }); tiep(); };
      go.onclick = function () { m.het = w; m.ghim = null; cap.textContent = dien(t.da_go, { b: t.bp[m.k].ten }); tiep(); };
      tinB.hidden = false; cap.textContent = t.dung_xem; giu.focus({ preventScroll: true });
    }
    function buoc(w) {
      if (!s.isConnected || s._dung) return;
      if (w >= N) { hetGio(); return; }
      ngayT.textContent = dien(t.tuan, { d: ngay(w) }); kim.setAttribute("x1", xT(w + 1)); kim.setAttribute("x2", xT(w + 1));
      for (var i = 0; i < M.length; i++) if (hoatDong(M[i], w) && M[i].ghim === w) { hoiXem(M[i], w); return; }
      var tin = []; g.tin.forEach(function (d, i) { if (d >= 7 * w && d < 7 * w + 7) tin.push(t.tin[i]); });
      if (tin.length) cap.textContent = t.tin_moi + " " + tin.join(" ");
      var kt = M[g.khau_trang];
      if (!ktMat && w === g.tuan_kt && hoatDong(kt, w) && kt.chac === 2) { ktMat = true; T = Math.max(0, T - 1); cap.textContent = t.kt_mat; }
      var giamTong = 0, ton = 0, them = 0;
      M.forEach(function (m) { if (!hoatDong(m, w)) return; var b = g.bp[m.k]; giamTong += b.giam; ton += b.ton; if (b.giuong && w >= m.w + 2) them += b.giuong; });
      var capNay = g.cong_suat * (1 + them);
      Iv *= Math.pow(2, 7 / g.nhan_doi * (1 - giamTong)); B -= ton;
      diem.push([xT(w + 1), Y(Iv)]); capDiem.push([xT(w), Y(capNay)], [xT(w + 1), Y(capNay)]); veDuong();
      var ti = Math.min(1, Iv / capNay), sang = Math.round(cua.length * ti);
      cua.forEach(function (e, j) { e.classList.toggle("tc-dp-sang", j < sang); });
      giuongR.setAttribute("height", 44 * ti); giuongR.setAttribute("y", 56 - 44 * ti); giuongR.classList.toggle("tc-dp-day", ti >= 1);
      if (Iv > capNay && vuot < 0) { vuot = w; cap.textContent = dien(t.vuot, { d: ngay(w) }); }
      if (B <= 0 && !kiet) {
        kiet = true; B = 0;
        M.forEach(function (m) { if (m.w == null || (m.het != null && m.het <= w + 1)) return; if (m.w <= w) { m.het = w + 1; T -= 1 + (m.chac === 2 ? 1 : 0); } else m.het = m.w; m.ghim = null; });
        T = Math.max(0, T); veChip(); cap.textContent = t.kiet;
      }
      veDongHo();
      hHen(s, function () { buoc(w + 1); }, g.nhip);
    }
    function hetGio() {
      pha = "doan"; kim.setAttribute("visibility", "hidden");
      if (vuot < 0) pho.classList.add("tc-dp-tat"); else capL.classList.add("tc-dp-nhay");
      cap.textContent = (vuot < 0 ? t.giu_duoc : t.khong_giu) + " " + t.doan_mo;
      doanB.innerHTML = "";
      var nh = tao("label", "tc-h-ten", t.doan_hoi), id = g.id + "-doan"; nh.htmlFor = id;
      var th = tao("input", "tc-h-truot"); th.type = "range"; th.min = 0; th.max = 100; th.step = 1; th.value = 50; th.id = id;
      var gt = tao("output", "tc-h-gt", "50%"); th.oninput = function () { gt.textContent = th.value + "%"; };
      var chot = nut(t.nut_chot, true), h = tao("div", "tc-hang tc-h-hang-truot"); h.appendChild(th); h.appendChild(gt);
      [nh, h, chot].forEach(function (e) { doanB.appendChild(e); }); doanB.hidden = false; th.focus({ preventScroll: true });
      chot.onclick = function () { doanB.hidden = true; veCot(+th.value); };
    }
    function veCot(p) {
      bdL.innerHTML = ""; bdL.setAttribute("visibility", "visible");
      svg(bdL, "rect", { x: X0, y: YT - 4, width: X1 - X0, height: YB - YT + 4, rx: 6, class: "tc-dp-phu" });
      svg(bdL, "text", { x: X0 + 12, y: YT + 18, class: "tc-h-chu" }, t.bieu_tv);
      var L0 = X0 + 12, Wm = 500, tv = g.tu_vong, r1 = tv[0] / tv[1];
      svg(bdL, "text", { x: L0, y: 116, class: "tc-h-nho" }, t.bao_cao + " · " + dien(t.trieu, { x: so(tv[0], 2) }));
      var c1 = svg(bdL, "rect", { x: L0, y: 124, width: 0, height: 26, rx: 4, class: "tc-dp-cot1" });
      svg(bdL, "text", { x: L0, y: 192, class: "tc-h-nho" }, t.du + " · " + dien(t.trieu, { x: so(tv[1], 2) }));
      var c2 = svg(bdL, "rect", { x: L0, y: 200, width: 0, height: 26, rx: 4, class: "tc-dp-cot2" });
      var gx = L0 + Wm * p / 100;
      svg(bdL, "line", { x1: gx, x2: gx, y1: 120, y2: 156, class: "tc-dp-doan" });
      svg(bdL, "text", { x: Math.min(X1 - 8, Math.max(L0, gx)), y: 172, "text-anchor": p > 80 ? "end" : p < 15 ? "start" : "middle", class: "tc-h-cam" }, dien(t.ban_doan, { p: p }));
      hChay(s, 1400, function (f) { c1.setAttribute("width", Wm * r1 * f); c2.setAttribute("width", Wm * f); }, function () {
        cap.textContent = dien(t.doan_ket, { p: p }); xemThat.hidden = false; xemThat.focus({ preventScroll: true });
      });
    }
    xemThat.onclick = function () {
      xemThat.hidden = true; bdL.setAttribute("visibility", "hidden"); trucT.setAttribute("visibility", "hidden"); thatL.innerHTML = "";
      svg(thatL, "rect", { x: X0 - 4, y: LY - 8, width: X1 - X0 + 8, height: 5 * LH + 4, rx: 6, class: "tc-dp-kinh" });
      g.moc.forEach(function (d, i) {
        var xa = xN(d[0]), xb = xN(d[1]), y = YT + 30 + i * 20, ben = xa < 330;
        if (d[1] > d[0]) svg(thatL, "rect", { x: xa, y: LY - 8, width: xb - xa, height: 5 * LH + 4, class: "tc-dp-dai" });
        else svg(thatL, "line", { x1: xa, x2: xa, y1: y - 4, y2: LY + 5 * LH - 4, class: "tc-dp-that-l" });
        svg(thatL, "circle", { cx: xa, cy: y - 4, r: 4, class: "tc-dp-that-c" });
        svg(thatL, "text", { x: ben ? xa + 8 : xa - 8, y: y, "text-anchor": ben ? "start" : "end", class: "tc-dp-that-chu" }, t.moc[i]);
      });
      thatL.setAttribute("visibility", "visible"); c.appendChild(thatL);
      var manh = g.manh.map(function (k) { return M[k].w; }).filter(function (w) { return w != null; });
      var fs = manh.length ? Math.min.apply(null, manh) : null, n = fs == null ? 0 : g.tuan_that - fs;
      var kk = M.filter(function (m) { return m.w != null && m.xem > 0; }).length;
      var dong = dien(fs == null ? t.ket_khong : n > 0 ? t.ket : n < 0 ? t.ket_sau : t.ket_bang, { n: Math.abs(n), k: kk });
      var sao = dien(t.sao, { a: vuot < 0 ? "★" : "☆", b: T >= 2 ? "★" : "☆", c: !kiet ? "★" : "☆" });
      cap.textContent = t.da_that;
      ket.textContent = dong + " " + sao + " " + t.ilo; ket.hidden = false; lai.hidden = false;
    };
    chay.onclick = function () {
      pha = "chay"; chon = -1; capNhat(); chay.hidden = true; khay.forEach(function (e) { e.setAttribute("tabindex", "-1"); });
      diem = [[X0, Y(1)]]; capDiem = []; kim.setAttribute("visibility", "visible"); cap.textContent = t.dang; buoc(0);
    };
    lai.onclick = function () { hLai(s, banDieuPhoi, g, t); };
    veDongHo();
    [san, cap, bang, tinB, doanB, hang, ket].forEach(function (e) { s.appendChild(e); });
    s.appendChild(tao("p", "tc-h-mien", t.mien)); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: phòng máy đêm giao thừa (Y2K) ----------
  // Chặng 1 kiểm kê (kéo cuộn băng lên giá Trọng yếu/Để sau), chặng 2 sửa và thử (bàn sửa, máy thử, túi tiền, đồng hồ tháng),
  // chặng 3 giao thừa (cần gạt, đèn xanh/đỏ/vàng), chặng 4 sáng 1/1/2000 (kéo phiếu vào sổ "đã tránh được", trình ban giám đốc).
  // t.he: [{a: tên ngắn, full, tr: true nếu trọng yếu, hau: hậu quả nếu chưa sửa, phieu}]; g.tien: số lần sửa; g.sua_thang, g.thu_thang;
  // g.bd: [năm, tháng] chặng 1; g.kk: tháng hết kiểm kê; g.bd2: tháng bắt đầu chặng 2; g.han: hạn thử; g.cuoi: tháng giao thừa (đều [năm, tháng]).
  function phongMayY2k(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi tc-y2"), c = svg(san, "svg", { viewBox: "0 0 600 440", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), xongKK = nut(t.nut_kk, true), gat = nut(t.nut_gat, true), trinh = nut(t.nut_trinh, true), lai = nut(t.nut_lai, false);
    xongKK.disabled = true; gat.hidden = trinh.hidden = lai.hidden = true; [xongKK, gat, trinh, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    function thg(a) { return a[0] * 12 + a[1] - 1; }
    function hienThg(m) { return String(m % 12 + 1).padStart(2, "0") + "/" + Math.floor(m / 12); }
    var CWd = 98, CH = 36;
    // Tường: đồng hồ, túi tiền, tên chặng, sổ "đã tránh được"
    svg(c, "rect", { x: 12, y: 10, width: 152, height: 62, rx: 8, class: "tc-y2-dh" });
    svg(c, "text", { x: 88, y: 28, "text-anchor": "middle", class: "tc-y2-dh-nho" }, t.dong_ho);
    var dhT = svg(c, "text", { x: 88, y: 60, "text-anchor": "middle", class: "tc-y2-dh-so" }, hienThg(thg(g.bd)));
    var tui = svg(c, "g", {}); svg(tui, "path", { d: "M184 30 q16 -14 32 0 l10 36 q-26 10 -52 0 Z", class: "tc-y2-tui" });
    svg(tui, "text", { x: 200, y: 86, "text-anchor": "middle", class: "tc-h-nho" }, t.tui);
    var xuT = []; for (var i = 0; i < g.tien; i++) xuT.push(svg(tui, "circle", { cx: 238 + (i % 2) * 14, cy: 30 + Math.floor(i / 2) * 14, r: 6, class: "tc-y2-xu" }));
    var changT = svg(c, "text", { x: 270, y: 32, class: "tc-h-chu" }, t.chang[0]);
    var hanT = svg(c, "text", { x: 270, y: 54, class: "tc-h-nho" }, t.han[0]);
    var soG = svg(c, "g", {}); svg(soG, "rect", { x: 470, y: 8, width: 120, height: 76, rx: 6, class: "tc-y2-so" });
    svg(soG, "rect", { x: 470, y: 8, width: 12, height: 76, rx: 3, class: "tc-y2-gay" });
    cotChu(soG, 536, 32, t.so, "tc-y2-so-chu", 16);
    var soDem = svg(soG, "text", { x: 536, y: 74, "text-anchor": "middle", class: "tc-y2-so-dem" }, "0");
    // Giá kiểm kê
    function ke(y, ten) { svg(c, "rect", { x: 8, y: y, width: 222, height: 134, rx: 8, class: "tc-y2-ke" }); svg(c, "text", { x: 18, y: y + 18, class: "tc-h-chu tc-y2-ke-ten" }, ten); }
    ke(96, t.trong_yeu); ke(238, t.de_sau);
    function oKe(nhom, j) { return { x: 14 + (j % 2) * 108, y: (nhom ? 238 : 96) + 26 + Math.floor(j / 2) * 36 }; }
    // Bàn sửa, máy thử, tủ đã chạy thật, cần gạt
    var ban = svg(c, "g", { class: "tc-y2-tat" });
    svg(ban, "rect", { x: 244, y: 154, width: 162, height: 100, rx: 8, class: "tc-y2-ban" });
    svg(ban, "path", { d: "M262 154 l10 -34 l22 -6", class: "tc-y2-den-can" }); svg(ban, "path", { d: "M286 108 l22 4 l-6 14 Z", class: "tc-y2-den" });
    svg(ban, "text", { x: 325, y: 246, "text-anchor": "middle", class: "tc-h-nho" }, t.ban_sua);
    var may = svg(c, "g", { class: "tc-y2-tat" });
    svg(may, "rect", { x: 420, y: 96, width: 170, height: 124, rx: 8, class: "tc-y2-may" });
    svg(may, "path", { d: "M455 170 a50 50 0 0 1 100 0", class: "tc-y2-cung" });
    var kimM = svg(may, "line", { x1: 505, y1: 170, x2: 505, y2: 128, class: "tc-y2-kim" });
    svg(may, "text", { x: 505, y: 116, "text-anchor": "middle", class: "tc-h-nho" }, t.may_thu);
    var mayT = svg(may, "text", { x: 505, y: 200, "text-anchor": "middle", class: "tc-y2-man" }, "01/01/00");
    var tu = svg(c, "g", {}); svg(tu, "rect", { x: 412, y: 230, width: 184, height: 142, rx: 8, class: "tc-y2-tu" });
    svg(tu, "text", { x: 430, y: 248, class: "tc-h-nho" }, t.tu);
    function oTu(j) { return { x: 416 + (j % 2) * 88, y: 256 + Math.floor(j / 2) * 34 }; }
    var can = svg(c, "g", { class: "tc-y2-can", visibility: "hidden", tabindex: "-1", role: "button", "aria-label": t.nut_gat });
    svg(can, "rect", { x: 300, y: 330, width: 50, height: 22, rx: 4, class: "tc-y2-can-de" });
    var tay = svg(can, "g", {}); svg(tay, "line", { x1: 325, y1: 334, x2: 352, y2: 278, class: "tc-y2-can-tay" }); svg(tay, "circle", { cx: 352, cy: 278, r: 11, class: "tc-y2-can-num" });
    svg(c, "rect", { x: 0, y: 422, width: 600, height: 14, class: "tc-y2-bang" });
    svg(c, "line", { x1: 0, x2: 600, y1: 429, y2: 429, class: "tc-y2-bang-l" });
    // Ông giám đốc (khối hình), con dấu
    var gd = svg(c, "g", { visibility: "hidden" });
    svg(gd, "rect", { x: 268, y: 290, width: 24, height: 24, rx: 4, class: "tc-y2-gd" }); svg(gd, "rect", { x: 258, y: 316, width: 44, height: 56, rx: 6, class: "tc-y2-gd-ao" });
    svg(gd, "rect", { x: 240, y: 360, width: 170, height: 14, rx: 3, class: "tc-y2-ban" });
    svg(gd, "path", { d: "M300 282 l32 -16 h70 v34 h-70 Z", class: "tc-y2-loi" }); var gdT = svg(gd, "text", { x: 367, y: 288, "text-anchor": "middle", class: "tc-y2-loi-chu" }, "!");
    var dauG = svg(c, "g", { visibility: "hidden" }); svg(dauG, "rect", { x: 0, y: 0, width: 220, height: 40, rx: 6, class: "tc-y2-dau" });
    var dauT = svg(dauG, "text", { x: 110, y: 27, "text-anchor": "middle", class: "tc-y2-dau-chu" }, ""); hDat(dauG, 216, 300, " rotate(-8 110 20)");
    var toi = svg(c, "rect", { x: 0, y: 0, width: 600, height: 440, class: "tc-y2-toi", visibility: "hidden" });
    // Cuộn băng
    var H = t.he.map(function (h, i) {
      var e = svg(c, "g", { class: "tc-y2-cuon", tabindex: "0", role: "button", "aria-label": h.full, "data-i": i });
      svg(e, "rect", { x: 0, y: 0, width: CWd, height: CH, rx: 6, class: "tc-y2-nhan" });
      svg(e, "circle", { cx: 12, cy: 18, r: 8, class: "tc-y2-bang-tu" }); svg(e, "circle", { cx: 12, cy: 18, r: 3, class: "tc-y2-truc" });
      svg(e, "text", { x: 24, y: 15, class: "tc-y2-ten" }, h.a);
      var f = svg(e, "text", { x: 24, y: 30, class: "tc-y2-truong" }, t.truong + ": 98");
      var den = svg(e, "circle", { cx: CWd - 7, cy: 7, r: 4, class: "tc-y2-den-o" });
      return { i: i, e: e, f: f, den: den, nhom: null, sua: false, thu: false, o: null, tu: null, x: 0, y: 0 };
    });
    function datH(h, x, y, muot) { h.x = x; h.y = y; h.e.style.transition = muot && !giam ? "transform .3s" : ""; hDat(h.e, x, y); }
    var thuTu = tron(H.map(function (h) { return h.i; }));
    function veBang() { thuTu.forEach(function (i, j) { var h = H[i]; if (h.nhom == null) datH(h, 4 + j * 99, 384, true); }); }
    veBang();
    function xepKe() { [0, 1].forEach(function (n) { var j = 0; H.forEach(function (h) { if (h.nhom === n && h.tu == null) { var p = oKe(n, j++); datH(h, p.x, p.y, true); } }); }); }
    var pha = "kk", tien = g.tien, thang = thg(g.bd), nTu = 0, phieu = [], soN = 0, keo = null;
    function veThang() { dhT.textContent = hienThg(thang); dhT.classList.toggle("tc-y2-tre", thang > thg(g.han)); }
    function vaoKe(h, n) {
      h.nhom = n; xepKe(); veBang(); cap.textContent = dien(t.da_xep, { a: t.he[h.i].a, k: n ? t.de_sau : t.trong_yeu });
      xongKK.disabled = H.some(function (x) { return x.nhom == null; });
    }
    function sua(h) {
      if (h.sua) { cap.textContent = dien(t.da_sua_roi, { a: t.he[h.i].a }); return; }
      if (tien <= 0) { cap.textContent = t.het_tien; return; }
      tien--; xuT[tien].classList.add("tc-y2-xu-het"); h.sua = true; thang += g.sua_thang; veThang();
      h.f.textContent = t.truong + ": 1998"; h.e.classList.add("tc-y2-da-sua");
      cap.textContent = dien(t.sua_xong, { a: t.he[h.i].a, n: tien }); kiemGio();
    }
    function thu(h) {
      thang += g.thu_thang; veThang();
      if (!h.sua) {
        kimM.setAttribute("x2", 462); kimM.setAttribute("y2", 150); kimM.setAttribute("class", "tc-y2-kim tc-y2-kim-do"); mayT.textContent = "00 − 98 = −98";
        mayT.setAttribute("class", "tc-y2-man tc-y2-man-do"); cap.textContent = dien(t.thu_hong, { a: t.he[h.i].a }); xepKe(); kiemGio(); return;
      }
      kimM.setAttribute("x2", 548); kimM.setAttribute("y2", 150); kimM.setAttribute("class", "tc-y2-kim tc-y2-kim-xanh"); mayT.textContent = "01/01/2000 ✓";
      mayT.setAttribute("class", "tc-y2-man");
      h.thu = true; h.tu = nTu++; var p = oTu(h.tu); datH(h, p.x, p.y, true); hDat(h.e, p.x, p.y, " scale(.84)"); h.e.classList.add("tc-y2-da-thu"); xepKe();
      cap.textContent = dien(thang > thg(g.han) ? t.thu_tre : t.thu_xong, { a: t.he[h.i].a }); kiemGio();
    }
    function kiemGio() { if (thang >= thg(g.cuoi)) { thang = thg(g.cuoi); veThang(); cap.textContent += " " + t.het_gio; giaoThua(); } }
    function giaoThua() {
      if (pha !== "sua") return; pha = "gt"; gat.hidden = true; ban.setAttribute("class", "tc-y2-tat"); may.setAttribute("class", "tc-y2-tat");
      tay.setAttribute("transform", "rotate(70 325 334)");
      changT.textContent = t.chang[2]; hanT.textContent = ""; dhT.textContent = "23:59"; toi.setAttribute("visibility", "visible");
      hHen(s, function () {
        dhT.textContent = "00:00"; toi.setAttribute("visibility", "hidden"); can.setAttribute("visibility", "hidden");
        var hau = [];
        H.forEach(function (h) {
          var l = h.thu ? "tc-y2-xanh" : t.he[h.i].tr ? "tc-y2-do" : "tc-y2-vang";
          h.den.setAttribute("class", "tc-y2-den-o " + l); h.e.classList.add(l + "-o");
          if (!h.thu) hau.push(t.he[h.i].hau);
        });
        cap.textContent = hau.length ? t.sau_gt + " " + hau.join(" ") : t.sau_gt_xanh;
        hHen(s, sangRa, 2600);
      }, 1500);
    }
    function sangRa() {
      pha = "sang"; changT.textContent = t.chang[3]; dhT.textContent = "01/01/2000"; gd.setAttribute("visibility", "visible");
      ban.setAttribute("class", ""); cap.textContent = t.giam_doc;
      H.filter(function (h) { return h.thu; }).forEach(function (h, j) {
        var e = svg(c, "g", { class: "tc-y2-phieu", tabindex: "0", role: "button", "aria-label": dien(t.phieu_aria, { a: t.he[h.i].a }), "data-i": h.i });
        svg(e, "rect", { x: 0, y: 0, width: 74, height: 26, rx: 3, class: "tc-y2-giay" });
        svg(e, "text", { x: 37, y: 17, "text-anchor": "middle", class: "tc-y2-giay-chu" }, t.he[h.i].a);
        var o = { i: h.i, e: e, x: 248 + (j % 2) * 80, y: 160 + Math.floor(j / 2) * 30, vao: false }; hDat(e, o.x, o.y); phieu.push(o);
      });
      trinh.hidden = false;
    }
    function vaoSo(o) {
      if (o.vao) return; o.vao = true; soN++; soDem.textContent = soN; o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true");
      o.e.style.transition = giam ? "" : "transform .3s, opacity .3s"; hDat(o.e, 500, 40, " scale(.4)"); o.e.style.opacity = 0;
      cap.textContent = t.he[o.i].phieu;
    }
    keoSvg(c, "g.tc-y2-cuon, g.tc-y2-phieu", function (e, p, b, dau) {
      var la = e.classList.contains("tc-y2-phieu");
      if (b === "bat") {
        if (la) { var o = phieu.filter(function (x) { return x.e === e; })[0]; if (pha !== "sang" || !o || o.vao) return false; keo = { o: o, la: true }; }
        else { var h = H[+e.getAttribute("data-i")]; if ((pha !== "kk" && pha !== "sua") || h.thu) return false; keo = { o: h, la: false }; }
        c.appendChild(e); keo.x0 = keo.o.x; keo.y0 = keo.o.y; e.style.transition = ""; return;
      }
      if (!keo) return; keo.o.x = keo.x0 + p.x - dau.x; keo.o.y = keo.y0 + p.y - dau.y; hDat(e, keo.o.x, keo.o.y);
    }, function (e, p) {
      var k = keo; keo = null; if (!k) return; var o = k.o;
      if (k.la) { if (p && p.x > 440 && p.y < 110) vaoSo(o); else { hDat(o.e, (o.x = k.x0), (o.y = k.y0)); if (!p) cap.textContent = t.he[o.i].phieu; } return; }
      if (!p) { datH(o, k.x0, k.y0); cap.textContent = t.he[o.i].full; return; }
      if (pha === "kk") {
        if (p.x < 236 && p.y > 92 && p.y < 376) vaoKe(o, p.y < 236 ? 0 : 1); else { datH(o, k.x0, k.y0, true); cap.textContent = t.goi_kk; }
        return;
      }
      datH(o, k.x0, k.y0, true);
      if (p.x > 236 && p.x < 414 && p.y > 100 && p.y < 270) sua(o);
      else if (p.x > 414 && p.y > 90 && p.y < 230) thu(o);
      else cap.textContent = t.goi_sua;
    });
    c.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var e = ev.target.closest && ev.target.closest("g.tc-y2-cuon, g.tc-y2-phieu, g.tc-y2-can"); if (!e) return; ev.preventDefault();
      if (e === can) { giaoThua(); return; }
      if (e.classList.contains("tc-y2-phieu")) { var o = phieu.filter(function (x) { return x.e === e; })[0]; if (pha === "sang" && o) vaoSo(o); return; }
      var h = H[+e.getAttribute("data-i")];
      if (pha === "kk") vaoKe(h, h.nhom === 0 ? 1 : 0);
      else if (pha === "sua" && !h.thu) { if (!h.sua) sua(h); else thu(h); }
    });
    can.addEventListener("click", function () { giaoThua(); });
    xongKK.onclick = function () {
      var sai = H.filter(function (h) { return (h.nhom === 0) !== !!t.he[h.i].tr; });
      if (sai.length) {
        sai.forEach(function (h) { h.nhom = null; }); xepKe(); veBang(); xongKK.disabled = true;
        cap.textContent = t.kk_sai + " " + sai.map(function (h) { return t.he[h.i].goi_y; }).join(" "); return;
      }
      pha = "sua"; xongKK.hidden = true; thang = thg(g.bd2); veThang(); changT.textContent = t.chang[1]; hanT.textContent = t.han[1];
      ban.setAttribute("class", ""); may.setAttribute("class", ""); can.setAttribute("visibility", "visible"); can.setAttribute("tabindex", "0");
      gat.hidden = false; cap.textContent = t.mo_sua;
    };
    gat.onclick = giaoThua;
    trinh.onclick = function () {
      trinh.hidden = true; phieu.forEach(function (o) { o.e.removeAttribute("tabindex"); });
      var tr = H.filter(function (h) { return t.he[h.i].tr; }), xanh = tr.filter(function (h) { return h.thu; }).length;
      var ghi = phieu.filter(function (o) { return o.vao && t.he[o.i].tr; }).length, kq;
      if (xanh < tr.length) { kq = t.ket_a; gdT.textContent = "✗"; }
      else if (ghi >= tr.length) { kq = t.ket_thang; dauT.textContent = t.dau; dauG.setAttribute("visibility", "visible"); gdT.textContent = "✓"; }
      else { kq = t.ket_b; gdT.textContent = "?!"; }
      cap.textContent = kq === t.ket_thang ? t.gd_gat : kq === t.ket_b ? t.gd_lua : t.gd_do;
      ket.textContent = dien(kq, { x: xanh, n: tr.length, s: ghi }) + " " + t.that; ket.hidden = false; lai.hidden = false; lai.focus({ preventScroll: true });
    };
    lai.onclick = function () { hLai(s, phongMayY2k, g, t); };
    [san, cap, hang, ket].forEach(function (e) { s.appendChild(e); }); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: bơm bong bóng (dot-com) ----------
  // Băng chuyền thả bóng khí (khi), đồng xu (xu), đồng hồ cát (cat) theo năm; kéo khí vào bong bóng, xu và đồng hồ cát vào giỏ, hoặc ra thùng "bỏ qua".
  // Đồ để yên trước mốc thử thì tự rơi vào bong bóng như khí. Ngày g.thu: tỷ lệ khí ÷ xu > g.nguong thì nổ, không thì xẹp dần.
  // g.vat: [{loai, nam}] khớp t.vat [{a, full}]; g.lich: [[giây, năm]] ánh xạ thời gian; g.moc: [[năm, điểm Nasdaq]] có nguồn (giữa các mốc là nội suy minh họa);
  // g.toc: px/giây của băng chuyền; g.nhanh: hệ số tua nhanh.
  function bomBongBong(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi tc-bb"), c = svg(san, "svg", { viewBox: "0 0 600 440", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hangVat = tao("div", "tc-hang tc-h-nut-nho"), vB = nut(t.vao_bong), vG = nut(t.vao_gio), vT = nut(t.bo_qua); hangVat.hidden = true;
    [vB, vG, vT].forEach(function (b) { hangVat.appendChild(b); });
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), nhanh = nut(t.nut_nhanh, false), lai = nut(t.nut_lai, false);
    nhanh.hidden = lai.hidden = true; [bd, nhanh, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var L = g.lich, NAM0 = L[0][1], NAM1 = L[L.length - 1][1], TX0 = 262, TX1 = 584, BX = 150, BY = 178, VW = 108, VH = 46, BELT = 216;
    function namLuc(sec) { for (var i = 1; i < L.length; i++) if (sec <= L[i][0]) { var a = L[i - 1], b = L[i]; return a[1] + (b[1] - a[1]) * (sec - a[0]) / (b[0] - a[0]); } return NAM1; }
    function diem(nam) {
      var m = g.moc; if (nam <= m[0][0]) return m[0][1];
      for (var i = 1; i < m.length; i++) if (nam <= m[i][0]) { var a = m[i - 1], b = m[i], f = (nam - a[0]) / (b[0] - a[0]); return Math.exp(Math.log(a[1]) + (Math.log(b[1]) - Math.log(a[1])) * f); }
      return m[m.length - 1][1];
    }
    function xNam(n) { return TX0 + (n - 1995) / (2003 - 1995) * (TX1 - TX0); }
    function hienNam(n) { var y = Math.floor(n), m = Math.min(12, Math.floor((n - y) * 12) + 1); return m + "/" + y; }
    // Đồng hồ Nasdaq và dải thời gian
    svg(c, "rect", { x: 12, y: 8, width: 228, height: 52, rx: 8, class: "tc-bb-dh" });
    svg(c, "text", { x: 24, y: 26, class: "tc-bb-dh-nho" }, "NASDAQ");
    var dhT = svg(c, "text", { x: 228, y: 50, "text-anchor": "end", class: "tc-bb-dh-so" }, hSo2(diem(NAM0)));
    var ngT = svg(c, "text", { x: 24, y: 50, class: "tc-bb-dh-nho" }, hienNam(NAM0));
    svg(c, "line", { x1: TX0, x2: TX1, y1: 30, y2: 30, class: "tc-bb-truc" });
    for (var y = 1995; y <= 2003; y++) { svg(c, "line", { x1: xNam(y), x2: xNam(y), y1: 25, y2: 35, class: "tc-bb-truc" }); if (y < 2003) svg(c, "text", { x: xNam(y + 0.5), y: 52, "text-anchor": "middle", class: "tc-bb-nam" }, "'" + String(y).slice(2)); }
    svg(c, "line", { x1: xNam(g.thu), x2: xNam(g.thu), y1: 16, y2: 40, class: "tc-bb-moc-thu" });
    var kimT = svg(c, "circle", { cx: xNam(NAM0), cy: 30, r: 6, class: "tc-bb-kim" });
    // Bong bóng, dây, giỏ, thùng, băng chuyền
    var day = svg(c, "line", { x1: BX, x2: BX, y1: BY, y2: 336, class: "tc-bb-day" });
    var bong = svg(c, "g", {}), vo = svg(bong, "circle", { cx: BX, cy: BY, r: 40, class: "tc-bb-vo tc-bb-xanh" });
    svg(bong, "path", { d: "M-6 -10 l0 18 l5 -5 l4 8 l3 -1.5 l-4 -8 l7 0 Z", class: "tc-bb-tro", transform: "translate(" + BX + "," + BY + ")" });
    var manh = svg(c, "g", {});
    var gio = svg(c, "g", {});
    svg(gio, "path", { d: "M92 336 h116 l-14 48 h-88 Z", class: "tc-bb-gio" });
    svg(gio, "text", { x: BX, y: 404, "text-anchor": "middle", class: "tc-h-nho" }, t.gio);
    var xuG = svg(gio, "g", {});
    var tyT = svg(gio, "text", { x: BX, y: 428, "text-anchor": "middle", class: "tc-h-nho" }, "");
    svg(c, "rect", { x: 300, y: BELT + VH + 4, width: 300, height: 12, class: "tc-bb-bang" });
    svg(c, "line", { x1: 300, x2: 600, y1: BELT + VH + 10, y2: BELT + VH + 10, class: "tc-bb-bang-l" });
    svg(c, "text", { x: 588, y: BELT + VH + 34, "text-anchor": "end", class: "tc-h-nho" }, t.bang);
    var thung = svg(c, "g", {}); svg(thung, "rect", { x: 452, y: 326, width: 138, height: 84, rx: 10, class: "tc-bb-thung" });
    svg(thung, "text", { x: 521, y: 352, "text-anchor": "middle", class: "tc-h-chu" }, t.thung);
    var thungN = svg(thung, "text", { x: 521, y: 388, "text-anchor": "middle", class: "tc-bb-dem" }, "0");
    var bien = svg(c, "g", { visibility: "hidden" });
    // Đồ vật
    var lop = svg(c, "g", {}), V = [], chon = null, khi = 0, xu = 0, nBo = 0, sec = 0, ts0 = 0, dung = 0, toc = 1, pha = "cho", daThu = false, no = false, mocDa = 0, keoV = null;
    function veGio() {
      xuG.innerHTML = ""; for (var i = 0; i < xu; i++) svg(xuG, "circle", { cx: 108 + (i % 5) * 21, cy: 370 - Math.floor(i / 5) * 14, r: 8, class: "tc-bb-xu" });
      tyT.textContent = dien(t.ty, { k: khi, x: xu });
      var r = khi / Math.max(1, xu); vo.setAttribute("class", "tc-bb-vo " + (r > g.nguong ? "tc-bb-do" : r > g.nguong / 2 ? "tc-bb-cam" : "tc-bb-xanh"));
      if (!daThu) { var R = Math.min(102, 40 + 5.5 * khi); vo.setAttribute("r", R); day.setAttribute("y1", BY + R); }
    }
    function taoVat(i) {
      var d = g.vat[i], tv = t.vat[i], e = svg(lop, "g", { class: "tc-bb-vat tc-bb-l-" + d.loai, tabindex: "0", role: "button", "aria-label": tv.full, "data-i": i, "data-loai": d.loai });
      svg(e, "rect", { x: 0, y: 0, width: VW, height: VH, rx: d.loai === "khi" ? 23 : 8, class: "tc-bb-the" });
      if (d.loai === "khi") svg(e, "circle", { cx: 18, cy: 23, r: 10, class: "tc-bb-i-khi" });
      else if (d.loai === "xu") { svg(e, "circle", { cx: 18, cy: 23, r: 10, class: "tc-bb-xu" }); svg(e, "text", { x: 18, y: 27, "text-anchor": "middle", class: "tc-bb-xu-chu" }, "$"); }
      else svg(e, "path", { d: "M10 12 h16 l-8 11 l8 11 h-16 l8 -11 Z", class: "tc-bb-i-cat" });
      cotChu(e, 68, 19, tv.a, "tc-bb-vat-chu", 15);
      var v = { i: i, e: e, x: 600, y: BELT, loai: d.loai, xong: false }; hDat(e, v.x, v.y); V.push(v); return v;
    }
    function chonV(v) {
      chon = v; V.forEach(function (x) { x.e.classList.toggle("tc-bb-chon", x === v); });
      hangVat.hidden = !v; if (v) cap.textContent = t.vat[v.i].full;
    }
    function bay(v, x, y, xong) { v.xong = true; v.e.removeAttribute("tabindex"); v.e.setAttribute("aria-hidden", "true"); v.e.style.transition = giam ? "" : "transform .45s ease, opacity .45s"; hDat(v.e, x, y, " scale(.3)"); v.e.style.opacity = 0; if (chon === v) chonV(null); if (xong) xong(); }
    function vao(v, dich, tu) {
      if (v.xong) return;
      if (dich === "bong") {
        if (daThu) { cap.textContent = t.da_thu_roi; return; }
        if (v.loai !== "khi" && !tu) { cap.textContent = t.khong_bong; return; }
        khi++; bay(v, BX - 20, BY - 20); veGio(); cap.textContent = tu ? dien(t.tu_roi, { a: t.vat[v.i].a.join(" ") }) : t.phong;
      } else if (dich === "gio") {
        if (v.loai === "khi") { cap.textContent = t.khong_gio; return; }
        if (v.loai === "xu") { xu++; cap.textContent = t.them_xu; } else { dung = 2000; cap.textContent = t.vat[v.i].full + " " + t.cham_lai; bien.setAttribute("visibility", "visible"); hHen(s, function () { bien.setAttribute("visibility", "hidden"); }, 2400); }
        bay(v, BX - 20, 340); veGio();
      } else { nBo++; thungN.textContent = nBo; bay(v, 500, 340); cap.textContent = t.da_bo; }
    }
    svg(bien, "rect", { x: 310, y: 74, width: 278, height: 34, rx: 8, class: "tc-bb-bien" });
    svg(bien, "text", { x: 449, y: 96, "text-anchor": "middle", class: "tc-h-cam" }, t.canh_bao);
    vB.onclick = function () { if (chon) vao(chon, "bong"); }; vG.onclick = function () { if (chon) vao(chon, "gio"); }; vT.onclick = function () { if (chon) vao(chon, "thung"); };
    keoSvg(c, "g.tc-bb-vat", function (e, p, b, dau) {
      var v = V.filter(function (x) { return x.e === e; })[0]; if (!v || v.xong || pha !== "chay") return false;
      if (b === "bat") { keoV = { v: v, x0: v.x, y0: v.y }; lop.appendChild(e); return; }
      if (!keoV) return; v.x = keoV.x0 + p.x - dau.x; v.y = keoV.y0 + p.y - dau.y; hDat(e, v.x, v.y);
    }, function (e, p) {
      var k = keoV; keoV = null; if (!k) return; var v = k.v;
      if (!p) { v.x = k.x0; v.y = k.y0; hDat(v.e, v.x, v.y); chonV(v); return; }
      var cx = v.x + VW / 2, cy = v.y + VH / 2, R = +vo.getAttribute("r");
      if (Math.hypot(cx - BX, cy - BY) < R + 30 && cy < 300) vao(v, "bong");
      else if (cx < 250 && cy >= 300) vao(v, "gio");
      else if (cx > 430 && cy > 300) vao(v, "thung");
      if (!v.xong) { v.y = BELT; v.x = Math.max(300, k.x0); hDat(v.e, v.x, v.y); }
    });
    c.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return; var e = ev.target.closest && ev.target.closest("g.tc-bb-vat"); if (!e) return; ev.preventDefault();
      var v = V.filter(function (x) { return x.e === e; })[0]; if (v && !v.xong) { chonV(v); vB.focus({ preventScroll: true }); }
    });
    function thuBong() {
      daThu = true; var r = khi / Math.max(1, xu);
      if (khi > 0 && r > g.nguong) {
        no = true; bong.setAttribute("visibility", "hidden"); day.setAttribute("visibility", "hidden"); cap.textContent = t.no;
        var R = +vo.getAttribute("r"), ms = [];
        for (var i = 0; i < 10; i++) { var a = i / 10 * 6.283; ms.push({ a: a, e: svg(manh, "path", { d: "M0 -7 L6 5 L-6 5 Z", class: "tc-bb-manh" }) }); }
        hChay(s, 900, function (f) { ms.forEach(function (m) { hDat(m.e, BX + Math.cos(m.a) * R * (0.6 + f), BY + Math.sin(m.a) * R * (0.6 + f), " rotate(" + (f * 220) + ")"); m.e.style.opacity = 1 - f; }); });
        hChay(s, 700, function (f) { hDat(gio, 0, 30 * f); });
      } else {
        cap.textContent = t.xep; var R0 = +vo.getAttribute("r");
        hChay(s, 2500, function (f) { var R = R0 + (34 - R0) * f; vo.setAttribute("r", R); day.setAttribute("y1", BY + R); });
      }
    }
    function het() {
      pha = "xong"; nhanh.hidden = true; hangVat.hidden = true;
      V.forEach(function (v) { if (!v.xong) bay(v, 640, v.y); });
      svg(c, "rect", { x: 304, y: 70, width: 284, height: 120, rx: 10, class: "tc-bb-the-ket" });
      cotChu(c, 446, 98, t.net, "tc-bb-ket-chu", 22);
      ket.textContent = (no ? dien(t.ket_no, { x: xu }) : dien(t.ket_xep, { x: xu })) + " " + t.ket_dong + " " + t.ket_net;
      ket.hidden = false; lai.hidden = false; cap.textContent = t.cuoi;
    }
    function khung1(ts) {
      if (!s.isConnected || s._dung || pha !== "chay") return;
      var d = Math.min(60, ts - ts0) / 1000; ts0 = ts;
      if (dung > 0) dung -= d * 1000; else sec += d * toc;
      var nam = namLuc(sec);
      while (V.length < g.vat.length && nam >= g.vat[V.length].nam) taoVat(V.length);
      V.forEach(function (v) {
        if (v.xong || (keoV && keoV.v === v) || dung > 0) return;
        v.x -= g.toc * d * toc; hDat(v.e, v.x, v.y);
        if (v.x < 300) { if (!daThu) vao(v, "bong", true); else { bay(v, 300, 420); cap.textContent = t.roi_mat; } }
      });
      kimT.setAttribute("cx", xNam(nam)); ngT.textContent = hienNam(nam); dhT.textContent = hSo2(diem(nam));
      while (mocDa < g.moc.length && nam >= g.moc[mocDa][0]) { cap.textContent = t.moc[mocDa]; dhT.classList.add("tc-bb-dh-moc"); mocDa++; }
      if (!daThu && nam >= g.thu) thuBong();
      if (sec >= L[L.length - 1][0]) { kimT.setAttribute("cx", xNam(NAM1)); ngT.textContent = hienNam(NAM1); dhT.textContent = hSo2(diem(NAM1)); het(); return; }
      requestAnimationFrame(khung1);
    }
    bd.onclick = function () { bd.hidden = true; nhanh.hidden = false; pha = "chay"; cap.textContent = t.dang; ts0 = performance.now(); requestAnimationFrame(khung1); };
    nhanh.onclick = function () { toc = toc === 1 ? g.nhanh : 1; hBat(nhanh, toc > 1); };
    hBat(nhanh, false);
    lai.onclick = function () { hLai(s, bomBongBong, g, t); };
    veGio();
    [san, cap, hangVat, hang, ket].forEach(function (e) { s.appendChild(e); }); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 3 H KẾT THÚC ====
  // ==== ĐỢT 3 I BẮT ĐẦU ====
  // Đợt 3 I: ba cảnh "Nhìn lại sự kiện lớn" (thang-leo-thang, vong-khoanh, pho-ngan-hang).
  // Sân khấu nền tối cố định (màu giống nhau ở chế độ sáng và tối), chữ dài nằm ở dòng .tc-cap bên dưới.
  function datI(o, p, muot) { o.e.style.transition = muot && !giam ? "transform .35s" : ""; o.e.setAttribute("transform", "translate(" + p.x + "," + p.y + ")"); o.p = p; }
  // Kéo một vật trong SVG: lay(e) trả về vật {e, p} hoặc null (đang khóa); tha(vat, daKeo): daKeo=false khi chỉ chạm hoặc bấm Enter
  function keoVatI(c, chon, lay, tha) {
    keoSvg(c, chon, function (e, p, b, dau) {
      var o = lay(e); if (!o) return false;
      if (b === "bat") { e.parentNode.appendChild(e); o.lech = null; return; }
      if (!o.lech) o.lech = { x: dau.x - o.p.x, y: dau.y - o.p.y };
      datI(o, { x: p.x - o.lech.x, y: p.y - o.lech.y });
    }, function (e, p) { var o = lay(e); if (o) tha(o, !!p); });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest(chon); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return;
      ev.preventDefault(); var o = lay(e); if (o) tha(o, false);
    });
  }
  function vatKeoI(cha, lop, nhan) { return svg(cha, "g", { class: "tc-keo " + lop, tabindex: "0", role: "button", "aria-label": nhan }); }
  function conI(s) { return document.body.contains(s); }
  var THANG_EN_I = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function ngayI(d) { return en ? d.getDate() + " " + THANG_EN_I[d.getMonth()] : d.getDate() + "/" + (d.getMonth() + 1); }
  function choiLaiI(s, lam, g, t) { var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var f = moi.querySelector(".tc-keo, button"); if (f) f.focus({ preventScroll: true }); }
  // giả ngẫu nhiên có hạt giống, để cảnh lần nào cũng xếp giống nhau
  function hatI(n) { return function () { n = (n * 9301 + 49297) % 233280; return n / 233280; }; }

  // ---------- Cảnh: thang leo thang (Cuba 1962) ----------
  // t.nac: 6 nấc thấp → cao; t.the: {ma: {a: [2 dòng], full}}; t.dich_ten: {thang, thu, dao}; ngày 16 → 28/10
  function thangLeoThang(g, t) {
    var s = khung(g, t), san = canh("tc-tlt-san"), c = svg(san, "svg", { viewBox: "0 0 600 420", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.mo); cap.setAttribute("aria-live", "polite");
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 420, class: "tc-tlt-bien" });
    for (var k = 0; k < 12; k++) svg(c, "path", { d: "M" + (196 + (k * 131) % 300) + " " + (40 + (k * 71) % 250) + " q6 -5 12 0 q6 5 12 0", class: "tc-tlt-song" });
    // đảo, bệ tên lửa, vạch phong tỏa
    var dao = svg(c, "g", {});
    svg(dao, "path", { d: "M232 300 C246 270 300 260 342 268 C376 275 388 292 368 306 C342 324 268 326 232 300 Z", class: "tc-tlt-dat" });
    var be = [0, 1, 2].map(function (i) { var b = svg(dao, "g", { class: "tc-tlt-be-g" }); svg(b, "rect", { x: 268 + i * 28, y: 286, width: 20, height: 10, rx: 2, class: "tc-tlt-be" }); svg(b, "rect", { x: 276 + i * 28, y: 268, width: 5, height: 19, rx: 2.5, class: "tc-tlt-ten-lua" }); return b; });
    var cau = svg(c, "g", { opacity: "0" });
    for (k = 0; k < 6; k++) svg(cau, "rect", { x: 366 + k * 9, y: 296 + k * 2, width: 7, height: 16, rx: 1.5, class: "tc-tlt-go" });
    svg(cau, "line", { x1: 364, y1: 296, x2: 420, y2: 308, class: "tc-tlt-tay-vin" });
    var vach = svg(c, "path", { d: "M170 330 A135 135 0 1 1 430 330", class: "tc-tlt-vach", opacity: "0" });
    var vachChu = svg(c, "text", { x: 300, y: 152, "text-anchor": "middle", class: "tc-tlt-do", opacity: "0" }, t.phong_toa_nhan);
    // tàu hàng tiến về vạch
    var TAU = [200, 245, 290].map(function (y) {
      var e = svg(c, "g", {}), h = svg(e, "g", {});
      svg(h, "path", { d: "M-22 0 L22 0 L16 10 L-16 10 Z", class: "tc-tlt-than-tau" }); svg(h, "rect", { x: 2, y: -10, width: 14, height: 10, rx: 2, class: "tc-tlt-cabin" });
      svg(h, "rect", { x: -16, y: -7, width: 14, height: 7, rx: 1, class: "tc-tlt-hang" });
      var dx = Math.sqrt(135 * 135 - (295 - y) * (295 - y));
      return { e: e, h: h, y: y, dung: 300 + dx + 26 };
    });
    // hộp thư giữa hai bên
    svg(c, "rect", { x: 262, y: 54, width: 76, height: 48, rx: 8, class: "tc-tlt-hop" }); svg(c, "rect", { x: 280, y: 66, width: 40, height: 6, rx: 3, class: "tc-tlt-khe" });
    svg(c, "text", { x: 300, y: 122, "text-anchor": "middle", class: "tc-tlt-chu" }, t.hop_thu);
    // đồng hồ 13 ngày
    svg(c, "rect", { x: 500, y: 10, width: 90, height: 62, rx: 8, class: "tc-tlt-lich" });
    var lich = svg(c, "text", { x: 545, y: 40, "text-anchor": "middle", class: "tc-tlt-lich-so" }, ""), lichN = svg(c, "text", { x: 545, y: 61, "text-anchor": "middle", class: "tc-tlt-lich-nho" }, "");
    // góc Thổ Nhĩ Kỳ (chỉ hiện khi thắng)
    var tho = svg(c, "g", { opacity: "0" }); svg(tho, "text", { x: 545, y: 92, "text-anchor": "middle", class: "tc-tlt-nho" }, t.tho);
    var JUP = []; for (k = 0; k < 15; k++) JUP.push(svg(tho, "circle", { cx: 515 + (k % 5) * 15, cy: 104 + Math.floor(k / 5) * 13, r: 4.5, class: "tc-tlt-jup" }));
    var kin = svg(tho, "text", { x: 592, y: 156, "text-anchor": "end", class: "tc-tlt-vang", opacity: "0" }, t.kin);
    // sự kiện 26/10 và 27/10
    var thu = svg(c, "g", { opacity: "0" }); svg(thu, "rect", { x: -20, y: -13, width: 40, height: 26, rx: 3, class: "tc-tlt-phong-bi" }); svg(thu, "path", { d: "M-20 -13 L0 3 L20 -13", class: "tc-tlt-nep" });
    var u2 = svg(c, "g", { opacity: "0" }); svg(u2, "path", { d: "M462 176 l34 0 M479 166 l0 22 M470 186 l18 0", class: "tc-tlt-may-bay" }); svg(u2, "circle", { cx: 479, cy: 196, r: 6, class: "tc-tlt-cham-do" });
    var ngam = svg(c, "g", { opacity: "0" }); svg(ngam, "path", { d: "M420 352 q0 -12 30 -12 l40 0 q14 0 14 12 Z", class: "tc-tlt-ngam" }); svg(ngam, "rect", { x: 452, y: 330, width: 12, height: 12, rx: 2, class: "tc-tlt-ngam" });
    // cái thang 6 nấc
    var MAU = ["#16A34A", "#65A30D", "#CA8A04", "#EA580C", "#DC2626", "#991B1B"];
    svg(c, "text", { x: 87, y: 22, "text-anchor": "middle", class: "tc-tlt-nho" }, t.thang);
    svg(c, "line", { x1: 14, y1: 30, x2: 14, y2: 322, class: "tc-tlt-ray" }); svg(c, "line", { x1: 160, y1: 30, x2: 160, y2: 322, class: "tc-tlt-ray" });
    function yNac(m) { return 300 - (m - 1) * 50; }
    t.nac.forEach(function (n, i) { svg(c, "rect", { x: 18, y: yNac(i + 1) - 17, width: 138, height: 34, rx: 6, style: "fill:" + MAU[i] }); svg(c, "text", { x: 87, y: yNac(i + 1) + 5, "text-anchor": "middle", class: "tc-tlt-nac" }, (i + 1) + " " + n); });
    var chip = svg(c, "g", {}); svg(chip, "path", { d: "M-2 0 L10 -10 L10 10 Z", class: "tc-tlt-chip" }); svg(chip, "circle", { cx: 18, cy: 0, r: 11, class: "tc-tlt-chip" });
    // khay thẻ
    svg(c, "rect", { x: 0, y: 336, width: 600, height: 84, class: "tc-tlt-khay" });
    var DICH = { phong_toa: ["thang"], khong_kich: ["thang"], hua: ["thu"], cau: ["dao"], cho: ["thang", "thu"], danh_tra: ["thang"], jupiter: ["thu"] };
    var muc = 1, mua = 0, lui = 0, ngay = 16, hen = null, xong = false, buoc = 1, daCau = false, theNay = [];
    function veChip(muot) { chip.style.transition = muot && !giam ? "transform .5s" : ""; chip.setAttribute("transform", "translate(160," + yNac(Math.min(6, muc)) + ")"); }
    function veNgay() {
      lich.textContent = ngayI(new Date(1962, 9, ngay)); lichN.textContent = dien(t.ngay_thu, { n: ngay - 15 });
      TAU.forEach(function (o) {
        var x = 588 - (ngay - 16) * 20; if (muc >= 2 && ngay >= 22) x = Math.max(x, o.dung);
        if (!o.ve) { o.e.style.transition = giam ? "" : "transform .5s linear"; o.e.setAttribute("transform", "translate(" + x + "," + o.y + ")"); }
      });
      if (ngay >= 22 && muc >= 2) { vach.setAttribute("opacity", "1"); vachChu.setAttribute("opacity", "1"); }
    }
    veChip(); veNgay();
    function chayToi(d, sau) {
      clearInterval(hen); khoaThe(true);
      hen = setInterval(function () {
        if (!conI(s)) { clearInterval(hen); return; }
        if (ngay >= d) { clearInterval(hen); hen = null; khoaThe(false); sau(); return; }
        ngay++; veNgay();
      }, giam ? 160 : 520);
    }
    function khoaThe(k) { theNay.forEach(function (o) { o.e.classList.toggle("tc-tlt-mo", k); }); }
    function xepKhay(ds) {
      theNay.forEach(function (o) { o.e.remove(); }); theNay = [];
      ds.forEach(function (ma, i) {
        var e = vatKeoI(c, "tc-tlt-the-g", t.the[ma].full);
        svg(e, "rect", { x: 0, y: 0, width: 108, height: 60, rx: 8, class: ma === "cau" ? "tc-tlt-the tc-tlt-the-cau" : (ma === "khong_kich" || ma === "danh_tra" ? "tc-tlt-the tc-tlt-the-nong" : "tc-tlt-the") });
        cotChu(e, 54, t.the[ma].a[1] ? 26 : 35, t.the[ma].a.filter(Boolean), "tc-tlt-the-chu", 19);
        var o = { e: e, ma: ma, nha: { x: 12 + i * 116, y: 350 } }; datI(o, o.nha); theNay.push(o);
      });
    }
    function vung(o) {
      var x = o.p.x + 54, y = o.p.y + 30;
      if (x < 175 && y < 330) return "thang";
      if (Math.abs(x - 300) < 90 && y < 150) return "thu";
      if (Math.hypot(x - 310, y - 295) < 110 && y < 336) return "dao";
      return null;
    }
    keoVatI(c, "g.tc-tlt-the-g", function (e) { if (hen || xong) { cap.textContent = hen ? t.khoa : cap.textContent; return null; } return theNay.filter(function (o) { return o.e === e; })[0] || null; }, function (o, daKeo) {
      var d = daKeo ? vung(o) : DICH[o.ma][0];
      if (!d) { datI(o, o.nha, true); return; }
      if (DICH[o.ma].indexOf(d) < 0) { datI(o, o.nha, true); cap.textContent = dien(t.sai_cho, { d: t.dich_ten[DICH[o.ma][0]] }); return; }
      lam(o);
    });
    function bo(o) { theNay = theNay.filter(function (x) { return x !== o; }); o.e.remove(); }
    function lam(o) {
      var ma = o.ma; bo(o);
      if (ma === "cau") { lui++; daCau = true; cau.setAttribute("opacity", "1"); cap.textContent = t.da_cau; return; }
      if (ma === "jupiter") { lui++; cap.textContent = t.da_jupiter; bayThu({ x: 120, y: 380 }); return; }
      if (ma === "khong_kich") { muc = 4; veChip(true); thua(); return; }
      if (ma === "phong_toa") { muc = 2; mua++; veChip(true); cap.textContent = t.da_phong_toa; xepKhay([]); chayToi(26, buoc2); return; }
      if (ma === "hua") { mua++; cap.textContent = t.da_hua; bayThu({ x: 120, y: 380 }); xepKhay(daCau ? [] : ["cau"]); chayToi(27, buoc3); return; }
      if (ma === "cho") { mua++; cap.textContent = t.da_cho; }
      if (ma === "danh_tra") { muc++; veChip(true); cap.textContent = t.da_danh; if (muc >= 4) { thua(); return; } }
      xepKhay([]); chayToi(28, ketThuc);
    }
    function bayThu(tu) {
      thu.style.transition = ""; thu.setAttribute("transform", "translate(" + tu.x + "," + tu.y + ")"); thu.setAttribute("opacity", "1"); thu.getBoundingClientRect();
      thu.style.transition = giam ? "" : "transform .8s ease-in-out"; thu.setAttribute("transform", "translate(300,70)");
      setTimeout(function () { thu.setAttribute("opacity", "0"); }, giam ? 300 : 1000);
    }
    function buoc2() { buoc = 2; bayThu({ x: 620, y: 40 }); cap.textContent = t.p2; xepKhay(["hua", "khong_kich", "cau"]); }
    function buoc3() { buoc = 3; u2.setAttribute("opacity", "1"); ngam.setAttribute("opacity", "1"); cap.textContent = t.p3; xepKhay(["cho", "danh_tra", "jupiter"].concat(daCau ? [] : ["cau"])); }
    function thua() {
      xong = true; clearInterval(hen); xepKhay([]); san.classList.add("tc-tlt-xam");
      var o = svg(c, "g", {}); svg(o, "rect", { x: 150, y: 120, width: 300, height: 130, rx: 12, class: "tc-tlt-o-thua" });
      svg(o, "text", { x: 300, y: 150, "text-anchor": "middle", class: "tc-tlt-do" }, t.khong_biet[0]); cotChu(o, 300, 180, t.khong_biet.slice(1), "tc-tlt-chu-thua", 22);
      cap.textContent = "";
      ketVoiNut(ket, dien(t.thua, { m: muc }), t.nut_lai, function () { choiLaiI(s, thangLeoThang, g, t); });
    }
    function ketThuc() {
      xong = true; var thang = muc <= 2 && lui >= 1;
      if (thang) {
        cap.textContent = t.cap_thang; u2.setAttribute("opacity", "0");
        TAU.forEach(function (o) { o.ve = true; o.h.setAttribute("transform", "scale(-1,1)"); o.e.style.transition = giam ? "" : "transform 2.4s ease-in"; o.e.setAttribute("transform", "translate(660," + o.y + ")"); });
        be.forEach(function (b, i) { setTimeout(function () { b.setAttribute("opacity", "0"); }, giam ? 0 : 500 + i * 450); });
        tho.setAttribute("opacity", "1");
        JUP.forEach(function (d, i) { setTimeout(function () { d.setAttribute("opacity", ".15"); }, giam ? 0 : 1600 + i * 140); });
        setTimeout(function () { kin.setAttribute("opacity", "1"); }, giam ? 0 : 3800);
      } else cap.textContent = t.cap_chua;
      ketVoiNut(ket, dien(thang ? t.ket : t.ket_chua, { t: mua, l: lui, m: muc }), t.nut_lai, function () { choiLaiI(s, thangLeoThang, g, t); });
    }
    xepKhay(["phong_toa", "khong_kich"]);
    s.appendChild(san); s.appendChild(cap); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // Mô hình lây minh họa cho vòng khoanh: tất định (cùng ngày gửi thư, cùng ngày khép vòng thì cùng kết quả).
  // Chưa có thư: tỷ lệ cao; thư đã đi nhưng vòng còn hở: thấp hơn; vòng kín: thấp và không lây qua vòng.
  function hashI(a) { var x = Math.sin(a * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function layI(ds, n, thu, vong) {
    var kin = vong != null && n > vong, p = kin ? 0.1 : (thu != null && n > thu ? 0.2 : 0.34), moi = [];
    ds.forEach(function (d, i) {
      if (!d.om || d.nhap || n - d.tu > 6 || hashI(i * 997 + n * 7.31) > p) return;
      var gan = -1, kc = 95;
      ds.forEach(function (e, j) { if (e.om || e.nhap || moi.indexOf(j) >= 0) return; if (kin && e.trong !== d.trong) return; var h = Math.hypot(e.x - d.x, e.y - d.y); if (h < kc) { kc = h; gan = j; } });
      if (gan >= 0) moi.push(gan);
    });
    return moi;
  }
  // Chạy cùng mô hình tới khi dịch tắt, trả về số chấm chuyển cam
  function demLayI(goc, iDau, thu, vong) {
    var ds = goc.map(function (d) { return { x: d.x, y: d.y, trong: d.trong, om: false, tu: 0 }; });
    ds[iDau].om = true;
    for (var n = 1; n <= 125; n++) layI(ds, n, thu, vong).forEach(function (j) { ds[j].om = true; ds[j].tu = n; });
    return ds.filter(function (d) { return d.om; }).length;
  }

  // ---------- Cảnh: vòng khoanh và lá thư (SARS, Hà Nội 2003) ----------
  // Chấm là minh họa. Lịch bắt đầu 26/2/2003, mỗi nhịp một ngày. g.ms_ngay: độ dài một ngày (ms)
  function vongKhoanh(g, t) {
    var s = khung(g, t), san = canh("tc-vk-san"), c = svg(san, "svg", { viewBox: "0 0 600 410", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.mo); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), bd = nut(t.nut_bd, true), tb = nut(t.nut_tb, false); tb.disabled = true; hang.appendChild(bd); hang.appendChild(tb);
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    var CX = 190, CY = 196, R = 92, ngay0 = new Date(2003, 1, 26);
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 410, class: "tc-vk-nen" });
    // dải "điều đã biết"
    var dai = svg(c, "rect", { x: 10, y: 8, width: 380, height: 30, rx: 8, class: "tc-vk-dai" });
    var biet = svg(c, "text", { x: 22, y: 28, class: "tc-vk-chu" }, t.biet_chua);
    // mặt bằng bệnh viện
    svg(c, "rect", { x: 14, y: 48, width: 360, height: 286, rx: 6, class: "tc-vk-tuong" });
    [[24, 58, 110, 80], [144, 58, 100, 80], [254, 58, 110, 80], [24, 244, 110, 80], [254, 244, 110, 80]].forEach(function (r) { svg(c, "rect", { x: r[0], y: r[1], width: r[2], height: r[3], rx: 4, class: "tc-vk-phong" }); });
    svg(c, "text", { x: 24, y: 330, class: "tc-vk-nho" }, t.benh_vien);
    var cua = { x: 362, y: 296 };
    svg(c, "rect", { x: 368, y: 280, width: 10, height: 34, class: "tc-vk-cua" });
    // chỗ đặt 6 đoạn rào
    function cung(a0, a1, r) { var p = function (a) { return (CX + r * Math.cos(a)).toFixed(1) + " " + (CY + r * Math.sin(a)).toFixed(1); }; return "M" + p(a0) + " A" + r + " " + r + " 0 0 1 " + p(a1); }
    var CHO = []; for (var k = 0; k < 6; k++) { var a0 = -Math.PI / 2 + k * Math.PI / 3 + 0.06, a1 = a0 + Math.PI / 3 - 0.12; CHO.push({ a: (a0 + a1) / 2, e: svg(c, "path", { d: cung(a0, a1, R), class: "tc-vk-cho" }), dat: false }); }
    // các chấm (minh họa): trong vòng và ngoài vòng
    var rnd = hatI(7), cham = [], lop = svg(c, "g", {});
    function themCham(x, y, om, ngayBenh) { var e = svg(lop, "circle", { cx: x, cy: y, r: 6.5, class: "tc-vk-dot" }); var d = { e: e, x: x, y: y, trong: Math.hypot(x - CX, y - CY) < R, om: false, tu: 0, nhap: false }; cham.push(d); if (om) benh(d, ngayBenh || 0); return d; }
    var dem = 0;
    while (dem < 11) { var a = rnd() * 6.283, r = 18 + rnd() * 56, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a); if (cham.every(function (d) { return Math.hypot(d.x - x, d.y - y) > 17; })) { themCham(x, y); dem++; } }
    dem = 0;
    while (dem < 18) { x = 28 + rnd() * 336; y = 60 + rnd() * 262; if (Math.hypot(x - CX, y - CY) > R + 16 && cham.every(function (d) { return Math.hypot(d.x - x, d.y - y) > 20; })) { themCham(x, y); dem++; } }
    var dau = themCham(CX + 4, CY - 2, false);
    function benh(d, n) { if (d.om) return; d.om = true; d.tu = n; d.e.setAttribute("class", "tc-vk-dot tc-vk-om"); }
    // bên phải: lịch, hộp thư WHO, thanh 20 ngày
    svg(c, "rect", { x: 440, y: 10, width: 110, height: 72, rx: 8, class: "tc-vk-lich" }); svg(c, "rect", { x: 440, y: 10, width: 110, height: 18, rx: 8, class: "tc-vk-lich-dau" });
    var lich = svg(c, "text", { x: 495, y: 64, "text-anchor": "middle", class: "tc-vk-lich-so" }, ngayI(ngay0));
    svg(c, "text", { x: 495, y: 24, "text-anchor": "middle", class: "tc-vk-lich-nam" }, "2003");
    var hop = svg(c, "g", {}); svg(hop, "rect", { x: 450, y: 118, width: 90, height: 64, rx: 8, class: "tc-vk-hop" }); var nap = svg(hop, "rect", { x: 444, y: 110, width: 102, height: 14, rx: 4, class: "tc-vk-nap" });
    svg(hop, "text", { x: 495, y: 160, "text-anchor": "middle", class: "tc-vk-who" }, "WHO");
    var song = svg(c, "circle", { cx: 495, cy: 150, r: 10, class: "tc-vk-song", opacity: "0" });
    var demG = svg(c, "g", { opacity: "0" });
    svg(demG, "text", { x: 400, y: 226, class: "tc-vk-chu" }, t.dem_nhan);
    svg(demG, "rect", { x: 400, y: 236, width: 186, height: 16, rx: 8, class: "tc-vk-thanh-nen" });
    var thanh = svg(demG, "rect", { x: 400, y: 236, width: 0, height: 16, rx: 8, class: "tc-vk-thanh" });
    var demSo = svg(demG, "text", { x: 586, y: 270, "text-anchor": "end", class: "tc-vk-nho" }, "0/20");
    // khay: 6 đoạn rào (2 đoạn khóa đến khi công bố), lá thư, cái loa
    svg(c, "rect", { x: 14, y: 344, width: 572, height: 58, rx: 8, class: "tc-vk-khay" });
    var RAO = [], DS = [];
    for (k = 0; k < 6; k++) (function (k) {
      var e = vatKeoI(c, "tc-vk-rao-g", dien(t.rao_nhan, { n: k + 1 }));
      svg(e, "rect", { x: -24, y: -22, width: 48, height: 40, rx: 6, style: "fill:transparent" }); svg(e, "path", { d: "M-20 10 A30 30 0 0 1 20 10", class: "tc-vk-rao" });
      var o = { e: e, loai: "rao", nha: { x: 44 + k * 52, y: 372 }, mo: k < 4 }; datI(o, o.nha); if (!o.mo) e.classList.add("tc-vk-khoa"); RAO.push(o); DS.push(o);
    })(k);
    var khoaChu = svg(c, "text", { x: 226, y: 398, "text-anchor": "middle", class: "tc-vk-nho" }, t.khoa_rao);
    var thuE = vatKeoI(c, "tc-vk-thu-g", t.thu_nhan); svg(thuE, "rect", { x: -20, y: -13, width: 40, height: 26, rx: 3, class: "tc-vk-phong-bi" }); svg(thuE, "path", { d: "M-20 -13 L0 2 L20 -13", class: "tc-vk-nep" });
    var THU = { e: thuE, loai: "thu", nha: { x: CX + 44, y: CY - 30 } }; datI(THU, THU.nha); DS.push(THU);
    var loaE = vatKeoI(c, "tc-vk-loa-g", t.loa_nhan); svg(loaE, "path", { d: "M-18 -6 L-6 -6 L14 -18 L14 18 L-6 6 L-18 6 Z", class: "tc-vk-loa" }); svg(loaE, "path", { d: "M20 -10 q8 10 0 20", class: "tc-vk-loa-song" });
    svg(loaE, "text", { x: 0, y: 34, "text-anchor": "middle", class: "tc-vk-nho" }, t.loa_chu);
    var LOA = { e: loaE, loai: "loa", nha: { x: 520, y: 362 } }; datI(LOA, LOA.nha); DS.push(LOA);
    var n = 0, hen = null, xong = false, ngThu = null, ngVong = null, ngCuoi = 0, soRao = 0, daLoa = false;
    function ngayCua(i) { var d = new Date(ngay0); d.setDate(d.getDate() + i); return d; }
    function kin() { return soRao === 6; }
    function nhip() {
      if (!conI(s)) { clearInterval(hen); return; }
      n++; lich.textContent = ngayI(ngayCua(n));
      if (n === 49) { biet.textContent = t.biet_16_4; dai.setAttribute("class", "tc-vk-dai tc-vk-dai-sang"); }
      // lây (minh họa, tất định theo ngày gửi thư và ngày khép vòng của người chơi)
      var moi = layI(cham, n, ngThu, ngVong).map(function (i) { return cham[i]; });
      moi.forEach(function (e) { benh(e, n); ngCuoi = n; });
      if (kin()) {
        var lang = Math.min(20, n - Math.max(ngCuoi, ngVong)); thanh.setAttribute("width", 186 * lang / 20); demSo.textContent = lang + "/20";
        demG.setAttribute("class", lang >= 20 ? "tc-vk-du" : "");
      }
      if (n >= 125) ketThuc(null);
    }
    bd.onclick = function () { bd.hidden = true; tb.hidden = false; cap.textContent = t.dang_chay; benh(dau, 0); hen = setInterval(nhip, g.ms_ngay || 450); };
    keoVatI(c, "g.tc-keo", function (e) {
      if (!hen || xong) { if (!hen && !xong) cap.textContent = t.chua_bd; return null; }
      var o = DS.filter(function (x) { return x.e === e; })[0]; if (!o || o.xong || (o.loai === "rao" && !o.mo)) { if (o && o.loai === "rao" && !o.mo) cap.textContent = t.can_loa; return null; } return o;
    }, function (o, daKeo) {
      var x = o.p.x, y = o.p.y;
      if (o.loai === "thu") { if (!daKeo || (x > 420 && y > 90 && y < 200)) guiThu(); else datI(o, o.nha, true); return; }
      if (o.loai === "loa") { if (!daKeo || (x > 420 && y < 100)) congBo(); else datI(o, o.nha, true); return; }
      var h = Math.hypot(x - CX, y - CY);
      if (daKeo && (h < R - 55 || h > R + 60)) { datI(o, o.nha, true); return; }
      var trong = CHO.filter(function (q) { return !q.dat; }); if (!trong.length) return;
      var goc = Math.atan2(y - CY, x - CX), gan = trong[0];
      if (daKeo) trong.forEach(function (q) { var d1 = Math.abs(Math.atan2(Math.sin(q.a - goc), Math.cos(q.a - goc))), d0 = Math.abs(Math.atan2(Math.sin(gan.a - goc), Math.cos(gan.a - goc))); if (d1 < d0) gan = q; });
      gan.dat = true; gan.e.setAttribute("class", "tc-vk-cho tc-vk-da-dat"); o.xong = true; o.e.remove(); soRao++;
      if (kin()) { ngVong = n; tb.disabled = false; demG.setAttribute("opacity", "1"); cap.textContent = dien(t.da_vong, { d: ngayI(ngayCua(n)) }); }
      else cap.textContent = dien(t.them_rao, { n: soRao });
    });
    function guiThu() {
      THU.xong = true; ngThu = n; datI(THU, { x: 495, y: 130 }, true); setTimeout(function () { THU.e.setAttribute("opacity", "0"); }, giam ? 0 : 380);
      song.setAttribute("opacity", "1"); song.setAttribute("class", "tc-vk-song tc-vk-song-chay"); if (giam) setTimeout(function () { song.setAttribute("opacity", "0"); }, 900);
      cap.textContent = dien(t.da_thu, { d: ngayI(ngayCua(n)) });
    }
    function congBo() {
      LOA.xong = true; daLoa = true; datI(LOA, { x: 495, y: 50 }, true); setTimeout(function () { LOA.e.setAttribute("opacity", "0"); }, giam ? 0 : 380);
      RAO.forEach(function (o) { if (!o.mo) { o.mo = true; o.e.classList.remove("tc-vk-khoa"); } }); khoaChu.textContent = "";
      cap.textContent = t.da_loa;
    }
    tb.onclick = function () {
      if (xong || !kin()) return;
      var lang = n - Math.max(ngCuoi, ngVong);
      if (lang < 20) {
        var d = themCham(cua.x - 12, cua.y, false); d.nhap = true; benh(d, n); d.e.setAttribute("class", "tc-vk-dot tc-vk-om tc-vk-nhap"); ngCuoi = n;
        thanh.setAttribute("width", 0); demSo.textContent = "0/20"; cap.textContent = t.som; return;
      }
      ketThuc(n);
    };
    function ketThuc(ngTb) {
      xong = true; clearInterval(hen); tb.disabled = true;
      var goc = cham.filter(function (d) { return !d.nhap; }), iDau = goc.indexOf(dau);
      var om = demLayI(goc, iDau, ngThu, ngVong), omThat = demLayI(goc, iDau, 2, 11); // 28/2 và 9/3 = ngày 2 và 11 kể từ 26/2
      var f = function (v) { return v == null ? t.chua : ngayI(ngayCua(v)); };
      cap.textContent = t.cap_het;
      ketVoiNut(ket, dien(t.ket, { thu: f(ngThu), vong: f(ngVong), tb: f(ngTb), c: om, c0: omThat, n: goc.length }), t.nut_lai, function () { choiLaiI(s, vongKhoanh, g, t); });
    }
    tb.hidden = true;
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: phố ngân hàng (Đại suy thoái 1929–1934) ----------
  // 12 tòa ngân hàng (minh họa), mỗi tòa két 0–3 vạch. Mỗi năm một làn rút tiền chạy tới vài tòa; túi tiền của Fed đổ đầy két.
  // Hết năm: tòa bị rút mà không có túi mất 2 vạch; tòa về 0 thì đóng cửa và kéo tòa bên cạnh mất 1 vạch.
  function phoNganHang(g, t) {
    var s = khung(g, t), san = canh("tc-pn-san"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.p0); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_sup, true), loc = nut("", false), dung = nut(t.nut_dung, false);
    loc.classList.add("tc-pn-cong-tac"); loc.hidden = true; dung.hidden = true; dung.classList.add("tc-pn-dung");
    hang.appendChild(tiep); hang.appendChild(loc); hang.appendChild(dung);
    var doanK = tao("div", "tc-pn-doan"); doanK.hidden = true;
    var ket = tao("p", "tc-dap tc-ket"); ket.hidden = true;
    svg(c, "rect", { x: 0, y: 0, width: 600, height: 400, class: "tc-pn-troi" });
    svg(c, "rect", { x: 0, y: 306, width: 600, height: 94, class: "tc-pn-dat" });
    // dải băng giấy chứng khoán
    svg(c, "rect", { x: 0, y: 6, width: 600, height: 28, class: "tc-pn-bang" });
    var bang = svg(c, "text", { x: 300, y: 26, "text-anchor": "middle", class: "tc-pn-bang-chu" }, t.bang_0);
    var nam = svg(c, "text", { x: 588, y: 64, "text-anchor": "end", class: "tc-pn-nam" }, t.nam[0]);
    // Fed bên trái: rương vàng + cần gạt lãi suất ở trên, kho túi tiền ở dưới
    var fed = svg(c, "g", {});
    svg(fed, "path", { d: "M8 196 L62 166 L116 196 Z", class: "tc-pn-mai-fed" }); svg(fed, "rect", { x: 12, y: 196, width: 100, height: 110, class: "tc-pn-tuong-fed" });
    for (var k = 0; k < 4; k++) svg(fed, "rect", { x: 20 + k * 24, y: 204, width: 10, height: 64, class: "tc-pn-cot" });
    svg(fed, "text", { x: 62, y: 190, "text-anchor": "middle", class: "tc-pn-fed" }, "FED");
    var kho = svg(fed, "text", { x: 62, y: 296, "text-anchor": "middle", class: "tc-pn-nho" }, "");
    var vang = svg(c, "g", { opacity: "0" });
    svg(vang, "rect", { x: 10, y: 84, width: 54, height: 40, rx: 5, class: "tc-pn-ruong" }); var vangMuc = svg(vang, "rect", { x: 14, y: 92, width: 46, height: 28, class: "tc-pn-vang" });
    svg(vang, "text", { x: 37, y: 140, "text-anchor": "middle", class: "tc-pn-nho" }, t.vang);
    var ri = svg(vang, "path", { d: "M64 104 l30 0", class: "tc-pn-ri" });
    svg(vang, "line", { x1: 104, y1: 76, x2: 104, y2: 146, class: "tc-pn-ray" });
    svg(vang, "text", { x: 122, y: 81, class: "tc-pn-nho" }, so(3.5, 1) + "%"); svg(vang, "text", { x: 122, y: 151, class: "tc-pn-nho" }, so(1.5, 1) + "%");
    var can = vatKeoI(vang, "tc-pn-can-g", t.can_nhan); can.setAttribute("role", "slider"); can.setAttribute("aria-valuemin", "1.5"); can.setAttribute("aria-valuemax", "3.5");
    svg(can, "rect", { x: -14, y: -9, width: 28, height: 18, rx: 6, class: "tc-pn-can" });
    var lai = 1.5, daGat = false;
    function veCan(muot) { can.style.transition = muot && !giam ? "transform .25s" : ""; can.setAttribute("transform", "translate(104," + (lai > 2.5 ? 76 : 146) + ")"); can.setAttribute("aria-valuenow", lai); can.setAttribute("aria-valuetext", so(lai, 1) + "%"); }
    veCan();
    // 12 tòa ngân hàng, tòa số 4 (chỉ số 3) là Bank of United States, to hơn
    var X0 = 132, BUOC = 38.8, NH = [];
    for (k = 0; k < 12; k++) (function (k) {
      var x = X0 + k * BUOC, to = k === 3, cao = to ? 104 : 80, w = 34, y0 = 302 - cao;
      var e = svg(c, "g", { class: "tc-pn-nh" });
      var than = svg(e, "g", {});
      svg(than, "path", { d: "M" + (x - 2) + " " + (y0 + 14) + " L" + (x + w / 2) + " " + y0 + " L" + (x + w + 2) + " " + (y0 + 14) + " Z", class: "tc-pn-mai" });
      svg(than, "rect", { x: x, y: y0 + 14, width: w, height: cao - 14, class: "tc-pn-tuong" });
      [5, 14, 23].forEach(function (cx) { svg(than, "rect", { x: x + cx, y: y0 + 20, width: 5, height: cao - 36, class: "tc-pn-cot" }); });
      var cua = svg(than, "rect", { x: x + 11, y: 288, width: 12, height: 14, class: "tc-pn-cua" });
      var gach = svg(than, "path", { d: "M" + (x + 3) + " 284 L" + (x + w - 3) + " 300 M" + (x + w - 3) + " 284 L" + (x + 3) + " 300", class: "tc-pn-gach", opacity: "0" });
      var vach = [0, 1, 2].map(function (i) { return svg(e, "rect", { x: x + 2 + i * 10.5, y: 310, width: 9, height: 8, rx: 2, class: "tc-pn-tien" }); });
      if (to) { svg(c, "line", { x1: x + w / 2, y1: y0 - 4, x2: x + w / 2, y2: 154, class: "tc-pn-que" }); svg(c, "text", { x: x + w / 2, y: 148, "text-anchor": "middle", class: "tc-pn-nho" }, "Bank of United States"); }
      NH.push({ e: e, than: than, cua: cua, gach: gach, vach: vach, x: x + w / 2, k: k, tien: 3, dung: true, rut: false });
    })(k);
    var hangDoi = svg(c, "g", {});
    function veTien(b) { b.vach.forEach(function (v, i) { v.setAttribute("class", "tc-pn-tien" + (i < b.tien ? "" : " tc-pn-tien-het")); }); }
    function veRut() {
      hangDoi.innerHTML = "";
      NH.forEach(function (b) {
        if (!b.rut || !b.dung) return;
        for (var i = 0; i < 5; i++) svg(hangDoi, "circle", { cx: b.x + (i % 2 ? 4 : -4), cy: 330 + i * 14, r: 4.5, class: "tc-pn-cham" + (giam ? "" : " tc-pn-cham-chay"), style: giam ? "" : "animation-delay:-" + (i * 0.28).toFixed(2) + "s" });
      });
    }
    function dongCua(b) {
      if (!b.dung) return; b.dung = false; b.tien = 0; b.rut = false; veTien(b);
      b.e.classList.add("tc-pn-do"); b.gach.setAttribute("opacity", "1");
      [b.k - 1, b.k + 1].forEach(function (j) { var h = NH[j]; if (!h || !h.dung) return; h.tien = Math.max(0, h.tien - 1); veTien(h); h.e.classList.remove("tc-pn-va"); void h.e.getBoundingClientRect(); h.e.classList.add("tc-pn-va"); if (h.tien === 0) dongCua(h); });
    }
    // túi tiền
    var tui = [];
    function datTui(soTui) {
      tui.forEach(function (o) { o.e.remove(); }); tui = [];
      for (var i = 0; i < soTui; i++) {
        var e = vatKeoI(c, "tc-pn-tui-g", t.tui_nhan); svg(e, "circle", { cx: 0, cy: 0, r: 13, class: "tc-pn-tui" }); svg(e, "path", { d: "M-5 -12 L0 -18 L5 -12", class: "tc-pn-tui-mieng" });
        svg(e, "text", { x: 0, y: 5, "text-anchor": "middle", class: "tc-pn-tui-chu" }, "$");
        var o = { e: e, nha: { x: 26 + (i % 4) * 24, y: 332 + Math.floor(i / 4) * 30 } }; datI(o, o.nha); tui.push(o);
      }
      kho.textContent = soTui ? dien(t.con_tui, { n: soTui }) : "";
    }
    function ganNhat(x, y) { if (y > 320 || x < X0 - 10) return null; var b = NH[Math.max(0, Math.min(11, Math.round((x - X0 - 17) / BUOC)))]; return b; }
    keoVatI(c, "g.tc-pn-tui-g", function (e) { if (xong) return null; return tui.filter(function (o) { return o.e === e; })[0] || null; }, function (o, daKeo) {
      var b = daKeo ? ganNhat(o.p.x, o.p.y) : NH.filter(function (h) { return h.dung && h.rut; })[0];
      if (!b || !b.dung) { datI(o, o.nha, true); if (!daKeo) cap.textContent = t.khong_rut; return; }
      tui = tui.filter(function (x) { return x !== o; }); o.e.remove(); kho.textContent = tui.length ? dien(t.con_tui, { n: tui.length }) : "";
      b.tien = 3; veTien(b); var co = b.rut; b.rut = false; veRut(); daDung = true; loc.disabled = true;
      cap.textContent = dien(co ? t.da_cuu : t.da_bom, { n: b.k + 1 });
    });
    // cần gạt lãi suất (1931)
    keoSvg(c, "g.tc-pn-can-g", function (e, p) { if (buoc !== 3 || xong) return false; if (p) { lai = p.y < 111 ? 3.5 : 1.5; veCan(); } }, function (e, p) { if (!p) lai = lai > 2.5 ? 1.5 : 3.5; daGat = true; veCan(true); doiLai(); });
    can.addEventListener("keydown", function (ev) { if (buoc !== 3 || xong) return; if (ev.key === "ArrowUp" || ev.key === "ArrowRight") lai = 3.5; else if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") lai = 1.5; else if (ev.key === "Enter" || ev.key === " ") lai = lai > 2.5 ? 1.5 : 3.5; else return; ev.preventDefault(); daGat = true; veCan(true); doiLai(); });
    function doiLai() { cap.textContent = lai > 2.5 ? t.lai_cao : t.lai_thap; ri.setAttribute("opacity", lai > 2.5 ? "0" : "1"); }
    // rèm ngày nghỉ ngân hàng (1933) và khiên bảo hiểm (1934)
    var rem = svg(c, "rect", { x: X0 - 6, y: 40, width: 600 - X0 + 6, height: 0, class: "tc-pn-rem" });
    var remChu = svg(c, "text", { x: 366, y: 190, "text-anchor": "middle", class: "tc-pn-rem-chu", opacity: "0" }, t.rem_chu);
    var day = vatKeoI(c, "tc-pn-day-g", t.day_nhan); svg(day, "line", { x1: 0, y1: -30, x2: 0, y2: 0, class: "tc-pn-day" }); svg(day, "circle", { cx: 0, cy: 6, r: 11, class: "tc-pn-nut-day" });
    var DAY = { e: day, nha: { x: 366, y: 76 } }; datI(DAY, DAY.nha); day.setAttribute("opacity", "0");
    var khien = vatKeoI(c, "tc-pn-khien-g", t.khien_nhan); svg(khien, "path", { d: "M0 -22 L18 -14 L16 6 Q12 18 0 24 Q-12 18 -16 6 L-18 -14 Z", class: "tc-pn-khien" }); svg(khien, "path", { d: "M-7 0 l5 6 l10 -12", class: "tc-pn-khien-dau" });
    var KHIEN = { e: khien, nha: { x: 62, y: 352 } }; datI(KHIEN, KHIEN.nha); khien.setAttribute("opacity", "0");
    var vom = svg(c, "path", { d: "M" + (X0 - 8) + " 304 Q366 70 594 304", class: "tc-pn-vom", opacity: "0" });
    var buoc = 0, xong = false, tuLoc = true, daDung = false, cat = false, kiem = false, daKhien = false;
    function veLoc() { loc.textContent = dien(t.nut_loc, { b: tuLoc ? t.bat : t.tat }); loc.setAttribute("aria-pressed", tuLoc ? "true" : "false"); }
    loc.onclick = function () { if (daDung) return; tuLoc = !tuLoc; veLoc(); datTui(soTuiNam()); };
    dung.onclick = function () { dung.disabled = true; dung.classList.remove("tc-pn-nhay"); cat = true; datTui(0); [4, 11, 1].forEach(function (j) { if (NH[j].dung) NH[j].rut = true; }); veRut(); cap.textContent = t.da_dung; };
    function rutToi(ds) { ds.forEach(function (j) { if (NH[j].dung) NH[j].rut = true; }); veRut(); }
    function conDung() { return NH.filter(function (b) { return b.dung; }).length; }
    // Lịch các năm, viết tách cho dễ đọc
    var NAM = [
      null,
      function () { bang.textContent = t.bang_1; cap.textContent = t.p1; datTui(1); rutToi([0]); },
      function () { cap.textContent = t.p2; loc.hidden = false; veLoc(); datTui(soTuiNam()); rutToi([3, 6, 9, 1]); },
      function () { loc.hidden = true; cap.textContent = t.p3; vang.setAttribute("opacity", "1"); ri.setAttribute("opacity", "1"); datTui(soTuiNam()); rutToi([2, 5, 8, 10]); },
      function () { vang.setAttribute("opacity", "0.55"); can.style.pointerEvents = "none"; cap.textContent = lai > 2.5 ? t.p4 : t.p4_can; datTui(soTuiNam()); rutToi([7]); dung.hidden = false; dung.disabled = false; if (!giam) dung.classList.add("tc-pn-nhay"); },
      function () { dung.hidden = true; datTui(0); NH.forEach(function (b) { b.rut = false; }); veRut(); cap.textContent = t.p5; day.setAttribute("opacity", "1"); tiep.disabled = true; },
      function () { datTui(0); cap.textContent = t.p6; khien.setAttribute("opacity", "1"); rutToi([0, 2, 5, 9, 11]); tiep.hidden = true; }
    ];
    tiep.onclick = function () {
      if (buoc >= 1 && buoc <= 4) hetNam();
      buoc++; nam.textContent = t.nam[buoc]; daDung = false; loc.disabled = false;
      if (buoc < 6) tiep.textContent = dien(t.nut_tiep, { y: t.nam[buoc + 1] });
      NAM[buoc]();
      if (buoc > 1 && !conDung()) cap.textContent = t.het_pho + " " + cap.textContent;
    };
    // buoc: 0 = 8/1929, 1 = 10/1929, 2 = 1930, 3 = 1931, 4 = 1932, 5 = 3/1933, 6 = 1934
    function soTuiNam() { return buoc === 1 ? 1 : buoc === 2 ? (tuLoc ? 1 : 4) : buoc === 3 ? (tuLoc ? 1 : 3) : buoc === 4 ? (lai > 2.5 ? 4 : 1) : 0; }
    function hetNam() {
      NH.forEach(function (b) { if (b.dung && b.rut) { b.rut = false; b.tien = Math.max(0, b.tien - 2); veTien(b); } });
      NH.forEach(function (b) { if (b.dung && b.tien === 0) dongCua(b); });
      if (buoc === 3 && lai > 2.5) { NH.forEach(function (b) { if (b.dung) { b.tien = Math.max(0, b.tien - 1); veTien(b); } }); NH.forEach(function (b) { if (b.dung && b.tien === 0) dongCua(b); }); }
      if (buoc === 3 && lai <= 2.5) vangMuc.setAttribute("height", "0");
      veRut();
    }
    keoVatI(c, "g.tc-pn-day-g", function (e) { return buoc === 5 && !kiem && !xong ? DAY : null; }, function (o, daKeo) {
      if (daKeo && o.p.y < 150) { datI(o, o.nha, true); return; }
      kiem = true; datI(o, o.nha, true); day.setAttribute("opacity", "0");
      rem.style.transition = giam ? "" : "height .7s ease-in"; rem.setAttribute("height", "266"); remChu.setAttribute("opacity", "1");
      setTimeout(function () {
        if (!conI(s)) return;
        NH.forEach(function (b) { if (b.dung) { b.e.classList.add("tc-pn-mo-lai"); } });
        rem.setAttribute("height", "0"); remChu.setAttribute("opacity", "0");
        cap.textContent = dien(t.da_kiem, { n: conDung() }); tiep.disabled = false;
      }, giam ? 200 : 1500);
    });
    keoVatI(c, "g.tc-pn-khien-g", function (e) { return buoc === 6 && !daKhien && !xong ? KHIEN : null; }, function (o, daKeo) {
      if (daKeo && o.p.x < X0) { datI(o, o.nha, true); return; }
      daKhien = true; datI(o, { x: 366, y: 120 }, true); vom.setAttribute("opacity", "1");
      NH.forEach(function (b) { b.rut = false; }); veRut();
      cap.textContent = t.da_khien; doanK.hidden = false; th.focus({ preventScroll: true });
    });
    // đoán tỷ lệ thất nghiệp 1933
    var idT = g.id + "-doan", nh = tao("label", "tc-o-nhap", t.hoi_doan + " "); nh.htmlFor = idT; var nv = tao("b", "tc-so-nho", ""); nh.appendChild(nv);
    var th = tao("input"); th.type = "range"; th.min = 0; th.max = 50; th.step = 1; th.value = 10; th.id = idT; nh.appendChild(th);
    th.oninput = function () { nv.textContent = th.value + "%"; }; th.oninput();
    var xem = nut(t.nut_xem, true); doanK.appendChild(nh); var hx = tao("div", "tc-hang"); hx.appendChild(xem); doanK.appendChild(hx);
    var cot = tao("div", "tc-pn-cot-so"); cot.hidden = true; doanK.appendChild(cot);
    xem.onclick = function () {
      xong = true; xem.disabled = th.disabled = true; cot.innerHTML = ""; cot.hidden = false;
      [[t.ban_doan, +th.value, "tc-pn-c-ban"], [t.nam_1929, 3.3, "tc-pn-c-that"], [t.nam_1933, 25.2, "tc-pn-c-that"]].forEach(function (r) {
        var d = tao("div", "tc-pn-dong"); d.appendChild(tao("span", "tc-pn-dong-ten", r[0]));
        var o = tao("span", "tc-pn-o"), v = tao("i", r[2]); v.style.width = (r[1] * 2) + "%"; o.appendChild(v); d.appendChild(o);
        d.appendChild(tao("b", "", so(r[1], r[2] === "tc-pn-c-ban" ? 0 : 1) + "%")); cot.appendChild(d);
      });
      ketVoiNut(ket, dien(t.ket, { n: conDung() }), t.nut_lai, function () { choiLaiI(s, phoNganHang, g, t); });
    };
    NH.forEach(veTien); datTui(0);
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(doanK); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 3 I KẾT THÚC ====
  // ==== ĐỢT 3 J BẮT ĐẦU ====
  // Bốn cảnh Sự kiện: van-cfc (tầng ozone), van-dau (dầu mỏ 1973), thap-vay-ngan (châu Á 1997), va-de (bão Katrina).
  // Sân khấu nền tối cố định (tc-canh-toi) nên màu trong SVG giống nhau ở chế độ sáng và tối. Kéo bằng keoSvg; chạm hoặc Enter = đặt vật vào chỗ của nó.
  function jHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected && !s._dung) fn(); }, giam ? Math.min(ms, 60) : ms); }
  function jLai(s, lam, g, t) { s._dung = true; var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  // Hoạt cảnh f: 0 → 1 trong ms; khi giảm chuyển động thì nhảy thẳng tới cuối
  function jChay(s, ms, buoc, xong) {
    if (giam || ms <= 0) { buoc(1); if (xong) xong(); return; }
    var t0 = null;
    requestAnimationFrame(function f(ts) { if (!s.isConnected || s._dung) return; if (t0 == null) t0 = ts; var x = Math.min(1, (ts - t0) / ms); buoc(x); if (x < 1) requestAnimationFrame(f); else if (xong) xong(); });
  }
  function jDat(e, x, y, them) { e.setAttribute("transform", "translate(" + x + "," + y + ")" + (them || "")); }
  function jMuot(e, ms) { e.style.transition = giam ? "" : "transform " + ms + "ms ease, opacity " + ms + "ms"; }
  function jVe(o) { o.p = o.nha; jMuot(o.e, 250); jDat(o.e, o.nha.x, o.nha.y); }
  function jGan(o, x, y, r) { return Math.hypot(o.p.x + o.w / 2 - x, o.p.y + o.h / 2 - y) < r; }
  // Vật kéo được trong SVG: ds[i] = {e, w, h, nha, p}; khoa(o) = đang khóa; tha(o, keo) khi thả (keo = false khi chỉ chạm hoặc Enter); trả false để về chỗ cũ
  function jKeo(c, lop, ds, khoa, tha) {
    keoSvg(c, "g." + lop, function (e, p, b, d) {
      var o = ds[+e.getAttribute("data-i")]; if (!o || o.xong || khoa(o)) return false;
      if (b === "bat") { o.lech = null; c.appendChild(e); e.style.transition = ""; return; }
      if (!o.lech) o.lech = { x: d.x - o.p.x, y: d.y - o.p.y }; o.p = { x: p.x - o.lech.x, y: p.y - o.lech.y }; jDat(e, o.p.x, o.p.y);
    }, function (e, p) {
      var o = ds[+e.getAttribute("data-i")]; if (!o || o.xong) return;
      if (tha(o, !!p) === false) jVe(o);
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g." + lop); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault();
      var o = ds[+e.getAttribute("data-i")]; if (!o || o.xong || khoa(o)) return; if (tha(o, false) === false) jVe(o);
    });
  }
  function jThe(c, lop, i, w, h, dong, aria, nen) {
    var e = svg(c, "g", { class: "tc-keo " + lop, tabindex: "0", role: "button", "aria-label": aria, "data-i": i });
    svg(e, "rect", { x: 0, y: 0, width: w, height: h, rx: 7, class: nen || "tc-j-the" });
    dong.forEach(function (d, k) { svg(e, "text", { x: w / 2, y: h / 2 + 4.5 + (k - (dong.length - 1) / 2) * 14, "text-anchor": "middle", class: "tc-j-the-chu" }, d); });
    return e;
  }
  function jKet(ket, ds) {
    ket.innerHTML = "";
    ds.forEach(function (d) {
      if (!d) return;
      if (Array.isArray(d)) { var ul = tao("ul"); d.forEach(function (x) { ul.appendChild(tao("li", "", x)); }); ket.appendChild(ul); }
      else if (d.nodeType) ket.appendChild(d); else ket.appendChild(tao("p", "", d));
    });
    ket.hidden = false;
  }
  function jVong(c, x, y, r) { return svg(c, "circle", { cx: x, cy: y, r: r, class: "tc-j-dich", visibility: "hidden" }); }

  // ---------- Cảnh: khóa van CFC (lá chắn ozone trên Halley; thẻ quyết định hiện đúng năm; khóa van rồi clo vẫn gặm tiếp) ----------
  // g.du_tb: ozone tháng 10 TB 1957–72 (DU); g.du: [[năm, DU]] số đo Halley; g.dung: các năm dừng; g.mo_hinh: [[năm, % mất]] kịch bản không có Nghị định thư;
  // g.ve_quy, g.ve_cham: mức gạch hồi về năm 2066 (minh họa, có/không có Quỹ). t.the: [{chu, full, nam, dich, loai, cap}]; t.dung: câu ở mỗi năm dừng.
  function vanCfc(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 440", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), chay = nut(t.nut_chay, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(chay); hang.appendChild(lai);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var N0 = 1956, N1 = 2066, CX = 300, CY = 1400, RD = 1010, RL = 1140;
    function yDat(x) { return CY - Math.sqrt(RD * RD - (x - CX) * (x - CX)); }
    for (var i = 0; i < 30; i++) svg(c, "circle", { cx: (i * 151 + 23) % 600, cy: 12 + (i * 67) % 240, r: i % 5 ? 0.8 : 1.4, class: "tc-j-sao" });
    svg(c, "circle", { cx: 548, cy: 86, r: 24, class: "tc-oz-mat-troi" });
    var tiaG = svg(c, "g", {});
    svg(c, "circle", { cx: CX, cy: CY, r: RD, class: "tc-oz-dat" });
    svg(c, "ellipse", { cx: 300, cy: 397, rx: 190, ry: 9, class: "tc-oz-bang" });
    svg(c, "circle", { cx: 262, cy: 393, r: 4, class: "tc-oz-halley" });
    svg(c, "text", { x: 262, y: 418, "text-anchor": "middle", class: "tc-j-nho" }, "Halley");
    // Lá chắn: 30 viên gạch trên vòng cung; mất gạch từ giữa (trên Halley) ra hai bên
    var gach = [];
    for (var k = 0; k < 30; k++) {
      var x = 12 + (k + 0.5) * 576 / 30, can = Math.sqrt(RL * RL - (x - CX) * (x - CX)), y = CY - can, a = Math.atan((x - CX) / can) * 180 / Math.PI;
      var e = svg(c, "rect", { x: -9, y: -8, width: 18, height: 16, rx: 2, class: "tc-oz-gach", transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + a.toFixed(1) + ")" });
      gach.push({ e: e, x: x, y: y, hang: Math.abs(x - 262) + (k * 37 % 11) * 5, do: svg(c, "circle", { cx: x, cy: yDat(x) + 4, r: 3, class: "tc-oz-do", visibility: "hidden" }) });
    }
    gach.slice().sort(function (a, b) { return a.hang - b.hang; }).forEach(function (o, r) { o.r = r; });
    var soGach = -1;
    function datGach(n) { n = Math.max(0, Math.min(30, Math.round(n))); if (n === soGach) return; soGach = n; gach.forEach(function (o) { var mat = o.r < 30 - n; o.e.classList.toggle("tc-oz-mat", mat); o.do.setAttribute("visibility", mat ? "visible" : "hidden"); }); }
    datGach(30);
    // Ống khói CFC có van, bình xịt, tủ lạnh, xốp
    svg(c, "rect", { x: 40, y: 332, width: 24, height: 100, class: "tc-oz-ong" });
    svg(c, "text", { x: 52, y: 400, "text-anchor": "middle", class: "tc-oz-ong-chu", transform: "rotate(-90 52 400)" }, "CFC");
    var van = svg(c, "g", { transform: "translate(52,352)" }); svg(van, "circle", { r: 11, class: "tc-oz-van" }); var tay = svg(van, "rect", { x: -16, y: -2.5, width: 32, height: 5, rx: 2, class: "tc-oz-tay" });
    var binh = svg(c, "g", {}); svg(binh, "rect", { x: 78, y: 398, width: 13, height: 24, rx: 3, class: "tc-oz-binh" }); svg(binh, "rect", { x: 81, y: 392, width: 7, height: 6, class: "tc-oz-binh" });
    svg(c, "rect", { x: 98, y: 392, width: 20, height: 32, rx: 2, class: "tc-oz-tu" }); svg(c, "line", { x1: 98, x2: 118, y1: 403, y2: 403, class: "tc-oz-ke" });
    svg(c, "rect", { x: 124, y: 408, width: 24, height: 14, rx: 2, class: "tc-oz-xop" });
    // Hàng ống khói nhỏ của các nước đang phát triển
    var dpt = svg(c, "g", {}), dptX = [478, 502, 526, 550];
    dptX.forEach(function (x) { var y = yDat(x); svg(dpt, "rect", { x: x - 6, y: y - 28, width: 12, height: 32, class: "tc-oz-ong" }); });
    svg(c, "text", { x: 514, y: 366, "text-anchor": "middle", class: "tc-j-nho" }, t.ten.quy);
    // Bàn đàm phán, nhiệt kế
    svg(c, "rect", { x: 100, y: 214, width: 80, height: 7, rx: 2, class: "tc-oz-ban" }); svg(c, "rect", { x: 108, y: 221, width: 5, height: 18, class: "tc-oz-ban" }); svg(c, "rect", { x: 167, y: 221, width: 5, height: 18, class: "tc-oz-ban" });
    svg(c, "text", { x: 140, y: 206, "text-anchor": "middle", class: "tc-j-nho" }, t.ten.ban);
    svg(c, "rect", { x: 466, y: 160, width: 12, height: 70, rx: 6, class: "tc-oz-nk" }); svg(c, "circle", { cx: 472, cy: 234, r: 9, class: "tc-oz-thuy" });
    var thuy = svg(c, "rect", { x: 469, y: 176, width: 6, height: 56, class: "tc-oz-thuy" });
    svg(c, "text", { x: 472, y: 152, "text-anchor": "middle", class: "tc-j-nho" }, t.ten.nhiet);
    // Năm, số đo, biểu đồ nhỏ
    var namT = svg(c, "text", { x: 16, y: 34, class: "tc-j-nam" }, N0);
    var soT = svg(c, "text", { x: 584, y: 30, "text-anchor": "end", class: "tc-j-so" }, g.du_tb + " DU");
    var soN = svg(c, "text", { x: 584, y: 48, "text-anchor": "end", class: "tc-j-nho" }, t.tb);
    var BX = function (y) { return 22 + 176 * (y - N0) / (N1 - N0); }, BY = function (d) { return 140 - 58 * (d - 100) / 220; };
    svg(c, "rect", { x: 14, y: 50, width: 192, height: 100, rx: 6, class: "tc-oz-bd" });
    svg(c, "text", { x: 22, y: 66, class: "tc-j-nho" }, t.bd);
    var cp = svg(svg(c, "defs", {}), "clipPath", { id: g.id + "-cat" }), catR = svg(cp, "rect", { x: 14, y: 50, width: 0, height: 100 });
    var bd = svg(c, "g", { "clip-path": "url(#" + g.id + "-cat)" });
    svg(bd, "line", { x1: BX(1957), x2: BX(1972), y1: BY(g.du_tb), y2: BY(g.du_tb), class: "tc-oz-duong" });
    svg(bd, "polyline", { points: g.du.map(function (d) { return BX(d[0]).toFixed(1) + "," + BY(d[1]).toFixed(1); }).join(" "), class: "tc-oz-duong" });
    g.du.forEach(function (d) { svg(bd, "circle", { cx: BX(d[0]), cy: BY(d[1]), r: 1.8, class: "tc-oz-cham" }); });
    var cuoi = g.du[g.du.length - 1], duBao = svg(bd, "path", { d: "M" + BX(cuoi[0]) + " " + BY(cuoi[1]) + " Q" + BX(2035) + " " + BY(cuoi[1] + 20) + " " + BX(N1) + " " + BY(g.ve_quy), class: "tc-oz-du-bao" });
    svg(c, "text", { x: 20, y: BY(g.du_tb) - 4, class: "tc-j-nho" }, g.du_tb);
    svg(c, "line", { x1: BX(1987), x2: BX(1987), y1: 70, y2: 146, class: "tc-oz-vach" });
    var mhT = svg(c, "text", { x: BX(1987) + 4, y: 104, class: "tc-j-do", visibility: "hidden" }, t.mo_hinh_nhan);
    // Vòng chỉ chỗ thả
    var DICH = { binh: { x: 85, y: 408, r: 22 }, ban: { x: 140, y: 222, r: 50 }, van: { x: 52, y: 352, r: 24 }, quy: { x: 514, y: 398, r: 50 }, nhiet: { x: 472, y: 200, r: 44 } };
    Object.keys(DICH).forEach(function (k) { var d = DICH[k]; d.v = jVong(c, d.x, d.y, d.r); d.ten = t.ten[k]; });
    var hatG = svg(c, "g", {});
    // Thẻ quyết định
    var the = t.the.map(function (d, i) {
      var e = jThe(c, "tc-oz-the", i, 236, 34, [d.chu], d.full); e.setAttribute("visibility", "hidden");
      return { i: i, d: d, e: e, w: 236, h: 34, nha: { x: 218, y: 56 }, p: { x: 218, y: 56 }, hien: false, xong: false };
    });
    var nam = N0, xau = false, quy = false, kig = false, dangChay = false, eChinh = 1, eDpt = 1, buoc = -1, hen = null;
    function anDich() { Object.keys(DICH).forEach(function (k) { DICH[k].v.setAttribute("visibility", "hidden"); }); }
    function moThe(n) {
      the.filter(function (o) { return o.d.nam === n; }).forEach(function (o, k) {
        o.hien = true; o.nha = { x: 218, y: 56 + 42 * k }; o.p = o.nha; jDat(o.e, o.nha.x, o.nha.y); o.e.setAttribute("visibility", "visible"); DICH[o.d.dich].v.setAttribute("visibility", "visible");
      });
    }
    function cat(o) { o.hien = false; o.e.setAttribute("visibility", "hidden"); }
    function docSo(y) {
      var c_ = null; g.du.forEach(function (d) { if (d[0] <= y) c_ = d; });
      if (!c_) { soT.textContent = g.du_tb + " DU"; soN.textContent = t.tb; } else { soT.textContent = c_[1] + " DU"; soN.textContent = dien(t.do_o, { n: c_[0] }); }
    }
    function duAt(y) {
      var pts = [[1972, g.du_tb]].concat(g.du); if (y <= 1972) return g.du_tb;
      for (var j = 1; j < pts.length; j++) if (y <= pts[j][0]) { var a = pts[j - 1], b = pts[j]; return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]); }
      var dich = quy ? g.ve_quy : g.ve_cham; return cuoi[1] + (dich - cuoi[1]) * Math.min(1, (y - cuoi[0]) / (N1 - cuoi[0]));
    }
    var gach87 = 0;
    function capNam(y) {
      nam = y; namT.textContent = Math.floor(y);
      catR.setAttribute("width", Math.max(0, BX(Math.min(y, xau ? 1987 : N1)) - 14));
      if (!xau) { docSo(y); datGach(duAt(y) / 10); return; }
      var m = g.mo_hinh, p = y >= m[1][0] ? m[1] : y >= m[0][0] ? m[0] : null;
      soT.textContent = p ? "−" + p[1] + "%" : "…"; soN.textContent = p ? dien(t.mo_hinh_so, { n: p[0] }) : t.mo_hinh_nhan;
      var f = (y - 1987) / (m[1][0] - 1987); datGach(gach87 + (30 * (100 - m[1][1]) / 100 - gach87) * Math.min(1, f));
    }
    // Hạt clo bay lên gặm gạch, tia cực tím bị chặn hoặc lọt (chỉ khi không giảm chuyển động)
    function banHat(x0, y0) {
      if (hatG.childNodes.length > 40) return;
      var o = gach[Math.floor(Math.random() * 30)], h = svg(hatG, "path", { d: "M0 0 L6 -3.4 A7 7 0 1 0 6 3.4 Z", class: "tc-oz-hat" });
      h.style.transform = "translate(" + x0 + "px," + y0 + "px)"; h.getBoundingClientRect();
      h.style.transition = "transform 2.2s linear, opacity 2.2s ease-in"; h.style.transform = "translate(" + o.x + "px," + (o.y + 10) + "px)"; h.style.opacity = ".2";
      setTimeout(function () { h.remove(); }, 2300);
    }
    function banTia() {
      var o = gach[Math.floor(Math.random() * 30)], lot = o.e.classList.contains("tc-oz-mat");
      var l = svg(tiaG, "line", { x1: 536, y1: 100, x2: o.x, y2: lot ? yDat(o.x) : o.y - 8, class: lot ? "tc-oz-tia tc-oz-tia-lot" : "tc-oz-tia" });
      setTimeout(function () { l.remove(); }, 700);
    }
    function batHat() {
      if (giam) return; var dem = 0;
      hen = setInterval(function () {
        if (!s.isConnected || s._dung || !dangChay) { clearInterval(hen); return; } dem++;
        if (Math.random() < 0.75 * eChinh) banHat(52, 330);
        if (Math.random() < 0.5 * eDpt) { var x = dptX[dem % 4]; banHat(x, yDat(x) - 30); }
        if (dem % 3 === 0) banTia();
      }, 190);
    }
    function chayDen(y1, xong) {
      var y0 = nam, ms = Math.max(1200, (y1 - y0) * 110); dangChay = true; chay.disabled = true; batHat();
      jChay(s, ms, function (f) { capNam(y0 + (y1 - y0) * f); }, function () { capNam(y1); dangChay = false; xong(); });
    }
    function toiDung() {
      buoc++; var n = g.dung[buoc]; cap.textContent = t.dung[buoc]; moThe(n); chay.textContent = t.nut_tiep;
      chay.disabled = !the.filter(function (o) { return o.d.nam === n; }).every(function (o) { return !o.d.can; });
    }
    function xoay(goc) { tay.setAttribute("transform", "rotate(" + goc + ")"); }
    function datThe(o) {
      o.xong = true; o.e.classList.remove("tc-keo"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true");
      var d = DICH[o.d.dich]; d.v.setAttribute("visibility", "hidden"); jMuot(o.e, 350); jDat(o.e, d.x - 30, d.y - 4, " scale(.25)"); o.e.style.opacity = "0";
      var l = o.d.loai; cap.textContent = o.d.cap;
      if (l === "binh") { eChinh = 0.8; binh.setAttribute("opacity", ".3"); }
      if (l === "cat") { eChinh = 0.45; xoay(-45); the.forEach(function (x) { if (x.d.loai === "cho") cat(x); }); }
      if (l === "loai") { eChinh = 0.05; xoay(-90); van.querySelector("circle").setAttribute("class", "tc-oz-van tc-oz-van-khoa"); }
      if (l === "quy") { quy = true; eDpt = 0; dpt.setAttribute("opacity", ".3"); }
      if (l === "kigali") { kig = true; thuy.setAttribute("y", 192); thuy.setAttribute("height", 40); }
      if (l === "cho") {
        the.forEach(function (x) { if (x.d.loai === "cat") cat(x); }); anDich();
        xau = true; eChinh = 1.4; gach87 = soGach; duBao.setAttribute("visibility", "hidden"); mhT.setAttribute("visibility", "visible");
        chay.disabled = true; chayDen(g.mo_hinh[1][0], ketXau); return;
      }
      var n = g.dung[buoc]; chay.disabled = !the.filter(function (x) { return x.d.nam === n && x.d.can; }).every(function (x) { return x.xong; });
      if (l === "cat" || l === "cho") chay.disabled = false;
    }
    jKeo(c, "tc-oz-the", the, function (o) { return !o.hien || dangChay; }, function (o, keo) {
      var d = DICH[o.d.dich];
      if (keo && !jGan(o, d.x, d.y, d.r + 60)) { cap.textContent = dien(t.sai_cho, { d: d.ten }); return false; }
      datThe(o);
    });
    function ketThuc() { chay.hidden = true; lai.hidden = false; anDich(); }
    function ketTot() {
      cap.textContent = t.cap_tot; svg(c, "text", { x: BX(N1) - 2, y: 144, "text-anchor": "end", class: "tc-j-xanh" }, t.moc_2066);
      jKet(ket, [t.ket_tot, quy ? "" : t.ket_khong_quy, kig ? t.ket_kigali : "", t.ket_bai]); ketThuc();
    }
    function ketXau() { cap.textContent = t.cap_xau; jKet(ket, [t.ket_xau, t.ket_bai]); ketThuc(); }
    chay.onclick = function () {
      the.forEach(function (o) { if (o.hien && !o.xong) cat(o); }); anDich();
      if (buoc + 1 < g.dung.length) { if (g.dung[buoc] === 1990) cap.textContent = t.tre; else cap.textContent = t.dang_chay; chayDen(g.dung[buoc + 1], toiDung); }
      else { cap.textContent = t.ve; chayDen(N1, ketTot); }
    };
    lai.onclick = function () { jLai(s, vanCfc, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: van dầu và cây xăng (3 xu chuẩn bị cho 4 tấm đệm; tháng 10/1973 van vặn bớt; gạt hay không gạt cần giữ giá) ----------
  // g.gia: [giá 1/10/1973, 16/10/1973, 1/1/1974] USD/thùng; g.xu; g.ngay_thung (ngày mỗi thùng, luật chơi theo mức 90 ngày); g.hang_max (xe, minh họa).
  // t.vat: [{chu:[2 dòng], full, dich}] cho thung, ong, xe, tay; t.thang: [4 nhãn lịch]
  function vanDau(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 420", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), tiep1 = nut(t.nut_thang10, true), giuN = nut(t.nut_giu, false), tiep2 = nut(t.nut_chay, true), lai = nut(t.nut_lai, false);
    [tiep1, giuN, tiep2, lai].forEach(function (b) { hang.appendChild(b); }); giuN.hidden = tiep2.hidden = lai.hidden = true; giuN.setAttribute("aria-pressed", "false");
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    for (var i = 0; i < 22; i++) svg(c, "circle", { cx: (i * 151 + 41) % 600, cy: 10 + (i * 53) % 110, r: i % 4 ? 0.8 : 1.3, class: "tc-j-sao" });
    svg(c, "rect", { x: 0, y: 300, width: 600, height: 120, class: "tc-dm-dat" });
    svg(c, "rect", { x: 0, y: 236, width: 150, height: 64, class: "tc-dm-bien" });
    // Giếng dầu, tàu chở dầu
    [[34, 120], [86, 140]].forEach(function (p) { svg(c, "path", { d: "M" + (p[0] - 18) + " 236 L" + p[0] + " " + p[1] + " L" + (p[0] + 18) + " 236 M" + (p[0] - 11) + " 200 H" + (p[0] + 11) + " M" + (p[0] - 6) + " 166 H" + (p[0] + 6), class: "tc-dm-gian" }); });
    svg(c, "path", { d: "M18 246 H132 L124 262 H26 Z", class: "tc-dm-tau" }); svg(c, "rect", { x: 100, y: 236, width: 18, height: 10, class: "tc-dm-tau" });
    // Ống chính và van đỏ
    svg(c, "rect", { x: 112, y: 184, width: 132, height: 16, class: "tc-dm-ong" });
    var dong = svg(c, "line", { x1: 112, x2: 244, y1: 192, y2: 192, class: "tc-dm-chay" });
    var van = svg(c, "g", { transform: "translate(176,192)" }); svg(van, "circle", { r: 15, class: "tc-dm-van" }); var tay = svg(van, "rect", { x: -3, y: -24, width: 6, height: 48, rx: 2, class: "tc-dm-van" });
    svg(c, "text", { x: 176, y: 166, "text-anchor": "middle", class: "tc-j-nho" }, t.nguon_chinh);
    var catT = svg(c, "text", { x: 172, y: 226, "text-anchor": "middle", class: "tc-j-do", visibility: "hidden" }, t.cat);
    // Bể dự trữ
    var BY0 = 280, BH = 176;
    svg(c, "rect", { x: 244, y: 100, width: 76, height: 180, rx: 6, class: "tc-dm-be" });
    var muc = svg(c, "rect", { x: 248, y: BY0 - 2, width: 68, height: 0, class: "tc-dm-dau" });
    [30, 60, 90].forEach(function (d) { var y = BY0 - 2 - BH * d / 90; svg(c, "line", { x1: 244, x2: 256, y1: y, y2: y, class: "tc-dm-vach" }); svg(c, "text", { x: 260, y: y + 4, class: "tc-j-nho" }, d); });
    svg(c, "text", { x: 316, y: 90, "text-anchor": "end", class: "tc-j-nho" }, t.be);
    // Nguồn thứ hai (ống phụ nét đứt, có khe chờ đoạn ống nối)
    svg(c, "path", { d: "M26 300 L36 262 L46 300", class: "tc-dm-gian" });
    var phu = svg(c, "path", { d: "M46 292 H150 M210 292 H290 V282", class: "tc-dm-phu" });
    var khe = svg(c, "rect", { x: 150, y: 284, width: 60, height: 16, rx: 3, class: "tc-dm-khe" });
    svg(c, "text", { x: 100, y: 316, "text-anchor": "middle", class: "tc-j-nho" }, t.nguon_hai);
    // Ống ra cây xăng, cây xăng, đồng hồ giá, cần gạt giữ giá, biển chẵn lẻ
    svg(c, "rect", { x: 320, y: 222, width: 120, height: 10, class: "tc-dm-ong" });
    svg(c, "rect", { x: 420, y: 130, width: 150, height: 12, rx: 3, class: "tc-dm-mai" }); svg(c, "rect", { x: 428, y: 142, width: 5, height: 160, class: "tc-dm-mai" }); svg(c, "rect", { x: 558, y: 142, width: 5, height: 160, class: "tc-dm-mai" });
    svg(c, "rect", { x: 440, y: 200, width: 30, height: 100, rx: 4, class: "tc-dm-tru" }); svg(c, "rect", { x: 446, y: 210, width: 18, height: 14, class: "tc-dm-mat" });
    var bien = svg(c, "g", { visibility: "hidden" }); svg(bien, "rect", { x: 478, y: 156, width: 76, height: 40, rx: 4, class: "tc-dm-bien-le" }); cotChu(bien, 516, 172, t.bien_le, "tc-dm-bien-chu", 14);
    var GX = 510, GY = 74, GR = 40, GMAX = 14;
    function goc(v) { return -120 + 240 * Math.min(v, GMAX) / GMAX; }
    svg(c, "circle", { cx: GX, cy: GY, r: GR, class: "tc-dm-mat-dh" });
    [3, 6, 12].forEach(function (v) { var a = (goc(v) - 90) * Math.PI / 180; svg(c, "line", { x1: GX + 30 * Math.cos(a), y1: GY + 30 * Math.sin(a), x2: GX + 38 * Math.cos(a), y2: GY + 38 * Math.sin(a), class: "tc-dm-vach" }); svg(c, "text", { x: GX + 21 * Math.cos(a), y: GY + 21 * Math.sin(a) + 4, "text-anchor": "middle", class: "tc-j-nho" }, v); });
    var kimMa = svg(c, "line", { x1: GX, y1: GY, x2: GX, y2: GY - 34, class: "tc-dm-kim-ma", visibility: "hidden" });
    var kim = svg(c, "line", { x1: GX, y1: GY, x2: GX, y2: GY - 34, class: "tc-dm-kim" }); svg(c, "circle", { cx: GX, cy: GY, r: 4, class: "tc-dm-van" });
    var giaT = svg(c, "text", { x: GX, y: GY + 26, "text-anchor": "middle", class: "tc-dm-gia" }, "");
    svg(c, "text", { x: GX, y: GY + 52, "text-anchor": "middle", class: "tc-j-nho" }, t.don_vi);
    var can = svg(c, "g", { class: "tc-dm-can", "aria-hidden": "true", visibility: "hidden" });
    svg(can, "rect", { x: 566, y: 92, width: 22, height: 10, rx: 3, class: "tc-dm-mai" }); var canTay = svg(can, "g", { transform: "rotate(-30 577 97)" });
    svg(canTay, "rect", { x: 574, y: 46, width: 6, height: 50, rx: 3, class: "tc-dm-tay" }); svg(canTay, "circle", { cx: 577, cy: 46, r: 8, class: "tc-dm-van" });
    var canChu = svg(can, "text", { x: 596, y: 120, "text-anchor": "end", class: "tc-j-nho" }, t.giu_ngan);
    var khoaT = svg(c, "text", { x: GX, y: GY - 46, "text-anchor": "middle", class: "tc-j-cam", visibility: "hidden" }, t.khoa);
    // Thế giới (cái bắt tay), lịch, xu
    var cau = svg(c, "circle", { cx: 372, cy: 58, r: 24, class: "tc-dm-cau" }); svg(c, "path", { d: "M350 58 H394 M372 34 V82 M356 44 Q372 58 356 72 M388 44 Q372 58 388 72", class: "tc-dm-kinh" });
    svg(c, "text", { x: 378, y: 100, "text-anchor": "middle", class: "tc-j-nho" }, t.nuoc_khac);
    svg(c, "rect", { x: 14, y: 12, width: 98, height: 52, rx: 6, class: "tc-dm-lich" }); svg(c, "rect", { x: 14, y: 12, width: 98, height: 12, rx: 4, class: "tc-dm-lich-dau" });
    var lichT = svg(c, "text", { x: 63, y: 54, "text-anchor": "middle", class: "tc-dm-lich-chu" }, t.thang[0]);
    var xuT = svg(c, "text", { x: 128, y: 30, class: "tc-j-nho" }, t.xu), xuO = [];
    for (var x_ = 0; x_ < g.xu; x_++) xuO.push(svg(c, "circle", { cx: 136 + x_ * 22, cy: 46, r: 8, class: "tc-dm-xu" }));
    // Làn xe
    svg(c, "line", { x1: 0, x2: 600, y1: 352, y2: 352, class: "tc-dm-ke" });
    var xe = [];
    for (var q = 0; q < g.hang_max; q++) {
      var e = svg(c, "g", {}); svg(e, "rect", { x: 0, y: 6, width: 38, height: 12, rx: 3, class: "tc-dm-xe" }); svg(e, "path", { d: "M8 6 L13 0 H27 L32 6 Z", class: "tc-dm-xe" });
      svg(e, "circle", { cx: 9, cy: 19, r: 3.5, class: "tc-dm-banh" }); svg(e, "circle", { cx: 29, cy: 19, r: 3.5, class: "tc-dm-banh" });
      e.la = svg(e, "path", { d: "M32 -6 q6 -6 10 0 q-6 4 -10 0 Z", class: "tc-dm-la", visibility: "hidden" });
      jDat(e, -60, 314); xe.push(e);
    }
    var soXe = 0, xeLon = 0;
    function hangXe(n) { soXe = n; xeLon = Math.max(xeLon, n); xe.forEach(function (e, k) { jMuot(e, 600); jDat(e, k < n ? 396 - 44 * k : -60 - 44 * (k - n), 314); }); }
    hangXe(2);
    // Khay đồ chuẩn bị
    var KIEU = ["thung", "thung", "thung", "ong", "xe", "tay"], DICH = { thung: { x: 282, y: 190, r: 90 }, ong: { x: 180, y: 292, r: 60 }, xe: { x: 300, y: 330, r: 180 }, tay: { x: 372, y: 58, r: 70 } };
    Object.keys(DICH).forEach(function (k) { var d = DICH[k]; d.v = jVong(c, d.x, d.y, k === "xe" ? 26 : k === "thung" ? 46 : 30); });
    DICH.xe.v.setAttribute("cx", 420); Object.keys(DICH).forEach(function (k) { DICH[k].v.setAttribute("visibility", "visible"); });
    var vat = KIEU.map(function (k, i) {
      var d = t.vat[k], e = jThe(c, "tc-dm-vat", i, 90, 40, d.chu, d.full, "tc-dm-the tc-dm-the-" + k), o = { i: i, k: k, e: e, w: 90, h: 40, nha: { x: 10 + i * 97, y: 368 } };
      o.p = o.nha; jDat(e, o.nha.x, o.nha.y); return o;
    });
    var xu = g.xu, man = 1, thung = 0, ong = false, xeTk = false, bat = false, giu = false;
    function veXu() { xuO.forEach(function (o, k) { o.setAttribute("class", k < xu ? "tc-dm-xu" : "tc-dm-xu tc-dm-xu-het"); }); }
    function khoaVat() { vat.forEach(function (o) { if (!o.xong && (xu <= 0 || man > 1)) o.e.setAttribute("opacity", ".35"); }); }
    function dat(o) {
      if (xu <= 0) { cap.textContent = t.het_xu; return false; }
      xu--; veXu(); o.xong = true; o.e.classList.remove("tc-keo"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true");
      var d = DICH[o.k]; jMuot(o.e, 350); jDat(o.e, d.x - 20, d.y - 10, " scale(.4)"); o.e.style.opacity = "0";
      if (o.k === "thung") { thung++; muc.setAttribute("height", BH * thung * g.ngay_thung / 90); muc.setAttribute("y", BY0 - 2 - BH * thung * g.ngay_thung / 90); cap.textContent = dien(t.da_thung, { d: thung * g.ngay_thung }); }
      if (o.k === "ong") { ong = true; khe.setAttribute("class", "tc-dm-khe tc-dm-khe-noi"); phu.setAttribute("class", "tc-dm-phu tc-dm-phu-noi"); cap.textContent = t.vat.ong.da; }
      if (o.k === "xe") { xeTk = true; xe.forEach(function (e) { e.la.setAttribute("visibility", "visible"); }); cap.textContent = t.vat.xe.da; }
      if (o.k === "tay") { bat = true; cau.setAttribute("class", "tc-dm-cau tc-dm-cau-bat"); cap.textContent = t.vat.tay.da; }
      if (xu <= 0) { cap.textContent += " " + t.het_xu; khoaVat(); }
    }
    jKeo(c, "tc-dm-vat", vat, function () { return man > 1 || xu <= 0; }, function (o, keo) {
      var d = DICH[o.k];
      if (keo && !(o.k === "xe" ? Math.abs(o.p.y + 20 - 330) < 50 : jGan(o, d.x, d.y, d.r))) { cap.textContent = t.sai_cho; return false; }
      return dat(o);
    });
    function quay(e, a) { e.setAttribute("transform", "rotate(" + a + " " + GX + " " + GY + ")"); }
    var giaMa = g.gia[0], giaTra = g.gia[0];
    function kimDen(kimE, tu, den, cb) { jChay(s, 900, function (f) { var v = tu + (den - tu) * f; quay(kimE, goc(v)); if (kimE === kim) giaT.textContent = so(v, 2); }, cb); }
    quay(kim, goc(g.gia[0])); quay(kimMa, goc(g.gia[0])); giaT.textContent = so(g.gia[0], 2);
    function doiGiu() {
      if (man !== 2) return; giu = !giu; giuN.setAttribute("aria-pressed", giu ? "true" : "false"); 
      giuN.classList.toggle("tc-da-chon", giu); canTay.setAttribute("transform", "rotate(" + (giu ? 30 : -30) + " 577 97)");
      khoaT.setAttribute("visibility", giu ? "visible" : "hidden"); cap.textContent = giu ? t.da_giu : t.bo_giu;
    }
    giuN.onclick = doiGiu; can.addEventListener("click", doiGiu);
    tiep1.onclick = function () {
      man = 2; tiep1.hidden = true; khoaVat(); Object.keys(DICH).forEach(function (k) { DICH[k].v.setAttribute("visibility", "hidden"); }); lichT.textContent = t.thang[1];
      tay.setAttribute("transform", "rotate(25)"); dong.setAttribute("class", "tc-dm-chay tc-dm-chay-mong"); catT.setAttribute("visibility", "visible");
      can.setAttribute("visibility", "visible"); giuN.hidden = tiep2.hidden = false; cap.textContent = t.man_2; giuN.focus({ preventScroll: true });
    };
    var dem = Math.min(0.9, thungDem());
    function thungDem() { return 0.2 * thung + (ong ? 0.15 : 0) + (xeTk ? 0.15 : 0) + (bat ? 0.15 : 0); }
    tiep2.onclick = function () {
      man = 3; giuN.disabled = tiep2.disabled = true; dem = Math.min(0.9, thungDem());
      var Q = giu ? Math.round(g.hang_max * (1 - dem)) : Math.max(1, Math.round(4 * (1 - dem)));
      if (giu) kimMa.setAttribute("visibility", "visible");
      cap.textContent = t.buoc[0]; lichT.textContent = t.thang[1];
      kimDen(kimMa, g.gia[0], g.gia[1]); if (!giu) kimDen(kim, g.gia[0], g.gia[1]); hangXe(Math.round((2 + Q) / 2));
      jHen(s, function () {
        lichT.textContent = t.thang[2]; cap.textContent = giu ? t.buoc_giu : t.buoc_tha;
        kimDen(kimMa, g.gia[1], g.gia[2]); if (!giu) kimDen(kim, g.gia[1], g.gia[2]); hangXe(Q); if (giu) bien.setAttribute("visibility", "visible");
        var con = thung * g.ngay_thung * 0.4; jChay(s, 1200, function (f) { var h = BH * (thung * g.ngay_thung * (1 - f) + con * f) / 90; muc.setAttribute("height", h); muc.setAttribute("y", BY0 - 2 - h); });
        jHen(s, function () {
          lichT.textContent = t.thang[3]; tay.setAttribute("transform", "rotate(0)"); dong.setAttribute("class", "tc-dm-chay"); catT.setAttribute("visibility", "hidden");
          cap.textContent = t.mo_lai; ketQua(Q);
        }, 1800);
      }, 1500);
    };
    function thanh(nhan, gt, max, chu, xau) {
      var d = tao("div", "tc-dm-thanh"); d.appendChild(tao("span", "tc-dm-thanh-nhan", nhan));
      var o = tao("span", "tc-dm-thanh-o"), b = tao("span", "tc-dm-thanh-day" + (xau ? " tc-dm-thanh-xau" : "")); b.style.width = Math.round(100 * Math.min(1, gt / max)) + "%"; o.appendChild(b); d.appendChild(o);
      d.appendChild(tao("b", "", chu)); return d;
    }
    function ketQua(Q) {
      var bang = tao("div", "tc-dm-bang"), ngay = thung * g.ngay_thung, gia = giu ? g.gia[0] : g.gia[2];
      bang.appendChild(thanh(t.thanh[0], ngay, 90, dien(t.thanh_ngay, { d: ngay }) + (ong ? " " + t.them_ong : ""), false));
      bang.appendChild(thanh(t.thanh[1], xeLon, g.hang_max, dien(t.thanh_xe, { n: xeLon }), true));
      bang.appendChild(thanh(t.thanh[2], gia, 12, dien(t.thanh_gia, { g: so(gia, 2) }) + (giu ? " " + t.bi_khoa : ""), true));
      jKet(ket, [giu ? t.ket_giu : t.ket_tha, bang, t.that_nhan, t.that, t.ket_bai]); lai.hidden = false; tiep2.hidden = giuN.hidden = true;
    }
    lai.onclick = function () { jLai(s, vanDau, g, t); };
    veXu();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: tháp vay ngắn (gạch đô la ngắn hạn và gạch nội tệ dài hạn, bể dự trữ có ngăn kéo kỳ hạn, cần gạt tỷ giá, tháp hàng xóm) ----------
  // g.o: số ô của tháp; g.thoi_gian: số nhịp đến đầu 1997 (gạch đô la tốn 1, nội tệ tốn 2); g.nguong: % gạch đô la tối đa để tháp đứng (luật chơi);
  // g.keo: số lần bị kéo cần; g.cuu: gạch nội tệ khẩn cấp; g.giay: giây để gia cố. Mọi số thật nằm trong t.
  function thapVayNgan(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), sang = nut(t.nut_1997, true), bom = nut(t.nut_bom, false), hua = nut(t.nut_hua, false), truot = nut(t.nut_truot, false),
      bung = nut(t.nut_bung, true), rut = nut(t.nut_rut, false), chot = nut(t.nut_chot, true), lai = nut(t.nut_lai, false);
    var nuts = [sang, bom, hua, truot, bung, rut, chot, lai]; nuts.forEach(function (b) { b.hidden = true; hang.appendChild(b); }); sang.hidden = false; sang.disabled = true;
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    for (var i = 0; i < 24; i++) svg(c, "circle", { cx: (i * 151 + 61) % 600, cy: 10 + (i * 59) % 120, r: i % 4 ? 0.8 : 1.3, class: "tc-j-sao" });
    // Tháp hàng xóm B, C, D (mờ, phía sau)
    var xom = [[150, 70, "B"], [396, 84, "C"], [560, 62, "D"]].map(function (d) {
      var e = svg(c, "g", { class: "tc-ca-xom" }); for (var r = 0; r < 4; r++) svg(e, "rect", { x: d[0], y: 340 - (r + 1) * d[1] / 4, width: 30, height: d[1] / 4 - 2, class: "tc-ca-xom-gach" });
      svg(e, "text", { x: d[0] + 15, y: 340 - d[1] - 6, "text-anchor": "middle", class: "tc-j-nho" }, d[2]); return e;
    });
    svg(c, "rect", { x: 0, y: 340, width: 600, height: 60, class: "tc-ca-dat" });
    // Lịch và thanh thời gian
    var namT = svg(c, "text", { x: 16, y: 34, class: "tc-j-nam" }, "1995");
    svg(c, "rect", { x: 146, y: 22, width: 200, height: 12, rx: 6, class: "tc-ca-tg" }); var tgD = svg(c, "rect", { x: 146, y: 22, width: 0, height: 12, rx: 6, class: "tc-ca-tg-day" });
    svg(c, "text", { x: 146, y: 52, class: "tc-j-nho" }, t.tg_nhan);
    // Cần gạt tỷ giá
    svg(c, "path", { d: "M412 86 A70 70 0 0 1 548 86", class: "tc-ca-cung" });
    svg(c, "text", { x: 410, y: 104, "text-anchor": "middle", class: "tc-j-nho" }, t.neo); svg(c, "text", { x: 552, y: 104, "text-anchor": "middle", class: "tc-j-nho" }, t.tha_noi);
    var can = svg(c, "g", {}), canTrong = svg(can, "g", {}); svg(canTrong, "rect", { x: -3, y: -58, width: 6, height: 58, rx: 3, class: "tc-ca-can" }); svg(canTrong, "circle", { cx: 0, cy: -58, r: 8, class: "tc-ca-num" });
    svg(c, "circle", { cx: 480, cy: 100, r: 6, class: "tc-ca-num" });
    var gocCan = -50; function datCan(a) { gocCan = a; can.setAttribute("transform", "translate(480,100) rotate(" + a + ")"); } datCan(-50);
    var tayG = svg(c, "g", { visibility: "hidden" }); svg(tayG, "path", { d: "M0 0 q10 -8 22 -2 l14 0 q4 4 0 8 l-14 0 q-12 6 -22 -2 Z", class: "tc-ca-tay" });
    svg(tayG, "text", { x: 18, y: 26, "text-anchor": "middle", class: "tc-j-nho" }, t.nguoi_ban);
    var giamT = svg(c, "text", { x: 480, y: 128, "text-anchor": "middle", class: "tc-j-do", visibility: "hidden" }, t.giam_ngay);
    // Bể dự trữ và ngăn kéo kỳ hạn
    svg(c, "text", { x: 500, y: 152, "text-anchor": "middle", class: "tc-j-nho" }, t.be);
    svg(c, "rect", { x: 456, y: 160, width: 88, height: 120, rx: 6, class: "tc-ca-be" });
    var nuoc = svg(c, "rect", { x: 460, y: 196, width: 80, height: 80, class: "tc-ca-nuoc" });
    var beChu = svg(c, "text", { x: 500, y: 190, "text-anchor": "middle", class: "tc-j-chu", visibility: "hidden" }, "");
    var keo = svg(c, "g", {}); var keoR = svg(keo, "rect", { x: 456, y: 286, width: 88, height: 30, rx: 4, class: "tc-ca-keo" });
    svg(keo, "rect", { x: 492, y: 298, width: 16, height: 5, rx: 2, class: "tc-ca-num" });
    svg(c, "text", { x: 500, y: 348, "text-anchor": "middle", class: "tc-j-nho" }, t.ky_han);
    var keoChu = svg(c, "text", { x: 500, y: 366, "text-anchor": "middle", class: "tc-j-do", visibility: "hidden" }, "");
    var MUC = 3, muc = MUC;
    function veNuoc(m) { var h = 80 * Math.max(0, m) / MUC; nuoc.setAttribute("y", 276 - h); nuoc.setAttribute("height", h); }
    // Tháp ở giữa: g.o ô, 3 cột
    var BW = 48, BH = 32, TX = 226;
    function viTri(k) { return { x: TX + (k % 3) * (BW + 2), y: 340 - (Math.floor(k / 3) + 1) * (BH + 2) }; }
    for (var o_ = 0; o_ < g.o; o_++) { var p0 = viTri(o_); svg(c, "rect", { x: p0.x, y: p0.y, width: BW, height: BH, rx: 3, class: "tc-ca-o" }); }
    svg(c, "text", { x: TX + 74, y: viTri(g.o - 1).y - 10, "text-anchor": "middle", class: "tc-j-nho" }, t.du_an);
    var thapG = svg(c, "g", {}), thap = [];
    function veGach(cha, loai) {
      var e = svg(cha, "g", {}), n = svg(e, "g", {}); e.trong = n; svg(n, "rect", { x: 0, y: 0, width: BW, height: BH, rx: 3, class: loai ? "tc-ca-noi" : "tc-ca-do" });
      svg(n, "text", { x: BW / 2, y: 14, "text-anchor": "middle", class: loai ? "tc-ca-chu-noi" : "tc-ca-chu-do" }, loai ? t.gach_noi_ngan : "$");
      e.he = svg(n, "text", { x: BW / 2, y: 27, "text-anchor": "middle", class: loai ? "tc-ca-chu-noi" : "tc-ca-chu-do" }, loai ? t.nam5 : t.thang3); return e;
    }
    // Hai chồng gạch để kéo
    svg(c, "text", { x: 76, y: 150, "text-anchor": "middle", class: "tc-j-vang" }, t.chong[0]); svg(c, "text", { x: 76, y: 250, "text-anchor": "middle", class: "tc-j-nau" }, t.chong[1]);
    cotChu(c, 76, 222, [t.chong_mo[0]], "tc-j-nho"); var moNoi = svg(c, "text", { x: 76, y: 322, "text-anchor": "middle", class: "tc-j-nho" }, t.chong_mo[1]);
    var chong = [0, 1].map(function (k) {
      var e = svg(c, "g", { class: "tc-keo tc-ca-chong", tabindex: "0", role: "button", "aria-label": t.chong_full[k], "data-i": k });
      var b = veGach(e, k); var o = { i: k, e: e, w: BW, h: BH, nha: { x: 52, y: k ? 262 : 162 } }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); return o;
    });
    var pha = 1, tg = 0, cuu = 0, daHua = 0, keoLan = 0, can_ = false, giay = 0, demNguoc = null;
    function nam() { return tg >= g.thoi_gian ? "1997" : tg >= g.thoi_gian / 2 ? "1996" : "1995"; }
    function themGach(loai) {
      if (thap.length >= g.o) { cap.textContent = t.day_thap; return; }
      var gia = loai ? 2 : 1; if (tg + gia > g.thoi_gian) { cap.textContent = t.het_gio; return; }
      tg += gia; var k = thap.length, p = viTri(k), e = veGach(thapG, loai); jDat(e, p.x, p.y); thap.push({ loai: loai, e: e });
      tgD.setAttribute("width", 200 * tg / g.thoi_gian); namT.textContent = nam(); sang.disabled = false;
      cap.textContent = dien(loai ? t.them_noi : t.them_do, { n: thap.length, o: g.o });
      if (tg >= g.thoi_gian || thap.length >= g.o) cap.textContent += " " + t.het_gio;
    }
    function doiGach() {
      var k = -1; thap.forEach(function (b, j) { if (k < 0 && !b.loai) k = j; });
      if (k < 0) { cap.textContent = t.khong_con_do; return; }
      var p = viTri(k), cu = thap[k]; cu.e.remove(); var e = veGach(thapG, 1); jDat(e, p.x, p.y); thap[k] = { loai: 1, e: e }; cuu--;
      moNoi.textContent = dien(t.con_cuu, { n: cuu }); cap.textContent = dien(t.da_doi, { n: cuu }); if (cuu <= 0) chong[1].e.setAttribute("opacity", ".35");
    }
    jKeo(c, "tc-ca-chong", chong, function (o) { return !(pha === 1 || (pha === 3 && o.i === 1 && cuu > 0)); }, function (o, keo_) {
      var tam = { x: TX + 74, y: 260 };
      if (keo_ && !jGan(o, tam.x, tam.y, 120)) return false;
      if (pha === 1) themGach(o.i); else doiGach();
      o.p = o.nha; o.e.style.transition = ""; jDat(o.e, o.nha.x, o.nha.y);
    });
    // Màn 2: gió nổi, ba lần bị kéo cần
    function keoCan() {
      keoLan++; tayG.setAttribute("visibility", "visible"); jDat(tayG, 430, 52); datCan(-50 + 8 * keoLan); canTrong.classList.add("tc-ca-rung");
      cap.textContent = dien(t.bi_keo, { n: keoLan, t: g.keo }); [bom, hua, truot].forEach(function (b) { b.hidden = false; b.disabled = false; });
      bom.disabled = muc <= 0; bom.focus({ preventScroll: true });
    }
    function traLoi(cach) {
      [bom, hua, truot].forEach(function (b) { b.disabled = true; }); canTrong.classList.remove("tc-ca-rung");
      if (cach === "bom") { muc--; veNuoc(muc); datCan(-50 + 4 * (keoLan - 1)); cap.textContent = muc > 0 ? t.da_bom : t.can; if (muc <= 0) can_ = true; }
      if (cach === "hua") { daHua++; keo.classList.add("tc-ca-phong"); keoR.setAttribute("height", 30 + 6 * daHua); datCan(-50 + 4 * (keoLan - 1)); cap.textContent = t.da_hua; }
      if (cach === "truot") { datCan(-50 + 14 * keoLan); cap.textContent = t.da_truot; }
      if (keoLan < g.keo && !can_) jHen(s, keoCan, 900);
      else jHen(s, function () { [bom, hua, truot].forEach(function (b) { b.hidden = true; }); bung.hidden = false; bung.focus({ preventScroll: true }); if (!can_) cap.textContent = t.truoc_bung; }, 700);
    }
    bom.onclick = function () { traLoi("bom"); }; hua.onclick = function () { traLoi("hua"); }; truot.onclick = function () { traLoi("truot"); };
    sang.onclick = function () {
      pha = 2; sang.hidden = true; tg = g.thoi_gian; tgD.setAttribute("width", 200); namT.textContent = "1997"; chong.forEach(function (o) { o.e.setAttribute("opacity", ".35"); });
      cap.textContent = t.gio_noi; jHen(s, keoCan, 700);
    };
    // Màn 3: 2/7/1997
    bung.onclick = function () {
      pha = 3; bung.hidden = true; namT.textContent = t.ngay_bung; datCan(55); tayG.setAttribute("visibility", "hidden"); giamT.setAttribute("visibility", "visible");
      keo.classList.remove("tc-ca-phong"); keo.classList.add("tc-ca-mo"); keoChu.setAttribute("visibility", "visible");
      if (daHua) { keoChu.textContent = t.cam_ket; muc = Math.min(muc, 0.25); veNuoc(muc); beChu.textContent = t.rong; beChu.setAttribute("visibility", "visible"); }
      else keoChu.textContent = t.keo_trong;
      thap.forEach(function (b) { if (!b.loai) { b.e.he.textContent = "×2"; b.e.trong.classList.add("tc-ca-nang"); } });
      cap.textContent = t.x2;
      jHen(s, function () {
        thap.forEach(function (b) { if (!b.loai) b.e.he.textContent = "×5"; });
        cuu = g.cuu; moNoi.textContent = dien(t.con_cuu, { n: cuu }); chong[1].e.setAttribute("opacity", "1");
        giay = g.giay; cap.textContent = dien(t.x5, { s: giay }); rut.hidden = chot.hidden = false; chot.focus({ preventScroll: true });
        demNguoc = setInterval(function () { if (!s.isConnected || s._dung || pha !== 3) { clearInterval(demNguoc); return; } giay--; namT.textContent = giay + "s"; if (giay <= 0) { clearInterval(demNguoc); xem(); } }, 1000);
        namT.textContent = giay + "s";
      }, 1600);
    };
    rut.onclick = function () {
      if (!thap.length) return; var n = thap.length % 3 || 3; thap.splice(thap.length - n, n).forEach(function (b) { b.e.remove(); });
      cap.textContent = dien(t.da_rut, { n: thap.length });
    };
    chot.onclick = function () { xem(); };
    function xem() {
      if (pha !== 3) return; pha = 4; clearInterval(demNguoc); rut.hidden = chot.hidden = true; namT.textContent = t.ngay_bung;
      var tong = thap.length, vang = thap.filter(function (b) { return !b.loai; }).length, pt = tong ? Math.round(100 * vang / tong) : 0;
      var dung = tong > 0 && pt <= g.nguong && !daHua && !can_;
      if (!dung) {
        thap.forEach(function (b, k) {
          var p = viTri(k), dx = (k % 3 - 1) * 44 + (k * 13 % 7) * 6, dy = 306 - p.y + (k % 2) * 8, r = (k % 2 ? 1 : -1) * 50;
          jChay(s, 1100 + k * 40, function (f) { var ff = f * f; jDat(b.e, p.x + dx * ff, p.y + dy * ff, " rotate(" + (r * ff) + " " + BW / 2 + " " + BH / 2 + ")"); b.e.setAttribute("opacity", 1 - 0.45 * ff); });
        });
      }
      var lan = svg(c, "circle", { cx: TX + 74, cy: 320, r: 10, class: "tc-ca-song" });
      jChay(s, 1400, function (f) { lan.setAttribute("r", 10 + 420 * f); lan.setAttribute("opacity", 1 - f); }, function () { lan.remove(); });
      xom.forEach(function (e, k) { jHen(s, function () { e.classList.add(dung ? "tc-ca-rung-nhe" : "tc-ca-rung"); if (!dung) e.classList.add("tc-ca-xom-do"); }, 300 + 250 * k); });
      cap.textContent = dung ? t.cap_dung : t.cap_do;
      var ly = can_ ? t.ly_can : daHua ? t.ly_hua : "";
      jKet(ket, [dien(dung ? t.ket_dung : t.ket_do, { p: pt, n: tong }) + (ly ? " " + ly : ""), t.that_nhan, t.that, t.ket_bai]); lai.hidden = false;
    }
    lai.onclick = function () { jLai(s, thapVayNgan, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: vá đê trước khi bão tới (5 lỗ hổng từ diễn tập Pam, 7 viên gạch có 2 viên mồi, kinh phí 3 viên, rồi cho bão vào) ----------
  // g.ngan_sach, g.them: số viên; g.moc_ngap: mốc thật (%); g.moi_lo: % ngập mỗi lỗ hở (minh họa). t.lo: [{ngan, full}]; t.gach: [{chu:[2 dòng], full, lo (−1 = mồi), tan}]
  function vaDe(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 440", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), them = nut(t.nut_them, false), bao = nut(t.nut_bao, true), lai = nut(t.nut_lai, false); them.hidden = lai.hidden = true;
    [them, bao, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    for (var i = 0; i < 18; i++) svg(c, "circle", { cx: (i * 151 + 31) % 600, cy: 8 + (i * 43) % 80, r: i % 4 ? 0.8 : 1.3, class: "tc-j-sao" });
    // Hồ, đê, thành phố
    var MAT0 = 200, ho = svg(c, "rect", { x: 0, y: MAT0, width: 270, height: 100, class: "tc-ka-ho" });
    var song = svg(c, "path", { d: "", class: "tc-ka-song" });
    function veSong(y) { var d = "M0 " + y; for (var x = 0; x < 270; x += 30) d += " q7.5 -5 15 0 t15 0"; song.setAttribute("d", d); ho.setAttribute("y", y); ho.setAttribute("height", 300 - y); }
    veSong(MAT0);
    svg(c, "rect", { x: 0, y: 300, width: 600, height: 140, class: "tc-ka-dat" });
    var nha = [[318, 40, 34], [362, 28, 50], [400, 44, 30], [452, 30, 44], [492, 36, 26], [536, 26, 40]];
    nha.forEach(function (n) { svg(c, "rect", { x: n[0], y: 300 - n[2], width: n[1], height: n[2], class: "tc-ka-nha" }); for (var w = 0; w < Math.floor(n[2] / 14); w++) svg(c, "rect", { x: n[0] + 6, y: 300 - n[2] + 6 + w * 14, width: n[1] - 12, height: 4, class: "tc-ka-cua" }); });
    var ngap = svg(c, "rect", { x: 300, y: 300, width: 262, height: 0, class: "tc-ka-ngap" });
    var WX = 270, WW = 30, CY0 = 100, CH = 40;
    svg(c, "rect", { x: WX, y: CY0 - 6, width: WW, height: 206, rx: 3, class: "tc-ka-de" });
    var lo = t.lo.map(function (d, k) {
      var y = CY0 + k * CH, e = svg(c, "g", { class: "tc-ka-lo", tabindex: "0", role: "button", "aria-label": d.full });
      svg(e, "rect", { x: WX + 2, y: y + 2, width: WW - 4, height: CH - 6, rx: 2, class: "tc-ka-o" });
      var h = svg(e, "rect", { x: WX + 8, y: y + 10, width: WW - 16, height: CH - 22, rx: 4, class: "tc-ka-hong" });
      var vt = svg(e, "rect", { x: WX + 2, y: y + 2, width: WW - 4, height: CH - 6, rx: 2, class: "tc-ka-va", visibility: "hidden" });
      svg(c, "text", { x: WX - 8, y: y + CH / 2 + 2, "text-anchor": "end", class: "tc-ka-nhan" }, d.ngan);
      var tia = svg(c, "path", { d: "M" + (WX + WW) + " " + (y + CH / 2) + " q40 4 60 " + (300 - y - CH / 2 - 4), class: "tc-ka-tia", visibility: "hidden" });
      e.addEventListener("click", function () { chamLo(k); });
      e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chamLo(k); } });
      return { e: e, h: h, va: vt, tia: tia, y: y, xong: false };
    });
    // Xoáy bão, lịch, kinh phí, thanh đo
    var bG = svg(c, "g", { transform: "translate(60,62)" }), xoayG = svg(bG, "g", { class: "tc-ka-xoay" });
    [0, 120, 240].forEach(function (a) { svg(xoayG, "path", { d: "M0 0 q26 -6 34 18", class: "tc-ka-bao", transform: "rotate(" + a + ")" }); });
    svg(bG, "circle", { r: 7, class: "tc-ka-mat" });
    var baoT = svg(c, "text", { x: 8, y: 20, class: "tc-j-cam", visibility: "hidden" }, "");
    var lichT = svg(c, "text", { x: 554, y: 32, "text-anchor": "end", class: "tc-j-nam" }, t.lich[0]);
    svg(c, "text", { x: 400, y: 56, "text-anchor": "end", class: "tc-j-nho" }, t.kinh_phi); var tienO = [];
    for (var m = 0; m < g.ngan_sach + g.them; m++) tienO.push(svg(c, "circle", { cx: 412 + m * 20, cy: 52, r: 7, class: "tc-ka-tien", visibility: m < g.ngan_sach ? "visible" : "hidden" }));
    svg(c, "rect", { x: 574, y: 90, width: 16, height: 206, rx: 4, class: "tc-ka-do" }); var doD = svg(c, "rect", { x: 574, y: 296, width: 16, height: 0, rx: 4, class: "tc-ka-do-day" });
    var Ymoc = 296 - 206 * g.moc_ngap / 100; svg(c, "line", { x1: 566, x2: 594, y1: Ymoc, y2: Ymoc, class: "tc-ka-moc" });
    svg(c, "text", { x: 566, y: Ymoc - 6, "text-anchor": "end", class: "tc-j-cam" }, t.moc); svg(c, "text", { x: 590, y: 84, "text-anchor": "end", class: "tc-j-nho" }, t.do_nhan);
    // Bãi gạch
    var gach = t.gach.map(function (d, k) {
      var e = jThe(c, "tc-ka-gach", k, 186, 36, d.chu, d.full, "tc-ka-vien"), o = { i: k, d: d, e: e, w: 186, h: 36 };
      return o;
    });
    tron(gach.map(function (o) { return o.i; })).forEach(function (i_, k) { var o = gach[i_]; o.nha = { x: 6 + (k % 3) * 197, y: 314 + Math.floor(k / 3) * 42 }; o.p = o.nha; jDat(o.e, o.nha.x, o.nha.y); });
    var tien = g.ngan_sach, daThem = false, buoc = 0, xongBao = false;
    function veTien() { tienO.forEach(function (o, k) { o.setAttribute("class", k < tien ? "tc-ka-tien" : "tc-ka-tien tc-ka-tien-het"); }); }
    function hetTien() { if (tien > 0) return; cap.textContent += " " + (daThem ? t.het_han : t.het_tien); if (!daThem) them.hidden = false; gach.forEach(function (o) { if (!o.xong) o.e.setAttribute("opacity", ".4"); }); }
    function tieu() { tien--; veTien(); if (buoc === 0) { buoc = 1; lichT.textContent = t.lich[1]; } }
    // Chạm hoặc Enter không tự đặt gạch: chọn viên gạch trước, rồi chạm (Enter) vào lỗ muốn vá; chạm chỗ khác để bỏ chọn
    var chon = null, chonLuc = 0;
    function boChon() { if (chon) chon.e.classList.remove("tc-ka-chon"); chon = null; }
    function datVao(o, k) {
      boChon();
      if (o.d.lo < 0) { tieu(); o.xong = true; o.e.classList.remove("tc-keo"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true"); o.e.classList.add("tc-ka-tan"); jMuot(o.e, 600); o.e.style.opacity = "0"; cap.textContent = o.d.tan; hetTien(); return true; }
      if (k !== o.d.lo || lo[k].xong) { cap.textContent = dien(t.sai_lo, { l: t.lo[k].ngan }); return false; }
      tieu(); o.xong = true; lo[k].xong = true; o.e.classList.remove("tc-keo"); o.e.removeAttribute("tabindex"); o.e.setAttribute("aria-hidden", "true");
      jMuot(o.e, 350); jDat(o.e, WX + 15 - 93 * 0.16, lo[k].y + 4, " scale(.16)"); o.e.style.opacity = "0";
      lo[k].h.setAttribute("visibility", "hidden"); lo[k].va.setAttribute("visibility", "visible"); cap.textContent = dien(t.da_va, { l: t.lo[k].ngan });
      hetTien(); return true;
    }
    function chamLo(k) {
      if (!chon || xongBao || tien <= 0) { boChon(); cap.textContent = t.lo[k].full; return; }
      var o = chon; if (datVao(o, k) === false) jVe(o);
    }
    jKeo(c, "tc-ka-gach", gach, function () { return tien <= 0 || xongBao; }, function (o, keo) {
      if (!keo) {
        var cu = chon; boChon();
        if (cu !== o) { chon = o; chonLuc = performance.now(); o.e.classList.add("tc-ka-chon"); cap.textContent = dien(t.da_chon, { g: o.d.full }); }
        else cap.textContent = t.bo_chon;
        return false;
      }
      boChon();
      var tam = o.p.y + 18; if (Math.abs(o.p.x + 93 - (WX + 15)) > 140 || tam < CY0 - 30 || tam > CY0 + 5 * CH + 30) return false;
      return datVao(o, Math.max(0, Math.min(4, Math.floor((tam - CY0) / CH))));
    });
    c.addEventListener("click", function (ev) {
      if (!chon || performance.now() - chonLuc < 400 || (ev.target.closest && ev.target.closest("g.tc-ka-gach, g.tc-ka-lo"))) return;
      boChon(); cap.textContent = t.bo_chon;
    });
    them.onclick = function () { daThem = true; them.hidden = true; tien += g.them; tienO.forEach(function (o) { o.setAttribute("visibility", "visible"); }); veTien(); buoc = 2; lichT.textContent = t.lich[2]; cap.textContent = t.da_them; gach.forEach(function (o) { if (!o.xong) o.e.setAttribute("opacity", "1"); }); };
    bao.onclick = function () {
      xongBao = true; bao.hidden = them.hidden = true; gach.forEach(function (o) { if (!o.xong) o.e.setAttribute("opacity", ".4"); });
      var hoMo = lo.filter(function (l) { return !l.xong; }).length, pt = hoMo * g.moi_lo;
      lichT.textContent = t.lich[3]; cap.textContent = t.b27; baoT.setAttribute("visibility", "visible"); baoT.textContent = t.cap5;
      jChay(s, 1300, function (f) { bG.setAttribute("transform", "translate(" + (60 + 155 * f) + "," + (62 - 4 * f) + ") scale(" + (1 + 0.3 * f) + ")"); });
      jHen(s, function () {
        lichT.textContent = t.lich[4]; cap.textContent = t.b28;
        jHen(s, function () {
          lichT.textContent = t.lich[5]; baoT.textContent = t.cap3; cap.textContent = t.b29;
          lo.forEach(function (l) { if (!l.xong) { l.tia.setAttribute("visibility", "visible"); l.h.classList.add("tc-ka-hong-vo"); } });
          jChay(s, 2200, function (f) {
            veSong(MAT0 - 90 * Math.min(1, f * 1.6)); var h = 70 * pt / 100 * f; ngap.setAttribute("y", 300 - h); ngap.setAttribute("height", h);
            doD.setAttribute("y", 296 - 206 * pt / 100 * f); doD.setAttribute("height", 206 * pt / 100 * f);
          }, function () {
            cap.textContent = dien(hoMo ? t.cap_ngap : t.cap_giu, { p: pt });
            jKet(ket, [hoMo ? dien(t.ket_ho, { n: hoMo, p: pt }) : t.ket_kin, t.that_nhan, t.that, t.ket_bai]); lai.hidden = false;
          });
        }, 1300);
      }, 1400);
    };
    lai.onclick = function () { jLai(s, vaDe, g, t); };
    veTien();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 3 J KẾT THÚC ====
  // ==== ĐỢT 4 K BẮT ĐẦU ====
  // Ba cảnh Bài báo đổi cách ta học: duong-cong-on (Ebbinghaus 1885), gom-cum (Miller 1956, Cowan 2001), hai-duong-nho (Scoville và Milner 1957).
  // Mỗi cảnh gồm vài "màn" nối nhau trên sân khấu tối cố định (tc-canh-toi), nên màu trong SVG giống nhau ở chế độ sáng và tối.
  // Dùng lại jChay, jKeo, jThe, jKet, jLai, jDat, jMuot, jVe của đợt 3 J. Chạm hoặc Enter trên một vật = đặt nó vào chỗ kế tiếp.
  function kHen(s, fn, ms) { return setTimeout(function () { if (s.isConnected && !s._dung) fn(); }, ms); }
  // Khung nhiều màn: man = [{h, lam(c, k)}]; k.nut(chữ, fn) hiện nút chính; k.an() ẩn nó; k.xong() mở màn kế hoặc hiện kết.
  function kBo(g, t, lam, man) {
    var s = khung(g, t), san = canh("tc-canh-toi");
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), chinh = nut("", true), lai = nut(t.nut_lai, false); chinh.hidden = true; hang.appendChild(chinh); hang.appendChild(lai);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var i = -1, k = { s: s, cap: cap, ket: ket };
    k.nut = function (chu, fn) { chinh.textContent = chu; chinh.hidden = false; chinh.disabled = false; chinh.onclick = function () { chinh.disabled = true; chinh.hidden = true; fn(); }; };
    k.an = function () { chinh.hidden = true; chinh.onclick = null; };
    k.xong = function () {
      if (s._dung) return;
      if (i < man.length - 1) { k.nut(t.nut_tiep, tiep); return; }
      chinh.hidden = true;
      var p = tao("p", ""), a = tao("a", "tc-k4-doc", t.doc_tiep[0]); a.href = t.doc_tiep[1]; p.appendChild(a);
      jKet(ket, t.ket.concat([p]));
    };
    function tiep() {
      i++; san.innerHTML = ""; ket.hidden = true;
      var c = svg(san, "svg", { viewBox: "0 0 600 " + man[i].h, role: "img", "aria-label": t.mo_ta + " " + t.man[i] });
      svg(c, "text", { x: 16, y: 26, class: "tc-k4-man" }, t.man[i]);
      man.forEach(function (_, j) { svg(c, "circle", { cx: 584 - (man.length - 1 - j) * 16, cy: 21, r: 5, class: j === i ? "tc-k4-buoc tc-k4-nay" : j < i ? "tc-k4-buoc tc-k4-qua" : "tc-k4-buoc" }); });
      k.c = c; chinh.hidden = true;
      if (t.cap_man && t.cap_man[i]) cap.textContent = t.cap_man[i];
      man[i].lam(c, k);
    }
    lai.onclick = function () { jLai(s, lam, g, t); };
    tiep();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // Xếp vật vào chỗ: vat = [{dong, aria, v, nha}], cho = [{x, y}]; đổi chỗ nếu chỗ đã có vật; doi(cho) sau mỗi lần đổi
  function kXep(c, lop, vat, cho, w, h, nen, khoa, doi, xa) {
    var dang = cho.map(function () { return null; });
    var ds = vat.map(function (v, i) {
      var e = jThe(c, lop, i, w, h, v.dong, v.aria, nen), o = { e: e, w: w, h: h, nha: v.nha, p: v.nha, v: v.v, o: null };
      jDat(e, o.nha.x, o.nha.y); return o;
    });
    function bo(o) { if (o.o != null) { dang[o.o] = null; o.o = null; } }
    function vao(o, j) {
      var cu = dang[j]; bo(o);
      if (cu && cu !== o) { cu.o = null; jVe(cu); }
      dang[j] = o; o.o = j; o.p = { x: cho[j].x, y: cho[j].y }; jMuot(o.e, 250); jDat(o.e, o.p.x, o.p.y); doi(dang);
    }
    jKeo(c, lop, ds, khoa, function (o, keo) {
      if (!keo) { if (o.o != null) { bo(o); doi(dang); return false; } var j = dang.indexOf(null); if (j < 0) return false; vao(o, j); return; }
      var cx = o.p.x + w / 2, cy = o.p.y + h / 2, gan = -1, kc = 1e9;
      cho.forEach(function (q, j) { var d = Math.hypot(q.x + w / 2 - cx, q.y + h / 2 - cy); if (d < kc) { kc = d; gan = j; } });
      if (kc < (xa || Math.max(w, h) * 0.9)) { vao(o, gan); return; }
      bo(o); doi(dang); return false;
    });
    return { ds: ds, dang: dang };
  }
  // Ô chạm được (bàn phím: Enter/Space)
  function kCham(e, fn) {
    e.setAttribute("tabindex", "0"); e.setAttribute("role", "button"); e.classList.add("tc-cham-duoc", "tc-k4-cham");
    e.addEventListener("click", fn); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); } });
  }

  // ---------- Cảnh: đường cong quên (vẽ 7 mốc thật, đặt thẻ lời đồn, dồn hay trải, đặt lịch ôn) ----------
  // g.moc: % công học lại được tiết kiệm ở 7 mốc; g.don, g.trai: số lần đọc dồn 1 ngày / trải 3 ngày; g.chia: chia minh họa cho 3 ngày; g.on_mac: thời điểm ôn khi chạm
  // t.moc: nhãn 7 mốc; t.the: 2 dòng thẻ lời đồn; t.o: 3 ô; t.dap: lời đáp cho từng ô; t.ngay: 3 nhãn ngày; t.ket: các dòng kết
  function duongCongOn(g, t) {
    return kBo(g, t, duongCongOn, [
      { h: 410, lam: function (c, k) {
        var n = g.moc.length, X0 = 84, X1 = 560, YD = 226;
        function px(i) { return X0 + i * (X1 - X0) / (n - 1); }
        function py(v) { return YD - v * (YD - 58) / 60; }
        [0, 30, 60].forEach(function (v) { svg(c, "line", { x1: X0 - 14, x2: X1 + 14, y1: py(v), y2: py(v), class: "tc-k4-luoi" }); svg(c, "text", { x: X0 - 20, y: py(v) + 4, "text-anchor": "end", class: "tc-j-nho" }, v + "%"); });
        t.moc.forEach(function (l, i) { svg(c, "text", { x: px(i), y: YD + 20, "text-anchor": "middle", class: "tc-j-nho" }, l); });
        svg(c, "text", { x: 300, y: YD + 42, "text-anchor": "middle", class: "tc-ebb-chu-y" }, t.chu_y);
        svg(c, "text", { x: 584, y: 50, "text-anchor": "end", class: "tc-j-nho" }, t.truc_y);
        var duong = svg(c, "polyline", { points: "", class: "tc-ebb-duong" });
        var cham = g.moc.map(function (v, i) {
          var e = svg(c, "g", { visibility: "hidden" }); svg(e, "circle", { cx: px(i), cy: py(v), r: 6, class: "tc-ebb-cham" });
          svg(e, "text", { x: px(i), y: py(v) - 12, "text-anchor": "middle", class: "tc-ebb-so" }, so(v, 1)); return e;
        });
        var vong = svg(c, "circle", { cx: px(3), cy: py(g.moc[3]), r: 15, class: "tc-ebb-vong", visibility: "hidden" });
        // ba ô và thẻ lời đồn
        var oX = [204, 336, 468], o = t.o.map(function (chu, j) {
          var e = svg(c, "g", { class: "tc-ebb-ogr", "aria-label": chu, opacity: "0.35" });
          var r = svg(e, "rect", { x: oX[j], y: 292, width: 124, height: 104, rx: 12, class: "tc-ebb-o" });
          svg(e, "text", { x: oX[j] + 62, y: 384, "text-anchor": "middle", class: "tc-j-chu" }, chu); e.r = r; return e;
        });
        var the = { e: jThe(c, "tc-ebb-the", 0, 124, 64, t.the, t.the.join(" "), "tc-ebb-the-nen"), w: 124, h: 64, nha: { x: 30, y: 312 } };
        the.p = the.nha; jDat(the.e, 30, 312); the.e.setAttribute("visibility", "hidden");
        var mo = false, da = false;
        function tra(j) {
          if (da) return; da = true; the.xong = true;
          o.forEach(function (e, m) { e.r.classList.toggle("tc-ebb-o-dung", m === g.dung); e.r.classList.toggle("tc-ebb-o-sai", m === j && j !== g.dung); });
          jMuot(the.e, 300); the.p = { x: oX[g.dung], y: 300 }; jDat(the.e, the.p.x, the.p.y);
          vong.setAttribute("visibility", "visible"); k.cap.textContent = t.dap[j]; k.xong();
        }
        o.forEach(function (e, j) { kCham(e, function () { if (mo) tra(j); }); });
        jKeo(c, "tc-ebb-the", [the], function () { return !mo; }, function (q, keo) {
          if (!keo) { k.cap.textContent = t.goi_y; return false; }
          var cx = q.p.x + 62, cy = q.p.y + 32, j = -1;
          oX.forEach(function (x, m) { if (cx > x - 10 && cx < x + 134 && cy > 270) j = m; });
          if (j < 0) return false; tra(j);
        });
        k.nut(t.nut_ve, function () {
          jChay(k.s, 2600, function (f) {
            var m = f * (n - 1), pts = [];
            for (var i = 0; i < n; i++) {
              if (i <= m) pts.push(px(i) + "," + py(g.moc[i]));
              else { var r = m - (i - 1); pts.push((px(i - 1) + (px(i) - px(i - 1)) * r) + "," + (py(g.moc[i - 1]) + (py(g.moc[i]) - py(g.moc[i - 1])) * r)); break; }
            }
            duong.setAttribute("points", pts.join(" "));
            cham.forEach(function (e, i) { e.setAttribute("visibility", i <= m + 1e-6 ? "visible" : "hidden"); });
          }, function () {
            mo = true; the.e.setAttribute("visibility", "visible"); o.forEach(function (e) { e.setAttribute("opacity", "1"); });
            k.cap.textContent = t.cap_the;
          });
        });
      } },
      { h: 400, lam: function (c, k) {
        var B = 330, D = 3;
        function cot(x, nhan) { cotChu(c, x + 35, B + 22, nhan, "tc-j-chu", 17); }
        for (var i = 0; i < g.don; i++) svg(c, "rect", { x: 70, y: B - (i + 1) * D, width: 70, height: 2, class: "tc-ebb-doc" });
        svg(c, "text", { x: 105, y: B - g.don * D - 10, "text-anchor": "middle", class: "tc-ebb-dem" }, String(g.don));
        cot(70, t.don);
        var dem = svg(c, "text", { x: 255, y: B - 10, "text-anchor": "middle", class: "tc-ebb-dem" }, "0"), lop = svg(c, "g", {});
        cot(220, t.trai);
        svg(c, "line", { x1: 50, x2: 310, y1: B, y2: B, class: "tc-k4-luoi" });
        var cho = [0, 1, 2].map(function (d) {
          var y = 52 + d * 66; svg(c, "rect", { x: 368, y: y, width: 212, height: 58, rx: 10, class: "tc-k4-o-trong" });
          svg(c, "text", { x: 382, y: y + 34, class: "tc-j-chu" }, t.ngay[d]); return { x: 504, y: y + 6 };
        });
        svg(c, "text", { x: 474, y: 278, "text-anchor": "middle", class: "tc-j-nho" }, t.khay);
        var tong = 0, xong = false, vat = [0, 1, 2].map(function (j) { return { dong: t.buoi, aria: t.buoi.join(" "), v: j, nha: { x: 380 + j * 68, y: 296 } }; });
        var daTo = [false, false, false];
        kXep(c, "tc-ebb-buoi", vat, cho, 62, 46, "tc-ebb-the-nen", function (o) { return o.o != null; }, function (dang) {
          dang.forEach(function (o, d) {
            if (!o || daTo[d]) return; daTo[d] = true; o.xong = true;
            var tu = tong; tong += g.chia[d];
            for (var r = tu; r < tong; r++) { var e = svg(lop, "rect", { x: 220, y: B - (r + 1) * D, width: 70, height: 2, class: "tc-ebb-ngay" + d }); if (!giam) { e.style.opacity = 0; e.style.transition = "opacity .3s " + ((r - tu) * 40) + "ms"; e.getBoundingClientRect(); e.style.opacity = 1; } }
            dem.textContent = String(tong); dem.setAttribute("y", B - tong * D - 10);
          });
          k.cap.textContent = dien(t.cap_dem, { n: tong });
          if (!xong && daTo.every(Boolean)) {
            xong = true; dem.textContent = String(g.trai);
            svg(c, "line", { x1: 60, x2: 300, y1: B - g.don * D - 30, y2: B - g.don * D - 30, class: "tc-ebb-ngoac" });
            svg(c, "text", { x: 180, y: B - g.don * D - 38, "text-anchor": "middle", class: "tc-ebb-chu-y" }, t.cung);
            k.cap.textContent = t.cap_trai; k.xong();
          }
        }, 120);
      } },
      { h: 340, lam: function (c, k) {
        var X0 = 60, X1 = 560, YD = 270, YT = 80, T = 30;
        function px(x) { return X0 + x / T * (X1 - X0); }
        function py(r) { return YD - r * (YD - YT); }
        svg(c, "text", { x: 16, y: 50, class: "tc-ebb-chu-y", "text-anchor": "start" }, t.minh_hoa);
        svg(c, "line", { x1: X0, x2: X1, y1: YD, y2: YD, class: "tc-k4-truc" }); svg(c, "line", { x1: X0, x2: X0, y1: YT - 10, y2: YD, class: "tc-k4-truc" });
        svg(c, "text", { x: X1, y: YD + 22, "text-anchor": "end", class: "tc-j-nho" }, t.truc_tg);
        svg(c, "text", { x: X0, y: YD + 22, "text-anchor": "middle", class: "tc-j-nho" }, t.hoc);
        svg(c, "text", { x: X0 + 8, y: YT - 14, class: "tc-j-nho" }, t.truc_nho);
        function duongDi(on) {
          var ds = on.slice().sort(function (a, b) { return a - b; }), S = 2.2, last = 0, pts = [];
          function r(x) { return 0.18 + 0.82 * Math.exp(-(x - last) / S); }
          for (var x = 0; x <= T + 1e-9; x += 0.25) {
            while (ds.length && ds[0] <= x) { var tr = ds.shift(); pts.push([tr, r(tr)]); last = tr; S *= 2.4; pts.push([tr, 1]); }
            pts.push([x, r(x)]);
          }
          return "M" + pts.map(function (q) { return px(q[0]).toFixed(1) + " " + py(q[1]).toFixed(1); }).join(" L");
        }
        svg(c, "path", { d: duongDi([]), class: "tc-ebb-nen-dut" });
        var duong = svg(c, "path", { d: duongDi([]), class: "tc-ebb-duong" });
        svg(c, "text", { x: 466, y: 45, "text-anchor": "end", class: "tc-j-nho" }, t.keo_on);
        var dat = 0, ds = [0, 1, 2].map(function (i) {
          var e = svg(c, "g", { class: "tc-keo tc-ebb-on", tabindex: "0", role: "button", "aria-label": t.cham_on, "data-i": i });
          svg(e, "circle", { cx: 0, cy: 0, r: 22, style: "fill:transparent" }); svg(e, "circle", { cx: 0, cy: 0, r: 12, class: "tc-ebb-on-cham" });
          svg(e, "text", { x: 0, y: 4, "text-anchor": "middle", class: "tc-ebb-on-chu" }, t.on);
          var o = { e: e, w: 0, h: 0, nha: { x: 480 + i * 34, y: 40 }, t: null }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); return o;
        });
        function ve() {
          var on = ds.filter(function (o) { return o.t != null; }).map(function (o) { return o.t; });
          duong.setAttribute("d", duongDi(on)); dat = on.length;
          k.cap.textContent = dat < 3 ? dien(t.cap_on, { n: dat }) : t.cap_on_du;
          if (dat === 3 && !k.daXong) { k.daXong = true; k.xong(); }
        }
        jKeo(c, "tc-ebb-on", ds, function () { return false; }, function (o, keo) {
          if (!keo) {
            if (o.t != null) return true;
            var dung = ds.map(function (x) { return x.t; }), tg = g.on_mac.filter(function (x) { return dung.indexOf(x) < 0; })[0];
            o.t = tg; o.p = { x: px(tg), y: YD }; jMuot(o.e, 250); jDat(o.e, o.p.x, o.p.y); ve(); return;
          }
          if (o.p.x < X0 + 6 || o.p.x > X1 || o.p.y < YT - 30 || o.p.y > YD + 40) { o.t = null; ve(); return false; }
          o.t = Math.max(0.5, Math.min(T - 0.5, (o.p.x - X0) / (X1 - X0) * T)); o.p = { x: px(o.t), y: YD }; jMuot(o.e, 200); jDat(o.e, o.p.x, o.p.y); ve();
        });
      } }
    ]);
  }

  // ---------- Cảnh: gom cụm (nhìn 12 chữ số rồi xếp lại, gom vòng cụm, bật chặn nhẩm lặp, đổi số nhị phân) ----------
  // g.so: 12 chữ số; g.giay: thời gian xem; g.miller, g.cowan: [thấp, cao, giữa]; g.nhi_phan: 4 nhóm 3 chữ số; g.ra: 4 số đổi ra
  function gomCum(g, t) {
    var N = g.so.length, W = 42, HO = 52, X0 = 15, B = 48;
    function ox(i) { return X0 + i * B; }
    function hangO(c, y, up) {
      return g.so.split("").map(function (d, i) {
        var e = svg(c, "g", {}); var r = svg(e, "rect", { x: ox(i), y: y, width: W, height: HO, rx: 7, class: up ? "tc-mil-up" : "tc-mil-o-nen" });
        var ch = svg(e, "text", { x: ox(i) + W / 2, y: y + 35, "text-anchor": "middle", class: up ? "tc-mil-hoi" : "tc-mil-so" }, up ? "?" : d);
        e.lat = function (u) { r.setAttribute("class", u ? "tc-mil-up" : "tc-mil-o-nen"); ch.setAttribute("class", u ? "tc-mil-hoi" : "tc-mil-so"); ch.textContent = u ? "?" : d; };
        e.r = r; return e;
      });
    }
    function demDung(dang, dai) { var d = 0; dang.forEach(function (o, j) { if (!o) return; for (var m = 0; m < dai; m++) if (String(o.v).charAt(m) === g.so.charAt(j * dai + m)) d++; }); return d; }
    return kBo(g, t, gomCum, [
      { h: 300, lam: function (c, k) {
        var o = hangO(c, 64, true), dh = svg(c, "text", { x: 300, y: 160, "text-anchor": "middle", class: "tc-mil-dem" }, "");
        var khoa = true, nut2 = false;
        k.nut(t.nut_xem, function () {
          o.forEach(function (e) { e.lat(false); }); var con = g.giay; dh.textContent = dien(t.giay, { s: con });
          (function dem() { kHen(k.s, function () { con--; if (con > 0) { dh.textContent = dien(t.giay, { s: con }); dem(); } else up(); }, 1000); })();
        });
        function up() {
          o.forEach(function (e) { e.lat(true); }); dh.textContent = ""; khoa = false; k.cap.textContent = t.cap_xep;
          svg(c, "text", { x: 300, y: 196, "text-anchor": "middle", class: "tc-j-nho" }, t.khay_so);
          var vat = tron(g.so.split("")).map(function (d, i) { return { dong: [d], aria: d, v: d, nha: { x: ox(i), y: 210 } }; });
          var X = kXep(c, "tc-mil-the", vat, g.so.split("").map(function (_, i) { return { x: ox(i), y: 64 }; }), W, HO, "tc-mil-the-nen", function () { return khoa; }, function (dang) {
            var du = dang.every(Boolean);
            if (du && !nut2) { nut2 = true; k.nut(t.nut_lat, function () {
              khoa = true; var d = 0;
              dang.forEach(function (q, j) { var ok = q.v === g.so.charAt(j); if (ok) d++; q.e.querySelector("rect").setAttribute("class", "tc-mil-the-nen " + (ok ? "tc-mil-dung" : "tc-mil-sai"));
                if (!ok) svg(c, "text", { x: ox(j) + W / 2, y: 56, "text-anchor": "middle", class: "tc-mil-sua" }, g.so.charAt(j)); });
              k.d1 = d; k.cap.textContent = dien(t.cap_1, { d: d, n: N }); k.xong();
            }); }
            else if (!du && nut2) { nut2 = false; k.an(); }
          });
          k.X = X;
        }
      } },
      { h: 330, lam: function (c, k) {
        var o = hangO(c, 84, false), ve = 0, khoaThe = true, daGom = [false, false, false], nhan = [];
        var vong = [0, 1, 2].map(function (i) {
          var e = svg(c, "g", { class: "tc-keo tc-mil-vg", tabindex: "0", role: "button", "aria-label": t.vong, "data-i": i });
          svg(e, "rect", { x: 0, y: 0, width: 4 * B - 6 + 6, height: 70, rx: 18, class: "tc-mil-vong" });
          svg(e, "text", { x: (4 * B) / 2, y: 40, "text-anchor": "middle", class: "tc-mil-vong-chu" }, t.vong);
          var q = { e: e, w: 4 * B, h: 70, nha: { x: 12 + i * 196, y: 230 } }; q.p = q.nha; jDat(e, q.nha.x, q.nha.y); return q;
        });
        var khay = svg(c, "text", { x: 300, y: 222, "text-anchor": "middle", class: "tc-j-nho" }, t.keo_vong);
        function khoaVong(q, j) {
          q.xong = true; daGom[j] = true; ve++;
          q.p = { x: ox(j * 4) - 6, y: 75 }; jMuot(q.e, 250); jDat(q.e, q.p.x, q.p.y); q.e.querySelector("rect").setAttribute("class", "tc-mil-vong tc-mil-vong-khoa"); q.e.querySelector("text").textContent = "";
          nhan.push(svg(c, "text", { x: ox(j * 4) + 2 * B - 3, y: 66, "text-anchor": "middle", class: "tc-mil-nam" }, g.so.substr(j * 4, 4)));
          k.cap.textContent = dien(t.cap_gom, { x: g.so.substr(j * 4, 4), n: ve });
          if (ve === 3) k.nut(t.nut_up, nhoLai);
        }
        jKeo(c, "tc-mil-vg", vong, function () { return false; }, function (q, keo) {
          if (!keo) { var j = daGom.indexOf(false); if (j >= 0) khoaVong(q, j); return; }
          var cy = q.p.y + 35; if (cy < 40 || cy > 190) return false;
          var st = Math.max(0, Math.min(N - 4, Math.round((q.p.x + 6 - X0) / B)));
          if (st % 4 === 0 && !daGom[st / 4]) { khoaVong(q, st / 4); return; }
          k.cap.textContent = st % 4 === 0 ? t.cap_trung : dien(t.cap_lech, { x: g.so.substr(st, 4) }); return false;
        });
        function nhoLai() {
          o.forEach(function (e) { e.lat(true); }); nhan.forEach(function (e) { e.setAttribute("visibility", "hidden"); }); khoaThe = false;
          k.cap.textContent = t.cap_nho; khay.textContent = t.khay_cum; khay.setAttribute("y", 316);
          var nam = [0, 1, 2].map(function (j) { return g.so.substr(j * 4, 4); });
          var vat = tron(nam).map(function (x, i) { return { dong: [x], aria: x, v: x, nha: { x: 30 + i * 196, y: 250 } }; });
          kXep(c, "tc-mil-cum", vat, [0, 1, 2].map(function (j) { return { x: ox(j * 4) + 2 * B - 3 - 60, y: 168 }; }), 120, 50, "tc-mil-cum-nen", function () { return khoaThe; }, function (dang) {
            if (!dang.every(Boolean) || khoaThe) return; khoaThe = true;
            var d = demDung(dang, 4); nhan.forEach(function (e) { e.setAttribute("visibility", "visible"); });
            dang.forEach(function (q, j) { q.e.querySelector("rect").setAttribute("class", "tc-mil-cum-nen " + (q.v === nam[j] ? "tc-mil-dung" : "tc-mil-sai")); });
            o.forEach(function (e) { e.lat(false); });
            k.cap.textContent = dien(t.cap_2, { a: k.d1 != null ? k.d1 : "?", d: d, n: N }); k.xong();
          });
        }
      } },
      { h: 300, lam: function (c, k) {
        var L = 60, R = 540, Y = 210;
        function px(v) { return L + v * (R - L) / 10; }
        svg(c, "line", { x1: L, x2: R, y1: Y, y2: Y, class: "tc-k4-truc" });
        for (var v = 0; v <= 10; v++) { svg(c, "line", { x1: px(v), x2: px(v), y1: Y, y2: Y + 6, class: "tc-k4-truc" }); svg(c, "text", { x: px(v), y: Y + 22, "text-anchor": "middle", class: "tc-j-nho" }, String(v)); }
        svg(c, "text", { x: R, y: Y + 42, "text-anchor": "end", class: "tc-j-nho" }, t.truc_cum);
        var dai = svg(c, "rect", { x: px(g.miller[0]), y: Y - 46, width: px(g.miller[1]) - px(g.miller[0]), height: 40, rx: 8, class: "tc-mil-dai" });
        var giua = svg(c, "text", { x: px(g.miller[2]), y: Y - 19, "text-anchor": "middle", class: "tc-mil-giua" }, "≈ " + g.miller[2]);
        var nhan = svg(c, "text", { x: 300, y: Y - 64, "text-anchor": "middle", class: "tc-j-chu" }, t.nhan_miller);
        var cum = svg(c, "g", {});
        function veCum(n, cam) { cum.innerHTML = ""; for (var i = 0; i < n; i++) svg(cum, "circle", { cx: 300 + (i - (n - 1) / 2) * 30, cy: 104, r: 11, class: cam ? "tc-mil-cum-cam" : "tc-mil-cum-xanh" }); }
        veCum(g.miller[2], false);
        // công tắc: kéo núm sang phải hoặc chạm
        svg(c, "text", { x: 588, y: 52, "text-anchor": "end", class: "tc-j-nho" }, t.cong_tac);
        var ray = svg(c, "rect", { x: 520, y: 60, width: 68, height: 30, rx: 15, class: "tc-mil-ray" });
        var bat = false, num = { e: null, w: 0, h: 0, nha: { x: 535, y: 75 } };
        num.e = svg(c, "g", { class: "tc-keo tc-mil-num", tabindex: "0", role: "switch", "aria-checked": "false", "aria-label": t.cong_tac, "data-i": 0 });
        svg(num.e, "circle", { cx: 0, cy: 0, r: 22, style: "fill:transparent" }); svg(num.e, "circle", { cx: 0, cy: 0, r: 12, class: "tc-mil-num-cham" });
        num.p = num.nha; jDat(num.e, 535, 75);
        var cu = g.miller.slice();
        function dat(b) {
          bat = b; num.nha = { x: b ? 573 : 535, y: 75 }; num.p = num.nha; jMuot(num.e, 200); jDat(num.e, num.nha.x, 75);
          num.e.setAttribute("aria-checked", String(b)); ray.setAttribute("class", "tc-mil-ray" + (b ? " tc-mil-ray-bat" : ""));
          var tu = cu.slice(), den = b ? g.cowan : g.miller;
          dai.setAttribute("class", "tc-mil-dai" + (b ? " tc-mil-dai-cam" : ""));
          jChay(k.s, 700, function (f) { cu = tu.map(function (x, i) { return x + (den[i] - x) * f; }); dai.setAttribute("x", px(cu[0])); dai.setAttribute("width", px(cu[1]) - px(cu[0])); giua.setAttribute("x", px(cu[2])); }, function () {
            giua.textContent = "≈ " + den[2]; nhan.textContent = b ? t.nhan_cowan : t.nhan_miller; veCum(den[2], b);
            k.cap.textContent = b ? t.cap_bat : t.cap_tat; if (b && !k.daXong) { k.daXong = true; k.xong(); }
          });
        }
        jKeo(c, "tc-mil-num", [num], function () { return false; }, function (q, keo) {
          if (!keo) { dat(!bat); return; }
          dat(q.p.x > 554); return;
        });
      } },
      { h: 330, lam: function (c, k) {
        svg(c, "rect", { x: 200, y: 136, width: 200, height: 84, rx: 16, class: "tc-mil-may" });
        cotChu(c, 300, 172, t.may, "tc-j-chu", 18);
        var ra = g.ra.map(function (v, j) {
          var x = 24 + j * 144; svg(c, "rect", { x: x, y: 252, width: 120, height: 52, rx: 10, class: "tc-k4-o-trong" });
          return svg(c, "text", { x: x + 60, y: 288, "text-anchor": "middle", class: "tc-mil-ra" }, "");
        });
        svg(c, "path", { d: "M300 222 L300 244", class: "tc-k4-truc" });
        var con = g.nhi_phan.length;
        var ds = g.nhi_phan.map(function (b, j) {
          var e = jThe(c, "tc-mil-np", j, 120, 50, [b], b, "tc-mil-the-nen"), q = { e: e, w: 120, h: 50, nha: { x: 24 + j * 144, y: 52 }, j: j };
          var tx = e.querySelector("text"); tx.setAttribute("class", "tc-mil-np-chu"); tx.setAttribute("y", 34); q.p = q.nha; jDat(e, q.nha.x, q.nha.y); return q;
        });
        function doi(q) {
          q.xong = true; q.p = { x: 240, y: 152 }; jMuot(q.e, 300); jDat(q.e, 240, 152);
          kHen(k.s, function () {
            jDat(q.e, q.nha.x, q.nha.y); q.p = q.nha; q.e.setAttribute("opacity", "0.55"); ra[q.j].textContent = String(g.ra[q.j]); con--;
            k.cap.textContent = dien(t.cap_doi, { b: g.nhi_phan[q.j], v: g.ra[q.j] });
            if (!con) { k.cap.textContent = t.cap_smith; k.xong(); }
          }, giam ? 0 : 420);
        }
        jKeo(c, "tc-mil-np", ds, function () { return false; }, function (q, keo) {
          if (!keo) { doi(q); return; }
          var cx = q.p.x + 60, cy = q.p.y + 25; if (cx > 170 && cx < 430 && cy > 110 && cy < 250) { doi(q); return; } return false;
        });
      } }
    ]);
  }

  // ---------- Cảnh: hai đường để nhớ (xếp thẻ ký ức vào hai cổng, bật "bộ não H.M. sau 1953", rồi ba thanh điểm) ----------
  // g.the: [loại 0|1] cho t.the; g.diem: [104, 112, 67]; g.tb: 100; g.dung: lựa chọn đúng (0 tăng); t.cong: tên 2 cổng; t.chon: 3 lựa chọn
  function haiDuongNho(g, t) {
    return kBo(g, t, haiDuongNho, [
      { h: 440, lam: function (c, k) {
        var nao = svg(c, "g", {});
        svg(nao, "path", { d: "M160 150 C140 80 210 40 300 44 C400 46 460 80 452 140 C448 178 420 196 380 198 C350 214 310 206 290 196 C240 206 176 196 160 150 Z", class: "tc-hm-nao" });
        svg(nao, "path", { d: "M380 198 C400 222 440 222 452 196 C460 176 440 168 430 172", class: "tc-hm-nao" });
        svg(nao, "path", { d: "M330 204 L340 236", class: "tc-hm-cuong" });
        [["M200 110 C230 90 260 120 290 96", 0], ["M320 80 C350 100 380 74 410 96", 0], ["M230 150 C260 140 280 160 300 140", 0]].forEach(function (d) { svg(nao, "path", { d: d[0], class: "tc-hm-nep" }); });
        var hhm = svg(nao, "path", { d: "M266 176 C280 160 304 162 316 172 C326 180 322 192 310 190", class: "tc-hm-hhm" });
        var cat = svg(nao, "g", { visibility: "hidden" }); svg(cat, "path", { d: "M276 160 L318 196 M318 160 L276 196", class: "tc-hm-cat" });
        svg(c, "text", { x: 236, y: 150, "text-anchor": "end", class: "tc-hm-ten" }, t.hhm); svg(c, "path", { d: "M238 154 L270 172", class: "tc-hm-chi" });
        var GX = [20, 310], cong = [0, 1].map(function (j) {
          var e = svg(c, "g", {}); svg(e, "rect", { x: GX[j], y: 238, width: 270, height: 118, rx: 14, class: "tc-hm-cong-" + j });
          svg(e, "text", { x: GX[j] + 135, y: 258, "text-anchor": "middle", class: "tc-hm-cong-chu" }, t.cong[j]); return e;
        });
        svg(c, "path", { d: "M290 186 C220 210 160 210 155 236", class: "tc-hm-day-0" }); svg(c, "path", { d: "M400 160 C430 200 445 210 445 236", class: "tc-hm-day-1" });
        var dem = [0, 0], con = t.the.length;
        var ds = t.the.map(function (chu, i) {
          var e = jThe(c, "tc-hm-the", i, 124, 32, [chu], chu, "tc-hm-the-nen"), q = { e: e, w: 124, h: 32, nha: { x: 22 + (i % 4) * 142, y: 366 + Math.floor(i / 4) * 38 }, loai: g.the[i] };
          q.p = q.nha; jDat(e, q.nha.x, q.nha.y); return q;
        });
        // trộn vị trí khay
        var vt = tron(ds.map(function (q) { return q.nha; })); ds.forEach(function (q, i) { q.nha = vt[i]; q.p = q.nha; jDat(q.e, q.nha.x, q.nha.y); });
        function vao(q) {
          var j = q.loai, m = dem[j]++; q.xong = true; q.o = j;
          q.p = { x: GX[j] + 8 + (m % 2) * 134, y: 268 + Math.floor(m / 2) * 42 }; jMuot(q.e, 250); jDat(q.e, q.p.x, q.p.y);
          q.e.querySelector("rect").setAttribute("class", "tc-hm-the-nen tc-hm-the-" + j);
          con--; k.cap.textContent = dien(t.cap_dung, { x: t.the[ds.indexOf(q)], c: t.cong[j] });
          if (!con) { k.cap.textContent = t.cap_du; k.nut(t.nut_hm, hm); }
        }
        jKeo(c, "tc-hm-the", ds, function () { return false; }, function (q, keo) {
          if (!keo) { vao(q); return; }
          var cx = q.p.x + 62, cy = q.p.y + 16, j = -1;
          GX.forEach(function (x, m) { if (cx > x && cx < x + 270 && cy > 220 && cy < 370) j = m; });
          if (j < 0) return false;
          if (j !== q.loai) { k.cap.textContent = dien(t.cap_sai, { x: t.the[ds.indexOf(q)], c: t.cong[j] }); return false; }
          vao(q);
        });
        function hm() {
          cat.setAttribute("visibility", "visible"); hhm.setAttribute("class", "tc-hm-hhm tc-hm-hhm-mat");
          cong[0].setAttribute("class", "tc-hm-tat");
          var hat = svg(c, "g", {});
          ds.forEach(function (q) {
            if (q.loai === 1) { svg(c, "circle", { cx: q.p.x + 122, cy: q.p.y + 2, r: 8, class: "tc-hm-con-nen" }); svg(c, "text", { x: q.p.x + 122, y: q.p.y + 6, "text-anchor": "middle", class: "tc-hm-con" }, "✓"); return; }
            if (giam) { q.e.setAttribute("visibility", "hidden"); return; }
            for (var m = 0; m < 6; m++) {
              var d = svg(hat, "circle", { cx: q.p.x + 14 + m * 19, cy: q.p.y + 16, r: 4, class: "tc-hm-hat" });
              d.style.transition = "transform 1.4s ease-out " + (m * 60) + "ms, opacity 1.4s " + (m * 60) + "ms"; d.getBoundingClientRect();
              d.style.transform = "translate(" + ((m - 2.5) * 6) + "px," + (-40 - m * 8) + "px)"; d.style.opacity = "0";
            }
            q.e.style.transition = "opacity .6s"; q.e.style.opacity = "0";
          });
          kHen(k.s, function () { hat.innerHTML = ""; ds.forEach(function (q) { if (q.loai === 0) q.e.setAttribute("visibility", "hidden"); }); }, giam ? 0 : 1600);
          k.cap.textContent = t.cap_hm; k.xong();
        }
      } },
      { h: 340, lam: function (c, k) {
        var BY = 296, CX = [80, 250, 420], CW = 100;
        function y(v) { return BY - v * 1.8; }
        svg(c, "line", { x1: 40, x2: 590, y1: y(g.tb), y2: y(g.tb), class: "tc-hm-vach" });
        svg(c, "text", { x: 590, y: y(g.tb) - 8, "text-anchor": "end", class: "tc-hm-vach-chu" }, t.tb);
        svg(c, "line", { x1: 40, x2: 590, y1: BY, y2: BY, class: "tc-k4-truc" });
        var cot = g.diem.map(function (v, i) {
          var r = svg(c, "rect", { x: CX[i], y: BY, width: CW, height: 0, rx: 6, class: i === 2 ? "tc-hm-cot tc-hm-cot-tri" : "tc-hm-cot" });
          var so_ = svg(c, "text", { x: CX[i] + CW / 2, y: BY - 8, "text-anchor": "middle", class: "tc-hm-so" }, "");
          cotChu(c, CX[i] + CW / 2, BY + 18, t.cot[i], "tc-j-nho", 14);
          return { r: r, so: so_, v: v };
        });
        function moc(i, xong) {
          var q = cot[i];
          jChay(k.s, 900, function (f) { var h = q.v * 1.8 * f; q.r.setAttribute("y", BY - h); q.r.setAttribute("height", h); q.so.setAttribute("y", BY - h - 8); q.so.textContent = String(Math.round(q.v * f)); }, xong);
        }
        var hoi = svg(c, "g", {}), o2 = svg(hoi, "rect", { x: CX[1], y: 150, width: CW, height: 140, rx: 8, class: "tc-k4-o-trong" });
        svg(hoi, "text", { x: CX[1] + CW / 2, y: 228, "text-anchor": "middle", class: "tc-hm-so" }, "?");
        var da = false;
        var ds = t.chon.map(function (chu, i) {
          var e = jThe(c, "tc-hm-chon", i, 120, 36, [chu], chu, "tc-hm-chon-nen"), q = { e: e, w: 120, h: 36, nha: { x: 222 + i * 128, y: 40 }, i: i };
          q.p = q.nha; jDat(e, q.nha.x, q.nha.y); e.setAttribute("visibility", "hidden"); return q;
        });
        function tra(q) {
          if (da) return; da = true; q.xong = true; ds.forEach(function (x) { x.xong = true; if (x !== q) x.e.setAttribute("opacity", "0.35"); });
          q.e.querySelector("rect").setAttribute("class", "tc-hm-chon-nen " + (q.i === g.dung ? "tc-hm-chon-dung" : "tc-hm-chon-sai"));
          hoi.setAttribute("visibility", "hidden"); q.p = q.nha; jMuot(q.e, 250); jDat(q.e, q.nha.x, q.nha.y);
          moc(1, function () { moc(2, function () { k.cap.textContent = (q.i === g.dung ? t.cap_dung2 : t.cap_sai2) + " " + t.cap_diem; k.xong(); }); });
        }
        jKeo(c, "tc-hm-chon", ds, function () { return da; }, function (q, keo) {
          if (!keo) { tra(q); return; }
          var cx = q.p.x + 60, cy = q.p.y + 18; if (cx > CX[1] - 30 && cx < CX[1] + CW + 30 && cy > 110) { tra(q); return; } return false;
        });
        moc(0, function () { ds.forEach(function (q) { q.e.setAttribute("visibility", "visible"); }); k.cap.textContent = t.cap_hoi; });
      } }
    ]);
  }
  // ==== ĐỢT 4 K KẾT THÚC ====
  // ==== ĐỢT 4 L BẮT ĐẦU ====
  // Ba cảnh Bài báo đổi cách ta học: lan-bien (#4 thợ lặn), ban-chat (#5 tải nhận thức), tua-tuan (#6 tự kiểm tra).
  // Sân khấu tối cố định (tc-canh-toi), màu trong SVG giống nhau ở chế độ sáng và tối. Dùng lại jKeo, jChay, jLai, jDat, jMuot, jVe, jHen, jKet (đợt 3 J).
  // Vật kéo: kéo bằng chuột hoặc chạm; chạm hoặc Enter = đặt vào chỗ kế tiếp.
  function lHien(e, co) { e.setAttribute("display", co ? "inline" : "none"); }
  function lChu(c, x, y, chu, lop, neo) { return svg(c, "text", { x: x, y: y, "text-anchor": neo || "start", class: lop }, chu); }
  function lDong(c, x, y, ds, lop, lh, neo) { return ds.map(function (d, k) { return lChu(c, x, y + k * (lh || 16), d, lop, neo || "middle"); }); }
  function lThe(c, lop, i, w, h, dong, aria, nen, chuLop) {
    var e = svg(c, "g", { class: "tc-keo " + lop, tabindex: "0", role: "button", "aria-label": aria, "data-i": i });
    svg(e, "rect", { x: 0, y: 0, width: w, height: h, rx: 8, class: nen });
    dong.forEach(function (d, k) { svg(e, "text", { x: w / 2, y: h / 2 + 4.5 + (k - (dong.length - 1) / 2) * 14, "text-anchor": "middle", class: chuLop }, d); });
    return e;
  }
  // Thanh trượt có nhãn hai đầu: trả về {hop, o}
  function lTruot(id, nhan, min, max, buoc, gt, dau, cuoi) {
    var hop = tao("div", "tc-l-truot"), l = tao("label", "", nhan), o = tao("input");
    o.type = "range"; o.min = min; o.max = max; o.step = buoc; o.value = gt; o.id = id; l.htmlFor = id;
    var hai = tao("div", "tc-l-hai-dau"); hai.appendChild(tao("span", "", dau)); hai.appendChild(tao("span", "", cuoi));
    hop.appendChild(l); hop.appendChild(o); hop.appendChild(hai); return { hop: hop, o: o };
  }

  // ---------- Cảnh: học ở đâu, nhớ ở đâu (thợ lặn; thả từ lên bờ hoặc xuống nước, đoán ô nhớ tốt nhất, lật 1975 và 2021) ----------
  // Không có số đo của bài 1975 (chưa đọc được bảng gốc). t.tu: 6 từ; t.o: [[bờ-bờ, bờ-nước], [nước-bờ, nước-nước]] tên ô;
  // t.k75, t.k21: chữ trong ô; t.chu75, t.chu21: chú thích dưới lưới; t.essoe: [nhãn, số] hai thanh (Essoe và cộng sự 2022)
  function lanBien(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 420", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), doan = nut(t.nut_doan, true), t75 = nut(t.tab_1975, false), t21 = nut(t.tab_2021, false), nham = nut(t.nut_nham, false), lai = nut(t.nut_lai, false);
    [doan, t75, t21, nham, lai].forEach(function (b) { hang.appendChild(b); });
    doan.disabled = true; t75.hidden = t21.hidden = nham.hidden = true; t75.setAttribute("aria-pressed", "false"); t21.setAttribute("aria-pressed", "false");
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var MN = 150;
    // Nền: trời, bờ cát, biển, đáy
    svg(c, "rect", { x: 0, y: 0, width: 600, height: MN, class: "tc-lb-troi" });
    svg(c, "rect", { x: 0, y: 86, width: 600, height: MN - 86, class: "tc-lb-cat" });
    svg(c, "rect", { x: 0, y: MN, width: 600, height: 420 - MN, class: "tc-lb-bien" });
    [[60, 40], [210, 70], [380, 50]].forEach(function (r) { svg(c, "polygon", { points: r[0] + "," + MN + " " + (r[0] + r[1]) + "," + MN + " " + (r[0] + r[1] * 2.2) + ",420 " + (r[0] + r[1] * 1.2) + ",420", class: "tc-lb-tia" }); });
    svg(c, "path", { d: "M0 404 Q60 392 120 402 T240 400 T360 404 T480 398 T600 404 V420 H0 Z", class: "tc-lb-day" });
    [[40, 404], [96, 402], [560, 404], [300, 403]].forEach(function (p) { svg(c, "path", { d: "M" + p[0] + " " + p[1] + " q-6 -14 0 -26 q6 -12 0 -24", class: "tc-lb-rong" }); });
    var song = "M-60 " + MN; for (var x = -60; x < 660; x += 30) song += " q7.5 -5 15 0 t15 0";
    svg(svg(c, "g", { class: "tc-lb-song-g" }), "path", { d: song, class: "tc-lb-song" });
    // Thợ lặn (hình vẽ chung, không phải người thật)
    var tl = svg(c, "g", { transform: "translate(470,336)" }), tlB = svg(tl, "g", { class: "tc-lb-boi" });
    svg(tlB, "rect", { x: -34, y: -22, width: 40, height: 12, rx: 5, class: "tc-lb-binh" });
    svg(tlB, "ellipse", { cx: 0, cy: -6, rx: 42, ry: 13, class: "tc-lb-ao" });
    svg(tlB, "path", { d: "M-40 -6 L-70 -18 L-74 2 Z", class: "tc-lb-chan" });
    svg(tlB, "circle", { cx: 50, cy: -12, r: 14, class: "tc-lb-dau" });
    svg(tlB, "rect", { x: 50, y: -20, width: 16, height: 11, rx: 4, class: "tc-lb-kinh" });
    svg(tlB, "path", { d: "M20 -2 L44 10", class: "tc-lb-tay" });
    var botG = svg(c, "g", {});
    [0, 1, 2].forEach(function (k) { svg(botG, "circle", { cx: 528 + k * 5, cy: 314 - k * 16, r: 3 + k, class: "tc-lb-bot tc-lb-bot-" + k }); });
    lChu(c, 12, 74, t.ten.bo, "tc-lb-nhan");
    lChu(c, 12, 176, t.ten.nuoc, "tc-lb-nhan tc-lb-nhan-nuoc");
    // Sáu thẻ từ
    var YZ = [14, 100, 196], W = 86, H = 32;
    var the = t.tu.map(function (w, i) {
      var e = lThe(c, "tc-lb-tu", i, W, H, [w], dien(t.aria_tu, { w: w }), "tc-lb-the", "tc-lb-the-chu");
      [[12, -6, 3], [24, -14, 2], [66, -9, 2.5]].forEach(function (b) { svg(e, "circle", { cx: b[0], cy: b[1], r: b[2], class: "tc-lb-bot-the" }); });
      var o = { i: i, w: W, h: H, e: e, z: 0, nha: { x: 10 + i * 98, y: YZ[0] } }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); return o;
    });
    var phan = 1;
    function dem() {
      var a = the.filter(function (o) { return o.z === 1; }).length, b = the.filter(function (o) { return o.z === 2; }).length;
      cap.textContent = dien(t.dem, { a: a, b: b }); doan.disabled = a + b < the.length;
    }
    jKeo(c, "tc-lb-tu", the, function () { return phan !== 1; }, function (o, keo) {
      var z;
      if (keo) { var cy = o.p.y + H / 2; z = cy < 64 ? 0 : cy < MN ? 1 : 2; } else z = o.z === 1 ? 2 : 1;
      o.z = z; o.nha = { x: 10 + o.i * 98, y: YZ[z] }; jVe(o); o.e.classList.toggle("tc-lb-uot", z === 2); dem();
    });
    // Lưới 2×2 (ẩn tới khi đoán)
    var luoi = svg(c, "g", { display: "none" });
    svg(luoi, "rect", { x: 0, y: 0, width: 600, height: 420, class: "tc-lb-man" });
    lChu(luoi, 300, 30, t.luoi_hoi, "tc-lb-tieu", "middle");
    var X0 = 196, CW = 190, CH = 96, Y0 = 92, o4 = [];
    t.cot.forEach(function (n, k) { lChu(luoi, X0 + k * (CW + 8) + CW / 2, 80, n, "tc-lb-nhan", "middle"); });
    var hangChu = [0, 1].map(function (r) {
      lChu(luoi, 186, Y0 + r * (CH + 8) + CH / 2 - 2, t.hang[r], "tc-lb-nhan", "end");
      return lChu(luoi, 186, Y0 + r * (CH + 8) + CH / 2 + 16, "", "tc-lb-nho", "end");
    });
    [0, 1].forEach(function (r) {
      [0, 1].forEach(function (k) {
        var x = X0 + k * (CW + 8), y = Y0 + r * (CH + 8), gg = svg(luoi, "g", { class: "tc-lb-o" });
        svg(gg, "rect", { x: x, y: y, width: CW, height: CH, rx: 10, class: k ? "tc-lb-o-nuoc" : "tc-lb-o-bo" });
        var a = lChu(gg, x + CW / 2, y + CH / 2 + 19, "?", "tc-lb-o-chu", "middle"), b = lChu(gg, x + CW / 2, y + CH / 2 + 37, "", "tc-lb-o-nho", "middle");
        o4.push({ r: r, k: k, x: x, y: y, g: gg, a: a, b: b });
      });
    });
    var chu1 = lChu(luoi, 398, 324, "", "tc-lb-nho", "middle"), chu2 = lChu(luoi, 398, 342, "", "tc-lb-nho", "middle");
    lChu(luoi, 90, 318, t.keo_sao, "tc-lb-nho", "middle");
    // Ngôi sao đoán
    var saoE = svg(c, "g", { class: "tc-keo tc-lb-sao-g", tabindex: "0", role: "button", "aria-label": t.aria_sao, "data-i": 0, display: "none" });
    var pts = []; for (var k = 0; k < 10; k++) { var rr = k % 2 ? 9 : 21, a = -Math.PI / 2 + k * Math.PI / 5; pts.push((22 + rr * Math.cos(a)).toFixed(1) + "," + (22 + rr * Math.sin(a)).toFixed(1)); }
    svg(saoE, "rect", { x: 0, y: 0, width: 44, height: 44, rx: 22, class: "tc-lb-sao-nen" });
    svg(saoE, "polygon", { points: pts.join(" "), class: "tc-lb-sao" });
    var sao = { e: saoE, w: 44, h: 44, nha: { x: 68, y: 334 }, o: -1 }; sao.p = sao.nha; jDat(saoE, 68, 334);
    function datSao(k) {
      sao.o = k; var q = o4[k]; sao.nha = { x: q.x + CW / 2 - 22, y: q.y + 2 }; jVe(sao);
      o4.forEach(function (x, j) { x.g.classList.toggle("tc-lb-o-chon", j === k); });
      cap.textContent = dien(t.da_doan, { o: t.o[q.r][q.k] }); t75.disabled = t21.disabled = false;
    }
    jKeo(c, "tc-lb-sao-g", [sao], function () { return phan !== 2; }, function (o, keo) {
      if (!keo) { datSao((sao.o + 1) % 4); return; }
      var cx = o.p.x + 22, cy = o.p.y + 22, tim = -1;
      o4.forEach(function (q, j) { if (cx > q.x - 10 && cx < q.x + CW + 10 && cy > q.y - 10 && cy < q.y + CH + 10) tim = j; });
      if (tim < 0) return false; datSao(tim);
    });
    // Lớp "tưởng tượng lại" và hai thanh Essoe 2022
    var phu = svg(c, "g", { display: "none" });
    var mo = svg(phu, "rect", { x: 0, y: 0, width: 600, height: 420, class: "tc-lb-mo" });
    var ma = svg(phu, "g", { class: "tc-lb-ma" });
    svg(ma, "path", { d: song, class: "tc-lb-song", transform: "translate(0,40)" });
    t.tu.forEach(function (w, i) { lChu(ma, 70 + (i % 3) * 230, 120 + Math.floor(i / 3) * 70, w, "tc-lb-ma-chu", "middle"); });
    var demT = lChu(phu, 300, 300, "", "tc-lb-tieu", "middle");
    var bar = svg(phu, "g", { display: "none" }), dai = [];
    svg(bar, "rect", { x: 20, y: 40, width: 560, height: 300, rx: 14, class: "tc-lb-bang" });
    lDong(bar, 300, 72, t.essoe_tieu, "tc-lb-tieu", 20);
    t.essoe.forEach(function (d, k) {
      var y = 140 + k * 74; lChu(bar, 44, y - 10, d[0], "tc-lb-nhan");
      svg(bar, "rect", { x: 44, y: y, width: 420, height: 26, rx: 6, class: "tc-lb-ray" });
      dai.push({ r: svg(bar, "rect", { x: 44, y: y, width: 0, height: 26, rx: 6, class: k ? "tc-lb-thanh2" : "tc-lb-thanh1" }), gt: d[1], so: lChu(bar, 476, y + 19, "", "tc-lb-so") });
    });
    lDong(bar, 300, 300, t.essoe_chu, "tc-lb-nho", 16);
    function doiPhan2() {
      phan = 2; the.forEach(function (o) { lHien(o.e, false); }); lHien(luoi, true); lHien(saoE, true); c.appendChild(saoE);
      var a = the.filter(function (o) { return o.z === 1; }).length;
      hangChu[0].textContent = dien(t.so_tu, { n: a }); hangChu[1].textContent = dien(t.so_tu, { n: the.length - a });
      doan.hidden = true; t75.hidden = t21.hidden = false; t75.disabled = t21.disabled = true; cap.textContent = t.chon_o;
      saoE.focus({ preventScroll: true });
    }
    doan.onclick = doiPhan2;
    var dongKet = [], daNham = false;
    function lat(nam) {
      phan = 3; lHien(phu, false); t75.setAttribute("aria-pressed", nam === 1975); t21.setAttribute("aria-pressed", nam === 2021);
      t75.classList.toggle("tc-da-chon", nam === 1975); t21.classList.toggle("tc-da-chon", nam === 2021);
      o4.forEach(function (q) {
        var kh = q.r === q.k, la = nam === 2021 && q.r === 1 && q.k === 0;
        q.g.classList.toggle("tc-lb-sang", nam === 1975 && kh); q.g.classList.toggle("tc-lb-nhat", nam === 1975 && !kh);
        q.g.classList.toggle("tc-lb-la", la); q.g.classList.toggle("tc-lb-deu", nam === 2021 && !la);
        var k_ = nam === 1975 ? (kh ? t.k75.khop : t.k75.lech) : (la ? t.k21.la : t.k21.deu);
        q.a.textContent = k_[0]; q.b.textContent = k_[1];
      });
      var ch = nam === 1975 ? t.chu75 : t.chu21; chu1.textContent = ch[0]; chu2.textContent = ch[1];
      cap.textContent = nam === 1975 ? t.cap75 : t.cap21;
      if (!dongKet.length) {
        var q = o4[sao.o];
        dongKet = [dien(t.ket_doan, { o: t.o[q.r][q.k] }), q.r === q.k ? t.ket_khop : (q.r === 1 && q.k === 0 ? t.ket_la : t.ket_lech), t.ket_chung];
        jKet(ket, dongKet.concat([t.ket_doc])); nham.hidden = false;
      }
    }
    t75.onclick = function () { lat(1975); }; t21.onclick = function () { lat(2021); };
    nham.onclick = function () {
      nham.disabled = true; c.appendChild(phu); lHien(phu, true); lHien(bar, false); ma.classList.add("tc-lb-ma-hien"); cap.textContent = t.cap_nham;
      var con = 3; demT.textContent = dien(t.dem_nham, { s: con });
      (function buoc() {
        if (con > 0 && !giam) { jHen(s, function () { con--; demT.textContent = con ? dien(t.dem_nham, { s: con }) : ""; buoc(); }, 1000); return; }
        demT.textContent = ""; lHien(bar, true); cap.textContent = t.cap_essoe;
        jChay(s, 1400, function (f) { dai.forEach(function (d) { d.r.setAttribute("width", (420 * d.gt / 100 * f).toFixed(1)); }); }, function () {
          dai.forEach(function (d, k) { d.so.textContent = t.essoe[k][2]; });
          if (!daNham) { daNham = true; jKet(ket, dongKet.concat([t.ket_essoe, t.ket_doc])); }
          nham.disabled = false;
        });
      })();
    };
    lai.onclick = function () { jLai(s, lanBien, g, t); };
    dem(); cap.textContent = t.doc_mac;
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: cái bàn chật (câu đố nhân 3 trừ 69; bàn 4 ô đầy thì "học cách giải" rơi; bài giải mẫu chừa chỗ; thanh trình độ) ----------
  // g.dau, g.dich, g.buoc_max: số đầu, số đích, số bước tối đa (Mark chọn để chỉ có một lời giải); g.nhan, g.tru: hai phép (Sweller kể lại).
  // t.khoi2: [4 khối nhắm đích]; t.hoc, t.xem: khối "học cách giải", "bước đang xem" ([dòng], aria); t.luat: [3 lựa chọn]
  function banChat(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.cap1); cap.setAttribute("aria-live", "polite");
    var hPhep = tao("div", "tc-hang"), bNhan = nut(t.nut_nhan, true), bTru = nut(t.nut_tru, true), bThu = nut(t.nut_thu_lai, false); bThu.hidden = true;
    [bNhan, bTru, bThu].forEach(function (b) { hPhep.appendChild(b); });
    var hLuat = tao("div", "tc-hang"); hLuat.hidden = true;
    var bLuat = t.luat.map(function (l) { var b = nut(l, false); hLuat.appendChild(b); return b; });
    var tr = lTruot(g.id + "-trinh-do", t.truot, 0, 100, 1, 0, t.moi, t.gioi); tr.hop.hidden = true;
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_tiep, true), lai = nut(t.nut_lai, false); tiep.hidden = true; hang.appendChild(tiep); hang.appendChild(lai);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var man = 1, tieu = lChu(c, 16, 30, t.man[0], "tc-bn-tieu");
    // Màn 1: các viên đá số
    var m1 = svg(c, "g", {});
    var co = svg(m1, "g", { transform: "translate(560,52)" });
    svg(co, "line", { x1: 0, y1: 0, x2: 0, y2: 58, class: "tc-bn-can" }); svg(co, "path", { d: "M0 0 L-34 10 L0 22 Z", class: "tc-bn-co" });
    lChu(m1, 520, 66, t.dich, "tc-bn-nho", "end"); lChu(m1, 520, 94, String(g.dich), "tc-bn-so-to", "end");
    var demB = lChu(m1, 16, 56, "", "tc-bn-nho");
    var da = svg(m1, "g", {}), xenG = svg(m1, "g", { display: "none" });
    lChu(xenG, 300, 300, t.xen_ke, "tc-bn-vang", "middle");
    lChu(m1, 50, 254, t.dau, "tc-bn-nho", "middle");
    var v, buoc, ds;
    function xDa(k) { return 50 + k * 83; }
    function yDa(k) { return k % 2 ? 160 : 200; }
    function veDa(k, gt, lop) {
      var gg = svg(da, "g", { class: "tc-bn-da-g", transform: "translate(" + xDa(k) + "," + yDa(k) + ")" });
      svg(gg, "circle", { r: 29, class: "tc-bn-da " + (lop || "") }); lChu(gg, 0, 6, String(gt), "tc-bn-da-so", "middle"); return gg;
    }
    function batDau1() {
      da.innerHTML = ""; v = g.dau; buoc = 0; ds = [];
      veDa(0, v); bNhan.disabled = bTru.disabled = false; bThu.hidden = true; lHien(xenG, false);
      demB.textContent = dien(t.dem_buoc, { a: 0, b: g.buoc_max }); cap.textContent = t.cap1; co.classList.remove("tc-bn-co-bay");
    }
    function phep(nhan) {
      var cu = v; v = nhan ? v * g.nhan : v - g.tru; buoc++; ds.push(nhan);
      var x0 = xDa(buoc - 1), y0 = yDa(buoc - 1), x1 = xDa(buoc), y1 = yDa(buoc);
      svg(da, "line", { x1: x0 + 24, y1: y0 + (y1 - y0) * 0.2, x2: x1 - 24, y2: y1 - (y1 - y0) * 0.2, class: "tc-bn-mui " + (nhan ? "tc-bn-mui-nhan" : "tc-bn-mui-tru") });
      lChu(da, (x0 + x1) / 2, Math.min(y0, y1) - 34, nhan ? t.nut_nhan : t.nut_tru, nhan ? "tc-bn-phep-nhan" : "tc-bn-phep-tru", "middle");
      demB.textContent = dien(t.dem_buoc, { a: buoc, b: g.buoc_max });
      if (v <= 0) { veDa(buoc, v, "tc-bn-da-hong"); het(t.am); return; }
      if (v === g.dich) {
        veDa(buoc, v, "tc-bn-da-dich"); bNhan.disabled = bTru.disabled = true; co.classList.add("tc-bn-co-bay");
        cap.textContent = t.toi; hPhep.hidden = true; hLuat.hidden = false; bLuat[0].focus({ preventScroll: true }); return;
      }
      veDa(buoc, v);
      if (buoc >= g.buoc_max) het(dien(t.het, { n: g.buoc_max }));
      else cap.textContent = dien(t.dang, { a: cu, b: v });
    }
    function het(chu) { bNhan.disabled = bTru.disabled = true; bThu.hidden = false; cap.textContent = chu; bThu.focus({ preventScroll: true }); }
    bNhan.onclick = function () { phep(true); }; bTru.onclick = function () { phep(false); }; bThu.onclick = batDau1;
    var luatChon = "";
    bLuat.forEach(function (b, k) {
      b.onclick = function () {
        luatChon = t.luat[k]; bLuat.forEach(function (x) { x.disabled = true; }); b.classList.add("tc-da-chon");
        lHien(xenG, true); cap.textContent = dien(t.sau_luat, { c: luatChon }); tiep.hidden = false; tiep.focus({ preventScroll: true });
      };
    });
    // Màn 2 và 3: cái bàn
    var ban = svg(c, "g", { display: "none" }), banRung = svg(ban, "g", {});
    lChu(ban, 300, 70, t.ban, "tc-bn-nhan", "middle");
    var CHO = [0, 1, 2, 3].map(function (k) { return { x: 122 + k * 92, y: 104 }; }), BW = 84, BH = 48;
    CHO.forEach(function (p) { svg(banRung, "rect", { x: p.x - 2, y: p.y - 2, width: BW + 4, height: BH + 4, rx: 9, class: "tc-bn-o" }); });
    svg(banRung, "rect", { x: 110, y: 158, width: 380, height: 18, rx: 4, class: "tc-bn-mat" });
    svg(banRung, "rect", { x: 132, y: 176, width: 12, height: 104, class: "tc-bn-chan" }); svg(banRung, "rect", { x: 456, y: 176, width: 12, height: 104, class: "tc-bn-chan" });
    lDong(ban, 300, 198, t.cowan, "tc-bn-nho", 15);
    svg(ban, "line", { x1: 0, x2: 600, y1: 384, y2: 384, class: "tc-bn-san" });
    var con = svg(ban, "g", {}), khoi = [];
    function taoKhoi(d, lop, man_, k) {
      var i = khoi.length, e = lThe(c, "tc-bn-k", i, BW, BH, d.dong, d.aria, lop, "tc-bn-k-chu");
      var o = { i: i, e: e, w: BW, h: BH, man: man_, hoc: lop === "tc-bn-hoc", nha: { x: 24 + k * 112, y: 296 } }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); lHien(e, false); khoi.push(o); return o;
    }
    t.khoi2.forEach(function (d, k) { taoKhoi(d, "tc-bn-vang-k", 2, k); });
    var hoc2 = taoKhoi(t.hoc, "tc-bn-hoc", 2, 4);
    var xem3 = taoKhoi(t.xem, "tc-bn-vang-k", 3, 1), hoc3 = taoKhoi(t.hoc, "tc-bn-hoc", 3, 3);
    var oBan = [null, null, null, null];
    function trong() { return oBan.indexOf(null); }
    jKeo(c, "tc-bn-k", khoi, function (o) { return o.man !== man; }, function (o, keo) {
      if (keo && (o.p.y + BH / 2 > 250 || o.p.y + BH / 2 < 40)) return false;
      var k = trong();
      if (k < 0) {
        if (!o.hoc) return false;
        o.xong = true; jMuot(o.e, 220); jDat(o.e, 258, 46); banRung.classList.add("tc-bn-rung");
        jHen(s, function () { o.e.style.transition = giam ? "" : "transform .7s cubic-bezier(.5,0,.8,.6)"; jDat(o.e, 486, 322, " rotate(16)"); o.e.classList.add("tc-bn-roi"); }, 260);
        jHen(s, function () { banRung.classList.remove("tc-bn-rung"); }, 900);
        cap.textContent = t.roi; tiep.hidden = false; return;
      }
      oBan[k] = o; o.xong = true; o.nha = CHO[k]; jVe(o); o.e.removeAttribute("tabindex");
      if (man === 2) {
        var n = oBan.filter(Boolean).length;
        if (n < 4) cap.textContent = dien(t.dat2, { n: n }); else { cap.textContent = t.day; lHien(hoc2.e, true); hoc2.e.focus({ preventScroll: true }); }
      } else {
        if (xem3.xong && hoc3.xong) { cap.textContent = t.vua; tiep.hidden = false; banRung.classList.add("tc-bn-sang"); }
        else cap.textContent = o.hoc ? t.dat3_hoc : t.dat3_xem;
      }
    });
    // Màn 4: hai thẻ và thanh trình độ
    var m4 = svg(c, "g", { display: "none" });
    function the4(x, ten, mau) {
      var gg = svg(m4, "g", { class: "tc-bn-the4" }); svg(gg, "rect", { x: x, y: 56, width: 230, height: 132, rx: 14, class: mau });
      lChu(gg, x + 115, 84, ten, "tc-bn-the4-ten", "middle"); return gg;
    }
    var mau4 = the4(30, t.mau, "tc-bn-the-mau"), tu4 = the4(340, t.tu_giai, "tc-bn-the-tu");
    [0, 1, 2].forEach(function (k) { svg(mau4, "rect", { x: 56, y: 104 + k * 24, width: 150 - k * 20, height: 10, rx: 4, class: "tc-bn-dong-mau" }); svg(mau4, "path", { d: "M" + (216 - k * 20) + " " + (110 + k * 24) + " l6 6 l10 -12", class: "tc-bn-tich" }); });
    [0, 1, 2].forEach(function (k) { svg(tu4, "line", { x1: 366, x2: 520, y1: 116 + k * 24, y2: 116 + k * 24, class: "tc-bn-dong-tu" }); });
    svg(tu4, "path", { d: "M500 160 l30 -40 l8 6 l-30 40 l-10 4 Z", class: "tc-bn-but" });
    var n1 = lDong(m4, 145, 214, t.g048, "tc-bn-nho tc-bn-ghi1", 16), n2 = lDong(m4, 455, 214, t.dao_nguoc, "tc-bn-nho tc-bn-ghi2", 16);
    svg(m4, "line", { x1: 60, x2: 540, y1: 300, y2: 300, class: "tc-bn-duong" });
    lChu(m4, 60, 330, t.moi, "tc-bn-nho", "middle"); lChu(m4, 540, 330, t.gioi, "tc-bn-nho", "middle");
    var nguoi = svg(m4, "g", {}); svg(nguoi, "circle", { cx: 0, cy: -26, r: 9, class: "tc-bn-nguoi" }); svg(nguoi, "path", { d: "M-12 0 Q0 -22 12 0 Z", class: "tc-bn-nguoi" });
    lChu(m4, 300, 366, t.minh_hoa, "tc-bn-nho", "middle");
    var xong4 = false;
    function ve4(x) {
      var f = x / 100; jDat(nguoi, 60 + 480 * f, 296);
      mau4.setAttribute("opacity", (1 - 0.75 * f).toFixed(2)); tu4.setAttribute("opacity", (0.25 + 0.75 * f).toFixed(2));
      n1.forEach(function (e) { e.setAttribute("opacity", (1 - 0.6 * f).toFixed(2)); }); n2.forEach(function (e) { e.setAttribute("opacity", (0.3 + 0.7 * f).toFixed(2)); });
      mau4.classList.toggle("tc-bn-noi", f < 0.35); tu4.classList.toggle("tc-bn-noi", f > 0.65);
      cap.textContent = f < 0.35 ? t.cap_moi : f > 0.65 ? t.cap_gioi : t.cap_giua;
      if (x >= 95 && !xong4) { xong4 = true; jKet(ket, [dien(t.ket, { c: luatChon }), t.ket_hai, t.ket_doc]); }
    }
    tr.o.oninput = function () { ve4(+tr.o.value); };
    function doiMan() {
      man++; tieu.textContent = t.man[man - 1]; tiep.hidden = true;
      if (man === 2) { lHien(m1, false); hPhep.hidden = hLuat.hidden = true; lHien(ban, true); khoi.forEach(function (o) { if (o.man === 2 && !o.hoc) lHien(o.e, true); }); cap.textContent = t.cap2; khoi[0].e.focus({ preventScroll: true }); }
      if (man === 3) {
        oBan = [null, null, null, null]; banRung.classList.remove("tc-bn-sang");
        khoi.forEach(function (o) { lHien(o.e, o.man === 3); }); cap.textContent = t.cap3; xem3.e.focus({ preventScroll: true });
      }
      if (man === 4) { lHien(ban, false); khoi.forEach(function (o) { lHien(o.e, false); }); lHien(m4, true); tr.hop.hidden = false; ve4(0); cap.textContent = t.cap4; tr.o.focus({ preventScroll: true }); }
    }
    tiep.onclick = doiMan;
    lai.onclick = function () { jLai(s, banChat, g, t); };
    batDau1();
    s.appendChild(san); s.appendChild(cap); s.appendChild(hPhep); s.appendChild(hLuat); s.appendChild(tr.hop); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: đoán trước, rồi tua một tuần (xếp 4 lượt ôn; đoán thứ hạng; thanh thời gian 5 phút ↔ 1 tuần) ----------
  // g.phut5, g.tuan1: % nhớ [SSSS, SSST, STTT] sau 5 phút và 1 tuần (Roediger và Karpicke 2006, Thí nghiệm 2); g.kieu: ["SSSS","SSST","STTT"]
  function tuaTuan(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 600 400", role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.cap1); cap.setAttribute("aria-live", "polite");
    var chac = lTruot(g.id + "-chac", t.chac, 1, 7, 1, 4, t.chac_dau, t.chac_cuoi); chac.hop.hidden = true;
    var tg = lTruot(g.id + "-thoi-gian", t.thoi_gian, 0, 100, 1, 0, t.moc[0], t.moc[1]); tg.hop.hidden = true;
    var chacGt = tao("output", "tc-l-gt", "4/7"); chac.hop.querySelector("label").appendChild(chacGt);
    var hang = tao("div", "tc-hang"), tiep = nut(t.nut_tiep, true), tua = nut(t.nut_tua, true), lai = nut(t.nut_lai, false);
    tiep.disabled = true; tua.hidden = true; [tiep, tua, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var man = 1, tieu = lChu(c, 16, 30, t.man[0], "tc-tt-tieu");
    function veMa(gg, x, y, ma, o) { ma.split("").forEach(function (ch, k) { svg(gg, "rect", { x: x + k * (o + 3), y: y, width: o, height: o, rx: 2, class: ch === "S" ? "tc-tt-o-doc" : "tc-tt-o-hoi" }); }); }
    // Màn 1: bốn ô lượt học và bảy thẻ
    var m1 = svg(c, "g", {}), CW = 68, CH = 60;
    var CHO = [0, 1, 2, 3].map(function (k) { return { x: 116 + k * 100, y: 156 }; });
    CHO.forEach(function (p, k) { svg(m1, "rect", { x: p.x - 3, y: p.y - 3, width: CW + 6, height: CH + 6, rx: 10, class: "tc-tt-cho" }); lChu(m1, p.x + CW / 2, p.y + CH + 22, dien(t.luot, { n: k + 1 }), "tc-tt-nho", "middle"); });
    var maT = lChu(m1, 300, 290, "", "tc-tt-ma", "middle"), moTaT = lChu(m1, 300, 316, "", "tc-tt-nho", "middle");
    lChu(m1, 300, 372, t.chu_giai, "tc-tt-nho", "middle");
    var the = [];
    "SSSSTTT".split("").forEach(function (ch, i) {
      var e = svg(c, "g", { class: "tc-keo tc-tt-k1", tabindex: "0", role: "button", "aria-label": ch === "S" ? t.aria_doc : t.aria_hoi, "data-i": i });
      svg(e, "rect", { x: 0, y: 0, width: CW, height: CH, rx: 9, class: ch === "S" ? "tc-tt-doc" : "tc-tt-hoi" });
      if (ch === "S") { svg(e, "path", { d: "M14 14 Q24 10 34 16 Q44 10 54 14 V38 Q44 34 34 40 Q24 34 14 38 Z", class: "tc-tt-sach" }); svg(e, "line", { x1: 34, x2: 34, y1: 16, y2: 40, class: "tc-tt-gay" }); }
      else lChu(e, CW / 2, 38, "?", "tc-tt-hoi-chu", "middle");
      lChu(e, CW / 2, CH - 7, ch === "S" ? t.doc : t.tu_viet, "tc-tt-k-chu", "middle");
      var o = { i: i, e: e, w: CW, h: CH, ch: ch, o: -1, nha: { x: 24 + i * 80, y: 50 } }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); the.push(o);
    });
    var oCho = [null, null, null, null];
    // Đặt vật vào chỗ k (đổi ra nhà nếu chỗ có vật khác); k = -1 là về nhà
    function datVao(ds, oc, cho, o, k) {
      if (o.o >= 0) oc[o.o] = null;
      if (k >= 0 && oc[k] && oc[k] !== o) { var cu = oc[k]; cu.o = -1; jVe(cu); }
      o.o = k; if (k >= 0) { oc[k] = o; jMuot(o.e, 250); o.p = cho[k]; jDat(o.e, cho[k].x, cho[k].y); } else jVe(o);
    }
    function ganNhat(o, cho, w, h) {
      var cx = o.p.x + o.w / 2, cy = o.p.y + o.h / 2, k = -1, kc = 1e9;
      cho.forEach(function (p, j) { var d = Math.hypot(p.x + w / 2 - cx, p.y + h / 2 - cy); if (d < kc) { kc = d; k = j; } });
      return kc < 80 ? k : -1;
    }
    function xet1() {
      var du = oCho.every(Boolean); tiep.disabled = !du;
      if (!du) { maT.textContent = oCho.map(function (o) { return o ? o.ch : "·"; }).join(" "); moTaT.textContent = ""; cap.textContent = t.cap1; return; }
      var ma = oCho.map(function (o) { return o.ch; }).join(""), k = g.kieu.indexOf(ma);
      maT.textContent = ma; moTaT.textContent = k >= 0 ? t.kieu[k] : t.kieu_la;
      cap.textContent = k >= 0 ? dien(t.kieu_dung, { k: ma }) : t.kieu_khac;
    }
    jKeo(c, "tc-tt-k1", the, function () { return man !== 1; }, function (o, keo) {
      var k;
      if (keo) k = ganNhat(o, CHO, CW, CH); else k = o.o >= 0 ? -1 : oCho.indexOf(null);
      if (keo && k < 0) { datVao(the, oCho, CHO, o, -1); xet1(); return; }
      if (!keo && k < 0 && o.o < 0) { cap.textContent = t.day; return false; }
      datVao(the, oCho, CHO, o, k); xet1();
    });
    // Màn 2: bục ba bậc và ba nhãn
    var m2 = svg(c, "g", { display: "none" });
    var BAC = [{ x: 230, y: 214, h: 116 }, { x: 90, y: 246, h: 84 }, { x: 370, y: 272, h: 58 }];
    BAC.forEach(function (b, k) { svg(m2, "rect", { x: b.x, y: b.y, width: 140, height: b.h, rx: 6, class: "tc-tt-bac" }); lChu(m2, b.x + 70, b.y + 38, String(k + 1), "tc-tt-bac-so", "middle"); });
    lChu(m2, 300, 362, t.bac_chu, "tc-tt-nho", "middle");
    var NW = 124, NH = 50, CHO2 = BAC.map(function (b) { return { x: b.x + 8, y: b.y - NH - 6 }; }), oCho2 = [null, null, null];
    var nhan = g.kieu.map(function (ma, i) {
      var e = svg(c, "g", { class: "tc-keo tc-tt-k2", tabindex: "0", role: "button", "aria-label": ma + ": " + t.kieu[i], "data-i": i, display: "none" });
      svg(e, "rect", { x: 0, y: 0, width: NW, height: NH, rx: 9, class: "tc-tt-nhan" });
      lChu(e, 12, 22, ma, "tc-tt-nhan-chu"); veMa(e, 12, 30, ma, 12);
      var o = { i: i, e: e, w: NW, h: NH, ma: ma, o: -1, nha: { x: 46 + i * 182, y: 56 } }; o.p = o.nha; jDat(e, o.nha.x, o.nha.y); return o;
    });
    function xet2() {
      var du = oCho2.every(Boolean); tiep.disabled = !du; chac.hop.hidden = !du;
      cap.textContent = du ? dien(t.da_xep, { a: oCho2[0].ma }) : t.cap2;
    }
    jKeo(c, "tc-tt-k2", nhan, function () { return man !== 2; }, function (o, keo) {
      var k;
      if (keo) k = ganNhat(o, CHO2, NW, NH); else k = o.o >= 0 ? -1 : oCho2.indexOf(null);
      datVao(nhan, oCho2, CHO2, o, k); xet2();
    });
    chac.o.oninput = function () { chacGt.textContent = chac.o.value + "/7"; };
    // Màn 3: ba cột và thanh thời gian
    var m3 = svg(c, "g", { display: "none" }), BY = 330, K = 2.3;
    var dongHo = lChu(m3, 584, 34, "", "tc-tt-gio", "end"), giua = lChu(m3, 584, 56, t.giua, "tc-tt-nho", "end");
    lChu(m3, 16, 56, t.co_mau, "tc-tt-nho");
    svg(m3, "line", { x1: 60, x2: 560, y1: BY, y2: BY, class: "tc-tt-truc" });
    var cot = g.kieu.map(function (ma, i) {
      var x = 110 + i * 150, gg = svg(m3, "g", {});
      var r = svg(gg, "rect", { x: x, y: BY, width: 80, height: 0, rx: 5, class: "tc-tt-cot tc-tt-cot-" + i });
      var so = lChu(gg, x + 40, BY - 8, "", "tc-tt-so", "middle");
      lChu(gg, x + 40, BY + 22, ma, "tc-tt-nhan-chu tc-tt-tren-toi", "middle"); lChu(gg, x + 40, BY + 40, t.kieu[i], "tc-tt-nho", "middle");
      var sao = lChu(gg, x + 40, 92, "", "tc-tt-sao", "middle");
      return { x: x, r: r, so: so, sao: sao };
    });
    var xong3 = false;
    function ve3(x) {
      var f = x / 100;
      cot.forEach(function (k, i) {
        var gt = g.phut5[i] + (g.tuan1[i] - g.phut5[i]) * f, h = gt * K; k.r.setAttribute("y", (BY - h).toFixed(1)); k.r.setAttribute("height", h.toFixed(1));
        k.so.setAttribute("y", (BY - h - 8).toFixed(1)); k.so.textContent = x <= 0 ? g.phut5[i] + "%" : x >= 100 ? g.tuan1[i] + "%" : "…";
      });
      dongHo.textContent = x <= 0 ? t.moc[0] : x >= 100 ? t.moc[1] : "…"; lHien(giua, x > 0 && x < 100);
      var dau = 0; (x >= 100 ? g.tuan1 : g.phut5).forEach(function (v, i, a) { if (v > a[dau]) dau = i; });
      cot.forEach(function (k, i) { k.r.classList.toggle("tc-tt-dau", (x <= 0 || x >= 100) && i === dau); });
      if (x >= 100 && !xong3) {
        xong3 = true; tua.disabled = true; cap.textContent = t.cap_tuan;
        var ban = oCho2[0].ma, dung = ban === g.kieu[dau];
        jKet(ket, [dien(dung ? t.ket_dung : t.ket_sai, { a: ban, b: g.kieu[dau] }), t.ket_that, t.ket_sv, dien(t.ket_chac, { c: chac.o.value }), t.mang_ve_tieu, t.mang_ve, t.ket_doc]);
      } else if (x <= 0) cap.textContent = t.cap3; else if (x < 100) cap.textContent = t.cap_giua;
    }
    tg.o.oninput = function () { ve3(+tg.o.value); };
    tua.onclick = function () {
      tua.disabled = true; var x0 = +tg.o.value;
      jChay(s, 2400 * (100 - x0) / 100, function (f) { var x = Math.round(x0 + (100 - x0) * f); tg.o.value = x; ve3(x); }, function () { tg.o.value = 100; ve3(100); });
    };
    tiep.onclick = function () {
      man++; tieu.textContent = t.man[man - 1]; tiep.disabled = true;
      if (man === 2) { lHien(m1, false); the.forEach(function (o) { lHien(o.e, false); }); lHien(m2, true); nhan.forEach(function (o) { lHien(o.e, true); }); tiep.textContent = t.nut_den_tn; cap.textContent = t.cap2; nhan[0].e.focus({ preventScroll: true }); }
      else if (man === 3) {
        lHien(m2, false); nhan.forEach(function (o) { lHien(o.e, false); }); chac.hop.hidden = true; tiep.hidden = true; lHien(m3, true);
        cot[g.kieu.indexOf(oCho2[0].ma)].sao.textContent = t.ban_doan;
        tg.hop.hidden = false; tua.hidden = false; ve3(0); tua.focus({ preventScroll: true });
      }
    };
    lai.onclick = function () { jLai(s, tuaTuan, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(chac.hop); s.appendChild(tg.hop); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 4 L KẾT THÚC ====
  // ==== ĐỢT 4 M BẮT ĐẦU ====
  // Bốn cảnh "Bài báo đổi cách ta học": xep-cach-hoc (tự xếp hạng 10 cách học), duong-cong-sigma (kéo đường cong 2 sigma),
  // nua-doi-on-tu (kéo ngày ôn trên đường cong nửa đời), dap-an-hay-goi-y (AI: đáp án hay gợi ý).
  // Sân khấu nền tối cố định (tc-canh-toi) nên màu trong SVG giống nhau ở chế độ sáng và tối.
  // Kéo bằng keoSvg (chuột và cảm ứng); chạm thẻ rồi chạm ngăn, hoặc Enter trên thẻ, thay cho kéo.
  function m4Hen(s, fn, ms) { return setTimeout(function () { if (s.isConnected && !s._dung) fn(); }, giam ? Math.min(ms, 60) : ms); }
  function m4Lai(s, lam, g, t) { s._dung = true; var moi = lam(g, t); s.parentNode.replaceChild(moi, s); var h = moi.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function m4Chay(s, ms, buoc, xong) {
    if (giam || ms <= 0) { buoc(1); if (xong) xong(); return; }
    var t0 = null;
    requestAnimationFrame(function f(ts) { if (!s.isConnected || s._dung) return; if (t0 == null) t0 = ts; var x = Math.min(1, (ts - t0) / ms); buoc(x); if (x < 1) requestAnimationFrame(f); else if (xong) xong(); });
  }
  function m4Dat(e, x, y, k) { e.setAttribute("transform", "translate(" + x + "," + y + ")" + (k ? " scale(" + k + ")" : "")); }
  function m4Muot(e, ms) { e.style.transition = giam ? "" : "transform " + ms + "ms ease, opacity " + ms + "ms"; }
  function m4Nut(e, fn) { e.addEventListener("click", fn); e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(ev); } }); }
  function m4De(x) { return 1 - Math.pow(1 - x, 3); }
  function m4Ket(ket, ds) { ket.innerHTML = ""; ds.forEach(function (d) { if (d) ket.appendChild(tao("p", "", d)); }); ket.hidden = false; }
  // Thẻ chữ kéo được: hình chữ nhật bo góc, 1–2 dòng chữ
  function m4The(c, i, w, h, dong, aria, lop) {
    var e = svg(c, "g", { class: "tc-keo tc-mm-vat " + lop, tabindex: "0", role: "button", "aria-label": aria, "data-i": i });
    svg(e, "rect", { x: 0, y: 0, width: w, height: h, rx: lop === "tc-ai-bong" ? 12 : 7 });
    dong.forEach(function (d, k) { svg(e, "text", { x: w / 2, y: h / 2 + 4.5 + (k - (dong.length - 1) / 2) * 15, "text-anchor": "middle", class: "tc-mm-the-chu" }, d); });
    return e;
  }
  // Xếp thẻ vào ngăn: o.vat [{e,w,h,k,nha}], o.ngan [{x,y,w,h,e}], o.slot(k, j, n) → {x,y}; o.khoa(), o.doi(v), o.chon(v)
  function m4Xep(c, o) {
    var chon = null;
    function datV(v, p, muot) { if (muot) m4Muot(v.e, 300); else v.e.style.transition = ""; v.p = p; m4Dat(v.e, p.x, p.y); }
    function xepLai(muot) {
      o.ngan.forEach(function (n, k) { var ds = o.vat.filter(function (v) { return v.k === k; }); ds.forEach(function (v, j) { datV(v, o.slot(k, j, ds.length), muot); }); });
      o.vat.forEach(function (v) { if (v.k < 0) datV(v, v.nha, muot); });
    }
    function danhDau(v) { chon = v; o.vat.forEach(function (x) { x.e.classList.toggle("tc-mm-chon", x === v); }); o.ngan.forEach(function (n) { n.e.classList.toggle("tc-mm-mo", !!v); }); }
    function bo(v, k) { v.k = k; danhDau(null); xepLai(true); if (o.doi) o.doi(v); }
    o.vat.forEach(function (v) { datV(v, v.nha); });
    keoSvg(c, "g.tc-mm-vat", function (e, p, b, d) {
      var v = o.vat[+e.getAttribute("data-i")]; if (!v || o.khoa()) return false;
      if (b === "bat") { v.lech = null; c.appendChild(e); e.style.transition = ""; return; }
      if (!v.lech) v.lech = { x: d.x - v.p.x, y: d.y - v.p.y }; datV(v, { x: p.x - v.lech.x, y: p.y - v.lech.y });
    }, function (e, p) {
      var v = o.vat[+e.getAttribute("data-i")]; if (!v || o.khoa()) return;
      if (!p) { if (chon && chon !== v && v.k >= 0) { bo(chon, v.k); return; } if (chon === v) danhDau(null); else { danhDau(v); if (o.chon) o.chon(v); } xepLai(true); return; }
      var cx = v.p.x + v.w / 2, cy = v.p.y + v.h / 2, k = -1;
      o.ngan.forEach(function (n, i) { if (cx > n.x && cx < n.x + n.w && cy > n.y - 24 && cy < n.y + n.h + 24) k = i; });
      bo(v, k);
    });
    c.addEventListener("keydown", function (ev) {
      var e = ev.target.closest && ev.target.closest("g.tc-mm-vat"); if (!e || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault();
      var v = o.vat[+e.getAttribute("data-i")]; if (!v || o.khoa()) return; bo(v, (v.k + 1) % o.ngan.length);
    });
    o.ngan.forEach(function (n, k) { m4Nut(n.e, function () { if (o.khoa() || !chon) return; bo(chon, k); }); });
    return { xepLai: xepLai, bo: bo };
  }
  // Câu hỏi tự kiểm tra cuối cảnh: chọn một trong vài nút, hiện lời giải
  function m4TuKiem(hoi, chon, dung, giai) {
    var d = tao("div", "tc-mm-tu"); d.appendChild(tao("p", "tc-mm-tu-hoi", hoi));
    var h = tao("div", "tc-hang"), p = tao("p", "tc-mm-tu-giai", giai); p.hidden = true; p.setAttribute("aria-live", "polite");
    var ds = chon.map(function (x, i) {
      var b = nut(x, false); b.onclick = function () { ds.forEach(function (y, k) { y.disabled = true; if (k === dung) y.classList.add("tc-mm-dung"); }); if (i !== dung) b.classList.add("tc-mm-sai"); p.hidden = false; };
      h.appendChild(b); return b;
    });
    d.appendChild(h); d.appendChild(p); return d;
  }

  // ---------- Cảnh: tự xếp hạng 10 cách học (kéo thẻ vào 3 ngăn, so bảng điểm Dunlosky 2013, rồi thanh hệ số 2021 mọc lên) ----------
  // g.the: [{bac: 0 cao | 1 vừa | 2 thấp, d: hệ số Donoghue & Hattie}] cùng thứ tự t.the [{dong, full}]; g.tb: hệ số trung bình. t.ngan: tên 3 ngăn.
  function xepCachHoc(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), W = 520, H = 420, c = svg(san, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true), heSo = nut(t.nut_he_so, true), lai = nut(t.nut_lai, false);
    xem.disabled = true; heSo.hidden = true; lai.hidden = true; [xem, heSo, lai].forEach(function (b) { hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var CW = 118, CH = 38, nganG = svg(c, "g", { class: "tc-ch-ngan-nhom" });
    var ngan = t.ngan.map(function (ten, k) {
      var x = 8 + k * 170, y = 150, w = 164, h = 262, e = svg(nganG, "g", { class: "tc-ch-ngan tc-ch-ngan-" + k, tabindex: "0", role: "button", "aria-label": ten });
      svg(e, "rect", { x: x, y: y, width: w, height: h, rx: 10, class: "tc-ch-hop" });
      svg(e, "text", { x: x + w / 2, y: y + 23, "text-anchor": "middle", class: "tc-ch-ten" }, ten);
      return { x: x, y: y, w: w, h: h, e: e };
    });
    var cot = [10, 137, 264, 391], nha = [];
    for (var i = 0; i < t.the.length; i++) { var r = Math.floor(i / 4), k = i % 4; nha.push(r < 2 ? { x: cot[k], y: 12 + r * 44 } : { x: cot[k + 1], y: 100 }); }
    var ns = tron(nha), khoa = false;
    var vat = t.the.map(function (d, i) { return { i: i, e: m4The(c, i, CW, CH, d.dong, d.full, "tc-ch-the"), w: CW, h: CH, k: -1, nha: ns[i], bac: g.the[i].bac, d: g.the[i].d }; });
    function soDat() { return vat.filter(function (v) { return v.k >= 0; }).length; }
    var xep = m4Xep(c, { vat: vat, ngan: ngan, khoa: function () { return khoa; },
      slot: function (k, j, n) { var b = n > 5 ? 176 / (n - 1) : 44; return { x: ngan[k].x + 23, y: ngan[k].y + 36 + j * b }; },
      chon: function (v) { cap.textContent = dien(t.da_chon, { the: t.the[v.i].full }); },
      doi: function (v) { var n = soDat(); xem.disabled = n < vat.length; cap.textContent = n === vat.length ? t.du : v.k >= 0 ? dien(t.da_dat, { the: t.the[v.i].full, ngan: t.ngan[v.k] }) : t.doc_mac; } });
    xem.onclick = function () {
      khoa = true; xem.hidden = true; var dung = 0;
      vat.forEach(function (v) { var ok = v.k === v.bac; if (ok) dung++; v.e.classList.add(ok ? "tc-ch-dung" : "tc-ch-sai"); });
      cap.textContent = dien(t.cham, { n: dung });
      m4Hen(s, function () { vat.forEach(function (v) { v.k = v.bac; }); xep.xepLai(true); heSo.hidden = false; lai.hidden = false; }, 900);
    };
    heSo.onclick = function () {
      heSo.hidden = true; nganG.style.transition = giam ? "" : "opacity .5s"; nganG.style.opacity = "0"; nganG.style.pointerEvents = "none";
      var BX = 118, BL = 330, sx = function (d) { return BX + d / 0.9 * BL; }, bd = svg(c, "g", {});
      svg(bd, "text", { x: 10, y: 18, class: "tc-mm-nho" }, t.he_so_tieu);
      svg(bd, "line", { x1: sx(g.tb), x2: sx(g.tb), y1: 26, y2: 400, class: "tc-ch-tb" });
      svg(bd, "text", { x: sx(g.tb), y: 18, "text-anchor": "middle", class: "tc-mm-nho" }, dien(t.tb, { d: so(g.tb, 2) }));
      t.chu_giai.forEach(function (x, k) { svg(bd, "rect", { x: 120 + k * 120, y: 402, width: 12, height: 12, rx: 2, class: "tc-ch-cot-" + k }); svg(bd, "text", { x: 138 + k * 120, y: 412, class: "tc-mm-nho" }, x); });
      var thu = vat.slice().sort(function (a, b) { return b.d - a.d || a.bac - b.bac; });
      thu.forEach(function (v, r) {
        var y = 30 + r * 37; v.e.classList.remove("tc-ch-sai", "tc-ch-dung"); m4Muot(v.e, 600); m4Dat(v.e, 8, y, 0.85);
        v.cot = svg(bd, "rect", { x: BX, y: y + 6, width: 0, height: 20, rx: 4, class: "tc-ch-cot tc-ch-cot-" + v.bac });
        v.so = svg(bd, "text", { x: BX + 6, y: y + 21, class: "tc-ch-so" }, "");
      });
      cap.textContent = t.cap_he_so;
      m4Hen(s, function () {
        m4Chay(s, 1600, function (f) {
          thu.forEach(function (v, r) { var ff = Math.max(0, Math.min(1, f * 1.5 - r * 0.05)), w = (sx(v.d) - BX) * m4De(ff); v.cot.setAttribute("width", w); v.so.setAttribute("x", BX + w + 6); v.so.textContent = ff >= 1 ? so(v.d, 2) : ""; });
        }, function () {
          thu.forEach(function (v) { v.so.textContent = so(v.d, 2); });
          m4Ket(ket, [t.ket]); s.insertBefore(m4TuKiem(t.tu_hoi, t.tu_chon, g.tu_dung, t.tu_giai), s.querySelector(".tc-nguon"));
        });
      }, giam ? 0 : 500);
    };
    lai.onclick = function () { m4Lai(s, xepCachHoc, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: kéo đường cong sigma (thanh trượt 0–2,5σ, rồi các mốc nghiên cứu rơi xuống trục, rồi vòng sửa sai) ----------
  // g.moc: [{d, le}] theo thứ tự hiện (lớn tới nhỏ), t.moc: nhãn cùng thứ tự; g.toi_da: σ lớn nhất kéo được. t.vong: 4 bước đúng thứ tự.
  function m4Phi(z) {
    var x = Math.abs(z) / Math.SQRT2, k = 1 / (1 + 0.3275911 * x);
    var e = 1 - ((((1.061405429 * k - 1.453152027) * k + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-x * x);
    return z >= 0 ? (1 + e) / 2 : (1 - e) / 2;
  }
  function duongCongSigma(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), W = 520, H = 392, c = svg(san, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", ""); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true), lai = nut(t.nut_lai, false); lai.hidden = true; hang.appendChild(xem); hang.appendChild(lai);
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var LO = -2.6, HI = 4.4, X0 = 20, X1 = 500, BY = 196, CAO = 136, MAX = g.toi_da || 2.5, d = 0, khoa = false;
    function px(z) { return X0 + (z - LO) / (HI - LO) * (X1 - X0); }
    function vz(x) { return LO + (x - X0) / (X1 - X0) * (HI - LO); }
    function cao(z, m) { return BY - CAO * Math.exp(-(z - m) * (z - m) / 2); }
    function cong(m, a, b) { var p = "M" + px(a).toFixed(1) + " " + BY; for (var z = a; z < b; z += 0.05) p += " L" + px(z).toFixed(1) + " " + cao(z, m).toFixed(1); return p + " L" + px(b).toFixed(1) + " " + cao(b, m).toFixed(1) + " L" + px(b).toFixed(1) + " " + BY + " Z"; }
    svg(c, "text", { x: 12, y: 22, class: "tc-mm-nho" }, t.truc);
    for (var z = -2; z <= 4; z++) {
      svg(c, "line", { x1: px(z), x2: px(z), y1: BY, y2: BY + 6, class: "tc-hs-truc" });
      svg(c, "text", { x: px(z), y: BY + 20, "text-anchor": "middle", class: "tc-mm-nho" }, z === 0 ? "0" : (z > 0 ? "+" : "−") + Math.abs(z) + "σ");
    }
    svg(c, "path", { d: cong(0, LO, HI), class: "tc-hs-xam" });
    var phan = svg(c, "path", { class: "tc-hs-phan" }), xanh = svg(c, "path", { class: "tc-hs-xanh" });
    svg(c, "line", { x1: X0, x2: X1, y1: BY, y2: BY, class: "tc-hs-truc" });
    svg(c, "text", { x: px(0) - 34, y: BY - CAO * 0.62, "text-anchor": "end", class: "tc-hs-nhan-xam" }, t.nhan_xam);
    var doc = svg(c, "line", { y1: BY - CAO, y2: BY, class: "tc-hs-doc" });
    var mocG = svg(c, "g", {});
    var tay = svg(c, "g", { class: "tc-keo tc-hs-tay", tabindex: "0", role: "slider", "aria-label": t.nhan_tay, "aria-valuemin": 0, "aria-valuemax": MAX });
    svg(tay, "circle", { r: 24, style: "fill:transparent" }); svg(tay, "circle", { r: 11, class: "tc-hs-nam" });
    svg(tay, "path", { d: "M-5 -4 L-9 0 L-5 4 M5 -4 L9 0 L5 4", class: "tc-hs-mui" });
    var nhanX = svg(c, "text", { y: BY - CAO - 20, "text-anchor": "middle", class: "tc-hs-nhan-xanh" }, "");
    function ve() {
      var x = px(d);
      xanh.setAttribute("d", cong(d, Math.max(LO, d - 3.4), Math.min(HI, d + 3.4)));
      phan.setAttribute("d", d > LO + 0.05 ? cong(0, LO, d) : "");
      doc.setAttribute("x1", x); doc.setAttribute("x2", x); m4Dat(tay, x, BY - CAO);
      nhanX.setAttribute("x", Math.max(70, Math.min(450, x))); nhanX.textContent = dien(t.nhan_xanh, { d: so(d, 1) });
      tay.setAttribute("aria-valuenow", d); tay.setAttribute("aria-valuetext", "+" + so(d, 1) + "σ");
      if (!khoa) cap.textContent = dien(t.hon, { d: so(d, 1), p: so(m4Phi(d) * 100, 0) });
    }
    function datD(v) { d = Math.max(0, Math.min(MAX, Math.round(v * 10) / 10)); ve(); }
    ve();
    keoSvg(c, "g.tc-hs-tay", function (e, p) { if (khoa) return false; if (p) datD(vz(p.x)); }, function () {});
    c.addEventListener("click", function (ev) { if (khoa || (ev.target.closest && ev.target.closest("g.tc-hs-tay"))) return; var p = diemSvg(c, ev); if (p.y < BY + 10) datD(vz(p.x)); });
    tay.addEventListener("keydown", function (ev) {
      if (khoa) return; var b = { ArrowRight: 0.1, ArrowUp: 0.1, ArrowLeft: -0.1, ArrowDown: -0.1 }[ev.key];
      if (b) { ev.preventDefault(); datD(d + b); } else if (ev.key === "Home") { ev.preventDefault(); datD(0); } else if (ev.key === "End") { ev.preventDefault(); datD(MAX); }
    });
    // Vòng sửa sai (phần làm được không cần gia sư)
    var vong = tao("div", "tc-hs-vong"); vong.hidden = true;
    vong.appendChild(tao("p", "tc-mm-tu-hoi", t.vong_hoi));
    var vSan = canh("tc-canh-toi tc-hs-vong-san"), vc = svg(vSan, "svg", { viewBox: "0 0 300 220", role: "img", "aria-label": t.vong_mo_ta });
    var quay = svg(vc, "g", { class: "tc-hs-quay" });
    svg(quay, "ellipse", { cx: 150, cy: 110, rx: 96, ry: 70, class: "tc-hs-vong-duong" });
    [[205, 50], [210, 168], [92, 172], [86, 52]].forEach(function (a) { svg(quay, "circle", { cx: a[0], cy: a[1], r: 4, class: "tc-hs-vong-cham" }); });
    var CHO = [[150, 40], [245, 110], [150, 180], [55, 110]];
    var o = CHO.map(function (p, k) {
      var e = svg(vc, "g", {}); svg(e, "rect", { x: p[0] - 52, y: p[1] - 16, width: 104, height: 32, rx: 8, class: "tc-hs-o" });
      return { e: e, chu: svg(e, "text", { x: p[0], y: p[1] + 4.5, "text-anchor": "middle", class: "tc-hs-o-chu" }, String(k + 1)) };
    });
    var vCap = tao("p", "tc-cap", ""); vCap.setAttribute("aria-live", "polite");
    var vHang = tao("div", "tc-hang"), tiep = 0;
    tron(t.vong.map(function (x, i) { return i; })).forEach(function (i) {
      var b = nut(t.vong[i], false);
      b.onclick = function () {
        if (i !== tiep) { vCap.textContent = t.vong_sai; b.classList.remove("tc-mm-rung"); b.getBoundingClientRect(); b.classList.add("tc-mm-rung"); return; }
        b.disabled = true; o[i].chu.textContent = t.vong[i]; o[i].e.classList.add("tc-hs-o-day"); tiep++;
        vCap.textContent = tiep < 4 ? dien(t.vong_buoc, { n: tiep }) : t.vong_xong;
        if (tiep === 4) quay.classList.add("tc-hs-xoay");
      };
      vHang.appendChild(b);
    });
    vong.appendChild(vSan); vong.appendChild(vHang); vong.appendChild(vCap);
    xem.onclick = function () {
      khoa = true; xem.hidden = true; tay.setAttribute("tabindex", "-1"); tay.classList.add("tc-hs-khoa");
      var x = px(d), Y = 236;
      svg(mocG, "line", { x1: x, x2: x, y1: BY - CAO, y2: H - 22, class: "tc-hs-ban" });
      svg(mocG, "text", { x: Math.max(40, Math.min(480, x)), y: H - 8, "text-anchor": "middle", class: "tc-hs-ban-chu" }, dien(t.nhan_ban, { d: so(d, 1) }));
      cap.textContent = t.ghi;
      g.moc.forEach(function (m, i) {
        m4Hen(s, function () {
          var mx = px(m.d), y = Y + i * 20, phai = m.d >= 1, e = svg(mocG, "g", { class: "tc-hs-moc" });
          svg(e, "line", { x1: mx, x2: mx, y1: BY, y2: y - 4, class: "tc-hs-moc-l" });
          svg(e, "circle", { cx: mx, cy: BY, r: 5, class: "tc-hs-moc-c" });
          var tx = svg(e, "text", { x: phai ? mx - 6 : mx + 6, y: y, "text-anchor": phai ? "end" : "start", class: "tc-hs-moc-t" });
          svg(tx, "tspan", { class: "tc-hs-gt" }, so(m.d, m.le) + " "); svg(tx, "tspan", {}, t.moc[i]);
          if (i === g.moc.length - 1) { m4Ket(ket, [dien(t.ket, { d: so(d, 1) })]); lai.hidden = false; vong.hidden = false; }
        }, 150 + i * 450);
      });
    };
    lai.onclick = function () { m4Lai(s, duongCongSigma, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); s.appendChild(vong); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: kéo ngày ôn trên đường cong nửa đời (p = 2^(−Δ/h); ôn xong bật về 100%, nửa đời dài ra; rồi thanh sai số Bảng 2) ----------
  // g.ngay: số ngày trục ngang; g.h0: nửa đời đầu; g.tang_som: hệ số tăng khi ôn quá sớm (minh họa); g.toi_thieu: số lần ôn để mở phần so;
  // g.sai_so: [5 số] cùng thứ tự t.mo_hinh; g.auc: [mới, cũ]; g.tu_dung: chỉ số đáp án đúng của t.tu_chon.
  function nuaDoiOnTu(g, t) {
    var s = khung(g, t), san = canh("tc-canh-toi"), W = 520, H = 312, c = svg(san, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": t.mo_ta });
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), xem = nut(t.nut_xem, true), lai = nut(t.nut_lai, false); xem.disabled = true; lai.hidden = true; hang.appendChild(xem); hang.appendChild(lai);
    var san2 = canh("tc-canh-toi"), c2 = svg(san2, "svg", { viewBox: "0 0 520 250", role: "img", "aria-label": t.mo_ta_cot }); san2.hidden = true;
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    var X0 = 52, X1 = 500, Y0 = 76, Y1 = 270, N = g.ngay;
    function px(d) { return X0 + d / N * (X1 - X0); }
    function py(p) { return Y1 - p * (Y1 - Y0); }
    function vd(x) { return (x - X0) / (X1 - X0) * N; }
    svg(c, "text", { x: 12, y: 24, class: "tc-mm-nho" }, t.truc_y);
    svg(c, "text", { x: 12, y: 46, class: "tc-nd-cong-thuc" }, "p = 2^(−Δ/h)");
    [[1, "100%"], [0.5, "50%"], [0, "0"]].forEach(function (a) { svg(c, "line", { x1: X0, x2: X1, y1: py(a[0]), y2: py(a[0]), class: a[0] === 0.5 ? "tc-nd-50" : "tc-nd-luoi" }); svg(c, "text", { x: X0 - 8, y: py(a[0]) + 4, "text-anchor": "end", class: "tc-mm-nho" }, a[1]); });
    svg(c, "line", { x1: X0, x2: X1, y1: py(0.9), y2: py(0.9), class: "tc-nd-90" });
    svg(c, "text", { x: X1, y: py(0.9) + 14, "text-anchor": "end", class: "tc-nd-nho-mo" }, t.nguong);
    for (var k = 0; k <= N; k += 2) svg(c, "text", { x: px(k), y: Y1 + 18, "text-anchor": "middle", class: "tc-mm-nho" }, k);
    svg(c, "text", { x: X1, y: Y1 + 36, "text-anchor": "end", class: "tc-mm-nho" }, t.truc_x);
    var cu = svg(c, "path", { class: "tc-nd-cu" }), nay = svg(c, "path", { class: "tc-nd-nay" }), dau = svg(c, "g", {});
    var the = svg(c, "g", { class: "tc-nd-the" }); m4Dat(the, 386, 8);
    svg(the, "rect", { x: 0, y: 0, width: 122, height: 52, rx: 8, class: "tc-nd-the-nen" });
    svg(the, "text", { x: 61, y: 22, "text-anchor": "middle", class: "tc-nd-the-tu" }, t.tu);
    var theH = svg(the, "text", { x: 61, y: 41, "text-anchor": "middle", class: "tc-nd-the-h" }, "");
    var tay = svg(c, "g", { class: "tc-keo tc-nd-tay", tabindex: "0", role: "slider", "aria-label": t.nhan_tay, "aria-valuemin": 0, "aria-valuemax": N });
    svg(tay, "circle", { r: 22, style: "fill:transparent" }); svg(tay, "circle", { r: 10, class: "tc-nd-cham" });
    var tayChu = svg(c, "text", { "text-anchor": "middle", class: "tc-nd-chu" }, "");
    var t0 = 0, h = g.h0, x = g.h0 * 0.5, lan = 0, het = false, khoa = false, luc = 0, vet = "";
    function so1(v) { return so(v, Math.abs(v - Math.round(v)) < 0.05 ? 0 : 1); }
    function p(d) { return Math.pow(2, -(d - t0) / h); }
    function doan(a, b, hh) { var q = ""; for (var d = a; d < b; d += 0.1) q += (q ? " L" : "M") + px(d).toFixed(1) + " " + py(Math.pow(2, -(d - a) / hh)).toFixed(1); return q + " L" + px(b).toFixed(1) + " " + py(Math.pow(2, -(b - a) / hh)).toFixed(1); }
    function ve() {
      nay.setAttribute("d", doan(t0, N, h));
      var pv = p(x); m4Dat(tay, px(x), py(pv)); tayChu.setAttribute("x", Math.max(60, Math.min(490, px(x)))); tayChu.setAttribute("y", py(pv) - 16); tayChu.textContent = so(pv * 100, 0) + "%";
      tay.setAttribute("aria-valuenow", x.toFixed(1)); tay.setAttribute("aria-valuetext", dien(t.gia_tri, { ngay: so1(x), p: so(pv * 100, 0) }));
      theH.textContent = dien(t.the_h, { h: so1(h) });
    }
    function datX(v) { x = Math.max(t0 + 0.2, Math.min(N, Math.round(v * 10) / 10)); ve(); }
    function on() {
      if (het || khoa) return; luc = Date.now();
      var pv = p(x), loai = pv < 0.5 ? "muon" : pv > 0.9 ? "som" : "vua", hMoi = h * (loai === "som" ? g.tang_som : 2);
      vet += (vet ? " " : "") + doan(t0, x, h) + " L" + px(x).toFixed(1) + " " + py(1);
      cu.setAttribute("d", vet);
      svg(dau, "circle", { cx: px(x), cy: py(pv), r: 6, class: "tc-nd-dau tc-nd-dau-" + loai });
      cap.textContent = dien(t[loai], { ngay: so1(x), p: so(pv * 100, 0), h: so1(hMoi) });
      t0 = x; h = hMoi; lan++;
      the.classList.remove("tc-nd-lat"); the.getBoundingClientRect(); the.classList.add("tc-nd-lat");
      if (t0 >= N - 0.3) { het = true; tay.style.display = "none"; tayChu.textContent = ""; cap.textContent += t.het; nay.setAttribute("d", ""); theH.textContent = dien(t.the_h, { h: so1(h) }); }
      else { x = Math.min(N, t0 + Math.max(0.5, h * 0.5)); ve(); }
      if (lan >= g.toi_thieu || het) xem.disabled = false;
    }
    ve();
    keoSvg(c, "g.tc-nd-tay", function (e, q) { if (het || khoa) return false; if (q) datX(vd(q.x)); }, function () { on(); });
    c.addEventListener("click", function (ev) {
      if (het || khoa || Date.now() - luc < 250 || (ev.target.closest && ev.target.closest("g.tc-nd-tay"))) return;
      var q = diemSvg(c, ev), d = vd(q.x); if (q.y < Y0 - 10 || q.y > Y1 + 10 || d <= t0 + 0.2 || d > N + 0.2) return; datX(d); on();
    });
    tay.addEventListener("keydown", function (ev) {
      if (het || khoa) return; var b = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[ev.key];
      if (b) { ev.preventDefault(); datX(x + b); } else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); on(); }
    });
    xem.onclick = function () {
      khoa = true; xem.hidden = true; tay.style.display = "none"; tayChu.textContent = ""; san2.hidden = false; cap.textContent = t.cap_cot;
      svg(c2, "text", { x: 10, y: 20, class: "tc-mm-nho" }, t.cot_tieu);
      var hang_ = g.sai_so.map(function (v, i) {
        var y = 34 + i * 34; svg(c2, "text", { x: 10, y: y + 15, class: "tc-nd-ten" + (i ? "" : " tc-nd-ten-moi") }, t.mo_hinh[i]);
        return { v: v, cot: svg(c2, "rect", { x: 170, y: y, width: 0, height: 22, rx: 4, class: "tc-nd-cot" + (i ? "" : " tc-nd-cot-moi") }), so: svg(c2, "text", { x: 176, y: y + 16, class: "tc-ch-so" }, "") };
      });
      var auc = svg(c2, "g", { opacity: "0", class: "tc-nd-auc" });
      svg(auc, "text", { x: 10, y: 218, class: "tc-nd-auc-chu" }, t.auc[0]);
      svg(auc, "text", { x: 10, y: 238, class: "tc-nd-auc-chu" }, dien(t.auc[1], { a: so(g.auc[0], 3), b: so(g.auc[1], 3) }));
      m4Chay(s, 1500, function (f) {
        hang_.forEach(function (r, i) { var ff = Math.max(0, Math.min(1, f * 1.4 - i * 0.08)), w = r.v / 0.45 * 290 * m4De(ff); r.cot.setAttribute("width", w); r.so.setAttribute("x", 176 + w); r.so.textContent = ff >= 1 ? so(r.v, 3) : ""; });
      }, function () {
        hang_.forEach(function (r) { r.so.textContent = so(r.v, 3); });
        m4Hen(s, function () {
          auc.setAttribute("opacity", "1"); m4Ket(ket, [t.ket]); lai.hidden = false;
          s.insertBefore(m4TuKiem(t.tu_hoi, t.tu_chon, g.tu_dung, t.tu_giai), s.querySelector(".tc-nguon"));
        }, 500);
      });
    };
    lai.onclick = function () { m4Lai(s, nuaDoiOnTu, g, t); };
    s.appendChild(san); s.appendChild(cap); s.appendChild(hang); s.appendChild(san2); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: đáp án hay gợi ý (bật 3 nhóm xem hai cột; kéo câu nhắc vào 2 ngăn; lưới 570 lần GPT-4 trả lời) ----------
  // g.lt, g.kt: điểm thô luyện tập/kiểm tra (%) của 3 nhóm; g.chip: [{nhom, cot: "lt"|"kt", chu, do}]; g.cau: ngăn đúng của t.cau; g.luoi: [đúng, lỗi logic, lỗi tính].
  function dapAnHayGoiY(g, t) {
    var s = khung(g, t);
    var bat = tao("div", "tc-hang tc-ai-bat");
    var san = canh("tc-canh-toi"), c = svg(san, "svg", { viewBox: "0 0 520 274", role: "img", "aria-label": t.mo_ta });
    var san2 = canh("tc-canh-toi"), c2 = svg(san2, "svg", { viewBox: "0 0 520 334", role: "img", "aria-label": t.mo_ta_cau }); san2.hidden = true;
    var san3 = canh("tc-canh-toi"), c3 = svg(san3, "svg", { viewBox: "0 0 520 250", role: "img", "aria-label": t.mo_ta_luoi }); san3.hidden = true;
    var cap = tao("p", "tc-cap", t.doc_mac); cap.setAttribute("aria-live", "polite");
    var hang = tao("div", "tc-hang"), chinh = nut(t.nut_chinh, true), kiem = nut(t.nut_kiem, true), luoiNut = nut(t.nut_luoi, true), lai = nut(t.nut_lai, false);
    [chinh, kiem, luoiNut, lai].forEach(function (b) { b.hidden = true; hang.appendChild(b); });
    var ket = tao("div", "tc-dap tc-ket"); ket.hidden = true;
    // Cảnh 1: hai cột mỗi nhóm
    var BY = 214, K = 2.1;
    svg(c, "rect", { x: 14, y: 12, width: 12, height: 12, rx: 2, class: "tc-ai-lt" }); svg(c, "text", { x: 32, y: 22, class: "tc-mm-nho" }, t.lt);
    svg(c, "rect", { x: 236, y: 12, width: 12, height: 12, rx: 2, class: "tc-ai-kt" }); svg(c, "text", { x: 254, y: 22, class: "tc-mm-nho" }, t.kt);
    svg(c, "line", { x1: 10, x2: 510, y1: BY, y2: BY, class: "tc-hs-truc" });
    var nhom = t.nhom.map(function (ten, i) {
      var cx = 96 + i * 164;
      svg(c, "text", { x: cx, y: BY + 22, "text-anchor": "middle", class: "tc-ai-ten" }, ten);
      if (i) { var b = svg(c, "g", { class: "tc-ai-chat" }); m4Dat(b, cx - 12, BY + 30); svg(b, "path", { d: "M0 4 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-12 l-5 5 v-5 h-0 a3 3 0 0 1 -3 -3 Z" }); svg(b, "text", { x: 12, y: 12, "text-anchor": "middle", class: "tc-ai-chat-chu" }, i === 1 ? "A" : "?"); }
      var lt = svg(c, "rect", { x: cx - 50, y: BY, width: 46, height: 0, rx: 3, class: "tc-ai-lt" }), kt = svg(c, "rect", { x: cx + 4, y: BY, width: 46, height: 0, rx: 3, class: "tc-ai-kt" });
      return { cx: cx, lt: lt, kt: kt, ltS: svg(c, "text", { x: cx - 27, y: BY - 6, "text-anchor": "middle", class: "tc-ai-so" }, ""), ktS: svg(c, "text", { x: cx + 27, y: BY - 6, "text-anchor": "middle", class: "tc-ai-so" }, ""), mo: false };
    });
    var chipG = svg(c, "g", {});
    function moc(i, f, cot) { var v = g[cot][i], hh = v * K * m4De(f), n = nhom[i]; n[cot].setAttribute("y", BY - hh); n[cot].setAttribute("height", hh); n[cot + "S"].setAttribute("y", BY - hh - 6); n[cot + "S"].textContent = f >= 1 ? v + "%" : ""; }
    var nutNhom = t.nhom.map(function (ten, i) {
      var b = nut(ten, false); b.setAttribute("aria-pressed", "false");
      b.onclick = function () {
        if (nhom[i].mo) return; nhom[i].mo = true; b.setAttribute("aria-pressed", "true"); b.classList.add("tc-ai-dang");
        cap.textContent = dien(t.mo_nhom, { ten: ten, a: g.lt[i], b: g.kt[i] });
        m4Chay(s, 700, function (f) { moc(i, f, "lt"); }, function () {
          m4Chay(s, 700, function (f) { moc(i, f, "kt"); }, function () {
            if (nhom.every(function (n) { return n.mo; }) && chinh.hidden && !chinh.dataset.xong) { cap.textContent = t.ca_ba; chinh.hidden = false; }
          });
        });
      };
      bat.appendChild(b); return b;
    });
    chinh.onclick = function () {
      chinh.hidden = true; chinh.dataset.xong = "1"; nutNhom.forEach(function (b) { b.disabled = true; });
      g.chip.forEach(function (ch, k) {
        var n = nhom[ch.nhom], v = g[ch.cot][ch.nhom], x = ch.cot === "lt" ? n.cx - 27 : n.cx + 27, y = BY - v * K - 40;
        var ng = svg(chipG, "g", {}); m4Dat(ng, x, y);
        var e = svg(ng, "g", { class: "tc-ai-chip" + (ch.do ? " tc-ai-chip-do" : "") });
        svg(e, "rect", { x: -27, y: -12, width: 54, height: 22, rx: 11 }); svg(e, "text", { x: 0, y: 4, "text-anchor": "middle" }, ch.chu);
        e.style.animationDelay = (k * 0.25) + "s";
      });
      cap.textContent = t.dieu_chinh;
      m4Hen(s, function () { san2.hidden = false; kiem.hidden = false; kiem.disabled = true; cap.textContent = t.hoi_cau; }, 900);
    };
    // Cảnh 2: kéo câu nhắc vào hai ngăn
    var BW = 240, BH = 40, khoa = false;
    var ngan = t.ngan.map(function (ten, k) {
      var x = 8 + k * 256, y = 172, w = 248, h = 154, e = svg(c2, "g", { class: "tc-ai-ngan", tabindex: "0", role: "button", "aria-label": ten });
      svg(e, "rect", { x: x, y: y, width: w, height: h, rx: 10, class: "tc-ai-hop tc-ai-hop-" + k });
      svg(e, "text", { x: x + w / 2, y: y + 20, "text-anchor": "middle", class: "tc-ai-hop-ten tc-ai-hop-ten-" + k }, ten);
      return { x: x, y: y, w: w, h: h, e: e };
    });
    var nha = [];
    for (var i = 0; i < t.cau.length; i++) nha.push({ x: i % 2 ? 268 : 12, y: 10 + Math.floor(i / 2) * 50 });
    var ns = tron(nha);
    var vat = t.cau.map(function (d, i) { return { i: i, e: m4The(c2, i, BW, BH, d.dong, d.full, "tc-ai-bong"), w: BW, h: BH, k: -1, nha: ns[i], dung: g.cau[i] }; });
    var xep = m4Xep(c2, { vat: vat, ngan: ngan, khoa: function () { return khoa; },
      slot: function (k, j, n) { var b = n > 3 ? 80 / (n - 1) : 40; return { x: ngan[k].x + 4, y: ngan[k].y + 30 + j * b }; },
      chon: function (v) { cap.textContent = dien(t.da_chon, { the: t.cau[v.i].full }); },
      doi: function (v) { var n = vat.filter(function (x) { return x.k >= 0; }).length; kiem.disabled = n < vat.length; cap.textContent = n === vat.length ? t.du : v.k >= 0 ? dien(t.da_dat, { the: t.cau[v.i].full, ngan: t.ngan[v.k] }) : t.hoi_cau; } });
    kiem.onclick = function () {
      khoa = true; kiem.hidden = true; var dung = 0;
      vat.forEach(function (v) { var ok = v.k === v.dung; if (ok) dung++; v.e.classList.add(ok ? "tc-ch-dung" : "tc-ch-sai"); });
      cap.textContent = dien(t.kiem_xong, { n: dung });
      m4Hen(s, function () { vat.forEach(function (v) { v.k = v.dung; }); xep.xepLai(true); luoiNut.hidden = false; }, 900);
    };
    // Cảnh 3: lưới 570 ô
    var tong = g.luoi[0] + g.luoi[1] + g.luoi[2], COT = 38, P = 13, LX = (520 - COT * P) / 2 + 1, o = [];
    for (var j = 0; j < tong; j++) o.push(svg(c3, "rect", { x: LX + (j % COT) * P, y: 12 + Math.floor(j / COT) * P, width: 11, height: 11, rx: 2, class: "tc-ai-o" }));
    var chuL = g.luoi.map(function (n, k) { var x = 14 + k * 168; svg(c3, "rect", { x: x, y: 222, width: 12, height: 12, rx: 2, class: "tc-ai-o-" + k }); return svg(c3, "text", { x: x + 18, y: 232, class: "tc-ai-luoi-chu" }, dien(t.luoi[k], { n: n })); });
    luoiNut.onclick = function () {
      luoiNut.hidden = true; san3.hidden = false; cap.textContent = t.cap_luoi; var da = 0;
      m4Chay(s, 1800, function (f) {
        var toi = Math.round(tong * f);
        for (; da < toi; da++) o[da].setAttribute("class", "tc-ai-o tc-ai-o-" + (da < g.luoi[0] ? 0 : da < g.luoi[0] + g.luoi[1] ? 1 : 2));
      }, function () { m4Ket(ket, [t.ket, t.moi]); lai.hidden = false; });
    };
    lai.onclick = function () { m4Lai(s, dapAnHayGoiY, g, t); };
    s.appendChild(bat); s.appendChild(san); s.appendChild(san2); s.appendChild(san3); s.appendChild(cap); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }
  // ==== ĐỢT 4 M KẾT THÚC ====
  var KHUON = { "quyet-dinh": quyetDinh, "doan": doan, "doan-so": doanSo, "phan-loai": phanLoai,
    "bac-thang": bacThang, "thu-tu": thuTu, "dem-cham": demCham, "phan-xa": phanXa, "dieu-khien": dieuKhien,
    "soi-loi": soiLoi, "hop-thu": hopThu, "ban-thai": banThai, "tri-nho": triNho, "dam-dong": damDong,
    "doan-tau": doanTau, "domino": domino, "pho-mai": phoMai, "lo-phan-ung": loPhanUng, "cho-keo": choKeo, "lap-rap": lapRap, "ten-lua": tenLua,
    "ve-duong": veDuong, "can-thang-bang": canThangBang, "chia-nhom": chiaNhom, "lan-theo-nguon": lanTheoNguon, "kim-tu-thap": kimTuThap, "xay-thap": xayThap,
    "dong-tien": dongTien, "doan-vi-tri": doanViTri, "nao-chia-doi": naoChiaDoi, "ban-tron": banTron, "hop-nhom": hopNhom, "nhan-chung": nhanChung,
    "cham-mu": chamMu, "hau-truong": hauTruong, "tong-dai": tongDai, "pheu": pheu, "ket-sat": ketSat, "nhap-vai": nhapVai };
  // ==== ĐỢT 4 M ĐĂNG KÝ ====
  KHUON["xep-cach-hoc"] = xepCachHoc;
  KHUON["duong-cong-sigma"] = duongCongSigma;
  KHUON["nua-doi-on-tu"] = nuaDoiOnTu;
  KHUON["dap-an-hay-goi-y"] = dapAnHayGoiY;
  // ==== HẾT ĐĂNG KÝ M ====
  // ==== ĐỢT 4 L ĐĂNG KÝ ====
  KHUON["lan-bien"] = lanBien;
  KHUON["ban-chat"] = banChat;
  KHUON["tua-tuan"] = tuaTuan;
  // ==== HẾT ĐĂNG KÝ L ====
  // ==== ĐỢT 4 K ĐĂNG KÝ ====
  KHUON["duong-cong-on"] = duongCongOn;
  KHUON["gom-cum"] = gomCum;
  KHUON["hai-duong-nho"] = haiDuongNho;
  // ==== HẾT ĐĂNG KÝ K ====
  // ==== ĐỢT 3 J ĐĂNG KÝ ====
  KHUON["van-cfc"] = vanCfc;
  KHUON["van-dau"] = vanDau;
  KHUON["thap-vay-ngan"] = thapVayNgan;
  KHUON["va-de"] = vaDe;
  // ==== HẾT ĐĂNG KÝ J ====
  // ==== ĐỢT 3 I ĐĂNG KÝ ====
  KHUON["thang-leo-thang"] = thangLeoThang;
  KHUON["vong-khoanh"] = vongKhoanh;
  KHUON["pho-ngan-hang"] = phoNganHang;
  // ==== HẾT ĐĂNG KÝ I ====
  // ==== ĐỢT 3 H ĐĂNG KÝ ====
  KHUON["ban-dieu-phoi"] = banDieuPhoi;
  KHUON["phong-may-y2k"] = phongMayY2k;
  KHUON["bom-bong-bong"] = bomBongBong;
  // ==== HẾT ĐĂNG KÝ H ====
  // ==== ĐỢT 2 F ĐĂNG KÝ ====
  KHUON["slide-giau-dong"] = slideGiauDong;
  KHUON["may-chu"] = mayChu;
  KHUON["buong-lai"] = buongLai;
  // ==== HẾT ĐĂNG KÝ F ====
  // ==== ĐỢT 2 E ĐĂNG KÝ ====
  KHUON["quy-dao"] = quyDao;
  KHUON["song-radio"] = songRadio;
  KHUON["tau-chim"] = tauChim;
  // ==== HẾT ĐĂNG KÝ E ====
  // ==== ĐỢT 2 G ĐĂNG KÝ ====
  KHUON["ly-gio-luyen"] = lyGioLuyen;
  KHUON["be-ca"] = beCa;
  // ==== HẾT ĐĂNG KÝ G ====
  // ==== ĐỢT 1 D ĐĂNG KÝ ====
  KHUON["may-photo"] = mayPhoto;
  KHUON["phong-asch"] = phongAsch;
  KHUON["lop-hoc"] = lopHoc;
  KHUON["bien-the"] = bienThe;
  // ==== HẾT ĐĂNG KÝ D ====
  // ==== ĐỢT 1 C ĐĂNG KÝ ====
  KHUON["ban-viec-do"] = banViecDo;
  KHUON["ban-mut"] = banMut;
  KHUON["mo-neo"] = moNeo;
  KHUON["san-bong"] = sanBong;
  // ==== HẾT ĐĂNG KÝ C ====
  // ==== ĐỢT 1 B ĐĂNG KÝ ====
  KHUON["vong-may"] = vongMay;
  KHUON["vong-quan-he"] = vongQuanHe;
  KHUON["cau-chuyen-chung"] = cauChuyenChung;
  KHUON["khoang-trong"] = khoangTrong;
  // ==== HẾT ĐĂNG KÝ B ====
  // ==== ĐỢT 1 A ĐĂNG KÝ ====
  KHUON["gay-bong"] = gayBong;
  KHUON["cung-dien"] = cungDien;
  KHUON["kenh-dong-chay"] = kenhDongChay;
  KHUON["ban-chu-y"] = banChuY;
  // ==== HẾT ĐĂNG KÝ A ====
  ds.forEach(function (g) {
    var lam = KHUON[g.khuon], t = g[en ? "en" : "vi"];
    var moc = document.getElementById(g.truoc || g.sau);
    if (!lam || !t || !moc) return;
    var s = lam(g, t);
    moc.parentNode.insertBefore(s, g.truoc ? moc : moc.nextSibling);
    // Thêm vào mục lục ngay cạnh phần mốc
    var a = document.querySelector('.toc a[href="#' + moc.id + '"]');
    if (a) {
      var l = tao("a", "tc-toc", t.nhan); l.href = "#" + g.id;
      a.parentNode.insertBefore(l, g.truoc ? a : a.nextSibling);
    }
  });
})();

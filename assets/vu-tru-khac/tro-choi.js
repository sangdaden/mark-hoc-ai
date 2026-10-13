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
      B.cho.forEach(function (v, i) { var ok = v.k === i; if (ok) d++; svg(vien, "rect", { x: cho[i].x - 3, y: cho[i].y - 3, width: W + 6, height: H + 6, rx: 8, class: ok ? "tc-vien-dung" : "tc-vien-sai" }); });
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
      B.cho.forEach(function (v, i) { var ok = v.k === i; if (ok) d++; svg(vien, "rect", { x: cho[i].x - 3, y: cho[i].y - 3, width: W + 6, height: H + 6, rx: 10, class: ok ? "tc-vien-dung" : "tc-vien-sai" }); });
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
    function thung(l, y) { return l.lo.some(function (h) { return Math.abs(y - (h.y + l.lech)) < h.r - 3; }); }
    function ve() {
      cx.fillStyle = mau("--tc-troi"); cx.fillRect(0, 0, W, H);
      cx.fillStyle = mau("--tc-dat"); cx.fillRect(0, 0, 70, H);
      cx.font = "700 13px system-ui, sans-serif"; cx.textAlign = "center"; cx.fillStyle = mau("--ink"); cx.fillText(t.gieng, 35, 22);
      cx.fillStyle = mau("--tc-thep"); cx.fillRect(650, 40, 60, 240); cx.fillStyle = "#fff"; cx.fillText(t.gian, 680, 165);
      lop.forEach(function (l, i) {
        cx.save(); cx.beginPath(); cx.rect(l.x - 18, 20, 36, H - 60); cx.clip();
        cx.fillStyle = mau("--tc-pho-mai"); cx.fillRect(l.x - 18, 20, 36, H - 60);
        l.lo.forEach(function (h) { cx.fillStyle = mau("--tc-troi"); cx.beginPath(); cx.ellipse(l.x, h.y + l.lech, 14, h.r, 0, 0, 7); cx.fill(); });
        cx.restore(); cx.strokeStyle = cam === l ? mau("--cam") : "rgba(0,0,0,.25)"; cx.lineWidth = cam === l ? 3 : 1.5; cx.strokeRect(l.x - 18, 20, 36, H - 60);
        cx.fillStyle = mau("--ink"); cx.font = "600 12px system-ui, sans-serif"; cx.fillText(t.lop[i], l.x, H - 18);
        cx.fillStyle = mau("--muted"); cx.fillText("⇕", l.x, 14);
      });
      hat.forEach(function (p) { cx.fillStyle = p.chet ? "rgba(120,120,120,.4)" : mau("--tc-sai"); cx.beginPath(); cx.arc(p.x, p.y, 4, 0, 7); cx.fill(); });
    }
    function buoc() {
      if (Math.random() < 0.45) hat.push({ x: 72, y: che === "that" ? 150 + (Math.random() - 0.5) * 70 : 40 + Math.random() * (H - 100), v: 2.2 + Math.random() * 1.2 });
      hat.forEach(function (p) {
        if (p.chet) { p.t--; return; } var nx = p.x + p.v;
        lop.forEach(function (l) { if (p.x < l.x - 18 && nx >= l.x - 18 && !thung(l, p.y)) { p.chet = true; p.t = 18; nx = l.x - 20; } });
        p.x = nx; if (p.x > 648) { p.toi = true; lot++; }
      });
      hat = hat.filter(function (p) { return !p.toi && !(p.chet && p.t < 0); });
      dem.textContent = dien(t.dem, { n: lot }); ve();
      if (chay) requestAnimationFrame(buoc);
    }
    // Chỉ chạy hạt khi khung đang hiện trên màn hình
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !chay) { chay = true; requestAnimationFrame(buoc); } else if (!v) chay = false; }).observe(cv);
    else { chay = true; requestAnimationFrame(buoc); }
    function dc(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; }
    cv.addEventListener("pointerdown", function (ev) { if (che !== "choi") return; var p = dc(ev); cam = lop.filter(function (l) { return Math.abs(p.x - l.x) < 34; })[0] || null; if (cam) { y0 = p.y; l0 = cam.lech; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); } });
    cv.addEventListener("pointermove", function (ev) { if (!cam) return; cam.lech = Math.max(-160, Math.min(160, l0 + dc(ev).y - y0)); });
    function bo() { cam = null; } cv.addEventListener("pointerup", bo); cv.addEventListener("pointercancel", bo);
    xem.onclick = function () {
      che = "that"; lot = 0; lop.forEach(function (l) { var h = l.lo[0]; h.r = 34; l.dich = 150 - h.y; });
      var k = 0; (function truot() { k++; lop.forEach(function (l) { l.lech += (l.dich - l.lech) * 0.15; }); if (k < 40) requestAnimationFrame(truot); })();
      ket.innerHTML = ""; ket.appendChild(document.createTextNode(t.mo_dau)); var ol = tao("ol"); t.ly_do.forEach(function (x) { ol.appendChild(tao("li", "", x)); }); ket.appendChild(ol);
      ket.appendChild(tao("p", "", t.ket)); ket.hidden = false;
    };
    tronL.onclick = function () { che = "choi"; gieo(); lot = 0; hat = []; ket.hidden = true; };
    s.appendChild(san); s.appendChild(hang); s.appendChild(ket); chanNguon(s, t);
    return s;
  }

  // ---------- Cảnh: lò phản ứng (rút/cắm thanh để giữ công suất, rồi nhấn nút dừng) ----------
  // g.thanh: số thanh vẽ (mỗi thanh = 2), g.toi_thieu, g.nguong (≤ thì nút dừng làm vọt), g.giay
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
    var P = 0, xe = 0, tg = 0, hen = null, pha = "nghi", cam = -1, yy;
    function soTrong() { return 2 * trong.filter(Boolean).length; }
    function datThanh(i, v) { trong[i] = v; thanh[i].style.transition = giam ? "" : "transform .2s"; thanh[i].setAttribute("transform", "translate(0," + (v ? 140 : 40) + ")"); }
    function hien() {
      var k = soTrong(), h = Math.min(150, 150 * P / 700); cot.setAttribute("y", 270 - h); cot.setAttribute("height", h); mw.textContent = Math.round(P);
      sang.style.opacity = Math.min(0.9, 0.1 + P / 900);
      bien.textContent = dien(t.bien, { n: k }) + (k < g.toi_thieu ? "  ⚠ " + dien(t.canh_bao, { m: g.toi_thieu }) : ""); bien.style.fill = k < g.toi_thieu ? "#fca5a5" : "#e2e8f0";
    }
    function moHinh() { var ra = N - soTrong() / 2; P += (Math.max(0, 40 + ra * 64 - xe * 260) - P) * 0.12; }
    for (i = 0; i < N; i++) datThanh(i, i % 4 !== 0);
    P = 40 + (N - soTrong() / 2) * 64; hien();
    c.addEventListener("pointerdown", function (ev) { var gg = ev.target.closest("g.tc-keo"); if (!gg || pha === "het") return; cam = thanh.indexOf(gg); yy = diemSvg(c, ev).y; c.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    c.addEventListener("pointerup", function (ev) { if (cam < 0) return; var dy = diemSvg(c, ev).y - yy; datThanh(cam, Math.abs(dy) < 6 ? !trong[cam] : dy > 0); cam = -1; hien(); });
    c.addEventListener("keydown", function (ev) { var gg = ev.target.closest && ev.target.closest("g.tc-keo"); if (!gg || pha === "het" || (ev.key !== "Enter" && ev.key !== " ")) return; ev.preventDefault(); var k = thanh.indexOf(gg); datThanh(k, !trong[k]); hien(); });
    bd.onclick = function () {
      bd.disabled = true; az.disabled = true; ket.hidden = true; pha = "thu"; tg = 0; xe = 0; sang.style.fill = "#38bdf8";
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
          ket.hidden = false; bd.disabled = false; pha = "nghi"; if (!vot) sang.style.fill = "#38bdf8";
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
    }
    th.oninput = capNhat; capNhat();
    var chay = false, no = null;
    function ghi(giay, chu) { var li = tao("li", "", (giay != null ? "T+" + so(giay, (String(giay).split(".")[1] || "").length) + " s · " : "") + chu); nhat.appendChild(li); }
    function khoi(x, y, mauK, r) { var o = svg(khoiKhop, "circle", { cx: x, cy: y, r: r || 6, style: "fill:" + mauK + ";opacity:.85" }); return o; }
    phong.onclick = function () {
      if (chay) return; chay = true; phong.disabled = true; th.disabled = true; nhat.innerHTML = ""; ket.hidden = true; khoiKhop.innerHTML = "";
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
            tau.setAttribute("opacity", "0"); ket.textContent = t.ket_that; ket.hidden = false; lai.hidden = false; chay = false; return;
          }
        } else if (tg > 85) {
          lua.setAttribute("opacity", "0"); ket.textContent = (f < 66 ? t.ket_vua : t.ket_am); ket.hidden = false; lai.hidden = false; chay = false; return;
        }
        requestAnimationFrame(bay);
      })(performance.now());
      ghi(0, that ? dien(t.phong_that, { f: f }) : dien(t.phong_khac, { f: f }));
    };
    lai.onclick = function () { lai.hidden = true; phong.disabled = false; th.disabled = false; ket.hidden = true; nhat.innerHTML = ""; khoiKhop.innerHTML = ""; tau.setAttribute("opacity", "1"); lua.setAttribute("opacity", "0"); datTau(200, 260); nen.removeAttribute("transform"); vet.forEach(function (o) { o.style.opacity = "0"; }); if (no) { no.remove(); no = null; } };
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
  var KHUON = { "quyet-dinh": quyetDinh, "doan": doan, "doan-so": doanSo, "phan-loai": phanLoai,
    "bac-thang": bacThang, "thu-tu": thuTu, "dem-cham": demCham, "phan-xa": phanXa, "dieu-khien": dieuKhien,
    "soi-loi": soiLoi, "hop-thu": hopThu, "ban-thai": banThai, "tri-nho": triNho, "dam-dong": damDong,
    "doan-tau": doanTau, "domino": domino, "pho-mai": phoMai, "lo-phan-ung": loPhanUng, "cho-keo": choKeo, "lap-rap": lapRap, "ten-lua": tenLua,
    "ve-duong": veDuong, "can-thang-bang": canThangBang, "chia-nhom": chiaNhom, "lan-theo-nguon": lanTheoNguon, "kim-tu-thap": kimTuThap, "xay-thap": xayThap,
    "dong-tien": dongTien, "doan-vi-tri": doanViTri, "nao-chia-doi": naoChiaDoi, "ban-tron": banTron, "hop-nhom": hopNhom, "nhan-chung": nhanChung,
    "cham-mu": chamMu, "hau-truong": hauTruong, "tong-dai": tongDai, "pheu": pheu, "ket-sat": ketSat, "nhap-vai": nhapVai };
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

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

  var KHUON = { "quyet-dinh": quyetDinh, "doan": doan, "doan-so": doanSo, "phan-loai": phanLoai,
    "bac-thang": bacThang, "thu-tu": thuTu, "dem-cham": demCham, "phan-xa": phanXa, "dieu-khien": dieuKhien,
    "soi-loi": soiLoi, "hop-thu": hopThu, "ban-thai": banThai, "tri-nho": triNho, "dam-dong": damDong,
    "doan-tau": doanTau, "domino": domino, "pho-mai": phoMai, "lo-phan-ung": loPhanUng, "cho-keo": choKeo, "lap-rap": lapRap, "ten-lua": tenLua,
    "ve-duong": veDuong, "can-thang-bang": canThangBang, "chia-nhom": chiaNhom, "lan-theo-nguon": lanTheoNguon, "kim-tu-thap": kimTuThap, "xay-thap": xayThap,
    "dong-tien": dongTien, "doan-vi-tri": doanViTri, "nao-chia-doi": naoChiaDoi, "ban-tron": banTron, "hop-nhom": hopNhom, "nhan-chung": nhanChung,
    "cham-mu": chamMu, "hau-truong": hauTruong, "tong-dai": tongDai, "pheu": pheu, "ket-sat": ketSat, "nhap-vai": nhapVai };
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

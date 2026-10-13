// Trò chơi tương tác trên trang đọc "Mark ở vũ trụ khác" (thí nghiệm, thảm họa).
// Dữ liệu từng bài ở data/vu-tru-khac-tro-choi.json; scripts/tao_vu_tru_khac.py chép phần của bài vào
// <script type="application/json" id="vtk-tro-choi"> và gắn file này trước doc.js (để mục lục có link "Chơi thử").
// Khuôn: quyet-dinh (bạn quyết định, biểu đồ chấm có nhóm ẩn), doan (quay số rồi đoán), doan-so (đoán một con số), phan-loai (kéo thả vào ngăn);
// bản 2 thêm: bac-thang (nhập vai), thu-tu (xếp dòng thời gian), dem-cham (thử chú ý), phan-xa (bấm giờ), dieu-khien (phòng điều khiển),
// soi-loi (soi tài liệu), hop-thu (hộp thư khẩn), ban-thai (máy tính bán thải), tri-nho (thử trí nhớ), dam-dong (áp lực đám đông).
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
  // g.buoc, g.toi_da, g.nguy (từ mức này tô đỏ); t.su_kien {mức: câu}, t.thuc [4 câu thúc], t.keu (câu lặp ở các mức nhỏ)
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
      if (t.su_kien[v]) noi(t.su_kien[v], "tc-nguoi");
      else if (t.keu && g.keu_tu <= v && v < g.keu_den && v % (2 * g.buoc) === g.buoc) noi(t.keu, "tc-nguoi");
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

  var KHUON = { "quyet-dinh": quyetDinh, "doan": doan, "doan-so": doanSo, "phan-loai": phanLoai,
    "bac-thang": bacThang, "thu-tu": thuTu, "dem-cham": demCham, "phan-xa": phanXa, "dieu-khien": dieuKhien,
    "soi-loi": soiLoi, "hop-thu": hopThu, "ban-thai": banThai, "tri-nho": triNho, "dam-dong": damDong };
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

/* Trò chơi "AI chơi game" (ai-choi-game.html, en/), series "AI chơi game giỏi thế nào".
   Trạm caro (video 434): bạn là X, máy là O; máy dùng minimax nhìn trước N nước (thanh kéo 1-9), ô trống có thể hiện
   điểm minimax đầy đủ (+1/0/−1 theo góc nhìn của bạn). Thế cờ trong video: X . O / . O . / . . X, chỉ ô 7 được +1.
   Trạm thuyền (video 437): người chơi đặt luật điểm, AI thử 24 kế hoạch (chạy thẳng, 1-22 vòng vịnh rồi về đích,
   chạy vòng mãi) trong 300 bước và chọn kế hoạch nhiều điểm nhất. Luật cũ: 860 (vòng mãi) so với 150 (chạy thẳng),
   kế hoạch có về đích cao nhất 830; luật đã sửa: chạy thẳng 210, vòng mãi 70 (khớp ket-qua/437.txt).
   Mở thẳng một trạm bằng ?tram=caro|thuyen hoặc #caro|#thuyen. Chữ ở thẻ <script id="ag-du-lieu">.
   Không gọi AI, không lưu gì ngoài vài sự kiện đếm (theo-doi.js). Chạy thử: ?do=thu, trạng thái ở window.__ag. */
(function () {
  "use strict";
  var goc = document.getElementById("ag"), nguon = document.getElementById("ag-du-lieu");
  if (!goc || !nguon) return;
  var D = JSON.parse(nguon.textContent), N = D.nhan;
  var LOC = D.lg === "en" ? "en-US" : "vi-VN";
  var muot = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var S = window.__ag = {};

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function so(n) { return Number(n).toLocaleString(LOC); }
  function thay(s, d) { return s.replace(/\{(\w+)\}/g, function (_, k) { return d[k]; }); }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }

  // ---------- chọn trạm ----------
  var nut = [].slice.call(goc.querySelectorAll("[data-tram]"));
  function moTram(id, bam) {
    if (!$("tram-" + id)) id = "caro";
    [].slice.call(goc.querySelectorAll(".ag-tram")).forEach(function (s) { s.hidden = s.id !== "tram-" + id; });
    nut.forEach(function (n) { n.setAttribute("aria-current", n.dataset.tram === id ? "true" : "false"); });
    if (bam) {
      try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
      do_("ai-game-tram", { tram: id });
    }
    if (id === "thuyen") veDuong();
  }
  nut.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });

  // ---------- trạm 1: caro 3x3 ----------
  var H = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var ban = $("cr-ban"), tb = $("cr-tb"), sau = $("cr-sau"), diemChk = $("cr-diem");
  var ty = { thang: 0, hoa: 0, thua: 0 };
  var C = { b: [], xong: false, dangNghi: false };
  S.caro = C;

  function thang(b) {
    for (var i = 0; i < H.length; i++) {
      var h = H[i];
      if (b[h[0]] && b[h[0]] === b[h[1]] && b[h[0]] === b[h[2]]) return { ai: b[h[0]], hang: h };
    }
    return null;
  }
  function day(b) { for (var i = 0; i < 9; i++) if (!b[i]) return false; return true; }

  // Minimax nhìn trước tối đa `con` nước, điểm theo góc nhìn của máy (O). Thắng sớm điểm cao hơn.
  var dem = 0;
  function mm(b, luot, con, buoc) {
    dem++;
    var w = thang(b);
    if (w) return w.ai === "O" ? 10 - buoc : buoc - 10;
    if (day(b) || con === 0) return 0;
    var tot = luot === "O" ? -99 : 99;
    for (var i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = luot;
      var d = mm(b, luot === "O" ? "X" : "O", con - 1, buoc + 1);
      b[i] = null;
      tot = luot === "O" ? Math.max(tot, d) : Math.min(tot, d);
    }
    return tot;
  }
  // Điểm hoàn hảo theo góc nhìn của X (người chơi): +1 / 0 / −1, có nhớ
  var nho = {};
  function hoanHao(b, luot) {
    var k = b.map(function (v) { return v || "."; }).join("") + luot;
    if (k in nho) return nho[k];
    var w = thang(b), r;
    if (w) r = w.ai === "X" ? 1 : -1;
    else if (day(b)) r = 0;
    else {
      r = luot === "X" ? -2 : 2;
      for (var i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = luot;
        var d = hoanHao(b, luot === "X" ? "O" : "X");
        b[i] = null;
        r = luot === "X" ? Math.max(r, d) : Math.min(r, d);
      }
    }
    nho[k] = r;
    return r;
  }

  function mayDanh() {
    var con = +sau.value, tot = -99, ds = [];
    dem = 0;
    for (var i = 0; i < 9; i++) {
      if (C.b[i]) continue;
      C.b[i] = "O";
      var d = mm(C.b, "X", con - 1, 1);
      C.b[i] = null;
      if (d > tot) { tot = d; ds = [i]; } else if (d === tot) ds.push(i);
    }
    C.b[ds[Math.floor(Math.random() * ds.length)]] = "O";
    $("cr-xet").textContent = thay(N.xet, { n: so(dem) });
  }

  function veCaro() {
    ban.textContent = "";
    var w = thang(C.b), het = !!w || day(C.b);
    var hien = diemChk.checked && !het && !C.dangNghi;
    for (var i = 0; i < 9; i++) {
      var v = C.b[i];
      var o = el("button", "ag-o-co" + (v ? " is-" + v : ""));
      o.type = "button";
      o.dataset.i = i;
      o.appendChild(el("span", "ag-o-so", String(i + 1)));
      if (v) o.appendChild(el("b", null, v));
      if (w && w.hang.indexOf(i) >= 0) o.classList.add("is-hang");
      o.disabled = !!v || het || C.dangNghi;
      var ten = N.o + " " + (i + 1) + (v ? ", " + v : "");
      if (hien && !v) {
        C.b[i] = "X";
        var d = hoanHao(C.b, "O");
        C.b[i] = null;
        var nhan = el("small", "ag-o-diem " + (d > 0 ? "is-xanh" : d < 0 ? "is-cam" : ""), d > 0 ? "+1" : d < 0 ? "−1" : "0");
        o.appendChild(nhan);
        ten += ", " + nhan.textContent;
      }
      o.setAttribute("aria-label", ten);
      ban.appendChild(o);
    }
    $("cr-chu-giai").hidden = !diemChk.checked;
    if (C.dangNghi) tb.textContent = N.may_nghi;
    else if (w) tb.textContent = w.ai === "X" ? (+sau.value >= 9 ? N.thang9 : thay(N.thang, { n: sau.value })) : N.thua;
    else if (het) tb.textContent = N.hoa;
    else if (!C.video) tb.textContent = N.x_luot;
    tb.className = "ag-tb" + (w ? (w.ai === "X" ? " is-xanh" : " is-cam") : "");
  }

  function ketThuc() {
    var w = thang(C.b);
    if (C.xong || (!w && !day(C.b))) return;
    C.xong = true;
    var k = w ? (w.ai === "X" ? "thang" : "thua") : "hoa";
    ty[k]++;
    $("cr-" + k).textContent = ty[k];
    do_("ai-game-caro-xong", { ket: k, nhin: String(sau.value) });
  }

  ban.addEventListener("click", function (e) {
    var o = e.target.closest(".ag-o-co");
    if (!o || o.disabled) return;
    var i = +o.dataset.i;
    if (C.b[i] || C.xong || C.dangNghi) return;
    C.video = false;
    C.b[i] = "X";
    if (thang(C.b) || day(C.b)) { ketThuc(); veCaro(); return; }
    C.dangNghi = true;
    veCaro();
    setTimeout(function () {
      mayDanh();
      C.dangNghi = false;
      ketThuc();
      veCaro();
      var dau = ban.querySelector(".ag-o-co:not([disabled])");
      if (document.activeElement === document.body && dau) dau.focus();
    }, muot ? 380 : 0);
  });

  function vanMoi(mayTruoc) {
    C.b = [null, null, null, null, null, null, null, null, null];
    C.xong = false; C.video = false; C.dangNghi = false;
    $("cr-xet").textContent = "";
    if (mayTruoc) mayDanh();
    veCaro();
  }
  function giaiSau() {
    var n = +sau.value;
    $("cr-sau-so").textContent = n;
    $("cr-sau-giai").textContent = N.sau[n === 1 ? 0 : n === 2 ? 1 : n <= 4 ? 2 : n <= 8 ? 3 : 4];
    sau.style.setProperty("--pt", ((n - 1) / 8 * 100) + "%");
  }
  sau.addEventListener("input", giaiSau);
  sau.addEventListener("change", function () { do_("ai-game-caro-nhin", { nhin: String(sau.value) }); });
  diemChk.addEventListener("change", function () { veCaro(); if (diemChk.checked) do_("ai-game-caro-diem"); });
  $("cr-moi").addEventListener("click", function () { vanMoi(false); });
  $("cr-may").addEventListener("click", function () { vanMoi(true); });
  $("cr-video").addEventListener("click", function () {
    C.b = ["X", null, "O", null, "O", null, null, null, "X"];
    C.xong = false; C.dangNghi = false; C.video = true;
    diemChk.checked = true;
    $("cr-xet").textContent = "";
    veCaro();
    tb.textContent = N.video;
    do_("ai-game-caro-video");
  });
  giaiSau();
  vanMoi(false);

  // ---------- trạm 2: thuyền đua lách luật ----------
  // Đường đua (viewBox 640x290): xuất phát S, ngã rẽ J, vịnh tròn tâm (200,118) bán kính 62, đích F.
  var NS = "http://www.w3.org/2000/svg";
  var T = 300, SV = { x: 40, y: 240 }, J = { x: 200, y: 240 }, F = { x: 600, y: 240 }, VC = { x: 200, y: 118 }, VR = 62;
  var L0 = { x: VC.x, y: VC.y + VR };
  var MT = [ // mục tiêu: loai "duong" (5 trên đường), "vao" (2 ở lối vào vịnh), "vinh" (3 trong vịnh, mọc lại)
    { id: "d1", loai: "duong", x: 262, y: 240 }, { id: "d2", loai: "duong", x: 332, y: 240 }, { id: "d3", loai: "duong", x: 402, y: 240 },
    { id: "d4", loai: "duong", x: 472, y: 240 }, { id: "d5", loai: "duong", x: 542, y: 240 },
    { id: "v1", loai: "vao", x: 200, y: 226 }, { id: "v2", loai: "vao", x: 200, y: 200 }
  ];
  [150, 270, 30].forEach(function (g, k) {
    var r = g * Math.PI / 180;
    MT.push({ id: "c" + (k + 1), loai: "vinh", x: VC.x + VR * Math.cos(r), y: VC.y + VR * Math.sin(r), goc: g });
  });

  // Mỗi kế hoạch thành danh sách bước: vị trí, tiến độ về đích (0-60), mục tiêu đụng ở bước đó
  function thang_(a, b, n, tien0, tien1, ds) {
    for (var k = 1; k <= n; k++) {
      var f = k / n, x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, cham = [];
      MT.forEach(function (m) {
        if (m.loai === "vinh") return;
        var truoc = (k - 1) / n, sau_ = f;
        var tm = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? (m.x - a.x) / (b.x - a.x) : (m.y - a.y) / (b.y - a.y);
        var tren = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? Math.abs(m.y - a.y) < 1 : Math.abs(m.x - a.x) < 1;
        if (tren && tm > truoc && tm <= sau_) cham.push(m.id);
      });
      ds.push({ x: x, y: y, tien: tien0 + (tien1 - tien0) * f, cham: cham });
    }
  }
  function vong(n, tien, ds) {
    for (var v = 0; v < n; v++) {
      for (var k = 1; k <= 10; k++) {
        var g0 = 90 + (k - 1) * 36, g1 = 90 + k * 36, r = g1 * Math.PI / 180, cham = [];
        MT.forEach(function (m) {
          if (m.loai !== "vinh") return;
          var g = m.goc < 90 ? m.goc + 360 : m.goc;
          if (g > g0 && g <= g1) cham.push(m.id);
        });
        ds.push({ x: VC.x + VR * Math.cos(r), y: VC.y + VR * Math.sin(r), tien: tien, cham: cham, vong: v + 1 });
      }
    }
  }
  function keHoach(loai, n) {
    var ds = [{ x: SV.x, y: SV.y, tien: 0, cham: [] }];
    if (loai === "thang") thang_(SV, F, 60, 0, 60, ds);
    else {
      thang_(SV, J, 10, 0, 10, ds);
      thang_(J, L0, 10, 10, 20, ds);
      vong(n, 20, ds);
      if (loai === "ve") { thang_(L0, J, 10, 20, 20 + 40 / 6, ds); thang_(J, F, 50, 20 + 40 / 6, 60, ds); }
    }
    return { loai: loai, n: n, buoc: ds, ve: loai !== "mai" };
  }
  var KE = [keHoach("thang", 0)];
  for (var x = 1; 80 + 10 * x <= T; x++) KE.push(keHoach("ve", x));
  KE.push(keHoach("mai", (T - 20) / 10));
  S.soKeHoach = KE.length; // 24

  function luat() { return { m: +$("th-m").value, moc: $("th-moc").checked, f: +$("th-f").value, gan: $("th-gan").checked }; }
  // Chấm điểm một kế hoạch theo luật: trả về điểm cộng dồn sau từng bước
  function cham(ke, L) {
    var da = {}, tot = 0, diem = 0, moc = [0];
    for (var k = 1; k < ke.buoc.length; k++) {
      var b = ke.buoc[k];
      b.cham.forEach(function (id) {
        var vinh = id.charAt(0) === "c";
        if (!(vinh && L.moc) && da[id]) return;
        da[id] = 1;
        diem += L.m;
      });
      if (L.gan) { var t = Math.floor(b.tien + 1e-9); if (t > tot) { diem += t - tot; tot = t; } }
      if (ke.ve && k === ke.buoc.length - 1) diem += L.f;
      moc.push(diem);
    }
    return moc;
  }
  function tinh() {
    var L = luat();
    var kq = KE.map(function (ke) { var m = cham(ke, L); return { ke: ke, diem: m[m.length - 1], moc: m }; });
    var tot = kq.slice().sort(function (a, b) {
      return b.diem - a.diem || (b.ke.ve - a.ke.ve) || (a.ke.buoc.length - b.ke.buoc.length);
    })[0];
    return { L: L, kq: kq, tot: tot };
  }
  function tenKe(ke) {
    return ke.loai === "thang" ? N.ke_thang : ke.loai === "mai" ? thay(N.ke_mai, { n: ke.n }) : thay(N.ke_vong, { n: ke.n });
  }

  var ve = $("th-ve"), Y = {}, thuyen, chay = null;
  function sv(tag, at, cha) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    (cha || ve).appendChild(e);
    return e;
  }
  function chu(x, y, s, cls) { var e = sv("text", { x: x, y: y, "class": cls || "ag-ve-chu" }); e.textContent = s; return e; }
  function veDuong() {
    if (ve.childNodes.length) return;
    sv("rect", { x: 0, y: 0, width: 640, height: 290, rx: 16, "class": "ag-ve-nuoc" });
    sv("path", { d: "M" + SV.x + " " + SV.y + "H" + F.x, "class": "ag-ve-duong" });
    sv("path", { d: "M" + J.x + " " + J.y + "V" + L0.y, "class": "ag-ve-duong ag-ve-re" });
    sv("circle", { cx: VC.x, cy: VC.y, r: VR, "class": "ag-ve-duong ag-ve-vinh" });
    chu(VC.x, VC.y + 5, N.vinh, "ag-ve-chu ag-ve-giua");
    for (var i = 0; i < 6; i++) for (var j = 0; j < 2; j++)
      sv("rect", { x: F.x - 6 + j * 6, y: F.y - 18 + i * 6, width: 6, height: 6, "class": (i + j) % 2 ? "ag-ve-co1" : "ag-ve-co2" });
    chu(F.x, F.y + 36, N.dich, "ag-ve-chu ag-ve-giua");
    chu(SV.x, SV.y + 36, N.bat_dau, "ag-ve-chu ag-ve-giua");
    MT.forEach(function (m) { Y[m.id] = sv("circle", { cx: m.x, cy: m.y, r: 7, "class": "ag-ve-mt" }); });
    thuyen = sv("g", { "class": "ag-ve-thuyen" });
    sv("path", { d: "M-14 -6 L10 -6 L16 0 L10 6 L-14 6 Z", "class": "ag-ve-than" }, thuyen);
    sv("path", { d: "M-6 -6 L-6 -24 L8 -8 Z", "class": "ag-ve-buom" }, thuyen);
    datThuyen(SV.x, SV.y, 0);
    var g = el("p", "ag-ghi-nho", N.mau);
    ve.parentNode.appendChild(g);
  }
  function datThuyen(x, y, goc_) { thuyen.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + goc_.toFixed(1) + ")"); }

  function veKe(R) {
    var ol = $("th-ke");
    ol.textContent = "";
    var tieu = [R.kq[0], R.kq[1], R.kq[R.kq.length - 2], R.kq[R.kq.length - 1]];
    if (tieu.indexOf(R.tot) < 0) tieu.push(R.tot);
    var lon = Math.max.apply(null, tieu.map(function (k) { return k.diem; })) || 1;
    tieu.forEach(function (k) {
      var li = el("li", "ag-ke-dong" + (k === R.tot ? " is-chon" : "") + (k.ke.ve ? "" : " is-mai"));
      var dau = el("span", "ag-ke-ten", tenKe(k.ke));
      if (k === R.tot) dau.appendChild(el("em", "ag-ke-tag", N.ai_chon));
      li.appendChild(dau);
      var th = el("span", "ag-ke-thanh"), i_ = el("i");
      i_.style.width = Math.max(0, k.diem / lon * 100) + "%";
      th.appendChild(i_);
      li.appendChild(th);
      li.appendChild(el("b", "ag-ke-diem", so(k.diem)));
      ol.appendChild(li);
    });
    ol.hidden = false;
  }
  function capNhat() {
    var L = luat();
    $("th-m-so").textContent = "+" + so(L.m) + " " + N.diem;
    $("th-f-so").textContent = "+" + so(L.f) + " " + N.diem;
    $("th-m").style.setProperty("--pt", (L.m / 20 * 100) + "%");
    $("th-f").style.setProperty("--pt", (L.f / 500 * 100) + "%");
    var R = tinh();
    S.thuyen = R;
    veKe(R);
    $("th-kq").hidden = true;
  }
  ["th-m", "th-f"].forEach(function (id) { $(id).addEventListener("input", capNhat); });
  ["th-moc", "th-gan"].forEach(function (id) { $(id).addEventListener("change", capNhat); });
  function mau(m, moc, f, gan) {
    $("th-m").value = m; $("th-moc").checked = moc; $("th-f").value = f; $("th-gan").checked = gan;
    capNhat();
  }
  $("th-cu").addEventListener("click", function () { mau(10, true, 100, false); do_("ai-game-thuyen-mau", { luat: "cu" }); });
  $("th-moi").addEventListener("click", function () { mau(10, false, 100, true); do_("ai-game-thuyen-mau", { luat: "moi" }); });

  function ketLuan(R) {
    var kq = $("th-kq"), t = R.tot, loai;
    kq.textContent = "";
    var thang0 = R.kq[0].diem;
    if (t.diem <= 0) loai = "khong";
    else if (!t.ke.ve) loai = "mai";
    else if (t.ke.n > 1) loai = "long";
    else loai = "tot";
    kq.className = "ag-kq is-" + loai;
    var p = el("p", null, loai === "mai" ? thay(N.kq_mai, { a: so(t.diem), b: so(thang0), x: thang0 > 0 ? (t.diem / thang0).toLocaleString(LOC, { maximumFractionDigits: 1 }) : "∞" })
      : loai === "long" ? thay(N.kq_long, { n: t.ke.n }) : loai === "tot" ? (t.ke.n === 1 ? N.kq_mot : N.kq_tot) : N.kq_khong);
    kq.appendChild(p);
    kq.hidden = false;
    var dat = loai === "tot";
    $("th-thach").classList.toggle("is-dat", dat);
    if (dat) {
      if (!$("th-dat")) { var d = el("p", "ag-dat", N.dat); d.id = "th-dat"; $("th-thach").appendChild(d); }
      if (!S.daDat) { S.daDat = true; do_("ai-game-thuyen-dat"); do_("hoc-xong", { loai: "ai-choi-game" }); }
    }
    do_("ai-game-thuyen-chay", { ket: loai });
  }

  $("th-chay").addEventListener("click", function () {
    veDuong();
    var R = tinh();
    S.thuyen = R;
    veKe(R);
    $("th-kq").hidden = true;
    if (chay) cancelAnimationFrame(chay);
    MT.forEach(function (m) { Y[m.id].classList.remove("is-het", "is-trung"); });
    var B = R.tot.diem > 0 ? R.tot.ke.buoc : [R.tot.ke.buoc[0]], moc = R.tot.moc, n = B.length - 1;
    var da = {}, buocTruoc = 0, bd = null, mot = 16;
    function den(k) {
      for (var i = buocTruoc + 1; i <= k; i++) {
        B[i].cham.forEach(function (id) {
          var c = Y[id];
          c.classList.remove("is-trung"); void c.getBBox(); c.classList.add("is-trung");
          if (!(id.charAt(0) === "c" && R.L.moc)) { if (da[id]) return; da[id] = 1; c.classList.add("is-het"); }
        });
      }
      buocTruoc = Math.max(buocTruoc, k);
      var a = B[Math.max(0, k - 1)], b = B[k];
      datThuyen(b.x, b.y, k ? Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI : 0);
      $("th-diem").textContent = so(moc[k] || 0);
      $("th-buoc").textContent = k;
      $("th-dich").textContent = k === n && R.tot.ke.ve && n > 0 ? N.dich_ok : N.dich_khong;
      $("th-dich").classList.toggle("is-xanh", k === n && R.tot.ke.ve && n > 0);
    }
    if (!muot || n === 0) { den(n); ketLuan(R); return; }
    function khung(ts) {
      if (bd === null) bd = ts;
      var k = Math.min(n, Math.floor((ts - bd) / mot));
      den(k);
      if (k < n) chay = requestAnimationFrame(khung);
      else { chay = null; ketLuan(R); }
    }
    den(0);
    chay = requestAnimationFrame(khung);
  });

  capNhat();
  var m = /[?&]tram=([\w-]+)/.exec(location.search), h = location.hash.replace("#", "");
  moTram((m && m[1]) || (document.getElementById("tram-" + h) ? h : "") || "caro", false);
})();

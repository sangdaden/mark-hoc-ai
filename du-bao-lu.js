/* Trò chơi "Phòng dự báo lũ" (du-bao-lu.html, en/), video 564 "Dự báo lũ sớm bảy ngày".
   Nước mưa = mm × km² × 1.000 m³; ra sông = × tỉ lệ của đất. Mực nước ngày d = nền + tăng[d] × (ra sông / 24 triệu)^mũ,
   nên mưa 120 mm, đất ẩm 40% ra đúng dãy 4,1 · 4,6 · 5,4 · 6,3 · 5,9 · 5,2 · 4,7 m của video. "Hồ xả nước" cộng thêm phần model không thấy.
   Biểu đồ 7 ngày + mặt cắt thung lũng (nước tràn từ lòng sông ra hai bên tới chỗ đất cao hơn mực nước).
   Dữ liệu: thẻ <script id="lu-du-lieu"> do scripts/trang/du-bao-lu.py tạo từ data/du-bao-lu.json. Trạng thái ở window.__lu. */
(function () {
  "use strict";
  var nguon = document.getElementById("lu-du-lieu");
  if (!nguon) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, SO = D.so, DAT = D.dat;
  var EN = document.documentElement.lang === "en";
  var NS = "http://www.w3.org/2000/svg";
  var S = { mm: 120, dat: "am", ho: false, ngay: 4, da_keo: false };
  window.__lu = S;
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function so(x, k) { var s = (k == null ? Math.round(x * 10) / 10 : x.toFixed(k)).toString(); return EN ? s : s.replace(".", ","); }
  function nghin(x) { return Math.round(x).toLocaleString(EN ? "en-US" : "vi-VN"); }
  function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function svg(tag, at, cha) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (cha) cha.appendChild(e);
    return e;
  }
  function chu(cha, x, y, s, at) {
    var e = svg("text", Object.assign({ x: x, y: y }, at || {}), cha);
    e.textContent = s;
    return e;
  }
  function datCua(id) { return DAT.filter(function (d) { return d.id === id; })[0]; }

  function tinh(mm, datId, ho) {
    var mua = mm * SO.luu_vuc_km2 * 1000 / 1e6;           // triệu m³
    var ra = mua * datCua(datId).ra_song;
    var k = Math.pow(ra / SO.goc_trieu_m3, SO.mu);
    var muc = SO.tang_m.map(function (x) { return Math.round((SO.nen_m + x * k) * 10) / 10; });
    var that = muc.map(function (m, i) { return Math.round((m + (ho ? SO.ho_xa_m[i] : 0)) * 10) / 10; });
    var vuot = -1;
    muc.forEach(function (m, i) { if (vuot < 0 && m >= SO.bao_dong[1]) vuot = i; });
    return { mua: mua, ra: ra, muc: muc, that: that, vuot: vuot };
  }
  // mức mưa nhỏ nhất (bước 10 mm) để đất ẩm vượt báo động 2
  var NGUONG = 20;
  while (NGUONG < 250 && tinh(NGUONG, "am", false).vuot < 0) NGUONG += 10;

  // ---------- Đoán trước ----------
  document.querySelectorAll("#lu-do-chon button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (S.da_doan) return;
      S.da_doan = true;
      var dung = +b.dataset.mm === NGUONG;
      document.querySelectorAll("#lu-do-chon button").forEach(function (x) {
        x.disabled = true;
        if (+x.dataset.mm === NGUONG) x.classList.add("is-dung"); else if (x === b) x.classList.add("is-sai");
      });
      var ph = document.getElementById("lu-do-ph");
      ph.textContent = dung ? N.do_dung : N.do_sai;
      ph.className = "lu-do-ph " + (dung ? "is-dung" : "is-sai");
      do_("lu-doan", { dung: dung ? "dung" : "sai" });
    });
  });

  // ---------- Điều khiển ----------
  var mm = document.getElementById("lu-mm");
  mm.addEventListener("input", function () { S.mm = +mm.value; veHet(); });
  mm.addEventListener("change", function () { if (!S.da_keo) { S.da_keo = true; do_("lu-keo"); } xongChua(); });
  document.querySelectorAll(".lu-dat").forEach(function (b) {
    b.addEventListener("click", function () { S.dat = b.dataset.dat; veHet(); do_("lu-dat", { dat: S.dat }); xongChua(); });
  });
  document.getElementById("lu-ho").addEventListener("change", function (e) { S.ho = e.target.checked; veHet(); if (S.ho) do_("lu-ho"); });
  var ngay = document.getElementById("lu-ngay");
  ngay.addEventListener("input", function () { S.ngay = +ngay.value; dungChay(); veCat(); });
  var chay = null;
  function dungChay() { if (chay) { clearInterval(chay); chay = null; } }
  document.getElementById("lu-chay").addEventListener("click", function () {
    dungChay();
    S.ngay = 1; ngay.value = 1; veCat();
    chay = setInterval(function () {
      if (S.ngay >= 7) { dungChay(); return; }
      S.ngay++; ngay.value = S.ngay; veCat();
    }, 700);
    do_("lu-chay");
  });
  function xongChua() {
    if (!S.xong && S.da_keo) { S.xong = true; do_("hoc-xong", { loai: "du-bao-lu" }); }
  }

  // ---------- Phép tính ----------
  function veTinh(k) {
    var o = document.getElementById("lu-tinh");
    o.innerHTML = "";
    var o1 = [[N.mua, S.mm + " mm"], [N.luu_vuc, nghin(SO.luu_vuc_km2) + " km²"], [N.nuoc_mua, so(k.mua) + " " + N.trieu_m3], [N.ra_song + " (" + Math.round(datCua(S.dat).ra_song * 100) + "%)", so(k.ra) + " " + N.trieu_m3]];
    o1.forEach(function (x, i) {
      var d = document.createElement("div");
      d.className = "lu-o" + (i === 3 ? " is-chinh" : "");
      var s = document.createElement("small"); s.textContent = x[0];
      var b = document.createElement("b"); b.textContent = x[1];
      d.appendChild(s); d.appendChild(b);
      o.appendChild(d);
      if (i < 3) { var dau = document.createElement("span"); dau.className = "lu-dau"; dau.setAttribute("aria-hidden", "true"); dau.textContent = i === 0 ? "×" : (i === 1 ? "=" : "→"); o.appendChild(dau); }
    });
  }

  // ---------- Biểu đồ 7 ngày ----------
  var Y0 = 3.5, Y1 = 10;
  function veBieu(k) {
    var g = document.getElementById("lu-bieu");
    g.innerHTML = "";
    // vẽ theo đúng bề rộng thật để chữ không bị thu nhỏ trên điện thoại
    var VW = Math.round(Math.max(330, Math.min(640, g.clientWidth || 640)));
    g.setAttribute("viewBox", "0 0 " + VW + " 316");
    var X = 46, W = VW - X - 84, T = 16, H = 236;
    function y(m) { return T + H - (Math.min(Y1, Math.max(Y0, m)) - Y0) / (Y1 - Y0) * H; }
    for (var m = 4; m <= 10; m++) {
      svg("line", { x1: X, x2: X + W, y1: y(m), y2: y(m), "class": "lu-luoi" }, g);
      chu(g, X - 8, y(m) + 4, m + " m", { "class": "lu-truc", "text-anchor": "end" });
    }
    SO.bao_dong.forEach(function (m, i) {
      svg("line", { x1: X, x2: X + W, y1: y(m), y2: y(m), "class": "lu-bd lu-bd-" + (i + 1) }, g);
      chu(g, X + W + 8, y(m) - 2, N.bd[i], { "class": "lu-bd-chu lu-bd-chu-" + (i + 1) });
      chu(g, X + W + 8, y(m) + 12, so(m, 1) + " m", { "class": "lu-bd-chu lu-bd-chu-" + (i + 1) });
    });
    var cot = W / 7;
    k.muc.forEach(function (m, i) {
      var cx = X + cot * i + cot / 2;
      svg("rect", { x: cx - cot * 0.3, y: y(m), width: cot * 0.6, height: T + H - y(m), rx: 6, "class": "lu-cot" + (m >= SO.bao_dong[1] ? " is-vuot" : "") + (i + 1 === S.ngay ? " is-chon" : "") }, g);
      chu(g, cx, y(m) - 7, so(m, 1), { "class": "lu-cot-so", "text-anchor": "middle" });
      if (i === 0 && cot < 54) chu(g, X, T + H + 40, N.ngay.replace("{n}", "1-7"), { "class": "lu-truc" });
      chu(g, cx, T + H + 22, cot < 54 ? String(i + 1) : (i === 0 ? N.hom_nay : f(N.ngay, { n: i + 1 })), { "class": "lu-truc", "text-anchor": "middle" });
    });
    if (S.ho) {
      var d = k.that.map(function (m, i) { return (i ? "L" : "M") + (X + cot * i + cot / 2) + " " + y(m); }).join(" ");
      svg("path", { d: d, "class": "lu-that" }, g);
      k.that.forEach(function (m, i) { svg("circle", { cx: X + cot * i + cot / 2, cy: y(m), r: 4.5, "class": "lu-that-cham" }, g); });
    }
    var kl = document.getElementById("lu-kl");
    var dinh = 0;
    k.muc.forEach(function (m, i) { if (m > k.muc[dinh]) dinh = i; });
    var cau = k.vuot < 0 ? N.khong_vuot : (k.vuot === 0 ? N.vuot_ngay : f(N.vuot, { d: k.vuot + 1, n: k.vuot }));
    kl.innerHTML = "";
    var b = document.createElement("b"); b.textContent = cau;
    kl.appendChild(b);
    kl.appendChild(document.createTextNode(" · " + f(N.dinh, { m: so(k.muc[dinh], 1), d: dinh + 1 })));
    kl.className = "lu-kl " + (k.vuot < 0 ? "is-an" : "is-vuot");
  }

  // ---------- Mặt cắt thung lũng ----------
  var DIEM = SO.nha.map(function (n) { return [n.x, n.cao]; }).concat([[0, 9.6], [1, 9.8], [0.41, 4.9], [0.44, 2.6], [0.56, 2.6], [0.59, 4.9]]);
  DIEM.sort(function (a, b) { return a[0] - b[0]; });
  function dat(x) {
    for (var i = 1; i < DIEM.length; i++) {
      if (x <= DIEM[i][0]) { var a = DIEM[i - 1], b = DIEM[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] || 1); }
    }
    return DIEM[DIEM.length - 1][1];
  }
  function veCat() {
    var k = tinh(S.mm, S.dat, S.ho);
    var muc = (S.ho ? k.that : k.muc)[S.ngay - 1];
    var g = document.getElementById("lu-cat");
    g.innerHTML = "";
    var W = Math.round(Math.max(330, Math.min(640, g.clientWidth || 640))), T = 24, H = 210, CY0 = 2, CY1 = 10;
    g.setAttribute("viewBox", "0 0 " + W + " 260");
    function y(m) { return T + H - (m - CY0) / (CY1 - CY0) * H; }
    // nước: từ lòng sông lan ra hai bên tới chỗ đất cao hơn mực nước
    var n = 320, trai = 0.5, phai = 0.5;
    while (trai > 0 && dat(trai - 1 / n) < muc) trai -= 1 / n;
    while (phai < 1 && dat(phai + 1 / n) < muc) phai += 1 / n;
    var d = "M" + trai * W + " " + y(muc);
    for (var i = Math.round(trai * n); i <= Math.round(phai * n); i++) d += " L" + (i / n * W) + " " + y(Math.min(muc, dat(i / n)));
    d += " L" + phai * W + " " + y(muc) + " Z";
    var dd = "M0 " + (T + H + 10);
    for (var j = 0; j <= n; j++) dd += " L" + (j / n * W) + " " + y(dat(j / n));
    dd += " L" + W + " " + (T + H + 10) + " Z";
    svg("path", { d: dd, "class": "lu-dat-hinh" }, g);
    svg("path", { d: d, "class": "lu-nuoc" }, g);
    svg("line", { x1: 0, x2: W, y1: y(SO.bao_dong[1]), y2: y(SO.bao_dong[1]), "class": "lu-bd lu-bd-2" }, g);
    chu(g, 8, y(SO.bao_dong[1]) - 5, N.bd[1] + " · " + so(SO.bao_dong[1], 1) + " m", { "class": "lu-bd-chu lu-bd-chu-2" });
    var ngap = 0;
    SO.nha.forEach(function (nh) {
      var x = nh.x * W, yy = y(nh.cao), u = nh.cao < muc && nh.x > trai && nh.x < phai;
      if (u) ngap++;
      var nha = svg("g", { "class": "lu-nha-h" + (u ? " is-ngap" : ""), transform: "translate(" + x + " " + yy + ")" }, g);
      svg("rect", { x: -11, y: -18, width: 22, height: 18, rx: 2 }, nha);
      svg("path", { d: "M-14 -17 L0 -30 L14 -17 Z" }, nha);
      svg("rect", { x: -3, y: -9, width: 6, height: 9, "class": "lu-cua" }, nha);
    });
    chu(g, W / 2, y(muc) - 8, so(muc, 1) + " m", { "class": "lu-muc-chu", "text-anchor": "middle" });
    document.getElementById("lu-ngay-chu").textContent = N.xem_ngay + ": " + (S.ngay === 1 ? N.hom_nay : f(N.ngay, { n: S.ngay }));
    document.getElementById("lu-nha").textContent = ngap ? f(N.nha_ngap, { n: ngap, t: SO.nha.length }) : N.nha_kho;
    document.getElementById("lu-nha").className = "lu-nha" + (ngap ? " is-ngap" : "");
    var cot = document.querySelectorAll("#lu-bieu .lu-cot");
    cot.forEach(function (c, i) { c.classList.toggle("is-chon", i + 1 === S.ngay); });
  }

  function veHet() {
    var k = tinh(S.mm, S.dat, S.ho);
    document.getElementById("lu-mm-chu").textContent = S.mm + " mm";
    document.querySelectorAll(".lu-dat").forEach(function (b) {
      var on = b.dataset.dat === S.dat;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.getElementById("lu-ho-chu").hidden = !S.ho;
    veTinh(k);
    veBieu(k);
    veCat();
  }

  var rongCu = 0;
  addEventListener("resize", function () {
    var r = document.getElementById("lu-bieu").clientWidth;
    if (Math.abs(r - rongCu) > 20) { rongCu = r; veHet(); }
  });
  document.querySelectorAll("[data-so-video]").forEach(function (a) {
    a.addEventListener("click", function () { do_("lu-xem-video", { so: a.getAttribute("data-so-video") }); });
  });
  veHet();
})();

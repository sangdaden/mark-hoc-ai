/* Trò chơi "Bàn tách giọng ca" (tach-giong-nhac.html, en/), video 555 "Tách giọng ca và nhạc nền".
   1. Bàn trộn: trình duyệt tự tổng hợp một đoạn nhạc hư cấu 4 rãnh (giọng, trống, bass, đàn) bằng WebAudio; bật tắt từng rãnh.
   2. Ảnh phổ: lưới ô tính sẵn từ chính các nốt của bài (giọng cam, nhạc xanh); chạm ô xem năng lượng × mặt nạ = phần giọng. Đố nhanh ô 8 × 0,5.
   3. Máy tách: bản trộn / chỉ giọng / karaoke. "Phần còn sót" phụ thuộc mức học của model, đàn cùng dải và tiếng vang;
      âm thanh nghe được đúng theo con số đó (phần sót được trộn lại với mức tương ứng, kèm tiếng lạo xạo).
   Không gọi AI, không tải bản thu nào, không lưu gì ngoài vài sự kiện đếm (theo-doi.js). Trạng thái ở window.__tg. */
(function () {
  "use strict";
  var nguon = document.getElementById("tg-du-lieu");
  if (!nguon) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, RANG = D.rang;
  var EN = document.documentElement.lang === "en";
  var S = { bat: {}, che_do: "tron", muc: 1, cung_dai: false, vang: false, dang_phat: false, da_tach: {} };
  RANG.forEach(function (r) { S.bat[r.id] = true; });
  window.__tg = S;
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function so(x) { var s = String(Math.round(x * 10) / 10); return EN ? s : s.replace(".", ","); }
  function el(tag, cls, chu) { var e = document.createElement(tag); if (cls) e.className = cls; if (chu != null) e.textContent = chu; return e; }

  // ---------- Bài nhạc hư cấu: 100 BPM, 4 ô nhịp, mỗi bước là một móc đơn ----------
  var BUOC = 0.3, SO_BUOC = 32;
  var HOP_AM = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];   // C, Am, F, G
  var GOC_BASS = [36, 33, 29, 31];
  var GIAI_DIEU = [  // [nốt midi, bước bắt đầu (0-31), số bước]
    [64, 0, 2], [67, 2, 2], [69, 4, 2], [67, 6, 2],
    [64, 8, 2], [60, 10, 2], [62, 12, 4],
    [60, 16, 2], [62, 18, 2], [64, 20, 2], [65, 22, 2],
    [64, 24, 3], [62, 27, 1], [62, 28, 4]
  ];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // ---------- Âm thanh ----------
  var A = null;
  function taoAmThanh() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    var ctx = new Ctx();
    var nen = ctx.createDynamicsCompressor();
    nen.connect(ctx.destination);
    var tong = ctx.createGain(); tong.gain.value = 0.8; tong.connect(nen);
    var phanTichTron = ctx.createAnalyser(); phanTichTron.fftSize = 1024; tong.connect(phanTichTron);
    var r = {};
    RANG.forEach(function (x) {
      var vao = ctx.createGain();
      var bat = ctx.createGain();       // bàn trộn: bật / tắt
      var tach = ctx.createGain();      // máy tách: mức giữ lại của rãnh này
      var pt = ctx.createAnalyser(); pt.fftSize = 1024;
      vao.connect(bat); bat.connect(pt); bat.connect(tach); tach.connect(tong);
      r[x.id] = { vao: vao, bat: bat, tach: tach, pt: pt };
    });
    // tiếng vang của phòng thu chỉ dội lên giọng
    var tre = ctx.createDelay(1); tre.delayTime.value = 0.23;
    var hoi = ctx.createGain(); hoi.gain.value = 0.42;
    var uot = ctx.createGain(); uot.gain.value = 0;
    var vaoVang = ctx.createGain();
    vaoVang.connect(tre); tre.connect(hoi); hoi.connect(tre); tre.connect(uot); uot.connect(r.giong.bat);
    // tiếng lạo xạo khi tách chưa sạch
    var nhieu = ctx.createBufferSource(); nhieu.buffer = bufNhieu(ctx, 2); nhieu.loop = true;
    var locNhieu = ctx.createBiquadFilter(); locNhieu.type = "bandpass"; locNhieu.frequency.value = 2600; locNhieu.Q.value = 0.8;
    var rung = ctx.createGain(); rung.gain.value = 0;
    var lfo = ctx.createOscillator(); lfo.type = "square"; lfo.frequency.value = 13;
    var lfoG = ctx.createGain(); lfoG.gain.value = 0.5;
    var xao = ctx.createGain(); xao.gain.value = 0;
    nhieu.connect(locNhieu); locNhieu.connect(rung); lfo.connect(lfoG); lfoG.connect(rung.gain); rung.connect(xao); xao.connect(tong);
    nhieu.start(); lfo.start();
    return { ctx: ctx, r: r, ptTron: phanTichTron, vaoVang: vaoVang, uot: uot, xao: xao, nhieuBuf: bufNhieu(ctx, 1), buoc: 0, ke: 0, hen: null };
  }
  function bufNhieu(ctx, giay) {
    var b = ctx.createBuffer(1, ctx.sampleRate * giay, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function vo(dich, t0, t1, muc, lenMs) {
    var g = A.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(muc, t0 + (lenMs || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    g.connect(dich);
    return g;
  }
  function trong(t, loai) {
    var c = A.ctx, d = A.r.trong.vao;
    if (loai === "kick") {
      var o = c.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      o.connect(vo(d, t, t + 0.32, 0.9)); o.start(t); o.stop(t + 0.35);
      return;
    }
    var n = c.createBufferSource(); n.buffer = A.nhieuBuf;
    var f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = loai === "snare" ? 1400 : 7000;
    n.connect(f); f.connect(vo(d, t, t + (loai === "snare" ? 0.17 : 0.045), loai === "snare" ? 0.5 : 0.14));
    n.start(t); n.stop(t + 0.2);
  }
  function bass(t, m, dai) {
    var o = A.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = hz(m);
    o.connect(vo(A.r.bass.vao, t, t + dai, 0.55, 0.015)); o.start(t); o.stop(t + dai + 0.05);
  }
  function dan(t, hop) {
    var len = S.cung_dai ? 24 : 0;  // đàn cùng dải: lên hai quãng tám, đúng vùng giọng hát
    hop.forEach(function (m) {
      [["triangle", 0.16], ["sine", 0.1]].forEach(function (k) {
        var o = A.ctx.createOscillator(); o.type = k[0]; o.frequency.value = hz(m + len) * (k[0] === "sine" ? 2 : 1);
        o.connect(vo(A.r.dan.vao, t, t + 0.55, k[1], 0.008)); o.start(t); o.stop(t + 0.6);
      });
    });
  }
  function giong(t, m, dai) {
    var c = A.ctx;
    var o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m);
    var rung = c.createOscillator(); rung.frequency.value = 5.6;
    var rungG = c.createGain(); rungG.gain.value = hz(m) * 0.012;
    rung.connect(rungG); rungG.connect(o.frequency);
    var env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
    env.gain.setValueAtTime(0.5, t + dai - 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dai);
    o.connect(env);
    [[730, 7, 1], [1150, 9, 0.6], [2600, 10, 0.25]].forEach(function (f) {  // ba formant cho tiếng "a"
      var b = c.createBiquadFilter(); b.type = "bandpass"; b.frequency.value = f[0]; b.Q.value = f[1];
      var g = c.createGain(); g.gain.value = f[2] * 1.6;
      env.connect(b); b.connect(g); g.connect(A.r.giong.vao); g.connect(A.vaoVang);
    });
    o.start(t); rung.start(t); o.stop(t + dai + 0.02); rung.stop(t + dai + 0.02);
  }
  function henBuoc(i, t) {
    var o = Math.floor(i / 8), b = i % 8;
    if (b === 0 || b === 4) trong(t, "kick");
    if (b === 2 || b === 6) trong(t, "snare");
    trong(t, "hat");
    if (b === 0 || b === 3 || b === 4 || b === 6) bass(t, GOC_BASS[o] + (b === 6 ? 12 : 0), BUOC * (b === 0 ? 2.6 : 1.6));
    if (b % 2 === 0) dan(t, HOP_AM[o]);
    GIAI_DIEU.forEach(function (n) { if (n[1] === i) giong(t, n[0], n[2] * BUOC); });
  }
  function lich() {
    while (A.ke < A.ctx.currentTime + 0.12) {
      henBuoc(A.buoc, A.ke);
      A.buoc = (A.buoc + 1) % SO_BUOC;
      A.ke += BUOC;
    }
  }
  function phat() {
    if (!A) A = taoAmThanh();
    if (!A) return;
    if (A.ctx.state === "suspended") A.ctx.resume();
    S.dang_phat = true;
    A.buoc = 0; A.ke = A.ctx.currentTime + 0.06;
    lich();
    A.hen = setInterval(lich, 30);
    apDung();
    requestAnimationFrame(ve);
    nutPhat();
    capNhatMay();
    do_("tg-phat");
  }
  function dung() {
    S.dang_phat = false;
    if (A) { clearInterval(A.hen); A.ctx.suspend(); }
    nutPhat();
    capNhatMay();
  }
  function nutPhat() {
    document.getElementById("tg-phat-chu").textContent = S.dang_phat ? N.dung : N.phat;
    document.querySelector(".tg-phat-ic").textContent = S.dang_phat ? "❚❚" : "▶";
  }

  // ---------- Máy tách: phần còn sót ----------
  var SOT_GOC = [0.55, 0.35, 0.2, 0.11, 0.06];
  function sot() {
    var x = SOT_GOC[S.muc] * (1 + (S.cung_dai ? 1.3 : 0) + (S.vang ? 0.8 : 0));
    return Math.min(0.85, x);
  }
  function apDung() {
    var s = sot();
    if (!A) return;
    var t = A.ctx.currentTime;
    RANG.forEach(function (x) {
      A.r[x.id].bat.gain.setTargetAtTime(S.bat[x.id] ? 1 : 0, t, 0.02);
      var giu = 1;
      if (S.che_do === "giong") giu = x.id === "giong" ? 1 : s * 0.9;
      if (S.che_do === "karaoke") giu = x.id === "giong" ? s : 1;
      A.r[x.id].tach.gain.setTargetAtTime(giu, t, 0.03);
    });
    A.uot.gain.setTargetAtTime(S.vang ? 0.5 : 0, t, 0.05);
    A.xao.gain.setTargetAtTime(S.che_do === "tron" ? 0 : s * 0.22, t, 0.05);
  }

  // ---------- Vẽ sóng ----------
  var buf = new Uint8Array(1024);
  function veSong(cv, pt, mau, mo) {
    var g = cv.getContext("2d"), w = cv.width, h = cv.height;
    g.clearRect(0, 0, w, h);
    g.globalAlpha = mo ? 1 : 0.25;
    g.strokeStyle = mau; g.lineWidth = 2.5;
    g.beginPath();
    if (pt && S.dang_phat) pt.getByteTimeDomainData(buf); else buf.fill(128);
    for (var i = 0; i < w; i++) {
      var v = (buf[Math.floor(i / w * buf.length)] - 128) / 128;
      var y = h / 2 + v * h * 0.9;
      if (i) g.lineTo(i, y); else g.moveTo(i, y);
    }
    g.stroke();
  }
  function ve() {
    document.querySelectorAll(".tg-rang").forEach(function (d) {
      var id = d.dataset.rang;
      veSong(d.querySelector("canvas"), A && A.r[id].pt, d.style.getPropertyValue("--mau"), S.bat[id]);
    });
    veSong(document.getElementById("tg-song-tron"), A && A.ptTron, getComputedStyle(document.documentElement).getPropertyValue("--blue") || "#2563EB", true);
    if (S.dang_phat) requestAnimationFrame(ve);
  }

  // ---------- 1. Bàn trộn ----------
  document.getElementById("tg-phat").addEventListener("click", function () { if (S.dang_phat) dung(); else phat(); });
  document.querySelectorAll(".tg-bat").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.rang;
      S.bat[id] = !S.bat[id];
      b.setAttribute("aria-pressed", S.bat[id] ? "true" : "false");
      b.querySelector("small").textContent = S.bat[id] ? N.bat : N.tat;
      b.closest(".tg-rang").classList.toggle("is-tat", !S.bat[id]);
      apDung();
      if (!S.dang_phat) { phat(); }
      if (!S.dang_phat) ve();
      do_("tg-rang", { rang: id, bat: S.bat[id] ? "bat" : "tat" });
    });
  });

  // ---------- 2. Ảnh phổ ----------
  var COT = 16, HANG = 9;
  var pho = document.getElementById("tg-pho"), theO = document.getElementById("tg-o-the");
  function tinhPho() {
    // mỗi cột = 2 bước nhạc; hàng 0 là cao nhất. Giọng ở hàng 1-4 theo giai điệu, nhạc ở hàng 5-8 (bass, đàn) và một ít ở trên
    var o = [];
    for (var c = 0; c < COT; c++) {
      var buoc = c * 2, nhip = Math.floor(buoc / 8);
      var not = null;
      GIAI_DIEU.forEach(function (n) { if (buoc >= n[1] && buoc < n[1] + n[2]) not = n[0]; });
      var hangGiong = not == null ? -1 : Math.max(1, Math.min(4, Math.round((69 - not) / 2.3) + 1));
      var cot = [];
      for (var h = 0; h < HANG; h++) {
        var g = 0, m = 0;
        if (hangGiong >= 0) {
          if (h === hangGiong) g = 7 + (c % 3);
          else if (Math.abs(h - hangGiong) === 1) g = 3;
        }
        if (h >= 6) m = 5 + ((c + h) % 3) + (h === 8 ? 2 : 0);
        else if (h === 5) m = 4;
        else if (h === 0) m = c % 2 ? 2 : 1;  // tiếng hi-hat ở rất cao
        else m = 1;  // họa âm của đàn lọt lên vùng giọng một chút
        if (S.cung_dai && h >= 1 && h <= 4) m += 3 + ((nhip + h) % 3);  // đàn chen vào vùng giọng
        if (S.vang && hangGiong >= 0 && h >= 1 && h <= 4) g += 1.2;
        var nl = Math.min(10, Math.round((g + m) * 10) / 10);
        cot.push({ nl: nl, mn: g + m > 0 ? Math.round(g / (g + m) * 10) / 10 : 0 });
      }
      o.push(cot);
    }
    return o;
  }
  function vePho() {
    var o = tinhPho();
    S.pho = o;
    pho.innerHTML = "";
    pho.style.gridTemplateColumns = "repeat(" + COT + ", minmax(0, 1fr))";
    for (var h = 0; h < HANG; h++) {
      for (var c = 0; c < COT; c++) {
        var x = o[c][h];
        var b = el("button", "tg-o");
        b.type = "button";
        b.dataset.c = c; b.dataset.h = h;
        b.style.setProperty("--mn", x.mn);
        b.style.setProperty("--nl", Math.max(0.06, x.nl / 10));
        if (x.mn >= 0.3 && x.mn <= 0.7 && x.nl >= 3) b.classList.add("is-lan");
        b.setAttribute("aria-label", N.o_nl + " " + so(x.nl) + ", " + N.o_mn + " " + so(x.mn));
        b.addEventListener("click", chonO);
        pho.appendChild(b);
      }
    }
    if (S.o_chon) moO(S.o_chon[0], S.o_chon[1]);
  }
  function chonO(e) {
    var b = e.currentTarget;
    moO(+b.dataset.c, +b.dataset.h);
    if (!S.da_cham_o) { S.da_cham_o = true; do_("tg-o"); }
  }
  function moO(c, h) {
    S.o_chon = [c, h];
    pho.querySelectorAll(".tg-o.is-chon").forEach(function (x) { x.classList.remove("is-chon"); });
    pho.children[h * COT + c].classList.add("is-chon");
    var x = S.pho[c][h];
    var giong = x.nl * x.mn, nhac = x.nl - giong;
    theO.innerHTML = "";
    var dong = el("p", "tg-o-vt");
    dong.textContent = N.o_tg + " " + so(c * 2 * BUOC) + " " + N.giay + " · " + N.o_cao + " " + (HANG - h) + "/" + HANG;
    theO.appendChild(dong);
    var ct = el("p", "tg-o-ct");
    ct.innerHTML = "";
    [[N.o_nl, so(x.nl)], [N.o_mn, so(x.mn)]].forEach(function (k, i) {
      var s = el("span", "tg-o-so"); s.appendChild(el("small", null, k[0])); s.appendChild(el("b", null, k[1])); ct.appendChild(s);
      if (!i) ct.appendChild(el("span", "tg-o-x", "×"));
    });
    theO.appendChild(ct);
    var chia = el("div", "tg-chia tg-chia-lon");
    var i1 = el("i"); i1.style.flex = String(Math.max(giong, 0.001));
    var i2 = el("i"); i2.style.flex = String(Math.max(nhac, 0.001));
    chia.appendChild(i1); chia.appendChild(i2);
    theO.appendChild(chia);
    var kq = el("p", "tg-o-kq");
    kq.appendChild(el("span", "tg-k-g", N.o_giong + " " + so(giong)));
    kq.appendChild(el("span", "tg-k-n", N.o_nhac + " " + so(nhac)));
    theO.appendChild(kq);
    if (x.nl > 0) theO.appendChild(el("p", "tg-o-nx", x.mn >= 0.3 && x.mn <= 0.7 ? N.o_kho : N.o_ro));
  }

  document.querySelectorAll("#tg-do-chon button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (S.da_do) return;
      S.da_do = true;
      var dung = b.dataset.dap === "4";
      document.querySelectorAll("#tg-do-chon button").forEach(function (x) {
        x.disabled = true;
        if (x.dataset.dap === "4") x.classList.add("is-dung");
        else if (x === b) x.classList.add("is-sai");
      });
      var ph = document.getElementById("tg-do-ph");
      ph.textContent = dung ? N.hoi_dung : N.hoi_sai;
      ph.className = "tg-do-ph " + (dung ? "is-dung" : "is-sai");
      document.getElementById("tg-vd-ds").hidden = false;
      do_("tg-do", { dung: dung ? "dung" : "sai" });
    });
  });

  // ---------- 3. Máy tách ----------
  var khungCheDo = document.getElementById("tg-che-do");
  ["tron", "giong", "karaoke"].forEach(function (k) {
    var b = el("button", "tg-cd", N.che_do[k]);
    b.type = "button";
    b.setAttribute("role", "radio");
    b.dataset.k = k;
    b.addEventListener("click", function () {
      S.che_do = k;
      capNhatMay();
      if (!S.dang_phat) phat();
      do_("tg-tach", { che_do: k });
    });
    khungCheDo.appendChild(b);
  });
  var muc = document.getElementById("tg-muc");
  muc.addEventListener("input", function () { S.muc = +muc.value; capNhatMay(); });
  muc.addEventListener("change", function () { do_("tg-muc", { muc: String(S.muc) }); });
  document.getElementById("tg-cung-dai").addEventListener("change", function (e) { S.cung_dai = e.target.checked; vePho(); capNhatMay(); do_("tg-kho", { loai: "cung-dai" }); });
  document.getElementById("tg-vang").addEventListener("change", function (e) { S.vang = e.target.checked; vePho(); capNhatMay(); do_("tg-kho", { loai: "vang" }); });

  function capNhatMay() {
    khungCheDo.querySelectorAll(".tg-cd").forEach(function (b) {
      var on = b.dataset.k === S.che_do;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.getElementById("tg-muc-chu").textContent = N.ro_muc[S.muc];
    var s = sot();
    var phan = Math.round(s * 100);
    document.getElementById("tg-sot-i").style.width = (S.che_do === "tron" ? 0 : phan) + "%";
    document.getElementById("tg-sot-i").className = s > 0.4 ? "is-cao" : (s > 0.15 ? "is-vua" : "");
    document.getElementById("tg-sot-so").textContent = S.che_do === "tron" ? "—" : phan + "%";
    var nx = N.nx[S.che_do];
    if (S.che_do !== "tron" && (S.cung_dai || S.vang)) nx += " " + N.ghi_kho;
    if (!S.dang_phat) nx += " · " + N.can_phat;
    document.getElementById("tg-nx").textContent = nx;
    apDung();
    if (S.che_do !== "tron") {
      S.da_tach[S.che_do] = true;
      if (S.da_tach.giong && S.da_tach.karaoke && !S.xong) { S.xong = true; do_("hoc-xong", { loai: "tach-giong-nhac" }); }
    }
  }

  document.querySelectorAll("[data-so-video]").forEach(function (a) {
    a.addEventListener("click", function () { do_("tg-xem-video", { so: a.getAttribute("data-so-video") }); });
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && S.dang_phat) dung(); });

  vePho();
  capNhatMay();
  ve();
})();

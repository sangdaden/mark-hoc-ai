/* Trò chơi "Cuộc gọi giả giọng" (cuoc-goi-gia-giong.html, en/): mô phỏng cuộc gọi rẽ nhánh, video 108, 109, 112.
   Dữ liệu: thẻ <script id="cg-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/cuoc-goi.json.
   Mỗi cuộc gọi bắt đầu ở màn hình đổ chuông ("reo"), người chơi chọn câu đáp, cuộc gọi rẽ tới một kết: an-toan (3 khiên), tam (1), mat (0).
   Cuối trò: đặt mật khẩu gia đình, xem trước thẻ nhỏ, in hoặc tải ảnh. Mật khẩu không bao giờ gửi đi (kể cả sự kiện đếm).
   Chạy thử: ?do=thu (sự kiện in ra console), trạng thái ở window.__cg. */
(function () {
  "use strict";
  var nguon = document.getElementById("cg-du-lieu");
  var san = document.getElementById("cg-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, CA = D.cuoc, MK = D.mat_khau;
  var EN = document.documentElement.lang === "en";
  var tien = document.getElementById("cg-tien"), diemEl = document.getElementById("cg-diem"), ket = document.getElementById("cg-ket");
  var CHAM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KHIEN = { "an-toan": 3, "tam": 1, "mat": 0 };
  var S, hen = [];

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function cho(ms, f) { var id = setTimeout(f, CHAM ? 0 : ms); hen.push(id); }
  function huyHen() { hen.forEach(clearTimeout); hen = []; }

  function batDau() {
    huyHen();
    S = { i: 0, khien: 0, ket: [], xong: false };
    window.__cg = S;
    ket.hidden = true;
    san.hidden = false;
    veCuoc();
  }

  function laCuocThat(c) {
    return !Object.keys(c.nut).some(function (k) { return c.nut[k].ket === "mat"; });
  }

  // ---------- một cuộc gọi ----------
  function veCuoc() {
    var c = CA[S.i];
    S.duong = [];
    S.giay = 0;
    S.daNoi = false;
    clearInterval(S.dongHo);
    tien.textContent = N.cuoc + " " + (S.i + 1) + "/" + CA.length;
    diemEl.textContent = N.khien + ": " + S.khien + "/" + 3 * CA.length;
    san.innerHTML = "";
    var o = el("div", "cg-o");
    var dt = el("div", "cg-dt cg-" + c.khung.loai);
    dt.appendChild(el("div", "cg-man"));
    o.appendChild(dt);
    var ben = el("div", "cg-ben");
    var vai = el("div", "cg-vai");
    vai.appendChild(el("b", null, c.ten));
    vai.appendChild(el("p", null, c.vai));
    ben.appendChild(vai);
    ben.appendChild(el("div", "cg-hanh"));
    o.appendChild(ben);
    san.appendChild(o);
    veReo(c);
    if (S.i === 0) do_("cuoc-goi-bat-dau");
  }

  function anh(c, cls) {
    var av = el("span", cls, c.khung.av || (c.khung.ten || "?").trim().charAt(0).toUpperCase());
    av.setAttribute("aria-hidden", "true");
    return av;
  }

  function veReo(c) {
    var man = san.querySelector(".cg-man"), k = c.khung;
    man.innerHTML = "";
    var reo = el("div", "cg-reo");
    reo.appendChild(el("span", "cg-reo-nhan", k.loai === "video" ? N.goi_video : N.goi_den));
    var vong = el("div", "cg-vong");
    vong.appendChild(anh(c, "cg-av"));
    reo.appendChild(vong);
    reo.appendChild(el("b", "cg-reo-ten", k.ten));
    reo.appendChild(el("span", "cg-reo-so", k.so));
    reo.appendChild(el("span", "cg-reo-gio", k.gio));
    var nut = el("div", "cg-reo-nut");
    // chon[0] luôn là "Nghe", chon[1] là "Từ chối" (data/cuoc-goi.json)
    c.nut.reo.chon.slice().reverse().forEach(function (x, j) {
      var nghe = j === 1;
      var b = el("button", "cg-tron " + (nghe ? "is-nghe" : "is-tu-choi"));
      b.type = "button";
      b.innerHTML = nghe
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1a1 1 0 0 1-.56.9 11.5 11.5 0 0 0-2.66 1.85 1 1 0 0 1-1.4 0L.29 13.08a1 1 0 0 1 0-1.41A16.9 16.9 0 0 1 12 7c4.5 0 8.6 1.75 11.7 4.67a1 1 0 0 1 0 1.41l-2.48 2.48a1 1 0 0 1-1.4 0 11.3 11.3 0 0 0-2.67-1.85 1 1 0 0 1-.56-.9v-3.1A15 15 0 0 0 12 9z"/></svg>';
      var nhan = el("span", "cg-tron-chu", x.chu);
      var o = el("span", "cg-tron-o");
      o.appendChild(b);
      o.appendChild(nhan);
      b.setAttribute("aria-label", x.chu);
      b.addEventListener("click", function () { chon(x); });
      nut.appendChild(o);
    });
    reo.appendChild(nut);
    man.appendChild(reo);
    var hanh = san.querySelector(".cg-hanh");
    hanh.innerHTML = "";
    hanh.appendChild(el("p", "cg-hoi", N.reo));
  }

  function veGoi(c) {
    var man = san.querySelector(".cg-man");
    man.innerHTML = "";
    var dau = el("div", "cg-goi-dau");
    dau.appendChild(anh(c, "cg-av cg-av-nho"));
    var ten = el("div", "cg-goi-ten");
    ten.appendChild(el("b", null, c.khung.ten));
    ten.appendChild(el("span", "cg-dong-ho", "00:00"));
    dau.appendChild(ten);
    var song = el("span", "cg-song");
    song.setAttribute("aria-hidden", "true");
    for (var j = 0; j < 5; j++) song.appendChild(el("i"));
    dau.appendChild(song);
    man.appendChild(dau);
    var log = el("div", "cg-log");
    log.setAttribute("aria-live", "polite");
    man.appendChild(log);
  }

  function batDongHo() {
    if (S.daNoi) return;
    S.daNoi = true;
    var dh = san.querySelector(".cg-dong-ho");
    S.dongHo = setInterval(function () {
      S.giay++;
      if (dh) dh.textContent = ("0" + Math.floor(S.giay / 60)).slice(-2) + ":" + ("0" + S.giay % 60).slice(-2);
    }, 1000);
  }

  function themDong(d) {
    var log = san.querySelector(".cg-log");
    var hang = el("div", "cg-dong cg-tu-" + d.tu);
    var nhan = d.tu === "minh" ? N.ban : d.tu === "tin" ? N.tin + (d.cam ? " · " + d.cam : "") : "";
    if (nhan) hang.appendChild(el("span", "cg-noi", nhan));
    var bong = el("p", "cg-bong");
    if (d.tu === "ho" && d.cam) bong.appendChild(el("i", "cg-cam", "(" + d.cam + ") "));
    bong.appendChild(document.createTextNode(d.chu));
    hang.appendChild(bong);
    log.appendChild(hang);
    log.scrollTop = log.scrollHeight;
  }

  function chon(x) {
    var c = CA[S.i];
    S.duong.push(x);
    var hanh = san.querySelector(".cg-hanh");
    hanh.innerHTML = "";
    if (!san.querySelector(".cg-log")) veGoi(c);
    var tiep = c.nut[x.toi];
    var dau = tiep.dong[0];
    if (S.duong.length > 1 && !(dau && dau.tu === "minh")) themDong({ tu: "minh", chu: x.chu });
    choiNut(c, tiep);
  }

  // Phát lần lượt từng dòng của một bước (có chấm "đang nói"), xong thì hiện lựa chọn hoặc kết
  function choiNut(c, n) {
    var dt = san.querySelector(".cg-dt");
    var i = 0;
    function mot() {
      if (i >= n.dong.length) {
        dt.classList.remove("is-noi");
        if (n.ket) ketCuoc(c, n.ket); else hienChon(n);
        return;
      }
      var d = n.dong[i++];
      var log = san.querySelector(".cg-log");
      var go = null;
      if (d.tu === "ho") { batDongHo(); dt.classList.add("is-noi"); }
      else dt.classList.remove("is-noi");
      if (!CHAM && d.tu !== "minh") {
        go = el("div", "cg-dong cg-tu-" + d.tu + " cg-go");
        go.appendChild(el("p", "cg-bong", "• • •"));
        go.setAttribute("aria-label", N.dang_noi);
        log.appendChild(go);
        log.scrollTop = log.scrollHeight;
      }
      cho(d.tu === "minh" ? 250 : 500 + Math.min(1300, d.chu.length * 14), function () {
        if (go) go.remove();
        themDong(d);
        cho(250, mot);
      });
    }
    mot();
  }

  function hienChon(n) {
    var hanh = san.querySelector(".cg-hanh");
    hanh.innerHTML = "";
    hanh.appendChild(el("p", "cg-hoi", N.ban_noi));
    var ds = el("div", "cg-chon");
    n.chon.forEach(function (x) {
      var b = el("button", "btn cg-nut", x.chu);
      b.type = "button";
      b.addEventListener("click", function () { chon(x); });
      ds.appendChild(b);
    });
    hanh.appendChild(ds);
    var dau = ds.querySelector("button");
    if (dau && window.innerWidth >= 860) dau.focus({ preventScroll: true });
    if (window.innerWidth < 860) {
      var r = hanh.getBoundingClientRect();
      if (r.bottom > window.innerHeight) hanh.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "end" });
    }
  }

  function ketCuoc(c, loai) {
    clearInterval(S.dongHo);
    var dt = san.querySelector(".cg-dt");
    dt.classList.add("is-het");
    themDong({ tu: "he-thong", chu: N.ket_thuc + (S.daNoi ? " · " + san.querySelector(".cg-dong-ho").textContent : "") });
    var k = KHIEN[loai];
    S.khien += k;
    S.ket.push({ c: c, loai: loai });
    diemEl.textContent = N.khien + ": " + S.khien + "/" + 3 * CA.length;

    var hanh = san.querySelector(".cg-hanh");
    hanh.innerHTML = "";
    var kq = el("div", "cg-kq is-" + loai);
    var dau = el("div", "cg-kq-dau");
    var bit = el("img");
    bit.src = D.p + "assets/" + (loai === "mat" ? "bit-sai-roi.svg" : "bit-vui.svg");
    bit.alt = ""; bit.width = 64; bit.height = 64;
    dau.appendChild(bit);
    var tt = el("div");
    var kh = el("span", "cg-khien");
    kh.setAttribute("aria-label", k + "/3 " + N.phu);
    for (var j = 0; j < 3; j++) kh.appendChild(el("i", j < k ? "is-co" : ""));
    tt.appendChild(kh);
    tt.appendChild(el("b", "cg-kq-h", N.ket[loai]));
    dau.appendChild(tt);
    kq.appendChild(dau);
    kq.appendChild(el("p", "cg-kq-chu", c.giai));
    kq.appendChild(el("p", "cg-kq-nhan", laCuocThat(c) ? N.dau_hieu_that : N.dau_hieu));
    var ul = el("ul", "cg-dh");
    c.dau_hieu.forEach(function (x) { ul.appendChild(el("li", null, x)); });
    kq.appendChild(ul);
    kq.appendChild(el("p", "cg-kq-nhan", N.duong_di));
    var ol = el("ol", "cg-duong");
    S.duong.forEach(function (x) {
      var li = el("li", "is-" + x.muc);
      li.appendChild(el("span", "cg-dau-muc", x.muc === "tot" ? "✓" : x.muc === "xau" ? "✗" : "•"));
      li.appendChild(el("span", null, x.chu));
      ol.appendChild(li);
    });
    kq.appendChild(ol);
    hanh.appendChild(kq);

    var nut = el("div", "cta cg-sau");
    var cuoi = S.i + 1 >= CA.length;
    var tiep = el("button", "btn btn-yt", cuoi ? N.xem_ket : N.tiep + " ›");
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (!cuoi) { S.i++; veCuoc(); san.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" }); }
      else ketThuc();
    });
    var xem = el("a", "btn", N.xem_video + " #" + c.video.so);
    xem.href = c.video.url;
    xem.addEventListener("click", function () { do_("cuoc-goi-xem-video", { so: String(c.video.so) }); });
    nut.appendChild(tiep);
    nut.appendChild(xem);
    hanh.appendChild(nut);
    tiep.focus({ preventScroll: true });
    if (window.innerWidth < 860) kq.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" });
    do_("cuoc-goi-ket", { cuoc: c.id, ket: loai });
  }

  function ketThuc() {
    S.xong = true;
    san.hidden = true;
    ket.hidden = false;
    tien.textContent = "";
    var tong = 3 * CA.length;
    document.getElementById("cg-ket-so").textContent = S.khien + "/" + tong;
    var hang = N.hang.filter(function (h) { return S.khien >= h[0]; })[0];
    document.getElementById("cg-ket-hang").textContent = hang[1];
    document.getElementById("cg-ket-phu").textContent = N.phu_ket;
    var h = document.getElementById("cg-ket-h"), box = document.getElementById("cg-ket-video");
    box.innerHTML = "";
    var vids = S.ket.filter(function (x) { return x.loai !== "an-toan"; }).map(function (x) { return x.c.video; });
    h.textContent = vids.length ? N.on_lai : N.het_sai;
    vids.forEach(function (v) {
      var a = el("a", "ld-vid");
      a.href = v.url;
      a.appendChild(el("span", "ld-vid-so", "#" + v.so));
      a.appendChild(el("b", null, v.ten));
      box.appendChild(a);
    });
    ket.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" });
    // Thẻ "Gửi cho bố mẹ" (chia-se.js)
    if (window.mhaiChiaSe) window.mhaiChiaSe(ket, { tro: "cuoc-goi", diem: S.khien + "/" + tong });
    do_("cuoc-goi-xong", { diem: String(S.khien) });
    do_("hoc-xong", { loai: "cuoc-goi" });
  }

  // ---------- mật khẩu gia đình + thẻ ----------
  var oMk = document.getElementById("cg-mk-o"), oNha = document.getElementById("cg-mk-nha"), oGhi = document.getElementById("cg-mk-ghi");
  var kiem = document.getElementById("cg-mk-kiem"), the = document.getElementById("cg-the");

  function ngau(ds) { return ds[Math.floor(Math.random() * ds.length)]; }
  function goiY() {
    var a = ngau(MK.a), b = ngau(MK.b), c = ngau(MK.c);
    return EN ? c + " " + b + " " + a : a + " " + b + " " + c;
  }
  function chuan(s) { return s.toLowerCase().replace(/\s+/g, " ").trim(); }
  function danhGia(s) {
    var x = chuan(s), tu = x ? x.split(" ").length : 0;
    var de = MK.de_doan.some(function (d) { return x === d || (d.length >= 5 && x.indexOf(d) >= 0); });
    return [
      [tu >= (EN ? 2 : 3), N.kiem.dai],
      [x && !/\d/.test(x), N.kiem.so],
      [x && !de, N.kiem.de]
    ];
  }
  function veKiem() {
    kiem.innerHTML = "";
    if (!chuan(oMk.value)) return;
    danhGia(oMk.value).forEach(function (r) {
      var li = el("li", r[0] ? "is-dat" : "is-chua");
      li.appendChild(el("span", "cg-dau-muc", r[0] ? "✓" : "!"));
      li.appendChild(el("span", null, r[1]));
      kiem.appendChild(li);
    });
  }
  function noiDungThe() {
    return {
      nha: chuan(oNha.value) ? oNha.value.trim() : N.the.nha,
      mk: oGhi.checked && chuan(oMk.value) ? oMk.value.trim() : ""
    };
  }
  function veThe() {
    var x = noiDungThe();
    the.innerHTML = "";
    var dau = el("div", "cg-the-dau");
    var kh = el("span", "cg-the-khien");
    kh.innerHTML = '<svg class="ic" aria-hidden="true"><use href="' + D.p + 'assets/icons.svg#i-shield-check"/></svg>';
    dau.appendChild(kh);
    var tt = el("div");
    tt.appendChild(el("b", null, N.the.h));
    tt.appendChild(el("span", null, x.nha));
    dau.appendChild(tt);
    the.appendChild(dau);
    var ol = el("ol", "cg-the-luat");
    N.the.luat.forEach(function (l) { ol.appendChild(el("li", null, l)); });
    the.appendChild(ol);
    var mk = el("div", "cg-the-mk" + (x.mk ? "" : " is-trong"));
    mk.appendChild(el("span", null, N.the.mk));
    mk.appendChild(el("b", null, x.mk || " "));
    the.appendChild(mk);
    the.appendChild(el("p", "cg-the-chan", "markhocai.com · Mark học AI"));
  }

  // Vẽ thẻ lên canvas 1200×760 rồi tải về dạng PNG
  function taiAnh() {
    var x = noiDungThe();
    var W = 1200, cv = document.createElement("canvas");
    var g = cv.getContext("2d");
    var DS = '"Be Vietnam Pro", "Inter", sans-serif', BD = '"Inter", sans-serif';
    function hop(xx, y, w, h, r) {
      g.beginPath();
      g.moveTo(xx + r, y); g.arcTo(xx + w, y, xx + w, y + h, r); g.arcTo(xx + w, y + h, xx, y + h, r);
      g.arcTo(xx, y + h, xx, y, r); g.arcTo(xx, y, xx + w, y, r); g.closePath();
    }
    function ngat(chu, maxW) {
      var tu = chu.split(" "), dong = [], cur = "";
      tu.forEach(function (w) { var thu = cur ? cur + " " + w : w; if (g.measureText(thu).width > maxW && cur) { dong.push(cur); cur = w; } else cur = thu; });
      if (cur) dong.push(cur);
      return dong;
    }
    // đo trước: ngắt dòng từng luật để biết thẻ cao bao nhiêu (đổi cv.height làm mất trạng thái vẽ, nên đổi trước khi vẽ)
    g.font = "500 30px " + BD;
    var luat = N.the.luat.map(function (l) { return ngat(l, W - 260); });
    var hopY = 236 + luat.reduce(function (s, d) { return s + (d.length - 1) * 38 + 66; }, 0);
    var H = hopY + 96 + 108;
    cv.width = W; cv.height = H;
    var nen = g.createLinearGradient(0, 0, W, H);
    nen.addColorStop(0, "#2563EB"); nen.addColorStop(.55, "#0369A1"); nen.addColorStop(1, "#0F766E");
    g.fillStyle = nen; g.fillRect(0, 0, W, H);
    g.fillStyle = "#FFFFFF"; hop(40, 40, W - 80, H - 80, 36); g.fill();
    g.fillStyle = "#2563EB"; hop(80, 80, 88, 88, 24); g.fill();
    // khiên + dấu tích, vẽ tay (không dùng emoji: máy không có phông emoji sẽ ra ô trống)
    g.fillStyle = "#FFFFFF"; g.beginPath(); g.moveTo(124, 98); g.lineTo(148, 107); g.lineTo(148, 127);
    g.quadraticCurveTo(148, 148, 124, 156); g.quadraticCurveTo(100, 148, 100, 127); g.lineTo(100, 107); g.closePath(); g.fill();
    g.strokeStyle = "#2563EB"; g.lineWidth = 5; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(113, 127); g.lineTo(121, 135); g.lineTo(136, 118); g.stroke();
    g.fillStyle = "#0F172A"; g.font = "800 50px " + DS; g.fillText(N.the.h, 196, 122);
    g.fillStyle = "#475569"; g.font = "500 30px " + BD; g.fillText(x.nha, 196, 162);
    var y = 236;
    luat.forEach(function (dong, j) {
      g.fillStyle = "#E0F2FE"; g.beginPath(); g.arc(102, y - 12, 22, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#1D4ED8"; g.font = "800 24px " + DS; g.textAlign = "center"; g.fillText(String(j + 1), 102, y - 3); g.textAlign = "left";
      g.fillStyle = "#0F172A"; g.font = "500 30px " + BD;
      dong.forEach(function (d, k) { g.fillText(d, 144, y + k * 38); });
      y += (dong.length - 1) * 38 + 66;
    });
    g.fillStyle = "#EFF6FF"; hop(80, y, W - 160, 96, 20); g.fill();
    g.fillStyle = "#475569"; g.font = "600 28px " + BD; g.fillText(N.the.mk, 112, y + 58);
    var lech = g.measureText(N.the.mk).width + 56;
    if (x.mk) { g.fillStyle = "#0F172A"; g.font = "800 36px " + DS; g.fillText(x.mk, 80 + lech, y + 60); }
    else { g.strokeStyle = "#94A3B8"; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(80 + lech, y + 66); g.lineTo(W - 120, y + 66); g.stroke(); g.setLineDash([]); }
    g.fillStyle = "#64748B"; g.font = "500 22px " + BD; g.textAlign = "right"; g.fillText("markhocai.com · Mark học AI", W - 80, H - 66);
    cv.toBlob(function (b) {
      if (!b) return;
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = EN ? "family-safe-word.png" : "mat-khau-gia-dinh.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, "image/png");
  }

  function inThe() {
    var html = document.documentElement;
    html.classList.add("cg-dang-in");
    function bo() { html.classList.remove("cg-dang-in"); window.removeEventListener("afterprint", bo); }
    window.addEventListener("afterprint", bo);
    window.print();
    setTimeout(bo, 1500);
  }

  if (oMk && the) {
    oMk.addEventListener("input", function () { veKiem(); veThe(); });
    oNha.addEventListener("input", veThe);
    oGhi.addEventListener("change", veThe);
    document.getElementById("cg-mk-goi-y").addEventListener("click", function () {
      oMk.value = goiY(); veKiem(); veThe();
      do_("cuoc-goi-goi-y");
    });
    document.getElementById("cg-in").addEventListener("click", function () { do_("cuoc-goi-the", { cach: "in", co_mk: oGhi.checked ? "co" : "khong" }); inThe(); });
    document.getElementById("cg-tai").addEventListener("click", function () {
      do_("cuoc-goi-the", { cach: "tai", co_mk: oGhi.checked ? "co" : "khong" });
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(taiAnh);
    });
    veThe();
  }
  var boQua = document.getElementById("cg-bo-qua");
  if (boQua) boQua.addEventListener("click", function () { do_("cuoc-goi-bo-qua"); });

  document.getElementById("cg-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" }); });
  batDau();
})();

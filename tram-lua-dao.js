/* Trạm chống lừa đảo AI (tram-chong-lua-dao.html, en/): Sang chọn mockup A + B, C ngày 20/10/2026.
   - Kiểm tra nhanh: chọn tình huống, 3 câu có/không, ra mức nguy hiểm + 3 việc làm ngay + thẻ chiêu lừa liên quan.
   - Danh bạ chiêu lừa: lọc theo người hay bị nhắm, bấm thẻ mở phần chi tiết (đã có sẵn trong HTML). ?chieu=<id> mở thẳng một thẻ.
   - Phòng tập: đánh dấu "Đã ghé" trò nào đã bấm vào từ trạm (localStorage mhai-tram-da-ghe, chỉ trên máy này).
   Dữ liệu Kiểm tra nhanh: thẻ <script id="tl-du-lieu"> do scripts/trang/tram-chong-lua-dao.py tạo từ data/chong-lua-dao.json.
   Không gửi câu trả lời đi đâu; chỉ đếm vài sự kiện (theo-doi.js). Chạy thử: window.__tl. */
(function () {
  "use strict";
  var nguon = document.getElementById("tl-du-lieu");
  var goc = document.getElementById("tl");
  if (!nguon || !goc) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan;
  var TH = {};
  D.th.forEach(function (x) { TH[x.id] = x; });
  var hoi = document.getElementById("tl-hoi");
  var kq = document.getElementById("tl-kq");
  var chonNut = goc.querySelectorAll(".tl-th");
  var S = { th: null, cau: 0, co: 0 };
  window.__tl = S;

  function do_(hanhDong, d) {
    if (!window.mhaiDo) return;
    d = d || {};
    d.hanh_dong = hanhDong;
    window.mhaiDo("tram-lua-dao", d);
  }
  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function nut(cls, chu, bam) {
    var b = el("button", cls, chu);
    b.type = "button";
    b.addEventListener("click", bam);
    return b;
  }
  function cuon(e) {
    var mm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    e.scrollIntoView({ behavior: mm ? "auto" : "smooth", block: "start" });
  }

  // ----- Kiểm tra nhanh -----
  function danhDau(id) {
    chonNut.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.th === id ? "true" : "false"); });
  }
  function batDau(id) {
    S.th = TH[id]; S.cau = 0; S.co = 0;
    danhDau(id);
    kq.hidden = true;
    hienCau();
    do_("chon", { th: id });
  }
  function hienCau() {
    var x = S.th;
    hoi.textContent = "";
    var dau = el("div", "tl-hoi-dau");
    dau.appendChild(el("span", "tl-hoi-so", N.cau + " " + (S.cau + 1) + "/" + x.hoi.length));
    var tien = el("span", "tl-hoi-tien");
    for (var i = 0; i < x.hoi.length; i++) tien.appendChild(el("i", i < S.cau ? "xong" : (i === S.cau ? "nay" : "")));
    dau.appendChild(tien);
    hoi.appendChild(dau);
    hoi.appendChild(el("p", "tl-hoi-cau", x.hoi[S.cau]));
    var hang = el("div", "tl-hoi-nut");
    hang.appendChild(nut("tl-co-nut", N.co, function () { traLoi(true); }));
    hang.appendChild(nut("tl-khong-nut", N.khong, function () { traLoi(false); }));
    hoi.appendChild(hang);
    hoi.appendChild(nut("tl-doi", N.doi, doiTinhHuong));
    hoi.hidden = false;
    var dauTien = hang.querySelector("button");
    if (dauTien && S.cau > 0) dauTien.focus({ preventScroll: true });
  }
  function traLoi(co) {
    if (co) S.co++;
    S.cau++;
    if (S.cau < S.th.hoi.length) hienCau();
    else ketQua();
  }
  function doiTinhHuong() {
    S.th = null;
    hoi.hidden = true; kq.hidden = true;
    danhDau("");
    var b = goc.querySelector(".tl-th");
    if (b) b.focus();
  }
  function ketQua() {
    var x = S.th, n = S.co;
    var muc = n === 0 ? 0 : (n === 1 ? 1 : 2);
    var vach = [1, 3, 5][muc] - (muc === 2 && n < x.hoi.length ? 1 : 0);
    hoi.hidden = true;
    kq.textContent = "";
    kq.className = "tl-kq tl-muc-" + muc;
    var dau = el("div", "tl-kq-dau");
    var thanh = el("span", "tl-kq-vach");
    thanh.setAttribute("role", "img");
    thanh.setAttribute("aria-label", N.muc + " " + vach + "/5");
    for (var i = 0; i < 5; i++) thanh.appendChild(el("i", i < vach ? "on" : ""));
    dau.appendChild(thanh);
    dau.appendChild(el("span", "tl-kq-dem", n + "/" + x.hoi.length + " " + N.co_dau));
    kq.appendChild(dau);
    kq.appendChild(el("h3", "tl-kq-ten", D.muc[muc].ten));
    kq.appendChild(el("p", "tl-kq-giai", D.muc[muc].giai));
    kq.appendChild(el("p", "tl-kq-nhan", N.lam_ngay));
    var ds = el("ol", "tl-kq-lam");
    x.lam.forEach(function (c) { ds.appendChild(el("li", "", c)); });
    kq.appendChild(ds);
    var di = el("div", "tl-kq-di");
    var a = el("a", "btn btn-yt", N.xem_chieu + ": " + D.ten_chieu[x.chieu]);
    a.href = "#chieu-" + x.chieu;
    a.addEventListener("click", function (e) { e.preventDefault(); moThe(x.chieu, true); });
    di.appendChild(a);
    var lo = el("a", "btn tl-kq-lo", N.lo);
    lo.href = "#lo-bi-lua";
    di.appendChild(lo);
    di.appendChild(nut("btn tl-kq-lai", N.lam_lai, function () { batDau(x.id); }));
    kq.appendChild(di);
    kq.hidden = false;
    var h = kq.querySelector("h3");
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
    do_("ket-qua", { th: x.id, co: n });
  }
  chonNut.forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { batDau(b.dataset.th); });
  });

  // ----- Danh bạ chiêu lừa -----
  var the = goc.querySelectorAll(".tl-the");
  var locNut = goc.querySelectorAll(".tl-loc-nut");
  function loc(ai) {
    locNut.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.ai === ai ? "true" : "false"); });
    the.forEach(function (t) { t.hidden = ai !== "tat-ca" && t.dataset.ai.split(" ").indexOf(ai) < 0; });
  }
  locNut.forEach(function (b) {
    b.addEventListener("click", function () { loc(b.dataset.ai); do_("loc", { ai: b.dataset.ai }); });
  });
  function dongThe() {
    goc.querySelectorAll(".tl-ct").forEach(function (c) { c.hidden = true; });
    the.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
  }
  function moThe(id, cuonToi) {
    var ct = document.getElementById("chieu-" + id);
    var t = goc.querySelector('.tl-the[data-chieu="' + id + '"]');
    if (!ct || !t) return;
    var dangMo = !ct.hidden;
    dongThe();
    if (dangMo && !cuonToi) { t.focus(); return; }
    if (t.hidden) loc("tat-ca");
    ct.hidden = false;
    t.setAttribute("aria-expanded", "true");
    if (cuonToi) cuon(ct);
    do_("mo-the", { chieu: id });
  }
  the.forEach(function (t) {
    t.addEventListener("click", function () {
      moThe(t.dataset.chieu, false);
      var ct = document.getElementById("chieu-" + t.dataset.chieu);
      if (ct && !ct.hidden) {
        var r = ct.getBoundingClientRect();
        if (r.top > window.innerHeight - 120 || r.top < 0) cuon(ct);
      }
    });
  });
  goc.querySelectorAll(".tl-ct-dong").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.closest(".tl-ct").id.replace("chieu-", "");
      dongThe();
      var t = goc.querySelector('.tl-the[data-chieu="' + id + '"]');
      if (t) t.focus();
    });
  });

  // ----- Phòng tập: "Đã ghé" -----
  var KHOA = "mhai-tram-da-ghe";
  function daGhe() {
    try { return JSON.parse(localStorage.getItem(KHOA) || "[]"); } catch (e) { return []; }
  }
  function veTien() {
    var ds = daGhe(), so = 0;
    goc.querySelectorAll("[data-tap]").forEach(function (a) {
      var co = ds.indexOf(a.dataset.tap) >= 0;
      a.closest(".tl-buoc").classList.toggle("da-ghe", co);
      if (co) so++;
    });
    var o = document.getElementById("tl-tien-so"), dai = document.getElementById("tl-tien-dai");
    var tong = +(o && o.dataset.tong) || 1;
    if (o) o.textContent = so + "/" + tong;
    if (dai) dai.style.width = Math.round(so / tong * 100) + "%";
  }
  goc.querySelectorAll("[data-tap]").forEach(function (a) {
    a.addEventListener("click", function () {
      var ds = daGhe();
      if (ds.indexOf(a.dataset.tap) < 0) ds.push(a.dataset.tap);
      try { localStorage.setItem(KHOA, JSON.stringify(ds)); } catch (e) {}
      do_("vao-tro", { tro: a.dataset.tap });
    });
  });
  veTien();

  // Đếm các link khác (video, đồ in, gửi Facebook)
  goc.addEventListener("click", function (e) {
    var l = e.target.closest("[data-tl]");
    if (l) do_("bam", { the: l.dataset.tl });
  });

  // Mở thẳng một thẻ: ?chieu=<id> (link trong bình luận đầu video) hoặc #chieu-<id>
  var q = new URLSearchParams(location.search).get("chieu") || (location.hash.indexOf("#chieu-") === 0 ? location.hash.slice(7) : "");
  if (q && document.getElementById("chieu-" + q)) {
    moThe(q, false);
    setTimeout(function () { cuon(document.getElementById("chieu-" + q)); }, 60);
  }
})();

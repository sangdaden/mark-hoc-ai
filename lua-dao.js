/* Trò chơi "Lừa đảo hay thật?" (lua-dao-hay-that.html, en/): mỗi ca là một màn hình điện thoại giả lập.
   Ca loại "bai-anh" (video 122) là bài đăng có ảnh; c.nut đổi chữ hai nút thành Ảnh AI / Ảnh thật.
   Dữ liệu: thẻ <script id="ld-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/lua-dao.json.
   Người chơi chạm vào chỗ đáng ngờ (đánh dấu), rồi chọn Lừa đảo / Thật; sau đó hiện mọi dấu hiệu, lời giải và link video.
   Không lưu, không gửi gì ngoài vài sự kiện đếm (theo-doi.js). Chạy thử: ?do=thu, trạng thái ở window.__ld. */
(function () {
  "use strict";
  var nguon = document.getElementById("ld-du-lieu");
  var san = document.getElementById("ld-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, CA = D.ca;
  var tien = document.getElementById("ld-tien"), diemEl = document.getElementById("ld-diem"), ket = document.getElementById("ld-ket");
  var S;
  var BIT = D.p + "assets/";

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }

  function batDau() {
    S = { i: 0, dung: 0, tim: 0, tong: 0, sai: [], xong: false };
    window.__ld = S;
    ket.hidden = true;
    san.hidden = false;
    ve();
  }

  function demCo(c) { return Object.keys(c.co).length; }

  function nutDoan(chu, co, c) {
    // span role=button (không dùng <button>): nút luôn thành một khối, làm câu bị ngắt dòng giữa chừng
    var b = el("span", "ld-doan", chu);
    b.setAttribute("role", "button");
    b.tabIndex = 0;
    b.dataset.co = co || "";
    b.setAttribute("aria-pressed", "false");
    function bam() {
      if (S.daChon) return;
      var bat = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", bat ? "true" : "false");
      capNhatDem();
    }
    b.addEventListener("click", bam);
    b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bam(); } });
    return b;
  }

  function capNhatDem() {
    var n = san.querySelectorAll('.ld-doan[aria-pressed="true"]').length;
    var dem = document.getElementById("ld-dem");
    if (dem) dem.textContent = n ? N.danh_dau + " " + n + " " + N.cho : N.huong;
  }

  function veKhung(c) {
    var k = c.khung, loai = c.loai;
    var dt = el("div", "ld-dt ld-" + loai);
    var dau = el("div", "ld-dt-dau");
    var av = el("span", "ld-av", (k.ten || "?").trim().charAt(0).toUpperCase());
    av.setAttribute("aria-hidden", "true");
    var ten = el("div", "ld-ten");
    if (loai === "goi" || loai === "video") ten.appendChild(el("span", "ld-nhan", loai === "goi" ? N.goi_den : N.goi_video));
    ten.appendChild(el("b", null, k.ten));
    if (k.phu) {
      if (c.co_khung) ten.appendChild(nutDoan(k.phu, c.co_khung, c));
      else ten.appendChild(el("span", "ld-phu", k.phu));
    }
    dau.appendChild(av);
    dau.appendChild(ten);
    if (k.gio) dau.appendChild(el("span", "ld-gio", k.gio));
    if (loai === "quang-cao") dau.appendChild(el("span", "ld-tai-tro", N.tai_tro));
    dt.appendChild(dau);
    if (k.hinh) {
      // Bài đăng có ảnh (ca ảnh AI, video 122): ảnh minh họa, dấu hiệu nằm ở thông tin nguồn gốc bên dưới
      var khung = el("div", "ld-anh ld-anh-hinh");
      var hinh = el("img");
      hinh.src = D.p + k.hinh; hinh.alt = k.hinh_mo_ta || ""; hinh.width = 640; hinh.height = 360;
      khung.appendChild(hinh);
      dt.appendChild(khung);
    } else if (k.anh) {
      var anh = el("div", "ld-anh");
      anh.appendChild(el("span", null, k.anh));
      dt.appendChild(anh);
    }
    var than = el("div", "ld-than");
    c.dong.forEach(function (d) {
      var hang = el("div", "ld-dong ld-tu-" + d.tu);
      if (d.tu === "ho" && (loai === "goi" || loai === "video")) hang.appendChild(el("span", "ld-noi", N.nguoi_goi));
      if (d.tu === "minh") hang.appendChild(el("span", "ld-noi", N.ban));
      var bong = el("p", "ld-bong");
      d.doan.forEach(function (x) { bong.appendChild(nutDoan(x.chu, x.co, c)); });
      hang.appendChild(bong);
      than.appendChild(hang);
    });
    dt.appendChild(than);
    return dt;
  }

  function ve() {
    var c = CA[S.i];
    S.daChon = false;
    tien.textContent = N.ca + " " + (S.i + 1) + "/" + CA.length;
    diemEl.textContent = N.diem + ": " + S.dung;
    san.innerHTML = "";
    var o = el("div", "ld-o");
    o.appendChild(veKhung(c));
    var ben = el("div", "ld-ben");
    var dem = el("p", "ld-dem", N.huong);
    dem.id = "ld-dem";
    dem.setAttribute("aria-live", "polite");
    ben.appendChild(dem);
    var chon = el("div", "ld-chon");
    var nhanCa = c.nut || {};
    [["lua", (c.loai === "bai-anh" ? "🤖 " : "🚩 ") + (nhanCa.lua || N.lua)], ["that", (c.loai === "bai-anh" ? "📷 " : "✅ ") + (nhanCa.that || N.that)]].forEach(function (x) {
      var b = el("button", "btn ld-nut ld-nut-" + x[0], x[1]);
      b.type = "button";
      b.addEventListener("click", function () { tra(x[0]); });
      chon.appendChild(b);
    });
    ben.appendChild(chon);
    o.appendChild(ben);
    san.appendChild(o);
    if (S.i === 0) do_("lua-dao-bat-dau");
  }

  function tra(chon) {
    if (S.daChon) return;
    S.daChon = true;
    var c = CA[S.i];
    var dung = chon === c.dap_an;
    if (dung) S.dung++; else S.sai.push(c);
    var tim = {}, nham = 0;
    san.querySelectorAll(".ld-doan").forEach(function (b) {
      var co = b.dataset.co, bam = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-disabled", "true");
      b.removeAttribute("tabindex");
      if (co) { b.classList.add("is-co"); if (bam) tim[co] = 1; }
      else if (bam) { b.classList.add("is-nham"); b.title = N.nham; nham++; }
    });
    var ds = Object.keys(c.co);
    S.tong += ds.length;
    S.tim += Object.keys(tim).length;
    diemEl.textContent = N.diem + ": " + S.dung;

    var ben = san.querySelector(".ld-ben");
    ben.innerHTML = "";
    var ph = el("div", "ld-phan-hoi " + (dung ? "is-dung" : "is-sai"));
    var bit = el("img");
    bit.src = BIT + (dung ? "bit-vui.svg" : "bit-sai-roi.svg");
    bit.alt = ""; bit.width = 64; bit.height = 64;
    ph.appendChild(bit);
    var chu = el("div");
    var nhanCa = c.nut || {};
    chu.appendChild(el("b", "ld-ph-dau", (dung ? N.dung : N.sai) + " " + (c.dap_an === "lua" ? nhanCa.la_lua || N.la_lua : nhanCa.la_that || N.la_that)));
    if (ds.length) {
      var ul = el("ul", "ld-ds-co");
      ds.forEach(function (k) {
        var li = el("li", tim[k] ? "is-tim" : "is-sot");
        li.appendChild(el("span", "ld-co-nhan", tim[k] ? "✓ " + N.tim_thay : "• " + N.bo_sot));
        li.appendChild(el("span", null, c.co[k]));
        ul.appendChild(li);
      });
      chu.appendChild(ul);
    } else {
      chu.appendChild(el("p", "ld-ph-chu", N.khong_co));
    }
    chu.appendChild(el("p", "ld-ph-chu", c.giai));
    ph.appendChild(chu);
    ben.appendChild(ph);

    var nut = el("div", "cta ld-sau");
    var xem = el("a", "btn", N.xem_video + " #" + c.video.so);
    xem.href = c.video.url;
    xem.addEventListener("click", function () { do_("lua-dao-xem-video", { so: String(c.video.so) }); });
    var tiep = el("button", "btn btn-yt", S.i + 1 < CA.length ? N.tiep + " ›" : N.xem_ket);
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (S.i + 1 < CA.length) { S.i++; ve(); san.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else ketThuc();
    });
    nut.appendChild(tiep);
    nut.appendChild(xem);
    ben.appendChild(nut);
    tiep.focus({ preventScroll: true });
    do_("lua-dao-tra-loi", { ca: c.id, dung: dung ? "dung" : "sai" });
  }

  function ketThuc() {
    S.xong = true;
    san.hidden = true;
    ket.hidden = false;
    tien.textContent = "";
    diemEl.textContent = "";
    document.getElementById("ld-ket-so").textContent = S.dung + "/" + CA.length;
    var hang = N.hang.filter(function (h) { return S.dung >= h[0]; })[0];
    document.getElementById("ld-ket-hang").textContent = hang[1];
    document.getElementById("ld-ket-phu").textContent = N.tim_thay + " " + S.tim + "/" + S.tong + " " + N.dau_hieu;
    var h = document.getElementById("ld-ket-h"), box = document.getElementById("ld-ket-video");
    box.innerHTML = "";
    var da = {};
    var vids = S.sai.map(function (c) { return c.video; }).filter(function (v) { if (da[v.so]) return false; da[v.so] = 1; return true; });
    h.textContent = vids.length ? N.on_lai : N.het_sai;
    vids.forEach(function (v) {
      var a = el("a", "ld-vid");
      a.href = v.url;
      a.appendChild(el("span", "ld-vid-so", "#" + v.so));
      a.appendChild(el("b", null, v.ten));
      box.appendChild(a);
    });
    ket.scrollIntoView({ behavior: "smooth", block: "start" });
    do_("lua-dao-xong", { diem: String(S.dung) });
    do_("hoc-xong", { loai: "lua-dao" });
  }

  document.getElementById("ld-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
  batDau();
})();

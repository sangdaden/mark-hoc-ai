// Tiến độ học dùng chung cho cả web (nạp ở mọi trang, ngay sau theo-doi.js). Chỉ lưu trên máy người xem (localStorage), không gửi đi đâu.
//   mhai-da-xem   [số video đã xem]                       (dùng chung với lo-trinh-nganh.js)
//   mhai-tram     {trang: {id: {lan, dau, ngay, d, tong}}} (kết quả trạm; dau/ngay: lần đầu/gần nhất; d/tong khi trạm chấm điểm;
//                 làm lại vào ngày khác lần đầu thì Hồ sơ học tính là Làm chủ)
//   mhai-hoat-dong ["YYYY-MM-DD", ...]                     (những ngày có học, giữ 120 ngày gần nhất)
//   mhai-da-mo    ["ten-trang.html", ...]                  (trang trò chơi, công cụ đã mở; Góc thực hành hiện dấu "Đã mở")
// Bị chặn localStorage (chế độ riêng tư) thì mọi hàm vẫn chạy, chỉ không nhớ.
(function () {
  function doc(k, mac) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? mac : v; } catch (e) { return mac; } }
  function ghi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function homNay() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function coHoc() {
    var ds = doc("mhai-hoat-dong", []), h = homNay();
    if (!Array.isArray(ds)) ds = [];
    if (ds[ds.length - 1] !== h) { ds.push(h); ghi("mhai-hoat-dong", ds.slice(-120)); }
  }
  var TD = {
    daXem: function () { var a = doc("mhai-da-xem", []); return Array.isArray(a) ? a.map(Number) : []; },
    xem: function (so) {
      so = Number(so); if (!so) return;
      var a = TD.daXem(); if (a.indexOf(so) < 0) { a.push(so); ghi("mhai-da-xem", a); }
      coHoc();
    },
    tram: function (trang, id, d, tong) {
      if (!trang || !id) return;
      var all = doc("mhai-tram", {}); if (!all || typeof all !== "object") all = {};
      var p = all[trang] || (all[trang] = {}), c = p[id] || { lan: 0 };
      c.lan = (c.lan || 0) + 1; c.ngay = homNay(); if (!c.dau) c.dau = c.ngay;
      if (tong) { c.d = d; c.tong = tong; if (!c.tot || d / tong > c.tot) c.tot = d / tong; }
      p[id] = c; ghi("mhai-tram", all); coHoc();
      try { document.dispatchEvent(new CustomEvent("mhai-tram", { detail: { trang: trang, id: id } })); } catch (e) {}
    },
    tramCua: function (trang) { var all = doc("mhai-tram", {}); return (all && all[trang]) || {}; },
    daMo: function () { var a = doc("mhai-da-mo", []); return Array.isArray(a) ? a : []; },
    tatCaTram: function () { var all = doc("mhai-tram", {}); return all && typeof all === "object" ? all : {}; },
    ngayHoc: function () { var a = doc("mhai-hoat-dong", []); return Array.isArray(a) ? a : []; },
    coHoc: coHoc,
    homNay: homNay
  };
  window.mhaiTD = TD;

  // Nhớ trang trò chơi, công cụ đã mở (không tính bài video và trang chủ)
  var tep = location.pathname.split("/").pop();
  if (tep && /\.html$/.test(tep) && !/\/bai\//.test(location.pathname) && tep !== "index.html") {
    var mo = TD.daMo(); if (mo.indexOf(tep) < 0) { mo.push(tep); ghi("mhai-da-mo", mo.slice(-200)); }
  }

  // Mỗi trạm (.bn-tram ở trang thực hành, phòng thí nghiệm) có hàng "Trạm này có ích không? 👍 👎"; bấm thì gửi sự kiện đếm
  // "tram-co-ich" (theo-doi.js, không kèm gì về người dùng) để biết trạm nào cần sửa.
  function hoiCoIch() {
    var EN = document.documentElement.lang === "en", trang = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    [].slice.call(document.querySelectorAll("section.bn-tram")).forEach(function (s) {
      if (s.querySelector(".td-co-ich")) return;
      var p = document.createElement("p"); p.className = "td-co-ich";
      p.appendChild(document.createTextNode(EN ? "Was this station useful? " : "Trạm này có ích không? "));
      [["1", "👍"], ["0", "👎"]].forEach(function (x) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = x[1];
        b.setAttribute("aria-label", x[0] === "1" ? (EN ? "Useful" : "Có ích") : (EN ? "Not useful" : "Chưa có ích"));
        b.addEventListener("click", function () {
          if (window.mhaiDo) window.mhaiDo("tram-co-ich", { trang: trang, tram: s.id.replace(/^tram-/, ""), co_ich: x[0] === "1" });
          p.textContent = EN ? "Thanks! 💙" : "Cảm ơn bạn! 💙";
        });
        p.appendChild(b);
      });
      s.appendChild(p);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hoiCoIch); else hoiCoIch();

  // Đếm lượt bấm lời mời ([data-cta] cuối bài video) và mọi nút trên các trang kiếm tiền (sự kiện "cta" qua theo-doi.js)
  document.addEventListener("click", function (e) {
    if (!window.mhaiDo || !e.target.closest) return;
    var c = e.target.closest("[data-cta]");
    if (c) { window.mhaiDo("cta", { loai: c.getAttribute("data-cta"), tu: tep || "index.html" }); return; }
    if (/^(dich-vu|workshop|bo-giao-vien|hop-tac|ung-ho)\.html$/.test(tep || "")) {
      var b = e.target.closest("a.btn, button.btn, a[href^='mailto:']");
      if (b) window.mhaiDo("cta", { loai: tep.replace(/\.html$/, ""), nut: (b.textContent || "").trim().slice(0, 40) });
    }
  });

  // Nút "Xóa dữ liệu học" ([data-xoa-du-lieu], trang Quyền riêng tư và Hồ sơ học): xóa mọi khóa mhai-* trừ giao diện và ngôn ngữ
  TD.xoaHet = function () {
    try {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf("mhai-") === 0 && k !== "mhai-theme" && k !== "mhai-lang") localStorage.removeItem(k); });
      return true;
    } catch (e) { return false; }
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-xoa-du-lieu]");
    if (!b) return;
    var EN = document.documentElement.lang === "en", bao = b.parentNode.querySelector(".td-xoa-bao");
    if (!confirm(EN ? "Delete all learning progress saved on this device? This cannot be undone." : "Xóa mọi tiến độ học lưu trên máy này? Không lấy lại được.")) return;
    var ok = TD.xoaHet();
    if (bao) bao.textContent = ok ? (EN ? "Deleted." : "Đã xóa.") : (EN ? "Couldn't delete (storage blocked)." : "Không xóa được (trình duyệt chặn lưu trữ).");
    if (ok && /ho-so\.html$/.test(location.pathname)) setTimeout(function () { location.reload(); }, 500);
  });

  // Trang bài video (bai/NN-...): ở lại 20 giây hoặc đọc tới cuối thì tính là đã xem video đó.
  var m = location.pathname.match(/\/bai\/(\d+)-[^/]*$/);
  if (m) {
    var so = +m[1], xong = false;
    var tinh = function () { if (!xong) { xong = true; TD.xem(so); } };
    setTimeout(tinh, 20000);
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) tinh();
    }, { passive: true });
  }
})();

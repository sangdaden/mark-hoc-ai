/* Đo tương tác bằng Umami (https://umami.is): đếm lượt xem trang và vài hành động, không dùng cookie.
   Không gửi tên, email hay chữ người xem gõ vào; chỉ gửi tên sự kiện và vài nhãn ngắn (góc, ngôn ngữ, chỗ bấm...).
   Mọi trang nạp file này trong <head>. Trang nào muốn đếm thêm thì gọi window.mhaiDo("ten-su-kien", { nhan: "..." }).
   Chạy thử trên máy: thêm ?do=thu vào địa chỉ trang, sự kiện được in ra console và lưu ở window.__do (không gửi đi đâu). */
(function () {
  var MA_WEB = ""; // mã website trên Umami (Website ID). Còn trống thì file này không gửi gì.
  var TEN_MIEN = "markhocai.com";

  var duong = location.pathname;
  var goc = /\/vu-tru-khac(\/|\.html|$)/.test(duong) ? "vu-tru-khac" : "hoc-ai";
  var ngon_ngu = /^\/en(\/|$)/.test(duong) ? "en" : "vi";
  var thu = /[?&]do=thu(&|$)/.test(location.search);
  var bat = !!MA_WEB && location.hostname === TEN_MIEN && navigator.doNotTrack !== "1";
  var hang = [];

  function gui(ten, du_lieu) {
    var d = { goc: goc, ngon_ngu: ngon_ngu };
    for (var k in du_lieu || {}) d[k] = du_lieu[k];
    if (thu) {
      (window.__do = window.__do || []).push([ten, d]);
      console.log("[đo]", ten, d);
      return;
    }
    if (!bat) return;
    if (window.umami && typeof window.umami.track === "function") window.umami.track(ten, d);
    else if (hang.length < 50) hang.push([ten, d]);
  }
  window.mhaiDo = gui;

  if (bat && !thu) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://cloud.umami.is/script.js";
    s.setAttribute("data-website-id", MA_WEB);
    s.setAttribute("data-domains", TEN_MIEN);
    s.setAttribute("data-tag", goc); // lọc riêng Mark học AI và Mark ở Vũ Trụ Khác trong Umami
    s.setAttribute("data-do-not-track", "true");
    s.onload = function () {
      var h = hang;
      hang = [];
      h.forEach(function (x) { window.umami.track(x[0], x[1]); });
    };
    document.head.appendChild(s);
  }
  if (!bat && !thu) return;

  // Bấm sang kênh, ủng hộ, email
  var KENH = [
    ["facebook-vu-tru-khac", /facebook\.com\/markovutrukhac/i],
    ["youtube", /youtube\.com|youtu\.be/i],
    ["facebook", /facebook\.com|fb\.watch/i],
    ["tiktok", /tiktok\.com/i],
    ["instagram", /instagram\.com/i],
    ["threads", /threads\.(com|net)/i],
    ["discord", /discord\.(gg|com)/i]
  ];
  function cho_bam(a) {
    if (a.closest("header")) return "dau-trang";
    if (a.closest("footer")) return "chan-trang";
    if (a.closest(".bit-tl")) return "bit";
    return "noi-dung";
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var cho = cho_bam(a);
    if (/^mailto:/i.test(href)) return gui("bam-email", { cho: cho });
    if (/(^|\/)ung-ho\.html/.test(href)) return gui("bam-ung-ho", { cho: cho });
    if (/^https?:/i.test(href)) {
      for (var i = 0; i < KENH.length; i++) {
        if (KENH[i][1].test(href)) return gui("bam-kenh", { kenh: KENH[i][0], cho: cho });
      }
    }
  }, true);

  // Hỏi Bit: chỉ đếm số câu hỏi, không gửi nội dung câu hỏi
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f && f.closest && f.closest(".bit-tl")) gui("hoi-bit", { cho: "bit-noi" });
    else if (/\/hoi-bit(\.html)?$/.test(duong)) gui("hoi-bit", { cho: "trang-hoi-bit" });
  }, true);
  document.addEventListener("click", function (e) {
    if (/\/hoi-bit(\.html)?$/.test(duong) && e.target.closest && e.target.closest(".hb-goi-y button")) gui("hoi-bit", { cho: "goi-y" });
  }, true);

  // Từ điển: đếm lượt tra và tra có ra kết quả không, không gửi chữ đã gõ
  if (/\/tu-dien(\.html)?$/.test(duong)) {
    document.addEventListener("DOMContentLoaded", function () {
      var o = document.getElementById("loc"), rong = document.getElementById("rong"), hen, so_lan = 0;
      if (!o) return;
      o.addEventListener("input", function () {
        clearTimeout(hen);
        hen = setTimeout(function () {
          if (o.value.trim().length < 2 || so_lan++ >= 10) return;
          gui("tra-tu-dien", { tim_thay: rong && !rong.hidden ? "khong" : "co" });
        }, 1500);
      });
    });
  }

  // Đọc bài đến cuối: cuộn qua 75% trang bài viết hoặc bài sách
  var ten_bai = (duong.match(/\/(bai|vu-tru-khac)\/([^\/.]+)(\.html)?$/) || [])[2];
  if (ten_bai) {
    var luc_vao = Date.now();
    var da_gui = false;
    var xem_cuon = function () {
      if (da_gui) return;
      var cao = document.documentElement.scrollHeight;
      if (cao > 0 && window.scrollY + window.innerHeight >= cao * 0.75) {
        da_gui = true;
        var phut = (Date.now() - luc_vao) / 60000;
        gui("doc-den-cuoi", { bai: ten_bai, thoi_gian: phut < 1 ? "duoi-1-phut" : phut < 3 ? "1-3-phut" : phut < 10 ? "3-10-phut" : "tren-10-phut" });
        window.removeEventListener("scroll", xem_cuon);
      }
    };
    window.addEventListener("scroll", xem_cuon, { passive: true });
  }

  // Người quay lại: chỉ lưu thời điểm ghé gần nhất trên máy người xem
  try {
    var KHOA = "mhai-do-lan-cuoi";
    var truoc = +localStorage.getItem(KHOA) || 0;
    var bay_gio = Date.now();
    if (truoc && bay_gio - truoc > 30 * 60000) {
      var ngay = (bay_gio - truoc) / 86400000;
      gui("quay-lai", { sau: ngay < 1 ? "trong-ngay" : ngay <= 7 ? "1-7-ngay" : "hon-7-ngay" });
    }
    localStorage.setItem(KHOA, String(bay_gio));
  } catch (e) {}

  // Lỗi JavaScript: tối đa 3 lỗi mỗi lần mở trang, cắt ngắn nội dung
  var so_loi = 0;
  window.addEventListener("error", function (e) {
    if (so_loi++ >= 3) return;
    var file = String(e.filename || "").split("/").pop().split("?")[0];
    gui("loi-js", { loi: String(e.message || "").slice(0, 120), file: file || "trong-trang" });
  });
})();

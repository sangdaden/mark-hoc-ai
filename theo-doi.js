/* Đo tương tác bằng Umami (https://umami.is): đếm lượt xem trang và vài hành động, không dùng cookie.
   Không gửi tên, email hay chữ người xem gõ vào; chỉ gửi tên sự kiện và vài nhãn ngắn (góc, ngôn ngữ, chỗ bấm...).
   Mọi trang nạp file này trong <head>. Trang nào muốn đếm thêm thì gọi window.mhaiDo("ten-su-kien", { nhan: "..." }).
   Chạy thử trên máy: thêm ?do=thu vào địa chỉ trang, sự kiện được in ra console và lưu ở window.__do (không gửi đi đâu). */
(function () {
  var MA_WEB = "675f1509-0d09-44bb-98de-9d4c51aaadd9"; // mã website trên Umami (Website ID). Còn trống thì file này không gửi gì.
  var TEN_MIEN = "markhocai.com";

  var duong = location.pathname;
  var goc = /\/vu-tru-khac(\/|\.html|$)/.test(duong) ? "vu-tru-khac" : "hoc-ai";
  var ngon_ngu = /^\/en(\/|$)/.test(duong) ? "en" : "vi";
  var thu = /[?&]do=thu(&|$)/.test(location.search);
  var bat = !!MA_WEB && location.hostname === TEN_MIEN && navigator.doNotTrack !== "1";
  var hang = [];
  // 3 game mới (Sang chốt đo 20/10): mỗi game tự đặt tên sự kiện riêng, nên ở đây gửi thêm một cặp chung
  // "tro-bat-dau" / "tro-xong" có nhãn tro = tên game, để bảng số liệu so được ba game với nhau.
  var TRO_MOI = (duong.match(/\/(chan-lua|dem-lai-xe|duong-doan-chu)(\.html)?$/) || [])[1];

  function gui(ten, du_lieu) {
    var d = { goc: goc, ngon_ngu: ngon_ngu };
    for (var k in du_lieu || {}) d[k] = du_lieu[k];
    if (TRO_MOI && ten.indexOf("tro-") !== 0) {
      var buoc = /-bat-dau$/.test(ten) && ten !== "kiem-tra-bat-dau" ? "bat-dau" : /^(game-xong|game-qua-man|duong-doan-chu-xong)$/.test(ten) ? "xong" : "";
      if (buoc) gui("tro-" + buoc, { tro: TRO_MOI, man: String(d.man || "") });
    }
    // Thẻ chiêu lừa ở Trạm chống lừa đảo: tram-lua-dao.js gửi "tram-lua-dao" (hanh_dong mo-the); tách riêng để đếm theo từng thẻ.
    // tu = "link" khi thẻ mở từ link ?chieu= (bình luận đầu video), "bam" khi người xem tự bấm.
    if (ten === "tram-lua-dao" && d.hanh_dong === "mo-the") {
      var tu_link = !gui.da_link && (new URLSearchParams(location.search).get("chieu") === d.chieu || location.hash === "#chieu-" + d.chieu);
      if (tu_link) gui.da_link = true;
      gui("the-chieu-lua", { chieu: d.chieu, tu: tu_link ? "link" : "bam" });
    }
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

  // Gợi ý đổi ngôn ngữ (chạy cả khi không đo, nên đặt trước dòng dừng bên dưới): trình duyệt không có
  // ngôn ngữ của trang, ở ngoài Việt Nam (đoán theo múi giờ), và trang có bản kia (link hreflang). Một dải nhỏ nằm trong trang, ngay dưới thanh menu
  // (không nổi đè lên chữ hay nút Bit), bấm × thì không hiện lại. Trang không có thanh menu lẫn <main> thì mới nổi ở cuối màn hình.
  function goiYNgonNgu() {
    try {
      var KHOA_TAT = "mhai-goi-y-ngon-ngu-tat";
      if (localStorage.getItem(KHOA_TAT)) return;
      var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]).map(function (l) { return String(l).toLowerCase(); });
      var co_vi = langs.some(function (l) { return l.indexOf("vi") === 0; });
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "");
      var o_vn = /^Asia\/(Ho_Chi_Minh|Saigon)$/.test(tz);
      var sang = ngon_ngu === "vi" ? "en" : "vi";
      if (ngon_ngu === "vi" ? (co_vi || o_vn) : !co_vi) return;
      var lk = document.querySelector('link[rel="alternate"][hreflang="' + sang + '"]');
      if (!lk) return;
      var den = lk.getAttribute("href").replace(/^https:\/\/markhocai\.com/, "");
      if (!den || den === duong) return;
      var chu = sang === "en" ? ["This page is also in English", "Read in English", "Close"] : ["Trang này có bản tiếng Việt", "Đọc bằng tiếng Việt", "Đóng"];
      var bar = document.createElement("div");
      bar.id = "goi-y-ngon-ngu";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", chu[0]);
      bar.setAttribute("translate", "no");
      var menu = document.querySelector(".band > header.top"), chinh = menu || document.querySelector("main");
      bar.style.cssText = (chinh ? "position:relative;box-sizing:border-box;width:min(1240px,calc(100% - 32px));margin:" + (menu ? "4px auto 8px;" : "12px auto 0;")
        : "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:460px;margin:0 auto;") + "display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:#0b2545;color:#fff;font:14px/1.4 Inter,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25)";
      var t = document.createElement("span"); t.textContent = chu[0]; t.style.flex = "1";
      var a = document.createElement("a"); a.href = den + location.hash; a.lang = sang; a.textContent = chu[1] + " \u203a";
      a.style.cssText = "color:#0b2545;background:#ffd166;border-radius:8px;padding:6px 10px;font-weight:600;text-decoration:none;white-space:nowrap";
      a.addEventListener("click", function () { gui("doi-ngon-ngu", { sang: sang }); });
      var x = document.createElement("button"); x.type = "button"; x.textContent = "\u00d7"; x.setAttribute("aria-label", chu[2]);
      x.style.cssText = "background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;min-width:40px;min-height:40px;margin:-8px -6px -8px 0";
      x.addEventListener("click", function () { try { localStorage.setItem(KHOA_TAT, "1"); } catch (e) {} bar.remove(); });
      bar.appendChild(t); bar.appendChild(a); bar.appendChild(x);
      if (menu) menu.after(bar); else if (chinh) chinh.before(bar); else document.body.appendChild(bar);
      gui("goi-y-ngon-ngu", { sang: sang });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", goiYNgonNgu);
  else goiYNgonNgu();

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
    if (/facebook\.com\/sharer/i.test(href)) return gui("chia-se", { cach: "facebook" });
    // Tải sách PDF miễn phí (nút ở sach.html và trang chủ, VI + EN); trang = trang có nút
    if (/(^|\/)assets\/sach\/[^\/?#]+\.pdf([?#]|$)/i.test(href)) return gui("tai-sach", { trang: duong.replace(/^\/en(\/|$)/, "/").replace(/\.html$/, "").replace(/^\/$/, "/index").slice(1) || "index", cho: cho });
    if (/^https?:/i.test(href)) {
      for (var i = 0; i < KENH.length; i++) {
        if (KENH[i][1].test(href)) return gui("bam-kenh", { kenh: KENH[i][0], cho: cho });
      }
    }
  }, true);

  // Chia sẻ cuối bài: nút chia sẻ của máy, chép link (nút Facebook là link, đếm ở trên)
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-chia-se], [data-chep-link]") : null;
    if (b) gui("chia-se", { cach: b.hasAttribute("data-chia-se") ? "may" : "chep-link" });
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
    // "ResizeObserver loop..." là cảnh báo vô hại của trình duyệt, không phải lỗi trang
    if (/ResizeObserver loop/.test(String(e.message || ""))) return;
    if (so_loi++ >= 3) return;
    var file = String(e.filename || "").split("/").pop().split("?")[0];
    // ghi kèm trang và file ngay trong nhãn "loi" (bảng số liệu tuần chỉ chia theo nhãn này)
    var cho = duong.replace(/\.html$/, "").slice(-50) + " · " + (file || "trong-trang") + ": ";
    gui("loi-js", { loi: (cho + String(e.message || "")).slice(0, 200), file: file || "trong-trang" });
  });
})();

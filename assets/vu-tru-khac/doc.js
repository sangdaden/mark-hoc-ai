// Trang đọc sách "Mark ở vũ trụ khác": thanh tiến độ đọc (màu bìa) và tô sáng mục đang đọc trong mục lục.
// Gắn vào mọi trang sách bởi scripts/tao_vu_tru_khac.py.
(function () {
  var thanh = document.createElement("div");
  thanh.className = "vtk-tien-do";
  thanh.setAttribute("aria-hidden", "true");
  thanh.innerHTML = "<i></i>";
  document.body.appendChild(thanh);
  var vach = thanh.firstChild;

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var muc = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });

  var cho = false;
  function capNhat() {
    cho = false;
    var goc = document.documentElement;
    var het = goc.scrollHeight - goc.clientHeight;
    vach.style.transform = "scaleX(" + (het > 0 ? Math.min(1, goc.scrollTop / het) : 0) + ")";
    // Mục đang đọc: mục cuối cùng có đầu đã qua 1/3 màn hình
    var dang = -1, moc = window.innerHeight / 3;
    muc.forEach(function (m, i) { if (m && m.getBoundingClientRect().top <= moc) dang = i; });
    if (het > 0 && goc.scrollTop >= het - 2) dang = muc.length - 1;
    links.forEach(function (a, i) {
      if (i === dang) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    // Mục lục dạng hàng chip trên điện thoại: kéo chip đang đọc vào tầm nhìn
    var a = links[dang], toc = a && a.parentNode;
    if (a && toc.scrollWidth > toc.clientWidth) {
      var trai = a.offsetLeft - toc.offsetLeft;
      if (trai < toc.scrollLeft || trai + a.offsetWidth > toc.scrollLeft + toc.clientWidth)
        toc.scrollTo({ left: trai - 16, behavior: "smooth" });
    }
  }
  function hen() { if (!cho) { cho = true; requestAnimationFrame(capNhat); } }
  addEventListener("scroll", hen, { passive: true });
  addEventListener("resize", hen);
  capNhat();
})();

// Nút đổi giao diện sáng/tối trên thanh trên cùng (cùng cách trang chính: data-theme trên <html>, nhớ ở localStorage "mhai-theme").
// doc.css đã có màu cho cả hai giao diện; nút có sẵn trong trang (hidden) để không giật thanh khi script chạy.
(function () {
  var nut = document.querySelector(".mhai-thanh .mhai-theme");
  if (!nut) return;
  var EN = document.documentElement.lang === "en";
  var MAT_TROI = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var TRANG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  function toi() {
    return (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  }
  function ve() {
    var t = toi();
    nut.innerHTML = (t ? MAT_TROI : TRANG) + "<b>" + (t ? (EN ? "Light" : "Sáng") : (EN ? "Dark" : "Tối")) + "</b>";
    nut.setAttribute("aria-label", EN ? (t ? "Switch to light theme" : "Switch to dark theme") : (t ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"));
  }
  nut.addEventListener("click", function () {
    var t = toi() ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("mhai-theme", t); } catch (e) {}
    ve();
  });
  ve();
  nut.hidden = false;
})();

// Phóng to sơ đồ: mỗi hình (figure hoặc .svgbox có SVG) có nút "Phóng to" ở góc, bấm mở hộp toàn màn hình với bản sao của
// sơ đồ vừa khít màn hình, nút + / − đổi cỡ (chữ to theo), kéo hoặc chụm hai ngón để xem; Esc hoặc nút Đóng để thoát. Thanh tiến độ đọc
// gắn vào mép dưới thanh trên cùng (doc.css) nên không đè nút quay về.
(function () {
  var thanhTren = document.querySelector(".mhai-thanh"), tienDo = document.querySelector(".vtk-tien-do");
  if (thanhTren && tienDo) thanhTren.appendChild(tienDo);

  var EN = document.documentElement.lang === "en";
  var CHU = EN ? { mo: "Zoom", dong: "Close", to: "Zoom in", nho: "Zoom out", ten: "Diagram" }
               : { mo: "Phóng to", dong: "Đóng", to: "Phóng to thêm", nho: "Thu nhỏ", ten: "Sơ đồ" };
  var KINH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/></svg>';
  var CONG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var TRU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
  var DONG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var hop = null, khung, ten, coHienTai = 1, rongGoc = 0, tiLe = 1, hinhDangXem = null;
  function taoHop() {
    hop = document.createElement("dialog");
    hop.className = "vtk-xem-hinh";
    hop.innerHTML = '<div class="cong-cu"><b></b><button type="button" data-co="-1" aria-label="' + CHU.nho + '">' + TRU + '</button>' +
      '<button type="button" data-co="1" aria-label="' + CHU.to + '">' + CONG + '</button>' +
      '<button type="button" data-dong>' + DONG + '<span>' + CHU.dong + '</span></button></div><div class="khung"></div>';
    khung = hop.querySelector(".khung"); ten = hop.querySelector("b");
    hop.addEventListener("click", function (e) {
      var nut = e.target.closest("button");
      if (!nut) return;
      if (nut.hasAttribute("data-dong")) { hop.close(); return; }
      datCo(coHienTai * (nut.getAttribute("data-co") === "1" ? 1.4 : 1 / 1.4));
    });
    hop.addEventListener("close", function () { khung.innerHTML = ""; if (hinhDangXem) hinhDangXem.focus(); });
    document.body.appendChild(hop);
  }
  function datCo(c) {
    coHienTai = Math.max(1, Math.min(4, c));
    var svg = khung.querySelector("svg");
    if (!svg) return;
    // Giữ nguyên điểm đang xem ở giữa khung khi đổi cỡ, để bấm + không bị trôi sang một góc trống
    var tx = (khung.scrollLeft + khung.clientWidth / 2) / khung.scrollWidth, ty = (khung.scrollTop + khung.clientHeight / 2) / khung.scrollHeight;
    // Đặt cả rộng lẫn cao bằng px: Safari trên iPhone tính sai chiều cao "auto" của SVG không có width/height
    svg.style.width = Math.round(rongGoc * coHienTai) + "px";
    svg.style.height = Math.round(rongGoc * coHienTai * tiLe) + "px";
    khung.scrollLeft = tx * khung.scrollWidth - khung.clientWidth / 2;
    khung.scrollTop = ty * khung.scrollHeight - khung.clientHeight / 2;
  }
  function mo(goc, nut) {
    if (!hop) taoHop();
    hinhDangXem = nut;
    var ban = goc.cloneNode(true);
    var tieuDe = goc.querySelector("title");
    ban.removeAttribute("aria-labelledby");
    Array.prototype.forEach.call(ban.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
    if (tieuDe) ban.setAttribute("aria-label", tieuDe.textContent.trim());
    ban.removeAttribute("width"); ban.removeAttribute("height"); ban.style.minWidth = "0";
    var chu = goc.closest("figure, .concept, section");
    var cap = chu && chu.querySelector("figcaption b, h3, h2");
    ten.textContent = cap ? cap.textContent.trim() : CHU.ten;
    khung.innerHTML = ""; khung.appendChild(ban);
    hop.showModal();
    // Mở ra vừa khít màn hình (cả bề ngang lẫn bề cao), căn giữa; bấm + để phóng to rồi kéo để xem từng phần
    var vb = goc.viewBox && goc.viewBox.baseVal, r = goc.getBoundingClientRect();
    tiLe = vb && vb.width && vb.height ? vb.height / vb.width : (r.width ? r.height / r.width : 1);
    rongGoc = Math.max(100, Math.min(khung.clientWidth - 32, (khung.clientHeight - 32) / tiLe));
    khung.scrollLeft = 0; khung.scrollTop = 0;
    datCo(1);
  }

  var daGan = [];
  Array.prototype.forEach.call(document.querySelectorAll("figure svg, .svgbox svg"), function (svg) {
    if (svg.closest("header, .ecard, .rule, .mhai-thanh, .vtk-phong")) return;
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || vb.width < 300) return;
    var chua = svg.closest("figure") || svg.closest(".svgbox");
    if (daGan.indexOf(chua) >= 0) return;
    daGan.push(chua);
    chua.classList.add("vtk-co-phong");
    var nut = document.createElement("button");
    nut.type = "button"; nut.className = "vtk-phong";
    nut.innerHTML = KINH + "<span>" + CHU.mo + "</span>";
    nut.setAttribute("aria-label", CHU.mo);
    nut.addEventListener("click", function () { mo(svg, nut); });
    // Chạm vào sơ đồ cũng mở (trừ khi bấm vào link hay nút bên trong)
    svg.style.cursor = "zoom-in";
    svg.addEventListener("click", function (e) { if (!e.target.closest("a, button")) mo(svg, nut); });
    chua.appendChild(nut);
  });
})();

// Thời gian đọc còn lại trong cột tiện ích: số phút cả bài (script tính từ số chữ, 200 chữ/phút) nhân phần chưa cuộn tới.
(function () {
  var o = document.querySelector(".vtk-con-lai");
  if (!o) return;
  var tong = +o.dataset.phut, EN = o.dataset.chu === "en", cho = false;
  function ve() {
    cho = false;
    var g = document.documentElement, het = g.scrollHeight - g.clientHeight, con = Math.ceil(tong * (1 - (het > 0 ? g.scrollTop / het : 0)));
    o.textContent = con < 1 ? (EN ? "almost done" : "sắp xong rồi") : (EN ? "about " + con + " min read" : "khoảng " + con + " phút đọc");
  }
  addEventListener("scroll", function () { if (!cho) { cho = true; requestAnimationFrame(ve); } }, { passive: true });
  ve();
})();

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

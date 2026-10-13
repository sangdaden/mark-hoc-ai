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

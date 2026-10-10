// Nút "Đầu trang" cho mọi trang con (trang chủ có sẵn nút trong index.html + app.js); trang con ngắn hơn nên hiện sớm hơn (400px)
// Nút "Lướt xuống" bên trái nút Đầu trang (mọi trang, cả trang chủ): mỗi lần bấm cuộn êm xuống khoảng một màn hình, không nhảy tới cuối trang
(function () {
  const EN = document.documentElement.lang === "en";
  const giam = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let a = document.getElementById("len-dau");
  if (!a) {
    a = document.createElement("a");
    a.className = "to-top"; a.id = "len-dau"; a.href = "#"; a.hidden = true;
    a.setAttribute("aria-label", EN ? "Back to top" : "Lên đầu trang");
    a.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + (EN ? "Top" : "Đầu trang") + "</span>";
    document.body.appendChild(a);
    const capNhat = () => { a.hidden = window.scrollY < 400; };
    window.addEventListener("scroll", capNhat, { passive: true });
    capNhat();
    a.addEventListener("click", e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: giam() ? "instant" : "smooth" });
      const brand = document.querySelector(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  const x = document.createElement("button");
  x.type = "button"; x.className = "to-top xuong-nhanh"; x.hidden = true;
  x.setAttribute("aria-label", EN ? "Scroll down" : "Lướt xuống");
  x.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  a.after(x);
  // Ẩn khi trang ngắn hoặc đã gần cuối trang (còn chưa tới nửa màn hình)
  const capNhatX = () => { x.hidden = window.scrollY + innerHeight * 1.5 >= document.documentElement.scrollHeight; };
  window.addEventListener("scroll", capNhatX, { passive: true });
  window.addEventListener("resize", capNhatX);
  new ResizeObserver(capNhatX).observe(document.body);
  capNhatX();
  x.addEventListener("click", () => window.scrollBy({ top: Math.round(innerHeight * 0.8), behavior: giam() ? "instant" : "smooth" }));
})();

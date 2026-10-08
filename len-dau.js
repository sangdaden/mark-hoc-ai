// Nút "Đầu trang" cho mọi trang con (trang chủ có sẵn nút trong index.html + app.js); trang con ngắn hơn nên hiện sớm hơn (400px)
(function () {
  if (document.getElementById("len-dau")) return;
  const a = document.createElement("a");
  a.className = "to-top"; a.id = "len-dau"; a.href = "#"; a.hidden = true;
  a.setAttribute("aria-label", "Lên đầu trang");
  a.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Đầu trang</span>';
  document.body.appendChild(a);
  const capNhat = () => { a.hidden = window.scrollY < 400; };
  window.addEventListener("scroll", capNhat, { passive: true });
  capNhat();
  a.addEventListener("click", e => {
    e.preventDefault();
    const giam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: giam ? "instant" : "smooth" });
    const brand = document.querySelector(".brand");
    if (brand) brand.focus({ preventScroll: true });
  });
})();

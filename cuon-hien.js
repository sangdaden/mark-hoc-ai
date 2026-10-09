// Cuộn tới đâu hiện tới đó: các khối nằm dưới màn hình lúc mở trang sẽ mờ dần lên khi cuộn tới (khối đã thấy sẵn thì giữ nguyên).
// Video do app.js vẽ sau cũng được theo dõi. Người xem bật "giảm chuyển động" hoặc trình duyệt cũ thì mọi thứ hiện bình thường.
(function () {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const main = document.querySelector("main");
  if (!main) return;
  // Chỉ làm hiện các khối "trong cùng": khối nào còn chứa khối khác trong danh sách thì để các khối con tự hiện lần lượt
  const SEL = "main section > *, main > aside, main > figure, main .series-grid > *, main .today-list > *, main .nav-cards > *";
  const daXet = new WeakSet();
  const io = new IntersectionObserver(ds => ds.forEach(d => {
    if (!d.isIntersecting) return;
    d.target.classList.add("da-hien");
    io.unobserve(d.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  const quet = () => {
    const ds = main.querySelectorAll(SEL), cao = innerHeight;
    let tre = 0, dongTruoc = -1;
    ds.forEach(el => {
      if (daXet.has(el)) return;
      daXet.add(el);
      if (el.querySelector(SEL) || el.hidden) return;
      // Khung đã chờ hiện mà nay có khối con (app.js vẽ thêm) thì bỏ khung, để các khối con tự hiện
      const cha = el.parentElement.closest(".cho-hien");
      if (cha) { cha.classList.remove("cho-hien"); io.unobserve(cha); }
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top < cao) return; // đã ở trên hoặc trong màn hình
      // Khối cùng hàng (lưới thẻ) hiện so le một chút cho thấy thứ tự trái sang phải
      tre = Math.round(r.top) === dongTruoc ? Math.min(tre + 70, 280) : 0;
      dongTruoc = Math.round(r.top);
      if (tre) el.style.transitionDelay = tre + "ms";
      el.classList.add("cho-hien");
      io.observe(el);
    });
  };
  document.documentElement.classList.add("cuon-hien");
  quet();
  let hen = 0;
  new MutationObserver(() => { cancelAnimationFrame(hen); hen = requestAnimationFrame(quet); }).observe(main, { childList: true, subtree: true });
})();

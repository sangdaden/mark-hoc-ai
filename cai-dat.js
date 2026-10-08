// Thanh đầu mọi trang: nút đổi giao diện sáng/tối, lưu trên máy người xem (đọc sớm ở <head> để không nháy)
(function () {
  const top = document.querySelector(".top");
  if (!top) return;
  const hop = document.createElement("div");
  hop.className = "top-tools";
  hop.innerHTML = '<button type="button" class="nut-theme"></button>';
  top.appendChild(hop);
  const nut = hop.querySelector(".nut-theme");
  const toi = () => (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const ve = () => {
    nut.innerHTML = toi() ? '<span aria-hidden="true">☀️</span>Sáng' : '<span aria-hidden="true">🌙</span>Tối';
    nut.setAttribute("aria-label", toi() ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
  };
  nut.addEventListener("click", () => {
    const t = toi() ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("mhai-theme", t); } catch (e) {}
    ve();
  });
  ve();
})();

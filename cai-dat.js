// Thanh đầu mọi trang: link đổi ngôn ngữ (Tiếng Việt / English) và nút đổi giao diện sáng/tối, lưu trên máy người xem (đọc sớm ở <head> để không nháy)
(function () {
  const top = document.querySelector(".top");
  if (!top) return;
  const EN = document.documentElement.lang === "en";
  // Gốc trang web lấy từ đường dẫn của chính file này; bản tiếng Anh nằm ở <gốc>/en/ với cùng tên file
  const me = document.currentScript;
  let doiNgu = "", icGoc = "";
  try { icGoc = new URL(".", me ? me.src : location.href).href; } catch (e) {}
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + icGoc + 'assets/icons.svg#i-' + n + '"/></svg>';
  try {
    const goc = new URL(".", me ? me.src : location.href);
    const duong = location.pathname;
    if (duong.indexOf(goc.pathname) === 0) {
      const con = duong.slice(goc.pathname.length);
      const dich = EN ? (con.indexOf("en/") === 0 ? con.slice(3) : con) : "en/" + con;
      doiNgu = goc.href + dich + location.search + location.hash;
    }
  } catch (e) {}
  const hop = document.createElement("div");
  hop.className = "top-tools";
  hop.innerHTML = (doiNgu ? '<a class="nut-lang" lang="' + (EN ? "vi" : "en") + '" hreflang="' + (EN ? "vi" : "en") + '" href="' + doiNgu.replace(/"/g, "%22") + '" aria-label="' +
    (EN ? "Chuyển sang tiếng Việt" : "Switch to English") + '">' + ic("languages") + (EN ? "VI" : "EN") + "</a>" : "") +
    '<button type="button" class="nut-theme"></button>';
  top.appendChild(hop);
  const lang = hop.querySelector(".nut-lang");
  if (lang) lang.addEventListener("click", () => {
    // Bắt kịp #mục đang xem (có thể đổi sau khi trang tải) và ghi nhớ lựa chọn; không tự chuyển trang
    lang.href = lang.href.split("#")[0] + location.hash;
    try { localStorage.setItem("mhai-lang", EN ? "vi" : "en"); } catch (e) {}
  });
  const nut = hop.querySelector(".nut-theme");
  const toi = () => (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const ve = () => {
    nut.innerHTML = toi() ? ic("sun") + (EN ? "Light" : "Sáng") : ic("moon") + (EN ? "Dark" : "Tối");
    nut.setAttribute("aria-label", EN ? (toi() ? "Switch to light theme" : "Switch to dark theme") : (toi() ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"));
  };
  nut.addEventListener("click", () => {
    const t = toi() ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("mhai-theme", t); } catch (e) {}
    ve();
  });
  ve();
})();

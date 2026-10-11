// Có bản mới thì báo: mỗi lần đăng, máy chủ ghi mã phiên bản vào phien-ban.json (pages.yml); trang đang mở so với mã của chính nó
// khi người xem quay lại tab và mỗi 5 phút, khác thì hiện thanh "Tải lại" để khỏi phải bấm Cmd+R
(function () {
  const me = document.currentScript;
  const m = me && /[?&]v=([^&#]+)/.exec(me.src);
  if (!m || m[1] === "dev") return; // xem trên máy (chưa đăng) thì bỏ qua
  const EN = document.documentElement.lang === "en";
  let url = "", daBao = false, lanCuoi = 0;
  try { url = new URL("phien-ban.json", me.src).href; } catch (e) { return; }
  const bao = () => {
    if (daBao) return;
    daBao = true;
    const t = document.createElement("div");
    t.className = "ban-moi";
    t.setAttribute("role", "status");
    t.innerHTML = "<span>" + (EN ? "This page has been updated." : "Trang vừa có bản mới.") + "</span>" +
      '<button type="button" class="ban-moi-tai">' + (EN ? "Reload" : "Tải lại") + "</button>" +
      '<button type="button" class="ban-moi-dong" aria-label="' + (EN ? "Dismiss" : "Đóng") + '">×</button>';
    t.querySelector(".ban-moi-tai").addEventListener("click", () => location.reload());
    t.querySelector(".ban-moi-dong").addEventListener("click", () => t.remove());
    document.body.appendChild(t);
  };
  const kiem = () => {
    if (daBao || document.hidden || Date.now() - lanCuoi < 60000) return;
    lanCuoi = Date.now();
    fetch(url + "?t=" + lanCuoi, { cache: "no-store" }).then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.v && d.v !== m[1]) bao(); }).catch(() => {});
  };
  document.addEventListener("visibilitychange", kiem);
  setInterval(kiem, 300000);
  setTimeout(kiem, 5000);
})();

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
    '<button type="button" class="nut-theme"></button>' +
    '<button type="button" class="nut-menu" aria-expanded="false">' + ic("menu") + '<span class="nhan">Menu</span></button>';
  top.appendChild(hop);

  // Menu "Lộ trình ▾" gom Lộ trình theo ngành và Lộ trình 7 ngày cho đầu trang khỏi tràn hàng (Sang 11/10/2026).
  // index.html và lo-trinh-nganh.html (cả bản en/) viết sẵn <details class="nav-drop">; các trang khác (bài viết, từ điển...) của cả hai thứ tiếng được ghép ở đây.
  const navTrang = top.querySelector(".top-links");
  const a7 = navTrang && navTrang.querySelector('a[href$="lo-trinh-7-ngay.html"]');
  if (a7 && !a7.closest(".nav-drop")) {
    const truoc = a7.getAttribute("href").replace(/lo-trinh-7-ngay\.html$/, "");
    const d = document.createElement("details");
    d.className = "nav-drop";
    d.innerHTML = "<summary" + (a7.hasAttribute("aria-current") ? ' class="is-cur"' : "") + '>' + (EN ? "Learning paths" : "Lộ trình") + '<svg class="nav-drop-mui" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>' +
      '<div class="nav-drop-ds"><a href="' + truoc + 'lo-trinh-nganh.html">' + (EN ? "Path by field" : "Lộ trình theo ngành") + "</a></div>";
    a7.replaceWith(d);
    d.querySelector(".nav-drop-ds").appendChild(a7);
  }
  // Bấm ra ngoài hoặc Esc thì đóng menu thả xuống
  const dsDrop = top.querySelectorAll(".nav-drop");
  if (dsDrop.length) {
    document.addEventListener("click", e => dsDrop.forEach(d => { if (d.open && !d.contains(e.target)) d.open = false; }));
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      dsDrop.forEach(d => { if (d.open) { d.open = false; d.querySelector("summary").focus(); } });
    });
  }

  // Điện thoại: các link trang gom vào nút Menu cho đầu trang gọn một hàng (máy tính vẫn hiện đủ)
  const nav = top.querySelector(".top-links"), nutMenu = hop.querySelector(".nut-menu");
  if (nav) {
    nav.id = nav.id || "menu-trang";
    nutMenu.setAttribute("aria-controls", nav.id);
    nutMenu.setAttribute("aria-label", EN ? "Open the menu" : "Mở menu");
    const dongMo = mo => { top.classList.toggle("mo-menu", mo); nutMenu.setAttribute("aria-expanded", mo); };
    nutMenu.addEventListener("click", () => dongMo(!top.classList.contains("mo-menu")));
    nav.addEventListener("click", e => { if (e.target.closest("a")) dongMo(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && top.classList.contains("mo-menu")) { dongMo(false); nutMenu.focus(); } });
  } else nutMenu.remove();
  const lang = hop.querySelector(".nut-lang");
  if (lang) lang.addEventListener("click", () => {
    // Bắt kịp #mục đang xem (có thể đổi sau khi trang tải) và ghi nhớ lựa chọn; không tự chuyển trang
    lang.href = lang.href.split("#")[0] + location.hash;
    try { localStorage.setItem("mhai-lang", EN ? "vi" : "en"); } catch (e) {}
  });
  const nut = hop.querySelector(".nut-theme");
  const toi = () => (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const ve = () => {
    nut.innerHTML = toi() ? ic("sun") + '<span class="nhan">' + (EN ? "Light" : "Sáng") + "</span>" : ic("moon") + '<span class="nhan">' + (EN ? "Dark" : "Tối") + "</span>";
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

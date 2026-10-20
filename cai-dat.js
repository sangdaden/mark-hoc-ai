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
  // Nút "Vũ Trụ Khác" (góc đọc sách ngoài AI) ở góc phải đầu trang, trước nút ngôn ngữ (Sang 13/10: chỗ đó đang trống);
  // nút ở chân trang vẫn giữ. Điện thoại chỉ còn biểu tượng quỹ đạo như các nút bên cạnh
  const vtk = icGoc ? icGoc + (EN ? "en/" : "") + "vu-tru-khac.html" : "";
  const oVtk = /\/vu-tru-khac(\.html)?$/.test(location.pathname);
  hop.innerHTML = (vtk ? '<a class="nut-vtk" href="' + vtk + '"' + (oVtk ? ' aria-current="page"' : "") + ' title="' + (EN ? "Another Universe: Mark's reading corner" : "Vũ Trụ Khác: góc đọc sách của Mark") + '" aria-label="' + (EN ? "Another Universe: Mark's reading corner" : "Vũ Trụ Khác: góc đọc sách của Mark") +
    '"><img src="' + icGoc + 'assets/vu-tru-khac/logo-bieu-tuong-toi.svg" alt="" width="20" height="20"><span class="nhan">' + (EN ? "Another Universe" : "Vũ Trụ Khác") + "</span></a>" : "") + (doiNgu ? '<a class="nut-lang" lang="' + (EN ? "vi" : "en") + '" hreflang="' + (EN ? "vi" : "en") + '" href="' + doiNgu.replace(/"/g, "%22") + '" aria-label="' +
    (EN ? "Chuyển sang tiếng Việt" : "Switch to English") + '">' + ic("languages") + (EN ? "VI" : "EN") + "</a>" : "") +
    '<button type="button" class="nut-theme"></button>' +
    '<button type="button" class="nut-menu" aria-expanded="false">' + ic("menu") + '<span class="nhan">Menu</span></button>';
  top.appendChild(hop);

  // Menu đầu trang gom nhóm (mẫu B, Sang chọn 19/10/2026): Bắt đầu · Học ▾ · Thực hành ▾ · Từ điển AI · Game · Bài báo AI · Sách.
  // Dựng lại ở đây cho mọi trang của cả hai thứ tiếng, để chỉ sửa một chỗ; HTML viết sẵn giữ danh sách phẳng cho máy tìm kiếm và khi tắt JS.
  // YouTube thành nút tròn bên phải cạnh Vũ Trụ Khác, EN và Tối (trên điện thoại vẫn nằm trong menu).
  const navTrang = top.querySelector(".top-links");
  const tenTrang = location.pathname.split("/").pop() || "index.html";
  const gocNgu = icGoc ? icGoc + (EN ? "en/" : "") : "";
  if (navTrang && gocNgu) {
    const batDau = navTrang.querySelector(".nav-start"), yt = navTrang.querySelector(".nav-yt");
    const lk = (f, chu, icon) => '<a href="' + gocNgu + f + '"' + (tenTrang === f ? ' aria-current="page"' : "") + ">" + (icon ? ic(icon) + "<span>" + chu + "</span>" : chu) + "</a>";
    const mui = '<svg class="nav-drop-mui" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const nhom = (ten, icon, ds) => '<details class="nav-drop"><summary' + (ds.some(x => x[0] === tenTrang) ? ' class="is-cur"' : "") + ">" + ic(icon) + "<span>" + ten + "</span>" + mui + '</summary><div class="nav-drop-ds">' +
      ds.map(x => x[0] ? lk(x[0], x[1]) : '<span class="nav-drop-nhom">' + x[1] + "</span>").join("") + "</div></details>";
    const hoc = [["lo-trinh-7-ngay.html", EN ? "7-day path" : "Lộ trình 7 ngày"], ["lo-trinh-4-tuan.html", EN ? "4-week path" : "Lộ trình 4 tuần"],
      ["lo-trinh-nganh.html", EN ? "Path by field" : "Lộ trình theo ngành"], ["kiem-tra.html", EN ? "Quiz: how well do you know AI?" : "Kiểm tra: bạn hiểu AI tới đâu?"],
      ["chung-nhan.html", EN ? "Certificates" : "Chứng nhận"], ["ho-so.html", EN ? "My profile · review" : "Hồ sơ học · Ôn hôm nay"]];
    const thucHanh = [["thuc-hanh.html", EN ? "Practice corner: quick tries" : "Góc thực hành: thử nhanh từng ý"], ["tram-chong-lua-dao.html", EN ? "AI scam help desk" : "Trạm chống lừa đảo AI"], ["", EN ? "Practice by field" : "Thực hành theo ngành"],
      ["nghe-cua-ban.html", EN ? "Your job with AI: try it" : "Nghề của bạn với AI: thử ngay"],
      ["ai-y-te.html", EN ? "Healthcare" : "Người làm y tế"], ["ai-hoc-sinh.html", EN ? "High school" : "Học sinh cấp 3"],
      ["ai-van-phong.html", EN ? "Public servants" : "Cán bộ, công chức"], ["ai-giao-vien.html", EN ? "Teachers" : "Giáo viên"],
      ["ai-gia-dinh.html", EN ? "Families" : "Gia đình"], ["ai-ban-hang.html", EN ? "Small sellers" : "Người bán hàng"],
      ["bo-hoc-lieu-ai.html", EN ? "12-lesson kit" : "Học liệu 12 tiết"]];
    // Từ 20/10/2026 (Sang chọn mockup B, kiểu hàng icon của MoMo): mỗi mục có icon nằm trên chữ; Trạm chống lừa đảo AI đứng ngay sau "Bắt đầu",
    // icon đỏ "kẻ gian đeo mặt nạ" (assets/icons.svg#i-chong-lua-dao). Từ điển AI dùng icon sách chữ A cho khỏi trùng nút EN
    const tram = "tram-chong-lua-dao.html", tenTram = EN ? "Scam help" : "Chống lừa đảo";
    // Nút Game mở Thế giới game (game.html, Sang chọn 20/10/2026) và sáng cả khi đang ở một trang game (danh sách trong data/game.json)
    const GAME = ["phieu-luu.html", "chan-lua.html", "dem-lai-xe.html", "duong-doan-chu.html"];
    const sangGame = s => GAME.includes(tenTrang) ? s.replace('href="' + gocNgu + 'game.html"', 'href="' + gocNgu + 'game.html" aria-current="page"') : s;
    navTrang.innerHTML = '<a class="nav-lua" href="' + gocNgu + tram + '"' + (tenTrang === tram ? ' aria-current="page"' : "") + '><span class="nav-lua-tron">' + ic("chong-lua-dao") + "</span><span>" + tenTram + "</span></a>" +
      nhom(EN ? "Learn" : "Học", "graduation-cap", hoc) + nhom(EN ? "Practice" : "Thực hành", "wrench", thucHanh) +
      lk("tu-dien.html", EN ? "AI glossary" : "Từ điển AI", "book-a") + sangGame(lk("game.html", "Game", "gamepad")) + lk("bai-bao.html", EN ? "AI papers" : "Bài báo AI", "file-text") + lk("sach.html", EN ? "Free book" : "Sách", "book-open");
    if (batDau) navTrang.prepend(batDau);
    // Máy tính bảng, điện thoại: menu chữ gom vào nút Menu, còn hàng icon vuốt ngang ngay dưới logo để vào nhanh (mục chống lừa đảo đứng đầu)
    const o = (f, chu, icon, cls) => '<a' + (cls ? ' class="' + cls + '"' : "") + ' href="' + (/^https?:/.test(f) ? f : gocNgu + f) + '"' + (tenTrang === f ? ' aria-current="page"' : "") + '><span class="nav-dai-o">' + ic(icon) + "</span>" + chu + "</a>";
    top.insertAdjacentHTML("beforeend", '<nav class="nav-dai" aria-label="' + (EN ? "Quick links" : "Vào nhanh") + '">' +
      o(tram, tenTram, "chong-lua-dao", "do") + (batDau ? o(batDau.href, EN ? "Start" : "Bắt đầu", "compass") : "") +
      o("lo-trinh-7-ngay.html", EN ? "Learn" : "Học", "graduation-cap") + o("thuc-hanh.html", EN ? "Practice" : "Thực hành", "wrench") + sangGame(o("game.html", "Game", "gamepad")) +
      o("tu-dien.html", EN ? "Glossary" : "Từ điển", "book-a") + o("sach.html", EN ? "Book" : "Sách", "book-open") + "</nav>");
    if (yt) {
      navTrang.append(yt);
      const ytTron = yt.cloneNode(true);
      ytTron.className = "nut-yt";
      ytTron.setAttribute("aria-label", "YouTube");
      ytTron.title = "YouTube";
      ytTron.innerHTML = '<svg class="ic" aria-hidden="true"><use href="' + icGoc + 'assets/nen-tang.svg#nt-youtube"/></svg>';
      hop.prepend(ytTron);
    }
    navTrang.classList.add("da-gom");
  }
  // Bấm ra ngoài hoặc Esc thì đóng menu thả xuống (máy tính); mở nhóm này thì đóng nhóm kia (cả điện thoại)
  const dsDrop = top.querySelectorAll(".nav-drop");
  const dt = matchMedia("(max-width: 1100px)");
  if (dsDrop.length) {
    dsDrop.forEach(d => d.addEventListener("toggle", () => { if (d.open) dsDrop.forEach(k => { if (k !== d) k.open = false; }); }));
    document.addEventListener("click", e => { if (!dt.matches) dsDrop.forEach(d => { if (d.open && !d.contains(e.target)) d.open = false; }); });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape" || dt.matches) return;
      dsDrop.forEach(d => { if (d.open) { d.open = false; d.querySelector("summary").focus(); } });
    });
  }

  // Điện thoại: các link trang gom vào nút Menu cho đầu trang gọn một hàng (máy tính vẫn hiện đủ)
  const nav = top.querySelector(".top-links"), nutMenu = hop.querySelector(".nut-menu");
  if (nav) {
    nav.id = nav.id || "menu-trang";
    // Điện thoại: đầu trang không còn chỗ nên nút Vũ Trụ Khác nằm cuối menu
    if (vtk) nav.insertAdjacentHTML("beforeend", '<a class="nav-vtk" href="' + vtk + '"><img src="' + icGoc + 'assets/vu-tru-khac/logo-bieu-tuong-toi.svg" alt="" width="20" height="20">' + (EN ? "Another Universe" : "Vũ Trụ Khác") + "</a>");
    nutMenu.setAttribute("aria-controls", nav.id);
    nutMenu.setAttribute("aria-label", EN ? "Open the menu" : "Mở menu");
    // Mở menu thì Học, Thực hành là hai hàng bấm để xổ ra (Sang 20/10: bày sẵn hết thì menu điện thoại dài quá); đóng menu thì gập lại
    const dongMo = mo => { top.classList.toggle("mo-menu", mo); nutMenu.setAttribute("aria-expanded", mo); dsDrop.forEach(d => { d.open = false; }); };
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

// Chân trang mẫu B (Sang chọn 19/10/2026): khối thương hiệu (khẩu hiệu, mạng xã hội, thẻ Vũ Trụ Khác) + 4 cột link có tiêu đề + dòng cuối.
// Dựng lại từ chân trang viết sẵn của mọi trang (giữ nguyên các nút mạng xã hội, kể cả link riêng của trang chủ và trang Vũ Trụ Khác).
// Điện thoại: 4 cột gập lại, bấm tiêu đề để mở
(function () {
  const foot = document.querySelector(".foot-band .foot");
  const me = document.currentScript;
  if (!foot || foot.classList.contains("foot-moi")) return;
  const EN = document.documentElement.lang === "en";
  let goc = "";
  try { goc = new URL(".", me ? me.src : location.href).href + (EN ? "en/" : ""); } catch (e) { return; }
  const brand = foot.querySelector(".brand"), dong = foot.querySelector(".foot-line"), kenh = foot.querySelector(".foot-links");
  if (!brand || !kenh) return;
  const vtk = kenh.querySelector(".vtk-nut");
  const tenTrang = location.pathname.split("/").pop() || "index.html";
  const lk = (f, chu) => '<a href="' + goc + f + '"' + (tenTrang === f ? ' aria-current="page"' : "") + ">" + chu + "</a>";
  const cot = (ten, ds) => '<details class="foot-cot" open><summary>' + ten + "</summary><div>" + ds.map(x => lk(x[0], x[1])).join("") + "</div></details>";
  const dau = document.createElement("div");
  dau.className = "foot-dau";
  dau.append(brand);
  if (dong) dau.append(dong);
  dau.append(kenh);
  if (vtk) {
    vtk.classList.add("foot-vtk");
    vtk.innerHTML = vtk.querySelector(".nt-vtk").outerHTML + '<span class="vtk-chu"><b>' + (EN ? "Another Universe" : "Vũ Trụ Khác") + "</b><small>" +
      (EN ? "Mark's sister page on Facebook" : "Trang anh em trên Facebook") + "</small></span>";
    dau.append(vtk);
  }
  const html = cot(EN ? "Learn" : "Học", [["lo-trinh-7-ngay.html", EN ? "7-day path" : "Lộ trình 7 ngày"], ["lo-trinh-4-tuan.html", EN ? "4-week path" : "Lộ trình 4 tuần"],
      ["lo-trinh-nganh.html", EN ? "Path for your job" : "Lộ trình theo nghề"], ["kiem-tra.html", EN ? "Quizzes" : "Kiểm tra"], ["chung-nhan.html", EN ? "Certificates" : "Chứng nhận"], ["ho-so.html", EN ? "My profile" : "Hồ sơ học"]]) +
    cot(EN ? "Practice" : "Thực hành", [["thuc-hanh.html", EN ? "Practice corner" : "Góc thực hành"], ["tram-chong-lua-dao.html", EN ? "Scam help desk" : "Chống lừa đảo AI"], ["ai-hoc-sinh.html", EN ? "Students" : "Học sinh"], ["ai-van-phong.html", EN ? "Civil servants" : "Công chức"],
      ["ai-y-te.html", EN ? "Healthcare" : "Y tế"], ["ai-giao-vien.html", EN ? "Teachers" : "Giáo viên"], ["ai-gia-dinh.html", EN ? "Families" : "Gia đình"],
      ["ai-ban-hang.html", EN ? "Sellers" : "Bán hàng"], ["nghe-cua-ban.html", EN ? "Your job with AI" : "Nghề của bạn với AI"], ["bo-hoc-lieu-ai.html", EN ? "12-lesson kit" : "Học liệu 12 tiết"]]) +
    cot(EN ? "Read & play" : "Đọc & chơi", [["tu-dien.html", EN ? "AI glossary" : "Từ điển AI"], ["bai-bao.html", EN ? "AI papers" : "Bài báo AI"], ["sach.html", EN ? "Free ebook" : "Sách miễn phí"],
      ["game.html", "Game"], ["ban-tin.html", EN ? "Weekly digest" : "Bản tin tuần"]]) +
    cot(EN ? "About" : "Về kênh", [["hop-tac.html", EN ? "Work with us" : "Hợp tác cùng kênh"], ["dich-vu.html", EN ? "Video services" : "Làm video cho bạn"], ["bo-giao-vien.html", EN ? "Lesson kits" : "Bộ bài giảng"],
      ["workshop.html", "Workshop"], ["ung-ho.html", EN ? "Support us" : "Ủng hộ kênh"]]) +
    '<div class="foot-cuoi"><span>© 2026 Mark học AI</span><span>' + lk("quyen-rieng-tu.html", EN ? "Privacy" : "Quyền riêng tư") + " · " + lk("dieu-khoan.html", EN ? "Terms" : "Điều khoản") +
    ' · <a href="mailto:markhocai@gmail.com">markhocai@gmail.com</a></span></div>';
  foot.textContent = "";
  foot.append(dau);
  foot.insertAdjacentHTML("beforeend", html);
  foot.classList.add("foot-moi");
  // Máy tính luôn mở đủ 4 cột; điện thoại gập lại
  const dt = matchMedia("(max-width: 760px)");
  const dat = () => foot.querySelectorAll(".foot-cot").forEach(d => { d.open = !dt.matches; });
  dat();
  if (dt.addEventListener) dt.addEventListener("change", dat);
  foot.querySelectorAll(".foot-cot > summary").forEach(s => s.addEventListener("click", e => { if (!dt.matches) e.preventDefault(); }));
  // Nút nổi ↑ ↓ và Bit tự nhấc lên khi chân trang hiện ra, để khỏi đè lên link chân trang (rà soát 19/10/2026).
  const htmlEl = document.documentElement, band = foot.closest(".foot-band");
  let hen = 0;
  const nhac = () => {
    hen = 0;
    const tren = band.getBoundingClientRect().top;
    const nang = Math.max(0, Math.min(innerHeight - tren, innerHeight - 180));
    htmlEl.style.setProperty("--nang-noi", Math.round(nang) + "px");
    // Chân trang phủ gần kín màn hình (điện thoại, cuối trang): không còn chỗ trống nào nên tạm ẩn nút nổi
    htmlEl.classList.toggle("noi-an", tren < 180);
  };
  const xep = () => { if (!hen) hen = requestAnimationFrame(nhac); };
  addEventListener("scroll", xep, { passive: true });
  addEventListener("resize", xep);
  new ResizeObserver(xep).observe(band);
  nhac();
})();

// Link "Bỏ qua tới nội dung" cho người dùng bàn phím và trình đọc màn hình: nhảy qua thanh đầu trang tới tiêu đề trang
// (khối .page-head trong dải màu) hoặc tới <main>. Khối tiêu đề được gắn làm một vùng có tên để trình đọc màn hình nhảy tới được.
(function () {
  const main = document.querySelector("main");
  if (!main || document.querySelector(".bo-qua")) return;
  let dich = main;
  const dau = document.querySelector(".page-head");
  const h1 = dau && dau.querySelector("h1");
  if (h1 && !dau.closest("main, header, [role]")) {
    if (!h1.id) h1.id = "tieu-de";
    dau.setAttribute("role", "region");
    dau.setAttribute("aria-labelledby", h1.id);
    dich = dau;
  }
  if (!dich.id) dich.id = dich === main ? "noi-dung" : "dau-trang-chinh";
  if (!dich.hasAttribute("tabindex")) dich.setAttribute("tabindex", "-1");
  const a = document.createElement("a");
  a.className = "bo-qua";
  a.href = "#" + dich.id;
  a.textContent = document.documentElement.lang === "en" ? "Skip to content" : "Bỏ qua tới nội dung";
  document.body.insertBefore(a, document.body.firstChild);
})();

// Nút "Đăng ký" YouTube cạnh mọi link YouTube của trang (vòng 4, Sang chọn 20/10/2026: 172 lượt bấm sang YouTube trong 6 ngày mà chỉ thêm 22 người đăng ký).
// Link ?sub_confirmation=1 mở thẳng hộp hỏi đăng ký của YouTube; theo-doi.js đếm riêng thành sự kiện "dang-ky-youtube".
// Cách gắn: nút tròn đầu trang và link chữ/nút thì đặt ngay sau link; hàng icon mạng xã hội (.nt) thì thêm một nút nhỏ cuối hàng;
// thẻ trong lưới (.ld-vid, .ntk) thì một nút dưới lưới. Bỏ qua danh sách dài từng video (.row-link, lộ trình theo ngành) và ảnh bìa trình phát.
// Link do JS khác dựng sau (trang chủ, Bit, kết quả game) được bắt bằng MutationObserver
(function () {
  const EN = document.documentElement.lang === "en";
  const me = document.currentScript;
  let icGoc = "";
  try { icGoc = new URL(".", me ? me.src : location.href).href; } catch (e) {}
  const SUB = "https://www.youtube.com/@markhocai?sub_confirmation=1";
  const LA_YT = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;
  const BO_QUA = ".nut-dk, .yt-play, .row-link, .ltn-v a";
  const nut = (lop, chu) => {
    const a = document.createElement("a");
    a.className = "nut-dk" + (lop ? " " + lop : "");
    a.href = SUB;
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", EN ? "Subscribe to Mark học AI on YouTube" : "Đăng ký kênh YouTube Mark học AI");
    a.innerHTML = '<svg class="ic" aria-hidden="true"><use href="' + icGoc + 'assets/nen-tang.svg#nt-youtube"/></svg><span>' + chu + "</span>";
    return a;
  };
  const DK = EN ? "Subscribe" : "Đăng ký";
  const gan = a => {
    if (a.dataset.dk || a.matches(BO_QUA) || !LA_YT.test(a.href || "") || /sub_confirmation/.test(a.href)) return;
    a.dataset.dk = "1";
    const luoi = a.matches(".ld-vid, .ntk") && a.closest(".ld-ket-video, ul");
    if (luoi) {
      if (!(luoi.nextElementSibling && luoi.nextElementSibling.matches(".nut-dk-hang"))) {
        const h = document.createElement("p");
        h.className = "nut-dk-hang";
        h.append(nut("btn btn-dk", EN ? "Subscribe on YouTube" : "Đăng ký kênh YouTube"));
        luoi.after(h);
      }
    } else if (a.classList.contains("nt")) {
      const hang = a.parentElement;
      if (!hang.querySelector(":scope > .nut-dk")) hang.append(nut("nut-dk-nho", DK));
    } else if (!(a.nextElementSibling && a.nextElementSibling.matches(".nut-dk"))) {
      a.after(a.classList.contains("btn") ? nut("btn btn-dk", EN ? "Subscribe" : "Đăng ký kênh") :
        nut(a.classList.contains("nut-yt") ? "nut-dk-dau" : a.classList.contains("nav-yt") ? "nav-dk" : "nut-dk-nho", DK));
    }
  };
  const quet = () => document.querySelectorAll("a[href]").forEach(gan);
  quet();
  let cho = 0;
  new MutationObserver(() => { if (!cho) cho = requestAnimationFrame(() => { cho = 0; quet(); }); })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
})();

// Bản tin tuần (Sang 15/10/2026): tuần này kênh có gì mới, video nào được xem nhiều, cho cả Mark học AI và Mark Ở Vũ Trụ Khác.
// - Chỉ hiện SAU KHI người xem đã chọn ngành/nghề (mhai-nganh, xem lo-trinh-nganh.js): ở trang lộ trình ngay sau khi chọn,
//   và ở trang chủ cho người quay lại. Mỗi số mới hiện một lần (mhai-ban-tin = id số đã xem), ?ban-tin trên link thì luôn hiện.
// - ban-tin.html / en/ban-tin.html (#bt-trang): mỗi lần một số dạng thẻ ảnh (Sang 15/10: trang chữ dài quá), nút chọn các số cũ (#so-<id>).
// Dữ liệu: data/ban-tin.json do scripts/tao_ban_tin.py tạo. Video hợp với ngành đã chọn được đẩy lên đầu và gắn nhãn.
(function () {
  const KHOA = "mhai-ban-tin";
  const nho = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const EN = document.documentElement.lang === "en";
  const goc = EN ? "../" : "";
  const S = EN ? {
    eyebrow: (a, b) => "Weekly digest · " + a + " – " + b, tieuDe: "What's new this week", choBan: (t, n) => n + (n === 1 ? " new video fits" : " new videos fit") + " your path (" + t + "), so they come first.",
    hocAi: "Mark học AI", vtk: "Mark in Another Universe",
    moiKenh: n => "New on the channel · " + n + (n === 1 ? " video" : " videos"), them: n => "+" + n + " more ›", themBai: n => "+" + n + " more articles ›",
    hop: "For you", xemNhieu: "Most watched on the channel", docNhieu: "Most read on the site", web: "New on the site",
    vtkMoi: n => "New articles · " + n, vtkDoc: "Most read", day: "See the full digest ›", daXem: "Got it", dong: "Close",
    trong: "Nothing new here this week.", soTruoc: "Earlier digests", ghiUmami: (a, b) => "Most read: rankings from site visits " + a + " – " + b + ".",
    oVideo: "new videos", oBai: "new universe articles", oTinhNang: "new on the site", tapMoi: n => n + (n === 1 ? " new part" : " new parts"),
    moiKenhNgan: "New on the channel", demVideo: n => n + " videos, grouped by series", vtkMoiNgan: "New articles", demBai: n => n + " articles", xemGoc: "See the whole corner ›",
    thang: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], baiBao: "AI paper", rong: "No digest yet.",
    pho: "This week in the neighborhood", phoMoi: "Game and clips", sachThang: m => "Book of the month · " + m, choiGame: "Play Bánh Mì Delivery Cat ›"
  } : {
    eyebrow: (a, b) => "Bản tin tuần · " + a + " – " + b, tieuDe: "Tuần này có gì mới?", choBan: (t, n) => "Có " + n + " video mới hợp với lộ trình " + t + " của bạn, mình đưa lên đầu.",
    hocAi: "Mark học AI", vtk: "Mark Ở Vũ Trụ Khác",
    moiKenh: n => "Mới lên kênh · " + n + " video", them: n => "+" + n + " video khác ›", themBai: n => "+" + n + " bài khác ›",
    hop: "Hợp với bạn", xemNhieu: "Xem nhiều nhất trên kênh", docNhieu: "Đọc nhiều trên web", web: "Web có gì mới",
    vtkMoi: n => "Bài mới · " + n + " bài", vtkDoc: "Đọc nhiều nhất", day: "Xem đủ bản tin ›", daXem: "Đã xem", dong: "Đóng",
    trong: "Tuần này chưa có gì mới ở đây.", soTruoc: "Các số trước", ghiUmami: (a, b) => "Đọc nhiều: xếp theo lượt ghé web từ " + a + " đến " + b + ".",
    baiBao: "Bài báo AI", rong: "Chưa có số nào.",
    oVideo: "video mới", oBai: "bài Vũ Trụ Khác mới", oTinhNang: "điểm mới trên web", tapMoi: n => n + " tập mới",
    moiKenhNgan: "Mới lên kênh", demVideo: n => n + " video, gom theo series", vtkMoiNgan: "Bài mới", demBai: n => n + " bài", xemGoc: "Xem cả góc đọc ›",
    pho: "Ở khu phố tuần này", phoMoi: "Game và clip", sachThang: m => "Sách của tháng " + m, choiGame: "Chơi Mèo Giao Bánh Mì ›"
  };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = name => fetch(goc + "data/" + name + ".json", { cache: "no-cache" }).then(r => r.json());
  const ngay = d => EN ? S.thang[+d.slice(5, 7) - 1] + " " + (+d.slice(8, 10)) : d.slice(8, 10) + "/" + d.slice(5, 7);
  const ten = m => EN ? (m.ten_en || m.ten) : m.ten;
  const docChon = () => { try { return JSON.parse(nho.get("mhai-nganh") || "null"); } catch (e) { return null; } };

  // Video trong lộ trình của ngành đã chọn: trang lộ trình gửi sẵn (sự kiện mhai:lo-trinh), trang khác tự đọc data/lo-trinh-nganh.json
  let soHop = null, tenChon = "";
  async function tinhHop() {
    if (soHop) return;
    const c = docChon();
    soHop = new Set();
    if (!c) return;
    if (c.nghe) { tenChon = c.nghe; return; }
    try {
      const D = await load("lo-trinh-nganh"), n = D.nganh[c.ai];
      if (!n) return;
      tenChon = n.ngan;
      if (EN) { try { const T = await load("en/lo-trinh-nganh"); if (T.nganh[c.ai]) tenChon = T.nganh[c.ai].ngan; } catch (e) {} }
      n.buoc.forEach(b => (b.so || []).forEach(s => soHop.add(String(s))));
    } catch (e) {}
  }

  // ===== Thẻ bản tin hiện lên sau khi đã chọn ngành =====
  let daHien = false;
  async function hienThe(epBuoc) {
    if (daHien) return;
    const c = docChon();
    const ep = /[?&]ban-tin\b/.test(location.search);
    if (!c && !ep) return;
    let B;
    try { B = await load("ban-tin"); } catch (e) { return; }
    const s = B.so && B.so[0];
    if (!s || (!ep && nho.get(KHOA) === s.id)) return;
    await tinhHop();
    if (epBuoc) epBuoc.forEach(x => soHop.add(String(x)));
    daHien = true;
    const soKhop = tenChon ? s.hoc_ai.moi.filter(m => m.loai !== "bai-bao" && soHop.has(String(m.so))).length : 0;
    const hop = document.createElement("dialog");
    hop.className = "bt-hop";
    hop.setAttribute("aria-labelledby", "bt-ten");
    hop.innerHTML = '<button type="button" class="hop-dong" aria-label="' + S.dong + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>' +
      '<div class="bt-in"><div class="chao-dau"><img src="' + goc + 'assets/mark-chao.svg" alt="" width="80" height="76"><div><p class="eyebrow">' + S.eyebrow(ngay(s.tu), ngay(s.den)) + "</p>" +
      '<h2 id="bt-ten">' + S.tieuDe + "</h2>" + (soKhop ? "<p>" + esc(S.choBan(tenChon, soKhop)) + "</p>" : "") + "</div></div>" + veTrang(s, true) + "</div>" +
      '<div class="bt-chan"><a class="btn" href="ban-tin.html#so-' + esc(s.id) + '">' + S.day + '</a><button type="button" class="btn btn-yt" data-da-xem>' + S.daXem + "</button></div>";
    document.body.appendChild(hop);
    const dong = () => { nho.set(KHOA, s.id); if (hop.open) hop.close(); };
    hop.addEventListener("click", e => {
      if (e.target === hop || e.target.closest(".hop-dong") || e.target.closest("[data-da-xem]")) dong();
      else if (e.target.closest("a")) nho.set(KHOA, s.id);
    });
    hop.addEventListener("cancel", () => nho.set(KHOA, s.id));
    // Không chen lên hộp khác đang mở (hộp chào "Bạn là ai?", hộp series...): đợi nó đóng rồi mới hiện
    const mo = () => { if (document.querySelector("dialog[open]")) return setTimeout(mo, 1500); hop.showModal(); if (window.mhaiDo) window.mhaiDo("ban-tin-hien", { so: s.id }); };
    setTimeout(mo, 900);
  }

  // ===== Trang ban-tin.html =====
  // Trang dạng tạp chí: ô số liệu, thẻ ảnh bìa theo series, hàng ảnh bìa Vũ Trụ Khác cuộn ngang. Mỗi lần hiện một số, các số khác là nút chọn.
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-' + n + '"/></svg>';
  // gon = thẻ hiện lên sau khi chọn ngành: cùng kiểu thẻ ảnh nhưng mỗi phần là một hàng cuộn ngang, bỏ phần chữ phụ
  function veTrang(s, gon) {
    const h = s.hoc_ai, v = s.vtk;
    const hopNhom = n => soHop && n.so.some(x => soHop.has(String(x)));
    const nhom = (h.nhom_moi || []).slice().sort((a, b) => (hopNhom(b) ? 1 : 0) - (hopNhom(a) ? 1 : 0));
    const tinhNang = (h.web || []).length + (v.web || []).length;
    const o = (so, chu, icon, cls) => '<li class="bt-o ' + cls + '">' + ic(icon) + "<b>" + so + "</b><span>" + chu + "</span></li>";
    const tom = '<ul class="bt-tom">' + (h.tong_moi ? o(h.tong_moi, S.oVideo, "play", "o-ai") : "") + (v.tong_moi ? o(v.tong_moi, S.oBai, "book-open", "o-vtk") : "") + (tinhNang ? o(tinhNang, S.oTinhNang, "sparkles", "o-web") : "") + "</ul>";
    const theSeries = n => '<li><a class="bt-ser" href="' + esc(n.link) + '"><span class="bt-ser-bia">' +
      (n.bia ? '<img src="' + goc + esc(n.bia) + '" alt="" width="480" height="270" loading="lazy" decoding="async">' :
        '<span class="bt-ser-chu">' + esc(ten(n)) + '</span><img class="bt-ser-bit" src="' + goc + 'assets/bit-giai-thich.svg" alt="" width="64" height="64">') +
      '<span class="bt-ser-dem">' + S.tapMoi(n.so.length) + "</span>" + (hopNhom(n) ? '<span class="bt-nhan">' + S.hop + "</span>" : "") +
      '</span><span class="bt-ser-ten">' + esc(ten(n)) + '</span><span class="bt-ser-so">' + n.so.map(x => "#" + esc(x)).join(" · ") + "</span></a></li>";
    const top = arr => '<ol class="bt-top">' + arr.map((m, i) => '<li><a href="' + esc(m.link) + '"><span class="bt-top-hang">' + (i + 1) + '</span><span class="bt-top-ten">' + esc(ten(m)) + "</span>" +
      (m.so ? '<span class="bt-so">' + esc(m.so) + "</span>" : "") + "</a></li>").join("") + "</ol>";
    const tinh = arr => arr.length ? '<ul class="bt-tinh">' + arr.map(w => "<li>" + (w.link ? '<a href="' + esc(w.link) + '">' : "<span>") + ic("sparkles") + "<span>" + esc(ten(w)) + "</span>" + (w.link ? "</a>" : "</span>") + "</li>").join("") + "</ul>" : "";
    const bia = m => '<a class="bt-bia" href="' + esc(m.link) + '" style="--b1:' + esc((m.mau || [])[0] || "#0B1F3A") + ";--b2:" + esc((m.mau || [])[1] || "#1F3A75") + '">' +
      '<span class="bt-bia-hinh">' + (m.bia ? '<img src="' + goc + esc(m.bia) + '" alt="" width="120" height="120" loading="lazy" decoding="async">' : "") + "</span>" +
      '<span class="bt-bia-nhom">' + esc(EN ? m.nhom_en || m.nhom : m.nhom) + '</span><span class="bt-bia-ten">' + esc(ten(m)) + "</span></a>";
    const tieu = (t, phu) => '<h3 class="bt-tieu">' + t + (phu ? " <small>" + phu + "</small>" : "") + "</h3>";
    const chip = v.nhom.length ? '<p class="bt-chips">' + v.nhom.map(n => '<a class="bt-chip" href="' + esc(n.link) + '">' + esc(ten(n)) + " <b>" + n.dem + "</b></a>").join("") + "</p>" : "";
    const N = gon ? 6 : 12;
    const cuon = v.moi.slice(0, N).map(m => "<li>" + bia(m) + "</li>").join("") +
      (v.tong_moi > N ? '<li><a class="bt-bia bt-bia-them" href="vu-tru-khac.html"><b>+' + (v.tong_moi - N) + "</b><span>" + S.xemGoc + "</span></a></li>" : "");
    const docWeb = h.doc_nhieu.length ? '<p class="bt-doc-web"><span>' + S.docNhieu + ":</span> " + h.doc_nhieu.map(m => '<a href="' + esc(m.link) + '">' + esc(ten(m)) + "</a>").join(" · ") + "</p>" : "";
    return tom +
      '<section class="bt-khoi bt-khoi-ai"><h2><img src="' + goc + 'assets/logo.png" alt="" width="32" height="32">' + S.hocAi + "</h2>" +
      (nhom.length ? tieu(S.moiKenhNgan, S.demVideo(h.tong_moi)) + '<ul class="' + (gon ? "bt-cuon bt-cuon-ser" : "bt-sers") + '">' + nhom.map(theSeries).join("") + "</ul>" : "") +
      (h.xem_nhieu.length ? tieu(S.xemNhieu) + top(h.xem_nhieu) : "") + (gon ? "" : docWeb) +
      (h.web.length && !gon ? tieu(S.web) + tinh(h.web) : "") + "</section>" +
      '<section class="bt-khoi bt-khoi-vtk"><h2><img src="' + goc + 'assets/vu-tru-khac/logo-bieu-tuong.svg" alt="" width="32" height="32">' + S.vtk + "</h2>" +
      (v.tong_moi ? tieu(S.vtkMoiNgan, S.demBai(v.tong_moi)) + (gon ? "" : chip) + '<ul class="bt-cuon">' + cuon + "</ul>" : "") +
      (v.doc_nhieu.length && gon ? tieu(S.vtkDoc) + top(v.doc_nhieu) : "") +
      (v.doc_nhieu.length && !gon ? tieu(S.vtkDoc) + '<ul class="bt-cuon bt-cuon-top">' + v.doc_nhieu.map((m, i) => '<li><span class="bt-top-hang">' + (i + 1) + "</span>" + bia(m) + "</li>").join("") + "</ul>" : "") +
      ((v.web || []).length && !gon ? tieu(S.web) + tinh(v.web) : "") + "</section>" +
      vePho(s.khu_pho, gon) +
      (!gon && s.umami && s.umami.tu ? '<p class="bt-ghi">' + S.ghiUmami(ngay(s.umami.tu), ngay(s.umami.den)) + "</p>" : "");
  }

  // Ở khu phố tuần này (Vũ Trụ Mark D3, 30/10): tin game Mèo Giao Bánh Mì, clip mới, sách cả khu phố đang đọc trong tháng
  function vePho(p, gon) {
    if (!p || (!(p.moi || []).length && !p.sach)) return "";
    const icon = { game: "gamepad", clip: "clapperboard" };
    const tin = (p.moi || []).length ? tieuPho(S.phoMoi) + '<ul class="bt-tinh bt-tinh-pho">' + p.moi.map(w => "<li>" + (w.link ? '<a href="' + esc(w.link) + '">' : "<span>") +
      ic(icon[w.loai] || "sparkles") + "<span>" + esc(ten(w)) + "</span>" + (w.link ? "</a>" : "</span>") + "</li>").join("") + "</ul>" : "";
    const b = p.sach;
    const sach = b ? tieuPho(S.sachThang(EN ? S.thang[+b.thang.slice(5, 7) - 1] : b.thang.slice(5, 7) + "/" + b.thang.slice(0, 4))) +
      '<div class="bt-sach"><a class="bt-bia" href="' + esc(b.link) + '" style="--b1:' + esc((b.mau || [])[0] || "#0B1F3A") + ";--b2:" + esc((b.mau || [])[1] || "#1F3A75") + '">' +
      '<span class="bt-bia-hinh">' + (b.bia ? '<img src="' + goc + esc(b.bia) + '" alt="" width="120" height="120" loading="lazy" decoding="async">' : "") + "</span>" +
      '<span class="bt-bia-ten">' + esc(ten(b)) + "</span></a>" + (gon ? "" : "<p>" + esc(EN ? b.loi_en : b.loi) + "</p>") + "</div>" : "";
    return '<section class="bt-khoi bt-khoi-pho"><h2><img src="' + goc + 'assets/game/meo-giao-banh-mi.webp" alt="" width="32" height="32">' + S.pho + "</h2>" + tin + sach +
      (gon ? "" : '<p class="bt-doc-web"><a href="https://meo.markhocai.com/?utm_source=markhocai&amp;utm_medium=web&amp;utm_content=ban-tin">' + S.choiGame + "</a></p>") + "</section>";
  }
  const tieuPho = t => '<h3 class="bt-tieu">' + t + "</h3>";

  async function trangBanTin(el) {
    let B;
    try { B = await load("ban-tin"); } catch (e) { el.innerHTML = "<p>" + S.rong + "</p>"; return; }
    await tinhHop();
    const so = B.so || [];
    if (!so.length) { el.innerHTML = "<p>" + S.rong + "</p>"; return; }
    const chon = () => { const id = location.hash.replace(/^#so-/, ""); return so.find(s => s.id === id) || so[0]; };
    const ve = () => {
      const s = chon();
      el.innerHTML = (so.length > 1 ? '<nav class="bt-cac-so" aria-label="' + S.soTruoc + '">' + so.map(x => '<a href="#so-' + esc(x.id) + '"' + (x === s ? ' aria-current="true"' : "") + ">" + ngay(x.tu) + " – " + ngay(x.den) + "</a>").join("") + "</nav>" : "") +
        '<article class="bt-so-bai" id="so-' + esc(s.id) + '"><h2 class="bt-so-ten">' + S.eyebrow(ngay(s.tu), ngay(s.den)) + "</h2>" + veTrang(s) + "</article>";
    };
    ve();
    window.addEventListener("hashchange", () => { ve(); el.scrollIntoView(); });
    nho.set(KHOA, so[0].id);
  }

  const trang = document.getElementById("bt-trang");
  if (trang) { trangBanTin(trang); return; }
  // Trang lộ trình: lo-trinh-nganh.js báo khi đã hiện lộ trình cho lựa chọn của người xem, kèm số các video trong lộ trình
  if (document.getElementById("ltn")) {
    document.addEventListener("mhai:lo-trinh", e => hienThe(e.detail && e.detail.so));
    if (window.mhaiLoTrinhSo) hienThe(window.mhaiLoTrinhSo);
  }
  else hienThe();
})();

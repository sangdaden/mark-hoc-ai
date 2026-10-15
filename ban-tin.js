// Bản tin tuần (Sang 15/10/2026): tuần này kênh có gì mới, video nào được xem nhiều, cho cả Mark học AI và Mark Ở Vũ Trụ Khác.
// - Chỉ hiện SAU KHI người xem đã chọn ngành/nghề (mhai-nganh, xem lo-trinh-nganh.js): ở trang lộ trình ngay sau khi chọn,
//   và ở trang chủ cho người quay lại. Mỗi số mới hiện một lần (mhai-ban-tin = id số đã xem), ?ban-tin trên link thì luôn hiện.
// - ban-tin.html / en/ban-tin.html (#bt-trang): liệt kê mọi số, số mới nhất mở sẵn.
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
    thang: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], baiBao: "AI paper", rong: "No digest yet."
  } : {
    eyebrow: (a, b) => "Bản tin tuần · " + a + " – " + b, tieuDe: "Tuần này có gì mới?", choBan: (t, n) => "Có " + n + " video mới hợp với lộ trình " + t + " của bạn, mình đưa lên đầu.",
    hocAi: "Mark học AI", vtk: "Mark Ở Vũ Trụ Khác",
    moiKenh: n => "Mới lên kênh · " + n + " video", them: n => "+" + n + " video khác ›", themBai: n => "+" + n + " bài khác ›",
    hop: "Hợp với bạn", xemNhieu: "Xem nhiều nhất trên kênh", docNhieu: "Đọc nhiều trên web", web: "Web có gì mới",
    vtkMoi: n => "Bài mới · " + n + " bài", vtkDoc: "Đọc nhiều nhất", day: "Xem đủ bản tin ›", daXem: "Đã xem", dong: "Đóng",
    trong: "Tuần này chưa có gì mới ở đây.", soTruoc: "Các số trước", ghiUmami: (a, b) => "Đọc nhiều: xếp theo lượt ghé web từ " + a + " đến " + b + ".",
    baiBao: "Bài báo AI", rong: "Chưa có số nào."
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

  const link = (m, noi) => m.link ? '<a href="' + esc(m.link) + '">' + noi + "</a>" : noi;
  const soTap = m => m.so && m.loai !== "bai-bao" ? '<span class="bt-so">' + esc(m.so) + "</span>" : m.loai === "bai-bao" ? '<span class="bt-so bt-so-bb">' + S.baiBao + "</span>" : "";
  function dongVideo(m) {
    const hop = soHop && soHop.has(String(m.so)) && m.loai !== "bai-bao";
    return "<li" + (hop ? ' class="is-hop"' : "") + ">" + soTap(m) + '<span class="bt-ten">' + link(m, esc(ten(m))) + "</span>" +
      (hop ? '<span class="bt-nhan">' + S.hop + "</span>" : "") + "</li>";
  }
  const ds = (arr, cls) => arr.length ? '<ul class="bt-ds ' + (cls || "") + '">' + arr.join("") + "</ul>" : "";
  const hang = arr => arr.length ? '<ol class="bt-hang">' + arr.map(m => "<li>" + link(m, esc(ten(m))) + (m.nhom ? ' <span class="bt-nhom">' + esc(EN ? m.nhom_en || m.nhom : m.nhom) + "</span>" : "") + "</li>").join("") + "</ol>" : "";
  const muc = (tieu, noi, cls) => noi ? '<div class="bt-muc' + (cls ? " " + cls : "") + '"><h4>' + tieu + "</h4>" + noi + "</div>" : "";

  // gon = thẻ hiện lên (ít dòng), không gon = trang bản tin (đủ)
  function veSo(s, gon) {
    const h = s.hoc_ai, v = s.vtk;
    const moi = h.moi.slice().sort((a, b) => (soHop && soHop.has(String(b.so)) ? 1 : 0) - (soHop && soHop.has(String(a.so)) ? 1 : 0));
    const moiHien = gon ? moi.slice(0, 4) : moi;
    const conLai = h.tong_moi - moiHien.length;
    const themLink = conLai > 0 ? '<p class="bt-them"><a href="ban-tin.html#so-' + esc(s.id) + '">' + S.them(conLai) + "</a></p>" : "";
    const hocAi = muc(S.moiKenh(h.tong_moi), ds(moiHien.map(dongVideo)) + (gon ? themLink : "")) +
      muc(S.xemNhieu, hang(h.xem_nhieu)) +
      (gon ? "" : muc(S.docNhieu, hang(h.doc_nhieu))) +
      muc(S.web, ds((gon ? h.web.slice(0, 3) : h.web).map(w => "<li>" + link(w, esc(ten(w))) + "</li>"), "bt-ds-cham"), "bt-muc-web");
    const chip = v.nhom.length ? '<p class="bt-chips">' + v.nhom.map(n => '<a class="bt-chip" href="' + esc(n.link) + '">' + esc(ten(n)) + " <b>" + n.dem + "</b></a>").join("") + "</p>" : "";
    const vtkMoi = gon ? v.moi.slice(0, 3) : v.moi;
    const vtk = muc(S.vtkMoi(v.tong_moi), chip + ds(vtkMoi.map(m => "<li>" + '<span class="bt-ten">' + link(m, esc(ten(m))) + '</span> <span class="bt-nhom">' + esc(EN ? m.nhom_en || m.nhom : m.nhom) + "</span></li>")) +
      (v.tong_moi > vtkMoi.length ? '<p class="bt-them"><a href="' + (gon ? "ban-tin.html#so-" + esc(s.id) : "vu-tru-khac.html") + '">' + S.themBai(v.tong_moi - vtkMoi.length) + "</a></p>" : "")) +
      muc(S.vtkDoc, hang(v.doc_nhieu)) +
      muc(S.web, ds((v.web || []).map(w => "<li>" + link(w, esc(ten(w))) + "</li>"), "bt-ds-cham"), "bt-muc-web");
    return '<div class="bt-hai">' +
      '<section class="bt-goc bt-goc-ai"><h3><img src="' + goc + 'assets/logo.png" alt="" width="28" height="28">' + S.hocAi + "</h3>" + (hocAi || "<p>" + S.trong + "</p>") + "</section>" +
      '<section class="bt-goc bt-goc-vtk"><h3><img src="' + goc + 'assets/vu-tru-khac/logo-bieu-tuong.svg" alt="" width="28" height="28">' + S.vtk + "</h3>" + (vtk || "<p>" + S.trong + "</p>") + "</section></div>" +
      (!gon && s.umami && s.umami.tu ? '<p class="bt-ghi">' + S.ghiUmami(ngay(s.umami.tu), ngay(s.umami.den)) + "</p>" : "");
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
      '<h2 id="bt-ten">' + S.tieuDe + "</h2>" + (soKhop ? "<p>" + esc(S.choBan(tenChon, soKhop)) + "</p>" : "") + "</div></div>" + veSo(s, true) + "</div>" +
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
  async function trangBanTin(el) {
    let B;
    try { B = await load("ban-tin"); } catch (e) { el.innerHTML = "<p>" + S.rong + "</p>"; return; }
    await tinhHop();
    const so = B.so || [];
    if (!so.length) { el.innerHTML = "<p>" + S.rong + "</p>"; return; }
    el.innerHTML = so.map((s, i) => {
      const dau = '<h2 class="bt-so-ten">' + S.eyebrow(ngay(s.tu), ngay(s.den)) + "</h2>";
      return i === 0 ? '<article class="bt-so-bai" id="so-' + esc(s.id) + '">' + dau + veSo(s, false) + "</article>" :
        (i === 1 ? '<h2 class="bt-truoc">' + S.soTruoc + "</h2>" : "") +
        '<details class="bt-so-bai" id="so-' + esc(s.id) + '"><summary>' + dau + "</summary>" + veSo(s, false) + "</details>";
    }).join("");
    const h = location.hash.slice(1), dich = h && document.getElementById(h);
    if (dich) { if (dich.tagName === "DETAILS") dich.open = true; dich.scrollIntoView(); }
    if (so[0]) nho.set(KHOA, so[0].id);
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

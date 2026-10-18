/* Popup "Cách chơi" dùng chung cho mọi trò chơi (kiểu B "Bit dẫn đường", Sang chọn 16/10).
   Trang trò chơi nào có file data/huong-dan/<tên trang>.json thì scripts/huong_dan.py nhúng các bước vào
   <script type="application/json" id="huong-dan-du-lieu"> và nạp file này. Mỗi bước chỉ cần "chon": một bộ chọn CSS
   của chỗ cần chỉ (vd. ".ld-chon"), không cần tọa độ: file này tự làm tối trang, soi sáng chỗ đó và đặt lời Bit cạnh nó.
   Chỗ đó chưa hiện (trò chưa tới bước ấy) thì lời Bit nằm giữa màn hình; bước có "bo_neu_an" thì bỏ qua luôn.
   Lần đầu vào mỗi trò (hoặc mỗi trạm, xem "nhom") tự mở; nút "Cách chơi" mở lại bất cứ lúc nào. */
(function () {
  "use strict";
  var du = document.getElementById("huong-dan-du-lieu");
  if (!du) return;
  var D;
  try { D = JSON.parse(du.textContent); } catch (e) { return; }
  var EN = document.documentElement.lang === "en";
  var N = EN
    ? { mo: "How to play", buoc: "Step", tiep: "Next", lai: "Back", bo: "Skip", choi: "Play now", dong: "Close the guide" }
    : { mo: "Cách chơi", buoc: "Bước", tiep: "Tiếp", lai: "Quay lại", bo: "Bỏ qua", choi: "Chơi ngay", dong: "Đóng hướng dẫn" };
  var P = du.getAttribute("data-p") || "";
  var NHUNG = document.documentElement.classList.contains("nhung");
  var muot = window.matchMedia && matchMedia("(prefers-reduced-motion: no-preference)").matches;

  function doc(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ghi(k) { try { localStorage.setItem(k, "1"); } catch (e) {} }
  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function hien(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
  }
  // Bộ chọn có thể khớp nhiều chỗ: lấy chỗ đầu tiên đang hiện
  function tim(chon) {
    if (!chon) return null;
    var ds;
    try { ds = document.querySelectorAll(chon); } catch (e) { return null; }
    for (var i = 0; i < ds.length; i++) if (hien(ds[i])) return ds[i];
    return null;
  }
  // Trang nhiều trạm (Phòng thí nghiệm bộ não AI): mỗi nhóm có "khi" là chỗ chỉ hiện khi đang ở trạm đó
  function nhomHienTai() {
    if (!D.nhom || !D.nhom.length) return { id: "", buoc: D.buoc || [] };
    for (var i = 0; i < D.nhom.length; i++) if (tim(D.nhom[i].khi)) return D.nhom[i];
    return D.nhom[0];
  }
  function khoa(g) { return "mhai-hd-" + D.ten + (g.id ? "-" + g.id : ""); }

  // Phần màn hình người chơi đang thấy. Trong trang bài (?nhung=1) iframe cao bằng cả trò chơi,
  // nên phải lấy phần iframe đang nằm trong màn hình của trang ngoài.
  function khung() {
    var w = window.innerWidth, h = window.innerHeight, top = 0;
    try {
      if (window.frameElement && window.parent !== window) {
        var fr = window.frameElement.getBoundingClientRect(), ph = window.parent.innerHeight;
        top = Math.max(0, -fr.top);
        h = Math.max(160, Math.min(h, ph - fr.top) - top);
      }
    } catch (e) {}
    return { top: top, h: h, w: w };
  }

  var laCuoi = false, lop = null, soi, bong, sB, pB, nutLai, nutTiep, nhom = null, i = 0, chi = null, nutMo = null, truoc = null;

  function dung() {
    lop = el("div", "hd");
    lop.hidden = true;
    soi = el("div", "hd-soi");
    bong = el("div", "hd-bong");
    bong.setAttribute("role", "dialog");
    bong.setAttribute("aria-modal", "true");
    bong.setAttribute("aria-labelledby", "hd-chu");
    var r = el("div", "hd-r");
    var anh = el("img", "hd-bit");
    anh.src = P + "assets/mascot/bit-dang-noi-tinh.webp";
    anh.alt = ""; anh.width = 52; anh.height = 52;
    var chu = el("div", "hd-chu");
    sB = el("small", "hd-so");
    pB = el("p", null);
    pB.id = "hd-chu";
    pB.setAttribute("aria-live", "polite");
    chu.appendChild(sB); chu.appendChild(pB);
    r.appendChild(anh); r.appendChild(chu);
    var x = el("button", "hd-x", "×");
    x.type = "button";
    x.setAttribute("aria-label", N.dong);
    x.addEventListener("click", dong);
    var chan = el("div", "hd-chan");
    var trai = el("span", "hd-trai");
    nutLai = el("button", "hd-nut hd-phu", N.lai);
    nutLai.type = "button";
    nutLai.addEventListener("click", function () { den(i - 1, -1); });
    var bo = el("button", "hd-nut hd-phu", N.bo);
    bo.type = "button";
    bo.addEventListener("click", dong);
    trai.appendChild(nutLai); trai.appendChild(bo);
    nutTiep = el("button", "hd-nut hd-chinh", N.tiep);
    nutTiep.type = "button";
    nutTiep.addEventListener("click", function () { if (laCuoi) dong(); else den(i + 1, 1); });
    chan.appendChild(trai); chan.appendChild(nutTiep);
    bong.appendChild(x); bong.appendChild(r); bong.appendChild(chan);
    lop.appendChild(soi); lop.appendChild(bong);
    document.body.appendChild(lop);
    lop.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); dong(); }
      else if (e.key === "ArrowRight" && !laCuoi) den(i + 1, 1);
      else if (e.key === "ArrowLeft" && i > 0) den(i - 1, -1);
      else if (e.key === "Tab") {  // giữ Tab trong hộp
        var ds = [].filter.call(bong.querySelectorAll("button"), function (b) { return !b.hidden; });
        var dau = ds[0], cuoi = ds[ds.length - 1];
        if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
        else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
      }
    });
    // Chạm ra ngoài hộp: không làm gì (tránh lỡ tay bấm vào trò chơi phía sau)
    lop.addEventListener("click", function (e) { if (e.target === lop || e.target === soi) nutTiep.focus(); });
    window.addEventListener("resize", ve);
    window.addEventListener("scroll", ve, { passive: true });
    try { if (window.parent !== window) window.parent.addEventListener("scroll", ve, { passive: true }); } catch (e) {}
  }

  // Nút nổi của trang (lên đầu, xuống nhanh, Bit trợ lý, gợi ý ngôn ngữ) che mất lời Bit, nhất là trên điện thoại.
  // Khi trò mở trong trang bài, các nút đó nằm ở trang ngoài, trên cả khung trò chơi, nên phải ẩn cả bên đó.
  var NUT_NOI = "#len-dau, .to-top, .bit-tl, #goi-y-ngon-ngu";
  function anNutNoi(an) {
    var ds = [document];
    try { if (window.parent !== window && window.parent.document) ds.push(window.parent.document); } catch (e) {}
    ds.forEach(function (d) {
      [].forEach.call(d.querySelectorAll(NUT_NOI), function (e) { e.style.visibility = an ? "hidden" : ""; });
    });
  }

  function mo(g) {
    if (!lop) dung();
    nhom = g || nhomHienTai();
    if (!nhom.buoc || !nhom.buoc.length) return;
    truoc = document.activeElement;
    lop.hidden = false;
    document.documentElement.classList.add("hd-dang-mo");
    anNutNoi(true);
    den(0, 1);
    if (window.mhaiDo) window.mhaiDo("mo-huong-dan", { tro: D.ten + (nhom.id ? "-" + nhom.id : "") });
  }
  function dong() {
    if (!lop || lop.hidden) return;
    lop.hidden = true;
    document.documentElement.classList.remove("hd-dang-mo");
    anNutNoi(false);
    ghi(khoa(nhom));
    var ve_ = nutMo && hien(nutMo) ? nutMo : truoc;
    if (ve_ && ve_.focus) try { ve_.focus({ preventScroll: true }); } catch (e) {}
  }

  // huong: 1 tới, -1 lui; bước có "bo_neu_an" mà chỗ của nó không hiện thì đi tiếp theo hướng đó
  function den(j, huong) {
    var ds = nhom.buoc;
    while (j >= 0 && j < ds.length && ds[j].bo_neu_an && !tim(ds[j].chon)) j += huong;
    if (j < 0 || j >= ds.length) { if (huong > 0) dong(); return; }
    i = j;
    var b = ds[j];
    chi = tim(b.chon);
    // Đếm bước theo các bước sẽ thực sự hiện
    var tong = 0, thu = 0;
    for (var k = 0; k < ds.length; k++) {
      if (ds[k].bo_neu_an && !tim(ds[k].chon)) continue;
      tong++;
      if (k <= j) thu = tong;
    }
    sB.textContent = N.buoc + " " + thu + "/" + tong;
    pB.textContent = b.chu;
    nutLai.hidden = thu <= 1;
    var cuoi = true;
    for (var m = j + 1; m < ds.length; m++) if (!(ds[m].bo_neu_an && !tim(ds[m].chon))) { cuoi = false; break; }
    nutTiep.textContent = cuoi ? N.choi : N.tiep + " ›";
    laCuoi = cuoi;
    lop.classList.toggle("hd-giua", !chi);
    if (chi) cuonToi(chi);
    ve();
    setTimeout(ve, 380);
    setTimeout(ve, 800);
    nutTiep.focus({ preventScroll: true });
  }

  // Cuộn chỗ được soi vào màn hình: điện thoại thì đưa lên gần đầu (lời Bit nằm phía dưới), máy tính thì ra giữa
  function cuonToi(e) {
    var hep = window.innerWidth < 640, kieu = muot ? "smooth" : "auto";
    try {
      if (window.frameElement && window.parent !== window) { e.style.scrollMarginTop = "24px"; e.scrollIntoView({ behavior: kieu, block: hep ? "start" : "center" }); return; }
    } catch (x) {}
    var r = e.getBoundingClientRect(), h = window.innerHeight;
    var dich = hep || r.height > h - 260 ? r.top - 24 : r.top - (h - r.height) / 2;
    window.scrollTo({ top: Math.max(0, window.pageYOffset + dich), behavior: kieu });
  }

  function ve() {
    if (!lop || lop.hidden) return;
    var k = khung(), pad = 8, hep = k.w < 640;
    var bw = hep ? k.w - 24 : Math.min(340, k.w - 24);
    bong.style.width = bw + "px";
    var bh = bong.offsetHeight, x, y;
    if (!chi || !hien(chi)) {
      soi.hidden = true;
      x = (k.w - bw) / 2;
      y = hep ? k.top + k.h - bh - 12 : k.top + Math.max(12, (k.h - bh) / 2);
    } else {
      var r = chi.getBoundingClientRect();
      soi.hidden = false;
      soi.style.left = (r.left - pad) + "px";
      soi.style.top = (r.top - pad) + "px";
      soi.style.width = (r.width + pad * 2) + "px";
      soi.style.height = (r.height + pad * 2) + "px";
      if (hep) {
        // Điện thoại: lời Bit nằm dưới chỗ được soi nếu vừa, không thì sát đáy màn hình
        x = 12;
        y = r.bottom + pad + 12;
        if (y + bh > k.top + k.h - 8) y = k.top + k.h - bh - 12;
      } else {
        var duoi = r.bottom + pad + 14, tren = r.top - pad - 14 - bh, phai = r.right + pad + 16;
        if (duoi + bh <= k.top + k.h - 8) { y = duoi; x = r.left; }
        else if (tren >= k.top + 8) { y = tren; x = r.left; }
        else if (phai + bw <= k.w - 12) { x = phai; y = Math.max(k.top + 12, Math.min(r.top, k.top + k.h - bh - 12)); }
        else { x = (k.w - bw) / 2; y = k.top + k.h - bh - 16; }
        x = Math.max(12, Math.min(x, k.w - bw - 12));
      }
    }
    bong.style.left = Math.round(x) + "px";
    bong.style.top = Math.round(Math.max(k.top + 8, y)) + "px";
  }

  // Nút "Cách chơi". Trang nhiều trạm (mỗi trạm có tiêu đề h2): mỗi trạm một nút nằm ngang hàng tiêu đề trạm,
  // mở đúng hướng dẫn của trạm đó (Sang 18/10, cho gọn đầu trang). Trang một trò: dưới tiêu đề trò chơi;
  // trong trang bài (đầu trang bị ẩn) thì ở đầu khung trò chơi.
  function taoNut(g) {
    var n = el("button", "hd-mo");
    n.type = "button";
    var q = el("span", "hd-q", "?");
    q.setAttribute("aria-hidden", "true");
    n.appendChild(q);
    n.appendChild(el("span", "hd-mo-chu", N.mo));
    n.addEventListener("click", function () { nutMo = n; mo(g); });
    return n;
  }
  function datNutTram() {
    if (!D.nhom || !D.nhom.length) return false;
    var dat = D.nhom.map(function (g) { var t = null; try { t = document.querySelector(g.khi); } catch (e) {} return t && t.querySelector("h2"); });
    if (dat.some(function (h) { return !h; })) return false;
    D.nhom.forEach(function (g, k) {
      var h = dat[k], hang = el("div", "hd-tieu-de");
      h.parentNode.insertBefore(hang, h);
      hang.appendChild(h);
      var n = taoNut(g);
      n.setAttribute("aria-label", N.mo + ": " + h.textContent);
      hang.appendChild(n);
      if (!nutMo) nutMo = n;
    });
    return true;
  }
  function datNut() {
    if (datNutTram()) return;
    nutMo = taoNut();
    var dau = document.querySelector(".page-head");
    if (NHUNG || !dau) {
      var main = document.querySelector("main");
      if (!main) return;
      var hang = el("div", "hd-mo-hang");
      hang.appendChild(nutMo);
      main.insertBefore(hang, main.firstChild);
    } else {
      dau.appendChild(nutMo);
    }
  }

  function tuMo() {
    if (lop && !lop.hidden) return;
    var g = nhomHienTai();
    if (g.buoc && g.buoc.length && !doc(khoa(g))) mo(g);
  }

  function batDau() {
    datNut();
    setTimeout(tuMo, 700);
    // Trang nhiều trạm: lần đầu sang một trạm mới thì hướng dẫn trạm đó tự mở
    if (D.nhom && D.nhom.length) {
      var dangO = null;
      document.addEventListener("click", function () {
        setTimeout(function () {
          var g = nhomHienTai();
          if (g !== dangO) { dangO = g; tuMo(); }
        }, 350);
      });
      setTimeout(function () { dangO = nhomHienTai(); }, 750);
    }
  }
  if (document.readyState === "complete") batDau();
  else window.addEventListener("load", batDau);
})();

/* Bộ công cụ "AI cho người làm y tế" (ai-y-te.html, en/), series 601-610 và 611-615.
   Bảy trạm: che (che thông tin người bệnh), lenh (khung câu lệnh 5 phần), soat (soát 5 bước), de-hieu (tô thuật ngữ, câu dài,
   gợi ý teach-back), quy-tac (một trang quy tắc cho khoa, in được), ban-do (lọc các loại công cụ), danh-gia (phiếu 6 câu hỏi, in được).
   Mở thẳng một trạm bằng ?tram=<id> hoặc #<id>. Chữ và dữ liệu ở thẻ <script id="yt-du-lieu"> (lấy từ data/ai-y-te.json).
   Mọi xử lý chạy trên máy: không gửi chữ người dùng dán vào đi đâu, không lưu lại; chỉ đếm sự kiện chọn trạm (theo-doi.js).
   Che thông tin là quy tắc tìm theo mẫu (tên sau từ khóa, số giấy tờ, số điện thoại, ngày, mã hồ sơ, giường, địa chỉ),
   không bắt được mọi thứ: trang luôn nhắc đọc lại. Thử trong console: window.__yt.che("BN Nguyễn Văn A ...").*/
(function () {
  "use strict";
  var goc = document.getElementById("yt"), nguon = document.getElementById("yt-du-lieu");
  if (!goc || !nguon) return;
  var D = JSON.parse(nguon.textContent), N = D.nhan;
  var S = window.__yt = {};

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function thay(s, d) { return s.replace(/\{(\w+)\}/g, function (_, k) { return d[k]; }); }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function escHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bit(id, chu, loai) {
    var e = $(id);
    if (!e) return;
    if (!chu) { e.hidden = true; e.textContent = ""; return; }
    e.className = "yt-bit" + (loai ? " is-" + loai : "");
    var anh = loai === "sai" ? "bit-sai-roi" : loai === "dung" ? "bit-vui" : "bit-giai-thich";
    e.innerHTML = '<img src="' + D.p + "assets/" + anh + '.svg" alt="" width="44" height="44"><div></div>';
    var o = e.lastChild;
    (Array.isArray(chu) ? chu : [chu]).forEach(function (x) {
      if (x && x.nodeType) o.appendChild(x); else o.appendChild(el("p", null, x));
    });
    e.hidden = false;
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function chep(chu, tb) {
    function xong(ok) {
      if (!tb) return;
      if (tb.tagName === "BUTTON") {
        if (!tb._goc) tb._goc = tb.innerHTML;
        tb.textContent = ok ? N.da_chep : N.khong_chep;
        clearTimeout(tb._h); tb._h = setTimeout(function () { tb.innerHTML = tb._goc; }, 2000);
        return;
      }
      tb.textContent = ok ? N.da_chep : N.khong_chep;
      clearTimeout(tb._h); tb._h = setTimeout(function () { tb.textContent = ""; }, 2500);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(chu).then(function () { xong(true); }, function () { xong(cuChep(chu)); });
    } else xong(cuChep(chu));
  }
  function cuChep(chu) {
    var t = el("textarea"); t.value = chu; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t); return ok;
  }

  // ---------- chọn trạm ----------
  var nut = [].slice.call(goc.querySelectorAll("[data-tram]"));
  function moTram(id, bam) {
    if (!$("tram-" + id)) id = "che";
    [].slice.call(goc.querySelectorAll(".yt-tram")).forEach(function (s) { s.hidden = s.id !== "tram-" + id; });
    nut.forEach(function (n) { n.setAttribute("aria-current", n.dataset.tram === id ? "true" : "false"); });
    if (bam) {
      try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
      do_("ai-y-te-tram", { tram: id });
    }
  }
  nut.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });
  var q = (location.search.match(/[?&]tram=([\w-]+)/) || [])[1] || location.hash.slice(1);
  moTram(q || "che", false);

  // ---------- in một phần của trang ----------
  [].slice.call(goc.querySelectorAll("[data-in]")).forEach(function (b) {
    b.addEventListener("click", function () {
      var vung = $(b.dataset.in);
      if (!vung) return;
      document.documentElement.classList.add("yt-dang-in");
      vung.classList.add("yt-in-day");
      var bo = function () { document.documentElement.classList.remove("yt-dang-in"); vung.classList.remove("yt-in-day"); window.removeEventListener("afterprint", bo); };
      window.addEventListener("afterprint", bo);
      window.print();
      setTimeout(bo, 1500);
    });
  });

  // ================= 1. Che thông tin người bệnh =================
  var L = "\\p{L}", TU = "\\p{Lu}[\\p{Ll}\\p{M}]*";
  var DANH_XUNG = ["bn", "bệnh nhân", "người bệnh", "họ tên", "họ và tên", "tên", "ông", "bà", "anh", "chị", "cô", "chú", "bác", "cháu", "bé", "em", "con",
    "bác sĩ", "bs", "điều dưỡng", "đd", "người nhà", "vợ", "chồng", "mẹ", "bố", "cha",
    "patient", "pt", "name", "mr", "mrs", "ms", "miss", "dr", "next of kin", "nok", "wife", "husband", "mother", "father", "son", "daughter"];
  var reDanhXung = new RegExp("(?:^|[^" + L + "])(?:" + DANH_XUNG.map(escRe).join("|") + ")\\.?\\s*[:\\-–]?\\s*\\(?\\s*$", "u");
  var laDanhXung = function (w) { return DANH_XUNG.indexOf(w.toLowerCase().replace(/\.$/, "")) >= 0; };
  var reTen = new RegExp("(?<![" + L + "])" + TU + "(?![" + L + "])(?:\\s+" + TU + "(?![" + L + "]))*", "gu");
  var hoaThuong = function (s) { return s.split(" ").map(function (w) { var c = w.charAt(0); return "[" + c + c.toUpperCase() + "]" + escRe(w.slice(1)); }).join("\\s+"); };
  var DIA = ["đường", "phố", "phường", "xã", "quận", "huyện", "thôn", "ấp", "xóm", "ngõ", "ngách", "hẻm", "kiệt", "khu phố", "thị trấn", "thị xã", "tỉnh"];
  var MAU = [
    { loai: "email", re: /[\w.+\-]+@[\w\-]+(?:\.[\w\-]+)+/g },
    { loai: "bhyt", re: /(?<![A-Za-z0-9])[A-Z]{2}\d{13}(?!\d)/g },
    { loai: "cccd", re: /(?:CCCD|CMND|căn cước(?: công dân)?|NHS (?:no\.?|number)|SSN|ID (?:no\.?|number))\s*(?:số\s*)?[:#]?\s*(\d[\d \-]{7,16}\d)/giu },
    { loai: "cccd", re: /(?<!\d)\d{12}(?!\d)/g },
    { loai: "ma", re: /(?:mã\s*(?:BA|bệnh án|BN|người bệnh|hồ sơ|y tế|lưu trữ)|số\s*(?:vào viện|lưu trữ|bệnh án|hồ sơ)|SVV|MRN|hospital (?:no\.?|number)|record (?:no\.?|number))\s*[:#]?\s*([A-Z0-9][A-Z0-9\-\/.]{2,20}[A-Z0-9])/giu },
    { loai: "giuong", re: /(?:giường|bed)\s*(?:số\s*|no\.?\s*)?([A-Z]?\d{1,3}[A-Z]?)(?![\d])/giu },
    { loai: "sdt", re: /(?<![\d+])(?:\+84|\+44|\+1|0)(?:[\s.\-]?\d){8,10}(?!\d)/g },
    { loai: "nam-sinh", re: /(?:sinh năm|năm sinh|born in|year of birth)\s*[:\-]?\s*((?:19|20)\d{2})/giu },
    { loai: "ngay", re: /(?<!\d)\d{1,2}[\/.\-]\d{1,2}[\/.\-](?:19|20)?\d{2}(?![\d\/.\-]\d)/g },
    { loai: "dia-chi", re: /(?:địa chỉ|nơi ở|thường trú|tạm trú|address)\s*[:\-]?\s*([^\n]{3,90}?)(?=\s*(?:\.\s|\n|$|\.$|;))/giu },
    { loai: "dia-chi", re: new RegExp("(?<![" + L + "])(?:" + DIA.map(hoaThuong).join("|") + ")\\s+(?:\\d+[A-Za-z]?|" + TU + ")(?:\\s+(?:\\d+|" + TU + "))*", "gu") },
    { loai: "dia-chi", re: /(?<![\w])\d{1,4}[A-Za-z]?\s+(?:\p{Lu}\p{Ll}+\s+){1,3}(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Close|Way)\b\.?/gu }
  ];

  function timChe(text) {
    var ds = [];
    MAU.forEach(function (m) {
      m.re.lastIndex = 0;
      var k;
      while ((k = m.re.exec(text))) {
        if (!k[0]) { m.re.lastIndex++; continue; }
        var chu = k[1] != null ? k[1] : k[0];
        var bd = k.index + (k[1] != null ? k[0].lastIndexOf(k[1]) : 0);
        ds.push({ loai: m.loai, bd: bd, kt: bd + chu.length, chu: chu, chon: true });
      }
    });
    // Tên: chuỗi chữ viết hoa đầu, đứng sau một danh xưng (hoặc bắt đầu bằng danh xưng viết hoa: Ông, Mrs...)
    reTen.lastIndex = 0;
    var k;
    while ((k = reTen.exec(text))) {
      var tu = k[0].split(/\s+/), bd = k.index, bo = false;
      while (tu.length > 1 && laDanhXung(tu[0])) { bd = text.indexOf(tu[1], bd + tu[0].length); tu.shift(); bo = true; }
      if (tu.length === 1 && laDanhXung(tu[0])) continue;
      var chu = tu.join(" ");
      var truoc = text.slice(Math.max(0, bd - 30), bd);
      if (bo || reDanhXung.test(truoc.toLowerCase())) ds.push({ loai: "ten", bd: bd, kt: bd + text.slice(bd).indexOf(tu[tu.length - 1]) + tu[tu.length - 1].length, chu: null, chon: true });
      else if (tu.length >= 2) ds.push({ loai: "ten", bd: bd, kt: k.index + k[0].length, chu: null, chon: false, goi_y: true });
    }
    ds.forEach(function (x) { if (x.chu == null) x.chu = text.slice(x.bd, x.kt); });
    // bỏ chỗ chồng nhau: ưu tiên chỗ được chọn sẵn, rồi chỗ dài hơn
    ds.sort(function (a, b) { return (b.chon - a.chon) || ((b.kt - b.bd) - (a.kt - a.bd)) || (a.bd - b.bd); });
    var giu = [];
    ds.forEach(function (x) { if (!giu.some(function (y) { return x.bd < y.kt && y.bd < x.kt; })) giu.push(x); });
    giu.sort(function (a, b) { return a.bd - b.bd; });
    return giu;
  }

  var cheVao = $("che-vao"), cheRa = $("che-ra"), cheDs = $("che-ds"), cheThem = [];
  S.ds = [];
  function nhanChe(ds) {
    var dem = {}, nho = {};
    ds.forEach(function (x) {
      if (!x.chon) return;
      var khoa = x.loai + "|" + x.chu.toLowerCase().replace(/\s+/g, " ");
      if (!nho[khoa]) { dem[x.loai] = (dem[x.loai] || 0) + 1; nho[khoa] = dem[x.loai]; }
      x.so = nho[khoa];
    });
    ds.forEach(function (x) {
      var ten = N.loai[x.loai] || x.loai;
      x.nhan = "[" + ten + ((x.loai === "ten" || x.loai === "them") && x.so ? " " + x.so : "") + "]";
    });
  }
  function veChe() {
    var text = cheVao.value;
    nhanChe(S.ds);
    var ra = "", vt = 0;
    S.ds.forEach(function (x) { if (x.chon) { ra += text.slice(vt, x.bd) + x.nhan; vt = x.kt; } });
    cheRa.value = ra + text.slice(vt);
    cheDs.textContent = "";
    S.ds.forEach(function (x, i) {
      var li = el("li", x.goi_y ? "is-goi-y" : ""), lb = el("label"), o = el("input");
      o.type = "checkbox"; o.checked = x.chon; o.dataset.i = i;
      lb.appendChild(o);
      lb.appendChild(el("span", "yt-che-nhan", x.chon ? x.nhan : "[" + (N.loai[x.loai] || x.loai) + "]"));
      lb.appendChild(el("span", "yt-che-goc", x.chu));
      if (x.goi_y) lb.appendChild(el("small", null, N.goi_y_ten));
      li.appendChild(lb); cheDs.appendChild(li);
    });
    var n = S.ds.filter(function (x) { return x.chon; }).length;
    $("che-chep").hidden = !text.trim();
    $("che-them-hang").hidden = !text.trim();
    bit("che-bit", text.trim() ? (n ? thay(N.che_xong, { n: n }) : N.che_khong) : "", n ? "dung" : "");
    S.ra = cheRa.value;
  }
  function chayChe() {
    var text = cheVao.value;
    if (!text.trim()) { bit("che-bit", N.che_trong, "sai"); return; }
    var ds = timChe(text);
    cheThem.forEach(function (w) {
      var re = new RegExp("(?<![" + L + "\\d])" + escRe(w) + "(?![" + L + "\\d])", "giu"), k;
      while ((k = re.exec(text))) ds.push({ loai: "them", bd: k.index, kt: k.index + k[0].length, chu: k[0], chon: true });
    });
    ds.sort(function (a, b) { return (a.loai === "them" ? -1 : 0) - (b.loai === "them" ? -1 : 0) || a.bd - b.bd; });
    var giu = [];
    ds.forEach(function (x) { if (!giu.some(function (y) { return x.bd < y.kt && y.bd < x.kt; })) giu.push(x); });
    S.ds = giu.sort(function (a, b) { return a.bd - b.bd; });
    veChe();
  }
  S.che = function (text) { cheVao.value = text; chayChe(); return cheRa.value; };
  $("che-chay").addEventListener("click", function () { chayChe(); do_("ai-y-te-che"); });
  $("che-mau").addEventListener("click", function () { cheVao.value = N.mau_che; cheThem = []; chayChe(); });
  cheDs.addEventListener("change", function (e) {
    var i = e.target.dataset.i;
    if (i == null) return;
    S.ds[i].chon = e.target.checked; veChe();
  });
  $("che-them").addEventListener("click", function () {
    var w = $("che-them-o").value.trim();
    if (!w) return;
    if (cheThem.indexOf(w) < 0) cheThem.push(w);
    $("che-them-o").value = ""; chayChe();
  });
  $("che-them-o").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("che-them").click(); } });
  $("che-chep").hidden = true;
  $("che-chep").addEventListener("click", function () { chep(cheRa.value, $("che-chep")); });

  // ================= 2. Ghép câu lệnh (cùng kiểu Thợ ghép câu lệnh: .gh-lenh, .gh-dong, .gh-manh trong style.css) =================
  var THU_TU = ["vai_tro", "boi_canh", "viec", "dinh_dang", "gioi_han"], lenhChon = $("lenh-chon"), lenhVideo = "", lenhMau = null;
  // thứ tự mảnh trong khay: xen mảnh bẫy giữa các mảnh cần, cố định cho mọi việc
  var KHAY = ["boi_canh", "bay:nguy", "dinh_dang", "vai_tro", "bay:mo-ho", "gioi_han", "viec", "bay:lo"];
  S.lenhChon = {};
  function nhanManh(loai) {
    var l = D.loai_manh[loai], sp = el("span", "gh-loai", l.ten);
    sp.style.setProperty("--mau", l.mau); return sp;
  }
  function manhCua(m) {
    return KHAY.map(function (k) {
      if (k.indexOf("bay:") === 0) {
        var b = D.bay.filter(function (x) { return x.id === k.slice(4); })[0];
        return { id: k, loai: b.loai, chu: b.chu, bay: b };
      }
      return { id: k, loai: k, chu: k === "gioi_han" ? m.gioi_han + " " + D.gioi_han_chung : m[k] };
    });
  }
  function chonMau(i) {
    lenhMau = D.mau_lenh[i]; lenhVideo = lenhMau.video; S.lenhChon = {}; S.daGui = false;
    $("lenh-tl").hidden = true; $("lenh-cho").hidden = false; $("lenh-ben").classList.remove("is-cu");
    [].slice.call(lenhChon.children).forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.i === i)); });
    var khay = $("lenh-khay"); khay.textContent = "";
    manhCua(lenhMau).forEach(function (x) {
      var b = el("button", "gh-manh"); b.type = "button"; b.dataset.id = x.id; b.setAttribute("aria-pressed", "false");
      b.style.setProperty("--mau", D.loai_manh[x.loai].mau);
      b.appendChild(nhanManh(x.loai)); b.appendChild(el("span", "gh-manh-chu", x.chu));
      b.addEventListener("click", function () {
        S.lenhChon[x.id] = !S.lenhChon[x.id];
        b.setAttribute("aria-pressed", String(!!S.lenhChon[x.id]));
        veLenh(S.lenhChon[x.id] ? x : null);
        if (S.daGui) $("lenh-ben").classList.add("is-cu");
      });
      khay.appendChild(b);
    });
    veLenh(null);
  }
  function lenhDangChon() {
    var ds = manhCua(lenhMau).filter(function (x) { return S.lenhChon[x.id]; });
    return ds.sort(function (a, b) { return THU_TU.indexOf(a.loai) - THU_TU.indexOf(b.loai); });
  }
  function veLenh(vua) {
    var ds = $("lenh-ds"), co = lenhDangChon();
    ds.textContent = "";
    var g = el("p", "gh-dong gh-dong-goc");
    g.appendChild(el("span", "gh-loai gh-loai-goc", N.lenh_goc)); g.appendChild(el("span", "gh-dong-chu", lenhMau.goc));
    ds.appendChild(g);
    co.forEach(function (x) {
      var d = el("p", "gh-dong"); d.style.setProperty("--mau", D.loai_manh[x.loai].mau);
      d.appendChild(nhanManh(x.loai)); d.appendChild(el("span", "gh-dong-chu", x.chu)); ds.appendChild(d);
    });
    if (!co.length) ds.appendChild(el("p", "gh-trong", N.lenh_trong));
    var bay = co.filter(function (x) { return x.bay && x.bay.muc === "sai"; });
    var can = co.filter(function (x) { return !x.bay; }).length;
    $("lenh-chep").disabled = !!bay.length;
    if (vua && vua.bay) bit("lenh-bit", vua.bay.bit, vua.bay.muc);
    else if (bay.length) bit("lenh-bit", N.lenh_khoa + " " + bay[0].bay.bit, "sai");
    else if (can === 5) bit("lenh-bit", thay(N.lenh_du, { v: lenhVideo }), "dung");
    else bit("lenh-bit", can ? thay(N.lenh_dem, { n: can }) : N.lenh_bat_dau);
    S.lenh = co.length ? co.filter(function (x) { return !x.bay || !x.bay.muc; }).map(function (x) { return x.chu; }).join("\n") : lenhMau.goc;
  }
  // chữ trả lời: dòng "| " là hàng bảng, "- " là gạch đầu dòng, **chữ** in đậm (giống ghep-cau-lenh.js)
  function dam(cha, chu) {
    chu.split("**").forEach(function (phan, i) { cha.appendChild(i % 2 ? el("strong", null, phan) : document.createTextNode(phan)); });
  }
  function veChu(cha, chu) {
    var dong = chu.split("\n"), ul = null, bang = null;
    dong.forEach(function (d) {
      if (d.indexOf("| ") === 0) {
        if (!bang) { var bao = el("div", "gh-bang-bao"); bang = el("table", "gh-bang"); bao.appendChild(bang); cha.appendChild(bao); }
        var tr = el("tr"), o = d.slice(2).split(" | ");
        o.forEach(function (x) { var c = el(bang.rows.length ? "td" : "th"); dam(c, x.trim()); tr.appendChild(c); });
        bang.appendChild(tr); ul = null; return;
      }
      bang = null;
      if (d.indexOf("- ") === 0) { if (!ul) { ul = el("ul"); cha.appendChild(ul); } var li = el("li"); dam(li, d.slice(2)); ul.appendChild(li); return; }
      ul = null; var p_ = el("p"); dam(p_, d); cha.appendChild(p_);
    });
  }
  function guiAI() {
    var co = lenhDangChon(), can = co.filter(function (x) { return !x.bay; }).map(function (x) { return x.loai; });
    var muc = can.length === 5 ? "tot" : (can.indexOf("viec") >= 0 && can.indexOf("boi_canh") >= 0 ? "kha" : "tho");
    var coBay = function (id) { return co.some(function (x) { return x.id === "bay:" + id; }); };
    var tl = $("lenh-tl"); tl.textContent = ""; tl.className = "gh-tl gh-muc-" + muc;
    var dau = el("div", "gh-tl-dau"); dau.appendChild(el("span", "gh-tl-ai", N.ai)); dau.appendChild(el("span", "gh-tl-muc", N.muc[muc])); tl.appendChild(dau);
    if (coBay("lo")) tl.appendChild(el("p", "gh-canh-bao", N.canh_lo));
    var than = el("div", "gh-tl-than");
    veChu(than, lenhMau.tra_loi[muc] + (coBay("nguy") ? "\n" + N.nguy_them : ""));
    tl.appendChild(than);
    if (coBay("nguy")) tl.appendChild(el("p", "gh-canh-bao", N.canh_nguy));
    tl.hidden = false; $("lenh-cho").hidden = true; $("lenh-ben").classList.remove("is-cu");
    var bay = coBay("lo") || coBay("nguy");
    bit("lenh-bit", bay ? N.lenh_khoa : N["gui_" + muc], bay ? "sai" : (muc === "tot" ? "dung" : ""));
    S.daGui = true; S.muc = muc;
    try { tl.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }); } catch (e) {}
    do_("ai-y-te-gui", { muc: muc });
  }
  $("lenh-gui").addEventListener("click", guiAI);
  lenhChon.addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b) chonMau(+b.dataset.i); });
  $("lenh-lai").addEventListener("click", function () { chonMau(D.mau_lenh.indexOf(lenhMau)); });
  $("lenh-chep").addEventListener("click", function () { chep(S.lenh, $("lenh-chep")); do_("ai-y-te-lenh"); });
  chonMau(0);

  // ================= 3. Soát 5 bước: tìm 5 lỗi cài sẵn trong bản nháp AI, mỗi lỗi tick một thẻ =================
  var soatO = [].slice.call(goc.querySelectorAll("[data-buoc]")), nhap = $("soat-nhap"), daTim = {};
  D.ban_nhap.forEach(function (x, k) {
    var c = el("button", "yt-cau", x.chu); c.type = "button"; c.dataset.k = k;
    nhap.appendChild(c); nhap.appendChild(document.createTextNode(" "));
  });
  function soLoi() { return Object.keys(daTim).length; }
  function veSoat() {
    var xong = soatO.filter(function (o) { return o.checked; }).length;
    $("soat-thanh").style.width = (xong * 20) + "%";
    $("soat-dem").textContent = soLoi() + "/5";
    return xong;
  }
  function timLoi(c, hien) {
    var x = D.ban_nhap[c.dataset.k];
    if (!x.loi) { c.classList.add("is-ok"); bit("soat-bit", x.bit + " " + thay(N.soat_tim, { n: soLoi() })); return; }
    c.classList.add("is-loi"); c.setAttribute("aria-pressed", "true");
    daTim[x.loi] = true;
    soatO.forEach(function (o) { if (o.dataset.buoc === x.loi) o.checked = true; });
    veSoat();
    if (hien) return;
    bit("soat-bit", soLoi() === 5 ? N.soat_het : x.bit + " " + thay(N.soat_tim, { n: soLoi() }), soLoi() === 5 ? "dung" : "");
  }
  nhap.addEventListener("click", function (e) { var c = e.target.closest(".yt-cau"); if (c) timLoi(c); });
  soatO.forEach(function (o) {
    o.addEventListener("change", function () { if (veSoat() === 5 && soLoi() < 5) bit("soat-bit", N.soat_xong, "dung"); });
  });
  $("soat-dap").addEventListener("click", function () {
    [].slice.call(nhap.querySelectorAll(".yt-cau")).forEach(function (c) { if (D.ban_nhap[c.dataset.k].loi) timLoi(c, true); });
    bit("soat-bit", N.soat_het, "dung");
  });
  $("soat-lai").addEventListener("click", function () {
    daTim = {};
    [].slice.call(nhap.querySelectorAll(".yt-cau")).forEach(function (c) { c.classList.remove("is-loi", "is-ok"); c.removeAttribute("aria-pressed"); });
    soatO.forEach(function (o) { o.checked = false; });
    veSoat(); bit("soat-bit", "");
  });
  veSoat();

  // ================= 4. Viết cho người bệnh dễ hiểu =================
  var TN = D.thuat_ngu.slice().sort(function (a, b) { return b[0].length - a[0].length; });
  var reTN = TN.map(function (x) { return new RegExp("(?<![" + L + "])" + escRe(x[0]) + "(?![" + L + "])", "giu"); });
  var dhDai = $("dh-dai");
  function demChu(s) { return (s.match(/[\p{L}\p{N}]+(?:[\-'’][\p{L}\p{N}]+)*/gu) || []).length; }
  function chayDH() {
    var text = $("dh-vao").value.trim(), ket = $("dh-ket");
    if (!text) { ket.hidden = true; bit("dh-bit-trong", N.dh_trong, "sai"); return; }
    bit("dh-bit-trong", "");
    var nguong = +dhDai.value;
    var cau = text.split(/(?<=[.!?…;])\s+|\n+/).map(function (c) { return c.trim(); }).filter(Boolean);
    var gap = {}, soDai = 0, tongChu = 0, html = "";
    cau.forEach(function (c) {
      var n = demChu(c); tongChu += n;
      var dai = n > nguong; if (dai) soDai++;
      // tô thuật ngữ trong câu, cụm dài trước, không chồng nhau
      var vung = [];
      reTN.forEach(function (re, i) {
        re.lastIndex = 0; var k;
        while ((k = re.exec(c))) {
          var bd = k.index, kt = bd + k[0].length;
          if (!vung.some(function (v) { return bd < v.kt && v.bd < kt; })) { vung.push({ bd: bd, kt: kt, i: i }); gap[TN[i][0]] = TN[i][1]; }
        }
      });
      vung.sort(function (a, b) { return a.bd - b.bd; });
      var s = "", vt = 0;
      vung.forEach(function (v) {
        s += escHtml(c.slice(vt, v.bd)) + '<mark class="yt-tn" data-tn="' + escHtml(TN[v.i][0]) + '">' + escHtml(c.slice(v.bd, v.kt)) + "</mark>";
        vt = v.kt;
      });
      s += escHtml(c.slice(vt));
      html += (dai ? '<span class="yt-dai" title="' + n + '">' + s + "</span>" : "<span>" + s + "</span>") + " ";
    });
    $("dh-xem").innerHTML = html;
    var dsTn = Object.keys(gap);
    var so = [[cau.length, N.dh_cau], [soDai, N.dh_dai], [dsTn.length, N.dh_tn], [cau.length ? Math.round(tongChu / cau.length) : 0, N.dh_tb]];
    $("dh-so").innerHTML = so.map(function (x, i) { return '<div class="yt-so-o' + ((i === 1 || i === 2) && x[0] ? " is-cam" : "") + '"><b>' + x[0] + "</b><span>" + escHtml(x[1]) + "</span></div>"; }).join("");
    // danh sách thuật ngữ và cách nói dễ hiểu, đọc được cả khi không rê chuột (trình đọc màn hình, điện thoại)
    var dl = $("dh-tn"); dl.textContent = "";
    dsTn.forEach(function (k) { var o = el("div", "yt-tn-o"); o.dataset.tn = k; o.appendChild(el("dt", null, k)); o.appendChild(el("dd", null, gap[k])); dl.appendChild(o); });
    $("dh-tn-h").hidden = dl.hidden = !dsTn.length;
    var hoi = [];
    D.teach_back.forEach(function (x) { if (hoi.length < 3 && new RegExp(x[0], "iu").test(text)) hoi.push(x[1]); });
    N.dh_tb_chung.forEach(function (h) { if (hoi.length < 3 && hoi.indexOf(h) < 0) hoi.push(h); });
    var ol = el("ol");
    hoi.forEach(function (h) { ol.appendChild(el("li", null, h)); });
    bit("dh-bit", [soDai || dsTn.length ? N.dh_bit : N.dh_bit_tot, ol], soDai || dsTn.length ? "" : "dung");
    $("dh-lenh").textContent = thay(N.dh_lenh, { n: nguong, tn: dsTn.length ? dsTn.join(", ") : N.dh_khong_co });
    ket.hidden = false;
    S.dh = { cau: cau.length, dai: soDai, tn: dsTn, hoi: hoi };
  }
  dhDai.addEventListener("input", function () { $("dh-dai-so").textContent = dhDai.value; if (!$("dh-ket").hidden) chayDH(); });
  $("dh-chay").addEventListener("click", function () { chayDH(); do_("ai-y-te-de-hieu"); });
  $("dh-mau").addEventListener("click", function () { $("dh-vao").value = N.mau_dh; chayDH(); });
  $("dh-chep").addEventListener("click", function () { chep($("dh-lenh").textContent, $("dh-chep")); });
  // chạm một thuật ngữ trong bài: sáng dòng tương ứng ở danh sách "Nên nói dễ hiểu hơn"
  $("dh-xem").addEventListener("click", function (e) {
    var m = e.target.closest("mark.yt-tn"); if (!m) return;
    [].slice.call(document.querySelectorAll("#dh-tn .yt-tn-o")).forEach(function (o) {
      var dung = o.dataset.tn === m.dataset.tn; o.classList.toggle("is-sang", dung);
      if (dung) try { o.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (x) {}
    });
  });

  // ================= 5. Quy tắc cho khoa =================
  var qtO = ["qt-khoa", "qt-cong-cu", "qt-duyet", "qt-su-co", "qt-ngay", "qt-ra-soat"];
  try { $("qt-ngay").value = new Date().toISOString().slice(0, 10); } catch (e) {}
  function veQT() {
    var g = function (id) { return $(id).value.trim(); };
    var duoc = [].slice.call(goc.querySelectorAll("[data-duoc]")).filter(function (o) { return o.checked; }).map(function (o) { return D.duoc[o.dataset.duoc]; });
    var cam = [].slice.call(goc.querySelectorAll("[data-cam]")).filter(function (o) { return o.checked; }).map(function (o) { return D.cam[o.dataset.cam]; });
    var li = function (ds) { return ds.map(function (x) { return "<li>" + escHtml(x) + "</li>"; }).join(""); };
    var ngay = g("qt-ngay"), ngayHien = ngay ? (D.lg === "en" ? ngay : ngay.split("-").reverse().join("/")) : N.qt_chua;
    $("qt-giay").innerHTML =
      '<p class="yt-giay-nhan">' + escHtml(N.qt_tieu) + "</p><h3>" + escHtml(g("qt-khoa") || N.qt_khoa_trong) + "</h3>" +
      '<p class="yt-giay-cc">' + escHtml(N.qt_cong_cu) + (g("qt-cong-cu") ? ": <b>" + escHtml(g("qt-cong-cu")) + "</b>" : ".") + "</p>" +
      '<div class="yt-giay-2"><div class="is-xanh"><h4>✓ ' + escHtml(N.qt_duoc) + "</h4><ul>" + li(duoc) + "</ul></div>" +
      '<div class="is-do"><h4>✕ ' + escHtml(N.qt_cam) + "</h4><ul>" + li(cam) + "</ul></div></div>" +
      "<h4>" + escHtml(N.qt_luon) + "</h4><ol>" + li(N.qt_luon_ds) + "</ol>" +
      '<p><b>' + escHtml(N.qt_duyet) + ":</b> " + escHtml(g("qt-duyet") || N.qt_chua) + "</p>" +
      '<p><b>' + escHtml(N.qt_su_co) + ":</b> " + escHtml(g("qt-su-co") || N.qt_chua) + ". " + escHtml(N.qt_su_co_them) + "</p>" +
      '<p class="yt-giay-ngay">' + escHtml(N.qt_ngay) + ": " + escHtml(ngayHien) + " · " + escHtml(thay(N.qt_ra_soat, { n: g("qt-ra-soat") })) + "</p>";
  }
  qtO.forEach(function (id) { $(id).addEventListener("input", veQT); $(id).addEventListener("change", veQT); });
  goc.querySelector("#tram-quy-tac").addEventListener("change", veQT);
  veQT();

  // ================= 6. Bản đồ công cụ =================
  var bdNut = [].slice.call(goc.querySelectorAll("[data-bd]"));
  function moBD(k) {
    var x = D.ban_do[k], the = $("bd-the");
    bdNut.forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.bd === k)); });
    the.textContent = "";
    var dau = el("div", "yt-bd-dau");
    dau.appendChild(el("span", "yt-bd-bt", x.bieu_tuong));
    var h = el("div"); h.appendChild(el("h3", null, x.ten)); h.appendChild(el("p", "bn-nhan", "Video " + x.video)); dau.appendChild(h);
    the.appendChild(dau);
    var dl = el("dl");
    ["lam_gi", "vi_du", "kiem", "nguoi"].forEach(function (f) {
      var o = el("div", "yt-bd-o is-" + f); o.appendChild(el("dt", null, N.bd_nhan[f])); o.appendChild(el("dd", null, x[f])); dl.appendChild(o);
    });
    the.appendChild(dl);
    the.hidden = false;
  }
  bdNut.forEach(function (b) { b.addEventListener("click", function () { moBD(+b.dataset.bd); }); });
  moBD(0);

  // ================= 7. Phiếu đánh giá =================
  function veDG() {
    var chua = 0, chan = [], ro = [], khong = [];
    D.danh_gia.forEach(function (x, i) {
      var o = goc.querySelector('input[name="dg-' + x.id + '"]:checked');
      if (!o) { chua++; return; }
      if (o.value === "khong") (x.chan ? chan : khong).push(i + 1);
      if (o.value === "chua") ro.push(i);
    });
    if (chan.length) return bit("dg-bit", thay(N.dg_chan, { ds: chan.join(", ") }), "sai");
    if (ro.length) {
      var ul = el("ul");
      ro.forEach(function (i) { var li = el("li"); li.appendChild(el("b", null, D.danh_gia[i].ngan + ": ")); li.appendChild(document.createTextNode(D.danh_gia[i].goi_y)); ul.appendChild(li); });
      return bit("dg-bit", [N.dg_chua_ro, ul]);
    }
    if (chua) return bit("dg-bit", thay(N.dg_chua, { n: chua }));
    bit("dg-bit", N.dg_thu + (khong.length ? " " + thay(N.dg_thu_luu_y, { ds: khong.join(", ") }) : ""), "dung");
  }
  $("dg-phieu").addEventListener("change", veDG);
  veDG();
})();

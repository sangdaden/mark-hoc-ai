/* Trò chơi "Bit bắt lỗi" (bit-bat-loi.html, en/): một khuôn tìm chỗ sai dùng chung cho nhiều tập.
   Dữ liệu: thẻ <script id="bl-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/bit-bat-loi.json (+ ảnh data/bit-bat-loi-hinh/*.svg).
   Mỗi ca có một hay nhiều khung: "chat" (đoạn chữ chạm được), "hinh" (SVG, nhóm data-loi là chỗ sai), "bieu-do" (cột vẽ bằng JS,
   kéo trục về 0). Chạm đúng là đánh dấu ngay, chạm nhầm bị đếm. Cuối game vẽ thẻ điểm PNG bằng <canvas> để lưu hoặc gửi.
   ?tap=N: chơi ngay các ca của video N; ?bo=<id>: chơi một bộ. Không lưu, không gửi gì ngoài vài sự kiện đếm (theo-doi.js).
   Trạng thái ở window.__bl để chạy thử. */
(function () {
  "use strict";
  var nguon = document.getElementById("bl-du-lieu");
  if (!nguon) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, CA = D.ca, BO = {}, ASSET = D.p + "assets/";
  D.bo.forEach(function (b) { BO[b.id] = b; });
  var mo = document.getElementById("bl-mo"), san = document.getElementById("bl-san"), dau = document.getElementById("bl-dau");
  var tien = document.getElementById("bl-tien"), diemEl = document.getElementById("bl-diem"), ket = document.getElementById("bl-ket");
  var SVGNS = "http://www.w3.org/2000/svg";
  var S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function sv(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function tron(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function len(e) { (e || san).scrollIntoView({ behavior: "smooth", block: "start" }); }

  // ---------- chọn bộ ----------
  function chonBo(id) {
    var ds, ten;
    if (id === "tron") {
      ds = [];
      D.bo.forEach(function (b) { ds = ds.concat(tron(CA.filter(function (c) { return c.bo === b.id; })).slice(0, 2)); });
      ds = tron(ds); ten = N.tron;
    } else {
      ds = CA.filter(function (c) { return c.bo === id; }); ten = BO[id].ten;
    }
    batDau(ds, ten, id);
  }

  function batDau(ds, ten, kieu) {
    S = { ds: ds, i: 0, tim: 0, tong: 0, nham: 0, ten: ten, kieu: kieu, sot: [] };
    window.__bl = S;
    mo.hidden = true; ket.hidden = true; dau.hidden = false; san.hidden = false;
    ve();
    do_("bat-loi-bat-dau", { bo: kieu });
  }

  // ---------- vẽ một ca ----------
  function ve() {
    var c = S.ds[S.i];
    var C = S.c = { ca: c, tim: {}, nham: 0, xong: false, khoa: Object.keys(c.loi) };
    tien.textContent = S.ten + " · " + N.ca + " " + (S.i + 1) + "/" + S.ds.length;
    diemEl.textContent = N.da_bat + ": " + S.tim;
    san.innerHTML = "";
    var b = BO[c.bo];
    var o = el("div", "bl-o");
    o.style.setProperty("--mau", b.mau);
    var trai = el("div", "bl-trai");
    var de = el("div", "bl-de");
    de.appendChild(el("span", "bl-bo-nhan", b.ten));
    de.appendChild(el("h2", "bl-de-h", N.tim + " " + C.khoa.length + " " + c.de));
    trai.appendChild(de);
    // Bộ "AI trả lời sai": câu trả lời là của Mây Bịa, đám mây hay bịa, người chơi cùng Bit bắt lỗi
    if (c.bo === "ai-sai") {
      var may = el("div", "nv bl-may");
      may.appendChild(anhNv("may-bia"));
      var loi = el("p", "nv-loi");
      loi.appendChild(el("b", null, N.may_ten + ": "));
      loi.appendChild(document.createTextNode(N.may_noi));
      may.appendChild(loi);
      trai.appendChild(may);
    }
    c.khung.forEach(function (k) { trai.appendChild(veKhung(k)); });
    o.appendChild(trai);
    var ben = el("div", "bl-ben");
    ben.setAttribute("aria-live", "polite");
    C.ben = ben;
    o.appendChild(ben);
    san.appendChild(o);
    veBen();
  }

  function veKhung(k) {
    var f = el("figure", "bl-k bl-k-" + k.loai + (k.kieu ? " bl-kieu-" + k.kieu : ""));
    if (k.ten || k.phu) {
      var cap = el("figcaption", "bl-k-dau");
      var av = S.c.ca.bo === "ai-sai" ? anhNv("may-bia", "bl-av-nv") : el("span", "bl-av", (k.ten || "?").trim().charAt(0).toUpperCase());
      av.setAttribute("aria-hidden", "true");
      if (k.loai === "chat") cap.appendChild(av);
      var ten = el("div", "bl-k-ten");
      ten.appendChild(el("b", null, k.ten));
      if (k.phu) ten.appendChild(el("span", null, k.phu));
      cap.appendChild(ten);
      if (k.kieu === "qc") cap.appendChild(el("span", "bl-tai-tro", N.tai_tro));
      f.appendChild(cap);
    }
    if (k.loai === "chat") f.appendChild(veChat(k));
    else if (k.loai === "hinh") f.appendChild(veHinh(k));
    else f.appendChild(veBieuDo(k));
    return f;
  }

  function anhNv(id, cls) {
    var i = el("img", cls || null);
    i.src = ASSET + "nhan-vat/" + id + ".svg"; i.alt = ""; i.width = 64; i.height = 77;
    return i;
  }

  function doan(chu, loi) {
    // span role=button (không dùng <button>) để câu không bị ngắt khối giữa dòng
    var s = el("span", "bl-doan", chu);
    s.setAttribute("role", "button");
    s.tabIndex = 0;
    s.dataset.loi = loi || "";
    function bam() { cham(s.dataset.loi, s); }
    s.addEventListener("click", bam);
    s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bam(); } });
    return s;
  }

  function veChat(k) {
    var than = el("div", "bl-than");
    k.dong.forEach(function (d) {
      var hang = el("div", "bl-dong bl-tu-" + d.tu);
      if (d.tu === "ai") hang.appendChild(el("span", "bl-noi", N.ai));
      if (d.tu === "minh") hang.appendChild(el("span", "bl-noi", N.ban));
      var bong = el("p", "bl-bong");
      d.doan.forEach(function (x) { bong.appendChild(doan(x.chu, x.loi)); });
      hang.appendChild(bong);
      than.appendChild(hang);
    });
    return than;
  }

  function veHinh(k) {
    var hop = el("div", "bl-hinh");
    hop.innerHTML = k.svg;
    var svg = hop.querySelector("svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", k.ten || "");
    svg.addEventListener("click", function (e) {
      var g = e.target.closest("[data-loi]");
      if (g) { cham(g.getAttribute("data-loi"), null); return; }
      if (S.c.xong) return;
      // chạm trượt: đánh dấu X tại chỗ chạm
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var m = svg.getScreenCTM();
      if (!m) return;
      var q = pt.matrixTransform(m.inverse());
      var x = sv("g", { "class": "bl-x" });
      x.appendChild(sv("path", { d: "M" + (q.x - 7) + " " + (q.y - 7) + "l14 14m0 -14l-14 14" }));
      svg.appendChild(x);
      S.c.nham++; S.nham++;
      veBen();
    });
    return hop;
  }

  function veBieuDo(k) {
    var hop = el("div", "bl-bd");
    var W = 400, H = 250, X0 = 52, Y0 = 26, Y1 = 206, top = Math.max.apply(null, k.cot.map(function (x) { return x[1]; }));
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": k.tieu_de });
    svg.appendChild(sv("text", { x: X0, y: 16, "class": "bl-bd-tieu" })).textContent = k.tieu_de;
    var cot = sv("g", {}), truc = sv("g", k.loi_truc ? { "data-loi": k.loi_truc } : {});
    svg.appendChild(cot); svg.appendChild(truc);
    var bw = Math.min(90, (W - X0 - 30) / k.cot.length - 30);
    function veLai(tu) {
      cot.innerHTML = ""; truc.innerHTML = "";
      truc.appendChild(sv("line", { x1: X0, y1: Y0, x2: X0, y2: Y1, "class": "bl-bd-truc" }));
      truc.appendChild(sv("line", { x1: X0, y1: Y1, x2: W - 10, y2: Y1, "class": "bl-bd-truc" }));
      [tu, (tu + top) / 2, top].forEach(function (v, i) {
        var y = Y1 - (Y1 - Y0) * (i / 2);
        truc.appendChild(sv("text", { x: X0 - 8, y: y + 4, "text-anchor": "end", "class": "bl-bd-so" + (i === 0 && tu > 0 ? " bl-bd-goc" : "") })).textContent = +v.toFixed(1);
      });
      if (k.loi_truc) truc.appendChild(sv("rect", { x: 0, y: Y0 - 8, width: X0 + 8, height: Y1 - Y0 + 22, fill: "transparent" }));
      k.cot.forEach(function (x, i) {
        var cx = X0 + 30 + i * ((W - X0 - 30) / k.cot.length), h = Math.max(1, (Y1 - Y0) * (x[1] - tu) / ((top - tu) || 1));
        cot.appendChild(sv("rect", { x: cx, y: Y1 - h, width: bw, height: h, rx: 6, "class": "bl-bd-cot bl-bd-cot-" + i }));
        cot.appendChild(sv("text", { x: cx + bw / 2, y: Y1 - h - 6, "text-anchor": "middle", "class": "bl-bd-gt" })).textContent = x[1];
        cot.appendChild(sv("text", { x: cx + bw / 2, y: Y1 + 18, "text-anchor": "middle", "class": "bl-bd-nhan" })).textContent = x[0];
      });
    }
    veLai(k.tu);
    svg.addEventListener("click", function (e) {
      var g = e.target.closest("[data-loi]");
      if (g) cham(g.getAttribute("data-loi"), null);
    });
    hop.appendChild(svg);
    if (k.tu > 0) {
      var keo = el("label", "bl-keo");
      var nhan = el("span", null, N.truc_tu + " " + k.tu);
      var r = el("input");
      r.type = "range"; r.min = 0; r.max = k.tu; r.step = 1; r.value = k.tu;
      r.setAttribute("aria-label", N.keo_truc);
      r.addEventListener("input", function () {
        var v = +r.value;
        nhan.textContent = N.truc_tu + " " + v;
        veLai(v);
        if (v === 0 && k.loi_truc) cham(k.loi_truc, null);
      });
      keo.appendChild(el("b", null, "↕ " + N.keo_truc));
      keo.appendChild(r);
      keo.appendChild(nhan);
      hop.appendChild(keo);
    }
    if (k.chu_thich) {
      var ct = el("p", "bl-bd-ct");
      ct.appendChild(doan(k.chu_thich, k.loi_chu_thich));
      hop.appendChild(ct);
    }
    return hop;
  }

  // ---------- chạm ----------
  function cacCho(khoa) { return san.querySelectorAll('[data-loi="' + khoa + '"]'); }

  function vong(g, cls) {
    // khoanh tròn quanh một nhóm trong SVG
    var svg = g.ownerSVGElement;
    if (!svg || !g.getBBox) return;
    var b = g.getBBox();
    var ve = sv("ellipse", { cx: b.x + b.width / 2, cy: b.y + b.height / 2, rx: b.width / 2 + 6, ry: b.height / 2 + 6, "class": "bl-vong " + cls });
    (g.parentNode || svg).insertBefore(ve, g.nextSibling);
  }

  function danhDau(khoa, cls) {
    cacCho(khoa).forEach(function (x) {
      if (x.namespaceURI === SVGNS) { if (!x.classList.contains(cls)) { x.classList.add(cls); if (x.tagName.toLowerCase() === "g") vong(x, cls); } }
      else x.classList.add(cls);
    });
  }

  function cham(khoa, nut) {
    var C = S.c;
    if (C.xong) return;
    if (khoa) {
      if (C.tim[khoa]) return;
      C.tim[khoa] = 1;
      danhDau(khoa, "is-tim");
      if (Object.keys(C.tim).length === C.khoa.length) { lat(true); return; }
    } else if (nut) {
      if (nut.classList.contains("is-nham")) return;
      nut.classList.add("is-nham");
      nut.title = N.on;
      C.nham++; S.nham++;
    }
    veBen(khoa);
  }

  function veBen(moi) {
    var C = S.c, c = C.ca, ben = C.ben;
    if (C.xong) return;
    ben.innerHTML = "";
    var n = Object.keys(C.tim).length;
    var dem = el("div", "bl-dem");
    var cham_ = el("div", "bl-cham");
    C.khoa.forEach(function (k) { cham_.appendChild(el("span", C.tim[k] ? "is-tim" : "")); });
    dem.appendChild(cham_);
    dem.appendChild(el("b", null, N.da_bat + " " + n + "/" + C.khoa.length));
    if (C.nham) dem.appendChild(el("span", "bl-dem-nham", N.nham + ": " + C.nham));
    ben.appendChild(dem);
    if (!n) ben.appendChild(el("p", "bl-huong", N.huong));
    var ds = el("ul", "bl-ds");
    C.khoa.forEach(function (k) {
      if (!C.tim[k]) return;
      var li = el("li", "is-tim" + (k === moi ? " is-moi" : ""));
      li.appendChild(el("span", "bl-ds-nhan", "✓ " + N.da_tim));
      li.appendChild(el("span", null, c.loi[k]));
      ds.appendChild(li);
    });
    if (n) ben.appendChild(ds);
    var chiu = el("button", "btn bl-chiu", N.chiu);
    chiu.type = "button";
    chiu.addEventListener("click", function () { lat(false); do_("bat-loi-xem-dap-an", { ca: c.id }); });
    ben.appendChild(chiu);
  }

  function lat(het) {
    var C = S.c, c = C.ca;
    C.xong = true;
    var n = Object.keys(C.tim).length;
    S.tim += n; S.tong += C.khoa.length;
    if (n < C.khoa.length) S.sot.push(c);
    C.khoa.forEach(function (k) { if (!C.tim[k]) danhDau(k, "is-sot"); });
    san.querySelectorAll(".bl-doan").forEach(function (b) { b.setAttribute("aria-disabled", "true"); b.removeAttribute("tabindex"); });
    san.querySelectorAll(".bl-keo input").forEach(function (r) { r.disabled = true; });
    diemEl.textContent = N.da_bat + ": " + S.tim;

    var ben = C.ben;
    ben.innerHTML = "";
    var ph = el("div", "bl-ph " + (het ? "is-het" : "is-sot"));
    var bit = el("img");
    bit.src = ASSET + (het ? "bit-vui.svg" : "bit-giai-thich.svg");
    bit.alt = ""; bit.width = 64; bit.height = 64;
    ph.appendChild(bit);
    var chu = el("div");
    chu.appendChild(el("b", "bl-ph-dau", het ? N.bat_het : N.bat_duoc + " " + n + "/" + C.khoa.length));
    var ul = el("ul", "bl-ds");
    C.khoa.forEach(function (k) {
      var li = el("li", C.tim[k] ? "is-tim" : "is-sot");
      li.appendChild(el("span", "bl-ds-nhan", C.tim[k] ? "✓ " + N.da_tim : "• " + N.bo_sot));
      li.appendChild(el("span", null, c.loi[k]));
      ul.appendChild(li);
    });
    chu.appendChild(ul);
    ph.appendChild(chu);
    ben.appendChild(ph);
    var kiem = el("div", "bl-kiem");
    kiem.appendChild(el("b", null, N.cach_kiem));
    kiem.appendChild(el("p", null, c.kiem));
    ben.appendChild(kiem);

    var nut = el("div", "cta bl-sau");
    var tiep = el("button", "btn btn-yt", S.i + 1 < S.ds.length ? N.tiep + " ›" : N.xem_ket);
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (S.i + 1 < S.ds.length) { S.i++; ve(); len(dau); }
      else ketThuc();
    });
    nut.appendChild(tiep);
    nut.appendChild(nutVideo(c.video, "btn"));
    ben.appendChild(nut);
    tiep.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 760px)").matches) len(ben);
    do_("bat-loi-ca", { ca: c.id, tim: n + "/" + C.khoa.length });
  }

  function nutVideo(v, cls) {
    if (v.url) {
      var a = el("a", cls, N.xem_video + " #" + v.so);
      a.href = v.url;
      a.addEventListener("click", function () { do_("bat-loi-xem-video", { so: String(v.so) }); });
      return a;
    }
    return el("span", cls + " bl-sap", "#" + v.so + " · " + N.sap_ra);
  }

  // ---------- kết quả + thẻ điểm ----------
  function hang() {
    var tl = S.tong ? S.tim / S.tong : 0;
    if (tl >= 0.9 && S.nham > 3) tl = 0.89;
    return N.hang.filter(function (h) { return tl >= h[0]; })[0][1];
  }

  function ketThuc() {
    san.hidden = true; dau.hidden = true; ket.hidden = false;
    var h = hang();
    document.getElementById("bl-ket-so").textContent = S.tim + "/" + S.tong;
    document.getElementById("bl-ket-hang").textContent = h;
    document.getElementById("bl-ket-phu").textContent = S.ds.length + " " + N.so_ca + " · " + N.nham.toLowerCase() + " " + S.nham;
    var hd = document.getElementById("bl-ket-h"), box = document.getElementById("bl-ket-video");
    box.innerHTML = "";
    var da = {};
    var vids = S.sot.map(function (c) { return c.video; }).filter(function (v) { if (da[v.so]) return false; da[v.so] = 1; return true; });
    hd.textContent = vids.length ? N.on_lai : N.het_sot;
    vids.forEach(function (v) {
      var a = el(v.url ? "a" : "div", "bl-vid");
      if (v.url) a.href = v.url;
      a.appendChild(el("span", "bl-vid-so", "#" + v.so));
      a.appendChild(el("b", null, v.ten || N.sap_ra));
      box.appendChild(a);
    });
    veThe(h);
    len(ket);
    do_("bat-loi-xong", { diem: S.tim + "/" + S.tong, bo: S.kieu });
    do_("hoc-xong", { loai: "bat-loi" });
  }

  function anh(src) {
    return new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; });
  }

  function veThe(h) {
    var cv = document.createElement("canvas");
    cv.width = 1080; cv.height = 1350;
    var x = cv.getContext("2d");
    var fonts = document.fonts ? Promise.all([document.fonts.load('800 120px "Be Vietnam Pro"'), document.fonts.load('600 40px "Inter"')]).catch(function () {}) : Promise.resolve();
    Promise.all([fonts, anh(ASSET + "bit-vui.svg"), anh(ASSET + "logo.png")]).then(function (r) {
      var bit = r[1], logo = r[2];
      var g = x.createLinearGradient(0, 0, 1080, 1350);
      g.addColorStop(0, "#2563EB"); g.addColorStop(0.55, "#0369A1"); g.addColorStop(1, "#0F766E");
      x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      x.fillStyle = "rgba(255,255,255,.07)";
      for (var i = 0; i < 6; i++) { x.beginPath(); x.arc(900 - i * 40, 260 + i * 30, 120 + i * 70, 0, 7); x.fill(); }
      var D_ = '"Be Vietnam Pro", "Inter", sans-serif', B_ = '"Inter", sans-serif';
      if (logo) x.drawImage(logo, 80, 80, 84, 84);
      x.fillStyle = "#fff"; x.textBaseline = "alphabetic";
      x.font = "800 44px " + D_; x.fillText("Mark học AI", 184, 136);
      x.fillStyle = "#FACC15"; x.font = "800 38px " + D_; x.fillText(N.the_kicker, 80, 300);
      x.fillStyle = "#fff"; x.font = "800 230px " + D_; x.fillText(S.tim + "/" + S.tong, 70, 520);
      x.font = "600 48px " + B_; x.fillText(N.the_bat, 84, 600);
      x.fillStyle = "#fff"; x.font = "800 72px " + D_;
      var dong = chia(x, h, 900), y = 740;
      dong.forEach(function (d) { x.fillText(d, 80, y); y += 86; });
      x.font = "600 38px " + B_; x.fillStyle = "rgba(255,255,255,.88)";
      x.fillText(S.ten + " · " + S.ds.length + " " + N.so_ca, 80, y + 10);
      x.fillText(N.nham + ": " + S.nham, 80, y + 64);
      if (bit) x.drawImage(bit, 640, 840, 380, 380);
      x.fillStyle = "rgba(15,23,42,.35)"; x.fillRect(0, 1210, 1080, 140);
      x.fillStyle = "#fff"; x.font = "800 44px " + D_; x.fillText(N.the_moi, 80, 1270);
      x.font = "600 34px " + B_; x.fillStyle = "#FACC15"; x.fillText(N.url.replace(/^https:\/\//, ""), 80, 1318);
      var url = cv.toDataURL("image/png");
      document.getElementById("bl-the-anh").src = url;
      var luu = document.getElementById("bl-luu-anh");
      luu.href = url; luu.download = N.the_file + ".png";
      luu.onclick = function () { do_("bat-loi-luu-anh"); };
      var chia_ = document.getElementById("bl-chia-anh");
      cv.toBlob(function (blob) {
        if (!blob || !navigator.canShare) return;
        var f = new File([blob], N.the_file + ".png", { type: "image/png" });
        if (!navigator.canShare({ files: [f] })) return;
        chia_.hidden = false;
        chia_.onclick = function () {
          navigator.share({ files: [f], title: N.the_kicker, text: N.the_moi + " " + N.url }).catch(function () {});
          do_("bat-loi-chia-se-anh");
        };
      }, "image/png");
    });
  }

  function chia(x, chu, rong) {
    var tu = chu.split(" "), ra = [], dong = "";
    tu.forEach(function (w) {
      var thu = dong ? dong + " " + w : w;
      if (x.measureText(thu).width > rong && dong) { ra.push(dong); dong = w; } else dong = thu;
    });
    if (dong) ra.push(dong);
    return ra;
  }

  // ---------- bắt đầu ----------
  mo.querySelectorAll(".bl-bo").forEach(function (b) { b.addEventListener("click", function () { chonBo(b.dataset.bo); len(dau); }); });
  document.getElementById("bl-lai").addEventListener("click", function () {
    if (S.kieu === "tron") chonBo("tron"); else batDau(S.ds, S.ten, S.kieu);
    len(dau);
  });
  document.getElementById("bl-khac").addEventListener("click", function () { ket.hidden = true; mo.hidden = false; len(mo); });

  var q = new URLSearchParams(location.search), tap = q.get("tap"), bo = q.get("bo");
  var cuaTap = tap ? CA.filter(function (c) { return String(c.video.so) === tap; }) : [];
  if (cuaTap.length) batDau(cuaTap, N.bo_cua + " #" + tap, "tap-" + tap);
  else if (bo && (BO[bo] || bo === "tron")) chonBo(bo);
})();

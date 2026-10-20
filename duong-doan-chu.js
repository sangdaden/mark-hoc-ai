// Game "Đường đoán chữ" (duong-doan-chu.html + en/duong-doan-chu.html), kiểu Câu cá chữ (Sang chọn 20/10).
// Mỗi bước của câu là một hồ cá: mỗi con cá mang một chữ có thể đứng sau, chữ càng hay gặp thì đàn cá càng đông
// (số cá tỉ lệ với xác suất), nên thả câu bừa cũng dễ trúng chữ phổ biến, đúng như chatbot bốc chữ theo tỉ lệ (video 7).
// Nút "Khuấy hồ" là nhiệt độ: tỉ lệ đổi theo p^(1/T). Nhiệt độ thấp thì gần như toàn cá chữ phổ biến, cá hiếm biến mất;
// nhiệt độ cao thì cá hiếm đông lên, cá bơi loạn, và cá rác (chữ vô nghĩa, "bia") xuất hiện: câu trúng là câu văn bị
// ảo giác, mất một tim (video 8). Bài học nằm trong luật chơi, không có câu hỏi chữ.
// Dữ liệu màn chơi: data/duong-doan-chu.json (trang nhúng sẵn ở #ddc-du-lieu). Khung toàn màn hình nằm ngang và mẹo
// "Thêm vào MH chính" theo cách của phieu-luu.js. Tiến độ ở localStorage "mhai-duong-doan-chu".
(function () {
  "use strict";
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var goc = $("#ddc-du-lieu");
  if (!goc) return;
  var D = JSON.parse(goc.textContent), N = D.nhan, EN = document.documentElement.lang === "en";
  ["manSo", "s3", "hetMan"].forEach(function (k) { var mau = N[k]; N[k] = function (n) { return mau.replace("{n}", n); }; });
  var KHOA = "mhai-duong-doan-chu";
  var CAO = 540, NUOC = 190, DAY = 512, BUOC = 1 / 120, SO_CA = 14;
  var NHIET = [0.5, 1, 1.8], MO = 0.03; // chữ có tỉ lệ (sau nhiệt độ) dưới 3% thì không có con cá nào
  var CHU = '"Be Vietnam Pro", Inter, system-ui, sans-serif';

  var cv, ctx, khung, man, rongNhin = 960, tiLe = 1, anh = {}, raf = 0, truoc = 0, du = 0;
  var L = null, trangThai = "chon", nhiet = 1;
  var tienDo = docTienDo();

  function docTienDo() { try { var x = JSON.parse(localStorage.getItem(KHOA)); if (x && x.sao) return x; } catch (e) {} return {sao: {}}; }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function so(x) { var s = String(x); return EN ? s : s.replace(".", ","); }
  function phanTram(q) { return q >= 0.095 ? Math.round(q * 100) + "%" : so(Math.max(0.1, Math.round(q * 1000) / 10)) + "%"; }
  function ngauNhien(a, b) { return a + Math.random() * (b - a); }

  // Tỉ lệ sau nhiệt độ: q_i = p_i^(1/T) / tổng. Đây đúng là cách chatbot dùng "temperature".
  function chiaLai(ds, T) {
    var w = ds.map(function (c) { return Math.pow(c.p, 1 / T); }), s = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (x) { return x / s; });
  }
  function hoTrai() { return 190; }
  function hoPhai() { return rongNhin - 24; }

  // ---------- Dựng màn, thả cá ----------
  function dungMan(i) {
    var m = D.man[i];
    L = {i: i, m: m, buoc: m.buoc.map(function (b) { return {b: b, chon: -1}; }), s: 0, tim: 3, diem: 0, rac: 0, tg: 0,
      ca: [], cau: null, bao: null, hat: [], cho: 0, xong: false};
    thaCa(true);
  }
  // Số cá của mỗi chữ = làm tròn SO_CA × tỉ lệ (ít nhất 1 con nếu tỉ lệ từ 3% trở lên).
  function soCa(q) { return q < MO ? 0 : Math.max(1, Math.round(SO_CA * q)); }
  function thaCa(ngay) {
    var st = L.buoc[L.s], q = chiaLai(st.b.chu, nhiet), nhanh = (nhiet > 1.2 ? 1.7 : 1) * (L.m.toc || 1);
    L.ca.forEach(function (c) { if (c.pha !== "dinh") { c.pha = "ra"; c.vx = (c.vx < 0 ? -1 : 1) * 260; } });
    st.b.chu.forEach(function (c, k) {
      ctx.font = "700 15px " + CHU;
      var w = Math.max(56, ctx.measureText(c.chu).width + 40);
      for (var n = soCa(q[k]); n > 0; n--) {
        var trai = Math.random() < 0.5, vx = ngauNhien(38, 72) * nhanh * (trai ? 1 : -1);
        var x = ngauNhien(hoTrai() + w / 2, hoPhai() - w / 2);
        L.ca.push({c: c, k: k, w: w, h: 30, x: ngay ? x : (trai ? hoTrai() - w : hoPhai() + w), dich: x, y: ngauNhien(NUOC + 40, DAY - 24),
          vx: ngay ? vx : (trai ? 1 : -1) * 520, v0: vx, pha: ngay ? "boi" : "vao", pha0: Math.random() * 6.3, a: ngay ? 1 : 0});
      }
    });
    L.q = q;
  }

  // ---------- Cập nhật ----------
  function capNhat(dt) {
    L.tg += dt;
    var loan = nhiet > 1.2;
    L.ca.forEach(function (c) {
      if (c.pha === "dinh") return;
      if (c.pha === "vao") { c.a = Math.min(1, c.a + dt * 2); if ((c.vx > 0 && c.x >= c.dich) || (c.vx < 0 && c.x <= c.dich)) { c.pha = "boi"; c.vx = c.v0; } }
      if (c.pha === "ra") c.a = Math.max(0, c.a - dt * 1.2);
      c.x += c.vx * dt;
      if (c.pha === "boi") {
        if (c.x - c.w / 2 < hoTrai()) { c.x = hoTrai() + c.w / 2; c.vx = Math.abs(c.vx); }
        if (c.x + c.w / 2 > hoPhai()) { c.x = hoPhai() - c.w / 2; c.vx = -Math.abs(c.vx); }
        if (loan && Math.random() < dt * 0.8) c.vx = -c.vx; // nước bị khuấy: cá đổi hướng bất chợt
      }
      c.yv = c.y + Math.sin(L.tg * (loan ? 4 : 2) + c.pha0) * (loan ? 9 : 4);
    });
    L.ca = L.ca.filter(function (c) { return c.pha !== "ra" || c.a > 0; });
    var cau = L.cau;
    if (cau) {
      if (cau.pha === "tha") {
        cau.y = Math.min(cau.dich, cau.y + 560 * dt);
        trungCa(cau);
        if (!cau.ca && cau.y >= cau.dich) { cau.pha = "cho"; cau.t = 0.35; }
      } else if (cau.pha === "cho") {
        cau.t -= dt; trungCa(cau);
        if (!cau.ca && cau.t <= 0) cau.pha = "keo";
      } else if (cau.pha === "keo") {
        var dx = canX() - cau.x, dy = canY() - cau.y, d = Math.hypot(dx, dy), v = 640 * dt;
        if (d <= v) { cau.x = canX(); cau.y = canY(); veBo(cau); }
        else { cau.x += dx / d * v; cau.y += dy / d * v; }
        if (cau.ca) { cau.ca.x = cau.x; cau.ca.yv = cau.ca.y = cau.y + 18; }
      }
    }
    if (L.cho > 0) { L.cho -= dt; if (L.cho <= 0) thaCa(false); }
    L.hat.forEach(function (h) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 900 * dt; h.song -= dt; });
    L.hat = L.hat.filter(function (h) { return h.song > 0; });
    if (L.bao) { L.bao.t -= dt; if (L.bao.t <= 0) L.bao = null; }
  }
  function canX() { return 168; }
  function canY() { return 96; }
  function trungCa(cau) {
    if (cau.ca) return;
    for (var i = 0; i < L.ca.length; i++) {
      var c = L.ca[i];
      if (c.pha !== "boi" && c.pha !== "vao") continue;
      if (Math.abs(cau.x - c.x) < c.w / 2 + 4 && Math.abs(cau.y - c.yv) < c.h / 2 + 6) {
        cau.ca = c; c.pha = "dinh"; cau.pha = "keo";
        no(cau.x, cau.y, "#E0F2FE", 8);
        return;
      }
    }
  }
  // Kéo cần lên bờ: chữ vào câu, hoặc cá rác thì câu văn bị ảo giác.
  function veBo(cau) {
    var c = cau.ca; L.cau = null;
    if (!c) return;
    L.ca.splice(L.ca.indexOf(c), 1);
    if (c.c.bia) {
      L.tim--; L.rac++;
      no(canX(), canY(), "#A78BFA", 18);
      do_("duong-doan-chu-rac", {man: String(L.i + 1)});
      if (L.tim <= 0) { thua(); return; }
      L.bao = {chu: N.aoGiac, t: 2.4, mau: "#C4B5FD"};
      return;
    }
    var st = L.buoc[L.s], top = c.k === 0, diem = top ? 100 : 100 + Math.round((1 - c.c.p) * 200);
    st.chon = c.k; L.diem += diem;
    L.bao = {chu: (top ? N.phoBien : N.sangTao) + " +" + diem, t: 1.6, mau: top ? "#BFDBFE" : "#FDE68A"};
    no(canX(), canY(), top ? "#60A5FA" : "#FACC15", 14);
    L.s++;
    if (L.s >= L.buoc.length) { L.xong = true; setTimeout(thang, 700); L.ca.forEach(function (x) { x.pha = "ra"; }); return; }
    L.cho = 0.5;
    L.ca.forEach(function (x) { x.pha = "ra"; x.vx = (x.vx < 0 ? -1 : 1) * 260; });
  }
  function no(x, y, mau, n) { for (var k = 0; k < n; k++) L.hat.push({x: x, y: y, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 300 - 60, song: 0.6 + Math.random() * 0.3, mau: mau}); }

  function thaCau(x, y) {
    if (trangThai !== "choi" || L.cau || L.xong || L.cho > 0) return;
    x = Math.max(hoTrai() + 6, Math.min(hoPhai() - 6, x));
    y = Math.max(NUOC + 24, Math.min(DAY, y));
    L.cau = {x: x, y: NUOC, dich: y, pha: "tha", ca: null};
  }

  // ---------- Vẽ ----------
  function hinhTron(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ve() {
    if (!ctx) return;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    var g = ctx.createLinearGradient(0, 0, 0, NUOC);
    g.addColorStop(0, "#7DD3FC"); g.addColorStop(1, "#E0F2FE");
    ctx.fillStyle = g; ctx.fillRect(0, 0, rongNhin, NUOC);
    veMay();
    var nuoc = ctx.createLinearGradient(0, NUOC, 0, CAO);
    nuoc.addColorStop(0, nhiet > 1.2 ? "#0EA5E9" : "#38BDF8"); nuoc.addColorStop(1, nhiet > 1.2 ? "#1E1B4B" : "#0C4A6E");
    ctx.fillStyle = nuoc; ctx.fillRect(0, NUOC, rongNhin, CAO - NUOC);
    // sóng mặt nước, mạnh hơn khi khuấy hồ
    var bien = nhiet > 1.2 ? 7 : nhiet < 0.8 ? 1.5 : 3.5, t = L ? L.tg : 0;
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 3; ctx.beginPath();
    for (var x = 0; x <= rongNhin; x += 12) { var y = NUOC + Math.sin(x / 40 + t * 2) * bien; if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    veBen();
    if (!L) return;
    L.ca.forEach(veCa);
    veDayCau();
    L.hat.forEach(function (p) { ctx.globalAlpha = Math.max(0, Math.min(1, p.song * 2)); ctx.fillStyle = p.mau; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); });
    ctx.globalAlpha = 1;
    veHud();
  }
  function veMay() {
    ctx.fillStyle = "rgba(255,255,255,.8)";
    var t = L ? L.tg : 0;
    for (var k = 0; k < 5; k++) {
      var x = ((k * 280 + t * 8) % (rongNhin + 200)) - 100, y = 46 + (k % 2) * 30;
      ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.arc(x + 22, y - 8, 22, 0, 7); ctx.arc(x + 46, y, 17, 0, 7); ctx.fill();
    }
  }
  function veBen() {
    ctx.fillStyle = "#92400E"; ctx.fillRect(0, NUOC - 34, 150, 22);
    ctx.fillStyle = "#78350F"; for (var x = 14; x < 150; x += 44) ctx.fillRect(x, NUOC - 12, 10, 60);
    var im = anh.dung, cao = 86, rong = im && im.naturalWidth ? cao * im.naturalWidth / im.naturalHeight : 56;
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, 66 - rong / 2, NUOC - 34 - cao + 4, rong, cao);
    ctx.strokeStyle = "#78350F"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(82, NUOC - 76); ctx.lineTo(canX(), canY()); ctx.stroke();
  }
  function veDayCau() {
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.5;
    var cau = L.cau, x = cau ? cau.x : canX() + 26, y = cau ? cau.y : NUOC + 30;
    ctx.beginPath(); ctx.moveTo(canX(), canY());
    if (cau && cau.pha === "keo") ctx.lineTo(x, y); else { ctx.lineTo(x, NUOC); ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = "#E2E8F0"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x - 4, y + 2, 5, 0, Math.PI); ctx.stroke();
    if (!cau) { ctx.fillStyle = "#EF4444"; ctx.beginPath(); ctx.arc(x, NUOC - 2, 5, 0, 7); ctx.fill(); }
  }
  var MAU = ["#2563EB", "#0EA5E9", "#64748B"];
  function veCa(c) {
    ctx.globalAlpha = c.a;
    var x = c.x, y = c.yv == null ? c.y : c.yv, w = c.w, h = c.h, huong = c.vx < 0 ? -1 : 1;
    var lo = c.c.bia && !L.m.giau; // màn "giau": cá rác trông y như cá thường, như AI bịa nghe rất thật
    var than = lo ? "#4C1D95" : MAU[Math.min(2, c.k)];
    ctx.save(); ctx.translate(x, y); if (c.pha === "dinh") ctx.rotate(-huong * 0.9);
    ctx.fillStyle = than;
    ctx.beginPath(); ctx.moveTo(-huong * w / 2, 0); ctx.lineTo(-huong * (w / 2 + 14), -11); ctx.lineTo(-huong * (w / 2 + 14), 11); ctx.closePath(); ctx.fill();
    hinhTron(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(huong * (w / 2 - 9), -4, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = lo ? "#FCA5A5" : "#fff"; ctx.font = "700 15px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(lo ? c.c.chu + "?" : c.c.chu, -huong * 4, 1);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // Câu đang viết: phần gốc, chữ đã câu được, dấu … cho chữ tiếp theo.
  function manhCau() {
    var ds = [{chu: L.m.dau, loai: "goc"}];
    for (var s = 0; s < L.buoc.length; s++) {
      var st = L.buoc[s];
      if (st.b.truoc) {
        var d = /^([,.!?])\s*(.*)$/.exec(st.b.truoc); // tách dấu câu để nó dính vào chữ trước
        if (d) { ds.push({chu: d[1], loai: "goc"}); if (d[2]) ds.push({chu: d[2], loai: "goc"}); }
        else ds.push({chu: st.b.truoc, loai: "goc"});
      }
      if (st.chon >= 0) ds.push({chu: st.b.chu[st.chon].chu, loai: st.chon === 0 ? "chon" : "la"});
      else { ds.push({chu: "…", loai: "cho"}); return ds; }
    }
    ds.push({chu: L.m.cuoi, loai: "goc"});
    return ds;
  }
  function veHud() {
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    hinhTron(rongNhin - 380, 12, 186, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    var tim = ""; for (var k = 0; k < 3; k++) tim += k < L.tim ? "♥" : "♡";
    ctx.font = "800 24px " + CHU; ctx.fillStyle = "#FB7185"; ctx.fillText(tim, rongNhin - 368, 35);
    ctx.font = "800 20px " + CHU; ctx.fillStyle = "#fff"; ctx.fillText(String(L.diem), rongNhin - 272, 35);
    // nhiệt độ
    var nx = rongNhin - 186;
    hinhTron(nx, 12, 96, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    ctx.font = "700 13px " + CHU; ctx.fillStyle = "#fff"; ctx.fillText("🌡", nx + 10, 27);
    ctx.textAlign = "right"; ctx.fillStyle = "#FDE68A"; ctx.font = "800 15px " + CHU; ctx.fillText(so(nhiet.toFixed(1)), nx + 86, 27);
    hinhTron(nx + 10, 40, 76, 7, 3.5); ctx.fillStyle = "#334155"; ctx.fill();
    var vt = NHIET.indexOf(nhiet) / (NHIET.length - 1);
    hinhTron(nx + 10, 40, 10 + 66 * vt, 7, 3.5); ctx.fillStyle = nhiet > 1.2 ? "#F97316" : "#FACC15"; ctx.fill();
    // câu
    var ds = manhCau(), co = 22, rongToiDa = rongNhin - 40;
    function rong() {
      ctx.font = "700 " + co + "px " + CHU;
      return ds.reduce(function (n, m) { return n + ctx.measureText(m.chu).width + co * 0.32 + (m.loai === "la" || m.loai === "chon" ? 12 : 0); }, 0);
    }
    var tong = rong();
    while (tong > rongToiDa && co > 16) { co -= 1; tong = rong(); }
    // câu dài quá thì chỉ giữ phần cuối (chữ đang đoán), phần đầu thay bằng …
    while (tong > rongToiDa && ds.length > 2) { ds.splice(0, ds[0].loai === "bo" ? 2 : 1, {chu: "…", loai: "bo"}); tong = rong(); }
    var y = 92, x = Math.max(20, Math.min((rongNhin - tong) / 2, rongNhin - tong - 20));
    x = Math.max(x, 196);
    if (x + tong > rongNhin - 16) x = (rongNhin - tong) / 2;
    hinhTron(x - 14, y - co * 0.95, tong + 22, co * 1.9, 14); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
    var hopTruoc = false;
    ds.forEach(function (m) {
      var w = ctx.measureText(m.chu).width, hop = m.loai === "la" || m.loai === "chon";
      if (/^[,.!?]/.test(m.chu)) x -= co * 0.32 + (hopTruoc ? 4 : 0) - 1; // dấu câu dính vào chữ trước
      hopTruoc = hop;
      if (hop) { hinhTron(x - 4, y - co * 0.7, w + 8, co * 1.4, 6); ctx.fillStyle = m.loai === "la" ? "#FEF08A" : "#DBEAFE"; ctx.fill(); x += 6; }
      ctx.textAlign = "left";
      ctx.fillStyle = m.loai === "goc" || m.loai === "bo" ? "#334155" : m.loai === "cho" ? "#94A3B8" : m.loai === "la" ? "#854D0E" : "#1D4ED8";
      ctx.fillText(m.chu, x, y + 1);
      x += w + co * 0.32 + (hop ? 6 : 0);
    });
    // gợi ý ở lượt đầu
    if (L.s === 0 && !L.cau && L.tg < 6 && !L.bao) {
      ctx.font = "700 17px " + CHU; ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fillText(N.goiY, (hoTrai() + hoPhai()) / 2, NUOC + 26);
    }
    if (L.bao) {
      var cb = 22, cx = (hoTrai() + hoPhai()) / 2, bw;
      do { ctx.font = "800 " + cb + "px " + CHU; bw = ctx.measureText(L.bao.chu).width; } while (bw > rongNhin - 60 && --cb > 14);
      ctx.textAlign = "center";
      if (cx + bw / 2 + 16 > rongNhin - 8 || cx - bw / 2 - 16 < 8) cx = rongNhin / 2;
      ctx.globalAlpha = Math.min(1, L.bao.t * 3);
      hinhTron(cx - bw / 2 - 16, 134, bw + 32, 40, 20); ctx.fillStyle = "rgba(15,23,42,.8)"; ctx.fill();
      ctx.fillStyle = L.bao.mau || "#FDE68A"; ctx.fillText(L.bao.chu, cx, 155);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- Vòng lặp, cỡ màn hình ----------
  function vong(t) {
    raf = requestAnimationFrame(vong);
    var dt = Math.min(0.05, Math.max(0, (t - truoc) / 1000)); truoc = t;
    if (trangThai === "choi" && !document.hidden) {
      du += dt;
      while (du >= BUOC && trangThai === "choi") { capNhat(BUOC); du -= BUOC; }
    }
    ve();
  }
  function chayVong() { if (!raf) { truoc = performance.now(); du = 0; raf = requestAnimationFrame(vong); } }
  function dungVong() { if (raf) cancelAnimationFrame(raf); raf = 0; ve(); }
  function coGian() {
    var r = {width: cv.clientWidth, height: cv.clientHeight}, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width || !r.height) return;
    var cu = rongNhin;
    rongNhin = CAO * r.width / r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    tiLe = cv.width / rongNhin;
    if (L && cu !== rongNhin) L.ca.forEach(function (c) { c.x = hoTrai() + (c.x - hoTrai()) * (hoPhai() - hoTrai()) / (cu - 24 - hoTrai()); });
    ve();
  }

  // ---------- Toàn màn hình nằm ngang trên điện thoại (cùng cách với phieu-luu.js, dùng chung CSS .pl.is-toan) ----------
  var DT = window.matchMedia ? window.matchMedia("(pointer: coarse), (max-width: 700px)") : {matches: false};
  var daThoat = false;
  function toanMan(bat) {
    var pl = $("#ddc"), nut = $("#ddc-toan");
    pl.classList.toggle("is-toan", bat);
    document.documentElement.classList.toggle("pl-mo-toan", bat);
    nut.textContent = bat ? "✕" : "⛶";
    nut.setAttribute("aria-label", bat ? N.toanRa : N.toanVao); nut.title = nut.getAttribute("aria-label");
    nut.setAttribute("aria-pressed", bat ? "true" : "false");
    try {
      if (bat && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen({navigationUI: "hide"}).then(function () {
        if (screen.orientation && screen.orientation.lock) return screen.orientation.lock("landscape");
      }).catch(function () {});
      if (!bat && screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      if (!bat && document.fullscreenElement) document.exitFullscreen().catch(function () {});
    } catch (x) {}
    if (bat) meoIphone();
    requestAnimationFrame(coGian);
  }
  // Safari trên iPhone không ẩn được thanh địa chỉ: chỉ có cách "Thêm vào MH chính" (trang có manifest riêng, display: fullscreen).
  function meoIphone() {
    var ios = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var rieng = navigator.standalone || (window.matchMedia && matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches);
    if (!ios || rieng || $("#ddc-meo")) return;
    var lan = 0; try { lan = +localStorage.getItem(KHOA + "-meo") || 0; } catch (e) {}
    if (lan >= 2) return;
    try { localStorage.setItem(KHOA + "-meo", String(lan + 1)); } catch (e) {}
    var m = el("div", "pl-meo"); m.id = "ddc-meo"; m.setAttribute("role", "status");
    m.appendChild(el("p", null, N.meoIos));
    var x = el("button", null, "✕"); x.type = "button"; x.setAttribute("aria-label", N.dong);
    function bo() { if (m.parentNode) m.parentNode.removeChild(m); }
    x.addEventListener("click", function () { bo(); try { localStorage.setItem(KHOA + "-meo", "9"); } catch (e) {} });
    m.appendChild(x); $("#ddc").appendChild(m);
    setTimeout(bo, 9000);
  }

  // ---------- Màn mở đầu, kết quả ----------
  function hienMan(noiDung) {
    man.innerHTML = ""; man.appendChild(noiDung); man.hidden = false;
    $("#ddc").classList.add("is-man");
    var n = $("button, a", man); if (n) n.focus({preventScroll: true});
  }
  function oNho(bieu, dau, chu) {
    var o = el("div", "ddc-o"); o.appendChild(el("span", "ddc-o-hinh", bieu));
    var t = el("div"); t.appendChild(el("b", null, dau)); t.appendChild(el("p", null, chu)); o.appendChild(t);
    return o;
  }
  function moKhoa(i) { return i === 0 || !!tienDo.sao[D.man[i - 1].id]; }
  function manDau(i) {
    trangThai = "chon"; dungVong();
    if (i == null) { i = 0; while (i < D.man.length - 1 && tienDo.sao[D.man[i].id] && moKhoa(i + 1)) i++; }
    var m = D.man[i], w = el("div", "ddc-dau");
    w.appendChild(el("p", "ddc-nho", N.manSo(i + 1) + " · " + m.ten));
    w.appendChild(el("h2", null, m.dau + " …"));
    // Chữ Con: đàn token xếp hàng thành câu, mỗi con cá câu lên là một Chữ Con nối vào câu
    var cc = el("div", "nv ddc-cc"), ccA = el("img");
    ccA.src = D.p + "assets/nhan-vat/chu-con.svg"; ccA.alt = ""; ccA.width = 44; ccA.height = 53;
    cc.appendChild(ccA);
    var ccL = el("p", "nv-loi"); ccL.appendChild(el("b", null, N.ccTen + ": ")); ccL.appendChild(document.createTextNode(N.ccNoi)); cc.appendChild(ccL);
    w.appendChild(cc);
    if (i === 0) {
      var ba = el("div", "ddc-ba");
      ba.appendChild(oNho("🐟", N.y1, N.y1c)); ba.appendChild(oNho("🌡", N.y2, N.y2c)); ba.appendChild(oNho("🦴", N.y3, N.y3c));
      w.appendChild(ba);
    } else if (m.meo) w.appendChild(el("p", "ddc-meo-man", m.meo));
    var s = tienDo.sao[m.id];
    if (s) w.appendChild(el("p", "ddc-sao-cu", "★★★".slice(0, s) + "☆☆☆".slice(s) + " " + N.daChoi));
    var hang = el("div", "ddc-hang");
    var b = el("button", "btn btn-yt", N.batDau); b.type = "button"; b.addEventListener("click", function () { batDauMan(i); });
    hang.appendChild(b);
    // Chọn màn: màn sau mở khi đã thắng màn trước
    var ds = el("div", "ddc-chon-man"); ds.setAttribute("role", "group"); ds.setAttribute("aria-label", N.chonMan);
    D.man.forEach(function (mm, k) {
      var sao = tienDo.sao[mm.id] || 0, mo = moKhoa(k);
      var n = el("button", "ddc-so-man" + (k === i ? " is-dang" : ""), String(k + 1)); n.type = "button";
      n.appendChild(el("small", null, mo ? "★★★".slice(0, sao) + "☆☆☆".slice(sao) : "🔒"));
      n.setAttribute("aria-label", N.manSo(k + 1) + " · " + mm.ten + (mo ? "" : " · " + N.khoa));
      if (k === i) n.setAttribute("aria-current", "true");
      if (!mo) { n.disabled = true; n.title = N.khoa; }
      else n.addEventListener("click", function () { manDau(k); });
      ds.appendChild(n);
    });
    hang.appendChild(ds);
    w.appendChild(hang);
    hienMan(w);
  }
  function batDauMan(i) {
    dungMan(i);
    man.hidden = true; $("#ddc").classList.remove("is-man");
    trangThai = "choi";
    if (DT.matches && !daThoat && !$("#ddc").classList.contains("is-toan")) toanMan(true);
    L.bao = L.m.meo && i > 0 ? {chu: L.m.meo, t: 4, mau: "#FDE68A"} : {chu: N.manSo(i + 1) + " · " + L.m.ten, t: 1.8};
    do_("duong-doan-chu-bat-dau", {man: String(i + 1), nhiet: String(nhiet)});
    var r = khung.getBoundingClientRect();
    if (!$("#ddc").classList.contains("is-toan") && (r.top < 0 || r.bottom > window.innerHeight)) $("#ddc").scrollIntoView({block: "start", behavior: "smooth"});
    cv.focus({preventScroll: true});
    chayVong();
  }
  function cauCuaBan(kq) {
    var p = el("p", "ddc-cau"), dung = false;
    function goc(chu) {
      var d = /^([,.!?])\s*(.*)$/.exec(chu); // dấu câu dính vào chữ trước, phần sau thành mảnh riêng
      if (d) { p.appendChild(el("span", "ddc-goc is-dau", d[1])); if (d[2]) p.appendChild(el("span", "ddc-goc", d[2])); }
      else p.appendChild(el("span", "ddc-goc", chu));
    }
    goc(L.m.dau);
    L.buoc.forEach(function (st) {
      if (dung) return;
      if (st.b.truoc) goc(st.b.truoc);
      if (st.chon < 0) { goc("…"); dung = true; return; }
      var c = st.b.chu[st.chon], chip = el("span", "ddc-chip" + (st.chon === 0 ? " is-pho" : " is-la"));
      chip.appendChild(el("b", null, c.chu)); chip.appendChild(el("small", null, phanTram(c.p)));
      p.appendChild(chip);
    });
    if (kq) goc(L.m.cuoi);
    return p;
  }
  function cauChatbot() {
    var p = el("p", "ddc-cau ddc-cau-may"), chu = [L.m.dau];
    L.buoc.forEach(function (st) { if (st.b.truoc) chu.push(st.b.truoc); chu.push(st.b.chu[0].chu); });
    p.textContent = chu.join(" ").replace(/ ([,.!?])/g, "$1") + L.m.cuoi;
    return p;
  }
  function thang() {
    trangThai = "xong"; dungVong();
    var la = L.buoc.filter(function (st) { return st.chon > 0; }).length;
    var sao = 1 + (L.rac === 0 ? 1 : 0) + (la >= 2 ? 1 : 0);
    if (!tienDo.sao[L.m.id] || tienDo.sao[L.m.id] < sao) { tienDo.sao[L.m.id] = sao; luu(); }
    do_("duong-doan-chu-xong", {man: String(L.i + 1), sao: String(sao), la: String(la)});
    do_("hoc-xong", {loai: "duong-doan-chu"});
    var w = el("div", "pl-kq ddc-kq ddc-kq-thang"), a = el("div", "ddc-kq-trai"), b = el("div", "ddc-kq-phai");
    w.appendChild(a); w.appendChild(b);
    a.appendChild(el("p", "pl-kq-sao", "★★★".slice(0, sao) + "☆☆☆".slice(sao)));
    a.appendChild(el("h3", null, N.qua));
    var ds = el("ul", "ddc-sao-ds");
    [[true, N.s1], [L.rac === 0, N.s2], [la >= 2, N.s3(la)]].forEach(function (x) { ds.appendChild(el("li", x[0] ? "is-co" : null, (x[0] ? "★ " : "☆ ") + x[1])); });
    a.appendChild(ds);
    b.appendChild(el("p", "ddc-nho", N.cauBan)); b.appendChild(cauCuaBan(true));
    b.appendChild(el("p", "ddc-nho", N.cauMay)); b.appendChild(cauChatbot());
    var bit = el("div", "pl-phan-hoi ddc-bit"), im = el("img"); im.src = D.p + "assets/bit-vui.svg"; im.alt = ""; im.width = 48; im.height = 48;
    bit.appendChild(im); var tx = el("div"); tx.appendChild(el("b", null, N.bitDau)); tx.appendChild(el("p", null, N.bitChu)); bit.appendChild(tx);
    b.appendChild(bit);
    if (L.i === D.man.length - 1) a.appendChild(el("p", "ddc-het", N.hetMan(D.man.length)));
    a.appendChild(nutCuoi(true));
    hienMan(w);
  }
  function thua() {
    trangThai = "xong"; dungVong();
    var w = el("div", "pl-kq ddc-kq");
    w.appendChild(el("h3", null, N.thua));
    w.appendChild(el("p", null, N.thuaChu));
    w.appendChild(cauCuaBan(false));
    w.appendChild(nutCuoi());
    hienMan(w);
  }
  function nutCuoi(thangMan) {
    var h = el("div", "pl-kq-nut");
    if (thangMan && L.i < D.man.length - 1) {
      var t = el("button", "btn btn-yt", N.manTiep); t.type = "button"; t.addEventListener("click", function () { manDau(L.i + 1); }); h.appendChild(t);
    }
    var l = el("button", "btn" + (thangMan && L.i < D.man.length - 1 ? "" : " btn-yt"), N.lai); l.type = "button"; l.addEventListener("click", function () { batDauMan(L.i); }); h.appendChild(l);
    var v = el("a", "btn", N.xemVideo); v.href = D.video; h.appendChild(v);
    var b = el("a", "btn", N.phongNao); b.href = D.p + "phong-thi-nghiem-bo-nao.html?tram=doan-chu"; h.appendChild(b);
    return h;
  }

  // ---------- Điều khiển ----------
  function doiNhiet() {
    nhiet = NHIET[(NHIET.indexOf(nhiet) + 1) % NHIET.length];
    $("#ddc-nhiet").textContent = "🌡 " + so(nhiet.toFixed(1));
    if (L && trangThai === "choi" && !L.xong && L.cho <= 0) {
      thaCa(false);
      L.bao = {chu: nhiet < 0.8 ? N.nhietThap : nhiet > 1.2 ? N.nhietCao : N.nhietVua, t: 2.4, mau: nhiet > 1.2 ? "#FDBA74" : "#BFDBFE"};
    }
    if (trangThai !== "choi") ve();
  }
  function batDieuKhien() {
    cv.addEventListener("pointerdown", function (e) {
      if (trangThai !== "choi") return;
      e.preventDefault();
      var r = cv.getBoundingClientRect();
      // khung có thể bị CSS xoay 90° trên iPhone dọc: đổi tọa độ chạm theo chiều chưa xoay
      var ngang = r.width >= r.height === cv.clientWidth >= cv.clientHeight;
      var x, y;
      if (ngang) { x = (e.clientX - r.left) / r.width; y = (e.clientY - r.top) / r.height; }
      else { x = (e.clientY - r.top) / r.height; y = 1 - (e.clientX - r.left) / r.width; }
      thaCau(x * rongNhin, y * CAO);
    });
    $("#ddc-nhiet").addEventListener("click", function (e) { e.preventDefault(); doiNhiet(); });
    document.addEventListener("keydown", function (e) {
      if (trangThai !== "choi") return;
      var tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
      if (e.code === "KeyT") { e.preventDefault(); doiNhiet(); }
      if (e.code === "Space" && tg !== "BUTTON" && tg !== "A") { e.preventDefault(); thaCau((hoTrai() + hoPhai()) / 2 + ngauNhien(-120, 120), ngauNhien(NUOC + 60, DAY)); }
    });
  }

  function batDau() {
    cv = $("#ddc-canvas"); man = $("#ddc-man"); khung = $("#ddc-khung");
    if (!cv || !cv.getContext) return;
    ctx = cv.getContext("2d");
    D.man.forEach(function (m) { m.buoc.forEach(function (b) { b.chu.sort(function (x, y) { return y.p - x.p; }); }); });
    var im = new Image(); im.src = D.p + "assets/mascot/mark-trinh-bay-tinh.webp"; im.onload = function () { ve(); }; anh.dung = im;
    coGian();
    window.addEventListener("resize", coGian);
    batDieuKhien();
    toanMan(false);
    $("#ddc-toan").addEventListener("click", function () {
      var bat = !$("#ddc").classList.contains("is-toan");
      daThoat = !bat; toanMan(bat); cv.focus({preventScroll: true});
    });
    $("#ddc-nhiet").textContent = "🌡 " + so(nhiet.toFixed(1));
    manDau();
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__ddc = {L: function () { return L; }, batDauMan: batDauMan, thaCau: thaCau, doiNhiet: doiNhiet, nhiet: function () { return nhiet; }, trangThai: function () { return trangThai; }, rong: function () { return rongNhin; }};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

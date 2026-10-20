// Game "Đường đoán chữ" (duong-doan-chu.html + en/duong-doan-chu.html): game đi cảnh, mỗi bước là một vực "Ảo giác"
// có vài bục chữ. Mark nhảy lên bục để chọn chữ tiếp theo của câu, đúng như chatbot đoán chữ (video 7):
// bục càng rộng thì chữ đó càng hay đứng sau. Nút nhiệt độ đổi độ rộng các bục theo p^(1/T): nhiệt độ thấp thì bục
// phổ biến phình to, bục hiếm mờ đi (không đứng được); nhiệt độ cao thì các bục gần bằng nhau, rung lắc, và bục chữ vô
// nghĩa ("bia") hiện ra, đứng lên là vỡ, rơi xuống Ảo giác (video 8). Bài học nằm trong luật chơi, không có câu hỏi chữ.
// Dữ liệu màn chơi: data/duong-doan-chu.json (trang nhúng sẵn ở #ddc-du-lieu). Khung toàn màn hình nằm ngang, nút bấm
// nổi trên game và mẹo "Thêm vào MH chính" theo cách của phieu-luu.js. Tiến độ ở localStorage "mhai-duong-doan-chu".
(function () {
  "use strict";
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var goc = $("#ddc-du-lieu");
  if (!goc) return;
  var D = JSON.parse(goc.textContent), N = D.nhan, EN = document.documentElement.lang === "en";
  ["manSo", "s3"].forEach(function (k) { var mau = N[k]; N[k] = function (n) { return mau.replace("{n}", n); }; });
  var KHOA = "mhai-duong-doan-chu";
  var O = 45, CAO = 12 * O, MAT = 10 * O, BUOC = 1 / 120;
  var TRONG_LUC = 2300, NHAY = -960, CHAY = 290, TANG = 1900;
  var VUC = 400, DAT = 330, TANG_CAO = [70, 130, 190, 245], PHAI = [190, 260, 330, 390]; // bậc k: cao bao nhiêu, mép phải cách mép vực
  var NHIET = [0.5, 1, 1.8], MO = 0.03; // bục có tỉ lệ (sau nhiệt độ) dưới 3% thì mờ, không đứng được
  var CHU = '"Be Vietnam Pro", Inter, system-ui, sans-serif';

  var cv, ctx, khung, man, rongNhin = 960, tiLe = 1, anh = {}, raf = 0, truoc = 0, du = 0;
  var phim = {trai: false, phai: false, nhay: false}, demNhay = 0;
  var L = null, M = null, trangThai = "chon", nhiet = 1;
  var tienDo = docTienDo();

  function docTienDo() { try { var x = JSON.parse(localStorage.getItem(KHOA)); if (x && x.sao) return x; } catch (e) {} return {sao: {}}; }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function so(x) { var s = String(x); return EN ? s : s.replace(".", ","); }
  function phanTram(q) { return q >= 0.095 ? Math.round(q * 100) + "%" : so(Math.max(0.1, Math.round(q * 1000) / 10)) + "%"; }

  // Tỉ lệ sau nhiệt độ: q_i = p_i^(1/T) / tổng. Đây đúng là cách chatbot dùng "temperature".
  function chiaLai(ds, T) {
    var w = ds.map(function (c) { return Math.pow(c.p, 1 / T); }), s = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (x) { return x / s; });
  }
  function rongBuc(q) { return 24 + 210 * q; }

  // ---------- Dựng màn ----------
  function dungMan(i) {
    var m = D.man[i], x = 360, dat = [[-200, x]], tram = [];
    m.buoc.forEach(function (b, s) {
      var x0 = x, q = chiaLai(b.chu, nhiet);
      var buc = b.chu.map(function (c, k) {
        return {c: c, k: k, s: s, cao: MAT - TANG_CAO[k], phai: x0 + PHAI[k], rong: rongBuc(q[k]), q: q[k], vo: 0, roi: 0, lech: 0, an: 0};
      });
      tram.push({x0: x0, x1: x0 + VUC, b: b, buc: buc, chon: -1, dang: -1, xong: false});
      x = x0 + VUC; dat.push([x, x + DAT]); x += DAT;
    });
    dat[dat.length - 1][1] = x + 260;
    L = {i: i, m: m, dat: dat, tram: tram, dich: x + 120, W: x + 260, tim: 3, diem: 0, cp: 120, tg: 0, bao: null, hat: [], nga: 0, xong: false};
    M = {x: 120, y: MAT - 56, w: 30, h: 56, vx: 0, vy: 0, dat: true, tren: null, huong: 1, coyote: 0, buoc: 0, khien: 0};
    tinhBuc(true);
  }
  // Nhiệt độ đổi thì bục đổi cỡ (mượt dần trong capNhat), mờ hay rắn theo tỉ lệ mới.
  function tinhBuc(ngay) {
    L.tram.forEach(function (st) {
      var q = chiaLai(st.b.chu, nhiet);
      st.buc.forEach(function (bc, k) { bc.q = q[k]; bc.dich = rongBuc(q[k]); if (ngay) bc.rong = bc.dich; });
    });
  }
  function ran(bc) { return !bc.roi && bc.q >= MO; }
  function trai(bc) { return bc.phai - bc.rong + bc.lech; }

  // ---------- Vật lý ----------
  function capNhat(dt) {
    L.tg += dt;
    var rung = nhiet > 1.2 ? (nhiet - 1) * 16 : 0;
    L.tram.forEach(function (st) {
      st.buc.forEach(function (bc) {
        bc.rong += (bc.dich - bc.rong) * Math.min(1, dt * 8);
        var cu = bc.lech;
        bc.lech = rung ? Math.sin(L.tg * (2.4 + bc.k * 0.7) + bc.k * 1.9) * rung : bc.lech * 0.9;
        if (M.tren === bc) M.x += bc.lech - cu; // bục rung chở Mark đi theo
        if (bc.vo > 0) { bc.vo -= dt; if (bc.vo <= 0) { bc.roi = 1; vo(bc); if (M.tren === bc) { M.tren = null; M.dat = false; L.voBia = true; } } }
        if (bc.roi) bc.roi += dt;
        if (st.xong && bc.k !== st.chon) bc.an = Math.min(1, bc.an + dt * 2.5);
      });
    });
    if (M.khien > 0) M.khien -= dt;
    // chạy
    var huong = (phim.phai ? 1 : 0) - (phim.trai ? 1 : 0);
    if (huong) { M.vx += huong * TANG * dt; M.huong = huong; } else M.vx -= Math.sign(M.vx) * Math.min(Math.abs(M.vx), TANG * 1.3 * dt);
    M.vx = Math.max(-CHAY, Math.min(CHAY, M.vx));
    if (demNhay > 0) demNhay -= dt;
    if (M.dat) M.coyote = 0.1; else M.coyote -= dt;
    if (demNhay > 0 && M.coyote > 0) { M.vy = NHAY; M.dat = false; M.tren = null; M.coyote = 0; demNhay = 0; }
    if (!phim.nhay && M.vy < -380) M.vy = -380; // nhả nút sớm thì nhảy thấp
    M.vy = Math.min(1400, M.vy + TRONG_LUC * dt);
    // ngang: đụng vách đất
    M.x += M.vx * dt;
    M.x = Math.max(0, Math.min(L.W - M.w, M.x));
    L.dat.forEach(function (d) {
      if (M.y + M.h > MAT + 1 && M.x + M.w > d[0] && M.x < d[1]) { if (M.vx > 0 || M.x + M.w / 2 < d[0]) M.x = d[0] - M.w; else M.x = d[1]; M.vx = 0; }
    });
    // dọc
    var dayCu = M.y + M.h;
    M.y += M.vy * dt;
    var day = M.y + M.h, tren = null;
    M.dat = false;
    if (M.vy >= 0) {
      L.dat.forEach(function (d) { if (M.x + M.w > d[0] + 2 && M.x < d[1] - 2 && dayCu <= MAT + 1 && day >= MAT) { M.y = MAT - M.h; M.vy = 0; M.dat = true; tren = "dat"; } });
      if (!tren) L.tram.forEach(function (st) {
        st.buc.forEach(function (bc) {
          if (!ran(bc) || st.xong) return;
          var x0 = trai(bc), x1 = bc.phai + bc.lech;
          if (M.x + M.w > x0 + 4 && M.x < x1 - 4 && dayCu <= bc.cao + 2 && day >= bc.cao) { M.y = bc.cao - M.h; M.vy = 0; M.dat = true; tren = bc; }
        });
      });
    }
    var cuTren = M.tren;
    M.tren = tren && tren !== "dat" ? tren : null;
    if (M.tren && M.tren !== cuTren) dungLenBuc(M.tren);
    if (M.dat && Math.abs(M.vx) > 20) M.buoc += Math.abs(M.vx) * dt;
    // qua vực: chốt chữ khi đặt chân lên đất bên kia
    L.tram.forEach(function (st) {
      if (!st.xong && M.dat && tren === "dat" && M.x > st.x1 - 4) chot(st);
    });
    if (M.y > CAO + 60) roiVuc();
    if (!L.xong && M.x + M.w > L.dich) thang();
    L.hat.forEach(function (h) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 1400 * dt; h.song -= dt; });
    L.hat = L.hat.filter(function (h) { return h.song > 0; });
    if (L.bao) { L.bao.t -= dt; if (L.bao.t <= 0) L.bao = null; }
  }
  function dungLenBuc(bc) {
    var st = L.tram[bc.s];
    st.dang = bc.k;
    if (bc.c.bia && !bc.vo && !bc.roi) { bc.vo = 0.45; L.bao = {chu: N.lac, t: 1.2, mau: "#FCA5A5"}; }
  }
  function chot(st) {
    if (st.dang < 0) return;
    if (st.buc[st.dang].c.bia) { L.voBia = true; roiVuc(); return; } // nhảy vội khỏi bục vô nghĩa cũng không thoát: câu vẫn sập
    st.xong = true; st.chon = st.dang;
    var bc = st.buc[st.chon], diem = bc.k === 0 ? 100 : 100 + Math.round((1 - bc.c.p) * 200);
    L.diem += diem; L.cp = st.x1 + 40;
    L.bao = {chu: (bc.k === 0 ? N.phoBien : N.sangTao) + " +" + diem, t: 1.6, mau: bc.k === 0 ? "#BFDBFE" : "#FDE68A"};
    no(M.x + M.w / 2, M.y, bc.k === 0 ? "#60A5FA" : "#FACC15", 14);
  }
  function roiVuc() {
    var st = L.tram.filter(function (s) { return !s.xong; })[0];
    var bia = L.voBia; L.voBia = false;
    L.tim--; L.nga++;
    do_("duong-doan-chu-roi", {man: String(L.i + 1), bia: bia ? "co" : "khong"});
    if (L.tim <= 0) { thua(bia); return; }
    L.bao = {chu: bia ? N.aoGiacBia : N.aoGiac, t: 2.2, mau: "#C4B5FD"};
    if (st) { st.dang = -1; st.buc.forEach(function (bc) { if (bc.roi) { bc.roi = 0; bc.vo = 0; } }); }
    M.x = (st ? st.x0 : L.cp) - 80; M.y = MAT - M.h; M.vx = M.vy = 0; M.dat = true; M.tren = null; M.khien = 1;
  }
  function vo(bc) { no(trai(bc) + bc.rong / 2, bc.cao, "#F87171", 16); }
  function no(x, y, mau, n) { for (var k = 0; k < n; k++) L.hat.push({x: x, y: y, vx: (Math.random() - 0.5) * 360, vy: -Math.random() * 380 - 80, song: 0.6 + Math.random() * 0.3, mau: mau}); }

  // ---------- Vẽ ----------
  function hinhTron(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function camera() { return Math.max(0, Math.min(L ? L.W - rongNhin : 0, (M ? M.x : 0) - rongNhin * 0.38)); }
  function ve() {
    if (!ctx) return;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    var g = ctx.createLinearGradient(0, 0, 0, CAO);
    g.addColorStop(0, nhiet > 1.2 ? "#FDBA74" : nhiet < 0.8 ? "#93C5FD" : "#7DD3FC"); g.addColorStop(1, "#E0F2FE");
    ctx.fillStyle = g; ctx.fillRect(0, 0, rongNhin, CAO);
    if (!L) return;
    var cam = camera();
    veMay(cam);
    ctx.save(); ctx.translate(-cam, 0);
    L.tram.forEach(veVuc);
    L.dat.forEach(function (d) {
      ctx.fillStyle = "#16A34A"; ctx.fillRect(d[0], MAT, d[1] - d[0], 14);
      ctx.fillStyle = "#A16207"; ctx.fillRect(d[0], MAT + 14, d[1] - d[0], CAO - MAT);
      ctx.fillStyle = "rgba(0,0,0,.08)"; for (var x = d[0] + 20; x < d[1]; x += 60) ctx.fillRect(x, MAT + 40, 26, 10);
    });
    veCo(L.dich);
    L.tram.forEach(function (st) { st.buc.forEach(function (bc) { veBuc(st, bc); }); });
    veMark();
    L.hat.forEach(function (p) { ctx.globalAlpha = Math.max(0, Math.min(1, p.song * 2)); ctx.fillStyle = p.mau; ctx.fillRect(p.x - 4, p.y - 4, 8, 8); });
    ctx.globalAlpha = 1;
    ctx.restore();
    veHud();
  }
  function veMay(cam) {
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (var k = 0; k < 8; k++) {
      var x = ((k * 330 - cam * 0.3) % (rongNhin + 300) + rongNhin + 300) % (rongNhin + 300) - 150, y = 70 + (k % 3) * 46;
      ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.arc(x + 30, y - 10, 30, 0, 7); ctx.arc(x + 62, y, 24, 0, 7); ctx.fill();
    }
  }
  function veVuc(st) {
    var g = ctx.createLinearGradient(0, MAT, 0, CAO);
    g.addColorStop(0, "rgba(124,58,237,.15)"); g.addColorStop(1, "rgba(76,29,149,.85)");
    ctx.fillStyle = g; ctx.fillRect(st.x0, MAT - 10, st.x1 - st.x0, CAO - MAT + 10);
    ctx.font = "800 20px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillText(N.vucTen, (st.x0 + st.x1) / 2, CAO - 30);
  }
  function veBuc(st, bc) {
    var x = trai(bc), y = bc.cao + (bc.roi ? bc.roi * bc.roi * 900 : 0), w = bc.rong, mo = bc.q < MO;
    var a = (1 - bc.an) * (mo ? 0.3 : 1);
    if (a <= 0.01 || y > CAO + 40) return;
    ctx.globalAlpha = a;
    var mau = bc.k === 0 ? "#2563EB" : bc.k === 1 ? "#0EA5E9" : bc.k === 2 ? "#64748B" : "#F87171";
    if (bc.vo > 0 && Math.floor(bc.vo * 20) % 2) mau = "#FECACA";
    hinhTron(x, y, w, 20, 6); ctx.fillStyle = mau; ctx.fill();
    if (mo) { ctx.setLineDash([5, 4]); ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    if (st.dang === bc.k && !st.xong) { ctx.lineWidth = 3; ctx.strokeStyle = "#FACC15"; hinhTron(x - 2, y - 2, w + 4, 24, 7); ctx.stroke(); }
    ctx.font = "700 17px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    var nhanChu = bc.c.chu + " · " + phanTram(bc.q), cx = x + w / 2;
    ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.strokeText(nhanChu, cx, y - 8);
    ctx.fillStyle = bc.c.bia ? "#7F1D1D" : "#0F172A"; ctx.fillText(nhanChu, cx, y - 8);
    ctx.globalAlpha = 1;
  }
  function veCo(x) {
    ctx.fillStyle = "#334155"; ctx.fillRect(x, MAT - 120, 6, 120);
    ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.moveTo(x + 6, MAT - 120); ctx.lineTo(x + 62, MAT - 100); ctx.lineTo(x + 6, MAT - 80); ctx.fill();
    ctx.font = "800 28px " + CHU; ctx.fillStyle = "#0F172A"; ctx.textAlign = "center"; ctx.fillText(L.m.cuoi, x + 28, MAT - 92);
  }
  function veMark() {
    if (M.khien > 0 && Math.floor(M.khien * 12) % 2) return;
    var im = M.dat ? anh.chay : anh.nhay;
    var cao = 64, rong = im && im.naturalWidth ? cao * im.naturalWidth / im.naturalHeight : 44;
    var nhun = M.dat && Math.abs(M.vx) > 20 ? Math.abs(Math.sin(M.buoc / 18)) * 4 : 0;
    ctx.save(); ctx.translate(M.x + M.w / 2, M.y + M.h - nhun);
    if (M.huong < 0) ctx.scale(-1, 1);
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -rong / 2, -cao + 2, rong, cao);
    else { ctx.fillStyle = "#2563EB"; ctx.fillRect(-M.w / 2, -M.h, M.w, M.h); }
    ctx.restore();
  }
  // Câu đang viết: phần gốc, chữ đã chốt, chữ đang đứng (khung vàng) và dấu … cho phần còn lại.
  function manhCau() {
    var ds = [{chu: L.m.dau, loai: "goc"}];
    for (var s = 0; s < L.tram.length; s++) {
      var st = L.tram[s];
      if (st.b.truoc) ds.push({chu: st.b.truoc, loai: "goc"});
      if (st.xong) ds.push({chu: st.buc[st.chon].c.chu, loai: st.chon === 0 ? "chon" : "la"});
      else { ds.push(st.dang >= 0 ? {chu: st.buc[st.dang].c.chu, loai: st.buc[st.dang].c.bia ? "bia" : "dang"} : {chu: "…", loai: "cho"}); return ds; }
    }
    ds.push({chu: L.m.cuoi, loai: "goc"});
    return ds;
  }
  function veHud() {
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    hinhTron(12, 12, 212, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    var tim = ""; for (var k = 0; k < 3; k++) tim += k < L.tim ? "♥" : "♡";
    ctx.font = "800 26px " + CHU; ctx.fillStyle = "#FB7185"; ctx.fillText(tim, 24, 35);
    ctx.font = "800 21px " + CHU; ctx.fillStyle = "#fff"; ctx.fillText(String(L.diem), 128, 35);
    // nhiệt độ
    var nx = 236; // bên phải góc trên để dành cho nút toàn màn hình
    hinhTron(nx, 12, 138, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    ctx.font = "700 15px " + CHU; ctx.fillStyle = "#fff"; ctx.fillText(N.nhiet, nx + 12, 27);
    hinhTron(nx + 12, 40, 114, 8, 4); ctx.fillStyle = "#334155"; ctx.fill();
    var vt = (NHIET.indexOf(nhiet)) / (NHIET.length - 1);
    hinhTron(nx + 12, 40, 14 + 100 * vt, 8, 4); ctx.fillStyle = nhiet > 1.2 ? "#F97316" : "#FACC15"; ctx.fill();
    ctx.textAlign = "right"; ctx.fillStyle = "#FDE68A"; ctx.fillText(so(nhiet.toFixed(1)), nx + 126, 27);
    // câu
    var ds = manhCau(), co = 22, rongToiDa = rongNhin - 24 * 2;
    function do_rong() {
      ctx.font = "700 " + co + "px " + CHU;
      return ds.reduce(function (n, m) { return n + ctx.measureText(m.chu).width + co * 0.32 + (m.loai === "dang" || m.loai === "bia" || m.loai === "la" ? 12 : 0); }, 0);
    }
    var tong = do_rong();
    while (tong > rongToiDa && co > 13) { co -= 1; tong = do_rong(); }
    var y = 84, x = (rongNhin - tong) / 2;
    hinhTron(x - 14, y - co * 0.95, tong + 22, co * 1.9, 14); ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fill();
    ds.forEach(function (m) {
      var w = ctx.measureText(m.chu).width;
      if (/^[,.!?]/.test(m.chu)) x -= co * 0.32 - 1; // dấu câu dính vào chữ trước
      if (m.loai === "dang" || m.loai === "bia" || m.loai === "la") {
        hinhTron(x - 4, y - co * 0.7, w + 8, co * 1.4, 6);
        ctx.fillStyle = m.loai === "bia" ? "#FECACA" : m.loai === "la" ? "#FEF08A" : "#DBEAFE"; ctx.fill();
        x += 6;
      }
      ctx.textAlign = "left";
      ctx.fillStyle = m.loai === "goc" ? "#334155" : m.loai === "cho" ? "#94A3B8" : m.loai === "bia" ? "#B91C1C" : "#1D4ED8";
      if (m.loai === "la") ctx.fillStyle = "#854D0E";
      ctx.fillText(m.chu, x, y + 1);
      x += w + co * 0.32 + (m.loai === "dang" || m.loai === "bia" || m.loai === "la" ? 6 : 0);
    });
    if (L.bao) {
      ctx.font = "800 22px " + CHU; ctx.textAlign = "center";
      var bw = ctx.measureText(L.bao.chu).width;
      ctx.globalAlpha = Math.min(1, L.bao.t * 3);
      hinhTron(rongNhin / 2 - bw / 2 - 16, 128, bw + 32, 40, 20); ctx.fillStyle = "rgba(15,23,42,.78)"; ctx.fill();
      ctx.fillStyle = L.bao.mau || "#FDE68A"; ctx.fillText(L.bao.chu, rongNhin / 2, 149);
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
    rongNhin = CAO * r.width / r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    tiLe = cv.width / rongNhin;
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
  function manDau() {
    trangThai = "chon"; dungVong();
    var m = D.man[0], w = el("div", "ddc-dau");
    w.appendChild(el("p", "ddc-nho", N.manSo(1) + " · " + m.ten));
    w.appendChild(el("h2", null, m.dau + " …"));
    var ba = el("div", "ddc-ba");
    ba.appendChild(oNho("▭", N.y1, N.y1c)); ba.appendChild(oNho("🌡", N.y2, N.y2c)); ba.appendChild(oNho("☁", N.y3, N.y3c));
    w.appendChild(ba);
    var s = tienDo.sao[m.id];
    if (s) w.appendChild(el("p", "ddc-sao-cu", "★★★".slice(0, s) + "☆☆☆".slice(s) + " " + N.daChoi));
    var b = el("button", "btn btn-yt", N.batDau); b.type = "button"; b.addEventListener("click", function () { batDauMan(0); });
    w.appendChild(b);
    hienMan(w);
  }
  function batDauMan(i) {
    dungMan(i);
    man.hidden = true; $("#ddc").classList.remove("is-man");
    trangThai = "choi";
    if (DT.matches && !daThoat && !$("#ddc").classList.contains("is-toan")) toanMan(true);
    phim.trai = phim.phai = phim.nhay = false; demNhay = 0;
    L.bao = {chu: N.manSo(i + 1) + " · " + L.m.ten, t: 2};
    do_("duong-doan-chu-bat-dau", {man: String(i + 1), nhiet: String(nhiet)});
    var r = khung.getBoundingClientRect();
    if (!$("#ddc").classList.contains("is-toan") && (r.top < 0 || r.bottom > window.innerHeight)) $("#ddc").scrollIntoView({block: "start", behavior: "smooth"});
    cv.focus({preventScroll: true});
    chayVong();
  }
  function cauCuaBan(kq) {
    var p = el("p", "ddc-cau");
    function goc(chu) { p.appendChild(el("span", "ddc-goc" + (/^[,.!?]/.test(chu) ? " is-dau" : ""), chu)); }
    goc(L.m.dau);
    var dung = false;
    L.tram.forEach(function (st) {
      if (dung) return;
      if (st.b.truoc) goc(st.b.truoc);
      if (!st.xong) { goc("…"); dung = true; return; }
      var bc = st.buc[st.chon], c = el("span", "ddc-chip" + (bc.k === 0 ? " is-pho" : " is-la"));
      c.appendChild(el("b", null, bc.c.chu)); c.appendChild(el("small", null, phanTram(bc.c.p)));
      p.appendChild(c);
    });
    if (kq) goc(L.m.cuoi);
    return p;
  }
  function cauChatbot() {
    var p = el("p", "ddc-cau ddc-cau-may");
    var chu = [L.m.dau];
    L.tram.forEach(function (st) { if (st.b.truoc) chu.push(st.b.truoc); chu.push(st.b.chu[0].chu); });
    p.textContent = chu.join(" ").replace(/ ,/g, ",") + L.m.cuoi;
    return p;
  }
  function thang() {
    L.xong = true; trangThai = "xong"; dungVong();
    var la = L.tram.filter(function (st) { return st.chon > 0; }).length;
    var sao = 1 + (L.nga === 0 ? 1 : 0) + (la >= 2 ? 1 : 0);
    if (!tienDo.sao[L.m.id] || tienDo.sao[L.m.id] < sao) { tienDo.sao[L.m.id] = sao; luu(); }
    do_("duong-doan-chu-xong", {man: String(L.i + 1), sao: String(sao), la: String(la)});
    do_("hoc-xong", {loai: "duong-doan-chu"});
    var w = el("div", "pl-kq ddc-kq ddc-kq-thang"), a = el("div", "ddc-kq-trai"), b = el("div", "ddc-kq-phai");
    w.appendChild(a); w.appendChild(b);
    a.appendChild(el("p", "pl-kq-sao", "★★★".slice(0, sao) + "☆☆☆".slice(sao)));
    a.appendChild(el("h3", null, N.qua));
    var ds = el("ul", "ddc-sao-ds");
    [[true, N.s1], [L.nga === 0, N.s2], [la >= 2, N.s3(la)]].forEach(function (x) { var li = el("li", x[0] ? "is-co" : null, (x[0] ? "★ " : "☆ ") + x[1]); ds.appendChild(li); });
    a.appendChild(ds);
    b.appendChild(el("p", "ddc-nho", N.cauBan)); b.appendChild(cauCuaBan(true));
    b.appendChild(el("p", "ddc-nho", N.cauMay)); b.appendChild(cauChatbot());
    var bit = el("div", "pl-phan-hoi ddc-bit"); var im = el("img"); im.src = D.p + "assets/bit-vui.svg"; im.alt = ""; im.width = 48; im.height = 48;
    bit.appendChild(im); var tx = el("div"); tx.appendChild(el("b", null, N.bitDau)); tx.appendChild(el("p", null, N.bitChu)); bit.appendChild(tx);
    b.appendChild(bit);
    a.appendChild(nutCuoi());
    hienMan(w);
  }
  function thua(bia) {
    trangThai = "xong"; dungVong();
    var w = el("div", "pl-kq ddc-kq");
    w.appendChild(el("h3", null, N.thua));
    w.appendChild(el("p", null, bia ? N.thuaBia : N.thuaChu));
    w.appendChild(cauCuaBan(false));
    w.appendChild(nutCuoi());
    hienMan(w);
  }
  function nutCuoi() {
    var h = el("div", "pl-kq-nut");
    var l = el("button", "btn btn-yt", N.lai); l.type = "button"; l.addEventListener("click", function () { batDauMan(L.i); }); h.appendChild(l);
    var v = el("a", "btn", N.xemVideo); v.href = D.video; h.appendChild(v);
    var b = el("a", "btn", N.phongNao); b.href = D.p + "phong-thi-nghiem-bo-nao.html?tram=doan-chu"; h.appendChild(b);
    return h;
  }

  // ---------- Điều khiển ----------
  function doiNhiet() {
    nhiet = NHIET[(NHIET.indexOf(nhiet) + 1) % NHIET.length];
    $("#ddc-nhiet").textContent = "🌡 " + so(nhiet.toFixed(1));
    if (L) {
      tinhBuc(false);
      L.bao = {chu: nhiet < 0.8 ? N.nhietThap : nhiet > 1.2 ? N.nhietCao : N.nhietVua, t: 2.4, mau: nhiet > 1.2 ? "#FDBA74" : "#BFDBFE"};
    }
    if (trangThai !== "choi") ve();
  }
  var PHIM = {ArrowLeft: "trai", KeyA: "trai", ArrowRight: "phai", KeyD: "phai", ArrowUp: "nhay", KeyW: "nhay", Space: "nhay"};
  function batPhim() {
    document.addEventListener("keydown", function (e) {
      if (trangThai !== "choi") return;
      var tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
      if (e.code === "KeyT") { e.preventDefault(); doiNhiet(); return; }
      var k = PHIM[e.code];
      if (!k) return;
      if ((tg === "BUTTON" || tg === "A") && e.code === "Space") return;
      e.preventDefault();
      if (k === "nhay" && !phim.nhay) demNhay = 0.12;
      phim[k] = true;
    });
    document.addEventListener("keyup", function (e) { var k = PHIM[e.code]; if (k) phim[k] = false; });
    window.addEventListener("blur", function () { phim.trai = phim.phai = phim.nhay = false; });
    document.querySelectorAll("#ddc-dk [data-k]").forEach(function (b) {
      var k = b.dataset.k;
      if (k === "nhiet") { b.addEventListener("click", function (e) { e.preventDefault(); doiNhiet(); }); return; }
      function an(e) { e.preventDefault(); if (k === "nhay" && !phim.nhay) demNhay = 0.12; phim[k] = true; b.classList.add("is-an"); try { b.setPointerCapture(e.pointerId); } catch (x) {} }
      function nha() { phim[k] = false; b.classList.remove("is-an"); }
      b.addEventListener("pointerdown", an);
      b.addEventListener("pointerup", nha); b.addEventListener("pointercancel", nha); b.addEventListener("lostpointercapture", nha);
      b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
  }

  function batDau() {
    cv = $("#ddc-canvas"); man = $("#ddc-man"); khung = $("#ddc-khung");
    if (!cv || !cv.getContext) return;
    ctx = cv.getContext("2d");
    D.man.forEach(function (m) {
      m.buoc.forEach(function (b) { b.chu.sort(function (x, y) { return y.p - x.p; }); });
    });
    ["chay", "nhay"].forEach(function (k) {
      var im = new Image(); im.src = D.p + "assets/mascot/" + (k === "chay" ? "mark-trinh-bay-tinh.webp" : "mark-chi-len-tinh.webp");
      im.onload = function () { ve(); }; anh[k] = im;
    });
    coGian();
    window.addEventListener("resize", coGian);
    batPhim();
    toanMan(false);
    $("#ddc-toan").addEventListener("click", function () {
      var bat = !$("#ddc").classList.contains("is-toan");
      daThoat = !bat; toanMan(bat); cv.focus({preventScroll: true});
    });
    $("#ddc-nhiet").textContent = "🌡 " + so(nhiet.toFixed(1));
    manDau();
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__ddc = {L: function () { return L; }, M: function () { return M; }, batDauMan: batDauMan, phim: phim, nhay: function () { if (!phim.nhay) demNhay = 0.12; phim.nhay = true; }, doiNhiet: doiNhiet, nhiet: function () { return nhiet; }, trangThai: function () { return trangThai; }};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

/* Phòng thí nghiệm dữ liệu và robot (phong-thi-nghiem-du-lieu.html, en/...): cùng bàn ngăn kéo với Phòng thí nghiệm bộ não AI.
   Mở thẳng một trạm bằng ?tram=nguong hoặc #nguong. Số liệu nhúng trong trang (#pdl-du-lieu, scripts/tao_phong_du_lieu.py).
   Trạm 1 Chọn biểu đồ (309), 2 Ngưỡng voucher (346), 3 Học vẹt (348): số thật từ notebook của video.
   Trạm 4 PID (362) và 5 EKF (363): chép đúng công thức robot/pid.py, robot/dinh_vi.py, robot/mo_phong.py, chạy ngay trên máy.
   Trạm 6 A* (364): bản đồ robot tự vẽ trong video, A* / Dijkstra chép từ robot/lap_ke_hoach.py.
   Không gửi gì đi đâu. */
(function () {
  "use strict";

  /* ================= Phần tính (không đụng trang, chạy được bằng node để kiểm) ================= */
  var TINH = {};

  // 362: PID rời rạc + động cơ một bánh, y hệt robot/pid.py và tap_362.py
  TINH.pid = function (kp, ki, kd, coTai) {
    var DT = 0.01, DAT = 10, T_TAI = 2, TAI = 4, N = 400;
    var w = 0, hang = [0, 0, 0], K = 2, TAU = 0.15;
    var tichPhan = 0, doTruoc = null;
    var goc = 0, demTruoc = 0, ls = [], ws = [], us = [];
    for (var k = 0; k < N; k++) {
      var dem = Math.floor(goc / (2 * Math.PI) * 360);
      ls.push((dem - demTruoc) * 2 * Math.PI / 360 / DT);
      demTruoc = dem;
      var c = ls.slice(-5), tb = 0;
      for (var i = 0; i < c.length; i++) tb += c[i];
      tb /= c.length;
      var sai = DAT - tb;
      var daoHam = doTruoc === null ? 0 : -(tb - doTruoc) / DT;
      doTruoc = tb;
      var u = kp * sai + ki * (tichPhan + sai * DT) + kd * daoHam;
      if (u > -12 && u < 12) tichPhan += sai * DT;
      u = Math.max(-12, Math.min(12, u));
      hang.push(u);
      var uTre = hang.shift();
      w += DT * (K * uTre - w - (coTai && k * DT >= T_TAI ? TAI : 0)) / TAU;
      goc += w * DT;
      ws.push(w); us.push(u);
    }
    function tb_(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
    var truoc = [], cuoiTai = [], sau = [], cuoi = [], uOn = [];
    for (k = 0; k < N; k++) {
      var t = k * DT;
      if (t < T_TAI) truoc.push(ws[k]);
      if (t >= 1.5 && t < T_TAI) { cuoiTai.push(ws[k]); uOn.push(us[k]); }
      if (t >= T_TAI) sau.push(ws[k]);
      if (t >= 3.5) cuoi.push(ws[k]);
    }
    var vot = Math.max(0, (Math.max.apply(null, truoc) - DAT) / DAT * 100);
    var cuoiNgoai = -1;
    for (i = 0; i < sau.length; i++) if (Math.abs(sau[i] - DAT) > 0.02 * DAT) cuoiNgoai = i;
    var hoi = cuoiNgoai < 0 ? 0 : (cuoiNgoai + 1 < sau.length ? (cuoiNgoai + 1) * DT : null);
    var mU = tb_(uOn), v = 0;
    for (i = 0; i < uOn.length; i++) v += (uOn[i] - mU) * (uOn[i] - mU);
    return {
      ws: ws, us: us, vot: vot, saiTruoc: (tb_(cuoiTai) - DAT) / DAT * 100, thap: Math.min.apply(null, sau),
      hoi: hoi, saiCuoi: (tb_(cuoi) - DAT) / DAT * 100, rung: Math.sqrt(v / uOn.length)
    };
  };

  // Số ngẫu nhiên có hạt giống (mulberry32) và phân phối chuẩn (Box-Muller)
  function rngTao(hat) {
    var a = hat >>> 0, du = null;
    function u() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      u: u,
      chuan: function (m, s) {
        if (du !== null) { var z = du; du = null; return m + s * z; }
        var r = Math.sqrt(-2 * Math.log(u() + 1e-12)), g = 2 * Math.PI * u();
        du = r * Math.sin(g);
        return m + s * r * Math.cos(g);
      }
    };
  }
  TINH.rngTao = rngTao;

  function gocChuan(a) { var x = (a + Math.PI) % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return x - Math.PI; }

  // 363: 3 vòng giao hàng, odometry so với EKF + mốc trần, y hệt robot/mo_phong.py và robot/dinh_vi.py
  TINH.dinhVi = function (moc, bat, q, hat) {
    var R_BANH = 0.05, L_TRUC = 0.30, R_PHAI = 0.05 * 1.005, DT = 0.05, KR = 2 * Math.PI / 360 * R_BANH;
    var VONG = [[1.4, 2.0], [7.5, 2.0], [7.5, 4.3], [3.2, 4.3], [1.2, 3.8]];
    var rng = rngTao(hat);
    var x = 1.2, y = 3.8, th = -Math.PI / 2;
    var gT = 0, gP = 0;                                  // góc encoder trái, phải
    var od = { x: x, y: y, th: th, t: 0, p: 0 };
    var s = [x, y, th];
    var P = [[1e-4, 0, 0], [0, 1e-4, 0], [0, 0, Math.pow(Math.PI / 180, 2)]];
    var Rm = 0.03 * 0.03;
    var truocT = 0, truocP = 0, dich = 0, vong = 0, k = 0;
    var log = [];
    function mm(A, B) { var C = [], i, j, l; for (i = 0; i < A.length; i++) { C.push([]); for (j = 0; j < B[0].length; j++) { var v = 0; for (l = 0; l < B.length; l++) v += A[i][l] * B[l][j]; C[i].push(v); } } return C; }
    function tr(A) { return A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }); }
    function cong(A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v + B[i][j]; }); }); }
    function dem(g) { return Math.floor(g / (2 * Math.PI) * 360); }
    function batDinh() {
      var a = P[0][0], b = P[0][1], d = P[1][1];
      var l = (a + d) / 2 + Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
      return 2 * Math.sqrt(Math.max(l, 0));
    }
    while (vong < 3 && k < 8000) {
      k++;
      var gx = VONG[dich][0], gy = VONG[dich][1];
      if (Math.hypot(gx - s[0], gy - s[1]) < 0.15) {
        dich = (dich + 1) % VONG.length;
        if (dich === 0) vong++;
        continue;
      }
      var sai = gocChuan(Math.atan2(gy - s[1], gx - s[0]) - s[2]);
      var w = Math.max(-1.2, Math.min(1.2, 2 * sai));
      var v = Math.abs(sai) < 0.4 ? 0.4 : 0.05;
      var wl = (v - w * L_TRUC / 2) / R_BANH, wr = (v + w * L_TRUC / 2) / R_BANH;
      var dl = R_BANH * wl * DT * (1 + rng.chuan(0, 0.01));
      var dr = R_PHAI * wr * DT * (1 + rng.chuan(0, 0.01));
      var ds = (dl + dr) / 2, dth = (dr - dl) / L_TRUC;
      x += ds * Math.cos(th + dth / 2); y += ds * Math.sin(th + dth / 2); th = gocChuan(th + dth);
      gT += wl * DT; gP += wr * DT;
      var tl = dem(gT), tp = dem(gP);
      // odometry thuần
      var odl = (tl - od.t) * KR, odr = (tp - od.p) * KR;
      od.t = tl; od.p = tp;
      var ods = (odl + odr) / 2, odth = (odr - odl) / L_TRUC;
      od.x += ods * Math.cos(od.th + odth / 2); od.y += ods * Math.sin(od.th + odth / 2); od.th = gocChuan(od.th + odth);
      // EKF dự đoán
      var el = (tl - truocT) * KR, er = (tp - truocP) * KR;
      truocT = tl; truocP = tp;
      var eds = (el + er) / 2, edth = (er - el) / L_TRUC;
      var a = s[2] + edth / 2;
      s = [s[0] + eds * Math.cos(a), s[1] + eds * Math.sin(a), gocChuan(s[2] + edth)];
      var F = [[1, 0, -eds * Math.sin(a)], [0, 1, eds * Math.cos(a)], [0, 0, 1]];
      var G = [[Math.cos(a), -eds * Math.sin(a) / 2], [Math.sin(a), eds * Math.cos(a) / 2], [0, 1]];
      var Q = [[Math.pow(q[0] * Math.abs(eds) + 1e-4, 2), 0], [0, Math.pow(q[1] * Math.abs(edth) + q[2] * Math.abs(eds) + 1e-4, 2)]];
      P = cong(mm(mm(F, P), tr(F)), mm(mm(G, Q), tr(G)));
      var soMoc = 0;
      if (k % 2 === 0) {                                  // camera 10 lần mỗi giây
        var c = Math.cos(th), sn = Math.sin(th);
        for (var i = 0; i < moc.length; i++) {
          var mx = moc[i][0], my = moc[i][1], ddx = mx - x, ddy = my - y;
          if (ddx * ddx + ddy * ddy > 1.0) continue;
          var zx = c * ddx + sn * ddy + rng.chuan(0, 0.03), zy = -sn * ddx + c * ddy + rng.chuan(0, 0.03);
          if (!bat[i]) continue;
          var ec = Math.cos(s[2]), es = Math.sin(s[2]), dx = mx - s[0], dy = my - s[1];
          var h0 = ec * dx + es * dy, h1 = -es * dx + ec * dy;
          var H = [[-ec, -es, h1], [es, -ec, -h0]];
          var S = cong(mm(mm(H, P), tr(H)), [[Rm, 0], [0, Rm]]);
          var det = S[0][0] * S[1][1] - S[0][1] * S[1][0];
          var Si = [[S[1][1] / det, -S[0][1] / det], [-S[1][0] / det, S[0][0] / det]];
          var Kg = mm(mm(P, tr(H)), Si);
          var r0 = zx - h0, r1 = zy - h1;
          s = [s[0] + Kg[0][0] * r0 + Kg[0][1] * r1, s[1] + Kg[1][0] * r0 + Kg[1][1] * r1, gocChuan(s[2] + Kg[2][0] * r0 + Kg[2][1] * r1)];
          var KH = mm(Kg, H);
          P = mm([[1 - KH[0][0], -KH[0][1], -KH[0][2]], [-KH[1][0], 1 - KH[1][1], -KH[1][2]], [-KH[2][0], -KH[2][1], 1 - KH[2][2]]], P);
          soMoc++;
        }
      }
      log.push([k * DT, x, y, od.x, od.y, s[0], s[1], batDinh(), soMoc]);
    }
    var tong = 0, lon = 0, ngoai = 0, chup = 0, thay = 0, tongOd = 0;
    log.forEach(function (r, j) {
      var e = Math.hypot(r[1] - r[5], r[2] - r[6]);
      tong += e; lon = Math.max(lon, e); if (e > r[7]) ngoai++;
      tongOd += Math.hypot(r[1] - r[3], r[2] - r[4]);
      if (j % 2 === 1) { chup++; if (r[8] > 0) thay++; }
    });
    var cuoi = log[log.length - 1];
    return {
      log: log, giay: cuoi[0], odoCuoi: Math.hypot(cuoi[1] - cuoi[3], cuoi[2] - cuoi[4]), odoTb: tongOd / log.length,
      ekfTb: tong / log.length, ekfMax: lon, ekfCuoi: Math.hypot(cuoi[1] - cuoi[5], cuoi[2] - cuoi[6]),
      ngoai: ngoai / log.length * 100, thay: chup ? thay / chup * 100 : 0, xong: vong >= 3
    };
  };

  // 364: phình vật cản và A* 8 hướng, y hệt robot/lap_ke_hoach.py
  TINH.phinh = function (luoi, nx, ny, banKinh, res) {
    var k = Math.ceil(banKinh / res - 1e-9), off = [];
    for (var dy = -k; dy <= k; dy++) for (var dx = -k; dx <= k; dx++)
      if ((dx * dx + dy * dy) * res * res <= banKinh * banKinh + 1e-12) off.push([dx, dy]);
    var out = new Uint8Array(luoi);
    for (var iy = 0; iy < ny; iy++) for (var ix = 0; ix < nx; ix++) {
      if (!luoi[iy * nx + ix]) continue;
      for (var j = 0; j < off.length; j++) {
        var xx = ix + off[j][0], yy = iy + off[j][1];
        if (xx >= 0 && xx < nx && yy >= 0 && yy < ny) out[yy * nx + xx] = 1;
      }
    }
    return out;
  };

  TINH.aSao = function (cam, nx, ny, s, d, coH, res) {
    if (cam[s[1] * nx + s[0]] || cam[d[1] * nx + d[0]]) return { duong: null, mo: [] };
    function h(x, y) {
      if (!coH) return 0;
      var dx = Math.abs(x - d[0]), dy = Math.abs(y - d[1]);
      return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
    function nho(a, b) {                                  // so như tuple Python (f, g, (ix, iy))
      return a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] !== b[2] ? a[2] < b[2] : a[3] < b[3];
    }
    var heap = [];
    function day(e) {
      heap.push(e);
      var i = heap.length - 1;
      while (i > 0) { var p = (i - 1) >> 1; if (nho(heap[i], heap[p])) { var t = heap[i]; heap[i] = heap[p]; heap[p] = t; i = p; } else break; }
    }
    function lay() {
      var dau = heap[0], cuoi = heap.pop();
      if (heap.length) {
        heap[0] = cuoi;
        var i = 0, n = heap.length;
        for (;;) {
          var l = 2 * i + 1, r = l + 1, m = i;
          if (l < n && nho(heap[l], heap[m])) m = l;
          if (r < n && nho(heap[r], heap[m])) m = r;
          if (m === i) break;
          var t = heap[i]; heap[i] = heap[m]; heap[m] = t; i = m;
        }
      }
      return dau;
    }
    var HUONG = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
    var g = new Float64Array(nx * ny).fill(1e18), cha = new Int32Array(nx * ny).fill(-1), xong = new Uint8Array(nx * ny);
    var mo = [];
    g[s[1] * nx + s[0]] = 0;
    day([h(s[0], s[1]), 0, s[0], s[1]]);
    while (heap.length) {
      var e = lay(), cx = e[2], cy = e[3], ci = cy * nx + cx, gc = e[1];
      if (xong[ci]) continue;
      xong[ci] = 1; mo.push(ci);
      if (cx === d[0] && cy === d[1]) {
        var duong = [ci];
        while (cha[ci] >= 0) { ci = cha[ci]; duong.push(ci); }
        return { duong: duong.reverse(), dai: gc * res, mo: mo };
      }
      for (var j = 0; j < 8; j++) {
        var dx = HUONG[j][0], dy = HUONG[j][1], nxx = cx + dx, nyy = cy + dy;
        if (nxx < 0 || nxx >= nx || nyy < 0 || nyy >= ny || cam[nyy * nx + nxx]) continue;
        if (dx && dy && (cam[cy * nx + nxx] || cam[nyy * nx + cx])) continue;   // không đi chéo cắt góc
        var gn = gc + HUONG[j][2], ni = nyy * nx + nxx;
        if (gn < g[ni]) { g[ni] = gn; cha[ni] = cy * nx + cx; day([gn + h(nxx, nyy), gn, nxx, nyy]); }
      }
    }
    return { duong: null, mo: mo };
  };

  TINH.docHex = function (hang, nx) {
    var out = new Uint8Array(hang.length * nx);
    hang.forEach(function (hx, iy) {
      for (var j = 0; j < hx.length; j++) {
        var v = parseInt(hx[j], 16);
        for (var b = 0; b < 4; b++) { var ix = j * 4 + b; if (ix < nx && (v >> (3 - b)) & 1) out[iy * nx + ix] = 1; }
      }
    });
    return out;
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = TINH; return; }

  /* ================= Phần trang ================= */
  var goc = document.getElementById("pdl");
  if (!goc) return;
  var D = JSON.parse(document.getElementById("pdl-du-lieu").textContent);
  var EN = document.documentElement.lang === "en";
  var NS = "http://www.w3.org/2000/svg";
  function $(id) { return document.getElementById(id); }
  function do_(ten, them) { if (window.mhaiDo) window.mhaiDo(ten, them || {}); }
  function so(x, le) { return Number(x).toLocaleString(EN ? "en-US" : "vi-VN", { minimumFractionDigits: le || 0, maximumFractionDigits: le || 0 }); }
  function pt(x, le) { return so(x * 100, le === undefined ? 1 : le) + "%"; }
  function tr_(x) { return x === 0 ? "0" : EN ? so(x / 1e6, 1) + "M" : so(x / 1e6, 1) + " tr"; }
  function ve(tag, at, cha, chu) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (chu !== undefined) e.textContent = chu;
    if (cha) cha.appendChild(e);
    return e;
  }
  function xoa(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
  function o4(el, ds) {
    el.innerHTML = ds.map(function (x) {
      return '<div class="pdl-o' + (x[2] ? " " + x[2] : "") + '"><b>' + x[1] + "</b><span>" + x[0] + "</span></div>";
    }).join("");
  }
  function bit(el, chu, loai) {
    el.hidden = false;
    el.className = "pdl-bit" + (loai ? " is-" + loai : "");
    el.innerHTML = '<img src="' + (EN ? "../" : "") + 'assets/' + (loai === "sai" ? "bit-sai-roi" : loai === "dung" ? "bit-vui" : "bit-giai-thich") + '.svg" alt="" width="44" height="44"><p>' + chu + "</p>";
  }
  var MAU = ["#2563EB", "#F97316", "#10B981", "#A855F7", "#EF4444", "#0EA5E9", "#F59E0B", "#64748B"];

  /* ---------- Ngăn kéo ---------- */
  var nut = [].slice.call(goc.querySelectorAll("[data-tram]"));
  var ban = [].slice.call(goc.querySelectorAll(".bn-tram"));
  var daMo = {};
  function moTram(id, cuon) {
    var o = $("tram-" + id);
    if (!o) return;
    ban.forEach(function (b) { b.hidden = b !== o; });
    nut.forEach(function (n) { n.setAttribute("aria-current", n.dataset.tram === id ? "true" : "false"); });
    if (!daMo[id]) { daMo[id] = 1; if (KHOI[id]) KHOI[id](); }
    try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
    if (cuon && window.innerWidth < 820) o.scrollIntoView({ block: "start" });
    do_("du-lieu-tram", { tram: id });
  }
  nut.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });

  /* ---------- Trục và lưới cho biểu đồ SVG ---------- */
  function khung(svg, W, H, m, y0, y1, nhanY, buoc) {
    var g = ve("g", { "class": "pdl-truc" }, svg);
    for (var v = y0; v <= y1 + 1e-9; v += buoc) {
      var y = m.t + (H - m.t - m.b) * (1 - (v - y0) / (y1 - y0));
      ve("line", { x1: m.l, x2: W - m.r, y1: y, y2: y }, g);
      ve("text", { x: m.l - 6, y: y + 4, "text-anchor": "end" }, g, nhanY(v));
    }
    return function (v) { return m.t + (H - m.t - m.b) * (1 - (v - y0) / (y1 - y0)); };
  }
  function chuGiua(svg, x, y, chu, cls) { return ve("text", { x: x, y: y, "text-anchor": "middle", "class": cls || "" }, svg, chu); }
  function chuGiai(svg, ten, W) {
    var x = W - 12;
    for (var i = ten.length - 1; i >= 0; i--) {
      var t = ve("text", { x: x, y: 14, "text-anchor": "end", "class": "pdl-chu-giai" }, svg, ten[i]);
      var w = 0;
      try { w = t.getComputedTextLength(); } catch (e) {}
      w = (w || ten[i].length * 6.6) + 6;
      ve("rect", { x: x - w - 12, y: 4, width: 10, height: 10, rx: 2, fill: MAU[i % MAU.length] }, svg);
      x -= w + 24;
    }
  }

  /* ---------- Trạm 1: chọn biểu đồ (309) ---------- */
  function khoiBieuDo() {
    var B = D.bieu_do, svg = $("bd-ve"), chu = $("bd-chu"), hop = $("bd-bit"), catO = $("bd-cat-o"), cat = $("bd-cat"), diem = $("bd-diem");
    var NHOM = EN ? ["Milk tea", "Coffee", "Tea", "Cake"] : ["Trà sữa", "Cà phê", "Trà", "Bánh"];
    var KEYS = ["Milk Tea", "Coffee", "Tea", "Cake"];
    var THANG = EN ? ["August", "September"] : ["Tháng 8", "Tháng 9"];
    var TUAN = EN ? ["Aug 1", "Aug 2", "Aug 3", "Aug 4", "Sep 1", "Sep 2", "Sep 3", "Sep 4"] : ["T8·1", "T8·2", "T8·3", "T8·4", "T9·1", "T9·2", "T9·3", "T9·4"];
    var Q = {
      nhom: { x: NHOM, s: THANG, M: KEYS.map(function (k) { return B.nhom[k]; }), tron: "cot", chong: "xoay", dung: "cot" },
      ngay: { x: B.ngay.map(function (r) { return r[0]; }), s: [EN ? "Daily sales" : "Doanh thu ngày"], M: B.ngay.map(function (r) { return [r[1]]; }), tron: "cot", chong: "", dung: "duong" },
      tuan: { x: TUAN, s: NHOM, M: B.tuan, tron: "hang", chong: "", dung: "chong" },
      quan1: { x: THANG, s: [EN ? "District 1" : "Quận 1"], M: [[B.quan1[0]], [B.quan1[1]]], tron: "cot", chong: "", dung: "cot" }
    };
    var L = EN ? {
      nhom: { cot: "Right. Four groups side by side, two months next to each other: milk tea clearly falls from 23.9M to 18.4M while the others barely move.",
        duong: "A line joins the product groups as if they followed each other in time. Milk tea and coffee have no order, so the downward slope just fools the eye.",
        tron: "Two pies means comparing angle with angle, and eyes are bad at that. Can you tell how much milk tea dropped?",
        chong: "You can see September's total is lower, but the pieces don't share a baseline, so each group is hard to compare. Side-by-side bars are clearer." },
      ngay: { cot: "Readable, but 61 bars are crowded. For data over time, one line makes the dip on Sep 15-21 stand out.",
        duong: "Right. 61 days joined into one line: Sep 15-21 sags, with the lowest day on Sep 16, under 1 million.",
        tron: "61 slices: nobody can read it, and a pie throws away the order of the days.",
        chong: "There is only one series, so stacked bars are just plain bars: 61 crowded bars. A line works better over time." },
      tuan: { cot: "32 bars to scan cluster by cluster. You can spot milk tea low in week 3 of September, but not that buyers moved to tea.",
        duong: "You see the milk tea line fall in week 3 and the tea line rise. But not how much of each week each group makes up.",
        tron: "8 pies for 8 weeks: you'd flick between them 8 times, and eyes compare angles poorly.",
        chong: "Right. In week 3 of September the milk tea slice almost vanishes and tea swells: some buyers switched to tea when the pearls ran out." },
      quan1: { cot: "Right, as long as the axis starts at 0: District 1 fell 16.6%, from 17.1M to 14.3M. Now try cutting the axis at 14 million.",
        duong: "Two points joined by a line looks like a steady slide all month. With just 2 numbers, bars are enough.",
        tron: "A pie shows parts of one whole. August and September aren't two slices of the same cake.",
        chong: "One series, so stacked bars are just plain bars. Fine, but plain bars say it already." },
      cat: function (r, g) { return "Axis cut at 14 million: September's bar is only " + r + "% as tall as August's, so it looks like a 90% crash. The real drop is " + g + "%. Bar axes must start at 0."; },
      chon: "Pick a chart type above.", dauTien: function (a, n) { return "Right on the first try: " + a + " of " + n + " questions."; }
    } : {
      nhom: { cot: "Đúng. Bốn nhóm đứng cạnh nhau, hai tháng sát nhau: thấy ngay trà sữa tụt từ 23,9 xuống 18,4 triệu, các nhóm khác gần như giữ nguyên.",
        duong: "Đường nối các nhóm món như thể chúng nối tiếp nhau theo thời gian. Trà sữa với cà phê không có thứ tự, đường dốc xuống chỉ đánh lừa mắt.",
        tron: "Hai cái bánh tròn phải so góc với góc, mà mắt người so góc rất kém. Bạn có thấy trà sữa tụt bao nhiêu không?",
        chong: "Thấy tổng tháng 9 thấp hơn, nhưng các khúc không cùng đáy nên khó so từng nhóm. Cột đứng cạnh nhau rõ hơn." },
      ngay: { cot: "Đọc được, nhưng 61 cột chen chúc. Dữ liệu theo thời gian thì một đường liền làm chỗ võng 15-21/9 nổi hơn.",
        duong: "Đúng. 61 ngày nối thành một đường, đoạn 15-21/9 võng xuống, thấp nhất ngày 16/9, chưa tới 1 triệu.",
        tron: "61 miếng bánh, không ai đọc nổi, và biểu đồ tròn làm mất thứ tự ngày.",
        chong: "Chỉ có một dãy số nên cột chồng cũng là cột thường: 61 cột chen chúc. Theo thời gian thì đường rõ hơn." },
      tuan: { cot: "32 cột, phải dò từng cụm. Thấy trà sữa tuần 3 tháng 9 thấp, nhưng khó thấy khách chuyển sang trà.",
        duong: "Thấy đường trà sữa rơi ở tuần 3 và đường trà nhích lên. Nhưng không thấy mỗi nhóm chiếm bao nhiêu phần của tuần.",
        tron: "8 cái bánh tròn cho 8 tuần: phải nhìn qua lại 8 lần, mà mắt so góc rất kém.",
        chong: "Đúng. Tuần 3 tháng 9 phần trà sữa gần như biến mất, phần trà phình lên: một phần khách đã chuyển sang trà khi hết trân châu." },
      quan1: { cot: "Đúng, miễn trục bắt đầu từ 0: Quận 1 giảm 16,6%, từ 17,1 xuống 14,3 triệu. Giờ thử bật cắt trục ở 14 triệu xem sao.",
        duong: "Hai điểm nối một đường, trông như cả tháng đi xuống đều đều. Chỉ có 2 con số thì cột là đủ.",
        tron: "Biểu đồ tròn là các phần của một tổng. Tháng 8 và tháng 9 không phải hai miếng của cùng một chiếc bánh.",
        chong: "Chỉ có một dãy số nên cột chồng cũng là cột thường. Được, nhưng cột thường là đủ." },
      cat: function (r, g) { return "Cắt trục ở 14 triệu: cột tháng 9 chỉ còn cao bằng " + r + "% cột tháng 8, trông như sập hơn 90%. Thật ra chỉ giảm " + g + "%. Trục biểu đồ cột phải bắt đầu từ 0."; },
      chon: "Chọn một loại biểu đồ ở trên.", dauTien: function (a, n) { return "Chọn đúng ngay lần đầu: " + a + " trên " + n + " câu."; }
    };
    var TAM = { nhom: { duong: 0, tron: 0, chong: 1 }, ngay: { cot: 1, tron: 0, chong: 1 }, tuan: { cot: 1, duong: 1, tron: 0 }, quan1: { duong: 0, tron: 0, chong: 1 } };
    var cau = "nhom", loai = null, lanDau = {};
    var W = 640, H = 300, m = { l: 56, r: 12, t: 24, b: 40 };
    function hep() { var w = svg.getBoundingClientRect().width; m = w && w < 500 ? { l: 92, r: 12, t: 40, b: 44 } : { l: 56, r: 12, t: 24, b: 40 }; }

    function maxY(M, chong) {
      var mx = 0;
      M.forEach(function (r) { var s = 0; r.forEach(function (v) { s += v; mx = Math.max(mx, v); }); if (chong) mx = Math.max(mx, s); });
      return mx;
    }
    function buocDep(mx) { var b = Math.pow(10, Math.floor(Math.log10(mx / 4))); var n = mx / 4 / b; return (n > 5 ? 10 : n > 2 ? 5 : n > 1 ? 2 : 1) * b; }
    function nhanX(q, i) {
      var n = q.x.length;
      if (n > 12) return i % 7 === 0 ? q.x[i] : "";
      return q.x[i];
    }

    function veCot(q, chong, y0) {
      var M = q.M, x = q.x, s = q.s;
      if (chong && q.chong === "xoay") { M = s.map(function (_, j) { return M.map(function (r) { return r[j]; }); }); x = s; s = q.x; }
      var mx = maxY(M, chong), b = buocDep(mx), y1 = Math.ceil(mx / b) * b;
      y0 = y0 || 0;
      var Y = khung(svg, W, H, m, y0, y1, tr_, y0 ? (y1 - y0) / 4 : b);
      var bw = (W - m.l - m.r) / x.length, pad = bw * (x.length > 12 ? 0.15 : 0.2);
      M.forEach(function (r, i) {
        var x0 = m.l + i * bw + pad, rong = bw - 2 * pad, day = y0;
        if (chong || s.length === 1) {
          r.forEach(function (v, j) {
            var yT = Y(Math.max(day + v, y0)), yD = Y(Math.max(day, y0));
            ve("rect", { x: x0, y: yT, width: rong, height: Math.max(0, yD - yT), fill: MAU[j % MAU.length] }, svg);
            day += v;
          });
        } else {
          var w1 = rong / r.length;
          r.forEach(function (v, j) { var yT = Y(Math.max(v, y0)); ve("rect", { x: x0 + j * w1, y: yT, width: w1 - 2, height: Math.max(0, Y(y0) - yT), rx: 2, fill: MAU[j % MAU.length] }, svg); });
        }
        var nh = (chong && q.chong === "xoay") ? x[i] : nhanX(q, i);
        if (nh) chuGiua(svg, m.l + i * bw + bw / 2, H - m.b + 18, nh, "pdl-nhan");
      });
      if (s.length > 1) chuGiai(svg, s, W);
    }
    function veDuong(q) {
      var mx = maxY(q.M), b = buocDep(mx), y1 = Math.ceil(mx / b) * b;
      var Y = khung(svg, W, H, m, 0, y1, tr_, b);
      var n = q.x.length, X = function (i) { return m.l + (W - m.l - m.r) * (n === 1 ? 0.5 : i / (n - 1)) * 0.94 + (W - m.l - m.r) * 0.03; };
      q.s.forEach(function (_, j) {
        ve("polyline", { points: q.M.map(function (r, i) { return X(i) + "," + Y(r[j]); }).join(" "), fill: "none", stroke: MAU[j % MAU.length], "stroke-width": n > 20 ? 2.5 : 3, "stroke-linejoin": "round" }, svg);
        if (n <= 12) q.M.forEach(function (r, i) { ve("circle", { cx: X(i), cy: Y(r[j]), r: 4, fill: MAU[j % MAU.length] }, svg); });
      });
      q.x.forEach(function (_, i) { var nh = nhanX(q, i); if (nh) chuGiua(svg, X(i), H - m.b + 18, nh, "pdl-nhan"); });
      if (q.s.length > 1) chuGiai(svg, q.s, W);
    }
    function veTron(q) {
      var banh = [];
      if (q.tron === "cot") q.s.forEach(function (ten, j) { banh.push([ten, q.M.map(function (r) { return r[j]; })]); });
      else q.x.forEach(function (ten, i) { banh.push([ten, q.M[i]]); });
      var n = banh.length, cot = Math.min(n, 4), hang = Math.ceil(n / cot);
      var o = Math.min((W - 20) / cot, (H - 30) / hang), r = o / 2 - 18;
      banh.forEach(function (bh, k) {
        var cx = 10 + (k % cot + 0.5) * ((W - 20) / cot), cy = 8 + (Math.floor(k / cot) + 0.5) * ((H - 24) / hang);
        var tong = bh[1].reduce(function (a, b) { return a + b; }, 0), a0 = -Math.PI / 2;
        bh[1].forEach(function (v, j) {
          var a1 = a0 + v / tong * 2 * Math.PI, lon = a1 - a0 > Math.PI ? 1 : 0;
          var mau = bh[1].length > 8 ? "hsl(" + (210 + j * 137.5 % 150) + " 70% " + (45 + (j % 3) * 8) + "%)" : MAU[j % MAU.length];
          ve("path", { d: "M" + cx + "," + cy + " L" + (cx + r * Math.cos(a0)) + "," + (cy + r * Math.sin(a0)) + " A" + r + "," + r + " 0 " + lon + " 1 " + (cx + r * Math.cos(a1)) + "," + (cy + r * Math.sin(a1)) + " Z", fill: mau, stroke: "var(--panel)", "stroke-width": 1 }, svg);
          a0 = a1;
        });
        chuGiua(svg, cx, cy + r + 15, bh[0], "pdl-nhan");
      });
      var ten = q.tron === "cot" ? q.x : q.s;
      if (ten.length <= 8) chuGiai(svg, ten, W);
    }

    function veLai() {
      xoa(svg); hep();
      var q = Q[cau];
      catO.hidden = !(cau === "quan1" && loai === "cot");
      svg.setAttribute("aria-label", loai ? (EN ? "Chart: " : "Biểu đồ: ") + loai : "");
      if (!loai) { chuGiua(svg, W / 2, H / 2, L.chon, "pdl-nhan"); chu.textContent = ""; hop.hidden = true; return; }
      if (loai === "cot") veCot(q, false, cau === "quan1" && cat.checked ? B.cat_truc : 0);
      else if (loai === "duong") veDuong(q);
      else if (loai === "tron") veTron(q);
      else veCot(q, true, 0);
      var muc = loai === q.dung ? 2 : TAM[cau][loai];
      if (cau === "quan1" && loai === "cot" && cat.checked) bit(hop, L.cat(so(B.cat_ti_le, 1), so(-B.quan1_giam, 1)), "sai");
      else bit(hop, L[cau][loai], muc === 2 ? "dung" : muc === 1 ? "" : "sai");
      chu.textContent = EN ? "Data: simulated milk tea chain, Aug-Sep 2026 (video 309)" : "Số liệu: chuỗi trà sữa giả lập, tháng 8-9/2026 (video 309)";
    }
    goc.querySelectorAll("[data-bd-cau]").forEach(function (b) {
      b.addEventListener("click", function () {
        cau = b.dataset.bdCau; loai = null; cat.checked = false;
        goc.querySelectorAll("[data-bd-cau]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        goc.querySelectorAll("[data-bd-loai]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        veLai();
      });
    });
    goc.querySelectorAll("[data-bd-loai]").forEach(function (b) {
      b.addEventListener("click", function () {
        loai = b.dataset.bdLoai;
        goc.querySelectorAll("[data-bd-loai]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var dung = loai === Q[cau].dung;
        if (!(cau in lanDau)) {
          lanDau[cau] = dung;
          var a = 0, n = 0;
          for (var k in lanDau) { n++; if (lanDau[k]) a++; }
          diem.textContent = L.dauTien(a, n);
          do_("du-lieu-bieu-do", { cau: cau, loai: loai, dung: dung ? 1 : 0 });
        }
        veLai();
      });
    });
    cat.addEventListener("change", function () { veLai(); if (cat.checked) do_("du-lieu-cat-truc"); });
    goc.querySelector('[data-bd-cau="nhom"]').setAttribute("aria-pressed", "true");
    veLai();
  }

  /* ---------- Trạm 2: ngưỡng gửi voucher (346) ---------- */
  function khoiNguong() {
    var N = D.nguong, K = N.khach, svg = $("ng-ve"), tr = $("ng-nguong"), soEl = $("ng-nguong-so"), bang = $("ng-bang"), thanh = $("ng-thanh");
    var gia = $("ng-gia"), giaKhach = $("ng-khach"), loiEl = $("ng-loi");
    var W = 640, H = 200, X0 = 30, X1 = 610;
    var tongBo = K.filter(function (k) { return k.bo; }).length;
    // Xếp chấm kiểu bầy ong: giữ đúng vị trí ngang theo xác suất, chấm nào chạm chấm đã xếp thì đẩy lên/xuống
    var cham = [];
    K.slice().sort(function (a, b) { return a.p - b.p; }).forEach(function (k) {
      var x = X0 + (X1 - X0) * k.p;
      for (var j = 0; j < 30; j++) {
        var y = 100 + Math.ceil(j / 2) * (j % 2 ? -12.5 : 12.5);
        if (!cham.some(function (c) { return (c.x - x) * (c.x - x) + (c.y - y) * (c.y - y) < 144; })) { cham.push({ k: k, x: x, y: y }); return; }
      }
      cham.push({ k: k, x: x, y: 100 });
    });
    function tinh(t) {
      var tp = 0, fp = 0, fn = 0, tn = 0;
      K.forEach(function (k) { var g = k.p >= t - 1e-9; if (g && k.bo) tp++; else if (g) fp++; else if (k.bo) fn++; else tn++; });
      return { tp: tp, fp: fp, fn: fn, tn: tn, gui: tp + fp, pre: tp + fp ? tp / (tp + fp) : null, rec: tp / tongBo };
    }
    function loi(r) { return r.tp * (+giaKhach.value || 0) - r.gui * (+gia.value || 0); }
    var L = EN ? {
      gui: "Vouchers sent", bat: "Leavers caught", nham: "Sent to stayers", sot: "Leavers missed",
      cuaBo: function (n) { return "of " + n + " who left"; }, kh: "customers",
      loi: function (v, tp, gui) { return (v >= 0 ? "Estimated gain: " : "Estimated loss: ") + so(Math.abs(v)) + " VND (keep " + tp + " customers, pay for " + gui + " vouchers)."; },
      truc: "chance of leaving", o: "stays", b: "leaves", tot: function (t) { return "Most profitable here: threshold " + so(t, 2) + "."; }
    } : {
      gui: "Gửi voucher", bat: "Bắt đúng khách bỏ", nham: "Gửi nhầm khách ở lại", sot: "Bỏ sót khách bỏ",
      cuaBo: function (n) { return "trên " + n + " khách bỏ"; }, kh: "khách",
      loi: function (v, tp, gui) { return (v >= 0 ? "Lời ước tính: " : "Lỗ ước tính: ") + so(Math.abs(v)) + " đ (giữ " + tp + " khách, trả " + gui + " voucher)."; },
      truc: "xác suất bỏ quán", o: "ở lại", b: "bỏ quán", tot: function (t) { return "Lời nhất với giá này: ngưỡng " + so(t, 2) + "."; }
    };
    function veLai() {
      var t = +tr.value, r = tinh(t);
      soEl.textContent = so(t, 2);
      xoa(svg);
      var xt = X0 + (X1 - X0) * t;
      ve("rect", { x: xt, y: 20, width: X1 + 10 - xt, height: 152, "class": "pdl-vung" }, svg);
      var g = ve("g", { "class": "pdl-truc" }, svg);
      ve("line", { x1: X0, x2: X1, y1: 176, y2: 176 }, g);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { ve("text", { x: X0 + (X1 - X0) * v, y: 192, "text-anchor": "middle" }, g, so(v, 2)); });
      ve("text", { x: X1, y: 14, "text-anchor": "end", "class": "pdl-nhan" }, svg, "→ " + L.truc);
      cham.forEach(function (c) {
        var gui = c.k.p >= t - 1e-9;
        var e = ve("circle", { cx: c.x, cy: c.y, r: 5.5, "class": "pdl-cham " + (c.k.bo ? "is-bo" : "is-o") + (gui ? " is-gui" : "") }, svg);
        ve("title", {}, e, c.k.ma + " · " + pt(c.k.p, 0) + " · " + (c.k.bo ? L.b : L.o));
      });
      ve("line", { x1: xt, x2: xt, y1: 18, y2: 176, "class": "pdl-vach" }, svg);
      ve("circle", { cx: xt, cy: 18, r: 6, "class": "pdl-vach-dau" }, svg);
      svg.setAttribute("aria-label", L.gui + ": " + r.gui);
      o4(bang, [[L.gui, r.gui + " " + L.kh, "is-tim"], [L.cuaBo(tongBo), r.tp, "is-xanh"], [L.nham, r.fp, ""], [L.sot, r.fn, "is-do"]]);
      thanh.innerHTML = [["Precision", r.pre, "#8B5CF6"], ["Recall", r.rec, "#10B981"]].map(function (x) {
        return '<div class="pdl-thanh"><span>' + x[0] + '</span><span class="pdl-thanh-nen"><i style="width:' + ((x[1] || 0) * 100) + "%;background:" + x[2] + '"></i></span><b>' + (x[1] === null ? "—" : so(x[1], 2)) + "</b></div>";
      }).join("");
      loiEl.textContent = L.loi(loi(r), r.tp, r.gui);
    }
    var hen;
    tr.addEventListener("input", function () { veLai(); clearTimeout(hen); hen = setTimeout(function () { do_("du-lieu-nguong", { nguong: tr.value }); }, 800); });
    [gia, giaKhach].forEach(function (e) { e.addEventListener("input", veLai); });
    goc.querySelectorAll("[data-ng-dat]").forEach(function (b) { b.addEventListener("click", function () { tr.value = b.dataset.ngDat; veLai(); }); });
    $("ng-tot").addEventListener("click", function () {
      var tot = 0.5, max = -Infinity;
      for (var t = 0.05; t <= 0.951; t += 0.05) { var v = loi(tinh(+t.toFixed(2))); if (v > max) { max = v; tot = +t.toFixed(2); } }
      tr.value = tot; veLai();
      loiEl.textContent += " " + L.tot(tot);
      do_("du-lieu-nguong-tot", { nguong: tot });
    });
    veLai();
  }

  /* ---------- Trạm 3: học vẹt (348) ---------- */
  function khoiHocVet() {
    var H = D.hoc_vet, C = H.cay, svg = $("hv-ve"), cay = $("hv-cay"), tr = $("hv-sau"), soEl = $("hv-sau-so"), o = $("hv-o"), hop = $("hv-bit"), la = $("hv-la");
    var W = 640, Hh = 260, m = { l: 48, r: 16, t: 20, b: 36 };
    function hep() { var w = svg.getBoundingClientRect().width; m = w && w < 500 ? { l: 70, r: 16, t: 36, b: 40 } : { l: 48, r: 16, t: 20, b: 36 }; }
    var L = EN ? {
      hoc: "Train score", thi: "Test score", chenh: "Gap", la: "Leaves", bua: "always guess “stays”", tuDo: "unlimited",
      nhan: function (d) { return d === C.length ? d + " (unlimited)" : String(d); }, laChu: function (n) { return n + " leaves: " + n + " groups of customers"; },
      thua: function (thi, b) { return "The test score (" + thi + ") is worse than just guessing “stays” every time (" + b + "). The tree is memorizing single customers."; },
      vet: function (g) { return "Clear memorizing: train and test are " + g + " points apart. More questions only fit this training set's noise."; },
      bat: function (g) { return "Starting to memorize: a " + g + "-point gap. The train score keeps rising, the test score doesn't."; },
      tot: "Train and test are close: the tree is learning the general rule (customers who stay away longer leave more).",
      tuDoChu: "The unlimited tree: 13 levels, 53 leaves, 100% on old customers, only 55.9% on new ones."
    } : {
      hoc: "Điểm học", thi: "Điểm thi", chenh: "Chênh", la: "Số lá", bua: "luôn đoán “ở lại”", tuDo: "tự do",
      nhan: function (d) { return d === C.length ? d + " (tự do)" : String(d); }, laChu: function (n) { return n + " lá: chia khách thành " + n + " nhóm"; },
      thua: function (thi, b) { return "Điểm thi (" + thi + ") còn thua cả đoán bừa, tức luôn đoán “ở lại” (" + b + "). Cây đang học thuộc lòng từng khách."; },
      vet: function (g) { return "Học vẹt rõ rồi: điểm học và điểm thi chênh " + g + " điểm. Hỏi thêm câu chỉ khớp với nhiễu của tập học."; },
      bat: function (g) { return "Bắt đầu học vẹt: chênh " + g + " điểm. Điểm học còn lên, điểm thi thì không."; },
      tot: "Điểm học và điểm thi sát nhau: cây đang học quy luật chung (khách vắng càng lâu càng dễ bỏ).",
      tuDoChu: "Cây tự do: sâu 13 tầng, 53 lá, đúng 100% với khách cũ nhưng thi chỉ 55,9%."
    };
    function veLai() {
      var d = +tr.value, r = C[d - 1];
      soEl.textContent = L.nhan(d);
      xoa(svg); hep();
      var Y = khung(svg, W, Hh, m, 0.5, 1, function (v) { return so(v * 100, 0) + "%"; }, 0.1);
      var X = function (i) { return m.l + 14 + (W - m.l - m.r - 28) * i / (C.length - 1); };
      ve("rect", { x: X(d - 1) - 14, y: m.t, width: 28, height: Hh - m.t - m.b, rx: 8, "class": "pdl-cot-chon" }, svg);
      ve("line", { x1: m.l, x2: W - m.r, y1: Y(H.doan_bua), y2: Y(H.doan_bua), "class": "pdl-bua" }, svg);
      ve("text", { x: W - m.r - 4, y: Y(H.doan_bua) + 14, "text-anchor": "end", "class": "pdl-nhan" }, svg, L.bua + " " + pt(H.doan_bua));
      [["hoc", MAU[0]], ["thi", MAU[1]]].forEach(function (k) {
        ve("polyline", { points: C.map(function (c, i) { return X(i) + "," + Y(c[k[0]]); }).join(" "), fill: "none", stroke: k[1], "stroke-width": 3, "stroke-linejoin": "round" }, svg);
        C.forEach(function (c, i) { ve("circle", { cx: X(i), cy: Y(c[k[0]]), r: i === d - 1 ? 7 : 3.5, fill: k[1] }, svg); });
      });
      ve("line", { x1: X(d - 1) + 10, x2: X(d - 1) + 10, y1: Y(r.hoc), y2: Y(r.thi), "class": "pdl-chenh" }, svg);
      C.forEach(function (c, i) { chuGiua(svg, X(i), Hh - m.b + 18, i === C.length - 1 ? "13*" : String(c.sau), "pdl-nhan"); });
      chuGiai(svg, [L.hoc, L.thi], W);
      svg.setAttribute("aria-label", L.hoc + " " + pt(r.hoc) + ", " + L.thi + " " + pt(r.thi));
      o4(o, [[L.hoc, pt(r.hoc), "is-xanh-duong"], [L.thi, pt(r.thi), "is-cam"], [L.chenh, so((r.hoc - r.thi) * 100, 1) + (EN ? " pts" : " điểm"), r.hoc - r.thi > 0.15 ? "is-do" : ""], [L.la, r.la, ""]]);
      var g = so((r.hoc - r.thi) * 100, 1);
      if (d === C.length) bit(hop, L.tuDoChu + " " + L.thua(pt(r.thi), pt(H.doan_bua)), "sai");
      else if (r.thi < H.doan_bua) bit(hop, L.thua(pt(r.thi), pt(H.doan_bua)), "sai");
      else if (r.hoc - r.thi > 0.15) bit(hop, L.vet(g), "sai");
      else if (r.hoc - r.thi > 0.08) bit(hop, L.bat(g), "");
      else bit(hop, L.tot, "dung");
      veCay(d, r.la);
    }
    function veCay(d, soLa) {
      xoa(cay);
      var tang = Math.min(d, 6), W2 = 260, top = 18, buoc = 150 / Math.max(tang, 1);
      // Mỗi tầng tối đa 2^k nút; số lá thật ít hơn nên chỉ tô đậm đủ số lá ở tầng cuối
      for (var k = 0; k <= tang; k++) {
        var n = Math.pow(2, k), y = top + k * buoc;
        for (var i = 0; i < n; i++) {
          var x = W2 * (i + 0.5) / n;
          if (k > 0) ve("line", { x1: W2 * (Math.floor(i / 2) + 0.5) / (n / 2), y1: y - buoc, x2: x, y2: y, "class": "pdl-canh" }, cay);
        }
      }
      for (k = 0; k <= tang; k++) {
        n = Math.pow(2, k); y = top + k * buoc;
        for (i = 0; i < n; i++) {
          x = W2 * (i + 0.5) / n;
          var laCuoi = k === tang;
          ve("circle", { cx: x, cy: y, r: Math.max(2, 7 - k), "class": laCuoi ? "pdl-la" : "pdl-nut" }, cay);
        }
      }
      if (d > 6) chuGiua(cay, W2 / 2, 196, (EN ? "+ " : "+ ") + (d - 6) + (EN ? " more levels…" : " tầng nữa…"), "pdl-nhan");
      la.textContent = L.laChu(soLa);
    }
    var hen;
    tr.addEventListener("input", function () { veLai(); clearTimeout(hen); hen = setTimeout(function () { do_("du-lieu-hoc-vet", { sau: tr.value }); }, 800); });
    veLai();
  }

  /* ---------- Trạm 4: PID (362) ---------- */
  function khoiPid() {
    var svg = $("pid-ve"), o = $("pid-o"), hop = $("pid-bit"), tai = $("pid-tai");
    var num = ["kp", "ki", "kd"].map(function (k) { return $("pid-" + k); });
    var W = 640, H = 280, m = { l: 44, r: 12, t: 22, b: 30 }, cu = null, chay = null;
    function hep() { var w = svg.getBoundingClientRect().width; m = w && w < 500 ? { l: 56, r: 12, t: 22, b: 30 } : { l: 44, r: 12, t: 22, b: 30 }; }
    var L = EN ? {
      vot: "Overshoot", sai: "Final error", hoi: "Back within ±2%", rung: "Voltage shake", khong: "never", muc: "target 10 rad/s", ly: "4 cups",
      chi: "Only P: the wheel never reaches 10 rad/s, there is always some error left. Add I to add up the error over time.",
      dao: function (r) { return "The wheel overshoots " + so(r, 0) + "% and keeps oscillating: the speed reading arrives a few hundredths of a second late. Lower P or add D."; },
      rungM: function (v) { return "Voltage shakes " + so(v, 2) + " V: D (or a big P) amplifies the encoder noise. Every PID setting trades one thing for another."; },
      votM: function (v) { return "Error goes to zero thanks to I, but it still overshoots " + so(v, 1) + "% at the start. Add a little D to brake early."; },
      tot: function (r) { return "Nice: overshoot " + so(r.vot, 1) + "%, back on target " + so(r.hoi || 0, 2) + " s after the cups land, voltage shake " + so(r.rung, 2) + " V."; },
      giay: "seconds", cu: "previous run"
    } : {
      vot: "Vọt lố", sai: "Sai lúc cuối", hoi: "Hồi về ±2%", rung: "Điện áp rung", khong: "không về", muc: "đích 10 rad/s", ly: "đặt 4 ly",
      chi: "Chỉ có P: bánh không bao giờ tới 10 rad/s, luôn còn sai số. Thêm I để cộng dồn sai số theo thời gian.",
      dao: function (r) { return "Bánh vọt lố " + so(r, 0) + "% rồi dao động mãi, vì số đo tốc độ tới trễ vài phần trăm giây. Giảm P hoặc thêm D."; },
      rungM: function (v) { return "Điện áp rung " + so(v, 2) + " V: phần D (hoặc P quá lớn) khuếch đại cả nhiễu của encoder. Chỉnh PID luôn là đổi cái này lấy cái kia."; },
      votM: function (v) { return "Nhờ I nên sai số về 0, nhưng lúc khởi động vẫn vọt lố " + so(v, 1) + "%. Thêm chút D để phanh trước."; },
      tot: function (r) { return "Ổn: vọt lố " + so(r.vot, 1) + "%, hồi về đích " + so(r.hoi || 0, 2) + " giây sau khi đặt ly, điện áp rung " + so(r.rung, 2) + " V."; },
      giay: "giây", cu: "lần trước"
    };
    function nhan() {
      $("pid-kp-so").textContent = so(+num[0].value, 1);
      $("pid-ki-so").textContent = so(+num[1].value, 1);
      $("pid-kd-so").textContent = so(+num[2].value, 3);
    }
    var hTren = 190;
    function Yw(v) { return m.t + hTren * (1 - Math.max(0, Math.min(14, v)) / 14); }
    function Yu(v) { return m.t + hTren + 26 + 30 * (1 - (v + 12) / 24); }
    function X(i) { return m.l + (W - m.l - m.r) * i / 400; }
    function nen() {
      xoa(svg); hep();
      var g = ve("g", { "class": "pdl-truc" }, svg);
      [0, 5, 10].forEach(function (v) { ve("line", { x1: m.l, x2: W - m.r, y1: Yw(v), y2: Yw(v) }, g); ve("text", { x: m.l - 6, y: Yw(v) + 4, "text-anchor": "end" }, g, v); });
      [0, 1, 2, 3, 4].forEach(function (s) { ve("text", { x: X(s * 100), y: H - 6, "text-anchor": s === 4 ? "end" : "middle" }, g, s + (s === 4 ? " " + L.giay : "")); });
      ve("line", { x1: m.l, x2: W - m.r, y1: Yw(10), y2: Yw(10), "class": "pdl-muc" }, svg);
      ve("text", { x: m.l + 4, y: Yw(10) - 6, "class": "pdl-nhan" }, svg, L.muc);
      ve("text", { x: m.l - 6, y: Yu(0) + 4, "text-anchor": "end", "class": "pdl-nhan" }, svg, "V");
      ve("line", { x1: m.l, x2: W - m.r, y1: Yu(0), y2: Yu(0), "class": "pdl-truc-nhat" }, svg);
      if (tai.checked) { ve("line", { x1: X(200), x2: X(200), y1: m.t, y2: Yu(-12), "class": "pdl-tai" }, svg); ve("text", { x: X(200) + 6, y: m.t + 12, "class": "pdl-nhan" }, svg, "☕ " + L.ly); }
      if (cu) ve("polyline", { points: cu.ws.map(function (w, i) { return X(i) + "," + Yw(w); }).join(" "), "class": "pdl-cu" }, svg);
    }
    function chayMoi() {
      var kp = +num[0].value, ki = +num[1].value, kd = +num[2].value, r = TINH.pid(kp, ki, kd, tai.checked);
      nen();
      var dw = ve("polyline", { points: "", fill: "none", stroke: "#10B981", "stroke-width": 3, "stroke-linejoin": "round" }, svg);
      var du = ve("polyline", { points: "", fill: "none", stroke: "#F59E0B", "stroke-width": 1.5 }, svg);
      var i = 0, giam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      cancelAnimationFrame(chay);
      function buoc() {
        i = giam ? 400 : Math.min(400, i + 8);
        dw.setAttribute("points", r.ws.slice(0, i).map(function (w, j) { return X(j) + "," + Yw(w); }).join(" "));
        du.setAttribute("points", r.us.slice(0, i).map(function (u, j) { return X(j) + "," + Yu(u); }).join(" "));
        if (i < 400) chay = requestAnimationFrame(buoc);
      }
      buoc();
      o4(o, [[L.vot, pt(r.vot / 100), r.vot > 10 ? "is-do" : ""], [L.sai, pt(r.saiCuoi / 100), Math.abs(r.saiCuoi) > 2 ? "is-do" : ""],
        [L.hoi, tai.checked ? (r.hoi === null ? L.khong : so(r.hoi, 2) + " s") : "—", r.hoi === null ? "is-do" : ""], [L.rung, so(r.rung, 2) + " V", r.rung > 1 ? "is-do" : ""]]);
      if (Math.abs(r.saiCuoi) > 5 && ki === 0 && r.vot < 10) bit(hop, L.chi, "sai");
      else if (r.vot > 20 && r.rung > 2) bit(hop, L.dao(r.vot), "sai");
      else if (r.rung > 1) bit(hop, L.rungM(r.rung), "");
      else if (r.vot > 8) bit(hop, L.votM(r.vot), "");
      else if (Math.abs(r.saiCuoi) > 2) bit(hop, L.chi, "sai");
      else bit(hop, L.tot(r), "dung");
      svg.setAttribute("aria-label", L.vot + " " + pt(r.vot / 100) + ", " + L.sai + " " + pt(r.saiCuoi / 100));
      cu = r;
      do_("du-lieu-pid-chay", { kp: kp, ki: ki, kd: kd });
    }
    num.forEach(function (n) { n.addEventListener("input", nhan); n.addEventListener("change", chayMoi); });
    $("pid-chay").addEventListener("click", chayMoi);
    tai.addEventListener("change", chayMoi);
    goc.querySelectorAll("[data-pid]").forEach(function (b) {
      b.addEventListener("click", function () { var v = b.dataset.pid.split(","); num.forEach(function (n, i) { n.value = v[i]; }); nhan(); chayMoi(); });
    });
    nhan(); chayMoi();
  }

  /* ---------- Trạm 5: định vị bằng mốc trần (363) ---------- */
  function khoiDinhVi() {
    var BD = D.ban_do, svg = $("dv-ve"), o = $("dv-o"), hop = $("dv-bit"), nutChay = $("dv-chay");
    var MOC = [[1.0, 3.2], [3.5, 3.9], [3.5, 2.0], [6.0, 4.3], [6.0, 2.2], [7.5, 2.8], [2.2, 0.4], [6.3, 0.4]];
    var bat = MOC.map(function () { return true; }), lan = 0, chay = null, kq = null;
    var S = 80;
    function X(x) { return x * S; }
    function Y(y) { return (5 - y) * S; }
    var L = EN ? {
      odo: "Odometry only, end", tb: "EKF average error", max: "EKF worst error", ngoai: "Outside EKF's own circle",
      ket: function (r, n) { return "With " + n + " of 8 markers: odometry ends " + so(r.odoCuoi, 2) + " m off, EKF averages " + so(r.ekfTb * 100, 1) + " cm (worst " + so(r.ekfMax * 100, 1) + " cm). The video, with all 8 and an honest setting: 2.9 m vs 1.8 cm."; },
      khong: "No markers on: EKF has nothing to correct with, so it drifts like odometry. The robot no longer knows where it is.",
      qua: function (p) { return " Over-trusting odometry: EKF claims to be sure within about a centimetre, but the real error is outside that circle " + so(p, 0) + "% of the time."; },
      chay: "Running…"
    } : {
      odo: "Chỉ odometry, lúc cuối", tb: "EKF sai trung bình", max: "EKF sai lớn nhất", ngoai: "Vượt vòng EKF tự báo",
      ket: function (r, n) { return "Với " + n + " trên 8 mốc: odometry cuối buổi lệch " + so(r.odoCuoi, 2) + " m, EKF sai trung bình " + so(r.ekfTb * 100, 1) + " cm (lớn nhất " + so(r.ekfMax * 100, 1) + " cm). Trong video, đủ 8 mốc và khai thật: 2,9 m so với 1,8 cm."; },
      khong: "Tắt hết mốc: EKF không có gì để tự sửa nên trôi y như odometry. Robot không còn biết mình ở đâu.",
      qua: function (p) { return " Khai quá tin odometry: EKF tự báo chắc chắn trong khoảng 1 xăng ti mét, nhưng " + so(p, 0) + "% thời gian sai thật vượt ra ngoài vòng đó."; },
      chay: "Đang chạy…"
    };
    function nen() {
      xoa(svg);
      ve("rect", { x: 0, y: 0, width: 640, height: 400, "class": "pdl-san" }, svg);
      BD.vat.forEach(function (v) {
        ve("rect", { x: X(v[1]), y: Y(v[4]), width: X(v[3] - v[1]), height: (v[4] - v[2]) * S, rx: 4, "class": "pdl-vat" }, svg);
      });
      ve("rect", { x: 2, y: 2, width: 636, height: 396, rx: 6, "class": "pdl-tuong" }, svg);
      MOC.forEach(function (m, i) {
        var g = ve("g", { "class": "pdl-moc" + (bat[i] ? "" : " is-tat"), tabindex: 0, role: "button", "aria-pressed": bat[i] ? "true" : "false", "data-moc": i }, svg);
        ve("title", {}, g, (EN ? "Marker " : "Mốc ") + (i + 1));
        ve("circle", { cx: X(m[0]), cy: Y(m[1]), r: S, "class": "pdl-moc-vung" }, g);
        ve("circle", { cx: X(m[0]), cy: Y(m[1]), r: 15, "class": "pdl-moc-o" }, g);
        ve("path", { d: "M" + (X(m[0]) - 8) + " " + Y(m[1]) + "h16M" + X(m[0]) + " " + (Y(m[1]) - 8) + "v16", "class": "pdl-moc-dau" }, g);
      });
    }
    function gan() {
      svg.querySelectorAll("[data-moc]").forEach(function (g) {
        function doi() { var i = +g.dataset.moc; bat[i] = !bat[i]; nen(); gan(); if (kq) veDuong(kq, kq.log.length); }
        g.addEventListener("click", doi);
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doi(); } });
      });
    }
    function veDuong(r, n) {
      [].slice.call(svg.querySelectorAll(".pdl-dv")).forEach(function (e) { e.remove(); });
      var g = ve("g", { "class": "pdl-dv" }, svg), ds = r.log.slice(0, n);
      [[1, 2, "k-that"], [3, 4, "k-odo"], [5, 6, "k-ekf"]].forEach(function (c) {
        ve("polyline", { points: ds.filter(function (_, i) { return i % 2 === 0 || i === n - 1; }).map(function (d) { return X(d[c[0]]) + "," + Y(d[c[1]]); }).join(" "), "class": "pdl-dv-" + c[2] }, g);
      });
      var c = ds[ds.length - 1];
      ve("circle", { cx: X(c[5]), cy: Y(c[6]), r: Math.max(4, c[7] * S * 4), "class": "pdl-dv-vong" }, g);
      ve("circle", { cx: X(c[1]), cy: Y(c[2]), r: 10, "class": "pdl-dv-robot" }, g);
      ve("circle", { cx: X(c[3]), cy: Y(c[4]), r: 5, "class": "pdl-dv-odo-dau" }, g);
    }
    function chayMoi() {
      var q = goc.querySelector('input[name="dv-q"]:checked').value === "qua" ? [0.02, 0.02, 0.01] : [0.1, 0.1, 0.05];
      lan++;
      var r = TINH.dinhVi(MOC, bat, q, 363 + lan * 7919);
      kq = r;
      var n = 0, giam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      cancelAnimationFrame(chay);
      nutChay.disabled = true;
      function buoc() {
        n = giam ? r.log.length : Math.min(r.log.length, n + 14);
        veDuong(r, n);
        if (n < r.log.length) chay = requestAnimationFrame(buoc);
        else { nutChay.disabled = false; ketQua(r, q); }
      }
      buoc();
      do_("du-lieu-dinh-vi-chay", { moc: bat.filter(Boolean).length, q: q[0] });
    }
    function ketQua(r, q) {
      var soMoc = bat.filter(Boolean).length;
      o4(o, [[L.odo, so(r.odoCuoi, 2) + " m", "is-do"], [L.tb, so(r.ekfTb * 100, 1) + " cm", "is-xanh"], [L.max, so(r.ekfMax * 100, 1) + " cm", ""], [L.ngoai, so(r.ngoai, 0) + "%", r.ngoai > 50 ? "is-do" : ""]]);
      if (!soMoc) bit(hop, L.khong, "sai");
      else bit(hop, L.ket(r, soMoc) + (q[0] < 0.05 ? L.qua(r.ngoai) : ""), r.ekfMax > 0.3 ? "sai" : q[0] < 0.05 ? "" : "dung");
      svg.setAttribute("aria-label", L.ket(r, soMoc));
    }
    nutChay.addEventListener("click", chayMoi);
    $("dv-4").addEventListener("click", function () { bat = MOC.map(function (_, i) { return i % 2 === 0; }); nen(); gan(); chayMoi(); });
    $("dv-8").addEventListener("click", function () { bat = MOC.map(function () { return true; }); nen(); gan(); chayMoi(); });
    goc.querySelectorAll('input[name="dv-q"]').forEach(function (e) { e.addEventListener("change", chayMoi); });
    nen(); gan(); chayMoi();
  }

  /* ---------- Trạm 6: bản đồ và A* (364) ---------- */
  function khoiASao() {
    var BD = D.ban_do, cv = $("as-ve"), ctx = cv.getContext("2d"), o = $("as-o"), hop = $("as-bit"), chua = $("as-chua");
    var NX = BD.nx, NY = BD.ny, RES = BD.res;
    var CO0 = TINH.docHex(BD.co, NX), CHUA0 = TINH.docHex(BD.chua, NX), co, chuaB;
    var COT = [52, 48, 8];                              // cây cột: ô (52, 48), 8 x 8 ô (2,6-3,0 m; 2,4-2,8 m)
    var nguoi = [], banChon = "2", kq = null, chay = null;
    function oCua(x, y) { return [Math.floor(x / RES), Math.floor(y / RES)]; }
    var L = EN ? {
      dai: "Route length", mo: "Cells explored", thang: "Straight line", so: "A* vs Dijkstra",
      chan: function (b) { return "Table " + b + " is cut off: with this much padding there's no room for the robot to get there. Lower the margin or move what's in the way."; },
      ket: function (a, d, dai, b) { return "To table " + b + ": a " + so(dai, 2) + " m route. A* opened " + so(a) + " cells, Dijkstra " + so(d) + " for the same shortest route, because A* always heads toward the goal first."; },
      video: function (v) { return " Video 364: " + so(v.a[0], 2) + " m, A* " + so(v.a[1]) + " cells, Dijkstra " + so(v.d[1]) + "."; },
      ban: "Table", m: "m"
    } : {
      dai: "Đường đi dài", mo: "Ô đã mở", thang: "Đường chim bay", so: "A* so với Dijkstra",
      chan: function (b) { return "Bàn " + b + " bị chặn: phình vật cản tới mức này thì không còn chỗ cho robot tới. Giảm phần chừa hoặc dời thứ đang chắn."; },
      ket: function (a, d, dai, b) { return "Tới bàn " + b + ": đường dài " + so(dai, 2) + " m. A* mở " + so(a) + " ô, Dijkstra mở " + so(d) + " ô cho cùng đường ngắn nhất, vì A* luôn lao về phía đích trước."; },
      video: function (v) { return " Video 364: " + so(v.a[0], 2) + " m, A* mở " + so(v.a[1]) + " ô, Dijkstra " + so(v.d[1]) + " ô."; },
      ban: "Bàn", m: "m"
    };
    function datLai() {
      co = new Uint8Array(CO0); chuaB = new Uint8Array(CHUA0); nguoi = []; COT = [52, 48, 8];
    }
    function doiCot(ix, iy) {
      for (var y = 46; y < 58; y++) for (var x = 50; x < 62; x++) if (!(x === 0 || y === 0)) { co[y * NX + x] = 0; chuaB[y * NX + x] = 0; }
      var cu = COT; COT = [Math.max(1, Math.min(NX - 9, ix - 4)), Math.max(1, Math.min(NY - 9, iy - 4)), 8];
      if (cu[0] !== 52 || cu[1] !== 48) for (y = cu[1]; y < cu[1] + 8; y++) for (x = cu[0]; x < cu[0] + 8; x++) co[y * NX + x] = 0;
      for (y = COT[1]; y < COT[1] + 8; y++) for (x = COT[0]; x < COT[0] + 8; x++) co[y * NX + x] = 1;
    }
    function mau(ten) { return getComputedStyle(cv).getPropertyValue(ten).trim() || "#888"; }
    function cam() {
      var tho = new Uint8Array(NX * NY);
      for (var i = 0; i < tho.length; i++) tho[i] = co[i] || chuaB[i] ? 1 : 0;
      nguoi.forEach(function (p) {
        for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++)
          if (dx * dx + dy * dy <= 16) { var x = p[0] + dx, y = p[1] + dy; if (x >= 0 && x < NX && y >= 0 && y < NY) tho[y * NX + x] = 1; }
      });
      return { tho: tho, cam: TINH.phinh(tho, NX, NY, 0.25 + (+chua.value) / 100, RES) };
    }
    function ve_(m, moDen, r) {
      var c = 4, W = NX * c, H = NY * c;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = mau("--pdl-san"); ctx.fillRect(0, 0, W, H);
      for (var iy = 0; iy < NY; iy++) for (var ix = 0; ix < NX; ix++) {
        var i = iy * NX + ix, mauO = null;
        if (co[i] || (m.tho[i] && !chuaB[i])) mauO = mau("--pdl-vat");
        else if (chuaB[i]) mauO = mau("--pdl-chua");
        else if (m.cam[i]) mauO = mau("--pdl-phinh");
        if (mauO) { ctx.fillStyle = mauO; ctx.fillRect(ix * c, H - (iy + 1) * c, c, c); }
      }
      if (r && r.mo) {
        ctx.fillStyle = mau("--pdl-mo");
        for (var j = 0; j < Math.min(moDen, r.mo.length); j++) { var k = r.mo[j]; ctx.fillRect((k % NX) * c, H - (Math.floor(k / NX) + 1) * c, c, c); }
      }
      if (r && r.duong && moDen >= r.mo.length) {
        ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.beginPath();
        r.duong.forEach(function (k, j) { var x = (k % NX + 0.5) * c, y = H - (Math.floor(k / NX) + 0.5) * c; if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
      var d = oCua(BD.dock[0], BD.dock[1]);
      ctx.fillStyle = "#10B981"; ctx.beginPath(); ctx.arc((d[0] + 0.5) * c, H - (d[1] + 0.5) * c, 9, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R", (d[0] + 0.5) * c, H - (d[1] + 0.5) * c);
      Object.keys(BD.ban).forEach(function (b) {
        var p = oCua(BD.ban[b][0], BD.ban[b][1]), x = (p[0] + 0.5) * c, y = H - (p[1] + 0.5) * c;
        ctx.fillStyle = b === banChon ? "#EF4444" : mau("--pdl-chu");
        ctx.beginPath(); ctx.arc(x, y, b === banChon ? 10 : 8, 0, 7); ctx.fill();
        ctx.fillStyle = b === banChon ? "#fff" : mau("--pdl-san"); ctx.fillText(b, x, y + 0.5);
      });
    }
    function tim(hoat) {
      var m = cam(), s = oCua(BD.dock[0], BD.dock[1]), dd = oCua(BD.ban[banChon][0], BD.ban[banChon][1]);
      var coH = goc.querySelector('input[name="as-cach"]:checked').value === "a";
      var r = TINH.aSao(m.cam, NX, NY, s, dd, coH, RES), khac = TINH.aSao(m.cam, NX, NY, s, dd, !coH, RES);
      var aR = coH ? r : khac, dR = coH ? khac : r;
      kq = r;
      cancelAnimationFrame(chay);
      var n = 0, giam = !hoat || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), moi = Math.max(20, Math.ceil(r.mo.length / 50));
      function buoc() { n = giam ? r.mo.length : n + moi; ve_(m, n, r); if (n < r.mo.length) chay = requestAnimationFrame(buoc); }
      buoc();
      var thang = Math.hypot(BD.ban[banChon][0] - BD.dock[0], BD.ban[banChon][1] - BD.dock[1]);
      if (!r.duong) {
        o4(o, [[L.dai, "—", "is-do"], [L.mo, so(r.mo.length), ""], [L.thang, so(thang, 2) + " m", ""], [L.so, "—", ""]]);
        bit(hop, L.chan(banChon), "sai");
      } else {
        o4(o, [[L.dai, so(r.dai, 2) + " m", "is-tim"], [L.mo, so(r.mo.length), "is-cam"], [L.thang, so(thang, 2) + " m", ""], [L.so, so(aR.mo.length) + " / " + so(dR.mo.length), "is-xanh"]]);
        var nguyen = !nguoi.length && COT[0] === 52 && COT[1] === 48 && +chua.value === 10, v = BD.video[banChon];
        bit(hop, L.ket(aR.mo.length, dR.mo.length, r.dai, banChon) + (nguyen && v ? L.video(v) : ""), "dung");
      }
      cv.setAttribute("aria-label", (r.duong ? L.dai + " " + so(r.dai, 2) + " m, " : "") + L.mo + " " + r.mo.length);
    }
    function bam(e) {
      var hc = cv.getBoundingClientRect(), x = (e.clientX - hc.left) / hc.width * 8, y = 5 - (e.clientY - hc.top) / hc.height * 5;
      var p = oCua(x, y);
      if (goc.querySelector('input[name="as-bam"]:checked').value === "cot") doiCot(p[0], p[1]);
      else nguoi.push(p);
      tim(true);
      do_("du-lieu-a-sao-bam", { kieu: goc.querySelector('input[name="as-bam"]:checked').value });
    }
    cv.addEventListener("click", bam);
    goc.querySelectorAll("[data-as-ban]").forEach(function (b) {
      b.addEventListener("click", function () {
        banChon = b.dataset.asBan;
        goc.querySelectorAll("[data-as-ban]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        tim(true); do_("du-lieu-a-sao", { ban: banChon });
      });
    });
    goc.querySelectorAll('input[name="as-cach"]').forEach(function (e) { e.addEventListener("change", function () { tim(true); }); });
    chua.addEventListener("input", function () { $("as-chua-so").textContent = chua.value + " cm"; });
    chua.addEventListener("change", function () { tim(false); });
    $("as-lai").addEventListener("click", function () { datLai(); tim(false); });
    window.addEventListener("mhai-theme", function () { if (kq) tim(false); });
    datLai();
    $("as-chua-so").textContent = chua.value + " cm";
    goc.querySelector('[data-as-ban="2"]').setAttribute("aria-pressed", "true");
    tim(true);
  }

  var KHOI = { "bieu-do": khoiBieuDo, "nguong": khoiNguong, "hoc-vet": khoiHocVet, "pid": khoiPid, "dinh-vi": khoiDinhVi, "a-sao": khoiASao };
  var m = /[?&]tram=([\w-]+)/.exec(location.search), h = location.hash.replace("#", "");
  var dau = (m && m[1]) || ($("tram-" + h) ? h : "") || "bieu-do";
  moTram(dau, false);
})();

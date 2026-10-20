// Game "Đêm lái xe" (dem-lai-xe.html + en/dem-lai-xe.html): lái xe tự hành về nhà qua nắng, đêm, mưa, sương.
// Bài học nằm trong luật chơi (video 5, 5.1-5.7 "Ba con mắt của AI"): mỗi lúc chỉ bật được một con mắt (LiDAR, radar
// hoặc camera). Vật cản hiện rõ, mờ hay tàng hình theo đúng bảng mức nhận biết của data/cam-bien.json ("muc":
// 2 rõ, 1 mờ, 0 không biết), trang nhúng bảng đó vào #dx-du-lieu. Camera là con mắt duy nhất đọc được màu đèn.
// Khung chơi (toàn màn hình nằm ngang trên điện thoại, mẹo "Thêm vào MH chính", màn chọn / kết quả) theo kiểu
// phieu-luu.js và dùng lại CSS .pl của style.css; CSS riêng ở assets/tro-choi/dem-lai-xe.css.
// Tiến độ lưu ở localStorage "mhai-dem-lai-xe-1" ({sao: {id màn: 1-3}}).
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var KHOA = "mhai-dem-lai-xe-1";
  var CAO = 540, BUOC = 1 / 120, D0 = 10, LAN = 3.5, VMAX = 22, XE_MAY_V = 9;
  var TAM = [12, 45, 110]; // tầm nhìn (m) theo mức 0, 1, 2
  var MAT = ["lidar", "radar", "camera"];
  var MAU_MAT = {lidar: "#38BDF8", radar: "#FACC15", camera: "#F8FAFC"};

  var T = EN ? {
    canvas: "Game screen", chon: "Choose a drive", chonTxt: "A self-driving car can switch on one eye at a time. Pick the right one whenever the weather changes, or obstacles turn invisible.",
    sapCo: "Coming soon", khoa: "This drive opens in the full game.", man: "Drive",
    chang: function (i, n, ten) { return "Leg " + i + "/" + n + " · " + ten; },
    tt: {nang: "Sunny day", dem: "Night", mua: "Heavy rain", suong: "Thick fog"},
    trong: {nang: "on a sunny day", dem: "at night", mua: "in the rain", suong: "in the fog"},
    vat: {nguoi: "the pedestrian", xe: "the motorbike", den: "the light colour"},
    mo: "only saw a blur of", khong: "couldn't see", trungRo: "You saw it clearly: switch lanes a little earlier.",
    doDen: function (cb) { return cb === "camera" ? "The light was red: hold Brake to stop." : "Ran a red light: " + cb + " can't read light colours."; },
    goiY: {nang: "Plenty of light: which eye can also see the colour of traffic lights?",
      dem: "No streetlights: which eye brings its own light?",
      mua: "Traffic lights ahead: only one eye can read red or green.",
      suong: "Fog scatters light: which eye uses radio waves?"},
    bat: function (cb) { return "Bit: switch on " + cb + "!"; },
    vi: {nang: "Bright enough: the camera sees people, vehicles and light colours clearly.",
      dem: "LiDAR fires its own laser, so a person in dark clothes is clear at night.",
      mua: "Only the camera reads red or green. Traffic lights glow, so rain doesn't stop it.",
      suong: "Radio waves pass through fog: radar spots the motorbike and its speed."},
    hopNhat: "Best eye", banBat: "You used", phut: "%",
    thang: "Home safe!", thangTxt: function (r, n, tim) { return "Saw " + r + " of " + n + " obstacles clearly · " + tim + (tim === 1 ? " heart" : " hearts") + " left"; },
    thua: "The car had to stop", thuaTxt: "Bit says: every eye has a weak spot. Look at which one suits each weather, then drive again.",
    lai: "Drive again", veChon: "Drives", xemVideo: "Watch the Three eyes of AI series",
    ve: "Home", kmh: "km/h", ro: function (r, n) { return "Clear " + r + "/" + n; },
    toanVao: "Play full screen", toanRa: "Exit full screen", dong: "Close", menu: "☰ Drives",
    meoIos: "iPhone tip: tap Share, then “Add to Home Screen”. Open the game from that icon to play without Safari’s bars.",
    tongSao: function (s) { return s + " / 3 stars"; }, xoa: "Reset progress", xoaHoi: "Reset your stars?",
    choi: "Start driving", tinhNang: "Test build: drive 1 of 4"
  } : {
    canvas: "Màn hình game", chon: "Chọn chuyến xe", chonTxt: "Xe tự lái mỗi lúc chỉ bật được một con mắt. Trời đổi thì đổi đúng mắt, chọn sai là vật cản tàng hình.",
    sapCo: "Sắp có", khoa: "Chuyến này mở ở bản đầy đủ.", man: "Chuyến",
    chang: function (i, n, ten) { return "Chặng " + i + "/" + n + " · " + ten; },
    tt: {nang: "Trời nắng", dem: "Ban đêm", mua: "Mưa to", suong: "Sương mù dày"},
    trong: {nang: "lúc trời nắng", dem: "trong đêm", mua: "trong mưa", suong: "trong sương"},
    vat: {nguoi: "người đi bộ", xe: "xe máy", den: "màu đèn"},
    mo: "chỉ thấy mờ", khong: "không thấy", trungRo: "Thấy rõ rồi mà vẫn đụng: đổi làn sớm hơn chút nhé.",
    doDen: function (cb) { return cb === "camera" ? "Đèn đang đỏ: giữ nút Phanh để dừng." : "Vượt đèn đỏ: " + cb + " không đọc được màu đèn."; },
    goiY: {nang: "Trời đủ sáng: con mắt nào thấy được cả màu đèn?",
      dem: "Đêm không đèn đường: con mắt nào tự mang ánh sáng theo?",
      mua: "Phía trước nhiều đèn giao thông: chỉ một con mắt đọc được màu.",
      suong: "Sương làm tia sáng tán loạn: con mắt nào dùng sóng radio?"},
    bat: function (cb) { return "Bit: bật " + cb + " đi!"; },
    vi: {nang: "Đủ sáng: camera thấy rõ người, xe và màu đèn.",
      dem: "LiDAR tự bắn tia laser nên đêm vẫn thấy rõ người mặc áo tối.",
      mua: "Chỉ camera đọc được đèn đỏ hay xanh. Đèn tự phát sáng nên mưa vẫn đọc ra.",
      suong: "Sóng radio đi xuyên sương: radar thấy xe máy và đo được tốc độ."},
    hopNhat: "Hợp nhất", banBat: "Bạn bật", phut: "%",
    thang: "Về đến nhà an toàn!", thangTxt: function (r, n, tim) { return "Thấy rõ " + r + "/" + n + " vật cản · còn " + tim + " tim"; },
    thua: "Xe phải dừng lại", thuaTxt: "Bit nhắn: con mắt nào cũng có điểm yếu. Xem mắt nào hợp với từng kiểu trời rồi lái lại nhé.",
    lai: "Lái lại", veChon: "Chọn chuyến", xemVideo: "Xem series Ba con mắt của AI",
    ve: "Về nhà", kmh: "km/h", ro: function (r, n) { return "Thấy rõ " + r + "/" + n; },
    toanVao: "Chơi toàn màn hình", toanRa: "Thoát toàn màn hình", dong: "Đóng", menu: "☰ Chọn chuyến",
    meoIos: "Mẹo iPhone: bấm nút Chia sẻ rồi chọn “Thêm vào MH chính”. Mở game từ biểu tượng đó sẽ không còn thanh Safari che.",
    tongSao: function (s) { return s + " / 3 sao"; }, xoa: "Chơi lại từ đầu", xoaHoi: "Xóa số sao đã có?",
    choi: "Bắt đầu lái", tinhNang: "Bản chơi thử: chuyến 1/4"
  };

  // Chuyến xe. chang: các chặng nối nhau; dai: dài (m); tot: con mắt hợp nhất của chặng (cho lời gợi ý và bảng kết quả);
  // vat: [loại, cách đầu chặng (m), làn 0-2 hoặc màu đèn "do"/"xanh"]. Làn được lật trái phải ngẫu nhiên mỗi lượt.
  var CHUYEN = [
    {id: "ve-nha", ten: EN ? "The drive home" : "Đường về nhà", mo: true, chang: [
      {tt: "nang", dai: 420, tot: "camera", video: "5.2", vat: [["nguoi", 110, 1], ["xe", 190, 0], ["den", 280, "do"], ["nguoi", 360, 2]]},
      {tt: "dem", dai: 460, tot: "lidar", video: "5", vat: [["nguoi", 90, 0], ["nguoi", 165, 2], ["nguoi", 240, 1], ["xe", 310, 2], ["nguoi", 390, 0]]},
      {tt: "mua", dai: 460, tot: "camera", video: "5.2", vat: [["den", 100, "do"], ["xe", 190, 1], ["den", 270, "xanh"], ["den", 370, "do"]]},
      {tt: "suong", dai: 500, tot: "radar", video: "5.1", vat: [["xe", 90, 1], ["xe", 170, 0], ["nguoi", 250, 2], ["xe", 330, 2], ["xe", 420, 1]]}
    ]},
    {id: "nga-tu-mua", ten: EN ? "Rainy junctions" : "Ngã tư mưa", mo: false},
    {id: "cao-toc-suong", ten: EN ? "Foggy highway" : "Cao tốc sương", mo: false},
    {id: "trum", ten: EN ? "Boss: fuse two eyes" : "Trùm: ghép 2 mắt", mo: false}
  ];

  var $ = function (s, g) { return (g || document).querySelector(s); };
  var D = {}, tienDo = docTienDo();
  var cv, ctx, khung, man, rongNhin = 960, tiLe = 1, anh = {}, raf = 0, truoc = 0, du = 0;
  var phim = {phanh: false}, L = null, trangThai = "chon"; // chon | choi | xong
  var DIEM = {}; // điểm mẫu cho LiDAR theo loại vật

  function docTienDo() {
    try { var v = JSON.parse(localStorage.getItem(KHOA)); if (v && v.sao) return v; } catch (e) {}
    return {sao: {}};
  }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function tongSao() { var s = 0; for (var k in tienDo.sao) s += tienDo.sao[k]; return s; }
  function saoChu(s) { return "★★★".slice(0, s) + "☆☆☆".slice(s); }
  function tenMat(cb) { return (D.ten && D.ten[cb]) || cb; }

  // Mức nhận biết của con mắt cb với vật o trong trời tt. Xe máy: lấy mức cao hơn giữa "thấy người" và "đo tốc độ".
  function mucCua(cb, o, tt) {
    var m = D.muc[cb];
    if (o.loai === "nguoi") return m.nguoi[tt];
    if (o.loai === "xe") return Math.max(m.nguoi[tt], m.toc_do[tt]);
    return m.den[tt];
  }

  // ---------- Dựng chuyến ----------
  function dungChuyen(i) {
    var c = CHUYEN[i], lat = Math.random() < 0.5, dau = 40, vat = [], chang = [];
    c.chang.forEach(function (ch, k) {
      chang.push({tt: ch.tt, tot: ch.tot, video: ch.video, tu: dau, den: dau + ch.dai, tg: {lidar: 0, radar: 0, camera: 0}, trung: 0, goiY: false});
      ch.vat.forEach(function (v) {
        var o = {loai: v[0], s: dau + v[1], chang: k, ghi: -1, trung: false, qua: false};
        if (v[0] === "den") { o.mau = v[2]; o.x = 0; o.cho = 0; }
        else { var lan = lat ? 2 - v[2] : v[2]; o.x = (lan - 1) * LAN; }
        vat.push(o);
      });
      dau += ch.dai;
    });
    L = {i: i, c: c, s: 0, v: 0, x: 0, lan: 1, mat: "camera", tim: 3, chang: chang, ck: -1, vat: vat, het: dau + 30,
      bao: null, rung: 0, mien: 0, t: 0, mua: [], nhatKy: [], xong: false};
    for (var k = 0; k < 90; k++) L.mua.push({x: Math.random(), y: Math.random(), v: 0.9 + Math.random() * 0.6});
  }

  function doiLan(h) {
    if (trangThai !== "choi") return;
    L.lan = Math.max(0, Math.min(2, L.lan + h));
  }
  function chonMat(cb) {
    if (MAT.indexOf(cb) < 0) return;
    if (L) L.mat = cb;
    document.querySelectorAll("#dx-dk [data-cb]").forEach(function (b) {
      var bat = b.dataset.cb === cb;
      b.classList.toggle("is-bat", bat); b.setAttribute("aria-pressed", bat ? "true" : "false");
    });
  }

  function hienBit(chu, lau) {
    var b = $("#dx-bit");
    $("#dx-bit-chu").textContent = chu; b.hidden = false;
    clearTimeout(hienBit.h); hienBit.h = setTimeout(function () { b.hidden = true; }, lau || 4200);
  }

  function biTrung(o, lyDo) {
    if (L.mien > 0) return;
    L.tim--; L.rung = 0.45; L.mien = 1.2; L.v = Math.min(L.v, 8);
    L.chang[o.chang].trung++;
    L.nhatKy.push(lyDo);
    L.bao = {chu: lyDo, t: 2.6, nho: true};
    var ch = L.chang[o.chang];
    if (ch.trung >= 2 && L.mat !== ch.tot) hienBit(T.bat(tenMat(ch.tot)));
    if (navigator.vibrate) try { navigator.vibrate(120); } catch (e) {}
    if (L.tim <= 0) { L.xong = true; setTimeout(thuaChuyen, 900); }
  }

  function lyDoTrung(o) {
    var ch = L.chang[o.chang], m = mucCua(L.mat, o, ch.tt);
    if (o.loai === "den") return T.doDen(tenMat(L.mat));
    if (m === 2) return T.trungRo;
    var cau = tenMat(L.mat) + " " + (m === 1 ? T.mo : T.khong) + " " + T.vat[o.loai] + " " + T.trong[ch.tt];
    return cau.charAt(0).toUpperCase() + cau.slice(1) + ".";
  }

  // ---------- Cập nhật ----------
  function capNhat(dt) {
    L.t += dt;
    if (L.xong) { L.v = Math.max(0, L.v - 30 * dt); L.s += L.v * dt; return; }
    L.v += (phim.phanh ? -38 : 9) * dt;
    L.v = Math.max(0, Math.min(VMAX, L.v));
    L.s += L.v * dt;
    var dich = (L.lan - 1) * LAN, dx = dich - L.x, b = 15 * dt;
    L.x += Math.abs(dx) < b ? dx : (dx > 0 ? b : -b);
    if (L.rung > 0) L.rung -= dt;
    if (L.mien > 0) L.mien -= dt;
    if (L.bao && (L.bao.t -= dt) <= 0) L.bao = null;

    // Sang chặng mới: báo kiểu trời; nếu đang bật con mắt kém thì Bit gợi ý bằng một câu hỏi.
    var ck = -1;
    L.chang.forEach(function (ch, k) { if (L.s >= ch.tu - 30) ck = k; });
    if (ck !== L.ck && ck >= 0) {
      L.ck = ck; var ch0 = L.chang[ck];
      L.bao = {chu: T.chang(ck + 1, L.chang.length, T.tt[ch0.tt]), t: 2.4};
      ch0.henGoiY = L.t + 2.6;
    }
    if (L.ck >= 0) {
      var ch = L.chang[L.ck];
      if (L.s >= ch.tu) ch.tg[L.mat] += dt;
      if (!ch.goiY && L.t >= ch.henGoiY) { ch.goiY = true; if (L.mat !== ch.tot) hienBit(T.goiY[ch.tt], 5200); }
    }

    L.vat.forEach(function (o) {
      if (o.qua) return;
      var tt = L.chang[o.chang].tt;
      if (o.loai === "xe") o.s += XE_MAY_V * dt;
      var d = o.s - L.s;
      if (o.ghi < 0 && d <= 55) o.ghi = mucCua(L.mat, o, tt);
      if (o.loai === "den") {
        if (o.mau === "do" && d > 0 && d < 36 && L.v < 1) { o.cho += dt; if (o.cho > 1) o.mau = "xanh"; }
        if (d <= 0) { o.qua = true; if (o.mau === "do" && L.v > 2) biTrung(o, lyDoTrung(o)); }
        return;
      }
      if (!o.trung && Math.abs(d) < 1.9 && Math.abs(o.x - L.x) < 1.25) { o.trung = true; biTrung(o, lyDoTrung(o)); }
      if (d < -6) o.qua = true;
    });
    if (L.s >= L.het - 30 && !L.xong) { L.xong = true; setTimeout(thangChuyen, 700); }
  }

  // ---------- Vẽ ----------
  var CHU = '"Be Vietnam Pro", Inter, system-ui, sans-serif';
  var NEN = {
    nang: {troi: ["#7DD3FC", "#E0F2FE"], dat: "#4D7C0F", duong: "#475569"},
    dem: {troi: ["#020617", "#1E1B4B"], dat: "#0B1220", duong: "#1F2937"},
    mua: {troi: ["#1E293B", "#475569"], dat: "#1E293B", duong: "#334155"},
    suong: {troi: ["#94A3B8", "#CBD5E1"], dat: "#64748B", duong: "#475569"}
  };
  var y0, cx, PX;
  function chieu(d, xm) {
    var p = D0 / (Math.max(d, -D0 * 0.6) + D0);
    return {x: cx + xm * p * PX, y: y0 + (CAO - y0) * p, p: p};
  }
  function ttHienTai() { return L && L.ck >= 0 ? L.chang[L.ck].tt : "nang"; }
  function hinhTron(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function ve() {
    if (!ctx) return;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    y0 = CAO * 0.38; cx = rongNhin / 2; PX = Math.min(rongNhin * 0.085, CAO * 0.17);
    var tt = ttHienTai(), n = NEN[tt], cam = L ? L.s - 3 : 0;
    if (L && L.rung > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6);
    var g = ctx.createLinearGradient(0, 0, 0, y0);
    g.addColorStop(0, n.troi[0]); g.addColorStop(1, n.troi[1]);
    ctx.fillStyle = g; ctx.fillRect(-20, -20, rongNhin + 40, y0 + 20);
    if (tt === "dem") { ctx.fillStyle = "#E2E8F0"; for (var k = 0; k < 40; k++) ctx.fillRect((k * 137.5) % rongNhin, (k * 53) % (y0 - 20), 2, 2); }
    if (tt === "nang") { ctx.fillStyle = "#FDE68A"; ctx.beginPath(); ctx.arc(rongNhin * 0.82, y0 * 0.38, 34, 0, 7); ctx.fill(); }
    ctx.fillStyle = n.dat; ctx.fillRect(-20, y0, rongNhin + 40, CAO - y0 + 20);
    // Mặt đường và vạch làn
    var a = chieu(-4, -5.6), b = chieu(220, -5.6), c2 = chieu(220, 5.6), d2 = chieu(-4, 5.6);
    ctx.fillStyle = n.duong; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.fill();
    ctx.strokeStyle = "rgba(248,250,252,.8)"; ctx.lineWidth = 3;
    [-5.25, 5.25].forEach(function (xm) { var u = chieu(-4, xm), v = chieu(220, xm); ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(v.x, v.y); ctx.stroke(); });
    ctx.fillStyle = tt === "dem" ? "rgba(250,204,21,.55)" : "rgba(250,204,21,.9)";
    for (var s = -(cam % 12) - 12; s < 150; s += 12) {
      [-LAN / 2, LAN / 2].forEach(function (xm) {
        var u = chieu(s, xm - 0.08), v = chieu(s + 5, xm + 0.08);
        ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(chieu(s, xm + 0.08).x, u.y); ctx.lineTo(v.x, v.y); ctx.lineTo(chieu(s + 5, xm - 0.08).x, v.y); ctx.fill();
      });
    }
    if (!L) return;
    veMatDuong();
    // Vạch dừng, đích
    L.vat.forEach(function (o) { if (o.loai === "den" && !o.qua) veVachDung(o.s - cam); });
    veDich(L.het - 30 - cam);
    veThoiTiet(tt);
    // Vật cản: xa vẽ trước
    var ds = L.vat.filter(function (o) { var d = o.s - cam; return !o.qua || d > -4; }).sort(function (p, q) { return q.s - p.s; });
    ds.forEach(function (o) {
      var d = o.s - cam; if (d > 125 || d < -4) return;
      var m = mucCua(L.mat, o, L.chang[o.chang].tt);
      if (o.loai === "den") veDen(o, d, m); else veVat(o, d, m);
    });
    veXe();
    veHud();
  }

  function veVachDung(d) {
    if (d > 125 || d < -4) return;
    var u = chieu(d, -5.25), v = chieu(d, 5.25), w = Math.max(2, 0.5 * u.p * PX);
    ctx.fillStyle = "rgba(248,250,252,.9)"; ctx.fillRect(u.x, u.y - w, v.x - u.x, w);
  }
  function veDich(d) {
    if (d > 125 || d < -4) return;
    var u = chieu(d, -6), v = chieu(d, 6), o = u.p * PX, cot = 4.5 * o;
    ctx.fillStyle = "#16A34A"; ctx.fillRect(u.x - 0.3 * o, u.y - cot, 0.3 * o, cot); ctx.fillRect(v.x, v.y - cot, 0.3 * o, cot);
    hinhTron(u.x - 0.3 * o, u.y - cot - 0.9 * o, v.x - u.x + 0.6 * o, 0.9 * o, 0.2 * o); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 " + Math.max(8, 0.55 * o) + "px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(T.ve, (u.x + v.x) / 2, u.y - cot - 0.45 * o); ctx.textBaseline = "alphabetic";
  }

  // Dấu hiệu của con mắt đang bật trên mặt đường: LiDAR là các vòng quét, radar là quạt sóng.
  function veMatDuong() {
    var cb = L.mat;
    if (cb === "lidar") {
      ctx.strokeStyle = "rgba(56,189,248,.35)"; ctx.lineWidth = 1.5;
      for (var r = (L.t * 30) % 20; r < 115; r += 20) { var u = chieu(r, -5.25), v = chieu(r, 5.25); ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(v.x, v.y); ctx.stroke(); }
    } else if (cb === "radar") {
      var goc = chieu(2, L.x), x1 = chieu(110, -7), x2 = chieu(110, 7), nhip = 0.08 + 0.05 * Math.sin(L.t * 6);
      ctx.fillStyle = "rgba(250,204,21," + nhip.toFixed(3) + ")";
      ctx.beginPath(); ctx.moveTo(goc.x, goc.y); ctx.lineTo(x1.x, x1.y); ctx.lineTo(x2.x, x2.y); ctx.fill();
    }
  }

  function veThoiTiet(tt) {
    var x0 = chieu(3, L.x);
    if (tt === "dem") {
      ctx.fillStyle = "rgba(2,6,23,.45)"; ctx.fillRect(-20, -20, rongNhin + 40, CAO + 40);
      var u = chieu(30, L.x - 3), v = chieu(30, L.x + 3);
      var g = ctx.createLinearGradient(0, x0.y, 0, u.y);
      g.addColorStop(0, "rgba(253,230,138,.22)"); g.addColorStop(1, "rgba(253,230,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0.x - 0.8 * PX, x0.y); ctx.lineTo(u.x, u.y); ctx.lineTo(v.x, v.y); ctx.lineTo(x0.x + 0.8 * PX, x0.y); ctx.fill();
    } else if (tt === "mua") {
      ctx.fillStyle = "rgba(15,23,42,.28)"; ctx.fillRect(-20, -20, rongNhin + 40, CAO + 40);
      ctx.strokeStyle = "rgba(191,219,254,.55)"; ctx.lineWidth = 1.5; ctx.beginPath();
      L.mua.forEach(function (h) {
        var y = ((h.y + L.t * h.v) % 1) * CAO, x = ((h.x + L.t * 0.15) % 1) * rongNhin;
        ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 22);
      });
      ctx.stroke();
    } else if (tt === "suong") {
      var g2 = ctx.createLinearGradient(0, y0 - 40, 0, CAO);
      g2.addColorStop(0, "rgba(226,232,240,.96)"); g2.addColorStop(0.45, "rgba(226,232,240,.8)"); g2.addColorStop(1, "rgba(226,232,240,.25)");
      ctx.fillStyle = g2; ctx.fillRect(-20, y0 - 40, rongNhin + 40, CAO - y0 + 60);
    }
  }

  // Hình vật theo mét (gốc ở chân, u ngang, v đứng): dùng để vẽ thường và để rải điểm LiDAR.
  var HINH = {
    nguoi: [["tron", 0, 1.58, 0.14], ["chu", -0.22, 0.85, 0.44, 0.62], ["chu", -0.2, 0, 0.16, 0.86], ["chu", 0.04, 0, 0.16, 0.86]],
    xe: [["tron", 0, 1.42, 0.17], ["chu", -0.26, 0.82, 0.52, 0.5], ["chu", -0.36, 0.42, 0.72, 0.4], ["chu", -0.07, 0, 0.14, 0.5]]
  };
  function diemMau(loai) {
    if (DIEM[loai]) return DIEM[loai];
    var ds = [], h = HINH[loai];
    while (ds.length < 90) {
      var u = Math.random() * 0.8 - 0.4, v = Math.random() * 1.8;
      if (h.some(function (p) { return p[0] === "tron" ? (u - p[1]) * (u - p[1]) + (v - p[2]) * (v - p[2]) < p[3] * p[3] : u >= p[1] && u <= p[1] + p[3] && v >= p[2] && v <= p[2] + p[4]; })) ds.push([u, v]);
    }
    return (DIEM[loai] = ds);
  }
  function veHinh(loai, q, o, mau) {
    var k = q.p * PX;
    HINH[loai].forEach(function (p, i) {
      ctx.fillStyle = mau[Math.min(i, mau.length - 1)];
      if (p[0] === "tron") { ctx.beginPath(); ctx.arc(q.x + p[1] * k, q.y - p[2] * k, p[3] * k, 0, 7); ctx.fill(); }
      else ctx.fillRect(q.x + p[1] * k, q.y - (p[2] + p[4]) * k, p[3] * k, p[4] * k);
    });
    if (loai === "xe") { ctx.fillStyle = "#EF4444"; ctx.fillRect(q.x - 0.08 * k, q.y - 0.62 * k, 0.16 * k, 0.08 * k); }
  }

  function veVat(o, d, m) {
    if (d > TAM[m]) return;
    var q = chieu(d, o.x), k = q.p * PX, cb = L.mat, tt = L.chang[o.chang].tt;
    var mo = m === 2 ? 1 : m === 1 ? 0.42 : 0.9;
    ctx.save(); ctx.globalAlpha = mo;
    if (cb === "lidar") {
      var ds = diemMau(o.loai), r = Math.max(1.6, 0.05 * k);
      ctx.fillStyle = "#38BDF8";
      ds.forEach(function (p, i) {
        if (m < 2 && i % 3) return;
        var j = m < 2 ? (Math.random() - 0.5) * 0.25 : 0;
        ctx.fillRect(q.x + (p[0] + j) * k - r / 2, q.y - (p[1] + j) * k - r / 2, r, r);
      });
    } else if (cb === "radar") {
      var nhip = 1 + 0.12 * Math.sin(L.t * 8 + o.s);
      ctx.fillStyle = "rgba(250,204,21,.75)";
      ctx.beginPath(); ctx.ellipse(q.x, q.y - 0.8 * k, 0.55 * k * nhip, 0.7 * k * nhip, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(250,204,21,.5)"; ctx.lineWidth = Math.max(1, 0.05 * k);
      ctx.beginPath(); ctx.ellipse(q.x, q.y - 0.8 * k, 0.9 * k * nhip, 1.05 * k * nhip, 0, 0, 7); ctx.stroke();
      if (o.loai === "xe" && D.muc.radar.toc_do[tt] === 2 && d < 90) {
        ctx.globalAlpha = 1; ctx.font = "700 " + Math.max(11, 0.36 * k) + "px " + CHU; ctx.textAlign = "center";
        ctx.lineWidth = 4; ctx.strokeStyle = "rgba(15,23,42,.8)"; var chu = Math.round(XE_MAY_V * 3.6) + " " + T.kmh;
        ctx.strokeText(chu, q.x, q.y - 1.95 * k); ctx.fillStyle = "#FDE68A"; ctx.fillText(chu, q.x, q.y - 1.95 * k);
      }
    } else {
      var toi = tt === "dem" ? ["#94A3B8", "#1E293B", "#0F172A"] : ["#FDE68A", "#F97316", "#1E3A8A"];
      if (o.loai === "xe") toi = ["#E2E8F0", "#DC2626", "#111827", "#111827"];
      if (m === 1) { ctx.filter = "blur(2px)"; }
      veHinh(o.loai, q, o, toi);
      ctx.filter = "none";
    }
    ctx.restore();
  }

  // Đèn giao thông: cột luôn thấy (cả LiDAR lẫn radar thấy vật kim loại), còn màu đèn chỉ hiện theo mức "den".
  function veDen(o, d, m) {
    if (d > 125 || d < -4) return;
    var g = chieu(d, 6.1), k = g.p * PX, cao = 5.2 * k, tay = chieu(d, 1.4);
    ctx.save();
    ctx.fillStyle = L.mat === "lidar" ? "rgba(56,189,248,.8)" : "#0F172A";
    ctx.fillRect(g.x - 0.12 * k, g.y - cao, 0.24 * k, cao);
    ctx.fillRect(tay.x, g.y - cao, g.x - tay.x, 0.2 * k);
    var hx = tay.x - 0.35 * k, hy = g.y - cao + 0.2 * k;
    ctx.fillStyle = "#111827"; hinhTron(hx, hy, 0.7 * k, 1.9 * k, 0.15 * k); ctx.fill();
    var thay = d <= TAM[m] && m > 0, sang = m === 2 ? 1 : 0.5;
    [["do", "#EF4444"], ["vang", "#F59E0B"], ["xanh", "#22C55E"]].forEach(function (den, i) {
      var bat = thay && o.mau === den[0];
      ctx.globalAlpha = bat ? sang : 1;
      ctx.fillStyle = bat ? den[1] : "#334155";
      ctx.beginPath(); ctx.arc(hx + 0.35 * k, hy + (0.33 + i * 0.6) * k, 0.22 * k, 0, 7); ctx.fill();
      if (bat && m === 2) { ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(hx + 0.35 * k, hy + (0.33 + i * 0.6) * k, 0.5 * k, 0, 7); ctx.fill(); }
    });
    ctx.globalAlpha = 1;
    if (!thay && d < 70) {
      ctx.font = "800 " + Math.max(12, 0.9 * k) + "px " + CHU; ctx.textAlign = "center"; ctx.fillStyle = "#FDE68A";
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(15,23,42,.8)"; ctx.strokeText("?", hx - 0.6 * k, hy + 1.2 * k); ctx.fillText("?", hx - 0.6 * k, hy + 1.2 * k);
    }
    ctx.restore();
  }

  function veXe() {
    var q = chieu(3, L.x), k = q.p * PX, w = 1.9 * k, h = 1.25 * k, x = q.x - w / 2, y = q.y - h;
    if (L.mien > 0 && Math.floor(L.t * 12) % 2) ctx.globalAlpha = 0.45;
    ctx.fillStyle = "rgba(15,23,42,.35)"; ctx.beginPath(); ctx.ellipse(q.x, q.y, w * 0.55, 0.12 * k, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#1D4ED8"; hinhTron(x, y, w, h, 0.25 * k); ctx.fill();
    ctx.fillStyle = "#2563EB"; hinhTron(x + 0.18 * k, y - 0.55 * k, w - 0.36 * k, 0.75 * k, 0.22 * k); ctx.fill();
    ctx.fillStyle = "#BFDBFE"; hinhTron(x + 0.32 * k, y - 0.45 * k, w - 0.64 * k, 0.45 * k, 0.12 * k); ctx.fill();
    ctx.fillStyle = phim.phanh ? "#F87171" : "#B91C1C";
    hinhTron(x + 0.1 * k, y + 0.25 * k, 0.4 * k, 0.2 * k, 0.06 * k); ctx.fill();
    hinhTron(x + w - 0.5 * k, y + 0.25 * k, 0.4 * k, 0.2 * k, 0.06 * k); ctx.fill();
    if (phim.phanh) { ctx.globalAlpha = 0.35; ctx.fillStyle = "#EF4444"; ctx.beginPath(); ctx.arc(x + 0.3 * k, y + 0.35 * k, 0.45 * k, 0, 7); ctx.arc(x + w - 0.3 * k, y + 0.35 * k, 0.45 * k, 0, 7); ctx.fill(); ctx.globalAlpha = L.mien > 0 && Math.floor(L.t * 12) % 2 ? 0.45 : 1; }
    // Con mắt đang bật trên nóc xe
    ctx.fillStyle = MAU_MAT[L.mat]; ctx.beginPath(); ctx.arc(q.x, y - 0.62 * k, 0.2 * k, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#0F172A"; ctx.fillRect(x + 0.6 * k, y + 0.7 * k, w - 1.2 * k, 0.28 * k);
    ctx.globalAlpha = 1;
  }

  function veHud() {
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    ctx.textBaseline = "alphabetic";
    // Tim
    ctx.font = "700 28px " + CHU; ctx.textAlign = "left";
    for (var i = 0; i < 3; i++) { ctx.fillStyle = i < L.tim ? "#EF4444" : "rgba(148,163,184,.6)"; ctx.fillText("♥", 18 + i * 30, 42); }
    // Thanh đường đi và tên chặng
    var w = Math.min(320, rongNhin * 0.34), x = (rongNhin - w) / 2, tien = Math.min(1, L.s / (L.het - 30));
    ctx.fillStyle = "rgba(15,23,42,.6)"; hinhTron(x - 10, 14, w + 20, 46, 14); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 15px " + CHU; ctx.textAlign = "center";
    ctx.fillText(L.ck >= 0 ? T.tt[L.chang[L.ck].tt] + " · " + tenMat(L.mat) : "", rongNhin / 2, 34);
    ctx.fillStyle = "rgba(148,163,184,.5)"; hinhTron(x, 44, w, 7, 3.5); ctx.fill();
    ctx.fillStyle = "#FACC15"; hinhTron(x, 44, Math.max(7, w * tien), 7, 3.5); ctx.fill();
    // Tốc độ và số vật thấy rõ
    var ro = 0, tong = 0;
    L.vat.forEach(function (o) { if (o.ghi >= 0) { tong++; if (o.ghi === 2) ro++; } });
    ctx.fillStyle = "rgba(15,23,42,.6)"; hinhTron(10, 52, 128, 54, 12); ctx.fill();
    ctx.textAlign = "left"; ctx.font = "800 22px " + CHU;
    ctx.fillStyle = "#fff"; ctx.fillText(Math.round(L.v * 3.6) + " " + T.kmh, 20, 77);
    ctx.font = "700 13px " + CHU; ctx.fillStyle = "#BAE6FD"; ctx.fillText(T.ro(ro, tong), 20, 97);
    if (L.bao) {
      ctx.font = (L.bao.nho ? "700 22px " : "800 32px ") + CHU; ctx.textAlign = "center";
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(15,23,42,.75)"; ctx.strokeText(L.bao.chu, rongNhin / 2, 120);
      ctx.fillStyle = "#FDE68A"; ctx.fillText(L.bao.chu, rongNhin / 2, 120);
    }
  }

  // ---------- Vòng lặp ----------
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

  // ---------- Toàn màn hình nằm ngang trên điện thoại (như phieu-luu.js) ----------
  var DT = window.matchMedia ? window.matchMedia("(pointer: coarse), (max-width: 700px)") : {matches: false};
  var daThoat = false;
  function toanMan(bat) {
    var pl = $("#dx"), nut = $("#dx-toan");
    pl.classList.toggle("is-toan", bat);
    document.documentElement.classList.toggle("pl-mo-toan", bat);
    nut.textContent = bat ? "✕" : "⛶";
    nut.setAttribute("aria-label", bat ? T.toanRa : T.toanVao); nut.title = nut.getAttribute("aria-label");
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
  function meoIphone() {
    var ios = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var rieng = navigator.standalone || (window.matchMedia && matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches);
    if (!ios || rieng || $("#pl-meo")) return;
    var lan = 0; try { lan = +localStorage.getItem("mhai-dem-lai-xe-meo") || 0; } catch (e) {}
    if (lan >= 2) return;
    try { localStorage.setItem("mhai-dem-lai-xe-meo", String(lan + 1)); } catch (e) {}
    var m = el("div", "pl-meo"); m.id = "pl-meo"; m.setAttribute("role", "status");
    m.appendChild(el("p", null, T.meoIos));
    var x = el("button", null, "✕"); x.type = "button"; x.setAttribute("aria-label", T.dong);
    function bo() { if (m.parentNode) m.parentNode.removeChild(m); }
    x.addEventListener("click", function () { bo(); try { localStorage.setItem("mhai-dem-lai-xe-meo", "9"); } catch (e) {} });
    m.appendChild(x); $("#dx").appendChild(m);
    setTimeout(bo, 9000);
  }

  // ---------- Màn chọn chuyến / kết quả ----------
  function hienMan(noiDung) {
    man.innerHTML = ""; man.appendChild(noiDung); man.hidden = false;
    $("#dx-menu").hidden = true; $("#dx-bit").hidden = true;
    $("#dx").classList.add("is-man");
    var n = $(".pl-kq-nut button", man) || $("button:not([aria-disabled]), a", man); if (n) n.focus({preventScroll: true});
  }
  function manChon() {
    trangThai = "chon"; L = null; dungVong();
    var w = el("div", "pl-chon-ai");
    w.appendChild(el("h2", null, T.chon));
    w.appendChild(el("p", null, T.chonTxt));
    var ds = el("div", "pl-ds-ai");
    CHUYEN.forEach(function (c, i) {
      var s = tienDo.sao[c.id] || 0;
      var b = el("button", "pl-the" + (c.mo ? "" : " is-khoa") + (s ? " is-xong" : "")); b.type = "button";
      b.appendChild(el("span", "pl-the-so", c.mo ? String(i + 1) : "🔒"));
      b.appendChild(el("b", null, c.ten));
      b.appendChild(el("span", "pl-the-sao", c.mo ? saoChu(s) : T.sapCo));
      b.setAttribute("aria-label", T.man + " " + (i + 1) + ": " + c.ten + (c.mo ? (s ? ", " + s + "/3 ★" : "") : ". " + T.khoa));
      if (!c.mo) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", function () { if (!c.mo) { thongBao(T.khoa); return; } batDauChuyen(i); });
      ds.appendChild(b);
    });
    w.appendChild(ds);
    w.appendChild(el("p", "dx-thu", T.tinhNang));
    hienMan(w);
    $("#dx-tong").textContent = T.tongSao(tongSao());
  }
  function batDauChuyen(i) {
    dungChuyen(i);
    man.hidden = true; $("#dx-menu").hidden = false;
    trangThai = "choi"; $("#dx").classList.remove("is-man");
    if (window.mhaiDo) window.mhaiDo("game-bat-dau", {game: "dem-lai-xe", man: i + 1});
    if (DT.matches && !daThoat && !$("#dx").classList.contains("is-toan")) toanMan(true);
    phim.phanh = false;
    chonMat("camera");
    var r = khung.getBoundingClientRect();
    if (!$("#dx").classList.contains("is-toan") && (r.top < 0 || r.bottom > window.innerHeight)) $("#dx").scrollIntoView({block: "start", behavior: "smooth"});
    cv.focus({preventScroll: true});
    chayVong();
  }

  // Bảng chặng: mỗi kiểu trời, con mắt hợp nhất và bạn đã bật mắt nào bao lâu.
  function bangChang() {
    var w = el("div", "dx-chang-ds");
    L.chang.forEach(function (ch) {
      var tong = ch.tg.lidar + ch.tg.radar + ch.tg.camera || 1, pt = Math.round(100 * ch.tg[ch.tot] / tong);
      var o = el("div", "dx-chang dx-tt-" + ch.tt);
      o.appendChild(el("span", "dx-chang-ic"));
      o.appendChild(el("b", null, T.tt[ch.tt]));
      var tot = el("p", "dx-chang-tot"); tot.appendChild(el("span", null, T.hopNhat + ": "));
      tot.appendChild(el("strong", "dx-mat-chip dx-mat-" + ch.tot, tenMat(ch.tot))); o.appendChild(tot);
      var thanh = el("span", "dx-thanh"); var dd = el("i"); dd.style.width = pt + "%"; thanh.appendChild(dd); o.appendChild(thanh);
      o.appendChild(el("small", null, T.banBat + " " + tenMat(ch.tot) + " " + pt + T.phut));
      o.appendChild(el("p", "dx-chang-vi", T.vi[ch.tt]));
      var v = D.video && D.video[ch.video];
      if (v) { var a = el("a", "dx-chang-vid", "#" + ch.video + " " + v.ten); a.href = v.url; o.appendChild(a); }
      w.appendChild(o);
    });
    return w;
  }
  function soRo() {
    var r = 0, n = 0;
    L.vat.forEach(function (o) { if (o.ghi >= 0) { n++; if (o.ghi === 2) r++; } });
    return {r: r, n: n};
  }
  function nutKetQua(kq) {
    var hang = el("div", "pl-kq-nut"), i = L.i;
    var l = el("button", "btn btn-yt", T.lai); l.type = "button"; l.addEventListener("click", function () { batDauChuyen(i); }); hang.appendChild(l);
    var v = el("button", "btn", T.veChon); v.type = "button"; v.addEventListener("click", manChon); hang.appendChild(v);
    if (D.video && D.video["5"]) { var a = el("a", "btn", T.xemVideo); a.href = D.video["5"].url; hang.appendChild(a); }
    kq.appendChild(hang);
  }
  function thangChuyen() {
    if (trangThai !== "choi") return;
    trangThai = "xong";
    var c = L.c, ro = soRo();
    var sao = 1 + (L.tim >= 2 ? 1 : 0) + (ro.n && ro.r / ro.n >= 0.75 ? 1 : 0);
    tienDo.sao[c.id] = Math.max(tienDo.sao[c.id] || 0, sao); luu();
    if (window.mhaiDo) { window.mhaiDo("game-qua-man", {game: "dem-lai-xe", man: L.i + 1, sao: sao}); window.mhaiDo("hoc-xong", {loai: "game"}); }
    var kq = el("div", "pl-kq dx-kq");
    var h = el("img"); h.alt = ""; h.width = 96; h.height = 96; h.src = D.p + "assets/mascot/mark-chien-thang.webp"; kq.appendChild(h);
    kq.appendChild(el("h3", null, T.thang));
    kq.appendChild(el("p", "pl-kq-sao", saoChu(sao)));
    kq.appendChild(el("p", null, T.thangTxt(ro.r, ro.n, L.tim)));
    kq.appendChild(bangChang());
    nutKetQua(kq);
    hienMan(kq);
    $("#dx-tong").textContent = T.tongSao(tongSao());
  }
  function thuaChuyen() {
    if (trangThai !== "choi") return;
    trangThai = "xong";
    if (window.mhaiDo) window.mhaiDo("game-thua", {game: "dem-lai-xe", man: L.i + 1});
    var kq = el("div", "pl-kq dx-kq");
    var h = el("img"); h.alt = ""; h.width = 96; h.height = 96; h.src = D.p + "assets/mascot/mark-dau-dau.webp"; kq.appendChild(h);
    kq.appendChild(el("h3", null, T.thua));
    var ly = el("ul", "dx-ly");
    L.nhatKy.forEach(function (x) { ly.appendChild(el("li", null, x)); });
    kq.appendChild(ly);
    kq.appendChild(el("p", null, T.thuaTxt));
    kq.appendChild(bangChang());
    nutKetQua(kq);
    hienMan(kq);
  }
  function thongBao(chu) {
    var b = $("#dx-bao"); b.textContent = chu; b.hidden = false;
    clearTimeout(thongBao.h); thongBao.h = setTimeout(function () { b.hidden = true; }, 2600);
  }

  // ---------- Điều khiển ----------
  var PHIM = {ArrowLeft: "trai", KeyA: "trai", ArrowRight: "phai", KeyD: "phai", ArrowDown: "phanh", KeyS: "phanh", Space: "phanh",
    Digit1: "lidar", Digit2: "radar", Digit3: "camera", Numpad1: "lidar", Numpad2: "radar", Numpad3: "camera"};
  function lenh(k) {
    if (k === "trai") doiLan(-1); else if (k === "phai") doiLan(1); else if (MAT.indexOf(k) >= 0) chonMat(k);
  }
  function batPhim() {
    document.addEventListener("keydown", function (e) {
      var k = PHIM[e.code];
      if (!k || trangThai !== "choi") return;
      var tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
      if ((tg === "BUTTON" || tg === "A") && e.code === "Space") return;
      e.preventDefault();
      if (k === "phanh") phim.phanh = true; else if (!e.repeat) lenh(k);
    });
    document.addEventListener("keyup", function (e) { if (PHIM[e.code] === "phanh") phim.phanh = false; });
    window.addEventListener("blur", function () { phim.phanh = false; });
    document.querySelectorAll("#dx-dk button").forEach(function (b) {
      var k = b.dataset.k || b.dataset.cb;
      function an(e) {
        e.preventDefault(); b.classList.add("is-an");
        if (k === "phanh") { phim.phanh = true; try { b.setPointerCapture(e.pointerId); } catch (x) {} }
        else if (trangThai === "choi") lenh(k);
      }
      function nha() { if (k === "phanh") phim.phanh = false; b.classList.remove("is-an"); }
      b.addEventListener("pointerdown", an);
      b.addEventListener("pointerup", nha); b.addEventListener("pointercancel", nha); b.addEventListener("lostpointercapture", nha);
      b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
    // Vuốt ngang trên màn hình cũng đổi làn.
    var vx = null;
    cv.addEventListener("pointerdown", function (e) { vx = e.clientX; });
    cv.addEventListener("pointerup", function (e) {
      if (vx == null) return;
      var dx = e.clientX - vx; vx = null;
      if ($("#dx").classList.contains("is-toan") && window.matchMedia("(orientation: portrait)").matches) return; // khung đang xoay: bỏ vuốt
      if (Math.abs(dx) > 30) doiLan(dx > 0 ? 1 : -1);
    });
  }

  function batDau() {
    cv = $("#dx-canvas"); man = $("#dx-man"); khung = $("#dx-khung");
    if (!cv || !cv.getContext) return;
    try { D = JSON.parse($("#dx-du-lieu").textContent); } catch (e) { return; }
    ctx = cv.getContext("2d");
    cv.setAttribute("aria-label", T.canvas);
    coGian();
    window.addEventListener("resize", coGian);
    batPhim();
    $("#dx-menu").textContent = T.menu;
    toanMan(false);
    $("#dx-toan").addEventListener("click", function () {
      var bat = !$("#dx").classList.contains("is-toan");
      daThoat = !bat; toanMan(bat); cv.focus({preventScroll: true});
    });
    $("#dx-menu").addEventListener("click", manChon);
    $("#dx-xoa").textContent = T.xoa;
    $("#dx-xoa").addEventListener("click", function () {
      if (!confirm(T.xoaHoi)) return;
      tienDo = {sao: {}}; luu(); manChon();
    });
    manChon();
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__dx = {L: function () { return L; }, batDauChuyen: batDauChuyen, chonMat: chonMat, doiLan: doiLan, phim: phim, trangThai: function () { return trangThai; }, mucCua: mucCua};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

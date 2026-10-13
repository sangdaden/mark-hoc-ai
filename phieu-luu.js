// Game "Mark phiêu lưu" (phieu-luu.html + en/phieu-luu.html): game đi cảnh 4 ải.
// Mark chạy, nhảy, đạp quái; mỗi lần đụng quái, hộp "?" hay trùm là một câu hỏi lấy từ
// 4 bộ "co-ban" trong data/bo-kiem-tra.json. Tiến độ lưu ở localStorage "mhai-phieu-luu-2"
// ({mo: số ải đã mở, sao: {id: 1-3}}).
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var GOC = EN ? "../" : "";
  var KHOA = "mhai-phieu-luu-2";
  var O = 45, HANG = 12, CAO = HANG * O, BUOC = 1 / 120;
  var TRONG_LUC = 2300, NHAY = -960, CHAY = 290, TANG = 1900;

  var T = EN ? {
    dung: "True", sai: "False", dungRoi: "Correct!", saiRoi: "Not quite.",
    tiep: "Keep running →", tim: "Hearts", hp: "Boss health",
    dap: function (q) { return "You stomped " + q + "! Answer correctly to finish it off. A wrong answer costs no heart."; },
    dung2: function (q) { return q + " blocks your way! Answer correctly to defeat it. A wrong answer costs 1 heart."; },
    hop: "Mystery block", hopTxt: "Answer correctly for a reward: a heart if you're hurt, otherwise 3 coins.",
    trum: function (n) { return "Answer correctly to land a hit. " + n + " hits left."; },
    chon: "Choose a level", chonTxt: "Run, jump and stomp monsters. Every monster, mystery block and boss asks you an AI question.",
    khoa: "Clear the previous level first.", ai: "Level",
    qua: "Level cleared!", quaTxt: function (s, x) { return s + " of 3 stars · " + x + " coins"; },
    thua: "Out of hearts", thuaTxt: "Bit says: read the explanations, then try again. Cleared levels stay unlocked.",
    lai: "Try again", aiTiep: "Next level", veChon: "Levels",
    thang: "You beat the King of Hallucination!", thangTxt: function (s) { return "Total: " + s + " of 12 stars. Take the full quiz to earn your certificate."; },
    tongSao: function (s) { return s + " / 12 stars"; }, xoa: "Reset progress", xoaHoi: "Reset all levels?",
    loi: "Couldn't load the questions. Please reload the page.", dangTai: "Loading questions…",
    menu: "☰ Levels", trumDen: "Boss!", cong: "The gate is open!", canvas: "Game screen"
  } : {
    dung: "Đúng", sai: "Sai", dungRoi: "Chính xác!", saiRoi: "Chưa đúng rồi.",
    tiep: "Chạy tiếp →", tim: "Tim", hp: "Máu trùm",
    dap: function (q) { return "Bạn đạp trúng " + q + "! Trả lời đúng để hạ hẳn nó. Sai cũng không mất tim."; },
    dung2: function (q) { return q + " chặn đường! Trả lời đúng để hạ nó, sai mất 1 tim."; },
    hop: "Hộp bí ẩn", hopTxt: "Trả lời đúng để nhận thưởng: thêm 1 tim nếu đang mất tim, không thì 3 xu.",
    trum: function (n) { return "Trả lời đúng để đánh trúng trùm. Còn " + n + " đòn nữa."; },
    chon: "Chọn ải", chonTxt: "Chạy, nhảy, đạp quái. Mỗi con quái, hộp bí ẩn và trùm đều hỏi bạn một câu về AI.",
    khoa: "Qua ải trước để mở ải này.", ai: "Ải",
    qua: "Qua ải!", quaTxt: function (s, x) { return s + " trên 3 sao · " + x + " xu"; },
    thua: "Hết tim rồi", thuaTxt: "Bit nhắn: đọc kỹ lời giải thích rồi thử lại nhé. Các ải đã qua vẫn được giữ.",
    lai: "Chơi lại ải", aiTiep: "Ải tiếp theo", veChon: "Chọn ải",
    thang: "Bạn đã hạ Vua Ảo Giác!", thangTxt: function (s) { return "Tổng cộng " + s + " trên 12 sao. Làm bài kiểm tra đầy đủ để nhận giấy chứng nhận."; },
    tongSao: function (s) { return s + " / 12 sao"; }, xoa: "Chơi lại từ đầu", xoaHoi: "Xóa tiến độ của tất cả các ải?",
    loi: "Không tải được câu hỏi. Bạn tải lại trang nhé.", dangTai: "Đang tải câu hỏi…",
    menu: "☰ Chọn ải", trumDen: "Trùm xuất hiện!", cong: "Cổng đã mở!", canvas: "Màn hình game"
  };

  // 4 ải. ho: hố [x, rộng]; ben: bệ gạch [x, hàng, dài]; hop: hộp "?" [x, hàng]; xu: [x, hàng, số xu];
  // quaiX: quái đi bộ (cột x); bayX: quái bay [x, hàng]; gai: [x, dài]; bac: bậc [x, cao]; cp: cột hồi sinh.
  // Khu trùm luôn là 24 ô cuối: cổng ở W-8, cờ đích ở W-4.
  var AI = [
    {id: "hieu-lam", ten: EN ? "Myth Village" : "Làng Hiểu Lầm", quai: EN ? "Rumor" : "Tin đồn", bay: EN ? "Hype" : "Thổi phồng",
      trum: EN ? "King of Myths" : "Vua Hiểu Lầm", mau: "#22C55E", mauTrum: "#16A34A", troi: ["#7DD3FC", "#E0F2FE"], doi: "#86EFAC", W: 100, hp: 3,
      ho: [[18, 2], [46, 3]], ben: [[9, 7, 4], [24, 7, 3], [29, 5, 3], [52, 7, 3], [57, 5, 3], [63, 7, 4]],
      hop: [[14, 6], [39, 6], [68, 4]], xu: [[24, 6, 3], [29, 4, 3], [57, 4, 3], [33, 8, 3]],
      quaiX: [12, 27, 37, 54, 66], bayX: [[47, 6]], gai: [[34, 1]], bac: [[72, 1], [73, 2]], cp: [2, 50]},
    {id: "prompt", ten: EN ? "Prompt Workshop" : "Xưởng Prompt", quai: EN ? "Lazy Prompt" : "Prompt cụt", bay: EN ? "Vague Ask" : "Hỏi mơ hồ",
      trum: EN ? "Lazy Prompt Lord" : "Prompt Lười", mau: "#F97316", mauTrum: "#EA580C", troi: ["#FDBA74", "#FEF3C7"], doi: "#FCD34D", W: 108, hp: 3,
      ho: [[15, 2], [31, 3], [55, 2], [70, 3]], ben: [[10, 7, 3], [20, 6, 4], [27, 4, 3], [36, 7, 3], [44, 5, 4], [58, 6, 3], [64, 4, 3], [73, 7, 3]],
      hop: [[12, 3], [46, 1], [61, 6], [79, 6]], xu: [[20, 5, 4], [27, 3, 3], [44, 4, 4], [64, 3, 3], [32, 6, 2]],
      quaiX: [8, 24, 39, 51, 62, 77], bayX: [[32, 6], [71, 5]], gai: [[48, 2], [66, 1]], bac: [[80, 1], [81, 2], [82, 3]], cp: [2, 41, 68]},
    {id: "an-toan", ten: EN ? "Safety Fort" : "Pháo đài An toàn", quai: EN ? "Scam Text" : "Tin nhắn lừa", bay: "Deepfake",
      trum: EN ? "Scam Boss" : "Trùm Lừa Đảo", mau: "#EF4444", mauTrum: "#B91C1C", troi: ["#C4B5FD", "#FCE7F3"], doi: "#F9A8D4", W: 112, hp: 3,
      ho: [[13, 3], [26, 2], [40, 3], [57, 3], [73, 3]], ben: [[7, 7, 3], [17, 6, 3], [22, 4, 3], [30, 7, 4], [35, 7, 3], [43, 6, 2], [50, 7, 3], [60, 5, 4], [67, 7, 3], [70, 5, 2]],
      hop: [[9, 3], [33, 3], [62, 1], [82, 6]], xu: [[17, 5, 3], [22, 3, 3], [35, 6, 3], [60, 4, 4], [70, 4, 2]],
      quaiX: [10, 20, 36, 47, 53, 65, 80], bayX: [[14, 5], [49, 5], [58, 6], [75, 7]], gai: [[33, 1], [52, 1], [69, 2]], bac: [[84, 2], [85, 3], [86, 1]], cp: [2, 29, 63]},
    {id: "cong-viec", ten: EN ? "AI Office" : "Văn phòng AI", quai: EN ? "Fake Stat" : "Số liệu bịa", bay: EN ? "Leaked File" : "File lộ",
      trum: EN ? "King of Hallucination" : "Vua Ảo Giác", mau: "#64748B", mauTrum: "#7C3AED", troi: ["#4C1D95", "#7C3AED"], doi: "#A78BFA", W: 118, hp: 4, tron: true,
      ho: [[12, 3], [24, 3], [36, 2], [48, 3], [63, 3], [77, 3]], ben: [[7, 7, 3], [16, 5, 4], [20, 7, 2], [28, 5, 3], [33, 3, 3], [40, 6, 3], [47, 4, 3], [52, 6, 3], [58, 7, 3], [62, 4, 4], [70, 6, 3], [76, 4, 3], [82, 7, 3]],
      hop: [[9, 3], [30, 1], [43, 2], [72, 2], [88, 6]], xu: [[16, 4, 4], [28, 4, 3], [33, 2, 3], [47, 3, 3], [62, 3, 4], [76, 3, 3]],
      quaiX: [6, 19, 30, 42, 54, 59, 71, 74, 85], bayX: [[13, 6], [25, 7], [46, 6], [64, 7], [86, 6]], gai: [[20, 1], [44, 1], [56, 1], [87, 2]], bac: [[89, 1], [90, 2], [91, 3], [92, 1]], cp: [2, 39, 68]}
  ];

  var $ = function (s, g) { return (g || document).querySelector(s); };
  var bo = {}, daTai = false, tienDo = docTienDo();
  var cv, ctx, khung, man, hop, rongNhin = 960, tiLe = 1, anh = {}, raf = 0, truoc = 0, du = 0;
  var phim = {trai: false, phai: false, nhay: false}, demNhay = 0;
  var L = null, M = null, dangHoi = false, dangCho = null, trangThai = "chon"; // chon | choi | xong

  function docTienDo() {
    try { var v = JSON.parse(localStorage.getItem(KHOA)); if (v && typeof v.mo === "number") return v; } catch (e) {}
    return {mo: 1, sao: {}};
  }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function tongSao() { var s = 0; for (var k in tienDo.sao) s += tienDo.sao[k]; return s; }
  function saoChu(s) { return "★★★".slice(0, s) + "☆☆☆".slice(s); }

  function taiDuLieu() {
    var ds = [fetch(GOC + "data/bo-kiem-tra.json").then(function (r) { return r.json(); })];
    if (EN) ds.push(fetch(GOC + "data/en/bo-kiem-tra.json").then(function (r) { return r.json(); }));
    return Promise.all(ds).then(function (kq) {
      var vi = kq[0], en = kq[1], enTheoId = {};
      if (en) en.bo.forEach(function (b) { enTheoId[b.id] = b; });
      vi.bo.forEach(function (b) {
        if (b.nhom !== "co-ban") return;
        var dich = enTheoId[b.id];
        bo[b.id] = b.cau_hoi.map(function (q, i) {
          var d = dich ? dich.cau_hoi[i] : null;
          return {loai: q.loai, cau: d ? d.cau : q.cau, giai_thich: d ? d.giai_thich : q.giai_thich,
            lua_chon: d && d.lua_chon ? d.lua_chon : q.lua_chon, dap_an: q.dap_an, dung: q.dung};
        });
      });
      bo.tron = [].concat(bo["hieu-lam"], bo.prompt, bo["an-toan"], bo["cong-viec"]);
      daTai = true;
    });
  }
  function boCua(a) { return bo[a.tron ? "tron" : a.id]; }

  // ---------- Dựng ải ----------
  function dungAi(i) {
    var a = AI[i], W = a.W, t = new Uint8Array(W * HANG);
    function dat(x, y, v) { if (x >= 0 && x < W && y >= 0 && y < HANG) t[y * W + x] = v; }
    for (var x = 0; x < W; x++) { dat(x, 10, 1); dat(x, 11, 1); }
    a.ho.forEach(function (h) { for (var k = 0; k < h[1]; k++) { dat(h[0] + k, 10, 0); dat(h[0] + k, 11, 0); } });
    a.ben.forEach(function (b) { for (var k = 0; k < b[2]; k++) dat(b[0] + k, b[1], 2); });
    a.hop.forEach(function (h) { dat(h[0], h[1], 3); });
    a.gai.forEach(function (g) { for (var k = 0; k < g[1]; k++) dat(g[0] + k, 9, 5); });
    a.bac.forEach(function (b) { for (var k = 0; k < b[1]; k++) dat(b[0], 9 - k, 1); });
    var A = W - 24, G = W - 8;
    dat(A + 5, 7, 2); dat(A + 6, 7, 2); dat(A + 10, 7, 2); dat(A + 11, 7, 2);
    for (var y = 0; y < 10; y++) dat(G, y, 6);
    var quai = a.quaiX.map(function (x) { return {x: x * O + 4, y: 10 * O - 32, w: 36, h: 32, vx: -60, vy: 0, song: true, bay: false, ten: a.quai, choang: 0}; });
    a.bayX.forEach(function (b) { quai.push({x: b[0] * O + 4, y: b[1] * O, goc: b[0] * O + 4, goc2: b[1] * O, w: 36, h: 30, vx: 70, vy: 0, song: true, bay: true, ten: a.bay, choang: 0, pha: Math.random() * 6}); });
    var xu = [];
    a.xu.forEach(function (c) { for (var k = 0; k < c[2]; k++) xu.push({x: (c[0] + k) * O + O / 2, y: c[1] * O + O / 2, an: false}); });
    L = {i: i, a: a, W: W, t: t, A: A, G: G, co: (W - 4) * O, mo: false, quai: quai, xu: xu, hat: [], cp: a.cp[0], tim: 3, soXu: 0, thoiGian: 0, bao: null,
      hang: tron(boCua(a)), hangTrum: tron(boCua(a)),
      trum: {x: (G - 4) * O, y: 10 * O - 84, w: 96, h: 84, vx: -110, vy: 0, hp: a.hp, max: a.hp, song: true, bat: false, nhay: 1.5, sang: 0, lui: 0, dat: false}};
    M = {x: 2 * O, y: 10 * O - 44, w: 30, h: 44, vx: 0, vy: 0, dat: false, huong: 1, khien: 0, coyote: 0, buoc: 0};
  }

  function o(tx, ty) {
    if (tx < 0 || tx >= L.W) return 1;
    if (ty < 0 || ty >= HANG) return 0;
    return L.t[ty * L.W + tx];
  }
  function cung(v) { return v === 1 || v === 2 || v === 3 || v === 4 || (v === 6 && !L.mo); }

  function diNgang(e, dt) {
    e.x += e.vx * dt;
    var y0 = Math.floor(e.y / O), y1 = Math.floor((e.y + e.h - 0.01) / O), y;
    if (e.vx > 0) {
      var tx = Math.floor((e.x + e.w) / O);
      for (y = y0; y <= y1; y++) if (cung(o(tx, y))) { e.x = tx * O - e.w - 0.01; e.vx = 0; return true; }
    } else if (e.vx < 0) {
      var tx2 = Math.floor(e.x / O);
      for (y = y0; y <= y1; y++) if (cung(o(tx2, y))) { e.x = (tx2 + 1) * O + 0.01; e.vx = 0; return true; }
    }
    return false;
  }
  // Trả về ô hộp "?" mà đầu Mark vừa húc (nếu có).
  function diDoc(e, dt) {
    e.y += e.vy * dt; e.dat = false;
    var x0 = Math.floor(e.x / O), x1 = Math.floor((e.x + e.w - 0.01) / O), x, giua = e.x + e.w / 2;
    if (e.vy > 0) {
      var ty = Math.floor((e.y + e.h) / O);
      for (x = x0; x <= x1; x++) if (cung(o(x, ty))) { e.y = ty * O - e.h; e.vy = 0; e.dat = true; return null; }
    } else if (e.vy < 0) {
      var ty2 = Math.floor(e.y / O), trung = null, cham = false;
      for (x = x0; x <= x1; x++) if (cung(o(x, ty2))) {
        cham = true;
        if (o(x, ty2) === 3 && (!trung || Math.abs((x + 0.5) * O - giua) < Math.abs((trung[0] + 0.5) * O - giua))) trung = [x, ty2];
      }
      if (cham) { e.y = (ty2 + 1) * O; e.vy = 0; }
      return trung;
    }
    return null;
  }
  function cham(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  // ---------- Cập nhật ----------
  function capNhat(dt) {
    L.thoiGian += dt;
    if (L.bao && (L.bao.t -= dt) <= 0) L.bao = null;
    for (var h = L.hat.length - 1; h >= 0; h--) { var p = L.hat[h]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; if ((p.song -= dt) <= 0) L.hat.splice(h, 1); }
    // Mark
    var muon = (phim.phai ? 1 : 0) - (phim.trai ? 1 : 0);
    if (muon) { M.vx += muon * TANG * dt; M.huong = muon; } else { var g = TANG * 1.2 * dt; M.vx = Math.abs(M.vx) <= g ? 0 : M.vx - Math.sign(M.vx) * g; }
    if (M.vx > CHAY) M.vx = CHAY;
    if (M.vx < -CHAY) M.vx = -CHAY;
    M.coyote = M.dat ? 0.1 : M.coyote - dt;
    if (demNhay > 0) demNhay -= dt;
    if (demNhay > 0 && M.coyote > 0) { M.vy = NHAY; M.coyote = 0; demNhay = 0; }
    if (!phim.nhay && M.vy < -380) M.vy = -380;
    M.vy = Math.min(M.vy + TRONG_LUC * dt, 1100);
    var dayCu = M.y + M.h;
    diNgang(M, dt);
    var hopTrung = diDoc(M, dt);
    var tr = L.trum;
    if (tr.song && !tr.bat && M.x > (L.A + 3) * O) { tr.bat = true; L.bao = {chu: T.trumDen, t: 1.6}; }
    if (M.khien > 0) M.khien -= dt;
    M.buoc += Math.abs(M.vx) * dt;
    L.a.cp.forEach(function (c) { if (c > L.cp && M.x > c * O) L.cp = c; });
    L.xu.forEach(function (c) {
      if (!c.an && Math.abs(M.x + M.w / 2 - c.x) < 26 && Math.abs(M.y + M.h / 2 - c.y) < 34) { c.an = true; L.soXu++; no(c.x, c.y, "#FACC15", 5); }
    });
    // Gai
    var x0 = Math.floor(M.x / O), x1 = Math.floor((M.x + M.w - 0.01) / O);
    for (var gx = x0; gx <= x1; gx++) if (o(gx, 9) === 5 && M.y + M.h > 9 * O + 22 && M.khien <= 0) { biThuong(0); M.vy = -700; break; }
    if (trangThai !== "choi") return;
    if (M.y > CAO + 60) { roiHo(); return; }
    if (hopTrung) { L.t[hopTrung[1] * L.W + hopTrung[0]] = 4; no((hopTrung[0] + 0.5) * O, hopTrung[1] * O, "#FACC15", 6); hoi("hop", null); return; }
    // Quái
    for (var k = 0; k < L.quai.length; k++) {
      var q = L.quai[k];
      if (!q.song) continue;
      if (q.choang > 0) q.choang -= dt;
      if (Math.abs(q.x - M.x) > rongNhin * 1.2) continue;
      if (q.bay) {
        q.pha += dt * 2.2;
        if (q.choang <= 0) { q.x += q.vx * dt; if (q.x > q.goc + 2 * O) q.vx = -Math.abs(q.vx); if (q.x < q.goc - 2 * O) q.vx = Math.abs(q.vx); }
        q.y = q.goc2 + Math.sin(q.pha) * 34;
      } else if (q.choang <= 0) {
        if (q.vx === 0) q.vx = 60;
        var v = q.vx;
        if (diNgang(q, dt)) q.vx = -v;
        q.vy = Math.min(q.vy + TRONG_LUC * dt, 900); diDoc(q, dt);
        var mui = q.vx > 0 ? q.x + q.w + 2 : q.x - 2;
        if (q.dat && !cung(o(Math.floor(mui / O), Math.floor((q.y + q.h + 4) / O)))) q.vx = -q.vx;
      }
      if (q.choang <= 0 && M.khien <= 0 && cham(M, q)) {
        hoi(M.vy > 40 && dayCu <= q.y + 12 ? "dap" : "dung", q);
        return;
      }
    }
    // Trùm
    if (tr.song && tr.bat) {
      if (tr.sang > 0) tr.sang -= dt;
      tr.nhay -= dt;
      if (tr.dat && tr.nhay <= 0) { tr.vy = -760; tr.nhay = 1.6 + Math.random() * 1.4; }
      // Trùm đuổi theo Mark, bị đánh trúng thì lùi lại một lúc.
      if (tr.lui > 0) tr.lui -= dt; else tr.vx = (M.x + M.w / 2 < tr.x + tr.w / 2 ? -1 : 1) * 100;
      var tv = tr.vx; if (diNgang(tr, dt)) tr.vx = -tv;
      if (tr.x < (L.A + 1) * O) { tr.x = (L.A + 1) * O; tr.vx = Math.abs(tr.vx); }
      if (tr.x + tr.w > L.G * O - 2) { tr.x = L.G * O - 2 - tr.w; tr.vx = -Math.abs(tr.vx); }
      tr.vy = Math.min(tr.vy + TRONG_LUC * dt, 1000); diDoc(tr, dt);
      if (M.khien <= 0 && cham(M, {x: tr.x + 10, y: tr.y + 10, w: tr.w - 20, h: tr.h - 12})) { hoi("trum", tr); return; }
    }
    if (M.x + M.w / 2 > L.co) thangAi();
  }

  function no(x, y, mau, n) { for (var k = 0; k < n; k++) L.hat.push({x: x, y: y, vx: (Math.random() - 0.5) * 360, vy: -Math.random() * 380 - 80, song: 0.6 + Math.random() * 0.3, mau: mau}); }

  function biThuong(huongDay) {
    L.tim--; M.khien = 1.5;
    if (huongDay) { M.vx = huongDay * 330; M.vy = -440; }
    no(M.x + M.w / 2, M.y + 10, "#E11D48", 8);
    if (L.tim <= 0) thuaAi();
  }
  function roiHo() {
    L.tim--;
    if (L.tim <= 0) { thuaAi(); return; }
    M.x = L.cp * O + 8; M.y = 10 * O - M.h; M.vx = 0; M.vy = 0; M.khien = 1.5;
  }

  // ---------- Câu hỏi ----------
  function hoi(kieu, ai) {
    dangHoi = true;
    phim.trai = phim.phai = phim.nhay = false;
    var la = kieu === "trum" ? "hangTrum" : "hang";
    if (!L[la].length) L[la] = tron(boCua(L.a));
    var q = L[la].pop();
    dangCho = {kieu: kieu, ai: ai, q: q, ketQua: null};
    $("#pl-hop-ten").textContent = kieu === "hop" ? T.hop : kieu === "trum" ? L.a.trum : ai.ten;
    $("#pl-hop-mo-ta").textContent = kieu === "hop" ? T.hopTxt : kieu === "trum" ? T.trum(L.trum.hp) : kieu === "dap" ? T.dap(ai.ten) : T.dung2(ai.ten);
    $("#pl-boss").hidden = kieu !== "trum";
    hop.classList.toggle("is-boss", kieu === "trum");
    if (kieu === "trum") { $("#pl-boss-hinh path").setAttribute("fill", L.a.mauTrum); thanhMau(); }
    thanhTrang(L.tim);
    var vung = $("#pl-cau");
    vung.innerHTML = "";
    vung.appendChild(el("p", "pl-cau-chu", q.cau));
    var nuts = el("div", "pl-chon" + (q.loai === "dung-sai" ? " is-ds" : ""));
    var pa = q.loai === "dung-sai" ? [{chu: T.dung, dung: q.dung === true}, {chu: T.sai, dung: q.dung === false}]
      : tron(q.lua_chon.map(function (c, k) { return {chu: c, dung: k === q.dap_an}; }));
    pa.forEach(function (p) {
      var b = el("button", "pl-pa", p.chu); b.type = "button";
      b.addEventListener("click", function () { traLoi(p, b, nuts); });
      nuts.appendChild(b);
    });
    vung.appendChild(nuts);
    $("#pl-phan-hoi").hidden = true;
    if (hop.showModal) hop.showModal(); else hop.setAttribute("open", "");
    var dau = $(".pl-pa", nuts); if (dau) dau.focus();
  }
  function thanhTrang(soTim) {
    var tim = "";
    for (var k = 0; k < 3; k++) tim += k < soTim ? "♥" : "♡";
    $("#pl-tim").textContent = tim;
    $("#pl-tim").setAttribute("aria-label", T.tim + ": " + soTim + "/3");
    $("#pl-tien").textContent = "● " + L.soXu;
  }
  function thanhMau() {
    $("#pl-hp-thanh").style.width = (L.trum.hp / L.trum.max * 100) + "%";
    $("#pl-boss").setAttribute("aria-label", T.hp + ": " + L.trum.hp + "/" + L.trum.max);
  }
  function traLoi(p, nut, nuts) {
    var q = dangCho.q, dsPa = nuts.querySelectorAll(".pl-pa");
    dsPa.forEach(function (b) { b.disabled = true; });
    nut.classList.add(p.dung ? "is-dung" : "is-sai");
    if (!p.dung) {
      // tô luôn phương án đúng để người chơi thấy
      if (q.loai === "dung-sai") dsPa[q.dung ? 0 : 1].classList.add("is-dung");
      else dsPa.forEach(function (b) { if (b.textContent === q.lua_chon[q.dap_an]) b.classList.add("is-dung"); });
    }
    dangCho.ketQua = p.dung;
    if (dangCho.kieu === "trum" && p.dung) {
      L.trum.hp--; thanhMau();
      var bh = $("#pl-boss-hinh"); bh.classList.remove("is-trung"); void bh.offsetWidth; bh.classList.add("is-trung");
    }
    if (!p.dung && (dangCho.kieu === "dung" || dangCho.kieu === "trum")) thanhTrang(L.tim - 1);
    $("#pl-bit").src = GOC + "assets/" + (p.dung ? "bit-vui.svg" : "bit-sai-roi.svg");
    $("#pl-ph-dau").textContent = p.dung ? T.dungRoi : T.saiRoi;
    $("#pl-ph-dau").className = p.dung ? "pl-ok" : "pl-no";
    $("#pl-ph-chu").textContent = q.giai_thich;
    var tiep = $("#pl-tiep");
    tiep.textContent = T.tiep;
    tiep.onclick = dongCau;
    $("#pl-phan-hoi").hidden = false;
    tiep.focus();
  }
  function dongCau() {
    if (hop.close) hop.close(); else hop.removeAttribute("open");
    var c = dangCho; dangCho = null; dangHoi = false;
    if (!c || c.ketQua === null) return;
    var dung = c.ketQua, ai = c.ai, ve = ai ? (M.x + M.w / 2 < ai.x + ai.w / 2 ? -1 : 1) : 0;
    if (c.kieu === "hop") {
      if (dung) { if (L.tim < 3) L.tim++; else L.soXu += 3; no(M.x + M.w / 2, M.y, "#34D399", 10); }
      M.khien = Math.max(M.khien, 0.3);
    } else if (c.kieu === "dap") {
      M.vy = -560; M.khien = 0.6;
      if (dung) { ai.song = false; L.soXu += 2; no(ai.x + ai.w / 2, ai.y + ai.h / 2, ai.bay ? "#A78BFA" : L.a.mau, 12); } else ai.choang = 2.5;
    } else if (c.kieu === "dung") {
      if (dung) { ai.song = false; L.soXu += 1; no(ai.x + ai.w / 2, ai.y + ai.h / 2, ai.bay ? "#A78BFA" : L.a.mau, 12); M.khien = 0.6; }
      else { ai.choang = 1.2; biThuong(ve); }
    } else if (c.kieu === "trum") {
      var tr = L.trum;
      if (dung) {
        tr.sang = 0.5; M.khien = 1.2; M.vx = ve * 300; M.vy = -420;
        tr.x = Math.max((L.A + 1) * O, Math.min(L.G * O - 2 - tr.w, tr.x - ve * 3 * O)); tr.vx = -ve * 140; tr.lui = 1.4;
        no(tr.x + tr.w / 2, tr.y + 20, "#FDE68A", 10);
        if (tr.hp <= 0) { tr.song = false; L.mo = true; L.soXu += 5; no(tr.x + tr.w / 2, tr.y + tr.h / 2, L.a.mauTrum, 30); L.bao = {chu: T.cong, t: 2}; }
      } else biThuong(ve);
    }
    phim.trai = phim.phai = phim.nhay = false; demNhay = 0;
    truoc = performance.now(); du = 0;
    if (trangThai === "choi") cv.focus({preventScroll: true});
  }

  // ---------- Vẽ ----------
  function hinhTron(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  var MA_TRUM = typeof Path2D !== "undefined" ? new Path2D("M20 80 Q8 80 10 62 Q4 40 24 34 Q30 10 58 14 Q84 6 94 30 Q116 34 110 58 Q114 80 96 80 Q92 92 80 84 Q70 94 60 84 Q48 94 40 84 Q28 92 20 80Z") : null;
  var CHU = "Inter, system-ui, sans-serif";

  function ve() {
    if (!ctx) return;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    if (!L) {
      var gd = ctx.createLinearGradient(0, 0, 0, CAO); gd.addColorStop(0, "#7DD3FC"); gd.addColorStop(1, "#E0F2FE");
      ctx.fillStyle = gd; ctx.fillRect(0, 0, rongNhin, CAO); veMay(0); veDoi(0, "#86EFAC");
      ctx.fillStyle = "#B45309"; ctx.fillRect(0, 450, rongNhin, 90); ctx.fillStyle = "#22C55E"; ctx.fillRect(0, 450, rongNhin, 12);
      return;
    }
    var a = L.a, cam = Math.max(0, Math.min(L.W * O - rongNhin, M.x + M.w / 2 - rongNhin * 0.4));
    var gr = ctx.createLinearGradient(0, 0, 0, CAO); gr.addColorStop(0, a.troi[0]); gr.addColorStop(1, a.troi[1]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, rongNhin, CAO);
    veMay(cam); veDoi(cam, a.doi);
    ctx.save(); ctx.translate(-Math.round(cam), 0);
    var c0 = Math.max(0, Math.floor(cam / O) - 1), c1 = Math.min(L.W - 1, Math.ceil((cam + rongNhin) / O) + 1);
    for (var x = c0; x <= c1; x++) for (var y = 0; y < HANG; y++) { var v = L.t[y * L.W + x]; if (v) veO(v, x, y); }
    a.cp.slice(1).forEach(function (c) { veCo(c * O + 10, 10 * O, 70, L.cp >= c ? "#22C55E" : "#CBD5E1", 22); });
    veCo(L.co, 10 * O, 200, "#2563EB", 46);
    L.xu.forEach(function (c) { if (!c.an && c.x > cam - 30 && c.x < cam + rongNhin + 30) veXu(c.x, c.y); });
    L.quai.forEach(function (q) { if (q.song && q.x > cam - 80 && q.x < cam + rongNhin + 80) veQuai(q); });
    if (L.trum.song) veTrum(L.trum);
    veMark();
    L.hat.forEach(function (p) { ctx.globalAlpha = Math.max(0, Math.min(1, p.song * 2)); ctx.fillStyle = p.mau; ctx.fillRect(p.x - 4, p.y - 4, 8, 8); });
    ctx.globalAlpha = 1;
    ctx.restore();
    veHud();
  }
  function veMay(cam) {
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (var k = -1; k < rongNhin / 380 + 2; k++) {
      var bx = k * 380 - (cam * 0.15) % 380, by = 70 + ((k % 3) + 3) % 3 * 30;
      ctx.beginPath(); ctx.arc(bx + 40, by, 26, 0, 7); ctx.arc(bx + 72, by - 12, 32, 0, 7); ctx.arc(bx + 106, by, 24, 0, 7); ctx.fill();
    }
  }
  function veDoi(cam, mau) {
    ctx.fillStyle = mau;
    for (var k = -1; k < rongNhin / 520 + 2; k++) {
      var bx = k * 520 - (cam * 0.35) % 520;
      ctx.beginPath(); ctx.arc(bx + 160, 470, 170, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 400, 480, 120, Math.PI, 0); ctx.fill();
    }
  }
  function veO(v, x, y) {
    var px = x * O, py = y * O;
    if (v === 1) {
      ctx.fillStyle = "#B45309"; ctx.fillRect(px, py, O, O);
      ctx.fillStyle = "#92400E"; ctx.fillRect(px + 8, py + 22, 6, 6); ctx.fillRect(px + 28, py + 34, 5, 5);
      if (o(x, y - 1) !== 1) { ctx.fillStyle = "#22C55E"; ctx.fillRect(px, py, O, 12); ctx.fillStyle = "#16A34A"; ctx.fillRect(px, py + 12, O, 3); }
    } else if (v === 2) {
      ctx.fillStyle = "#EA580C"; ctx.fillRect(px, py, O, O);
      ctx.fillStyle = "#FDBA74"; ctx.fillRect(px, py, O, 3); ctx.fillRect(px, py + 22, O, 2); ctx.fillRect(px + 21, py, 2, 22); ctx.fillRect(px + 10, py + 24, 2, 21); ctx.fillRect(px + 33, py + 24, 2, 21);
    } else if (v === 3 || v === 4) {
      var nay = v === 3 ? Math.sin(L.thoiGian * 4 + x) * 2 : 0;
      hinhTron(px + 1, py + 1 + nay, O - 2, O - 2, 6); ctx.fillStyle = v === 3 ? "#FACC15" : "#A16207"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = v === 3 ? "#CA8A04" : "#713F12"; ctx.stroke();
      if (v === 3) { ctx.fillStyle = "#713F12"; ctx.font = "800 28px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", px + O / 2, py + O / 2 + 1 + nay); }
    } else if (v === 5) {
      ctx.fillStyle = "#94A3B8";
      for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(px + k * 15, py + O); ctx.lineTo(px + k * 15 + 7.5, py + 18); ctx.lineTo(px + k * 15 + 15, py + O); ctx.fill(); }
    } else if (v === 6 && !L.mo) {
      ctx.fillStyle = "#4C1D95"; ctx.fillRect(px + 6, py, 33, O);
      ctx.fillStyle = "#A78BFA"; ctx.fillRect(px + 12, py, 5, O); ctx.fillRect(px + 28, py, 5, O);
      if (y === 7) { ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.arc(px + O / 2, py + O / 2, 9, 0, 7); ctx.fill(); }
    }
  }
  function veCo(x, dat, cao, mau, rong) {
    ctx.fillStyle = "#475569"; ctx.fillRect(x, dat - cao, 4, cao);
    ctx.fillStyle = mau; ctx.beginPath(); ctx.moveTo(x + 4, dat - cao); ctx.lineTo(x + 4 + rong, dat - cao + rong * 0.35); ctx.lineTo(x + 4, dat - cao + rong * 0.7); ctx.fill();
  }
  function veXu(x, y) {
    var co = Math.abs(Math.sin(L.thoiGian * 3 + x * 0.01));
    ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.ellipse(x, y, 4 + 9 * co, 13, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#CA8A04"; ctx.lineWidth = 2.5; ctx.stroke();
  }
  function nhan(chu, x, y) {
    ctx.font = "700 13px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var w = ctx.measureText(chu).width + 12;
    hinhTron(x - w / 2, y - 10, w, 20, 10); ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fill();
    ctx.fillStyle = "#0F172A"; ctx.fillText(chu, x, y + 0.5);
  }
  function mat(cx, cy, huong) {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx - 8, cy, 6, 0, 7); ctx.arc(cx + 8, cy, 6, 0, 7); ctx.fill();
    ctx.fillStyle = "#1E1B4B"; ctx.beginPath(); ctx.arc(cx - 8 + huong * 2, cy + 1, 3, 0, 7); ctx.arc(cx + 8 + huong * 2, cy + 1, 3, 0, 7); ctx.fill();
    ctx.strokeStyle = "#1E1B4B"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 10); ctx.lineTo(cx - 4, cy - 6); ctx.moveTo(cx + 14, cy - 10); ctx.lineTo(cx + 4, cy - 6); ctx.stroke();
  }
  function veQuai(q) {
    var h = q.choang > 0 ? q.h * 0.55 : q.h, y = q.y + q.h - h, huong = q.vx >= 0 ? 1 : -1;
    if (q.bay) {
      var vo = Math.sin(L.thoiGian * 18) * 8;
      ctx.fillStyle = "#E9D5FF"; ctx.beginPath(); ctx.ellipse(q.x + 2, y + 10 - vo, 12, 7, -0.5, 0, 7); ctx.ellipse(q.x + q.w - 2, y + 10 - vo, 12, 7, 0.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#8B5CF6";
    } else ctx.fillStyle = L.a.mau;
    hinhTron(q.x, y, q.w, h, 14); ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,.35)"; ctx.lineWidth = 2; ctx.stroke();
    if (q.choang > 0) { ctx.fillStyle = "#0F172A"; ctx.font = "700 14px " + CHU; ctx.textAlign = "center"; ctx.fillText("z z", q.x + q.w / 2, y - 6); }
    else { mat(q.x + q.w / 2, y + 13, huong); nhan(q.ten, q.x + q.w / 2, y - 16); }
  }
  function veTrum(tr) {
    ctx.save(); ctx.translate(tr.x - 2, tr.y - 6); ctx.scale(tr.w / 116, (tr.h + 8) / 90);
    ctx.fillStyle = tr.sang > 0 && Math.floor(tr.sang * 20) % 2 ? "#fff" : L.a.mauTrum;
    if (MA_TRUM) ctx.fill(MA_TRUM); else ctx.fillRect(4, 10, 110, 80);
    ctx.restore();
    ctx.save(); ctx.translate(tr.x + tr.w / 2, tr.y + 34); ctx.scale(1.5, 1.5); mat(0, 0, M.x < tr.x ? -1 : 1); ctx.restore();
    ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.moveTo(tr.x + 26, tr.y + 4); ctx.lineTo(tr.x + 32, tr.y - 16); ctx.lineTo(tr.x + 48, tr.y - 2); ctx.lineTo(tr.x + 64, tr.y - 16); ctx.lineTo(tr.x + 70, tr.y + 4); ctx.fill();
    nhan(L.a.trum, tr.x + tr.w / 2, tr.y - 30);
  }
  function veMark() {
    if (M.khien > 0 && Math.floor(M.khien * 12) % 2 && !dangHoi) return;
    var im = M.dat ? anh.chay : anh.nhay;
    var cao = 64, rong = im && im.naturalWidth ? cao * im.naturalWidth / im.naturalHeight : 44;
    var nhun = M.dat && Math.abs(M.vx) > 20 ? Math.abs(Math.sin(M.buoc / 18)) * 4 : 0;
    ctx.save(); ctx.translate(M.x + M.w / 2, M.y + M.h - nhun);
    if (M.huong < 0) ctx.scale(-1, 1);
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -rong / 2, -cao + 2, rong, cao);
    else { ctx.fillStyle = "#2563EB"; ctx.fillRect(-M.w / 2, -M.h, M.w, M.h); }
    ctx.restore();
  }
  function veHud() {
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    hinhTron(12, 12, 236, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    var tim = ""; for (var k = 0; k < 3; k++) tim += k < L.tim ? "♥" : "♡";
    ctx.font = "800 26px " + CHU; ctx.fillStyle = "#FB7185"; ctx.fillText(tim, 24, 35);
    ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.arc(128, 34, 10, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 22px " + CHU; ctx.fillText("" + L.soXu, 145, 35);
    ctx.font = "700 15px " + CHU; ctx.fillStyle = "#E2E8F0"; ctx.fillText(T.ai + " " + (L.i + 1), 195, 35);
    if (L.trum.song && L.trum.bat) {
      var w = Math.min(300, rongNhin - 300), x = rongNhin - w - 20;
      hinhTron(x - 8, 66, w + 16, 30, 12); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
      hinhTron(x, 74, w, 14, 7); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fill();
      hinhTron(x, 74, Math.max(14, w * L.trum.hp / L.trum.max), 14, 7); ctx.fillStyle = "#C084FC"; ctx.fill();
    }
    if (L.bao) {
      ctx.font = "800 34px " + CHU; ctx.textAlign = "center";
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(15,23,42,.7)"; ctx.strokeText(L.bao.chu, rongNhin / 2, 150);
      ctx.fillStyle = "#FDE68A"; ctx.fillText(L.bao.chu, rongNhin / 2, 150);
    }
  }

  // ---------- Vòng lặp ----------
  function vong(t) {
    raf = requestAnimationFrame(vong);
    var dt = Math.min(0.05, Math.max(0, (t - truoc) / 1000)); truoc = t;
    if (trangThai === "choi" && !dangHoi && !document.hidden) {
      du += dt;
      while (du >= BUOC && trangThai === "choi" && !dangHoi) { capNhat(BUOC); du -= BUOC; }
    }
    ve();
  }
  function chayVong() { if (!raf) { truoc = performance.now(); du = 0; raf = requestAnimationFrame(vong); } }
  function dungVong() { if (raf) cancelAnimationFrame(raf); raf = 0; ve(); }

  function coGian() {
    var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width || !r.height) return;
    rongNhin = CAO * r.width / r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    tiLe = cv.width / rongNhin;
    ve();
  }

  // ---------- Màn chọn ải / kết quả ----------
  function hienMan(noiDung) {
    man.innerHTML = ""; man.appendChild(noiDung); man.hidden = false;
    $("#pl-menu").hidden = true;
    khung.classList.remove("is-choi");
    var n = $("button:not([aria-disabled]), a", man); if (n) n.focus({preventScroll: true});
  }
  function manChon() {
    if (dangHoi) return;
    trangThai = "chon"; dungVong();
    var w = el("div", "pl-chon-ai");
    w.appendChild(el("h2", null, T.chon));
    w.appendChild(el("p", null, T.chonTxt));
    var ds = el("div", "pl-ds-ai");
    AI.forEach(function (a, i) {
      var mo = i < tienDo.mo, s = tienDo.sao[a.id] || 0;
      var b = el("button", "pl-the" + (mo ? "" : " is-khoa") + (s ? " is-xong" : "")); b.type = "button";
      b.appendChild(el("span", "pl-the-so", mo ? String(i + 1) : "🔒"));
      b.appendChild(el("b", null, a.ten));
      b.appendChild(el("span", "pl-the-sao", saoChu(s)));
      b.setAttribute("aria-label", T.ai + " " + (i + 1) + ": " + a.ten + (mo ? (s ? ", " + s + "/3 ★" : "") : ". " + T.khoa));
      if (!mo) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", function () { if (!mo) { thongBao(T.khoa); return; } batDauAi(i); });
      ds.appendChild(b);
    });
    w.appendChild(ds);
    hienMan(w);
    $("#pl-tong").textContent = T.tongSao(tongSao());
  }
  function batDauAi(i) {
    if (!daTai) { thongBao(T.dangTai); return; }
    dungAi(i);
    man.hidden = true; $("#pl-menu").hidden = false;
    trangThai = "choi"; khung.classList.add("is-choi");
    phim.trai = phim.phai = phim.nhay = false; demNhay = 0;
    L.bao = {chu: T.ai + " " + (i + 1) + " · " + L.a.ten, t: 2};
    var r = khung.getBoundingClientRect(), dk = $("#pl-dk").getBoundingClientRect();
    if (r.top < 0 || Math.max(r.bottom, dk.bottom) > window.innerHeight) $("#pl").scrollIntoView({block: "start", behavior: "smooth"});
    cv.focus({preventScroll: true});
    chayVong();
  }
  function thangAi() {
    trangThai = "xong";
    var sao = Math.max(1, L.tim), a = L.a, cuoi = L.i === AI.length - 1;
    tienDo.sao[a.id] = Math.max(tienDo.sao[a.id] || 0, sao);
    tienDo.mo = Math.max(tienDo.mo, Math.min(L.i + 2, AI.length));
    luu();
    var kq = el("div", "pl-kq");
    var h = el("img"); h.alt = ""; h.width = 110; h.height = 110; h.src = GOC + "assets/mascot/mark-chien-thang.webp"; kq.appendChild(h);
    kq.appendChild(el("h3", null, cuoi ? T.thang : T.qua));
    kq.appendChild(el("p", "pl-kq-sao", saoChu(sao)));
    kq.appendChild(el("p", null, cuoi ? T.thangTxt(tongSao()) : T.quaTxt(sao, L.soXu)));
    var hang = el("div", "pl-kq-nut");
    if (cuoi) {
      var q = el("a", "btn btn-yt", EN ? "Take the quiz" : "Làm bài kiểm tra"); q.href = "kiem-tra.html"; hang.appendChild(q);
      var c = el("a", "btn", EN ? "Certificates" : "Giấy chứng nhận"); c.href = "chung-nhan.html"; hang.appendChild(c);
    } else {
      var t = el("button", "btn btn-yt", T.aiTiep); t.type = "button"; var tiep = L.i + 1;
      t.addEventListener("click", function () { batDauAi(tiep); }); hang.appendChild(t);
    }
    var v = el("button", "btn", T.veChon); v.type = "button"; v.addEventListener("click", manChon); hang.appendChild(v);
    kq.appendChild(hang);
    hienMan(kq);
    $("#pl-tong").textContent = T.tongSao(tongSao());
  }
  function thuaAi() {
    trangThai = "xong";
    var i = L.i, kq = el("div", "pl-kq");
    var h = el("img"); h.alt = ""; h.width = 110; h.height = 110; h.src = GOC + "assets/mascot/mark-dau-dau.webp"; kq.appendChild(h);
    kq.appendChild(el("h3", null, T.thua));
    kq.appendChild(el("p", null, T.thuaTxt));
    var hang = el("div", "pl-kq-nut");
    var l = el("button", "btn btn-yt", T.lai); l.type = "button"; l.addEventListener("click", function () { batDauAi(i); }); hang.appendChild(l);
    var v = el("button", "btn", T.veChon); v.type = "button"; v.addEventListener("click", manChon); hang.appendChild(v);
    kq.appendChild(hang);
    hienMan(kq);
  }
  function thongBao(chu) {
    var b = $("#pl-bao"); b.textContent = chu; b.hidden = false;
    clearTimeout(thongBao.h); thongBao.h = setTimeout(function () { b.hidden = true; }, 2600);
  }

  // ---------- Điều khiển ----------
  var PHIM = {ArrowLeft: "trai", KeyA: "trai", ArrowRight: "phai", KeyD: "phai", ArrowUp: "nhay", KeyW: "nhay", Space: "nhay"};
  function batPhim() {
    document.addEventListener("keydown", function (e) {
      var k = PHIM[e.code];
      if (!k || trangThai !== "choi" || dangHoi) return;
      var tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
      if ((tg === "BUTTON" || tg === "A") && e.code === "Space") return;
      e.preventDefault();
      if (k === "nhay" && !phim.nhay) demNhay = 0.12;
      phim[k] = true;
    });
    document.addEventListener("keyup", function (e) { var k = PHIM[e.code]; if (k) phim[k] = false; });
    window.addEventListener("blur", function () { phim.trai = phim.phai = phim.nhay = false; });
    document.querySelectorAll("#pl-dk [data-k]").forEach(function (b) {
      var k = b.dataset.k;
      function an(e) { e.preventDefault(); if (k === "nhay" && !phim.nhay) demNhay = 0.12; phim[k] = true; b.classList.add("is-an"); try { b.setPointerCapture(e.pointerId); } catch (x) {} }
      function nha() { phim[k] = false; b.classList.remove("is-an"); }
      b.addEventListener("pointerdown", an);
      b.addEventListener("pointerup", nha); b.addEventListener("pointercancel", nha); b.addEventListener("lostpointercapture", nha);
      b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
  }

  function batDau() {
    cv = $("#pl-canvas"); hop = $("#pl-hop"); man = $("#pl-man"); khung = $("#pl-khung");
    if (!cv || !hop || !cv.getContext) return;
    ctx = cv.getContext("2d");
    cv.setAttribute("aria-label", T.canvas);
    ["chay", "nhay"].forEach(function (k) {
      var im = new Image(); im.src = GOC + "assets/mascot/" + (k === "chay" ? "mark-trinh-bay-tinh.webp" : "mark-chi-len-tinh.webp");
      im.onload = function () { ve(); }; anh[k] = im;
    });
    coGian();
    window.addEventListener("resize", coGian);
    batPhim();
    hop.addEventListener("cancel", function (e) { e.preventDefault(); if (dangCho && dangCho.ketQua !== null) dongCau(); });
    $("#pl-ra").hidden = true;
    $("#pl-menu").textContent = T.menu;
    $("#pl-menu").addEventListener("click", manChon);
    $("#pl-xoa").textContent = T.xoa;
    $("#pl-xoa").addEventListener("click", function () {
      if (!confirm(T.xoaHoi)) return;
      tienDo = {mo: 1, sao: {}}; luu(); manChon();
    });
    manChon();
    taiDuLieu().catch(function () { thongBao(T.loi); });
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__pl = {L: function () { return L; }, M: function () { return M; }, batDauAi: batDauAi, phim: phim, trangThai: function () { return trangThai; }, cau: function () { return dangCho; }};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

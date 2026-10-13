// Game "Mark phiêu lưu" (phieu-luu.html + en/phieu-luu.html): game đi cảnh 4 ải.
// Câu hỏi lấy từ 4 bộ "co-ban" trong data/bo-kiem-tra.json và được trả lời bằng cách chơi:
// trạm câu hỏi có hai kiểu xen kẽ: đứng vào ô A/B/C/D trên mặt đất (đúng thì ô bật Mark lên, sai thì ô sập
// thành hố bẫy) hoặc nhảy húc khối A/B/C/D trên cao (sai thì khối nhả ra một con quái). Game không dừng lại để hỏi.
// Quái: đạp lên đầu để hạ, đụng ngang mất tim, bắn bằng "tia kiến thức" kiếm được khi trả lời đúng.
// Trùm: mỗi đáp án đúng là một tia sét đánh trùm, sai làm trùm nổi giận; các hiệp đổi kiểu ô / khối. Tiến độ lưu ở localStorage "mhai-phieu-luu-2"
// ({mo: số ải đã mở, sao: {id: 1-3}}).
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var GOC = EN ? "../" : "";
  var KHOA = "mhai-phieu-luu-2";
  var O = 45, HANG = 12, CAO = HANG * O, BUOC = 1 / 120;
  var TRONG_LUC = 2300, NHAY = -960, CHAY = 290, TANG = 1900;
  // Loại ô: 1 đất, 2 gạch, 3 hộp thưởng, 4 hộp đã dùng, 5 gai, 6 cổng trùm,
  // 7 ô / khối đáp án (ô ở hàng 10, khối ở hàng 6), 8 cổng trạm, 9 đáp án sai, 10 đáp án đúng.

  var T = EN ? {
    dung: "True", sai: "False", chuDS: ["✓", "✗"], dungRoi: "Correct!", saiRoi: "Not that one.",
    tram: function (i, n, o) { return "Question gate " + i + " of " + n + (o ? " · stand on the tile with the right answer" : " · jump into the block with the right answer"); },
    trum: function (n, o) { return "Boss fight · " + (o ? "stand on the right tile" : "hit the right block") + " to call down lightning · " + n + " to go"; },
    goiY: "The right answer is glowing green.",
    chon: "Choose a level", chonTxt: "Run, jump and stomp monsters. Answer by standing on the right A, B, C or D tile (a wrong tile is a trap door) or by jumping into the right block (a wrong block lets a monster out).",
    khoa: "Clear the previous level first.", ai: "Level",
    qua: "Level cleared!", quaTxt: function (s, d, n, c) { return s + " of 3 stars · " + d + " points · " + n + " of " + c + " right on the first try"; },
    thua: "Out of hearts", thuaTxt: "Bit says: read the explanations under the game, then try again. Cleared levels stay unlocked.",
    lai: "Try again", aiTiep: "Next level", veChon: "Levels",
    thang: "You beat the King of Hallucination!", thangTxt: function (s) { return "Total: " + s + " of 12 stars. Take the full quiz to earn your certificate."; },
    tongSao: function (s) { return s + " / 12 stars"; }, xoa: "Reset progress", xoaHoi: "Reset all levels?",
    loi: "Couldn't load the questions. Please reload the page.", dangTai: "Loading questions…",
    menu: "☰ Levels", toanVao: "Play full screen", toanRa: "Exit full screen", gon: "▾ Hide", mo: "▴ Show question", trumDen: "Boss!", cong: "Gate open!", canvas: "Game screen", combo: "Combo",
    danHet: "No bolts yet. Answer right to earn some."
  } : {
    dung: "Đúng", sai: "Sai", chuDS: ["✓", "✗"], dungRoi: "Chính xác!", saiRoi: "Chưa đúng rồi.",
    tram: function (i, n, o) { return "Trạm câu hỏi " + i + "/" + n + (o ? " · đứng vào ô có đáp án đúng" : " · nhảy húc khối có đáp án đúng"); },
    trum: function (n, o) { return "Đấu trùm · " + (o ? "đứng vào ô đúng" : "húc khối đúng") + " để gọi sét · còn " + n + " đòn"; },
    goiY: "Đáp án đúng đang sáng xanh.",
    chon: "Chọn ải", chonTxt: "Chạy, nhảy, đạp quái. Trả lời bằng cách đứng vào ô A, B, C, D đúng (sai là sập bẫy) hoặc nhảy húc khối đúng (sai thì quái chui ra).",
    khoa: "Qua ải trước để mở ải này.", ai: "Ải",
    qua: "Qua ải!", quaTxt: function (s, d, n, c) { return s + " trên 3 sao · " + d + " điểm · đúng ngay " + n + "/" + c + " câu"; },
    thua: "Hết tim rồi", thuaTxt: "Bit nhắn: đọc lời giải thích dưới khung game rồi thử lại nhé. Các ải đã qua vẫn được giữ.",
    lai: "Chơi lại ải", aiTiep: "Ải tiếp theo", veChon: "Chọn ải",
    thang: "Bạn đã hạ Vua Ảo Giác!", thangTxt: function (s) { return "Tổng cộng " + s + " trên 12 sao. Làm bài kiểm tra đầy đủ để nhận giấy chứng nhận."; },
    tongSao: function (s) { return s + " / 12 sao"; }, xoa: "Chơi lại từ đầu", xoaHoi: "Xóa tiến độ của tất cả các ải?",
    loi: "Không tải được câu hỏi. Bạn tải lại trang nhé.", dangTai: "Đang tải câu hỏi…",
    menu: "☰ Chọn ải", toanVao: "Chơi toàn màn hình", toanRa: "Thoát toàn màn hình", gon: "▾ Thu gọn", mo: "▴ Xem câu hỏi", trumDen: "Trùm xuất hiện!", cong: "Cổng đã mở!", canvas: "Màn hình game", combo: "Combo",
    danHet: "Chưa có tia kiến thức. Trả lời đúng để nhận thêm."
  };

  // 4 ải. ho: hố [x, rộng]; ben: bệ gạch [x, hàng, dài]; hop: hộp thưởng [x, hàng]; xu: [x, hàng, số xu];
  // quaiX: quái đi bộ (cột x); bayX: quái bay [x, hàng]; gai: [x, dài]; bac: bậc [x, cao]; cp: cột hồi sinh;
  // tram: cột bắt đầu của trạm câu hỏi (dọn phẳng 11 cột từ tram-1). Khu trùm luôn là 24 ô cuối: cổng ở W-8, cờ đích ở W-4.
  var AI = [
    {id: "hieu-lam", ten: EN ? "Myth Village" : "Làng Hiểu Lầm", quai: EN ? "Rumor" : "Tin đồn", bay: EN ? "Hype" : "Thổi phồng",
      trum: EN ? "King of Myths" : "Vua Hiểu Lầm", mau: "#22C55E", mauTrum: "#16A34A", troi: ["#7DD3FC", "#E0F2FE"], doi: "#86EFAC", W: 100, hp: 3,
      ho: [[18, 2], [46, 3]], ben: [[9, 7, 4], [24, 7, 3], [29, 5, 3], [52, 7, 3], [57, 5, 3], [63, 7, 4]],
      hop: [[14, 6], [39, 6], [68, 4]], xu: [[24, 6, 3], [29, 4, 3], [57, 4, 3], [33, 8, 3]],
      quaiX: [12, 27, 37, 54, 66], bayX: [[47, 6]], gai: [[34, 1]], bac: [[72, 1], [73, 2]], cp: [2, 50], tram: [34, 58]},
    {id: "prompt", ten: EN ? "Prompt Workshop" : "Xưởng Prompt", quai: EN ? "Lazy Prompt" : "Prompt cụt", bay: EN ? "Vague Ask" : "Hỏi mơ hồ",
      trum: EN ? "Lazy Prompt Lord" : "Prompt Lười", mau: "#F97316", mauTrum: "#EA580C", troi: ["#FDBA74", "#FEF3C7"], doi: "#FCD34D", W: 108, hp: 3,
      ho: [[15, 2], [31, 3], [55, 2], [70, 3]], ben: [[10, 7, 3], [20, 6, 4], [27, 4, 3], [36, 7, 3], [44, 5, 4], [58, 6, 3], [64, 4, 3], [73, 7, 3]],
      hop: [[12, 3], [46, 1], [61, 6], [79, 6]], xu: [[20, 5, 4], [27, 3, 3], [44, 4, 4], [64, 3, 3], [32, 6, 2]],
      quaiX: [8, 24, 39, 51, 62, 77], bayX: [[32, 6], [71, 5]], gai: [[48, 2], [66, 1]], bac: [[80, 1], [81, 2], [82, 3]], cp: [2, 41, 68], tram: [38, 58]},
    {id: "an-toan", ten: EN ? "Safety Fort" : "Pháo đài An toàn", quai: EN ? "Scam Text" : "Tin nhắn lừa", bay: "Deepfake",
      trum: EN ? "Scam Boss" : "Trùm Lừa Đảo", mau: "#EF4444", mauTrum: "#B91C1C", troi: ["#C4B5FD", "#FCE7F3"], doi: "#F9A8D4", W: 112, hp: 3,
      ho: [[13, 3], [26, 2], [40, 3], [57, 3], [73, 3]], ben: [[7, 7, 3], [17, 6, 3], [22, 4, 3], [30, 7, 4], [35, 7, 3], [43, 6, 2], [50, 7, 3], [60, 5, 4], [67, 7, 3], [70, 5, 2]],
      hop: [[9, 3], [33, 3], [62, 1], [82, 6]], xu: [[17, 5, 3], [22, 3, 3], [35, 6, 3], [60, 4, 4], [70, 4, 2]],
      quaiX: [10, 20, 36, 47, 53, 65, 80], bayX: [[14, 5], [49, 5], [58, 6], [75, 7]], gai: [[33, 1], [52, 1], [69, 2]], bac: [[84, 2], [85, 3], [86, 1]], cp: [2, 29, 63], tram: [29, 61]},
    {id: "cong-viec", ten: EN ? "AI Office" : "Văn phòng AI", quai: EN ? "Fake Stat" : "Số liệu bịa", bay: EN ? "Leaked File" : "File lộ",
      trum: EN ? "King of Hallucination" : "Vua Ảo Giác", mau: "#64748B", mauTrum: "#7C3AED", troi: ["#4C1D95", "#7C3AED"], doi: "#A78BFA", W: 118, hp: 4, tron: true,
      ho: [[12, 3], [24, 3], [36, 2], [48, 3], [63, 3], [77, 3]], ben: [[7, 7, 3], [16, 5, 4], [20, 7, 2], [28, 5, 3], [33, 3, 3], [40, 6, 3], [47, 4, 3], [52, 6, 3], [58, 7, 3], [62, 4, 4], [70, 6, 3], [76, 4, 3], [82, 7, 3]],
      hop: [[9, 3], [30, 1], [43, 2], [72, 2], [88, 6]], xu: [[16, 4, 4], [28, 4, 3], [33, 2, 3], [47, 3, 3], [62, 3, 4], [76, 3, 3]],
      quaiX: [6, 19, 30, 42, 54, 59, 71, 74, 85], bayX: [[13, 6], [25, 7], [46, 6], [64, 7], [86, 6]], gai: [[20, 1], [44, 1], [56, 1], [87, 2]], bac: [[89, 1], [90, 2], [91, 3], [92, 1]], cp: [2, 39, 68], tram: [38, 66]}
  ];

  var $ = function (s, g) { return (g || document).querySelector(s); };
  var bo = {}, daTai = false, tienDo = docTienDo();
  var cv, ctx, khung, man, rongNhin = 960, tiLe = 1, anh = {}, raf = 0, truoc = 0, du = 0;
  var phim = {trai: false, phai: false, nhay: false, ban: false}, demNhay = 0, demBan = 0;
  var L = null, M = null, trangThai = "chon"; // chon | choi | xong

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
    function trongTram(x) { return a.tram.some(function (s) { return x >= s - 1 && x <= s + 9; }); }
    for (var x = 0; x < W; x++) { dat(x, 10, 1); dat(x, 11, 1); }
    a.ho.forEach(function (h) { for (var k = 0; k < h[1]; k++) { dat(h[0] + k, 10, 0); dat(h[0] + k, 11, 0); } });
    a.ben.forEach(function (b) { for (var k = 0; k < b[2]; k++) dat(b[0] + k, b[1], 2); });
    a.hop.forEach(function (h) { dat(h[0], h[1], 3); });
    a.gai.forEach(function (g) { for (var k = 0; k < g[1]; k++) dat(g[0] + k, 9, 5); });
    a.bac.forEach(function (b) { for (var k = 0; k < b[1]; k++) dat(b[0], 9 - k, 1); });
    // Dọn phẳng chỗ đặt trạm câu hỏi, dựng cổng trạm.
    var tram = a.tram.map(function (s, k) {
      for (var c = s - 1; c <= s + 9; c++) for (var y = 0; y < HANG; y++) dat(c, y, y >= 10 ? 1 : 0);
      for (var y2 = 0; y2 < 10; y2++) dat(s + 9, y2, 8);
      return {x: s, so: k + 1, trum: false, xong: false, hien: false};
    });
    var A = W - 24, G = W - 8;
    for (var y3 = 0; y3 < 10; y3++) dat(G, y3, 6);
    var quai = a.quaiX.filter(function (x) { return !trongTram(x); }).map(function (x) { return taoQuai(x * O + 4, 10 * O - 32, false, a.quai); });
    a.bayX.forEach(function (b) { if (!trongTram(b[0])) quai.push(taoQuai(b[0] * O + 4, b[1] * O, true, a.bay)); });
    var xu = [];
    a.xu.forEach(function (c) { for (var k = 0; k < c[2]; k++) if (!trongTram(c[0] + k)) xu.push({x: (c[0] + k) * O + O / 2, y: c[1] * O + O / 2, an: false}); });
    var cp = a.cp.filter(function (c) { return !trongTram(c); }).concat(a.tram.map(function (s) { return s - 1; }), [A + 1]).sort(function (p, q) { return p - q; });
    L = {i: i, a: a, W: W, t: t, A: A, G: G, co: (W - 4) * O, mo: false, quai: quai, xu: xu, hat: [], dan: [], bom: [], cpDs: cp, cp: cp[0],
      tim: 3, tia: 0, diem: 0, combo: 0, dungNgay: 0, soCau: 0, thoiGian: 0, bao: null, set: null, khoi: {}, tram: tram, cauDang: null, henCau: 0, dung: null, sap: [],
      hang: tron(boCua(a)),
      trum: {x: (G - 4) * O, y: 10 * O - 84, w: 96, h: 84, vx: -100, vy: 0, hp: a.hp, max: a.hp, song: true, bat: false, nhay: 1.5, sang: 0, lui: 0, gian: 0, nem: 2.5, dat: false}};
    L.tramTrum = {x: A + 2, trum: true, xong: false, hien: false};
    M = {x: 2 * O, y: 10 * O - 44, w: 30, h: 44, vx: 0, vy: 0, dat: false, huong: 1, khien: 0, coyote: 0, buoc: 0};
  }
  function taoQuai(x, y, bay, ten) {
    return bay ? {x: x, y: y, goc: x, goc2: y, w: 36, h: 30, vx: 70, vy: 0, song: true, bay: true, ten: ten, pha: Math.random() * 6}
      : {x: x, y: y, w: 36, h: 32, vx: -60, vy: 0, song: true, bay: false, ten: ten};
  }

  function o(tx, ty) {
    if (tx < 0 || tx >= L.W) return 1;
    if (ty < 0 || ty >= HANG) return 0;
    return L.t[ty * L.W + tx];
  }
  function datO(x, y, v) { L.t[y * L.W + x] = v; }
  function cung(v) { return v === 1 || v === 2 || v === 3 || v === 4 || v >= 7 || (v === 6 && !L.mo); }

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
  // Trả về ô hộp thưởng / khối đáp án mà đầu Mark vừa húc (nếu có), ô gần giữa đầu nhất.
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
        var v = o(x, ty2);
        if ((v === 3 || (v === 7 && ty2 === 6)) && (!trung || Math.abs((x + 0.5) * O - giua) < Math.abs((trung[0] + 0.5) * O - giua))) trung = [x, ty2];
      }
      if (cham) { e.y = (ty2 + 1) * O; e.vy = 0; }
      return trung;
    }
    return null;
  }
  function cham(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  // ---------- Trạm câu hỏi ----------
  function datCau(st) {
    if (!L.hang.length) L.hang = tron(boCua(L.a));
    var q = L.hang.pop();
    var pa = q.loai === "dung-sai" ? [{chu: T.dung, dung: q.dung === true}, {chu: T.sai, dung: q.dung === false}]
      : tron(q.lua_chon.map(function (c, k) { return {chu: c, dung: k === q.dap_an}; }));
    var chu = pa.length === 2 ? T.chuDS : ["A", "B", "C", "D"];
    var lech = st.trum ? (pa.length === 2 ? [3, 8] : [1, 4, 7, 10]) : (pa.length === 2 ? [2, 6] : [1, 3, 5, 7]);
    xoaKhoi(st);
    st.o = st.trum ? L.soCau % 2 === 0 : st.so % 2 === 1;
    st.hang = st.o ? 10 : 6;
    st.q = q; st.pa = pa; st.lan = 0; st.cot = [];
    pa.forEach(function (p, k) { p.nhan = chu[k]; var c = st.x + lech[k]; st.cot.push(c); datO(c, st.hang, 7); if (st.o) datO(c, 11, 0); L.khoi[c] = {st: st, k: k}; });
    L.cauDang = st; L.soCau++;
    veBang(st, null);
  }
  function xoaKhoi(st) {
    (st.cot || []).forEach(function (c) { if (st.o) { datO(c, 10, 1); datO(c, 11, 1); } else datO(c, 6, 0); delete L.khoi[c]; });
    st.cot = [];
  }
  // Đầu Mark húc hộp thưởng: thêm tim nếu đang mất tim, không thì thêm 2 tia kiến thức.
  function huc(c, y) {
    if (o(c, y) === 7) { chon(c); return; }
    if (o(c, y) !== 3) return;
    datO(c, y, 4);
    if (L.tim < 3) L.tim++; else L.tia += 2;
    no((c + 0.5) * O, y * O, "#34D399", 10);
  }
  // Mark đứng đủ lâu trên một ô đáp án thì chốt đáp án đó.
  function chon(c) {
    var k = L.khoi[c]; if (!k) return;
    var st = k.st, p = st.pa[k.k];
    L.dung = null;
    if (p.dung) {
      var ngay = st.lan === 0;
      if (ngay) { L.combo++; L.dungNgay++; L.diem += 100 * L.combo; L.tia += 3; } else L.tia += 1;
      st.cot.forEach(function (cc) { if (cc !== c && o(cc, st.hang) === 7) { if (st.o) { datO(cc, 10, 1); datO(cc, 11, 1); } else datO(cc, 6, 4); } delete L.khoi[cc]; });
      datO(c, st.hang, 10);
      if (st.o) { M.vy = -1050; M.dat = false; }
      no((c + 0.5) * O, (st.hang + (st.o ? 0 : 1)) * O, "#FACC15", 18);
      L.bao = {chu: ngay ? "+" + 100 * L.combo + (L.combo > 1 ? " · " + T.combo + " x" + L.combo : "") : T.cong, t: 1.6};
      if (st.trum) danhTrum(); else moCong(st);
      veBang(st, {dung: true, ngay: ngay});
    } else {
      // Ô sai nứt ra rồi sập thành hố bẫy; khối sai nhả ra một con quái.
      datO(c, st.hang, 9); delete L.khoi[c]; p.sai = true;
      if (st.o) L.sap.push({c: c, t: 0.35});
      else { L.quai.push(taoQuai(c * O + 4, 5 * O - 32, false, L.a.quai)); no((c + 0.5) * O, 7 * O, "#E11D48", 10); }
      st.lan++; L.combo = 0;
      if (st.trum) L.trum.gian = 5;
      veBang(st, {dung: false});
    }
  }
  function moCong(st) {
    st.xong = true; L.cauDang = null;
    var c = st.x + 9;
    for (var y = 0; y < 10; y++) if (o(c, y) === 8) { datO(c, y, 0); if (y % 3 === 0) no((c + 0.5) * O, (y + 0.5) * O, "#A78BFA", 3); }
  }
  function danhTrum() {
    var tr = L.trum;
    tr.hp--; tr.sang = 0.6; tr.gian = 0;
    L.set = {x: tr.x + tr.w / 2, t: 0.45};
    no(tr.x + tr.w / 2, tr.y + 20, "#FDE68A", 18);
    if (tr.hp <= 0) {
      tr.song = false; L.mo = true; L.diem += 500; L.cauDang = null; L.tramTrum.xong = true;
      xoaKhoi(L.tramTrum);
      no(tr.x + tr.w / 2, tr.y + tr.h / 2, L.a.mauTrum, 40);
      L.bao = {chu: T.cong, t: 2};
      L.bom.length = 0;
    } else L.henCau = 1.2;
  }

  // Bảng câu hỏi dưới khung game (HTML): câu hỏi, các đáp án gắn chữ cái, rồi lời giải thích sau khi húc.
  function veBang(st, kq) {
    var b = $("#pl-de");
    if (!st) { b.hidden = true; return; }
    b.hidden = false; gonBang(false);
    $("#pl-de-dau").textContent = st.trum ? T.trum(L.trum.hp, st.o) : T.tram(st.so, L.tram.length, st.o);
    $("#pl-de-cau").textContent = st.q.cau;
    var ds = $("#pl-de-ds"); ds.innerHTML = "";
    ds.classList.toggle("is-ds", st.pa.length === 2);
    st.pa.forEach(function (p, k) {
      var li = el("li", null);
      li.appendChild(el("b", "pl-de-chu" + (p.nhan === "✓" ? " is-co" : p.nhan === "✗" ? " is-khong" : ""), p.nhan));
      li.appendChild(el("span", null, p.chu));
      var c = st.cot[k], v = c != null ? o(c, st.hang) : 0;
      if (p.sai) li.className = "is-sai";
      else if (v === 10 || (kq && kq.dung && p.dung)) li.className = "is-dung";
      ds.appendChild(li);
    });
    var hop = $("#pl-de-kq");
    if (!kq) { hop.hidden = true; return; }
    hop.hidden = false;
    $("#pl-de-bit").src = GOC + "assets/" + (kq.dung ? "bit-vui.svg" : "bit-sai-roi.svg");
    $("#pl-de-kq-dau").textContent = kq.dung ? T.dungRoi : T.saiRoi;
    $("#pl-de-kq-dau").className = kq.dung ? "pl-ok" : "pl-no";
    $("#pl-de-kq-chu").textContent = st.q.giai_thich + (kq.dung ? "" : " " + T.goiY);
    // Trong chế độ toàn màn hình, popup có thể phải cuộn: đưa lời giải thích vào tầm nhìn.
    if ($("#pl").classList.contains("is-toan")) b.scrollTop = b.scrollHeight;
  }

  // ---------- Cập nhật ----------
  function capNhat(dt) {
    L.thoiGian += dt;
    if (L.bao && (L.bao.t -= dt) <= 0) L.bao = null;
    if (L.set && (L.set.t -= dt) <= 0) L.set = null;
    for (var h = L.hat.length - 1; h >= 0; h--) { var p = L.hat[h]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; if ((p.song -= dt) <= 0) L.hat.splice(h, 1); }
    if (L.henCau > 0 && (L.henCau -= dt) <= 0 && L.trum.song) datCau(L.tramTrum);
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
    var hucO = diDoc(M, dt);
    for (var sp = L.sap.length - 1; sp >= 0; sp--) if ((L.sap[sp].t -= dt) <= 0) { var cs = L.sap[sp].c; datO(cs, 10, 0); datO(cs, 11, 0); no((cs + 0.5) * O, 10 * O, "#78350F", 10); L.sap.splice(sp, 1); }
    var cDung = Math.floor((M.x + M.w / 2) / O);
    if (M.dat && Math.floor((M.y + M.h + 2) / O) === 10 && o(cDung, 10) === 7 && L.khoi[cDung]) {
      if (L.dung && L.dung.c === cDung) L.dung.t += dt; else L.dung = {c: cDung, t: 0};
      if (L.dung.t >= 0.7) chon(cDung);
    } else L.dung = null;
    if (M.khien > 0) M.khien -= dt;
    M.buoc += Math.abs(M.vx) * dt;
    if (demBan > 0) demBan -= dt;
    if (phim.ban && demBan <= 0) ban();
    var tr = L.trum;
    // Kích hoạt trạm câu hỏi khi Mark tới gần, và trùm khi vào đấu trường.
    L.tram.forEach(function (st) { if (!st.hien && M.x > (st.x - 3) * O) { st.hien = true; datCau(st); } });
    if (tr.song && !tr.bat && M.x > (L.A + 2) * O) { tr.bat = true; L.tramTrum.hien = true; L.bao = {chu: T.trumDen, t: 1.6}; datCau(L.tramTrum); }
    L.cpDs.forEach(function (c) { if (c > L.cp && M.x > c * O) L.cp = c; });
    L.xu.forEach(function (c) {
      if (!c.an && Math.abs(M.x + M.w / 2 - c.x) < 26 && Math.abs(M.y + M.h / 2 - c.y) < 34) { c.an = true; L.diem += 10; no(c.x, c.y, "#FACC15", 5); }
    });
    // Gai
    var x0 = Math.floor(M.x / O), x1 = Math.floor((M.x + M.w - 0.01) / O);
    for (var gx = x0; gx <= x1; gx++) if (o(gx, 9) === 5 && M.y + M.h > 9 * O + 22 && M.khien <= 0) { biThuong(0); M.vy = -700; break; }
    if (trangThai !== "choi") return;
    if (M.y > CAO + 60) { roiHo(); return; }
    if (hucO) huc(hucO[0], hucO[1]);
    // Tia kiến thức
    for (var d = L.dan.length - 1; d >= 0; d--) {
      var vd = L.dan[d]; vd.x += vd.vx * dt; vd.song -= dt;
      var het = vd.song <= 0 || cung(o(Math.floor(vd.x / O), Math.floor(vd.y / O)));
      for (var k2 = 0; !het && k2 < L.quai.length; k2++) {
        var q2 = L.quai[k2];
        if (q2.song && Math.abs(vd.x - (q2.x + q2.w / 2)) < 22 && Math.abs(vd.y - (q2.y + q2.h / 2)) < 22) { haQuai(q2, 20); het = true; }
      }
      for (var b2 = 0; !het && b2 < L.bom.length; b2++) if (Math.abs(vd.x - L.bom[b2].x) < 20 && Math.abs(vd.y - L.bom[b2].y) < 20) { no(L.bom[b2].x, L.bom[b2].y, "#C084FC", 6); L.bom.splice(b2, 1); het = true; }
      if (!het && tr.song && tr.bat && vd.x > tr.x && vd.x < tr.x + tr.w && vd.y > tr.y && vd.y < tr.y + tr.h) { tr.lui = 0.5; tr.vx = (vd.vx > 0 ? 1 : -1) * 160; tr.sang = 0.15; het = true; }
      if (het) L.dan.splice(d, 1);
    }
    // Quái
    for (var k = 0; k < L.quai.length; k++) {
      var q = L.quai[k];
      if (!q.song || Math.abs(q.x - M.x) > rongNhin * 1.2) continue;
      if (q.bay) {
        q.pha += dt * 2.2;
        q.x += q.vx * dt; if (q.x > q.goc + 2 * O) q.vx = -Math.abs(q.vx); if (q.x < q.goc - 2 * O) q.vx = Math.abs(q.vx);
        q.y = q.goc2 + Math.sin(q.pha) * 34;
      } else {
        if (q.vx === 0) q.vx = 60;
        var v = q.vx;
        if (diNgang(q, dt)) q.vx = -v;
        q.vy = Math.min(q.vy + TRONG_LUC * dt, 900); diDoc(q, dt);
        var mui = q.vx > 0 ? q.x + q.w + 2 : q.x - 2;
        if (q.dat && !cung(o(Math.floor(mui / O), Math.floor((q.y + q.h + 4) / O)))) q.vx = -q.vx;
        if (q.y > CAO + 60) q.song = false;
      }
      if (cham(M, q)) {
        if (M.vy > 40 && dayCu <= q.y + 14) { haQuai(q, 30); M.vy = phim.nhay ? -720 : -480; }
        else if (M.khien <= 0) { biThuong(M.x + M.w / 2 < q.x + q.w / 2 ? -1 : 1); if (trangThai !== "choi") return; }
      }
    }
    // Trùm
    if (tr.song && tr.bat) {
      if (tr.sang > 0) tr.sang -= dt;
      if (tr.gian > 0) tr.gian -= dt;
      tr.nhay -= dt; tr.nem -= dt;
      var toc = tr.gian > 0 ? 165 : 100;
      if (tr.dat && tr.nhay <= 0) { tr.vy = -760; tr.nhay = 1.8 + Math.random() * 1.6; }
      if (tr.lui > 0) tr.lui -= dt; else tr.vx = (M.x + M.w / 2 < tr.x + tr.w / 2 ? -1 : 1) * toc;
      var tv = tr.vx; if (diNgang(tr, dt)) tr.vx = -tv;
      if (tr.x < (L.A + 1) * O) { tr.x = (L.A + 1) * O; tr.vx = Math.abs(tr.vx); }
      if (tr.x + tr.w > L.G * O - 2) { tr.x = L.G * O - 2 - tr.w; tr.vx = -Math.abs(tr.vx); }
      tr.vy = Math.min(tr.vy + TRONG_LUC * dt, 1000); diDoc(tr, dt);
      // Trùm ném "câu bịa" về phía Mark.
      if (tr.nem <= 0) {
        tr.nem = (tr.gian > 0 ? 1.4 : 2.4) + Math.random();
        var bx = tr.x + tr.w / 2, by = tr.y + 10, tg = 1.1;
        L.bom.push({x: bx, y: by, vx: Math.max(-380, Math.min(380, (M.x + M.w / 2 - bx) / tg)), vy: -560});
      }
      if (M.khien <= 0 && cham(M, {x: tr.x + 10, y: tr.y + 10, w: tr.w - 20, h: tr.h - 12})) { biThuong(M.x + M.w / 2 < tr.x + tr.w / 2 ? -1 : 1); if (trangThai !== "choi") return; }
    }
    for (var bi = L.bom.length - 1; bi >= 0; bi--) {
      var bm = L.bom[bi]; bm.x += bm.vx * dt; bm.y += bm.vy * dt; bm.vy += 900 * dt;
      if (bm.y > 10 * O - 8 || cung(o(Math.floor(bm.x / O), Math.floor(bm.y / O)))) { no(bm.x, bm.y, "#C084FC", 5); L.bom.splice(bi, 1); continue; }
      if (M.khien <= 0 && Math.abs(bm.x - (M.x + M.w / 2)) < 26 && Math.abs(bm.y - (M.y + M.h / 2)) < 30) { L.bom.splice(bi, 1); biThuong(bm.vx > 0 ? 1 : -1); if (trangThai !== "choi") return; }
    }
    if (M.x + M.w / 2 > L.co) thangAi();
  }

  function ban() {
    demBan = 0.28;
    if (L.tia <= 0) { if (!L.bao) L.bao = {chu: T.danHet, t: 1.4, nho: true}; return; }
    L.tia--;
    L.dan.push({x: M.x + M.w / 2 + M.huong * 18, y: M.y + 20, vx: M.huong * 620, song: 0.9});
  }
  function haQuai(q, diem) { q.song = false; L.diem += diem; no(q.x + q.w / 2, q.y + q.h / 2, q.bay ? "#A78BFA" : L.a.mau, 12); }
  function no(x, y, mau, n) { for (var k = 0; k < n; k++) L.hat.push({x: x, y: y, vx: (Math.random() - 0.5) * 360, vy: -Math.random() * 380 - 80, song: 0.6 + Math.random() * 0.3, mau: mau}); }

  function biThuong(huongDay) {
    L.tim--; M.khien = 1.5; L.combo = 0;
    if (huongDay) { M.vx = huongDay * 330; M.vy = -440; }
    no(M.x + M.w / 2, M.y + 10, "#E11D48", 8);
    if (L.tim <= 0) thuaAi();
  }
  function roiHo() {
    L.tim--; L.combo = 0;
    if (L.tim <= 0) { thuaAi(); return; }
    M.x = L.cp * O + 8; M.y = 10 * O - M.h; M.vx = 0; M.vy = 0; M.khien = 1.5;
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
    L.cpDs.forEach(function (c) { if (c > 2 && c * O > cam - 40 && c * O < cam + rongNhin + 40) veCo(c * O + 10, 10 * O, 70, L.cp >= c ? "#22C55E" : "#CBD5E1", 22); });
    veCo(L.co, 10 * O, 200, "#2563EB", 46);
    L.xu.forEach(function (c) { if (!c.an && c.x > cam - 30 && c.x < cam + rongNhin + 30) veXu(c.x, c.y); });
    L.quai.forEach(function (q) { if (q.song && q.x > cam - 80 && q.x < cam + rongNhin + 80) veQuai(q); });
    if (L.trum.song) veTrum(L.trum);
    L.bom.forEach(function (b) {
      ctx.fillStyle = "#7C3AED"; ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, 7); ctx.fill();
      ctx.fillStyle = "#FDE68A"; ctx.font = "800 14px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?!", b.x, b.y + 1);
    });
    L.dan.forEach(function (d) {
      ctx.fillStyle = "#FDE047"; ctx.beginPath(); ctx.ellipse(d.x, d.y, 14, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(d.x, d.y, 7, 3, 0, 0, 7); ctx.fill();
    });
    veMark();
    if (L.dung && L.dung.t > 0.05) {
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(15,23,42,.35)"; ctx.beginPath(); ctx.arc(M.x + M.w / 2, M.y - 34, 14, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#FDE047"; ctx.beginPath(); ctx.arc(M.x + M.w / 2, M.y - 34, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, L.dung.t / 0.7)); ctx.stroke();
    }
    if (L.set) {
      ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 7; ctx.globalAlpha = Math.min(1, L.set.t * 3);
      ctx.beginPath(); ctx.moveTo(L.set.x, 0);
      for (var s = 1; s <= 6; s++) ctx.lineTo(L.set.x + (s % 2 ? 22 : -22), s * 62);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
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
      hinhTron(px + 1, py + 1 + nay, O - 2, O - 2, 6); ctx.fillStyle = v === 3 ? "#34D399" : "#A16207"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = v === 3 ? "#059669" : "#713F12"; ctx.stroke();
      if (v === 3) { ctx.fillStyle = "#064E3B"; ctx.font = "800 26px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+", px + O / 2, py + O / 2 + 1 + nay); }
    } else if (v === 5) {
      ctx.fillStyle = "#94A3B8";
      for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(px + k * 15, py + O); ctx.lineTo(px + k * 15 + 7.5, py + 18); ctx.lineTo(px + k * 15 + 15, py + O); ctx.fill(); }
    } else if ((v === 6 && !L.mo) || v === 8) {
      ctx.fillStyle = "#4C1D95"; ctx.fillRect(px + 6, py, 33, O);
      ctx.fillStyle = "#A78BFA"; ctx.fillRect(px + 12, py, 5, O); ctx.fillRect(px + 28, py, 5, O);
      if (y === 7) { ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.arc(px + O / 2, py + O / 2, 9, 0, 7); ctx.fill(); }
    } else if ((v === 7 || v === 9 || v === 10) && y !== 10) {
      var kb = L.khoi[x], nayB = v === 7 ? Math.sin(L.thoiGian * 4 + x) * 2 : 0;
      if (kb && kb.st.lan > 0 && kb.st.pa[kb.k].dung) { ctx.fillStyle = "rgba(74,222,128,.45)"; hinhTron(px - 6, py - 6 + nayB, O + 12, O + 12, 12); ctx.fill(); }
      hinhTron(px + 1, py + 1 + nayB, O - 2, O - 2, 7);
      ctx.fillStyle = v === 9 ? "#FDA4AF" : v === 10 ? "#4ADE80" : "#FACC15"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = v === 9 ? "#BE123C" : v === 10 ? "#15803D" : "#CA8A04"; ctx.stroke();
      ctx.fillStyle = "#0F172A"; ctx.font = "800 24px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (kb && v === 7) ctx.fillStyle = mauNhan(kb.st.pa[kb.k].nhan);
      ctx.fillText(kb ? kb.st.pa[kb.k].nhan : (v === 9 ? "✗" : "✓"), px + O / 2, py + O / 2 + 1 + nayB);
    } else if (v === 7 || v === 9 || v === 10) {
      // Ô đáp án nằm trên mặt đất: nền đất, mặt ô màu có chữ cái.
      ctx.fillStyle = "#B45309"; ctx.fillRect(px, py, O, O);
      var kh = L.khoi[x], goiY = kh && kh.st.lan > 0 && kh.st.pa[kh.k].dung, dangDung = L.dung && L.dung.c === x;
      if (goiY) { ctx.fillStyle = "rgba(74,222,128," + (0.35 + 0.25 * Math.sin(L.thoiGian * 8)) + ")"; ctx.fillRect(px - 4, py - 70, O + 8, 70); }
      var rung = v === 9 ? Math.sin(L.thoiGian * 60) * 3 : 0;
      hinhTron(px + 2 + rung, py - 4, O - 4, 22, 6);
      ctx.fillStyle = v === 9 ? "#FDA4AF" : v === 10 ? "#4ADE80" : dangDung ? "#FDE047" : "#FACC15"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = v === 9 ? "#BE123C" : v === 10 ? "#15803D" : "#CA8A04"; ctx.stroke();
      ctx.fillStyle = "#0F172A"; ctx.font = "800 18px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (kh && v === 7) ctx.fillStyle = mauNhan(kh.st.pa[kh.k].nhan);
      ctx.fillText(kh ? kh.st.pa[kh.k].nhan : (v === 9 ? "✗" : "✓"), px + O / 2 + rung, py + 7);
      if (kh) {
        // Biển chữ cái cắm phía trên ô để nhìn rõ từ xa.
        ctx.fillStyle = "#475569"; ctx.fillRect(px + O / 2 - 2, py - 58, 4, 54);
        hinhTron(px + 4, py - 92, O - 8, 36, 8); ctx.fillStyle = goiY ? "#4ADE80" : "#fff"; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = "#0F172A"; ctx.stroke();
        ctx.fillStyle = mauNhan(kh.st.pa[kh.k].nhan); ctx.font = "800 22px " + CHU; ctx.fillText(kh.st.pa[kh.k].nhan, px + O / 2, py - 73);
      }
    }
  }
  // Câu đúng/sai dùng biểu tượng ✓ (xanh) và ✗ (đỏ) thay cho chữ cái.
  function mauNhan(n) { return n === "✓" ? "#15803D" : n === "✗" ? "#BE123C" : "#0F172A"; }
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
    var huong = q.vx >= 0 ? 1 : -1;
    if (q.bay) {
      var vo = Math.sin(L.thoiGian * 18) * 8;
      ctx.fillStyle = "#E9D5FF"; ctx.beginPath(); ctx.ellipse(q.x + 2, q.y + 10 - vo, 12, 7, -0.5, 0, 7); ctx.ellipse(q.x + q.w - 2, q.y + 10 - vo, 12, 7, 0.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#8B5CF6";
    } else ctx.fillStyle = L.a.mau;
    var nhun = q.bay ? 0 : Math.abs(Math.sin(L.thoiGian * 9 + q.x)) * 3;
    hinhTron(q.x, q.y + nhun, q.w, q.h - nhun, 14); ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,.35)"; ctx.lineWidth = 2; ctx.stroke();
    mat(q.x + q.w / 2, q.y + 13 + nhun, huong);
    nhan(q.ten, q.x + q.w / 2, q.y - 16);
  }
  function veTrum(tr) {
    ctx.save(); ctx.translate(tr.x - 2, tr.y - 6); ctx.scale(tr.w / 116, (tr.h + 8) / 90);
    ctx.fillStyle = tr.sang > 0 && Math.floor(tr.sang * 20) % 2 ? "#fff" : tr.gian > 0 ? "#DC2626" : L.a.mauTrum;
    if (MA_TRUM) ctx.fill(MA_TRUM); else ctx.fillRect(4, 10, 110, 80);
    ctx.restore();
    ctx.save(); ctx.translate(tr.x + tr.w / 2, tr.y + 34); ctx.scale(1.5, 1.5); mat(0, 0, M.x < tr.x ? -1 : 1); ctx.restore();
    ctx.fillStyle = "#FACC15"; ctx.beginPath(); ctx.moveTo(tr.x + 26, tr.y + 4); ctx.lineTo(tr.x + 32, tr.y - 16); ctx.lineTo(tr.x + 48, tr.y - 2); ctx.lineTo(tr.x + 64, tr.y - 16); ctx.lineTo(tr.x + 70, tr.y + 4); ctx.fill();
    nhan(L.a.trum, tr.x + tr.w / 2, tr.y - 30);
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
  function veHud() {
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    hinhTron(12, 12, 300, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    var tim = ""; for (var k = 0; k < 3; k++) tim += k < L.tim ? "♥" : "♡";
    ctx.font = "800 26px " + CHU; ctx.fillStyle = "#FB7185"; ctx.fillText(tim, 24, 35);
    ctx.font = "800 21px " + CHU; ctx.fillStyle = "#FDE047"; ctx.fillText("⚡" + L.tia, 124, 35);
    ctx.fillStyle = "#fff"; ctx.fillText(String(L.diem), 188, 35);
    if (L.combo > 1) { ctx.font = "800 15px " + CHU; ctx.fillStyle = "#86EFAC"; ctx.fillText("x" + L.combo, 268, 35); }
    if (L.trum.song && L.trum.bat) {
      var w = Math.min(300, rongNhin - 360), x = rongNhin - w - 20;
      hinhTron(x - 8, 66, w + 16, 30, 12); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
      hinhTron(x, 74, w, 14, 7); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fill();
      hinhTron(x, 74, Math.max(14, w * L.trum.hp / L.trum.max), 14, 7); ctx.fillStyle = "#C084FC"; ctx.fill();
    }
    if (L.bao) {
      ctx.font = (L.bao.nho ? "700 22px " : "800 34px ") + CHU; ctx.textAlign = "center";
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(15,23,42,.7)"; ctx.strokeText(L.bao.chu, rongNhin / 2, 150);
      ctx.fillStyle = "#FDE68A"; ctx.fillText(L.bao.chu, rongNhin / 2, 150);
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
    // Dùng kích thước chưa xoay (clientWidth/Height) vì ở chế độ game khung có thể bị xoay 90°.
    var r = {width: cv.clientWidth, height: cv.clientHeight}, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width || !r.height) return;
    rongNhin = CAO * r.width / r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    tiLe = cv.width / rongNhin;
    ve();
  }

  // ---------- Chế độ chơi toàn màn hình trên điện thoại ----------
  // Màn hình xoay ngang, chỉ còn game và nút bấm nổi trên game; câu hỏi và giải thích là popup ở đầu màn chơi.
  var DT = window.matchMedia ? window.matchMedia("(pointer: coarse), (max-width: 700px)") : {matches: false};
  var daThoat = false;
  function toanMan(bat) {
    var pl = $("#pl"), nut = $("#pl-toan");
    pl.classList.toggle("is-toan", bat);
    document.documentElement.classList.toggle("pl-mo-toan", bat);
    nut.textContent = bat ? "✕" : "⛶";
    nut.setAttribute("aria-label", bat ? T.toanRa : T.toanVao); nut.title = nut.getAttribute("aria-label");
    nut.setAttribute("aria-pressed", bat ? "true" : "false");
    try {
      // Android: cả trang vào toàn màn hình rồi khóa xoay ngang (không gọi trên #pl vì trình duyệt sẽ ép bỏ phép xoay của nó).
      // iOS không hỗ trợ thì CSS tự xoay khung.
      if (bat && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen({navigationUI: "hide"}).then(function () {
        if (screen.orientation && screen.orientation.lock) return screen.orientation.lock("landscape");
      }).catch(function () {});
      if (!bat && screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      if (!bat && document.fullscreenElement) document.exitFullscreen().catch(function () {});
    } catch (x) {}
    requestAnimationFrame(coGian);
  }
  function gonBang(gon) {
    var b = $("#pl-de"), n = $("#pl-de-gon");
    b.classList.toggle("is-gon", gon);
    n.textContent = gon ? T.mo : T.gon; n.setAttribute("aria-expanded", gon ? "false" : "true");
  }

  // ---------- Màn chọn ải / kết quả ----------
  function hienMan(noiDung) {
    man.innerHTML = ""; man.appendChild(noiDung); man.hidden = false;
    $("#pl-menu").hidden = true;
    khung.classList.remove("is-choi");
    var n = $("button:not([aria-disabled]), a", man); if (n) n.focus({preventScroll: true});
  }
  function manChon() {
    trangThai = "chon"; dungVong();
    veBang(null);
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
    veBang(null);
    man.hidden = true; $("#pl-menu").hidden = false;
    trangThai = "choi"; khung.classList.add("is-choi");
    if (window.mhaiDo) window.mhaiDo("game-bat-dau", {man: i + 1}); // đếm tương tác, xem theo-doi.js
    if (DT.matches && !daThoat && !$("#pl").classList.contains("is-toan")) toanMan(true);
    phim.trai = phim.phai = phim.nhay = phim.ban = false; demNhay = 0;
    L.bao = {chu: T.ai + " " + (i + 1) + " · " + L.a.ten, t: 2};
    var r = khung.getBoundingClientRect(), dk = $("#pl-dk").getBoundingClientRect();
    if (!$("#pl").classList.contains("is-toan") && (r.top < 0 || Math.max(r.bottom, dk.bottom) > window.innerHeight)) $("#pl").scrollIntoView({block: "start", behavior: "smooth"});
    cv.focus({preventScroll: true});
    chayVong();
  }
  function thangAi() {
    trangThai = "xong";
    var a = L.a, cuoi = L.i === AI.length - 1;
    var sao = 1 + (L.tim >= 2 ? 1 : 0) + (L.dungNgay === L.soCau ? 1 : 0);
    tienDo.sao[a.id] = Math.max(tienDo.sao[a.id] || 0, sao);
    if (window.mhaiDo) { window.mhaiDo("game-qua-man", {man: L.i + 1, sao: sao}); window.mhaiDo("hoc-xong", {loai: "game"}); }
    tienDo.mo = Math.max(tienDo.mo, Math.min(L.i + 2, AI.length));
    luu();
    var kq = el("div", "pl-kq");
    var h = el("img"); h.alt = ""; h.width = 110; h.height = 110; h.src = GOC + "assets/mascot/mark-chien-thang.webp"; kq.appendChild(h);
    kq.appendChild(el("h3", null, cuoi ? T.thang : T.qua));
    kq.appendChild(el("p", "pl-kq-sao", saoChu(sao)));
    kq.appendChild(el("p", null, T.quaTxt(sao, L.diem, L.dungNgay, L.soCau)));
    if (cuoi) kq.appendChild(el("p", null, T.thangTxt(tongSao())));
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
    if (window.mhaiDo) window.mhaiDo("game-thua", {man: i + 1});
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
  var PHIM = {ArrowLeft: "trai", KeyA: "trai", ArrowRight: "phai", KeyD: "phai", ArrowUp: "nhay", KeyW: "nhay", Space: "nhay", KeyX: "ban", KeyJ: "ban", KeyF: "ban"};
  function batPhim() {
    document.addEventListener("keydown", function (e) {
      var k = PHIM[e.code];
      if (!k || trangThai !== "choi") return;
      var tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
      if ((tg === "BUTTON" || tg === "A") && e.code === "Space") return;
      e.preventDefault();
      if (k === "nhay" && !phim.nhay) demNhay = 0.12;
      phim[k] = true;
    });
    document.addEventListener("keyup", function (e) { var k = PHIM[e.code]; if (k) phim[k] = false; });
    window.addEventListener("blur", function () { phim.trai = phim.phai = phim.nhay = phim.ban = false; });
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
    cv = $("#pl-canvas"); man = $("#pl-man"); khung = $("#pl-khung");
    if (!cv || !cv.getContext) return;
    ctx = cv.getContext("2d");
    cv.setAttribute("aria-label", T.canvas);
    ["chay", "nhay"].forEach(function (k) {
      var im = new Image(); im.src = GOC + "assets/mascot/" + (k === "chay" ? "mark-trinh-bay-tinh.webp" : "mark-chi-len-tinh.webp");
      im.onload = function () { ve(); }; anh[k] = im;
    });
    coGian();
    window.addEventListener("resize", coGian);
    batPhim();
    $("#pl-menu").textContent = T.menu;
    toanMan(false);
    $("#pl-toan").addEventListener("click", function () {
      var bat = !$("#pl").classList.contains("is-toan");
      daThoat = !bat; toanMan(bat); cv.focus({preventScroll: true});
    });
    $("#pl-de-gon").addEventListener("click", function () { gonBang(!$("#pl-de").classList.contains("is-gon")); });
    $("#pl-menu").addEventListener("click", manChon);
    $("#pl-xoa").textContent = T.xoa;
    $("#pl-xoa").addEventListener("click", function () {
      if (!confirm(T.xoaHoi)) return;
      tienDo = {mo: 1, sao: {}}; luu(); manChon();
    });
    manChon();
    taiDuLieu().catch(function () { thongBao(T.loi); });
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__pl = {L: function () { return L; }, M: function () { return M; }, batDauAi: batDauAi, phim: phim, trangThai: function () { return trangThai; }};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

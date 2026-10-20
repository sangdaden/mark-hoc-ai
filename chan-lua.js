// Game G1 "Mark chặn lừa" (chan-lua.html + en/chan-lua.html, trang tạo bởi scripts/trang/chan-lua.py).
// Tin nhắn bay từ trái sang về điện thoại của bà (bên phải). Chạm tin lừa: Mark phóng tia sét bắn hạ, hiện tên dấu hiệu lừa.
// Tin thật thì để bay tới điện thoại. Bắn nhầm tin thật hoặc để lọt tin lừa: mất một tim, Bit giải thích vì sao (thời gian chạy chậm lại
// trong lúc Bit nói, game không dừng). Lần đầu chặn được mỗi loại dấu hiệu, Bit cũng nói một câu về dấu hiệu đó.
// Nút "Chậm lại" (3 lần) làm mọi thứ chậm hẳn vài giây: chính là lời khuyên "chậm lại trước khi làm theo".
// Cuối màn là trùm: một ca trong data/lua-dao.json hiện thành thẻ cuộc gọi lớn, chạm đúng các câu có dấu hiệu ("co") để hạ.
// Tin bay là phần tử DOM trong lớp #cl-lop (thu phóng theo khung), canvas chỉ vẽ cảnh, Mark, điện thoại, tia sét.
// Khung chơi ngang toàn màn hình trên điện thoại theo kiểu phieu-luu.js. Tiến độ: localStorage "mhai-chan-lua-1" ({sao: {id: 1-3}}).
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en", LG = EN ? "en" : "vi";
  var GOC = EN ? "../" : "";
  var KHOA = "mhai-chan-lua-1";
  var CAO = 540, BUOC = 1 / 120, TIN_W = 310, TIN_H = 84, LAN = [70, 182, 294];
  var CHU = '"Be Vietnam Pro", Inter, system-ui, sans-serif';

  var T = EN ? {
    chon: "Choose a level", chonTxt: "Scam messages are flying at Grandma's phone. Shoot down the scams, let the real messages through.",
    sapCo: "Coming soon", man: "Level", choi: "Play", luat: "Three red flags to look for",
    luat3: ["Asks for money or a code", "Rushes you", "Unknown number or link"],
    luatPhu: "Tap a scam to shoot it. Leave real messages alone: shooting one costs a heart.",
    tinThat: "Oops, that was real!", biLua: function (d) { return "Grandma got scammed: " + d; }, chanDuoc: function (d) { return "Blocked: " + d; },
    trumDen: "Boss incoming!", trumHuong: "Tap every suspicious part of the call", trumBinh: "That part is normal", trumHa: "Boss defeated!",
    trumLot: "The fake call got through", qua: "Level cleared!", thua: "Out of hearts",
    quaTxt: function (s, d) { return s + " of 3 stars · " + d + " points"; },
    thuaTxt: "Bit says: check the review, then try again. Slow down whenever you're not sure.",
    lai: "Play again", veChon: "Levels", xemLai: "Review messages", quayLai: "← Back", xlTieuDe: "Every message in this level",
    kq: {"ban-dung": "Blocked", "ban-nham": "Shot by mistake", "lot": "Got through", "qua": "Let through"},
    dauBat: "Red flags you caught", soat: "3 checks before you act", tongSao: function (s, n) { return s + " / " + n + " stars"; },
    xoa: "Reset progress", xoaHoi: "Reset all levels?", loi: "Couldn't load the game. Please reload the page.", dangTai: "Loading…",
    cham: function (n) { return "🐢 Slow down ×" + n; }, chamHet: "🐢 Used up", toanVao: "Play full screen", toanRa: "Exit full screen", dong: "Close",
    meoIos: "iPhone tip: tap Share, then “Add to Home Screen”. Open the game from that icon to play without Safari’s bars.",
    dt: "Grandma's phone", tin: function (a, b) { return a + "/" + b + " messages"; }, so: "unknown number", luu: "saved"
  } : {
    chon: "Chọn màn", chonTxt: "Tin lừa đang bay về điện thoại của bà. Bắn hạ tin lừa, để tin thật bay qua.",
    sapCo: "Sắp có", man: "Màn", choi: "Chơi", luat: "Ba dấu hiệu cần soát",
    luat3: ["Đòi tiền hay đòi mã", "Thúc làm gấp", "Số lạ, link lạ"],
    luatPhu: "Chạm tin lừa để bắn. Tin thật thì để yên, bắn nhầm là mất tim.",
    tinThat: "Ối, tin thật đấy!", biLua: function (d) { return "Bà bị lừa: " + d; }, chanDuoc: function (d) { return "Chặn được: " + d; },
    trumDen: "Trùm xuất hiện!", trumHuong: "Chạm vào mọi chỗ đáng ngờ của cuộc gọi", trumBinh: "Câu này bình thường", trumHa: "Hạ được trùm!",
    trumLot: "Cuộc gọi giả đã lọt tới bà", qua: "Qua màn!", thua: "Hết tim rồi",
    quaTxt: function (s, d) { return s + " trên 3 sao · " + d + " điểm"; },
    thuaTxt: "Bit nhắn: xem lại các tin vừa rồi rồi thử lại nhé. Chưa chắc thì cứ bấm Chậm lại.",
    lai: "Chơi lại", veChon: "Các màn", xemLai: "Xem lại các tin", quayLai: "← Quay lại", xlTieuDe: "Mọi tin trong màn này",
    kq: {"ban-dung": "Đã chặn", "ban-nham": "Bắn nhầm", "lot": "Để lọt", "qua": "Cho qua"},
    dauBat: "Dấu hiệu bạn đã chặn", soat: "3 câu soát trước khi làm theo", tongSao: function (s, n) { return s + " / " + n + " sao"; },
    xoa: "Chơi lại từ đầu", xoaHoi: "Xóa tiến độ của mọi màn?", loi: "Không tải được game. Bạn tải lại trang nhé.", dangTai: "Đang tải…",
    cham: function (n) { return "🐢 Chậm lại ×" + n; }, chamHet: "🐢 Hết lượt", toanVao: "Chơi toàn màn hình", toanRa: "Thoát toàn màn hình", dong: "Đóng",
    meoIos: "Mẹo iPhone: bấm nút Chia sẻ rồi chọn “Thêm vào MH chính”. Mở game từ biểu tượng đó sẽ không còn thanh Safari che.",
    dt: "Điện thoại bà", tin: function (a, b) { return a + "/" + b + " tin"; }, so: "số lạ", luu: "đã lưu"
  };

  var $ = function (s, g) { return (g || document).querySelector(s); };
  var D = null, CA = {}, tienDo = docTienDo();
  var cv, ctx, lop, khung, man, rongNhin = 960, tiLe = 1, anhMark = null, raf = 0, truoc = 0, du = 0;
  var L = null, trangThai = "chon", tuTat = 0;

  function docTienDo() {
    try { var v = JSON.parse(localStorage.getItem(KHOA)); if (v && v.sao) return v; } catch (e) {}
    return {sao: {}};
  }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function chu(o) { return o ? (o[LG] || o.vi || "") : ""; }
  function tongSao() { var s = 0; for (var k in tienDo.sao) s += tienDo.sao[k]; return s; }
  function saoChu(s) { return "★★★".slice(0, s) + "☆☆☆".slice(s); }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d); }

  function taiDuLieu() {
    return Promise.all([GOC + "data/chan-lua.json", GOC + "data/lua-dao.json"].map(function (u) {
      return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); });
    })).then(function (kq) {
      D = kq[0];
      kq[1].ca.forEach(function (c) { CA[c.id] = c; });
    });
  }

  // ---------- Dựng màn ----------
  function batDauMan(i) {
    if (!D) { thongBao(T.dangTai); return; }
    var m = D.man[i];
    // Hai tin đầu cố định (một thật, một lừa) cho người mới làm quen, phần còn lại xáo.
    var dau = m.tin.slice(0, 2), sau = tron(m.tin.slice(2));
    L = {i: i, m: m, tim: m.tim, timMax: m.tim, diem: 0, combo: 0, chamCon: 3, cham: 0, hang: dau.concat(sau), da: 0, hen: 0.8,
      tin: [], xong: 0, nhatKy: [], bat: {}, daNoi: {}, pha: "tin", trum: null, hat: [], set: [], bao: null, lacDt: 0, sangDt: null, cho: 0, ketThuc: false};
    lop.innerHTML = "";
    an(man); $("#cl-menu").hidden = false;
    trangThai = "choi"; khung.classList.add("is-choi"); $("#cl").classList.remove("is-man"); capNhatCham();
    do_("game-bat-dau", {tro: "chan-lua", man: i + 1});
    if (DT.matches && !daThoat && !$("#cl").classList.contains("is-toan")) toanMan(true);
    L.bao = {chu: T.man + " " + (i + 1) + " · " + chu(m.ten), t: 2};
    var r = khung.getBoundingClientRect();
    if (!$("#cl").classList.contains("is-toan") && (r.top < 0 || r.bottom > window.innerHeight)) $("#cl").scrollIntoView({block: "start", behavior: "smooth"});
    chayVong();
  }
  function dt() { return {x: rongNhin - 150, y: 150, w: 118, h: 214}; }

  function thaTin() {
    var q = L.hang[L.da++], n = L.m.tin.length, tien = n > 1 ? (L.da - 1) / (n - 1) : 0;
    var toc = L.m.toc[0] + (L.m.toc[1] - L.m.toc[0]) * tien;
    // Chọn làn còn trống ở đầu (tin trước trong làn đã đi xa), ưu tiên làn khác làn vừa thả.
    var trong = [0, 1, 2].filter(function (k) { return !L.tin.some(function (b) { return b.lan === k && b.x < 60; }); });
    var khac = trong.filter(function (k) { return k !== L.lanCu; });
    var lan = (khac.length ? khac : trong.length ? trong : [0, 1, 2])[Math.floor(Math.random() * (khac.length || trong.length || 3))];
    L.lanCu = lan;
    var b = {q: q, lua: !!q.dau, x: -TIN_W - 10, y: LAN[lan], lan: lan, toc: toc, xong: false};
    var nut = el("button", "cl-tin cl-tin-" + q.loai); nut.type = "button";
    var tu = el("span", "cl-tin-tu" + (q.tu.luu ? " is-luu" : ""));
    tu.appendChild(el("span", "cl-tin-ic", q.loai === "chat" ? "💬" : "✉️"));
    tu.appendChild(el("span", null, chu(q.tu)));
    tu.appendChild(el("small", null, q.tu.luu ? T.luu : T.so));
    nut.appendChild(tu);
    nut.appendChild(el("span", "cl-tin-chu", chu(q.chu)));
    nut.style.width = TIN_W + "px"; nut.style.height = TIN_H + "px";
    datViTri(nut, b.x, b.y);
    function ban(e) { if (e.type === "click" && e.detail !== 0) return; e.preventDefault(); banTin(b); }
    nut.addEventListener("pointerdown", ban); nut.addEventListener("click", ban);
    b.nut = nut; lop.appendChild(nut); L.tin.push(b);
    var cach = L.m.cach[0] + (L.m.cach[1] - L.m.cach[0]) * tien;
    L.hen = cach;
  }
  function datViTri(n, x, y) { n.style.transform = "translate(" + x.toFixed(1) + "px," + y + "px)"; }

  function banTin(b) {
    if (b.xong || trangThai !== "choi") return;
    b.xong = true; L.xong++;
    tiaSet(b.x + TIN_W / 2, b.y + TIN_H / 2);
    b.nut.classList.add(b.lua ? "is-no" : "is-nham");
    setTimeout(function () { if (b.nut.parentNode) b.nut.parentNode.removeChild(b.nut); }, b.lua ? 380 : 900);
    if (b.lua) {
      L.combo++; L.diem += 10 + Math.min(L.combo, 5) * 2;
      L.bat[b.q.dau] = (L.bat[b.q.dau] || 0) + 1;
      var dh = D.dau_hieu[b.q.dau];
      no(b.x + TIN_W / 2, b.y + TIN_H / 2, "#F87171", 14);
      nhan(b.x + TIN_W / 2, b.y + 10, chu(dh), "#FECACA");
      ghi(b, "ban-dung");
      if (!L.daNoi[b.q.dau]) { L.daNoi[b.q.dau] = 1; noi(T.chanDuoc(chu(dh)), chu(dh.giai), "vui", 3.5); }
    } else {
      L.combo = 0; matTim();
      ghi(b, "ban-nham");
      noi(T.tinThat, chu(b.q.vi_sao), "sai", 5);
    }
  }
  function denDt(b) {
    b.xong = true; L.xong++;
    if (b.nut.parentNode) b.nut.parentNode.removeChild(b.nut);
    var p = dt();
    if (b.lua) {
      L.combo = 0; L.lacDt = 0.5; L.sangDt = {mau: "#EF4444", t: 0.6}; matTim();
      var dh = D.dau_hieu[b.q.dau];
      ghi(b, "lot");
      noi(T.biLua(chu(dh)), chu(dh.giai), "sai", 5);
    } else {
      L.diem += 5; L.sangDt = {mau: "#22C55E", t: 0.6};
      nhan(p.x + p.w / 2, p.y - 14, "♥", "#86EFAC");
      ghi(b, "qua");
    }
  }
  function ghi(b, kq) { L.nhatKy.push({q: b.q, kq: kq}); }
  function matTim() {
    L.tim = Math.max(0, L.tim - 1);
    if (L.tim <= 0) { L.ketThuc = true; setTimeout(thuaMan, 1100); }
  }

  // ---------- Trùm: một ca của Lừa đảo hay thật ----------
  function goiTrum() {
    var c = CA[L.m.trum.ca];
    if (!c) { thangMan(); return; }
    L.pha = "trum"; L.bao = {chu: T.trumDen, t: 2};
    var w = Math.min(460, dt().x - 40);
    var tr = {c: c, x: 10, y: 66, w: w, con: 0, tong: 0, xong: false, toc: L.m.trum.toc};
    var the = el("div", "cl-trum"); the.style.width = w + "px";
    var dau = el("div", "cl-trum-dau");
    dau.appendChild(el("b", null, chu(L.m.trum.ten)));
    dau.appendChild(el("span", null, T.trumHuong));
    the.appendChild(dau);
    var vach = el("div", "cl-trum-mau"); vach.appendChild(el("i")); the.appendChild(vach);
    function phan(nhanChu, co, cls) {
      var n = el("button", "cl-trum-phan " + (cls || "")); n.type = "button";
      n.appendChild(el("span", null, nhanChu));
      if (co) tr.tong++;
      function bam(e) {
        if (e.type === "click" && e.detail !== 0) return;
        e.preventDefault();
        if (tr.xong || trangThai !== "choi" || n.classList.contains("is-bat")) return;
        var r = n.getBoundingClientRect(), k = khungToaDo(r);
        if (co) {
          n.classList.add("is-bat"); n.appendChild(el("small", null, chu(c.co[co])));
          tr.con++; L.diem += 25; tiaSet(k.x, k.y); no(k.x, k.y, "#F87171", 12);
          vach.firstChild.style.width = (100 - 100 * tr.con / tr.tong) + "%";
          if (tr.con >= tr.tong) haTrum();
        } else {
          n.classList.add("is-binh"); setTimeout(function () { n.classList.remove("is-binh"); }, 600);
          nhan(k.x, k.y - 20, T.trumBinh, "#E2E8F0"); matTim(); L.combo = 0;
          L.nhatKy.push({trum: true, chu: nhanChu, kq: "ban-nham"});
        }
      }
      n.addEventListener("pointerdown", bam); n.addEventListener("click", bam);
      return n;
    }
    var k = c.khung || {};
    the.appendChild(phan("📞 " + chu(k.ten) + (k.phu ? " · " + k.phu : ""), c.co_khung, "is-khung"));
    var than = el("div", "cl-trum-than");
    (c.dong || []).forEach(function (d) { (d.doan || []).forEach(function (o) { than.appendChild(phan(chu(o), o.co)); }); });
    the.appendChild(than);
    tr.nut = the; lop.appendChild(the); datViTri(the, tr.x, tr.y);
    L.trum = tr;
  }
  function haTrum() {
    var tr = L.trum; tr.xong = true;
    var r = khungToaDo(tr.nut.getBoundingClientRect());
    for (var k = 0; k < 4; k++) no(r.x + (Math.random() - 0.5) * 200, r.y + (Math.random() - 0.5) * 80, k % 2 ? "#FDE68A" : "#F87171", 14);
    tr.nut.classList.add("is-no");
    L.bao = {chu: T.trumHa, t: 2.5};
    noi(T.trumHa, chu(tr.c.giai), "vui", 6);
    L.ketThuc = true;
    setTimeout(thangMan, 2600);
  }
  // Khung chữ nhật màn hình (getBoundingClientRect) -> tọa độ logic của game (tâm), tính cả khi khung bị xoay 90°.
  function khungToaDo(r) {
    var g = cv.getBoundingClientRect(), xoay = g.height > g.width && cv.clientWidth > cv.clientHeight;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (xoay) return {x: (cy - g.top) / g.height * rongNhin, y: (g.right - cx) / g.width * CAO};
    return {x: (cx - g.left) / g.width * rongNhin, y: (cy - g.top) / g.height * CAO};
  }

  // ---------- Bit nói (popup không chặn game, thời gian chạy chậm trong lúc nói) ----------
  function noi(dau, chuNoi, kieu, giay) {
    var b = $("#cl-bao");
    $("#cl-bao-dau").textContent = dau; $("#cl-bao-chu").textContent = chuNoi;
    $("#cl-bao-bit").src = GOC + "assets/" + (kieu === "sai" ? "bit-sai-roi.svg" : "bit-vui.svg");
    b.classList.toggle("is-sai", kieu === "sai");
    b.hidden = false;
    clearTimeout(tuTat); tuTat = setTimeout(tatNoi, giay * 1000);
  }
  function tatNoi() { clearTimeout(tuTat); tuTat = 0; $("#cl-bao").hidden = true; }

  function capNhatCham() {
    var n = $("#cl-cham");
    n.hidden = trangThai !== "choi";
    if (!L) return;
    n.textContent = L.chamCon > 0 ? T.cham(L.chamCon) : T.chamHet;
    n.disabled = L.chamCon <= 0;
    n.classList.toggle("is-bat", L.cham > 0);
  }

  // ---------- Cập nhật ----------
  function capNhat(dt0) {
    var nhip = 1;
    if (L.cham > 0) { L.cham -= dt0; nhip = 0.3; if (L.cham <= 0) capNhatCham(); }
    if (!$("#cl-bao").hidden) nhip = Math.min(nhip, 0.45);
    var dtt = dt0 * nhip, p = dt();
    if (L.bao) { L.bao.t -= dt0; if (L.bao.t <= 0) L.bao = null; }
    if (L.lacDt > 0) L.lacDt -= dt0;
    if (L.sangDt) { L.sangDt.t -= dt0; if (L.sangDt.t <= 0) L.sangDt = null; }
    L.hat.forEach(function (h) { h.x += h.vx * dt0; h.y += h.vy * dt0; h.vy += 900 * dt0; h.song -= dt0; });
    L.hat = L.hat.filter(function (h) { return h.song > 0; });
    L.set.forEach(function (s) { s.t -= dt0; });
    L.set = L.set.filter(function (s) { return s.t > 0; });
    if (L.ketThuc) return;
    if (L.pha === "tin") {
      if (L.da < L.hang.length) { L.hen -= dtt; if (L.hen <= 0) thaTin(); }
      L.tin.forEach(function (b) {
        if (b.xong) return;
        b.x += b.toc * dtt;
        datViTri(b.nut, b.x, b.y);
        if (b.x + TIN_W >= p.x - 4) denDt(b);
      });
      L.tin = L.tin.filter(function (b) { return !b.xong; });
      if (L.da >= L.hang.length && !L.tin.length) { L.cho += dt0; if (L.cho > 1.2) goiTrum(); }
    } else if (L.pha === "trum" && L.trum && !L.trum.xong) {
      var tr = L.trum;
      tr.x += tr.toc * dtt; datViTri(tr.nut, tr.x, tr.y);
      if (tr.x + tr.w >= p.x - 4) {
        tr.xong = true; L.lacDt = 0.8; L.sangDt = {mau: "#EF4444", t: 1};
        L.tim = 0; L.ketThuc = true;
        noi(T.trumLot, chu(tr.c.giai), "sai", 7);
        setTimeout(thuaMan, 1600);
      }
    }
  }
  function no(x, y, mau, n) { for (var k = 0; k < n; k++) L.hat.push({x: x, y: y, vx: (Math.random() - 0.5) * 380, vy: -Math.random() * 360 - 60, song: 0.5 + Math.random() * 0.3, mau: mau}); }
  function nhan(x, y, chuNhan, mau) { L.hat.push({x: x, y: y, vx: 0, vy: -140, song: 1.1, chu: chuNhan, mau: mau, khongRoi: true}); }
  function tiaSet(x, y) {
    var tu = {x: 96, y: 404}, diem = [tu];
    for (var k = 1; k < 7; k++) { var f = k / 7; diem.push({x: tu.x + (x - tu.x) * f + (Math.random() - 0.5) * 30, y: tu.y + (y - tu.y) * f + (Math.random() - 0.5) * 30}); }
    diem.push({x: x, y: y});
    L.set.push({d: diem, t: 0.22}); L.giuTay = 0.3;
  }

  // ---------- Vẽ ----------
  function hinhTron(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ve() {
    if (!ctx) return;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);
    var g = ctx.createLinearGradient(0, 0, 0, CAO); g.addColorStop(0, "#1E3A8A"); g.addColorStop(1, "#38BDF8");
    ctx.fillStyle = g; ctx.fillRect(0, 0, rongNhin, CAO);
    // Sóng tín hiệu mờ phía sau
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 3;
    for (var k = 1; k < 6; k++) { ctx.beginPath(); ctx.arc(rongNhin - 90, 255, k * 120, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
    ctx.fillStyle = "#14532D"; ctx.fillRect(0, 470, rongNhin, CAO - 470);
    ctx.fillStyle = "#166534"; ctx.fillRect(0, 470, rongNhin, 8);
    veDt();
    veMark();
    if (L) {
      L.set.forEach(function (s) {
        ctx.globalAlpha = Math.min(1, s.t * 6);
        ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.beginPath();
        s.d.forEach(function (d, i) { if (i) ctx.lineTo(d.x, d.y); else ctx.moveTo(d.x, d.y); }); ctx.stroke();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      });
      L.hat.forEach(function (h) {
        ctx.globalAlpha = Math.max(0, Math.min(1, h.song * 2));
        if (h.chu) {
          ctx.font = "800 22px " + CHU; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.lineWidth = 5; ctx.strokeStyle = "rgba(15,23,42,.8)"; ctx.strokeText(h.chu, h.x, h.y);
          ctx.fillStyle = h.mau; ctx.fillText(h.chu, h.x, h.y);
        } else { ctx.fillStyle = h.mau; ctx.fillRect(h.x - 4, h.y - 4, 8, 8); }
      });
      ctx.globalAlpha = 1;
      veHud();
    }
  }
  function veDt() {
    var p = dt(), lac = L && L.lacDt > 0 ? Math.sin(L.lacDt * 60) * 6 : 0;
    ctx.save(); ctx.translate(lac, 0);
    if (L && L.sangDt) { ctx.shadowColor = L.sangDt.mau; ctx.shadowBlur = 40; }
    hinhTron(p.x, p.y, p.w, p.h, 18); ctx.fillStyle = "#0F172A"; ctx.fill(); ctx.shadowBlur = 0;
    hinhTron(p.x + 8, p.y + 14, p.w - 16, p.h - 32, 8); ctx.fillStyle = L && L.sangDt ? (L.sangDt.mau === "#EF4444" ? "#FEE2E2" : "#DCFCE7") : "#E0F2FE"; ctx.fill();
    // Bà: tóc bạc búi, kính
    var cx = p.x + p.w / 2, cy = p.y + 92;
    ctx.fillStyle = "#CBD5E1"; ctx.beginPath(); ctx.arc(cx, cy - 30, 14, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy - 4, 30, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#FDE68A"; ctx.beginPath(); ctx.arc(cx, cy + 4, 26, 0, 7); ctx.fill();
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx - 10, cy + 2, 7, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 10, cy + 2, 7, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 3, cy + 2); ctx.lineTo(cx + 3, cy + 2); ctx.stroke();
    var buon = L && L.sangDt && L.sangDt.mau === "#EF4444";
    ctx.beginPath(); if (buon) ctx.arc(cx, cy + 22, 7, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(cx, cy + 12, 7, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.fillStyle = "#2563EB"; hinhTron(cx - 30, cy + 30, 60, 50, 14); ctx.fill();
    ctx.restore();
    ctx.font = "600 14px " + CHU; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(T.dt, p.x + p.w / 2, p.y + p.h + 22);
  }
  function veMark() {
    var x = 64, y = 470, cao = 104;
    if (anhMark && anhMark.complete && anhMark.naturalWidth) {
      var rong = cao * anhMark.naturalWidth / anhMark.naturalHeight;
      ctx.drawImage(anhMark, x - rong / 2, y - cao, rong, cao);
    } else { ctx.fillStyle = "#2563EB"; ctx.fillRect(x - 18, y - 60, 36, 60); }
    // Cây gậy tia sét trong tay
    ctx.strokeStyle = "#FACC15"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(78, 432); ctx.lineTo(96, 404); ctx.stroke(); ctx.lineCap = "butt";
  }
  function veHud() {
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    hinhTron(12, 10, 290, 44, 14); ctx.fillStyle = "rgba(15,23,42,.6)"; ctx.fill();
    var tim = ""; for (var k = 0; k < L.timMax; k++) tim += k < L.tim ? "♥" : "♡";
    ctx.font = "800 24px " + CHU; ctx.fillStyle = "#FB7185"; ctx.fillText(tim, 24, 33);
    ctx.font = "800 20px " + CHU; ctx.fillStyle = "#fff"; ctx.fillText(String(L.diem), 24 + L.timMax * 22 + 18, 33);
    if (L.combo > 1) { ctx.font = "800 15px " + CHU; ctx.fillStyle = "#86EFAC"; ctx.fillText("x" + L.combo, 24 + L.timMax * 22 + 78, 33); }
    if (L.pha === "tin") { ctx.font = "600 14px " + CHU; ctx.fillStyle = "#BFDBFE"; ctx.textAlign = "right"; ctx.fillText(T.tin(L.xong, L.hang.length), 290, 33); }
    if (L.bao) {
      ctx.font = "800 32px " + CHU; ctx.textAlign = "center";
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(15,23,42,.7)"; ctx.strokeText(L.bao.chu, rongNhin / 2 - 60, 440);
      ctx.fillStyle = "#FDE68A"; ctx.fillText(L.bao.chu, rongNhin / 2 - 60, 440);
    }
  }

  // ---------- Vòng lặp ----------
  function vong(t) {
    raf = requestAnimationFrame(vong);
    var d = Math.min(0.05, Math.max(0, (t - truoc) / 1000)); truoc = t;
    if (trangThai === "choi" && !document.hidden) {
      du += d;
      while (du >= BUOC && trangThai === "choi") { capNhat(BUOC); du -= BUOC; }
    }
    ve();
  }
  function chayVong() { if (!raf) { truoc = performance.now(); du = 0; raf = requestAnimationFrame(vong); } }
  function dungVong() { if (raf) cancelAnimationFrame(raf); raf = 0; ve(); }

  function coGian() {
    // clientWidth/Height là kích thước chưa xoay (ở chế độ game khung có thể bị xoay 90°).
    var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    rongNhin = CAO * w / h;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    tiLe = cv.width / rongNhin;
    lop.style.width = rongNhin + "px"; lop.style.height = CAO + "px";
    lop.style.transform = "scale(" + (w / rongNhin) + ")";
    ve();
  }

  // ---------- Toàn màn hình nằm ngang trên điện thoại (theo phieu-luu.js) ----------
  var DT = window.matchMedia ? window.matchMedia("(pointer: coarse), (max-width: 700px)") : {matches: false};
  var daThoat = false;
  function toanMan(bat) {
    var g = $("#cl"), nut = $("#cl-toan");
    g.classList.toggle("is-toan", bat);
    document.documentElement.classList.toggle("cl-mo-toan", bat);
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
    if (!ios || rieng || $("#cl-meo")) return;
    var lan = 0; try { lan = +localStorage.getItem("mhai-chan-lua-meo") || 0; } catch (e) {}
    if (lan >= 2) return;
    try { localStorage.setItem("mhai-chan-lua-meo", String(lan + 1)); } catch (e) {}
    var m = el("div", "cl-meo"); m.id = "cl-meo"; m.setAttribute("role", "status");
    m.appendChild(el("p", null, T.meoIos));
    var x = el("button", null, "✕"); x.type = "button"; x.setAttribute("aria-label", T.dong);
    function bo() { if (m.parentNode) m.parentNode.removeChild(m); }
    x.addEventListener("click", function () { bo(); try { localStorage.setItem("mhai-chan-lua-meo", "9"); } catch (e) {} });
    m.appendChild(x); $("#cl").appendChild(m);
    setTimeout(bo, 9000);
  }

  // ---------- Màn chọn / kết quả ----------
  function an(m) { m.hidden = true; }
  function hienMan(noiDung) {
    tatNoi();
    man.innerHTML = ""; man.appendChild(noiDung); man.hidden = false;
    $("#cl-menu").hidden = true; $("#cl-cham").hidden = true;
    khung.classList.remove("is-choi"); $("#cl").classList.add("is-man");
    var n = $("button:not([disabled]), a", man); if (n) n.focus({preventScroll: true});
  }
  function theLuat() {
    var w = el("div", "cl-luat");
    w.appendChild(el("b", null, T.luat));
    var ds = el("ol");
    T.luat3.forEach(function (x) { ds.appendChild(el("li", null, x)); });
    w.appendChild(ds);
    w.appendChild(el("p", null, T.luatPhu));
    return w;
  }
  function manChon() {
    trangThai = "chon"; L = null; lop.innerHTML = ""; dungVong();
    var w = el("div", "cl-chon");
    w.appendChild(el("h2", null, T.chon));
    w.appendChild(el("p", "cl-chon-phu", T.chonTxt));
    var ds = el("div", "cl-ds");
    var mans = D ? D.man : [], sap = D ? D.sap_toi : [];
    mans.forEach(function (m, i) {
      var s = tienDo.sao[m.id] || 0;
      var b = el("button", "cl-the" + (s ? " is-xong" : "")); b.type = "button";
      b.appendChild(el("span", "cl-the-so", String(i + 1)));
      b.appendChild(el("b", null, chu(m.ten)));
      b.appendChild(el("span", "cl-the-phu", chu(m.phu) + " · " + saoChu(s)));
      b.addEventListener("click", function () { manVao(i); });
      ds.appendChild(b);
    });
    sap.forEach(function (m, k) {
      var b = el("div", "cl-the is-khoa");
      b.appendChild(el("span", "cl-the-so", String(mans.length + k + 1)));
      b.appendChild(el("b", null, chu(m.ten)));
      b.appendChild(el("span", "cl-the-phu", T.sapCo + " · " + chu(m.phu)));
      ds.appendChild(b);
    });
    w.appendChild(ds);
    hienMan(w);
    $("#cl-tong").textContent = T.tongSao(tongSao(), 3 * Math.max(1, mans.length));
  }
  // Thẻ mở đầu màn: luật chơi chính là 3 dấu hiệu cần soát.
  function manVao(i) {
    var m = D.man[i], w = el("div", "cl-vao");
    w.appendChild(el("h2", null, T.man + " " + (i + 1) + " · " + chu(m.ten)));
    w.appendChild(theLuat());
    var hang = el("p", "cl-hang");
    var c = el("button", "btn btn-yt", T.choi); c.type = "button"; c.addEventListener("click", function () { batDauMan(i); });
    var v = el("button", "btn", T.veChon); v.type = "button"; v.addEventListener("click", manChon);
    hang.appendChild(c); hang.appendChild(v); w.appendChild(hang);
    hienMan(w);
  }
  function ketQua(thang) {
    trangThai = "xong"; dungVong();
    var m = L.m, sao = 0;
    if (thang) {
      sao = 1 + (L.timMax - L.tim <= 1 ? 1 : 0) + (L.tim === L.timMax ? 1 : 0);
      if (sao > (tienDo.sao[m.id] || 0)) { tienDo.sao[m.id] = sao; luu(); }
      do_("game-xong", {tro: "chan-lua", man: L.i + 1, sao: sao});
    } else do_("game-thua", {tro: "chan-lua", man: L.i + 1});
    var w = el("div", "cl-kq");
    var dau = el("div", "cl-kq-dau");
    var im = el("img"); im.src = GOC + "assets/" + (thang ? "bit-vui.svg" : "bit-sai-roi.svg"); im.alt = ""; im.width = 72; im.height = 72;
    dau.appendChild(im);
    var tx = el("div");
    tx.appendChild(el("h3", null, thang ? T.qua : T.thua));
    if (thang) tx.appendChild(el("p", "cl-kq-sao", saoChu(sao)));
    tx.appendChild(el("p", null, thang ? T.quaTxt(sao, L.diem) : T.thuaTxt));
    dau.appendChild(tx);
    // Đầu thẻ gồm điểm và nút: thẻ "Gửi cho bố mẹ" (chia-se.js) chèn ngay sau phần này, nút không bị đẩy xuống.
    var dauThe = el("div"); dauThe.appendChild(dau); w.appendChild(dauThe);
    var keys = Object.keys(L.bat);
    if (keys.length) {
      w.appendChild(el("b", "cl-kq-h", T.dauBat));
      var chip = el("p", "cl-chip");
      keys.forEach(function (k) { chip.appendChild(el("span", null, chu(D.dau_hieu[k]) + " ×" + L.bat[k])); });
      w.appendChild(chip);
    }
    var hang = el("p", "cl-hang");
    var l = el("button", "btn btn-yt", T.lai); l.type = "button"; l.addEventListener("click", function () { batDauMan(L.i); }); hang.appendChild(l);
    var x = el("button", "btn", T.xemLai); x.type = "button"; x.addEventListener("click", function () { hienMan(manXemLai(w)); }); hang.appendChild(x);
    var c = el("button", "btn", T.veChon); c.type = "button"; c.addEventListener("click", manChon); hang.appendChild(c);
    dauThe.appendChild(hang);
    hienMan(w);
    $("#cl-tong").textContent = T.tongSao(tongSao(), 3 * D.man.length);
    if (thang && window.mhaiChiaSe) window.mhaiChiaSe(w, {tro: "chan-lua", diem: String(L.diem)});
  }
  function thangMan() { if (trangThai === "choi") ketQua(true); }
  function thuaMan() { if (trangThai === "choi") ketQua(false); }
  function manXemLai(kq) {
    var w = el("div", "cl-xl");
    var ve_ = el("button", "btn", T.quayLai); ve_.type = "button"; ve_.addEventListener("click", function () { hienMan(kq); });
    w.appendChild(ve_);
    w.appendChild(el("h3", null, T.xlTieuDe));
    var ds = el("ol");
    // Lỗi trước, rồi tới các tin còn lại
    var sx = L.nhatKy.slice().sort(function (a, b) { return (a.kq === "ban-nham" || a.kq === "lot" ? 0 : 1) - (b.kq === "ban-nham" || b.kq === "lot" ? 0 : 1); });
    sx.forEach(function (nk) {
      var li = el("li", "is-" + nk.kq);
      var nhanKq = el("span", "cl-xl-kq", T.kq[nk.kq]);
      if (nk.trum) { li.appendChild(nhanKq); li.appendChild(el("b", null, nk.chu)); li.appendChild(el("p", null, T.trumBinh)); ds.appendChild(li); return; }
      var q = nk.q;
      li.appendChild(nhanKq);
      li.appendChild(el("b", null, chu(q.tu) + ": " + chu(q.chu)));
      li.appendChild(el("p", null, q.dau ? chu(D.dau_hieu[q.dau]) + ". " + chu(D.dau_hieu[q.dau].giai) : chu(q.vi_sao)));
      ds.appendChild(li);
    });
    w.appendChild(ds);
    return w;
  }
  function thongBao(s) {
    var b = $("#cl-thong"); b.textContent = s; b.hidden = false;
    clearTimeout(thongBao.h); thongBao.h = setTimeout(function () { b.hidden = true; }, 2600);
  }

  function batDau() {
    cv = $("#cl-canvas"); lop = $("#cl-lop"); man = $("#cl-man"); khung = $("#cl-khung");
    if (!cv || !cv.getContext) return;
    ctx = cv.getContext("2d");
    anhMark = new Image(); anhMark.onload = function () { ve(); };
    anhMark.src = GOC + "assets/mascot/mark-chi-len-tinh.webp";
    coGian();
    window.addEventListener("resize", coGian);
    toanMan(false);
    $("#cl-toan").addEventListener("click", function () {
      var bat = !$("#cl").classList.contains("is-toan");
      daThoat = !bat; toanMan(bat);
    });
    $("#cl-menu").addEventListener("click", function () { if (L) L.ketThuc = true; manChon(); });
    $("#cl-cham").addEventListener("click", function () {
      if (!L || L.chamCon <= 0 || L.cham > 0) return;
      L.chamCon--; L.cham = 5; capNhatCham();
    });
    $("#cl-bao").addEventListener("pointerdown", tatNoi);
    $("#cl-xoa").addEventListener("click", function () {
      if (!confirm(T.xoaHoi)) return;
      tienDo = {sao: {}}; luu(); if (D) manChon();
    });
    $("#cl-tong").textContent = T.dangTai;
    taiDuLieu().then(manChon).catch(function () { thongBao(T.loi); $("#cl-tong").textContent = ""; });
    // Móc kiểm thử: chỉ bật khi URL có ?thu=1
    if (/[?&]thu=1/.test(location.search)) window.__cl = {L: function () { return L; }, D: function () { return D; }, batDauMan: batDauMan, banTin: banTin, trangThai: function () { return trangThai; }};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

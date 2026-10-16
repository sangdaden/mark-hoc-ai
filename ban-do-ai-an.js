/* "Bản đồ AI ẩn" (ban-do-ai-an.html, en/): 4 bức tranh (điện thoại, thành phố, nhà, siêu thị), mỗi tranh 6 đồ vật,
   mỗi đồ vật là một video. Bấm đồ vật mở một mô phỏng 30 giây (kéo thanh, đoán trước, AI chấm điểm, xếp vào hai ngăn),
   xong thì Bit giải thích, có mẹo thử hôm nay và link video/bài. Đồ vật đã xem được đánh dấu (localStorage mhai-bd).
   Dữ liệu: thẻ <script id="bd-du-lieu"> do scripts/trang/ban-do-ai-an.py tạo từ data/ban-do-ai-an.json.
   Mở thẳng một đồ vật: ?diem=<id> (trang bài của từng video dùng cách này). Thêm tập mới: chỉ thêm dòng vào JSON,
   đồ vật mới vẽ ở VAT bên dưới (vẽ bằng hình khối, không dùng emoji). Chạy thử: trạng thái ở window.__bd. */
(function () {
  "use strict";
  var nguon = document.getElementById("bd-du-lieu");
  var goc = document.getElementById("bd");
  if (!nguon || !goc) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan;
  var DIEM = {};
  D.diem.forEach(function (d) { DIEM[d.id] = d; });
  var KHOA = "mhai-bd";
  var S = { canh: D.canh[0].id, diem: null, da: {} };
  window.__bd = S;
  try { (localStorage.getItem(KHOA) || "").split(",").forEach(function (x) { if (DIEM[x]) S.da[x] = true; }); } catch (e) {}

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function luu() { try { localStorage.setItem(KHOA, Object.keys(S.da).join(",")); } catch (e) {} }
  function cua(canh) { return D.diem.filter(function (d) { return d.canh === canh; }); }
  function demDa(ds) { return ds.filter(function (d) { return S.da[d.id]; }).length; }

  // ---------- tranh: nền và đồ vật vẽ bằng SVG (viewBox 1000 x 625, toạ độ đồ vật tính theo % trong JSON) ----------
  var R = function (x, y, w, h, rx, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; };
  var C = function (x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + c + '"/>'; };
  var P = function (d, c) { return '<path d="' + d + '" class="' + c + '"/>'; };
  var song = function (x, y, n, c) { // các vòng sóng âm/tín hiệu
    var s = "";
    for (var i = 1; i <= n; i++) s += P("M" + (x + i * 12) + " " + (y - i * 10) + " q" + (i * 8) + " " + (i * 10) + " 0 " + (i * 20), c);
    return s;
  };
  var VAT = {
    // điện thoại
    "chup-dem": function () {
      return P("M-78 -58 a24 24 0 1 0 20 34 a20 20 0 1 1 -20 -34z", "f3") + C(-30, -62, 3, "f3") + C(70, -60, 3, "f3") +
        R(-60, -34, 120, 78, 14, "f0 s") + R(-34, -44, 34, 14, 4, "f0 s") + C(0, 6, 26, "f6") + C(0, 6, 14, "f1") + C(5, 1, 4, "f0") + R(34, -24, 16, 10, 3, "f3");
    },
    "ban-phim": function () {
      var k = "";
      for (var r = 0; r < 3; r++) for (var c = 0; c < 7; c++) k += R(-66 + c * 19 + (r === 2 ? 10 : 0), -2 + r * 17, 14, 12, 3, r === 2 && c > 4 ? "f9" : "f5");
      return R(-76, -12, 152, 66, 10, "f0 s") + k + R(-52, -66, 104, 34, 17, "f4 s") + C(-20, -49, 5, "f1") + C(0, -49, 5, "f1") + C(20, -49, 5, "f1") + P("M-6 -32 l8 10 l6 -10z", "f4");
    },
    "khuon-mat": function () {
      return P("M-58 -36 v-22 h22 M36 -58 h22 v22 M58 36 v22 h-22 M-36 58 h-22 v-22", "nets") +
        C(0, 0, 36, "f3 s") + C(-12, -8, 4.5, "f6") + C(12, -8, 4.5, "f6") + P("M-14 12 q14 12 28 0", "net") +
        '<g class="bd-quet">' + R(-56, -2, 112, 5, 2, "f2") + "</g>";
    },
    "ngan-hang": function () {
      return R(-72, -40, 144, 88, 12, "f1 s") + R(-72, -22, 144, 15, 0, "f6") + R(-54, 6, 28, 22, 5, "f3") + R(-14, 14, 60, 7, 3, "f0") +
        C(60, -44, 22, "f7 s") + R(57, -56, 6, 15, 2, "f0") + C(60, -33, 3.5, "f0");
    },
    "ban-do": function () {
      return R(-72, -52, 144, 104, 12, "f4 s") + P("M-72 10 h144 M-20 -52 v104 M30 -52 l-10 104", "duong") +
        P("M-50 34 C-30 34 -24 10 -18 -4 S20 -20 34 -30", "tuyen") + P("M34 -66 a16 16 0 0 1 16 16 c0 14 -16 26 -16 26 s-16 -12 -16 -26 a16 16 0 0 1 16 -16z", "f7 s") + C(34, -50, 6, "f0") +
        R(-66, 22, 40, 22, 8, "f6") + C(-46, 33, 6, "f2");
    },
    "nhac": function () {
      var b = "", h = [18, 34, 54, 40, 26, 46, 30, 16];
      for (var i = 0; i < h.length; i++) b += R(-12 + i * 12, 20 - h[i] / 2, 7, h[i], 3, "f2");
      return P("M-60 30 v-58 l34 -10 v56", "net") + C(-68, 30, 10, "f6") + C(-34, 20, 10, "f6") + b;
    },
    // thành phố
    "thoi-tiet": function () {
      return C(32, -30, 30, "f3") + P("M-62 18 a26 26 0 0 1 8 -50 a34 34 0 0 1 62 -4 a24 24 0 0 1 26 30 a22 22 0 0 1 -6 24z", "f0 s") +
        P("M-40 34 l-6 16 M-12 34 l-6 16 M16 34 l-6 16", "mua");
    },
    "bien-so": function () {
      return R(-8, -40, 14, 130, 4, "f5 s") + P("M-6 -40 h60", "net") + R(30, -58, 66, 34, 8, "f6") + C(86, -41, 9, "f1") + C(86, -41, 4, "f0") +
        P("M80 -24 L40 70 L120 70z", "tia") + R(48, 54, 56, 22, 4, "f0 s") + R(56, 62, 40, 6, 2, "f6");
    },
    "goi-xe": function () {
      return P("M-78 26 v-18 q0 -10 10 -12 l22 -4 l22 -24 q6 -6 16 -6 h40 q10 0 16 8 l18 26 q14 2 14 14 v16z", "f1 s") +
        P("M-38 -4 l18 -20 h26 v20z M14 -4 v-20 h22 l14 20z", "f4") + C(-44, 28, 14, "f6") + C(-44, 28, 5, "f5") + C(46, 28, 14, "f6") + C(46, 28, 5, "f5") +
        P("M0 -84 a15 15 0 0 1 15 15 c0 13 -15 24 -15 24 s-15 -11 -15 -24 a15 15 0 0 1 15 -15z", "f7 s") + C(0, -69, 5, "f0");
    },
    "giao-hang": function () {
      return R(-62, -18, 84, 58, 4, "f3 s") + P("M-62 -18 l18 -20 h84 l-18 20z", "f3 s") + P("M22 -18 l18 -20 v58 l-18 20z", "f3 s") + R(-28, -18, 16, 58, 0, "f5") +
        P("M54 -50 c20 0 26 30 8 46", "tuyen") + C(56, -52, 7, "f7");
    },
    "tong-dai": function () {
      return P("M-40 6 v-14 a40 40 0 0 1 80 0 v14", "net") + R(-52, -4, 22, 40, 9, "f1 s") + R(30, -4, 22, 40, 9, "f1 s") + P("M-41 36 q0 24 30 24", "net") + R(-16, 52, 16, 12, 6, "f6") +
        R(30, -74, 62, 30, 15, "f4 s") + C(46, -59, 4, "f6") + C(61, -59, 4, "f6") + C(76, -59, 4, "f6");
    },
    "dich-bien": function () {
      return R(-80, -50, 120, 64, 8, "f2 s") + P("M-66 -32 h20 m6 0 q8 -10 14 0 M-66 -12 q6 -8 12 0 t12 0 m8 0 h24 M-30 -32 l8 8 l8 -8", "chu") +
        R(4, -14, 70, 96, 12, "f6") + R(10, -6, 58, 70, 6, "f0") + R(16, 14, 46, 6, 3, "f1") + R(16, 26, 34, 6, 3, "f1") + P("M-6 -6 l16 0 m-6 -6 l6 6 l-6 6", "net");
    },
    // nhà
    "robot-hut-bui": function () {
      return P("M-120 30 h60 v-40 h60 M70 30 h-40 v-50", "vet") + '<ellipse cx="0" cy="18" rx="56" ry="26" class="f0 s"/>' +
        '<ellipse cx="0" cy="8" rx="56" ry="26" class="f0 s"/>' + '<ellipse cx="0" cy="6" rx="18" ry="8" class="f1"/>' + P("M-44 -4 q44 -22 88 0", "nets");
    },
    "loa": function () {
      return R(-28, -58, 56, 112, 24, "f6 s") + '<ellipse cx="0" cy="-48" rx="22" ry="7" class="f2 bd-sang"/>' + C(0, 10, 4, "f5") + C(0, 26, 4, "f5") +
        song(32, -10, 3, "net") + R(-60, 54, 120, 10, 3, "f5 s");
    },
    "camera-an-ninh": function () {
      return R(-14, -60, 28, 18, 4, "f5 s") + P("M0 -42 v14", "net") + '<g transform="rotate(18)">' + R(-46, -28, 90, 40, 12, "f0 s") + C(32, -8, 13, "f6") + C(32, -8, 6, "f1") + "</g>" +
        C(-30, -12, 4, "f7") + P("M30 20 L-20 90 L90 90z", "tia");
    },
    "tivi": function () {
      var o = "";
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) o += R(-74 + c * 18, -44 + r * 20, 18, 20, 0, (r + c) % 2 ? "f1" : "f2");
      return R(-84, -54, 168, 104, 10, "f6 s") + o + '<rect x="-2" y="-44" width="76" height="80" class="f1"/>' + C(36, -4, 22, "f2") + C(36, -4, 10, "f3") +
        P("M-2 -44 v80", "net0") + R(-24, 52, 48, 8, 3, "f5") + R(-6, 48, 12, 8, 0, "f5");
    },
    "dong-ho": function () {
      return R(-22, -70, 44, 140, 14, "f5 s") + R(-40, -42, 80, 84, 20, "f6 s") + P("M-28 6 q8 -22 16 0 t16 0 t16 0", "tuyen2") + P("M14 -26 a10 10 0 1 0 10 14 a8 8 0 1 1 -10 -14z", "f3");
    },
    "may-giat": function () {
      return R(-54, -66, 108, 132, 12, "f0 s") + R(-54, -66, 108, 26, 12, "f4 s") + C(-36, -53, 5, "f2") + C(-22, -53, 5, "f1") + R(8, -58, 36, 10, 3, "f6") +
        C(0, 12, 38, "f4 s") + C(0, 12, 26, "f1 bd-xoay") + R(20, -96, 58, 28, 14, "f3 s") + '<text x="49" y="-76" class="bd-nhan">AI?</text>';
    },
    // siêu thị
    "quay-tinh-tien": function () {
      return R(-82, 10, 164, 44, 6, "f5 s") + R(-70, -6, 70, 16, 4, "f6") + R(-62, -2, 54, 6, 3, "f7 bd-quet2") + R(30, -60, 52, 48, 8, "f6 s") + R(36, -54, 40, 30, 4, "f2") +
        P("M44 -40 l6 6 l12 -12", "net0") + C(-60, -20, 16, "f7 s") + R(-30, -38, 18, 32, 5, "f1 s");
    },
    "ke-hang": function () {
      var h = "", m = ["f3", "f1", "f2", "f7"];
      for (var r = 0; r < 3; r++) for (var c = 0; c < 5 - (r === 1 ? 2 : 0); c++) h += R(-72 + c * 28, -56 + r * 40, 22, 30, 3, m[(r + c) % 4]);
      return R(-80, -64, 160, 128, 6, "f0 s") + P("M-80 -24 h160 M-80 16 h160", "net") + h + P("M30 -6 l12 -10 l10 6 l20 -18", "tuyen2");
    },
    "do-tuoi": function () {
      return R(-82, -10, 164, 50, 10, "f0 s") + '<ellipse cx="-40" cy="2" rx="30" ry="12" class="f2"/>' + C(10, 0, 12, "f7") + C(30, 2, 12, "f7") + C(20, -12, 12, "f7") +
        P("M40 -70 h52 l12 18 l-12 18 h-52z", "f3 s") + C(48, -52, 5, "f0") + '<text x="74" y="-46" class="bd-nhan">-30%</text>';
    },
    "camera-tran": function () {
      return R(-70, -66, 140, 10, 0, "f5") + P("M-28 -56 h56 v6 a28 28 0 0 1 -56 0z", "f6 s") + C(0, -40, 8, "f1") +
        '<ellipse cx="-30" cy="50" rx="44" ry="16" class="f7 mo"/>' + '<ellipse cx="34" cy="54" rx="34" ry="12" class="f3 mo"/>' + '<ellipse cx="-30" cy="50" rx="18" ry="7" class="f7"/>';
    },
    "xe-day": function () {
      return P("M-80 -40 h18 l18 60 h70 l14 -46 h-96", "net") + C(-34, 36, 9, "f6") + C(30, 36, 9, "f6") + R(-40, -30, 34, 22, 4, "f3 s") +
        C(4, -20, 8, "f0 s") + C(20, -20, 8, "f0 s") + R(10, -84, 76, 32, 16, "f4 s") + C(32, -68, 7, "f0 s") + C(52, -68, 7, "f0 s") + C(72, -68, 7, "f0 s");
    },
    "may-the": function () {
      return R(-34, -50, 68, 104, 12, "f6 s") + R(-24, -40, 48, 30, 4, "f2") + R(-22, 0, 12, 9, 2, "f5") + R(-6, 0, 12, 9, 2, "f5") + R(10, 0, 12, 9, 2, "f5") +
        R(-22, 14, 12, 9, 2, "f5") + R(-6, 14, 12, 9, 2, "f5") + R(10, 14, 12, 9, 2, "f5") + R(-60, -82, 70, 44, 7, "f1 s") +
        P("M48 -70 l26 10 v18 q0 20 -26 30 q-26 -10 -26 -30 v-18z", "f7 s") + P("M38 -48 l8 8 l14 -14", "net0");
    }
  };

  var NEN = {
    "dien-thoai": function (ds) {
      var s = R(0, 0, 1000, 625, 0, "f4") + R(395, 30, 210, 565, 38, "f6") + R(409, 62, 182, 500, 24, "f0") + C(500, 46, 6, "f5");
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s += R(426 + c * 41, 92 + r * 52, 30, 30, 9, ["f1", "f2", "f3", "f7", "f5"][(r * 4 + c) % 5] + " mo2");
      ds.forEach(function (d) { s += P("M" + d.x * 10 + " " + d.y * 6.25 + " L" + (d.x < 50 ? 409 : 591) + " " + (120 + d.y * 4), "noi"); });
      return s;
    },
    "thanh-pho": function () {
      return R(0, 0, 1000, 625, 0, "f4") + R(60, 210, 140, 280, 4, "f5") + R(230, 150, 110, 340, 4, "f5 mo2") + R(380, 120, 220, 370, 6, "f5") + R(640, 190, 120, 300, 4, "f5 mo2") +
        R(790, 240, 200, 250, 6, "f5") + R(0, 480, 1000, 145, 0, "duong-pho") + P("M0 552 h1000", "vach");
    },
    "nha": function () {
      return R(0, 0, 1000, 625, 0, "f4") + R(0, 470, 1000, 155, 0, "f5") + R(260, 40, 130, 110, 8, "f0 s") + P("M325 40 v110 M260 95 h130", "net") +
        R(40, 300, 150, 12, 3, "f5 s") + R(560, 430, 150, 70, 6, "f5 s");
    },
    "sieu-thi": function () {
      var s = R(0, 0, 1000, 625, 0, "f4") + R(0, 440, 1000, 185, 0, "f5");
      for (var i = 0; i < 10; i++) s += R(i * 100, 440, 50, 185, 0, "f4 mo2");
      return s + R(0, 0, 1000, 40, 0, "f5") + R(370, 120, 260, 40, 20, "f1 mo2");
    }
  };

  function ve(canh) {
    var ds = cua(canh.id);
    var s = '<svg class="bd-svg" viewBox="0 0 1000 625" aria-hidden="true" focusable="false">' + NEN[canh.id](ds);
    ds.forEach(function (d) {
      var f = VAT[d.vat];
      if (f) s += '<g class="bd-vat" data-id="' + d.id + '" transform="translate(' + d.x * 10 + " " + d.y * 6.25 + ')">' + f() + "</g>";
    });
    return s + "</svg>";
  }

  // ---------- khung trang ----------
  var tabs = goc.querySelector(".bd-tabs");
  var khung = goc.querySelector(".bd-tranh");
  var hang = goc.querySelector(".bd-hang");
  var the = goc.querySelector(".bd-the");
  var dem = goc.querySelector(".bd-dem");

  function capNhatDem() {
    var n = demDa(D.diem);
    dem.querySelector("b").textContent = n + "/" + D.diem.length;
    dem.querySelector(".bd-dem-thanh i").style.width = (100 * n / D.diem.length) + "%";
    D.canh.forEach(function (c) {
      var t = tabs.querySelector('[data-canh="' + c.id + '"] small');
      var ds = cua(c.id);
      if (t) t.textContent = demDa(ds) + "/" + ds.length;
    });
  }

  function veTabs() {
    tabs.innerHTML = "";
    D.canh.forEach(function (c) {
      var b = el("button", "cb-tab bd-tab");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.dataset.canh = c.id;
      b.setAttribute("aria-selected", c.id === S.canh ? "true" : "false");
      b.appendChild(el("span", null, c.ngan));
      b.appendChild(el("small", null, ""));
      b.addEventListener("click", function () { moCanh(c.id); });
      tabs.appendChild(b);
    });
  }

  function moCanh(id, giuThe) {
    S.canh = id;
    var canh = D.canh.filter(function (c) { return c.id === id; })[0];
    tabs.querySelectorAll(".bd-tab").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.canh === id ? "true" : "false"); });
    khung.innerHTML = ve(canh);
    khung.setAttribute("aria-label", canh.mo);
    hang.innerHTML = "";
    cua(id).forEach(function (d) {
      var nut = el("button", "bd-diem");
      nut.type = "button";
      nut.dataset.id = d.id;
      nut.style.left = d.x + "%";
      nut.style.top = d.y + "%";
      nut.setAttribute("aria-label", d.ten + " · " + N.video + " " + d.video);
      nut.appendChild(el("span", "bd-cham", ""));
      nut.addEventListener("click", function () { moDiem(d.id, true); });
      khung.appendChild(nut);
      var chip = el("button", "bd-chip");
      chip.type = "button";
      chip.dataset.id = d.id;
      chip.appendChild(el("span", "bd-chip-so", String(d.video)));
      chip.appendChild(el("span", null, d.ten));
      chip.addEventListener("click", function () { moDiem(d.id, true); });
      hang.appendChild(chip);
    });
    danhDau();
    capNhatDem();
    if (!giuThe) { S.diem = null; theTrong(canh); }
  }

  function danhDau() {
    goc.querySelectorAll(".bd-diem, .bd-chip").forEach(function (b) {
      b.classList.toggle("is-da", !!S.da[b.dataset.id]);
      b.classList.toggle("is-mo", b.dataset.id === S.diem);
      if (b.classList.contains("bd-chip")) b.setAttribute("aria-pressed", b.dataset.id === S.diem ? "true" : "false");
    });
    goc.querySelectorAll(".bd-vat").forEach(function (g) { g.classList.toggle("is-mo", g.dataset.id === S.diem); });
  }

  function theTrong(canh) {
    the.innerHTML = "";
    the.classList.add("is-trong");
    var ds = cua(canh.id), n = demDa(ds);
    the.appendChild(el("p", "bd-the-nho", canh.ten + " · " + n + "/" + ds.length));
    the.appendChild(el("h2", "bd-the-ten", n === ds.length ? N.xong_canh : N.bat_dau));
    the.appendChild(el("p", "bd-the-mo", canh.mo));
    var img = el("img", "bd-bit");
    img.src = D.p + "assets/bit-y-tuong.svg"; img.alt = ""; img.width = 120; img.height = 113;
    the.appendChild(img);
  }

  // ---------- mô phỏng ----------
  function noiSuy(diem, x) {
    if (x <= diem[0][0]) return diem[0][1];
    for (var i = 1; i < diem.length; i++) {
      if (x <= diem[i][0]) {
        var a = diem[i - 1], b = diem[i];
        return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
    }
    return diem[diem.length - 1][1];
  }
  var soFmt = function (n, le) { return new Intl.NumberFormat(D.lg === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: le || 0, minimumFractionDigits: le || 0 }).format(n); };

  function simTruot(m, xong) {
    var k = el("div", "bd-sim bd-truot");
    var dong = el("label", "bd-tr-nhan");
    var chuNhan = el("span", null, m.nhan);
    var gt = el("b", "bd-tr-gt");
    dong.appendChild(chuNhan); dong.appendChild(gt);
    var o = el("input", "bd-tr-o");
    o.type = "range"; o.min = m.min; o.max = m.max; o.step = m.buoc || 1; o.value = m.dau;
    dong.appendChild(o);
    k.appendChild(dong);
    var ra = el("div", "bd-tr-ra");
    var hinh;
    if (m.hinh === "nhieu") {
      hinh = el("div", "bd-anh");
      hinh.innerHTML = '<svg viewBox="0 0 200 120" aria-hidden="true"><rect width="200" height="120" class="f6"/><circle cx="150" cy="32" r="16" class="f3"/>' +
        '<path d="M0 120 L50 60 L90 95 L130 50 L200 120z" class="f1"/><path d="M0 120 L60 80 L110 120z" class="f2"/></svg><i class="bd-hat"></i>';
      ra.appendChild(hinh);
    }
    var o2 = el("div", "bd-o-so");
    o2.appendChild(el("small", null, m.ra.nhan));
    var so = el("b", null, "");
    o2.appendChild(so);
    var thanh = el("span", "bd-thanh"); var ruot = el("i"); thanh.appendChild(ruot); o2.appendChild(thanh);
    ra.appendChild(o2);
    k.appendChild(ra);
    var loi = el("p", "bd-tr-loi", "");
    loi.setAttribute("aria-live", "polite");
    k.appendChild(loi);
    var doi = 0;
    function capNhat() {
      var x = +o.value, y = noiSuy(m.ra.diem, x);
      gt.textContent = soFmt(x, (String(m.buoc || 1).split(".")[1] || "").length) + (m.don_vi ? " " + m.don_vi : "");
      so.textContent = soFmt(y, m.ra.le) + (m.ra.don_vi ? " " + m.ra.don_vi : "");
      ruot.style.width = Math.max(2, Math.min(100, 100 * y / (m.ra.max || 100))) + "%";
      if (hinh) hinh.querySelector(".bd-hat").style.opacity = Math.max(0, Math.min(1, y / (m.ra.max || 100)));
      var chu = "";
      (m.muc || []).forEach(function (mc) { if (x >= mc.tu) chu = mc.chu; });
      loi.textContent = chu;
    }
    o.addEventListener("input", function () { capNhat(); doi++; if (doi === 3) xong(); });
    o.addEventListener("change", function () { if (doi < 3) { doi = 3; xong(); } });
    capNhat();
    return k;
  }

  function simChon(m, xong) {
    var k = el("div", "bd-sim bd-chon");
    k.appendChild(el("p", "bd-hoi", m.hoi));
    var ds = el("div", "bd-lc");
    m.lua_chon.forEach(function (l) {
      var b = el("button", "bd-lc-nut", l.chu);
      b.type = "button";
      b.addEventListener("click", function () {
        if (k.classList.contains("is-xong")) return;
        k.classList.add("is-xong");
        ds.querySelectorAll("button").forEach(function (x, i) {
          var lc = m.lua_chon[i];
          x.disabled = true;
          x.classList.add(lc.dung ? "is-dung" : (x === b ? "is-sai" : "is-mo"));
          if (lc.dung || x === b) {
            var g = el("span", "bd-lc-giai", lc.giai);
            x.appendChild(g);
          }
        });
        k.appendChild(el("p", "bd-ket " + (l.dung ? "is-dung" : "is-sai"), l.dung ? N.dung : N.chua_dung));
        xong();
      });
      ds.appendChild(b);
    });
    k.appendChild(ds);
    return k;
  }

  function simXacSuat(m, xong) {
    var k = el("div", "bd-sim bd-xs");
    var i = 0, dung = 0;
    function vong() {
      k.innerHTML = "";
      var v = m.vong[i];
      var dau = el("p", "bd-xs-dau");
      dau.appendChild(el("span", "bd-xs-vong", N.vong + " " + (i + 1) + "/" + m.vong.length));
      k.appendChild(dau);
      k.appendChild(el("p", "bd-xs-vao", v.vao));
      k.appendChild(el("p", "bd-hoi", m.hoi));
      var ds = el("div", "bd-xs-ds");
      var cao = v.nhan.reduce(function (a, b) { return b.p > a.p ? b : a; });
      v.nhan.forEach(function (n) {
        var b = el("button", "bd-xs-nut");
        b.type = "button";
        b.appendChild(el("span", "bd-xs-chu", n.chu));
        var th = el("span", "bd-xs-thanh"); var r = el("i"); th.appendChild(r); b.appendChild(th);
        b.appendChild(el("b", "bd-xs-p", ""));
        b.addEventListener("click", function () {
          if (ds.classList.contains("is-xong")) return;
          ds.classList.add("is-xong");
          if (n === cao) dung++;
          var bs = ds.querySelectorAll("button");
          v.nhan.forEach(function (x, j) {
            var bj = bs[j];
            bj.disabled = true;
            bj.querySelector("i").style.width = x.p + "%";
            bj.querySelector(".bd-xs-p").textContent = x.p + "%";
            if (x === cao) bj.classList.add("is-cao");
            if (bj === b) bj.classList.add("is-chon");
          });
          var tiep = el("button", "ct-nut bd-tiep", i < m.vong.length - 1 ? N.vong_tiep + " →" : N.xem_giai);
          tiep.type = "button";
          k.appendChild(el("p", "bd-ket " + (n === cao ? "is-dung" : "is-sai"), n === cao ? N.trung_ai : N.ai_chon + ": " + cao.chu));
          tiep.addEventListener("click", function () {
            if (i < m.vong.length - 1) { i++; vong(); } else { tiep.remove(); k.appendChild(el("p", "bd-xs-tong", N.ban_doan_trung + " " + dung + "/" + m.vong.length)); xong(); }
          });
          k.appendChild(tiep);
          tiep.focus({ preventScroll: true });
        });
        ds.appendChild(b);
      });
      k.appendChild(ds);
    }
    vong();
    return k;
  }

  function simPhanLoai(m, xong) {
    var k = el("div", "bd-sim bd-pl");
    k.appendChild(el("p", "bd-hoi", m.hoi));
    var i = 0, dung = 0;
    var muc = el("div", "bd-pl-muc");
    k.appendChild(muc);
    var nut = el("div", "bd-pl-ngan");
    var loi = el("p", "bd-pl-loi", "");
    loi.setAttribute("aria-live", "polite");
    m.ngan.forEach(function (ten, j) {
      var b = el("button", "bd-pl-nut bd-pl-" + j, ten);
      b.type = "button";
      b.addEventListener("click", function () {
        if (i >= m.muc.length || k.classList.contains("is-cho")) return;
        var x = m.muc[i], ok = x.ngan === j;
        if (ok) dung++;
        loi.className = "bd-pl-loi " + (ok ? "is-dung" : "is-sai");
        loi.textContent = (ok ? "✓ " : "✗ " + N.dung_la + " " + m.ngan[x.ngan] + ". ") + x.giai;
        var the = muc.querySelector(".bd-pl-the");
        if (the) { the.classList.add(j === 0 ? "di-trai" : "di-phai"); }
        k.classList.add("is-cho");
        setTimeout(function () { k.classList.remove("is-cho"); i++; hien(); }, 260);
      });
      nut.appendChild(b);
    });
    k.appendChild(nut);
    k.appendChild(loi);
    var dot = el("p", "bd-pl-dot", "");
    k.appendChild(dot);
    function hien() {
      muc.innerHTML = "";
      if (i >= m.muc.length) {
        nut.hidden = true;
        muc.hidden = true;
        k.appendChild(el("p", "bd-xs-tong", N.ban_xep_dung + " " + dung + "/" + m.muc.length));
        dot.textContent = "";
        xong();
        return;
      }
      muc.appendChild(el("div", "bd-pl-the", m.muc[i].chu));
      dot.textContent = (i + 1) + "/" + m.muc.length;
    }
    hien();
    return k;
  }

  var SIM = { truot: simTruot, chon: simChon, xac_suat: simXacSuat, phan_loai: simPhanLoai };

  function moDiem(id, cuon) {
    var d = DIEM[id];
    if (!d) return;
    if (d.canh !== S.canh) moCanh(d.canh, true);
    S.diem = id;
    danhDau();
    the.innerHTML = "";
    the.classList.remove("is-trong");
    var dau = el("div", "bd-the-dau");
    dau.appendChild(el("span", "bd-so", N.video + " " + d.video));
    dau.appendChild(el("span", "bd-kieu", N.kieu[d.sim.kieu] || ""));
    the.appendChild(dau);
    var h = el("h2", "bd-the-ten", d.ten);
    h.id = "bd-the-ten";
    the.appendChild(h);
    the.appendChild(el("p", "bd-the-mo", d.ai_lam));
    var sau = el("div", "bd-sau");
    sau.hidden = true;
    var daXong = false;
    the.appendChild(SIM[d.sim.kieu](d.sim, function () {
      if (daXong) return;
      daXong = true;
      if (!S.da[id]) { S.da[id] = true; luu(); do_("ban-do-xong", { diem: id }); }
      danhDau(); capNhatDem();
      sau.hidden = false;
      var ds = cua(d.canh);
      if (demDa(ds) === ds.length && !S["xong-" + d.canh]) {
        S["xong-" + d.canh] = true;
        do_("ban-do-xong-canh", { canh: d.canh });
        sau.appendChild(el("p", "bd-huy", "★ " + N.xong_canh));
      }
    }));
    var bit = el("div", "bd-bit-noi");
    var img = el("img");
    img.src = D.p + "assets/bit-giai-thich.svg"; img.alt = ""; img.width = 64; img.height = 60;
    bit.appendChild(img);
    var o = el("div");
    o.appendChild(el("b", null, N.bit_noi));
    o.appendChild(el("p", null, d.y_chinh));
    bit.appendChild(o);
    sau.appendChild(bit);
    var thu = el("p", "bd-thu");
    thu.appendChild(el("b", null, N.thu + ": "));
    thu.appendChild(document.createTextNode(d.thu));
    sau.appendChild(thu);
    var nut = el("div", "bd-nut");
    if (d.bai) {
      var a = el("a", "ct-nut", N.doc_bai);
      a.href = d.bai;
      if (document.documentElement.classList.contains("nhung")) a.target = "_top";
      nut.appendChild(a);
    } else {
      nut.appendChild(el("span", "bd-sap", N.sap_ra + " · " + N.video + " " + d.video));
    }
    var ds2 = cua(d.canh), vt = ds2.indexOf(d);
    var ke = ds2.filter(function (x) { return !S.da[x.id] && x !== d; })[0] || ds2[(vt + 1) % ds2.length];
    var tiep = el("button", "btn bd-ke", N.ai_tiep + " →");
    tiep.type = "button";
    tiep.addEventListener("click", function () { moDiem(ke.id, true); });
    nut.appendChild(tiep);
    sau.appendChild(nut);
    the.appendChild(sau);
    do_("ban-do-mo", { diem: id });
    if (cuon) {
      var r = the.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.top < 0) the.scrollIntoView({ behavior: "smooth", block: "start" });
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }

  veTabs();
  var q = new URLSearchParams(location.search);
  var mo = q.get("diem");
  if (mo && DIEM[mo]) { moCanh(DIEM[mo].canh, true); moDiem(mo, false); }
  else moCanh(q.get("canh") && D.canh.some(function (c) { return c.id === q.get("canh"); }) ? q.get("canh") : D.canh[0].id);
})();

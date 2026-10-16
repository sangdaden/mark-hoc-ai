/* Phòng thí nghiệm bộ não AI (phong-thi-nghiem-bo-nao.html, en/...): bàn thí nghiệm có ngăn kéo (Sang chọn bố cục C, 16/10).
   Bên trái là danh sách trạm, bên phải là trạm đang mở. Mở thẳng một trạm bằng ?tram=cat-manh hoặc #cat-manh.
   Trạm 1 Cắt mảnh: bộ tách token thật o200k_base (assets/vendor/gpt-tokenizer, nạp khi mở trạm).
   Trạm 6 Đoán chữ tiếp: mô hình n-gram nhỏ học từ bài viết và kịch bản của kênh (data/bo-nao/doan-chu*.json, scripts/tao_doan_chu.py).
   Trạm 7 Vòng quay: công thức nhiệt độ p^(1/T) và top-p, số mặc định là ví dụ trong video 24.
   Không gọi AI thật, không gửi gì đi đâu. */
(function () {
  var goc = document.getElementById("bn");
  if (!goc) return;
  var EN = document.documentElement.lang === "en";
  var DUONG = EN ? "../" : "";
  var L = EN ? {
    ban: "Tokens", manh1: "token", manhN: "tokens", kyTu: "characters", tbinh: "characters per token",
    le: "half a character: this letter was split across tokens", soTT: "Show each token's number in the vocabulary",
    boBot: function (n) { return n > 0 ? "You cut " + n + " token" + (n > 1 ? "s" : "") + " compared with the first sentence." : n < 0 ? "That's " + (-n) + " more than the first sentence." : ""; },
    tien: function (n, gia) { return "Asked 1,000 times: about " + (n * 1000).toLocaleString("en-US") + " tokens, roughly $" + (n * 1000 * gia / 1e6).toFixed(4) + " at $" + gia + " per million tokens."; },
    taiTok: "Loading the tokenizer…", loiTok: "Couldn't load the tokenizer. Check your connection and reopen this station.",
    dua2: function (c) { return "Based on the last 2 words: “" + c + "”"; }, dua1: function (c) { return "Based on only the last word: “" + c + "”"; },
    dua0: "No match for these words, so it falls back to the most common words overall",
    dauCham: "full stop", dauPhay: "comma", taiDoan: "Loading the word predictor…",
    quay: "Spin", quay20: "Spin 20 times", lan: "Spin", ketQua: "Result", xoaDem: "Clear tally",
    nhietThap: "Low: almost always the biggest slice. Same answer every time.",
    nhietVua: "Around 1: picks follow the original odds.",
    nhietCao: "High: slices even out, rare words get a real chance. Creative, but can wander off topic.",
    giu: function (k, n) { return "Keeping " + k + " of " + n + " slices"; },
    tuTram6: "Using the odds from station 6 for “", tuVideo: "Example numbers from video 24",
    viDu: [["Today I want to drink", [["coffee", 40], ["milk tea", 25], ["water", 20], ["beer", 10], ["a smoothie", 5]]]]
  } : {
    ban: "Mảnh", manh1: "mảnh", manhN: "mảnh", kyTu: "ký tự", tbinh: "ký tự mỗi mảnh",
    le: "nửa chữ: chữ này bị cắt sang 2 mảnh", soTT: "Hiện số thứ tự của mỗi mảnh trong từ điển",
    boBot: function (n) { return n > 0 ? "Bạn đã bớt được " + n + " mảnh so với câu ban đầu." : n < 0 ? "Câu này nhiều hơn câu ban đầu " + (-n) + " mảnh." : ""; },
    tien: function (n, gia) { return "Hỏi 1.000 lần: khoảng " + (n * 1000).toLocaleString("vi-VN") + " mảnh, tốn chừng " + (n * 1000 * gia / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 4 }) + " đô la nếu giá " + gia + " đô mỗi triệu mảnh."; },
    taiTok: "Đang tải bộ tách mảnh…", loiTok: "Chưa tải được bộ tách mảnh. Kiểm tra mạng rồi mở lại trạm này.",
    dua2: function (c) { return "Dựa vào 2 chữ cuối: “" + c + "”"; }, dua1: function (c) { return "Chỉ dựa vào 1 chữ cuối: “" + c + "”"; },
    dua0: "Chưa gặp mấy chữ này, nên đoán theo những chữ hay gặp nhất",
    dauCham: "dấu chấm", dauPhay: "dấu phẩy", taiDoan: "Đang tải bộ đoán chữ…",
    quay: "Quay", quay20: "Quay 20 lần", lan: "Lần", ketQua: "Trúng", xoaDem: "Xóa đếm",
    nhietThap: "Thấp: gần như lần nào cũng trúng ô to nhất. Hỏi mấy lần cũng ra một đáp án.",
    nhietVua: "Quanh 1: bốc thăm đúng theo tỉ lệ ban đầu.",
    nhietCao: "Cao: các ô gần bằng nhau, chữ hiếm cũng có cơ hội. Sáng tạo nhưng dễ lạc đề.",
    giu: function (k, n) { return "Giữ " + k + " trên " + n + " ô"; },
    tuTram6: "Dùng tỉ lệ thật ở trạm 6 cho “", tuVideo: "Số ví dụ trong video 24",
    viDu: [["Hôm nay tôi muốn uống", [["cà phê", 40], ["trà sữa", 25], ["nước", 20], ["bia", 10], ["sinh tố", 5]]]]
  };
  var MAU = ["#2563EB", "#7C3AED", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899", "#64748B", "#EF4444"];
  function $(id) { return document.getElementById(id); }
  function do_(ten, them) { if (window.mhaiDo) window.mhaiDo(ten, them || {}); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function napScript(src) {
    return new Promise(function (ok, loi) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = loi; document.head.appendChild(s); });
  }

  /* ---------- Ngăn kéo: chọn trạm ---------- */
  var nut = [].slice.call(goc.querySelectorAll("[data-tram]"));
  var ban = [].slice.call(goc.querySelectorAll(".bn-tram"));
  var daMo = {};
  function moTram(id, cuon) {
    var o = document.getElementById("tram-" + id);
    if (!o) return;
    ban.forEach(function (b) { b.hidden = b !== o; });
    nut.forEach(function (n) { var on = n.dataset.tram === id; n.setAttribute("aria-current", on ? "true" : "false"); });
    if (!daMo[id]) { daMo[id] = 1; if (KHOI[id]) KHOI[id](); }
    try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
    if (cuon && window.innerWidth < 820) o.scrollIntoView({ block: "start" });
    do_("bo-nao-tram", { tram: id });
  }
  nut.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });

  /* ---------- Trạm 1: Cắt mảnh ---------- */
  var TOK = null;
  function layTok() {
    if (TOK) return Promise.resolve(TOK);
    return napScript(DUONG + "assets/vendor/gpt-tokenizer/o200k_base.js?v=1").then(function () { TOK = window.GPTTokenizer_o200k_base; return TOK; });
  }
  // Mỗi mảnh hiện đúng phần chữ nó mang. Chữ có dấu đôi khi bị cắt giữa chừng: mảnh đó chỉ mang nửa chữ, hiện dấu ◇.
  function catManh(text) {
    var ids = TOK.encode(text), ra = [], truoc = "";
    for (var k = 0; k < ids.length; k++) {
      var s = TOK.decode(ids.slice(0, k + 1)).replace(/�+$/, "");
      ra.push({ id: ids[k], chu: s.slice(truoc.length) });
      truoc = s;
    }
    return ra;
  }
  function khoiCatManh() {
    var o = $("cm-chu"), kq = $("cm-manh"), so = $("cm-so"), them = $("cm-them"), tt = $("cm-tt"), gia = $("cm-gia"), tien = $("cm-tien"), bot = $("cm-bot");
    var dau = null;
    kq.textContent = L.taiTok;
    function ve() {
      var text = o.value.slice(0, 600);
      var m = catManh(text);
      if (dau === null) dau = m.length;
      kq.innerHTML = m.map(function (x, i) {
        var le = x.chu === "";
        var hien = le ? "◇" : esc(x.chu).replace(/ /g, "␣").replace(/\n/g, "↵");
        return '<span class="cm-m' + (le ? " cm-le" : "") + '" style="--m:' + MAU[i % MAU.length] + '"' + (le ? ' title="' + esc(L.le) + '"' : "") + ">" + hien +
          (tt.checked ? "<small>" + x.id + "</small>" : "") + "</span>";
      }).join("");
      var kt = [].slice.call(text).length;
      so.innerHTML = "<b>" + m.length + "</b> " + (m.length === 1 ? L.manh1 : L.manhN) + " · <b>" + kt + "</b> " + L.kyTu +
        (m.length ? " · <b>" + (kt / m.length).toFixed(1).replace(".", EN ? "." : ",") + "</b> " + L.tbinh : "");
      bot.textContent = L.boBot(dau - m.length);
      var g = parseFloat(gia.value) || 0;
      tien.textContent = L.tien(m.length, g);
      // So hai thứ tiếng cho các câu mẫu có sẵn bản dịch
      var cap = them.dataset.cap ? JSON.parse(them.dataset.cap) : null;
      if (cap) {
        var a = TOK.encode(cap[0]).length, b = TOK.encode(cap[1]).length, max = Math.max(a, b);
        them.hidden = false;
        them.querySelector(".cm-a").style.width = (a / max * 100) + "%";
        them.querySelector(".cm-b").style.width = (b / max * 100) + "%";
        them.querySelector(".cm-a-so").textContent = a;
        them.querySelector(".cm-b-so").textContent = b;
      }
    }
    layTok().then(function () {
      o.addEventListener("input", ve); tt.addEventListener("change", ve); gia.addEventListener("input", ve);
      [].slice.call(goc.querySelectorAll("[data-cm-mau]")).forEach(function (b) {
        b.addEventListener("click", function () {
          o.value = b.dataset.cmMau; dau = null;
          if (b.dataset.cap) them.dataset.cap = b.dataset.cap; else { delete them.dataset.cap; them.hidden = true; }
          ve(); do_("bo-nao-cat-manh-mau");
        });
      });
      ve();
    }).catch(function () { kq.textContent = L.loiTok; });
  }

  /* ---------- Trạm 6: Đoán chữ tiếp ---------- */
  var DOAN = null;
  function layDoan() {
    if (DOAN) return Promise.resolve(DOAN);
    return fetch(DUONG + "data/bo-nao/" + (EN ? "doan-chu-en.json" : "doan-chu.json") + "?v=1").then(function (r) { return r.json(); }).then(function (d) { DOAN = d; return d; });
  }
  function tachChu(s) { return (s.toLowerCase().match(/[\p{L}\p{N}%]+(?:[-'’][\p{L}\p{N}%]+)*|[.,!?:;]/gu) || []); }
  function duDoan(chu) {
    var n = chu.length, ds, cach;
    if (n >= 2 && DOAN.ba[chu[n - 2] + " " + chu[n - 1]]) { ds = DOAN.ba[chu[n - 2] + " " + chu[n - 1]]; cach = L.dua2(chu[n - 2] + " " + chu[n - 1]); }
    else if (n >= 1 && DOAN.hai[chu[n - 1]]) { ds = DOAN.hai[chu[n - 1]]; cach = L.dua1(chu[n - 1]); }
    else { ds = DOAN.mot.slice(0, 8); cach = L.dua0; }
    var tong = ds.reduce(function (s, x) { return s + x[1]; }, 0);
    return { cach: cach, ds: ds.map(function (x) { return { chu: x[0], p: x[1] / tong }; }) };
  }
  function tenChu(w) { return w === "." ? L.dauCham : w === "," ? L.dauPhay : w; }
  function noi(cau, w) { return /^[.,!?:;]$/.test(w) ? cau.replace(/\s+$/, "") + w + " " : cau + w + " "; }
  var cauDoan = null;
  function khoiDoanChu() {
    var o = $("dc-cau"), ds = $("dc-ds"), cach = $("dc-cach"), chay = $("dc-chay"), lai = $("dc-lai");
    var macDinh = o.value;
    ds.textContent = L.taiDoan;
    function ve() {
      var d = duDoan(tachChu(o.value));
      cauDoan = d;
      cach.textContent = d.cach;
      ds.innerHTML = d.ds.map(function (x, i) {
        return '<button type="button" class="dc-nut" data-w="' + esc(x.chu) + '"><span class="dc-w">' + esc(tenChu(x.chu)) + '</span><span class="dc-thanh"><i style="width:' + Math.max(2, x.p * 100) + '%;background:' + MAU[i % MAU.length] + '"></i></span><span class="dc-p">' + Math.round(x.p * 100) + "%</span></button>";
      }).join("");
      if (KHOI_QUAY_TU_TRAM6) KHOI_QUAY_TU_TRAM6();
    }
    function chon(w) { o.value = noi(o.value.replace(/\s*$/, " "), w); ve(); }
    ds.addEventListener("click", function (e) { var b = e.target.closest(".dc-nut"); if (b) { chon(b.dataset.w); do_("bo-nao-doan-chu"); } });
    o.addEventListener("input", ve);
    lai.addEventListener("click", function () { o.value = macDinh; ve(); });
    var dangChay = false;
    chay.addEventListener("click", function () {
      if (dangChay) return; dangChay = true; chay.disabled = true;
      var n = 0;
      (function buoc() {
        var d = duDoan(tachChu(o.value)), r = Math.random(), c = 0, w = d.ds[0].chu;
        for (var i = 0; i < d.ds.length; i++) { c += d.ds[i].p; if (r <= c) { w = d.ds[i].chu; break; } }
        chon(w); n++;
        if (n < 12 && !(w === "." && n > 3)) setTimeout(buoc, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260);
        else { dangChay = false; chay.disabled = false; }
      })();
      do_("bo-nao-tu-chay");
    });
    layDoan().then(ve).catch(function () { ds.textContent = L.loiTok; });
  }

  /* ---------- Trạm 7: Vòng quay nhiệt độ ---------- */
  var KHOI_QUAY_TU_TRAM6 = null;
  function khoiVongQuay() {
    var cv = $("vq-ve"), nhiet = $("vq-nhiet"), nhietSo = $("vq-nhiet-so"), topp = $("vq-topp"), toppSo = $("vq-topp-so"), giai = $("vq-giai"),
        ds = $("vq-ds"), quay = $("vq-quay"), quay20 = $("vq-quay20"), dem = $("vq-dem"), nguon = $("vq-nguon"), cauEl = $("vq-cau"), xoa = $("vq-xoa"), tram6 = $("vq-tram6");
    var cx = cv.getContext("2d"), goc0 = 0, dangQuay = false;
    var cau = L.viDu[0][0], o = L.viDu[0][1].map(function (x) { return { chu: x[0], p: x[1] / 100 }; }), demSo = {};
    function xs() {
      var T = parseFloat(nhiet.value), P = parseFloat(topp.value);
      var w = o.map(function (x) { return Math.pow(x.p, 1 / T); }), s = w.reduce(function (a, b) { return a + b; }, 0);
      var q = o.map(function (x, i) { return { chu: x.chu, p0: x.p, p: w[i] / s, i: i }; });
      // top-p: giữ nhóm ô lớn nhất có tổng ≥ P, bỏ phần còn lại rồi chia lại
      var xep = q.slice().sort(function (a, b) { return b.p - a.p; }), c = 0, giu = {};
      for (var k = 0; k < xep.length; k++) { giu[xep[k].i] = 1; c += xep[k].p; if (c >= P - 1e-9) break; }
      var s2 = q.reduce(function (a, x) { return a + (giu[x.i] ? x.p : 0); }, 0);
      q.forEach(function (x) { x.giu = !!giu[x.i]; x.p = x.giu ? x.p / s2 : 0; });
      return q;
    }
    function ve() {
      var q = xs(), W = cv.width, R = W / 2 - 6, mau = getComputedStyle(document.documentElement);
      cx.clearRect(0, 0, W, W);
      cx.save(); cx.translate(W / 2, W / 2); cx.rotate(goc0);
      var a = -Math.PI / 2;
      q.forEach(function (x) {
        if (!x.p) return;
        var b = a + x.p * Math.PI * 2;
        cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, R, a, b); cx.closePath();
        cx.fillStyle = MAU[x.i % MAU.length]; cx.fill();
        cx.strokeStyle = mau.getPropertyValue("--panel") || "#fff"; cx.lineWidth = 3; cx.stroke();
        if (x.p > 0.06) {
          var g = (a + b) / 2; cx.save(); cx.rotate(g); cx.fillStyle = "#fff"; cx.font = "700 " + Math.round(W / 22) + "px Inter, system-ui, sans-serif";
          cx.textBaseline = "middle";
          var tg = ((g + goc0) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          if (tg > Math.PI / 2 && tg < Math.PI * 1.5) { cx.rotate(Math.PI); cx.textAlign = "left"; cx.fillText(x.chu, -(R - 12), 0); }
          else { cx.textAlign = "right"; cx.fillText(x.chu, R - 12, 0); }
          cx.restore();
        }
        a = b;
      });
      cx.restore();
      // kim chỉ ở đỉnh
      cx.fillStyle = mau.getPropertyValue("--ink") || "#0F172A";
      cx.beginPath(); cx.moveTo(W / 2 - 12, 2); cx.lineTo(W / 2 + 12, 2); cx.lineTo(W / 2, 26); cx.closePath(); cx.fill();
      ds.innerHTML = q.map(function (x) {
        return '<li class="' + (x.giu ? "" : "vq-bo") + '"><span class="vq-w"><i style="background:' + MAU[x.i % MAU.length] + '"></i>' + esc(x.chu) + '</span><span class="vq-thanh"><b style="width:' + (x.p * 100) + '%;background:' + MAU[x.i % MAU.length] + '"></b><s style="left:' + (x.p0 * 100) + '%"></s></span><span class="vq-p">' + Math.round(x.p * 100) + "%</span><span class=\"vq-dem\">" + (demSo[x.chu] || "") + "</span></li>";
      }).join("");
      var T = parseFloat(nhiet.value);
      nhietSo.textContent = T.toFixed(1).replace(".", EN ? "." : ",");
      toppSo.textContent = parseFloat(topp.value) >= 1 ? (EN ? "off" : "tắt") : Math.round(topp.value * 100) + "%";
      giai.textContent = T < 0.6 ? L.nhietThap : T > 1.4 ? L.nhietCao : L.nhietVua;
      var k = q.filter(function (x) { return x.giu; }).length;
      $("vq-giu").textContent = k < q.length ? L.giu(k, q.length) : "";
      cauEl.textContent = cau + " ___";
    }
    function boc() {
      var q = xs(), r = Math.random(), c = 0;
      for (var i = 0; i < q.length; i++) { c += q[i].p; if (r <= c && q[i].p) return q[i]; }
      return q.filter(function (x) { return x.p; }).pop();
    }
    function ghi(x) { demSo[x.chu] = (demSo[x.chu] || 0) + 1; var tong = 0; for (var k in demSo) tong += demSo[k]; dem.textContent = L.lan + " " + tong + ": " + L.ketQua + " “" + x.chu + "”"; }
    function quayToi(x, xong) {
      // Đặt kim vào giữa ô trúng: tính góc giữa ô x trên vòng chưa xoay
      var q = xs(), a = 0;
      for (var i = 0; i < q.length; i++) { if (q[i].i === x.i) { a += q[i].p * Math.PI; break; } a += q[i].p * Math.PI * 2; }
      var dich = -a - (Math.random() - 0.5) * x.p * Math.PI * 1.2, batDau = goc0 % (Math.PI * 2), het = dich - Math.PI * 2 * 4;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { goc0 = dich; ve(); xong(); return; }
      var t0 = null, dai = 1400;
      requestAnimationFrame(function buoc(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dai), e = 1 - Math.pow(1 - k, 3);
        goc0 = batDau + (het - batDau) * e; ve();
        if (k < 1) requestAnimationFrame(buoc); else { goc0 = dich; xong(); }
      });
    }
    quay.addEventListener("click", function () {
      if (dangQuay) return; dangQuay = true; var x = boc();
      quayToi(x, function () { ghi(x); ve(); dangQuay = false; });
      do_("bo-nao-quay");
    });
    quay20.addEventListener("click", function () { if (dangQuay) return; for (var i = 0; i < 20; i++) ghi(boc()); ve(); do_("bo-nao-quay-20"); });
    xoa.addEventListener("click", function () { demSo = {}; dem.textContent = ""; ve(); });
    nhiet.addEventListener("input", ve); topp.addEventListener("input", ve);
    KHOI_QUAY_TU_TRAM6 = function () { tram6.hidden = false; };
    tram6.addEventListener("click", function () {
      var vao = $("dc-cau") && $("dc-cau").value.trim();
      function dung() {
        var d = duDoan(tachChu(vao || ""));
        cau = vao || "…"; o = d.ds.map(function (x) { return { chu: tenChu(x.chu), p: x.p }; }); demSo = {}; dem.textContent = "";
        nguon.textContent = L.tuTram6 + cau + "”"; ve();
      }
      if (DOAN) dung(); else layDoan().then(dung);
      do_("bo-nao-quay-tram6");
    });
    $("vq-video").addEventListener("click", function () {
      cau = L.viDu[0][0]; o = L.viDu[0][1].map(function (x) { return { chu: x[0], p: x[1] / 100 }; }); demSo = {}; dem.textContent = ""; nguon.textContent = L.tuVideo; ve();
    });
    nguon.textContent = L.tuVideo;
    if (window.ResizeObserver) new ResizeObserver(ve).observe(cv);
    window.addEventListener("mhai-theme", ve);
    ve();
  }

  var KHOI = { "cat-manh": khoiCatManh, "doan-chu": khoiDoanChu, "vong-quay": khoiVongQuay };
  var m = /[?&]tram=([\w-]+)/.exec(location.search), h = location.hash.replace("#", "");
  var dau = (m && m[1]) || (document.getElementById("tram-" + h) ? h : "") || "cat-manh";
  moTram(dau, false);
})();

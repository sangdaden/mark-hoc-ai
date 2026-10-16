/* "Đồ in cho gia đình" (do-in-gia-dinh.html, en/): 4 tờ in theo video 141, 143, 422, 430.
   Bên trái chơi hoặc chọn, bên phải là tờ in khổ A4 xem trước, cập nhật ngay; nút "In tờ này" chỉ in tờ đó (hoặc lưu PDF).
   Dữ liệu: thẻ <script id="di-du-lieu"> do scripts/trang/do-in-gia-dinh.py tạo từ data/do-in-gia-dinh.json. Mở thẳng một tờ: ?to=<id>.
   Chữ người xem gõ (tên nhà, số điện thoại...) chỉ nằm trên máy, không gửi đi đâu; chỉ đếm vài sự kiện (theo-doi.js). Chạy thử: window.__di. */
(function () {
  "use strict";
  var nguon = document.getElementById("di-du-lieu");
  var khu = document.getElementById("di-khu");
  if (!nguon || !khu) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, VI = D.lg === "vi";
  var TO = {};
  D.to.forEach(function (x) { TO[x.id] = x; });
  var NHUNG = document.documentElement.classList.contains("nhung");
  // Trạng thái từng tờ giữ nguyên khi đổi thẻ
  var S = { tab: null, bl: null, ln: null, st: null, bs: null };
  window.__di = S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function icon(ten, cls) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "ic" + (cls ? " " + cls : ""));
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", D.p + "assets/icons.svg#i-" + ten);
    s.appendChild(u);
    return s;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function o(nhan, giaTri, goiY, doi, kieu) {
    var hang = el("label", "di-o");
    hang.appendChild(el("span", "di-nhan", nhan));
    var i = el("input", "di-nhap");
    i.type = kieu || "text";
    i.value = giaTri || "";
    if (goiY) i.placeholder = goiY;
    i.maxLength = kieu === "date" ? 10 : 80;
    i.addEventListener("input", function () { doi(i.value); });
    hang.appendChild(i);
    return hang;
  }
  function nhom(tieu) {
    var f = el("fieldset", "di-nhom");
    f.appendChild(el("legend", "di-nhom-h", tieu));
    return f;
  }
  function chips(nhan, ds, giaTri, doi) {
    var hop = el("div", "di-chips");
    hop.setAttribute("role", "radiogroup");
    hop.setAttribute("aria-label", nhan);
    hop.appendChild(el("span", "di-nhan", nhan));
    var hang = el("span", "di-chips-hang");
    ds.forEach(function (l) {
      var b = el("button", "di-chip", l[1]);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", l[0] === giaTri ? "true" : "false");
      b.addEventListener("click", function () {
        hang.querySelectorAll(".di-chip").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        doi(l[0]);
      });
      hang.appendChild(b);
    });
    hop.appendChild(hang);
    return hop;
  }
  function oSo(nhan, so, kieu) {
    var t = el("div", "di-so" + (kieu ? " di-so-" + kieu : ""));
    t.appendChild(el("b", null, so));
    t.appendChild(el("span", null, nhan));
    return t;
  }
  function chamTien(n, tong) {
    var hang = el("div", "di-tien");
    hang.setAttribute("aria-hidden", "true");
    for (var i = 0; i < tong; i++) hang.appendChild(el("span", i < n ? "on" : ""));
    return hang;
  }
  // Ô trống trên tờ in: chưa điền thì in dòng kẻ để viết tay
  function trong(chu) { return chu && chu.trim() ? chu.trim() : "______"; }
  function ngayVN(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return "____/____/________";
    return VI ? m[3] + "/" + m[2] + "/" + m[1] : new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function chanTo(x) {
    var c = el("p", "a4-chan");
    c.appendChild(el("span", null, N.nguon));
    c.appendChild(el("span", null, N.video + " " + x.video.map(function (v) { return "#" + v.so; }).join(", ")));
    return c;
  }

  // ---------- 141 · Cùng con bắt lỗi AI ----------
  function bl(x, trai, ve) {
    var st = S.bl || (S.bl = { i: 0, cham: 0, bat: [], nguoi: N.bl_nguoi_goi_y.slice() });
    var HQ = {};
    x.thoi_quen.forEach(function (h, i) { HQ[h.id] = { so: i + 1, chu: h.chu }; });
    HQ.thay = HQ.sach;
    var choi = el("div", "di-choi");
    trai.appendChild(choi);
    function veChoi() {
      choi.innerHTML = "";
      choi.appendChild(chamTien(st.bat.length, x.ca.length));
      if (st.i >= x.ca.length) {
        var ket = el("div", "di-ket");
        ket.appendChild(el("p", "di-ket-h", N.xong));
        var so = el("div", "di-so-hang");
        so.appendChild(oSo(N.da_bat, st.bat.length + "/" + x.ca.length, "xanh"));
        so.appendChild(oSo(N.lan_cham, String(st.cham)));
        ket.appendChild(so);
        var lai = el("button", "btn btn-nhe di-lai", N.lam_lai);
        lai.type = "button";
        lai.addEventListener("click", function () { st.i = 0; st.cham = 0; st.bat = []; veChoi(); });
        ket.appendChild(lai);
        choi.appendChild(ket);
        return;
      }
      var ca = x.ca[st.i];
      var xong = st.bat.indexOf(st.i) >= 0;
      var hoi = el("div", "di-chat di-chat-con");
      hoi.appendChild(el("small", null, N.bl_hoi));
      hoi.appendChild(el("p", null, ca.hoi));
      choi.appendChild(hoi);
      var ai = el("div", "di-chat di-chat-ai");
      ai.appendChild(el("small", null, N.bl_ai));
      var tb = el("p", "di-bao", xong ? "" : N.bl_huong);
      tb.setAttribute("role", "status");
      ca.cau.forEach(function (c, j) {
        var b = el("button", "di-cau", c);
        b.type = "button";
        if (xong && j === ca.sai) b.classList.add("is-sai");
        b.disabled = xong;
        b.addEventListener("click", function () {
          st.cham++;
          if (j === ca.sai) {
            st.bat.push(st.i);
            if (st.bat.length === x.ca.length) do_("do-in-xong", { to: "bat-loi", cham: st.cham });
            veChoi();
          } else {
            b.classList.add("is-dung");
            b.disabled = true;
            tb.textContent = N.bl_cau_dung;
            tb.className = "di-bao is-chua";
          }
        });
        ai.appendChild(b);
      });
      choi.appendChild(ai);
      choi.appendChild(tb);
      if (xong) {
        var g = el("div", "di-giai");
        g.appendChild(el("p", "di-giai-h", N.dung));
        var s = el("p");
        s.appendChild(el("b", null, N.bl_su_that + ": "));
        s.appendChild(document.createTextNode(ca.dung));
        g.appendChild(s);
        var k = el("p", "di-giai-kiem");
        k.appendChild(el("b", null, N.bl_kiem + ": "));
        k.appendChild(el("span", "di-nhan-so", String(HQ[ca.kiem].so)));
        k.appendChild(document.createTextNode(" " + HQ[ca.kiem].chu));
        g.appendChild(k);
        var tiep = el("button", "btn di-tiep", st.i + 1 < x.ca.length ? N.tiep + " →" : N.xong);
        tiep.type = "button";
        tiep.addEventListener("click", function () { st.i++; veChoi(); });
        g.appendChild(tiep);
        choi.appendChild(g);
      }
    }
    veChoi();

    var ng = nhom(N.bl_nguoi);
    var luoi = el("div", "di-o-luoi");
    st.nguoi.forEach(function (n, i) {
      luoi.appendChild(o(N.bl_nguoi + " " + (i + 1), n, "", function (v) { st.nguoi[i] = v; ve(); }));
    });
    ng.appendChild(luoi);
    trai.appendChild(ng);

    return function (a4) {
      a4.className = "a4 a4-bl";
      var dau = el("header", "a4-dau");
      dau.appendChild(el("h2", "a4-h", N.bl_to_h));
      dau.appendChild(el("p", "a4-phu", N.bl_to_phu));
      a4.appendChild(dau);
      var hq = el("ol", "a4-thoi-quen");
      hq.setAttribute("aria-label", N.bl_3_thoi_quen);
      x.thoi_quen.forEach(function (h) { hq.appendChild(el("li", null, h.chu)); });
      a4.appendChild(hq);
      var nguoi = st.nguoi.filter(function (n) { return n.trim(); });
      if (!nguoi.length) nguoi = [""];
      var bang = el("table", "a4-bang");
      var th = el("tr");
      N.bl_cot.forEach(function (c) { th.appendChild(el("th", null, c)); });
      nguoi.forEach(function (n) { th.appendChild(el("th", "a4-nguoi", n || "✓")); });
      var thead = el("thead");
      thead.appendChild(th);
      bang.appendChild(thead);
      var tb = el("tbody");
      function oKiem(chon) {
        var td = el("td", "a4-kiem");
        ["nguon", "sach", "thay"].forEach(function (k) {
          var s = el("span", k === chon ? "on" : "", N.bl_kiem_ngan[k]);
          td.appendChild(s);
        });
        return td;
      }
      var vd = x.ca[0];
      var tr = el("tr", "a4-vi-du");
      tr.appendChild(el("td", null, N.bl_vi_du));
      tr.appendChild(el("td", null, vd.hoi));
      tr.appendChild(el("td", null, vd.cau[vd.sai]));
      tr.appendChild(oKiem(vd.kiem));
      nguoi.forEach(function (n, i) { var td = el("td", "a4-tron"); td.appendChild(el("span", i === nguoi.length - 1 ? "on" : "")); tr.appendChild(td); });
      tb.appendChild(tr);
      for (var d = 1; d <= 7; d++) {
        tr = el("tr");
        tr.appendChild(el("td", "a4-so", String(d)));
        tr.appendChild(el("td"));
        tr.appendChild(el("td"));
        tr.appendChild(oKiem(null));
        nguoi.forEach(function () { var td = el("td", "a4-tron"); td.appendChild(el("span")); tr.appendChild(td); });
        tb.appendChild(tr);
      }
      bang.appendChild(tb);
      a4.appendChild(bang);
      a4.appendChild(el("p", "a4-toi-nay", N.bl_toi_nay));
      a4.appendChild(chanTo(x));
    };
  }

  // ---------- 143 · Luật dùng AI trong nhà ----------
  function ln(x, trai, ve) {
    var homNay = new Date();
    var hen = new Date(homNay.getFullYear(), homNay.getMonth() + 1, homNay.getDate());
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var st = S.ln || (S.ln = {
      nha: "", chon: x.luat.filter(function (l) { return l.goc; }).map(function (l) { return l.id; }),
      rieng: "", nguoi: "", hen: hen.getFullYear() + "-" + pad(hen.getMonth() + 1) + "-" + pad(hen.getDate()), mau: "xanh"
    });
    var TOI_DA = 6;
    function soLuat() { return st.chon.length + (st.rieng.trim() ? 1 : 0); }
    trai.appendChild(o(N.ln_ten_nha, st.nha, N.ln_ten_goi_y, function (v) { st.nha = v; ve(); }));

    var chonH = nhom(N.ln_chon);
    var dem = el("span", "di-dem");
    chonH.querySelector("legend").appendChild(dem);
    var bao = el("p", "di-bao is-chua");
    bao.setAttribute("role", "status");
    var nut = [];
    function capNhat() {
      dem.textContent = soLuat() + "/" + TOI_DA;
      bao.textContent = soLuat() >= TOI_DA ? N.ln_du : "";
      nut.forEach(function (b) {
        var on = st.chon.indexOf(b.dataset.id) >= 0;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.disabled = !on && soLuat() >= TOI_DA;
      });
    }
    [[N.ln_4_goc, true], [N.ln_them, false]].forEach(function (g) {
      chonH.appendChild(el("p", "di-nhom-phu", g[0]));
      var luoi = el("div", "di-luat-luoi");
      x.luat.filter(function (l) { return !!l.goc === g[1]; }).forEach(function (l) {
        var b = el("button", "di-luat");
        b.type = "button";
        b.dataset.id = l.id;
        b.appendChild(icon(l.icon));
        b.appendChild(el("span", null, l.chu));
        b.addEventListener("click", function () {
          var i = st.chon.indexOf(l.id);
          if (i >= 0) st.chon.splice(i, 1);
          else if (soLuat() < TOI_DA) st.chon.push(l.id);
          capNhat(); ve();
        });
        nut.push(b);
        luoi.appendChild(b);
      });
      chonH.appendChild(luoi);
    });
    chonH.appendChild(o(N.ln_rieng, st.rieng, N.ln_rieng_goi_y, function (v) {
      st.rieng = v;
      if (soLuat() > TOI_DA) st.chon.pop();
      capNhat(); ve();
    }));
    chonH.appendChild(bao);
    trai.appendChild(chonH);
    capNhat();

    var them = nhom(N.ln_ky);
    them.appendChild(o(N.ln_nguoi, st.nguoi, N.ln_nguoi_goi_y, function (v) { st.nguoi = v; ve(); }));
    them.appendChild(o(N.ln_xem_lai, st.hen, "", function (v) { st.hen = v; ve(); }, "date"));
    them.appendChild(chips(N.ln_mau, N.ln_mau_ds, st.mau, function (v) { st.mau = v; ve(); }));
    trai.appendChild(them);

    return function (a4) {
      a4.className = "a4 a4-ln mau-" + st.mau;
      var dau = el("header", "a4-dau a4-dai");
      dau.appendChild(icon("shield-check", "a4-khien"));
      var h = el("h2", "a4-h");
      var nha = st.nha.trim();
      // "Mai" thành "nhà Mai" (bản Việt), người xem gõ sẵn "nhà Mai" thì giữ nguyên
      if (nha && VI && !/^nhà\s/i.test(nha)) nha = "nhà " + nha;
      if (nha) { h.appendChild(document.createTextNode(N.ln_to_h + " ")); h.appendChild(el("span", null, nha)); }
      else h.textContent = N.ln_to_h_trong;
      dau.appendChild(h);
      a4.appendChild(dau);
      var ol = el("ol", "a4-luat");
      x.luat.filter(function (l) { return st.chon.indexOf(l.id) >= 0; })
        .sort(function (a, b) { return x.luat.indexOf(a) - x.luat.indexOf(b); })
        .forEach(function (l) {
          var li = el("li");
          li.appendChild(icon(l.icon));
          li.appendChild(el("span", null, l.chu));
          ol.appendChild(li);
        });
      if (st.rieng.trim()) {
        var li = el("li");
        li.appendChild(icon("star"));
        li.appendChild(el("span", null, st.rieng.trim()));
        ol.appendChild(li);
      }
      a4.appendChild(ol);
      var ky = el("div", "a4-ky");
      ky.appendChild(el("p", "a4-ky-h", N.ln_ky));
      var ten = st.nguoi.split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
      var hang = el("div", "a4-ky-hang");
      (ten.length ? ten : ["", "", "", ""]).forEach(function (n) {
        var o_ = el("div", "a4-ky-o");
        o_.appendChild(el("span", "a4-ky-cho"));
        o_.appendChild(el("b", null, n || " "));
        hang.appendChild(o_);
      });
      ky.appendChild(hang);
      a4.appendChild(ky);
      var hen_ = el("p", "a4-hen");
      hen_.appendChild(icon("circle-check-big"));
      hen_.appendChild(document.createTextNode(N.ln_hen + " "));
      hen_.appendChild(el("b", null, ngayVN(st.hen)));
      a4.appendChild(hen_);
      var anh = el("img", "a4-mascot");
      anh.src = D.p + "assets/mark-va-bit.svg";
      anh.alt = "";
      a4.appendChild(anh);
      a4.appendChild(chanTo(x));
    };
  }

  // ---------- 422 · Sổ tay chữ to cho ông bà ----------
  function st_(x, trai, ve) {
    var st = S.st || (S.st = { cho: "", o: {}, chon: x.viec.filter(function (v) { return v.bat; }).map(function (v) { return v.id; }), co: 20 });
    trai.appendChild(o(N.st_cho_ai, st.cho, N.st_cho_ai_goi_y, function (v) { st.cho = v; ve(); }));
    var dien = nhom(N.st_dien);
    var luoi = el("div", "di-o-luoi");
    x.o.forEach(function (f) {
      luoi.appendChild(o(f.chu, st.o[f.id], f.goi_y, function (v) { st.o[f.id] = v; ve(); }, f.id === "so" ? "tel" : "text"));
    });
    dien.appendChild(luoi);
    trai.appendChild(dien);

    var viec = nhom(N.st_viec);
    var ds = el("div", "di-viec-ds");
    x.viec.forEach(function (v) {
      var b = el("button", "di-viec");
      b.type = "button";
      b.setAttribute("aria-pressed", st.chon.indexOf(v.id) >= 0 ? "true" : "false");
      b.appendChild(el("span", "di-viec-dau"));
      b.appendChild(el("b", null, v.chu));
      b.appendChild(el("small", null, v.buoc.length + " " + N.st_buoc));
      b.addEventListener("click", function () {
        var i = st.chon.indexOf(v.id);
        if (i >= 0) st.chon.splice(i, 1); else st.chon.push(v.id);
        b.setAttribute("aria-pressed", i >= 0 ? "false" : "true");
        ve();
      });
      ds.appendChild(b);
    });
    viec.appendChild(ds);
    trai.appendChild(viec);

    var coH = nhom(N.st_co);
    coH.appendChild(chips(N.st_co, [[16, "16"], [20, "20"], [24, "24"]], st.co, function (v) { st.co = v; ve(); }));
    coH.appendChild(el("p", "di-ghi", N.st_co_ghi));
    var so = el("div", "di-so-hang");
    coH.appendChild(so);
    var bao = el("p", "di-bao");
    bao.setAttribute("role", "status");
    coH.appendChild(bao);
    trai.appendChild(coH);

    function dien_(chu) {
      return chu.replace(/\{(\w+)\}/g, function (_, k) { return trong(st.o[k]); });
    }
    function cacViec() {
      return x.viec.filter(function (v) { return st.chon.indexOf(v.id) >= 0; });
    }
    // Ước số dòng giống video 422: cỡ 20 vừa khoảng 25 dòng một trang A4 (cỡ 12 vừa 42), mỗi dòng khoảng 1013/cỡ chữ ký tự
    function uocDong() {
      var cpl = Math.floor(1013 / st.co);
      var dong = function (s) { return Math.max(1, Math.ceil(s.length / cpl)); };
      var n = 2;
      cacViec().forEach(function (v) {
        n += 1.3;
        v.buoc.forEach(function (b) { n += dong(dien_(b) + "    "); });
      });
      n += 1.5;
      x.khong.forEach(function (k) { n += dong(k + "  "); });
      n += 1.5;
      return { dong: Math.round(n), vua: Math.round(500 / st.co) };
    }

    return function (a4) {
      a4.className = "a4 a4-st";
      a4.style.setProperty("--co", st.co + "pt");
      var u = uocDong();
      so.innerHTML = "";
      so.appendChild(oSo(N.st_dong, String(u.dong), u.dong > u.vua ? "cam" : "xanh"));
      so.appendChild(oSo(N.st_vua, String(u.vua)));
      bao.textContent = u.dong > u.vua ? N.st_qua : N.st_vua_1;
      bao.className = "di-bao " + (u.dong > u.vua ? "is-chua" : "is-dung");
      var h = el("h2", "a4-h");
      h.textContent = N.st_to_h + " " + (st.cho.trim() ? st.cho.trim().toUpperCase() : N.st_to_h_trong);
      a4.appendChild(h);
      cacViec().forEach(function (v, i) {
        var sec = el("div", "a4-viec");
        sec.appendChild(el("h3", null, (i + 1) + ". " + v.chu));
        var ol = el("ol");
        v.buoc.forEach(function (b) {
          var li = el("li");
          // phần điền từ ô (tên app, số điện thoại...) in đậm để ông bà dễ dò
          b.split(/(\{\w+\})/).forEach(function (m) {
            var k = /^\{(\w+)\}$/.exec(m);
            if (k) li.appendChild(el("b", null, trong(st.o[k[1]])));
            else if (m) li.appendChild(document.createTextNode(m));
          });
          ol.appendChild(li);
        });
        sec.appendChild(ol);
        a4.appendChild(sec);
      });
      var kh = el("div", "a4-khong");
      kh.appendChild(el("h3", null, N.st_khong));
      var ul = el("ul");
      x.khong.forEach(function (k) { ul.appendChild(el("li", null, k)); });
      kh.appendChild(ul);
      a4.appendChild(kh);
      var goi = el("p", "a4-goi");
      goi.appendChild(document.createTextNode(N.st_goi + ": "));
      goi.appendChild(el("b", null, st.o.so && st.o.so.trim() ? st.o.so.trim() : "________________"));
      a4.appendChild(goi);
      a4.appendChild(chanTo(x));
    };
  }

  // ---------- 430 · Bài Toán sai ở bước nào ----------
  function bs(x, trai, ve) {
    var st = S.bs || (S.bs = { i: 0, cham: 0, tim: [], sua: [], ten: "", dien: true });
    var choi = el("div", "di-choi");
    trai.appendChild(choi);
    function veChoi() {
      choi.innerHTML = "";
      choi.appendChild(chamTien(st.tim.length, x.bai.length));
      if (st.i >= x.bai.length) {
        var ket = el("div", "di-ket");
        ket.appendChild(el("p", "di-ket-h", N.xong));
        var so = el("div", "di-so-hang");
        so.appendChild(oSo(N.da_bat, st.tim.length + "/" + x.bai.length, "xanh"));
        so.appendChild(oSo(N.lan_cham, String(st.cham)));
        ket.appendChild(so);
        var lai = el("button", "btn btn-nhe di-lai", N.lam_lai);
        lai.type = "button";
        lai.addEventListener("click", function () { st.i = 0; st.cham = 0; st.tim = []; st.sua = []; veChoi(); ve(); });
        ket.appendChild(lai);
        choi.appendChild(ket);
        return;
      }
      var b = x.bai[st.i];
      var tim = st.tim.indexOf(st.i) >= 0;
      var de = el("div", "di-de");
      de.appendChild(el("small", null, N.bs_de + " · " + b.dang));
      de.appendChild(el("p", "di-toan", b.de));
      choi.appendChild(de);
      var vo = el("div", "di-vo");
      vo.appendChild(el("small", null, N.bs_bai_vy));
      var tb = el("p", "di-bao", tim ? "" : N.bs_huong);
      tb.setAttribute("role", "status");
      b.buoc.forEach(function (c, j) {
        var n = el("button", "di-buoc");
        n.type = "button";
        n.appendChild(el("span", "di-buoc-so", N.bs_buoc + " " + (j + 1)));
        n.appendChild(el("span", "di-toan", c));
        if (tim) { n.disabled = true; if (j === b.sai) n.classList.add("is-sai"); else if (j < b.sai) n.classList.add("is-dung"); else n.classList.add("is-theo"); }
        n.addEventListener("click", function () {
          st.cham++;
          if (j === b.sai) {
            st.tim.push(st.i);
            if (st.tim.length === x.bai.length) do_("do-in-xong", { to: "bai-sai", cham: st.cham });
            veChoi(); ve();
          } else {
            n.classList.add(j < b.sai ? "is-dung" : "is-theo");
            tb.textContent = j < b.sai ? N.bs_dung_roi : N.bs_sai_theo;
            tb.className = "di-bao is-chua";
          }
        });
        vo.appendChild(n);
      });
      choi.appendChild(vo);
      choi.appendChild(tb);
      if (tim) {
        var g = el("div", "di-giai");
        var bit = el("div", "di-goi-y");
        var anh = el("img");
        anh.src = D.p + "assets/bit-giai-thich.svg"; anh.alt = ""; anh.width = 56; anh.height = 56;
        bit.appendChild(anh);
        var bong = el("p");
        bong.appendChild(el("small", null, N.bs_goi_y));
        bong.appendChild(el("span", "di-toan", b.goi_y));
        bit.appendChild(bong);
        g.appendChild(bit);
        var daSua = st.sua.indexOf(st.i) >= 0;
        if (!daSua) {
          var xem = el("button", "btn btn-nhe", N.bs_xem_sua);
          xem.type = "button";
          xem.addEventListener("click", function () { st.sua.push(st.i); veChoi(); });
          g.appendChild(xem);
        } else {
          var sua = el("div", "di-sua");
          sua.appendChild(el("small", null, N.bs_sua));
          b.sua.forEach(function (s) { sua.appendChild(el("p", "di-toan", s)); });
          g.appendChild(sua);
          var nho = el("p", "di-giai-kiem");
          nho.appendChild(el("b", null, N.bs_nho + ": "));
          nho.appendChild(document.createTextNode(b.nho));
          g.appendChild(nho);
          var tiep = el("button", "btn di-tiep", st.i + 1 < x.bai.length ? N.tiep + " →" : N.xong);
          tiep.type = "button";
          tiep.addEventListener("click", function () { st.i++; veChoi(); });
          g.appendChild(tiep);
        }
        choi.appendChild(g);
      }
    }
    veChoi();

    var pr = el("div", "di-prompt");
    pr.appendChild(el("p", "di-nhom-h", N.bs_prompt_h));
    pr.appendChild(el("p", "di-prompt-chu", x.prompt));
    pr.appendChild(el("p", "di-ghi", N.bs_prompt_meo));
    var chep = el("button", "btn", N.chep);
    chep.type = "button";
    chep.addEventListener("click", function () {
      var xong = function () { chep.textContent = N.da_chep; setTimeout(function () { chep.textContent = N.chep; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(x.prompt).then(xong, function () {}); else xong();
      do_("do-in-chep", { to: "bai-sai" });
    });
    pr.appendChild(chep);
    trai.appendChild(pr);

    var tuy = nhom(N.to_in);
    tuy.appendChild(o(N.bs_ten, st.ten, N.bs_ten_goi_y, function (v) { st.ten = v; ve(); }));
    var hop = el("label", "di-hop");
    var cb = el("input");
    cb.type = "checkbox"; cb.checked = st.dien;
    cb.addEventListener("change", function () { st.dien = cb.checked; ve(); });
    hop.appendChild(cb);
    hop.appendChild(el("span", null, N.bs_dien_san));
    tuy.appendChild(hop);
    trai.appendChild(tuy);

    return function (a4) {
      a4.className = "a4 a4-bs";
      var dau = el("header", "a4-dau");
      var h = el("h2", "a4-h", N.bs_to_h);
      if (st.ten.trim()) { h.appendChild(document.createTextNode(" · ")); h.appendChild(el("span", null, st.ten.trim())); }
      dau.appendChild(h);
      a4.appendChild(dau);
      var p = el("div", "a4-prompt");
      p.appendChild(el("b", null, N.bs_prompt_h));
      p.appendChild(el("p", null, x.prompt));
      a4.appendChild(p);
      var bang = el("table", "a4-bang");
      var thead = el("thead");
      var th = el("tr");
      N.bs_cot.forEach(function (c) { th.appendChild(el("th", null, c)); });
      thead.appendChild(th);
      bang.appendChild(thead);
      var tb = el("tbody");
      var co = st.dien ? x.bai.filter(function (_, i) { return st.tim.indexOf(i) >= 0; }) : [];
      co.forEach(function (b) {
        var tr = el("tr");
        tr.appendChild(el("td"));
        tr.appendChild(el("td", null, b.dang));
        tr.appendChild(el("td", "a4-toan", N.bs_buoc + " " + (b.sai + 1) + ": " + b.buoc[b.sai]));
        tr.appendChild(el("td", null, b.nho));
        tr.appendChild(el("td", "a4-lam-lai", "☐ ☐"));
        tb.appendChild(tr);
      });
      for (var d = co.length; d < 14; d++) {
        var tr = el("tr");
        for (var c = 0; c < 4; c++) tr.appendChild(el("td"));
        tr.appendChild(el("td", "a4-lam-lai", "☐ ☐"));
        tb.appendChild(tr);
      }
      bang.appendChild(tb);
      a4.appendChild(bang);
      a4.appendChild(el("p", "a4-toi-nay", N.bs_luat));
      a4.appendChild(chanTo(x));
    };
  }

  var LAM = { "bat-loi": bl, "luat-nha": ln, "so-tay": st_, "bai-sai": bs };

  // ---------- khung một tờ: tiêu đề, cột chơi bên trái, tờ in bên phải ----------
  var veTo = null, giay = null, a4 = null;
  function coGian() {
    if (!giay || !a4) return;
    var w = giay.clientWidth;
    a4.style.zoom = Math.min(1, w / 794).toFixed(4);
  }
  function inTo() {
    var html = document.documentElement;
    html.classList.add("di-dang-in");
    a4.style.zoom = "";
    function bo() { html.classList.remove("di-dang-in"); window.removeEventListener("afterprint", bo); coGian(); }
    window.addEventListener("afterprint", bo);
    do_("do-in-in", { to: S.tab });
    window.print();
    setTimeout(bo, 1500);
  }
  function veTab(id) {
    var x = TO[id];
    khu.innerHTML = "";
    khu.setAttribute("aria-labelledby", "di-tab-" + id);
    var dau = el("div", "di-dau");
    var tieu = el("div");
    tieu.appendChild(el("h2", "di-ten", x.ten));
    tieu.appendChild(el("p", "di-mo", x.mo));
    dau.appendChild(tieu);
    var vids = el("div", "di-video");
    x.video.forEach(function (v) {
      var a = el(v.url ? "a" : "span", "di-vid" + (v.url ? "" : " sap"));
      a.appendChild(icon("play"));
      a.appendChild(document.createTextNode((v.url ? N.xem_video : N.sap_ra) + " #" + v.so));
      if (v.url) { a.href = v.url; a.title = v.ten; if (NHUNG) a.target = "_top"; }
      vids.appendChild(a);
    });
    dau.appendChild(vids);
    khu.appendChild(dau);

    var luoi = el("div", "di-luoi");
    var trai = el("div", "di-lam");
    var phai = el("div", "di-to-wrap");
    var dauTo = el("div", "di-to-dau");
    var h = el("p", "di-to-h");
    h.appendChild(icon("file-text"));
    h.appendChild(document.createTextNode(N.to_in));
    dauTo.appendChild(h);
    var nut = el("button", "btn di-in");
    nut.type = "button";
    nut.appendChild(icon("download"));
    nut.appendChild(document.createTextNode(N.in));
    nut.addEventListener("click", inTo);
    dauTo.appendChild(nut);
    phai.appendChild(dauTo);
    giay = el("div", "di-giay");
    a4 = el("article", "a4");
    a4.id = "di-to";
    giay.appendChild(a4);
    phai.appendChild(giay);
    phai.appendChild(el("p", "di-ghi", N.in_meo));
    luoi.appendChild(trai);
    luoi.appendChild(phai);
    khu.appendChild(luoi);

    var dung = null;
    function ve() {
      if (!dung) return;
      a4.innerHTML = "";
      a4.removeAttribute("style");
      dung(a4);
      coGian();
    }
    dung = LAM[id](x, trai, ve);
    veTo = ve;
    ve();
  }
  window.addEventListener("resize", coGian);

  function doiTab(id, dau) {
    if (!TO[id]) id = D.to[0].id;
    S.tab = id;
    document.querySelectorAll(".di-tab").forEach(function (b) {
      var on = b.dataset.tab === id;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (on && !dau && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    veTab(id);
    try {
      var u = new URL(location.href);
      u.searchParams.set("to", id);
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
    do_("do-in-mo", { to: id });
  }
  document.querySelectorAll(".di-tab").forEach(function (b) { b.addEventListener("click", function () { doiTab(b.dataset.tab); }); });
  var hang = document.querySelector(".di-tabs");
  if (hang) hang.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var ds = Array.prototype.slice.call(document.querySelectorAll(".di-tab"));
    var i = ds.findIndex(function (b) { return b.dataset.tab === S.tab; });
    var j = (i + (e.key === "ArrowRight" ? 1 : ds.length - 1)) % ds.length;
    doiTab(ds[j].dataset.tab); ds[j].focus(); e.preventDefault();
  });
  var dauVao = /[?&]to=([a-z-]+)/.exec(location.search);
  doiTab(dauVao ? dauVao[1] : D.to[0].id, true);
})();

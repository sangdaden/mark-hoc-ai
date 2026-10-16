/* Mô phỏng "Tự dạy máy lọc hồ sơ" (bo-loc-thien-vi.html, en/), video 118 "AI cũng thiên vị".
   Người chơi đưa 20 hồ sơ năm ngoái (đa số nam được tuyển) cho máy học, thấy máy loại người giỏi,
   rồi thử sửa: giấu ô giới tính, xóa chữ lộ giới tính, thêm dữ liệu tuyển công bằng.
   Máy là hồi quy logistic nhỏ học thật ngay trên trình duyệt (vài mili giây), không gọi AI, không lưu gì.
   Dữ liệu: thẻ <script id="tv-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/bo-loc-thien-vi.json.
   Chạy thử: ?do=thu, trạng thái ở window.__tv. */
(function () {
  "use strict";
  var nguon = document.getElementById("tv-du-lieu");
  var san = document.getElementById("tv-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, HD = D.hoat_dong, SO_MOI = D.so_moi;
  var ket = document.getElementById("tv-ket");

  function hs(a) { return { ten: a[0], gioi: a[1], kn: a[2], exp: a[3], hd: a[4], nu: !!HD[a[4]].nu, t: a[5] }; }
  var CU = D.ho_so_cu.map(hs), MOI = D.ho_so_moi.map(hs);
  var THEM = D.them.map(function (a) { return { gioi: a[0], kn: a[1], exp: a[2], nu: !!a[3], t: a[4] }; });
  // Bốn thứ máy được nhìn thấy trong hồ sơ
  var DAC = [
    { k: "kn", f: function (r) { return r.kn / 10; } },
    { k: "exp", f: function (r) { return r.exp / 8; } },
    { k: "nam", f: function (r) { return r.gioi === "nam" ? 1 : 0; } },
    { k: "nu", f: function (r) { return r.nu ? 1 : 0; } }
  ];
  // "Người giỏi nhất" theo năng lực thật: kỹ năng rồi kinh nghiệm
  var GIOI = {};
  MOI.slice().sort(function (a, b) { return b.kn - a.kn || b.exp - a.exp; }).slice(0, SO_MOI).forEach(function (r) { GIOI[r.ten] = 1; });

  var S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function sig(z) { return 1 / (1 + Math.exp(-z)); }

  // Hồi quy logistic: học trọng số cho các đặc điểm máy được thấy (giấu = không đưa vào)
  function hoc(rows, giau) {
    var dac = DAC.filter(function (d) { return !giau[d.k]; });
    var w = dac.map(function () { return 0; }), b = 0, n = rows.length, i, j, k;
    var X = rows.map(function (r) { return dac.map(function (d) { return d.f(r); }); });
    for (k = 0; k < 3000; k++) {
      var gw = w.map(function () { return 0; }), gb = 0;
      for (i = 0; i < n; i++) {
        var z = b;
        for (j = 0; j < w.length; j++) z += X[i][j] * w[j];
        var e = sig(z) - rows[i].t;
        for (j = 0; j < w.length; j++) gw[j] += e * X[i][j];
        gb += e;
      }
      for (j = 0; j < w.length; j++) w[j] -= 0.8 * (gw[j] / n + 0.01 * w[j]);
      b -= 0.8 * gb / n;
    }
    var m = { b: b, w: {}, dac: dac };
    dac.forEach(function (d, i) { m.w[d.k] = w[i]; });
    return m;
  }
  function phan(m, r) {
    return m.dac.map(function (d) { return { k: d.k, v: m.w[d.k] * d.f(r) }; });
  }
  function cham(m, r) {
    return sig(phan(m, r).reduce(function (s, x) { return s + x.v; }, m.b));
  }
  function loc(m) {
    var ds = MOI.map(function (r) { return { r: r, d: cham(m, r) }; }).sort(function (a, b) { return b.d - a.d; });
    var moi = ds.slice(0, SO_MOI), loai = ds.slice(SO_MOI);
    return {
      moi: moi, loai: loai,
      nu: moi.filter(function (x) { return x.r.gioi === "nu"; }).length,
      tong_nu: MOI.filter(function (r) { return r.gioi === "nu"; }).length,
      sot: loai.filter(function (x) { return GIOI[x.r.ten]; }).length
    };
  }

  function o(so, nhan, lop) {
    var t = el("div", "tv-o" + (lop ? " " + lop : ""));
    t.appendChild(el("b", null, so));
    t.appendChild(el("span", null, nhan));
    return t;
  }
  function dau(so, ten, lead) {
    var h = el("div", "tv-dau");
    h.appendChild(el("span", "tv-so", so));
    var c = el("div");
    c.appendChild(el("h2", null, ten));
    if (lead) c.appendChild(el("p", "tv-lead", lead));
    h.appendChild(c);
    return h;
  }

  function theHs(r, opt) {
    opt = opt || {};
    var a = el(opt.nut ? "button" : "div", "tv-hs tv-" + r.gioi);
    if (opt.nut) a.type = "button";
    var dau_ = el("div", "tv-hs-dau");
    var av = el("span", "tv-av", r.ten.split(" ").pop().charAt(0));
    av.setAttribute("aria-hidden", "true");
    dau_.appendChild(av);
    var ten = el("div", "tv-hs-ten");
    ten.appendChild(el("b", null, r.ten));
    ten.appendChild(el("span", "tv-gioi" + (S && S.giau.nam ? " is-xoa" : ""), r.gioi === "nam" ? N.nam : N.nu));
    dau_.appendChild(ten);
    if (opt.diem != null) dau_.appendChild(el("span", "tv-diem", Math.round(opt.diem * 100) + "%"));
    a.appendChild(dau_);
    var kn = el("div", "tv-kn");
    kn.appendChild(el("span", null, N.ky_nang));
    var vach = el("span", "tv-vach");
    var day = el("i");
    day.style.width = r.kn * 10 + "%";
    vach.appendChild(day);
    kn.appendChild(vach);
    kn.appendChild(el("b", null, r.kn + "/10"));
    a.appendChild(kn);
    a.appendChild(el("p", "tv-exp", r.exp + " " + N.nam_kn));
    var hd = el("p", "tv-hd" + (r.nu && S && S.giau.nu ? " is-xoa" : ""), HD[r.hd].chu);
    a.appendChild(hd);
    if (opt.dau) a.appendChild(el("span", "tv-dau-moc " + (r.t ? "is-tuyen" : "is-loai"), r.t ? "✓ " + N.da_tuyen : "✗ " + N.khong_tuyen));
    if (opt.gioi && GIOI[r.ten]) a.appendChild(el("span", "tv-sao", "★ " + N.gioi));
    return a;
  }

  // Thanh trọng số hai chiều: phải là cộng điểm, trái là trừ điểm
  function veTrongSo(m) {
    var hop = el("div", "tv-ts");
    var max = 0.5;
    DAC.forEach(function (d) { if (m.w[d.k] != null) max = Math.max(max, Math.abs(m.w[d.k])); });
    DAC.forEach(function (d) {
      var giau = m.w[d.k] == null;
      var h = el("div", "tv-ts-h" + (giau ? " is-giau" : ""));
      h.appendChild(el("span", "tv-ts-ten", N.dac[d.k]));
      var truc = el("span", "tv-ts-truc");
      if (!giau) {
        var v = m.w[d.k], day = el("i", v >= 0 ? "is-cong" : "is-tru");
        day.style.width = Math.abs(v) / max * 50 + "%";
        truc.appendChild(day);
      }
      h.appendChild(truc);
      h.appendChild(el("b", "tv-ts-so", giau ? N.da_giau : (m.w[d.k] >= 0 ? "+" : "−") + Math.abs(m.w[d.k] * 10).toFixed(0)));
      hop.appendChild(h);
    });
    var chu = el("p", "tv-ts-chu", N.ts_chu);
    hop.appendChild(chu);
    return hop;
  }

  function lyDo(m, r) {
    var ul = el("ul", "tv-ly-do");
    phan(m, r).filter(function (x) { return Math.abs(x.v) >= 0.05; }).forEach(function (x) {
      var li = el("li", x.v >= 0 ? "is-cong" : "is-tru");
      li.appendChild(el("span", null, N.dac[x.k]));
      li.appendChild(el("b", null, (x.v >= 0 ? "+" : "−") + Math.abs(x.v * 10).toFixed(0)));
      ul.appendChild(li);
    });
    return ul;
  }

  function veLoc(m, kq) {
    var hop = el("div", "tv-loc");
    var tiles = el("div", "tv-tiles");
    tiles.appendChild(o(kq.nu + "/" + kq.tong_nu, N.nu_duoc_moi, kq.nu === 0 ? "is-xau" : (kq.nu >= 2 ? "is-tot" : "")));
    tiles.appendChild(o(String(kq.sot), N.gioi_bi_loai, kq.sot ? "is-xau" : "is-tot"));
    hop.appendChild(tiles);
    var cot = el("div", "tv-cot");
    [["moi", N.moi_pv, kq.moi], ["loai", N.bi_loai, kq.loai]].forEach(function (x) {
      var c = el("div", "tv-cot-o tv-cot-" + x[0]);
      c.appendChild(el("p", "tv-cot-h", x[1] + " (" + x[2].length + ")"));
      var ds = el("div", "tv-cot-ds");
      x[2].forEach(function (y) {
        var the = theHs(y.r, { nut: true, diem: y.d, gioi: true });
        the.setAttribute("aria-expanded", "false");
        the.addEventListener("click", function () {
          var mo = the.getAttribute("aria-expanded") !== "true";
          the.setAttribute("aria-expanded", mo ? "true" : "false");
          var cu = the.querySelector(".tv-vi-sao");
          if (cu) cu.remove();
          if (mo) {
            var v = el("div", "tv-vi-sao");
            v.appendChild(el("p", null, N.vi_sao));
            v.appendChild(lyDo(m, y.r));
            the.appendChild(v);
            do_("thien-vi-vi-sao", { ten: y.r.gioi });
          }
        });
        ds.appendChild(the);
      });
      c.appendChild(ds);
      cot.appendChild(c);
    });
    hop.appendChild(cot);
    hop.appendChild(el("p", "tv-goi-y", N.cham_the));
    return hop;
  }

  function batDau() {
    S = { buoc: 1, giau: {}, them: false, doan: null, sua: {}, xong: false };
    window.__tv = S;
    ket.hidden = true;
    san.hidden = false;
    san.innerHTML = "";
    veBuoc1();
  }

  function veBuoc1() {
    var p = el("section", "tv-phan");
    p.appendChild(dau("1", N.b1, N.b1_lead));
    var nam = CU.filter(function (r) { return r.gioi === "nam"; }), nu = CU.filter(function (r) { return r.gioi === "nu"; });
    var tiles = el("div", "tv-tiles");
    tiles.appendChild(o(nam.filter(function (r) { return r.t; }).length + "/" + nam.length, N.nam_tuyen));
    tiles.appendChild(o(nu.filter(function (r) { return r.t; }).length + "/" + nu.length, N.nu_tuyen, "is-xau"));
    p.appendChild(tiles);
    var luoi = el("div", "tv-luoi");
    CU.forEach(function (r) { luoi.appendChild(theHs(r, { dau: true })); });
    p.appendChild(luoi);
    var nut = el("div", "cta");
    var b = el("button", "btn btn-yt tv-nut", N.day_may);
    b.type = "button";
    b.addEventListener("click", function () {
      b.disabled = true;
      do_("thien-vi-bat-dau");
      veBuoc2();
    });
    nut.appendChild(b);
    p.appendChild(nut);
    san.appendChild(p);
  }

  function veBuoc2() {
    S.buoc = 2;
    var m = hoc(CU, {});
    var kq = loc(m);
    S.kq_goc = { nu: kq.nu, sot: kq.sot };
    var p = el("section", "tv-phan tv-vao");
    p.appendChild(dau("2", N.b2, N.b2_lead));
    p.appendChild(veTrongSo(m));
    p.appendChild(el("h3", "tv-h3", N.moi_nop));
    p.appendChild(veLoc(m, kq));
    var bit = el("div", "tv-bit");
    var anh = el("img");
    anh.src = D.p + "assets/bit-sai-roi.svg"; anh.alt = ""; anh.width = 72; anh.height = 72;
    bit.appendChild(anh);
    bit.appendChild(el("p", null, N.b2_bit));
    p.appendChild(bit);
    var nut = el("div", "cta");
    var b = el("button", "btn btn-yt tv-nut", N.sua_may + " ›");
    b.type = "button";
    b.addEventListener("click", function () { b.disabled = true; veBuoc3(); });
    nut.appendChild(b);
    p.appendChild(nut);
    san.appendChild(p);
    p.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function veBuoc3() {
    S.buoc = 3;
    var p = el("section", "tv-phan tv-vao");
    p.appendChild(dau("3", N.b3, N.b3_lead));
    // Đoán trước: giấu ô giới tính có hết thiên vị không?
    var hoi = el("div", "tv-hoi");
    hoi.appendChild(el("p", "tv-hoi-h", N.hoi));
    var chon = el("div", "tv-hoi-chon");
    var tl = el("p", "tv-hoi-tl");
    tl.hidden = true;
    [["het", N.hoi_het], ["chua", N.hoi_chua]].forEach(function (x) {
      var b = el("button", "btn", x[1]);
      b.type = "button";
      b.addEventListener("click", function () {
        if (S.doan) return;
        S.doan = x[0];
        chon.querySelectorAll("button").forEach(function (y) { y.disabled = true; });
        b.classList.add(x[0] === "chua" ? "is-dung" : "is-sai");
        tl.textContent = (x[0] === "chua" ? N.hoi_dung : N.hoi_sai) + " " + N.hoi_giai;
        tl.hidden = false;
        do_("thien-vi-doan", { chon: x[0] });
        moSua();
      });
      chon.appendChild(b);
    });
    hoi.appendChild(chon);
    hoi.appendChild(tl);
    p.appendChild(hoi);
    var sua = el("div", "tv-sua");
    sua.hidden = true;
    p.appendChild(sua);
    san.appendChild(p);
    p.scrollIntoView({ behavior: "smooth", block: "start" });

    function moSua() {
      sua.hidden = false;
      var cong = el("div", "tv-cong");
      [["an", N.cong_an, N.cong_an_phu], ["xoa", N.cong_xoa, N.cong_xoa_phu], ["them", N.cong_them, N.cong_them_phu]].forEach(function (x) {
        var b = el("button", "tv-cong-nut");
        b.type = "button";
        b.setAttribute("aria-pressed", "false");
        b.appendChild(el("span", "tv-cong-o", ""));
        var c = el("span");
        c.appendChild(el("b", null, x[1]));
        c.appendChild(el("small", null, x[2]));
        b.appendChild(c);
        b.addEventListener("click", function () {
          var bat = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", bat ? "true" : "false");
          if (x[0] === "an") S.giau.nam = bat;
          if (x[0] === "xoa") S.giau.nu = bat;
          if (x[0] === "them") S.them = bat;
          do_("thien-vi-sua", { cach: x[0], bat: bat ? "bat" : "tat" });
          veLai();
        });
        cong.appendChild(b);
      });
      sua.appendChild(cong);
      var kqo = el("div", "tv-kq");
      sua.appendChild(kqo);
      var xong = el("div", "tv-xong");
      xong.hidden = true;
      sua.appendChild(xong);

      function veLai() {
        var m = hoc(S.them ? CU.concat(THEM) : CU, S.giau);
        var kq = loc(m);
        S.kq = { nu: kq.nu, sot: kq.sot };
        kqo.innerHTML = "";
        kqo.appendChild(el("p", "tv-nx " + (kq.sot ? "is-xau" : "is-tot"), nhanXet(kq)));
        kqo.appendChild(veTrongSo(m));
        kqo.appendChild(veLoc(m, kq));
        if (!kq.sot) moXong();
        else xong.hidden = true;
      }
      function moXong() {
        xong.hidden = false;
        xong.innerHTML = "";
        var bit = el("div", "tv-bit is-tot");
        var anh = el("img");
        anh.src = D.p + "assets/bit-vui.svg"; anh.alt = ""; anh.width = 72; anh.height = 72;
        bit.appendChild(anh);
        var c = el("div");
        c.appendChild(el("b", null, N.b4));
        c.appendChild(el("p", null, N.b4_chu));
        bit.appendChild(c);
        xong.appendChild(bit);
        var nut = el("div", "cta");
        var b = el("button", "btn btn-yt tv-nut", N.xem_ket + " ›");
        b.type = "button";
        b.addEventListener("click", ketThuc);
        nut.appendChild(b);
        xong.appendChild(nut);
      }
      veLai();
    }
  }

  function nhanXet(kq) {
    if (!kq.sot) return N.nx_tot;
    if (S.giau.nam && !S.giau.nu && !S.them) return N.nx_an;
    if (S.giau.nu && !S.giau.nam) return N.nx_xoa;
    if (S.them) return N.nx_them;
    return N.nx_goc;
  }

  function ketThuc() {
    S.xong = true;
    san.hidden = true;
    ket.hidden = false;
    document.getElementById("tv-ket-so").textContent = S.kq_goc.sot + " → " + S.kq.sot;
    document.getElementById("tv-ket-phu").textContent = N.ket_phu.replace("{a}", S.kq_goc.nu).replace("{b}", S.kq.nu);
    ket.scrollIntoView({ behavior: "smooth", block: "start" });
    var dung = [S.giau.nam ? "an" : "", S.giau.nu ? "xoa" : "", S.them ? "them" : ""].filter(Boolean).join("+");
    do_("thien-vi-xong", { cach: dung, doan: S.doan || "" });
    do_("hoc-xong", { loai: "thien-vi" });
  }

  var xv = document.getElementById("tv-xem-video");
  if (xv) xv.addEventListener("click", function () { do_("thien-vi-xem-video", { so: "118" }); });
  document.getElementById("tv-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
  batDau();
})();

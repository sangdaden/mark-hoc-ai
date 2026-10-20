/* "Máy tính đời thật" (may-tinh-doi-that.html, en/): 7 máy tính theo video, mỗi máy một thẻ.
   Đổi số bên trái, kết quả (ô số, thanh, sơ đồ) bên phải tính lại ngay; bên dưới là công thức với chính con số đang nhập, và nguồn có link.
   Dữ liệu: thẻ <script id="mt-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/may-tinh.json. Mở thẳng một máy: ?may=<id>.
   Không gửi con số nào đi đâu, chỉ đếm vài sự kiện (theo-doi.js). Chạy thử: trạng thái ở window.__mt. */
(function () {
  "use strict";
  var nguon = document.getElementById("mt-du-lieu");
  var khu = document.getElementById("mt-khu");
  if (!nguon || !khu) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, VI = D.lg === "vi";
  var MAY = {};
  D.may.forEach(function (m) { MAY[m.id] = m; });
  var NHUNG = document.documentElement.classList.contains("nhung");
  // Trạng thái từng máy giữ khi đổi thẻ (giá thật mỗi mâm của "Mâm cưới" dùng lại ở "Xếp bàn")
  var S = { tab: null, so: {}, daDoi: {} };
  window.__mt = S;

  var soFmt = function (n, le) {
    return new Intl.NumberFormat(VI ? "vi-VN" : "en-US", { maximumFractionDigits: le == null ? 0 : le, minimumFractionDigits: 0 }).format(n);
  };
  var tien = function (n) { return soFmt(Math.round(n)) + (VI ? " đ" : " ₫"); };
  var phan = function (n, le) { return soFmt(n, le == null ? 1 : le) + "%"; };

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function daDoi(id) { if (!S.daDoi[id]) { S.daDoi[id] = true; do_("may-tinh-doi", { may: id }); } }

  // ---------- ô nhập ----------
  // Một hàng: nhãn + ô số (+ thanh kéo nếu có min/max); số tiền thì hiện thêm dạng 30.000.000 đ ngay dưới ô.
  function oNhap(st, khoa, nhan, opt, doi) {
    opt = opt || {};
    var hang = el("label", "mt-hang" + (opt.thanh === false ? "" : " co-thanh"));
    var dau = el("span", "mt-hang-dau");
    dau.appendChild(el("span", "mt-nhan", nhan));
    var o = el("input", "mt-o-so");
    o.type = "number"; o.inputMode = "decimal";
    o.min = opt.min != null ? opt.min : 0;
    if (opt.max != null && opt.thanh !== false) o.max = opt.max;
    o.step = opt.step || 1;
    o.value = st[khoa];
    dau.appendChild(o);
    hang.appendChild(dau);
    var keo = null, ra = null;
    if (opt.max != null && opt.thanh !== false) {
      keo = el("input", "mt-keo");
      keo.type = "range"; keo.min = o.min; keo.max = opt.max; keo.step = opt.step || 1; keo.value = st[khoa];
      keo.setAttribute("aria-label", nhan);
      hang.appendChild(keo);
    }
    if (opt.tien) { ra = el("span", "mt-ra", tien(st[khoa])); hang.appendChild(ra); }
    function dat(v, tu) {
      v = parseFloat(v);
      if (isNaN(v) || v < 0) v = 0;
      st[khoa] = v;
      if (tu !== o) o.value = v;
      if (keo && tu !== keo) keo.value = v;
      if (ra) ra.textContent = tien(v);
      doi();
    }
    o.addEventListener("input", function () { dat(o.value, o); });
    if (keo) keo.addEventListener("input", function () { dat(keo.value, keo); });
    return hang;
  }
  // Danh sách dòng (chi thiết yếu, khoản cố định, dòng giá vốn): mỗi dòng [khóa, số, ...]
  function dsDong(tieu, ds, doi, tienTe) {
    var hop = el("fieldset", "mt-ds");
    hop.appendChild(el("legend", "mt-ds-h", tieu));
    ds.forEach(function (d) {
      var obj = { v: d[1] };
      var h = oNhap(obj, "v", N.dong[d[0]] || d[0], { thanh: false, step: tienTe === false ? 1 : 1000, tien: tienTe !== false }, function () { d[1] = obj.v; doi(); });
      hop.appendChild(h);
    });
    return hop;
  }
  function chon(nhom, cacLua, giaTri, doi) {
    var hop = el("div", "mt-chon");
    hop.setAttribute("role", "radiogroup");
    hop.setAttribute("aria-label", nhom);
    hop.appendChild(el("span", "mt-nhan", nhom));
    var hang = el("span", "mt-chon-hang");
    cacLua.forEach(function (l) {
      var b = el("button", "mt-chip", l[1]);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", l[0] === giaTri ? "true" : "false");
      b.addEventListener("click", function () {
        hang.querySelectorAll(".mt-chip").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        doi(l[0]);
      });
      hang.appendChild(b);
    });
    hop.appendChild(hang);
    return hop;
  }

  // ---------- ô kết quả ----------
  function o(nhan, so, kieu, phu) {
    var t = el("div", "mt-ket-o" + (kieu ? " mt-" + kieu : ""));
    t.appendChild(el("span", "mt-ket-nhan", nhan));
    t.appendChild(el("b", "mt-ket-so", so));
    if (phu) t.appendChild(el("span", "mt-ket-phu", phu));
    return t;
  }
  function thanh(phanDoan, tong) {
    // phanDoan: [[nhãn, số, lớp màu]]; tong: mốc 100% (vd ngân sách). Vượt mốc thì thanh dài hơn khung, phần vượt tô đỏ.
    var hop = el("div", "mt-thanh-hop");
    var t = el("div", "mt-thanh");
    var ghi = el("div", "mt-chu-giai");
    var cong = phanDoan.reduce(function (a, x) { return a + Math.max(0, x[1]); }, 0);
    var moc = tong || cong || 1;
    phanDoan.forEach(function (x) {
      if (x[1] <= 0) return;
      var d = el("span", "mt-doan " + x[2]);
      d.style.width = Math.min(100, x[1] / moc * 100) + "%";
      t.appendChild(d);
      var g = el("span", "mt-chu-giai-o");
      g.appendChild(el("i", "mt-cham " + x[2]));
      g.appendChild(document.createTextNode(x[0] + (x[3] ? ": " + x[3] : "")));
      ghi.appendChild(g);
    });
    hop.appendChild(t);
    hop.appendChild(ghi);
    return hop;
  }
  function congThuc(dong) {
    var hop = el("div", "mt-ct");
    hop.appendChild(el("p", "mt-ct-h", N.cong_thuc));
    var ds = el("ol", "mt-ct-ds");
    dong.forEach(function (d) {
      var li = el("li");
      li.appendChild(el("span", "mt-ct-ten", d[0]));
      li.appendChild(el("code", "mt-ct-phep", d[1]));
      ds.appendChild(li);
    });
    hop.appendChild(ds);
    return hop;
  }

  // ---------- từng máy ----------
  var MAY_TINH = {};

  MAY_TINH["dien-nuoc"] = function (m, st, ve) {
    var k = m.hang_so;
    var nhap = [
      oNhap(st, "chu", N.dn_chu, { max: 200 }, ve),
      oNhap(st, "anh", N.dn_anh, { max: 50 }, ve),
      oNhap(st, "video", N.dn_video, { max: 20 }, ve),
      chon(N.dn_uoc, [["google", N.dn_google], ["openai", N.dn_openai]], st.uoc, function (v) { st.uoc = v; ve(); })
    ];
    function tinh() {
      var c = k.chu[st.uoc], whAnh = k.anh_j / 3600, whVid = k.video_j / 3600;
      var eChu = st.chu * 365 * c.wh, eAnh = st.anh * 365 * whAnh, eVid = st.video * 52 * whVid;
      var wh = eChu + eAnh + eVid, kwh = wh / 1000;
      var whAm = k.am_lit * 1000 * k.nhiet_rieng * k.am_tang / 3600;
      var ml = st.chu * 365 * c.ml;
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.dn_dien, soFmt(kwh, 2) + " kWh", "chinh", soFmt(wh) + " Wh"));
      ket.appendChild(o(N.dn_tien, tien(kwh * k.gia_kwh)));
      ket.appendChild(o(N.dn_am, soFmt(wh / whAm, 0), "", N.dn_am_don));
      ket.appendChild(o(N.dn_nuoc, ml >= 1000 ? soFmt(ml / 1000, 1) + " L" : soFmt(ml) + " mL", "", soFmt(ml / k.ml_giot) + " " + N.dn_giot));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.dn_chia));
      vis.appendChild(thanh([[N.dn_loai[0], eChu, "c-xanh", soFmt(eChu) + " Wh"], [N.dn_loai[1], eAnh, "c-tim", soFmt(eAnh) + " Wh"], [N.dn_loai[2], eVid, "c-cam", soFmt(eVid) + " Wh"]]));
      var mot = el("p", "mt-noi-bat");
      mot.appendChild(document.createTextNode(N.dn_1video + " "));
      mot.appendChild(el("b", null, soFmt(whVid / c.wh) + " " + N.dn_cau));
      vis.appendChild(mot);
      var tg = el("div", "mt-so-sanh");
      tg.appendChild(el("p", "mt-vis-h", N.dn_the_gioi));
      [["2024", k.iea_2024], ["2030", k.iea_2030]].forEach(function (x) {
        var h = el("div", "mt-ss-hang");
        h.appendChild(el("span", "mt-ss-nam", x[0]));
        var b = el("span", "mt-ss-cot");
        var f = el("i"); f.style.width = (x[1] / k.iea_2030 * 100) + "%"; b.appendChild(f);
        h.appendChild(b);
        h.appendChild(el("b", null, soFmt(x[1]) + " TWh"));
        tg.appendChild(h);
      });
      vis.appendChild(tg);
      vis.appendChild(el("p", "mt-ghi-nho", N.dn_nuoc_ghi));
      var x1 = function (n) { return soFmt(n, 2); };
      return { ket: ket, vis: vis, ct: [
        [N.dn_loai[0], soFmt(st.chu) + " × 365 × " + x1(c.wh) + " Wh = " + soFmt(eChu) + " Wh"],
        [N.dn_loai[1], soFmt(st.anh) + " × 365 × " + soFmt(k.anh_j) + " J ÷ " + soFmt(3600) + " = " + soFmt(eAnh) + " Wh"],
        [N.dn_loai[2], soFmt(st.video) + " × 52 × " + soFmt(k.video_j) + " J ÷ " + soFmt(3600) + " = " + soFmt(eVid) + " Wh"],
        [N.dn_tien, x1(kwh) + " kWh × " + soFmt(k.gia_kwh, 2) + " = " + tien(kwh * k.gia_kwh)],
        [N.dn_am_don, soFmt(1000) + " g × " + soFmt(k.nhiet_rieng, 3) + " J × " + k.am_tang + " °C ÷ " + soFmt(3600) + " = " + soFmt(whAm, 1) + " Wh (25 → 100 °C)"],
        [N.dn_nuoc, soFmt(st.chu) + " × 365 × " + x1(c.ml) + " mL = " + soFmt(ml) + " mL"]
      ] };
    }
    return { nhap: nhap, tinh: tinh };
  };

  // Lãi thật: tìm lãi tháng i sao cho tiền thực nhận = giá trị hiện tại của các kỳ trả (cách tính lãi suất quy đổi trên dư nợ giảm dần)
  function laiThat(nhan, tra, n) {
    if (nhan <= 0) return NaN;
    var pv = function (i) { return i === 0 ? tra * n : tra * (1 - Math.pow(1 + i, -n)) / i; };
    if (pv(0) <= nhan) return 0;
    var lo = 0, hi = 1;
    for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (pv(mid) > nhan) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  MAY_TINH["lai-vay"] = function (m, st, ve) {
    var nhap = [
      oNhap(st, "tien", N.lv_tien, { max: 500000000, step: 1000000, tien: true }, ve),
      oNhap(st, "lai", N.lv_lai, { max: 5, step: 0.1 }, ve),
      oNhap(st, "ky", N.lv_ky, { min: 1, max: 60 }, ve),
      oNhap(st, "phi", N.lv_phi, { max: 15, step: 0.5 }, ve),
      chon(N.lv_cach, [["phang", N.lv_phang], ["giam", N.lv_giam]], st.cach, function (v) { st.cach = v; ve(); })
    ];
    function tinh() {
      var P = st.tien, r = st.lai / 100, n = Math.max(1, Math.round(st.ky));
      var tra = st.cach === "phang" ? P / n + P * r : (r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)));
      var tong = tra * n, phiTien = P * st.phi / 100, nhan = P - phiTien;
      var i = laiThat(nhan, tra, n), apr = i * 12 * 100, qc = st.lai * 12;
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.lv_that, isNaN(apr) ? "—" : phan(apr) , apr > m.tran_dan_su ? "do" : "chinh", N.lv_nam));
      ket.appendChild(o(N.lv_qc, phan(qc), "", N.lv_nam));
      ket.appendChild(o(N.lv_moi_thang, tien(tra)));
      ket.appendChild(o(N.lv_lai_phi, tien(tong - P + phiTien), "", N.lv_tong + ": " + tien(tong)));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.lv_bieu));
      var cot = el("div", "mt-cot-ds");
      var max = P * r || 1, du = P;
      for (var k = 1; k <= n; k++) {
        var laiK, giamK;
        if (st.cach === "phang") { laiK = P * r; giamK = (P - (k - 1) * P / n) * r; }
        else { laiK = du * r; giamK = laiK; du = du * (1 + r) - tra; }
        var c = el("span", "mt-cot");
        var a = el("i", "c-cam"); a.style.height = (laiK / max * 100) + "%";
        c.appendChild(a);
        if (st.cach === "phang") { var b = el("i", "c-xanh"); b.style.height = (giamK / max * 100) + "%"; c.appendChild(b); }
        c.title = k + ": " + tien(laiK);
        cot.appendChild(c);
      }
      vis.appendChild(cot);
      var ghi = el("div", "mt-chu-giai");
      [[st.cach === "phang" ? N.lv_bieu_phang : N.lv_giam, "c-cam"]].concat(st.cach === "phang" ? [[N.lv_bieu_giam, "c-xanh"]] : []).forEach(function (x) {
        var g = el("span", "mt-chu-giai-o"); g.appendChild(el("i", "mt-cham " + x[1])); g.appendChild(document.createTextNode(x[0])); ghi.appendChild(g);
      });
      vis.appendChild(ghi);
      if (apr > m.tran_dan_su) vis.appendChild(el("p", "mt-canh", N.lv_tran));
      vis.appendChild(el("p", "mt-ghi-nho", N.lv_ghi));
      var ct = st.cach === "phang"
        ? [[N.lv_bieu_phang, tien(P) + " × " + phan(st.lai, 2) + " = " + tien(P * r)],
           [N.lv_moi_thang, tien(P) + " ÷ " + n + " + " + tien(P * r) + " = " + tien(tra)]]
        : [[N.lv_moi_thang, "P × r ÷ (1 − (1 + r)^−n) = " + tien(P) + " × " + phan(st.lai, 2) + " ÷ (1 − (1 + " + phan(st.lai, 2) + ")^−" + n + ") = " + tien(tra)]];
      ct.push([N.lv_tong, tien(tra) + " × " + n + " = " + tien(tong)]);
      ct.push([VI ? "Tiền thực nhận" : "Money you receive", tien(P) + " − " + tien(phiTien) + " = " + tien(nhan)]);
      ct.push([N.lv_that, (VI ? "tìm i: " : "solve i: ") + tien(nhan) + " = Σ " + tien(tra) + " ÷ (1 + i)^k, k = 1…" + n + " → i = " + phan(i * 100, 2) + " × 12 = " + phan(apr)]);
      return { ket: ket, vis: vis, ct: ct };
    }
    return { nhap: nhap, tinh: tinh };
  };

  MAY_TINH["quy-khan-cap"] = function (m, st, ve) {
    var nhap = [
      dsDong(N.qk_chi, st.dong, ve),
      oNhap(st, "thang", N.qk_thang, { min: 1, max: 12 }, ve),
      oNhap(st, "co", N.qk_co, { max: 200000000, step: 1000000, tien: true }, ve),
      oNhap(st, "ke_hoach", N.qk_ke_hoach, { min: 1, max: 24 }, ve),
      oNhap(st, "de_duoc", N.qk_de_duoc, { max: 30000000, step: 500000, tien: true }, ve)
    ];
    function tinh() {
      var tong = st.dong.reduce(function (a, d) { return a + d[1]; }, 0);
      var muc = tong * st.thang, thieu = Math.max(0, muc - st.co), kh = Math.max(1, Math.round(st.ke_hoach));
      var moi = thieu / kh, lau = st.de_duoc > 0 ? Math.ceil(thieu / st.de_duoc - 1e-9) : Infinity;
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.qk_muc_tieu, tien(muc), "chinh", soFmt(st.thang) + " × " + tien(tong)));
      ket.appendChild(o(N.qk_moi_thang, thieu ? tien(moi) : N.qk_du, "", thieu ? kh + " " + N.thang : ""));
      ket.appendChild(o(N.qk_bao_lau, thieu ? (isFinite(lau) ? lau + " " + (lau === 1 ? N.thang1 : N.thang) : "—") : N.qk_du, "", thieu ? tien(st.de_duoc) + " / " + N.thang1 : ""));
      ket.appendChild(o(N.qk_tong_chi, tien(tong)));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.qk_muc_tieu + ": " + tien(muc)));
      var bac = el("div", "mt-bac");
      var co = Math.min(st.co, muc);
      var oCo = el("span", "mt-bac-o c-xanh"); oCo.style.flex = String(Math.max(co, 0.0001)); oCo.textContent = co ? N.qk_co : ""; if (co) bac.appendChild(oCo);
      for (var k = 1; k <= Math.min(kh, 24) && thieu > 0; k++) {
        var b = el("span", "mt-bac-o c-vang"); b.style.flex = String(moi); b.textContent = k <= 12 ? String(k) : ""; bac.appendChild(b);
      }
      vis.appendChild(bac);
      vis.appendChild(el("p", "mt-noi-bat", N.qk_goi_y));
      vis.appendChild(el("p", "mt-ghi-nho", N.qk_ghi));
      return { ket: ket, vis: vis, ct: [
        [N.qk_tong_chi, st.dong.map(function (d) { return soFmt(d[1]); }).join(" + ") + " = " + tien(tong)],
        [N.qk_muc_tieu, tien(tong) + " × " + soFmt(st.thang) + " = " + tien(muc)],
        [N.qk_moi_thang, "(" + tien(muc) + " − " + tien(st.co) + ") ÷ " + kh + " = " + tien(moi)],
        [N.qk_bao_lau, tien(thieu) + " ÷ " + tien(st.de_duoc) + " → " + (isFinite(lau) ? lau : "—")]
      ] };
    }
    return { nhap: nhap, tinh: tinh };
  };

  function giaMamThat(st) { return st.gia * (1 + st.phu_phi / 100) + st.bia; }
  MAY_TINH["mam-cuoi"] = function (m, st, ve) {
    var nhap = [
      oNhap(st, "gia", N.mc_gia, { max: 10000000, step: 100000, tien: true }, ve),
      oNhap(st, "phu_phi", N.mc_phu_phi, { max: 20, step: 1 }, ve),
      oNhap(st, "bia", N.mc_bia, { max: 2000000, step: 50000, tien: true }, ve),
      oNhap(st, "mam", N.mc_mam, { min: 1, max: 120 }, ve),
      oNhap(st, "ngan_sach", N.mc_ngan_sach, { max: 1000000000, step: 5000000, tien: true }, ve),
      dsDong(N.mc_co_dinh, st.co_dinh, ve)
    ];
    function tinh() {
      var that = giaMamThat(st), mam = Math.round(st.mam);
      var coDinh = st.co_dinh.reduce(function (a, d) { return a + d[1]; }, 0);
      var tong = that * mam + coDinh, tho = st.gia * mam + coDinh, con = st.ngan_sach - tong;
      var them = con > 0 ? Math.floor(con / that + 1e-9) : 0;
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.mc_that, tien(that), "chinh", tien(st.gia) + " → " + tien(that)));
      ket.appendChild(o(N.mc_tong, tien(tong), "", N.mc_ngay_tho + ": " + tien(tho)));
      ket.appendChild(o(N.mc_thieu, tien(tong - tho), "do"));
      ket.appendChild(con >= 0 ? o(N.mc_con, tien(con), "xanh", N.mc_them + " " + them + " " + N.mc_mam_don) : o(N.mc_vuot, tien(-con), "do"));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.mc_ngan_sach + ": " + tien(st.ngan_sach)));
      var doan = [[N.mc_thanh[0], coDinh, "c-tim", tien(coDinh)], [N.mc_thanh[1], that * mam, "c-cam", tien(that * mam)]];
      if (con >= 0) doan.push([N.mc_thanh[2], con, "c-xanh-nhat", tien(con)]);
      var tb = thanh(doan, con >= 0 ? st.ngan_sach : tong);
      if (con < 0) { var vach = el("span", "mt-vach"); vach.style.left = (st.ngan_sach / tong * 100) + "%"; tb.querySelector(".mt-thanh").appendChild(vach); }
      vis.appendChild(tb);
      var mam3 = el("div", "mt-mam-lop");
      [[tien(st.gia), "c-cam"], ["+ " + tien(st.gia * st.phu_phi / 100), "c-vang"], ["+ " + tien(st.bia), "c-xanh"]].forEach(function (x) { mam3.appendChild(el("span", "mt-lop " + x[1], x[0])); });
      mam3.appendChild(el("b", "mt-lop-tong", "= " + tien(that)));
      vis.appendChild(mam3);
      vis.appendChild(el("p", "mt-ghi-nho", N.mc_ghi));
      return { ket: ket, vis: vis, ct: [
        [N.mc_that, tien(st.gia) + " × (1 + " + phan(st.phu_phi, 1) + ") + " + tien(st.bia) + " = " + tien(that)],
        [N.mc_tong, tien(that) + " × " + mam + " + " + tien(coDinh) + " = " + tien(tong)],
        [N.mc_ngay_tho, tien(st.gia) + " × " + mam + " + " + tien(coDinh) + " = " + tien(tho)],
        [con >= 0 ? N.mc_them : N.mc_vuot, con >= 0 ? tien(con) + " ÷ " + tien(that) + " = " + soFmt(con / that, 1) + " → " + them + " " + N.mc_mam_don : tien(tong) + " − " + tien(st.ngan_sach) + " = " + tien(-con)]
      ] };
    }
    return { nhap: nhap, tinh: tinh };
  };

  MAY_TINH["xep-ban"] = function (m, st, ve) {
    var nhom = el("fieldset", "mt-ds");
    nhom.appendChild(el("legend", "mt-ds-h", N.xb_nhom));
    st.nhom.forEach(function (g) {
      var obj = { v: g[2] };
      var h = oNhap(obj, "v", N.dong[g[0]], { thanh: false }, function () { g[2] = Math.round(obj.v); ve(); });
      h.classList.add("phia-" + g[1]);
      nhom.appendChild(h);
    });
    var nhap = [oNhap(st, "ghe", N.xb_ghe, { min: 2, max: 14 }, ve), nhom, oNhap(st, "cong_thang", N.xb_cong, { max: 1500 }, ve)];
    function tinh() {
      var ghe = Math.max(1, Math.round(st.ghe));
      var tong = 0, rieng = 0, du = {}, ban = [];
      st.nhom.forEach(function (g) {
        tong += g[2]; rieng += Math.ceil(g[2] / ghe);
        var day = Math.floor(g[2] / ghe);
        for (var k = 0; k < day; k++) ban.push([g[1], ghe, N.dong[g[0]]]);
        du[g[1]] = (du[g[1]] || 0) + g[2] % ghe;
      });
      Object.keys(du).forEach(function (p) {
        var con = du[p];
        while (con > 0) { ban.push([p, Math.min(ghe, con), N.dong[p] + " · " + N.xb_le, true]); con -= ghe; }
      });
      var tuDo = Math.ceil(tong / ghe), ghep = ban.length;
      var duMam = Math.max(0, Math.ceil(st.cong_thang / ghe) - tuDo);
      var mc = S.so["mam-cuoi"] || MAY["mam-cuoi"].mac_dinh, that = giaMamThat(mc);
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.xb_ghep, ghep + " " + N.xb_ban, "chinh"));
      ket.appendChild(o(N.xb_tu_do, tuDo + " " + N.xb_ban, "", N.xb_tong + ": " + soFmt(tong) + " " + N.xb_nguoi));
      ket.appendChild(o(N.xb_rieng, rieng + " " + N.xb_ban));
      ket.appendChild(o(N.xb_du, duMam + " " + N.mc_mam_don, duMam ? "do" : "", tien(duMam * that) + " " + N.xb_tien));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.xb_so_do));
      var so = el("div", "mt-so-do");
      ban.forEach(function (b) {
        var c = el("span", "mt-ban phia-" + b[0] + (b[3] ? " ghep" : ""), String(b[1]));
        c.title = b[2] + ": " + b[1];
        so.appendChild(c);
      });
      vis.appendChild(so);
      var ghi = el("div", "mt-chu-giai");
      ["gai", "trai", "tre"].forEach(function (p) {
        var g = el("span", "mt-chu-giai-o"); g.appendChild(el("i", "mt-cham phia-" + p)); g.appendChild(document.createTextNode(N.dong[p])); ghi.appendChild(g);
      });
      var g2 = el("span", "mt-chu-giai-o"); g2.appendChild(el("i", "mt-cham ghep")); g2.appendChild(document.createTextNode(N.xb_le)); ghi.appendChild(g2);
      vis.appendChild(ghi);
      var ct = [[N.xb_tu_do, (VI ? "làm tròn lên " : "round up ") + soFmt(tong) + " ÷ " + ghe + " = " + tuDo],
                [N.xb_rieng, st.nhom.map(function (g) { return Math.ceil(g[2] / ghe); }).join(" + ") + " = " + rieng],
                [N.xb_ghep, (ghep - Object.keys(du).reduce(function (a, p) { return a + Math.ceil(du[p] / ghe); }, 0)) + " + " +
                  Object.keys(du).map(function (p) { return "⌈" + du[p] + " ÷ " + ghe + "⌉"; }).join(" + ") + " = " + ghep],
                [N.xb_du, "⌈" + soFmt(st.cong_thang) + " ÷ " + ghe + "⌉ − " + tuDo + " = " + duMam + "; " + duMam + " × " + tien(that) + " = " + tien(duMam * that)]];
      return { ket: ket, vis: vis, ct: ct };
    }
    return { nhap: nhap, tinh: tinh };
  };

  MAY_TINH["gia-von"] = function (m, st, ve, veLai) {
    var ma = Object.keys(m.mau);
    var nhap = [
      chon(N.gv_mau, ma.map(function (k) { return [k, m.mau[k].ten]; }), st.mau, function (k) { S.so["gia-von"] = moiGiaVon(m, k); veLai(); }),
      dsDong(N.gv_dong, st.dong, ve),
      oNhap(st, "hong", N.gv_hong, { max: 50 }, ve),
      oNhap(st, "gia_ban", N.gv_gia_ban, { max: 500000, step: 1000, tien: true }, ve),
      oNhap(st, "phi_san", N.gv_phi, { max: 30, step: 1 }, ve),
      oNhap(st, "von", N.gv_von, { max: 100000000, step: 500000, tien: true }, ve)
    ];
    var nutSan = el("button", "btn mt-nut-phu", N.gv_san);
    nutSan.type = "button";
    nutSan.addEventListener("click", function () { st.phi_san = m.phi_san_vi_du; daDoi(m.id); veLai(); });
    nhap.push(nutSan);
    function tinh() {
      var cong = st.dong.reduce(function (a, d) { return a + d[1]; }, 0);
      var chinh = st.dong.reduce(function (a, d) { return a + (d[2] ? d[1] : 0); }, 0);
      var hong = Math.round(st.hong), giaVon = hong > 1 ? cong * hong / (hong - 1) : cong;
      var phi = st.gia_ban * st.phi_san / 100, loi = st.gia_ban - giaVon - phi;
      var hv = loi > 0 ? Math.ceil(st.von / loi - 1e-9) : Infinity;
      var ket = el("div", "mt-ket-luoi");
      ket.appendChild(o(N.gv_hoa_von, isFinite(hv) ? soFmt(hv) + " " + N.gv_cai : "∞", isFinite(hv) ? "chinh" : "do", isFinite(hv) ? "" : N.gv_lo));
      ket.appendChild(o(N.gv_gia_von, tien(giaVon), "", cong !== giaVon ? tien(cong) + " → " + tien(giaVon) : ""));
      ket.appendChild(o(N.gv_loi, tien(loi), loi > 0 ? "xanh" : "do", phi ? N.gv_phi.replace(" (%)", "") + ": " + tien(phi) : ""));
      ket.appendChild(o(N.gv_nham, tien(chinh), "", N.gv_tuong + " " + tien(st.gia_ban - chinh - phi)));
      var vis = el("div", "mt-vis");
      vis.appendChild(el("p", "mt-vis-h", N.gv_gia_ban + ": " + tien(st.gia_ban)));
      vis.appendChild(thanh([[N.gv_gia_von, Math.min(giaVon, st.gia_ban), "c-cam", tien(giaVon)], [N.gv_phi.replace(" (%)", ""), phi, "c-vang", tien(phi)], [N.gv_loi, Math.max(loi, 0), "c-xanh", tien(loi)]], st.gia_ban));
      if (isFinite(hv)) {
        var cham = el("div", "mt-cham-ds");
        var moi = hv > 120 ? Math.ceil(hv / 120) : 1;
        for (var k = 0; k < Math.ceil(hv / moi); k++) cham.appendChild(el("i"));
        vis.appendChild(cham);
        vis.appendChild(el("p", "mt-ghi-nho", (moi > 1 ? "1 ● = " + moi + " " + N.gv_cai + " · " : "") + N.gv_hoa_von + ": " + soFmt(hv) + " " + N.gv_cai));
      }
      if (st.phi_san) vis.appendChild(el("p", "mt-ghi-nho", N.gv_ghi));
      return { ket: ket, vis: vis, ct: [
        [N.gv_dong, st.dong.map(function (d) { return soFmt(d[1]); }).join(" + ") + " = " + tien(cong)],
        [N.gv_gia_von, hong > 1 ? tien(cong) + " × " + hong + " ÷ " + (hong - 1) + " = " + tien(giaVon) : tien(cong)],
        [N.gv_loi, tien(st.gia_ban) + " − " + tien(giaVon) + " − " + tien(phi) + " = " + tien(loi)],
        [N.gv_hoa_von, tien(st.von) + " ÷ " + tien(loi) + " = " + (loi > 0 ? soFmt(st.von / loi, 2) + " → " + hv : "∞")]
      ] };
    }
    return { nhap: nhap, tinh: tinh };
  };

  // ---------- Tự đo: AI có giúp bạn nhanh hơn không? (thí nghiệm METR làm lại trên việc của mình, video 407) ----------
  // Đoán trước → chia việc bằng đồng xu (cân 5/5) → bấm giờ từng việc (hoặc gõ phút) + cảm giác sau mỗi việc có AI.
  // Kết quả: % nhanh hơn = (trung vị tự làm − trung vị có AI) ÷ trung vị tự làm, cùng cách METR báo "chậm hơn 19%".
  // Tiến độ lưu ở localStorage (mhai-tu-do-ai) để làm dần trong tuần; "Thử nhanh 1 phút" dùng dữ liệu mẫu, không đè dữ liệu thật.
  var TD_KHOA = "mhai-tu-do-ai";
  function tdDoc() {
    try { var x = JSON.parse(localStorage.getItem(TD_KHOA) || "null"); return x && Array.isArray(x.viec) ? x : null; } catch (e) { return null; }
  }
  function tdGhi(st) {
    if (st.demo) return;
    try { localStorage.setItem(TD_KHOA, JSON.stringify({ doan: st.doan, loai: st.loai, viec: st.viec })); } catch (e) {}
  }
  function tdXoaLuu() { try { localStorage.removeItem(TD_KHOA); } catch (e) {} }
  function tdViec() { return { ten: "", nhom: null, ms: 0, chay: null, phut: null, cam: null }; }
  function tdPhut(v) { return v.phut != null && v.phut > 0 ? v.phut : null; }
  function trungVi(ds) {
    if (!ds.length) return null;
    var x = ds.slice().sort(function (a, b) { return a - b; }), g = Math.floor(x.length / 2);
    return x.length % 2 ? x[g] : (x[g - 1] + x[g]) / 2;
  }
  function coDau(n, le) {
    if (n == null || isNaN(n)) return "—";
    var mu = Math.pow(10, le || 0), r = Math.round(n * mu) / mu;
    return (r > 0 ? "+" : r < 0 ? "−" : "") + soFmt(Math.abs(r), le || 0) + "%";
  }
  function dongHo(ms) {
    var g = Math.floor(ms / 1000), h = Math.floor(g / 3600), p = Math.floor(g / 60) % 60, s = g % 60;
    var hai = function (n) { return (n < 10 ? "0" : "") + n; };
    return (h ? h + ":" + hai(p) : hai(p)) + ":" + hai(s);
  }
  function tdMsChay(v) { return v.ms + (v.chay ? Math.max(0, Date.now() - v.chay) : 0); }
  // Một nhịp mỗi giây cho mọi đồng hồ đang chạy (chỉ đổi chữ, không vẽ lại thẻ)
  var tdNhip = null;
  function tdHenNhip() {
    if (tdNhip) return;
    tdNhip = setInterval(function () {
      var st = S.so["tu-do-ai"];
      if (!st || S.tab !== "tu-do-ai") return;
      document.querySelectorAll("[data-td-gio]").forEach(function (e) {
        var v = st.viec[+e.getAttribute("data-td-gio")];
        if (v && v.chay) e.textContent = dongHo(tdMsChay(v));
      });
    }, 500);
  }
  function tdDemo(m) {
    var d = m.demo;
    return { demo: true, _nap: true, doan: d.doan, loai: d.loai, viec: d.viec.map(function (x) {
      return { ten: "", nhom: x[0], ms: x[1] * 60000, chay: null, phut: x[1], cam: x[2] };
    }) };
  }
  function tdTenMacDinh(m, st, k) { return (m.loai[st.loai] || m.loai[Object.keys(m.loai)[0]]) + " " + (k + 1); }

  MAY_TINH["tu-do-ai"] = function (m, st, ve, veLai) {
    if (!st._nap) {
      st._nap = true;
      var luu = tdDoc();
      if (luu) { st.doan = luu.doan; st.loai = luu.loai || st.loai; st.viec = luu.viec; }
      if (!st.viec.length) for (var k = 0; k < m.so_viec; k++) st.viec.push(tdViec());
    }
    tdHenNhip();
    function luu_() { tdGhi(st); }
    function doi() { luu_(); ve(); }
    function daBatDau() { return st.viec.some(function (v) { return v.ms || v.chay || tdPhut(v); }); }

    var goc = el("div", "td");
    // thanh trên: thử nhanh, xóa làm lại; hoặc báo đang xem mẫu
    var thanhTren = el("div", "td-tren");
    if (st.demo) {
      thanhTren.classList.add("demo");
      thanhTren.appendChild(el("p", "td-demo-bao", N.td_dang_demo));
      var ve2 = el("button", "btn", N.td_ve_cua_toi);
      ve2.type = "button";
      ve2.addEventListener("click", function () {
        if (S.tdThat) S.so["tu-do-ai"] = S.tdThat; else delete S.so["tu-do-ai"];
        S.tdThat = null; veLai();
      });
      thanhTren.appendChild(ve2);
    } else {
      var nutDemo = el("button", "btn td-nut-demo", N.td_demo);
      nutDemo.type = "button";
      nutDemo.addEventListener("click", function () {
        S.tdThat = st; S.so["tu-do-ai"] = tdDemo(m);
        do_("may-tinh-tu-do", { buoc: "demo" }); veLai();
        var k = document.querySelector(".mt-ket");
        if (k && window.innerWidth < 900 && k.scrollIntoView) k.scrollIntoView({ block: "start" });
      });
      var nutXoa = el("button", "btn td-nut-xoa", N.td_xoa);
      nutXoa.type = "button";
      var hen = null;
      nutXoa.addEventListener("click", function () {
        if (!nutXoa.classList.contains("hoi")) {
          nutXoa.classList.add("hoi"); nutXoa.textContent = N.td_xoa_hoi;
          hen = setTimeout(function () { nutXoa.classList.remove("hoi"); nutXoa.textContent = N.td_xoa; }, 3500);
          return;
        }
        clearTimeout(hen);
        tdXoaLuu();
        delete S.so["tu-do-ai"];
        do_("may-tinh-tu-do", { buoc: "xoa" }); veLai();
      });
      thanhTren.appendChild(nutDemo);
      thanhTren.appendChild(nutXoa);
    }
    goc.appendChild(thanhTren);

    function buoc(so, tieu, mo) {
      var b = el("section", "td-buoc");
      var h = el("h3", "td-buoc-h");
      h.appendChild(el("span", "td-so", String(so)));
      h.appendChild(document.createTextNode(tieu));
      b.appendChild(h);
      if (mo) b.appendChild(el("p", "td-buoc-mo", mo));
      return b;
    }

    // Bước 1: đoán trước
    var b1 = buoc(1, N.td_b1, N.td_b1_mo);
    var hang1 = el("div", "td-doan");
    var oDoan = el("input", "mt-o-so td-o-doan");
    oDoan.type = "number"; oDoan.inputMode = "numeric"; oDoan.min = -90; oDoan.max = 300; oDoan.step = 1; oDoan.placeholder = "30";
    oDoan.setAttribute("aria-label", N.td_b1);
    if (st.doan != null) oDoan.value = st.doan;
    if (st.demo) oDoan.readOnly = true;
    var keo = el("input", "mt-keo");
    keo.type = "range"; keo.min = -50; keo.max = 100; keo.step = 5; keo.value = st.doan != null ? st.doan : 0;
    keo.setAttribute("aria-label", N.td_b1);
    if (st.demo) keo.disabled = true;
    var nhanDoan = el("b", "td-doan-chu");
    function chuDoan() {
      nhanDoan.textContent = st.doan == null ? N.td_chua_doan : (st.doan >= 0 ? N.td_nhanh + " " + soFmt(st.doan) + "%" : N.td_cham + " " + soFmt(-st.doan) + "%");
      nhanDoan.className = "td-doan-chu" + (st.doan == null ? " chua" : st.doan >= 0 ? " tot" : " xau");
    }
    function datDoan(v, tu) {
      v = parseFloat(v);
      st.doan = isNaN(v) ? null : Math.max(-90, Math.min(300, v));
      if (tu !== oDoan) oDoan.value = st.doan == null ? "" : st.doan;
      if (tu !== keo && st.doan != null) keo.value = st.doan;
      chuDoan(); doi();
    }
    oDoan.addEventListener("input", function () { datDoan(oDoan.value, oDoan); });
    keo.addEventListener("input", function () { datDoan(keo.value, keo); });
    chuDoan();
    var dau1 = el("div", "td-doan-dau");
    dau1.appendChild(nhanDoan);
    var oBoc = el("span", "td-o-phan"); oBoc.appendChild(oDoan); oBoc.appendChild(el("span", null, "%"));
    dau1.appendChild(oBoc);
    hang1.appendChild(dau1);
    hang1.appendChild(keo);
    b1.appendChild(hang1);
    goc.appendChild(b1);

    // Bước 2: loại việc, tung đồng xu chia đều hai nhóm
    var b2 = buoc(2, N.td_b2, N.td_b2_mo);
    var chonLoai = chon(N.td_loai, Object.keys(m.loai).map(function (k) { return [k, m.loai[k]]; }), st.loai, function (k) {
      st.loai = k; luu_();
      document.querySelectorAll(".td-ten").forEach(function (o, i) { o.placeholder = tdTenMacDinh(m, st, i); });
      ve();
    });
    if (st.demo) chonLoai.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
    b2.appendChild(chonLoai);
    var batDau = daBatDau(), chuaChia = st.viec.filter(function (v) { return !v.nhom; }).length;
    var hangTung = el("div", "td-tung-hang");
    var nutTung = el("button", "btn td-nut-tung");
    nutTung.type = "button";
    nutTung.appendChild(el("span", "td-xu", "½"));
    nutTung.appendChild(document.createTextNode(!batDau && !chuaChia ? N.td_tung_lai : N.td_tung));
    var khoaTung = batDau && !chuaChia;
    if (khoaTung || st.demo) nutTung.disabled = true;
    nutTung.addEventListener("click", function () {
      var dang = daBatDau();
      var ds = dang ? st.viec.filter(function (v) { return !v.nhom; }) : st.viec.slice();
      if (!dang) st.viec.forEach(function (v) { v.nhom = null; });
      for (var i = ds.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = ds[i]; ds[i] = ds[j]; ds[j] = t; }
      ds.forEach(function (v) {
        var ai = st.viec.filter(function (x) { return x.nhom === "ai"; }).length, tu = st.viec.filter(function (x) { return x.nhom === "tu"; }).length;
        v.nhom = ai < tu ? "ai" : tu < ai ? "tu" : (Math.random() < 0.5 ? "ai" : "tu");
      });
      S.tdLat = true;
      luu_(); daDoi(m.id); do_("may-tinh-tu-do", { buoc: "tung" }); veLai();
    });
    hangTung.appendChild(nutTung);
    var nAi = st.viec.filter(function (v) { return v.nhom === "ai"; }).length, nTu = st.viec.filter(function (v) { return v.nhom === "tu"; }).length;
    if (nAi + nTu) {
      var dem = el("span", "td-dem");
      dem.appendChild(el("span", "td-nhan ai", nAi + " · " + N.td_ai));
      dem.appendChild(el("span", "td-nhan tu", nTu + " · " + N.td_tu));
      hangTung.appendChild(dem);
    }
    b2.appendChild(hangTung);
    if (khoaTung && !st.demo) b2.appendChild(el("p", "mt-ghi-nho", N.td_tung_khoa));
    goc.appendChild(b2);

    // Bước 3: danh sách việc, bấm giờ, cảm giác sau việc có AI
    var b3 = buoc(3, N.td_b3, N.td_b3_mo);
    if (!nAi && !nTu) b3.appendChild(el("p", "td-goi-y", N.td_can_tung));
    var ds = el("ol", "td-ds");
    var lat = S.tdLat; S.tdLat = false;
    st.viec.forEach(function (v, i) {
      var li = el("li", "td-viec" + (v.nhom ? " nhom-" + v.nhom : "") + (tdPhut(v) ? " xong" : ""));
      var h1 = el("div", "td-viec-dau");
      h1.appendChild(el("span", "td-viec-so", String(i + 1)));
      var ten = el("input", "td-ten");
      ten.type = "text"; ten.maxLength = 60; ten.value = v.ten || ""; ten.placeholder = tdTenMacDinh(m, st, i);
      ten.setAttribute("aria-label", N.td_ten_viec + " " + (i + 1));
      ten.addEventListener("input", function () { v.ten = ten.value; luu_(); });
      if (st.demo) ten.readOnly = true;
      h1.appendChild(ten);
      var nhan = el("span", "td-nhan " + (v.nhom || "chua") + (lat && v.nhom ? " lat" : ""), v.nhom === "ai" ? N.td_ai : v.nhom === "tu" ? N.td_tu : N.td_chua);
      if (lat && v.nhom) nhan.style.animationDelay = (i * 60) + "ms";
      h1.appendChild(nhan);
      var bo = null;
      if (!st.demo && !v.ms && !v.chay && !tdPhut(v) && st.viec.length > 2) {
        bo = el("button", "td-bo", "×");
        bo.type = "button"; bo.title = N.td_bo; bo.setAttribute("aria-label", N.td_bo + " " + (i + 1));
        bo.addEventListener("click", function () { st.viec.splice(i, 1); luu_(); veLai(); });
        h1.appendChild(bo);
      }
      li.appendChild(h1);
      if (v.nhom) {
        var h2 = el("div", "td-gio-hang");
        var gio = el("span", "td-gio" + (v.chay ? " chay" : ""), dongHo(tdMsChay(v)));
        gio.setAttribute("data-td-gio", String(i));
        h2.appendChild(gio);
        var nut = el("button", "btn td-nut-gio" + (v.chay ? " dung" : ""), v.chay ? N.td_dung : N.td_bat_dau);
        nut.type = "button";
        if (st.demo) nut.disabled = true;
        nut.addEventListener("click", function () {
          if (v.chay) {
            v.ms += Math.max(0, Date.now() - v.chay); v.chay = null;
            v.phut = Math.max(0.1, Math.round(v.ms / 6000) / 10);
            do_("may-tinh-tu-do", { buoc: "bam-gio", nhom: v.nhom });
          } else {
            v.chay = Date.now();
          }
          luu_(); daDoi(m.id); veLai();
        });
        h2.appendChild(nut);
        var oP = el("label", "td-o-phut");
        var p = el("input", "mt-o-so");
        p.type = "number"; p.inputMode = "decimal"; p.min = 0; p.step = 0.5; p.placeholder = "0";
        if (tdPhut(v)) p.value = v.phut;
        if (st.demo || v.chay) p.disabled = true;
        p.setAttribute("aria-label", N.td_go_phut + " " + (i + 1));
        p.addEventListener("input", function () {
          var x = parseFloat(p.value);
          v.phut = isNaN(x) || x <= 0 ? null : x;
          v.ms = v.phut ? Math.round(v.phut * 60000) : 0;
          gio.textContent = dongHo(v.ms);
          li.classList.toggle("xong", !!v.phut);
          if (bo) bo.hidden = !!v.phut; // việc đã có số phút thì không bỏ được
          doi();
        });
        oP.appendChild(p);
        oP.appendChild(el("span", null, N.td_phut));
        h2.appendChild(oP);
        li.appendChild(h2);
        if (v.nhom === "ai") {
          var cam = el("div", "td-cam");
          cam.appendChild(el("span", "td-cam-h", N.td_cam));
          var hc = el("span", "td-cam-hang");
          hc.setAttribute("role", "radiogroup");
          hc.setAttribute("aria-label", N.td_cam);
          m.cam.forEach(function (x) {
            var c = el("button", "mt-chip td-cam-chip " + (x > 0 ? "tot" : x < 0 ? "xau" : "bang"), coDau(x));
            c.type = "button";
            c.setAttribute("role", "radio");
            c.setAttribute("aria-checked", v.cam === x ? "true" : "false");
            c.title = x === 0 ? N.td_nhu_nhau : (x > 0 ? N.td_nhanh : N.td_cham) + " " + Math.abs(x) + "%";
            if (st.demo) c.disabled = true;
            c.addEventListener("click", function () {
              v.cam = v.cam === x ? null : x;
              hc.querySelectorAll(".mt-chip").forEach(function (b) { b.setAttribute("aria-checked", b === c && v.cam === x ? "true" : "false"); });
              doi();
            });
            hc.appendChild(c);
          });
          cam.appendChild(hc);
          var chu = el("span", "td-cam-chu");
          chu.appendChild(el("span", null, "← " + N.td_cham));
          chu.appendChild(el("span", null, N.td_nhanh + " →"));
          cam.appendChild(chu);
          li.appendChild(cam);
        }
      }
      ds.appendChild(li);
    });
    b3.appendChild(ds);
    if (!st.demo && st.viec.length < m.toi_da) {
      var them = el("button", "btn td-nut-them", "+ " + N.td_them);
      them.type = "button";
      them.addEventListener("click", function () { st.viec.push(tdViec()); luu_(); veLai(); });
      b3.appendChild(them);
    }
    b3.appendChild(el("p", "mt-ghi-nho", N.td_luu));
    goc.appendChild(b3);

    function tinh() {
      var ai = [], tu = [], cams = [];
      st.viec.forEach(function (v) {
        var p = tdPhut(v);
        if (p && v.nhom === "ai") ai.push(p);
        if (p && v.nhom === "tu") tu.push(p);
        if (v.nhom === "ai" && v.cam != null) cams.push(v.cam);
      });
      var mAi = trungVi(ai), mTu = trungVi(tu);
      var doDuoc = ai.length && tu.length ? (mTu - mAi) / mTu * 100 : null;
      var tuong = cams.length ? cams.reduce(function (a, b) { return a + b; }, 0) / cams.length : null;
      var it = m.it_nhat, du = ai.length >= it && tu.length >= it;
      if (du && !S.tdDu && !st.demo) { S.tdDu = true; do_("may-tinh-tu-do", { buoc: "du-mau" }); }
      var mr = m.metr;
      var lop = function (x) { return x == null ? "trong" : x >= 0 ? "xanh" : "do"; };

      var ket = el("div", "td-ket");
      var chinh = el("div", "mt-ket-o td-chinh" + (doDuoc == null ? "" : doDuoc >= 0 ? " mt-xanh" : " mt-do"));
      chinh.appendChild(el("span", "mt-ket-nhan", N.td_ket_h));
      chinh.appendChild(el("b", "mt-ket-so", doDuoc == null ? "—" :
        (Math.abs(doDuoc) < 0.05 ? N.td_nhu_nhau : (doDuoc > 0 ? N.td_nhanh : N.td_cham) + " " + soFmt(Math.abs(doDuoc), 1) + "%")));
      if (doDuoc != null) chinh.appendChild(el("span", "mt-ket-phu", N.td_ai + " " + soFmt(mAi, 1) + " " + N.td_phut + " · " + N.td_tu + " " + soFmt(mTu, 1) + " " + N.td_phut + " (" + N.td_trung_vi + ")"));
      ket.appendChild(chinh);
      var ba = el("div", "td-ba");
      [[N.td_doan, N.td_doan_phu, st.doan, mr.doan], [N.td_tuong, N.td_tuong_phu, tuong, mr.tuong], [N.td_dong_ho, N.td_dong_ho_phu, doDuoc, mr.do]].forEach(function (x) {
        var t = el("div", "td-o td-" + lop(x[2]));
        t.appendChild(el("span", "td-o-nhan", x[0]));
        t.appendChild(el("b", "td-o-so", coDau(x[2])));
        t.appendChild(el("span", "td-o-phu", x[1]));
        t.appendChild(el("span", "td-o-metr", N.td_metr + " " + coDau(x[3])));
        ba.appendChild(t);
      });
      ket.appendChild(ba);

      var vis = el("div", "mt-vis");
      // Thanh hai phía: phải là nhanh hơn, trái là chậm hơn; mỗi hàng có thanh của bạn và thanh mảnh của METR
      vis.appendChild(el("p", "mt-vis-h", N.td_so_sanh));
      var cot = el("div", "td-hai-phia");
      var tran = Math.max(40, Math.abs(st.doan || 0), Math.abs(tuong || 0), Math.abs(doDuoc || 0));
      [[N.td_doan, st.doan, mr.doan], [N.td_tuong, tuong, mr.tuong], [N.td_dong_ho, doDuoc, mr.do]].forEach(function (x) {
        var h = el("div", "td-hp-hang");
        h.appendChild(el("span", "td-hp-ten", x[0]));
        var ray = el("span", "td-hp-ray");
        [[x[1], "ban"], [x[2], "metr"]].forEach(function (y) {
          if (y[0] == null) return;
          var b = el("i", "td-hp-thanh " + y[1] + (y[0] >= 0 ? " tot" : " xau"));
          var w = Math.min(50, Math.abs(y[0]) / tran * 50);
          b.style.width = w + "%";
          b.style.left = y[0] >= 0 ? "50%" : (50 - w) + "%";
          ray.appendChild(b);
        });
        h.appendChild(ray);
        h.appendChild(el("b", "td-hp-so", coDau(x[1])));
        cot.appendChild(h);
      });
      vis.appendChild(cot);
      var ghi = el("div", "mt-chu-giai");
      [[N.td_ban, "td-cham-ban"], [N.td_metr + " (" + mr.nguoi + ")", "td-cham-metr"]].forEach(function (x) {
        var g = el("span", "mt-chu-giai-o"); g.appendChild(el("i", "mt-cham " + x[1])); g.appendChild(document.createTextNode(x[0])); ghi.appendChild(g);
      });
      ghi.appendChild(el("span", "mt-chu-giai-o td-hp-chu", "← " + N.td_cham + " · " + N.td_nhanh + " →"));
      vis.appendChild(ghi);

      // Chấm số phút từng việc trên cùng một trục, vạch là trung vị
      if (ai.length || tu.length) {
        var vp = el("div", "td-phut-vis");
        vp.appendChild(el("p", "mt-vis-h", N.td_phut_h));
        var lon = Math.max.apply(null, ai.concat(tu)) * 1.08;
        [[N.td_ai, ai, mAi, "ai"], [N.td_tu, tu, mTu, "tu"]].forEach(function (x) {
          var h = el("div", "td-ph-hang");
          h.appendChild(el("span", "td-ph-ten", x[0]));
          var ray = el("span", "td-ph-ray");
          x[1].forEach(function (p) {
            var c = el("i", "td-ph-cham " + x[3]); c.style.left = (p / lon * 100) + "%"; c.title = soFmt(p, 1) + " " + N.td_phut; ray.appendChild(c);
          });
          if (x[2] != null) { var v = el("span", "td-ph-vach"); v.style.left = (x[2] / lon * 100) + "%"; ray.appendChild(v); }
          h.appendChild(ray);
          h.appendChild(el("b", "td-ph-so", x[2] == null ? "—" : soFmt(x[2], 1) + " " + N.td_phut));
          vp.appendChild(h);
        });
        var truc = el("div", "td-ph-truc");
        truc.appendChild(el("span", null, "0"));
        truc.appendChild(el("span", null, soFmt(lon, 0) + " " + N.td_phut));
        vp.appendChild(truc);
        vis.appendChild(vp);
      }

      if (!ai.length && !tu.length) vis.appendChild(el("p", "mt-noi-bat", N.td_chua_co));
      else if (!du) vis.appendChild(el("p", "mt-canh", N.td_canh.replace("{ai}", ai.length).replace("{tu}", tu.length).replace("{n}", it)));
      if (doDuoc != null) {
        var kl = el("p", "mt-noi-bat");
        kl.appendChild(document.createTextNode(Math.abs(doDuoc) < 5 ? N.td_ket_hoa : doDuoc > 0 ? N.td_ket_nhanh : N.td_ket_cham));
        if (tuong != null) {
          kl.appendChild(document.createTextNode(" "));
          kl.appendChild(el("b", null, N.td_lech.replace("{d}", soFmt(Math.abs(tuong - doDuoc), 0))));
        }
        vis.appendChild(kl);
      }
      vis.appendChild(el("p", "mt-ghi-nho", N.td_ghi));

      var day = function (x) { return "(" + x.slice().sort(function (a, b) { return a - b; }).map(function (n) { return soFmt(n, 1); }).join("; ") + ")"; };
      var ct = [
        [N.td_ct_ai, N.td_trung_vi + " " + day(ai) + " = " + (mAi == null ? "—" : soFmt(mAi, 1) + " " + N.td_phut)],
        [N.td_ct_tu, N.td_trung_vi + " " + day(tu) + " = " + (mTu == null ? "—" : soFmt(mTu, 1) + " " + N.td_phut)],
        [N.td_dong_ho, doDuoc == null ? "(" + N.td_ct_tu + " − " + N.td_ct_ai + ") ÷ " + N.td_ct_tu + " × 100"
          : "(" + soFmt(mTu, 1) + " − " + soFmt(mAi, 1) + ") ÷ " + soFmt(mTu, 1) + " × 100 = " + coDau(doDuoc, 1)],
        [N.td_ct_tuong, cams.length ? "(" + cams.map(function (c) { return soFmt(c); }).join(" + ") + ") ÷ " + cams.length + " = " + coDau(tuong, 1) : "—"]
      ];
      if (tuong != null && doDuoc != null) ct.push([N.td_tuong + " − " + N.td_dong_ho, soFmt(tuong, 1) + " − (" + soFmt(doDuoc, 1) + ") = " + soFmt(tuong - doDuoc, 1)]);
      return { ket: ket, vis: vis, ct: ct };
    }
    return { nhap: [goc], tinh: tinh };
  };

  function moiGiaVon(m, k) {
    var x = m.mau[k];
    return { mau: k, dong: x.dong.map(function (d) { return d.slice(); }), hong: x.hong, gia_ban: x.gia_ban, phi_san: x.phi_san, von: x.von };
  }
  function trangThai(m) {
    if (!S.so[m.id]) S.so[m.id] = m.mau ? moiGiaVon(m, Object.keys(m.mau)[0]) : JSON.parse(JSON.stringify(m.mac_dinh));
    return S.so[m.id];
  }

  // ---------- dựng một thẻ ----------
  function veTab(id) {
    var m = MAY[id];
    var st = trangThai(m);
    khu.innerHTML = "";
    khu.setAttribute("aria-labelledby", "mt-tab-" + id);
    var dau = el("div", "mt-dau");
    var tieu = el("div");
    tieu.appendChild(el("h2", "mt-ten", m.ten));
    tieu.appendChild(el("p", "mt-mo", m.mo));
    dau.appendChild(tieu);
    var vids = el("div", "mt-video");
    m.video.forEach(function (v) {
      var a = el(v.url ? "a" : "span", "mt-vid" + (v.url ? "" : " sap"), "#" + v.so);
      if (v.url) { a.href = v.url; a.title = v.ten; if (NHUNG) a.target = "_top"; }
      else a.title = N.sap_ra;
      vids.appendChild(a);
    });
    if (m.doc) {
      var doc = el("a", "mt-vid mt-doc", m.doc.ten);
      doc.href = m.doc.url; doc.title = N.td_doc || m.doc.ten;
      if (NHUNG) doc.target = "_top";
      vids.appendChild(doc);
    }
    dau.appendChild(vids);
    khu.appendChild(dau);

    var luoi = el("div", "mt-luoi mt-luoi-" + id);
    var trai = el("div", "mt-nhap");
    trai.appendChild(el("p", "mt-vi-du", m.vi_du || N.vi_du));
    var phai = el("div", "mt-ket");
    var duoi = el("div", "mt-duoi");
    var may;
    function ve() { daDoi(id); tinhLai(); }
    function tinhLai() {
      var r = may.tinh();
      phai.innerHTML = "";
      phai.appendChild(r.ket);
      phai.appendChild(r.vis);
      var ct = duoi.querySelector(".mt-ct");
      var moi = congThuc(r.ct);
      if (ct) duoi.replaceChild(moi, ct); else duoi.insertBefore(moi, duoi.firstChild);
    }
    may = MAY_TINH[id](m, st, ve, function () { veTab(id); });
    may.nhap.forEach(function (x) { trai.appendChild(x); });
    luoi.appendChild(trai);
    luoi.appendChild(phai);
    khu.appendChild(luoi);

    if (m.nguon.length) {
      var ng = el("div", "mt-nguon");
      ng.appendChild(el("p", "mt-ct-h", N.nguon));
      var ds = el("ul", "mt-nguon-ds");
      m.nguon.forEach(function (n) {
        var li = el("li");
        var a = el("a", null, n.ten);
        a.href = n.url; a.target = "_blank"; a.rel = "noopener";
        a.addEventListener("click", function () { do_("may-tinh-nguon", { may: id }); });
        li.appendChild(a);
        li.appendChild(el("span", "mt-nguon-so", n.so));
        ds.appendChild(li);
      });
      ng.appendChild(ds);
      duoi.appendChild(ng);
    }
    var pr = el("div", "mt-prompt" + (m.nguon.length ? "" : " mt-rong"));
    pr.appendChild(el("p", "mt-ct-h", N.prompt_h));
    pr.appendChild(el("p", "mt-prompt-chu", m.prompt));
    pr.appendChild(el("p", "mt-ghi-nho", N.prompt_meo));
    var chep = el("button", "btn", N.chep);
    chep.type = "button";
    chep.addEventListener("click", function () {
      var xong = function () { chep.textContent = N.da_chep; setTimeout(function () { chep.textContent = N.chep; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(m.prompt).then(xong, function () {}); else xong();
      do_("may-tinh-chep", { may: id });
    });
    pr.appendChild(chep);
    duoi.appendChild(pr);
    khu.appendChild(duoi);
    tinhLai();
  }

  function doiTab(id, dau) {
    if (!MAY[id]) id = D.may[0].id;
    S.tab = id;
    document.querySelectorAll(".mt-tab").forEach(function (b) {
      var on = b.dataset.tab === id;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (on && !dau && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    veTab(id);
    try {
      var u = new URL(location.href);
      u.searchParams.set("may", id);
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
    do_("may-tinh-mo", { may: id });
  }
  document.querySelectorAll(".mt-tab").forEach(function (b) { b.addEventListener("click", function () { doiTab(b.dataset.tab); }); });
  var hang = document.querySelector(".mt-tabs");
  if (hang) hang.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var ds = Array.prototype.slice.call(document.querySelectorAll(".mt-tab"));
    var i = ds.findIndex(function (b) { return b.dataset.tab === S.tab; });
    var j = (i + (e.key === "ArrowRight" ? 1 : ds.length - 1)) % ds.length;
    doiTab(ds[j].dataset.tab); ds[j].focus(); e.preventDefault();
  });
  var dauVao = /[?&]may=([a-z-]+)/.exec(location.search);
  doiTab(dauVao ? dauVao[1] : D.may[0].id, true);
})();

/* Trò chơi "Nhập vai rẽ nhánh" (nhap-vai.html, en/): phỏng vấn thử 230, nói chuyện lương 231, năm khách khó tính 258 + 377.
   Dữ liệu: thẻ <script id="nv-du-lieu"> do scripts/trang/nhap-vai.py tạo từ data/nhap-vai.json.
   Mỗi vai có một hay nhiều lượt; mỗi lượt là một cây nút. Chọn một câu: câu đó hiện thành bong bóng của bạn, Bit nhận xét ngay,
   người kia đáp lại, thanh đo (ấn tượng / mức lương / tâm trạng khách) đổi theo. Hết lượt thì tính kết theo do.muc.
   ?vai=phong-van|luong|khach mở thẳng một vai (bài video mở trò trong iframe ?nhung=1 kèm vai của bài đó).
   Chạy thử: trạng thái ở window.__nv. */
(function () {
  "use strict";
  var nguon = document.getElementById("nv-du-lieu");
  var san = document.getElementById("nv-san"), ket = document.getElementById("nv-ket"), chonVai = document.getElementById("nv-chon-vai");
  if (!nguon || !san || !ket || !chonVai) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, VAI = D.vai;
  var CHAM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DAU = { tot: "✓", xau: "✗", vua: "•" };
  var S = null, hen = [];

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function cho(ms, f) { var id = setTimeout(f, CHAM ? 0 : ms); hen.push(id); }
  function huyHen() { hen.forEach(clearTimeout); hen = []; }
  function timVai(id) { for (var i = 0; i < VAI.length; i++) if (VAI[i].id === id) return VAI[i]; return null; }
  function cuon(e) { if (e && window.innerWidth < 860) e.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" }); }

  // ?vai=... trên thanh địa chỉ (giữ nguyên ?nhung=1 khi đang nằm trong bài)
  function ghiUrl(id) {
    try {
      var u = new URL(location.href);
      if (id) u.searchParams.set("vai", id); else u.searchParams.delete("vai");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  // ---------- thanh đo ----------
  function mucCua(v, x) {
    var m = v.do.muc;
    for (var i = 0; i < m.length; i++) if (x >= m[i][0]) return m[i][1];
    return m[m.length - 1][1];
  }
  function phanTram(v, x) {
    if (v.do.kieu !== "luong") return Math.max(0, Math.min(100, x));
    return Math.max(0, Math.min(100, (x - v.do.min) / (v.do.max - v.do.min) * 100));
  }
  function mat(x) {
    // khuôn mặt nhỏ: miệng cong theo thanh đo (0 mếu, 100 cười)
    var c = (x - 50) / 50 * 7;
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18"/><circle class="m" cx="14" cy="16" r="2.4"/><circle class="m" cx="26" cy="16" r="2.4"/>' +
      '<path class="m" d="M12 ' + (27 - c / 2) + ' Q20 ' + (27 + c) + ' 28 ' + (27 - c / 2) + '" fill="none" stroke-width="2.6" stroke-linecap="round"/></svg>';
  }
  function veDo() {
    var v = S.v, o = san.querySelector(".nv-do");
    if (!o) return;
    o.innerHTML = "";
    o.className = "nv-do nv-do-" + v.do.kieu;
    var dau = el("div", "nv-do-dau");
    dau.appendChild(el("span", "nv-do-nhan", v.do.nhan));
    var so = el("b", "nv-do-so");
    if (v.do.kieu === "luong") {
      so.textContent = S.val == null ? v.do.chua : S.val === 0 ? v.do.mat : S.val + " " + v.do.don_vi;
    } else {
      so.textContent = S.val + "/100";
    }
    dau.appendChild(so);
    o.appendChild(dau);
    var ray = el("div", "nv-ray");
    if (v.do.kieu === "luong") {
      var kh = el("span", "nv-khoang");
      kh.style.left = phanTram(v, v.do.khoang[0]) + "%";
      kh.style.width = (phanTram(v, v.do.khoang[1]) - phanTram(v, v.do.khoang[0])) + "%";
      kh.title = v.do.khoang_nhan;
      ray.appendChild(kh);
    }
    var kim = el("span", "nv-kim");
    if (v.do.kieu === "luong") {
      kim.hidden = !S.val;
    } else {
      kim.innerHTML = mat(S.val);
    }
    kim.style.left = phanTram(v, S.val == null ? v.do.min : S.val) + "%";
    ray.appendChild(kim);
    o.appendChild(ray);
    var chan = el("div", "nv-do-chan");
    if (v.do.kieu === "luong") {
      chan.appendChild(el("span", null, v.do.min));
      var g = el("span", "nv-khoang-nhan", v.do.khoang_nhan + ": " + v.do.khoang[0] + "–" + v.do.khoang[1]);
      chan.appendChild(g);
      chan.appendChild(el("span", null, v.do.max));
    } else {
      chan.appendChild(el("span", null, v.do.trai));
      chan.appendChild(el("span", null, v.do.phai));
    }
    o.appendChild(chan);
    o.setAttribute("aria-label", v.do.nhan + ": " + so.textContent);
  }
  function nhayDo(cu) {
    var o = san.querySelector(".nv-do");
    if (!o || S.val === cu) return;
    var tang = S.val == null || cu == null ? true : S.val > cu;
    o.classList.remove("is-tang", "is-giam");
    void o.offsetWidth;
    o.classList.add(tang ? "is-tang" : "is-giam");
    if (S.v.do.kieu !== "luong" && cu != null) {
      var d = el("span", "nv-do-doi", (S.val > cu ? "+" : "") + (S.val - cu));
      o.appendChild(d);
      cho(1400, function () { d.remove(); });
    }
  }

  // ---------- chọn vai ----------
  function moChon() {
    huyHen();
    S = null;
    san.hidden = true;
    ket.hidden = true;
    chonVai.hidden = false;
    ghiUrl("");
  }
  chonVai.addEventListener("click", function (e) {
    var a = e.target.closest("[data-vai]");
    if (!a) return;
    e.preventDefault();
    batDau(a.getAttribute("data-vai"));
    cuon(san);
  });

  function batDau(id) {
    var v = timVai(id);
    if (!v) return;
    huyHen();
    S = { v: v, li: 0, duong: [], ketLuot: [] };
    window.__nv = S;
    chonVai.hidden = true;
    ket.hidden = true;
    san.hidden = false;
    ghiUrl(id);
    veSan();
    batLuot();
    do_("nhap-vai-bat-dau", { vai: v.id });
  }

  function veSan() {
    var v = S.v;
    san.innerHTML = "";
    var dau = el("div", "nv-dau");
    var doi = el("button", "nv-doi-vai", "‹ " + N.doi_vai);
    doi.type = "button";
    doi.addEventListener("click", moChon);
    dau.appendChild(doi);
    dau.appendChild(el("b", "nv-dau-ten", v.ten));
    dau.appendChild(el("p", "nv-tien"));
    san.appendChild(dau);

    var o = el("div", "nv-o");
    var canh = el("div", "nv-canh nv-mau-" + v.mau);
    var nguoi = el("div", "nv-nguoi");
    canh.appendChild(nguoi);
    canh.appendChild(el("div", "nv-do"));
    var log = el("div", "nv-log");
    canh.appendChild(log);
    o.appendChild(canh);

    var ben = el("div", "nv-ben");
    var vai = el("div", "nv-vai");
    vai.appendChild(el("b", null, N.ban));
    vai.appendChild(el("p", null, v.canh));
    ben.appendChild(vai);
    if (v.chinh_sach) {
      var cs = el("div", "nv-cs");
      cs.appendChild(el("b", null, v.chinh_sach_nhan));
      var ul = el("ul");
      v.chinh_sach.forEach(function (x) { ul.appendChild(el("li", null, x)); });
      cs.appendChild(ul);
      ben.appendChild(cs);
    }
    ben.appendChild(el("div", "nv-hanh"));
    o.appendChild(ben);
    san.appendChild(o);
  }

  // ---------- một lượt ----------
  function batLuot() {
    var v = S.v, l = v.luot[S.li];
    S.val = l.bat_dau;
    S.hua = false;
    S.duongLuot = [];
    var tien = san.querySelector(".nv-tien");
    tien.textContent = v.luot.length > 1 ? N.luot + " " + (S.li + 1) + "/" + v.luot.length : "";
    if (v.luot.length > 1) {
      var cham = el("span", "nv-cham");
      v.luot.forEach(function (_, j) {
        var c = S.ketLuot[j];
        cham.appendChild(el("i", j === S.li ? "is-dang" : c ? "is-" + c.ket : ""));
      });
      tien.appendChild(cham);
    }
    var ng = san.querySelector(".nv-nguoi");
    ng.innerHTML = "";
    ng.appendChild(el("span", "nv-av", l.nguoi.av));
    var tt = el("div", "nv-nguoi-ten");
    tt.appendChild(el("b", null, l.nguoi.ten));
    tt.appendChild(el("span", null, l.nguoi.chuc));
    ng.appendChild(tt);
    san.querySelector(".nv-log").innerHTML = "";
    san.querySelector(".nv-hanh").innerHTML = "";
    veDo();
    S.nut = l.dau;
    noi(l.nut[l.dau].dong, function () { hienChon(); });
  }

  function themDong(tu, chu) {
    var log = san.querySelector(".nv-log");
    var hang = el("div", "nv-dong nv-tu-" + tu);
    hang.appendChild(el("p", "nv-bong", chu));
    log.appendChild(hang);
    log.scrollTop = log.scrollHeight;
  }

  // người kia nói lần lượt từng câu (có chấm "đang nhập"), xong thì gọi xong()
  function noi(ds, xong) {
    var i = 0, canh = san.querySelector(".nv-canh");
    function mot() {
      if (i >= ds.length) { canh.classList.remove("is-noi"); xong(); return; }
      var chu = ds[i++], log = san.querySelector(".nv-log"), go = null;
      canh.classList.add("is-noi");
      if (!CHAM) {
        go = el("div", "nv-dong nv-tu-ho nv-go");
        go.appendChild(el("p", "nv-bong", "• • •"));
        go.setAttribute("aria-label", N.dang_noi);
        log.appendChild(go);
        log.scrollTop = log.scrollHeight;
      }
      cho(450 + Math.min(1200, chu.length * 12), function () {
        if (go) go.remove();
        themDong("ho", chu);
        cho(250, mot);
      });
    }
    mot();
  }

  function hienChon() {
    var l = S.v.luot[S.li], n = l.nut[S.nut];
    var hanh = san.querySelector(".nv-hanh");
    var cu = hanh.querySelector(".nv-chon-o");
    if (cu) cu.remove();
    var o = el("div", "nv-chon-o");
    o.appendChild(el("p", "nv-hoi", N.ban_chon));
    var ds = el("div", "nv-chon");
    n.chon.forEach(function (x) {
      var b = el("button", "nv-nut", x.chu);
      b.type = "button";
      b.addEventListener("click", function () { chon(x); });
      ds.appendChild(b);
    });
    o.appendChild(ds);
    hanh.appendChild(o);
    var dau = ds.querySelector("button");
    if (dau && window.innerWidth >= 860) dau.focus({ preventScroll: true });
    if (window.innerWidth < 860) {
      var r = o.getBoundingClientRect();
      if (r.bottom > window.innerHeight) o.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "end" });
    }
  }

  function chon(x) {
    var l = S.v.luot[S.li];
    S.duongLuot.push(x);
    S.duong.push({ x: x, luot: S.li });
    if (x.hua) S.hua = true;
    var hanh = san.querySelector(".nv-hanh");
    hanh.innerHTML = "";
    themDong("minh", x.chu);
    // Bit nhận xét ngay câu vừa chọn
    var bit = el("div", "nv-bit is-" + x.muc);
    var img = el("img");
    img.src = D.p + "assets/" + (x.muc === "tot" ? "bit-vui.svg" : x.muc === "xau" ? "bit-sai-roi.svg" : "bit-giai-thich.svg");
    img.alt = ""; img.width = 52; img.height = 52;
    bit.appendChild(img);
    var tt = el("div");
    var h = el("b", null, N.bit + " ");
    h.appendChild(el("span", "nv-dau-muc", DAU[x.muc]));
    tt.appendChild(h);
    tt.appendChild(el("p", null, x.bit));
    if (x.hua) tt.appendChild(el("p", "nv-hua", "⚠ " + N.hua));
    bit.appendChild(tt);
    hanh.appendChild(bit);
    noi(x.dap || [], function () {
      var cu = S.val;
      if (x.dat != null) S.val = x.dat;
      if (x.doi != null) S.val = Math.max(0, Math.min(100, (S.val || 0) + x.doi));
      veDo();
      nhayDo(cu);
      if (x.toi === "het") { cho(500, hetLuot); return; }
      S.nut = x.toi;
      noi(l.nut[x.toi].dong, hienChon);
    });
  }

  function hetLuot() {
    var v = S.v, l = v.luot[S.li];
    var k = S.val === 0 && v.do.kieu === "luong" ? "xau" : mucCua(v, S.val);
    if (S.hua && k === "tot") k = "vua";
    S.ketLuot.push({ l: l, ket: k, val: S.val, hua: S.hua, duong: S.duongLuot });
    san.querySelector(".nv-canh").classList.add("is-het");
    do_("nhap-vai-luot", { vai: v.id, luot: l.id || v.id, ket: k });
    var cuoi = S.li + 1 >= v.luot.length;
    var hanh = san.querySelector(".nv-hanh");
    var kq = el("div", "nv-kq-luot is-" + k);
    kq.appendChild(el("span", "nv-kq-nhan", N.het));
    kq.appendChild(el("b", null, (S.hua && k === "vua" ? v.ket.hua : v.ket[k])));
    hanh.appendChild(kq);
    var nut = el("div", "cta nv-sau");
    var tiep = el("button", "btn btn-yt", cuoi ? N.xem_ket : N.khach_tiep + " ›");
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (cuoi) { ketThuc(); return; }
      S.li++;
      san.querySelector(".nv-canh").classList.remove("is-het");
      batLuot();
      cuon(san);
    });
    nut.appendChild(tiep);
    hanh.appendChild(nut);
    tiep.focus({ preventScroll: true });
    if (window.innerWidth < 860) kq.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "center" });
  }

  // ---------- kết quả cả vai ----------
  function chep(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, loi) {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var xong = false;
      try { xong = document.execCommand("copy"); } catch (e) {}
      t.remove();
      xong ? ok() : loi();
    });
  }

  function ketThuc() {
    var v = S.v;
    huyHen();
    san.hidden = true;
    ket.hidden = false;
    ket.innerHTML = "";
    var the = el("div", "ld-ket-the nv-ket-the");
    var img = el("img");
    var ds = S.ketLuot, so, hang, phu, tong;
    if (v.do.kieu === "tam-trang") {
      var nguoi = ds.filter(function (x) { return x.ket === "tot"; }).length;
      var hua = ds.filter(function (x) { return x.hua; }).length;
      so = nguoi + "/" + ds.length;
      hang = nguoi === ds.length ? v.ket.tot : nguoi >= 3 ? v.ket.vua : v.ket.xau;
      phu = N.khach_nguoi + (hua ? " · " + hua + " " + N.khach_hua : "");
      tong = nguoi === ds.length ? "tot" : nguoi >= 3 ? "vua" : "xau";
    } else {
      var x = ds[0];
      tong = x.ket;
      hang = v.ket[x.ket];
      if (v.do.kieu === "luong") { so = x.val ? x.val + " " + v.do.don_vi : v.do.mat; phu = N.luong_chot; }
      else { so = x.val + "/100"; phu = N.an_tuong; }
    }
    img.src = D.p + "assets/" + (tong === "xau" ? "bit-sai-roi.svg" : "bit-vui.svg");
    img.alt = ""; img.width = 96; img.height = 96;
    the.appendChild(img);
    var tt = el("div");
    tt.appendChild(el("p", "ld-ket-so", so));
    tt.appendChild(el("p", "ld-ket-hang", hang));
    tt.appendChild(el("p", "ld-ket-phu", phu));
    the.appendChild(tt);
    ket.appendChild(the);

    // vai khách: năm ô, mỗi khách một kết
    if (ds.length > 1) {
      var luoi = el("div", "nv-luoi");
      ds.forEach(function (x) {
        var o = el("div", "nv-o-khach is-" + x.ket + (x.hua ? " is-hua" : ""));
        o.appendChild(el("span", "nv-av nv-av-nho", x.l.nguoi.av));
        o.appendChild(el("b", null, x.l.nguoi.ten));
        o.appendChild(el("span", "nv-o-chuc", x.l.nguoi.chuc));
        o.appendChild(el("span", "nv-o-ket", x.hua && x.ket === "vua" ? "⚠ " + v.ket.vua : v.ket[x.ket]));
        luoi.appendChild(o);
      });
      ket.appendChild(luoi);
    }

    // câu yếu nhất (video 230: ghi lại câu bạn trả lời yếu nhất)
    var yeu = null;
    S.duong.forEach(function (d) {
      var diem = d.x.muc === "xau" ? 2 : d.x.hua ? 1 : 0;
      if (diem && (!yeu || diem > yeu.diem || (diem === yeu.diem && (d.x.doi || 0) < (yeu.d.x.doi || 0)))) yeu = { d: d, diem: diem };
    });
    if (yeu) {
      var y = el("div", "nv-yeu");
      y.appendChild(el("p", "nv-kq-h", N.yeu_nhat));
      y.appendChild(el("p", "nv-yeu-cau", "“" + yeu.d.x.chu + "”"));
      y.appendChild(el("p", "nv-yeu-bit", yeu.d.x.bit));
      ket.appendChild(y);
    }

    ket.appendChild(el("h2", "nv-kq-h", N.duong_di));
    var ol = el("ol", "nv-duong");
    S.duong.forEach(function (d) {
      var li = el("li", "is-" + d.x.muc);
      li.appendChild(el("span", "nv-dau-muc", DAU[d.x.muc]));
      var o = el("div");
      if (ds.length > 1) o.appendChild(el("span", "nv-duong-ai", v.luot[d.luot].nguoi.ten));
      o.appendChild(el("b", null, d.x.chu));
      o.appendChild(el("span", "nv-duong-bit", d.x.bit));
      li.appendChild(o);
      ol.appendChild(li);
    });
    ket.appendChild(ol);

    // tập tiếp với AI thật: prompt của video
    var tap = el("div", "nv-tap");
    tap.appendChild(el("p", "nv-kq-h", N.tap_that));
    tap.appendChild(el("p", "nv-tap-meo", N.tap_meo));
    tap.appendChild(el("pre", "nv-prompt", v.prompt));
    var bc = el("button", "btn", N.chep);
    bc.type = "button";
    bc.addEventListener("click", function () {
      chep(v.prompt).then(function () { bc.textContent = "✓ " + N.da_chep; setTimeout(function () { bc.textContent = N.chep; }, 2000); }, function () {});
      do_("nhap-vai-chep-prompt", { vai: v.id });
    });
    tap.appendChild(bc);
    ket.appendChild(tap);

    var nut = el("div", "cta nv-cuoi");
    var lai = el("button", "btn btn-yt", N.choi_lai);
    lai.type = "button";
    lai.addEventListener("click", function () { batDau(v.id); cuon(san); });
    nut.appendChild(lai);
    v.video.forEach(function (vd) {
      var a = el("a", "btn", N.xem_video + " #" + vd.so);
      a.href = vd.url;
      a.addEventListener("click", function () { do_("nhap-vai-xem-video", { so: String(vd.so) }); });
      nut.appendChild(a);
    });
    ket.appendChild(nut);

    var khac = el("div", "nv-khac");
    khac.appendChild(el("p", "nv-kq-h", N.vai_khac));
    var hang2 = el("div", "nv-khac-hang");
    VAI.forEach(function (w) {
      if (w.id === v.id) return;
      var b = el("button", "nv-khac-nut nv-mau-" + w.mau);
      b.type = "button";
      b.appendChild(el("b", null, w.ten));
      b.appendChild(el("span", null, w.moi));
      b.addEventListener("click", function () { batDau(w.id); cuon(san); });
      hang2.appendChild(b);
    });
    khac.appendChild(hang2);
    ket.appendChild(khac);

    ket.scrollIntoView({ behavior: CHAM ? "auto" : "smooth", block: "start" });
    do_("nhap-vai-xong", { vai: v.id, ket: tong });
    do_("hoc-xong", { loai: "nhap-vai" });
  }

  var dau = null;
  try { dau = new URLSearchParams(location.search).get("vai"); } catch (e) {}
  if (dau && timVai(dau)) batDau(dau);
})();

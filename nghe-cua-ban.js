/* Mô phỏng "Nghề của bạn với AI" (nghe-cua-ban.html, en/).
   Bước 1: chọn nghề (nút nghề, hoặc gõ nghề khác: khớp từ khóa, nghề chưa có mô phỏng thì dẫn sang Lộ trình theo ngành).
   Bước 2: một ngày làm việc, mỗi việc gắn nhãn AI làm nháp / AI phụ một tay / Chỉ bạn làm; chạm để xem AI làm gì, bạn vẫn làm gì, trạm thực hành cùng chủ đề.
   Bước 3: đấu với AI 3 vòng trên một việc: tốc độ (bạn tự viết, AI viết cùng lúc), bắt lỗi (bản AI có đúng một dòng sai), chọn bản hợp người nhận.
   Dữ liệu: thẻ <script id="nc-du-lieu"> do scripts/trang/nghe-cua-ban.py tạo từ data/nghe-cua-ban.json. Mở thẳng một nghề bằng ?nghe=<id>.
   Không gọi AI, không lưu gì ngoài vài sự kiện đếm (theo-doi.js). Trạng thái ở window.__nc để thử. */
(function () {
  "use strict";
  var nguon = document.getElementById("nc-du-lieu");
  if (!nguon) return;
  var D = JSON.parse(nguon.textContent), N = D.nhan, P = D.p;
  var tien = document.getElementById("nc-tien");
  var khChon = document.getElementById("nc-chon"), khNgay = document.getElementById("nc-ngay");
  var khDau = document.getElementById("nc-dau-tri"), khKet = document.getElementById("nc-ket");
  var bao = document.getElementById("nc-bao");
  var THEO_ID = {};
  D.nghe.forEach(function (x) { THEO_ID[x.id] = x; });
  var S = { nghe: null, vong: 0, ban: 0, ai: 0, gio: null };
  window.__nc = S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function nut(cls, chu) { var b = el("button", cls, chu); b.type = "button"; return b; }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function boDau(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"); }
  function cuon(e) { try { e.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (x) { e.scrollIntoView(); } }
  function dungGio() { if (S.gio) { clearInterval(S.gio); S.gio = null; } }

  // ---------- Bước 1: chọn nghề ----------
  [].slice.call(document.querySelectorAll(".nc-chip")).forEach(function (b) {
    b.addEventListener("click", function () { chonNghe(b.dataset.nghe); });
  });

  // so có dấu nếu người xem gõ có dấu, không dấu nếu gõ không dấu (giống Lộ trình theo ngành)
  function khop(go, tu) {
    var coDau = go !== boDau(go);
    var a = coDau ? go : boDau(go);
    return tu.some(function (k) {
      k = k.toLowerCase();
      var b = coDau ? k : boDau(k);
      return a.indexOf(b) >= 0 || (a.length >= 3 && b.indexOf(a) >= 0);
    });
  }
  document.getElementById("nc-go").addEventListener("submit", function (e) {
    e.preventDefault();
    var go = document.getElementById("nc-o").value.trim().toLowerCase();
    if (!go) return;
    var x = D.nghe.filter(function (n) { return khop(go, n.tu_khoa); })[0];
    do_("nc-go-nghe", { co: x ? x.id : "khong" });
    if (x) { bao.hidden = true; chonNghe(x.id); return; }
    var g = D.khac.filter(function (n) { return khop(go, n.tu_khoa); })[0];
    bao.innerHTML = "";
    bao.appendChild(document.createTextNode(f(N.chua_co, { x: go }) + " "));
    var a = el("a", "nc-bao-lien", g ? g.ten : N.mo_lo_trinh);
    a.href = P + "lo-trinh-nganh.html" + (g ? "?ai=" + encodeURIComponent(g.id) : "?nghe=" + encodeURIComponent(go));
    if (g) bao.appendChild(document.createTextNode(N.gan_nghe + " "));
    bao.appendChild(a);
    bao.hidden = false;
  });

  function chonNghe(id, khongCuon) {
    var x = THEO_ID[id];
    if (!x) return;
    dungGio();
    S.nghe = x;
    [].slice.call(document.querySelectorAll(".nc-chip")).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.nghe === id)); });
    khDau.hidden = true; khKet.hidden = true;
    veNgay(x, khongCuon);
    do_("nc-chon-nghe", { nghe: id });
    try { history.replaceState(null, "", location.pathname + "?nghe=" + id); } catch (e) {}
  }

  // ---------- Bước 2: một ngày làm việc ----------
  function veNgay(x, khongCuon) {
    tien.textContent = x.ngay;
    khNgay.innerHTML = "";
    khNgay.style.setProperty("--nc-mau", x.mau[0]);
    var h = el("h2", "nc-h", x.ngay); h.id = "nc-ngay-h";
    khNgay.appendChild(h);
    var dem = { nhap: 0, phu: 0, nguoi: 0 };
    x.viec.forEach(function (v) { dem[v.muc]++; });
    var o = el("div", "nc-dem");
    ["nhap", "phu", "nguoi"].forEach(function (m) {
      var c = el("div", "nc-dem-o nc-m-" + m);
      c.appendChild(el("b", "", String(dem[m])));
      c.appendChild(el("span", "", N.muc[m]));
      o.appendChild(c);
    });
    khNgay.appendChild(o);
    var ds = el("ol", "nc-viec-ds");
    x.viec.forEach(function (v) {
      var li = el("li", "nc-viec nc-m-" + v.muc + (v.id === x.dau.viec ? " is-dau" : ""));
      var b = nut("nc-viec-nut");
      b.setAttribute("aria-expanded", "false");
      b.appendChild(el("span", "nc-gio", v.gio));
      b.appendChild(el("span", "nc-viec-ten", v.ten));
      b.appendChild(el("span", "nc-nhan", N.muc[v.muc]));
      var ct = el("div", "nc-ct"); ct.hidden = true;
      var p1 = el("p"); p1.appendChild(el("b", "", N.ai + ": ")); p1.appendChild(document.createTextNode(v.ai));
      var p2 = el("p"); p2.appendChild(el("b", "", N.ban + ": ")); p2.appendChild(document.createTextNode(v.ban));
      ct.appendChild(p1); ct.appendChild(p2);
      var hang = el("div", "nc-ct-nut");
      if (v.tram && x.tram_ten[v.tram]) {
        var a = el("a", "nc-tram", N.thu_tram + " “" + x.tram_ten[v.tram] + "” ›");
        a.href = x.trang + ".html?tram=" + v.tram;
        a.addEventListener("click", function () { do_("nc-mo-tram", { nghe: x.id, tram: v.tram }); });
        hang.appendChild(a);
      }
      if (v.id === x.dau.viec) {
        var d = nut("btn btn-yt nc-dau-nut", N.dau_viec);
        d.addEventListener("click", batDauDau);
        hang.appendChild(d);
      }
      if (hang.children.length) ct.appendChild(hang);
      b.addEventListener("click", function () {
        var mo = ct.hidden;
        ct.hidden = !mo;
        b.setAttribute("aria-expanded", String(mo));
        li.classList.toggle("is-mo", mo);
      });
      li.appendChild(b); li.appendChild(ct);
      ds.appendChild(li);
    });
    khNgay.appendChild(ds);
    var dauViec = x.viec.filter(function (v) { return v.id === x.dau.viec; })[0];
    var lon = nut("btn btn-yt nc-dau-lon", N.dau_ngan + ": " + (dauViec ? dauViec.ten : x.dau.ten));
    lon.addEventListener("click", batDauDau);
    khNgay.appendChild(lon);
    khNgay.hidden = false;
    if (!khongCuon) cuon(khNgay);
  }

  // ---------- Bước 3: đấu 3 vòng ----------
  var diemEl, vongEl, sanEl;
  function batDauDau() {
    var x = S.nghe;
    dungGio();
    S.vong = 0; S.ban = 0; S.ai = 0;
    khDau.innerHTML = "";
    var h = el("h2", "nc-h", x.dau.ten); h.id = "nc-dau-h";
    khDau.appendChild(h);
    diemEl = el("p", "nc-diem");
    vongEl = el("div", "nc-vong-ds");
    [N.v1, N.v2, N.v3].forEach(function (t, i) { vongEl.appendChild(el("span", "nc-vong-o", (i + 1) + ". " + t)); });
    sanEl = el("div", "nc-san");
    khDau.appendChild(diemEl); khDau.appendChild(vongEl); khDau.appendChild(sanEl);
    khKet.hidden = true;
    khDau.hidden = false;
    veDiem();
    vong1();
    cuon(khDau);
    do_("nc-bat-dau", { nghe: x.id });
  }
  function veDiem() { diemEl.textContent = f(N.ti_so, { a: S.ban, b: S.ai }); }
  function datVong(n) {
    S.vong = n;
    tien.textContent = f(N.v, { n: n }) + " · " + [N.v1, N.v2, N.v3][n - 1];
    [].slice.call(vongEl.children).forEach(function (c, i) { c.classList.toggle("is-dang", i === n - 1); c.classList.toggle("is-qua", i < n - 1); });
    sanEl.innerHTML = "";
  }
  function ketVong(ben, chu, sau) { // ben: bên nhận điểm vòng này, "ban", "ai" hoặc "hoa"
    if (ben === "ban") S.ban++; else if (ben === "ai") S.ai++;
    veDiem();
    var k = el("div", "nc-ket-vong nc-kv-" + ben);
    k.appendChild(el("b", "", N.thang[ben]));
    if (chu) k.appendChild(el("p", "", chu));
    var b = nut("btn btn-yt", S.vong < 3 ? N.tiep : N.xem_ket);
    b.addEventListener("click", sau);
    k.appendChild(b);
    sanEl.appendChild(k);
    b.focus({ preventScroll: true });
  }

  // Vòng 1: tốc độ. Bạn tự viết một câu, AI viết cả đề cùng lúc.
  function vong1() {
    var x = S.nghe.dau, V = x.toc_do;
    datVong(1);
    sanEl.appendChild(el("p", "nc-de", V.de));
    var hai = el("div", "nc-hai");
    var trai = el("div", "nc-lan nc-lan-ban"), phai = el("div", "nc-lan nc-lan-ai");
    var gB = el("b", "nc-dong-ho", "0.0"), gA = el("b", "nc-dong-ho", "0.0");
    trai.appendChild(el("span", "nc-lan-ten", N.ban_ten)); trai.appendChild(gB);
    var o = el("textarea", "nc-viet"); o.rows = 4; o.placeholder = V.goi_y; o.disabled = true; o.setAttribute("aria-label", V.de);
    trai.appendChild(o);
    var bd = nut("btn btn-yt nc-bd", N.bat_dau);
    trai.appendChild(bd);
    phai.appendChild(el("span", "nc-lan-ten", N.ai_ten)); phai.appendChild(gA);
    var giay = el("ol", "nc-ai-giay");
    phai.appendChild(giay);
    hai.appendChild(trai); hai.appendChild(phai);
    sanEl.appendChild(hai);
    var cau = x.bat_loi.dong.map(function (d) { return d.cau; }).slice(0, V.ai_so_cau);
    var t0 = 0, aiXong = false, banXong = false;
    bd.addEventListener("click", function () {
      if (!t0) {
        t0 = Date.now();
        o.disabled = false; o.focus();
        bd.textContent = N.xong;
        giay.appendChild(el("li", "nc-ai-dang", N.ai_dang));
        S.gio = setInterval(function () {
          var g = (Date.now() - t0) / 1000;
          if (!banXong) gB.textContent = g.toFixed(1);
          if (!aiXong) {
            gA.textContent = Math.min(g, V.ai_giay).toFixed(1);
            var n = Math.min(cau.length, Math.floor(g / V.ai_giay * cau.length));
            while (giay.querySelectorAll(".nc-ai-cau").length < n) {
              var dang = giay.querySelector(".nc-ai-dang");
              giay.insertBefore(el("li", "nc-ai-cau", cau[giay.querySelectorAll(".nc-ai-cau").length]), dang);
            }
            if (g >= V.ai_giay) {
              aiXong = true;
              var dg = giay.querySelector(".nc-ai-dang"); if (dg) dg.remove();
              phai.classList.add("is-xong");
            }
          }
          if (aiXong && banXong) dungGio();
        }, 100);
        return;
      }
      if (o.value.trim().length < 6) { o.focus(); o.classList.add("is-rung"); setTimeout(function () { o.classList.remove("is-rung"); }, 400); return; }
      banXong = true;
      var g = (Date.now() - t0) / 1000;
      gB.textContent = g.toFixed(1);
      o.disabled = true; bd.remove();
      trai.classList.add("is-xong");
      var cho = function () {
        if (!aiXong) { setTimeout(cho, 150); return; }
        dungGio();
        ketVong(g < V.ai_giay ? "ban" : "ai", f(N.ket_v1, { g: Math.round(g), n: cau.length, a: V.ai_giay }), vong2);
      };
      cho();
    });
  }

  // Vòng 2: bắt lỗi. Bản AI có đúng một dòng sai.
  function vong2() {
    var B = S.nghe.dau.bat_loi;
    datVong(2);
    sanEl.appendChild(el("p", "nc-de", B.huong));
    if (B.goc) {
      var goc = el("div", "nc-goc");
      goc.appendChild(el("b", "", N.goc));
      goc.appendChild(el("p", "", B.goc));
      sanEl.appendChild(goc);
    }
    var ds = el("ol", "nc-bl");
    var sai = B.dong.findIndex(function (d) { return d.sai; });
    var nuts = B.dong.map(function (d, i) {
      var li = el("li");
      var b = nut("nc-bl-nut");
      b.appendChild(el("span", "nc-bl-so", String(i + 1)));
      var c = el("span", "nc-bl-cau");
      c.appendChild(el("span", "", d.cau));
      if (d.dap) c.appendChild(el("small", "", N.dap_an + ": " + d.dap));
      b.appendChild(c);
      li.appendChild(b); ds.appendChild(li);
      b.addEventListener("click", function () { chon(i); });
      return b;
    });
    sanEl.appendChild(ds);
    function chon(i) {
      nuts.forEach(function (b) { b.disabled = true; });
      nuts[sai].classList.add("is-sai");
      var giai = el("p", "nc-giai", B.dong[sai].giai);
      nuts[sai].parentNode.appendChild(giai);
      if (i === sai) {
        do_("nc-bat-loi", { nghe: S.nghe.id, dung: 1 });
        ketVong("ban", N.dung_bat, vong3);
      } else {
        nuts[i].classList.add("is-on");
        do_("nc-bat-loi", { nghe: S.nghe.id, dung: 0 });
        ketVong("hoa", f(N.sai_bat, { n: sai + 1 }), vong3);
      }
    }
  }

  // Vòng 3: chọn bản hợp người nhận.
  function vong3() {
    var C = S.nghe.dau.chon;
    datVong(3);
    sanEl.appendChild(el("p", "nc-de", C.hoi));
    var ds = el("div", "nc-chon-ds");
    var nuts = C.ban.map(function (x, i) {
      var b = nut("nc-chon-nut");
      b.appendChild(el("span", "nc-chon-chu", String.fromCharCode(65 + i) + ". " + x.chu));
      ds.appendChild(b);
      b.addEventListener("click", function () { chon(i); });
      return b;
    });
    sanEl.appendChild(ds);
    function chon(i) {
      nuts.forEach(function (b, j) {
        b.disabled = true;
        if (C.ban[j].dung) b.classList.add("is-dung");
      });
      if (!C.ban[i].dung) nuts[i].classList.add("is-sai");
      nuts[i].appendChild(el("span", "nc-giai", C.ban[i].giai));
      ketVong(C.ban[i].dung ? "ban" : "hoa", C.ban[i].dung ? N.dung_chon : N.sai_chon, ketQua);
    }
  }

  // ---------- Kết quả ----------
  function ketQua() {
    var x = S.nghe;
    tien.textContent = f(N.ti_so, { a: S.ban, b: S.ai });
    khKet.innerHTML = "";
    var loai = S.ban > S.ai ? "thang" : S.ban === S.ai ? "hoa" : "thua";
    var the = el("div", "nc-ket-the nc-ket-" + loai);
    the.appendChild(el("p", "nc-ket-so", S.ban + " : " + S.ai));
    the.appendChild(el("p", "nc-ket-chu", N.ket[loai]));
    the.appendChild(el("p", "nc-ket-rut", N.ket_rut));
    khKet.appendChild(the);

    var lien = el("div", "nc-lien-ds");
    var dau = x.viec.filter(function (v) { return v.id === x.dau.viec; })[0];
    function the_(href, b, s, su) {
      var a = el("a", "nc-lien");
      a.href = href;
      a.appendChild(el("b", "", b));
      a.appendChild(el("span", "", s));
      a.addEventListener("click", function () { do_("nc-ket-lien", { nghe: x.id, loai: su }); });
      lien.appendChild(a);
    }
    if (dau && dau.tram && x.tram_ten[dau.tram]) the_(x.trang + ".html?tram=" + dau.tram, N.thu_tram + " “" + x.tram_ten[dau.tram] + "”", x.trang_ten, "tram");
    the_(x.trang + ".html", N.luyen + ": " + x.trang_ten, f(N.tram_ds, { n: x.so_tram }), "trang");
    the_(P + x.lt_url, N.lo_trinh, x.ten, "lo-trinh");
    khKet.appendChild(lien);

    if (x.video.length) {
      var vd = el("div", "ld-ket-video");
      x.video.forEach(function (v) {
        var a = el("a", "ld-vid");
        a.href = v.url;
        a.appendChild(el("span", "ld-vid-so", "#" + (v.so < 10 ? "0" : "") + v.so));
        a.appendChild(el("b", "", v.ten));
        vd.appendChild(a);
      });
      khKet.appendChild(vd);
    }
    var cta = el("div", "cta");
    var lai = nut("btn btn-yt", N.choi_lai); lai.addEventListener("click", batDauDau);
    var doi = nut("btn btn-nhe", N.doi_nghe);
    doi.addEventListener("click", function () { khDau.hidden = true; khKet.hidden = true; khNgay.hidden = true; tien.textContent = N.doi_nghe; cuon(khChon); });
    cta.appendChild(lai); cta.appendChild(doi);
    khKet.appendChild(cta);
    khKet.hidden = false;
    cuon(khKet);
    do_("nc-xong", { nghe: x.id, ban: S.ban, ai: S.ai });
  }

  var q = (location.search.match(/[?&]nghe=([\w-]+)/) || [])[1];
  if (q && THEO_ID[q]) chonNghe(q);
  else if (D.nghe.length === 1) {
    // bản chơi thử chỉ có một nghề: chọn sẵn để người xem vào thẳng ngày làm việc, không cuộn trang
    chonNghe(D.nghe[0].id, true);
  }
})();

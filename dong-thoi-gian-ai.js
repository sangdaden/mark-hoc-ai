/* Trò chơi "Xếp mốc lịch sử AI" (dong-thoi-gian-ai.html, en/), series 512-517 "Lịch sử AI trong sáu tập".
   Vòng 1: chạm một mốc (thẻ dưới), rồi chạm năm trên dòng thời gian để đặt; chạm thẻ đã đặt để gỡ ra. Kiểm tra: thẻ sai tô đỏ và về đúng năm.
   Vòng 2: dòng thời gian "chatbot vẽ" (bản minh họa do kênh viết) có 2 năm sai, người chơi khoanh 2 dòng rồi kiểm tra.
   Dữ liệu: thẻ <script id="dt-du-lieu"> do scripts/trang/dong-thoi-gian-ai.py tạo từ data/dong-thoi-gian-ai.json.
   Không gọi AI, không lưu gì ngoài vài sự kiện đếm (theo-doi.js). Trạng thái ở window.__dt để thử. */
(function () {
  "use strict";
  var nguon = document.getElementById("dt-du-lieu");
  var san = document.getElementById("dt-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, MOC = D.moc;
  var vongEl = document.getElementById("dt-vong"), ket = document.getElementById("dt-ket");
  var THEO_ID = {};
  MOC.forEach(function (m) { THEO_ID[m.id] = m; });
  var S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function tron(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    // không để thứ tự xáo trùng đúng thứ tự năm
    if (a.every(function (m, i) { return m === MOC[i]; })) a.push(a.shift());
    return a;
  }

  function batDau() {
    S = { vong: 1, cam: null, dat: {}, thu_tu: tron(MOC), dung1: 0, khoanh: {}, dung2: 0, da_kiem: false };
    window.__dt = S;
    ket.hidden = true;
    san.hidden = false;
    veVong1();
    do_("dt-bat-dau");
  }

  // ---------- Vòng 1 ----------
  function veVong1() {
    vongEl.textContent = N.v1;
    san.innerHTML = "";
    var dau = el("div", "dt-dau");
    dau.appendChild(el("p", "dt-lead", N.v1_lead));
    san.appendChild(dau);

    var truc = el("ol", "dt-truc");
    truc.setAttribute("aria-label", N.v1);
    MOC.forEach(function (m) {
      var li = el("li", "dt-o");
      var nut = el("button", "dt-nam");
      nut.type = "button";
      nut.dataset.nam = m.nam;
      nut.appendChild(el("span", "dt-nam-so", (m.id === "mua-dong" ? "~" : "") + m.nam));
      var cho = el("span", "dt-cho");
      nut.appendChild(cho);
      nut.addEventListener("click", function () { chamNam(m.nam); });
      li.appendChild(nut);
      truc.appendChild(li);
    });
    san.appendChild(truc);

    var kho = el("div", "dt-kho");
    kho.appendChild(el("p", "dt-kho-h", N.chua_dat));
    var ds = el("div", "dt-the-ds");
    S.thu_tu.forEach(function (m) {
      var b = el("button", "dt-the");
      b.type = "button";
      b.dataset.id = m.id;
      b.style.setProperty("--mau", m.mau);
      b.appendChild(el("b", null, m.ten));
      b.appendChild(el("span", null, m.goi_y));
      b.addEventListener("click", function () { chamThe(m.id); });
      ds.appendChild(b);
    });
    kho.appendChild(ds);
    var trangThai = el("p", "dt-cam", N.chon_moc);
    trangThai.id = "dt-cam";
    trangThai.setAttribute("aria-live", "polite");
    kho.appendChild(trangThai);
    san.appendChild(kho);

    var cta = el("div", "cta dt-cta");
    var kiem = el("button", "btn btn-yt", N.kiem);
    kiem.type = "button";
    kiem.id = "dt-kiem";
    kiem.addEventListener("click", kiemVong1);
    cta.appendChild(kiem);
    cta.appendChild(el("span", "dt-con muted"));
    san.appendChild(cta);
    capNhat();
  }

  function namCua(id) {
    for (var n in S.dat) if (S.dat[n] === id) return +n;
    return null;
  }

  function chamThe(id) {
    if (S.da_kiem) return;
    var n = namCua(id);
    if (n != null) { delete S.dat[n]; S.cam = id; }  // thẻ đã đặt: nhấc lên lại
    else S.cam = S.cam === id ? null : id;
    capNhat();
  }

  function chamNam(nam) {
    if (S.da_kiem) return;
    if (S.cam == null) {
      if (S.dat[nam]) { S.cam = S.dat[nam]; delete S.dat[nam]; capNhat(); }
      return;
    }
    var cu = S.dat[nam];
    var tu = namCua(S.cam);
    if (tu != null) delete S.dat[tu];
    S.dat[nam] = S.cam;
    S.cam = cu || null;  // năm đã có thẻ: đổi chỗ, thẻ cũ về tay
    capNhat();
  }

  function capNhat() {
    san.querySelectorAll(".dt-nam").forEach(function (nut) {
      var id = S.dat[nut.dataset.nam];
      var cho = nut.querySelector(".dt-cho");
      cho.textContent = id ? THEO_ID[id].ten : "";
      nut.classList.toggle("is-co", !!id);
      nut.classList.toggle("is-cho", S.cam != null);
      if (id) nut.style.setProperty("--mau", THEO_ID[id].mau); else nut.style.removeProperty("--mau");
    });
    san.querySelectorAll(".dt-the").forEach(function (b) {
      var daDat = namCua(b.dataset.id) != null;
      b.hidden = daDat;
      b.classList.toggle("is-cam", S.cam === b.dataset.id);
      b.setAttribute("aria-pressed", S.cam === b.dataset.id ? "true" : "false");
    });
    var cam = document.getElementById("dt-cam");
    if (cam) cam.textContent = S.cam ? N.dang_chon + " " + THEO_ID[S.cam].ten + " · " + N.cham_nam : (Object.keys(S.dat).length < MOC.length ? N.chon_moc : "");
    var con = MOC.length - Object.keys(S.dat).length;
    var kiem = document.getElementById("dt-kiem");
    if (kiem) kiem.disabled = con > 0;
    var conEl = san.querySelector(".dt-con");
    if (conEl) conEl.textContent = con > 0 ? f(N.con, { n: con }) : "";
    var kho = san.querySelector(".dt-kho");
    if (kho) kho.classList.toggle("is-het", con === 0 && !S.cam);
  }

  function kiemVong1() {
    S.da_kiem = true;
    S.dung1 = 0;
    MOC.forEach(function (m) { if (S.dat[m.nam] === m.id) S.dung1++; });
    // mỗi năm hiện đúng mốc của nó; mốc người chơi đặt sai thì tô đỏ và ghi chỗ đã đặt
    var nhamCho = {};
    MOC.forEach(function (m) { var n = namCua(m.id); if (n !== m.nam) nhamCho[m.id] = n; });
    san.querySelectorAll(".dt-o").forEach(function (li, i) {
      var m = MOC[i];
      var nut = li.querySelector(".dt-nam");
      nut.disabled = true;
      nut.style.setProperty("--mau", m.mau);
      nut.classList.remove("is-cho");
      var dung = nhamCho[m.id] === undefined;
      nut.classList.add(dung ? "is-dung" : "is-sai");
      nut.querySelector(".dt-cho").textContent = m.ten;
      var giai = el("div", "dt-giai");
      giai.appendChild(el("span", "dt-phan", f(N.phan, { n: i + 1 })));
      giai.appendChild(el("p", null, m.chu));
      if (!dung) giai.appendChild(el("p", "dt-nham", "✗ " + N.dat_sai + " " + nhamCho[m.id]));
      li.appendChild(giai);
    });
    var kho = san.querySelector(".dt-kho");
    if (kho) kho.remove();
    var cta = san.querySelector(".dt-cta");
    cta.innerHTML = "";
    var ph = el("div", "ld-phan-hoi dt-ph " + (S.dung1 === MOC.length ? "is-dung" : "is-sai"));
    var img = el("img");
    img.src = D.p + "assets/" + (S.dung1 === MOC.length ? "bit-vui.svg" : "bit-giai-thich.svg");
    img.alt = ""; img.width = 64; img.height = 64;
    ph.appendChild(img);
    var chu = el("div");
    chu.appendChild(el("b", "ld-ph-dau", f(N.dung_v1, { a: S.dung1, b: MOC.length })));
    chu.appendChild(el("p", "ld-ph-chu", S.dung1 === MOC.length ? N.dung_het : N.sai_mot));
    ph.appendChild(chu);
    cta.appendChild(ph);
    var tiep = el("button", "btn btn-yt", N.sang_v2 + " ›");
    tiep.type = "button";
    tiep.addEventListener("click", function () { veVong2(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
    cta.appendChild(tiep);
    tiep.focus({ preventScroll: true });
    do_("dt-vong-1", { dung: String(S.dung1) });
  }

  // ---------- Vòng 2 ----------
  function veVong2() {
    S.vong = 2;
    S.khoanh = {};
    vongEl.textContent = N.v2;
    san.innerHTML = "";
    var dau = el("div", "dt-dau");
    dau.appendChild(el("p", "dt-lead", N.v2_lead));
    san.appendChild(dau);

    var cs = el("div", "dt-chat");
    var hoi = el("p", "dt-hoi");
    hoi.appendChild(el("span", "dt-hoi-ai", "Mark"));
    hoi.appendChild(document.createTextNode(N.hoi));
    cs.appendChild(hoi);
    var tl = el("div", "dt-tl");
    var dauTl = el("p", "dt-tl-dau");
    dauTl.appendChild(el("span", "dt-av", "AI"));
    dauTl.appendChild(el("b", null, N.chatbot));
    dauTl.appendChild(el("small", "muted", " · " + N.minh_hoa));
    tl.appendChild(dauTl);
    var ds = el("ol", "dt-dong-ds");
    D.chatbot.forEach(function (c) {
      var li = el("li");
      var b = el("button", "dt-dong");
      b.type = "button";
      b.dataset.id = c.id;
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", "dt-dong-nam", String(c.nam)));
      b.appendChild(el("span", "dt-dong-ten", THEO_ID[c.id].ten));
      b.addEventListener("click", function () {
        if (S.da_kiem2) return;
        if (S.khoanh[c.id]) delete S.khoanh[c.id];
        else if (Object.keys(S.khoanh).length < 2) S.khoanh[c.id] = true;
        capNhat2();
      });
      li.appendChild(b);
      ds.appendChild(li);
    });
    tl.appendChild(ds);
    cs.appendChild(tl);
    san.appendChild(cs);

    var cta = el("div", "cta dt-cta");
    var kiem = el("button", "btn btn-yt", N.kiem2);
    kiem.type = "button";
    kiem.id = "dt-kiem2";
    kiem.addEventListener("click", kiemVong2);
    cta.appendChild(kiem);
    cta.appendChild(el("span", "dt-con muted"));
    san.appendChild(cta);
    capNhat2();
  }

  function capNhat2() {
    var n = Object.keys(S.khoanh).length;
    san.querySelectorAll(".dt-dong").forEach(function (b) {
      var on = !!S.khoanh[b.dataset.id];
      b.classList.toggle("is-khoanh", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.getElementById("dt-kiem2").disabled = n < 2;
    san.querySelector(".dt-con").textContent = f(N.da_chon, { n: n });
  }

  function kiemVong2() {
    S.da_kiem2 = true;
    S.dung2 = 0;
    D.chatbot.forEach(function (c) {
      var b = san.querySelector('.dt-dong[data-id="' + c.id + '"]');
      b.disabled = true;
      var on = !!S.khoanh[c.id];
      if (c.sai && on) S.dung2++;
      if (c.sai || on) {
        var nhan = c.sai ? (on ? N.bat_dung : N.bo_sot) : N.nham;
        b.classList.add(c.sai && on ? "is-dung" : "is-sai");
        var g = el("span", "dt-dong-giai");
        g.appendChild(el("b", null, nhan + (c.sai ? " · " + THEO_ID[c.id].nam : "")));
        if (c.giai) g.appendChild(el("span", null, c.giai));
        b.appendChild(g);
      }
    });
    var cta = san.querySelector(".dt-cta");
    cta.innerHTML = "";
    var xem = el("button", "btn btn-yt", N.xem_ket);
    xem.type = "button";
    xem.addEventListener("click", ketThuc);
    cta.appendChild(xem);
    xem.focus({ preventScroll: true });
    do_("dt-vong-2", { dung: String(S.dung2) });
  }

  function ketThuc() {
    san.hidden = true;
    ket.hidden = false;
    vongEl.textContent = "";
    var tong = S.dung1 + S.dung2;
    document.getElementById("dt-ket-so").textContent = tong + "/8";
    document.getElementById("dt-ket-hang").textContent = N.hang.filter(function (h) { return tong >= h[0]; })[0][1];
    document.getElementById("dt-ket-phu").textContent = f(N.ket_phu, { a: S.dung1, b: S.dung2 });
    ket.scrollIntoView({ behavior: "smooth", block: "start" });
    do_("dt-xong", { diem: String(tong) });
    do_("hoc-xong", { loai: "dong-thoi-gian-ai" });
  }

  ket.querySelectorAll("[data-so-video]").forEach(function (a) {
    a.addEventListener("click", function () { do_("dt-xem-video", { so: a.getAttribute("data-so-video") }); });
  });
  document.getElementById("dt-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
  batDau();
})();

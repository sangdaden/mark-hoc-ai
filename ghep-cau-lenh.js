/* Trò chơi "Thợ ghép câu lệnh" (tho-ghep-cau-lenh.html, en/): mỗi việc bắt đầu bằng một câu lệnh mơ hồ,
   người chơi chạm vào các mảnh (vai trò, bối cảnh, ví dụ, định dạng...) để ghép vào, rồi "gửi cho AI".
   Câu trả lời viết sẵn theo 3 mức trong data/ghep-cau-lenh.json: tot (đủ mọi mảnh cần), kha (đủ mảnh chính), tho (còn lại).
   Mảnh bẫy loại "nguoc" kéo câu trả lời xuống một mức; mọi mảnh bẫy trừ một sao.
   Dữ liệu: thẻ <script id="gh-du-lieu"> do scripts/tao_bai_viet.py tạo. Không gọi AI, không lưu gì ngoài vài sự kiện đếm (theo-doi.js).
   Chạy thử: ?do=thu, trạng thái ở window.__gh. */
(function () {
  "use strict";
  var nguon = document.getElementById("gh-du-lieu");
  var san = document.getElementById("gh-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, VIEC = D.viec, LOAI = D.loai;
  var tien = document.getElementById("gh-tien"), diemEl = document.getElementById("gh-diem"), ket = document.getElementById("gh-ket");
  var MUC = ["tho", "kha", "tot"];
  var S;

  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function anh(ten, w) {
    var i = el("img");
    i.src = D.p + "assets/" + ten; i.alt = ""; i.width = w; i.height = w;
    return i;
  }
  function nhanLoai(loai) {
    var l = LOAI[loai] || { ten: loai, mau: "#64748B" };
    var s = el("span", "gh-loai", l.ten);
    s.style.setProperty("--mau", l.mau);
    return s;
  }

  // xáo thứ tự mảnh cố định theo id việc, để mảnh bẫy không luôn nằm cuối mà lần chơi nào cũng giống nhau
  function xao(ds, hat) {
    var h = 0, i;
    for (i = 0; i < hat.length; i++) h = (h * 31 + hat.charCodeAt(i)) >>> 0;
    var a = ds.slice();
    for (i = a.length - 1; i > 0; i--) {
      h = (h * 1103515245 + 12345) >>> 0;
      var j = h % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function batDau() {
    S = { i: 0, sao: VIEC.map(function () { return null; }), bay: VIEC.map(function () { return 0; }), chon: {}, daGui: false };
    window.__gh = S;
    ket.hidden = true;
    san.hidden = false;
    ve();
  }

  function tongSao() { return S.sao.reduce(function (a, b) { return a + (b || 0); }, 0); }

  function cauLenh(c) {
    return [c.goc].concat(c.manh.filter(function (m) { return S.chon[m.id]; }).map(function (m) { return m.chu; })).join("\n");
  }

  function ve() {
    var c = VIEC[S.i];
    S.chon = {}; S.daGui = false;
    tien.textContent = N.viec + " " + (S.i + 1) + "/" + VIEC.length;
    diemEl.textContent = "★ " + tongSao() + "/" + VIEC.length * 3;
    san.innerHTML = "";
    var o = el("div", "gh-o");

    var trai = el("div", "gh-trai");
    var dau = el("div", "gh-viec-dau");
    var so = el("a", "gh-vid-so", "#" + c.video.so);
    so.href = c.video.url;
    so.title = c.video.ten;
    dau.appendChild(so);
    dau.appendChild(el("h2", "gh-viec-ten", c.ten));
    trai.appendChild(dau);

    var hop = el("div", "gh-lenh");
    hop.appendChild(el("p", "gh-lenh-nhan", N.cau_lenh));
    var ds = el("div", "gh-lenh-ds");
    ds.id = "gh-lenh-ds";
    hop.appendChild(ds);
    trai.appendChild(hop);

    var nut = el("div", "cta gh-nut");
    var gui = el("button", "btn btn-yt", N.gui + " ›");
    gui.type = "button"; gui.id = "gh-gui";
    gui.addEventListener("click", function () { guiAI(); });
    var chep = el("button", "btn", N.chep);
    chep.type = "button";
    chep.addEventListener("click", function () { chepChu(cauLenh(c), chep); do_("ghep-chep", { viec: c.id }); });
    nut.appendChild(gui); nut.appendChild(chep);

    trai.appendChild(el("p", "gh-khay-nhan", N.manh));
    trai.appendChild(el("p", "gh-huong", N.huong));
    var khay = el("div", "gh-khay");
    xao(c.manh, c.id).forEach(function (m) {
      var b = el("button", "gh-manh");
      b.type = "button";
      b.dataset.id = m.id;
      b.setAttribute("aria-pressed", "false");
      b.style.setProperty("--mau", (LOAI[m.loai] || {}).mau || "#64748B");
      b.appendChild(nhanLoai(m.loai));
      b.appendChild(el("span", "gh-manh-chu", m.chu));
      b.addEventListener("click", function () {
        S.chon[m.id] = !S.chon[m.id];
        b.setAttribute("aria-pressed", S.chon[m.id] ? "true" : "false");
        veLenh(c);
        // đã gửi rồi mà sửa mảnh: làm mờ câu trả lời cũ cho tới khi gửi lại
        if (S.daGui) document.getElementById("gh-ben").classList.add("is-cu");
      });
      khay.appendChild(b);
    });
    trai.appendChild(khay);
    trai.appendChild(nut); // nút gửi nằm dưới khay: ghép xong là bấm, không phải cuộn ngược lên
    o.appendChild(trai);

    var ben = el("div", "gh-ben");
    ben.id = "gh-ben";
    var cho = el("div", "gh-cho");
    cho.appendChild(anh("bit-y-tuong.svg", 88));
    cho.appendChild(el("p", null, N.huong));
    ben.appendChild(cho);
    o.appendChild(ben);

    san.appendChild(o);
    veLenh(c);
    if (S.i === 0) do_("ghep-bat-dau");
  }

  function veLenh(c) {
    var ds = document.getElementById("gh-lenh-ds");
    ds.innerHTML = "";
    var goc = el("p", "gh-dong gh-dong-goc");
    goc.appendChild(el("span", "gh-loai gh-loai-goc", N.goc));
    goc.appendChild(el("span", "gh-dong-chu", c.goc));
    ds.appendChild(goc);
    var co = c.manh.filter(function (m) { return S.chon[m.id]; });
    co.forEach(function (m) {
      var d = el("p", "gh-dong");
      d.style.setProperty("--mau", (LOAI[m.loai] || {}).mau || "#64748B");
      d.appendChild(nhanLoai(m.loai));
      d.appendChild(el("span", "gh-dong-chu", m.chu));
      ds.appendChild(d);
    });
    if (!co.length) ds.appendChild(el("p", "gh-trong", N.trong));
  }

  // chấm: tot nếu đủ mọi mảnh cần; kha nếu đủ mảnh chính; còn lại tho. Bẫy "nguoc" kéo xuống một mức.
  function cham(c) {
    var can = c.manh.filter(function (m) { return m.can; });
    var du = can.every(function (m) { return S.chon[m.id]; });
    var chinh = can.filter(function (m) { return m.chinh; }).every(function (m) { return S.chon[m.id]; });
    var muc = du ? 2 : chinh ? 1 : 0;
    var bay = c.manh.filter(function (m) { return m.bay && S.chon[m.id]; });
    if (bay.some(function (m) { return m.bay === "nguoc"; })) muc = Math.max(0, muc - 1);
    var sao = Math.max(1, muc + 1 - (bay.length ? 1 : 0));
    return { muc: muc, sao: sao, bay: bay, can: can };
  }

  function guiAI() {
    var c = VIEC[S.i];
    var k = cham(c);
    S.sao[S.i] = k.sao;
    S.bay[S.i] = k.bay.length;
    S.daGui = true;
    diemEl.textContent = "★ " + tongSao() + "/" + VIEC.length * 3;
    var ben = document.getElementById("gh-ben");
    ben.innerHTML = "";
    ben.classList.remove("is-cu");

    var tl = el("div", "gh-tl gh-muc-" + MUC[k.muc]);
    var dau = el("div", "gh-tl-dau");
    dau.appendChild(el("span", "gh-tl-ai", N.ai));
    dau.appendChild(el("span", "gh-tl-muc", N.muc[MUC[k.muc]]));
    tl.appendChild(dau);
    if (k.bay.some(function (m) { return m.bay === "lo-du-lieu"; })) tl.appendChild(el("p", "gh-canh-bao", N.canh_bao));
    else if (k.bay.some(function (m) { return m.bay === "nguy"; })) tl.appendChild(el("p", "gh-canh-bao", N.canh_bao_nguy));
    var than = el("div", "gh-tl-than");
    veChu(than, c.tra_loi[MUC[k.muc]]);
    tl.appendChild(than);
    if (k.muc === 0 && c.sai_khi_tho) tl.appendChild(el("p", "gh-canh-bao", c.sai_khi_tho));
    ben.appendChild(tl);

    var ph = el("div", "gh-ph");
    ph.appendChild(anh(k.sao === 3 ? "bit-vui.svg" : k.sao === 2 ? "bit-giai-thich.svg" : "bit-sai-roi.svg", 64));
    var chu = el("div");
    var sao = el("p", "gh-sao");
    sao.setAttribute("aria-label", k.sao + "/3 " + N.sao);
    sao.textContent = "★★★".slice(0, k.sao) + "☆☆☆".slice(0, 3 - k.sao);
    chu.appendChild(sao);
    var dung = c.manh.filter(function (m) { return S.chon[m.id] && !m.bay; });
    var thieu = k.can.filter(function (m) { return !S.chon[m.id]; });
    nhom(chu, N.co, dung, "is-co", function (m) { return m.giai; });
    nhom(chu, N.thieu, thieu, "is-thieu", function (m) { return m.giai; });
    nhom(chu, N.bay, k.bay, "is-bay", function (m) { return N.bay_loai[m.bay] + ": " + m.giai; });
    ph.appendChild(chu);
    ben.appendChild(ph);

    var nut = el("div", "cta gh-sau");
    var tiep = el("button", "btn btn-yt", S.i + 1 < VIEC.length ? N.tiep + " ›" : N.xem_ket);
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (S.i + 1 < VIEC.length) { S.i++; ve(); san.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else ketThuc();
    });
    var sua = el("button", "btn", N.sua);
    sua.type = "button";
    sua.addEventListener("click", function () {
      var dau = san.querySelector(".gh-manh");
      if (dau) { dau.scrollIntoView({ behavior: "smooth", block: "center" }); dau.focus({ preventScroll: true }); }
    });
    var xem = el("a", "btn", N.xem_video + " #" + c.video.so);
    xem.href = c.video.url;
    xem.addEventListener("click", function () { do_("ghep-xem-video", { so: String(c.video.so) }); });
    nut.appendChild(tiep); nut.appendChild(sua); nut.appendChild(xem);
    ben.appendChild(nut);
    if (window.matchMedia && window.matchMedia("(max-width: 860px)").matches) ben.scrollIntoView({ behavior: "smooth", block: "start" });
    do_("ghep-gui", { viec: c.id, muc: MUC[k.muc] });
  }

  function nhom(cha, tieuDe, ds, cls, giai) {
    if (!ds.length) return;
    cha.appendChild(el("p", "gh-nhom-h " + cls, tieuDe));
    var ul = el("ul", "gh-ds " + cls);
    ds.forEach(function (m) {
      var li = el("li");
      li.appendChild(nhanLoai(m.loai));
      li.appendChild(el("span", null, giai(m)));
      ul.appendChild(li);
    });
    cha.appendChild(ul);
  }

  // chữ trả lời: dòng "| " là hàng bảng (hàng đầu là tiêu đề), "- " là gạch đầu dòng, **chữ** là in đậm
  function dam(cha, chu) {
    chu.split("**").forEach(function (phan, i) {
      if (!phan) return;
      cha.appendChild(i % 2 ? el("strong", null, phan) : document.createTextNode(phan));
    });
  }
  function veChu(cha, chu) {
    var dong = chu.split("\n"), i = 0;
    while (i < dong.length) {
      var d = dong[i];
      if (d.indexOf("| ") === 0) {
        var bao = el("div", "gh-bang-bao");
        var bang = el("table", "gh-bang");
        var dau = true;
        while (i < dong.length && dong[i].indexOf("| ") === 0) {
          var tr = el("tr");
          dong[i].slice(2).split(" | ").forEach(function (o) { var td = el(dau ? "th" : "td"); dam(td, o); tr.appendChild(td); });
          bang.appendChild(tr); dau = false; i++;
        }
        bao.appendChild(bang);
        cha.appendChild(bao);
      } else if (d.indexOf("- ") === 0) {
        var ul = el("ul");
        while (i < dong.length && dong[i].indexOf("- ") === 0) { var li = el("li"); dam(li, dong[i].slice(2)); ul.appendChild(li); i++; }
        cha.appendChild(ul);
      } else {
        var p = el("p"); dam(p, d); cha.appendChild(p); i++;
      }
    }
  }

  function chepChu(chu, nut) {
    var xong = function () { var cu = nut.textContent; nut.textContent = N.da_chep; setTimeout(function () { nut.textContent = cu; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(chu).then(xong, function () { chepCu(chu); xong(); });
    } else { chepCu(chu); xong(); }
  }
  function chepCu(chu) {
    var ta = el("textarea");
    ta.value = chu; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* không chép được thì thôi */ }
    document.body.removeChild(ta);
  }

  function ketThuc() {
    san.hidden = true;
    ket.hidden = false;
    tien.textContent = "";
    diemEl.textContent = "";
    var tong = tongSao(), toiDa = VIEC.length * 3;
    document.getElementById("gh-ket-so").textContent = tong + "/" + toiDa;
    document.getElementById("gh-ket-hang").textContent = "★ " + N.hang.filter(function (h) { return tong >= h[0]; })[0][1];
    var tongBay = VIEC.reduce(function (a, c) { return a + c.manh.filter(function (m) { return m.bay; }).length; }, 0);
    var dinh = S.bay.reduce(function (a, b) { return a + b; }, 0);
    document.getElementById("gh-ket-phu").textContent = N.phu + " " + (tongBay - dinh) + "/" + tongBay;

    var h = document.getElementById("gh-ket-h"), box = document.getElementById("gh-ket-video");
    box.innerHTML = "";
    var yeu = VIEC.filter(function (c, i) { return (S.sao[i] || 0) < 3; });
    h.textContent = yeu.length ? N.on_lai : N.het;
    yeu.forEach(function (c) {
      var a = el("a", "gh-vid");
      a.href = c.video.url;
      a.appendChild(el("span", "gh-vid-so", "#" + c.video.so));
      a.appendChild(el("b", null, c.video.ten));
      box.appendChild(a);
    });

    var mau = document.getElementById("gh-mau");
    mau.innerHTML = "";
    mau.appendChild(el("h2", "gh-mau-h", N.mau_h));
    mau.appendChild(el("p", "gh-mau-lead", N.mau_lead));
    var the = el("div", "gh-lenh gh-mau-the");
    D.mau.dong.forEach(function (d) {
      var p = el("p", "gh-dong");
      p.style.setProperty("--mau", (LOAI[d.loai] || {}).mau || "#64748B");
      p.appendChild(nhanLoai(d.loai));
      p.appendChild(el("span", "gh-dong-chu", d.chu));
      the.appendChild(p);
    });
    mau.appendChild(the);
    var nut = el("div", "cta");
    var chep = el("button", "btn btn-yt", N.chep);
    chep.type = "button";
    chep.addEventListener("click", function () { chepChu(D.mau.dong.map(function (d) { return d.chu; }).join("\n"), chep); do_("ghep-chep", { viec: "mau" }); });
    var xem = el("a", "btn", N.xem_video + " #" + D.mau.video.so);
    xem.href = D.mau.video.url;
    nut.appendChild(chep); nut.appendChild(xem);
    mau.appendChild(nut);

    ket.scrollIntoView({ behavior: "smooth", block: "start" });
    do_("ghep-xong", { sao: String(tong) });
    do_("hoc-xong", { loai: "ghep-cau-lenh" });
  }

  document.getElementById("gh-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
  batDau();
})();

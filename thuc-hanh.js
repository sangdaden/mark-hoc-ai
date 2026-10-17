/* Khung chung cho các trang thực hành theo đối tượng (ai-hoc-sinh.html, ai-van-phong.html, en/...).
   Trang do scripts/trang/thuc-hanh.py tạo từ data/thuc-hanh/<trang>.json; mỗi trạm là một <section class="bn-tram" data-loai=...>
   và dữ liệu của nó nằm trong thẻ <script id="th-du-lieu">. Chín kiểu trạm:
     phan-loai  chạm thẻ rồi chạm rổ (2-3 rổ), Bit nhận xét từng thẻ
     bo-phieu   từng câu một, bỏ phiếu (vd. Thật / Bịa), lật đáp án và lời giải
     ghep       ghép mảnh câu lệnh rồi Gửi cho AI, câu trả lời viết sẵn 3 mức (cùng giao diện Thợ ghép câu lệnh)
     chat       trò chuyện rẽ nhánh: chọn câu nói tiếp, cuối mỗi nhánh có bài học
     tim-loi    chạm vào câu sai trong một văn bản (kiểu giấy tờ, bài đăng mạng xã hội...)
     sua-loi    như tim-loi nhưng chạm vào câu sai thì chọn cách sửa đúng trong vài lựa chọn
     chon-ban   đọc văn bản gốc rồi chọn bản tóm tắt trung thực nhất
     giong      cùng một nội dung, chuyển giữa các giọng văn để so
     ke-hoach   lập kế hoạch ôn thi theo số tuần, môn, giờ mỗi ngày; ra bảng và câu lệnh để nhờ AI chỉnh
   Mở thẳng một trạm bằng ?tram=<id> hoặc #<id>. Không gọi AI thật, không gửi gì đi; chỉ đếm sự kiện chọn trạm (theo-doi.js). */
(function () {
  "use strict";
  var goc = document.getElementById("th"), nguon = document.getElementById("th-du-lieu");
  if (!goc || !nguon) return;
  var D = JSON.parse(nguon.textContent), N = D.nhan;
  var S = window.__th = {};
  var MUOT = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, chu) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function nut(cls, chu) { var b = el("button", cls, chu); b.type = "button"; return b; }
  function thay(s, d) { return s.replace(/\{(\w+)\}/g, function (_, k) { return d[k]; }); }
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
  function cuon(e) { try { e.scrollIntoView({ behavior: MUOT ? "smooth" : "auto", block: "nearest" }); } catch (x) {} }
  // chữ có **đậm**, dòng "- " là gạch đầu dòng, dòng "| a | b" là hàng bảng
  function dam(cha, chu) { String(chu).split("**").forEach(function (p, i) { cha.appendChild(i % 2 ? el("strong", null, p) : document.createTextNode(p)); }); }
  function veChu(cha, chu) {
    var ul = null, bang = null;
    String(chu).split("\n").forEach(function (d) {
      if (d.indexOf("| ") === 0) {
        if (!bang) { var bao = el("div", "gh-bang-bao"); bang = el("table", "gh-bang"); bao.appendChild(bang); cha.appendChild(bao); }
        var tr = el("tr");
        d.slice(2).split(" | ").forEach(function (x) { var c = el(bang.rows.length ? "td" : "th"); dam(c, x.trim()); tr.appendChild(c); });
        bang.appendChild(tr); ul = null; return;
      }
      bang = null;
      if (d.indexOf("- ") === 0) { if (!ul) { ul = el("ul"); cha.appendChild(ul); } var li = el("li"); dam(li, d.slice(2)); ul.appendChild(li); return; }
      ul = null; var p = el("p"); dam(p, d); cha.appendChild(p);
    });
  }
  // lời Bit: loai "" | "dung" | "sai"
  function bit(hop, chu, loai) {
    if (!chu) { hop.hidden = true; hop.textContent = ""; return; }
    hop.className = "th-bit" + (loai ? " is-" + loai : "");
    hop.textContent = "";
    var anh = el("img"); anh.alt = ""; anh.width = 44; anh.height = 44;
    anh.src = D.p + "assets/" + (loai === "sai" ? "bit-sai-roi" : loai === "dung" ? "bit-vui" : "bit-giai-thich") + ".svg";
    hop.appendChild(anh);
    var o = el("div");
    (Array.isArray(chu) ? chu : [chu]).forEach(function (x) { if (x && x.nodeType) o.appendChild(x); else { var p = el("p"); dam(p, x); o.appendChild(p); } });
    hop.appendChild(o);
    hop.hidden = false;
  }
  function hopBit(cha) { var h = el("div", "th-bit"); h.setAttribute("aria-live", "polite"); h.hidden = true; cha.appendChild(h); return h; }
  function hang(cha) { var h = el("div", "th-hang"); cha.appendChild(h); return h; }
  function chep(chu, b) {
    function xong(ok) { if (!b._goc) b._goc = b.textContent; b.textContent = ok ? N.da_chep : N.khong_chep; clearTimeout(b._h); b._h = setTimeout(function () { b.textContent = b._goc; }, 2000); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(chu).then(function () { xong(true); }, function () { xong(false); });
    else { var t = el("textarea"); t.value = chu; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); xong(ok); }
  }

  // ---------- chọn trạm (cột trái .bn-ngan) ----------
  var nutTram = [].slice.call(goc.querySelectorAll("[data-tram]"));
  function moTram(id, bam) {
    if (!$("tram-" + id)) id = D.tram[0].id;
    [].slice.call(goc.querySelectorAll(".th-tram")).forEach(function (s) { s.hidden = s.id !== "tram-" + id; });
    nutTram.forEach(function (n) { n.setAttribute("aria-current", n.dataset.tram === id ? "true" : "false"); });
    if (bam) {
      try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
      do_(D.trang + "-tram", { tram: id });
    }
  }
  nutTram.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });

  // ================= phan-loai =================
  function phanLoai(cha, t) {
    var chon = null, xong = {}, dung = 0;
    var dem = el("p", "th-dem"); cha.appendChild(dem);
    var ds = el("div", "th-phan-the"); ds.setAttribute("role", "group"); ds.setAttribute("aria-label", N.the); cha.appendChild(ds);
    var ro = el("div", "th-ro-hang th-ro-" + t.ro.length); cha.appendChild(ro);
    var b = hopBit(cha), h = hang(cha), lai = nut("btn btn-nhe", "↺ " + N.lam_lai); h.appendChild(lai);
    var the = t.the.map(function (x, i) {
      var n = nut("th-the", x.chu); n.dataset.i = i; n.setAttribute("aria-pressed", "false");
      n.addEventListener("click", function () {
        if (xong[i] != null) return;
        chon = chon === i ? null : i;
        the.forEach(function (m, k) { m.setAttribute("aria-pressed", String(k === chon)); });
        bit(b, chon == null ? "" : N.chon_ro);
      });
      ds.appendChild(n); return n;
    });
    var nutRo = t.ro.map(function (r) {
      var n = nut("th-ro"); n.style.setProperty("--mau", r.mau || "#8B5CF6");
      n.appendChild(el("span", "th-ro-bt", r.bieu_tuong)); n.appendChild(el("b", null, r.ten)); var c = el("span", "th-ro-dem", "0"); n.appendChild(c);
      n.addEventListener("click", function () {
        if (chon == null) { bit(b, N.chon_the); return; }
        var x = t.the[chon], ok = x.dung === r.id;
        xong[chon] = r.id; if (ok) dung++;
        var m = the[chon]; m.classList.add(ok ? "is-dung" : "is-sai"); m.setAttribute("aria-pressed", "false"); m.disabled = true;
        m.appendChild(el("small", "th-the-ro", (ok ? "✓ " : "✗ " + N.dung_la + " ") + t.ro.filter(function (q) { return q.id === x.dung; })[0].ten));
        c.textContent = +c.textContent + 1;
        chon = null;
        var het = Object.keys(xong).length === t.the.length;
        bit(b, het ? [(ok ? "✓ " : "✗ ") + x.giai, thay(N.phan_xong, { n: dung, tong: t.the.length }) + (t.bai_hoc ? " " + t.bai_hoc : "")] : (ok ? "✓ " : "✗ ") + x.giai, ok ? "dung" : "sai");
        veDem();
      });
      ro.appendChild(n); return n;
    });
    function veDem() { dem.textContent = thay(N.phan_dem, { n: Object.keys(xong).length, tong: t.the.length, d: dung }); }
    lai.addEventListener("click", function () { chon = null; xong = {}; dung = 0; cha.textContent = ""; phanLoai(cha, t); });
    veDem(); void nutRo;
  }

  // ================= bo-phieu =================
  function boPhieu(cha, t) {
    var i = 0, diem = 0;
    var dem = el("p", "th-dem"); cha.appendChild(dem);
    var the = el("div", "th-phieu"); cha.appendChild(the);
    var h = el("div", "th-phieu-nut"); cha.appendChild(h);
    var b = hopBit(cha), h2 = hang(cha), tiep = nut("btn btn-chinh", N.tiep + " ›"); tiep.hidden = true; h2.appendChild(tiep);
    var lai = nut("btn btn-nhe", "↺ " + N.lam_lai); lai.hidden = true; h2.appendChild(lai);
    var cac = t.lua_chon.map(function (l) {
      var n = nut("th-phieu-chon", ""); n.appendChild(el("span", null, l.bieu_tuong)); n.appendChild(document.createTextNode(l.ten)); n.dataset.id = l.id;
      n.addEventListener("click", function () { tra(l.id); }); h.appendChild(n); return n;
    });
    function ve() {
      var c = t.cau[i]; the.textContent = "";
      the.appendChild(el("p", "th-phieu-ai", N.ai_noi));
      var p = el("p", "th-phieu-chu"); dam(p, c.chu); the.appendChild(p);
      cac.forEach(function (n) { n.disabled = false; n.className = "th-phieu-chon"; });
      dem.textContent = thay(N.phieu_dem, { n: i + 1, tong: t.cau.length, d: diem });
      bit(b, ""); tiep.hidden = true;
    }
    function tra(id) {
      var c = t.cau[i], ok = id === c.dap;
      if (ok) diem++;
      cac.forEach(function (n) { n.disabled = true; if (n.dataset.id === c.dap) n.classList.add("is-dung"); else if (n.dataset.id === id) n.classList.add("is-sai"); });
      var cuoi = i === t.cau.length - 1;
      bit(b, cuoi ? [(ok ? N.dung_roi : N.chua_dung) + " " + c.giai, thay(N.phieu_xong, { d: diem, tong: t.cau.length }) + (t.bai_hoc ? " " + t.bai_hoc : "")] : (ok ? N.dung_roi : N.chua_dung) + " " + c.giai, ok ? "dung" : "sai");
      dem.textContent = thay(N.phieu_dem, { n: i + 1, tong: t.cau.length, d: diem });
      tiep.hidden = cuoi; lai.hidden = !cuoi;
      if (!cuoi) tiep.focus({ preventScroll: true });
    }
    tiep.addEventListener("click", function () { i++; ve(); });
    lai.addEventListener("click", function () { i = 0; diem = 0; lai.hidden = true; ve(); });
    ve();
  }

  // ================= ghep (giống Thợ ghép câu lệnh) =================
  var THU_TU = ["vai_tro", "boi_canh", "viec", "dinh_dang", "gioi_han"];
  function ghep(cha, t) {
    var mau = null, chonM = {}, daGui = false;
    var tiles = el("div", "th-chon-viec"); tiles.setAttribute("role", "group"); tiles.setAttribute("aria-label", N.chon_viec); cha.appendChild(tiles);
    var lenh = el("div", "gh-lenh"); lenh.appendChild(el("p", "gh-lenh-nhan", N.cau_lenh)); var ds = el("div", "gh-lenh-ds"); ds.setAttribute("aria-live", "polite"); lenh.appendChild(ds); cha.appendChild(lenh);
    cha.appendChild(el("p", "gh-khay-nhan", N.manh));
    var khay = el("div", "gh-khay"); cha.appendChild(khay);
    var h = hang(cha), gui = nut("btn btn-chinh", N.gui + " ›"), cp = nut("btn btn-chinh", N.chep_lenh), lai = nut("btn btn-nhe", "↺ " + N.ghep_lai);
    h.appendChild(gui); h.appendChild(cp); h.appendChild(lai);
    var ben = el("div", "gh-ben th-gh-ben"); cha.appendChild(ben);
    var tl = el("div"); tl.hidden = true; ben.appendChild(tl);
    var b = hopBit(ben);
    function nhan(loai) { var l = t.loai_manh[loai], s = el("span", "gh-loai", l.ten); s.style.setProperty("--mau", l.mau); return s; }
    function manh() {
      return t.khay.map(function (k) {
        if (k.indexOf("bay:") === 0) { var x = t.bay.filter(function (y) { return y.id === k.slice(4); })[0]; return { id: k, loai: x.loai, chu: x.chu, bay: x }; }
        return { id: k, loai: k, chu: mau.manh[k] };
      });
    }
    function dangChon() { return manh().filter(function (x) { return chonM[x.id]; }).sort(function (a, c) { return THU_TU.indexOf(a.loai) - THU_TU.indexOf(c.loai); }); }
    function veLenh(vua) {
      var co = dangChon(); ds.textContent = "";
      var g = el("p", "gh-dong gh-dong-goc"); g.appendChild(el("span", "gh-loai gh-loai-goc", N.cau_goc)); g.appendChild(el("span", "gh-dong-chu", mau.goc)); ds.appendChild(g);
      co.forEach(function (x) { var d = el("p", "gh-dong"); d.style.setProperty("--mau", t.loai_manh[x.loai].mau); d.appendChild(nhan(x.loai)); d.appendChild(el("span", "gh-dong-chu", x.chu)); ds.appendChild(d); });
      if (!co.length) ds.appendChild(el("p", "gh-trong", N.lenh_trong));
      var bay = co.filter(function (x) { return x.bay && x.bay.muc === "sai"; }), can = co.filter(function (x) { return !x.bay; }).length;
      cp.disabled = !!bay.length;
      if (vua && vua.bay) bit(b, vua.bay.bit, vua.bay.muc);
      else if (bay.length) bit(b, N.lenh_khoa, "sai");
      else bit(b, can === 5 ? N.lenh_du : can ? thay(N.lenh_dem, { n: can }) : N.lenh_bat_dau, can === 5 ? "dung" : "");
      S[t.id] = co.filter(function (x) { return !x.bay || !x.bay.muc; }).map(function (x) { return x.chu; }).join("\n") || mau.goc;
    }
    function chonMau(i) {
      mau = t.viec[i]; chonM = {}; daGui = false; tl.hidden = true; ben.classList.remove("is-cu");
      [].slice.call(tiles.children).forEach(function (n, k) { n.setAttribute("aria-pressed", String(k === i)); });
      khay.textContent = "";
      manh().forEach(function (x) {
        var n = nut("gh-manh"); n.setAttribute("aria-pressed", "false"); n.style.setProperty("--mau", t.loai_manh[x.loai].mau);
        n.appendChild(nhan(x.loai)); n.appendChild(el("span", "gh-manh-chu", x.chu));
        n.addEventListener("click", function () { chonM[x.id] = !chonM[x.id]; n.setAttribute("aria-pressed", String(!!chonM[x.id])); veLenh(chonM[x.id] ? x : null); if (daGui) ben.classList.add("is-cu"); });
        khay.appendChild(n);
      });
      veLenh(null);
    }
    t.viec.forEach(function (v, i) {
      var n = nut("th-tile"); n.setAttribute("aria-pressed", "false"); n.appendChild(el("span", null, v.bieu_tuong)); n.appendChild(document.createTextNode(v.ten));
      n.addEventListener("click", function () { chonMau(i); }); tiles.appendChild(n);
    });
    gui.addEventListener("click", function () {
      var co = dangChon(), can = co.filter(function (x) { return !x.bay; }).map(function (x) { return x.loai; });
      var muc = can.length === 5 ? "tot" : (can.indexOf("viec") >= 0 && can.indexOf("boi_canh") >= 0 ? "kha" : "tho");
      var bay = co.filter(function (x) { return x.bay && x.bay.muc === "sai"; });
      tl.textContent = ""; tl.className = "gh-tl gh-muc-" + muc;
      var dau = el("div", "gh-tl-dau"); dau.appendChild(el("span", "gh-tl-ai", N.ai_tra_loi)); dau.appendChild(el("span", "gh-tl-muc", N.muc[muc])); tl.appendChild(dau);
      bay.filter(function (x) { return x.bay.canh_truoc; }).forEach(function (x) { tl.appendChild(el("p", "gh-canh-bao", x.bay.canh_truoc)); });
      var than = el("div", "gh-tl-than"); veChu(than, mau.tra_loi[muc] + bay.filter(function (x) { return x.bay.them; }).map(function (x) { return "\n" + x.bay.them; }).join("")); tl.appendChild(than);
      bay.filter(function (x) { return x.bay.canh_sau; }).forEach(function (x) { tl.appendChild(el("p", "gh-canh-bao", x.bay.canh_sau)); });
      tl.hidden = false; ben.classList.remove("is-cu"); daGui = true;
      bit(b, bay.length ? N.lenh_khoa : N["gui_" + muc], bay.length ? "sai" : (muc === "tot" ? "dung" : ""));
      cuon(tl); do_(D.trang + "-gui", { muc: muc });
    });
    cp.addEventListener("click", function () { chep(S[t.id], cp); });
    lai.addEventListener("click", function () { chonMau(t.viec.indexOf(mau)); });
    chonMau(0);
  }

  // ================= chat rẽ nhánh =================
  function chat(cha, t) {
    var khung = el("div", "th-chat"); khung.setAttribute("aria-live", "polite"); cha.appendChild(khung);
    var lua = el("div", "th-chat-chon"); cha.appendChild(lua);
    var b = hopBit(cha), h = hang(cha), lai = nut("btn btn-nhe", "↺ " + N.lam_lai); lai.hidden = true; h.appendChild(lai);
    var nut_ = {}; t.nut.forEach(function (n) { nut_[n.id] = n; });
    function bong(ai, chu) {
      var d = el("div", "th-bong " + (ai ? "is-ai" : "is-ban"));
      d.appendChild(el("span", "th-bong-ten", ai ? (t.ten_ai || N.ten_ai) : (t.ten_ban || N.ten_ban)));
      var o = el("div", "th-bong-chu"); veChu(o, chu); d.appendChild(o); khung.appendChild(d); cuon(d);
    }
    function den(id) {
      var n = nut_[id]; lua.textContent = "";
      if (n.ai) bong(true, n.ai);
      if (n.ket) { bit(b, n.ket, n.muc || ""); lai.hidden = false; do_(D.trang + "-chat", { ket: id }); return; }
      n.chon.forEach(function (c) {
        var x = nut("th-chat-nut", c.chu);
        x.addEventListener("click", function () { bong(false, c.chu); if (c.bit) bit(b, c.bit, c.muc || ""); else bit(b, ""); den(c.toi); });
        lua.appendChild(x);
      });
    }
    lai.addEventListener("click", function () { khung.textContent = ""; bit(b, ""); lai.hidden = true; if (t.mo_dau) bong(true, t.mo_dau); den(t.bat_dau); });
    if (t.mo_dau) bong(true, t.mo_dau);
    den(t.bat_dau);
  }

  // ================= tim-loi / sua-loi =================
  function timLoi(cha, t, sua) {
    var tong = t.doan.filter(function (x) { return x.loi; }).length, tim = {};
    var giay = el("div", "th-van th-van-" + (t.kieu || "giay"));
    if (t.dau) { var dau = el("div", "th-van-dau"); veChu(dau, t.dau); giay.appendChild(dau); }
    var than = el("div", "th-van-than"); giay.appendChild(than); cha.appendChild(giay);
    var dem = el("p", "th-dem"); cha.insertBefore(dem, giay);
    var sua_ = el("div", "th-sua"); sua_.hidden = true; cha.appendChild(sua_);
    var b = hopBit(cha), h = hang(cha), dap = nut("btn btn-nhe", N.hien_dap_an), lai = nut("btn btn-nhe", "↺ " + N.lam_lai);
    h.appendChild(dap); h.appendChild(lai);
    var cau = t.doan.map(function (x, k) {
      if (x.xuong_dong) than.appendChild(el("br"));
      var c = nut("th-cau", x.chu); c.dataset.k = k; than.appendChild(c); than.appendChild(document.createTextNode(" ")); return c;
    });
    function veDem() { dem.textContent = thay(N.tim_dem, { n: Object.keys(tim).length, tong: tong }); }
    function xong(c, x) {
      tim[c.dataset.k] = 1; c.classList.add("is-loi"); c.setAttribute("aria-pressed", "true"); veDem();
      return Object.keys(tim).length === tong;
    }
    function hetLoi(x) { bit(b, [x, thay(N.tim_het, { tong: tong }) + (t.bai_hoc ? " " + t.bai_hoc : "")], "dung"); }
    cau.forEach(function (c) {
      c.addEventListener("click", function () {
        var x = t.doan[c.dataset.k];
        if (tim[c.dataset.k]) return;
        if (!x.loi) { c.classList.add("is-ok"); bit(b, x.bit || N.cau_on); return; }
        if (!sua) { if (xong(c, x)) hetLoi(x.bit); else bit(b, x.bit + " " + thay(N.tim_dem, { n: Object.keys(tim).length, tong: tong })); return; }
        // sua-loi: chọn cách sửa
        sua_.textContent = ""; sua_.hidden = false;
        sua_.appendChild(el("p", "th-sua-h", N.sua_hoi));
        var q = el("p", "th-sua-goc"); q.textContent = "“" + x.chu + "”"; sua_.appendChild(q);
        // xoay thứ tự lựa chọn theo vị trí câu, để đáp án đúng không luôn nằm đầu
        var n = x.lua_chon.length, lech = (+c.dataset.k) % n;
        x.lua_chon.map(function (_, j) { return (j + lech) % n; }).forEach(function (i) {
          var l = x.lua_chon[i], o = nut("th-sua-chon", l);
          o.addEventListener("click", function () {
            if (i !== x.dung) { o.classList.add("is-sai"); o.disabled = true; bit(b, x.sai || N.sua_sai, "sai"); return; }
            c.textContent = x.lua_chon[x.dung]; c.classList.add("is-sua");
            sua_.hidden = true;
            if (xong(c, x)) hetLoi(x.bit); else bit(b, "✓ " + x.bit + " " + thay(N.tim_dem, { n: Object.keys(tim).length, tong: tong }), "dung");
          });
          sua_.appendChild(o);
        });
        bit(b, ""); cuon(sua_);
      });
    });
    dap.addEventListener("click", function () {
      cau.forEach(function (c) { var x = t.doan[c.dataset.k]; if (x.loi && !tim[c.dataset.k]) { if (sua) { c.textContent = x.lua_chon[x.dung]; c.classList.add("is-sua"); } xong(c, x); } });
      sua_.hidden = true; bit(b, thay(N.tim_het, { tong: tong }) + (t.bai_hoc ? " " + t.bai_hoc : ""), "dung");
    });
    lai.addEventListener("click", function () { cha.textContent = ""; timLoi(cha, t, sua); });
    veDem();
  }

  // ================= chon-ban =================
  function chonBan(cha, t) {
    var g = el("div", "th-van th-van-giay"); var dau = el("p", "th-van-nhan", t.nhan_goc || N.van_goc); g.appendChild(dau);
    var than = el("div", "th-van-than"); veChu(than, t.goc); g.appendChild(than); cha.appendChild(g);
    cha.appendChild(el("p", "gh-khay-nhan", t.hoi || N.chon_ban_hoi));
    var ds = el("div", "th-ban-ds"); cha.appendChild(ds);
    var b = hopBit(cha), da = false;
    t.ban.forEach(function (x, i) {
      var n = nut("th-ban"); n.appendChild(el("span", "th-ban-so", String.fromCharCode(65 + i)));
      var o = el("div", "th-ban-chu"); veChu(o, x.chu); n.appendChild(o);
      n.addEventListener("click", function () {
        [].slice.call(ds.children).forEach(function (m, k) {
          var y = t.ban[k]; m.classList.toggle("is-dung", y.dung); m.classList.toggle("is-sai", !y.dung && k === i);
          var cu = m.querySelector(".th-ban-giai"); if (cu) cu.remove();
          var gi = el("p", "th-ban-giai", (y.dung ? "✓ " : "✗ ") + y.giai); m.appendChild(gi);
        });
        bit(b, (x.dung ? N.dung_roi : N.chua_dung) + " " + (t.bai_hoc || ""), x.dung ? "dung" : "sai");
        if (!da) { da = true; do_(D.trang + "-chon-ban", { dung: !!x.dung }); }
      });
      ds.appendChild(n);
    });
  }

  // ================= giong =================
  function giong(cha, t) {
    var g = el("div", "th-van th-van-giay th-van-nho"); g.appendChild(el("p", "th-van-nhan", t.nhan_goc || N.ban_nhap));
    var gt = el("div", "th-van-than"); veChu(gt, t.goc); g.appendChild(gt); cha.appendChild(g);
    var ds = el("div", "th-chon-viec"); ds.setAttribute("role", "group"); ds.setAttribute("aria-label", N.chon_giong); cha.appendChild(ds);
    var ra = el("div", "gh-tl gh-muc-tot th-giong-ra"); ra.setAttribute("aria-live", "polite"); cha.appendChild(ra);
    var b = hopBit(cha), h = hang(cha), cp = nut("btn btn-chinh", N.chep_ban); h.appendChild(cp);
    var cur = 0;
    function chon(i) {
      cur = i; var x = t.giong[i];
      [].slice.call(ds.children).forEach(function (n, k) { n.setAttribute("aria-pressed", String(k === i)); });
      ra.textContent = ""; var dau = el("div", "gh-tl-dau"); dau.appendChild(el("span", "gh-tl-ai", N.ai_viet_lai)); var m = el("span", "gh-tl-muc", x.ten); dau.appendChild(m); ra.appendChild(dau);
      ra.className = "gh-tl th-giong-ra " + (x.muc === "sai" ? "gh-muc-tho" : "gh-muc-tot");
      var o = el("div", "gh-tl-than"); veChu(o, x.chu); ra.appendChild(o);
      bit(b, x.bit, x.muc || "");
    }
    t.giong.forEach(function (x, i) { var n = nut("th-tile"); n.setAttribute("aria-pressed", "false"); n.appendChild(el("span", null, x.bieu_tuong)); n.appendChild(document.createTextNode(x.ten)); n.addEventListener("click", function () { chon(i); }); ds.appendChild(n); });
    cp.addEventListener("click", function () { chep(t.giong[cur].chu.replace(/\*\*/g, ""), cp); });
    chon(0);
  }

  // ================= ke-hoach (ôn thi) =================
  function keHoach(cha, t) {
    var f = el("div", "th-kh");
    var o1 = el("label", "bn-lbl"); o1.htmlFor = t.id + "-tuan"; o1.appendChild(document.createTextNode(N.kh_tuan + " ")); var bt = el("b", null, "4"); o1.appendChild(bt);
    var tuan = el("input"); tuan.type = "range"; tuan.min = 2; tuan.max = 8; tuan.value = 4; tuan.id = t.id + "-tuan";
    var o2 = el("label", "bn-lbl"); o2.htmlFor = t.id + "-gio"; o2.appendChild(document.createTextNode(N.kh_gio + " ")); var bg = el("b", null, "2"); o2.appendChild(bg);
    var gio = el("input"); gio.type = "range"; gio.min = 1; gio.max = 4; gio.step = 0.5; gio.value = 2; gio.id = t.id + "-gio";
    f.appendChild(o1); f.appendChild(tuan); f.appendChild(o2); f.appendChild(gio);
    f.appendChild(el("p", "bn-lbl", N.kh_mon));
    var mon = el("div", "th-chon-viec th-mon"); f.appendChild(mon);
    var chonMon = {};
    t.mon.forEach(function (m, i) { var n = nut("th-tile"); n.setAttribute("aria-pressed", i < 3 ? "true" : "false"); if (i < 3) chonMon[i] = 1; n.appendChild(el("span", null, m.bieu_tuong)); n.appendChild(document.createTextNode(m.ten)); n.addEventListener("click", function () { chonMon[i] = !chonMon[i]; n.setAttribute("aria-pressed", String(!!chonMon[i])); ve(); }); mon.appendChild(n); });
    cha.appendChild(f);
    var bang = el("div", "th-kh-bang"); cha.appendChild(bang);
    var b = hopBit(cha);
    var nap = el("details", "bn-nap"); nap.appendChild(el("summary", null, N.kh_lenh_h)); var pre = el("pre", "th-ra"); nap.appendChild(pre);
    var h = el("div", "th-hang"); var cp = nut("btn btn-chinh", N.chep_lenh); h.appendChild(cp); nap.appendChild(h); cha.appendChild(nap);
    function ve() {
      var w = +tuan.value, gi = +gio.value, ds = t.mon.filter(function (m, i) { return chonMon[i]; });
      bt.textContent = w; bg.textContent = String(gi).replace(".", D.lg === "en" ? "." : ",");
      bang.textContent = "";
      if (!ds.length) { bit(b, N.kh_chua_mon, "sai"); pre.textContent = ""; return; }
      var tb = el("table", "gh-bang th-kh-tb"), tr = el("tr");
      [N.kh_tuan_ngan].concat(t.ngay).forEach(function (x) { tr.appendChild(el("th", null, x)); }); tb.appendChild(tr);
      for (var k = 0; k < w; k++) {
        var r = el("tr"); r.appendChild(el("th", null, (D.lg === "en" ? "W" : "T") + (k + 1)));
        var giai = k < w - 1 ? (k < Math.ceil(w / 2) ? N.kh_hoc : N.kh_luyen) : N.kh_thi_thu;
        t.ngay.forEach(function (_, d) {
          var c = el("td");
          if (d === 6) { c.textContent = k === w - 1 ? N.kh_nghi_truoc : N.kh_on_tuan; c.className = "is-on"; }
          else {
            var m = ds[(d + k) % ds.length]; c.appendChild(el("b", null, m.bieu_tuong + " " + m.ten)); c.appendChild(el("small", null, giai));
            if (d === 2 || d === 4) c.appendChild(el("small", "is-on", "+ " + N.kh_on_lai));
          }
          r.appendChild(c);
        });
        tb.appendChild(r);
      }
      var bao = el("div", "gh-bang-bao"); bao.appendChild(tb); bang.appendChild(bao);
      bit(b, thay(N.kh_bit, { w: w, n: ds.length, g: Math.round(w * 6 * gi) }), "dung");
      pre.textContent = thay(N.kh_lenh, { w: w, g: bg.textContent, mon: ds.map(function (m) { return m.ten; }).join(", ") });
      S[t.id] = pre.textContent;
    }
    tuan.addEventListener("input", ve); gio.addEventListener("input", ve);
    cp.addEventListener("click", function () { chep(pre.textContent, cp); });
    ve();
  }

  var KIEU = { "phan-loai": phanLoai, "bo-phieu": boPhieu, ghep: ghep, chat: chat, "tim-loi": function (c, t) { timLoi(c, t, false); }, "sua-loi": function (c, t) { timLoi(c, t, true); }, "chon-ban": chonBan, giong: giong, "ke-hoach": keHoach };
  D.tram.forEach(function (t) { var c = $("th-o-" + t.id); if (c && KIEU[t.loai]) KIEU[t.loai](c, t); });
  var q = (location.search.match(/[?&]tram=([\w-]+)/) || [])[1] || location.hash.slice(1);
  moTram(q || D.tram[0].id, false);
})();

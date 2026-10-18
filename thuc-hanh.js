/* Khung chung cho các trang thực hành theo đối tượng (ai-hoc-sinh.html, ai-van-phong.html, en/...).
   Trang do scripts/trang/thuc-hanh.py tạo từ data/thuc-hanh/<trang>.json; mỗi trạm là một <section class="bn-tram" data-loai=...>
   và dữ liệu của nó nằm trong thẻ <script id="th-du-lieu">. Chín kiểu trạm cơ bản:
     phan-loai  chạm thẻ rồi chạm rổ (2-3 rổ), Bit nhận xét từng thẻ
     bo-phieu   từng câu một, bỏ phiếu (vd. Thật / Bịa), lật đáp án và lời giải
     ghep       ghép mảnh câu lệnh rồi Gửi cho AI, câu trả lời viết sẵn 3 mức (cùng giao diện Thợ ghép câu lệnh)
     chat       trò chuyện rẽ nhánh: chọn câu nói tiếp, cuối mỗi nhánh có bài học
     tim-loi    chạm vào chỗ sai trong một văn bản, bài đăng (gắn cờ 🚩) hoặc tờ đơn (chạm ô nào thì ô đó bị che)
     sua-loi    như tim-loi nhưng chạm vào câu sai thì chọn cách sửa đúng trong vài lựa chọn
     chon-ban   chọn bản tóm tắt trung thực nhất; bản gốc hiện thành hàng ý chính, chọn xong thấy bản nào thiếu, sai, bịa thêm ý nào
     giong      cùng một nội dung, chuyển giữa các giọng văn (văn bản, nói trực tiếp, tin nhắn) để so
     ke-hoach   lập kế hoạch ôn thi theo số tuần, môn, giờ mỗi ngày; ra lịch ô màu và câu lệnh để nhờ AI chỉnh
   Tầng Nâng cao thêm bốn kiểu:
     xep-buoc       xếp các bước của một việc lớn thành chuỗi câu lệnh (có thẻ bẫy), đúng hết thì chép được cả chuỗi
     cham-tieu-chi  tự chấm vài bản nháp AI theo bảng tiêu chí (? → ✓ → ✗), rồi so với đáp án kèm lý do
     vi-du          chọn ví dụ mẫu (few-shot) đưa vào câu lệnh; ví dụ dính lỗi thì AI bắt chước cả lỗi
     bayes          đoán trước, rồi xem 1.000 người: AI báo dương tính bao nhiêu người bệnh thật, kéo tỷ lệ mắc, độ nhạy, độ đặc hiệu
   Dòng có "mo": true trong tim-loi hiện như chữ mờ gần trùng màu giấy (lệnh ẩn trong tài liệu).
   Tiến độ hiện bằng hàng chấm màu, lời Bit giữ một dòng ngắn: trang ưu tiên hình và biểu tượng hơn chữ.
   Mở thẳng một trạm bằng ?tram=<id> hoặc #<id>. Không gọi AI thật, không gửi gì đi; chỉ đếm sự kiện chọn trạm (theo-doi.js). */
(function () {
  "use strict";
  // Trang khác (vd. ai-y-te.html, tầng Nâng cao) có thể chỉ nhúng <script id="th-du-lieu"> để mượn các kiểu trạm, không có #th:
  // khi đó trang đó tự lo chuyển trạm, file này chỉ dựng nội dung từng trạm.
  var goc = document.getElementById("th"), nguon = document.getElementById("th-du-lieu");
  if (!nguon) return;
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

  // chữ chỉ dành cho trình đọc màn hình
  function an(chu) { return el("span", "th-an", chu); }
  // hàng chấm tiến độ thay cho dòng đếm bằng chữ: dat(i, "dung" | "sai" | "nay" | "")
  function chamTien(cha, tong) {
    var w = el("div", "th-cham"), ds = [];
    w.setAttribute("role", "img");
    for (var i = 0; i < tong; i++) { var s = el("span"); w.appendChild(s); ds.push(s); }
    cha.appendChild(w);
    return {
      dat: function (i, loai) { if (ds[i]) ds[i].className = loai ? "is-" + loai : ""; },
      nhan: function (s) { w.setAttribute("aria-label", s); }
    };
  }
  function diem(d, tong, them) { return thay(N.diem, { d: d, tong: tong }) + (them ? " · " + them : ""); }

  // ---------- chọn trạm (cột trái .bn-ngan) ----------
  var nutTram = goc ? [].slice.call(goc.querySelectorAll("[data-tram]")) : [];
  function moTram(id, bam) {
    if (!$("tram-" + id)) id = D.tram[0].id;
    [].slice.call(goc.querySelectorAll(".th-tram")).forEach(function (s) { s.hidden = s.id !== "tram-" + id; });
    nutTram.forEach(function (n) { n.setAttribute("aria-current", n.dataset.tram === id ? "true" : "false"); });
    // cột trạm chia nhóm gập được (Cơ bản / Nâng cao): chỉ mở nhóm có trạm đang mở, người dùng vẫn tự mở thêm được
    [].slice.call(goc.querySelectorAll(".bn-gap")).forEach(function (d) { d.open = !!d.querySelector('[aria-current="true"]'); });
    if (bam) {
      try { history.replaceState(null, "", location.pathname + location.search.replace(/([?&])tram=[^&]*&?/, "$1").replace(/[?&]$/, "") + "#" + id); } catch (e) {}
      do_(D.trang + "-tram", { tram: id });
    }
  }
  nutTram.forEach(function (n) { n.addEventListener("click", function () { moTram(n.dataset.tram, true); }); });

  // ================= phan-loai =================
  function phanLoai(cha, t) {
    var chon = null, xong = {}, dung = 0, thu = 0, tong = t.the.length;
    var tien = chamTien(cha, tong);
    var ds = el("div", "th-phan-the"); ds.setAttribute("role", "group"); ds.setAttribute("aria-label", N.the); cha.appendChild(ds);
    var ro = el("div", "th-ro-hang th-ro-" + t.ro.length); cha.appendChild(ro);
    var b = hopBit(cha), h = hang(cha), lai = nut("btn btn-nhe", "↺ " + N.lam_lai); h.appendChild(lai);
    function roCua(id) { return t.ro.filter(function (q) { return q.id === id; })[0]; }
    var the = t.the.map(function (x, i) {
      var n = nut("th-the"); n.dataset.i = i; n.setAttribute("aria-pressed", "false");
      if (x.bt) n.appendChild(el("span", "th-the-bt", x.bt));
      n.appendChild(el("span", "th-the-chu", x.chu));
      n.addEventListener("click", function () {
        if (xong[i] != null) return;
        chon = chon === i ? null : i;
        the.forEach(function (m, k) { m.setAttribute("aria-pressed", String(k === chon)); });
        ro.classList.toggle("is-cho", chon != null);
        bit(b, "");
      });
      ds.appendChild(n); return n;
    });
    t.ro.forEach(function (r) {
      var n = nut("th-ro"); n.style.setProperty("--mau", r.mau || "#8B5CF6");
      n.appendChild(el("span", "th-ro-bt", r.bieu_tuong)); n.appendChild(el("b", null, r.ten)); var c = el("span", "th-ro-dem", "0"); n.appendChild(c);
      n.addEventListener("click", function () {
        if (chon == null) { bit(b, N.chon_the); return; }
        var x = t.the[chon], ok = x.dung === r.id, rd = roCua(x.dung);
        xong[chon] = r.id; if (ok) dung++;
        var m = the[chon]; m.classList.add(ok ? "is-dung" : "is-sai"); m.setAttribute("aria-pressed", "false"); m.disabled = true;
        var nh = el("small", "th-the-ro", ok ? "✓ " + rd.bieu_tuong : "✗ " + N.dung_la + " " + rd.bieu_tuong); nh.appendChild(an(" " + rd.ten)); m.appendChild(nh);
        c.textContent = +c.textContent + 1;
        tien.dat(thu++, ok ? "dung" : "sai");
        chon = null; ro.classList.remove("is-cho");
        var het = thu === tong;
        bit(b, het ? [(ok ? "✓ " : "✗ ") + x.giai, diem(dung, tong, t.bai_hoc)] : (ok ? "✓ " : "✗ ") + x.giai, ok ? "dung" : "sai");
        tien.nhan(thay(N.phan_dem, { n: thu, tong: tong, d: dung }));
      });
      ro.appendChild(n);
    });
    lai.addEventListener("click", function () { cha.textContent = ""; phanLoai(cha, t); });
    tien.nhan(thay(N.phan_dem, { n: 0, tong: tong, d: 0 }));
  }

  // ================= bo-phieu =================
  function boPhieu(cha, t) {
    var i = 0, d = 0, tong = t.cau.length;
    var tien = chamTien(cha, tong);
    var the = el("div", "th-phieu"); the.setAttribute("aria-live", "polite"); cha.appendChild(the);
    var h = el("div", "th-phieu-nut"); cha.appendChild(h);
    var b = hopBit(cha), h2 = hang(cha), tiep = nut("btn btn-chinh", N.tiep + " ›"); tiep.hidden = true; h2.appendChild(tiep);
    var lai = nut("btn btn-nhe", "↺ " + N.lam_lai); lai.hidden = true; h2.appendChild(lai);
    var cac = t.lua_chon.map(function (l) {
      var n = nut("th-phieu-chon", ""); n.appendChild(el("span", null, l.bieu_tuong)); n.appendChild(document.createTextNode(l.ten)); n.dataset.id = l.id;
      n.addEventListener("click", function () { tra(l.id); }); h.appendChild(n); return n;
    });
    function ve() {
      var c = t.cau[i]; the.textContent = "";
      the.appendChild(el("span", "th-phieu-anh", "🤖"));
      var bong = el("div", "th-phieu-bong"); bong.appendChild(an(N.ai_noi + " "));
      if (c.bt) bong.appendChild(el("span", "th-phieu-bt", c.bt));
      var p = el("p", "th-phieu-chu"); dam(p, c.chu); bong.appendChild(p);
      bong.appendChild(el("span", "th-phieu-chac", N.chac)); the.appendChild(bong);
      cac.forEach(function (n) { n.disabled = false; n.className = "th-phieu-chon"; });
      tien.dat(i, "nay"); tien.nhan(thay(N.phieu_dem, { n: i + 1, tong: tong, d: d }));
      bit(b, ""); tiep.hidden = true;
    }
    function tra(id) {
      var c = t.cau[i], ok = id === c.dap;
      if (ok) d++;
      cac.forEach(function (n) { n.disabled = true; if (n.dataset.id === c.dap) n.classList.add("is-dung"); else if (n.dataset.id === id) n.classList.add("is-sai"); });
      var cuoi = i === tong - 1, loi = (ok ? "✓ " : "✗ ") + c.giai;
      bit(b, cuoi ? [loi, diem(d, tong, t.bai_hoc)] : loi, ok ? "dung" : "sai");
      tien.dat(i, ok ? "dung" : "sai"); tien.nhan(thay(N.phieu_dem, { n: i + 1, tong: tong, d: d }));
      tiep.hidden = cuoi; lai.hidden = !cuoi;
      if (!cuoi) tiep.focus({ preventScroll: true });
    }
    tiep.addEventListener("click", function () { i++; ve(); });
    lai.addEventListener("click", function () { cha.textContent = ""; boPhieu(cha, t); });
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
    var dau = el("div", "th-chat-dau"); dau.appendChild(el("span", "th-bong-anh", t.anh_ai || "🤖")); dau.appendChild(el("b", null, t.ten_ai || N.ten_ai)); cha.appendChild(dau);
    var khung = el("div", "th-chat"); khung.setAttribute("aria-live", "polite"); cha.appendChild(khung);
    var lua = el("div", "th-chat-chon"); cha.appendChild(lua);
    var b = hopBit(cha), h = hang(cha), lai = nut("btn btn-nhe", "↺ " + N.lam_lai); lai.hidden = true; h.appendChild(lai);
    var nut_ = {}; t.nut.forEach(function (n) { nut_[n.id] = n; });
    function bong(ai, chu) {
      var d = el("div", "th-bong-hang " + (ai ? "is-ai" : "is-ban"));
      d.appendChild(el("span", "th-bong-anh", ai ? (t.anh_ai || "🤖") : (t.anh_ban || "🙂")));
      var o = el("div", "th-bong " + (ai ? "is-ai" : "is-ban")); o.appendChild(an((ai ? (t.ten_ai || N.ten_ai) : (t.ten_ban || N.ten_ban)) + ": "));
      var c = el("div"); veChu(c, chu); o.appendChild(c); d.appendChild(o); khung.appendChild(d); cuon(d);
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
    lai.addEventListener("click", function () { khung.textContent = ""; bit(b, ""); lai.hidden = true; den(t.bat_dau); });
    den(t.bat_dau);
  }

  // ================= tim-loi / sua-loi =================
  // kieu "giay" (văn bản), "bai-dang" (bài mạng xã hội, có thể có ảnh giả và dòng tương tác), "don" (tờ đơn từng ô: chạm ô nào thì ô đó bị che)
  function timLoi(cha, t, sua) {
    var tong = t.doan.filter(function (x) { return x.loi; }).length, tim = {}, so = 0, kieu = t.kieu || "giay", dang = null;
    var tien = chamTien(cha, tong);
    var giay = el("div", "th-van th-van-" + kieu);
    if (t.dau) { var dau = el("div", "th-van-dau"); veChu(dau, t.dau); giay.appendChild(dau); }
    var than = el("div", "th-van-than"); giay.appendChild(than);
    if (t.cuoi) { var cu = el("div", "th-van-cuoi"); veChu(cu, t.cuoi); giay.appendChild(cu); }
    cha.appendChild(giay);
    var sua_ = el("div", "th-sua"); sua_.hidden = true; cha.appendChild(sua_);
    var b = hopBit(cha), h = hang(cha), dap = nut("btn btn-nhe", N.hien_dap_an), lai = nut("btn btn-nhe", "↺ " + N.lam_lai);
    h.appendChild(dap); h.appendChild(lai);
    function chu(c, s) { c.querySelector(".th-cau-chu").textContent = s; }
    var cau = t.doan.map(function (x, k) {
      var c = nut("th-cau" + (x.anh ? " th-cau-anh" : "") + (x.mo ? " th-cau-mo" : "")); c.dataset.k = k;
      c.appendChild(el("span", "th-cau-chu", x.chu));
      if (x.anh) { var a = el("span", "th-anh-gia"); a.setAttribute("aria-hidden", "true"); a.appendChild(el("b", null, x.anh)); for (var j = 0; j < 6; j++) a.appendChild(el("i")); c.appendChild(a); }
      if (kieu === "don") { var r = el("div", "th-don-hang"); if (x.nhan) r.appendChild(el("span", "th-don-nhan", x.nhan)); r.appendChild(c); than.appendChild(r); }
      else { if (x.xuong_dong) than.appendChild(el("br")); than.appendChild(c); than.appendChild(document.createTextNode(" ")); }
      return c;
    });
    function xong(c, x) {
      tim[c.dataset.k] = 1; tien.dat(so++, "dung"); tien.nhan(thay(N.tim_dem, { n: so, tong: tong }));
      c.classList.remove("is-chon"); c.classList.add(sua ? "is-sua" : kieu === "don" ? "is-che" : "is-loi"); c.setAttribute("aria-pressed", "true");
      if (kieu === "don" && x.the) chu(c, x.the);
      if (x.co) c.parentNode.insertBefore(el("span", "th-co", "🚩 " + x.co), c.nextSibling);
      return so === tong;
    }
    function het(x) { bit(b, [x || "", diem(tong, tong, t.bai_hoc)], "dung"); }
    cau.forEach(function (c) {
      c.addEventListener("click", function () {
        var x = t.doan[c.dataset.k];
        if (tim[c.dataset.k]) return;
        if (!x.loi) { c.classList.add("is-ok"); bit(b, x.bit || N.cau_on); return; }
        if (!sua) { var tb = x.bit || N.da_che; if (xong(c, x)) het(tb); else bit(b, tb, "dung"); return; }
        // sua-loi: chọn cách sửa
        if (dang) dang.classList.remove("is-chon");
        dang = c; c.classList.add("is-chon");
        sua_.textContent = ""; sua_.hidden = false;
        sua_.appendChild(el("p", "th-sua-h", N.sua_hoi));
        // xoay thứ tự lựa chọn theo vị trí câu, để đáp án đúng không luôn nằm đầu
        var n = x.lua_chon.length, lech = (+c.dataset.k) % n;
        x.lua_chon.map(function (_, j) { return (j + lech) % n; }).forEach(function (i) {
          var o = nut("th-sua-chon", x.lua_chon[i]);
          o.addEventListener("click", function () {
            if (i !== x.dung) { o.classList.add("is-sai"); o.disabled = true; bit(b, x.sai || N.sua_sai, "sai"); return; }
            chu(c, x.lua_chon[x.dung]); sua_.hidden = true; dang = null;
            if (xong(c, x)) het("✓ " + x.bit); else bit(b, "✓ " + x.bit, "dung");
          });
          sua_.appendChild(o);
        });
        bit(b, ""); cuon(sua_);
      });
    });
    dap.addEventListener("click", function () {
      cau.forEach(function (c) { var x = t.doan[c.dataset.k]; if (x.loi && !tim[c.dataset.k]) { if (sua) chu(c, x.lua_chon[x.dung]); xong(c, x); } });
      sua_.hidden = true; bit(b, t.bai_hoc || "", "dung");
    });
    lai.addEventListener("click", function () { cha.textContent = ""; timLoi(cha, t, sua); });
    tien.nhan(thay(N.tim_dem, { n: 0, tong: tong }));
  }

  // ================= chon-ban =================
  // có t.y (các ý chính của bản gốc, kèm biểu tượng) thì bản gốc hiện thành hàng ý, chọn xong mỗi bản hiện ý nào có, thiếu, sai, bịa thêm
  function chonBan(cha, t) {
    if (t.y) {
      var hop = el("div", "th-y-goc"); hop.appendChild(el("p", "th-van-nhan", t.nhan_goc || N.van_goc));
      var yd = el("div", "th-y-ds"); t.y.forEach(function (y) { var c = el("span", "th-y"); c.appendChild(el("span", "th-y-bt", y.bt)); c.appendChild(document.createTextNode(y.chu)); yd.appendChild(c); }); hop.appendChild(yd);
      var nap = el("details", "bn-nap th-y-nap"); nap.appendChild(el("summary", null, N.xem_goc)); var gg = el("div", "th-van th-van-giay"); veChu(gg, t.goc); nap.appendChild(gg); hop.appendChild(nap);
      cha.appendChild(hop);
    } else {
      var g = el("div", "th-van th-van-giay"); g.appendChild(el("p", "th-van-nhan", t.nhan_goc || N.van_goc));
      var than = el("div", "th-van-than"); veChu(than, t.goc); g.appendChild(than); cha.appendChild(g);
    }
    cha.appendChild(el("p", "gh-khay-nhan", t.hoi || N.chon_ban_hoi));
    var ds = el("div", "th-ban-ds"); cha.appendChild(ds);
    var b = hopBit(cha), da = false;
    var DAU = { co: "✓ ", sai: "⚠ ", thieu: "✗ " };
    t.ban.forEach(function (x, i) {
      var n = nut("th-ban"); n.appendChild(el("span", "th-ban-so", String.fromCharCode(65 + i)));
      var o = el("div", "th-ban-chu"); veChu(o, x.chu); n.appendChild(o);
      n.addEventListener("click", function () {
        [].slice.call(ds.children).forEach(function (m, k) {
          var y = t.ban[k]; m.classList.toggle("is-dung", !!y.dung); m.classList.toggle("is-sai", !y.dung && k === i);
          var cu = m.querySelector(".th-ban-giai"); if (cu) cu.remove();
          if (t.y) {
            var r = el("div", "th-ban-giai th-ban-y");
            t.y.forEach(function (q) { var tt = (y.co || {})[q.id] || "thieu"; r.appendChild(el("span", "th-y is-" + tt, DAU[tt] + q.bt + " " + q.chu)); });
            if (y.them) r.appendChild(el("span", "th-y is-them", "➕ " + y.them));
            m.appendChild(r);
          } else m.appendChild(el("p", "th-ban-giai", (y.dung ? "✓ " : "✗ ") + y.giai));
        });
        bit(b, (x.dung ? N.dung_roi : N.chua_dung) + " " + (t.bai_hoc || ""), x.dung ? "dung" : "sai");
        if (!da) { da = true; do_(D.trang + "-chon-ban", { dung: !!x.dung }); }
      });
      ds.appendChild(n);
    });
  }

  // ================= giong =================
  // mỗi giọng có "kieu" để hiện đúng hình thức: giay (văn bản), noi (nói trực tiếp), sms (tin nhắn)
  function giong(cha, t) {
    var g = el("div", "th-giong-nhap"); g.appendChild(el("span", "th-giong-nhap-nhan", t.nhan_goc || N.ban_nhap)); g.appendChild(el("p", null, t.goc)); cha.appendChild(g);
    var ds = el("div", "th-chon-viec"); ds.setAttribute("role", "group"); ds.setAttribute("aria-label", N.chon_giong); cha.appendChild(ds);
    var ra = el("div", "th-giong-ra"); ra.setAttribute("aria-live", "polite"); cha.appendChild(ra);
    var b = hopBit(cha), h = hang(cha), cp = nut("btn btn-chinh", N.chep_ban); h.appendChild(cp);
    var cur = 0;
    function chon(i) {
      cur = i; var x = t.giong[i];
      [].slice.call(ds.children).forEach(function (n, k) { n.setAttribute("aria-pressed", String(k === i)); });
      ra.textContent = ""; ra.className = "th-giong-ra is-" + (x.kieu || "giay") + (x.muc === "sai" ? " is-sai" : "");
      ra.appendChild(el("p", "th-giong-nhan", "✨ " + N.ai_viet_lai));
      var o = el("div", "th-giong-chu"); veChu(o, x.chu); ra.appendChild(o);
      bit(b, x.bit, x.muc || "");
    }
    t.giong.forEach(function (x, i) { var n = nut("th-tile"); n.setAttribute("aria-pressed", "false"); n.appendChild(el("span", null, x.bieu_tuong)); n.appendChild(document.createTextNode(x.ten)); n.addEventListener("click", function () { chon(i); }); ds.appendChild(n); });
    cp.addEventListener("click", function () { chep(t.giong[cur].chu.replace(/\*\*/g, ""), cp); });
    chon(0);
  }

  // ================= ke-hoach (ôn thi): lịch ô màu, mỗi ô là biểu tượng môn, màu là kiểu học =================
  function keHoach(cha, t) {
    var f = el("div", "th-kh");
    var o1 = el("label", "bn-lbl"); o1.htmlFor = t.id + "-tuan"; o1.appendChild(document.createTextNode(N.kh_tuan + " ")); var bt = el("b", null, "4"); o1.appendChild(bt);
    var tuan = el("input"); tuan.type = "range"; tuan.min = 2; tuan.max = 8; tuan.value = 4; tuan.id = t.id + "-tuan";
    var o2 = el("label", "bn-lbl"); o2.htmlFor = t.id + "-gio"; o2.appendChild(document.createTextNode(N.kh_gio + " ")); var bg = el("b", null, "2"); o2.appendChild(bg);
    var gio = el("input"); gio.type = "range"; gio.min = 1; gio.max = 4; gio.step = 0.5; gio.value = 2; gio.id = t.id + "-gio";
    var keo = el("div", "th-kh-keo"), k1 = el("div"), k2 = el("div"); k1.appendChild(o1); k1.appendChild(tuan); k2.appendChild(o2); k2.appendChild(gio); keo.appendChild(k1); keo.appendChild(k2); f.appendChild(keo);
    var mon = el("div", "th-chon-viec th-mon"); mon.setAttribute("role", "group"); mon.setAttribute("aria-label", N.kh_mon); f.appendChild(mon);
    var chonMon = {};
    t.mon.forEach(function (m, i) { var n = nut("th-tile"); n.setAttribute("aria-pressed", i < 3 ? "true" : "false"); if (i < 3) chonMon[i] = 1; n.appendChild(el("span", null, m.bieu_tuong)); n.appendChild(document.createTextNode(m.ten)); n.addEventListener("click", function () { chonMon[i] = !chonMon[i]; n.setAttribute("aria-pressed", String(!!chonMon[i])); ve(); }); mon.appendChild(n); });
    cha.appendChild(f);
    var HD = { hoc: ["📖", N.kh_hoc], luyen: ["✍️", N.kh_luyen], thi: ["🎯", N.kh_thi_thu], on: ["🔁", N.kh_on_tuan], nghi: ["😴", N.kh_nghi_truoc], kt: ["⚡", N.kh_on_lai] };
    var cg = el("div", "th-kh-cg"); cg.setAttribute("aria-hidden", "true");
    Object.keys(HD).forEach(function (k) { var s = el("span", "th-kh-ct is-" + k); s.appendChild(el("i", null, HD[k][0])); s.appendChild(document.createTextNode(HD[k][1])); cg.appendChild(s); });
    cha.appendChild(cg);
    var bang = el("div", "th-kh-bang"); cha.appendChild(bang);
    var b = hopBit(cha);
    var nap = el("details", "bn-nap"); nap.appendChild(el("summary", null, N.kh_lenh_h)); var pre = el("pre", "th-ra"); nap.appendChild(pre);
    var h = el("div", "th-hang"); var cp = nut("btn btn-chinh", N.chep_lenh); h.appendChild(cp); nap.appendChild(h); cha.appendChild(nap);
    function o(loai, bieu, ten, kt) {
      var x = el("span", "th-kh-o is-" + loai); x.title = ten ? ten + " · " + HD[loai][1] : HD[loai][1];
      x.appendChild(el("i", null, bieu)); if (kt) x.appendChild(el("b", "th-kh-kt", "⚡"));
      x.appendChild(an(x.title + (kt ? " + " + N.kh_on_lai : ""))); return x;
    }
    function ve() {
      var w = +tuan.value, gi = +gio.value, ds = t.mon.filter(function (m, i) { return chonMon[i]; });
      bt.textContent = w; bg.textContent = String(gi).replace(".", D.lg === "en" ? "." : ",");
      bang.textContent = "";
      if (!ds.length) { bit(b, N.kh_chua_mon, "sai"); pre.textContent = ""; return; }
      var l = el("div", "th-kh-luoi");
      l.appendChild(el("span", "th-kh-dau", ""));
      t.ngay.forEach(function (x) { l.appendChild(el("span", "th-kh-dau", x)); });
      for (var k = 0; k < w; k++) {
        l.appendChild(el("span", "th-kh-dau", (D.lg === "en" ? "W" : "T") + (k + 1)));
        var loai = k < w - 1 ? (k < Math.ceil(w / 2) ? "hoc" : "luyen") : "thi";
        t.ngay.forEach(function (_, d) {
          if (d === 6) { var cn = k === w - 1 ? "nghi" : "on"; l.appendChild(o(cn, HD[cn][0])); return; }
          var m = ds[(d + k) % ds.length]; l.appendChild(o(loai, m.bieu_tuong, m.ten, d === 2 || d === 4));
        });
      }
      bang.appendChild(l);
      bit(b, thay(N.kh_bit, { w: w, n: ds.length, g: Math.round(w * 6 * gi) }), "dung");
      pre.textContent = thay(N.kh_lenh, { w: w, g: bg.textContent, mon: ds.map(function (m) { return m.ten; }).join(", ") });
      S[t.id] = pre.textContent;
    }
    tuan.addEventListener("input", ve); gio.addEventListener("input", ve);
    cp.addEventListener("click", function () { chep(pre.textContent, cp); });
    ve();
  }

  // ================= xep-buoc: chia việc lớn thành chuỗi câu lệnh =================
  // t.dau (việc lớn), t.buoc theo đúng thứ tự [{bt, chu, lenh, goi_y}], t.bay (tuỳ chọn) là bước không nên làm [{bt, chu, bit}].
  // Chạm thẻ trong kho để xếp vào ô trống kế tiếp, chạm thẻ đã xếp để lấy ra. Đúng hết thì hiện chuỗi câu lệnh để chép.
  function xepBuoc(cha, t) {
    var tong = t.buoc.length, o = [], xongRoi = false;
    var the = t.buoc.map(function (x, i) { return { x: x, i: i }; }).concat((t.bay || []).map(function (x) { return { x: x, i: -1 }; }));
    for (var k = the.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), tm = the[k]; the[k] = the[j]; the[j] = tm; }
    if (the.slice(0, tong).every(function (c, s) { return c.i === s; })) the.reverse();
    if (t.dau) { var v = el("div", "th-xb-viec"); veChu(v, t.dau); cha.appendChild(v); }
    var dsO = el("ol", "th-xb-o"); cha.appendChild(dsO);
    cha.appendChild(el("p", "gh-khay-nhan", N.xb_kho));
    var kho = el("div", "th-xb-kho"); cha.appendChild(kho);
    var b = hopBit(cha), h = hang(cha), kiem = nut("btn btn-chinh", N.xb_kiem), dap = nut("btn btn-nhe", N.hien_dap_an), lai = nut("btn btn-nhe", "↺ " + N.lam_lai);
    h.appendChild(kiem); h.appendChild(dap); h.appendChild(lai);
    var chuoi = el("div", "th-xb-chuoi"); chuoi.hidden = true; cha.appendChild(chuoi);
    function theNut(c, cls) { var n = nut(cls); n.appendChild(el("span", "th-xb-bt", c.x.bt || "•")); n.appendChild(el("span", "th-xb-chu", c.x.chu)); return n; }
    var nutThe = the.map(function (c, k) {
      var n = theNut(c, "th-xb-the");
      n.addEventListener("click", function () { if (xongRoi) return; if (o.length >= tong) { bit(b, N.xb_day); return; } o.push(k); ve(); });
      kho.appendChild(n); return n;
    });
    function ve(cham) {
      dsO.textContent = "";
      for (var s = 0; s < tong; s++) {
        var li = el("li", "th-xb-ich"); li.appendChild(el("span", "th-xb-so", String(s + 1)));
        if (o[s] != null) {
          var c = the[o[s]], n = theNut(c, "th-xb-dat");
          if (cham) n.classList.add(c.i === s ? "is-dung" : "is-sai");
          (function (s) { n.addEventListener("click", function () { if (xongRoi) return; o.splice(s, 1); ve(); }); })(s);
          li.appendChild(n);
        } else li.appendChild(el("span", "th-xb-trong", N.xb_trong));
        dsO.appendChild(li);
      }
      nutThe.forEach(function (n, k) { n.hidden = o.indexOf(k) >= 0 && !xongRoi; });
      kiem.disabled = o.length < tong || xongRoi;
      if (!cham && !xongRoi) bit(b, o.length < tong ? thay(N.xb_con, { n: tong - o.length }) : N.xb_du);
    }
    function xong(tuLam) {
      xongRoi = true;
      o = t.buoc.map(function (_, i) { for (var k = 0; k < the.length; k++) if (the[k].i === i) return k; });
      ve(true);
      nutThe.forEach(function (n, k) { var c = the[k]; n.hidden = c.i >= 0; if (c.i < 0) { n.disabled = true; n.classList.add("is-bay"); n.appendChild(el("small", "th-xb-ly", "🪤 " + c.x.bit)); } });
      chuoi.textContent = ""; chuoi.hidden = false;
      var cp = nut("btn btn-chinh", "📋 " + N.chep_chuoi);
      chuoi.appendChild(cp);
      var nap = el("details", "bn-nap th-xb-nap"); nap.appendChild(el("summary", null, "👀 " + thay(N.xb_chuoi, { n: tong })));
      var ds = el("ol", "th-xb-lenh");
      t.buoc.forEach(function (x) { var li = el("li"); li.appendChild(el("b", null, x.bt + " " + x.chu)); if (x.lenh) li.appendChild(el("code", null, x.lenh)); ds.appendChild(li); });
      nap.appendChild(ds);
      cp.addEventListener("click", function () { chep(t.buoc.map(function (x, i) { return (i + 1) + ". " + (x.lenh || x.chu); }).join("\n\n"), cp); });
      chuoi.appendChild(nap);
      bit(b, tuLam ? [N.xb_dung, t.bai_hoc] : t.bai_hoc, tuLam ? "dung" : "");
      do_(D.trang + "-xep-buoc", { tu_lam: tuLam });
    }
    kiem.addEventListener("click", function () {
      var d = 0, bay = null, sai = null;
      o.forEach(function (k, s) { var c = the[k]; if (c.i === s) d++; else if (c.i < 0) bay = bay || c.x; else sai = sai || c.x; });
      if (d === tong) return xong(true);
      ve(true);
      bit(b, [thay(N.xb_dem, { d: d, tong: tong }), bay ? "🪤 " + bay.bit : (sai && sai.goi_y) || N.xb_thu_lai], "sai");
    });
    dap.addEventListener("click", function () { xong(false); });
    lai.addEventListener("click", function () { cha.textContent = ""; xepBuoc(cha, t); });
    ve();
  }

  // ================= cham-tieu-chi: tự chấm vài bản nháp AI theo tiêu chí =================
  // t.viec (đề bài), t.tieu_chi [{id, bt, chu}], t.ban [{ten, chu, dat: {id: true|false}, giai: {id: "..."}}].
  // Bảng chấm: chạm ô để đổi ? → ✓ → ✗. Chấm xong ô lệch có dấu ⚠ (chạm để Bit nói lý do), Bit báo số ô khớp và bản tốt nhất.
  function chamTieuChi(cha, t) {
    var o = {}, daCham = false, CHU = String.fromCharCode, KY = { "": "?", co: "✓", khong: "✗" };
    if (t.viec) { var v = el("div", "th-xb-viec"); veChu(v, t.viec); cha.appendChild(v); }
    var ds = el("div", "th-ct-ban"); cha.appendChild(ds);
    t.ban.forEach(function (x, i) {
      var c = el("article", "th-ct-the"), d = el("p", "th-ct-ten");
      d.appendChild(el("span", "th-ban-so", CHU(65 + i))); d.appendChild(document.createTextNode(x.ten)); c.appendChild(d);
      var chu = el("div", "th-ct-chu"); veChu(chu, x.chu); c.appendChild(chu); ds.appendChild(c);
    });
    cha.appendChild(el("p", "gh-khay-nhan", N.ct_huong_dan));
    var bao = el("div", "th-ct-bao"), bang = el("table", "th-ct-bang"); bao.appendChild(bang); cha.appendChild(bao);
    var tr = el("tr"); tr.appendChild(el("th", null, N.ct_tieu_chi)); t.ban.forEach(function (_, i) { tr.appendChild(el("th", null, CHU(65 + i))); }); bang.appendChild(tr);
    var oNut = [];
    t.tieu_chi.forEach(function (c) {
      var r = el("tr"), th = el("th"); th.appendChild(el("span", "th-ct-bt", c.bt)); th.appendChild(document.createTextNode(c.chu)); r.appendChild(th);
      t.ban.forEach(function (x, i) {
        var td = el("td"), n = nut("th-ct-o", "?"), k = c.id + "|" + i;
        n.setAttribute("aria-label", c.chu + " · " + CHU(65 + i));
        n.addEventListener("click", function () {
          if (daCham) { if (n._giai) bit(b, n._giai, "sai"); return; }
          o[k] = o[k] === "co" ? "khong" : o[k] === "khong" ? "" : "co";
          n.textContent = KY[o[k]]; n.className = "th-ct-o" + (o[k] ? " is-" + o[k] : "");
          var con = oNut.length - Object.keys(o).filter(function (q) { return o[q]; }).length;
          bit(b, con ? thay(N.ct_con, { n: con }) : N.ct_du);
        });
        td.appendChild(n); r.appendChild(td); oNut.push({ n: n, k: k, c: c, x: x, i: i });
      });
      bang.appendChild(r);
    });
    var b = hopBit(cha), h = hang(cha), cham = nut("btn btn-chinh", N.ct_cham), lai = nut("btn btn-nhe", "↺ " + N.lam_lai);
    h.appendChild(cham); h.appendChild(lai);
    cham.addEventListener("click", function () {
      var con = oNut.filter(function (q) { return !o[q.k]; }).length;
      if (con) { bit(b, thay(N.ct_con, { n: con })); return; }
      daCham = true; cham.disabled = true;
      var khop = 0;
      oNut.forEach(function (q) {
        var dung = !!q.x.dat[q.c.id], ok = (o[q.k] === "co") === dung;
        if (ok) khop++;
        q.n.parentNode.className = ok ? "is-khop" : "is-lech";
        if (!ok) { q.n.textContent = (dung ? "✓" : "✗") + "⚠"; q.n.className = "th-ct-o is-" + (dung ? "co" : "khong") + " is-lech"; q.n._giai = CHU(65 + q.i) + " · " + q.c.bt + " " + ((q.x.giai || {})[q.c.id] || ""); }
      });
      var tot = t.ban.map(function (x) { return t.tieu_chi.filter(function (c) { return x.dat[c.id]; }).length; }), max = Math.max.apply(null, tot);
      var thang = t.ban.filter(function (_, i) { return tot[i] === max; }).map(function (x) { return CHU(65 + t.ban.indexOf(x)); }).join(", ");
      bit(b, [thay(N.ct_khop, { d: khop, tong: oNut.length }) + " · " + thay(N.ct_thang, { ten: thang }), khop < oNut.length ? N.ct_xem_lech : t.bai_hoc], khop === oNut.length ? "dung" : "");
      do_(D.trang + "-cham", { khop: khop });
    });
    lai.addEventListener("click", function () { cha.textContent = ""; chamTieuChi(cha, t); });
    bit(b, thay(N.ct_con, { n: oNut.length }));
  }

  // ================= vi-du: đưa ví dụ mẫu (few-shot) để AI bắt chước =================
  // t.lenh, t.can (số ví dụ, mặc định 2), t.mau [{chu, loi: null | "<khóa>", bit}], t.tra_loi {khong, tot, <khóa>}, t.bai_hoc.
  // Không ví dụ: AI tự đoán. Có ví dụ dính lỗi: AI bắt chước cả lỗi (tra_loi[<khóa>]). Ví dụ chuẩn: bản tốt.
  function viDu(cha, t) {
    var can = t.can || 2, chon = [];
    var lenh = el("div", "gh-lenh"); lenh.appendChild(el("p", "gh-lenh-nhan", N.cau_lenh)); var ds = el("div", "gh-lenh-ds"); ds.setAttribute("aria-live", "polite"); lenh.appendChild(ds); cha.appendChild(lenh);
    cha.appendChild(el("p", "gh-khay-nhan", thay(N.vd_mau, { n: can })));
    var kho = el("div", "th-vd-kho"); cha.appendChild(kho);
    var h = hang(cha), gui = nut("btn btn-chinh", N.gui + " ›"), cp = nut("btn btn-chinh", N.chep_lenh), lai = nut("btn btn-nhe", "↺ " + N.lam_lai);
    h.appendChild(gui); h.appendChild(cp); h.appendChild(lai);
    var ben = el("div", "gh-ben th-gh-ben"); cha.appendChild(ben);
    var tl = el("div"); tl.hidden = true; ben.appendChild(tl);
    var b = hopBit(ben);
    var nutMau = t.mau.map(function (x, i) {
      var n = nut("th-vd-mau"); n.setAttribute("aria-pressed", "false");
      n.appendChild(el("span", "th-vd-so", "#" + (i + 1))); var o = el("div", "th-vd-chu"); veChu(o, x.chu); n.appendChild(o);
      n.addEventListener("click", function () {
        var k = chon.indexOf(i);
        if (k >= 0) chon.splice(k, 1);
        else if (chon.length >= can) { bit(b, thay(N.vd_du, { n: can })); return; }
        else chon.push(i);
        ve();
      });
      kho.appendChild(n); return n;
    });
    function ve() {
      ds.textContent = ""; tl.hidden = true;
      var g = el("p", "gh-dong gh-dong-goc"); g.appendChild(el("span", "gh-dong-chu", t.lenh)); ds.appendChild(g);
      for (var k = 0; k < can; k++) {
        var d = el("div", "th-vd-o" + (chon[k] != null ? " is-co" : "")); d.appendChild(el("span", "gh-loai", thay(N.vd_nhan, { n: k + 1 })));
        if (chon[k] != null) { var c = el("div", "th-vd-chu"); veChu(c, t.mau[chon[k]].chu); d.appendChild(c); } else d.appendChild(el("span", "gh-trong", N.vd_trong));
        ds.appendChild(d);
      }
      nutMau.forEach(function (n, i) { n.setAttribute("aria-pressed", String(chon.indexOf(i) >= 0)); });
      bit(b, chon.length ? "" : N.vd_bat_dau);
    }
    gui.addEventListener("click", function () {
      var loi = null; chon.forEach(function (i) { if (!loi && t.mau[i].loi) loi = t.mau[i]; });
      var muc = !chon.length ? "khong" : loi ? loi.loi : "tot";
      tl.textContent = ""; tl.className = "gh-tl gh-muc-" + (muc === "tot" ? "tot" : muc === "khong" ? "tho" : "kha");
      var dau = el("div", "gh-tl-dau"); dau.appendChild(el("span", "gh-tl-ai", N.ai_tra_loi)); tl.appendChild(dau);
      var than = el("div", "gh-tl-than"); veChu(than, t.tra_loi[muc]); tl.appendChild(than); tl.hidden = false;
      if (muc === "khong") bit(b, N.vd_khong, "sai");
      else if (loi) bit(b, [N.vd_sai, loi.bit], "sai");
      else bit(b, [chon.length < can ? N.vd_them : N.vd_tot, t.bai_hoc], "dung");
      cuon(tl); do_(D.trang + "-vi-du", { muc: muc });
    });
    cp.addEventListener("click", function () { chep(t.lenh + chon.map(function (i, k) { return "\n\n" + thay(N.vd_nhan, { n: k + 1 }) + "\n" + t.mau[i].chu.replace(/\*\*/g, ""); }).join(""), cp); });
    lai.addEventListener("click", function () { chon = []; ve(); });
    ve();
  }

  // ================= bayes: AI báo dương tính thì khả năng bệnh thật là bao nhiêu =================
  // t.chip [{bt, chu}] (số liệu dạng thẻ), t.cau (câu hỏi ngắn), t.doan [{chu, dung}], t.giai, t.mac {ty_le, nhay, dac} (%), t.bai_hoc.
  // Đoán trước, rồi mở 1.000 người dạng lưới chấm: đúng dương, báo nhầm, bỏ sót, đúng âm; kéo ba thanh để thấy tỷ lệ đổi.
  function bayes(cha, t) {
    if (t.chip) { var cd = el("div", "th-by-chip"); t.chip.forEach(function (c) { var x = el("span"); x.appendChild(el("b", null, c.bt)); x.appendChild(document.createTextNode(c.chu)); cd.appendChild(x); }); cha.appendChild(cd); }
    var q = el("div", "th-phieu"); q.appendChild(el("span", "th-phieu-anh", "🤖"));
    var bong = el("div", "th-phieu-bong"), p = el("p", "th-phieu-chu"); dam(p, t.cau); bong.appendChild(p); q.appendChild(bong); cha.appendChild(q);
    var h = el("div", "th-phieu-nut"); cha.appendChild(h);
    var b = hopBit(cha);
    var may = el("div", "th-by"); may.hidden = true; cha.appendChild(may);
    t.doan.forEach(function (x) {
      var n = nut("th-phieu-chon", x.chu);
      n.addEventListener("click", function () {
        [].slice.call(h.children).forEach(function (m, k) { m.disabled = true; if (t.doan[k].dung) m.classList.add("is-dung"); else if (m === n) m.classList.add("is-sai"); });
        bit(b, [(x.dung ? "✓ " : "✗ ") + t.giai, t.bai_hoc], x.dung ? "dung" : "sai");
        may.hidden = false; ve(); cuon(may);
        do_(D.trang + "-bayes", { dung: !!x.dung });
      });
      h.appendChild(n);
    });
    var khung = el("div", "th-by-khung"); may.appendChild(khung);
    function thanh(nhan, min, max, gt) {
      var w = el("label", "th-by-thanh"), tx = el("span", null, nhan + " "), so = el("b"); tx.appendChild(so); w.appendChild(tx);
      var r = el("input"); r.type = "range"; r.min = min; r.max = max; r.step = 0.5; r.value = gt; w.appendChild(r);
      r.addEventListener("input", ve); khung.appendChild(w); return { r: r, so: so };
    }
    var tl = thanh(N.by_ty_le, 0.5, 50, t.mac.ty_le), nh = thanh(N.by_nhay, 50, 99.5, t.mac.nhay), dh = thanh(N.by_dac, 50, 99.5, t.mac.dac);
    var luoi = el("div", "th-by-luoi"); luoi.setAttribute("role", "img"); may.appendChild(luoi);
    var o = []; for (var i = 0; i < 1000; i++) { var s = el("i"); luoi.appendChild(s); o.push(s); }
    var ct = el("div", "th-by-ct"); may.appendChild(ct);
    var ket = el("p", "th-by-ket"); may.appendChild(ket);
    function so(x) { return String(x).replace(".", N.dau_thap_phan); }
    function ve() {
      var pr = +tl.r.value / 100, se = +nh.r.value / 100, sp = +dh.r.value / 100;
      tl.so.textContent = so(tl.r.value) + "%"; nh.so.textContent = so(nh.r.value) + "%"; dh.so.textContent = so(dh.r.value) + "%";
      var benh = Math.round(1000 * pr), tp = Math.round(benh * se), fn = benh - tp, khong = 1000 - benh, fp = Math.round(khong * (1 - sp)), tn = khong - fp, k = 0;
      [["tp", tp], ["fn", fn], ["fp", fp], ["tn", tn]].forEach(function (x) { for (var j = 0; j < x[1]; j++) o[k++].className = "is-" + x[0]; });
      ct.textContent = "";
      [["tp", tp], ["fp", fp], ["fn", fn], ["tn", tn]].forEach(function (x) { var c = el("span", "is-" + x[0]); c.appendChild(el("i")); c.appendChild(el("b", null, String(x[1]))); c.appendChild(document.createTextNode(" " + N["by_" + x[0]])); ct.appendChild(c); });
      var duong = tp + fp, ppv = duong ? Math.round(tp / duong * 100) : 0;
      ket.textContent = ""; ket.appendChild(el("span", "th-by-so", ppv + "%")); ket.appendChild(document.createTextNode(" " + thay(N.by_ppv, { d: duong, tp: tp })));
      luoi.setAttribute("aria-label", ket.textContent);
    }
  }

  var KIEU = { "phan-loai": phanLoai, "bo-phieu": boPhieu, ghep: ghep, chat: chat, "tim-loi": function (c, t) { timLoi(c, t, false); }, "sua-loi": function (c, t) { timLoi(c, t, true); }, "chon-ban": chonBan, giong: giong, "ke-hoach": keHoach,
    "xep-buoc": xepBuoc, "cham-tieu-chi": chamTieuChi, "vi-du": viDu, bayes: bayes };
  D.tram.forEach(function (t) { var c = $("th-o-" + t.id); if (c && KIEU[t.loai]) KIEU[t.loai](c, t); });
  if (goc) {
    var q = (location.search.match(/[?&]tram=([\w-]+)/) || [])[1] || location.hash.slice(1);
    moTram(q || D.tram[0].id, false);
  }
})();

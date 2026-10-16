/* Trò chơi "Dán hay không dán?" (dan-hay-khong.html, en/), video 121 "Dữ liệu của bạn đi đâu khi chat với AI".
   Mỗi thẻ là một thứ người chơi định dán vào chatbot. Chọn: Dán thoải mái / Che bớt rồi dán / Đừng dán.
   Sau khi chọn: đoạn cần che lật thành bản đã che (Nhân viên A, [địa chỉ]...), đoạn không được dán tô đỏ.
   Dữ liệu: thẻ <script id="dk-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/dan-hay-khong.json.
   Không gọi AI, không lưu gì ngoài vài sự kiện đếm (theo-doi.js). Chạy thử: ?do=thu, trạng thái ở window.__dk. */
(function () {
  "use strict";
  var nguon = document.getElementById("dk-du-lieu");
  var san = document.getElementById("dk-san");
  if (!nguon || !san) return;
  var D = JSON.parse(nguon.textContent);
  var N = D.nhan, THE = D.the;
  var tien = document.getElementById("dk-tien"), diemEl = document.getElementById("dk-diem"), ket = document.getElementById("dk-ket");
  var CHON = [["dan", "✅", N.dan], ["che", "✂️", N.che], ["khong", "⛔", N.khong]];
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

  function batDau() {
    S = { i: 0, dung: 0, sai: [], xong: false };
    window.__dk = S;
    ket.hidden = true;
    san.hidden = false;
    ve();
  }

  function ve() {
    var c = THE[S.i];
    S.daChon = false;
    tien.textContent = N.the + " " + (S.i + 1) + "/" + THE.length;
    diemEl.textContent = N.diem + ": " + S.dung;
    san.innerHTML = "";
    var o = el("div", "dk-o");

    // Cửa sổ chatbot giả lập, thứ định dán nằm sẵn trong ô nhập
    var cs = el("div", "dk-chat");
    var dau = el("div", "dk-chat-dau");
    var av = el("span", "dk-chat-av", "AI");
    av.setAttribute("aria-hidden", "true");
    dau.appendChild(av);
    var ten = el("div");
    ten.appendChild(el("b", null, N.tro_ly));
    ten.appendChild(el("span", null, N.tk_ca_nhan));
    dau.appendChild(ten);
    cs.appendChild(dau);
    var than = el("div", "dk-chat-than");
    var viec = el("p", "dk-viec");
    viec.appendChild(el("span", null, N.ban_dinh));
    viec.appendChild(el("b", null, c.viec));
    than.appendChild(viec);
    cs.appendChild(than);
    var o_nhap = el("div", "dk-nhap");
    var dan = el("p", "dk-dan");
    c.doan.forEach(function (x) {
      var s = el("span", "dk-doan" + (x.thay ? " is-che" : "") + (x.nhay ? " is-nhay" : ""), x.chu);
      if (x.thay) s.dataset.thay = x.thay;
      dan.appendChild(s);
    });
    o_nhap.appendChild(el("span", "dk-nhap-nhan", N.dang_dan));
    o_nhap.appendChild(dan);
    var gui = el("span", "dk-gui", "↑");
    gui.setAttribute("aria-hidden", "true");
    o_nhap.appendChild(gui);
    cs.appendChild(o_nhap);
    o.appendChild(cs);

    var ben = el("div", "dk-ben");
    ben.appendChild(el("p", "dk-hoi", N.hoi));
    var chon = el("div", "dk-chon");
    CHON.forEach(function (x) {
      var b = el("button", "btn dk-nut dk-nut-" + x[0]);
      b.type = "button";
      b.appendChild(el("span", "dk-nut-ic", x[1]));
      b.appendChild(el("span", null, x[2]));
      b.addEventListener("click", function () { tra(x[0], cs); });
      chon.appendChild(b);
    });
    ben.appendChild(chon);
    o.appendChild(ben);
    san.appendChild(o);
    if (S.i === 0) do_("dan-bat-dau");
  }

  function tra(chon, cs) {
    if (S.daChon) return;
    S.daChon = true;
    var c = THE[S.i];
    var dung = chon === c.dap_an;
    if (dung) S.dung++; else S.sai.push(c);
    diemEl.textContent = N.diem + ": " + S.dung;

    // Lật đoạn cần che thành bản đã che; tô đỏ đoạn không được dán
    cs.classList.add("is-" + c.dap_an);
    cs.querySelectorAll(".dk-doan.is-che").forEach(function (s, k) {
      setTimeout(function () { s.textContent = s.dataset.thay; s.classList.add("is-da-che"); }, 250 + k * 220);
    });
    if (c.dap_an === "khong") cs.querySelector(".dk-nhap").appendChild(el("span", "dk-dau-moc", "⛔ " + N.khong));
    else cs.querySelector(".dk-nhap").appendChild(el("span", "dk-dau-moc is-ok", c.dap_an === "che" ? "✂️ " + N.da_che : "✅ " + N.an_toan));

    var ben = san.querySelector(".dk-ben");
    ben.querySelectorAll(".dk-nut").forEach(function (b) {
      b.disabled = true;
      if (b.classList.contains("dk-nut-" + c.dap_an)) b.classList.add("is-dap-an");
      else if (b.classList.contains("dk-nut-" + chon)) b.classList.add("is-sai");
    });
    var ph = el("div", "ld-phan-hoi dk-ph " + (dung ? "is-dung" : "is-sai"));
    ph.appendChild(anh(dung ? "bit-vui.svg" : "bit-sai-roi.svg", 64));
    var chu = el("div");
    var nhan = CHON.filter(function (x) { return x[0] === c.dap_an; })[0];
    chu.appendChild(el("b", "ld-ph-dau", (dung ? N.dung : N.sai) + " " + nhan[1] + " " + nhan[2] + "."));
    chu.appendChild(el("p", "ld-ph-chu", c.giai));
    ph.appendChild(chu);
    ben.appendChild(ph);

    var nut = el("div", "cta ld-sau");
    var tiep = el("button", "btn btn-yt", S.i + 1 < THE.length ? N.tiep + " ›" : N.xem_ket);
    tiep.type = "button";
    tiep.addEventListener("click", function () {
      if (S.i + 1 < THE.length) { S.i++; ve(); san.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else ketThuc();
    });
    nut.appendChild(tiep);
    ben.appendChild(nut);
    tiep.focus({ preventScroll: true });
    do_("dan-tra-loi", { the: c.id, dung: dung ? "dung" : "sai" });
  }

  function ketThuc() {
    S.xong = true;
    san.hidden = true;
    ket.hidden = false;
    tien.textContent = "";
    diemEl.textContent = "";
    document.getElementById("dk-ket-so").textContent = S.dung + "/" + THE.length;
    var hang = N.hang.filter(function (h) { return S.dung >= h[0]; })[0];
    document.getElementById("dk-ket-hang").textContent = hang[1];
    var sai = {};
    S.sai.forEach(function (c) { sai[c.dap_an] = (sai[c.dap_an] || 0) + 1; });
    document.getElementById("dk-ket-phu").textContent = S.sai.length ? N.sai_nhieu + " " + CHON.filter(function (x) { return sai[x[0]]; }).map(function (x) { return x[2] + " (" + sai[x[0]] + ")"; }).join(", ") : N.het_sai;
    ket.scrollIntoView({ behavior: "smooth", block: "start" });
    do_("dan-xong", { diem: String(S.dung) });
    do_("hoc-xong", { loai: "dan-hay-khong" });
  }

  ket.querySelectorAll("[data-so-video]").forEach(function (a) {
    a.addEventListener("click", function () { do_("dan-xem-video", { so: a.getAttribute("data-so-video") }); });
  });
  var cd = document.getElementById("dk-cai-dat");
  if (cd) cd.addEventListener("change", function () { if (cd.checked) do_("dan-cai-dat"); });
  document.getElementById("dk-lai").addEventListener("click", function () { batDau(); san.scrollIntoView({ behavior: "smooth", block: "start" }); });
  batDau();
})();

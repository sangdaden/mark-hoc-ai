// Game "Mark phiêu lưu" (phieu-luu.html + en/phieu-luu.html): Mark đi qua 5 trạm trên bản đồ,
// mỗi trạm là một bộ "co-ban" trong data/bo-kiem-tra.json, trạm cuối là trùm trộn câu của cả 4 bộ.
// Tiến độ lưu ở localStorage "mhai-phieu-luu" ({mo: số trạm đã mở, sao: {id: 1-3}}).
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var GOC = EN ? "../" : "";
  var KHOA = "mhai-phieu-luu";
  var T = EN ? {
    dung: "True", sai: "False", tiep: "Next", xong: "Back to the map", lai: "Try again",
    hp: "Boss health", tim: "Hearts", cau: "Question", dungRoi: "Correct!", saiRoi: "Not quite.",
    qua: "Station cleared!", truot: "Out of hearts", quaTxt: function (s) { return "You earned " + s + " of 3 stars."; },
    truotTxt: "Bit says: watch the explanations, then try again. You keep your progress.",
    khoa: "Clear the previous station first.", choi: "Play", choiLai: "Play again",
    can: function (n) { return "Answer " + n + " questions correctly. 3 hearts."; },
    canBoss: "Hit the boss 6 times with correct answers. 3 hearts.",
    thang: "You beat the Hallucination Cave!", thangTxt: function (s) { return "Total: " + s + " of 15 stars. Take the full quiz to earn your certificate."; },
    tongSao: function (s) { return s + " / 15 stars"; }, xoa: "Reset progress", xoaHoi: "Reset all stations?",
    loi: "Couldn't load the questions. Please reload the page.", ra: "Leave"
  } : {
    dung: "Đúng", sai: "Sai", tiep: "Câu tiếp", xong: "Về bản đồ", lai: "Chơi lại trạm này",
    hp: "Máu trùm", tim: "Tim", cau: "Câu", dungRoi: "Chính xác!", saiRoi: "Chưa đúng rồi.",
    qua: "Qua trạm!", truot: "Hết tim rồi", quaTxt: function (s) { return "Bạn được " + s + " trên 3 sao."; },
    truotTxt: "Bit nhắn: đọc kỹ lời giải thích rồi thử lại nhé. Các trạm đã qua vẫn được giữ.",
    khoa: "Qua trạm trước để mở trạm này.", choi: "Chơi", choiLai: "Chơi lại",
    can: function (n) { return "Trả lời đúng " + n + " câu. Có 3 tim."; },
    canBoss: "Trả lời đúng 6 lần để hạ trùm. Có 3 tim.",
    thang: "Bạn đã hạ Hang Ảo Giác!", thangTxt: function (s) { return "Tổng cộng " + s + " trên 15 sao. Làm bài kiểm tra đầy đủ để nhận giấy chứng nhận."; },
    tongSao: function (s) { return s + " / 15 sao"; }, xoa: "Chơi lại từ đầu", xoaHoi: "Xóa tiến độ của tất cả các trạm?",
    loi: "Không tải được câu hỏi. Bạn tải lại trang nhé.", ra: "Rời trạm"
  };
  // Vị trí trạm trên bản đồ dọc (viewBox 400 x 900), từ dưới lên.
  var TRAM = [
    {id: "hieu-lam", x: 110, y: 790, ten: EN ? "Myth Village" : "Làng Hiểu Lầm", can: 4},
    {id: "prompt", x: 290, y: 630, ten: EN ? "Prompt Workshop" : "Xưởng Prompt", can: 4},
    {id: "an-toan", x: 110, y: 470, ten: EN ? "Safety Fort" : "Pháo đài An toàn", can: 4},
    {id: "cong-viec", x: 290, y: 310, ten: EN ? "AI Office" : "Văn phòng AI", can: 4},
    {id: "boss", x: 200, y: 140, ten: EN ? "Hallucination Cave" : "Hang Ảo Giác", can: 6, boss: true}
  ];
  var MO_TA = EN ? {
    "hieu-lam": "True or false? Bust the AI myths everyone has heard.",
    "prompt": "Pick the prompt that gets a useful answer.",
    "an-toan": "Spot scams, deepfakes and data you should never paste.",
    "cong-viec": "Use AI at work without getting burned.",
    "boss": "Mixed questions from every station. The boss fights back with confident nonsense."
  } : {
    "hieu-lam": "Đúng hay sai? Phá những hiểu lầm về AI ai cũng từng nghe.",
    "prompt": "Chọn cách hỏi để AI trả lời có ích.",
    "an-toan": "Nhận ra lừa đảo, deepfake và dữ liệu không được dán vào AI.",
    "cong-viec": "Dùng AI trong công việc mà không bị hớ.",
    "boss": "Câu hỏi trộn từ mọi trạm. Trùm phản đòn bằng những câu bịa rất tự tin."
  };

  var $ = function (s, g) { return (g || document).querySelector(s); };
  var bo = {}, tienDo = doc(), ban, hop;

  function doc() {
    try { var v = JSON.parse(localStorage.getItem(KHOA)); if (v && typeof v.mo === "number") return v; } catch (e) {}
    return {mo: 1, sao: {}};
  }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(tienDo)); } catch (e) {} }
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function tongSao() { var s = 0; for (var k in tienDo.sao) s += tienDo.sao[k]; return s; }

  function taiDuLieu() {
    var ds = [fetch(GOC + "data/bo-kiem-tra.json").then(function (r) { return r.json(); })];
    if (EN) ds.push(fetch(GOC + "data/en/bo-kiem-tra.json").then(function (r) { return r.json(); }));
    return Promise.all(ds).then(function (kq) {
      var vi = kq[0], en = kq[1], enTheoId = {};
      if (en) en.bo.forEach(function (b) { enTheoId[b.id] = b; });
      vi.bo.forEach(function (b) {
        if (b.nhom !== "co-ban") return;
        var dich = enTheoId[b.id];
        bo[b.id] = b.cau_hoi.map(function (q, i) {
          var d = dich ? dich.cau_hoi[i] : null;
          return {loai: q.loai, cau: d ? d.cau : q.cau, giai_thich: d ? d.giai_thich : q.giai_thich,
            lua_chon: d && d.lua_chon ? d.lua_chon : q.lua_chon, dap_an: q.dap_an, dung: q.dung, bo: b.id};
        });
      });
      bo.boss = [].concat(bo["hieu-lam"], bo.prompt, bo["an-toan"], bo["cong-viec"]);
    });
  }

  // ---------- Bản đồ ----------
  function veBanDo() {
    var NS = "http://www.w3.org/2000/svg", svg = $("#pl-svg");
    var d = "M" + TRAM[0].x + " " + (TRAM[0].y + 90);
    TRAM.forEach(function (t, i) {
      var truoc = i ? TRAM[i - 1] : {x: TRAM[0].x, y: TRAM[0].y + 90};
      d += " C" + truoc.x + " " + (truoc.y - 80) + " " + t.x + " " + (t.y + 80) + " " + t.x + " " + t.y;
    });
    var duong = document.createElementNS(NS, "path");
    duong.setAttribute("d", d); duong.setAttribute("class", "pl-duong");
    svg.appendChild(duong);
    var lop = $("#pl-tram");
    TRAM.forEach(function (t, i) {
      var b = el("button", "pl-nut" + (t.boss ? " is-boss" : ""));
      b.type = "button";
      b.style.left = (t.x / 4) + "%"; b.style.top = (t.y / 9) + "%";
      b.dataset.i = i;
      b.innerHTML = '<span class="pl-so">' + (t.boss ? "!" : i + 1) + '</span><span class="pl-ten"></span><span class="pl-sao" aria-hidden="true"></span>';
      $(".pl-ten", b).textContent = t.ten;
      b.addEventListener("click", function () { moTram(i); });
      lop.appendChild(b);
    });
    capNhatBanDo(false);
  }

  function capNhatBanDo(diChuyen) {
    var mark = $("#pl-mark");
    var hienTai = Math.min(tienDo.mo, TRAM.length) - 1;
    document.querySelectorAll(".pl-nut").forEach(function (b, i) {
      var t = TRAM[i], sao = tienDo.sao[t.id] || 0, mo = i < tienDo.mo;
      b.classList.toggle("is-khoa", !mo);
      b.classList.toggle("is-xong", sao > 0);
      $(".pl-sao", b).textContent = sao ? "★★★".slice(0, sao) + "☆☆☆".slice(sao) : "";
      b.setAttribute("aria-label", t.ten + (mo ? (sao ? " · " + sao + "/3 ★" : "") : " · " + T.khoa));
    });
    var t = TRAM[hienTai];
    mark.classList.toggle("is-di", !!diChuyen);
    mark.style.left = (t.x / 4) + "%"; mark.style.top = (t.y / 9) + "%";
    $("#pl-tong").textContent = T.tongSao(tongSao());
  }

  // ---------- Trạm ----------
  var luot;
  function moTram(i) {
    var t = TRAM[i];
    if (i >= tienDo.mo) { thongBao(T.khoa); return; }
    if (!bo[t.id] || !bo[t.id].length) { thongBao(T.loi); return; }
    luot = {tram: t, i: i, tim: 3, dung: 0, sai: 0, hang: tron(bo[t.id]), so: 0};
    $("#pl-hop-ten").textContent = t.ten;
    $("#pl-hop-mo-ta").textContent = MO_TA[t.id] + " " + (t.boss ? T.canBoss : T.can(t.can));
    $("#pl-boss").hidden = !t.boss;
    hop.classList.toggle("is-boss", !!t.boss);
    if (hop.showModal) hop.showModal(); else hop.setAttribute("open", "");
    cauMoi();
  }

  function thanhTrang() {
    var tim = "";
    for (var k = 0; k < 3; k++) tim += k < luot.tim ? "♥" : "♡";
    $("#pl-tim").textContent = tim;
    $("#pl-tim").setAttribute("aria-label", T.tim + ": " + luot.tim + "/3");
    $("#pl-tien").textContent = luot.dung + " / " + luot.tram.can;
    if (luot.tram.boss) {
      var con = luot.tram.can - luot.dung;
      $("#pl-hp-thanh").style.width = (con / luot.tram.can * 100) + "%";
      $("#pl-boss").setAttribute("aria-label", T.hp + ": " + con + "/" + luot.tram.can);
    }
  }

  function cauMoi() {
    if (!luot.hang.length) luot.hang = tron(bo[luot.tram.id]);
    var q = luot.hang.pop(), vung = $("#pl-cau");
    luot.so++;
    thanhTrang();
    vung.innerHTML = "";
    vung.appendChild(el("p", "pl-cau-so", T.cau + " " + luot.so));
    vung.appendChild(el("p", "pl-cau-chu", q.cau));
    var nuts = el("div", "pl-chon" + (q.loai === "dung-sai" ? " is-ds" : ""));
    var phuongAn;
    if (q.loai === "dung-sai") phuongAn = [{chu: T.dung, dung: q.dung === true}, {chu: T.sai, dung: q.dung === false}];
    else phuongAn = tron(q.lua_chon.map(function (c, k) { return {chu: c, dung: k === q.dap_an}; }));
    phuongAn.forEach(function (p) {
      var b = el("button", "pl-pa", p.chu); b.type = "button";
      b.addEventListener("click", function () { traLoi(q, p, b, nuts); });
      nuts.appendChild(b);
    });
    vung.appendChild(nuts);
    $("#pl-phan-hoi").hidden = true;
    var dau = $(".pl-pa", nuts); if (dau) dau.focus();
  }

  function traLoi(q, p, nut, nuts) {
    nuts.querySelectorAll(".pl-pa").forEach(function (b) { b.disabled = true; });
    nut.classList.add(p.dung ? "is-dung" : "is-sai");
    if (!p.dung) {
      // tô luôn phương án đúng để người chơi thấy
      var dsPa = nuts.querySelectorAll(".pl-pa");
      if (q.loai === "dung-sai") dsPa[q.dung ? 0 : 1].classList.add("is-dung");
      else dsPa.forEach(function (b) { if (b.textContent === q.lua_chon[q.dap_an]) b.classList.add("is-dung"); });
    }
    if (p.dung) luot.dung++; else { luot.tim--; luot.sai++; }
    thanhTrang();
    if (luot.tram.boss && p.dung) { var bh = $("#pl-boss-hinh"); bh.classList.remove("is-trung"); void bh.offsetWidth; bh.classList.add("is-trung"); }
    var ph = $("#pl-phan-hoi");
    $("#pl-bit").src = GOC + "assets/" + (p.dung ? "bit-vui.svg" : "bit-sai-roi.svg");
    $("#pl-ph-dau").textContent = p.dung ? T.dungRoi : T.saiRoi;
    $("#pl-ph-dau").className = p.dung ? "pl-ok" : "pl-no";
    $("#pl-ph-chu").textContent = q.giai_thich;
    var tiep = $("#pl-tiep");
    var het = luot.dung >= luot.tram.can || luot.tim <= 0;
    tiep.textContent = het ? (luot.tim > 0 ? T.qua : T.truot) + " →" : T.tiep;
    tiep.onclick = het ? ketThuc : cauMoi;
    ph.hidden = false;
    tiep.focus();
  }

  function ketThuc() {
    var vung = $("#pl-cau"), qua = luot.tim > 0, t = luot.tram;
    $("#pl-phan-hoi").hidden = true;
    vung.innerHTML = "";
    var kq = el("div", "pl-kq");
    var hinh = el("img"); hinh.alt = ""; hinh.width = 140; hinh.height = 140;
    hinh.src = GOC + "assets/mascot/" + (qua ? "mark-chien-thang.webp" : "mark-dau-dau.webp");
    kq.appendChild(hinh);
    if (qua) {
      var sao = Math.max(1, 3 - luot.sai);
      tienDo.sao[t.id] = Math.max(tienDo.sao[t.id] || 0, sao);
      var moi = luot.i + 2 > tienDo.mo;
      if (moi) tienDo.mo = Math.min(luot.i + 2, TRAM.length);
      luu();
      if (t.boss) {
        kq.appendChild(el("h3", null, T.thang));
        kq.appendChild(el("p", "pl-kq-sao", "★★★".slice(0, sao) + "☆☆☆".slice(sao)));
        kq.appendChild(el("p", null, T.thangTxt(tongSao())));
        var a = el("a", "btn btn-yt", EN ? "Take the quiz" : "Làm bài kiểm tra"); a.href = "kiem-tra.html";
        var c = el("a", "btn", EN ? "Certificates" : "Giấy chứng nhận"); c.href = "chung-nhan.html";
        var hang = el("div", "pl-kq-nut"); hang.appendChild(a); hang.appendChild(c); kq.appendChild(hang);
        document.body.classList.add("pl-thang");
      } else {
        kq.appendChild(el("h3", null, T.qua));
        kq.appendChild(el("p", "pl-kq-sao", "★★★".slice(0, sao) + "☆☆☆".slice(sao)));
        kq.appendChild(el("p", null, T.quaTxt(sao)));
      }
      var ve = el("button", "btn" + (t.boss ? "" : " btn-yt"), T.xong); ve.type = "button";
      ve.addEventListener("click", function () { dongHop(true); });
      kq.appendChild(ve);
    } else {
      kq.appendChild(el("h3", null, T.truot));
      kq.appendChild(el("p", null, T.truotTxt));
      var lai = el("button", "btn btn-yt", T.lai); lai.type = "button";
      lai.addEventListener("click", function () { moTram(luot.i); });
      var ve2 = el("button", "btn", T.xong); ve2.type = "button";
      ve2.addEventListener("click", function () { dongHop(false); });
      var h2 = el("div", "pl-kq-nut"); h2.appendChild(lai); h2.appendChild(ve2); kq.appendChild(h2);
    }
    vung.appendChild(kq);
    var nut = $("button", kq); if (nut) nut.focus();
  }

  function dongHop(diChuyen) {
    if (hop.close) hop.close(); else hop.removeAttribute("open");
    capNhatBanDo(diChuyen);
  }

  function thongBao(chu) {
    var b = $("#pl-bao"); b.textContent = chu; b.hidden = false;
    clearTimeout(thongBao.h); thongBao.h = setTimeout(function () { b.hidden = true; }, 2600);
  }

  function batDau() {
    ban = $("#pl-ban"); hop = $("#pl-hop");
    if (!ban || !hop) return;
    veBanDo();
    $("#pl-ra").addEventListener("click", function () { dongHop(false); });
    hop.addEventListener("cancel", function () { setTimeout(function () { capNhatBanDo(false); }, 0); });
    $("#pl-xoa").textContent = T.xoa;
    $("#pl-xoa").addEventListener("click", function () {
      if (!confirm(T.xoaHoi)) return;
      tienDo = {mo: 1, sao: {}}; luu(); document.body.classList.remove("pl-thang"); capNhatBanDo(true);
    });
    taiDuLieu().catch(function () { thongBao(T.loi); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", batDau); else batDau();
})();

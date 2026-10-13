// Trang kiểm tra (kiem-tra.html, en/kiem-tra.html): chọn một bộ câu hỏi, trả lời từng câu, xem giải thích ngay.
// Dữ liệu nằm sẵn trong trang (<script id="du-lieu">, do scripts/tao_bai_viet.py ghi từ data/bo-kiem-tra.json).
// Câu "dung-sai" có hai nút Đúng/Sai; câu "chon" có 4 lựa chọn, xáo thứ tự mỗi lần làm. Điểm cao nhất lưu qua chung-nhan.js để mở khóa chứng nhận.
(function () {
  const EN = document.documentElement.lang === "en", goc = EN ? "../" : "";
  const D = JSON.parse(document.getElementById("du-lieu").textContent);
  const CC = window.MHAI_CC;
  const S = EN ? {
    cau: (i, n) => "Question " + i + "/" + n, ketQua: "Results", dung: n => "Correct " + n, so: i => "Question " + i,
    d: "True", s: "False", dungRoi: "Correct!", chuaDung: "Not quite.", cauNay: d => " This statement is " + (d ? "true" : "a misconception") + ".",
    dapAn: x => " The answer: " + x + ".", xemThem: "Read more: ", tiep: "Next question ›", xemKq: "See results",
    diem: (d, n) => d + "/" + n + " correct",
    loi: [r => r === 1 && "Excellent! You got every single one. Invite your friends and see how they do.",
      r => r >= .8 && "Great job! A couple of articles below will get you to a perfect score.",
      r => r >= .5 && "Not bad. A few gaps are left, and the articles below will fill them.",
      () => "No worries, everyone starts somewhere. Begin with the articles below. Each one takes about a minute."],
    xemLai: n => "Review the " + n + (n === 1 ? " question" : " questions") + " you missed", banChon: "Your answer: ", dapAnDung: "Correct answer: ",
    nenXem: "Read next", diTiep: "Keep going with the channel", chiaSe: "Share your score", lamLai: "Try again", boKhac: "Pick another quiz",
    moKhoa: t => "You unlocked the certificate “" + t + "”.", nhan: "Get my certificate", canDat: (k, n) => "Get " + k + "/" + n + " or more to unlock a certificate with your name.",
    nganhThem: "For the field certificate, also tick off every video in this field's learning path.", loTrinh: "Open the learning path",
    caoNhat: (d, n) => "Best " + d + "/" + n, coCc: "Certificate unlocked",
    chiaSeChu: (d, n, t) => "I got " + d + "/" + n + " on the “" + t + "” quiz from Mark học AI. How many can you get?",
    daChep: "Link copied. Paste it into a message to send to your friends.", chepTay: "Copy this link to send to your friends: "
  } : {
    cau: (i, n) => "Câu " + i + "/" + n, ketQua: "Kết quả", dung: n => "Đúng " + n, so: i => "Câu " + i,
    d: "Đúng", s: "Sai", dungRoi: "Chính xác!", chuaDung: "Chưa đúng.", cauNay: d => " Câu này " + (d ? "đúng" : "là hiểu lầm") + ".",
    dapAn: x => " Đáp án: " + x + ".", xemThem: "Xem thêm: ", tiep: "Câu tiếp theo ›", xemKq: "Xem kết quả",
    diem: (d, n) => d + "/" + n + " câu đúng",
    loi: [r => r === 1 && "Xuất sắc! Bạn đúng hết. Rủ bạn bè làm thử xem họ được mấy điểm.",
      r => r >= .8 && "Rất tốt! Xem lại vài video bên dưới là đủ điểm tuyệt đối.",
      r => r >= .5 && "Khá ổn. Vẫn còn vài chỗ hổng, mấy video bên dưới sẽ lấp giúp bạn.",
      () => "Không sao, ai cũng bắt đầu từ đây. Xem các video bên dưới, mỗi video chỉ khoảng một phút."],
    xemLai: n => "Xem lại " + n + " câu chưa đúng", banChon: "Bạn chọn: ", dapAnDung: "Đáp án đúng: ",
    nenXem: "Nên xem tiếp", diTiep: "Đi tiếp cùng kênh", chiaSe: "Chia sẻ kết quả", lamLai: "Làm lại", boKhac: "Chọn bộ khác",
    moKhoa: t => "Bạn đã mở khóa giấy chứng nhận “" + t + "”.", nhan: "Nhận giấy chứng nhận", canDat: (k, n) => "Đạt từ " + k + "/" + n + " câu để mở khóa giấy chứng nhận có tên bạn.",
    nganhThem: "Muốn có giấy chứng nhận chuyên ngành, bạn đánh dấu xem xong các video trong lộ trình ngành này nữa nhé.", loTrinh: "Mở lộ trình ngành",
    caoNhat: (d, n) => "Cao nhất " + d + "/" + n, coCc: "Đã có chứng nhận",
    chiaSeChu: (d, n, t) => "Mình được " + d + "/" + n + " câu trong bài kiểm tra “" + t + "” của Mark học AI. Bạn được mấy câu?",
    daChep: "Đã chép link, dán vào tin nhắn để gửi bạn bè.", chepTay: "Chép link này để gửi bạn bè: "
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const link = v => '<a href="' + v.url + '">#' + String(v.so).padStart(2, "0") + " · " + esc(v.ten) + "</a>";
  const xao = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const canDat = n => Math.ceil(n * D.dat - 1e-9);
  const mo = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const chonEl = document.getElementById("kt-bo"), quiz = document.getElementById("quiz"), khung = document.getElementById("khung");
  const tienDo = document.getElementById("tien-do"), diemTam = document.getElementById("diem-tam"), thanh = document.getElementById("thanh");
  const byId = {};
  D.bo.forEach(b => { byId[b.id] = b; });

  // Điểm cao nhất trên từng thẻ chọn bộ
  function veDiem() {
    const kq = CC.ketQua();
    document.querySelectorAll("[data-diem]").forEach(el => {
      const r = kq[el.dataset.diem];
      el.textContent = r ? S.caoNhat(r.dung, r.tong) : "";
      el.classList.toggle("is-dat", !!(r && CC.datBo(r)));
      el.title = r && CC.datBo(r) ? S.coCc : "";
    });
  }

  let B, Q, i, dung, sai;
  const do_ = (t, d) => window.mhaiDo && window.mhaiDo(t, d); // đếm tương tác, xem theo-doi.js
  function batDau(id, cuon) {
    B = byId[id] || D.bo[0];
    // Xáo câu và xáo lựa chọn; mỗi lựa chọn nhớ mình có phải đáp án không
    Q = xao(B.cau_hoi).map(c => c.loai === "chon" ? Object.assign({}, c, { opts: xao(c.lua_chon.map((x, k) => ({ x, ok: k === c.dap_an }))) }) : c);
    i = 0; dung = 0; sai = [];
    document.getElementById("kt-ten-bo").textContent = B.ten;
    chonEl.hidden = true; quiz.hidden = false;
    cauHoi();
    do_("kiem-tra-bat-dau", { bo: B.id });
    if (cuon) quiz.scrollIntoView({ behavior: mo, block: "start" });
  }
  function capNhat(soHien) {
    tienDo.textContent = soHien ? S.cau(soHien, Q.length) : S.ketQua;
    diemTam.textContent = S.dung(dung);
    thanh.style.width = (Math.min(i, Q.length) / Q.length * 100) + "%";
  }
  function cauHoi() {
    const q = Q[i];
    capNhat(i + 1);
    const nut = q.loai === "chon"
      ? '<div class="q-opts">' + q.opts.map((o, k) => '<button class="q-btn q-opt" data-k="' + k + '">' + esc(o.x) + "</button>").join("") + "</div>"
      : '<div class="q-btns"><button class="q-btn" data-v="1">' + S.d + '</button><button class="q-btn" data-v="0">' + S.s + "</button></div>";
    khung.innerHTML = '<div class="q-head"><img class="q-bit" src="' + goc + 'assets/bit-y-tuong.svg" alt="" width="64" height="77"><div><p class="q-num">' + S.so(i + 1) +
      '</p><h2 class="q-text" tabindex="-1">' + esc(q.cau) + "</h2></div></div>" + nut + '<div id="giai"></div>';
    khung.querySelector(".q-text").focus({ preventScroll: true });
  }
  function tra(b) {
    const q = Q[i];
    let ok, chon, dapAn;
    if (q.loai === "chon") {
      const o = q.opts[+b.dataset.k];
      ok = o.ok; chon = o.x; dapAn = q.opts.find(x => x.ok).x;
      khung.querySelectorAll(".q-btn").forEach(x => { x.disabled = true; const oo = q.opts[+x.dataset.k]; if (oo.ok) x.classList.add("is-right"); else if (x === b) x.classList.add("is-wrong"); });
    } else {
      const v = b.dataset.v === "1";
      ok = v === q.dung; chon = v ? S.d : S.s; dapAn = q.dung ? S.d : S.s;
      khung.querySelectorAll(".q-btn").forEach(x => { x.disabled = true; if ((x.dataset.v === "1") === q.dung) x.classList.add("is-right"); else if (x === b) x.classList.add("is-wrong"); });
    }
    if (ok) dung++; else sai.push({ q, chon, dapAn });
    const cuoi = i === Q.length - 1, m = ok ? "mark-chien-thang" : "mark-dau-dau";
    const loiPhan = q.loai === "chon" ? (ok ? "" : S.dapAn(esc(dapAn))) : S.cauNay(q.dung);
    document.getElementById("giai").innerHTML = '<div class="q-fb ' + (ok ? "ok" : "no") + '"><picture class="q-bit q-mascot"><source media="(prefers-reduced-motion: reduce)" srcset="' + goc + "assets/mascot/" + m +
      '-tinh.webp"><img src="' + goc + "assets/mascot/" + m + '.webp" alt="" width="' + (ok ? 114 : 94) + '" height="150"></picture><div><p class="q-verdict">' + (ok ? S.dungRoi : S.chuaDung) + loiPhan +
      "</p><p>" + esc(q.giai_thich) + '</p><p class="q-more">' + S.xemThem + q.video.map(link).join(", ") + "</p></div></div>" +
      '<button class="btn btn-yt q-next" id="tiep">' + (cuoi ? S.xemKq : S.tiep) + "</button>";
    i++;
    capNhat(i);
    const tiep = document.getElementById("tiep");
    tiep.addEventListener("click", () => { if (i < Q.length) cauHoi(); else ketQua(); });
    tiep.focus({ preventScroll: true });
    tiep.scrollIntoView({ block: "nearest", behavior: mo });
  }
  function ketQua() {
    capNhat();
    const n = Q.length, r = dung / n;
    CC.ghiDiem(B.id, dung, n);
    const loi = S.loi.map(f => f(r)).find(Boolean);
    const goiY = [], daCo = {};
    sai.forEach(s => s.q.video.forEach(v => { if (!daCo[v.so]) { daCo[v.so] = 1; goiY.push(v); } }));
    const ds = goiY.length ? goiY : D.goi_y_gioi;
    const dat = r >= D.dat - 1e-9;
    do_("kiem-tra-xong", { bo: B.id, diem: dung + "/" + n, dat: dat ? "co" : "khong" });
    do_("hoc-xong", { loai: "kiem-tra" });
    let cc;
    if (dat) {
      cc = '<div class="kt-cc is-mo"><svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-award"/></svg><div><p><b>' + esc(S.moKhoa(CC.tenChungChi("chu-de", B))) + "</b>" +
        (B.nhanh ? " " + S.nganhThem : "") + '</p><p class="kt-cc-nut"><a class="btn btn-yt" href="chung-nhan.html?tao=chu-de.' + B.id + '">' + S.nhan + "</a>" +
        (B.nhanh ? '<a class="btn" href="lo-trinh-nganh.html?ai=' + B.nhanh + '">' + S.loTrinh + "</a>" : "") + "</p></div></div>";
    } else {
      cc = '<div class="kt-cc"><svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-award"/></svg><p>' + S.canDat(canDat(n), n) + "</p></div>";
    }
    const xemLai = sai.length ? '<details class="kt-xem-lai"><summary>' + S.xemLai(sai.length) + "</summary><ol>" +
      sai.map(s => "<li><p><b>" + esc(s.q.cau) + '</b></p><p class="kt-sai">' + S.banChon + esc(s.chon) + '</p><p class="kt-dung">' + S.dapAnDung + esc(s.dapAn) + "</p><p>" + esc(s.q.giai_thich) + "</p></li>").join("") +
      "</ol></details>" : "";
    khung.innerHTML = '<div class="result"><img src="' + goc + 'assets/mark-a-ra-the.svg" alt="" width="140" height="132"><div><p class="q-num">' + S.ketQua + '</p><h2 class="score" tabindex="-1">' +
      S.diem(dung, n) + "</h2><p>" + loi + "</p></div></div>" + cc + xemLai +
      '<h3 class="rec-h">' + (sai.length ? S.nenXem : S.diTiep) + '</h3><ul class="rec">' + ds.map(v => "<li>" + link(v) + "</li>").join("") + "</ul>" +
      '<div class="q-actions"><button class="btn btn-yt" id="chia-se">' + S.chiaSe + '</button><button class="btn" id="lam-lai">' + S.lamLai + '</button><button class="btn" id="bo-khac">' + S.boKhac +
      '</button></div><p class="share-msg" id="bao" role="status"></p>';
    khung.querySelector(".score").focus({ preventScroll: true });
    document.getElementById("lam-lai").addEventListener("click", () => batDau(B.id, true));
    document.getElementById("bo-khac").addEventListener("click", doiBo);
    document.getElementById("chia-se").addEventListener("click", () => chiaSe(dung, n));
  }
  function doiBo() {
    quiz.hidden = true; chonEl.hidden = false;
    history.replaceState(null, "", location.pathname);
    veDiem();
    chonEl.scrollIntoView({ behavior: mo, block: "start" });
  }
  function chiaSe(d, n) {
    const url = D.url + "?bo=" + B.id, text = S.chiaSeChu(d, n, B.ten), bao = document.getElementById("bao");
    const chep = () => {
      const all = text + " " + url;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(all).then(() => { bao.textContent = S.daChep; }, () => { bao.textContent = S.chepTay + all; });
      else bao.textContent = S.chepTay + all;
    };
    if (navigator.share) navigator.share({ title: B.ten, text, url }).catch(e => { if (!e || e.name !== "AbortError") chep(); });
    else chep();
  }

  chonEl.addEventListener("click", e => {
    const a = e.target.closest("[data-bo]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    history.replaceState(null, "", "?bo=" + a.dataset.bo);
    batDau(a.dataset.bo, true);
  });
  khung.addEventListener("click", e => { const b = e.target.closest(".q-btn"); if (b && !b.disabled) tra(b); });
  document.getElementById("kt-doi").addEventListener("click", doiBo);

  veDiem();
  const id = new URLSearchParams(location.search).get("bo");
  if (id && byId[id]) batDau(id, false);
})();

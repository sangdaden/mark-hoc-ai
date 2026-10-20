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
    daChep: "Link copied. Paste it into a message to send to your friends.", chepTay: "Copy this link to send to your friends: ",
    tenNhan: "Name on your certificate", tenGoi: "Type your name", tenMau: "Your name here", fb: "Share on Facebook", guiAnh: "Send the image",
    taiAnh: "Download PNG", trangCc: "Print PDF or add to LinkedIn", canTen: "Type your name first, then press the button again.",
    anhCc: (t, n) => "Certificate “" + t + "” for " + n, ccMoi: "Your certificate is ready",
    chiaSeCc: (t, s) => "I just got the “" + t + "” certificate from Mark học AI with " + s + " correct answers. How many can you get?"
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
    daChep: "Đã chép link, dán vào tin nhắn để gửi bạn bè.", chepTay: "Chép link này để gửi bạn bè: ",
    tenNhan: "Tên in trên giấy chứng nhận", tenGoi: "Gõ tên của bạn", tenMau: "Tên của bạn", fb: "Chia sẻ lên Facebook", guiAnh: "Gửi ảnh chứng nhận",
    taiAnh: "Tải ảnh PNG", trangCc: "In PDF hoặc thêm vào LinkedIn", canTen: "Bạn gõ tên trước rồi bấm lại nhé.",
    anhCc: (t, n) => "Giấy chứng nhận “" + t + "” của " + n, ccMoi: "Giấy chứng nhận của bạn đây",
    chiaSeCc: (t, s) => "Mình vừa nhận giấy chứng nhận “" + t + "” của Mark học AI với " + s + " câu đúng. Bạn thử xem được mấy câu?"
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + "assets/icons.svg#i-" + n + '"/></svg>';
  const nt = n => '<span class="nt nt-sm nt-' + n + '" aria-hidden="true"><svg><use href="' + goc + "assets/nen-tang.svg#nt-" + n + '"/></svg></span>';
  const link = v => '<a href="' + v.url + '">#' + String(v.so).padStart(2, "0") + " · " + esc(v.ten) + "</a>";
  const xao = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const canDat = n => Math.ceil(n * D.dat - 1e-9);
  const mo = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const chonEl = document.getElementById("kt-bo"), quiz = document.getElementById("quiz"), khung = document.getElementById("khung");
  const tienDo = document.getElementById("tien-do"), diemTam = document.getElementById("diem-tam"), chang = document.getElementById("kt-chang");
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

  let B, Q, i, dung, sai, ketCau;
  const do_ = (t, d) => window.mhaiDo && window.mhaiDo(t, d); // đếm tương tác, xem theo-doi.js
  function batDau(id, cuon) {
    B = byId[id] || D.bo[0];
    // Xáo câu và xáo lựa chọn; mỗi lựa chọn nhớ mình có phải đáp án không
    Q = xao(B.cau_hoi).map(c => c.loai === "chon" ? Object.assign({}, c, { opts: xao(c.lua_chon.map((x, k) => ({ x, ok: k === c.dap_an }))) }) : c);
    i = 0; dung = 0; sai = []; ketCau = [];
    chang.innerHTML = Q.map(() => "<i></i>").join("");
    document.getElementById("kt-ten-bo").textContent = B.ten;
    chonEl.hidden = true; quiz.hidden = false;
    cauHoi();
    do_("kiem-tra-bat-dau", { bo: B.id });
    if (cuon) quiz.scrollIntoView({ behavior: mo, block: "start" });
  }
  function capNhat(soHien) {
    tienDo.textContent = soHien ? S.cau(soHien, Q.length) : S.ketQua;
    tienDo.parentNode.parentNode.classList.toggle("is-xong", !soHien); // màn kết quả: dải tiến độ thôi dính đầu màn hình
    diemTam.textContent = S.dung(dung);
    // Mỗi câu một chặng: xanh là đúng, đỏ là sai, viền đậm là câu đang làm
    [...chang.children].forEach((el, k) => { el.className = k in ketCau ? (ketCau[k] ? "is-dung" : "is-sai") : (soHien && k === soHien - 1 ? "is-hien" : ""); });
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
    ketCau[i] = ok;
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
      // Giấy chứng nhận vẽ ngay trên màn kết quả, cùng nội dung và mã xác minh với trang chung-nhan.html (điểm cao nhất, ngày đạt đầu tiên)
      cc = '<div class="kt-cc is-mo kt-cc-anh"><div class="kt-cc-giay"><canvas id="kt-canvas" width="1600" height="1131" role="img"></canvas></div><div class="kt-cc-ben">' +
        '<p class="kt-cc-tieu">' + ic("award") + "<b>" + esc(S.moKhoa(CC.tenChungChi("chu-de", B))) + "</b></p>" +
        '<label class="kt-cc-nhan" for="kt-ten">' + S.tenNhan + '</label><input id="kt-ten" type="text" maxlength="60" autocomplete="name" placeholder="' + S.tenGoi + '">' +
        '<p class="kt-cc-nut"><a class="btn btn-fb" id="kt-fb" href="#" target="_blank" rel="noopener">' + nt("facebook") + S.fb + "</a>" +
        '<button type="button" class="btn" id="kt-gui" data-chia-se hidden>' + ic("share-2") + S.guiAnh + "</button>" +
        '<button type="button" class="btn" id="kt-tai">' + ic("download") + S.taiAnh + "</button>" +
        '<a class="btn" href="chung-nhan.html?tao=chu-de.' + B.id + '">' + ic("file-text") + S.trangCc + "</a>" +
        (B.nhanh ? '<a class="btn" href="lo-trinh-nganh.html?ai=' + B.nhanh + '">' + S.loTrinh + "</a>" : "") + "</p>" +
        '<p class="kt-cc-loi" id="kt-cc-loi" role="alert"></p>' + (B.nhanh ? '<p class="kt-cc-phu">' + S.nganhThem + "</p>" : "") + "</div></div>";
    } else {
      cc = '<div class="kt-cc">' + ic("award") + "<p>" + S.canDat(canDat(n), n) + "</p></div>";
    }
    const xemLai = sai.length ? '<details class="kt-xem-lai"><summary>' + S.xemLai(sai.length) + "</summary><ol>" +
      sai.map(s => "<li><p><b>" + esc(s.q.cau) + '</b></p><p class="kt-sai">' + S.banChon + esc(s.chon) + '</p><p class="kt-dung">' + S.dapAnDung + esc(s.dapAn) + "</p><p>" + esc(s.q.giai_thich) + "</p></li>").join("") +
      "</ol></details>" : "";
    khung.innerHTML = '<div class="result"><img src="' + goc + 'assets/mark-a-ra-the.svg" alt="" width="140" height="132"><div><p class="q-num">' + S.ketQua + '</p><h2 class="score" tabindex="-1">' +
      S.diem(dung, n) + "</h2><p>" + loi + "</p></div></div>" + cc + xemLai +
      '<h3 class="rec-h">' + (sai.length ? S.nenXem : S.diTiep) + '</h3><ul class="rec">' + ds.map(v => "<li>" + link(v) + "</li>").join("") + "</ul>" +
      '<div class="q-actions"><button class="btn btn-yt" id="chia-se" data-chia-se>' + S.chiaSe + '</button><button class="btn" id="lam-lai">' + S.lamLai + '</button><button class="btn" id="bo-khac">' + S.boKhac +
      '</button></div><p class="share-msg" id="bao" role="status"></p>';
    khung.querySelector(".score").focus({ preventScroll: true });
    document.getElementById("lam-lai").addEventListener("click", () => batDau(B.id, true));
    document.getElementById("bo-khac").addEventListener("click", doiBo);
    document.getElementById("chia-se").addEventListener("click", () => chiaSe(dung, n));
    if (dat) giayChungNhan();
  }
  function giayChungNhan() {
    const r = CC.ketQua()[B.id], s = r.dung + "/" + r.tong, gioi = r.dung === r.tong, ngay = r.dat || r.ngay;
    const cv = document.getElementById("kt-canvas"), inTen = document.getElementById("kt-ten"), loi = document.getElementById("kt-cc-loi");
    const fb = document.getElementById("kt-fb"), gui = document.getElementById("kt-gui");
    const ten = () => inTen.value.replace(/\s+/g, " ").trim();
    inTen.value = CC.nho.get(CC.KHOA_TEN) || (CC.nho.get(CC.KHOA_7) || {}).ten || "";
    const giay = n => { const p = { l: "chu-de", b: B.id, n, d: ngay, s }; return { p, o: { loai: "chu-de", tieuDe: B.ten, mo: CC.T.mo["chu-de"](B.ten, s), huy: [s, gioi ? CC.T.huy.gioi : CC.T.huy.dat],
      mau: B.mau || ["#2563EB", "#06D6A0"], vang: gioi, ten: n, ngay, ma: CC.maCua(p), mauBan: false } }; };
    const urlXm = p => "https://markhocai.com/" + (EN ? "en/" : "") + "chung-nhan.html?xm=" + CC.maHoa(p);
    let luot = 0, anh = null;
    async function ve() {
      const n = ten(), lan = ++luot, g = giay(n || S.tenMau);
      fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(urlXm(g.p));
      const blob = await CC.ve(cv, g.o);
      if (lan !== luot) return;
      anh = n && blob ? blob : null;
      cv.setAttribute("aria-label", S.anhCc(B.ten, n || S.tenMau));
    }
    // Bấm nút mà chưa có tên: nhắc gõ tên, không tải giấy "Tên của bạn"
    const canTen = e => { if (ten()) { loi.textContent = ""; return false; } if (e) e.preventDefault(); loi.textContent = S.canTen; inTen.focus(); return true; };
    const tenFile = () => (EN ? "mark-hoc-ai-certificate-" : "chung-nhan-mark-hoc-ai-") + B.id + ".png";
    const choAnh = async () => { await ve(); return anh; };
    let hen;
    inTen.addEventListener("input", () => { CC.nho.set(CC.KHOA_TEN, ten()); loi.textContent = ""; clearTimeout(hen); hen = setTimeout(ve, 150); });
    fb.addEventListener("click", e => { if (canTen(e)) return; fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(urlXm(giay(ten()).p)); });
    document.getElementById("kt-tai").addEventListener("click", async () => {
      if (canTen()) return;
      const b = await choAnh(); if (!b) return;
      do_("tai-chung-nhan", { kieu: "png", loai: "chu-de", noi: "kiem-tra" });
      const u = URL.createObjectURL(b), a = document.createElement("a");
      a.href = u; a.download = tenFile(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    });
    // Điện thoại: gửi thẳng ảnh giấy chứng nhận qua Facebook, Zalo, Messenger... bằng khung chia sẻ của máy
    try { gui.hidden = !(navigator.canShare && navigator.canShare({ files: [new File([""], "a.png", { type: "image/png" })] })); } catch (e) { gui.hidden = true; }
    gui.addEventListener("click", async () => {
      if (canTen()) return;
      const b = await choAnh(); if (!b) return;
      navigator.share({ files: [new File([b], tenFile(), { type: "image/png" })], text: S.chiaSeCc(B.ten, s) + " " + D.url + "?bo=" + B.id }).catch(() => {});
      do_("tai-chung-nhan", { kieu: "chia-se-anh", loai: "chu-de", noi: "kiem-tra" });
    });
    ve();
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

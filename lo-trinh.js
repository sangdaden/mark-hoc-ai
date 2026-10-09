// Lộ trình 7 ngày (lo-trinh-7-ngay.html, en/lo-trinh-7-ngay.html): chấm câu hỏi mỗi ngày, đánh dấu ngày đã xong (lưu trên máy người xem
// nếu được, không thì chỉ nhớ tới khi đóng trang), xong đủ 7 ngày thì vẽ giấy chứng nhận PNG bằng <canvas>.
(function () {
  const D = JSON.parse(document.getElementById("du-lieu").textContent);
  const EN = document.documentElement.lang === "en";
  const goc = D.goc; // đường về thư mục gốc (assets)
  const KHOA = "mhai-lo-trinh";
  const S = EN ? {
    tienDo: (a, b) => a + "/" + b + " days done", dung: "Correct!", sai: "Not quite. Rewatch the videos and try another answer.",
    xong: "Done", conLai: n => "Finish all 7 days to unlock a certificate with your name. " + n + (n === 1 ? " day" : " days") + " to go.",
    moKhoa: "You finished all 7 days! Type your name to make your certificate.", canTen: "Please type your name first.",
    dangVe: "Drawing…", taoLai: "Make it again", tao: "Make my certificate", anh: n => "Certificate of completion for " + n,
    chep: "Link copied. Paste it into a message to share.", chepTay: "Copy this to share: ",
    chiaSe: "I just finished the 7-day \"Mark học AI basics\" path: 21 short videos about AI. Learn with me:",
    tieuDe: "The 7-day path: Mark học AI basics", tiep: n => "Next: day " + n + " ›", hetNgay: "Make your certificate ›"
  } : {
    tienDo: (a, b) => "Đã xong " + a + "/" + b + " ngày", dung: "Chính xác!", sai: "Chưa đúng. Xem lại video rồi chọn đáp án khác nhé.",
    xong: "Đã xong", conLai: n => "Hoàn thành đủ 7 ngày để mở khóa giấy chứng nhận có tên bạn. Còn " + n + " ngày nữa.",
    moKhoa: "Bạn đã xong cả 7 ngày! Gõ tên để tạo giấy chứng nhận.", canTen: "Bạn gõ tên trước nhé.",
    dangVe: "Đang vẽ…", taoLai: "Tạo lại", tao: "Tạo giấy chứng nhận", anh: n => "Giấy chứng nhận hoàn thành của " + n,
    chep: "Đã chép link, dán vào tin nhắn để chia sẻ.", chepTay: "Chép đoạn này để chia sẻ: ",
    chiaSe: "Mình vừa hoàn thành Lộ trình 7 ngày \"Mark học AI cơ bản\": 21 video ngắn về AI. Học cùng mình nhé:",
    tieuDe: "Lộ trình 7 ngày: Mark học AI cơ bản", tiep: n => "Tiếp: ngày " + n + " ›", hetNgay: "Tạo giấy chứng nhận ›"
  };

  // Lưu trữ: localStorage có thể bị chặn (chế độ riêng tư, iframe); khi đó vẫn chạy, chỉ không nhớ sau khi đóng trang
  let nho = { xong: [], ten: "" };
  try { const r = JSON.parse(localStorage.getItem(KHOA) || "null"); if (r && Array.isArray(r.xong)) nho = { xong: r.xong.filter(n => n >= 1 && n <= D.so_ngay), ten: String(r.ten || "") }; } catch (e) {}
  const luu = () => { try { localStorage.setItem(KHOA, JSON.stringify(nho)); } catch (e) {} };

  const days = Array.from(document.querySelectorAll(".day"));
  const tienDo = document.getElementById("tien-do"), thanh = document.getElementById("thanh");

  function veNgay(li, daXong) {
    const n = +li.dataset.ngay, quiz = li.querySelector(".day-quiz"), dung = +quiz.dataset.dung;
    li.classList.toggle("is-done", daXong);
    li.querySelector(".day-tag").hidden = !daXong;
    li.querySelector(".day-lai").hidden = !daXong;
    const nut = li.querySelector(".day-xong");
    if (daXong) {
      quiz.querySelectorAll(".day-opt").forEach((b, i) => { b.disabled = true; b.classList.toggle("is-right", i === dung); b.classList.remove("is-wrong"); });
      li.querySelector(".day-fb").textContent = "";
      li.querySelector(".day-why").hidden = false;
      nut.hidden = true;
    } else {
      quiz.querySelectorAll(".day-opt").forEach(b => { b.disabled = false; b.classList.remove("is-right", "is-wrong"); });
      li.querySelector(".day-fb").textContent = "";
      li.querySelector(".day-why").hidden = true;
      nut.hidden = false; nut.disabled = true;
    }
    let tiep = li.querySelector(".day-tiep");
    if (daXong && !tiep) {
      const sau = days.find(d => !nho.xong.includes(+d.dataset.ngay));
      tiep = document.createElement("a");
      tiep.className = "btn day-tiep";
      tiep.href = sau ? "#" + sau.id : "#chung-nhan";
      tiep.textContent = sau ? S.tiep(sau.dataset.ngay) : S.hetNgay;
      li.querySelector(".day-act").appendChild(tiep);
    } else if (!daXong && tiep) tiep.remove();
    return n;
  }

  function capNhat() {
    const so = nho.xong.length;
    tienDo.textContent = S.tienDo(so, D.so_ngay);
    thanh.style.width = (so / D.so_ngay * 100) + "%";
    const du = so >= D.so_ngay;
    document.getElementById("cn-khoa").textContent = du ? S.moKhoa : S.conLai(D.so_ngay - so);
    document.getElementById("cn-form").hidden = !du;
    document.getElementById("chung-nhan").classList.toggle("is-open", du);
    const batDau = document.getElementById("nut-bat-dau"), sau = days.find(d => !nho.xong.includes(+d.dataset.ngay));
    if (batDau && so) { batDau.href = sau ? "#" + sau.id : "#chung-nhan"; batDau.textContent = sau ? S.tiep(sau.dataset.ngay) : S.hetNgay; }
    document.querySelectorAll(".day-tiep").forEach(a => { a.href = sau ? "#" + sau.id : "#chung-nhan"; a.textContent = sau ? S.tiep(sau.dataset.ngay) : S.hetNgay; });
  }

  // Mark chuyển động khi trả lời (assets/mascot); người bật "giảm chuyển động" thấy ảnh đứng yên
  const mascot = (ten, w) => '<picture class="fb-mascot"><source media="(prefers-reduced-motion: reduce)" srcset="' + goc + "assets/mascot/" + ten +
    '-tinh.webp"><img src="' + goc + "assets/mascot/" + ten + '.webp" alt="" width="' + w + '" height="150"></picture>';
  days.forEach(li => {
    const quiz = li.querySelector(".day-quiz"), dung = +quiz.dataset.dung, n = +li.dataset.ngay;
    const fb = li.querySelector(".day-fb"), nut = li.querySelector(".day-xong");
    quiz.querySelector(".day-opts").addEventListener("click", e => {
      const b = e.target.closest(".day-opt");
      if (!b || b.disabled) return;
      const i = +b.dataset.i;
      if (i === dung) {
        quiz.querySelectorAll(".day-opt").forEach((x, j) => { x.disabled = true; x.classList.toggle("is-right", j === dung); x.classList.remove("is-wrong"); });
        fb.innerHTML = mascot("mark-chien-thang", 114) + "<span>" + S.dung + "</span>"; fb.className = "day-fb ok co-hinh";
        li.querySelector(".day-why").hidden = false;
        nut.disabled = false;
        nut.focus({ preventScroll: true });
      } else {
        b.classList.add("is-wrong"); b.disabled = true;
        fb.innerHTML = mascot("mark-dau-dau", 94) + "<span>" + S.sai + "</span>"; fb.className = "day-fb no co-hinh";
      }
    });
    nut.addEventListener("click", () => {
      if (!nho.xong.includes(n)) nho.xong.push(n);
      nho.xong.sort((a, b) => a - b);
      luu();
      veNgay(li, true);
      capNhat();
      const tiep = li.querySelector(".day-tiep");
      if (tiep) tiep.focus({ preventScroll: true });
    });
    li.querySelector(".day-lai").addEventListener("click", () => {
      nho.xong = nho.xong.filter(x => x !== n);
      luu();
      veNgay(li, false);
      capNhat();
    });
    if (nho.xong.includes(n)) veNgay(li, true);
  });
  capNhat();

  // ---------- Giấy chứng nhận ----------
  const input = document.getElementById("ten-hv"), nutTao = document.getElementById("tao-cn"), loi = document.getElementById("cn-loi");
  const canvas = document.getElementById("cn-canvas"), anh = document.getElementById("cn-anh"), tai = document.getElementById("tai-cn");
  input.value = nho.ten;
  let urlCu = "";

  const taiAnh = src => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
  // SVG không có width/height: một số trình duyệt không vẽ được lên canvas, nên gắn kích thước trước khi tải
  async function taiSvg(duong, w, h) {
    try {
      const r = await fetch(duong);
      const txt = (await r.text()).replace("<svg ", '<svg width="' + w + '" height="' + h + '" ');
      return await taiAnh("data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt));
    } catch (e) { return taiAnh(duong); }
  }
  const ngayIn = () => {
    const d = new Date();
    if (EN) return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return "Ngày " + String(d.getDate()).padStart(2, "0") + " tháng " + String(d.getMonth() + 1).padStart(2, "0") + " năm " + d.getFullYear();
  };

  async function ve(ten) {
    const W = canvas.width, H = canvas.height, c = canvas.getContext("2d");
    const C = { blue: "#2563EB", sky: "#0EA5E9", mint: "#06D6A0", yellow: "#FACC15", ink: "#0F172A", muted: "#475569", edge: "#BFDBFE", bg: "#EFF6FF" };
    const T = EN ? {
      nhan: "CERTIFICATE OF COMPLETION", tieuDe: "Completed Mark học AI basics", trao: "This certifies that",
      mo: "has finished the 7-day path: 21 short AI videos, 7 hands-on tasks and 7 questions.", ky: "Mark & Bit · Mark học AI"
    } : {
      nhan: "GIẤY CHỨNG NHẬN", tieuDe: "Hoàn thành Mark học AI cơ bản", trao: "Chứng nhận bạn",
      mo: "đã hoàn thành Lộ trình 7 ngày: 21 video ngắn về AI, 7 việc thực hành và 7 câu hỏi.", ky: "Mark & Bit · Mark học AI"
    };
    const ngay = ngayIn();
    const chu = [T.nhan, T.tieuDe, T.trao, T.mo, T.ky, ten, ngay, "Mark học AI", "markhocai.com"].join(" ");
    // Đợi đúng các font (cả phần chữ tiếng Việt) tải xong rồi mới vẽ, không thì canvas dùng font dự phòng
    if (document.fonts && document.fonts.load) {
      try {
        await Promise.all(['800 80px "Be Vietnam Pro"', '600 40px "Be Vietnam Pro"', '400 30px "Inter"', '500 30px "Inter"', '600 30px "Inter"', '500 24px "JetBrains Mono"']
          .map(f => document.fonts.load(f, chu)));
        await document.fonts.ready;
      } catch (e) {}
    }
    const [logo, markBit] = await Promise.all([taiAnh(goc + "assets/logo.png"), taiSvg(goc + "assets/mark-va-bit.svg", 540, 510)]);
    const F = (w, s, f) => w + " " + s + "px " + (f || '"Be Vietnam Pro", "Inter", system-ui, sans-serif');
    const FI = (w, s) => F(w, s, '"Inter", system-ui, sans-serif');

    // Nền + khung dải màu logo
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, C.blue); g.addColorStop(.55, C.sky); g.addColorStop(1, C.mint);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const tron = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    const nen = c.createLinearGradient(0, 40, 0, H - 40);
    nen.addColorStop(0, "#FFFFFF"); nen.addColorStop(1, C.bg);
    tron(36, 36, W - 72, H - 72, 36); c.fillStyle = nen; c.fill();
    tron(60, 60, W - 120, H - 120, 26); c.strokeStyle = C.edge; c.lineWidth = 3; c.setLineDash([10, 10]); c.stroke(); c.setLineDash([]);

    // Logo + tên kênh (trên trái), địa chỉ web (trên phải)
    if (logo) { tron(110, 104, 92, 92, 22); c.save(); c.clip(); c.drawImage(logo, 110, 104, 92, 92); c.restore(); }
    c.textBaseline = "middle"; c.textAlign = "left";
    c.font = F(800, 44); c.fillStyle = C.ink; c.fillText("Mark học ", 222, 152);
    const wMark = c.measureText("Mark học ").width;
    c.fillStyle = C.blue; c.fillText("AI", 222 + wMark, 152);
    c.textAlign = "right"; c.font = F(500, 26, '"JetBrains Mono", ui-monospace, monospace'); c.fillStyle = C.muted;
    c.fillText("markhocai.com", W - 110, 152);

    // Nội dung chính, căn giữa vùng bên trái (chừa chỗ cho Mark & Bit bên phải)
    const cx = 640;
    c.textAlign = "center";
    c.font = FI(600, 28); c.fillStyle = C.blue;
    if ("letterSpacing" in c) c.letterSpacing = "6px";
    c.fillText(T.nhan, cx, 300);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
    c.font = F(800, 62); c.fillStyle = C.ink;
    let s = 62; while (c.measureText(T.tieuDe).width > 1000 && s > 40) { s -= 2; c.font = F(800, s); }
    c.fillText(T.tieuDe, cx, 380);
    c.font = FI(400, 30); c.fillStyle = C.muted; c.fillText(T.trao, cx, 478);

    // Tên: chữ to, tự thu nhỏ cho vừa, gạch chân vàng như chữ nổi bật trên trang
    let co = 96; c.font = F(800, co);
    while (c.measureText(ten).width > 980 && co > 44) { co -= 4; c.font = F(800, co); }
    const wTen = Math.min(c.measureText(ten).width, 980);
    c.fillStyle = "rgba(250, 204, 21, .85)";
    tron(cx - wTen / 2 - 20, 570 + co * .08, wTen + 40, co * .3, co * .1); c.fill();
    c.fillStyle = C.ink; c.fillText(ten, cx, 570, 980);

    // Mô tả: tự xuống dòng
    c.font = FI(500, 30); c.fillStyle = C.ink;
    const dong = []; let cur = "";
    T.mo.split(" ").forEach(w => { const thu = cur ? cur + " " + w : w; if (c.measureText(thu).width > 900 && cur) { dong.push(cur); cur = w; } else cur = thu; });
    if (cur) dong.push(cur);
    dong.forEach((d, i) => c.fillText(d, cx, 690 + i * 44));

    // Ngày + chữ ký (dưới trái)
    const yKy = 930;
    c.strokeStyle = C.ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(150, yKy); c.lineTo(530, yKy); c.stroke();
    c.beginPath(); c.moveTo(640, yKy); c.lineTo(1040, yKy); c.stroke();
    c.font = F(600, 32); c.fillStyle = C.ink;
    c.fillText(ngay, 340, yKy - 32, 380);
    c.fillText(T.ky, 840, yKy - 32, 400);
    c.font = FI(400, 24); c.fillStyle = C.muted;
    c.fillText(EN ? "Date" : "Ngày hoàn thành", 340, yKy + 34);
    c.fillText(EN ? "Your AI learning buddies" : "Bạn đồng hành học AI", 840, yKy + 34);

    // Mark & Bit (dưới phải)
    if (markBit) c.drawImage(markBit, W - 430, H - 470, 380, 359);
    // Huy hiệu tròn vàng
    c.beginPath(); c.arc(W - 200, 330, 86, 0, Math.PI * 2); c.fillStyle = C.yellow; c.fill();
    c.lineWidth = 6; c.strokeStyle = C.ink; c.stroke();
    c.font = F(800, 64); c.fillStyle = C.ink; c.textAlign = "center"; c.fillText("7", W - 200, 312);
    c.font = F(800, 24); c.fillText(EN ? "DAYS" : "NGÀY", W - 200, 368);

    return new Promise(ok => canvas.toBlob(b => ok(b), "image/png"));
  }

  nutTao.addEventListener("click", async () => {
    const ten = input.value.replace(/\s+/g, " ").trim();
    if (!ten) { loi.textContent = S.canTen; input.focus(); return; }
    loi.textContent = "";
    nho.ten = ten; luu();
    nutTao.disabled = true;
    const nhanCu = nutTao.innerHTML;
    nutTao.textContent = S.dangVe;
    try {
      const blob = await ve(ten);
      if (urlCu) URL.revokeObjectURL(urlCu);
      urlCu = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
      anh.src = urlCu; anh.alt = S.anh(ten);
      tai.href = urlCu;
      document.getElementById("cn-xem").hidden = false;
      document.getElementById("cn-nut").hidden = false;
      document.getElementById("cn-loi-khen").hidden = false;
      document.getElementById("chung-nhan").dataset.daTao = "1";
    } finally {
      nutTao.disabled = false;
      nutTao.innerHTML = nhanCu;
    }
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter") nutTao.click(); });

  document.getElementById("chia-se").addEventListener("click", () => {
    const bao = document.getElementById("bao"), all = S.chiaSe + " " + D.url;
    const chep = () => {
      const xong = () => { bao.textContent = S.chep; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(all).then(xong, () => { bao.textContent = S.chepTay + all; });
      else bao.textContent = S.chepTay + all;
    };
    if (navigator.share) navigator.share({ title: S.tieuDe, text: S.chiaSe, url: D.url }).catch(e => { if (!e || e.name !== "AbortError") chep(); });
    else chep();
  });
})();

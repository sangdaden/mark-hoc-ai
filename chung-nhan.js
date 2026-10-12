// Chứng nhận Mark học AI (dùng chung cho kiem-tra.html và chung-nhan.html, cả bản en/).
// - Lưu điểm cao nhất từng bộ câu hỏi trên máy người học (mhai-kiem-tra), xét mở khóa từng dạng chứng nhận.
// - Vẽ chứng nhận PNG bằng <canvas>, kèm mã xác minh tính từ nội dung (tên, loại, ngày, điểm).
// - Trang chung-nhan.html: danh sách chứng nhận, tạo, tải PNG, in ra PDF, thêm vào LinkedIn, mở link xác minh (?xm=...).
// Chứng nhận do người học tự tạo trên máy để ghi nhận việc học, không phải bằng cấp chính thức; trang ghi rõ điều này.
// Các dạng: "chu-de.<bộ>" (đạt 80% một bộ câu hỏi), "nganh.<ngành>" (đạt bộ ngành + đánh dấu xem hết lộ trình ngành),
// "toan-dien" (đạt cả 4 bộ kiến thức chung + xong Lộ trình 7 ngày). Giấy chứng nhận Lộ trình 7 ngày vẫn tạo ở lo-trinh-7-ngay.html (lo-trinh.js).
window.MHAI_CC = (function () {
  const EN = document.documentElement.lang === "en", goc = EN ? "../" : "";
  const DAT = 0.8;  // giống "dat" trong data/bo-kiem-tra.json
  const KHOA_KT = "mhai-kiem-tra", KHOA_TEN = "mhai-ten", KHOA_MO = "mhai-chung-chi", KHOA_7 = "mhai-lo-trinh", KHOA_XEM = "mhai-da-xem";
  const nho = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const homNay = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const ketQua = () => nho.get(KHOA_KT) || {};
  const datBo = r => !!r && r.tong > 0 && r.dung / r.tong >= DAT - 1e-9;
  // Giữ lần làm tốt nhất; "dat" là ngày đầu tiên đạt 80% (ngày in trên chứng nhận chủ đề)
  function ghiDiem(id, dung, tong) {
    const kq = ketQua(), cu = kq[id], moi = { dung, tong, ngay: homNay() };
    const r = !cu || dung / tong > cu.dung / cu.tong ? moi : cu;
    r.dat = (cu && cu.dat) || (datBo(moi) ? homNay() : undefined);
    if (!r.dat) delete r.dat;
    kq[id] = r;
    nho.set(KHOA_KT, kq);
  }

  // ---------- Mã xác minh ----------
  const fnv = (s, h) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
  const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  function maCua(p) {
    const s = "mhai|" + [p.l, p.b || "", p.n, p.d, p.s || ""].join("|");
    let x = fnv(s, 2166136261) * 256 + (fnv(s, 3141592653) & 255), out = "";
    for (let i = 0; i < 8; i++) { out = B32[x % 32] + out; x = Math.floor(x / 32); }
    return out.slice(0, 4) + "-" + out.slice(4);
  }
  const maHoa = p => { const b = new TextEncoder().encode(JSON.stringify(p)); let s = ""; b.forEach(c => { s += String.fromCharCode(c); }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  function giaiMa(s) {
    try {
      const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
      const p = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
      return p && typeof p.n === "string" && typeof p.l === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.d) ? p : null;
    } catch (e) { return null; }
  }

  // ---------- Chữ trên chứng nhận ----------
  const T = EN ? {
    nhan: { "chu-de": "CERTIFICATE OF COMPLETION · TOPIC", nganh: "CERTIFICATE OF COMPLETION · FIELD", "toan-dien": "CERTIFICATE OF COMPLETION · ALL-ROUND" },
    ten: { "chu-de": "Topic Certificate of Completion", nganh: "Field Certificate of Completion", "toan-dien": "All-round Certificate of Completion" },
    toanDien: "Mark học AI all-round", trao: "This certifies that",
    mo: {
      "chu-de": (t, s) => "has passed the “" + t + "” quiz with " + s + " correct answers.",
      nganh: (t, s, m) => "has finished the " + t + " learning path (" + m + " videos) and passed the field quiz with " + s + " correct answers.",
      "toan-dien": () => "has finished the 7-day path and passed all 4 general AI quizzes: misconceptions, prompting, staying safe and AI at work."
    },
    huy: { gioi: "TOP SCORE", dat: "PASSED", nganh: "FIELD", toan: "ALL-ROUND" },
    ky: "Mark & Bit · Mark học AI", ngay: "Date", dongHanh: "Your AI learning buddies", ma: "Verification code", mau: "SAMPLE",
    ngayIn: iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  } : {
    nhan: { "chu-de": "GIẤY CHỨNG NHẬN · CHỦ ĐỀ", nganh: "GIẤY CHỨNG NHẬN · CHUYÊN NGÀNH", "toan-dien": "GIẤY CHỨNG NHẬN · TOÀN DIỆN" },
    ten: { "chu-de": "Giấy chứng nhận chủ đề", nganh: "Giấy chứng nhận chuyên ngành", "toan-dien": "Giấy chứng nhận toàn diện" },
    toanDien: "Mark học AI toàn diện", trao: "Chứng nhận bạn",
    mo: {
      "chu-de": (t, s) => "đã vượt qua bài kiểm tra “" + t + "” với " + s + " câu đúng.",
      nganh: (t, s, m) => "đã học xong lộ trình " + t + " (" + m + " video) và vượt qua bài kiểm tra ngành với " + s + " câu đúng.",
      "toan-dien": () => "đã hoàn thành Lộ trình 7 ngày và vượt qua cả 4 bài kiểm tra kiến thức chung: hiểu lầm về AI, viết prompt, dùng AI an toàn, AI trong công việc."
    },
    huy: { gioi: "XUẤT SẮC", dat: "ĐẠT", nganh: "NGÀNH", toan: "TOÀN DIỆN" },
    ky: "Mark & Bit · Mark học AI", ngay: "Ngày cấp", dongHanh: "Bạn đồng hành học AI", ma: "Mã xác minh", mau: "MẪU",
    ngayIn: iso => { const [y, m, d] = iso.split("-"); return "Ngày " + d + " tháng " + m + " năm " + y; }
  };
  const tenChungChi = (loai, x) => loai === "toan-dien" ? T.toanDien : x.ten;

  // ---------- Vẽ ----------
  const taiAnh = src => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
  async function taiSvg(duong, w, h) {
    try {
      const txt = (await (await fetch(duong)).text()).replace("<svg ", '<svg width="' + w + '" height="' + h + '" ');
      return await taiAnh("data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt));
    } catch (e) { return taiAnh(duong); }
  }
  let anhChung = null;
  const taiAnhChung = () => anhChung || (anhChung = Promise.all([taiAnh(goc + "assets/logo.png"), taiSvg(goc + "assets/mark-va-bit.svg", 540, 510)]));

  // o: { loai, tieuDe, mo, huy: [chữ to, chữ nhỏ], mau: [màu 1, màu 2], vang, ten, ngay (YYYY-MM-DD), ma, mauBan }
  async function ve(canvas, o) {
    const W = canvas.width, H = canvas.height, c = canvas.getContext("2d");
    const C = { ink: "#0F172A", muted: "#475569", edge: "#CBD5E1", gold: "#FACC15" };
    const ngay = T.ngayIn(o.ngay), nhan = T.nhan[o.loai];
    const chu = [nhan, o.tieuDe, T.trao, o.mo, T.ky, o.ten, ngay, T.ma, o.huy.join(" "), "Mark học AI markhocai.com"].join(" ");
    if (document.fonts && document.fonts.load) {
      try {
        await Promise.all(['800 80px "Be Vietnam Pro"', '600 40px "Be Vietnam Pro"', '400 30px "Inter"', '500 30px "Inter"', '600 30px "Inter"', '500 24px "JetBrains Mono"']
          .map(f => document.fonts.load(f, chu)));
        await document.fonts.ready;
      } catch (e) {}
    }
    const [logo, markBit] = await taiAnhChung();
    const F = (w, s, f) => w + " " + s + "px " + (f || '"Be Vietnam Pro", "Inter", system-ui, sans-serif');
    const FI = (w, s) => F(w, s, '"Inter", system-ui, sans-serif');
    const tron = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    const vua = (txt, w0, s0, smin, font) => { let s = s0; c.font = font(s); while (c.measureText(txt).width > w0 && s > smin) { s -= 2; c.font = font(s); } return s; };

    // Khung dải màu của dạng chứng nhận, giấy trắng bên trong; chứng nhận xuất sắc / toàn diện có viền vàng
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, o.mau[0]); g.addColorStop(1, o.mau[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (o.vang) { tron(24, 24, W - 48, H - 48, 40); c.strokeStyle = C.gold; c.lineWidth = 8; c.stroke(); }
    const nen = c.createLinearGradient(0, 40, 0, H - 40);
    nen.addColorStop(0, "#FFFFFF"); nen.addColorStop(1, "#F8FAFC");
    tron(36, 36, W - 72, H - 72, 36); c.fillStyle = nen; c.fill();
    tron(60, 60, W - 120, H - 120, 26); c.strokeStyle = o.vang ? "#EAB308" : C.edge; c.lineWidth = 3; c.setLineDash([10, 10]); c.stroke(); c.setLineDash([]);

    if (logo) { tron(110, 104, 92, 92, 22); c.save(); c.clip(); c.drawImage(logo, 110, 104, 92, 92); c.restore(); }
    c.textBaseline = "middle"; c.textAlign = "left";
    c.font = F(800, 44); c.fillStyle = C.ink; c.fillText("Mark học ", 222, 152);
    c.fillStyle = "#2563EB"; c.fillText("AI", 222 + c.measureText("Mark học ").width, 152);
    c.textAlign = "right"; c.font = F(500, 26, '"JetBrains Mono", ui-monospace, monospace'); c.fillStyle = C.muted;
    c.fillText("markhocai.com", W - 110, 152);

    const cx = 640;
    c.textAlign = "center";
    c.font = FI(600, 28); c.fillStyle = o.mau[0];
    if ("letterSpacing" in c) c.letterSpacing = "6px";
    c.fillText(nhan, cx, 290);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
    vua(o.tieuDe, 1000, 62, 36, s => F(800, s)); c.fillStyle = C.ink;
    c.fillText(o.tieuDe, cx, 370, 1000);
    c.font = FI(400, 30); c.fillStyle = C.muted; c.fillText(T.trao, cx, 466);

    const co = vua(o.ten, 980, 96, 44, s => F(800, s));
    const wTen = Math.min(c.measureText(o.ten).width, 980);
    c.fillStyle = "rgba(250, 204, 21, .85)";
    tron(cx - wTen / 2 - 20, 558 + co * .08, wTen + 40, co * .3, co * .1); c.fill();
    c.fillStyle = C.ink; c.fillText(o.ten, cx, 558, 980);

    c.font = FI(500, 29); c.fillStyle = C.ink;
    const dong = []; let cur = "";
    o.mo.split(" ").forEach(w => { const thu = cur ? cur + " " + w : w; if (c.measureText(thu).width > 920 && cur) { dong.push(cur); cur = w; } else cur = thu; });
    if (cur) dong.push(cur);
    dong.slice(0, 3).forEach((d, i) => c.fillText(d, cx, 672 + i * 42));

    const yKy = 912;
    c.strokeStyle = C.ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(150, yKy); c.lineTo(530, yKy); c.stroke();
    c.beginPath(); c.moveTo(640, yKy); c.lineTo(1040, yKy); c.stroke();
    c.font = F(600, 32); c.fillStyle = C.ink;
    c.fillText(ngay, 340, yKy - 32, 380);
    c.fillText(T.ky, 840, yKy - 32, 400);
    c.font = FI(400, 24); c.fillStyle = C.muted;
    c.fillText(T.ngay, 340, yKy + 34);
    c.fillText(T.dongHanh, 840, yKy + 34);
    c.font = F(500, 22, '"JetBrains Mono", ui-monospace, monospace'); c.fillStyle = C.muted;
    c.fillText(T.ma + " " + o.ma + " · markhocai.com/" + (EN ? "en/" : "") + "chung-nhan.html", cx, 1018, 980);

    if (markBit) c.drawImage(markBit, W - 430, H - 470, 380, 359);
    // Huy hiệu tròn: vàng cho xuất sắc / ngành / toàn diện, trắng viền màu cho mức đạt
    const hx = W - 200, hy = 320;
    c.beginPath(); c.arc(hx, hy, 90, 0, Math.PI * 2); c.fillStyle = o.vang ? C.gold : "#FFFFFF"; c.fill();
    c.lineWidth = 6; c.strokeStyle = o.vang ? C.ink : o.mau[0]; c.stroke();
    c.fillStyle = C.ink; c.textAlign = "center";
    vua(o.huy[0], 140, 60, 28, s => F(800, s)); c.fillText(o.huy[0], hx, hy - 16);
    vua(o.huy[1], 150, 22, 14, s => F(800, s)); c.fillText(o.huy[1], hx, hy + 40);

    if (o.mauBan) {
      c.save(); c.translate(W / 2, H / 2); c.rotate(-Math.PI / 9);
      c.font = F(800, 260); c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = "rgba(15, 23, 42, .07)"; c.fillText(T.mau, 0, 0);
      c.lineWidth = 3; c.strokeStyle = "rgba(15, 23, 42, .14)"; c.strokeText(T.mau, 0, 0);
      c.restore();
    }
    return new Promise(ok => canvas.toBlob(b => ok(b), "image/png"));
  }

  const API = { EN, goc, DAT, nho, homNay, ketQua, datBo, ghiDiem, maCua, maHoa, giaiMa, T, tenChungChi, ve, KHOA_TEN, KHOA_MO, KHOA_7, KHOA_XEM };
  document.addEventListener("DOMContentLoaded", () => { if (document.getElementById("cc")) trangChungChi(API); });
  return API;

  // ---------- Trang chung-nhan.html ----------
  async function trangChungChi(A) {
    const S = EN ? {
      tenNhan: "Name on your certificates", tenGoi: "Your name", moKhoa: "Unlocked", chuaMo: "Locked",
      kt: (d, n) => "Quiz: best " + d + "/" + n, ktChua: "Quiz: not taken yet", ktCan: (k, n) => "need " + k + "/" + n,
      lt: (x, m) => "Learning path: " + x + "/" + m + " videos ticked off", lt7: (x, m) => "7-day path: " + x + "/" + m + " days",
      tao: "Make certificate", lamBai: "Take the quiz", moLt: "Open the path", mo7: "Open the 7-day path",
      nhom: [["toan", "All-round Certificate of Completion", "The big one: finish the 7-day path and pass all 4 general quizzes."],
        ["nganh", "Field Certificates of Completion", "Pass the field quiz and tick off every video in that field's learning path."],
        ["chu-de", "Topic Certificates of Completion", "Score 80% or more on any quiz. A perfect score gets the gold badge."],
        ["bay", "7-day path Certificate of Completion", "Finish all 7 days of the beginner path. You make this one on the 7-day path page."]],
      bay: "Completed Mark học AI basics", taiPng: "Download PNG", inPdf: "Print or save as PDF", linkedin: "Add to LinkedIn", chepXm: "Copy verification link",
      canTen: "Type your name first, then press the button again.", daChep: "Verification link copied.", chepTay: "Copy this link: ",
      xmTot: (n, ngay) => "This link matches a certificate made on markhocai.com for " + n + " on " + ngay + ". Check that the code on the certificate is the same as the one below.",
      xmLoi: "This verification link is broken or incomplete. Ask the person to copy it again from their certificate page.",
      xmMa: "Verification code: ", anh: (l, n) => l + " for " + n, dong: "Close", xem: "Preview", mau: "Sample: ",
      mauChu: "Sample. Unlock it to get your name on it and download it.", goTen: "Type your name above to see it on the certificate.", xemTruoc: "Preview. Press “Download PNG” to save it.",
      cauHoi: n => n + " questions", lienQuan: "Field quiz"
    } : {
      tenNhan: "Tên in trên chứng nhận", tenGoi: "Tên của bạn", moKhoa: "Đã mở khóa", chuaMo: "Chưa mở khóa",
      kt: (d, n) => "Bài kiểm tra: cao nhất " + d + "/" + n, ktChua: "Bài kiểm tra: chưa làm", ktCan: (k, n) => "cần " + k + "/" + n,
      lt: (x, m) => "Lộ trình: đã xem " + x + "/" + m + " video", lt7: (x, m) => "Lộ trình 7 ngày: " + x + "/" + m + " ngày",
      tao: "Tạo giấy chứng nhận", lamBai: "Làm bài kiểm tra", moLt: "Mở lộ trình", mo7: "Mở Lộ trình 7 ngày",
      nhom: [["toan", "Giấy chứng nhận toàn diện", "Giấy chứng nhận lớn nhất: xong Lộ trình 7 ngày và đạt cả 4 bài kiểm tra kiến thức chung."],
        ["nganh", "Giấy chứng nhận chuyên ngành", "Đạt bài kiểm tra ngành và đánh dấu xem hết các video trong lộ trình ngành đó."],
        ["chu-de", "Giấy chứng nhận chủ đề", "Đạt từ 80% một bộ câu hỏi bất kỳ. Đúng hết thì có huy hiệu vàng Xuất sắc."],
        ["bay", "Giấy chứng nhận Lộ trình 7 ngày", "Xong cả 7 ngày của lộ trình cho người mới. Giấy này tạo ngay ở trang Lộ trình 7 ngày."]],
      bay: "Hoàn thành Mark học AI cơ bản", taiPng: "Tải ảnh PNG", inPdf: "In hoặc lưu PDF", linkedin: "Thêm vào LinkedIn", chepXm: "Chép link xác minh",
      canTen: "Bạn gõ tên trước rồi bấm lại nhé.", daChep: "Đã chép link xác minh.", chepTay: "Chép link này: ",
      xmTot: (n, ngay) => "Link này khớp với một giấy chứng nhận tạo trên markhocai.com cho " + n + ", " + ngay.toLowerCase() + ". Bạn so mã trên giấy với mã bên dưới, trùng là đúng giấy này.",
      xmLoi: "Link xác minh bị hỏng hoặc thiếu. Nhờ người gửi chép lại link từ trang giấy chứng nhận của họ.",
      xmMa: "Mã xác minh: ", anh: (l, n) => l + " của " + n, dong: "Đóng", xem: "Xem trước", mau: "Bản mẫu: ",
      mauChu: "Bản mẫu. Mở khóa giấy này là có tên bạn và tải về được.", goTen: "Gõ tên ở trên để thấy tên bạn trên giấy.", xemTruoc: "Xem trước. Bấm “Tải ảnh PNG” để lưu về máy.",
      cauHoi: n => n + " câu", lienQuan: "Bài kiểm tra ngành"
    };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + A.goc + "assets/icons.svg#i-" + n + '"/></svg>';
    const ld = n => fetch(A.goc + "data/" + n + ".json").then(r => r.json());
    const [KT, KTen, LT] = await Promise.all([ld("bo-kiem-tra"), EN ? ld("en/bo-kiem-tra") : null, ld("lo-trinh-nganh")]);
    if (KTen) { const e = {}; KTen.bo.forEach(b => { e[b.id] = b; }); KT.bo.forEach(b => { if (e[b.id]) { b.ten = e[b.id].ten; b.mo_ta = e[b.id].mo_ta; } }); }
    const boCuaId = {}; KT.bo.forEach(b => { boCuaId[b.id] = b; });
    const coBan = KT.bo.filter(b => b.nhom === "co-ban"), nganhBo = KT.bo.filter(b => b.nhanh);
    const BRAND = ["#2563EB", "#06D6A0"];
    const vidLoTrinh = id => {
      const set = new Set();
      LT.nganh[id].buoc.forEach(b => { if (b.so) b.so.forEach(s => set.add(s)); else { const nh = LT.nhanh[b.nhanh]; for (let s = nh.tu; s <= nh.den; s++) set.add(s); } });
      return [...set];
    };

    // Trạng thái mọi chứng nhận, tính lại mỗi lần vẽ (người học có thể làm bài ở tab khác)
    function trangThai() {
      const kq = A.ketQua(), xem = new Set(A.nho.get(A.KHOA_XEM) || []), lt7 = A.nho.get(A.KHOA_7) || {}, so7 = (lt7.xong || []).length;
      const moCu = A.nho.get(A.KHOA_MO) || {};
      const ds = [];
      KT.bo.forEach(b => {
        const r = kq[b.id];
        ds.push({ key: "chu-de." + b.id, loai: "chu-de", bo: b, r, mo: A.datBo(r) });
      });
      nganhBo.forEach(b => {
        const r = kq[b.id], vs = vidLoTrinh(b.nhanh), x = vs.filter(s => xem.has(s)).length;
        ds.push({ key: "nganh." + b.nhanh, loai: "nganh", bo: b, r, nh: LT.nhanh[b.nhanh], vs: vs.length, x, mo: A.datBo(r) && x === vs.length });
      });
      const okCoBan = coBan.filter(b => A.datBo(kq[b.id])).length;
      ds.push({ key: "toan-dien", loai: "toan-dien", okCoBan, so7, mo: okCoBan === coBan.length && so7 >= 7 });
      ds.push({ key: "bay", loai: "bay", so7, mo: so7 >= 7 });
      // Ngày cấp chứng nhận ngành / toàn diện: ngày đầu tiên trang này thấy đủ điều kiện, giữ nguyên về sau
      let doi = false;
      ds.forEach(d => { if (d.mo && (d.loai === "nganh" || d.loai === "toan-dien") && !moCu[d.key]) { moCu[d.key] = A.homNay(); doi = true; } });
      if (doi) A.nho.set(A.KHOA_MO, moCu);
      ds.forEach(d => { d.ngay = d.loai === "chu-de" ? (d.r && (d.r.dat || d.r.ngay)) : moCu[d.key]; });
      return ds;
    }

    // Nội dung in trên giấy cho một chứng nhận đã mở khóa (hoặc bản mẫu)
    function noiDung(d, ten) {
      if (d.loai === "chu-de") {
        const s = d.r.dung + "/" + d.r.tong, gioi = d.r.dung === d.r.tong, nh = d.bo.nhanh && LT.nhanh[d.bo.nhanh];
        return { p: { l: "chu-de", b: d.bo.id, n: ten, d: d.ngay, s }, loai: "chu-de", tieuDe: d.bo.ten, mo: A.T.mo["chu-de"](d.bo.ten, s),
          huy: [s, gioi ? A.T.huy.gioi : A.T.huy.dat], mau: nh ? nh.mau : BRAND, vang: gioi };
      }
      if (d.loai === "nganh") {
        const s = d.r.dung + "/" + d.r.tong;
        return { p: { l: "nganh", b: d.bo.nhanh, n: ten, d: d.ngay, s }, loai: "nganh", tieuDe: d.nh.ten, mo: A.T.mo.nganh(d.nh.ten, s, d.vs),
          huy: [d.nh.nhan, A.T.huy.nganh], mau: d.nh.mau, vang: true };
      }
      return { p: { l: "toan-dien", n: ten, d: d.ngay }, loai: "toan-dien", tieuDe: A.T.toanDien, mo: A.T.mo["toan-dien"](),
        huy: ["★", A.T.huy.toan], mau: ["#1E3A8A", "#7C3AED"], vang: true };
    }
    // Dựng lại nội dung từ link xác minh (không cần dữ liệu trên máy người xem)
    function tuLink(p) {
      if (p.l === "chu-de" && boCuaId[p.b] && /^\d+\/\d+$/.test(p.s || "")) {
        const [dd, nn] = p.s.split("/").map(Number);
        return noiDung({ loai: "chu-de", bo: boCuaId[p.b], r: { dung: dd, tong: nn }, ngay: p.d }, p.n);
      }
      if (p.l === "nganh" && LT.nhanh[p.b] && /^\d+\/\d+$/.test(p.s || "")) {
        return noiDung({ loai: "nganh", nh: LT.nhanh[p.b], bo: { nhanh: p.b }, r: { dung: +p.s.split("/")[0], tong: +p.s.split("/")[1] }, vs: vidLoTrinh(p.b).length, ngay: p.d }, p.n);
      }
      if (p.l === "toan-dien") return noiDung({ loai: "toan-dien", ngay: p.d }, p.n);
      return null;
    }
    const urlXm = p => "https://markhocai.com/" + (EN ? "en/" : "") + "chung-nhan.html?xm=" + A.maHoa(p);

    const goc0 = document.getElementById("cc");
    const inTen = document.getElementById("cc-ten");
    const tenLuu = A.nho.get(A.KHOA_TEN) || (A.nho.get(A.KHOA_7) || {}).ten || "";
    inTen.value = tenLuu;
    const tenHien = () => inTen.value.replace(/\s+/g, " ").trim();
    inTen.addEventListener("input", () => { A.nho.set(A.KHOA_TEN, tenHien()); if (dangTao) veTao(); });

    // ----- Danh sách -----
    const ds0 = document.getElementById("cc-ds");
    function the(d) {
      let tag = "", tieuDe, dongs = [], nut;
      const tt = '<span class="cc-tt' + (d.mo ? " is-mo" : "") + '">' + ic(d.mo ? "award" : "lock") + (d.mo ? S.moKhoa : S.chuaMo) + "</span>";
      const ktDong = (b, r) => r ? S.kt(r.dung, r.tong) + (A.datBo(r) ? " ✓" : " · " + S.ktCan(Math.ceil(b.cau_hoi.length * A.DAT - 1e-9), b.cau_hoi.length)) : S.ktChua;
      if (d.loai === "chu-de") {
        const nh = d.bo.nhanh && LT.nhanh[d.bo.nhanh];
        if (nh) tag = '<span class="ltn-tag" style="--a:' + nh.mau[0] + ";--b:" + nh.mau[1] + (nh.chu ? ";--c:" + nh.chu : "") + '">' + esc(nh.nhan) + "</span>";
        tieuDe = d.bo.ten; dongs = [S.cauHoi(d.bo.cau_hoi.length) + " · " + ktDong(d.bo, d.r)];
        nut = d.mo ? '<button type="button" class="btn btn-yt" data-tao="' + d.key + '">' + S.tao + "</button>" : '<a class="btn" href="kiem-tra.html?bo=' + d.bo.id + '">' + S.lamBai + "</a>";
      } else if (d.loai === "nganh") {
        tag = '<span class="ltn-tag" style="--a:' + d.nh.mau[0] + ";--b:" + d.nh.mau[1] + (d.nh.chu ? ";--c:" + d.nh.chu : "") + '">' + esc(d.nh.nhan) + "</span>";
        tieuDe = d.nh.ten; dongs = [ktDong(d.bo, d.r), S.lt(d.x, d.vs) + (d.x === d.vs ? " ✓" : "")];
        nut = d.mo ? '<button type="button" class="btn btn-yt" data-tao="' + d.key + '">' + S.tao + "</button>"
          : (A.datBo(d.r) ? "" : '<a class="btn" href="kiem-tra.html?bo=' + d.bo.id + '">' + S.lamBai + "</a>") + (d.x === d.vs ? "" : '<a class="btn" href="lo-trinh-nganh.html?ai=' + d.bo.nhanh + '">' + S.moLt + "</a>");
      } else if (d.loai === "toan-dien") {
        tieuDe = A.T.toanDien;
        const kq = A.ketQua();
        dongs = coBan.map(b => esc(b.ten) + ": " + (A.datBo(kq[b.id]) ? "✓" : ktDong(b, kq[b.id]).replace(/^[^:]+:\s*/, ""))).concat(S.lt7(Math.min(d.so7, 7), 7) + (d.so7 >= 7 ? " ✓" : ""));
        nut = d.mo ? '<button type="button" class="btn btn-yt" data-tao="toan-dien">' + S.tao + "</button>"
          : coBan.filter(b => !A.datBo(kq[b.id])).slice(0, 1).map(b => '<a class="btn" href="kiem-tra.html?bo=' + b.id + '">' + S.lamBai + "</a>").join("") + (d.so7 >= 7 ? "" : '<a class="btn" href="lo-trinh-7-ngay.html">' + S.mo7 + "</a>");
      } else {
        tieuDe = S.bay; dongs = [S.lt7(Math.min(d.so7, 7), 7) + (d.so7 >= 7 ? " ✓" : "")];
        nut = '<a class="btn' + (d.mo ? " btn-yt" : "") + '" href="lo-trinh-7-ngay.html' + (d.mo ? "#chung-nhan" : "") + '">' + (d.mo ? S.tao : S.mo7) + "</a>";
      }
      if (!d.mo && d.loai !== "bay") nut = '<button type="button" class="btn" data-tao="' + d.key + '">' + S.xem + "</button>" + nut;
      return '<li class="cc-the' + (d.mo ? " is-mo" : "") + '">' + tt + "<h3>" + tag + esc(tieuDe) + '</h3><ul class="cc-dk">' + dongs.map(x => "<li>" + x + "</li>").join("") + '</ul><p class="cc-nut">' + nut + "</p></li>";
    }
    function veDs() {
      const ds = trangThai();
      ds0.innerHTML = S.nhom.map(([k, ten, mo]) => {
        const muc = ds.filter(d => (k === "toan" ? d.loai === "toan-dien" : k === "bay" ? d.loai === "bay" : d.loai === k));
        // Chứng nhận đã mở khóa lên đầu nhóm
        muc.sort((a, b) => (b.mo ? 1 : 0) - (a.mo ? 1 : 0));
        return '<section class="cc-nhom"><h2>' + esc(ten) + "</h2><p>" + esc(mo) + '</p><ul class="cc-luoi' + (muc.length === 1 ? " is-mot" : "") + '">' + muc.map(the).join("") + "</ul></section>";
      }).join("");
      return ds;
    }

    // ----- Tạo chứng nhận -----
    const hop = document.getElementById("cc-tao"), cv = document.getElementById("cc-canvas"), loiEl = document.getElementById("cc-loi"), baoEl = document.getElementById("cc-bao");
    const mauChu = document.getElementById("cc-mau-chu"), nuts = document.querySelector(".cc-nuts");
    let dangTao = null, henVe = 0, luot = 0, blobUrl = "";
    // Chứng nhận chưa mở khóa vẫn xem trước được: bản mẫu điểm tối đa, chữ MẪU mờ, không có nút tải
    function banMau(d) {
      const n = d.bo ? d.bo.cau_hoi.length : 0;
      return Object.assign({}, d, { r: d.r && A.datBo(d.r) ? d.r : { dung: n, tong: n }, ngay: A.homNay() });
    }
    function veTao() {
      const d = dangTao.mo ? dangTao : banMau(dangTao), ten = tenHien(), lan = ++luot;
      mauChu.textContent = !dangTao.mo ? S.mauChu : !ten ? S.goTen : S.xemTruoc;
      clearTimeout(henVe);
      henVe = setTimeout(async () => {
        if (lan !== luot) return;
        const nd = noiDung(d, ten || S.tenGoi);
        await A.ve(cv, Object.assign({ ten: ten || S.tenGoi, ngay: d.ngay, ma: A.maCua(nd.p), mauBan: !ten || !dangTao.mo }, nd));
        cv.setAttribute("aria-label", (dangTao.mo ? "" : S.mau) + S.anh(A.T.ten[nd.loai] + ": " + nd.tieuDe, ten || S.tenGoi));
      }, lan === 1 ? 0 : 160);
    }
    function moTao(key, cuon) {
      const d = trangThai().find(x => x.key === key && x.loai !== "bay");
      if (!d) return;
      dangTao = d; luot = 0;
      document.getElementById("cc-tao-ten").textContent = (d.mo ? "" : S.mau) + A.T.ten[d.loai] + (d.loai === "chu-de" ? ": " + d.bo.ten : d.loai === "nganh" ? ": " + d.nh.ten : "");
      loiEl.textContent = ""; baoEl.textContent = "";
      nuts.hidden = !d.mo;
      hop.hidden = false;
      veTao();
      if (cuon) {
        hop.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "?tao=" + key);
      }
    }
    async function banThat() {
      if (!dangTao || !dangTao.mo) return null;
      const ten = tenHien();
      if (!ten) { loiEl.textContent = S.canTen; inTen.focus(); return null; }
      loiEl.textContent = "";
      const nd = noiDung(dangTao, ten), p = nd.p, ma = A.maCua(p);
      const blob = await A.ve(cv, Object.assign({ ten, ngay: dangTao.ngay, ma, mauBan: false }, nd));
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = blob ? URL.createObjectURL(blob) : cv.toDataURL("image/png");
      return { nd, p, ma, url: blobUrl, ten };
    }
    const tenFile = (x) => "chung-nhan-mark-hoc-ai-" + (x.p.b || x.p.l) + ".png";
    document.getElementById("cc-png").addEventListener("click", async () => {
      const x = await banThat(); if (!x) return;
      const a = document.createElement("a"); a.href = x.url; a.download = tenFile(x); document.body.appendChild(a); a.click(); a.remove();
    });
    document.getElementById("cc-pdf").addEventListener("click", async () => {
      const x = await banThat(); if (!x) return;
      const khungIn = document.getElementById("cc-in");
      khungIn.innerHTML = '<img alt="" src="' + x.url + '">';
      const im = khungIn.querySelector("img");
      await (im.decode ? im.decode().catch(() => {}) : Promise.resolve());
      document.body.classList.add("in-cc");
      const xong = () => { document.body.classList.remove("in-cc"); window.removeEventListener("afterprint", xong); };
      window.addEventListener("afterprint", xong);
      window.print();
      setTimeout(xong, 1500);
    });
    document.getElementById("cc-li").addEventListener("click", async () => {
      const x = await banThat(); if (!x) return;
      const [y, m] = x.p.d.split("-");
      const q = new URLSearchParams({ startTask: "CERTIFICATION_NAME", name: A.T.ten[x.nd.loai] + ": " + x.nd.tieuDe, organizationName: "Mark học AI",
        issueYear: y, issueMonth: String(+m), certUrl: urlXm(x.p), certId: x.ma });
      window.open("https://www.linkedin.com/profile/add?" + q.toString(), "_blank", "noopener");
    });
    document.getElementById("cc-chep").addEventListener("click", async () => {
      const x = await banThat(); if (!x) return;
      const u = urlXm(x.p);
      try { await navigator.clipboard.writeText(u); baoEl.textContent = S.daChep; } catch (e) { baoEl.textContent = S.chepTay + u; }
    });
    document.getElementById("cc-dong").addEventListener("click", () => { hop.hidden = true; dangTao = null; history.replaceState(null, "", location.pathname); });
    ds0.addEventListener("click", e => { const b = e.target.closest("[data-tao]"); if (b) moTao(b.dataset.tao, true); });

    // ----- Xác minh (?xm=...) -----
    const q = new URLSearchParams(location.search);
    if (q.get("xm")) {
      const xm = document.getElementById("cc-xm"), p = A.giaiMa(q.get("xm")), nd = p && tuLink(p);
      xm.hidden = false;
      if (!nd) {
        document.getElementById("cc-xm-chu").textContent = S.xmLoi;
      } else {
        const ma = A.maCua(nd.p);
        document.getElementById("cc-xm-chu").textContent = S.xmTot(p.n, A.T.ngayIn(p.d));
        document.getElementById("cc-xm-ma").textContent = S.xmMa + ma;
        const c2 = document.getElementById("cc-xm-canvas");
        c2.hidden = false;
        await A.ve(c2, Object.assign({ ten: p.n, ngay: p.d, ma, mauBan: false }, nd));
        c2.setAttribute("aria-label", S.anh(A.T.ten[nd.loai] + ": " + nd.tieuDe, p.n));
      }
    }

    veDs();
    window.addEventListener("pageshow", e => { if (e.persisted) veDs(); });
    goc0.dataset.san = "1";
    // Luôn có một giấy xem trước ngay đầu trang: giấy đã mở khóa đầu tiên, chưa có thì bản mẫu giấy toàn diện
    if (q.get("tao")) moTao(q.get("tao"), true);
    else if (!q.get("xm")) { const dau = trangThai().find(d => d.mo && d.loai !== "bay"); moTao(dau ? dau.key : "toan-dien", false); }
  }
})();

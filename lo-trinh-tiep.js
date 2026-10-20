// Lộ trình 7 ngày, phần dùng chung cho trang chủ và lo-trinh-7-ngay.html (VI + EN):
//   - window.mhaiNhacLT(o): tải file lịch .ics, mỗi ngày còn lại của lộ trình là một sự kiện 15 phút có báo nhắc,
//     bắt đầu từ hôm nay (nếu giờ nhắc chưa qua) hoặc ngày mai. Không cần email hay tài khoản: lịch của điện thoại tự nhắc.
//   - Trang chủ (#hoc-tiep): người đã mở lộ trình mà chưa xong 7 ngày thấy thẻ "Học tiếp ngày N".
// Tiến độ đọc từ localStorage "mhai-lo-trinh" (lo-trinh.js ghi); giờ nhắc đã chọn lưu ở "mhai-nhac-gio".
(function () {
  const EN = document.documentElement.lang === "en";
  const KHOA = "mhai-lo-trinh", KHOA_GIO = "mhai-nhac-gio", GIO = ["07:00", "12:00", "20:00", "21:30"];
  const S = EN ? {
    nhac: "Remind me every day", gio: "Time", bao: n => "Calendar file downloaded: " + n + (n === 1 ? " reminder" : " reminders") + ". Open it to add to your calendar.",
    ten: (n, t) => "Mark học AI · Day " + n + ": " + t, mo: "3 short videos, 1 game and 1 question (about 15 minutes).",
    file: "mark-hoc-ai-7-day-path.ics", xong: "You have finished all 7 days, nothing left to remind."
  } : {
    nhac: "Nhắc tôi mỗi ngày", gio: "Giờ nhắc", bao: n => "Đã tải file lịch có " + n + " lời nhắc. Mở file để thêm vào lịch điện thoại.",
    ten: (n, t) => "Mark học AI · Ngày " + n + ": " + t, mo: "3 video ngắn, 1 trò chơi và 1 câu hỏi (khoảng 15 phút).",
    file: "lo-trinh-7-ngay-mark-hoc-ai.ics", xong: "Bạn đã xong cả 7 ngày, không còn ngày nào để nhắc."
  };
  const doc = (k, mac) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? mac : v; } catch (e) { return mac; } };
  const ghi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const daXong = () => { const r = doc(KHOA, null); return r && Array.isArray(r.xong) ? r.xong.filter(n => n >= 1 && n <= 7) : []; };
  const do_ = (t, d) => window.mhaiDo && window.mhaiDo(t, d);

  // ---------- File lịch .ics (RFC 5545) ----------
  const so2 = n => String(n).padStart(2, "0");
  const ngayIcs = (d, h, m) => d.getFullYear() + so2(d.getMonth() + 1) + so2(d.getDate()) + "T" + so2(h) + so2(m) + "00";
  const chu = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  // Dòng dài hơn 75 byte phải gập (dòng sau bắt đầu bằng một dấu cách); tiếng Việt có dấu nhiều byte nên đếm theo UTF-8
  function gap(dong) {
    const enc = new TextEncoder(), ra = [];
    let cur = "", len = 0;
    for (const ch of dong) {
      const b = enc.encode(ch).length;
      if (len + b > (ra.length ? 74 : 75)) { ra.push(cur); cur = ""; len = 0; }
      cur += ch; len += b;
    }
    ra.push(cur);
    return ra.join("\r\n ");
  }
  // o: { ngay: [{n, ten}] (các ngày CHƯA xong, theo thứ tự), url (link trang lộ trình, tuyệt đối), gio "HH:MM", tu (nhãn đếm) }
  function taoIcs(o) {
    const [h, m] = o.gio.split(":").map(Number), bay = new Date(), dau = new Date(bay.getFullYear(), bay.getMonth(), bay.getDate());
    if (bay.getHours() * 60 + bay.getMinutes() > h * 60 + m - 10) dau.setDate(dau.getDate() + 1);
    const tem = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""), ma = Date.now().toString(36);
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mark hoc AI//Lo trinh 7 ngay//" + (EN ? "EN" : "VI"), "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    o.ngay.forEach((d, i) => {
      const ngay = new Date(dau); ngay.setDate(dau.getDate() + i);
      const link = o.url + "#ngay-" + d.n;
      L.push("BEGIN:VEVENT", "UID:lt7-" + ma + "-" + d.n + "@markhocai.com", "DTSTAMP:" + tem,
        "DTSTART:" + ngayIcs(ngay, h, m), "DURATION:PT15M", "SUMMARY:" + chu(S.ten(d.n, d.ten)),
        "DESCRIPTION:" + chu(S.mo + "\n" + link), "URL:" + link,
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + chu(S.ten(d.n, d.ten)), "TRIGGER:PT0M", "END:VALARM", "END:VEVENT");
    });
    L.push("END:VCALENDAR");
    return L.map(gap).join("\r\n") + "\r\n";
  }
  function nhac(o) {
    if (!o.ngay.length) return S.xong;
    const blob = new Blob([taoIcs(o)], { type: "text/calendar;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = S.file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    do_("lo-trinh-nhac", { gio: o.gio, tu: o.tu || "", con: o.ngay.length });
    return S.bao(o.ngay.length);
  }

  // Ô chọn giờ + nút, dùng ở cả hai trang. layNgay(): các ngày chưa xong [{n, ten}]
  function gan(khung, layNgay, url, tu) {
    if (!khung) return;
    const chon = khung.querySelector(".lt-nhac-gio"), nut = khung.querySelector(".lt-nhac-nut"), bao = khung.querySelector(".lt-nhac-bao");
    const cu = doc(KHOA_GIO, "20:00");
    chon.innerHTML = GIO.map(g => '<option value="' + g + '"' + (g === cu ? " selected" : "") + ">" + g + "</option>").join("");
    chon.addEventListener("change", () => ghi(KHOA_GIO, chon.value));
    nut.addEventListener("click", () => { bao.textContent = nhac({ ngay: layNgay(), url, gio: chon.value, tu }); });
    khung.hidden = false;
  }
  const nhacHTML = () => '<div class="lt-nhac" hidden><span class="lt-nhac-lich" aria-hidden="true"><i></i><b>7</b></span>' +
    '<label>' + S.gio + ' <select class="lt-nhac-gio"></select></label><button type="button" class="btn lt-nhac-nut">' + S.nhac + '</button>' +
    '<p class="lt-nhac-bao" role="status" aria-live="polite"></p></div>';
  window.mhaiNhacLT = { gan, nhacHTML };

  // ---------- Thẻ "Học tiếp ngày N" ở trang chủ ----------
  const o = document.getElementById("hoc-tiep");
  if (!o) return;
  const xong = daXong(), daMo = window.mhaiTD ? window.mhaiTD.daMo() : [];
  if (xong.length >= 7 || (!xong.length && daMo.indexOf("lo-trinh-7-ngay.html") < 0)) return;
  const goc = EN ? "../" : "";
  const lay = p => fetch(goc + "data/" + p + ".json").then(r => r.ok ? r.json() : Promise.reject(r.status));
  Promise.all([lay("lo-trinh-7-ngay"), EN ? lay("en/lo-trinh-7-ngay") : null]).then(async ([vi, en]) => {
    const ngay = vi.ngay.map((d, i) => Object.assign({}, d, en ? en.ngay[i] : {}, { n: i + 1 }));
    const con = ngay.filter(d => xong.indexOf(d.n) < 0), d = con[0];
    let game = null;
    if (d.tro_choi) game = await lay("tro-choi/" + d.tro_choi).catch(() => null);
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const link = "lo-trinh-7-ngay.html#ngay-" + d.n;
    const cham = ngay.map(x => '<li class="' + (xong.indexOf(x.n) >= 0 ? "is-xong" : x.n === d.n ? "is-nay" : "") + '"><span>' + x.n + "</span></li>").join("");
    const nhan = EN ? ["3 videos", "1 game", "1 question"] : ["3 video", "1 trò chơi", "1 câu hỏi"];
    o.innerHTML = '<div class="ltt-dau"><span class="ltt-so">' + (EN ? "Day" : "Ngày") + "<b>" + d.n + '</b></span><div class="ltt-chu">' +
      '<p class="eyebrow">' + (EN ? "Your 7-day path · " + xong.length + "/7 days done" : "Lộ trình 7 ngày của bạn · đã xong " + xong.length + "/7") + "</p>" +
      '<h2 id="ltt-h">' + esc((EN ? "Continue day " : "Học tiếp ngày ") + d.n + ": " + d.ten) + "</h2></div></div>" +
      '<ol class="ltt-cham" aria-hidden="true">' + cham + "</ol>" +
      '<div class="ltt-gom"><span>🎬 ' + nhan[0] + "</span>" + (game ? '<span>🧩 ' + esc(game.ten[EN ? "en" : "vi"]) + "</span>" : "") + "<span>❓ " + nhan[2] + "</span></div>" +
      '<div class="ltt-nut"><a class="btn btn-yt" href="' + link + '">' + (EN ? "Continue day " : "Học tiếp ngày ") + d.n + " ›</a></div>" + nhacHTML();
    o.setAttribute("aria-labelledby", "ltt-h");
    o.hidden = false;
    o.querySelector(".ltt-nut a").addEventListener("click", () => do_("lo-trinh-tiep", { ngay: d.n }));
    gan(o.querySelector(".lt-nhac"), () => con.map(x => ({ n: x.n, ten: x.ten })), "https://markhocai.com/" + (EN ? "en/" : "") + "lo-trinh-7-ngay.html", "trang-chu");
  }).catch(() => {});
})();

// Hồ sơ học (ho-so.html): đọc tiến độ trên máy người học, dựng Tuần này, Việc tiếp theo, Ôn hôm nay (hộp Leitner),
// Tiến độ, tệp lịch .ics nhắc ôn và mã chuyển tiến độ. Không gửi gì đi, trừ sự kiện đếm (theo-doi.js) nếu được bật.
(function () {
  "use strict";
  const D = JSON.parse(document.getElementById("hs-du-lieu").textContent);
  const EN = document.documentElement.lang === "en";
  const $ = id => document.getElementById(id);
  const doc = (k, mac) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? mac : v; } catch (e) { return mac; } };
  const ghi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const do_ = (t, d) => window.mhaiDo && window.mhaiDo(t, d || {});
  const TD = window.mhaiTD;
  const ngayChu = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const homNay = ngayChu(new Date());
  const congNgay = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ngayChu(d); };
  const el = (tag, cls, chu) => { const e = document.createElement(tag); if (cls) e.className = cls; if (chu != null) e.textContent = chu; return e; };
  const S = EN ? {
    thu: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    tuan: n => n ? "You learned on " + n + " of 7 days this week. Any day counts, no streak to lose." : "A new week. Five minutes is enough to start.",
    onHet: d => "Nothing due today. Next review: " + d + ".", onTrong: "Finish day 1 of the 7-day path and your first review questions appear here.",
    onXong: n => "Done! " + n + " reviewed. See you next time.", cau: (i, n) => "Question " + i + "/" + n, tiep: "Next", dung: "Right!", sai: "Not quite.",
    lamLaiTram: "Redo a station from a few days ago (it moves to Mastered):",
    t7: "7-day path", tVideo: "Videos watched", tKT: "Quizzes passed", tOn: "Review questions mastered", tram: (a, b, c) => a + "/" + b + " stations" + (c ? " · " + c + " mastered" : ""),
    tiepNgay: (n, ten) => ["Day " + n + " of the 7-day path", ten], tiepTram: (ten, nhom) => ["Practice station", ten + " · " + nhom],
    tiepKT: ["Quizzes", "Score 80% for a certificate"], tiepOn: n => ["Review " + n + " questions", "About 2 minutes"], mo: "Open ›",
    daChep: "Copied. Paste it on the other device.", chepTay: "Copy this code: ", nhapHoi: "Replace the progress on this device with the code's progress?",
    nhapLoi: "That code doesn't look right.", nhapXong: "Imported. Reloading…",
    icsTen: "Review AI with Mark (3 minutes)", icsMoTa: "Open your learning profile and review a few questions: "
  } : {
    thu: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    tuan: n => n ? "Tuần này bạn đã học " + n + "/7 ngày. Ngày nào cũng được, không có chuỗi nào bị mất." : "Tuần mới. Bắt đầu nhẹ nhàng, 5 phút là đủ.",
    onHet: d => "Hôm nay không có câu nào đến hạn. Lần ôn tới: " + d + ".", onTrong: "Học xong ngày 1 của Lộ trình 7 ngày là có câu ôn đầu tiên ở đây.",
    onXong: n => "Xong! Đã ôn " + n + " câu. Hẹn lần sau.", cau: (i, n) => "Câu " + i + "/" + n, tiep: "Câu tiếp", dung: "Đúng rồi!", sai: "Chưa đúng.",
    lamLaiTram: "Làm lại một trạm từ mấy hôm trước (làm lại là lên mức Làm chủ):",
    t7: "Lộ trình 7 ngày", tVideo: "Video đã xem", tKT: "Bộ kiểm tra đã đạt", tOn: "Câu ôn đã làm chủ", tram: (a, b, c) => a + "/" + b + " trạm" + (c ? " · " + c + " làm chủ" : ""),
    tiepNgay: (n, ten) => ["Ngày " + n + " của Lộ trình 7 ngày", ten], tiepTram: (ten, nhom) => ["Trạm thực hành", ten + " · " + nhom],
    tiepKT: ["Bài kiểm tra", "Đạt 80% là có giấy chứng nhận"], tiepOn: n => ["Ôn " + n + " câu", "Khoảng 2 phút"], mo: "Mở ›",
    daChep: "Đã chép. Dán vào trang này trên máy kia.", chepTay: "Chép mã này: ", nhapHoi: "Thay tiến độ trên máy này bằng tiến độ trong mã?",
    nhapLoi: "Mã chưa đúng, bạn chép lại thử nhé.", nhapXong: "Đã nhập. Đang tải lại…",
    icsTen: "Ôn AI cùng Mark (3 phút)", icsMoTa: "Mở hồ sơ học và ôn vài câu: "
  };

  const lt = doc("mhai-lo-trinh", { xong: [] }), xongNgay = Array.isArray(lt.xong) ? lt.xong : [];
  const tramAll = TD ? TD.tatCaTram() : {};
  const lamChu = c => c && c.lan >= 2 && c.dau && c.ngay && c.ngay !== c.dau;

  // ---------- Tuần này ----------
  (function () {
    const hd = new Set(TD ? TD.ngayHoc() : []), d = new Date(), thu = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - thu);
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const s = ngayChu(d), co = hd.has(s); if (co) n++;
      const li = el("li", (co ? "is-co" : "") + (s === homNay ? " is-nay" : ""));
      li.appendChild(el("b", null, S.thu[i])); li.appendChild(el("span", null, co ? "✓" : String(d.getDate())));
      $("hs-ngay").appendChild(li); d.setDate(d.getDate() + 1);
    }
    $("hs-tuan-chu").textContent = S.tuan(n);
  })();

  // ---------- Ôn hôm nay (Leitner: hộp 1..5 → hạn +1, +3, +7, +14, +30 ngày) ----------
  const KHOANG = [1, 3, 7, 14, 30];
  const on = doc("mhai-on", {});
  const mo = n => n <= 7 ? xongNgay.includes(n) : xongNgay.length >= 7;
  D.cau.forEach(q => { if (mo(q.ngay) && !on[q.id]) on[q.id] = { hop: 0, han: homNay }; });
  ghi("mhai-on", on);
  const denHan = D.cau.filter(q => on[q.id] && on[q.id].han <= homNay).sort((a, b) => on[a.id].hop - on[b.id].hop || (on[a.id].han < on[b.id].han ? -1 : 1)).slice(0, 5);
  const tramCu = [];
  D.nhom.forEach(([f, , nhom]) => (D.tram[f] || []).forEach(x => { const c = (tramAll[f] || {})[x.id]; if (c && !lamChu(c) && c.ngay && c.ngay <= congNgay(homNay, -2)) tramCu.push({ f, x, nhom }); }));

  function veOn() {
    const hop = $("hs-on");
    hop.textContent = "";
    if (!Object.keys(on).length) { hop.appendChild(el("p", "hs-nhe", S.onTrong)); return; }
    if (!denHan.length) {
      const sau = Object.values(on).map(x => x.han).sort()[0];
      hop.appendChild(el("p", "hs-nhe", S.onHet(sau || homNay)));
    } else {
      let i = 0, dem = 0;
      const khung = el("div", "hs-cau"); hop.appendChild(khung);
      const ve = () => {
        khung.textContent = "";
        if (i >= denHan.length) { khung.appendChild(el("p", "hs-xong", S.onXong(dem))); do_("on-xong", { so: dem }); return; }
        const q = denHan[i];
        khung.appendChild(el("p", "hs-cau-so", S.cau(i + 1, denHan.length)));
        khung.appendChild(el("p", "hs-cau-chu", q.cau));
        const ds = el("div", "hs-chon"); khung.appendChild(ds);
        const fb = el("div", "hs-fb"); fb.hidden = true;
        q.lua_chon.forEach((c, k) => {
          const b = el("button", "hs-chon-nut", c); b.type = "button";
          b.addEventListener("click", () => {
            const ok = k === q.dung, r = on[q.id];
            [].forEach.call(ds.children, (n, j) => { n.disabled = true; if (j === q.dung) n.classList.add("is-dung"); else if (n === b) n.classList.add("is-sai"); });
            r.hop = ok ? Math.min(r.hop + 1, KHOANG.length) : 0;
            r.han = congNgay(homNay, ok ? KHOANG[r.hop - 1] : 1);
            ghi("mhai-on", on); dem++; if (TD) TD.coHoc();
            fb.textContent = ""; fb.className = "hs-fb " + (ok ? "is-dung" : "is-sai");
            fb.appendChild(el("b", null, (ok ? "✓ " : "✗ ") + (ok ? S.dung : S.sai) + " "));
            fb.appendChild(document.createTextNode(q.giai)); fb.hidden = false;
            const t = el("button", "btn btn-yt hs-tiep-nut", S.tiep + " ›"); t.type = "button";
            t.addEventListener("click", () => { i++; ve(); }); khung.appendChild(t); t.focus();
          });
          ds.appendChild(b);
        });
        khung.appendChild(fb);
      };
      ve();
    }
    if (tramCu.length) {
      const x = tramCu[0], p = el("p", "hs-tram-cu"); p.appendChild(document.createTextNode(S.lamLaiTram + " "));
      const a = el("a", null, x.x.ten + " · " + x.nhom); a.href = x.f + ".html?tram=" + x.x.id; p.appendChild(a); hop.appendChild(p);
    }
  }
  veOn();

  // ---------- Việc tiếp theo ----------
  (function () {
    let v;
    const ngaySau = [1, 2, 3, 4, 5, 6, 7].find(n => !xongNgay.includes(n));
    if (denHan.length) v = [S.tiepOn(denHan.length), "#on"];
    else if (ngaySau) v = [S.tiepNgay(ngaySau, D.ten_ngay[ngaySau - 1]), "lo-trinh-7-ngay.html#ngay-" + ngaySau];
    else {
      let tot = null;
      D.nhom.forEach(([f, , nhom]) => (D.tram[f] || []).forEach(x => { if (!tot && !(tramAll[f] || {})[x.id] && !x.nc) tot = [S.tiepTram(x.ten, nhom), f + ".html?tram=" + x.id]; }));
      v = tot || [S.tiepKT, "kiem-tra.html"];
    }
    const a = el("a", "hs-tiep-the"); a.href = v[1];
    a.appendChild(el("b", null, v[0][0])); a.appendChild(el("span", null, v[0][1])); a.appendChild(el("em", null, S.mo));
    $("hs-tiep").appendChild(a);
  })();

  // ---------- Tiến độ ----------
  (function () {
    const kt = doc("mhai-kiem-tra", {}), dat = Object.values(kt).filter(r => r && r.tong && r.dung / r.tong >= 0.8 - 1e-9).length;
    const xem = TD ? TD.daXem().length : 0;
    const hang = [[S.t7, xongNgay.length, 7, xongNgay.length + "/7"], [S.tKT, dat, D.so_bo, dat + "/" + D.so_bo]];
    D.nhom.forEach(([f, bt, nhom]) => {
      const ds = D.tram[f] || [], c = tramAll[f] || {}, lam = ds.filter(x => c[x.id]).length, chu = ds.filter(x => lamChu(c[x.id])).length;
      hang.push([bt + " " + nhom, lam, ds.length, S.tram(lam, ds.length, chu)]);
    });
    const chuOn = Object.values(on).filter(x => x.hop >= 3).length;
    hang.push([S.tOn, chuOn, D.cau.length, chuOn + "/" + D.cau.length]);
    hang.push([S.tVideo, null, null, String(xem)]);
    hang.forEach(([ten, a, b, chu]) => {
      const li = el("li"); li.appendChild(el("span", "hs-thanh-ten", ten)); li.appendChild(el("b", null, chu));
      if (b) { const t = el("span", "hs-thanh"); const i = el("i"); i.style.width = Math.min(100, a / b * 100) + "%"; t.appendChild(i); li.appendChild(t); }
      $("hs-tien").appendChild(li);
    });
  })();

  // ---------- Nhắc ôn: tệp .ics (RFC 5545), 3 sự kiện sau 1, 3, 7 ngày ----------
  const gio = $("hs-gio"), nhac = doc("mhai-nhac", null);
  if (nhac && /^\d\d:\d\d$/.test(nhac)) gio.value = nhac;
  $("hs-ics").addEventListener("click", () => {
    const [h, m] = (gio.value || "20:00").split(":"), dong = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mark hoc AI//On tap//VI", "CALSCALE:GREGORIAN"];
    const pad = n => String(n).padStart(2, "0"), dau = new Date(), tem = dau.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    [1, 3, 7].forEach(n => {
      const d = new Date(); d.setDate(d.getDate() + n); d.setHours(+h, +m, 0, 0);
      const bd = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
      const kt = new Date(d.getTime() + 10 * 60000), ktc = kt.getFullYear() + pad(kt.getMonth() + 1) + pad(kt.getDate()) + "T" + pad(kt.getHours()) + pad(kt.getMinutes()) + "00";
      dong.push("BEGIN:VEVENT", "UID:mhai-on-" + bd + "-" + n + "@markhocai.com", "DTSTAMP:" + tem, "DTSTART:" + bd, "DTEND:" + ktc,
        "SUMMARY:" + S.icsTen, "DESCRIPTION:" + S.icsMoTa + D.url + "#on", "URL:" + D.url + "#on",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + S.icsTen, "TRIGGER:-PT0M", "END:VALARM", "END:VEVENT");
    });
    dong.push("END:VCALENDAR");
    ghi("mhai-nhac", gio.value);
    const a = el("a"); a.href = URL.createObjectURL(new Blob([dong.join("\r\n")], { type: "text/calendar" }));
    a.download = EN ? "mark-hoc-ai-review.ics" : "mark-hoc-ai-on-tap.ics"; document.body.appendChild(a); a.click(); a.remove();
    do_("nhac-on", { gio: gio.value });
  });

  // ---------- Mã chuyển tiến độ ----------
  const KHOA = ["mhai-lo-trinh", "mhai-nganh", "mhai-da-xem", "mhai-da-chao", "mhai-kiem-tra", "mhai-chung-chi", "mhai-ten", "mhai-phieu-luu-2",
    "mhai-tram", "mhai-hoat-dong", "mhai-da-mo", "mhai-on", "mhai-nhac"];
  const b64 = s => { let r = ""; new TextEncoder().encode(s).forEach(c => { r += String.fromCharCode(c); }); return btoa(r); };
  const tuB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
  $("hs-chep").addEventListener("click", () => {
    const g = {}; KHOA.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) g[k] = v; } catch (e) {} });
    const ma = "MHAI1." + b64(JSON.stringify(g)), bao = $("hs-bao");
    const xong = ok => { bao.textContent = ok ? S.daChep : S.chepTay + ma; };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ma).then(() => xong(true), () => xong(false)); else xong(false);
    do_("chep-ma-tien-do");
  });
  $("hs-nhap").addEventListener("click", () => {
    const s = $("hs-ma-o").value.trim(), bao = $("hs-bao");
    let g = null;
    try { if (s.indexOf("MHAI1.") === 0) g = JSON.parse(tuB64(s.slice(6))); } catch (e) { g = null; }
    if (!g || typeof g !== "object") { bao.textContent = S.nhapLoi; return; }
    if (!confirm(S.nhapHoi)) return;
    Object.keys(g).forEach(k => { if (KHOA.includes(k) && typeof g[k] === "string") { try { localStorage.setItem(k, g[k]); } catch (e) {} } });
    bao.textContent = S.nhapXong; do_("nhap-ma-tien-do");
    setTimeout(() => location.reload(), 600);
  });
})();

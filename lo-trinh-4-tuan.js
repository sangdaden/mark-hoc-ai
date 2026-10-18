// Lộ trình 4 tuần (lo-trinh-4-tuan.html): bài xếp trình độ 5 câu (lưu mhai-xep) và tiến độ từng tuần từ tien-do.js,
// mhai-lo-trinh, mhai-kiem-tra, mhai-on. Nghề chọn ở tuần 2 lưu ở mhai-xep.nghe, dùng cho nút mở trạm ở tuần 2 và 3.
(function () {
  "use strict";
  const D = JSON.parse(document.getElementById("l4-du-lieu").textContent);
  const EN = document.documentElement.lang === "en";
  const $ = id => document.getElementById(id);
  const doc = (k, mac) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? mac : v; } catch (e) { return mac; } };
  const ghi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const do_ = (t, d) => window.mhaiDo && window.mhaiDo(t, d || {});
  const el = (tag, cls, chu) => { const e = document.createElement(tag); if (cls) e.className = cls; if (chu != null) e.textContent = chu; return e; };
  const TD = window.mhaiTD;
  const S = EN ? {
    cau: (i, n) => "Question " + i + "/" + n, ketQua: n => "You got " + n + "/5.",
    goiY: ["Start at week 1, day 1. The basics make everything after easier.", "You know the basics. Start at week 2: practice for your job.", "Strong start! Jump to week 3: the advanced stations."],
    diToi: "Go to week ", lamLai: "Retake", dem: (a, b) => a + "/" + b + " done", ngay: "7-day path", tram: "core stations", nc: "advanced stations", kt: "core quizzes passed", on: "review answers",
    chonNghe: "Pick a job above first."
  } : {
    cau: (i, n) => "Câu " + i + "/" + n, ketQua: n => "Bạn đúng " + n + "/5.",
    goiY: ["Bắt đầu từ tuần 1, ngày 1. Vững nền thì các tuần sau dễ hơn nhiều.", "Bạn đã nắm nền tảng. Bắt đầu từ tuần 2: thực hành theo nghề.", "Khởi đầu tốt! Nhảy thẳng tới tuần 3: các trạm nâng cao."],
    diToi: "Tới tuần ", lamLai: "Làm lại", dem: (a, b) => "Đã xong " + a + "/" + b, ngay: "Lộ trình 7 ngày", tram: "trạm cơ bản", nc: "trạm nâng cao", kt: "bộ kiến thức chung đã đạt", on: "câu ôn đã trả lời",
    chonNghe: "Chọn một nghề ở trên trước nhé."
  };
  const xep = doc("mhai-xep", {}) || {};

  // ---------- Bài xếp trình độ ----------
  function veXep() {
    const hop = $("l4-xep"); hop.textContent = "";
    if (xep.dung != null) {
      const muc = xep.dung <= 2 ? 0 : xep.dung <= 4 ? 1 : 2, tuan = muc + 1;
      hop.appendChild(el("p", "l4-kq", S.ketQua(xep.dung) + " " + S.goiY[muc]));
      const h = el("div", "l4-hang");
      const a = el("a", "btn btn-yt", S.diToi + tuan + " ›"); a.href = "#tuan-" + tuan; h.appendChild(a);
      const b = el("button", "btn", S.lamLai); b.type = "button"; b.addEventListener("click", () => { delete xep.dung; ghi("mhai-xep", xep); veXep(); }); h.appendChild(b);
      hop.appendChild(h);
      document.querySelectorAll(".l4-tuan").forEach(li => li.classList.toggle("is-goi-y", +li.dataset.tuan === tuan));
      return;
    }
    let i = 0, dung = 0;
    const ve = () => {
      hop.textContent = "";
      if (i >= D.xep.length) { xep.dung = dung; ghi("mhai-xep", xep); do_("xep-trinh-do", { dung }); veXep(); return; }
      const q = D.xep[i];
      hop.appendChild(el("p", "l4-cau-so", S.cau(i + 1, D.xep.length)));
      hop.appendChild(el("p", "l4-cau", q.cau));
      const ds = el("div", "l4-chon"); hop.appendChild(ds);
      q.lua_chon.forEach((c, k) => {
        const b = el("button", "l4-chon-nut", c); b.type = "button";
        b.addEventListener("click", () => { if (k === q.dung) dung++; i++; ve(); });
        ds.appendChild(b);
      });
    };
    ve();
  }
  veXep();

  // ---------- Tiến độ từng tuần ----------
  const lt = doc("mhai-lo-trinh", { xong: [] }), xong7 = Array.isArray(lt.xong) ? lt.xong.length : 0;
  const tram = TD ? TD.tatCaTram() : {}, kt = doc("mhai-kiem-tra", {}), on = doc("mhai-on", {});
  const nutNghe = [].slice.call(document.querySelectorAll(".l4-nghe"));
  function capNhat() {
    const f = xep.nghe, n = D.nghe.find(x => x[0] === f), lam = tram[f] || {};
    nutNghe.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.trang === f)));
    const moNghe = document.querySelector(".l4-mo-nghe"), moNc = document.querySelector(".l4-mo-nc");
    if (n) { moNghe.href = f + ".html?tram=" + (n[3].find(id => !lam[id]) || n[3][0]); moNc.href = f + ".html?tram=" + (n[4].find(id => !lam[id]) || n[4][0] || n[3][0]); }
    const dat = D.co_ban.filter(id => kt[id] && kt[id].tong && kt[id].dung / kt[id].tong >= 0.8 - 1e-9).length;
    const daOn = Object.values(on).filter(x => x.hop >= 1).length;
    const so = {
      1: [xong7, 7, S.ngay],
      2: n ? [n[3].filter(id => lam[id]).length, n[3].length, n[2] + " · " + S.tram] : null,
      3: n ? [n[4].filter(id => lam[id]).length, n[4].length, n[2] + " · " + S.nc] : null,
      4: [dat, D.co_ban.length, S.kt]
    };
    document.querySelectorAll(".l4-tuan").forEach(li => {
      const t = +li.dataset.tuan, x = so[t], dem = li.querySelector(".l4-dem"), i = li.querySelector(".l4-thanh i");
      if (!x) { dem.textContent = S.chonNghe; i.style.width = "0"; li.classList.remove("is-xong"); li.querySelector(".l4-trang").hidden = true; return; }
      const xongTuan = x[1] > 0 && x[0] >= x[1];
      dem.textContent = S.dem(x[0], x[1]) + " · " + x[2] + (t === 4 && daOn ? " · " + daOn + " " + S.on : "");
      i.style.width = (x[1] ? Math.min(100, x[0] / x[1] * 100) : 0) + "%";
      li.classList.toggle("is-xong", xongTuan); li.querySelector(".l4-trang").hidden = !xongTuan;
    });
  }
  nutNghe.forEach(b => b.addEventListener("click", () => { xep.nghe = b.dataset.trang; ghi("mhai-xep", xep); capNhat(); do_("l4-chon-nghe", { trang: xep.nghe }); }));
  capNhat();
})();

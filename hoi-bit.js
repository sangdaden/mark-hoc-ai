// Hỏi Bit (hoi-bit.html, en/hoi-bit.html): gõ câu hỏi tự nhiên, Bit trả lời bằng đúng đoạn nội dung trong video của kênh.
// Không có server: data/hoi-dap.json (scripts/tao_hoi_dap.py) chứa các đoạn của mọi bài video + Từ điển AI, trang chấm điểm ngay trên trình duyệt
// (BM25 trên từ đã bỏ dấu + cặp từ liền nhau, tiêu đề mục nặng gấp đôi), nên chỉ trả lời bằng nội dung đã có trên kênh. Sang góp ý 11/10/2026.
(function () {
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  // Từ hỏi/nối không mang nội dung (đã bỏ dấu); vẫn dùng để ghép cặp từ như "claude in chrome"
  const BO = new Set(("la gi cua va co khong nhu the nao sao cach dung lam toi ban minh cho voi trong mot nhung cac de duoc thi ma nay do hay oi nhe " +
    "vay ve a ah u bang khi neu giup gium hoi muon biet ra di roi chua tu den o thu xem nghia nhieu it rat " +
    "the a an is are was what how do does did to of in on for i you my me can could with about and or it this that use using why when which who " +
    "should would please tell explain mean means").split(" "));
  const tach = s => norm(s).match(/[a-z0-9]+/g) || [];
  const goc = w => w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w; // prompts -> prompt
  function tuKhoa(s) {
    const t = tach(s).map(goc), out = [];
    t.forEach((w, i) => {
      if (!BO.has(w)) out.push(w);
      if (i && !(BO.has(w) && BO.has(t[i - 1]))) out.push(t[i - 1] + "_" + w);
    });
    return out;
  }

  function taoBoHoi(data) {
    const docs = [];
    data.v.forEach(([so, url, ten, series, muc]) => muc.forEach(([tieuDe, noiDung], i) =>
      docs.push({ loai: "v", so, url, ten, series, i, tieuDe, noiDung })));
    data.t.forEach(([id, ten, giaiThich, video]) =>
      docs.push({ loai: "t", id, ten, tieuDe: ten, noiDung: giaiThich, video }));
    const df = new Map();
    let tong = 0;
    docs.forEach(d => {
      const tf = new Map();
      const cong = (s, w) => tuKhoa(s).forEach(k => tf.set(k, (tf.get(k) || 0) + w));
      cong(d.tieuDe, d.loai === "t" ? 3 : 2);
      cong(d.noiDung, 1);
      if (d.ten && d.loai === "v") cong(d.ten, 1);
      d.tf = tf;
      d.dai = [...tf.values()].reduce((a, b) => a + b, 0);
      tong += d.dai;
      tf.forEach((_, k) => df.set(k, (df.get(k) || 0) + 1));
    });
    const N = docs.length, tb = tong / N;
    const idf = k => Math.log(1 + (N - (df.get(k) || 0) + 0.5) / ((df.get(k) || 0) + 0.5));

    function hoi(cau) {
      const q = [...new Set(tuKhoa(cau))];
      const don = q.filter(k => !k.includes("_") && df.has(k));
      if (!don.length) return null;
      const diem = docs.map(d => {
        let s = 0, trung = 0;
        q.forEach(k => {
          const f = d.tf.get(k);
          if (!f) return;
          if (!k.includes("_")) trung++;
          s += idf(k) * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.dai / tb));
        });
        // ưu tiên đoạn có đủ các từ của câu hỏi
        return { d, s: s * Math.pow(trung / don.length, 1.5) };
      }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
      if (!diem.length) return null;
      // Gom theo video: điểm video = đoạn tốt nhất + một phần các đoạn khác cùng video
      const theoVideo = new Map();
      diem.forEach(x => {
        const k = x.d.loai === "t" ? "t:" + x.d.id : x.d.so;
        const g = theoVideo.get(k) || { k, d: x.d, s: 0, doan: [] };
        g.s += g.doan.length ? x.s * 0.25 : x.s;
        g.doan.push(x);
        theoVideo.set(k, g);
      });
      const ds = [...theoVideo.values()].sort((a, b) => b.s - a.s);
      return { tu: don, ds };
    }
    return { hoi, tuKhoa };
  }

  if (typeof document === "undefined") { module.exports = { taoBoHoi, tuKhoa, norm }; return; }

  const EN = document.documentElement.lang === "en";
  const me = document.currentScript;
  const goc0 = me ? me.src.replace(/hoi-bit\.js.*$/, "") : "";
  const nha = ""; // link bài tương đối với trang đang xem: bai/... (bản Anh nằm trong en/bai/)
  const S = EN ? {
    hoi: "Ask Bit", dangTai: "Bit is reading through all the videos…", loi: "Could not load the data. Please reload the page.",
    khong: q => "Bit hasn't found any video about “" + q + "” yet. Try other words, or ask the community on Discord.",
    trongVideo: "In video", docBai: "Read the full article", xemDoan: "Jump to this part", tuDien: "In the AI glossary",
    lienQuan: "Other videos that mention it", videoTd: "Videos that explain it", them: "More in this video"
  } : {
    hoi: "Hỏi Bit", dangTai: "Bit đang đọc lại các video…", loi: "Không tải được dữ liệu. Bạn tải lại trang giúp nhé.",
    khong: q => "Bit chưa thấy video nào nói về “" + q + "”. Thử hỏi bằng từ khác, hoặc hỏi cộng đồng trên Discord nhé.",
    trongVideo: "Trong video", docBai: "Đọc cả bài", xemDoan: "Tới đúng đoạn này", tuDien: "Trong Từ điển AI",
    lienQuan: "Video khác cũng nhắc tới", videoTd: "Video giải thích chữ này", them: "Thêm trong video này"
  };
  const esc = s => (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = n => String(n).padStart(2, "0");

  const form = document.getElementById("hb-form"), input = document.getElementById("hb-q"), kq = document.getElementById("hb-kq");
  if (!form) return;
  let bo = null, tenVideo = {};
  const tai = fetch(goc0 + (EN ? "data/en/" : "data/") + "hoi-dap.json").then(r => r.json()).then(d => {
    bo = taoBoHoi(d);
    d.v.forEach(v => { tenVideo[v[0]] = v; });
  });

  // Tô đậm các chữ trùng với câu hỏi (so bằng chữ đã bỏ dấu)
  function to(text, tu) {
    const set = new Set(tu);
    return esc(text).replace(/[\p{L}\p{N}]+/gu, w => set.has(goc(norm(w))) ? "<mark>" + w + "</mark>" : w);
  }
  // Link mở bài và cuộn tới đúng câu (text fragment; trình duyệt không hỗ trợ thì mở đầu bài)
  const toiDoan = (url, text) => nha + url + "#:~:text=" + encodeURIComponent(text.split(/\s+/).slice(0, 8).join(" "));

  function veVideo(g, tu) {
    // Đoạn khớp nhất lên đầu (đó là câu trả lời), thêm tối đa 2 đoạn khớp khác của cùng video theo thứ tự trong bài
    const d = g.d, tot = g.doan[0];
    const doan = [tot].concat(g.doan.slice(1).filter(x => x.s >= tot.s * 0.35).slice(0, 2).sort((a, b) => a.d.i - b.d.i));
    return '<article class="hb-tl"><img class="hb-bit" src="' + goc0 + 'assets/bit-y-tuong.svg" alt="" width="56" height="67">' +
      '<div class="hb-noi"><p class="hb-nguon">' + S.trongVideo + ' <b>#' + pad(d.so) + '</b>' + (d.series ? " · " + esc(d.series) : "") + '</p>' +
      '<h2><a href="' + nha + d.url + '">' + esc(d.ten) + '</a></h2>' +
      doan.map(x => '<div class="hb-doan"><h3>' + to(x.d.tieuDe, tu) + '</h3><p>' + to(x.d.noiDung, tu) + '</p></div>').join("") +
      '<div class="cta"><a class="btn btn-yt" href="' + toiDoan(d.url, doan[0].d.noiDung) + '">' + S.xemDoan + ' ›</a><a class="btn" href="' + nha + d.url + '">' + S.docBai + '</a></div></div></article>';
  }
  function veTuDien(g, tu) {
    const d = g.d;
    const vids = (d.video || []).filter(s => tenVideo[s]).slice(0, 4);
    return '<article class="hb-tl"><img class="hb-bit" src="' + goc0 + 'assets/bit-y-tuong.svg" alt="" width="56" height="67">' +
      '<div class="hb-noi"><p class="hb-nguon">' + S.tuDien + '</p><h2><a href="' + nha + "tu-dien.html#" + d.id + '">' + esc(d.ten) + '</a></h2><p>' + to(d.noiDung, tu) + '</p>' +
      (vids.length ? '<p class="hb-nguon">' + S.videoTd + '</p><ul class="hb-lq">' + vids.map(s => '<li><a href="' + nha + tenVideo[s][1] + '"><span class="num">#' + pad(s) + '</span>' + esc(tenVideo[s][2]) + '</a></li>').join("") + "</ul>" : "") +
      "</div></article>";
  }

  function tra(cau) {
    cau = cau.trim();
    if (!cau) { kq.innerHTML = ""; return; }
    const r = bo.hoi(cau);
    if (!r) {
      kq.innerHTML = '<p class="hb-khong">' + esc(S.khong(cau)) + ' <a href="https://discord.gg/jJjtxhgAsg" target="_blank" rel="noopener">Discord ›</a></p>';
      return;
    }
    const dau = r.ds[0], con = r.ds.slice(1).filter(g => g.d.loai === "v" && g.s >= dau.s * 0.2).slice(0, 5);
    kq.innerHTML = (dau.d.loai === "t" ? veTuDien(dau, r.tu) : veVideo(dau, r.tu)) +
      (con.length ? '<h2 class="hb-lq-h">' + S.lienQuan + '</h2><ul class="hb-lq">' + con.map(g =>
        '<li><a href="' + toiDoan(g.d.url, g.doan[0].d.noiDung) + '"><span class="num">#' + pad(g.d.so) + '</span><span><b>' + esc(g.d.ten) + '</b><small>' + esc(g.doan[0].d.tieuDe) + '</small></span></a></li>').join("") + "</ul>" : "");
  }

  function chay(cau, ghi) {
    if (ghi) {
      const u = new URL(location.href);
      if (cau.trim()) u.searchParams.set("q", cau.trim()); else u.searchParams.delete("q");
      history.replaceState(null, "", u);
    }
    if (bo) return tra(cau);
    kq.innerHTML = '<p class="hb-khong">' + S.dangTai + "</p>";
    tai.then(() => tra(input.value)).catch(() => { kq.innerHTML = '<p class="hb-khong">' + S.loi + "</p>"; });
  }
  form.addEventListener("submit", e => { e.preventDefault(); chay(input.value, true); });
  document.querySelectorAll(".hb-goi-y button").forEach(b => b.addEventListener("click", () => { input.value = b.textContent; chay(input.value, true); input.focus(); }));
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) { input.value = q0; chay(q0, false); }
})();

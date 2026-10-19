// Lộ trình theo ngành (Sang 11/10/2026): vừa vào trang chủ, Mark hỏi "Bạn là ai?". Người xem chọn ngành có sẵn, gõ nghề ngách, hoặc chỉ muốn tự khám phá.
// - Trang chủ (index.html): hộp chào <dialog> chỉ tự mở ở lần đầu ghé; chọn xong sang lo-trinh-nganh.html. Đã chọn rồi thì hiện dải "Lộ trình của bạn" trong #bat-dau.
// - lo-trinh-nganh.html: ô chọn ở đầu trang, bên dưới là lộ trình từng bước và video phù hợp. ?ai=<id> (ngành có sẵn) hoặc ?nghe=<chữ> (nghề ngách) để chia sẻ link.
// Dữ liệu: data/lo-trinh-nganh.json (ngành, bước, từ khóa nghề ngách), videos.json (1-300), video-nhanh.json (303-376), lich-ra-mat.json.
// Lựa chọn và video đã xem lưu trên máy người xem nếu được (mhai-nganh, mhai-da-xem); không lưu được thì trang vẫn chạy bình thường.
(function () {
  const KHOA_NGANH = "mhai-nganh", KHOA_CHAO = "mhai-da-chao", KHOA_XEM = "mhai-da-xem";
  const nho = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  // Bản tiếng Anh (en/index.html, en/lo-trinh-nganh.html) dùng chung file này: chữ trong S, nội dung dịch ở data/en/lo-trinh-nganh.json và data/en/video-nhanh.json
  const EN = document.documentElement.lang === "en";
  const goc = EN ? "../" : "";
  const S = EN ? {
    nghePH: "Your job or field", ngheNhan: "Not listed? Type your job, for example “hairdresser”, “accountant”, “shrimp farmer”.", xem: "See my path ›",
    dong: "Close", chao1: "Hi, I'm Mark!", chao2: "Who are you?", chao3: "Pick one and I'll line up a learning path and videos that fit you. No sign-up needed. Videos are in Vietnamese; every article is in English.",
    khamPha: "I just want to explore the channel ›", nghe: n => "Job “" + n + "”", cuaBan: t => "Your path: " + t, cuaBan2: "Pick up the steps and the videos you've ticked.",
    tiep: "Continue ›", doi: "Change my choice", raMat: d => "Out " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+d.slice(5, 7) - 1] + " " + (+d.slice(8, 10)) + ", " + d.slice(0, 4),
    lamTheo: "Walkthrough", sapRa: "Coming soon", danhDau: "Mark as watched", daXemSo: so => "Watched video " + so,
    buoc: "Step ", series: (t, n) => " · series " + t + ", " + n + " parts", choBan: "Your path", note: "Tick the box next to each video once you've watched it. Progress is saved in this browser.",
    chep: "Copy link to this path", khac: "Pick another field ›", ktNganh: "Take the field quiz", ccNganh: "Field certificate", ghiCc: "Tick off every video and pass the field quiz to get a field certificate with your name.", daChep: "Link copied. Paste it into a message to share.", chepTay: "Copy this link to share: ",
    dem: (a, b) => "Watched " + a + "/" + b + " videos", tieuDe: t => "Path: " + t + " | Mark học AI", tieuDeNghe: t => "Path for " + t + " | Mark học AI",
    mailChuDe: n => "Video idea for " + n, goiY: "Suggest a topic ›",
    nen: ["Basics for every job", "The 5-part prompt, where AI makes things up, and what data you must never paste into AI."],
    sat: ["Videos close to your job", n => "Videos the channel made for jobs close to “" + n + "”."],
    nhac: [n => "Videos that mention “" + n + "”", "The channel has no video just for this job yet, but these videos talk about it."],
    chaoSat: (k, g) => "I found " + k + (k === 1 ? " video" : " videos") + " close to your job, then the path for " + g + " continues from there.",
    chaoGan: g => "The channel has no video just for this job yet, but it's close to " + g + ", so I'm using that path.",
    ghiGan: g => "The steps after the job videos come from the path for <b>" + g + "</b>.", muon: n => " Want the channel to make videos for “" + n + "”?",
    chung: [["Paperwork, email and planning", "What every job has: long emails, letters and forms, weekly plans, hard-to-read papers."],
      ["Build an assistant for your job", "Teach AI what you do, save the prompts you reuse and let AI handle repeat work."],
      ["AI and your job", "Which tasks AI takes first, which skills keep their value, and a 90-day plan."]],
    chaoChungSat: k => "I found " + k + (k === 1 ? " video" : " videos") + " close to your job, followed by a general path that works for any job.",
    chaoChung: n => "The channel has no video just for “" + n + "” yet. Here's a general path that works for any job.",
    muon2: "Want the channel to make videos for this job?", ngheCuaBan: n => "Your job: " + n, banTin: "This week's digest"
  } : {
    nghePH: "Nghề hoặc ngành của bạn", ngheNhan: "Nghề của bạn không có ở trên? Gõ vào đây, ví dụ “tiệm tóc”, “kế toán”, “nuôi tôm”.", xem: "Xem lộ trình ›",
    dong: "Đóng", chao1: "Chào bạn, mình là Mark!", chao2: "Bạn là ai?", chao3: "Chọn một ô, mình đưa lộ trình và video hợp với bạn. Không cần đăng ký.",
    khamPha: "Mình chỉ muốn tự khám phá kênh ›", nghe: n => "Nghề “" + n + "”", cuaBan: t => "Lộ trình của bạn: " + t, cuaBan2: "Xem tiếp các bước và video đã đánh dấu.",
    tiep: "Xem tiếp ›", doi: "Đổi lựa chọn", raMat: d => "Ra mắt " + d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4),
    lamTheo: "Bài làm theo", sapRa: "Sắp ra mắt", danhDau: "Đánh dấu đã xem", daXemSo: so => "Đã xem video " + so,
    buoc: "Bước ", series: (t, n) => " · series " + t + ", " + n + " phần", choBan: "Lộ trình cho bạn", note: "Bấm ô vuông cạnh mỗi video để đánh dấu đã xem. Tiến độ lưu ngay trên trình duyệt này.",
    chep: "Chép link lộ trình", khac: "Chọn ngành khác ›", ktNganh: "Làm bài kiểm tra ngành", ccNganh: "Giấy chứng nhận chuyên ngành", ghiCc: "Đánh dấu xem hết video và đạt bài kiểm tra ngành là nhận giấy chứng nhận chuyên ngành có tên bạn.", daChep: "Đã chép link. Dán vào tin nhắn để gửi bạn bè.", chepTay: "Chép link này để chia sẻ: ",
    dem: (a, b) => "Đã xem " + a + "/" + b + " video", tieuDe: t => "Lộ trình " + t + " | Mark học AI", tieuDeNghe: t => "Lộ trình cho nghề " + t + " | Mark học AI",
    mailChuDe: n => "Gợi ý video cho nghề " + n, goiY: "Gợi ý chủ đề cho kênh ›",
    nen: ["Nền tảng cho mọi nghề", "Prompt 5 mảnh, AI bịa ở đâu, và dữ liệu nào không được dán vào AI."],
    sat: ["Video sát nghề của bạn", n => "Những video kênh làm riêng cho nghề gần với “" + n + "”."],
    nhac: [n => "Video có nhắc tới “" + n + "”", "Kênh chưa có video riêng cho nghề này, nhưng các video dưới đây có nói tới."],
    chaoSat: (k, g) => "Mình tìm được " + k + " video sát nghề của bạn, rồi nối tiếp bằng lộ trình " + g + ".",
    chaoGan: g => "Kênh chưa có video riêng cho nghề này, nhưng nó gần với nhóm " + g + ", nên mình dùng lộ trình đó.",
    ghiGan: g => "Các bước sau phần video riêng lấy từ lộ trình <b>" + g + "</b>.", muon: n => " Muốn kênh làm video cho nghề “" + n + "”?",
    chung: [["Giấy tờ, email và kế hoạch", "Những việc nghề nào cũng có: email dài, đơn từ, kế hoạch tuần, giấy tờ khó đọc."],
      ["Dựng trợ lý riêng cho nghề của bạn", "Dạy AI biết bạn làm nghề gì, lưu câu lệnh hay dùng và để AI tự làm việc lặp lại."],
      ["AI và nghề của bạn", "Việc nào AI nhận trước, kỹ năng nào giữ giá, và kế hoạch 90 ngày."]],
    chaoChungSat: k => "Mình tìm được " + k + " video sát nghề của bạn, rồi nối tiếp bằng lộ trình chung nghề nào cũng dùng được.",
    chaoChung: n => "Kênh chưa có video riêng cho nghề “" + n + "”. Đây là lộ trình chung, nghề nào cũng dùng được.",
    muon2: "Muốn kênh làm video cho nghề này?", ngheCuaBan: n => "Nghề của bạn: " + n, banTin: "Bản tin tuần"
  };
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-' + n + '"/></svg>';
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9&+]+/g, " ").trim();
  const load = name => fetch(goc + "data/" + name + ".json", { cache: "no-cache" }).then(r => r.json());
  // Dữ liệu lộ trình: bản Việt, bản Anh thì phủ chữ dịch lên (cùng id, cùng thứ tự bước), từ khóa Anh cộng thêm vào từ khóa Việt
  async function loadD() {
    const D = await load("lo-trinh-nganh");
    if (!EN) return D;
    const T = await load("en/lo-trinh-nganh");
    D.nhom.forEach((g, i) => { g.ten = T.nhom[i] || g.ten; });
    Object.keys(T.nhanh || {}).forEach(id => { if (D.nhanh[id]) D.nhanh[id].ten = T.nhanh[id]; });
    Object.keys(D.nganh).forEach(id => {
      const n = D.nganh[id], t = T.nganh[id];
      if (!t) return;
      Object.assign(n, { ten: t.ten, ngan: t.ngan, chao: t.chao, tu_khoa: t.tu_khoa.concat(n.tu_khoa) });
      n.buoc.forEach((b, i) => { if (t.buoc[i]) Object.assign(b, t.buoc[i]); });
    });
    D.ngach.forEach((n, i) => { n.tu_khoa = (T.ngach[i] || []).concat(n.tu_khoa); });
    return D;
  }
  const pad = n => String(n).padStart(2, "0");
  const LAM_THEO = { 301: "lam-theo.html#phan-tich-so-ban-hang", 302: "lam-theo.html#du-doan-ban-hang" };
  const LAM_THEO_TEN = EN ? { 301: "Analyze your sales book with AI from A to Z: 9 steps, with a sample file", 302: "Predict how many cups you'll sell tomorrow: a first machine learning model in Python" }
    : { 301: "Phân tích sổ bán hàng với AI từ A đến Z: 9 bước, kèm file mẫu", 302: "Dự đoán ngày mai bán bao nhiêu ly: model machine learning đầu tiên với Python" };

  // Đã chọn gì: {ai: id} hoặc {nghe: "chữ đã gõ"}
  const docChon = () => { try { return JSON.parse(nho.get(KHOA_NGANH) || "null"); } catch (e) { return null; } };
  const linkChon = c => "lo-trinh-nganh.html?" + (c.ai ? "ai=" + encodeURIComponent(c.ai) : "nghe=" + encodeURIComponent(c.nghe));

  // Khớp chữ người xem gõ với từ khóa (data/lo-trinh-nganh.json, viết có dấu). Gõ có dấu thì so có dấu, để "thuê xe" không dính "thuế";
  // gõ không dấu thì so không dấu. Khớp trọn từ, hoặc chữ gõ là phần đầu của từ khóa (gõ "giáo" ra "giáo viên").
  const thuong = s => (s || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}&+/]+/gu, " ").trim();
  function timNghe(D, chu) {
    const f = /[^\x00-\x7f]/.test(thuong(chu)) ? thuong : norm;
    const q = f(chu);
    const co = k => { const t = f(k); return !!t && (q === t || (" " + q + " ").includes(" " + t + " ") || (q.length >= 4 && t.startsWith(q))); };
    const dung = k => f(k) === q;
    const ngach = D.ngach.filter(n => n.tu_khoa.some(co));
    const nganh = Object.keys(D.nganh).filter(id => D.nganh[id].tu_khoa.some(co) || co(D.nganh[id].ngan));
    // Gõ đúng tên một ngành có sẵn (ví dụ "giáo viên", "data analyst"): đưa thẳng lộ trình đó
    const trung = Object.keys(D.nganh).filter(id => D.nganh[id].tu_khoa.some(dung) || dung(D.nganh[id].ngan));
    return { q: norm(chu), ngach, nganh, trung };
  }

  // Ô chọn "Bạn là ai?" dùng chung cho hộp chào ở trang chủ và đầu trang lộ trình
  function oChon(D, dangChon) {
    const nut = id => {
      const n = D.nganh[id], nh = n.nhanh && D.nhanh[n.nhanh];
      const dau = nh ? '<span class="ltn-tag" style="--a:' + nh.mau[0] + ";--b:" + nh.mau[1] + (nh.chu ? ";--c:" + nh.chu : "") + '">' + esc(nh.nhan) + "</span>" : ic(n.icon);
      return '<li><button type="button" class="ltn-nut' + (dangChon === id ? " is-on" : "") + '" data-ai="' + id + '"' + (dangChon === id ? ' aria-pressed="true"' : "") + ">" + dau + "<span>" + esc(n.ngan) + "</span></button></li>";
    };
    // Nhóm đầu luôn mở. Các nhóm sau (ngành dữ liệu và công nghệ) gập lại thành một dòng, trừ khi người xem đã chọn một ngành trong đó (Sang chọn W1, 19/10)
    return D.nhom.map((g, i) => {
      const ds = '<ul class="ltn-nuts">' + g.ds.map(nut).join("") + "</ul>";
      if (i === 0) return '<p class="ltn-nhom">' + esc(g.ten) + "</p>" + ds;
      return '<details class="ltn-gap"' + (g.ds.includes(dangChon) ? " open" : "") + '><summary class="ltn-nhom">' + esc(g.ten) +
        ' <span class="ltn-gap-so">' + g.ds.length + "</span></summary>" + ds + "</details>";
    }).join("") +
      '<form class="ltn-nghe" autocomplete="off"><label for="ltn-o-nghe">' + S.ngheNhan + '</label>' +
      '<div class="ltn-nghe-row"><input id="ltn-o-nghe" name="nghe" type="text" maxlength="60" placeholder="' + S.nghePH + '" required>' +
      '<button class="btn btn-yt" type="submit">' + S.xem + '</button></div></form>';
  }
  function ganChon(goc, D, khiChon) {
    goc.addEventListener("click", e => {
      const b = e.target.closest(".ltn-nut");
      if (b) khiChon({ ai: b.dataset.ai });
    });
    goc.addEventListener("submit", e => {
      if (!e.target.closest(".ltn-nghe")) return;
      e.preventDefault();
      const chu = e.target.nghe.value.trim();
      if (!chu) return;
      const t = timNghe(D, chu);
      // Gõ đúng tên một ngành có sẵn (ví dụ "giáo viên", "data analyst") thì đưa thẳng lộ trình đó
      khiChon(!t.ngach.length && t.trung.length === 1 ? { ai: t.trung[0] } : { nghe: chu });
    });
  }

  // ===== Trang chủ: hộp chào lần đầu và dải "Lộ trình của bạn" =====
  async function trangChu() {
    const D = await loadD();
    const chon = docChon();
    const hop = document.createElement("dialog");
    hop.className = "chao-hop";
    hop.setAttribute("aria-labelledby", "chao-ten");
    hop.innerHTML = '<button type="button" class="hop-dong" aria-label="' + S.dong + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>' +
      '<div class="chao-in"><div class="chao-dau"><img src="' + goc + 'assets/mark-chao.svg" alt="" width="96" height="91"><div><p class="eyebrow">' + S.chao1 + '</p>' +
      '<h2 id="chao-ten">' + S.chao2 + '</h2><p>' + S.chao3 + '</p></div></div>' +
      oChon(D, chon && chon.ai) +
      '<button type="button" class="chao-kham-pha" data-kham-pha>' + S.khamPha + '</button></div>';
    document.body.appendChild(hop);
    const dong = () => { nho.set(KHOA_CHAO, "1"); if (hop.open) hop.close(); };
    ganChon(hop, D, c => { nho.set(KHOA_CHAO, "1"); nho.set(KHOA_NGANH, JSON.stringify(c)); location.href = linkChon(c); });
    hop.addEventListener("click", e => {
      if (e.target === hop || e.target.closest(".hop-dong")) dong();
      if (e.target.closest("[data-kham-pha]")) {
        dong();
        const s = document.getElementById("bat-dau");
        if (s) s.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }
    });
    hop.addEventListener("cancel", () => nho.set(KHOA_CHAO, "1"));
    document.querySelectorAll("[data-mo-chao]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); hop.showModal(); }));

    // Đã chọn trước đó: dải nhắc trong "Bắt đầu từ đây"
    const dai = document.getElementById("cua-ban");
    if (dai && chon && (chon.nghe || D.nganh[chon.ai])) {
      const ten = chon.ai ? D.nganh[chon.ai].ngan : S.nghe(chon.nghe);
      dai.innerHTML = '<span class="cua-ban-text"><b>' + esc(S.cuaBan(ten)) + '</b><span>' + S.cuaBan2 + '</span></span>' +
        '<a class="btn btn-yt" href="' + linkChon(chon) + '">' + S.tiep + '</a><button type="button" class="btn" data-mo-chao-2>' + S.doi + '</button>' +
        '<a class="btn" href="ban-tin.html">' + S.banTin + '</a>';
      dai.hidden = false;
      dai.querySelector("[data-mo-chao-2]").addEventListener("click", () => hop.showModal());
    }
    // Chỉ tự mở ở lần ghé đầu tiên, và không chen ngang khi vào bằng link tới một series (#id) hay đang thử ngày (?hom-nay=)
    // Người tới từ mạng xã hội đã có popup "Vừa xem video?" (app.js, window.mhaiVxMo) thì không mở thêm hộp chào
    if (!nho.get(KHOA_CHAO) && !chon && !location.hash && !location.search) setTimeout(() => { if (!window.mhaiVxMo && !document.querySelector("dialog[open]")) hop.showModal(); }, 700);
  }

  // ===== Trang lộ trình =====
  async function trangLoTrinh() {
    const [D, videosVi, nhanhV, lich, kenh, videosEn, nhanhEn] = await Promise.all([loadD(), load("videos"), load("video-nhanh").catch(() => ({})),
      load("lich-ra-mat").catch(() => ({})), load("kenh").catch(() => ({})), EN ? load("en/videos") : null, EN ? load("en/video-nhanh").catch(() => ({})) : null]);
    // Bản Anh: tên và mô tả video lấy từ data/en/videos.json (bài viết en/bai/ cùng tên file)
    const videos = EN ? videosVi.map(v => Object.assign({}, v, videosEn[v.so] || {})) : videosVi;
    const bySo = {};
    videos.forEach(v => { bySo[v.so] = v; });
    const homNay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    let daXem = new Set();
    try { daXem = new Set(JSON.parse(nho.get(KHOA_XEM) || "[]")); } catch (e) {}

    const oChonEl = document.getElementById("ltn-chon"), kq = document.getElementById("ltn-kq");

    // Một video trong lộ trình: số, tên, link bài viết hoặc ngày ra mắt, ô "Đã xem"
    function dongVideo(so) {
      let ten, link = "", ghi = "";
      if (bySo[so]) {
        const v = bySo[so];
        ten = v.chu_de.replace(/^.*?\((?:Phần|Part) \d+\/\d+\):\s*/, "");
        link = "bai/" + pad(so) + "-" + v.slug + ".html";
        if (lich[so] && lich[so] > homNay) ghi = S.raMat(lich[so]);
      } else if (LAM_THEO[so]) {
        ten = LAM_THEO_TEN[so]; link = LAM_THEO[so]; ghi = S.lamTheo;
      } else if (nhanhV[so]) {
        const n = nhanhV[so];
        ten = ((EN && nhanhEn[so]) || n.ten).replace(/^.*?· (?:Phần|Part) \d+\/\d+:\s*/, "");
        if (n.ngay && n.ngay <= homNay && kenh.youtube) link = kenh.youtube + "/search?query=" + encodeURIComponent(n.ten);
        else ghi = n.ngay ? S.raMat(n.ngay) : S.sapRa;
      } else return "";
      const ngoai = link.startsWith("http");
      const tenHtml = link ? '<a href="' + link + '"' + (ngoai ? ' target="_blank" rel="noopener"' : "") + ">" + esc(ten) + "</a>" : "<span>" + esc(ten) + "</span>";
      return '<li class="ltn-v' + (daXem.has(so) ? " is-xem" : "") + '"><label class="ltn-xem" title="' + S.danhDau + '"><input type="checkbox" data-so="' + so + '"' + (daXem.has(so) ? " checked" : "") +
        '><span class="sr">' + S.daXemSo(so) + "</span></label>" + '<span class="num">#' + pad(so) + '</span><span class="ltn-v-ten">' + tenHtml +
        (ghi ? '<em class="ltn-ghi' + (ghi === S.lamTheo ? " is-lam" : "") + '">' + esc(ghi) + "</em>" : "") + "</span></li>";
    }
    function dsSo(b) {
      if (b.so) return b.so;
      const nh = D.nhanh[b.nhanh];
      const r = [];
      for (let s = nh.tu; s <= nh.den; s++) r.push(s);
      return r;
    }
    function buocHtml(b, i) {
      const nh = b.nhanh && D.nhanh[b.nhanh];
      const tag = nh ? '<span class="ltn-tag" style="--a:' + nh.mau[0] + ";--b:" + nh.mau[1] + (nh.chu ? ";--c:" + nh.chu : "") + '">' + esc(nh.nhan) + "</span>" : "";
      return '<li class="ltn-buoc"><span class="step-num" aria-hidden="true">' + (i + 1) + '</span><div class="ltn-buoc-in"><p class="step-when">' + S.buoc + (i + 1) +
        (nh ? esc(S.series(nh.ten, nh.den - nh.tu + 1)) : "") + '</p><h3>' + tag + esc(b.ten) + '</h3><p class="step-desc">' + esc(b.mo_ta) +
        '</p><ol class="ltn-vs">' + dsSo(b).map(dongVideo).join("") + "</ol></div></li>";
    }
    function veLoTrinh(tieuDe, chao, ghiChu, buoc, nhanhId) {
      const tatCa = [...new Set(buoc.flatMap(dsSo))];
      kq.innerHTML = '<div class="ltn-dau"><img src="' + goc + 'assets/mark-a-ra-the.svg" alt="" width="110" height="104"><div class="ltn-bong"><p class="eyebrow">' + S.choBan + '</p><h2 id="ltn-ten">' + esc(tieuDe) +
        '</h2><p>' + esc(chao) + "</p>" + (ghiChu || "") + '</div></div><div class="ltn-tien"><b id="ltn-dem"></b><div class="bar" aria-hidden="true"><i id="ltn-thanh"></i></div>' +
        '<p class="course-note">' + S.note + '</p></div><ol class="ltn-buocs">' + buoc.map(buocHtml).join("") + "</ol>" +
        (nhanhId ? '<div class="ltn-cc">' + ic("award") + '<p>' + S.ghiCc + '</p><p class="ltn-cc-nut"><a class="btn btn-yt" href="kiem-tra.html?bo=' + nhanhId + '">' + S.ktNganh + '</a><a class="btn" href="chung-nhan.html">' + S.ccNganh + "</a></p></div>" : "") +
        '<div class="ltn-cuoi"><button type="button" class="btn" id="ltn-chia-se">' + ic("copy") + S.chep + '</button><a class="btn" href="#ltn-chon">' + S.khac + '</a></div><p class="ltn-chep" id="ltn-chep" role="status"></p>';
      const dem = () => {
        const n = tatCa.filter(s => daXem.has(s)).length;
        document.getElementById("ltn-dem").textContent = S.dem(n, tatCa.length);
        document.getElementById("ltn-thanh").style.width = (tatCa.length ? 100 * n / tatCa.length : 0) + "%";
      };
      dem();
      kq.onchange = e => {
        const o = e.target.closest("input[data-so]");
        if (!o) return;
        const so = +o.dataset.so;
        o.checked ? daXem.add(so) : daXem.delete(so);
        kq.querySelectorAll('input[data-so="' + so + '"]').forEach(x => { x.checked = o.checked; x.closest(".ltn-v").classList.toggle("is-xem", o.checked); });
        nho.set(KHOA_XEM, JSON.stringify([...daXem]));
        dem();
      };
      document.getElementById("ltn-chia-se").onclick = async () => {
        const url = location.href.split("#")[0];
        const bao = document.getElementById("ltn-chep");
        try { await navigator.clipboard.writeText(url); bao.textContent = S.daChep; }
        catch (e) { bao.textContent = S.chepTay + url; }
      };
      kq.hidden = false;
      // Báo cho ban-tin.js: người xem đã có lộ trình, bản tin tuần hiện sau đó và đẩy video trong lộ trình lên đầu
      window.mhaiLoTrinhSo = tatCa;
      document.dispatchEvent(new CustomEvent("mhai:lo-trinh", { detail: { so: tatCa } }));
    }

    // Ngành hoặc nghề ngách có trang thực hành riêng (khóa "trang" trong data/lo-trinh-nganh.json): thẻ dẫn vào dưới lời chào
    function theTrang(n) {
      if (!n || !n.trang) return "";
      const lg = EN ? "en" : "vi";
      return '<a class="ltn-trang" href="' + n.trang.url + '"><img src="' + goc + 'assets/bit-giai-thich.svg" alt="" width="52" height="52"><span><b>' + esc(n.trang.ten[lg]) + ' ›</b><span>' + esc(n.trang.moi[lg]) + "</span></span></a>";
    }

    function hien(c, cuon) {
      // đếm tương tác (xem theo-doi.js): chỉ gửi mã ngành có sẵn, nghề người xem tự gõ thì không gửi chữ
      if (window.mhaiDo && c && (c.ai || c.nghe)) window.mhaiDo("chon-nganh", { nganh: c.ai && D.nganh[c.ai] ? c.ai : "tu-go" });
      oChonEl.innerHTML = oChon(D, c && c.ai);
      if (c && c.ai && D.nganh[c.ai]) {
        const n = D.nganh[c.ai];
        document.title = S.tieuDe(n.ngan);
        veLoTrinh(n.ten, n.chao, theTrang(n), n.buoc, n.nhanh);
      } else if (c && c.nghe) {
        const t = timNghe(D, c.nghe);
        const sat = [...new Set(t.ngach.flatMap(n => n.so))];
        // Không có nghề ngách khớp: tìm trọn từ trong tên và mô tả video (chỉ để gợi thêm, không gọi là "sát nghề")
        const nhac = sat.length || t.q.length < 4 ? [] : videos.filter(v => (" " + norm(v.chu_de + " " + v.mo_ta) + " ").includes(" " + t.q + " ")).slice(0, 6).map(v => v.so);
        const ganId = t.nganh[0] || (t.ngach[0] && t.ngach[0].gan) || "";
        const gan = D.nganh[ganId];
        const mail = kenh.email ? ' <a href="mailto:' + kenh.email + "?subject=" + encodeURIComponent(S.mailChuDe(c.nghe)) + '">' + S.goiY + '</a>' : "";
        const nen = { ten: S.nen[0], mo_ta: S.nen[1], so: [3, 8, 15] };
        const buoc = [nen];
        if (sat.length) buoc.push({ ten: S.sat[0], mo_ta: S.sat[1](c.nghe), so: sat });
        if (nhac.length) buoc.push({ ten: S.nhac[0](c.nghe), mo_ta: S.nhac[1], so: nhac });
        let chao, ghi;
        if (gan) {
          const daCo = new Set(buoc.flatMap(dsSo));
          gan.buoc.forEach(b => {
            if (b.nhanh || b.so.some(s => !daCo.has(s))) { buoc.push(b.so ? Object.assign({}, b, { so: b.so.filter(s => !daCo.has(s)) }) : b); dsSo(b).forEach(s => daCo.add(s)); }
          });
          chao = sat.length ? S.chaoSat(sat.length, gan.ngan) : S.chaoGan(gan.ngan);
          ghi = '<p class="ltn-ghi-chu">' + S.ghiGan(esc(gan.ngan)) + (sat.length ? "" : esc(S.muon(c.nghe)) + mail) + "</p>";
        } else {
          // Không biết nghề này gần nhóm nào: lộ trình chung, nghề nào cũng dùng được, không đoán bừa
          [[173, 286, 164, 165], [27, 28, 31], [33, 34, 35, 37]].forEach((so, i) => buoc.push({ ten: S.chung[i][0], mo_ta: S.chung[i][1], so }));
          chao = sat.length ? S.chaoChungSat(sat.length) : S.chaoChung(c.nghe);
          ghi = '<p class="ltn-ghi-chu">' + S.muon2 + mail + "</p>";
        }
        // Nghề ngách có trang thực hành riêng (vd. y tế: ai-y-te.html): thêm thẻ dẫn vào ngay dưới lời chào
        t.ngach.filter(n => n.trang).slice(0, 1).forEach(n => { ghi += theTrang(n); });
        document.title = S.tieuDeNghe(c.nghe);
        veLoTrinh(S.ngheCuaBan(c.nghe), chao, ghi, buoc);
      } else {
        kq.hidden = true;
        return;
      }
      if (cuon) kq.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }

    ganChon(oChonEl, D, c => {
      nho.set(KHOA_NGANH, JSON.stringify(c));
      nho.set(KHOA_CHAO, "1");
      history.pushState(null, "", linkChon(c).replace("lo-trinh-nganh.html", ""));
      hien(c, true);
    });
    const tuUrl = () => {
      const p = new URLSearchParams(location.search);
      const ai = p.get("ai"), nghe = (p.get("nghe") || "").slice(0, 60);
      return ai && D.nganh[ai] ? { ai } : nghe ? { nghe } : null;
    };
    window.addEventListener("popstate", () => hien(tuUrl() || docChon(), false));
    const c = tuUrl() || docChon();
    if (tuUrl()) nho.set(KHOA_NGANH, JSON.stringify(c));
    // Vừa chọn ngành ở hộp chào trang chủ (hoặc mở link ?ai= / ?nghe=) thì cuộn thẳng tới lộ trình, khỏi phải lướt qua ô chọn lần nữa
    hien(c, !!tuUrl());
  }

  const trang = document.getElementById("ltn");
  (trang ? trangLoTrinh(trang) : trangChu()).catch(e => console.error("lo-trinh-nganh", e));
})();

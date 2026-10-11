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
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#i-' + n + '"/></svg>';
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9&+]+/g, " ").trim();
  const load = name => fetch("data/" + name + ".json", { cache: "no-cache" }).then(r => r.json());
  const pad = n => String(n).padStart(2, "0");
  const LAM_THEO = { 301: "lam-theo.html#phan-tich-so-ban-hang", 302: "lam-theo.html#du-doan-ban-hang" };
  const LAM_THEO_TEN = { 301: "Phân tích sổ bán hàng với AI từ A đến Z: 9 bước, kèm file mẫu", 302: "Dự đoán ngày mai bán bao nhiêu ly: model machine learning đầu tiên với Python" };

  // Đã chọn gì: {ai: id} hoặc {nghe: "chữ đã gõ"}
  const docChon = () => { try { return JSON.parse(nho.get(KHOA_NGANH) || "null"); } catch (e) { return null; } };
  const linkChon = c => "lo-trinh-nganh.html?" + (c.ai ? "ai=" + encodeURIComponent(c.ai) : "nghe=" + encodeURIComponent(c.nghe));

  // Khớp chữ người xem gõ: từ khóa nghề ngách, từ khóa của ngành có sẵn, rồi tên video
  function timNghe(D, chu) {
    const q = norm(chu);
    const co = k => { const t = norm(k); return t && (q === t || (" " + q + " ").includes(" " + t + " ") || (q.length >= 4 && t.startsWith(q))); };
    const ngach = D.ngach.filter(n => n.tu_khoa.some(co));
    const nganh = Object.keys(D.nganh).filter(id => D.nganh[id].tu_khoa.some(co) || co(D.nganh[id].ngan));
    return { q, ngach, nganh };
  }

  // Ô chọn "Bạn là ai?" dùng chung cho hộp chào ở trang chủ và đầu trang lộ trình
  function oChon(D, dangChon) {
    const nut = id => {
      const n = D.nganh[id], nh = n.nhanh && D.nhanh[n.nhanh];
      const dau = nh ? '<span class="ltn-tag" style="--a:' + nh.mau[0] + ";--b:" + nh.mau[1] + (nh.chu ? ";--c:" + nh.chu : "") + '">' + esc(nh.nhan) + "</span>" : ic(n.icon);
      return '<li><button type="button" class="ltn-nut' + (dangChon === id ? " is-on" : "") + '" data-ai="' + id + '"' + (dangChon === id ? ' aria-pressed="true"' : "") + ">" + dau + "<span>" + esc(n.ngan) + "</span></button></li>";
    };
    return D.nhom.map(g => '<p class="ltn-nhom">' + esc(g.ten) + '</p><ul class="ltn-nuts">' + g.ds.map(nut).join("") + "</ul>").join("") +
      '<form class="ltn-nghe" autocomplete="off"><label for="ltn-o-nghe">Nghề của bạn không có ở trên? Gõ vào đây, ví dụ “tiệm tóc”, “kế toán”, “nuôi tôm”.</label>' +
      '<div class="ltn-nghe-row"><input id="ltn-o-nghe" name="nghe" type="text" maxlength="60" placeholder="Nghề hoặc ngành của bạn" required>' +
      '<button class="btn btn-yt" type="submit">Xem lộ trình ›</button></div></form>';
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
      khiChon(!t.ngach.length && t.nganh.length === 1 ? { ai: t.nganh[0] } : { nghe: chu });
    });
  }

  // ===== Trang chủ: hộp chào lần đầu và dải "Lộ trình của bạn" =====
  async function trangChu() {
    const D = await load("lo-trinh-nganh");
    const chon = docChon();
    const hop = document.createElement("dialog");
    hop.className = "chao-hop";
    hop.setAttribute("aria-labelledby", "chao-ten");
    hop.innerHTML = '<button type="button" class="hop-dong" aria-label="Đóng"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>' +
      '<div class="chao-in"><div class="chao-dau"><img src="assets/mark-chao.svg" alt="" width="96" height="91"><div><p class="eyebrow">Chào bạn, mình là Mark!</p>' +
      '<h2 id="chao-ten">Bạn là ai?</h2><p>Chọn một ô, mình đưa lộ trình và video hợp với bạn. Không cần đăng ký.</p></div></div>' +
      oChon(D, chon && chon.ai) +
      '<button type="button" class="chao-kham-pha" data-kham-pha>Mình chỉ muốn tự khám phá kênh ›</button></div>';
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
      const ten = chon.ai ? D.nganh[chon.ai].ngan : "Nghề “" + chon.nghe + "”";
      dai.innerHTML = '<span class="cua-ban-text"><b>Lộ trình của bạn: ' + esc(ten) + '</b><span>Xem tiếp các bước và video đã đánh dấu.</span></span>' +
        '<a class="btn btn-yt" href="' + linkChon(chon) + '">Xem tiếp ›</a><button type="button" class="btn" data-mo-chao-2>Đổi lựa chọn</button>';
      dai.hidden = false;
      dai.querySelector("[data-mo-chao-2]").addEventListener("click", () => hop.showModal());
    }
    // Chỉ tự mở ở lần ghé đầu tiên, và không chen ngang khi vào bằng link tới một series (#id) hay đang thử ngày (?hom-nay=)
    if (!nho.get(KHOA_CHAO) && !chon && !location.hash && !location.search) setTimeout(() => { if (!document.querySelector("dialog[open]")) hop.showModal(); }, 700);
  }

  // ===== Trang lộ trình =====
  async function trangLoTrinh(goc) {
    const [D, videos, nhanhV, lich, kenh] = await Promise.all([load("lo-trinh-nganh"), load("videos"), load("video-nhanh").catch(() => ({})),
      load("lich-ra-mat").catch(() => ({})), load("kenh").catch(() => ({}))]);
    const bySo = {};
    videos.forEach(v => { bySo[v.so] = v; });
    const homNay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    const ngayVN = d => d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4);
    let daXem = new Set();
    try { daXem = new Set(JSON.parse(nho.get(KHOA_XEM) || "[]")); } catch (e) {}

    const oChonEl = document.getElementById("ltn-chon"), kq = document.getElementById("ltn-kq");

    // Một video trong lộ trình: số, tên, link bài viết hoặc ngày ra mắt, ô "Đã xem"
    function dongVideo(so) {
      let ten, link = "", ghi = "";
      if (bySo[so]) {
        const v = bySo[so];
        ten = v.chu_de.replace(/^.*?\((?:Phần \d+\/\d+)\):\s*/, "");
        link = "bai/" + pad(so) + "-" + v.slug + ".html";
        if (lich[so] && lich[so] > homNay) ghi = "Ra mắt " + ngayVN(lich[so]);
      } else if (LAM_THEO[so]) {
        ten = LAM_THEO_TEN[so]; link = LAM_THEO[so]; ghi = "Bài làm theo";
      } else if (nhanhV[so]) {
        const n = nhanhV[so];
        ten = n.ten.replace(/^.*?· Phần \d+\/\d+:\s*/, "");
        if (n.ngay && n.ngay <= homNay && kenh.youtube) link = kenh.youtube + "/search?query=" + encodeURIComponent(n.ten);
        else ghi = n.ngay ? "Ra mắt " + ngayVN(n.ngay) : "Sắp ra mắt";
      } else return "";
      const ngoai = link.startsWith("http");
      const tenHtml = link ? '<a href="' + link + '"' + (ngoai ? ' target="_blank" rel="noopener"' : "") + ">" + esc(ten) + "</a>" : "<span>" + esc(ten) + "</span>";
      return '<li class="ltn-v' + (daXem.has(so) ? " is-xem" : "") + '"><label class="ltn-xem" title="Đánh dấu đã xem"><input type="checkbox" data-so="' + so + '"' + (daXem.has(so) ? " checked" : "") +
        '><span class="sr">Đã xem video ' + so + "</span></label>" + '<span class="num">#' + pad(so) + '</span><span class="ltn-v-ten">' + tenHtml +
        (ghi ? '<em class="ltn-ghi' + (ghi === "Bài làm theo" ? " is-lam" : "") + '">' + esc(ghi) + "</em>" : "") + "</span></li>";
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
      return '<li class="ltn-buoc"><span class="step-num" aria-hidden="true">' + (i + 1) + '</span><div class="ltn-buoc-in"><p class="step-when">Bước ' + (i + 1) +
        (nh ? " · series " + esc(nh.ten) + ", " + (nh.den - nh.tu + 1) + " phần" : "") + '</p><h3>' + tag + esc(b.ten) + '</h3><p class="step-desc">' + esc(b.mo_ta) +
        '</p><ol class="ltn-vs">' + dsSo(b).map(dongVideo).join("") + "</ol></div></li>";
    }
    function veLoTrinh(tieuDe, chao, ghiChu, buoc) {
      const tatCa = [...new Set(buoc.flatMap(dsSo))];
      kq.innerHTML = '<div class="ltn-dau"><img src="assets/mark-a-ra-the.svg" alt="" width="110" height="104"><div class="ltn-bong"><p class="eyebrow">Lộ trình cho bạn</p><h2 id="ltn-ten">' + esc(tieuDe) +
        '</h2><p>' + esc(chao) + "</p>" + (ghiChu || "") + '</div></div><div class="ltn-tien"><b id="ltn-dem"></b><div class="bar" aria-hidden="true"><i id="ltn-thanh"></i></div>' +
        '<p class="course-note">Bấm ô vuông cạnh mỗi video để đánh dấu đã xem. Tiến độ lưu ngay trên trình duyệt này.</p></div><ol class="ltn-buocs">' + buoc.map(buocHtml).join("") + "</ol>" +
        '<div class="ltn-cuoi"><button type="button" class="btn" id="ltn-chia-se">' + ic("copy") + 'Chép link lộ trình</button><a class="btn" href="#ltn-chon">Chọn ngành khác ›</a></div><p class="ltn-chep" id="ltn-chep" role="status"></p>';
      const dem = () => {
        const n = tatCa.filter(s => daXem.has(s)).length;
        document.getElementById("ltn-dem").textContent = "Đã xem " + n + "/" + tatCa.length + " video";
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
        try { await navigator.clipboard.writeText(url); bao.textContent = "Đã chép link. Dán vào tin nhắn để gửi bạn bè."; }
        catch (e) { bao.textContent = "Chép link này để chia sẻ: " + url; }
      };
      kq.hidden = false;
    }

    function hien(c, cuon) {
      oChonEl.innerHTML = oChon(D, c && c.ai);
      if (c && c.ai && D.nganh[c.ai]) {
        const n = D.nganh[c.ai];
        document.title = "Lộ trình " + n.ngan + " | Mark học AI";
        veLoTrinh(n.ten, n.chao, "", n.buoc);
      } else if (c && c.nghe) {
        const t = timNghe(D, c.nghe);
        const dung = [...new Set(t.ngach.flatMap(n => n.so))];
        // Không có từ khóa nghề ngách: tìm thẳng trong tên và mô tả video
        if (!dung.length && t.q.length >= 3) {
          videos.filter(v => norm(v.chu_de + " " + v.mo_ta).includes(t.q)).slice(0, 6).forEach(v => dung.push(v.so));
        }
        const ganId = (t.ngach[0] && t.ngach[0].gan) || t.nganh[0] || "van-phong";
        const gan = D.nganh[ganId];
        const buoc = [{ ten: "Nền tảng cho mọi nghề", mo_ta: "Prompt 4 mảnh, AI bịa ở đâu, và dữ liệu nào không được dán vào AI.", so: [3, 8, 15] }];
        if (dung.length) buoc.push({ ten: "Video sát nghề của bạn", mo_ta: "Những video kênh làm riêng cho nghề gần với “" + c.nghe + "”.", so: dung });
        const daCo = new Set(buoc.flatMap(dsSo));
        gan.buoc.forEach(b => {
          if (b.nhanh || b.so.some(s => !daCo.has(s))) { buoc.push(b.so ? Object.assign({}, b, { so: b.so.filter(s => !daCo.has(s)) }) : b); dsSo(b).forEach(s => daCo.add(s)); }
        });
        const mail = kenh.email ? ' <a href="mailto:' + kenh.email + "?subject=" + encodeURIComponent("Gợi ý video cho nghề " + c.nghe) + '">Gợi ý chủ đề cho kênh ›</a>' : "";
        const ghi = '<p class="ltn-ghi-chu">' + (dung.length ? "Mình ghép video sát nghề của bạn với lộ trình gần nhất: <b>" + esc(gan.ngan) + "</b>."
          : "Kênh chưa có video riêng cho nghề “" + esc(c.nghe) + "”, nên mình đưa lộ trình gần nhất: <b>" + esc(gan.ngan) + "</b>. Muốn kênh làm video cho nghề này?" + mail) + "</p>";
        document.title = "Lộ trình cho nghề " + c.nghe + " | Mark học AI";
        veLoTrinh("Nghề của bạn: " + c.nghe, dung.length ? "Mình tìm được " + dung.length + " video sát nghề của bạn. Đi theo các bước dưới đây nhé." : "Nghề nào cũng dùng được AI cho giấy tờ, email và lên kế hoạch. Mình bắt đầu từ những việc đó nhé.", ghi, buoc);
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
    hien(c, false);
  }

  const goc = document.getElementById("ltn");
  (goc ? trangLoTrinh(goc) : trangChu()).catch(e => console.error("lo-trinh-nganh", e));
})();

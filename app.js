(async function () {
  // Trang tiếng Anh (en/index.html) dùng chung file này: dữ liệu ở ../data, bản dịch ở ../data/en
  const EN = document.documentElement.lang === "en";
  const goc = EN ? "../" : "";
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-' + n + '"/></svg>';
  const S = EN ? {
    hopTac: "Partnerships or feedback: ", gopY: "Feedback or partnerships: message the channel's Facebook page.",
    homNay: "Today on the channel", moiToanh: "Brand new? Start here", vung: "Area ", xemPhan1: "Watch part 1", xemVideo: "Watch the video",
    buoc: "Step ", batDau: "Start with #", stats: (a, b) => a + " videos · " + b + " series · a new video every day",
    tatCa: "All", sapRa: "Coming soon", le: n => n + (n === 1 ? " standalone video" : " standalone videos"), phan: n => n + " parts",
    raMat: "Out ", xemYt: n => "Watch video #" + n + " on YouTube (in Vietnamese)", docBai: "Read the article ›"
  } : {
    hopTac: "Hợp tác hoặc góp ý: ", gopY: "Góp ý hoặc hợp tác: nhắn tin cho trang Facebook của kênh.",
    homNay: "Hôm nay trên kênh", moiToanh: "Mới toanh? Bắt đầu ở đây", vung: "Vùng ", xemPhan1: "Xem phần 1", xemVideo: "Xem video",
    buoc: "Bước ", batDau: "Bắt đầu với #", stats: (a, b) => a + " video" + " · " + b + " series · video mới mỗi ngày",
    tatCa: "Tất cả", sapRa: "Sắp ra mắt", le: n => n + " video lẻ", phan: n => n + " phần",
    raMat: "Ra mắt ", xemYt: n => "Xem video #" + n + " trên YouTube", docBai: "Đọc bài viết ›"
  };
  async function load(name) {
    if (window.__DATA && window.__DATA[name]) return window.__DATA[name];
    const r = await fetch(goc + "data/" + name + ".json", { cache: "no-cache" });
    return r.json();
  }
  // Lịch ra mắt (số video -> YYYY-MM-DD); thiếu file thì coi như video nào cũng đã ra
  const [kenh, seriesVi, videosVi, banDo, lich, seriesEn, videosEn] = await Promise.all([load("kenh"), load("series"), load("videos"),
    load(EN ? "en/ban-do" : "ban-do"), load("lich-ra-mat").catch(() => ({})),
    EN ? load("en/series") : null, EN ? load("en/videos") : null]);
  // Bản tiếng Anh: thay tên/mô tả bằng bản dịch, giữ tên tiếng Việt (ytTen) để tìm video trên YouTube
  const series = EN ? seriesVi.map(s => Object.assign({}, s, seriesEn[s.id] || {})) : seriesVi;
  const videos = videosVi.map(v => {
    const d = EN && videosEn[v.so];
    return d ? Object.assign({}, v, d, { ytTen: v.chu_de }) : Object.assign({}, v, { ytTen: v.chu_de });
  });
  // Hôm nay theo giờ Việt Nam; ?hom-nay=YYYY-MM-DD để thử
  const homNayQ = new URLSearchParams(location.search).get("hom-nay");
  const homNay = /^\d{4}-\d{2}-\d{2}$/.test(homNayQ || "") ? homNayQ
    : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const chuaRa = so => !!lich[so] && lich[so] > homNay;
  const THANG = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ngayThang = d => EN ? THANG[+d.slice(5, 7) - 1] + " " + (+d.slice(8, 10)) : d.slice(8, 10) + "/" + d.slice(5, 7);

  document.querySelectorAll("[data-kenh]").forEach(a => {
    const url = kenh[a.dataset.kenh];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else a.hidden = true;
  });
  const lienHe = document.getElementById("lien-he");
  if (kenh.email) lienHe.innerHTML = S.hopTac + '<a href="mailto:' + kenh.email + '">' + kenh.email + "</a>";
  else lienHe.textContent = S.gopY;

  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const esc = s => (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const groups = series.map(s => {
    const items = videos.filter(v => v.so >= s.tu && v.so <= s.den).map(v => {
      const m = v.chu_de.match(/^.*?\(((?:Phần|Part) \d+\/\d+)\):\s*(.*)$/);
      const mVi = v.ytTen.match(/^.*?\(Phần \d+\/\d+\):\s*(.*)$/);
      const title = m ? m[2] : v.chu_de;
      const part = m ? m[1] : "";
      const desc = v.mo_ta;
      return { ...v, title, part, desc, ytTitle: mVi ? mVi[1] : v.ytTen, key: norm([v.so, title, v.tieu_de, v.mo_ta, s.ten, s.tags.join(" ")].join(" ")) };
    });
    return { ...s, items };
  }).filter(g => g.items.length);

  const ytLink = v => kenh.youtube + "/search?query=" + encodeURIComponent(v.ytTitle);
  const pad = n => String(n).padStart(2, "0");
  // Mỗi video có một bài viết tĩnh (scripts/tao_bai_viet.py) để Google tìm thấy
  const baiLink = v => "bai/" + pad(v.so) + "-" + v.slug + ".html";
  const bySo = {};
  groups.forEach(g => g.items.forEach(v => { bySo[v.so] = { v, g }; }));

  // Dải "Hôm nay trên kênh": video có ngày ra mắt đúng hôm nay; không có thì ẩn
  const homNayV = Object.values(bySo).filter(x => lich[x.v.so] === homNay).map(x => x.v).sort((a, b) => a.so - b.so);
  const dai = document.getElementById("hom-nay");
  if (dai && homNayV.length) {
    dai.innerHTML = '<p class="today-head">' + S.homNay + ' <span>' + ngayThang(homNay) + '</span></p><ul class="today-list">' +
      homNayV.map(v => '<li><a href="' + baiLink(v) + '"><span class="num">#' + pad(v.so) + "</span>" + esc(v.title) + "</a></li>").join("") + "</ul>";
    dai.hidden = false;
  }

  // "Bắt đầu từ đây": 7 vùng của bản đồ kênh (video 97) và lộ trình 3 bước (video 99)
  const startLink = (so, label) => {
    const hit = bySo[so];
    if (!hit) return "";
    return '<a class="row-link" href="' + baiLink(hit.v) + '">' + label + " ›</a>";
  };
  document.getElementById("vung").innerHTML = banDo.vung.map((r, i) =>
    '<li class="region"><div class="region-top">' + (i === 0 ? '<span class="region-pick">' + S.moiToanh + '</span>' : "") + '<span class="region-emoji">' + ic(r.icon) + '</span><div><span class="region-num">' + S.vung + (i + 1) +
    '</span><h3>' + esc(r.ten) + '</h3></div></div><p class="region-desc">' + esc(r.mo_ta) + '</p><ul class="region-list">' +
    r.muc.map(m => {
      const label = /[–,]/.test(m.nhan) ? S.xemPhan1 : S.xemVideo;
      return '<li><span class="region-item"><b>' + esc(m.ten) + '</b><span class="region-range">' + esc(m.nhan) + "</span></span>" + startLink(m.so, label) + "</li>";
    }).join("") + "</ul></li>").join("");
  document.getElementById("lo-trinh").innerHTML = banDo.lo_trinh.map((b, i) =>
    '<li class="step"><span class="step-num" aria-hidden="true">' + (i + 1) + '</span><div class="step-main"><p class="step-when">' + S.buoc + (i + 1) + " · " + esc(b.tuan) +
    '</p><h4>' + esc(b.ten) + '</h4><p class="step-desc">' + esc(b.mo_ta) + '</p><p class="step-foot"><span class="region-range">' + esc(b.nhan) + "</span>" +
    startLink(b.so, S.batDau + pad(b.so)) + "</p></div></li>").join("");

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const nSeries = groups.filter(g => !g.le).length;
  // Series "Sắp ra mắt": theo ngày ra mắt nếu đủ ngày, không thì theo cờ sap_ra_mat
  const sapRa = g => g.items.every(v => lich[v.so]) ? g.items.every(v => chuaRa(v.so)) : !!g.sap_ra_mat;
  document.getElementById("stats").textContent = S.stats(total, nSeries);

  const chips = document.getElementById("chips");
  let current = "tat-ca";
  try { current = localStorage.getItem("mhai-series") || current; } catch (e) {}
  const chipData = [{ id: "tat-ca", ten: S.tatCa, n: total }].concat(groups.map(g => ({ id: g.id, ten: g.ten, n: g.items.length })));
  if (!chipData.some(c => c.id === current)) current = "tat-ca";
  // Link từ bài viết về series (#id-series): hiện đúng series đó
  const hashId = decodeURIComponent(location.hash.slice(1));
  const tuHash = groups.some(g => g.id === hashId);
  if (tuHash) current = "tat-ca";
  chips.innerHTML = chipData.map(c => '<button class="chip" role="tab" id="chip-' + c.id + '" data-id="' + c.id + '">' + esc(c.ten) + "<small>" + c.n + "</small></button>").join("");
  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    current = b.dataset.id;
    try { localStorage.setItem("mhai-series", current); } catch (e) {}
    render();
  });

  const box = document.getElementById("danh-sach");
  const input = document.getElementById("tim");
  input.addEventListener("input", render);

  function render() {
    chips.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-selected", b.dataset.id === current));
    const q = norm(input.value.trim());
    let shown = 0;
    box.innerHTML = groups.filter(g => current === "tat-ca" || g.id === current).map(g => {
      const items = g.items.filter(v => !q || q.split(/\s+/).every(w => v.key.includes(w)));
      if (!items.length) return "";
      shown += items.length;
      const range = "#" + String(g.items[0].so).padStart(2, "0") + "–" + String(g.items[g.items.length - 1].so).padStart(2, "0");
      const head = '<div class="series-head"><h3>' + esc(g.ten) + (sapRa(g) ? '<span class="soon">' + S.sapRa + '</span>' : "") +
        '</h3><span class="series-range">' + (g.le ? S.le(g.items.length) : S.phan(g.items.length)) + " · " + range + "</span>" +
        '<p class="series-desc">' + esc(g.mo_ta) + '</p><div class="tags">' + g.tags.map(t => "<span>" + esc(t) + "</span>").join("") + "</div></div>";
      const rows = items.map(v => {
        const link = chuaRa(v.so)
          ? '<span class="row-soon">' + S.raMat + ngayThang(lich[v.so]) + "</span>"
          : !lich[v.so] && g.sap_ra_mat
          ? '<span class="row-soon">' + S.sapRa + '</span>'
          : '<a class="row-link" target="_blank" rel="noopener" href="' + ytLink(v) + '" aria-label="' + S.xemYt(pad(v.so)) + '">' + ic("play") + "YouTube</a>";
        return '<li class="row"><span class="num">#' + pad(v.so) + '</span><div class="row-main"><p class="row-title">' +
          (v.part ? '<span class="row-part">' + v.part + "</span>" : "") + '<a href="' + baiLink(v) + '">' + esc(v.title) + '</a></p><p class="row-desc">' + esc(v.desc) +
          '</p><a class="row-read" href="' + baiLink(v) + '">' + S.docBai + '</a></div>' + link + "</li>";
      }).join("");
      return '<section class="series" id="' + g.id + '">' + head + '<ol class="list">' + rows + "</ol></section>";
    }).join("");
    document.getElementById("rong").hidden = shown > 0;
  }
  render();
  if (tuHash) {
    const el = document.getElementById(hashId);
    if (el) el.scrollIntoView();
  }

  const lenDau = document.getElementById("len-dau");
  const capNhatNut = () => { lenDau.hidden = window.scrollY < 600; };
  window.addEventListener("scroll", capNhatNut, { passive: true });
  capNhatNut();
  lenDau.addEventListener("click", e => {
    e.preventDefault();
    const giam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: giam ? "instant" : "smooth" });
    document.querySelector(".brand").focus({ preventScroll: true });
  });
})();

(async function () {
  // Trang tiếng Anh (en/index.html) dùng chung file này: dữ liệu ở ../data, bản dịch ở ../data/en
  const EN = document.documentElement.lang === "en";
  const goc = EN ? "../" : "";
  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-' + n + '"/></svg>';
  const S = EN ? {
    hopTac: "Partnerships, sponsorships or feedback? Email us:", mediaKit: "Media kit ›", gopY: "Feedback or partnerships: message the channel's Facebook page.",
    homNay: "Today on the channel", moiToanh: "Brand new? Start here", vung: "Area ", xemPhan1: "Watch part 1", xemVideo: "Watch the video",
    buoc: "Step ", batDau: "Start with #", stats: (a, b) => a + " videos · " + b + " series · a new video every day",
    soTheoDoi: "followers", soLuotXem: "views", soVideo: "videos", soSeries: "series", soNgay: (d, n) => "Channel figures on " + d + " across " + n + " platforms · ", soKit: "Media kit ›",
    tatCa: "All", locThe: "Filter by tag", locSeries: "Filter by series", sapRa: "Coming soon", le: n => n + (n === 1 ? " standalone video" : " standalone videos"), phan: n => n + " parts",
    raMat: "Out ", goiY: "Tap a series to see its videos.", dong: "Close", xemYt: n => "Watch video #" + n + " on YouTube (in Vietnamese)", docBai: "Read the article ›",
    hot: "Popular", noiBat: "Featured", moi: "New", choi: "Interactive", xemThem: n => "Show more series (" + n + " left)",
    hoiBit: q => "Ask Bit: “" + q + "”, Bit answers with the exact part of a video ›",
    soKq: n => n === 1 ? "1 video matches, listed below ↓" : n + " videos match, listed below ↓", kq0: "No video matches. Try a shorter word or ask Bit above.",
    vxTieuDe: "Just watched a Mark video?", vxDan: "Type the number shown on the video to open its 1-minute lesson.", vxO: "Video number",
    vxMo: "Open lesson", vxKhong: n => "Video #" + n + " has no lesson here yet. Try the quick quiz below.",
    vxBai: n => "Lesson for video #" + n, vxDoc: "Read the 1-minute lesson ›", vxQuiz: "10-question quiz (2 min)", vxGame: "Play the AI game", vxDong: "Hide"
  } : {
    hopTac: "Hợp tác, tài trợ hoặc góp ý? Gửi email cho kênh:", mediaKit: "Thông tin hợp tác ›", gopY: "Góp ý hoặc hợp tác: nhắn tin cho trang Facebook của kênh.",
    homNay: "Hôm nay trên kênh", moiToanh: "Mới toanh? Bắt đầu ở đây", vung: "Vùng ", xemPhan1: "Xem phần 1", xemVideo: "Xem video",
    buoc: "Bước ", batDau: "Bắt đầu với #", stats: (a, b) => a + " video" + " · " + b + " series · video mới mỗi ngày",
    soTheoDoi: "người theo dõi", soLuotXem: "lượt xem", soVideo: "video", soSeries: "series", soNgay: (d, n) => "Số liệu kênh ngày " + d + " trên " + n + " nền tảng · ", soKit: "Xem media kit ›",
    tatCa: "Tất cả", locThe: "Lọc theo thẻ", locSeries: "Lọc theo series", sapRa: "Sắp ra mắt", le: n => n + " video lẻ", phan: n => n + " phần",
    raMat: "Ra mắt ", goiY: "Bấm vào một series để xem danh sách video.", dong: "Đóng", xemYt: n => "Xem video #" + n + " trên YouTube", docBai: "Đọc bài viết ›",
    hot: "Xem nhiều", noiBat: "Nổi bật", moi: "Mới", choi: "Tương tác", xemThem: n => "Xem thêm series (còn " + n + ")",
    hoiBit: q => "Hỏi Bit: “" + q + "”, Bit trả lời bằng đúng đoạn trong video ›",
    soKq: n => n + " video khớp, xem ngay bên dưới ↓", kq0: "Chưa có video nào khớp. Thử từ ngắn hơn hoặc hỏi Bit ở trên.",
    vxTieuDe: "Vừa xem video của Mark?", vxDan: "Gõ số in trên video để mở bài học 1 phút của video đó.", vxO: "Số video",
    vxMo: "Mở bài", vxKhong: n => "Video #" + n + " chưa có bài trên trang. Thử bài kiểm tra nhanh bên dưới nhé.",
    vxBai: n => "Bài của video #" + n, vxDoc: "Đọc bài 1 phút ›", vxQuiz: "Kiểm tra 10 câu (2 phút)", vxGame: "Chơi game học AI", vxDong: "Ẩn"
  };
  async function load(name) {
    if (window.__DATA && window.__DATA[name]) return window.__DATA[name];
    const r = await fetch(goc + "data/" + name + ".json", { cache: "no-cache" });
    return r.json();
  }
  // Lịch ra mắt (số video -> YYYY-MM-DD); thiếu file thì coi như video nào cũng đã ra
  // anh.json: ảnh bìa của video mới (scripts/tao_anh.py); video không có ảnh giữ thẻ chữ như cũ
  // series-bia.json: ảnh bìa từng series (scripts/tao_anh.py) cho đầu series và nút chọn series
  // noi-bat.json: pho_bien = video được xem nhiều nhất (scripts/gom_video.py tính từ sổ cái), noi_bat = video Sang chọn tay
  // nhom-series.json: nhóm lớn cho hàng chọn chủ đề (Sang 15/10: 59 series xếp một hàng cuộn ngang quá dài)
  const [kenh, seriesVi, videosVi, banDo, lich, seriesEn, videosEn, anh, biaSeries, noiBat, nhomData, soLieu, tuongTac] = await Promise.all([load("kenh"), load("series"), load("videos"),
    load(EN ? "en/ban-do" : "ban-do"), load("lich-ra-mat").catch(() => ({})),
    EN ? load("en/series") : null, EN ? load("en/videos") : null, load("anh").catch(() => ({})), load("series-bia").catch(() => ({})),
    load("noi-bat").catch(() => ({})), load("nhom-series").catch(() => ({ nhom: [] })), load("so-lieu-kenh").catch(() => null), load("tuong-tac").catch(() => ({ video: [] }))]);
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
  // Nhãn gây chú ý: Xem nhiều (pho_bien), Nổi bật (noi_bat), Mới (ra mắt trong 7 ngày gần nhất)
  const truoc7 = new Date(Date.parse(homNay) - 6 * 864e5).toISOString().slice(0, 10);
  const hot = new Set(noiBat.pho_bien || []), chon = new Set(noiBat.noi_bat || []);
  // tuong-tac.json (tao_bai_viet.py): video có trò chơi trên web, nhãn "Tương tác" giống bên Vũ Trụ Khác
  const choi = new Set((tuongTac.video || []).map(String));
  const moi = so => !!lich[so] && lich[so] <= homNay && lich[so] >= truoc7;
  const nhanHtml = (dsSo, the) => {
    const co = f => dsSo.some(f);
    return (co(so => chon.has(so)) ? '<span class="hh hh-chon">' + ic("star") + S.noiBat + "</span>" : "") +
      (co(so => hot.has(so)) ? '<span class="hh hh-hot">' + ic("flame") + S.hot + "</span>" : "") +
      (co(moi) ? '<span class="hh hh-moi">' + S.moi + "</span>" : "") +
      (co(so => choi.has(String(so))) ? '<span class="hh hh-choi">' + ic("gamepad") + S.choi + "</span>" : "");
  };
  // Thẻ của một series (để xếp series có thẻ lên đầu và lọc theo thẻ): Mới > Xem nhiều > Tương tác > Nổi bật
  const LOAI_THE = [["moi", () => S.moi, ""], ["hot", () => S.hot, "flame"], ["choi", () => S.choi, "gamepad"], ["chon", () => S.noiBat, "star"]];
  const theCua = g => {
    const ds = g.items.map(v => v.so), co = f => ds.some(f);
    return { moi: co(moi), hot: co(so => hot.has(so)), choi: co(so => choi.has(String(so))), chon: co(so => chon.has(so)) };
  };
  const diemThe = g => { const c = theCua(g); return (c.moi ? 8 : 0) + (c.hot ? 4 : 0) + (c.choi ? 2 : 0) + (c.chon ? 1 : 0); };
  const xepThe = ds => ds.map((g, i) => [g, diemThe(g), i]).sort((a, b) => (b[1] > 0) - (a[1] > 0) || b[1] - a[1] || a[2] - b[2]).map(x => x[0]);
  const THANG = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ngayThang = d => EN ? THANG[+d.slice(5, 7) - 1] + " " + (+d.slice(8, 10)) : d.slice(8, 10) + "/" + d.slice(5, 7);

  document.querySelectorAll("[data-kenh]").forEach(a => {
    const url = kenh[a.dataset.kenh];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else a.hidden = true;
  });
  const lienHe = document.getElementById("lien-he");
  if (kenh.email) lienHe.innerHTML = '<b>' + S.hopTac + '</b><a class="btn btn-mail" href="mailto:' + kenh.email + '">' + ic("mail") + kenh.email + '</a><a class="btn" href="hop-tac.html">' + S.mediaKit + "</a>";
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

  // Khối "Vừa xem video?": người tới từ mạng xã hội (hoặc link có utm_source / ?v=số) thấy ngay lối vào bài học,
  // thay vì rơi vào trang chủ chung chung. Link trong bình luận đầu: markhocai.com/?v=64 mở thẳng bài của video #64.
  const thamSo = new URLSearchParams(location.search);
  const vSo = parseInt(thamSo.get("v"), 10);
  const coBai = so => !!bySo[so];
  const tuMxh = /(^|\.)(facebook|fb|tiktok|instagram|youtube|threads|messenger|zalo)\.(com|net|me|gg)$/i;
  let refHost = "";
  try { refHost = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
  const nguon = thamSo.get("utm_source") || (tuMxh.test(refHost) ? refHost.replace(/^(www|m|l|lm)\./, "").split(".")[0] : "");
  if (coBai(vSo)) {
    if (window.mhaiDo) window.mhaiDo("vua-xem-video", { hanh_dong: "link-so", so: String(vSo), nguon: nguon || "khac" });
    location.replace(baiLink(bySo[vSo].v) + location.search.replace(/[?&]v=\d+/, "").replace(/^&/, "?"));
    return;
  }
  const vx = document.getElementById("vua-xem");
  let anVx = false;
  try { anVx = sessionStorage.getItem("mhai-an-vua-xem") === "1"; } catch (e) {}
  if (vx && !anVx && (nguon || vSo)) {
    vx.innerHTML = '<div class="vx-dau"><img src="' + goc + 'assets/mark-thac-mac.svg" alt="" width="64" height="60"><div><p class="vx-tieu-de">' + S.vxTieuDe +
      '</p><p class="vx-dan">' + S.vxDan + '</p></div><button class="vx-dong" type="button" aria-label="' + S.vxDong + '">×</button></div>' +
      '<form class="vx-tim"><label class="sr" for="vx-so">' + S.vxO + '</label><span class="vx-thang" aria-hidden="true">#</span>' +
      '<input id="vx-so" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="64" autocomplete="off"' + (vSo ? ' value="' + vSo + '"' : "") + '>' +
      '<button class="btn btn-yt" type="submit">' + S.vxMo + '</button></form><p class="vx-bao" role="status"></p>' +
      '<p class="vx-them"><a class="btn" href="kiem-tra.html" data-vx="kiem-tra">' + S.vxQuiz + '</a><a class="btn" href="phieu-luu.html" data-vx="game">' + S.vxGame + "</a></p>";
    vx.hidden = false;
    const bao = vx.querySelector(".vx-bao");
    const moSo = so => {
      if (coBai(so)) {
        if (window.mhaiDo) window.mhaiDo("vua-xem-video", { hanh_dong: "go-so", so: String(so), nguon: nguon || "khac" });
        location.href = baiLink(bySo[so].v);
      } else bao.textContent = S.vxKhong(so);
    };
    if (vSo) bao.textContent = S.vxKhong(vSo);
    vx.querySelector(".vx-tim").addEventListener("submit", e => {
      e.preventDefault();
      const so = parseInt(vx.querySelector("#vx-so").value, 10);
      if (so) moSo(so);
    });
    vx.addEventListener("click", e => {
      const l = e.target.closest("[data-vx]");
      if (l && window.mhaiDo) window.mhaiDo("vua-xem-video", { hanh_dong: l.dataset.vx, nguon: nguon || "khac" });
      if (e.target.closest(".vx-dong")) {
        vx.hidden = true;
        try { sessionStorage.setItem("mhai-an-vua-xem", "1"); } catch (e) {}
      }
    });
  }

  // Dải "Hôm nay trên kênh": video có ngày ra mắt đúng hôm nay; không có thì ẩn
  const homNayV = Object.values(bySo).filter(x => lich[x.v.so] === homNay).map(x => x.v).sort((a, b) => a.so - b.so);
  const dai = document.getElementById("hom-nay");
  if (dai && homNayV.length) {
    dai.innerHTML = '<p class="today-head">' + S.homNay + ' <span>' + ngayThang(homNay) + '</span></p><ul class="today-list">' +
      homNayV.map(v => '<li><a href="' + baiLink(v) + '"><span class="num">#' + pad(v.so) + "</span>" + esc(v.title) + "</a></li>").join("") + "</ul>";
    dai.hidden = false;
  }

  // Sang 15/10 chọn "Gọn hết": 7 vùng là một hàng thẻ ảnh bìa cuộn ngang (ảnh bìa series đầu của vùng), mỗi series là một nút nhỏ.
  // Lộ trình 3 bước (banDo.lo_trinh) không vẽ nữa: trang chủ chỉ còn hai thẻ Lộ trình 7 ngày và Lộ trình theo ngành.
  // Ảnh bìa mỗi vùng: series đầu tiên có ảnh bìa mà vùng trước chưa dùng (vùng 1 và 2 cùng mở đầu bằng "Khái niệm nền tảng")
  const biaDaDung = new Set();
  const biaVung = r => {
    const ds = r.muc.map(m => bySo[m.so]).filter(hit => hit && biaSeries[hit.g.id] && biaSeries[hit.g.id].bia);
    const hit = ds.find(h => !biaDaDung.has(h.g.id)) || ds[0];
    if (!hit) return null;
    biaDaDung.add(hit.g.id);
    return { anh: goc + biaSeries[hit.g.id].bia, v: hit.v };
  };
  document.getElementById("vung").innerHTML = banDo.vung.map((r, i) => {
    const bia = biaVung(r);
    return '<li class="region">' + (bia ? '<a class="rg-bia" href="' + baiLink(bia.v) + '" tabindex="-1" aria-hidden="true"><img src="' + bia.anh + '" alt="" width="480" height="270" loading="lazy" decoding="async"></a>' : "") +
      '<div class="region-top">' + (i === 0 ? '<span class="region-pick">' + S.moiToanh + '</span>' : "") + '<span class="region-emoji">' + ic(r.icon) + '</span><div><span class="region-num">' + S.vung + (i + 1) +
      '</span><h3>' + esc(r.ten) + '</h3></div></div><p class="region-desc">' + esc(r.mo_ta) + '</p><ul class="rg-mon">' +
      r.muc.map(m => {
        const hit = bySo[m.so];
        const nhan = '<b>' + esc(m.ten) + '</b><span class="region-range">' + esc(m.nhan) + "</span>";
        return "<li>" + (hit ? '<a href="' + baiLink(hit.v) + '">' + nhan + " ›</a>" : "<span>" + nhan + "</span>") + "</li>";
      }).join("") + "</ul></li>";
  }).join("");

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const nSeries = groups.filter(g => !g.le).length;
  // Series "Sắp ra mắt": theo ngày ra mắt nếu đủ ngày, không thì theo cờ sap_ra_mat
  const sapRa = g => g.items.every(v => lich[v.so]) ? g.items.every(v => chuaRa(v.so)) : !!g.sap_ra_mat;
  // Số liệu kênh thật (data/so-lieu-kenh.json, cập nhật từ Metricool) thành các ô số; thiếu file thì chỉ còn số video và series
  // Làm tròn xuống giống tron() trong scripts/tao_bai_viet.py để trang chủ và trang Hợp tác ghi cùng một số
  const soGon = n => n >= 10000 ? Math.floor(n / 1000) + "K+" : n >= 1000 ? (Math.floor(n / 100) / 10 + "K+").replace(".", EN ? "." : ",")
    : (n >= 100 ? Math.floor(n / 50) * 50 : n) + "+";
  const oSo = [];
  if (soLieu && soLieu.nguoi_theo_doi) oSo.push([soGon(soLieu.nguoi_theo_doi), S.soTheoDoi, "users"], [soGon(soLieu.luot_xem), S.soLuotXem, "flame"]);
  oSo.push([total + "", S.soVideo, "clapperboard"], [nSeries + "", S.soSeries, "book-open"]);
  const elSo = document.getElementById("stats");
  elSo.innerHTML = oSo.map(o => '<li><span class="hs-ic">' + ic(o[2]) + '</span><b>' + o[0] + '</b><span>' + o[1] + '</span></li>').join("");
  if (soLieu && soLieu.cap_nhat) {
    const [y, m, d] = soLieu.cap_nhat.split("-").map(Number);
    const ghi = document.createElement("p");
    ghi.className = "hero-so-ghi";
    ghi.innerHTML = esc(S.soNgay(EN ? d + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] + " " + y : d + "/" + m + "/" + y, soLieu.so_nen_tang || 5)) + '<a href="hop-tac.html">' + S.soKit + "</a>";
    elSo.after(ghi);
  }

  // Hàng chọn chủ đề hai tầng: "Tất cả" + vài nhóm lớn (có icon), bấm nhóm thì hiện lưới ảnh bìa các series trong nhóm
  // và một hàng series nhỏ xuống dòng (không cuộn ngang) để lọc riêng một series. current = "tat-ca" | "nhom-<id>" | id series.
  const chips = document.getElementById("chips");
  const chipsCon = document.createElement("div");
  chipsCon.className = "chips chips-con";
  chipsCon.setAttribute("role", "tablist");
  chipsCon.setAttribute("aria-label", S.locSeries);
  chipsCon.hidden = true;
  chips.after(chipsCon);
  let current = "tat-ca";
  try { current = localStorage.getItem("mhai-series") || current; } catch (e) {}
  const byId = {};
  groups.forEach(g => { byId[g.id] = g; });
  const nhomDs = (nhomData.nhom || []).map(n => ({ id: "nhom-" + n.id, icon: n.icon, ten: EN ? n.en || n.ten : n.ten, ds: n.series.filter(id => byId[id]) }));
  const nhomCua = {};
  nhomDs.forEach(n => n.ds.forEach(id => { nhomCua[id] = n; }));
  // Series mới chưa được xếp nhóm: cho vào nhóm đầu để không bị mất
  if (nhomDs.length) groups.forEach(g => { if (!nhomCua[g.id]) { nhomDs[0].ds.push(g.id); nhomCua[g.id] = nhomDs[0]; } });
  const byNhom = {};
  nhomDs.forEach(n => { byNhom[n.id] = n; });
  if (current !== "tat-ca" && !byId[current] && !byNhom[current]) current = "tat-ca";
  const hashSeries = () => { let id = ""; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {} return byId[id] ? id : ""; };
  // Link từ bài viết về series (#id-series): về lưới "Tất cả" và mở đúng series đó
  if (hashSeries()) current = "tat-ca";
  const biaNho = id => biaSeries[id] ? '<img class="chip-bia" src="' + goc + biaSeries[id].nho + '" alt="" width="96" height="54" loading="lazy" decoding="async">' : "";
  const demVideo = ids => ids.reduce((n, id) => n + byId[id].items.length, 0);
  chips.innerHTML = '<button class="chip" role="tab" id="chip-tat-ca" data-id="tat-ca">' + esc(S.tatCa) + "<small>" + total + "</small></button>" +
    nhomDs.map(n => '<button class="chip chip-nhom" role="tab" id="chip-' + n.id + '" data-id="' + n.id + '">' + ic(n.icon) + esc(n.ten) + "<small>" + demVideo(n.ds) + "</small></button>").join("");
  const nhomDangMo = () => byNhom[current] || nhomCua[current] || null;
  function veChipsCon() {
    const n = nhomDangMo();
    chipsCon.hidden = !n;
    if (!n) { chipsCon.innerHTML = ""; return; }
    chipsCon.innerHTML = n.ds.map(id => { const g = byId[id]; return '<button class="chip' + (biaSeries[id] ? " co-bia" : "") + '" role="tab" id="chip-' + id + '" data-id="' + id + '">' + biaNho(id) + esc(g.ten) + "<small>" + g.items.length + "</small></button>"; }).join("");
  }
  const chonChip = e => {
    const b = e.target.closest(".chip"); if (!b) return;
    // Bấm lại series đang chọn thì quay về cả nhóm
    current = b.dataset.id === current && nhomCua[current] ? nhomCua[current].id : b.dataset.id;
    try { localStorage.setItem("mhai-series", current); } catch (e) {}
    render();
  };
  chips.addEventListener("click", chonChip);
  chipsCon.addEventListener("click", chonChip);

  const box = document.getElementById("danh-sach");
  const input = document.getElementById("tim");
  input.addEventListener("input", render);
  // Ô tìm ở trang 404 gửi tới /?q=...: điền sẵn từ khóa và cuộn tới danh sách video
  const qTim = (new URLSearchParams(location.search).get("q") || "").trim().slice(0, 80);
  if (qTim) {
    input.value = qTim;
    requestAnimationFrame(() => { render(); const dm = document.getElementById("video"); if (dm) dm.scrollIntoView(); });
  }

  const range = g => {
    const a = g.items[0].so, b = g.items[g.items.length - 1].so;
    return "#" + pad(a) + (b > a ? "–" + pad(b) : "");
  };
  const demPhan = g => (g.le ? S.le(g.items.length) : S.phan(g.items.length)) + " · " + range(g);
  const rowHtml = (g, v) => {
    const link = chuaRa(v.so)
      ? '<span class="row-soon">' + S.raMat + ngayThang(lich[v.so]) + "</span>"
      : !lich[v.so] && g.sap_ra_mat
      ? '<span class="row-soon">' + S.sapRa + '</span>'
      : '<a class="row-link" target="_blank" rel="noopener" href="' + ytLink(v) + '" aria-label="' + S.xemYt(pad(v.so)) + '">' + ic("play") + "YouTube</a>";
    const a = anh[v.so];
    const hinh = a && a.the ? '<a class="row-thumb" href="' + baiLink(v) + '" tabindex="-1"><img src="' + goc + a.the + '" alt="' + esc(v.title) +
      '" width="640" height="360" loading="lazy" decoding="async"></a>' : "";
    return '<li class="row' + (hinh ? " co-anh" : "") + '"><span class="num">#' + pad(v.so) + "</span>" + hinh + '<div class="row-main"><p class="row-title">' +
      (v.part ? '<span class="row-part">' + v.part + "</span>" : "") + '<a href="' + baiLink(v) + '">' + esc(v.title) + '</a>' + nhanHtml([v.so]) + '</p><p class="row-desc">' + esc(v.desc) +
      '</p><a class="row-read" href="' + baiLink(v) + '">' + S.docBai + '</a></div>' + link + "</li>";
  };
  // Một series dạng danh sách: đầu thẻ (ảnh bìa, tên, mô tả, thẻ) + các video. Dùng cho kết quả tìm/lọc và hộp mở series
  const khoi = (g, items, tag, hId) => {
    const bia = biaSeries[g.id];
    const head = '<div class="series-head' + (bia ? " co-bia" : "") + '">' + (bia ? '<img class="series-bia" src="' + goc + bia.bia + '" alt="" width="480" height="270" loading="lazy" decoding="async">' : "") +
      "<" + tag + (hId ? ' id="' + hId + '"' : "") + ">" + esc(g.ten) + (sapRa(g) ? '<span class="soon">' + S.sapRa + '</span>' : "") +
      "</" + tag + '><span class="series-range">' + demPhan(g) + "</span>" +
      '<p class="series-desc">' + esc(g.mo_ta) + '</p><div class="tags">' + g.tags.map(t => "<span>" + esc(t) + "</span>").join("") + "</div></div>";
    return head + '<ol class="list">' + items.map(v => rowHtml(g, v)).join("") + "</ol>";
  };
  // Xem "Tất cả" (không tìm): lưới ảnh bìa, mỗi thẻ là link #id-series mở hộp danh sách video của series đó
  const theHtml = g => {
    const bia = biaSeries[g.id], nhan = nhanHtml(g.items.map(v => v.so));
    return '<li><a class="series-card" id="the-' + g.id + '" href="#' + g.id + '"><span class="sc-cover">' + (nhan ? '<span class="sc-hh">' + nhan + "</span>" : "") +
      (bia ? '<img src="' + goc + bia.bia + '" alt="" width="480" height="270" loading="lazy" decoding="async">' : "") +
      '</span><span class="sc-body"><span class="sc-title">' + esc(g.ten) + '</span><span class="sc-foot"><span class="sc-meta">' + demPhan(g) + "</span>" +
      (sapRa(g) ? '<span class="soon">' + S.sapRa + "</span>" : "") + "</span></span></a></li>";
  };

  let soThe = 0;
  // Hàng lọc theo thẻ trên lưới series: chỉ hiện thẻ đang có ít nhất một series; bấm lại thẻ đang chọn để bỏ lọc
  let locThe = "";
  const locTheo = ds => xepThe(locThe ? ds.filter(g => theCua(g)[locThe]) : ds);
  const thanhLoc = ds => {
    const dem = {};
    ds.forEach(g => { const c = theCua(g); LOAI_THE.forEach(([k]) => { if (c[k]) dem[k] = (dem[k] || 0) + 1; }); });
    if (locThe && !dem[locThe]) locThe = "";
    const nut = LOAI_THE.filter(([k]) => dem[k]);
    if (!nut.length) return "";
    return '<div class="loc-the" role="group" aria-label="' + S.locThe + '"><button type="button" class="lt-nut" data-the="" aria-pressed="' + !locThe + '">' + esc(S.tatCa) + "</button>" +
      nut.map(([k, ten, icon]) => '<button type="button" class="lt-nut lt-' + k + '" data-the="' + k + '" aria-pressed="' + (locThe === k) + '">' + (icon ? ic(icon) : "") + ten() + "<small>" + dem[k] + "</small></button>").join("") + "</div>";
  };
  const ganLoc = () => box.querySelectorAll(".lt-nut").forEach(b => b.addEventListener("click", () => {
    locThe = b.dataset.the === locThe ? "" : b.dataset.the;
    render();
    const moi = box.querySelector('.lt-nut[data-the="' + locThe + '"]');
    if (moi) moi.focus({ preventScroll: true });
  }));
  // Có chữ trong ô tìm thì hiện lối tắt sang Hỏi Bit (hoi-bit.html): hỏi cả câu, khỏi đoán từ khóa
  const hoiBit = document.getElementById("hb-goi");
  // Đang tìm thì báo ngay dưới ô tìm có bao nhiêu video khớp và ẩn dải "Hôm nay": trên điện thoại kết quả nằm dưới hàng nhóm, người xem tưởng ô tìm không chạy
  const soKq = document.createElement("p");
  soKq.className = "so-kq";
  soKq.setAttribute("role", "status");
  soKq.hidden = true;
  (hoiBit || input.closest(".catalog-head")).after(soKq);
  function render() {
    veChipsCon();
    const nh = nhomDangMo();
    chips.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-selected", b.dataset.id === current || (!!nh && b.dataset.id === nh.id)));
    chipsCon.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-selected", b.dataset.id === current));
    const q = norm(input.value.trim());
    if (dai) dai.classList.toggle("an-khi-tim", !!q);
    if (!q) soKq.hidden = true;
    if (hoiBit) {
      hoiBit.hidden = !q;
      if (q) { hoiBit.href = "hoi-bit.html?q=" + encodeURIComponent(input.value.trim()); hoiBit.textContent = S.hoiBit(input.value.trim()); }
    }
    if (!q && current === "tat-ca") {
      // Lưới hiện trước 3 hàng thẻ, nút "Xem thêm" mở tiếp từng 3 hàng (3 cột trên máy tính, 2 cột trên điện thoại)
      const hang = matchMedia("(max-width: 760px)").matches ? 2 : 3;
      if (!soThe) soThe = hang * 3;
      const ds = locTheo(groups), het = locThe ? ds.length : soThe;
      const con = ds.length - het;
      box.innerHTML = '<p class="grid-note">' + S.goiY + '</p>' + thanhLoc(groups) + '<ul class="series-grid">' + ds.slice(0, het).map(theHtml).join("") + "</ul>" +
        (con > 0 ? '<button type="button" class="btn xem-them">' + S.xemThem(con) + "</button>" : "");
      ganLoc();
      const nut = box.querySelector(".xem-them");
      if (nut) nut.addEventListener("click", () => {
        const dau = soThe;
        soThe += hang * 3;
        render();
        // Đưa tiêu điểm tới thẻ mới đầu tiên để người dùng bàn phím đi tiếp được
        const the = box.querySelectorAll(".series-card")[dau];
        if (the) the.focus({ preventScroll: true });
      });
      document.getElementById("rong").hidden = true;
      return;
    }
    // Chọn một nhóm (không tìm): lưới ảnh bìa đủ các series của nhóm
    if (!q && byNhom[current]) {
      const tat = byNhom[current].ds.map(id => byId[id]);
      box.innerHTML = thanhLoc(tat) + '<ul class="series-grid">' + locTheo(tat).map(theHtml).join("") + "</ul>";
      ganLoc();
      document.getElementById("rong").hidden = true;
      return;
    }
    let shown = 0;
    const trongNhom = byNhom[current] ? new Set(byNhom[current].ds) : null;
    box.innerHTML = groups.filter(g => current === "tat-ca" || g.id === current || (trongNhom && trongNhom.has(g.id))).map(g => {
      const items = g.items.filter(v => !q || q.split(/\s+/).every(w => v.key.includes(w)));
      if (!items.length) return "";
      shown += items.length;
      return '<section class="series" data-id="' + g.id + '">' + khoi(g, items, "h3") + "</section>";
    }).join("");
    document.getElementById("rong").hidden = shown > 0;
    soKq.hidden = !q;
    soKq.textContent = q ? (shown ? S.soKq(shown) : S.kq0) : "";
    soKq.classList.toggle("kq-rong", !!q && !shown);
  }
  render();

  // Hộp danh sách video của một series (<dialog>): mở theo #id-series nên chia sẻ được link; Esc, nút Đóng, bấm ra ngoài hoặc nút Back đều đóng
  const hop = document.createElement("dialog");
  hop.className = "series-hop";
  hop.setAttribute("aria-labelledby", "hop-ten");
  document.body.appendChild(hop);
  let tuTrang = false; // mở bằng bấm thẻ trong trang (đã thêm một mục lịch sử) hay từ link ngoài
  function moHop(id) {
    const g = byId[id];
    hop.dataset.id = id;
    hop.innerHTML = '<button type="button" class="hop-dong" aria-label="' + S.dong + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>' +
      '<div class="hop-in"><div class="series">' + khoi(g, g.items, "h2", "hop-ten") + "</div></div>";
    if (!hop.open) hop.showModal();
    hop.querySelector(".hop-dong").focus();
    hop.querySelector(".hop-in").scrollTop = 0;
  }
  hop.addEventListener("close", () => {
    if (hashSeries()) {
      if (tuTrang) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
    tuTrang = false;
    const the = document.getElementById("the-" + hop.dataset.id);
    if (the) the.focus({ preventScroll: true });
  });
  hop.addEventListener("click", e => {
    if (e.target === hop || e.target.closest(".hop-dong")) hop.close();
  });
  box.addEventListener("click", e => {
    if (e.target.closest(".series-card") && !e.metaKey && !e.ctrlKey && !e.shiftKey) tuTrang = true;
  });
  window.addEventListener("hashchange", () => {
    const id = hashSeries();
    if (id) moHop(id);
    else if (hop.open) hop.close();
  });
  const dau = hashSeries();
  if (dau && !document.getElementById("the-" + dau)) {
    soThe = groups.findIndex(g => g.id === dau) + 1;
    render();
  }
  if (dau) {
    const the = document.getElementById("the-" + dau);
    if (the) the.scrollIntoView({ block: "center", behavior: "instant" });
    moHop(dau);
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

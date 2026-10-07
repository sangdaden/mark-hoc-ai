(async function () {
  async function load(name) {
    if (window.__DATA && window.__DATA[name]) return window.__DATA[name];
    const r = await fetch("data/" + name + ".json");
    return r.json();
  }
  const [kenh, series, videos] = await Promise.all([load("kenh"), load("series"), load("videos")]);

  document.querySelectorAll("[data-kenh]").forEach(a => {
    const url = kenh[a.dataset.kenh];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else a.hidden = true;
  });
  const lienHe = document.getElementById("lien-he");
  if (kenh.email) lienHe.innerHTML = 'Hợp tác hoặc góp ý: <a href="mailto:' + kenh.email + '">' + kenh.email + "</a>";
  else lienHe.textContent = "Góp ý hoặc hợp tác: nhắn tin cho trang Facebook của kênh.";

  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const esc = s => (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const groups = series.map(s => {
    const items = videos.filter(v => v.so >= s.tu && v.so <= s.den).map(v => {
      const m = v.chu_de.match(/^.*?\((Phần \d+\/\d+)\):\s*(.*)$/);
      const title = m ? m[2] : v.chu_de;
      const part = m ? m[1] : "";
      const desc = v.mo_ta;
      return { ...v, title, part, desc, key: norm([v.so, title, v.tieu_de, v.mo_ta, s.ten, s.tags.join(" ")].join(" ")) };
    });
    return { ...s, items };
  }).filter(g => g.items.length);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const nSeries = groups.filter(g => !g.le).length;
  document.getElementById("stats").textContent = total + " video · " + nSeries + " series · đăng 5 video mỗi ngày";

  const chips = document.getElementById("chips");
  let current = "tat-ca";
  try { current = localStorage.getItem("mhai-series") || current; } catch (e) {}
  const chipData = [{ id: "tat-ca", ten: "Tất cả", n: total }].concat(groups.map(g => ({ id: g.id, ten: g.ten, n: g.items.length })));
  if (!chipData.some(c => c.id === current)) current = "tat-ca";
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
      const head = '<div class="series-head"><h3>' + esc(g.ten) + (g.sap_ra_mat ? '<span class="soon">Sắp ra mắt</span>' : "") +
        '</h3><span class="series-range">' + (g.le ? g.items.length + " video lẻ" : g.items.length + " phần") + " · " + range + "</span>" +
        '<p class="series-desc">' + esc(g.mo_ta) + '</p><div class="tags">' + g.tags.map(t => "<span>" + esc(t) + "</span>").join("") + "</div></div>";
      const rows = items.map(v => {
        const link = g.sap_ra_mat
          ? '<span class="row-soon">Sắp ra mắt</span>'
          : '<a class="row-link" target="_blank" rel="noopener" href="' + kenh.youtube + "/search?query=" + encodeURIComponent(v.title) + '">Xem ›</a>';
        return '<li class="row"><span class="num">#' + String(v.so).padStart(2, "0") + '</span><div class="row-main"><p class="row-title">' +
          (v.part ? '<span class="row-part">' + v.part + "</span>" : "") + esc(v.title) + '</p><p class="row-desc">' + esc(v.desc) + "</p></div>" + link + "</li>";
      }).join("");
      return '<section class="series" id="' + g.id + '">' + head + '<ol class="list">' + rows + "</ol></section>";
    }).join("");
    document.getElementById("rong").hidden = shown > 0;
  }
  render();

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

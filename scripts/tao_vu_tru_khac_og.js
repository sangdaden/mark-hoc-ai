// Ảnh chia sẻ riêng cho từng bài Mark ở vũ trụ khác (Sang 15/10): ảnh 1200×630 cho og:image, VI và EN.
// Mỗi ảnh lấy đúng bìa của bài ở trang góc (màu bìa, hình tự vẽ, tư thế Mark), đặt cạnh tên bài, chủ đề và logo góc.
// Facebook không đọc ảnh SVG nên phải xuất ảnh thường. Dùng JPEG chất lượng 90 (~60 KB/ảnh): PNG đủ màu nặng ~450 KB/ảnh,
// PNG giảm màu thì mất vầng sáng nền và màu má của Mark. Ảnh ra ở assets/vu-tru-khac/og/<slug>.jpg và og/en/<slug>.jpg;
// scripts/tao_vu_tru_khac.py trỏ og:image vào ảnh nếu có, không thì dùng ảnh chung assets/og.png.
//
// Chạy sau khi tạo lại trang góc (cần Playwright + Chromium):
//   node scripts/tao_vu_tru_khac_og.js            # tạo ảnh còn thiếu
//   node scripts/tao_vu_tru_khac_og.js --tat-ca   # tạo lại hết (khi đổi bìa hay đổi kiểu ảnh)
//   node scripts/tao_vu_tru_khac_og.js why-we-sleep sapiens
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const R = path.resolve(__dirname, '..');
const RA = path.join(R, 'assets/vu-tru-khac/og');
const KIEU = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };

const doi = process.argv.slice(2).filter(a => !a.startsWith('--'));
const tatCa = process.argv.includes('--tat-ca');

// Khung ảnh vẽ ngay trong trang góc để dùng chung style.css của thẻ bìa
const CSS = `
#og { position: fixed; inset: 0 auto auto 0; z-index: 2147483647; width: 1200px; height: 630px; overflow: hidden; box-sizing: border-box;
  padding: 52px 0 48px 72px; display: flex; flex-direction: column; color: #FFF7ED;
  background: radial-gradient(60% 80% at 82% 60%, color-mix(in srgb, var(--bia-nhan) 26%, transparent), transparent 70%),
    linear-gradient(150deg, var(--bia-2), var(--bia-1) 75%); }
#og::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: var(--bia-nhan); }
#og .og-logo { height: 72px; width: auto; align-self: flex-start; }
#og .og-chu { width: 640px; margin: auto 0; display: flex; flex-direction: column; gap: 16px; }
#og .og-so { font: 600 24px/1.2 Inter, system-ui, sans-serif; letter-spacing: .06em; text-transform: uppercase; color: var(--bia-nhan); }
#og .og-so::before { content: ""; display: block; width: 72px; height: 4px; margin-bottom: 16px; border-radius: 2px; background: var(--bia-nhan); }
#og .og-ten { margin: 0; font: 800 76px/1.08 "Be Vietnam Pro", system-ui, sans-serif; letter-spacing: -.01em; text-wrap: balance; overflow-wrap: break-word; }
#og .og-tg { font: 500 28px/1.3 Inter, system-ui, sans-serif; opacity: .85; }
#og .og-web { font: 600 22px/1 Inter, system-ui, sans-serif; opacity: .75; }
#og .og-bia { position: absolute; top: 50%; right: 84px; width: 300px; transform: translateY(-50%) scale(1.3) rotate(-3deg); transform-origin: center; }
#og .og-bia .vtk-bia { margin: 0; box-shadow: inset 6px 0 0 rgb(0 0 0 / .3), inset 7px 0 0 rgb(255 255 255 / .12), 0 26px 40px -18px rgb(0 0 0 / .75); }
`;

function phucVu() {
  const sv = http.createServer((q, s) => {
    const p = path.join(R, decodeURIComponent(q.url.split('?')[0]));
    if (!p.startsWith(R) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'Content-Type': KIEU[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(s);
  });
  return new Promise(ok => sv.listen(0, '127.0.0.1', () => ok(sv)));
}

(async () => {
  const sv = await phucVu();
  const goc = `http://127.0.0.1:${sv.address().port}/`;
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  let lam = 0, bo = 0;
  for (const en of [false, true]) {
    const ra = en ? path.join(RA, 'en') : RA;
    fs.mkdirSync(ra, { recursive: true });
    const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
    await p.goto(goc + (en ? 'en/' : '') + 'vu-tru-khac.html', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: CSS });
    const ds = await p.evaluate(() => [...document.querySelectorAll('.vtk-the')].map(a => a.getAttribute('href').split('/').pop().replace('.html', '')));
    for (const slug of ds) {
      const tep = path.join(ra, slug + '.jpg');
      if (doi.length ? !doi.includes(slug) : (!tatCa && fs.existsSync(tep))) { bo++; continue; }
      await p.evaluate(({ slug, en }) => {
        document.getElementById('og')?.remove();
        const a = document.querySelector(`.vtk-the[href$="/${slug}.html"]`);
        const o = document.createElement('div');
        o.id = 'og';
        o.setAttribute('style', a.getAttribute('style') || '');
        const tg = (a.querySelector('.vtk-tg')?.textContent || '').replace(/\s*·\s*\d+(?:[.,]\d+)?\/5\s*$/, '');
        const logo = (en ? '../' : '') + 'assets/vu-tru-khac/logo-ngang-toi.webp';
        o.innerHTML = `<img class="og-logo" src="${logo}" alt=""><div class="og-chu"><span class="og-so"></span><h1 class="og-ten"></h1>`
          + `<span class="og-tg"></span></div><span class="og-web">markhocai.com/${en ? 'en/' : ''}vu-tru-khac</span><div class="og-bia"></div>`;
        o.querySelector('.og-so').textContent = a.querySelector('.vtk-so')?.textContent || '';
        // Từ có gạch nối (COVID-19, dot-com) không được gãy dòng ngay sau dấu gạch
        const ten0 = a.querySelector('b')?.textContent || '';
        ten0.split(/(\S*-\S*)/).forEach((t, i) => {
          if (!t) return;
          const n = i % 2 ? Object.assign(document.createElement('span'), { textContent: t }) : document.createTextNode(t);
          if (i % 2) n.style.whiteSpace = 'nowrap';
          o.querySelector('.og-ten').append(n);
        });
        o.querySelector('.og-tg').textContent = tg;
        if (!tg) o.querySelector('.og-tg').remove();
        const bia = a.querySelector('.vtk-bia').cloneNode(true);
        bia.querySelectorAll('img').forEach(i => i.removeAttribute('loading'));
        o.querySelector('.og-bia').append(bia);
        document.body.append(o);
        // Tên dài thì thu nhỏ chữ tới khi khối chữ lọt giữa logo và dòng web (tối đa 4 dòng)
        const ten = o.querySelector('.og-ten'), chu = o.querySelector('.og-chu');
        for (let c = 76; c > 34; c -= 2) {
          ten.style.fontSize = c + 'px';
          const dong = Math.round(ten.scrollHeight / (c * 1.08));
          if (chu.scrollHeight <= 400 && dong <= (c > 56 ? 3 : 4) && ten.scrollWidth <= ten.clientWidth) break;
        }
      }, { slug, en });
      await p.evaluate(() => Promise.all([document.fonts.ready, ...[...document.querySelectorAll('#og img')].map(i => i.decode().catch(() => {}))]));
      await p.locator('#og').screenshot({ path: tep, type: 'jpeg', quality: 90 });
      lam++;
    }
    await p.close();
  }
  await b.close();
  sv.close();
  console.log(`Ảnh chia sẻ: tạo ${lam}, giữ nguyên ${bo} (assets/vu-tru-khac/og/)`);
})();

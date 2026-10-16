/* Phòng thí nghiệm cảm biến 3D (phong-thi-nghiem-cam-bien.html, en/): 4 phần
   1. Mổ xẻ: mô hình LiDAR, camera, radar, tách rời từng bộ phận, chạm để đọc giải thích.
   2. Đo bằng ánh sáng: bắn xung laser tới vật rồi về, tính thời gian (ns) theo khoảng cách.
   3. Con phố: đổi nắng / đêm / mưa / sương và nhìn bằng mắt người, camera, LiDAR (đám mây điểm), radar (đốm + tốc độ), hoặc ghép cả ba.
   4. Thử thách: chọn ít cảm biến nhất mà vẫn đủ cho từng tình huống.
   Dữ liệu và chữ: thẻ <script id="cb-du-lieu"> do scripts/tao_bai_viet.py tạo từ data/cam-bien.json.
   Three.js r160 để sẵn trong assets/vendor/three (giấy phép MIT), không tải gì từ CDN. Không chạy được WebGL thì vẫn dùng được bảng và thử thách. */
import * as THREE from "./assets/vendor/three/three.module.min.js";
import { OrbitControls } from "./assets/vendor/three/OrbitControls.js";

const nguon = document.getElementById("cb-du-lieu");
const D = JSON.parse(nguon.textContent);
const N = D.nhan;
const canvas = document.getElementById("cb-canvas");
const san = document.getElementById("cb-san");
const ben = document.getElementById("cb-ben");
const lop = document.getElementById("cb-nhan-3d");
const IT_CHUYEN_DONG = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const THOI_TIET = ["nang", "dem", "mua", "suong"];
const CB = ["camera", "lidar", "radar"];
const MAU = { blue: 0x2563eb, sky: 0x0ea5e9, mint: 0x06d6a0, yellow: 0xfacc15, red: 0xef4444, ink: 0x0f172a };

function el(tag, cls, chu) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (chu != null) e.textContent = chu;
  return e;
}
function nut(chu, cls, fn) {
  const b = el("button", cls, chu);
  b.type = "button";
  b.addEventListener("click", fn);
  return b;
}
function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d || {}); }
function linkVideo(v) {
  const a = el("a", "cb-video");
  a.href = v.url;
  a.appendChild(el("span", "cb-video-so", "#" + v.so));
  a.appendChild(el("b", null, v.ten));
  return a;
}
function mauNen() {
  const c = getComputedStyle(document.documentElement).getPropertyValue("--bg2").trim();
  return new THREE.Color(c || "#E0F2FE");
}

// ---------- WebGL ----------
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
} catch (e) {
  renderer = null;
  document.getElementById("cb-loi").hidden = false;
  canvas.hidden = true;
}

function vat(geo, mau, them) {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(Object.assign({ color: mau, roughness: 0.55, metalness: 0.1 }, them || {})));
  return m;
}
function texChu(chu, opt) {
  const o = Object.assign({ w: 256, h: 256, nen: "#ffffff", mau: "#0f172a", co: 120, vien: null, tron: false }, opt || {});
  const c = document.createElement("canvas");
  c.width = o.w; c.height = o.h;
  const g = c.getContext("2d");
  if (o.tron) {
    g.beginPath(); g.arc(o.w / 2, o.h / 2, o.w / 2 - 4, 0, Math.PI * 2); g.fillStyle = o.nen; g.fill();
    if (o.vien) { g.lineWidth = o.w * 0.09; g.strokeStyle = o.vien; g.beginPath(); g.arc(o.w / 2, o.h / 2, o.w / 2 - o.w * 0.07, 0, Math.PI * 2); g.stroke(); }
  } else { g.fillStyle = o.nen; g.fillRect(0, 0, o.w, o.h); }
  g.fillStyle = o.mau; g.font = `800 ${o.co}px Inter, system-ui, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(chu, o.w / 2, o.h / 2 + o.co * 0.04);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- 1. Mổ xẻ cảm biến ----------
function moXe() {
  const scene = new THREE.Scene();
  scene.background = mauNen();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb7d6, 1.6));
  const den = new THREE.DirectionalLight(0xffffff, 2.2);
  den.position.set(4, 8, 6);
  scene.add(den);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(7.5, 6, 10);
  const san3 = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
  san3.rotation.x = -Math.PI / 2;
  scene.add(san3);

  const kinhMo = (mau, o) => ({ color: mau, transparent: true, opacity: o, roughness: 0.15, metalness: 0.2, depthWrite: false });
  const mo = {};
  // mỗi bộ phận: { id, vat: Object3D, goc: vị trí lắp, tach: dịch khi tách rời }
  function bp(nhom, id, obj, goc, tach) {
    obj.position.copy(goc);
    obj.traverse((m) => { if (m.isMesh) m.userData.bp = id; });
    nhom.add(obj);
    return { id, vat: obj, goc: goc.clone(), tach: tach.clone() };
  }

  // LiDAR: đế, mạch, đầu quay (vỏ trong suốt) chứa bộ phát, gương, mắt thu
  {
    const g = new THREE.Group(), quay = new THREE.Group();
    const ds = [];
    ds.push(bp(g, "de", vat(new THREE.CylinderGeometry(1.25, 1.35, 0.7, 48), 0x334155, { metalness: 0.6, roughness: 0.35 }), new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, -0.2, 0)));
    ds.push(bp(g, "mach", vat(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 6), 0x15803d), new THREE.Vector3(0, 0.78, 0), new THREE.Vector3(0, 0.9, 0)));
    quay.position.set(0, 0, 0);
    g.add(quay);
    ds.push(bp(quay, "dau", vat(new THREE.CylinderGeometry(1.15, 1.15, 1.5, 48, 1, true), 0x0f172a, kinhMo(0x1e293b, 0.28)), new THREE.Vector3(0, 1.62, 0), new THREE.Vector3(0, 2.4, 0)));
    const phat = new THREE.Group();
    phat.add(vat(new THREE.BoxGeometry(0.42, 0.42, 0.42), 0x7f1d1d));
    const dau_ = vat(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 20), MAU.red, { emissive: MAU.red, emissiveIntensity: 1.5 });
    dau_.rotation.z = Math.PI / 2; dau_.position.x = 0.26; phat.add(dau_);
    ds.push(bp(quay, "phat", phat, new THREE.Vector3(0.55, 1.45, 0.25), new THREE.Vector3(1.9, 1.4, 0.4)));
    const guong = vat(new THREE.BoxGeometry(0.08, 0.7, 0.7), 0xe2e8f0, { metalness: 1, roughness: 0.05 });
    guong.rotation.z = Math.PI / 4;
    const gG = new THREE.Group(); gG.add(guong);
    ds.push(bp(quay, "guong", gG, new THREE.Vector3(0, 1.75, -0.2), new THREE.Vector3(0, 1.6, -1.6)));
    const thu = new THREE.Group();
    const thuK = vat(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 32), 0x1d4ed8, { metalness: 0.3, roughness: 0.1 });
    thuK.rotation.z = Math.PI / 2; thu.add(thuK);
    ds.push(bp(quay, "thu", thu, new THREE.Vector3(-0.55, 1.45, 0.25), new THREE.Vector3(-1.9, 1.4, 0.4)));
    // tia laser quay theo đầu
    const tia = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6, 6), new THREE.MeshBasicMaterial({ color: MAU.red, transparent: true, opacity: 0.75 }));
    tia.rotation.z = Math.PI / 2; tia.position.set(3.8, 1.45, 0.25);
    quay.add(tia);
    mo.lidar = { nhom: g, ds, quay, tia };
  }
  // Camera: vỏ, ống kính 3 lớp, khẩu độ, cảm biến ảnh, chip AI
  {
    const g = new THREE.Group();
    const ds = [];
    ds.push(bp(g, "vo", vat(new THREE.BoxGeometry(2.2, 1.5, 2.4), 0x1e293b, kinhMo(0x334155, 0.3)), new THREE.Vector3(0, 1.05, 0), new THREE.Vector3(0, 2.4, 0)));
    const kinh = new THREE.Group();
    [0, 0.42, 0.84].forEach((z, i) => {
      const k = vat(new THREE.CylinderGeometry(0.5 - i * 0.04, 0.5 - i * 0.04, 0.16, 40), 0x7dd3fc, kinhMo(0x38bdf8, 0.55));
      k.rotation.x = Math.PI / 2; k.position.z = z; kinh.add(k);
    });
    const ong = vat(new THREE.CylinderGeometry(0.58, 0.58, 1.1, 40, 1, true), 0x0f172a, { side: THREE.DoubleSide });
    ong.rotation.x = Math.PI / 2; ong.position.z = 0.42; kinh.add(ong);
    ds.push(bp(g, "kinh", kinh, new THREE.Vector3(0, 1.05, 1.15), new THREE.Vector3(0, 0, 2.4)));
    const khau = vat(new THREE.TorusGeometry(0.4, 0.09, 12, 40), 0x94a3b8, { metalness: 0.8, roughness: 0.3 });
    ds.push(bp(g, "khau", khau, new THREE.Vector3(0, 1.05, 0.55), new THREE.Vector3(0, 0, 1.3)));
    const anhCB = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const x = c.getContext("2d");
      for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = ["#ef4444", "#22c55e", "#3b82f6"][(i + j) % 3]; x.fillRect(i * 4, j * 4, 3, 3); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
    })();
    const chipAnh = new THREE.Group();
    chipAnh.add(vat(new THREE.BoxGeometry(0.9, 0.9, 0.08), 0x111827));
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshStandardMaterial({ map: anhCB, roughness: 0.4 }));
    mat.position.z = 0.05; chipAnh.add(mat);
    ds.push(bp(g, "cam", chipAnh, new THREE.Vector3(0, 1.05, -0.2), new THREE.Vector3(0, 0, -0.3)));
    const bo = new THREE.Group();
    bo.add(vat(new THREE.BoxGeometry(1.8, 1.2, 0.1), 0x15803d));
    const ic = vat(new THREE.BoxGeometry(0.6, 0.6, 0.12), 0x0f172a); ic.position.z = -0.1; bo.add(ic);
    ds.push(bp(g, "chip", bo, new THREE.Vector3(0, 1.05, -0.85), new THREE.Vector3(0, 0, -1.6)));
    mo.camera = { nhom: g, ds };
  }
  // Radar: nắp, dãy ăng-ten, chip, mạch, vỏ
  {
    const g = new THREE.Group();
    const ds = [];
    ds.push(bp(g, "vo", vat(new THREE.BoxGeometry(2.6, 2.0, 0.5), 0x64748b, { metalness: 0.7, roughness: 0.35 }), new THREE.Vector3(0, 1.2, -0.35), new THREE.Vector3(0, 0, -1.8)));
    ds.push(bp(g, "mach", vat(new THREE.BoxGeometry(2.3, 1.75, 0.08), 0x15803d), new THREE.Vector3(0, 1.2, -0.02), new THREE.Vector3(0, 0, -0.8)));
    const chip = vat(new THREE.BoxGeometry(0.5, 0.5, 0.12), 0x0f172a);
    ds.push(bp(g, "chip", chip, new THREE.Vector3(0.7, 0.75, 0.08), new THREE.Vector3(1.6, -0.9, 0.3)));
    const anten = new THREE.Group();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
      const p = vat(new THREE.BoxGeometry(0.18, 0.18, 0.03), 0xd97706, { metalness: 0.9, roughness: 0.25 });
      p.position.set(-0.75 + j * 0.3, -0.45 + i * 0.3, 0); anten.add(p);
    }
    ds.push(bp(g, "anten", anten, new THREE.Vector3(-0.15, 1.35, 0.06), new THREE.Vector3(0, 0, 0.9)));
    ds.push(bp(g, "nap", vat(new THREE.BoxGeometry(2.6, 2.0, 0.12), 0xf8fafc, kinhMo(0xf8fafc, 0.35)), new THREE.Vector3(0, 1.2, 0.3), new THREE.Vector3(0, 0, 1.9)));
    // sóng radio lan ra phía trước
    const song = [];
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 6, 48, Math.PI * 0.7), new THREE.MeshBasicMaterial({ color: MAU.sky, transparent: true, opacity: 0.6 }));
      s.rotation.set(0, 0, Math.PI * 0.15);
      s.userData.pha = i / 4;
      g.add(s); song.push(s);
    }
    mo.radar = { nhom: g, ds, song };
  }
  Object.values(mo).forEach((m) => { m.nhom.visible = false; scene.add(m.nhom); });

  let dang = "lidar", tach = 0, muonTach = 0, chon = null;
  const raycaster = new THREE.Raycaster();

  function to(id) {
    Object.entries(mo).forEach(([k, m]) => m.ds.forEach((d) => d.vat.traverse((x) => {
      if (!x.isMesh) return;
      if (x.userData.goc === undefined) x.userData.goc = x.material.emissive ? x.material.emissive.getHex() : 0;
      if (x.material.emissive) x.material.emissive.setHex(k === dang && d.id === id ? 0x1d4ed8 : x.userData.goc);
    })));
  }
  function chonBP(id) {
    chon = id;
    to(id);
    veBen();
    if (id) do_("cam-bien-bo-phan", { cb: dang, bp: id });
  }
  function doiCB(k) {
    dang = k; chon = null;
    Object.entries(mo).forEach(([kk, m]) => { m.nhom.visible = kk === k; });
    to(null);
    veBen();
  }
  function veBen() {
    ben.innerHTML = "";
    const hang = el("div", "cb-chon-cb");
    CB.slice().sort((a, b) => ["lidar", "camera", "radar"].indexOf(a) - ["lidar", "camera", "radar"].indexOf(b)).forEach((k) => {
      const b = nut(D.cb[k].ten, "cb-chip" + (k === dang ? " is-chon" : ""), () => doiCB(k));
      b.setAttribute("aria-pressed", k === dang ? "true" : "false");
      hang.appendChild(b);
    });
    ben.appendChild(hang);
    const c = D.cb[dang];
    ben.appendChild(el("p", "cb-mo-ta", c.mo_ta));
    ben.appendChild(nut(muonTach ? N.gop : N.tach, "btn btn-yt cb-tach", () => { muonTach = muonTach ? 0 : 1; veBen(); }));
    const ds = el("div", "cb-bp");
    c.bo_phan.forEach((b) => {
      const x = nut(b.ten, "cb-bp-nut" + (b.id === chon ? " is-chon" : ""), () => chonBP(b.id === chon ? null : b.id));
      x.setAttribute("aria-pressed", b.id === chon ? "true" : "false");
      ds.appendChild(x);
    });
    ben.appendChild(ds);
    const bpc = c.bo_phan.find((b) => b.id === chon);
    const the = el("div", "cb-the");
    if (bpc) { the.appendChild(el("b", null, bpc.ten)); the.appendChild(el("p", null, bpc.chu)); }
    else the.appendChild(el("p", "cb-goi-y", N.cham));
    ben.appendChild(the);
    ben.appendChild(linkVideo(c.video));
  }
  function cham(x, y) {
    const r = canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(v, camera);
    const hit = raycaster.intersectObjects(mo[dang].nhom.children, true).find((h) => h.object.userData.bp);
    chonBP(hit ? (hit.object.userData.bp === chon ? null : hit.object.userData.bp) : null);
  }
  function update(dt, t) {
    tach += (muonTach - tach) * Math.min(1, dt * 5);
    const m = mo[dang];
    m.ds.forEach((d) => d.vat.position.copy(d.goc).addScaledVector(d.tach, tach));
    if (m.quay) {
      if (!IT_CHUYEN_DONG && tach < 0.05) m.quay.rotation.y += dt * 2.2;
      m.tia.visible = tach < 0.05;
    }
    if (m.song) m.song.forEach((s) => {
      const k = ((t * 0.5 + s.userData.pha) % 1);
      s.visible = tach < 0.05;
      s.scale.setScalar(0.6 + k * 3.2);
      s.position.set(-0.15, 1.2, 0.5 + k * 3);
      s.material.opacity = 0.65 * (1 - k);
    });
    // nhãn nổi trên bộ phận đang chọn
    lop.innerHTML = "";
    if (chon) {
      const d = m.ds.find((x) => x.id === chon);
      if (d) {
        const p = new THREE.Vector3();
        d.vat.getWorldPosition(p);
        nhan3d(p, D.cb[dang].bo_phan.find((b) => b.id === chon).ten, camera);
      }
    }
  }
  doiCB("lidar");
  return { scene, camera, update, veBen, cham, muc_tieu: new THREE.Vector3(0, 1.8, 0), kc: [5, 20] };
}

// nhãn chữ HTML gắn vào một điểm 3D
function nhan3d(p, chu, camera, cls) {
  const v = p.clone().project(camera);
  if (v.z > 1) return;
  const e = el("span", "cb-nhan" + (cls ? " " + cls : ""), chu);
  e.style.top = ((1 - v.y) / 2) * 100 + "%";
  lop.appendChild(e);
  // giữ nhãn trọn trong khung (khung hẹp trên điện thoại)
  const W = lop.clientWidth, nua = e.offsetWidth / 2 + 4;
  e.style.left = Math.min(W - nua, Math.max(nua, ((v.x + 1) / 2) * W)) + "px";
}

// ---------- 2. Đo bằng ánh sáng ----------
function doSang() {
  const scene = new THREE.Scene();
  scene.background = mauNen();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb7d6, 1.5));
  const dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(3, 8, 5); scene.add(dl);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 10, 24);
  const nen = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
  nen.rotation.x = -Math.PI / 2; scene.add(nen);
  // vạch mét
  for (let i = 0; i <= 10; i++) {
    const v = vat(new THREE.BoxGeometry(0.04, 0.02, i % 5 ? 0.4 : 0.8), 0x475569);
    v.position.set(-9 + i * 1.8, 0.01, 2.2); scene.add(v);
  }
  const lidar = new THREE.Group();
  lidar.add(vat(new THREE.CylinderGeometry(0.5, 0.55, 0.4, 32), 0x334155, { metalness: 0.6 }));
  const dau = vat(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 32), 0x1e293b); dau.position.y = 0.5; lidar.add(dau);
  const mat = vat(new THREE.SphereGeometry(0.12, 16, 16), MAU.red, { emissive: MAU.red, emissiveIntensity: 1.4 }); mat.position.set(0.42, 0.5, 0); lidar.add(mat);
  lidar.position.set(-9.6, 0.2, 0); scene.add(lidar);
  const nguoi = nguoiDiBo(0x2563eb); nguoi.position.y = 0; scene.add(nguoi);
  const xung = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: MAU.red }));
  const vet = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 8), new THREE.MeshBasicMaterial({ color: MAU.red, transparent: true, opacity: 0.45 }));
  vet.rotation.z = Math.PI / 2;
  scene.add(xung, vet);
  let kc = 30, ban = -1;
  const X0 = -9.2;
  const xVat = () => X0 + (kc / 100) * 18;
  function veBen() {
    ben.innerHTML = "";
    const o = el("div", "cb-o-so");
    const o1 = el("div", "cb-so"), o2 = el("div", "cb-so");
    o1.appendChild(el("b", null, kc + " " + N.m)); o1.appendChild(el("span", null, N.khoang));
    const tg = el("b", null, Math.round(kc * 2 / 0.3) + " " + N.ns); tg.id = "cb-ns";
    o2.appendChild(tg); o2.appendChild(el("span", null, N.thoi_gian));
    o.append(o1, o2);
    ben.appendChild(o);
    const lab = el("label", "cb-thanh");
    lab.appendChild(el("span", null, N.khoang + ": " + kc + " m"));
    const r = el("input"); r.type = "range"; r.min = 1; r.max = 100; r.value = kc;
    r.addEventListener("input", () => { kc = +r.value; lab.firstChild.textContent = N.khoang + ": " + kc + " m"; o1.firstChild.textContent = kc + " " + N.m; tg.textContent = Math.round(kc * 2 / 0.3) + " " + N.ns; });
    lab.appendChild(r);
    ben.appendChild(lab);
    ben.appendChild(nut("⚡ " + N.ban, "btn btn-yt", () => { ban = 0; do_("cam-bien-ban-laser", { m: String(kc) }); }));
    ben.appendChild(el("p", "cb-cong-thuc", N.cong_thuc));
    ben.appendChild(linkVideo(D.cb.lidar.video));
  }
  function update(dt) {
    nguoi.position.x = xVat() + 0.3;
    const x1 = X0 + 0.3, x2 = xVat();
    const T = 1.8; // chiếu chậm: một lượt đi và về mất 1,8 giây
    if (ban >= 0) {
      ban += dt / T;
      const k = ban < 0.5 ? ban * 2 : 2 - ban * 2;
      const x = x1 + (x2 - x1) * k;
      xung.visible = vet.visible = true;
      xung.position.set(x, 0.7, 0);
      vet.scale.y = Math.max(0.01, Math.abs(x - x1)); vet.position.set((x + x1) / 2, 0.7, 0);
      const ns = document.getElementById("cb-ns");
      if (ns) ns.textContent = Math.round(Math.min(ban, 1) * kc * 2 / 0.3) + " " + N.ns;
      if (ban >= 1) ban = -1;
    } else { xung.visible = vet.visible = false; }
  }
  return { scene, camera, update, veBen, muc_tieu: new THREE.Vector3(0, 0.5, 0), kc: [10, 36] };
}

function nguoiDiBo(mau) {
  const g = new THREE.Group();
  const than = vat(new THREE.CapsuleGeometry(0.28, 0.9, 6, 16), mau); than.position.y = 1.0; g.add(than);
  const dau = vat(new THREE.SphereGeometry(0.24, 20, 20), 0xf1c27d); dau.position.y = 1.85; g.add(dau);
  const c1 = vat(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8), 0x1e293b); c1.position.set(-0.12, 0.35, 0); g.add(c1);
  const c2 = c1.clone(); c2.position.x = 0.12; g.add(c2);
  return g;
}

// ---------- 3 + 4. Con phố ----------
function conPho() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  camera.position.set(-4, 20, 34);
  const camXe = new THREE.PerspectiveCamera(58, 1, 0.1, 300);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x64748b, 1.3);
  const nang = new THREE.DirectionalLight(0xffffff, 2.2); nang.position.set(10, 20, 8);
  scene.add(hemi, nang);
  const vatCung = []; // vật để tia LiDAR dội vào
  const nhom3d = new THREE.Group(); scene.add(nhom3d);
  const them = (m, cung) => { nhom3d.add(m); if (cung !== false) vatCung.push(m); return m; };
  // mặt đất, đường, vỉa hè, vạch kẻ
  const dat = them(vat(new THREE.PlaneGeometry(80, 80), 0x94a3b8)); dat.rotation.x = -Math.PI / 2;
  const duong1 = them(vat(new THREE.PlaneGeometry(8, 80), 0x334155)); duong1.rotation.x = -Math.PI / 2; duong1.position.y = 0.01;
  const duong2 = them(vat(new THREE.PlaneGeometry(80, 8), 0x334155)); duong2.rotation.x = -Math.PI / 2; duong2.position.y = 0.012;
  for (let i = 0; i < 6; i++) { const v = them(vat(new THREE.BoxGeometry(0.6, 0.02, 2.2), 0xf8fafc), false); v.position.set(-3 + i * 1.2, 0.03, 5.2); }
  for (let z = 12; z < 40; z += 4) { const v = them(vat(new THREE.BoxGeometry(0.15, 0.02, 2), 0xfacc15), false); v.position.set(0, 0.03, z); }
  // nhà hai bên
  [[-12, -12, 0xbfdbfe, 7], [12, -12, 0xfde68a, 9], [-12, 14, 0xbbf7d0, 6], [12, 16, 0xfecaca, 8], [-24, -6, 0xddd6fe, 10], [24, -2, 0xc7d2fe, 7]].forEach(([x, z, c, h]) => {
    const n = them(vat(new THREE.BoxGeometry(10, h, 10), c)); n.position.set(x, h / 2, z);
  });
  // xe của mình (camera và cảm biến trên nóc)
  const xe = new THREE.Group();
  xe.add(vat(new THREE.BoxGeometry(2.0, 0.8, 4.2), 0xffffff));
  const nocXe = vat(new THREE.BoxGeometry(1.7, 0.7, 2.2), 0x93c5fd, { metalness: 0.3, roughness: 0.2 }); nocXe.position.set(0, 0.75, -0.2); xe.add(nocXe);
  const puck = vat(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24), 0x1e293b); puck.position.set(0, 1.25, -0.2); xe.add(puck);
  [[-0.9, -1.4], [0.9, -1.4], [-0.9, 1.4], [0.9, 1.4]].forEach(([x, z]) => { const b = vat(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 20), 0x111827); b.rotation.z = Math.PI / 2; b.position.set(x, -0.2, z); xe.add(b); });
  xe.position.set(2, 0.6, 14);
  nhom3d.add(xe);
  const goc = new THREE.Vector3(2, 2.05, 13.6); // vị trí cảm biến trên nóc xe
  camXe.position.set(2, 1.7, 12.6); camXe.lookAt(2, 1.5, -10);
  // đèn pha (đêm)
  const pha = new THREE.SpotLight(0xfff7d6, 0, 45, Math.PI / 7, 0.4, 1.2); pha.position.set(2, 1.0, 12); pha.target.position.set(2, 0, -8);
  scene.add(pha, pha.target);
  // người đi bộ trên vạch
  const nguoi = them(nguoiDiBo(0x1f2937)); nguoi.position.set(-3, 0, 5.2);
  // xe máy đi trước
  const xm = new THREE.Group();
  const khung = vat(new THREE.BoxGeometry(0.35, 0.5, 1.6), 0xdc2626); khung.position.y = 0.65; xm.add(khung);
  [[0.7], [-0.7]].forEach(([z]) => { const b = vat(new THREE.CylinderGeometry(0.33, 0.33, 0.14, 20), 0x111827); b.rotation.z = Math.PI / 2; b.position.set(0, 0.33, z); xm.add(b); });
  const lai = nguoiDiBo(0x0ea5e9); lai.scale.setScalar(0.75); lai.position.set(0, 0.4, 0.1); xm.add(lai);
  them(xm); xm.position.set(2, 0, -2);
  // đèn giao thông
  const cot = them(vat(new THREE.CylinderGeometry(0.12, 0.12, 5, 12), 0x475569)); cot.position.set(-4.6, 2.5, -4.6);
  const hop = them(vat(new THREE.BoxGeometry(0.7, 1.9, 0.6), 0x111827)); hop.position.set(-4.6, 5.3, -4.6);
  const denDo = vat(new THREE.SphereGeometry(0.23, 16, 16), MAU.red, { emissive: MAU.red, emissiveIntensity: 2.2 }); denDo.position.set(-4.6, 5.9, -4.28); nhom3d.add(denDo);
  const denVang = vat(new THREE.SphereGeometry(0.23, 16, 16), 0x3f3f1f); denVang.position.set(-4.6, 5.3, -4.28); nhom3d.add(denVang);
  const denXanh = vat(new THREE.SphereGeometry(0.23, 16, 16), 0x1f3f2a); denXanh.position.set(-4.6, 4.7, -4.28); nhom3d.add(denXanh);
  const quangDo = new THREE.PointLight(MAU.red, 0, 8); quangDo.position.copy(denDo.position); scene.add(quangDo);
  // biển giới hạn tốc độ
  const cotB = them(vat(new THREE.CylinderGeometry(0.08, 0.08, 3, 10), 0x64748b)); cotB.position.set(5.2, 1.5, 0);
  const bien = them(new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshStandardMaterial({ map: texChu("40", { tron: true, vien: "#dc2626", co: 110 }), roughness: 0.6 })));
  bien.position.set(5.2, 3.3, 0.1);
  // mưa
  const SO_HAT = 1400;
  const muaG = new THREE.BufferGeometry();
  const muaP = new Float32Array(SO_HAT * 6);
  for (let i = 0; i < SO_HAT; i++) { const x = (Math.random() - 0.5) * 50, y = Math.random() * 20, z = (Math.random() - 0.5) * 50; muaP.set([x, y, z, x, y - 0.6, z], i * 6); }
  muaG.setAttribute("position", new THREE.BufferAttribute(muaP, 3));
  const mua = new THREE.LineSegments(muaG, new THREE.LineBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.55 }));
  scene.add(mua);
  // đám mây điểm LiDAR
  const SO_TIA = 220 * 18;
  const diemG = new THREE.BufferGeometry();
  const diemP = new Float32Array(SO_TIA * 3), diemC = new Float32Array(SO_TIA * 3);
  diemG.setAttribute("position", new THREE.BufferAttribute(diemP, 3));
  diemG.setAttribute("color", new THREE.BufferAttribute(diemC, 3));
  const diem = new THREE.Points(diemG, new THREE.PointsMaterial({ size: 0.13, vertexColors: true, sizeAttenuation: true }));
  scene.add(diem);
  // đốm radar
  const dom = new THREE.Group(); scene.add(dom);
  const domMat = (o) => new THREE.MeshBasicMaterial({ color: MAU.mint, transparent: true, opacity: o, depthWrite: false });
  const domNguoi = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), domMat(0.45));
  const domXM = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), domMat(0.6));
  const domCot = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), domMat(0.2));
  const domBien = domCot.clone();
  dom.add(domNguoi, domXM, domCot, domBien);
  const luoi = new THREE.PolarGridHelper(30, 12, 6, 64, 0x0e7490, 0x164e63); luoi.position.copy(goc).setY(0.05); scene.add(luoi);
  const raycaster = new THREE.Raycaster(); raycaster.far = 40;

  const S = { tt: "nang", nhin: "mat", ghep: null, dem: 0 };
  function apDung() {
    const tt = S.tt, nhin = S.nhin;
    const troi = { nang: 0xbfe3ff, dem: 0x070d1a, mua: 0x6b7a8c, suong: 0xc9d0d8 }[tt];
    const toi = nhin === "lidar" || nhin === "radar";
    scene.background = new THREE.Color(toi ? 0x020617 : troi);
    scene.fog = toi ? null : (tt === "suong" ? new THREE.FogExp2(troi, 0.11) : tt === "mua" ? new THREE.FogExp2(troi, 0.028) : tt === "dem" ? new THREE.FogExp2(troi, 0.02) : null);
    hemi.intensity = tt === "dem" ? 0.08 : tt === "nang" ? 1.3 : 0.9;
    nang.intensity = tt === "dem" ? 0.02 : tt === "nang" ? 2.2 : 0.6;
    pha.intensity = tt === "dem" ? 60 : tt === "nang" ? 0 : 20;
    quangDo.intensity = tt === "dem" ? 6 : 1;
    renderer && (renderer.toneMappingExposure = 1);
    nhom3d.visible = !toi;
    mua.visible = tt === "mua" && !toi;
    diem.visible = nhin === "lidar";
    dom.visible = luoi.visible = nhin === "radar";
    luoi.visible = nhin === "radar";
    S.dem = 0;
  }
  // mức nhận biết: một cảm biến hoặc ghép nhiều cảm biến (lấy mức cao nhất)
  function muc(ds, k, tt) { return ds.reduce((m, c) => Math.max(m, D.muc[c][k][tt]), 0); }
  function dsNhin() { return S.ghep || (S.nhin === "ghep" ? CB : S.nhin === "mat" ? [] : [S.nhin]); }
  function quetLidar() {
    nhom3d.visible = true;
    scene.updateMatrixWorld(true);
    const dir = new THREE.Vector3();
    const xa = { nang: 40, dem: 40, mua: 22, suong: 5 }[S.tt];
    const roi = { nang: 0, dem: 0, mua: 0.25, suong: 0.7 }[S.tt];
    let n = 0;
    for (let a = 0; a < 220; a++) {
      const az = (a / 220) * Math.PI * 2;
      for (let e = 0; e < 18; e++) {
        const el_ = (-26 + e * 1.9) * Math.PI / 180;
        dir.set(Math.sin(az) * Math.cos(el_), Math.sin(el_), -Math.cos(az) * Math.cos(el_));
        let p = null;
        if (Math.random() < roi) {
          // tia bị hạt mưa / sương hắt lại sớm: điểm nhiễu gần xe
          const r = 0.8 + Math.random() * (S.tt === "suong" ? 3 : 6);
          p = goc.clone().addScaledVector(dir, r);
        } else {
          raycaster.set(goc, dir); raycaster.far = xa;
          const h = raycaster.intersectObjects(vatCung, true)[0];
          if (h) p = h.point;
        }
        if (!p) { diemP.set([0, -999, 0], n * 3); n++; continue; }
        const d = p.distanceTo(goc), k = Math.min(1, d / 30);
        const c = new THREE.Color().setHSL(0.45 + k * 0.35, 0.9, 0.55);
        diemP.set([p.x, p.y, p.z], n * 3); diemC.set([c.r, c.g, c.b], n * 3); n++;
      }
    }
    diemG.attributes.position.needsUpdate = true; diemG.attributes.color.needsUpdate = true;
    nhom3d.visible = false;
  }
  function update(dt, t) {
    // người đi qua đường, xe máy chạy ra xa rồi quay lại
    const kN = (t * 0.12) % 2, xN = -3.5 + (kN < 1 ? kN : 2 - kN) * 8;
    nguoi.position.x = xN; nguoi.rotation.y = kN < 1 ? Math.PI / 2 : -Math.PI / 2;
    const zXM = 8 - ((t * 4.2) % 34);
    xm.position.z = zXM;
    if (mua.visible) {
      for (let i = 0; i < SO_HAT; i++) { let y = muaP[i * 6 + 1] - dt * 22; if (y < 0) y += 20; muaP[i * 6 + 1] = y; muaP[i * 6 + 4] = y - 0.6; }
      muaG.attributes.position.needsUpdate = true;
    }
    if (S.nhin === "lidar") { S.dem -= dt; if (S.dem <= 0) { quetLidar(); S.dem = 0.25; } }
    if (S.nhin === "radar") {
      const rung = () => (Math.random() - 0.5) * 0.25;
      domNguoi.position.set(nguoi.position.x + rung(), 1, nguoi.position.z + rung()); domNguoi.scale.setScalar(0.9);
      domXM.position.set(xm.position.x + rung(), 0.9, xm.position.z + rung()); domXM.scale.setScalar(1.2);
      domCot.position.set(-4.6, 2, -4.6); domBien.position.set(5.2, 1.8, 0);
    }
    // nhãn
    lop.innerHTML = "";
    const ds = dsNhin();
    const camNow = S.nhin === "camera" ? camXe : camera;
    if (S.nhin === "radar") {
      nhan3d(domXM.position.clone().setY(2.4), N.xe_may + " · 15 " + N.kmh, camNow, "is-radar");
      nhan3d(domNguoi.position.clone().setY(2.6), "~ 4 " + N.kmh, camNow, "is-radar");
    } else if (ds.length) {
      const tt = S.tt;
      if (muc(ds, "den", tt) >= 1) nhan3d(denDo.position.clone().setY(6.6), N.doc_den, camNow, "is-do");
      if (muc(ds, "bien", tt) >= 1) nhan3d(bien.position.clone().setY(4.4), muc(ds, "bien", tt) === 2 ? N.doc_bien : "40?", camNow);
      const mN = muc(ds, "nguoi", tt);
      if (mN >= 1) nhan3d(nguoi.position.clone().setY(2.6), N.nguoi + (mN === 2 ? " · " + Math.round(goc.distanceTo(nguoi.position)) + " m" : " ?"), camNow);
      const mT = muc(ds, "toc_do", tt);
      if (mT >= 1) nhan3d(xm.position.clone().setY(2.2), N.xe_may + (mT === 2 ? " · 15 " + N.kmh : " · ~? " + N.kmh), camNow);
    }
  }
  apDung();
  return { scene, camera, camXe, update, S, apDung, muc, dsNhin, muc_tieu: new THREE.Vector3(0, 1, 2), kc: [12, 60] };
}

// ---------- bảng mức nhận biết ----------
function bangMuc(ds, tt) {
  const b = el("div", "cb-bang");
  b.appendChild(el("p", "cb-bang-h", N.bang));
  Object.entries(D.thong_tin).forEach(([k, ten]) => {
    const m = ds.length ? ds.reduce((x, c) => Math.max(x, D.muc[c][k][tt]), 0) : -1;
    const h = el("div", "cb-dong muc-" + Math.max(m, 0));
    h.appendChild(el("span", "cb-dot", m === 2 ? "✓" : m === 1 ? "~" : "✗"));
    h.appendChild(el("span", "cb-dong-ten", ten));
    h.appendChild(el("span", "cb-dong-muc", N.muc[Math.max(m, 0)]));
    b.appendChild(h);
  });
  return b;
}

// ---------- điều khiển chung ----------
const KHU = {};
let tab = "mo-xe", khu = null, controls = null;
function dungKhu(k) {
  if (!renderer) return null;
  if (!KHU[k]) KHU[k] = k === "mo-xe" ? moXe() : k === "do-sang" ? doSang() : (KHU["con-pho"] || KHU["thu-thach"] || conPho());
  return KHU[k];
}
function datControls(cam, k) {
  if (controls) controls.dispose();
  controls = new OrbitControls(cam, canvas);
  controls.enableDamping = true;
  controls.target.copy(k.muc_tieu);
  controls.minDistance = k.kc[0]; controls.maxDistance = k.kc[1];
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.update();
}

// Phần 3: con phố
function veConPho() {
  const k = khu;
  const S = k ? k.S : { tt: "nang", nhin: "camera", ghep: null };
  ben.innerHTML = "";
  const h1 = el("div", "cb-chon-cb");
  THOI_TIET.forEach((t) => {
    const b = nut(D.thoi_tiet[t], "cb-chip" + (S.tt === t ? " is-chon" : ""), () => { S.tt = t; if (k) k.apDung(); veConPho(); do_("cam-bien-thoi-tiet", { tt: t }); });
    b.setAttribute("aria-pressed", S.tt === t ? "true" : "false");
    h1.appendChild(b);
  });
  ben.appendChild(h1);
  ben.appendChild(el("p", "cb-nho", N.nhin));
  const h2 = el("div", "cb-chon-cb");
  [["mat", N.mat], ["camera", D.cb.camera.ten], ["lidar", D.cb.lidar.ten], ["radar", D.cb.radar.ten], ["ghep", N.ghep]].forEach(([id, ten]) => {
    const b = nut(ten, "cb-chip" + (S.nhin === id ? " is-chon" : ""), () => {
      S.nhin = id; S.ghep = null;
      if (k) { k.apDung(); datCam(); }
      veConPho();
    });
    b.setAttribute("aria-pressed", S.nhin === id ? "true" : "false");
    h2.appendChild(b);
  });
  ben.appendChild(h2);
  const ds = S.nhin === "ghep" ? CB : S.nhin === "mat" ? [] : [S.nhin];
  if (ds.length) {
    ben.appendChild(bangMuc(ds, S.tt));
    if (ds.length === 1) { ben.appendChild(el("p", "cb-ly-do", D.ly_do[ds[0]])); ben.appendChild(linkVideo(D.cb[ds[0]].video)); }
  }
}
function datCam() {
  const k = khu;
  if (!k || !k.S) return;
  if (k.S.nhin === "camera") { if (controls) controls.enabled = false; }
  else if (controls) controls.enabled = true;
}

// Phần 4: thử thách
const TT = { i: 0, chon: [], da: false, gon: 0 };
function veThuThach() {
  const c = D.thu_thach[TT.i];
  ben.innerHTML = "";
  if (TT.i >= D.thu_thach.length) {
    const kq = el("div", "cb-ket");
    kq.appendChild(el("b", "cb-ket-so", TT.gon + "/" + D.thu_thach.length));
    kq.appendChild(el("span", null, N.ket));
    ben.appendChild(kq);
    ben.appendChild(nut(N.lai, "btn btn-yt", () => { Object.assign(TT, { i: 0, chon: [], da: false, gon: 0 }); batThuThach(); }));
    return;
  }
  ben.appendChild(el("p", "cb-nho", N.thu_thach + " " + (TT.i + 1) + "/" + D.thu_thach.length + " · " + D.thoi_tiet[c.thoi_tiet]));
  ben.appendChild(el("p", "cb-de", c.de));
  ben.appendChild(el("p", "cb-nho", N.chon_cb));
  const h = el("div", "cb-chon-cb");
  ["lidar", "camera", "radar"].forEach((cb) => {
    const on = TT.chon.includes(cb);
    const b = nut(D.cb[cb].ten, "cb-chip" + (on ? " is-chon" : ""), () => {
      if (TT.da) return;
      TT.chon = on ? TT.chon.filter((x) => x !== cb) : TT.chon.concat(cb);
      veThuThach();
    });
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.disabled = TT.da;
    h.appendChild(b);
  });
  ben.appendChild(h);
  if (!TT.da) {
    const k = nut(N.kiem, "btn btn-yt", () => kiemTra());
    k.disabled = !TT.chon.length;
    ben.appendChild(k);
    return;
  }
  const du = (ds) => Object.entries(c.can).every(([k, m]) => ds.reduce((x, cb) => Math.max(x, D.muc[cb][k][c.thoi_tiet]), 0) >= m);
  const ok = du(TT.chon);
  let nho = 3;
  for (let mask = 1; mask < 8; mask++) {
    const ds = ["lidar", "camera", "radar"].filter((_, j) => mask & (1 << j));
    if (du(ds)) nho = Math.min(nho, ds.length);
  }
  const gon = ok && TT.chon.length === nho;
  const ph = el("div", "cb-phan-hoi " + (ok ? "is-dung" : "is-sai"));
  ph.appendChild(el("b", null, ok ? (gon ? N.dung_gon : N.dung_thua) : N.thieu));
  if (!ok) {
    const thieu = Object.entries(c.can).filter(([k, m]) => TT.chon.reduce((x, cb) => Math.max(x, D.muc[cb][k][c.thoi_tiet]), 0) < m).map(([k]) => D.thong_tin[k]);
    ph.appendChild(el("p", null, N.thieu_gi + ": " + thieu.join(", ")));
  }
  ph.appendChild(el("p", null, c.giai));
  ben.appendChild(ph);
  ben.appendChild(bangMuc(TT.chon, c.thoi_tiet));
  const sau = el("div", "cb-sau");
  sau.appendChild(nut(N.tiep + " ›", "btn btn-yt", () => { TT.i++; TT.chon = []; TT.da = false; batThuThach(); }));
  sau.appendChild(linkVideo(c.video));
  ben.appendChild(sau);
}
function kiemTra() {
  const c = D.thu_thach[TT.i];
  TT.da = true;
  const du = (ds) => Object.entries(c.can).every(([k, m]) => ds.reduce((x, cb) => Math.max(x, D.muc[cb][k][c.thoi_tiet]), 0) >= m);
  let nho = 3;
  for (let mask = 1; mask < 8; mask++) { const ds = ["lidar", "camera", "radar"].filter((_, j) => mask & (1 << j)); if (du(ds)) nho = Math.min(nho, ds.length); }
  if (du(TT.chon) && TT.chon.length === nho) TT.gon++;
  if (khu && khu.S) { khu.S.ghep = TT.chon.slice(); }
  do_("cam-bien-thu-thach", { ca: c.id, ket: du(TT.chon) ? "du" : "thieu" });
  if (TT.i === D.thu_thach.length - 1) { do_("cam-bien-xong", { gon: String(TT.gon) }); do_("hoc-xong", { loai: "cam-bien" }); }
  veThuThach();
}
function batThuThach() {
  const c = D.thu_thach[TT.i];
  if (khu && khu.S && c) { khu.S.tt = c.thoi_tiet; khu.S.nhin = "mat"; khu.S.ghep = null; khu.apDung(); datCam(); }
  veThuThach();
}

function doiTab(k) {
  tab = k;
  document.querySelectorAll(".cb-tab").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === k ? "true" : "false"));
  khu = dungKhu(k);
  coGian(); // cảnh mới dựng cần đúng tỉ lệ khung
  lop.innerHTML = "";
  if (khu) datControls(khu.camera, khu);
  if (k === "mo-xe" || k === "do-sang") { if (khu) khu.veBen(); else veKhongCo3D(k); }
  else if (k === "con-pho") { if (khu) { khu.S.ghep = null; if (khu.S.nhin === "mat" && !khu.S.daMo) { khu.S.nhin = "camera"; } khu.S.daMo = true; khu.apDung(); datCam(); } veConPho(); }
  else batThuThach();
  do_("cam-bien-tab", { tab: k });
}
function veKhongCo3D(k) {
  ben.innerHTML = "";
  if (k === "mo-xe") {
    ["lidar", "camera", "radar"].forEach((cb) => {
      const c = D.cb[cb];
      const the = el("div", "cb-the");
      the.appendChild(el("b", null, c.ten));
      the.appendChild(el("p", null, c.mo_ta));
      const ul = el("ul", "cb-ds");
      c.bo_phan.forEach((b) => { const li = el("li"); li.appendChild(el("b", null, b.ten + ": ")); li.appendChild(document.createTextNode(b.chu)); ul.appendChild(li); });
      the.appendChild(ul);
      ben.appendChild(the);
    });
  } else {
    ben.appendChild(el("p", "cb-cong-thuc", N.cong_thuc));
    ben.appendChild(linkVideo(D.cb.lidar.video));
  }
}
document.querySelectorAll(".cb-tab").forEach((b) => b.addEventListener("click", () => doiTab(b.dataset.tab)));
document.querySelector(".cb-tabs").addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const ds = [...document.querySelectorAll(".cb-tab")];
  const i = ds.findIndex((b) => b.dataset.tab === tab);
  const j = (i + (e.key === "ArrowRight" ? 1 : ds.length - 1)) % ds.length;
  ds[j].focus(); doiTab(ds[j].dataset.tab);
});

// chạm để chọn bộ phận (chỉ khi không kéo xoay)
let xuong = null;
canvas.addEventListener("pointerdown", (e) => { xuong = [e.clientX, e.clientY]; });
canvas.addEventListener("pointerup", (e) => {
  if (!xuong || !khu || !khu.cham) return;
  if (Math.hypot(e.clientX - xuong[0], e.clientY - xuong[1]) < 6) khu.cham(e.clientX, e.clientY);
  xuong = null;
});

// vẽ: chỉ khi khung đang hiện trên màn hình và tab trình duyệt đang mở
let hien = true;
if ("IntersectionObserver" in window) new IntersectionObserver((ds) => { hien = ds[0].isIntersecting; }).observe(san);
function coGian() {
  if (!renderer) return;
  const w = san.clientWidth, h = san.clientHeight;
  renderer.setSize(w, h, false);
  Object.values(KHU).forEach((k) => { [k.camera, k.camXe].forEach((c) => { if (c) { c.userData.fov = c.userData.fov || c.fov; c.aspect = w / h;
    c.fov = w < h && c !== k.camXe ? c.userData.fov * 1.5 : c.userData.fov; // khung dọc trên điện thoại: lùi xa hơn để thấy trọn mô hình
    c.updateProjectionMatrix(); } }); });
}
if (renderer) {
  new ResizeObserver(coGian).observe(san);
  const dong = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(dong.getDelta(), 0.05), t = dong.elapsedTime;
    if (!hien || document.hidden || !khu) return;
    if (controls && controls.enabled) controls.update();
    khu.update(dt, t);
    const cam = khu.S && khu.S.nhin === "camera" ? khu.camXe : khu.camera;
    renderer.render(khu.scene, cam);
  });
  // đổi nền sáng / tối của trang thì đổi nền cảnh 1, 2
  new MutationObserver(() => { ["mo-xe", "do-sang"].forEach((k) => { if (KHU[k]) KHU[k].scene.background = mauNen(); }); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
doiTab("mo-xe");
coGian();
window.__cb = { D, KHU, TT, doiTab };

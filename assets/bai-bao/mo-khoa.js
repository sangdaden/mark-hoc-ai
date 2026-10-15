/* Bài báo AI: đếm ngược tới ngày mở và mở sớm bằng đáp án trong video (Sang chốt 15/10/2026).
   Dữ liệu do scripts/tao_bai_bao.py ghi vào #bb-du-lieu: thân bài mã hoá AES-GCM bằng một khoá nội dung,
   khoá đó được bọc bằng khoá PBKDF2 suy ra từ từng đáp án đúng (đã chuẩn hoá). Chuẩn hoá phải giống chuan_hoa() trong script. */
(function () {
  var du = document.getElementById("bb-du-lieu"), chu = document.getElementById("bb-chu");
  if (!du || !chu) return;
  var D = JSON.parse(du.textContent), C = JSON.parse(chu.textContent);
  var than = document.getElementById("than"), khoa = document.getElementById("khoa");
  var form = khoa.querySelector(".bb-form"), bao = khoa.querySelector(".bb-bao"), o = khoa.querySelector("input");
  var dem = khoa.querySelector(".bb-dem");
  var NHO = "bb-mo-" + D.slug;
  var do_ = function (ten, d) { if (window.mhaiDo) window.mhaiDo(ten, Object.assign({ bai: D.slug }, d || {})); };
  var tu64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  var sang64 = function (b) { return btoa(String.fromCharCode.apply(null, new Uint8Array(b))); };

  function chuanHoa(s) {
    return s.toLowerCase().normalize("NFD").replace(/đ/g, "d").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  }

  function demNguoc() {
    var con = new Date(D.mo_luc) - new Date();
    if (con <= 0) { dem.textContent = C.dang_mo; return; }
    var n = Math.floor(con / 864e5), g = Math.floor(con / 36e5) % 24, p = Math.floor(con / 6e4) % 60;
    dem.innerHTML = C.con + " <b>" + n + "</b> " + C.ngay + " <b>" + g + "</b> " + C.gio + " <b>" + p + "</b> " + C.phut;
  }
  demNguoc();
  setInterval(demNguoc, 30000);

  function moBai(khoaTho) {
    return crypto.subtle.importKey("raw", khoaTho, "AES-GCM", false, ["decrypt"]).then(function (k) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: tu64(D.iv) }, k, tu64(D.ct));
    }).then(function (b) {
      than.innerHTML = new TextDecoder().decode(b);
      than.hidden = false;
      form.hidden = true;
      dem.hidden = true;
      try { localStorage.setItem(NHO, sang64(khoaTho)); } catch (e) {}
    });
  }

  function thuDapAn(da) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(da), "PBKDF2", false, ["deriveKey"]).then(function (goc) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: tu64(D.muoi), iterations: D.lap, hash: "SHA-256" },
        goc, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    }).then(function (k) {
      return D.boc.reduce(function (p, w) {
        return p.catch(function () { return crypto.subtle.decrypt({ name: "AES-GCM", iv: tu64(w.iv) }, k, tu64(w.ct)); });
      }, Promise.reject());
    });
  }

  if (!window.crypto || !crypto.subtle) { bao.textContent = C.loi; form.querySelector("button").disabled = true; return; }

  var daNho = null;
  try { daNho = localStorage.getItem(NHO); } catch (e) {}
  if (daNho) moBai(tu64(daNho).buffer).catch(function () { try { localStorage.removeItem(NHO); } catch (e) {} });
  do_("bai-bao-he-lo");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var da = chuanHoa(o.value);
    if (!da) return;
    form.querySelector("button").disabled = true;
    thuDapAn(da).then(moBai).then(function () {
      bao.textContent = C.dung;
      khoa.classList.add("bb-da-mo");
      do_("bai-bao-mo-som");
    }).catch(function () {
      bao.textContent = C.sai;
      o.select();
      do_("bai-bao-thu-sai");
    }).then(function () { form.querySelector("button").disabled = false; });
  });
})();

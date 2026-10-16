// Trang bài viết: nút YouTube và ngày theo lịch ra mắt + trình phát YouTube kiểu "lite" + nút "Sao chép prompt" + chia sẻ bài
(function () {
  var EN = document.documentElement.lang === "en";
  var THANG = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Gốc trang web lấy từ đường dẫn của chính file này (bài tiếng Anh nằm sâu hơn một cấp: en/bai/)
  var me = document.currentScript;
  var goc = me ? me.src.replace(/bai-viet\.js.*$/, "") : "../";
  // Hôm nay theo giờ Việt Nam; ?hom-nay=YYYY-MM-DD để thử
  var q = new URLSearchParams(location.search).get("hom-nay");
  var homNay = /^\d{4}-\d{2}-\d{2}$/.test(q || "") ? q
    : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

  // Video chưa tới ngày: nút thành link kênh, kèm ghi chú "Video ra mắt dd/mm"
  fetch(goc + "data/lich-ra-mat.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (lich) {
    document.querySelectorAll("a.btn-yt[data-so]").forEach(function (a) {
      var d = lich[a.dataset.so] || a.dataset.ngay;  // tập phụ (5.1...) ghi ngày ra mắt ngay trên nút
      if (!d || d <= homNay) return;
      a.href = a.dataset.kenh;
      a.textContent = EN ? "Follow on YouTube" : "Theo dõi kênh YouTube";
      var note = a.nextElementSibling;
      if (!note || !note.classList.contains("soon-note")) {
        note = document.createElement("span");
        note.className = "soon-note";
        a.after(note);
      }
      note.textContent = EN ? "Video out " + THANG[+d.slice(5, 7) - 1] + " " + (+d.slice(8, 10)) : "Video ra mắt " + d.slice(8, 10) + "/" + d.slice(5, 7);
    });
    // Ngày trên đầu bài: chưa tới ngày thì ghi "Ra mắt" thay cho "Lên kênh"
    document.querySelectorAll("time.ngay-dang").forEach(function (el) {
      if (el.getAttribute("datetime") > homNay) el.textContent = el.textContent.replace(EN ? "Published" : "Lên kênh", EN ? "Coming" : "Ra mắt");
    });
  }).catch(function () {});

  // Trình phát YouTube (video đã đăng, data/youtube-id.json): bấm ảnh bìa mới tải iframe youtube-nocookie.
  // Không tự phát khi mở trang: YouTube chỉ tính lượt xem khi người xem tự bấm phát.
  // Không chạy được JS thì nút phát vẫn là link mở YouTube.
  document.querySelectorAll(".yt-lite[data-yt]").forEach(function (fig) {
    var nut = fig.querySelector(".yt-play");
    if (!nut) return;
    nut.addEventListener("click", function (e) {
      e.preventDefault();
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(fig.dataset.yt) + "?autoplay=1&rel=0&playsinline=1";
      f.title = fig.dataset.tieuDe || "YouTube";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      fig.appendChild(f);
      nut.remove();
      if (window.mhaiDo) window.mhaiDo("phat-video", { yt: fig.dataset.yt });
      f.focus();
    });
  });

  // Khối "Xem 60 giây, thử 60 giây" (trang bài có trò chơi): bấm "Chơi ngay ở đây" thì tải trang trò chơi vào iframe (?nhung=1,
  // trang đó tự ẩn đầu/chân trang) và mở rộng tràn chiều ngang web; iframe cao theo nội dung nên không có thanh cuộn thứ hai.
  var kc = document.querySelector(".xem-choi");
  if (kc) {
    var oChoi = kc.querySelector(".xc-choi"), nutDong = kc.querySelector(".xc-dong"), nutLai = kc.querySelector(".xc-lai"), khung = null;
    var muot = matchMedia("(prefers-reduced-motion: no-preference)").matches ? "smooth" : "auto";
    var moChoi = function (e) {
      if (e) e.preventDefault();
      if (!khung) {
        khung = document.createElement("iframe");
        khung.className = "xc-khung";
        khung.title = oChoi.dataset.ten || "";
        khung.src = oChoi.dataset.url + (oChoi.dataset.url.indexOf("?") < 0 ? "?" : "&") + "nhung=1";
        khung.addEventListener("load", function () {
          try {
            var d = khung.contentDocument, m = d.querySelector("main") || d.body;
            var b = d.createElement("base"); b.target = "_top"; d.head.appendChild(b);  // link trong trò chơi mở ở cả trang
            var cao = function () { khung.style.height = Math.ceil(m.getBoundingClientRect().height + 24) + "px"; };
            cao();
            if (window.ResizeObserver) new ResizeObserver(cao).observe(m);
          } catch (x) {}
        });
        nutDong.before(khung);
      }
      khung.hidden = false;
      kc.classList.add("mo");
      nutDong.hidden = false;
      if (nutLai) nutLai.hidden = false;
      kc.scrollIntoView({ behavior: muot, block: "start" });
      if (window.mhaiDo) window.mhaiDo("mo-tro-choi", { tro: oChoi.dataset.url });
    };
    var thuGon = function () {
      kc.classList.remove("mo");
      if (khung) khung.hidden = true;
      nutDong.hidden = true;
      if (nutLai) nutLai.hidden = true;
      kc.scrollIntoView({ behavior: muot, block: "start" });
    };
    kc.querySelector(".xc-mo").addEventListener("click", moChoi);
    document.querySelectorAll("[data-mo-choi]").forEach(function (a) { a.addEventListener("click", moChoi); });
    nutDong.addEventListener("click", thuGon);
    if (nutLai) nutLai.addEventListener("click", thuGon);
  }

  // Chép prompt: clipboard API, không được thì dùng textarea + execCommand
  function chep(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, loi) {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var xong = false;
      try { xong = document.execCommand("copy"); } catch (e) {}
      t.remove();
      xong ? ok() : loi();
    });
  }
  // Chia sẻ cuối bài: nút chia sẻ của máy (chỉ hiện khi trình duyệt có), nút chép link
  var nutChiaSe = document.querySelector("[data-chia-se]");
  if (nutChiaSe && navigator.share) {
    nutChiaSe.hidden = false;
    nutChiaSe.addEventListener("click", function () {
      navigator.share({ title: nutChiaSe.dataset.tieuDe, url: nutChiaSe.dataset.url }).catch(function () {});
    });
  }
  document.querySelectorAll("[data-chep-link]").forEach(function (b) {
    b.hidden = false;
    var goc = b.innerHTML, hen;
    b.addEventListener("click", function () {
      chep(b.dataset.chepLink).then(function () {
        b.innerHTML = goc.replace(/#i-link/, "#i-check").replace(/<\/svg>[\s\S]*$/, "</svg>") + (EN ? "Link copied" : "Đã chép link");
      }, function () {
        b.textContent = b.dataset.chepLink;
      }).then(function () {
        clearTimeout(hen);
        hen = setTimeout(function () { b.innerHTML = goc; }, 2000);
      });
    });
  });

  document.querySelectorAll("[data-chep]").forEach(function (b) {
    var nguon = document.getElementById(b.dataset.chep);
    if (!nguon) return;
    b.hidden = false;
    var goc = b.innerHTML, hen;
    b.addEventListener("click", function () {
      chep(nguon.textContent.trim()).then(function () {
        b.innerHTML = goc.replace(/#i-copy/, "#i-check").replace(/<\/svg>[\s\S]*$/, "</svg>") + (EN ? "Copied" : "Đã chép");
      }, function () {
        b.textContent = EN ? "Couldn't copy, select the text to copy it" : "Chưa chép được, hãy bôi đen để chép";
      }).then(function () {
        clearTimeout(hen);
        hen = setTimeout(function () { b.innerHTML = goc; }, 2000);
      });
    });
  });
})();

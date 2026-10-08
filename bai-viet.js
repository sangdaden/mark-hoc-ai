// Trang bài viết: nút YouTube theo lịch ra mắt + nút "Sao chép prompt"
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
      var d = lich[a.dataset.so];
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
  }).catch(function () {});

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
  document.querySelectorAll("[data-chep]").forEach(function (b) {
    var nguon = document.getElementById(b.dataset.chep);
    if (!nguon) return;
    b.hidden = false;
    var goc = b.textContent, hen;
    b.addEventListener("click", function () {
      chep(nguon.textContent.trim()).then(function () {
        b.textContent = EN ? "Copied ✓" : "Đã chép ✓";
      }, function () {
        b.textContent = EN ? "Couldn't copy, select the text to copy it" : "Chưa chép được, hãy bôi đen để chép";
      }).then(function () {
        clearTimeout(hen);
        hen = setTimeout(function () { b.textContent = goc; }, 2000);
      });
    });
  });
})();

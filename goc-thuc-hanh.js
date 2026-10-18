// Góc thực hành (thuc-hanh.html): dấu "Đã mở" trên từng trò chơi và số trạm đã làm của 3 trang theo nghề, đọc từ tien-do.js.
(function () {
  var TD = window.mhaiTD;
  if (!TD) return;
  var EN = document.documentElement.lang === "en";
  var mo = TD.daMo();
  [].slice.call(document.querySelectorAll(".gth-the[data-mo]")).forEach(function (a) {
    if (mo.indexOf(a.dataset.mo) >= 0) { a.classList.add("is-mo"); a.querySelector(".gth-da").hidden = false; }
  });
  [].slice.call(document.querySelectorAll(".gth-nghe[data-trang]")).forEach(function (a) {
    var tong = +a.dataset.tong, xong = Math.min(tong, Object.keys(TD.tramCua(a.dataset.trang)).length);
    if (!xong) return;
    a.querySelector(".gth-thanh i").style.width = (xong / tong * 100) + "%";
    a.querySelector(".gth-so").textContent = EN ? xong + "/" + tong + " stations done" : "Đã làm " + xong + "/" + tong + " trạm";
    a.classList.toggle("is-xong", xong >= tong);
  });
})();

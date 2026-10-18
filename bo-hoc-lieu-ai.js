// Bộ học liệu AI 12 tiết (bo-hoc-lieu-ai.html): nút "In tiết này" chỉ in phần của tiết đó; mở thẳng một tiết bằng #tiet-thcs-5.
(function () {
  "use strict";
  var goc = document.getElementById("hl");
  if (!goc) return;
  [].slice.call(goc.querySelectorAll("[data-in-tiet]")).forEach(function (b) {
    b.addEventListener("click", function () {
      var vung = document.getElementById(b.getAttribute("data-in-tiet"));
      if (!vung) return;
      document.documentElement.classList.add("hl-dang-in");
      vung.classList.add("hl-in-day");
      var bo = function () { document.documentElement.classList.remove("hl-dang-in"); vung.classList.remove("hl-in-day"); window.removeEventListener("afterprint", bo); };
      window.addEventListener("afterprint", bo);
      if (window.mhaiDo) window.mhaiDo("in-tiet", { tiet: b.getAttribute("data-in-tiet") });
      window.print();
    });
  });
  var h = location.hash.slice(1), the = h && document.getElementById(h);
  if (the && the.querySelector("details")) { the.querySelector("details").open = true; try { the.scrollIntoView(); } catch (e) {} }
})();

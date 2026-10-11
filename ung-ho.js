/* Trang Ủng hộ kênh: nút chép số tài khoản / nội dung, tên chủ tài khoản và danh sách người ủng hộ từ data/ung-ho.json (sửa tay). */
(function () {
  var goc = /\/en\//.test(location.pathname) ? "../" : "";

  document.querySelectorAll(".uh-copy").forEach(function (nut) {
    var nhan = nut.querySelector("span"), cu = nhan.textContent;
    nut.addEventListener("click", function () {
      var xong = function () {
        nhan.textContent = nut.dataset.xong;
        setTimeout(function () { nhan.textContent = cu; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(nut.dataset.chep).then(xong, function () {});
    });
  });

  fetch(goc + "data/ung-ho.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (d) {
    if (d.chu_tai_khoan) document.getElementById("uh-chu").textContent = d.chu_tai_khoan;
    var ds = d.nguoi_ung_ho || [], ul = document.getElementById("uh-ten");
    if (!ds.length) return;
    ds.forEach(function (n) {
      var li = document.createElement("li"), b = document.createElement("b");
      b.textContent = (n.ten || "").trim() || ul.dataset.anDanh;
      li.appendChild(b);
      if (n.loi_nhan) {
        var p = document.createElement("span");
        p.textContent = n.loi_nhan;
        li.appendChild(p);
      }
      ul.appendChild(li);
    });
    ul.hidden = false;
    document.getElementById("uh-trong").hidden = true;
  }).catch(function () {});
})();

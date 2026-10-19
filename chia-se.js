/* Thẻ "Gửi cho bố mẹ" cuối các trò chống lừa đảo (Sang chọn W2, 19/10/2026).
   Tập 14 lan đi nhờ câu "gửi cho bố mẹ", nên cuối trò có một thẻ kết quả kèm nút gửi.
   Trò gọi window.mhaiChiaSe(khung, { tro: "lua-dao", diem: "9/13" }) lúc hiện kết quả; gọi lại thì thẻ cũ được thay.
   Nút "Gửi qua Zalo": điện thoại có bảng chia sẻ (navigator.share) thì mở bảng đó, Zalo nằm trong bảng; không có thì chép link để dán vào Zalo.
   Link gửi đi có utm_source=chia-se để biết bao nhiêu người quay lại từ lượt gửi. Không lưu gì trên máy. */
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var S = EN ? {
    h: "Send this to your parents", chu: function (d, ten) { return "I scored " + d + " in “" + ten + "” on Mark học AI. Your turn, it takes 2 minutes:"; },
    zalo: "Send by message", fb: "Facebook", chep: "Copy link", daChep: "Copied. Open Zalo or Messenger and paste it to your parents.",
    chepTay: "Copy this and send it: ", meo: "Scammers now fake voices and faces. One game today can save your family a lot."
  } : {
    h: "Gửi bài này cho bố mẹ", chu: function (d, ten) { return "Mình được " + d + " điểm trong trò “" + ten + "” trên Mark học AI. Bố mẹ thử xem được mấy điểm, chỉ mất 2 phút:"; },
    zalo: "Gửi qua Zalo", fb: "Facebook", chep: "Chép link", daChep: "Đã chép. Mở Zalo và dán vào tin nhắn cho bố mẹ nhé.",
    chepTay: "Chép đoạn này rồi gửi đi: ", meo: "Kẻ gian giờ giả được cả giọng lẫn mặt. Một trò chơi hôm nay có thể giúp cả nhà tránh mất tiền."
  };
  var TEN = {
    "lua-dao": EN ? "Scam or real?" : "Lừa đảo hay thật?",
    "cuoc-goi": EN ? "The fake-voice call" : "Cuộc gọi giả giọng",
    "dan-hay-khong": EN ? "Paste or don't paste?" : "Dán hay không dán?"
  };
  function do_(ten, d) { if (window.mhaiDo) window.mhaiDo(ten, d); }
  function link(tro, kenh) {
    var u = location.origin + location.pathname;
    return u + "?utm_source=chia-se&utm_medium=" + kenh + "&utm_campaign=" + tro;
  }
  function chep(chu) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(chu);
    return new Promise(function (ok, loi) {
      var t = document.createElement("textarea");
      t.value = chu; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var xong = false;
      try { xong = document.execCommand("copy"); } catch (e) {}
      t.remove();
      xong ? ok() : loi();
    });
  }
  window.mhaiChiaSe = function (khung, o) {
    if (!khung) return;
    var cu = khung.querySelector(".cs-ket");
    if (cu) cu.remove();
    var ten = TEN[o.tro] || document.title;
    var chu = S.chu(o.diem, ten);
    var the = document.createElement("div");
    the.className = "cs-ket";
    the.innerHTML = '<p class="cs-h"></p><p class="cs-chu"></p><p class="cs-nut">' +
      '<button type="button" class="btn btn-yt" data-kenh="zalo"></button>' +
      '<a class="btn" data-kenh="facebook" target="_blank" rel="noopener"></a>' +
      '<button type="button" class="btn" data-kenh="chep"></button></p><p class="cs-bao" role="status"></p>';
    the.querySelector(".cs-h").textContent = S.h;
    the.querySelector(".cs-chu").textContent = S.meo;
    the.querySelector('[data-kenh="zalo"]').textContent = S.zalo;
    the.querySelector('[data-kenh="chep"]').textContent = S.chep;
    var fb = the.querySelector('[data-kenh="facebook"]');
    fb.textContent = S.fb;
    fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(link(o.tro, "facebook"));
    var bao = the.querySelector(".cs-bao");
    function chepGui(kenh) {
      var tat = chu + " " + link(o.tro, kenh);
      chep(tat).then(function () { bao.textContent = S.daChep; }, function () { bao.textContent = S.chepTay + tat; });
    }
    the.addEventListener("click", function (e) {
      var b = e.target.closest("[data-kenh]");
      if (!b) return;
      var kenh = b.dataset.kenh;
      do_("chia-se", { tro: o.tro, kenh: kenh });
      if (kenh === "zalo") {
        if (navigator.share) navigator.share({ title: ten, text: chu, url: link(o.tro, "zalo") }).catch(function () {});
        else chepGui("zalo");
      } else if (kenh === "chep") chepGui("chep");
    });
    // Đặt ngay dưới ô điểm (con đầu tiên của khung kết quả), trước phần ôn lại video
    khung.insertBefore(the, khung.firstElementChild ? khung.firstElementChild.nextSibling : null);
  };
})();

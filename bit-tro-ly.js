// Bit trợ lý: bay lơ lửng ở góc trái dưới, thỉnh thoảng nói gợi ý, bấm vào mở menu (Sang góp ý 8/10)
(function () {
  const me = document.currentScript;
  const goc = me ? me.src.replace(/bit-tro-ly\.js.*$/, "") : "";
  const hinh = ten => goc + "assets/bit-" + ten + ".svg";
  const duong = location.pathname;
  const trang = /\/bai\//.test(duong) ? "bai" : /tu-dien/.test(duong) ? "tu-dien" : /kiem-tra/.test(duong) ? "kiem-tra" : "chu";
  const nho = {
    get(k) { try { return sessionStorage.getItem("bit-" + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem("bit-" + k, v); } catch (e) {} }
  };

  // Lời gợi ý theo trang; mỗi trang nói tối đa 2 lần, tắt bóng thoại thì im cả phiên
  const loi = {
    chu: ["Chào bạn, mình là Bit 👋 Mới học AI? Bấm vào mình nhé!", "Có 50 prompt mẫu miễn phí đó, bấm mình để tải."],
    bai: ["Cuối bài có mẹo \"Thử ngay\", thử luôn cho nhớ nhé!", "Gặp chữ lạ? Mình tra Từ điển AI giúp bạn."],
    "tu-dien": ["Gõ chữ cần tra vào ô tìm kiếm, ví dụ \"token\".", "Hiểu chữ rồi thì thử bài kiểm tra 10 câu nhé!"],
    "kiem-tra": ["Đúng hay sai? Cứ chọn theo cảm giác, mình giải thích ngay.", "Làm xong, mình gợi ý video nên xem tiếp."]
  }[trang];
  const meo = [
    "Thêm câu \"Nếu không chắc, hãy nói không biết\" để AI bớt bịa.",
    "Chat quá dài? Xin AI tóm tắt 5 ý rồi mở cuộc chat mới.",
    "Prompt tốt có 4 mảnh: vai trò, bối cảnh, nhiệm vụ, định dạng.",
    "Câu hỏi khó thì thêm \"Hãy giải thích từng bước\".",
    "Dán 2, 3 mẫu bạn thích rồi bảo AI \"viết thêm đúng kiểu này\".",
    "Đừng dán mật khẩu, số thẻ hay giấy tờ tùy thân vào chatbot.",
    "Số liệu quan trọng: luôn xin AI nguồn để tự kiểm tra."
  ];
  const menu = [
    ["🧭", "Mới bắt đầu? Đi theo lộ trình", goc + "#bat-dau"],
    ["📖", "Tra Từ điển AI", goc + "tu-dien.html"],
    ["✅", "Kiểm tra: bạn hiểu AI tới đâu?", goc + "kiem-tra.html"],
    ["🎁", "Tải 50 prompt mẫu (PDF)", goc + "assets/50-prompt-mau.pdf"],
    ["🎬", "Xem danh sách video", goc + "#video"]
  ];

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hop = document.createElement("div");
  hop.className = "bit-tl";
  hop.innerHTML =
    '<div class="bit-noi" role="status" aria-live="polite" hidden><p></p><button class="bit-x" type="button" aria-label="Tắt gợi ý">×</button></div>' +
    '<div class="bit-menu" id="bit-menu" role="dialog" aria-label="Bit có thể giúp gì?" hidden>' +
    '<p class="bit-chao">Bit giúp gì được bạn?</p><ul>' +
    menu.map(m => '<li><a href="' + m[2] + '"' + (/\.pdf$/.test(m[2]) ? " download" : "") + '><span aria-hidden="true">' + m[0] + "</span>" + esc(m[1]) + "</a></li>").join("") +
    '</ul><div class="bit-meo"><b>Mẹo của Bit</b><p></p><button type="button" class="bit-meo-khac">Mẹo khác ›</button></div></div>' +
    '<button class="bit-nut" type="button" aria-label="Mở trợ lý Bit" aria-expanded="false" aria-controls="bit-menu"><img src="' + hinh("vui") + '" alt="" width="64" height="77"></button>';
  document.body.appendChild(hop);

  const nut = hop.querySelector(".bit-nut"), anh = nut.querySelector("img");
  const noi = hop.querySelector(".bit-noi"), noiChu = noi.querySelector("p");
  const bang = hop.querySelector(".bit-menu"), meoChu = hop.querySelector(".bit-meo p");
  let mat = "vui", soLanNoi = 0, henGio = 0;
  const doiMat = t => { if (t !== mat) { mat = t; anh.src = hinh(t); } };
  const meoMoi = () => { meoChu.textContent = meo[Math.floor(Math.random() * meo.length)]; };

  function noiCau(cau) {
    if (!bang.hidden || nho.get("im")) return;
    noiChu.textContent = cau;
    noi.hidden = false;
    doiMat("y-tuong");
    hop.classList.add("bit-nay");
    setTimeout(() => hop.classList.remove("bit-nay"), 700);
    clearTimeout(henGio);
    henGio = setTimeout(anNoi, 9000);
  }
  function anNoi() { noi.hidden = true; if (bang.hidden) doiMat("vui"); }
  function moMenu(mo) {
    bang.hidden = !mo;
    nut.setAttribute("aria-expanded", mo);
    if (mo) { anNoi(); meoMoi(); doiMat("giai-thich"); const a = bang.querySelector("a"); if (a) a.focus({ preventScroll: true }); }
    else doiMat("vui");
  }

  nut.addEventListener("click", () => moMenu(bang.hidden));
  noi.addEventListener("click", e => { if (e.target.closest(".bit-x")) { nho.set("im", "1"); anNoi(); } else moMenu(true); });
  hop.querySelector(".bit-meo-khac").addEventListener("click", meoMoi);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !bang.hidden) { moMenu(false); nut.focus(); } });
  document.addEventListener("click", e => { if (!bang.hidden && !hop.contains(e.target)) moMenu(false); });
  nut.addEventListener("mouseenter", () => { if (bang.hidden && noi.hidden) doiMat("nhay-mat"); });
  nut.addEventListener("mouseleave", () => { if (bang.hidden && noi.hidden) doiMat("vui"); });

  // Lần 1 sau 6 giây, lần 2 khi đã kéo xuống được nửa trang
  const noiLan = () => { if (soLanNoi < loi.length) noiCau(loi[soLanNoi++]); };
  setTimeout(noiLan, 6000);
  const khiCuon = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (soLanNoi === 1 && h > 0 && scrollY / h > 0.5) { noiLan(); removeEventListener("scroll", khiCuon); }
  };
  addEventListener("scroll", khiCuon, { passive: true });
})();

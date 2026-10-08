// Bit trợ lý: bay lơ lửng ở góc phải dưới (chỗ người dùng quen tìm trợ giúp, ngón cái dễ chạm; Sang chọn 8/10), thỉnh thoảng nói gợi ý, bấm vào mở menu (Sang góp ý 8/10)
(function () {
  const me = document.currentScript;
  const goc = me ? me.src.replace(/bit-tro-ly\.js.*$/, "") : "";
  const EN = document.documentElement.lang === "en";
  const nha = goc + (EN ? "en/" : ""); // trang chủ của ngôn ngữ đang xem
  const hinh = ten => goc + "assets/bit-" + ten + ".svg";
  const duong = location.pathname;
  const trang = /\/bai\//.test(duong) ? "bai" : /tu-dien/.test(duong) ? "tu-dien" : /kiem-tra/.test(duong) ? "kiem-tra" : "chu";
  const nho = {
    get(k) { try { return sessionStorage.getItem("bit-" + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem("bit-" + k, v); } catch (e) {} }
  };

  // Lời gợi ý theo trang; mỗi trang nói tối đa 2 lần, tắt bóng thoại thì im cả phiên
  const loi = (EN ? {
    chu: ["Hi, I'm Bit 👋 New to AI? Click me!", "There are 50 free sample prompts. Click me to download them."],
    bai: ["There's a \"Try it now\" tip at the end. Try it right away so it sticks!", "Found a strange word? I can look it up in the AI glossary."],
    "tu-dien": ["Type the word you want into the search box, like \"token\".", "Got the words? Now try the 10-question quiz!"],
    "kiem-tra": ["True or false? Go with your gut, I'll explain right away.", "When you finish, I'll suggest which videos to watch next."]
  } : {
    chu: ["Chào bạn, mình là Bit 👋 Mới học AI? Bấm vào mình nhé!", "Có 50 prompt mẫu miễn phí đó, bấm mình để tải."],
    bai: ["Cuối bài có mẹo \"Thử ngay\", thử luôn cho nhớ nhé!", "Gặp chữ lạ? Mình tra Từ điển AI giúp bạn."],
    "tu-dien": ["Gõ chữ cần tra vào ô tìm kiếm, ví dụ \"token\".", "Hiểu chữ rồi thì thử bài kiểm tra 10 câu nhé!"],
    "kiem-tra": ["Đúng hay sai? Cứ chọn theo cảm giác, mình giải thích ngay.", "Làm xong, mình gợi ý video nên xem tiếp."]
  })[trang];
  const meo = EN ? [
    "Add \"If you're not sure, say you don't know\" so AI makes up less.",
    "Chat getting too long? Ask AI for a 5-point summary, then start a new chat.",
    "A good prompt has 4 parts: role, context, task, format.",
    "For hard questions, add \"Explain step by step\".",
    "Paste 2 or 3 examples you like, then tell AI \"write more exactly like these\".",
    "Never paste passwords, card numbers or ID documents into a chatbot.",
    "For numbers that matter, always ask AI for sources so you can check.",
  ] : [
    "Thêm câu \"Nếu không chắc, hãy nói không biết\" để AI bớt bịa.",
    "Chat quá dài? Xin AI tóm tắt 5 ý rồi mở cuộc chat mới.",
    "Prompt tốt có 4 mảnh: vai trò, bối cảnh, nhiệm vụ, định dạng.",
    "Câu hỏi khó thì thêm \"Hãy giải thích từng bước\".",
    "Dán 2, 3 mẫu bạn thích rồi bảo AI \"viết thêm đúng kiểu này\".",
    "Đừng dán mật khẩu, số thẻ hay giấy tờ tùy thân vào chatbot.",
    "Số liệu quan trọng: luôn xin AI nguồn để tự kiểm tra."
  ];
  const menu = EN ? [
    ["compass", "New here? Follow the path", nha + "#bat-dau"],
    ["book-open", "Look it up in the AI glossary", nha + "tu-dien.html"],
    ["circle-check-big", "Quiz: how well do you know AI?", nha + "kiem-tra.html"],
    ["gift", "Download 50 sample prompts (PDF, in Vietnamese)", goc + "assets/50-prompt-mau.pdf"],
    ["clapperboard", "See the video list", nha + "#video"]
  ] : [
    ["compass", "Mới bắt đầu? Đi theo lộ trình", goc + "#bat-dau"],
    ["book-open", "Tra Từ điển AI", goc + "tu-dien.html"],
    ["circle-check-big", "Kiểm tra: bạn hiểu AI tới đâu?", goc + "kiem-tra.html"],
    ["gift", "Tải 50 prompt mẫu (PDF)", goc + "assets/50-prompt-mau.pdf"],
    ["clapperboard", "Xem danh sách video", goc + "#video"]
  ];
  const T = EN ? { tat: "Turn off tips", hoi: "How can Bit help?", chao: "How can Bit help you?", meo: "Bit's tip", khac: "Another tip ›", mo: "Open Bit the assistant" }
    : { tat: "Tắt gợi ý", hoi: "Bit có thể giúp gì?", chao: "Bit giúp gì được bạn?", meo: "Mẹo của Bit", khac: "Mẹo khác ›", mo: "Mở trợ lý Bit" };

  const ic = n => '<svg class="ic" aria-hidden="true"><use href="' + goc + 'assets/icons.svg#i-' + n + '"/></svg>';
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hop = document.createElement("div");
  hop.className = "bit-tl";
  hop.innerHTML =
    '<div class="bit-noi" role="status" aria-live="polite" hidden><p></p><button class="bit-x" type="button" aria-label="' + T.tat + '">' + ic("x") + '</button></div>' +
    '<div class="bit-menu" id="bit-menu" role="dialog" aria-label="' + T.hoi + '" hidden>' +
    '<p class="bit-chao">' + T.chao + '</p><ul>' +
    menu.map(m => '<li><a href="' + m[2] + '"' + (/\.pdf$/.test(m[2]) ? " download" : "") + '>' + ic(m[0]) + esc(m[1]) + "</a></li>").join("") +
    '</ul><div class="bit-meo"><b>' + ic("lightbulb") + T.meo + '</b><p></p><button type="button" class="bit-meo-khac">' + T.khac + '</button></div></div>' +
    '<button class="bit-nut" type="button" aria-label="' + T.mo + '" aria-expanded="false" aria-controls="bit-menu"><img src="' + hinh("vui") + '" alt="" width="64" height="77"></button>';
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
    hop.classList.remove("bit-lui");
    dangNoi();
    doiMat("y-tuong");
    hop.classList.add("bit-nay");
    setTimeout(() => hop.classList.remove("bit-nay"), 700);
    clearTimeout(henGio);
    henGio = setTimeout(anNoi, 9000);
  }
  // Bóng thoại / menu mọc lên trên Bit, đúng chỗ nút Đầu trang: lúc đó tạm ẩn nút ấy
  function dangNoi() { document.body.classList.toggle("bit-dang-noi", !noi.hidden || !bang.hidden); }
  function anNoi() { noi.hidden = true; if (bang.hidden) doiMat("vui"); dangNoi(); }
  function moMenu(mo) {
    bang.hidden = !mo;
    nut.setAttribute("aria-expanded", mo);
    if (mo) { anNoi(); meoMoi(); doiMat("giai-thich"); const a = bang.querySelector("a"); if (a) a.focus({ preventScroll: true }); }
    else doiMat("vui");
    dangNoi();
  }

  nut.addEventListener("click", () => moMenu(bang.hidden));
  noi.addEventListener("click", e => { if (e.target.closest(".bit-x")) { nho.set("im", "1"); anNoi(); } else moMenu(true); });
  hop.querySelector(".bit-meo-khac").addEventListener("click", meoMoi);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !bang.hidden) { moMenu(false); nut.focus(); } });
  document.addEventListener("click", e => { if (!bang.hidden && !hop.contains(e.target)) moMenu(false); });
  nut.addEventListener("mouseenter", () => { if (bang.hidden && noi.hidden) doiMat("nhay-mat"); });
  nut.addEventListener("mouseleave", () => { if (bang.hidden && noi.hidden) doiMat("vui"); });

  // Lần 1 sau 6 giây, lần 2 khi đã kéo xuống được nửa trang.
  // Điện thoại: lần 1 đợi tới khi đã kéo qua phần đầu trang để bóng thoại không che các nút ở hero
  const dt = matchMedia("(max-width: 760px)");
  const quaDau = () => !dt.matches || scrollY > innerHeight * 0.6;
  const noiLan = () => { if (soLanNoi < loi.length) noiCau(loi[soLanNoi++]); };
  let du6s = false;
  setTimeout(() => { du6s = true; if (quaDau()) noiLan(); }, 6000);
  const khiCuon = () => {
    if (soLanNoi === 0) { if (du6s && quaDau()) noiLan(); return; }
    const h = document.documentElement.scrollHeight - innerHeight;
    if (soLanNoi === 1 && h > 0 && scrollY / h > 0.5) { noiLan(); removeEventListener("scroll", khiCuon); }
  };
  addEventListener("scroll", khiCuon, { passive: true });

  // Điện thoại: đang kéo xuống thì Bit mờ và nhỏ lại cho đỡ che chữ, dừng hoặc kéo lên thì hiện lại
  let yTruoc = scrollY, henHien = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (dt.matches && y > yTruoc + 4 && bang.hidden && noi.hidden) hop.classList.add("bit-lui");
    else if (y < yTruoc) hop.classList.remove("bit-lui");
    yTruoc = y;
    clearTimeout(henHien);
    henHien = setTimeout(() => hop.classList.remove("bit-lui"), 700);
  }, { passive: true });
})();

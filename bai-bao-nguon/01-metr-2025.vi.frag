<section id="cau-hoi">
<h2>Câu hỏi của bài báo</h2>
<p>Các bài kiểm tra (benchmark) cho thấy AI viết code ngày càng giỏi. Nhưng benchmark giống một đề thi gọn gàng, còn việc thật thì lộn xộn: code viết từ nhiều năm trước, quy ước riêng của từng dự án, người duyệt code khó tính.</p>
<p class="bb-thesis">Với người đã rất giỏi, làm trên dự án họ thuộc lòng, AI (đầu năm 2025) giúp họ nhanh hơn bao nhiêu?</p>
</section>

<section id="thi-nghiem">
<h2>Thí nghiệm diễn ra thế nào</h2>
<p>METR dùng cách thử của y học khi thử thuốc: <b>thí nghiệm ngẫu nhiên có đối chứng</b> (RCT). Thay vì hỏi người ta thấy thế nào, họ bấm giờ.</p>
<ol class="bb-buoc">
<li><b>Chọn người.</b> 16 lập trình viên đã đóng góp nhiều năm cho các dự án mã nguồn mở lớn, được trả 150 USD mỗi giờ.</li>
<li><b>Chọn việc.</b> Chính họ liệt kê 246 việc thật cần làm cho dự án: sửa lỗi, thêm tính năng.</li>
<li><b>Tung đồng xu.</b> Mỗi việc được chia ngẫu nhiên: được dùng AI, hoặc không được dùng.</li>
<li><b>Công cụ.</b> Chủ yếu là Cursor với Claude 3.5 và 3.7 Sonnet, là bộ công cụ mạnh nhất lúc đó.</li>
<li><b>Đo.</b> Họ quay màn hình và ghi thời gian làm từng việc, từ tháng 2 đến tháng 6/2025.</li>
<li><b>Hỏi cảm nhận.</b> Trước khi làm, họ đoán AI sẽ giúp được bao nhiêu. Làm xong, họ được hỏi lại.</li>
</ol>
</section>

<section id="ket-qua">
<h2>Kết quả và cú sốc</h2>
<div class="bb-cot" role="img" aria-label="Đoán trước: nhanh hơn 24%. Tưởng sau khi làm: nhanh hơn 20%. Đo được: chậm hơn 19%.">
<div class="bb-cot-dong"><span>Đoán trước khi làm</span><i style="--w:24%" class="tot"></i><b>nhanh hơn 24%</b></div>
<div class="bb-cot-dong"><span>Tưởng sau khi làm</span><i style="--w:20%" class="tot"></i><b>nhanh hơn 20%</b></div>
<div class="bb-cot-dong"><span>Đồng hồ đo được</span><i style="--w:19%" class="xau"></i><b>chậm hơn 19%</b></div>
</div>
<p>Việc có AI tốn thời gian hơn 19%. Khoảng tin cậy nằm từ chậm hơn 2% đến chậm hơn 39%, tức là kể cả trường hợp tốt nhất vẫn chậm hơn. Điều lạ nhất là họ vẫn tin mình nhanh hơn: cảm giác và số đo lệch nhau gần 40 điểm phần trăm.</p>
</section>

<section id="vi-sao">
<h2>Vì sao lại chậm hơn</h2>
<p>METR xem xét nhiều yếu tố và cho rằng 5 yếu tố có thể đã góp phần:</p>
<div class="bb-the">
<div><b>Quá lạc quan</b><span>Người ta dùng AI cả khi tự làm nhanh hơn.</span></div>
<div><b>Quá thuộc dự án</b><span>Người càng rành việc thì AI càng ít có gì để giúp.</span></div>
<div><b>Dự án lớn, phức tạp</b><span>AI không nắm hết bối cảnh của một kho code lớn.</span></div>
<div><b>Chưa đủ chuẩn</b><span>Nhiều đoạn code AI viết không đạt chuẩn của dự án, phải bỏ đi hoặc sửa lại.</span></div>
<div><b>Luật ngầm</b><span>Nhiều quy ước chỉ có trong đầu người làm lâu năm.</span></div>
</div>
<p>Thời gian còn bị rò rỉ vào việc viết prompt, ngồi chờ AI trả lời và đọc lại code AI viết.</p>
</section>

<section id="kiem-chung">
<h2>Kiểm chứng: tin được đến đâu</h2>
<ul class="bb-ds">
<li><b>Điểm mạnh:</b> đây là thí nghiệm ngẫu nhiên trên việc thật, hiếm hơn nhiều so với các khảo sát cảm nhận.</li>
<li><b>Mẫu nhỏ:</b> chỉ có 16 người, đều là chuyên gia trên dự án quen thuộc. Kết quả không nói gì về người mới học, dự án mới tinh hay bản làm thử nhanh.</li>
<li><b>Công cụ đổi rất nhanh:</b> đầu năm 2025 chưa có các agent tự làm nhiều bước như bây giờ.</li>
<li><b>Chính tác giả tự sửa (24/2/2026):</b> đợt đo thứ hai từ 8/2025 có 57 người (10 người cũ, 47 người mới), hơn 800 việc trên 143 dự án. Ước tính mới nghiêng về phía nhanh hơn: nhóm cũ khoảng 18%, nhóm mới khoảng 4%. Nhưng khoảng tin cậy rộng, vẫn chạm sang phía chậm hơn.</li>
<li><b>Vì sao METR không tin hẳn số mới:</b> nhiều người từ chối tham gia hoặc giữ lại việc khó, vì không muốn làm mà thiếu AI. Mức trả công giảm từ 150 xuống 50 USD mỗi giờ. Ai còn ở lại thì không còn đại diện cho số đông, nên kết quả bị lệch (gọi là <i>selection bias</i>). Người chạy nhiều agent cùng lúc cũng khó bấm giờ cho đúng.</li>
</ul>
<p class="bb-thesis">Con số 19% đúng với người và công cụ đầu năm 2025. Bài học bền hơn con số: cảm giác nhanh và nhanh thật có thể khác nhau rất xa.</p>
</section>

<section id="danh-gia">
<h2>Đánh giá</h2>
<div class="bb-diem">
<div><span>Độ chắc của cách làm</span><b>Cao</b><small>RCT, việc thật, có bấm giờ</small></div>
<div><span>Áp dụng rộng ra</span><b>Thấp đến vừa</b><small>16 chuyên gia, công cụ đầu 2025</small></div>
<div><span>Giá trị lâu dài</span><b>Rất cao</b><small>Hiếm bài đo thay vì hỏi, và dám tự nhận đã cũ</small></div>
</div>
</section>

<section id="ap-dung">
<h2>Bài học áp dụng: tự đo xem AI có giúp bạn thật không</h2>
<ol class="bb-buoc">
<li><b>Chọn 10 việc giống nhau</b> mà bạn làm hằng tuần: viết email, làm báo cáo, sửa slide.</li>
<li><b>Tung đồng xu</b> cho từng việc: 5 việc dùng AI, 5 việc tự làm.</li>
<li><b>Ghi ra điều bạn đoán</b> trước khi bắt đầu: AI sẽ giúp nhanh hơn bao nhiêu?</li>
<li><b>Bấm giờ thật,</b> tính cả lúc viết prompt và lúc sửa kết quả của AI.</li>
<li><b>So số đo với điều bạn đoán.</b> Việc nào AI làm chậm hơn thì tự làm. Việc nào nhanh hơn thì lưu thành mẫu prompt để dùng lại.</li>
</ol>
</section>

<section id="nguon">
<h2>Nguồn</h2>
<ul class="bb-nguon">
<li>Becker, Rush, Barnes, Rein (METR), "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", 10/7/2025. <a href="https://arxiv.org/abs/2507.09089" target="_blank" rel="noopener">arXiv:2507.09089</a> · <a href="https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" target="_blank" rel="noopener">blog METR</a></li>
<li>METR, "We are Changing our Developer Productivity Experiment Design", 24/2/2026. <a href="https://metr.org/blog/2026-02-24-uplift-update/" target="_blank" rel="noopener">metr.org</a></li>
</ul>
</section>

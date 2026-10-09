"""Ngưỡng "video mới": ảnh riêng từng video (ảnh bìa, ảnh trong bài, trình phát YouTube, logo công cụ)
chỉ làm cho video có số >= VIDEO_MOI_TU. Sang chốt 9/10/2026: video 01-302 giữ nguyên dạng chữ như cũ,
nên các script tạo ảnh và tạo trang chỉ đọc ngưỡng ở đây (một chỗ duy nhất, đổi số này là đủ).
Trang (app.js, bai-viet.js) không có ngưỡng riêng: chỉ hiện ảnh khi data/anh.json, data/youtube-id.json có số video đó."""
VIDEO_MOI_TU = 303


def la_video_moi(so):
    return int(so) >= VIDEO_MOI_TU

# Trang riêng viết thành file riêng

`scripts/tao_bai_viet.py` chạy mọi file `scripts/trang/*.py` trong cùng không gian tên của nó,
nên trong file dùng thẳng được `trang()`, `t()`, `esc()`, `load()`, `ic()`, `header()`, `GOC`, `LG`...

Thêm một trò chơi hay công cụ mới mà không đụng chỗ chung nào:

1. `data/tro-choi/<tên>.json`: trò chơi gắn với video nào, tên, câu mời, hình xem trước
   (xem ghi chú đầu `scripts/tro_choi.py`).
2. `scripts/trang/<tên>.py`: hàm tạo trang, gắn `@trang_rieng("<tên>.html", "0.7")` là tự vào
   vòng tạo trang (VI + EN) và `sitemap.xml`. Hình xem trước mới đăng ký ở đây:
   `HINH_CHOI["<tên-hình>"] = lambda: '<span class="ct-hinh ...">...</span>'`.
3. CSS riêng của trang để ở file riêng (vd. `assets/tro-choi/<tên>.css`) và nạp trong trang đó,
   thay vì nối thêm vào cuối `style.css` (chỗ mọi PR cùng sửa).

Ví dụ khung `scripts/trang/vi-du.py`:

```python
@trang_rieng("vi-du.html", "0.7")
def tao_vi_du():
    p, q = t("", "../"), ""
    band = f"<h1>{t('Ví dụ', 'Example')}</h1>"
    main = '<main class="doc">...</main>'
    return GOC + "vi-du.html", trang("vi-du.html", t("Ví dụ | ", "Example | ") + SITE, "...", band, main, p, q=q)
```

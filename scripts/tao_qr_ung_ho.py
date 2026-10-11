"""Tạo mã VietQR (chuẩn NAPAS 247) cho trang Ủng hộ kênh.

Ảnh QR nằm sẵn trong repo (assets/ung-ho/), web không gọi dịch vụ QR nào khi chạy.
Chạy lại khi đổi số tài khoản hoặc nội dung chuyển khoản:
    python3 -m pip install segno
    python3 scripts/tao_qr_ung_ho.py
"""
from pathlib import Path

import segno

BIN = "970436"            # Vietcombank
TAI_KHOAN = "1021026372"
NOI_DUNG = "Ung ho Mark hoc AI"
GOC = Path(__file__).resolve().parent.parent


def truong(ma, gia_tri):
    return f"{ma}{len(gia_tri):02d}{gia_tri}"


def crc16(chuoi):
    crc = 0xFFFF
    for b in chuoi.encode():
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if crc & 0x8000 else crc << 1
            crc &= 0xFFFF
    return f"{crc:04X}"


def vietqr():
    nguoi_nhan = truong("00", BIN) + truong("01", TAI_KHOAN)
    tai_khoan = truong("00", "A000000727") + truong("01", nguoi_nhan) + truong("02", "QRIBFTTA")
    than = (truong("00", "01") + truong("01", "11") + truong("38", tai_khoan)
            + truong("53", "704") + truong("58", "VN") + truong("62", truong("08", NOI_DUNG)) + "6304")
    return than + crc16(than)


if __name__ == "__main__":
    du_lieu = vietqr()
    qr = segno.make(du_lieu, error="m", micro=False)
    ra = GOC / "assets" / "ung-ho"
    ra.mkdir(parents=True, exist_ok=True)
    qr.save(ra / "vietqr-vietcombank.svg", scale=8, border=3, dark="#0F172A", light="#FFFFFF", xmldecl=False, svgns=True)
    qr.save(ra / "vietqr-vietcombank.png", scale=12, border=3, dark="#0F172A", light="#FFFFFF")
    print(du_lieu)

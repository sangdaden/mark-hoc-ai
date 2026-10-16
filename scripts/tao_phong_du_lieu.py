"""Tạo số liệu cho Phòng thí nghiệm dữ liệu và robot (phong-thi-nghiem-du-lieu.html): data/phong-du-lieu/so-lieu.json.

Lấy đúng các con số các video 309, 346, 348, 362-364 dùng, từ thư mục thực hành của kênh (không nằm trong repo):
  - 309 (chọn biểu đồ): videos/309-chon-bieu-do/nguon/so-lieu.json
  - 346 (ngưỡng, precision, recall) và 348 (overfitting): chạy lại notebook hoc-may-tra-sua.ipynb
    (thuc-hanh-ml: tra-sua_T8-T9.xlsx + the-thanh-vien_T8-T9.csv), cần pandas, openpyxl, scikit-learn
  - 364 (A*): bản đồ robot tự vẽ, thuc-hanh-robotics/robot-tra-sua/ket-qua/ban-do-364.npy
  Trạm 362 (PID) và 363 (EKF) tính ngay trên trình duyệt (phong-du-lieu.js chép đúng công thức của robot/pid.py,
  robot/dinh_vi.py, robot/mo_phong.py), chỉ lấy số trong video để so.

  python3 scripts/tao_phong_du_lieu.py --videos /mnt/project-files/videos
"""
import argparse, json, sys
from pathlib import Path

import numpy as np
import pandas as pd

R = Path(__file__).resolve().parent.parent


def so_309(videos):
    d = json.loads((videos / "309-chon-bieu-do/nguon/so-lieu.json").read_text(encoding="utf-8"))
    tuan = [d["t8_tuan"][str(i)] for i in range(1, 5)] + [d["t9_tuan"][str(i)] for i in range(1, 5)]
    nhom = ["Milk Tea", "Coffee", "Tea", "Cake"]
    return {
        "nhom": {k: d["nhom"][k] for k in nhom},
        "ngay": [[k, v] for k, v in d["ngay"].items()],
        "tuan": [[x[k] for k in nhom] for x in tuan],
        "quan1": d["quan1"][:2], "quan1_giam": d["quan1"][2], "cat_truc": d["cat_truc"], "cat_ti_le": d["cat_ti_le"],
        "ngay_min": d["ngay_min"], "T8": d["T8"], "T9": d["T9"],
    }


def so_ml(ml):
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import precision_score, recall_score
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.tree import DecisionTreeClassifier

    # Giống hệt các ô của notebook hoc-may-tra-sua.ipynb (mục 1-6)
    df = pd.read_excel(ml / "tra-sua_T8-T9.xlsx")
    df = df.drop(index=[r - 2 for r in [232, 480, 903, 1089, 1166, 2222]])
    the = pd.read_csv(ml / "the-thanh-vien_T8-T9.csv")
    df = df.merge(the, on="Mã HĐ")
    tv = df.dropna(subset=["Mã KH"])
    t8 = tv[tv["Ngày"] <= "2026-08-31"]
    t9 = tv[tv["Ngày"] >= "2026-09-01"]
    t8 = t8.assign(tien_tra_sua=t8["Thành tiền"].where(t8["Món"].str.startswith("Trà sữa"), 0))
    X = t8.groupby("Mã KH").agg(so_lan=("Mã HĐ", "nunique"), tong_tien=("Thành tiền", "sum"), lan_cuoi=("Ngày", "max"),
                                tien_tra_sua=("tien_tra_sua", "sum"), chi_nhanh=("Chi nhánh", lambda s: s.mode()[0]))
    X["so_ngay_vang"] = (pd.Timestamp("2026-08-31") - X["lan_cuoi"]).dt.days
    X["ti_le_tra_sua"] = (X["tien_tra_sua"] / X["tong_tien"]).round(2)
    X = X.drop(columns=["lan_cuoi", "tien_tra_sua"])
    X = pd.get_dummies(X, columns=["chi_nhanh"], dtype=int)
    y = pd.Series(~X.index.isin(t9["Mã KH"]), index=X.index).astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
    model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
    p = model.predict_proba(X_test)[:, 1]
    for nguong, (n, pr, rc) in ((0.5, (12, 0.75, 0.43)), (0.3, (32, 0.53, 0.81))):  # số trong video 346
        d = (p >= nguong).astype(int)
        assert (d.sum(), round(precision_score(y_test, d), 2), round(recall_score(y_test, d), 2)) == (n, pr, rc), nguong
    khach = [{"ma": str(i).replace("KH", "C"), "p": round(float(pi), 4), "bo": int(yi), "lan": int(r.so_lan),
              "vang": int(r.so_ngay_vang), "ts": float(r.ti_le_tra_sua)}
             for i, pi, yi, r in zip(X_test.index, p, y_test, X_test.itertuples())]
    khach.sort(key=lambda k: -k["p"])

    cay = []
    for d in range(1, 14):
        c = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_train, y_train)
        cay.append({"sau": d, "la": int(c.get_n_leaves()), "hoc": round(c.score(X_train, y_train), 3), "thi": round(c.score(X_test, y_test), 3)})
    tu_do = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
    assert (tu_do.get_depth(), tu_do.get_n_leaves(), round(tu_do.score(X_test, y_test), 3)) == (13, 53, 0.559)  # video 348
    assert cay[-1]["thi"] == 0.559 and cay[-1]["hoc"] == 1.0
    lam_bua = round(float(1 - y_test.mean()), 3)
    return {"so_khach": len(X), "hoc": len(X_train), "thi": len(X_test), "doan_bua": lam_bua, "khach": khach}, {"cay": cay, "doan_bua": lam_bua}


def so_364(rb):
    sys.path.insert(0, str(rb))
    from robot.lap_ban_do import phan_loai
    from robot.ban_do import DOCK, DIEM_GIAO, VAT_CAN
    lo = np.load(rb / "ket-qua/ban-do-364.npy")
    co, trong, chua = phan_loai(lo)

    def hex_hang(g):  # mỗi hàng (y từ 0 lên) là một chuỗi hex 160 bit
        return ["%040x" % int("".join("1" if v else "0" for v in g[iy]), 2) for iy in range(g.shape[0])]
    return {"res": 0.05, "nx": int(co.shape[1]), "ny": int(co.shape[0]), "co": hex_hang(co), "chua": hex_hang(chua),
            "dock": list(DOCK[:2]), "ban": {str(k): list(v) for k, v in DIEM_GIAO.items()},
            "vat": [[ten, x0, y0, x1, y1] for ten, x0, y0, x1, y1 in VAT_CAN],
            "video": {"2": {"a": [3.25, 716], "d": [3.25, 2891]}, "6": {"a": [5.92, 620], "d": [5.92, 5126]}}}


def main():
    a = argparse.ArgumentParser()
    a.add_argument("--videos", default="/mnt/project-files/videos")
    v = Path(a.parse_args().videos)
    ml = v / "nhanh-ngoai-ai/thuc-hanh-ml"
    rb = v / "nhanh-ngoai-ai/thuc-hanh-robotics/robot-tra-sua"
    nguong, cay = so_ml(ml)
    out = {"_nguon": "scripts/tao_phong_du_lieu.py: số thật từ notebook và code thực hành của các video 309, 346, 348, 364. Chuỗi trà sữa và khách là dữ liệu giả lập để học.",
           "bieu_do": so_309(v), "nguong": nguong, "hoc_vet": cay, "ban_do": so_364(rb)}
    f = R / "data/phong-du-lieu/so-lieu.json"
    f.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f, f.stat().st_size, "byte")


if __name__ == "__main__":
    main()

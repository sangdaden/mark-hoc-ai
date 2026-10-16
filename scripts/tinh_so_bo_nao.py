"""Tính số thật cho Phòng thí nghiệm bộ não AI (chạy một lần trên máy có mạng tới huggingface.co).

Ra 3 file trong data/bo-nao/:
  attention.json   trọng số chú ý theo từ (mọi tầng, mọi đầu) cho các câu mẫu của tập 21
  tang.json        qua từng tầng, "nó" giống "mèo" hay "tường" bao nhiêu (cosine trạng thái ẩn)
  ban-do-nghia.json  vector nghĩa của danh sách chữ, hình chiếu 2D (PCA) và phép tính vua - đàn ông + phụ nữ

Cách chạy:
  python3 -m venv /tmp/bonao && /tmp/bonao/bin/pip install torch transformers numpy
  /tmp/bonao/bin/python scripts/tinh_so_bo_nao.py
"""
import json, os, sys, datetime
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel

RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "bo-nao")
os.makedirs(RA, exist_ok=True)

M_ATT = "bert-base-multilingual-cased"
M_EMB = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

CAU = {
    "vi-met": "Con mèo không nhảy qua bức tường vì nó quá mệt",
    "vi-cao": "Con mèo không nhảy qua bức tường vì nó quá cao",
    "en-tired": "The cat did not jump over the wall because it was too tired",
    "en-high": "The cat did not jump over the wall because it was too high",
}
DAI_TU = {"vi": "nó", "en": "it"}
MEO = {"vi": "mèo", "en": "cat"}
TUONG = {"vi": "tường", "en": "wall"}

def words_and_map(tok, text):
    words = text.split()
    enc = tok(words, is_split_into_words=True, return_tensors="pt")
    wid = enc.word_ids(0)
    return words, enc, wid

def gom_theo_tu(mat, wid, n):
    # mat: [T, T] trọng số giữa các mảnh. Hàng: trung bình các mảnh của từ nguồn. Cột: cộng các mảnh của từ đích.
    out = np.zeros((n, n))
    rows = [[i for i, w in enumerate(wid) if w == k] for k in range(n)]
    for a in range(n):
        r = mat[rows[a]].mean(axis=0)
        for b in range(n):
            out[a, b] = r[rows[b]].sum()
    s = out.sum(axis=1, keepdims=True); s[s == 0] = 1
    return out / s  # chuẩn hóa lại sau khi bỏ [CLS]/[SEP]

def phan_attention():
    tok = AutoTokenizer.from_pretrained(M_ATT)
    mdl = AutoModel.from_pretrained(M_ATT, output_attentions=True, output_hidden_states=True).eval()
    att, tang = {}, {}
    for key, text in CAU.items():
        lang = key[:2]
        words, enc, wid = words_and_map(tok, text)
        with torch.no_grad():
            out = mdl(**enc)
        n = len(words)
        layers = []
        for L in out.attentions:  # [1, heads, T, T]
            heads = [np.round(gom_theo_tu(L[0, h].numpy(), wid, n), 3).tolist() for h in range(L.shape[1])]
            layers.append(heads)
        att[key] = {"cau": text, "tu": words, "manh": tok.convert_ids_to_tokens(enc["input_ids"][0]),
                    "tang_dau": layers}
        # Qua từng tầng: cosine giữa trạng thái ẩn của "nó" và của "mèo"/"tường"
        i_no = words.index(DAI_TU[lang]); i_m = [i for i, w in enumerate(words) if w.startswith(MEO[lang])][0]
        i_t = [i for i, w in enumerate(words) if w.startswith(TUONG[lang])][0]
        def vec(h, i):
            idx = [k for k, w in enumerate(wid) if w == i]
            return h[0, idx].mean(0).numpy()
        rows = []
        for li, h in enumerate(out.hidden_states):
            a, m, t = vec(h, i_no), vec(h, i_m), vec(h, i_t)
            cos = lambda x, y: float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y)))
            rows.append({"tang": li, "giong_meo": round(cos(a, m), 4), "giong_tuong": round(cos(a, t), 4)})
        tang[key] = rows
    meta = {"model": M_ATT, "so_tang": mdl.config.num_hidden_layers, "so_dau": mdl.config.num_attention_heads,
            "ghi_chu": "Trọng số gom từ mảnh về từ: hàng lấy trung bình, cột cộng lại, bỏ [CLS]/[SEP] rồi chuẩn hóa mỗi hàng về tổng 1.",
            "tao_luc": datetime.datetime.utcnow().isoformat() + "Z"}
    json.dump({"meta": meta, "cau": att}, open(os.path.join(RA, "attention.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump({"meta": meta, "cau": tang}, open(os.path.join(RA, "tang.json"), "w"), ensure_ascii=False, indent=1)

TU = {
    "dong-vat": ["mèo", "chó", "thỏ", "gà", "cá", "chim", "cún", "voi", "hổ", "trâu"],
    "mon-an": ["phở", "bún", "cơm", "bánh mì", "hủ tiếu", "bánh xèo", "chè", "cà phê", "trà sữa", "pizza"],
    "xe": ["xe tải", "xe máy", "xe buýt", "ô tô", "xe đạp", "tàu hỏa", "máy bay", "thuyền"],
    "nguoi": ["vua", "nữ hoàng", "hoàng hậu", "đàn ông", "phụ nữ", "con trai", "con gái", "bố", "mẹ", "ông", "bà", "anh", "chị"],
    "nghe": ["bác sĩ", "giáo viên", "kỹ sư", "nông dân", "đầu bếp", "ca sĩ", "tài xế"],
    "thoi-tiet": ["mưa", "nắng", "bão", "tuyết", "gió"],
    "cam-xuc": ["vui", "buồn", "giận", "sợ", "yêu"],
    "cong-nghe": ["máy tính", "điện thoại", "trí tuệ nhân tạo", "robot", "internet"],
    "en": ["cat", "dog", "rabbit", "king", "queen", "man", "woman", "truck", "noodle soup", "coffee"],
}

def phan_ban_do():
    tok = AutoTokenizer.from_pretrained(M_EMB)
    mdl = AutoModel.from_pretrained(M_EMB).eval()
    items = [(w, g) for g, ws in TU.items() for w in ws]
    texts = [w for w, _ in items]
    enc = tok(texts, padding=True, return_tensors="pt")
    with torch.no_grad():
        h = mdl(**enc).last_hidden_state
    mask = enc["attention_mask"].unsqueeze(-1).float()
    v = ((h * mask).sum(1) / mask.sum(1)).numpy()
    v = v / np.linalg.norm(v, axis=1, keepdims=True)
    c = v - v.mean(0)
    _, _, vt = np.linalg.svd(c, full_matrices=False)
    xy = c @ vt[:2].T
    xy = (xy - xy.min(0)) / (xy.max(0) - xy.min(0))
    idx = {w: i for i, w in enumerate(texts)}
    def gan_nhat(q, bo=()):
        s = v @ (q / np.linalg.norm(q))
        order = [i for i in np.argsort(-s) if texts[i] not in bo]
        return [{"tu": texts[i], "giong": round(float(s[i]), 4)} for i in order[:5]]
    phep = {}
    for ten, (a, b, c2) in {"vi": ("vua", "đàn ông", "phụ nữ"), "en": ("king", "man", "woman")}.items():
        q = v[idx[a]] - v[idx[b]] + v[idx[c2]]
        phep[ten] = {"vao": [a, b, c2], "gan_nhat": gan_nhat(q, bo=(a, b, c2))}
    lang_gieng = {w: gan_nhat(v[idx[w]], bo=(w,))[:4] for w in texts}
    out = {"meta": {"model": M_EMB, "so_chieu": int(v.shape[1]),
                    "ghi_chu": "Vector câu (trung bình mảnh, chuẩn hóa). Hình chiếu 2D bằng PCA, chỉ gần đúng: khoảng cách thật tính trên đủ " + str(v.shape[1]) + " chiều.",
                    "tao_luc": datetime.datetime.utcnow().isoformat() + "Z"},
           "tu": [{"tu": w, "nhom": g, "x": round(float(xy[i, 0]), 4), "y": round(float(xy[i, 1]), 4),
                   "vec": np.round(v[i], 4).tolist()} for i, (w, g) in enumerate(items)],
           "phep_tinh": phep, "lang_gieng": lang_gieng}
    json.dump(out, open(os.path.join(RA, "ban-do-nghia.json"), "w"), ensure_ascii=False, separators=(",", ":"))

if __name__ == "__main__":
    torch.manual_seed(0)
    phan_attention(); print("attention.json, tang.json xong")
    phan_ban_do(); print("ban-do-nghia.json xong")
    for f in sorted(os.listdir(RA)):
        print(f, os.path.getsize(os.path.join(RA, f)), "bytes")

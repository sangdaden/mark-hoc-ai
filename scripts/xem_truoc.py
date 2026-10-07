"""Gộp trang thành một file HTML duy nhất (dữ liệu và ảnh nhúng sẵn) để xem trước."""
import base64, json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
html = (R / "index.html").read_text(encoding="utf-8")
body = html.split("<!--BODY-->")[1].split("<!--/BODY-->")[0]
head = re.search(r"<link rel=\"stylesheet\" href=\"https://fonts[^>]+>", html).group(0)
def img(m):
    p = R / m.group(1)
    mime = "image/svg+xml" if p.suffix == ".svg" else "image/png"
    return 'src="data:' + mime + ';base64,' + base64.b64encode(p.read_bytes()).decode() + '"'
body = re.sub(r'src="(assets/[^"]+)"', img, body)
data = {n: json.loads((R / "data" / f"{n}.json").read_text(encoding="utf-8")) for n in ("kenh", "series", "videos")}
out = ("<title>Mark học AI</title>\n" + head + "\n<style>\n" + (R / "style.css").read_text(encoding="utf-8") + "\n</style>\n" + body +
       "\n<script>window.__DATA = " + json.dumps(data, ensure_ascii=False) + ";</script>\n<script>\n" + (R / "app.js").read_text(encoding="utf-8") + "\n</script>\n")
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
print("ok", len(out))

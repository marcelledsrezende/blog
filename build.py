#!/usr/bin/env python3
"""Gera o blog "IBM por Marcelle Rezende" a partir da pasta content/.

Cada post é um arquivo em content/:
  - .md  com cabeçalho (front matter) entre linhas '---'
  - .docx (convertido para .md com pandoc na primeira execução)

Campos do cabeçalho: titulo, data (AAAA-MM-DD), produto, resumo, autor (opcional).

Uso:  python3 build.py
Saída: index.html e posts/<slug>.html
"""
import datetime as dt
import html
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

import markdown

ROOT = Path(__file__).parent
CONTENT = ROOT / "content"
POSTS = ROOT / "posts"
TEMPLATES = ROOT / "templates"

BLOG_NAME = "IBM por Marcelle Rezende"
BLOG_TAGLINE = "Notas práticas sobre os produtos da IBM: o que fazem, onde se encaixam e como começar."
DEFAULT_AUTHOR = "Marcelle Rezende"
MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "post"


def docx_to_md(path: Path) -> Path:
    """Converte um .docx em .md com cabeçalho mínimo e move o original para content/originais/."""
    md_path = path.with_suffix(".md")
    if md_path.exists():
        return md_path
    body = subprocess.run(
        ["pandoc", str(path), "-t", "gfm", "--wrap=none"],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    title = path.stem
    m = re.match(r"^#\s+(.+)\n+", body)
    if m:  # primeiro título do Word vira o título do post
        title, body = m.group(1).strip(), body[m.end():]
    header = (
        f"---\ntitulo: {title}\ndata: {dt.date.today().isoformat()}\n"
        f"produto: {path.stem}\nresumo: \n---\n\n"
    )
    md_path.write_text(header + body + "\n", encoding="utf-8")
    originals = CONTENT / "originais"
    originals.mkdir(exist_ok=True)
    shutil.move(str(path), originals / path.name)
    return md_path


def parse(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    meta, body = {}, raw
    m = re.match(r"^---\n(.*?)\n---\n", raw, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
        body = raw[m.end():]
    words = len(re.findall(r"\w+", body))
    data = dt.date.fromisoformat(meta.get("data") or dt.date.today().isoformat())
    return {
        "slug": slugify(path.stem),
        "titulo": meta.get("titulo") or path.stem,
        "data": data,
        "data_txt": f"{data.day:02d} {MESES[data.month - 1]} {data.year}",
        "produto": meta.get("produto", ""),
        "resumo": meta.get("resumo", ""),
        "autor": meta.get("autor") or DEFAULT_AUTHOR,
        "leitura": max(1, round(words / 200)),
        "html": markdown.markdown(body, extensions=["extra", "sane_lists", "toc"]),
    }


def render(template: str, **values) -> str:
    out = (TEMPLATES / template).read_text(encoding="utf-8")
    for k, v in values.items():
        out = out.replace("{{" + k + "}}", str(v))
    return out


def main() -> None:
    CONTENT.mkdir(exist_ok=True)
    POSTS.mkdir(exist_ok=True)
    for docx in CONTENT.glob("*.docx"):
        docx_to_md(docx)

    posts = sorted((parse(p) for p in CONTENT.glob("*.md")), key=lambda p: p["data"], reverse=True)
    esc = html.escape

    for old in POSTS.glob("*.html"):
        old.unlink()
    for p in posts:
        (POSTS / f"{p['slug']}.html").write_text(render(
            "post.html",
            blog=esc(BLOG_NAME), titulo=esc(p["titulo"]), resumo=esc(p["resumo"]),
            produto=esc(p["produto"]), autor=esc(p["autor"]), data=p["data"].isoformat(),
            data_txt=p["data_txt"], leitura=p["leitura"], conteudo=p["html"],
        ), encoding="utf-8")

    if posts:
        items = "\n".join(
            f'''<li class="entry">
  <a href="posts/{p['slug']}.html">
    <div class="entry-meta"><time datetime="{p['data'].isoformat()}">{p['data_txt']}</time>'''
            + (f'<span class="tag">{esc(p["produto"])}</span>' if p["produto"] else "")
            + f'''</div>
    <h2>{esc(p['titulo'])}</h2>'''
            + (f'\n    <p>{esc(p["resumo"])}</p>' if p["resumo"] else "")
            + f'''
    <span class="entry-more">Ler · {p['leitura']} min</span>
  </a>
</li>''' for p in posts)
        lista = f'<ol class="entries">\n{items}\n</ol>'
    else:
        lista = '<p class="empty">Nenhum post publicado ainda. O primeiro chega em breve.</p>'

    (ROOT / "index.html").write_text(render(
        "index.html", blog=esc(BLOG_NAME), tagline=esc(BLOG_TAGLINE),
        total=len(posts), lista=lista, ano=dt.date.today().year, autor=esc(DEFAULT_AUTHOR),
    ), encoding="utf-8")
    print(f"{len(posts)} post(s) gerado(s).")


if __name__ == "__main__":
    main()

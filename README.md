# IBM por Marcelle Rezende

Blog sobre produtos da IBM, publicado com GitHub Pages.

## Como um post é publicado

1. O texto é escrito em Word e salvo na pasta **blog** do Google Drive.
2. O Word vira um arquivo `.md` em `content/`, com este cabeçalho:

   ```
   ---
   titulo: Título do post
   data: 2026-10-30
   produto: Confluent
   resumo: Uma frase que aparece na home e abaixo do título.
   ---
   ```

   Um `.docx` colocado direto em `content/` também funciona: o `build.py` converte com pandoc e guarda o original em `content/originais/`.
3. `python3 build.py` gera `index.html` e `posts/<slug>.html` a partir de `templates/`.
4. Commit e push na branch `main`.

## Estrutura

- `content/` — textos dos posts
- `templates/` — layout da home e do post
- `assets/style.css` — visual (claro e escuro)
- `posts/` e `index.html` — páginas geradas, não editar à mão

# OQ-18 overflow measurement — all v2 units × ja/zh/en × 320/360/390

Metric: `document.documentElement.scrollWidth` vs `clientWidth` after load + `document.fonts.ready`, loaded at 390 then resized to 360 and 320 (Chromium, Playwright 1.60, headless). A figure that scrolls inside its own box does not count (it does not raise the page scrollWidth).

- before = `out/` built 2026-11-18 09:39 (HEAD abe7e4e4 textbook state; identical numbers to prod for the 3 pages, see shots/before-prod_*)
- after = local build with this change (+ the parallel practice/AppShell work in the same tree)
- rows: before 2196 (HTTP non-200: 0), after 2196 (non-200: 0)

## Pages over the viewport (count / pages measured)

| locale × width | before | after |
|---|---|---|
| ja 320 | 1/244 | 0/244 |
| ja 360 | 1/244 | 0/244 |
| ja 390 | 0/244 | 0/244 |
| zh 320 | 1/244 | 0/244 |
| zh 360 | 1/244 | 0/244 |
| zh 390 | 1/244 | 0/244 |
| en 320 | 3/244 | 0/244 |
| en 360 | 2/244 | 0/244 |
| en 390 | 1/244 | 0/244 |
| **total** | **11/2196** | **0/2196** |

## Every row that was over the viewport before

| unit | locale | width | before scrollWidth | after scrollWidth | cause |
|---|---|---|---|---|---|
| management-08-25-u03 | en | 390 | 401 | 390 | unit <h1> "Integration/Performance" (one unbreakable word at 26px) |
| management-08-25-u03 | en | 360 | 401 | 360 | unit <h1> "Integration/Performance" (one unbreakable word at 26px) |
| management-08-25-u03 | en | 320 | 401 | 320 | unit <h1> "Integration/Performance" (one unbreakable word at 26px) |
| technology-22-60-u02 | ja | 360 | 383 | 360 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | ja | 320 | 383 | 320 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | zh | 390 | 392 | 390 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | zh | 360 | 392 | 360 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | zh | 320 | 392 | 320 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | en | 360 | 387 | 360 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u02 | en | 320 | 387 | 320 | detail <p> (.prose) example URL https://www.example.ne.jp/news/top.html |
| technology-22-60-u04 | en | 320 | 333 | 320 | unit <h1> "Telecommunications" at 26px (320 only) |

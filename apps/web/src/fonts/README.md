# Self-hosted fonts (D-217 H1-5)

| Directory | Family | Weights | Files | Source | Licence |
|---|---|---|---|---|---|
| `biz/` | BIZ UDPGothic | 400, 700 | 248 woff2 (124 unicode-range slices per weight) | Google Fonts (`BIZ_UDPGothic` via `next/font/google`, 2026-11-11) | SIL OFL 1.1, Copyright 2022 The BIZ UDGothic Project Authors — `biz/OFL.txt` |
| `noto-sc/` | Noto Sans SC | 400, 700 | 101 woff2 (variable font, slices shared by both weights) | Google Fonts (`Noto_Sans_SC` via `next/font/google`, 2026-11-11) | SIL OFL 1.1, Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' — `noto-sc/OFL.txt` |

The OFL allows redistribution and bundling with software as long as the licence travels with the
fonts and the fonts are not sold on their own. The files are unmodified (Google's slices); the
rules in `fonts.css` are the ones `next/font/google` generated. `fonts.css` is imported once by
`src/app/[locale]/layout.tsx`; the bundler copies each file to `/_next/static/media/` under a
content hash.

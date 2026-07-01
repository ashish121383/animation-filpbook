# Premium AI Flipbook

React 19 + TypeScript single-page app (Vite 6) that turns an uploaded PDF into an
interactive flipbook with AI element detection (Web Worker), OCR (Tesseract.js),
and PDF.js rendering. There is a single frontend service — no backend.

## Cursor Cloud specific instructions

- Standard commands live in `package.json` scripts: `npm run dev` (Vite dev server,
  binds `0.0.0.0:5173` with `strictPort`), `npm run build` (`tsc -b && vite build`),
  `npm run lint` (ESLint), `npm run preview`.
- The dev server uses `strictPort: true` on 5173; if 5173 is already taken the
  server exits instead of picking another port. Free the port (or stop the existing
  dev process) rather than expecting a fallback.
- `pdfjs-dist` is intentionally excluded from Vite dep pre-bundling
  (`optimizeDeps.exclude` in `vite.config.ts`) and the PDF/analysis workers use ES
  module format. This is expected — don't "fix" it.
- Cloud OCR keys (`VITE_GOOGLE_VISION_API_KEY`, `VITE_AZURE_VISION_*`) are optional;
  Tesseract.js runs offline by default, so no secrets are needed to run or test.
- Manual/E2E testing requires a PDF to upload (welcome screen -> "Drop PDF here or
  click to browse" file input). There is no bundled sample; generate a throwaway PDF
  (e.g. write one to `/tmp/sample.pdf`) rather than committing test fixtures.
- Lint currently reports 1 pre-existing warning (`whiteCount` unused in
  `src/pdf/AIDetectionLayer.ts`) with 0 errors — that is the clean baseline.
- Known app behavior: shortly after the first page renders, a full-screen loading
  overlay (spinning cube) can reappear while background page analysis runs. This is
  existing application behavior, not an environment problem.

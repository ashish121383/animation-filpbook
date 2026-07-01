# Premium AI Flipbook

A production-ready AI-powered interactive PDF flipbook built with React 19, Vite, PDF.js, and page-flip. Transform any PDF into an intelligent digital magazine where every visual element is detected, layered, and animated independently.

## Features

### PDF Engine
- **PDF.js** rendering with text layer extraction
- **page-flip** realistic magazine page-turn animation (paper curl, shadows, spine depth)
- Cover page, back cover, and two-page spread support
- Responsive layout with portrait/landscape modes
- Lazy loading and page virtualization (configurable range)
- Zoom (50%–300%), fullscreen, keyboard navigation

### AI Object Detection
Every page is analyzed in a **Web Worker** to detect:
- Headings, paragraphs, titles, subtitles, text blocks
- Images, photos, illustrations, logos, icons
- Tables, charts, QR codes, shapes, callouts, badges
- Background images and decorative elements

Each element returns: bounding box, confidence score, type, hierarchy, z-index, and animation type.

### OCR Support
Automatic OCR for scanned PDFs via:
- **Tesseract.js** (offline, default)
- **Google Vision API** (optional, set `VITE_GOOGLE_VISION_API_KEY`)
- **Azure Vision API** (optional, set `VITE_AZURE_VISION_ENDPOINT` + `VITE_AZURE_VISION_KEY`)

### Layer Architecture
Each page is composed of independent animated layers:
```
Page
├── BackgroundLayer
├── ImageLayer
├── TextLayer
├── LogoLayer
├── ShapeLayer
├── TableLayer
├── HighlightLayer
└── AnimationLayer
```

### Animations
- **Text**: fade, slide-up, slide-left, typewriter, character/word reveal, underline, marker highlight, glow, gradient sweep, reading highlight
- **Images**: fade, zoom, Ken Burns, parallax, float, tilt, blur-to-sharp, scale, rotate, depth, mask reveal, light sweep
- **Logos**: glow, scale, bounce, pulse, light reflection, 3D rotate, elastic
- **Icons**: bounce, pop, scale, rotate, hover, float
- **Backgrounds**: gradient, particles, noise, light rays, moving shadows, depth, glass morphism

Powered by **Framer Motion** and **GSAP**.

### Viewer Controls
- Upload PDF, page navigation, zoom
- Full-text search with result highlighting
- Thumbnail sidebar, bookmarks, notes
- Reading mode with active paragraph highlight
- Toggle animations on/off
- Keyboard shortcuts (arrows, +/-, F/F11)

### Performance
- Web Workers for page analysis
- LRU cache (100MB, 50 entries)
- Intersection Observer for lazy rendering
- GPU-accelerated transforms (`will-change`, `translateZ`)
- Batch page analysis (3 pages at a time)
- Supports 500+ page documents

### Accessibility
- Keyboard navigation
- ARIA labels and roles
- Screen reader support
- Text selection and copy
- Search highlight marks
- `prefers-reduced-motion` support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| PDF | pdfjs-dist 4 |
| Page Flip | page-flip |
| Animation | Framer Motion + GSAP |
| OCR | Tesseract.js |
| State | React Context + useReducer |
| Styles | CSS Modules |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Open the app, then upload any PDF to begin. The engine will analyze each page, detect elements, and render the interactive flipbook.

## Project Structure

```
src/
├── animations/       # Framer Motion variants + GSAP timelines
├── components/       # React UI (FlipbookViewer, Toolbar, layers, etc.)
│   └── layers/       # BackgroundLayer, TextLayer, ImageLayer, etc.
├── context/          # FlipbookProvider + reducer
├── hooks/            # usePDFLoader, useSearch, useZoom, etc.
├── pdf/              # PDFEngine, OCRService, AIDetectionLayer
├── styles/           # CSS Modules
├── types/            # TypeScript interfaces
├── utils/            # Cache, search, helpers
└── workers/          # pageAnalysis.worker.ts
```

## Configuration

Copy `.env.example` to `.env` for optional cloud OCR:

```env
VITE_GOOGLE_VISION_API_KEY=your_key
VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com
VITE_AZURE_VISION_KEY=your_key
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `PageDown` | Next page |
| `←` / `PageUp` | Previous page |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `F` / `F11` | Toggle fullscreen |

## License

MIT

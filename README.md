# 🔨 NullUpload — Privacy-First Image Tools

**Your files never leave your browser.**

NullUpload is a collection of image processing tools that run **100% client-side**. No uploads, no servers, no tracking. Everything happens right in your browser using the Canvas API, Web Workers, and lightweight libraries.

## ✨ Features

| Tool | What it does |
|------|-------------|
| **Image Compressor** | Reduce file sizes with adjustable quality and max-size controls |
| **Format Converter** | Convert between JPEG, PNG, WebP, and AVIF |
| **Image Resizer** | Resize by exact pixels or percentage with aspect-ratio lock |
| **EXIF Stripper** | Remove all metadata (GPS, camera info, timestamps) and see what was found |

## 🛡️ Privacy

- **Zero data leaves your device** — all processing is in-browser
- No accounts, no analytics, no cookies
- Works offline after first load
- Open source — inspect the code yourself

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🏗️ Tech Stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS v4** for styling
- **browser-image-compression** for compression
- **Canvas API** for format conversion and resizing
- **piexifjs** for EXIF reading and stripping
- **react-dropzone** for drag & drop
- **lucide-react** for icons
- **react-router-dom** for routing

## 📁 Project Structure

```
src/
├── components/         # Shared UI components
│   ├── Layout.tsx      # App shell with nav + footer
│   ├── DropZone.tsx    # Drag & drop file input
│   ├── PrivacyBadge.tsx
│   ├── ImagePreview.tsx
│   ├── FileSizeBar.tsx
│   └── DownloadButton.tsx
├── pages/              # Route pages (one per tool)
│   ├── Home.tsx
│   ├── Compressor.tsx
│   ├── Converter.tsx
│   ├── Resizer.tsx
│   └── MetadataStripper.tsx
├── utils/
│   └── format.ts       # File size formatting helpers
├── types/
│   └── piexifjs.d.ts   # Type declarations for piexifjs
├── App.tsx             # Router setup
├── main.tsx            # Entry point
└── index.css           # Tailwind imports + theme
```

## License

MIT

# AR Matt & Gloss Decorators — Website Source

This is the source for the **latest approved 11-page design**, including the redesigned Limewash detail page, homepage service selector, and other service galleries.

## Project layout

```text
ar-matt-gloss-website/
├── index.html                       Homepage
├── services.html                    Services overview
├── portfolio.html                   Portfolio
├── testimonials.html                Testimonials
├── contact.html                     Contact
├── services/
│   ├── interior-painting.html
│   ├── exterior-painting.html
│   ├── limewash-specialist.html
│   ├── decorative-finishes.html
│   ├── cabinet-refinishing.html
│   └── commercial-painting.html
├── assets/
│   ├── css/                         Page styles (11 files)
│   ├── js/                          Page interactions (11 files)
│   ├── graphics/                    Favicon and logo fallback SVGs
│   └── images/                      Source manifest and downloaded photos
└── tools/download_assets.py         Optional photo-downloader
```

## Run locally

Open `index.html` in your browser, or serve the folder with a local HTTP server (recommended for development):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## IMPORTANT: Photo assets

The original single-file design did not contain embedded photo image files; it linked to externally hosted Hostinger CDN and Pexels photos. Consequently **the ZIP includes the complete HTML, CSS, JavaScript, vector graphics, and original photo URL manifest but not the original photo binaries**. We deliberately have **not** replaced the client's portfolio photographs with unrelated images.

To retrieve the photos when connected to the internet:

```bash
python3 tools/download_assets.py
```

The script will download files into `assets/images/` and replace working remote image references with local paths. Any unavailable original photo URLs stay remote. Fonts are currently loaded from Google Fonts; the CSS specifies system-font fallbacks.

If you have the original portfolio images or logo in a different format, you can put them in `assets/images/` and adjust the references as needed. The `assets/graphics/brand-fallback.svg` is a locally bundled fallback **not** the original logo file.

## Working notes

- Site is static HTML/CSS/vanilla JS: no npm installation or build step required.
- The multi-page version replaces the previous iframe/hash-based page router with ordinary HTML links, so each page has its own URL and can be indexed.
- Contact forms are frontend examples / mailto-driven flows, not a deployed CRM or backend form submission service.
- Before production, configure a real form endpoint, verify content, photo rights and contact details, then deploy the folder contents to your hosting provider.

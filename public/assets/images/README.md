# Image assets

The supplied website references images on Hostinger CDN and Pexels rather than embedding the full-resolution image files. The original image binaries were **not** included in the HTML source.

- **source-manifest.json** lists their original URLs and intended local filenames.
- With internet access, run `python3 tools/download_assets.py` from the project root. This downloads all source photos and makes local replacements where available.
- Without downloading, the website still references its original online images; for offline use, those images will be missing.
- The bundled SVGs in `assets/graphics/` and inline SVG icons work without internet.

The project retains the exact original photo references rather than substituting unrelated stock photographs.

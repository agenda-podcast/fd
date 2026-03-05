# Sacred Time Clock

Sacred Time Clock is a GitHub Pages-ready static web application that combines a clock-first experience with tradition-specific sacred timing overlays.

Supported tradition packs:
- Jewish
- Catholic
- Zoroastrian
- Buddhist

Core features:
- Always-on local 24-hour digital clock
- Fixed dial shell with tradition-driven slot binding
- One-location profile model
- Approximate solar and lunar event calculations from latitude/longitude
- Tradition-specific event logic and next-event countdown
- Dynamic blessing/prayer builder with occasion-based mention slots
- CSV-backed data tables for traditions, calendars, events, templates, and personas
- YAML pack mirrors for authoring/reference
- No build step required

## GitHub Pages deployment

This repository is ready to publish directly with GitHub Pages.

### Option A: included workflow
1. Create a GitHub repository.
2. Upload all files from this folder to the repository root.
3. Push to the `main` branch.
4. In GitHub, open **Settings -> Pages** and ensure **Build and deployment** uses **GitHub Actions**.
5. The included workflow at `.github/workflows/deploy-pages.yml` will publish the site.

### Option B: branch deploy without workflow
1. Create a GitHub repository.
2. Upload all files from this folder to the repository root.
3. In **Settings -> Pages**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Save.

The app uses only relative paths, so it works from the repository root on GitHub Pages.

## Local preview

Because the app loads CSV files with `fetch()`, preview it through a local static server rather than opening `clock.html` directly from the filesystem.

```bash
cd sacred-time-clock-repo
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

- `clock.html` - app shell
- `styles.css` - theme-aware layout
- `js/` - application logic
- `js/packs/` - runtime tradition pack modules
- `data/` - CSV database tables
- `packs/` - YAML pack mirrors
- `.github/workflows/deploy-pages.yml` - optional GitHub Pages deployment workflow
- `.nojekyll` - disables Jekyll processing on GitHub Pages

## Notes

- Solar and lunar calculations are intentionally lightweight and approximate for prototype use.
- Calendar datasets in CSV are starter datasets for extension.
- The app keeps the local digital clock fixed while tradition packs control all other dial slots.

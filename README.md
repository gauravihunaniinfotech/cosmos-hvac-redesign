# Cosmo's Heating & Air Conditioning – Website Redesign (4 pages)

Pure HTML + CSS + vanilla JavaScript. No build step, no dependencies.

## Run locally (VS Code Live Server)
1. Unzip and open the project folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension (`ritwickdey.LiveServer`) - VS Code will suggest it.
3. Right-click `index.html` > **Open with Live Server** (or click **Go Live**).
4. Chrome opens at **http://localhost:5500** (port preset in `.vscode/settings.json`).

No VS Code? `python3 -m http.server 5500` or `npx live-server --port=5500` work too, then open http://localhost:5500.
Open through a server (not by double-clicking the file) so fonts, images and the lightbox behave correctly.

## Pages
| File | URL | Contents |
|---|---|---|
| `index.html` | / | Hero, about, trust badges, services, Comfort Club teaser, **Our Work in Action** gallery (filters + lightbox), reviews, contact |
| `about.html` | /about.html | Story, values, residential vs commercial, team, service areas + map, contact |
| `services.html` | /services.html | Sticky jump-bar and all six services with photos, benefits and consultation CTAs, FAQ-ready layout, contact |
| `comfort-club.html` | /comfort-club.html | Membership overview, benefits, how it saves, plan card, how to join, FAQ, contact (form pre-selects the Comfort Club) |

All four share one `style.css` and one `script.js`; header, footer and contact form are repeated in each page (static site), and every nav link, footer link and CTA works between pages.

## Structure
```
index.html about.html services.html comfort-club.html
style.css      tokens, components, responsive, reduced-motion
script.js      nav, reveal, parallax, counters, gallery filters, lightbox, jump-bar spy, form
assets/images  logo, HD skyline hero, project photos (all from your originals)
assets/fonts   self-hosted Poppins + Lora
assets/icons   favicon + apple-touch icon
.vscode        Live Server settings (port 5500)
```

## Gallery
Add a photo to "Our Work in Action" by copying one `<li class="work-card" data-cat="installation commercial">` block in `index.html`
(categories: installation, repair, maintenance, residential, commercial). Cards beyond the first 12 sit behind "Show More Projects" (class `is-extra`).

## Content notes - please review before launch
- **Only facts from the original site are used** (services, licence #0095035, address, phone, email, service areas, 5.0 / 10 Google reviews).
- **No team names, years in business, plan prices or savings figures** were available, so none are invented. The Comfort Club plan card says "Ask for current pricing"; edit `.plan` in `comfort-club.html` once you have real plans (copy the `<article class="plan">` block for more).
- Descriptions on the Services page continue the truncated original lines; please proof them.
- **Reviews:** paste real Google reviews into the `REVIEWS` array in `script.js` to turn on the slider.
- **Contact form:** static site - it validates, then opens the visitor's email app addressed to service@cosmosaclv.com. Swap `sendViaMailto()` for Formspree/Netlify Forms when hosting.
- **Photo resolution:** the supplied photos are web thumbnails (about 350-620 px wide) that were upscaled 1.5-2x with sharpening. They are crisp at card size and in the lightbox but not true HD; replace files in `assets/images` with the camera originals (same filenames) for genuinely sharp results. The skyline hero is full 1905 px.
- The map on About uses a Google Maps embed (needs internet).
- Canonical URLs use https://www.cosmosaclv.com/ - adjust if different.

## Home hero background
- Files: `assets/images/hero-luxury-home.jpg` (1600x900, desktop/tablet) and `hero-luxury-home-mobile.jpg` (800x1100, phones <= 720px). Wired in the last block of `style.css` with `background-size: cover; background-position: center right`.
- Built from the supplied luxury-home / condenser photo on a dark teal field, so the left stays clean for the white text. Only the home page uses it; About / Services / Comfort Club keep the skyline.
- To use a new photo, overwrite those two filenames (16:9 landscape, house on the right, ~1920x1080, under ~250 KB; plus a ~3:4 portrait for mobile). No code changes are needed.

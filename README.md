# UniNexus Suite — Northhaven University demo

Single-window demo of **UniNexus Suite**: a connected student-lifecycle intelligence layer for a U.S. campus. All eight apps share one canonical record. No backend.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Host the demo

Static site — drop the `dist` folder on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any object store.

```bash
npm run build
npm run preview   # sanity-check the production build
```

- **Netlify / Cloudflare:** drag `dist/` onto a new site, or set build command `npm run build` and publish directory `dist`.
- **Vercel:** import the repo; Vite is autodetected. Output `dist`.
- **GitHub Pages:** `base` is already `./` so the build works from a project subdirectory. Hash routing (`#/student`) avoids server rewrite rules.

## Demo thread

1. Mosaic home → **Open her mobile app** (Priya Mehta, MS CS, Mumbai).
2. On the phone, upload the WES PDF — Banner, admissions radar, and the live pulse all move.
3. Admissions Radar → escalate / dean approve.
4. Aid Atelier → approve Horizon + Global + Dean awards — Control Tower and Treasury Pulse update.
5. Phone → pay deposit → Welcome Passport stamps appear.
6. Constellation shows Salesforce, Ellucian Banner, Workday, Starfish, Canvas, Anthology, StarRez still as systems of record.

Reset demo is in the top bar.

# Pengu Learn Platform 🐧

Interactive learning platform and desktop suite designed for deep conceptual mastery, visual algorithm simulations, adaptive quests, and zero-distraction offline study.

## Core Features

- **Interactive Visual Labs**: Real-time sandboxes for science, algorithms, and logic.
- **Adaptive Quest Engine**: Gamified difficulty progression tuning to learner retention.
- **Zero-Cloud Offline Desktop Suite**: Fast native performance on Windows, macOS, and Linux.
- **Gated Product Downloads**: UPI QR payment submission with manual review, and free access using promo code PENGUNEW.
- **Interactive Pengu Buddy**: Cheerful mascot providing context-sensitive tips and guidance.

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy the web app to Vercel
1. Import this repository in Vercel and keep the project root set to the repository root.
2. Vercel uses `vercel.json` to install with `npm ci`, run `npm run build`, publish `dist`, and route client-side pages back to `index.html`.
3. The QR is served from `public/payment-qr.jpeg`. Promo downloads use a Vercel Function and a Vercel Blob URL configured as `PROMO_DOWNLOAD_URL` in Vercel Environment Variables.
4. Redeploy after changing environment variables. Vite embeds `VITE_*` values during the build.

No Google Auth, Render service, or Supabase setup is needed for the QR and promo-code panel. The 173 MB ZIP is too large for this project's static deployment and Vercel Function responses, so upload it to Vercel Blob. From the project root, create a public Blob store with `vercel blob create-store pengu-downloads --access public`, then upload with `vercel blob put ./Pengu-win.zip --pathname Pengu-win.zip --access public --content-type application/zip`. Set the resulting Blob URL as `PROMO_DOWNLOAD_URL` in Vercel Environment Variables and redeploy. Vercel Blob serves ZIP files as downloads; see the [Blob CLI guide](https://vercel.com/docs/vercel-blob/manage-blob-storage) and [public Blob docs](https://vercel.com/docs/vercel-blob/public-storage).

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Typography**: Sora, Urbanist, Georgia Pro

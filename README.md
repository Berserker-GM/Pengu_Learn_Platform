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
3. The QR is served from `public/payment-qr.jpeg`. Entering the `PENGUNEW` promo code redirects to its Google Drive file.
4. Redeploy after changing environment variables. Vite embeds `VITE_*` values during the build.

No Google Auth, Render service, Supabase setup, or promo download environment variable is needed for this panel.

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Typography**: Sora, Urbanist, Georgia Pro

# Pengu Learn Platform 🐧

Interactive learning platform and desktop suite designed for deep conceptual mastery, visual algorithm simulations, adaptive quests, and zero-distraction offline study.

## Core Features

- **Interactive Visual Labs**: Real-time sandboxes for science, algorithms, and logic.
- **Adaptive Quest Engine**: Gamified difficulty progression tuning to learner retention.
- **Zero-Cloud Offline Desktop Suite**: Fast native performance on Windows, macOS, and Linux.
- **Gated Product Downloads**: One-time Razorpay checkout ($10 / approximately ₹950), with server-verified payment before download.
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
3. Set `VITE_PAYMENT_API_URL` in the Vercel project to the public URL of the deployed backend, without a trailing slash. The backend can be deployed from the included `render.yaml`; add Razorpay credentials in the backend host's secret environment variables.
4. Redeploy after changing environment variables. Vite embeds `VITE_*` values during the build.

The website can deploy without payment credentials, but checkout needs the backend URL and Razorpay secrets. The backend only enables checkout for operating systems whose installer is present; see [backend deployment notes](backend/README.md).

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Typography**: Sora, Urbanist, Georgia Pro

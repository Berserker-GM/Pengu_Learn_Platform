export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const code = String(req.body?.code || "").trim().toUpperCase();
  if (code !== "PENGUNEW") {
    return res.status(400).json({ error: "Invalid promo code." });
  }

  const downloadUrl = process.env.PROMO_DOWNLOAD_URL;
  if (!downloadUrl || !/^https:\/\//i.test(downloadUrl)) {
    return res.status(503).json({ error: "Promo download is not configured. Set PROMO_DOWNLOAD_URL in Vercel and redeploy." });
  }

  return res.status(200).json({ downloadUrl });
}

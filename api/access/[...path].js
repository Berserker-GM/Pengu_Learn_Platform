export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (code !== "PENGUNEW") return res.status(400).json({ error: "Invalid promo code." });

  const downloadUrl = process.env.PROMO_DOWNLOAD_URL;
  if (!downloadUrl || !/^https:\/\//i.test(downloadUrl)) {
    return res.status(503).json({ error: "The promo download is not configured yet." });
  }
  return res.status(200).json({ downloadUrl });
}

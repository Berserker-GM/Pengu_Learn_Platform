import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const artifacts = { windows: "PenguLearn-Setup-v2.4.1.exe", macos: "PenguLearn-v2.4.1.dmg", linux: "PenguLearn-v2.4.1.AppImage" };
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const bearer = req => req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
const validEmail = value => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function db(pathname, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw Object.assign(new Error("Access service is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel."), { status: 503 });
  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    ...options,
    headers: { apikey: key, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error("Could not update access records. Check the Supabase table setup.");
  return response.status === 204 ? null : response.json();
}

async function findAccess(token) {
  if (!token || !/^dlt_[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const query = new URLSearchParams({ select: "id,email,status,created_at,payment_reference,source", request_token_hash: `eq.${hash(token)}`, limit: "1" });
  return (await db(`download_access?${query}`))[0] || null;
}
const publicAccess = row => ({ id: row.id, email: row.email, status: row.status, created_at: row.created_at, payment_reference: row.payment_reference, source: row.source });

async function createAccess({ email, status, source, paymentReference = null }) {
  const accessToken = `dlt_${crypto.randomBytes(32).toString("base64url")}`;
  const rows = await db("download_access", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ email, user_id: null, status, source, payment_reference: paymentReference, request_token_hash: hash(accessToken) }),
  });
  return { access: publicAccess(rows[0]), accessToken };
}

export default async function handler(req, res) {
  try {
    const route = Array.isArray(req.query.path) ? req.query.path : String(req.query.path || "").split("/").filter(Boolean);
    const action = route[0];
    if (req.method === "GET" && action === "status") {
      const access = await findAccess(bearer(req));
      if (!access) return res.status(401).json({ error: "No valid access request found in this browser." });
      return res.json({ access: publicAccess(access) });
    }
    if (req.method === "POST" && action === "request") {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const paymentReference = String(req.body?.paymentReference || "").trim().slice(0, 80);
      if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
      if (paymentReference.length < 6) return res.status(400).json({ error: "Enter the UPI transaction reference from your payment app." });
      return res.status(201).json(await createAccess({ email, status: "pending", source: "manual_upi", paymentReference }));
    }
    if (req.method === "POST" && action === "promo") {
      const email = String(req.body?.email || "").trim().toLowerCase();
      if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
      if (String(req.body?.code || "").trim().toUpperCase() !== "PENGUNEW") return res.status(400).json({ error: "Invalid promo code." });
      return res.status(201).json(await createAccess({ email, status: "approved", source: "promo" }));
    }
    if (req.method === "GET" && action === "download" && route.length === 2) {
      const access = await findAccess(bearer(req));
      if (!access) return res.status(401).json({ error: "Valid access request required." });
      if (access.status !== "approved") return res.status(403).json({ error: "Your request is awaiting approval." });
      const filename = artifacts[route[1]];
      if (!filename) return res.status(404).json({ error: "Unknown platform." });
      const file = path.join(process.cwd(), "backend", "downloads", filename);
      if (!fs.existsSync(file)) return res.status(404).json({ error: "Installer is not published yet." });
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", fs.statSync(file).size);
      return fs.createReadStream(file).pipe(res);
    }
    return res.status(404).json({ error: "Not found." });
  } catch (error) {
    console.error("[access-api]", error);
    return res.status(error.status || 500).json({ error: error.status ? error.message : "Access request failed." });
  }
}

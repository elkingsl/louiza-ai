// ============================================================
//  Louiza AI — Vercel Serverless: /api/user/read
// ============================================================

const GITHUB_API = "https://api.github.com";

async function ghGet(path) {
  const res = await fetch(
    `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  return res.json();
}

async function ghReadJson(path) {
  const file = await ghGet(path);
  if (!file) return { data: null, sha: null };
  const decoded = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  return { data: decoded, sha: file.sha };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, file } = req.query;

    if (!username || !file) return res.status(400).json({ error: "Missing params" });

    const allowed = ["profile", "settings", "chat_history"];
    if (!allowed.includes(file)) return res.status(400).json({ error: "Invalid file" });

    const { data } = await ghReadJson(`users/${username}/${file}.json`);
    if (data === null) return res.status(404).json({ error: "File not found" });

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

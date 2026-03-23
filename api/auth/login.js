// ============================================================
//  Louiza AI — Vercel Serverless: /api/auth/login
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, password_hash } = req.body;

    if (!username || !password_hash)
      return res.status(400).json({ error: "Missing fields" });

    const { data: index } = await ghReadJson("system/users_index.json");
    const users = index?.users || [];

    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid username or password" });
    if (user.password_hash !== password_hash)
      return res.status(401).json({ error: "Invalid username or password" });

    const { data: profile } = await ghReadJson(`users/${username}/profile.json`);
    return res.status(200).json({ profile });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

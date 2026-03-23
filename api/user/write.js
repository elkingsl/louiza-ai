// ============================================================
//  Louiza AI — Vercel Serverless: /api/user/write
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

async function ghPut(path, content, sha) {
  const body = {
    message: `update ${path}`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${t}`);
  }
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
    const { username, file, data } = req.body;

    if (!username || !file || data === undefined)
      return res.status(400).json({ error: "Missing fields" });

    const allowed = ["profile", "settings", "chat_history"];
    if (!allowed.includes(file)) return res.status(400).json({ error: "Invalid file" });

    const path = `users/${username}/${file}.json`;
    const { sha } = await ghReadJson(path);
    await ghPut(path, data, sha);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

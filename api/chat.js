// ============================================================
//  Louiza AI — Vercel Serverless: /api/chat
// ============================================================

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: "Invalid messages" });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.ALLOWED_ORIGIN || "",
        "X-Title": "Louiza AI",
      },
      body: JSON.stringify({
        model: model || "mistralai/mistral-7b-instruct:free",
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `OpenRouter error: ${errText}` });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

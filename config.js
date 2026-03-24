// ============================================================
//  Louiza AI — Public Config
//  No secrets here. All keys live in the Cloudflare Worker.
// ============================================================

const CONFIG = {
  // Your Cloudflare Worker URL — update after deploying worker.js
  WORKER_URL: "https://louiza-ai.vercel.app",

  // Default AI model
  DEFAULT_MODEL: "openrouter/free",

  // Available models (free tier on OpenRouter)
  MODELS: [
    { id: "openrouter/free", label: "Auto" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3" },
    { id: "google/gemma-3-27b-it:free", label: "Gemma 3" },
    { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1" },
    { id: "qwen/qwen3-14b:free", label: "Qwen 3" },
  ],

  // App info
  APP_NAME: "Louiza AI",
  VERSION: "1.0.0",
};

// ============================================================
//  Louiza AI — Public Config
//  No secrets here. All keys live in the Cloudflare Worker.
// ============================================================

const CONFIG = {
  // Your Cloudflare Worker URL — update after deploying worker.js
  WORKER_URL: "https://louiza-worker.YOUR_SUBDOMAIN.workers.dev",

  // Default AI model (user can change in settings)
  DEFAULT_MODEL: "mistralai/mistral-7b-instruct:free",

  // Available models (free tier on OpenRouter)
  MODELS: [
    { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Free)" },
    { id: "meta-llama/llama-3-8b-instruct:free", label: "Llama 3 8B (Free)" },
    { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (Free)" },
    { id: "openchat/openchat-7b:free", label: "OpenChat 7B (Free)" },
  ],

  // App info
  APP_NAME: "Louiza AI",
  VERSION: "1.0.0",
};

// ============================================================
//  Louiza AI — Public Config
//  No secrets here. All keys live in the Cloudflare Worker.
// ============================================================

const CONFIG = {
  // Your Cloudflare Worker URL — update after deploying worker.js
  WORKER_URL: "https://louiza-worker.YOUR_SUBDOMAIN.workers.dev",

  // Default AI model (user can change in settings)
  DEFAULT_MODEL: "mistralai/mistral-7b-instruct",

  // Available models (free tier on OpenRouter)
  MODELS: [
    { id: "mistralai/mistral-7b-instruct", label: "Mistral 7B" },
    { id: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
    { id: "google/gemma-2-9b-it", label: "Gemma 2 9B" },
    { id: "qwen/qwen-2.5-7b-instruct", label: "Qwen 2.5 7B" },
  ],

  // App info
  APP_NAME: "Louiza AI",
  VERSION: "1.0.0",
};

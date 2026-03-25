// ============================================================
//  Louiza AI — Public Config
//  No secrets here. All keys live in Vercel environment variables.
// ============================================================

const CONFIG = {
  // Your Vercel deployment URL
  WORKER_URL: "https://louiza-ai.vercel.app",

  // Fixed to auto — always picks best available free model
  DEFAULT_MODEL: "openrouter/auto",

  MODELS: [
    { id: "openrouter/auto", label: "Auto" },
  ],

  // App info
  APP_NAME: "Louiza AI",
  VERSION: "1.0.0",
};

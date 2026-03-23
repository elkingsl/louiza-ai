// ============================================================
//  Louiza AI — DB Layer
//  All data operations go through the Cloudflare Worker.
//  The Worker talks to the private GitHub repo.
// ============================================================

const DB = (() => {
  const base = () => CONFIG.WORKER_URL;

  // ── Generic request helper ─────────────────────────────────
  async function request(endpoint, method = "GET", body = null) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    opts.signal = controller.signal;

    try {
      const res = await fetch(`${base()}${endpoint}`, opts);
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }

  // ── Auth ───────────────────────────────────────────────────

  /**
   * Register a new user.
   * @param {string} username
   * @param {string} passwordHash - SHA-256 hex string
   * @param {string} email
   */
  async function register(username, passwordHash, email) {
    return request("/api/auth/register", "POST", {
      username,
      password_hash: passwordHash,
      email,
    });
  }

  /**
   * Login — verifies hash server-side.
   * @param {string} username
   * @param {string} passwordHash - SHA-256 hex string
   * @returns {{ success: boolean, profile: object }}
   */
  async function login(username, passwordHash) {
    return request("/api/auth/login", "POST", {
      username,
      password_hash: passwordHash,
    });
  }

  // ── User data ──────────────────────────────────────────────

  /**
   * Read a user's JSON file.
   * @param {string} username
   * @param {"profile"|"settings"|"chat_history"} file
   */
  async function readFile(username, file) {
    return request(`/api/user/read?username=${username}&file=${file}`);
  }

  /**
   * Write / overwrite a user's JSON file.
   * @param {string} username
   * @param {"profile"|"settings"|"chat_history"} file
   * @param {object} data
   */
  async function writeFile(username, file, data) {
    return request("/api/user/write", "POST", { username, file, data });
  }

  /**
   * Append a message to chat_history.json.
   * Reads current history, appends, writes back.
   * @param {string} username
   * @param {{ role: string, content: string }} message
   */
  async function appendMessage(username, message) {
    const history = await readFile(username, "chat_history");
    const updated = Array.isArray(history) ? history : [];
    updated.push({ ...message, timestamp: new Date().toISOString() });
    return writeFile(username, "chat_history", updated);
  }

  /**
   * Clear chat history for a user.
   * @param {string} username
   */
  async function clearHistory(username) {
    return writeFile(username, "chat_history", []);
  }

  // ── Settings ───────────────────────────────────────────────

  /**
   * Load user settings.
   * @param {string} username
   */
  async function getSettings(username) {
    return readFile(username, "settings");
  }

  /**
   * Save user settings.
   * @param {string} username
   * @param {object} settings
   */
  async function saveSettings(username, settings) {
    return writeFile(username, "settings", settings);
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    register,
    login,
    readFile,
    writeFile,
    appendMessage,
    clearHistory,
    getSettings,
    saveSettings,
  };
})();

// ============================================================
//  Louiza AI — Auth
//  Handles login, register, session via sessionStorage.
//  Password is hashed client-side before ever leaving the browser.
// ============================================================

const Auth = (() => {
  const SESSION_KEY = "louiza_session";

  // ── SHA-256 via Web Crypto API ─────────────────────────────
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ── Session ────────────────────────────────────────────────
  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(profile) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = "index.html";
    }
  }

  function requireGuest() {
    if (isLoggedIn()) {
      window.location.href = "chat.html";
    }
  }

  // ── Register ───────────────────────────────────────────────
  async function register(username, password, email) {
    username = username.trim().toLowerCase();

    if (!username || !password) throw new Error("Username and password are required.");
    if (username.length < 3) throw new Error("Username must be at least 3 characters.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    if (!/^[a-z0-9_]+$/.test(username))
      throw new Error("Username can only contain letters, numbers, and underscores.");

    const hash = await hashPassword(password);
    const result = await DB.register(username, hash, email || "");

    setSession(result.profile);
    return result;
  }

  // ── Login ──────────────────────────────────────────────────
  async function login(username, password) {
    username = username.trim().toLowerCase();

    if (!username || !password) throw new Error("Username and password are required.");

    const hash = await hashPassword(password);
    const result = await DB.login(username, hash);

    setSession(result.profile);
    return result;
  }

  // ── Logout ─────────────────────────────────────────────────
  function logout() {
    clearSession();
    window.location.href = "index.html";
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    register,
    login,
    logout,
    getSession,
    isLoggedIn,
    requireAuth,
    requireGuest,
  };
})();

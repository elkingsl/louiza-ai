// ============================================================
//  Louiza AI — Theme
//  Applies dark/light mode from settings or system preference.
//  Syncs changes back to DB.
// ============================================================

const Theme = (() => {
  const STORAGE_KEY = "louiza_theme";

  function apply(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  // Load theme: user settings > localStorage > system preference
  function init(settingsDark = null) {
    if (settingsDark !== null) {
      apply(settingsDark);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      apply(stored === "dark");
      return;
    }
    // Fall back to system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(prefersDark);
  }

  async function toggle() {
    const next = !isDark();
    apply(next);

    // Persist to DB if logged in
    if (Auth.isLoggedIn()) {
      const session = Auth.getSession();
      try {
        const settings = await DB.getSettings(session.username);
        settings.dark_mode = next;
        await DB.saveSettings(session.username, settings);
      } catch (e) {
        console.warn("Could not save theme preference:", e.message);
      }
    }
  }

  return { init, apply, toggle, isDark };
})();

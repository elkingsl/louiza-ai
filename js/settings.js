// ============================================================
//  Louiza AI — Settings
//  Loads and saves user settings and profile.
// ============================================================

const Settings = (() => {
  let currentSettings = {};
  let currentProfile = {};

  async function init() {
    const session = Auth.getSession();
    if (!session) return;

    try {
      [currentProfile, currentSettings] = await Promise.all([
        DB.readFile(session.username, "profile"),
        DB.getSettings(session.username),
      ]);

      // Populate profile fields
      document.getElementById("field-username").value = currentProfile.username || "";
      document.getElementById("field-email").value = currentProfile.email || "";

      // Populate settings
      document.getElementById("switch-dark").checked = currentSettings.dark_mode ?? true;
      document.getElementById("sel-language").value = currentSettings.language || "en";
      document.getElementById("sel-model").value = currentSettings.model || CONFIG.DEFAULT_MODEL;

    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }

  async function saveProfile() {
    const session = Auth.getSession();
    const email = document.getElementById("field-email").value.trim();

    try {
      setBtnLoading("btn-save-profile", true);
      const updated = { ...currentProfile, email };
      await DB.writeFile(session.username, "profile", updated);
      currentProfile = updated;
      showSnackbar("Profile saved");
    } catch (e) {
      showSnackbar("Failed to save profile: " + e.message, true);
    } finally {
      setBtnLoading("btn-save-profile", false);
    }
  }

  async function saveSettings() {
    const session = Auth.getSession();
    const dark_mode = document.getElementById("switch-dark").checked;
    const language = document.getElementById("sel-language").value;
    const model = document.getElementById("sel-model").value;

    try {
      setBtnLoading("btn-save-settings", true);
      const updated = { ...currentSettings, dark_mode, language, model };
      await DB.saveSettings(session.username, updated);
      currentSettings = updated;
      Theme.apply(dark_mode);
      showSnackbar("Settings saved");
    } catch (e) {
      showSnackbar("Failed to save settings: " + e.message, true);
    } finally {
      setBtnLoading("btn-save-settings", false);
    }
  }

  function setBtnLoading(id, loading) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle("loading", loading);
    btn.disabled = loading;
  }

  return { init, saveProfile, saveSettings };
})();

// ============================================================
//  Louiza AI — Chat
//  Handles sending messages, rendering responses, history sync.
// ============================================================

const Chat = (() => {
  let messages = []; // in-memory conversation context
  let isLoading = false;

  // ── Init ───────────────────────────────────────────────────
  async function init() {
    const session = Auth.getSession();
    if (!session) return;

    // Load settings for model preference (non-blocking)
    DB.getSettings(session.username).then(settings => {
      const model = settings?.model || CONFIG.DEFAULT_MODEL;
      const sel = document.getElementById("model-select");
      if (sel) sel.value = model;
    }).catch(() => {});

    // Load chat history (non-blocking)
    DB.readFile(session.username, "chat_history").then(history => {
      if (Array.isArray(history) && history.length > 0) {
        messages = history.map(({ role, content }) => ({ role, content }));
        history.forEach(({ role, content, timestamp }) => {
          renderMessage(role === "assistant" ? "louiza" : "user", content, timestamp, false);
        });
        // Remove welcome if it was added before history loaded
        const welcome = document.getElementById("messages").querySelector(".welcome-msg");
        if (welcome) welcome.remove();
        scrollToBottom();
      }
    }).catch(() => {});
  }

  // ── Send message ───────────────────────────────────────────
  async function send() {
    if (isLoading) return;

    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    autoResize(input);

    const session = Auth.getSession();
    const model = document.getElementById("model-select").value || CONFIG.DEFAULT_MODEL;

    // Render user message
    const userTimestamp = new Date().toISOString();
    renderMessage("user", text, userTimestamp, true);

    // Add to context
    messages.push({ role: "user", content: text });

    // Save user message to DB (non-blocking)
    DB.appendMessage(session.username, { role: "user", content: text }).catch(() => {});

    // Show typing indicator
    const typingId = showTyping();
    isLoading = true;
    setInputEnabled(false);

    try {
      const res = await fetch(`${CONFIG.WORKER_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to get response");
      }

      const reply = data.reply;
      const replyTimestamp = new Date().toISOString();

      removeTyping(typingId);
      renderMessage("louiza", reply, replyTimestamp, true);

      messages.push({ role: "assistant", content: reply });

      // Save assistant message to DB (non-blocking)
      DB.appendMessage(session.username, { role: "assistant", content: reply }).catch(() => {});

    } catch (e) {
      removeTyping(typingId);
      renderError(e.message);
    } finally {
      isLoading = false;
      setInputEnabled(true);
      document.getElementById("chat-input").focus();
    }
  }

  // ── Clear history ──────────────────────────────────────────
  async function clearHistory() {
    const session = Auth.getSession();
    messages = [];
    document.getElementById("messages").innerHTML = "";
    await DB.clearHistory(session.username);
    renderWelcome();
  }

  // ── Render helpers ─────────────────────────────────────────
  function renderMessage(sender, content, timestamp, animate) {
    const container = document.getElementById("messages");

    // Remove welcome message if present
    const welcome = container.querySelector(".welcome-msg");
    if (welcome) welcome.remove();

    // Show clear button
    const btnClear = document.getElementById("btn-clear");
    if (btnClear) btnClear.style.display = "";

    const isUser = sender === "user";
    const time = timestamp ? formatTime(timestamp) : "";

    const bubble = document.createElement("div");
    bubble.className = `msg ${isUser ? "msg-user" : "msg-ai"} ${animate ? "msg-animate" : ""}`;

    bubble.innerHTML = `
      <div class="msg-avatar">
        <span class="material-icons-round">${isUser ? "person" : "auto_awesome"}</span>
      </div>
      <div class="msg-body">
        <div class="msg-content">${formatContent(content)}</div>
        ${time ? `<div class="msg-time">${time}</div>` : ""}
      </div>
    `;

    container.appendChild(bubble);
    scrollToBottom();
  }

  function renderError(message) {
    const container = document.getElementById("messages");
    const el = document.createElement("div");
    el.className = "msg-error";
    el.innerHTML = `<span class="material-icons-round">error_outline</span> ${message}`;
    container.appendChild(el);
    scrollToBottom();
  }

  function renderWelcome() {
    const session = Auth.getSession();
    const container = document.getElementById("messages");
    const el = document.createElement("div");
    el.className = "welcome-msg";
    el.innerHTML = `
      <div class="welcome-icon">
        <span class="material-icons-round">auto_awesome</span>
      </div>
      <h2>Hello, ${session?.username || "there"}</h2>
      <p>I'm Louiza. How can I help you today?</p>
    `;
    container.appendChild(el);
  }

  function showTyping() {
    const container = document.getElementById("messages");
    const id = "typing-" + Date.now();
    const el = document.createElement("div");
    el.id = id;
    el.className = "msg msg-ai";
    el.innerHTML = `
      <div class="msg-avatar">
        <span class="material-icons-round">auto_awesome</span>
      </div>
      <div class="msg-body">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    container.appendChild(el);
    scrollToBottom();
    return id;
  }

  function removeTyping(id) {
    document.getElementById(id)?.remove();
  }

  // ── Format helpers ─────────────────────────────────────────
  function formatContent(text) {
    // Escape HTML
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    safe = safe.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`
    );

    // Inline code
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Line breaks
    safe = safe.replace(/\n/g, "<br>");

    return safe;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function scrollToBottom() {
    const container = document.getElementById("messages");
    container.scrollTop = container.scrollHeight;
  }

  function setInputEnabled(enabled) {
    const input = document.getElementById("chat-input");
    const btn = document.getElementById("btn-send");
    input.disabled = !enabled;
    btn.disabled = !enabled;
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  // ── Public API ─────────────────────────────────────────────
  return { init, send, clearHistory, renderWelcome, autoResize };
})();

const LANGUAGE_OPTIONS = [
  ["en", "English"], ["ne", "नेपाली"], ["hi", "हिन्दी"], ["es", "Español"],
  ["fr", "Français"], ["pt", "Português"], ["ar", "العربية"], ["zh", "中文"],
  ["bn", "বাংলा"], ["ur", "اردو"], ["sw", "Kiswahili"], ["id", "Bahasa Indonesia"],
  ["de", "Deutsch"], ["ja", "日本語"], ["ko", "한국어"], ["ru", "Русский"],
  ["it", "Italiano"], ["tr", "Türkçe"], ["vi", "Tiếng Việt"], ["th", "ไทย"],
  ["fa", "فارسی"], ["pa", "ਪੰਜਾਬ���"], ["ta", "தமிழ்"], ["te", "తెలుగు"],
  ["mr", "मराठी"], ["fil", "Filipino"], ["ha", "Hausa"], ["am", "አማርኛ"],
  ["yo", "Yorùbá"], ["uk", "Українська"], ["pl", "Polski"], ["nl", "Nederlands"],
  ["sv", "Svenska"], ["el", "Ελληνικά"], ["he", "עברית"], ["ro", "Română"],
  ["hu", "Magyar"], ["cs", "Čeština"], ["ms", "Bahasa Melayu"], ["km", "ភាសាខ្មែរ"],
];

const style = document.createElement("style");
style.textContent = `
  .hw-account{position:relative;z-index:1001;display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-left:auto;color:#e8f7f0;font:14px/1.4 system-ui,sans-serif}
  .hw-account button,.hw-account select{font:inherit;border:1px solid #ffffff44;border-radius:9px;padding:9px 11px;background:#ffffff12;color:#fff}
  .hw-account button{cursor:pointer;font-weight:700}.hw-account .hw-primary{background:#f2c66d;color:#10251f;border-color:#f2c66d}
  .hw-account select option{background:#fff;color:#14251e}.hw-account-status{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hw-dialog-backdrop{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:18px;background:rgba(3,10,20,.78);backdrop-filter:blur(12px)}
  .hw-dialog-backdrop[hidden]{display:none}
  .hw-dialog{width:min(520px,100%);max-height:min(90vh,820px);overflow:auto;position:relative;padding:clamp(24px,6vw,42px);border:1px solid rgba(81,212,194,.35);border-radius:26px;background:linear-gradient(145deg,#101c31,#091323);color:#f5f7fb;box-shadow:0 30px 100px #0009;text-align:center}
  .hw-dialog h2{margin:0 0 8px;font-size:clamp(1.7rem,5vw,2.4rem)}.hw-dialog p{color:#aab8ca;margin:0 0 22px}.hw-dialog form{display:grid;gap:13px;text-align:left}.hw-dialog label{display:grid;gap:6px;color:#c6d1df;font-size:.92rem;font-weight:650}
  .hw-dialog input{width:100%;padding:14px 15px;border:1px solid #39485e;border-radius:12px;background:#101b2d;color:white;font:inherit}.hw-dialog input:focus-visible,.hw-dialog button:focus-visible{outline:3px solid #22c5df;outline-offset:3px}
  .hw-dialog button{min-height:48px;padding:12px 15px;border:0;border-radius:12px;background:linear-gradient(100deg,#119bb7,#8b35e8);color:white;font:700 1rem system-ui,sans-serif;cursor:pointer}
  .hw-dialog button:disabled{opacity:.6;cursor:wait}.hw-dialog .hw-alt{background:#1b2940;border:1px solid #3b4960}.hw-dialog .hw-close{position:absolute;top:13px;right:13px;width:40px;height:40px;min-height:40px;padding:0;background:transparent;border:1px solid #3b4960;font-size:1.35rem}
  .hw-message{min-height:24px;margin:12px 0 0!important;color:#a8e7d2!important;font-size:.92rem}.hw-security{margin-top:24px!important;font-size:.83rem!important}
  @media(max-width:800px){.hw-account{margin:0}.hw-account-status{max-width:130px}}
  @media(max-width:500px){.hw-account-status{display:none}.hw-account select{max-width:118px;padding:8px 6px}}
`;
document.head.append(style);

const nav = document.querySelector(".nav") || document.body;
const controls = document.createElement("div");
controls.className = "hw-account";
controls.innerHTML = `
  <span class="hw-account-status" id="hw-auth-status" role="status">Group access not active</span>
  <button class="hw-primary" id="hw-open-auth" type="button">Enter access code</button>
  <button id="hw-sign-out" type="button" hidden>Sign out</button>
  <label for="hw-language" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">AI answer language</label>
  <select id="hw-language" aria-label="AI answer language"></select>
`;
nav.append(controls);

const languageSelect = document.getElementById("hw-language");
for (const [code, name] of LANGUAGE_OPTIONS) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = name;
  languageSelect.append(option);
}
const supported = new Set(LANGUAGE_OPTIONS.map(([code]) => code));
let savedLanguage = "en";
try { savedLanguage = sessionStorage.getItem("humanity-world-language") || localStorage.getItem("humanity-world-language") || "en"; } catch (_) { /* storage may be disabled */ }
const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
languageSelect.value = supported.has(savedLanguage) ? savedLanguage : (supported.has(browserLanguage) ? browserLanguage : "en");
languageSelect.addEventListener("change", () => {
  try { localStorage.setItem("humanity-world-language", languageSelect.value); } catch (_) { /* optional preference */ }
  const matchingButton = document.querySelector(`.lang[data-lang="${languageSelect.value}"]`);
  if (matchingButton) matchingButton.click();
});
document.querySelectorAll(".lang[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    if (supported.has(button.dataset.lang)) languageSelect.value = button.dataset.lang;
  });
});

const statusText = document.getElementById("hw-auth-status");
const openButton = document.getElementById("hw-open-auth");
const signOutButton = document.getElementById("hw-sign-out");
const backdrop = document.createElement("div");
backdrop.className = "hw-dialog-backdrop";
backdrop.hidden = true;
backdrop.innerHTML = `
  <section class="hw-dialog" role="dialog" aria-modal="true" aria-labelledby="hw-title">
    <button class="hw-close" id="hw-close-auth" type="button" aria-label="Close access form">×</button>
    <div aria-hidden="true" style="font-size:2.7rem;color:#22c5df;margin-bottom:8px">◉</div>
    <h2 id="hw-title">Humanity World access</h2>
    <p>Paste the Mallik Group access code provided by the site owner to use the worldwide learning guide.</p>
    <form id="hw-code-form">
      <label>Group access code
        <input id="hw-code" name="code" type="password" autocomplete="one-time-code" required maxlength="512" placeholder="Paste your access code here">
      </label>
      <button id="hw-code-submit" type="submit">Continue</button>
    </form>
    <p class="hw-message" id="hw-auth-message" role="status" aria-live="polite"></p>
    <p class="hw-security">This shared group code is an access gate, not a personal account. Do not paste an AI provider API key here. Provider keys are configured privately by the site owner on the server.</p>
  </section>
`;
document.body.append(backdrop);

const codeForm = document.getElementById("hw-code-form");
const codeInput = document.getElementById("hw-code");
const codeSubmit = document.getElementById("hw-code-submit");
const message = document.getElementById("hw-auth-message");
let accessCode = "";
try { accessCode = sessionStorage.getItem("humanity-world-access-code") || ""; } catch (_) { /* storage may be disabled */ }

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ffb4a9" : "#a8e7d2";
}
function showGate() {
  backdrop.hidden = false;
  showMessage("");
  document.getElementById("hw-close-auth").focus();
}
function hideGate() {
  backdrop.hidden = true;
  openButton.focus();
}
function setSignedIn(isSignedIn) {
  statusText.textContent = isSignedIn ? "Mallik Group access active" : "Group access not active";
  openButton.hidden = isSignedIn;
  signOutButton.hidden = !isSignedIn;
}

openButton.addEventListener("click", showGate);
document.getElementById("hw-close-auth").addEventListener("click", hideGate);
backdrop.addEventListener("click", (event) => { if (event.target === backdrop) hideGate(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !backdrop.hidden) hideGate(); });

const originalFetch = window.fetch.bind(window);
codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = codeInput.value.trim();
  if (!code) { showMessage("Paste the access code first.", true); return; }
  codeSubmit.disabled = true;
  showMessage("Checking code…");
  try {
    const response = await originalFetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Access could not be confirmed.");
    accessCode = code;
    try { sessionStorage.setItem("humanity-world-access-code", code); } catch (_) { /* keep in memory */ }
    setSignedIn(true);
    hideGate();
  } catch (error) {
    accessCode = "";
    try { sessionStorage.removeItem("humanity-world-access-code"); } catch (_) { /* optional */ }
    showMessage(error.message || "That code was not accepted. Try again.", true);
  } finally {
    codeSubmit.disabled = false;
  }
});

signOutButton.addEventListener("click", () => {
  accessCode = "";
  try { sessionStorage.removeItem("humanity-world-access-code"); } catch (_) { /* optional */ }
  setSignedIn(false);
});

// The group code is sent only to this origin's access/AI endpoints. AI provider keys never reach the browser.
window.fetch = async (input, init = {}) => {
  const target = new URL(typeof input === "string" ? input : input.url, window.location.href);
  if (target.origin === window.location.origin && target.pathname === "/api/ask") {
    if (!accessCode) {
      showGate();
      return new Response(JSON.stringify({ error: "Paste the Mallik Group access code to continue." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("X-Mallik-Group-Code", accessCode);
    let body = init.body;
    if (typeof body === "string") {
      try { body = JSON.stringify({ ...JSON.parse(body), language: languageSelect.value }); } catch (_) { /* leave invalid JSON for server validation */ }
    }
    init = { ...init, headers, body };
    const response = await originalFetch(input, init);
    if (response.status === 401) {
      accessCode = "";
      try { sessionStorage.removeItem("humanity-world-access-code"); } catch (_) { /* optional */ }
      setSignedIn(false);
      showGate();
    }
    return response;
  }
  return originalFetch(input, init);
};

if (accessCode) setSignedIn(true);

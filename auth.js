const FIREBASE_SDK_VERSION = "11.10.0";
const LANGUAGE_OPTIONS = [
  ["en", "English"], ["ne", "नेपाली"], ["hi", "हिन्दी"], ["es", "Español"],
  ["fr", "Français"], ["pt", "Português"], ["ar", "العربية"], ["zh", "中文"],
  ["bn", "বাংলা"], ["ur", "اردو"], ["sw", "Kiswahili"], ["id", "Bahasa Indonesia"],
  ["de", "Deutsch"], ["ja", "日本語"], ["ko", "한국어"], ["ru", "Русский"],
  ["it", "Italiano"], ["tr", "Türkçe"], ["vi", "Tiếng Việt"], ["th", "ไทย"],
  ["fa", "فارسی"], ["pa", "ਪੰਜਾਬੀ"], ["ta", "தமிழ்"], ["te", "తెలుగు"],
  ["mr", "मराठी"], ["fil", "Filipino"], ["ha", "Hausa"], ["am", "አማርኛ"],
  ["yo", "Yorùbá"], ["uk", "Українська"], ["pl", "Polski"], ["nl", "Nederlands"],
  ["sv", "Svenska"], ["el", "Ελληνικά"], ["he", "עברית"], ["ro", "Română"],
  ["hu", "Magyar"], ["cs", "Čeština"], ["ms", "Bahasa Melayu"], ["km", "ភាសាខ្មែរ"],
];

const style = document.createElement("style");
style.textContent = `
  .hw-account{position:fixed;right:18px;bottom:18px;z-index:1000;display:flex;align-items:center;gap:10px;flex-wrap:wrap;max-width:calc(100vw - 36px);padding:11px 13px;background:#fff;border:1px solid #dce7df;border-radius:14px;box-shadow:0 12px 38px #10271e24;color:#14251e;font:14px/1.4 system-ui,sans-serif}
  .hw-account button,.hw-account select{font:inherit;border:1px solid #cbd8ce;border-radius:8px;padding:8px 10px;background:#fff;color:#14251e}
  .hw-account button{cursor:pointer;font-weight:700}.hw-account .hw-primary{background:#145b40;color:#fff;border-color:#145b40}.hw-account button:focus-visible,.hw-account select:focus-visible{outline:3px solid #d59c35;outline-offset:2px}
  .hw-account-status{max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hw-account-note{position:fixed;right:18px;bottom:88px;z-index:1000;max-width:min(360px,calc(100vw - 36px));padding:12px 14px;border-radius:10px;background:#10271e;color:#fff;box-shadow:0 8px 25px #10271e33;font:14px/1.5 system-ui,sans-serif}
  @media(max-width:600px){.hw-account{left:10px;right:10px;bottom:10px;max-width:none;justify-content:space-between}.hw-account-status{max-width:130px}}
`;
document.head.append(style);

const bar = document.createElement("section");
bar.className = "hw-account";
bar.setAttribute("aria-label", "Account and answer language");
bar.innerHTML = `
  <span class="hw-account-status" id="hw-auth-status" role="status">Checking sign-in…</span>
  <button class="hw-primary" id="hw-sign-in" type="button">Continue with Google</button>
  <button id="hw-sign-out" type="button" hidden>Sign out</button>
  <label for="hw-language" class="visually-hidden" style="position:absolute;clip:rect(0,0,0,0)">Answer language</label>
  <select id="hw-language" aria-label="Choose answer language"></select>
`;
document.body.append(bar);

const languageSelect = document.getElementById("hw-language");
for (const [code, name] of LANGUAGE_OPTIONS) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = name;
  languageSelect.append(option);
}
const savedLanguage = localStorage.getItem("humanity-world-language");
const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
const availableLanguages = new Set(LANGUAGE_OPTIONS.map(([code]) => code));
languageSelect.value = availableLanguages.has(savedLanguage) ? savedLanguage : (availableLanguages.has(browserLanguage) ? browserLanguage : "en");
languageSelect.addEventListener("change", () => localStorage.setItem("humanity-world-language", languageSelect.value));

const statusText = document.getElementById("hw-auth-status");
const signInButton = document.getElementById("hw-sign-in");
const signOutButton = document.getElementById("hw-sign-out");
let auth = null;
let googleProvider = null;

function notice(message) {
  document.querySelector(".hw-account-note")?.remove();
  const note = document.createElement("div");
  note.className = "hw-account-note";
  note.setAttribute("role", "alert");
  note.textContent = message;
  document.body.append(note);
  window.setTimeout(() => note.remove(), 6000);
}

signInButton.addEventListener("click", async () => {
  if (!auth || !googleProvider) {
    notice("Google sign-in is not configured yet. Please contact the site owner.");
    return;
  }
  signInButton.disabled = true;
  try {
    await auth.signInWithPopup(googleProvider);
  } catch (error) {
    console.error("Google sign-in failed:", error.code || "unknown error");
    notice("Sign-in was not completed. Check your Google account and try again.");
  } finally {
    signInButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  if (auth) await auth.signOut();
});

// Attach a short-lived Firebase ID token only to this site's AI endpoint.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const target = new URL(typeof input === "string" ? input : input.url, window.location.href);
  if (target.origin === window.location.origin && target.pathname === "/api/ask") {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      notice("Sign in with Google before using the study guide.");
      return new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("Authorization", `Bearer ${await currentUser.getIdToken()}`);
    init = { ...init, headers };
    const payload = typeof init.body === "string" ? JSON.parse(init.body) : {};
    payload.language = languageSelect.value;
    init.body = JSON.stringify(payload);
  }
  return originalFetch(input, init);
};

async function initializeGoogleAuth() {
  try {
    const configResponse = await originalFetch("/api/auth-config", { headers: { Accept: "application/json" } });
    if (!configResponse.ok) throw new Error("Firebase web configuration unavailable");
    const config = await configResponse.json();
    const appSdk = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`);
    const authSdk = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`);
    const firebaseApp = appSdk.initializeApp(config);
    auth = authSdk.getAuth(firebaseApp);
    googleProvider = new authSdk.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);
    authSdk.onAuthStateChanged(auth, (user) => {
      if (user) {
        statusText.textContent = user.displayName || user.email || "Signed in";
        signInButton.hidden = true;
        signOutButton.hidden = false;
      } else {
        statusText.textContent = "Not signed in";
        signInButton.hidden = false;
        signOutButton.hidden = true;
      }
    });
  } catch (error) {
    console.info("Google sign-in unavailable:", error.message);
    statusText.textContent = "Sign-in setup required";
  }
}

initializeGoogleAuth();

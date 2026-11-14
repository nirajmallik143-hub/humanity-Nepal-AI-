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
  .hw-account{position:relative;z-index:1001;display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-left:auto;color:#e8f7f0;font:14px/1.4 system-ui,sans-serif}
  .hw-account button,.hw-account select{font:inherit;border:1px solid #ffffff44;border-radius:9px;padding:9px 11px;background:#ffffff12;color:#fff}
  .hw-account button{cursor:pointer;font-weight:700}.hw-account .hw-primary{background:#f2c66d;color:#10251f;border-color:#f2c66d}
  .hw-account select option{background:#fff;color:#14251e}.hw-account-status{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hw-dialog-backdrop{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:18px;background:rgba(3,10,20,.78);backdrop-filter:blur(12px)}
  .hw-dialog{width:min(520px,100%);max-height:min(90vh,820px);overflow:auto;position:relative;padding:clamp(24px,6vw,42px);border:1px solid rgba(81,212,194,.35);border-radius:26px;background:linear-gradient(145deg,#101c31,#091323);color:#f5f7fb;box-shadow:0 30px 100px #0009;text-align:center}
  .hw-dialog h2{margin:0 0 8px;font-size:clamp(1.7rem,5vw,2.4rem)}.hw-dialog p{color:#aab8ca;margin:0 0 22px}.hw-dialog form{display:grid;gap:13px;text-align:left}.hw-dialog label{display:grid;gap:6px;color:#c6d1df;font-size:.92rem;font-weight:650}
  .hw-dialog input{width:100%;padding:14px 15px;border:1px solid #39485e;border-radius:12px;background:#101b2d;color:white;font:inherit}.hw-dialog input:focus-visible,.hw-dialog button:focus-visible{outline:3px solid #22c5df;outline-offset:3px}
  .hw-dialog button{min-height:48px;padding:12px 15px;border:0;border-radius:12px;background:linear-gradient(100deg,#119bb7,#8b35e8);color:white;font:700 1rem system-ui,sans-serif;cursor:pointer}
  .hw-dialog button:disabled{opacity:.6;cursor:wait}.hw-dialog .hw-alt{background:#1b2940;border:1px solid #3b4960}.hw-dialog .hw-close{position:absolute;top:13px;right:13px;width:40px;height:40px;min-height:40px;padding:0;background:transparent;border:1px solid #3b4960;font-size:1.35rem}
  .hw-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;margin:12px 0 20px;border:1px solid #34445a;border-radius:14px}.hw-mode button{background:transparent;color:#c5d0df}.hw-mode button[aria-pressed=true]{background:linear-gradient(100deg,#124d65,#432d78);color:white}
  .hw-message{min-height:24px;margin:12px 0 0!important;color:#a8e7d2!important;font-size:.92rem}.hw-links{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:16px}.hw-links button{min-height:unset;padding:3px;background:none;color:#b9d8ff;text-decoration:underline;font-size:.9rem}.hw-security{margin-top:24px!important;font-size:.83rem!important}
  .hw-install-button{border:1px solid #ffffff70;border-radius:10px;padding:9px 13px;background:#ffffff12;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer}
  @media(max-width:800px){.hw-account{margin:0}.hw-account-status{max-width:130px}}
  @media(max-width:500px){.hw-account-status{display:none}.hw-account select{max-width:118px;padding:8px 6px}}
`;
document.head.append(style);

const nav = document.querySelector(".nav") || document.body;
const accountControls = document.createElement("div");
accountControls.className = "hw-account";
accountControls.innerHTML = `
  <span class="hw-account-status" id="hw-auth-status" role="status">Checking account…</span>
  <button class="hw-primary" id="hw-open-auth" type="button">Sign in</button>
  <button id="hw-sign-out" type="button" hidden>Sign out</button>
  <label for="hw-language" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">AI answer language</label>
  <select id="hw-language" aria-label="AI answer language"></select>
`;
nav.append(accountControls);

const languageSelect = document.getElementById("hw-language");
for (const [code, name] of LANGUAGE_OPTIONS) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = name;
  languageSelect.append(option);
}
const supported = new Set(LANGUAGE_OPTIONS.map(([code]) => code));
const savedLanguage = localStorage.getItem("humanity-world-language");
const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
languageSelect.value = supported.has(savedLanguage) ? savedLanguage : (supported.has(browserLanguage) ? browserLanguage : "en");
languageSelect.addEventListener("change", () => localStorage.setItem("humanity-world-language", languageSelect.value));

const statusText = document.getElementById("hw-auth-status");
const openAuthButton = document.getElementById("hw-open-auth");
const signOutButton = document.getElementById("hw-sign-out");
let auth = null;
let googleProvider = null;
let authSdk = null;
let authMode = "signin";

const backdrop = document.createElement("div");
backdrop.className = "hw-dialog-backdrop";
backdrop.hidden = true;
backdrop.innerHTML = `
  <section class="hw-dialog" role="dialog" aria-modal="true" aria-labelledby="hw-title">
    <button class="hw-close" id="hw-close-auth" type="button" aria-label="Close sign in">×</button>
    <div aria-hidden="true" style="font-size:2.7rem;color:#22c5df;margin-bottom:8px">◉</div>
    <h2 id="hw-title">Welcome to Humanity World</h2>
    <p id="hw-subtitle">Create an account or sign in to continue learning.</p>
    <div class="hw-mode" role="group" aria-label="Account action">
      <button id="hw-mode-signin" type="button" aria-pressed="true">Sign in</button>
      <button id="hw-mode-signup" type="button" aria-pressed="false">Sign up</button>
    </div>
    <form id="hw-email-form">
      <label>Email address<input id="hw-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
      <label>Password<input id="hw-password" name="password" type="password" autocomplete="current-password" required minlength="12" maxlength="128" placeholder="At least 12 characters"></label>
      <button id="hw-email-submit" type="submit">Sign in</button>
    </form>
    <div class="hw-links"><button id="hw-reset-password" type="button">Forgot password?</button></div>
    <div style="display:flex;align-items:center;gap:12px;color:#8191a6;margin:18px 0" aria-hidden="true"><span style="height:1px;background:#35445a;flex:1"></span>or<span style="height:1px;background:#35445a;flex:1"></span></div>
    <button class="hw-alt" id="hw-google-signin" type="button">Continue with Google</button>
    <p class="hw-message" id="hw-auth-message" role="status" aria-live="polite"></p>
    <p class="hw-security">Use a unique password with 12+ characters. We never use a shared demo password. Email/password accounts must verify their email before using protected learning features.</p>
  </section>
`;
document.body.append(backdrop);

const emailForm = document.getElementById("hw-email-form");
const emailInput = document.getElementById("hw-email");
const passwordInput = document.getElementById("hw-password");
const emailSubmit = document.getElementById("hw-email-submit");
const authMessage = document.getElementById("hw-auth-message");
const modeSigninButton = document.getElementById("hw-mode-signin");
const modeSignupButton = document.getElementById("hw-mode-signup");

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#ffb4a9" : "#a8e7d2";
}
function showAuth() {
  backdrop.hidden = false;
  showMessage("");
  document.getElementById("hw-close-auth").focus();
}
function hideAuth() {
  backdrop.hidden = true;
  openAuthButton.focus();
}
function setMode(mode) {
  authMode = mode;
  const signingUp = mode === "signup";
  modeSigninButton.setAttribute("aria-pressed", String(!signingUp));
  modeSignupButton.setAttribute("aria-pressed", String(signingUp));
  document.getElementById("hw-title").textContent = signingUp ? "Create your account" : "Welcome back";
  document.getElementById("hw-subtitle").textContent = signingUp
    ? "Join Humanity World and learn with your community."
    : "Sign in to continue to the learning portal.";
  emailSubmit.textContent = signingUp ? "Create account" : "Sign in";
  passwordInput.autocomplete = signingUp ? "new-password" : "current-password";
  passwordInput.minLength = signingUp ? 12 : 1;
  document.getElementById("hw-reset-password").hidden = signingUp;
  showMessage(signingUp ? "Choose a unique password of at least 12 characters." : "");
}

openAuthButton.addEventListener("click", showAuth);
document.getElementById("hw-close-auth").addEventListener("click", hideAuth);
backdrop.addEventListener("click", (event) => { if (event.target === backdrop) hideAuth(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !backdrop.hidden) hideAuth(); });
modeSigninButton.addEventListener("click", () => setMode("signin"));
modeSignupButton.addEventListener("click", () => setMode("signup"));

function firebaseErrorMessage(error) {
  const messages = {
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-not-found": "No account was found for that email. You can create one using Sign up.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account already uses this email. Try signing in instead.",
    "auth/weak-password": "Use a unique password with at least 12 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a while and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
    "auth/unauthorized-domain": "This site domain is not authorized in Firebase Authentication yet.",
  };
  return messages[error?.code] || "Authentication could not be completed. Check your details and try again.";
}

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth || !authSdk) { showMessage("Sign-in is not configured. Please contact the site owner.", true); return; }
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (authMode === "signup" && password.length < 12) {
    showMessage("For safety, use a unique password with at least 12 characters.", true);
    return;
  }
  emailSubmit.disabled = true;
  showMessage(authMode === "signup" ? "Creating account…" : "Signing in…");
  try {
    if (authMode === "signup") {
      const credential = await authSdk.createUserWithEmailAndPassword(auth, email, password);
      await authSdk.sendEmailVerification(credential.user);
      await authSdk.signOut(auth);
      showMessage("Account created. Verify your email using the link we sent, then sign in.");
      setMode("signin");
      emailInput.value = email;
      passwordInput.value = "";
    } else {
      const credential = await authSdk.signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        await authSdk.sendEmailVerification(credential.user);
        await authSdk.signOut(auth);
        showMessage("Please verify your email first. We sent a new verification link.", true);
        return;
      }
      hideAuth();
    }
  } catch (error) {
    showMessage(firebaseErrorMessage(error), true);
  } finally {
    emailSubmit.disabled = false;
  }
});

document.getElementById("hw-reset-password").addEventListener("click", async () => {
  if (!auth || !authSdk) { showMessage("Sign-in is not configured yet.", true); return; }
  const email = emailInput.value.trim();
  if (!email) { showMessage("Enter your email address above, then choose Forgot password.", true); emailInput.focus(); return; }
  try {
    await authSdk.sendPasswordResetEmail(auth, email);
    showMessage("If an account exists for this address, a password reset email has been sent.");
  } catch (error) {
    showMessage(firebaseErrorMessage(error), true);
  }
});

document.getElementById("hw-google-signin").addEventListener("click", async () => {
  if (!auth || !googleProvider) { showMessage("Google sign-in is not configured yet.", true); return; }
  const button = document.getElementById("hw-google-signin");
  button.disabled = true;
  try {
    await authSdk.signInWithPopup(auth, googleProvider);
    hideAuth();
  } catch (error) {
    showMessage(firebaseErrorMessage(error), true);
  } finally {
    button.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  if (auth) await auth.signOut();
});

// Attach short-lived Firebase ID tokens only to this site's protected AI endpoint.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const target = new URL(typeof input === "string" ? input : input.url, window.location.href);
  if (target.origin === window.location.origin && target.pathname === "/api/ask") {
    const user = auth?.currentUser;
    if (!user) {
      showAuth();
      return new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
    const payload = typeof init.body === "string" ? JSON.parse(init.body) : {};
    payload.language = languageSelect.value;
    init = { ...init, headers, body: JSON.stringify(payload) };
  }
  return originalFetch(input, init);
};

async function initializeAuth() {
  try {
    const configResponse = await originalFetch("/api/auth-config", { headers: { Accept: "application/json" } });
    if (!configResponse.ok) throw new Error("Firebase web configuration unavailable");
    const config = await configResponse.json();
    const appSdk = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`);
    authSdk = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`);
    const firebaseApp = appSdk.initializeApp(config);
    auth = authSdk.getAuth(firebaseApp);
    googleProvider = new authSdk.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);
    authSdk.onAuthStateChanged(auth, (user) => {
      if (user && (user.emailVerified || user.providerData.some((provider) => provider.providerId === "google.com"))) {
        statusText.textContent = user.displayName || user.email || "Signed in";
        openAuthButton.hidden = true;
        signOutButton.hidden = false;
      } else {
        statusText.textContent = "Not signed in";
        openAuthButton.hidden = false;
        signOutButton.hidden = true;
      }
    });
  } catch (error) {
    statusText.textContent = "Sign-in setup required";
    console.info("Firebase Authentication unavailable:", error.message);
  }
}

initializeAuth();

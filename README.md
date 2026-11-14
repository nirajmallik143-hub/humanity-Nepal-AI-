# Humanity World — install and run on mobile, desktop, and web

**Free learning. Community empowerment. Human dignity.**

Humanity World is a responsive Progressive Web App (PWA): learners can use it in a browser and, where supported, install it from the browser to an Android or desktop home/app launcher. On iPhone and iPad, users can add it from Safari’s Share menu. It is not a native App Store or Play Store binary; publishing native store apps requires a separate wrapper/build, store accounts, review, and release process.

## Features

- Responsive education experience for phone, tablet, and desktop.
- PWA web manifest, install control, app icon, service worker, and an offline shell.
- Offline mode keeps only the app shell; Google sign-in and AI answers require internet.
- Google sign-in using Firebase Authentication; first sign-in creates an account, later sign-ins reuse it.
- Server-side Firebase ID-token verification for the study guide endpoint.
- Selectable AI answer language options. AI and translation quality varies; this does not mean every UI screen is fully translated.

## Install on your device

- **Android / supported desktop browsers:** open the HTTPS website and use the on-page **Install app** button or your browser menu’s Install/Add to Home Screen action. Install prompts vary by browser and may require visiting the site more than once.
- **iPhone / iPad:** open the site in Safari, tap **Share**, then **Add to Home Screen**. iOS does not expose the same install prompt as Chromium browsers.
- **Any device:** the site remains available at its HTTPS URL in a supported modern browser. Service workers require HTTPS, except on localhost.

Browser support and exact menus change; if the install button is unavailable, use the browser’s own install/add-to-home-screen menu. “Installable PWA” does not mean a native store app.

## Local development

Requires Python 3.10 or later.

```bash
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python api/app.py
```

Open <http://127.0.0.1:8080>. Check <http://127.0.0.1:8080/api/status>. Service worker support works on localhost.

## Configuration

### Firebase Google sign-in

1. Register a Firebase Web app and enable Google in Firebase Authentication.
2. Configure the OAuth consent screen and add localhost, preview, and production domains to Authorized domains.
3. Set these server environment values: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`.
4. Store the Firebase Admin service-account JSON in `FIREBASE_SERVICE_ACCOUNT_JSON` as a secret. Never commit it.

Google sign-in is the account credential. Do not use a four-digit code as a password. Add passkeys or Google two-step verification to the Google account for stronger security.

### AI study guide

Set `OPENAI_API_KEY` as a server-side secret. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Never put keys in browser code or source control. Configure spend controls and hosting-level rate limiting before public use.

Questions submitted to the assistant are sent to the configured AI provider. Do not submit sensitive information. Publish a privacy notice and have native speakers review translations. The AI is an educational aid, not medical, legal, or financial advice.

## Vercel deployment

1. Connect the GitHub repository to Vercel and set the repository root as the project root.
2. Confirm current Vercel Python/Flask support for `api/app.py`, `requirements.txt`, and `vercel.json`.
3. Add Firebase values, `FIREBASE_SERVICE_ACCOUNT_JSON`, and `OPENAI_API_KEY` to Vercel Environment Variables for the correct Preview/Production environments. Keep service-account and provider keys private.
4. Deploy a Preview, test PWA routes (`/manifest.webmanifest`, `/sw.js`, `/offline.html`), Google sign-in, and API responses, then merge and verify Production.
5. Check browser dev tools for manifest/service-worker errors. Test install and offline shell on actual target devices.

## License

Copyright (c) 2026 Niraj Mallik. MIT License. See [`LICENSE`](LICENSE) for full terms.

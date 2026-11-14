# Cross-platform PWA launch checklist

## Build and configuration

- [ ] Connect the intended GitHub repository/branch to Vercel.
- [ ] Confirm Vercel's current Python/Flask runtime supports the `api/app.py` and `vercel.json` routing.
- [ ] Configure Firebase Google provider, OAuth consent, and localhost/preview/production authorized domains.
- [ ] Set Firebase Web config values in Vercel; store `FIREBASE_SERVICE_ACCOUNT_JSON` and `OPENAI_API_KEY` as private environment secrets.
- [ ] Ensure there are no credential files, API keys, or `.env` files in Git.
- [ ] Preserve the MIT License and Copyright (c) 2026 Niraj Mallik.

## Progressive Web App checks

- [ ] `GET /manifest.webmanifest` returns valid manifest JSON and correct content type.
- [ ] `GET /sw.js` returns JavaScript with service-worker scope `/` and no-cache headers.
- [ ] Confirm `/icons/humanity.svg`, `/offline.html`, `/pwa.js`, `/auth.js`, and `/scene.css` load successfully.
- [ ] Check the browser console/Application panel for manifest and service-worker errors.
- [ ] Test install flow on Android Chrome and at least one supported desktop Chromium browser.
- [ ] Test iPhone/iPad using Safari → Share → Add to Home Screen; confirm standalone launch if supported.
- [ ] Test offline shell: load online once, go offline, revisit. Confirm login and AI clearly require a connection.
- [ ] Confirm service worker does not cache `/api/*`, Firebase auth configuration, prompts, or AI responses.
- [ ] Check reduced-motion preference and mobile safe-area/layout behavior.

## Authentication and AI checks

- [ ] Confirm first Google sign-in creates an account and subsequent sign-in reuses it.
- [ ] Confirm unauthenticated `POST /api/ask` is denied; authenticated requests work when AI is configured.
- [ ] Test missing secrets, empty/oversized input, supported language selection, and provider timeout/error handling.
- [ ] Configure provider budget limits and hosting-layer rate limiting/abuse protection.
- [ ] Never use a four-digit PIN as the account password; use Google security features/passkeys/2-step verification.

## Release and public launch

- [ ] Test preview on real Android, iOS, and desktop devices/browsers.
- [ ] Ask native speakers to check translations and AI answer quality; don't advertise unsupported languages as complete.
- [ ] Publish privacy information explaining Firebase sign-in and AI-provider prompt handling.
- [ ] Merge only after review, then verify the production site, HTTPS, login, PWA install, and health endpoint.
- [ ] Document that this is a PWA, not a Play Store/App Store native application.

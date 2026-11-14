# Humanity World — PWA + secure accounts

**Free learning. Community empowerment. Human dignity.**

Humanity World is an installable Progressive Web App for mobile, desktop, and the web. It combines the projects' education and community goals with Google or verified email/password sign-in, a multilingual AI study guide, and an offline app shell.

## Features

- Responsive, accessible landing page with a CSS 3D-inspired visual theme.
- PWA manifest, install controls, service worker, offline page, and app icon.
- Firebase Authentication: Google sign-in or email/password account creation, email verification, sign-in, and password reset.
- Server-side Firebase ID-token verification; AI requests require a verified account.
- 40 selectable AI answer languages; the page UI itself is not fully translated into every language.
- AI provider credentials and Firebase Admin service-account credentials stay server-side.

## Password/security note

There is **no shared password such as `1234`** in this project. A universal shared password is insecure and would let anyone access every account. Users create their own unique password (12+ characters recommended) or use Google sign-in. Firebase handles password storage and reset; this project never stores raw passwords. Email/password users must verify their address before accessing the protected AI endpoint. Enable passkeys or two-step verification on Google accounts where available.

## Local development

Requires Python 3.10 or later.

```bash
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python api/app.py
```

Open <http://127.0.0.1:8080>; health endpoint: <http://127.0.0.1:8080/api/status>.

## Firebase configuration

1. Create a Firebase project and register a Web app.
2. In Firebase Authentication, enable **Google** and **Email/Password** providers.
3. Configure the OAuth consent screen and authorized domains for localhost, Vercel Preview, and Production.
4. Add these environment variables to local development and Vercel:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — full Firebase Admin service-account JSON (private secret; never commit)
5. Test signup, verification email, sign-in, Google sign-in, and password reset.

## AI configuration

Set `OPENAI_API_KEY` as a server-side secret. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). The study guide sends submitted questions to the configured AI provider. Do not send sensitive information. Add provider spend limits and hosting-layer rate limiting/abuse protection before public use.

AI answers can be incorrect and vary in quality by language. Have fluent speakers review translations. This tool is an educational aid, not professional medical, legal, or financial advice. Publish a privacy notice explaining Firebase account handling and AI prompt processing.

## Install on devices

- Android and supported desktop browsers: open the HTTPS site and use **Install app** or the browser's Install/Add to Home Screen menu.
- iPhone/iPad: open in Safari → Share → Add to Home Screen.
- The PWA provides an offline shell only; login and AI require internet. It is not a native Play Store or App Store app.

## Vercel

Connect the repository to Vercel, use the repository root, and configure all Firebase and AI variables in Vercel Project Settings → Environment Variables. Confirm the current Vercel Python/Flask runtime supports `api/app.py` and the checked-in routing config. Deploy a Preview, test auth/PWA/API behavior, then promote by merging to the configured production branch.

## License

Copyright (c) 2026 Niraj Mallik. MIT License. See [`LICENSE`](LICENSE) for the full terms.

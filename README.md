# Humanity World

**Free learning. Community empowerment. Human dignity.**

Humanity World is a multilingual learning project, starting in Nepal and welcoming learners around the world. The site offers a study-guide assistant, Google account sign-in, and AI-generated answers in a selection of languages.

## Features

- Responsive education landing page and English, Nepali, and Hindi interface elements.
- Google sign-in through Firebase Authentication. First sign-in creates the account; later visits sign in to that same account.
- The AI study-guide API requires a valid Firebase ID token, verified server-side with Firebase Admin.
- Answer-language selector with 40 options. This controls AI answer language; it does not mean every part of the site is fully translated or that every model response is fluent.
- Input validation and size limits, provider timeout, and safe error responses.

## Account security

This app uses Google sign-in as the account credential. **A four-digit code is not used as a password**: a 4-digit PIN has only 10,000 combinations and is unsafe as a standalone worldwide login. Use a Google account with its security protections, including passkeys or two-step verification. If a PIN is ever added, keep it only as a local convenience lock after authentication—not a substitute for account security.

The first successful Google sign-in creates a Firebase Auth user automatically; users do not need a separate signup flow. The provider may allow Google accounts beyond consumer `@gmail.com` addresses, depending on project settings.

## Local development

Requires Python 3.10 or later. Install packages:

```bash
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

Configure the Firebase and AI variables described below in your shell, then run:

```bash
python api/app.py
```

Open <http://127.0.0.1:8080>; health check: <http://127.0.0.1:8080/api/status>.

## Required configuration

### Firebase

1. Create a Firebase project and register a Web app.
2. In Firebase Authentication, enable the Google provider and configure the OAuth consent screen.
3. Add localhost and your production hostname to Firebase Authentication's authorized domains.
4. Create a Firebase service account for server-side token verification. Store the downloaded credential JSON only as a protected secret.
5. Set these environment variables locally and in Vercel:
   - `FIREBASE_API_KEY` — Firebase Web app config; public client configuration, not an Admin key.
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — entire service-account JSON; **private secret**.

The service-account credential is never returned by `/api/auth-config`. Never commit it, a `.env` file, or private keys to GitHub. Restrict its permissions to what Firebase Auth token verification needs and rotate it if exposed.

### AI provider

Set `OPENAI_API_KEY` as a server-side secret. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Do not place the key in browser code or `vercel.json`.

## Language and privacy notes

The language selector personalizes the AI response language and remembers the selection in that browser. It does not translate every page label. The available languages are model-generated and quality can vary, especially for less-supported languages; have native speakers review translations before claiming full language support. Submitted prompts go to the configured AI provider. Do not submit sensitive personal information. Publish a privacy notice and configure provider spend controls and hosting-layer rate limiting before public launch. This project is an educational aid, not professional medical, legal, or financial advice.

## Vercel deployment

1. Connect the GitHub repository to a Vercel project with the repository root as the project root.
2. Add the Firebase variables and `OPENAI_API_KEY` under Project Settings → Environment Variables for the intended Preview and Production environments. Use secret values for the service-account JSON and AI key.
3. Confirm the current Vercel Python/Flask runtime supports the repository's `api/app.py`, `requirements.txt`, and `vercel.json` configuration.
4. Deploy a Preview, then test sign-in, `/api/status`, and the protected AI endpoint. Merge to the configured production branch only after review.
5. Check Vercel build/runtime logs and the production URL. Redeploy after changing environment variables.

## License

Copyright (c) 2026 Niraj Mallik. Licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms.

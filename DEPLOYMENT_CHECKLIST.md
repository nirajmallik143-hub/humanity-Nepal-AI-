# Deployment checklist — Humanity World

## Firebase
- [ ] Enable Google and Email/Password sign-in providers.
- [ ] Configure OAuth consent and authorized localhost, preview, and production domains.
- [ ] Set `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, and `FIREBASE_APP_ID`.
- [ ] Store Firebase Admin service-account JSON only as `FIREBASE_SERVICE_ACCOUNT_JSON` secret.
- [ ] Confirm verification email and password-reset email deliver.

## GitHub and Vercel
- [ ] Review the feature branch diff; preserve MIT License and Copyright (c) 2026 Niraj Mallik.
- [ ] Ensure there are no committed `.env`, provider keys, or Firebase credential files.
- [ ] Connect the intended GitHub repo to Vercel; set repository root and verify supported Python/Flask routing.
- [ ] Set Firebase variables plus `OPENAI_API_KEY` and optional `OPENAI_MODEL` as Vercel environment variables for Preview and Production.
- [ ] Deploy Preview; inspect build/runtime logs before production merge.

## Local `.env` protection
`.env` is ignored by Git via the repository-root `.gitignore`. On a local checkout, use these commands to restrict permissions and verify Git ignores the file. The `printf` command is only needed if `.env` is not already listed in `.gitignore` (it is already listed in this repository):

```sh
chmod 600 .env
printf '\n.env\n' >> .gitignore
git check-ignore -v .env
```

## Authentication checks
- [ ] Create an account with a unique password (no shared `1234` password), verify email, and sign in.
- [ ] Test Google signup/login and returning-user login.
- [ ] Test forgot-password flow.
- [ ] Confirm unverified email accounts and requests without valid Firebase tokens cannot use `/api/ask`.
- [ ] Confirm logout and session persistence behavior.

## PWA, AI, and release
- [ ] Verify manifest, icons, service worker, offline page, install prompt, and mobile/desktop layout.
- [ ] Confirm service worker does not cache `/api/*`, auth config, prompts, or AI responses.
- [ ] Test authenticated AI in supported language choices, missing secrets, invalid input, and provider failures.
- [ ] Add hosting-layer rate limiting and provider spending controls.
- [ ] Publish privacy notice; explain prompts go to the configured AI provider and review language quality with fluent speakers.
- [ ] Test Preview on Android, iOS Safari, and desktop; merge only after review.

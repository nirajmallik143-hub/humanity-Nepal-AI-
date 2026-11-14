# GitHub and Vercel deployment checklist

## Firebase setup

- [ ] Create/register the Firebase project and Web app.
- [ ] Enable Google in Firebase Authentication and configure OAuth consent.
- [ ] Add localhost, Vercel preview, and production hostnames to Authorized domains.
- [ ] Create a least-privilege service account for Admin token verification.
- [ ] Set `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, and `FIREBASE_APP_ID` in the deployment environment.
- [ ] Store the service account JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` secret; never commit it.
- [ ] Confirm first Google sign-in creates an account and subsequent sign-in returns the existing account.

## GitHub

- [ ] Review the feature branch diff and preserve the MIT `LICENSE` and 2026 copyright notice.
- [ ] Check that no `.env`, API keys, Firebase service account, or credentials are committed.
- [ ] Open a pull request using `PR_DESCRIPTION.md`; run CI and review changes before merge.
- [ ] Confirm the branch configured for Vercel production before merging.

## Vercel configuration

- [ ] Connect the intended GitHub repository/project and set the repository root.
- [ ] Confirm current Vercel Python/Flask documentation supports the included `vercel.json` and `api/app.py` routing.
- [ ] Set Firebase variables, `FIREBASE_SERVICE_ACCOUNT_JSON`, `OPENAI_API_KEY`, and optional `OPENAI_MODEL` for appropriate Preview/Production environments.
- [ ] Redeploy after changing environment variables; review build and runtime logs.

## Smoke tests

- [ ] Check homepage, mobile layout, accessibility/keyboard focus, and `/api/status`.
- [ ] Sign in with a Google account; sign out and sign back in to verify the existing account is recognized.
- [ ] Confirm an unauthenticated `POST /api/ask` returns 401 and an authenticated request succeeds when the AI secret is configured.
- [ ] Test an unsupported language, empty question, oversized question, missing provider secret, and provider error.
- [ ] Confirm the language preference produces the selected AI answer language; have native speakers review translations.
- [ ] Check logs and responses do not expose credentials or raw provider errors.

## Before public launch

- [ ] Configure hosting-layer abuse/rate limiting and provider spending limits.
- [ ] Publish a privacy notice explaining Firebase sign-in and that submitted questions are sent to the configured AI provider.
- [ ] Review provider data handling, retention, and regional requirements for the intended users.
- [ ] Do not use a four-digit PIN as an account password; account sign-in is secured by Google/Firebase.
- [ ] Verify production HTTPS, custom domain if used, and production smoke tests.

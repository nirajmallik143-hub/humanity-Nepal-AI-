# GitHub and Vercel deployment checklist

## GitHub

- [ ] Confirm the intended destination repository and branch.
- [ ] Review the diff and retain the existing `LICENSE` file and 2026 copyright notice.
- [ ] Ensure no API keys, tokens, or `.env` files are committed.
- [ ] Open a pull request from the feature branch; use `PR_DESCRIPTION.md` as the description.
- [ ] Run any configured CI checks and review the preview before merging.
- [ ] Merge only after approval; verify the production branch is the one connected to Vercel.

## Vercel configuration

- [ ] Import/connect the GitHub repository to the correct Vercel project.
- [ ] Set the project root directory to the repository root.
- [ ] Confirm the current Vercel Python/Flask instructions support the checked-in `vercel.json` and `api/app.py` layout.
- [ ] Add `OPENAI_API_KEY` in Vercel Project Settings → Environment Variables for Preview and Production as appropriate.
- [ ] Optionally add `OPENAI_MODEL`; otherwise the app defaults to `gpt-4o-mini`.
- [ ] Keep secrets out of Git, HTML, and client-side JavaScript; redeploy after changing environment variables.
- [ ] Deploy a preview before production and inspect the Vercel build/runtime logs.

## Smoke tests

- [ ] Open the preview URL and check responsive layout and keyboard focus.
- [ ] Check `GET /api/status` returns active JSON.
- [ ] Test the study helper with a short, non-sensitive prompt in English, Nepali, and Hindi.
- [ ] Test without `OPENAI_API_KEY` and confirm the UI shows a clear setup message.
- [ ] Test invalid/empty input and a provider failure; ensure no provider secrets or raw error bodies are exposed.
- [ ] Confirm provider usage limits/billing are configured.

## Before public launch

- [ ] Add or configure hosting-layer rate limiting/abuse protection and monitor provider spend.
- [ ] Publish a privacy notice explaining that submitted questions are sent to the configured AI provider.
- [ ] Confirm the provider's data handling, retention, and regional requirements are acceptable for your audience.
- [ ] Ask educators/local users to review translations and learning guidance.
- [ ] Verify production URL, custom domain/HTTPS (if used), and `/api/status` after merge/deployment.

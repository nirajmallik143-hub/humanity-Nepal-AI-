# GitHub and Vercel deployment checklist

## GitHub

- [ ] Confirm the intended destination repository and branch.
- [ ] Review the diff and retain the existing `LICENSE` file and 2026 copyright notice.
- [ ] Ensure no API keys, tokens, or `.env` files are committed.
- [ ] Open a pull request from the feature branch; use `PR_DESCRIPTION.md` as its description.
- [ ] Run configured CI checks and review the preview before merging.
- [ ] Merge only after approval; verify the production branch is connected to Vercel.

## Vercel configuration

- [ ] Connect the GitHub repository to the intended Vercel project.
- [ ] Set the project root to the repository root.
- [ ] Confirm current Vercel Python/Flask docs support the checked-in `vercel.json` and `api/app.py` layout.
- [ ] Add `OPENAI_API_KEY` in Project Settings → Environment Variables for Preview and Production as appropriate.
- [ ] Optionally add `OPENAI_MODEL`; otherwise the app defaults to `gpt-4o-mini`.
- [ ] Keep secrets out of Git and client code; redeploy after changing variables.
- [ ] Deploy a preview before production and inspect build/runtime logs.

## Smoke tests

- [ ] Check the preview URL, mobile layout, and keyboard focus.
- [ ] Confirm `GET /api/status` returns active JSON.
- [ ] Test `/api/ask` with a short, non-sensitive prompt in English, Nepali, and Hindi.
- [ ] Test without `OPENAI_API_KEY`; verify the page provides a clear setup message.
- [ ] Test invalid and empty input and a provider failure; confirm secrets and raw provider error bodies are not exposed.
- [ ] Set provider usage and billing limits.

## Before public launch

- [ ] Add hosting-layer rate limiting/abuse protection and monitor provider spend.
- [ ] Publish a privacy notice explaining that submitted prompts go to the configured AI provider.
- [ ] Review provider data handling, retention, and regional requirements for your audience.
- [ ] Ask educators/local users to review translations and learning guidance.
- [ ] Verify production URL, HTTPS/custom domain if used, and `/api/status` after deployment.

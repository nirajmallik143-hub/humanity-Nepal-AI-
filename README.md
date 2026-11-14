# Humanity World — learn, grow, and help each other

> A more humane world starts with shared knowledge.

Humanity World is a multilingual learning guide. Visitors enter a shared group access code, ask a learning question, and receive a concise answer in one of 40 supported languages. The site is a mobile-friendly Progressive Web App (PWA) and can use either Google Gemini or OpenAI through a private Python/Flask API.

## Live site and deployment

- **Live site:** [humanity-nepal-ai.vercel.app](https://humanity-nepal-ai.vercel.app) (configured as this repository's project homepage; availability depends on the Vercel deployment).
- **Deploy this repository to Vercel:** [Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirajmallik143-hub%2Fhumanity-Nepal-AI-)
- **Hosting configuration:** `vercel.json` routes requests to the Flask app in `api/app.py`.

## Features

- **40 answer languages**, including English, Nepali, Hindi, Arabic, Chinese, Spanish, and French.
- **Shared-code access gate** for a small group; there are no individual user accounts.
- **Gemini or OpenAI provider support.** Provider API keys stay on the server and are never sent to the browser.
- **Installable PWA** with an offline shell and mobile-friendly layout.
- **Learning-focused answers** with practical examples, honest uncertainty, and extra care around high-stakes topics.

## Run locally

Requires Python 3.10 or later.

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set a strong, private group code and one AI provider's key. Then start the app:

```bash
python api/app.py
```

Open <http://127.0.0.1:8080>. The readiness endpoint is <http://127.0.0.1:8080/api/status>.

## Configure secrets

`.env` is for local development only and is ignored by Git. Never commit it, put secrets in frontend code, or share provider credentials with visitors.

Set these values in your local `.env` and in Vercel Project Settings → Environment Variables for the environments you intend to deploy:

| Variable | Required | Description |
| --- | --- | --- |
| `MALLIK_GROUP_CODE` | Yes | A long, unique shared access code. Share it only with intended visitors and rotate it if exposed. |
| `AI_PROVIDER` | Recommended | `gemini` or `openai`; explicitly choose one if both provider keys are present. |
| `GEMINI_API_KEY` | For Gemini | Gemini API key. `GOOGLE_API_KEY` is also accepted. |
| `GEMINI_MODEL` | No | Gemini model; defaults to `gemini-2.5-flash`. |
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key. |
| `OPENAI_MODEL` | No | OpenAI model; defaults to `gpt-4o-mini`. |

Configure exactly one provider key when possible. The status endpoint reports whether access and AI are configured, but never returns secret values. Vercel does not import values from your local `.env` file automatically.

## Deploy to Vercel

1. Import this GitHub repository into Vercel using the deploy link above, or connect it from the Vercel dashboard.
2. Keep the repository root as the project root and use the included `vercel.json` configuration.
3. Add `MALLIK_GROUP_CODE` and the selected provider's variables in Vercel Project Settings → Environment Variables. Select Preview and Production scopes as appropriate. Do not commit secrets.
4. Deploy a Preview first. Check the build and runtime logs, then visit `/api/status` on the deployment. Confirm `accessConfigured` and `aiConfigured` are `true` and that the expected provider is shown.
5. Test the access code and a sample learning question before sharing the deployment URL. After a successful production deployment, update the repository homepage if the URL changes.

## API

- `GET /api/status` — reports service, access, and provider readiness without exposing secrets.
- `POST /api/access` — validates a group code. JSON body: `{"code":"your-code"}`.
- `POST /api/ask` — asks a question. Requires the `X-Mallik-Group-Code` header and a JSON body such as `{"question":"How does rain form?","language":"en"}`.

Supported language codes include `en` (English), `ne` (Nepali), `hi` (Hindi), `es` (Spanish), and the other 36 languages configured in `api/app.py`.

## Security, privacy, and responsible use

The shared group code is a basic access gate, **not individual authentication**. Anyone who obtains it can use the site's shared AI capacity, which may incur provider costs. Choose a unique code, rotate it if exposed, and configure provider spending limits and hosting-layer rate limits.

Questions are sent to the configured AI provider to generate answers. Do not submit sensitive personal information. AI output can be inaccurate, biased, outdated, or less fluent in some languages; check important information with trusted sources. For medical, legal, or financial decisions, consult a qualified professional or trusted local source.

## Releases

To publish a release, review the changes on the default branch, create and push a version tag (for example, `v1.0.0`), then use **GitHub → Releases → Draft a new release** to select that tag, add release notes, and publish. Deployments connected to the default branch are handled by Vercel; review a Preview deployment before promoting changes to production.

## License

Copyright (c) 2026 Niraj Mallik. MIT License. See [`LICENSE`](LICENSE) for terms.

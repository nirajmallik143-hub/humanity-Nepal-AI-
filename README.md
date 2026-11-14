# Humanity World

**Free learning. Community empowerment. Human dignity.**

Humanity World is a mobile-friendly education platform starting in Nepal and welcoming learners everywhere. This project combines the free-education vision of World Free Education, the community focus of Humanity Nepal AI, and practical tools for turning learning goals into manageable steps.

## Features

- Responsive, accessible landing page with English, Nepali, and Hindi answer options.
- Optional AI study-guide endpoint (`POST /api/ask`) using a server-side OpenAI API key. The key is never sent to the browser.
- Request validation, body-size limit, concise educational prompts, provider timeouts, and generic error responses.
- Health endpoint at `GET /api/status`.
- Vercel deployment configuration and local Flask instructions.

AI-generated content can be inaccurate. Do not enter sensitive personal information. Verify important educational, medical, legal, financial, and safety-related information with qualified people and reliable sources. The service is an educational aid, not professional advice.

## Run locally

Requires Python 3.10 or later.

```bash
python -m venv .venv
```

Activate it:

```bash
# Linux / macOS
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Install and start:

```bash
pip install -r requirements.txt
OPENAI_API_KEY="your-key" python api/app.py
```

PowerShell alternative:

```powershell
$env:OPENAI_API_KEY="your-key"
python api/app.py
```

Open <http://127.0.0.1:8080>. Check <http://127.0.0.1:8080/api/status>. If no key is configured, the site still loads, but the AI endpoint returns a setup message.

## AI configuration

Set `OPENAI_API_KEY` as a secret environment variable in your local shell or deployment platform. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Never commit API keys, put them in HTML/JavaScript, or add them to `vercel.json`. Rotate any key that has been exposed.

Before opening the endpoint to a large public audience, add provider spend limits and abuse protection/rate limiting at the hosting or edge layer. The current application validates input but does not implement persistent per-user rate limiting or authentication.

## Deploy on Vercel

1. Push the branch to GitHub and import the repository into Vercel, or connect an existing Vercel project to this repository.
2. Set the project root to the repository root and confirm the Python runtime recognizes `api/app.py` and `requirements.txt`.
3. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` for the environments you intend to use. Optionally add `OPENAI_MODEL`. Do not put secret values in source control.
4. Deploy a preview first. Verify the home page, `GET /api/status`, and `POST /api/ask` with a test question. Confirm the UI shows a clear setup message when no key is configured.
5. After verification, merge the approved pull request to the configured production branch and check the production deployment and logs.

Vercel settings and supported Python deployment behavior can change. If the deployment build rejects the existing `vercel.json`, follow the current Vercel Flask framework documentation and use its recommended routing/runtime configuration for the project's detected setup.

## Copyright and license

Copyright (c) 2026 Niraj Mallik. Licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms. Keep the copyright and permission notice in copies or substantial portions of the software.

## Contributions

Issues and pull requests that improve accessibility, translation quality, security, and usefulness to learners are welcome. Keep contributions inclusive and document any new external services or data handling.

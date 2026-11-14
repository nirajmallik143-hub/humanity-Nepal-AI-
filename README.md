# Humanity World

**Free learning. Community empowerment. Human dignity.**

Humanity World is a mobile-friendly education platform starting in Nepal and welcoming learners everywhere. It combines free-education goals, community learning, and practical ways to turn learning goals into manageable steps.

## Features

- Responsive, accessible landing page with English, Nepali, and Hindi answer options.
- Optional AI study-guide endpoint (`POST /api/ask`) using a server-side OpenAI API key. The key is never sent to the browser.
- Input validation and size limits, provider timeout, generic error responses, and educational/high-stakes topic guidance.
- Health endpoint at `GET /api/status`.
- Vercel deployment configuration and local Flask instructions.

AI-generated content may be inaccurate. Do not enter sensitive personal information. Verify important educational, medical, legal, financial, and safety-related information with qualified people and reliable sources. This is an educational aid, not professional advice.

## Run locally

Requires Python 3.10 or later.

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
# Linux / macOS
source .venv/bin/activate
# Windows PowerShell
.venv\\Scripts\\Activate.ps1
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

Open <http://127.0.0.1:8080>. Check <http://127.0.0.1:8080/api/status>. Without an API key the homepage still loads; the assistant shows a setup message.

## AI configuration and privacy

Set `OPENAI_API_KEY` as a secret environment variable in your local shell or deployment platform. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Never commit API keys, put them in HTML/JavaScript, or add them to `vercel.json`. Rotate any key that has been exposed.

Submitted questions are sent to the configured AI provider. Publish an appropriate privacy notice before public launch. Configure provider spend limits and hosting-layer abuse/rate protection before broad public use; this application validates inputs but does not implement persistent per-user rate limiting or authentication.

## Deploy on Vercel

1. Push the branch to GitHub and import/connect the repository in Vercel.
2. Set the project root to the repository root and check that the current Vercel Python/Flask runtime supports the repository's `api/app.py`, `requirements.txt`, and `vercel.json` layout.
3. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` to the required Preview and Production environments. Optionally add `OPENAI_MODEL`. Never put secret values in source control.
4. Deploy a preview first. Verify the homepage, `GET /api/status`, and `POST /api/ask` with a non-sensitive test prompt. Confirm missing-key behavior is clear.
5. After review, merge the approved pull request to the configured production branch and verify the production deployment and logs.

Vercel settings and supported Python deployment behavior can change. If the build rejects the checked-in routing configuration, follow the current official Vercel Flask framework documentation for the detected project setup.

## Copyright and license

Copyright (c) 2026 Niraj Mallik. Licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms. Keep the copyright and permission notice in copies or substantial portions of the software.

## Contributions

Issues and pull requests that improve accessibility, translation quality, security, and usefulness to learners are welcome. Keep contributions inclusive and document new external services or data handling.

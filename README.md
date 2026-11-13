# Humanity World

**Free learning. Community empowerment. Human dignity.**

Humanity World is a mobile-friendly, multilingual education landing page and learning companion. It brings together the free-education vision of the World Free Education project, the community and Nepal focus of Humanity Nepal AI, and the practical idea of helping people overcome procrastination by turning a topic into small learning steps.

The project is designed to welcome learners in Nepal and around the world. It is an open-source starting point, not a claim that the site currently provides an online AI model or professional advice.

## What’s included

- Responsive, accessible landing page in `index.html`.
- Interface language options for English, Nepali, and Hindi.
- A local study-guide helper that runs in the browser. It does **not** call an AI provider or send questions to a server.
- Flask app in `api/app.py` for the landing page and a `/api/status` health endpoint.
- Vercel configuration for deployment with the Python runtime.
- MIT License with the 2026 copyright notice for Niraj Mallik.

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
.venv\Scripts\Activate.ps1
```

Install and start the app:

```bash
pip install -r requirements.txt
python api/app.py
```

Open <http://localhost:8080>. Check the health endpoint at <http://localhost:8080/api/status>.

## Deploy to Vercel

1. Push this repository to GitHub and import it in your Vercel account, or connect the repository if it is already imported.
2. Keep the project root set to the repository root; the included `vercel.json` configures the Python function at `api/app.py`.
3. In Vercel, select **Deploy**. Vercel will build and publish the site, then provide a deployment URL.
4. For subsequent deployments, push commits to the connected branch. Vercel can create preview deployments for branches and production deployments from the configured production branch, depending on your Vercel project settings.
5. Verify the home page and `/api/status` on the deployment URL.

Deployment requires access to the Vercel account/project and a Git integration or Vercel CLI login. Committing these files does not itself grant Vercel access or deploy to an account.

## AI and safety note

The study helper currently produces a structured study plan in the browser; it is not generative AI. Do not enter sensitive personal information. Verify important educational, medical, legal, financial, or safety-related information with qualified people and reliable sources. The site does not provide medical, legal, or financial advice.

## Copyright and license

Copyright (c) 2026 Niraj Mallik. Licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms. The license and copyright notice must remain with copies or substantial portions of the software.

## Contributions

Issues and pull requests that improve accessibility, translation quality, reliability, and usefulness to learners are welcome. Please keep contributions respectful, inclusive, and clear about limitations.

import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from flask import Flask, jsonify, request, send_file

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
INDEX_FILE = os.path.join(ROOT_DIR, "index.html")
AUTH_SCRIPT = os.path.join(ROOT_DIR, "auth.js")
MAX_QUESTION_LENGTH = 2000
SUPPORTED_LANGUAGES = {
    "en": "English", "ne": "Nepali", "hi": "Hindi", "es": "Spanish",
    "fr": "French", "pt": "Portuguese", "ar": "Arabic", "zh": "Chinese",
    "bn": "Bengali", "ur": "Urdu", "sw": "Swahili", "id": "Indonesian",
    "de": "German", "ja": "Japanese", "ko": "Korean", "ru": "Russian",
    "it": "Italian", "tr": "Turkish", "vi": "Vietnamese", "th": "Thai",
    "fa": "Persian", "pa": "Punjabi", "ta": "Tamil", "te": "Telugu",
    "mr": "Marathi", "fil": "Filipino", "ha": "Hausa", "am": "Amharic",
    "yo": "Yoruba", "uk": "Ukrainian", "pl": "Polish", "nl": "Dutch",
    "sv": "Swedish", "el": "Greek", "he": "Hebrew", "ro": "Romanian",
    "hu": "Hungarian", "cs": "Czech", "ms": "Malay", "km": "Khmer",
}


def _firebase_admin_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        raw_credentials = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if not raw_credentials:
            raise RuntimeError("Firebase Admin is not configured")
        return firebase_admin.initialize_app(credentials.Certificate(json.loads(raw_credentials)))


def _verified_user():
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    try:
        return firebase_auth.verify_id_token(token, app=_firebase_admin_app(), check_revoked=True)
    except Exception as exc:
        app.logger.info("Firebase ID token verification failed: %s", type(exc).__name__)
        return None


@app.get("/")
def home():
    with open(INDEX_FILE, encoding="utf-8") as page:
        html = page.read()
    script_tag = '<script type="module" src="/auth.js"></script>'
    if script_tag not in html:
        html = html.replace("</body>", f"  {script_tag}\n</body>")
    return app.response_class(html, mimetype="text/html")


@app.get("/auth.js")
def auth_script():
    return send_file(AUTH_SCRIPT, mimetype="text/javascript")


@app.get("/api/auth-config")
def auth_config():
    config = {
        "apiKey": os.environ.get("FIREBASE_API_KEY"),
        "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
        "appId": os.environ.get("FIREBASE_APP_ID"),
    }
    if not all(config.values()):
        return jsonify({"error": "Google sign-in is not configured."}), 503
    return jsonify(config)


@app.get("/api/status")
def status():
    return jsonify({"status": "active", "project": "Humanity World", "version": 2})


@app.post("/api/ask")
def ask():
    user = _verified_user()
    if user is None:
        return jsonify({"error": "Sign in with Google to use the study guide."}), 401
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return jsonify({"error": "AI service is not configured."}), 503
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Send a JSON object with question and language fields."}), 400
    question = payload.get("question")
    language = payload.get("language", "en")
    if not isinstance(question, str) or not question.strip():
        return jsonify({"error": "A non-empty question is required."}), 400
    question = question.strip()
    if len(question) > MAX_QUESTION_LENGTH:
        return jsonify({"error": f"Question must be {MAX_QUESTION_LENGTH} characters or fewer."}), 413
    if language not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "Choose a supported answer language."}), 400

    body = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": (
                "You are a careful, encouraging educational study guide for a broad audience. "
                f"Answer in {SUPPORTED_LANGUAGES[language]}. Explain clearly, provide a practical example "
                "when useful, and suggest one way to check understanding. Be honest about uncertainty. "
                "For high-stakes medical, legal, or financial topics, provide general educational context "
                "and recommend a qualified professional or trusted local source. Keep the answer concise."
            )},
            {"role": "user", "content": question},
        ],
        "temperature": 0.4,
        "max_tokens": 700,
    }
    req = Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(req, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
        answer = result["choices"][0]["message"]["content"].strip()
        if not answer:
            raise ValueError("Empty provider response")
        return jsonify({"answer": answer})
    except HTTPError as exc:
        if exc.code in (401, 403):
            app.logger.error("AI provider credentials or permissions are invalid (HTTP %s).", exc.code)
            return jsonify({"error": "AI service configuration error."}), 502
        if exc.code == 429:
            return jsonify({"error": "AI service is busy. Please try again shortly."}), 429
        app.logger.error("AI provider request failed (HTTP %s).", exc.code)
        return jsonify({"error": "AI service request failed."}), 502
    except (URLError, TimeoutError):
        return jsonify({"error": "AI service timed out or is temporarily unavailable."}), 504
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        app.logger.error("AI provider returned an unexpected response.")
        return jsonify({"error": "AI service returned an unexpected response."}), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "8080")), debug=False)

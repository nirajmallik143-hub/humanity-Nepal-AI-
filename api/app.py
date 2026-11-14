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
SCENE_STYLESHEET = os.path.join(ROOT_DIR, "scene.css")
PWA_SCRIPT = os.path.join(ROOT_DIR, "pwa.js")
SERVICE_WORKER = os.path.join(ROOT_DIR, "sw.js")
MANIFEST = os.path.join(ROOT_DIR, "manifest.webmanifest")
OFFLINE_PAGE = os.path.join(ROOT_DIR, "offline.html")
APP_ICON = os.path.join(ROOT_DIR, "icons", "humanity.svg")
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
        claims = firebase_auth.verify_id_token(token, app=_firebase_admin_app(), check_revoked=True)
        if not claims.get("email_verified"):
            # Google provider accounts are considered verified by Firebase; enforce
            # verification for password-based email accounts.
            if claims.get("firebase", {}).get("sign_in_provider") != "google.com":
                return None
        return claims
    except Exception as exc:
        app.logger.info("Firebase ID token verification failed: %s", type(exc).__name__)
        return None


def _static_file(path, mimetype=None, cache_control="public, max-age=3600"):
    response = send_file(path, mimetype=mimetype, conditional=True)
    response.headers["Cache-Control"] = cache_control
    return response


@app.get("/")
def home():
    with open(INDEX_FILE, encoding="utf-8") as page:
        html = page.read()
    head_tags = (
        '<link rel="manifest" href="/manifest.webmanifest">\n'
        '<link rel="icon" href="/icons/humanity.svg" type="image/svg+xml">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
        '<meta name="apple-mobile-web-app-title" content="Humanity World">'
    )
    if 'rel="manifest"' not in html:
        html = html.replace("</head>", f"{head_tags}\n</head>")
    additions = (
        '<link rel="stylesheet" href="/scene.css">\n'
        '<script type="module" src="/auth.js"></script>\n'
        '<script defer src="/pwa.js"></script>'
    )
    if 'src="/auth.js"' not in html:
        html = html.replace("</body>", f"{additions}\n</body>")
    return app.response_class(html, mimetype="text/html", headers={"Cache-Control": "no-cache"})


@app.get("/scene.css")
def scene_stylesheet():
    return _static_file(SCENE_STYLESHEET, "text/css; charset=utf-8")


@app.get("/auth.js")
def auth_script():
    return _static_file(AUTH_SCRIPT, "text/javascript; charset=utf-8")


@app.get("/pwa.js")
def pwa_script():
    return _static_file(PWA_SCRIPT, "text/javascript; charset=utf-8")


@app.get("/sw.js")
def service_worker():
    response = _static_file(SERVICE_WORKER, "application/javascript; charset=utf-8", "no-cache")
    response.headers["Service-Worker-Allowed"] = "/"
    return response


@app.get("/manifest.webmanifest")
def web_manifest():
    return _static_file(MANIFEST, "application/manifest+json")


@app.get("/offline.html")
def offline_page():
    return _static_file(OFFLINE_PAGE, "text/html; charset=utf-8")


@app.get("/icons/humanity.svg")
def app_icon():
    return _static_file(APP_ICON, "image/svg+xml", "public, max-age=86400")


@app.get("/api/auth-config")
def auth_config():
    config = {
        "apiKey": os.environ.get("FIREBASE_API_KEY"),
        "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
        "appId": os.environ.get("FIREBASE_APP_ID"),
    }
    if not all(config.values()):
        return jsonify({"error": "Authentication is not configured."}), 503
    return jsonify(config)


@app.get("/api/status")
def status():
    return jsonify({"status": "active", "project": "Humanity World", "version": 4})


@app.post("/api/ask")
def ask():
    if _verified_user() is None:
        return jsonify({"error": "Sign in with a verified account to use the study guide."}), 401
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

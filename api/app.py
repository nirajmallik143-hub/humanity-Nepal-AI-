import hmac
import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file

# Local development convenience. Vercel variables are already in the process environment.
load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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


def _group_code_configured():
    return bool(os.environ.get("MALLIK_GROUP_CODE", "").strip())


def _valid_group_code(candidate):
    expected = os.environ.get("MALLIK_GROUP_CODE", "")
    return bool(expected and candidate and hmac.compare_digest(expected, candidate))


def _static_file(path, mimetype=None, cache_control="public, max-age=3600"):
    response = send_file(path, mimetype=mimetype, conditional=True)
    response.headers["Cache-Control"] = cache_control
    return response


def _require_group_code():
    if not _group_code_configured():
        return jsonify({"error": "Group access is not configured by the site owner."}), 503
    candidate = request.headers.get("X-Mallik-Group-Code", "")
    if not _valid_group_code(candidate):
        return jsonify({"error": "Enter the valid Mallik Group access code to continue."}), 401
    return None


def _system_prompt(language):
    return (
        "You are a careful, encouraging educational guide for people from diverse backgrounds. "
        f"Answer in {SUPPORTED_LANGUAGES[language]}. Explain clearly, use a practical example when useful, "
        "and suggest one way to check understanding. Be honest about uncertainty and cultural context. "
        "For high-stakes medical, legal, or financial topics, provide general educational context and "
        "recommend a qualified professional or trusted local source. Do not claim to replace professional help. "
        "Keep the answer concise, respectful, accessible, and useful to someone improving their daily life."
    )


def _provider_name():
    requested = os.environ.get("AI_PROVIDER", "").strip().lower()
    if requested:
        return requested
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return "gemini"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    return ""


def _call_gemini(question, language):
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Gemini API key is not configured")
    model = quote(os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"), safe=".-")
    body = {
        "contents": [{"role": "user", "parts": [{"text": question}]}],
        "system_instruction": {"parts": [{"text": _system_prompt(language)}]},
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 700},
    }
    req = Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    with urlopen(req, timeout=25) as response:
        result = json.loads(response.read().decode("utf-8"))
    candidates = result.get("candidates", [])
    if not candidates:
        raise ValueError("Gemini returned no candidates")
    parts = candidates[0].get("content", {}).get("parts", [])
    answer = "\n".join(
        part["text"].strip() for part in parts
        if isinstance(part, dict) and isinstance(part.get("text"), str) and part["text"].strip()
    ).strip()
    if not answer:
        raise ValueError("Gemini returned no answer text")
    return answer


def _call_openai(question, language):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OpenAI API key is not configured")
    body = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": _system_prompt(language)},
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
    with urlopen(req, timeout=25) as response:
        result = json.loads(response.read().decode("utf-8"))
    answer = result["choices"][0]["message"]["content"]
    if not isinstance(answer, str) or not answer.strip():
        raise ValueError("OpenAI returned no answer text")
    return answer.strip()


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


@app.post("/api/access")
def check_access():
    if not _group_code_configured():
        return jsonify({"error": "Group access is not configured by the site owner."}), 503
    payload = request.get_json(silent=True)
    code = payload.get("code") if isinstance(payload, dict) else None
    if not isinstance(code, str) or not _valid_group_code(code.strip()):
        return jsonify({"error": "That access code is not valid. Check it and paste it again."}), 401
    return jsonify({"ok": True, "message": "Group access confirmed for this browser session."})


@app.get("/api/status")
def status():
    provider = _provider_name()
    configured = (provider == "gemini" and bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))) or (
        provider == "openai" and bool(os.environ.get("OPENAI_API_KEY"))
    )
    return jsonify({
        "status": "active",
        "project": "Humanity World",
        "accessConfigured": _group_code_configured(),
        "aiConfigured": configured,
        "provider": provider or None,
    })


@app.post("/api/ask")
def ask():
    access_error = _require_group_code()
    if access_error:
        return access_error
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
    if not isinstance(language, str) or language not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "Choose a supported answer language."}), 400

    provider = _provider_name()
    if provider not in {"gemini", "openai"}:
        return jsonify({"error": "AI is not configured. The site owner must set an AI provider and API key."}), 503
    try:
        answer = _call_gemini(question, language) if provider == "gemini" else _call_openai(question, language)
        return jsonify({"answer": answer})
    except HTTPError as exc:
        if exc.code in (401, 403):
            app.logger.error("AI provider credentials or permissions are invalid (HTTP %s).", exc.code)
            return jsonify({"error": "AI provider setup error. Please contact the site owner."}), 502
        if exc.code == 429:
            return jsonify({"error": "AI service is busy. Please try again shortly."}), 429
        app.logger.error("AI provider request failed (HTTP %s).", exc.code)
        return jsonify({"error": "AI service request failed. Please try again later."}), 502
    except (URLError, TimeoutError):
        return jsonify({"error": "AI service timed out or is temporarily unavailable."}), 504
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        app.logger.error("AI provider returned an unexpected response.")
        return jsonify({"error": "AI service returned an unexpected response."}), 502
    except RuntimeError as exc:
        app.logger.error("AI provider is not configured: %s", exc)
        return jsonify({"error": "AI provider setup is incomplete. Please contact the site owner."}), 503


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request is too large."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")), debug=False)

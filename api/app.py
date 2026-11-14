import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import Flask, jsonify, request, send_file

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024
INDEX_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "index.html")
MAX_QUESTION_LENGTH = 2000
SUPPORTED_LANGUAGES = {"en": "English", "ne": "Nepali", "hi": "Hindi"}


@app.get("/")
def home():
    return send_file(INDEX_FILE, mimetype="text/html")


@app.get("/api/status")
def status():
    return jsonify({"status": "active", "project": "Humanity World", "version": 1})


@app.post("/api/ask")
def ask():
    """Generate an educational study guide with the server-configured AI provider."""
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
        return jsonify({"error": "Choose English, Nepali, or Hindi."}), 400

    body = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": (
                "You are a careful, encouraging educational study guide for a broad audience. "
                f"Answer in {SUPPORTED_LANGUAGES[language]}. Explain clearly, give a practical example "
                "when useful, and suggest one way to check understanding. Be honest about uncertainty. "
                "Do not claim to be a medical, legal, or financial advisor; for high-stakes topics, "
                "give general educational information and recommend qualified professionals or trusted "
                "local sources. Keep the answer concise."
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

from pathlib import Path

from flask import Flask, jsonify, send_file

app = Flask(__name__)
INDEX_FILE = Path(__file__).resolve().parent.parent / "index.html"


@app.get("/")
def home():
    """Serve the static, multilingual Humanity World landing page."""
    return send_file(INDEX_FILE, mimetype="text/html")


@app.get("/api/status")
def status():
    """Simple health endpoint for deployment checks."""
    return jsonify(
        {
            "status": "active",
            "project": "Humanity World",
            "version": 1,
            "message": "Free learning and human-centered technology.",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

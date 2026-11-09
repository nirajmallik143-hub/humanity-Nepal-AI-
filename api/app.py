from flask import Flask, render_template_string, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    # Example HTML response or template rendering
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Humanity Nepal AI</title>
        <style>
            body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); text-align: center; }
            h1 { color: #38bdf8; margin-bottom: 0.5rem; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Humanity Nepal AI</h1>
            <p>System operational and deployed successfully via Vercel.</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(html_content)

@app.route('/api/status')
def status():
    return jsonify({"status": "active", "project": "Humanity Nepal AI"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

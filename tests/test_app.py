from unittest.mock import patch

import api.app as app_module


app = app_module.app


def setup_function():
    app.config["TESTING"] = True


def test_home_and_status(monkeypatch):
    monkeypatch.delenv("MALLIK_GROUP_CODE", raising=False)
    client = app.test_client()
    assert client.get("/").status_code == 200
    response = client.get("/api/status")
    assert response.status_code == 200
    assert response.json["accessConfigured"] is False


def test_group_code_access_flow(monkeypatch):
    monkeypatch.setenv("MALLIK_GROUP_CODE", "test-private-code")
    client = app.test_client()
    assert client.post("/api/access", json={"code": "wrong"}).status_code == 401
    assert client.post("/api/access", json={"code": "test-private-code"}).json["ok"] is True
    assert client.post("/api/ask", json={"question": "hello"}).status_code == 401


def test_question_requires_group_code(monkeypatch):
    monkeypatch.setenv("MALLIK_GROUP_CODE", "test-private-code")
    client = app.test_client()
    headers = {"X-Mallik-Group-Code": "test-private-code"}
    response = client.post("/api/ask", json={"question": "Explain gravity", "language": "en"}, headers=headers)
    assert response.status_code == 503  # No provider configured.


def test_question_calls_selected_provider(monkeypatch):
    monkeypatch.setenv("MALLIK_GROUP_CODE", "test-private-code")
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "not-a-real-key")
    client = app.test_client()
    headers = {"X-Mallik-Group-Code": "test-private-code"}
    with patch.object(app_module, "_call_gemini", return_value="A clear explanation.") as provider:
        response = client.post("/api/ask", json={"question": "Explain gravity", "language": "en"}, headers=headers)
    assert response.status_code == 200
    assert response.json["answer"] == "A clear explanation."
    provider.assert_called_once_with("Explain gravity", "en")


def test_language_validation(monkeypatch):
    monkeypatch.setenv("MALLIK_GROUP_CODE", "test-private-code")
    client = app.test_client()
    headers = {"X-Mallik-Group-Code": "test-private-code"}
    response = client.post("/api/ask", json={"question": "hello", "language": "invalid"}, headers=headers)
    assert response.status_code == 400

from app.services.analysis_engine import AnalysisComputation, IndicatorEvaluation


def auth_token(client):
    response = client.post("/v1/auth/login", json={"username": "admin", "password": "Admin123!"})
    payload = response.json()
    return payload["access_token"]


def test_login_success(client):
    response = client.post("/v1/auth/login", json={"username": "admin", "password": "Admin123!"})
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "admin"


def test_analyze_rejects_localhost(client):
    response = client.post("/v1/analyze", json={"url": "http://127.0.0.1/login"})
    assert response.status_code == 400


def test_stats_requires_admin(client):
    response = client.get("/v1/stats")
    assert response.status_code == 401

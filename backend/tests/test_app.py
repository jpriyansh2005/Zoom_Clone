from tests.conftest import API


def test_health_check(client):
    response = client.get(f"{API}/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_the_frontend_origin_may_call_the_api(client):
    response = client.get(f"{API}/health", headers={"Origin": "http://testserver.local"})

    assert response.headers["access-control-allow-origin"] == "http://testserver.local"


def test_other_origins_get_no_cors_permission(client):
    response = client.get(f"{API}/health", headers={"Origin": "https://evil.example"})

    assert "access-control-allow-origin" not in response.headers


def test_validation_errors_use_the_same_shape_as_domain_errors(client):
    invalid = client.post(f"{API}/meetings", json={"title": ""})
    missing = client.get(f"{API}/meetings/00000000000")

    assert invalid.status_code == 422 and "detail" in invalid.json()
    assert missing.status_code == 404 and isinstance(missing.json()["detail"], str)

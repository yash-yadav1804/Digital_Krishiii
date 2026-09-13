from fastapi.testclient import TestClient

from app.core.exceptions.user import UserAlreadyExistsError
from app.main import app


def test_user_already_exists_handler():
    @app.get("/test-user-exists-error")
    async def test_route() -> None:
        raise UserAlreadyExistsError("Email is already registered")

    client = TestClient(app)

    response = client.get("/test-user-exists-error")

    assert response.status_code == 409
    assert response.json() == {
        "detail": "Email is already registered",
    }

import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest


def test_register_request_accepts_valid_data():
    request = RegisterRequest(
        name="Raj Mahajan",
        email="raj@example.com",
        password="StrongPassword@123",
    )

    assert request.email == "raj@example.com"
    assert request.password == "StrongPassword@123"


def test_register_request_rejects_invalid_email():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="invalid-email",
            password="StrongPassword@123",
        )


def test_register_request_rejects_short_password():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="raj@example.com",
            password="short",
        )

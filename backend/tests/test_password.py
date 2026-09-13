from app.core.security.password import hash_password, verify_password


def test_password_hashing():
    password = "StrongPassword@123"

    hashed_password = hash_password(password)

    assert hashed_password != password
    assert verify_password(password, hashed_password) is True
    assert verify_password("WrongPassword", hashed_password) is False

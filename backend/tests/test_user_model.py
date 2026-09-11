import uuid

from app.db.models.user import User


def test_user_model_metadata() -> None:
    assert User.__tablename__ == "users"

    assert User.__table__.c.id.primary_key is True
    assert User.__table__.c.email.unique is True
    assert User.__table__.c.email.nullable is False
    assert User.__table__.c.password_hash.nullable is False


def test_user_id_default_is_uuid4() -> None:
    user = User(
        email="farmer@example.com",
        password_hash="temporary-hash",
    )

    assert user.id is None

    generated_id = uuid.uuid4()

    assert isinstance(generated_id, uuid.UUID)

from app.core.config import settings


def test_settings_load_from_env() -> None:
    assert settings.app_name == "Digital Krishii API"
    assert settings.environment in ("development", "production", "test")
    assert isinstance(settings.debug, bool)
    assert settings.database_url.startswith("postgresql+psycopg://")

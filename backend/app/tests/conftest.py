import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "phishing_detector.settings")
os.environ.setdefault("APP_SQLALCHEMY_DATABASE_URL", "sqlite+pysqlite:///./test.db")
os.environ.setdefault("APP_MYSQL_HOST", "localhost")
os.environ.setdefault("APP_MYSQL_DATABASE", "phishing_detector")
os.environ.setdefault("APP_MYSQL_USER", "phishing_user")
os.environ.setdefault("APP_MYSQL_PASSWORD", "phishing_pass")

import django
import pytest
from ninja.testing import TestClient

from app.api.router import api
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_engine, reset_database_state
from app.services.auth_service import ensure_default_users

django.setup()


@pytest.fixture(autouse=True)
def reset_db():
    get_settings.cache_clear()
    reset_database_state()
    engine = get_engine()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    from sqlalchemy.orm import Session

    with Session(engine) as session:
        ensure_default_users(session)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(api)

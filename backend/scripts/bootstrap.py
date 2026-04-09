from app.db.base import Base
from app.db.session import get_engine
from app.services.auth_service import ensure_default_users


def main() -> None:
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    from sqlalchemy.orm import Session

    with Session(engine) as session:
        ensure_default_users(session)
    print("Bootstrap terminé. Utilisateurs par défaut: admin / analyst, mot de passe: Admin123!")


if __name__ == "__main__":
    main()

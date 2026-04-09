# Backend

API Django pour la plateforme de détection de phishing.

## Lancement local

1. Créer un environnement Python.
2. Installer les dépendances avec `pip install -r requirements.txt`.
3. Copier `.env.example` vers `.env`.
4. Démarrer MySQL.
5. Exécuter `python scripts/bootstrap.py`.
6. Lancer `python manage.py runserver 0.0.0.0:8000`.

## API

- Swagger UI : `http://localhost:8000/api/v1/docs`
- OpenAPI JSON : `http://localhost:8000/api/v1/openapi.json`

## Comptes par défaut

- `admin / Admin123!`
- `analyst / Admin123!`

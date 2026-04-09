# Installation locale

## Prérequis

- Python 3.12+
- Node.js 20+
- MySQL 8+

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.bootstrap
python -m scripts.seed_demo_data
python manage.py runserver 0.0.0.0:8000
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

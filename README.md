# Phishing Detector

Plateforme full-stack de détection de sites frauduleux (phishing) construite pour une démonstration académique crédible.

## Arborescence

```text
phishing-detector/
  backend/
  frontend/
  docs/
  docker-compose.yml
  README.md
```

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui style, TanStack Query, Recharts
- Backend: Django, Django Ninja, SQLAlchemy, Pydantic, Alembic
- Base de données: MySQL
- Déploiement: Docker + docker-compose

## Lancement rapide

```bash
cd phishing-detector
docker compose up --build
```

## Accès

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1`
- Swagger: `http://localhost:8000/api/v1/docs`

## Comptes par défaut

- `admin / Admin123!`
- `analyst / Admin123!`

## Documentation

- [Installation locale](./docs/INSTALL_LOCAL.md)
- [Guide Docker](./docs/DOCKER.md)
- [Documentation API](./docs/API.md)
- [Système de scoring](./docs/SCORING.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Structure du projet](./docs/PROJECT_STRUCTURE.md)
- [Pistes ML](./docs/ML_ROADMAP.md)

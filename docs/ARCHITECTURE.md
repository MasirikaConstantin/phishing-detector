# Architecture du projet

## Frontend

- Vite + React + TypeScript
- Tailwind CSS
- Composants `shadcn/ui` style dans `frontend/src/components/ui`
- TanStack Query pour l'accès API
- React Router pour la navigation
- Recharts pour le dashboard

## Backend

- Django pour le cycle de vie applicatif et l'exposition HTTP
- Django Ninja pour les endpoints REST et OpenAPI
- SQLAlchemy pour les modèles métier
- Pydantic pour la validation des schémas
- Alembic pour le schéma de base de données
- `httpx`, `BeautifulSoup`, `tldextract`, `python-whois`

## Sécurité

- Normalisation stricte des URLs
- Blocage SSRF basique
- Timeout réseau
- User-Agent explicite
- Limitation simple des requêtes
- Journalisation des authentifications et analyses

## Extensibilité

- Le moteur heuristique est séparé des endpoints
- L'architecture permet l'ajout d'un pipeline ML ou d'une file asynchrone ultérieurement

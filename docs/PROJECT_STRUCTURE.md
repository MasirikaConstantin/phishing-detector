# Structure du projet

```text
phishing-detector/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tests/
│   ├── alembic/
│   ├── phishing_detector/
│   └── scripts/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── router/
│   │   └── test/
│   └── public/
├── docs/
├── docker-compose.yml
└── README.md
```

## Logique de séparation

- `services/`: logique métier et moteur heuristique
- `repositories/`: accès base de données
- `schemas/`: validation Pydantic
- `api/`: endpoints REST
- `components/ui/`: base UI réutilisable style shadcn
- `pages/`: écrans fonctionnels

# Documentation API

## Endpoints principaux

- `POST /api/v1/analyze`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/{id}`
- `GET /api/v1/stats`
- `POST /api/v1/auth/login`
- `GET /api/v1/health`

## Swagger / OpenAPI

- Swagger UI: `http://localhost:8000/api/v1/docs`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

## Exemple de réponse analyse

```json
{
  "score": 78,
  "risk_level": "high",
  "verdict": "phishing_probable",
  "indicators": [
    {
      "code": "ip_in_url",
      "label": "Adresse IP utilisée dans l'URL",
      "weight": 20,
      "detected": true,
      "details": "L'URL utilise une IP au lieu d'un domaine classique"
    }
  ]
}
```

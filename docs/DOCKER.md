# Guide Docker

## Commande unique

```bash
docker compose up --build
```

## Services

- `mysql`: base MySQL 8 avec volume persistant `mysql_data`
- `backend`: API Django sur le port `8000`
- `frontend`: application React servie par Nginx sur le port `3000`

## Notes

- La stack est homogénéisée sur MySQL, même si la demande mentionnait PostgreSQL à un endroit.
- Le volume `mysql_data` conserve les analyses et comptes créés.

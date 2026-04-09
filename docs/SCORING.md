# Système de scoring

Le moteur additionne les poids des indicateurs détectés, avec un plafond de `100`.

## Niveaux

- `0-34`: `low` -> `probably_safe`
- `35-59`: `medium` -> `suspect`
- `60-79`: `high` -> `phishing_probable`
- `80-100`: `critical` -> `phishing_probable`

## Exemples d'indicateurs

- IP utilisée dans l'URL
- URL trop longue
- Trop de sous-domaines
- Caractères suspects
- Mots sensibles dans l'URL
- Domaine récent
- Absence de HTTPS
- Formulaire sensible
- Formulaire envoyant vers un domaine externe
- Éléments cachés
- Ressources externes suspectes
- Incohérence de marque
- Redirection anormale

## Explicabilité

Chaque indicateur retourne:

- un code
- un label
- un poids
- un booléen `detected`
- un champ `details`

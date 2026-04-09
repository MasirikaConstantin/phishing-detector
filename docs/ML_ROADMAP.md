# Pistes d'amélioration ML

## Évolutions possibles

- Ajouter un classifieur supervisé basé sur des features d'URL et de DOM
- Introduire une file asynchrone pour les analyses lentes
- Stocker des embeddings de contenu pour détecter des clones de marques
- Ajouter une base de logos et marques connues
- Automatiser la capture d'écran et la comparer à des gabarits légitimes
- Calculer des scores hybrides: heuristiques + modèle ML

## Architecture prête

- Le backend expose déjà des services distincts pour le scoring
- Les détails JSON stockés en base peuvent embarquer des features supplémentaires
- Le champ `details_json` permet de versionner les modèles ou pipelines utilisés

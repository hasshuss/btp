# Catalogue portes (Masterline)

Les modèles du configurateur proviennent du PDF **Masterline — Portes d'entrées** (pièce jointe chat / `docs/Masterline-portes-entree.pdf`), **pas** du catalogue Global Market.

## Regénérer le catalogue

1. Placer ou mettre à jour le PDF (voir chemins dans le script).
2. Exécuter :

```powershell
python scripts/extract-porte-masterline-pdf.py
```

Cela produit :

- `js/door-models.json` et `js/door-models-bundle.js`
- vignettes PNG dans `img/modele-masterline/`

## Champs modèle

| Champ | Rôle |
|-------|------|
| `id` / `name` | Référence MSxxxx (ex. `ms7010`) |
| `imgLocal` | Vignette pour grilles, aperçu et schémas d'ouverture |
| `glass` | Heuristique vitrage (options vitrage panneau) |
| `variants` | Codes PDF associés (ex. variantes couleur `MS1755L`) |
| `colorVariants` | Finitions couleur (vignette + pastille sous le modèle au configurateur) |

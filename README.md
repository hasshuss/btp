# Direct Usine

Site vitrine + **calculateurs de chiffrage** (HTML / CSS / JS), calqué sur l’expérience [voletroulant-online.fr](https://www.voletroulant-online.fr/voletroulant/).

Ouvrir `index.html` dans le navigateur, ou servir le dossier :

```powershell
cd C:\Users\skhas\Documents\direct-usine
npx --yes serve .
```

## Calculateurs

| Page | Fichier JS | Prix |
|------|------------|------|
| Volet roulant | `js/config-volet.js` | `js/pricing.js` → `PRICING.volet` |
| Fenêtre / baie | `js/config-fenetre.js` | `PRICING.fenetre` |
| Porte garage | `js/config-garage.js` | `PRICING.garage` |

Les **grilles de prix** se modifient uniquement dans `js/pricing.js` (m², moteurs, couleurs, accessoires, promo -15 %).

Le calcul volet reprend les règles de fabrication : coffre selon hauteur, pose A/B/C, traditionnel (+250 mm), monobloc (+185 mm), limites ALU/PVC/solaire/sangle.

Nom, téléphone, adresse : `js/layout.js` (`SITE`).

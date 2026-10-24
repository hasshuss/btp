/**
 * Grilles de prix — à modifier ici pour ajuster le chiffrage.
 * Montants en euros TTC avant remise « direct usine » (promoPercent).
 *
 * Repères marché porte PVC sur mesure (2025–2026, sources agrégées) :
 * - fourni seul : ~400–2 600 € ; porte standard ~900 × 2 100 : ~1 300–2 000 €
 * - au m² fourni : ~650–1 100 €/m² (haute isolation)
 * - pose seule : ~200–500 € (non incluse ici — prix fabricant / livraison)
 * La grille porte vise ~15–25 % sous le milieu de gamme en ligne, hors pose.
 */
window.PRICING = {
  promoPercent: 20,

  volet: {
    prixM2: {
      reno: { alu39: 198, pvc39: 155 },
      tradi: { alu39: 165, pvc39: 128 },
    },
    min: { reno: 89, tradi: 72 },
    moteur: {
      "filaire-gm": 45,
      "filaire-somfy": 95,
      "radio-gm": 79,
      deltadore: 129,
      sangle: 0,
      manivelle: 18,
      "solaire-gm": 139,
    },
    couleurLame: {
      "9016": 0,
      "7016": 22,
      "8019": 22,
      "7039": 22,
      "9005": 28,
      chenedore: 45,
    },
    couleurOssature: {
      "9016": 0,
      "7016": 18,
      "8019": 18,
      "7039": 18,
      "9005": 24,
    },
    attacheRigide: 12,
    coulisseL: 8,
  },

  fenetre: {
    prixM2: {
      fenetre: 258,
      "porte-fenetre": 302,
      "porte-balcon": 289,
      coulissant: 338,
    },
    min: {
      fenetre: 132,
      "porte-fenetre": 219,
      "porte-balcon": 199,
      coulissant: 359,
    },
    vantaux: { 1: 0, 2: 45, 3: 95 },
    oscillo: 38,
    pose: { neuf: 0, applique: 12, reno: 28 },
    vitrage: {
      standard: 0,
      phonique: 42,
      feuilleté: 68,
      "feuilleté-double": 98,
    },
    warmEdge: 18,
    croisillon: 55,
    couleur: { blanc: 0, "1face": 65, "2faces": 110 },
    voletMono: 145,
  },

  porte: {
    prixM2: { pvc: 268, alu: 328 },
    min: { pvc: 619, alu: 949 },
    pose: { applique: 0, tunnel: 0, feuillure: 22 },
    tierce: 185,
    imposte: 155,
    /** Finition panneau Masterline (hors blanc catalogue). */
    finitionPanneau: 38,
    couleurFace: { "9016": 0, "7016": 62, chene: 78, "9011": 72, "7039": 62 },
    vitragePanneau: { depoli: 0, chinchilla: 38, delta: 28, none: 0 },
    vitrageFixe: { "332": 0, "442": 48, thermique: 0 },
    warmEdge: 18,
    decor: {
      clair: 0,
      g200: 12,
      depoli: 18,
      chinchilla: 22,
      olivier: 26,
      "delta-clair": 20,
      "delta-mat": 20,
    },
    croisillonUnite: 6,
    voletIntegre: 215,
    serrure: {
      "relevage-galets": 0,
      "relevage-crochets": 42,
      auto: 82,
      "paliere-5": 32,
      "paliere-3": 10,
    },
    poignee: {
      sans: 0,
      baton: 72,
      "paliere-blanc": 24,
      "paliere-ano": 34,
      blanc: 18,
      gris: 18,
      marron: 18,
      anodise: 26,
    },
    cylindre: { sans: 0, varie: 22, entrouvrant: 36 },
  },

  accessoires: {
    vis: 5,
    mousse: 9.9,
    mastic: 4.9,
    inverseurEncastre: 4.9,
    inverseurApplique: 9.9,
    interrupteurEncastre: 10.9,
    telecommande1: 19.9,
    telecommande5: 25.9,
    recepteur: 34.9,
  },
};

window.PricingEngine = {
  euro(n) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(n || 0);
  },

  applyPromo(ht) {
    const p = window.PRICING.promoPercent / 100;
    const reduction = ht * p;
    const ttc = ht - reduction;
    return { ht, reduction, ttc, percent: window.PRICING.promoPercent };
  },

  dimCoffre(hauteur, colorOssature) {
    let dim = 150;
    if (colorOssature === "9005") dim = 165;
    if (hauteur > 1750) dim = 165;
    if (hauteur > 2200) dim = 180;
    return dim;
  },

  dimFinalVolet({ type, pose, Ltab, Htab, colorOssature }) {
    let LFinal = Ltab;
    let HFinal = Htab;
    let coffre = this.dimCoffre(Htab, colorOssature);

    if (type === "reno") {
      if (pose === "renoC") {
        LFinal = Ltab + 106;
        HFinal = Htab + coffre;
        coffre = this.dimCoffre(HFinal, colorOssature);
        HFinal = Htab + coffre;
      } else {
        LFinal = Ltab - 5;
      }
    } else if (type === "tradi") {
      HFinal = Htab + 250;
    }

    if (Number.isNaN(Ltab)) LFinal = 0;
    if (Number.isNaN(Htab)) HFinal = 0;

    const surface = (LFinal / 1000) * (HFinal / 1000);
    return {
      haut: HFinal,
      larg: LFinal,
      coffre,
      surface: Number.isFinite(surface) ? surface : 0,
    };
  },

  limitsVolet({ lame, manoeuvre }) {
    const lim = { hmin: 700, lmin: 700, hmax: 3000, lmax: 3000 };
    lim.lmin = manoeuvre === "solaire-gm" ? 900 : 700;
    if (lame === "alu39") {
      if (manoeuvre === "sangle") lim.hmax = 2200;
    } else {
      lim.hmax = 2250;
      lim.lmax = 2100;
      if (manoeuvre === "sangle") lim.hmax = 2200;
    }
    return lim;
  },

  priceVolet(cfg) {
    const P = window.PRICING.volet;
    const dim = this.dimFinalVolet(cfg);
    const m2 = P.prixM2[cfg.type][cfg.lame];
    let base = Math.max(P.min[cfg.type], dim.surface * m2);
    base += P.moteur[cfg.manoeuvre] || 0;
    base += P.couleurLame[cfg.couleurLame] || 0;
    base += P.couleurOssature[cfg.couleurOssature] || 0;
    if (cfg.attache === "rigide") base += P.attacheRigide;
    if (cfg.coulisse === "reno-l") base += P.coulisseL;

    const accTotal = (cfg.accessoires || []).reduce((s, id) => {
      return s + (window.PRICING.accessoires[id] || 0);
    }, 0);

    const qty = cfg.qty || 1;
    const produit = this.applyPromo(base * qty);
    const accessoires = this.applyPromo(accTotal * qty);
    return {
      dim,
      produit,
      accessoires,
      total: produit.ttc + accessoires.ttc,
      qty,
    };
  },

  dimFinalFenetre({ pose, H, L }) {
    let addH = 0;
    let addL = 0;
    if (pose === "neuf") {
      addH = 30;
      addL = 60;
    } else if (pose === "applique") {
      addH = 20;
      addL = 40;
    } else {
      addH = 0;
      addL = 0;
    }
    return { haut: H + addH, larg: L + addL, surface: ((H + addH) * (L + addL)) / 1e6 };
  },

  priceFenetre(cfg) {
    const P = window.PRICING.fenetre;
    const dim = this.dimFinalFenetre(cfg);
    let base = Math.max(P.min[cfg.type], dim.surface * P.prixM2[cfg.type]);
    base += P.vantaux[cfg.vantaux] || 0;
    if (cfg.oscillo) base += P.oscillo;
    base += P.pose[cfg.pose] || 0;
    base += P.vitrage[cfg.vitrage] || 0;
    if (cfg.warmEdge) base += P.warmEdge;
    if (cfg.croisillon) base += P.croisillon;
    base += P.couleur[cfg.couleur] || 0;
    if (cfg.voletMono) base += P.voletMono;
    const qty = cfg.qty || 1;
    const produit = this.applyPromo(base * qty);
    return { dim, produit, total: produit.ttc, qty };
  },

  dimFinalPorte({ pose, H, L }) {
    let addH = 0;
    let addL = 0;
    if (pose === "applique" || pose === "feuillure") {
      addH = 30;
      addL = 60;
    } else if (pose === "tunnel") {
      addH = -10;
      addL = -10;
    }
    return { haut: H + addH, larg: L + addL, surface: ((H + addH) * (L + addL)) / 1e6 };
  },

  pricePorte(cfg) {
    const P = window.PRICING.porte;
    const dim = this.dimFinalPorte(cfg);
    const fam = cfg.famille || "pvc";
    let base = Math.max(P.min[fam], dim.surface * P.prixM2[fam]);
    base += P.pose[cfg.pose] || 0;
    if (cfg.ouverture?.includes("tierce")) base += P.tierce;
    if (cfg.ouverture?.includes("imposte")) base += P.imposte;
    if (fam === "alu") {
      base += P.couleurFace[cfg.couleurExt] || 0;
      base += P.couleurFace[cfg.couleurInt] || 0;
    }
    if (
      fam === "pvc" &&
      cfg.varianteCouleur &&
      cfg.varianteCouleur !== "Blanc"
    ) {
      base += P.finitionPanneau || 0;
    }
    if (cfg.hasGlass) base += P.vitragePanneau[cfg.vitragePanneau] || 0;
    if (cfg.ouverture?.includes("tierce")) {
      base += P.vitrageFixe[cfg.vitrageTierce] || 0;
      if (cfg.warmTierce) base += P.warmEdge;
      base += P.decor[cfg.decorTierce] || 0;
      base += ((cfg.croisHTierce || 0) + (cfg.croisVTierce || 0)) * P.croisillonUnite;
    }
    if (cfg.ouverture?.includes("imposte")) {
      base += P.vitrageFixe[cfg.vitrageImposte] || 0;
      if (cfg.warmImposte) base += P.warmEdge;
      base += P.decor[cfg.decorImposte] || 0;
      base += ((cfg.croisHImposte || 0) + (cfg.croisVImposte || 0)) * P.croisillonUnite;
    }
    if (cfg.voletIntegre) base += P.voletIntegre;
    base += P.serrure[cfg.serrure] || 0;
    base += P.poignee[cfg.poigneeExt] || 0;
    base += P.poignee[cfg.poigneeInt] || 0;
    base += P.cylindre[cfg.cylindre] || 0;
    const qty = cfg.qty || 1;
    const produit = this.applyPromo(base * qty);
    return { dim, produit, total: produit.ttc, qty };
  },
};

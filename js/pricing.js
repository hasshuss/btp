/**
 * Grilles de prix — à modifier ici pour ajuster le chiffrage.
 * Tous les montants sont en euros TTC avant remise globale.
 *
 * Le calcul volet reprend les règles de fabrication (coffre, pose A/B/C,
 * traditionnel, monobloc) ; les tarifs sont une base éditable, pas ceux
 * du site d'origine.
 */
window.PRICING = {
  promoPercent: 15,

  volet: {
    prixM2: {
      reno: { alu39: 210, pvc39: 165 },
      tradi: { alu39: 175, pvc39: 135 },
      mono: { alu39: 245, pvc39: 195 },
    },
    min: { reno: 99, tradi: 79, mono: 129 },
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
      fenetre: 290,
      "porte-fenetre": 340,
      "porte-balcon": 325,
      coulissant: 380,
    },
    min: {
      fenetre: 149,
      "porte-fenetre": 249,
      "porte-balcon": 229,
      coulissant: 399,
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

  garage: {
    base: 990,
    par100mmLargeur: 28,
    par100mmHauteur: 24,
    refLargeur: 2000,
    refHauteur: 2000,
    motifCassette: 0,
    couleur: { "9016": 0, "7016": 80, "8019": 80, "9005": 95, ral: 140 },
    portillon: 199,
    hublotRect: 45,
    hublotLigne: 62,
    tractionArriere: 270,
    linteauMinTraction: 200,
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
    const coffreMono = 185;

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
    } else {
      HFinal = Htab + coffreMono;
      coffre = coffreMono;
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

  limitsVolet({ lame, manoeuvre, type }) {
    const lim = { hmin: 700, lmin: 700, hmax: 3000, lmax: 3000 };
    lim.lmin = manoeuvre === "solaire-gm" ? 900 : 700;
    if (lame === "alu39") {
      if (manoeuvre === "sangle") lim.hmax = 2200;
    } else {
      lim.hmax = 2250;
      lim.lmax = 2100;
      if (manoeuvre === "sangle") lim.hmax = 2200;
    }
    if (type === "mono") lim.hmax = 2165;
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

  priceGarage(cfg) {
    const P = window.PRICING.garage;
    const extraL = Math.max(0, Math.ceil((cfg.largeur - P.refLargeur) / 100)) * P.par100mmLargeur;
    const extraH = Math.max(0, Math.ceil((cfg.hauteur - P.refHauteur) / 100)) * P.par100mmHauteur;
    let base = P.base + extraL + extraH;
    base += P.couleur[cfg.couleur] || 0;
    if (cfg.portillon) base += P.portillon;
    base += (cfg.hublotsRect || 0) * P.hublotRect;
    base += (cfg.hublotsLigne || 0) * P.hublotLigne;
    if (cfg.linteau < P.linteauMinTraction) base += P.tractionArriere;
    const qty = cfg.qty || 1;
    const produit = this.applyPromo(base * qty);
    return { produit, total: produit.ttc, qty };
  },
};

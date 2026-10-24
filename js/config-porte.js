const COLORS = {
  "9016": { hex: "#f3f3ef", label: "Blanc 9016" },
  "7016": { hex: "#3a4044", label: "Gris anthracite 7016" },
  chene: { hex: "#b07a45", label: "Chêne doré" },
  "9011": { hex: "#1a1a1a", label: "Noir mat 9011" },
  "7039": { hex: "#6b6e70", label: "Gris quartz 7039" },
};

const DECORS = [
  ["clair", "Clair"],
  ["g200", "G200"],
  ["depoli", "Dépoli"],
  ["chinchilla", "Chinchilla"],
  ["olivier", "Olivier"],
  ["delta-clair", "Delta clair"],
  ["delta-mat", "Delta mat"],
];

const POIGNEES = [
  ["sans", "Sans"],
  ["baton", "Bâton maréchal"],
  ["paliere-blanc", "Blanche palière"],
  ["paliere-ano", "Anodisé palière"],
  ["blanc", "Blanche"],
  ["gris", "Gris"],
  ["marron", "Marron"],
  ["anodise", "Anodisé"],
];

let DOOR_MODELS = Array.isArray(window.DOOR_MODELS) ? window.DOOR_MODELS : [];

async function loadDoorModels() {
  if (DOOR_MODELS.length) return DOOR_MODELS;
  try {
    const res = await fetch("js/door-models.json", { cache: "no-cache" });
    if (res.ok) DOOR_MODELS = await res.json();
  } catch {
    /* file:// ou réseau : bundle js/door-models-bundle.js */
  }
  return DOOR_MODELS;
}

function modelsPvc() {
  return DOOR_MODELS.filter((m) => m.famille === "pvc");
}

function modelsAlu() {
  return DOOR_MODELS.filter((m) => m.famille === "alu");
}

const PANEL_COLOR_HEX = {
  Blanc: "#f3f3ef",
  Noyer: "#4a3428",
  Walnut: "#5c4030",
  Acajou: "#6b3a2e",
  "Chêne Doré": "#b07a45",
  "Chêne Foncé": "#7a5230",
  Anthracite: "#3a4044",
};

const COLOR_GROUP_ORDER = [
  "Blanc",
  "Noyer",
  "Walnut",
  "Acajou",
  "Chêne Doré",
  "Chêne Foncé",
  "Anthracite",
];

let CATALOG_ENTRIES = [];

function rebuildCatalogEntries() {
  const entries = [];
  for (const m of modelsPvc()) {
    entries.push({
      id: m.id,
      name: m.name,
      couleur: "Blanc",
      varianteCode: m.name,
      imgLocal: m.imgLocal || m.img || "",
      baseId: m.id,
      glass: m.glass,
      pattern: m.pattern,
      famille: m.famille,
    });
    for (const v of m.colorVariants || []) {
      entries.push({
        id: v.id,
        name: m.name,
        couleur: v.couleur,
        varianteCode: v.code,
        imgLocal: v.imgLocal,
        baseId: m.id,
        glass: m.glass,
        pattern: m.pattern,
        famille: m.famille,
      });
    }
  }
  CATALOG_ENTRIES = entries;
  return entries;
}

function catalogEntryById(id) {
  return CATALOG_ENTRIES.find((e) => e.id === id) || CATALOG_ENTRIES[0];
}

function modelPhoto(m) {
  if (!m) return "";
  return m.imgLocal || m.img || "";
}

const OPENINGS = [
  { value: "gauche-simple", side: "gauche", label: "Simple vantail", tierce: false, imposte: false },
  { value: "gauche-tierce", side: "gauche", label: "Partie fixe droite", tierce: true, imposte: false },
  { value: "gauche-imposte", side: "gauche", label: "Avec imposte", tierce: false, imposte: true },
  { value: "gauche-imposte-tierce", side: "gauche", label: "Imposte + partie fixe", tierce: true, imposte: true },
  { value: "droite-simple", side: "droite", label: "Simple vantail", tierce: false, imposte: false },
  { value: "droite-tierce", side: "droite", label: "Partie fixe gauche", tierce: true, imposte: false },
  { value: "droite-imposte", side: "droite", label: "Avec imposte", tierce: false, imposte: true },
  { value: "droite-imposte-tierce", side: "droite", label: "Imposte + partie fixe", tierce: true, imposte: true },
];

function val(name) {
  return document.querySelector(`[name="${name}"]:checked`)?.value;
}

function modelById(id) {
  const entry = catalogEntryById(id);
  if (entry) return entry;
  return DOOR_MODELS.find((m) => m.id === id) || DOOR_MODELS[0];
}

function glassTint(kind) {
  if (kind === "chinchilla") return "#bcc6d4";
  if (kind === "delta") return "#9eb8d4";
  return "#d5dce6";
}

function doorPattern(pattern, x, y, w, h, fill, glass, hasGlass) {
  const stroke = "rgba(0,0,0,.28)";
  const g = glassTint(glass);
  const inner = (ix, iy, iw, ih, fillCol) =>
    `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="2" fill="${fillCol}" stroke="${stroke}" stroke-width="1"/>`;
  if (pattern === "panels3") {
    const ph = (h - 16) / 3;
    return [0, 1, 2].map((i) => inner(x + 8, y + 8 + i * ph, w - 16, ph - 8, fill)).join("");
  }
  if (pattern === "panels2") {
    const ph = (h - 14) / 2;
    return [0, 1].map((i) => inner(x + 8, y + 8 + i * ph, w - 16, ph - 8, fill)).join("");
  }
  if (!hasGlass || pattern === "solid") {
    return inner(x + 8, y + 8, w - 16, h - 16, fill);
  }
  if (pattern === "glassTop") {
    return inner(x + 8, y + 8, w - 16, h * 0.28, g) + inner(x + 8, y + h * 0.4, w - 16, h * 0.52, fill);
  }
  if (pattern === "glassMid") {
    return (
      inner(x + 8, y + 8, w - 16, h * 0.22, fill) +
      inner(x + 8, y + h * 0.34, w - 16, h * 0.28, g) +
      inner(x + 8, y + h * 0.68, w - 16, h * 0.24, fill)
    );
  }
  if (pattern === "glass2h") {
    return inner(x + 8, y + 8, w - 16, h * 0.38, g) + inner(x + 8, y + h * 0.52, w - 16, h * 0.4, fill);
  }
  if (pattern === "glass3h") {
    const gh = (h - 24) / 3;
    return [0, 1, 2].map((i) => inner(x + 8, y + 8 + i * (gh + 4), w - 16, gh, g)).join("");
  }
  if (pattern === "glassVertL") {
    return inner(x + 8, y + 8, w * 0.34, h - 16, g) + inner(x + w * 0.46, y + 8, w * 0.42, h - 16, fill);
  }
  if (pattern === "glassBars") {
    let out = inner(x + 8, y + 8, w - 16, h - 16, g);
    for (let i = 1; i < 4; i++) {
      const yy = y + 8 + ((h - 16) * i) / 4;
      out += `<rect x="${x + 8}" y="${yy}" width="${w - 16}" height="4" fill="${fill}"/>`;
    }
    return out;
  }
  if (pattern === "glassGrid") {
    let out = "";
    const cw = (w - 20) / 2;
    const ch = (h - 24) / 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        out += inner(x + 8 + c * (cw + 4), y + 8 + r * (ch + 4), cw, ch, g);
      }
    }
    return out;
  }
  return inner(x + 8, y + 8, w - 16, h - 16, fill);
}

function openingSchema(o) {
  const leaf = o.side === "gauche"
    ? `<rect x="18" y="28" width="44" height="58" fill="rgba(255,255,255,.15)" stroke="#1b2a78" stroke-width="1.2"/><path d="M62 57 H78" stroke="#1b2a78" stroke-width="2"/><circle cx="58" cy="57" r="3" fill="#1b2a78"/>`
    : `<rect x="38" y="28" width="44" height="58" fill="rgba(255,255,255,.15)" stroke="#1b2a78" stroke-width="1.2"/><path d="M38 57 H22" stroke="#1b2a78" stroke-width="2"/><circle cx="42" cy="57" r="3" fill="#1b2a78"/>`;
  const tierce = o.tierce
    ? o.side === "gauche"
      ? `<rect x="64" y="28" width="18" height="58" fill="rgba(201,216,234,.55)" stroke="#1b2a78" stroke-width="1.2"/>`
      : `<rect x="18" y="28" width="18" height="58" fill="rgba(201,216,234,.55)" stroke="#1b2a78" stroke-width="1.2"/>`
    : "";
  const imposte = o.imposte
    ? `<rect x="18" y="12" width="64" height="14" fill="rgba(201,216,234,.55)" stroke="#1b2a78" stroke-width="1.2"/>`
    : "";
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${imposte}${tierce}${leaf}</svg>`;
}

function openingVisual(o, modeleId) {
  const src = modelPhoto(modelById(modeleId));
  const svg = openingSchema(o);
  if (!src) return svg;
  return `<div class="opening-combo"><img class="opening-combo-photo" src="${src}" alt="" loading="lazy"><div class="opening-combo-overlay">${svg}</div></div>`;
}

function renderDoorPreview(cfg, view) {
  const m = modelById(cfg.modele);
  const src = modelPhoto(m);
  if (src) {
    const flip = view === "ext" ? ' style="transform:scaleX(-1)"' : "";
    return `<img class="door-model-photo"${flip} src="${src}" alt="${m.name}">`;
  }
  return renderDoorSVG(cfg, view);
}

function syncOpeningPhotos(modeleId) {
  const src = modelPhoto(modelById(modeleId));
  if (!src) return;
  document.querySelectorAll(".opening-combo-photo").forEach((img) => {
    img.src = src;
  });
}

function renderDoorSVG(cfg, view) {
  const model = modelById(cfg.modele);
  const color = view === "ext" ? COLORS[cfg.couleurExt].hex : COLORS[cfg.couleurInt].hex;
  const ouv = OPENINGS.find((o) => o.value === cfg.ouverture) || OPENINGS[0];
  const W = 200;
  const H = 320;
  const frame = 10;
  const hasT = ouv.tierce;
  const hasI = ouv.imposte;
  const tierceW = hasT ? 48 : 0;
  const imposteH = hasI ? 52 : 0;
  const leafX = hasT && ouv.side === "droite" ? frame + tierceW : frame;
  const leafY = frame + imposteH;
  const leafW = W - frame * 2 - tierceW;
  const leafH = H - frame * 2 - imposteH;
  const tierceX = ouv.side === "gauche" ? frame + leafW : frame;
  const handleX = ouv.side === "gauche" ? leafX + leafW - 14 : leafX + 10;
  const handle = cfg.poigneeExt === "sans" && view === "ext"
    ? ""
    : `<rect x="${handleX}" y="${leafY + leafH * 0.46}" width="8" height="22" rx="2" fill="#c0c4cc" stroke="#333"/>`;
  const glass = cfg.vitragePanneau;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="4" fill="#5d6570" stroke="#222"/>
    ${hasI ? `<rect x="${frame}" y="${frame}" width="${W - frame * 2}" height="${imposteH - 4}" fill="${glassTint(cfg.decorImposte)}" stroke="#222"/>` : ""}
    ${hasT ? `<rect x="${tierceX}" y="${leafY}" width="${tierceW - 4}" height="${leafH}" fill="${glassTint(cfg.decorTierce)}" stroke="#222"/>` : ""}
    <rect x="${leafX}" y="${leafY}" width="${leafW}" height="${leafH}" fill="${color}" stroke="#222"/>
    ${doorPattern(model.pattern, leafX, leafY, leafW, leafH, color, glass, model.glass)}
    ${handle}
  </svg>`;
}

function collect() {
  const model = modelById(val("modele") || CATALOG_ENTRIES[0]?.id);
  return {
    modele: model.id,
    nom: model.name,
    varianteCouleur: model.couleur || "",
    varianteCode: model.varianteCode || model.name,
    famille: model.famille,
    hasGlass: model.glass,
    pose: val("pose") || "applique",
    H: parseInt(document.getElementById("hauteur").value, 10) || 0,
    L: parseInt(document.getElementById("largeur").value, 10) || 0,
    ouverture: val("ouverture") || "gauche-simple",
    hImposte: parseInt(document.getElementById("h-imposte").value, 10) || 300,
    lTierce: parseInt(document.getElementById("l-tierce").value, 10) || 300,
    couleurExt: val("couleur-ext") || "9016",
    couleurInt: val("couleur-int") || "9016",
    vitragePanneau: val("vitrage-panneau") || "depoli",
    vitrageTierce: val("vitrage-tierce") || "332",
    vitrageImposte: val("vitrage-imposte") || "thermique",
    warmTierce: document.getElementById("warm-tierce").checked,
    warmImposte: document.getElementById("warm-imposte").checked,
    decorTierce: val("decor-tierce") || "clair",
    decorImposte: val("decor-imposte") || "clair",
    croisHTierce: parseInt(document.getElementById("crois-h-tierce").value, 10) || 0,
    croisVTierce: parseInt(document.getElementById("crois-v-tierce").value, 10) || 0,
    croisHImposte: parseInt(document.getElementById("crois-h-imposte").value, 10) || 0,
    croisVImposte: parseInt(document.getElementById("crois-v-imposte").value, 10) || 0,
    voletIntegre: document.getElementById("volet-integre").checked,
    serrure: val("serrure") || "relevage-galets",
    poigneeExt: val("poignee-ext") || "blanc",
    poigneeInt: val("poignee-int") || "blanc",
    cylindre: val("cylindre") || "varie",
    qty: parseInt(document.getElementById("quantite").value, 10) || 1,
  };
}

function openingMeta(value) {
  return OPENINGS.find((o) => o.value === value) || OPENINGS[0];
}

function compatible(o, dim, hImp, lTie) {
  const ouvH = dim.haut - (o.imposte ? hImp : 0);
  const ouvL = dim.larg - (o.tierce ? lTie : 0);
  if (ouvH > 2250) return false;
  if (ouvL > 1150) return false;
  if (!o.imposte && dim.haut > 2250) return false;
  if (!o.tierce && dim.larg > 1150) return false;
  return true;
}

function updateUI() {
  const cfg = collect();
  const dim = PricingEngine.dimFinalPorte(cfg);
  document.getElementById("HautFinal").textContent = dim.haut;
  document.getElementById("LargFinal").textContent = dim.larg;
  document.getElementById("surface").textContent = dim.surface.toFixed(2);
  document.getElementById("pose-recap").textContent = `Hors tout — pose ${cfg.pose} · ${dim.haut} × ${dim.larg} mm`;

  const errors = [];
  if (cfg.H < 1800 || cfg.H > 2500) errors.push("Hauteur hors limites (1800–2500 mm)");
  if (cfg.L < 700 || cfg.L > 2000) errors.push("Largeur hors limites (700–2000 mm)");

  const ouv = openingMeta(cfg.ouverture);
  document.getElementById("block-fixes").hidden = !(ouv.tierce || ouv.imposte);
  document.getElementById("field-imposte").hidden = !ouv.imposte;
  document.getElementById("field-tierce").hidden = !ouv.tierce;

  OPENINGS.forEach((o) => {
    const input = document.querySelector(`[name="ouverture"][value="${o.value}"]`);
    if (!input) return;
    const ok = compatible(o, dim, cfg.hImposte, cfg.lTierce);
    input.disabled = !ok;
    input.closest(".option")?.classList.toggle("disabled", !ok);
  });

  if (!compatible(ouv, dim, cfg.hImposte, cfg.lTierce)) {
    const next = OPENINGS.find((o) => compatible(o, dim, cfg.hImposte, cfg.lTierce));
    if (next) {
      const el = document.querySelector(`[name="ouverture"][value="${next.value}"]`);
      if (el) el.checked = true;
    }
  }

  const cfg2 = collect();
  const ouv2 = openingMeta(cfg2.ouverture);
  const warns = [];
  if (dim.haut > 2250) warns.push("Imposte obligatoire — hauteur ouvrant max. 2250 mm (hors tout).");
  if (dim.larg > 1150) warns.push("Partie fixe obligatoire — largeur ouvrant max. 1150 mm (hors tout).");
  document.getElementById("dim-warn").textContent = warns.join(" ");

  const pvc = cfg2.famille === "pvc";
  document.getElementById("color-hint").textContent = pvc
    ? "Coloris hors blanc non disponibles sur les panneaux PVC."
    : "Cliquez sur « Changer vue » pour passer de l'extérieur à l'intérieur.";
  document.querySelectorAll('[name="couleur-ext"], [name="couleur-int"]').forEach((el) => {
    const lock = pvc && el.value !== "9016";
    el.disabled = lock;
    el.closest(".swatch")?.classList.toggle("disabled", lock);
    if (lock && el.checked) {
      document.querySelector(`[name="${el.name}"][value="9016"]`).checked = true;
    }
  });

  const model = modelById(cfg2.modele);
  document.getElementById("no-glass").hidden = model.glass;
  document.querySelectorAll('[name="vitrage-panneau"]').forEach((el) => {
    el.closest(".option").style.display = model.glass ? "" : "none";
  });
  document.getElementById("block-vitrage-tierce").hidden = !ouv2.tierce;
  document.getElementById("block-vitrage-imposte").hidden = !ouv2.imposte;

  const paliere = cfg2.serrure.startsWith("paliere");
  document.querySelectorAll('[name="poignee-ext"]').forEach((el) => {
    const allowed = !paliere || el.value === "sans" || el.value === "baton";
    el.disabled = !allowed;
    el.closest(".option")?.classList.toggle("disabled", !allowed);
    if (!allowed && el.checked) {
      const baton = document.querySelector('[name="poignee-ext"][value="baton"]');
      if (baton) baton.checked = true;
    }
  });

  const live = collect();
  if (ouv2.imposte && (live.hImposte < 300 || live.hImposte > 600)) errors.push("Hauteur imposte 300–600 mm");
  if (ouv2.tierce && (live.lTierce < 300 || live.lTierce > 600)) errors.push("Largeur tierce 300–600 mm");
  document.getElementById("global-error").textContent = errors.join(" · ");

  const result = PricingEngine.pricePorte(live);
  const ok = errors.length === 0;
  document.getElementById("prixttc").textContent = ok ? PricingEngine.euro(result.total) : "—";
  document.getElementById("old-price").textContent = ok ? PricingEngine.euro(result.produit.ht) : "";
  document.getElementById("prix-4x").textContent = ok ? PricingEngine.euro(result.total / 4) : "—";
  document.getElementById("add-cart").classList.toggle("disabled", !ok);

  const poseNames = { applique: "applique", tunnel: "tunnel", feuillure: "feuillure" };
  const couleurLabel = live.varianteCouleur ? ` · ${live.varianteCouleur}` : "";
  document.getElementById("recap").innerHTML = ok
    ? `<b>${live.nom}</b>${couleurLabel} · ${live.famille.toUpperCase()} · ${poseNames[live.pose]} · ${live.H} × ${live.L} mm · ${openingMeta(live.ouverture).label}`
    : "Corrigez les dimensions pour obtenir un prix.";

  syncOpeningPhotos(live.modele);

  const view = document.getElementById("door-preview").dataset.view || "int";
  document.getElementById("door-preview").innerHTML = renderDoorPreview(live, view);
  const hasPhoto = !!modelPhoto(model);
  const varLabel = live.varianteCouleur ? ` · ${live.varianteCouleur}` : "";
  document.getElementById("vue-label").textContent = hasPhoto
    ? `${model.name}${varLabel} — ${view === "int" ? "vue intérieur" : "vue extérieur (miroir)"} · photo indicative`
    : (view === "int" ? "Vue intérieur" : "Vue extérieur") + " — schéma non contractuel";

  window.__porteCfg = { cfg: live, result, ok };
}

function radioCard(name, value, checked, html) {
  return `<label class="option">${html}<input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""}></label>`;
}

function modelCardHtml(entry, checked) {
  const src = entry.imgLocal || "";
  const thumb = src
    ? `<img class="model-photo" src="${src}" alt="" loading="lazy">`
    : renderDoorSVG({
      modele: entry.baseId || entry.id,
      couleurExt: "9016",
      couleurInt: "9016",
      ouverture: "gauche-simple",
      vitragePanneau: "depoli",
      decorTierce: "clair",
      decorImposte: "clair",
      poigneeExt: "blanc",
    }, "int");
  return `<label class="model-card">
      <input type="radio" name="modele" value="${entry.id}" ${checked ? "checked" : ""}>
      ${thumb}
      <b>${entry.name}</b>
    </label>`;
}

function catalogByColorHtml(defaultId) {
  const byColor = new Map();
  for (const e of CATALOG_ENTRIES) {
    if (!byColor.has(e.couleur)) byColor.set(e.couleur, []);
    byColor.get(e.couleur).push(e);
  }
  for (const list of byColor.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }
  const seen = new Set(COLOR_GROUP_ORDER);
  const extra = [...byColor.keys()].filter((c) => !seen.has(c)).sort((a, b) => a.localeCompare(b, "fr"));
  const order = COLOR_GROUP_ORDER.filter((c) => byColor.has(c)).concat(extra);
  const pickId = CATALOG_ENTRIES.some((e) => e.id === defaultId) ? defaultId : CATALOG_ENTRIES[0]?.id;
  let pickedDefault = false;
  return order.map((couleur) => {
    const items = byColor.get(couleur) || [];
    const hex = PANEL_COLOR_HEX[couleur] || "#c8b8a8";
    const cards = items.map((entry) => {
      const checked = !pickedDefault && entry.id === pickId;
      if (checked) pickedDefault = true;
      return modelCardHtml(entry, checked);
    }).join("");
    return `<section class="model-color-group">
      <h4 class="model-color-heading"><i style="background:${hex}"></i>${couleur}</h4>
      <div class="model-grid">${cards}</div>
    </section>`;
  }).join("");
}

function build() {
  rebuildCatalogEntries();
  const defaultModele = CATALOG_ENTRIES[0]?.id;
  const catalogEl = document.getElementById("catalog-by-color");
  if (catalogEl) catalogEl.innerHTML = catalogByColorHtml(defaultModele);

  document.getElementById("ouv-gauche").innerHTML = OPENINGS.filter((o) => o.side === "gauche").map((o, i) =>
    radioCard("ouverture", o.value, i === 0, `${openingVisual(o, defaultModele)}<span>${o.label}</span>`)
  ).join("");
  document.getElementById("ouv-droite").innerHTML = OPENINGS.filter((o) => o.side === "droite").map((o) =>
    radioCard("ouverture", o.value, false, `${openingVisual(o, defaultModele)}<span>${o.label}</span>`)
  ).join("");

  const swatch = (name, checkedKey) =>
    Object.entries(COLORS).map(([id, c]) => `
      <label class="swatch"><i style="background:${c.hex}"></i>
        <input type="radio" name="${name}" value="${id}" ${id === checkedKey ? "checked" : ""}>
        ${c.label.replace(/ .*/, "")}
      </label>`).join("");
  document.getElementById("swatch-ext").innerHTML = swatch("couleur-ext", "9016");
  document.getElementById("swatch-int").innerHTML = swatch("couleur-int", "9016");

  const decor = (name) =>
    DECORS.map(([id, label], i) =>
      `<label class="option"><input type="radio" name="${name}" value="${id}" ${i === 0 ? "checked" : ""}>${label}</label>`
    ).join("");
  document.getElementById("decor-tierce").innerHTML = decor("decor-tierce");
  document.getElementById("decor-imposte").innerHTML = decor("decor-imposte");

  document.getElementById("poignee-ext").innerHTML = POIGNEES.map(([id, label], i) =>
    `<label class="option"><input type="radio" name="poignee-ext" value="${id}" ${id === "blanc" ? "checked" : ""}>${label}</label>`
  ).join("");
  document.getElementById("poignee-int").innerHTML = POIGNEES.filter((p) => p[0] !== "gris" && p[0] !== "marron").map(([id, label]) =>
    `<label class="option"><input type="radio" name="poignee-int" value="${id}" ${id === "blanc" ? "checked" : ""}>${label}</label>`
  ).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadDoorModels();
  if (!DOOR_MODELS.length) {
    document.getElementById("global-error").textContent =
      "Catalogue modèles indisponible — rechargez via un serveur local (npx serve).";
    return;
  }
  build();
  const form = document.getElementById("configPorte");
  form.addEventListener("change", updateUI);
  form.addEventListener("input", updateUI);
  document.getElementById("quantite").addEventListener("change", updateUI);
  document.getElementById("changer-vue").addEventListener("click", () => {
    const box = document.getElementById("door-preview");
    box.dataset.view = box.dataset.view === "ext" ? "int" : "ext";
    updateUI();
  });
  document.getElementById("add-cart").addEventListener("click", () => {
    const state = window.__porteCfg;
    if (!state?.ok) return;
    Cart.add({
      type: "porte",
      title: "Porte d'entrée sur mesure",
      detail: document.getElementById("recap").innerText,
      qty: state.cfg.qty,
      price: state.result.total,
    });
    location.href = "panier.html";
  });
  const steps = [...document.querySelectorAll(".wizard-steps a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      steps.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-40% 0px -50% 0px" });
  document.querySelectorAll("[id^=step-]").forEach((s) => io.observe(s));
  updateUI();
});

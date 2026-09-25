function val(name) {
  return document.querySelector(`[name="${name}"]:checked`)?.value;
}

function collect() {
  return {
    type: val("type"),
    pose: val("pose"),
    H: parseInt(document.getElementById("hauteur").value, 10) || 0,
    L: parseInt(document.getElementById("largeur").value, 10) || 0,
    vantaux: parseInt(val("vantaux"), 10),
    oscillo: document.getElementById("oscillo").checked,
    vitrage: val("vitrage"),
    warmEdge: document.getElementById("warm-edge").checked,
    croisillon: document.getElementById("croisillon").checked,
    couleur: val("couleur"),
    voletMono: document.getElementById("volet-mono").checked,
    qty: parseInt(document.getElementById("quantite").value, 10) || 1,
  };
}

function limits(type) {
  if (type === "coulissant") return { hmin: 1400, hmax: 2400, lmin: 1400, lmax: 3000 };
  if (type === "porte-fenetre" || type === "porte-balcon") return { hmin: 1800, hmax: 2300, lmin: 600, lmax: 2500 };
  return { hmin: 400, hmax: 1950, lmin: 400, lmax: 2500 };
}

function updateUI() {
  const cfg = collect();
  const lim = limits(cfg.type);
  document.getElementById("limH").textContent = `${lim.hmin}–${lim.hmax}`;
  document.getElementById("limL").textContent = `${lim.lmin}–${lim.lmax}`;

  const dim = PricingEngine.dimFinalFenetre(cfg);
  document.getElementById("HautFinal").textContent = dim.haut;
  document.getElementById("LargFinal").textContent = dim.larg;
  document.getElementById("surface").textContent = dim.surface.toFixed(2);

  const errors = [];
  if (cfg.H < lim.hmin || cfg.H > lim.hmax) errors.push("Hauteur hors limites");
  if (cfg.L < lim.lmin || cfg.L > lim.lmax) errors.push("Largeur hors limites");
  if (cfg.vantaux === 3 && cfg.L < 1400) errors.push("3 vantaux : largeur min 1400 mm");
  document.getElementById("global-error").textContent = errors.join(" · ");

  const result = PricingEngine.priceFenetre(cfg);
  const ok = errors.length === 0;
  document.getElementById("prixttc").textContent = ok ? PricingEngine.euro(result.total) : "—";
  document.getElementById("old-price").textContent = ok ? PricingEngine.euro(result.produit.ht) : "";
  document.getElementById("prix-4x").textContent = ok ? PricingEngine.euro(result.total / 4) : "—";
  document.getElementById("add-cart").classList.toggle("disabled", !ok);

  const names = {
    fenetre: "Fenêtre PVC",
    "porte-fenetre": "Porte-fenêtre",
    "porte-balcon": "Porte balcon",
    coulissant: "Baie coulissante",
  };
  document.getElementById("recap").innerHTML = ok
    ? `<b>${names[cfg.type]}</b> · ${cfg.H} × ${cfg.L} mm · ${cfg.vantaux} vantail(x) · ${cfg.vitrage}`
    : "Corrigez les dimensions pour obtenir un prix.";

  window.__fenetreCfg = { cfg, result, ok };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("configFen");
  form.addEventListener("change", updateUI);
  form.addEventListener("input", updateUI);
  document.getElementById("quantite").addEventListener("change", updateUI);
  document.getElementById("add-cart").addEventListener("click", () => {
    const state = window.__fenetreCfg;
    if (!state?.ok) return;
    Cart.add({
      type: "fenetre",
      title: "Menuiserie PVC sur mesure",
      detail: document.getElementById("recap").innerText,
      qty: state.cfg.qty,
      price: state.result.total,
    });
    location.href = "panier.html";
  });
  updateUI();
});

function val(name) {
  return document.querySelector(`[name="${name}"]:checked`)?.value;
}

function collect() {
  return {
    hauteur: parseInt(document.getElementById("hauteur").value, 10) || 0,
    largeur: parseInt(document.getElementById("largeur").value, 10) || 0,
    linteau: parseInt(document.getElementById("linteau").value, 10) || 0,
    ecoG: parseInt(document.getElementById("eco-g").value, 10) || 0,
    ecoD: parseInt(document.getElementById("eco-d").value, 10) || 0,
    motif: val("motif"),
    couleur: val("couleur"),
    portillon: document.getElementById("portillon").checked,
    hublotsRect: parseInt(document.getElementById("hublots-rect").value, 10) || 0,
    hublotsLigne: parseInt(document.getElementById("hublots-ligne").value, 10) || 0,
    qty: parseInt(document.getElementById("quantite").value, 10) || 1,
  };
}

function updateUI() {
  const cfg = collect();
  const errors = [];
  if (cfg.hauteur < 1800 || cfg.hauteur > 3000) errors.push("Hauteur 1800–3000 mm");
  if (cfg.largeur < 1900 || cfg.largeur > 3000) errors.push("Largeur 1900–3000 mm");
  if (cfg.linteau < 120) errors.push("Linteau minimum 120 mm");
  if (cfg.ecoG < 70 || cfg.ecoD < 70) errors.push("Écoinçons min. 70 mm");
  if (cfg.portillon && cfg.hauteur < 2000) errors.push("Portillon : hauteur min. 2000 mm");
  if (cfg.motif === "cassette" && (cfg.hublotsRect || cfg.hublotsLigne)) {
    errors.push("Hublots indisponibles avec le motif cassette");
  }

  document.getElementById("traction-info").hidden = cfg.linteau >= 200;
  document.getElementById("global-error").textContent = errors.join(" · ");

  const result = PricingEngine.priceGarage(cfg);
  const ok = errors.length === 0;
  document.getElementById("prixttc").textContent = ok ? PricingEngine.euro(result.total) : "—";
  document.getElementById("old-price").textContent = ok ? PricingEngine.euro(result.produit.ht) : "";
  document.getElementById("prix-4x").textContent = ok ? PricingEngine.euro(result.total / 4) : "—";
  document.getElementById("add-cart").classList.toggle("disabled", !ok);
  document.getElementById("recap").innerHTML = ok
    ? `<b>Porte sectionnelle</b> · ${cfg.largeur} × ${cfg.hauteur} mm · ${cfg.motif} · RAL ${cfg.couleur}`
    : "Corrigez la configuration pour obtenir un prix.";

  window.__garageCfg = { cfg, result, ok };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("configGarage");
  form.addEventListener("change", updateUI);
  form.addEventListener("input", updateUI);
  document.getElementById("quantite").addEventListener("change", updateUI);
  document.getElementById("add-cart").addEventListener("click", () => {
    const state = window.__garageCfg;
    if (!state?.ok) return;
    Cart.add({
      type: "garage",
      title: "Porte de garage sectionnelle",
      detail: document.getElementById("recap").innerText,
      qty: state.cfg.qty,
      price: state.result.total,
    });
    location.href = "panier.html";
  });
  updateUI();
});

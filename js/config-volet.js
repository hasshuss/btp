function val(name) {
  return document.querySelector(`[name="${name}"]:checked`)?.value;
}

function disableById(id, off) {
  const el = document.getElementById(id);
  if (!el) return;
  el.disabled = !!off;
  el.closest(".option")?.classList.toggle("disabled", !!off);
  if (off && el.checked) {
    const first = document.querySelector(`[name="${el.name}"]:not(:disabled)`);
    if (first) first.checked = true;
  }
}

function show(sel, on) {
  document.querySelectorAll(sel).forEach((el) => {
    el.hidden = !on;
  });
}

function collect() {
  const acc = [...document.querySelectorAll('[name="accessoire"]:checked')].map((i) => i.value);
  return {
    type: val("type_volet"),
    pose: val("pose"),
    Ltab: parseInt(document.getElementById("largeur-tab").value, 10) || 0,
    Htab: parseInt(document.getElementById("hauteur-tab").value, 10) || 0,
    manoeuvre: val("manoeuvre"),
    lame: val("type-lame"),
    coulisse: val("coulisse"),
    couleurLame: val("couleur-lame"),
    couleurOssature: val("couleur-ossature"),
    attache: val("attache"),
    sortie: val("sortie"),
    qty: parseInt(document.getElementById("quantite").value, 10) || 1,
    accessoires: acc,
  };
}

function labels() {
  return {
    types: { reno: "Rénovation", tradi: "Traditionnel", mono: "Monobloc" },
    poses: { renoA: "Pose A sous linteau", renoB: "Pose B inversée", renoC: "Pose C façade" },
    mans: {
      "filaire-gm": "Filaire",
      "filaire-somfy": "Filaire Somfy",
      "radio-gm": "Radio",
      deltadore: "Radio Delta Dore",
      sangle: "Sangle",
      manivelle: "Manivelle",
      "solaire-gm": "Solaire",
    },
  };
}

function updateUI() {
  const cfg = collect();
  const type = cfg.type;
  show("#block-pose, #block-coffre, #block-coulisse", type === "reno");
  show("#block-sortie", type !== "tradi");

  document.getElementById("title-h").textContent =
    type === "mono" ? "Hauteur hors tout de la fenêtre" : "Hauteur entre murs";
  document.getElementById("title-l").textContent =
    type === "mono" ? "Largeur hors tout de la fenêtre" : "Largeur entre murs";

  if (type !== "reno" && cfg.manoeuvre === "solaire-gm") {
    document.getElementById("man-filaire-gm").checked = true;
  }

  const cfg2 = collect();
  const solarOk = cfg2.type === "reno" && cfg2.Ltab >= 900 && cfg2.attache !== "rigide";
  disableById("man-solaire-gm", !solarOk);

  const lim = PricingEngine.limitsVolet(collect());
  document.getElementById("minH").textContent = lim.hmin;
  document.getElementById("maxH").textContent = lim.hmax;
  document.getElementById("minL").textContent = lim.lmin;
  document.getElementById("maxL").textContent = lim.lmax;

  const live = collect();
  const pvcTooBig = live.Htab > 2250 || live.Ltab > 2100;
  disableById("lame-pvc", pvcTooBig || live.couleurLame !== "9016");
  document.querySelectorAll(".lame-color-extra").forEach((el) => {
    el.disabled = live.lame === "pvc39";
    el.closest(".swatch")?.classList.toggle("disabled", live.lame === "pvc39");
    if (live.lame === "pvc39" && el.checked) {
      document.querySelector('[name="couleur-lame"][value="9016"]').checked = true;
    }
  });

  const sangleTooTall = live.Htab > 2200;
  disableById("man-sangle", sangleTooTall || live.attache === "rigide");
  disableById("attache-rigide", live.manoeuvre === "sangle" || live.manoeuvre === "solaire-gm");

  const coulisseL =
    live.type === "reno" &&
    live.pose === "renoB" &&
    live.couleurOssature !== "9005" &&
    live.couleurOssature !== "7039";
  disableById("coulisse-l", !coulisseL);

  show("#acc-filaire", live.manoeuvre.startsWith("filaire"));
  show("#acc-radio", live.manoeuvre === "radio-gm" || live.manoeuvre === "solaire-gm");
  show("#acc-delta", live.manoeuvre === "deltadore");
  show("#acc-solaire", live.manoeuvre === "solaire-gm");

  if (live.manoeuvre === "solaire-gm" || live.manoeuvre === "manivelle") {
    show(".sortie-bas", false);
    show(".sortie-haut", true);
  } else if (live.pose === "renoC" || live.type === "mono") {
    show(".sortie-haut", false);
    show(".sortie-bas", true);
  } else {
    show(".sortie-haut, .sortie-bas", true);
  }

  const dim = PricingEngine.dimFinalVolet(live);
  document.getElementById("HautFinal").textContent = dim.haut || "—";
  document.getElementById("LargFinal").textContent = dim.larg || "—";
  document.getElementById("Tcoffre").textContent = dim.coffre;
  document.getElementById("surface").textContent = dim.surface.toFixed(2);

  const errors = [];
  if (live.Htab < lim.hmin || live.Htab > lim.hmax) {
    errors.push(`Hauteur hors limites (${lim.hmin}–${lim.hmax} mm)`);
  }
  if (live.Ltab < lim.lmin || live.Ltab > lim.lmax) {
    errors.push(`Largeur hors limites (${lim.lmin}–${lim.lmax} mm)`);
  }
  document.getElementById("global-error").textContent = errors.join(" · ");

  const result = PricingEngine.priceVolet(live);
  const ok = errors.length === 0 && dim.surface > 0;
  document.getElementById("prixttc").textContent = ok ? PricingEngine.euro(result.total) : "—";
  document.getElementById("old-price").textContent = ok
    ? PricingEngine.euro(result.produit.ht + result.accessoires.ht)
    : "";
  document.getElementById("prix-4x").textContent = ok ? PricingEngine.euro(result.total / 4) : "—";
  document.getElementById("add-cart").classList.toggle("disabled", !ok);

  const L = labels();
  document.getElementById("recap").innerHTML = ok
    ? `<b>${L.types[live.type]}</b> · ${live.type === "reno" ? L.poses[live.pose] + " · " : ""}${live.Htab} × ${live.Ltab} mm · ${live.lame === "alu39" ? "ALU" : "PVC"} · ${L.mans[live.manoeuvre]}`
    : "Corrigez les dimensions pour obtenir un prix.";

  const slats = document.getElementById("preview-slats");
  const coffre = document.getElementById("preview-coffre");
  const map = {
    "9016": "#f3f3ef",
    "7016": "#3a4044",
    "8019": "#4a3728",
    "7039": "#6b6e70",
    "9005": "#111",
    chenedore: "#b07a45",
  };
  slats.style.background = `repeating-linear-gradient(${map[live.couleurLame]} 0 8px, rgba(0,0,0,.12) 8px 9px)`;
  coffre.style.background = map[live.couleurOssature];
  coffre.style.display = live.type === "tradi" ? "none" : "block";

  window.__voletCfg = { cfg: live, result, ok };
}

function addToCart() {
  const state = window.__voletCfg;
  if (!state?.ok) return;
  Cart.add({
    type: "volet",
    title: "Volet roulant sur mesure",
    detail: document.getElementById("recap").innerText,
    qty: state.cfg.qty,
    price: state.result.total,
  });
  location.href = "panier.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("configVr");
  form.addEventListener("change", updateUI);
  form.addEventListener("input", updateUI);
  document.getElementById("quantite").addEventListener("change", updateUI);
  document.getElementById("add-cart").addEventListener("click", addToCart);
  updateUI();
});

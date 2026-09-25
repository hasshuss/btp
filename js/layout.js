const SITE = {
  name: "Direct Usine",
  tagline: "Fabricant sur mesure",
  phone: "03 00 00 00 00",
  email: "contact@direct-usine.fr",
  address: "Adresse à renseigner",
  hours: "Lun–Ven 9h–17h30 · Sam 9h–12h",
};

function tile(href, img, label, promo) {
  return `<a href="${href}">
    <img src="${img}" alt="">
    <span>${label}${promo ? ' <em class="superRemise">-15%</em>' : ""}</span>
  </a>`;
}

function headerHTML() {
  return `
<header class="site-header">
  <div class="header-bar">
    <button class="menu-btn" type="button" aria-label="Ouvrir le menu" data-open-menu>
      <i class="burger"><span></span><span></span><span></span></i>
      <em>Menu</em>
    </button>
    <a class="logo" href="index.html">
      <strong>${SITE.name}</strong>
      <small>${SITE.tagline}</small>
    </a>
    <nav class="header-actions">
      <a href="contact.html" title="Contact">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>
        <span>Contact</span>
      </a>
      <a href="contact.html" title="Mon compte">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
        <span>Mon compte</span>
      </a>
      <a href="panier.html" title="Panier">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.5c.8 0 1.5-.4 1.8-1.1L21 6H6.2L5.3 3H2v2h2l3.6 7.6L6.2 15c-.1.3-.2.6-.2 1 0 1.1.9 2 2 2h12v-2H8.4l.8-1.5z"/></svg>
        <span>Panier</span>
        <b data-cart-count hidden>0</b>
      </a>
    </nav>
  </div>

  <nav class="nav-main">
    <div class="block-center">
      <ul>
        <li class="dropdown icon-volet">
          <a class="dropbtn" href="volet-roulant.html">Volet roulant</a>
          <div class="dropdown-content">
            <div class="block-center">
              ${tile("configurateur-volet.html", "img/cat-volet.png", "Volet roulant sur mesure", true)}
              ${tile("configurateur-volet.html", "img/pose-tradi.svg", "Volet à tirage direct", false)}
              ${tile("configurateur-volet.html", "img/config-volet.png", "Tablier volet roulant", true)}
              ${tile("configurateur-volet.html", "img/pose-a.svg", "Pièces détachées", true)}
              ${tile("configurateur-volet.html", "img/ico-moteur.svg", "Kit motorisation par 3", false)}
              ${tile("configurateur-volet.html", "img/ico-moteur.svg", "Moteur et axe motorisé", true)}
              ${tile("configurateur-volet.html", "img/ico-sangle.svg", "Télécommande, récepteur et interrupteur", true)}
              ${tile("contact.html", "img/aide.png", "Box connectée", true)}
              ${tile("contact.html", "img/usine.png", "Domotique", false)}
            </div>
          </div>
        </li>
        <li class="dropdown icon-fenetre">
          <a class="dropbtn" href="fenetre.html">Fenêtre PVC</a>
          <div class="dropdown-content">
            <div class="block-center">
              ${tile("configurateur-fenetre.html", "img/cat-fenetre.png", "Fenêtre PVC sur mesure", true)}
              ${tile("configurateur-fenetre.html", "img/config-fenetre.png", "Porte-fenêtre PVC sur mesure", true)}
              ${tile("configurateur-fenetre.html", "img/config-fenetre.png", "Baie vitrée PVC sur mesure", true)}
              ${tile("contact.html", "img/usine.png", "Profils de finition", true)}
              ${tile("contact.html", "img/aide.png", "Accessoires de pose et d'entretien", true)}
              ${tile("contact.html", "img/cat-fenetre.png", "Accessoires pour fenêtre", true)}
            </div>
          </div>
        </li>
        <li class="dropdown icon-porte">
          <a class="dropbtn" href="porte-entree.html">Porte d'entrée</a>
          <div class="dropdown-content">
            <div class="block-center">
              ${tile("porte-entree.html", "img/cat-porte.png", "Porte d'entrée moderne sur mesure", true)}
              ${tile("porte-entree.html", "img/cat-porte.png", "Porte d'entrée classique sur mesure", true)}
              ${tile("contact.html", "img/aide.png", "Accessoires pour porte d'entrée", true)}
              ${tile("contact.html", "img/usine.png", "Profils de finition", true)}
              ${tile("contact.html", "img/aide.png", "Accessoires de pose et d'entretien", true)}
            </div>
          </div>
        </li>
        <li class="dropdown icon-garage">
          <a class="dropbtn" href="porte-garage.html">Porte de garage</a>
          <div class="dropdown-content">
            <div class="block-center">
              ${tile("configurateur-garage.html", "img/cat-garage.png", "Porte de garage sectionnelle sur mesure", true)}
              ${tile("configurateur-garage.html", "img/config-garage.png", "Porte de garage sectionnelle standard", false)}
              ${tile("contact.html", "img/ico-moteur.svg", "Accessoires et moteur pour sectionnelle", true)}
              ${tile("porte-garage.html", "img/cat-volet.png", "Porte de garage enroulable sur mesure", true)}
              ${tile("contact.html", "img/ico-moteur.svg", "Accessoires et moteur pour enroulable", true)}
            </div>
          </div>
        </li>
        <li class="dropdown icon-promo">
          <a class="dropbtn promo-spec" href="configurateur-volet.html">Promotion</a>
          <div class="dropdown-content">
            <div class="block-center">
              ${tile("configurateur-volet.html", "img/cat-volet.png", "Volets -15%", true)}
              ${tile("configurateur-fenetre.html", "img/cat-fenetre.png", "Fenêtres -15%", true)}
              ${tile("configurateur-garage.html", "img/cat-garage.png", "Portes de garage -15%", true)}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</header>
<div class="menu-overlay" data-close-menu></div>
<aside class="side-menu" id="side-menu">
  <div class="side-menu-head">
    <strong>Menu</strong>
    <button type="button" data-close-menu aria-label="Fermer">×</button>
  </div>
  <a href="index.html">Accueil</a>
  <a href="volet-roulant.html">Volet roulant</a>
  <a href="configurateur-volet.html">→ Configurateur volet</a>
  <a href="fenetre.html">Fenêtre PVC</a>
  <a href="configurateur-fenetre.html">→ Configurateur fenêtre</a>
  <a href="porte-entree.html">Porte d'entrée</a>
  <a href="porte-garage.html">Porte de garage</a>
  <a href="configurateur-garage.html">→ Configurateur garage</a>
  <a href="contact.html">Contact / Mon compte</a>
  <a href="panier.html">Panier</a>
</aside>`;
}

function footerHTML() {
  return `
<section class="trust-bar">
  <div>Meilleurs prix</div>
  <div>Devis en ligne</div>
  <div>Sur mesure</div>
  <div>Fabriqué en France</div>
  <div>Livraison France</div>
  <div>Paiement 4×</div>
</section>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <h3>Venez nous rencontrer</h3>
      <p>${SITE.address}</p>
      <p>${SITE.hours}</p>
    </div>
    <div>
      <h3>Service client</h3>
      <p><a href="tel:${SITE.phone.replace(/\s/g, "")}">${SITE.phone}</a></p>
      <p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </div>
    <div>
      <h3>Nos produits</h3>
      <a href="volet-roulant.html">Volet roulant</a>
      <a href="fenetre.html">Fenêtre PVC</a>
      <a href="porte-entree.html">Porte d'entrée</a>
      <a href="porte-garage.html">Porte de garage</a>
    </div>
    <div>
      <h3>Aide</h3>
      <a href="contact.html">Contactez-nous</a>
      <a href="configurateur-volet.html">Chiffrage volet</a>
      <a href="configurateur-fenetre.html">Chiffrage fenêtre</a>
      <a href="panier.html">Votre devis</a>
    </div>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ${SITE.name} — site modèle, éléments à personnaliser.</p>
</footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("afterbegin", headerHTML());
  document.body.insertAdjacentHTML("beforeend", footerHTML());

  const menu = document.getElementById("side-menu");
  const overlay = document.querySelector(".menu-overlay");
  const burger = document.querySelector(".menu-btn");
  const open = () => {
    menu.classList.add("open");
    overlay.classList.add("open");
    burger?.classList.add("open");
  };
  const close = () => {
    menu.classList.remove("open");
    overlay.classList.remove("open");
    burger?.classList.remove("open");
  };
  burger?.addEventListener("click", () => (menu.classList.contains("open") ? close() : open()));
  document.querySelectorAll("[data-close-menu]").forEach((el) => el.addEventListener("click", close));

  document.querySelectorAll(".nav-main .dropdown").forEach((li) => {
    const btn = li.querySelector(".dropbtn");
    btn?.addEventListener("click", (e) => {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        document.querySelectorAll(".nav-main .dropdown.open").forEach((other) => {
          if (other !== li) other.classList.remove("open");
        });
        li.classList.toggle("open");
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-main")) {
      document.querySelectorAll(".nav-main .dropdown.open").forEach((li) => li.classList.remove("open"));
    }
  });

  if (window.Cart) Cart.renderBadge();
});

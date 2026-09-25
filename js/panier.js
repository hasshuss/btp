document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("cart-body");
  const empty = document.getElementById("cart-empty");
  const table = document.getElementById("cart-table");
  const totalEl = document.getElementById("cart-total");
  const items = Cart.read();

  if (!items.length) {
    empty.hidden = false;
    table.hidden = true;
    return;
  }
  empty.hidden = true;
  table.hidden = false;
  body.innerHTML = items
    .map(
      (i) => `<tr>
        <td><b>${i.title}</b><div class="hint">${i.detail || ""}</div></td>
        <td>${i.qty}</td>
        <td>${PricingEngine.euro(i.price)}</td>
        <td><button class="btn-ghost" data-del="${i.id}">Retirer</button></td>
      </tr>`
    )
    .join("");
  totalEl.textContent = PricingEngine.euro(Cart.total());
  body.addEventListener("click", (e) => {
    const id = e.target.dataset.del;
    if (!id) return;
    Cart.remove(id);
    location.reload();
  });
});

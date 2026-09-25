window.Cart = {
  key: "direct-usine-cart",

  read() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || "[]");
    } catch {
      return [];
    }
  },

  write(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.renderBadge();
  },

  add(item) {
    const items = this.read();
    items.push({
      id: Date.now() + "-" + Math.random().toString(16).slice(2),
      ...item,
    });
    this.write(items);
    return items;
  },

  remove(id) {
    this.write(this.read().filter((i) => i.id !== id));
  },

  clear() {
    this.write([]);
  },

  count() {
    return this.read().reduce((s, i) => s + (i.qty || 1), 0);
  },

  total() {
    return this.read().reduce((s, i) => s + (i.price || 0), 0);
  },

  renderBadge() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = this.count();
      el.hidden = this.count() === 0;
    });
  },
};

document.addEventListener("DOMContentLoaded", () => Cart.renderBadge());

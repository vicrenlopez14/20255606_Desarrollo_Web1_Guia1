/**
 * cart.js — Carrito de compras persistido en localStorage.
 *
 * El catálogo original no expone precios en esta vista (solo Desc/PID/SG/Cod),
 * así que este carrito tampoco inventa precios ni totales monetarios: eso
 * sería un dato comercial fabricado. Muestra cantidades por producto,
 * igual que el "Agregar al Carrito" original.
 */
const CART_STORAGE_KEY = 'casarivas_demo_cart_v1';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn('No se pudo leer el carrito de localStorage:', err);
    return {};
  }
}

function writeCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn('No se pudo guardar el carrito en localStorage:', err);
  }
}

const Cart = {
  /** @returns {{[pid: string]: number}} mapa PID -> cantidad */
  getAll() {
    return readCart();
  },

  getCount() {
    const cart = readCart();
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  },

  add(pid, qty = 1) {
    const cart = readCart();
    const key = String(pid);
    cart[key] = (cart[key] || 0) + Math.max(1, qty);
    writeCart(cart);
    document.dispatchEvent(new CustomEvent('cart:changed'));
  },

  setQty(pid, qty) {
    const cart = readCart();
    const key = String(pid);
    if (qty <= 0) {
      delete cart[key];
    } else {
      cart[key] = qty;
    }
    writeCart(cart);
    document.dispatchEvent(new CustomEvent('cart:changed'));
  },

  remove(pid) {
    this.setQty(pid, 0);
  },

  clear() {
    writeCart({});
    document.dispatchEvent(new CustomEvent('cart:changed'));
  },
};

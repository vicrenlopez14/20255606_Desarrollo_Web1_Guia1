/**
 * Casa Rivas — Catálogo (rediseño)
 * Vanilla JS: filtrado, orden, paginación, carrito con persistencia local.
 * Sin frameworks ni dependencias externas.
 */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  // Paleta de colores por subgrupo, para las miniaturas (no hay imágenes reales en esta demo).
  const SG_COLORS = {
    REL: '#00509e', MOT: '#e65100', AMP: '#6a1b9a', ANT: '#00838f', ARD: '#2e7d32',
    AT: '#5d4037', AUD: '#ad1457', BAT: '#f9a825', CAB: '#455a64', CAP: '#0277bd',
    CON: '#4527a0', FLY: '#c62828', FOC: '#f57f17', FUS: '#bf360c', GRA: '#37474f',
    HER: '#3949ab', IC: '#00695c', INS: '#616161', JK: '#8d6e63', MIC: '#7b1fa2',
    MIS: '#546e7a', NTE: '#d84315', PLA: '#00acc1', POL: '#5e35b1', POT: '#1565c0',
    REG: '#2e7d32', SEM: '#6d4c41', SEP: '#78909c', SOL: '#757575', SPK: '#8e24aa',
    SW: '#00838f', TER: '#4e342e', TES: '#283593', TF: '#00796b', TR: '#c2185b',
    TUB: '#558b2f'
  };
  function colorFor(sg) { return SG_COLORS[sg] || '#607d8b'; }

  // Deriva de forma determinística (a partir del PID) si el producto
  // "tiene imagen" y si está disponible "solo web", para poder demostrar esos filtros.
  function hasImage(p) { return p.pid % 5 !== 0; }
  function isWeb(p) { return p.pid % 2 === 0; }

  /* ---------- Estado ---------- */
  const state = {
    query: '',
    plu: '',
    subgrupo: '',
    codigo: '',
    conImagen: false,
    productos: 'todos', // todos | web
    orden: 'plu',
    page: 1,
    perPage: 20,
  };

  const CART_KEY = 'cr_cart_v1';
  const THEME_KEY = 'cr_theme';
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  /* ---------- Referencias DOM ---------- */
  const els = {
    searchInput: $('#searchInput'),
    plu: $('#plu'),
    subgrupo: $('#subgrupo'),
    codigo: $('#codigo'),
    conImagen: $('#conImagen'),
    orden: $('#orden'),
    perPage: $('#perPage'),
    clearFilters: $('#clearFilters'),
    emptyClear: $('#emptyClear'),
    resultsCount: $('#resultsCount'),
    productGrid: $('#productGrid'),
    emptyState: $('#emptyState'),
    paginationTop: $('#paginationTop'),
    paginationBottom: $('#paginationBottom'),
    filtersPanel: $('#filtersPanel'),
    filtersOpen: $('#filtersOpen'),
    filtersClose: $('#filtersClose'),
    overlay: $('#overlay'),
    navToggle: $('#navToggle'),
    primaryNav: $('#primaryNav'),
    themeToggle: $('#themeToggle'),
    cartDrawer: $('#cartDrawer'),
    openCartNav: $('#openCartNav'),
    fabCart: $('#fabCart'),
    closeCart: $('#closeCart'),
    cartBody: $('#cartBody'),
    cartList: $('#cartList'),
    cartEmptyMsg: $('#cartEmptyMsg'),
    cartFooter: $('#cartFooter'),
    cartTotalQty: $('#cartTotalQty'),
    clearCart: $('#clearCart'),
    navCartBadge: $('#navCartBadge'),
    fabCartBadge: $('#fabCartBadge'),
    toast: $('#toast'),
  };

  /* ---------- Inicialización de filtros dinámicos ---------- */
  function initSubgrupoOptions() {
    const grupos = Array.from(new Set(PRODUCTS.map(p => p.sg))).sort();
    grupos.forEach(sg => {
      const opt = document.createElement('option');
      opt.value = sg;
      opt.textContent = sg;
      els.subgrupo.appendChild(opt);
    });
  }

  /* ---------- Filtrado / orden / paginación ---------- */
  function getFiltered() {
    const q = state.query.trim().toUpperCase();
    const plu = state.plu.trim();
    const cod = state.codigo.trim().toUpperCase();

    let list = PRODUCTS.filter(p => {
      if (q && !(p.desc.includes(q) || String(p.pid).includes(q) || p.cod.toUpperCase().includes(q))) return false;
      if (plu && !String(p.pid).includes(plu)) return false;
      if (state.subgrupo && p.sg !== state.subgrupo) return false;
      if (cod && !p.cod.toUpperCase().includes(cod)) return false;
      if (state.conImagen && !hasImage(p)) return false;
      if (state.productos === 'web' && !isWeb(p)) return false;
      return true;
    });

    list.sort((a, b) => {
      if (state.orden === 'sg') return a.sg.localeCompare(b.sg) || a.pid - b.pid;
      if (state.orden === 'codigo') return a.cod.localeCompare(b.cod);
      return a.pid - b.pid;
    });

    return list;
  }

  function getPageSlice(list) {
    const totalPages = Math.max(1, Math.ceil(list.length / state.perPage));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.perPage;
    return { slice: list.slice(start, start + state.perPage), totalPages };
  }

  /* ---------- Render: productos ---------- */
  function productCardHTML(p) {
    const c = colorFor(p.sg);
    const qty = cart[p.pid] ? cart[p.pid].qty : 1;
    return `
      <li class="product-card" data-pid="${p.pid}">
        <div class="product-card__media" style="background-color:${c}">
          <span class="product-card__sg-watermark" aria-hidden="true">${p.sg}</span>
          ${isWeb(p) ? '<span class="product-card__web-badge">Web</span>' : ''}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__desc" title="${p.desc}">${p.desc}</h3>
          <div class="product-card__meta">
            <span><b>PID:</b> ${p.pid}</span>
            <span><b>SG:</b> ${p.sg}</span>
            <span class="product-card__cod"><b>Cod:</b> ${p.cod}</span>
          </div>
          <div class="product-card__footer">
            <div class="qty-stepper">
              <button type="button" class="qty-dec" aria-label="Disminuir cantidad">−</button>
              <input type="number" min="1" value="${qty}" class="qty-input" aria-label="Cantidad">
              <button type="button" class="qty-inc" aria-label="Aumentar cantidad">+</button>
            </div>
            <button type="button" class="btn btn--primary add-to-cart">Agregar al Carrito</button>
          </div>
        </div>
      </li>`;
  }

  function renderGrid() {
    const filtered = getFiltered();
    const { slice, totalPages } = getPageSlice(filtered);

    els.resultsCount.innerHTML = filtered.length
      ? `<strong>${filtered.length}</strong> producto${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`
      : 'Sin resultados';

    if (!slice.length) {
      els.productGrid.innerHTML = '';
      els.emptyState.hidden = false;
    } else {
      els.emptyState.hidden = true;
      els.productGrid.innerHTML = slice.map(productCardHTML).join('');
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const html = paginationHTML(state.page, totalPages);
    els.paginationTop.innerHTML = html;
    els.paginationBottom.innerHTML = html;
  }

  function paginationHTML(page, totalPages) {
    if (totalPages <= 1) return '';
    const pages = pageList(page, totalPages);
    let html = `<button data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Página anterior">&laquo;</button>`;
    pages.forEach(p => {
      if (p === '…') {
        html += `<span class="ellipsis">…</span>`;
      } else {
        html += `<button data-page="${p}" class="${p === page ? 'is-active' : ''}" aria-current="${p === page ? 'page' : 'false'}">${p}</button>`;
      }
    });
    html += `<button data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''} aria-label="Página siguiente">&raquo;</button>`;
    return html;
  }

  function pageList(current, total) {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    range.forEach(i => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l > 2) rangeWithDots.push('…');
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  }

  function goToPage(p) {
    state.page = p;
    renderGrid();
    $('.results')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ---------- Render: carrito ---------- */
  function cartEntries() {
    return Object.values(cart).filter(e => e.qty > 0);
  }
  function cartTotalQty() {
    return cartEntries().reduce((sum, e) => sum + e.qty, 0);
  }

  function renderCart() {
    const entries = cartEntries();
    const total = cartTotalQty();

    els.navCartBadge.hidden = total === 0;
    els.navCartBadge.textContent = total;
    els.fabCartBadge.hidden = total === 0;
    els.fabCartBadge.textContent = total;

    if (!entries.length) {
      els.cartEmptyMsg.hidden = false;
      els.cartList.hidden = true;
      els.cartFooter.hidden = true;
      els.cartList.innerHTML = '';
      return;
    }

    els.cartEmptyMsg.hidden = true;
    els.cartList.hidden = false;
    els.cartFooter.hidden = false;
    els.cartTotalQty.textContent = total;

    els.cartList.innerHTML = entries.map(e => {
      const p = e.product;
      const c = colorFor(p.sg);
      return `
        <li class="cart-item" data-pid="${p.pid}">
          <div class="cart-item__media" style="background:${c}">${p.sg}</div>
          <div class="cart-item__info">
            <p class="cart-item__desc" title="${p.desc}">${p.desc}</p>
            <p class="cart-item__meta">PID: ${p.pid} · Cod: ${p.cod}</p>
            <div class="cart-item__row">
              <div class="qty-stepper">
                <button type="button" class="qty-dec" aria-label="Disminuir cantidad">−</button>
                <input type="number" min="1" value="${e.qty}" class="qty-input" aria-label="Cantidad">
                <button type="button" class="qty-inc" aria-label="Aumentar cantidad">+</button>
              </div>
              <button type="button" class="cart-item__remove">Quitar</button>
            </div>
          </div>
        </li>`;
    }).join('');
  }

  function addToCart(pid, qty) {
    const product = PRODUCTS.find(p => p.pid === pid);
    if (!product) return;
    if (!cart[pid]) cart[pid] = { qty: 0, product };
    cart[pid].qty += qty;
    saveCart();
    renderCart();
    showToast(`"${product.desc.slice(0, 40)}${product.desc.length > 40 ? '…' : ''}" agregado al carrito`);
  }

  function setCartQty(pid, qty) {
    if (!cart[pid]) return;
    cart[pid].qty = Math.max(1, qty);
    saveCart();
    renderCart();
  }

  function removeFromCart(pid) {
    delete cart[pid];
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = {};
    saveCart();
    renderCart();
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2200);
  }

  /* ---------- Drawer / paneles móviles ---------- */
  function openCart() {
    els.cartDrawer.classList.add('is-open');
    els.cartDrawer.setAttribute('aria-hidden', 'false');
    els.overlay.hidden = false;
  }
  function closeCart() {
    els.cartDrawer.classList.remove('is-open');
    els.cartDrawer.setAttribute('aria-hidden', 'true');
    if (!els.filtersPanel.classList.contains('is-open')) els.overlay.hidden = true;
  }
  function openFilters() {
    els.filtersPanel.classList.add('is-open');
    els.overlay.hidden = false;
  }
  function closeFilters() {
    els.filtersPanel.classList.remove('is-open');
    if (!els.cartDrawer.classList.contains('is-open')) els.overlay.hidden = true;
  }

  /* ---------- Tema ---------- */
  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    els.themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* ---------- Eventos ---------- */
  function bindEvents() {
    els.searchInput.addEventListener('input', debounce(e => {
      state.query = e.target.value; state.page = 1; renderGrid();
    }, 200));

    els.plu.addEventListener('input', debounce(e => {
      state.plu = e.target.value; state.page = 1; renderGrid();
    }, 200));

    els.subgrupo.addEventListener('change', e => {
      state.subgrupo = e.target.value; state.page = 1; renderGrid();
    });

    els.codigo.addEventListener('input', debounce(e => {
      state.codigo = e.target.value; state.page = 1; renderGrid();
    }, 200));

    els.conImagen.addEventListener('change', e => {
      state.conImagen = e.target.checked; state.page = 1; renderGrid();
    });

    $$('input[name="productos"]').forEach(r => {
      r.addEventListener('change', e => {
        state.productos = e.target.value; state.page = 1; renderGrid();
      });
    });

    els.orden.addEventListener('change', e => {
      state.orden = e.target.value; renderGrid();
    });

    els.perPage.addEventListener('change', e => {
      state.perPage = parseInt(e.target.value, 10); state.page = 1; renderGrid();
    });

    els.clearFilters.addEventListener('click', resetFilters);
    els.emptyClear.addEventListener('click', resetFilters);

    function resetFilters() {
      state.query = ''; state.plu = ''; state.subgrupo = ''; state.codigo = '';
      state.conImagen = false; state.productos = 'todos'; state.orden = 'plu'; state.page = 1;
      els.searchInput.value = ''; els.plu.value = ''; els.subgrupo.value = '';
      els.codigo.value = ''; els.conImagen.checked = false; els.orden.value = 'plu';
      $$('input[name="productos"]').forEach(r => r.checked = r.value === 'todos');
      renderGrid();
    }

    // Delegación de eventos en la cuadrícula de productos.
    els.productGrid.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const pid = parseInt(card.dataset.pid, 10);
      const input = card.querySelector('.qty-input');

      if (e.target.closest('.qty-inc')) {
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + 1);
      } else if (e.target.closest('.qty-dec')) {
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
      } else if (e.target.closest('.add-to-cart')) {
        addToCart(pid, Math.max(1, parseInt(input.value, 10) || 1));
      }
    });

    [els.paginationTop, els.paginationBottom].forEach(nav => {
      nav.addEventListener('click', e => {
        const btn = e.target.closest('button[data-page]');
        if (!btn || btn.disabled) return;
        goToPage(parseInt(btn.dataset.page, 10));
      });
    });

    // Carrito
    els.openCartNav.addEventListener('click', openCart);
    els.fabCart.addEventListener('click', openCart);
    els.closeCart.addEventListener('click', closeCart);
    els.clearCart.addEventListener('click', clearCart);
    els.overlay.addEventListener('click', () => { closeCart(); closeFilters(); });

    els.cartList.addEventListener('click', e => {
      const item = e.target.closest('.cart-item');
      if (!item) return;
      const pid = parseInt(item.dataset.pid, 10);
      const input = item.querySelector('.qty-input');

      if (e.target.closest('.qty-inc')) {
        setCartQty(pid, (parseInt(input.value, 10) || 1) + 1);
      } else if (e.target.closest('.qty-dec')) {
        setCartQty(pid, (parseInt(input.value, 10) || 1) - 1);
      } else if (e.target.closest('.cart-item__remove')) {
        removeFromCart(pid);
      }
    });
    els.cartList.addEventListener('change', e => {
      if (!e.target.classList.contains('qty-input')) return;
      const item = e.target.closest('.cart-item');
      const pid = parseInt(item.dataset.pid, 10);
      setCartQty(pid, parseInt(e.target.value, 10) || 1);
    });

    // Filtros móviles
    els.filtersOpen.addEventListener('click', openFilters);
    els.filtersClose.addEventListener('click', closeFilters);

    // Navegación móvil
    els.navToggle.addEventListener('click', () => {
      const open = els.primaryNav.classList.toggle('is-open');
      els.navToggle.setAttribute('aria-expanded', String(open));
    });

    els.themeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeCart(); closeFilters(); }
    });
  }

  /* ---------- Arranque ---------- */
  function init() {
    initSubgrupoOptions();

    const savedTheme = localStorage.getItem(THEME_KEY);
    applyTheme(savedTheme);

    bindEvents();
    renderGrid();
    renderCart();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

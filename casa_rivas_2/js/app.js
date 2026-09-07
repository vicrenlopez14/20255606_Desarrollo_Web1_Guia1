/**
 * app.js — UI: render de productos, filtros, paginación y carrito.
 * No conoce la forma de los datos más allá de lo que expone data.js
 * (getProducts / SUBGROUPS / iconFor). Cambiar data.js por una API real
 * no debería requerir tocar este archivo.
 */
(function () {
  'use strict';

  const state = {
    q: '',
    plu: '',
    sg: '',
    cod: '',
    conImagen: false,
    soloWeb: false,
    orden: 'plu',
    page: 1,
    perPage: 10,
  };

  const el = {
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    filterSg: document.getElementById('filter-sg'),
    filterPlu: document.getElementById('filter-plu'),
    filterCod: document.getElementById('filter-cod'),
    filterOrden: document.getElementById('filter-orden'),
    filterImagen: document.getElementById('filter-imagen'),
    filterWebRadios: document.querySelectorAll('input[name="filter-web"]'),
    filterClear: document.getElementById('filter-clear'),
    resultsStatus: document.getElementById('results-status'),
    grid: document.getElementById('product-grid'),
    emptyState: document.getElementById('empty-state'),
    emptyStateClear: document.getElementById('empty-state-clear'),
    perPageSelect: document.getElementById('per-page-select'),
    pageControls: document.getElementById('page-controls'),
    cartToggle: document.getElementById('cart-toggle'),
    cartClose: document.getElementById('cart-close'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartBackdrop: document.getElementById('cart-backdrop'),
    cartBody: document.getElementById('cart-drawer-body'),
    cartCount: document.getElementById('cart-count'),
    toast: document.getElementById('toast'),
    mobileNavToggle: document.getElementById('mobile-nav-toggle'),
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---------- Filtros: poblar categorías ----------
  function populateSubgroups() {
    for (const s of SUBGROUPS) {
      const opt = document.createElement('option');
      opt.value = s.code;
      opt.textContent = `${s.code} — ${s.name}`;
      el.filterSg.appendChild(opt);
    }
  }

  // ---------- Render de productos ----------
  function productCardHtml(p) {
    return `
      <article class="product-card" data-pid="${p.pid}">
        <div class="product-media" aria-hidden="true">
          <svg viewBox="0 0 24 24">${iconFor(p.sg)}</svg>
        </div>
        <div class="product-body">
          <div class="product-badge-row">
            <span class="product-badge">${escapeHtml(p.sg)} · ${escapeHtml(getSubgroupName(p.sg))}</span>
            ${p.web ? '<span class="product-badge product-badge-web">Disponible en Web</span>' : ''}
          </div>
          <p class="product-desc">${escapeHtml(p.desc)}</p>
          <div class="product-meta">
            <span>PID: <strong>${p.pid}</strong></span>
            <span>Cod: <strong>${escapeHtml(p.cod)}</strong></span>
          </div>
          <div class="product-actions">
            <label class="sr-only" for="qty-${p.pid}">Cantidad para ${escapeHtml(p.desc)}</label>
            <input class="qty-input" id="qty-${p.pid}" type="number" min="1" value="1" inputmode="numeric">
            <button type="button" class="btn-primary" data-add-to-cart="${p.pid}">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function readFiltersFromForm() {
    state.q = el.searchInput.value;
    state.plu = el.filterPlu.value;
    state.sg = el.filterSg.value;
    state.cod = el.filterCod.value;
    state.conImagen = el.filterImagen.checked;
    state.soloWeb = document.querySelector('input[name="filter-web"]:checked').value === 'web';
    state.orden = el.filterOrden.value;
    state.perPage = Number(el.perPageSelect.value);
  }

  function render() {
    const result = getProducts(state, state.page, state.perPage);
    state.page = result.page;

    if (result.items.length === 0) {
      el.grid.hidden = true;
      el.emptyState.hidden = false;
      el.grid.innerHTML = '';
    } else {
      el.grid.hidden = false;
      el.emptyState.hidden = true;
      el.grid.innerHTML = result.items.map(productCardHtml).join('');
    }

    const from = result.total === 0 ? 0 : (result.page - 1) * state.perPage + 1;
    const to = Math.min(result.total, result.page * state.perPage);
    el.resultsStatus.textContent = result.total === 0
      ? 'No se encontraron productos con los filtros actuales.'
      : `Mostrando ${from}–${to} de ${result.total} producto${result.total === 1 ? '' : 's'}.`;

    renderPagination(result.totalPages, result.page);
  }

  function renderPagination(totalPages, current) {
    el.pageControls.innerHTML = '';

    const addBtn = (label, page, opts = {}) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn';
      btn.textContent = label;
      if (opts.current) btn.setAttribute('aria-current', 'page');
      if (opts.disabled) btn.disabled = true;
      if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
      btn.addEventListener('click', () => {
        state.page = page;
        render();
        el.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      el.pageControls.appendChild(btn);
    };

    const addEllipsis = () => {
      const span = document.createElement('span');
      span.className = 'page-ellipsis';
      span.textContent = '…';
      span.setAttribute('aria-hidden', 'true');
      el.pageControls.appendChild(span);
    };

    addBtn('«', Math.max(1, current - 1), { disabled: current === 1, ariaLabel: 'Página anterior' });

    const pagesToShow = new Set([1, totalPages, current, current - 1, current + 1]);
    let prevPage = 0;
    for (let p = 1; p <= totalPages; p++) {
      if (!pagesToShow.has(p)) continue;
      if (p - prevPage > 1) addEllipsis();
      addBtn(String(p), p, { current: p === current });
      prevPage = p;
    }

    addBtn('»', Math.min(totalPages, current + 1), { disabled: current === totalPages, ariaLabel: 'Página siguiente' });
  }

  // ---------- Carrito ----------
  function cartLineHtml(pid, qty, product) {
    if (!product) return '';
    return `
      <div class="cart-line" data-pid="${pid}">
        <div class="cart-line-icon"><svg viewBox="0 0 24 24">${iconFor(product.sg)}</svg></div>
        <div class="cart-line-body">
          <p class="cart-line-desc">${escapeHtml(product.desc)}</p>
          <p class="cart-line-meta">PID: ${product.pid} · Cod: ${escapeHtml(product.cod)}</p>
          <div class="cart-line-controls">
            <div class="qty-stepper">
              <button type="button" data-cart-dec="${pid}" aria-label="Reducir cantidad">−</button>
              <span>${qty}</span>
              <button type="button" data-cart-inc="${pid}" aria-label="Aumentar cantidad">+</button>
            </div>
            <button type="button" class="cart-line-remove" data-cart-remove="${pid}">Quitar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCart() {
    const cart = Cart.getAll();
    const entries = Object.entries(cart);
    el.cartCount.textContent = String(Cart.getCount());

    if (entries.length === 0) {
      el.cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío. Busca un repuesto y agrégalo desde el catálogo.</p>';
      return;
    }

    // Buscamos el producto por PID entre el catálogo completo (sin filtros/paginación).
    const all = getProducts({}, 1, Number.MAX_SAFE_INTEGER).items;
    const byPid = new Map(all.map((p) => [String(p.pid), p]));

    el.cartBody.innerHTML = entries
      .map(([pid, qty]) => cartLineHtml(pid, qty, byPid.get(pid)))
      .join('');
  }

  function openCart() {
    el.cartDrawer.classList.add('is-open');
    el.cartDrawer.setAttribute('aria-hidden', 'false');
    el.cartBackdrop.hidden = false;
    el.cartToggle.setAttribute('aria-expanded', 'true');
  }

  function closeCart() {
    el.cartDrawer.classList.remove('is-open');
    el.cartDrawer.setAttribute('aria-hidden', 'true');
    el.cartBackdrop.hidden = true;
    el.cartToggle.setAttribute('aria-expanded', 'false');
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.toast.hidden = true; }, 2200);
  }

  // ---------- Eventos ----------
  function applyFiltersAndRender() {
    readFiltersFromForm();
    state.page = 1;
    render();
  }

  el.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFiltersAndRender();
  });
  el.searchInput.addEventListener('input', debounce(applyFiltersAndRender, 200));
  el.filterSg.addEventListener('change', applyFiltersAndRender);
  el.filterPlu.addEventListener('input', debounce(applyFiltersAndRender, 200));
  el.filterCod.addEventListener('input', debounce(applyFiltersAndRender, 200));
  el.filterOrden.addEventListener('change', applyFiltersAndRender);
  el.filterImagen.addEventListener('change', applyFiltersAndRender);
  el.filterWebRadios.forEach((r) => r.addEventListener('change', applyFiltersAndRender));
  el.perPageSelect.addEventListener('change', applyFiltersAndRender);

  el.filterClear.addEventListener('click', resetFilters);
  el.emptyStateClear.addEventListener('click', resetFilters);

  function resetFilters() {
    el.searchInput.value = '';
    el.filterSg.value = '';
    el.filterPlu.value = '';
    el.filterCod.value = '';
    el.filterOrden.value = 'plu';
    el.filterImagen.checked = false;
    document.querySelector('input[name="filter-web"][value="todos"]').checked = true;
    el.perPageSelect.value = '10';
    applyFiltersAndRender();
  }

  el.grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const pid = btn.getAttribute('data-add-to-cart');
    const qtyInput = document.getElementById(`qty-${pid}`);
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    Cart.add(pid, qty);
    showToast('Producto agregado al carrito.');
  });

  el.cartToggle.addEventListener('click', openCart);
  el.cartClose.addEventListener('click', closeCart);
  el.cartBackdrop.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.cartDrawer.classList.contains('is-open')) closeCart();
  });

  el.cartBody.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-cart-inc]');
    const dec = e.target.closest('[data-cart-dec]');
    const rem = e.target.closest('[data-cart-remove]');
    const cart = Cart.getAll();
    if (inc) {
      const pid = inc.getAttribute('data-cart-inc');
      Cart.setQty(pid, (cart[pid] || 0) + 1);
    } else if (dec) {
      const pid = dec.getAttribute('data-cart-dec');
      Cart.setQty(pid, (cart[pid] || 0) - 1);
    } else if (rem) {
      Cart.remove(rem.getAttribute('data-cart-remove'));
    }
  });

  document.addEventListener('cart:changed', renderCart);

  el.mobileNavToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    el.mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
  });

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // ---------- Init ----------
  populateSubgroups();
  render();
  renderCart();
})();

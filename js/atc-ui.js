/**
 * Scenario banner + UCD overlays (duplicate, pincode, candidate popup).
 */
(function () {
  const Atc = window.DemoAtc;
  const Cart = window.DemoCart;
  if (!Atc) return;

  function el(html) {
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function ensureShell() {
    if (document.getElementById('atc-overlay-root')) return;
    document.body.appendChild(
      el(`<div id="atc-overlay-root"></div>`),
    );
  }

  function paintBanner() {
    const banner = document.querySelector('.demo-banner');
    if (!banner) return;
    const st = Atc.getState();
    const groups = [];
    Atc.SCENARIOS.forEach((s) => {
      const last = groups[groups.length - 1];
      if (!last || last.label !== s.group) groups.push({ label: s.group, items: [s] });
      else last.items.push(s);
    });
    const opts = groups
      .map((g) => {
        const inner = g.items
          .map(
            (s) =>
              `<option value="${s.id}" ${s.id === st.scenarioId ? 'selected' : ''}>${s.id}  ${s.title}</option>`,
          )
          .join('');
        return `<optgroup label="${g.label}">${inner}</optgroup>`;
      })
      .join('');
    const meta = Atc.SCENARIOS.find((s) => s.id === st.scenarioId);
    banner.classList.add('atc-banner');
    banner.innerHTML = `
      <div class="atc-banner-row">
        <label class="atc-banner-label">Play
          <select id="atc-scenario">${opts}</select>
        </label>
        <span class="atc-banner-clock">clock ${st.clock.slice(11, 16)} · pin ${st.pincode || '—'} · ${st.signedIn ? st.shopperId || 'in' : 'guest'} · cart ${st.customerId || 'null'} · ${st.cartStatus || '—'} · ${st.lines?.length || Cart.getCount()} pc</span>
        <span class="atc-banner-actions">
          <button type="button" class="atc-banner-btn" id="atc-contract-btn">Contract</button>
          <button type="button" class="atc-banner-btn" id="atc-debug-btn">Debug</button>
        </span>
      </div>
      <p class="atc-banner-hint">${meta ? meta.hint : ''}</p>
    `;
    document.getElementById('atc-scenario').addEventListener('change', (e) => {
      Atc.applyScenario(e.target.value);
      location.href = Atc.landUrl(e.target.value);
    });
    document.getElementById('atc-contract-btn').addEventListener('click', () => {
      showContractSheet(st.scenarioId);
    });
    document.getElementById('atc-debug-btn').addEventListener('click', showDebugSheet);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function prettyJson(obj) {
    const raw = escapeHtml(JSON.stringify(obj, null, 2));
    return raw.replace(
      /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/:$/.test(match)) return '<span class="jx-key">' + match.slice(0, -1) + '</span>:';
        if (/^"/.test(match)) return '<span class="jx-str">' + match + '</span>';
        if (/true|false/.test(match)) return '<span class="jx-bool">' + match + '</span>';
        if (/null/.test(match)) return '<span class="jx-null">' + match + '</span>';
        return '<span class="jx-num">' + match + '</span>';
      },
    );
  }

  function copyJson(obj) {
    const text = JSON.stringify(obj, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => Cart.showToast('Copied'),
        () => Cart.showToast('Copy failed'),
      );
      return;
    }
    Cart.showToast('Copy not available');
  }

  function renderCallCard(call, index, open) {
    const C = window.DemoAtcContracts;
    const tone = C.toneOf(call);
    const pill = C.labelOf(call);
    return `
      <article class="atc-call atc-call-${tone}${open ? ' is-open' : ''}">
        <button type="button" class="atc-call-head" data-acc="${index}" aria-expanded="${open ? 'true' : 'false'}">
          <span class="atc-call-step">${index + 1}</span>
          <div class="atc-call-copy">
            <p class="atc-call-meta">${escapeHtml(call.cid || '')} · ${escapeHtml(call.party || '')}</p>
            <h3>${escapeHtml(call.title)}</h3>
            <p class="atc-call-verb">${escapeHtml(call.verb || '')}</p>
          </div>
          <span class="atc-pill atc-pill-${tone}">${escapeHtml(pill)}</span>
          <span class="atc-chevron" aria-hidden="true"></span>
        </button>
        <div class="atc-call-panel">
          <div class="atc-call-grid">
            <section>
              <div class="atc-json-bar">
                <span>Request</span>
                <button type="button" class="atc-copy" data-copy="req-${index}">Copy</button>
              </div>
              <pre class="atc-json"><code>${prettyJson(call.request)}</code></pre>
            </section>
            <section>
              <div class="atc-json-bar">
                <span>Response</span>
                <button type="button" class="atc-copy" data-copy="res-${index}">Copy</button>
              </div>
              <pre class="atc-json"><code>${prettyJson(call.response)}</code></pre>
            </section>
          </div>
        </div>
      </article>`;
  }

  function renderContractBody(id) {
    const C = window.DemoAtcContracts;
    const pack = C.pack(id);
    const meta = Atc.SCENARIOS.find((s) => s.id === id);
    const family = id.split('-').slice(0, 2).join('-');
    const pills = Atc.SCENARIOS.filter((s) => s.id.startsWith(family))
      .map(
        (s) =>
          `<button type="button" class="atc-tab ${s.id === id ? 'is-on' : ''}" data-play="${s.id}">${escapeHtml(s.id.replace(/^S-/, ''))} ${escapeHtml(s.title)}</button>`,
      )
      .join('');
    const families = ['S-ATC', 'S-PLP', 'S-PDP', 'S-AUTH', 'S-CART', 'S-REM', 'S-CO', 'S-OFR']
      .map((key) => {
        const on = family === key;
        return `<button type="button" class="atc-tab ${on ? 'is-on' : ''}" data-family="${key}">${key.replace('S-', '')}</button>`;
      })
      .join('');
    const cards = pack.calls.length
      ? pack.calls.map((call, index) => renderCallCard(call, index, index === 0)).join('')
      : `<div class="atc-empty">
          <strong>No HTTP for this option</strong>
          <p>${escapeHtml(pack.summary)}</p>
        </div>`;
    return `
      <header class="atc-sheet-hero">
        <div>
          <p class="atc-sheet-kicker">Hydrogen ↔ Alchemy contract</p>
          <h2>${escapeHtml(id)} · ${escapeHtml(pack.title)}</h2>
          <p class="atc-sheet-sum">${escapeHtml(pack.summary)}</p>
        </div>
        <button type="button" class="atc-sheet-x" data-close aria-label="Close">×</button>
      </header>
      <div class="atc-tabs atc-tabs-family">${families}</div>
      <div class="atc-tabs">${pills}</div>
      <div class="atc-sheet-scroll">
        <p class="atc-sheet-note">${escapeHtml(C.NOTE)}</p>
        ${meta ? `<p class="atc-sheet-hint">Play tip · ${escapeHtml(meta.hint)}</p>` : ''}
        <div class="atc-sheet-body">${cards}</div>
      </div>
      <footer class="atc-modal-actions">
        <button type="button" class="atc-btn-ghost" data-close>Close</button>
      </footer>`;
  }

  function bindContractSheet(root, id) {
    const C = window.DemoAtcContracts;
    const pack = C.pack(id);
    root.querySelectorAll('[data-close]').forEach((btn) => {
      btn.onclick = closeOverlays;
    });
    root.querySelectorAll('[data-play]').forEach((btn) => {
      btn.onclick = () => showContractSheet(btn.getAttribute('data-play'));
    });
    root.querySelectorAll('[data-family]').forEach((btn) => {
      btn.onclick = () => {
        const first = Atc.SCENARIOS.find((s) => s.id.startsWith(btn.getAttribute('data-family')));
        if (first) showContractSheet(first.id);
      };
    });
    root.querySelectorAll('[data-acc]').forEach((btn) => {
      btn.onclick = () => {
        const card = btn.closest('.atc-call');
        const next = !card.classList.contains('is-open');
        card.classList.toggle('is-open', next);
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
      };
    });
    pack.calls.forEach((call, index) => {
      const reqBtn = root.querySelector('[data-copy="req-' + index + '"]');
      const resBtn = root.querySelector('[data-copy="res-' + index + '"]');
      if (reqBtn) reqBtn.onclick = () => copyJson(call.request);
      if (resBtn) resBtn.onclick = () => copyJson(call.response);
    });
  }

  function openDrawer(innerHtml, extraClass) {
    ensureShell();
    const host = document.getElementById('atc-overlay-root');
    host.innerHTML = '';
    const back = el(
      `<div class="atc-drawer-back" role="dialog" aria-modal="true">
        <aside class="atc-drawer ${extraClass || ''}">${innerHtml}</aside>
      </div>`,
    );
    host.appendChild(back);
    document.body.style.overflow = 'hidden';
    back.addEventListener('click', (e) => {
      if (e.target === back) closeOverlays();
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => back.classList.add('is-open'));
    });
    return back;
  }

  function showContractSheet(id) {
    const C = window.DemoAtcContracts;
    if (!C) {
      Cart.showToast('Contract pack not loaded');
      return;
    }
    const existing = document.querySelector('.atc-drawer-back .atc-drawer:not(.atc-drawer-narrow)');
    if (existing) {
      existing.innerHTML = renderContractBody(id);
      bindContractSheet(existing, id);
      const scroller = existing.querySelector('.atc-sheet-scroll');
      if (scroller) scroller.scrollTop = 0;
      return;
    }
    const back = openDrawer(renderContractBody(id));
    bindContractSheet(back, id);
  }

  function showDebugSheet() {
    const snap = Atc.debugSnapshot();
    const rows = Object.entries(snap)
      .map(
        ([key, value]) =>
          `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(String(value))}</td></tr>`,
      )
      .join('');
    const back = openDrawer(
      `<header class="atc-sheet-hero">
        <div>
          <p class="atc-sheet-kicker">Demo engine</p>
          <h2>Debug snapshot</h2>
          <p class="atc-sheet-sum">localStorage only — not live Shopify or Alchemy.</p>
        </div>
        <button type="button" class="atc-sheet-x" data-close aria-label="Close">×</button>
      </header>
      <div class="atc-sheet-scroll">
        <div class="atc-sheet-body">
          <table class="atc-debug-table">${rows}</table>
        </div>
      </div>
      <footer class="atc-modal-actions">
        <button type="button" class="atc-btn-ghost" data-close>Close</button>
      </footer>`,
      'atc-drawer-narrow',
    );
    back.querySelectorAll('[data-close]').forEach((btn) => {
      btn.onclick = closeOverlays;
    });
  }

  function closeOverlays() {
    const back = document.querySelector('.atc-drawer-back');
    if (back && back.classList.contains('is-open')) {
      back.classList.remove('is-open');
      window.setTimeout(() => {
        const host = document.getElementById('atc-overlay-root');
        if (host) host.innerHTML = '';
        document.body.style.overflow = '';
      }, 320);
      return;
    }
    const root = document.getElementById('atc-overlay-root');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
  }

  function showModal(inner) {
    ensureShell();
    const root = document.getElementById('atc-overlay-root');
    root.innerHTML = '';
    const modal = el(`<div class="atc-modal-backdrop" role="dialog" aria-modal="true">${inner}</div>`);
    root.appendChild(modal);
    document.body.style.overflow = 'hidden';
    return modal;
  }

  function showDuplicate(sku, onYes, onNo) {
    const modal = showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">S-ATC-02 · FR-CART-12</p>
        <h2>Add another piece?</h2>
        <p>This SKU (<strong>${sku}</strong>) is already in your cart as its own row. Add a second physical piece?</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-ghost" data-no>No, keep cart as is</button>
          <button type="button" class="atc-btn-primary" data-yes>Yes, add another</button>
        </div>
      </div>`);
    modal.querySelector('[data-no]').onclick = () => {
      closeOverlays();
      Cart.showToast('Cart unchanged');
      onNo();
    };
    modal.querySelector('[data-yes]').onclick = () => {
      closeOverlays();
      onYes();
    };
  }

  function showPincode(onDone) {
    const modal = showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">S-ATC-03 · FR-CART-01</p>
        <h2>Delivery pincode</h2>
        <p>Needed before we can list available weights. Asked once this session. The pin is accepted, not used to rank in phase 1.</p>
        <input id="atc-pin-input" type="text" inputmode="numeric" maxlength="6" placeholder="560001" class="atc-input" />
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-ghost" data-cancel>Cancel</button>
          <button type="button" class="atc-btn-primary" data-ok>Continue</button>
        </div>
      </div>`);
    const input = modal.querySelector('#atc-pin-input');
    input.focus();
    modal.querySelector('[data-cancel]').onclick = () => {
      closeOverlays();
      Cart.showToast('Nothing held');
    };
    modal.querySelector('[data-ok]').onclick = () => {
      const pin = input.value.trim();
      if (!/^\d{6}$/.test(pin)) {
        Cart.showToast('Enter a 6-digit pincode');
        return;
      }
      const st = Atc.getState();
      st.pincode = pin;
      Atc.save();
      closeOverlays();
      onDone(pin);
    };
  }

  function showEmptyFinding() {
    showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">S-ATC-10 · OI-08 / OI-09</p>
        <h2>No candidates (API success)</h2>
        <p><code>AvailableUniqueWeights</code> returned <code>[]</code>. That is not an Alchemy error. The UCD does <strong>not</strong> define what this page shows — so this demo does not invent a popup or toast as the real Then.</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-primary" data-ok>Stay on PDP</button>
        </div>
      </div>`);
    document.querySelector('#atc-overlay-root [data-ok]').onclick = closeOverlays;
  }

  function showSoldOutFinding() {
    showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">S-ATC-09 · CART-003 2b</p>
        <h2>No piece left for this SKU</h2>
        <p>AddToCart failed and the refresh was empty. Hydrogen would reload into native unavailable handling. Exact copy is still open.</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-primary" data-ok>Close</button>
        </div>
      </div>`);
    document.querySelector('#atc-overlay-root [data-ok]').onclick = () => {
      const st = Atc.getState();
      st.flags.soldOutSku = Atc.SKU_DEFAULT;
      st.flags.autoOpenPopup = false;
      Atc.save();
      location.reload();
    };
  }

  function comboFromKey(key) {
    const parts = String(key || '').split('|');
    return {
      grossWeightGrams: Number(parts[0]),
      metalWeightGrams: Number(parts[1]),
    };
  }

  function showTechnicalAlert(opts) {
    const goCart = !!(opts && opts.goCart);
    const modal = showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">${goCart ? 'UC-CART-003 3c · OI-10' : 'UC-CART-003 2c · OI-10'}</p>
        <h2>A technical problem occurred</h2>
        <p>Copy is not signed. This alert does not say whether a piece was added.</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-primary" data-ok>OK</button>
        </div>
      </div>`);
    modal.querySelector('[data-ok]').onclick = () => {
      closeOverlays();
      if (goCart) location.href = 'cart.html';
    };
  }

  function showCandidates(sku, pin, opts) {
    const payload = Atc.availableUniqueWeights(sku, pin);
    let sort = 'price';
    let selected = opts && opts.selected;
    const list = () => Atc.sortCandidates(payload.candidates, sort);
    if (!selected && list()[0]) selected = list()[0].comboKey;

    function render() {
      const rows = list();
      const body = rows
        .map((c) => {
          const on = c.comboKey === selected;
          return `<tr data-combo="${c.comboKey}" class="${on ? 'is-selected' : ''}">
            <td><input type="radio" name="atc-pick" ${on ? 'checked' : ''} /></td>
            <td>${c.grossWeightGrams.toFixed(2)} g</td>
            <td>${c.metalWeightGrams.toFixed(2)} g</td>
            <td>${Cart.formatINR(c.salePriceInr)}</td>
          </tr>`;
        })
        .join('');
      modal.querySelector('#atc-table-body').innerHTML = body;
      modal.querySelectorAll('#atc-table-body tr').forEach((tr) => {
        tr.addEventListener('click', () => {
          selected = tr.getAttribute('data-combo');
          render();
        });
      });
    }

    const taken = opts && opts.taken;
    const alertHtml = taken
      ? `<div class="atc-alert" role="alert">
          <strong>That combination is no longer available</strong>
          <p>Another customer took the last piece of those weights while you were deciding. Choose another combination.</p>
        </div>`
      : opts && opts.technical
        ? `<div class="atc-alert" role="alert">
          <strong>A technical problem occurred</strong>
          <p>Copy is not signed (OI-10). The table stays open. Submit again to retry.</p>
        </div>`
        : '';

    const modal = showModal(`
      <div class="atc-modal atc-modal-wide">
        <p class="atc-modal-kicker">CART-001 / CART-002 · Alchemy lightest-first; this table is cheapest-first</p>
        <h2>Choose a combination</h2>
        <p class="atc-modal-sub">SKU ${sku} · pin ${pin}. No barcode on this list. Confirm sends SKU + weights. Listing price stays the SKU aggregate.</p>
        ${alertHtml}
        <div class="atc-sort">
          Sort
          <button type="button" class="atc-chip is-on" data-sort="price">Price ↑</button>
          <button type="button" class="atc-chip" data-sort="price-desc">Price ↓</button>
        </div>
        <div class="atc-table-wrap">
          <table class="atc-table">
            <thead>
              <tr><th></th><th>Gross wt</th><th>Metal wt</th><th>Sale price</th></tr>
            </thead>
            <tbody id="atc-table-body"></tbody>
          </table>
        </div>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-ghost" data-cancel>Cancel</button>
          <button type="button" class="atc-btn-primary" data-ok>Confirm combination</button>
        </div>
      </div>`);

    modal.querySelector('[data-cancel]').onclick = closeOverlays;
    modal.querySelectorAll('[data-sort]').forEach((btn) => {
      btn.onclick = () => {
        sort = btn.getAttribute('data-sort');
        modal.querySelectorAll('[data-sort]').forEach((b) => b.classList.toggle('is-on', b === btn));
        render();
      };
    });
    modal.querySelector('[data-ok]').onclick = () => confirmSelection(sku, pin, selected, payload);
    render();
  }

  function finishHeldLine(barcode) {
    const st = Atc.getState();

    if (st.flags.resolveBarcode) {
      Atc.dropOmAndLine(st.flags.resolveBarcode);
      st.flags.resolveBarcode = null;
      Atc.save();
    }

    if (Cart.getCount() > 1) {
      Atc.alignCartExpiries(st.cartId, barcode);
    }
    closeOverlays();
    Cart.showToast('Added ' + barcode);
    setTimeout(() => {
      location.href = 'cart.html';
    }, 350);
  }

  function tryShopifyWithRetry(piece) {
    let added = Atc.addShopifyLine(piece);
    if (!added.ok) added = Atc.addShopifyLine(piece);
    return added;
  }

  function confirmSelection(sku, pin, comboKey, snapshot) {
    const st = Atc.getState();
    const weights = (snapshot.candidates || []).find((c) => c.comboKey === comboKey) || {
      comboKey,
      ...comboFromKey(comboKey),
    };
    const gross = weights.grossWeightGrams;
    const metal = weights.metalWeightGrams;
    snapshot._gross = gross;
    snapshot._metal = metal;

    if (st.flags.stealOnConfirm === 'selected') {
      const first = Atc.firstAvailableOfCombo(sku, gross, metal);
      if (first) Atc.stealForOtherCart([first.barcode]);
      st.flags.stealOnConfirm = null;
      Atc.save();
    } else if (st.flags.stealOnConfirm === 'all-5g') {
      Atc.stealForOtherCart(['BC-101', 'BC-102', 'BC-103']);
      st.flags.stealOnConfirm = null;
      Atc.save();
    }

    const res = Atc.addToCart(sku, gross, metal, st.cartId);
    if (res.result === 'ERROR') {
      showCandidates(sku, pin, { selected: comboKey, technical: true });
      return;
    }
    if (res.result !== 'SUCCESS') {
      const fresh = Atc.availableUniqueWeights(sku, pin);
      if (!fresh.candidates.length) {
        showSoldOutFinding();
        return;
      }
      closeOverlays();
      showCandidates(sku, pin, {
        selected: Atc.sortCandidates(fresh.candidates, 'price')[0].comboKey,
        taken: weights,
      });
      return;
    }

    if (st.flags.shadowOtherCart) {
      Atc.addToCart(sku, gross, metal, 'c_999');
      st.flags.shadowOtherCart = false;
      Atc.save();
    }

    const piece = {
      sku,
      barcode: res.barcode,
      salePriceInr: weights.salePriceInr || barcodeRowPrice(res.barcode),
      grossWeightGrams: gross,
      metalWeightGrams: metal,
      expiresAt: res.expiresAt,
    };

    const added = tryShopifyWithRetry(piece);
    if (added.ok) {
      finishHeldLine(res.barcode);
      return;
    }

    const give = Atc.removeFromCart(res.barcode);
    if (give.result !== 'SUCCESS') {
      showTechnicalAlert({ goCart: true });
      return;
    }

    const repeat = Atc.addToCart(sku, gross, metal, st.cartId);
    if (repeat.result === 'ERROR') {
      showCandidates(sku, pin, { selected: comboKey, technical: true });
      return;
    }
    if (repeat.result !== 'SUCCESS') {
      const fresh = Atc.availableUniqueWeights(sku, pin);
      if (!fresh.candidates.length) {
        showSoldOutFinding();
        return;
      }
      closeOverlays();
      showCandidates(sku, pin, {
        selected: Atc.sortCandidates(fresh.candidates, 'price')[0].comboKey,
        taken: weights,
      });
      return;
    }

    piece.barcode = repeat.barcode;
    piece.expiresAt = repeat.expiresAt;
    const addedAgain = tryShopifyWithRetry(piece);
    if (addedAgain.ok) {
      finishHeldLine(repeat.barcode);
      return;
    }
    showTechnicalAlert({ goCart: true });
  }

  function barcodeRowPrice(code) {
    const row = Atc.getState().inventory.find((b) => b.barcode === code);
    return row ? row.salePriceInr : 0;
  }

  function beginAdd(sku) {
    const st = Atc.getState();
    if (st.flags.soldOutSku === sku) {
      Cart.showToast('Sold out (demo after S-ATC-09)');
      return;
    }
    if (Atc.skuInCart(sku)) {
      showDuplicate(
        sku,
        () => afterGates(sku),
        () => {},
      );
      return;
    }
    afterGates(sku);
  }

  function afterGates(sku) {
    const st = Atc.getState();
    if (!st.pincode) {
      showPincode((pin) => openList(sku, pin));
      return;
    }
    openList(sku, st.pincode);
  }

  function openList(sku, pin) {
    const payload = Atc.availableUniqueWeights(sku, pin);
    if (!payload.candidates.length) {
      showEmptyFinding();
      return;
    }
    showCandidates(sku, pin, {});
  }

  function showFinding(kicker, title, body) {
    const modal = showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${body}</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-primary" data-ok>Close</button>
        </div>
      </div>`);
    modal.querySelector('[data-ok]').onclick = closeOverlays;
  }

  function showOfferFinding() {
    showFinding(
      'S-OFR-01 · Batch 5',
      'Offers Management is retired',
      'Alchemy <code>v0.23</code> removed <code>FR-OFR-01…03</code>. The making-charge discount lives inside the synced Sale Price (<code>FR-PRC-05</code>). There is no cart-level voucher API. This leftover “Apply Offer” chrome is not a Then — <code>OI-19</code> still tracks the unused <code>is_modified</code> flag.',
    );
  }

  function showPayFinding() {
    showFinding(
      'S-CO-04 · OI-16',
      'Payment outcomes are not specified',
      'Success, Failure and Timeout have no UCD yet (<code>FR-CO-04</code> / <code>OI-16</code>). This page is only the RazorPay handoff after <code>InitiateCartCheckout</code>. Do not treat a tap here as a paid order.',
    );
  }

  function beginResolve(sku, flaggedBarcode) {
    const st = Atc.getState();
    st.flags.resolveBarcode = flaggedBarcode;
    Atc.save();
    afterGates(sku);
  }

  function runCartPageCheck() {
    const st = Atc.getState();
    if (st.flags.pageNote === 'revert-not-locked') {
      showFinding(
        'S-CART-07 · finding',
        'Revert when the cart is not locked',
        'Hydrogen received an ERROR and would call revert, but the cart is not <code>CHECKOUT_INITIATED</code>. Neither BRD specifies idempotent success vs error. This demo does not pick a Then.',
      );
      return Atc.getState().lastCheck;
    }
    if (st.flags.pageNote === 'error-other') {
      showFinding(
        'S-CART-08 · OI-23',
        'Unbounded restart',
        'ERROR for a cause other than browser-back would still run revert + automatic restart, with no cap. Do not Then a retry limit from this play.',
      );
      return Atc.getCartDetails(true);
    }
    if (st.flags.pageNote === 'after-sweep') {
      const details = Atc.getCartDetails(true);
      showFinding(
        'S-CART-09 · finding',
        'Sweep left no OM row',
        'The sweep discarded the association. Safer signed reading: OM empty → Shopify line removed. A flagged unheld row after sweep is not specified — CART-006 needs an OM item list.',
      );
      return details;
    }

    let details = Atc.getCartDetails(true);
    if (details.result === 'ERROR' && !st.flags.skipAutoRevert) {
      Atc.revertCheckout();
      details = Atc.getCartDetails(true);
      Cart.showToast('Checkout lock reverted — holds not extended');
    }
    return details;
  }

  function removeRow(barcode) {
    const res = Atc.releaseItem(barcode);
    if (res.result !== 'SUCCESS') {
      Cart.showToast('Remove refused — cart is locked for payment (S-REM-02)');
      return res;
    }
    if (!res.shopifyRemoved) {
      Cart.showToast('Released in Alchemy; Shopify line lingered, then OM wins (S-REM-03 / OI-15)');
    } else {
      Cart.showToast('Released and removed');
    }
    Atc.getCartDetails(true);
    return res;
  }

  function beginLogin(opts) {
    const resume = !!(opts && opts.resumeCheckout);
    const st = Atc.getState();
    if (st.signedIn && st.customerId) {
      if (resume) {
        finishIdentifiedCheckout();
        return;
      }
      Cart.showToast('Already signed in as ' + (st.shopperId || 'cust_42'));
      return;
    }
    const kicker = resume ? 'S-CO-05 · FR-AUTH-01' : st.flags.pageNote === 'login-no-cart' ? 'S-AUTH-03 · UC-AUTH-002' : 'S-AUTH-01 · C-HY-10';
    const body = resume
      ? 'A guest never reaches the reservation check. Sign-in comes first. On return Hydrogen calls UpdateCart, then Checkout resumes from GetCart.'
      : Atc.hasAlchemyCart()
        ? 'KalyanIQ authenticates (OTP path specified, not re-worked here). A cart already exists, so Hydrogen calls UpdateCart. Holds, expiry and prices do not change.'
        : 'KalyanIQ authenticates. There is no Alchemy cart to link. UpdateCart is not called.';
    const modal = showModal(`
      <div class="atc-modal">
        <p class="atc-modal-kicker">${kicker}</p>
        <h2>Sign in with KalyanIQ</h2>
        <p>${body}</p>
        <p class="atc-modal-sub">Demo identity <code>cust_42</code>. OTP is not rebuilt here.</p>
        <div class="atc-modal-actions">
          <button type="button" class="atc-btn-ghost" data-cancel>Cancel</button>
          <button type="button" class="atc-btn-primary" data-ok>Continue as cust_42</button>
        </div>
      </div>`);
    modal.querySelector('[data-cancel]').onclick = closeOverlays;
    modal.querySelector('[data-ok]').onclick = () => {
      const linked = Atc.updateCart('cust_42');
      closeOverlays();
      syncHeaderAuth();
      paintBanner();
      if (linked.invoked === false) {
        Cart.showToast('Signed in — no Alchemy cart to link (S-AUTH-03)');
        return;
      }
      Cart.showToast('Cart linked to cust_42 — holds unchanged');
      if (resume) {
        finishIdentifiedCheckout();
        return;
      }
      if (/cart\.html/i.test(location.href)) location.reload();
    };
  }

  function finishIdentifiedCheckout() {
    const details = Atc.getCartDetails(true);
    if (details.result !== 'SUCCESS') {
      Cart.showToast('Checkout blocked after sign-in');
      return;
    }
    const lock = Atc.initiateCheckout();
    if (lock.result !== 'SUCCESS') {
      Cart.showToast('Lock refused — ' + (lock.reason || 'unknown'));
      return;
    }
    location.href = 'checkout.html';
  }

  function proceedCheckout() {
    const st = Atc.getState();
    if (!st.customerId) {
      beginLogin({ resumeCheckout: true });
      return;
    }
    const details = Atc.getCartDetails(true);
    if (details.result === 'ERROR') {
      if (st.flags.skipAutoRevert || st.scenarioId === 'S-CO-03') {
        Atc.revertCheckout();
        Atc.getCartDetails(true);
        Cart.showToast('Lock seen on checkout click — reverted, no new lock (S-CO-03)');
        location.href = 'cart.html';
        return;
      }
      Atc.revertCheckout();
      Atc.getCartDetails(true);
      Cart.showToast('Cart was locked — reverted');
      return;
    }
    if (details.result === 'FAILURE') {
      Cart.showToast('Checkout blocked — a piece is unheld (S-CO-02)');
      return;
    }
    Atc.initiateCheckout();
    location.href = 'checkout.html';
  }

  function syncHeaderAuth() {
    const st = Atc.getState();
    document.querySelectorAll('[data-login-cta]').forEach((el) => {
      const label = el.querySelector('[data-login-label]');
      if (label) label.textContent = st.signedIn ? 'Account' : 'Login';
    });
  }

  function bindHeaderAuth() {
    document.querySelectorAll('[data-login-cta]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const st = Atc.getState();
        if (st.signedIn) {
          Cart.showToast('Signed in as ' + (st.shopperId || 'cust_42') + (st.customerId ? ' · cart linked' : ' · cart not linked'));
          return;
        }
        beginLogin({});
      });
    });
    syncHeaderAuth();
  }

  window.DemoAtcUi = {
    beginAdd,
    beginResolve,
    showCandidates,
    paintBanner,
    showOfferFinding,
    showPayFinding,
    showFinding,
    runCartPageCheck,
    removeRow,
    proceedCheckout,
    beginLogin,
    bindHeaderAuth,
    syncHeaderAuth,
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('#atc-overlay-root .atc-modal-backdrop')) {
      closeOverlays();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    paintBanner();
    Atc.updateBadges();
    bindHeaderAuth();
    const st = Atc.getState();
    const onPdp = /pdp\.html/i.test(location.pathname) || location.href.indexOf('pdp.html') !== -1;
    if (onPdp && st.flags.autoOpenPopup) {
      st.flags.autoOpenPopup = false;
      Atc.save();
      setTimeout(() => beginAdd(Atc.SKU_DEFAULT), 200);
    }
    if (st.flags.pageNote === 'signed-in-first-add') {
      setTimeout(() => {
        showFinding(
          'S-AUTH-02 · finding',
          'Signed-in first add never sets CustomerId',
          'You are already signed in. <code>AddToCart</code> still creates the cart with <code>CustomerId</code> null. <code>UpdateCart</code> runs only on a later login. Do not Then a link on this add.',
        );
      }, 200);
    }
    if (st.flags.pageNote === 'search-fields') {
      setTimeout(() => {
        showFinding(
          'S-PLP-02 · finding',
          'Search and filter field lists are open',
          'Searchable fields are <code>OI-05</code>. Filter facets are <code>OI-06</code>. Hydrogen uses Shopify inbuilt search. Do not Then a field list or synonym table from the mapping note.',
        );
      }, 200);
    }
  });
})();

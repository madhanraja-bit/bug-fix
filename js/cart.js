/**
 * Static client demo cart — localStorage only (not Shopify).
 */
(function (global) {
  const STORAGE_KEY = 'kalyan_india_demo_cart_v1';

  /** Catalog used by PLP / PDP / Home cards */
  const PRODUCTS = {
    'greek-key-ring': {
      id: 'greek-key-ring',
      handle: 'greek-key-ring',
      title: 'Ancient Two Tone Greek Key Eternity Band Ring 18 Karat',
      sku: 'KJ-GR-001-4G-A-1',
      price: 25000,
      image: 'assets/1stimage.webp',
      variants: [
        { id: 'v-075', label: '0.75', price: 25000, available: false, image: 'assets/0.75ct.jpg', sku: 'KJ-GR-001-4G-A-1' },
        { id: 'v-05', label: '0.5', price: 28000, available: true, image: 'assets/0.5ct.jpg', sku: 'KJ-GR-001-4G-A-2' },
        { id: 'v-025', label: '0.25', price: 31000, available: true, image: 'assets/1.0ct.jpg', sku: 'KJ-GR-001-4G-A-3' },
      ],
    },
    'floral-diamond-ring': {
      id: 'floral-diamond-ring',
      handle: 'floral-diamond-ring',
      title: '18K Gold Ring - Diamond Setting',
      sku: 'KJ-DR-018-FL',
      price: 42000,
      image: 'assets/2ndimage.webp',
      variants: [
        { id: 'v-fl-s', label: 'S', price: 42000, available: true, image: 'assets/2ndimage.webp', sku: 'KJ-DR-018-FL-S' },
        { id: 'v-fl-m', label: 'M', price: 45000, available: true, image: 'assets/2ndimage.webp', sku: 'KJ-DR-018-FL-M' },
      ],
    },
    'solitaire-pendant': {
      id: 'solitaire-pendant',
      handle: 'solitaire-pendant',
      title: 'Classic Solitaire Diamond Pendant',
      sku: 'KJ-PD-009',
      price: 56000,
      image: 'assets/3rdimage.webp',
      variants: [
        { id: 'v-pd-1', label: 'Default', price: 56000, available: true, image: 'assets/3rdimage.webp', sku: 'KJ-PD-009' },
      ],
    },
    'gold-bangle': {
      id: 'gold-bangle',
      handle: 'gold-bangle',
      title: 'Traditional 22K Gold Bangle',
      sku: 'KJ-BG-022',
      price: 78000,
      image: 'assets/4thimage.webp',
      variants: [
        { id: 'v-bg-1', label: '2-4', price: 78000, available: true, image: 'assets/4thimage.webp', sku: 'KJ-BG-022' },
      ],
    },
  };

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeCart(lines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    updateBadges();
    global.dispatchEvent(new CustomEvent('demo-cart:updated'));
  }

  function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getCount() {
    return readCart().reduce((sum, line) => sum + (line.quantity || 1), 0);
  }

  function getSubtotal() {
    return readCart().reduce(
      (sum, line) => sum + line.price * (line.quantity || 1),
      0,
    );
  }

  function addItem(item) {
    const lines = readCart();
    const key = item.variantId || item.id;
    const existing = lines.find((line) => (line.variantId || line.id) === key);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      lines.push({
        id: item.id,
        variantId: item.variantId || item.id,
        title: item.title,
        sku: item.sku || '',
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1,
        optionLabel: item.optionLabel || '',
      });
    }
    writeCart(lines);
    return lines;
  }

  function removeItem(variantId) {
    writeCart(readCart().filter((line) => (line.variantId || line.id) !== variantId));
  }

  function setQuantity(variantId, quantity) {
    const qty = Math.max(1, Number(quantity) || 1);
    const lines = readCart().map((line) =>
      (line.variantId || line.id) === variantId
        ? { ...line, quantity: qty }
        : line,
    );
    writeCart(lines);
  }

  function clearCart() {
    writeCart([]);
  }

  function updateBadges() {
    const count = getCount();
    if (global.DemoHeader && typeof global.DemoHeader.syncBadges === 'function') {
      global.DemoHeader.syncBadges(count);
      return;
    }
    document.querySelectorAll('[data-cart-badge]').forEach((el) => {
      el.textContent = String(count > 99 ? '99+' : count);
      el.style.display = count > 0 ? 'block' : 'none';
    });
  }

  function showToast(message) {
    let el = document.getElementById('demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  global.DemoCart = {
    PRODUCTS,
    readCart,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    getCount,
    getSubtotal,
    formatINR,
    updateBadges,
    showToast,
  };

  document.addEventListener('DOMContentLoaded', updateBadges);
})(window);

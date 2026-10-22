/**
 * S-ATC click-through engine. localStorage only — not Shopify / Alchemy.
 * Seed IDs match kjj-alchemy-docs SEED-ATC / SEED-INV / SEED-PRC.
 */
(function (global) {
  const STORAGE_KEY = 'kalyan_atc_demo_v2';
  const HOLD_MS = 15 * 60 * 1000;
  const CLOCK_SEED = '2026-09-21T10:00:00+05:30';
  const CART_ID = 'c_789';
  const HANDLE = 'nagam-gold-ring';

  const STORES = {
    101: { city: 'Kochi', pincode: '682001', km: 340, delivery: '4 days' },
    102: { city: 'Bengaluru', pincode: '560038', km: 8, delivery: '2 days' },
    105: { city: 'Mumbai', pincode: '400001', km: 980, delivery: '3 days' },
  };

  const BARCODE_104 = {
    barcode: 'BC-104',
    sku: 'NAGAM-22K-5G',
    storeCode: '101',
    grossWeightGrams: 5.1,
    metalWeightGrams: 4.9,
    originalPriceInr: 48200,
    salePriceInr: 46100,
    metalValueInr: 37700,
    stoneDiamondValueInr: 0,
    makingChargeAmountInr: 10500,
    discountPercent: 20,
  };

  const BARCODE_SEED = [
    { barcode: 'BC-101', sku: 'NAGAM-22K-5G', storeCode: '101', grossWeightGrams: 5.1, metalWeightGrams: 4.9, originalPriceInr: 48200, salePriceInr: 46100, metalValueInr: 37700, stoneDiamondValueInr: 0, makingChargeAmountInr: 10500, discountPercent: 20 },
    { barcode: 'BC-102', sku: 'NAGAM-22K-5G', storeCode: '102', grossWeightGrams: 5.12, metalWeightGrams: 4.92, originalPriceInr: 48400, salePriceInr: 46300, metalValueInr: 37900, stoneDiamondValueInr: 0, makingChargeAmountInr: 10500, discountPercent: 20 },
    { barcode: 'BC-103', sku: 'NAGAM-22K-5G', storeCode: '105', grossWeightGrams: 5.4, metalWeightGrams: 5.2, originalPriceInr: 51000, salePriceInr: 48700, metalValueInr: 40500, stoneDiamondValueInr: 0, makingChargeAmountInr: 10500, discountPercent: 20 },
    { barcode: 'BC-201', sku: 'NAGAM-22K-3G', storeCode: '101', grossWeightGrams: 3.05, metalWeightGrams: 2.95, originalPriceInr: 28900, salePriceInr: 27600, metalValueInr: 22600, stoneDiamondValueInr: 0, makingChargeAmountInr: 6300, discountPercent: 20 },
  ];

  const PRODUCTS = {
    'nagam-gold-ring': {
      id: 'PRD-NAGAM',
      handle: HANDLE,
      title: 'Nagam Gold Ring',
      price: 48700,
      defaultSku: 'NAGAM-22K-5G',
      image: 'assets/1stimage.webp',
      variants: [
        {
          id: 'NAGAM-22K-3G',
          sku: 'NAGAM-22K-3G',
          label: '22K · 3g',
          price: 27600,
          originalPrice: 28900,
          available: true,
          image: 'assets/2ndimage.webp',
          breakup: { metalValueInr: 22600, stoneDiamondValueInr: 0, makingChargeAmountInr: 6300, discountPercent: 20, discountAmountInr: 1260, belongsTo: 'BC-201' },
        },
        {
          id: 'NAGAM-22K-5G',
          sku: 'NAGAM-22K-5G',
          label: '22K · 5g',
          price: 48700,
          originalPrice: 51000,
          available: true,
          image: 'assets/1stimage.webp',
          breakup: { metalValueInr: 40500, stoneDiamondValueInr: 0, makingChargeAmountInr: 10500, discountPercent: 20, discountAmountInr: 2300, belongsTo: 'BC-103' },
        },
      ],
    },
  };

  const SCENARIOS = [
    { id: 'S-ATC-00', group: 'Add to cart', title: 'Seed', land: 'pdp', hint: 'Reset catalog. Open PDP and click Add to Cart for a free play.' },
    { id: 'S-ATC-01', group: 'Add to cart', title: 'First add', land: 'pdp', hint: 'Guest. Pincode already 560001. Click Add to Cart → keep cheapest 5.10 / 4.90 → Confirm. Alchemy returns BC-101. CustomerId stays null.' },
    { id: 'S-ATC-02', group: 'Add to cart', title: 'Duplicate SKU', land: 'pdp', hint: 'BC-101 already in cart. Click Add to Cart → Decline (nothing changes) or Confirm (then pick another combination).' },
    { id: 'S-ATC-03', group: 'Add to cart', title: 'No pincode', land: 'pdp', hint: 'Guest, empty pin. Click Add to Cart → enter 560001 → weight popup. A signed-in default pincode is a different path.' },
    { id: 'S-ATC-04', group: 'Add to cart', title: 'Combination taken', land: 'pdp', hint: 'Popup is already open on 5.10 / 4.90. Confirm → error + list without that combination (another cart took the only piece).' },
    { id: 'S-ATC-05', group: 'Add to cart', title: 'Sort / select', land: 'pdp', hint: 'Popup open. Select 5.12 / 4.92, sort price descending then ascending — selection stays 5.12 / 4.92. No Alchemy refetch.' },
    { id: 'S-ATC-06', group: 'Add to cart', title: 'Shopify retry', land: 'pdp', hint: 'Confirm 5.10 / 4.90. First Shopify add fails; the one retry succeeds (UC-CART-003 3a). You see the item.' },
    { id: 'S-ATC-07', group: 'Add to cart', title: 'Second piece', land: 'pdp', hint: 'BC-101 already held. Click Add to Cart → Confirm duplicate → pick 5.12 / 4.92. Both rows, shared expiry 10:20.' },
    { id: 'S-ATC-08', group: 'Add to cart', title: 'Sibling lapsed', land: 'pdp', hint: 'Clock 10:16 (BC-101 expired). Add 5.12 / 4.92. BC-101 row stays in bag, flagged unheld. No add-time error.' },
    { id: 'S-ATC-09', group: 'Add to cart', title: 'SKU empty at confirm', land: 'pdp', hint: 'Popup still shows three combinations (stale). Confirm → refresh; 5g sold out. Copy is open (OI-08/09).' },
    { id: 'S-ATC-10', group: 'Add to cart', title: 'Empty candidates', land: 'pdp', hint: 'Click Add to Cart. AvailableUniqueWeights returns []. UCD does not define the screen — demo shows a finding note only.' },
    { id: 'S-ATC-11', group: 'Add to cart', title: 'ERROR omitted', land: 'pdp', hint: 'Click Add to Cart. 5.40 / 5.20 is gone (its only piece is ERROR). Remaining 5.10 / 4.90 ₹47,100 and 5.12 / 4.92 ₹47,300. Nothing held.' },
    { id: 'S-ATC-12', group: 'Add to cart', title: 'Same combo, two carts', land: 'pdp', hint: 'BC-104 is in the pool. Confirm 5.10 / 4.90 — you get BC-101. Debug also shows c_999 holding BC-104 (same combination).' },
    { id: 'S-ATC-13', group: 'Add to cart', title: 'Give-back and repeat', land: 'pdp', hint: 'Confirm 5.10 / 4.90. Both Shopify adds fail, Hydrogen gives BC-101 back, repeats AddToCart (holds BC-101 again), then Shopify succeeds.' },
    { id: 'S-ATC-14', group: 'Add to cart', title: 'Give-back fails', land: 'pdp', hint: 'Confirm 5.10 / 4.90. Both Shopify adds fail, RemoveFromCart fails. Technical note, then Cart Page. Piece still held; bag empty until OM wins.' },
    { id: 'S-ATC-15', group: 'Add to cart', title: 'AddToCart technical', land: 'pdp', hint: 'Popup already open. Confirm 5.10 / 4.90 → technical alert. Table stays open. Nothing added. Copy is open (OI-10).' },
    { id: 'S-PLP-01', group: 'Browse', title: 'Listing default', land: 'plp', hint: 'PRD-NAGAM tile is NAGAM-22K-5G at ₹48,700 (SKU aggregate, not BC-101’s ₹46,100). No Alchemy call.' },
    { id: 'S-PLP-02', group: 'Browse', title: 'Search fields', land: 'plp', hint: 'Finding only. Submit search or a facet — field lists are open (OI-05 / OI-06). Do not Then a synonym table.' },
    { id: 'S-PLP-03', group: 'Browse', title: 'Auto-load scroll', land: 'plp-auto-load', hint: 'Rings PLP: first batch only, no pager; scroll appends; end stops; sort resets. Specimen plp-auto-load.html (FR-PLP-05 / UC-PLP-004). OI-26 not Then’d.' },
    { id: 'S-PLP-04', group: 'Browse', title: 'Sticky Filter/Sort', land: 'plp-sticky-filter', hint: 'Scroll deep on Rings: Filter+Sort stay in viewport; open Filter / Sort from sticky strip; Apply resets first batch. Specimen plp-sticky-filter.html (FR-PLP-06 / UC-PLP-005). No new labels.' },
    { id: 'S-PDP-01', group: 'Browse', title: 'Open + switch SKU', land: 'pdp', hint: 'Page opens on 5g ₹51,000 / ₹48,700 (Highest / BC-103). Switch to 3g ₹28,900 / ₹27,600 on this page. No Alchemy on switch.' },
    { id: 'S-AUTH-01', group: 'Auth', title: 'Login with cart', land: 'cart', hint: 'Guest holds BC-101. Click Login in the header. UpdateCart sets cust_42. Hold, expiry and ₹46,100 stay put.' },
    { id: 'S-AUTH-02', group: 'Auth', title: 'Signed-in first add', land: 'pdp', hint: 'Finding only. Already signed in; first AddToCart still leaves CustomerId null. Do not Then a link on this add.' },
    { id: 'S-AUTH-03', group: 'Auth', title: 'Login, no cart', land: 'pdp', hint: 'Empty bag. Click Login. Session is established. UpdateCart is not called. No Alchemy cart is created.' },
    { id: 'S-CART-01', group: 'Cart page', title: 'Checkout on', land: 'cart', hint: 'Guest Cart Page after first add. GetCart SUCCESS. Row sale ₹46,100 + breakup. Checkout on; lock still needs CustomerId.' },
    { id: 'S-CART-02', group: 'Cart page', title: 'OM wins', land: 'cart', hint: 'Bag looks empty (Shopify add failed) but OM still holds BC-101. Open Cart — the line appears. Direction only (OI-15).' },
    { id: 'S-CART-03', group: 'Cart page', title: 'Unheld row', land: 'cart', hint: 'After sibling lapse. BC-101 flagged, BC-102 still held. Checkout off. Nothing silently dropped.' },
    { id: 'S-CART-04', group: 'Cart page', title: 'Resolve flagged', land: 'cart', hint: 'Click Resolve on the flagged BC-101 row. Same candidate popup → pick BC-103. Whole cart check restarts; Checkout on.' },
    { id: 'S-CART-05', group: 'Cart page', title: 'Back from pay', land: 'cart', hint: 'Browser back onto Cart while locked. Silent revert, then SUCCESS. Holds are not extended.' },
    { id: 'S-CART-06', group: 'Cart page', title: 'Partial renew', land: 'cart', hint: 'Both holds lapsed. BC-102 renews; BC-101 cannot. FAILURE keeps the renewal. Checkout off.' },
    { id: 'S-CART-07', group: 'Cart page', title: 'Revert not locked', land: 'cart', hint: 'Finding only. Revert when the cart is not CHECKOUT_INITIATED — UCD does not choose success vs error.' },
    { id: 'S-CART-08', group: 'Cart page', title: 'Unbounded restart', land: 'cart', hint: 'Finding only. ERROR for a cause other than back-from-pay (OI-23) would restart with no cap.' },
    { id: 'S-CART-09', group: 'Cart page', title: 'After sweep', land: 'cart', hint: 'Sweep already discarded the OM row. Safer signed reading: OM empty → Shopify line removed. Flagged-row after sweep is not specified.' },
    { id: 'S-REM-01', group: 'Remove', title: 'Remove row', land: 'cart', hint: 'Click Remove on BC-101. Release first, then the line goes, then the Cart Page check restarts.' },
    { id: 'S-REM-02', group: 'Remove', title: 'Remove refused', land: 'cart', hint: 'Cart is checkout-locked. Click Remove — refused before any release. Row stays.' },
    { id: 'S-REM-03', group: 'Remove', title: 'Shopify remove fail', land: 'cart', hint: 'Click Remove. Alchemy releases; Shopify line-delete fails. Next Cart check heals the leftover row (OI-15).' },
    { id: 'S-CO-01', group: 'Checkout', title: 'Lock + RazorPay', land: 'cart', hint: 'Already identified (cust_42). Click Proceed to Checkout — fresh GetCart, then lock 48200/46100, then RazorPay. Stop before pay (OI-16).' },
    { id: 'S-CO-02', group: 'Checkout', title: 'Revalidate fail', land: 'cart', hint: 'A row is unheld. Click Checkout anyway — FAILURE, stay on Cart, nothing locked, no RazorPay.' },
    { id: 'S-CO-03', group: 'Checkout', title: 'Revalidate error', land: 'cart', hint: 'Cart is already locked. Click Checkout again — ERROR, silent revert, check restarts. No new lock.' },
    { id: 'S-CO-04', group: 'Checkout', title: 'Pay outcomes', land: 'checkout', hint: 'Finding only. Payment Success / Failure / Timeout are skipped until FR-CO-04 / OI-16 has UCD behaviour.' },
    { id: 'S-CO-05', group: 'Checkout', title: 'Guest must sign in', land: 'cart', hint: 'Guest, Checkout on. Click Proceed — no GetCart yet. Sign in, UpdateCart, then the S-CO-01 lock.' },
    { id: 'S-OFR-01', group: 'Offers', title: 'Offers retired', land: 'offers', hint: 'Finding only. Offers Management was retired in Alchemy v0.23. Discount is inside the synced sale price. No voucher API.' },
  ];

  function cloneSeedInventory() {
    return BARCODE_SEED.map((row) => ({
      ...row,
      reservationStatus: 'available',
      sold: false,
    }));
  }

  function emptyState() {
    return {
      scenarioId: 'S-ATC-00',
      clock: CLOCK_SEED,
      pincode: '560001',
      cartId: CART_ID,
      cartStatus: null,
      customerId: null,
      signedIn: false,
      shopperId: null,
      inventory: cloneSeedInventory(),
      om: [],
      lines: [],
      isModified: false,
      lastCheck: null,
      flags: {
        stealOnConfirm: null,
        stealOnRenew: [],
        failShopifyAttempts: 0,
        failGiveBack: false,
        failAddToCartTechnical: false,
        shadowOtherCart: false,
        failShopifyRemove: false,
        autoOpenPopup: false,
        autoValidateCart: false,
        skipAutoRevert: false,
        soldOutSku: null,
        resolveBarcode: null,
        pageNote: '',
      },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      return { ...emptyState(), ...parsed, flags: { ...emptyState().flags, ...(parsed.flags || {}) } };
    } catch {
      return emptyState();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    global.dispatchEvent(new CustomEvent('demo-cart:updated'));
    updateBadges();
  }

  let state = load();

  function getState() {
    return state;
  }

  function barcodeRow(code) {
    return state.inventory.find((b) => b.barcode === code);
  }

  function storeMeta(code) {
    return STORES[String(code)] || { city: '?', km: 9999, delivery: '—' };
  }

  function formatINR(amount) {
    return (
      '₹' +
      Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatIst(ms) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(ms));
    const g = (type) => parts.find((p) => p.type === type).value;
    return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}:${g('second')}+05:30`;
  }

  function addMs(iso, ms) {
    return formatIst(new Date(iso).getTime() + ms);
  }

  function isExpired(iso) {
    return new Date(iso).getTime() <= new Date(state.clock).getTime();
  }

  function skuInCart(sku) {
    return state.lines.some((line) => line.sku === sku);
  }

  function weightKey(gross, metal) {
    return Number(gross).toFixed(2) + '|' + Number(metal).toFixed(2);
  }

  function availablePieces(sku) {
    return state.inventory.filter(
      (b) =>
        b.sku === sku &&
        !b.sold &&
        b.reservationStatus === 'available' &&
        b.salePriceInr != null,
    );
  }

  function pickFirstOfCombo(pieces) {
    return pieces.slice().sort((a, b) => {
      if (a.salePriceInr !== b.salePriceInr) return a.salePriceInr - b.salePriceInr;
      return a.barcode.localeCompare(b.barcode);
    })[0];
  }

  function firstAvailableOfCombo(sku, gross, metal) {
    const pieces = availablePieces(sku).filter(
      (b) => weightKey(b.grossWeightGrams, b.metalWeightGrams) === weightKey(gross, metal),
    );
    return pickFirstOfCombo(pieces) || null;
  }

  function availableUniqueWeights(sku, pincode) {
    const groups = new Map();
    availablePieces(sku).forEach((b) => {
      const key = weightKey(b.grossWeightGrams, b.metalWeightGrams);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    });
    const candidates = [...groups.entries()]
      .map(([comboKey, pieces]) => {
        const first = pickFirstOfCombo(pieces);
        return {
          comboKey,
          sku,
          grossWeightGrams: first.grossWeightGrams,
          metalWeightGrams: first.metalWeightGrams,
          salePriceInr: first.salePriceInr,
        };
      })
      .sort((a, b) => {
        if (a.grossWeightGrams !== b.grossWeightGrams) return a.grossWeightGrams - b.grossWeightGrams;
        return a.metalWeightGrams - b.metalWeightGrams;
      });
    return {
      sku,
      customerPincode: pincode,
      candidates,
    };
  }

  function availableBarcodes(sku, pincode) {
    return availableUniqueWeights(sku, pincode);
  }

  function sortCandidates(candidates, sort) {
    const copy = candidates.slice();
    if (sort === 'price-desc') {
      copy.sort((a, b) => b.salePriceInr - a.salePriceInr);
    } else {
      copy.sort((a, b) => a.salePriceInr - b.salePriceInr);
    }
    return copy;
  }

  function stealForOtherCart(barcodes) {
    barcodes.forEach((code, i) => {
      const row = barcodeRow(code);
      if (!row) return;
      row.reservationStatus = 'reserved';
      state.om.push({
        cartId: 'c_999',
        barcode: code,
        itemReservationStatus: 'RESERVED_FOR_CART',
        expiresAt: addMs(state.clock, HOLD_MS),
      });
    });
  }

  function discountAmount(b) {
    if (!b || b.makingChargeAmountInr == null || b.discountPercent == null) return 0;
    return Math.round((b.makingChargeAmountInr * b.discountPercent) / 100);
  }

  function priceFields(barcode) {
    const b = barcodeRow(barcode);
    if (!b || b.salePriceInr == null) return {};
    return {
      originalPriceInr: b.originalPriceInr,
      salePriceInr: b.salePriceInr,
      metalValueInr: b.metalValueInr,
      stoneDiamondValueInr: b.stoneDiamondValueInr,
      makingChargeAmountInr: b.makingChargeAmountInr,
      discountPercent: b.discountPercent,
      discountAmountInr: discountAmount(b),
    };
  }

  function holdPiece(row, cartId) {
    row.reservationStatus = 'reserved';
    const expiresAt = addMs(state.clock, HOLD_MS);
    if (cartId === state.cartId && (!state.om.filter((a) => a.cartId === cartId).length || !state.cartStatus)) {
      state.cartStatus = 'PENDING';
    }
    state.om.push({
      cartId,
      barcode: row.barcode,
      itemReservationStatus: 'RESERVED_FOR_CART',
      expiresAt,
    });
    save(state);
    return {
      result: 'SUCCESS',
      cartId,
      barcode: row.barcode,
      cartStatus: cartId === state.cartId ? state.cartStatus : 'PENDING',
      customerId: cartId === state.cartId ? state.customerId : null,
      itemReservationStatus: 'RESERVED_FOR_CART',
      expiresAt,
    };
  }

  function addToCart(sku, gross, metal, cartId) {
    if (state.flags.failAddToCartTechnical) {
      state.flags.failAddToCartTechnical = false;
      save(state);
      return {
        result: 'ERROR',
        cartId,
        sku,
        grossWeightGrams: gross,
        metalWeightGrams: metal,
        customerId: state.customerId,
        reason: 'TECHNICAL',
      };
    }
    const row = firstAvailableOfCombo(sku, gross, metal);
    if (!row) {
      return {
        result: 'FAILURE',
        cartId,
        sku,
        grossWeightGrams: gross,
        metalWeightGrams: metal,
        customerId: state.customerId,
        reason: 'NO_AVAILABLE_PIECE',
      };
    }
    return holdPiece(row, cartId);
  }

  function reserveByBarcode(barcode, cartId) {
    const row = barcodeRow(barcode);
    if (!row || row.sold || row.reservationStatus !== 'available' || row.salePriceInr == null) {
      return {
        result: 'FAILURE',
        cartId,
        barcode,
        customerId: state.customerId,
        reason: 'BARCODE_UNAVAILABLE',
      };
    }
    return holdPiece(row, cartId);
  }

  function reserve(barcode, cartId) {
    return reserveByBarcode(barcode, cartId);
  }

  function tryRereserve(barcode, cartId) {
    const row = barcodeRow(barcode);
    if (!row || row.sold || row.reservationStatus !== 'available') return false;
    row.reservationStatus = 'reserved';
    const assoc = state.om.find((a) => a.cartId === cartId && a.barcode === barcode);
    if (assoc) {
      assoc.itemReservationStatus = 'RESERVED_FOR_CART';
      assoc.expiresAt = addMs(state.clock, HOLD_MS);
    }
    return true;
  }

  function alignCartExpiries(cartId, referenceBarcode) {
    const ref = state.om.find((a) => a.cartId === cartId && a.barcode === referenceBarcode);
    if (!ref) return { result: 'ALIGNED', unheld: [] };
    const unheld = [];
    state.om.forEach((a) => {
      if (a.cartId !== cartId || a.barcode === referenceBarcode) return;
      if (!isExpired(a.expiresAt) && a.itemReservationStatus !== 'UNRESERVED') {
        a.expiresAt = ref.expiresAt;
        return;
      }
      const ok = tryRereserve(a.barcode, cartId);
      if (ok) {
        a.expiresAt = ref.expiresAt;
        a.itemReservationStatus = 'RESERVED_FOR_CART';
      } else {
        a.itemReservationStatus = 'UNRESERVED';
        unheld.push(a.barcode);
      }
    });
    save(state);
    return { result: unheld.length ? 'ALIGNED_WITH_UNHELD' : 'ALIGNED', unheld };
  }

  function lineFromBarcode(code, expiresAt) {
    const b = barcodeRow(code);
    const st = storeMeta(b ? b.storeCode : '101');
    const prices = priceFields(code);
    return {
      handle: HANDLE,
      title: PRODUCTS[HANDLE].title,
      sku: b ? b.sku : 'NAGAM-22K-5G',
      barcode: code,
      price: b && b.salePriceInr != null ? b.salePriceInr : 0,
      image: b && b.sku === 'NAGAM-22K-3G' ? 'assets/2ndimage.webp' : 'assets/1stimage.webp',
      weight: b ? b.grossWeightGrams : 0,
      delivery: st.delivery,
      expiresAt: expiresAt || null,
      ...prices,
    };
  }

  function addShopifyLine(item) {
    if (state.flags.failShopifyAttempts > 0) {
      state.flags.failShopifyAttempts -= 1;
      save(state);
      return { ok: false };
    }
    state.lines.push({
      handle: HANDLE,
      title: PRODUCTS[HANDLE].title,
      sku: item.sku,
      barcode: item.barcode,
      price: item.salePriceInr,
      image: item.sku === 'NAGAM-22K-3G' ? 'assets/2ndimage.webp' : 'assets/1stimage.webp',
      weight: item.grossWeightGrams,
      delivery: item.estimatedDelivery,
      expiresAt: item.expiresAt,
      ...priceFields(item.barcode),
    });
    state.isModified = true;
    save(state);
    return { ok: true };
  }

  function weHold(barcode) {
    return state.om.some(
      (a) =>
        a.barcode === barcode &&
        a.cartId === state.cartId &&
        (a.itemReservationStatus === 'RESERVED_FOR_CART' ||
          a.itemReservationStatus === 'RESERVED_FOR_CHECKOUT'),
    );
  }

  function dropOmAndLine(barcode) {
    const row = barcodeRow(barcode);
    if (row && row.reservationStatus === 'reserved' && weHold(barcode)) {
      row.reservationStatus = 'available';
    }
    state.om = state.om.filter((a) => !(a.cartId === state.cartId && a.barcode === barcode));
    state.lines = state.lines.filter((l) => l.barcode !== barcode);
    if (!state.om.filter((a) => a.cartId === state.cartId).length) {
      state.cartStatus = state.cartStatus === 'CHECKOUT_INITIATED' ? state.cartStatus : null;
    }
  }

  function releaseAndRemove(barcode) {
    dropOmAndLine(barcode);
    save(state);
  }

  function removeFromCart(barcode) {
    if (state.flags.failGiveBack) {
      state.flags.failGiveBack = false;
      save(state);
      return {
        result: 'FAILURE',
        cartId: state.cartId,
        barcode,
        reason: 'TECHNICAL',
      };
    }
    return releaseItem(barcode);
  }

  function includeVariant104() {
    if (state.inventory.some((b) => b.barcode === 'BC-104')) return;
    state.inventory.push({
      ...BARCODE_104,
      reservationStatus: 'available',
      sold: false,
    });
  }

  function releaseItem(barcode) {
    if (state.cartStatus === 'CHECKOUT_INITIATED') {
      return {
        result: 'FAILURE',
        cartId: state.cartId,
        barcode,
        reason: 'CHECKOUT_INITIATED',
      };
    }
    const row = barcodeRow(barcode);
    if (row && row.reservationStatus === 'reserved' && weHold(barcode)) {
      row.reservationStatus = 'available';
    }
    state.om = state.om.filter((a) => !(a.cartId === state.cartId && a.barcode === barcode));
    const shopifyRemoved = !state.flags.failShopifyRemove;
    if (shopifyRemoved) {
      state.lines = state.lines.filter((l) => l.barcode !== barcode);
    } else {
      state.flags.failShopifyRemove = false;
    }
    state.isModified = true;
    if (!state.om.filter((a) => a.cartId === state.cartId).length && shopifyRemoved) {
      state.cartStatus = null;
    }
    save(state);
    return {
      result: 'SUCCESS',
      cartId: state.cartId,
      barcode,
      shopifyRemoved,
    };
  }

  function reconcileShopifyToOm() {
    const ours = state.om.filter((a) => a.cartId === state.cartId);
    const codes = new Set(ours.map((a) => a.barcode));
    state.lines = state.lines.filter((l) => codes.has(l.barcode));
    ours.forEach((a) => {
      if (!state.lines.some((l) => l.barcode === a.barcode)) {
        state.lines.push(lineFromBarcode(a.barcode, a.expiresAt));
      } else {
        const line = state.lines.find((l) => l.barcode === a.barcode);
        line.expiresAt = a.expiresAt;
        Object.assign(line, priceFields(a.barcode));
        if (priceFields(a.barcode).salePriceInr != null) {
          line.price = priceFields(a.barcode).salePriceInr;
        }
      }
    });
  }

  function getCartDetails(autoRenew) {
    if (state.cartStatus === 'CHECKOUT_INITIATED') {
      const payload = {
        result: 'ERROR',
        cartId: state.cartId,
        cartStatus: 'CHECKOUT_INITIATED',
        customerId: state.customerId,
        items: [],
      };
      state.lastCheck = { result: 'ERROR', checkoutOn: false, message: 'Cart is locked for payment.' };
      save(state);
      return payload;
    }
    if (state.flags.pageNote === 'error-other') {
      const payload = {
        result: 'ERROR',
        cartId: state.cartId,
        cartStatus: state.cartStatus || 'PENDING',
        customerId: state.customerId,
        items: [],
        reason: 'OI-23',
      };
      state.lastCheck = { result: 'ERROR', checkoutOn: false, message: 'ERROR for a cause other than back-from-pay (OI-23).' };
      save(state);
      return payload;
    }

    const ours = state.om.filter((a) => a.cartId === state.cartId);
    if (autoRenew) {
      ours.forEach((a) => {
        const live =
          a.itemReservationStatus === 'RESERVED_FOR_CART' && a.expiresAt && !isExpired(a.expiresAt);
        if (live) return;
        if ((state.flags.stealOnRenew || []).includes(a.barcode)) {
          stealForOtherCart([a.barcode]);
          a.itemReservationStatus = 'UNRESERVED';
          a.expiresAt = null;
          return;
        }
        const ok = tryRereserve(a.barcode, state.cartId);
        if (ok) {
          a.itemReservationStatus = 'RESERVED_FOR_CART';
          a.expiresAt = addMs(state.clock, HOLD_MS);
        } else {
          a.itemReservationStatus = 'UNRESERVED';
          a.expiresAt = null;
        }
      });
    }

    reconcileShopifyToOm();

    const items = state.om
      .filter((a) => a.cartId === state.cartId)
      .map((a) => ({
        barcode: a.barcode,
        itemReservationStatus: a.itemReservationStatus,
        expiresAt: a.expiresAt,
        ...priceFields(a.barcode),
      }));
    const unheld = items.filter((i) => i.itemReservationStatus !== 'RESERVED_FOR_CART' && i.itemReservationStatus !== 'RESERVED_FOR_CHECKOUT');
    const result = items.length && !unheld.length ? 'SUCCESS' : items.length ? 'FAILURE' : 'SUCCESS';
    if (result === 'SUCCESS') state.isModified = false;
    state.lastCheck = {
      result,
      checkoutOn: result === 'SUCCESS' && state.lines.length > 0 && !unheld.length,
      message:
        result === 'FAILURE'
          ? 'One or more pieces are no longer held. Checkout stays off.'
          : '',
    };
    const payload = {
      result,
      cartId: state.cartId,
      cartStatus: state.cartStatus || 'PENDING',
      customerId: state.customerId,
      items,
    };
    save(state);
    return payload;
  }

  function revertCheckout() {
    if (state.cartStatus !== 'CHECKOUT_INITIATED') {
      return { result: 'UNSPECIFIED', cartId: state.cartId, cartStatus: state.cartStatus, customerId: state.customerId };
    }
    state.cartStatus = 'PENDING';
    state.om.forEach((a) => {
      if (a.cartId === state.cartId && a.itemReservationStatus === 'RESERVED_FOR_CHECKOUT') {
        a.itemReservationStatus = 'RESERVED_FOR_CART';
        delete a.lockedOriginalPriceInr;
        delete a.lockedSalePriceInr;
        delete a.lockedBoardRateTag;
      }
    });
    save(state);
    return {
      result: 'SUCCESS',
      cartId: state.cartId,
      cartStatus: 'PENDING',
      customerId: state.customerId,
      items: state.om
        .filter((a) => a.cartId === state.cartId)
        .map((a) => ({
          barcode: a.barcode,
          itemReservationStatus: a.itemReservationStatus,
          expiresAt: a.expiresAt,
        })),
    };
  }

  function initiateCheckout() {
    if (!state.customerId) {
      return {
        result: 'FAILURE',
        cartId: state.cartId,
        customerId: null,
        reason: 'NO_CUSTOMER_ID',
      };
    }
    state.cartStatus = 'CHECKOUT_INITIATED';
    state.om.forEach((a) => {
      if (a.cartId === state.cartId && a.itemReservationStatus === 'RESERVED_FOR_CART') {
        a.itemReservationStatus = 'RESERVED_FOR_CHECKOUT';
        const live = priceFields(a.barcode);
        a.lockedOriginalPriceInr = live.originalPriceInr;
        a.lockedSalePriceInr = live.salePriceInr;
        a.lockedBoardRateTag = 'BR-2026-09-21-10';
      }
    });
    save(state);
    return {
      result: 'SUCCESS',
      cartId: state.cartId,
      cartStatus: 'CHECKOUT_INITIATED',
      customerId: state.customerId,
      items: state.om
        .filter((a) => a.cartId === state.cartId)
        .map((a) => ({
          barcode: a.barcode,
          itemReservationStatus: a.itemReservationStatus,
          lockedOriginalPriceInr: a.lockedOriginalPriceInr,
          lockedSalePriceInr: a.lockedSalePriceInr,
          lockedBoardRateTag: a.lockedBoardRateTag,
        })),
    };
  }

  function hasAlchemyCart() {
    return !!(state.cartStatus || state.om.some((a) => a.cartId === state.cartId));
  }

  function updateCart(customerId) {
    state.signedIn = true;
    state.shopperId = customerId;
    if (!hasAlchemyCart()) {
      save(state);
      return { invoked: false, customerId: null };
    }
    state.customerId = customerId;
    save(state);
    return {
      result: 'SUCCESS',
      cartId: state.cartId,
      customerId,
      cartStatus: state.cartStatus,
      items: state.om
        .filter((a) => a.cartId === state.cartId)
        .map((a) => ({
          barcode: a.barcode,
          itemReservationStatus: a.itemReservationStatus,
          expiresAt: a.expiresAt,
        })),
    };
  }

  function after01() {
    const r = barcodeRow('BC-101');
    r.reservationStatus = 'reserved';
    state.cartStatus = 'PENDING';
    state.clock = CLOCK_SEED;
    state.pincode = '560001';
    state.om = [
      {
        cartId: CART_ID,
        barcode: 'BC-101',
        itemReservationStatus: 'RESERVED_FOR_CART',
        expiresAt: '2026-09-21T10:15:00+05:30',
      },
    ];
    state.lines = [
      {
        handle: HANDLE,
        title: PRODUCTS[HANDLE].title,
        sku: 'NAGAM-22K-5G',
        barcode: 'BC-101',
        price: 46100,
        originalPriceInr: 48200,
        salePriceInr: 46100,
        metalValueInr: 37700,
        stoneDiamondValueInr: 0,
        makingChargeAmountInr: 10500,
        discountPercent: 20,
        discountAmountInr: 2100,
        image: 'assets/1stimage.webp',
        weight: 5.1,
        delivery: '4 days',
        expiresAt: '2026-09-21T10:15:00+05:30',
      },
    ];
    state.isModified = true;
    state.customerId = null;
    state.signedIn = false;
    state.shopperId = null;
  }

  function afterAuth01() {
    after01();
    state.signedIn = true;
    state.shopperId = 'cust_42';
    state.customerId = 'cust_42';
    state.isModified = false;
  }

  function afterPrc03() {
    const bump = {
      'BC-101': { originalPriceInr: 49200, salePriceInr: 47100, metalValueInr: 38700 },
      'BC-102': { originalPriceInr: 49400, salePriceInr: 47300, metalValueInr: 38900 },
      'BC-201': { originalPriceInr: 29900, salePriceInr: 28640, metalValueInr: 23600 },
    };
    state.inventory.forEach((b) => {
      if (b.barcode === 'BC-103') {
        b.reservationStatus = 'error';
        b.originalPriceInr = null;
        b.salePriceInr = null;
        return;
      }
      const next = bump[b.barcode];
      if (next) Object.assign(b, next);
    });
  }

  function after07() {
    after01();
    const r = barcodeRow('BC-102');
    r.reservationStatus = 'reserved';
    state.clock = '2026-09-21T10:05:00+05:30';
    state.om = [
      {
        cartId: CART_ID,
        barcode: 'BC-101',
        itemReservationStatus: 'RESERVED_FOR_CART',
        expiresAt: '2026-09-21T10:20:00+05:30',
      },
      {
        cartId: CART_ID,
        barcode: 'BC-102',
        itemReservationStatus: 'RESERVED_FOR_CART',
        expiresAt: '2026-09-21T10:20:00+05:30',
      },
    ];
    state.lines = [
      lineFromBarcode('BC-101', '2026-09-21T10:20:00+05:30'),
      lineFromBarcode('BC-102', '2026-09-21T10:20:00+05:30'),
    ];
    state.isModified = true;
  }

  function after08() {
    after07();
    state.clock = '2026-09-21T10:16:00+05:30';
    stealForOtherCart(['BC-101']);
    const assoc = state.om.find((a) => a.cartId === CART_ID && a.barcode === 'BC-101');
    assoc.itemReservationStatus = 'UNRESERVED';
    assoc.expiresAt = null;
    state.lines[0].expiresAt = null;
  }

  function afterCo01() {
    afterAuth01();
    state.clock = '2026-09-21T10:08:00+05:30';
    state.cartStatus = 'CHECKOUT_INITIATED';
    state.om[0].itemReservationStatus = 'RESERVED_FOR_CHECKOUT';
    state.om[0].lockedOriginalPriceInr = 48200;
    state.om[0].lockedSalePriceInr = 46100;
    state.om[0].lockedBoardRateTag = 'BR-2026-09-21-10';
    state.isModified = false;
  }

  function afterOmOnly() {
    after01();
    state.lines = [];
    state.isModified = true;
  }

  function afterSweep() {
    after01();
    state.clock = '2026-09-21T10:16:00+05:30';
    const row = barcodeRow('BC-101');
    row.reservationStatus = 'available';
    state.om = [];
    state.cartStatus = null;
  }

  function applyScenario(id) {
    state = emptyState();
    state.scenarioId = id;
    const flags = state.flags;
    const meta = SCENARIOS.find((s) => s.id === id);
    if (meta && meta.land === 'cart') flags.autoValidateCart = true;

    switch (id) {
      case 'S-ATC-00':
        break;
      case 'S-ATC-01':
        state.pincode = '560001';
        break;
      case 'S-ATC-02':
        after01();
        break;
      case 'S-ATC-03':
        state.pincode = '';
        break;
      case 'S-ATC-04':
        flags.autoOpenPopup = true;
        flags.stealOnConfirm = 'selected';
        break;
      case 'S-ATC-05':
        flags.autoOpenPopup = true;
        break;
      case 'S-ATC-06':
        flags.failShopifyAttempts = 1;
        break;
      case 'S-ATC-07':
        after01();
        state.clock = '2026-09-21T10:05:00+05:30';
        break;
      case 'S-ATC-08':
        after01();
        state.clock = '2026-09-21T10:16:00+05:30';
        break;
      case 'S-ATC-09':
        flags.autoOpenPopup = true;
        flags.stealOnConfirm = 'all-5g';
        break;
      case 'S-ATC-10':
        stealForOtherCart(['BC-101', 'BC-102', 'BC-103']);
        flags.pageNote = 'empty-candidates';
        break;
      case 'S-ATC-11':
        afterPrc03();
        flags.pageNote = 'error-omitted';
        break;
      case 'S-ATC-12':
        includeVariant104();
        flags.shadowOtherCart = true;
        break;
      case 'S-ATC-13':
        includeVariant104();
        flags.failShopifyAttempts = 2;
        break;
      case 'S-ATC-14':
        flags.failShopifyAttempts = 2;
        flags.failGiveBack = true;
        break;
      case 'S-ATC-15':
        flags.autoOpenPopup = true;
        flags.failAddToCartTechnical = true;
        break;
      case 'S-PLP-01':
        break;
      case 'S-PLP-02':
        flags.pageNote = 'search-fields';
        break;
      case 'S-PDP-01':
        flags.pageNote = 'pdp-switch';
        break;
      case 'S-AUTH-01':
        after01();
        flags.autoValidateCart = true;
        flags.pageNote = 'login-with-cart';
        break;
      case 'S-AUTH-02':
        state.signedIn = true;
        state.shopperId = 'cust_42';
        flags.pageNote = 'signed-in-first-add';
        break;
      case 'S-AUTH-03':
        flags.pageNote = 'login-no-cart';
        break;
      case 'S-CART-01':
      case 'S-REM-01':
      case 'S-CO-05':
        after01();
        break;
      case 'S-CO-01':
        afterAuth01();
        break;
      case 'S-CART-02':
        afterOmOnly();
        break;
      case 'S-CART-03':
      case 'S-CART-04':
        after08();
        break;
      case 'S-CO-02':
        after08();
        state.signedIn = true;
        state.shopperId = 'cust_42';
        state.customerId = 'cust_42';
        break;
      case 'S-CART-05':
        afterCo01();
        break;
      case 'S-CART-06':
        after07();
        state.clock = '2026-09-21T10:21:00+05:30';
        flags.stealOnRenew = ['BC-101'];
        break;
      case 'S-CART-07':
        after01();
        flags.pageNote = 'revert-not-locked';
        flags.autoValidateCart = false;
        break;
      case 'S-CART-08':
        after01();
        flags.pageNote = 'error-other';
        flags.autoValidateCart = false;
        break;
      case 'S-CART-09':
        afterSweep();
        flags.pageNote = 'after-sweep';
        break;
      case 'S-REM-02':
        afterCo01();
        flags.skipAutoRevert = true;
        flags.autoValidateCart = false;
        state.lastCheck = { result: 'ERROR', checkoutOn: false, message: 'Cart is locked for payment.' };
        break;
      case 'S-REM-03':
        after01();
        flags.failShopifyRemove = true;
        break;
      case 'S-CO-03':
        afterCo01();
        flags.skipAutoRevert = true;
        flags.autoValidateCart = false;
        state.lastCheck = { result: 'ERROR', checkoutOn: false, message: 'Cart is locked for payment.' };
        break;
      case 'S-CO-04':
        afterCo01();
        flags.autoValidateCart = false;
        flags.pageNote = 'pay-outcomes';
        break;
      case 'S-OFR-01':
        after01();
        flags.autoValidateCart = false;
        flags.pageNote = 'offers-retired';
        break;
      default:
        break;
    }
    save(state);
  }

  function landUrl(id) {
    const meta = SCENARIOS.find((s) => s.id === (id || state.scenarioId));
    if (meta && meta.land === 'plp') return 'plp.html';
    if (meta && meta.land === 'plp-auto-load') return 'plp-auto-load.html';
    if (meta && meta.land === 'plp-sticky-filter') return 'plp-sticky-filter.html';
    if (!meta || meta.land === 'pdp') return 'pdp.html?handle=' + HANDLE + '&sku=NAGAM-22K-5G';
    if (meta.land === 'checkout') return 'checkout.html';
    if (meta.land === 'offers') return 'offers.html';
    return 'cart.html';
  }

  function readCart() {
    return state.lines.map((line) => {
      const om = state.om.find((a) => a.cartId === state.cartId && a.barcode === line.barcode);
      return {
        ...line,
        quantity: 1,
        variantId: line.barcode,
        id: HANDLE,
        optionLabel: line.barcode,
        unreserved: om
          ? om.itemReservationStatus === 'UNRESERVED' || (om.expiresAt && isExpired(om.expiresAt))
          : !om,
        itemStatus: om ? om.itemReservationStatus : 'NO_OM_ROW',
        expiresAt: om ? om.expiresAt : line.expiresAt,
        lockedSalePriceInr: om ? om.lockedSalePriceInr : null,
        lockedOriginalPriceInr: om ? om.lockedOriginalPriceInr : null,
        lockedBoardRateTag: om ? om.lockedBoardRateTag : null,
      };
    });
  }

  function getCount() {
    return state.lines.length;
  }

  function getSubtotal() {
    return state.lines.reduce((sum, line) => sum + line.price, 0);
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
    el._timer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function debugSnapshot() {
    return {
      scenarioId: state.scenarioId,
      clock: state.clock,
      pincode: state.pincode || '(none)',
      signedIn: state.signedIn ? state.shopperId || 'yes' : 'guest',
      customerId: state.customerId || '(null)',
      cartStatus: state.cartStatus || '(none)',
      isModified: state.isModified,
      inventory: state.inventory.map((b) => b.barcode + '=' + b.reservationStatus).join(', '),
      om: state.om
        .map((a) => a.barcode + '@' + a.cartId + ' ' + a.itemReservationStatus + ' → ' + (a.expiresAt ? a.expiresAt.slice(11, 16) : '—'))
        .join(' | ') || '(empty)',
      lines: state.lines.map((l) => l.barcode).join(', ') || '(empty)',
      lastCheck: state.lastCheck ? JSON.stringify(state.lastCheck) : '(none)',
    };
  }

  global.DemoCart = {
    PRODUCTS,
    HANDLE,
    CART_ID,
    SCENARIOS,
    formatINR,
    readCart,
    getCount,
    getSubtotal,
    updateBadges,
    showToast,
    clearCart() {
      state.lines = [];
      save(state);
    },
    removeItem(barcode) {
      return releaseItem(barcode);
    },
    checkoutEnabled() {
      return !!(state.lastCheck && state.lastCheck.checkoutOn);
    },
    isIdentified() {
      return !!state.customerId;
    },
  };

  global.DemoAtc = {
    HANDLE,
    SKU_DEFAULT: 'NAGAM-22K-5G',
    SCENARIOS,
    getState,
    save: () => save(state),
    applyScenario,
    landUrl,
    skuInCart,
    weightKey,
    firstAvailableOfCombo,
    availableUniqueWeights,
    availableBarcodes,
    sortCandidates,
    addToCart,
    reserveByBarcode,
    reserve,
    removeFromCart,
    includeVariant104,
    updateCart,
    hasAlchemyCart,
    priceFields,
    alignCartExpiries,
    addShopifyLine,
    stealForOtherCart,
    dropOmAndLine,
    getCartDetails,
    releaseItem,
    revertCheckout,
    initiateCheckout,
    debugSnapshot,
    updateBadges,
    pdpUrl() {
      return landUrl('S-ATC-00');
    },
  };

  document.addEventListener('DOMContentLoaded', updateBadges);
})(window);

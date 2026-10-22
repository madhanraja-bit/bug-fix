/**
 * API bodies shown on Play → Contract. Keep in sync with contracts/play-switcher-api.md
 */
(function (global) {
  const NOTE =
    'Hydrogen live cartId is gid://shopify/Cart/… — samples use c_789. ' +
    'VARIANT_5G = Shopify merchandise GID for NAGAM-22K-5G (MAP-01). ' +
    'C-HY-01 is AvailableUniqueWeights (no barcode). C-HY-02 AddToCart is SKU + weights. ' +
    'Alchemy path/verb not signed. Hydrogen today: POST /cart LinesAdd only.';

  const HY_LINE = (barcode) => ({
    action: 'LinesAdd',
    inputs: {
      lines: [
        {
          merchandiseId: 'VARIANT_5G',
          quantity: 1,
          attributes: [
            { key: 'line_uid', value: 'uid-…' },
            { key: 'barcode', value: barcode },
          ],
        },
      ],
    },
  });

  const AB_REQ = { sku: 'NAGAM-22K-5G', customerPincode: '560001' };

  const AB_THREE = {
    sku: 'NAGAM-22K-5G',
    customerPincode: '560001',
    candidates: [
      { grossWeightGrams: 5.1, metalWeightGrams: 4.9, salePriceInr: 46100 },
      { grossWeightGrams: 5.12, metalWeightGrams: 4.92, salePriceInr: 46300 },
      { grossWeightGrams: 5.4, metalWeightGrams: 5.2, salePriceInr: 48700 },
    ],
  };

  const ATC_101 = {
    cartId: 'c_789',
    sku: 'NAGAM-22K-5G',
    grossWeightGrams: 5.1,
    metalWeightGrams: 4.9,
  };
  const ATC_102 = {
    cartId: 'c_789',
    sku: 'NAGAM-22K-5G',
    grossWeightGrams: 5.12,
    metalWeightGrams: 4.92,
  };
  const ATC_103 = {
    cartId: 'c_789',
    sku: 'NAGAM-22K-5G',
    grossWeightGrams: 5.4,
    metalWeightGrams: 5.2,
  };

  const AB_NO_101 = {
    sku: 'NAGAM-22K-5G',
    customerPincode: '560001',
    candidates: AB_THREE.candidates.filter((c) => c.grossWeightGrams !== 5.1),
  };

  const AB_EMPTY = { sku: 'NAGAM-22K-5G', customerPincode: '560001', candidates: [] };

  const P101 = {
    originalPriceInr: 48200,
    salePriceInr: 46100,
    metalValueInr: 37700,
    stoneDiamondValueInr: 0,
    makingChargeAmountInr: 10500,
    discountPercent: 20,
    discountAmountInr: 2100,
  };
  const P102 = {
    originalPriceInr: 48400,
    salePriceInr: 46300,
    metalValueInr: 37900,
    stoneDiamondValueInr: 0,
    makingChargeAmountInr: 10500,
    discountPercent: 20,
    discountAmountInr: 2100,
  };
  const P103 = {
    originalPriceInr: 51000,
    salePriceInr: 48700,
    metalValueInr: 40500,
    stoneDiamondValueInr: 0,
    makingChargeAmountInr: 10500,
    discountPercent: 20,
    discountAmountInr: 2300,
  };

  const RES_OK_101 = {
    result: 'SUCCESS',
    cartId: 'c_789',
    barcode: 'BC-101',
    cartStatus: 'PENDING',
    customerId: null,
    itemReservationStatus: 'RESERVED_FOR_CART',
    expiresAt: '2026-09-21T10:15:00+05:30',
  };

  const RES_OK_102 = {
    result: 'SUCCESS',
    cartId: 'c_789',
    barcode: 'BC-102',
    cartStatus: 'PENDING',
    customerId: null,
    itemReservationStatus: 'RESERVED_FOR_CART',
    expiresAt: '2026-09-21T10:20:00+05:30',
  };

  const AB_ATC11 = {
    sku: 'NAGAM-22K-5G',
    customerPincode: '560001',
    candidates: [
      { grossWeightGrams: 5.1, metalWeightGrams: 4.9, salePriceInr: 47100 },
      { grossWeightGrams: 5.12, metalWeightGrams: 4.92, salePriceInr: 47300 },
    ],
  };

  const RES_FAIL = {
    result: 'FAILURE',
    cartId: 'c_789',
    sku: 'NAGAM-22K-5G',
    grossWeightGrams: 5.1,
    metalWeightGrams: 4.9,
    reason: 'NO_AVAILABLE_PIECE',
  };

  function block(title, request, response, extra) {
    return Object.assign({ title, request, response }, extra || {});
  }

  const PLAY = {
    'S-ATC-00': {
      title: 'Seed',
      summary: 'No HTTP. Seed / Given only. Open the PDP and click through.',
      calls: [],
    },
    'S-ATC-01': {
      title: 'First add',
      summary: 'Guest. C-HY-01 AvailableUniqueWeights → C-HY-02 AddToCart (SKU + weights) SUCCESS returns BC-101 → Shopify LinesAdd. CustomerId stays null. No Align.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_THREE, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'Lightest first. No barcode',
        }),
        block('AddToCart', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'ReserveByWeights. CustomerId not sent',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-101'), {
          ok: true,
          note: 'one row, qty 1, attributes line_uid + returned barcode',
        }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'After SUCCESS only',
        }),
      ],
    },
    'S-ATC-02': {
      title: 'Duplicate SKU',
      summary: 'Hydrogen dialog only (FR-CART-12). Decline = no API. Confirm continues without the held 5.10 / 4.90 combination — finish on S-ATC-07.',
      calls: [],
    },
    'S-ATC-03': {
      title: 'No pincode',
      summary: 'Guest pincode prompt is Hydrogen UI (6-digit). Signed-in default pincode is a different path. Then the same three calls as S-ATC-01.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_THREE, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'After pincode saved. Pin not used to rank',
        }),
        block('AddToCart', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'ReserveByWeights. CustomerId not sent',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-101'), { ok: true }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'After SUCCESS only',
        }),
      ],
    },
    'S-ATC-04': {
      title: 'Combination taken',
      summary: 'AddToCart FAILURE (NO_AVAILABLE_PIECE). No Shopify add. Refresh AvailableUniqueWeights without 5.10 / 4.90.',
      calls: [
        block('AddToCart', ATC_101, RES_FAIL, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold refused',
        }),
        block('AvailableUniqueWeights refresh', AB_REQ, AB_NO_101, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'Read-only',
        }),
      ],
    },
    'S-ATC-05': {
      title: 'Sort / select',
      summary: 'No HTTP. Price ascending ↔ descending on the list already in memory. Selection stays on 5.12 / 4.92.',
      calls: [],
    },
    'S-ATC-06': {
      title: 'Shopify retry',
      summary: 'AddToCart SUCCESS. First LinesAdd fails; one retry succeeds (UC-CART-003 3a). No RemoveFromCart.',
      calls: [
        block('AddToCart', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-101'), {
          ok: false,
          errors: [{ message: 'This product is out of stock' }],
        }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'First attempt fails',
        }),
        block('POST /cart LinesAdd retry', HY_LINE('BC-101'), { ok: true }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: '3a — one retry',
        }),
      ],
    },
    'S-ATC-07': {
      title: 'Second piece',
      summary: 'AddToCart 5.12 / 4.92 → returns BC-102 → LinesAdd → AlignCartExpiries ALIGNED. Shared expiry 10:20.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_NO_101, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: '5.10 / 4.90 omitted',
        }),
        block('AddToCart', ATC_102, RES_OK_102, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-102'), { ok: true }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'Second line',
        }),
        block('AlignCartExpiries', { cartId: 'c_789', referenceBarcode: 'BC-102' }, {
          result: 'ALIGNED',
          cartId: 'c_789',
          sharedExpiresAt: '2026-09-21T10:20:00+05:30',
          items: [
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:20:00+05:30' },
            { barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:20:00+05:30' },
          ],
        }, {
          cid: 'C-HY-03',
          party: 'Alchemy · OM',
          verb: 'Silent',
        }),
      ],
    },
    'S-ATC-08': {
      title: 'Sibling lapsed',
      summary: 'Align returns ALIGNED_WITH_UNHELD. No add-time toast. Both Shopify lines stay.',
      calls: [
        block('AddToCart 5.12 / 4.92', ATC_102, {
          result: 'SUCCESS',
          cartId: 'c_789',
          barcode: 'BC-102',
          cartStatus: 'PENDING',
          customerId: null,
          itemReservationStatus: 'RESERVED_FOR_CART',
          expiresAt: '2026-09-21T10:31:00+05:30',
        }, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-102'), { ok: true }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'Second line stays',
        }),
        block('AlignCartExpiries', { cartId: 'c_789', referenceBarcode: 'BC-102' }, {
          result: 'ALIGNED_WITH_UNHELD',
          cartId: 'c_789',
          sharedExpiresAt: '2026-09-21T10:31:00+05:30',
          items: [
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:31:00+05:30' },
            { barcode: 'BC-101', itemReservationStatus: 'UNRESERVED', expiresAt: null },
          ],
        }, {
          cid: 'C-HY-03',
          party: 'Alchemy · OM',
          verb: 'Silent',
        }),
      ],
    },
    'S-ATC-09': {
      title: 'SKU empty at confirm',
      summary: 'AddToCart FAILURE then empty candidates. Native unavailable. Copy open (OI-08 / OI-09).',
      calls: [
        block('AddToCart', ATC_101, RES_FAIL, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold refused',
        }),
        block('AvailableUniqueWeights', AB_REQ, AB_EMPTY, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'Empty list, HTTP success',
        }),
      ],
    },
    'S-ATC-10': {
      title: 'Empty candidates',
      summary: 'Only AvailableUniqueWeights []. Not an Alchemy error. No AddToCart. Display open (CART-001 3a).',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_EMPTY, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'Empty list, HTTP success',
        }),
      ],
    },
    'S-ATC-11': {
      title: 'ERROR omitted',
      summary: 'AvailableUniqueWeights withholds 5.40 / 5.20 (its only piece is ERROR). Remaining two combinations at the S-PRC-03 sale figures. Nothing held.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_ATC11, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: '5.40 / 5.20 absent',
        }),
      ],
    },
    'S-ATC-12': {
      title: 'Same combo, two carts',
      summary: 'Both AddToCart calls for 5.10 / 4.90 succeed. c_789 gets BC-101; c_999 gets BC-104. Same price.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_THREE, {
          cid: 'C-HY-01',
          party: 'Alchemy · Inventory',
          verb: 'One row for 5.10 / 4.90 at 46100',
        }),
        block('AddToCart c_789', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'First piece of the combo',
        }),
        block('AddToCart c_999', {
          cartId: 'c_999',
          sku: 'NAGAM-22K-5G',
          grossWeightGrams: 5.1,
          metalWeightGrams: 4.9,
        }, {
          result: 'SUCCESS',
          cartId: 'c_999',
          barcode: 'BC-104',
          cartStatus: 'PENDING',
          customerId: null,
          itemReservationStatus: 'RESERVED_FOR_CART',
          expiresAt: '2026-09-21T10:15:00+05:30',
        }, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Next piece of the same combo',
        }),
      ],
    },
    'S-ATC-13': {
      title: 'Give-back and repeat',
      summary: 'Both Shopify adds fail. RemoveFromCart SUCCESS. Repeat AddToCart holds BC-101 again. Repeat LinesAdd succeeds.',
      calls: [
        block('AddToCart', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'First hold',
        }),
        block('POST /cart LinesAdd ×2', HY_LINE('BC-101'), { ok: false }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'Both attempts fail',
        }),
        block('RemoveFromCart', { cartId: 'c_789', barcode: 'BC-101' }, {
          result: 'SUCCESS', cartId: 'c_789', barcode: 'BC-101',
        }, {
          cid: 'C-HY-07',
          party: 'Alchemy · OM',
          verb: 'Give-back. No Shopify line',
        }),
        block('AddToCart repeat', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Same weights. Holds BC-101 again',
        }),
        block('POST /cart LinesAdd', HY_LINE('BC-101'), { ok: true }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'Repeat’s first add succeeds',
        }),
      ],
    },
    'S-ATC-14': {
      title: 'Give-back fails',
      summary: 'Both Shopify adds fail. RemoveFromCart FAILURE. Technical alert, then Cart Page. Piece still held. No Shopify line.',
      calls: [
        block('AddToCart', ATC_101, RES_OK_101, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Hold remains',
        }),
        block('POST /cart LinesAdd ×2', HY_LINE('BC-101'), { ok: false }, {
          cid: 'Shopify',
          party: 'Hydrogen → Shopify',
          verb: 'Both attempts fail',
        }),
        block('RemoveFromCart', { cartId: 'c_789', barcode: 'BC-101' }, {
          result: 'FAILURE', cartId: 'c_789', barcode: 'BC-101', reason: 'TECHNICAL',
        }, {
          cid: 'C-HY-07',
          party: 'Alchemy · OM',
          verb: 'Give-back fails. No second AddToCart',
        }),
      ],
    },
    'S-ATC-15': {
      title: 'AddToCart technical',
      summary: 'AddToCart technical error, not NO_AVAILABLE_PIECE. Alert. Popup stays. Nothing added. OI-34 finding if a lost SUCCESS was held.',
      calls: [
        block('AddToCart', ATC_101, {
          result: 'ERROR',
          cartId: 'c_789',
          sku: 'NAGAM-22K-5G',
          grossWeightGrams: 5.1,
          metalWeightGrams: 4.9,
          reason: 'TECHNICAL',
        }, {
          cid: 'C-HY-02',
          party: 'Alchemy · OM',
          verb: 'Error shape unsigned',
        }),
      ],
    },
    'S-PLP-01': {
      title: 'Listing default',
      summary: 'No HTTP. Hydrogen reads Shopify. Tile is NAGAM-22K-5G at 48700 (SKU aggregate), not BC-101’s 46100.',
      calls: [],
    },
    'S-PLP-02': {
      title: 'Search fields',
      summary: 'Finding. Searchable fields OI-05, facets OI-06. Do not Then a field list from MAP-02.',
      calls: [],
    },
    'S-PDP-01': {
      title: 'Open + switch SKU',
      summary: 'No HTTP. Open on 5g 51000/48700 (Highest / BC-103 breakup). Switch to 3g 28900/27600 on the same page.',
      calls: [],
    },
    'S-AUTH-01': {
      title: 'Login with cart',
      summary: 'C-HY-10 UpdateCart. Holds, expiry and 46100 unchanged. cart_status stays PENDING.',
      calls: [
        block('UpdateCart', { cartId: 'c_789', customerId: 'cust_42' }, {
          result: 'SUCCESS',
          cartId: 'c_789',
          customerId: 'cust_42',
          cartStatus: 'PENDING',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30' }],
        }, { cid: 'C-HY-10', party: 'Alchemy · OM', verb: 'Link only. Inventory/Pricing not called' }),
      ],
    },
    'S-AUTH-02': {
      title: 'Signed-in first add',
      summary: 'Finding. AddToCart does not accept CustomerId. UpdateCart runs only on a later login. No Then.',
      calls: [],
    },
    'S-AUTH-03': {
      title: 'Login, no cart',
      summary: 'Session established. C-HY-10 is not invoked. No Alchemy cart is created.',
      calls: [],
    },
    'S-CART-01': {
      title: 'Checkout on',
      summary: 'GetCart autoRenew=true SUCCESS. Live barcode sale 46100 + breakup (not 48700). Guest Checkout on; lock still needs CustomerId.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS',
          cartId: 'c_789',
          cartStatus: 'PENDING',
          customerId: null,
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30', ...P101 }],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Cart Page load. Live, not locked' }),
      ],
    },
    'S-CART-02': {
      title: 'OM wins',
      summary: 'OM holds BC-101; Shopify jewellery lines none. Hydrogen corrects Shopify to match OM (OI-15 mutation unsigned).',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS',
          cartId: 'c_789',
          cartStatus: 'PENDING',
          customerId: null,
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30', ...P101 }],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Then reconcile Shopify → add line' }),
      ],
    },
    'S-CART-03': {
      title: 'Unheld row',
      summary: 'FAILURE. BC-101 still unheld after renewal. BC-102 kept. Live prices still returned. Checkout off.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'FAILURE',
          cartId: 'c_789',
          cartStatus: 'PENDING',
          customerId: null,
          items: [
            { barcode: 'BC-101', itemReservationStatus: 'UNRESERVED', expiresAt: null, ...P101 },
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:20:00+05:30', ...P102 },
          ],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Renewal of BC-101 fails' }),
      ],
    },
    'S-CART-04': {
      title: 'Resolve flagged',
      summary: 'Same ATC popup. AddToCart 5.40 / 5.20 returns BC-103, add line, restart GetCart. Success → Checkout on.',
      calls: [
        block('AvailableUniqueWeights', AB_REQ, AB_NO_101, { cid: 'C-HY-01', party: 'Alchemy · Inventory', verb: 'Resolve popup' }),
        block('AddToCart', ATC_103, {
          result: 'SUCCESS', cartId: 'c_789', barcode: 'BC-103', cartStatus: 'PENDING', customerId: null,
          itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:31:00+05:30',
        }, { cid: 'C-HY-02', party: 'Alchemy · OM', verb: 'Replacement piece' }),
        block('GetCart restart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: null,
          items: [
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:20:00+05:30', ...P102 },
            { barcode: 'BC-103', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:31:00+05:30', ...P103 },
          ],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Whole cart, not one row' }),
      ],
    },
    'S-CART-05': {
      title: 'Back from pay',
      summary: 'GetCart ERROR → RevertCartCheckout (lock cleared, no expiry bump) → GetCart SUCCESS live price. No customer prompt.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'ERROR', cartId: 'c_789', cartStatus: 'CHECKOUT_INITIATED', customerId: 'cust_42', items: [],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'No renewal' }),
        block('RevertCartCheckout', { cartId: 'c_789' }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30' }],
        }, { cid: 'C-HY-06', party: 'Alchemy · OM', verb: 'Silent; expiry unchanged; locked prices cleared' }),
        block('GetCart again', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30', ...P101 }],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Automatic restart. Live price' }),
      ],
    },
    'S-CART-06': {
      title: 'Partial renew',
      summary: 'FAILURE is not “nothing happened”. BC-102 renewed and kept. BC-101 unheld. Checkout off.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'FAILURE', cartId: 'c_789', cartStatus: 'PENDING', customerId: null,
          items: [
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:36:00+05:30', ...P102 },
            { barcode: 'BC-101', itemReservationStatus: 'UNRESERVED', expiresAt: null, ...P101 },
          ],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Independent renewals' }),
      ],
    },
    'S-CART-07': {
      title: 'Revert not locked',
      summary: 'Finding. Revert when cart is not CHECKOUT_INITIATED — no Then (two tabs / lost ack).',
      calls: [],
    },
    'S-CART-08': {
      title: 'Unbounded restart',
      summary: 'Finding. ERROR for a cause other than back-from-pay (OI-23). Do not Then a retry cap.',
      calls: [],
    },
    'S-CART-09': {
      title: 'After sweep',
      summary: 'Finding. Sweep discarded the OM row. Safer reading: OM empty → drop Shopify line. Flagged-row after sweep is unspecified.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: null, items: [],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'No item for BC-101; no Release call' }),
      ],
    },
    'S-REM-01': {
      title: 'Remove row',
      summary: 'C-HY-07 SUCCESS then Shopify line gone, is_modified, C-HY-04 restarts.',
      calls: [
        block('Release', { cartId: 'c_789', barcode: 'BC-101' }, {
          result: 'SUCCESS', cartId: 'c_789', barcode: 'BC-101',
        }, { cid: 'C-HY-07', party: 'Alchemy · OM', verb: 'Before Shopify remove' }),
        block('GetCart restart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: null, items: [],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Empty cart' }),
      ],
    },
    'S-REM-02': {
      title: 'Remove refused',
      summary: 'Cart CHECKOUT_INITIATED. Release FAILURE before any inventory release. Row stays.',
      calls: [
        block('Release', { cartId: 'c_789', barcode: 'BC-101' }, {
          result: 'FAILURE', cartId: 'c_789', barcode: 'BC-101', reason: 'CHECKOUT_INITIATED',
        }, { cid: 'C-HY-07', party: 'Alchemy · OM', verb: 'Refused; nothing changes' }),
      ],
    },
    'S-REM-03': {
      title: 'Shopify remove fail',
      summary: 'Release SUCCESS. Shopify cartLinesRemove fails. Next C-HY-04 / FR-CART-08 heals (OI-15).',
      calls: [
        block('Release', { cartId: 'c_789', barcode: 'BC-101' }, {
          result: 'SUCCESS', cartId: 'c_789', barcode: 'BC-101',
        }, { cid: 'C-HY-07', party: 'Alchemy · OM', verb: 'Hold gone' }),
        block('Shopify cartLinesRemove', { barcode: 'BC-101' }, { ok: false }, {
          cid: 'Shopify', party: 'Hydrogen → Shopify', verb: 'Fails',
        }),
        block('GetCart heal', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: null, items: [],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'OM empty → drop leftover line' }),
      ],
    },
    'S-CO-01': {
      title: 'Lock + RazorPay',
      summary: 'Already identified. Fresh GetCart SUCCESS (not reused), then InitiateCartCheckout locks 48200/46100, then FR-CO-03 handoff. No payment Then.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30', ...P101 }],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Fresh on this click' }),
        block('InitiateCartCheckout', { cartId: 'c_789' }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'CHECKOUT_INITIATED', customerId: 'cust_42',
          items: [{
            barcode: 'BC-101',
            itemReservationStatus: 'RESERVED_FOR_CHECKOUT',
            lockedOriginalPriceInr: 48200,
            lockedSalePriceInr: 46100,
            lockedBoardRateTag: 'BR-2026-09-21-10',
          }],
        }, { cid: 'C-HY-08', party: 'Alchemy · OM', verb: 'Price lock. OI-24 expiry omitted' }),
      ],
    },
    'S-CO-02': {
      title: 'Revalidate fail',
      summary: 'Checkout click → GetCart FAILURE. No InitiateCartCheckout. Stay on Cart / CART-006.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'FAILURE', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [
            { barcode: 'BC-101', itemReservationStatus: 'UNRESERVED', expiresAt: null, ...P101 },
            { barcode: 'BC-102', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:20:00+05:30', ...P102 },
          ],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'No InitiateCartCheckout' }),
      ],
    },
    'S-CO-03': {
      title: 'Revalidate error',
      summary: 'Checkout click sees CHECKOUT_INITIATED. Same revert + restart as S-CART-05. No new lock.',
      calls: [
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'ERROR', cartId: 'c_789', cartStatus: 'CHECKOUT_INITIATED', customerId: 'cust_42', items: [],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Lock still on' }),
        block('RevertCartCheckout', { cartId: 'c_789' }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30' }],
        }, { cid: 'C-HY-06', party: 'Alchemy · OM', verb: 'Then GetCart again' }),
      ],
    },
    'S-CO-05': {
      title: 'Guest must sign in',
      summary: 'No GetCart yet. UpdateCart (same as S-AUTH-01), then S-CO-01 from the reservation check.',
      calls: [
        block('UpdateCart', { cartId: 'c_789', customerId: 'cust_42' }, {
          result: 'SUCCESS',
          cartId: 'c_789',
          customerId: 'cust_42',
          cartStatus: 'PENDING',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30' }],
        }, { cid: 'C-HY-10', party: 'Alchemy · OM', verb: 'After KalyanIQ return' }),
        block('GetCart', { cartId: 'c_789', autoRenew: true }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'PENDING', customerId: 'cust_42',
          items: [{ barcode: 'BC-101', itemReservationStatus: 'RESERVED_FOR_CART', expiresAt: '2026-09-21T10:15:00+05:30', ...P101 }],
        }, { cid: 'C-HY-04', party: 'Alchemy · OM', verb: 'Resume S-CO-01 step 2' }),
        block('InitiateCartCheckout', { cartId: 'c_789' }, {
          result: 'SUCCESS', cartId: 'c_789', cartStatus: 'CHECKOUT_INITIATED', customerId: 'cust_42',
          items: [{
            barcode: 'BC-101',
            itemReservationStatus: 'RESERVED_FOR_CHECKOUT',
            lockedOriginalPriceInr: 48200,
            lockedSalePriceInr: 46100,
            lockedBoardRateTag: 'BR-2026-09-21-10',
          }],
        }, { cid: 'C-HY-08', party: 'Alchemy · OM', verb: 'Same lock as S-CO-01' }),
      ],
    },
    'S-CO-04': {
      title: 'Pay outcomes',
      summary: 'Finding. Success / Failure / Timeout skipped until FR-CO-04 / OI-16. Handoff page only.',
      calls: [],
    },
    'S-OFR-01': {
      title: 'Offers retired',
      summary: 'Finding. No HTTP. FR-OFR retired in v0.23. Discount is inside synced Sale Price. OI-19 leftover flag.',
      calls: [],
    },
  };

  function toneOf(call) {
    const res = call.response || {};
    if (res.result === 'FAILURE' || res.result === 'ERROR' || res.ok === false) return 'fail';
    if (res.result === 'ALIGNED_WITH_UNHELD') return 'warn';
    if (res.result === 'SUCCESS' || res.result === 'ALIGNED' || res.ok === true) return 'ok';
    return 'info';
  }

  function labelOf(call) {
    const res = call.response || {};
    if (res.result) return res.result;
    if (res.ok === false) return 'FAIL';
    if (res.ok === true) return 'OK';
    if (Array.isArray(res.candidates) && !res.candidates.length) return 'EMPTY';
    if (Array.isArray(res.candidates)) return res.candidates.length + ' rows';
    return '—';
  }

  function pack(id) {
    return PLAY[id] || { title: id, summary: NOTE, calls: [] };
  }

  global.DemoAtcContracts = { PLAY, NOTE, pack, toneOf, labelOf };
})(window);

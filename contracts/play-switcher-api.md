# Play switcher — API contracts (Hydrogen)

Each **Play** option in `ecom-ind-demo` and the calls **`kjj-inecom-hydrogen` must make**. Alchemy JSON is proposed (`C-HY-*`). Path/verb not signed.

**Hydrogen today:** no Alchemy client. Cart is Shopify only (`POST /cart` + `CartForm.ACTIONS.LinesAdd` in `app/routes/($locale).cart.tsx`). Cart id is a Shopify GID (`gid://shopify/Cart/…`). Samples use `c_789` — Alchemy must accept the live string. Lines already get `line_uid` (`app/lib/cart-unique-lines.server.ts`). After AddToCart, Hydrogen keeps the **returned barcode** for `RemoveFromCart` and as a proposed line attribute (not in the app yet). PDP `deliveryPincode` is local React state, not a session fact. Snapshots: Alchemy v0.38 · KJINECOM v0.27. Phase-1 popup has **no barcode, delivery or store** column (`OI-19` deferred).

**SKU → Shopify variant GID** is `MAP-01` (unsigned). Below, `VARIANT_5G` means the merchandise id for `NAGAM-22K-5G`.

Canonical Alchemy files: `kjj-alchemy-docs/requirements/contracts/hydrogen/`.

---

## S-ATC-00 — Seed

**Alchemy:** none. **Shopify:** none.

Given only. Open PDP and click through.

---

## S-ATC-01 — First add

Guest. Gates: no duplicate dialog. Pincode already `560001`. No Align (empty cart). `CustomerId` stays null.

### 1. Alchemy `AvailableUniqueWeights` — [C-HY-01](../../kjj-alchemy-docs/requirements/contracts/hydrogen/available-unique-weights.md)

Hydrogen Inventory. Read-only. Formerly `AvailableBarcodes`. One row per distinct (gross, metal). **No barcode.** Alchemy order is lightest-first. Pincode is accepted, not used to rank in phase 1.

```http
POST {alchemy}/available-unique-weights
```

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001"
}
```

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001",
  "candidates": [
    { "grossWeightGrams": 5.10, "metalWeightGrams": 4.90, "salePriceInr": 46100 },
    { "grossWeightGrams": 5.12, "metalWeightGrams": 4.92, "salePriceInr": 46300 },
    { "grossWeightGrams": 5.40, "metalWeightGrams": 5.20, "salePriceInr": 48700 }
  ]
}
```

Hydrogen **re-sorts by sale price** for the popup (cheapest first). Default selected **5.10 / 4.90**.

### 2. Alchemy `AddToCart` — [C-HY-02](../../kjj-alchemy-docs/requirements/contracts/hydrogen/reserve.md)

Hydrogen → OM. Inventory `ReserveByWeights()` chooses the piece. `CustomerId` is not sent. **No barcode on input.**

```json
{
  "cartId": "c_789",
  "sku": "NAGAM-22K-5G",
  "grossWeightGrams": 5.10,
  "metalWeightGrams": 4.90
}
```

```json
{
  "result": "SUCCESS",
  "cartId": "c_789",
  "barcode": "BC-101",
  "cartStatus": "PENDING",
  "customerId": null,
  "itemReservationStatus": "RESERVED_FOR_CART",
  "expiresAt": "2026-09-21T10:15:00+05:30"
}
```

### 3. Shopify `cartLinesAdd` — Hydrogen `POST /cart`

Only after AddToCart SUCCESS.

```json
{
  "action": "LinesAdd",
  "inputs": {
    "lines": [
      {
        "merchandiseId": "VARIANT_5G",
        "quantity": 1,
        "attributes": [
          { "key": "line_uid", "value": "uid-…" },
          { "key": "barcode", "value": "BC-101" }
        ]
      }
    ]
  }
}
```

Then Hydrogen sets `is_modified = true`. **No** `AlignCartExpiries`.

---

## S-ATC-02 — Duplicate SKU

**Alchemy:** none until the customer confirms. **Shopify:** none on decline.

Hydrogen only: `FR-CART-12` dialog. Decline → stay on PDP.

Confirm → same as S-ATC-01 step 1, but AvailableUniqueWeights **omits 5.10 / 4.90** (its piece is already held). Finishing the second piece is **S-ATC-07**.

---

## S-ATC-03 — No pincode

**Alchemy / Shopify:** none for the prompt itself.

Guest pincode prompt. A signed-in default shipping pincode skips this (`FR-CART-01` BR-7) — not this Given. Hydrogen collects 6-digit pincode. Stored for the session (UCD). **Then identical to S-ATC-01** (AvailableUniqueWeights → AddToCart by weights → LinesAdd).

Abandon prompt: no calls, cart unchanged.

---

## S-ATC-04 — Combination taken

Popup already showed 5.10 / 4.90. Another cart holds the only piece of that combination. Confirm:

### 1. `AddToCart` — FAILURE

```json
{
  "cartId": "c_789",
  "sku": "NAGAM-22K-5G",
  "grossWeightGrams": 5.10,
  "metalWeightGrams": 4.90
}
```

```json
{
  "result": "FAILURE",
  "cartId": "c_789",
  "reason": "NO_AVAILABLE_PIECE"
}
```

No OM row for `c_789`. **No** Shopify LinesAdd. If a second piece of the combination had existed, this confirm would have succeeded ([S-ATC-12](../../../scenarios/add-to-cart/S-ATC-12-same-combination-two-customers.md)).

### 2. `AvailableUniqueWeights` again (refresh)

Same request as S-ATC-01. Response **without 5.10 / 4.90**:

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001",
  "candidates": [
    { "grossWeightGrams": 5.12, "metalWeightGrams": 4.92, "salePriceInr": 46300 },
    { "grossWeightGrams": 5.40, "metalWeightGrams": 5.20, "salePriceInr": 48700 }
  ]
}
```

Popup cheapest-first: **5.12 / 4.92** selected.

---

## S-ATC-05 — Sort / select

**Alchemy:** none. **Shopify:** none.

Same candidate list already in memory from AvailableUniqueWeights. Sort is Hydrogen-only (price ascending ↔ descending). Selection stays on **5.12 / 4.92**. No delivery sort in phase 1.

---

## S-ATC-06 — Shopify retry (3a)

### 1. `AddToCart` — same SUCCESS as S-ATC-01 (BC-101 held).

### 2. Shopify `cartLinesAdd` — first attempt **fails**

### 3. Shopify `cartLinesAdd` — one retry **succeeds**

`OI-12` is resolved: Hydrogen retries once before any give-back. Customer sees the item. No `RemoveFromCart`.

---

## S-ATC-07 — Second piece

Given: S-ATC-01 Then. Clock 10:05. Duplicate already confirmed. Customer confirms **5.12 / 4.92**.

### 1. `AvailableUniqueWeights` (when popup opened)

Same as S-ATC-04 refresh (no 5.10 / 4.90).

### 2. `AddToCart`

```json
{
  "cartId": "c_789",
  "sku": "NAGAM-22K-5G",
  "grossWeightGrams": 5.12,
  "metalWeightGrams": 4.92
}
```

```json
{
  "result": "SUCCESS",
  "cartId": "c_789",
  "barcode": "BC-102",
  "cartStatus": "PENDING",
  "itemReservationStatus": "RESERVED_FOR_CART",
  "expiresAt": "2026-09-21T10:20:00+05:30"
}
```

### 3. Shopify `LinesAdd` — `barcode=BC-102`, qty 1, new `line_uid`.

### 4. Alchemy `AlignCartExpiries` — [C-HY-03](../../kjj-alchemy-docs/requirements/contracts/hydrogen/align-cart-expiries.md)

Silent. Only because the cart already had a hold.

```json
{ "cartId": "c_789", "referenceBarcode": "BC-102" }
```

```json
{
  "result": "ALIGNED",
  "cartId": "c_789",
  "sharedExpiresAt": "2026-09-21T10:20:00+05:30",
  "items": [
    {
      "barcode": "BC-102",
      "itemReservationStatus": "RESERVED_FOR_CART",
      "expiresAt": "2026-09-21T10:20:00+05:30"
    },
    {
      "barcode": "BC-101",
      "itemReservationStatus": "RESERVED_FOR_CART",
      "expiresAt": "2026-09-21T10:20:00+05:30"
    }
  ]
}
```

---

## S-ATC-08 — Sibling lapsed

Same AddToCart + LinesAdd for **BC-102** as S-ATC-07 (clock 10:16 → expiry **10:31**).

### `AlignCartExpiries`

```json
{ "cartId": "c_789", "referenceBarcode": "BC-102" }
```

```json
{
  "result": "ALIGNED_WITH_UNHELD",
  "cartId": "c_789",
  "sharedExpiresAt": "2026-09-21T10:31:00+05:30",
  "items": [
    {
      "barcode": "BC-102",
      "itemReservationStatus": "RESERVED_FOR_CART",
      "expiresAt": "2026-09-21T10:31:00+05:30"
    },
    {
      "barcode": "BC-101",
      "itemReservationStatus": "UNRESERVED",
      "expiresAt": null
    }
  ]
}
```

Hydrogen does **not** toast this. Shopify still has **both** lines. Cart Page later uses [C-HY-04](../../kjj-alchemy-docs/requirements/contracts/hydrogen/get-cart-details.md) (`GetCart` autoRenew).

---

## S-ATC-09 — SKU empty at confirm

### 1. `AddToCart` 5.10 / 4.90 — same FAILURE as S-ATC-04.

### 2. `AvailableUniqueWeights`

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001",
  "candidates": []
}
```

HTTP success, empty list. Hydrogen refreshes PDP into native unavailable handling. **Copy not defined** (`OI-08` / `OI-09`). No Shopify add.

---

## S-ATC-10 — Empty candidates (no confirm)

Click Add to Cart after gates. **Only:**

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001",
  "candidates": []
}
```

Not an Alchemy error. No AddToCart. Display in **this** flow is open (`CART-001` 3a). Demo shows a finding note only.

---

## S-ATC-11 — ERROR piece omitted

**Given:** S-PRC-03 Then. BC-103 `ERROR`, no original/sale. Other 5g pieces priced.

### 1. `AvailableUniqueWeights`

Alchemy lightest-first; Hydrogen re-sorts by the S-PRC-03 sale figures. 5.40 / 5.20 is **absent** (its only piece is ERROR).

```json
{
  "sku": "NAGAM-22K-5G",
  "customerPincode": "560001",
  "candidates": [
    { "grossWeightGrams": 5.10, "metalWeightGrams": 4.90, "salePriceInr": 47100 },
    { "grossWeightGrams": 5.12, "metalWeightGrams": 4.92, "salePriceInr": 47300 }
  ]
}
```

Nothing is held.

---

## S-ATC-12 — Same combination, two customers

SEED-INV variant **BC-104** (same 5.10 / 4.90 as BC-101). Both guests confirm that row.

| cart | AddToCart input | barcode returned |
|---|---|---|
| c_789 | 5.10 / 4.90 | BC-101 |
| c_999 | 5.10 / 4.90 | BC-104 |

Walkthrough plays `c_789` and records `c_999` in Debug. Combination then gone from a refresh.

---

## S-ATC-13 — Give-back and one repeat

Both Shopify adds fail. `RemoveFromCart` BC-101 SUCCESS. Repeat `AddToCart` 5.10 / 4.90 (no popup) holds **BC-101** again (price tie, lower barcode than BC-104). Repeat’s first Shopify add succeeds. Customer sees the item.

---

## S-ATC-14 — Give-back fails; Cart Page

Both Shopify adds fail. `RemoveFromCart` FAILURE. Technical alert (copy `OI-10` — do not Then that the item was not added). On OK → Cart Page. Piece still held; no Shopify line. Next: [S-CART-02](../../../scenarios/cart/S-CART-02-om-wins-reconciliation.md).

---

## S-ATC-15 — AddToCart technical error

`AddToCart` returns a technical error, not `NO_AVAILABLE_PIECE`. Alert. Popup stays. Nothing added. A lost SUCCESS plus a second submit can hold a further piece (`OI-34`). Do not Then a request identifier.

---

## Call map

| Play | C-HY-01 AvailableUniqueWeights | C-HY-02 AddToCart | C-HY-03 Align | Shopify LinesAdd | C-HY-07 RemoveFromCart |
| --- | --- | --- | --- | --- | --- |
| 00 | — | — | — | — | — |
| 01 | 3 combinations, no barcode | SUCCESS returns BC-101, `customerId` null | — | 1 line | — |
| 02 | — (until confirm) | — | — | — | — |
| 03 | after pincode, same as 01 | same as 01 | — | same as 01 | — |
| 04 | refresh without 5.10 / 4.90 | FAILURE `NO_AVAILABLE_PIECE` | — | — | — |
| 05 | — | — | — | — | — |
| 06 | (same as 01 if they opened popup) | SUCCESS | — | fail then retry OK | — |
| 07 | without 5.10 / 4.90 | SUCCESS returns BC-102 | ALIGNED | 2nd line BC-102 | — |
| 08 | without 5.10 / 4.90 | SUCCESS returns BC-102 | ALIGNED_WITH_UNHELD | 2nd line stays | — |
| 09 | `[]` after fail | FAILURE | — | — | — |
| 10 | `[]` first | — | — | — | — |
| 11 | 5.10 + 5.12 only (47100 / 47300) | — | — | — | — |
| 12 | 3 combinations (BC-104 hidden) | SUCCESS BC-101 then BC-104 | — | 1 line for this cart | — |
| 13 | (same as 01) | SUCCESS, then SUCCESS again | — | fail ×2, then OK | SUCCESS |
| 14 | (same as 01) | SUCCESS once | — | fail ×2 | FAILURE → Cart Page |
| 15 | list already shown | technical ERROR | — | — | — |

Checkout APIs (C-HY-08 InitiateCartCheckout, C-HY-10 UpdateCart) are **not** these Play options.

---

## Browse — S-PLP-01, S-PLP-02, S-PDP-01

No Alchemy HTTP.

| Play | Customer sees |
| --- | --- |
| S-PLP-01 | PRD-NAGAM shown as **NAGAM-22K-5G** at **48700** (SKU aggregate, not BC-101’s 46100) |
| S-PLP-02 | Finding. Search/filter field lists are `OI-05` / `OI-06` |
| S-PDP-01 | Open 5g **51000 / 48700** (Highest / BC-103 breakup). Switch to 3g **28900 / 27600** on the same page |

---

## Auth — S-AUTH-01…03

| Play | Call | Customer sees |
| --- | --- | --- |
| 01 | **UpdateCart** C-HY-10 | Header Account. Hold, expiry, 46100 unchanged. `customerId` = `cust_42` |
| 02 | none | Finding. Signed-in first AddToCart still leaves `CustomerId` null |
| 03 | none | Signed in. No Alchemy cart. UpdateCart is **not** called |

### C-HY-10 (S-AUTH-01)

```json
{ "cartId": "c_789", "customerId": "cust_42" }
```

```json
{
  "result": "SUCCESS",
  "cartId": "c_789",
  "customerId": "cust_42",
  "cartStatus": "PENDING",
  "items": [
    { "barcode": "BC-101", "itemReservationStatus": "RESERVED_FOR_CART", "expiresAt": "2026-09-21T10:15:00+05:30" }
  ]
}
```

---

## Cart page — S-CART-01…09

Land on `cart.html`. Hydrogen calls **GetCart** `autoRenew=true` ([C-HY-04](../../kjj-alchemy-docs/requirements/contracts/hydrogen/get-cart-details.md)).

| Play | Given | Call | Customer sees |
| --- | --- | --- | --- |
| 01 | S-ATC-01 Then (guest) | SUCCESS BC-101 live **46100** + breakup | One held row. Checkout **on**. Lock still needs `CustomerId` |
| 02 | S-ATC-14 Then (OM hold, no Shopify line) | SUCCESS + reconcile | Line **appears**. OM wins (`OI-15`) |
| 03 | S-ATC-08 Then | FAILURE | BC-101 flagged. Checkout **off** |
| 04 | S-CART-03 Then | C-HY-01/02 then C-HY-04 restart | Resolve → BC-103. Checkout **on** |
| 05 | S-CO-01 Then, back | ERROR → C-HY-06 (lock cleared) → SUCCESS live | Silent revert. Expiry **not** extended |
| 06 | S-ATC-07 Then, clock 10:21 | FAILURE mixed | BC-102 renewed and kept. BC-101 unheld |
| 07 | — | none | Finding: revert when not locked |
| 08 | — | ERROR `OI-23` | Finding: unbounded restart |
| 09 | Sweep discarded OM row | SUCCESS `items: []` | Finding: safer reading drops the Shopify line |

### C-HY-04 SUCCESS (S-CART-01)

```json
{ "cartId": "c_789", "autoRenew": true }
```

```json
{
  "result": "SUCCESS",
  "cartId": "c_789",
  "cartStatus": "PENDING",
  "customerId": null,
  "items": [
    {
      "barcode": "BC-101",
      "itemReservationStatus": "RESERVED_FOR_CART",
      "expiresAt": "2026-09-21T10:15:00+05:30",
      "originalPriceInr": 48200,
      "salePriceInr": 46100,
      "metalValueInr": 37700,
      "stoneDiamondValueInr": 0,
      "makingChargeAmountInr": 10500,
      "discountPercent": 20,
      "discountAmountInr": 2100
    }
  ]
}
```

### C-HY-04 FAILURE (S-CART-03 / S-CART-06)

```json
{
  "result": "FAILURE",
  "cartId": "c_789",
  "cartStatus": "PENDING",
  "customerId": null,
  "items": [
    { "barcode": "BC-101", "itemReservationStatus": "UNRESERVED", "expiresAt": null, "salePriceInr": 46100 },
    { "barcode": "BC-102", "itemReservationStatus": "RESERVED_FOR_CART", "expiresAt": "2026-09-21T10:20:00+05:30", "salePriceInr": 46300 }
  ]
}
```

### C-HY-04 ERROR + C-HY-06 (S-CART-05)

```json
{ "result": "ERROR", "cartId": "c_789", "cartStatus": "CHECKOUT_INITIATED", "customerId": "cust_42", "items": [] }
```

```json
{ "result": "SUCCESS", "cartId": "c_789", "cartStatus": "PENDING", "customerId": "cust_42", "items": [{ "barcode": "BC-101", "itemReservationStatus": "RESERVED_FOR_CART", "expiresAt": "2026-09-21T10:15:00+05:30" }] }
```

Restart GetCart is **live** (lock cleared).

---

## Remove — S-REM-01…03

Land on `cart.html`. [C-HY-07](../../kjj-alchemy-docs/requirements/contracts/hydrogen/release.md) **before** Shopify line-delete.

| Play | Call | Customer sees |
| --- | --- | --- |
| 01 | Release SUCCESS → C-HY-04 | Row gone |
| 02 | Release FAILURE `CHECKOUT_INITIATED` | Row stays; toast |
| 03 | Release SUCCESS; Shopify remove fails; next C-HY-04 | Brief leftover, then OM heals (`OI-15`) |

```json
{ "cartId": "c_789", "barcode": "BC-101" }
```

SUCCESS: `{ "result": "SUCCESS", "cartId": "c_789", "barcode": "BC-101" }`  
Locked: `{ "result": "FAILURE", "reason": "CHECKOUT_INITIATED" }`

---

## Checkout — S-CO-01…05

Land on `cart.html` except **04** (`checkout.html`).

| Play | Calls | Customer sees |
| --- | --- | --- |
| 01 | Fresh GetCart SUCCESS → InitiateCartCheckout → RazorPay | Already identified. Lock 48200 / 46100 / `BR-2026-09-21-10`. **No pay Then** |
| 02 | GetCart FAILURE. **No** C-HY-08 | Stay on Cart, flagged rows |
| 03 | GetCart ERROR → RevertCartCheckout → GetCart | Same as S-CART-05. No new lock |
| 04 | none | Finding. Success / Failure / Timeout skipped (`OI-16`) |
| 05 | **No GetCart yet** → UpdateCart → then S-CO-01 from step 2 | Guest click. Sign-in first |

### C-HY-08 (S-CO-01)

```json
{ "cartId": "c_789" }
```

```json
{
  "result": "SUCCESS",
  "cartId": "c_789",
  "cartStatus": "CHECKOUT_INITIATED",
  "customerId": "cust_42",
  "items": [{
    "barcode": "BC-101",
    "itemReservationStatus": "RESERVED_FOR_CHECKOUT",
    "lockedOriginalPriceInr": 48200,
    "lockedSalePriceInr": 46100,
    "lockedBoardRateTag": "BR-2026-09-21-10"
  }]
}
```

`expiresAt` omitted (`OI-24`). Back to Cart while locked is S-CART-05. Guest click is S-CO-05.

---

## Offers — S-OFR-01

**Not a BRD story.** Demo finding for leftover Cart chrome.

Alchemy `v0.23` retired `FR-OFR-01…03`. Making-charge discount is inside the synced Sale Price. **No HTTP.** `OI-19` leftover `is_modified` consumer.

---

## Call map (cart / remove / checkout)

| Play | C-HY-04 GetCart | C-HY-06 | C-HY-07 | C-HY-08 | C-HY-10 | Shopify |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | — | — | — | — | SUCCESS | unchanged |
| AUTH-02 / 03 | — | — | — | — | 03 not called | — |
| CART-01 | SUCCESS live 46100 | — | — | — | — | already aligned |
| CART-02 | SUCCESS | — | — | — | — | line added (OI-15) |
| CART-03 | FAILURE | — | — | — | — | both lines stay |
| CART-04 | SUCCESS after ATC | — | — | — | — | add BC-103 |
| CART-05 | ERROR then SUCCESS live | revert, lock cleared | — | — | — | unchanged |
| CART-06 | FAILURE mixed | — | — | — | — | both lines stay |
| CART-07 / 08 | finding | — | — | — | — | — |
| CART-09 | SUCCESS empty | — | — | — | — | line dropped |
| REM-01 | restart empty | — | SUCCESS | — | — | line gone |
| REM-02 | — | — | FAILURE lock | — | — | unchanged |
| REM-03 | heal empty | — | SUCCESS | — | — | remove **fails** |
| CO-01 | SUCCESS (fresh) | — | — | SUCCESS lock | already done | — |
| CO-02 | FAILURE | — | — | — | — | — |
| CO-03 | ERROR then SUCCESS | revert | — | — | — | — |
| CO-04 / OFR-01 | — | — | — | — | — | — |
| CO-05 | after UpdateCart | — | — | then as CO-01 | SUCCESS first | — |

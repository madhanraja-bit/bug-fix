/** Walkthrough change log — newest first. Rendered by changelog.html. */
window.WalkthroughLog = window.WalkthroughLog || {};
window.WalkthroughLog.ENTRIES = [
  {
    date: '22 Oct 2026',
    title: 'Chandra / Silver home, listing, and product look',
    summary:
      'Added ui-walkthough/chandra/ — absorbed Oct 22 specimen for S-CHN-01…03 / UC-CHN-001…003 / FR-CHN-01…03: Chandra home (index.html), Silver listing (plp.html), Chandra product look (pdp.html). Look-and-feel SoR for Chandra until live UAT Chandra exists. Placeholders allowed (OI-31). Named collection tiles not required (OI-30). Nav labels open (OI-29). Gold auto-load/sticky not assumed on Chandra listings. Linked from changelog. Plays approved 22 Oct 2026 (KJEI-T0089). ADR + Hydrogen TD still pending.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0089',
      'BA ruling inputs.md 22 Oct 2026',
      'FR-CHN-01',
      'FR-CHN-02',
      'FR-CHN-03',
      'UC-CHN-001',
      'UC-CHN-002',
      'UC-CHN-003',
      'S-CHN-01',
      'S-CHN-02',
      'S-CHN-03',
      'Journey 09',
      'vk_own_understanding/Oct 22/chandra/',
      'KJEI-T0088',
    ],
    changes: [
      {
        play: 'S-CHN-01',
        kind: 'New play',
        detail:
          'Open Chandra home → Chandra look introduction; shared Kalyan header required on live site; continue into Silver browse.',
      },
      {
        play: 'S-CHN-02',
        kind: 'New play',
        detail:
          'All-Silver and jewellery-type listings → Chandra look; Silver-only cards; empty type is empty listing not error.',
      },
      {
        play: 'S-CHN-03',
        kind: 'New play',
        detail:
          'Silver / Chandra division → Chandra PDP look; non-Silver → current Kalyan PDP look; shared header on both.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'Gold PLP auto-load / sticky Filter remain plp-auto-load.html / plp-sticky-filter.html. Named Chandra collections stay OI-30.',
      },
    ],
  },
  {
    date: '21 Oct 2026',
    title: 'PDP Product Summary hide Master Collection / Collection (UAT #3)',
    summary:
      'Updated pdp-product-summary.html — S-PDP-01 / UC-PDP-001 BR-8: Product Summary grid never shows Master collection or Collection (even when populated, e.g. MIA). Aligned related Summary grids on pdp-stone-metal-details.html and pdp-no-stone-hide-diamond-tab.html. Layout chrome unchanged (TD-0025). Linked from changelog and pdp.html. Plays approved 21 Oct 2026 (KJEI-T0085). TD-0001 field list / thin Hydrogen TD still pending Step 11.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0085',
      'BA ruling inputs.md 21 Oct 2026',
      'FR-PDP-02 (unchanged)',
      'UC-PDP-001 BR-8',
      'UC-PDP-002',
      'S-PDP-01',
      'TD-0001',
      'KJEI-T0084',
    ],
    changes: [
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Product Summary grid omits Master collection and Collection tiles (UAT #3 / MIA brand risk). Remaining tiles: SKU title, SKU, SKU description, Design number, Section, Type, Division, Gender.',
      },
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Same omit after SKU switch — those labels must not reappear. Empty-row omit and layout chrome unchanged.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'Price Breakup remains pdp-price-breakup.html. No-stone hide Diamond remains pdp-no-stone-hide-diamond-tab.html (Summary grid only aligned). Alchemy encode N/A.',
      },
    ],
  },
  {
    date: '20 Oct 2026',
    title: 'PLP sticky Filter/Sort while scroll',
    summary:
      'Added plp-sticky-filter.html — absorbed Oct 20 UAT #4 specimen for S-PLP-04 / UC-PLP-005 / FR-PLP-06: Filter+Sort toolbar sticky under site header while auto-load scrolls; Filter drawer and Sort reachable at any depth; Apply/sort still reset to first batch. Customer-visible labels = live PLP only (no new instructional copy). Look-and-feel SoR remains UAT Ring PLP. Linked from changelog and plp.html. Plays approved 20 Oct 2026 (KJEI-T0081). New Hydrogen TD (do not reuse TD-0024) still pending.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0081',
      'BA ruling inputs.md 20 Oct 2026',
      'FR-PLP-06',
      'UC-PLP-005',
      'S-PLP-04',
      'UAT https://uat-ecom.kalyanjewellers.net/collections/ring (visual SoR)',
      'vk_own_understanding/Oct 20/uat/plp-sticky-filter-ui/ (interim)',
      'KJEI-T0080',
    ],
    changes: [
      {
        play: 'S-PLP-04',
        kind: 'New play',
        detail:
          'Scroll past banner/original toolbar → Filter and Sort remain in viewport (sticky under site header); no new customer-facing labels on the strip.',
      },
      {
        play: 'S-PLP-04',
        kind: 'New play',
        detail:
          'Open Filter from sticky strip → existing FILTERS drawer; Apply resets listing to first batch of filtered set (pairs S-PLP-03).',
      },
      {
        play: 'S-PLP-04',
        kind: 'New play',
        detail:
          'Change Sort By from sticky strip → listing resets to first batch of new sort.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'S-PLP-03 auto-load process remains plp-auto-load.html. Visual SoR = UAT Ring PLP. Facet vocabulary still OI-06.',
      },
    ],
  },
  {
    date: '20 Oct 2026',
    title: 'PDP Product Summary tab UI layout',
    summary:
      'Added pdp-product-summary.html — absorbed Manikmandala Oct 7 mock for S-PDP-01 Product Summary: cream panel, 2-col fact tiles, SKU description full-width, values not bold. Grid fields and empty-row omit remain TD-0001 / UC-PDP-001 BR-8; Short description stays under Style No.; SKU short description omitted from grid. Linked from changelog and pdp.html. Plays approved 20 Oct 2026 (KJEI-T0078). Hydrogen TD-0025 Accepted cites this specimen.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0078',
      'BA ruling inputs.md 20 Oct 2026',
      'FR-PDP-02',
      'UC-PDP-001 BR-8',
      'UC-PDP-002',
      'S-PDP-01',
      'TD-0001',
      'KJEI-T0077',
    ],
    changes: [
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Product Summary tab: cream #fdfaf5 panel; active tab #cf254a; two-column fact tiles (label above value); SKU description full-width; values normal weight (not bold).',
      },
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Grid order: SKU title, SKU, SKU description, Design number, Section, Type, Division, Master collection, Collection, Gender. Omit empty/null. Omit product Short description from grid (under Style No.). Omit SKU short description from this layout.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'Price Breakup chrome remains pdp-price-breakup.html (TD-0023). Stone/metal tables remain pdp-stone-metal-details.html (TD-0021). No-stone hide Diamond remains pdp-no-stone-hide-diamond-tab.html (TD-0022).',
      },
    ],
  },
  {
    date: '20 Oct 2026',
    title: 'PLP auto-load infinite scroll (process only)',
    summary:
      'plp-auto-load.html demos S-PLP-03 / UC-PLP-004 / FR-PLP-05 auto-load process only (first batch → scroll append → end stop → sort reset; no pager / no Load more). Look-and-feel SoR remains UAT Ring PLP — do not treat this specimen as card/chrome/UI reference for Hydrogen. Linked from changelog and plp.html. Plays approved 20 Oct 2026 (KJEI-T0075). OI-26 not demonstrated.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0075',
      'BA ruling inputs.md 20 Oct 2026',
      'FR-PLP-05',
      'UC-PLP-004',
      'S-PLP-03',
      'UAT https://uat-ecom.kalyanjewellers.net/collections/ring (visual SoR)',
      'KJEI-T0074',
    ],
    changes: [
      {
        play: 'S-PLP-03',
        kind: 'New play',
        detail:
          'Process: first paint = first batch only; page-number controls absent; Load more absent.',
      },
      {
        play: 'S-PLP-03',
        kind: 'New play',
        detail:
          'Process: scroll near bottom → loading indicator → next batch appends to the same grid.',
      },
      {
        play: 'S-PLP-03',
        kind: 'New play',
        detail:
          'Process: after last batch auto-load stops; still no pager.',
      },
      {
        play: 'S-PLP-03',
        kind: 'New play',
        detail:
          'Process: Sort By change after appends resets to first batch.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'Visual SoR = UAT Ring PLP (not this HTML). OI-26 not shown. plp.html remains ATC / S-PLP-01 / S-PLP-02.',
      },
    ],
  },
  {
    date: '20 Oct 2026',
    title: 'PDP Price Breakup tab UI layout',
    summary:
      'Added pdp-price-breakup.html — absorbed Shaivala Oct 7 mock for S-PDP-01 Price Breakup: cream panel, hero Price/Compare-at, Amount Range pill, Component/Amount table. Fields and empty-row omit remain TD-0020 / UC-PDP-001 BR-7. Linked from changelog and pdp.html. Plays approved 20 Oct 2026 (KJEI-T0072). Hydrogen TD-0023 Accepted cites this specimen.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0072',
      'BA ruling inputs.md 20 Oct 2026',
      'FR-PDP-02',
      'UC-PDP-001 BR-7',
      'UC-PDP-002',
      'S-PDP-01',
      'TD-0020',
      'KJEI-T0071',
    ],
    changes: [
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Price Breakup tab: cream #fdfaf5 panel; hero tiles Price (sale) and Compare-at; Amount Range pill when present; Component / Amount table (Metal, Stone, Making Charges +%, Discount +%, GST +%, Cess +%); footer may restate synced sale.',
      },
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Empty / value-less rows: omit missing/null metafields; omit zero Price / Compare-at; omit Amount Range if missing; no strike-through when Compare-at equals Price; show synced Cess 0; no invented placeholders; no Hydrogen recompute.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'Stone/metal table layout remains pdp-stone-metal-details.html (TD-0021). No-stone hide Diamond remains pdp-no-stone-hide-diamond-tab.html (TD-0022).',
      },
    ],
  },
  {
    date: '19 Oct 2026',
    title: 'PDP hide Diamond / Gemstone tab when no stone',
    summary:
      'Added pdp-no-stone-hide-diamond-tab.html — S-PDP-01 NAGAM seed with no stone composition lines: Diamond / Gemstone Details omitted from the tab bar (Product Summary default). Linked from changelog and the with-stone specimen. Plays approved 19 Oct 2026 (KJEI-T0069). Hydrogen TD-0022 Draft cites this specimen.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0069',
      'BA ruling inputs.md 19 Oct 2026',
      'FR-PDP-02',
      'UC-PDP-001 BR-6',
      'UC-PDP-002 BR-5',
      'S-PDP-01',
      'KJEI-T0066',
    ],
    changes: [
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'No-stone SKU: Product Details tab bar shows Product Summary · Metal Details · Price Breakup only. Diamond / Gemstone Details absent (not empty message).',
      },
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'SKU switch 5g ↔ 3g (both no stone): Diamond tab stays omitted; selection stays on / returns to Product Summary.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail:
          'With-stone table layout remains pdp-stone-metal-details.html (KJEI-T0067 / TD-0021).',
      },
    ],
  },
  {
    date: '18 Oct 2026',
    title: 'PDP Diamond / Metal specification tables',
    summary:
      'Added pdp-stone-metal-details.html as the accepted specimen for Diamond / Gemstone and Metal Details tabs (option 3 tables). Linked from pdp.html. No glance chips or gold/stone share bar.',
    sources: [
      'kjj-kjinecom-docs KJEI-T0067',
      'BA ruling inputs.md 18 Oct 2026',
      'FR-PDP-02',
      'UC-PDP-001',
      'UC-PDP-002',
      'S-PDP-01',
      'KJEI-T0066',
      'KJEI-T0054',
    ],
    changes: [
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Diamond / Gemstone Details: table Material · Quality · Qty · Weight; footer Total stone; active tab #cf254a; panel #fdfaf5.',
      },
      {
        play: 'S-PDP-01',
        kind: 'Copy',
        detail:
          'Metal Details: table Material · Purity · Qty · Weight; fact cells Metal color · Gross weight · Wide range.',
      },
      {
        play: '—',
        kind: 'No play change',
        detail: 'Product Summary grid and Price Breakup tiles are out of scope for this absorb.',
      },
    ],
  },
];

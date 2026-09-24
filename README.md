# Farm Management System — UI Mock-up

A **UI-only** mock-up (Next.js App Router + Bun + Tailwind CSS) of the Farm Management System
described in *Software Requirements Specification v1.3*. All data is dummy/illustrative — there is
**no backend**. The purpose is to let the client see and walk through every feature.

## Run it

```bash
bun install
bun run dev
# open http://localhost:3000  (uses 3001 if 3000 is taken)
```

Type-check: `bunx tsc --noEmit` · Production build: `bun run build`

## Try the interactive controls (top bar)

- **Farm switcher** — One farm · Selected farms (Shapla + Rupsha) · All farms *(FR-004, D-01)*
- **Role switcher** — Owner / Manager / Worker / Vet / Buyer. Demonstrates §2.2 role separation:
  a **Worker** never sees money (ledger locks, prices hide, nav collapses); a **Buyer** sees only
  their one booked animal (Fattening → share-link view).
- **Language** — English ⇄ বাংলা, with Bangla numerals *(NFR-08, NFR-09)*.

## Screen → module → requirement map

| Screen | SRS module | Key requirements shown |
|---|---|---|
| **Owner Dashboard** | I | FR-901, FR-905, FR-906, milk reconciliation, attention & task lists |
| **Manager Home** | I | FR-902, seven-day tasks, stock warnings |
| **Farms & Accounts** | 0 | FR-001–010, users & role matrix, animal/stock/cash transfers, shared settings |
| **Animals** | A | FR-101–112: profiles, weight history, family tree/lineage, health timeline, cost, bulk import |
| **Feeding** | B | FR-251–257: feed given, per-animal allocation (R-01/R-02), given-vs-predicted, weight flags |
| **Inventory** | B | FR-201–222: items & conversions, purchases, movements, batches/expiry, stock counts, valuation & usage |
| **Health** | C | FR-301–307: treatments, vaccination schedule & defaults, withdrawal periods |
| **Reproduction** | D | FR-401–413: state pipeline, task calendar, breeding performance, births |
| **Dairy** | E | FR-501–512 + FR-811: session entry, session summary, customers/sales, receivables, reconciliation |
| **Fattening & Qurbani** | F | FR-601–612: weight & projection, break-even calculator, bookings, qurbani shares, photo timeline, buyer link |
| **Ledger** | G | FR-701–721: cost/cash toggle, entries, consolidated P&L, payables, money accounts, month close, filters |
| **Profitability** | H | FR-801–812: attention list, cost per animal, cost per litre, dairy profit, trends |
| **Reports** | I | FR-903–908: standard reports, farm comparison, exports |
| **Settings & Rules** | §5, §7 | Species config, calculation rules R-01–R-25, default values & sources, decisions log, design principles, NFRs |

## Notes for reviewers

- Colours follow the SRS module coding: **dark green** account structure, **green** daily records,
  **amber** money/stock/sales, **blue** insight/reporting.
- Each screen header cites the FR/rule IDs it covers, so the client can trace the mock-up back to the SRS.
- This is a visual prototype: buttons and forms are illustrative and do not persist data.

Built with Next.js 15, React 19, Tailwind CSS 3, TypeScript, Bun.

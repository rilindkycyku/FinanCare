# FinanCareLite

A lightweight, fully client-side invoice generator built with the FinanCare design system
("Fatura"). There is no backend — everything (business profile, clients, products, invoices,
currency rates) is stored locally in the browser via IndexedDB.

## Features

- **Të Dhënat e Biznesit** — your business profile (name, NUI, NF, TVSH, address, logo) used on
  every invoice.
- **Llogaritë Bankare** — bank accounts shown as payment options on the invoice footer.
- **Klientët** — client records, with one-click import from the **FinanCare-ARBK-Extension**
  browser extension (same bridge contract FinanCare itself uses), or paste-JSON as a fallback.
- **Produktet** — a reusable product list (with a camera barcode scanner, since HTTPS makes
  camera access available with no native app) — or add ad-hoc line items straight on an invoice.
- **Faturat** — build an invoice, view it in the real Fatura design, export it as a PDF.
- **QR / Shpërndaj** — generates a QR code that encodes the invoice itself into a link (gzip +
  base42, same technique GuestSeat uses for its share links). Scanning it opens the invoice and
  auto-exports it as a PDF — no server, no backend, works even on a device with no local data.
- **Kurset e Këmbimit** — optional extra currency totals on the invoice footer, with rates you set
  yourself in Settings (no external API; add as many currencies as you want, or none).
- **Eksporto / Importo** — back up or move all local data as a single JSON file.

## Development

```bash
npm install
npm run dev
npm run build
```

## Data & privacy

All data lives in this browser's IndexedDB only. Clearing site data removes it — use
**Eksporto / Importo** to keep a JSON backup.

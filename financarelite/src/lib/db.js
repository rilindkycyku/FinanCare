/**
 * IndexedDB-backed persistence for FinanCareLite. There's no backend, so every store
 * (business profile, banks, clients, products, invoices) lives entirely in the browser.
 * Same hand-rolled wrapper shape as GuestSeat's `db.ts` (openDb/withStore), ported to plain JS.
 */

import {
  DEFAULT_TVSH_TYPES,
  DEFAULT_UNITS,
  DEFAULT_DOCUMENT_TYPES,
  UNITS_SEED_VERSION,
  DOCUMENT_TYPES_SEED_VERSION,
  LEGACY_DOCUMENT_TYPE_RENAMES,
  OBSOLETE_DOCUMENT_TYPES,
} from "./options";

const DB_NAME = "financarelite";
const DB_VERSION = 4;

export const STORES = {
  businessDetails: "businessDetails",
  banks: "banks",
  clients: "clients",
  products: "products",
  invoices: "invoices",
  currencies: "currencies",
  tvshTypes: "tvshTypes",
  units: "units",
  documentTypes: "documentTypes",
  payments: "payments",
};

const BUSINESS_DETAILS_KEY = "main";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB nuk suportohet në këtë shfletues"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.businessDetails)) {
        db.createObjectStore(STORES.businessDetails);
      }
      if (!db.objectStoreNames.contains(STORES.banks)) {
        db.createObjectStore(STORES.banks, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.clients)) {
        db.createObjectStore(STORES.clients, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.products)) {
        db.createObjectStore(STORES.products, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.invoices)) {
        db.createObjectStore(STORES.invoices, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.currencies)) {
        db.createObjectStore(STORES.currencies, { keyPath: "id" });
      }
      // Seeded only at first creation — the business fully owns the list from then on (can
      // edit, add to, or delete every default row without it coming back on next load).
      if (!db.objectStoreNames.contains(STORES.tvshTypes)) {
        const store = db.createObjectStore(STORES.tvshTypes, { keyPath: "id" });
        DEFAULT_TVSH_TYPES.forEach((t) => store.add(t));
      }
      if (!db.objectStoreNames.contains(STORES.units)) {
        const store = db.createObjectStore(STORES.units, { keyPath: "id" });
        DEFAULT_UNITS.forEach((u) => store.add(u));
      }
      if (!db.objectStoreNames.contains(STORES.documentTypes)) {
        const store = db.createObjectStore(STORES.documentTypes, { keyPath: "id" });
        DEFAULT_DOCUMENT_TYPES.forEach((t) => store.add(t));
      }
      if (!db.objectStoreNames.contains(STORES.payments)) {
        db.createObjectStore(STORES.payments, { keyPath: "id" });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // Without this, an older tab left open from before a DB_VERSION bump (like the one that
      // added the documentTypes store) holds its connection open forever, and every new
      // tab/reload's indexedDB.open() call blocks silently — the whole app just hangs on
      // "Duke ngarkuar..." with no error. Closing on versionchange lets the newer connection
      // proceed immediately.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
    req.onblocked = () => {
      console.warn(
        "FinanCareLite: databaza është e bllokuar nga një skedë tjetër e hapur më parë. Mbyllni skedat e tjera të FinanCareLite dhe rifreskoni."
      );
    };
  });
  return dbPromise;
}

function withStore(store, mode, body) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = body(tx.objectStore(store));
        let result;
        if (req) req.onsuccess = () => (result = req.result);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---- generic list-store helpers (banks / clients / products / invoices) ----

export function getAll(store) {
  return withStore(store, "readonly", (s) => s.getAll()).then((all) => all ?? []);
}

export function getOne(store, id) {
  return withStore(store, "readonly", (s) => s.get(id));
}

export function put(store, record) {
  return withStore(store, "readwrite", (s) => s.put(record)).then(() => record);
}

export function remove(store, id) {
  return withStore(store, "readwrite", (s) => s.delete(id)).then(() => undefined);
}

export function clearStore(store) {
  return withStore(store, "readwrite", (s) => s.clear()).then(() => undefined);
}

// Document types are seeded once when the store is first created (see openDb above), so a
// browser whose database already existed before new entries were added to
// DEFAULT_DOCUMENT_TYPES would never see them. This tops the store up with whichever defaults
// are still missing (matched by id, so it never touches a type the business already
// edited/renamed) — safe to call on every load.
export async function ensureDefaultDocumentTypes() {
  let existing = await getAll(STORES.documentTypes);
  existing = await applyDocumentTypeRenames(existing);
  const existingIds = new Set(existing.map((t) => t.id));
  const missing = DEFAULT_DOCUMENT_TYPES.filter((t) => !existingIds.has(t.id));
  if (missing.length === 0) return existing;
  await Promise.all(missing.map((t) => put(STORES.documentTypes, t)));
  return [...existing, ...missing];
}

// Renaming a default ("Faturë Shitëse" → "Faturë") can't ride along with the top-up above: the
// record already exists, and rewriting it on every load would keep undoing the business's own
// edit. So it runs once per browser, and only against a record still carrying the exact old
// text — anything renamed by hand is left alone. Same one-shot pass drops defaults that were
// superseded (see OBSOLETE_DOCUMENT_TYPES).
const DOCUMENT_TYPES_SEED_VERSION_KEY = "financarelite.documentTypesSeedVersion";

async function applyDocumentTypeRenames(existing) {
  let seenVersion = 1;
  try {
    seenVersion = parseInt(localStorage.getItem(DOCUMENT_TYPES_SEED_VERSION_KEY) || "1", 10) || 1;
    if (seenVersion >= DOCUMENT_TYPES_SEED_VERSION) return existing;
  } catch {
    return existing; // storage blocked (private mode) — leave the list exactly as it is
  }

  let updated = existing;
  for (const rename of LEGACY_DOCUMENT_TYPE_RENAMES) {
    const record = updated.find((t) => t.id === rename.id);
    const target = DEFAULT_DOCUMENT_TYPES.find((t) => t.id === rename.id);
    if (!record || !target) continue;
    if (record.label !== rename.fromLabel || record.titleLabel !== rename.fromTitleLabel) continue;
    const renamed = { ...record, label: target.label, titleLabel: target.titleLabel };
    await put(STORES.documentTypes, renamed);
    updated = updated.map((t) => (t.id === rename.id ? renamed : t));
  }

  for (const obsolete of OBSOLETE_DOCUMENT_TYPES) {
    const record = updated.find((t) => t.id === obsolete.id);
    if (!record || record.label !== obsolete.label) continue;
    await remove(STORES.documentTypes, obsolete.id);
    updated = updated.filter((t) => t.id !== obsolete.id);
  }

  try {
    localStorage.setItem(DOCUMENT_TYPES_SEED_VERSION_KEY, String(DOCUMENT_TYPES_SEED_VERSION));
  } catch {
    /* best effort — worst case the same one-shot pass runs again on the next load */
  }
  return updated;
}

// Units, unlike document types, are *not* topped up on every load — a deleted default is meant
// to stay deleted (that's what NjesiteMatese's quick-add chips are for). Only units introduced in
// a later batch than this browser has seen get added, once, so new defaults (muaj, javë, palë...)
// reach existing databases without resurrecting anything the business deliberately removed.
const UNITS_SEED_VERSION_KEY = "financarelite.unitsSeedVersion";

export async function ensureDefaultUnits() {
  const existing = await getAll(STORES.units);
  let seenVersion = 1;
  try {
    seenVersion = parseInt(localStorage.getItem(UNITS_SEED_VERSION_KEY) || "1", 10) || 1;
  } catch {
    return existing; // storage blocked (private mode) — nothing to top up, list still works
  }
  if (seenVersion >= UNITS_SEED_VERSION) return existing;

  const existingIds = new Set(existing.map((u) => u.id));
  const existingNames = new Set(existing.map((u) => (u.emri || "").trim().toLowerCase()));
  const missing = DEFAULT_UNITS.filter(
    (u) => (u.seedVersion || 1) > seenVersion && !existingIds.has(u.id) && !existingNames.has(u.emri.toLowerCase())
  );
  await Promise.all(missing.map((u) => put(STORES.units, u)));
  try {
    localStorage.setItem(UNITS_SEED_VERSION_KEY, String(UNITS_SEED_VERSION));
  } catch {
    /* best effort — worst case the same top-up runs again on the next load */
  }
  return [...existing, ...missing];
}

/** Adds a unit typed straight into a product/line-item form to "Njësitë Matëse", so it's there
 * the next time — unless one with that name already exists. Returns the new record, or null when
 * there was nothing to add. */
export async function saveUnitIfNew(emri) {
  const name = (emri || "").trim();
  if (!name) return null;
  const existing = await getAll(STORES.units);
  if (existing.some((u) => (u.emri || "").trim().toLowerCase() === name.toLowerCase())) return null;
  const record = { id: makeId("unit"), emri: name };
  await put(STORES.units, record);
  return record;
}

// ---- business details: single record keyed by a constant ----

export function getBusinessDetails() {
  return withStore(STORES.businessDetails, "readonly", (s) => s.get(BUSINESS_DETAILS_KEY));
}

export function putBusinessDetails(record) {
  return withStore(STORES.businessDetails, "readwrite", (s) =>
    s.put(record, BUSINESS_DETAILS_KEY)
  ).then(() => record);
}

// ---- whole-database export / import (JSON backup) ----

export async function exportAllData() {
  const [businessDetails, banks, clients, products, invoices, currencies, tvshTypes, units, documentTypes, payments] =
    await Promise.all([
      getBusinessDetails(),
      getAll(STORES.banks),
      getAll(STORES.clients),
      getAll(STORES.products),
      getAll(STORES.invoices),
      getAll(STORES.currencies),
      getAll(STORES.tvshTypes),
      getAll(STORES.units),
      getAll(STORES.documentTypes),
      getAll(STORES.payments),
    ]);
  return {
    app: "FinanCareLite",
    version: 1,
    exportedAt: new Date().toISOString(),
    businessDetails: businessDetails ?? null,
    banks,
    clients,
    products,
    invoices,
    currencies,
    tvshTypes,
    units,
    documentTypes,
    payments,
  };
}

export async function importAllData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Skedari i importuar nuk është JSON i vlefshëm.");
  }
  await Promise.all([
    clearStore(STORES.banks),
    clearStore(STORES.clients),
    clearStore(STORES.products),
    clearStore(STORES.invoices),
    clearStore(STORES.currencies),
    clearStore(STORES.tvshTypes),
    clearStore(STORES.units),
    clearStore(STORES.documentTypes),
    clearStore(STORES.payments),
  ]);
  if (data.businessDetails) await putBusinessDetails(data.businessDetails);
  await Promise.all([
    ...(data.banks ?? []).map((b) => put(STORES.banks, b)),
    ...(data.clients ?? []).map((c) => put(STORES.clients, c)),
    ...(data.products ?? []).map((p) => put(STORES.products, p)),
    ...(data.invoices ?? []).map((i) => put(STORES.invoices, i)),
    ...(data.currencies ?? []).map((c) => put(STORES.currencies, c)),
    ...(data.tvshTypes ?? []).map((t) => put(STORES.tvshTypes, t)),
    ...(data.units ?? []).map((u) => put(STORES.units, u)),
    ...(data.documentTypes ?? []).map((t) => put(STORES.documentTypes, t)),
    ...(data.payments ?? []).map((p) => put(STORES.payments, p)),
  ]);
}

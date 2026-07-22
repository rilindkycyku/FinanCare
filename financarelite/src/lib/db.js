/**
 * IndexedDB-backed persistence for FinanCareLite. There's no backend, so every store
 * (business profile, banks, clients, products, invoices) lives entirely in the browser.
 * Same hand-rolled wrapper shape as GuestSeat's `db.ts` (openDb/withStore), ported to plain JS.
 */

import { DEFAULT_TVSH_TYPES, DEFAULT_UNITS, DEFAULT_DOCUMENT_TYPES } from "./options";

const DB_NAME = "financarelite";
const DB_VERSION = 3;

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
  const existing = await getAll(STORES.documentTypes);
  const existingIds = new Set(existing.map((t) => t.id));
  const missing = DEFAULT_DOCUMENT_TYPES.filter((t) => !existingIds.has(t.id));
  if (missing.length === 0) return existing;
  await Promise.all(missing.map((t) => put(STORES.documentTypes, t)));
  return [...existing, ...missing];
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
  const [businessDetails, banks, clients, products, invoices, currencies, tvshTypes, units, documentTypes] =
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
  ]);
}

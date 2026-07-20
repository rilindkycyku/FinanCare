/**
 * IndexedDB-backed persistence for FinanCareLite. There's no backend, so every store
 * (business profile, banks, clients, products, invoices) lives entirely in the browser.
 * Same hand-rolled wrapper shape as GuestSeat's `db.ts` (openDb/withStore), ported to plain JS.
 */

const DB_NAME = "financarelite";
const DB_VERSION = 1;

export const STORES = {
  businessDetails: "businessDetails",
  banks: "banks",
  clients: "clients",
  products: "products",
  invoices: "invoices",
  currencies: "currencies",
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
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
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
  const [businessDetails, banks, clients, products, invoices, currencies] = await Promise.all([
    getBusinessDetails(),
    getAll(STORES.banks),
    getAll(STORES.clients),
    getAll(STORES.products),
    getAll(STORES.invoices),
    getAll(STORES.currencies),
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
  ]);
  if (data.businessDetails) await putBusinessDetails(data.businessDetails);
  await Promise.all([
    ...(data.banks ?? []).map((b) => put(STORES.banks, b)),
    ...(data.clients ?? []).map((c) => put(STORES.clients, c)),
    ...(data.products ?? []).map((p) => put(STORES.products, p)),
    ...(data.invoices ?? []).map((i) => put(STORES.invoices, i)),
    ...(data.currencies ?? []).map((c) => put(STORES.currencies, c)),
  ]);
}

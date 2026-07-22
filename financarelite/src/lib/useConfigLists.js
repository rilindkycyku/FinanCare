import { useEffect, useState } from "react";
import { getAll, ensureDefaultDocumentTypes, STORES } from "./db";

/** The business-configured VAT rates (see "Llojet e TVSH" in Settings) — sorted low to high so
 * they list the same way everywhere they're picked from. */
export function useTvshTypes() {
  const [tvshTypes, setTvshTypes] = useState([]);

  useEffect(() => {
    getAll(STORES.tvshTypes).then((list) =>
      setTvshTypes([...list].sort((a, b) => (parseFloat(a.perqindja) || 0) - (parseFloat(b.perqindja) || 0)))
    );
  }, []);

  return tvshTypes;
}

/** The business-configured measurement units (see "Njësitë Matëse" in Settings). */
export function useUnits() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    getAll(STORES.units).then(setUnits);
  }, []);

  return units;
}

/** The business-configured invoice document types — the built-in ones (see
 * DEFAULT_DOCUMENT_TYPES in lib/options.js) plus any custom types added from "Llojet e
 * Faturave" in Settings. Tops up any newly-added defaults an existing database predates. */
export function useDocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    ensureDefaultDocumentTypes().then(setDocumentTypes);
  }, []);

  return documentTypes;
}

import { useEffect, useState } from "react";
import { getAll, STORES } from "./db";

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

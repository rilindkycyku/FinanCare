export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "CHF", label: "CHF" },
];

// Seeded once into IndexedDB the first time a browser opens the app (see db.js). After that the
// business owns the list — edited, added to, or fully replaced (e.g. Kosovo's 8/18% vs
// Albania's 10/20%) from the "Llojet e TVSH" settings section, same pattern as currencies.
export const DEFAULT_TVSH_TYPES = [
  { id: "tvsh_default_0", emri: "Pa TVSH", perqindja: 0 },
  { id: "tvsh_default_8", emri: "TVSH e Reduktuar", perqindja: 8 },
  { id: "tvsh_default_18", emri: "TVSH Standarde", perqindja: 18 },
];

export const DEFAULT_UNITS = [
  { id: "unit_default_cope", emri: "copë" },
  { id: "unit_default_kg", emri: "kg" },
  { id: "unit_default_g", emri: "g" },
  { id: "unit_default_l", emri: "l" },
  { id: "unit_default_ml", emri: "ml" },
  { id: "unit_default_m", emri: "m" },
  { id: "unit_default_m2", emri: "m²" },
  { id: "unit_default_m3", emri: "m³" },
  { id: "unit_default_ore", emri: "orë" },
  { id: "unit_default_dite", emri: "ditë" },
  { id: "unit_default_paketë", emri: "paketë" },
  { id: "unit_default_kuti", emri: "kuti" },
];

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

// FinanCareLite has no stock/warehouse ledger, so document "types" are a label-only
// distinction — they change the title shown on the invoice, its numbering prefix, and (for a
// Fletëkthim, or any custom type marked as such) flip the line-item amounts negative. No stock
// or debit/credit effects. Seeded once into IndexedDB (see db.js) same as TVSH types/units —
// after that the business owns the list and can add its own custom document types from the
// "Llojet e Faturave" settings section (see LlojetEDokumentit.jsx).
export const DEFAULT_DOCUMENT_TYPES = [
  { id: "doctype_default_fat", value: "FAT", label: "Faturë", titleLabel: "FATURË", negateAmounts: false },
  { id: "doctype_default_por", value: "POR", label: "Porosi", titleLabel: "POROSI", negateAmounts: false },
  { id: "doctype_default_kthim", value: "KTHIM", label: "Fletëkthim (Kredit Notë)", titleLabel: "FLETËKTHIM", negateAmounts: true },
  { id: "doctype_default_ofr", value: "OFR", label: "Ofertë", titleLabel: "OFERTË", negateAmounts: false },
  { id: "doctype_default_prf", value: "PRF", label: "Parafaturë (Proforma)", titleLabel: "PARAFATURË", negateAmounts: false },
  { id: "doctype_default_fld", value: "FLD", label: "Fletëdërgesë", titleLabel: "FLETËDËRGESË", negateAmounts: false },
  { id: "doctype_default_nd", value: "ND", label: "Notë Debiti", titleLabel: "NOTË DEBITI", negateAmounts: false },
  { id: "doctype_default_pos", value: "POS", label: "Faturë POS", titleLabel: "FATURË POS", negateAmounts: false },
  { id: "doctype_default_online", value: "ONL", label: "Porosi Online", titleLabel: "POROSI ONLINE", negateAmounts: false },
  { id: "doctype_default_bank", value: "BANK", label: "Faturë Bankare", titleLabel: "FATURË BANKARE", negateAmounts: false },
  { id: "doctype_default_kesh", value: "KESH", label: "Faturë Kesh", titleLabel: "FATURË KESH", negateAmounts: false },
  { id: "doctype_default_kupon", value: "KUP", label: "Kupon Fiskal", titleLabel: "KUPON FISKAL", negateAmounts: false },
  { id: "doctype_default_saldo", value: "SALDO", label: "Bilanci Fillestar", titleLabel: "BILANCI FILLESTAR", negateAmounts: false },
  { id: "doctype_default_kontrate", value: "KON", label: "Faturë sipas Kontratës", titleLabel: "FATURË SIPAS KONTRATËS", negateAmounts: false },
  { id: "doctype_default_sherbim", value: "SHR", label: "Faturë Shërbimi", titleLabel: "FATURË SHËRBIMI", negateAmounts: false },
  { id: "doctype_default_avans", value: "AVS", label: "Faturë Avansi", titleLabel: "FATURË AVANSI", negateAmounts: false },
  { id: "doctype_default_qira", value: "QRA", label: "Faturë Qiraje", titleLabel: "FATURË QIRAJE", negateAmounts: false },
  { id: "doctype_default_mujore", value: "MUJ", label: "Faturë Mujore", titleLabel: "FATURË MUJORE", negateAmounts: false },
  { id: "doctype_default_eksport", value: "EXP", label: "Faturë Eksporti", titleLabel: "FATURË EKSPORTI", negateAmounts: false },
  { id: "doctype_default_situacion", value: "SIT", label: "Situacion Pune", titleLabel: "SITUACION PUNE", negateAmounts: false },
];

// Document types, unlike units, are topped up on every load (see ensureDefaultDocumentTypes) —
// but a *rename* of an existing default can't work that way: the record is already there, and
// overwriting it every load would undo a business's own edit. So renames are applied once, and
// only to a record still carrying the exact old text, i.e. one nobody has touched.
export const DOCUMENT_TYPES_SEED_VERSION = 2;

export const LEGACY_DOCUMENT_TYPE_RENAMES = [
  { id: "doctype_default_fat", fromLabel: "Faturë Shitëse", fromTitleLabel: "FATURË SHITËSE" },
];

// Short-lived duplicates that shipped on a development branch and never on a release: a plain
// "Faturë" now *is* the FAT type above, so a database that picked up the separate FTR entry drops
// it again — unless it was renamed in the meantime, in which case it's the business's own type.
export const OBSOLETE_DOCUMENT_TYPES = [{ id: "doctype_default_ftr", label: "Faturë" }];

// Units are seeded once when the store is created (see db.js) and the business owns the list
// from then on — deleting a default is meant to stick. Defaults added *later* would therefore
// never reach an existing database, so each new batch carries the seed version it arrived in and
// gets topped up once (see ensureDefaultUnits); bump this when adding another batch below.
export const UNITS_SEED_VERSION = 3;

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
  { id: "unit_default_jave", emri: "javë", seedVersion: 2 },
  { id: "unit_default_muaj", emri: "muaj", seedVersion: 2 },
  { id: "unit_default_vit", emri: "vit", seedVersion: 2 },
  { id: "unit_default_paketë", emri: "paketë" },
  { id: "unit_default_kuti", emri: "kuti" },
  { id: "unit_default_pale", emri: "palë", seedVersion: 2 },
  { id: "unit_default_set", emri: "set", seedVersion: 2 },
  { id: "unit_default_km", emri: "km", seedVersion: 2 },
  { id: "unit_default_ton", emri: "ton", seedVersion: 2 },
  { id: "unit_default_sherbim", emri: "shërbim", seedVersion: 2 },
  { id: "unit_default_njesi", emri: "njësi", seedVersion: 3 },
  { id: "unit_default_pako", emri: "pako", seedVersion: 3 },
  { id: "unit_default_palete", emri: "paletë", seedVersion: 3 },
  { id: "unit_default_rrotull", emri: "rrotull", seedVersion: 3 },
  { id: "unit_default_thes", emri: "thes", seedVersion: 3 },
  { id: "unit_default_ml_gjatesi", emri: "m/l", seedVersion: 3 },
  { id: "unit_default_projekt", emri: "projekt", seedVersion: 3 },
];

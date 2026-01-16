// src/types/index.ts

// Stock & Price Info
export interface StokuQmimiProduktit {
  SasiaNeStok: number;
  QmimiProduktit: number;
  QmimiMeShumic?: number;
  DataKrijimit?: string;
  DataPerditsimit?: string;
}

// Product Discount (time-limited promotional discounts)
// If Rabati > 0 and not expired, the product is on offer
export interface ZbritjaQmimitProduktit {
  Rabati: number; // Percentage discount (e.g., 25.00 = 25%) - if > 0, product is on offer
  DataZbritjes: string | null; // When discount started
  DataSkadimit: string | null; // When discount expires (null = no expiry)
}

// Product
export interface Produkti {
  ProduktiID: number;
  EmriProduktit: string;
  Barkodi?: string;
  Pershkrimi?: string;
  FotoProduktit?: string;
  IDGrupiProduktit: number;
  IDNjesiaMatese: number;
  LlojiTVSH: number;
  isDeleted: string;

  // Core pricing data
  StokuQmimiProduktit?: StokuQmimiProduktit;

  // Promotional discount (time-limited)
  // If ZbritjaQmimitProduktit.Rabati > 0 AND not expired, product is on offer
  ZbritjaQmimitProduktit?: ZbritjaQmimitProduktit;

  // Dynamic fields added at runtime
  QmimiFinal?: number;
  isDiscounted?: boolean; // Has active discount (Rabati > 0 and not expired)
  discountPercentage?: number;
}

// Product Category
export interface GrupiProduktit {
  IDGrupiProduktit: number;
  GrupiIProduktit: string;
  isDeleted?: string;
}

// Partner (User)
export interface Partneri {
  IDPartneri: number;

  // Basic info
  EmriBiznesit?: string;
  Username: string;
  Password?: string; // Only used during login – never expose or store after authentication

  // Contact & Address
  Email?: string;
  NrKontaktit?: string;
  Adresa?: string;

  // Identifiers
  ShkurtesaPartnerit?: string;
  NUI?: string;
  NRF?: string;
  TVSH?: string;

  // Rabat / Bonus Program
  Rabati?: number; // e.g. 2.00, 4.00 → percentage discount on total order
  LlojiKarteles?: string | null; // e.g. "Bonus", null if none
  KodiKartela?: string | null; // e.g. "B000014000003"

  // Partner Type
  LlojiPartnerit?: string; // "B" (Blerës/Buyer), "F" (Furnitor/Supplier), "B/F" (Both)

  // System flags
  isDeleted?: string; // kept as string to match your JSON ("false"/"true")

  // Optional flags
  isPendingApproval?: boolean; // for newly registered users waiting for approval
}

// User type (alias for Partneri - used in AuthContext)
export type User = Partneri;

// Business Info (your company)
export interface TeDhenatBiznesit {
  EmriIBiznesit: string;
  ShkurtesaEmritBiznesit?: string;
  NUI?: string;
  NF?: string;
  NrTVSH?: string;
  Adresa: string;
  NrKontaktit: string;
  Email: string;
  Logo?: string;
}

// Cart Item (used in CartContext)
export interface CartItem {
  ProduktiID: number;
  EmriProduktit: string;
  QmimiProduktit: number;
  quantity: number;
  LlojiTVSH: string;
  Barkodi?: string;
  hasProductDiscount?: boolean;
  discountPercentage?: number;
  SasiaNeStok: number;
}
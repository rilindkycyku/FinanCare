// src/types/index.ts

// Stock & Price Info
export interface StokuQmimiProduktit {
  SasiaNeStok: number
  QmimiProduktit: number        // Default base price (fallback)
  QmimiMeShumic?: number
  DataKrijimit?: string
  DataPerditsimit?: string
}

// Special price per partner category
export interface QmimiPerKategori {
  QmimiPDKatID: number
  QmimiProduktit: number
  IdKategoritEPartnerit: number
  ProduktiID: number
}

export interface Produkti {
  ProduktiID: number
  EmriProduktit: string
  Barkodi: string
  Pershkrimi: string
  FotoProduktit: string
  IDGrupiProduktit: number
  IDNjesiaMatese: number
  LlojiTVSH: number
  isDeleted: string

  StokuQmimiProduktit?: {
    SasiaNeStok: number
    QmimiProduktit: number
    EshteNeOfert: string
  }

  QmimiProduktitPerKategori?: Array<{
    QmimiPDKatID: number
    QmimiProduktit: number
    IdKategoritEPartnerit: number
    ProduktiID: number
    EshteNeOfert: string
  }>

  // Dynamic fields added at runtime
  QmimiFinal?: number
  KaZbritjeNgaKategoria?: boolean
  EshteNeOfert?: boolean   // ← NEW: tells us if the shown price is an official offer
}

// Product Category
export interface GrupiProduktit {
  IDGrupiProduktit: number
  GrupiIProduktit: string
  isDeleted?: string
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

  // Rabat / Bonus Program (new system)
  Rabati?: number;            // e.g. 2.00, 4.00 → percentage discount
  LlojiKarteles?: string | null; // e.g. "Bonus", null if none
  KodiKartela?: string | null;   // e.g. "B000014000003"

  // System flags
  isDeleted?: string; // kept as string to match your JSON ("false"/"true")

  // Optional flags
  isPendingApproval?: boolean; // for newly registered users waiting for approval
}

// Business Info (your company)
export interface TeDhenatBiznesit {
  EmriIBiznesit: string
  ShkurtesaEmritBiznesit?: string
  NUI?: string
  NF?: string
  NrTVSH?: string
  Adresa: string
  NrKontaktit: string
  Email: string
  Logo?: string
}
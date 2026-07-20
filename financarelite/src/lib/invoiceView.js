/** Assembles the `data` shape the Fatura design components expect, from either an
 * IndexedDB invoice record or a decoded share-link payload — same shape either way. */
export function buildFaturaData({ invoice, teDhenatBiznesit, banks, currencies }) {
  const klienti = invoice.klienti || {};
  return {
    teDhenatBiznesit: teDhenatBiznesit || {},
    bankat: banks || [],
    currencies: currencies || [],
    produktet: invoice.items || [],
    teDhenatFat: {
      regjistrimet: {
        llojiKalkulimit: invoice.llojiDokumentit || "FAT",
        nrFatures: invoice.nrFatures,
        nrRendorFatures: invoice.nrRendorFatures,
        dataRegjistrimit: invoice.dataRegjistrimit,
        pershkrimShtese: invoice.pershkrimShtese,
        transporti: invoice.transporti,
        emriBiznesit: klienti.emriBiznesit,
        nui: klienti.nui,
        nrf: klienti.nrf,
        partneriTVSH: klienti.tvsh,
        adresa: klienti.adresa,
        nrKontaktit: klienti.nrKontaktit,
        email: klienti.email,
      },
    },
  };
}

/** Generates the next `nrFatures` in the same format the original barcode uses. `prefix`
 * marks the document type (FAT/POR/KTHIM) in the middle segment. */
export function generateNrFatures(shkurtesaEmritBiznesit, nrRendorFatures, date = new Date(), prefix = "FAT") {
  const dita = date.getDate().toString().padStart(2, "0");
  const muaji = (date.getMonth() + 1).toString().padStart(2, "0");
  const viti = date.getFullYear().toString().slice(-2);
  return `${shkurtesaEmritBiznesit || "FAT"}-${dita}${muaji}${viti}-${prefix}-${nrRendorFatures}`;
}

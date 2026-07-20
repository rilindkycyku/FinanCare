/**
 * Shared TVSH/rabat math for invoice line items — the same formulas used inside
 * FooterFatura.jsx and TeDhenatFatura.jsx, extracted so the invoice builder's live
 * preview, the printable Fatura view, and the share-link payload all agree on totals.
 */

export function calcLineItem(item) {
  const qmimiShites = parseFloat(item.qmimiShites) || 0;
  const sasia = parseFloat(item.sasiaStokut ?? item.sasia) || 0;
  const tvshRate = parseFloat(item.llojiTVSH) || 0;
  const rabati1 = parseFloat(item.rabati1) || 0;
  const rabati2 = parseFloat(item.rabati2) || 0;
  const rabati3 = parseFloat(item.rabati3) || 0;
  const totalRabati = (rabati1 + rabati2 + rabati3) / 100;
  const qmimiPaTVSH = qmimiShites / (1 + tvshRate / 100);
  const qmimiMeRabat = qmimiShites * (1 - totalRabati);
  const tvshValue = qmimiMeRabat * (tvshRate / 100) * sasia;
  const shuma = qmimiMeRabat * sasia;

  return { sasia, tvshRate, rabati1, rabati2, rabati3, qmimiPaTVSH, qmimiMeRabat, tvshValue, shuma };
}

export function calcInvoiceTotals(items, transporti = 0) {
  let totaliMeTVSH = 0;
  let totaliPaTVSH = 0;
  let tvsH8 = 0;
  let tvsH18 = 0;
  let rabati = 0;

  (items || []).forEach((item) => {
    const sasia = parseFloat(item.sasiaStokut ?? item.sasia) || 0;
    const cmimi = parseFloat(item.qmimiShites) || 0;
    const tvshPerc = parseFloat(item.llojiTVSH) || 0;
    const rabatPerc =
      (parseFloat(item.rabati1) || 0) + (parseFloat(item.rabati2) || 0) + (parseFloat(item.rabati3) || 0);

    const totalBeforeDiscount = sasia * cmimi;
    const discountAmount = totalBeforeDiscount * (rabatPerc / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    const paTvsh = totalAfterDiscount / (1 + tvshPerc / 100);
    const tvshVal = totalAfterDiscount - paTvsh;

    totaliMeTVSH += totalAfterDiscount;
    totaliPaTVSH += paTvsh;
    rabati += discountAmount;

    if (tvshPerc === 8) tvsH8 += tvshVal;
    else if (tvshPerc === 18) tvsH18 += tvshVal;
  });

  const transportiVal = parseFloat(transporti) || 0;
  const totaliFinal = totaliMeTVSH + transportiVal;

  return { totaliMeTVSH, totaliPaTVSH, tvsH8, tvsH18, rabati, transporti: transportiVal, totaliFinal };
}

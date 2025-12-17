import jsPDF from 'jspdf';

// Utility to load image
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

// Generate Invoice PDF with jsPDF
async function generateInvoice(
  data,
  teDhenatBiznesit,
  setTipiMesazhit,
  setPershkrimiMesazhit,
  setShfaqMesazhin,
  setPerditeso,
  setShumaPageses,
  setLlojiPageses,
  setOptionsBarkodiSelected,
  setIDPartneri,
  setTeDhenatKartelaBleresit,
  setIDProduktiFunditShtuar,
  setKartelaBleresit,
  setRabati1,
  setRabati2
) {
  const initialDoc = new jsPDF({ unit: 'mm', format: [75, 1000] });
  const logoUrl = `${import.meta.env.VITE_BASE_URL}/img/web/${teDhenatBiznesit?.logo}`;
  let logoImage;
  try {
    logoImage = await loadImage(logoUrl);
  } catch (error) {
    console.warn('Failed to load logo:', error);
    logoImage = null;
  }
  initialDoc.addImage(logoImage || '', 'PNG', 10, 5, 55, 15);
  let currentY = 25;

  function addShrinkText(doc, text, x, y, maxWidth) {
    let fontSize = 10;
    doc.setFont('Courier');
    doc.setFontSize(fontSize);
    while (doc.getTextWidth(text) > maxWidth && fontSize > 7) {
      fontSize -= 1;
      doc.setFontSize(fontSize);
    }
    doc.text(text, x, y, { align: 'center' });
  }

  addShrinkText(initialDoc, teDhenatBiznesit?.emriIBiznesit || 'Unknown Business', 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `Adresa: ${teDhenatBiznesit?.adresa || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `Kontakti: ${teDhenatBiznesit?.nrKontaktit || 'N/A'} - ${teDhenatBiznesit?.email || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `NUI: ${teDhenatBiznesit?.nui || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `TVSH: ${teDhenatBiznesit?.nrTVSH || 'N/A'}`, 38.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `NRF: ${teDhenatBiznesit?.nf || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  initialDoc.line(0, currentY, 75, currentY);
  currentY += 5;

  addShrinkText(initialDoc, 'PARAGON', 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `Paragon #: ${data.invoiceNumber || 'N/A'}`, 26.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `Data: ${data.date || 'N/A'}`, 18, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `Shitësi: ${data.salesUsername || 'N/A'}`, 32.5, currentY, 70);
  currentY += 5;
  initialDoc.line(0, currentY, 75, currentY);
  currentY += 5;

  currentY += 5;
  addShrinkText(initialDoc, 'Produkti', 11, currentY, 30);
  addShrinkText(initialDoc, 'TVSH (%)', 63, currentY, 20);
  currentY += 5;
  addShrinkText(initialDoc, 'Çmimi', 11, currentY, 20);
  addShrinkText(initialDoc, 'Sasia', 38, currentY, 20);
  addShrinkText(initialDoc, 'Totali', 63, currentY, 20);
  currentY += 5;
  addShrinkText(initialDoc, '----------------------------------', 37.5, currentY, 70);
  currentY += 5;

  data.items.forEach((item) => {
    addShrinkText(initialDoc, item.name, 38, currentY, 30);
    currentY += 5;
    addShrinkText(initialDoc, `${parseFloat(item.vatPercentage).toFixed(2)} %`, 63, currentY, 20);
    currentY += 5;
    addShrinkText(initialDoc, `${parseFloat(item.price).toFixed(2)} €`, 11, currentY, 20);
    addShrinkText(initialDoc, `${item.quantity}`, 38, currentY, 20);
    addShrinkText(initialDoc, `${parseFloat(item.total).toFixed(2)} €`, 63, currentY, 20);
    currentY += 5;
    addShrinkText(initialDoc, '----------------------------------', 37.5, currentY, 70);
    currentY += 5;
  });
  initialDoc.line(0, currentY, 75, currentY);
  currentY += 5;

  addShrinkText(initialDoc, `Totali pa TVSH: ${data.totalWithoutVAT} €`, 25.5, currentY, 70);
  currentY += 5;
  addShrinkText(initialDoc, `TVSH: ${data.vat} €`, 14, currentY, 70);
  currentY += 5;
  addShrinkText(
    initialDoc,
    `Totali pa Rabat: ${parseFloat(
      parseFloat(data.totalWithoutVAT) + parseFloat(data.vat) + parseFloat(data.rabati)
    ).toFixed(2)} €`,
    26.5,
    currentY,
    70
  );
  currentY += 5;
  addShrinkText(initialDoc, `Rabati: ${data.rabati} €`, 16.5, currentY, 70);
  currentY += 5;
  addShrinkText(
    initialDoc,
    `Totali: ${parseFloat(
      parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)
    ).toFixed(2)} €`,
    17.5,
    currentY,
    70
  );
  currentY += 10;
  addShrinkText(initialDoc, 'Faleminderit për blerjen!', 37.5, currentY, 70);

  const finalHeight = currentY + 20;
  const doc = new jsPDF({ unit: 'mm', format: [75, finalHeight] });
  doc.addImage(logoImage || '', 'PNG', 10, 5, 55, 15);
  currentY = 25;

  addShrinkText(doc, teDhenatBiznesit?.emriIBiznesit || 'Unknown Business', 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `Adresa: ${teDhenatBiznesit?.adresa || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `Kontakti: ${teDhenatBiznesit?.nrKontaktit || 'N/A'} - ${teDhenatBiznesit?.email || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `NUI: ${teDhenatBiznesit?.nui || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `TVSH: ${teDhenatBiznesit?.nrTVSH || 'N/A'}`, 38.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `NRF: ${teDhenatBiznesit?.nf || 'N/A'}`, 37.5, currentY, 70);
  currentY += 5;
  doc.line(0, currentY, 75, currentY);
  currentY += 5;

  addShrinkText(doc, 'PARAGON', 37.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `Paragon #: ${data.invoiceNumber || 'N/A'}`, 26.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `Data: ${data.date || 'N/A'}`, 18, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `Shitësi: ${data.salesUsername || 'N/A'}`, 32.5, currentY, 70);
  currentY += 5;
  doc.line(0, currentY, 75, currentY);
  currentY += 5;

  currentY += 5;
  addShrinkText(doc, 'Produkti', 11, currentY, 30);
  addShrinkText(doc, 'TVSH (%)', 63, currentY, 20);
  currentY += 5;
  addShrinkText(doc, 'Çmimi', 11, currentY, 20);
  addShrinkText(doc, 'Sasia', 38, currentY, 20);
  addShrinkText(doc, 'Totali', 63, currentY, 20);
  currentY += 5;
  addShrinkText(doc, '----------------------------------', 37.5, currentY, 70);
  currentY += 5;

  data.items.forEach((item) => {
    addShrinkText(doc, item.name, 38, currentY, 30);
    currentY += 5;
    addShrinkText(doc, `${parseFloat(item.vatPercentage).toFixed(2)} %`, 63, currentY, 20);
    currentY += 5;
    addShrinkText(doc, `${parseFloat(item.price).toFixed(2)} €`, 11, currentY, 20);
    addShrinkText(doc, `${item.quantity}`, 38, currentY, 20);
    addShrinkText(doc, `${parseFloat(item.total).toFixed(2)} €`, 63, currentY, 20);
    currentY += 5;
    addShrinkText(doc, '----------------------------------', 37.5, currentY, 70);
    currentY += 5;
  });
  doc.line(0, currentY, 75, currentY);
  currentY += 5;

  addShrinkText(doc, `Totali pa TVSH: ${data.totalWithoutVAT} €`, 25.5, currentY, 70);
  currentY += 5;
  addShrinkText(doc, `TVSH: ${data.vat} €`, 14, currentY, 70);
  currentY += 5;
  addShrinkText(
    doc,
    `Totali pa Rabat: ${parseFloat(
      parseFloat(data.totalWithoutVAT) + parseFloat(data.vat) + parseFloat(data.rabati)
    ).toFixed(2)} €`,
    26.5,
    currentY,
    70
  );
  currentY += 5;
  addShrinkText(doc, `Rabati: ${data.rabati} €`, 16.5, currentY, 70);
  currentY += 5;
  addShrinkText(
    doc,
    `Totali: ${parseFloat(
      parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)
    ).toFixed(2)} €`,
    17.5,
    currentY,
    70
  );
  currentY += 10;
  addShrinkText(doc, 'Faleminderit për blerjen!', 37.5, currentY, 70);

  doc.save(`Paragon #${data.invoiceNumber || 'unknown'}.pdf`);

  setPerditeso(Date.now());
  setShumaPageses(0);
  setLlojiPageses('Cash');
  setOptionsBarkodiSelected(null);
  setIDPartneri(1);
  setTeDhenatKartelaBleresit(null);
  setIDProduktiFunditShtuar(null);
  setKartelaBleresit(null);
  setRabati2(0);
  setRabati1(0);
}

export default generateInvoice;
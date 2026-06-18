import jsPDF from "jspdf";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

/**
 * Builds and outputs the POS "Paragon" receipt PDF (75mm thermal width).
 * Pure PDF generation only — does not touch any POS/cart state.
 *
 * @param {object} data - { invoiceNumber, date, salesUsername, items, totalWithoutVAT, vat, rabati }
 * @param {object} opts - { teDhenatBiznesit, baseUrl, llojiPageses, action: "download" | "print" | "none" }
 */
export async function generateInvoiceReceipt(data, opts = {}) {
  const { teDhenatBiznesit, baseUrl = "", llojiPageses = "Cash", action = "none" } = opts;

  const logoUrl = `${baseUrl}/img/web/${teDhenatBiznesit?.logo}`;
  let logoImage = null;
  try {
    logoImage = await loadImage(logoUrl);
  } catch (e) {
    console.warn("Logo not found for receipt:", e);
  }

  function drawReceipt(doc, isMeasuring) {
    let y = 6;

    if (logoImage && !isMeasuring) {
      doc.addImage(logoImage, "PNG", 22.5, y, 30, 12);
      y += 16;
    } else if (logoImage && isMeasuring) {
      y += 16;
    }

    const centerText = (txt, size, font = "Helvetica", style = "normal") => {
      if (!isMeasuring) {
        doc.setFont(font, style);
        doc.setFontSize(size);
        const block = doc.splitTextToSize(String(txt || ""), 65);
        doc.text(block, 37.5, y, { align: "center" });
        y += block.length * (size * 0.35) + 1;
      } else {
        y += Math.max(1, Math.ceil(String(txt || "").length / 40)) * (size * 0.35) + 1;
      }
    };

    centerText(teDhenatBiznesit?.emriIBiznesit || "FinanCare", 11, "Helvetica", "bold");
    centerText(`Adresa: ${teDhenatBiznesit?.adresa || ""}`, 8);
    centerText(`Tel: ${teDhenatBiznesit?.nrKontaktit || ""}`, 8);
    centerText(`NUI: ${teDhenatBiznesit?.nui || ""} / NRT: ${teDhenatBiznesit?.nrTVSH || ""}`, 8);
    centerText(`NRF: ${teDhenatBiznesit?.nf || ""}`, 8);
    y += 2;

    const drawSolidLine = () => {
      if (!isMeasuring) {
        doc.setLineWidth(0.3);
        doc.line(5, y, 70, y);
      }
    };

    const drawDashedLine = () => {
      if (!isMeasuring) {
        doc.setFont("Courier", "normal");
        doc.setFontSize(10);
        doc.text("-".repeat(32), 37.5, y, { align: "center" });
      }
    };

    drawSolidLine();
    y += 5;

    centerText("P A R A G O N", 10, "Helvetica", "bold");
    y += 1;

    const rowMeta = (lbl, val) => {
      if (!isMeasuring) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.text(lbl, 5, y);
        doc.text(String(val), 70, y, { align: "right" });
      }
      y += 4;
    };

    rowMeta("Fatura Nr:", data.invoiceNumber || "");
    rowMeta("Data:", data.date || "");
    rowMeta("Shitësi:", data.salesUsername || "");

    y += 1;
    drawSolidLine();
    y += 5;

    if (!isMeasuring) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("PRODUKTI", 5, y);
      doc.text("SASIA", 43, y, { align: "right" });
      doc.text("ÇMIMI", 56, y, { align: "right" });
      doc.text("SHUMA", 70, y, { align: "right" });
    }
    y += 2.5;
    drawDashedLine();
    y += 4.5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item) => {
        const salePercent = parseFloat(item?.rabatiStok || 0);
        const finalPrice = parseFloat(item?.price || 0);
        const originalPrice = salePercent > 0 ? finalPrice / (1 - salePercent / 100) : finalPrice;

        if (!isMeasuring) {
          let itemName = String(item?.name || "Produkti");
          let name = itemName.length > 20 ? itemName.substring(0, 18) + ".." : itemName;
          doc.setFont("Helvetica", "normal");
          doc.text(name, 5, y);
          doc.text(String(item?.quantity || 1), 43, y, { align: "right" });
          doc.text(`${finalPrice.toFixed(2)}`, 56, y, { align: "right" });
          doc.setFont("Helvetica", "bold");
          doc.text(`${parseFloat(item?.total || 0).toFixed(2)}`, 70, y, { align: "right" });
        }
        y += 4.5;

        // Show original price and discount badge when item is on sale
        if (salePercent > 0 && !isMeasuring) {
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(`  Çmimi: ${originalPrice.toFixed(2)} | -${salePercent}% Zbritje`, 5, y);
          doc.setTextColor(0, 0, 0);
          y += 3.5;
        } else if (salePercent > 0) {
          y += 3.5;
        }
      });
    }

    y += 1;
    drawSolidLine();
    y += 5;

    const rowTotal = (lbl, val, bold = false) => {
      if (!isMeasuring) {
        doc.setFont("Helvetica", bold ? "bold" : "normal");
        doc.setFontSize(8.5);
        doc.text(lbl, 35, y);
        doc.text(String(val), 70, y, { align: "right" });
      }
      y += 4.5;
    };

    rowTotal("Totali pa TVSH:", `${parseFloat(data.totalWithoutVAT).toFixed(2)} €`);
    rowTotal("TVSH totale:", `${parseFloat(data.vat).toFixed(2)} €`);
    if (parseFloat(data.rabati) > 0) {
      if (!isMeasuring) doc.setTextColor(34, 197, 94);
      rowTotal("Kursyet (e përfsh.):", `${parseFloat(data.rabati).toFixed(2)} €`, true);
      if (!isMeasuring) doc.setTextColor(0, 0, 0);
    }

    y += 2;
    drawSolidLine();
    y += 7;

    const totalAmount = parseFloat(parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)).toFixed(2);

    if (!isMeasuring) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("TOTALI:", 5, y);
      doc.text(`${totalAmount} €`, 70, y, { align: "right" });
    }
    y += 8;

    rowMeta("Mënyra e Pagesës:", llojiPageses || "Cash");

    y += 3;
    drawDashedLine();
    y += 7;

    if (!isMeasuring) {
      doc.setFont("Helvetica", "bolditalic");
      doc.setFontSize(9);
      doc.text("Faleminderit për blerjen tuaj!", 37.5, y, { align: "center" });
    }

    y += 12; // Bottom padding
    return y;
  }

  const dummyDoc = new jsPDF({ unit: "mm", format: [75, 1000] });
  const finalHeight = drawReceipt(dummyDoc, true);

  const doc = new jsPDF({ unit: "mm", format: [75, finalHeight] });
  drawReceipt(doc, false);

  if (action === "download") {
    doc.save(`Paragon #${data.invoiceNumber}.pdf`);
  } else if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }

  return doc;
}

export default generateInvoiceReceipt;

import { useState } from "react";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button, Modal, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faListCheck, faFilePdf, faXmark } from "@fortawesome/free-solid-svg-icons";

const PrintLabels = ({ storeName, products }) => {
  const [showModal, setShowModal] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Optimized Grid Settings (3x10 = 30 labels per page)
    const columns = 3;
    const rows = 10;
    const margin = 5;
    const gutter = 1; // Gap between labels for easy cutting
    const labelWidth = (210 - (margin * 2) - (gutter * (columns - 1))) / columns;
    const labelHeight = (297 - (margin * 2) - (gutter * (rows - 1))) / rows;
    const padding = 1.5;

    let xPos = margin;
    let yPos = margin;
    let itemCount = 0;

    // Helper to get optimal font size for a single line (like price)
    const getOptimalFontSize = (text, maxWidth, maxFontSize = 18, minFontSize = 10) => {
      const scaleFactor = doc.internal.scaleFactor;
      let fontSize = maxFontSize;
      while (fontSize >= minFontSize) {
        const textWidth = (doc.getStringUnitWidth(text) * fontSize) / scaleFactor;
        if (textWidth <= maxWidth) {
          return fontSize;
        }
        fontSize -= 0.5;
      }
      return minFontSize;
    };

    // Helper to get optimal font size for the product name (wrapped up to 2 lines)
    const getOptimalFontSizeForName = (text, maxWidth, maxHeight, maxFontSize = 9, minFontSize = 5.2) => {
      const scaleFactor = doc.internal.scaleFactor;
      let fontSize = maxFontSize;
      while (fontSize >= minFontSize) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Height check
        const totalHeight = lines.length * (fontSize / scaleFactor) * 1.25;
        if (lines.length <= 2 && totalHeight <= maxHeight) {
          let fits = true;
          for (const line of lines) {
            const lineWidth = (doc.getStringUnitWidth(line) * fontSize) / scaleFactor;
            if (lineWidth > maxWidth) {
              fits = false;
              break;
            }
          }
          if (fits) {
            return { fontSize, lines };
          }
        }
        fontSize -= 0.5;
      }
      
      // Fallback
      doc.setFont("helvetica", "bold");
      doc.setFontSize(minFontSize);
      const lines = doc.splitTextToSize(text, maxWidth).slice(0, 2);
      return { fontSize: minFontSize, lines };
    };

    products.forEach((product) => {
      if (itemCount !== 0 && itemCount % (columns * rows) === 0) {
        doc.addPage();
        xPos = margin;
        yPos = margin;
      }

      // Draw Label Background (White)
      doc.setFillColor(255, 255, 255);
      doc.rect(xPos, yPos, labelWidth, labelHeight, "F");

      // Draw Outer Border
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.setLineWidth(0.1);
      doc.rect(xPos, yPos, labelWidth, labelHeight, "S");

      // Product Name (wrapped and scaled dynamically)
      const nameMaxWidth = labelWidth - 4.0;
      const nameMaxHeight = 8.0;
      const { fontSize: nameFontSize, lines: nameLines } = getOptimalFontSizeForName(
        product.name,
        nameMaxWidth,
        nameMaxHeight,
        12.0,
        7.0
      );

      // Vertically center the name based on the number of lines
      let nameStartY = yPos + 7.5; // Push down for 1 line so it fills the space
      if (nameLines.length > 1) {
        nameStartY = yPos + 5.5; // Keep higher for 2 lines
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(nameFontSize);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text(nameLines, xPos + 2.0, nameStartY);

      // Thin Horizontal Divider Line
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.12);
      doc.line(xPos + 2.0, yPos + 11.5, xPos + labelWidth - 2.0, yPos + 11.5);

      // Price Formatting (Main focus)
      const priceText = `${parseFloat(product.price).toFixed(2)}`;
      const priceMaxWidth = 39.0;
      // Cap the font size at 40 so it doesn't grow too tall and overlap the divider line
      const priceFontSize = getOptimalFontSize(priceText, priceMaxWidth, 40, 24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(priceFontSize);
      doc.setTextColor(0, 0, 0);
      // Center the price horizontally within its 39mm allocated box (midpoint is 2.0 + 19.5 = 21.5)
      doc.text(priceText, xPos + 21.5, yPos + 25.5, { align: "center" });

      // Barcode Generation & Addition (Right bottom section)
      let barcodeImage = null;
      try {
        if (product.barcode && product.barcode.trim()) {
          const canvas = document.createElement("canvas");
          JsBarcode(canvas, product.barcode.trim(), {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
            margin: 0
          });
          barcodeImage = canvas.toDataURL("image/png");
        }
      } catch (err) {
        console.error("Barcode rendering failed for barcode:", product.barcode, err);
      }

      if (barcodeImage) {
        // Position barcode on the right column
        const bcWidth = 20.0;
        const bcHeight = 12.0;
        const bcX = xPos + labelWidth - 2.0 - bcWidth;
        const bcY = yPos + 13.0; // Align neatly under the divider
        doc.addImage(barcodeImage, "PNG", bcX, bcY, bcWidth, bcHeight);

        // Tiny barcode caption under the bars
        doc.setFont("courier", "bold");
        doc.setFontSize(5.0);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(product.barcode.trim(), bcX + (bcWidth / 2), yPos + 26.5, { align: "center" });
      }

      itemCount++;
      if (itemCount % columns === 0) {
        xPos = margin;
        yPos += labelHeight + gutter;
      } else {
        xPos += labelWidth + gutter;
      }
    });

    doc.save("Qmimorja.pdf");
  };

  return (
    <>
      <Button
        className="btn-save px-4 d-flex align-items-center gap-2"
        onClick={() => setShowModal(true)}
      >
        <FontAwesomeIcon icon={faPrint} />
        Shtyp Çmimet
      </Button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="sp-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faListCheck} className="text-primary" />
            Konfirmimi i Çmimores
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-white opacity-75 mb-1">Dyqani: <span className="text-white fw-bold">{storeName}</span></h6>
            <p className="text-white-50 small">Më poshtë është lista e produkteve që do të gjenerohen në PDF. Kontrolloni çmimet para shtypjes.</p>
          </div>

          <div className="sp-table-container custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table hover variant="dark" className="sp-table">
              <thead>
                <tr>
                  <th>Produkti</th>
                  <th>Barkodi</th>
                  <th className="text-end">Çmimi Pakicë</th>
                  <th className="text-end">Çmimi Shumicë</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{item.name}</td>
                      <td><code className="text-info">{item.barcode}</code></td>
                      <td className="text-end text-success fw-bold">{parseFloat(item.price).toFixed(2)}€</td>
                      <td className="text-end text-warning fw-bold">{parseFloat(item.wholesalePrice).toFixed(2)}€</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-white-50 italic">
                      Nuk ka produkte për të shtypur.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-white-50 small">
              Totali i Etiketave: <Badge bg="primary" className="ms-1">{products.length}</Badge>
            </div>
            <div className="text-white-50 small">
              Formati: <Badge bg="secondary" className="ms-1">A4 (3x10 Labels - Standard)</Badge>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel px-4" onClick={() => setShowModal(false)}>
            <FontAwesomeIcon icon={faXmark} className="me-2" />
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={() => {
              generatePDF();
              setShowModal(false);
            }}
            disabled={!products || products.length === 0}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            Gjenero PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PrintLabels;

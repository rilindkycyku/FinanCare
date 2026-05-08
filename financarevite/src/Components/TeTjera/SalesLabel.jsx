import { useState } from "react";
﻿import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button, Modal, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faFilePdf, faXmark, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

const SalesLabel = ({ storeName, products }) => {
  const [showModal, setShowModal] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Compact Sales Grid (3x6 = 18 labels per page)
    const columns = 3;
    const rows = 6;
    const margin = 5;
    const gutter = 2; // Spacing for easy cutting
    const labelWidth = (210 - (margin * 2) - (gutter * (columns - 1))) / columns;
    const labelHeight = (297 - (margin * 2) - (gutter * (rows - 1))) / rows;
    const padding = 3;

    let xPos = margin;
    let yPos = margin;
    let itemCount = 0;

    products.forEach((product) => {
      if (itemCount !== 0 && itemCount % (columns * rows) === 0) {
        doc.addPage();
        xPos = margin;
        yPos = margin;
      }

      // 1. Draw Border
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(xPos, yPos, labelWidth, labelHeight);

      // 2. Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(storeName.toUpperCase(), xPos + (labelWidth / 2), yPos + 4, { align: "center" });

      // 3. Sale Title
      doc.setFontSize(12);
      doc.setTextColor(220, 0, 0);
      doc.text("ZBRITJE", xPos + (labelWidth / 2), yPos + 9, { align: "center" });

      // 4. Product Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0);
      const productLines = doc.splitTextToSize(product.name, labelWidth - (padding * 2));
      doc.text(productLines, xPos + padding, yPos + 14);

      // 5. Price Section
      const priceY = yPos + labelHeight - 12;

      // Old Price
      doc.setFontSize(14);
      doc.setTextColor(200, 0, 0);
      const oldPriceText = `${parseFloat(product.normalPrice).toFixed(2)}€`;
      doc.text(oldPriceText, xPos + padding, priceY);

      const oldPriceWidth = doc.getTextWidth(oldPriceText);
      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(1);
      doc.line(xPos + padding - 0.5, priceY - 1, xPos + padding + oldPriceWidth + 0.5, priceY - 5);

      // New Price
      doc.setFontSize(28);
      doc.setTextColor(0, 150, 0);
      doc.text(`${parseFloat(product.salePrice).toFixed(2)}€`, xPos + padding, priceY + 9);

      // 6. Barcode
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, product.barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 14,
        margin: 0
      });
      const barcodeImage = canvas.toDataURL("image/png");
      doc.addImage(barcodeImage, "PNG", xPos + labelWidth - 28, yPos + labelHeight - 11, 25, 8);

      itemCount++;
      if (itemCount % columns === 0) {
        xPos = margin;
        yPos += labelHeight + gutter;
      } else {
        xPos += labelWidth + gutter;
      }
    });

    doc.save("QmimorjaZbritjes.pdf");
  };

  return (
    <>
      <Button
        className="btn-save px-4 d-flex align-items-center gap-2 mt-3"
        onClick={() => setShowModal(true)}
      >
        <FontAwesomeIcon icon={faTags} />
        Shtyp Etiketat e Zbritjes
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
            <FontAwesomeIcon icon={faTags} className="text-danger" />
            Konfirmimi i Etiketave të Zbritjes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-white opacity-75 mb-1">Fushata: <span className="text-white fw-bold">Ofertë me Zbritje</span></h6>
            <p className="text-white-50 small">Kontrolloni çmimet e vjetra dhe të reja si dhe datat e vlefshmërisë para gjenerimit të PDF.</p>
          </div>

          <div className="sp-table-container custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table hover variant="dark" className="sp-table">
              <thead>
                <tr>
                  <th>Produkti</th>
                  <th className="text-center">Vlefshmëria</th>
                  <th className="text-end">Çmimi Vjetër</th>
                  <th className="text-end">Çmimi Ri</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{item.name}</td>
                      <td className="text-center small">
                        <Badge bg="dark" className="border border-secondary">
                          <FontAwesomeIcon icon={faCalendarDays} className="me-1 text-info" />
                          {item.dataZbritjes} - {item.dataSkadimit}
                        </Badge>
                      </td>
                      <td className="text-end text-danger text-decoration-line-through">{parseFloat(item.normalPrice).toFixed(2)}€</td>
                      <td className="text-end text-success fw-bold" style={{ fontSize: '1.1rem' }}>{parseFloat(item.salePrice).toFixed(2)}€</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-white-50 italic">
                      Nuk ka oferta për të shtypur.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-white-50 small">
              Totali i Ofertave: <Badge bg="danger" className="ms-1">{products.length}</Badge>
            </div>
            <div className="text-white-50 small">
              Formati: <Badge bg="secondary" className="ms-1">A4 (3x6 Labels - Compact)</Badge>
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
            variant="danger"
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

export default SalesLabel;

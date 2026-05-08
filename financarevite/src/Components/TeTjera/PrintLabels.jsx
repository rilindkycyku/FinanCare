import { useState } from "react";
﻿import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button, Modal, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faListCheck, faFilePdf, faXmark } from "@fortawesome/free-solid-svg-icons";

const PrintLabels = ({ storeName, products }) => {
  const [showModal, setShowModal] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Optimized Compact Grid Settings (4x13 = 52 labels per page)
    const columns = 4;
    const rows = 13;
    const margin = 5;
    const gutter = 1; // Gap between labels for easy cutting
    const labelWidth = (210 - (margin * 2) - (gutter * (columns - 1))) / columns;
    const labelHeight = (297 - (margin * 2) - (gutter * (rows - 1))) / rows;
    const padding = 1.5;

    let xPos = margin;
    let yPos = margin;
    let itemCount = 0;

    products.forEach((product) => {
      if (itemCount !== 0 && itemCount % (columns * rows) === 0) {
        doc.addPage();
        xPos = margin;
        yPos = margin;
      }

      // Draw Border
      doc.setDrawColor(200);
      doc.setLineWidth(0.05);
      doc.rect(xPos, yPos, labelWidth, labelHeight);

      // Header: Store Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.5);
      doc.setTextColor(100);
      doc.text(storeName.toUpperCase(), xPos + padding, yPos + 2.5);

      // Product Name (Compact)
      doc.setFontSize(6.5);
      doc.setTextColor(0);
      const productLines = doc.splitTextToSize(product.name, labelWidth - (padding * 2));
      doc.text(productLines, xPos + padding, yPos + 6);

      // PRICE (Main Focus)
      doc.setFontSize(14);
      const priceText = `${parseFloat(product.price).toFixed(2)}€`;
      doc.text(priceText, xPos + padding, yPos + 13.5);

      // Wholesale Price (Small footer)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4);
      doc.setTextColor(80);
      doc.text("QM. SH:", xPos + padding, yPos + 17);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text(`${parseFloat(product.wholesalePrice).toFixed(2)}€`, xPos + padding, yPos + 20);

      // Barcode (Right Bottom)
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, product.barcode, {
        format: "CODE128",
        width: 1,
        height: 25,
        displayValue: true,
        fontSize: 14,
        margin: 0
      });
      const barcodeImage = canvas.toDataURL("image/png");
      doc.addImage(barcodeImage, "PNG", xPos + labelWidth - 21, yPos + 13.5, 20, 5.5);

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
              Formati: <Badge bg="secondary" className="ms-1">A4 (4x13 Labels - Compact)</Badge>
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

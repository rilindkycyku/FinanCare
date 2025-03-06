import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

const SalesLabel = ({ storeName, products }) => {
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;

    // Label size for 2 by 2 layout (4 labels per page)
    const labelWidth = pageWidth / 2 - 6; // Reduced external margin
    const labelHeight = pageHeight / 2 - 6; // Reduced external margin
    const margin = 3; // Reduced margin
    const columns = 2;
    const rows = 2;
    const padding = 4; // Reduced padding inside the label

    let xPos = margin;
    let yPos = margin;
    let itemCount = 0;

    // Set the border thickness for labels
    doc.setLineWidth(0.5);

    products.forEach((product) => {
      if (itemCount !== 0 && itemCount % (columns * rows) === 0) {
        doc.addPage();
        xPos = margin;
        yPos = margin;
      }

      // Draw the border for each label
      doc.rect(xPos, yPos, labelWidth, labelHeight);

      // Store Name (center-aligned, larger)
      doc.setFontSize(18); // Larger size for store name
      doc.text(storeName, xPos + labelWidth / 2, yPos + 14, { align: "center" });

      // "Oferta me Zbritje" (center-aligned, larger)
      doc.setFontSize(16); // Increased size for the offer text
      doc.text("OFERTA ME ZBRITJE", xPos + labelWidth / 2, yPos + 24, { align: "center" });

      // Offer validity dates (center-aligned, larger)
      const validityText = `Oferta Vlen prej ${product.dataZbritjes} deri ${product.dataSkadimit}`;
      doc.setFontSize(12); // Slightly reduced font size for dates to fit better
      doc.text(validityText, xPos + labelWidth / 2, yPos + 32, { align: "center" });

      // Product Name (center-aligned, larger)
      doc.setFontSize(14); // Increased size for product name
      const productLines = doc.splitTextToSize(
        product.name,
        labelWidth - 2 * padding
      );
      doc.text(productLines, xPos + padding, yPos + 42);

      // Move the price section to the bottom
      const bottomYPos = yPos + labelHeight - 20; // Adjusted to the bottom with padding

      // Normal Price (with strikethrough, larger and colored)
      doc.setFontSize(80); // Bigger size for prices
      const normalPriceX = xPos + padding;
      const normalPriceText = `${product.normalPrice.toFixed(2)}€`;

      // Set color for normal price and strikethrough
      doc.setTextColor(255, 0, 0); // Red for normal price

      // Move the normal price slightly higher for better spacing
      const normalPriceYPos = bottomYPos - 30; // Moved 30mm above sale price
      doc.text(normalPriceText, normalPriceX, normalPriceYPos);

      // Strikethrough for the normal price (draw a line over the text)
      const textWidth = doc.getTextWidth(normalPriceText); // Get text width for proper alignment
      doc.setLineWidth(2); // Thicker line for strikethrough
      doc.line(normalPriceX - 2, normalPriceYPos - 5, normalPriceX + textWidth + 3, normalPriceYPos - 18); // Adjusted strikethrough for new position

      // Sale Price (directly under the normal price, larger and more prominent, with a different color)
      doc.setFontSize(100); // Bigger size for sale price
      doc.setTextColor(0, 128, 0); // Green for sale price
      doc.text(`${product.salePrice.toFixed(2)}€`, normalPriceX, bottomYPos + 10); // Positioned under the normal price

      // Reset color for other text elements
      doc.setTextColor(0, 0, 0); // Reset to black

      // Generate barcode inside the label at the very bottom
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, product.barcode, {
        format: "CODE128",
        width: 2,
        height: 30,
        displayValue: true,
        fontSize: 10, // Smaller font size for barcode value
      });
      const barcodeImage = canvas.toDataURL("image/png");
      doc.addImage(barcodeImage, "PNG", xPos + 10, yPos + labelHeight - 25, 80, 15); // Adjusted size and position

      // Update positions for the next label
      itemCount++;
      if (itemCount % columns === 0) {
        xPos = margin;
        yPos += labelHeight + margin; // Move down to the next row
      } else {
        xPos += labelWidth + margin; // Move to the next column
      }
    });

    doc.save("QmimorjaZbritjes.pdf");
  };

  return (
    <div>
      <Button variant="success" onClick={generatePDF}>
        Shtyp Etiketat <FontAwesomeIcon icon={faPrint} />
      </Button>
    </div>
  );
};

export default SalesLabel;

import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

const PrintLabels = ({ storeName, products }) => {
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size
    const pageWidth = 210; // A4 page width in mm
    const pageHeight = 297; // A4 page height in mm

    // Label size and position
    const labelWidth = 65; // Width of each label
    const labelHeight = 30; // Height of each label
    const margin = 2; // Reduced margin for each label
    const columns = 3; // Number of columns
    const rows = 9; // Number of rows
    const padding = 1; // Reduced padding inside each label

    // Heights for the two sections of the label
    const topSectionHeight = labelHeight / 2;
    const bottomSectionHeight = labelHeight / 2;

    let xPos = margin; // Horizontal start position for labels
    let yPos = margin; // Vertical start position for labels
    let itemCount = 0;

    products.forEach((product) => {
      if (itemCount !== 0 && itemCount % (columns * rows) === 0) {
        doc.addPage(); // Add a new page after filling the previous one
        xPos = margin;
        yPos = margin;
      }

      // Draw the border for each label
      doc.rect(xPos, yPos, labelWidth, labelHeight);

      // Store Name (aligned on top, larger font size)
      doc.setFontSize(7); // Adjusted font size
      doc.text(storeName, xPos + padding, yPos + 4); // Reduced padding on top

      // Product Name (wrapped text within top half of the label)
      doc.setFontSize(9); // Font size for product name
      const productLines = doc.splitTextToSize(
        product.name,
        labelWidth - 2 * padding
      );
      const productTextHeight = productLines.length * 7; // Calculate total height of text
      doc.text(productLines, xPos + padding, yPos + 10); // Write product name

      // Adjust y position for price and barcode if product name is long
      const adjustedYPos = yPos + topSectionHeight;

      // Price (increased size, without text)
      doc.setFontSize(15); // Increased font size
      doc.text(`${product.price.toFixed(2)}€`, xPos + 5, adjustedYPos + 5); // Positioned in the bottom half

      // Wholesale Price (aligned with price, in the same column)
      doc.setFontSize(8); // Reduced font size
      doc.text(
        `${product.wholesalePrice.toFixed(2)}€ - Q. SH.`,
        xPos + 5,
        adjustedYPos + 12
      ); // Positioned below price

      // Generate barcode inside the label, at the bottom
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, product.barcode, {
        format: "CODE128",
        width: 1.5, // Barcode width
        height: 20, // Reduced height for barcode
        displayValue: true, // Show barcode value
        fontSize: 17, // Smaller font size for barcode value
      });
      const barcodeImage = canvas.toDataURL("image/png");
      doc.addImage(barcodeImage, "PNG", xPos + 25, adjustedYPos + 3, 35, 11); // Adjusted size and position

      // Update positions for the next label
      itemCount++;
      if (itemCount % columns === 0) {
        xPos = margin;
        yPos += labelHeight + 2; // Move down for the next row
      } else {
        xPos += labelWidth + 2; // Move right for the next column
      }
    });

    doc.save("Qmimorja.pdf"); // Save the PDF
  };

  return (
    <div>
      <Button className="mb-3 Butoni" onClick={() => generatePDF()}>
        Shtyp Qmimet <FontAwesomeIcon icon={faPrint} />
      </Button>
    </div>
  );
};

export default PrintLabels;

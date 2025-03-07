import { useBarcode } from "next-barcode";

const Barkodi = ({ value }) => {
  const { inputRef } = useBarcode({ value: value || "" });
  return <svg ref={inputRef} style={{ width: "100px", height: "60px" }} />;
};

export default Barkodi;
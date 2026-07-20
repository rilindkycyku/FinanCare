import { ArrowDownAZ, ArrowUpZA, ArrowUpDown } from "lucide-react";

/** Same intent as FinanCare's SortIcon.jsx, using lucide-react (already a dependency) instead
 * of pulling in the FontAwesome packages just for three glyphs. */
function SortIcon({ type, direction }) {
  if (type === "text") {
    return direction === "ascending" ? <ArrowDownAZ size={14} /> : <ArrowUpZA size={14} />;
  }
  return <ArrowUpDown size={14} />;
}

export default SortIcon;

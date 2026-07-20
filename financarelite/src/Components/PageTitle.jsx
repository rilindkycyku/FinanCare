import { useEffect } from "react";

/** Sets document.title, e.g. "Faturat | FinanCareLite" — avoids pulling in react-helmet for one line. */
function PageTitle({ title }) {
  useEffect(() => {
    document.title = title ? `${title} | FinanCareLite` : "FinanCareLite";
  }, [title]);
  return null;
}

export default PageTitle;

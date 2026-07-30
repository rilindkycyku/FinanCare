import { Font } from "@react-pdf/renderer";

/** Font setup for every part of the printed invoice. Imported for its side effects — each of the
 * invoice's pieces (header, item table, footer) used to carry its own copy of this. */

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

// react-pdf hyphenates long words to fit a narrow column, which on an invoice means an email
// address printed as "besa1ka-canik@gmail.com" — a broken address reads as a typo, and someone
// copying it by hand will type the hyphen. Returning the word whole tells the layout not to
// split anything: it moves the address to the next line instead, or lets it run to the column's
// edge. Applies to product names and addresses for the same reason.
Font.registerHyphenationCallback((word) => [word]);

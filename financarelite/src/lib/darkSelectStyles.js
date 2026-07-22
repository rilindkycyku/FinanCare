/**
 * Shared react-select styling matching FinanCare's dark theme, ported from
 * financarevite's utils/darkSelectStyles.js as-is — it's driven entirely by the same
 * --sp-* CSS variables PremiumTheme.css defines, so it re-themes automatically with the
 * light/dark toggle, no changes needed.
 */
export const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "36px",
    background: "var(--sp-surface-2)",
    borderColor: state.isFocused ? "var(--sp-emerald)" : "var(--sp-border)",
    boxShadow: state.isFocused ? "0 0 0 3px var(--sp-emerald-glow)" : "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    "&:hover": { borderColor: "var(--sp-emerald)" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
  input: (base) => ({ ...base, color: "var(--sp-text)", margin: "0", padding: "0" }),
  placeholder: (base) => ({ ...base, color: "var(--sp-text-muted)" }),
  singleValue: (base) => ({ ...base, color: "var(--sp-text)" }),
  multiValue: (base) => ({ ...base, background: "var(--sp-surface-3)" }),
  multiValueLabel: (base) => ({ ...base, color: "var(--sp-text)" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--sp-text-muted)",
    "&:hover": { background: "var(--sp-red)", color: "#fff" },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--sp-surface-2)",
    border: "1px solid var(--sp-border)",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    zIndex: 1060,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 1060 }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected ? "var(--sp-emerald)" : isFocused ? "var(--sp-surface-3)" : "transparent",
    color: isSelected ? "#fff" : "var(--sp-text)",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: "0.85rem",
    padding: "0.45rem 0.75rem",
  }),
  groupHeading: (base) => ({
    ...base,
    color: "var(--sp-text-muted)",
    fontSize: "0.65rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  }),
  loadingIndicator: (base) => ({ ...base, color: "var(--sp-emerald)" }),
  loadingMessage: (base) => ({ ...base, color: "var(--sp-text-muted)" }),
  noOptionsMessage: (base) => ({ ...base, color: "var(--sp-text-muted)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "var(--sp-text-muted)" }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--sp-text-muted)",
    "&:hover": { color: "var(--sp-red)" },
  }),
};

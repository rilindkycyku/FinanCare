/**
 * Shared dark-theme styles for react-select.
 * Import and pass as the `styles` prop:
 *   import { darkSelectStyles } from "@/utils/darkSelectStyles";
 *   <Select styles={darkSelectStyles} ... />
 */
export const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    background: "#162033",
    borderColor: state.isFocused ? "#10b981" : "rgba(255,255,255,0.10)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
    borderRadius: "8px",
    "&:hover": { borderColor: "#10b981" },
  }),
  input: (base) => ({ ...base, color: "#f1f5f9" }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  singleValue: (base) => ({ ...base, color: "#f1f5f9" }),
  multiValue: (base) => ({ ...base, background: "#1e2d45" }),
  multiValueLabel: (base) => ({ ...base, color: "#f1f5f9" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { background: "#ef4444", color: "#fff" },
  }),
  menu: (base) => ({
    ...base,
    background: "#162033",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    zIndex: 1060,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 1060 }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected ? "#10b981" : isFocused ? "#1e2d45" : "transparent",
    color: isSelected ? "#fff" : "#e2e8f0",
    cursor: "pointer",
    borderRadius: "6px",
    padding: "0.6rem 1rem",
  }),
  groupHeading: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.65rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  }),
  loadingIndicator: (base) => ({ ...base, color: "#10b981" }),
  loadingMessage: (base) => ({ ...base, color: "#94a3b8" }),
  noOptionsMessage: (base) => ({ ...base, color: "#94a3b8" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { color: "#ef4444" },
  }),
};

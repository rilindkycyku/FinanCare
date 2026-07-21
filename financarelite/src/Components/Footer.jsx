import { useTheme } from "../Context/ThemeContext";
import { version as APP_VERSION } from "../../package.json";

function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      style={{
        marginTop: "2rem",
        borderTop: "1px solid var(--sp-border)",
        padding: "0.9rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      <img
        src={theme === "light" ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"}
        alt="FinanCare Logo"
        style={{ height: "32px", width: "auto", opacity: 0.85 }}
      />

      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--sp-text-muted)", textAlign: "center" }}>
        &copy; 2023 - {new Date().getFullYear()} FinanCareLite - Versioni Bazë i FinanCare, për Faturat, Klientët &amp; Produktet nga{" "}
        <a
          href="https://rilindkycyku.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--sp-emerald)", textDecoration: "none", fontWeight: 600 }}
        >
          Rilind Kyçyku
        </a>
      </span>

      <span
        style={{
          fontSize: "0.65rem",
          color: "var(--sp-text-muted)",
          background: "var(--sp-surface-3)",
          borderRadius: "6px",
          padding: "0.18rem 0.55rem",
          fontFamily: "monospace",
        }}
      >
        v{APP_VERSION}
      </span>
    </footer>
  );
}

export default Footer;

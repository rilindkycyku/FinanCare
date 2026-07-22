import { useTheme } from "../Context/ThemeContext";
import { version as APP_VERSION } from "../../package.json";
import "./Footer.css";

function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="fclite-footer">
      <img
        src={theme === "light" ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"}
        alt="FinanCare Logo"
        className="fclite-footer-logo"
      />

      <span className="fclite-footer-text">
        &copy; 2023 - {new Date().getFullYear()} FinanCareLite - Versioni Bazë i FinanCare, për Faturat, Klientët &amp; Produktet nga{" "}
        <a href="https://rilindkycyku.com" target="_blank" rel="noopener noreferrer">
          Rilind Kyçyku
        </a>
      </span>

      <span className="fclite-footer-version">v{APP_VERSION}</span>
    </footer>
  );
}

export default Footer;

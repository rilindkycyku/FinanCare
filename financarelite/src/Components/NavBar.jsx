import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Package, FileText, DatabaseBackup, Sun, Moon } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import "./NavBar.css";

const LINKS = [
  { to: "/", label: "Paneli", icon: LayoutDashboard, end: true },
  { to: "/te-dhenat-biznesit", label: "Të Dhënat e Biznesit", icon: Building2 },
  { to: "/klientet", label: "Klientët", icon: Users },
  { to: "/produktet", label: "Produktet", icon: Package },
  { to: "/faturat", label: "Faturat", icon: FileText },
  { to: "/te-dhena", label: "Eksporto / Importo", icon: DatabaseBackup },
];

function NavBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fclite-navbar">
      <div className="fclite-navbar-brand">
        <img src={theme === "light" ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"} alt="FinanCare" className="fclite-brand-logo" />
      </div>
      <div className="fclite-navbar-links">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `fclite-navlink${isActive ? " active" : ""}`}>
              <Icon size={16} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className="fclite-theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Kalo në temën e bardhë" : "Kalo në temën e errët"}
          aria-label="Ndrysho temën"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;

import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Package, FileText, DatabaseBackup } from "lucide-react";
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
  return (
    <nav className="fclite-navbar">
      <div className="fclite-navbar-brand">
        <img src="/img/web/LogoLight.png" alt="FinanCareLite" />
        <span>
          FinanCare<strong>Lite</strong>
        </span>
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
      </div>
    </nav>
  );
}

export default NavBar;

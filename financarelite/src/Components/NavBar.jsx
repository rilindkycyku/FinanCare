import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import {
  LayoutDashboard, Building2, Users, Package, FileText, ClipboardList,
  Settings, DatabaseBackup, BarChart3, Sun, Moon, ChevronDown, Menu, X,
} from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import "./NavBar.css";

// "Paneli" stays a standalone link; everything else is grouped into a few dropdown
// categories instead of one long flat row, mirroring FinanCare's own Materiali/Gjenerale
// nav-bar grouping (minus roles/permissions, which FinanCareLite has no concept of).
const HOME_LINK = { to: "/", label: "Paneli", icon: LayoutDashboard, end: true };

const CATEGORIES = [
  {
    label: "Shitjet",
    icon: FileText,
    links: [
      { to: "/faturat", label: "Faturat", icon: FileText },
      { to: "/kartela-analitike", label: "Kartela Analitike", icon: ClipboardList },
      { to: "/statistikat", label: "Statistikat", icon: BarChart3 },
    ],
  },
  {
    label: "Klientë & Produkte",
    icon: Users,
    links: [
      { to: "/klientet", label: "Klientët", icon: Users },
      { to: "/produktet", label: "Produktet", icon: Package },
    ],
  },
  {
    label: "Cilësime",
    icon: Settings,
    links: [
      { to: "/te-dhenat-biznesit", label: "Të Dhënat e Biznesit", icon: Building2 },
      { to: "/cilesimet", label: "Cilësimet", icon: Settings },
      { to: "/te-dhena", label: "Eksporto / Importo", icon: DatabaseBackup },
    ],
  },
];

function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open, and let Escape close it.
  useEffect(() => {
    if (!mobileOpen) return undefined;

    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <nav className="fclite-navbar">
      <div className="fclite-navbar-brand">
        <img src={theme === "light" ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"} alt="FinanCare" className="fclite-brand-logo" />
      </div>

      <div className="fclite-navbar-links">
        <NavLink to={HOME_LINK.to} end={HOME_LINK.end} className={({ isActive }) => `fclite-navlink${isActive ? " active" : ""}`}>
          <HOME_LINK.icon size={16} />
          <span>{HOME_LINK.label}</span>
        </NavLink>

        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          const isActiveCategory = category.links.some((l) => pathname.startsWith(l.to));
          return (
            <Dropdown key={category.label}>
              <Dropdown.Toggle as="button" className={`fclite-navlink fclite-navdropdown-toggle${isActiveCategory ? " active" : ""}`}>
                <CategoryIcon size={16} />
                <span>{category.label}</span>
                <ChevronDown size={14} className="fclite-navdropdown-caret" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="fclite-navdropdown-menu">
                {category.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.to;
                  return (
                    <Dropdown.Item
                      key={link.to}
                      as={NavLink}
                      to={link.to}
                      className={`fclite-navdropdown-item${isActive ? " active" : ""}`}
                    >
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
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

      <div className="fclite-navbar-mobile-controls">
        <button
          type="button"
          className="fclite-theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Kalo në temën e bardhë" : "Kalo në temën e errët"}
          aria-label="Ndrysho temën"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          className="fclite-mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Mbyll menynë" : "Hap menynë"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fclite-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`fclite-mobile-menu${mobileOpen ? " open" : ""}`}>
        <NavLink to={HOME_LINK.to} end={HOME_LINK.end} className={({ isActive }) => `fclite-mobile-navlink${isActive ? " active" : ""}`}>
          <HOME_LINK.icon size={18} />
          <span>{HOME_LINK.label}</span>
        </NavLink>

        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div className="fclite-mobile-group" key={category.label}>
              <div className="fclite-mobile-group-label">
                <CategoryIcon size={14} />
                <span>{category.label}</span>
              </div>
              {category.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`fclite-mobile-navlink${isActive ? " active" : ""}`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default NavBar;

import { useEffect, useState, useMemo } from "react";
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle
} from "mdb-react-ui-kit";
import {
  LogOut,
  LogIn,
  Menu as MenuIcon,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { roleBasedDropdowns } from "./roleBasedDropdowns";
import "./Styles/NavBarModern.css";

function NavBar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const getID = localStorage.getItem("id");

  const [teDhenat, setTeDhenat] = useState(null);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [showNav, setShowNav] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [perditeso, setPerditeso] = useState("");

  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Handle Role Detection from Token
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const kohaAktive = new Date(decodedToken.exp * 1000);
        if (kohaAktive < new Date()) {
          handleSignOut();
          return;
        }

        // ASP.NET Identity roles can be under multiple claim names
        let roles = decodedToken.role || decodedToken.roles || decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (!roles) roles = [];
        if (typeof roles === "string") roles = [roles];

        setUserRoles(roles);
      } catch (err) {
        console.error("Token decode error:", err);
        handleSignOut();
      }
    }
  }, [token]);

  // Fetch Business Data
  useEffect(() => {
    const fetchBiznesi = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, authentikimi);
        setTeDhenatBiznesit(res.data);
      } catch (err) { console.error("Business data fetch error:", err); }
    };
    if (token) fetchBiznesi();
  }, [token, API_BASE_URL, authentikimi]);

  // Fetch User Data
  useEffect(() => {
    if (getID && token) {
      const fetchUserData = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(res.data);
          // If token roles are empty, fallback to API roles
          if (res.data && res.data.rolet && (userRoles.length === 0)) {
            setUserRoles(res.data.rolet);
          }
        } catch (err) {
          console.error("User data fetch error:", err);
        }
      };
      fetchUserData();
    }
  }, [getID, token, API_BASE_URL, authentikimi]);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/LogIn");
  };

  const userInitial = teDhenat?.perdoruesi?.emri?.charAt(0) || "U";
  const primaryRole = userRoles.filter(r => r !== "User")[0] || userRoles[0] || "Përdorues";

  const hasAccess = (rolesNeeded) => {
    if (!rolesNeeded || rolesNeeded.length === 0) return true;
    return rolesNeeded.some(role => userRoles.includes(role));
  };

  return (
    <MDBNavbar expand="lg" light sticky className="modern-navbar">
      <MDBContainer fluid>
        <MDBNavbarBrand href="/" className="fw-800">
          <img src="/img/web/Logo.svg" alt="FinanCare Logo" className="brand-logo" />
        </MDBNavbarBrand>

        <MDBNavbarToggler
          type="button"
          onClick={() => setShowNav(!showNav)}
          className="shadow-none border-0"
        >
          <MenuIcon size={24} />
        </MDBNavbarToggler>

        <MDBCollapse navbar show={showNav}>
          <MDBNavbarNav className="d-flex align-items-center mb-2 mb-lg-0 mx-auto justify-content-center">
            {token && roleBasedDropdowns
              .filter(dropdown => dropdown.items.some(item => hasAccess(item.roles)))
              .map((dropdown, index) => (
                <MDBDropdown key={index} className="modern-dropdown mx-1">
                  <MDBDropdownToggle ripple={false} className="nav-link-modern btn-transparent border-0 shadow-none">
                    {dropdown.label} <ChevronDown size={14} />
                  </MDBDropdownToggle>
                  <MDBDropdownMenu className="flat-dropdown-menu">
                    {dropdown.items
                      .filter(item => hasAccess(item.roles))
                      .map((item, itemIdx) => (
                        <div key={itemIdx}>
                          {/* Category header */}
                          <div className="dropdown-category-header">
                            {item.label}
                          </div>
                          {/* All sub-items flat */}
                          {item.subItems
                            ?.filter(sub => sub.isDivider || hasAccess(sub.roles))
                            .map((sub, sIndex) => {
                              if (sub.isDivider) return <hr key={sIndex} className="dropdown-divider my-1" />;
                              if (!sub.label) return null;
                              return (
                                <Link key={sIndex} to={sub.path} className="dropdown-item">
                                  {sub.label}
                                </Link>
                              );
                            }).filter(Boolean)}
                          {/* Divider between categories (not after the last one) */}
                          {itemIdx < dropdown.items.filter(i => hasAccess(i.roles)).length - 1 && (
                            <hr className="dropdown-divider my-2" />
                          )}
                        </div>
                      ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              ))}

            {token && (
              <MDBNavbarItem className="mx-1">
                <MDBNavbarLink ripple={false} href="/ShikimiQmimeve" className="nav-link-modern">
                  Çmimet
                </MDBNavbarLink>
              </MDBNavbarItem>
            )}
          </MDBNavbarNav>

          <MDBNavbarNav className="ms-auto d-flex align-items-center gap-3">
            {token ? (
              <>
                <Link to="/Dashboard" className="user-profile-nav ms-2">
                  <div className="user-avatar-small">{userInitial}</div>
                  <div className="user-info-text d-none d-xl-flex">
                    <span className="user-name-top">
                      {teDhenat?.perdoruesi?.emri || "Përdorues"}
                    </span>
                    <span className="user-role-badge">{primaryRole}</span>
                  </div>
                </Link>

                <MDBNavbarItem className="list-unstyled">
                  <MDBNavbarLink ripple={false} onClick={handleSignOut} className="sign-out-btn cursor-pointer">
                    <LogOut size={20} />
                  </MDBNavbarLink>
                </MDBNavbarItem>
              </>
            ) : (
              <Link to="/LogIn" className="nav-link-modern">
                <LogIn size={18} /> Sign In
              </Link>
            )}
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
}

export default NavBar;

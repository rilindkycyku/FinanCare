import "./Styles/ModalDheTabela.css";
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
  MDBIcon,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBDropdownToggle
} from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { roleBasedDropdowns } from "./roleBasedDropdowns";

function NavBar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");

  const [teDhenat, setTeDhenat] = useState([]);

  const [showNav, setShowNav] = useState(false);

  const [userRoles, setUserRoles] = useState([]);

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const kohaAktive = new Date(decodedToken.exp * 1000);
      const kohaTanishme = new Date();

      if (kohaAktive < kohaTanishme) {
        localStorage.removeItem("token");
        navigate("/LogIn");
      } else {
        setUserRoles(decodedToken.role || []); // Assuming roles are in the decoded token
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const ShfaqTeDhenat = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
      } catch (err) {
        console.log(err);
      }
    };

    ShfaqTeDhenat();
  }, [perditeso]);

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(perdoruesi.data);
        } catch (err) {
          console.log(err);
        }
      };

      vendosTeDhenat();
    } else {
      navigate("/login");
    }
  }, [perditeso]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const kohaAktive = new Date(decodedToken.exp * 1000);
      const kohaTanishme = new Date();
      const id = localStorage.getItem("id");

      if (kohaAktive < kohaTanishme) {
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        navigate("/LogIn");
      }

      if (id !== decodedToken.Id) {
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        navigate("/LogIn");
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
  };

  if (!userRoles || userRoles.length === 0) {
    console.log("No roles available for the user.");
    return null; // or a fallback UI
  }

  return (
    <>
      <MDBNavbar
        sticky
        expand="lg"
        light
        style={{ backgroundColor: "#009879" }}>
        <MDBContainer fluid>
          <MDBNavbarBrand href="/">
            <img
              src={`/img/web/d144a4e21cb54a7fb9c5a21d4eebdd50.svg`}
              height="30"
              alt=""
              loading="lazy"
            />
          </MDBNavbarBrand>
          <MDBNavbarToggler
            type="button"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setShowNav(!showNav)}>
            <MDBIcon icon="bars" fas />
          </MDBNavbarToggler>
          <MDBCollapse navbar show={showNav}>
            <MDBNavbarNav className="d-flex mr-auto">
              {token && (
                <>
                  {roleBasedDropdowns.map((dropdown, index) => {
                    return (
                      <MDBDropdown key={index}>
                        <MDBDropdownToggle className="btnNav btnNav-primary">
                          {dropdown.label}
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                          {dropdown.items.map((item, itemIndex) => {
                            const hasAccess = item.roles
                              ? item.roles.some((role) =>
                                  userRoles.includes(role)
                                )
                              : false;

                            return (
                              <MDBDropdown key={itemIndex} dropright>
                                <MDBDropdownToggle
                                  className="btnNav btnNav-primary"
                                  disabled={!hasAccess} // Disable the dropdown if no access
                                >
                                  {item.label}
                                </MDBDropdownToggle>
                                <MDBDropdownMenu>
                                  {item.subItems &&
                                    item.subItems.map(
                                      (subItem, subItemIndex) => {
                                        const hasSubAccess = subItem.roles
                                          ? subItem.roles.some((role) =>
                                              userRoles.includes(role)
                                            )
                                          : false;

                                        if (subItem.isDivider) {
                                          return (
                                            <MDBDropdownItem
                                              divider
                                              key={subItemIndex}
                                            />
                                          );
                                        }

                                        return (
                                          <MDBDropdownItem
                                            key={subItemIndex}
                                            disabled={!hasSubAccess}>
                                            {hasSubAccess ? (
                                              <Link
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.color =
                                                    "#009879"; // Hover effect for disabled
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.color =
                                                    "black"; // Reset background
                                                }}
                                                style={{
                                                  padding: "3px 3px", // Adjust padding as needed
                                                  display: "inline-block", // Ensures the padding is applied correctly
                                                  transition:
                                                    "background-color 0.3s", // Smooth transition for hover
                                                }}
                                                to={subItem.path}>
                                                {subItem.label}
                                              </Link>
                                            ) : (
                                              <span
                                                style={{
                                                  color: "rgba(0, 0, 0, 0.38)",
                                                  pointerEvents: "none",
                                                  textDecoration: "none",
                                                  padding: "3px 3px", // Adjust padding as needed
                                                  display: "inline-block", // Ensures the padding is applied correctly
                                                  transition:
                                                    "background-color 0.3s", // Smooth transition for hover
                                                }}
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.backgroundColor =
                                                    "#f0f0f0"; // Change to your desired hover color
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.backgroundColor =
                                                    "transparent"; // Reset to transparent
                                                }}>
                                                {subItem.label}
                                              </span>
                                            )}
                                          </MDBDropdownItem>
                                        );
                                      }
                                    )}
                                </MDBDropdownMenu>
                              </MDBDropdown>
                            );
                          })}
                        </MDBDropdownMenu>
                      </MDBDropdown>
                    );
                  })}

                  <MDBNavbarItem className="btnNav btnNav-primary">
                    <MDBNavbarLink href="ShikimiQmimeve">
                      Kontrollo Qmimin e Produktit
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                </>
              )}
              <MDBNavbarNav
                right={showNav ? false : true}
                fullWidth={false}
                className="mb-2 mb-lg-0">
                {token && (
                  <>
                    <MDBNavbarItem>
                      <MDBNavbarLink>
                        <Link to="/Dashboard">
                          <div style={{ display: "inline-block" }}>
                            {" "}
                            {/* Wrap the content inside a block container */}
                            Miresevini,{" "}
                            <strong>
                              {teDhenat.perdoruesi && teDhenat.perdoruesi.emri}
                            </strong>{" "}
                            -
                            <small
                              style={{
                                fontSize: "0.85em",
                                fontStyle: "italic",
                              }}>
                              {" "}
                              {/* Smaller, italic text */}
                              {teDhenat.rolet &&
                                teDhenat.rolet
                                  .filter((role) => role !== "User") // Exclude the "User" role
                                  .map((role, index) => (
                                    <span key={index}>
                                      {role}
                                      {index < teDhenat.rolet.length - 2
                                        ? ", "
                                        : ""}{" "}
                                      {/* Add comma for separation */}
                                    </span>
                                  ))}
                            </small>
                          </div>
                        </Link>
                      </MDBNavbarLink>
                    </MDBNavbarItem>

                    <MDBNavbarItem>
                      <MDBNavbarLink>
                        <Link to="/Login" onClick={handleSignOut}>
                          Sign out <FontAwesomeIcon icon={faRightFromBracket} />
                        </Link>
                      </MDBNavbarLink>
                    </MDBNavbarItem>
                  </>
                )}
                {!token && (
                  <>
                    <MDBNavbarItem>
                      <MDBNavbarLink>
                        <Link to="/LogIn">
                          Sign in <FontAwesomeIcon icon={faRightToBracket} />
                        </Link>
                      </MDBNavbarLink>
                    </MDBNavbarItem>
                    <MDBNavbarItem>
                      <MDBNavbarLink>
                        <Link to="/SignUp">
                          Sign up <FontAwesomeIcon icon={faUserPlus} />
                        </Link>
                      </MDBNavbarLink>
                    </MDBNavbarItem>
                  </>
                )}
              </MDBNavbarNav>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>
    </>
  );
}

export default NavBar;

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";

function KontrolloAksesinNeFaqe(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const kontrolloAksesin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // 1. Role Access Check
          const decodedToken = jwtDecode(token);
          const hasAccess = props.roletELejuara.some((role) =>
            decodedToken.role.includes(role)
          );

          if (!hasAccess) {
            navigate("/403");
            return;
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          navigate("/login");
          return;
        }

        // 2. Global License Access Check
        const currentPath = location.pathname;
        const bypassPaths = ["/", "/AktivizoSistemin", "/login", "/403", "/404"];
        
        if (!bypassPaths.includes(currentPath)) {
          try {
            const res = await axios.get(`${API_BASE_URL}/api/Licenca/status`);
            const isLicensed = res.data.isLicensed ? "true" : "false";
            localStorage.setItem("isLicensed", isLicensed);

            if (isLicensed === "false") {
              // Redirect straight to Dashboard which displays the system blocker panel
              navigate("/");
            }
          } catch (err) {
            console.error("License access check failed:", err);
          }
        }
      } else {
        navigate("/login"); // No token, redirect to login
      }
    };

    kontrolloAksesin();
  }, [props.roletELejuara, navigate, location.pathname, API_BASE_URL]);

  return <div></div>;
}

export default KontrolloAksesinNeFaqe;

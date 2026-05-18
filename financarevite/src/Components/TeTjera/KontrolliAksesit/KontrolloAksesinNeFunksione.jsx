import { useEffect } from "react";
﻿import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

function KontrolloAksesinNeFunksione(props) {
  const navigate = useNavigate();

  useEffect(() => {
    const kontrolloAksesin = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Check if any of the allowed roles are included in the decoded token roles
          const hasAccess = props.roletELejuara.some((role) =>
            decodedToken.role.includes(role)
          );

          if (hasAccess) {
            // The user has one of the allowed roles
          } else {
            // The user doesn't have access
            props.largo();
            props.setTipiMesazhit("danger");
            props.setPershkrimiMesazhit(`
              <div style="text-align:center; padding: 8px 0;">
                <div style="font-size: 3rem; margin-bottom: 8px;">🚫</div>
                <div style="font-size: 2rem; font-weight: 800; color: #f87171; letter-spacing: 2px;">403</div>
                <div style="font-size: 1.1rem; font-weight: 600; margin: 4px 0 8px;">Nuk keni akses!</div>
                <div style="font-size: 0.85rem; color: #9ca3af; line-height: 1.5;">
                  Roli juaj nuk ka leje për të kryer këtë veprim.<br/>Kontaktoni administratorin nëse mendoni se kjo është gabim.
                </div>
              </div>
            `);
            props.perditesoTeDhenat();
            props.shfaqmesazhin();
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        navigate("/login");
      }
    };

    kontrolloAksesin();
  }, [props.roletELejuara, navigate]); // Add roletELejuara and navigate to dependency array

  return null;
}

export default KontrolloAksesinNeFunksione;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            props.setPershkrimiMesazhit("<h2>403 - Nuk keni akses!</h2>");
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

  return <div></div>;
}

export default KontrolloAksesinNeFunksione;

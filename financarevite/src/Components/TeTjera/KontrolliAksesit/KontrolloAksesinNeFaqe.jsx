import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

function KontrolloAksesinNeFaqe(props) {
  const navigate = useNavigate();

  useEffect(() => {
    const kontrolloAksesin = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Check if the decoded token role contains any of the allowed roles
          const hasAccess = props.roletELejuara.some((role) =>
            decodedToken.role.includes(role)
          );

          if (hasAccess) {
            // User has access
          } else {
            navigate("/403"); // User doesn't have access
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        navigate("/login"); // No token, redirect to login
      }
    };

    kontrolloAksesin();
  }, [props.roletELejuara, navigate]); // Add roletELejuara and navigate to dependency array

  return <div></div>;
}

export default KontrolloAksesinNeFaqe;

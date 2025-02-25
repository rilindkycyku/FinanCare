import "./Styles/LogIn.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput
} from "mdb-react-ui-kit";
import Mesazhi from "../Components/TeTjera/layout/Mesazhi";
import Titulli from "../Components/TeTjera/Titulli";

const LogIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [roles, setRoles] = useState([]);

  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  function vendosEmail(value) {
    setEmail(value);
  }

  function vendosPasswordin(value) {
    setPassword(value);
  }

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");

    if (loggedUser) {
      setLoggedIn(true);
    }
  });

  async function handleLogIn(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://localhost:7285/api/Authenticate/login",
        {
          email: email,
          password: password,
        }
      );

      if (response.status == 200) {
        const { token } = response.data;

        localStorage.setItem("token", token);

        const decodedToken = jwt_decode(token);

        localStorage.setItem("id", decodedToken.Id);

        navigate("/");
      } else {
        setPershkrimiMesazhit(
          "<strong>Ju lutemi kontaktoni me stafin pasi ndodhi nje gabim ne server!</strong>"
        );
        setTipiMesazhit("danger");
        setShfaqMesazhin(true);
      }
    } catch (error) {
      setPershkrimiMesazhit(
        "<strong>Ju lutemi kontrolloni te dhenat e juaja!</strong>"
      );
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);

      console.log(error);
    }
  }

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  const handleMenaxhoTastet = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogIn(event);
    }
  };

  return (
    <>
      <Titulli titulli={"Login"} />

      <div className="logIn">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        <MDBContainer fluid>
          <MDBCard
            className="bg-white my-5 mx-auto"
            style={{
              border: "none",
              boxShadow: "0 0 20px #ddd",
              borderRadius: "2rem",
              maxWidth: "500px",
              color: "#FFFFFF", // Set text color to white
            }}>
            <MDBCardBody
              className="p-5 w-100 d-flex flex-column"
              style={{
                border: "none",
                boxShadow: "0 0 20px #ddd",
                borderRadius: "2rem",
                maxWidth: "500px",
                backgroundColor: "#009879",
              }}>
              <img
                src={`${process.env.PUBLIC_URL}/img/web/d144a4e21cb54a7fb9c5a21d4eebdd50.svg`}
                alt="Logo"
                className="logo mb-4"
                style={{ maxWidth: "300px", alignSelf: "center" }}
              />
              <h3 className="formTitle">Log In</h3>
              <p className="text-white-20 mb-4 p-text">
                Please enter your email and password!
              </p>

              <MDBInput
                wrapperClass="mb-4 w-100"
                label="Email address"
                id="formControlEmailAddress"
                type="email"
                size="lg"
                onChange={(e) => vendosEmail(e.target.value)}
                onKeyDown={(e) => {
                  ndrroField(e, "formControlPassword");
                }}
              />
              <MDBInput
                wrapperClass="mb-4 w-100"
                label="Password"
                id="formControlPassword"
                type="password"
                size="lg"
                onChange={(e) => vendosPasswordin(e.target.value)}
                onKeyDown={handleMenaxhoTastet}
              />
              <button
                class="button btn btn-primary btn-lg "
                role="button"
                onClick={handleLogIn}>
                Login
              </button>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>
    </>
  );
};

export default LogIn;

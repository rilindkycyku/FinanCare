import { Col, Image, Row } from "react-bootstrap";
import NavBar from "../layout/NavBar";
import Titulli from "../Titulli";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

function NukKeniAkses(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const ShfaqTeDhenat = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
        console.log(teDhenat.data);
      } catch (err) {
        console.log(err);
      }
    };

    ShfaqTeDhenat();
  }, [perditeso]);
  return (
    <>
      <Titulli titulli={"Nuk Keni Akses"} />
      <NavBar />
      <div className="containerDashboardP d-flex justify-content-center align-items-center">
        <div className="teDhenatAplikimit">
          <div className="teDhenatAplikimitHeader">
            <Row className="mb-4 align-items-center justify-content-center">
              <Col xs="12" sm="6" className="text-center">
                <Image
                  src={`${process.env.PUBLIC_URL}/img/web/${teDhenatBiznesit?.logo}`}
                  style={{ marginTop: "0.5em" }}
                  fluid
                  alt="Partner Logo 1"
                />
              </Col>
            </Row>
            <Row className="mb-4 align-items-center justify-content-center">
              <Col xs="12" sm="10" className="text-center">
                <h1 style={{ marginTop: "1em" }}>
                  403 - Nuk keni akses per kete pjese
                </h1>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}

export default NukKeniAkses;

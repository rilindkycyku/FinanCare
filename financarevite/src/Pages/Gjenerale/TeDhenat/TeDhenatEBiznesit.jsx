import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
import "../../Styles/TeDhenatEBiznesit.css";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import { MDBRow, MDBCol, MDBInput} from "mdb-react-ui-kit";
import Titulli from "../../../Components/TeTjera/Titulli";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

function TeDhenatEBiznesit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [edito, setEdito] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState(null);

  const navigate = useNavigate();

  const [formValue, setFormValue] = useState({
    emriIBiznesit: "",
    shkurtesaEmrit: "",
    nui: "",
    nf: "",
    nrTVSH: "",
    adresa: "",
    nrKontaktit: "",
    email: "",
    emailDomain: "",
  });

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const onChange = (e) => {
    setFormValue({ ...formValue, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (event) => {
    setFoto(event.target.files[0]);
  };

  useEffect(() => {
    const ShfaqTeDhenat = async () => {
      try {
        setLoading(true);
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    ShfaqTeDhenat();
  }, [perditeso]);

  const handleEdito = (e) => {
    e.preventDefault(); // Prevent default form behavior

    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Define allowed roles for editing
        const allowedRoles = ["Menaxher"];

        // Check if the user has at least one allowed role
        const hasAccess = allowedRoles.some((role) =>
          decodedToken.role.includes(role)
        );

        if (hasAccess) {
          // Grant access: allow editing
          setEdito(true);
        } else {
          // Deny access: show message and prevent editing
          setTipiMesazhit("danger");
          setPershkrimiMesazhit("<h2>403 - Nuk keni akses!</h2>");
          setShfaqMesazhin(true); // Show access denied message
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      // If no token is found, navigate to login
      navigate("/login");
    }
  };

  async function handleRuaj(e) {
    e.preventDefault();

    if (foto) {
      const formData = new FormData();
      formData.append("foto", foto);

      try {
        await axios
          .post(
            `${API_BASE_URL}/api/VendosFotot/PerditesoTeDhenatBiznesit?logoVjeter=${teDhenatBiznesit.logo}`,
            formData,
            authentikimi
          )
          .then(async (response) => {
            axios.put(
              `${API_BASE_URL}/api/TeDhenatBiznesit/perditesoTeDhenat`,
              {
                emriIbiznesit: formValue.emriIBiznesit,
                shkurtesaEmritBiznesit: formValue.shkurtesaEmrit,
                nui: formValue.nui,
                nf: formValue.nf,
                nrTVSH: formValue.nrTVSH,
                adresa: formValue.adresa,
                nrKontaktit: formValue.nrKontaktit,
                email: formValue.email,
                emailDomain: formValue.emailDomain,
                logo: response.data,
              },
              authentikimi
            );
            setPerditeso(Date.now());

            setEdito(false);
          });
      } catch (error) {
        console.error(error);
      }
    } else {
      await axios.put(
        `${API_BASE_URL}/api/TeDhenatBiznesit/perditesoTeDhenat`,
        {
          emriIbiznesit: formValue.emriIBiznesit,
          shkurtesaEmritBiznesit: formValue.shkurtesaEmrit,
          nui: formValue.nui,
          nf: formValue.nf,
          nrTVSH: formValue.nrTVSH,
          adresa: formValue.adresa,
          nrKontaktit: formValue.nrKontaktit,
          email: formValue.email,
          logo: teDhenatBiznesit.logo,
          emailDomain: formValue.emailDomain,
        },
        authentikimi
      );
      setPerditeso(Date.now());

      setEdito(false);
    }
  }

  useEffect(() => {
    if (teDhenatBiznesit) {
      setFormValue({
        ...formValue,
        emriIBiznesit: teDhenatBiznesit.emriIBiznesit,
        shkurtesaEmrit: teDhenatBiznesit.shkurtesaEmritBiznesit,
        nui: teDhenatBiznesit.nui,
        nf: teDhenatBiznesit.nf,
        nrTVSH: teDhenatBiznesit.nrTVSH,
        adresa: teDhenatBiznesit.adresa,
        nrKontaktit: teDhenatBiznesit.nrKontaktit,
        email: teDhenatBiznesit.email,
        emailDomain: teDhenatBiznesit.emailDomain,
      });
    }
  }, [teDhenatBiznesit]);

  return (
    <>
      <Titulli titulli={"Te Dhenat e Biznesit"} />
      <NavBar />

      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#009879"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          <div className="TeDhenatContainer mb-4">
            <h1 className="titulliPerditeso">Te Dhenat e Biznesit</h1>

            <MDBRow tag="form" className="g-3">
              <MDBCol md="6">
                <MDBInput
                  value={formValue.emriIBiznesit ?? ""}
                  name="emriIBiznesit"
                  onChange={onChange}
                  id="validationCustom01"
                  required
                  label="Emri i Biznesit"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="6">
                <MDBInput
                  value={formValue.shkurtesaEmrit ?? ""}
                  name="shkurtesaEmrit"
                  onChange={onChange}
                  id="validationCustom02"
                  required
                  label="Shkurtesa e emrit: Sherben per Faturen"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="4">
                <MDBInput
                  value={formValue.nui ?? ""}
                  name="nui"
                  onChange={onChange}
                  id="validationCustom03"
                  required
                  label="Numri Unik Identifikues: NUI"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="4">
                <MDBInput
                  value={formValue.nf ?? ""}
                  name="nf"
                  onChange={onChange}
                  id="validationCustom03"
                  required
                  label="Numri Fiskal: NF / NRF"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="4">
                <MDBInput
                  value={formValue.nrTVSH ?? ""}
                  name="nrTVSH"
                  onChange={onChange}
                  id="validationCustom03"
                  required
                  label="Numri TVSH: nrTVSH"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="3">
                <MDBInput
                  value={formValue.email ?? ""}
                  name="email"
                  onChange={onChange}
                  id="validationCustom02"
                  required
                  label="Email"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="3">
                <MDBInput
                  value={formValue.emailDomain ?? ""}
                  name="emailDomain"
                  onChange={onChange}
                  id="validationCustom02"
                  required
                  label="Email Domain"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="3">
                <MDBInput
                  value={formValue.adresa ?? ""}
                  name="adresa"
                  onChange={onChange}
                  id="validationCustom03"
                  required
                  label="Adresa"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="3">
                <MDBInput
                  value={formValue.nrKontaktit ?? ""}
                  name="nrKontaktit"
                  onChange={onChange}
                  id="validationCustom05"
                  required
                  label="Numri i Kontaktit"
                  disabled={!edito}
                />
              </MDBCol>
              <MDBCol md="4" style={{ margin: "1em" }}>
  {teDhenatBiznesit && (
    <div className="logo">
      <img
        src={
          teDhenatBiznesit.logo &&
          teDhenatBiznesit.logo !== "" &&
          teDhenatBiznesit.logo !== "PaLogo.png" &&
          teDhenatBiznesit.logo !== null &&
          teDhenatBiznesit.logo !== undefined
            ? `/img/web/${teDhenatBiznesit.logo}` // Relative path
            : `/img/web/PaLogo.png`
        }
        alt="Logo e Biznesit"
        onError={(e) => {
          console.log("Image load failed, switching to fallback");
          e.target.src = `/img/web/PaLogo.png`;
        }}
        onLoad={() => console.log("Image loaded successfully")}
      />
    </div>
  )}
</MDBCol>
              <MDBCol
                md="4"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <MDBInput
                  type="file"
                  name="image"
                  onChange={handleFotoChange}
                  id="validationCustom04"
                  label="Logo, Mos te jete ngjyre te bardhe!"
                  disabled={!edito}
                />
              </MDBCol>
              <div className="col-12">
                {!edito && (
                  <button
                    className="btn btn-primary btn-small"
                    role="button"
                    onClick={handleEdito}>
                    Ndrysho te dhenat
                  </button>
                )}

                {edito && (
                  <button
                    className="btn btn-primary btn-small"
                    role="button"
                    onClick={handleRuaj}>
                    Ruaj
                  </button>
                )}
              </div>
            </MDBRow>
          </div>
        )}
      </div>
    </>
  );
}

export default TeDhenatEBiznesit;

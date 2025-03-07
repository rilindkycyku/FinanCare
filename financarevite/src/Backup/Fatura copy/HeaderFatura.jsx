import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";
import Barkodi from "./Barkodi";

function HeaderFatura(props) {
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);

  const [teDhenatFat, setteDhenatFat] = useState([]);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosFature = async () => {
      try {
        const teDhenat = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.faturaID}`,
          authentikimi
        );

        console.log(teDhenat.data);

        setteDhenatFat(teDhenat.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    vendosFature();
  }, [props.faturaID]);

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [props.faturaID]);

  return (
    <>
      <div className="header">
        <div className="teDhenatKompanis">
          <img
            src={`/img/web/${teDhenatBiznesit.logo}`}
            style={{ width: "150px", height: "auto", marginTop: "0.5em" }}
          />
          <h2 style={{ fontSize: "24pt" }}>
            {teDhenatBiznesit && teDhenatBiznesit.emriIBiznesit}
          </h2>
          <p>
            <strong>Adresa: </strong>
            {teDhenatBiznesit && teDhenatBiznesit.adresa}
          </p>
          <p>
            <strong>NUI: </strong>
            {teDhenatBiznesit && teDhenatBiznesit.nui} / <strong>NF: </strong>
            {teDhenatBiznesit && teDhenatBiznesit.nf} / <strong>TVSH: </strong>
            {teDhenatBiznesit && teDhenatBiznesit.nrTVSH}
          </p>

          <p>
            <strong>Kontakti: </strong>
            {teDhenatBiznesit && teDhenatBiznesit.nrKontaktit} -{" "}
            {teDhenatBiznesit && teDhenatBiznesit.email}
          </p>
          <hr />
          <p>
            <strong>Data e Fatures: </strong>
            {new Date(
              teDhenatFat &&
                teDhenatFat.regjistrimet &&
                teDhenatFat.regjistrimet.dataRegjistrimit
            ).toLocaleDateString("en-GB", { dateStyle: "short" })}
          </p>
          <p>
            <strong>Shenime Shtese: </strong>
            {teDhenatFat && teDhenatFat.regjistrimet && (
              <span
                dangerouslySetInnerHTML={{
                  __html: teDhenatFat.regjistrimet.pershkrimShtese,
                }}
              />
            )}
          </p>
          <strong>
            Faqe: {props.NrFaqes} / {props.NrFaqeve}
          </strong>
        </div>

        <div className="data">
          <div className="barkodi">
            <h3>
              {teDhenatFat &&
              teDhenatFat.regjistrimet &&
              teDhenatFat.regjistrimet.llojiKalkulimit &&
              teDhenatFat.regjistrimet.llojiKalkulimit === "KMB"
                ? "FLETKTHIM"
                : teDhenatFat &&
                  teDhenatFat.regjistrimet &&
                  teDhenatFat.regjistrimet.llojiKalkulimit &&
                  teDhenatFat.regjistrimet.llojiKalkulimit === "AS"
                ? "ASGJESIM I STOKUT"
                : teDhenatFat &&
                  teDhenatFat.regjistrimet &&
                  teDhenatFat.regjistrimet.llojiKalkulimit &&
                  teDhenatFat.regjistrimet.llojiKalkulimit === "HYRJE"
                ? "KALKULIM I MALLIT"
                : teDhenatFat &&
                  teDhenatFat.regjistrimet &&
                  teDhenatFat.regjistrimet.llojiKalkulimit &&
                  teDhenatFat.regjistrimet.llojiKalkulimit === "FL"
                ? "FLETLEJIM"
                : teDhenatFat &&
                  teDhenatFat.regjistrimet &&
                  teDhenatFat.regjistrimet.llojiKalkulimit &&
                  teDhenatFat.regjistrimet.llojiKalkulimit === "FAT"
                ? "FATURE"
                : teDhenatFat &&
                  teDhenatFat.regjistrimet &&
                  teDhenatFat.regjistrimet.llojiKalkulimit &&
                  teDhenatFat.regjistrimet.llojiKalkulimit === "KMSH"
                ? "KTHIM I MALLIT TE SHITUR"
                : ""}
            </h3>
            <span id="nrFatures">
              <Barkodi value={props.Barkodi} />
            </span>
          </div>
          <div className="teDhenatEKlientit">
            {teDhenatFat &&
              teDhenatFat.regjistrimet &&
              teDhenatFat.regjistrimet.llojiKalkulimit &&
              (teDhenatFat.regjistrimet.llojiKalkulimit === "AS" ||
                teDhenatFat.regjistrimet.llojiKalkulimit === "KMSH") && (
                <>
                  <p>
                    <strong>Personi Pergjegjes: </strong>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.username}
                  </p>
                  {teDhenatFat.regjistrimet.llojiKalkulimit === "AS" && (
                    <p>
                      <strong>Nr. Asgjesimit: </strong>
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet &&
                        teDhenatFat.regjistrimet.nrRendorFatures}
                    </p>
                  )}
                  {teDhenatFat.regjistrimet.llojiKalkulimit === "KMSH" && (
                    <p>
                      <strong>Nr. Referencues: </strong>
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet &&
                        teDhenatFat.regjistrimet.nrFatures}
                    </p>
                  )}
                </>
              )}
            {teDhenatFat &&
              teDhenatFat.regjistrimet &&
              teDhenatFat.regjistrimet.llojiKalkulimit &&
              teDhenatFat.regjistrimet.llojiKalkulimit != "AS" &&
              teDhenatFat.regjistrimet.llojiKalkulimit != "KMSH" && (
                <>
                  <p>
                    <strong>
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet &&
                        teDhenatFat.regjistrimet.idPartneri}{" "}
                      -{" "}
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet &&
                        teDhenatFat.regjistrimet.shkurtesaPartnerit}{" "}
                      /{" "}
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet &&
                        teDhenatFat.regjistrimet.emriBiznesit}
                    </strong>
                  </p>
                  <p>
                    <strong>NUI: </strong>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.nui}{" "}
                    / <strong>NF: </strong>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.nrf}{" "}
                    / <strong>TVSH: </strong>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.partneriTVSH}
                  </p>
                  <p>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.adresa}
                  </p>
                  <p>
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.nrKontaktit}{" "}
                    -{" "}
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet &&
                      teDhenatFat.regjistrimet.email}
                  </p>
                </>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderFatura;

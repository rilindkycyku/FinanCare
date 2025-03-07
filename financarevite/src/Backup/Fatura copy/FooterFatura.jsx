import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";

function FooterFatura(props) {
  const [teDhenatFat, setteDhenatFat] = useState([]);
  const [bankat, setBankat] = useState([]);

  const [konvertimiValutave, setKonvertimiValutave] = useState([]);

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
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${
            props.faturaID ?? 61
          }`,
          authentikimi
        );
        const bankat = await axios.get(
          `https://localhost:7285/api/TeDhenatBiznesit/ShfaqLlogaritEBiznesit`,
          authentikimi
        );
        const apiKonvertimiValutave = await axios.get(
          `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_At6H7hASeL41xhqWxRdKNKxduFJPT9VcktC7iM1m&currencies=EUR%2CUSD%2CCHF&base_currency=EUR`,
          authentikimi
        );
        setteDhenatFat(teDhenat.data);
        setBankat(bankat.data);
        setKonvertimiValutave(apiKonvertimiValutave.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    vendosFature();
  }, [props.faturaID]);

  return (
    <>
      <div className="header">
        <div className="teDhenatKompanis">
          {teDhenatFat &&
            teDhenatFat.regjistrimet &&
            teDhenatFat.regjistrimet.llojiKalkulimit &&
            (teDhenatFat.regjistrimet.llojiKalkulimit === "FAT" ||
              teDhenatFat.regjistrimet.llojiKalkulimit === "FL" ||
              teDhenatFat.regjistrimet.llojiKalkulimit === "KMB" ||
              teDhenatFat.regjistrimet.llojiKalkulimit === "HYRJE") && (
              <>
                <p>
                  Gjate pageses ju lutem te shkruani numrin e Fatures:{" "}
                  <strong>{props.Barkodi}</strong>
                </p>
                <p>
                  <strong>
                    Pagesa duhet te behet ne nje nga llogarit e cekura me
                    poshte:
                  </strong>
                </p>
                <table>
                  <tr style={{ fontSize: "12px" }}>
                    <th>Emri Bankes</th>
                    <th>Numri Llogaris</th>
                    <th>Valuta</th>
                  </tr>
                  {bankat &&
                    bankat.map((x) => (
                      <tr style={{ fontSize: "12px" }} key={x.bankaID}>
                        <td>
                          <strong>{x.banka && x.banka.emriBankes}</strong>
                        </td>
                        <td>
                          <strong>{x.numriLlogaris}</strong>
                        </td>
                        <td>
                          <strong>{x.valuta}</strong>
                        </td>
                      </tr>
                    ))}
                </table>
              </>
            )}
        </div>

        <div className="data">
          <p>
            <strong>Nentotali: </strong>
            {teDhenatFat &&
              parseFloat(teDhenatFat.totaliMeTVSH + teDhenatFat.rabati).toFixed(
                2
              )}{" "}
            €
          </p>
          <p>
            <strong>Rabati: </strong>
            {teDhenatFat && parseFloat(-teDhenatFat.rabati).toFixed(2)} €
          </p>
          <p>
            <strong>Totali Pa TVSH: </strong>
            {teDhenatFat && parseFloat(teDhenatFat.totaliPaTVSH).toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 8%: </strong>
            {teDhenatFat && parseFloat(teDhenatFat.tvsH8).toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 18%: </strong>
            {teDhenatFat && parseFloat(teDhenatFat.tvsH18).toFixed(2)} €
          </p>
          <p>
            <strong style={{ fontSize: "18pt" }}>Qmimi Total: </strong>

            <strong style={{ fontSize: "18pt" }}>
              {teDhenatFat && parseFloat(teDhenatFat.totaliMeTVSH).toFixed(2)} €
            </strong>
          </p>
          <p
            style={{ marginTop: "-1em", fontSize: "13pt", fontWeight: "bold" }}>
            {teDhenatFat &&
              parseFloat(
                teDhenatFat.totaliMeTVSH *
                  (konvertimiValutave && konvertimiValutave.USD)
              ).toFixed(2)}{" "}
            $
          </p>
          <p
            style={{
              marginTop: "-0.7em",
              fontSize: "13pt",
              fontWeight: "bold",
            }}>
            {teDhenatFat &&
              parseFloat(
                teDhenatFat.totaliMeTVSH *
                  (konvertimiValutave && konvertimiValutave.CHF)
              ).toFixed(2)}{" "}
            CHF
          </p>
        </div>
      </div>

      <br />
      <hr
        style={{
          height: "2px",
          borderWidth: "0",
          color: "gray",
          backgroundColor: "black",
        }}
      />
      <div className="nenshkrimet">
        <div className="nenshkrimi">
          <span>
            _________________________________________________________________
          </span>
          <span>(Emri, Mbiemri, Nenshkrimi & Vula)</span>
          <span>(Personi Përgjegjës)</span>
          <br />
          <strong>© FinanCare - POS, eOrder & More by Rilind Kyçyku</strong>
        </div>
        <div className="nenshkrimi">
          <span>
            _________________________________________________________________
          </span>
          <span>(Emri, Mbiemri, Nenshkrimi)</span>
          <span>(Klienti)</span>
        </div>
      </div>
    </>
  );
}

export default FooterFatura;

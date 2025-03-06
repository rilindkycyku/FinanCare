import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect} from "react";

function TeDhenatFatura(props) {
  const [perditeso, setPerditeso] = useState(Date.now());
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);

  const [produktet, setProduktet] = useState([]);
  const [teDhenatFat, setteDhenatFat] = useState([]);

  const dataPorosise = new Date(
    teDhenatFat &&
      teDhenatFat.regjistrimet &&
      teDhenatFat.regjistrimet.dataRegjistrimit
  );
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const barkodi = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${
    teDhenatFat &&
    teDhenatFat.regjistrimet &&
    teDhenatFat.regjistrimet.llojiKalkulimit
  }-${props.faturaID}`;

  useEffect(() => {
    const vendosFature = async () => {
      try {
        const produktet = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.faturaID}`,
          authentikimi
        );
        const teDhenat = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.faturaID}`,
          authentikimi
        );

        console.log(teDhenat.data);

        setteDhenatFat(teDhenat.data);
        setProduktet(produktet.data);
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
      <div className="tabelaETeDhenaveProduktit">
        <table>
          <tr>
            <th>Nr.</th>
            <th>Shifra</th>
            <th>Emertimi</th>
            <th>Njm</th>
            <th>Sasia</th>
            <th>Qm. - TVSH</th>
            <th>Rab. 1 %</th>
            <th>Rab. 2 %</th>
            <th>Rab. 3 %</th>
            <th>T %</th>
            <th>Qm. + TVSH - Rab</th>
            <th>TVSH €</th>
            <th>Shuma €</th>
          </tr>
          {produktet
            .slice(props.ProduktiPare, props.ProduktiFundit)
            .map((produkti, index) => (
              <tr key={index}>
                <td>{index + props.ProduktiPare + 1}</td>
                <td>{produkti.kodiProduktit}</td>
                <td>
                  {produkti.emriProduktit} {produkti.barkodi}
                </td>
                <td>{produkti.emriNjesiaMatese}</td>
                <td>{produkti.sasiaStokut}</td>
                <td>
                  {parseFloat(
                    produkti.qmimiShites -
                      (produkti.qmimiShites * produkti.llojiTVSH) / 100
                  ).toFixed(4)}
                </td>
                <td>{parseFloat(produkti.rabati1 ?? 0).toFixed(2)}</td>
                <td>{parseFloat(produkti.rabati2 ?? 0).toFixed(2)}</td>
                <td>{parseFloat(produkti.rabati3 ?? 0).toFixed(2)}</td>
                <td>{produkti.llojiTVSH}</td>
                <td>
                  {parseFloat(
                    produkti.qmimiShites -
                      produkti.qmimiShites *
                        ((produkti.rabati1 +
                          produkti.rabati2 +
                          produkti.rabati3) /
                          100)
                  ).toFixed(4)}
                </td>
                <td>
                  {parseFloat(
                    (produkti.sasiaStokut *
                      (produkti.qmimiShites -
                        produkti.qmimiShites *
                          ((produkti.rabati1 +
                            produkti.rabati2 +
                            produkti.rabati3) /
                            100)) *
                      ((produkti.llojiTVSH /
                        100 /
                        (1 + produkti.llojiTVSH / 100)) *
                        100)) /
                      100
                  ).toFixed(4)}
                </td>
                <td>
                  {parseFloat(
                    produkti.sasiaStokut * produkti.qmimiShites -
                      produkti.sasiaStokut *
                        produkti.qmimiShites *
                        ((produkti.rabati1 +
                          produkti.rabati2 +
                          produkti.rabati3) /
                          100)
                  ).toFixed(4)}
                </td>
              </tr>
            ))}
        </table>
      </div>
    </>
  );
}

export default TeDhenatFatura;

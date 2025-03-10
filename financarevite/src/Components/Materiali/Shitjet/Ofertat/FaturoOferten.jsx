import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faFileImport
} from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function FaturoOferten(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [kalkulimet, setKalkulimet] = useState([]);
  const [detajetRegjistrimi, setDetajetRegjistrimit] = useState([]);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);

  const [emriBiznesit, setEmriBiznesit] = useState("");
  const [nrFatures, setNrFatures] = useState("");
  const [referenti, setReferenti] = useState("");
  const [dataFatures, setDataFatures] = useState("");
  const [idPartneri, setidPartneri] = useState("");

  const [idRegjistrimit, setIdRegjistrimit] = useState(0);

  const [perditeso, setPerditeso] = useState("");
  const [produktet, setProduktet] = useState([]);
  const [importoOfertenKonfirmimi, setImportoOfertenKonfirmimi] =
    useState(false);

  const [produktetPerFletLejim, setProduktetPerFletLejim] = useState([]);
  const [kaFletLejim, setKaFleteLejim] = useState(false);
  const [krijoFletLejimin, setKrijoFleteLejimin] = useState(false);

  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [nrRendorKalkulimitFat, setNrRendorKalkulimitFat] = useState(0);

  const [teDhenat, setTeDhenat] = useState([]);

  const [ePara, setEPara] = useState(true);

  const getToken = localStorage.getItem("token");

  const getID = localStorage.getItem("id");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const dataPorosise = new Date(
    detajetRegjistrimi &&
      detajetRegjistrimi.regjistrimet &&
      detajetRegjistrimi.regjistrimet.dataRegjistrimit
  );
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);

  useEffect(() => {
    const vendosNrFaturesMeRradhe = async () => {
      try {
        const nrFat = await axios.get(
          `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=FAT`,
          authentikimi
        );
        setNrRendorKalkulimitFat(parseInt(nrFat.data));
      } catch (err) {
        console.log(err);
      }
    };

    vendosNrFaturesMeRradhe();
  }, [perditeso]);

  const barkodiOferte = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${"OFERTE"}-${nrFatures}`;

  const barkodiFat = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${"FAT"}-${nrRendorKalkulimitFat + 1}`;

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          const regjistrimi = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrRendorKalkulimit}`,
            authentikimi
          );
          const teDhenat = await axios.get(
            `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
            authentikimi
          );
          setTeDhenatBiznesit(teDhenat.data);
          setTeDhenat(perdoruesi.data);
          setDetajetRegjistrimit(regjistrimi.data);
        } catch (err) {
          console.log(err);
        }
      };

      vendosTeDhenat();
    }
  }, [perditeso]);

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/Products`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimet = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrRendorKalkulimit}`,
          authentikimi
        );

        setKalkulimet(kalkulimet);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqKalkulimet();
  }, [perditeso, importoOfertenKonfirmimi]);

  async function importoOferte(idRegjistrimit) {
    const kalkulimi = await axios.get(
      `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${idRegjistrimit}`,
      authentikimi
    );

    await axios
      .post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
        {
          dataRegjistrimit: detajetRegjistrimi.regjistrimet.dataRegjistrimit,
          stafiID: detajetRegjistrimi.regjistrimet.stafiID,
          totaliPaTVSH: parseFloat(detajetRegjistrimi.totaliPaTVSH),
          tvsh: parseFloat(
            detajetRegjistrimi.tvsH18 + detajetRegjistrimi.tvsH8
          ),
          idPartneri: detajetRegjistrimi.regjistrimet.idPartneri,
          statusiPageses: "Pa Paguar",
          llojiPageses: detajetRegjistrimi.regjistrimet.llojiPageses,
          nrFatures: (nrRendorKalkulimitFat + 1).toString(),
          pershkrimShtese:
            detajetRegjistrimi.regjistrimet.pershkrimShtese +
            " Referenti: " +
            detajetRegjistrimi.regjistrimet.username +
            ", Nr. Ofertes: " +
            barkodiOferte,
          rabati: parseFloat(detajetRegjistrimi.rabati),
          nrRendorFatures: nrRendorKalkulimitFat + 1,
          statusiKalkulimit: "true",
          llojiKalkulimit: "FAT",
          idBonusKartela: detajetRegjistrimi.regjistrimet.idBonusKartela,
        },
        authentikimi
      )
      .then(async (response) => {
        for (let produktet of kalkulimi.data) {
          await axios.put(
            `${API_BASE_URL}/api/Faturat/FaturoOferten/PerditesoStokun?id=${produktet.idProduktit}&lloji=FAT&stoku=${produktet.sasiaStokut}`,
            {},
            authentikimi
          );
          await axios
            .post(
              `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
              {
                idRegjistrimit: response?.data?.idRegjistrimit,
                idProduktit: produktet.idProduktit,
                qmimiBleres: produktet.qmimiBleres,
                qmimiShites: produktet.qmimiShites,
                sasiaStokut: produktet.sasiaStokut,
                qmimiShitesMeShumic: produktet.qmimiShitesMeShumic,
                rabati1: produktet.rabati1,
                rabati2: produktet.rabati2,
                rabati3: produktet.rabati3,
              },
              authentikimi
            )
            .then(async () => {
              props.setPerditeso();
              if (produktet.sasiaStokut > produktet.sasiaAktualeNeStok) {
                setProduktetPerFletLejim((prev) => {
                  return [...prev, produktet];
                });
                setKaFleteLejim(true);
              }
              await axios.put(
                `${API_BASE_URL}/api/Faturat/FaturoOferten?id=${idRegjistrimit}`,
                {},
                authentikimi
              );
            });
        }
      });

    setImportoOfertenKonfirmimi(false);
    setEPara(false);
  }

  useEffect(() => {
    if (!ePara) {
      kontrolloFletLejimin();
    }
  }, [kaFletLejim, ePara]);

  function kontrolloFletLejimin() {
    if (kaFletLejim) {
      setImportoOfertenKonfirmimi(false);
      setKrijoFleteLejimin(true);
    } else {
      props.setPerditeso();
      props.hide();
      props.setShfaqMesazhin(true);
      props.setPershkrimiMesazhit("Oferta u importua me Sukses!");
      props.setTipiMesazhit("success");
    }
  }

  useEffect(() => {
    const vendosNrFaturesMeRradhe = async () => {
      try {
        const nrFat = await axios.get(
          `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=FL`,
          authentikimi
        );
        setNrRendorKalkulimit(parseInt(nrFat.data));
      } catch (err) {
        console.log(err);
      }
    };

    vendosNrFaturesMeRradhe();
  }, [perditeso]);

  let totalPaTVSH = 0;
  let totalTVSH = 0;
  let totalRabati = 0;

  function PerditesoFleteLejimin(
    llojiTVSH,
    qmimiShites,
    sasiaStokut,
    rabati1,
    rabati2,
    rabati3
  ) {
    let totalFat =
      (qmimiShites -
        qmimiShites * (rabati1 / 100) -
        (qmimiShites - qmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
        (qmimiShites -
          qmimiShites * (rabati1 / 100) -
          (qmimiShites - qmimiShites * (rabati1 / 100)) * (rabati2 / 100)) *
          (rabati3 / 100)) *
      sasiaStokut;
    let totTVSHProdukt = totalFat * (1 + llojiTVSH / 100) - totalFat;

    totalTVSH -= totTVSHProdukt;
    totalPaTVSH -= totalFat - totTVSHProdukt;
    totalRabati -= qmimiShites * sasiaStokut - totalFat;
  }

  async function krijoFleteLejimin() {
    await axios
      .post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
        {
          stafiID: teDhenat.perdoruesi.userID,
          totaliPaTVSH: 0,
          tvsh: 0,
          idPartneri: idPartneri,
          nrFatures: parseInt(nrRendorKalkulimit + 1).toString(),
          llojiKalkulimit: "FL",
          pershkrimShtese:
            "Flete Lejimi per munges malli" +
            ", Vlene per Faturen Nr: <strong>" +
            barkodiFat +
            "</strong>",
          nrRendorFatures: nrRendorKalkulimit + 1,
          statusiPageses: "Pa Paguar",
          statusiKalkulimit: "true",
          idBonusKartela: null,
        },
        authentikimi
      )
      .then(async (response) => {
        setPerditeso(Date.now());
        for (let produktet of produktetPerFletLejim) {
          const stoku = await axios.get(
            `${API_BASE_URL}/api/Produkti/GetStokuProduktit?id=${produktet.idProduktit}`,
            authentikimi
          );

          if (stoku.data.sasiaNeStok < 0) {
            await axios.put(
              `${API_BASE_URL}/api/Faturat/FaturoOferten/PerditesoStokun?id=${
                produktet.idProduktit
              }&lloji=FL&stoku=${parseFloat(stoku.data.sasiaNeStok * -1)}`,
              {},
              authentikimi
            );

            PerditesoFleteLejimin(
              produktet.llojiTVSH,
              -produktet.qmimiShites,
              stoku.data.sasiaNeStok * -1,
              produktet.rabati1,
              produktet.rabati2,
              produktet.rabati3
            );

            await axios
              .post(
                `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
                {
                  idRegjistrimit: response.data.idRegjistrimit,
                  idProduktit: produktet.idProduktit,
                  qmimiBleres: produktet.qmimiBleres,
                  qmimiShites: -produktet.qmimiShites,
                  sasiaStokut: parseFloat(stoku.data.sasiaNeStok * -1),
                  qmimiShitesMeShumic: produktet.qmimiShitesMeShumic,
                  rabati1: produktet.rabati1,
                  rabati2: produktet.rabati2,
                  rabati3: produktet.rabati3,
                },
                authentikimi
              )
              .then(async () => {
                const stoku = await axios.get(
                  `${API_BASE_URL}/api/Produkti/GetStokuProduktit?id=${produktet.idProduktit}`,
                  authentikimi
                );
              });
          }
        }
      })
      .finally(async () => {
        const kalkulimet = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrRendorKalkulimit}`,
          authentikimi
        );

        console.log(kalkulimet);

        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
          {
            dataRegjistrimit: kalkulimet.data.regjistrimet.dataRegjistrimit,
            stafiID: kalkulimet.data.regjistrimet.stafiID,
            totaliPaTVSH: parseFloat(kalkulimet.data.totaliPaTVSH),
            tvsh: parseFloat(kalkulimet.data.tvsH18 + kalkulimet.data.tvsH8),
            idPartneri: kalkulimet.data.regjistrimet.idPartneri,
            statusiPageses: kalkulimet.data.statusiPageses,
            llojiPageses: kalkulimet.data.regjistrimet.llojiPageses,
            llojiKalkulimit: kalkulimet.data.regjistrimet.llojiKalkulimit,
            nrFatures: kalkulimet.data.regjistrimet.nrFatures,
            statusiKalkulimit: kalkulimet.data.regjistrimet.statusiKalkulimit,
            pershkrimShtese: kalkulimet.data.regjistrimet.pershkrimShtese,
            rabati: parseFloat(kalkulimet.data.rabati),
            nrRendorFatures: kalkulimet.data.regjistrimet.nrRendorFatures,
            idBonusKartela: kalkulimet.data.regjistrimet.idBonusKartela,
          },
          authentikimi
        );

        const FleteLejimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${
            kalkulimet.data.regjistrimet.idRegjistrimit + 2
          }`,
          authentikimi
        );

        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${FleteLejimi.data.regjistrimet.idRegjistrimit}`,
          {
            dataRegjistrimit: FleteLejimi.data.regjistrimet.dataRegjistrimit,
            stafiID: FleteLejimi.data.regjistrimet.stafiID,
            idPartneri: FleteLejimi.data.regjistrimet.idPartneri,
            statusiPageses: FleteLejimi.data.statusiPageses,
            llojiPageses: FleteLejimi.data.regjistrimet.llojiPageses,
            llojiKalkulimit: FleteLejimi.data.regjistrimet.llojiKalkulimit,
            nrFatures: FleteLejimi.data.regjistrimet.nrFatures,
            statusiKalkulimit: FleteLejimi.data.regjistrimet.statusiKalkulimit,
            pershkrimShtese: FleteLejimi.data.regjistrimet.pershkrimShtese,
            nrRendorFatures: FleteLejimi.data.regjistrimet.nrRendorFatures,
            totaliPaTVSH: parseFloat(-totalPaTVSH),
            tvsh: parseFloat(-totalTVSH),
            rabati: parseFloat(-totalRabati),
            idBonusKartela: kalkulimet.data.regjistrimet.idBonusKartela,
          },
          authentikimi
        );

        await axios.put(
          `${API_BASE_URL}/api/Faturat/FaturoOferten?id=${idRegjistrimit}`,
          {},
          authentikimi
        );

        props.setPerditeso();
        setKrijoFleteLejimin(false);
        props.hide();
        props.setShfaqMesazhin(true);
        props.setPershkrimiMesazhit(
          "Oferta u importua me Sukses & Flete Lejimi u Krijua me Sukses!"
        );
        props.setTipiMesazhit("success");
      });
  }

  function mbyllKrijoFletLejimin() {
    props.setPerditeso();
    setKrijoFleteLejimin(false);
    props.hide();
    props.setShfaqMesazhin(true);
    props.setPershkrimiMesazhit(
      "Oferta u importua me Sukses ndersa Flete Lejimi u anulua!"
    );
    props.setTipiMesazhit("success");
  }

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Faturist"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      {importoOfertenKonfirmimi && (
        <Modal
          show={importoOfertenKonfirmimi}
          style={{ marginTop: "7em" }}
          onHide={() => setImportoOfertenKonfirmimi(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Konfirmo Faturimin e Ofertes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi ta faturoni kete Oferte?
            </strong>
            <hr />
            <span style={{ fontSize: "10pt" }}>
              <strong>Partneri:</strong> {emriBiznesit}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Nr. Ofertes:</strong> {nrFatures}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Referenti: </strong> {referenti}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Data Ofertes: </strong>
              {new Date(dataFatures).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </span>
            <hr />
            <strong style={{ fontSize: "10pt" }}>
              Pas konfirmimit kjo oferte do te quhet si e kompletuar! Si e tille
              faturimi nuk do te jete me i mundur per kete.
            </strong>
            <br />
            <p style={{ fontSize: "10pt" }}>
              Ne rast se produktet e ofertes nuk jane ne stok do te shfaqet
              opsioni i krijimit te Flete Lejimit!
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setImportoOfertenKonfirmimi(false)}>
              Anulo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => {
                importoOferte(idRegjistrimit);
              }}>
              Konfirmo <FontAwesomeIcon icon={faCheck} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {krijoFletLejimin && (
        <Modal
          show={krijoFletLejimin}
          style={{ marginTop: "7em" }}
          onHide={() => setKrijoFleteLejimin(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Krijoni Flete Lejimin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              Disa nga produktet jane jashte stokut. A deshironi te krijoni
              fletelejimin?
            </strong>
            <br />
            <strong style={{ fontSize: "10pt" }}>
              Ne rast se e anuloni, Flete Lejimi duhet te punohet manualisht!
            </strong>
            <br />
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => mbyllKrijoFletLejimin()}>
              Anulo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                krijoFleteLejimin();
              }}>
              Konfirmo <FontAwesomeIcon icon={faCheck} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal
        size="lg"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Lista e Ofertave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MDBTable small>
            <MDBTableHead>
              <tr>
                <th scope="col">Nr. Ofertes</th>
                <th scope="col">Partneri</th>
                <th scope="col">Komercialisti</th>
                <th scope="col">Data e Fatures</th>
                <th scope="col"> Funksione</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {detajetRegjistrimi && detajetRegjistrimi.regjistrimet && (
                <tr key={detajetRegjistrimi.regjistrimet.idRegjistrimit}>
                  <td>{detajetRegjistrimi.regjistrimet.nrFatures}</td>
                  <td>{detajetRegjistrimi.regjistrimet.emriBiznesit}</td>
                  <td>{detajetRegjistrimi.regjistrimet.username}</td>
                  <td>
                    {new Date(
                      detajetRegjistrimi.regjistrimet.dataRegjistrimit
                    ).toLocaleDateString("en-GB", {
                      dateStyle: "short",
                    })}
                  </td>
                  <td>
                    <Button
                      style={{ marginRight: "0.5em" }}
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setIdRegjistrimit(
                          detajetRegjistrimi.regjistrimet.idRegjistrimit
                        );
                        setidPartneri(
                          detajetRegjistrimi.regjistrimet.idPartneri
                        );
                        setNrFatures(detajetRegjistrimi.regjistrimet.nrFatures);
                        setEmriBiznesit(
                          detajetRegjistrimi.regjistrimet.emriBiznesit
                        );
                        setReferenti(detajetRegjistrimi.regjistrimet.username);
                        setDataFatures(
                          detajetRegjistrimi.regjistrimet.dataRegjistrimit
                        );
                        setImportoOfertenKonfirmimi(true);
                      }}>
                      <FontAwesomeIcon icon={faFileImport} />
                    </Button>
                  </td>
                </tr>
              )}
            </MDBTableBody>
          </MDBTable>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default FaturoOferten;

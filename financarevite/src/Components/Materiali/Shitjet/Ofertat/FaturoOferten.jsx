import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
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
  
  // State variables
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
  const [importoOfertenKonfirmimi, setImportoOfertenKonfirmimi] = useState(false);
  const [produktetPerFletLejim, setProduktetPerFletLejim] = useState([]);
  const [kaFletLejim, setKaFleteLejim] = useState(false);
  const [krijoFletLejimin, setKrijoFleteLejimin] = useState(false);
  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [nrRendorKalkulimitFat, setNrRendorKalkulimitFat] = useState(0);
  const [teDhenat, setTeDhenat] = useState([]);
  const [ePara, setEPara] = useState(true);
  
  // ============================================================================
  // NEW: Loading state variables
  // ============================================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingFleteLejim, setLoadingFleteLejim] = useState(false);

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

  // ============================================================================
  // OPTIMIZATION 1: Parallel initialization of all data with loading state
  // ============================================================================
  useEffect(() => {
    if (getID) {
      const initializeData = async () => {
        try {
          setLoadingInitial(true);

          // Fetch all data in parallel
          const [perdoruesiRes, regjistrimiRes, teDhenatRes, nrFatRes, nrFatFlatRes] = 
            await Promise.all([
              axios.get(
                `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
                authentikimi
              ),
              axios.get(
                `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrRendorKalkulimit}`,
                authentikimi
              ),
              axios.get(
                `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
                authentikimi
              ),
              axios.get(
                `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=FL`,
                authentikimi
              ),
              axios.get(
                `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=FAT`,
                authentikimi
              ),
            ]);

          setTeDhenat(perdoruesiRes.data);
          setDetajetRegjistrimit(regjistrimiRes.data);
          setTeDhenatBiznesit(teDhenatRes.data);
          setNrRendorKalkulimit(parseInt(nrFatRes.data));
          setNrRendorKalkulimitFat(parseInt(nrFatFlatRes.data));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingInitial(false);
        }
      };

      initializeData();
    }
  }, [perditeso, getID, props.nrRendorKalkulimit]);

  const barkodiOferte = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${"OFERTE"}-${nrFatures}`;

  const barkodiFat = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${"FAT"}-${nrRendorKalkulimitFat + 1}`;

  // ============================================================================
  // OPTIMIZATION 2: Parallel product updates instead of sequential
  // ============================================================================
  async function importoOferte(idRegjistrimit) {
    try {
      setLoadingImport(true);

      const kalkulimi = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${idRegjistrimit}`,
        authentikimi
      );

      // Create main invoice
      const invoiceRes = await axios.post(
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
      );

      // Process all products in parallel
      const productPromises = kalkulimi.data.map((produktet) =>
        Promise.all([
          axios.put(
            `${API_BASE_URL}/api/Faturat/FaturoOferten/PerditesoStokun?id=${produktet.idProduktit}&lloji=FAT&stoku=${produktet.sasiaStokut}`,
            {},
            authentikimi
          ),
          axios.post(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
            {
              idRegjistrimit: invoiceRes?.data?.idRegjistrimit,
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
          ),
        ]).then(() => {
          // Check if needs permission slip
          if (produktet.sasiaStokut > produktet.sasiaAktualeNeStok) {
            setProduktetPerFletLejim((prev) => [...prev, produktet]);
            setKaFleteLejim(true);
          }
        })
      );

      await Promise.allSettled(productPromises);

      // Mark invoice as processed
      await axios.put(
        `${API_BASE_URL}/api/Faturat/FaturoOferten?id=${idRegjistrimit}`,
        {},
        authentikimi
      );

      setImportoOfertenKonfirmimi(false);
      setEPara(false);
    } catch (error) {
      console.error(error);
      alert("Gabim gjatë importimit të ofertës");
      setLoadingImport(false);
    }
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
      setLoadingImport(false);
      props.setPerditeso();
      props.hide();
      props.setShfaqMesazhin(true);
      props.setPershkrimiMesazhit("Oferta u importua me Sukses!");
      props.setTipiMesazhit("success");
    }
  }

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

  // ============================================================================
  // OPTIMIZATION 3: Parallel permission slip creation
  // ============================================================================
  async function krijoFleteLejimin() {
    try {
      setLoadingFleteLejim(true);

      const response = await axios.post(
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
      );

      // Process all products in parallel
      const productPromises = produktetPerFletLejim.map(async (produktet) => {
        const stoku = await axios.get(
          `${API_BASE_URL}/api/Produkti/GetStokuProduktit?id=${produktet.idProduktit}`,
          authentikimi
        );

        if (stoku.data.sasiaNeStok < 0) {
          const negativeStok = parseFloat(stoku.data.sasiaNeStok * -1);
          
          await Promise.all([
            axios.put(
              `${API_BASE_URL}/api/Faturat/FaturoOferten/PerditesoStokun?id=${
                produktet.idProduktit
              }&lloji=FL&stoku=${negativeStok}`,
              {},
              authentikimi
            ),
            axios.post(
              `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
              {
                idRegjistrimit: response.data.idRegjistrimit,
                idProduktit: produktet.idProduktit,
                qmimiBleres: produktet.qmimiBleres,
                qmimiShites: -produktet.qmimiShites,
                sasiaStokut: negativeStok,
                qmimiShitesMeShumic: produktet.qmimiShitesMeShumic,
                rabati1: produktet.rabati1,
                rabati2: produktet.rabati2,
                rabati3: produktet.rabati3,
              },
              authentikimi
            ),
          ]);

          PerditesoFleteLejimin(
            produktet.llojiTVSH,
            -produktet.qmimiShites,
            negativeStok,
            produktet.rabati1,
            produktet.rabati2,
            produktet.rabati3
          );
        }
      });

      await Promise.allSettled(productPromises);

      // Update invoices
      const kalkulimet = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrRendorKalkulimit}`,
        authentikimi
      );

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
    } catch (error) {
      console.error(error);
      alert("Gabim gjatë krijimit të fletës së lejimit");
    } finally {
      setLoadingFleteLejim(false);
    }
  }

  function mbyllKrijoFletLejimin() {
    setLoadingImport(false);
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

      {/* Confirmation Modal - Import Offer */}
      <Modal
        show={importoOfertenKonfirmimi}
        onHide={() => setImportoOfertenKonfirmimi(false)}
        centered>
        <Modal.Header closeButton>
          <Modal.Title as="h5">Konfirmo Faturimin e Ofertes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong style={{ fontSize: "10pt" }}>
            A jeni te sigurt qe deshironi ta faturoni kete Oferte?
          </strong>
          <hr />
          <div style={{ fontSize: "10pt" }}>
            <div className="mb-2">
              <strong>Partneri:</strong> {emriBiznesit}
            </div>
            <div className="mb-2">
              <strong>Nr. Ofertes:</strong> {nrFatures}
            </div>
            <div className="mb-2">
              <strong>Referenti:</strong> {referenti}
            </div>
            <div className="mb-2">
              <strong>Data Ofertes:</strong>{" "}
              {new Date(dataFatures).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </div>
          </div>
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
            onClick={() => setImportoOfertenKonfirmimi(false)}
            disabled={loadingImport}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() => importoOferte(idRegjistrimit)}
            disabled={loadingImport}>
            {loadingImport && <Spinner animation="border" size="sm" className="me-2" />}
            Konfirmo <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal - Create Permission Slip */}
      <Modal
        show={krijoFletLejimin}
        onHide={() => setKrijoFleteLejimin(false)}
        centered>
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => mbyllKrijoFletLejimin()}
            disabled={loadingFleteLejim}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            size="sm"
            onClick={() => krijoFleteLejimin()}
            disabled={loadingFleteLejim}>
            {loadingFleteLejim && <Spinner animation="border" size="sm" className="me-2" />}
            Konfirmo <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Modal */}
      <Modal size="xl"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Lista e Ofertave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingInitial ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span>Po ngarkohet...</span>
            </div>
          ) : (
            <MDBTable small hover>
              <MDBTableHead>
                <tr>
                  <th scope="col">Nr. Ofertes</th>
                  <th scope="col">Partneri</th>
                  <th scope="col">Komercialisti</th>
                  <th scope="col">Data e Fatures</th>
                  <th scope="col">Funksione</th>
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
                        }}
                        disabled={loadingImport || loadingFleteLejim}>
                        <FontAwesomeIcon icon={faFileImport} />
                      </Button>
                    </td>
                  </tr>
                )}
              </MDBTableBody>
            </MDBTable>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default FaturoOferten;

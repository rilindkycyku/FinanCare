import { useEffect, useState } from "react";
import '../../Pages/Styles/DizajniPergjithshem.css';
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../layout/Mesazhi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { TailSpin } from 'react-loader-spinner';
import { Table, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import RegjistroFaturen from "./RegjistroFaturen";

function TeDhenatFatures(props) {
    const [perditeso, setPerditeso] = useState('');
    const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
    const [tipiMesazhit, setTipiMesazhit] = useState("");
    const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
    const [loading, setLoading] = useState(false);
    const [partneret, setPartneret] = useState([]);

    const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
    const [Partneri, setPartneri] = useState(0);
    const [nrFatures, setNrFatures] = useState("");
    const [dataEFatures, setDataEFatures] = useState(Date.now());
    const [llojiIPageses, setLlojiIPageses] = useState("Cash");
    const [statusiIPageses, setStatusiIPageses] = useState("E Paguar");
    const [totPaTVSH, setTotPaTVSH] = useState(0);
    const [TVSH, setTVSH] = useState(0);

    const [kalkulimet, setKalkulimet] = useState([]);
    const [regjistroKalkulimin, setRegjistroKalkulimin] = useState(false);
    const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
    const [mbyllFature, setMbyllFaturen] = useState(true);
    const [id, setId] = useState(0);

    const [edito, setEdito] = useState(false);
    const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);

    const [teDhenat, setTeDhenat] = useState([]);


    const navigate = useNavigate();

    const getID = localStorage.getItem("id");

    const getToken = localStorage.getItem("token");

    const authentikimi = {
        headers: {
            Authorization: `Bearer ${getToken}`,
        },
    };

    const handleShfaqTeDhenat = (id) => {
        setShfaqTeDhenat(true);
        setMbyllFaturen(false);
        setId(id);
    };
    useEffect(() => {
        const shfaqKalkulimet = async () => {
            try {
                setLoading(true);
                const kalkulimi = await axios.get("https://localhost:7285/api/KalkulimiImallit/shfaqRegjistrimet", authentikimi);
                setKalkulimet(kalkulimi.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        };

        shfaqKalkulimet();
    }, [perditeso]);

    useEffect(() => {
        if (getID) {
            const vendosTeDhenat = async () => {
                try {
                    const perdoruesi = await axios.get(
                        `https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`, authentikimi
                    );
                    setTeDhenat(perdoruesi.data);
                } catch (err) {
                    console.log(err);
                } finally {
                    setLoading(false);
                }
            };

            vendosTeDhenat();
        } else {
            navigate("/login");
        }
    }, [perditeso]);

    useEffect(() => {
        const vendosPartnerin = async () => {
            try {
                const partneri = await axios.get(
                    `https://localhost:7285/api/Partneri/shfaqPartneretSipasLlojit?llojiPartnerit=Furnitor`, authentikimi
                );
                setPartneret(partneri.data);

            } catch (err) {
                console.log(err);
            }
        };

        vendosPartnerin();
    }, [perditeso]);

    useEffect(() => {
        const vendosNrFaturesMeRradhe = async () => {
            try {
                const nrFat = await axios.get(`https://localhost:7285/api/KalkulimiImallit/getNumriFaturesMeRradhe`, authentikimi);
                setNrRendorKalkulimit(nrFat.data);
            } catch (err) {
                console.log(err);
            }
        }

        vendosNrFaturesMeRradhe();
    }, [perditeso]);

    const ndrroField = (e, tjetra) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById(tjetra).focus();
        }
    }

    async function handleRegjistroKalkulimin() {
        try {
            await axios.post('https://localhost:7285/api/KalkulimiImallit/ruajKalkulimin', {
                dataRegjistrimit: dataEFatures,
                stafiId: teDhenat.perdoruesi.userId,
                totaliPaTvsh: totPaTVSH,
                tvsh: TVSH,
                idpartneri: Partneri,
                statusiPageses: statusiIPageses,
                llojiPageses: llojiIPageses,
                nrFatures: nrFatures
            }, authentikimi).then((response) => {

                if (response.status === 200 || response.status === 201) {
                    setPerditeso(Date.now());
                    setRegjistroKalkulimin(true);
                }
                else {
                    console.log("gabim");
                    setPerditeso(Date.now());
                }
            })


        } catch (error) {
            console.error(error);

        }
    }

    function mbyllKalkulimin() {

        try {
            axios.put(`https://localhost:7285/api/KalkulimiImallit/ruajKalkulimin/perditesoStatusinKalkulimit?id=${nrRendorKalkulimit}`
                , {}, authentikimi).then(() => {
                    setRegjistroKalkulimin(false);
                })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="containerDashboardP" style={{ width: "90%", }}>
            {shfaqMesazhin && <Mesazhi
                setShfaqMesazhin={setShfaqMesazhin}
                pershkrimi={pershkrimiMesazhit}
                tipi={tipiMesazhit}
            />}

            {regjistroKalkulimin && <RegjistroFaturen
                mbyllKalkulimin={mbyllKalkulimin}
                mbyllPerkohesisht={() => setRegjistroKalkulimin(false)}
                nrRendorKalkulimit={nrRendorKalkulimit}
                setPerditeso={() => setPerditeso(Date.now())}
            />}
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
            ) : (!regjistroKalkulimin && <>
                <h1 className="title">
                    Kalkulimi i Mallit
                </h1>


                <Container fluid>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Group controlId="idDheEmri">
                                    <Form.Group>
                                        <Form.Label>Nr. Rendor i Kalkulimit</Form.Label>
                                        <Form.Control
                                            id="nrRendorKalkulimit"
                                            type="number"
                                            value={nrRendorKalkulimit + 1}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Label>Partneri</Form.Label>
                                    <select
                                        placeholder="Partneri"
                                        id="Partneri"
                                        className="form-select"
                                        value={Partneri ? Partneri : 0}
                                        onChange={(e) => { setPartneri(e.target.value); }}
                                        onKeyDown={(e) => { ndrroField(e, "nrFatures") }}
                                    >
                                        <option defaultValue value={0} key={0} disabled>
                                            Zgjedhni Partnerin
                                        </option>
                                        {partneret.map((item) => {
                                            return (
                                                <option key={item.idpartneri} value={item.idpartneri}>
                                                    {item.emriBiznesit}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Nr. Fatures</Form.Label>
                                    <Form.Control
                                        id="nrFatures"
                                        type="text"
                                        value={nrFatures}
                                        onChange={(e) => { setNrFatures(e.target.value); }}
                                        onKeyDown={(e) => { ndrroField(e, "dataEFatures") }}
                                    />
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Data e Fatures</Form.Label>
                                <Form.Control
                                    id="dataEFatures"
                                    type="date"
                                    value={dataEFatures}
                                    onChange={(e) => { setDataEFatures(e.target.value); }}
                                    onKeyDown={(e) => { ndrroField(e, "llojiIPageses") }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Lloji i Pageses</Form.Label>
                                <select
                                    id="llojiIPageses"
                                    placeholder="LlojiIPageses"
                                    className="form-select"
                                    value={llojiIPageses ? llojiIPageses : 0}
                                    disabled={edito}
                                    onChange={(e) => { setLlojiIPageses(e.target.value); }}
                                    onKeyDown={(e) => { ndrroField(e, "statusiIPageses") }}
                                >
                                    <option defaultValue value={0} key={0} disabled>
                                        Zgjedhni Llojin e Pageses
                                    </option>
                                    <option key={1} value="Cash">Cash</option>
                                    <option key={2} value="Banke">Banke</option>
                                    <option key={3} value="Borxh">Borxh</option>
                                </select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Statusi i Pageses</Form.Label>
                                <select
                                    id="statusiIPageses"
                                    placeholder="Statusi i Pageses"
                                    className="form-select"
                                    value={statusiIPageses ? statusiIPageses : 0}
                                    disabled={edito}
                                    onChange={(e) => { setStatusiIPageses(e.target.value); }}
                                    onKeyDown={(e) => { ndrroField(e, "totPaTVSH") }}
                                >
                                    <option defaultValue value={0} key={0} disabled>
                                        Zgjedhni Statusin e Pageses
                                    </option>
                                    <option key={1} value="E Paguar">E Paguar</option>
                                    <option key={2} value="Borxh">Pa Paguar</option>
                                </select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Totali Pa TVSH</Form.Label>
                                <Form.Control
                                    id="totPaTVSH"
                                    type="number"
                                    value={totPaTVSH}
                                    onChange={(e) => { setTotPaTVSH(e.target.value); }}
                                    onKeyDown={(e) => { ndrroField(e, "TVSH") }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>TVSH</Form.Label>
                                <Form.Control
                                    id="TVSH"
                                    type="number"
                                    value={TVSH}
                                    onChange={(e) => { setTVSH(e.target.value); }}
                                />
                            </Form.Group>
                            <br />
                            <Button
                                className="mb-3 Butoni"
                                onClick={() => handleRegjistroKalkulimin()}
                            >
                                Regjistro <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </Col>
                    </Row>
                    <h1 className="title">Lista e Kalkulimeve</h1>
                    <Button
                                className="mb-3 Butoni"
                                onClick={() => handleRegjistroKalkulimin()}
                            >
                                Ndrysho Statusin e Fatures <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                    <MDBTable style={{ width: "100%", }}>
                        <MDBTableHead>
                            <tr>
                                <th scope="col">Nr. Kalkulimit</th>
                                <th scope="col">Nr. Fatures</th>
                                <th scope="col">Partneri</th>
                                <th scope="col">Totali Pa TVSH</th>
                                <th scope="col">TVSH</th>
                                <th scope="col">Data e Fatures</th>
                                <th scope="col">Lloji Fatures</th>
                                <th scope="col">Statusi Pageses</th>
                                <th scope="col">Lloji Pageses</th>
                                <th scope="col">Statusi Kalkulimit</th>
                                <th scope="col">Funksione</th>
                            </tr>
                        </MDBTableHead>

                        <MDBTableBody>
                            {kalkulimet.map((k) => (
                                <tr key={k.idRegjistrimit}>
                                    <td>{k.idRegjistrimit}</td>
                                    <td>{k.nrFatures}</td>
                                    <td>{k.emriBiznesit}</td>
                                    <td>{k.totaliPaTvsh.toFixed(2)} €</td>
                                    <td>{k.tvsh.toFixed(2)} €</td>
                                    <td >{new Date(k.dataRegjistrimit).toLocaleDateString('en-GB', { dateStyle: 'short' })}</td>
                                    <td>{k.llojiKalkulimit}</td>
                                    <td>{k.statusiPageses}</td>
                                    <td>{k.llojiPageses}</td>
                                    <td>{k.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur"}</td>
                                    <td >
                                        <Button style={{ marginRight: "0.5em" }} variant="success" onClick={() => handleShfaqTeDhenat(k.idRegjistrimit)}><FontAwesomeIcon icon={faCircleInfo} /></Button>
                                        <Button disabled={k.statusiKalkulimit === "true" ? true : false} style={{ marginRight: "0.5em" }} variant="success" onClick={() => handleShfaqTeDhenat(k.idRegjistrimit)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </MDBTableBody>
                    </MDBTable>
                </Container>
            </>
            )
            }
        </div >
    );
};

export default TeDhenatFatures;

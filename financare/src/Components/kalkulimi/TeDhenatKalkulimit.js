import { useEffect, useState } from "react";
import classes from './Styles/TabelaEKompanive.module.css';
import axios from "axios";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { TailSpin } from 'react-loader-spinner';
import { Table, Container, Row, Col } from 'react-bootstrap';

function TeDhenatKalkulimit(props) {
    const [perditeso, setPerditeso] = useState('');
    const [loading, setLoading] = useState(false);
    const [produktet, setProduktet] = useState([]);
    const [teDhenatFat, setTeDhenatFat] = useState("");

    const getToken = localStorage.getItem("token");

    const authentikimi = {
        headers: {
            Authorization: `Bearer ${getToken}`,
        },
    };

    useEffect(() => {
        const vendosTeDhenat = async () => {
            try {
                setLoading(true);
                const produktet = await axios.get(
                    `https://localhost:7285/api/KalkulimiImallit/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.id}`, authentikimi
                );
                setProduktet(produktet.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        };

        vendosTeDhenat();
    }, [perditeso]);

    useEffect(() => {
        const shfaqTeDhenatFature = async () => {
            try {
                setLoading(true);
                const teDhenat = await axios.get(
                    `https://localhost:7285/api/KalkulimiImallit/shfaqRegjistrimetNgaID?id=${props.id}`, authentikimi
                );
                setTeDhenatFat(teDhenat.data);
                setLoading(false);

                console.log(teDhenat.data)
            }
            catch (err) {
                console.log(err);
                setLoading(false);
            }
        }

        shfaqTeDhenatFature();
    }, [perditeso]);


    const handleSave = () => {
        props.setMbyllTeDhenat();
    }

    const ndrroField = (e, tjetra) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById(tjetra).focus();
        }
    }

    return (
        <div className={classes.containerDashboardP}>
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
            ) : (<>
                <Container fluid>
                    <Row>
                        <h1 className="title">
                            Te Dhenat e Fatures
                            <Button
                                className="mb-3 Butoni"
                                onClick={handleSave}
                            >
                                Mbyll Te Dhenat <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </h1>
                    </Row>
                    <Row>
                        <Col className={classes.mobileResponsive}>
                            <h4>Partneri: {teDhenatFat.emriBiznesit}</h4>
                            <h4>Nr. Fatures: {teDhenatFat.nrFatures}</h4>
                            <h4>Data Fatures: {new Date(teDhenatFat.dataRegjistrimit).toLocaleDateString('en-GB', { dateStyle: 'short' })}</h4>
                            <h4>Totali: {parseFloat(teDhenatFat.totaliPaTvsh + teDhenatFat.tvsh).toFixed(2)} €</h4>
                        </Col>
                        <Col className={classes.mobileResponsive}>
                            <p><strong>Totali Pa TVSH:</strong> {parseFloat(teDhenatFat.totaliPaTvsh).toFixed(2)} €</p>
                            <p><strong>TVSH-ja:</strong> {parseFloat(teDhenatFat.tvsh).toFixed(2)} €</p>
                            <p><strong>Pagesa behet me:</strong> {teDhenatFat.llojiPageses}</p>
                            <p><strong>Statusi i Pageses:</strong> {teDhenatFat.statusiPageses}</p>
                        </Col>
                        <Col className={classes.mobileResponsive}>
                            <p><strong>Personi Pergjegjes:</strong> {teDhenatFat.stafiId + " - " + teDhenatFat.username}</p>
                            <p><strong>Nr. Kalkulimit: </strong>{teDhenatFat.idRegjistrimit}</p>
                            <p><strong>Lloji Fatures:</strong> {teDhenatFat.llojiKalkulimit}</p>
                            <p><strong>Statusi i kalkulimit:</strong> {teDhenatFat.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur"}</p>
                        </Col>
                    </Row>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nr. Rendore</th>
                                <th>ID dhe Emri</th>
                                <th>Sasia</th>
                                <th>Qmimi Bleres</th>
                                <th>Qmimi Shites</th>
                                <th>Shuma Totale Blerese</th>
                                <th>Shuma Totale Shitese</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produktet.map((produkti, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{produkti.idProduktit + " - " + produkti.emriProduktit}</td>
                                    <td>{produkti.sasiaStokut}</td>
                                    <td>{parseFloat(produkti.qmimiBleres).toFixed(2)} €</td>
                                    <td>{parseFloat(produkti.qmimiShites).toFixed(2)} €</td>
                                    <td>{(produkti.sasiaStokut * produkti.qmimiBleres).toFixed(2)} €</td>
                                    <td>{(produkti.sasiaStokut * produkti.qmimiShites).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Container>
            </>
            )}
        </div >
    );
};

export default TeDhenatKalkulimit;

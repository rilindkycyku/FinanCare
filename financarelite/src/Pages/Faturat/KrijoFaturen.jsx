import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import { getAll, getBusinessDetails, put, makeId, STORES } from "../../lib/db";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";
import { generateNrFatures } from "../../lib/invoiceView";
import { darkSelectStyles } from "../../lib/darkSelectStyles";
import { TVSH_OPTIONS } from "../../lib/options";

const BLANK_CLIENT = { emriBiznesit: "", nui: "", nrf: "", tvsh: "", adresa: "", nrKontaktit: "", email: "" };

const BLANK_ITEM = () => ({
  key: makeId("li"),
  emriProduktit: "",
  kodiProduktit: "",
  barkodi: "",
  emriNjesiaMatese: "copë",
  llojiTVSH: "18",
  qmimiShites: "",
  rabati1: "0",
  rabati2: "0",
  rabati3: "0",
  sasiaStokut: "1",
});

function KrijoFaturen() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [selectedClientId, setSelectedClientId] = useState("");
  const [klienti, setKlienti] = useState(BLANK_CLIENT);
  const [items, setItems] = useState([BLANK_ITEM()]);
  const [productToAdd, setProductToAdd] = useState("");
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [transporti, setTransporti] = useState("");
  const [dataRegjistrimit, setDataRegjistrimit] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAll(STORES.clients), getAll(STORES.products), getBusinessDetails()]).then(
      ([clientList, productList, biz]) => {
        setClients(clientList);
        setProducts(productList);
        setTeDhenatBiznesit(biz || {});
      }
    );
  }, []);

  const onSelectClient = (opt) => {
    const id = opt?.value || "";
    setSelectedClientId(id);
    const c = clients.find((c) => c.id === id);
    if (c) {
      setKlienti({
        emriBiznesit: c.emriBiznesit,
        nui: c.nui,
        nrf: c.nrf,
        tvsh: c.tvsh,
        adresa: c.adresa,
        nrKontaktit: c.nrKontaktit,
        email: c.email,
      });
    }
  };

  const onKlientiChange = (e) => setKlienti({ ...klienti, [e.target.name]: e.target.value });

  const addBlankItem = () => setItems((prev) => [...prev, BLANK_ITEM()]);

  const addProductItem = () => {
    const p = products.find((p) => p.id === productToAdd);
    if (!p) return;
    setItems((prev) => [
      ...prev,
      {
        key: makeId("li"),
        emriProduktit: p.emriProduktit,
        kodiProduktit: p.kodiProduktit,
        barkodi: p.barkodi,
        emriNjesiaMatese: p.emriNjesiaMatese,
        llojiTVSH: p.llojiTVSH,
        qmimiShites: p.qmimiShites,
        rabati1: p.rabati1 || "0",
        rabati2: "0",
        rabati3: "0",
        sasiaStokut: "1",
      },
    ]);
    setProductToAdd("");
  };

  const updateItem = (key, field, value) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [field]: value } : it)));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key));

  const clientOptions = useMemo(
    () => [{ value: "", label: "— klient i ri / ad-hoc —" }, ...clients.map((c) => ({ value: c.id, label: c.emriBiznesit }))],
    [clients]
  );
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: `${p.emriProduktit} (${parseFloat(p.qmimiShites || 0).toFixed(2)} €)` })),
    [products]
  );

  const validItems = useMemo(() => items.filter((it) => it.emriProduktit && parseFloat(it.qmimiShites) > 0), [items]);
  const totals = useMemo(() => calcInvoiceTotals(validItems, transporti), [validItems, transporti]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!klienti.emriBiznesit || validItems.length === 0) {
      alert("Ju lutem plotësoni emrin e klientit dhe të paktën një artikull me çmim.");
      return;
    }
    setSaving(true);
    try {
      const allInvoices = await getAll(STORES.invoices);
      const nrRendorFatures = allInvoices.length + 1;
      const nrFatures = generateNrFatures(teDhenatBiznesit.shkurtesaEmritBiznesit, nrRendorFatures, new Date(dataRegjistrimit));
      const record = {
        id: makeId("inv"),
        nrFatures,
        nrRendorFatures,
        dataRegjistrimit: new Date(dataRegjistrimit).toISOString(),
        pershkrimShtese,
        transporti: parseFloat(transporti) || 0,
        klienti,
        items: validItems.map((it) => ({
          emriProduktit: it.emriProduktit,
          kodiProduktit: it.kodiProduktit,
          barkodi: it.barkodi,
          emriNjesiaMatese: it.emriNjesiaMatese,
          llojiTVSH: it.llojiTVSH,
          qmimiShites: it.qmimiShites,
          rabati1: it.rabati1,
          rabati2: it.rabati2,
          rabati3: it.rabati3,
          sasiaStokut: it.sasiaStokut,
        })),
      };
      await put(STORES.invoices, record);
      navigate(`/faturat/${record.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title="Faturë e Re" />
      <NavBar />
      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Faturë e Re</h1>

        <Form onSubmit={handleSave}>
          <h5 className="mt-2 mb-3">Të Dhënat e Klientit</h5>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label>Zgjidh nga Klientët (opsionale)</Form.Label>
              <Select
                styles={darkSelectStyles}
                classNamePrefix="react-select"
                options={clientOptions}
                value={clientOptions.find((o) => o.value === selectedClientId)}
                onChange={onSelectClient}
              />
            </Col>
            <Col md={4}>
              <Form.Label>
                Emri i Klientit <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control name="emriBiznesit" value={klienti.emriBiznesit} onChange={onKlientiChange} required />
            </Col>
            <Col md={4}>
              <Form.Label>Adresa</Form.Label>
              <Form.Control name="adresa" value={klienti.adresa || ""} onChange={onKlientiChange} />
            </Col>
            <Col md={3}>
              <Form.Label>NUI</Form.Label>
              <Form.Control name="nui" value={klienti.nui || ""} onChange={onKlientiChange} />
            </Col>
            <Col md={3}>
              <Form.Label>NF</Form.Label>
              <Form.Control name="nrf" value={klienti.nrf || ""} onChange={onKlientiChange} />
            </Col>
            <Col md={3}>
              <Form.Label>Nr. Kontaktit</Form.Label>
              <Form.Control name="nrKontaktit" value={klienti.nrKontaktit || ""} onChange={onKlientiChange} />
            </Col>
            <Col md={3}>
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={klienti.email || ""} onChange={onKlientiChange} />
            </Col>
          </Row>

          <h5 className="mb-3">Artikujt</h5>
          <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
            <div style={{ minWidth: 260 }}>
              <Form.Label>Shto nga Produktet</Form.Label>
              <Select
                styles={darkSelectStyles}
                classNamePrefix="react-select"
                options={productOptions}
                placeholder="— zgjidh produkt —"
                value={productOptions.find((o) => o.value === productToAdd) || null}
                onChange={(opt) => setProductToAdd(opt?.value || "")}
              />
            </div>
            <Button variant="outline-light" onClick={addProductItem} disabled={!productToAdd}>
              <Plus size={14} className="me-1" /> Shto
            </Button>
            <Button variant="outline-light" onClick={addBlankItem}>
              <Plus size={14} className="me-1" /> Artikull Ad-hoc
            </Button>
          </div>

          <Table responsive className="align-middle mb-4">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Emërtimi</th>
                <th style={{ width: 90 }}>Njm</th>
                <th style={{ width: 90 }}>Sasia</th>
                <th style={{ width: 110 }}>Çmimi €</th>
                <th style={{ width: 110 }}>TVSH %</th>
                <th style={{ width: 90 }}>Rabati %</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.key}>
                  <td>
                    <Form.Control
                      size="sm"
                      value={it.emriProduktit}
                      onChange={(e) => updateItem(it.key, "emriProduktit", e.target.value)}
                      placeholder="Emri i artikullit"
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      value={it.emriNjesiaMatese}
                      onChange={(e) => updateItem(it.key, "emriNjesiaMatese", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={it.sasiaStokut}
                      onChange={(e) => updateItem(it.key, "sasiaStokut", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={it.qmimiShites}
                      onChange={(e) => updateItem(it.key, "qmimiShites", e.target.value)}
                    />
                  </td>
                  <td style={{ minWidth: 100 }}>
                    <Select
                      styles={darkSelectStyles}
                      classNamePrefix="react-select"
                      options={TVSH_OPTIONS}
                      value={TVSH_OPTIONS.find((o) => o.value === it.llojiTVSH)}
                      onChange={(opt) => updateItem(it.key, "llojiTVSH", opt.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={it.rabati1}
                      onChange={(e) => updateItem(it.key, "rabati1", e.target.value)}
                    />
                  </td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeItem(it.key)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label>Data e Faturës</Form.Label>
              <Form.Control type="date" value={dataRegjistrimit} onChange={(e) => setDataRegjistrimit(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>Transporti €</Form.Label>
              <Form.Control type="number" step="0.01" value={transporti} onChange={(e) => setTransporti(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>Shënime Shtesë</Form.Label>
              <Form.Control value={pershkrimShtese} onChange={(e) => setPershkrimShtese(e.target.value)} />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mb-4">
            <div className="text-end">
              <div className="text-muted small">Totali Pa TVSH: {totals.totaliPaTVSH.toFixed(2)} €</div>
              <div className="text-muted small">TVSH: {(totals.tvsH8 + totals.tvsH18).toFixed(2)} €</div>
              <div className="fs-4 fw-bold">Çmimi Total: {totals.totaliFinal.toFixed(2)} €</div>
            </div>
          </div>

          <Button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Duke ruajtur..." : "Ruaj dhe Shiko Faturën"}
          </Button>
        </Form>
      </div>
    </>
  );
}

export default KrijoFaturen;

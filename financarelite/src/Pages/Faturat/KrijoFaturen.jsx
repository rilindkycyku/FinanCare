import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Row, Col, Button, Card, Badge, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Plus, ArrowLeft, Camera } from "lucide-react";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import BarcodeScannerModal from "../../Components/BarcodeScannerModal";
import Tabela from "../../Components/Tabela/Tabela";
import { getAll, getOne, getBusinessDetails, put, remove, makeId, STORES } from "../../lib/db";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";
import { generateNrFatures } from "../../lib/invoiceView";
import { darkSelectStyles } from "../../lib/darkSelectStyles";
import { useTvshTypes, useUnits, useDocumentTypes } from "../../lib/useConfigLists";
import { DEFAULT_DOCUMENT_TYPES } from "../../lib/options";
import { useDialog } from "../../Context/DialogContext";

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
  const { id: editId } = useParams();
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [selectedClientId, setSelectedClientId] = useState("");
  const [klienti, setKlienti] = useState(BLANK_CLIENT);
  const [items, setItems] = useState([]);
  const [productToAdd, setProductToAdd] = useState("");
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [transporti, setTransporti] = useState("");
  const [dataRegjistrimit, setDataRegjistrimit] = useState(new Date().toISOString().slice(0, 10));
  const [llojiDokumentit, setLlojiDokumentit] = useState("");
  const [saving, setSaving] = useState(false);
  // Step 1 collects the partner/client and invoice details; step 2 opens the
  // dedicated "add items" screen, mirroring the Porosite → Regjistro Faturën flow.
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const dialog = useDialog();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const tvshTypes = useTvshTypes();
  const units = useUnits();
  const documentTypesLoaded = useDocumentTypes();
  // Falls back to the built-in defaults until the store finishes loading, so the select
  // always has options even on the very first render.
  const documentTypes = documentTypesLoaded.length > 0 ? documentTypesLoaded : DEFAULT_DOCUMENT_TYPES;

  useEffect(() => {
    if (!llojiDokumentit && documentTypes.length > 0) setLlojiDokumentit(documentTypes[0].value);
  }, [documentTypes, llojiDokumentit]);

  const dokumentiZgjedhur = documentTypes.find((d) => d.value === llojiDokumentit) || documentTypes[0];
  // A Fletëkthim (credit note) shows every amount as negative — done once here, on the same
  // items every other total already derives from, so the line-item table, footer TVSH
  // breakdown, and saved invoice all agree without any of them needing to special-case it.
  const signedItems = useMemo(() => {
    if (!dokumentiZgjedhur.negateAmounts) return items;
    return items.map((it) => ({ ...it, qmimiShites: String(-(parseFloat(it.qmimiShites) || 0)) }));
  }, [items, dokumentiZgjedhur.negateAmounts]);

  // Compact label ("18%") so the narrow line-item column stays readable — the full name
  // ("TVSH Standarde") is what shows on the product form and the "Llojet e TVSH" settings list.
  const tvshOptions = useMemo(
    () => tvshTypes.map((t) => ({ value: String(t.perqindja), label: `${t.perqindja}%` })),
    [tvshTypes]
  );
  const unitOptions = useMemo(() => units.map((u) => ({ value: u.emri, label: u.emri })), [units]);

  useEffect(() => {
    Promise.all([getAll(STORES.clients), getAll(STORES.products), getBusinessDetails()]).then(
      ([clientList, productList, biz]) => {
        setClients(clientList);
        setProducts(productList);
        setTeDhenatBiznesit(biz || {});
      }
    );
  }, []);

  // Editing an existing invoice: load it, refuse if it's locked (mbyllur), and reuse its
  // id/nrFatures for every save from here on instead of allocating a brand-new invoice.
  useEffect(() => {
    if (!editId) return;
    getOne(STORES.invoices, editId).then(async (inv) => {
      if (!inv) {
        await dialog.alert("Nuk u gjet kjo faturë.", { title: "Fatura Mungon" });
        navigate("/faturat");
        return;
      }
      if (inv.mbyllur !== false) {
        await dialog.alert("Kjo faturë është e mbyllur. Ndryshoni statusin në 'e hapur' nga lista e faturave për ta redaktuar.", {
          title: "Fatura e Mbyllur",
        });
        navigate(`/faturat/${editId}`);
        return;
      }
      draftMetaRef.current = { id: inv.id, nrFatures: inv.nrFatures, nrRendorFatures: inv.nrRendorFatures };
      setKlienti({ ...BLANK_CLIENT, ...inv.klienti });
      setDataRegjistrimit((inv.dataRegjistrimit || new Date().toISOString()).slice(0, 10));
      setPershkrimShtese(inv.pershkrimShtese || "");
      setLlojiDokumentit(inv.llojiDokumentit || "");
      // Stored amounts are already sign-flipped for negateAmounts document types (e.g.
      // Fletëkthim) — undo that here so the form always shows the positive number the user
      // originally typed; the same sign flip gets re-applied automatically on save.
      const negated = (documentTypes.find((d) => d.value === inv.llojiDokumentit) || {}).negateAmounts;
      setTransporti(negated ? String(Math.abs(parseFloat(inv.transporti) || 0)) : String(inv.transporti ?? ""));
      setItems(
        (inv.items || []).map((it) => ({
          ...it,
          key: makeId("li"),
          qmimiShites: negated ? String(Math.abs(parseFloat(it.qmimiShites) || 0)) : it.qmimiShites,
        }))
      );
      setStep(2);
      setLoadingEdit(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

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

  const [manualItem, setManualItem] = useState(BLANK_ITEM());
  const [editingKey, setEditingKey] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const onManualItemChange = (field, value) => setManualItem((prev) => ({ ...prev, [field]: value }));

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    const match = products.find((p) => p.barkodi && p.barkodi === scannedCode);
    if (match) {
      selectProduct(match.id);
    } else {
      onManualItemChange("barkodi", scannedCode);
    }
  };

  const focusField = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  // Same field-hopping pattern as RegjistroFaturen's ndrroField: Enter moves to the next
  // input instead of submitting the form; on the last field it runs `onLast` instead
  // (commits the item on the items form, advances to step 2 on the client/details form).
  // Only safe to wire onto plain <Form.Control> inputs — react-select calls this prop
  // *before* its own Enter handling, so preventDefault() here would swallow react-select's
  // own option-select/create logic. Those fields jump focus from inside onChange instead.
  const focusNextField = (e, nextId, onLast = addManualItem) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!nextId) {
      onLast();
      return;
    }
    focusField(nextId);
  };

  const addManualItem = async () => {
    if (!manualItem.emriProduktit || !(parseFloat(manualItem.qmimiShites) > 0)) return;
    let nextItems;
    if (editingKey) {
      nextItems = items.map((it) => (it.key === editingKey ? { ...manualItem, key: editingKey } : it));
      setItems(nextItems);
      setEditingKey(null);
    } else {
      nextItems = [...items, { ...manualItem, key: makeId("li") }];
      setItems(nextItems);

      // Already came from picking a catalogue product above — nothing new to save,
      // and no need to tell the user their own catalogue product "already exists".
      const isFromCatalog = !!productToAdd;
      if (!isFromCatalog) {
        // Manually-typed items aren't in the catalogue yet, so save them there too,
        // otherwise they'd only ever exist inside this one invoice — but skip it if a
        // product with the same name (or barcode) is already there, to avoid duplicates.
        const nameKey = manualItem.emriProduktit.trim().toLowerCase();
        const barcodeKey = manualItem.barkodi?.trim().toLowerCase();
        const alreadyExists = products.some(
          (p) =>
            p.emriProduktit?.trim().toLowerCase() === nameKey ||
            (barcodeKey && p.barkodi?.trim().toLowerCase() === barcodeKey)
        );
        if (!alreadyExists) {
          const productRecord = {
            id: makeId("prod"),
            emriProduktit: manualItem.emriProduktit,
            kodiProduktit: manualItem.kodiProduktit,
            barkodi: manualItem.barkodi,
            emriNjesiaMatese: manualItem.emriNjesiaMatese,
            llojiTVSH: manualItem.llojiTVSH,
            qmimiShites: manualItem.qmimiShites,
            rabati1: manualItem.rabati1,
          };
          await put(STORES.products, productRecord);
          setProducts((prev) => [...prev, productRecord]);
          setNotice(`"${manualItem.emriProduktit}" u shtua edhe te Produktet.`);
        } else {
          setNotice(`"${manualItem.emriProduktit}" ekziston tashmë te Produktet — nuk u krijua kopje e re.`);
        }
      }
    }
    setManualItem(BLANK_ITEM());
    setProductToAdd("");
    await persistDraftInvoice(nextItems);
  };

  const editItem = (key) => {
    const it = items.find((it) => it.key === key);
    if (!it) return;
    setManualItem(it);
    setEditingKey(key);
    setProductToAdd("");
  };

  const cancelEditItem = () => {
    setEditingKey(null);
    setProductToAdd("");
    setManualItem(BLANK_ITEM());
  };

  // Selecting a product just fills the form below with its data (price, unit, TVSH,
  // barcode...) so the user can review/adjust quantity or rabat before adding it —
  // mirrors RegjistroFaturen's "search product → shows its details" flow.
  const selectProduct = (id) => {
    setProductToAdd(id);
    const p = products.find((p) => p.id === id);
    if (!p) return;
    setManualItem({
      key: makeId("li"),
      emriProduktit: p.emriProduktit,
      kodiProduktit: p.kodiProduktit || "",
      barkodi: p.barkodi || "",
      emriNjesiaMatese: p.emriNjesiaMatese,
      llojiTVSH: p.llojiTVSH,
      qmimiShites: p.qmimiShites,
      rabati1: p.rabati1 || "0",
      rabati2: "0",
      rabati3: "0",
      sasiaStokut: "1",
    });
    setEditingKey(null);
  };

  const removeItem = (key) => {
    const nextItems = items.filter((it) => it.key !== key);
    setItems(nextItems);
    if (editingKey === key) cancelEditItem();
    persistDraftInvoice(nextItems);
  };

  const handleVazhdo = async () => {
    if (!klienti.emriBiznesit) {
      await dialog.alert("Ju lutem plotësoni emrin e klientit/partnerit.", { title: "Të dhëna mungojnë" });
      return;
    }
    // A hand-typed client isn't in the catalogue yet, so save it there too,
    // the same way manually-typed invoice items get added to Produktet — but skip it
    // if a client with the same name (or NUI) already exists, to avoid duplicates.
    if (!selectedClientId) {
      const nameKey = klienti.emriBiznesit.trim().toLowerCase();
      const nuiKey = klienti.nui?.trim().toLowerCase();
      const existing = clients.find(
        (c) =>
          c.emriBiznesit?.trim().toLowerCase() === nameKey ||
          (nuiKey && c.nui?.trim().toLowerCase() === nuiKey)
      );
      if (existing) {
        setSelectedClientId(existing.id);
        setNotice(`"${klienti.emriBiznesit}" ekziston tashmë te Klientët — u lidh me klientin ekzistues.`);
      } else {
        // This form has no Privat/Biznesor toggle like ShtoKlientin's — infer it from
        // whether a business identifier was filled in, so Klientët lists it correctly.
        const llojiPartnerit = klienti.nui?.trim() || klienti.nrf?.trim() ? "biznes" : "privat";
        const clientRecord = { id: makeId("client"), llojiPartnerit, ...klienti };
        await put(STORES.clients, clientRecord);
        setClients((prev) => [...prev, clientRecord]);
        setSelectedClientId(clientRecord.id);
        setNotice(`"${klienti.emriBiznesit}" u shtua edhe te Klientët.`);
      }
    }
    setStep(2);
  };

  // Searchable by name or NUI — mirrors productSearchOptions below, so typing an existing
  // client's name finds it while typing a brand-new name just creates it inline.
  const clientSearchOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: c.id,
        label: [c.emriBiznesit, c.nui].filter(Boolean).join(" - "),
      })),
    [clients]
  );

  const onClientFieldChange = (opt) => {
    if (!opt) {
      setSelectedClientId("");
      setKlienti(BLANK_CLIENT);
    } else if (opt.__isNew__) {
      setSelectedClientId("");
      setKlienti({ ...BLANK_CLIENT, emriBiznesit: opt.value });
    } else {
      onSelectClient(opt);
    }
  };
  // Searchable by name, barcode, or product code — react-select's default filter matches
  // against the whole label, so folding all three in here is what makes barcode search work.
  const productSearchOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: [p.emriProduktit, p.barkodi, p.kodiProduktit].filter(Boolean).join(" - "),
      })),
    [products]
  );

  const validItems = useMemo(
    () => signedItems.filter((it, i) => items[i].emriProduktit && parseFloat(items[i].qmimiShites) > 0),
    [signedItems, items]
  );
  const itemRows = useMemo(
    () =>
      items.map((it) => ({
        ID: it.key,
        Emërtimi: it.emriProduktit,
        "Barkodi / Kodi": [it.barkodi, it.kodiProduktit].filter(Boolean).join(" / ") || "-",
        Njm: it.emriNjesiaMatese,
        Sasia: parseFloat(it.sasiaStokut || 0),
        "Çmimi €": `${parseFloat(it.qmimiShites || 0).toFixed(2)} €`,
        "TVSH %": `${it.llojiTVSH}%`,
        "Rabati %": `${parseFloat(it.rabati1 || 0)}%`,
      })),
    [items]
  );
  const transportiSigned = dokumentiZgjedhur.negateAmounts ? -(parseFloat(transporti) || 0) : transporti;
  const totals = useMemo(() => calcInvoiceTotals(validItems, transportiSigned), [validItems, transportiSigned]);

  // Once the invoice has at least one item, it's persisted to Faturat right away — so
  // closing the tab mid-edit never loses it, instead of only saving on the final button.
  // A ref (not state) holds the id/number so back-to-back item adds can't race and each
  // allocate their own nrRendorFatures before the other's write is visible.
  const draftMetaRef = useRef(null);
  const draftCreationPromiseRef = useRef(null);

  const ensureDraftInvoice = () => {
    if (draftMetaRef.current) return Promise.resolve(draftMetaRef.current);
    if (draftCreationPromiseRef.current) return draftCreationPromiseRef.current;
    draftCreationPromiseRef.current = (async () => {
      const allInvoices = await getAll(STORES.invoices);
      const nrRendorFatures = allInvoices.length + 1;
      const nrFatures = generateNrFatures(
        teDhenatBiznesit.shkurtesaEmritBiznesit,
        nrRendorFatures,
        new Date(dataRegjistrimit),
        dokumentiZgjedhur.value
      );
      const meta = { id: makeId("inv"), nrFatures, nrRendorFatures };
      draftMetaRef.current = meta;
      return meta;
    })();
    return draftCreationPromiseRef.current;
  };

  const buildInvoiceRecord = (meta, itemsList, mbyllur) => {
    const signed = dokumentiZgjedhur.negateAmounts
      ? itemsList.map((it) => ({ ...it, qmimiShites: String(-(parseFloat(it.qmimiShites) || 0)) }))
      : itemsList;
    const valid = signed.filter((it, i) => itemsList[i].emriProduktit && parseFloat(itemsList[i].qmimiShites) > 0);
    return {
      id: meta.id,
      nrFatures: meta.nrFatures,
      nrRendorFatures: meta.nrRendorFatures,
      llojiDokumentit: dokumentiZgjedhur.value,
      dataRegjistrimit: new Date(dataRegjistrimit).toISOString(),
      pershkrimShtese,
      transporti: parseFloat(transportiSigned) || 0,
      klienti,
      mbyllur,
      items: valid.map((it) => ({
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
  };

  // Called right after items change with the freshly-computed array — reading the `items`
  // state here instead would still see the pre-update value, since setState doesn't mutate
  // the current closure. Always saved as "open" (mbyllur: false) — it's still being worked on
  // here, whether that's a brand-new invoice or one reopened for editing; only the final "Ruaj
  // dhe Shiko Faturën" click below marks it closed.
  const persistDraftInvoice = async (itemsList) => {
    const hasValidItem = itemsList.some((it) => it.emriProduktit && parseFloat(it.qmimiShites) > 0);
    if (!hasValidItem) {
      // Every item got removed again — don't leave an empty invoice behind in Faturat.
      if (draftMetaRef.current) {
        await remove(STORES.invoices, draftMetaRef.current.id);
        draftMetaRef.current = null;
        draftCreationPromiseRef.current = null;
      }
      return;
    }
    const meta = await ensureDraftInvoice();
    const record = buildInvoiceRecord(meta, itemsList, false);
    await put(STORES.invoices, record);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!klienti.emriBiznesit || validItems.length === 0) {
      await dialog.alert("Ju lutem plotësoni emrin e klientit dhe të paktën një artikull me çmim.", {
        title: "Të dhëna mungojnë",
      });
      return;
    }
    setSaving(true);
    try {
      const meta = await ensureDraftInvoice();
      const record = buildInvoiceRecord(meta, items, true);
      await put(STORES.invoices, record);
      navigate(`/faturat/${record.id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingEdit) {
    return (
      <>
        <PageTitle title="Ndrysho Faturën" />
        <NavBar />
        <div className="containerDashboardP">Duke ngarkuar...</div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={editId ? "Ndrysho Faturën" : "Faturë e Re"} />
      <NavBar />
      <div className="containerDashboardP">
        {notice && (
          <Alert variant="info" dismissible onClose={() => setNotice("")} className="mb-3">
            {notice}
          </Alert>
        )}
        {step === 1 ? (
          <>
            <div className="mb-4">
              <h1 className="titulliPerditeso mb-1">{editId ? "Ndrysho Faturën" : "Faturë e Re"}</h1>
              <div className="text-muted" style={{ fontSize: "10pt" }}>
                Plotëso të dhënat e klientit dhe faturës për të vazhduar te artikujt.
              </div>
            </div>

            <Card className="shadow-sm mb-3">
              <Card.Header className="fw-semibold">Lloji i Dokumentit</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Select
                      styles={darkSelectStyles}
                      classNamePrefix="react-select"
                      inputId="fd-lloji-input"
                      options={documentTypes}
                      value={dokumentiZgjedhur}
                      onChange={(opt) => {
                        setLlojiDokumentit(opt.value);
                        focusField("fd-klienti-input");
                      }}
                    />
                    {dokumentiZgjedhur.negateAmounts && (
                      <div className="text-muted small mt-1">Shumat do të shfaqen si negative (kthim/kredit).</div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-3">
              <Card.Header className="fw-semibold">Të Dhënat e Klientit</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>
                      Emri i Klientit / Firmës <span className="text-danger">*</span>
                    </Form.Label>
                    <CreatableSelect
                      styles={darkSelectStyles}
                      classNamePrefix="react-select"
                      inputId="fd-klienti-input"
                      options={clientSearchOptions}
                      placeholder="Kërko klientin ekzistues ose shkruaj emrin e ri..."
                      formatCreateLabel={(input) => `Përdor "${input}"`}
                      value={klienti.emriBiznesit ? { value: klienti.emriBiznesit, label: klienti.emriBiznesit } : null}
                      onChange={(opt) => {
                        onClientFieldChange(opt);
                        if (opt) focusField("fd-adresa");
                      }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Adresa</Form.Label>
                    <Form.Control
                      id="fd-adresa"
                      name="adresa"
                      value={klienti.adresa || ""}
                      onChange={onKlientiChange}
                      onKeyDown={(e) => focusNextField(e, "fd-nui")}
                    />
                  </Col>
                </Row>
                <hr />
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Label>NUI</Form.Label>
                    <Form.Control
                      id="fd-nui"
                      name="nui"
                      value={klienti.nui || ""}
                      onChange={onKlientiChange}
                      onKeyDown={(e) => focusNextField(e, "fd-nf")}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>NF</Form.Label>
                    <Form.Control
                      id="fd-nf"
                      name="nrf"
                      value={klienti.nrf || ""}
                      onChange={onKlientiChange}
                      onKeyDown={(e) => focusNextField(e, "fd-kontakt")}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Nr. Kontaktit</Form.Label>
                    <Form.Control
                      id="fd-kontakt"
                      name="nrKontaktit"
                      value={klienti.nrKontaktit || ""}
                      onChange={onKlientiChange}
                      onKeyDown={(e) => focusNextField(e, "fd-email")}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      id="fd-email"
                      name="email"
                      value={klienti.email || ""}
                      onChange={onKlientiChange}
                      onKeyDown={(e) => focusNextField(e, "fd-data")}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
              <Card.Header className="fw-semibold">Detajet e Faturës</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Label>Data e Faturës</Form.Label>
                    <Form.Control
                      id="fd-data"
                      type="date"
                      value={dataRegjistrimit}
                      onChange={(e) => setDataRegjistrimit(e.target.value)}
                      onKeyDown={(e) => focusNextField(e, "fd-transport")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Transporti €</Form.Label>
                    <Form.Control
                      id="fd-transport"
                      type="number"
                      step="0.01"
                      value={transporti}
                      onChange={(e) => setTransporti(e.target.value)}
                      onKeyDown={(e) => focusNextField(e, "fd-shenime")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Shënime Shtesë</Form.Label>
                    <Form.Control
                      id="fd-shenime"
                      value={pershkrimShtese}
                      onChange={(e) => setPershkrimShtese(e.target.value)}
                      onKeyDown={(e) => focusNextField(e, null, handleVazhdo)}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end mb-4">
              <Button variant="primary" onClick={handleVazhdo}>
                Vazhdo te Artikujt <Plus size={14} className="ms-1" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h1 className="titulliPerditeso mb-1">Shto Artikujt</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Regjistro artikujt për këtë faturë.
                </div>
              </div>
              <Button variant="outline-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={14} className="me-1" /> Kthehu mbrapa
              </Button>
            </div>

            <Form onSubmit={handleSave}>
              <Row className="g-3 mb-4">
                <Col lg={7}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="fw-semibold">Shto Artikull</Card.Header>
                    <Card.Body>
                      <Form.Label>Shto Artikull</Form.Label>
                      <div
                        onKeyDown={(e) => {
                          // Safety net: stops Enter from ever bubbling up to the invoice
                          // form's onSubmit — each field below decides what Enter does.
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      >
                      <Row className="g-2 mb-2">
                        <Col xs={12}>
                          <Form.Label className="small text-muted mb-1">Emërtimi (kërko me emër ose barkod)</Form.Label>
                          <CreatableSelect
                            styles={darkSelectStyles}
                            classNamePrefix="react-select"
                            inputId="mi-emertimi"
                            options={productSearchOptions}
                            placeholder="Shkruaj emrin, barkodin ose krijo artikull të ri..."
                            formatCreateLabel={(input) => `Përdor "${input}"`}
                            value={
                              manualItem.emriProduktit
                                ? { value: manualItem.emriProduktit, label: manualItem.emriProduktit }
                                : null
                            }
                            onChange={(opt) => {
                              if (!opt) {
                                onManualItemChange("emriProduktit", "");
                                return;
                              }
                              if (opt.__isNew__) {
                                setProductToAdd("");
                                onManualItemChange("emriProduktit", opt.value);
                              } else {
                                selectProduct(opt.value);
                              }
                              focusField("mi-njm-input");
                            }}
                          />
                        </Col>
                      </Row>
                      <Row className="g-2 mb-2">
                        <Col xs={6} md={3}>
                          <Form.Label className="small text-muted mb-1">Njm</Form.Label>
                          <Select
                            styles={darkSelectStyles}
                            classNamePrefix="react-select"
                            options={unitOptions}
                            inputId="mi-njm-input"
                            value={
                              manualItem.emriNjesiaMatese
                                ? { value: manualItem.emriNjesiaMatese, label: manualItem.emriNjesiaMatese }
                                : null
                            }
                            onChange={(opt) => {
                              onManualItemChange("emriNjesiaMatese", opt?.value || "");
                              if (opt) focusField("mi-sasia");
                            }}
                            onKeyDown={(e) => {
                              // react-select only fires onChange when its menu is open and a
                              // highlighted option gets picked — if Enter lands here with the
                              // menu still closed, it would otherwise do nothing at all.
                              if (e.key === "Enter" && e.target.getAttribute("aria-expanded") !== "true") {
                                e.preventDefault();
                                focusField("mi-sasia");
                              }
                            }}
                          />
                        </Col>
                        <Col xs={6} md={3}>
                          <Form.Label className="small text-muted mb-1">Sasia</Form.Label>
                          <Form.Control
                            id="mi-sasia"
                            type="number"
                            step="0.01"
                            value={manualItem.sasiaStokut}
                            onChange={(e) => onManualItemChange("sasiaStokut", e.target.value)}
                            onKeyDown={(e) => focusNextField(e, "mi-cmimi")}
                          />
                        </Col>
                        <Col xs={6} md={3}>
                          <Form.Label className="small text-muted mb-1">Çmimi €</Form.Label>
                          <Form.Control
                            id="mi-cmimi"
                            type="number"
                            step="0.01"
                            value={manualItem.qmimiShites}
                            onChange={(e) => onManualItemChange("qmimiShites", e.target.value)}
                            onKeyDown={(e) => focusNextField(e, "mi-rabati")}
                          />
                        </Col>
                        <Col xs={6} md={3}>
                          <Form.Label className="small text-muted mb-1">Rabati %</Form.Label>
                          <Form.Control
                            id="mi-rabati"
                            type="number"
                            step="0.01"
                            value={manualItem.rabati1}
                            onChange={(e) => onManualItemChange("rabati1", e.target.value)}
                            onKeyDown={(e) => focusNextField(e, "mi-tvsh-input")}
                          />
                        </Col>
                      </Row>
                      <Row className="g-2">
                        <Col xs={12} md={4}>
                          <Form.Label className="small text-muted mb-1">TVSH %</Form.Label>
                          <Select
                            styles={darkSelectStyles}
                            classNamePrefix="react-select"
                            options={tvshOptions}
                            inputId="mi-tvsh-input"
                            value={tvshOptions.find((o) => o.value === manualItem.llojiTVSH) || null}
                            onChange={(opt) => {
                              onManualItemChange("llojiTVSH", opt.value);
                              focusField("mi-barkodi");
                            }}
                            onKeyDown={(e) => {
                              // Same gap as the Njm select above: react-select ignores Enter
                              // entirely while its menu is closed, so landing here via
                              // Enter-hopping and pressing Enter again would otherwise do nothing.
                              if (e.key === "Enter" && e.target.getAttribute("aria-expanded") !== "true") {
                                e.preventDefault();
                                focusField("mi-barkodi");
                              }
                            }}
                          />
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Label className="small text-muted mb-1">Barkodi</Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="mi-barkodi"
                              value={manualItem.barkodi}
                              onChange={(e) => onManualItemChange("barkodi", e.target.value)}
                              onKeyDown={(e) => focusNextField(e, "mi-kodi")}
                              placeholder="Skano ose shëno..."
                            />
                            <Button variant="outline-secondary" onClick={() => setShowScanner(true)} title="Skano Barkodin">
                              <Camera size={16} />
                            </Button>
                          </InputGroup>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Label className="small text-muted mb-1">Kodi i Produktit</Form.Label>
                          <Form.Control
                            id="mi-kodi"
                            value={manualItem.kodiProduktit}
                            onChange={(e) => onManualItemChange("kodiProduktit", e.target.value)}
                            onKeyDown={(e) => focusNextField(e, null)}
                          />
                        </Col>
                      </Row>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        {editingKey && (
                          <Button variant="outline-secondary" size="sm" onClick={cancelEditItem}>
                            Anulo
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={addManualItem}
                          disabled={!manualItem.emriProduktit || !(parseFloat(manualItem.qmimiShites) > 0)}
                        >
                          <Plus size={14} className="me-1" /> {editingKey ? "Ruaj Ndryshimet" : "Shto Artikull"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={5}>
                  <Card className="shadow-sm h-100" style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">Përmbledhje Fature</Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold text-truncate">{klienti.emriBiznesit || "-"}</div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Lloji i Dokumentit
                          </div>
                          <div className="fw-semibold text-truncate">
                            {dokumentiZgjedhur.label} <Badge bg="secondary">{dokumentiZgjedhur.value}</Badge>
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Data e Faturës
                          </div>
                          <div className="fw-semibold">{dataRegjistrimit}</div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali Artikujve
                          </div>
                          <div className="fw-semibold">{validItems.length}</div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            TVSH
                          </div>
                          <div className="fw-semibold">{totals.totaliTVSH.toFixed(2)} €</div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali Faturës
                          </div>
                          <div className="fw-bold text-success" style={{ fontSize: "1.2rem" }}>
                            {totals.totaliFinal.toFixed(2)} €
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-4">
                        <Button type="submit" className="btn-primary" disabled={saving}>
                          {saving ? "Duke ruajtur..." : "Ruaj dhe Shiko Faturën"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Tabela
                data={itemRows}
                tableName="Tabela e Artikujve"
                mosShfaqID
                kaButona
                funksionButonEdit={editItem}
                funksionButonFshij={removeItem}
              />
              <div className="text-muted small text-end px-2">Totali Pa TVSH: {totals.totaliPaTVSH.toFixed(2)} €</div>
            </Form>
          </>
        )}
      </div>
      <BarcodeScannerModal show={showScanner} onHide={() => setShowScanner(false)} onScan={handleScanResult} />
    </>
  );
}

export default KrijoFaturen;

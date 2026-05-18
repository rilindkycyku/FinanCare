import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
  Card
} from "react-bootstrap";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import {
  Plus,
  Search,
  Filter,
  Eraser,
  Edit3,
  Trash2,
  Info,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Banknote,
  RefreshCcw,
  FileCheck,
  Download,
  FileText
} from "lucide-react";
import EksportoTeDhenat from "./EksportoTeDhenat";
import SortIcon from "./SortIcon";
import useSortableData from "../../../Context/useSortableData";
import CustomDatePicker from "../layout/CustomDatePicker";
import { format, parseISO } from "date-fns";
import Titulli from "../Titulli";
import SalesLabel from "../SalesLabel";

function Tabela({
  data,
  tableName,
  kaButona,
  funksionButonShto,
  funksionButonEdit,
  funksionButonFshij,
  funksionShfaqFature,
  funksionEditoFaturen,
  funksioniEditoStokunQmimin,
  funksionNdryshoStatusinEFatures,
  funksionImportoNgaPranimiMallit,
  funksionFaturoOferten,
  dateField,
  startDateField,
  endDateField,
  mosShfaqID,
  mosShfaqKerkimin,
  mosShfaqTitullin,
  mosShfaqPaginimin,
  butoniShtypZbritjet,
  storeName,
  products,
  shfaqEksporto,
  bartjaArtikullit,
  funksionBartjaArtikullit,
}) {
  const [perditeso, setPerditeso] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(mosShfaqPaginimin ? (data.length > 0 ? data.length : 20) : 20);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (mosShfaqPaginimin) {
      setItemsPerPage(data.length > 0 ? data.length : 20);
    }
  }, [data.length, mosShfaqPaginimin]);

  const { items, requestSort, sortConfig, currentPage, pageCount, goToPage } =
    useSortableData(
      data,
      perditeso,
      searchQuery,
      itemsPerPage,
      dateField || startDateField,
      startDate,
      endDate
    );

  const headeri = data.length > 0 ? Object.keys(data[0]) : [];

  const filteredHeaders = mosShfaqID
    ? headeri.filter((header) => header !== "ID")
    : headeri;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  const renderCellContent = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "---";
      const date = parseISO(dateStr);
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  const filteredItems = items.filter((item) => {
    if (dateField) {
      const itemDate = item[dateField] ? parseISO(item[dateField]) : null;

      if (startDate && itemDate && itemDate < startDate) return false;
      if (endDate && itemDate && itemDate > endDate) return false;
    } else if (startDateField && endDateField) {
      const itemStartDate = item[startDateField]
        ? parseISO(item[startDateField])
        : null;
      const itemEndDate = item[endDateField]
        ? parseISO(item[endDateField])
        : null;

      if (startDate && itemEndDate && itemEndDate >= endDate) return false;
      if (endDate && itemStartDate && itemStartDate <= startDate) return false;
    }

    return true;
  });


  return (
    <div className="tabela-premium-wrapper p-3">
      <Titulli titulli={tableName} />

      <Card className="premium-main-card">
        <Card.Body className="p-4">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            {!mosShfaqTitullin && (
              <div>
                <h4 className="premium-table-title mb-1">{tableName}</h4>
                <p className="text-muted small mb-0">Menaxhoni të dhënat tuaja me saktësi dhe shpejtësi.</p>
              </div>
            )}

            <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
              {funksionButonShto && (
                <Button
                  variant="primary"
                  className="btn-premium-shto"
                  onClick={() => funksionButonShto()}>
                  <Plus size={18} className="me-2" />
                  Shto të Re
                </Button>
              )}

              {shfaqEksporto !== false && data.length > 0 && (
                <EksportoTeDhenat
                  teDhenatJSON={data}
                  emriDokumentit={tableName}
                />
              )}

              {funksionBartjaArtikullit && (
                <Button
                  variant="outline-primary"
                  className="btn-premium-outline"
                  onClick={() => funksionBartjaArtikullit()}>
                  <ArrowRightLeft size={16} className="me-2" /> Bartja
                </Button>
              )}

              {funksionImportoNgaPranimiMallit && (
                <Button
                  variant="warning"
                  className="btn-premium-outline"
                  style={{ color: '#fff', borderColor: '#eab308', background: 'rgba(234, 179, 8, 0.1)' }}
                  onClick={() => funksionImportoNgaPranimiMallit()}>
                  <Download size={16} className="me-2" /> Importo nga Pranimi i Mallit
                </Button>
              )}

              {funksionNdryshoStatusinEFatures && (
                <Button
                  variant="outline-primary"
                  className="btn-premium-outline"
                  onClick={() => funksionNdryshoStatusinEFatures()}>
                  <RefreshCcw size={16} className="me-2" /> Statusi
                </Button>
              )}
              {butoniShtypZbritjet && (
                <SalesLabel products={products} storeName={storeName} />
              )}
            </div>
          </div>

          {/* Filters Bar */}
          {!mosShfaqKerkimin && (
            <div className="premium-filter-bar mb-4">
              <Row className="g-3 align-items-end">
                <Col md={3} lg={3}>
                  <Form.Label className="premium-filter-label">
                    <Search size={14} className="me-1" /> Kërko
                  </Form.Label>
                  <InputGroup className="premium-input-group">
                    <Form.Control
                      type="text"
                      placeholder="Filtroni të dhënat..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Col>

                <Col md={4} lg={4}>
                  <Form.Label className="premium-filter-label">
                    <Filter size={14} className="me-1" /> Filtrimi sipas Datës
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <CustomDatePicker
                      selectedDate={startDate}
                      onDateChange={setStartDate}
                      placeholderText="Nga Data"
                      maxDate={endDate}
                    />
                    <CustomDatePicker
                      selectedDate={endDate}
                      onDateChange={setEndDate}
                      minDate={startDate}
                      placeholderText="Deri Data"
                    />
                  </div>
                </Col>

                <Col md={2} lg={2}>
                  <Form.Label className="premium-filter-label">Rreshta</Form.Label>
                  <Form.Select
                    value={itemsPerPage}
                    onChange={(e) => {
                      handleItemsPerPageChange(parseInt(e.target.value));
                      goToPage(0);
                    }}
                    className="premium-select">
                    <option value={20}>20 Rreshta</option>
                    <option value={50}>50 Rreshta</option>
                    <option value={100}>100 Rreshta</option>
                  </Form.Select>
                </Col>

                <Col md="auto">
                  <Button
                    variant="light"
                    className="btn-premium-pastro"
                    onClick={() => {
                      setSearchQuery("");
                      requestSort(null);
                      goToPage(0);
                      setStartDate(null);
                      setEndDate(null);
                    }}>
                    <Eraser size={16} className="me-2" /> Pastro Filtrat
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {/* Data Table */}
          <div className="premium-table-scroll-wrap">
            <div className={`premium-table-container ${data.length > 0 ? '' : 'd-none'}`}>
            <MDBTable hover align="middle" className="mb-0 overflow-hidden">
              <MDBTableHead>
                <tr>
                  {filteredHeaders.map((header) => (
                    <th
                      key={header}
                      onClick={() => requestSort(header)}
                      className="premium-th"
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{header}</span>
                        <span className="th-sort-icon">
                          {sortConfig.key === header ? (
                            <SortIcon direction={sortConfig.direction} type="text" />
                          ) : (
                            <SortIcon />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                  {kaButona && <th className="premium-th text-center">Veprime</th>}
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {filteredItems.map((item) => {
                  const isClosed = item["Statusi Kalkulimit"] === "I Mbyllur";
                  const canEdit = !isClosed && (funksionButonEdit || funksionEditoFaturen);
                  
                  return (
                  <tr 
                    key={item.ID} 
                    className={`premium-tr ${canEdit ? 'clickable-row' : ''}`}
                    onClick={(e) => {
                      if (e.target.closest('.btn-action')) return;
                      if (!canEdit) return;
                      if (funksionButonEdit) funksionButonEdit(item.ID);
                      else if (funksionEditoFaturen) funksionEditoFaturen(item.ID);
                    }}
                  >
                    {filteredHeaders.map((header) => (
                      <td key={`${item.ID}-${header}`} className="premium-td">
                        {header === dateField ||
                          header === startDateField ||
                          header === endDateField
                          ? <span className="date-badge">{formatDate(item[header])}</span>
                          : renderCellContent(item[header])}
                      </td>
                    ))}
                    {kaButona && (
                      <td className="text-center premium-td">
                        <div className="d-flex justify-content-center gap-2">
                          {funksionShfaqFature && (
                            <button className="btn-action info" onClick={() => funksionShfaqFature(item.ID)} title="Detajet">
                              <Info size={16} />
                            </button>
                          )}
                          {funksionEditoFaturen && (
                            <button
                              className="btn-action edit"
                              disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                              onClick={() => funksionEditoFaturen(item.ID)}
                              title="Edito Detajet e Faturës"
                              style={{ color: "#3b82f6" }}
                            >
                              <FileText size={16} />
                            </button>
                          )}
                          {funksionButonEdit && (
                            <button
                              className="btn-action edit"
                              disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                              onClick={() => funksionButonEdit(item.ID)}
                              title="Ndrysho Produktet"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          {funksioniEditoStokunQmimin && (
                            <button
                              className="btn-action price"
                              disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                              onClick={() => funksioniEditoStokunQmimin(item.ID, item)}
                              title="Cmimet"
                            >
                              <Banknote size={16} />
                            </button>
                          )}
                          {funksionButonFshij && (
                            <button
                              className="btn-action delete"
                              disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                              onClick={() => funksionButonFshij(item.ID)}
                              title="Fshij"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {funksionFaturoOferten && (
                            <button
                              className="btn-action price"
                              disabled={item["Statusi Kalkulimit"] === "I Mbyllur" || item["Eshte Faturuar"] === "Po" || item["Eshte Faturuar"] === "PO" || item["Eshte Faturuar"] === true}
                              onClick={() => funksionFaturoOferten(item.ID)}
                              title="Faturo Ofertën"
                            >
                              <FileCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </MDBTableBody>
            </MDBTable>
            </div>{/* end premium-table-container */}
            <div className="premium-scroll-hint">
              ← Rrëshqit për të parë më shumë →
            </div>
          </div>{/* end premium-table-scroll-wrap */}

          {/* Empty State */}
          {data.length === 0 && (
            <div className="premium-empty-state">
              <div className="empty-icon-wrapper">
                <Search size={48} />
              </div>
              <h5>Nuk u gjet asnjë të dhënë</h5>
              <p>Provoni të ndryshoni filtrat ose të shtoni të dhëna të reja.</p>
            </div>
          )}

          {/* Pagination */}
          {data.length > 0 && !mosShfaqPaginimin && (
            <div className="premium-pagination-wrapper mt-4">
              <div className="pagination-info">
                Duke shfaqur <strong>{currentPage * itemsPerPage + 1}</strong> deri <strong>{Math.min((currentPage + 1) * itemsPerPage, filteredItems.length)}</strong> nga {items.length} rezultate
              </div>
              {pageCount > 1 && (
                <Pagination className="premium-pagination">
                  <Pagination.First onClick={() => goToPage(0)} disabled={currentPage === 0}>
                    <ChevronsLeft size={16} />
                  </Pagination.First>
                  <Pagination.Prev onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
                    <ChevronLeft size={16} />
                  </Pagination.Prev>

                  {Array.from({ length: pageCount }, (_, i) => i).reduce(
                    (elements, pageNum) => {
                      const isCurrentPage = pageNum === currentPage;
                      if (pageNum === 0 || pageNum === pageCount - 1 || Math.abs(pageNum - currentPage) <= 1) {
                        elements.push(
                          <Pagination.Item key={pageNum} active={isCurrentPage} onClick={() => goToPage(pageNum)}>
                            {pageNum + 1}
                          </Pagination.Item>
                        );
                      } else if (elements.length > 0 && elements[elements.length - 1].type !== Pagination.Ellipsis) {
                        elements.push(<Pagination.Ellipsis key={`el-${pageNum}`} disabled />);
                      }
                      return elements;
                    },
                    []
                  )}

                  <Pagination.Next onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount - 1}>
                    <ChevronRight size={16} />
                  </Pagination.Next>
                  <Pagination.Last onClick={() => goToPage(pageCount - 1)} disabled={currentPage === pageCount - 1}>
                    <ChevronsRight size={16} />
                  </Pagination.Last>
                </Pagination>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .premium-main-card {
          border-radius: 24px;
          border: 1px solid var(--sp-border) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          background: var(--sp-surface) !important;
          /* Override Bootstrap card overflow:hidden — needed for horizontal table scroll */
          overflow: visible !important;
        }
        .premium-main-card > .card-body {
          overflow: visible !important;
        }
        .premium-table-title {
          font-weight: 900;
          color: var(--sp-text);
          letter-spacing: -0.02em;
        }
        .btn-premium-shto {
          background: linear-gradient(135deg, var(--sp-emerald) 0%, #059669 100%) !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 800 !important;
          padding: 0.6rem 1.5rem !important;
          box-shadow: 0 8px 15px var(--sp-emerald-glow) !important;
          transition: all 0.2s ease !important;
        }
        .btn-premium-shto:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .btn-premium-outline {
          border: 1px solid var(--sp-border) !important;
          color: var(--sp-text-soft) !important;
          background: var(--sp-surface-2) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 0.6rem 1.25rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-premium-outline:hover {
          border-color: var(--sp-emerald) !important;
          color: var(--sp-emerald) !important;
          background: var(--sp-surface-3) !important;
        }
        .premium-filter-bar {
          background: var(--sp-surface-2);
          padding: 1.5rem;
          border-radius: 18px;
          border: 1px solid var(--sp-border);
        }
        .premium-filter-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--sp-text-muted);
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        .premium-input-group .form-control, .premium-select {
          background: var(--sp-surface-3) !important;
          color: var(--sp-text) !important;
          border-radius: 10px !important;
          border: 1px solid var(--sp-border) !important;
          font-weight: 600;
          padding: 0.6rem 1rem !important;
        }
        .premium-input-group .form-control::placeholder, 
        .premium-select::placeholder {
          color: var(--sp-text-muted) !important;
          opacity: 0.8 !important;
        }
        .premium-input-group .form-control:focus, .premium-select:focus {
          border-color: var(--sp-emerald) !important;
          box-shadow: 0 0 0 4px var(--sp-emerald-glow) !important;
        }
        .btn-premium-pastro {
          background: var(--sp-surface-3) !important;
          border: 1px solid var(--sp-border) !important;
          border-radius: 10px !important;
          font-weight: 800 !important;
          color: var(--sp-text-muted) !important;
          padding: 0.6rem 1.25rem !important;
          transition: all 0.2s ease;
        }
        .btn-premium-pastro:hover {
          color: var(--sp-red) !important;
          border-color: var(--sp-red) !important;
        }
        .premium-table-container {
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          overflow-x: auto;
          overflow-y: visible;
          background: var(--sp-surface);
          /* Force scrollbar always visible (not just on hover) */
          overflow-x: scroll;
          /* Smooth momentum scroll on iOS */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: var(--sp-text-muted) var(--sp-surface-3);
        }
        /* Webkit scrollbar for Chrome/Safari */
        .premium-table-container::-webkit-scrollbar {
          height: 8px;
        }
        .premium-table-container::-webkit-scrollbar-track {
          background: var(--sp-surface-3);
          border-radius: 0 0 16px 16px;
        }
        .premium-table-container::-webkit-scrollbar-thumb {
          background: var(--sp-text-muted);
          border-radius: 10px;
          border: 2px solid var(--sp-surface-3);
        }
        .premium-table-container::-webkit-scrollbar-thumb:hover {
          background: var(--sp-text-soft);
        }
        /* Right-fade gradient — visible hint that content overflows */
        .premium-table-scroll-wrap {
          position: relative;
        }
        .premium-table-scroll-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 48px;
          height: calc(100% - 8px);
          background: linear-gradient(to right, transparent, var(--sp-surface));
          pointer-events: none;
          z-index: 2;
          border-radius: 0 16px 0 0;
        }
        /* Mobile scroll hint text */
        .premium-scroll-hint {
          display: none;
        }
        @media (max-width: 768px) {
          .premium-scroll-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            color: var(--sp-text-muted);
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.4rem 0;
            letter-spacing: 0.05em;
          }
        }
        .premium-th, .premium-td {
          white-space: nowrap !important;
        }
        /* CRITICAL: prevent any global mobile CSS from changing table to display:block
           inside our scroll container. The parent premium-table-container handles scroll. */
        @media (max-width: 768px) {
          .premium-table-container table {
            display: table !important;
            overflow-x: visible !important;
            width: auto !important;
          }
        }
        .premium-td {
          padding: 1.1rem 1.25rem !important;
          font-size: 0.88rem !important;
          font-weight: 500 !important;
          color: var(--sp-text) !important;
          border-top: 1px solid var(--sp-border) !important;
          background: var(--sp-surface) !important;
          opacity: 1 !important;
        }
        .premium-tr:hover .premium-td {
          background: var(--sp-surface-2) !important;
        }
        .clickable-row {
          cursor: pointer !important;
        }
        .date-badge {
          background: var(--sp-surface-3);
          color: var(--sp-emerald);
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid var(--sp-border);
        }
        .btn-action {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: var(--sp-surface-3);
        }
        .btn-action.info { color: var(--sp-cyan); }
        .btn-action.edit { color: #f59e0b; }
        .btn-action.price { color: var(--sp-emerald); }
        .btn-action.delete { color: var(--sp-red); }
        .btn-action:hover:not(:disabled) { 
          transform: translateY(-2px); 
          background: var(--sp-surface-2);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .btn-action:disabled { opacity: 0.2; cursor: not-allowed; }
        .premium-empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--sp-surface-2);
          border-radius: 20px;
          color: var(--sp-text-muted);
        }
        .empty-icon-wrapper {
          color: var(--sp-surface-3);
          margin-bottom: 1.5rem;
        }
        .premium-pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          color: var(--sp-text-muted);
          font-size: 0.85rem;
        }
        .premium-pagination .page-item .page-link {
          background: var(--sp-surface-2) !important;
          border: 1px solid var(--sp-border) !important;
          border-radius: 10px !important;
          margin: 0 4px;
          font-weight: 800;
          color: var(--sp-text-muted) !important;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .premium-pagination .page-item.active .page-link {
          background: var(--sp-emerald) !important;
          color: white !important;
          border-color: var(--sp-emerald) !important;
          box-shadow: 0 5px 15px var(--sp-emerald-glow);
        }
        .premium-pagination .page-item .page-link:hover:not(.active) {
          background: var(--sp-surface-3) !important;
          color: var(--sp-text) !important;
          border-color: var(--sp-emerald) !important;
        }
      `}</style>
    </div>
  );
}

export default Tabela;

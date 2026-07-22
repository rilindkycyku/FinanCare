import { useState } from "react";
import { Button, Col, Form, InputGroup, Pagination, Row, Card } from "react-bootstrap";
import { Plus, Search, Filter, Eraser, Edit3, Trash2, Eye, Lock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import EksportoTeDhenat from "./EksportoTeDhenat";
import SortIcon from "./SortIcon";
import useSortableData from "../../Context/useSortableData";

function formatDate(dateStr) {
  try {
    if (!dateStr) return "---";
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
}

/** Ported from FinanCare's Tabela.jsx (search + sort + optional date range + pagination +
 * Excel export + row actions), trimmed to the subset FinanCareLite's list pages need: no stock/
 * pricing/status-workflow actions, and a plain date-range input instead of CustomDatePicker to
 * avoid pulling in react-datepicker for a "Lite" app. `data` is an array of display-row objects
 * — plain objects whose keys are the column headers shown, each with an `ID` field used for row
 * keys and the action callbacks. */
function Tabela({
  data,
  tableName,
  kaButona,
  funksionButonShto,
  funksionShfaqFature,
  funksionButonEdit,
  funksionButonFshij,
  funksionNdryshoStatusin,
  funksionEshteEditimDisabled,
  dateField,
  mosShfaqID,
  mosShfaqKerkimin,
  mosShfaqTitullin,
  mosShfaqPaginimin,
  shfaqEksporto,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(mosShfaqPaginimin ? Math.max(data.length, 20) : 20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { items, requestSort, sortConfig, currentPage, pageCount, goToPage } = useSortableData(
    data,
    null,
    searchQuery,
    mosShfaqPaginimin ? Math.max(data.length, 20) : itemsPerPage,
    dateField,
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );

  const headeri = data.length > 0 ? Object.keys(data[0]) : [];
  const filteredHeaders = mosShfaqID ? headeri.filter((header) => header !== "ID") : headeri;

  const renderCellContent = (content) => <div dangerouslySetInnerHTML={{ __html: content ?? "" }} />;

  return (
    <div className="tabela-premium-wrapper p-2">
      <Card className="premium-main-card">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            {!mosShfaqTitullin && (
              <div>
                <h4 className="premium-table-title mb-1">{tableName}</h4>
                <p className="text-muted small mb-0">Menaxhoni të dhënat tuaja me saktësi dhe shpejtësi.</p>
              </div>
            )}

            <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
              {funksionButonShto && (
                <Button variant="primary" className="btn-premium-shto" onClick={() => funksionButonShto()}>
                  <Plus size={18} className="me-2" />
                  Shto të Re
                </Button>
              )}

              {shfaqEksporto !== false && data.length > 0 && <EksportoTeDhenat teDhenatJSON={data} emriDokumentit={tableName} />}
            </div>
          </div>

          {!mosShfaqKerkimin && (
            <div className="premium-filter-bar mb-3">
              <Row className="g-2 align-items-end">
                <Col md={3} lg={3}>
                  <Form.Label className="premium-filter-label">
                    <Search size={14} className="me-1" /> Kërko
                  </Form.Label>
                  <InputGroup className="premium-input-group">
                    <Form.Control type="text" placeholder="Filtroni të dhënat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </InputGroup>
                </Col>

                {dateField && (
                  <Col md={4} lg={4}>
                    <Form.Label className="premium-filter-label">
                      <Filter size={14} className="me-1" /> Filtrimi sipas Datës
                    </Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control className="premium-select" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <Form.Control className="premium-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </Col>
                )}

                {!mosShfaqPaginimin && (
                  <Col md={2} lg={2}>
                    <Form.Label className="premium-filter-label">Rreshta</Form.Label>
                    <Form.Select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        goToPage(0);
                      }}
                      className="premium-select"
                    >
                      <option value={20}>20 Rreshta</option>
                      <option value={50}>50 Rreshta</option>
                      <option value={100}>100 Rreshta</option>
                    </Form.Select>
                  </Col>
                )}

                <Col md="auto">
                  <Button
                    variant="light"
                    className="btn-premium-pastro"
                    onClick={() => {
                      setSearchQuery("");
                      requestSort(null);
                      goToPage(0);
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    <Eraser size={16} className="me-2" /> Pastro Filtrat
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          <div className="premium-table-scroll-wrap">
            <div className={`premium-table-container ${data.length > 0 ? "" : "d-none"}`}>
              <table className="premium-table mb-0">
                <thead>
                  <tr>
                    {filteredHeaders.map((header) => (
                      <th key={header} onClick={() => requestSort(header)} className="premium-th">
                        <div className="d-flex align-items-center justify-content-between">
                          <span>{header}</span>
                          <span className="th-sort-icon">
                            {sortConfig?.key === header ? <SortIcon direction={sortConfig.direction} type="text" /> : <SortIcon />}
                          </span>
                        </div>
                      </th>
                    ))}
                    {kaButona && <th className="premium-th text-center">Veprime</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.ID} className="premium-tr">
                      {filteredHeaders.map((header) => (
                        <td key={`${item.ID}-${header}`} className="premium-td">
                          {header === dateField ? <span className="date-badge">{formatDate(item[header])}</span> : renderCellContent(item[header])}
                        </td>
                      ))}
                      {kaButona && (
                        <td className="text-center premium-td">
                          <div className="d-flex justify-content-center gap-2">
                            {funksionShfaqFature && (
                              <button type="button" className="btn-action info" onClick={() => funksionShfaqFature(item.ID)} title="Shiko">
                                <Eye size={16} />
                              </button>
                            )}
                            {funksionButonEdit && (
                              <button
                                type="button"
                                className="btn-action edit"
                                onClick={() => funksionButonEdit(item.ID)}
                                disabled={funksionEshteEditimDisabled?.(item.ID)}
                                title={funksionEshteEditimDisabled?.(item.ID) ? "Fatura është e mbyllur" : "Ndrysho"}
                              >
                                <Edit3 size={16} />
                              </button>
                            )}
                            {funksionButonFshij && (
                              <button type="button" className="btn-action delete" onClick={() => funksionButonFshij(item.ID)} title="Fshij">
                                <Trash2 size={16} />
                              </button>
                            )}
                            {funksionNdryshoStatusin && (
                              <button type="button" className="btn-action status" onClick={() => funksionNdryshoStatusin(item.ID)} title="Ndrysho Statusin">
                                <Lock size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="premium-scroll-hint">← Rrëshqit për të parë më shumë →</div>
          </div>

          {data.length === 0 && (
            <div className="premium-empty-state">
              <div className="empty-icon-wrapper">
                <Search size={48} />
              </div>
              <h5>Nuk u gjet asnjë të dhënë</h5>
              <p>Provoni të ndryshoni filtrat ose të shtoni të dhëna të reja.</p>
            </div>
          )}

          {data.length > 0 && !mosShfaqPaginimin && (
            <div className="premium-pagination-wrapper mt-4">
              <div className="pagination-info">
                Duke shfaqur <strong>{currentPage * itemsPerPage + 1}</strong> deri <strong>{Math.min((currentPage + 1) * itemsPerPage, data.length)}</strong> nga {data.length} rezultate
              </div>
              {pageCount > 1 && (
                <Pagination className="premium-pagination">
                  <Pagination.First onClick={() => goToPage(0)} disabled={currentPage === 0}>
                    <ChevronsLeft size={16} />
                  </Pagination.First>
                  <Pagination.Prev onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
                    <ChevronLeft size={16} />
                  </Pagination.Prev>

                  {Array.from({ length: pageCount }, (_, i) => i).reduce((elements, pageNum) => {
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
                  }, [])}

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
          border-radius: 16px;
          border: 1px solid var(--sp-border) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          background: var(--sp-surface) !important;
          overflow: visible !important;
        }
        .premium-main-card > .card-body { overflow: visible !important; }
        .premium-table-title { font-weight: 900; color: var(--sp-text); letter-spacing: -0.02em; font-size: 1.1rem; }
        .btn-premium-shto {
          background: linear-gradient(135deg, var(--sp-emerald) 0%, #059669 100%) !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 800 !important;
          font-size: 0.85rem !important;
          padding: 0.5rem 1.1rem !important;
          box-shadow: 0 8px 15px var(--sp-emerald-glow) !important;
          transition: all 0.2s ease !important;
        }
        .btn-premium-shto:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .btn-premium-outline {
          border: 1px solid var(--sp-border) !important;
          color: var(--sp-text-soft) !important;
          background: var(--sp-surface-2) !important;
          border-radius: 10px !important;
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-premium-outline:hover { border-color: var(--sp-emerald) !important; color: var(--sp-emerald) !important; background: var(--sp-surface-3) !important; }
        .premium-filter-bar { background: var(--sp-surface-2); padding: 1rem; border-radius: 12px; border: 1px solid var(--sp-border); }
        .premium-filter-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--sp-text-muted); margin-bottom: 0.4rem; letter-spacing: 0.05em; }
        .premium-input-group .form-control, .premium-select {
          background: var(--sp-surface-3) !important;
          color: var(--sp-text) !important;
          border-radius: 8px !important;
          border: 1px solid var(--sp-border) !important;
          font-weight: 600;
          font-size: 0.85rem !important;
          padding: 0.45rem 0.75rem !important;
        }
        .premium-input-group .form-control::placeholder, .premium-select::placeholder { color: var(--sp-text-muted) !important; opacity: 0.8 !important; }
        .premium-input-group .form-control:focus, .premium-select:focus { border-color: var(--sp-emerald) !important; box-shadow: 0 0 0 4px var(--sp-emerald-glow) !important; }
        .btn-premium-pastro {
          background: var(--sp-surface-3) !important;
          border: 1px solid var(--sp-border) !important;
          border-radius: 8px !important;
          font-weight: 800 !important;
          font-size: 0.85rem !important;
          color: var(--sp-text-muted) !important;
          padding: 0.45rem 1rem !important;
          transition: all 0.2s ease;
        }
        .btn-premium-pastro:hover { color: var(--sp-red) !important; border-color: var(--sp-red) !important; }
        .premium-table-container {
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          background: var(--sp-surface);
          overflow-x: scroll;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: var(--sp-text-muted) var(--sp-surface-3);
        }
        .premium-table-container::-webkit-scrollbar { height: 8px; }
        .premium-table-container::-webkit-scrollbar-track { background: var(--sp-surface-3); border-radius: 0 0 16px 16px; }
        .premium-table-container::-webkit-scrollbar-thumb { background: var(--sp-text-muted); border-radius: 10px; border: 2px solid var(--sp-surface-3); }
        .premium-table { width: 100%; min-width: 100%; border-collapse: collapse; }
        .premium-table-scroll-wrap { position: relative; }
        .premium-scroll-hint { display: none; }
        @media (max-width: 768px) {
          .premium-scroll-hint { display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: var(--sp-text-muted); font-size: 0.72rem; font-weight: 600; padding: 0.4rem 0; letter-spacing: 0.05em; }
        }
        .premium-th, .premium-td { white-space: nowrap !important; }
        .premium-th {
          padding: 0.75rem 1rem;
          background: var(--sp-surface-2) !important;
          color: var(--sp-text-muted) !important;
          text-transform: uppercase;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          cursor: pointer;
          border: none !important;
          text-align: left;
        }
        .premium-td {
          padding: 0.7rem 1rem !important;
          font-size: 0.8rem !important;
          font-weight: 500 !important;
          color: var(--sp-text) !important;
          border-top: 1px solid var(--sp-border) !important;
          background: var(--sp-surface) !important;
        }
        .premium-tr:hover .premium-td { background: var(--sp-surface-2) !important; }
        .premium-empty-state { text-align: center; padding: 3rem 1.5rem; background: var(--sp-surface-2); border-radius: 16px; color: var(--sp-text-muted); }
        .date-badge { background: var(--sp-surface-3); color: var(--sp-emerald); padding: 0.25rem 0.55rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; border: 1px solid var(--sp-border); }
        .empty-icon-wrapper { color: var(--sp-surface-3); margin-bottom: 1rem; }
        .btn-action {
          width: 28px; height: 28px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; background: var(--sp-surface-3);
        }
        .btn-action.info { color: var(--sp-cyan); }
        .btn-action.edit { color: #f59e0b; }
        .btn-action.delete { color: var(--sp-red); }
        .btn-action.status { color: #f59e0b; }
        .btn-action:hover { transform: translateY(-2px); background: var(--sp-surface-2); box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .btn-action:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
        .premium-pagination-wrapper { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; color: var(--sp-text-muted); font-size: 0.8rem; }
        .premium-pagination .page-item .page-link {
          background: var(--sp-surface-2) !important; border: 1px solid var(--sp-border) !important; border-radius: 8px !important;
          margin: 0 3px; font-weight: 800; color: var(--sp-text-muted) !important;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; font-size: 0.8rem;
        }
        .premium-pagination .page-item.active .page-link { background: var(--sp-emerald) !important; color: white !important; border-color: var(--sp-emerald) !important; box-shadow: 0 5px 15px var(--sp-emerald-glow); }
        .premium-pagination .page-item .page-link:hover:not(.active) { background: var(--sp-surface-3) !important; color: var(--sp-text) !important; border-color: var(--sp-emerald) !important; }
      `}</style>
    </div>
  );
}

export default Tabela;

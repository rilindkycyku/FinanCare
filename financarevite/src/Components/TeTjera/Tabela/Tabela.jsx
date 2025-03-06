import { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
  Table,
} from "react-bootstrap";
import EksportoTeDhenat from "./EksportoTeDhenat";
import SortIcon from "./SortIcon";
import useSortableData from "../../../Context/useSortableData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faBan,
  faFileImport,
  faInfoCircle,
  faMoneyBill,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
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
  funksioniEditoStokunQmimin,
  funksionNdryshoStatusinEFatures,
  funksionFaturoOferten,
  dateField, // Field for single date filtering
  startDateField, // Start date field for range filtering
  endDateField, // End date field for range filtering
  mosShfaqID,
  mosShfaqKerkimin,
  butoniShtypZbritjet,
  storeName,
  products,
  shfaqEksporto,
}) {
  const [perditeso, setPerditeso] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { items, requestSort, sortConfig, currentPage, pageCount, goToPage } =
    useSortableData(
      data,
      perditeso,
      searchQuery,
      itemsPerPage,
      dateField || startDateField, // Choose field based on available props
      startDate,
      endDate
    );

  const headeri = data.length > 0 ? Object.keys(data[0]) : [];

  // Conditionally remove 'ID' from the header array
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

  // Function to format date
  const formatDate = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "dd/MM/yyyy"); // or 'yyyy-MM-dd' for a different format
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  // Filter the items based on date or date range
  const filteredItems = items.filter((item) => {
    if (dateField) {
      // Single date field filtering using the same field for start and end date
      const itemDate = item[dateField] ? parseISO(item[dateField]) : null;

      if (startDate && itemDate && itemDate < startDate) {
        return false; // Item's date is before selected start date
      }
      if (endDate && itemDate && itemDate > endDate) {
        return false; // Item's date is after selected end date
      }
    } else if (startDateField && endDateField) {
      // Date range filtering with different fields for start and end date
      const itemStartDate = item[startDateField]
        ? parseISO(item[startDateField])
        : null;
      const itemEndDate = item[endDateField]
        ? parseISO(item[endDateField])
        : null;

      if (startDate && itemEndDate && itemEndDate >= endDate) {
        return false; // Item ends before selected start date
      }
      if (endDate && itemStartDate && itemStartDate <= startDate) {
        return false; // Item starts after selected end date
      }
    }

    return true;
  });

  useEffect(() => {
    const tabelaDiv = document.querySelector(".tabelaDiv");
    if (tabelaDiv) {
      tabelaDiv.style.zoom = "80%";
    }
  }, []);
  //Rregullimi printo zbritjen
  return (
    <div className="tabelaDiv">
      <Titulli titulli={tableName} />
      {data.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th colSpan={filteredHeaders.length + 1}>
                <h1 style={{ textAlign: "center" }}>{tableName}</h1>
              </th>
            </tr>
            {!mosShfaqKerkimin && (
              <>
                <tr>
                  <th colSpan={filteredHeaders.length + 1}>
                    <Row className="align-items-center">
                      <Col xs="auto" className="pe-0 mx-1">
                        {funksionButonShto && (
                          <Button
                            variant="success"
                            onClick={() => funksionButonShto()}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        )}
                      </Col>
                      <Col xs="auto" className="ps-0 pe-0">
                        {data.length > 0 && (
                          <EksportoTeDhenat
                            teDhenatJSON={data}
                            emriDokumentit={tableName}
                          />
                        )}
                      </Col>
                      {funksionNdryshoStatusinEFatures && (
                        <Col xs="auto" className="pe-0">
                          <Button
                            variant="success"
                            onClick={() => funksionNdryshoStatusinEFatures()}>
                            Ndrysho Statusin e Fatures{" "}
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </Button>
                        </Col>
                      )}
                      {butoniShtypZbritjet && (
                        <Col xs="auto" className="ps-1">
                          <SalesLabel
                            products={products}
                            storeName={storeName}
                          />
                        </Col>
                      )}
                    </Row>
                  </th>
                </tr>

                <tr>
                  <th colSpan={filteredHeaders.length + 1}>
                    <InputGroup style={{ width: "60%" }}>
                      <div className="mx-1">
                        <CustomDatePicker
                          selectedDate={startDate}
                          onDateChange={setStartDate}
                          placeholderText="Data fillimit"
                          maxDate={endDate}
                        />
                        <CustomDatePicker
                          selectedDate={endDate}
                          onDateChange={setEndDate}
                          minDate={startDate}
                          placeholderText="Data përfundimit"
                        />
                      </div>
                      <Form.Select
                        value={itemsPerPage}
                        onChange={(e) => {
                          handleItemsPerPageChange(parseInt(e.target.value));
                          goToPage(0);
                        }}>
                        <option value={20}>20 rreshta per faqe</option>
                        <option value={50}>50 rreshta per faqe</option>
                        <option value={100}>100 rreshta per faqe</option>
                      </Form.Select>
                      <Form.Control
                        type="text"
                        placeholder="Kerkoni"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearchQuery("");
                          requestSort(null);
                          goToPage(0);
                          setStartDate(null);
                          setEndDate(null);
                        }}
                        id="button-addon2">
                        Pastro Filtrat
                      </Button>
                    </InputGroup>
                  </th>
                </tr>
              </>
            )}

            {shfaqEksporto && (
              <>
                <tr>
                  <th colSpan={filteredHeaders.length + 1}>
                    <Row className="align-items-center">
                      <Col xs="auto" className="pe-0 mx-1">
                        {data.length > 0 && (
                          <EksportoTeDhenat
                            teDhenatJSON={data}
                            emriDokumentit={tableName}
                          />
                        )}
                      </Col>
                    </Row>
                  </th>
                </tr>
                <tr>
                  <th colSpan={filteredHeaders.length + 1}>
                  <InputGroup style={{ width: "60%" }}>
                    <Form.Control
                      type="text"
                      placeholder="Kerkoni"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery("");
                        requestSort(null);
                        goToPage(0);
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      id="button-addon2">
                      Pastro Filtrat
                    </Button>
                    </InputGroup>
                  </th>
                </tr>
              </>
            )}

            <tr>
              {filteredHeaders.map((header) => (
                <th key={header} onClick={() => requestSort(header)}>
                  {header}{" "}
                  {sortConfig.key === header ? (
                    <SortIcon direction={sortConfig.direction} type="text" />
                  ) : (
                    <SortIcon />
                  )}
                </th>
              ))}

              {kaButona && <th>Funksione</th>}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.ID}>
                {filteredHeaders.map((header) => (
                  <td key={`${item.ID}-${header}`}>
                    {header === dateField ||
                    header === startDateField ||
                    header === endDateField
                      ? formatDate(item[header]) // Format date fields
                      : renderCellContent(item[header])}
                  </td>
                ))}
                {kaButona && (
                  <td>
                    {funksionShfaqFature && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        style={{ marginRight: "0.5em" }}
                        onClick={() => funksionShfaqFature(item.ID)}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </Button>
                    )}
                    {funksionButonEdit && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                        style={{ marginRight: "0.5em" }}
                        onClick={() => funksionButonEdit(item.ID)}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Button>
                    )}
                    {funksioniEditoStokunQmimin && (
                      <Button
                        variant="outline-info"
                        size="sm"
                        disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                        style={{ marginRight: "0.5em" }}
                        onClick={() =>
                          funksioniEditoStokunQmimin(item.ID, item)
                        }>
                        <FontAwesomeIcon icon={faMoneyBill} />
                      </Button>
                    )}
                    {funksionButonFshij && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={item["Statusi Kalkulimit"] === "I Mbyllur"}
                        style={{ marginRight: "0.5em" }}
                        onClick={() => funksionButonFshij(item.ID)}>
                        <FontAwesomeIcon icon={faBan} />
                      </Button>
                    )}
                    {funksionFaturoOferten && (
                      <Button
                        variant="outline-primary"
                        disabled={
                          item["Statusi Kalkulimit"] === "I Hapur" ||
                          item["Eshte Faturuar"] === "Po"
                        }
                        size="sm"
                        style={{ marginRight: "0.5em" }}
                        onClick={() => funksionFaturoOferten(item.ID)}>
                        <FontAwesomeIcon icon={faFileImport} />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th colSpan={filteredHeaders.length + 1}>
                <h1 style={{ textAlign: "center" }}>{tableName}</h1>
              </th>
            </tr>
            <tr>
              <th colSpan={filteredHeaders.length + 1}>
                <Row className="align-items-center">
                  <Col xs="auto" className="pe-0 mx-1">
                    {funksionButonShto && (
                      <Button
                        variant="success"
                        onClick={() => funksionButonShto()}>
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                    )}
                  </Col>
                </Row>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nuk ka te dhena</td>
            </tr>
          </tbody>
        </Table>
      )}

      {pageCount > 1 && (
        <Pagination className="justify-content-center">
          {Array.from({ length: pageCount }, (_, i) => (
            <Pagination.Item
              key={i}
              active={i === currentPage}
              onClick={() => goToPage(i)}>
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
}

export default Tabela;

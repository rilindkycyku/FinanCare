import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Form } from 'react-bootstrap';
import exportFromJSON from 'export-from-json';
import { faCss3Alt, faHtml5 } from '@fortawesome/free-brands-svg-icons';
import { faFileCode, faFileExcel } from '@fortawesome/free-regular-svg-icons';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';

function EksportoTeDhenat(props) {
  const [eksportoTeDhenat, setEksportoTeDhenat] = useState(false);
  const [eksportoTeDhenatKonfirmo, setEksportoTeDhenatKonfirmo] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  const handleExport = (llojiDokumentit) => {
    let format;
    switch (llojiDokumentit) {
      case 'css':
        format = exportFromJSON.types.css;
        break;
      case 'csv':
        format = exportFromJSON.types.csv;
        break;
      case 'html':
        format = exportFromJSON.types.html;
        break;
      case 'json':
        format = exportFromJSON.types.json;
        break;
      case 'txt':
        format = exportFromJSON.types.txt;
        break;
      case 'xls':
        format = exportFromJSON.types.xls;
        break;
      case 'xml':
        format = exportFromJSON.types.xml;
        break;
      default:
        console.error('Invalid export type');
        return;
    }

    exportFromJSON({ data: handleExportSelection(), fileName: props.emriDokumentit, exportType: format });
  };

  const handleCheckboxChange = (header) => {
    if (selectedHeaders.includes(header)) {
      setSelectedHeaders(selectedHeaders.filter((item) => item !== header));
    } else {
      setSelectedHeaders([...selectedHeaders, header]);
    }
  };

  function handleExportSelection() {
    const newData = props.teDhenatJSON.map((item) => {
      const newItem = {};
      selectedHeaders.forEach((header) => {
        newItem[header] = item[header];
      });
      return newItem;
    });

    return newData;
  }

  return (
    <div>
      {eksportoTeDhenatKonfirmo && (
        <Modal show={eksportoTeDhenatKonfirmo}>
          <Modal.Header>
            <Modal.Title>Eksporto te dhenat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('css')}>
              CSS <FontAwesomeIcon icon={faCss3Alt} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('csv')}>
              CSV <FontAwesomeIcon icon={faFileCsv} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('html')}>
              HTML <FontAwesomeIcon icon={faHtml5} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('json')}>
              JSON <FontAwesomeIcon icon={faFileCode} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('txt')}>
              TXT <FontAwesomeIcon icon={faFileCode} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('xls')}>
              EXCEL <FontAwesomeIcon icon={faFileExcel} />
            </Button>
            <Button style={{ marginRight: '0.5em' }} variant="success" onClick={() => handleExport('xml')}>
              XML <FontAwesomeIcon icon={faFileCode} />
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setEksportoTeDhenatKonfirmo(false)} variant={'outline-success'}>
              Mbylle
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Button variant="success" onClick={() => setEksportoTeDhenat(true)}>
        Eksporto te Dhenat
      </Button>

      <Modal show={eksportoTeDhenat} onHide={() => setEksportoTeDhenat(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Zgjidhni kolonat për eksport</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(props.teDhenatJSON[0]).map((header, index) => (
            <Form.Check
              key={index}
              type="checkbox"
              label={header}
              checked={selectedHeaders.includes(header)}
              onChange={() => handleCheckboxChange(header)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEksportoTeDhenat(false)}>
            Mbylle
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEksportoTeDhenatKonfirmo(true);
              setEksportoTeDhenat(false);
            }}
          >
            Eksporto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EksportoTeDhenat;

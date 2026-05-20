import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function Mesazhi(props) {
  const handleMesazhiMbyll = () => {
    localStorage.setItem("shfaqMesazhinPasRef", false);
    props.setShfaqMesazhin(false);
  };

  const isSuccess = props.tipi === "success";

  return (
    <>
      <style>{`
        .custom-mesazhi-modal .modal-content {
          background: #111d2e !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 16px !important;
          color: #f1f5f9 !important;
          box-shadow: 0 24px 48px rgba(0,0,0,0.6) !important;
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
      <Modal 
        show={true} 
        onHide={handleMesazhiMbyll} 
        centered 
        className="custom-mesazhi-modal"
      >
        <Modal.Body className="p-4">
          <div className="d-flex flex-column align-items-center text-center">
            <div 
              className="mb-3 rounded-circle d-flex align-items-center justify-content-center" 
              style={{ 
                width: '72px', 
                height: '72px',
                backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                color: isSuccess ? '#10b981' : '#f87171'
              }}
            >
              {isSuccess ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
            </div>
            <h5 
              className="fw-bold mb-2" 
              style={{ color: isSuccess ? '#10b981' : '#f87171' }}
            >
              {isSuccess ? "Me Sukses!" : "Ndodhi një gabim!"}
            </h5>
            <p 
              className="mb-4 lh-base" 
              style={{ fontSize: '0.95rem', color: '#94a3b8' }}
              dangerouslySetInnerHTML={{ __html: props.pershkrimi }}
            ></p>
            <Button 
              variant={isSuccess ? "success" : "danger"} 
              className="w-100 fw-bold py-2" 
              style={{ 
                borderRadius: '10px',
                backgroundColor: isSuccess ? '#10b981' : '#ef4444',
                borderColor: isSuccess ? '#10b981' : '#ef4444'
              }}
              onClick={handleMesazhiMbyll}
            >
              Kuptova
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Mesazhi;

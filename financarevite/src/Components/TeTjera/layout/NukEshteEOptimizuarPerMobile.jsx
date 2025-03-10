import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const NukEshteEOptimizuarPerMobile = ({ title, message, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  // Check if the device is mobile on load
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile); // Check on window resize

    return () => {
      window.removeEventListener('resize', checkMobile); // Cleanup the listener
    };
  }, []);

  // Modal visibility handler
  const handleClose = () => {
    setIsMobile(false);
    if (onClose) {
      onClose(); // Call the callback passed via props when modal is closed
    }
    navigate('/'); // Navigate to the homepage ("/")
  };

  if (!isMobile) return null; // Don't render the modal if not mobile

  return (
    <div
      className="modal fade show"
      id="mobileModal"
      tabIndex="-1"
      aria-labelledby="mobileModalLabel"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="mobileModalLabel">
              {title || 'Udhëzim'} {/* Default title */}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            {message || 'Kjo faqe (POS) nuk është e optimizuar që të përdoret në pajisjet mobile. Ju lutemi, përdorni një kompjuter për të vazhduar.'} {/* Default message */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={handleClose}
            >
              Mbyll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NukEshteEOptimizuarPerMobile;

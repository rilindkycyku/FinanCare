import { useRegisterSW } from "virtual:pwa-register/react";
import { Toast, ToastContainer, Button } from "react-bootstrap";
import { CloudOff, RefreshCw } from "lucide-react";

/** Registers the service worker and surfaces the two moments worth telling the business about:
 * the app being ready to work with no connection, and a new version waiting.
 *
 * The update is offered, never applied on its own — reloading the page mid-invoice to install a
 * background update is a good way to lose someone's typing. Everything already saved is safe
 * either way (it lives in IndexedDB, not in the page), but the half-filled form on screen isn't. */
function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  return (
    <ToastContainer position="bottom-center" className="mb-4" style={{ zIndex: 1080 }}>
      {needRefresh ? (
        <Toast onClose={() => setNeedRefresh(false)}>
          <Toast.Body className="d-flex align-items-center gap-3">
            <RefreshCw size={18} className="text-primary flex-shrink-0" />
            <span className="me-auto">Ka një version të ri të FinanCareLite.</span>
            <Button size="sm" className="btn-primary" onClick={() => updateServiceWorker(true)}>
              Përditëso
            </Button>
          </Toast.Body>
        </Toast>
      ) : (
        <Toast onClose={() => setOfflineReady(false)} delay={5000} autohide>
          <Toast.Body className="d-flex align-items-center gap-3">
            <CloudOff size={18} className="text-success flex-shrink-0" />
            <span>FinanCareLite është gati të punojë edhe pa internet.</span>
          </Toast.Body>
        </Toast>
      )}
    </ToastContainer>
  );
}

export default PwaUpdater;

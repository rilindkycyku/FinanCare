// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));

const disableF5Refresh = (event) => {
  if (event.key === 'F5') {
    event.preventDefault(); // Prevent browser refresh
    event.stopPropagation(); // Stop event from bubbling up
    // Optionally log or handle F5 press if needed
    console.log('F5 key pressed, page refresh prevented.');
  }
};

document.addEventListener('keydown', disableF5Refresh);

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

window.addEventListener('unload', () => {
  document.removeEventListener('keydown', disableF5Refresh);
});
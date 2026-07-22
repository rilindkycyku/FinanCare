import { useState } from "react";
import { Tabs, Tab, Card } from "react-bootstrap";
import { Settings } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import KursetEKembimit from "../Components/Settings/KursetEKembimit";
import LlojetETVSH from "../Components/Settings/LlojetETVSH";
import NjesiteMatese from "../Components/Settings/NjesiteMatese";
import LlojetEDokumentit from "../Components/Settings/LlojetEDokumentit";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";
import "./Styles/Dashboard.css";

function Cilesimet() {
  const [key, setKey] = useState("kurset");

  return (
    <>
      <PageTitle title="Cilësimet" />
      <NavBar />

      <div className="containerDashboardP">
        <h4 className="section-title">
          <Settings size={24} className="text-primary" />
          Cilësimet
        </h4>
        <p className="text-muted mb-4">
          Vlerat që përdoren nëpër produkte dhe fatura — kurset e këmbimit, llojet e TVSH-së dhe njësitë matëse.
        </p>

        <Card className="profile-card border-0 p-4">
          <Tabs id="cilesimet-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="modern-tabs border-0">
            <Tab eventKey="kurset" title="Kurset e Këmbimit">
              <KursetEKembimit embedded />
            </Tab>
            <Tab eventKey="tvsh" title="Llojet e TVSH">
              <LlojetETVSH embedded />
            </Tab>
            <Tab eventKey="njesite" title="Njësitë Matëse">
              <NjesiteMatese embedded />
            </Tab>
            <Tab eventKey="dokumentet" title="Llojet e Faturave">
              <LlojetEDokumentit embedded />
            </Tab>
          </Tabs>
        </Card>
      </div>

      <Footer />
    </>
  );
}

export default Cilesimet;

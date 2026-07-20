import { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import KursetEKembimit from "../Components/Settings/KursetEKembimit";
import LlojetETVSH from "../Components/Settings/LlojetETVSH";
import NjesiteMatese from "../Components/Settings/NjesiteMatese";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function Cilesimet() {
  const [key, setKey] = useState("kurset");

  return (
    <>
      <PageTitle title="Cilësimet" />
      <NavBar />

      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Cilësimet</h1>
        <p className="text-muted mb-4">
          Vlerat që përdoren nëpër produkte dhe fatura — kurset e këmbimit, llojet e TVSH-së dhe njësitë matëse.
        </p>

        <Tabs id="cilesimet-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="sp-tabs">
          <Tab eventKey="kurset" title="Kurset e Këmbimit">
            <KursetEKembimit embedded />
          </Tab>
          <Tab eventKey="tvsh" title="Llojet e TVSH">
            <LlojetETVSH embedded />
          </Tab>
          <Tab eventKey="njesite" title="Njësitë Matëse">
            <NjesiteMatese embedded />
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

export default Cilesimet;

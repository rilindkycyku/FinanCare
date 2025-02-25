import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

function Titulli({ titulli }) {
  const [siteName, setSiteName] = useState("FinanCare");

  const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [titulli]);

  return (
    <Helmet>
      <title>
        {titulli} | {siteName}
      </title>
    </Helmet>
  );
}

export default Titulli;

import { useEffect, useMemo, useState } from "react";
﻿import { Helmet } from "react-helmet-async";
import axios from "axios";

function Titulli({ titulli }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [siteName, setSiteName] = useState("FinanCare");

  const getToken = localStorage.getItem("token");
    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
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

import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DetajeFatura from "./DetajeFatura";
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

function Fatura(props) {
  const [perditeso, setPerditeso] = useState("");
  const [vendosFature, setVendosFature] = useState(false);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [teDhenat, setTeDhenat] = useState([]);

  const [meShumeSe15, setMeShumeSe15] = useState(false);
  const [meShumeSe30, setMeShumeSe30] = useState(false);
  const [meShumeSe45, setMeShumeSe45] = useState(false);
  const [meShumeSe60, setMeShumeSe60] = useState(false);
  const [meShumeSe75, setMeShumeSe75] = useState(false);
  const [meShumeSe90, setMeShumeSe90] = useState(false);

  const [nrFaqeve, setNrFaqeve] = useState(1);

  const [teDhenatFat, setteDhenatFat] = useState("");

  const [kaAkses, setKaAkses] = useState(true);

  let barkodi = "";

  const dataPorosise = new Date(
    teDhenatFat &&
      teDhenatFat.regjistrimet &&
      teDhenatFat.regjistrimet.dataRegjistrimit
  );
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);

  barkodi = `${
    teDhenatBiznesit && teDhenatBiznesit.shkurtesaEmritBiznesit
  }-${dita}${muaji}${viti}-${
    teDhenatFat &&
    teDhenatFat.regjistrimet &&
    teDhenatFat.regjistrimet.llojiKalkulimit
  }-${
    teDhenatFat &&
    teDhenatFat.regjistrimet &&
    teDhenatFat.regjistrimet.nrRendorFatures
  }`;

  if (
    teDhenatFat &&
    teDhenatFat.regjistrimet &&
    teDhenatFat.regjistrimet.llojiKalkulimit &&
    teDhenatFat.regjistrimet.llojiKalkulimit == "PARAGON"
  ) {
    barkodi =
      teDhenatFat &&
      teDhenatFat.regjistrimet &&
      teDhenatFat.regjistrimet.nrFatures;
  }

  const getID = localStorage.getItem("id");

  const navigate = useNavigate();

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    if (getID) {
      const vendosFature = async () => {
        try {
          const produktet = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.nrFatures}`,
            authentikimi
          );
          const teDhenat = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.nrFatures}`,
            authentikimi
          );

          console.log(teDhenat.data);
          console.log(produktet.data);
          setteDhenatFat(teDhenat.data);

          if (produktet.data.length >= 15) {
            setMeShumeSe15(true);
            setNrFaqeve(2);
          }

          if (produktet.data.length >= 40) {
            setMeShumeSe30(true);
            setNrFaqeve(3);
          }

          if (produktet.data.length >= 65) {
            setMeShumeSe45(true);
            setNrFaqeve(4);
          }

          if (produktet.data.length >= 90) {
            setMeShumeSe60(true);
            setNrFaqeve(5);
          }
          if (produktet.data.length >= 115) {
            setMeShumeSe75(true);
            setNrFaqeve(6);
          }
          if (produktet.data.length >= 140) {
            setMeShumeSe90(true);
            setNrFaqeve(7);
          }

          setVendosFature(true);
        } catch (err) {
          console.log(err);
        }
      };

      vendosFature();
    } else {
      navigate("/login");
    }
  }, [perditeso]);

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [getID]);

  useEffect(() => {
    if (getID) {
      const vendosTeDhenatUserit = async () => {
        try {
          const teDhenatUser = await axios.get(
            `https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(teDhenatUser.data);
          // Check if at least one of the roles is present
          const roles = ["Faturist", "Menaxher", "Kalkulant"];
          if (!teDhenatUser.data.rolet.some((role) => roles.includes(role))) {
            setKaAkses(false);
          }
          console.log(teDhenatUser.data);
        } catch (err) {
          console.log(err);
        }
      };

      vendosTeDhenatUserit();
    } else {
      navigate("/login");
    }
  }, [getID]);

  useEffect(() => {
    console.log(teDhenat);
    if (teDhenat) {
      if (!kaAkses) {
        navigate("/dashboard");
      } else {
        if (vendosFature === true) {
          // FaturaPerRuajtje();
        }
      }
    }
  }, [vendosFature, teDhenat, kaAkses]); // Ensure to include teDhenat and kaAkses in the dependency array

  function FaturaPerRuajtje() {
    const mePakSe25Ref = document.querySelector(".mePakSe25");
    const meShumeSe15Ref = document.querySelector(".meShumeSe15");
    const meShumeSe30Ref = document.querySelector(".meShumeSe30");
    const meShumeSe45Ref = document.querySelector(".meShumeSe45");
    const meShumeSe60Ref = document.querySelector(".meShumeSe60");
    const meShumeSe75Ref = document.querySelector(".meShumeSe75");
    const meShumeSe90Ref = document.querySelector(".meShumeSe90");

    html2canvas(mePakSe25Ref, { useCORS: true })
      .then((invoiceCanvas) => {
        var contentWidth = invoiceCanvas.width;
        var contentHeight = invoiceCanvas.height;
        var pageHeight = (contentWidth / 592.28) * 841.89;
        var leftHeight = contentHeight;
        var position = 0;
        var imgWidth = 555.28;
        var imgHeight = (imgWidth / contentWidth) * contentHeight;
        var invoicePageData = invoiceCanvas.toDataURL("image/jpeg", 1.0);
        var pdf = new jsPDF("", "pt", "a4");

        if (leftHeight < pageHeight) {
          pdf.addImage(invoicePageData, "JPEG", 20, 0, imgWidth, imgHeight);
        } else {
          while (leftHeight > 0) {
            pdf.addImage(
              invoicePageData,
              "JPEG",
              20,
              position,
              imgWidth,
              imgHeight
            );
            leftHeight -= pageHeight;
            position -= 841.89;
          }
        }

        if (!meShumeSe15) {
          ruajFaturen(pdf);
        }

        if (meShumeSe15) {
          html2canvas(meShumeSe15Ref, { useCORS: true })
            .then((meShumeSe15Canvas) => {
              var meShumeSe15Width = meShumeSe15Canvas.width;
              var meShumeSe15Height = meShumeSe15Canvas.height;
              var meShumeSe15PageHeight = (meShumeSe15Width / 592.28) * 841.89;
              var meShumeSe15LeftHeight = meShumeSe15Height;
              var meShumeSe15Position = 0;
              var meShumeSe15ImgWidth = 555.28;
              var meShumeSe15ImgHeight =
                (meShumeSe15ImgWidth / meShumeSe15Width) * meShumeSe15Height;
              var meShumeSe15PageData = meShumeSe15Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe15LeftHeight < meShumeSe15PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe15PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe15ImgWidth,
                  meShumeSe15ImgHeight
                );
              } else {
                while (meShumeSe15LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe15PageData,
                    "JPEG",
                    20,
                    meShumeSe15Position,
                    meShumeSe15ImgWidth,
                    meShumeSe15ImgHeight
                  );
                  meShumeSe15LeftHeight -= meShumeSe15PageHeight;
                  meShumeSe15Position -= 841.89;
                }
              }

              if (!meShumeSe30) {
                ruajFaturen(pdf);
              }
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
        if (meShumeSe30) {
          html2canvas(meShumeSe30Ref, { useCORS: true })
            .then((meShumeSe30Canvas) => {
              var meShumeSe30Width = meShumeSe30Canvas.width;
              var meShumeSe30Height = meShumeSe30Canvas.height;
              var meShumeSe30PageHeight = (meShumeSe30Width / 592.28) * 841.89;
              var meShumeSe30LeftHeight = meShumeSe30Height;
              var meShumeSe30Position = 0;
              var meShumeSe30ImgWidth = 555.28;
              var meShumeSe30ImgHeight =
                (meShumeSe30ImgWidth / meShumeSe30Width) * meShumeSe30Height;
              var meShumeSe30PageData = meShumeSe30Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe30LeftHeight < meShumeSe30PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe30PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe30ImgWidth,
                  meShumeSe30ImgHeight
                );
              } else {
                while (meShumeSe30LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe30PageData,
                    "JPEG",
                    20,
                    meShumeSe30Position,
                    meShumeSe30ImgWidth,
                    meShumeSe30ImgHeight
                  );
                  meShumeSe30LeftHeight -= meShumeSe30PageHeight;
                  meShumeSe30Position -= 841.89;
                }
              }

              if (!meShumeSe45) {
                ruajFaturen(pdf);
              }
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
        if (meShumeSe45) {
          html2canvas(meShumeSe45Ref, { useCORS: true })
            .then((meShumeSe45Canvas) => {
              var meShumeSe45Width = meShumeSe45Canvas.width;
              var meShumeSe45Height = meShumeSe45Canvas.height;
              var meShumeSe45PageHeight = (meShumeSe45Width / 592.28) * 841.89;
              var meShumeSe45LeftHeight = meShumeSe45Height;
              var meShumeSe45Position = 0;
              var meShumeSe45ImgWidth = 555.28;
              var meShumeSe45ImgHeight =
                (meShumeSe45ImgWidth / meShumeSe45Width) * meShumeSe45Height;
              var meShumeSe45PageData = meShumeSe45Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe45LeftHeight < meShumeSe45PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe45PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe45ImgWidth,
                  meShumeSe45ImgHeight
                );
              } else {
                while (meShumeSe45LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe45PageData,
                    "JPEG",
                    20,
                    meShumeSe45Position,
                    meShumeSe45ImgWidth,
                    meShumeSe45ImgHeight
                  );
                  meShumeSe45LeftHeight -= meShumeSe45PageHeight;
                  meShumeSe45Position -= 841.89;
                }
              }
              if (!meShumeSe60) {
                ruajFaturen(pdf);
              }
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
        if (meShumeSe60) {
          html2canvas(meShumeSe60Ref, { useCORS: true })
            .then((meShumeSe60Canvas) => {
              var meShumeSe60Width = meShumeSe60Canvas.width;
              var meShumeSe60Height = meShumeSe60Canvas.height;
              var meShumeSe60PageHeight = (meShumeSe60Width / 592.28) * 841.89;
              var meShumeSe60LeftHeight = meShumeSe60Height;
              var meShumeSe60Position = 0;
              var meShumeSe60ImgWidth = 555.28;
              var meShumeSe60ImgHeight =
                (meShumeSe60ImgWidth / meShumeSe60Width) * meShumeSe60Height;
              var meShumeSe60PageData = meShumeSe60Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe60LeftHeight < meShumeSe60PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe60PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe60ImgWidth,
                  meShumeSe60ImgHeight
                );
              } else {
                while (meShumeSe60LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe60PageData,
                    "JPEG",
                    20,
                    meShumeSe60Position,
                    meShumeSe60ImgWidth,
                    meShumeSe60ImgHeight
                  );
                  meShumeSe60LeftHeight -= meShumeSe60PageHeight;
                  meShumeSe60Position -= 841.89;
                }
              }
              if (!meShumeSe75) {
                ruajFaturen(pdf);
              }
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
        if (meShumeSe75) {
          html2canvas(meShumeSe75Ref, { useCORS: true })
            .then((meShumeSe75Canvas) => {
              var meShumeSe75Width = meShumeSe75Canvas.width;
              var meShumeSe75Height = meShumeSe75Canvas.height;
              var meShumeSe75PageHeight = (meShumeSe75Width / 592.28) * 841.89;
              var meShumeSe75LeftHeight = meShumeSe75Height;
              var meShumeSe75Position = 0;
              var meShumeSe75ImgWidth = 555.28;
              var meShumeSe75ImgHeight =
                (meShumeSe75ImgWidth / meShumeSe75Width) * meShumeSe75Height;
              var meShumeSe75PageData = meShumeSe75Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe75LeftHeight < meShumeSe75PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe75PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe75ImgWidth,
                  meShumeSe75ImgHeight
                );
              } else {
                while (meShumeSe75LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe75PageData,
                    "JPEG",
                    20,
                    meShumeSe75Position,
                    meShumeSe75ImgWidth,
                    meShumeSe75ImgHeight
                  );
                  meShumeSe75LeftHeight -= meShumeSe75PageHeight;
                  meShumeSe75Position -= 841.89;
                }
              }
              if (!meShumeSe90) {
                ruajFaturen(pdf);
              }
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
        if (meShumeSe90) {
          html2canvas(meShumeSe90Ref, { useCORS: true })
            .then((meShumeSe90Canvas) => {
              var meShumeSe90Width = meShumeSe90Canvas.width;
              var meShumeSe90Height = meShumeSe90Canvas.height;
              var meShumeSe90PageHeight = (meShumeSe90Width / 592.28) * 841.89;
              var meShumeSe90LeftHeight = meShumeSe90Height;
              var meShumeSe90Position = 0;
              var meShumeSe90ImgWidth = 555.28;
              var meShumeSe90ImgHeight =
                (meShumeSe90ImgWidth / meShumeSe90Width) * meShumeSe90Height;
              var meShumeSe90PageData = meShumeSe90Canvas.toDataURL(
                "image/jpeg",
                1.0
              );

              if (meShumeSe90LeftHeight < meShumeSe90PageHeight) {
                pdf.addPage();
                pdf.addImage(
                  meShumeSe90PageData,
                  "JPEG",
                  20,
                  0,
                  meShumeSe90ImgWidth,
                  meShumeSe90ImgHeight
                );
              } else {
                while (meShumeSe90LeftHeight > 0) {
                  pdf.addPage();
                  pdf.addImage(
                    meShumeSe90PageData,
                    "JPEG",
                    20,
                    meShumeSe90Position,
                    meShumeSe90ImgWidth,
                    meShumeSe90ImgHeight
                  );
                  meShumeSe90LeftHeight -= meShumeSe90PageHeight;
                  meShumeSe90Position -= 841.89;
                }
              }
              ruajFaturen(pdf);
            })
            .catch((error) => {
              ruajFaturen(pdf);
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function ruajFaturen(pdf) {
    pdf.save(barkodi + ".pdf");
    props.mbyllFaturen();
  }

  return (
    <>
      <h1 className="title">
        Fatura NR: {barkodi}
        <MDBBtn className="mb-3 Butoni" onClick={() => FaturaPerRuajtje()}>
          Ruaj <FontAwesomeIcon icon={faDownload} />
        </MDBBtn>
        <MDBBtn className="mb-3 Butoni" onClick={() => props.mbyllFaturen()}>
          <FontAwesomeIcon icon={faArrowLeft} /> Mbyll
        </MDBBtn>
      </h1>
      <div className="mePakSe25">
        <DetajeFatura
          nrFatures={props.nrFatures}
          Barkodi={barkodi}
          ProduktiPare={0}
          ProduktiFundit={meShumeSe15 ? 25 : 15}
          LargoFooter={meShumeSe15}
          NrFaqes={1}
          NrFaqeve={nrFaqeve}
        />
      </div>
      {meShumeSe15 && (
        <div className="meShumeSe15">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={25}
            ProduktiFundit={meShumeSe30 ? 50 : 40}
            LargoFooter={meShumeSe30}
            NrFaqes={2}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
      {meShumeSe30 && (
        <div className="meShumeSe30">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={50}
            ProduktiFundit={meShumeSe45 ? 75 : 65}
            LargoFooter={meShumeSe45}
            NrFaqes={3}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
      {meShumeSe45 && (
        <div className="meShumeSe45">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={75}
            ProduktiFundit={meShumeSe45 ? 100 : 90}
            LargoFooter={meShumeSe60}
            NrFaqes={4}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
      {meShumeSe60 && (
        <div className="meShumeSe60">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={100}
            ProduktiFundit={meShumeSe75 ? 125 : 115}
            LargoFooter={meShumeSe75}
            NrFaqes={5}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
      {meShumeSe75 && (
        <div className="meShumeSe75">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={125}
            ProduktiFundit={meShumeSe90 ? 150 : 140}
            LargoFooter={meShumeSe90}
            NrFaqes={6}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
      {meShumeSe90 && (
        <div className="meShumeSe90">
          <DetajeFatura
            nrFatures={props.nrFatures}
            Barkodi={barkodi}
            ProduktiPare={150}
            ProduktiFundit={165}
            NrFaqes={7}
            NrFaqeve={nrFaqeve}
          />
        </div>
      )}
    </>
  );
}

export default Fatura;

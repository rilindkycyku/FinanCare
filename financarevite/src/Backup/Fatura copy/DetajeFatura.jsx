import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";

function DetajeFatura(props) {
  return (
    <>
      <HeaderFatura
        faturaID={props.nrFatures}
        Barkodi={props.Barkodi}
        NrFaqes={props.NrFaqes}
        NrFaqeve={props.NrFaqeve}
      />
      <br />
      <hr
        style={{
          height: "2px",
          borderWidth: "0",
          color: "gray",
          backgroundColor: "black",
        }}
      />
      <TeDhenatFatura
        faturaID={props.nrFatures}
        ProduktiPare={props.ProduktiPare}
        ProduktiFundit={props.ProduktiFundit}
      />
      <hr />
      {!props.LargoFooter && (
        <FooterFatura faturaID={props.nrFatures} Barkodi={props.Barkodi} />
      )}
    </>
  );
}

export default DetajeFatura;

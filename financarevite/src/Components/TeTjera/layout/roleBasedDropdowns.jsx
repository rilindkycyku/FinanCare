// src/roleBasedDropdowns.js
export const roleBasedDropdowns = [
  {
    label: "Materiali",
    items: [
      {
        roles: ["User"],
        label: "Artikujt",
        subItems: [
          {
            roles: ["User"],
            path: "/Produktet",
            label: "Lista e Produkteve",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/NjesiaMatese",
            label: "Njesia Matese",
          },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/GrupetEProduktit",
            label: "Grupet e Produktit",
          },
          {
            roles: ["Menaxher", "Kalkulant", "Faturist"],
            path: "/KartelaEArtikullit",
            label: "Kartela e Artikullit",
          },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/Stoqet",
            label: "Stoqet",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/ZbritjetEProduktit",
            label: "Zbritjet e Produkteve",
          },
        ],
      },
      {
        roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist", "Arkatar"],
        label: "Hyrjet",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/KalkulimiIMallit",
            label: "Kalkulimi i Mallit",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "Kalkulant", "Arkatar"],
            path: "/KthimiMallitTeShitur",
            label: "Kthim i Mallit te Shitur",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/FleteLejimet",
            label: "Flete Lejimet",
          },{
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/FleteLejimetAutomatike",
            label: "Flete Lejimet Automatike",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/KalkulimiFillestarVjetor",
            label: "Kalkulimi Fillestar Vjetor",
          },
        ],
      },
      {
        roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist", "Arkatar"],
        label: "Shitjet",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant", "Faturist"],
            path: "/Porosite",
            label: "Porosite",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/Ofertat",
            label: "Ofertat",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/AsgjesimiIStokut",
            label: "Asgjesimi i Stokut",
          },
          {
            roles: ["Menaxher", "Kalkulant"],
            path: "/KthimIMallitTeBlere",
            label: "Kthimi i Mallit te Blere",
          },
          { isDivider: true },
          {
            roles: ["Menaxher"],
            path: "/Statistika",
            label: "Statistikat e Dyqanit",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher"],
            path: "/ListaShitjeveMeParagon",
            label: "Lista e Shitjeve me Paragon",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Arkatar", "Menaxher"],
            path: "/POS",
            label: "POS",
            shfaqNeDashboard: true,
          },
          { isDivider: true },{
            roles: ["Menaxher"],
            path: "/ListaBarazimeve",
            label: "Lista e Barazimeve",
            shfaqNeDashboard: true,
          },{
            roles: ["Arkatar", "Menaxher"],
            path: "/BarazoArken",
            label: "Barazo Arken",
            shfaqNeDashboard: true,
          },
        ],
      },
    ],
  },
  {
    label: "Gjenerale",
    items: [
      {
        roles: ["User"],
        label: "Te Dhenat",
        subItems: [
          {
            roles: ["User"],
            path: "/PerditesoTeDhenat",
            label: "Perditeso Fjalekalimin",
          },
          {
            roles: ["User"],
            path: "/TeDhenatEBiznesit",
            label: "Te Dhenat e Biznesit",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Financa", "Burime Njerzore"],
            path: "/Bankat",
            label: "Bankat",
          },
          {
            roles: ["User"],
            path: "/LlogaritBankareBiznesit",
            label: "Llogarit e Biznesit",
          },
          { isDivider: true },
          {
            roles: ["Menaxher"],
            path: "/BartTeDhenat",
            label: "Bart te Dhenat - Online",
            shfaqNeDashboard: true,
          },
        ],
      },
      {
        roles: ["Menaxher", "Burime Njerzore"],
        label: "Stafi",
        subItems: [
          {
            roles: ["Menaxher", "Burime Njerzore"],
            path: "/Stafi",
            label: "Perdoruesit",
          },
          {
            roles: ["Menaxher"],
            path: "/Rolet",
            label: "Rolet",
          },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant"],
        label: "Partneret",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist"],
            path: "/TabelaEPartnereve",
            label: "Lista e Partnereve",
          },
          {
            roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit"],
            path: "/KartelaFinanciare",
            label: "Kartela Financiare",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Financa"],
            path: "/ShtoPagesat",
            label: "Shto Pagesat / Faturimet",
            shfaqNeDashboard: true,
          },
        ],
      },
    ],
  },
  {
    label: "Njoftimet",
    items: [
      {
        roles: ["User"],
        label: "Artikujt",
        subItems: [
          {
            roles: ["Menaxher", "Pergjegjes i Porosive"],
            path: "/ArtikujtPaStok",
            label: "Artikujt Pa Stok",
          },{
            roles: ["Menaxher", "Pergjegjes i Porosive", "Puntor i Thjeshte", "Komercialist", "Kalkulant"],
            path: "/AfatetESkadmit",
            label: "Afatet e Skadimit",
          },
        ],
      },
      {
        roles: ["Menaxher", "Burime Njerzore"],
        label: "Faturat",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist"],
            path: "/",
            label: "",
          },
          { isDivider: true },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant"],
        label: "Furnitoret",
        subItems: [
          {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant"],
            path: "/DitetEFurnizimit",
            label: "Ditet e Furnizimit",
            shfaqNeDashboard: true,
          },
          { isDivider: true },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant"],
        label: "Porosite",
        subItems: [
          {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant"],
            path: "/SugjerimiPorosiseSipasFurnitorit",
            label: "Sugjerimi Porosise sipas Furnitorit",
          },{
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant"],
            path: "/SugjerimiPorosis",
            label: "Sugjerimi Porosis",
          },
        ],
      },
    ],
  },
];

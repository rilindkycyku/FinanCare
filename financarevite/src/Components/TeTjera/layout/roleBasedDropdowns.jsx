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
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/NjesiaMatese",
            label: "Njesia Matese",
          },
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/GrupetEProduktit",
            label: "Grupet e Produktit",
          },
          {
            roles: ["Menaxher", "Kalkulant", "Faturist", "1 Euro Menaxher"],
            path: "/KartelaEArtikullit",
            label: "Kartela e Artikullit",
          },
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/Stoqet",
            label: "Stoqet",
          },
          {
            roles: ["User"],
            path: "/ShikimiQmimeve",
            label: "Shikimi i Çmimeve",
            shfaqNeDashboard: true,
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/ZbritjetEProduktit",
            label: "Zbritjet e Produkteve",
          },
          {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Puntor i Thjeshte", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff", "Arkatar", "Faturist"],
            path: "/Qmimore",
            label: "Qmimore (Shtyp Etiketat)",
            shfaqNeDashboard: true,
          },
        ],
      },
      {
        roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist", "Arkatar", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"],
        label: "Hyrjet",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/KalkulimiIMallit",
            label: "Kalkulimi i Mallit",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "Kalkulant", "Arkatar", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/KthimiMallitTeShitur",
            label: "Kthim i Mallit te Shitur",
          },
          {
            roles: ["Menaxher", "Kalkulant", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/PranimiIMallit",
            label: "Pranimi i Mallit",
            shfaqNeDashboard: true,
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/FleteLejimet",
            label: "Flete Lejimet",
          }, {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/FleteLejimetAutomatike",
            label: "Flete Lejimet Automatike",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/KalkulimiFillestarVjetor",
            label: "Kalkulimi Fillestar Vjetor",
          },
        ],
      },
      {
        roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist", "Arkatar", "1 Euro Menaxher", "1 Euro Staff"],
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
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/AsgjesimiIStokut",
            label: "Asgjesimi i Stokut",
          },
          {
            roles: ["Menaxher", "Kalkulant", "1 Euro Menaxher"],
            path: "/KthimIMallitTeBlere",
            label: "Kthimi i Mallit te Blere",
          },
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Faturist"],
            path: "/PorositeOnline",
            label: "Porosite Online",
            shfaqNeDashboard: true,
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "1 Euro Menaxher"],
            path: "/Statistika",
            label: "Statistikat e Dyqanit",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Menaxher", "1 Euro Menaxher"],
            path: "/ListaShitjeveMeParagon",
            label: "Lista e Shitjeve me Paragon",
            shfaqNeDashboard: true,
          },
          {
            roles: ["Arkatar", "Menaxher", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/POS",
            label: "POS",
            shfaqNeDashboard: true,
          },
          { isDivider: true }, {
            roles: ["Menaxher", "1 Euro Menaxher"],
            path: "/ListaBarazimeve",
            label: "Lista e Barazimeve",
            shfaqNeDashboard: true,
          }, {
            roles: ["Arkatar", "Menaxher", "1 Euro Menaxher", "1 Euro Staff"],
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
            roles: ["Menaxher", "Financa", "Burime Njerzore", "1 Euro Menaxher"],
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
        roles: ["Menaxher", "Burime Njerzore", "1 Euro Menaxher"],
        label: "Stafi",
        subItems: [
          {
            roles: ["Menaxher", "Burime Njerzore", "1 Euro Menaxher"],
            path: "/Stafi",
            label: "Perdoruesit",
          },
          // Mund te editohen mbas host:port/Rolet
          // {
          //   roles: ["Menaxher"],
          //   path: "/Rolet",
          //   label: "Rolet",
          // },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"],
        label: "Partneret",
        subItems: [
          {
            roles: ["Menaxher", "Kalkulant", "Komercialist", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/TabelaEPartnereve",
            label: "Lista e Partnereve",
          },
          {
            roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "1 Euro Menaxher"],
            path: "/KartelaFinanciare",
            label: "Kartela Financiare",
          },
          { isDivider: true },
          {
            roles: ["Menaxher", "Financa", "1 Euro Menaxher"],
            path: "/ShtoPagesat",
            label: "Shto Pagesat / Faturimet",
            shfaqNeDashboard: true,
          },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant", "Pergjegjes i Porosive", "1 Euro Menaxher"],
        label: "Gjurmimi",
        subItems: [
          {
            roles: ["Menaxher", "1 Euro Menaxher"],
            path: "/Gjurmimi",
            label: "Gjurmimi",
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
            roles: ["Menaxher", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/ArtikujtPaStok",
            label: "Artikujt Pa Stok",
          }, {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Puntor i Thjeshte", "Komercialist", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/AfatetESkadmit",
            label: "Afatet e Skadimit",
          },
        ],
      },
      {
        roles: ["Menaxher", "Burime Njerzore"],
        label: "Faturat",
        subItems: [
          { isDivider: true },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
        label: "Furnitoret",
        subItems: [
          {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/DitetEFurnizimit",
            label: "Ditet e Furnizimit",
            shfaqNeDashboard: true,
          },
          { isDivider: true },
        ],
      },
      {
        roles: ["Menaxher", "Financa", "Mbeshtetje e Klientit", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
        label: "Porosite",
        subItems: [
          {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/SugjerimiPorosiseSipasFurnitorit",
            label: "Sugjerimi Porosise sipas Furnitorit",
          }, {
            roles: ["Menaxher", "Pergjegjes i Porosive", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"],
            path: "/SugjerimiPorosis",
            label: "Sugjerimi Porosis",
          },
        ],
      },
    ],
  },
];

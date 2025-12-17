// InvoicePDF.jsx
import { 
  Document, 
  Page, 
  Text, 
  View, 
  Image, 
  StyleSheet,
  Font 
} from '@react-pdf/renderer';

// Register Quicksand font
Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
    width: 75,
    fontSize: 8,
    fontFamily: 'Quicksand'
  },
  logo: {
    width: 55,
    height: 15,
    marginBottom: 5,
    alignSelf: 'center'
  },
  centeredText: {
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'Quicksand'
  },
  leftText: {
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Quicksand'
  },
  rightText: {
    textAlign: 'right',
    marginBottom: 2,
    fontFamily: 'Quicksand'
  },
  line: {
    borderBottom: '1 solid black',
    marginVertical: 3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  productName: {
    flex: 2,
    textAlign: 'left',
    fontFamily: 'Quicksand'
  },
  productDetails: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Quicksand'
  },
  section: {
    marginBottom: 5
  },
  divider: {
    textAlign: 'center',
    marginVertical: 2,
    fontFamily: 'Quicksand'
  },
  boldText: {
    fontFamily: 'Quicksand',
    fontWeight: 'bold'
  }
});

const InvoicePDF = ({ data, teDhenatBiznesit, BASE_URL }) => {
  const calculateDynamicHeight = () => {
    const baseHeight = 250;
    const itemsHeight = data.items.length * 25;
    return baseHeight + itemsHeight;
  };

  return (
    <Document>
      <Page 
        size={[75, calculateDynamicHeight()]} 
        style={styles.page}
      >
        {/* Logo */}
        <Image 
          style={styles.logo}
          src={`${BASE_URL}/img/web/${teDhenatBiznesit?.logo}`}
        />

        {/* Business Information */}
        <Text style={styles.centeredText}>{teDhenatBiznesit?.emriIBiznesit}</Text>
        <Text style={styles.centeredText}>Adresa: {teDhenatBiznesit?.adresa}</Text>
        <Text style={styles.centeredText}>
          Kontakti: {teDhenatBiznesit?.nrKontaktit} - {teDhenatBiznesit?.email}
        </Text>
        <Text style={styles.centeredText}>NUI: {teDhenatBiznesit?.nui}</Text>
        <Text style={styles.centeredText}>TVSH: {teDhenatBiznesit?.nrTVSH}</Text>
        <Text style={styles.centeredText}>NRF: {teDhenatBiznesit?.nf}</Text>

        <View style={styles.line} />

        {/* Invoice Header */}
        <Text style={[styles.centeredText, styles.boldText]}>PARAGON</Text>
        <Text style={styles.centeredText}>Paragon #: {data.invoiceNumber}</Text>
        <Text style={styles.centeredText}>Data: {data.date}</Text>
        <Text style={styles.centeredText}>Shitësi: {data.salesUsername}</Text>

        <View style={styles.line} />

        {/* Products Header */}
        <View style={styles.row}>
          <Text style={styles.productName}>Produkti</Text>
          <Text style={styles.productDetails}>TVSH (%)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.productName}>Çmimi</Text>
          <Text style={styles.productDetails}>Sasia</Text>
          <Text style={styles.productDetails}>Totali</Text>
        </View>
        
        <Text style={styles.divider}>----------------------------------</Text>

        {/* Products List */}
        {data.items.map((item, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDetails}>
                {parseFloat(item.vatPercentage).toFixed(2)} %
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.productName}>
                {parseFloat(item.price).toFixed(2)} €
              </Text>
              <Text style={styles.productDetails}>{item.quantity}</Text>
              <Text style={styles.productDetails}>
                {parseFloat(item.total).toFixed(2)} €
              </Text>
            </View>
            <Text style={styles.divider}>----------------------------------</Text>
          </View>
        ))}

        <View style={styles.line} />

        {/* Totals */}
        <Text style={styles.centeredText}>
          Totali pa TVSH: {data.totalWithoutVAT} €
        </Text>
        <Text style={styles.centeredText}>TVSH: {data.vat} €</Text>
        <Text style={styles.centeredText}>
          Totali pa Rabat: {parseFloat(
            parseFloat(data.totalWithoutVAT) +
            parseFloat(data.vat) +
            parseFloat(data.rabati)
          ).toFixed(2)} €
        </Text>
        <Text style={styles.centeredText}>Rabati: {data.rabati} €</Text>
        <Text style={[styles.centeredText, styles.boldText]}>
          Totali: {parseFloat(
            parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)
          ).toFixed(2)} €
        </Text>

        {/* Thank You */}
        <Text style={[styles.centeredText, { marginTop: 10 }]}>
          Faleminderit për blerjen!
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
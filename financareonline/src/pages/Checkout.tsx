import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Font, pdf } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF";
import Titulli from "../components/Titulli";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Plus, Minus, Trash2, Download, CheckCircle, ShoppingBag,
  CreditCard, Wallet, Truck, Percent, ArrowRight,
  ReceiptText, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

// ─── Invoice JSON shape ─────────────────────────────────────────────────────
interface InvoiceJsonItem {
  IDProdukti: number;
  Sasia: number;
  Qmimi: number;
  Rabati: number;
}
interface InvoiceJson {
  NrFatures: string;
  Data: string;
  IDKlienti: number;
  LlojiPageses: string;
  TotaliPaTVSH: number;
  TVSH: number;
  Rabati: number;
  Transporti: number;
  Totali: number;
  Produktet: InvoiceJsonItem[];
}

// ─── Success screen ─────────────────────────────────────────────────────────
interface SuccessScreenProps {
  invoiceData: InvoiceJson;
  clientName: string;
  paymentLabel: string;
  onNewOrder: () => void;
  onDownloadPdf: () => void;
}

function SuccessScreen({ invoiceData, clientName, paymentLabel, onNewOrder, onDownloadPdf }: SuccessScreenProps) {

  const formattedDate = new Date(invoiceData.Data).toLocaleDateString("sq-AL", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  return (
    <div className="pt-24 min-h-screen pb-24">
      <Titulli titulli="Fatura" />

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none opacity-[0.07] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)" }}
      />

      <div className="max-w-2xl mx-auto px-6">
        {/* ── Receipt card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />

          {/* Success header */}
          <div className="p-8 text-center border-b border-white/[0.06]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
              className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center mx-auto mb-5 pulse-glow"
            >
              <CheckCircle size={30} className="text-brand-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-1">Faturë e Re!</h2>
            <p className="text-slate-500 font-medium text-sm">Porosia u konfirmua me sukses</p>
          </div>

          {/* Invoice meta */}
          <div className="p-8 border-b border-white/[0.06] space-y-4">
            <ReceiptRow label="Klienti" value={clientName} highlight />
            <ReceiptRow label="Numri" value={invoiceData.NrFatures} mono />
            <ReceiptRow label="Pagesa" value={paymentLabel} />
            <ReceiptRow label="Data" value={formattedDate} />

            {/* divider dashes */}
            <div className="border-t border-dashed border-white/[0.07] my-2" />

            <ReceiptRow label="Nën-totali (pa TVSH)" value={`${invoiceData.TotaliPaTVSH.toFixed(2)} €`} />
            <ReceiptRow label="TVSH" value={`${invoiceData.TVSH.toFixed(2)} €`} />
            {invoiceData.Rabati > 0 && (
              <ReceiptRow label="Rabat" value={`-${invoiceData.Rabati.toFixed(2)} €`} green />
            )}
            <ReceiptRow label="Transporti" value={`${invoiceData.Transporti.toFixed(2)} €`} />

            <div className="border-t border-dashed border-white/[0.07] my-2" />

            <div className="flex justify-between items-end">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Totali</span>
              <span className="text-3xl font-black gradient-text">{invoiceData.Totali.toFixed(2)} €</span>
            </div>
          </div>

          {/* Products list */}
          <div className="p-8 border-b border-white/[0.06]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Produktet ({invoiceData.Produktet.length})</p>
            <div className="space-y-3">
              {invoiceData.Produktet.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-[9px] font-black text-slate-500">{i + 1}</span>
                    <span className="text-slate-400 font-medium">
                      ID-{p.IDProdukti} × <span className="font-black text-white">{p.Sasia}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.Rabati > 0 && (
                      <span className="badge-red rounded-full px-2 py-0.5 text-[8px] font-black">-{p.Rabati}%</span>
                    )}
                    <span className="font-black text-white">{p.Qmimi.toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thank you note */}
          <div className="px-8 py-5 text-center border-b border-white/[0.06]">
            <p className="text-slate-500 text-sm font-medium italic">Faleminderit për porosinë! 🙏</p>
          </div>

          {/* Action buttons */}
          <div className="p-6">
            <button
              onClick={onDownloadPdf}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
            >
              <ReceiptText size={15} /> Shkarko PDF
            </button>
          </div>
        </motion.div>


        {/* New order button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onNewOrder}
          className="w-full mt-4 btn-ghost flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={15} /> Porosi e Re
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Checkout ──────────────────────────────────────────────────────────
export default function Checkout() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceJson | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const clientName = user?.EmriBiznesit || user?.Username || "Klient";

  const calc = useMemo(() => {
    const items = cart.map((item) => {
      const rate = parseFloat(item.LlojiTVSH || "18") / 100;
      const net = item.QmimiProduktit / (1 + rate);
      const vatPerUnit = item.QmimiProduktit - net;
      return {
        ...item,
        netPrice: Number(net.toFixed(4)),
        totalVat: Number((vatPerUnit * item.quantity).toFixed(4)),
        lineTotal: Number((item.QmimiProduktit * item.quantity).toFixed(2)),
      };
    });
    const subtotalNet = items.reduce((s, i) => s + i.netPrice * i.quantity, 0);
    const totalVAT = items.reduce((s, i) => s + i.totalVat, 0);
    const grandTotalPaRabat = Number((subtotalNet + totalVAT).toFixed(2));
    const rabati = Number((grandTotalPaRabat * (user?.Rabati || 0) / 100).toFixed(2));
    const transporti = 1.50;
    const grandTotal = Number((grandTotalPaRabat - rabati + transporti).toFixed(2));
    return { items, subtotalNet, totalVAT, grandTotal, rabati, transporti, grandTotalPaRabat };
  }, [cart, user?.Rabati]);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // "2026-03-09"
  const invoiceNumber = `FAT-${String(user?.IDPartneri || 1).padStart(4, "0")}-${dateStr.replace(/-/g, "").slice(2)}-${String(now.getTime()).slice(-4)}`;

  const buildInvoiceJson = useCallback((): InvoiceJson => {
    const paymentMap: Record<string, string> = { cash: "Cash", card: "Banke" };
    return {
      NrFatures: invoiceNumber,
      Data: dateStr,
      IDKlienti: user?.IDPartneri ?? 0,
      LlojiPageses: paymentMap[paymentMethod],
      TotaliPaTVSH: Number(calc.subtotalNet.toFixed(2)),
      TVSH: Number(calc.totalVAT.toFixed(2)),
      Rabati: calc.rabati,
      Transporti: calc.transporti,
      Totali: calc.grandTotal,
      Produktet: calc.items.map((item) => ({
        IDProdukti: item.ProduktiID,
        Sasia: item.quantity,
        Qmimi: Number(item.QmimiProduktit.toFixed(2)),
        Rabati: item.discountPercentage ?? 0,
      })),
    };
  }, [invoiceNumber, dateStr, user, paymentMethod, calc]);

  const downloadJson = (invoiceJson: InvoiceJson) => {
    const blob = new Blob([JSON.stringify(invoiceJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceJson.NrFatures}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPdf = (blob: Blob) => {
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const confirmOrder = useCallback(async () => {
    if (loading || cart.length === 0) return;
    setLoading(true);

    try {
      const invoiceJson = buildInvoiceJson();

      const blob = await pdf(
        <InvoicePDF
          invoiceNumber={invoiceNumber}
          clientName={clientName}
          user={user}
          items={calc.items}
          subtotalNet={calc.subtotalNet}
          totalVAT={calc.totalVAT}
          grandTotal={calc.grandTotal}
          paymentMethod={paymentMethod}
          transporti={calc.transporti}
          rabati={calc.rabati}
        />
      ).toBlob();

      // Open PDF immediately
      openPdf(blob);

      // Send PDF to Telegram
      if (BOT_TOKEN && CHAT_ID) {
        const tgPdf = new FormData();
        tgPdf.append("chat_id", CHAT_ID);
        tgPdf.append("document", blob, `${invoiceNumber}.pdf`);
        tgPdf.append("caption", `*Faturë e Re!* - ${clientName}\nNr: *${invoiceNumber}*\nTotali: *${calc.grandTotal.toFixed(2)} €*`);
        tgPdf.append("parse_mode", "Markdown");
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: "POST", body: tgPdf });

        // Send JSON to Telegram
        const jsonBlob = new Blob([JSON.stringify(invoiceJson, null, 2)], { type: "application/json" });
        const tgJson = new FormData();
        tgJson.append("chat_id", CHAT_ID);
        tgJson.append("document", jsonBlob, `${invoiceNumber}.json`);
        tgJson.append("caption", `📦 *JSON Data* - ${invoiceNumber}`);
        tgJson.append("parse_mode", "Markdown");
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: "POST", body: tgJson });
      }

      // Save state and show success screen
      setPdfBlob(blob);
      setCompletedInvoice(invoiceJson);
      clearCart();
      toast.success("Porosia u konfirmua me sukses!");
    } catch {
      toast.error("Gabim gjatë procesimit.");
    } finally {
      setLoading(false);
    }
  }, [cart, calc, clientName, invoiceNumber, user, clearCart, loading, paymentMethod, buildInvoiceJson]);

  const changeQty = (id: number, delta: number) => {
    const item = cart.find((i) => i.ProduktiID === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeFromCart(id);
    if (newQty > item.SasiaNeStok) return toast.error("Stoku i kufizuar!");
    updateQuantity(id, newQty);
  };

  const paymentLabel = paymentMethod === "cash" ? "Cash" : "Kartelë";

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (completedInvoice) {
    return (
      <SuccessScreen
        invoiceData={completedInvoice}
        clientName={clientName}
        paymentLabel={paymentLabel}
        onNewOrder={() => { setCompletedInvoice(null); setPdfBlob(null); }}
        onDownloadPdf={() => pdfBlob && openPdf(pdfBlob)}
      />
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 w-32 h-32 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center"
        >
          <ShoppingBag size={48} className="text-slate-700" />
        </motion.div>
        <h1 className="text-3xl font-black text-white mb-3">Shporta juaj është bosh</h1>
        <p className="text-slate-500 font-medium mb-10 max-w-xs">
          Selektoni produktet që dëshironi për të vazhduar me porosinë tuaj.
        </p>
        <button
          onClick={() => window.location.href = "/products"}
          className="btn-primary px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
        >
          Eksploro Produktet <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ── MAIN CHECKOUT ─────────────────────────────────────────────────────────
  return (
    <div className="pt-24 min-h-screen pb-24">
      <Titulli titulli="Shporta & Pagesa" />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.03] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── CART ITEMS ─────────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-white">Shporta Juaj</h1>
                <p className="text-slate-500 font-medium mt-1">
                  <span className="text-brand-400 font-black">{cart.length}</span> artikuj
                </p>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {calc.items.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.ProduktiID}
                  className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5"
                >
                  <div className="w-20 h-20 bg-white/[0.04] border border-white/[0.05] rounded-xl overflow-hidden p-3 shrink-0">
                    <img
                      src={item.FotoProduktit && item.FotoProduktit !== "ProduktPaFoto.png" ? `/img/products/${item.FotoProduktit}` : "/img/products/ProduktPaFoto.png"}
                      alt={item.EmriProduktit}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h3 className="text-base font-black text-white mb-1 truncate">{item.EmriProduktit}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-brand-400 font-bold text-sm">{item.QmimiProduktit.toFixed(2)} €</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span className="badge-cyan rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">TVSh {item.LlojiTVSH}%</span>
                      {(item.discountPercentage ?? 0) > 0 && (
                        <span className="badge-red rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">-{item.discountPercentage}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center bg-white/[0.04] border border-white/[0.07] p-1 rounded-xl">
                    <button
                      onClick={() => changeQty(item.ProduktiID, -1)}
                      className="w-9 h-9 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                    ><Minus size={14} /></button>
                    <span className="text-base font-black text-white w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.ProduktiID, 1)}
                      disabled={item.quantity >= item.SasiaNeStok}
                      className="w-9 h-9 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-25"
                    ><Plus size={14} /></button>
                  </div>

                  <div className="text-center sm:text-right min-w-[90px]">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Totali</p>
                    <p className="text-2xl font-black text-white">
                      {item.lineTotal.toFixed(2)}{" "}
                      <span className="text-brand-400 text-lg">€</span>
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.ProduktiID)}
                    className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────────── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-xl font-black text-white mb-7">Përmbledhja</h2>

                <div className="space-y-3">
                  <SummaryLine label="Nën-totali" value={calc.grandTotalPaRabat.toFixed(2)} />
                  <SummaryLine label="Transporti" value={calc.transporti.toFixed(2)} icon={<Truck size={13} />} />
                  {calc.rabati > 0 && (
                    <SummaryLine label={`Rabat (${user?.Rabati}%)`} value={`-${calc.rabati.toFixed(2)}`} icon={<Percent size={13} />} highlight />
                  )}
                  <div className="pt-5 mt-5 border-t border-white/[0.06]">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Totali</span>
                      <span className="text-4xl font-black gradient-text tracking-tight">
                        {calc.grandTotal.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metoda e Pagesës</p>
                  <div className="grid grid-cols-2 gap-3">
                    <PayBtn active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")} icon={<Wallet size={16} />} label="Cash" />
                    <PayBtn active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} icon={<CreditCard size={16} />} label="Bankë" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmOrder}
                  disabled={loading}
                  className="w-full mt-8 btn-primary py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
                  style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
                >
                  {loading ? "Duke u procesuar..." : <><Download size={18} /> Konfirmo Porosinë</>}
                </motion.button>

                {/* Output format note */}
                <p className="mt-4 text-center text-[10px] text-slate-600 font-medium">
                  Gjeneron PDF + JSON automatikisht
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm mb-1">Blerje e Sigurt</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Të dhënat tuaja janë të sigurta. PDF + JSON gjenerohen automatikisht.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ReceiptRow({ label, value, highlight, green, mono }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-black ${highlight ? "text-white" : green ? "text-brand-400" : "text-slate-300"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryLine({ label, value, icon, highlight }: any) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <div className="flex items-center gap-2 text-slate-500 font-medium">
        {icon}
        {label}
      </div>
      <span className={`font-black ${highlight ? "text-brand-400" : "text-white"}`}>{value} €</span>
    </div>
  );
}

function PayBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
        active
          ? "border-brand-500/40 bg-brand-500/10 text-brand-400"
          : "border-white/[0.07] bg-white/[0.03] text-slate-500 hover:border-white/15 hover:text-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

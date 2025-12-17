// src/pages/Checkout.tsx
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Font, pdf } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF";
import Titulli from "../components/Titulli";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Minus, Trash2, Download } from "lucide-react";
// 1. Shto import për stokun (në krye të file-it)

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

export default function Checkout() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const clientName = user?.EmriBiznesit || user?.Username || "Klient";

  // Shto këtë state në krye të komponentit Checkout (pas useState(loading))
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer"
  >("cash");

  const calc = useMemo(() => {
    const items = cart.map((item) => {
      const rate = parseFloat(item.LlojiTVSH || "18") / 100;
      const net = item.QmimiProduktit / (1 + rate);
      const vatPerUnit = item.QmimiProduktit - net;

      return {
        ProduktiID: Number(item.ProduktiID),
        EmriProduktit: item.EmriProduktit,
        Barkodi: item.Barkodi,
        quantity: item.quantity,
        QmimiProduktit: item.QmimiProduktit,
        LlojiTVSH: item.LlojiTVSH || "18",
        netPrice: Number(net.toFixed(4)),
        totalVat: Number((vatPerUnit * item.quantity).toFixed(4)),
        lineTotal: Number((item.QmimiProduktit * item.quantity).toFixed(2)),
        SasiaNeStok: item.SasiaNeStok,
      };
    });

    const subtotalNet = items.reduce((s, i) => s + i.netPrice * i.quantity, 0);
    const totalVAT = items.reduce((s, i) => s + i.totalVat, 0);
    const grandTotal = Number((subtotalNet + totalVAT).toFixed(2));

    return { items, subtotalNet, totalVAT, grandTotal };
  }, [cart]);

  const today = new Date();
  const year = today.getFullYear().toString().slice(-2); // 25
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 12
  const day = String(today.getDate()).padStart(2, "0"); // 08

  const userIdPadded = String(user?.IDPartneri || 1).padStart(4, "0"); // e.g., 0001, 0123

  // Pjesa e fundit: merr 4 shifrat e fundit të milisekondave + sekonda për unikitet të lartë
  const sequence = String(Date.now()).slice(-4); // e.g., 1234, 9876

  const invoiceNumber = `FAT-${userIdPadded}-${year}${month}${day}-${sequence}`;

  const sendToTelegram = async (blob: Blob) => {
    if (!BOT_TOKEN || !CHAT_ID) return;

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("document", blob, `${invoiceNumber}.pdf`);
    formData.append("parse_mode", "Markdown");
    formData.append(
      "caption",
      `*Faturë e Re!*\n\n*Klienti:* _${clientName}_\n*Numri:* \`${invoiceNumber}\`\n*Pagesa:* ${
        paymentMethod === "cash"
          ? "Cash"
          : paymentMethod === "card"
          ? "Kartelë"
          : "Transfer"
      }\n*Data:* ${new Date().toLocaleDateString(
        "sq-AL"
      )}\n*Totali:* *${calc.grandTotal.toFixed(
        2
      )} €*\n\nFaleminderit për porosinë!`
    );
    const items = calc.items.map((i) => ({
      IDProdukti: i.ProduktiID,
      Sasia: i.quantity,
      Qmimi: Number(i.QmimiProduktit.toFixed(2)),
    }));

    const orderJson = {
      NrFatures: invoiceNumber,
      Data: new Date().toISOString().split("T")[0], // "2025-12-08"
      IDKlienti: user?.IDPartneri || 1, // fallback to 1 if no user
      LlojiPageses:
        paymentMethod === "cash"
          ? "Cash"
          : paymentMethod === "card"
          ? "Banke"
          : "Borxh",
      TotaliPaTVSH: Number(calc.subtotalNet.toFixed(2)),
      TVSH: Number(calc.totalVAT.toFixed(2)),
      Produktet: items,
    };

    // SHITJA E MADHE: DËRGO SI FILE .json (asnjëherë nuk ndahet!)
    const jsonString = JSON.stringify(orderJson, null, 2);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });

    const formDataJson = new FormData();
    formDataJson.append("chat_id", CHAT_ID);
    formDataJson.append("document", jsonBlob, `${invoiceNumber}.json`);

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formDataJson,
      });
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error("Telegram error:", err);
    }
  };

  const confirmOrder = useCallback(async () => {
    if (loading || cart.length === 0) return;
    setLoading(true);

    try {
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
        />
      ).toBlob();

      window.open(URL.createObjectURL(blob), "_blank");
      await sendToTelegram(blob);

      clearCart();
      toast.success("Porosia u konfirmua me sukses!", {
        duration: 5000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gabim gjatë krijimit të faturës.");
    } finally {
      setLoading(false);
    }
  }, [cart, calc, clientName, invoiceNumber, user, clearCart, loading]);

  // 3. Zëvendëso krejt funksionin changeQty me këtë version të ri:
  const changeQty = (id: number, delta: number) => {
    const item = cart.find((i) => i.ProduktiID === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    const stock = item.SasiaNeStok;

    if (newQty < 1) {
      removeFromCart(id);
    } else if (newQty > stock) {
      toast.error(`Stoku i kufizuar! Disponohen vetëm ${stock} copë`);
    } else {
      updateQuantity(id, newQty);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Shporta është bosh
        </h1>
        <a
          href="/"
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
          Kthehu te produktet
        </a>
      </div>
    );
  }

  return (
    <>
      <Titulli titulli="Përfundo Porosinë" />

      <div className="min-h-screen bg-gray-50">
        {/* ============================================ */}
        {/* MOBILE VERSION – PERFECT, NO OVERLAP */}
        {/* ============================================ */}
        <div className="md:hidden min-h-screen bg-gray-50 flex flex-col">
          {/* Lista e produkteve – me padding poshtë që të mos mbulohet */}
          <div className="flex-1 overflow-y-auto pb-36">
            {" "}
            {/* pb-36 është çelësi */}
            <div className="px-4 pt-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                  Përfundo porosinë
                </h1>
                <p className="text-gray-600 mt-2">
                  Kontrollo artikujt dhe konfirmo
                </p>
              </div>

              <div className="space-y-5">
                {calc.items.map((item) => (
                  <div
                    key={item.ProduktiID}
                    className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {item.EmriProduktit}
                        </h3>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-gray-600 text-sm">
                            {item.QmimiProduktit.toFixed(2)} € / copë
                          </span>
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            TVSH {item.LlojiTVSH}%
                          </span>
                        </div>

                        {/* Mesazhet e stokut */}
                        {item.quantity >= item.SasiaNeStok ? (
                          <p className="text-red-600 text-xs font-bold mt-2">
                            Stoku u mbarua!
                          </p>
                        ) : item.SasiaNeStok <= 10 ? (
                          <p className="text-amber-600 text-xs font-bold mt-2">
                            Vetëm {item.SasiaNeStok} copë të mbetura!
                          </p>
                        ) : null}
                      </div>

                      {/* Kontrolli i sasisë */}
                      <div className="flex items-center bg-gray-100 rounded-2xl h-12 ml-4">
                        <button
                          onClick={() => changeQty(item.ProduktiID, -1)}
                          className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 rounded-l-2xl transition">
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="w-14 text-center font-black text-xl text-indigo-600">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQty(item.ProduktiID, +1)}
                          disabled={item.quantity >= item.SasiaNeStok}
                          className={`w-12 h-12 flex items-center justify-center transition rounded-r-2xl ${
                            item.quantity >= item.SasiaNeStok
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}>
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Totali i rreshtit + fshirja */}
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => removeFromCart(item.ProduktiID)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                        <Trash2 className="w-7 h-7" />
                      </button>
                      <div className="text-right">
                        <div className="text-4xl font-black text-indigo-600">
                          {item.lineTotal.toFixed(2)} €
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          me TVSH të përfshirë
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOTALI + LLOJI I PAGESES + BUTONI – STICKY POSHTË */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
            <div className="p-4 space-y-4">
              {/* Lloji i Pagesës */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Lloji i Pagesës
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as "cash" | "card" | "transfer"
                    )
                  }
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-2xl text-lg font-medium focus:border-indigo-500 focus:outline-none transition">
                  <option value="cash">Cash (Para në Dorë)</option>
                  <option value="card">Bankë</option>
                  <option value="transfer">Borxh</option>
                </select>
              </div>

              {/* Përmbledhja e totalit */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
                <div className="space-y-5 text-xl">
                  <div className="flex justify-between">
                    <span>Pa TVSH:</span>
                    <span className="font-bold">
                      {calc.subtotalNet.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVSH:</span>
                    <span className="font-bold">
                      {calc.totalVAT.toFixed(2)} €
                    </span>
                  </div>
                  <div className="border-t-2 border-white/30 pt-5 mt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl">Totali:</span>
                      <span className="text-3xl font-black">
                        {calc.grandTotal.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Butoni i konfirmimit */}
              <button
                onClick={confirmOrder}
                disabled={loading || calc.items.length === 0}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-3xl flex items-center justify-center gap-3 shadow-xl active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed transition">
                <Download className="w-8 h-8" />
                {loading ? "Duke përpunuar..." : "Konfirmo Porosinë"}
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block max-w-6xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-center mb-10">
            Përfundo Porosinë
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {calc.items.map((item) => (
                <div
                  key={item.ProduktiID}
                  className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {item.EmriProduktit}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gray-600 text-sm">
                          {item.QmimiProduktit.toFixed(2)} € / copë
                        </span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                          TVSH {item.LlojiTVSH}%
                        </span>
                        {item.quantity >= item.SasiaNeStok ? (
                          <p className="text-red-600 text-xs font-bold mt-2">
                            Stoku u mbarua!
                          </p>
                        ) : (
                          <p className="text-amber-600 text-xs font-bold mt-2">
                            Vetëm {item.SasiaNeStok - item.quantity} copë të
                            mbetura!
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-2xl h-12">
                      <button
                        onClick={() => changeQty(item.ProduktiID, -1)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 rounded-l-2xl transition">
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-14 text-center font-black text-xl text-indigo-600">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQty(item.ProduktiID, +1)}
                        disabled={item.quantity >= item.SasiaNeStok}
                        className={`w-12 h-12 flex items-center justify-center rounded-r-2xl transition ${
                          item.quantity >= item.SasiaNeStok
                            ? "opacity-40 cursor-not-allowed bg-gray-200"
                            : "hover:bg-gray-200"
                        }`}>
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => removeFromCart(item.ProduktiID)}
                      className="text-red-500">
                      <Trash2 className="w-7 h-7" />
                    </button>
                    <div className="text-right">
                      <div className="text-4xl font-black text-indigo-600">
                        {item.lineTotal.toFixed(2)} €
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        me TVSH të përfshirë
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl sticky top-8">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  Përmbledhje
                </h2>
                <div className="space-y-5 text-xl">
                  <div className="flex justify-between">
                    <span>Pa TVSH:</span>
                    <span className="font-bold">
                      {calc.subtotalNet.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVSH:</span>
                    <span className="font-bold">
                      {calc.totalVAT.toFixed(2)} €
                    </span>
                  </div>
                  <div className="border-t-2 border-white/30 pt-5 mt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl">Totali:</span>
                      <span className="text-3xl font-black">
                        {calc.grandTotal.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    Lloji i Pagesës
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-5 py-4 rounded-2xl text-lg font-medium text-gray-800 bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/50">
                    <option value="cash">Cash (Para në Dorë)</option>
                    <option value="card">Bankë</option>
                    <option value="transfer">Borxh</option>
                  </select>
                </div>
                <button
                  onClick={confirmOrder}
                  disabled={loading}
                  className="w-full mt-10 py-6 bg-white text-indigo-700 font-black text-2xl rounded-2xl flex items-center justify-center gap-4 shadow-xl hover:scale-105 transition disabled:opacity-70">
                  <Download className="w-9 h-9" />
                  {loading ? "Duke përpunuar..." : "Konfirmo Porosinë"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// src/components/ProductCard.tsx → VERSIONI PËRFUNDIMTAR & PERFECT
import type { Produkti } from "../types/index";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { getDisplayPrice } from "../context/CartContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Plus, Minus } from "lucide-react";

interface Props {
  product: Produkti;
}

export default function ProductCard({ product }: Props) {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sasia, setSasia] = useState(1);

  const categoryID = Number(user?.IDKategoritEPartnerit ?? 0);
  const finalPrice = getDisplayPrice(product, categoryID);
  const basePrice = Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);

  let isOfficialOffer = false;

  // 1. Nëse ka kategori partnere
  if (categoryID > 0) {
    const catPriceEntry = (product.QmimiProduktitPerKategori || []).find(
      (p: any) => Number(p.IdKategoritEPartnerit) === categoryID
    );

    // Nëse ka çmim special për këtë kategori DHE është ai që po përdoret
    if (catPriceEntry && Number(catPriceEntry.QmimiProduktit) === finalPrice) {
      isOfficialOffer = catPriceEntry.EshteNeOfert === "true";
    }
    // Nëse nuk ka çmim special → përdoret çmimi bazë
    else if (finalPrice === basePrice) {
      isOfficialOffer = product.StokuQmimiProduktit?.EshteNeOfert === "true";
    }
  }
  // 2. Klient pa kategori → gjithmonë çmimi bazë
  else {
    isOfficialOffer = product.StokuQmimiProduktit?.EshteNeOfert === "true";
  }

  const isCategoryDiscount =
    !isOfficialOffer && finalPrice < basePrice && finalPrice > 0;
  const hasDiscount = isOfficialOffer || isCategoryDiscount;

  const stock = Number(product.StokuQmimiProduktit?.SasiaNeStok ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  // LLOGARIS SASINË AKTUALE NË SHPORTE
  const currentInCart = cart.reduce((total, item) => {
    return item.ProduktiID === product.ProduktiID
      ? total + item.quantity
      : total;
  }, 0);

  // SASIA MAKSIMALE QË MUND TË SHTOHET
  const maxAllowed = isOutOfStock ? 0 : stock - currentInCart;
  const canAddMore = maxAllowed > 0;

  // Rikthe sasinë nëse kalon limitin (p.sh. kur ndryshon stoku)
  useEffect(() => {
    if (sasia > maxAllowed && maxAllowed > 0) {
      setSasia(maxAllowed);
    } else if (maxAllowed <= 0) {
      setSasia(1);
    }
  }, [currentInCart, stock, maxAllowed, sasia]);

  const imageSrc = useMemo(() => {
    return product.FotoProduktit &&
      product.FotoProduktit !== "ProduktPaFoto.png"
      ? `/img/products/${product.FotoProduktit}`
      : "/img/products/ProduktPaFoto.png";
  }, [product.FotoProduktit]);

  const handleAdd = () => {
    if (!user) {
      toast.error("Duhet të kyçeni për të shtuar në shportë!");
      navigate("/login");
      return;
    }

    for (let i = 0; i < sasia; i++) {
      addToCart(product);
    }

    toast.success(
      <div className="flex items-center gap-3">
        <img
          src={imageSrc}
          alt={product.EmriProduktit}
          className="w-12 h-12 rounded-lg object-cover border-2 border-white/30 shadow-md"
        />
        <div>
          <p className="font-bold text-sm leading-tight">
            {product.EmriProduktit}
          </p>
          <p className="text-xs opacity-90">
            {sasia > 1 ? `${sasia} copë u shtuan` : "U shtua në shportë"} •{" "}
            {finalPrice.toFixed(2)} €{" "}
            {sasia > 1 && <span className="font-bold">× {sasia}</span>}
          </p>
        </div>
      </div>,
      {
        duration: 3500,
        icon: (
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl">
              <ShoppingCart className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </div>
        ),
        style: {
          background: "#1e293b",
          color: "#fff",
          borderRadius: "16px",
          padding: "14px 18px",
        },
      }
    );

    setSasia(1); // rikthe në 1 pas shtimit
  };

  const ndryshoSasine = (delta: number) => {
    setSasia((prev) => {
      const eRe = prev + delta;
      if (eRe < 1) return 1;
      if (eRe > maxAllowed) {
        toast.error(`Mund të shtosh vetëm ${maxAllowed} copë më shumë!`, {
          icon: "Stock Limit",
          style: { background: "#fef3c7", color: "#92400e" },
        });
        return prev;
      }
      return eRe;
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* IMAZHI */}
      <div className="aspect-square relative bg-gray-50 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.EmriProduktit}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Vetëm {stock}!
          </div>
        )}

        {/* Jashtë Stokut */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Jashtë Stokut</span>
          </div>
        )}
      </div>

      {/* PËRMBATJA */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 h-10 leading-tight">
          {product.EmriProduktit}
        </h3>

        {/* ÇMIMI */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">
              {finalPrice.toFixed(2)} €
            </span>
            {hasDiscount && basePrice > finalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {basePrice.toFixed(2)} €
              </span>
            )}
          </div>

          {/* OFERTA APO ZBRITJA – LOGJIKA E RE */}
          {hasDiscount && (
            <div className="mt-2">
              {isOfficialOffer ? (
                // SHFAQET VETËM KUR ÇMIMI AKTUAL KA OFERTË ZYRTAR
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  OFERTË SPECIALE
                </div>
              ) : (
                // Zbritje e thjeshtë për kategori (pa ofertë zyrtare)
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-emerald-600" />
                  Çmim special për {user?.EmriKategoris || "klientët tanë"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SASIA + SHTO NË SHPORTE */}
        {!isOutOfStock ? (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-xl shadow-sm">
              <button
                onClick={() => ndryshoSasine(-1)}
                disabled={sasia <= 1}
                className="w-9 h-9 hover:bg-gray-200 disabled:opacity-50 rounded-l-xl transition flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm">
                {sasia}
              </span>
              <button
                onClick={() => ndryshoSasine(1)}
                disabled={sasia >= maxAllowed}
                className="w-9 h-9 hover:bg-gray-200 disabled:opacity-50 rounded-r-xl transition flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!canAddMore}
              className={`flex-1 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                canAddMore
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}>
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="mt-4 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">
              Jashtë Stokut
            </span>
          </div>
        )}
        {currentInCart > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Tashmë ke <strong>{currentInCart}</strong> në shportë
              {maxAllowed > 0 && ` • Mund të shtosh edhe ${maxAllowed}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

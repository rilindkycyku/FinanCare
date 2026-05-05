import type { Produkti } from "../types/index";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";
import { getDisplayPrice } from "../context/CartContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Check, PackageX, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  product: Produkti;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: Props) {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sasia, setSasia] = useState(1);
  const [addedRecently, setAddedRecently] = useState(false);

  const finalPrice = getDisplayPrice(product);
  const basePrice = Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);
  const discount = product.ZbritjaQmimitProduktit;
  let hasDiscount = false;
  let discountPercentage = 0;

  if (discount && discount.Rabati > 0) {
    if (!discount.DataSkadimit || new Date() <= new Date(discount.DataSkadimit)) {
      hasDiscount = true;
      discountPercentage = discount.Rabati;
    }
  }

  const stock = Number(product.StokuQmimiProduktit?.SasiaNeStok ?? 0);
  const isOutOfStock = stock <= 0;
  const currentInCart = cart.reduce(
    (total, item) => item.ProduktiID === product.ProduktiID ? total + item.quantity : total,
    0
  );
  const maxAllowed = isOutOfStock ? 0 : stock - currentInCart;

  const imageSrc = useMemo(() => {
    return product.FotoProduktit && product.FotoProduktit !== "ProduktPaFoto.png"
      ? `/img/products/${product.FotoProduktit}`
      : "/img/products/ProduktPaFoto.png";
  }, [product.FotoProduktit]);

  const handleAdd = () => {
    if (!user) {
      toast.error("Kyçuni në llogari!");
      navigate("/login");
      return;
    }
    for (let i = 0; i < sasia; i++) addToCart(product);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 2000);
    toast.success(`${product.EmriProduktit} u shtua!`);
    setSasia(1);
  };

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-6"
      >
        {/* Image */}
        <div className="w-20 h-20 shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 relative overflow-hidden">
          <img src={imageSrc} className="w-full h-full object-contain" alt={product.EmriProduktit} />
          {hasDiscount && (
            <span className="absolute top-0 right-0 badge-red text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-sm truncate mb-1">{product.EmriProduktit}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.Barkodi || "—"}</p>
          {currentInCart > 0 && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 badge-emerald rounded-full text-[9px] font-black uppercase tracking-widest">
              Në shportë: {currentInCart}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col items-end shrink-0 px-4">
          {hasDiscount && (
            <span className="text-xs text-slate-600 line-through font-bold mb-0.5">{basePrice.toFixed(2)} €</span>
          )}
          <span className="text-2xl font-black text-white tracking-tight">
            {finalPrice.toFixed(2)} <span className="text-brand-400 text-lg">€</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-white/[0.05] border border-white/[0.07] rounded-xl p-1">
            <button
              onClick={() => setSasia(Math.max(1, sasia - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            ><Minus size={13} /></button>
            <span className="w-8 text-center text-sm font-black text-white">{sasia}</span>
            <button
              onClick={() => setSasia(Math.min(maxAllowed, sasia + 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            ><Plus size={13} /></button>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || maxAllowed <= 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
              addedRecently
                ? "bg-brand-500/20 border border-brand-500/30 text-brand-400"
                : "btn-primary text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-white/10"
            }`}
          >
            {addedRecently ? <Check size={14} /> : <ShoppingCart size={14} />}
            {addedRecently ? "U shtua" : "Shto"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── GRID VIEW ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col h-full group"
    >
      {/* Image container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.05] mb-4 p-4">
        <img
          src={imageSrc}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          alt={product.EmriProduktit}
        />

        {hasDiscount && (
          <div className="absolute top-2 left-2 badge-red rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
            <Tag size={8} />
            -{discountPercentage}%
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-slate-300 text-[10px] font-black uppercase tracking-widest">
              <PackageX size={12} />
              Jashtë Stokut
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-black text-white text-sm line-clamp-2 leading-tight mb-3">{product.EmriProduktit}</h3>

        <div className="mt-auto space-y-3">
          {/* Price */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-slate-600 line-through font-bold">{basePrice.toFixed(2)} €</span>
              )}
              <span className="text-xl font-black text-white tracking-tight">
                {finalPrice.toFixed(2)}{" "}
                <span className="text-brand-400 text-base">€</span>
              </span>
            </div>
            {currentInCart > 0 && (
              <span className="badge-emerald rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                ×{currentInCart}
              </span>
            )}
          </div>

          {/* Qty */}
          <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            <button
              onClick={() => setSasia(Math.max(1, sasia - 1))}
              className="w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            ><Minus size={13} /></button>
            <span className="font-black text-white text-sm">{sasia}</span>
            <button
              onClick={() => setSasia(Math.min(maxAllowed, sasia + 1))}
              className="w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            ><Plus size={13} /></button>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || maxAllowed <= 0}
            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
              addedRecently
                ? "bg-brand-500/15 border border-brand-500/30 text-brand-400"
                : "btn-primary text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-white/5"
            }`}
          >
            {addedRecently ? <Check size={14} /> : <ShoppingCart size={14} />}
            {addedRecently ? "U shtua!" : "Shto në shportë"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
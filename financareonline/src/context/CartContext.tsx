// src/context/CartContext.tsx
import { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import cartReducer from "./cartReducer";
import type { CartState, CartItem } from "./cartReducer";
import type { Produkti } from "../types";

export const getDisplayPrice = (
  product: Produkti,
  partnerCategoryId: number = 0
): number => {
  const basePrice = Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);

  // Nëse nuk ka kategori partnere → kthe çmimin bazë
  if (!partnerCategoryId || partnerCategoryId <= 0) {
    return basePrice;
  }

  const categoryPrices = product.QmimiProduktitPerKategori || [];

  // 1. Kontrollo nëse ka çmim EKZAKT për këtë kategori
  const exactMatch = categoryPrices.find(
    (p) => Number(p.IdKategoritEPartnerit) === partnerCategoryId
  );

  // Nëse ka çmim për këtë kategori → përdore atë (edhe nëse është 0 ose më i lartë)
  if (exactMatch !== undefined) {
    const categoryPrice = Number(exactMatch.QmimiProduktit);
    return categoryPrice > 0 ? categoryPrice : basePrice;
  }

  // 2. Nëse NUK ka çmim për këtë kategori → kthe çmimin bazë (JO më të ulëtin nga të tjerët!)
  return basePrice;
};
const initialState: CartState = { cart: [] }; // Fillojmë bosh

const CartContext = createContext<{
  cart: CartItem[];
  addToCart: (product: Produkti) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
} | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // FIX-I KRYESOR: Lexo cart nga localStorage në fillim
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "SET_CART", payload: parsed });
      }
    } catch (err) {
      console.error("Gabim në leximin e shportës", err);
      localStorage.removeItem("cart");
    }
  }, []);

  const addToCart = (product: Produkti) => {
  const categoryID = Number(user?.IDKategoritEPartnerit ?? 0);
  const finalPrice = getDisplayPrice(product, categoryID);

  const globalOffer = product.StokuQmimiProduktit?.EshteNeOfert === "true";
  let categoryOffer = false;
  if (categoryID > 0) {
    const usedPriceEntry = (product.QmimiProduktitPerKategori || []).find(
      (p) =>
        Number(p.IdKategoritEPartnerit) === categoryID &&
        Number(p.QmimiProduktit) === finalPrice
    );
    categoryOffer = usedPriceEntry?.EshteNeOfert === "true";
  }

  const isOfficialOffer = globalOffer || categoryOffer;
  const isCategoryDiscount =
    !isOfficialOffer && finalPrice < Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);

  // MARRIM STOKUN AKTUALE
  const stock = Number(product.StokuQmimiProduktit?.SasiaNeStok ?? 999);

  dispatch({
    type: "ADD_TO_CART",
    product,
    displayPrice: finalPrice,
    isCategoryDiscount,
    isOfficialOffer,
    Barkodi: product.Barkodi,
    // SHTOJMË STOKUN KËTU
    SasiaNeStok: stock,
  });
};

  const removeFromCart = (id: number) => dispatch({ type: "REMOVE_FROM_CART", id });
  const updateQuantity = (id: number, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", id, quantity });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const total = Number(
    state.cart.reduce((s, i) => s + i.QmimiProduktit * i.quantity, 0).toFixed(2)
  );
  const totalItems = state.cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart duhet të përdoret brenda CartProvider");
  return ctx;
};
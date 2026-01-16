// src/context/CartContext.tsx
import { createContext, useContext, useReducer, useEffect } from "react";
import cartReducer from "./cartReducer";
import type { CartState, CartItem } from "./cartReducer";
import type { Produkti } from "../types";

// Helper function to check if discount is active
// Discount is active if: Rabati > 0 AND (no expiry date OR not expired)
const isDiscountActive = (product: Produkti): boolean => {
  const discount = product.ZbritjaQmimitProduktit;
  
  // No discount object or Rabati is 0 or less
  if (!discount || discount.Rabati <= 0) return false;
  
  // Check if discount has expired
  if (discount.DataSkadimit) {
    const expiryDate = new Date(discount.DataSkadimit);
    const now = new Date();
    if (now > expiryDate) return false;
  }
  
  // Discount is active: Rabati > 0 and not expired
  return true;
};

// Calculate display price with discount logic
export const getDisplayPrice = (product: Produkti): number => {
  const qmimiBaze = Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);
  
  if (qmimiBaze <= 0) return 0;

  // Check if product has active discount (Rabati > 0 and not expired)
  if (isDiscountActive(product)) {
    const rabati = Number(product.ZbritjaQmimitProduktit?.Rabati ?? 0);
    
    if (rabati > 0) {
      // Calculate discounted price: base price - (base price * discount percentage / 100)
      const qmimiMeZbritje = qmimiBaze - (qmimiBaze * (rabati / 100));
      return Number(qmimiMeZbritje.toFixed(2));
    }
  }

  // Return base price if no active discount
  return qmimiBaze;
};

const initialState: CartState = { cart: [] };

const CartContext = createContext<
  | {
      cart: CartItem[];
      addToCart: (product: Produkti) => void;
      removeFromCart: (id: number) => void;
      updateQuantity: (id: number, quantity: number) => void;
      clearCart: () => void;
      total: number;
      totalItems: number;
    }
  | undefined
>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
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
    const finalPrice = getDisplayPrice(product);

    // Check if product has active discount (Rabati > 0 and not expired)
    const hasProductDiscount = isDiscountActive(product);
    const discountPercentage = hasProductDiscount 
      ? Number(product.ZbritjaQmimitProduktit?.Rabati ?? 0)
      : 0;

    // Get current stock
    const stock = Number(product.StokuQmimiProduktit?.SasiaNeStok ?? 999);

    dispatch({
      type: "ADD_TO_CART",
      product,
      displayPrice: finalPrice,
      hasProductDiscount,
      discountPercentage,
      Barkodi: product.Barkodi,
      SasiaNeStok: stock,
    });
  };

  const removeFromCart = (id: number) =>
    dispatch({ type: "REMOVE_FROM_CART", id });
  
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
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart duhet të përdoret brenda CartProvider");
  return ctx;
};
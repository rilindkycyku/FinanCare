// src/context/cartReducer.ts
import toast from "react-hot-toast";
import type { Produkti } from "../types/index";

export type CartItem = {
  ProduktiID: number;
  EmriProduktit: string;
  QmimiProduktit: number;
  quantity: number;
  LlojiTVSH: string;
  Barkodi?: string;
  hasProductDiscount?: boolean;
  discountPercentage?: number;
  SasiaNeStok: number;
};

export type CartState = {
  cart: CartItem[];
};

type CartAction =
  | {
      type: "ADD_TO_CART";
      product: Produkti;
      displayPrice: number;
      hasProductDiscount?: boolean;
      discountPercentage?: number;
      Barkodi?: string;
      SasiaNeStok: number;
    }
  | { type: "REMOVE_FROM_CART"; id: number }
  | { type: "UPDATE_QUANTITY"; id: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const {
        product,
        displayPrice,
        hasProductDiscount = false,
        discountPercentage = 0,
        SasiaNeStok,
      } = action;
      
      const tvsh = String(product.LlojiTVSH || "18");

      const existingItem = state.cart.find(
        (i) => i.ProduktiID === product.ProduktiID
      );

      let newCart: CartItem[];

      if (existingItem) {
        // Item already exists, increase quantity
        const newQuantity = existingItem.quantity + 1;
        
        if (newQuantity > SasiaNeStok) {
          toast.error(`Nuk ka më stok! Maksimumi: ${SasiaNeStok} copë`);
          return state;
        }

        newCart = state.cart.map((item) =>
          item.ProduktiID === product.ProduktiID
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // New item
        if (SasiaNeStok < 1) {
          toast.error("Produkti është jashtë stokut!");
          return state;
        }

        newCart = [
          ...state.cart,
          {
            ProduktiID: product.ProduktiID,
            EmriProduktit: product.EmriProduktit,
            QmimiProduktit: displayPrice,
            quantity: 1,
            LlojiTVSH: tvsh,
            hasProductDiscount,
            discountPercentage,
            Barkodi: product.Barkodi || undefined,
            SasiaNeStok: SasiaNeStok,
          },
        ];
      }

      // Show single toast after cart update
      const currentItem = newCart.find(i => i.ProduktiID === product.ProduktiID);
      const quantity = currentItem?.quantity || 1;
      const discountMsg = hasProductDiscount 
        ? ` 🎉 -${discountPercentage}%`
        : "";

      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    case "REMOVE_FROM_CART": {
      const newCart = state.cart.filter((i) => i.ProduktiID !== action.id);
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_FROM_CART", id: action.id });
      }

      const newCart = state.cart.map((item) =>
        item.ProduktiID === action.id
          ? { ...item, quantity: action.quantity }
          : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    case "CLEAR_CART": {
      localStorage.removeItem("cart");
      return { ...state, cart: [] };
    }

    case "SET_CART": {
      return { ...state, cart: action.payload };
    }

    default:
      return state;
  }
};

export default cartReducer;
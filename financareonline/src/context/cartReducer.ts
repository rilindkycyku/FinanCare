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
  isCategoryDiscount?: boolean;
  isOfficialOffer?: boolean;
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
      isCategoryDiscount?: boolean;
      isOfficialOffer?: boolean;
      Barkodi?: string;
      SasiaNeStok: number;
    }
  | { type: "REMOVE_FROM_CART"; id: number }
  | { type: "UPDATE_QUANTITY"; id: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: CartItem[] }; // KJO ËSHTË E REJA

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
  const {
    product,
    displayPrice,
    isCategoryDiscount = false,
    isOfficialOffer = false,
    SasiaNeStok, // MARRIM STOKUN
  } = action;
  const tvsh = String(product.LlojiTVSH || "18");

  const existingItem = state.cart.find(
    (i) => i.ProduktiID === product.ProduktiID
  );

  let newCart: CartItem[];

  if (existingItem) {
    // Nëse ekziston, vetëm rrit sasinë (por kontrollo stokun)
    const newQuantity = existingItem.quantity + 1;
    if (newQuantity > SasiaNeStok) {
      toast.error(`Nuk ka më stok! Maksimumi: ${SasiaNeStok} copë`);
      return state; // mos lejo të shtohet
    }

    newCart = state.cart.map((item) =>
      item.ProduktiID === product.ProduktiID
        ? { ...item, quantity: newQuantity }
        : item
    );
  } else {
    // Shtojmë të ri
    if (1 > SasiaNeStok) {
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
        isCategoryDiscount,
        isOfficialOffer,
        Barkodi: product.Barkodi || undefined,
        SasiaNeStok: SasiaNeStok, // RUAJMË STOKUN
      },
    ];
  }

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
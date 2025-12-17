// src/pages/Home.tsx → VETËM PRODUKTE ME OFERTË / ÇMIM SPECIAL (MAX 15)
import { useEffect, useState } from "react";
import productsData from "../data/products.json";
import businessData from "../data/business.json";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { getDisplayPrice } from "../context/CartContext";
import type { Produkti } from "../types";
import Titulli from "../components/Titulli";

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Produkti[]>([]);

  const categoryID = Number(user?.IDKategoritEPartnerit ?? 0);

  useEffect(() => {
    const activeProducts = productsData
      .filter((p: any) => p.isDeleted !== "true");

    // Logjika: cilat produkte kanë zbritje?
    const discountedProducts = activeProducts
      .map((p: any) => {
        const finalPrice = getDisplayPrice(p, categoryID);
        const basePrice = Number(p.StokuQmimiProduktit?.QmimiProduktit ?? 0);
        const globalOffer = p.StokuQmimiProduktit?.EshteNeOfert === "true";

        let isDiscounted = false;
        let discountType = "";

        // 1. Ofertë globale
        if (globalOffer && finalPrice < basePrice) {
          isDiscounted = true;
          discountType = "global";
        }
        // 2. Ofertë sipas kategorisë së klientit
        else if (categoryID > 0) {
          const categoryEntry = (p.QmimiProduktitPerKategori || []).find(
            (cp: any) => Number(cp.IdKategoritEPartnerit) === categoryID
          );
          if (categoryEntry?.EshteNeOfert === "true") {
            isDiscounted = true;
            discountType = "categoryOffer";
          }
          // 3. Çmim special për kategorinë (jo ofertë zyrtare, por më i ulët)
          else if (finalPrice < basePrice && finalPrice > 0) {
            isDiscounted = true;
            discountType = "categoryDiscount";
          }
        }

        return {
          ...p,
          QmimiFinal: finalPrice,
          isDiscounted,
          discountType,
        };
      })
      // Vetëm ato me zbritje
      .filter((p: any) => p.isDiscounted)
      // Rendit sipas ID (më të rejat së pari)
      .sort((a: any, b: any) => b.ProduktiID - a.ProduktiID)
      // Max 15 produkte
      .slice(0, 15);

    setProducts(discountedProducts as Produkti[]);
  }, [categoryID]);

  return (
    <>
      <Titulli titulli="Ballina" />

      <div className="min-h-screen bg-gray-50">
        {/* HERO – I njëjti */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/grid.svg')]"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
            <div className="flex flex-col items-center">
              {businessData.business.Logo && (
                <img
                  src={`/img/web/${businessData.business.Logo}`}
                  alt={businessData.business.EmriIBiznesit}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain mb-6 rounded-xl shadow-2xl border-4 border-white/20"
                />
              )}

              <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                {businessData.business.EmriIBiznesit}
              </h1>

              <p className="text-xl md:text-2xl font-light mt-4 opacity-90 tracking-wide">
                {businessData.business.Adresa}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              className="w-full h-20 md:h-32 text-gray-50"
              preserveAspectRatio="none">
              <path
                fill="currentColor"
                d="M0,0 C360,80 1080,80 1440,0 L1440,120 L0,120 Z"
              />
            </svg>
          </div>
        </section>

        {/* OFERTAT E VEÇANTA */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl font-medium">
                Momentalisht nuk ka oferta aktive.
              </p>
              <a href="/products" className="mt-6 inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                Shiko të gjitha produktet
              </a>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-red-600 animate-pulse text-4xl">★</span>
                  Ofertat e veçanta për ty
                </h2>
                <a
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 transition-colors">
                  Shiko të gjitha
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.ProduktiID} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
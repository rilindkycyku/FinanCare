// src/pages/Home.tsx - Shows only products with active Rabati discounts (max 15)
import { useEffect, useState } from "react";
import productsData from "../data/products.json";
import businessData from "../data/business.json";
import ProductCard from "../components/ProductCard";
import { getDisplayPrice } from "../context/CartContext";
import type { Produkti } from "../types";
import Titulli from "../components/Titulli";

// Helper to check if product discount is active
// Product is on offer if: Rabati > 0 AND not expired
const isProductDiscountActive = (product: any): boolean => {
  const discount = product.ZbritjaQmimitProduktit;
  
  if (!discount || discount.Rabati <= 0) return false;
  
  if (discount.DataSkadimit) {
    const expiryDate = new Date(discount.DataSkadimit);
    const now = new Date();
    if (now > expiryDate) return false;
  }
  
  return true;
};

export default function Home() {
  const [products, setProducts] = useState<Produkti[]>([]);

  useEffect(() => {
    const activeProducts = productsData.filter((p: any) => p.isDeleted !== "true");

    const discountedProducts = activeProducts
      .map((p: any) => {
        const finalPrice = getDisplayPrice(p);
        const basePrice = Number(p.StokuQmimiProduktit?.QmimiProduktit ?? 0);
        
        // Check if product has active discount (Rabati > 0 and not expired)
        const hasActiveDiscount = isProductDiscountActive(p);
        const discountPercentage = hasActiveDiscount 
          ? Number(p.ZbritjaQmimitProduktit?.Rabati ?? 0)
          : 0;

        return {
          ...p,
          QmimiFinal: finalPrice,
          isDiscounted: hasActiveDiscount,
          discountPercentage,
        };
      })
      // Only show products with active discounts (Rabati > 0 and not expired)
      .filter((p: any) => p.isDiscounted)
      // Sort by newest first
      .sort((a: any, b: any) => b.ProduktiID - a.ProduktiID)
      // Show max 15 products
      .slice(0, 15);

    setProducts(discountedProducts as Produkti[]);
  }, []);

  return (
    <>
      <Titulli titulli="Ballina" />

      <div className="min-h-screen bg-gray-50">
        {/* HERO SECTION */}
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

        {/* SPECIAL OFFERS SECTION - Only shows products with Rabati > 0 and not expired */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl font-medium">
                Momentalisht nuk ka oferta aktive.
              </p>
              <a
                href="/products"
                className="mt-6 inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                Shiko të gjitha produktet
              </a>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-red-600 animate-pulse text-4xl">🔥</span>
                  Ofertat e veçanta për ty
                </h2>
                <a
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 transition-colors">
                  Shiko të gjitha
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
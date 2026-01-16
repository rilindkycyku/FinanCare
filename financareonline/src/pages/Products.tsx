// src/pages/Products.tsx
import { useEffect, useState, useMemo } from "react";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import ProductCard from "../components/ProductCard";
import { getDisplayPrice } from "../context/CartContext";
import type { Produkti } from "../types/index";
import Titulli from "../components/Titulli";
import { Search } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Produkti[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const activeProducts = productsData.filter((p) => p.isDeleted !== "true");
    
    const enhancedProducts: Produkti[] = activeProducts.map((product) => {
      const finalPrice = getDisplayPrice(product);
      const basePrice = Number(product.StokuQmimiProduktit?.QmimiProduktit ?? 0);
      
      // Check if product has active discount (Rabati > 0 and not expired)
      const discount = product.ZbritjaQmimitProduktit;
      let hasActiveDiscount = false;
      let discountPercentage = 0;
      
      if (discount && discount.Rabati > 0) {
        // Check if not expired
        if (!discount.DataSkadimit) {
          hasActiveDiscount = true;
          discountPercentage = discount.Rabati;
        } else {
          const expiryDate = new Date(discount.DataSkadimit);
          const now = new Date();
          if (now <= expiryDate) {
            hasActiveDiscount = true;
            discountPercentage = discount.Rabati;
          }
        }
      }
      
      return {
        ...product,
        QmimiFinal: finalPrice,
        isDiscounted: hasActiveDiscount,
        discountPercentage,
      };
    }) as Produkti[];
    
    setProducts(enhancedProducts);
    setCategories(categoriesData);
  }, []);

  const filtered = useMemo(() => {
    let result = products;

    // Filter by category
    if (filter !== 0) {
      result = result.filter((p) => Number(p.IDGrupiProduktit) === filter);
    }

    // Search by name or barcode
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.EmriProduktit.toLowerCase().includes(term) ||
          p.Barkodi?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, filter, searchTerm]);

  return (
    <>
      <Titulli titulli="Produktet" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* SEARCH + CATEGORY FILTER */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* CATEGORY DROPDOWN */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-xl lg:rounded-2xl px-6 py-4 pr-12 shadow-md font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 cursor-pointer transition-all w-full sm:w-64">
                <option value={0}>Të gjitha kategoritë</option>
                {categories.map((cat) => (
                  <option key={cat.IDGrupiProduktit} value={cat.IDGrupiProduktit}>
                    {cat.GrupiIProduktit}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko produktin ose barkodin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-xl lg:rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-md text-base lg:text-lg font-medium transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-20 text-xl font-medium">
              Nuk u gjetën produkte.
            </p>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.ProduktiID} product={product} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
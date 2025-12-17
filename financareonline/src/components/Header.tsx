import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, LogOut, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import businessData from "../data/business.json";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const menuItems = (
    <>
      <Link to="/" className="block py-2 px-4 hover:text-gray-200 transition">
        Home
      </Link>
      <Link to="/products" className="block py-2 px-4 hover:text-gray-200 transition">
        Produktet
      </Link>
      <Link
        to="/checkout"
        className="flex items-center gap-1 py-2 px-4 hover:text-gray-200 transition"
      >
        <ShoppingCart size={18} />
        <span>({cart.length})</span>
      </Link>
      {user ? (
        <div className="flex items-center gap-4 py-2 px-4">
          <Link to="/dashboard" className="hover:text-gray-200 transition">
            <User size={18} />
          </Link>
          <button
            onClick={logout}
            className="flex items-center hover:text-gray-200 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <Link to="/login" className="block py-2 px-4 hover:text-gray-200 transition">
          Login
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition">
         {businessData.business.EmriIBiznesit}
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">{menuItems}</nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-600 border-t border-blue-500">
          {menuItems}
        </div>
      )}
    </header>
  );
}

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="min-h-screen">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            </Routes>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={12}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#f1f5f9',
                  fontWeight: '700',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  boxShadow: '0 0 40px rgba(16,185,129,0.25), 0 25px 50px rgba(0,0,0,0.6)',
                  fontSize: '14px',
                  border: '1px solid rgba(16,185,129,0.25)',
                  backdropFilter: 'blur(20px)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#030712' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#030712' },
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
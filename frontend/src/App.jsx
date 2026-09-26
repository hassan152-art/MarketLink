import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { ScrollEffects } from './components/ScrollEffects';

import { Home } from './pages/Home';
import { Markets } from './pages/Markets';
import { MarketDetails } from './pages/MarketDetails';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Favorites } from './pages/Favorites';
import { Notifications } from './pages/Notifications';
import { WasteDashboard } from './pages/WasteDashboard';
import { APIDocs } from './pages/APIDocs';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MarketHeatmap } from './pages/MarketHeatmap';
import { PriceComparison } from './pages/PriceComparison';


export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans antialiased">
              <ScrollEffects />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/markets" element={<Markets />} />
                  <Route path="/markets/:id" element={<MarketDetails />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                  <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/waste-impact" element={<WasteDashboard />} />
                  <Route path="/api-docs" element={<APIDocs />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/market-heatmap" element={<MarketHeatmap />} />
                  <Route path="/compare" element={<PriceComparison />} />

                </Routes>
              </main>
              <AIAssistant />
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

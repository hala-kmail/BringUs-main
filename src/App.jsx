import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppDataProvider } from './contexts/AppDataContext';
import DynamicColors from './components/DynamicColors/DynamicColors';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Category from './pages/Category/Category';
import MobileCategories from './pages/MobileCategories/MobileCategories';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Wishlist from './pages/Wishlist/Wishlist';
import AlmostFinishedSale from './pages/AlmostFinishedSale/AlmostFinishedSale';
import AnnouncementBar from './components/AnnouncementBar/AnnouncementBar';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import Footer from './components/Footer';

import './App.css';

// Component to manage conditional rendering
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="App">
      <DynamicColors />
      {!isAuthPage && <AnnouncementBar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:categorySlug" element={<Category />} />
      
          <Route path="/mobile-categories" element={<MobileCategories />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/almost-finished-sale" element={<AlmostFinishedSale />} />
        </Routes>
      </div>
      {!isAuthPage && <BottomNavigation />}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppDataProvider>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <AppContent />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AppDataProvider>
  );
}

export default App;

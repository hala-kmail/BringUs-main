import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useStoreSlug from './hooks/useStoreSlug';
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
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';


import AlmostFinishedSale from './pages/AlmostFinishedSale/AlmostFinishedSale';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import Footer from './components/Footer';
import AdvertisementPopup from './components/AdvertisementPopup/AdvertisementPopup';

import { 
  performStorageCleanup, 
  CLEANUP_SCENARIOS, 
  hasUrlChanged as storageHasUrlChanged 
} from './utils/storageManager';

import './App.css';

// Component to manage conditional rendering
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const [previousUrl, setPreviousUrl] = useState(null);

  // Monitor URL changes and perform cleanup
  useEffect(() => {
    const currentUrl = window.location.href;
    
    // Check if URL has changed (different store)
    if (storageHasUrlChanged(currentUrl, previousUrl)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 URL changed - performing storage cleanup');
        console.log('📋 Previous URL:', previousUrl);
        console.log('📋 Current URL:', currentUrl);
      }
      
      // Clear all storage when switching stores
      performStorageCleanup(CLEANUP_SCENARIOS.STORE_SWITCH);
    }
    
    // Update previous URL
    setPreviousUrl(currentUrl);
  }, [location.pathname, previousUrl]);

  // Monitor authentication state changes
  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('authToken');
      const wasAuthenticated = sessionStorage.getItem('wasAuthenticated') === 'true';
      const isCurrentlyAuthenticated = !!token;
      
      // User logged out
      if (wasAuthenticated && !isCurrentlyAuthenticated) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚪 User logged out - performing storage cleanup');
        }
        
        // Clear storage but preserve essential items
        performStorageCleanup(CLEANUP_SCENARIOS.LOGOUT);
        
        // Update session storage
        sessionStorage.setItem('wasAuthenticated', 'false');
      }
      
      // User logged in
      if (!wasAuthenticated && isCurrentlyAuthenticated) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 User logged in - updating session state');
        }
        
        // Update session storage
        sessionStorage.setItem('wasAuthenticated', 'true');
        sessionStorage.setItem('loginTimestamp', Date.now().toString());
      }
    };
    
    // Check immediately
    checkAuthState();
    
    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up periodic check (every 5 seconds)
    const interval = setInterval(checkAuthState, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Initialize authentication state on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    sessionStorage.setItem('wasAuthenticated', token ? 'true' : 'false');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 App initialized - Auth state:', token ? 'authenticated' : 'guest');
    }
  }, []);

  return (
    <div className="App">
      <DynamicColors />
      
      <AdvertisementPopup />
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
         
          <Route path="/almost-finished-sale" element={<AlmostFinishedSale />} />
        </Routes>
      </div>
      {!isAuthPage && <BottomNavigation />}
      <Footer />
    </div>
  );
};

function App() {
  const { storeSlug, storeData, loading, error, initializeStore } = useStoreSlug();

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const routerProps = storeSlug ? { basename: `/${storeSlug}` } : {};

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        جاري تحميل المتجر...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#ef4444'
      }}>
        خطأ في تحميل المتجر: {error}
      </div>
    );
  }

  return (
    <AppDataProvider>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <Router key={storeSlug || 'root'} {...routerProps}>
              <Suspense fallback={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100vh',
                  fontSize: '1.2rem',
                  color: '#666'
                }}>
                  جاري التحميل...
                </div>
              }>
                <AppContent />
              </Suspense>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AppDataProvider>
  );
}

export default App;

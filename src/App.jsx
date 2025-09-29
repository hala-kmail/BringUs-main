import React, { useEffect, useMemo, useState, Suspense, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAffiliateInfo } from './hooks/useAffiliateInfo';
import useStoreSlug from './hooks/useStoreSlug';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppDataProvider } from './contexts/AppDataContext';
import DynamicColors from './components/DynamicColors/DynamicColors';
import MobileSearch from './components/MobileSearch/MobileSearch';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
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

// Create context for mobile search
const MobileSearchContext = createContext();

// Hook to use mobile search
const useMobileSearch = () => {
  const context = useContext(MobileSearchContext);
  if (!context) {
    throw new Error('useMobileSearch must be used within a MobileSearchProvider');
  }
  return context;
};

// Export the hook and utility functions
export { useMobileSearch, createAffiliateLink, getCurrentAffiliateCode, getCurrentAffiliateInfo };

// Utility function to extract affiliate code from URL
const extractAffiliateCode = (pathname) => {
  const affiliateMatch = pathname.match(/\/affiliate\/([^\/]+)/);
  return affiliateMatch ? affiliateMatch[1] : null;
};

// Utility function to get path without affiliate part
const getPathWithoutAffiliate = (pathname) => {
  const affiliateMatch = pathname.match(/\/affiliate\/[^\/]+(\/.*)?/);
  if (affiliateMatch) {
    return affiliateMatch[1] || '/home';
  }
  return pathname;
};

// Utility function to clear affiliate code from localStorage
const clearAffiliateCode = () => {
  localStorage.removeItem('affiliateCode');
 
};

// Utility function to check if current path is an affiliate path
const isAffiliatePath = (pathname) => {
  return pathname.includes('/affiliate/');
};

// Utility function to create links with affiliate code
const createAffiliateLink = (path, affiliateCode) => {
  if (affiliateCode) {
    return `/affiliate/${affiliateCode}${path}`;
  }
  return path;
};

// Utility function to get current affiliate code from URL
const getCurrentAffiliateCode = () => {
  // Try to get from localStorage first (for better persistence)
  try {
    const storedCode = localStorage.getItem('affiliateCode');
    if (storedCode) {
      return storedCode;
    }
  } catch (err) {
  }
  
  // Fallback to URL parsing
  const pathname = window.location.pathname;
  const affiliateMatch = pathname.match(/\/affiliate\/([^\/]+)/);
  return affiliateMatch ? affiliateMatch[1] : null;
};

// Utility function to get current affiliate info from localStorage
const getCurrentAffiliateInfo = () => {
  try {
    const storedInfo = localStorage.getItem('affiliateInfo');
    if (storedInfo) {
      return JSON.parse(storedInfo);
    }
  } catch (err) {
  }
  return null;
};

// Component to handle affiliate redirects
const AffiliateRedirect = ({ affiliateCode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { storeData } = useStoreSlug();
  
  // Get affiliate code from URL params if not passed as prop
  const actualAffiliateCode = affiliateCode || params.affiliateCode;
  
  // Fetch affiliate info using the hook
  const { affiliateInfo, loading: affiliateLoading, error: affiliateError } = useAffiliateInfo(actualAffiliateCode, storeData?._id);
  
  console.log('AffiliateRedirect component rendered:', {
    propAffiliateCode: affiliateCode,
    paramsAffiliateCode: params.affiliateCode,
    actualAffiliateCode,
    locationPathname: location.pathname,
    storeId: storeData?._id,
    affiliateInfo,
    affiliateLoading,
    affiliateError
  });
  
  useEffect(() => {
    // Store affiliate code in localStorage for tracking
    if (actualAffiliateCode) {
      localStorage.setItem('affiliateCode', actualAffiliateCode);    }
  }, [actualAffiliateCode]);
  
  // Redirect to home page with affiliate code
  useEffect(() => {
    // Normalize pathname by removing trailing slash
    const normalizedPathname = location.pathname.replace(/\/$/, '');
    const expectedPath = `/affiliate/${actualAffiliateCode}`;
    
    console.log('AffiliateRedirect useEffect triggered:', {
      actualAffiliateCode,
      locationPathname: location.pathname,
      normalizedPathname,
      expectedPath,
      shouldRedirect: actualAffiliateCode && normalizedPathname === expectedPath
    });
    
    if (actualAffiliateCode && normalizedPathname === expectedPath) {
      console.log('Redirecting affiliate root to home:', {
        from: location.pathname,
        to: `/affiliate/${actualAffiliateCode}/home`,
        affiliateCode: actualAffiliateCode
      });
      
      // Redirect to home page with affiliate code
      navigate(`/affiliate/${actualAffiliateCode}/home`, { replace: true });
    }
  }, [actualAffiliateCode, location.pathname, navigate]);
  
  // Show loading while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      جاري التوجيه...
    </div>
  );
};

// Component to wrap pages with affiliate code support
const AffiliateWrapper = ({ children }) => {
  const params = useParams();
  const affiliateCode = params.affiliateCode;
  const { storeData } = useStoreSlug();
  
  // Fetch affiliate info using the hook
  const { affiliateInfo, loading: affiliateLoading, error: affiliateError } = useAffiliateInfo(affiliateCode, storeData?._id);
  
  useEffect(() => {
    // Store affiliate code in localStorage for tracking
    if (affiliateCode) {
      localStorage.setItem('affiliateCode', affiliateCode);
      console.log('Affiliate code stored in wrapper:', affiliateCode);
    }
  }, [affiliateCode]);
  
  console.log('AffiliateWrapper rendered:', {
    affiliateCode,
    storeId: storeData?._id,
    affiliateInfo,
    affiliateLoading,
    affiliateError
  });
  
  // Pass affiliate code to children if they accept it as a prop
  const childrenWithAffiliate = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { affiliateCode });
    }
    return child;
  });
  
  return childrenWithAffiliate;
};

// Component to monitor affiliate state and clear when leaving affiliate context
const AffiliateStateMonitor = () => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const isCurrentlyAffiliate = isAffiliatePath(currentPath);
    
    // If we're not in an affiliate path but have affiliate code stored, clear it
    if (!isCurrentlyAffiliate) {
      try {
        const storedCode = localStorage.getItem('affiliateCode');
        if (storedCode) {
          console.log('Clearing affiliate code - no longer in affiliate context');
          localStorage.removeItem('affiliateCode');
        }
        
        // Also clear affiliate info from localStorage
        const storedAffiliateInfo = localStorage.getItem('affiliateInfo');
        if (storedAffiliateInfo) {
          console.log('Clearing affiliate info - no longer in affiliate context');
          localStorage.removeItem('affiliateInfo');
        }
      } catch (err) {
        console.warn('Could not clear affiliate data:', err);
      }
    }
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

function App() {
  const { storeSlug, storeData, loading, error, initializeStore } = useStoreSlug();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Check if current URL contains affiliate pattern
  const isAffiliateUrl = window.location.pathname.includes('/affiliate/');
  
  // Extract affiliate code if present
  const affiliateCode = extractAffiliateCode(window.location.pathname);
  
  // console.log('Affiliate URL detection:', {
  //   isAffiliateUrl,
  //   affiliateCode,
  //   currentPath: window.location.pathname
  // });
  
  // If it's an affiliate URL, we need to handle it differently
  const routerProps = storeSlug ? { basename: `/${storeSlug}` } : {};

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Component to manage conditional rendering - moved inside App function
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
          // console.log('🔄 URL changed - performing storage cleanup');
          // console.log('📋 Previous URL:', previousUrl);
          // console.log('📋 Current URL:', currentUrl);
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
            // console.log('🚪 User logged out - performing storage cleanup');
          }
          
          // Clear storage but preserve essential items
          performStorageCleanup(CLEANUP_SCENARIOS.LOGOUT);
          
          // Update session storage
          sessionStorage.setItem('wasAuthenticated', 'false');
        }
        
        // User logged in - keep affiliate code for order tracking
        if (!wasAuthenticated && isCurrentlyAuthenticated) {
          if (process.env.NODE_ENV === 'development') {
            // console.log('🔐 User logged in - keeping affiliate code for order tracking');
          }
        }
        
        // User logged in
        if (!wasAuthenticated && isCurrentlyAuthenticated) {
          if (process.env.NODE_ENV === 'development') {
            // console.log('🔐 User logged in - updating session state');
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
        // console.log('🚀 App initialized - Auth state:', token ? 'authenticated' : 'guest');
      }
    }, []);

    return (
      <div className="App">
        <DynamicColors />
        <AffiliateStateMonitor />
        
         <AdvertisementPopup /> 
        <div className="main-content">
          <Routes>
            {/* Affiliate routes - these will handle all affiliate URLs */}
            <Route path="/affiliate/:affiliateCode" element={
              <AffiliateRedirect />
            } />
            <Route path="/affiliate/:affiliateCode/home" element={
              <AffiliateWrapper>
                <Home />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/shop" element={
              <AffiliateWrapper>
                <Shop />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/category/:categorySlug" element={
              <AffiliateWrapper>
                <Category />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/mobile-categories" element={
              <AffiliateWrapper>
                <MobileCategories />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/product/:id" element={
              <AffiliateWrapper>
                <ProductDetail />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/cart" element={
              <AffiliateWrapper>
                <Cart />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/checkout" element={
              <AffiliateWrapper>
                <Checkout />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/wishlist" element={
              <AffiliateWrapper>
                <Wishlist />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/profile" element={
              <AffiliateWrapper>
                <Profile />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/orders" element={
              <AffiliateWrapper>
                <Orders />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/almost-finished-sale" element={
              <AffiliateWrapper>
                <AlmostFinishedSale />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/otp-verification" element={
              <AffiliateWrapper>
                <OTPVerification />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/forgot-password" element={
              <AffiliateWrapper>
                <ForgotPassword />
              </AffiliateWrapper>
            } />
            <Route path="/affiliate/:affiliateCode/reset-password" element={
              <AffiliateWrapper>
                <ResetPassword />
              </AffiliateWrapper>
            } />
            
            {/* Store-specific routes with slug */}
            <Route path="/:storeSlug" element={<Navigate to="/:storeSlug/home" replace />} />
            <Route path="/:storeSlug/home" element={<Home />} />
            <Route path="/:storeSlug/shop" element={<Shop />} />
            <Route path="/:storeSlug/category/:categorySlug" element={<Category />} />
            <Route path="/:storeSlug/mobile-categories" element={<MobileCategories />} />
            <Route path="/:storeSlug/product/:id" element={<ProductDetail />} />
            <Route path="/:storeSlug/cart" element={<Cart />} />
            <Route path="/:storeSlug/checkout" element={<Checkout />} />
            <Route path="/:storeSlug/wishlist" element={<Wishlist />} />
            <Route path="/:storeSlug/profile" element={<Profile />} />
            <Route path="/:storeSlug/orders" element={<Orders />} />
            <Route path="/:storeSlug/almost-finished-sale" element={<AlmostFinishedSale />} />
            <Route path="/:storeSlug/otp-verification" element={<OTPVerification />} />
            <Route path="/:storeSlug/forgot-password" element={<ForgotPassword />} />
            <Route path="/:storeSlug/reset-password" element={<ResetPassword />} />
            
            {/* Regular routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
        
        {/* Mobile Search - Available on all pages */}
        <MobileSearch 
          isOpen={isMobileSearchOpen} 
          onClose={handleMobileSearchClose}
        />
      </div>
    );
  };

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
    <AppDataProvider initialStoreData={storeData}>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <MobileSearchContext.Provider value={{
              isMobileSearchOpen,
              toggleMobileSearch: handleMobileSearchToggle,
              closeMobileSearch: handleMobileSearchClose
            }}>
              <Router 
                key={storeSlug || 'root'} 
                {...routerProps}
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
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
            </MobileSearchContext.Provider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AppDataProvider>
  );
}

export default App;

import React, { useEffect, useMemo, useState, Suspense, createContext, useContext, lazy, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAffiliateInfo } from './hooks/useAffiliateInfo';
import useStoreSlug from './hooks/useStoreSlug';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppDataProvider } from './contexts/AppDataContext';
import DynamicColors from './components/DynamicColors/DynamicColors';
import MobileSearch from './components/MobileSearch/MobileSearch';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import Footer from './components/Footer';
import AdvertisementPopup from './components/AdvertisementPopup/AdvertisementPopup';

// Lazy load page components
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const OTPVerification = lazy(() => import('./components/Auth/OTPVerification'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const Home = lazy(() => import('./pages/Home/Home'));
const Shop = lazy(() => import('./pages/Shop/Shop'));
const Category = lazy(() => import('./pages/Category/Category'));
const MobileCategories = lazy(() => import('./pages/MobileCategories/MobileCategories'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AlmostFinishedSale = lazy(() => import('./pages/AlmostFinishedSale/AlmostFinishedSale'));

import { 
  performStorageCleanup, 
  CLEANUP_SCENARIOS, 
  hasUrlChanged as storageHasUrlChanged 
} from './utils/storageManager';

import './App.css';

// Loading fallback component
const LoadingFallback = () => (
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
);

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

// Component to handle root path - redirect to admin panel
const RootRedirect = () => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const currentPort = window.location.port;
    const frontendPort = '5174';
    const adminUrl = 'https://admin.bring2.us';
    
    // If we're at root path on frontend port, redirect to admin
    if ((currentPath === '/' || currentPath === '') && (currentPort === frontendPort || (!currentPort && window.location.hostname === 'localhost'))) {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const fullAdminUrl = `${adminUrl}/${search}${hash}`;
      window.location.replace(fullAdminUrl);
      return;
    }
  }, [location.pathname]);
  
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

// Component to handle store slug redirects
const StoreSlugRedirect = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug } = params;
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Never handle root path - let RootRedirect handle it
    if (currentPath === '/' || currentPath === '') {
      // RootRedirect should handle this, but as a fallback redirect to /home
      navigate('/home', { replace: true });
      return;
    }
    
    // Only redirect if we have a valid store slug and we're not at root
    // Exclude known routes that should not be treated as store slugs
    const knownRoutes = ['home', 'shop', 'login', 'register', 'cart', 'checkout', 'wishlist', 'profile', 'orders', 'mobile-categories', 'almost-finished-sale', 'otp-verification', 'forgot-password', 'reset-password'];
    
    // If we have a store slug that's not a known route, redirect to /{storeSlug}/home
    if (storeSlug && !knownRoutes.includes(storeSlug)) {
      // Make sure we're at the exact path /{storeSlug} (no additional path segments)
      const pathParts = currentPath.split('/').filter(Boolean);
      if (pathParts.length === 1 && pathParts[0] === storeSlug) {
        navigate(`/${storeSlug}/home`, { replace: true });
      }
    }
  }, [storeSlug, navigate, location.pathname]);
  
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

  // Redirect root path to admin panel (backup in case index.html script didn't run)
  useEffect(() => {
    const currentPort = window.location.port;
    const currentPath = window.location.pathname;
    const frontendPort = '5174';
    const adminUrl = 'https://admin.bring2.us';
    
    // If we're at root path on frontend port, redirect to admin
    if ((currentPath === '/' || currentPath === '') && (currentPort === frontendPort || (!currentPort && window.location.hostname === 'localhost'))) {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const fullAdminUrl = `${adminUrl}/${search}${hash}`;
      window.location.replace(fullAdminUrl);
    }
  }, []); // Empty dependency array - run once on mount

  // Initialize store on mount
  useEffect(() => {
    initializeStore(true);
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
  
  // Don't use basename for root URL - it causes routing issues
  // Only use basename if we're already in a store slug context in the URL
  const currentPath = window.location.pathname;
  
  // Never use basename for root path - this prevents redirect issues
  let routerProps = {};
  if (currentPath !== '/' && currentPath !== '') {
    // Check if URL has a store slug (not a known route)
    const pathParts = currentPath.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    const knownRoutes = ['home', 'shop', 'category', 'product', 'cart', 'checkout', 'wishlist', 'profile', 'orders', 'login', 'register', 'almost-finished-sale', 'mobile-categories', 'affiliate', 'otp-verification', 'forgot-password', 'reset-password'];
    const hasStoreSlugInUrl = firstPart && !knownRoutes.includes(firstPart);
    
    // Only use basename if we have a store slug in the URL
    if (storeSlug && hasStoreSlugInUrl) {
      routerProps = { basename: `/${storeSlug}` };
    }
  }

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Component to manage conditional rendering - moved inside App function
  const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
          
          // Redirect to home page after logout
          navigate('/home');
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
    }, [navigate]);

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
            {/* Root route - must be first to prevent incorrect matching with store slug routes */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Affiliate routes - these will handle all affiliate URLs */}
            <Route path="/affiliate/:affiliateCode" element={
              <AffiliateRedirect />
            } />
            <Route path="/affiliate/:affiliateCode/home" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Home />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/shop" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Shop />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/category/:categorySlug" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Category />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/mobile-categories" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <MobileCategories />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/product/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <ProductDetail />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/cart" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Cart />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/checkout" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Checkout />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/wishlist" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Wishlist />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Profile />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/orders" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <Orders />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/almost-finished-sale" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <AlmostFinishedSale />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/otp-verification" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <OTPVerification />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/forgot-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <ForgotPassword />
                </AffiliateWrapper>
              </Suspense>
            } />
            <Route path="/affiliate/:affiliateCode/reset-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <AffiliateWrapper>
                  <ResetPassword />
                </AffiliateWrapper>
              </Suspense>
            } />
            
            {/* Store-specific routes with slug */}
            <Route path="/:storeSlug" element={<StoreSlugRedirect />} />
            <Route path="/:storeSlug/home" element={
              <Suspense fallback={<LoadingFallback />}>
                <Home />
              </Suspense>
            } />
            <Route path="/:storeSlug/shop" element={
              <Suspense fallback={<LoadingFallback />}>
                <Shop />
              </Suspense>
            } />
            <Route path="/:storeSlug/category/:categorySlug" element={
              <Suspense fallback={<LoadingFallback />}>
                <Category />
              </Suspense>
            } />
            <Route path="/:storeSlug/mobile-categories" element={
              <Suspense fallback={<LoadingFallback />}>
                <MobileCategories />
              </Suspense>
            } />
            <Route path="/:storeSlug/product/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <ProductDetail />
              </Suspense>
            } />
            <Route path="/:storeSlug/cart" element={
              <Suspense fallback={<LoadingFallback />}>
                <Cart />
              </Suspense>
            } />
            <Route path="/:storeSlug/checkout" element={
              <Suspense fallback={<LoadingFallback />}>
                <Checkout />
              </Suspense>
            } />
            <Route path="/:storeSlug/wishlist" element={
              <Suspense fallback={<LoadingFallback />}>
                <Wishlist />
              </Suspense>
            } />
            <Route path="/:storeSlug/profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            } />
            <Route path="/:storeSlug/orders" element={
              <Suspense fallback={<LoadingFallback />}>
                <Orders />
              </Suspense>
            } />
            <Route path="/:storeSlug/almost-finished-sale" element={
              <Suspense fallback={<LoadingFallback />}>
                <AlmostFinishedSale />
              </Suspense>
            } />
            <Route path="/:storeSlug/otp-verification" element={
              <Suspense fallback={<LoadingFallback />}>
                <OTPVerification />
              </Suspense>
            } />
            <Route path="/:storeSlug/forgot-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/:storeSlug/reset-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ResetPassword />
              </Suspense>
            } />
            
            {/* Regular routes */}
            <Route path="/login" element={
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<LoadingFallback />}>
                <Register />
              </Suspense>
            } />
            <Route path="/otp-verification" element={
              <Suspense fallback={<LoadingFallback />}>
                <OTPVerification />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ResetPassword />
              </Suspense>
            } />
            <Route path="/home" element={
              <Suspense fallback={<LoadingFallback />}>
                <Home />
              </Suspense>
            } />
            <Route path="/shop" element={
              <Suspense fallback={<LoadingFallback />}>
                <Shop />
              </Suspense>
            } />
            <Route path="/category/:categorySlug" element={
              <Suspense fallback={<LoadingFallback />}>
                <Category />
              </Suspense>
            } />
        
            <Route path="/mobile-categories" element={
              <Suspense fallback={<LoadingFallback />}>
                <MobileCategories />
              </Suspense>
            } />
            <Route path="/product/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <ProductDetail />
              </Suspense>
            } />
            <Route path="/cart" element={
              <Suspense fallback={<LoadingFallback />}>
                <Cart />
              </Suspense>
            } />
            <Route path="/checkout" element={
              <Suspense fallback={<LoadingFallback />}>
                <Checkout />
              </Suspense>
            } />
            <Route path="/wishlist" element={
              <Suspense fallback={<LoadingFallback />}>
                <Wishlist />
              </Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            } />
            <Route path="/orders" element={
              <Suspense fallback={<LoadingFallback />}>
                <Orders />
              </Suspense>
            } />
           
            <Route path="/almost-finished-sale" element={
              <Suspense fallback={<LoadingFallback />}>
                <AlmostFinishedSale />
              </Suspense>
            } />
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
                <AppContent />
              </Router>
            </MobileSearchContext.Provider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AppDataProvider>
  );
}

export default App;

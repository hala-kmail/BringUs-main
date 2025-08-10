import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5001/api';

const useStoreSlug = () => {
  const [storeSlug, setStoreSlug] = useState('');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const hasInitialized = useRef(false);

  // Extract slug from URL path
  const extractSlugFromPath = useCallback(() => {
    try {
      const path = window.location.pathname;
      const pathParts = path.split('/').filter(Boolean);
      
      // If first part is a slug (not a known route), use it
      const knownRoutes = ['home', 'shop', 'category', 'product', 'cart', 'checkout', 'wishlist', 'profile', 'orders', 'login', 'register', 'almost-finished-sale', 'mobile-categories'];
      
      if (pathParts.length > 0 && !knownRoutes.includes(pathParts[0])) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Extracted slug from path:', pathParts[0], 'from path:', path);
        }
        return pathParts[0];
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 No slug found in path:', path);
      }
      return '';
    } catch (err) {
      console.error('Error extracting slug from path:', err);
      return '';
    }
  }, []);

  // Extract slug from subdomain
  const extractSlugFromSubdomain = useCallback(() => {
    try {
      const host = window.location.hostname || '';
      const parts = host.split('.');
      
      if (parts.length > 1) {
        const candidate = parts[0];
        if (candidate && candidate !== 'www' && candidate !== 'localhost') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Extracted slug from subdomain:', candidate);
          }
          return candidate;
        }
      }
      
      return '';
    } catch (err) {
      console.error('Error extracting slug from subdomain:', err);
      return '';
    }
  }, []);

  // Fetch store data by slug
  const fetchStoreBySlug = useCallback(async (slug) => {
    if (!slug) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 Fetching store data for slug:', slug);
      }

      const response = await fetch(`${API_BASE_URL}/stores/slug/${slug}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch store data');
      }

      if (data.success && data.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Store data fetched successfully:', data.data.nameAr || data.data.nameEn);
        }
        return data.data;
      } else {
        throw new Error('Invalid store data response');
      }
    } catch (err) {
      console.error('Error fetching store by slug:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current URL for comparison
  const getCurrentUrl = useCallback(() => {
    return window.location.href;
  }, []);

  // Check if URL has changed
  const hasUrlChanged = useCallback((newUrl) => {
    return newUrl !== currentUrl;
  }, [currentUrl]);

  // Initialize store slug and data
  const initializeStore = useCallback(async (forceRefresh = false) => {
    const newUrl = getCurrentUrl();
    const urlChanged = hasUrlChanged(newUrl);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Initializing store...', {
        newUrl,
        currentUrl,
        urlChanged,
        forceRefresh,
        hasInitialized: hasInitialized.current
      });
    }

    // Try to get slug from various sources
    let slug = '';
    
    // If URL changed or force refresh, prioritize URL over localStorage
    if (urlChanged || forceRefresh) {
      // 1. Try URL path first
      slug = extractSlugFromPath();
      
      // 2. Try subdomain if no slug in path
      if (!slug) {
        slug = extractSlugFromSubdomain();
      }
      
      // 3. Fallback to localStorage only if no slug in URL
      if (!slug) {
        try {
          slug = localStorage.getItem('storeSlug') || '';
        } catch (err) {
          console.warn('Could not read storeSlug from localStorage:', err);
        }
      }
    } else {
      // Normal initialization (first load)
      // 1. Try localStorage first
      try {
        slug = localStorage.getItem('storeSlug') || '';
      } catch (err) {
        console.warn('Could not read storeSlug from localStorage:', err);
      }
      
      // 2. Try URL path
      if (!slug) {
        slug = extractSlugFromPath();
      }
      
      // 3. Try subdomain
      if (!slug) {
        slug = extractSlugFromSubdomain();
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Determined slug:', slug, 'URL changed:', urlChanged);
    }

    if (slug) {
      // Check if slug actually changed
      if (slug !== storeSlug || urlChanged || forceRefresh) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Store slug changed:', { old: storeSlug, new: slug });
        }
        
        setStoreSlug(slug);
        
        // Save to localStorage
        try {
          localStorage.setItem('storeSlug', slug);
        } catch (err) {
          console.warn('Could not save storeSlug to localStorage:', err);
        }
        
        // Fetch store data
        const storeInfo = await fetchStoreBySlug(slug);
        if (storeInfo) {
          setStoreData(storeInfo);
          
          // Save store data to localStorage
          try {
            localStorage.setItem('storeData', JSON.stringify(storeInfo));
          } catch (err) {
            console.warn('Could not save storeData to localStorage:', err);
          }
          
          // Update current URL
          setCurrentUrl(newUrl);
          hasInitialized.current = true;
          
          return { slug, storeData: storeInfo };
        } else {
          // If fetch failed, clear the slug
          setStoreSlug('');
          setStoreData(null);
          return { slug: '', storeData: null };
        }
      } else {
        // Slug hasn't changed, just update URL
        setCurrentUrl(newUrl);
        return { slug, storeData };
      }
    } else {
      // No slug found
      setStoreSlug('');
      setStoreData(null);
      setCurrentUrl(newUrl);
      hasInitialized.current = true;
      return { slug: '', storeData: null };
    }
  }, [getCurrentUrl, hasUrlChanged, extractSlugFromPath, extractSlugFromSubdomain, fetchStoreBySlug, storeSlug, storeData]);

  // Monitor URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const newUrl = getCurrentUrl();
      if (hasUrlChanged(newUrl)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 URL changed, reinitializing store...', {
            from: currentUrl,
            to: newUrl
          });
        }
        initializeStore(true); // Force refresh
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(handleUrlChange, 0);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(handleUrlChange, 0);
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [getCurrentUrl, hasUrlChanged, currentUrl, initializeStore]);

  // Load store data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedSlug = localStorage.getItem('storeSlug');
        const storedData = localStorage.getItem('storeData');
        
        if (storedSlug && !storeSlug) {
          setStoreSlug(storedSlug);
        }
        
        if (storedData && !storeData) {
          try {
            const parsedData = JSON.parse(storedData);
            setStoreData(parsedData);
          } catch (err) {
            console.warn('Could not parse stored store data:', err);
          }
        }
      } catch (err) {
        console.warn('Could not load store data from localStorage:', err);
      }
    };
    
    loadFromStorage();
  }, [storeSlug, storeData]);

  // Update URL when slug changes (only for initial redirect)
  useEffect(() => {
    if (storeSlug && window.location.pathname === '/') {
      // Redirect to /{slug}/home if we're at root
      window.history.replaceState(null, '', `/${storeSlug}/home`);
    }
  }, [storeSlug]);

  return {
    storeSlug,
    storeData,
    loading,
    error,
    initializeStore,
    fetchStoreBySlug,
    extractSlugFromPath,
    extractSlugFromSubdomain,
  };
};

export default useStoreSlug;

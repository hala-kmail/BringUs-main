import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppDataContext = createContext();

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider = ({ children, initialStoreData = null }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(initialStoreData);
  const [categories, setCategories] = useState(null); // القيمة الأولية null
  const [products, setProducts] = useState([]);
  const [sliders, setSliders] = useState(null); // القيمة الأولية null
  const [userDiscount, setUserDiscount] = useState(null); // قيمة الخصم للمستخدم
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  // Load data from localStorage on app start
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Load user data
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - User loaded from localStorage:', userData);
          }
        }

        // Load user discount
        const storedUserDiscount = localStorage.getItem('userDiscount');
        if (storedUserDiscount) {
          const discountData = JSON.parse(storedUserDiscount);
          setUserDiscount(discountData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - User discount loaded from localStorage:', discountData);
          }
        }

        // Load store data
        const storedStore = localStorage.getItem('storeData');
        if (storedStore) {
          const storeData = JSON.parse(storedStore);
          setStore(storeData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - Store loaded from localStorage:', storeData);
          }
        }

        // Load categories data
        const storedCategories = localStorage.getItem('categoriesInfo');
        if (storedCategories) {
          const categoriesData = JSON.parse(storedCategories);
          setCategories(categoriesData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - Categories loaded from localStorage:', categoriesData);
          }
        }

        // Load products data
        const storedProducts = localStorage.getItem('productsInfo');
        if (storedProducts) {
          const productsData = JSON.parse(storedProducts);
          setProducts(productsData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - Products loaded from localStorage:', productsData.length, 'products');
          }
        }

        // Load all products data
        const storedAllProducts = localStorage.getItem('allProductsInfo');
        if (storedAllProducts) {
          const allProductsData = JSON.parse(storedAllProducts);
          setAllProducts(allProductsData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - All products loaded from localStorage:', allProductsData.length, 'products');
          }
        }

        // Load sliders data
        const storedSliders = localStorage.getItem('slidersInfo');
        if (storedSliders) {
          const slidersData = JSON.parse(storedSliders);
          setSliders(slidersData);
          if (process.env.NODE_ENV === 'development') {
            // console.log('AppData - Sliders loaded from localStorage:', slidersData.length, 'sliders');
          }
        }

        setIsLoading(false);
        setIsInitialized(true);
        if (process.env.NODE_ENV === 'development') {
          // console.log('AppData - Initialization completed');
        }
      } catch (error) {
        console.error('AppData - Error loading stored data:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  // Update store when initialStoreData changes
  useEffect(() => {
    if (initialStoreData && (!store || store._id !== initialStoreData._id)) {
      setStore(initialStoreData);
      localStorage.setItem('storeData', JSON.stringify(initialStoreData));
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Store updated from initialStoreData:', initialStoreData);
      }
    }
  }, [initialStoreData, store]);

  // Update user data
  const updateUser = (userData) => {
    console.log('updateUser called with:', userData);
    console.log('User addresses in updateUser:', userData?.addresses);
    
    if (userData && (userData._id || userData.id)) {
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      console.log('User data updated in state and localStorage');
      
      // Extract and store user discount if available
      if (userData.store && userData.store.discount !== undefined) {
        const discountInfo = {
          value: userData.store.discount,
          storeId: userData.store.id || userData.store._id,
          storeName: userData.store.nameAr || userData.store.nameEn,
          role: userData.role
        };
        setUserDiscount(discountInfo);
        localStorage.setItem('userDiscount', JSON.stringify(discountInfo));
        if (process.env.NODE_ENV === 'development') {
          // console.log('AppData - User discount updated:', discountInfo);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - User updated:', userData);
      }
    } else if (userData === null || userData === undefined) {
      // Only clear user if explicitly passed null/undefined
      setUser(null);
      setUserDiscount(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userDiscount');
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - User cleared');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Invalid user data, keeping current user');
      }
    }
  };

  // Update store data
  const updateStore = (storeData) => {
    setStore(storeData);
    if (storeData) {
      localStorage.setItem('storeData', JSON.stringify(storeData));
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Store updated:', storeData);
      }
    } else {
      localStorage.removeItem('storeData');
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Store cleared');
      }
    }
  };

  // Update categories data
  const updateCategories = (categoriesData) => {
    setCategories(categoriesData);
    if (categoriesData) {
      localStorage.setItem('categoriesInfo', JSON.stringify(categoriesData));
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Categories updated:', categoriesData);
      }
    } else {
      localStorage.removeItem('categoriesInfo');
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Categories cleared');
      }
    }
  };

  // Update products data
  const updateProducts = useCallback((productsData) => {
    setProducts(productsData);
    if (productsData) {
      localStorage.setItem('productsInfo', JSON.stringify(productsData));
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Products updated:', productsData.length, 'products');
      }
    } else {
      localStorage.removeItem('productsInfo');
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Products cleared');
      }
    }
  }, []);
  const updateAllProducts = useCallback((allProductsData) => {
    setAllProducts(allProductsData);
    if (allProductsData) {
      localStorage.setItem('allProductsInfo', JSON.stringify(allProductsData));
      // console.log('AppData - All products updated:', allProductsData);
    }
  }, []);
  // Update sliders data
  const updateSliders = (slidersData) => {
    setSliders(slidersData);
    if (slidersData) {
      localStorage.setItem('slidersInfo', JSON.stringify(slidersData));
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Sliders updated:', slidersData.length, 'sliders');
      }
    } else {
      localStorage.removeItem('slidersInfo');
      if (process.env.NODE_ENV === 'development') {
        // console.log('AppData - Sliders cleared');
      }
    }
  };

  // Clear all data (logout)
  const clearData = () => {
    setUser(null);
    setStore(null);
    setCategories(null);
    setProducts([]);
    setSliders(null);
    setUserDiscount(null);
    
    // Clear all localStorage items from AppDataContext
    localStorage.removeItem('userInfo');
    localStorage.removeItem('storeData');
    localStorage.removeItem('categoriesInfo');
    localStorage.removeItem('productsInfo');
    localStorage.removeItem('allProductsInfo');
    localStorage.removeItem('slidersInfo');
    localStorage.removeItem('userDiscount');
    
    // Clear items from tokenManager
    localStorage.removeItem('authToken');
    
    // Clear items from Register component
    localStorage.removeItem('register_firstName');
    localStorage.removeItem('register_lastName');
    localStorage.removeItem('register_phone');
    localStorage.removeItem('register_city');
    localStorage.removeItem('register_address');
    localStorage.removeItem('register_zipCode');
    localStorage.removeItem('register_country');
    localStorage.removeItem('user');
    
    // Clear items from Navbar/LanguageSwitcher
    localStorage.removeItem('i18nextLng');
    
    // Clear items from AdvertisementPopup
    localStorage.removeItem('shownAdvertisements');
    
    // Clear any other potential items that might be stored
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeLogo');
    localStorage.removeItem('token');
    localStorage.removeItem('userAvatar');
    
    if (process.env.NODE_ENV === 'development') {
      // console.log('AppData - All data cleared from localStorage');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    store,
    categories,
    products,
    allProducts,
    sliders, // تمرير السلايدر
    userDiscount, // قيمة الخصم للمستخدم
    isLoading,
    isInitialized,
    isAuthenticated,
    updateUser,
    updateStore,
    updateCategories,
    updateProducts,
    updateAllProducts,
    updateSliders, // تمرير الدالة
    clearData,
  };

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    // console.log('AppDataContext - Current state:', {
    //   user: user ? 'User exists' : 'No user',
    //   store: store ? `Store ID: ${store._id}` : 'No store',
    //   categories: categories ? `${categories.length} categories` : 'No categories',
    //   products: products?.length > 0 
    //   ? `${products.length} products` 
    //   : 'No products',
    
    //   sliders: sliders ? `${sliders.length} sliders` : 'No sliders',
    //   isLoading,
    //   isInitialized,
    //   isAuthenticated,
    //   userDiscount: userDiscount ? `Discount: ${userDiscount.value}` : 'No discount'
    // });
  }

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataContext; 
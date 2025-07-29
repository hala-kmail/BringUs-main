import React, { createContext, useContext, useState, useEffect } from 'react';

const AppDataContext = createContext();

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState(null); // القيمة الأولية null
  const [products, setProducts] = useState([]);
  const [sliders, setSliders] = useState(null); // القيمة الأولية null
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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
          console.log('AppData - User loaded from localStorage:', userData);
        }

        // Load store data
        const storedStore = localStorage.getItem('storeInfo');
        if (storedStore) {
          const storeData = JSON.parse(storedStore);
          setStore(storeData);
          console.log('AppData - Store loaded from localStorage:', storeData);
        }

        // Load categories data
        const storedCategories = localStorage.getItem('categoriesInfo');
        if (storedCategories) {
          const categoriesData = JSON.parse(storedCategories);
          setCategories(categoriesData);
          console.log('AppData - Categories loaded from localStorage:', categoriesData);
        }

        // Load products data
        const storedProducts = localStorage.getItem('productsInfo');
        if (storedProducts) {
          const productsData = JSON.parse(storedProducts);
          setProducts(productsData);
          console.log('AppData - Products loaded from localStorage:', productsData.length, 'products');
        }

        // Load sliders data
        const storedSliders = localStorage.getItem('slidersInfo');
        if (storedSliders) {
          const slidersData = JSON.parse(storedSliders);
          setSliders(slidersData);
          console.log('AppData - Sliders loaded from localStorage:', slidersData.length, 'sliders');
        }

        setIsLoading(false);
        setIsInitialized(true);
        console.log('AppData - Initialization completed');
      } catch (error) {
        console.error('AppData - Error loading stored data:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      console.log('AppData - User updated:', userData);
    } else {
      localStorage.removeItem('userInfo');
      console.log('AppData - User cleared');
    }
  };

  // Update store data
  const updateStore = (storeData) => {
    setStore(storeData);
    if (storeData) {
      localStorage.setItem('storeInfo', JSON.stringify(storeData));
      console.log('AppData - Store updated:', storeData);
    } else {
      localStorage.removeItem('storeInfo');
      console.log('AppData - Store cleared');
    }
  };

  // Update categories data
  const updateCategories = (categoriesData) => {
    setCategories(categoriesData);
    if (categoriesData) {
      localStorage.setItem('categoriesInfo', JSON.stringify(categoriesData));
      console.log('AppData - Categories updated:', categoriesData);
    } else {
      localStorage.removeItem('categoriesInfo');
      console.log('AppData - Categories cleared');
    }
  };

  // Update products data
  const updateProducts = (productsData) => {
    setProducts(productsData);
    if (productsData) {
      localStorage.setItem('productsInfo', JSON.stringify(productsData));
      console.log('AppData - Products updated:', productsData.length, 'products');
    } else {
      localStorage.removeItem('productsInfo');
      console.log('AppData - Products cleared');
    }
  };

  // Update sliders data
  const updateSliders = (slidersData) => {
    setSliders(slidersData);
    if (slidersData) {
      localStorage.setItem('slidersInfo', JSON.stringify(slidersData));
      console.log('AppData - Sliders updated:', slidersData.length, 'sliders');
    } else {
      localStorage.removeItem('slidersInfo');
      console.log('AppData - Sliders cleared');
    }
  };

  // Clear all data (logout)
  const clearData = () => {
    setUser(null);
    setStore(null);
    setCategories(null); // إعادة التعيين إلى null
    setProducts([]);
    setSliders(null); // إعادة التعيين إلى null
    localStorage.removeItem('userInfo');
    localStorage.removeItem('storeInfo');
    localStorage.removeItem('categoriesInfo');
    localStorage.removeItem('productsInfo');
    localStorage.removeItem('slidersInfo'); // حذف السلايدر عند تسجيل الخروج
    console.log('AppData - All data cleared');
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    store,
    categories,
    products,
    sliders, // تمرير السلايدر
    isLoading,
    isInitialized,
    isAuthenticated,
    updateUser,
    updateStore,
    updateCategories,
    updateProducts,
    updateSliders, // تمرير الدالة
    clearData,
  };

  console.log('AppDataContext - Current state:', {
    user: user ? 'User exists' : 'No user',
    store: store ? `Store ID: ${store._id}` : 'No store',
    storeColor: store?.settings?.mainColor || 'No color',
    storeSettings: store?.settings,
    categories: categories ? `${categories.length} categories` : 'No categories (or not fetched)',
    products: products.length > 0 ? `${products.length} products` : 'No products',
    sliders: sliders ? `${sliders.length} sliders` : 'No sliders (or not fetched)',
    isLoading,
    isInitialized,
    isAuthenticated
  });

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataContext; 
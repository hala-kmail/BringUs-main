import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useAppData } from '../../contexts/AppDataContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import MobileSearch from '../MobileSearch/MobileSearch';
import { getPriceByUserRole, getPriceWithUserDiscount, getUserDiscountPercentage, getCartTotalDiscount } from '../../utils/productUtils';
import { formatPrice } from '../../utils/currencyUtils';
import logo from '../../assets/logo_arabic-1.png';
import defaultStoreLogo from '../../assets/store-logo.png';
import LoginModal from '../Auth/LoginModal';
import useProducts from '../../hooks/useProducts';
import './Navbar.css';

const Navbar = () => {
  
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const location = useLocation();
  const currentLang = i18n.language;
  const { isAuthenticated, user, clearData, store } = useAppData();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { searchProducts, loading: productsLoading, products,variants, allProducts } = useProducts();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  // Mobile search modal state
  const [isMobileSearchModalOpen, setIsMobileSearchModalOpen] = useState(false);
  
  // Get store data from localStorage as fallback
  const getStoreFromStorage = () => {
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        return JSON.parse(storedStore);
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    return null;
  };
  
  const storeDataFinal = store || getStoreFromStorage();
  
  // Search placeholders
  const searchPlaceholders = [
    {
      en: "Search for your favorite products...",
      ar: "ابحث عن منتجاتك المفضلة..."
    },
    {
      en: "Looking for something specific?",
      ar: "تبحث عن شيء معين؟"
    },
    {
      en: "Find what you need in seconds...",
      ar: "اعثر على ما تحتاجه خلال ثوانٍ..."
    },
    {
      en: "Explore our latest collections...",
      ar: "تصفح أحدث مجموعاتنا..."
    },
    {
      en: "Type here to start shopping...",
      ar: "ابدأ التسوق بكتابة ما تريد..."
    },
    {
      en: "Discover exclusive offers...",
      ar: "اكتشف العروض الحصرية..."
    },
    {
      en: "Shop top-rated products...",
      ar: "تسوق المنتجات الأعلى تقييماً..."
    },
    {
      en: "What are you shopping for today?",
      ar: "ما الذي تبحث عنه اليوم؟"
    }
  ];
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [placeholders, setPlaceholders] = useState([]);
  
  // Refs
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const langRef = useRef(null);
  const userRef = useRef(null);

  // Languages configuration
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', langCode);
    setIsLanguageDropdownOpen(false);
  };

  // Get user name from user data or localStorage
  const getUserName = () => {
    if (user && user.name) {
      return user.name;
    }
    
    if (user && user.firstName) {
      return user.firstName;
    }
    
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.name || parsedUser.firstName || 'User';
      }
    } catch (err) {
      console.warn('Could not parse stored user data:', err);
    }
    
    return 'User';
  };

  const userName = getUserName();
  
  // Get wishlist count
  const wishlistCount = wishlistItems.length;
  
  // Force re-render when user data changes
  useEffect(() => {
    // This will trigger re-render when user data changes
    if (process.env.NODE_ENV === 'development') {
      // console.log('Navbar - User data changed:', { user, userName, isAuthenticated });
    }
  }, [user, userName, isAuthenticated]);
  
  // Debug user data changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      //  console.log('Navbar - User state updated:', { 
      //   user: user ? 'User exists' : 'No user',
      //   userName,
      //   isAuthenticated,
      //   localStorageUser: localStorage.getItem('userInfo')
      // });
    }
  }, [user, userName, isAuthenticated]);
  
  // Get cart totals
  const getCartTotals = () => {
    const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => {
      const price = getPriceByUserRole(item);
      return total + (price * item.quantity);
    }, 0);
    
    // تطبيق خصم المستخدم التاجر الجملة على توتال السلة (وليس على المنتجات الفردية)
    const userDiscount = getCartTotalDiscount(subtotal);
    const totalAfterUserDiscount = subtotal - userDiscount;
    
    return {
      itemsCount,
      subtotal,
      userDiscount,
      totalAfterUserDiscount
    };
  };
  
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(true);
  };
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    
    // Update URL params
    if (query.trim()) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('search', query.trim());
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('search');
        return newParams;
      });
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // console.log('🔍 Search submitted:', searchQuery.trim());
      // console.log('🔍 Store ID available:', !!storeDataFinal?._id);
      setShowSearchDropdown(true);
    }
  };

  // Handle product click from search results
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // Handle logout
  const handleLogout = () => {
    clearData();
    setIsUserDropdownOpen(false);
    
    // Redirect to home page after logout
    navigate('/home');
  };

  // Handle login button click
  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  // Handle login modal close
  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  // Handle switch to register
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    navigate('/register');
    // You can implement register modal opening here if needed
  };



  //-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    const fetchPlaceholders = async () => {
      try {

        const data = searchPlaceholders; 
        const formattedPlaceholders = data.map(item => item[currentLang] || item.en);
        setPlaceholders(formattedPlaceholders);
      } catch (error) {
        console.error('Error fetching placeholders:', error);
        // الرجوع إلى نصوص افتراضية في حالة الخطأ
        setPlaceholders(searchPlaceholders.map(item => item.en));
      }
    };

    fetchPlaceholders();
  }, [currentLang]);

//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
      // Monitor changes in store and user data - only log once per change
  if (process.env.NODE_ENV === 'development') {
    // console.log('Navbar - Store/User data changed:', {
    //   hasStore: !!storeDataFinal,
    //   hasUser: !!user
    // });
  }
  }, [storeDataFinal, user]);

//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    let interval;
    const currentPlaceholder = placeholders[placeholderIndex] || '';
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    if (isTyping) {
      if (displayedText.length < currentPlaceholder.length) {
        interval = setInterval(() => {
          setDisplayedText(currentPlaceholder.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        setTimeout(() => setIsTyping(false), pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        interval = setInterval(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
        setIsTyping(true);
      }
    }

    return () => clearInterval(interval);
  }, [displayedText, isTyping, placeholderIndex, placeholders]);
//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    let ignore = false;
    const doSearch = async () => {
      if (searchQuery.trim().length > 0) {
        setSearchResults([]);
        setShowSearchDropdown(true);
        
        try {
          // Search locally in existing products
          // console.log('🔍 Searching locally for:', searchQuery.trim());
          // console.log('🔍 Current language:', currentLang);
          // console.log('🔍 Available products count:', products?.length || 0);
          // console.log('🔍 All products:', allProducts);
          if (allProducts && Array.isArray(allProducts) ) {
            const filteredProducts = allProducts.filter(product => {
              const nameAr = product.nameAr?.toLowerCase() || '';
              const nameEn = product.nameEn?.toLowerCase() || '';
              const descriptionAr = product.descriptionAr?.toLowerCase() || '';
              const descriptionEn = product.descriptionEn?.toLowerCase() || '';
              
              // Clean search term by trimming spaces and converting to lowercase
              const searchTerm = searchQuery.trim().toLowerCase();
              
              // Search in basic product fields
              const basicMatch = nameAr.includes(searchTerm) || 
                                nameEn.includes(searchTerm) || 
                                descriptionAr.includes(searchTerm) || 
                                descriptionEn.includes(searchTerm);
              
              // Search in specifications
              let specMatch = false;
              if (product.specificationValues && Array.isArray(product.specificationValues)) {
                specMatch = product.specificationValues.some(spec => {
                  const specTitleAr = spec.titleAr?.toLowerCase() || '';
                  const specTitleEn = spec.titleEn?.toLowerCase() || '';
                  const specValueAr = spec.valueAr?.toLowerCase() || '';
                  const specValueEn = spec.valueEn?.toLowerCase() || '';
                  
                  return specTitleAr.includes(searchTerm) || 
                         specTitleEn.includes(searchTerm) || 
                         specValueAr.includes(searchTerm) || 
                         specValueEn.includes(searchTerm);
                });
              }
              
              // Search in variants if they exist
              let variantMatch = false;
              if (product.variants && Array.isArray(product.variants)) {
                variantMatch = product.variants.some(variant => {
                  const variantNameAr = variant.nameAr?.toLowerCase() || '';
                  const variantNameEn = variant.nameEn?.toLowerCase() || '';
                  const variantDescAr = variant.descriptionAr?.toLowerCase() || '';
                  const variantDescEn = variant.descriptionEn?.toLowerCase() || '';
                  
                  return variantNameAr.includes(searchTerm) || 
                         variantNameEn.includes(searchTerm) || 
                         variantDescAr.includes(searchTerm) || 
                         variantDescEn.includes(searchTerm);
                });
              }
              
              return basicMatch || specMatch || variantMatch;
            });
            
            // console.log('🔍 Found products locally:', filteredProducts.length);
            setSearchResults(filteredProducts.slice(0, 8));
          } else {
            // console.log('🔍 No products available for local search');
            setSearchResults([]);
          }
        } catch (error) {
          console.error('🔍 Local search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      doSearch();
    }, 300);
    
    return () => { 
      ignore = true; 
      clearTimeout(timeoutId);
    };
  }, [searchQuery, currentLang, products]);
//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    const handleClickOutside = (event) => {
    
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
       setIsUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
       }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

//-----------------------------------getCartTotals------------------------------------------------  
  const cartTotals = getCartTotals();
  const cartItemsCount = cartTotals.itemsCount;
  return (
    <>   <MobileSearch 
    isOpen={isMobileSearchOpen}
    onClose={handleMobileSearchClose}
    onSearch={handleSearch}
    searchQuery={searchQuery}
  />
    <nav className="navbar">
      <div className="navbar-container">
        {/*-----------------------------------Logo------------------------------------------------   */}
        <button onClick={() => navigate('/home')} className="navbar-logo">
          
          {storeDataFinal && storeDataFinal.logo.url ? (
            <img 
              src={storeDataFinal.logo.url} 
              alt={storeDataFinal.nameEn || storeDataFinal.nameAr || 'Store Logo'}
              onError={(e) => {
                console.log('Logo failed to load:', storeDataFinal.logo.url);
                e.target.src = defaultStoreLogo;
              }}
            />
          ) : (
            <img src={defaultStoreLogo} alt="Store Logo" />
          )}
          <span className="logo-text">
            {storeDataFinal ? currentLang==='ar'? (storeDataFinal.nameAr) : (storeDataFinal.nameEn) : 'Hala Store'}
          </span>
        </button>

        {/*-----------------------------------Desktop Search Bar------------------------------------------------   */}
        <div className="search-bar desktop-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder={displayedText}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(searchResults.length > 0)}
              aria-label={t('navbar.search_placeholder')}
            />
            <button type="submit" className="search-button" aria-label={t('navbar.search')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/*-----------------------------------Search Dropdown------------------------------------------------   */}
          {showSearchDropdown && (
            <div className="search-dropdown" ref={dropdownRef}>
              <div className="search-results">
                {productsLoading ? (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <p>{currentLang === 'ar' ? 'جاري البحث...' : 'Searching...'}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div 
                      key={product._id || product.id} 
                      className="search-result-item"
                      onClick={() => handleProductClick(product._id || product.id)}
                    >
                      <div className="result-image">
                        <img 
                          src={product.mainImage} 
                          alt={currentLang === 'ar' ? product.nameAr : product.nameEn}
                          onError={(e) => {
                            console.log('Product image failed to load:', product.mainImage);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="result-details">
                        <h4 className="result-name">
                          {currentLang === 'ar' ? product.nameAr : product.nameEn}
                        </h4>
                        <p className="result-description">
                          {currentLang === 'ar' ? product.descriptionAr : product.descriptionEn}
                        </p>
                        <div className="result-price">
                          {product.discountPercentage && product.discountPercentage > 0 && product.discountEndTime > new Date().toISOString() ? (
                            <>
                              <span className="original-price">{formatPrice(getPriceWithUserDiscount(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                              <span className="current-price">{formatPrice(getPriceByUserRole(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                            </>
                          ) : (
                            <span className="current-price">{formatPrice(getPriceByUserRole(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() && !productsLoading ? (
                  <div className="no-results">
                    <p>{currentLang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</p>
                  </div>
                ) : null}
              </div>
              {searchResults.length > 0 && (
                <div className="search-footer">
                  <button 
                    className="view-all-results"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                      setShowSearchDropdown(false);
                    }}
                  >
                    {currentLang === 'ar' ? `عرض جميع النتائج (${searchResults.length})` : `View all results (${searchResults.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/*-----------------------------------User Actions------------------------------------------------   */}
        <div className="user-actions">
          {/*-----------------------------------Mobile Search Button------------------------------------------------   */}
          <button className="mobile-search-trigger" onClick={handleMobileSearchToggle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>



              {/*-----------------------------------Language Selector------------------------------------------------   */}
          <div className="selector-dropdown"ref={langRef}>
            <button
              className="selector-button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              aria-expanded={isLanguageDropdownOpen}
              aria-controls="language-menu"
            >
              <span className="flag">{currentLanguage.flag}</span>
              <span className="language-name">{currentLanguage.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLanguageDropdownOpen && <div  id="language-menu" className={`dropdown-menu ${isLanguageDropdownOpen ? 'open-programmatically' : ''}`}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`dropdown-item ${i18n.language === language.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(language.code)}
                >
                  <span className="flag">{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>}
          </div>

          {/*-----------------------------------User Menu / Login Button------------------------------------------------   */}
          {isAuthenticated ? (
            <div className="selector-dropdown user-menu" ref={userRef}>
              <button
                className="selector-button user-button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-expanded={isUserDropdownOpen}
                aria-controls="user-menu-items"
              >
                <div className="user-avatar">
                  {userName.charAt(0)}
                </div>
                <span className="user-name">{userName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isUserDropdownOpen && <div  id="user-menu-items" className={`dropdown-menu ${isUserDropdownOpen ? 'open-programmatically' : ''}`}>
                <button onClick={() => navigate('/profile')} className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('navbar.profile')}
                </button>
                <button onClick={() => navigate('/orders')} className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('navbar.orders')}
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('navbar.logout')}
                </button>
              </div>}
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              <svg className="login-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
              <span className="login-text">{currentLang === 'ar' ? 'تسجيل الدخول' : 'Login'}</span>
            </button>
          )}

          {/*-----------------------------------Wishlist------------------------------------------------   */}
          <button onClick={() => navigate('/wishlist')} className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </div>
          </button>

            {/*-----------------------------------Cart------------------------------------------------   */}
          <button onClick={() => navigate('/cart')} className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && <span className="badge">{cartItemsCount}</span>}
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Search Modal */}
      {isMobileSearchModalOpen && (
        <div className="mobile-search-modal">
          <div className="mobile-search-modal-content">
           
            <form onSubmit={handleSearchSubmit} className="mobile-search-modal-form">
              <input
                type="text"
                className="mobile-search-modal-input"
                placeholder={displayedText}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="mobile-search-buttons">
  
                <button 
                  type="button" 
                  className="mobile-search-close-button"
                  onClick={() => setIsMobileSearchModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
            {/* {showSearchDropdown && searchResults.length > 0 && (
              <div className="mobile-search-results">
                {searchResults.map((product) => (
                  <div
                    key={`mobile-search-result-${product._id || product.id}`}
                    className="mobile-search-result-item"
                    
                    onClick={() => {
                      console.log('product clicked', product);
                      // setIsMobileSearchModalOpen(false);
                      // navigate(`/product/${product._id || product.id}`);
                      // handleProductClick(product._id || product.id);
                      
                    }}
                  >
                    <div className="mobile-result-image">
                      <img 
                        src={product.mainImage} 
                        alt={currentLang === 'ar' ? product.nameAr : product.nameEn}
                        onError={(e) => {
                          console.log('Mobile product image failed to load:', product.mainImage);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="mobile-result-details">
                      <h4 className="mobile-result-name">
                        {currentLang === 'ar' ? product.nameAr : product.nameEn}
                      </h4>
                      <p className="mobile-result-description">
                        {currentLang === 'ar' ? product.descriptionAr : product.descriptionEn}
                      </p>
                      <div className="mobile-result-price">
                        {product.discountPercentage && product.discountPercentage > 0 && product.discountEndTime > new Date().toISOString() ? (
                          <>
                            <span className="mobile-original-price">{formatPrice(getPriceWithUserDiscount(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                            <span className="mobile-current-price">{formatPrice(getPriceByUserRole(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                          </>
                        ) : (
                          <span className="mobile-current-price">{formatPrice(getPriceByUserRole(product), storeDataFinal?.settings?.currency || 'ILS')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </nav>
    </>
  );
};

export default Navbar;
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import logo from '../../assets/shopping-cart.png';
import './Navbar.css';
import { getEffectivePrice } from '../../utils/productUtils';
import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';
import useLogin from '../../hooks/useLogin';
import useProducts from '../../hooks/useProducts';
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


const Navbar = ({ onMobileSearchToggle, isMobileSearchOpen }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();
  const { getCartTotals } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const langRef = useRef(null);
  const userRef = useRef(null);
  const [placeholders, setPlaceholders] = useState([]);
  const currentLang = i18n.language;
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { logout } = useLogin();
  const { user, store, isAuthenticated, isLoading, isInitialized } = useAppData();
  
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
  
  const storeData = store || getStoreFromStorage(); 
  const { searchProducts, loading: productsLoading } = useProducts();
  
  // Get user name from user data or localStorage
  const getUserName = () => {
    if (user && user.firstName) {
      return user.firstName;
    }
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.firstName || 'Guest';
      } catch (err) {
        console.error('Error parsing stored user info:', err);
      }
    }
    return localStorage.getItem('register_name') || 'Guest';
  };
  
  const userName = getUserName();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', langCode); // حفظ اللغة المختارة
    setIsLanguageDropdownOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

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
      console.log('Navbar - Store/User data changed:', {
        hasStore: !!store,
        hasUser: !!user,
        isLoading,
        isInitialized
      });
    }
  }, [store, user, isLoading, isInitialized]);

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
        const result = await searchProducts(searchQuery);
        if (!ignore) {
          let filtered = [];
          if (result && result.products) {
            const query = searchQuery.trim().toLowerCase();
            filtered = result.products.filter(product => {
              // الاسم
              const nameAr = product.nameAr?.toLowerCase() || '';
              const nameEn = product.nameEn?.toLowerCase() || '';
              const nameObjAr = product.name?.ar?.toLowerCase() || '';
              const nameObjEn = product.name?.en?.toLowerCase() || '';
              // الوصف
              const descAr = product.descriptionAr?.toLowerCase() || '';
              const descEn = product.descriptionEn?.toLowerCase() || '';
              const descObjAr = product.description?.ar?.toLowerCase() || '';
              const descObjEn = product.description?.en?.toLowerCase() || '';
              // السعر
              const price = (product.finalPrice || product.originalPrice || product.price || '').toString();
              return (
                nameAr.includes(query) ||
                nameEn.includes(query) ||
                nameObjAr.includes(query) ||
                nameObjEn.includes(query) ||
                descAr.includes(query) ||
                descEn.includes(query) ||
                descObjAr.includes(query) ||
                descObjEn.includes(query) ||
                price.includes(query)
              );
            });
          }
          setSearchResults(filtered.slice(0, 8));
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };
    doSearch();
    return () => { ignore = true; };
  }, [searchQuery, currentLang, searchProducts]);
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

//-----------------------------------handleProductClick------------------------------------------------  
  const handleProductClick = (productId) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/product/${productId}`);
  };

//-----------------------------------handleSearchSubmit------------------------------------------------  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };
//-----------------------------------getCartTotals------------------------------------------------  
  const cartTotals = getCartTotals();
  const cartItemsCount = cartTotals.itemsCount;
//-----------------------------------handleLogout------------------------------------------------  
  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/login');
  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/*-----------------------------------Logo------------------------------------------------   */}
        <Link to="/home" className="navbar-logo">
          {storeData && storeData.logo ? (
            <img src={storeData.logo.url} alt={storeData.nameEn || storeData.nameAr || 'Store Logo'} />
          ) : (
            <img src={logo} alt="Hala Store" />
          )}
          <span className="logo-text">
            {storeData ? currentLang==='ar'? (storeData.nameAr) : (storeData.nameEn) : 'Hala Store'}
          </span>
        </Link>

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
                {searchResults.map((product) => (
                  <div 
                    key={product.id} 
                    className="search-result-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="result-image">
                      <img src={product.mainImage} alt={
                        (product.name && typeof product.name === 'object' && product.name[currentLang]) ||
                        product.nameAr || product.nameEn || ''
                      } />
                    </div>
                    <div className="result-details">
                      <h4 className="result-name">{
                        (product.name && typeof product.name === 'object' && product.name[currentLang]) ||
                        product.nameAr || product.nameEn || ''
                      }</h4>
                      <p className="result-description">{
                        (product.description && typeof product.description === 'object' && product.description[currentLang]) ||
                        product.descriptionAr || product.descriptionEn || ''
                      }</p>
                      <div className="result-price">
                        {product.discountPercentage && product.discountPercentage > 0 && product.discountEndTime > new Date().toISOString() ? (
                        <> <span className="original-price">{formatPrice(product.originalPrice, storeData?.settings?.currency || 'ILS')}</span>
                         <span className="current-price">{formatPrice(getEffectivePrice(product), storeData?.settings?.currency || 'ILS')}</span>  </>
                        ) : (  <span className="current-price">{formatPrice(getEffectivePrice(product), storeData?.settings?.currency || 'ILS')}</span> 
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
          <button className="mobile-search-trigger" onClick={onMobileSearchToggle}>
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
              <span>{currentLanguage.name}</span>
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
                <Link to="/profile" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('navbar.profile')}
                </Link>
                <Link to="/orders" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('navbar.orders')}
                </Link>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('navbar.logout')}
                </button>
              </div>}
            </div>
          ) : (
            <Link to="/login" className="login-button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {currentLang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
          )}

          {/*-----------------------------------Wishlist------------------------------------------------   */}
          <Link to="/wishlist" className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </div>
          </Link>

            {/*-----------------------------------Cart------------------------------------------------   */}
          <Link to="/cart" className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && <span className="badge">{cartItemsCount}</span>}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
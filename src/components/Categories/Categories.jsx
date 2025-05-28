import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  categories, 
  subcategories, 
  getProductsByCategory, 
  getProductsBySubcategory,
  getSubcategoriesByCategory 
} from '../../data/index';
import './Categories.css';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const currentLang = i18n.language;

  // خريطة ربط معرفات الفئات بأسمائها للتوافق مع الروابط الموجودة
  const categorySlugMapping = {
    1: 'fruits-vegetables',
    2: 'meats-seafood',
    3: 'breakfast-dairy',
    4: 'breads-bakery',
    5: 'beverages',
    6: 'frozen-foods',
    7: 'biscuits-snacks',
    8: 'grocery-staples',
    9: 'household-needs',
    10: 'healthcare',
    11: 'baby-pregnancy'
  };

  // خريطة عكسية للحصول على ID من slug
  const slugToCategoryId = Object.fromEntries(
    Object.entries(categorySlugMapping).map(([id, slug]) => [slug, parseInt(id)])
  );

  // خريطة ربط الفئات الفرعية بـ slugs
  const subcategorySlugMapping = {
    1: 'fresh-fruits',
    2: 'fresh-vegetables', 
    3: 'fresh-meat',
    4: 'seafood',
    5: 'dairy-products',
    6: 'breakfast-items',
    7: 'fresh-bread',
    8: 'pastries',
    9: 'hot-beverages',
    10: 'cold-beverages',
    11: 'frozen-meals',
    12: 'frozen-desserts',
    13: 'cookies-biscuits',
    14: 'nuts-snacks',
    15: 'cooking-essentials',
    16: 'grains-rice',
    17: 'cleaning-supplies',
    18: 'paper-products',
    19: 'vitamins-supplements',
    20: 'personal-care',
    21: 'baby-care',
    22: 'baby-food'
  };

  // دالة للتحقق من وجود منتجات في فئة فرعية معينة
  const hasProductsInSubcategory = (subcategoryId) => {
    const products = getProductsBySubcategory(subcategoryId);
    return products.length > 0;
  };

  // دالة للتحقق من وجود منتجات في فئة رئيسية
  const hasProductsInCategory = (categoryId) => {
    const products = getProductsByCategory(categoryId);
    return products.length > 0;
  };

  // تصفية الفئات الفرعية لإظهار فقط التي تحتوي على منتجات
  const getFilteredSubcategories = (categoryId) => {
    const categorySubcategories = getSubcategoriesByCategory(categoryId);
    return categorySubcategories.filter(subcategory => 
      hasProductsInSubcategory(subcategory.id)
    );
  };

  // تصفية الفئات الرئيسية لإظهار فقط التي تحتوي على منتجات
  const getFilteredMainCategories = () => {
    return categories.filter(category => hasProductsInCategory(category.id));
  };

  // دالة مساعدة لإخفاء جميع القوائم الفرعية
  const hideAllSubcategories = () => {
    const allCategoryItems = document.querySelectorAll('.category-main-item');
    allCategoryItems.forEach(item => {
      item.classList.remove('show-subcategories');
    });
    setActiveCategory(null);
  };

  const toggleDropdown = () => {
    if (isDropdownOpen && hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    // إخفاء جميع القوائم الفرعية عند إغلاق القائمة
    if (isDropdownOpen) {
      hideAllSubcategories();
    }
    
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategoryClick = (categoryId) => {
    setIsDropdownOpen(false);
    const categorySlug = categorySlugMapping[categoryId];
    navigate(`/category/${categorySlug}`);
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    setIsDropdownOpen(false);
    const categorySlug = categorySlugMapping[categoryId];
    const subcategorySlug = subcategorySlugMapping[subcategoryId];
    navigate(`/category/${categorySlug}/${subcategorySlug}`);
  };

  const handleCategoryMouseEnter = (event, categoryId) => {
    // التحقق من وجود فئات فرعية قبل المتابعة
    const filteredSubcategories = getFilteredSubcategories(categoryId);
    if (filteredSubcategories.length === 0) {
      return; // لا تفعل شيئاً إذا لم تكن هناك فئات فرعية
    }

    // إلغاء أي timeout موجود
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    // إخفاء جميع القوائم الفرعية الأخرى
    hideAllSubcategories();

    // تحديث الفئة النشطة
    setActiveCategory(categoryId);

    const categoryElement = event.currentTarget;
    const rect = categoryElement.getBoundingClientRect();
    const subcategoriesPanel = categoryElement.querySelector('.subcategories-panel');
    
    if (subcategoriesPanel) {
      const isRTL = currentLang === 'ar';
      
      if (isRTL) {
        subcategoriesPanel.style.left = (rect.left - 320 - 10) + 'px';
      } else {
        subcategoriesPanel.style.left = (rect.right + 10) + 'px';
      }
      subcategoriesPanel.style.top = rect.top + 'px';
      
      // إضافة class لإظهار اللوحة الفرعية
      categoryElement.classList.add('show-subcategories');
    }
  };

  const handleCategoryMouseLeave = (event) => {
    // تأخير إخفاء القائمة للسماح بالانتقال إليها
    const timeout = setTimeout(() => {
      const categoryElement = event.currentTarget.closest('.category-main-item');
      if (categoryElement) {
        categoryElement.classList.remove('show-subcategories');
        // مسح الفئة النشطة
        setActiveCategory(null);
      }
    }, 300);
    
    setHideTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  // إخفاء القائمة المنسدلة عند النقر خارجها أو الضغط على Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      const categoriesWrapper = document.querySelector('.categories-wrapper');
      if (categoriesWrapper && !categoriesWrapper.contains(event.target)) {
        // إغلاق القائمة المنسدلة الرئيسية
        setIsDropdownOpen(false);
        // إخفاء جميع القوائم الفرعية
        hideAllSubcategories();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        hideAllSubcategories();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // أيقونات الفئات
  const getCategoryIcon = (categoryId) => {
    const icons = {
      1: ( // Fruits & Vegetables
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      2: ( // Meats & Seafood
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      3: ( // Breakfast & Dairy
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      4: ( // Breads & Bakery
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 013 15.546V9.75A4.5 4.5 0 017.5 5.25h9A4.5 4.5 0 0121 9.75v5.796z" />
        </svg>
      ),
      5: ( // Beverages
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      6: ( // Frozen Foods
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      7: ( // Biscuits & Snacks
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      8: ( // Grocery & Staples
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      9: ( // Household Needs
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      10: ( // Healthcare
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      11: ( // Baby & Pregnancy
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    };
    return icons[categoryId] || null;
  };

  return (
    <div className="categories-wrapper">
      <div className="categories-main">
        <button 
          className="categories-btn"
          onClick={toggleDropdown}
        >
          <span className="categories-icon">☰</span>
          <span className="categories-label">{t('categories.all_categories')}</span>
          <span className={`categories-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isDropdownOpen && (
          <div className="categories-dropdown">
            <div className="categories-dropdown-inner">
              {getFilteredMainCategories().map((category) => {
                const filteredSubcategories = getFilteredSubcategories(category.id);
                
                return (
                  <div
                    key={category.id}
                    className="category-main-item"
                    data-category={category.id}
                    onMouseEnter={(e) => handleCategoryMouseEnter(e, category.id)}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <button
                      className={`category-btn ${filteredSubcategories.length === 0 ? 'no-subcategories' : ''}`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="category-icon">{getCategoryIcon(category.id)}</div>
                      <span className="category-text">{category.name[currentLang]}</span>
                      {/* إظهار السهم فقط إذا كانت هناك فئات فرعية تحتوي على منتجات */}
                      {filteredSubcategories.length > 0 && (
                        <span className="category-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                      )}
                    </button>

                    {/* القائمة الفرعية - تظهر فقط إذا كانت تحتوي على منتجات */}
                    {filteredSubcategories.length > 0 && (
                      <div 
                        className="subcategories-panel"
                        onMouseEnter={(e) => {
                          // إلغاء أي timeout موجود
                          if (hideTimeout) {
                            clearTimeout(hideTimeout);
                            setHideTimeout(null);
                          }
                          // التأكد من أن هذه الفئة هي النشطة
                          setActiveCategory(category.id);
                          e.currentTarget.closest('.category-main-item').classList.add('show-subcategories');
                        }}
                        onMouseLeave={(e) => {
                          // تأخير إخفاء القائمة عند مغادرة القائمة الفرعية
                          const timeout = setTimeout(() => {
                            const categoryElement = e.currentTarget.closest('.category-main-item');
                            if (categoryElement) {
                              categoryElement.classList.remove('show-subcategories');
                              setActiveCategory(null);
                            }
                          }, 300);
                          setHideTimeout(timeout);
                        }}
                      >
                        <div className="subcategories-header">
                          <h3>{category.name[currentLang]}</h3>
                        </div>
                        <div className="subcategories-list">
                          {filteredSubcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              className="subcategory-btn"
                              onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                            >
                              {subcategory.name[currentLang]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 
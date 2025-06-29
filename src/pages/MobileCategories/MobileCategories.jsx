import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { 
  allProducts, 
  categories,  
  getProductsByCategory, 
  getProductsBySubcategory, 
  getSubCategories, 
  getMainCategories
} from '../../data/index';
import './MobileCategories.css';

const MobileCategories = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categorySubcategories, setCategorySubcategories] = useState([]);

  const currentLang = i18n.language;

  // خريطة ربط معرفات الفئات بأسمائها للروابط
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

  // Subcategory mapping for URL slugs to IDs
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

  // دالة للتحقق من وجود منتجات في فئة
  const hasProductsInCategory = (categoryId) => {
    const products = getProductsByCategory(categoryId);
    return products.length > 0;
  };

  // دالة للتحقق من وجود منتجات في فئة فرعية معينة
  const hasProductsInSubcategory = (subcategoryId) => {
    const products = getProductsBySubcategory(subcategoryId);
    return products.length > 0;
  };

  // تصفية الفئات لإظهار فقط الفئات الرئيسية التي تحتوي على منتجات
  const getFilteredMainCategories = () => {
    // الفئات الرئيسية فقط
    console.log(getMainCategories());
    return getMainCategories().filter(category => hasProductsInCategory(category.id));
  };

  // دالة لجلب الفئات الفرعية لفئة معينة
  const getCategorySubcategories = (categoryId) => {
    const subCategories = getSubCategories(categoryId); // فقط الفروع المباشرة
    // تصفية الفئات الفرعية لإظهار فقط التي تحتوي على منتجات
    return subCategories.filter(subcategory => hasProductsInSubcategory(subcategory.id));
  };

  // دالة لجلب جميع الفئات الفرعية من جميع الفئات الرئيسية (تستخدم فقط عند اختيار الكل)
  const getAllSubcategories = () => {
    let allSubCategories = [];
    getMainCategories().forEach(mainCat => {
      const subCats = getSubCategories(mainCat.id);
      allSubCategories = allSubCategories.concat(subCats);
    });
    return allSubCategories.filter(subcategory => hasProductsInSubcategory(subcategory.id));
  };

  // تحديد خيار "الكل" كافتراضي
  useEffect(() => {
    if (selectedCategory === 'all') {
      setCategorySubcategories(getAllSubcategories());
    }
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setCategorySubcategories(getAllSubcategories());
    } else {
      setCategorySubcategories(getCategorySubcategories(categoryId));
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/shop'); // الانتقال لصفحة المتجر عند النقر على "عرض الكل"
    } else {
      const categorySlug = categorySlugMapping[categoryId];
      if (categorySlug) {
        navigate(`/category/${categorySlug}`);
      }
    }
  };

  const handleSubcategoryClick = (subcategoryId) => {
    // البحث عن الفئة الفرعية من قائمة categories
    const subcategory = categories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      // جلب الفئة الرئيسية
      const mainCategory = categories.find(cat => cat.id === subcategory.parentCategoryId);
      if (mainCategory && mainCategory.slug && subcategory.slug) {
        navigate(`/category/${mainCategory.slug[currentLang]}/${subcategory.slug[currentLang]}`);
      }
    }
  };

  // دالة للحصول على اسم القسم المحدد
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') {
      return t('categories.all_categories');
    }
    return getMainCategories().find(cat => cat.id === selectedCategory)?.name[currentLang];
  };

  // دالة للحصول على نص الزر "عرض الكل"
  const getViewAllText = () => {
    if (selectedCategory === 'all') {
      return t('shop.browse_all_products');
    }
    return t('new_arrivals.view_all');
  };

  const filteredMainCategories = getFilteredMainCategories();

  return (
    <div className="mobile-categories-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mobile-categories-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
        <h1 className="page-title">{t('categories.title')}</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content */}
      <div className="mobile-categories-content">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          {/* خيار الكل */}
          <button
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('all')}
          >
            <span className="category-name">{t('categories.all_categories')}</span>
          </button>
          
          {/* باقي الفئات */}
          {getMainCategories().map((category) => (
            <button
              key={category.id}
              className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="category-name">{category.name[currentLang]}</span>
            </button>
          ))}
        </div>

        {/* Subcategories Grid */}
        <div className="subcategories-section">
              <div className="section-header">
                <h2 className="section-title">
              {getSelectedCategoryName()}
                </h2>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCategoryClick(selectedCategory)}
                >
              {getViewAllText()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

          <div className="subcategories-grid">
            {categorySubcategories.map((subcategory) => (
                  <div 
                key={subcategory.id} 
                className="subcategory-item"
                onClick={() => handleSubcategoryClick(subcategory.id)}
                  >
                <div className="subcategory-image">
                  <img 
                    src={subcategory.image} 
                    alt={subcategory.name[currentLang]}
                    className="subcategory-img"
                  />
                        </div>
                <div className="subcategory-info">
                  <h3 className="subcategory-name">{subcategory.name[currentLang]}</h3>
                  <span className="subcategory-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                    </div>
                  </div>
                ))}
              </div>

          {categorySubcategories.length === 0 && (
            <div className="no-subcategories">
             
                  <h3>{t('shop.no_products_title')}</h3>
                  <p>{t('shop.no_products_description')}</p>
                </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCategories; 
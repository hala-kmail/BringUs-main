import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { allProducts, categories, getProductsByCategory } from '../../data/index';
import './MobileCategories.css';

const MobileCategories = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

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

  // دالة للتحقق من وجود منتجات في فئة
  const hasProductsInCategory = (categoryId) => {
    const products = getProductsByCategory(categoryId);
    return products.length > 0;
  };

  // تصفية الفئات لإظهار فقط التي تحتوي على منتجات
  const getFilteredCategories = () => {
    return categories.filter(category => hasProductsInCategory(category.id));
  };

  // دالة لجلب منتجات فئة معينة
  const getCategoryProducts = (categoryId) => {
    const products = getProductsByCategory(categoryId);
    return products.slice(0, 12); // أول 12 منتج فقط
  };

  // تحديد الفئة الأولى كافتراضية
  useEffect(() => {
    const filteredCategories = getFilteredCategories();
    if (filteredCategories.length > 0 && !selectedCategory) {
      const firstCategory = filteredCategories[0];
      setSelectedCategory(firstCategory.id);
      setCategoryProducts(getCategoryProducts(firstCategory.id));
    }
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCategoryProducts(getCategoryProducts(categoryId));
  };

  const handleCategoryClick = (categoryId) => {
    const categorySlug = categorySlugMapping[categoryId];
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    console.log('Added to cart:', product);
    // Add your cart logic here
  };

  const filteredCategories = getFilteredCategories();

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
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="category-name">{category.name[currentLang]}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-section">
          {selectedCategory && (
            <>
              <div className="section-header">
                <h2 className="section-title">
                  {filteredCategories.find(cat => cat.id === selectedCategory)?.name[currentLang]}
                </h2>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCategoryClick(selectedCategory)}
                >
                  {t('new_arrivals.view_all')}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

              <div className="products-grid">
                {categoryProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="product-item"
                  >
                    <div className="product-image">
                      <Link to={`/product/${product.id}`}>
                        <img src={product.image} alt={product.name[currentLang]} />
                      </Link>
                      
                      {/* Wishlist Heart Icon */}
                      <div 
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <svg 
                          width="20"
                          height="20"
                          viewBox="0 0 24 24" 
                          fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                          stroke={isInWishlist(product.id) ? '#ef4444' : '#6b7280'}
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      
                      {product.discountPercentage && (
                        <div className="discount-badge">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div className="product-info" onClick={() => handleProductClick(product.id)}>
                      <h3 className="product-name">{product.name[currentLang]}</h3>
                      <div className="product-price">
                        {product.discountPrice ? (
                          <>
                            <span className="current-price">
                              {product.discountPrice.toFixed(2)} {t('shop.currency')}
                            </span>
                            <span className="original-price">
                              {product.originalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {product.originalPrice.toFixed(2)} {t('shop.currency')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {categoryProducts.length === 0 && (
                <div className="no-products">
                  <div className="no-products-icon">📦</div>
                  <h3>{t('shop.no_products_title')}</h3>
                  <p>{t('shop.no_products_description')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCategories; 
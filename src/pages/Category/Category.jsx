import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import { 
  allProducts, 
  categories, 
  subcategories, 
  getProductsByCategory, 
  getProductsBySubcategory,
  getCategoryById,
  getSubcategoryById,
  getSubcategoriesByCategory 
} from '../../data/index';
import './Category.css';

const Category = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [categorySubcategories, setCategorySubcategories] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const currentLang = i18n.language;

  // Category mapping for URL slugs to IDs
  const categorySlugMapping = {
    'fruits-vegetables': 1,
    'meats-seafood': 2,
    'breakfast-dairy': 3,
    'breads-bakery': 4,
    'beverages': 5,
    'frozen-foods': 6,
    'biscuits-snacks': 7,
    'grocery-staples': 8,
    'household-needs': 9,
    'healthcare': 10,
    'baby-pregnancy': 11
  };

  // Subcategory mapping for URL slugs to IDs
  const subcategorySlugMapping = {
    'fresh-fruits': 1,
    'fresh-vegetables': 2,
    'fresh-meat': 3,
    'seafood': 4,
    'dairy-products': 5,
    'breakfast-items': 6,
    'fresh-bread': 7,
    'pastries': 8,
    'hot-beverages': 9,
    'cold-beverages': 10,
    'frozen-meals': 11,
    'frozen-desserts': 12,
    'cookies-biscuits': 13,
    'nuts-snacks': 14,
    'cooking-essentials': 15,
    'grains-rice': 16,
    'cleaning-supplies': 17,
    'paper-products': 18,
    'vitamins-supplements': 19,
    'personal-care': 20,
    'baby-care': 21,
    'baby-food': 22
  };

  useEffect(() => {
    if (categorySlug) {
      const categoryId = categorySlugMapping[categorySlug];
      if (categoryId) {
        const category = getCategoryById(categoryId);
        if (category) {
          setCurrentCategory(category);
          const subCategories = getSubcategoriesByCategory(categoryId);
          setCategorySubcategories(subCategories);
          
          if (subcategorySlug) {
            const subcategoryId = subcategorySlugMapping[subcategorySlug];
            if (subcategoryId) {
              const subcategory = getSubcategoryById(subcategoryId);
              setCurrentSubcategory(subcategory);
              filterProducts(categoryId, subcategoryId);
            } else {
              filterProducts(categoryId);
            }
          } else {
            setCurrentSubcategory(null);
            filterProducts(categoryId);
          }
        } else {
          navigate('/shop');
        }
      } else {
        navigate('/shop');
      }
    }
  }, [categorySlug, subcategorySlug, navigate]);

  useEffect(() => {
    if (currentCategory) {
      const categoryId = currentCategory.id;
      const subcategoryId = currentSubcategory?.id;
      filterProducts(categoryId, subcategoryId);
    }
  }, [sortBy]);

  const filterProducts = (categoryId, subcategoryId = null) => {
    let filtered;
    
    if (subcategoryId) {
      filtered = getProductsBySubcategory(subcategoryId);
    } else {
      filtered = getProductsByCategory(categoryId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.originalPrice) - (b.discountPrice || b.originalPrice));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.originalPrice) - (a.discountPrice || a.originalPrice));
        break;
      case 'name':
        filtered.sort((a, b) => a.name[currentLang].localeCompare(b.name[currentLang]));
        break;
      default:
        // latest - keep original order
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // دالة للتحقق من وجود منتجات في فئة فرعية معينة
  const hasProductsInSubcategory = (subcategoryId) => {
    const products = getProductsBySubcategory(subcategoryId);
    return products.length > 0;
  };

  // تصفية الفئات الفرعية لإظهار فقط التي تحتوي على منتجات
  const getFilteredSubcategories = () => {
    return categorySubcategories.filter(subcategory => 
      hasProductsInSubcategory(subcategory.id)
    );
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    // Find the subcategory slug from the mapping
    const subcategorySlug = Object.keys(subcategorySlugMapping).find(
      key => subcategorySlugMapping[key] === subcategoryId
    );
    
    if (subcategorySlug) {
      navigate(`/category/${categorySlug}/${subcategorySlug}`);
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryTranslationKey = (category) => {
    // Use the category name from the new structure
    const categoryName = category.name ? category.name.en : category;
    const mapping = {
      'Fruits & Vegetables': 'fruits_vegetables',
      'Meats & Seafood': 'meats_seafood',
      'Breakfast & Dairy': 'breakfast_dairy',
      'Breads & Bakery': 'breads_bakery',
      'Beverages': 'beverages',
      'Frozen Foods': 'frozen_foods',
      'Biscuits & Snacks': 'biscuits_snacks',
      'Grocery & Staples': 'grocery_staples',
      'Household Needs': 'household_needs',
      'Healthcare': 'healthcare',
      'Baby & Pregnancy': 'baby_pregnancy'
    };
    return mapping[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '_').replace(/\s*&\s*/g, '_');
  };

  return (
    <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <TopBar />
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch 
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />

      <div className="category-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">{t('product_detail.home')}</Link>
          <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
          <Link to="/shop">{t('secondary_nav.shop')}</Link>
          <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
          {subcategorySlug ? (
            <>
              <Link to={`/category/${categorySlug}`} className="breadcrumb-link">
                {currentCategory && t(`categories.${getCategoryTranslationKey(currentCategory)}`)}
              </Link>
              <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
              <span className="breadcrumb-current">
                {currentSubcategory && currentSubcategory.name[currentLang]}
              </span>
            </>
          ) : (
            <span className="breadcrumb-current">
              {currentCategory && t(`categories.${getCategoryTranslationKey(currentCategory)}`)}
            </span>
          )}
        </div>

        {/* Category Header */}
        <div className="category-header">
          <h1 className="category-title">
            {currentCategory && t(`categories.${getCategoryTranslationKey(currentCategory)}`)}
            {currentSubcategory && (
              <span className="subcategory-title">
                - {currentSubcategory.name[currentLang]}
              </span>
            )}
          </h1>
          <p className="category-description">
            {t('shop.showing_results', { 
              start: startIndex + 1,
              end: Math.min(endIndex, filteredProducts.length),
              total: filteredProducts.length 
            })}
          </p>
        </div>

        {/* Subcategories */}
        {getFilteredSubcategories().length > 0 && !subcategorySlug && (
          <div className="subcategories">
            <h3 className="subcategories-title">{t('shop.product_categories')}</h3>
            <div className="subcategories-grid">
              {getFilteredSubcategories().map((subcategory) => (
                <button
                  key={subcategory.id}
                  className="subcategory-card"
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                >
                  <h4>{subcategory.name[currentLang]}</h4>
                  <span className="subcategory-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="category-toolbar">
          <div className="toolbar-left">
            <span className="results-count">
              {t('shop.showing_results', { 
                start: startIndex + 1,
                end: Math.min(endIndex, filteredProducts.length),
                total: filteredProducts.length 
              })}
            </span>
          </div>
          
          <div className="toolbar-right">
            <div className="sort-controls">
              <label>{t('shop.sort')}:</label>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="latest">{t('shop.sort_by_latest')}</option>
                <option value="price-low">{t('shop.sort_by_price_low')}</option>
                <option value="price-high">{t('shop.sort_by_price_high')}</option>
                <option value="name">{t('shop.sort_by_name')}</option>
              </select>
            </div>

            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`products-grid ${viewMode}`}>
          {paginatedProducts.map((product) => (
            <div key={product.id} className="product-card">
              {/* Product Image */}
              <div className="product-image">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name[currentLang]} />
                </Link>
                
                {/* Wishlist Heart */}
                <div 
                  className="wishlist-btn"
                  onClick={() => handleWishlistToggle(product)}
                >
                  <svg 
                    width="24"
                    height="24"
                    viewBox="0 0 24 24" 
                    fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                    stroke={isInWishlist(product.id) ? '#ef4444' : '#6b7280'}
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>

                {/* Discount Badge */}
                {product.discountPercentage && (
                  <div className="discount-badge">
                    -{product.discountPercentage}%
                  </div>
                )}

                {/* Feature Badge */}
                {product.feature && (
                  <div className="feature-badge">
                    {product.feature[currentLang]}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="product-info">
                <Link to={`/product/${product.id}`} className="product-link">
                  <h3 className="product-name">{product.name[currentLang]}</h3>
                </Link>
                
                {/* Rating */}
                <div className="product-rating">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="star">★</span>
                    ))}
                  </div>
                  <span className="rating-count">(3)</span>
                </div>

                {/* Price */}
                <div className="product-price">
                  {product.discountPrice ? (
                    <>
                      <span className="current-price">
                        {product.discountPrice.toFixed(2)} {t('shop.currency')}
                      </span>
                      <span className="original-price">
                        {product.originalPrice.toFixed(2)} {t('shop.currency')}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">
                      {product.originalPrice.toFixed(2)} {t('shop.currency')}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="button-text">{t('shop.add_to_cart')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <h3>{t('shop.no_products_title')}</h3>
            <p>{t('shop.no_products_description')}</p>
            <Link to="/shop" className="browse-all-btn">{t('shop.browse_all_products')}</Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {currentLang === 'ar' ? '›' : '‹'}
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="page-btn next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {currentLang === 'ar' ? '‹' : '›'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import { 
  getProductsByCategory, 
  getProductsBySubcategory,
  getCategoryById,
  getSubCategories,
  getCategoryIdBySlug,
  getFeatureById,
  getProductsByParentCategory
} from '../../data/index';
import './Category.css';
import ProductCard from '../../components/ProductCard/ProductCard';

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

  useEffect(() => {
    if (categorySlug) {
      const categoryId = getCategoryIdBySlug(categorySlug);
      console.log(categoryId);
      if (categoryId) {
        const category = getCategoryById(categoryId);
        if (category) {
          setCurrentCategory(category);
          const subCategories = getSubCategories(categoryId);
          setCategorySubcategories(subCategories);
          
          if (subcategorySlug) {
            const subcategoryId = getCategoryIdBySlug(subcategorySlug);
            if (subcategoryId) {
              const subcategory = getCategoryById(subcategoryId);
              setCurrentSubcategory(subcategory);
              filterProducts(categoryId, subcategoryId);
            } else {
              filterProducts(categoryId);
            }
          } else {
            setCurrentSubcategory(null);
            filterProducts(categoryId);
            console.log(filteredProducts);
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
      console.log(filtered);
    } else {
      filtered = getProductsByParentCategory(categoryId);
      console.log(filtered);
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
    // Navigate to product details page
    navigate(`/product/${product.id}`);
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

  const handleSubcategoryClick = (subcategorySlug) => {
  console.log(subcategorySlug);
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

 

  return (
    <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* <TopBar /> */}
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
          
                {currentCategory && currentCategory.name[currentLang]}
              </Link>
              <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
              <span className="breadcrumb-current">
                {currentSubcategory && currentSubcategory.name[currentLang]}
              </span>
            </>
          ) : (
            <span className="breadcrumb-current">
              {currentCategory && currentCategory.name[currentLang]}
            </span>
          )}
        </div>

        {/* Category Header */}
        <div className="category-header">
          <h1 className="category-title">
            {currentCategory && currentCategory.name[currentLang]}
            {currentSubcategory && (
              <span className="subcategory-title">
                - {currentSubcategory.name[currentLang]}
              </span>
            )}
          </h1>
          {/* <p className="category-description">
            {t('shop.showing_results', { 
              start: startIndex + 1,
              end: Math.min(endIndex, filteredProducts.length),
              total: filteredProducts.length 
            })}
          </p> */}
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
                  onClick={() => handleSubcategoryClick(subcategory.slug['en'])}
                >
                  <div className="subcategory-image">
                    <img 
                      src={subcategory.image} 
                      alt={subcategory.name[currentLang]}
                      className="subcategory-img"
                    />
                  </div>
                  <div className="subcategory-content">
                    <h4>{subcategory.name[currentLang]}</h4>
                  <span className="subcategory-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                  </div>
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
              <label>{t('shop.sorting')}:</label>
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
             <ProductCard
             key={product.id}
             product={product}
             currentLang={currentLang}
             t={t}
             isInWishlist={isInWishlist}
             handleWishlistToggle={handleWishlistToggle}
             handleAddToCart={handleAddToCart}
             getFeatureById={getFeatureById}
             getCategoryById={null}
           />
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
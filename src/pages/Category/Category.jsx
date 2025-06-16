import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categorySubcategories, setCategorySubcategories] = useState([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const currentLang = i18n.language;

  // استخراج الـ slugs من المسار
  const pathAfterCategory = location.pathname.split('/category/')[1] || '';
  const slugs = pathAfterCategory.split('/').filter(Boolean);

  useEffect(() => {
    if (!slugs.length) {
      navigate('/shop');
      return;
    }

    // العثور على الفئة الحالية باستخدام آخر slug
    const currentSlug = slugs[slugs.length - 1];
    const categoryId = getCategoryIdBySlug(currentSlug);

    if (categoryId) {
      const category = getCategoryById(categoryId);
      if (category) {
        setCurrentCategory(category);
        const subCategories = getSubCategories(categoryId);
        setCategorySubcategories(subCategories);

        // بناء مسار Breadcrumb
        const breadcrumb = [];
        let currentPath = '';
        slugs.forEach((slug, index) => {
          const slugId = getCategoryIdBySlug(slug);
          if (slugId) {
            const slugCategory = getCategoryById(slugId);
            currentPath = index === 0 ? slug : `${currentPath}/${slug}`;
            breadcrumb.push({
              name: slugCategory.name[currentLang],
              slug: currentPath,
            });
          }
        });
        setBreadcrumbPath(breadcrumb);

        // تصفية المنتجات بناءً على الفئة الحالية
        filterProducts(categoryId);
      } else {
        navigate('/shop');
      }
    } else {
      navigate('/shop');
    }
  }, [pathAfterCategory, navigate, currentLang]);

  useEffect(() => {
    if (currentCategory) {
      filterProducts(currentCategory.id);
    }
  }, [sortBy, currentCategory]);

  const filterProducts = (categoryId) => {
    let filtered = getProductsBySubcategory(categoryId) || getProductsByCategory(categoryId);

    // إذا لم تكن هناك منتجات مباشرة، جرب استرجاع المنتجات من الفئات الفرعية
    if (filtered.length === 0) {
      filtered = getProductsByParentCategory(categoryId);
    }

    // تطبيق الفرز
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
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const hasProductsInSubcategory = (subcategoryId) => {
    const products = getProductsBySubcategory(subcategoryId);
    return products.length > 0;
  };

  const getFilteredSubcategories = () => {
    return categorySubcategories.filter(subcategory => 
      hasProductsInSubcategory(subcategory.id) || getSubCategories(subcategory.id).length > 0
    );
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
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
    const newPath = pathAfterCategory ? `${pathAfterCategory}/${subcategorySlug}` : subcategorySlug;
    navigate(`/category/${newPath}`);
  };

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
          {breadcrumbPath.map((item, index) => (
            <React.Fragment key={index}>
              <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
              {index === breadcrumbPath.length - 1 ? (
                <span className="breadcrumb-current">{item.name}</span>
              ) : (
                <Link to={`/category/${item.slug}`} className="breadcrumb-link">{item.name}</Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Category Header */}
        <div className="category-header">
          <h1 className="category-title">{currentCategory && currentCategory.name[currentLang]}</h1>
        </div>

        {/* Subcategories */}
        {getFilteredSubcategories().length > 0 && (
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
        {filteredProducts.length > 0 && (
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
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 && (
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
        )}

        {/* No Products or Subcategories Message */}
        {filteredProducts.length === 0 && getFilteredSubcategories().length === 0 && (
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
               ‹
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
             ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
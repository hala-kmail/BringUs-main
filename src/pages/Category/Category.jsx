import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import {
  getProductsByCategory,
  getCategoryById,
  getSubCategories,
  getCategoryIdBySlug,
  getFeatureById,
  getProductsByParentCategory
} from '../../data/index';
import './Category.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import Pagination from '../../components/Shop/Pagination';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
//-----------------------------------Category------------------------------------------------  
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
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const currentLang = i18n.language;

  //-----------------------------------pathAfterCategory------------------------------------------------  
  const pathAfterCategory = location.pathname.split('/category/')[1] || '';
  const slugs = pathAfterCategory.split('/').filter(Boolean);
  //-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    if (!slugs.length) {
      navigate('/shop');
      return;
    }
    //-----------------------------------currentSlug------------------------------------------------  
    const currentSlug = slugs[slugs.length - 1];
    const categoryId = getCategoryIdBySlug(currentSlug);
    //-----------------------------------categoryId------------------------------------------------  
    if (categoryId) {
      const category = getCategoryById(categoryId);
      if (category) {
        setCurrentCategory(category);
        const subCategories = getSubCategories(categoryId);
        setCategorySubcategories(subCategories);
        //-----------------------------------breadcrumb------------------------------------------------  
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
        filterProducts(categoryId);
      } else {
        navigate('/shop');
      }
    } else {
      navigate('/shop');
    }
  }, [pathAfterCategory, navigate, currentLang]);
  //-----------------------------------useEffect slug change------------------------------------------------  
  useEffect(() => {
    if (currentCategory) {
      filterProducts(currentCategory.id);
    }
  }, [sortBy, currentCategory]);
  //-----------------------------------filterProducts------------------------------------------------  
  const filterProducts = (categoryId) => {
    let filtered = getProductsByCategory(categoryId);

    if (filtered.length === 0) {
      filtered = getProductsByParentCategory(categoryId);
    }
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => ( a.originalPrice) - ( b.originalPrice));
        break;
      case 'price-high':
        filtered.sort((a, b) => ( b.originalPrice) - (a.originalPrice));
        break;
      case 'name':
        filtered.sort((a, b) => a.name[currentLang].localeCompare(b.name[currentLang]));
        break;
      default:
        // لا تفرز، أبقِ الترتيب الافتراضي
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };
  //-----------------------------------hasProductsInSubcategory------------------------------------------------  
  const hasProductsInSubcategory = (subcategoryId) => {
    const products = getProductsByCategory(subcategoryId);
    return products.length > 0;
  };
  //-----------------------------------getFilteredSubcategories------------------------------------------------  
  const getFilteredSubcategories = () => {
    return categorySubcategories.filter(subcategory =>
      hasProductsInSubcategory(subcategory.id) || getSubCategories(subcategory.id).length > 0
    );
  };
  //-----------------------------------handleWishlistToggle------------------------------------------------  
  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };
  //-----------------------------------handleAddToCart------------------------------------------------  
  const handleAddToCart = (product) => {
    navigate(`/product/${product.id}`);
  };
  //-----------------------------------handleMobileSearchToggle------------------------------------------------  
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };
  //-----------------------------------handleMobileSearchClose------------------------------------------------  
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };
  //-----------------------------------handleSortChange------------------------------------------------  
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };
  //-----------------------------------handleSubcategoryClick------------------------------------------------  
  const handleSubcategoryClick = (subcategorySlug) => {
    const newPath = pathAfterCategory ? `${pathAfterCategory}/${subcategorySlug}` : subcategorySlug;
    navigate(`/category/${newPath}`);
  };
  //-----------------------------------startIndex------------------------------------------------  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  //-----------------------------------handlePageChange------------------------------------------------  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  //-----------------------------------handleItemsPerPageChange------------------------------------------------  
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  //-----------------------------------getVisiblePages------------------------------------------------  
  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };
  //-----------------------------------return------------------------------------------------  

  const categorySortOptions = [
    { value: 'latest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'price-low', label: { ar: 'الأقل سعراً', en: 'Price Low to High' } },
    { value: 'price-high', label: { ar: 'الأعلى سعراً', en: 'Price High to Low' } },
    { value: 'name', label: { ar: 'الاسم', en: 'Name' } },
  ];

  useScrollToTopOnChange([pathAfterCategory]);

  return (
    <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar onMobileSearchToggle={handleMobileSearchToggle} isMobileSearchOpen={isMobileSearchOpen} />
      <SecondaryNavbar />
      <MobileSearch isOpen={isMobileSearchOpen} onClose={handleMobileSearchClose} />
      <div className="category-container">
        {/* ------------------------------Breadcrumb ------------------------------------------------ */}
        <Breadcrumb breadcrumbPath={breadcrumbPath} currentLang={currentLang} t={t} />
        {/* ------------------------------Category Header ------------------------------------------------ */}
        <div className="category-header">
          <h1 className="category-title">{currentCategory && currentCategory.name[currentLang]}</h1>
        </div>
        {/* ------------------------------Subcategories ------------------------------------------------ */}
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

        {/* ------------------------------Toolbar ------------------------------------------------ */}
        {filteredProducts.length > 0 && (
          <ShopToolbar
            filters={{ sortBy }}
            handleSortChange={handleSortChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentLang={currentLang}
            filteredCount={filteredProducts.length}
            totalCount={filteredProducts.length}
            sortOptions={categorySortOptions.map(opt => ({ value: opt.value, label: opt.label[currentLang] }))}
          />
        )}

        {/* ------------------------------Products Grid ------------------------------------------------ */}
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

        {/* ------------------------------No Products or Subcategories Message ------------------------------------------------ */}
        {filteredProducts.length === 0 && getFilteredSubcategories().length === 0 && (
          <div className="no-products">
            <h3>{t('shop.no_products_title')}</h3>
            <p>{t('shop.no_products_description')}</p>
            <Link to="/shop" className="browse-all-btn">{t('shop.browse_all_products')}</Link>
          </div>
        )}

        {/* ------------------------------Pagination ------------------------------------------------  */}
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            getVisiblePages={getVisiblePages}
          />
        )}
      </div>
    </div>
  );
};

export default Category;
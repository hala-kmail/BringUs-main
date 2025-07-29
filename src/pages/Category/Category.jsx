import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
// Remove static imports and use dynamic hooks
import useCategories from '../../hooks/useCategories';
import useProducts from '../../hooks/useProducts';
import './Category.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import Pagination from '../../components/Shop/Pagination';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
import { useAppData } from '../../contexts/AppDataContext';

const Category = () => {
  const { categorySlug } = useParams(); // Use useParams to get slug from URL
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
  const { categories: allCategories, products: allProducts } = useAppData();

  // Use dynamic data hooks
  const { categories, getSubCategories, loading: categoriesLoading } = useCategories();
  const { fetchProductsByCategory, loading: productsLoading } = useProducts();

  // Find category by slug
  const findCategoryBySlug = (slug) => {
    if (!categories || !Array.isArray(categories)) return null;
    return categories.find(cat => cat.slug === slug);
  };

  useEffect(() => {
    if (!categorySlug) {
      navigate('/shop');
      return;
    }

    if (!categories || categories.length === 0) return; // Wait for categories to load

    const category = findCategoryBySlug(categorySlug);
    
    if (category) {
      setCurrentCategory(category);
      
      // Get subcategories
      const subCategories = getSubCategories(category._id);
      setCategorySubcategories(subCategories);
      
      // Set breadcrumb
      setBreadcrumbPath([{
        name: currentLang === 'ar' ? category.nameAr : category.nameEn,
        slug: category.slug
      }]);
      
      // Fetch products for this category
      loadCategoryProducts(category._id);
    } else {
      // Category not found, redirect to shop
      navigate('/shop');
    }
  }, [categorySlug, categories, currentLang]);

  const loadCategoryProducts = async (categoryId) => {
    try {
      const result = await fetchProductsByCategory(categoryId);
      if (result && result.products) {
        let products = result.products;
        
        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            products.sort((a, b) => (a.finalPrice || a.price || 0) - (b.finalPrice || b.price || 0));
            break;
          case 'price-high':
            products.sort((a, b) => (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0));
            break;
          case 'name':
            products.sort((a, b) => {
              const nameA = currentLang === 'ar' ? (a.nameAr || '') : (a.nameEn || '');
              const nameB = currentLang === 'ar' ? (b.nameAr || '') : (b.nameEn || '');
              return nameA.localeCompare(nameB);
            });
            break;
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
          default:
            // Keep default order
            break;
        }
        
        setFilteredProducts(products);
        setCurrentPage(1);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error loading category products:', error);
      setFilteredProducts([]);
    }
  };

  // Reload products when sort changes
  useEffect(() => {
    if (currentCategory) {
      loadCategoryProducts(currentCategory._id);
    }
  }, [sortBy]);

  const hasProductsInSubcategory = (subcategoryId) => {
    // This would ideally check with the API, but for now we'll assume all subcategories have products
    return true;
  };

  const getFilteredSubcategories = () => {
    return categorySubcategories.filter(subcategory =>
      hasProductsInSubcategory(subcategory._id) || getSubCategories(subcategory._id).length > 0
    );
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    navigate(`/product/${product._id || product.id}`);
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
    navigate(`/category/${subcategorySlug}`);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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

  const categorySortOptions = [
    { value: 'newest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'price-low', label: { ar: 'الأقل سعراً', en: 'Price Low to High' } },
    { value: 'price-high', label: { ar: 'الأعلى سعراً', en: 'Price High to Low' } },
    { value: 'name', label: { ar: 'الاسم', en: 'Name' } },
  ];

  useScrollToTopOnChange([categorySlug]);

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar onMobileSearchToggle={handleMobileSearchToggle} isMobileSearchOpen={isMobileSearchOpen} />
        <SecondaryNavbar />
        <div className="category-container">
          <div className="loading-state" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#666'
          }}>
            {currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return <div style={{padding: '2rem', textAlign: 'center', color: '#888'}}>لا توجد فئة أو جاري التحميل...</div>;
  }

  // دالة لجمع كل معرفات الفئة والفروع التابعة لها
  function getAllDescendantCategoryIds(categoryId, categories) {
    const ids = [categoryId];
    const children = categories.filter(cat => {
      if (!cat.parent) return false;
      if (typeof cat.parent === 'object') {
        return cat.parent._id === categoryId || cat.parent.id === categoryId;
      }
      return cat.parent === categoryId;
    });
    children.forEach(child => {
      ids.push(...getAllDescendantCategoryIds(child._id || child.id, categories));
    });
    return ids;
  }

  // فلترة المنتجات حسب الفئة والفروع
  const categoryIds = getAllDescendantCategoryIds(currentCategory._id || currentCategory.id, allCategories);
  const categoryFilteredProducts = allProducts.filter(product =>
    categoryIds.includes(product.category?._id || product.category?.id || product.categoryId)
  );

  return (
    <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar onMobileSearchToggle={handleMobileSearchToggle} isMobileSearchOpen={isMobileSearchOpen} />
      <SecondaryNavbar />
      <MobileSearch isOpen={isMobileSearchOpen} onClose={handleMobileSearchClose} />
      <div className="category-container">
        {/* Breadcrumb */}
        <Breadcrumb
          category={currentCategory}
          currentLang={currentLang}
          t={t}
          allCategories={allCategories || []}
        />
        
        {/* Category Header */}
        <div className="category-header">
          <h1 className="category-title">
            {currentCategory && (currentLang === 'ar' ? currentCategory.nameAr : currentCategory.nameEn)}
          </h1>
        </div>
        
        {/* Subcategories */}
        {getFilteredSubcategories().length > 0 && (
          <div className="subcategories">
            <h3 className="subcategories-title">{t('shop.product_categories')}</h3>
            <div className="subcategories-grid">
              {getFilteredSubcategories().map((subcategory) => (
                <button
                  key={subcategory._id}
                  className="subcategory-card"
                  onClick={() => handleSubcategoryClick(subcategory.slug)}
                >
                  <div className="subcategory-image">
                    <img
                      src={subcategory.image}
                      alt={currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn}
                      className="subcategory-img"
                    />
                  </div>
                  <div className="subcategory-content">
                    <h4>{currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn}</h4>
                    <span className="subcategory-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        {categoryFilteredProducts.length > 0 && (
          <ShopToolbar
            filters={{ sortBy }}
            handleSortChange={handleSortChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentLang={currentLang}
            filteredCount={categoryFilteredProducts.length}
            totalCount={categoryFilteredProducts.length}
            sortOptions={categorySortOptions.map(opt => ({ value: opt.value, label: opt.label[currentLang] }))}
          />
        )}

        {/* Products Grid */}
        {categoryFilteredProducts.length > 0 && (
          <div className={`products-grid ${viewMode}`}>
            {categoryFilteredProducts.slice(startIndex, endIndex).map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                currentLang={currentLang}
                t={t}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={handleAddToCart}
                getCategoryById={() => null}
              />
            ))}
          </div>
        )}

        {/* No Products or Subcategories Message */}
        {categoryFilteredProducts.length === 0 && getFilteredSubcategories().length === 0 && (
          <div className="no-products">
            <h3>{t('shop.no_products_title')}</h3>
            <p>{t('shop.no_products_description')}</p>
            <Link to="/shop" className="browse-all-btn">{t('shop.browse_all_products')}</Link>
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(categoryFilteredProducts.length / itemsPerPage) > 1 && (
          <Pagination
            totalPages={Math.ceil(categoryFilteredProducts.length / itemsPerPage)}
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
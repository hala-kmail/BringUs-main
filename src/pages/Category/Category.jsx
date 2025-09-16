import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useAppData } from '../../contexts/AppDataContext';
import './Category.css';

const Category = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { navigate } = useAffiliateNavigation();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Use dynamic data hooks
  const { products, loading: productsLoading, error: productsError, searchProducts } = useProducts();
  const { categories, loading: categoriesLoading, getSubCategories } = useCategories();
  const { store } = useAppData();

  // Derived data
  const allProducts = products || [];
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // For breadcrumb
  
  const currentLang = i18n.language;

  // Scroll to top when category changes
  useScrollToTopOnChange([categorySlug]);

  // Find current category by slug
  useEffect(() => {
    if (categories && categorySlug) {
      const category = categories.find(cat => 
        cat.slug === categorySlug || 
        cat.slugAr === categorySlug || 
        cat.slugEn === categorySlug
      );
      setCurrentCategory(category);
      if (category) {
        setSelectedCategoryId(category._id);
        setSelectedCategory(category); // Set initial selected category
      }
    }
  }, [categories, categorySlug]);

  // Get subcategories when current category changes
  useEffect(() => {
    if (currentCategory && getSubCategories) {
      const subs = getSubCategories(currentCategory._id);
      setSubCategories(subs);
    }
  }, [currentCategory, getSubCategories]);

  // Get all descendant category IDs (including subcategories)
  const getAllDescendantCategoryIds = (categoryId) => {
    const descendantIds = [categoryId];
    
    if (getSubCategories) {
      const subCats = getSubCategories(categoryId);
      subCats.forEach(subCat => {
        descendantIds.push(subCat._id);
        // Recursively get sub-subcategories
        const subSubCats = getSubCategories(subCat._id);
        if (subSubCats) {
          subSubCats.forEach(subSubCat => {
            descendantIds.push(subSubCat._id);
          });
        }
      });
    }
    
    return descendantIds;
  };

  // Filter products by selected category (including all subcategories)
  useEffect(() => {
    if (!selectedCategoryId || !allProducts.length) {
      setFilteredProducts([]);
      return;
    }

    console.log('Filtering products for category ID:', selectedCategoryId);
    console.log('Total products available:', allProducts.length);
    
    // Get all descendant category IDs (including subcategories)
    const descendantCategoryIds = getAllDescendantCategoryIds(selectedCategoryId);
    console.log('Descendant category IDs:', descendantCategoryIds);
    
    // Filter products by category ID (including all descendants)
    const categoryProducts = allProducts.filter(product => {
      const productCategoryId = product.category?._id || product.category?.id;
      return descendantCategoryIds.includes(productCategoryId);
    });
    
    console.log('Filtered products count:', categoryProducts.length);
    setFilteredProducts(categoryProducts);
  }, [selectedCategoryId, allProducts, getSubCategories]);
      
  // API-based search function
  const performAPISearch = async (query) => {
    if (!query.trim()) {
      // Reset to current category products (including subcategories)
      if (selectedCategoryId && allProducts.length) {
        const descendantCategoryIds = getAllDescendantCategoryIds(selectedCategoryId);
        const categoryProducts = allProducts.filter(product => {
          const productCategoryId = product.category?._id || product.category?.id;
          return descendantCategoryIds.includes(productCategoryId);
        });
        setFilteredProducts(categoryProducts);
      }
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchProducts(query);
      if (result && result.products) {
        setFilteredProducts(result.products);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSearchParams(query ? { search: query } : {});
    await performAPISearch(query);
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    
    // تحديث الكاتيجوري المحددة
    setSelectedCategoryId(category._id);
    setSelectedCategory(category);
    
    // التنقل المباشر إلى صفحة الكاتيجوري
    try {
      const slug = category.slug || category.slugAr || category.slugEn || category._id;
      if (slug && slug !== categorySlug) {
        navigate(`/category/${slug}`);
        return; // الخروج من الدالة بعد التنقل
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
    
    // إذا لم يتم التنقل، تحديث الفروع الفرعية فقط
    if (getSubCategories) {
      const subs = getSubCategories(category._id);
      setSubCategories(subs);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Get category name
  const getCategoryName = (category) => {
    if (!category) return '';
    return currentLang === 'ar' ? category.nameAr : category.nameEn;
  };

  // Get cart totals
  const { getCartTotals } = useCart();
  const cartTotals = getCartTotals();
  const cartItemsCount = cartTotals.itemsCount;

  if (categoriesLoading || productsLoading) {
    return (
      <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <SecondaryNavbar />
        <div className="category-container">
          <div className="category-main">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <SecondaryNavbar />
        <div className="category-container">
          <div className="category-main">
            <div className="error-container">
              <h2>{currentLang === 'ar' ? 'الكاتيجوري غير موجودة' : 'Category not found'}</h2>
              <button onClick={() => navigate('/')}>
                {currentLang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="category-main">
        {/* Breadcrumb */}
        <Breadcrumb
            category={selectedCategory || currentCategory}
          currentLang={currentLang}
          t={t}
            allCategories={categories}
        />
        
        {/* Category Header */}
        <div className="category-header">
            {(selectedCategory || currentCategory).image && (
              <div className="category-icon">
                <img src={(selectedCategory || currentCategory).image} alt={getCategoryName(selectedCategory || currentCategory)} />
              </div>
            )}
            <h1 className="category-title">{getCategoryName(selectedCategory || currentCategory)}</h1>
            {(selectedCategory || currentCategory).descriptionAr && (
              <p className="category-description">
                {currentLang === 'ar' ? (selectedCategory || currentCategory).descriptionAr : (selectedCategory || currentCategory).descriptionEn}
              </p>
            )}
        </div>
        
        {/* Subcategories */}
          {subCategories.length > 0 && (
            <div className="subcategories-section">
              <h2 className="subcategories-title">
                {currentLang === 'ar' ? 'الفروع الفرعية' : 'Subcategories'}
              </h2>
            <div className="subcategories-grid-desktop">
                {subCategories.map((subCat) => (
                  <div 
                    key={subCat._id}
                    className={`subcategory-item ${selectedCategoryId === subCat._id ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(subCat)}
                >
                    <div className="subcategory-content" title={getCategoryName(subCat)}>
                      {subCat.image && (
                        <img src={subCat.image} alt={getCategoryName(subCat)} className="subcategory-logo" />
                      )}
                      <h3 title={getCategoryName(subCat)}>{getCategoryName(subCat)}</h3>
                  </div>
                  </div>
              ))}
            </div>
          </div>
        )}

          {/* Products Section */}
          <div className="products-section">
            <div className="products-header">
              <h2 className="products-title">
                {currentLang === 'ar' ? 'المنتجات' : 'Products'}
              </h2>
              <span className="products-count">
                {filteredProducts.length} {currentLang === 'ar' ? 'منتج' : 'products'}
              </span>
            </div>

        {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
              <ProductCard
                    key={product._id}
                product={product}
                    isInWishlist={isInWishlist(product._id)}
                    handleWishlistToggle={() => handleWishlistToggle(product)}
                currentLang={currentLang}
                    categories={categories}
              />
            ))}
          </div>
            ) : (
          <div className="no-products">
                <h3>{currentLang === 'ar' ? 'لا توجد منتجات' : 'No products found'}</h3>
                <p>{currentLang === 'ar' ? 'لم يتم العثور على منتجات في هذه الكاتيجوري' : 'No products found in this category'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
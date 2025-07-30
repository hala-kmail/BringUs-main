import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import useWishlistAPI from '../../hooks/useWishlistAPI';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import ProductCard from '../../components/ProductCard/ProductCard';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useAppData } from '../../contexts/AppDataContext';
import './MobileCategories.css';

const MobileCategories = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlistAPI();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Use dynamic data hooks
  const { products, loading: productsLoading, error: productsError, fetchProductsByCategory } = useProducts();
  const { categories, getMainCategories, getSubCategories, loading: categoriesLoading } = useCategories();
  const { store } = useAppData();

  const currentLang = i18n.language;

  // Get main categories
  const mainCategories = getMainCategories();

  // Handle category selection
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    
    try {
      const result = await fetchProductsByCategory(category._id);
      if (result && result.products) {
        setFilteredProducts(result.products);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      setFilteredProducts([]);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product._id || product.id}`);
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Get feature by ID (placeholder)
  const getFeatureById = (id) => {
    return null;
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category._id === id);
  };

  return (
    <div className="mobile-categories-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      
      <div className="mobile-categories-container">
        {/* Categories List */}
        <div className="categories-list">
          <h2 className="categories-title">{t('categories.title')}</h2>
          
          {categoriesLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <div className="categories-grid">
              {mainCategories.map((category) => (
                <button
                  key={category._id}
                  className={`category-card ${selectedCategory?._id === category._id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-image">
                    <img
                      src={category.image || '/placeholder-category.jpg'}
                      alt={currentLang === 'ar' ? category.nameAr : category.nameEn}
                      className="category-img"
                    />
                  </div>
                  <div className="category-content">
                    <h3>{currentLang === 'ar' ? category.nameAr : category.nameEn}</h3>
                    <p>{currentLang === 'ar' ? category.descriptionAr : category.descriptionEn}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {selectedCategory && (
          <div className="category-products">
            <div className="category-header">
              <h3>{currentLang === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn}</h3>
              <p>{filteredProducts.length} {t('products.count')}</p>
            </div>
            
            {productsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : productsError ? (
              <div className="error-state">
                <p>{t('common.error')}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    currentLang={currentLang}
                    t={t}
                    isInWishlist={isInWishlist}
                    handleWishlistToggle={handleWishlistToggle}
                    handleAddToCart={handleAddToCart}
                    getFeatureById={getFeatureById}
                    getCategoryById={getCategoryById}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('categories.no_products')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCategories; 
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
import './AlmostFinishedSale.css';

const AlmostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlistAPI();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [almostFinishedProducts, setAlmostFinishedProducts] = useState([]);
  const { categories } = useCategories();

  // Use dynamic data hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { store } = useAppData();

  const currentLang = i18n.language;

  useEffect(() => {
    if (products && products.length > 0) {
      // Filter products with low stock (less than 10 items)
      const lowStockProducts = products.filter(product => 
        product.stockQuantity > 0 && product.stockQuantity <= 10
      );
      
      // Sort by stock quantity (lowest first)
      const sortedProducts = lowStockProducts.sort((a, b) => a.stockQuantity - b.stockQuantity);
      
      setAlmostFinishedProducts(sortedProducts.slice(0, 8));
    }
  }, [products]);

  const handleAddToCart = (product) => {
    if (product.stockQuantity > 0) {
      addToCart({
        id: product._id,
        name: getProductName(product, currentLang),
        price: getFinalPrice(product),
        image: getMainImage(product),
        quantity: 1
      });
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Get feature by ID (placeholder)
  const getFeatureById = (id) => {
    return null;
  };

  // Get category by ID (placeholder)
  const getCategoryById = (id) => {
    return null;
  };

  // Get final price
  const getFinalPrice = (product) => {
    return product.salePrice || product.price || 0;
  };

  // Get main image
  const getMainImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder-product.jpg';
  };

  // Get product name
  const getProductName = (product, lang) => {
    if (product.name && product.name[lang]) {
      return product.name[lang];
    }
    if (product.name && product.name.ar) {
      return product.name.ar;
    }
    if (product.name && product.name.en) {
      return product.name.en;
    }
    return product.name || 'Product';
  };

  return (
    <div className="almost-finished-sale-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      
      <div className="almost-finished-sale-container">
        {/* Header */}
        <div className="sale-header">
          <h1 className="sale-title">{t('almost_finished_sale.title')}</h1>
          <p className="sale-subtitle">{t('almost_finished_sale.subtitle')}</p>
        </div>

        {/* Loading State */}
        {productsLoading && almostFinishedProducts.length === 0 && (
          <div className="sale-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}</p>
          </div>
        )}

        {/* Error State */}
        {productsError && (
          <div className="sale-error">
            <p>{currentLang === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products'}</p>
          </div>
        )}

        {/* Products Grid */}
        {!productsLoading && !productsError && (
          <div className="products-section">
            {almostFinishedProducts.length > 0 ? (
              <>
                <div className="products-grid">
                  {almostFinishedProducts.map((product) => (
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
                      categories={categories}
                    />
                  ))}
                </div>
                
                <div className="sale-footer">
                  <Link to="/shop" className="browse-all-btn">
                    {t('almost_finished_sale.browse_all')}
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-sale">
                <h3>{t('almost_finished_sale.no_products')}</h3>
                <p>{t('almost_finished_sale.no_products_description')}</p>
                <Link to="/shop" className="browse-all-btn">
                  {t('almost_finished_sale.browse_all')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlmostFinishedSale; 
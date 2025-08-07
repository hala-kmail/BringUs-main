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

  // Get stock level category based on product's own threshold
  const getStockLevel = (product) => {
    const { stock, lowStockThreshold } = product;
    
    if (!stock || stock <= 0) return 'out_of_stock';
    
    // Use product's own threshold, fallback to 10 if not available
    const threshold = lowStockThreshold || 10;
    
    if (stock <= threshold * 0.3) return 'critical';    // ≤ 30% of threshold
    if (stock <= threshold) return 'low';               // ≤ threshold
    return 'limited';                                    // > threshold (shouldn't happen with current filter)
  };

  // Get stock level text
  const getStockLevelText = (product, lang) => {
    const level = getStockLevel(product);
    const texts = {
      critical: {
        ar: 'مخزون حرج',
        en: 'Critical Stock'
      },
      low: {
        ar: 'مخزون منخفض',
        en: 'Low Stock'
      },
      limited: {
        ar: 'مخزون محدود',
        en: 'Limited Stock'
      },
      available: {
        ar: 'متوفر',
        en: 'Available'
      },
      out_of_stock: {
        ar: 'نفدت الكمية',
        en: 'Out of Stock'
      }
    };
    return texts[level][lang] || texts[level].en;
  };

  useEffect(() => {
    if (products && products.length > 0) {
      // Filter only products with low stock (exclude normal stock products)
      const lowStockProducts = products.filter(product => {
        const { stock, lowStockThreshold } = product;
        
        // Skip products with no stock
        if (!stock || stock <= 0) return false;
        
        // Use product's own threshold, fallback to 10 if not available
        const threshold = lowStockThreshold || 10;
        
        // Only include products with stock <= threshold (low stock only)
        // Exclude products with normal stock levels
        return stock <= threshold;
      });
      
      // Sort by stock level priority and then by stock quantity
      const sortedProducts = lowStockProducts.sort((a, b) => {
        // First sort by stock level (critical first)
        const aLevel = getStockLevel(a);
        const bLevel = getStockLevel(b);
        
        const levelPriority = {
          critical: 0,
          low: 1,
          limited: 2,
          available: 3,
          out_of_stock: 4
        };
        
        if (levelPriority[aLevel] !== levelPriority[bLevel]) {
          return levelPriority[aLevel] - levelPriority[bLevel];
        }
        
        // Then sort by stock quantity (lowest first)
        return a.stock - b.stock;
      });
      
      setAlmostFinishedProducts(sortedProducts);
    }
  }, [products]);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product, { quantity: 1 });
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

  // استخدام getFinalPrice من useProducts
  const { getFinalPrice } = useProducts();

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
                      // Show stock and discount information
                      showStockInfo={true}
                      showDiscountInfo={true}
                      // Pass stock level information
                      stockLevel={getStockLevel(product)}
                      stockLevelText={getStockLevelText(product, currentLang)}
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
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../../components/ProductCard/ProductCard';
import './MobileCategories.css';

const MobileCategories = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mobileProducts, setMobileProducts] = useState([]);
  const { categories } = useCategories();

  const { 
    products,
    loading, 
    error,
    getFinalPrice,
    getMainImage,
    getProductName,
    isInStock
  } = useProducts();

  const currentLang = i18n.language;

  useEffect(() => {
    if (products && products.length > 0) {
      // Filter products for mobile category (you can adjust this logic)
      const filtered = products.filter(product => {
        // Example: filter by category name or ID that represents mobile products
        const categoryName = product.category?.nameEn?.toLowerCase() || '';
        return categoryName.includes('mobile') || categoryName.includes('phone');
      });

      // Sort by creation date (newest first)
      const sorted = filtered.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setMobileProducts(sorted.slice(0, 8));
    }
  }, [products]);

  const handleAddToCart = (product) => {
    if (isInStock(product)) {
      addToCart(product, { quantity: 1 });
    }
  };

  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Don't render if no mobile products
  if (mobileProducts.length === 0) {
    return null;
  }

  return (
    <section className="mobile-categories">
      <div className="mobile-categories-container">
        {/* Section Header */}
        <div className="mobile-categories-header">
          <div className="mobile-categories-title-section">
            <h2 className="mobile-categories-title">{t('mobile_categories.title')}</h2>
            <p className="mobile-categories-subtitle">{t('mobile_categories.subtitle')}</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {mobileProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              currentLang={currentLang}
              t={t}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleAddToCart={() => handleAddToCart(product)}
              getFeatureById={() => null}
              getCategoryById={() => null}
              categories={categories}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileCategories; 
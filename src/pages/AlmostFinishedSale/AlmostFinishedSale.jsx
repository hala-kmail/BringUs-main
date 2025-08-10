import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../../components/ProductCard/ProductCard';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import './AlmostFinishedSale.css';

const AlmostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [almostFinishedProducts, setAlmostFinishedProducts] = useState([]);
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
      // Filter products that are almost finished (low stock)
      const filtered = products.filter(product => {
        const stock = product.stock || 0;
        const lowStockThreshold = product.lowStockThreshold || 5;
        return stock > 0 && stock <= lowStockThreshold;
      });

      // Sort by stock level (lowest first)
      const sorted = filtered.sort((a, b) => {
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;
        return stockA - stockB;
      });
      
      setAlmostFinishedProducts(sorted.slice(0, 8));
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

  // Don't render if no almost finished products
  if (almostFinishedProducts.length === 0) {
    return null;
  }

  return (
    <section className="almost-finished-sale">
      <div className="almost-finished-container">
        {/* Section Header */}
        <div className="almost-finished-header">
          <div className="almost-finished-title-section">
            <h2 className="almost-finished-title">{t('almost_finished.title')}</h2>
            <p className="almost-finished-subtitle">{t('almost_finished.subtitle')}</p>
          </div>
          <CountdownTimer />
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {almostFinishedProducts.map((product) => (
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

export default AlmostFinishedSale; 
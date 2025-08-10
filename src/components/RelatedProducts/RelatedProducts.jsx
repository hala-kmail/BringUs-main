
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../ProductCard/ProductCard';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProduct, categoryId }) => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { categories } = useCategories();
  const { products } = useAppData();

  const { 
    loading, 
    error,
    getFinalPrice,
    getMainImage,
    getProductName,
    isInStock
  } = useProducts();

  const currentLang = i18n.language;

  useEffect(() => {
    if (products && products.length > 0 && currentProduct) {
      // Filter out current product and get products from same category
      const filtered = products.filter(product => 
        product._id !== currentProduct._id && 
        product.category === categoryId
      );

      // Sort by relevance (same category first, then by creation date)
      const sorted = filtered.sort((a, b) => {
        if (a.category === categoryId && b.category !== categoryId) return -1;
        if (a.category !== categoryId && b.category === categoryId) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setRelatedProducts(sorted.slice(0, 4));
    }
  }, [products, currentProduct, categoryId]);

  const handleAddToCart = (product) => {
    if (isInStock(product)) {
      addToCart(product, { quantity: 1 });
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Function to scroll to top when clicking on a related product
  const handleProductClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Don't render if no related products or category
  if (relatedProducts.length === 0) {
    return null;
  }

  const categorySlug = currentProduct.category.slug['en']; // Assuming categorySlug is derived from currentProduct

  return (
    <section className="related-products">
      <div className="related-products-container">
        {/* Section Header */}
        <div className="related-section-header">
          <div className='related-section-header-title'>
            <h2 className="related-section-title">{t('related_products.title')}</h2>
            <p className="related-section-subtitle">{t('related_products.subtitle')}</p>
          </div>
          <Link to={`/category/${categorySlug}`} className="related-view-all-btn">
            {t('related_products.view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {relatedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              currentLang={currentLang}
              t={t}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleAddToCart={() => {
                handleAddToCart(product);
                handleProductClick();
              }}
              getFeatureById={() => null} // No longer needed
              getCategoryById={() => null} // Prevent category link from showing
              categories={categories}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;

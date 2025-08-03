import React, { useState, useMemo } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import './ProductCatalog.css';

const ProductCatalog = ({ language = 'en' }) => {
  const { features } = useAppData();
  const { categories } = useCategories();
  const { products } = useProducts();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [showNewProducts, setShowNewProducts] = useState(false);
  const [showDiscounted, setShowDiscounted] = useState(false);

  // Helper functions to work with real API data
  const getProductsByCategory = (categoryId) => {
    return products?.filter(product => product.categoryId === categoryId) || [];
  };

  const getSubcategoriesByCategory = (categoryId) => {
    return categories?.filter(cat => cat.parentCategoryId === categoryId) || [];
  };

  const filterProducts = (filters = {}) => {
    return products?.filter(product => {
      // Category filter
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        if (!filters.categoryIds.includes(product.categoryId)) return false;
      }

      // Feature filter
      if (filters.featureIds && filters.featureIds.length > 0) {
        if (!filters.featureIds.includes(product.featureId)) return false;
      }

      // Best seller filter
      if (filters.isBestSeller !== undefined) {
        if (product.isBestSeller !== filters.isBestSeller) return false;
      }

      // New product filter
      if (filters.isNew !== undefined) {
        if (product.isNew !== filters.isNew) return false;
      }

      // Discount filter
      if (filters.hasDiscount !== undefined) {
        const hasDiscount = product.discountPercentage !== null;
        if (hasDiscount !== filters.hasDiscount) return false;
      }

      return true;
    }) || [];
  };

  const getEnrichedProducts = (productsToEnrich) => {
    return productsToEnrich.map(product => {
      const category = categories?.find(c => c._id === product.categoryId);
      const feature = features?.find(f => f._id === product.featureId);

      return {
        ...product,
        categoryName: category ? (category.nameAr || category.nameEn) : null,
        featureName: feature ? (feature.nameAr || feature.nameEn) : null,
        displayName: product.nameAr || product.nameEn,
        displayDescription: product.descriptionAr || product.descriptionEn
      };
    });
  };

  // Get filtered products based on current selections
  const filteredProducts = useMemo(() => {
    const filters = {};
    
    if (selectedCategory) filters.categoryIds = [selectedCategory];
    if (selectedSubcategory) filters.subcategoryIds = [selectedSubcategory];
    if (selectedFeature) filters.featureIds = [selectedFeature];
    if (showBestSellers) filters.isBestSeller = true;
    if (showNewProducts) filters.isNew = true;
    if (showDiscounted) filters.hasDiscount = true;

    return filterProducts(filters);
  }, [selectedCategory, selectedSubcategory, selectedFeature, showBestSellers, showNewProducts, showDiscounted]);

  // Get enriched products with category/subcategory/feature names
  const enrichedProducts = useMemo(() => {
    return filteredProducts.map(product => {
      const category = categories?.find(c => c._id === product.categoryId);
      const subcategory = categories?.find(s => s._id === product.subcategoryId); // Assuming subcategoryId is also a category ID or needs a different lookup
      const feature = features?.find(f => f._id === product.featureId);

      return {
        ...product,
        categoryName: category ? (category.nameAr || category.nameEn) : null,
        subcategoryName: subcategory ? (subcategory.nameAr || subcategory.nameEn) : null,
        featureName: feature ? (feature.nameAr || feature.nameEn) : null,
        displayName: product.nameAr || product.nameEn,
        displayDescription: product.descriptionAr || product.descriptionEn
      };
    });
  }, [filteredProducts, categories, features]);

  // Get subcategories for selected category
  const availableSubcategories = useMemo(() => {
    return selectedCategory ? getSubcategoriesByCategory(selectedCategory) : [];
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedFeature(null);
    setShowBestSellers(false);
    setShowNewProducts(false);
    setShowDiscounted(false);
  };

  return (
    <div className="product-catalog">
      <div className="catalog-header">
        <h1>{language === 'en' ? 'Product Catalog' : 'كتالوج المنتجات'}</h1>
        <p className="product-count">
          {language === 'en' 
            ? `Showing ${enrichedProducts.length} products`
            : `عرض ${enrichedProducts.length} منتج`
          }
        </p>
      </div>

      <div className="catalog-filters">
        <div className="filter-section">
          <h3>{language === 'en' ? 'Categories' : 'الفئات'}</h3>
          <select 
            value={selectedCategory || ''} 
            onChange={(e) => handleCategoryChange(Number(e.target.value) || null)}
          >
            <option value="">
              {language === 'en' ? 'All Categories' : 'جميع الفئات'}
            </option>
            {categories?.map(category => (
              <option key={category._id} value={category._id}>
                {category.nameAr || category.nameEn}
              </option>
            ))}
          </select>
        </div>

        {availableSubcategories.length > 0 && (
          <div className="filter-section">
            <h3>{language === 'en' ? 'Subcategories' : 'الفئات الفرعية'}</h3>
            <select 
              value={selectedSubcategory || ''} 
              onChange={(e) => setSelectedSubcategory(Number(e.target.value) || null)}
            >
              <option value="">
                {language === 'en' ? 'All Subcategories' : 'جميع الفئات الفرعية'}
              </option>
              {availableSubcategories.map(subcategory => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.nameAr || subcategory.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-section">
          <h3>{language === 'en' ? 'Features' : 'الميزات'}</h3>
          <select 
            value={selectedFeature || ''} 
            onChange={(e) => setSelectedFeature(Number(e.target.value) || null)}
          >
            <option value="">
              {language === 'en' ? 'All Features' : 'جميع الميزات'}
            </option>
            {features?.map(feature => (
              <option key={feature._id} value={feature._id}>
                {feature.nameAr || feature.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>{language === 'en' ? 'Special Filters' : 'فلاتر خاصة'}</h3>
          <div className="checkbox-filters">
            <label>
              <input 
                type="checkbox" 
                checked={showBestSellers}
                onChange={(e) => setShowBestSellers(e.target.checked)}
              />
              {language === 'en' ? 'Best Sellers' : 'الأكثر مبيعاً'}
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={showNewProducts}
                onChange={(e) => setShowNewProducts(e.target.checked)}
              />
              {language === 'en' ? 'New Products' : 'منتجات جديدة'}
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={showDiscounted}
                onChange={(e) => setShowDiscounted(e.target.checked)}
              />
              {language === 'en' ? 'On Sale' : 'في التخفيضات'}
            </label>
          </div>
        </div>

        <button className="clear-filters" onClick={clearFilters}>
          {language === 'en' ? 'Clear All Filters' : 'مسح جميع الفلاتر'}
        </button>
      </div>

      <div className="products-grid">
        {enrichedProducts.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.displayName} />
              <div className="product-badges">
                {product.isBestSeller && (
                  <span className="badge best-seller">
                    {language === 'en' ? 'Best Seller' : 'الأكثر مبيعاً'}
                  </span>
                )}
                {product.isNew && (
                  <span className="badge new">
                    {language === 'en' ? 'New' : 'جديد'}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="badge discount">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="product-info">
              <h3 className="product-name">{product.displayName}</h3>
              <p className="product-description">{product.displayDescription}</p>
              
              <div className="product-meta">
                <span className="category">{product.categoryName}</span>
                <span className="separator">›</span>
                <span className="subcategory">{product.subcategoryName}</span>
              </div>
              
              <div className="product-feature">
                <span className="feature-label">
                  {language === 'en' ? 'Feature:' : 'الميزة:'}
                </span>
                <span className="feature-value">{product.featureName}</span>
              </div>
              
              <div className="product-pricing">
                {product.discountPercentage ? (
                  <>
                    <span className="original-price">${product.originalPrice}</span>
                    
                  </>
                ) : (
                  <span className="price">${product.originalPrice}</span>
                )}
              </div>
              
              <div className="product-stock">
                <span className={`stock-status ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                  {language === 'en' 
                    ? `${product.stock} in stock`
                    : `${product.stock} متوفر في المخزون`
                  }
                </span>
              </div>
              
              <div className="product-colors">
                {product.colors.map(color => (
                  <span key={color} className="color-tag">{color}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrichedProducts.length === 0 && (
        <div className="no-products">
          <p>
            {language === 'en' 
              ? 'No products found matching your criteria.'
              : 'لم يتم العثور على منتجات تطابق معاييرك.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog; 
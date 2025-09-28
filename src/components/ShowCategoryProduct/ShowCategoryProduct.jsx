import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppData } from '../../contexts/AppDataContext';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../ProductCard/ProductCard';
import { useWishlist } from '../../contexts/WishlistContext';
import './ShowCategoryProduct.css';

const ShowCategoryProduct = () => {
  const { t, i18n } = useTranslation();
  const { allProducts, store } = useAppData();
  const { getMainCategories } = useCategories();
  const { 
    wishlistItems, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useWishlist();
  
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [categoryRefs, setCategoryRefs] = useState({});
  const currentLang = i18n.language;

  // الحصول على الكاتيجوريات الرئيسية
  const mainCategories = getMainCategories();

  // دالة للحصول على منتجات الكاتيجوري
  const getCategoryProducts = (categoryId) => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    
    return allProducts.filter(product => {
      const productCategoryId = product.category?._id || product.category?.id;
      return productCategoryId === categoryId;
    }).slice(0, 8); // عرض أول 8 منتجات فقط
  };

  // دالة إنشاء refs للكاتيجوريات
  useEffect(() => {
    if (mainCategories.length > 0) {
      const refs = {};
      mainCategories.forEach(category => {
        refs[category._id] = React.createRef();
      });
      setCategoryRefs(refs);
    }
  }, [mainCategories.length]);

  // دالة مراقبة التمرير
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.dataset.categoryId;
          if (categoryId) {
            setVisibleCategories(prev => {
              if (!prev.includes(categoryId)) {
                return [...prev, categoryId];
              }
              return prev;
            });
          }
        }
      });
    }, observerOptions);

    // مراقبة جميع الكاتيجوريات
    Object.values(categoryRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [categoryRefs]);

  // دالة معالجة المفضلة
  const handleWishlistToggle = async (product) => {
    const productId = product._id || product.id;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  // دالة الحصول على اسم الكاتيجوري
  const getCategoryName = (category) => {
    return currentLang === 'ar' ? category.nameAr : category.nameEn;
  };

  // دالة الحصول على رابط الكاتيجوري
  const getCategoryLink = (category) => {
    const slug = category.slug;
    const storeSlug = store?.slug || localStorage.getItem('storeSlug') || '';
    return `/${storeSlug}/category/${slug}`;
  };

  if (!mainCategories || mainCategories.length === 0) {
    return null;
  }

  return (
    <div className="show-category-product">
      {mainCategories.map((category) => {
        const categoryProducts = getCategoryProducts(category._id);
        
        // لا نعرض الكاتيجوري إذا لم يكن لديها منتجات
        if (categoryProducts.length === 0) return null;

        const isVisible = visibleCategories.includes(category._id);
        const categoryRef = categoryRefs[category._id];

        return (
          <div
            key={category._id}
            ref={categoryRef}
            data-category-id={category._id}
            className={`category-section ${isVisible ? 'visible' : ''}`}
          >
            <div className="category-header">
              <h2 className="category-title">
                {getCategoryName(category)}
              </h2>
              <a 
                href={getCategoryLink(category)}
                className="view-all-link"
              >
                {currentLang === 'ar' ? 'عرض الكل' : 'View All'}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
            </div>
            <div className="bestsellers-carousel" >
            <div className="bestsellers-track">
            <div className="category-products">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInWishlist={isInWishlist}
                  handleWishlistToggle={handleWishlistToggle}
                  categories={mainCategories}
                />
              ))}
            </div>
          </div>
          </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShowCategoryProduct;

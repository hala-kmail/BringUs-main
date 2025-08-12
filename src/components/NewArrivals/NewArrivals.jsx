import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useNewArrivalsConfig } from '../../hooks/useNewArrivalsConfig';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';

const NewArrivals = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate } = useAffiliateNavigation();
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const { categories } = useCategories();
  const { filterNewArrivals, sortNewArrivals } = useNewArrivalsConfig();
  
  // استخدام البيانات من الكونتكست بدلاً من useProducts
  const { products, isLoading: loading } = useAppData();
  
  // استخدام الدوال من useProducts
  const { 
    getFinalPrice,
    getMainImage,
    getProductName,
    isInStock
  } = useProducts();

  const currentLang = i18n.language;

  useEffect(() => {
    if (products && products.length > 0) {
      // دالة لفلترة المنتجات الجديدة بناءً على معيارين فقط
      const getNewArrivalProducts = () => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)); // 14 يوم
        const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // أسبوع واحد
       
       
        
        const newArrivals = products.filter(product => {
          // معيار 1: المنتجات المضافة حديثاً (في آخر 14 يوم)
          const isRecentlyCreated = product.createdAt && new Date(product.createdAt) >= twoWeeksAgo;
          
          // معيار 2: المنتجات التي زاد ستوكها (تم تحديث الستوك في آخر أسبوع)
          const hasStockIncrease = product.stockUpdatedAt && 
                                  new Date(product.stockUpdatedAt) >= oneWeekAgo && 
                                  (product.stock > 0 || product.availableQuantity > 0);
          
          // طباعة تفاصيل كل منتج
          const productName = product.nameAr || product.nameEn || product.titleAr || product.titleEn || `منتج ${product._id?.slice(-6)}`;
          const createdAt = product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US') : 'غير محدد';
          const stockUpdatedAt = product.stockUpdatedAt ? new Date(product.stockUpdatedAt).toLocaleDateString('en-US') : 'غير محدد';
          const stockQuantity = product.stock || product.availableQuantity || 0;
          
        
          
          // إرجاع المنتج إذا حقق أي من المعيارين
          return isRecentlyCreated || hasStockIncrease;
        });
        
       
        
        return newArrivals;
      };
      
      const newArrivals = getNewArrivalProducts();
      
      // ترتيب المنتجات حسب الأحدث (تاريخ الإنشاء أولاً)
      const sortedProducts = newArrivals.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return bDate - aDate;
      }).slice(0, 8); // أخذ أول 8 منتجات فقط
      
      setNewArrivalProducts(sortedProducts);
      
    }
  }, [products]);

  const handleAddToCart = (product) => {
    if (isInStock(product)) {
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

  return (
    <>
      {/* إظهار القسم فقط إذا كان هناك منتجات جديدة */}
      {newArrivalProducts.length > 0 && !loading ? (
        <section className="new-arrivals">
          <div className="new-arrivals-container">
            {/* Section Header */}
            <div className="section-header">
              <div className='section-header-title'>
                <h2 className="section-title">{t('new_arrivals.title')}</h2>
                <p className="section-subtitle">{t('new_arrivals.subtitle')}</p>
              </div>
             
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {newArrivalProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInWishlist={isInWishlist}
                  handleWishlistToggle={toggleWishlist}
                  handleAddToCart={handleAddToCart}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default NewArrivals; 
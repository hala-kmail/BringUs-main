import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import { getSimpleColorsFromColorsField, isDiscountActive, getEffectivePrice } from '../../utils/productUtils';
import { useCart } from '../../contexts/CartContext';
import { namer } from 'color-namer';

const ProductCard = ({
  product,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart: externalHandleAddToCart, // إضافة prop اختياري
  showStockInfo = false,
  showDiscountInfo = false,
  isListView = false,
  categories = [], // إضافة categories كـ prop
}) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const currentLang = i18n.language;
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  
  // دالة للبحث عن الكاتيجوري في categories باستخدام _id
  const findCategoryById = (categoryId) => {
    if (!categoryId || !categories.length) return null;
    return categories.find(cat => cat._id === categoryId);
  };
  
  // دالة تحويل اللون إلى اسم
  const getColorName = (color) => {
    try {
      const result = namer(color);
      const names = result.ntc || result.basic || result.html || result.pantone || [];
      return names[0]?.name || color;
    } catch (error) {
      return color;
    }
  };

  // دالة تحويل اللون إلى اسم بالعربية
  const getColorNameAr = (color) => {
    const colorMap = {
      '#ef4444': 'أحمر',
      '#22c55e': 'أخضر',
      '#3b82f6': 'أزرق',
      '#f59e0b': 'برتقالي',
      '#8b5cf6': 'بنفسجي',
      '#ec4899': 'وردي',
      '#f97316': 'برتقالي',
      '#eab308': 'أصفر',
      '#84cc16': 'أخضر فاتح',
      '#06b6d4': 'أزرق فاتح',
      '#6366f1': 'أزرق غامق',
      '#a855f7': 'بنفسجي فاتح',
      '#f43f5e': 'أحمر فاتح',
      '#14b8a6': 'أزرق مخضر',
      '#fbbf24': 'أصفر ذهبي',
      '#fb7185': 'وردي فاتح',
      '#34d399': 'أخضر فاتح',
      '#60a5fa': 'أزرق فاتح',
      '#a78bfa': 'بنفسجي فاتح',
      '#f472b6': 'وردي فاتح',
      '#000000': 'أسود',
      '#ffffff': 'أبيض',
      '#fff': 'أبيض',
      '#000': 'أسود',
      '#ffd700': 'ذهبي',
      '#a0522d': 'بني',
      '#eab308': 'أصفر ذهبي'
    };
    return colorMap[color] || getColorName(color);
  };

  // استخدام البيانات من API
  const productName = currentLang === 'ar' 
    ? (product.nameAr || product.name?.ar || product.name) 
    : (product.nameEn || product.name?.en || product.name);
  const productDescription = currentLang === 'ar' 
    ? (product.descriptionAr || product.description?.ar || product.description) 
    : (product.descriptionEn || product.description?.en || product.description);
  const productImage = product.mainImage || (product.images && product.images[0]) || null;
  
  // البحث عن الكاتيجوري الكاملة في categories
  const productCategoryId = product.category?._id || product.category?.id;
  const fullCategory = findCategoryById(productCategoryId);
  const categoryName = fullCategory ? (currentLang === 'ar' ? fullCategory.nameAr : fullCategory.nameEn) : null;
  
  // دالة لتوليد رابط الكاتيجوري الصحيح
  const getCategoryLink = (categoryId) => {
    if (!categoryId) return '#';
    
    // البحث عن الكاتيجوري في categories
    const category = findCategoryById(categoryId);
    if (!category) {
      console.log('Category not found for ID:', categoryId);
      return '#';
    }
    
    // استخدام slug إذا كان متوفراً، وإلا استخدم _id
    const categorySlug = category.slug || category.slugAr || category.slugEn || category._id;
    return `/category/${categorySlug}`;
  };

  // دالة لفحص ما إذا كان المنتج جديداً
  const isNewProduct = () => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)); // 14 يوم
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // أسبوع واحد
    
    // معيار 1: المنتجات المضافة حديثاً (في آخر 14 يوم)
    const isRecentlyCreated = product.createdAt && new Date(product.createdAt) >= twoWeeksAgo;
    
    // معيار 2: المنتجات التي زاد ستوكها (تم تحديث الستوك في آخر أسبوع)
    const hasStockIncrease = product.stockUpdatedAt && 
                            new Date(product.stockUpdatedAt) >= oneWeekAgo && 
                            (product.stock > 0 || product.availableQuantity > 0);
    
    const isNew = isRecentlyCreated || hasStockIncrease;
    
    // طباعة تفاصيل سبب اعتبار المنتج جديداً (مرة واحدة فقط)
    if (isNew && !product._loggedAsNew) {
      const productName = product.nameAr || product.nameEn || product.titleAr || product.titleEn || `منتج ${product._id?.slice(-6)}`;
      const createdAt = product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US') : 'غير محدد';
      const stockUpdatedAt = product.stockUpdatedAt ? new Date(product.stockUpdatedAt).toLocaleDateString('en-US') : 'غير محدد';
      const stockQuantity = product.stock || product.availableQuantity || 0;
      
     
      if (isRecentlyCreated) {
        // console.log(`     • مضافة حديثاً (آخر 14 يوم)`);
      }
      if (hasStockIncrease) {
        // console.log(`     • زاد ستوكها (آخر أسبوع)`);
      }
      // console.log('---');
      
      // وضع علامة لمنع التكرار
      product._loggedAsNew = true;
    }
    
    return isNew;
  };
  
  // دالة لتحديد حالة المخزون
  const getStockStatus = (product) => {
    if (product.stockStatus === 'out_of_stock' || product.availableQuantity === 0) return 'sold_out';
    if (product.availableQuantity <= product.lowStockThreshold) return 'low-stock';
    return 'in_stock';
  };

  const getStockStatusForAlmostFinishedSale = (quantity) => {
    if (quantity <= 4) return 'red';
    if (quantity <= 7) return 'orange';
    return 'yellow';
  };

  // التحقق من وجود تسميات للمنتج
  const hasNewLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'جديد' : 'new')
  );
  
  const hasFeaturedLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'مميز' : 'featured')
  );

  const hasSaleLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'تخفيض' : 'sale')
  );
  
  // دالة لتحليل المواصفات وعرضها
  const getProductSpecs = () => {
    if (!product.specificationValues || !Array.isArray(product.specificationValues)) {
      return [];
    }
    
    const specs = [];
    product.specificationValues.forEach(spec => {
      if (spec.title && spec.value) {
        specs.push({
          name: currentLang === 'ar' ? spec.titleAr || spec.title : spec.titleEn || spec.title,
          value: currentLang === 'ar' ? spec.valueAr || spec.value : spec.valueEn || spec.value
        });
      }
    });
    
    return specs.slice(0, 3); // عرض أول 3 مواصفات فقط
  };
  
  // معالجة الألوان - دعم كل من colors و allColors
  const processedColors = (() => {
    const colorsArray = product.colors || product.allColors || [];
    
    if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
      return [];
    }
    
    return colorsArray.map(color => {
      // إذا كان اللون مصفوفة (ألوان مدمجة)
      if (Array.isArray(color)) {
        return {
          type: 'mixed',
          value: color
        };
      }
      // إذا كان اللون نص (لون منفرد)
      else if (typeof color === 'string') {
        return {
          type: 'single',
          value: color
        };
      }
      return null;
    }).filter(Boolean); // حذف القيم الفارغة
  })();

  // منطق تحديد إذا المنتج في الأمنيات
  let inWishlist = false;
  if (typeof isInWishlist === 'function') {
    const productId = product._id || product.id;
    inWishlist = isInWishlist(productId);
  } else if (typeof isInWishlist === 'boolean') {
    inWishlist = isInWishlist;
  }

  // دالة معالجة النقر على زر المفضلة
  const handleWishlistClick = async () => {
    if (isWishlistLoading || !handleWishlistToggle) return;
    
    setIsWishlistLoading(true);
    try {
      await handleWishlistToggle(product);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // دالة معالجة النقر على زر إضافة للسلة
  const handleAddToCartClick = () => {
    if (isAddToCartLoading || product.stockStatus === 'out_of_stock' || product.availableQuantity === 0) return;
    
    // إذا كان هناك دالة خارجية، استخدمها
    if (externalHandleAddToCart) {
      externalHandleAddToCart(product);
      return;
    }
    
    // التنقل إلى صفحة تفاصيل المنتج
    window.location.href = `/product/${product._id}`;
  };
  
  return (
    <div className={`product-card${isListView ? ' list-view' : ''}`} dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product._id}`}>
          <img 
            className='product-image-img' 
            src={productImage || '/placeholder-product.jpg'} 
            alt={productName}
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </Link>

        {/* Wishlist Heart Icon */}
        <div
          className={`wishlist-btn ${inWishlist ? 'active' : ''} ${isWishlistLoading ? 'loading' : ''}`}
          onClick={handleWishlistClick}
          title={inWishlist ? (currentLang === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (currentLang === 'ar' ? 'أضف إلى المفضلة' : 'Add to wishlist')}
        >
          {isWishlistLoading ? (
            <div className="wishlist-loading-spinner"></div>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={inWishlist ? '#ef4444' : 'none'}
              stroke={inWishlist ? '#ef4444' : '#6b7280'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </div>


        {/* Badges */}
        <div className="product-badges">
          {isNewProduct() && (
            <span className="product-badge product-new-badge">
              {currentLang === 'ar' ? 'جديد' : 'New'}
            </span>
          )}
          {hasFeaturedLabel && (
            <span className="product-badge bestseller-badge">
              {currentLang === 'ar' ? 'مميز' : 'Featured'}
            </span>
          )}
          {hasSaleLabel && (
            <span className="product-badge product-discount-badge">
              {currentLang === 'ar' ? 'تخفيض' : 'Sale'}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="product-badge product-discount-badge">
              -{product.discountPercentage}%
            </span>
          )}
          {product.stockStatus === 'out_of_stock' && (
            <span className="product-badge out-of-stock-badge">
              {currentLang === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
            </span>
          )}
          {/* {(product.stockStatus === 'low_stock' || 
            (product.availableQuantity && product.lowStockThreshold && 
             product.availableQuantity <= product.lowStockThreshold && 
             product.availableQuantity > 0)) && (
            <span className="product-badge low-stock-badge">
              {currentLang === 'ar' ? 'مخزون منخفض' : 'Low Stock'}
            </span>
          )} */}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info-section product-info">
        <div className="product-info-top">
          <Link
            to={`/product/${product._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 className="product-top-name">{productName}</h3>
          </Link>
          
          {categoryName && product.category && (
            <Link 
              to={getCategoryLink(product.category._id)}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h4
                className="product-category-name"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '300',
                  color: '#6b7280',
                  margin: '0.25rem 0',
                  cursor: 'pointer'
                }}
              >
                {categoryName}
              </h4>
            </Link>
          )}
          
          {isListView && productDescription && (
            <div className="product-description">
              {productDescription}
            </div>
          )}
          
          {/* Stock Info (خاص بصفحة AlmostFinishedSale) */}
          {showStockInfo && (
            <div className="stock-info">
              <div className={`stock-level ${getStockStatus(product)}`}>
                <span className="stock-text">
                  {getStockStatus(product) === 'sold_out'
                    ? (currentLang === 'ar' ? 'نفدت الكمية' : 'Out of Stock')
                    : getStockStatus(product) === 'low-stock'
                      ? currentLang === 'ar' ? `${product.availableQuantity} متبقي فقط` : `${product.availableQuantity} Only left`
                      : currentLang === 'ar' ? 'في المخزون' : 'In Stock'}
                </span>
                {getStockStatus(product) !== 'sold_out' && (
                  <div className="stock-bar">
                    <div 
                      className={`stock-fill ${getStockStatusForAlmostFinishedSale(product.availableQuantity)}`} 
                      style={{ 
                        width: `${Math.min((product.availableQuantity / (product.lowStockThreshold * 2)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="product-info-bottom">
          {/* Colors */}
          {processedColors.length > 0 && (
            <div className="product-colors">
             
              {processedColors.slice(0, 5).map((colorObj, index) => {
                const colorName = currentLang === 'ar' 
                  ? (colorObj.type === 'mixed' 
                      ? colorObj.value.map(c => getColorNameAr(c)).join(' + ')
                      : getColorNameAr(colorObj.value))
                  : (colorObj.type === 'mixed'
                      ? colorObj.value.map(c => getColorName(c)).join(' + ')
                      : getColorName(colorObj.value));
                
                return (
                  <span
                    key={index}
                    className="color-swatch"
                    style={{
                      background:
                        colorObj.type === 'mixed'
                          ? `linear-gradient(45deg, ${colorObj.value.join(', ')})`
                          : colorObj.value,
                      border:
                        colorObj.type === 'single' &&
                        (colorObj.value === '#fff' || colorObj.value === '#ffffff')
                          ? '1px solid #ccc'
                          : undefined
                    }}
                    title={colorName}
                  ></span>
                );
              })}
              {processedColors.length > 5 && (
                <span className="color-swatch-more" title={currentLang === 'ar' ? 'المزيد من الألوان' : 'More colors'}>
                  +{processedColors.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="product-price-container">
            {product.discountPercentage > 0 && product.compareAtPrice > 0 ? (
              <>
                <span className="current-price">
                  {getEffectivePrice(product).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
                </span>
                <span className="original-price">
                  {product.compareAtPrice.toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </>
            ) : (
              <span className="current-price">
                {getEffectivePrice(product).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            )}
          </div>

       
         
        </div>

        {/* Floating View Details Button */}
        <button
          className={`floating-add-to-cart-btn view-details-btn ${isAddToCartLoading ? 'loading' : ''}`}
          onClick={handleAddToCartClick}
          disabled={product.stockStatus === 'out_of_stock' || isAddToCartLoading}
          title={currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
        >
          {isAddToCartLoading ? (
            <div className="add-to-cart-loading-spinner"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
        
        {/* Discount Info (خاص بصفحة AlmostFinishedSale) */}
        {showDiscountInfo && product.discountPercentage > 0 && product.compareAtPrice > 0 && (
          <div className="discount-info">
            <div className="savings-amount">
              <span className="savings-label">{currentLang === 'ar' ? 'توفير' : 'Save'}</span>
              <span className="savings-value">
                {(product.compareAtPrice - getEffectivePrice(product)).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            </div>
            <div className="discount-percentage-large">
              <span className="discount-text">{product.discountPercentage}% {currentLang === 'ar' ? 'خصم' : 'Off'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
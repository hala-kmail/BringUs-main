import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import { getSimpleColorsFromColorsField, isDiscountActive, getEffectivePrice, getPriceByUserRole, getOriginalPriceByUserRole ,isWholesaler} from '../../utils/productUtils';
import { useCart } from '../../contexts/CartContext';
import { namer } from 'color-namer';
import { useAppData } from '../../contexts/AppDataContext';
import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';

const ProductCard = ({
  product,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart: externalHandleAddToCart,
  showStockInfo = false,
  showDiscountInfo = false,
  isListView = false,
  categories = [],
}) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useAppData();
  const currentLang = i18n.language;
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const { store } = useAppData();

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
    if (!category) return '#';
    
    // استخدام slug من الكاتيجوري
    const categorySlug = currentLang === 'ar' ? category.slugAr : category.slugEn;
    return `/category/${categorySlug}`;
  };

  // دالة تحديد إذا كان المنتج جديد
  const isNewProduct = () => {
    if (!product.createdAt) return false;
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // منتج جديد إذا كان عمره 30 يوم أو أقل
  };

  // دالة تحديد حالة المخزون
  const getStockStatus = (product) => {
    if (product.stockStatus === 'out_of_stock' || product.stock === 0) return 'sold_out';
    if (product.stock <= (product.lowStockThreshold || 10)) return 'low-stock';
    return 'in_stock';
  };

  // دالة تحديد حالة المخزون لصفحة AlmostFinishedSale
  const getStockStatusForAlmostFinishedSale = (quantity) => {
    if (quantity <= 3) return 'red';
    if (quantity <= 7) return 'orange';
    if (quantity <= 10) return 'yellow';
    return 'green';
  };

  // دالة الحصول على المواصفات
  const getProductSpecs = () => {
    if (!product.specifications || !Array.isArray(product.specifications)) {
      return [];
    }

    return product.specifications
      .filter(spec => spec.name && spec.value)
      .slice(0, 3) // عرض أول 3 مواصفات فقط
      .map(spec => ({
        name: currentLang === 'ar' ? spec.nameAr : spec.nameEn,
        value: currentLang === 'ar' ? spec.valueAr : spec.valueEn
      }));
  };

  // معالجة الألوان
  const processedColors = (() => {
    const colorsField = product.colors || product.colorsField;
    
    if (!colorsField) {
      return [];
    }
    
    let colorsArray = [];
    
    // محاولة تحليل JSON إذا كان string
    if (typeof colorsField === 'string') {
      try {
        colorsArray = JSON.parse(colorsField);
      } catch (error) {
        console.error('Error parsing colors JSON:', error);
        return [];
      }
    } else if (Array.isArray(colorsField)) {
      // إذا كان array مباشرة (للتوافق مع الكود القديم)
      colorsArray = colorsField;
    } else {
      return [];
    }
    
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
    console.log('handleWishlistClick', product);

    setIsWishlistLoading(true);
    try {
      await handleWishlistToggle(product);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // دالة معالجة النقر على زر إضافة للسلة
  const handleAddToCartClick = () => {
    if (isAddToCartLoading || product.stockStatus === 'out_of_stock' || product.stock === 0) return;
    
    // إذا كان هناك دالة خارجية، استخدمها
    if (externalHandleAddToCart) {
      externalHandleAddToCart(product);
      return;
    }
    
    // التنقل إلى صفحة تفاصيل المنتج
    window.location.href = `/product/${product._id}`;
  };

  // تحديد إذا كان المنتج مميز
  const hasFeaturedLabel = product.featured || product.isFeatured || product.featuredLabel;
  
  // تحديد إذا كان المنتج في التخفيض
  const hasSaleLabel = product.saleLabel || product.isOnSale || product.salePercentage > 0;
  
  return (
    <div className={`product-card-new${isListView ? ' list-view' : ''}`} dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Product Labels - Top Right */}
      <div className="product-labels-new">
        {isNewProduct() && (
          <span className="product-label-new product-new-label">
            {currentLang === 'ar' ? 'جديد' : 'New'}
          </span>
        )}
        {hasFeaturedLabel && (
          <span className="product-label-new product-featured-label">
            {currentLang === 'ar' ? 'مميز' : 'Featured'}
          </span>
        )}
        {hasSaleLabel && (
          <span className="product-label-new product-sale-label">
            {currentLang === 'ar' ? 'تخفيض' : 'Sale'}
          </span>
        )}
        {product.stockStatus === 'out_of_stock' && (
          <span className="product-label-new product-out-of-stock-label">
            {currentLang === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
          </span>
        )}
        {/* Stock Level Badge for Almost Finished Sale */}
        {showStockInfo && product.stock > 0 && (
          (() => {
            const threshold = product.lowStockThreshold || 10;
            const stockLevel = getStockStatusForAlmostFinishedSale(product.stock);
            
            // Only show badge for low stock products (stock <= threshold)
            if (product.stock > threshold) {
              return null;
            }
            
            return (
              <span className={`product-label-new product-stock-label ${stockLevel}`}>
                {stockLevel === 'red'
                  ? (currentLang === 'ar' ? 'مخزون حرج' : 'Critical Stock')
                  : stockLevel === 'orange'
                    ? (currentLang === 'ar' ? 'مخزون منخفض' : 'Low Stock')
                    : (currentLang === 'ar' ? 'مخزون محدود' : 'Limited Stock')
                }
              </span>
            );
          })()
        )}
      </div>

      {/* Discount Badge - Top Left */}
      {product.salePercentage > 0 && (
        <div className="discount-badge-new">
          -{product.salePercentage}%
        </div>
      )}

      {/* Product Image - Centered */}
      <div className="product-image-new">
        <Link to={`/product/${product._id}`}>
          <img 
            className='product-image-img-new' 
            src={productImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUM3NSA2OC4zNzMgODEuMzczIDYyIDg4IDYySDIxMkMyMTguNjI3IDYyIDIyNSA2OC4zNzMgMjI1IDc1VjIyNUM2MjUgMjMxLjYyNyAyMTguNjI3IDIzOCAyMTIgMjM4SDg4QzgxLjM3MyAyMzggNzUgMjMxLjYyNyA3NSAyMjVWNzVaIiBmaWxsPSIjOUNBMEE2Ii8+CjxwYXRoIGQ9Ik0xMTIuNSAxMTIuNUMxMTIuNSAxMDUuODczIDExOC44NzMgMTAwIDEyNS41IDEwMEgxNzQuNUMxODEuMTI3IDEwMCAxODcuNSAxMDUuODczIDE4Ny41IDExMi41VjE4Ny41QzE4Ny41IDE5NC4xMjcgMTgxLjEyNyAyMDAgMTc0LjUgMjAwSDEyNS41QzExOC44NzMgMjAwIDExMi41IDE5NC4xMjcgMTEyLjUgMTg3LjVWMTEyLjVaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='} 
            alt={productName}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUM3NSA2OC4zNzMgODEuMzczIDYyIDg4IDYySDIxMkMyMTguNjI3IDYyIDIyNSA2OC4zNzMgMjI1IDc1VjIyNUM2MjUgMjMxLjYyNyAyMTguNjI3IDIzOCAyMTIgMjM4SDg4QzgxLjM3MyAyMzggNzUgMjMxLjYyNyA3NSAyMjVWNzVaIiBmaWxsPSIjOUNBMEE2Ii8+CjxwYXRoIGQ9Ik0xMTIuNSAxMTIuNUMxMTIuNSAxMDUuODczIDExOC44NzMgMTAwIDEyNS41IDEwMEgxNzQuNUMxODEuMTI3IDEwMCAxODcuNSAxMDUuODczIDE4Ny41IDExMi41VjE4Ny41QzE4Ny41IDE5NC4xMjcgMTgxLjEyNyAyMDAgMTc0LjUgMjAwSDEyNS41QzExOC44NzMgMjAwIDExMi41IDE5NC4xMjcgMTEyLjUgMTg3LjVWMTEyLjVaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=';
            }}
          />
        </Link>
      </div>

      {/* Product Description - Below Image */}
      <div className="product-description-new">
        <h3 className="product-title-new">{productName}</h3>
        {productDescription && (
          <p className="product-subtitle-new">{productDescription}</p>
        )}
      </div>

      {/* Pricing Information */}
      <div className="product-pricing-new">
        {isWholesaler() ? (
          // تاجر الجملة يرى سعر الجملة فقط بدون خصومات
          <div className="current-price-new">
            {formatPrice(getPriceByUserRole(product), store?.settings?.currency || 'ILS')}
          </div>
        ) : (
          // المستخدم العادي يرى السعر مع الخصومات والسعر السابق
          <>
            <div className="current-price-new">
              {formatPrice(getPriceByUserRole(product), store?.settings?.currency || 'ILS')}
            </div>
            {product.salePercentage > 0 && (product.compareAtPrice > 0 || product.price > getEffectivePrice(product)) && (
              <div className="original-price-new">
                {formatPrice(getOriginalPriceByUserRole(product), store?.settings?.currency || 'ILS')}
              </div>
            )}
          </>
        )}
      </div>
      

      {/* Action Buttons - Bottom */}
      <div className="action-buttons-new">
        <button
          className="add-to-cart-btn-new"
          onClick={handleAddToCartClick}
          disabled={product.stockStatus === 'out_of_stock' || isAddToCartLoading}
        >
          {isAddToCartLoading ? (
            <div className="add-to-cart-loading-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </button>
        
        <button
          className={`wishlist-btn-new ${inWishlist ? 'active' : ''} ${isWishlistLoading ? 'loading' : ''}`}
          onClick={handleWishlistClick}
          title={inWishlist ? (currentLang === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (currentLang === 'ar' ? 'أضف إلى المفضلة' : 'Add to wishlist')}
        >
          {isWishlistLoading ? (
            <div className="wishlist-loading-spinner"></div>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={inWishlist ? '#ffffff' : 'none'}
              stroke={inWishlist ? '#ffffff' : '#64748b'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
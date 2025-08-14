import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import ProductBreadcrumb from '../../components/ProductDetail/ProductBreadcrumb';
import ProductMediaGallery from '../../components/ProductDetail/ProductMediaGallery';
import ProductInfoSection from '../../components/ProductDetail/ProductInfoSection';
import ProductOptions from '../../components/ProductDetail/ProductOptions';
import ProductActions from '../../components/ProductDetail/ProductActions';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';
import './ProductDetail.css';
import namer from 'color-namer';

const API_BASE_URL = 'http://localhost:5001/api';
const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate } = useAffiliateNavigation();
  const { id: productId } = useParams();
  const currentLang = i18n.language;
  const { categories: allCategories } = useAppData();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [specMeta, setSpecMeta] = useState([]);
  const [variants, setVariants] = useState([]);
  const [baseProduct, setBaseProduct] = useState(null);
  const [effectiveAvailable, setEffectiveAvailable] = useState(null);

  const { 
    fetchProductById, 
    fetchProductWithVariants,
    getFinalPrice, 
    getMainImage, 
    getProductName, 
    getProductDescription,
    isInStock 
  } = useProducts();

  useScrollToTopOnChange([productId]);

  // جلب بيانات المواصفات من الـ API
  useEffect(() => {
    const fetchSpecsMeta = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/meta/product-specifications`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSpecMeta(data.data);
        }
      } catch (e) {
        setSpecMeta([]);
      }
    };
    fetchSpecsMeta();
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load product with its variants
        const result = await fetchProductWithVariants(productId);
        if (result && result.product) {
          const loadedBase = result.product;
          setBaseProduct(loadedBase);
          setProduct(loadedBase);
          setVariants(result.variants || []);

          // Set default color if available
          const simpleColors = getSimpleColorsFromColorsField(loadedBase);
          if (simpleColors && simpleColors.length > 0) {
            setSelectedColor(simpleColors[0]);
          }

          // Optionally set default spec
          if (loadedBase.specificationValues) {
            const sizeSpecs = loadedBase.specificationValues.filter(spec =>
              spec.title === 'الحجم' || spec.title === 'Size'
            );
            if (sizeSpecs.length > 0) {
              // keep selectedSpecs update if needed in the future
            }
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product with variants:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, fetchProductWithVariants]);

  const handleVariantClick = useCallback((variant) => {
    if (!variant) return;
    setProduct(variant);
    setSelectedImageIndex(0);
    setSelectedMediaIndex(0);
    const simpleColors = getSimpleColorsFromColorsField(variant);
    setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
    setSelectedSpecs({});
    // Scroll to top of gallery for better UX
    try {
      const container = document.querySelector('.product-detail-container');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {}
  }, []);

  const handleParentClick = useCallback(() => {
    if (!baseProduct) return;
    setProduct(baseProduct);
    setSelectedImageIndex(0);
    setSelectedMediaIndex(0);
    const simpleColors = getSimpleColorsFromColorsField(baseProduct);
    setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
    setSelectedSpecs({});
    try {
      const container = document.querySelector('.product-detail-container');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {}
  }, [baseProduct]);

  function getColorKey(hex) {
    if (!hex) return '';
    try {
      const colorName = namer(hex);
      return colorName.ntc[0]?.name || hex;
    } catch (error) {
      return hex;
    }
  }

  function getColorLabel(hex) {
    if (!hex) return '';
    // لون مختلط (مثل "#841717+#cb5555")
    if (hex.includes('+')) {
      return t('filters.color_names.mixed');
    }
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey.toLowerCase()}`);
    if (!translation || translation === `filters.color_names.${colorKey.toLowerCase()}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }
  
  const mediaItems = product ? [
    // إضافة الصورة الرئيسية أولاً إذا كانت موجودة
    ...(product.mainImage ? [{ type: 'image', url: product.mainImage, thumbnail: product.mainImage, title: getProductName(product, currentLang) }] : []),
    // إضافة باقي الصور
    ...(product.images || []).map(img => ({ type: 'image', url: img, thumbnail: img, title: getProductName(product, currentLang) })),
    // إضافة الفيديو من videoUrl إذا كان موجوداً
    ...(product.videoUrl ? [{ 
      type: 'video', 
      url: product.videoUrl, 
      thumbnail: product.mainImage || (product.images && product.images[0]), 
      title: getProductName(product, currentLang),
      isExternalVideo: true
    }] : []),
    // إضافة الفيديوهات الأخرى
    ...(product.videos || []).map(video => ({ type: 'video', url: video.url, thumbnail: video.thumbnail, title: video.title || getProductName(product, currentLang) }))
  ] : [];



  const handleAddToCart = async () => {
    console.log(product);


    // التحقق من صحة المنتج قبل الإضافة للسلة
    const validationErrors = [];
    
    // التحقق من اللون إذا كان مطلوباً
    const simpleColors = getSimpleColorsFromColorsField(product);
    if (simpleColors && simpleColors.length > 0 && !selectedColor) {
      validationErrors.push('color_required');
    }
    
    if (validationErrors.includes('color_required')) {
      alert(t('product_detail.select_color_first'));
      return;
    }
    
    // التحقق من الكمية المطلوبة مع المخزون المتوفر (حسب المواصفات المختارة)
    const availableToUse = (effectiveAvailable ?? product.availableQuantity ?? 0);
    if (quantity > availableToUse) {
      alert(currentLang === 'ar' 
        ? `الكمية المطلوبة (${quantity}) أكبر من المخزون المتوفر (${availableToUse})`
        : `Requested quantity (${quantity}) is greater than available stock (${availableToUse})`
      );
      return;
    }
    
    setAddToCartLoading(true);
    try {
      // تجميع جميع المواصفات المحددة
      const selectedOptions = {
        selectedColor,
        quantity,
        // إضافة جميع المواصفات الأخرى المحددة
        ...selectedSpecs
      };
      
      // طباعة المواصفات المختارة في الكونسول
      console.log('🛒 Selected Options before adding to cart:');
      console.log('   Color:', selectedColor);
      console.log('   Quantity:', quantity);
      console.log('   Selected Specs:', selectedSpecs);
      console.log('   Full Options Object:', selectedOptions);
      
      const success = await addToCart(product, selectedOptions);
      
      if (success) {
       
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <SecondaryNavbar />
        <div className="product-detail-loading">
          <div className="loading-spinner"></div>
          <p>{currentLang === 'ar' ? 'جاري تحميل المنتج...' : 'Loading product...'}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <SecondaryNavbar />
        <div className="product-detail-error">
          <h2>{currentLang === 'ar' ? 'خطأ في تحميل المنتج' : 'Error Loading Product'}</h2>
          <p>{error || (currentLang === 'ar' ? 'المنتج غير موجود' : 'Product not found')}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            {currentLang === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const productName = getProductName(product, currentLang);
  
  return (
    <div className="product-detail-page">
      <Navbar />
      <SecondaryNavbar />
      
      {isMobileSearchOpen && (
        <MobileSearch 
          isOpen={isMobileSearchOpen} 
          onClose={() => setIsMobileSearchOpen(false)} 
        />
      )}

      <div className="product-detail-container">
        <ProductBreadcrumb 
          category={product.category}
          productName={productName}
          currentLang={currentLang}
          t={t}
          allCategories={allCategories || []}
        />

        <div className="product-detail-content">
          <div className="product-media-column">
            <ProductMediaGallery
              mediaItems={mediaItems}
              productName={productName}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              selectedMediaIndex={selectedMediaIndex}
              setSelectedMediaIndex={setSelectedMediaIndex}
              isZoomModalOpen={isZoomModalOpen}
              setIsZoomModalOpen={setIsZoomModalOpen}
              currentLang={currentLang}
              t={t}
            />

            {/* Variant main-image thumbnails + base product thumbnail */}
            {(variants && variants.length > 0) || baseProduct ? (
              <div className="variant-thumbnails">
                {/* Base product thumbnail first (only if not currently displayed) */}
                {baseProduct && product?._id !== baseProduct._id && (
                  <button
                    key={`base-${baseProduct._id}`}
                    type="button"
                    className="variant-thumb"
                    title={getProductName(baseProduct, currentLang)}
                    onClick={handleParentClick}
                  >
                    <img
                      src={baseProduct.mainImage || (baseProduct.images && baseProduct.images[0])}
                      alt={getProductName(baseProduct, currentLang)}
                    />
                  </button>
                )}
                {/* Other variants except the currently displayed one */}
                {variants && variants.length > 0 && variants
                  .filter((v) => v._id !== product?._id)
                  .map((v) => (
                    <button
                      key={v._id || v.id}
                      type="button"
                      className="variant-thumb"
                      title={getProductName(v, currentLang)}
                      onClick={() => handleVariantClick(v)}
                    >
                      <img
                        src={v.mainImage || (v.images && v.images[0])}
                        alt={getProductName(v, currentLang)}
                      />
                    </button>
                  ))}
              </div>
            ) : null}
          </div>

          <div className="product-info">
            <ProductInfoSection
              product={product}
              productName={productName}
              productDescription={getProductDescription(product, currentLang)}
              productPrice={getFinalPrice(product)}
              categoryName={product.category ? (currentLang === 'ar' ? product.category.nameAr : product.category.nameEn) : ''}
              specifications={product.specificationValues || []}
              currentLang={currentLang}
              t={t}
              quantity={quantity}
            />

            <ProductOptions
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSpecs={selectedSpecs}
              setSelectedSpecs={setSelectedSpecs}
              quantity={quantity}
              setQuantity={setQuantity}
              getColorLabel={getColorLabel}
              currentLang={currentLang}
              t={t}
              specificationsMeta={specMeta}
              onAvailabilityChange={setEffectiveAvailable}
            />

            <ProductActions
              product={product}
              quantity={quantity}
              isInStock={isInStock(product)}
              addToCartLoading={addToCartLoading}
              handleAddToCart={handleAddToCart}
              handleWishlistToggle={handleWishlistToggle}
              isInWishlist={isInWishlist}
              currentLang={currentLang}
              t={t}
              canAddToCart={(effectiveAvailable ?? product.availableQuantity ?? 0) > 0}
            />
          </div>
        </div>

        {/* Related Products */}
        {product && (
        <RelatedProducts 
            currentProduct={product}
            categoryId={product.category?._id || product.category}
        />
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 
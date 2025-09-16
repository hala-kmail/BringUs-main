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
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
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
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistAction, setWishlistAction] = useState(null); // 'add' or 'remove'

  const { 
    fetchProductById, 
    fetchProductWithVariants,
    fetchSpecificVariant,
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

  const handleVariantClick = useCallback(async (variant) => {
    if (!variant) return;
    
    try {
      console.log('🔄 Fetching detailed variant information for:', {
      variantId: variant._id || variant.id,
      variantName: variant.nameAr || variant.nameEn,
      productId
    });
      
      // Fetch detailed variant information from API
      const detailedVariant = await fetchSpecificVariant(productId, variant._id || variant.id);
      
      if (detailedVariant) {
        console.log('✅ Variant details loaded successfully:', detailedVariant);
        console.log('   - Name:', detailedVariant.nameAr || detailedVariant.nameEn);
        console.log('   - Price:', detailedVariant.price);
        console.log('   - Stock:', detailedVariant.availableQuantity);
        console.log('   - Images:', detailedVariant.images?.length || 0);
        console.log('   - Main Image:', detailedVariant.mainImage);
        console.log('   - Specification Values:', detailedVariant.specificationValues?.length || 0);
        console.log('   - Category:', detailedVariant.category?.nameAr || detailedVariant.category?.nameEn);
        console.log('   - Display Name:', displayName);
        
        // The detailedVariant should already be enriched from the hook
        // Just ensure we have the category information
        const enrichedVariant = {
          ...detailedVariant,
          // Ensure category information is preserved
          category: detailedVariant.category || baseProduct?.category
        };
        
        console.log('🔄 Setting enriched variant as current product:', {
          id: enrichedVariant._id,
          name: enrichedVariant.nameAr || enrichedVariant.nameEn,
          price: enrichedVariant.price,
          stock: enrichedVariant.availableQuantity,
          images: enrichedVariant.images?.length || 0,
          mainImage: enrichedVariant.mainImage,
          category: enrichedVariant.category?.nameAr || enrichedVariant.category?.nameEn
        });
        setProduct(enrichedVariant);
        
        // Reset UI state for the new variant
        setSelectedImageIndex(0);
        setSelectedMediaIndex(0);
        
        // Set default color for the new variant
        const simpleColors = getSimpleColorsFromColorsField(enrichedVariant);
        setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
        setSelectedSpecs({});
        
        // Force a small delay to ensure state updates properly
        setTimeout(() => {
          // Scroll to top of gallery for better UX
          try {
            const container = document.querySelector('.product-detail-container');
            if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (_) {}
        }, 100);
      } else {
        // Fallback to the variant data we already have
        console.log('⚠️ Using fallback variant data:', {
          id: variant._id,
          name: variant.nameAr || variant.nameEn,
          price: variant.price,
          stock: variant.availableQuantity
        });
        setProduct(variant);
        
        setSelectedImageIndex(0);
        setSelectedMediaIndex(0);
        const simpleColors = getSimpleColorsFromColorsField(variant);
        setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
        setSelectedSpecs({});
        
        // Force a small delay to ensure state updates properly
        setTimeout(() => {
          try {
            const container = document.querySelector('.product-detail-container');
            if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (_) {}
        }, 100);
      }
    } catch (error) {
      console.error('❌ Error fetching variant details:', error);
      console.log('🔄 Falling back to original variant data:', {
        id: variant._id,
        name: variant.nameAr || variant.nameEn,
        price: variant.price,
        stock: variant.availableQuantity
      });
      // Fallback to the variant data we already have
      setProduct(variant);
      
      setSelectedImageIndex(0);
      setSelectedMediaIndex(0);
      const simpleColors = getSimpleColorsFromColorsField(variant);
      setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
      setSelectedSpecs({});
      
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        try {
          const container = document.querySelector('.product-detail-container');
          if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
      }, 100);
    }
  }, [fetchSpecificVariant, productId]);

  const handleParentClick = useCallback(() => {
    if (!baseProduct) return;
    
    console.log('🔄 Switching to parent product:', {
      id: baseProduct._id,
      name: baseProduct.nameAr || baseProduct.nameEn,
      price: baseProduct.price,
      stock: baseProduct.availableQuantity,
      images: baseProduct.images?.length || 0,
      mainImage: baseProduct.mainImage,
      category: baseProduct.category?.nameAr || baseProduct.category?.nameEn
    });
    
    setProduct(baseProduct);
    setSelectedImageIndex(0);
    setSelectedMediaIndex(0);
    const simpleColors = getSimpleColorsFromColorsField(baseProduct);
    setSelectedColor(simpleColors && simpleColors.length > 0 ? simpleColors[0] : '');
    setSelectedSpecs({});
    
    // Force a small delay to ensure state updates properly
    setTimeout(() => {
      try {
        const container = document.querySelector('.product-detail-container');
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {}
    }, 100);
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
  
  // Get product name early to avoid reference error
  const productName = getProductName(product, currentLang);
  const displayName = productName || product?.nameAr || product?.nameEn || (currentLang === 'ar' ? 'منتج غير معروف' : 'Unknown Product');
  
  const mediaItems = product ? [
    // إضافة الصورة الرئيسية أولاً إذا كانت موجودة
    ...(product.mainImage ? [{ type: 'image', url: product.mainImage, thumbnail: product.mainImage, title: displayName }] : []),
    // إضافة باقي الصور
    ...(product.images || []).map(img => ({ type: 'image', url: img, thumbnail: img, title: displayName })),
    // إضافة الفيديو من videoUrl إذا كان موجوداً
    ...(product.videoUrl ? [{ 
      type: 'video', 
      url: product.videoUrl, 
      thumbnail: product.mainImage || (product.images && product.images[0]), 
      title: displayName,
      isExternalVideo: true
    }] : []),
    // إضافة الفيديوهات الأخرى
    ...(product.videos || []).map(video => ({ type: 'video', url: video.url, thumbnail: video.thumbnail, title: video.title || displayName }))
  ].filter(item => item.url && item.url.trim() !== '') : []; // Filter out items without URLs or empty URLs

  // Debug logging for media items
  if (process.env.NODE_ENV === 'development') {
    console.log('📸 Media items created:', {
      totalItems: mediaItems.length,
      mainImage: product?.mainImage,
      imagesCount: product?.images?.length || 0,
      videoUrl: product?.videoUrl,
      videosCount: product?.videos?.length || 0,
      mediaItems: mediaItems.map(item => ({
        type: item.type,
        url: item.url,
        title: item.title
      })),
      displayName
    });
  }



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
    const isCurrentlyInWishlist = isInWishlist(product._id || product.id);
    setWishlistAction(isCurrentlyInWishlist ? 'remove' : 'add');
    setShowWishlistModal(true);
  };

  const handleConfirmWishlistToggle = async () => {
    await toggleWishlist(product);
    setShowWishlistModal(false);
    setWishlistAction(null);
  };

  const handleCancelWishlistToggle = () => {
    setShowWishlistModal(false);
    setWishlistAction(null);
  };

  const handleShare = async () => {
    try {
      // Get current URL with affiliate code if present
      const currentUrl = window.location.href;
      
      // Check if Web Share API is supported
      if (navigator.share) {
        const shareData = {
          title: displayName,
          text: currentLang === 'ar' 
            ? `تحقق من هذا المنتج: ${displayName}` 
            : `Check out this product: ${displayName}`,
          url: currentUrl
        };
        
        await navigator.share(shareData);
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(currentUrl);
        
        // Show success message
        const message = currentLang === 'ar' 
          ? 'تم نسخ رابط المنتج إلى الحافظة!' 
          : 'Product link copied to clipboard!';
        alert(message);
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      
      // Fallback: Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        const message = currentLang === 'ar' 
          ? 'تم نسخ رابط المنتج إلى الحافظة!' 
          : 'Product link copied to clipboard!';
        alert(message);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        const errorMessage = currentLang === 'ar' 
          ? 'حدث خطأ في مشاركة المنتج' 
          : 'Error sharing product';
        alert(errorMessage);
      }
    }
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

  // Debug logging to help identify issues
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Current product state:', {
      id: product._id,
      name: product.nameAr || product.nameEn,
      price: product.price,
      stock: product.availableQuantity,
      images: product.images?.length || 0,
      mainImage: product.mainImage,
      hasVariants: product.hasVariants,
      isParent: product.isParent,
      category: product.category?.nameAr || product.category?.nameEn,
      specificationValues: product.specificationValues?.length || 0,
      displayName
    });
  }

  
  

  
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
          productName={displayName}
          currentLang={currentLang}
          t={t}
          allCategories={allCategories || []}
          key={`breadcrumb-${product._id}`} // Force re-render when product changes
        />

        <div className="product-detail-content">
          <div className="product-media-column">
            <ProductMediaGallery
              mediaItems={mediaItems}
              productName={displayName}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              selectedMediaIndex={selectedMediaIndex}
              setSelectedMediaIndex={setSelectedMediaIndex}
              isZoomModalOpen={isZoomModalOpen}
              setIsZoomModalOpen={setIsZoomModalOpen}
              currentLang={currentLang}
              t={t}
              key={`gallery-${product._id}`} // Force re-render when product changes
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
                      title={getProductName(baseProduct, currentLang) || (currentLang === 'ar' ? 'المنتج الأساسي' : 'Base Product')}
                      onClick={handleParentClick}
                    >
                                            <img
                          src={baseProduct.mainImage || (baseProduct.images && baseProduct.images[0])}
                          alt={getProductName(baseProduct, currentLang) || (currentLang === 'ar' ? 'المنتج الأساسي' : 'Base Product')}
                          onError={(e) => {
                            console.warn('Failed to load base product image:', baseProduct.mainImage);
                            e.target.style.display = 'none';
                          }}
                        />
                  </button>
                )}
                {/* Other variants except the currently displayed one */}
                {variants && variants.length > 0 && variants
                  .filter((v) => v._id !== product?._id)
                  .map((v) => {
                    const variantImage = v.mainImage || (v.images && v.images[0]);
                    const variantName = getProductName(v, currentLang);
                    
                    return (
                                           <button
                       key={v._id || v.id}
                       type="button"
                       className="variant-thumb"
                                               title={variantName || (currentLang === 'ar' ? 'متغير' : 'Variant')}
                       onClick={() => handleVariantClick(v)}
                     >
                                                 <img
                           src={variantImage}
                           alt={variantName || (currentLang === 'ar' ? 'متغير' : 'Variant')}
                           onError={(e) => {
                             console.warn('Failed to load variant image:', variantImage);
                             e.target.style.display = 'none';
                           }}
                         />
                      </button>
                    );
                  })}
              </div>
            ) : null}
          </div>

          <div className="product-info">
            <ProductInfoSection
              product={product}
              productName={displayName}
              productDescription={getProductDescription(product, currentLang)}
              productPrice={getFinalPrice(product)}
              categoryName={product.category ? (currentLang === 'ar' ? product.category.nameAr : product.category.nameEn) : ''}
              specifications={product.specificationValues || []}
              currentLang={currentLang}
              t={t}
              quantity={quantity}
              key={`info-${product._id}`} // Force re-render when product changes
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
              key={`options-${product._id}`} // Force re-render when product changes
            />

            <ProductActions
              product={product}
              quantity={quantity}
              addToCartLoading={addToCartLoading}
              handleAddToCart={handleAddToCart}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleShare={handleShare}
              canAddToCart={(effectiveAvailable ?? product.availableQuantity ?? 0) > 0}
              key={`actions-${product._id}`} // Force re-render when product changes
            />
          </div>
        </div>

        {/* Related Products */}
        {product && (
        <RelatedProducts 
            currentProduct={product}
            categoryId={product.category?._id || product.category}
            key={`related-${product._id}`} // Force re-render when product changes
        />
        )}
      </div>

      {/* Wishlist Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showWishlistModal}
        onClose={handleCancelWishlistToggle}
        onConfirm={handleConfirmWishlistToggle}
        title={wishlistAction === 'add' ? t('wishlist.confirm_add_title') : t('wishlist.confirm_remove_title')}
        message={wishlistAction === 'add' ? t('wishlist.confirm_add_message') : t('wishlist.confirm_remove_message')}
        confirmText={wishlistAction === 'add' ? t('wishlist.add_to_wishlist') : t('wishlist.remove_from_wishlist')}
        cancelText={t('common.cancel')}
        type="info"
      />
    </div>
  );
};

export default ProductDetail; 
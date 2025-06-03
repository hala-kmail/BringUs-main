import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import { getProductById, getCategoryById, getSubcategoryById, getFeatureById } from '../../data/index';
import './ProductDetail.css';
import namer from 'color-namer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const currentLang = i18n.language;

  // قاموس ترجمة الألوان الشائعة
  const colorNameTranslations = {
    "red": { ar: "أحمر", en: "Red" },
    "green": { ar: "أخضر", en: "Green" },
    "yellow": { ar: "أصفر", en: "Yellow" },
    "blue": { ar: "أزرق", en: "Blue" },
    "purple": { ar: "بنفسجي", en: "Purple" },
    "orange": { ar: "برتقالي", en: "Orange" },
    "pink": { ar: "وردي", en: "Pink" },
    "brown": { ar: "بني", en: "Brown" },
    "white": { ar: "أبيض", en: "White" },
    "black": { ar: "أسود", en: "Black" },
    "grey": { ar: "رمادي", en: "Grey" },
    "gray": { ar: "رمادي", en: "Gray" },
    "gold": { ar: "ذهبي", en: "Gold" },
    "golden": { ar: "ذهبي", en: "Golden" },
    "silver": { ar: "فضي", en: "Silver" },
    "beige": { ar: "بيج", en: "Beige" },
    "cyan": { ar: "سماوي", en: "Cyan" },
    "teal": { ar: "تركوازي", en: "Teal" },
    "olive": { ar: "زيتي", en: "Olive" },
    "navy": { ar: "كحلي", en: "Navy" },
    "maroon": { ar: "خمري", en: "Maroon" },
    "lime": { ar: "ليموني", en: "Lime" },
    "coral": { ar: "مرجاني", en: "Coral" },
    "indigo": { ar: "نيلي", en: "Indigo" },
    "amber": { ar: "كهرماني", en: "Amber" },
  };

  // دالة لإرجاع اسم اللون المترجم من hex
  function getColorName(hex, lang = 'ar') {
    if (!hex) return '';
    if (hex === 'mixed') return lang === 'ar' ? 'ألوان متدرجة' : 'Mixed Colors';
    try {
      const nameObj = namer(hex).ntc[0];
      const name = nameObj.name.toLowerCase();
      if (colorNameTranslations[name]) {
        return colorNameTranslations[name][lang] || nameObj.name;
      }
      // إذا لم يوجد ترجمة، أعد الاسم الإنجليزي
      return nameObj.name;
    } catch {
      return hex;
    }
  }

  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  function getColorLabel(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }

  // Helper function to check if discount is active
  const isDiscountActive = (product) => {
    if (!product.discountEndTime) return false;
    const now = new Date();
    const endTime = new Date(product.discountEndTime);
    return now < endTime;
  };

  // Helper function to get effective price
  const getEffectivePrice = (product) => {
    const basePrice = product.basePrice || product.price;
    if (product.discountPercentage && isDiscountActive(product)) {
      const discountAmount = (basePrice * product.discountPercentage) / 100;
      return basePrice - discountAmount;
    }
    return basePrice;
  };

  // Create combined media array with images and videos - moved before useEffect
  const mediaItems = product ? [
    // Add main image first
    { type: 'image', url: product.image, thumbnail: product.image, title: product.name[currentLang] },
    // Add additional images
    ...(product.additionalImages || []).map(img => ({ 
      type: 'image', 
      url: img, 
      thumbnail: img, 
      title: product.name[currentLang] 
    })),
    // Add videos
    ...(product.videos || []).map(video => ({ 
      type: 'video', 
      url: video.url, 
      thumbnail: video.thumbnail, 
      title: video.title || product.name[currentLang] 
    }))
  ] : [];

  const getCurrentMedia = () => {
    if (!mediaItems || mediaItems.length === 0) {
      return { type: 'image', url: '', thumbnail: '', title: '' };
    }
    return mediaItems[selectedMediaIndex] || mediaItems[0];
  };

  // Reset selectedMediaIndex when mediaItems changes
  useEffect(() => {
    if (mediaItems.length > 0 && selectedMediaIndex >= mediaItems.length) {
      setSelectedMediaIndex(0);
    }
  }, [mediaItems.length, selectedMediaIndex]);

  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);
      const productData = getProductById(parseInt(id));
      
      if (productData) {
        setProduct(productData);
        setSelectedColor(productData.colors?.[0] || '');
        setSelectedSize(productData.sizes?.[0]?.name || '');
      } else {
        console.error('Product not found');
        navigate('/shop');
      }
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (product) {
      // Validation: Check if color is required and selected
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        alert(currentLang === 'ar' 
          ? 'يرجى اختيار اللون أولاً'
          : 'Please select a color first'
        );
        return;
      }

      // Validation: Check if size is required and selected
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert(currentLang === 'ar' 
          ? 'يرجى اختيار الحجم أولاً'
          : 'Please select a size first'
        );
        return;
      }

      setAddToCartLoading(true);
      
      try {
        // Add to cart with selected options
        addToCart(product, {
          selectedColor,
          selectedSize,
          quantity
        });

        console.log('Cart updated:', {
          product: product.name[currentLang],
          color: selectedColor,
          size: selectedSize,
          quantity
        });

        // The cart context now handles showing the success message

      } catch (error) {
        console.error('Error adding to cart:', error);
        alert(currentLang === 'ar' 
          ? 'حدث خطأ أثناء إضافة المنتج إلى السلة'
          : 'Error adding product to cart'
        );
      } finally {
        setAddToCartLoading(false);
      }
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleWhatsAppOrder = () => {
    if (product) {
      const finalPrice = discountPrice || originalPrice;
      const totalPrice = (finalPrice * quantity).toFixed(2);
      
      let message = `مرحباً، أريد أن أطلب ${product.name[currentLang]}`;
      message += `\nالكمية: ${quantity}`;
      message += `\nالسعر الإجمالي: $${totalPrice}`;
      
      if (selectedColor) {
        message += `\nاللون: ${selectedColor}`;
      }
      
      if (selectedSize) {
        message += `\nالحجم: ${selectedSize}`;
      }
      
      const phoneNumber = "+1234567890"; // Replace with actual WhatsApp number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (product) {
      const shareData = {
        title: product.name[currentLang],
        text: `${product.name[currentLang]} - ${product.description[currentLang]}`,
        url: window.location.href
      };

      try {
        // Check if Web Share API is supported
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy URL to clipboard
          await navigator.clipboard.writeText(window.location.href);
          alert(currentLang === 'ar' 
            ? 'تم نسخ رابط المنتج إلى الحافظة!'
            : 'Product link copied to clipboard!'
          );
        }
      } catch (error) {
        // If both methods fail, show the URL in an alert
        alert(currentLang === 'ar' 
          ? `رابط المنتج: ${window.location.href}`
          : `Product link: ${window.location.href}`
        );
      }
    }
  };

  const handleZoomToggle = () => {
    setIsZoomModalOpen(!isZoomModalOpen);
  };

  const handleZoomModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsZoomModalOpen(false);
    }
  };

  // Handle keyboard events for zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isZoomModalOpen && mediaItems.length > 0) {
        if (e.key === 'Escape') {
          setIsZoomModalOpen(false);
        } else if (e.key === 'ArrowLeft') {
          setSelectedMediaIndex(prev => 
            prev > 0 ? prev - 1 : mediaItems.length - 1
          );
        } else if (e.key === 'ArrowRight') {
          setSelectedMediaIndex(prev => 
            prev < mediaItems.length - 1 ? prev + 1 : 0
          );
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZoomModalOpen, mediaItems.length]);

  // Calculate price based on selected size
  const calculatePrice = () => {
    if (!product) return { originalPrice: 0, discountPrice: 0 };
    
    let basePriceOriginal = product.originalPrice;
    let basePriceDiscount = product.discountPrice;
    
    // Find selected size and add price modifier
    if (product.sizes && selectedSize) {
      const size = product.sizes.find(s => s.name === selectedSize);
      if (size && size.priceModifier) {
        basePriceOriginal += size.priceModifier;
        if (basePriceDiscount) {
          basePriceDiscount += size.priceModifier;
        }
      }
    }
    
    return {
      originalPrice: basePriceOriginal,
      discountPrice: basePriceDiscount
    };
  };

  const { originalPrice, discountPrice } = calculatePrice();

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, product?.stock || 1));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  // Mobile search handlers
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  if (loading) {
    return (
      <div className="product-detail">
        <TopBar />
        <Navbar 
          onMobileSearchToggle={handleMobileSearchToggle}
          isMobileSearchOpen={isMobileSearchOpen}
        />
        <SecondaryNavbar />
        <MobileSearch
          isOpen={isMobileSearchOpen}
          onClose={handleMobileSearchClose}
        />
        <div className="product-detail-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {t('common.loading')}...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <TopBar />
        <Navbar 
          onMobileSearchToggle={handleMobileSearchToggle}
          isMobileSearchOpen={isMobileSearchOpen}
        />
        <SecondaryNavbar />
        <MobileSearch
          isOpen={isMobileSearchOpen}
          onClose={handleMobileSearchClose}
        />
        <div className="product-detail-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            المنتج غير موجود
          </div>
        </div>
      </div>
    );
  }

  const category = getCategoryById(product.categoryId);
  const subcategory = getSubcategoryById(product.subcategoryId);
  const feature = getFeatureById(product.featureId);

  return (
    <div className="product-detail">
      <TopBar />
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      
      <div className="product-detail-content">
        {/* Breadcrumb Navigation */}
        <nav className="product-breadcrumb">
          <Link to="/">
            <span>{t('secondary_navbar.home')}</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/shop">
            <span>{t('secondary_navbar.shop')}</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
          {category && (
            <>
              <span>{category.name[currentLang]}</span>
              <span className="breadcrumb-separator">›</span>
            </>
          )}
          <span className="breadcrumb-current">{product.name[currentLang]}</span>
        </nav>

        <div className="product-detail-container">
          {/* Product Image Gallery */}
          <div className="product-image-gallery">
            <div className="product-main-image">
              {getCurrentMedia().type === 'video' ? (
                <video 
                  src={getCurrentMedia().url} 
                  controls
                  poster={getCurrentMedia().thumbnail}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                  {currentLang === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو.' : 'Your browser does not support the video tag.'}
                </video>
              ) : (
                <img 
                  src={getCurrentMedia().url} 
                  alt={product.name[currentLang]} 
                />
              )}
              <button className="product-zoom-btn" onClick={handleZoomToggle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>
            
            {/* Media Title */}
            {getCurrentMedia().type === 'video' && getCurrentMedia().title && (
              <div className="media-title">
                <h4>{getCurrentMedia().title}</h4>
              </div>
            )}
            
            {mediaItems.length > 1 && (
              <div className="product-thumbnail-images">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className={`thumbnail-container ${selectedMediaIndex === index ? 'thumbnail-active' : ''}`}
                    onClick={() => setSelectedMediaIndex(index)}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                    />
                    {item.type === 'video' && (
                      <div className="video-play-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Countdown Timer for Discounted Products */}
            {product.discountPercentage && product.discountEndTime && isDiscountActive(product) && (
              <div className="product-countdown-section">
                <div className="countdown-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="countdown-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="countdown-title">
                    {currentLang === 'ar' ? 'ينتهي العرض خلال' : 'Offer ends in'}
                  </span>
                </div>
                <CountdownTimer endTime={product.discountEndTime} size="small" />
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="product-detail-info">
            {/* Product Badges */}
            <div className="product-detail-badges">
              {product.isBestSeller && (
                <span className="product-detail-badge product-bestseller-badge">
                  {t('product_detail.best_seller')}
                </span>
              )}
              {product.isNew && (
                <span className="product-detail-badge product-new-badge">
                  {t('product_detail.new')}
                </span>
              )}
              {product.discountPercentage && (
                <span className="product-detail-badge product-sale-badge">
                  -{product.discountPercentage}%
                </span>
              )}
              {feature && (
                <span className="product-detail-badge product-organic-badge">
                  {feature.name[currentLang]}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="product-title">{product.name[currentLang]}</h1>

            {/* Product Description */}
            <div className="product-description">
              <p>{product.description[currentLang]}</p>
            </div>

            {/* Product Price */}
            <div className="product-detail-price">
              {discountPrice ? (
                <>
                  <span className="product-current-price">
                    ${discountPrice.toFixed(2)}
                  </span>
                  <span className="product-original-price">
                    ${originalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="product-current-price">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="product-color-selection">
                <h3 className="selection-title">
                  {currentLang === 'ar' ? 'اللون' : 'Color'}: <span className="selected-option">{getColorLabel(selectedColor, t)}</span>
                </h3>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={
                        color === "mixed"
                          ? { background: "linear-gradient(90deg, #eab308 0%, #ef4444 50%, #3b82f6 100%)" }
                          : { background: color, border: color === "#fff" ? "2px solid #e2e8f0" : undefined }
                      }
                      onClick={() => setSelectedColor(color)}
                      title={getColorLabel(color, t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="product-size-selection">
                <h3 className="selection-title">
                  {currentLang === 'ar' ? 'الحجم' : 'Size'}: <span className="selected-option">{selectedSize}</span>
                </h3>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <div
                      key={size.name}
                      className={`size-option ${selectedSize === size.name ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size.name)}
                    >
                      <span className="size-name">{size.name}</span>
                      <span className="size-name-ar">{size.nameAr}</span>
                      {size.priceModifier && (
                        <span className="size-price-modifier">
                          +${size.priceModifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="product-detail-actions">
              <div className="product-quantity-selector">
                <button onClick={decrementQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={incrementQuantity}>+</button>
              </div>
              
              <div className="product-cart-buttons">
                <button 
                  className="add-to-cart-btn" 
                  onClick={handleAddToCart}
                  disabled={addToCartLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="button-text">
                    {addToCartLoading 
                      ? (currentLang === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                      : t('product_detail.add_to_cart')
                    }
                  </span>
                </button>

                <button 
                  className="product-view-cart-btn" 
                  onClick={() => navigate('/cart')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="button-text">
                    {t('product_detail.view_cart')}
                  </span>
                </button>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="product-additional-actions">
              <button 
                className={`product-action-btn ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
                onClick={handleWishlistToggle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isInWishlist(product.id) ? t('product_detail.remove_from_wishlist') : t('product_detail.add_to_wishlist')}
              </button>

              <button className="product-action-btn" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {t('product_detail.share')}
              </button>

              {/* WhatsApp Order Button */}
              <button className="product-action-btn product-whatsapp-action" onClick={handleWhatsAppOrder}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                {t('product_detail.order_whatsapp')}
              </button>
            </div>

            {/* Product Features */}
            <div className="product-detail-features">
              <div className="product-feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="product-feature-content">
                  <span className="product-feature-title">{t('features.fast_delivery.title')}</span>
                  <span className="product-feature-description">{t('features.fast_delivery.description')}</span>
                </div>
              </div>

              <div className="product-feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="product-feature-content">
                  <span className="product-feature-title">{t('features.quality_assurance.title')}</span>
                  <span className="product-feature-description">{t('features.quality_assurance.description')}</span>
                </div>
              </div>

              <div className="product-feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <div className="product-feature-content">
                  <span className="product-feature-title">{t('features.payment_online.title')}</span>
                  <span className="product-feature-description">{t('features.payment_online.description')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts 
        currentProductId={product.id} 
        currentCategoryId={product.categoryId} 
      />

      {/* Zoom Modal */}
      {isZoomModalOpen && mediaItems.length > 0 && (
        <div className="zoom-modal-overlay" onClick={handleZoomModalClose}>
          <div className="zoom-modal-content">
            <button 
              className="zoom-modal-close" 
              onClick={() => setIsZoomModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="zoom-modal-media">
              {getCurrentMedia().type === 'video' && getCurrentMedia().url ? (
                <video 
                  src={getCurrentMedia().url} 
                  controls
                  poster={getCurrentMedia().thumbnail}
                  autoPlay
                  className="zoom-modal-video"
                >
                  {currentLang === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو.' : 'Your browser does not support the video tag.'}
                </video>
              ) : (
                <img 
                  src={getCurrentMedia().url || ''} 
                  alt={product.name[currentLang]}
                  className="zoom-modal-image"
                />
              )}
            </div>

            {mediaItems.length > 1 && (
              <>
                <button 
                  className="zoom-modal-nav zoom-modal-prev" 
                  onClick={() => setSelectedMediaIndex(prev => 
                    prev > 0 ? prev - 1 : mediaItems.length - 1
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  className="zoom-modal-nav zoom-modal-next" 
                  onClick={() => setSelectedMediaIndex(prev => 
                    prev < mediaItems.length - 1 ? prev + 1 : 0
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="zoom-modal-info">
              <h3>{product.name[currentLang]}</h3>
              {getCurrentMedia().type === 'video' && getCurrentMedia().title && (
                <p>{getCurrentMedia().title}</p>
              )}
              <div className="zoom-modal-counter">
                {selectedMediaIndex + 1} / {mediaItems.length}
              </div>
            </div>

            {mediaItems.length > 1 && (
              <div className="zoom-modal-thumbnails">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className={`zoom-thumbnail ${selectedMediaIndex === index ? 'zoom-thumbnail-active' : ''}`}
                    onClick={() => setSelectedMediaIndex(index)}
                  >
                    <img src={item.thumbnail || ''} alt={item.title || ''} />
                    {item.type === 'video' && (
                      <div className="zoom-thumbnail-play-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import { getProductById, getCategoryById, getFeatureById } from '../../data/index';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [feature, setFeature] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 6,
    minutes: 50,
    seconds: 2
  });

  const currentLang = i18n.language;

  useEffect(() => {
    if (id) {
      // Scroll to top when product changes
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      const productData = getProductById(parseInt(id));
      if (productData) {
        setProduct(productData);
        
        // Get category information
        const categoryData = getCategoryById(productData.categoryId);
        setCategory(categoryData);
        
        // Get feature information if exists
        if (productData.featureId) {
          const featureData = getFeatureById(productData.featureId);
          setFeature(featureData);
        }
    } else {
        navigate('/shop');
      }
    }
  }, [id, navigate]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    console.log('Added to cart:', { product, quantity });
    // Add to cart logic
  };

  const handleBuyNow = () => {
    console.log('Buy now:', { product, quantity });
    // Buy now logic
  };

  const handleAddToWishlist = () => {
    if (product) {
      // Convert product data to match wishlist format
      const wishlistProduct = {
        id: product.id,
        name: product.name,
        image: product.image, // Use the main image
        originalPrice: product.originalPrice,
        discountPrice: product.discountPrice,
        discountPercentage: product.discountPercentage,
        categoryId: product.categoryId,
        isBestSeller: product.isBestSeller,
        isNew: product.isNew,
        featureId: product.featureId
      };
      toggleWishlist(wishlistProduct);
    }
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name[currentLang],
      text: `${product.name[currentLang]} - ${product.description[currentLang]}`,
      url: window.location.href
    };

    try {
      // Try to use Web Share API if available (mobile browsers)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // For desktop: Show share options
        const userChoice = window.prompt(
          `${t('product_detail.share_product')}\n\n` +
          `1. ${t('product_detail.copy_link_question')}\n` +
          `2. أو اكتب "w" للمشاركة عبر الواتساب\n\n` +
          `اختر (1 أو اكتب w):`,
          "1"
        );
        
        if (userChoice === null) {
          return; // User cancelled
        }
        
        if (userChoice.toLowerCase() === 'w' || userChoice.toLowerCase() === 'whatsapp') {
          // Open WhatsApp share
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.text}\n${shareData.url}`)}`;
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } else {
          // Copy to clipboard (default choice)
          try {
            await navigator.clipboard.writeText(shareData.url);
            alert(t('product_detail.link_copied'));
          } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareData.url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(t('product_detail.link_copied'));
          }
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert(t('product_detail.link_copied'));
      } catch (err) {
        alert(t('product_detail.share_error'));
      }
    }
  };

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
        <main className="product-detail-content">
          <div className="loading-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
            {t('common.loading')}...
          </div>
        </main>
      </div>
    );
  }

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

      <main className="product-detail-content">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <span onClick={() => navigate('/')}>{t('product_detail.home')}</span>
          <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
          <span onClick={() => navigate('/category')}>{category && category.name[currentLang]}</span>
          <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
          <span className="breadcrumb-current">{product.name[currentLang]}</span>
        </div>

        <div className="product-detail-container">
          {/* Product Images */}
          <div className="product-image-gallery">
            <div className="product-main-image">
              <img src={product.image} alt={product.name[currentLang]} />
              <button 
                className="product-zoom-btn"
                aria-label={t('product_detail.zoom_image')}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>
            {/* Note: In the new structure, we only have one main image per product */}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            {/* Badges */}
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
              {product.discountPrice && (
                <span className="product-detail-badge product-sale-badge">
                  {t('product_detail.sale')}
                </span>
              )}
              {feature && (
                <span className="product-detail-badge product-feature-badge">
                  {feature.name[currentLang]}
                </span>
              )}
            </div>

            <h1 className="product-title">{product.name[currentLang]}</h1>

            <p className="product-description">{product.description[currentLang]}</p>

            {/* Price */}
            <div className="product-detail-price">
              {product.discountPrice ? (
                <>
                  <span className="product-current-price">
                    {product.discountPrice.toFixed(2)} {t('product_detail.currency')}
                  </span>
                  <span className="product-original-price">
                    {product.originalPrice.toFixed(2)} {t('product_detail.currency')}
                  </span>
                </>
              ) : (
                <span className="product-current-price">
                  {product.originalPrice.toFixed(2)} {t('product_detail.currency')}
                </span>
              )}
            </div>

            {/* WhatsApp Order Button */}
            <button className="product-whatsapp-btn">
              {t('product_detail.order_whatsapp')}
            </button>

            {/* Special Offer Timer */}
            <div className="product-special-offer">
              <span className="product-offer-label">{t('product_detail.special_offer')}</span>
              <div className="product-countdown">
                <span className="product-time-unit">
                  <span className="time-number">{String(timeLeft.days).padStart(2, '0')}</span>
                </span>
                <span className="time-separator">:</span>
                <span className="product-time-unit">
                  <span className="time-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                </span>
                <span className="time-separator">:</span>
                <span className="product-time-unit">
                  <span className="time-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </span>
                <span className="time-separator">:</span>
                <span className="product-time-unit">
                  <span className="time-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </span>
              </div>
              <span className="product-offer-text">{t('product_detail.offer_text')}</span>
            </div>

            {/* Quantity and Actions */}
            <div className="product-detail-actions">
              <div className="product-quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  aria-label={t('product_detail.decrease_quantity')}
                  type="button"
                >−</button>
                <span aria-label={`${t('product_detail.quantity')}: ${quantity}`}>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  aria-label={t('product_detail.increase_quantity')}
                  type="button"
                >+</button>
              </div>
              <button 
                className="product-add-to-cart-btn" 
                onClick={handleAddToCart}
                aria-label={`${t('product_detail.add_to_cart')} ${product.name[currentLang]}`}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="button-text">{t('product_detail.add_to_cart')}</span>
              </button>
              <button 
                className="product-buy-now-btn" 
                onClick={handleBuyNow}
                aria-label={`${t('product_detail.buy_now')} ${product.name[currentLang]}`}
                type="button"
              >
                {t('product_detail.buy_now')}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="product-additional-actions">
              <button 
                className={`product-action-btn ${isInWishlist(product.id) ? 'in-wishlist' : ''}`} 
                onClick={handleAddToWishlist}
              >
                {isInWishlist(product.id) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                )}
                {isInWishlist(product.id) ? t('product_detail.remove_from_wishlist') : t('product_detail.add_to_wishlist')}
              </button>
              <button className="product-action-btn" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {t('product_detail.share')}
              </button>
            </div>

            {/* Product Features */}
            <div className="product-detail-features">
              <div className="product-feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <div className="product-feature-content">
                  <strong className="product-feature-title">{t('product_detail.payment')}</strong>
                  <span className="product-feature-description">{t('product_detail.payment_desc')}</span>
                </div>
              </div>
              <div className="product-feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="product-feature-content">
                  <strong className="product-feature-title">{t('product_detail.warranty')}</strong>
                  <span className="product-feature-description">{t('product_detail.warranty_desc')}</span>
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
      </main>
    </div>
  );
};

export default ProductDetail; 
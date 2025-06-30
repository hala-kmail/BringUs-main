import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import { getProductById, getCategoryById, getFeatureById } from '../../data/index';
import './ProductDetail.css';
import namer from 'color-namer';
import { getEffectivePrice, isDiscountActive } from '../../components/ProductCard/ProductCard';
import ProductMediaGallery from '../../components/ProductDetail/ProductMediaGallery';
import ProductInfoSection from '../../components/ProductDetail/ProductInfoSection';
import ProductOptions from '../../components/ProductDetail/ProductOptions';
import ProductActions from '../../components/ProductDetail/ProductActions';
import ProductBreadcrumb from '../../components/ProductDetail/ProductBreadcrumb';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [ product, setProduct] = useState(null);
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

  useScrollToTopOnChange([id]);

  // قاموس ترجمة الألوان الشائعة
 
  console.log('ProductActions is loaded!');
  // دالة لإرجاع اسم اللون المترجم من hex

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getColorLabel(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const mediaItems = product ? [
    
    { type: 'image', url: product.image, thumbnail: product.image, title: product.name[currentLang] },
   
    ...(product.additionalImages || []).map(img => ({ 
      type: 'image', 
      url: img, 
      thumbnail: img, 
      title: product.name[currentLang] 
    })),
    
    ...(product.videos || []).map(video => ({ 
      type: 'video', 
      url: video.url, 
      thumbnail: video.thumbnail, 
      title: video.title || product.name[currentLang] 
    }))
  ] : [];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const getCurrentMedia = () => {
    if (!mediaItems || mediaItems.length === 0) {
      return { type: 'image', url: '', thumbnail: '', title: '' };
    }
    return mediaItems[selectedMediaIndex] || mediaItems[0];
  };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (mediaItems.length > 0 && selectedMediaIndex >= mediaItems.length) {
      setSelectedMediaIndex(0);
    }
  }, [mediaItems.length, selectedMediaIndex]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleAddToCart = async () => {
    if (product) {
      // Validation: Check if color is required and selected
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        alert(t('product_detail.select_color_first'));
        return;
      }

      // Validation: Check if size is required and selected
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert(t('product_detail.select_size_first'));
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
        alert(t('product_detail.error_adding_to_cart'));
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleWhatsAppOrder = () => {
    if (product) {
      const finalPrice =  originalPrice;
      const totalPrice = (finalPrice * quantity).toFixed(2);
      
      let message = `${t('product_detail.whatsapp_greeting', { name: product.name[currentLang] })}`;
      message += `\n${t('product_detail.quantity')}: ${quantity}`;
      message += `\n${t('product_detail.total_price')}: ₪${totalPrice}`;
      
      if (selectedColor) {
        message += `\n${t('product_detail.color')}: ${getColorLabel(selectedColor, t)}`;
      }
      
      if (selectedSize) {
        message += `\n${t('product_detail.size')}: ${selectedSize}`;
      }
      
      const phoneNumber = "+970594056090"; // Replace with actual WhatsApp number
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
          alert(t('product_detail.link_copied'));
        }
      } catch (error) {
        // If both methods fail, show the URL in an alert
        alert(`${t('product_detail.product_link')}: ${window.location.href}`);
      }
    }
  };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    if (!product) return { originalPrice: 0 };
    
    let basePriceOriginal = product.originalPrice;
    
    
    // Find selected size and add price modifier
    if (product.sizes && selectedSize) {
      const size = product.sizes.find(s => s.name === selectedSize);
      if (size && size.priceModifier) {
        basePriceOriginal += size.priceModifier;
        
      }
    }
    
    return {
      originalPrice: basePriceOriginal
    };
  };

  const { originalPrice } = calculatePrice();

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
        {/* <TopBar /> */}
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
        {/* <TopBar /> */}
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
  const feature = getFeatureById(product.featureId);

  return (
    <div className="product-detail">
      {/* <TopBar /> */}
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
        <ProductBreadcrumb product={product} category={category} t={t} currentLang={currentLang} />
        <div className="product-detail-container">
          {/* Product Image Gallery */}
          <ProductMediaGallery
            mediaItems={mediaItems}
            selectedMediaIndex={selectedMediaIndex}
            setSelectedMediaIndex={setSelectedMediaIndex}
            isZoomModalOpen={isZoomModalOpen}
            setIsZoomModalOpen={setIsZoomModalOpen}
            productName={product.name[currentLang]}
            currentLang={currentLang}
            t={t}
          />

          {/* Product Information */}
          <div className="product-detail-info-wrapper">
            <ProductInfoSection
              product={product}
              category={category}
              feature={feature}
              currentLang={currentLang}
              t={t}
              originalPrice={originalPrice}
             
              isDiscountActive={isDiscountActive}
              getEffectivePrice={getEffectivePrice}
            />
            <ProductOptions
              product={product}
              currentLang={currentLang}
              t={t}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              getColorLabel={getColorLabel}
            />
             <ProductActions
              quantity={quantity}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
              addToCartLoading={addToCartLoading}
              handleAddToCart={handleAddToCart}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleShare={handleShare}
              handleWhatsAppOrder={handleWhatsAppOrder}
              
              key={i18n.language}
              product={product}
            /> 
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
              {mediaItems[selectedMediaIndex]?.type === 'video' && mediaItems[selectedMediaIndex]?.url ? (
                <video 
                  src={mediaItems[selectedMediaIndex].url} 
                  controls
                  poster={mediaItems[selectedMediaIndex].thumbnail}
                  autoPlay
                  className="zoom-modal-video"
                >
                  {t('product_detail.video_not_supported')}
                </video>
              ) : (
                <img 
                  src={mediaItems[selectedMediaIndex]?.url || ''} 
                  alt={product.name[currentLang]}
                  className="zoom-modal-image"
                />
              )}
            </div>
            {mediaItems.length > 1 && (
              <>
                <button 
                  className="zoom-modal-nav-btn-prev" 
                  onClick={() => setSelectedMediaIndex((selectedMediaIndex - 1 + mediaItems.length) % mediaItems.length)}
                  style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                  aria-label="Previous"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="zoom-modal-nav-btn-next" 
                  onClick={() => setSelectedMediaIndex((selectedMediaIndex + 1) % mediaItems.length)}
                  style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                  aria-label="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="zoom-modal-info">
              <h3>{product.name[currentLang]}</h3>
              {mediaItems[selectedMediaIndex]?.type === 'video' && mediaItems[selectedMediaIndex]?.title && (
                <p>{mediaItems[selectedMediaIndex].title}</p>
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
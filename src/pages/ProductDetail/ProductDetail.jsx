import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import { getProductById, getCategoryById, getSubcategoryById, getFeatureById } from '../../data/index';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [addToCartLoading, setAddToCartLoading] = useState(false);

  const currentLang = i18n.language;

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

        // Navigate to cart page
        navigate('/cart');

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

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout or cart
    navigate('/cart');
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

  if (loading) {
    return (
      <div className="product-detail">
        <TopBar />
        <Navbar />
        <SecondaryNavbar />
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
        <Navbar />
        <SecondaryNavbar />
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

  // Get all product images (main image + additional images if available)
  const productImages = [product.image, ...(product.additionalImages || [])];

  return (
    <div className="product-detail">
      <TopBar />
      <Navbar />
      <SecondaryNavbar />
      
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
              <img 
                src={productImages[selectedImageIndex]} 
                alt={product.name[currentLang]} 
              />
              <button className="product-zoom-btn" onClick={() => {}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>
            
            {productImages.length > 1 && (
              <div className="product-thumbnail-images">
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name[currentLang]} ${index + 1}`}
                    className={selectedImageIndex === index ? 'thumbnail-active' : ''}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
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

            {/* WhatsApp Order Button */}
            <button className="product-whatsapp-btn" onClick={handleWhatsAppOrder}>
              📱 {t('product_detail.order_whatsapp')}
            </button>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="product-color-selection">
                <h3 className="selection-title">
                  {currentLang === 'ar' ? 'اللون' : 'Color'}: <span className="selected-option">{selectedColor}</span>
                </h3>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
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
              
              <button 
                className="product-add-to-cart-btn" 
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

              <button className="product-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {t('product_detail.share')}
              </button>

              <button className="product-action-btn" onClick={handleBuyNow}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {currentLang === 'ar' ? 'اطلب الآن' : 'Order Now'}
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
    </div>
  );
};

export default ProductDetail; 
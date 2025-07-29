import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import useProducts from '../../hooks/useProducts';
import './ProductDetail.css';
import namer from 'color-namer';
import ProductMediaGallery from '../../components/ProductDetail/ProductMediaGallery';
import ProductInfoSection from '../../components/ProductDetail/ProductInfoSection';
import ProductOptions from '../../components/ProductDetail/ProductOptions';
import ProductActions from '../../components/ProductDetail/ProductActions';
import ProductBreadcrumb from '../../components/ProductDetail/ProductBreadcrumb';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
import { validateProductForCart } from '../../utils/productUtils';
import { useAppData } from '../../contexts/AppDataContext';
const API_BASE_URL = 'http://localhost:5001/api';
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { categories: allCategories } = useAppData();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [specMeta, setSpecMeta] = useState([]);

  const { 
    fetchProductById, 
    getFinalPrice, 
    getMainImage, 
    getProductName, 
    getProductDescription,
    isInStock 
  } = useProducts();

  const currentLang = i18n.language;

  useScrollToTopOnChange([id]);

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
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await fetchProductById(id);
        
        if (productData) {
          setProduct(productData);
          // تعيين اللون الأول كافتراضي إذا كان متوفراً
          if (productData.allColors && productData.allColors.length > 0) {
            setSelectedColor(productData.allColors[0]);
          }
          // تعيين الحجم الأول كافتراضي إذا كان متوفراً
          if (productData.specificationValues) {
            const sizeSpecs = productData.specificationValues.filter(spec => 
              spec.title === 'الحجم' || spec.title === 'Size'
            );
            if (sizeSpecs.length > 0) {
              setSelectedSize(sizeSpecs[0].value);
            }
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, fetchProductById]);

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
    ...(product.images || []).map(img => ({ type: 'image', url: img, thumbnail: img, title: getProductName(product, currentLang) })),
    ...(product.videos || []).map(video => ({ type: 'video', url: video.url, thumbnail: video.thumbnail, title: video.title || getProductName(product, currentLang) }))
  ] : [];

  const handleAddToCart = async () => {
    if (!isInStock(product)) return;

    // التحقق من صحة المنتج قبل الإضافة للسلة
    const validationErrors = validateProductForCart(product, selectedColor, selectedSize);
    
    if (validationErrors.includes('color_required')) {
      alert(t('product_detail.select_color_first'));
      return;
    }
    
    if (validationErrors.includes('size_required')) {
      alert(t('product_detail.select_size_first'));
      return;
    }
    
    setAddToCartLoading(true);
    try {
      const cartItem = {
        id: product._id,
        name: getProductName(product, currentLang),
        price: getFinalPrice(product),
        image: getMainImage(product),
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        // إضافة معلومات إضافية للمنتج
        productId: product._id,
        category: product.category,
        specifications: {
          color: selectedColor,
          size: selectedSize
        }
      };
      addToCart(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: product._id,
      name: getProductName(product, currentLang),
      price: getFinalPrice(product),
      image: getMainImage(product)
    };
    toggleWishlist(wishlistItem);
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
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              getColorLabel={getColorLabel}
              currentLang={currentLang}
              t={t}
              specificationsMeta={specMeta}
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
            />
          </div>
        </div>

        <RelatedProducts 
          categoryId={product.category?._id}
          currentProductId={product._id}
        />
      </div>
    </div>
  );
};

export default ProductDetail; 
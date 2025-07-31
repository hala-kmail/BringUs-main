import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import './ProductDetail.css';
import namer from 'color-namer';

const API_BASE_URL = 'http://localhost:5001/api';
const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
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

  const { 
    fetchProductById, 
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
          const productData = await fetchProductById(productId);
        
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
              // سيتم تعيينه في selectedSpecs بدلاً من selectedSize
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
  }, [productId, fetchProductById]);

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
    // إضافة الفيديوهات
    ...(product.videos || []).map(video => ({ type: 'video', url: video.url, thumbnail: video.thumbnail, title: video.title || getProductName(product, currentLang) }))
  ] : [];



  const handleAddToCart = async () => {
    if (!isInStock(product)) {
      // إظهار رسالة مناسبة حسب حالة المخزون
      if (product.stockStatus === 'out_of_stock' || product.availableQuantity === 0) {
        alert(currentLang === 'ar' ? 'المنتج غير متوفر في المخزون' : 'Product is out of stock');
      } else {
        alert(currentLang === 'ar' ? 'لا يمكن إضافة المنتج للكارت' : 'Cannot add product to cart');
      }
      return;
    }

    // التحقق من صحة المنتج قبل الإضافة للسلة
    const validationErrors = [];
    
    // التحقق من اللون إذا كان مطلوباً
    if (product.allColors && product.allColors.length > 0 && !selectedColor) {
      validationErrors.push('color_required');
    }
    
    if (validationErrors.includes('color_required')) {
      alert(t('product_detail.select_color_first'));
      return;
    }
    
    // التحقق من الكمية المطلوبة مع المخزون المتوفر
    if (product.availableQuantity && quantity > product.availableQuantity) {
      alert(currentLang === 'ar' 
        ? `الكمية المطلوبة (${quantity}) أكبر من المخزون المتوفر (${product.availableQuantity})`
        : `Requested quantity (${quantity}) is greater than available stock (${product.availableQuantity})`
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
      
      const success = await addToCart(product, selectedOptions);
      
      if (success) {
        // إظهار رسالة نجاح مع تحذير إذا كان المخزون منخفض
        if (product.stockStatus === 'low_stock' || 
            (product.availableQuantity && product.availableQuantity <= (product.lowStockThreshold || 10))) {
          alert(currentLang === 'ar' 
            ? `تم إضافة المنتج للكارت بنجاح! تحذير: المخزون منخفض (${product.availableQuantity} متبقي)`
            : `Product added to cart successfully! Warning: Low stock (${product.availableQuantity} remaining)`
          );
        }
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
              selectedSpecs={selectedSpecs}
              setSelectedSpecs={setSelectedSpecs}
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
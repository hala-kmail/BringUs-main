import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useDeliveryMethods } from '../../hooks/useDeliveryMethods';
import usePaymentMethods from '../../hooks/usePaymentMethods';
import usePaymentVerification from '../../hooks/usePaymentVerification';
import useOrders from '../../hooks/useOrders';
import palpayImg from '../../assets/PALPAY.png';
import paypalImg from '../../assets/Paypal_2014_logo.png';
import reflectImg from '../../assets/reflect.jpg';
import cashImg from '../../assets/cash on delivery.png';
import visaImg from '../../assets/visa.png';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './Checkout.css';
import namer from 'color-namer';
import { getUserRole } from '../../utils/productUtils';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import OrderSummary from '../../components/Checkout/OrderSummary';
import { validateRequired, validateAndSanitizePhone } from '../../utils/validation';
import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';
//-----------------------------------Checkout------------------------------------------------  
const Checkout = () => {

  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const location = useLocation();
  const { cartItems, getCartTotals, clearCart, loading: cartLoading, updateShippingArea, shippingAreaId } = useCart();
  const { store, user } = useAppData();
  const currentLang = i18n.language;
  
  // Debug logging for store and user data
  // console.log('Checkout - Store from context:', store);
  // console.log('Checkout - User from context:', user);
  // console.log('Checkout - Store ID:', store?._id);
  // console.log('Checkout - User ID:', user?._id);
  
  // جلب طرق التوصيل من API
  const { deliveryMethods, loading: deliveryMethodsLoading, error: deliveryMethodsError } = useDeliveryMethods(store?._id);
  
  // جلب طرق الدفع من API
  const { paymentMethods: apiPaymentMethods, loading: paymentMethodsLoading, error: paymentMethodsError, initializeLahzaPayment, verifyLahzaPayment } = usePaymentMethods();
  
  // التحقق من الدفع
  const { isVerifying, verificationResult, checkPaymentFromURL } = usePaymentVerification();
  
  // إدارة الطلبات
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();
  
  const isWholesalerUser = () => {
    const userRole = getUserRole();
    return userRole === 'wholesaler';
  };

  // دالة للحصول على عنوان المتجر
  const getStoreAddress = () => {
    if (!store?.contact?.address) return null;
    
    const address = store.contact.address;
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ');
  };
  
  const storeAddress = getStoreAddress();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    deliveryMethodId: '',
    address: '',
    city: '',
    district: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDirectOrderProcessing, setIsDirectOrderProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); 
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [cartTotalsState, setCartTotalsState] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState(null);
  const [lahzaPaymentData, setLahzaPaymentData] = useState(null);
  const [showLahzaPayment, setShowLahzaPayment] = useState(false);
  const [showPaymentVerificationModal, setShowPaymentVerificationModal] = useState(false);
  const [paymentVerificationData, setPaymentVerificationData] = useState(null);

  // إغلاق البوب أب عند تغيير المسار
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessOrderData(null);
      }, 5000); // إغلاق تلقائي بعد 5 ثواني

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // الاستماع لنتيجة التحقق من الدفع
  useEffect(() => {
    if (verificationResult && verificationResult.status === 'success') {
      console.log('Payment verification successful:', verificationResult);
      setPaymentVerificationData(verificationResult);
      setShowPaymentVerificationModal(true);
      
      // Show WhatsApp confirmation popup for successful payment
      showWhatsAppConfirmationPopup(verificationResult);
    } else if (verificationResult && verificationResult.status === 'failed') {
      console.log('Payment verification failed:', verificationResult);
      const errorMessage = currentLang === 'ar' 
        ? 'فشل في عملية الدفع. يرجى المحاولة مرة أخرى.'
        : 'Payment failed. Please try again.';
      showErrorNotification(errorMessage);
    }
  }, [verificationResult, currentLang]);

  // إغلاق البوب أب عند تغيير المسار
  useEffect(() => {
    if (showSuccessModal && location.pathname.includes('/orders')) {
      setShowSuccessModal(false);
      setSuccessOrderData(null);
    }
  }, [location.pathname, showSuccessModal]);

  // تحديث التوتال عند تغيير أي شيء يؤثر عليه
  useEffect(() => {
    console.log('🔄 useEffect triggered - recalculating cart totals');
    const totals = getCartTotals();
    console.log('💰 Cart totals updated:', totals);
    setCartTotalsState(totals);
  }, [cartItems, getCartTotals, shippingAreaId]);

  // دالة لتحديث منطقة التوصيل وإعادة حساب التوتال
  const handleShippingAreaChange = (areaId) => {
    console.log('🔄 Changing shipping area to:', areaId);
    updateShippingArea(areaId);
    // إعادة حساب التوتال
    const newTotals = getCartTotals();
    console.log('💰 New cart totals:', newTotals);
    setCartTotalsState(newTotals);
  };
//-----------------------------------paymentMethods------------------------------------------------  
    // دالة لتحويل طرق الدفع من API إلى التنسيق المطلوب
  const formatPaymentMethods = (apiMethods) => {


    return apiMethods.map(method => ({
      key: method._id,
      label: currentLang === 'ar' ? method.titleAr : method.titleEn,
      img: method.logoUrl || getDefaultPaymentImage(method.methodType),
      methodType: method.methodType,
      description: currentLang === 'ar' ? method.descriptionAr : method.descriptionEn,
      qrCode: method.qrCode,
      paymentImages: method.sortedPaymentImages || [],
      originalMethod: method
    }));
  };

  // دالة للحصول على الصورة الافتراضية حسب نوع طريقة الدفع
  const getDefaultPaymentImage = (methodType) => {
    switch (methodType) {
      case 'cash':
        return cashImg;
      case 'qr_code':
        return reflectImg;
      case 'palpay':
        return palpayImg;
      case 'paypal':
        return paypalImg;
      case 'visa':
        return visaImg;
      default:
        return reflectImg;
    }
  };

  const paymentMethods = formatPaymentMethods(apiPaymentMethods);
  
  // دالة لتحويل نوع طريقة الدفع إلى القيمة المقبولة من API
  const getPaymentMethodForAPI = (methodType) => {
    console.log('Converting payment method:', methodType);
    
    switch (methodType) {
      case 'cash':
        return 'cash_on_delivery';
      case 'qr_code':
        return 'credit_card'; // أو أي قيمة مقبولة من API
      case 'palpay':
        return 'credit_card';
      case 'paypal':
        return 'paypal';
      case 'visa':
        return 'credit_card';
      case 'lahza':
        return 'lahza';
      default:
        console.log('Unknown payment method type:', methodType, 'using default: cash_on_delivery');
        return 'cash_on_delivery';
    }
  };
  
  //-----------------------------------getColorKey------------------------------------------------  
  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }
//-----------------------------------getColorLabel------------------------------------------------  
  function getColorLabel(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }


//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    console.log('Checkout useEffect - cartItems:', cartItems);
    console.log('Checkout useEffect - cartItems.length:', cartItems?.length);
    console.log('Checkout useEffect - cartItems type:', typeof cartItems);
    console.log('Checkout useEffect - cartLoading:', cartLoading);
    
    // لا نتحقق من السلة الفارغة أثناء التحميل
    if (cartLoading) {
      console.log('Cart is still loading, waiting...');
      return;
    }
    
    // التحقق من أن cartItems موجود وليس فارغاً بعد انتهاء التحميل
    // تأكد من أن cartItems ليس undefined أو null أولاً
    // if (!cartItems) {
    //   console.log('Cart items is null/undefined, waiting for data...');
    //   return;
    // }
    
    // // ثم تحقق من أنه array وليس فارغاً
    // if (Array.isArray(cartItems) && cartItems.length === 0) {
    //   console.log('Cart is empty after loading, redirecting to /cart');
    //   navigate('/cart');
    
  }, [cartItems, cartLoading, navigate]);
  
  // Monitor cart changes for debugging
  useEffect(() => {
    console.log('🛒 Cart state changed:', {
      cartItems: cartItems,
      cartItemsLength: cartItems?.length,
      cartLoading: cartLoading,
      timestamp: new Date().toISOString()
    });
  }, [cartItems, cartLoading]);
  
  //-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    // محاولة تحميل معلومات المستخدم من localStorage
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log('Loading user data for checkout:', user);
        
        // الحصول على العنوان الافتراضي
        const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
        
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          email: user.email || '',
          address: defaultAddress?.street || '',
          district: defaultAddress?.state || '',
          city: defaultAddress?.city || '',
          deliveryMethodId: user.deliveryMethodId || '', // Assuming userInfo includes deliveryMethodId
        }));
      }
      // إذا لم تكن هناك معلومات مستخدم، تبقى الحقول فارغة
    } catch (error) {
      console.error('Error loading user data:', error);
      // في حالة الخطأ، تبقى الحقول فارغة
    }
  }, []);
//-----------------------------------handleInputChange------------------------------------------------  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const { sanitized } = validateAndSanitizePhone(value, t('checkout.validation.phone_invalid'));
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
//-----------------------------------validateForm------------------------------------------------  
  const validateForm = () => {
    const errors = {};
    errors.firstName = validateRequired(formData.firstName, t('checkout.validation.name_required'));
    errors.lastName = validateRequired(formData.lastName, t('checkout.validation.name_required'));
    const phoneResult = validateAndSanitizePhone(formData.phone, t('checkout.validation.phone_invalid'));
    errors.phone = phoneResult.error || validateRequired(formData.phone, t('checkout.validation.phone_required'));
    
    if (deliveryMethod === 'delivery') {
      // التحقق من اختيار طريقة التوصيل فقط إذا كان التوصيل للمنزل
      errors.deliveryMethodId = validateRequired(formData.deliveryMethodId, currentLang === 'ar' ? 'يرجى اختيار منطقة التوصيل' : 'Please select a delivery area');
      errors.address = validateRequired(formData.address, t('checkout.validation.address_required'));
      errors.city = validateRequired(formData.city, t('checkout.validation.city_required'));
    }
    // لا نحتاج للتحقق من العنوان إذا كان الاستلام من المتجر
    
    setFormErrors(errors);
    return Object.values(errors).every((err) => !err);
  };
  //-----------------------------------getShippingPrice------------------------------------------------  
  const getShippingPrice = () => {
    if (deliveryMethod === 'store') return 0;
    
    const selectedMethod = deliveryMethods.find(dm => dm._id === formData.deliveryMethodId);
    return selectedMethod?.price || 0;
  };
  //-----------------------------------handlePlaceOrderClick------------------------------------------------  
const handlePlaceOrderClick = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  // إذا كان الاستلام من المتجر، مباشرة إنشاء الطلب وإرساله للواتساب
  if (deliveryMethod === 'store') {
    handleDirectStoreOrder();
  } else {
    // إذا كان توصيل، عرض طرق الدفع
    setShowPaymentPopup(true);
  }
};
//-----------------------------------handleSelectPayment------------------------------------------------  
 const handleSelectPayment = async (method) => {
  console.log('Selected payment method:', method);
  
  // Check if it's Lahza payment method
  if (method.methodType === 'lahza') {
    try {
      console.log('Initializing Lahza payment...');
      
      // Prepare order data for Lahza
      const orderData = {
        email: formData.email,
        total: cartTotalsState.total + getShippingPrice(),
        currency: store?.settings?.currency || 'ILS',
        orderNumber: `ORDER-${Date.now()}`, // Generate temporary order number
        customerInfo: formData,
        deliveryMethod: deliveryMethod
      };
      
      // Initialize Lahza payment

      //lahza payment
      
      const lahzaResult = await initializeLahzaPayment(orderData);
      
      if (lahzaResult.success) {
        setLahzaPaymentData(lahzaResult);
        setSelectedPaymentMethod(method);
        setShowPaymentPopup(false);
        setShowLahzaPayment(true);
      } else {
        throw new Error('Failed to initialize Lahza payment');
      }
    } catch (error) {
      console.error('Error initializing Lahza payment:', error);
      const errorMessage = currentLang === 'ar' 
        ? 'حدث خطأ في تهيئة الدفع. يرجى المحاولة مرة أخرى.'
        : 'Error initializing payment. Please try again.';
      showErrorNotification(errorMessage);
    }
  } else {
    // Handle other payment methods as before
    setSelectedPaymentMethod(method);
    setShowPaymentPopup(false);
    setShowPaymentConfirm(true);
    setPaymentDone(false);
  }
};
//-----------------------------------handlePaymentDone------------------------------------------------  
 const handlePaymentDone = () => {
  setPaymentDone(true);
};
//-----------------------------------handleDirectStoreOrder------------------------------------------------  
const handleDirectStoreOrder = async () => {
  try {
    setIsDirectOrderProcessing(true);
    console.log('=== STARTING DIRECT STORE ORDER ===');
    console.log('Store data:', store);
    console.log('Cart items:', cartItems);
    console.log('Form data:', formData);
    console.log('Creating direct store order...');
    
    // إنشاء الطلب مباشرة للاستلام من المتجر
    const orderData = {
      store: {
        _id: store?._id,
        nameAr: store?.nameAr,
        nameEn: store?.nameEn,
        logo: store?.logo,
        contact: store?.contact
      },
      user: user?._id || null,
      items: cartItems.map(item => {
        let productId = null;
        
        if (item.productId) {
          productId = item.productId;
        } else if (item.product && typeof item.product === 'string') {
          productId = item.product;
        } else if (item.product && typeof item.product === 'object') {
          productId = item.product._id || item.product.id;
        } else if (item._id) {
          productId = item._id;
        }
        
        return {
          product: productId,
          quantity: item.quantity
        };
      }),
      cartItems: cartItems.map(item => ({
        product: item.productId || (item.product && typeof item.product === 'string' ? item.product : item.product?._id || item.product?.id || item._id),
        quantity: item.quantity,
        selectedSpecifications: item.selectedSpecifications || [],
        selectedColors: item.selectedColors || []
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '',
        phone: formData.phone,
        street: storeAddress || 'Store Pickup',
        city: store?.contact?.address?.city || '',
        district: store?.contact?.address?.state || '',
        country: store?.contact?.address?.country || '',
        zipCode: store?.contact?.address?.zipCode || ''
      },
      billingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '',
        phone: formData.phone,
        street: storeAddress || 'Store Pickup',
        city: store?.contact?.address?.city || '',
        district: store?.contact?.address?.state || '',
        country: store?.contact?.address?.country || '',
        zipCode: store?.contact?.address?.zipCode || ''
      },
      paymentInfo: {
        method: 'cash_on_delivery',
        paymentMethodId: null,
        status: 'pending'
      },
      shippingInfo: {
        method: 'pickup',
        cost: 0,
        deliveryMethodId: null
      },
      notes: {
        customer: formData.notes || ''
      },
      isGift: false,
      giftMessage: '',
      deliveryArea: undefined,
      currency: store?.settings.currency || 'ILS'
    };

    console.log('Creating direct store order with data:', JSON.stringify(orderData, null, 2));
    
    // إنشاء الطلب في قاعدة البيانات
    const createdOrder = await createOrder(orderData);
    console.log('Direct store order created successfully:', createdOrder);

         // إرسال رسالة الواتساب مع معلومات الطلب
     const whatsappOrderData = {
       orderNumber: createdOrder.orderNumber,
       customerInfo: formData,
       items: cartItems,
       pricing: createdOrder.pricing,
       totals: { ...cartTotalsState, shipping: 0, total: cartTotalsState.subtotal },
       orderDate: new Date().toISOString(),
       deliveryMethod: 'store',
       deliveryMethodId: null,
       paymentMethod: currentLang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery',
       // Add payment verification data if available (for store pickup, this will be null)
       paymentVerificationData: null
     };
     
     // إنشاء رسالة الواتساب
     const message = handleWhatsAppOrder(whatsappOrderData);
     
     // الحصول على رقم الواتساب
     let phoneNumber = store?.contact?.whatsapp;
     if (!phoneNumber) {
       phoneNumber = store?.whatsappNumber;
     }
     if (!phoneNumber) {
       phoneNumber = store?.contact?.phone;
     }
     
     // التحقق من وجود رقم الهاتف
     if (!phoneNumber) {
       const errorMessage = currentLang === 'ar' 
         ? 'رقم الواتساب الخاص بالمتجر غير متوفر'
         : 'Store WhatsApp number is not available';
       showErrorNotification(errorMessage);
       return;
     }
     
     // تنظيف رقم الهاتف
     const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
     let finalPhoneNumber = cleanPhoneNumber;
     if (!finalPhoneNumber.startsWith('+')) {
       finalPhoneNumber = '+972' + finalPhoneNumber.replace(/^0/, '');
     }
     
     // إضافة رقم الهاتف للبيانات
     whatsappOrderData.phoneNumber = finalPhoneNumber;
     whatsappOrderData.whatsappMessage = message;
    
               // عرض رسالة نجاح جميلة (بدون إرسال تلقائي للواتساب)
      showBeautifulSuccessMessage({
        ...whatsappOrderData,
        deliveryMethod: 'store',
        customerAddress: storeAddress
      });
     
     // مسح السلة وإعادة التوجيه
     clearCart();
     
          // إعادة التوجيه إلى الصفحة الرئيسية
     console.log('=== DIRECT STORE ORDER COMPLETED ===');
    //  navigate('/');
     
      } catch (error) {
     console.error('Error creating direct store order:', error);
     const errorMessage = currentLang === 'ar' 
       ? 'حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.'
       : 'Error creating order. Please try again.';
     showErrorNotification(errorMessage);
   } finally {
    setIsDirectOrderProcessing(false);
  }
};

//-----------------------------------handleSendWhatsApp------------------------------------------------  
const handleSendWhatsApp = async () => {
  try {
    console.log('Selected payment method:', selectedPaymentMethod);
  
    // إضافة logging مفصل لـ cartItems
    console.log('=== CART ITEMS DETAILED ANALYSIS ===');
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        item,
        keys: Object.keys(item),
        productType: typeof item.product,
        productValue: item.product,
        productIdType: typeof item.productId,
        productIdValue: item.productId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        name: item.name,
        price: item.price,
        finalPrice: item.product.finalPrice,
        priceAtAdd: item.priceAtAdd,
        quantity: item.quantity
      });
    });
    console.log('=== END CART ITEMS ANALYSIS ===');
    
    // إنشاء الطلب أولاً
    const orderData = {
      store: {
        _id: store?._id,
        nameAr: store?.nameAr,
        nameEn: store?.nameEn,
        logo: store?.logo,
        contact: store?.contact
      }, // إضافة بيانات المتجر للتحقق من storeId
      user: user?._id || null, // إرسال user ID فقط أو null للضيوف
      items: cartItems.map(item => {
        // بناءً على البيلود المقدم، يبدو أن البنية مختلفة
        // البيلود يظهر: {product: "68804019a83b761668fda7a1", productId: "68804019a83b761668fda7a1",...}
        
        let productId = null;
        
        // الحصول على productId
        if (item.productId) {
          productId = item.productId;
        } else if (item.product && typeof item.product === 'string') {
          productId = item.product;
        } else if (item.product && typeof item.product === 'object') {
          productId = item.product._id || item.product.id;
        } else if (item._id) {
          productId = item._id;
        }
        
        console.log('Processing cart item:', {
          originalItem: item,
          productId,
          quantity: item.quantity,
          selectedSpecifications: item.selectedSpecifications,
          selectedColors: item.selectedColors
        });
        
        return {
          product: productId, // الكنترولر يتوقع 'product' وليس 'productId'
          quantity: item.quantity
        };
      }),
      // إضافة cartItems كمعامل منفصل لتمرير المواصفات والألوان
      cartItems: cartItems.map(item => ({
        product: item.productId || (item.product && typeof item.product === 'string' ? item.product : item.product?._id || item.product?.id || item._id),
        quantity: item.quantity,
        selectedSpecifications: item.selectedSpecifications || [],
        selectedColors: item.selectedColors || []
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '', // You might want to add email field to the form
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        district: formData.district,
        country: '',
        zipCode: ''
      },
      billingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '', // You might want to add email field to the form
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        district: formData.district,
        country: '',
        zipCode: ''
      },
      paymentInfo: {
        method: getPaymentMethodForAPI(selectedPaymentMethod?.methodType),
        paymentMethodId: selectedPaymentMethod?.key,
        status: paymentVerificationData?.status === 'success' ? 'completed' : 'pending',
        // Add payment verification data if available
        ...(paymentVerificationData?.data?.data && {
          transactionId: paymentVerificationData.data.data.reference,
          paymentAmount: paymentVerificationData.data.data.amount,
          paymentCurrency: paymentVerificationData.data.data.currency,
          paymentStatus: paymentVerificationData.data.data.status,
          paymentDate: paymentVerificationData.data.data.paidAt,
          gatewayResponse: paymentVerificationData.data.data.gateway_response
        })
      },
      shippingInfo: {
        method: deliveryMethod === 'delivery' ? 'delivery' : 'pickup',
        cost: getShippingPrice(),
        deliveryMethodId: formData.deliveryMethodId || null
      },
      notes: {
        customer: formData.notes || ''
      },
      isGift: false,
      giftMessage: '',
      deliveryArea: formData.deliveryMethodId || undefined, // إرسال deliveryArea ID فقط
      currency: store?.settings.currency || 'ILS' // استخدام عملة المتجر أو الافتراضية
    };

   
  
    // التحقق من وجود المتجر
    if (!orderData.store._id) {
      throw new Error('معلومات المتجر غير متوفرة');
    }
    
    // التحقق من وجود المستخدم (يمكن أن يكون null للضيوف)
    if (orderData.user === undefined) {
      throw new Error('معلومات المستخدم غير متوفرة');
    }
    
    // التحقق من أن جميع المنتجات تحتوي على ID صحيح
    const invalidItems = orderData.items.filter(item => !item.product);
    if (invalidItems.length > 0) {
      console.error('Invalid items found:', invalidItems);
      throw new Error('بعض المنتجات لا تحتوي على معرف صحيح');
    }
    
    // التحقق من أن جميع المنتجات تحتوي على كمية صحيحة
    const itemsWithInvalidQuantity = orderData.items.filter(item => !item.quantity || item.quantity <= 0);
    if (itemsWithInvalidQuantity.length > 0) {
      console.error('Items with invalid quantity:', itemsWithInvalidQuantity);
      throw new Error('بعض المنتجات لا تحتوي على كمية صحيحة');
    }
    
    // التحقق من وجود deliveryMethodId إذا كانت طريقة التوصيل هي delivery
    if (deliveryMethod === 'delivery' && !formData.deliveryMethodId) {
      throw new Error('يرجى اختيار طريقة التوصيل');
    }
    
    console.log('All validations passed. Creating order...');
    
    // التحقق النهائي من أن جميع الحقول المطلوبة موجودة
    const requiredFields = ['store', 'items'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`الحقول المطلوبة مفقودة: ${missingFields.join(', ')}`);
    }
    
    // التحقق من أن كل item يحتوي على الحقول المطلوبة
    const requiredItemFields = ['product', 'quantity'];
    const itemsMissingFields = orderData.items.filter(item => {
      return requiredItemFields.some(field => !item[field]);
    });
    
    if (itemsMissingFields.length > 0) {
      console.error('Items missing required fields:', itemsMissingFields);
      throw new Error('بعض المنتجات لا تحتوي على جميع البيانات المطلوبة');
    }
    
    console.log('Final validation passed. Sending order to API...');
    
    // إنشاء الطلب في قاعدة البيانات
    const createdOrder = await createOrder(orderData);
    console.log('Order created successfully2:', createdOrder);

    // إرسال رسالة الواتساب مع معلومات الطلب
    const whatsappOrderData = {
      orderNumber: createdOrder.orderNumber,
      customerInfo: formData,
      items: cartItems,
      pricing:createdOrder.pricing,
      totals: { ...cartTotalsState, shipping: getShippingPrice(), total: cartTotalsState.subtotal + getShippingPrice() },
      orderDate: new Date().toISOString(),
      deliveryMethod: deliveryMethod,
      deliveryMethodId: formData.deliveryMethodId,
      paymentMethod: selectedPaymentMethod?.label,
      // Add payment verification data if available
      paymentVerificationData: paymentVerificationData
    };
    
    handleWhatsAppOrder(whatsappOrderData);
    
    // مسح السلة وإعادة التوجيه
    clearCart();
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod(null);
    setShowPaymentPopup(false);
    setPaymentDone(false);
    
    // إعادة التوجيه إلى صفحة تأكيد الطلب أو الصفحة الرئيسية
    // navigate('/');
    
     } catch (error) {
     console.error('Error creating order:', error);
     // إضافة رسالة خطأ للمستخدم
     const errorMessage = currentLang === 'ar' 
       ? 'حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.'
       : 'Error creating order. Please try again.';
     showErrorNotification(errorMessage);
   }
};
//-----------------------------------handleWhatsAppOrder------------------------------------------------  
  const handleWhatsAppOrder = (orderData) => {
    
    const { orderNumber, customerInfo, items, totals, deliveryMethod, paymentVerificationData: orderPaymentData } = orderData;
    
    // إنشاء رسالة باللغة المختارة فقط
    const isArabic = currentLang === 'ar';
    
    let message = isArabic 
      ? ` *طلب جديد*\n`
      : ` *New Order*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
   
    // معلومات الطلب - Order Information
    message += isArabic 
      ? ` *رقم الطلب:* ${orderNumber || 'غير محدد'}\n`
      : ` *Order Number:* ${orderNumber || 'N/A'}\n`;
    message += isArabic 
      ? ` *التاريخ:* ${new Date().toLocaleDateString('ar-EG')}\n`
      : ` *Date:* ${new Date().toLocaleDateString('en-US')}\n`;
    message += isArabic 
      ? ` *الوقت:* ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}\n\n`
      : ` *Time:* ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    
         // إضافة طريقة الاستلام
     message += isArabic 
       ? ` *طريقة الاستلام:* ${deliveryMethod === 'store' ? 'استلام من المتجر' : 'توصيل للمنزل'}\n`
       : ` *Delivery Method:* ${deliveryMethod === 'store' ? 'Store Pickup' : 'Home Delivery'}\n`;
     
     // إضافة ملاحظة خاصة للاستلام من المتجر
     if (deliveryMethod === 'store') {
       message += isArabic 
         ? ` *ملاحظة:* العميل سيقوم بالاستلام من المتجر والدفع عند الاستلام\n`
         : ` *Note:* Customer will pick up from store and pay on delivery\n`;
     }
     message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    // معلومات العميل - Customer Information
    message += isArabic 
      ? ` *معلومات العميل:*\n`
      : ` *Customer Information:*\n`;
    message += isArabic 
      ? ` *الاسم:* ${customerInfo.firstName} ${customerInfo.lastName || 'غير محدد'}\n`
      : ` *Name:* ${customerInfo.firstName} ${customerInfo.lastName || 'N/A'}\n`;
    message += isArabic 
      ? ` الهاتف: ${customerInfo.phone || 'غير محدد'}\n`
      : ` Phone: ${customerInfo.phone || 'N/A'}\n`;
    
    // إضافة العنوان فقط إذا كان توصيل
    if (deliveryMethod === 'delivery') {
      message += isArabic 
        ? ` العنوان: ${customerInfo.address || 'غير محدد'}, ${customerInfo.city || 'غير محدد'}`
        : ` Address: ${customerInfo.address || 'N/A'}, ${customerInfo.city || 'N/A'}`;
      if (customerInfo.district) {
        message += `, ${customerInfo.district}`;
      }
      message += '\n';
         } else {
       // إذا كان استلام من المتجر، إضافة عنوان المتجر
       message += isArabic 
         ? ` العنوان: استلام من المتجر - ${storeAddress || 'عنوان المتجر'}\n`
         : ` Address: Store Pickup - ${storeAddress || 'Store Address'}\n`;
       
       // إضافة معلومات المتجر للاستلام
       if (store?.nameAr || store?.nameEn) {
         const storeName = currentLang === 'ar' ? store.nameAr : store.nameEn;
         message += isArabic 
           ? ` المتجر: ${storeName}\n`
           : ` Store: ${storeName}\n`;
       }
     }
    message += '\n';
    
    // الملاحظات - Notes
    if (customerInfo.notes) {
      message += isArabic 
        ? ` *ملاحظات:*\n${customerInfo.notes}\n\n`
        : ` *Notes:*\n${customerInfo.notes}\n\n`;
    }
    
    // المنتجات - Products
    message += isArabic 
      ? ` *المنتجات المطلوبة:*\n`
      : ` *Requested Products:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    items.forEach((item, index) => {
      // الحصول على اسم المنتج بشكل آمن
      const getItemName = (item, lang) => {
        // محاولة الحصول على الاسم من الحقول المختلفة
        if (item.nameAr && lang === 'ar') {
          return item.nameAr;
        }
        if (item.nameEn && lang === 'en') {
          return item.nameEn;
        }
        if (item.name && typeof item.name === 'string') {
          return item.name;
        }
        if (item.product && item.product.nameAr && lang === 'ar') {
          return item.product.nameAr;
        }
        if (item.product && item.product.nameEn && lang === 'en') {
          return item.product.nameEn;
        }
        if (item.product && item.product.name && typeof item.product.name === 'string') {
          return item.product.name;
        }
        // إذا لم نجد اسماً، نستخدم اسم افتراضي
        return lang === 'ar' ? 'منتج غير محدد' : 'Undefined Product';
      };
      
      const itemName = getItemName(item, currentLang);
      const isWholesale = isWholesalerUser();
      const itemPrice = isWholesale ? item.product.compareAtPrice : item.product.finalPrice || item.priceAtAdd || item.price || 0;
      const currencySymbol = getCurrencySymbol(store?.settings.currency || 'ILS');
      
      message += `\n${index + 1}. *${itemName}*\n`;
      message += isArabic 
        ? `  الكمية: ${item.quantity}\n`
        : `  Quantity: ${item.quantity}\n`;
      message += isArabic 
        ? `  السعر: ${currencySymbol}${itemPrice.toFixed(2)}\n`
        : `   Price: ${currencySymbol}${itemPrice.toFixed(2)}\n`;
      
      // إضافة المواصفات - Specifications
      if (item.selectedSpecifications && item.selectedSpecifications.length > 0) {
        message += isArabic 
          ? `    المواصفات: `
          : `    Specifications: `;
        item.selectedSpecifications.forEach((spec, specIndex) => {
          const specTitle = currentLang === 'ar' ? (spec.titleAr || spec.title || spec.specificationId) : (spec.titleEn || spec.title || spec.specificationId);
          const specValue = currentLang === 'ar' ? (spec.valueAr || spec.value || spec.valueId) : (spec.valueEn || spec.value || spec.valueId);
          message += `${specTitle}: ${specValue}${specIndex < item.selectedSpecifications.length - 1 ? ', ' : ''}`;
        });
        message += '\n';
      }
      
      message += isArabic 
        ? `    المجموع: ${currencySymbol}${(itemPrice * item.quantity).toFixed(2)}\n`
        : `    Total: ${currencySymbol}${(itemPrice * item.quantity).toFixed(2)}\n`;
    });
    
    // الفاتورة - Invoice
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += isArabic 
      ? ` *ملخص الفاتورة:*\n`
      : ` *Invoice Summary:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    const currencySymbol = getCurrencySymbol(store?.settings.currency || 'ILS');
    message += isArabic 
      ? ` المجموع الفرعي: ${currencySymbol}${orderData.pricing.subtotal.toFixed(2)}\n`
      : ` Subtotal: ${currencySymbol}${orderData.pricing.subtotal.toFixed(2)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
      if(isWholesalerUser()){
      message+= isArabic 
      ? ` خصم التاجر الجملة: ${orderData.pricing.discount}%(-${currencySymbol}${orderData.pricing.subtotal * orderData.pricing.discount / 100})\n`
      : ` Wholesaler Discount: ${orderData.pricing.discount}%(-${currencySymbol}${orderData.pricing.subtotal * orderData.pricing.discount / 100})\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
    }
    message += isArabic 
      ? ` رسوم الشحن: ${deliveryMethod === 'store' ? 'مجاني (استلام من المتجر)' : (orderData.pricing.shipping === 0 ? ' مجاني' : `${currencySymbol}${orderData.pricing.shipping.toFixed(2)}`)}\n`
      : ` Shipping: ${deliveryMethod === 'store' ? 'Free (Store Pickup)' : (orderData.pricing.shipping === 0 ? ' Free' : `${currencySymbol}${orderData.pricing.shipping.toFixed(2)}`)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += isArabic 
      ? ` *الإجمالي النهائي: ${currencySymbol}${orderData.pricing.total.toFixed(2)}*\n`
      : ` *Final Total: ${currencySymbol}${orderData.pricing.total.toFixed(2)}*\n`;
    
    // إضافة معلومات الدفع إذا كانت متوفرة
    if (orderPaymentData?.status === 'success' && orderPaymentData?.data?.data) {
      const paymentData = orderPaymentData.data.data;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += isArabic 
        ? ` *معلومات الدفع:*\n`
        : ` *Payment Information:*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += isArabic 
        ? ` حالة الدفع: مكتمل ✅\n`
        : ` Payment Status: Completed ✅\n`;
      message += isArabic 
        ? ` رقم المرجع: ${paymentData.reference}\n`
        : ` Reference: ${paymentData.reference}\n`;
      message += isArabic 
        ? ` طريقة الدفع: ${paymentData.channel === 'card' ? 'بطاقة ائتمان' : paymentData.channel}\n`
        : ` Payment Method: ${paymentData.channel === 'card' ? 'Credit Card' : paymentData.channel}\n`;
      if (paymentData.gateway_response) {
        message += isArabic 
          ? ` استجابة البوابة: ${paymentData.gateway_response}\n`
          : ` Gateway Response: ${paymentData.gateway_response}\n`;
      }
      if (paymentData.paidAt) {
        const paidDate = new Date(paymentData.paidAt).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US');
        message += isArabic 
          ? ` تاريخ الدفع: ${paidDate}\n`
          : ` Payment Date: ${paidDate}\n`;
      }
    }
    
    // Get WhatsApp number from store data - prioritize WhatsApp number
     let phoneNumber = store?.contact?.whatsapp;
     
     // If no WhatsApp number, try to get phone number
     if (!phoneNumber) {
       phoneNumber = store?.whatsappNumber;
     }
     
           // If still no number, show error
      if (!phoneNumber) {
        const errorMessage = currentLang === 'ar' 
          ? 'رقم الواتساب الخاص بالمتجر غير متوفر'
          : 'Store WhatsApp number is not available';
        showErrorNotification(errorMessage);
        return;
      }
     
     // Clean the phone number (remove any non-digit characters except +)
     const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
     
     // Ensure the number starts with country code
     let finalPhoneNumber = cleanPhoneNumber;
     if (!finalPhoneNumber.startsWith('+')) {
       // If no country code, assume it's a local number and add +972 for Israel
       finalPhoneNumber = '+972' + finalPhoneNumber.replace(/^0/, '');
     }
     
     console.log('Sending WhatsApp to:', finalPhoneNumber);
     
          // عرض رسالة نجاح جميلة مع رسالة الواتساب
     const whatsappData = {
       phoneNumber: finalPhoneNumber,
       whatsappMessage: message,
       deliveryMethod: deliveryMethod,
       customerAddress: `${formData.address}, ${formData.city}${formData.district ? `, ${formData.district}` : ''}`
     };
     showBeautifulSuccessMessage(whatsappData);
     
     // Return the message for direct store orders
     return message;
   };

  //-----------------------------------showSuccessNotification------------------------------------------------  
  const showSuccessNotification = (phoneNumber, whatsappMessage) => {
    setSuccessOrderData({
      phoneNumber,
      whatsappMessage,
      deliveryMethod,
      storeAddress
    });
    setShowSuccessModal(true);
  };

     //-----------------------------------showBeautifulSuccessMessage------------------------------------------------  
   const showBeautifulSuccessMessage = (whatsappData) => {
     // تحديد نوع التوصيل من البيانات المرسلة
     const isDelivery = whatsappData.deliveryMethod === 'delivery';
     
     // إنشاء modal النجاح الجميل
     const successModal = document.createElement('div');
     successModal.style.cssText = `
       position: fixed;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.7);
       display: flex;
       align-items: center;
       justify-content: center;
       z-index: 10000;
       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
       animation: fadeIn 0.3s ease-out;
       cursor: pointer;
     `;
     
     // إضافة event listener لإغلاق البوب أب بالنقر خارج النافذة
     successModal.addEventListener('click', (e) => {
       if (e.target === successModal) {
         console.log('Clicked outside modal, closing...');
         handleCloseModal();
       }
     });
     
     successModal.innerHTML = `
       <div class="success-modal" style="
         background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
         border-radius: 20px;
         padding: 40px;
         max-width: 500px;
         width: 90%;
         text-align: center;
         box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
         border: 1px solid #e9ecef;
         position: relative;
         animation: slideInUp 0.4s ease-out;
         cursor: default;
       ">
         <!-- زر الإغلاق X -->
         <button onclick="handleCloseModal()" style="
           position: absolute;
           top: 15px;
           right: 15px;
           background: none;
           border: none;
           font-size: 24px;
           color: #999;
           cursor: pointer;
           width: 30px;
           height: 30px;
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 50%;
           transition: all 0.2s ease;
           z-index: 10;
         " onmouseover="this.style.background='#f0f0f0'; this.style.color='#666'" onmouseout="this.style.background='none'; this.style.color='#999'">
           ✕
         </button>
         <!-- أيقونة النجاح المتحركة -->
         <div style="
           width: 80px;
           height: 80px;
           border-radius: 50%;
           background: linear-gradient(135deg, #4CAF50, #45a049);
           display: flex;
           align-items: center;
           justify-content: center;
           margin: 0 auto 24px auto;
           box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
           animation: bounceIn 0.6s ease-out 0.2s both;
         ">
           <svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24" style="animation: checkmark 0.4s ease-out 0.6s both;">
             <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
           </svg>
         </div>
         
         <!-- العنوان الرئيسي -->
         <h2 style="
           color: #2E7D32;
           font-size: 28px;
           font-weight: 700;
           margin: 0 0 16px 0;
           text-shadow: 0 1px 2px rgba(0,0,0,0.1);
         ">
           ${currentLang === 'ar' ? '🎉 تم إنشاء الطلب بنجاح! 🎉' : '🎉 Order Created Successfully! 🎉'}
         </h2>
         
         <!-- الرسالة التفصيلية -->
         <div style="
           background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
           border-radius: 15px;
           padding: 24px;
           margin: 20px 0;
           border: 2px solid #c8e6c9;
           position: relative;
           overflow: hidden;
         ">
          
           
                       <p style="
              color: #1b5e20;
              font-size: 16px;
              line-height: 1.6;
              margin: 0;
              font-weight: 500;
            ">
              ${isDelivery 
                ? (currentLang === 'ar' 
                    ? 'تم إنشاء طلبك بنجاح! سيصلك طلبك بأسرع وقت ممكن. نشكرك على ثقتك بنا! اضغط على الزر أدناه لإرسال تفاصيل الطلب للواتساب.'
                    : 'Your order has been created successfully! Your order will reach you as soon as possible. Thank you for your trust in us! Click the button below to send order details to WhatsApp.'
                  )
                : (currentLang === 'ar' 
                    ? 'تم إنشاء طلبك بنجاح! يمكنك الآن استلام طلبك من المتجر في أقرب وقت ممكن. اضغط على الزر أدناه لإرسال تفاصيل الطلب للواتساب.'
                    : 'Your order has been created successfully! You can now pick up your order from the store as soon as possible. Click the button below to send order details to WhatsApp.'
                  )
              }
            </p>
         </div>
         
         <!-- معلومات الاستلام -->
         <div style="
           background: #f8f9fa;
           border-radius: 12px;
           padding: 20px;
           margin: 20px 0;
           border: 1px solid #e9ecef;
           position: relative;
         ">
           <div style="
             display: flex;
             align-items: center;
             gap: 12px;
             margin-bottom: 12px;
           ">
             <div style="
               width: 32px;
               height: 32px;
               border-radius: 50%;
               background: linear-gradient(135deg, #007bff, #0056b3);
               display: flex;
               align-items: center;
               justify-content: center;
               color: white;
               font-size: 16px;
               font-weight: bold;
             ">📍</div>
             <span style="
               font-weight: 600;
               color: #333;
               font-size: 16px;
             ">
               ${isDelivery 
                 ? (currentLang === 'ar' ? 'معلومات التوصيل:' : 'Delivery Information:')
                 : (currentLang === 'ar' ? 'معلومات الاستلام:' : 'Pickup Information:')
               }
             </span>
           </div>
           <div style="
             color: #666;
             font-size: 14px;
             line-height: 1.5;
             padding-left: 44px;
           ">
             ${isDelivery 
               ? (currentLang === 'ar' 
                   ? `توصيل للمنزل: ${whatsappData.customerAddress || 'العنوان المحدد'}`
                   : `Home Delivery: ${whatsappData.customerAddress || 'Specified Address'}`
                 )
               : (currentLang === 'ar' 
                   ? `استلام من المتجر: ${storeAddress || 'عنوان المتجر'}`
                   : `Store Pickup: ${storeAddress || 'Store Address'}`
                 )
             }
           </div>
         </div>
         
         <!-- أزرار الإجراءات -->
         <div style="
           display: flex;
           gap: 12px;
           margin-top: 24px;
           flex-direction: column;
         ">
                       <button id="whatsapp-button" style="
             background: linear-gradient(135deg, #25D366, #128C7E);
             color: white;
             border: none;
             border-radius: 12px;
             padding: 16px 24px;
             font-size: 16px;
             font-weight: 600;
             cursor: pointer;
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 8px;
             box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
             transition: all 0.3s ease;
             text-decoration: none;
           " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(37, 211, 102, 0.3)'" onclick="window.open('https://wa.me/${whatsappData.phoneNumber}?text=${encodeURIComponent(whatsappData.whatsappMessage)}', '_blank')">
             <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
               <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
             </svg>
             ${currentLang === 'ar' ? 'إرسال الطلب للواتساب' : 'Send Order to WhatsApp'}
           </button>
           
         
         </div>
       </div>
     `;
     
          // إضافة دالة إغلاق الـ modal
     window.handleCloseModal = () => {
       console.log('handleCloseModal called');
       
       // إزالة الـ modal من الصفحة
       if (successModal && successModal.parentNode) {
         console.log('Removing modal from DOM');
         document.body.removeChild(successModal);
       } else {
         console.log('Modal not found or already removed');
         // محاولة إزالة جميع modals النجاح
         const allModals = document.querySelectorAll('.success-modal');
         allModals.forEach(modal => {
           if (modal.parentNode) {
             document.body.removeChild(modal.parentNode);
           }
         });
       }
       
       // مسح السلة
       clearCart();
       
       // إعادة التوجيه لصفحة الأوردرات مع slug المتجر
       const storeSlug = store?.slug || localStorage.getItem('storeSlug');
       if (storeSlug) {
         navigate(`/${storeSlug}/orders`);
       } else {
         navigate('/orders');
       }
     };
     
     // إضافة event listeners للأزرار كنسخة احتياطية
     setTimeout(() => {
       const whatsappButton = document.getElementById('whatsapp-button');
       const closeButton = document.getElementById('close-success-modal');
       
       if (whatsappButton) {
         console.log('WhatsApp button found, adding backup click listener');
         whatsappButton.addEventListener('click', () => {
           console.log('WhatsApp button clicked via backup listener');
           if (whatsappData.phoneNumber && whatsappData.whatsappMessage) {
             const whatsappUrl = `https://wa.me/${whatsappData.phoneNumber}?text=${encodeURIComponent(whatsappData.whatsappMessage)}`;
             console.log('Opening WhatsApp URL:', whatsappUrl);
             window.open(whatsappUrl, '_blank');
           }
         });
       }
       
       if (closeButton) {
         console.log('Close button found, adding backup click listener');
         closeButton.addEventListener('click', () => {
           console.log('Close button clicked via backup listener');
           // إزالة الـ modal
           if (successModal.parentNode) {
             document.body.removeChild(successModal);
           }
           // مسح السلة وإعادة التوجيه
           clearCart();
          //  navigate('/');
         });
       }
     }, 100);
     
     // إضافة CSS للحركات
     const style = document.createElement('style');
     style.textContent = `
       @keyframes fadeIn {
         from { opacity: 0; }
         to { opacity: 1; }
       }
       
       @keyframes slideInUp {
         from {
           opacity: 0;
           transform: translateY(30px) scale(0.9);
         }
         to {
           opacity: 1;
           transform: translateY(0) scale(1);
         }
       }
       
       @keyframes bounceIn {
         0% {
           transform: scale(0.3);
           opacity: 0;
         }
         50% {
           transform: scale(1.05);
         }
         70% {
           transform: scale(0.9);
         }
         100% {
           transform: scale(1);
           opacity: 1;
         }
       }
       
       @keyframes checkmark {
         0% {
           stroke-dasharray: 0 50;
           stroke-dashoffset: 50;
         }
         100% {
           stroke-dasharray: 50 50;
           stroke-dashoffset: 0;
         }
       }
     `;
     
     document.head.appendChild(style);
     document.body.appendChild(successModal);
     
     // دالة إغلاق Modal
     window.closeSuccessModal = () => {
       successModal.style.animation = 'fadeOut 0.3s ease-in';
       setTimeout(() => {
         if (successModal.parentNode) {
           successModal.parentNode.removeChild(successModal);
         }
         // مسح السلة وإعادة التوجيه
         clearCart();
        //  navigate('/');
       }, 300);
     };
     
     // إضافة CSS للإغلاق
     const closeStyle = document.createElement('style');
     closeStyle.textContent = `
       @keyframes fadeOut {
         from { opacity: 1; }
         to { opacity: 0; }
       }
     `;
     document.head.appendChild(closeStyle);
   };

   //-----------------------------------showErrorNotification------------------------------------------------  
   const showErrorNotification = (message) => {
    // Create a custom error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: Arial, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #dc3545;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">✕</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${currentLang === 'ar' ? 'خطأ' : 'Error'}
          </div>
          <div style="font-size: 14px;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
    
    // Add CSS animations
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

   //-----------------------------------showWhatsAppConfirmationPopup------------------------------------------------  
   const showWhatsAppConfirmationPopup = (verificationResult) => {
     // Create WhatsApp confirmation popup
     const popup = document.createElement('div');
     popup.style.cssText = `
       position: fixed;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.7);
       display: flex;
       align-items: center;
       justify-content: center;
       z-index: 10001;
       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
       animation: fadeIn 0.3s ease-out;
     `;
     
     // Get payment details from verification result
     const paymentData = verificationResult.data?.data;
     const amount = paymentData?.amount ? (parseInt(paymentData.amount) / 100).toFixed(2) : '0.00';
     const currency = paymentData?.currency || 'ILS';
     const reference = paymentData?.reference || 'N/A';
     
     popup.innerHTML = `
       <div style="
         background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
         border-radius: 20px;
         padding: 40px;
         max-width: 500px;
         width: 90%;
         text-align: center;
         box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
         border: 1px solid #e9ecef;
         position: relative;
         animation: slideInUp 0.4s ease-out;
       ">
         <!-- Close Button -->
         <button onclick="closeWhatsAppPopup()" style="
           position: absolute;
           top: 15px;
           right: 15px;
           background: none;
           border: none;
           font-size: 24px;
           color: #999;
           cursor: pointer;
           width: 30px;
           height: 30px;
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 50%;
           transition: all 0.2s ease;
           z-index: 10;
         " onmouseover="this.style.background='#f0f0f0'; this.style.color='#666'" onmouseout="this.style.background='none'; this.style.color='#999'">
           ✕
         </button>
         
         <!-- Success Icon -->
         <div style="
           width: 80px;
           height: 80px;
           border-radius: 50%;
           background: linear-gradient(135deg, #4CAF50, #45a049);
           display: flex;
           align-items: center;
           justify-content: center;
           margin: 0 auto 24px auto;
           box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
           animation: bounceIn 0.6s ease-out 0.2s both;
         ">
           <svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24" style="animation: checkmark 0.4s ease-out 0.6s both;">
             <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
           </svg>
         </div>
         
         <!-- Title -->
         <h2 style="
           color: #2E7D32;
           font-size: 28px;
           font-weight: 700;
           margin: 0 0 16px 0;
           text-shadow: 0 1px 2px rgba(0,0,0,0.1);
         ">
           ${currentLang === 'ar' ? '🎉 تم الدفع بنجاح! 🎉' : '🎉 Payment Successful! 🎉'}
         </h2>
         
         <!-- Payment Details -->
         <div style="
           background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
           border-radius: 15px;
           padding: 24px;
           margin: 20px 0;
           border: 2px solid #c8e6c9;
           position: relative;
           overflow: hidden;
         ">
           <div style="
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 12px;
           ">
             <span style="font-weight: 600; color: #1b5e20;">
               ${currentLang === 'ar' ? 'المبلغ:' : 'Amount:'}
             </span>
             <span style="font-weight: 700; font-size: 18px; color: #2E7D32;">
               ${getCurrencySymbol(currency)}${amount}
             </span>
           </div>
           <div style="
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 12px;
           ">
             <span style="font-weight: 600; color: #1b5e20;">
               ${currentLang === 'ar' ? 'رقم المرجع:' : 'Reference:'}
             </span>
             <span style="font-weight: 600; color: #2E7D32;">
               ${reference}
             </span>
           </div>
           <div style="
             display: flex;
             justify-content: space-between;
             align-items: center;
           ">
             <span style="font-weight: 600; color: #1b5e20;">
               ${currentLang === 'ar' ? 'الحالة:' : 'Status:'}
             </span>
             <span style="
               background: #4CAF50;
               color: white;
               padding: 4px 12px;
               border-radius: 20px;
               font-size: 12px;
               font-weight: 600;
             ">
               ${currentLang === 'ar' ? 'مكتمل' : 'Completed'}
             </span>
           </div>
         </div>
         
         <!-- Message -->
         <p style="
           color: #1b5e20;
           font-size: 16px;
           line-height: 1.6;
           margin: 20px 0;
           font-weight: 500;
         ">
           ${currentLang === 'ar' 
             ? 'تم الدفع بنجاح! اضغط على الزر أدناه لإرسال تفاصيل الطلب للواتساب وإكمال عملية الطلب.'
             : 'Payment completed successfully! Click the button below to send order details to WhatsApp and complete the order process.'
           }
         </p>
         
         <!-- WhatsApp Button -->
         <button id="whatsapp-confirmation-btn" style="
           background: linear-gradient(135deg, #25D366, #128C7E);
           color: white;
           border: none;
           border-radius: 12px;
           padding: 16px 24px;
           font-size: 16px;
           font-weight: 600;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
           transition: all 0.3s ease;
           text-decoration: none;
           width: 100%;
           margin-top: 20px;
         " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(37, 211, 102, 0.3)'">
           <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
             <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
           </svg>
           ${currentLang === 'ar' ? 'إرسال الطلب للواتساب' : 'Send Order to WhatsApp'}
         </button>
       </div>
     `;
     
     // Add close function to window
     window.closeWhatsAppPopup = () => {
       if (popup.parentNode) {
         popup.style.animation = 'fadeOut 0.3s ease-in';
         setTimeout(() => {
           if (popup.parentNode) {
             popup.parentNode.removeChild(popup);
           }
         }, 300);
       }
     };
     
     // Add click event for WhatsApp button
     setTimeout(() => {
       const whatsappBtn = document.getElementById('whatsapp-confirmation-btn');
       if (whatsappBtn) {
         whatsappBtn.addEventListener('click', () => {
           // Create order and send to WhatsApp
           handlePaymentVerificationSuccess();
           // Close popup
           window.closeWhatsAppPopup();
         });
       }
     }, 100);
     
     // Add CSS animations
     const style = document.createElement('style');
     style.textContent = `
       @keyframes fadeIn {
         from { opacity: 0; }
         to { opacity: 1; }
       }
       
       @keyframes slideInUp {
         from {
           opacity: 0;
           transform: translateY(30px) scale(0.9);
         }
         to {
           opacity: 1;
           transform: translateY(0) scale(1);
         }
       }
       
       @keyframes bounceIn {
         0% {
           transform: scale(0.3);
           opacity: 0;
         }
         50% {
           transform: scale(1.05);
         }
         70% {
           transform: scale(0.9);
         }
         100% {
           transform: scale(1);
           opacity: 1;
         }
       }
       
       @keyframes checkmark {
         0% {
           stroke-dasharray: 0 50;
           stroke-dashoffset: 50;
         }
         100% {
           stroke-dasharray: 50 50;
           stroke-dashoffset: 0;
         }
       }
       
       @keyframes fadeOut {
         from { opacity: 1; }
         to { opacity: 0; }
       }
     `;
     
     document.head.appendChild(style);
     document.body.appendChild(popup);
   };
//-----------------------------------if cartItems is empty------------------------------------------------  
  console.log('Checkout render - cartItems:', cartItems);
  console.log('Checkout render - cartItems.length:', cartItems?.length);
  console.log('Checkout render - cartItems type:', typeof cartItems);
  console.log('Checkout render - cartLoading:', cartLoading);
  console.log('Checkout render - cartItems is Array:', Array.isArray(cartItems));
  
  // إظهار loading state أثناء تحميل السلة
  if (cartLoading) {
    return (
      <div className="checkout-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <SecondaryNavbar />
        <div className="checkout-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل السلة...' : 'Loading cart...'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // التحقق من أن cartItems موجود وليس فارغاً بعد انتهاء التحميل
  if (!cartItems) {
    console.log('Cart items is null/undefined in render, returning null');
    return null;
  }
  
  if (!Array.isArray(cartItems)) {
    console.log('Cart items is not an array in render, returning null');
    return null;
  }
  
  if (cartItems.length === 0) {
    console.log('Cart is empty in render after loading, returning null');
    return null; 
  }
//-----------------------------------return------------------------------------------------  
  return (
    <div className="checkout-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
          <Navbar />
      <SecondaryNavbar />
      
      <div className="checkout-content">
        {/* Breadcrumb Navigation */}
        <Breadcrumb currentLang={currentLang} t={t} breadcrumbPath={[
          { name: t('secondary_navbar.cart'), slug: 'cart' },
          { name: t('checkout.title'), slug: '' }
        ]} />

        {/* Header */}
        <div className="checkout-header">
          <h1 className="page-title">
            {t('checkout.title')}
          </h1>
        </div>

        <div className="checkout-container">
          {/* Customer Information Form */}
          <div className="checkout-form-section">
            <h2 className="section-title">
              {t('checkout.delivery_info')}
            </h2>
            
            <CheckoutForm
              t={t}
              currentLang={currentLang}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              privacyChecked={privacyChecked}
              setPrivacyChecked={setPrivacyChecked}
              showPrivacyPopup={showPrivacyPopup}
              setShowPrivacyPopup={setShowPrivacyPopup}
              deliveryMethods={deliveryMethods}
              storeAddress={storeAddress}
              isTermsModalOpen={isTermsModalOpen}
              setIsTermsModalOpen={setIsTermsModalOpen}
              updateShippingArea={handleShippingAreaChange}
            />
          </div>

          {/* Order Summary */}
         
            
            <OrderSummary
              cartItems={cartItems}
              cartTotals={cartTotalsState}
              deliveryMethod={deliveryMethod}
              getShippingPrice={getShippingPrice}
              t={t}
              currentLang={currentLang}
              onPlaceOrder={handlePlaceOrderClick}
              isProcessing={isProcessing || isDirectOrderProcessing}
              privacyChecked={privacyChecked}
              store={store}
            />
         
        </div>
      </div>
 {/* Popup طرق الدفع */}
 {showPaymentPopup && (
        <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95%', padding: 60, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative' }}>
            <button type="button" onClick={() => setShowPaymentPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} aria-label="Close">×</button>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--primary-color)' }}>{t('checkout.payment_methods')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {paymentMethods.map(method => (
                <button key={method.key} onClick={() => handleSelectPayment(method)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 12, border: '1px solid #eee', background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 8, cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
                  <span>{method.label}</span>
                  <img className='payment-method-img' src={method.img} alt={method.label}  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
 {/* Popup تأكيد الدفع */}
 {showPaymentConfirm && (
        <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95%', padding: 60, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative', maxHeight: '80vh', overflowY: 'auto', textAlign: 'center' }}>
            <button type="button" onClick={() => { setShowPaymentConfirm(false); setSelectedPaymentMethod(null); }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} aria-label="Close">×</button>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: 16 }}>{t('checkout.payment_confirmation')}</h3>
            
            {/* Payment Method Info */}
            {selectedPaymentMethod && (
              <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <img src={selectedPaymentMethod.img} alt={selectedPaymentMethod.label} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{selectedPaymentMethod.label}</span>
                </div>
                {selectedPaymentMethod.description && (
                  <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{selectedPaymentMethod.description}</p>
                )}
              </div>
            )}

            <div style={{ margin: '24px 0' }}>
              <div style={{ background: '#e6f9ed', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <svg width="32" height="32" fill="none" stroke="var(--primary-color)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--primary-color)" strokeWidth="2" fill="#e6f9ed"/><path d="M9 12l2 2 4-4" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{t('checkout.payment_successful')}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{getCurrencySymbol(store?.settings.currency || 'ILS')}{(cartTotalsState.total + getShippingPrice()).toFixed(2)}</div>
              
              {/* QR Code - Show if payment method has QR code */}
              { selectedPaymentMethod?.qrCode?.qrCodeImage && (
                <div style={{ margin: '16px 0' }}>
                  <p style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>{t('checkout.scan_qr_code')}</p>
                  <img src={selectedPaymentMethod.qrCode.qrCodeImage} alt="QR Code" style={{ width: 120, height: 120, border: '1px solid #ddd', borderRadius: 8 }} />
                </div>
              )}
              
              {/* Payment Images - Show if payment method has additional images */}
              {selectedPaymentMethod?.paymentImages && selectedPaymentMethod.paymentImages.length > 0 && (
                <div style={{ margin: '16px 0' }}>
                  <p style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>{t('checkout.payment_instructions')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {selectedPaymentMethod.paymentImages.map((image, index) => (
                      <img 
                        key={index}
                        src={image.imageUrl} 
                        alt={image.altText || 'Payment instruction'} 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          objectFit: 'cover', 
                          border: '1px solid #ddd', 
                          borderRadius: 4 
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!paymentDone ? (
              <>
                <button onClick={handlePaymentDone} style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M2 12h20M2 12l7-7m-7 7l7 7" /></svg>
                  {t('checkout.i_have_paid')}
                </button>
                <button onClick={() => setShowPaymentConfirm(false)} style={{ width: '100%', background: 'none', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {t('checkout.pay_later')}
                </button>
              </>
            ) : (
              <button 
                onClick={handleSendWhatsApp} 
                disabled={orderLoading}
                style={{ 
                  width: '100%', 
                  background: orderLoading ? '#ccc' : '#25D366', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '14px 0', 
                  fontSize: 18, 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  cursor: orderLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {orderLoading ? (
                  <>
                    <div className="loading-spinner" style={{textAlign: 'center', width: 20, height: 20, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    {currentLang === 'ar' ? 'جاري إنشاء الطلب...' : 'Creating order...'}
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/></svg>
                    {t('checkout.send_whatsapp')}
                  </>
                )}
              </button>
            )}
          </div>
                 </div>
       )}

      {/* Success Modal */}
      {showSuccessModal && successOrderData && (
        <div className="privacy-popup-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          zIndex: 3000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="success-modal" style={{ 
            background: '#fff', 
            borderRadius: 16, 
            maxWidth: 500, 
            width: '95%', 
            padding: 40, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', 
            position: 'relative',
            textAlign: 'center',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Success Icon */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
            }}>
              <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Title */}
            <h2 style={{
              color: '#2E7D32',
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              fontFamily: 'Arial, sans-serif'
            }}>
              {currentLang === 'ar' ? 'تم إنشاء الطلب بنجاح! 🎉' : 'Order Created Successfully! 🎉'}
            </h2>

            {/* Success Message */}
            <p style={{
              color: '#555',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              fontFamily: 'Arial, sans-serif'
            }}>
              {currentLang === 'ar' 
                ? `تم إنشاء طلبك بنجاح! يمكنك الآن استلامه في أقرب وقت من ${successOrderData.deliveryMethod === 'store' ? 'المتجر' : 'العنوان المحدد'}.`
                : `Your order has been created successfully! You can now pick it up as soon as possible from ${successOrderData.deliveryMethod === 'store' ? 'the store' : 'the specified address'}.`
              }
            </p>

            {/* Delivery Info */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: 12,
              padding: '20px',
              margin: '0 0 24px 0',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#007bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  📍
                </div>
                <span style={{
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  {currentLang === 'ar' ? 'معلومات الاستلام:' : 'Pickup Information:'}
                </span>
              </div>
              <div style={{
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {successOrderData.deliveryMethod === 'store' 
                  ? (currentLang === 'ar' 
                      ? `استلام من المتجر: ${successOrderData.storeAddress || 'عنوان المتجر'}`
                      : `Store Pickup: ${successOrderData.storeAddress || 'Store Address'}`
                    )
                  : (currentLang === 'ar'
                      ? `توصيل للمنزل: ${formData.address}, ${formData.city}`
                      : `Home Delivery: ${formData.address}, ${formData.city}`
                    )
                }
              </div>
            </div>

            {/* WhatsApp Button */}
            <button 
              onClick={() => {
                // إغلاق البوب أب فوراً
                setShowSuccessModal(false);
                setSuccessOrderData(null);
                
                const whatsappUrl = `https://wa.me/${successOrderData.phoneNumber}?text=${encodeURIComponent(successOrderData.whatsappMessage)}`;
                window.open(whatsappUrl, '_blank');
                
                // مسح السلة
                clearCart();
                
                // إعادة التوجيه لصفحة الأوردرات مع slug المتجر
                setTimeout(() => {
                  const storeSlug = store?.slug || localStorage.getItem('storeSlug');
                  if (storeSlug) {
                    navigate(`/${storeSlug}/orders`);
                  } else {
                    navigate('/orders');
                  }
                }, 500);
              }}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '16px 0',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#128C7E';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#25D366';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
              </svg>
              {currentLang === 'ar' ? 'إرسال الطلب للواتساب' : 'Send Order to WhatsApp'}
            </button>


          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.8) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>

      {/* Lahza Payment Modal */}
      {showLahzaPayment && lahzaPaymentData && (
        <div className="privacy-popup-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          zIndex: 2200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="privacy-popup" style={{ 
            background: '#fff', 
            borderRadius: 16, 
            maxWidth: 600, 
            width: '95%', 
            padding: 40, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', 
            position: 'relative',
            textAlign: 'center',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              type="button" 
              onClick={() => { 
                setShowLahzaPayment(false); 
                setLahzaPaymentData(null); 
                setSelectedPaymentMethod(null); 
              }} 
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                background: 'none', 
                border: 'none', 
                fontSize: 24, 
                cursor: 'pointer', 
                color: '#888',
                zIndex: 10
              }} 
              aria-label="Close"
            >
              ×
            </button>

            {/* Lahza Payment Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}>
                <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 style={{ 
                color: '#667eea', 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 8px 0' 
              }}>
                {currentLang === 'ar' ? 'الدفع عبر Lahza' : 'Pay with Lahza'}
              </h3>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                margin: 0 
              }}>
                {currentLang === 'ar' 
                  ? 'سيتم توجيهك إلى صفحة الدفع الآمنة' 
                  : 'You will be redirected to the secure payment page'
                }
              </p>
            </div>

            {/* Payment Details */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: 12,
              padding: 20,
              margin: '24px 0',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <span style={{ fontWeight: '600', color: '#333' }}>
                  {currentLang === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}
                </span>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#667eea' }}>
                  {getCurrencySymbol(store?.settings?.currency || 'ILS')}{(cartTotalsState.total + getShippingPrice()).toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                <span>{currentLang === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span style={{ fontWeight: '600' }}>
                  {selectedPaymentMethod?.label || 'Lahza'}
                </span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div style={{
              background: '#e8f4fd',
              borderRadius: 12,
              padding: 16,
              margin: '20px 0',
              border: '1px solid #bee5eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#17a2b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  ℹ️
                </div>
                <span style={{ fontWeight: '600', color: '#0c5460' }}>
                  {currentLang === 'ar' ? 'تعليمات الدفع:' : 'Payment Instructions:'}
                </span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                color: '#0c5460',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <li>{currentLang === 'ar' ? 'اضغط على زر الدفع أدناه' : 'Click the payment button below'}</li>
                <li>{currentLang === 'ar' ? 'ستتم إعادة توجيهك إلى صفحة الدفع الآمنة' : 'You will be redirected to the secure payment page'}</li>
                <li>{currentLang === 'ar' ? 'أكمل عملية الدفع' : 'Complete the payment process'}</li>
                <li>{currentLang === 'ar' ? 'ستتم إعادة توجيهك تلقائياً بعد اكتمال الدفع' : 'You will be redirected back automatically after payment'}</li>
              </ul>
            </div>

            {/* Payment Button */}
            <button 
              onClick={() => {
                if (lahzaPaymentData.paymentUrl) {
                  // Open payment in same window instead of new window
                  window.location.href = lahzaPaymentData.paymentUrl;
                }
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '16px 0',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                marginBottom: 12
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {currentLang === 'ar' ? 'الدفع الآن' : 'Pay Now'}
            </button>

            {/* Cancel Button */}
            <button 
              onClick={() => { 
                setShowLahzaPayment(false); 
                setLahzaPaymentData(null); 
                setSelectedPaymentMethod(null); 
              }}
              style={{
                width: '100%',
                background: 'none',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#667eea';
              }}
            >
              {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.8) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>

      {/* Payment Verification Modal */}
      {showPaymentVerificationModal && paymentVerificationData && (
        <div className="privacy-popup-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          zIndex: 2500, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="privacy-popup" style={{ 
            background: '#fff', 
            borderRadius: 16, 
            maxWidth: 500, 
            width: '95%', 
            padding: 40, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', 
            position: 'relative',
            textAlign: 'center',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              type="button" 
              onClick={() => { 
                setShowPaymentVerificationModal(false); 
                setPaymentVerificationData(null); 
              }} 
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                background: 'none', 
                border: 'none', 
                fontSize: 24, 
                cursor: 'pointer', 
                color: '#888',
                zIndex: 10
              }} 
              aria-label="Close"
            >
              ×
            </button>

            {/* Payment Verification Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ 
                color: '#10b981', 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 8px 0' 
              }}>
                {currentLang === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
              </h3>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                margin: 0 
              }}>
                {currentLang === 'ar' 
                  ? 'تم التحقق من عملية الدفع بنجاح' 
                  : 'Payment verification completed successfully'
                }
              </p>
            </div>

            {/* Payment Details */}
            <div style={{
              background: '#f0fdf4',
              borderRadius: 12,
              padding: 20,
              margin: '24px 0',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <span style={{ fontWeight: '600', color: '#166534' }}>
                  {currentLang === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}
                </span>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#10b981' }}>
                  {currentLang === 'ar' ? 'مكتمل' : 'Completed'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                color: '#166534'
              }}>
                <span>{currentLang === 'ar' ? 'المبلغ:' : 'Amount:'}</span>
                <span style={{ fontWeight: '600' }}>
                  {getCurrencySymbol(store?.settings?.currency || 'ILS')}{(cartTotalsState.total + getShippingPrice()).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              background: '#eff6ff',
              borderRadius: 12,
              padding: 16,
              margin: '20px 0',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  ℹ️
                </div>
                <span style={{ fontWeight: '600', color: '#1e40af' }}>
                  {currentLang === 'ar' ? 'الخطوة التالية:' : 'Next Step:'}
                </span>
              </div>
              <p style={{
                margin: 0,
                color: '#1e40af',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {currentLang === 'ar' 
                  ? 'اضغط على الزر أدناه لإرسال تفاصيل الطلب للواتساب وإكمال عملية الطلب'
                  : 'Click the button below to send order details to WhatsApp and complete the order process'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button 
                onClick={handlePaymentVerificationSuccess}
                disabled={orderLoading}
                style={{
                  width: '100%',
                  background: orderLoading ? '#ccc' : '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '16px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  cursor: orderLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                  transition: 'all 0.3s ease',
                  marginBottom: 12
                }}
                onMouseOver={(e) => {
                  if (!orderLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!orderLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.3)';
                  }
                }}
              >
                {orderLoading ? (
                  <>
                    <div className="loading-spinner" style={{width: 20, height: 20, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    {currentLang === 'ar' ? 'جاري إنشاء الطلب...' : 'Creating order...'}
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
                    </svg>
                    {currentLang === 'ar' ? 'إرسال الطلب للواتساب' : 'Send Order to WhatsApp'}
                  </>
                )}
              </button>

              <button 
                onClick={() => { 
                  setShowPaymentVerificationModal(false); 
                  setPaymentVerificationData(null); 
                }}
                style={{
                  width: '100%',
                  background: 'none',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: 12,
                  padding: '14px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#10b981';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#10b981';
                }}
              >
                {currentLang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
     </div>
   );
 };

//-----------------------------------handleLahzaPaymentSuccess------------------------------------------------
const handleLahzaPaymentSuccess = async (transactionId) => {
  try {
    console.log('Lahza payment successful, verifying transaction:', transactionId);
    
    // Verify the payment
    const verificationResult = await verifyLahzaPayment(transactionId);
    
    if (verificationResult.success && verificationResult.paymentStatus === 'completed') {
      console.log('Lahza payment verified successfully');
      
      // Create the order with payment information
      await handleSendWhatsApp();
      
      // Close Lahza payment modal
      setShowLahzaPayment(false);
      setLahzaPaymentData(null);
      setSelectedPaymentMethod(null);
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Error handling Lahza payment success:', error);
    const errorMessage = currentLang === 'ar' 
      ? 'حدث خطأ في التحقق من الدفع. يرجى المحاولة مرة أخرى.'
      : 'Error verifying payment. Please try again.';
    showErrorNotification(errorMessage);
  }
};

//-----------------------------------handlePaymentVerificationSuccess------------------------------------------------
const handlePaymentVerificationSuccess = async () => {
  try {
    console.log('Payment verification successful, creating order...');
    
    // إنشاء الطلب مع معلومات الدفع
    await handleSendWhatsApp();
    
    // إغلاق modal التحقق من الدفع
    setShowPaymentVerificationModal(false);
    setPaymentVerificationData(null);
    
    // تنظيف URL من معاملات الدفع
    const url = new URL(window.location);
    url.searchParams.delete('reference');
    url.searchParams.delete('tap_id');
    url.searchParams.delete('transaction_id');
    window.history.replaceState({}, '', url);
    
  } catch (error) {
    console.error('Error handling payment verification success:', error);
    const errorMessage = currentLang === 'ar' 
      ? 'حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.'
      : 'Error creating order. Please try again.';
    showErrorNotification(errorMessage);
  }
};

export default Checkout; 
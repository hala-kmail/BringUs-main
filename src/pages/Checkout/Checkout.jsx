import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useDeliveryMethods } from '../../hooks/useDeliveryMethods';
import usePaymentMethods from '../../hooks/usePaymentMethods';
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
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import OrderSummary from '../../components/Checkout/OrderSummary';
import { validateRequired, validateAndSanitizePhone } from '../../utils/validation';
import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';
//-----------------------------------Checkout------------------------------------------------  
const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getCartTotals, clearCart, loading: cartLoading, updateShippingArea, shippingAreaId } = useCart();
  const { store, user } = useAppData();
  const currentLang = i18n.language;
  
  // Debug logging for store and user data
  console.log('Checkout - Store from context:', store);
  console.log('Checkout - User from context:', user);
  console.log('Checkout - Store ID:', store?._id);
  console.log('Checkout - User ID:', user?._id);
  
  // جلب طرق التوصيل من API
  const { deliveryMethods, loading: deliveryMethodsLoading, error: deliveryMethodsError } = useDeliveryMethods(store?._id);
  
  // جلب طرق الدفع من API
  const { paymentMethods: apiPaymentMethods, loading: paymentMethodsLoading, error: paymentMethodsError } = usePaymentMethods(store?._id);
  
  // إدارة الطلبات
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();
  
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
    fullName: '',
    phone: '',
    deliveryMethodId: '',
    address: '',
    city: '',
    district: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); 
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [cartTotalsState, setCartTotalsState] = useState({});

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
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phone: user.phone || '',
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
    errors.fullName = validateRequired(formData.fullName, t('checkout.validation.name_required'));
    const phoneResult = validateAndSanitizePhone(formData.phone, t('checkout.validation.phone_invalid'));
    errors.phone = phoneResult.error || validateRequired(formData.phone, t('checkout.validation.phone_required'));
    
    if (deliveryMethod === 'delivery') {
      // التحقق من اختيار طريقة التوصيل
      errors.deliveryMethodId = validateRequired(formData.deliveryMethodId, currentLang === 'ar' ? 'يرجى اختيار منطقة التوصيل' : 'Please select a delivery area');
      errors.address = validateRequired(formData.address, t('checkout.validation.address_required'));
      errors.city = validateRequired(formData.city, t('checkout.validation.city_required'));
    }
    
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
  setShowPaymentPopup(true);
};
//-----------------------------------handleSelectPayment------------------------------------------------  
 const handleSelectPayment = (method) => {
  setSelectedPaymentMethod(method);
  setShowPaymentPopup(false);
  setShowPaymentConfirm(true);
  setPaymentDone(false);
};
//-----------------------------------handlePaymentDone------------------------------------------------  
 const handlePaymentDone = () => {
  setPaymentDone(true);
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
        fullName: formData.fullName,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: 'guest@example.com', // You might want to add email field to the form
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        district: formData.district,
        country: 'Palestine',
        zipCode: ''
      },
      billingAddress: {
        fullName: formData.fullName,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: 'guest@example.com', // You might want to add email field to the form
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        district: formData.district,
        country: 'Palestine',
        zipCode: ''
      },
      paymentInfo: {
        method: getPaymentMethodForAPI(selectedPaymentMethod?.methodType),
        paymentMethodId: selectedPaymentMethod?.key,
        status: 'pending'
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

    // إضافة logging للبيانات المعالجة
    console.log('=== PROCESSED ORDER DATA ===');
    console.log('Store:', orderData.store);
    console.log('User ID:', orderData.user);
    console.log('Items processed:', orderData.items.map((item, index) => ({
      index: index + 1,
      product: item.product,
      quantity: item.quantity
    })));
    console.log('Cart Items with specifications:', orderData.cartItems.map((item, index) => ({
      index: index + 1,
      product: item.product,
      quantity: item.quantity,
      selectedSpecifications: item.selectedSpecifications,
      selectedColors: item.selectedColors
    })));
    console.log('Delivery Area ID:', orderData.deliveryArea);
    console.log('Currency:', orderData.currency);
    console.log('Store Currency:', store?.settings.currency);
    console.log('Shipping Address:', orderData.shippingAddress);
    console.log('Payment Info:', orderData.paymentInfo);
    console.log('=== END PROCESSED ORDER DATA ===');

    console.log('Cart items:', cartItems);
    console.log('Store ID:', store?._id);
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    
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
    console.log('Order created successfully:', createdOrder);

    // إرسال رسالة الواتساب مع معلومات الطلب
    const whatsappOrderData = {
      orderNumber: createdOrder.orderNumber,
      customerInfo: formData,
      items: cartItems,
      totals: { ...cartTotalsState, shipping: getShippingPrice(), total: cartTotalsState.subtotal + getShippingPrice() },
      orderDate: new Date().toISOString(),
      deliveryMethod: deliveryMethod,
      deliveryMethodId: formData.deliveryMethodId,
      paymentMethod: selectedPaymentMethod?.label
    };
    
    handleWhatsAppOrder(whatsappOrderData);
    
    // مسح السلة وإعادة التوجيه
    clearCart();
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod(null);
    setShowPaymentPopup(false);
    setPaymentDone(false);
    
    // إعادة التوجيه إلى صفحة تأكيد الطلب أو الصفحة الرئيسية
    navigate('/');
    
  } catch (error) {
    console.error('Error creating order:', error);
    // إضافة رسالة خطأ للمستخدم
    const errorMessage = currentLang === 'ar' 
      ? 'حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.'
      : 'Error creating order. Please try again.';
    alert(errorMessage);
  }
};
//-----------------------------------handleWhatsAppOrder------------------------------------------------  
  const handleWhatsAppOrder = (orderData) => {
    const { orderNumber, customerInfo, items, totals } = orderData;
    
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
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    // معلومات العميل - Customer Information
    message += isArabic 
      ? ` *معلومات العميل:*\n`
      : ` *Customer Information:*\n`;
    message += isArabic 
      ? ` *الاسم:* ${customerInfo.fullName || 'غير محدد'}\n`
      : ` *Name:* ${customerInfo.fullName || 'N/A'}\n`;
    message += isArabic 
      ? ` الهاتف: ${customerInfo.phone || 'غير محدد'}\n`
      : ` Phone: ${customerInfo.phone || 'N/A'}\n`;
    message += isArabic 
      ? ` العنوان: ${customerInfo.address || 'غير محدد'}, ${customerInfo.city || 'غير محدد'}`
      : ` Address: ${customerInfo.address || 'N/A'}, ${customerInfo.city || 'N/A'}`;
    if (customerInfo.district) {
      message += `, ${customerInfo.district}`;
    }
    message += '\n\n';
    
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
      const itemPrice = item.product.finalPrice || item.priceAtAdd || item.price || 0;
      const currencySymbol = getCurrencySymbol(store?.settings.currency || 'ILS');
      
      message += `\n${index + 1}. *${itemName}*\n`;
      message += isArabic 
        ? `  الكمية: ${item.quantity}\n`
        : `  Quantity: ${item.quantity}\n`;
      message += isArabic 
        ? `  السعر: ${currencySymbol}${itemPrice.toFixed(2)}\n`
        : `   Price: ${currencySymbol}${itemPrice.toFixed(2)}\n`;
      
      // إضافة الألوان المختارة - Colors
      if (item.selectedColors && item.selectedColors.length > 0) {
        message += isArabic 
          ? ` الألوان: `
          : `  Colors: `;
        item.selectedColors.forEach((color, colorIndex) => {
          const colorName = getColorLabel(color, t);
          message += `${colorName}${colorIndex < item.selectedColors.length - 1 ? ', ' : ''}`;
        });
        message += '\n';
      }
      
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
      ? ` المجموع الفرعي: ${currencySymbol}${totals.subtotal.toFixed(2)}\n`
      : ` Subtotal: ${currencySymbol}${totals.subtotal.toFixed(2)}\n`;
    message += isArabic 
      ? ` رسوم الشحن: ${totals.shipping === 0 ? ' مجاني' : `${currencySymbol}${totals.shipping.toFixed(2)}`}\n`
      : ` Shipping: ${totals.shipping === 0 ? ' Free' : `${currencySymbol}${totals.shipping.toFixed(2)}`}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += isArabic 
      ? ` *الإجمالي النهائي: ${currencySymbol}${totals.total.toFixed(2)}*\n`
      : ` *Final Total: ${currencySymbol}${totals.total.toFixed(2)}*\n`;
    

    
    // Get WhatsApp number from store data or use fallback
    const phoneNumber = store?.contact?.whatsapp || store?.contact?.phone;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
              isProcessing={isProcessing}
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
                    <div className="loading-spinner" style={{ width: 20, height: 20, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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

    </div>
  );
};

export default Checkout; 
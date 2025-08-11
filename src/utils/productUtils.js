// src/utils/productUtils.js

export const getSimpleColorsFromColorsField = (product) => {
  const colorsField = product?.colors;
  
  if (!colorsField) return [];

  let colorsArray = [];
  
  // محاولة تحليل JSON إذا كان string
  if (typeof colorsField === 'string') {
    try {
      colorsArray = JSON.parse(colorsField);
    } catch (error) {
      console.error('Error parsing colors JSON:', error);
      return [];
    }
  } else if (Array.isArray(colorsField)) {
    // إذا كان array مباشرة (للتوافق مع الكود القديم)
    colorsArray = colorsField;
  } else {
    return [];
  }
  
  if (!Array.isArray(colorsArray) || colorsArray.length === 0) return [];

  const extractedColors = [];
  
  colorsArray.forEach(colorItem => {
    if (Array.isArray(colorItem)) {
      // إذا كان اللون مصفوفة (ألوان متعددة) فأضف كل لون منفرداً
      colorItem.forEach(hex => {
        const colorName = hexToColorName(hex);
        extractedColors.push(colorName);
      });
    } else if (typeof colorItem === 'string') {
      // لون واحد كسطر نصي - تحويل hex إلى اسم اللون
      const colorName = hexToColorName(colorItem);
      extractedColors.push(colorName);
    }
  });
  
  return extractedColors.filter(Boolean); // حذف القيم الفارغة
};

// دالة لاستخراج hex codes الأصلية للعرض في الواجهة
export const getOriginalColorsFromColorsField = (product) => {
  const colorsField = product?.colors;
  
  if (!colorsField) return [];

  let colorsArray = [];
  
  // محاولة تحليل JSON إذا كان string
  if (typeof colorsField === 'string') {
    try {
      colorsArray = JSON.parse(colorsField);
    } catch (error) {
      console.error('Error parsing colors JSON:', error);
      return [];
    }
  } else if (Array.isArray(colorsField)) {
    // إذا كان array مباشرة (للتوافق مع الكود القديم)
    colorsArray = colorsField;
  } else {
    return [];
  }
  
  if (!Array.isArray(colorsArray) || colorsArray.length === 0) return [];

  const extractedColors = [];
  
  colorsArray.forEach(colorItem => {
    if (Array.isArray(colorItem)) {
      // إذا كان اللون مصفوفة (ألوان متعددة)
      if (colorItem.length === 1) {
        // لون واحد فقط
        extractedColors.push(colorItem[0]);
      } else if (colorItem.length > 1) {
        // ألوان متعددة - دمجها
        const mixedColor = colorItem.join('+');
        extractedColors.push(mixedColor);
      }
    } else if (typeof colorItem === 'string') {
      // لون واحد كسطر نصي
      extractedColors.push(colorItem);
    }
  });
  
  return extractedColors.filter(Boolean); // حذف القيم الفارغة
};

// دالة للتحقق من دور المستخدم
export const getUserRole = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return user.role || null;
    }
  } catch (error) {
    console.error('Error parsing user info:', error);
  }
  return null;
};

// دالة للتحقق من أن المستخدم هو تاجر جملة
export const isWholesaler = () => {
  const userRole = getUserRole();
  return userRole === 'wholesaler';
};

// Helper function to check if a discount is active
export const isDiscountActive = (product) => {
  if ( 
    product.salePercentage === null ||
    product.salePercentage === undefined ||
    Number(product.salePercentage) <= 0
  ) return false;
  return true;
};

// Helper function to get the final price of a product
export const getEffectivePrice = (product) => { 
  // إذا كان هناك finalPrice (سعر بعد الخصم)، استخدمه
  if (product.finalPrice !== undefined && product.finalPrice !== null) {
    return product.finalPrice;
  }
  // وإلا استخدم السعر العادي
  return product.price || 0;
};

// دالة جديدة للحصول على السعر المناسب حسب دور المستخدم
export const getPriceByUserRole = (product) => {
  // إذا كان المستخدم تاجر جملة، استخدم سعر تاجر الجملة بدون خصم
  if (isWholesaler()) {
    // استخدم compareAtPrice كسعر أساسي لتاجر الجملة (بدون خصم)
    if (product.compareAtPrice !== undefined && product.compareAtPrice !== null && product.compareAtPrice > 0) {
      return product.compareAtPrice; // بدون خصم
    }
  }
  
  // للمستخدمين العاديين، استخدم السعر العادي مع الخصومات
  return getEffectivePrice(product);
};

//---------------------------------getOriginalPriceByUserRole---------------------------------

export const getOriginalPriceByUserRole = (product) => {
  // إذا كان المستخدم تاجر جملة، استخدم compareAtPrice كسعر أصلي (بدون خصم)
  if (isWholesaler()) {
    if (product.compareAtPrice !== undefined && product.compareAtPrice !== null && product.compareAtPrice > 0) {
      return product.compareAtPrice; // بدون خصم
    }
  }
  return product.price || 0;
};

//---------------------------------getPriceWithUserDiscount---------------------------------
// دالة جديدة لتطبيق خصم المستخدم التاجر الجملة
export const getPriceWithUserDiscount = (basePrice) => {
  try {
    const userDiscount = localStorage.getItem('userDiscount');
    if (userDiscount) {
      const discountData = JSON.parse(userDiscount);
      if (discountData.value && discountData.value > 0) {
        // حساب السعر بعد خصم المستخدم
        const discountAmount = (basePrice * discountData.value) / 100;
        const finalPrice = basePrice - discountAmount;
        return Math.max(0, finalPrice); // التأكد من أن السعر لا يكون سالب
      }
    }
  } catch (error) {
    console.error('Error applying user discount:', error);
  }
  
  // إذا لم يكن هناك خصم أو حدث خطأ، إرجاع السعر الأصلي
  return basePrice;
};

//---------------------------------getUserDiscountPercentage---------------------------------
// دالة للحصول على نسبة خصم المستخدم
export const getUserDiscountPercentage = () => {
  try {
    const userDiscount = localStorage.getItem('userDiscount');
    if (userDiscount) {
      const discountData = JSON.parse(userDiscount);
      return discountData.value || 0;
    }
  } catch (error) {
    console.error('Error getting user discount:', error);
  }
  return 0;
};

//---------------------------------getCartTotalDiscount---------------------------------
// دالة جديدة لحساب خصم المستخدم على توتال السلة (بدون التأثير على أسعار المنتجات الفردية)
export const getCartTotalDiscount = (subtotal) => {
  try {
    const userDiscount = localStorage.getItem('userDiscount');
    if (userDiscount) {
      const discountData = JSON.parse(userDiscount);
      if (discountData.value && discountData.value > 0) {
        // حساب خصم المستخدم على توتال السلة
        const discountAmount = (subtotal * discountData.value) / 100;
        return Math.max(0, discountAmount); // التأكد من أن الخصم لا يكون سالب
      }
    }
  } catch (error) {
    console.error('Error calculating cart total discount:', error);
  }
  return 0;
};

//---------------------------------organizeSpecifications---------------------------------
export const organizeSpecifications = (specifications) => {
  if (!specifications || !Array.isArray(specifications)) return [];
  
  const grouped = {};
  specifications.forEach(spec => {
    const title = spec.title || 'المواصفات';
    if (!grouped[title]) {
      grouped[title] = [];
    }
    grouped[title].push(spec);
  });
  
  return Object.entries(grouped).map(([title, specs]) => ({
    title,
    specifications: specs
  }));
};

//---------------------------------hexToColorName---------------------------------
export const hexToColorName = (hex) => {
  if (!hex) return '';
  
  // Remove # if present
  const cleanHex = hex.replace('#', '').toLowerCase();
  
  // Map of hex codes to color names
  const hexToColorMap = {
    'ff0000': 'red',
    'f00': 'red',
    'ef4444': 'red',
    'dc2626': 'red',
    'b91c1c': 'red',
    '00ff00': 'green',
    '0f0': 'green',
    '22c55e': 'green',
    '16a34a': 'green',
    '15803d': 'green',
    '0000ff': 'blue',
    '00f': 'blue',
    '3b82f6': 'blue',
    '2563eb': 'blue',
    '1d4ed8': 'blue',
    'ffff00': 'yellow',
    'ff0': 'yellow',
    'f8e71c': 'yellow',
    'eab308': 'yellow',
    'facc15': 'yellow',
    'fbbf24': 'yellow',
    'ffa500': 'orange',
    'f97316': 'orange',
    'ea580c': 'orange',
    '800080': 'purple',
    'a855f7': 'purple',
    '9333ea': 'purple',
    '7c3aed': 'purple',
    'ffffff': 'white',
    'fff': 'white',
    'f9fafb': 'white',
    '000000': 'black',
    '000': 'black',
    '1f2937': 'black',
    '111827': 'black',
    '964b00': 'brown',
    '92400e': 'brown',
    'a16207': 'brown',
    'ffc0cb': 'pink',
    'ec4899': 'pink',
    'db2777': 'pink',
    'be185d': 'pink',
    '808080': 'grey',
    '888': 'grey',
    '6b7280': 'grey',
    '4b5563': 'grey',
    '374151': 'grey',
    'f5f5dc': 'beige',
    'ffd700': 'gold',
    'f59e0b': 'gold',
    'd97706': 'gold',
    'c0c0c0': 'silver',
    'd1d5db': 'silver',
    '9ca3af': 'silver',
    '00ffff': 'cyan',
    '0ff': 'cyan',
    '06b6d4': 'cyan',
    '0891b2': 'cyan',
    '008080': 'teal',
    '14b8a6': 'teal',
    '0d9488': 'teal',
    '808000': 'olive',
    '000080': 'navy',
    '1e40af': 'navy',
    '1e3a8a': 'navy',
    '800000': 'maroon',
    '00ff00': 'lime',
    '84cc16': 'lime',
    '65a30d': 'lime',
    'ff7f50': 'coral',
    'f87171': 'coral',
    'ef4444': 'coral',
    '4b0082': 'indigo',
    '6366f1': 'indigo',
    '4f46e5': 'indigo',
    'ffbf00': 'amber',
    'f59e0b': 'amber',
    'd97706': 'amber'
  };
  
  return hexToColorMap[cleanHex] || hex;
};

//---------------------------------getColorName---------------------------------
export const getColorName = (hex) => {
  if (!hex) return '';
  
  // Handle mixed colors (JSON string)
  if (typeof hex === 'string' && (hex.startsWith('[') || hex.startsWith('"['))) {
    try {
      const colors = JSON.parse(hex);
      if (Array.isArray(colors)) {
        return colors.length > 1 ? 'متعدد الألوان' : hexToColorName(colors[0]);
      }
    } catch (e) {
      // إذا فشل التحليل، اعرض النص كما هو
      return hex;
    }
  }
  
  // Handle mixed colors with + separator
  if (typeof hex === 'string' && hex.includes('+')) {
    return 'متعدد الألوان';
  }
  
  return hexToColorName(hex);
};

//---------------------------------validateProductForCart---------------------------------
export const validateProductForCart = (product, selectedColor, selectedSize) => {
  const errors = [];
  
  const simpleColors = getSimpleColorsFromColorsField(product);
  if (simpleColors && simpleColors.length > 0 && !selectedColor) {
    errors.push('color_required');
  }
  
  // Check if size is required and selected
  const hasSizeSpecs = product.specificationValues?.some(spec => 
    spec.title === 'الحجم' || spec.title === 'Size'
  );
  if (hasSizeSpecs && !selectedSize) {
    errors.push('size_required');
  }
  
  return errors;
}; 
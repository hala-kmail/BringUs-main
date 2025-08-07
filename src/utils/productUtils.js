// src/utils/productUtils.js

export const getSimpleColorsFromColorsField = (product) => {
  const colorsField = product?.colors;
  console.log('Raw colors field:', colorsField);
  
  if (!colorsField) return [];

  let colorsArray = [];
  
  // محاولة تحليل JSON إذا كان string
  if (typeof colorsField === 'string') {
    try {
      colorsArray = JSON.parse(colorsField);
      console.log('Parsed colors array:', colorsArray);
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
    console.log('Processing color item:', colorItem);
    if (Array.isArray(colorItem)) {
      // إذا كان اللون مصفوفة (ألوان متعددة)
      if (colorItem.length === 1) {
        // لون واحد فقط
        extractedColors.push(colorItem[0]);
        console.log('Added single color:', colorItem[0]);
      } else if (colorItem.length > 1) {
        // ألوان متعددة - دمجها
        const mixedColor = colorItem.join('+');
        extractedColors.push(mixedColor);
        console.log('Added mixed color:', mixedColor);
      }
    } else if (typeof colorItem === 'string') {
      // لون واحد كسطر نصي
      extractedColors.push(colorItem);
      console.log('Added string color:', colorItem);
    }
  });
  
  console.log('Final extracted colors:', extractedColors);
  return extractedColors.filter(Boolean); // حذف القيم الفارغة
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

// Helper function to organize specifications by title
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

// Helper function to get color name from hex
export const getColorName = (hex) => {
  if (!hex) return '';
  
  // Handle mixed colors (JSON string)
  if (typeof hex === 'string' && (hex.startsWith('[') || hex.startsWith('"['))) {
    try {
      const colors = JSON.parse(hex);
      if (Array.isArray(colors)) {
        return colors.length > 1 ? 'متعدد الألوان' : colors[0];
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
  
  return hex;
};

// Helper function to validate product for cart
export const validateProductForCart = (product, selectedColor, selectedSize) => {
  const errors = [];
  
  // Check if color is required and selected
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
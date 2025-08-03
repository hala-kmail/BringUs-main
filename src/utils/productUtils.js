// src/utils/productUtils.js

export const getSimpleColorsFromColorsField = (product) => {
  const colorsArray = product?.colors || [];
  console.log('Raw colors array:', colorsArray);
  
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
    product.discountPercentage === null ||
    product.discountPercentage === undefined ||
    Number(product.discountPercentage) <= 0
  ) return false;
  return true;
};

// Helper function to get the final price of a product
export const getEffectivePrice = (product) => { 
  return product.finalPrice || product.price || 0;
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
  if (hex.startsWith('[') || hex.startsWith('"[')) {
    try {
      const colors = JSON.parse(hex);
      if (Array.isArray(colors)) {
        return colors.length > 1 ? 'متعدد الألوان' : colors[0];
      }
    } catch (e) {
      return hex;
    }
  }
  
  return hex;
};

// Helper function to validate product for cart
export const validateProductForCart = (product, selectedColor, selectedSize) => {
  const errors = [];
  
  // Check if color is required and selected
  if (product.allColors && product.allColors.length > 0 && !selectedColor) {
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
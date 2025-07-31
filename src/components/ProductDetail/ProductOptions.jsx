import React from 'react';
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';

const ProductOptions = ({
  product,
  currentLang,
  t,
  selectedColor,
  setSelectedColor,
  selectedSpecs,
  setSelectedSpecs,
  quantity,
  setQuantity,
  getColorLabel,
  specificationsMeta = []
}) => {
  // استخدم فقط getSimpleColorsFromColorsField
  const simpleColors = getSimpleColorsFromColorsField(product);


  // ربط المواصفات مع بيانات meta
  const organizedSpecs = React.useMemo(() => {
    if (!product.specificationValues || !Array.isArray(product.specificationValues) || !specificationsMeta || specificationsMeta.length === 0) return [];
    const grouped = {};
    product.specificationValues.forEach(spec => {
      const meta = specificationsMeta.find(m => m._id === spec.specificationId);
      const title = currentLang === 'ar'
        ? (meta?.titleAr || spec.titleAr || spec.title || '')
        : (meta?.titleEn || spec.titleEn || spec.title || '');
      if (!grouped[title]) grouped[title] = { title, values: [], meta };
      // مطابقة valueId أو valueAr فقط
      let metaValue = meta?.values?.find(v => v._id === spec.valueId);
      if (!metaValue) {
        metaValue = meta?.values?.find(v => v.valueAr === spec.value);
      }
      grouped[title].values.push({
        ...spec,
        valueAr: metaValue?.valueAr || spec.valueAr || spec.value,
        valueEn: metaValue?.valueEn || spec.valueEn || metaValue?.valueAr || spec.value
      });
    });
    return Object.values(grouped).sort((a, b) => (a.meta?.sortOrder || 0) - (b.meta?.sortOrder || 0));
  }, [product.specificationValues, specificationsMeta, currentLang]);

  // --- Debugging ---
  console.log('specificationsMeta:', specificationsMeta);
  console.log('product.specificationValues:', product.specificationValues);
  console.log('organizedSpecs:', organizedSpecs);

  // إدارة اختيار المواصفات (حجم، طول، ...)
  // سنستخدم selectedSpecs ككائن: {specificationId: {valueId, valueAr, valueEn, titleAr, titleEn}}
  React.useEffect(() => {
    // تعيين القيم الافتراضية عند تحميل المنتج
    if (organizedSpecs.length > 0) {
      const initial = {};
      organizedSpecs.forEach(group => {
        if (group.values.length > 0 && group.meta) {
          const firstValue = group.values[0];
          initial[group.meta._id] = {
            valueId: firstValue._id, // استخدام _id من API
            valueAr: firstValue.valueAr || firstValue.value,
            valueEn: firstValue.valueEn || firstValue.value,
            titleAr: group.meta?.titleAr || group.title,
            titleEn: group.meta?.titleEn || group.title
          };
        }
      });
      setSelectedSpecs(initial);
    }
  }, [product._id, organizedSpecs, setSelectedSpecs]);

  const handleSpecSelect = (title, value, specificationId, valueId) => {
    // البحث عن المواصفة في organizedSpecs للحصول على الترجمات
    const specGroup = organizedSpecs.find(group => group.meta._id === specificationId);
    const specValue = specGroup?.values.find(spec => spec._id === valueId);
    
    setSelectedSpecs(prev => ({ 
      ...prev, 
      [specificationId]: {
        valueId: valueId, // هذا هو _id من API
        valueAr: specValue?.valueAr || value,
        valueEn: specValue?.valueEn || value,
        titleAr: specGroup?.meta?.titleAr || title,
        titleEn: specGroup?.meta?.titleEn || title
      }
    }));
  };

  return (
    <div className="product-options-container">
      {/* Color Selection */}
      {simpleColors.length > 0 && (
        <div className="product-color-selection">
          <h3 className="selection-title">
            {currentLang === 'ar' ? 'اللون' : 'Color'}: <span className="selected-option">{getColorLabel(selectedColor)}</span>
          </h3>
          <div className="color-options">
            {simpleColors.map((color, idx) => {
              // إذا كان اللون عبارة عن دمج (مثل #fff+#000)
              const isMixed = color.includes('+');
              return (
                <div
                  key={color + idx}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{
                    background: isMixed ? `linear-gradient(45deg, ${color.split('+').join(', ')})` : color,
                    border: color === "#fff" || color === "#ffffff" ? "2px solid #e2e8f0" : undefined
                  }}
                  onClick={() => setSelectedColor(color)}
                  title={getColorLabel(color)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Specifications Selection - تصميم عصري */}
      {specificationsMeta && specificationsMeta.length > 0 && organizedSpecs.length > 0 ? (
        organizedSpecs.map((group, groupIndex) => (
          <div key={groupIndex} className="product-specification-selection">
            <div className="specification-title">
              {currentLang === 'ar'
                ? (group.meta?.titleAr || group.title)
                : (group.meta?.titleEn || group.title)}
            </div>
            <div className="specification-options">
              {group.values.map((spec) => {
                const value = currentLang === 'ar' ? (spec.valueAr || spec.value) : (spec.valueEn || spec.value);
                const isSelected = selectedSpecs[group.meta._id]?.valueId === spec._id;
                return (
                  <button
                    key={spec._id}
                    className={`specification-option${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSpecSelect(group.title, spec.value, group.meta._id, spec._id)}
                    type="button"
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div style={{color:'#888', fontSize:'0.98rem', margin:'1rem 0'}}>
          {t('product_detail.loading')}
        </div>
      )}

      {/* Quantity Selection */}
      <div className="product-quantity-selection">
        <h3 className="selection-title">
          {currentLang === 'ar' ? 'الكمية' : 'Quantity'}: <span className="selected-option">{quantity}</span>
        </h3>
        <div className="quantity-selector">
          <button
            className="quantity-btn decrease"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || product.availableQuantity === 0}
          >
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button
            className="quantity-btn increase"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= (product.availableQuantity || 999) || product.availableQuantity === 0}
          >
            +
          </button>
        </div>
        {/* تحذير المخزون المنخفض */}
        {product.availableQuantity && product.lowStockThreshold && product.availableQuantity <= product.lowStockThreshold && product.availableQuantity > 0 && (
          <div className="stock-info-low">
            <span className="stock-warning-icon" role="img" aria-label="low stock">⚠️</span>
            <span>
              {t('product_detail.low_stock_warning', { count: product.availableQuantity })}
            </span>
          </div>
        )}
        {/* إذا كان المنتج منتهي */}
        {product.availableQuantity === 0 && (
          <div className="stock-info-out">
            <span className="stock-out-icon" role="img" aria-label="out of stock">⏳</span>
            <span>{t('product_detail.out_of_stock_soon')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOptions; 
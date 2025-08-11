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
  specificationsMeta = [],
  onAvailabilityChange
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
      // استخدام specificationId كـ key بدلاً من title لتجنب مشاكل ObjectId
      const specKey = spec.specificationId;
      if (!grouped[specKey]) grouped[specKey] = { title, values: [], meta, specificationId: specKey };
      // مطابقة valueId أو valueAr فقط
      let metaValue = meta?.values?.find(v => v._id === spec.valueId);
      if (!metaValue) {
        metaValue = meta?.values?.find(v => v.valueAr === spec.value);
      }
      grouped[specKey].values.push({
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
          initial[group.specificationId] = {
            valueId: firstValue.valueId || firstValue._id, // استخدام valueId أولاً، ثم _id كبديل
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
    const specGroup = organizedSpecs.find(group => group.specificationId === specificationId);
    const specValue = specGroup?.values.find(spec => spec._id === valueId);
    
    setSelectedSpecs(prev => ({ 
      ...prev, 
      [specificationId]: {
        valueId: specValue?.valueId || valueId, // استخدام valueId من specValue أولاً، ثم valueId كبديل
        valueAr: specValue?.valueAr || value,
        valueEn: specValue?.valueEn || value,
        titleAr: specGroup?.meta?.titleAr || title,
        titleEn: specGroup?.meta?.titleEn || title
      }
    }));
  };

  // Compute effective availability for current selection
  const effectiveAvailable = React.useMemo(() => {
    // Start with product availableQuantity if provided, else a large number
    let available = Number.isFinite(product?.availableQuantity) ? product.availableQuantity : Number.POSITIVE_INFINITY;
    
    console.log('🔍 Computing effective availability:', {
      productAvailableQuantity: product?.availableQuantity,
      initialAvailable: available,
      organizedSpecs: organizedSpecs.length,
      selectedSpecs: selectedSpecs
    });
    
    // Reduce by selected spec quantities (take the minimum among selected specs that have a defined quantity)
    if (organizedSpecs.length > 0 && selectedSpecs) {
      organizedSpecs.forEach(group => {
        const selected = selectedSpecs[group.specificationId];
        if (selected) {
          const match = group.values.find(v => v.valueId === selected.valueId);
          console.log('🔍 Checking spec:', {
            groupTitle: group.title,
            selectedValueId: selected.valueId,
            match: match,
            matchQuantity: match?.quantity
          });
          if (typeof match?.quantity === 'number') {
            available = Math.min(available, match.quantity);
            console.log('🔍 Updated available to:', available);
          }
        }
      });
    }
    
    // If still Infinity (no limits found), fallback to product.availableQuantity or 0
    if (!Number.isFinite(available)) {
      available = product?.availableQuantity ?? 0;
      console.log('🔍 Using fallback available:', available);
    }
    
    const finalAvailable = Math.max(0, available);
    console.log('🔍 Final effective available:', finalAvailable);
    
    return finalAvailable;
  }, [product?.availableQuantity, organizedSpecs, selectedSpecs]);

  // Inform parent about availability changes
  React.useEffect(() => {
    if (typeof onAvailabilityChange === 'function') {
      onAvailabilityChange(effectiveAvailable);
    }
    // Also clamp quantity if it exceeds current availability
    if (quantity > effectiveAvailable) {
      setQuantity(Math.max(1, effectiveAvailable));
    }
  }, [effectiveAvailable]);

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
                const isSelected = selectedSpecs[group.specificationId]?.valueId === spec._id;
                  const isOut = Number(spec.quantity) === 0;
                  const isLow = Number(spec.quantity) > 0 && Number(spec.quantity) <= 3;
                return (
                  <button
                    key={spec._id}
                      className={`specification-option${isSelected ? ' selected' : ''}${isOut ? ' out-of-stock' : ''}${isLow ? ' low-stock' : ''}`}
                      onClick={() => !isOut && handleSpecSelect(group.title, spec.value, group.specificationId, spec._id)}
                      type="button"
                      disabled={isOut}
                  >
                      <span className="spec-value-text">{value}</span>
                      {typeof spec.quantity === 'number' && (
                        <span className="spec-qty-hint" aria-hidden>
                          {spec.quantity}
                        </span>
                      )}
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
            disabled={quantity <= 1 || effectiveAvailable === 0}
          >
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button
            className="quantity-btn increase"
            onClick={() => {
              const newQuantity = Math.min(effectiveAvailable, quantity + 1);
              console.log('Increasing quantity:', { current: quantity, new: newQuantity, available: effectiveAvailable });
              setQuantity(newQuantity);
            }}
            disabled={quantity >= (effectiveAvailable || 0) || effectiveAvailable === 0}
            title={currentLang === 'ar' ? `الكمية المتوفرة: ${effectiveAvailable}` : `Available: ${effectiveAvailable}`}
          >
            +
          </button>
        </div>
        {/* تحذير المخزون حسب المواصفة المختارة */}
        {effectiveAvailable > 0 && effectiveAvailable <= 3 && (
          <div className="stock-info-low">
            <span className="stock-warning-icon" role="img" aria-label="low stock">⚠️</span>
            <span>
              {currentLang === 'ar' ? `الكمية المتبقية: ${effectiveAvailable}` : `Only ${effectiveAvailable} left`}
            </span>
          </div>
        )}
        {/* إذا كانت المواصفة المختارة منتهية */}
        {effectiveAvailable === 0 && (
          <div className="stock-info-out">
            <span className="stock-out-icon" role="img" aria-label="out of stock">⏳</span>
            <span>{currentLang === 'ar' ? 'غير متوفر حالياً لهذه المواصفة' : 'Currently unavailable for this option'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOptions; 
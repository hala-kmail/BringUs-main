import React from 'react';

const ProductOptions = ({
  product,
  currentLang,
  t,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  getColorLabel
}) => (
  <>
    {/* Color Selection */}
    {product.colors && product.colors.length > 0 && (
      <div className="product-color-selection">
        <h3 className="selection-title">
          {t('product_detail.color')}: <span className="selected-option">{getColorLabel(selectedColor, t)}</span>
        </h3>
        <div className="color-options">
          {product.colors.map((color) => (
            <div
              key={color}
              className={`color-option ${selectedColor === color ? 'selected' : ''}`}
              style={
                color === "mixed"
                  ? { background: "linear-gradient(90deg, #eab308 0%, #ef4444 50%, #3b82f6 100%)" }
                  : { background: color, border: color === "#fff" ? "2px solid #e2e8f0" : undefined }
              }
              onClick={() => setSelectedColor(color)}
              title={getColorLabel(color, t)}
            />
          ))}
        </div>
      </div>
    )}
    {/* Size Selection */}
    {product.sizes && product.sizes.length > 0 && (
      <div className="product-size-selection">
        <h3 className="selection-title">
          {t('product_detail.size')}: <span className="selected-option">{selectedSize}</span>
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
                  +₪{size.priceModifier.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

export default ProductOptions; 
import React from 'react';
import { useTranslation } from 'react-i18next';
const ProductActions = ({
  quantity,
  incrementQuantity,
  decrementQuantity,
  addToCartLoading,
  handleAddToCart,
  isInWishlist,
  handleWishlistToggle,
  handleShare,
  handleWhatsAppOrder,
  key,
  product
}) => {
    
    const { t, i18n } = useTranslation();
    console.log('hala:', i18n.language);
    console.log(t('product_detail.order_whatsapp'));
 

    return (
  <div className="product-detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      
      <div className="product-actions-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
      <div className="product-quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '5px'}}>
        <button onClick={decrementQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={incrementQuantity}>+</button>
      </div>
      <button 
        className="add-to-cart-btn" 
        onClick={handleAddToCart}
        disabled={addToCartLoading}
        style={{ width: '100%' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="button-text">
          {addToCartLoading 
            ? t('product_detail.adding')
            : t('product_detail.add_to_cart')
          }
        </span>
      </button>
    </div>
    <div className="product-additional-actions" style={{ display: 'flex', gap: '10px', width: '100%' }}>
      <button 
        className={`product-action-btn ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
        onClick={handleWishlistToggle}
        style={{ width: '100%' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>{isInWishlist(product.id) ? t('product_detail.remove_from_wishlist') : t('product_detail.add_to_wishlist')}</span>
      </button>
     
      <button className="product-action-btn" onClick={handleShare} style={{ width: '100%' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span>{t('product_detail.share')}</span>
      </button>
      <button className="product-action-btn product-whatsapp-action" onClick={handleWhatsAppOrder} style={{ width: '100%' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
        <span>{t('product_detail.order_whatsapp')}</span> 
      </button>
    </div>
  </div>
)};

export default ProductActions; 
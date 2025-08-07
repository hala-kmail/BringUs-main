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
    return (
  <div className="product-detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      
      <div className="product-actions-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
      
      <button 
        className={`add-to-cart-btn ${product.stockStatus === 'out_of_stock' ? 'out-of-stock' : ''}`} 
        onClick={handleAddToCart}
        disabled={addToCartLoading || product.stockStatus === 'out_of_stock'}
        style={{ width: '100%' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className={`button-text `}>
          {addToCartLoading 
            ? t('product_detail.adding')
            : t('product_detail.add_to_cart')
          }
        </span>
      </button>
    </div>
    <div className="product-additional-actions" style={{ display: 'flex', gap: '10px', width: '100%' }}>
      <button 
        className={`wishlist-button ${isInWishlist(product._id) ? 'active' : ''}`}
        onClick={handleWishlistToggle}
        aria-label={t('product_detail.toggle_wishlist')}
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
      
    </div>
  </div>
)};

export default ProductActions; 
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  return (
    <div className="cart-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="cart-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
        <h1 className="page-title">{t('navbar.cart')}</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Empty Cart */}
      <div className="cart-content">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>سلة التسوق فارغة</h2>
          <p>أضف بعض المنتجات لتبدأ التسوق</p>
          <button 
            className="start-shopping-btn"
            onClick={() => navigate('/')}
          >
            ابدأ التسوق
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 
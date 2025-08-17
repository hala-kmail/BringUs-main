import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialComments } from '../../hooks/useSocialComments';
import FeaturedComments from './FeaturedComments';
import LoginModal from '../Auth/LoginModal';
import './SocialComments.css';

const SocialComments = () => {
  const { t } = useTranslation();
  const { comments, isLoading, error } = useSocialComments();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleSwitchToRegister = () => {
    // Close login modal and open register modal if needed
    setIsLoginModalOpen(false);
    // You can implement register modal opening here if needed
  };

  if (isLoading) {
    return (
      <section className="social-comments-section">
        <div className="container">
          <div className="section-header-title">
            <h2 className="section-title">{t('social_comments.title', 'آراء عملائنا')}</h2>
            <p className="section-subtitle">{t('social_comments.subtitle', 'ماذا يقول عملاؤنا عنا')}</p>
          </div>
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>{t('common.loading', 'جاري التحميل...')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('Authentication') || error.includes('login') || error.includes('Access denied');
    
    return (
      // <section className="social-comments-section">
      //   <div className="container">
      //     <div className="section-header-title">
      //       <h2 className="section-title">{t('social_comments.title', 'آراء عملائنا')}</h2>
      //       <p className="section-subtitle">{t('social_comments.subtitle', 'ماذا يقول عملاؤنا عنا')}</p>
      //     </div>
      //     <div className={`comments-error ${isAuthError ? 'auth-error' : ''}`}>
      //       <div className="auth-error-content">
      //         <p>{t('social_comments.auth_required', 'يرجى تسجيل الدخول لعرض التعليقات')}</p>
      //         <button 
      //           className="login-btn"
      //           onClick={handleLoginClick}
      //         >
      //           {t('common.login', 'تسجيل الدخول')}
      //         </button>
      //       </div>
      //     </div>
      //   </div>
        
      //   {/* Login Modal */}
      //   <LoginModal 
      //     isOpen={isLoginModalOpen}
      //     onClose={handleLoginModalClose}
      //     onSwitchToRegister={handleSwitchToRegister}
      //   />
      // </section>
      null
    );
  }

  // إذا لم تكن هناك تعليقات، لا تعرض القسم بالكامل
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <section className="social-comments-section">
      <div className="container">
        <div className="section-header-title">
          <h2 className="section-title">{t('social_comments.title', 'آراء عملائنا')}</h2>
          <p className="section-subtitle">{t('social_comments.subtitle', 'ماذا يقول عملاؤنا عنا')}</p>
        </div>
        
        <FeaturedComments comments={comments} />
      </div>
    </section>
  );
};

export default SocialComments; 
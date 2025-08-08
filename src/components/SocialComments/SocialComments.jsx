import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialComments } from '../../hooks/useSocialComments';
import FeaturedComments from './FeaturedComments';
import './SocialComments.css';

const SocialComments = () => {
  const { t } = useTranslation();
  const { comments, isLoading, error } = useSocialComments();

  if (isLoading) {
    return (
      <section className="social-comments-section">
        <div className="container">
          <div className="section-header">
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
    const isAuthError = error.includes('Authentication') || error.includes('login');
    
    return (
      <section className="social-comments-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('social_comments.title', 'آراء عملائنا')}</h2>
            <p className="section-subtitle">{t('social_comments.subtitle', 'ماذا يقول عملاؤنا عنا')}</p>
          </div>
          <div className={`comments-error ${isAuthError ? 'auth-error' : ''}`}>
            {isAuthError ? (
              <div className="auth-error-content">
                <p>{t('social_comments.auth_required', 'يرجى تسجيل الدخول لعرض التعليقات')}</p>
                <button 
                  className="login-btn"
                  onClick={() => window.location.href = '/login'}
                >
                  {t('common.login', 'تسجيل الدخول')}
                </button>
              </div>
            ) : (
              <p>{t('social_comments.error', 'عذراً، لا يمكن تحميل التعليقات في الوقت الحالي')}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <section className="social-comments-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('social_comments.title', 'آراء عملائنا')}</h2>
            <p className="section-subtitle">{t('social_comments.subtitle', 'ماذا يقول عملاؤنا عنا')}</p>
          </div>
          <div className="comments-empty">
            <p>{t('social_comments.no_comments', 'لا توجد تعليقات متاحة حالياً')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="social-comments-section">
      <div className="container">
       
        
        <FeaturedComments comments={comments} />
      </div>
    </section>
  );
};

export default SocialComments; 
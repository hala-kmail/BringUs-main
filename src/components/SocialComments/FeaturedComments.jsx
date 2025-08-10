import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaStar, FaQuoteLeft } from 'react-icons/fa';
import './FeaturedComments.css';

const FeaturedComments = ({ comments = [] }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // تحديد عدد التعليقات حسب حجم الشاشة
  const getCommentsPerPage = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 1 : 3;
    }
    return 3;
  };

  const [commentsPerPage, setCommentsPerPage] = useState(getCommentsPerPage());
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  // مراقبة تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      const newCommentsPerPage = getCommentsPerPage();
      setCommentsPerPage(newCommentsPerPage);
      setIsMobile(window.innerWidth <= 768);
      
      // إعادة تعيين الصفحة الحالية إذا تغير عدد التعليقات
      if (newCommentsPerPage !== commentsPerPage) {
        setCurrentPage(0);
      }
    };

    // تحديد الحجم الأولي
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [commentsPerPage]);

  useEffect(() => {
    if (totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentPage((prevPage) => 
          prevPage === totalPages - 1 ? 0 : prevPage + 1
        );
      }, 5000); // تغيير كل 5 ثواني

      return () => clearInterval(interval);
    }
  }, [totalPages]);

  // محاكاة التحميل
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (comments.length === 0) {
    return null;
  }

  const nextPage = () => {
    setCurrentPage((prevPage) => 
      prevPage === totalPages - 1 ? 0 : prevPage + 1
    );
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => 
      prevPage === 0 ? totalPages - 1 : prevPage - 1
    );
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // دالة للحصول على أيقونة المنصة
  const getPlatformIcon = (platform) => {
    const platformLower = platform?.toLowerCase();
    
    switch (platformLower) {
      case 'facebook':
        return <FaFacebookF />;
      case 'instagram':
        return <FaInstagram />;
      case 'tiktok':
        return <FaTiktok />;
      case 'twitter':
        return <FaTwitter />;
      case 'youtube':
        return <FaYoutube />;
      default:
        return <FaFacebookF />;
    }
  };

  // حساب التعليقات المراد عرضها في الصفحة الحالية
  const startIndex = currentPage * commentsPerPage;
  const endIndex = startIndex + commentsPerPage;
  const currentComments = comments.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="featured-comments">
        <div className="featured-header">
          <h3>{t('social_comments.featured_reviews', 'التعليقات المميزة')}</h3>
          <p>{t('social_comments.featured_subtitle', 'أفضل تقييمات عملائنا')}</p>
        </div>
        <div className={`loading-skeleton ${isMobile ? 'mobile-grid' : 'desktop-grid'}`}>
          {[...Array(commentsPerPage)].map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="featured-comments">
      <div className="featured-header">
        <h3>{t('social_comments.featured_reviews', 'التعليقات المميزة')}</h3>
        <p>{t('social_comments.featured_subtitle', 'أفضل تقييمات عملائنا')}</p>
      </div>
      
      <div className="carousel-container">
        <button 
          className="carousel-btn prev-btn" 
          onClick={prevPage}
          aria-label={t('common.previous', 'السابق')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="carousel-content">
          <div className={`comments-grid ${isMobile ? 'mobile-grid' : 'desktop-grid'}`}>
            {currentComments.map((comment, index) => (
              <div key={comment._id || index} className="featured-comment">
                <div className="comment-content">
                  <div className="comment-avatar">
                    {comment.user?.avatar ? (
                      <img src={comment.user.avatar} alt={comment.user.name || 'User'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="comment-details">
                    <div className="comment-header">
                      <div className="author-info">
                        <h4 className="author-name">{comment.user?.name || t('social_comments.anonymous', 'مستخدم')}</h4>
                        {comment.product?.name && (
                          <p className="author-title">{comment.product.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="comment-text-container">
                      <FaQuoteLeft className="quote-icon" />
                      <p className="comment-text">{comment.comment || comment.text || comment.content}</p>
                    </div>
                    
                    <div className="comment-footer">
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="star filled" />
                        ))}
                      </div>
                      {comment.platform && (
                        <div className="platform-badge">
                          <span className="platform-icon">
                            {getPlatformIcon(comment.platform)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="carousel-btn next-btn" 
          onClick={nextPage}
          aria-label={t('common.next', 'التالي')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {totalPages > 1 && (
        <div className="carousel-indicators">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedComments; 
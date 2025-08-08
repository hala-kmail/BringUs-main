import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';
import './FeaturedComments.css';

const FeaturedComments = ({ comments = [] }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  const commentsPerPage = 3;
  const totalPages = Math.ceil(comments.length / commentsPerPage);

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
          <div className="comments-grid">
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
                      <svg className="quote-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21C3 17.6863 5.68629 15 9 15C10.6569 15 12 13.6569 12 12C12 10.3431 10.6569 9 9 9C6.23858 9 4 11.2386 4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 21C12 17.6863 14.6863 15 18 15C19.6569 15 21 13.6569 21 12C21 10.3431 19.6569 9 18 9C15.2386 9 13 11.2386 13 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="comment-text">{comment.comment || comment.text || comment.content}</p>
                    </div>
                    
                    <div className="comment-footer">
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star filled">★</span>
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
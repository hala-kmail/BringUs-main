import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaQuoteLeft } from 'react-icons/fa';
import './FeaturedComments.css';

const FeaturedComments = ({ comments = [] }) => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = comments.length;
  const isRTL = i18n.language === 'ar';

  // التحريك التلقائي
  useEffect(() => {
    if (totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [totalPages]);

  // محاكاة التحميل
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const nextPage = () => setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  const prevPage = () => setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));

  const getPlatformIcon = (platform) => {
    const platformLower = platform?.toLowerCase();
    switch (platformLower) {
      case 'facebook': return <FaFacebookF />;
      case 'instagram': return <FaInstagram />;
      case 'tiktok': return <FaTiktok />;
      case 'twitter': return <FaTwitter />;
      case 'youtube': return <FaYoutube />;
      default: return <FaFacebookF />;
    }
  };

  if (comments.length === 0) return null;

  if (isLoading) {
    return (
      <div className="featured-comments">
        
        <div className="loading-skeleton single">
          <div className="skeleton-card">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="featured-comments">
     

      <div className="carousel-container">
        <button className="carousel-btn prev-btn" onClick={prevPage} aria-label={t('common.previous', 'السابق')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="carousel-viewport">
          <div 
            className="carousel-track"
            style={{
              transform: `translateX(${isRTL ? currentPage * 100 : -currentPage * 100}%)`,
            }}
          >
            {comments.map((comment, index) => (
              <div key={comment._id || index} className="carousel-slide">
                <div className="featured-comment">
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
                          <h4 className="author-name" title={comment.user?.name || t('social_comments.anonymous', 'مستخدم')}>
                           {comment.platform && (
                          <div className="platform-badge">
                            <span className="platform-icon">
                              {getPlatformIcon(comment.platform)}
                            </span>
                          </div>
                        )} {comment.user?.name || t('social_comments.anonymous', 'مستخدم')}
                          </h4>
                          {comment.product?.name && (
                            <p className="author-title" title={comment.product.name}>
                              {comment.product.name}
                            </p>
                          )}
                        </div>
                        
                      </div>

                      <div className="comment-text-container">
                        <FaQuoteLeft className="quote-icon" />
                        <p className="comment-text">{comment.comment || comment.text || comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-btn next-btn" onClick={nextPage} aria-label={t('common.next', 'التالي')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {totalPages > 1 && (
        <div className="carousel-indicators">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`indicator ${i === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedComments;

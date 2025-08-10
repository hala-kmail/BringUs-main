import React from 'react';

const ProductMediaGallery = ({
  mediaItems,
  selectedMediaIndex,
  setSelectedMediaIndex,
  isZoomModalOpen,
  setIsZoomModalOpen,
  productName,
  currentLang,
  t
}) => {

  const getCurrentMedia = () => {
    if (!mediaItems || mediaItems.length === 0) {
      return { type: 'image', url: '', thumbnail: '', title: '' };
    }
    return mediaItems[selectedMediaIndex] || mediaItems[0];
  };

  const handleZoomToggle = () => setIsZoomModalOpen(!isZoomModalOpen);

  return (
    <div className="product-image-gallery">
      <div className="product-main-image" style={{ position: 'relative' }}>
        {mediaItems.length > 1 && (
          <>
            <button
              className="zoom-modal-nav-btn-prev"
              onClick={() => setSelectedMediaIndex((selectedMediaIndex - 1 + mediaItems.length) % mediaItems.length)}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="zoom-modal-nav-btn-next"
              onClick={() => setSelectedMediaIndex((selectedMediaIndex + 1) % mediaItems.length)}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {getCurrentMedia().type === 'video' ? (
          <video 
            src={getCurrentMedia().url} 
            controls
            poster={getCurrentMedia().thumbnail}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            {t('product_detail.video_not_supported')}
          </video>
        ) : (
          <img 
            src={getCurrentMedia().url} 
            alt={productName} 
          />
        )}
        <button className="product-zoom-btn" onClick={handleZoomToggle}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>
      {getCurrentMedia().type === 'video' && getCurrentMedia().title && (
        <div className="media-title">
          <h4>{getCurrentMedia().title}</h4>
        </div>
      )}
      {/* {mediaItems.length > 1 && (
        <div className="product-thumbnail-images">
          {mediaItems.map((item, index) => (
            <div
              key={index}
              className={`thumbnail-container ${selectedMediaIndex === index ? 'thumbnail-active' : ''}`}
              onClick={() => setSelectedMediaIndex(index)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
              />
              {item.type === 'video' && (
                <div className="video-play-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default ProductMediaGallery; 
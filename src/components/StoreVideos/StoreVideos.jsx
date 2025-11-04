import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStoreSliders from '../../hooks/useStoreSliders';
import './StoreVideos.css';

const StoreVideos = () => {
  const { t, i18n } = useTranslation();
  const { sliders, loading } = useStoreSliders();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const currentLang = i18n.language;

  // Filter only active videos
  const videos = sliders && sliders.length > 0
    ? sliders.filter(slider => slider.isActive && slider.type === 'video')
    : [];

  // Sort by order if available
  const sortedVideos = videos.sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('video-modal-overlay')) {
      handleCloseModal();
    }
  };

  // Don't render if no videos
  if (loading || sortedVideos.length === 0) {
    return null;
  }

  return (
    <>
      <section className="store-videos">
        <div className="store-videos-container">
          {/* Section Header */}
          <div className="section-header">
            <div className="section-header-title">
              <h2 className="section-title">{t('store_videos.title', 'فيديوهات')}</h2>
              <p className="section-subtitle">{t('store_videos.subtitle', 'شاهد أحدث فيديوهاتنا')}</p>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="videos-grid">
            {sortedVideos.map((video) => (
              <div
                key={video._id || video.id}
                className="video-card"
                onClick={() => handleVideoClick(video)}
              >
                <div className="video-thumbnail">
                  <img
                    src={video.thumbnailUrl || video.imageUrl}
                    alt={video.title || 'Video thumbnail'}
                    loading="lazy"
                  />
                  <div className="video-play-button">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="32" cy="32" r="32" fill="rgba(0, 0, 0, 0.6)" />
                      <path
                        d="M26 20L26 44L42 32L26 20Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
                {video.title && (
                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    {video.description && (
                      <p className="video-description">{video.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="video-modal-overlay"
          onClick={handleModalClick}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCloseModal();
          }}
          tabIndex={0}
        >
          <div className="video-modal-content">
            <button
              className="video-modal-close"
              onClick={handleCloseModal}
              aria-label={currentLang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="video-embed-wrapper">
              {selectedVideo.videoEmbedUrl ? (
                <iframe
                  src={selectedVideo.videoEmbedUrl}
                  title={selectedVideo.title || 'Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-embed"
                ></iframe>
              ) : selectedVideo.videoUrl ? (
                <div className="video-fallback">
                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    {t('store_videos.open_video', 'افتح الفيديو')}
                  </a>
                </div>
              ) : null}
            </div>
            {selectedVideo.title && (
              <div className="video-modal-info">
                <h3 className="video-modal-title">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="video-modal-description">{selectedVideo.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoreVideos;


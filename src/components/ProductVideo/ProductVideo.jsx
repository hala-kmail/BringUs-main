import React, { useState } from 'react';
import UniversalVideoPlayer from '../UniversalVideoPlayer/UniversalVideoPlayer';
import './ProductVideo.css';

const ProductVideo = ({ videoUrl, productImage, productName }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  if (!videoUrl) {
    return null;
  }

  const handleVideoClick = () => {
    setShowVideoModal(true);
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  return (
    <>
      <div className="product-video-container" onClick={handleVideoClick}>
        <div className="video-thumbnail">
          <img 
            src={productImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUM3NSA2OC4zNzMgODEuMzczIDYyIDg4IDYySDIxMkMyMTguNjI3IDYyIDIyNSA2OC4zNzMgMjI1IDc1VjIyNUM2MjUgMjMxLjYyNyAyMTguNjI3IDIzOCAyMTIgMjM4SDg4QzgxLjM3MyAyMzggNzUgMjMxLjYyNyA3NSAyMjVWNzVaIiBmaWxsPSIjOUNBMEE2Ii8+CjxwYXRoIGQ9Ik0xMTIuNSAxMTIuNUMxMTIuNSAxMDUuODczIDExOC44NzMgMTAwIDEyNS41IDEwMEgxNzQuNUMxODEuMTI3IDEwMCAxODcuNSAxMDUuODczIDE4Ny41IDExMi41VjE4Ny41QzE4Ny41IDE5NC4xMjcgMTgxLjEyNyAyMDAgMTc0LjUgMjAwSDEyNS41QzExOC44NzMgMjAwIDExMi41IDE5NC4xMjcgMTEyLjUgMTg3LjVWMTEyLjVaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='} 
            alt={productName || 'Product Video'}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUM3NSA2OC4zNzMgODEuMzczIDYyIDg4IDYySDIxMkMyMTguNjI3IDYyIDIyNSA2OC4zNzMgMjI1IDc1VjIyNUM2MjUgMjMxLjYyNyAyMTguNjI3IDIzOCAyMTIgMjM4SDg4QzgxLjM3MyAyMzggNzUgMjMxLjYyNyA3NSAyMjVWNzVaIiBmaWxsPSIjOUNBMEE2Ii8+CjxwYXRoIGQ9Ik0xMTIuNSAxMTIuNUMxMTIuNSAxMDUuODczIDExOC44NzMgMTAwIDEyNS41IDEwMEgxNzQuNUMxODEuMTI3IDEwMCAxODcuNSAxMDUuODczIDE4Ny41IDExMi41VjE4Ny41QzE4Ny41IDE5NC4xMjcgMTgxLjEyNyAyMDAgMTc0LjUgMjAwSDEyNS41QzExOC44NzMgMjAwIDExMi41IDE5NC4xMjcgMTEyLjUgMTg3LjVWMTEyLjVaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=';
            }}
          />
          <div className="video-play-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div className="video-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
            فيديو
          </div>
        </div>
      </div>

      {showVideoModal && (
        <UniversalVideoPlayer 
          videoUrl={videoUrl} 
          showInModal={true} 
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ProductVideo;

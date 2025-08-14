import React, { useEffect, useState } from 'react';
import './UniversalVideoPlayer.css';

const UniversalVideoPlayer = ({ videoUrl, showInModal = false, onClose }) => {
  const getVideoPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('facebook.com')) {
      return 'facebook';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('tiktok.com')) {
      return 'tiktok';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    return 'unknown';
  };

  const getVideoId = (url, platform) => {
    switch (platform) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return youtubeMatch ? youtubeMatch[1] : null;
      
      case 'instagram':
        const instagramMatch = url.match(/instagram\.com\/p\/([^\/]+)/);
        return instagramMatch ? instagramMatch[1] : null;
      
      case 'facebook':
        const facebookMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
        return facebookMatch ? facebookMatch[1] : null;
      
      case 'tiktok':
        const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
        return tiktokMatch ? tiktokMatch[1] : null;
      
      default:
        return null;
    }
  };

  const platform = getVideoPlatform(videoUrl);
  const videoId = getVideoId(videoUrl, platform);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // تحميل TikTok embed script إذا كان الفيديو من TikTok
    if (platform === 'tiktok' && videoId) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [platform, videoId]);

  const renderVideo = () => {
    switch (platform) {
      case 'youtube':
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );

      case 'facebook':
        return (
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=560&height=315`}
            width="100%"
            height="315"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        );

      case 'instagram':
        return (
          <iframe
            src={`https://www.instagram.com/p/${videoId}/embed/`}
            width="400"
            height="480"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
          ></iframe>
        );

      case 'tiktok':
        return (
          <blockquote
            className="tiktok-embed"
            cite={videoUrl}
            data-video-id={videoId}
            style={{ maxWidth: '325px', minWidth: '325px' }}
          >
            <section></section>
          </blockquote>
        );

      case 'twitter':
        return (
          <iframe
            src={`https://platform.twitter.com/widgets/tweet.html?id=${videoId}`}
            width="550"
            height="420"
            frameBorder="0"
            scrolling="no"
          ></iframe>
        );

      default:
        return <div>منصة الفيديو غير مدعومة</div>;
    }
  };

  if (!videoId) {
    return <div>رابط الفيديو غير صحيح</div>;
  }

  if (showInModal) {
    return (
      <div className="video-modal" onClick={onClose}>
        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="video-modal-close" onClick={onClose}>
            ×
          </button>
          <div className="video-container">
            {renderVideo()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-container">
      {renderVideo()}
    </div>
  );
};

export default UniversalVideoPlayer;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useStoreSliders from '../../hooks/useStoreSliders';
import './Carousel.css';

const Carousel = () => {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { sliders, loading, error } = useStoreSliders();

  // Use API sliders if available, otherwise use fallback
  // Filter only active sliders and exclude videos
  const slides = sliders && sliders.length > 0 
    ? sliders.filter(slide => slide.isActive && slide.type !== 'video')
    : [];

  // Helper function to get slide data in the correct format
  const getSlideData = (slide) => {
    // If it's API data, map it to the expected format
    if (slide.imageUrl || slide.thumbnailUrl) {
      return {
        id: slide._id || slide.id,
        image: slide.imageUrl || slide.thumbnailUrl,
        // title: slide.title || '',
        // description: slide.description || '',
        link: slide.link || slide.url || '#'
      };
    }
    // If it's already in the correct format (fallback slides)
    return slide;
  };
//-----------------------------------move--------------------------------------  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
//-----------------------------------auto play--------------------------------------  
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying]);
//-----------------------------------auto play--------------------------------------  
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };
//-----------------------------------current lang--------------------------------------  
  const currentLang = i18n.language;
//-----------------------------------return--------------------------------------  
  // Show loading state
  if (loading) {
    return (
      <div className="carousel-container">
        <div className="carousel-loading">
          <div className="loading-spinner"></div>
          <p>{currentLang === 'ar' ? 'جاري تحميل السلايدر...' : 'Loading slider...'}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Carousel error:', error);
  }

  // Show message if no slides available
  if (!loading && slides.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-loading">
          <p>{currentLang === 'ar' ? 'لا توجد سلايدر متاحة حالياً' : 'No sliders available at the moment'}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="carousel-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-wrapper">
        <div 
          className="carousel-slides"
          style={{ 
            transform: currentLang === 'ar' 
              ? `translateX(${currentSlide * 100}%)` 
              : `translateX(-${currentSlide * 100}%)` 
          }}
        >
          {slides.map((slide) => {
            const slideData = getSlideData(slide);
            return (
              <div key={slideData.id} className="carousel-slide">
                {/* Image slide only */}
                <a href={slideData.link} className="slide-image">
                  <img src={slideData.image} alt={slideData.title} />
                  <div className="slide-overlay"></div>
                </a>
                <div className="slide-content">
                  {/* <h2 className="slide-title">{slideData.title}</h2> */}
                  {/* <p className="slide-subtitle">{slideData.description}</p> */}
                </div>
              </div>
            );
          })}
        </div>
{/*---------------------------Navigation Arrows-----------------------------------*/}
        <button 
          className="carousel-arrow carousel-arrow-prev" 
          onClick={currentLang === 'ar' ? nextSlide : prevSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="carousel-arrow carousel-arrow-next" 
          onClick={currentLang === 'ar' ? prevSlide : nextSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
{/* //-----------------------------------dots indicator--------------------------------------   */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Carousel.css';

const Carousel = () => {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample carousel images - replace with your actual images
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      title: {
        en: 'Fresh Groceries Delivered',
        ar: 'توصيل البقالة الطازجة'
      },
      subtitle: {
        en: 'Get the freshest products delivered to your doorstep',
        ar: 'احصل على أطازج المنتجات موصلة إلى باب منزلك'
      },
      buttonText: {
        en: 'Shop Now',
        ar: 'تسوق الآن'
      }
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: {
        en: 'Organic Fruits & Vegetables',
        ar: 'فواكه وخضروات عضوية'
      },
      subtitle: {
        en: 'Premium quality organic produce for healthy living',
        ar: 'منتجات عضوية عالية الجودة للحياة الصحية'
      },
      buttonText: {
        en: 'Explore',
        ar: 'استكشف'
      }
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: {
        en: 'Special Offers & Discounts',
        ar: 'عروض خاصة وخصومات'
      },
      subtitle: {
        en: 'Save up to 40% on your favorite products',
        ar: 'وفر حتى 40% على منتجاتك المفضلة'
      },
      buttonText: {
        en: 'View Offers',
        ar: 'عرض العروض'
      }
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80',
      title: {
        en: 'Fast & Reliable Delivery',
        ar: 'توصيل سريع وموثوق'
      },
      subtitle: {
        en: 'Same day delivery available from 7:00 to 23:00',
        ar: 'توصيل في نفس اليوم متاح من 7:00 إلى 23:00'
      },
      buttonText: {
        en: 'Order Now',
        ar: 'اطلب الآن'
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying]);

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const currentLang = i18n.language;

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
            transform: i18n.language === 'ar' 
              ? `translateX(${currentSlide * 100}%)` 
              : `translateX(-${currentSlide * 100}%)` 
          }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="carousel-slide">
              <div className="slide-image">
                <img src={slide.image} alt={slide.title[currentLang]} />
                <div className="slide-overlay"></div>
              </div>
              <div className="slide-content">
                <h2 className="slide-title">{slide.title[currentLang]}</h2>
                <p className="slide-subtitle">{slide.subtitle[currentLang]}</p>
                <button className="slide-button">
                  {slide.buttonText[currentLang]}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
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

        {/* Dots Indicator */}
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
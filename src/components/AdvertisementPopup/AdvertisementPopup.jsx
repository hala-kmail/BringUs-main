import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import './AdvertisementPopup.css';

const AdvertisementPopup = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { store } = useAppData();
  const [advertisements, setAdvertisements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Check if we're on an auth page
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Get storeId from store object
  const storeId = store?._id;

  // Show advertisement immediately when loaded
  useEffect(() => {
    if (advertisements.length > 0 && !isVisible && !hasBeenClosed && !hasBeenShown) {
        // console.log('Setting advertisement visible immediately');
      setIsVisible(true);
      setHasBeenShown(true);
    }
  }, [advertisements, isVisible, hasBeenClosed, hasBeenShown]);

  // Auto-close advertisement after 10 seconds
  useEffect(() => {
    if (isVisible && advertisements.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, advertisements]);


  // Clear localStorage when user logs out (disabled - don't show on logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' && !e.newValue) {
        // User logged out - don't clear advertisement history to prevent showing again
        // localStorage.removeItem('shownAdvertisements');
        // console.log('User logged out, keeping advertisement history');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Clear localStorage when user logs out (same tab) - disabled
  useEffect(() => {
    let lastAuthStatus = null;
    
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const currentAuthStatus = !!token;
      
      // Only log and clear if auth status actually changed
      if (lastAuthStatus !== null && lastAuthStatus !== currentAuthStatus) {
        if (!currentAuthStatus) {
          // User logged out - don't clear advertisement history to prevent showing again
          // localStorage.removeItem('shownAdvertisements');
          // console.log('User logged out, keeping advertisement history');
        }
      }
      
      lastAuthStatus = currentAuthStatus;
    };

    // Check on mount
    checkAuthStatus();

    // Check every 30 seconds instead of 10 to reduce frequency
    const interval = setInterval(checkAuthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Reset states when store changes
  useEffect(() => {
    if (storeId) {
      // Reset states for new store
      setHasBeenShown(false);
      setHasBeenClosed(false);
      setIsVisible(false);
    }
  }, [storeId]);

  // Reset states when user logs in (disabled - don't show again)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // User is logged in - don't reset advertisement states to prevent showing again
      // setHasBeenShown(false);
      // setHasBeenClosed(false);
      // setIsVisible(false);
    }
  }, []);

  // Check if advertisement was already shown for this user
  const checkIfAlreadyShown = (advertisementId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return false; // No user, can show advertisement
    
    try {
      const userId = JSON.parse(userInfo)._id;
      const shownAds = JSON.parse(localStorage.getItem(`shownAdvertisements_${userId}`) || '[]');
      return shownAds.includes(advertisementId);
    } catch (err) {
      console.warn('Error checking advertisement history:', err);
      return false;
    }
  };

  // Mark advertisement as shown for this user
  const markAsShown = (advertisementId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return; // No user, don't mark as shown
    
    try {
      const userId = JSON.parse(userInfo)._id;
      const shownAds = JSON.parse(localStorage.getItem(`shownAdvertisements_${userId}`) || '[]');
      if (!shownAds.includes(advertisementId)) {
        shownAds.push(advertisementId);
        localStorage.setItem(`shownAdvertisements_${userId}`, JSON.stringify(shownAds));
      }
    } catch (err) {
      console.warn('Error marking advertisement as shown:', err);
    }
  };

  useEffect(() => {
    if (storeId) {
      // console.log('Fetching advertisements for storeId:', storeId);
      fetchAdvertisements();
    }
  }, [storeId]);

 

  const fetchAdvertisements = async () => {
    try {
      setError(null);
      
      // Check if user is logged in
      const userInfo = localStorage.getItem('userInfo');
      console.log('AdvertisementPopup - User info:', userInfo ? 'Found' : 'Not found');
      
      if (!userInfo) {
        console.log('No user logged in, not fetching advertisements');
        return;
      }
      
      // Get auth token if available
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5001/api/advertisements/stores/${storeId}/advertisements/active`, {
        method: 'GET',
        headers,
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get the response text to see what we're getting
        const responseText = await response.text();
        // console.error('Response text:', responseText);
        
        setError(t('advertisement.no_json_response'));
        setAdvertisements([]);
        return;
      }
      
      if (!response.ok) {
        setError(t('advertisement.api_failed'));
        setAdvertisements([]);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert single advertisement to array for consistency
        const adsArray = Array.isArray(result.data) ? result.data : [result.data];
        // console.log('Advertisements found:', adsArray.length);
        
        // Check if this advertisement was already shown
        const advertisementId = adsArray[0]._id;
        const hasBeenShown = checkIfAlreadyShown(advertisementId);
        // console.log('Advertisement ID:', advertisementId);
        // console.log('Has been shown:', hasBeenShown);
        
        if (!hasBeenShown) {
          console.log('Setting advertisement as visible');
          setAdvertisements(adsArray);
          // Set visible immediately
          setIsVisible(true);
          setHasBeenShown(true);
          markAsShown(advertisementId);
        } else {
          console.log('Advertisement already shown, not displaying');
          setAdvertisements([]);
        }
      } else {
        // console.log('No advertisements found in response');
        setAdvertisements([]);
      }
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError(t('advertisement.error'));
      setAdvertisements([]);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
  };

 

 

  // Check if user is logged in
  const userInfo = localStorage.getItem('userInfo');
  
  if (!storeId || isAuthPage || !userInfo) {
    return null;
  }

  if (error) {
    return (
      <div className="advertisement-popup-overlay">
        <div className="advertisement-popup">
          <button className="advertisement-popup-close" onClick={() => setIsVisible(false)} aria-label={t('advertisement.close')}>
            ×
          </button>
          <div className="advertisement-error">
            {error}
            <button 
              className="advertisement-retry-btn" 
              onClick={() => {
                setError(null);
                fetchAdvertisements();
              }}
            >
              {t('advertisement.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if no advertisements, not visible, or has been closed
  if (advertisements.length === 0 || !isVisible || hasBeenClosed) {
    return null;
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className="advertisement-popup-overlay">
      <div className="advertisement-popup">
        <button className="advertisement-popup-close" onClick={handleClose} aria-label={t('advertisement.close')}>
          ×
        </button>
        
        <div className="advertisement-popup-content">
          {currentAd.backgroundImageUrl ? (
            <div 
              className="advertisement-image-container"
              onClick={() => handleAdClick(currentAd)}
            >
              <img 
                src={currentAd.backgroundImageUrl} 
                alt={currentAd.title || 'Advertisement'}
                className="advertisement-image"
                loading="lazy"
              />
              {currentAd.title && (
                <div className="advertisement-title">
                  {currentAd.title}
                </div>
              )}
            </div>
          ) : currentAd.htmlContent ? (
            <div 
              className="advertisement-html-content"
              onClick={() => handleAdClick(currentAd)}
            >
              {currentAd.title && (
                <h2 className="advertisement-html-title">{currentAd.title}</h2>
              )}
              <div dangerouslySetInnerHTML={{ __html: currentAd.htmlContent }} />
            </div>
          ) : (
            <div className="advertisement-text">
              {currentAd.title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPopup; 
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5001/api';

export const useAffiliateInfo = (affiliateCode, storeId) => {
  const [affiliateInfo, setAffiliateInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAffiliateInfo = async () => {
      if (!affiliateCode || !storeId) {
        setAffiliateInfo(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching affiliate info for code:', affiliateCode, 'storeId:', storeId);
        
        if (!storeId) {
          throw new Error('Store ID is required for affiliate lookup');
        }
        
        const response = await fetch(`${API_BASE_URL}/affiliations/code/${affiliateCode}?storeId=${storeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Affiliate info fetched successfully:', data);
        console.log('Affiliate data structure:', data.data);
        console.log('Available fields:', Object.keys(data.data || {}));
        
        // Validate response structure
        if (data.success && data.data) {
          setAffiliateInfo(data.data);
        } else {
          throw new Error(data.message || 'Invalid affiliate response structure');
        }
        
        // Store affiliate info in localStorage for persistence
        try {
          localStorage.setItem('affiliateInfo', JSON.stringify(data.data));
          console.log('Affiliate info stored in localStorage');
        } catch (err) {
          console.warn('Could not store affiliate info in localStorage:', err);
        }
        
      } catch (err) {
        console.error('Error fetching affiliate info:', err);
        setError(err.message);
        
        // Try to get cached affiliate info from localStorage
        try {
          const cachedInfo = localStorage.getItem('affiliateInfo');
          if (cachedInfo) {
            const parsedInfo = JSON.parse(cachedInfo);
            console.log('Using cached affiliate info from localStorage');
            setAffiliateInfo(parsedInfo);
          }
        } catch (cacheErr) {
          console.warn('Could not read cached affiliate info:', cacheErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateInfo();
  }, [affiliateCode, storeId]);

  return {
    affiliateInfo,
    loading,
    error
  };
}; 
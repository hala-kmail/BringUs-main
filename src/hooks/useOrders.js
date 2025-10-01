import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, user } = useAppData();
  const hasInitialized = useRef(false);
  const storeId = useRef(null);
  
  const getStoreId = useCallback(() => {
    
    if (store && store._id) {
      return store._id;
    }
    
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        const parsedStore = JSON.parse(storedStore);
       
        return parsedStore._id;
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    
    return null;
  }, [store]);
  
  useEffect(() => {
    const currentStoreId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (currentStoreId && (!hasInitialized.current || storeId.current !== currentStoreId)) {
      if (process.env.NODE_ENV === 'development') {
        
      }
      hasInitialized.current = true;
    }
  }, [store?._id, getStoreId]);

  // Create new order (handles both authenticated and guest users)
  const createOrder = useCallback(async (orderData) => {
    console.log('createOrder called - user:', user);
    console.log('createOrder called - orderData:', orderData);
    
    try {
      setLoading(true);
      setError(null);

      const storeId = getStoreId();
      console.log('createOrder - storeId:', storeId);
      if (!storeId) {
        throw new Error('Store ID is required');
      }

              // Get affiliate info from localStorage if available
        const storedAffiliateCode = localStorage.getItem('affiliateCode');
        const storedAffiliateInfo = localStorage.getItem('affiliateInfo');
        console.log('createOrder - affiliateCode:', storedAffiliateCode);
        console.log('createOrder - affiliateInfo:', storedAffiliateInfo);
        console.log('createOrder - localStorage affiliateCode:', localStorage.getItem('affiliateCode'));
        console.log('createOrder - localStorage affiliateInfo:', localStorage.getItem('affiliateInfo'));
        
        let affiliateId = null;
        if (storedAffiliateInfo) {
          try {
            const affiliateInfo = JSON.parse(storedAffiliateInfo);
            // Try userId first, then fallback to id
            affiliateId = affiliateInfo.userId || affiliateInfo.id;
            console.log('createOrder - affiliateInfo:', affiliateInfo);
            console.log('createOrder - affiliateId from info:', affiliateId);
            
            // Validate that we have a valid affiliate ID
            if (!affiliateId) {
              console.warn('Affiliate info found but no valid ID or userId');
            }
          } catch (err) {
            console.warn('Could not parse affiliate info:', err);
          }
        }

      // Determine if this is a guest order
      const isGuestOrder = !user || !user._id;

      let endpoint;
      let requestData;

      if (isGuestOrder) {
        // Guest order endpoint
        endpoint = `${API_BASE_URL}/orders/store/${storeId}`;
        
        // Get guest ID from localStorage or generate one
        let guestId = localStorage.getItem('guestId');
        if (!guestId) {
          guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('guestId', guestId);
        }
        
                        requestData = {
                  ...orderData,
                  guestId: guestId,
                  // Add affiliate ID if available
                  ...(affiliateId && { affiliate: affiliateId }),
                  // Ensure shippingAddress has the required fields for guest orders
                  shippingAddress: {
                    firstName: orderData.shippingAddress?.fullName?.split(' ')[0] || orderData.shippingAddress?.firstName || '',
                    lastName: orderData.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || orderData.shippingAddress?.lastName || '',
                    email: orderData.shippingAddress?.email || 'guest@example.com', // You might want to collect email in the form
                    phone: orderData.shippingAddress?.phone || '',
                    street: orderData.shippingAddress?.street || '',
                    city: orderData.shippingAddress?.city || '',
                    district: orderData.shippingAddress?.district || '',
                    country: orderData.shippingAddress?.country || 'Palestine',
                    zipCode: orderData.shippingAddress?.zipCode || ''
                  }
                };
        
        console.log('createOrder - Guest order data:', requestData);
      } 
      else {
        // Authenticated user order endpoint
        endpoint = `${API_BASE_URL}/orders/store/${storeId}`;
        requestData = {
          ...orderData,
          // Add affiliate ID if available
          ...(affiliateId && { affiliate: affiliateId })
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to create order');
      }

      console.log('Order created successfully:', data);
      
      // Clear affiliate data after successful order creation
      const affiliateCodeToClear = localStorage.getItem('affiliateCode');
      const affiliateInfoToClear = localStorage.getItem('affiliateInfo');
      if (affiliateCodeToClear) {
        console.log('Clearing affiliate code after successful order:', affiliateCodeToClear);
        localStorage.removeItem('affiliateCode');
      }
      if (affiliateInfoToClear) {
        console.log('Clearing affiliate info after successful order');
        localStorage.removeItem('affiliateInfo');
      }
      
      return data.data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, user]);

  // Create guest order specifically
  const createGuestOrder = useCallback(async (orderData) => {
    console.log('createGuestOrder called with:', orderData);
    
    try {
      setLoading(true);
      setError(null);

      const storeId = getStoreId();
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      // Get guest ID from localStorage or generate one
      let guestId = localStorage.getItem('guestId');
      if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestId', guestId);
      }

      // Get affiliate info from localStorage if available
      const guestStoredAffiliateCode = localStorage.getItem('affiliateCode');
      const guestStoredAffiliateInfo = localStorage.getItem('affiliateInfo');
      console.log('createGuestOrder - affiliateCode:', guestStoredAffiliateCode);
      console.log('createGuestOrder - affiliateInfo:', guestStoredAffiliateInfo);
      
      let guestAffiliateId = null;
      if (guestStoredAffiliateInfo) {
        try {
          const affiliateInfo = JSON.parse(guestStoredAffiliateInfo);
          // Try userId first, then fallback to id
          guestAffiliateId = affiliateInfo.userId || affiliateInfo.id;
          console.log('createGuestOrder - affiliateInfo:', affiliateInfo);
          console.log('createGuestOrder - affiliateId from info:', guestAffiliateId);
          
          // Validate that we have a valid affiliate ID
          if (!guestAffiliateId) {
            console.warn('Guest affiliate info found but no valid ID or userId');
          }
        } catch (err) {
          console.warn('Could not parse affiliate info:', err);
        }
      }

      const requestData = {
        ...orderData,
        guestId: guestId,
        // Add affiliate ID if available
        ...(guestAffiliateId && { affiliate: guestAffiliateId })
      };


      const response = await fetch(`${API_BASE_URL}/orders/store/${storeId}/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to create guest order');
      }

      console.log('Guest order created successfully:', data);
      
      // Clear affiliate data after successful guest order creation
      const guestAffiliateCode = localStorage.getItem('affiliateCode');
      const guestAffiliateInfo = localStorage.getItem('affiliateInfo');
      if (guestAffiliateCode) {
        localStorage.removeItem('affiliateCode');
      }
      if (guestAffiliateInfo) {
        localStorage.removeItem('affiliateInfo');
      }
      
      return data.data;
    } catch (err) {
      console.error('Error creating guest order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStoreId]);

  // Get user orders
  const getUserOrders = useCallback(async (page = 1, limit = 5, status = null) => {
    try {
      setLoading(true);
      setError(null);

      const storeId = getStoreId();
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      let url = `${API_BASE_URL}/orders/store/${storeId}?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStoreId]);

  // Get single order
  const getOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const storeId = getStoreId();
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/store/${storeId}/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      return data.data;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStoreId]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setLoading(true);
      setError(null);

      const storeId = getStoreId();
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/store/${storeId}/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to cancel order');
      }

      return data;
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStoreId]);

  return {
    loading,
    error,
    createOrder,
    createGuestOrder,
    getUserOrders,
    getOrder,
    cancelOrder
  };
};

export default useOrders; 
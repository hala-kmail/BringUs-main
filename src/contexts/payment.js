// Get current domain dynamically
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5175';
};

// Get backend API base URL
const getBackendBaseUrl = () => {
  // Use environment variable or fallback to production
  return import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api';
};

// Get callback URL for payment processing
export const getCallbackUrl = () => {
  const storeSlug = localStorage.getItem('storeSlug');
  return `${getCurrentDomain()}/${storeSlug}/checkout`;
};

// Get store ID from localStorage
const getStoreId = () => {
  try {
    const storeData = localStorage.getItem('storeData');
    if (storeData) {
      const parsed = JSON.parse(storeData);
      return parsed._id;
    }
  } catch (error) {
    console.error('Error getting store ID:', error);
  }
  return null;
};

export const PAYMENT_API_CONFIG = {
  // Now using backend proxy for security - NO MORE EXPOSED TOKENS!
  BACKEND_URL: getBackendBaseUrl(),
  CALLBACK_URL: getCallbackUrl(),
  ENDPOINTS: {
    INITIALIZE: (storeId) => `/customer-payment/${storeId || getStoreId()}/initialize`,
    VERIFY: (storeId, reference) => `/customer-payment/${storeId || getStoreId()}/verify/${reference}`,
    STATUS: (storeId, reference) => `/customer-payment/${storeId || getStoreId()}/status/${reference}`
  }
};
  
  // Currency conversion rates (to smallest unit)
  export const CURRENCY_CONVERSION = {
    ILS: 100, // 1 ILS = 100 aghora
    JOD: 100, // 1 JOD = 100 qirsh
    USD: 100  // 1 USD = 100 cents
  };
  
  // Supported currencies
  export const SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ' }
  ];
  
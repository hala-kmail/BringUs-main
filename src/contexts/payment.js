
// Payment API Constants
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
// const storeData=JSON.parse(localStorage.getItem('storeData')).settings;
// const lahzaToken=storeData.lahzaToken;
const storeSlug=localStorage.getItem('storeSlug');

// Get current domain dynamically
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5175';
};

// Get callback URL for payment processing
export const getCallbackUrl = () => {
  const storeSlug = localStorage.getItem('storeSlug');
  return `${getCurrentDomain()}/${storeSlug}/checkout`;
};

export const PAYMENT_API_CONFIG = {
  
    BASE_URL: 'https://api.lahza.io/transaction',
    // SECRET_KEY: lahzaToken,
    CALLBACK_URL: `${getCurrentDomain()}/${storeSlug}/checkout`,
    ENDPOINTS: {
      CHARGES: '/initialize',
      VERIFY: '/verify'
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
  
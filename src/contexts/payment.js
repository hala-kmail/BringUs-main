
// Payment API Constants
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
const storeData = JSON.parse(localStorage.getItem('storeData') || '{}');
const lahzaToken = storeData?.settings?.lahzaToken || '';

// دالة للحصول على storeSlug ديناميكياً
const getStoreSlug = () => {
  try {
    return localStorage.getItem('storeSlug') || '';
  } catch (error) {
    console.warn('Could not get storeSlug from localStorage:', error);
    return '';
  }
};

// دالة للحصول على CALLBACK_URL ديناميكياً
export const getCallbackUrl = () => {
  const storeSlug = getStoreSlug();
  const callbackUrl = `http://localhost:5173/${storeSlug}/checkout`;
 
  return callbackUrl;
};

export const PAYMENT_API_CONFIG = {
  BASE_URL: 'https://api.lahza.io/transaction',
  SECRET_KEY: lahzaToken,
  CALLBACK_URL: getCallbackUrl(),
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
  

export const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'EGP': 'ج.م',
    'JOD': 'د.أ',
    'KWD': 'د.ك',
    'QAR': 'ر.ق',
    'BHD': 'د.ب',
    'OMR': 'ر.ع',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': '$',
    'RUB': '₽',
    'TRY': '₺',
    'ZAR': 'R',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RON': 'lei',
    'BGN': 'лв',
    'HRK': 'kn',
    'RSD': 'дин',
    'UAH': '₴',
    'BYN': 'Br',
    'KZT': '₸',
    'GEL': '₾',
    'AMD': '֏',
    'AZN': '₼',
    'MDL': 'L',
    'TJS': 'ЅМ',
    'TMT': 'T',
    'KGS': 'с',
    'MNT': '₮',
    'VND': '₫',
    'THB': '฿',
    'MYR': 'RM',
    'SGD': 'S$',
    'IDR': 'Rp',
    'PHP': '₱',
    'PKR': '₨',
    'BDT': '৳',
    'LKR': 'Rs',
    'NPR': '₨',
    'MMK': 'K',
    'KHR': '៛',
    'LAK': '₭',
    'MOP': 'MOP$',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'KRW': '₩',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'ARS': '$',
    'UYU': '$U',
    'PYG': '₲',
    'BOB': 'Bs',
    'GTQ': 'Q',
    'HNL': 'L',
    'NIO': 'C$',
    'CRC': '₡',
    'PAB': 'B/.',
    'DOP': 'RD$',
    'JMD': 'J$',
    'TTD': 'TT$',
    'BBD': '$',
    'XCD': '$',
    'ANG': 'ƒ',
    'AWG': 'ƒ',
    'GYD': '$',
    'SRD': '$',
    'BZD': '$',
    'BMD': '$',
    'FJD': '$',
    'NZD': '$',
    'SBD': '$',
    'VUV': 'Vt',
    'WST': 'T',
    'TOP': 'T$',
    'PGK': 'K',
    'KID': '$',
    'VND': '₫',
    'LAK': '₭',
    'KHR': '៛',
    'MMK': 'K',
    'NPR': '₨',
    'BDT': '৳',
    'LKR': 'Rs',
    'PKR': '₨',
    'PHP': '₱',
    'IDR': 'Rp',
    'SGD': 'S$',
    'MYR': 'RM',
    'THB': '฿',
    'MNT': '₮',
    'KGS': 'с',
    'TMT': 'T',
    'TJS': 'ЅМ',
    'MDL': 'L',
    'AZN': '₼',
    'AMD': '֏',
    'GEL': '₾',
    'KZT': '₸',
    'BYN': 'Br',
    'UAH': '₴',
    'RSD': 'дин',
    'HRK': 'kn',
    'BGN': 'лв',
    'RON': 'lei',
    'HUF': 'Ft',
    'CZK': 'Kč',
    'PLN': 'zł',
    'DKK': 'kr',
    'NOK': 'kr',
    'SEK': 'kr',
    'ZAR': 'R',
    'TRY': '₺',
    'RUB': '₽',
    'MXN': '$',
    'BRL': 'R$',
    'INR': '₹',
    'CNY': '¥',
    'JPY': '¥',
    'CHF': 'CHF',
    'AUD': 'A$',
    'CAD': 'C$',
    'GBP': '£'
  };
  
  return currencySymbols[currency] || currency;
};

/**
 * تنسيق السعر مع رمز العملة
 * @param {number} price - السعر
 * @param {string} language - اللغة ('ar' أو 'en')
 * @param {string} currency - رمز العملة (اختياري)
 * @param {number} decimals - عدد الكسور العشرية (افتراضي: 2)
 * @returns {string} السعر المنسق مع رمز العملة
 */
export const formatPrice = (price, language = 'ar', currency = 'ILS', decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0';
  }

  const symbol = getCurrencySymbol(currency);
  const formattedPrice = Number(price).toFixed(decimals);
  
  // للعملات العربية، نضع الرمز بعد الرقم
  const arabicCurrencies = ['SAR', 'AED', 'EGP', 'JOD', 'KWD', 'QAR', 'BHD', 'OMR', 'ILS'];
  
  if (arabicCurrencies.includes(currency) || language === 'ar') {
    return `${formattedPrice} ${symbol}`;
  }
  
  // للعملات الأخرى، نضع الرمز قبل الرقم
  return `${symbol}${formattedPrice}`;
};

/**
 * الحصول على رمز العملة مع التنسيق المناسب للموقع
 * @param {string} currency - رمز العملة
 * @param {string} position - موضع الرمز ('before' أو 'after')
 * @returns {string} رمز العملة
 */
export const getFormattedCurrencySymbol = (currency, position = 'before') => {
  const symbol = getCurrencySymbol(currency);
  
  // للعملات العربية، نضع الرمز بعد الرقم
  const arabicCurrencies = ['SAR', 'AED', 'EGP', 'JOD', 'KWD', 'QAR', 'BHD', 'OMR', 'ILS'];
  
  if (arabicCurrencies.includes(currency)) {
    return position === 'after' ? ` ${symbol}` : symbol;
  }
  
  // للعملات الأخرى، نضع الرمز قبل الرقم
  return position === 'before' ? symbol : symbol;
};

export default {
  getCurrencySymbol,
  formatPrice,
  getFormattedCurrencySymbol
}; 
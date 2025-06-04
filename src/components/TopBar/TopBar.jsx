import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  const { t, i18n } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: '₪', symbol: '₪', name: 'Saudi Riyal' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ];

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsCurrencyDropdownOpen(false);
  };

  const currentCurrency = currencies.find(curr => curr.code === selectedCurrency) || currencies[0];

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        {/* Delivery Info */}
        <div className="delivery-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="delivery-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('topbar.delivery_info')}</span>
        </div>

        {/* Currency Selector */}
        <div className="selectors">
          <div className="selector-dropdown">
            <button 
              className="selector-button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            >
              <span>{currentCurrency.symbol}</span>
              <span>{currentCurrency.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isCurrencyDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCurrencyDropdownOpen && (
              <div className="dropdown-menu">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    className={`dropdown-item ${selectedCurrency === currency.code ? 'active' : ''}`}
                    onClick={() => changeCurrency(currency.code)}
                  >
                    <span>{currency.symbol}</span>
                    <span>{currency.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 
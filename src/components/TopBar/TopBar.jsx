import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  const { t, i18n } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Temporary mock data - replace with real data later
  const userName = "محمد أحمد";

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    setIsLanguageDropdownOpen(false);
  };

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsCurrencyDropdownOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
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

        {/* Language, Currency and User Selectors */}
        <div className="selectors">
          {/* Language Selector */}
          <div className="selector-dropdown">
            <button 
              className="selector-button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <span className="flag">{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLanguageDropdownOpen && (
              <div className="dropdown-menu">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    className={`dropdown-item ${i18n.language === language.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    <span className="flag">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Selector */}
          <div className="selector-dropdown">
            <button 
              className="selector-button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            >
              <span>{currentCurrency.symbol}</span>
              <span>{currentCurrency.code}</span>
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
                    <span>{currency.code}</span>
                    <span className="currency-name">{currency.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="selector-dropdown user-menu-topbar">
            <button 
              className="selector-button user-button-topbar"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div className="user-avatar-topbar">
                {userName.charAt(0)}
              </div>
              <span className="user-name-topbar">{userName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isUserDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('navbar.profile')}
                </Link>
                <Link to="/orders" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('navbar.orders')}
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('navbar.settings')}
                </Link>
                <button className="dropdown-item logout">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('navbar.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Set initial direction on component mount
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="language-switcher fixed top-4 bg-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow"
      style={{
        color: 'var(--primary-color)',
        border: '2px solid var(--primary-color)',
        fontWeight: '500',
        [i18n.language === 'ar' ? 'left' : 'right']: '1rem'
      }}
    >
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
} 
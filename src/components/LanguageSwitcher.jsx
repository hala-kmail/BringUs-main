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
  };

  return (
    <button
      onClick={toggleLanguage}
      className="language-switcher fixed top-4 bg-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow"
      style={{
        color: '#634C9F',
        border: '2px solid #634C9F',
        fontWeight: '500',
        [i18n.language === 'ar' ? 'left' : 'right']: '1rem'
      }}
    >
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
} 
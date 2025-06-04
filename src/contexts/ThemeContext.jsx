import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#257b4e'); // لون افتراضي

  // تحديث متغيرات CSS عند تغيير اللون الأساسي
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    
    // حساب الألوان المشتقة (يمكنك تعديل هذه الحسابات حسب احتياجاتك)
    const lighterColor = adjustColor(primaryColor, 20); // أفتح بنسبة 20%
    const darkerColor = adjustColor(primaryColor, -20); // أغمق بنسبة 20%
    const morelighterColor = adjustColor(primaryColor, 85);
    root.style.setProperty('--primary-light', lighterColor);
    root.style.setProperty('--primary-more-light', morelighterColor);
    root.style.setProperty('--primary-dark', darkerColor);
  }, [primaryColor]);

  // دالة مساعدة لتعديل درجة لون
  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const value = {
    primaryColor,
    setPrimaryColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 
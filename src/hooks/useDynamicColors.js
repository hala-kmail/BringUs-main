import { useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const useDynamicColors = () => {
  const { store } = useAppData();

  useEffect(() => {
    // قراءة اللون من store.settings.mainColor
    const mainColor = store?.settings?.mainColor;
    
    if (store && mainColor) {
      // console.log('Setting dynamic colors from store settings:', mainColor);
      
      // تحويل اللون الأساسي إلى ألوان مختلفة
      const primaryColor = mainColor;
      const primaryLight = lightenColor(primaryColor, 20);
      const primaryDark = darkenColor(primaryColor, 20);
      const primaryVeryLight = blendWithWhite(primaryColor, 90);

      // تحديث CSS variables
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--primary-light', primaryLight);
      document.documentElement.style.setProperty('--primary-dark', primaryDark);
      document.documentElement.style.setProperty('--primary-very-light', primaryVeryLight);
      // console.log('Dynamic colors updated:', {
      //   primary: primaryColor,
      //   light: primaryLight,
      //   dark: primaryDark
      // });
    } else {
      // استخدام الألوان الافتراضية إذا لم يكن هناك ستور أو لون
      // console.log('Using default colors - no store or mainColor available');
      // console.log('Store:', store);
      // console.log('Store settings:', store?.settings);
      document.documentElement.style.setProperty('--primary-color', '#1976d2');
      document.documentElement.style.setProperty('--primary-light', '#4791db');
      document.documentElement.style.setProperty('--primary-dark', '#115293');
    }
  }, [store]);

  // دالة لتفتيح اللون
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // دالة لتغميق اللون
  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  // دالة لتفتيح اللون بالدمج مع الأبيض (Blend with White)
  // percent: نسبة من 0 إلى 100 (0 = اللون الأصلي، 100 = أبيض كامل)
  const blendWithWhite = (color, percent) => {
    // تحويل اللون من hex إلى RGB
    const num = parseInt(color.replace('#', ''), 16);
    const R = num >> 16;
    const G = (num >> 8) & 0x00FF;
    const B = num & 0x0000FF;
    
    // حساب النسبة (من 0 إلى 1)
    const ratio = percent / 100;
    
    // دمج كل قناة لونية مع الأبيض (255)
    const newR = Math.round(R + (255 - R) * ratio);
    const newG = Math.round(G + (255 - G) * ratio);
    const newB = Math.round(B + (255 - B) * ratio);
    
    // تحويل النتيجة إلى hex
    return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
  };

  return {
    primaryColor: store?.settings?.mainColor || '#1976d2',
    primaryLight: store?.settings?.mainColor ? lightenColor(store.settings.mainColor, 20) : '#4791db',
    primaryDark: store?.settings?.mainColor ? darkenColor(store.settings.mainColor, 20) : '#115293',
    primaryVeryLight: store?.settings?.mainColor ? lightenColor(store.settings.mainColor, 85) : '#4791db',
    blendWithWhite, // دالة لدمج أي لون مع الأبيض
  };
};

export default useDynamicColors; 
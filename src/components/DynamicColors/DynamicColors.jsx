import React from 'react';
import useDynamicColors from '../../hooks/useDynamicColors';

const DynamicColors = () => {
  // استخدام hook لإدارة الألوان الديناميكية
  useDynamicColors();

  // هذا المكون لا يعرض أي شيء، فقط يدير الألوان
  return null;
};

export default DynamicColors; 
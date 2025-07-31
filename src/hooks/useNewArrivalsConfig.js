import { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

export const useNewArrivalsConfig = () => {
  const { store } = useAppData();
  const [config, setConfig] = useState({
    // الفترة الزمنية للمنتجات الجديدة (بالأيام)
    recentCreatedDays: 14, // 14 يوم
    recentStockUpdateDays: 7, // أسبوع واحد
    
    // المعايير المطلوبة
    includeRecentlyCreated: true,
    includeStockUpdates: true,
    
    // عدد المنتجات المعروضة
    maxProducts: 8,
    
    // ترتيب المنتجات
    sortBy: 'createdAt', // 'createdAt', 'stockUpdatedAt'
    sortOrder: 'desc' // 'asc', 'desc'
  });

  // تحميل الإعدادات من المتجر إذا كانت متوفرة
  useEffect(() => {
    if (store?.settings?.newArrivalsConfig) {
      setConfig(prev => ({
        ...prev,
        ...store.settings.newArrivalsConfig
      }));
    }
  }, [store]);

  // دالة لتحديث الإعدادات
  const updateConfig = (newConfig) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  // دالة لفلترة المنتجات حسب الإعدادات
  const filterNewArrivals = (products) => {
    if (!products || products.length === 0) return [];

    const now = new Date();
    const recentCreatedDate = new Date(now.getTime() - (config.recentCreatedDays * 24 * 60 * 60 * 1000));
    const recentStockUpdateDate = new Date(now.getTime() - (config.recentStockUpdateDays * 24 * 60 * 60 * 1000));

    return products.filter(product => {
      const conditions = [];

      // معيار 1: المنتجات المضافة حديثاً
      if (config.includeRecentlyCreated) {
        conditions.push(product.createdAt && new Date(product.createdAt) >= recentCreatedDate);
      }

      // معيار 2: المنتجات التي زاد ستوكها (تم تحديث الستوك في آخر أسبوع)
      if (config.includeStockUpdates) {
        conditions.push(product.stockUpdatedAt && 
                       new Date(product.stockUpdatedAt) >= recentStockUpdateDate && 
                       (product.stock > 0 || product.availableQuantity > 0));
      }

      // إرجاع المنتج إذا حقق أي من المعايير المطلوبة
      return conditions.some(condition => condition);
    });
  };

  // دالة لترتيب المنتجات
  const sortNewArrivals = (products) => {
    return products.sort((a, b) => {
      let aValue, bValue;

      switch (config.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'stockUpdatedAt':
          aValue = new Date(a.stockUpdatedAt || 0);
          bValue = new Date(b.stockUpdatedAt || 0);
          break;
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
      }

      if (config.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }).slice(0, config.maxProducts);
  };

  return {
    config,
    updateConfig,
    filterNewArrivals,
    sortNewArrivals
  };
}; 
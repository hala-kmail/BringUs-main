import React from 'react';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';

const ProductBreadcrumb = ({ category, productName, currentLang, t, allCategories = [] }) => {
  const { navigate } = useAffiliateNavigation();

  // دالة لإيجاد مسار الفئة من الجذر حتى الفئة الحالية
  function getCategoryPath(categoryId, categories) {
    const path = [];
    let current = categories.find(cat => cat._id === categoryId || cat.id === categoryId);
    while (current) {
      path.unshift(current);
      if (!current.parent) break;
      // parent قد يكون كائن أو id فقط
      const parentId = typeof current.parent === 'object' ? (current.parent._id || current.parent.id) : current.parent;
      current = categories.find(cat => cat._id === parentId || cat.id === parentId);
    }
    return path;
  }

  const categoryId = category?._id || category?.id;
  const categoryPath = getCategoryPath(categoryId, allCategories);

  return (
    <nav className="product-breadcrumb">
      <span onClick={() => navigate('/')}>{t('product_detail.home')}</span>
      {categoryPath.map((cat, idx) => (
        <React.Fragment key={cat._id || cat.id}>
          <span className="breadcrumb-separator">›</span>
          <span
            onClick={() => navigate(`/category/${cat.slug || cat._id || cat.id}`)}
            className={idx === categoryPath.length - 1 ? 'breadcrumb-current' : ''}
            style={{ cursor: idx === categoryPath.length - 1 ? 'default' : 'pointer' }}
          >
            {currentLang === 'ar' ? cat.nameAr : cat.nameEn}
          </span>
        </React.Fragment>
      ))}
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">{productName}</span>
    </nav>
  );
};

export default ProductBreadcrumb; 
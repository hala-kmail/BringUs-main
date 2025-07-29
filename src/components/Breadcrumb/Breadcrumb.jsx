import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumb = ({ category, currentLang, t, allCategories = [] }) => {
  const navigate = useNavigate();

  // دالة لإيجاد مسار الفئة من الجذر حتى الفئة الحالية
  function getCategoryPath(category, categories) {
    const path = [];
    let current = category;
    let safety = 0;
    while (current && safety < 20) {
      path.unshift(current);
      if (!current.parent) break;
      let parentId = typeof current.parent === 'object'
        ? (current.parent._id || current.parent.id)
        : current.parent;
      if (!parentId) break;
      current = categories.find(cat => cat._id === parentId || cat.id === parentId);
      safety++;
    }
    return path;
  }

  if (!category) return null;
  const categoryPath = getCategoryPath(category, allCategories);

  return (
    <nav className="product-breadcrumb">
      <span onClick={() => navigate('/')}>{t('product_detail.home')}</span>
      {categoryPath.map((cat, idx) => (
        <React.Fragment key={cat._id || cat.id}>
          <span className="breadcrumb-separator">{t('product_detail.breadcrumb_sep')}</span>
          <span
            onClick={() => navigate(`/category/${cat.slug || cat._id || cat.id}`)}
            className={idx === categoryPath.length - 1 ? 'breadcrumb-current' : ''}
            style={{ cursor: idx === categoryPath.length - 1 ? 'default' : 'pointer' }}
          >
            {currentLang === 'ar' ? cat.nameAr : cat.nameEn}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 
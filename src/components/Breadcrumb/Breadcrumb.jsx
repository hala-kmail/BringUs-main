import React from 'react';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';

const Breadcrumb = ({ category, currentLang, t, allCategories = [] }) => {
  const { navigate } = useAffiliateNavigation();

  // دالة محسنة لإيجاد مسار الفئة من الجذر حتى الفئة الحالية
  function getCategoryPath(category, categories) {
    const path = [];
    let current = category;
    let safety = 0;
    const visited = new Set(); // لتجنب الحلقات اللانهائية

    while (current && safety < 20 && !visited.has(current._id)) {
      visited.add(current._id);
      path.unshift(current);
      
      // محاولة إيجاد الأب من خلال علاقة parent
      if (current.parent) {
        let parentId = typeof current.parent === 'object'
          ? (current.parent._id || current.parent.id)
          : current.parent;
        
        if (parentId) {
          const parent = categories.find(cat => cat._id === parentId || cat.id === parentId);
          if (parent) {
            current = parent;
            continue;
          }
        }
      }
      
      // إذا لم نجد أب من خلال parent، نحاول إيجاده من خلال slug
      // هذا مفيد للكاتيجوريز التي لها علاقات معقدة
      if (current.slug && current.slug.includes('/')) {
        const slugParts = current.slug.split('/');
        if (slugParts.length > 1) {
          const parentSlug = slugParts.slice(0, -1).join('/');
          const parent = categories.find(cat => 
            cat.slug === parentSlug || 
            cat.slugAr === parentSlug || 
            cat.slugEn === parentSlug
          );
          if (parent) {
            current = parent;
            continue;
          }
        }
      }
      
      break;
    }
    
    return path;
  }

  // دالة للتنقل الآمن إلى الكاتيجوري
  const navigateToCategory = (cat) => {
    try {
      const slug = cat.slug || cat.slugAr || cat.slugEn || cat._id || cat.id;
      navigate(`/category/${slug}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // fallback إلى الصفحة الرئيسية
      navigate('/');
    }
  };

  if (!category) return null;
  const categoryPath = getCategoryPath(category, allCategories);

  return (
    <nav className="product-breadcrumb">
      <span onClick={() => navigate('/')}>{t('product_detail.home')}</span>
      {categoryPath.map((cat, idx) => (
        <React.Fragment key={cat._id || cat.id}>
          <span className="breadcrumb-separator">›</span>
          <span
            onClick={() => navigateToCategory(cat)}
            className={idx === categoryPath.length - 1 ? 'breadcrumb-current' : ''}
            style={{ cursor: idx === categoryPath.length - 1 ? 'default' : 'pointer' }}
            title={currentLang === 'ar' ? cat.nameAr : cat.nameEn}
          >
            {currentLang === 'ar' ? cat.nameAr : cat.nameEn}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 
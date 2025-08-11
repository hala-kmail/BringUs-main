import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useCategories from '../../hooks/useCategories';
import './MobileCategories.css';
import Navbar from '../../components/Navbar/Navbar';

const MobileCategories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categories, loading, error, getMainCategories, getSubCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  
  const currentLang = i18n.language;

  useEffect(() => {
    if (categories && categories.length > 0) {
      // Get main categories that might contain mobile-related items
      const mainCats = getMainCategories();
      
      // Find mobile-related main category or use first one as default
      const mobileCategory = mainCats.find(cat => {
        const nameEn = cat.nameEn?.toLowerCase() || '';
        const nameAr = cat.nameAr?.toLowerCase() || '';
        const mobileKeywords = ['mobile', 'phone', 'smartphone', 'electronics', 'موبايل', 'هاتف', 'إلكترونيات'];
        
        return mobileKeywords.some(keyword => 
          nameEn.includes(keyword) || nameAr.includes(keyword)
        );
      }) || mainCats[0];

      if (mobileCategory) {
        setSelectedCategory(mobileCategory);
        const subs = getSubCategories(mobileCategory._id);
        setSubCategories(subs);
      }
    }
  }, [categories, getMainCategories, getSubCategories]);

  const handleCategoryClick = (category) => {
    // Navigate to the category page
    const slug = category.slug || category.slugAr || category.slugEn || category._id;
    navigate(`/category/${slug}`);
  };

  const handleMainCategoryChange = (category) => {
    setSelectedCategory(category);
    const subs = getSubCategories(category._id);
    setSubCategories(subs);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="mobile-categories-page">
        <div className="mobile-categories-header">
          <h2 className="page-title">{t('mobile_categories.title')}</h2>
        </div>
        <div className="mobile-categories-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            {currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mobile-categories-page">
        <div className="mobile-categories-header">
          <h2 className="page-title">{t('mobile_categories.title')}</h2>
        </div>
        <div className="mobile-categories-content">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            {currentLang === 'ar' ? 'حدث خطأ في التحميل' : 'Error loading categories'}
          </div>
        </div>
      </div>
    );
  }

  // Show no categories state
  if (!categories || categories.length === 0) {
    return (
      <div className="mobile-categories-page">
        <div className="mobile-categories-header">
          <h2 className="page-title">{t('mobile_categories.title')}</h2>
        </div>
        <div className="mobile-categories-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>{t('mobile_categories.subtitle')}</p>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>
              {currentLang === 'ar' ? 'لا توجد فئات متاحة حالياً' : 'No categories available at the moment'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mainCategories = getMainCategories();

  return (
    <>
    <Navbar/>
    <div className="mobile-categories-page">
      
      <div className="mobile-categories-content">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          {mainCategories.map((category) => (
            <button
              key={category._id}
              className={`category-item ${selectedCategory?._id === category._id ? 'active' : ''}`}
              onClick={() => handleMainCategoryChange(category)}
            >
              <span className="category-name">
                {currentLang === 'ar' ? category.nameAr : category.nameEn}
              </span>
            </button>
          ))}
        </div>

        {/* Subcategories Section */}
        <div className="subcategories-section">
          <div className="section-header">
            <h3 className="section-title">
              {selectedCategory ? (currentLang === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn) : t('mobile_categories.subtitle')}
            </h3>
          </div>
          
          {subCategories && subCategories.length > 0 ? (
            <div className="subcategories-grid mobile-subcategories-grid">
              {subCategories.map((subcategory) => (
                <div
                  key={subcategory._id}
                  className="subcategory-item"
                  onClick={() => handleCategoryClick(subcategory)}
                >
                  <div className="subcategory-image">
                    {subcategory.image ? (
                      <img
                        src={subcategory.image}
                        alt={currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn}
                        className="subcategory-img"
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '1.5rem'
                      }}>
                        📱
                      </div>
                    )}
                  </div>
                  <div className="subcategory-info">
                    <span className="subcategory-name">
                      {currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn}
                    </span>
                    <span className="subcategory-arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-subcategories">
              <div className="no-subcategories-icon">📱</div>
              <h3>
                {currentLang === 'ar' ? 'لا توجد فئات فرعية' : 'No Subcategories'}
              </h3>
              <p>
                {currentLang === 'ar' 
                  ? 'هذه الفئة لا تحتوي على فئات فرعية حالياً' 
                  : 'This category has no subcategories at the moment'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MobileCategories; 
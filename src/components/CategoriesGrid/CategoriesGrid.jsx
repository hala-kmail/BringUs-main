import React from 'react';
import { useTranslation } from 'react-i18next';
import useCategories from '../../hooks/useCategories';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import './CategoriesGrid.css';
import placeholder from '../../assets/placeholder.jpg';

const CategoriesGrid = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const currentLang = i18n.language;

  // Use categories from API
  const { getMainCategories, loading, error } = useCategories();
  const mainCategories = getMainCategories();
  

//-----------------------------------handleCategoryClick--------------------------------------  
  const handleCategoryClick = (category) => {
    const categorySlug = category.slug;
    navigate(`/category/${categorySlug}`);
  };
//-----------------------------------return------------------------------------------------  
  return (
    <section className="categories-grid-section">
      <div className="categories-grid-container">
        {/* Loading state */}
        {loading && (
          <div className="categories-grid-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل الفئات...' : 'Loading categories...'}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="categories-grid-error">
            <p>{currentLang === 'ar' ? 'خطأ في تحميل الفئات' : 'Error loading categories'}</p>
          </div>
        )}

        {/* Categories grid */}
        {!loading && !error && (
          <div className="categories-scroll-wrapper">
            <div className="categories-grid">
              {mainCategories.length > 0 ? (
                mainCategories.map((category) => (
                  <div
                    key={category._id}
                    className="category-grid-item"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="category-image-wrapper">
                      <img
                        src={category.image && category.image.trim() !== '' ? category.image : placeholder}
                        alt={currentLang === 'ar' ? category.nameAr : category.nameEn}
                        className="category-image"
                      />
                    </div>
                    <div className="category-name">
                      {currentLang === 'ar' ? category.nameAr : category.nameEn}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-categories-grid">
                  <p>{currentLang === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesGrid; 
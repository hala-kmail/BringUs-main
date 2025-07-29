import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useCategories from '../../hooks/useCategories';
import './Categories.css';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const currentLang = i18n.language;

  // Use categories from API
  const {
    categories,
    loading,
    error,
    getMainCategories,
    getSubCategories,
    getAllSubCategories
  } = useCategories();

  //-----------------------------------mainCategories------------------------------------------------  
  const mainCategories = getMainCategories();

  //-----------------------------------subcategories------------------------------------------------  
  const subcategories = activeMainCategory ? getSubCategories(activeMainCategory._id) : [];

  //-----------------------------------allSubcategories------------------------------------------------  
  const allSubcategories = mainCategories.flatMap((cat) => getSubCategories(cat._id));

  //-----------------------------------handleMainCategoryClick------------------------------------------------  
  const handleMainCategoryClick = (category) => {
    setActiveMainCategory(category);
    navigate(`/category/${category.slug}`);
    setIsPanelOpen(false);
    setActiveMainCategory(null);
  };

  //-----------------------------------handleSubcategoryClick------------------------------------------------  
  const handleSubcategoryClick = (subcategory) => {
    // Navigate directly to the subcategory slug
    navigate(`/category/${subcategory.slug}`);
    setIsPanelOpen(false);
    setActiveMainCategory(null);
  };

  //-----------------------------------handleClosePanel------------------------------------------------  
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setActiveMainCategory(null);
  };
  //-----------------------------------return------------------------------------------------  
  return (
    <div className="categories-component">
      <button className="categories-btn" onClick={() => setIsPanelOpen(!isPanelOpen)}>
        <span className="categories-icon">☰</span>
        <span className="categories-label">{t('categories.all_categories')}</span>  
      </button>

      {/* Loading state */}
      {loading && (
        <div className="categories-loading">
          <div className="loading-spinner"></div>
          <span>{currentLang === 'ar' ? 'جاري تحميل الفئات...' : 'Loading categories...'}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="categories-error">
          <span>{currentLang === 'ar' ? 'خطأ في تحميل الفئات' : 'Error loading categories'}</span>
        </div>
      )}

      {/*-----------------------------------Categories Panel------------------------------------------------   */}
      {isPanelOpen && (
        <div className={`categories-panel ${currentLang === 'ar' ? 'rtl' : 'ltr'}`}> 
          <button className="close-panel-btn" onClick={handleClosePanel}>×</button>
          <div className="categories-panel-content">
            {/*-----------------------------------Main Categories List------------------------------------------------   */}
            <div className="main-categories-list">
              {mainCategories.length > 0 ? (
                mainCategories.map((category) => (
                  <button
                    key={category._id}
                    className={`main-category-btn${activeMainCategory && activeMainCategory._id === category._id ? ' active' : ''}`}
                    onClick={() => handleMainCategoryClick(category)}
                    onMouseEnter={() => setActiveMainCategory(category)}
                  >
                    {currentLang === 'ar' ? (
                      <>
                        <span style={{marginLeft: 8}}>{category.nameAr}</span>
                        <span className="main-category-arrow" style={{marginRight: 2, display: 'inline-flex', alignItems: 'center'}}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{display: 'inline'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{marginRight: 8}}>{category.nameEn}</span>
                        <span className="main-category-arrow" style={{marginLeft: 2, display: 'inline-flex', alignItems: 'center'}}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{display: 'inline'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </>
                    )}
                  </button>
                ))
              ) : (
                <div className="no-categories">
                  {currentLang === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
                </div>
              )}
            </div>
              {/*-----------------------------------Subcategories List------------------------------------------------   */}
            <div className="subcategories-list">
              {(activeMainCategory ? subcategories : allSubcategories).length > 0 ? (
                (activeMainCategory ? subcategories : allSubcategories).map((subcategory) => (
                  <div key={subcategory._id} className="subcategory-circle-wrapper">
                    <button className="subcategory-circle" onClick={() => handleSubcategoryClick(subcategory)}>
                      <img className="subcategory-circle-image" src={subcategory.image} alt={currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn} />
                    </button>
                    <div className="subcategory-name">{currentLang === 'ar' ? subcategory.nameAr : subcategory.nameEn}</div>
                  </div>
                ))
              ) : (
                <div className="no-subcategories">{currentLang === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories'}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
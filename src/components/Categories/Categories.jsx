import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getMainCategories, getSubCategories } from '../../data/index';
import './Categories.css';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const currentLang = i18n.language;

  //-----------------------------------mainCategories------------------------------------------------  
  const mainCategories = getMainCategories();

  //-----------------------------------subcategories------------------------------------------------  
  const subcategories = activeMainCategory ? getSubCategories(activeMainCategory.id) : [];

  //-----------------------------------allSubcategories------------------------------------------------  
  const allSubcategories = mainCategories.flatMap((cat) => getSubCategories(cat.id));

  //-----------------------------------handleMainCategoryClick------------------------------------------------  
  const handleMainCategoryClick = (category) => {
    setActiveMainCategory(category);
    navigate(`/category/${category.slug['en']}`);
    setIsPanelOpen(false);
    setActiveMainCategory(null);
  };

  //-----------------------------------handleSubcategoryClick------------------------------------------------  
  const handleSubcategoryClick = (subcategory) => {
   
    let mainCategory = activeMainCategory;
   
    if (!mainCategory) {
      mainCategory = mainCategories.find(cat => cat.id === subcategory.parentCategoryId);
    }
    if (mainCategory) {
      navigate(`/category/${mainCategory.slug['en']}/${subcategory.slug['en']}`);
      setIsPanelOpen(false);
      setActiveMainCategory(null);
    }
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

      {/*-----------------------------------Categories Panel------------------------------------------------   */}
      {isPanelOpen && (
        <div className={`categories-panel ${currentLang === 'ar' ? 'rtl' : 'ltr'}`}> 
          <button className="close-panel-btn" onClick={handleClosePanel}>×</button>
          <div className="categories-panel-content">
            {/*-----------------------------------Main Categories List------------------------------------------------   */}
            <div className="main-categories-list">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  className={`main-category-btn${activeMainCategory && activeMainCategory.id === category.id ? ' active' : ''}`}
                  onClick={() => handleMainCategoryClick(category)}
                  onMouseEnter={() => setActiveMainCategory(category)}
                >
                  {currentLang === 'ar' ? (
                    <>
                      <span style={{marginLeft: 8}}>{category.name[currentLang]}</span>
                      <span className="main-category-arrow" style={{marginRight: 2, display: 'inline-flex', alignItems: 'center'}}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{display: 'inline'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{marginRight: 8}}>{category.name[currentLang]}</span>
                      <span className="main-category-arrow" style={{marginLeft: 2, display: 'inline-flex', alignItems: 'center'}}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{display: 'inline'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
              {/*-----------------------------------Subcategories List------------------------------------------------   */}
            <div className="subcategories-list">
              {(activeMainCategory ? subcategories : allSubcategories).length > 0 ? (
                (activeMainCategory ? subcategories : allSubcategories).map((subcategory) => (
                  <div key={subcategory.id} className="subcategory-circle-wrapper">
                    <button className="subcategory-circle" onClick={() => handleSubcategoryClick(subcategory)}>
                      <img className="subcategory-circle-image" src={subcategory.image} alt={subcategory.name[currentLang]} />
                    </button>
                    <div className="subcategory-name">{subcategory.name[currentLang]}</div>
                  </div>
                ))
              ) : (
                <div className="no-subcategories">{t('categories.no_subcategories') || 'لا توجد فئات فرعية'}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
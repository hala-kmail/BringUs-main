import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getMainCategories } from '../../data/index';
import './CategoriesGrid.css';

const CategoriesGrid = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;


  const handleCategoryClick = (category) => {
    const categorySlug = category.slug['en'];
    navigate(`/category/${categorySlug}`);
  };



  return (
    <section className="categories-grid-section">
      <div className="categories-grid-container">
        <div className="categories-scroll-wrapper">
          <div className="categories-grid">
            {getMainCategories().map((category) => (
              <div
                key={category.id}
                className="category-grid-item"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-image-wrapper">
                  <img
                    src={category.image}
                    alt={category.name[currentLang]}
                    className="category-image"
                  />
                </div>
                <div className="category-name">
                  {category.name[currentLang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid; 
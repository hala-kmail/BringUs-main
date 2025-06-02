import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';
import './CategoriesGrid.css';

const CategoriesGrid = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  // خريطة ربط معرفات الفئات بأسمائها للتوافق مع الروابط الموجودة
  const categorySlugMapping = {
    1: 'fruits-vegetables',
    2: 'meats-seafood',
    3: 'breakfast-dairy',
    4: 'breads-bakery',
    5: 'beverages',
    6: 'frozen-foods',
    7: 'biscuits-snacks',
    8: 'grocery-staples',
    9: 'household-needs',
    10: 'healthcare',
    11: 'baby-pregnancy'
  };

  const handleCategoryClick = (categoryId) => {
    const categorySlug = categorySlugMapping[categoryId];
    navigate(`/category/${categorySlug}`);
  };

  // دالة لإنشاء صورة افتراضية في حالة فشل تحميل الصورة الحقيقية
  const getFallbackImageSrc = (category) => {
    const categoryIcons = {
      1: `🍎`, // Fruits & Vegetables
      2: `🥩`, // Meats & Seafood
      3: `🥛`, // Breakfast & Dairy
      4: `🍞`, // Breads & Bakery
      5: `🥤`, // Beverages
      6: `🧊`, // Frozen Foods
      7: `🍪`, // Biscuits & Snacks
      8: `🛒`, // Grocery & Staples
      9: `🧽`, // Household Needs
      10: `💊`, // Healthcare
      11: `👶` // Baby & Pregnancy
    };

    const icon = categoryIcons[category.id] || '📦';
    
    return `data:image/svg+xml;charset=UTF-8,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad${category.id}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:${encodeURIComponent(category.color)};stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:${encodeURIComponent(category.color)}88;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad${category.id})' rx='15'/%3e%3ctext x='50' y='65' font-family='Arial' font-size='35' text-anchor='middle'%3e${icon}%3c/text%3e%3c/svg%3e`;
  };

  return (
    <section className="categories-grid-section">
      <div className="categories-grid-container">
        <div className="categories-scroll-wrapper">
          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-grid-item"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-image-wrapper">
                  <img
                    src={category.image}
                    alt={category.name[currentLang]}
                    className="category-image"
                    onError={(e) => {
                      // في حالة فشل تحميل الصورة، استخدم صورة افتراضية
                      e.target.src = getFallbackImageSrc(category);
                    }}
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
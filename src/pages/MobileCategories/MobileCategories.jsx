import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import useCategories from '../../hooks/useCategories';
import useProducts from '../../hooks/useProducts';
import './MobileCategories.css';

const MobileCategories = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categorySubcategories, setCategorySubcategories] = useState([]);

  const currentLang = i18n.language;



  const { categories, getMainCategories, getSubCategories } = useCategories();
  const { products } = useProducts();

  // دالة للتحقق من وجود منتجات في فئة
  const hasProductsInCategory = (categoryId) => {
    return products.some(product => {
      // دعم أكثر من شكل للربط
      const cat = product.category;
      return (
        (cat && (cat._id === categoryId || cat.id === categoryId)) ||
        product.categoryId === categoryId
      );
    });
  };

  // دالة للتحقق من وجود منتجات في فئة فرعية معينة
  const hasProductsInSubcategory = (subcategoryId) => {
    return products.some(product => {
      const cat = product.category;
      return (
        (cat && (cat._id === subcategoryId || cat.id === subcategoryId)) ||
        product.categoryId === subcategoryId
      );
    });
  };

  // تصفية الفئات لإظهار فقط الفئات الرئيسية التي تحتوي على منتجات
  const getFilteredMainCategories = () => {
    return getMainCategories().filter(category => hasProductsInCategory(category._id || category.id));
  };

  // دالة لجلب الفئات الفرعية لفئة معينة
  const getCategorySubcategories = (categoryId) => {
    const subCategories = getSubCategories(categoryId); // فقط الفروع المباشرة
    return subCategories.filter(subcategory => hasProductsInSubcategory(subcategory._id || subcategory.id));
  };

  // دالة لجلب جميع الفئات الفرعية من جميع الفئات الرئيسية (تستخدم فقط عند اختيار الكل)
  const getAllSubcategories = () => {
    let allSubCategories = [];
    getMainCategories().forEach(mainCat => {
      const subCats = getSubCategories(mainCat._id || mainCat.id);
      allSubCategories = allSubCategories.concat(subCats);
    });
    return allSubCategories.filter(subcategory => hasProductsInSubcategory(subcategory._id || subcategory.id));
  };

  // دالة لجمع كل معرفات الفئة والفروع التابعة لها (نفس ديسكتوب)
  function getAllDescendantCategoryIds(categoryId, categoriesList) {
    const ids = [categoryId];
    const children = categoriesList.filter(cat => {
      if (!cat.parent) return false;
      if (typeof cat.parent === 'object') {
        return cat.parent._id === categoryId || cat.parent.id === categoryId;
      }
      return cat.parent === categoryId;
    });
    children.forEach(child => {
      ids.push(...getAllDescendantCategoryIds(child._id || child.id, categoriesList));
    });
    return ids;
  }

  // المنتجات المعروضة حسب الفئة المختارة (أو الكل)
  let categoryFilteredProducts = [];
  if (selectedCategory === 'all') {
    categoryFilteredProducts = products;
  } else {
    const categoryIds = getAllDescendantCategoryIds(selectedCategory, categories);
    categoryFilteredProducts = products.filter(product =>
      categoryIds.includes(product.category?._id || product.category?.id || product.categoryId)
    );
  }

  // الفروع الفرعية المعروضة
  let subcategoriesToShow = [];
  if (selectedCategory === 'all') {
    // كل الفروع الفرعية لجميع الفئات الرئيسية
    let allSubCategories = [];
    getMainCategories().forEach(mainCat => {
      const subCats = getSubCategories(mainCat._id || mainCat.id);
      allSubCategories = allSubCategories.concat(subCats);
    });
    subcategoriesToShow = allSubCategories.filter(subcategory =>
      products.some(product => {
        const cat = product.category;
        return (
          (cat && (cat._id === (subcategory._id || subcategory.id) || cat.id === (subcategory._id || subcategory.id))) ||
          product.categoryId === (subcategory._id || subcategory.id)
        );
      })
    );
  } else {
    subcategoriesToShow = getSubCategories(selectedCategory).filter(subcategory =>
      products.some(product => {
        const cat = product.category;
        return (
          (cat && (cat._id === (subcategory._id || subcategory.id) || cat.id === (subcategory._id || subcategory.id))) ||
          product.categoryId === (subcategory._id || subcategory.id)
        );
      })
    );
  }

  // تحديد خيار "الكل" كافتراضي
  useEffect(() => {
    if (selectedCategory === 'all') {
      setCategorySubcategories(getAllSubcategories());
    }
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setCategorySubcategories(getAllSubcategories());
    } else {
      setCategorySubcategories(getCategorySubcategories(categoryId));
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/shop'); // الانتقال لصفحة المتجر عند النقر على "عرض الكل"
    } else {
      // ابحث عن الفئة حسب id أو _id
      const category = categories.find(cat => (cat._id || cat.id) === categoryId);
      let categorySlug = '';
      if (category) {
        if (category.slug) {
          if (typeof category.slug === 'object') {
            categorySlug = category.slug[currentLang] || category.slug.ar || category.slug.en || '';
          } else {
            categorySlug = category.slug;
          }
        }
      }
      if (categorySlug) {
        navigate(`/category/${categorySlug}`);
      }
    }
  };

  const handleSubcategoryClick = (subcategoryId) => {
    // البحث عن الفئة الفرعية من قائمة categories
    const subcategory = categories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      // جلب الفئة الرئيسية
      const mainCategory = categories.find(cat => cat.id === subcategory.parentCategoryId);
      if (mainCategory && mainCategory.slug && subcategory.slug) {
        navigate(`/category/${mainCategory.slug[currentLang]}/${subcategory.slug[currentLang]}`);
      }
    }
  };

  // دالة للحصول على اسم القسم المحدد
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') {
      return t('categories.all_categories');
    }
    const cat = getMainCategories().find(cat => (cat._id || cat.id) === selectedCategory);
    if (!cat) return '';
    if (cat.name) {
      if (typeof cat.name === 'object') {
        return cat.name[currentLang] || cat.name.ar || cat.name.en || '';
      } else {
        return cat.name;
      }
    }
    return cat.nameAr || cat.nameEn || '';
  };

  // دالة للحصول على نص الزر "عرض الكل"
  const getViewAllText = () => {
    if (selectedCategory === 'all') {
      return t('shop.browse_all_products');
    }
    return t('new_arrivals.view_all');
  };

  const filteredMainCategories = getFilteredMainCategories();

  return (
    <div className="mobile-categories-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mobile-categories-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
        <h1 className="page-title">{t('categories.title')}</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content */}
      <div className="mobile-categories-content">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          {/* خيار الكل */}
          <button
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('all')}
          >
            <span className="category-name">{t('categories.all_categories')}</span>
          </button>
          
          {/* باقي الفئات */}
          {getFilteredMainCategories().map((category) => (
            <button
              key={category._id || category.id}
              className={`category-item ${selectedCategory === (category._id || category.id) ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category._id || category.id)}
            >
              <span className="category-name">{
                (category.name && (category.name[currentLang] || category.name.ar || category.name.en)) ||
                category.nameAr || category.nameEn || ''
              }</span>
            </button>
          ))}
        </div>

        {/* Subcategories Grid */}
        <div className="subcategories-section">
              <div className="section-header">
                <h2 className="section-title">
              {getSelectedCategoryName()}
                </h2>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCategoryClick(selectedCategory)}
                >
              {getViewAllText()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentLang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

          <div className="subcategories-grid">
            {subcategoriesToShow.map((subcategory) => (
              <div 
                key={subcategory._id || subcategory.id} 
                className="subcategory-item"
                onClick={() => {
                  let subSlug = '';
                  if (subcategory.slug) {
                    if (typeof subcategory.slug === 'object') {
                      subSlug = subcategory.slug[currentLang] || subcategory.slug.ar || subcategory.slug.en || '';
                    } else {
                      subSlug = subcategory.slug;
                    }
                  }
                  if (subSlug) navigate(`/category/${subSlug}`);
                }}
              >
                <div className="subcategory-image">
                  <img 
                    src={subcategory.image} 
                    alt={
                      (subcategory.name && (subcategory.name[currentLang] || subcategory.name.ar || subcategory.name.en)) ||
                      subcategory.nameAr || subcategory.nameEn || ''
                    }
                    className="subcategory-img"
                  />
                </div>
                <div className="subcategory-info">
                  <h3 className="subcategory-name">{
                    (subcategory.name && (subcategory.name[currentLang] || subcategory.name.ar || subcategory.name.en)) ||
                    subcategory.nameAr || subcategory.nameEn || ''
                  }</h3>
                  <span className="subcategory-arrow">{currentLang === 'ar' ? '←' : '→'}</span>
                </div>
              </div>
            ))}
          </div>

          {subcategoriesToShow.length === 0 && (
            <div className="no-subcategories">
             
                  <h3>{t('shop.no_products_title')}</h3>
                  <p>{t('shop.no_products_description')}</p>
                </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCategories; 
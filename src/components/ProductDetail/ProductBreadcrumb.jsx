import React from 'react';
import { Link } from 'react-router-dom';

const ProductBreadcrumb = ({ product, category, t, currentLang }) => (
  <nav className="product-breadcrumb">
    <Link to="/">
      <span>{t('secondary_navbar.home')}</span>
    </Link>
    <span className="breadcrumb-separator"> {t('product_detail.breadcrumb_sep')}</span>
    <Link to="/shop">
      <span>{t('secondary_navbar.shop')}</span>
    </Link>
    <span className="breadcrumb-separator"> {t('product_detail.breadcrumb_sep')}</span>
    {category && (
      <>
        <span>{category.name[currentLang]}</span>
        <span className="breadcrumb-separator"> {t('product_detail.breadcrumb_sep')}</span>
      </>
    )}
    <span className="breadcrumb-current">{product.name[currentLang]}</span>
  </nav>
);

export default ProductBreadcrumb; 
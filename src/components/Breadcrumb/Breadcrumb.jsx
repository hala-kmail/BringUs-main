import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ breadcrumbPath, currentLang, t }) => (
  <div className="breadcrumb">
    <Link to="/">{t('product_detail.home')}</Link>
    <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
    <Link to="/shop">{t('secondary_nav.shop')}</Link>
    {breadcrumbPath.map((item, index) => (
      <React.Fragment key={index}>
        <span className="breadcrumb-separator">{currentLang === 'ar' ? '‹' : '›'}</span>
        {index === breadcrumbPath.length - 1 ? (
          <span className="breadcrumb-current">{item.name}</span>
        ) : (
          <Link to={`/category/${item.slug}`} className="breadcrumb-link">{item.name}</Link>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumb; 
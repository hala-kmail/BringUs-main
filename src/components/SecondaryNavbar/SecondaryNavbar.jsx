import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Categories from '../Categories/Categories';
import './SecondaryNavbar.css';

const SecondaryNavbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navigationLinks = [
    { id: 'home', name: t('secondary_nav.home'), path: '/home' },
    { id: 'shop', name: t('secondary_nav.shop'), path: '/shop' }
  ];

  return (
    <div className="secondary-navbar">
      <div className="secondary-navbar-container">
        {/* Categories Section */}
        <div className="secondary-nav-section categories-section">
          <Categories />
        </div>

        {/* Navigation Links */}
        <div className="secondary-nav-section navigation-section">
          <nav className="navigation-links">
            {navigationLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path || 
                  (link.path === '/home' && location.pathname === '/') 
                    ? 'active' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Special Offers Section */}
        <div className="secondary-nav-section offers-section">
          <Link to="/trending" className="offer-link trending">
            <span className="offer-text">{t('secondary_nav.trending_products')}</span>
          </Link>
          
          <Link to="/almost-finished-sale" className="offer-link almost-finished">
            <span className="offer-text">{t('secondary_nav.almost_finished')}</span>
            <span className="sale-badge">
              {t('secondary_nav.sale')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavbar; 
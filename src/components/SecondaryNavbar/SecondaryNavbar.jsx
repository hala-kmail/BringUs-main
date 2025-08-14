import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import Categories from '../Categories/Categories';
import './SecondaryNavbar.css';

const SecondaryNavbar = () => {
  const { t } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);
  //-----------------------------------handleScroll------------------------------------------------  
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  };
//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
//-----------------------------------navigationLinks------------------------------------------------    
  const navigationLinks = [
    { id: 'home', name: t('secondary_nav.home'), path: '/home' },
    { id: 'shop', name: t('secondary_nav.shop'), path: '/shop' }
  ];
//-----------------------------------return------------------------------------------------  
  return (
    <div className={`secondary-navbar ${isVisible ? 'show' : 'hide'}`}>
      <div className="secondary-navbar-container">
{/*-----------------------------------Categories Section------------------------------------------------   */}
        <div className="secondary-nav-section categories-section">
          <Categories />
        </div>

{/*-----------------------------------Navigation Links------------------------------------------------   */}
        <div className="secondary-nav-section navigation-section">
          <nav className="navigation-links">
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => navigate(link.path)}
                className={`nav-link ${
                  location.pathname === link.path || 
                  (link.path === '/home' && location.pathname === '/') 
                    ? 'active' : ''
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>
        </div>

{/*-----------------------------------Special Offers Section------------------------------------------------   */}
        <div className="secondary-nav-section offers-section">
          {/* <Link to="/trending" className="offer-link trending">
            <span className="offer-text">{t('secondary_nav.trending_products')}</span>
          </Link> */}
          
          <button onClick={() => navigate('/almost-finished-sale')} className="offer-link almost-finished">
            <span className="offer-text">{t('secondary_nav.almost_finished')}</span>
            <span className="sale-badge">
              {t('secondary_nav.sale')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavbar;

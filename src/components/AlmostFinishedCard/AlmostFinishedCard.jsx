import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppData } from '../../contexts/AppDataContext';
import './AlmostFinishedCard.css';

const AlmostFinishedCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { products } = useAppData();
  
  // Calculate almost finished products count using lowStockThreshold
  const almostFinishedCount = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return 0;
    
    return products.filter(product => {
      const stockThreshold = product.lowStockThreshold || 5; // fallback to 5 if not defined
      return product.stock <= stockThreshold && product.stock > 0;
    }).length;
  }, [products]);

  return (
    <div className="almost-finished-card" onClick={() => navigate('/almost-finished-sale')}>
      <div className="card-content">
        <div className="icon-container">
          ⚡
        </div>
        <div className="text-container">
          <h3>{t('almost_finished.title')}</h3>
          <p>{t('almost_finished.description')}</p>
          {almostFinishedCount > 0 && (
            <div className="count-badge">
              {almostFinishedCount} {t('almostFinished.productsLeft')}
            </div>
          )}
        </div>
        <div className="arrow-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AlmostFinishedCard;

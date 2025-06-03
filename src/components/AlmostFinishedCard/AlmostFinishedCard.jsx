import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AlmostFinishedCard.css';

const AlmostFinishedCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="almost-finished-card" onClick={() => navigate('/almost-finished-sale')}>
      <div className="card-content">
        <div className="icon-container">
          ⚡
        </div>
        <div className="text-container">
          <h3>{t('almost_finished.title')}</h3>
          <p>{t('almost_finished.description')}</p>
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

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CountdownTimer.css';

const CountdownTimer = ({ endTime, size = 'small' }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endDateTime = new Date(endTime).getTime();
      const difference = endDateTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  if (isExpired) {
    return (
      <div className={`countdown-timer expired ${size}`}>
        <div className="countdown-message">
          {t('countdown.expired')}
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className={`countdown-timer ${size}`}>
        {/* Days */}
        <div className="countdown-unit">
          <div className="countdown-number">{formatNumber(timeLeft.days)}</div>
          <div className="countdown-label">{t('countdown.days')}</div>
        </div>

        {/* Hours */}
        <div className="countdown-unit">
          <div className="countdown-number">{formatNumber(timeLeft.hours)}</div>
          <div className="countdown-label">{t('countdown.hours')}</div>
        </div>

        {/* Separator */}
        <div className="countdown-separator">:</div>

        {/* Minutes */}
        <div className="countdown-unit">
          <div className="countdown-number">{formatNumber(timeLeft.minutes)}</div>
          <div className="countdown-label">{t('countdown.minutes')}</div>
        </div>

        {/* Separator */}
        <div className="countdown-separator">:</div>

        {/* Seconds */}
        <div className="countdown-unit">
          <div className="countdown-number">{formatNumber(timeLeft.seconds)}</div>
          <div className="countdown-label">{t('countdown.seconds')}</div>
        </div>
      </div>
      
      <div className="countdown-message">
        {t('countdown.remainsUntilEnd')}
      </div>
    </div>
  );
};

export default CountdownTimer; 
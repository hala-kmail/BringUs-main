import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 47,
    hours: 6,
    minutes: 55,
    seconds: 51
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        const newMinutes = newSeconds < 0 ? prevTime.minutes - 1 : prevTime.minutes;
        const newHours = newMinutes < 0 ? prevTime.hours - 1 : prevTime.hours;
        const newDays = newHours < 0 ? prevTime.days - 1 : prevTime.days;

        return {
          days: newDays >= 0 ? newDays : 0,
          hours: newHours < 0 ? 23 : newHours,
          minutes: newMinutes < 0 ? 59 : newMinutes,
          seconds: newSeconds < 0 ? 59 : newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <div className="announcement-text">
          {t('announcement.text')}
        </div>
        <div className="countdown">
          <span className="countdown-label">{t('announcement.countdown_label')}</span>
          <div className="countdown-timer">
            <div className="countdown-item">
              <span className="countdown-value">{timeLeft.days}</span>
              <span className="countdown-unit">{t('announcement.days')}</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="countdown-unit">{t('announcement.hours')}</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="countdown-unit">{t('announcement.minutes')}</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="countdown-unit">{t('announcement.seconds')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar; 
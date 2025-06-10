import React from 'react';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTwitter, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Newsletter Bar */}
      <div className="footer-newsletter-bar">
        <div className="footer-newsletter-text">
          <h3 className="footer-newsletter-title">{t('footer.newsletter_title', 'اشترك في النشرة البريدية')}</h3>
          <p className="footer-newsletter-desc">{t('footer.newsletter_desc', 'سجّل بريدك ليصلك كل جديد من العروض والخصومات. لا نرسل رسائل مزعجة!')}</p>
        </div>
        <form
          className="footer-newsletter-form"
          onSubmit={e => { e.preventDefault(); alert(t('footer.subscribed', 'تم الاشتراك بنجاح!')); }}
        >
          <input
            type="email"
            placeholder={t('footer.email_placeholder', 'أدخل بريدك الإلكتروني')}
            required
            className="footer-newsletter-input"
          />
          <button
            type="submit"
            className="footer-newsletter-button"
          >
            {t('footer.subscribe', 'اشترك')}
          </button>
        </form>
      </div>
      <hr className="footer-divider" />

      {/* Main Footer Columns */}
      <div className="footer-cols">
        {/* Support */}
        <div className="footer-col-support">
          {/* Phone */}
          <div className="footer-support-row">
            <div className="footer-support-icon-box">
              <FaPhone />
            </div>
            <div>
              <div className="footer-support-label">{t('footer.phone_label', 'Monday-Friday: 08am-9pm')}</div>
              <div className="footer-support-value">0 800 300-353</div>
            </div>
          </div>
          {/* Email */}
          <div className="footer-support-row">
            <div className="footer-support-icon-box">
              <FaEnvelope />
            </div>
            <div>
              <div className="footer-support-label">{t('footer.email_label', 'Need help with your order?')}</div>
              <div className="footer-support-value-email">info@bringus.com</div>
            </div>
          </div>
        </div>
        {/* Links */}
        <div className="footer-col-links">
          <h4 className="footer-col-title">{t('footer.important_links', 'روابط مهمة')}</h4>
          <ul className="footer-links-list">
            <li><a href="/privacy">{t('footer.privacy', 'سياسة الخصوصية')}</a></li>
            <li><a href="/terms">{t('footer.terms', 'الشروط والأحكام')}</a></li>
            <li><a href="/help">{t('footer.help', 'مركز المساعدة')}</a></li>
          </ul>
        </div>
        {/* About */}
        <div className="footer-col-about">
          <h4 className="footer-col-title">{t('footer.about', 'عن المتجر')}</h4>
          <div className="footer-about-desc">
            {t('footer.about_desc', 'متجر إلكتروني تجريبي لعرض المنتجات والشراء بسهولة.')}
          </div>
        </div>
        {/* Social & App */}
        <div className="footer-col-social">
          <h4 className="footer-col-title">{t('footer.follow_us', 'تابعنا')}</h4>
          <div className="footer-social-icons">
            <a href="https://wa.me/123456789" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          </div>
          <div className="footer-soon-text">{t('footer.soon', 'تطبيقاتنا قريبًا')}</div>
        </div>
      </div>
      <hr className="footer-divider" />
      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        &copy; {currentYear} BringUs. {t('footer.rights', 'جميع الحقوق محفوظة.')}
      </div>
    </footer>
  );
};

export default Footer; 


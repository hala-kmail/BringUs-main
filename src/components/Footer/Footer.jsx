import React, { useState } from 'react';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaYoutube, FaLinkedin, FaTiktok, FaTelegram, FaSnapchat, FaPinterest, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAppData } from '../../contexts/AppDataContext';
import TermsModal from './TermsModal';
import './Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const currentYear = new Date().getFullYear();
  const { store } = useAppData();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // الحصول على معلومات التواصل
  const getContactInfo = () => {
    if (!store) return {};
    
    return {
      phone: store.contact?.phone || '',
      email: store.contact?.email || '',
      whatsapp: store.whatsappNumber || '',
      facebook: store.settings?.storeSocials?.facebook || '',
      instagram: store.settings?.storeSocials?.instagram || '',
      twitter: store.settings?.storeSocials?.twitter || '',
      youtube: store.settings?.storeSocials?.youtube || '',
      linkedin: store.settings?.storeSocials?.linkedin || '',
      tiktok: store.settings?.storeSocials?.tiktok || '',
      telegram: store.settings?.storeSocials?.telegram || '',
      snapchat: store.settings?.storeSocials?.snapchat || '',
      pinterest: store.settings?.storeSocials?.pinterest || ''
    };
  };

  // الحصول على اسم المتجر
  const getStoreName = () => {
    if (!store) return 'BringUs';
    return currentLang === 'ar' ? store.nameAr : store.nameEn;
  };

  // الحصول على وصف المتجر
  const getStoreDescription = () => {
    if (!store) {
      return currentLang === 'ar' 
        ? 'متجر إلكتروني تجريبي لعرض المنتجات والشراء بسهولة.'
        : 'Experimental e-commerce store for displaying products and easy shopping.';
    }
    return currentLang === 'ar' ? store.descriptionAr : store.descriptionEn;
  };

  // الحصول على عنوان المتجر
  const getStoreAddress = () => {
    if (!store?.contact?.address) return null;
    
    const address = store.contact.address;
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ');
  };

  // دالة لتنظيف رقم الهاتف للـ WhatsApp
  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const contactInfo = getContactInfo();
  const storeAddress = getStoreAddress();

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
          {contactInfo.phone && (
            <div className="footer-support-row">
              <div className="footer-support-icon-box">
                <FaPhone />
              </div>
              <div>
                <div className="footer-support-label">{t('footer.phone_label', 'Monday-Friday: 08am-9pm')}</div>
                <div className="footer-support-value">
                  <a href={`tel:${contactInfo.phone}`} className="footer-contact-link">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            </div>
          )}
          {/* Email */}
          {contactInfo.email && (
            <div className="footer-support-row">
              <div className="footer-support-icon-box">
                <FaEnvelope />
              </div>
              <div>
                <div className="footer-support-label">{t('footer.email_label', 'Need help with your order?')}</div>
                <div className="footer-support-value-email">
                  <a href={`mailto:${contactInfo.email}`} className="footer-contact-link">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
          )}
          {/* Address */}
          {storeAddress && (
            <div className="footer-support-row">
              <div className="footer-support-icon-box">
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className="footer-support-label">{t('footer.address_label', 'Store Address')}</div>
                <div className="footer-support-value">
                  <span className="footer-contact-link">
                    {storeAddress}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Links */}
        <div className="footer-col-links">
          <h4 className="footer-col-title">{t('footer.important_links', 'روابط مهمة')}</h4>
          <ul className="footer-links-list">
            <li><button 
              className="footer-link-button" 
              onClick={() => setIsTermsModalOpen(true)}
            >
              {t('footer.terms', 'الشروط والأحكام')}
            </button></li>
            {/* <li><a href="/privacy">{t('footer.privacy', 'سياسة الخصوصية')}</a></li> */}
            <li><a href="/help">{t('footer.help', 'مركز المساعدة')}</a></li>
            <li><a href="/about">{t('footer.about', 'عن المتجر')}</a></li>
            <li><a href="/contact">{t('footer.contact', 'اتصل بنا')}</a></li>
          </ul>
        </div>
        {/* About */}
        {/* <div className="footer-col-about">
          <h4 className="footer-col-title">{t('footer.about', 'عن المتجر')}</h4>
          <div className="footer-about-desc">
            {getStoreDescription()}
          </div>
        </div> */}
        {/* Social & App */}
        <div className="footer-col-social">
          <h4 className="footer-col-title">{t('footer.follow_us', 'تابعنا')}</h4>
          <div className="footer-social-icons">
            {contactInfo.whatsapp && (
              <a 
                href={`https://wa.me/${cleanPhoneNumber(contactInfo.whatsapp)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="WhatsApp"
                className="social-icon whatsapp"
              >
                <FaWhatsapp />
              </a>
            )}
            {contactInfo.facebook && (
              <a 
                href={contactInfo.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Facebook"
                className="social-icon facebook"
              >
                <FaFacebookF />
              </a>
            )}
            {contactInfo.instagram && (
              <a 
                href={contactInfo.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram"
                className="social-icon instagram"
              >
                <FaInstagram />
              </a>
            )}
            {contactInfo.twitter && (
              <a 
                href={contactInfo.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Twitter"
                className="social-icon twitter"
              >
                <FaTwitter />
              </a>
            )}
            {contactInfo.youtube && (
              <a 
                href={contactInfo.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="YouTube"
                className="social-icon youtube"
              >
                <FaYoutube />
              </a>
            )}
            {contactInfo.linkedin && (
              <a 
                href={contactInfo.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="LinkedIn"
                className="social-icon linkedin"
              >
                <FaLinkedin />
              </a>
            )}
            {contactInfo.tiktok && (
              <a 
                href={contactInfo.tiktok} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="TikTok"
                className="social-icon tiktok"
              >
                <FaTiktok />
              </a>
            )}
            {contactInfo.telegram && (
              <a 
                href={contactInfo.telegram.startsWith('https://') ? contactInfo.telegram : `https://t.me/${contactInfo.telegram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Telegram"
                className="social-icon telegram"
              >
                <FaTelegram />
              </a>
            )}
            {contactInfo.snapchat && (
              <a 
                href={`https://snapchat.com/add/${contactInfo.snapchat}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Snapchat"
                className="social-icon snapchat"
              >
                <FaSnapchat />
              </a>
            )}
            {contactInfo.pinterest && (
              <a 
                href={contactInfo.pinterest} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Pinterest"
                className="social-icon pinterest"
              >
                <FaPinterest />
              </a>
            )}
          </div>
          <div className="footer-soon-text">{t('footer.soon', 'تطبيقاتنا قريبًا')}</div>
        </div>
      </div>
      <hr className="footer-divider" />
      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        &copy; {currentYear} {getStoreName()}. {t('footer.rights', 'جميع الحقوق محفوظة.')}
      </div>
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </footer>
  );
};

export default Footer; 


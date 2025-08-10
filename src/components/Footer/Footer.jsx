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
  
  // Get store data from localStorage as fallback
  const getStoreFromStorage = () => {
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        return JSON.parse(storedStore);
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    return null;
  };
  
  const storeData = store || getStoreFromStorage();

  // الحصول على معلومات التواصل
  const getContactInfo = () => {
    if (!storeData) return {};
    
    return {
      phone: storeData.contact?.phone || '',
      email: storeData.contact?.email || '',
      whatsapp: storeData.whatsappNumber || '',
      facebook: storeData.settings?.storeSocials?.facebook || '',
      instagram: storeData.settings?.storeSocials?.instagram || '',
      twitter: storeData.settings?.storeSocials?.twitter || '',
      youtube: storeData.settings?.storeSocials?.youtube || '',
      linkedin: storeData.settings?.storeSocials?.linkedin || '',
      tiktok: storeData.settings?.storeSocials?.tiktok || '',
      telegram: storeData.settings?.storeSocials?.telegram || '',
      snapchat: storeData.settings?.storeSocials?.snapchat || '',
      pinterest: storeData.settings?.storeSocials?.pinterest || ''
    };
  };

  // الحصول على اسم المتجر
  const getStoreName = () => {
    if (!storeData) return 'BringUs';
    return currentLang === 'ar' ? storeData.nameAr : storeData.nameEn;
  };

  // الحصول على وصف المتجر
  const getStoreDescription = () => {
    if (!storeData) {
      return currentLang === 'ar' 
        ? 'متجر إلكتروني تجريبي لعرض المنتجات والشراء بسهولة.'
        : 'Experimental e-commerce store for displaying products and easy shopping.';
    }
    return currentLang === 'ar' ? storeData.descriptionAr : storeData.descriptionEn;
  };

  // الحصول على عنوان المتجر
  const getStoreAddress = () => {
    if (!storeData?.contact?.address) return null;
    
    const address = storeData.contact.address;
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
          {/* WhatsApp */}
          {contactInfo.whatsapp && (
            <div className="footer-support-row">
              <div className="footer-support-icon-box whatsapp-icon">
                <FaPhone />
              </div>
              <div>
                <div className="footer-support-label">{t('footer.whatsapp_label', 'تواصل معنا عبر واتساب')}</div>
                <div className="footer-support-value">
                  <a 
                    href={`https://wa.me/${cleanPhoneNumber(contactInfo.whatsapp)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="footer-contact-link whatsapp-link"
                  >
                    {contactInfo.whatsapp}
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
            {/* <li><a href="/help">{t('footer.help', 'مركز المساعدة')}</a></li>
            <li><a href="/about">{t('footer.about', 'عن المتجر')}</a></li>
            <li><a href="/contact">{t('footer.contact', 'اتصل بنا')}</a></li> */}
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


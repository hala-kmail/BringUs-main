import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useAppData } from '../../contexts/AppDataContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import UserOrders from '../../components/Profile/UserOrders';
import './Orders.css';

const Orders = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const currentLang = i18n.language;
  const { user } = useAppData();

  // // التحقق من تسجيل الدخول
  // React.useEffect(() => {
  //   if (!user || user === 'No user' || user === null) {
  //     console.log('No user found, redirecting to login');
  //     navigate('/login');
  //   }
  // }, [user, navigate]);

  // if (!user || user === 'No user' || user === null) {
  //   return null;
  // }

  return (
    <div className="orders-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <SecondaryNavbar />
      
      <div className="orders-page-container">
        {/* Header Section */}
        

        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
      <span onClick={() => navigate('/')}>{t('product_detail.home')}</span>
     
          <span className="breadcrumb-separator">›</span>
          <span
            onClick={() => navigate('/orders')}
            className={ 'breadcrumb-current' }
            style={{ cursor: 'default' }}
          >
            {currentLang === 'ar' ? 'طلباتي' : 'My Orders'}
          </span>
     
    </nav>
       

        {/* Orders Content */}
        <div className="orders-content">
          <UserOrders />
        </div>

        
      </div>
    </div>
  );
};

export default Orders; 
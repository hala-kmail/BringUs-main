import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import UserOrders from '../../components/Profile/UserOrders';
import './Orders.css';

const Orders = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const { user } = useAppData();

  // التحقق من تسجيل الدخول
  React.useEffect(() => {
    if (!user || user === 'No user' || user === null) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user === 'No user' || user === null) {
    return null;
  }

  return (
    <div className="orders-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <SecondaryNavbar />
      
      <div className="orders-page-container">
        {/* Header Section */}
        

        {/* Breadcrumb */}
        <div className="orders-breadcrumb">
          <button 
            className="breadcrumb-item"
            onClick={() => navigate('/')}
          >
            {currentLang === 'ar' ? 'الرئيسية' : 'Home'}
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">
            {currentLang === 'ar' ? 'طلباتي' : 'My Orders'}
          </span>
        </div>

        {/* Orders Content */}
        <div className="orders-content">
          <UserOrders />
        </div>

        
      </div>
    </div>
  );
};

export default Orders; 
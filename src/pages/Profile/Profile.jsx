import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import useProfile from '../../hooks/useProfile';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './Profile.css';
import { formatPrice } from '../../utils/currencyUtils';
const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const { user, store, updateUser } = useAppData();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const { updateProfile, getProfile, loading, error } = useProfile();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user && user !== 'No user') {
      // Get the first address or use empty address
      const userAddress = user.addresses && user.addresses.length > 0 
        ? user.addresses[0] 
        : {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          };

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: userAddress.street || '',
          city: userAddress.city || '',
          state: userAddress.state || '',
          zipCode: userAddress.zipCode || '',
          country: userAddress.country || ''
        }
      });
    }
  }, [user]);

  // Load fresh user data when component mounts
  useEffect(() => {
    const loadFreshUserData = async () => {
      if (user && user !== 'No user') {
        try {
          const freshUserData = await getProfile();
          if (freshUserData && freshUserData._id) {
            updateUser(freshUserData);
            console.log('Fresh user data loaded in Profile component:', freshUserData);
          }
        } catch (error) {
          console.error('Error loading fresh user data in Profile component:', error);
        }
      }
    };

    loadFreshUserData();
  }, []); // Remove dependencies to prevent infinite loop

  // Redirect to login if no user
  useEffect(() => {
    if (!user || user === 'No user' || user === null) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveMessage('');
      
      // Prepare complete profile data including addresses
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addresses: [
          {
            type: 'home',
            street: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            zipCode: formData.address.zipCode,
            country: formData.address.country,
            isDefault: true
          }
        ]
      };

      // Call API to update profile
      const updatedUser = await updateProfile(profileData);
      
      // Only update user if we got valid data back
      if (updatedUser && updatedUser._id) {
        // Update local state with new user data
        updateUser(updatedUser);
        
        // Refresh form data with the updated user data
        const userAddress = updatedUser.addresses && updatedUser.addresses.length > 0 
          ? updatedUser.addresses[0] 
          : {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            };

        setFormData({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          address: {
            street: userAddress.street || '',
            city: userAddress.city || '',
            state: userAddress.state || '',
            zipCode: userAddress.zipCode || '',
            country: userAddress.country || ''
          }
        });
        
        setIsEditing(false);
        setSaveMessage(t('profile.profile_updated_successfully') || 'Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      } else {
        // If no user data returned, just show success message
        console.log('No user data returned from update, but update was successful');
        
        setIsEditing(false);
        setSaveMessage(t('profile.profile_updated_successfully') || 'Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage(error.message || 'Failed to update profile');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to home
    navigate('/');
    // Reload page to reset app state
    window.location.reload();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!user || user === 'No user' || user === null) {
    console.log('Profile: No user found, not rendering');
    return null;
  }

  return (
    <div className="profile-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <SecondaryNavbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="profile-content">
          {/* Profile Sidebar */}
          <div className="profile-sidebar">
            <div className="user-info-card">
              <div className="user-avatar">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.firstName} />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                )}
              </div>
              <div className="user-details">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
                <p className="member-since">
                  {t('profile.member_since')}: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="profile-stats">
              <div 
                className="stat-item clickable" 
                onClick={() => navigate('/wishlist')}
                title={t('profile.click_to_view') + ' ' + t('profile.wishlist')}
              >
                <div className="stat-number">{wishlistItems.length}</div>
                <div className="stat-label">
                  {t('profile.wishlist_items')}
                  {/* <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg> */}
                </div>
              </div>
              <div 
                className="stat-item clickable" 
                onClick={() => navigate('/cart')}
                title={t('profile.click_to_view') + ' ' + t('profile.cart_items')}
              >
                <div className="stat-number">{cartItems.length}</div>
                <div className="stat-label">
                  {t('profile.cart_items')}
                  {/* <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg> */}
                </div>
              </div>
            </div>

            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('profile.personal_info')}
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => navigate('/orders')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('profile.orders')}
              </button>
              {/* <button 
                className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t('profile.wishlist')}
              </button> */}
              {/* <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('profile.settings')}
              </button> */}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('profile.logout')}
            </button>
          </div>

          {/* Profile Main Content */}
          <div className="profile-main">
            {activeTab === 'profile' && (
              <div className="profile-tab">
                <div className="tab-header">
                  <h2>{t('profile.personal_info')}</h2>
                  <button 
                    className={`edit-btn ${isEditing ? 'save' : ''}`}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : isEditing ? (
                      t('profile.save')
                    ) : (
                      t('profile.edit')
                    )}
                  </button>
                </div>

                <div className="profile-form">
                  {/* Success/Error Messages */}
                  {saveMessage && (
                    <div className={`message ${error ? 'error' : 'success'}`}>
                      {saveMessage}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.first_name')}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.last_name')}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing || loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={true} // Email cannot be changed
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing || loading}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>{t('profile.address')}</h3>
                    <div className="form-group">
                      <label>{t('profile.street')}</label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('profile.city')}</label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('profile.state')}</label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('profile.zip_code')}</label>
                        <input
                          type="text"
                          value={formData.address.zipCode}
                          onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('profile.country')}</label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) => handleInputChange('address.country', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {activeTab === 'wishlist' && (
              <div className="profile-tab">
                <div className="tab-header">
                  <h2>{t('profile.wishlist')}</h2>
                </div>
                <div className="wishlist-content">
                  {wishlistItems.length > 0 ? (
                    <div className="wishlist-grid">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="wishlist-item">
                          <img src={item.image} alt={item.name} />
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p className="price">{formatPrice(item.price, store?.settings?.currency || 'ILS')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3>{t('profile.no_wishlist')}</h3>
                      <p>{t('profile.no_wishlist_desc')}</p>
                      <button className="primary-btn" onClick={() => navigate('/shop')}>
                        {t('profile.start_shopping')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="profile-tab">
                <div className="tab-header">
                  <h2>{t('profile.settings')}</h2>
                </div>
                <div className="settings-content">
                  <div className="settings-section">
                    <h3>{t('profile.notifications')}</h3>
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>{t('profile.email_notifications')}</h4>
                        <p>{t('profile.email_notifications_desc')}</p>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>{t('profile.order_updates')}</h4>
                        <p>{t('profile.order_updates_desc')}</p>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>{t('profile.privacy')}</h3>
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>{t('profile.profile_visibility')}</h4>
                        <p>{t('profile.profile_visibility_desc')}</p>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useUserOrders from '../../hooks/useUserOrders';
import { formatPrice } from '../../utils/currencyUtils';
import { useAppData } from '../../contexts/AppDataContext';
import Toast from '../Toast/Toast';
import './UserOrders.css';

const UserOrders = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const { store } = useAppData();
  
  const {
    orders,
    loading,
    error,
    pagination,
    getUserOrders,
    getOrderDetails,
    cancelOrder
  } = useUserOrders();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // جلب الطلبات عند تحميل المكون
  useEffect(() => {
    getUserOrders(1, 10, selectedStatus);
  }, [getUserOrders, selectedStatus]);

  // دالة لتغيير حالة الفلتر
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  // دالة لعرض تفاصيل الطلب
  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // دالة لإلغاء الطلب
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      await cancelOrder(orderToCancel.orderNumber, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setOrderToCancel(null);
      
      // عرض رسالة نجاح
      setToast({
        show: true,
        message: currentLang === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      // عرض رسالة خطأ
      setToast({
        show: true,
        message: currentLang === 'ar' ? 'حدث خطأ أثناء إلغاء الطلب' : 'Error cancelling order',
        type: 'error'
      });
    }
  };

  // دالة لفتح نافذة إلغاء الطلب
  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  // دالة لتغيير الصفحة
  const handlePageChange = (page) => {
    getUserOrders(page, pagination.itemsPerPage, selectedStatus);
  };

  // دالة للحصول على حالة الطلب المترجمة
  const getStatusText = (status) => {
    const statusMap = {
      pending: currentLang === 'ar' ? 'قيد المراجعة' : 'Pending',
      confirmed: currentLang === 'ar' ? 'مؤكد' : 'Confirmed',
      processing: currentLang === 'ar' ? 'قيد المعالجة' : 'Processing',
      shipped: currentLang === 'ar' ? 'تم الشحن' : 'Shipped',
      delivered: currentLang === 'ar' ? 'تم التوصيل' : 'Delivered',
      cancelled: currentLang === 'ar' ? 'ملغي' : 'Cancelled',
      refunded: currentLang === 'ar' ? 'مسترد' : 'Refunded'
    };
    return statusMap[status] || status;
  };

  // دالة للحصول على لون حالة الطلب
  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  };

  // دالة للتحقق من إمكانية إلغاء الطلب
  const canCancelOrder = (order) => {
    // يمكن إلغاء الطلب فقط إذا كان في حالة pending أو confirmed
    // ولا يمكن إلغاء الطلبات الملغية أو المكتملة
    return ['pending', 'confirmed'].includes(order.status);
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="user-orders-loading">
        <div className="loading-spinner"></div>
        <p>{currentLang === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-orders-error">
        <p>{error}</p>
        <button onClick={() => getUserOrders(1, 10, selectedStatus)}>
          {currentLang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="user-orders-container">
      {/* عنوان القسم */}
      <div className="orders-header">
        <h2>{currentLang === 'ar' ? 'طلباتي' : 'My Orders'}</h2>
        <p>{currentLang === 'ar' ? `إجمالي الطلبات: ${pagination.totalItems}` : `Total Orders: ${pagination.totalItems}`}</p>
      </div>

      {/* فلاتر الحالة */}
      <div className="status-filters">
        <button
          className={`filter-btn ${selectedStatus === '' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('')}
        >
          {currentLang === 'ar' ? 'الكل' : 'All'}
        </button>
        <button
          className={`filter-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('pending')}
        >
          {currentLang === 'ar' ? 'قيد المراجعة' : 'Pending'}
        </button>
        <button
          className={`filter-btn ${selectedStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('confirmed')}
        >
          {currentLang === 'ar' ? 'مؤكد' : 'Confirmed'}
        </button>
        <button
          className={`filter-btn ${selectedStatus === 'shipped' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('shipped')}
        >
          {currentLang === 'ar' ? 'تم الشحن' : 'Shipped'}
        </button>
        <button
          className={`filter-btn ${selectedStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('delivered')}
        >
          {currentLang === 'ar' ? 'تم التوصيل' : 'Delivered'}
        </button>
        <button
          className={`filter-btn ${selectedStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('cancelled')}
        >
          {currentLang === 'ar' ? 'ملغي' : 'Cancelled'}
        </button>
      </div>

      {/* قائمة الطلبات */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>{currentLang === 'ar' ? 'لا توجد طلبات' : 'No Orders Found'}</h3>
            <p>{currentLang === 'ar' ? 'لم تقم بإنشاء أي طلبات بعد' : 'You haven\'t placed any orders yet'}</p>
            <button 
              className="start-shopping-btn"
              onClick={() => navigate('/shop')}
            >
              {currentLang === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderNumber} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <div className="order-number-date">
                    <h3 className="order-number">#{order.orderNumber}</h3>
                    <span className="order-date">{formatDate(order.date)}</span>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div className="order-total">
                  <span className="total-amount">
                    {formatPrice(order.price, store?.settings?.currency || 'ILS')}
                  </span>
                </div>
              </div>

              <div className="order-items-preview">
                <div className="items-count">
                  {currentLang === 'ar' ? `${order.itemsCount} منتج` : `${order.itemsCount} items`}
                </div>
                <div className="items-images">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img 
                      key={index}
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="item-image"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-actions">
                <button
                  className="view-details-btn"
                  onClick={() => handleViewOrderDetails(order.orderNumber)}
                >
                  {currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </button>
                {canCancelOrder(order) && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => openCancelModal(order)}
                  >
                    {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* التنقل بين الصفحات */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            {currentLang === 'ar' ? 'السابق' : 'Previous'}
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${page === pagination.currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="page-btn"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            {currentLang === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {/* نافذة تفاصيل الطلب */}
      {showOrderDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentLang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-info">
                <div className="detail-row">
                  <span className="detail-label">{currentLang === 'ar' ? 'رقم الطلب:' : 'Order Number:'}</span>
                  <span className="detail-value">#{selectedOrder.orderNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{currentLang === 'ar' ? 'التاريخ:' : 'Date:'}</span>
                  <span className="detail-value">{formatDate(selectedOrder.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{currentLang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                  <span 
                    className="detail-value status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{currentLang === 'ar' ? 'المجموع:' : 'Total:'}</span>
                  <span className="detail-value">
                    {formatPrice(selectedOrder.price, store?.settings?.currency || 'ILS')}
                  </span>
                </div>
              </div>

              <div className="order-items-details">
                <h4>{currentLang === 'ar' ? 'المنتجات:' : 'Products:'}</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-info">
                      <h5>{item.name}</h5>
                      <p>{currentLang === 'ar' ? `الكمية: ${item.quantity}` : `Quantity: ${item.quantity}`}</p>
                      <p>{formatPrice(item.pricePerUnit, store?.settings?.currency || 'ILS')}</p>
                    </div>
                    <div className="item-total">
                      {formatPrice(item.total, store?.settings?.currency || 'ILS')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إلغاء الطلب */}
      {showCancelModal && orderToCancel && (
        <div className="cancel-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentLang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>{currentLang === 'ar' ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?'}</p>
              <p className="order-number">#{orderToCancel.orderNumber}</p>
              
              <div className="cancel-reason">
                <label>{currentLang === 'ar' ? 'سبب الإلغاء (اختياري):' : 'Cancellation reason (optional):'}</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={currentLang === 'ar' ? 'اكتب سبب الإلغاء هنا...' : 'Write cancellation reason here...'}
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowCancelModal(false)}
              >
                {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                className="confirm-cancel-btn"
                onClick={handleCancelOrder}
                disabled={loading}
              >
                {loading ? (currentLang === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...') : (currentLang === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={4000}
      />
    </div>
  );
};

export default UserOrders; 
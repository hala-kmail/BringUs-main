import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import useUserOrders from '../../hooks/useUserOrders';
import { formatPrice } from '../../utils/currencyUtils';
import { getPriceByUserRole } from '../../utils/productUtils';
import { useAppData } from '../../contexts/AppDataContext';
import Toast from '../Toast/Toast';
import './UserOrders.css';
const UserOrders = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const currentLang = i18n.language;
  const { store, user } = useAppData();
  
  const {
    orders,
    loading,
    error,
    pagination,
    getUserOrders,
    filterOrdersByStatus,
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
    getUserOrders(1, 10);
  }, [getUserOrders]);

  // دالة لتغيير حالة الفلتر
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    // فلترة الطلبات في الفرونت إند
    filterOrdersByStatus(status);
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
    getUserOrders(page, pagination.itemsPerPage);
  };

  // دالة للحصول على حالة الطلب المترجمة
  const getStatusText = (status) => {
    const statusMap = {
      pending: currentLang === 'ar' ? 'قيد المراجعة' : 'Pending',
      
      shipped: currentLang === 'ar' ? 'تم الشحن' : 'Shipped',
      delivered: currentLang === 'ar' ? 'تم التوصيل' : 'Delivered',
      cancelled: currentLang === 'ar' ? 'ملغي' : 'Cancelled',
     
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
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory' // استخدام التقويم الميلادي
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
            <div key={order.orderNumber} className="order-card" onClick={() => handleViewOrderDetails(order.orderNumber)}>
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
                    {formatPrice(
                      (order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0) + 
                      (order.deliveryArea?.price || 0), 
                      order.currency || store?.settings?.currency || 'USD'
                    )}
                  </span>
                </div>
              </div>

              <div className="order-items-preview">
                <div className="items-info">
                  <div className="items-count">
                    {currentLang === 'ar' ? `${order.itemsCount} منتج` : `${order.itemsCount} items`}
                  </div>
                  {order.deliveryArea && (
                    <div className="delivery-area">
                      <span className="delivery-label">
                        {currentLang === 'ar' ? 'منطقة التوصيل:' : 'Delivery Area:'}
                      </span>
                      <span className="delivery-name">
                        {currentLang === 'ar' ? order.deliveryArea.locationAr : order.deliveryArea.locationEn}
                      </span>
                    </div>
                  )}
                </div>
                <div className="items-images">
                  {order.items.slice(0, 3).map((item, index) => (
                                          <img 
                        key={index}
                        src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMCAxNy4yMzkgMjIuMjM5IDE1IDI1IDE1SDU1QzU3Ljc2MSAxNSA2MCAxNy4yMzkgNjAgMjBWNjBDNjAgNjIuNzYxIDU3Ljc2MSA2NSA1NSA2NUgyNUMyMi4yMzkgNjUgMjAgNjIuNzYxIDIwIDYwVjIwWiIgZmlsbD0iIzlDQTBBNiIvPgo8cGF0aCBkPSJNMzAgMzBDMzAgMjguMzQzIDMxLjM0MyAyNyAzMyAyN0g0N0M0OC42NTcgMjcgNTAgMjguMzQzIDUwIDMwVjUwQzUwIDUxLjY1NyA0OC42NTcgNTMgNDcgNTNIMzNDMzEuMzQzIDUzIDMwIDUxLjY1NyAzMCA1MFYzMFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg=='} 
                        alt={item.name}
                        className="item-image"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMCAxNy4yMzkgMjIuMjM5IDE1IDI1IDE1SDU1QzU3Ljc2MSAxNSA2MCAxNy4yMzkgNjAgMjBWNjBDNjAgNjIuNzYxIDU3Ljc2MSA2NSA1NSA2NUgyNUMyMi4yMzkgNjUgMjAgNjIuNzYxIDIwIDYwVjIwWiIgZmlsbD0iIzlDQTBBNiIvPgo8cGF0aCBkPSJNMzAgMzBDMzAgMjguMzQzIDMxLjM0MyAyNyAzMyAyN0g0N0M0OC42NTcgMjcgNTAgMjguMzQzIDUwIDMwVjUwQzUwIDUxLjY1NyA0OC42NTcgNTMgNDcgNTNIMzNDMzEuMzQzIDUzIDMwIDUxLjY1NyAzMCA1MFYzMFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==';
                        }}
                      />
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
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
                
                                 {/* معلومات التوصيل */}
                 {selectedOrder.deliveryArea && (
                   <div className="detail-row">
                     <span className="detail-label">{currentLang === 'ar' ? 'منطقة التوصيل:' : 'Delivery Area:'}</span>
                     <span className="detail-value">
                       {currentLang === 'ar' ? selectedOrder.deliveryArea.locationAr : selectedOrder.deliveryArea.locationEn}
                     </span>
                   </div>
                 )}
                 
                 {selectedOrder.deliveryArea && (
                   <div className="detail-row">
                     <span className="detail-label">{currentLang === 'ar' ? 'مدة التوصيل المتوقعة:' : 'Estimated Delivery:'}</span>
                     <span className="detail-value">
                       {selectedOrder.deliveryArea.estimatedDays} {currentLang === 'ar' ? 'يوم' : 'days'}
                     </span>
                   </div>
                 )}
                 
                 {/* تفاصيل الأسعار */}
                 <div className="detail-row">
                   <span className="detail-label">{currentLang === 'ar' ? 'مجموع المنتجات:' : 'Products Total:'}</span>
                   <span className="detail-value">
                     {formatPrice(
                       selectedOrder.pricing.subtotal, store?.settings?.currency || 'USD'
                     )}
                   </span>
                 </div>
                 {selectedOrder.pricing.discount > 0 && (
                   <div className="detail-row">
                   <span className="detail-label">{currentLang === 'ar' ? 'خصم التاجر الجملة:' : 'Wholesaler Discount:'}</span>
                   <span className="detail-value">
                     {selectedOrder.pricing.discount}%(-{formatPrice(selectedOrder.pricing.subtotal * selectedOrder.pricing.discount / 100, store?.settings?.currency || 'USD')})
                   </span>
                 </div>
                 )}
                 {selectedOrder.deliveryArea && selectedOrder.deliveryArea.price > 0 && (
                   <div className="detail-row">
                     <span className="detail-label">{currentLang === 'ar' ? 'رسوم التوصيل:' : 'Shipping Cost:'}</span>
                     <span className="detail-value">
                       {formatPrice(selectedOrder.deliveryArea.price, selectedOrder.currency || store?.settings?.currency || 'USD')}
                     </span>
                   </div>
                 )}
                 
                 <div className="detail-row total-row">
                   <span className="detail-label">{currentLang === 'ar' ? 'المجموع النهائي:' : 'Final Total:'}</span>
                   <span className="detail-value total-amount">
                     {formatPrice(
                       (selectedOrder.price)|| store?.settings?.currency || 'USD'
                     )}
                   </span>
                 </div>
              </div>

              <div className="order-items-details">
                <h4>{currentLang === 'ar' ? 'المنتجات:' : 'Products:'}</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <img 
                      src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMCAxNy4yMzkgMjIuMjM5IDE1IDI1IDE1SDU1QzU3Ljc2MSAxNSA2MCAxNy4yMzkgNjAgMjBWNjBDNjAgNjIuNzYxIDU3Ljc2MSA2NSA1NSA2NUgyNUMyMi4yMzkgNjUgMjAgNjIuNzYxIDIwIDYwVjIwWiIgZmlsbD0iIzlDQTBBNiIvPgo8cGF0aCBkPSJNMzAgMzBDMzAgMjguMzQzIDMxLjM0MyAyNyAzMyAyN0g0N0M0OC42NTcgMjcgNTAgMjguMzQzIDUwIDMwVjUwQzUwIDUxLjY1NyA0OC42NTcgNTMgNDcgNTNIMzNDMzEuMzQzIDUzIDMwIDUxLjY1NyAzMCA1MFYzMFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg=='} 
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMCAxNy4yMzkgMjIuMjM5IDE1IDI1IDE1SDU1QzU3Ljc2MSAxNSA2MCAxNy4yMzkgNjAgMjBWNjBDNjAgNjIuNzYxIDU3Ljc2MSA2NSA1NSA2NUgyNUMyMi4yMzkgNjUgMjAgNjIuNzYxIDIwIDYwVjIwWiIgZmlsbD0iIzlDQTBBNiIvPgo8cGF0aCBkPSJNMzAgMzBDMzAgMjguMzQzIDMxLjM0MyAyNyAzMyAyN0g0N0M0OC42NTcgMjcgNTAgMjguMzQzIDUwIDMwVjUwQzUwIDUxLjY1NyA0OC42NTcgNTMgNDcgNTNIMzNDMzEuMzQzIDUzIDMwIDUxLjY1NyAzMCA1MFYzMFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==';
                      }}
                    />
                                         <div className="item-info">
                       <h5>{currentLang === 'ar' ? item.productSnapshot.nameAr : item.productSnapshot.nameEn}</h5>
                       <p className="quantity">{currentLang === 'ar' ? `الكمية: ${item.quantity}` : `Quantity: ${item.quantity}`}</p>
                       
                       {/* عرض الألوان المحددة */}
                       {item.selectedColors && item.selectedColors.length > 0 && (
                         <div className="item-colors">
                           <span className="item-colors-label">
                             {currentLang === 'ar' ? 'اللون:' : 'Color:'}
                           </span>
                           {item.selectedColors.map((color, colorIndex) => (
                             <span key={colorIndex} className="color-preview" style={{ backgroundColor: color.split('+')[0] }}>
                               {/* {color.split('+').length > 1 && (
                                
                               )} */}
                             </span>
                           ))}
                         </div>
                       )}
                       
                       {/* عرض المواصفات المحددة */}
                       {item.selectedSpecifications && item.selectedSpecifications.length > 0 && (
                         <div className="item-specifications">
                           {item.selectedSpecifications.map((spec, specIndex) => (
                             <span key={specIndex} className="specification-tag">
                               {currentLang === 'ar' ? `${spec.titleAr}: ${spec.valueAr}` : `${spec.titleEn}: ${spec.valueEn}`}
                             </span>
                           ))}
                         </div>
                       )}
                       
                       <p className="item-price">
                         {formatPrice(
                           getPriceByUserRole({ 
                             compareAtPrice: item.pricePerUnit,
                             finalPrice: item.pricePerUnit 
                           }), 
                           selectedOrder.currency || store?.settings?.currency || 'USD'
                         )} 
                         {currentLang === 'ar' ? ' لكل قطعة' : ' per unit'}
                       </p>
                     </div>
                     <div className="item-total">
                       <span className="total-amount">
                         {formatPrice(
                           getPriceByUserRole({ 
                             compareAtPrice: item.pricePerUnit,
                             finalPrice: item.pricePerUnit 
                           }) * item.quantity,
                           selectedOrder.currency || store?.settings?.currency || 'USD'
                         )}
                       </span>
                       <span className="total-label">
                         {currentLang === 'ar' ? 'المجموع' : 'Total'}
                       </span>
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
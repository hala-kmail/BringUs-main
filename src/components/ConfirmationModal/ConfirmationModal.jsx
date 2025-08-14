import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 19H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M9.09 9A3 3 0 0 1 12 6A3 3 0 0 1 12 12A3 3 0 0 1 9.09 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 20C17 16.6863 14.7614 14 12 14C9.23858 14 7 16.6863 7 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'danger':
        return 'modal-icon-danger';
      case 'warning':
        return 'modal-icon-warning';
      case 'info':
        return 'modal-icon-info';
      default:
        return 'modal-icon-default';
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-modal">
        <div className="modal-content">
          <div className={`modal-icon ${getIconClass()}`}>
            {getIcon()}
          </div>
          
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
          
          <div className="modal-actions">
            <button 
              className="modal-btn modal-btn-cancel" 
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className={`modal-btn modal-btn-confirm modal-btn-${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 
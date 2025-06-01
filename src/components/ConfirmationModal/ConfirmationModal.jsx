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
        return '🗑️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
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
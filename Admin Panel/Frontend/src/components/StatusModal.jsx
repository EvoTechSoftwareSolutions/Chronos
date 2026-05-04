import React from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import '../styles/StatusModal.css';

export default function StatusModal() {
  const modal = useModal();
  
  if (!modal) return null;
  
  const { modalConfig, closeModal } = modal;
  if (!modalConfig) return null;
  
  const { isOpen, type, title, message, onConfirm, onCancel } = modalConfig;

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <Check size={40} />;
      case 'error': return <X size={40} />;
      case 'confirm': return <AlertTriangle size={40} />;
      default: return <Info size={40} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="status-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-icn" onClick={closeModal}><X size={20} /></button>
        
        <div className="modal-icon-wrap">
          {getIcon()}
        </div>

        <h2>{title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification')}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          {type === 'confirm' ? (
            <>
              <button className="modal-btn secondary" onClick={handleCancel}>Cancel</button>
              <button className="modal-btn primary" onClick={handleConfirm}>Confirm</button>
            </>
          ) : (
            <button className="modal-btn primary" onClick={closeModal}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

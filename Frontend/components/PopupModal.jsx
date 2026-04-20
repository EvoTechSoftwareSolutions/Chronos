import React from 'react';
import { CheckCircle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { usePopup } from '../context/PopupContext';

const PopupModal = () => {
  const { popup, closePopup } = usePopup();
  const { show, title, message, type, onConfirm, onCancel } = popup;

  if (!show) return null;

  const isConfirm = type === 'confirm';
  const isWarning = type === 'warning';
  const isError = type === 'error';

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="absolute top-6 right-6 text-gray-500 hover:text-[#D4AF37] transition-all cursor-pointer z-50" onClick={closePopup}>
          <X size={26} />
        </button>
        
        <div className="popup-header">
           {type === 'success' && <CheckCircle className="text-[#D4AF37]" size={64} strokeWidth={1} />}
           {(isError || isWarning) && <AlertCircle className={isError ? "text-red-500" : "text-[#D4AF37]"} size={64} strokeWidth={1} />}
           {isConfirm && <HelpCircle className="text-[#D4AF37]" size={64} strokeWidth={1} />}
        </div>
        
        <h3 className="popup-title">{title}</h3>
        <p className="popup-message">{message}</p>
        
        <div className="popup-actions">
           {isConfirm && (
             <button className="popup-btn-secondary" onClick={onCancel || closePopup}>
                Cancel
             </button>
           )}
           <button 
             className="popup-btn-primary" 
             onClick={onConfirm || closePopup}
             style={isError ? { background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' } : {}}
           >
             {isConfirm ? 'Proceed' : 'OK'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;

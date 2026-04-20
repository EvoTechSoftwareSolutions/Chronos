import React, { createContext, useContext, useState, useCallback } from 'react';

const PopupContext = createContext();

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopup must be used within a PopupProvider');
  return context;
};

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success', // 'success', 'error', 'confirm', 'warning'
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback((title, message, type = 'success', onConfirm = null) => {
    console.log('[PopupSystem] Showing Alert:', { title, message, type });
    setPopup({
      show: true,
      title,
      message,
      type,
      onConfirm: () => {
        console.log('[PopupSystem] Alert Dismissed');
        setPopup(prev => ({ ...prev, show: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: null
    });
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    console.log('[PopupSystem] Showing Confirm:', { title, message });
    setPopup({
      show: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        console.log('[PopupSystem] Confirm Proceed');
        if (onConfirm) onConfirm();
        setPopup(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        console.log('[PopupSystem] Confirm Cancelled');
        if (onCancel) onCancel();
        setPopup(prev => ({ ...prev, show: false }));
      }
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <PopupContext.Provider value={{ popup, showAlert, showConfirm, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
};

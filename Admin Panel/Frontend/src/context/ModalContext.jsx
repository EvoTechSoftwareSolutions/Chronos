import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success', // success, confirm, error
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showModal = ({ type = 'success', title, message, onConfirm, onCancel }) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, closeModal, modalConfig }}>
      {children}
    </ModalContext.Provider>
  );
};

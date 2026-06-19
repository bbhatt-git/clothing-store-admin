'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal, { ModalType } from '@/components/Modal';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  duration?: number;
}

interface ModalContextType {
  showModal: (type: ModalType, title: string, message: string, duration?: number) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showModal = (type: ModalType, title: string, message: string, duration?: number) => {
    setModal({ isOpen: true, type, title, message, duration });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={hideModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        duration={modal.duration}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
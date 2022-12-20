import { createContext, useContext } from 'react';

export interface Modal {
  elem: React.ReactNode;
  show: (elem: React.ReactNode) => void;
  close: () => void;
}

export const ModalContext = createContext<Modal>({
  elem: null,
  show: () => null,
  close: () => null,
});
export const ModalProvider = ModalContext.Provider;
export const useModal = () => useContext(ModalContext);

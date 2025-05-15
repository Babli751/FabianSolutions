// context/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning'; 
}

interface NotificationContextProps {
  notification: Notification;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  closeNotification: () => void;
}


const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotificationState] = useState<Notification>({
    isOpen: false,
    message: '',
    type: 'success',
  });
  
  const setNotification = ({ message, type }: { message: string; type: 'success' | 'info' | 'error' | 'warning' }) => {
    setNotificationState({ isOpen: true, message, type });
  };
  
  const closeNotification = () => {
    setNotificationState({ isOpen: false, message: '', type: 'success' });
  };
  

  return (
    <NotificationContext.Provider value={{ notification, setNotification, closeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

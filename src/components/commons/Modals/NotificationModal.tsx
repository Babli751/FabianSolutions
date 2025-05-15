// components/NotificationModal.tsx
import React from 'react';
import '../../../app/styles.css';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'; // Correctly importing the icons

interface NotificationModalProps {
  isOpen: boolean;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  onClose: () => void;
}

// Define styles and icons per type
const typeConfig = {
  error: {
    title: 'Error',
    color: 'text-red-600',
    icon: <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />,
    button: 'bg-red-600 hover:bg-red-700',
  },
  success: {
    title: 'Success',
    color: 'text-green-600',
    icon: <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />,
    button: 'bg-green-600 hover:bg-green-700',
  },
  info: {
    title: 'Notice',
    color: 'text-blue-600',
    icon: <Info className="w-10 h-10 text-blue-600 mx-auto mb-2" />,
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  warning: {
    title: 'Warning',
    color: 'text-yellow-600',
    icon: <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-2" />,
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
  
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  message,
  type,
  onClose,
}) => {
  if (!isOpen) return null;

  const { title, color, icon, button } = typeConfig[type] || typeConfig.info;

  console.log("Type:", type)

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full text-center animate-fadeIn">
        {icon}
        <h3 className={`text-2xl font-semibold ${color}`}>{title}</h3>
        <p className="mt-2 text-gray-700">{message}</p>
        <div className="mt-5">
          <button
            onClick={onClose}
            className={`${button} text-white font-medium py-2 px-6 rounded-lg transition`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

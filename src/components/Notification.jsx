import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    warning: <AlertCircle className="text-yellow-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />
  };

  const bgColors = {
    success: 'rgba(34, 197, 94, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
    warning: 'rgba(234, 179, 8, 0.15)',
    info: 'rgba(59, 130, 246, 0.15)'
  };

  const borderColors = {
    success: 'rgba(34, 197, 94, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    warning: 'rgba(234, 179, 8, 0.3)',
    info: 'rgba(59, 130, 246, 0.3)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="notification"
      style={{
        background: bgColors[type],
        borderColor: borderColors[type]
      }}
    >
      <div className="notification__icon">
        {icons[type]}
      </div>
      <div className="notification__message">{message}</div>
      <button className="notification__close" onClick={onClose}>
        <X size={16} />
      </button>
    </motion.div>
  );
}

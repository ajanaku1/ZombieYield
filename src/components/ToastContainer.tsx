import { useAppStore } from '../store/appStore';
import { X } from 'lucide-react';
import type { Toast } from '../types';

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();
  
  if (toasts.length === 0) return null;
  
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-zombie-green bg-zombie-green/10 text-zombie-green';
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-zombie-green/50 bg-zombie-gray text-white';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center justify-between gap-3 px-4 py-3
            border rounded-xl backdrop-blur-sm
            shadow-neon-sm animate-slide-in
            ${getToastStyles(toast.type)}
          `}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

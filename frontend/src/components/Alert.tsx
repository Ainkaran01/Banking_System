import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = type === 'success'
    ? 'bg-success/10 border-success text-success'
    : 'bg-destructive/10 border-destructive text-destructive';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles} animate-fade-in`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
      <span className="text-sm flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

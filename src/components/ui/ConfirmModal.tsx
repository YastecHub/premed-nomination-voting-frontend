import { AlertTriangle, Trash2, Loader2, X, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantConfig: Record<
    ConfirmVariant,
    { icon: ReactNode; iconBg: string; buttonClass: string; titleColor: string }
  > = {
    danger: {
      icon: <Trash2 size={20} className="text-rose-400" />,
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      buttonClass: 'btn-danger bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 px-4',
      titleColor: 'text-white',
    },
    warning: {
      icon: <AlertTriangle size={20} className="text-gold-400" />,
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      buttonClass: 'btn-gold py-2.5 px-4 font-semibold',
      titleColor: 'text-white',
    },
    primary: {
      icon: <HelpCircle size={20} className="text-indigo-400" />,
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      buttonClass: 'btn-primary py-2.5 px-4 font-semibold',
      titleColor: 'text-white',
    },
  };

  const cfg = variantConfig[variant];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${cfg.iconBg}`}
          >
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-base ${cfg.titleColor}`}>{title}</h3>
            <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{message}</div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-500 hover:text-white p-1 rounded transition-colors -mr-1 -mt-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2.5 mt-6 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-ghost text-xs py-2 px-4 flex-1 sm:flex-initial"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${cfg.buttonClass} text-xs flex-1 sm:flex-initial`}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            {isLoading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

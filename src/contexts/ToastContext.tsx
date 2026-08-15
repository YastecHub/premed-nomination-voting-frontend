import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  const typeConfig: Record<
    ToastType,
    { icon: ReactNode; border: string; bg: string; text: string; iconColor: string }
  > = {
    success: {
      icon: <CheckCircle2 size={18} />,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-200',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: <AlertCircle size={18} />,
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/80',
      text: 'text-rose-200',
      iconColor: 'text-rose-400',
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      border: 'border-gold-500/30',
      bg: 'bg-amber-950/80',
      text: 'text-amber-200',
      iconColor: 'text-gold-400',
    },
    info: {
      icon: <Info size={18} />,
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-950/80',
      text: 'text-indigo-200',
      iconColor: 'text-indigo-400',
    },
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const cfg = typeConfig[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-up ${cfg.bg} ${cfg.border}`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${cfg.iconColor}`}>{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                {t.title && <p className="font-semibold text-xs text-white mb-0.5">{t.title}</p>}
                <p className={`text-xs leading-relaxed ${cfg.text}`}>{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

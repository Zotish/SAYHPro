import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let addToastExternal: ((toast: Omit<Toast, "id">) => void) | null = null;

export function toast(t: Omit<Toast, "id">) {
  addToastExternal?.(t);
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-em-200 bg-em-50",
  error: "border-red-200 bg-red-50",
  warning: "border-ac-200 bg-ac-50",
  info: "border-nv-200 bg-nv-50",
};

const iconStyles = {
  success: "text-ink",
  error: "text-ink",
  warning: "text-ink",
  info: "text-ink",
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    addToastExternal = add;
    return () => { addToastExternal = null; };
  }, [add]);

  const remove = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-sm w-full bg-white transition-all duration-300 ${styles[t.type]}`}
          >
            <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconStyles[t.type]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink">{t.title}</div>
              {t.message && <div className="text-xs text-ink mt-0.5">{t.message}</div>}
            </div>
            <button onClick={() => remove(t.id)} className="text-ink transition-fast flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

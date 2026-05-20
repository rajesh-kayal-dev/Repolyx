'use client';

import { useToast } from '@/lib/use-toast';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-accent/30 bg-accent/5 text-accent',
};

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs font-medium shadow-lg backdrop-blur-md animate-slide-up ${colorMap[toast.type]}`}
          >
            <Icon size={14} className="shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

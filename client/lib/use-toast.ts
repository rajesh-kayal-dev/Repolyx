'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: Array<(toast: Toast) => void> = [];
let toastId = 0;

export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: ++toastId + '', message, type };
  toastListeners.forEach((listener) => listener(toast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addListener = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3000);
  }, []);

  useEffect(() => {
    toastListeners.push(addListener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addListener);
    };
  }, [addListener]);

  return { toasts };
}

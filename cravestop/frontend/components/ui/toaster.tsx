'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{
  addToast: (message: string, type?: Toast['type']) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within Toaster');
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Expose globally
  useEffect(() => {
    (window as unknown as { __addToast?: typeof addToast }).__addToast = addToast;
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 min-w-[280px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'px-4 py-3 rounded-md border text-sm font-medium shadow-lg transition-all duration-300',
              t.type === 'success' && 'bg-emerald-950 border-emerald-800 text-emerald-200',
              t.type === 'error' && 'bg-red-950 border-red-800 text-red-200',
              t.type === 'info' && 'bg-zinc-900 border-zinc-700 text-zinc-200'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Global toast helper — call from anywhere without hooks
export function showToast(message: string, type: Toast['type'] = 'info') {
  const fn = (window as unknown as { __addToast?: (m: string, t: Toast['type']) => void }).__addToast;
  if (fn) fn(message, type);
}

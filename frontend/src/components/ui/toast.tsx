'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationEnter } from '@/lib/design/animation';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastMessage extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-transparent bg-success text-white shadow-success/20',
  error: 'border-transparent bg-destructive text-white shadow-destructive/20',
  warning: 'border-transparent bg-warning text-white shadow-warning/20',
  info: 'border-transparent bg-primary text-white shadow-primary/20',
};

const variantProgressStyles: Record<ToastVariant, string> = {
  success: 'bg-white/30',
  error: 'bg-white/30',
  warning: 'bg-white/30',
  info: 'bg-white/30',
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

function ToastProgress({ duration, isPaused }: { duration: number; isPaused: boolean }) {
  return (
    <span className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-lg">
      <span
        className={cn(
          'block h-full rounded-b-lg transition-[width] linear',
          variantProgressStyles.success,
          isPaused && '!w-[var(--toast-progress)]',
        )}
        style={{
          animation: `toast-shrink ${duration}ms linear`,
          animationPlayState: isPaused ? 'paused' : 'running',
          width: '100%',
        }}
      />
    </span>
  );
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: string) => void }) {
  const Icon = icons[message.variant];
  const duration = message.duration ?? 4500;
  const [isPaused, setIsPaused] = useState(false);

  return (
    <motion.div
      variants={notificationEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-4 text-sm shadow-md',
        variantStyles[message.variant],
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-base">{message.title}</div>
          {message.description ? (
            <div className="mt-1 text-sm opacity-85 leading-relaxed">{message.description}</div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onDismiss(message.id)}
          aria-label="Dismiss notification"
          className="-mt-1 -me-1 text-white/80 hover:text-white hover:bg-white/10"
        >
          <X className="size-4" />
        </Button>
      </div>
      <ToastProgress duration={duration} isPaused={isPaused} />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const message: ToastMessage = {
        ...input,
        id,
        variant: input.variant ?? 'info',
      };

      setMessages((current) => [...current, message].slice(-3));
      window.setTimeout(() => dismiss(id), input.duration ?? 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="false" className="fixed inset-inline-end-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {messages.map((message) => (
            <ToastItem key={message.id} message={message} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

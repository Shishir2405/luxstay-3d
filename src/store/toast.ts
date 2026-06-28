'use client';

import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms before auto-dismiss; `0` keeps it until dismissed. */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
const nextId = () => `t_${Date.now().toString(36)}_${(counter++).toString(36)}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (input) => {
    const id = nextId();
    const toast: Toast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? 'default',
      duration: input.duration ?? 4500,
    };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Ergonomic toast API usable from anywhere (event handlers, async flows):
 *   toast.success('Saved', 'Your changes are live')
 */
export const toast = {
  show: (input: ToastInput) => useToastStore.getState().push(input),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'error' }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'warning' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'info' }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};

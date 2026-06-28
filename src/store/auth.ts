'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/lib/types';
import {
  hasPermission as checkPermission,
  type PermissionAction,
  type PermissionModule,
} from '@/lib/constants';
import { api } from '@/lib/api/client';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setUser: (user: AuthUser | null) => void;
  /** Fetch the current session (cookie-based) — used on app mount. */
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  can: (module: PermissionModule, action: PermissionAction) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),

  fetchMe: async () => {
    set({ status: 'loading' });
    try {
      const user = await api.get<AuthUser>('/auth/me');
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* best-effort; cookies cleared server-side */
    }
    set({ user: null, status: 'unauthenticated' });
  },

  can: (module, action) => {
    const user = get().user;
    return checkPermission(user?.permissions, module, action);
  },
}));

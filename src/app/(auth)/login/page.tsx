import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the LuxStay 3D management console.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted/40" />}>
      <LoginForm />
    </Suspense>
  );
}

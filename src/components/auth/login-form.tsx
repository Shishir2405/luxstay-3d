'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Envelope, Lock, ShieldCheck } from '@phosphor-icons/react';
import { loginSchema, type LoginInput } from '@/lib/validators';
import type { AuthUser } from '@/lib/types';
import { api, ApiClientError } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { ROLES } from '@/lib/constants';
import { toast } from '@/store/toast';
import { Button, Field, Input } from '@/components/ui';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [show2fa, setShow2fa] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onTouched' });

  async function onSubmit(values: LoginInput) {
    try {
      const user = await api.post<AuthUser>('/auth/login', values);
      setUser(user);
      toast.success('Welcome back', `Signed in as ${user.name}`);
      const callback = params.get('callbackUrl');
      router.replace(callback || (user.role === ROLES.GUEST ? '/account' : '/admin'));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fields = err.fieldErrors;
        if (Object.keys(fields).length) {
          for (const [field, message] of Object.entries(fields)) {
            setError(field as keyof LoginInput, { message });
          }
          return;
        }
        if (/2fa|totp|code/i.test(err.message) || err.code === 'TOTP_REQUIRED') {
          setShow2fa(true);
          toast.info('Two-factor required', 'Enter the 6-digit code from your authenticator app');
          return;
        }
        toast.error('Sign in failed', err.message);
        return;
      }
      toast.error('Sign in failed', 'Please try again in a moment');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to the LuxStay management console.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@property.com"
              leftIcon={<Envelope size={16} />}
              invalid={!!errors.email}
              aria-describedby={describedBy}
              {...register('email')}
            />
          )}
        </Field>

        <Field
          label={
            <span className="flex items-center justify-between">
              <span>Password</span>
              <Link
                href="/forgot-password"
                className="text-xs font-normal text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </span>
          }
          error={errors.password?.message}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              invalid={!!errors.password}
              aria-describedby={describedBy}
              {...register('password')}
            />
          )}
        </Field>

        {show2fa && (
          <Field
            label="Two-factor code"
            error={errors.totp?.message}
            hint="6-digit code from your authenticator"
          >
            {({ id }) => (
              <Input
                id={id}
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                leftIcon={<ShieldCheck size={16} />}
                invalid={!!errors.totp}
                {...register('totp')}
              />
            )}
          </Field>
        )}

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New guest?{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Envelope, Lock, User as UserIcon, Phone } from '@phosphor-icons/react';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import type { AuthUser } from '@/lib/types';
import { api, ApiClientError } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import { Button, Field, Input } from '@/components/ui';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), mode: 'onTouched' });

  async function onSubmit(values: RegisterInput) {
    try {
      const user = await api.post<AuthUser | null>('/auth/register', values);
      if (user && user.id) {
        setUser(user);
        toast.success('Account created', `Welcome to LuxStay, ${user.name.split(' ')[0]}`);
        router.replace('/account');
      } else {
        toast.success('Account created', 'Please sign in to continue');
        router.replace('/login');
      }
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fields = err.fieldErrors;
        if (Object.keys(fields).length) {
          for (const [field, message] of Object.entries(fields)) {
            setError(field as keyof RegisterInput, { message });
          }
          return;
        }
        toast.error('Could not create account', err.message);
        return;
      }
      toast.error('Could not create account', 'Please try again in a moment');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Save stays, track bookings, and RSVP to events.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Full name" error={errors.name?.message}>
          {({ id }) => (
            <Input
              id={id}
              autoComplete="name"
              placeholder="Avani Mehta"
              leftIcon={<UserIcon size={16} />}
              invalid={!!errors.name}
              {...register('name')}
            />
          )}
        </Field>

        <Field label="Email" error={errors.email?.message}>
          {({ id }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              leftIcon={<Envelope size={16} />}
              invalid={!!errors.email}
              {...register('email')}
            />
          )}
        </Field>

        <Field label="Phone" error={errors.phone?.message} hint="Optional — for booking updates">
          {({ id }) => (
            <Input
              id={id}
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              leftIcon={<Phone size={16} />}
              invalid={!!errors.phone}
              {...register('phone')}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message}>
            {({ id }) => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                invalid={!!errors.password}
                {...register('password')}
              />
            )}
          </Field>
          <Field label="Confirm" error={errors.confirmPassword?.message}>
            {({ id }) => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            )}
          </Field>
        </div>

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

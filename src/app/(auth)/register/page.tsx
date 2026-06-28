import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a LuxStay 3D guest account.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

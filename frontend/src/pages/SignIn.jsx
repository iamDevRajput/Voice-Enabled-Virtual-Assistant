import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

function SignIn() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

export default SignIn;

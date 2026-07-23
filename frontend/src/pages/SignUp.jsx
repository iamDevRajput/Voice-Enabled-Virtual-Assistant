import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

function SignUp() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}

export default SignUp;

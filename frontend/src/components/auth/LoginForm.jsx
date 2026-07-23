import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LoginForm = () => {
  const { login, isSubmitting, errorMsg } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="w-full">
      <h1 className="text-white text-3xl font-semibold mb-2">Welcome Back</h1>
      <p className="text-gray-400 text-sm mb-8">Sign in to continue to your Virtual Assistant</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full" noValidate>
        
        <InputField
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          {...register("email")}
          error={errors.email}
        />

        <PasswordField
          placeholder="Password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password}
        />

        {/* Global Error Fallback (Optional since Toast handles most, but good for local UX) */}
        {errorMsg && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-medium mt-2 mb-4 text-center"
            role="alert"
          >
            {errorMsg}
          </motion.p>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-[55px] mt-6 text-black font-semibold bg-white rounded-2xl text-[18px] transition-all duration-300 hover:bg-gray-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : "Sign In"}
        </button>

        <p className="text-gray-400 mt-8 text-center text-[15px]">
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors ml-1 focus:outline-none focus:underline"
          >
            Sign Up
          </button>
        </p>

      </form>
    </div>
  );
};

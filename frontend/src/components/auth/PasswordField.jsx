import React, { useState, forwardRef } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';

export const PasswordField = forwardRef(({ error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isInvalid = !!error;

  return (
    <div className="flex flex-col gap-1 w-full relative mb-4">
      <div className="relative w-full h-[55px]">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          {...props}
          aria-invalid={isInvalid}
          className={`w-full h-[50px] outline-none border bg-[var(--bg-elevated-2)] text-[var(--ink)] placeholder-[var(--ink-faint)] pl-[20px] pr-[50px] rounded-[var(--radius-md)] text-[15px] transition-all duration-300 font-body
          ${isInvalid ? 'border-[var(--warn)] focus:border-[var(--warn)] focus:ring-1 focus:ring-[var(--warn)]' : 'border-[var(--bg-elevated-3)] focus:border-[var(--core)] focus:ring-1 focus:ring-[var(--core)] hover:border-[var(--ink-ghost)]'}`}
        />
        <button
          type="button"
          tabIndex="-1"
          className="absolute right-[16px] top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <IoEyeOff size={22} /> : <IoEye size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {isInvalid && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-400 text-[13px] font-medium ml-2 absolute -bottom-5"
            role="alert"
          >
            {error.message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InputField = forwardRef(({ label, error, ...props }, ref) => {
  const isInvalid = !!error;

  return (
    <div className="flex flex-col gap-1 w-full relative mb-4">
      <input
        ref={ref}
        {...props}
        aria-invalid={isInvalid}
        className={`w-full h-[50px] outline-none border bg-[var(--bg-elevated-2)] text-[var(--ink)] placeholder-[var(--ink-faint)] px-[20px] rounded-[var(--radius-md)] text-[15px] transition-all duration-300 font-body
        ${isInvalid ? 'border-[var(--warn)] focus:border-[var(--warn)] focus:ring-1 focus:ring-[var(--warn)]' : 'border-[var(--bg-elevated-3)] focus:border-[var(--core)] focus:ring-1 focus:ring-[var(--core)] hover:border-[var(--ink-ghost)]'}`}
      />
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

InputField.displayName = 'InputField';

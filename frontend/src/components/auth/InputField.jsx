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
        className={`w-full h-[55px] outline-none border-2 bg-black/40 backdrop-blur-sm text-white placeholder-gray-400 px-[20px] rounded-2xl text-[16px] transition-all duration-300
        ${isInvalid ? 'border-red-500/80 focus:border-red-500' : 'border-white/10 focus:border-blue-400/80 hover:border-white/30'}`}
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

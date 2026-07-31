import React from 'react';
import { motion } from 'framer-motion';
import AICore from '../AICore';

export const AuthLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-base)] flex items-center justify-center relative overflow-hidden ambient-preset-void">
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg absolute inset-0" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <AICore status="idle" size={80} accent="signal" />
          <h1 className="text-2xl font-display font-semibold text-[var(--ink)] mt-6 tracking-tight">Virtual Assistant</h1>
          <p className="text-[var(--ink-faint)] text-sm mt-1 font-mono uppercase tracking-widest">OS Authentication</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-xl)] p-8 shadow-2xl backdrop-blur-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

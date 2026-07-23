import React from 'react';
import { motion } from 'framer-motion';

export const AuthIllustration = () => {
  return (
    <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center bg-black/20 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center px-12"
      >
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="mb-12"
        >
          {/* Futuristic abstract icon representing AI Assistant */}
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto text-blue-400 opacity-80" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
             <path d="M12 6v6l4 2" />
             <circle cx="12" cy="12" r="3" />
          </svg>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          Your Intelligent <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Virtual Assistant
          </span>
        </h2>
        <p className="text-white/50 text-lg max-w-md mx-auto leading-relaxed">
          Experience seamless voice interaction, dynamic avatars, and smart insights all in one place.
        </p>
      </motion.div>
    </div>
  );
};

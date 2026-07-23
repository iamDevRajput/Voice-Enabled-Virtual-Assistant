import React from 'react';
import bg from "../../assets/authBg.png";
import { AuthIllustration } from './AuthIllustration';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center bg-[#030011]" 
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-[1200px] h-screen lg:h-[700px] lg:rounded-3xl lg:border border-white/10 overflow-hidden flex bg-black/40 backdrop-blur-xl shadow-2xl">
        
        {/* Left Side: Illustration (Hidden on mobile) */}
        <AuthIllustration />

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-[500px] flex-shrink-0 flex flex-col justify-center px-8 sm:px-12 py-10 relative">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[400px] mx-auto"
          >
            {children}
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface GlassLoadingScreenProps {
  text?: string;
  subText?: string;
  variant?: 'default' | 'gradient' | 'pulse' | 'sparkles';
  isDarkMode?: boolean;
  className?: string;
}

const GlassLoadingScreen: React.FC<GlassLoadingScreenProps> = ({
  text = 'جاري التحميل...',
  subText = 'يرجى الانتظار',
  variant = 'default',
  isDarkMode = false,
  className = ''
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="relative w-20 h-20">
            {/* Outer gradient ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400 via-indigo-500 to-teal-500 rounded-full animate-spin">
              <div className="absolute inset-1 bg-white/90 dark:bg-jet-800/90 backdrop-blur-sm rounded-full"></div>
            </div>
            {/* Inner gradient ring */}
            <div className="absolute inset-2 bg-gradient-to-r from-caribbean-300 via-indigo-400 to-teal-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}>
              <div className="absolute inset-1 bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-full"></div>
            </div>
            {/* Center dot */}
            <div className="absolute inset-4 bg-gradient-to-r from-caribbean-500 to-indigo-500 rounded-full animate-pulse"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400 via-indigo-500 to-teal-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="relative w-20 h-20">
            {/* Multiple pulse rings */}
            <div className="absolute inset-0 bg-caribbean-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-indigo-500/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-4 bg-teal-500/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            {/* Center glass circle */}
            <div className="absolute inset-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20">
              <div className="absolute inset-2 bg-gradient-to-r from-caribbean-400 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        );

      case 'sparkles':
        return (
          <div className="relative w-20 h-20">
            {/* Main glass circle */}
            <div className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20">
              <div className="absolute inset-2 bg-gradient-to-r from-caribbean-400 via-indigo-500 to-teal-500 rounded-full animate-pulse"></div>
            </div>
            {/* Rotating sparkles */}
            <div className="absolute inset-0 animate-spin">
              <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-caribbean-400" />
              <Sparkles className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 text-indigo-400" />
              <Sparkles className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
              <Sparkles className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-20 h-20">
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20">
              <div className="absolute inset-2 bg-gradient-to-r from-caribbean-400 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
            {/* Spinning border */}
            <div className="absolute inset-0 border-2 border-transparent border-t-caribbean-400 border-r-indigo-400 rounded-full animate-spin"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
        );
    }
  };

  return (
    <div className={`glass-loading-screen glass-loading-transition glass-loading-optimized flex items-center justify-center ${className}`} style={{ 
      animation: 'fadeIn 0.5s ease-in-out'
    }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-platinum-50/80 via-caribbean-50/60 to-indigo-50/80 dark:from-jet-900/90 dark:via-caribbean-900/80 dark:to-indigo-900/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-caribbean-200/20 dark:bg-caribbean-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 dark:bg-teal-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating glass particles */}
        <div className="glass-particle"></div>
        <div className="glass-particle"></div>
        <div className="glass-particle"></div>
      </div>

      {/* Main glass container */}
      <div className="relative z-10 glass-card-enhanced dark:glass-card-enhanced-dark rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 glass-loading-container">
        <div className="text-center">
          {/* Spinner */}
          <div className="flex justify-center mb-8">
            <div className="glass-loading-spinner">
              {renderSpinner()}
            </div>
          </div>
          
          {/* Text content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-jet-800 dark:text-white bg-gradient-to-r from-caribbean-600 to-indigo-600 bg-clip-text text-transparent glass-loading-shimmer">
              {text}
            </h2>
            <p className="text-jet-600 dark:text-platinum-400 text-lg">
              {subText}
            </p>
          </div>

          {/* Decorative elements */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-caribbean-400 rounded-full animate-bounce glass-loading-glow"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce glass-loading-glow" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce glass-loading-glow" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassLoadingScreen;

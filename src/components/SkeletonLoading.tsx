import React from 'react';

interface SkeletonLoadingProps {
  isDarkMode?: boolean;
  className?: string;
}

const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  isDarkMode = false,
  className = ''
}) => {
  return (
    <div className={`skeleton-loading flex items-center justify-center ${className}`}>
      {/* Background gradient - same as glass loading screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-platinum-50/80 via-caribbean-50/60 to-indigo-50/80 dark:from-jet-900/90 dark:via-caribbean-900/80 dark:to-indigo-900/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-caribbean-200/20 dark:bg-caribbean-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 dark:bg-teal-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main skeleton container */}
      <div className="relative z-10 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Skeleton spinner */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400/30 via-indigo-500/30 to-teal-500/30 rounded-full skeleton-pulse">
                <div className="absolute inset-1 bg-white/90 dark:bg-jet-800/90 backdrop-blur-sm rounded-full"></div>
              </div>
              <div className="absolute inset-4 bg-gradient-to-r from-caribbean-500/50 to-indigo-500/50 rounded-full skeleton-pulse"></div>
            </div>
          </div>
          
          {/* Skeleton text content */}
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-caribbean-400/30 to-indigo-400/30 rounded-lg skeleton-pulse mx-auto w-48"></div>
            <div className="h-6 bg-gradient-to-r from-caribbean-300/30 to-indigo-300/30 rounded-lg skeleton-pulse mx-auto w-64"></div>
          </div>

          {/* Skeleton decorative elements */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-caribbean-400/50 rounded-full skeleton-pulse"></div>
            <div className="w-2 h-2 bg-indigo-400/50 rounded-full skeleton-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-teal-400/50 rounded-full skeleton-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;

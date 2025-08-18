import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subText?: string;
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
  isDarkMode?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  subText,
  variant = 'default',
  isDarkMode = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400 via-indigo-500 to-teal-500 rounded-full animate-spin">
              <div className="absolute inset-2 bg-white dark:bg-jet-800 rounded-full"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-caribbean-400 via-indigo-500 to-teal-500 rounded-full animate-pulse opacity-30"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-caribbean-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-caribbean-600 rounded-full w-full h-full animate-pulse"></div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-caribbean-500 rounded-full animate-bounce`}></div>
            <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-indigo-500 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-teal-500 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Loader2 className={`w-full h-full text-caribbean-600 dark:text-caribbean-400 animate-spin`} />
            <div className="absolute inset-0 border-2 border-caribbean-200 dark:border-jet-700 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-caribbean-600 dark:border-t-caribbean-400 rounded-full animate-spin"></div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      
      {text && (
        <div className="mt-4 text-center">
          <p className={`${textSizeClasses[size]} font-semibold text-jet-800 dark:text-white mb-1`}>
            {text}
          </p>
          {subText && (
            <p className="text-sm text-jet-600 dark:text-platinum-400">
              {subText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;


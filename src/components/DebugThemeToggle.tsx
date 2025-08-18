import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface DebugThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

const DebugThemeToggle: React.FC<DebugThemeToggleProps> = ({
  isDarkMode,
  onToggle,
  className = ''
}) => {
  const handleClick = () => {
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-300 ease-out
        ${isDarkMode 
          ? 'bg-slate-800 shadow-lg shadow-slate-900/50' 
          : 'bg-sky-400 shadow-lg shadow-blue-500/50'
        }
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-caribbean-400/50
        cursor-pointer select-none
        ${className}
      `}
      title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
    >
      {/* Toggle handle */}
      <div className={`
        absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ease-out
        flex items-center justify-center
        ${isDarkMode 
          ? 'left-9 bg-yellow-300 shadow-lg shadow-yellow-400/50' 
          : 'left-1 bg-white shadow-lg shadow-white/50'
        }
      `}>
        {isDarkMode ? (
          <Sun className="w-3 h-3 text-orange-600" />
        ) : (
          <Moon className="w-3 h-3 text-indigo-600" />
        )}
      </div>
    </button>
  );
};

export default DebugThemeToggle;

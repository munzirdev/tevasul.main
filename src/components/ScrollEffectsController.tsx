import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Zap, Moon, Sun, Sliders, X } from 'lucide-react';

interface ScrollEffectsControllerProps {
  isDarkMode: boolean;
  onToggleEffects: (enabled: boolean) => void;
  onToggleIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  onToggleAdvanced: (enabled: boolean) => void;
  effectsEnabled: boolean;
  effectsIntensity: 'low' | 'medium' | 'high';
  advancedEffects: boolean;
}

const ScrollEffectsController: React.FC<ScrollEffectsControllerProps> = ({
  isDarkMode,
  onToggleEffects,
  onToggleIntensity,
  onToggleAdvanced,
  effectsEnabled,
  effectsIntensity,
  advancedEffects
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('scrollEffectsEnabled', effectsEnabled.toString());
    localStorage.setItem('scrollEffectsIntensity', effectsIntensity);
    localStorage.setItem('advancedScrollEffects', advancedEffects.toString());
  }, [effectsEnabled, effectsIntensity, advancedEffects]);

  const intensityOptions = [
    { value: 'low', label: 'منخفض', color: 'text-green-400' },
    { value: 'medium', label: 'متوسط', color: 'text-yellow-400' },
    { value: 'high', label: 'عالي', color: 'text-red-400' }
  ] as const;

  return (
    <div className="fixed top-4 left-4 z-[99999]">
      {/* Main Control Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-2xl transform hover:scale-110 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-2 border-slate-600 shadow-slate-500/50' 
            : 'bg-gradient-to-r from-white to-gray-100 text-gray-700 border-2 border-gray-300 shadow-gray-500/50'
        }`}
        title="إعدادات تأثيرات التمرير"
      >
        <Sliders className="w-6 h-6" />
        
        {/* Status indicator */}
        {effectsEnabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
        )}
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className={`absolute top-16 left-0 w-64 rounded-lg shadow-2xl border-2 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-600 text-white' 
            : 'bg-white border-gray-300 text-gray-800'
        }`}>
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm">تأثيرات التمرير</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enable/Disable Effects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">تفعيل التأثيرات</span>
                <button
                  onClick={() => onToggleEffects(!effectsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    effectsEnabled 
                      ? 'bg-green-500' 
                      : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    effectsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {effectsEnabled && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {effectsEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>التأثيرات {effectsEnabled ? 'مفعلة' : 'معطلة'}</span>
                </div>
              )}
            </div>

            {/* Intensity Control */}
            {effectsEnabled && (
              <div className="space-y-2">
                <span className="text-sm font-medium">شدة التأثيرات</span>
                <div className="grid grid-cols-3 gap-2">
                  {intensityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onToggleIntensity(option.value)}
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        effectsIntensity === option.value
                          ? isDarkMode 
                            ? 'bg-slate-600 text-white' 
                            : 'bg-blue-500 text-white'
                          : isDarkMode 
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Zap className={`w-3 h-3 ${option.color}`} />
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Effects Toggle */}
            {effectsEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">التأثيرات المتقدمة</span>
                  <button
                    onClick={() => onToggleAdvanced(!advancedEffects)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      advancedEffects 
                        ? 'bg-purple-500' 
                        : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      advancedEffects ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="w-4 h-4" />
                  <span>تأثيرات السرعة والتفاعل</span>
                </div>
              </div>
            )}

            {/* Performance Info */}
            <div className={`text-xs p-2 rounded-md ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <Zap className="w-3 h-3" />
                <span className="font-medium">الأداء</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>الشدة:</span>
                  <span className={intensityOptions.find(o => o.value === effectsIntensity)?.color}>
                    {intensityOptions.find(o => o.value === effectsIntensity)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>المتقدمة:</span>
                  <span className={advancedEffects ? 'text-green-400' : 'text-gray-400'}>
                    {advancedEffects ? 'مفعلة' : 'معطلة'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onToggleEffects(true);
                  onToggleIntensity('medium');
                  onToggleAdvanced(false);
                }}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                إعدادات افتراضية
              </button>
              <button
                onClick={() => {
                  onToggleEffects(false);
                }}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
              >
                إيقاف الكل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ScrollEffectsController;

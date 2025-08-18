import React from 'react';
import { AlertTriangle, Zap, Monitor, Smartphone, Wifi, Battery } from 'lucide-react';

interface PerformanceRecommendationsProps {
  isDarkMode: boolean;
  fps: number;
  isLowPerformance: boolean;
  deviceCapabilities: {
    cpuCores: number;
    deviceMemory: number;
    connectionSpeed: string;
    isMobile: boolean;
  };
}

const PerformanceRecommendations: React.FC<PerformanceRecommendationsProps> = ({
  isDarkMode,
  fps,
  isLowPerformance,
  deviceCapabilities
}) => {
  const getRecommendations = () => {
    const recommendations = [];

    // FPS-based recommendations
    if (fps < 60) {
      recommendations.push({
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Low FPS Detected',
        description: 'Consider disabling animations and reducing visual effects for better performance.',
        priority: 'high'
      });
    }

    // Device-based recommendations
    if (deviceCapabilities.cpuCores <= 2) {
      recommendations.push({
        icon: <Monitor className="w-4 h-4" />,
        title: 'Low CPU Cores',
        description: 'Your device has limited processing power. Performance optimizations have been applied.',
        priority: 'medium'
      });
    }

    if (deviceCapabilities.deviceMemory <= 2) {
      recommendations.push({
        icon: <Zap className="w-4 h-4" />,
        title: 'Limited Memory',
        description: 'Your device has limited RAM. Some features may be disabled for better performance.',
        priority: 'medium'
      });
    }

    if (deviceCapabilities.isMobile) {
      recommendations.push({
        icon: <Smartphone className="w-4 h-4" />,
        title: 'Mobile Device',
        description: 'Mobile optimizations are active. Some features are disabled for better battery life.',
        priority: 'low'
      });
    }

    if (deviceCapabilities.connectionSpeed === 'slow' || deviceCapabilities.connectionSpeed === '2g') {
      recommendations.push({
        icon: <Wifi className="w-4 h-4" />,
        title: 'Slow Connection',
        description: 'Your connection is slow. Real-time features and media are disabled.',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Hide performance tips modal on mobile devices
  if (deviceCapabilities.isMobile) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[99999] max-w-sm ${
      isDarkMode ? 'text-white' : 'text-gray-800'
    }`}>
      <div className={`rounded-lg shadow-2xl border-2 p-4 space-y-3 ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-600' 
          : 'bg-white border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Performance Tips</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
                                fps >= 90 ? 'bg-green-400' : fps >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-xs font-mono">{fps} FPS</span>
          </div>
        </div>

        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`flex items-start space-x-2 p-2 rounded ${
                rec.priority === 'high' 
                  ? isDarkMode ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                  : rec.priority === 'medium'
                  ? isDarkMode ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
                  : isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${
                rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {rec.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{rec.title}</div>
                <div className="text-xs opacity-80 mt-1">{rec.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs opacity-60 text-center">
          These optimizations are applied automatically for the best experience.
        </div>
      </div>
    </div>
  );
};

export default PerformanceRecommendations;

import React, { useEffect, useState, useCallback } from 'react';

interface PerformanceSettings {
  animationsEnabled: boolean;
  particleCount: number;
  scrollEffectsEnabled: boolean;
  customCursorEnabled: boolean;
  backgroundMusicEnabled: boolean;
  realTimeUpdatesEnabled: boolean;
  visualEffectsIntensity: 'low' | 'medium' | 'high';
}

interface PerformanceOptimizerProps {
  isDarkMode: boolean;
  onSettingsChange: (settings: PerformanceSettings) => void;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  isDarkMode,
  onSettingsChange
}) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    cpuCores: navigator.hardwareConcurrency || 4,
    deviceMemory: (navigator as any).deviceMemory || 4,
    connectionSpeed: 'fast',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    batteryLevel: 1
  });

  const [settings, setSettings] = useState<PerformanceSettings>({
    animationsEnabled: true,
    particleCount: 16,
    scrollEffectsEnabled: true,
    customCursorEnabled: true,
    backgroundMusicEnabled: true,
    realTimeUpdatesEnabled: true,
    visualEffectsIntensity: 'medium'
  });

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = async () => {
      const newCapabilities = { ...deviceCapabilities };

      // Check connection speed
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType) {
          newCapabilities.connectionSpeed = connection.effectiveType;
        }
      }

      // Check battery level
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          newCapabilities.batteryLevel = battery.level;
        } catch (error) {
          console.error('Error getting battery info:', error);
        }
      }

      // Check for reduced motion preference
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      newCapabilities.prefersReducedMotion = reducedMotionQuery.matches;

      setDeviceCapabilities(newCapabilities);
    };

    detectCapabilities();
  }, []);

  // Optimize settings based on device capabilities
  useEffect(() => {
    const optimizeSettings = () => {
      let newSettings = { ...settings };

      // Low-end device optimizations
      if (deviceCapabilities.cpuCores <= 2 || deviceCapabilities.deviceMemory <= 2) {
        newSettings.animationsEnabled = false;
        newSettings.particleCount = 4;
        newSettings.scrollEffectsEnabled = false;
        newSettings.customCursorEnabled = false;
        newSettings.visualEffectsIntensity = 'low';
      }
      // Medium-end device optimizations
      else if (deviceCapabilities.cpuCores <= 4 || deviceCapabilities.deviceMemory <= 4) {
        newSettings.particleCount = 8;
        newSettings.visualEffectsIntensity = 'medium';
      }

      // Mobile optimizations
      if (deviceCapabilities.isMobile) {
        newSettings.customCursorEnabled = false;
        newSettings.particleCount = Math.min(newSettings.particleCount, 6);
        newSettings.backgroundMusicEnabled = false;
      }

      // Slow connection optimizations
      if (deviceCapabilities.connectionSpeed === 'slow' || deviceCapabilities.connectionSpeed === '2g') {
        newSettings.realTimeUpdatesEnabled = false;
        newSettings.backgroundMusicEnabled = false;
      }

      // Low battery optimizations
      if (deviceCapabilities.batteryLevel < 0.2) {
        newSettings.animationsEnabled = false;
        newSettings.backgroundMusicEnabled = false;
        newSettings.realTimeUpdatesEnabled = false;
      }

      // Reduced motion preference
      if (deviceCapabilities.prefersReducedMotion) {
        newSettings.animationsEnabled = false;
        newSettings.scrollEffectsEnabled = false;
        newSettings.visualEffectsIntensity = 'low';
      }

      setSettings(newSettings);
      onSettingsChange(newSettings);
    };

    optimizeSettings();
  }, [deviceCapabilities]);

  // Apply performance optimizations to CSS
  useEffect(() => {
    const applyCSSOptimizations = () => {
      const root = document.documentElement;
      
      // Set CSS custom properties based on performance settings
      root.style.setProperty('--animation-duration', settings.animationsEnabled ? '0.3s' : '0s');
      root.style.setProperty('--particle-count', settings.particleCount.toString());
      root.style.setProperty('--scroll-effects-enabled', settings.scrollEffectsEnabled ? '1' : '0');
      root.style.setProperty('--cursor-enabled', settings.customCursorEnabled ? '1' : '0');
      root.style.setProperty('--visual-effects-intensity', settings.visualEffectsIntensity);

      // Disable animations if not enabled
      if (!settings.animationsEnabled) {
        document.body.style.setProperty('--disable-animations', 'true');
      } else {
        document.body.style.removeProperty('--disable-animations');
      }
    };

    applyCSSOptimizations();
  }, [settings]);

  // Monitor performance and adjust settings dynamically
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFPSDetected = false;

    const monitorPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount * 1000 / (currentTime - lastTime);
        
            // If FPS drops below 60, reduce effects (adjusted for higher refresh rates)
    if (fps < 60 && !lowFPSDetected) {
          lowFPSDetected = true;
          setSettings(prev => ({
            ...prev,
            particleCount: Math.max(4, prev.particleCount - 4),
            visualEffectsIntensity: prev.visualEffectsIntensity === 'high' ? 'medium' : 'low'
          }));
        }
        // If FPS is good, gradually restore effects
        else if (fps > 50 && lowFPSDetected) {
          lowFPSDetected = false;
          setSettings(prev => ({
            ...prev,
            particleCount: Math.min(16, prev.particleCount + 2),
            visualEffectsIntensity: prev.visualEffectsIntensity === 'low' ? 'medium' : 'high'
          }));
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitorPerformance);
    };

    const animationId = requestAnimationFrame(monitorPerformance);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;

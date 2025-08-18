import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMonitorProps {
  isTransitioning: boolean;
  onPerformanceUpdate?: (fps: number, isLowPerformance: boolean) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isTransitioning,
  onPerformanceUpdate
}) => {
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [currentFPS, setCurrentFPS] = useState(120);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);

  useEffect(() => {
    if (isTransitioning) {
      startTimeRef.current = performance.now();
      frameCountRef.current = 0;
      lastTimeRef.current = performance.now();

      const measurePerformance = (currentTime: number) => {
        frameCountRef.current++;
        
        // Calculate FPS
        const deltaTime = currentTime - lastTimeRef.current;
        const fps = 1000 / deltaTime;
        
        // Update performance history (keep last 10 measurements)
        setPerformanceHistory(prev => {
          const newHistory = [...prev, fps];
          return newHistory.slice(-10);
        });
        
        // Calculate average FPS
        const avgFPS = performanceHistory.length > 0 
          ? performanceHistory.reduce((sum, f) => sum + f, fps) / (performanceHistory.length + 1)
          : fps;
        
        setCurrentFPS(Math.round(avgFPS));
        
        // Determine if performance is low (adjusted for higher refresh rates)
        const lowPerformance = avgFPS < 60;
        setIsLowPerformance(lowPerformance);
        
        // Notify parent component
        if (onPerformanceUpdate) {
          onPerformanceUpdate(avgFPS, lowPerformance);
        }
        
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development' && frameCountRef.current % 30 === 0) {
          console.log('Performance metrics:', {
            frameCount: frameCountRef.current,
            elapsedTime: Math.round(currentTime - startTimeRef.current),
            isLowPerformance: lowPerformance
          });
        }
        
        lastTimeRef.current = currentTime;
      };

      const animationFrame = () => {
        const currentTime = performance.now();
        measurePerformance(currentTime);
        
        if (isTransitioning) {
          requestAnimationFrame(animationFrame);
        }
      };

      requestAnimationFrame(animationFrame);
    }
  }, [isTransitioning, onPerformanceUpdate, performanceHistory]);

  // Optimize performance by reducing re-renders
  useEffect(() => {
    if (isTransitioning) {
      // Disable some animations on low-end devices
      const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                           (navigator as any).deviceMemory <= 4;
      
      if (isLowEndDevice || isLowPerformance) {
        document.body.style.setProperty('--animation-duration', '0.3s');
        document.body.style.setProperty('--particle-count', '4');
        document.body.style.setProperty('--visual-effects-intensity', 'low');
      } else {
        document.body.style.setProperty('--animation-duration', '0.6s');
        document.body.style.setProperty('--particle-count', '8');
        document.body.style.setProperty('--visual-effects-intensity', 'medium');
      }
    }
  }, [isTransitioning, isLowPerformance]);

  // Continuous performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const monitorPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount * 1000 / (currentTime - lastTime);
        
        // Update performance history
        setPerformanceHistory(prev => {
          const newHistory = [...prev, fps];
          return newHistory.slice(-10);
        });
        
        // Calculate average FPS
        const avgFPS = performanceHistory.length > 0 
          ? performanceHistory.reduce((sum, f) => sum + f, fps) / (performanceHistory.length + 1)
          : fps;
        
        setCurrentFPS(Math.round(avgFPS));
        
        // Determine if performance is low
        const lowPerformance = avgFPS < 60;
        setIsLowPerformance(lowPerformance);
        
        // Apply performance optimizations
        if (lowPerformance) {
          document.body.style.setProperty('--animation-duration', '0.2s');
          document.body.style.setProperty('--particle-count', '2');
          document.body.style.setProperty('--visual-effects-intensity', 'low');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(monitorPerformance);
    };

    animationId = requestAnimationFrame(monitorPerformance);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [performanceHistory]);

  return null;
};

export default PerformanceMonitor;

import React, { useEffect, useState, useCallback, useRef } from 'react';

interface CustomCursorProps {
  isDarkMode: boolean;
  enabled?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ isDarkMode, enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const animationFrameRef = useRef<number>();
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();

  // Throttled position update for better performance
  const updatePosition = useCallback((e: MouseEvent) => {
    if (!enabled) return;
    
    // Throttle updates to uncapped fps for smoother cursor movement
    if (throttleTimeoutRef.current) return;
    
    throttleTimeoutRef.current = setTimeout(() => {
      const newPosition = { x: e.clientX, y: e.clientY };
      
      // Only update if position changed significantly (reduce unnecessary re-renders)
      const distance = Math.sqrt(
        Math.pow(newPosition.x - lastPositionRef.current.x, 2) + 
        Math.pow(newPosition.y - lastPositionRef.current.y, 2)
      );
      
      if (distance > 1) { // Reduced threshold for smoother movement
        lastPositionRef.current = newPosition;
        setPosition(newPosition);
      }
      
      throttleTimeoutRef.current = undefined;
    }, 8); // ~120fps for smoother cursor movement
  }, [enabled]);

  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    setIsVisible(true);
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setIsVisible(false);
  }, [enabled]);

  const handleMouseDown = useCallback(() => {
    if (!enabled) return;
    setIsClicking(true);
  }, [enabled]);

  const handleMouseUp = useCallback(() => {
    if (!enabled) return;
    setIsClicking(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Use passive listeners for better performance
    document.addEventListener('mousemove', updatePosition, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Optimized hover detection using event delegation
    const handleElementInteraction = (e: Event) => {
      const target = e.target;
      
      // Check if target exists and has the matches method
      if (target && target instanceof HTMLElement && typeof target.matches === 'function') {
        const isInteractive = target.matches('button, a, input, select, textarea, [role="button"], [onclick], [tabindex], .interactive');
        
        if (isInteractive) {
          setIsHovering(e.type === 'mouseenter');
        }
      }
    };

    document.addEventListener('mouseenter', handleElementInteraction, { passive: true });
    document.addEventListener('mouseleave', handleElementInteraction, { passive: true });

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleElementInteraction);
      document.removeEventListener('mouseleave', handleElementInteraction);
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [enabled, updatePosition, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  // Don't render on touch devices or when disabled
  if (typeof window !== 'undefined' && ('ontouchstart' in window || !enabled)) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide default cursor */
          * {
            cursor: none !important;
          }
          
          /* Show default cursor on touch devices */
          @media (hover: none) and (pointer: coarse) {
            * {
              cursor: auto !important;
            }
            .custom-cursor {
              display: none !important;
            }
          }
        `
      }} />
      
      <div
        className="custom-cursor fixed pointer-events-none z-[99999] transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Main cursor dot - Using vibrant colors for better visibility */}
        <div
          className={`absolute w-4 h-4 rounded-full transition-all duration-200 ease-out ${
            isDarkMode 
              ? 'bg-gradient-to-r from-cyan-400 to-sky-400 shadow-lg shadow-cyan-400/60 ring-2 ring-cyan-300/50' 
              : 'bg-gradient-to-r from-cyan-500 to-sky-500 shadow-lg shadow-cyan-500/60 ring-2 ring-cyan-400/50'
          } ${
            isClicking ? 'scale-75' : 'scale-100'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Inner glow ring */}
        <div
          className={`absolute w-6 h-6 rounded-full transition-all duration-300 ease-out ${
            isDarkMode 
              ? 'border-2 border-cyan-300/60 shadow-lg shadow-cyan-400/40' 
              : 'border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40'
          } ${
            isHovering ? 'scale-125 opacity-100' : 'scale-100 opacity-80'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Middle glow ring */}
        <div
          className={`absolute w-12 h-12 rounded-full transition-all duration-400 ease-out ${
            isDarkMode 
              ? 'border border-sky-300/40 shadow-lg shadow-sky-400/30' 
              : 'border border-sky-400/40 shadow-lg shadow-sky-500/30'
          } ${
            isHovering ? 'scale-150 opacity-60' : 'scale-100 opacity-40'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Outer glow ring */}
        <div
          className={`absolute w-20 h-20 rounded-full transition-all duration-500 ease-out ${
            isDarkMode 
              ? 'border border-cyan-200/30 shadow-lg shadow-cyan-400/20' 
              : 'border border-cyan-300/30 shadow-lg shadow-cyan-500/20'
          } ${
            isHovering ? 'scale-175 opacity-30' : 'scale-100 opacity-20'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Click animation ring */}
        {isClicking && (
          <div
            className={`absolute w-16 h-16 rounded-full animate-ping ${
              isDarkMode 
                ? 'bg-cyan-400/40' 
                : 'bg-cyan-500/40'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        
        {/* Hover effect particles - Using different colors for better contrast */}
        {isHovering && (
          <>
            <div
              className={`absolute w-1.5 h-1.5 rounded-full animate-pulse ${
                isDarkMode ? 'bg-cyan-300' : 'bg-cyan-400'
              }`}
              style={{
                left: 'calc(50% - 10px)',
                top: 'calc(50% - 10px)',
                animationDelay: '0ms',
              }}
            />
            <div
              className={`absolute w-1.5 h-1.5 rounded-full animate-pulse ${
                isDarkMode ? 'bg-sky-300' : 'bg-sky-400'
              }`}
              style={{
                left: 'calc(50% + 10px)',
                top: 'calc(50% - 10px)',
                animationDelay: '200ms',
              }}
            />
            <div
              className={`absolute w-1.5 h-1.5 rounded-full animate-pulse ${
                isDarkMode ? 'bg-cyan-300' : 'bg-cyan-400'
              }`}
              style={{
                left: 'calc(50% - 10px)',
                top: 'calc(50% + 10px)',
                animationDelay: '400ms',
              }}
            />
            <div
              className={`absolute w-1.5 h-1.5 rounded-full animate-pulse ${
                isDarkMode ? 'bg-sky-300' : 'bg-sky-400'
              }`}
              style={{
                left: 'calc(50% + 10px)',
                top: 'calc(50% + 10px)',
                animationDelay: '600ms',
              }}
            />
            {/* Additional corner particles for more visual impact */}
            <div
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                isDarkMode ? 'bg-cyan-200' : 'bg-cyan-300'
              }`}
              style={{
                left: 'calc(50% - 15px)',
                top: 'calc(50% - 15px)',
                animationDelay: '100ms',
              }}
            />
            <div
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                isDarkMode ? 'bg-sky-200' : 'bg-sky-300'
              }`}
              style={{
                left: 'calc(50% + 15px)',
                top: 'calc(50% - 15px)',
                animationDelay: '300ms',
              }}
            />
            <div
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                isDarkMode ? 'bg-cyan-200' : 'bg-cyan-300'
              }`}
              style={{
                left: 'calc(50% - 15px)',
                top: 'calc(50% + 15px)',
                animationDelay: '500ms',
              }}
            />
            <div
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                isDarkMode ? 'bg-sky-200' : 'bg-sky-300'
              }`}
              style={{
                left: 'calc(50% + 15px)',
                top: 'calc(50% + 15px)',
                animationDelay: '700ms',
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default CustomCursor;

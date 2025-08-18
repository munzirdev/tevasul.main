import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  Star, 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  FileText, 
  Building,
  CheckCircle,
  MapPin,
  ArrowUp,
  Sparkles
} from 'lucide-react';

interface MobileOptimizedScrollEffectsProps {
  isDarkMode: boolean;
  isVisible?: boolean;
}

const MobileOptimizedScrollEffects: React.FC<MobileOptimizedScrollEffectsProps> = ({ 
  isDarkMode, 
  isVisible = true 
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Optimized scroll handler for mobile
  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);
    });
  }, [lastScrollY]);

  // Touch move handler for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleScroll, handleTouchMove]);

  // Memoized calculations for better performance
  const scrollProgress = useMemo(() => Math.min(scrollY / 1000, 1), [scrollY]);
  const parallaxStyle = useMemo(() => ({
    transform: `translateY(${scrollY * 0.3}px)`,
  }), [scrollY]);
  
  const touchParallaxStyle = useMemo(() => ({
    transform: `translate(${touchPosition.x * 0.01}px, ${touchPosition.y * 0.01}px)`,
  }), [touchPosition]);

  // Reduced particles for mobile performance
  const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.3 + 0.1,
  })), []);

  // Simplified animated icons for mobile
  const animatedIcons = useMemo(() => [
    { icon: Star, color: 'text-yellow-400', delay: 0, size: 'w-4 h-4' },
    { icon: Heart, color: 'text-red-400', delay: 1, size: 'w-4 h-4' },
    { icon: Shield, color: 'text-blue-400', delay: 2, size: 'w-4 h-4' },
    { icon: Zap, color: 'text-yellow-500', delay: 3, size: 'w-4 h-4' },
    { icon: Users, color: 'text-green-400', delay: 4, size: 'w-4 h-4' },
    { icon: Globe, color: 'text-cyan-400', delay: 5, size: 'w-4 h-4' },
  ], []);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Simplified Background Gradient Animation */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.1,
          background: isDarkMode 
            ? `linear-gradient(${45 + scrollY * 0.005}deg, 
                rgba(59, 130, 246, 0.1) 0%, 
                rgba(147, 51, 234, 0.1) 50%, 
                rgba(59, 130, 246, 0.1) 100%)`
            : `linear-gradient(${45 + scrollY * 0.005}deg, 
                rgba(59, 130, 246, 0.05) 0%, 
                rgba(147, 51, 234, 0.05) 50%, 
                rgba(59, 130, 246, 0.05) 100%)`,
          animation: 'gradient-shift 40s ease infinite',
        }}
      />

      {/* Simplified Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
            transform: `translateY(${scrollY * 0.05}px)`,
            opacity: particle.opacity,
            background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.15)',
          }}
        />
      ))}

      {/* Simplified Parallax Background Elements */}
      <div className="absolute inset-0" style={parallaxStyle}>
        {/* Minimal geometric shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 border border-white/5 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 border border-white/5 rotate-45"></div>
      </div>

      {/* Simplified Touch Parallax Elements */}
      <div className="absolute inset-0" style={touchParallaxStyle}>
        {/* Floating Icons with minimal animation */}
        {animatedIcons.map((item, index) => (
          <div
            key={index}
            className="absolute opacity-10"
            style={{
              left: `${10 + (index * 15) % 80}%`,
              top: `${20 + (index * 20) % 60}%`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <item.icon className={`${item.size} ${item.color}`} />
          </div>
        ))}
      </div>

      {/* Simplified Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-caribbean-500 to-indigo-600 z-50">
        <div 
          className="h-full bg-gradient-to-r from-white to-caribbean-200 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Simplified Center Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Sparkles className="w-8 h-8 text-white/10" />
        </div>
      </div>

      {/* Simplified Scroll-triggered Text Effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-1000"
           style={{ opacity: scrollProgress > 0.5 ? 0.2 : 0 }}>
        <div className="text-white/20 text-xs font-light tracking-wider">
          {scrollProgress > 0.8 ? 'اكتشف المزيد' : 'استمر في التمرير'}
        </div>
      </div>

      {/* Simplified Back to Top Button */}
      {scrollY > 500 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-caribbean-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 pointer-events-auto backdrop-blur-sm"
        >
          <ArrowUp className="w-5 h-5 mx-auto" />
        </button>
      )}

      {/* Simplified Dynamic Grid Pattern */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.02,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${40 + scrollY * 0.05}px ${40 + scrollY * 0.05}px`,
          transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.025}px)`,
        }}
      />

      {/* Simplified Energy Lines */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-caribbean-400/10 to-transparent"
          style={{ transform: `translateX(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent"
          style={{ transform: `translateX(${-scrollY * 0.15}px)` }}
        />
      </div>

      {/* Simplified Scroll Direction Indicator */}
      <div 
        className={`absolute top-4 right-4 w-6 h-6 rounded-full transition-all duration-300 ${
          scrollDirection === 'down' ? 'bg-green-500/20' : 'bg-blue-500/20'
        }`}
        style={{ opacity: scrollY > 100 ? 0.3 : 0 }}
      >
        <div className={`w-full h-full rounded-full transition-all duration-300 ${
          scrollDirection === 'down' ? 'bg-green-400' : 'bg-blue-400'
        }`} style={{ transform: `scale(${scrollDirection === 'down' ? 0.6 : 0.8})` }} />
      </div>

      {/* Simplified Scroll Speed Indicator */}
      <div 
        className="absolute top-4 left-4 w-1.5 h-12 bg-white/5 rounded-full overflow-hidden"
        style={{ opacity: scrollY > 200 ? 0.2 : 0 }}
      >
        <div 
          className="w-full bg-gradient-to-t from-caribbean-400 to-indigo-400 transition-all duration-200"
          style={{ height: `${Math.min(scrollY / 10, 100)}%` }}
        />
      </div>

      {/* Performance Optimized Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          /* Disable complex animations on mobile */
          .animate-float,
          .animate-spin,
          .animate-pulse,
          .animate-bounce {
            animation: none !important;
          }
          
          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation: none !important;
              transition: none !important;
            }
          }
        }
        
        /* Performance optimizations */
        * {
          will-change: auto;
        }
        
        /* Optimize for mobile rendering */
        .mobile-optimized {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default MobileOptimizedScrollEffects;

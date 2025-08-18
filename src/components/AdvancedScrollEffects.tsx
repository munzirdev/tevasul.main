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
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Rocket,
  Crown,
  Diamond,
  Flame
} from 'lucide-react';

interface AdvancedScrollEffectsProps {
  isDarkMode: boolean;
  isVisible?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const AdvancedScrollEffects: React.FC<AdvancedScrollEffectsProps> = ({ 
  isDarkMode, 
  isVisible = true, 
  intensity = 'medium' 
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const velocityTimeoutRef = useRef<NodeJS.Timeout>();

  // Intensity multipliers
  const intensityMultipliers = {
    low: { parallax: 0.3, particles: 8, opacity: 0.1 },
    medium: { parallax: 0.5, particles: 15, opacity: 0.2 },
    high: { parallax: 0.8, particles: 25, opacity: 0.3 }
  };

  const multipliers = intensityMultipliers[intensity];

  // Optimized scroll handler with velocity calculation
  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      
      // Calculate scroll velocity
      if (lastScrollTime > 0) {
        const timeDiff = currentTime - lastScrollTime;
        const scrollDiff = currentScrollY - lastScrollY;
        const velocity = Math.abs(scrollDiff / timeDiff) * 1000; // pixels per second
        
        setScrollVelocity(velocity);
        
        // Clear velocity after 500ms of no scrolling
        if (velocityTimeoutRef.current) {
          clearTimeout(velocityTimeoutRef.current);
        }
        velocityTimeoutRef.current = setTimeout(() => {
          setScrollVelocity(0);
        }, 500);
      }
      
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(currentScrollY);
      setLastScrollTime(currentTime);
      setScrollY(currentScrollY);
    });
  }, [lastScrollY, lastScrollTime]);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (velocityTimeoutRef.current) {
        clearTimeout(velocityTimeoutRef.current);
      }
    };
  }, [handleScroll, handleMouseMove]);

  // Memoized calculations
  const scrollProgress = useMemo(() => Math.min(scrollY / 1000, 1), [scrollY]);
  const parallaxStyle = useMemo(() => ({
    transform: `translateY(${scrollY * multipliers.parallax}px)`,
  }), [scrollY, multipliers.parallax]);
  
  const mouseParallaxStyle = useMemo(() => ({
    transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
  }), [mousePosition]);

  const velocityStyle = useMemo(() => ({
    transform: `scale(${1 + scrollVelocity * 0.0001})`,
    opacity: Math.min(scrollVelocity * 0.001, 0.5),
  }), [scrollVelocity]);

  // Enhanced particles with velocity-based effects
  const particles = useMemo(() => Array.from({ length: multipliers.particles }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    speed: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
    type: Math.random() > 0.7 ? 'sparkle' : 'particle',
  })), [multipliers.particles]);

  // Enhanced animated icons with more variety
  const animatedIcons = useMemo(() => [
    { icon: Star, color: 'text-yellow-400', delay: 0, size: 'w-6 h-6', type: 'floating' },
    { icon: Heart, color: 'text-red-400', delay: 0.5, size: 'w-5 h-5', type: 'pulsing' },
    { icon: Shield, color: 'text-blue-400', delay: 1, size: 'w-7 h-7', type: 'rotating' },
    { icon: Zap, color: 'text-yellow-500', delay: 1.5, size: 'w-6 h-6', type: 'floating' },
    { icon: Users, color: 'text-green-400', delay: 2, size: 'w-5 h-5', type: 'pulsing' },
    { icon: Globe, color: 'text-cyan-400', delay: 2.5, size: 'w-6 h-6', type: 'rotating' },
    { icon: FileText, color: 'text-purple-400', delay: 3, size: 'w-5 h-5', type: 'floating' },
    { icon: Building, color: 'text-indigo-400', delay: 3.5, size: 'w-7 h-7', type: 'pulsing' },
    { icon: CheckCircle, color: 'text-emerald-400', delay: 4, size: 'w-6 h-6', type: 'rotating' },
    { icon: MapPin, color: 'text-pink-400', delay: 4.5, size: 'w-5 h-5', type: 'floating' },
    { icon: TrendingUp, color: 'text-orange-400', delay: 5, size: 'w-6 h-6', type: 'pulsing' },
    { icon: Award, color: 'text-amber-400', delay: 5.5, size: 'w-5 h-5', type: 'rotating' },
    { icon: Target, color: 'text-rose-400', delay: 6, size: 'w-6 h-6', type: 'floating' },
    { icon: Lightbulb, color: 'text-lime-400', delay: 6.5, size: 'w-5 h-5', type: 'pulsing' },
    { icon: Rocket, color: 'text-red-500', delay: 7, size: 'w-6 h-6', type: 'rotating' },
    { icon: Crown, color: 'text-yellow-600', delay: 7.5, size: 'w-5 h-5', type: 'floating' },
    { icon: Diamond, color: 'text-cyan-500', delay: 8, size: 'w-6 h-6', type: 'pulsing' },
    { icon: Flame, color: 'text-orange-500', delay: 8.5, size: 'w-5 h-5', type: 'rotating' },
  ], []);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Advanced Background Gradient Animation */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: multipliers.opacity,
          background: isDarkMode 
            ? `linear-gradient(${45 + scrollY * 0.01}deg, 
                rgba(59, 130, 246, 0.2) 0%, 
                rgba(147, 51, 234, 0.2) 25%, 
                rgba(236, 72, 153, 0.2) 50%, 
                rgba(16, 185, 129, 0.2) 75%, 
                rgba(59, 130, 246, 0.2) 100%)`
            : `linear-gradient(${45 + scrollY * 0.01}deg, 
                rgba(59, 130, 246, 0.1) 0%, 
                rgba(147, 51, 234, 0.1) 25%, 
                rgba(236, 72, 153, 0.1) 50%, 
                rgba(16, 185, 129, 0.1) 75%, 
                rgba(59, 130, 246, 0.1) 100%)`,
          animation: 'gradient-shift 30s ease infinite',
        }}
      />

      {/* Velocity-based Background Effect */}
      <div 
        className="absolute inset-0 transition-all duration-200"
        style={velocityStyle}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(59, 130, 246, ${scrollVelocity * 0.0001}) 0%, 
              transparent 50%)`,
          }}
        />
      </div>

      {/* Enhanced Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full animate-pulse ${
            particle.type === 'sparkle' ? 'animate-sparkle' : ''
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
            transform: `translateY(${scrollY * 0.1}px) scale(${1 + scrollVelocity * 0.0001})`,
            opacity: particle.opacity,
            background: particle.type === 'sparkle' 
              ? 'rgba(255, 255, 255, 0.8)' 
              : isDarkMode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(59, 130, 246, 0.2)',
          }}
        />
      ))}

      {/* Enhanced Parallax Background Elements */}
      <div className="absolute inset-0" style={parallaxStyle}>
        {/* Geometric Shapes with velocity effects */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-spin-slow"
             style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/10 rotate-45 animate-spin-slow-reverse"
             style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-white/10 rounded-full animate-pulse-slow"
             style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 border border-white/10 rotate-12 animate-bounce-slow"
             style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}></div>
        
        {/* Additional shapes */}
        <div className="absolute top-1/3 left-1/6 w-20 h-20 border border-white/5 rounded-lg animate-spin-slow"></div>
        <div className="absolute top-2/3 right-1/6 w-16 h-16 border border-white/5 rotate-30 animate-pulse-slow"></div>
        
        {/* Velocity-responsive shapes */}
        <div 
          className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/5 rounded-full"
          style={{ 
            transform: `translate(-50%, -50%) scale(${1 + scrollVelocity * 0.0002})`,
            animation: scrollVelocity > 100 ? 'spin-fast 0.5s linear infinite' : 'none'
          }}
        ></div>
      </div>

      {/* Enhanced Mouse Parallax Elements */}
      <div className="absolute inset-0" style={mouseParallaxStyle}>
        {/* Floating Icons with type-based animations */}
        {animatedIcons.map((item, index) => (
          <div
            key={index}
            className={`absolute transition-opacity duration-500 ${
              item.type === 'floating' ? 'animate-float-random-1' :
              item.type === 'pulsing' ? 'animate-pulse-slow' :
              'animate-spin-slow'
            }`}
            style={{
              left: `${5 + (index * 7) % 90}%`,
              top: `${10 + (index * 15) % 80}%`,
              animationDelay: `${item.delay}s`,
              opacity: 0.15,
              transform: `scale(${1 + scrollVelocity * 0.0001})`,
            }}
          >
            <item.icon className={`${item.size} ${item.color}`} />
          </div>
        ))}
      </div>

      {/* Advanced Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-caribbean-500 to-indigo-600 z-50">
        <div 
          className="h-full bg-gradient-to-r from-white to-caribbean-200 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
        {/* Velocity indicator */}
        <div 
          className="absolute top-0 right-0 h-full bg-yellow-400 transition-all duration-200"
          style={{ 
            width: `${Math.min(scrollVelocity * 0.1, 10)}px`,
            opacity: scrollVelocity > 50 ? 0.8 : 0
          }}
        />
      </div>

      {/* Enhanced Scroll-triggered Content Animations */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Center Sparkle Effect with velocity */}
        <div className="relative" style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}>
          <Sparkles className="w-16 h-16 text-white/20 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border border-white/15 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Enhanced Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(45deg, 
              transparent 30%, 
              rgba(255, 255, 255, 0.08) 50%, 
              transparent 70%)`,
            transform: `translateX(${scrollY * 0.5}px)`,
          }}
        />
      </div>

      {/* Enhanced Scroll-triggered Text Effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-1000"
           style={{ opacity: scrollProgress > 0.5 ? 0.3 : 0 }}>
        <div className="text-white/30 text-sm font-light tracking-wider">
          {scrollProgress > 0.8 ? 'اكتشف المزيد' : 'استمر في التمرير'}
        </div>
      </div>

      {/* Enhanced Back to Top Button */}
      {scrollY > 500 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-caribbean-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 pointer-events-auto backdrop-blur-sm"
          style={{ transform: `scale(${1 + scrollVelocity * 0.0001})` }}
        >
          <ArrowUp className="w-6 h-6 mx-auto" />
        </button>
      )}

      {/* Enhanced Dynamic Grid Pattern */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${50 + scrollY * 0.1}px ${50 + scrollY * 0.1}px`,
          transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)`,
        }}
      />

      {/* Enhanced Energy Lines */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-caribbean-400/20 to-transparent"
          style={{ transform: `translateX(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent"
          style={{ transform: `translateX(${-scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
          style={{ transform: `translateX(${scrollY * 0.4}px)` }}
        />
      </div>

      {/* Enhanced Pulse Rings */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 w-32 h-32 border border-white/8 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-32 h-32 border border-white/8 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 w-32 h-32 border border-white/8 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Advanced Scroll Direction Indicator */}
      <div 
        className={`absolute top-4 right-4 w-8 h-8 rounded-full transition-all duration-300 ${
          scrollDirection === 'down' ? 'bg-green-500/20' : 'bg-blue-500/20'
        }`}
        style={{ opacity: scrollY > 100 ? 0.5 : 0 }}
      >
        <div className={`w-full h-full rounded-full transition-all duration-300 ${
          scrollDirection === 'down' ? 'bg-green-400' : 'bg-blue-400'
        }`} style={{ transform: `scale(${scrollDirection === 'down' ? 0.6 : 0.8})` }} />
      </div>

      {/* Advanced Scroll Speed Indicator */}
      <div 
        className="absolute top-4 left-4 w-2 h-16 bg-white/10 rounded-full overflow-hidden"
        style={{ opacity: scrollY > 200 ? 0.3 : 0 }}
      >
        <div 
          className="w-full bg-gradient-to-t from-caribbean-400 to-indigo-400 transition-all duration-200"
          style={{ height: `${Math.min(scrollY / 10, 100)}%` }}
        />
        {/* Velocity indicator */}
        <div 
          className="w-full bg-yellow-400 transition-all duration-200"
          style={{ 
            height: `${Math.min(scrollVelocity * 0.5, 100)}%`,
            opacity: scrollVelocity > 50 ? 0.8 : 0
          }}
        />
      </div>

      {/* Performance Optimized Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-random-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
          75% { transform: translateY(-30px) rotate(270deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .animate-float-random-1,
          .animate-pulse-slow,
          .animate-spin-slow,
          .animate-spin-slow-reverse,
          .animate-sparkle {
            animation: none !important;
          }
        }
        
        /* Performance optimizations */
        .animate-float-random-1,
        .animate-pulse-slow,
        .animate-spin-slow,
        .animate-spin-slow-reverse,
        .animate-sparkle {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default AdvancedScrollEffects;

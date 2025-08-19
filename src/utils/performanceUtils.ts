// Performance optimization utilities

export interface DeviceCapabilities {
  cpuCores: number;
  deviceMemory: number;
  connectionSpeed: string;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  batteryLevel: number;
  isLowEndDevice: boolean;
}

export const detectDeviceCapabilities = (): DeviceCapabilities => {
  const cpuCores = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Determine connection speed
  let connectionSpeed = 'fast';
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.effectiveType) {
      connectionSpeed = connection.effectiveType;
    }
  }
  
  // Determine if it's a low-end device
  const isLowEndDevice = cpuCores <= 2 || deviceMemory <= 2 || isMobile;
  
  return {
    cpuCores,
    deviceMemory,
    connectionSpeed,
    isMobile,
    prefersReducedMotion,
    batteryLevel: 1, // Will be updated by battery API if available
    isLowEndDevice
  };
};

export const optimizeForDevice = (capabilities: DeviceCapabilities) => {
  const optimizations = {
    animationsEnabled: true,
    particleCount: 16,
    scrollEffectsEnabled: true,

    backgroundMusicEnabled: true,
    realTimeUpdatesEnabled: true,
    visualEffectsIntensity: 'medium' as 'low' | 'medium' | 'high'
  };
  
  // Low-end device optimizations
  if (capabilities.isLowEndDevice) {
    optimizations.animationsEnabled = false;
    optimizations.particleCount = 4;
    optimizations.scrollEffectsEnabled = false;
    optimizations.visualEffectsIntensity = 'low';
  }
  
  // Mobile optimizations
  if (capabilities.isMobile) {
    optimizations.particleCount = Math.min(optimizations.particleCount, 6);
    optimizations.backgroundMusicEnabled = false;
  }
  
  // Slow connection optimizations
  if (capabilities.connectionSpeed === 'slow' || capabilities.connectionSpeed === '2g') {
    optimizations.realTimeUpdatesEnabled = false;
    optimizations.backgroundMusicEnabled = false;
  }
  
  // Reduced motion preference
  if (capabilities.prefersReducedMotion) {
    optimizations.animationsEnabled = false;
    optimizations.scrollEffectsEnabled = false;
    optimizations.visualEffectsIntensity = 'low';
  }
  
  return optimizations;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  }) as T;
};

export const measurePerformance = (callback: () => void, label: string) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  .toFixed(2)}ms`);
};

export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  // This would need React.lazy, but we'll handle it differently
  return importFunc;
};

export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Start loading the component in the background
  importFunc();
};

export const optimizeImages = () => {
  // Add loading="lazy" to images that are not in viewport
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
};

export const optimizeScroll = (callback: (scrollY: number) => void) => {
  let ticking = false;
  
  return (event: Event) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  };
};

export const createVirtualScroller = (
  container: HTMLElement,
  itemHeight: number,
  totalItems: number,
  renderItem: (index: number) => HTMLElement
) => {
  const visibleItems = Math.ceil(container.clientHeight / itemHeight);
  let startIndex = 0;
  let endIndex = Math.min(visibleItems, totalItems);
  
  const updateVisibleItems = () => {
    const scrollTop = container.scrollTop;
    startIndex = Math.floor(scrollTop / itemHeight);
    endIndex = Math.min(startIndex + visibleItems, totalItems);
    
    // Clear container
    container.innerHTML = '';
    
    // Add padding for invisible items
    const paddingTop = startIndex * itemHeight;
    const paddingBottom = (totalItems - endIndex) * itemHeight;
    
    container.style.paddingTop = `${paddingTop}px`;
    container.style.paddingBottom = `${paddingBottom}px`;
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = renderItem(i);
      item.style.position = 'absolute';
      item.style.top = `${i * itemHeight}px`;
      container.appendChild(item);
    }
  };
  
  container.addEventListener('scroll', throttle(updateVisibleItems, 16));
  updateVisibleItems();
};

export const optimizeAnimations = () => {
  // Disable animations on low-end devices
  const capabilities = detectDeviceCapabilities();
  
  if (capabilities.isLowEndDevice || capabilities.prefersReducedMotion) {
    document.body.style.setProperty('--animation-duration', '0s');
    document.body.style.setProperty('--transition-duration', '0s');
  }
};

export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
    const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
    
    // Warn if memory usage is high
    if (usedMB > totalMB * 0.8) {
      console.warn('High memory usage detected');
    }
  }
};

export const cleanupEventListeners = (element: Element, eventType: string) => {
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
};

export const optimizeRendering = () => {
  // Use requestIdleCallback for non-critical tasks
  if ('requestIdleCallback' in window) {
    return (callback: () => void) => {
      (window as any).requestIdleCallback(callback);
    };
  } else {
    // Fallback to setTimeout
    return (callback: () => void) => {
      setTimeout(callback, 1);
    };
  }
};

// Performance configuration and utilities

export const PERFORMANCE_CONFIG = {
  // Lazy loading thresholds
  LAZY_LOAD_THRESHOLD: 0.1,
  LAZY_LOAD_ROOT_MARGIN: '50px',
  
  // Virtual scrolling
  VIRTUAL_SCROLL_ITEM_HEIGHT: 100,
  VIRTUAL_SCROLL_OVERSCAN: 5,
  VIRTUAL_SCROLL_THRESHOLD: 20, // Use virtual scrolling when items > 20
  
  // Debounce/Throttle timings
  SEARCH_DEBOUNCE_MS: 300,
  SCROLL_THROTTLE_MS: 16, // ~60fps
  RESIZE_THROTTLE_MS: 100,
  
  // Image optimization
  IMAGE_QUALITY: 0.8,
  IMAGE_PLACEHOLDER_COLOR: '#f3f4f6',
  
  // Caching
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  
  // Bundle splitting
  CHUNK_SIZE_LIMIT: 244 * 1024, // 244KB
  
  // Memory management
  MAX_RENDERED_ITEMS: 50,
  CLEANUP_INTERVAL: 30 * 1000, // 30 seconds
};

// Performance monitoring utilities
export class PerformanceMonitor {
  static measurements = new Map();
  
  static startMeasure(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }
  
  static endMeasure(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        this.measurements.set(name, measure.duration);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        }
      }
    }
  }
  
  static getMeasurement(name) {
    return this.measurements.get(name);
  }
  
  static getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }
  
  static clearMeasurements() {
    this.measurements.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Memory management utilities
export class MemoryManager {
  static cache = new Map();
  static maxSize = PERFORMANCE_CONFIG.MAX_CACHE_SIZE;
  
  static set(key, value, ttl = PERFORMANCE_CONFIG.CACHE_DURATION) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }
  
  static get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  static has(key) {
    return this.get(key) !== null;
  }
  
  static delete(key) {
    return this.cache.delete(key);
  }
  
  static clear() {
    this.cache.clear();
  }
  
  static cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  static getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Image optimization utilities
export const ImageOptimizer = {
  // Generate responsive image URLs
  getResponsiveUrl(baseUrl, width, quality = PERFORMANCE_CONFIG.IMAGE_QUALITY) {
    if (!baseUrl) return '';
    
    // This would integrate with your image CDN
    // For now, return the base URL
    return baseUrl;
  },
  
  // Generate placeholder for lazy loading
  getPlaceholder(width = 300, height = 200) {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PERFORMANCE_CONFIG.IMAGE_PLACEHOLDER_COLOR}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`;
  },
  
  // Preload critical images
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
};

// Bundle analyzer helper
export const BundleAnalyzer = {
  // Analyze component render performance
  analyzeComponent(componentName, renderFn) {
    return (...args) => {
      PerformanceMonitor.startMeasure(`component-${componentName}`);
      const result = renderFn(...args);
      PerformanceMonitor.endMeasure(`component-${componentName}`);
      return result;
    };
  },
  
  // Track bundle sizes (development only)
  trackBundleSize() {
    if (process.env.NODE_ENV === 'development' && typeof navigator !== 'undefined') {
      // This would integrate with webpack-bundle-analyzer or similar
      console.log('[Bundle] Tracking bundle sizes...');
    }
  }
};

// Cleanup manager for memory leaks prevention
export const CleanupManager = {
  intervals: new Set(),
  timeouts: new Set(),
  observers: new Set(),
  
  addInterval(id) {
    this.intervals.add(id);
  },
  
  addTimeout(id) {
    this.timeouts.add(id);
  },
  
  addObserver(observer) {
    this.observers.add(observer);
  },
  
  cleanup() {
    // Clear intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    
    // Clear timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers.clear();
    
    // Clear memory cache
    MemoryManager.clear();
  }
};

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    MemoryManager.cleanup();
  }, PERFORMANCE_CONFIG.CLEANUP_INTERVAL);
  
  CleanupManager.addInterval(cleanupInterval);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    CleanupManager.cleanup();
  });
}

export default {
  PERFORMANCE_CONFIG,
  PerformanceMonitor,
  MemoryManager,
  ImageOptimizer,
  BundleAnalyzer,
  CleanupManager
};
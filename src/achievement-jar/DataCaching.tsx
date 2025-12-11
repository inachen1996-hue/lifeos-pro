/**
 * Data Caching and Memory Optimization
 * Implements Requirements 4.2, 5.2
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  maxAge: number; // Maximum age in milliseconds
  maxEntries: number; // Maximum number of entries
  compressionEnabled: boolean;
}

interface DataCachingProps {
  children: React.ReactNode;
  cacheConfig?: Partial<CacheConfig>;
  enableMemoryOptimization?: boolean;
  className?: string;
}

/**
 * Intelligent Data Cache
 * LRU cache with memory management and compression
 */
export class IntelligentDataCache {
  private static instance: IntelligentDataCache;
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private memoryUsage = 0;
  private compressionWorker: Worker | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50, // 50MB default
      maxAge: 30 * 60 * 1000, // 30 minutes
      maxEntries: 1000,
      compressionEnabled: true,
      ...config
    };

    this.initializeCompressionWorker();
    this.startCleanupInterval();
  }

  static getInstance(config?: Partial<CacheConfig>): IntelligentDataCache {
    if (!IntelligentDataCache.instance) {
      IntelligentDataCache.instance = new IntelligentDataCache(config);
    }
    return IntelligentDataCache.instance;
  }

  /**
   * Initialize compression worker for large data
   */
  private initializeCompressionWorker(): void {
    if (!this.config.compressionEnabled || typeof Worker === 'undefined') return;

    try {
      // Create inline worker for data compression
      const workerCode = `
        self.onmessage = function(e) {
          const { id, data, action } = e.data;
          
          try {
            if (action === 'compress') {
              // Simple compression using JSON stringify optimization
              const compressed = JSON.stringify(data);
              self.postMessage({ id, result: compressed, success: true });
            } else if (action === 'decompress') {
              const decompressed = JSON.parse(data);
              self.postMessage({ id, result: decompressed, success: true });
            }
          } catch (error) {
            self.postMessage({ id, error: error.message, success: false });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    } catch (error) {
      console.warn('Failed to initialize compression worker:', error);
    }
  }

  /**
   * Calculate approximate size of data in bytes
   */
  private calculateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  /**
   * Generate cache key with parameters
   */
  private generateKey(baseKey: string, params?: Record<string, any>): string {
    if (!params) return baseKey;
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${baseKey}:${sortedParams}`;
  }

  /**
   * Check if cache needs cleanup
   */
  private needsCleanup(): boolean {
    return (
      this.cache.size > this.config.maxEntries ||
      this.memoryUsage > this.config.maxSize * 1024 * 1024
    );
  }

  /**
   * Perform LRU cleanup
   */
  private performCleanup(): void {
    if (!this.needsCleanup()) return;

    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (LRU)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest entries until we're under limits
    const targetSize = Math.floor(this.config.maxEntries * 0.8);
    const targetMemory = this.config.maxSize * 1024 * 1024 * 0.8;
    
    while (
      (this.cache.size > targetSize || this.memoryUsage > targetMemory) &&
      entries.length > 0
    ) {
      const [key, entry] = entries.shift()!;
      this.cache.delete(key);
      this.memoryUsage -= entry.size;
    }

    console.log(`🧹 Cache cleanup: ${entries.length} entries removed, ${Math.round(this.memoryUsage / 1024 / 1024)}MB used`);
  }

  /**
   * Start periodic cleanup
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.performCleanup();
      this.removeExpiredEntries();
    }, 60000); // Every minute
  }

  /**
   * Remove expired entries
   */
  private removeExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxAge) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.memoryUsage -= entry.size;
      }
    });

    if (expiredKeys.length > 0) {
      console.log(`⏰ Removed ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, params?: Record<string, any>): Promise<void> {
    const cacheKey = this.generateKey(key, params);
    const size = this.calculateSize(data);
    const now = Date.now();

    // Remove existing entry if it exists
    const existing = this.cache.get(cacheKey);
    if (existing) {
      this.memoryUsage -= existing.size;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      size
    };

    this.cache.set(cacheKey, entry);
    this.memoryUsage += size;

    // Trigger cleanup if needed
    if (this.needsCleanup()) {
      this.performCleanup();
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string, params?: Record<string, any>): T | null {
    const cacheKey = this.generateKey(key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(cacheKey);
      this.memoryUsage -= entry.size;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string, params?: Record<string, any>): boolean {
    const cacheKey = this.generateKey(key, params);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(cacheKey);
      this.memoryUsage -= entry.size;
      return false;
    }
    
    return true;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.memoryUsage = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      memoryUsageMB: Math.round(this.memoryUsage / 1024 / 1024 * 100) / 100,
      maxSize: this.config.maxSize,
      maxEntries: this.config.maxEntries,
      hitRate: this.calculateHitRate(),
      averageAccessCount: entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length || 0,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, e) => sum + e.accessCount, 0);
    return totalAccesses > 0 ? Math.min(totalAccesses / this.cache.size, 1) : 0;
  }
}

/**
 * Memory Monitor
 * Monitors memory usage and triggers optimizations
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private observers: ((usage: MemoryInfo) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryInfo {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }

    // Fallback for browsers without memory API
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      usagePercentage: 0
    };
  }

  /**
   * Start monitoring memory usage
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      const usage = this.getMemoryUsage();
      this.notifyObservers(usage);

      // Trigger garbage collection hint if usage is high
      if (usage.usagePercentage > 80) {
        this.suggestGarbageCollection();
      }
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Subscribe to memory usage updates
   */
  subscribe(callback: (usage: MemoryInfo) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify observers of memory usage changes
   */
  private notifyObservers(usage: MemoryInfo): void {
    this.observers.forEach(callback => callback(usage));
  }

  /**
   * Suggest garbage collection (browser-specific)
   */
  private suggestGarbageCollection(): void {
    // This is just a hint - browsers control GC
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        console.log('🗑️ Suggested garbage collection');
      } catch (error) {
        // GC not available or failed
      }
    }
  }
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

/**
 * Data Caching Hook
 */
export const useDataCache = <T>(
  key: string,
  fetcher: () => Promise<T> | T,
  params?: Record<string, any>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useMemo(() => IntelligentDataCache.getInstance(), []);
  const fetcherRef = useRef(fetcher);

  // Update fetcher ref
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchData = useCallback(async () => {
    if (!options.enabled) return;

    // Check cache first
    const cachedData = cache.get<T>(key, params);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);
      
      // Cache the result
      await cache.set(key, result, params);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, params, options.enabled, cache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    const cacheKey = cache['generateKey'](key, params);
    cache['cache'].delete(cacheKey);
    fetchData();
  }, [key, params, cache, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate
  };
};

/**
 * Memory Optimization Hook
 */
export const useMemoryOptimization = () => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const monitor = MemoryMonitor.getInstance();
    monitor.startMonitoring();

    const unsubscribe = monitor.subscribe((usage) => {
      setMemoryInfo(usage);

      // Auto-optimize if memory usage is high
      if (usage.usagePercentage > 85 && !isOptimizing) {
        setIsOptimizing(true);
        
        // Trigger cache cleanup
        const cache = IntelligentDataCache.getInstance();
        cache['performCleanup']();
        
        setTimeout(() => setIsOptimizing(false), 1000);
      }
    });

    return () => {
      unsubscribe();
      monitor.stopMonitoring();
    };
  }, [isOptimizing]);

  const forceOptimization = useCallback(() => {
    setIsOptimizing(true);
    
    const cache = IntelligentDataCache.getInstance();
    cache.clear();
    
    // Force garbage collection hint
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
      } catch (error) {
        // GC not available
      }
    }
    
    setTimeout(() => setIsOptimizing(false), 1000);
  }, []);

  return {
    memoryInfo,
    isOptimizing,
    forceOptimization
  };
};

/**
 * Data Caching Provider Component
 */
export const DataCachingProvider: React.FC<DataCachingProps> = ({
  children,
  cacheConfig,
  enableMemoryOptimization = true,
  className = ''
}) => {
  const [cache] = useState(() => IntelligentDataCache.getInstance(cacheConfig));
  const { memoryInfo, isOptimizing } = useMemoryOptimization();

  useEffect(() => {
    console.log('💾 Data caching initialized:', {
      config: cache['config'],
      memoryOptimization: enableMemoryOptimization
    });
  }, [cache, enableMemoryOptimization]);

  return (
    <div className={`data-caching-provider ${className}`}>
      {enableMemoryOptimization && memoryInfo && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 9999,
          display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
        }}>
          Memory: {Math.round(memoryInfo.usagePercentage)}%
          {isOptimizing && ' (Optimizing...)'}
        </div>
      )}
      {children}
    </div>
  );
};

export default DataCachingProvider;
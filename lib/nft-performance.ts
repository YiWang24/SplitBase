// NFT Performance Optimization Utilities

// Canvas pool for reusing canvas instances
class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private maxSize = 5;

  getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.pool.pop();

    if (!canvas) {
      canvas = document.createElement("canvas");
    }

    canvas.width = width;
    canvas.height = height;

    // Clear the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }

    return canvas;
  }

  returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(canvas);
    }
  }

  clear(): void {
    this.pool = [];
  }
}

export const canvasPool = new CanvasPool();

// Image cache for generated avatars
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 100;

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();

// Debounced function utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttled function utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimized avatar generation with caching
export function generateCachedAvatar(
  basename: string,
  size: number = 64,
): string {
  const cacheKey = `${basename}_${size}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Generate new avatar (this would call the actual generation function)
  // For now, we'll import it dynamically to avoid circular dependencies
  const { generateCyberAvatar } = require("./nft-generation");
  const avatarData = generateCyberAvatar(basename, size);

  // Cache the result
  imageCache.set(cacheKey, avatarData);

  return avatarData;
}

// Batch image loading utility
export function loadImagesInBatch(
  imageSources: string[],
  batchSize: number = 5,
): Promise<HTMLImageElement[]> {
  return new Promise((resolve, reject) => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let errorCount = 0;

    const processBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, imageSources.length);
      const batchPromises: Promise<HTMLImageElement>[] = [];

      for (let i = startIndex; i < endIndex; i++) {
        const promise = new Promise<HTMLImageElement>(
          (resolveImg, rejectImg) => {
            const img = new Image();
            img.onload = () => {
              loadedCount++;
              resolveImg(img);
            };
            img.onerror = () => {
              errorCount++;
              rejectImg(new Error(`Failed to load image: ${imageSources[i]}`));
            };
            img.src = imageSources[i];
          },
        );

        batchPromises.push(promise);
      }

      Promise.allSettled(batchPromises).then((results) => {
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            images[startIndex + index] = result.value;
          }
        });

        if (endIndex < imageSources.length) {
          // Process next batch after a small delay
          setTimeout(() => processBatch(endIndex), 10);
        } else {
          // All batches processed
          if (errorCount > 0 && loadedCount === 0) {
            reject(
              new Error(`Failed to load any images. ${errorCount} errors.`),
            );
          } else {
            resolve(images.filter((img) => img !== undefined));
          }
        }
      });
    };

    processBatch(0);
  });
}

// Memory usage monitoring
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  checkMemoryUsage(): boolean {
    if ("memory" in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize < this.memoryThreshold;
    }
    return true; // Assume OK if memory API not available
  }

  cleanup(): void {
    // Clear caches if memory usage is high
    if (!this.checkMemoryUsage()) {
      imageCache.clear();
      canvasPool.clear();

      // Force garbage collection if available
      if ("gc" in window) {
        (window as any).gc();
      }
    }
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Responsive breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export function getBreakpoint(): keyof typeof breakpoints {
  const width = window.innerWidth;

  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";

  return "sm";
}

// Optimized canvas size based on device
export function getOptimalCanvasSize(
  baseWidth: number,
  baseHeight: number,
): { width: number; height: number } {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const breakpoint = getBreakpoint();

  let scaleFactor = 1;

  // Reduce canvas size on smaller devices
  switch (breakpoint) {
    case "sm":
      scaleFactor = 0.7;
      break;
    case "md":
      scaleFactor = 0.8;
      break;
    case "lg":
      scaleFactor = 0.9;
      break;
    default:
      scaleFactor = 1;
  }

  // Limit pixel ratio to avoid excessive memory usage
  const effectivePixelRatio = Math.min(devicePixelRatio, 2);

  return {
    width: Math.floor(baseWidth * scaleFactor * effectivePixelRatio),
    height: Math.floor(baseHeight * scaleFactor * effectivePixelRatio),
  };
}

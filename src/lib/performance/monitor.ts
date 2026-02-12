/**
 * Performance Monitor
 *
 * Tracks and reports performance metrics for the app.
 * Measures frame rates, render times, and component lifecycle.
 */

import { logger } from '../logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'fps' | 'bytes' | 'count';
  timestamp: number;
}

export interface RenderMetric {
  componentName: string;
  renderTime: number;
  mountTime?: number;
  updateCount: number;
  timestamp: number;
}

interface PerformanceConfig {
  enabled: boolean;
  slowRenderThreshold: number;
  reportInterval: number;
  maxMetrics: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: import.meta.env.DEV,
  slowRenderThreshold: 16.67, // 60fps = 16.67ms per frame
  reportInterval: 10000, // Report every 10 seconds
  maxMetrics: 1000,
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: Map<string, RenderMetric> = new Map();
  private frameTimeStart = 0;
  private frameCount = 0;
  private reportTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Configure the performance monitor
   */
  configure(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start periodic performance reporting
   */
  startReporting(): void {
    if (this.reportTimer) return;

    this.reportTimer = setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);

    logger.info('Performance monitoring started');
  }

  /**
   * Stop periodic performance reporting
   */
  stopReporting(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
      logger.info('Performance monitoring stopped');
    }
  }

  /**
   * Record a generic performance metric
   */
  record(name: string, value: number, unit: PerformanceMetric['unit'] = 'ms'): void {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Trim old metrics if needed
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(name: string): () => number {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.record(name, duration);
      return duration;
    };
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, renderTime: number): void {
    if (!this.config.enabled) return;

    const existing = this.renderMetrics.get(componentName);

    if (existing) {
      existing.renderTime = renderTime;
      existing.updateCount++;
      existing.timestamp = Date.now();
    } else {
      this.renderMetrics.set(componentName, {
        componentName,
        renderTime,
        updateCount: 1,
        timestamp: Date.now(),
      });
    }

    // Log slow renders
    if (renderTime > this.config.slowRenderThreshold) {
      logger.warn(`Slow render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${this.config.slowRenderThreshold}ms`,
      });
    }
  }

  /**
   * Track component mount time
   */
  trackMount(componentName: string, mountTime: number): void {
    if (!this.config.enabled) return;

    const existing = this.renderMetrics.get(componentName);

    if (existing) {
      existing.mountTime = mountTime;
    } else {
      this.renderMetrics.set(componentName, {
        componentName,
        renderTime: 0,
        mountTime,
        updateCount: 0,
        timestamp: Date.now(),
      });
    }

    // Log slow mounts
    if (mountTime > this.config.slowRenderThreshold * 3) {
      logger.warn(`Slow mount: ${componentName}`, {
        mountTime: `${mountTime.toFixed(2)}ms`,
      });
    }
  }

  /**
   * Start frame rate tracking
   */
  startFrameTracking(): void {
    if (!this.config.enabled) return;

    this.frameTimeStart = performance.now();
    this.frameCount = 0;
  }

  /**
   * Record a frame
   */
  recordFrame(): void {
    if (!this.config.enabled) return;

    this.frameCount++;

    const elapsed = performance.now() - this.frameTimeStart;
    if (elapsed >= 1000) {
      const fps = (this.frameCount / elapsed) * 1000;
      this.record('fps', fps, 'fps');

      // Log low frame rates
      if (fps < 55) {
        logger.warn('Low frame rate detected', { fps: fps.toFixed(1) });
      }

      // Reset for next second
      this.frameTimeStart = performance.now();
      this.frameCount = 0;
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    averageRenderTime: number;
    slowRenderCount: number;
    averageFps: number;
    componentStats: RenderMetric[];
  } {
    const renderTimes = this.metrics.filter((m) => m.name.includes('render'));
    const fpsMetrics = this.metrics.filter((m) => m.unit === 'fps');

    const avgRenderTime =
      renderTimes.length > 0
        ? renderTimes.reduce((sum, m) => sum + m.value, 0) / renderTimes.length
        : 0;

    const slowRenderCount = renderTimes.filter(
      (m) => m.value > this.config.slowRenderThreshold
    ).length;

    const avgFps =
      fpsMetrics.length > 0
        ? fpsMetrics.reduce((sum, m) => sum + m.value, 0) / fpsMetrics.length
        : 60;

    return {
      averageRenderTime: avgRenderTime,
      slowRenderCount,
      averageFps: avgFps,
      componentStats: Array.from(this.renderMetrics.values()),
    };
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get slow components (render time > threshold)
   */
  getSlowComponents(): RenderMetric[] {
    return Array.from(this.renderMetrics.values()).filter(
      (m) => m.renderTime > this.config.slowRenderThreshold
    );
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.renderMetrics.clear();
  }

  /**
   * Report current metrics
   */
  private reportMetrics(): void {
    const summary = this.getSummary();
    const slowComponents = this.getSlowComponents();

    if (slowComponents.length > 0) {
      logger.info('Performance report', {
        avgRenderTime: `${summary.averageRenderTime.toFixed(2)}ms`,
        slowRenders: summary.slowRenderCount,
        avgFps: summary.averageFps.toFixed(1),
        slowComponents: slowComponents.map((c) => c.componentName),
      });
    }
  }
}

// Default monitor instance
export const perfMonitor = new PerformanceMonitor();

// Export class for custom instances
export { PerformanceMonitor };

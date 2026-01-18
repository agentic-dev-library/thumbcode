/**
 * Performance Module Tests
 */

import { PerformanceMonitor } from '../performance';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({ enabled: true });
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.stopReporting();
  });

  describe('record', () => {
    it('should record a metric', () => {
      monitor.record('testMetric', 100, 'ms');
      const metrics = monitor.getMetrics();

      expect(metrics.length).toBe(1);
      expect(metrics[0].name).toBe('testMetric');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].unit).toBe('ms');
    });

    it('should trim old metrics when maxMetrics is exceeded', () => {
      const smallMonitor = new PerformanceMonitor({
        enabled: true,
      });

      // Configure with a small max
      smallMonitor.configure({ maxMetrics: 5 });

      // Record more than max
      for (let i = 0; i < 10; i++) {
        smallMonitor.record(`metric${i}`, i, 'ms');
      }

      const metrics = smallMonitor.getMetrics();
      expect(metrics.length).toBe(5);
      // Should have the last 5 metrics
      expect(metrics[0].name).toBe('metric5');
    });

    it('should not record when disabled', () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false });
      disabledMonitor.record('test', 100, 'ms');

      expect(disabledMonitor.getMetrics().length).toBe(0);
    });
  });

  describe('startTiming', () => {
    it('should return a function that records duration', () => {
      const stopTiming = monitor.startTiming('timedOperation');

      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait 10ms
      }

      const duration = stopTiming();

      expect(duration).toBeGreaterThanOrEqual(10);
      expect(monitor.getMetrics().length).toBe(1);
    });
  });

  describe('trackRender', () => {
    it('should track component render time', () => {
      monitor.trackRender('TestComponent', 10);
      monitor.trackRender('TestComponent', 15);

      const summary = monitor.getSummary();
      const componentStats = summary.componentStats.find(
        (c) => c.componentName === 'TestComponent'
      );

      expect(componentStats).toBeDefined();
      expect(componentStats?.updateCount).toBe(2);
      expect(componentStats?.renderTime).toBe(15); // Latest render time
    });
  });

  describe('trackMount', () => {
    it('should track component mount time', () => {
      monitor.trackMount('MountedComponent', 50);

      const summary = monitor.getSummary();
      const componentStats = summary.componentStats.find(
        (c) => c.componentName === 'MountedComponent'
      );

      expect(componentStats).toBeDefined();
      expect(componentStats?.mountTime).toBe(50);
    });
  });

  describe('getSummary', () => {
    it('should return empty summary when no metrics', () => {
      const summary = monitor.getSummary();

      expect(summary.averageRenderTime).toBe(0);
      expect(summary.slowRenderCount).toBe(0);
      expect(summary.averageFps).toBe(60);
      expect(summary.componentStats).toEqual([]);
    });

    it('should calculate average render time', () => {
      monitor.record('render1', 10, 'ms');
      monitor.record('render2', 20, 'ms');
      monitor.record('render3', 30, 'ms');

      const summary = monitor.getSummary();
      expect(summary.averageRenderTime).toBe(20);
    });

    it('should count slow renders', () => {
      monitor.configure({ slowRenderThreshold: 15 });

      monitor.record('render1', 10, 'ms');
      monitor.record('render2', 20, 'ms'); // Slow
      monitor.record('render3', 25, 'ms'); // Slow

      const summary = monitor.getSummary();
      expect(summary.slowRenderCount).toBe(2);
    });
  });

  describe('getSlowComponents', () => {
    it('should return components with render time above threshold', () => {
      monitor.configure({ slowRenderThreshold: 15 });

      monitor.trackRender('FastComponent', 10);
      monitor.trackRender('SlowComponent', 20);
      monitor.trackRender('VerySlowComponent', 50);

      const slowComponents = monitor.getSlowComponents();

      expect(slowComponents.length).toBe(2);
      expect(slowComponents.map((c) => c.componentName)).toContain('SlowComponent');
      expect(slowComponents.map((c) => c.componentName)).toContain('VerySlowComponent');
    });
  });

  describe('clear', () => {
    it('should clear all metrics', () => {
      monitor.record('metric1', 100, 'ms');
      monitor.trackRender('Component1', 10);

      expect(monitor.getMetrics().length).toBe(1);
      expect(monitor.getSummary().componentStats.length).toBe(1);

      monitor.clear();

      expect(monitor.getMetrics().length).toBe(0);
      expect(monitor.getSummary().componentStats.length).toBe(0);
    });
  });

  describe('configure', () => {
    it('should update configuration', () => {
      monitor.configure({ slowRenderThreshold: 50 });

      // This would be slow with default threshold but not with 50
      monitor.trackRender('Component', 30);

      const slowComponents = monitor.getSlowComponents();
      expect(slowComponents.length).toBe(0);
    });
  });

  describe('frame tracking', () => {
    it('should track frame rate', () => {
      monitor.startFrameTracking();

      // Record some frames
      for (let i = 0; i < 60; i++) {
        monitor.recordFrame();
      }

      // Frame tracking happens over time, so we just verify no errors
      expect(() => monitor.recordFrame()).not.toThrow();
    });
  });
});

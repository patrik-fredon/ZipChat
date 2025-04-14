import { MetricsCollector } from '../../src/monitoring/MetricsCollector';
import { PerformanceMonitor } from '../../src/monitoring/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    metricsCollector = MetricsCollector.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await performanceMonitor.initialize();

      expect(performanceMonitor['isInitialized']).toBe(true);
      expect(performanceMonitor['performanceMetrics'].size).toBeGreaterThan(0);
    });

    it('should initialize metrics correctly', async () => {
      await performanceMonitor.initialize();

      const metrics = performanceMonitor['performanceMetrics'];
      expect(metrics.has('cpu_usage')).toBe(true);
      expect(metrics.has('memory_usage')).toBe(true);
      expect(metrics.has('disk_usage')).toBe(true);
      expect(metrics.has('network_usage')).toBe(true);
      expect(metrics.has('response_time')).toBe(true);
      expect(metrics.has('request_rate')).toBe(true);
      expect(metrics.has('error_rate')).toBe(true);
      expect(metrics.has('concurrent_users')).toBe(true);
    });
  });

  describe('monitor', () => {
    it('should monitor performance successfully', async () => {
      await performanceMonitor.initialize();
      const collectSystemMetricsSpy = jest.spyOn(performanceMonitor as any, 'collectSystemMetrics');
      const collectApplicationMetricsSpy = jest.spyOn(performanceMonitor as any, 'collectApplicationMetrics');
      const exportMetricsSpy = jest.spyOn(performanceMonitor as any, 'exportMetrics');

      await performanceMonitor.monitor();

      expect(collectSystemMetricsSpy).toHaveBeenCalled();
      expect(collectApplicationMetricsSpy).toHaveBeenCalled();
      expect(exportMetricsSpy).toHaveBeenCalled();
    });

    it('should throw error if not initialized', async () => {
      await expect(performanceMonitor.monitor()).rejects.toThrow('Performance monitor not initialized');
    });
  });

  describe('collectSystemMetrics', () => {
    it('should collect system metrics', async () => {
      await performanceMonitor.initialize();
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'collect');

      await performanceMonitor['collectSystemMetrics']();

      expect(metricsCollectorSpy).toHaveBeenCalled();
    });

    it('should handle errors during system metrics collection', async () => {
      await performanceMonitor.initialize();
      jest.spyOn(metricsCollector, 'collect').mockRejectedValue(new Error('Collection failed'));

      await performanceMonitor['collectSystemMetrics']();
      // Should not throw, just log error
    });
  });

  describe('collectApplicationMetrics', () => {
    it('should collect application metrics', async () => {
      await performanceMonitor.initialize();
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'collect');

      await performanceMonitor['collectApplicationMetrics']();

      expect(metricsCollectorSpy).toHaveBeenCalled();
    });

    it('should handle errors during application metrics collection', async () => {
      await performanceMonitor.initialize();
      jest.spyOn(metricsCollector, 'collect').mockRejectedValue(new Error('Collection failed'));

      await performanceMonitor['collectApplicationMetrics']();
      // Should not throw, just log error
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics successfully', async () => {
      await performanceMonitor.initialize();
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'exportMetrics');

      await performanceMonitor['exportMetrics']();

      expect(metricsCollectorSpy).toHaveBeenCalled();
    });

    it('should handle errors during metrics export', async () => {
      await performanceMonitor.initialize();
      jest.spyOn(metricsCollector, 'exportMetrics').mockRejectedValue(new Error('Export failed'));

      await performanceMonitor['exportMetrics']();
      // Should not throw, just log error
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await performanceMonitor.initialize();

      await performanceMonitor.shutdown();

      expect(performanceMonitor['isInitialized']).toBe(false);
    });
  });
}); 
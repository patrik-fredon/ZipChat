import { MetricsCollector } from '../../src/monitoring/MetricsCollector';
import { MetricExporter } from '../../src/monitoring/exporters/MetricExporter';
import { Metric, MetricType } from '../../src/monitoring/types/Metric';

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;
  let metricExporter: MetricExporter;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
    metricExporter = new MetricExporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const exporterSpy = jest.spyOn(metricExporter, 'initialize');

      await metricsCollector.initialize();

      expect(exporterSpy).toHaveBeenCalled();
    });

    it('should throw error if initialization fails', async () => {
      jest.spyOn(metricExporter, 'initialize').mockRejectedValue(new Error('Initialization failed'));

      await expect(metricsCollector.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('collect', () => {
    it('should collect metrics successfully', async () => {
      await metricsCollector.initialize();

      const metrics: Metric[] = [
        {
          name: 'test_metric',
          type: MetricType.COUNTER,
          value: 1,
          timestamp: new Date(),
          labels: { test: 'label' }
        }
      ];

      await metricsCollector.collect();

      // Verify metrics were collected
      expect(metricsCollector['metrics'].size).toBeGreaterThan(0);
    });

    it('should throw error if not initialized', async () => {
      await expect(metricsCollector.collect()).rejects.toThrow('Metrics collector not initialized');
    });
  });

  describe('collectSystemMetrics', () => {
    it('should collect system metrics', async () => {
      await metricsCollector.initialize();

      await metricsCollector['collectSystemMetrics']();

      // Verify system metrics were collected
      expect(metricsCollector['metrics'].size).toBeGreaterThan(0);
    });
  });

  describe('collectApplicationMetrics', () => {
    it('should collect application metrics', async () => {
      await metricsCollector.initialize();

      await metricsCollector['collectApplicationMetrics']();

      // Verify application metrics were collected
      expect(metricsCollector['metrics'].size).toBeGreaterThan(0);
    });
  });

  describe('collectBusinessMetrics', () => {
    it('should collect business metrics', async () => {
      await metricsCollector.initialize();

      await metricsCollector['collectBusinessMetrics']();

      // Verify business metrics were collected
      expect(metricsCollector['metrics'].size).toBeGreaterThan(0);
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics successfully', async () => {
      await metricsCollector.initialize();
      const exporterSpy = jest.spyOn(metricExporter, 'export');

      await metricsCollector['exportMetrics']();

      expect(exporterSpy).toHaveBeenCalled();
    });

    it('should handle errors during export', async () => {
      await metricsCollector.initialize();
      jest.spyOn(metricExporter, 'export').mockRejectedValue(new Error('Export failed'));

      await metricsCollector['exportMetrics']();
      // Should not throw, just log error
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await metricsCollector.initialize();
      const exporterSpy = jest.spyOn(metricExporter, 'shutdown');

      await metricsCollector.shutdown();

      expect(exporterSpy).toHaveBeenCalled();
    });

    it('should handle errors during shutdown', async () => {
      await metricsCollector.initialize();
      jest.spyOn(metricExporter, 'shutdown').mockRejectedValue(new Error('Shutdown failed'));

      await metricsCollector.shutdown();
      // Should not throw, just log error
    });
  });
}); 
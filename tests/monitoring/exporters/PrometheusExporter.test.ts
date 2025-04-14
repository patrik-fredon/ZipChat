import { PrometheusExporter } from '../../../src/monitoring/exporters/PrometheusExporter';
import { MetricExport, MetricType } from '../../../src/monitoring/types/Metric';

describe('PrometheusExporter', () => {
  let prometheusExporter: PrometheusExporter;

  beforeEach(() => {
    prometheusExporter = new PrometheusExporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await prometheusExporter.initialize();

      expect(prometheusExporter['isInitialized']).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(`${prometheusExporter['endpoint']}/health`);
    });

    it('should throw error if Prometheus endpoint is not available', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      await expect(prometheusExporter.initialize()).rejects.toThrow('Prometheus endpoint not available');
    });

    it('should throw error if fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(prometheusExporter.initialize()).rejects.toThrow('Network error');
    });
  });

  describe('export', () => {
    it('should export metrics successfully', async () => {
      await prometheusExporter.initialize();
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const exportData: MetricExport = {
        metrics: [
          {
            name: 'test_metric',
            type: MetricType.COUNTER,
            values: [
              {
                value: 1,
                timestamp: new Date()
              }
            ],
            labels: { test: 'label' }
          }
        ],
        timestamp: new Date()
      };

      await prometheusExporter.export(exportData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${prometheusExporter['endpoint']}/metrics`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          }
        })
      );
    });

    it('should throw error if not initialized', async () => {
      const exportData: MetricExport = {
        metrics: [],
        timestamp: new Date()
      };

      await expect(prometheusExporter.export(exportData)).rejects.toThrow('Prometheus exporter not initialized');
    });

    it('should throw error if export fails', async () => {
      await prometheusExporter.initialize();
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'Bad Request' });

      const exportData: MetricExport = {
        metrics: [],
        timestamp: new Date()
      };

      await expect(prometheusExporter.export(exportData)).rejects.toThrow('Failed to send metrics to Prometheus: Bad Request');
    });
  });

  describe('convertToPrometheusFormat', () => {
    it('should convert metrics to Prometheus format', () => {
      const exportData: MetricExport = {
        metrics: [
          {
            name: 'test_metric',
            type: MetricType.COUNTER,
            values: [
              {
                value: 1,
                timestamp: new Date()
              }
            ],
            labels: { test: 'label' }
          }
        ],
        timestamp: new Date()
      };

      const prometheusMetrics = prometheusExporter['convertToPrometheusFormat'](exportData);

      expect(prometheusMetrics).toContain('test_metric{test="label"}');
      expect(prometheusMetrics).toContain('1');
    });

    it('should handle metrics without labels', () => {
      const exportData: MetricExport = {
        metrics: [
          {
            name: 'test_metric',
            type: MetricType.COUNTER,
            values: [
              {
                value: 1,
                timestamp: new Date()
              }
            ],
            labels: {}
          }
        ],
        timestamp: new Date()
      };

      const prometheusMetrics = prometheusExporter['convertToPrometheusFormat'](exportData);

      expect(prometheusMetrics).toContain('test_metric 1');
    });
  });

  describe('sanitizeMetricName', () => {
    it('should sanitize metric names correctly', () => {
      expect(prometheusExporter['sanitizeMetricName']('test.metric')).toBe('test_metric');
      expect(prometheusExporter['sanitizeMetricName']('test-metric')).toBe('test_metric');
      expect(prometheusExporter['sanitizeMetricName']('test/metric')).toBe('test_metric');
    });
  });

  describe('formatLabels', () => {
    it('should format labels correctly', () => {
      const labels = { test: 'label', value: '123' };
      const formattedLabels = prometheusExporter['formatLabels'](labels);

      expect(formattedLabels).toBe('{test="label",value="123"}');
    });

    it('should handle empty labels', () => {
      const labels = {};
      const formattedLabels = prometheusExporter['formatLabels'](labels);

      expect(formattedLabels).toBe('');
    });
  });

  describe('sanitizeLabelName', () => {
    it('should sanitize label names correctly', () => {
      expect(prometheusExporter['sanitizeLabelName']('test.label')).toBe('test_label');
      expect(prometheusExporter['sanitizeLabelName']('test-label')).toBe('test_label');
      expect(prometheusExporter['sanitizeLabelName']('test/label')).toBe('test_label');
    });
  });

  describe('escapeLabelValue', () => {
    it('should escape label values correctly', () => {
      expect(prometheusExporter['escapeLabelValue']('test"value')).toBe('test\\"value');
      expect(prometheusExporter['escapeLabelValue']('test\\value')).toBe('test\\\\value');
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await prometheusExporter.initialize();

      await prometheusExporter.shutdown();

      expect(prometheusExporter['isInitialized']).toBe(false);
    });
  });
}); 
import { Metric, MetricData, MetricExport, MetricLabels, MetricType, MetricValue } from '../../../src/monitoring/types/Metric';

describe('Metric Types', () => {
  describe('Metric', () => {
    it('should create a valid metric', () => {
      const metric: Metric = {
        name: 'test_metric',
        type: MetricType.COUNTER,
        value: 1,
        timestamp: new Date(),
        labels: { test: 'label' }
      };

      expect(metric).toBeDefined();
      expect(metric.name).toBe('test_metric');
      expect(metric.type).toBe(MetricType.COUNTER);
      expect(metric.value).toBe(1);
      expect(metric.timestamp).toBeInstanceOf(Date);
      expect(metric.labels).toEqual({ test: 'label' });
    });
  });

  describe('MetricType', () => {
    it('should have correct enum values', () => {
      expect(MetricType.COUNTER).toBe('counter');
      expect(MetricType.GAUGE).toBe('gauge');
      expect(MetricType.HISTOGRAM).toBe('histogram');
      expect(MetricType.SUMMARY).toBe('summary');
    });
  });

  describe('MetricLabels', () => {
    it('should create valid metric labels', () => {
      const labels: MetricLabels = {
        test: 'label',
        value: '123'
      };

      expect(labels).toBeDefined();
      expect(labels.test).toBe('label');
      expect(labels.value).toBe('123');
    });
  });

  describe('MetricValue', () => {
    it('should create a valid metric value', () => {
      const value: MetricValue = {
        value: 1,
        timestamp: new Date()
      };

      expect(value).toBeDefined();
      expect(value.value).toBe(1);
      expect(value.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('MetricData', () => {
    it('should create valid metric data', () => {
      const data: MetricData = {
        name: 'test_metric',
        type: MetricType.COUNTER,
        values: [
          {
            value: 1,
            timestamp: new Date()
          }
        ],
        labels: { test: 'label' }
      };

      expect(data).toBeDefined();
      expect(data.name).toBe('test_metric');
      expect(data.type).toBe(MetricType.COUNTER);
      expect(data.values.length).toBe(1);
      expect(data.values[0].value).toBe(1);
      expect(data.values[0].timestamp).toBeInstanceOf(Date);
      expect(data.labels).toEqual({ test: 'label' });
    });
  });

  describe('MetricExport', () => {
    it('should create a valid metric export', () => {
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

      expect(exportData).toBeDefined();
      expect(exportData.metrics.length).toBe(1);
      expect(exportData.metrics[0].name).toBe('test_metric');
      expect(exportData.timestamp).toBeInstanceOf(Date);
    });
  });
}); 
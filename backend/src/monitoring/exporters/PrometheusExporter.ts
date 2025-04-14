import { Logger } from '../../utils/logger';
import { MetricExport } from '../types/Metric';

export class PrometheusExporter {
  private logger: Logger;
  private isInitialized: boolean;
  private endpoint: string;

  constructor() {
    this.logger = new Logger('PrometheusExporter');
    this.isInitialized = false;
    this.endpoint = process.env.PROMETHEUS_ENDPOINT || 'http://localhost:9090';
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Verify Prometheus endpoint
      const response = await fetch(`${this.endpoint}/health`);
      if (!response.ok) {
        throw new Error('Prometheus endpoint not available');
      }

      this.isInitialized = true;
      this.logger.info('Prometheus exporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Prometheus exporter', error);
      throw error;
    }
  }

  public async export(exportData: MetricExport): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Prometheus exporter not initialized');
    }

    try {
      const prometheusMetrics = this.convertToPrometheusFormat(exportData);
      await this.sendToPrometheus(prometheusMetrics);
      this.logger.debug('Metrics exported to Prometheus successfully');
    } catch (error) {
      this.logger.error('Failed to export metrics to Prometheus', error);
      throw error;
    }
  }

  private convertToPrometheusFormat(exportData: MetricExport): string {
    let prometheusMetrics = '';

    exportData.metrics.forEach(metric => {
      const metricName = this.sanitizeMetricName(metric.name);
      const labels = this.formatLabels(metric.labels);

      metric.values.forEach(value => {
        const timestamp = value.timestamp.getTime();
        const metricLine = `${metricName}${labels} ${value.value} ${timestamp}\n`;
        prometheusMetrics += metricLine;
      });
    });

    return prometheusMetrics;
  }

  private sanitizeMetricName(name: string): string {
    // Replace invalid characters with underscores
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private formatLabels(labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) {
      return '';
    }

    const formattedLabels = Object.entries(labels)
      .map(([key, value]) => `${this.sanitizeLabelName(key)}="${this.escapeLabelValue(value)}"`)
      .join(',');

    return `{${formattedLabels}}`;
  }

  private sanitizeLabelName(name: string): string {
    // Replace invalid characters with underscores
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private escapeLabelValue(value: string): string {
    // Escape double quotes and backslashes
    return value.replace(/["\\]/g, '\\$&');
  }

  private async sendToPrometheus(metrics: string): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: metrics
      });

      if (!response.ok) {
        throw new Error(`Failed to send metrics to Prometheus: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to send metrics to Prometheus', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.isInitialized = false;
    this.logger.info('Prometheus exporter shut down successfully');
  }
} 
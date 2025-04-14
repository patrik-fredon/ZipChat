import { Logger } from '../../utils/logger';
import { Metric, MetricExport } from '../types/Metric';
import { JSONExporter } from './JSONExporter';
import { PrometheusExporter } from './PrometheusExporter';

export class MetricExporter {
  private exporters: Map<string, any>;
  private logger: Logger;
  private isInitialized: boolean;

  constructor() {
    this.exporters = new Map();
    this.logger = new Logger('MetricExporter');
    this.isInitialized = false;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Prometheus exporter
      const prometheusExporter = new PrometheusExporter();
      await prometheusExporter.initialize();
      this.exporters.set('prometheus', prometheusExporter);

      // Initialize JSON exporter
      const jsonExporter = new JSONExporter();
      await jsonExporter.initialize();
      this.exporters.set('json', jsonExporter);

      this.isInitialized = true;
      this.logger.info('Metric exporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize metric exporter', error);
      throw error;
    }
  }

  public async export(metrics: Metric[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Metric exporter not initialized');
    }

    try {
      const exportData: MetricExport = {
        metrics: this.groupMetrics(metrics),
        timestamp: new Date()
      };

      // Export to all configured exporters
      for (const [name, exporter] of this.exporters) {
        try {
          await exporter.export(exportData);
          this.logger.debug(`Exported metrics to ${name}`);
        } catch (error) {
          this.logger.error(`Failed to export metrics to ${name}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to export metrics', error);
      throw error;
    }
  }

  private groupMetrics(metrics: Metric[]): any[] {
    const groupedMetrics = new Map<string, any>();

    metrics.forEach(metric => {
      const key = `${metric.name}_${JSON.stringify(metric.labels)}`;
      if (!groupedMetrics.has(key)) {
        groupedMetrics.set(key, {
          name: metric.name,
          type: metric.type,
          values: [],
          labels: metric.labels
        });
      }

      const metricData = groupedMetrics.get(key);
      metricData.values.push({
        value: metric.value,
        timestamp: metric.timestamp
      });
    });

    return Array.from(groupedMetrics.values());
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      for (const [name, exporter] of this.exporters) {
        try {
          await exporter.shutdown();
          this.logger.debug(`Shut down ${name} exporter`);
        } catch (error) {
          this.logger.error(`Failed to shut down ${name} exporter`, error);
        }
      }

      this.isInitialized = false;
      this.logger.info('Metric exporter shut down successfully');
    } catch (error) {
      this.logger.error('Failed to shut down metric exporter', error);
      throw error;
    }
  }
} 
import fs from 'fs';
import path from 'path';
import { Logger } from '../../utils/logger';
import { MetricExport } from '../types/Metric';

export class JSONExporter {
  private logger: Logger;
  private isInitialized: boolean;
  private outputDir: string;

  constructor() {
    this.logger = new Logger('JSONExporter');
    this.isInitialized = false;
    this.outputDir = process.env.METRICS_OUTPUT_DIR || './metrics';
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create output directory if it doesn't exist
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      this.isInitialized = true;
      this.logger.info('JSON exporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize JSON exporter', error);
      throw error;
    }
  }

  public async export(exportData: MetricExport): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('JSON exporter not initialized');
    }

    try {
      const timestamp = exportData.timestamp.toISOString().replace(/[:.]/g, '-');
      const filename = `metrics_${timestamp}.json`;
      const filepath = path.join(this.outputDir, filename);

      // Write metrics to file
      await fs.promises.writeFile(
        filepath,
        JSON.stringify(exportData, null, 2),
        'utf8'
      );

      this.logger.debug(`Metrics exported to ${filepath}`);
    } catch (error) {
      this.logger.error('Failed to export metrics to JSON', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.isInitialized = false;
    this.logger.info('JSON exporter shut down successfully');
  }
} 
import fs from 'fs';
import path from 'path';
import { JSONExporter } from '../../../src/monitoring/exporters/JSONExporter';
import { MetricExport, MetricType } from '../../../src/monitoring/types/Metric';

jest.mock('fs');
jest.mock('path');

describe('JSONExporter', () => {
  let jsonExporter: JSONExporter;

  beforeEach(() => {
    jsonExporter = new JSONExporter();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

      await jsonExporter.initialize();

      expect(fs.existsSync).toHaveBeenCalledWith(jsonExporter['outputDir']);
      expect(fs.mkdirSync).toHaveBeenCalledWith(jsonExporter['outputDir'], { recursive: true });
      expect(jsonExporter['isInitialized']).toBe(true);
    });

    it('should not create directory if it already exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await jsonExporter.initialize();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(jsonExporter['isInitialized']).toBe(true);
    });

    it('should throw error if directory creation fails', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create directory');
      });

      await expect(jsonExporter.initialize()).rejects.toThrow('Failed to create directory');
    });
  });

  describe('export', () => {
    it('should export metrics successfully', async () => {
      await jsonExporter.initialize();
      const timestamp = new Date();
      const exportData: MetricExport = {
        metrics: [
          {
            name: 'test_metric',
            type: MetricType.COUNTER,
            values: [
              {
                value: 1,
                timestamp
              }
            ],
            labels: { test: 'label' }
          }
        ],
        timestamp
      };

      const expectedFilename = `metrics_${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
      const expectedFilepath = path.join(jsonExporter['outputDir'], expectedFilename);

      (path.join as jest.Mock).mockReturnValue(expectedFilepath);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await jsonExporter.export(exportData);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expectedFilepath,
        JSON.stringify(exportData, null, 2),
        'utf8'
      );
    });

    it('should throw error if not initialized', async () => {
      const exportData: MetricExport = {
        metrics: [],
        timestamp: new Date()
      };

      await expect(jsonExporter.export(exportData)).rejects.toThrow('JSON exporter not initialized');
    });

    it('should throw error if file write fails', async () => {
      await jsonExporter.initialize();
      const exportData: MetricExport = {
        metrics: [],
        timestamp: new Date()
      };

      (fs.promises.writeFile as jest.Mock).mockRejectedValue(new Error('Failed to write file'));

      await expect(jsonExporter.export(exportData)).rejects.toThrow('Failed to write file');
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await jsonExporter.initialize();

      await jsonExporter.shutdown();

      expect(jsonExporter['isInitialized']).toBe(false);
    });
  });
}); 
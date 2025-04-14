import mongoose from 'mongoose';
import { NotificationABTest } from '../../models/NotificationABTest';
import { NotificationABTestService } from '../NotificationABTestService';

describe('NotificationABTestService', () => {
  let service: NotificationABTestService;
  let mockTest: any;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test');
    service = new NotificationABTestService();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NotificationABTest.deleteMany({});
    mockTest = {
      name: 'Test Notification',
      description: 'Test notification description',
      variants: [
        {
          variantId: 'variant-1',
          content: {
            title: 'Variant 1 Title',
            body: 'Variant 1 Body',
          },
          targetPercentage: 50,
        },
        {
          variantId: 'variant-2',
          content: {
            title: 'Variant 2 Title',
            body: 'Variant 2 Body',
          },
          targetPercentage: 50,
        },
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  });

  describe('createTest', () => {
    it('should create a new test', async () => {
      const test = await service.createTest(mockTest);
      expect(test).toBeDefined();
      expect(test.name).toBe(mockTest.name);
      expect(test.variants).toHaveLength(2);
      expect(test.status).toBe('draft');
    });

    it('should throw error for invalid variant percentages', async () => {
      const invalidTest = {
        ...mockTest,
        variants: [
          {
            variantId: 'variant-1',
            content: {
              title: 'Variant 1 Title',
              body: 'Variant 1 Body',
            },
            targetPercentage: 60,
          },
          {
            variantId: 'variant-2',
            content: {
              title: 'Variant 2 Title',
              body: 'Variant 2 Body',
            },
            targetPercentage: 60,
          },
        ],
      };

      await expect(service.createTest(invalidTest)).rejects.toThrow();
    });
  });

  describe('updateTest', () => {
    it('should update an existing test', async () => {
      const test = await service.createTest(mockTest);
      const updatedName = 'Updated Test Name';
      const updated = await service.updateTest(test.testId, { name: updatedName });
      expect(updated).toBeDefined();
      expect(updated?.name).toBe(updatedName);
    });

    it('should return null for non-existent test', async () => {
      const updated = await service.updateTest('non-existent-id', { name: 'Updated' });
      expect(updated).toBeNull();
    });
  });

  describe('startTest', () => {
    it('should start a draft test', async () => {
      const test = await service.createTest(mockTest);
      const started = await service.startTest(test.testId);
      expect(started).toBeDefined();
      expect(started?.status).toBe('active');
    });

    it('should throw error for non-draft test', async () => {
      const test = await service.createTest(mockTest);
      await service.startTest(test.testId);
      await expect(service.startTest(test.testId)).rejects.toThrow();
    });
  });

  describe('completeTest', () => {
    it('should complete an active test', async () => {
      const test = await service.createTest(mockTest);
      await service.startTest(test.testId);
      const completed = await service.completeTest(test.testId);
      expect(completed).toBeDefined();
      expect(completed?.status).toBe('completed');
    });

    it('should throw error for non-active test', async () => {
      const test = await service.createTest(mockTest);
      await expect(service.completeTest(test.testId)).rejects.toThrow();
    });
  });

  describe('cancelTest', () => {
    it('should cancel a draft test', async () => {
      const test = await service.createTest(mockTest);
      const cancelled = await service.cancelTest(test.testId);
      expect(cancelled).toBeDefined();
      expect(cancelled?.status).toBe('cancelled');
    });

    it('should throw error for completed test', async () => {
      const test = await service.createTest(mockTest);
      await service.startTest(test.testId);
      await service.completeTest(test.testId);
      await expect(service.cancelTest(test.testId)).rejects.toThrow();
    });
  });

  describe('getTest', () => {
    it('should return test by id', async () => {
      const test = await service.createTest(mockTest);
      const found = await service.getTest(test.testId);
      expect(found).toBeDefined();
      expect(found?.testId).toBe(test.testId);
    });

    it('should return null for non-existent test', async () => {
      const found = await service.getTest('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('getActiveTests', () => {
    it('should return active tests', async () => {
      const test = await service.createTest(mockTest);
      await service.startTest(test.testId);
      const activeTests = await service.getActiveTests();
      expect(activeTests).toHaveLength(1);
      expect(activeTests[0].testId).toBe(test.testId);
    });

    it('should return empty array when no active tests', async () => {
      const activeTests = await service.getActiveTests();
      expect(activeTests).toHaveLength(0);
    });
  });

  describe('updateTestMetrics', () => {
    it('should update test metrics', async () => {
      const test = await service.createTest(mockTest);
      await service.startTest(test.testId);
      await service.updateTestMetrics(test.testId);
      const updated = await service.getTest(test.testId);
      expect(updated?.metrics).toBeDefined();
    });
  });
}); 
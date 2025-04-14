import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotificationABTest } from '../../models/NotificationABTest';
import { NotificationABTestController } from '../NotificationABTestController';

describe('NotificationABTestController', () => {
  let controller: NotificationABTestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockTest: any;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test');
    controller = new NotificationABTestController();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NotificationABTest.deleteMany({});
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
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
      mockRequest.body = mockTest;
      await controller.createTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 400 for invalid request', async () => {
      mockRequest.body = { ...mockTest, variants: [] };
      await controller.createTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateTest', () => {
    it('should update an existing test', async () => {
      const test = await NotificationABTest.create(mockTest);
      mockRequest.params = { testId: test.testId };
      mockRequest.body = { name: 'Updated Test Name' };
      await controller.updateTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 for non-existent test', async () => {
      mockRequest.params = { testId: 'non-existent-id' };
      mockRequest.body = { name: 'Updated' };
      await controller.updateTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('startTest', () => {
    it('should start a draft test', async () => {
      const test = await NotificationABTest.create(mockTest);
      mockRequest.params = { testId: test.testId };
      await controller.startTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 400 for non-draft test', async () => {
      const test = await NotificationABTest.create({ ...mockTest, status: 'active' });
      mockRequest.params = { testId: test.testId };
      await controller.startTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('completeTest', () => {
    it('should complete an active test', async () => {
      const test = await NotificationABTest.create({ ...mockTest, status: 'active' });
      mockRequest.params = { testId: test.testId };
      await controller.completeTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 400 for non-active test', async () => {
      const test = await NotificationABTest.create(mockTest);
      mockRequest.params = { testId: test.testId };
      await controller.completeTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('cancelTest', () => {
    it('should cancel a draft test', async () => {
      const test = await NotificationABTest.create(mockTest);
      mockRequest.params = { testId: test.testId };
      await controller.cancelTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 400 for completed test', async () => {
      const test = await NotificationABTest.create({ ...mockTest, status: 'completed' });
      mockRequest.params = { testId: test.testId };
      await controller.cancelTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getTest', () => {
    it('should return test by id', async () => {
      const test = await NotificationABTest.create(mockTest);
      mockRequest.params = { testId: test.testId };
      await controller.getTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 for non-existent test', async () => {
      mockRequest.params = { testId: 'non-existent-id' };
      await controller.getTest(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getActiveTests', () => {
    it('should return active tests', async () => {
      await NotificationABTest.create({ ...mockTest, status: 'active' });
      await controller.getActiveTests(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('updateTestMetrics', () => {
    it('should update test metrics', async () => {
      const test = await NotificationABTest.create({ ...mockTest, status: 'active' });
      mockRequest.params = { testId: test.testId };
      await controller.updateTestMetrics(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 for non-existent test', async () => {
      mockRequest.params = { testId: 'non-existent-id' };
      await controller.updateTestMetrics(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
}); 
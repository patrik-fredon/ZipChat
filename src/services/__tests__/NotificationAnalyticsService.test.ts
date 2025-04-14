import mongoose from 'mongoose';
import { NotificationAnalytics } from '../../models/NotificationAnalytics';
import { NotificationAnalyticsService } from '../NotificationAnalyticsService';

describe('NotificationAnalyticsService', () => {
  let service: NotificationAnalyticsService;
  let mockNotificationAnalytics: any;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test');
    service = new NotificationAnalyticsService();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NotificationAnalytics.deleteMany({});
    mockNotificationAnalytics = {
      notificationId: 'test-notification-id',
      userId: 'test-user-id',
      deliveryStatus: 'sent',
      deliveryTime: new Date(),
      deviceInfo: {
        platform: 'web',
        osVersion: 'Windows 10',
        appVersion: '1.0.0',
      },
      performanceMetrics: {
        deliveryTimeMs: 100,
        processingTimeMs: 50,
        retryCount: 0,
      },
    };
  });

  describe('trackNotificationDelivery', () => {
    it('should create a new notification analytics record', async () => {
      const result = await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      expect(result).toBeDefined();
      expect(result.notificationId).toBe(mockNotificationAnalytics.notificationId);
      expect(result.userId).toBe(mockNotificationAnalytics.userId);
      expect(result.deliveryStatus).toBe('sent');
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', async () => {
      const analytics = await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      const updated = await service.updateDeliveryStatus(
        analytics.notificationId,
        'delivered'
      );

      expect(updated).toBeDefined();
      expect(updated?.deliveryStatus).toBe('delivered');
    });
  });

  describe('trackEngagement', () => {
    it('should track user engagement', async () => {
      const analytics = await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      const updated = await service.trackEngagement(
        analytics.notificationId,
        'opened'
      );

      expect(updated).toBeDefined();
      expect(updated?.engagementStatus).toBe('opened');
    });
  });

  describe('getNotificationAnalytics', () => {
    it('should return analytics for a user within date range', async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);
      const endDate = new Date();

      await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      const analytics = await service.getNotificationAnalytics(
        mockNotificationAnalytics.userId,
        startDate,
        endDate
      );

      expect(analytics).toHaveLength(1);
      expect(analytics[0].userId).toBe(mockNotificationAnalytics.userId);
    });
  });

  describe('getDeliveryMetrics', () => {
    it('should return delivery metrics', async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);
      const endDate = new Date();

      await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      const metrics = await service.getDeliveryMetrics(startDate, endDate);

      expect(metrics).toBeDefined();
      expect(metrics.total).toBe(1);
    });
  });

  describe('getEngagementMetrics', () => {
    it('should return engagement metrics', async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);
      const endDate = new Date();

      const analytics = await service.trackNotificationDelivery(
        mockNotificationAnalytics.notificationId,
        mockNotificationAnalytics.userId,
        mockNotificationAnalytics.deviceInfo,
        mockNotificationAnalytics.performanceMetrics
      );

      await service.trackEngagement(analytics.notificationId, 'opened');

      const metrics = await service.getEngagementMetrics(startDate, endDate);

      expect(metrics).toBeDefined();
      expect(metrics.opened).toBe(1);
    });
  });

  describe('cleanupOldAnalytics', () => {
    it('should remove old analytics data', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      await NotificationAnalytics.create({
        ...mockNotificationAnalytics,
        deliveryTime: oldDate,
      });

      await service.cleanupOldAnalytics(30);

      const remaining = await NotificationAnalytics.find();
      expect(remaining).toHaveLength(0);
    });
  });
}); 
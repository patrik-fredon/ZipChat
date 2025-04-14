import { INotificationAnalytics, NotificationAnalytics } from '../models/NotificationAnalytics';

export class NotificationAnalyticsService {
  async trackNotificationDelivery(
    notificationId: string,
    userId: string,
    deviceInfo: {
      platform: string;
      osVersion: string;
      appVersion: string;
    },
    performanceMetrics: {
      deliveryTimeMs: number;
      processingTimeMs: number;
      retryCount: number;
    }
  ): Promise<INotificationAnalytics> {
    const analytics = new NotificationAnalytics({
      notificationId,
      userId,
      deliveryStatus: 'sent',
      deliveryTime: new Date(),
      deviceInfo,
      performanceMetrics,
    });

    return await analytics.save();
  }

  async updateDeliveryStatus(
    notificationId: string,
    status: 'delivered' | 'failed'
  ): Promise<INotificationAnalytics | null> {
    return await NotificationAnalytics.findOneAndUpdate(
      { notificationId },
      {
        deliveryStatus: status,
        deliveryTime: new Date(),
      },
      { new: true }
    );
  }

  async trackEngagement(
    notificationId: string,
    status: 'opened' | 'clicked' | 'ignored'
  ): Promise<INotificationAnalytics | null> {
    return await NotificationAnalytics.findOneAndUpdate(
      { notificationId },
      {
        engagementStatus: status,
        engagementTime: new Date(),
      },
      { new: true }
    );
  }

  async getNotificationAnalytics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<INotificationAnalytics[]> {
    return await NotificationAnalytics.find({
      userId,
      deliveryTime: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ deliveryTime: -1 });
  }

  async getDeliveryMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    delivered: number;
    failed: number;
    averageDeliveryTime: number;
  }> {
    const metrics = await NotificationAnalytics.aggregate([
      {
        $match: {
          deliveryTime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0],
            },
          },
          avgDeliveryTime: { $avg: '$performanceMetrics.deliveryTimeMs' },
        },
      },
    ]);

    return metrics[0] || {
      total: 0,
      delivered: 0,
      failed: 0,
      averageDeliveryTime: 0,
    };
  }

  async getEngagementMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    opened: number;
    clicked: number;
    ignored: number;
    engagementRate: number;
  }> {
    const metrics = await NotificationAnalytics.aggregate([
      {
        $match: {
          deliveryTime: {
            $gte: startDate,
            $lte: endDate,
          },
          deliveryStatus: 'delivered',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          opened: {
            $sum: {
              $cond: [{ $eq: ['$engagementStatus', 'opened'] }, 1, 0],
            },
          },
          clicked: {
            $sum: {
              $cond: [{ $eq: ['$engagementStatus', 'clicked'] }, 1, 0],
            },
          },
          ignored: {
            $sum: {
              $cond: [{ $eq: ['$engagementStatus', 'ignored'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = metrics[0] || {
      total: 0,
      opened: 0,
      clicked: 0,
      ignored: 0,
    };

    return {
      ...result,
      engagementRate: result.total > 0 ? (result.opened + result.clicked) / result.total : 0,
    };
  }

  async cleanupOldAnalytics(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await NotificationAnalytics.deleteMany({
      deliveryTime: { $lt: cutoffDate },
    });
  }
} 
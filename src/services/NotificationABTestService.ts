import { INotificationABTest, NotificationABTest } from '../models/NotificationABTest';
import { NotificationAnalyticsService } from './NotificationAnalyticsService';

export class NotificationABTestService {
  private analyticsService: NotificationAnalyticsService;

  constructor() {
    this.analyticsService = new NotificationAnalyticsService();
  }

  async createTest(testData: Omit<INotificationABTest, 'testId' | 'status' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<INotificationABTest> {
    const test = new NotificationABTest({
      ...testData,
      testId: this.generateTestId(),
      status: 'draft',
      metrics: {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        averageDeliveryTime: 0,
        engagementRate: 0,
        clickThroughRate: 0,
      },
    });

    return await test.save();
  }

  async updateTest(testId: string, updateData: Partial<INotificationABTest>): Promise<INotificationABTest | null> {
    return await NotificationABTest.findOneAndUpdate(
      { testId },
      { $set: updateData },
      { new: true }
    );
  }

  async startTest(testId: string): Promise<INotificationABTest | null> {
    const test = await NotificationABTest.findOne({ testId });
    if (!test) return null;

    if (test.status !== 'draft') {
      throw new Error('Test can only be started from draft status');
    }

    if (test.startDate > new Date()) {
      throw new Error('Test start date must be in the past or present');
    }

    return await this.updateTest(testId, { status: 'active' });
  }

  async completeTest(testId: string): Promise<INotificationABTest | null> {
    const test = await NotificationABTest.findOne({ testId });
    if (!test) return null;

    if (test.status !== 'active') {
      throw new Error('Test can only be completed from active status');
    }

    return await this.updateTest(testId, { status: 'completed' });
  }

  async cancelTest(testId: string): Promise<INotificationABTest | null> {
    const test = await NotificationABTest.findOne({ testId });
    if (!test) return null;

    if (test.status === 'completed') {
      throw new Error('Completed test cannot be cancelled');
    }

    return await this.updateTest(testId, { status: 'cancelled' });
  }

  async getTest(testId: string): Promise<INotificationABTest | null> {
    return await NotificationABTest.findOne({ testId });
  }

  async getActiveTests(): Promise<INotificationABTest[]> {
    return await NotificationABTest.find({
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
  }

  async updateTestMetrics(testId: string): Promise<void> {
    const test = await NotificationABTest.findOne({ testId });
    if (!test) return;

    const startDate = test.startDate;
    const endDate = test.endDate;

    const deliveryMetrics = await this.analyticsService.getDeliveryMetrics(startDate, endDate);
    const engagementMetrics = await this.analyticsService.getEngagementMetrics(startDate, endDate);

    await NotificationABTest.updateOne(
      { testId },
      {
        $set: {
          'metrics.totalSent': deliveryMetrics.total,
          'metrics.totalDelivered': deliveryMetrics.delivered,
          'metrics.totalOpened': engagementMetrics.opened,
          'metrics.totalClicked': engagementMetrics.clicked,
          'metrics.averageDeliveryTime': deliveryMetrics.averageDeliveryTime,
          'metrics.engagementRate': engagementMetrics.engagementRate,
          'metrics.clickThroughRate': engagementMetrics.clicked / deliveryMetrics.delivered,
        },
      }
    );
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 
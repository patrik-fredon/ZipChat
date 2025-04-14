import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationAnalyticsService } from '../services/NotificationAnalyticsService';

const analyticsService = new NotificationAnalyticsService();

const DateRangeSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export class NotificationAnalyticsController {
  async getNotificationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = DateRangeSchema.parse(req.query);

      const analytics = await analyticsService.getNotificationAnalytics(
        userId,
        startDate,
        endDate
      );

      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDeliveryMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = DateRangeSchema.parse(req.query);

      const metrics = await analyticsService.getDeliveryMetrics(
        startDate,
        endDate
      );

      res.json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEngagementMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = DateRangeSchema.parse(req.query);

      const metrics = await analyticsService.getEngagementMetrics(
        startDate,
        endDate
      );

      res.json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cleanupOldAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { daysToKeep } = z
        .object({
          daysToKeep: z.number().min(1).max(365),
        })
        .parse(req.body);

      await analyticsService.cleanupOldAnalytics(daysToKeep);

      res.json({ message: 'Old analytics data cleaned up successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 
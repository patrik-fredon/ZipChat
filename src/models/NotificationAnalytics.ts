import { Document, Schema, model } from 'mongoose';

export interface INotificationAnalytics extends Document {
  notificationId: string;
  userId: string;
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  deliveryTime: Date;
  engagementStatus: 'opened' | 'clicked' | 'ignored';
  engagementTime?: Date;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
  };
  performanceMetrics: {
    deliveryTimeMs: number;
    processingTimeMs: number;
    retryCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationAnalyticsSchema = new Schema<INotificationAnalytics>(
  {
    notificationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      required: true,
    },
    deliveryTime: { type: Date, required: true },
    engagementStatus: {
      type: String,
      enum: ['opened', 'clicked', 'ignored'],
    },
    engagementTime: { type: Date },
    deviceInfo: {
      platform: { type: String, required: true },
      osVersion: { type: String, required: true },
      appVersion: { type: String, required: true },
    },
    performanceMetrics: {
      deliveryTimeMs: { type: Number, required: true },
      processingTimeMs: { type: Number, required: true },
      retryCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'notification_analytics',
  }
);

// Indexy pro optimalizaci dotazů
NotificationAnalyticsSchema.index({ userId: 1, deliveryTime: -1 });
NotificationAnalyticsSchema.index({ deliveryStatus: 1, deliveryTime: -1 });
NotificationAnalyticsSchema.index({ engagementStatus: 1, engagementTime: -1 });

export const NotificationAnalytics = model<INotificationAnalytics>(
  'NotificationAnalytics',
  NotificationAnalyticsSchema
); 
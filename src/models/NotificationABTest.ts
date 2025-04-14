import { Document, Schema, model } from 'mongoose';

export interface INotificationABTest extends Document {
  testId: string;
  name: string;
  description: string;
  variants: {
    variantId: string;
    content: {
      title: string;
      body: string;
      imageUrl?: string;
      actionUrl?: string;
    };
    targetPercentage: number;
  }[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  metrics: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    averageDeliveryTime: number;
    engagementRate: number;
    clickThroughRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationABTestSchema = new Schema<INotificationABTest>(
  {
    testId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    variants: [
      {
        variantId: { type: String, required: true },
        content: {
          title: { type: String, required: true },
          body: { type: String, required: true },
          imageUrl: { type: String },
          actionUrl: { type: String },
        },
        targetPercentage: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    metrics: {
      totalSent: { type: Number, default: 0 },
      totalDelivered: { type: Number, default: 0 },
      totalOpened: { type: Number, default: 0 },
      totalClicked: { type: Number, default: 0 },
      averageDeliveryTime: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'notification_ab_tests',
  }
);

// Indexy pro optimalizaci dotazů
NotificationABTestSchema.index({ testId: 1 });
NotificationABTestSchema.index({ status: 1, startDate: 1 });
NotificationABTestSchema.index({ endDate: 1 });

export const NotificationABTest = model<INotificationABTest>(
  'NotificationABTest',
  NotificationABTestSchema
); 
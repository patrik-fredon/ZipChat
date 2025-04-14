import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { INotificationABTest } from '../../models/NotificationABTest';
import { Card } from '../ui/card';

interface NotificationABTestMetricsProps {
  test: INotificationABTest;
  variantMetrics: {
    variantId: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    engagementRate: number;
    clickThroughRate: number;
  }[];
  timeSeriesData: {
    date: Date;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }[];
}

export const NotificationABTestMetrics: React.FC<NotificationABTestMetricsProps> = ({
  test,
  variantMetrics,
  timeSeriesData,
}) => {
  const { t } = useTranslation();

  const formatDate = (date: Date) => {
    return format(new Date(date), 'd. M. yyyy', { locale: cs });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.totalSent')}
          </h3>
          <p className="text-2xl font-bold">{test.metrics.totalSent}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.totalDelivered')}
          </h3>
          <p className="text-2xl font-bold">{test.metrics.totalDelivered}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.totalOpened')}
          </h3>
          <p className="text-2xl font-bold">{test.metrics.totalOpened}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.totalClicked')}
          </h3>
          <p className="text-2xl font-bold">{test.metrics.totalClicked}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.engagementRate')}
          </h3>
          <p className="text-2xl font-bold">
            {formatPercentage(test.metrics.engagementRate)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {t('notifications.abTest.metrics.clickThroughRate')}
          </h3>
          <p className="text-2xl font-bold">
            {formatPercentage(test.metrics.clickThroughRate)}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('notifications.abTest.metrics.variantComparison')}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.variantId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.sent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.delivered')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.opened')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.clicked')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.engagementRate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('notifications.abTest.metrics.clickThroughRate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variantMetrics.map((variant) => (
                <tr key={variant.variantId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {variant.variantId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.sent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.delivered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.opened}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.clicked}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(variant.engagementRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(variant.clickThroughRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('notifications.abTest.metrics.timeSeries')}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => [value, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                stroke="#8884d8"
                name={t('notifications.abTest.metrics.sent')}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                stroke="#82ca9d"
                name={t('notifications.abTest.metrics.delivered')}
              />
              <Line
                type="monotone"
                dataKey="opened"
                stroke="#ffc658"
                name={t('notifications.abTest.metrics.opened')}
              />
              <Line
                type="monotone"
                dataKey="clicked"
                stroke="#ff8042"
                name={t('notifications.abTest.metrics.clicked')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 
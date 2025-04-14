import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { INotificationABTest } from '../../models/NotificationABTest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface NotificationABTestListProps {
  tests: INotificationABTest[];
  onEdit: (test: INotificationABTest) => void;
  onStart: (testId: string) => Promise<void>;
  onComplete: (testId: string) => Promise<void>;
  onCancel: (testId: string) => Promise<void>;
  onViewMetrics: (testId: string) => void;
}

export const NotificationABTestList: React.FC<NotificationABTestListProps> = ({
  tests,
  onEdit,
  onStart,
  onComplete,
  onCancel,
  onViewMetrics,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">{t('notifications.abTest.status.draft')}</Badge>;
      case 'active':
        return <Badge variant="success">{t('notifications.abTest.status.active')}</Badge>;
      case 'completed':
        return <Badge variant="info">{t('notifications.abTest.status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="error">{t('notifications.abTest.status.cancelled')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <div
          key={test.testId}
          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
              <p className="text-sm text-gray-500">{test.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(test.status)}
              <span className="text-sm text-gray-500">
                {format(new Date(test.startDate), 'd. M. yyyy', { locale: cs })} -{' '}
                {format(new Date(test.endDate), 'd. M. yyyy', { locale: cs })}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                {t('notifications.abTest.metrics')}
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-gray-500">
                    {t('notifications.abTest.metrics.sent')}:
                  </span>
                  <span className="ml-2 text-sm font-medium">{test.metrics.totalSent}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    {t('notifications.abTest.metrics.delivered')}:
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {test.metrics.totalDelivered}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    {t('notifications.abTest.metrics.opened')}:
                  </span>
                  <span className="ml-2 text-sm font-medium">{test.metrics.totalOpened}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    {t('notifications.abTest.metrics.clicked')}:
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {test.metrics.totalClicked}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => onViewMetrics(test.testId)}
                className="w-full"
              >
                {t('notifications.abTest.viewMetrics')}
              </Button>

              {test.status === 'draft' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onEdit(test)}
                    className="w-full"
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => onStart(test.testId)}
                    className="w-full"
                  >
                    {t('notifications.abTest.start')}
                  </Button>
                  <Button
                    variant="error"
                    onClick={() => onCancel(test.testId)}
                    className="w-full"
                  >
                    {t('notifications.abTest.cancel')}
                  </Button>
                </>
              )}

              {test.status === 'active' && (
                <Button
                  variant="info"
                  onClick={() => onComplete(test.testId)}
                  className="w-full"
                >
                  {t('notifications.abTest.complete')}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
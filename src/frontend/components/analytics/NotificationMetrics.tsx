import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MetricsData {
  total: number;
  delivered: number;
  failed: number;
  averageDeliveryTime: number;
  opened: number;
  clicked: number;
  ignored: number;
  engagementRate: number;
}

export const NotificationMetrics: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(),
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [startDate, endDate] = dateRange;
        const response = await fetch(
          `/api/analytics/notifications/delivery-metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const deliveryData = await response.json();

        const engagementResponse = await fetch(
          `/api/analytics/notifications/engagement-metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const engagementData = await engagementResponse.json();

        setMetrics({
          ...deliveryData,
          ...engagementData,
        });
      } catch (err) {
        setError(t('analytics.error.loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, t]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <DateRangePicker
            value={dateRange}
            onChange={(newValue) => setDateRange(newValue as [Date, Date])}
            localeText={{
              start: t('analytics.dateRange.start'),
              end: t('analytics.dateRange.end'),
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('analytics.metrics.total')}
                </Typography>
                <Typography variant="h4">{metrics?.total || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('analytics.metrics.delivered')}
                </Typography>
                <Typography variant="h4">{metrics?.delivered || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('analytics.metrics.failed')}
                </Typography>
                <Typography variant="h4">{metrics?.failed || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('analytics.metrics.engagementRate')}
                </Typography>
                <Typography variant="h4">
                  {metrics?.engagementRate ? `${(metrics.engagementRate * 100).toFixed(1)}%` : '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('analytics.metrics.averageDeliveryTime')}
                </Typography>
                <Typography variant="h4">
                  {metrics?.averageDeliveryTime
                    ? `${(metrics.averageDeliveryTime / 1000).toFixed(2)}s`
                    : '0s'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 
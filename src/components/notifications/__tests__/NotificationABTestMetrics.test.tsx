import { render, screen } from '@testing-library/react';
import { INotificationABTest } from '../../../models/NotificationABTest';
import { NotificationABTestMetrics } from '../NotificationABTestMetrics';

const mockTest: INotificationABTest = {
  testId: 'test-1',
  name: 'Test Notification',
  description: 'Test description',
  status: 'active',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  variants: [
    {
      variantId: 'variant-1',
      content: {
        title: 'Variant 1',
        body: 'Body 1',
      },
      targetPercentage: 50,
    },
    {
      variantId: 'variant-2',
      content: {
        title: 'Variant 2',
        body: 'Body 2',
      },
      targetPercentage: 50,
    },
  ],
  metrics: {
    totalSent: 1000,
    totalDelivered: 900,
    totalOpened: 800,
    totalClicked: 700,
    engagementRate: 0.8,
    clickThroughRate: 0.7,
  },
};

const mockVariantMetrics = [
  {
    variantId: 'variant-1',
    sent: 500,
    delivered: 450,
    opened: 400,
    clicked: 350,
    engagementRate: 0.8,
    clickThroughRate: 0.7,
  },
  {
    variantId: 'variant-2',
    sent: 500,
    delivered: 450,
    opened: 400,
    clicked: 350,
    engagementRate: 0.8,
    clickThroughRate: 0.7,
  },
];

const mockTimeSeriesData = [
  {
    date: new Date('2024-01-01'),
    sent: 100,
    delivered: 90,
    opened: 80,
    clicked: 70,
  },
  {
    date: new Date('2024-01-02'),
    sent: 200,
    delivered: 180,
    opened: 160,
    clicked: 140,
  },
];

describe('NotificationABTestMetrics', () => {
  it('renders total metrics cards', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={mockVariantMetrics}
        timeSeriesData={mockTimeSeriesData}
      />
    );

    expect(screen.getByText('notifications.abTest.metrics.totalSent')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.totalDelivered')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.totalOpened')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.totalClicked')).toBeInTheDocument();
    expect(screen.getByText('700')).toBeInTheDocument();
  });

  it('renders rate metrics cards', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={mockVariantMetrics}
        timeSeriesData={mockTimeSeriesData}
      />
    );

    expect(screen.getByText('notifications.abTest.metrics.engagementRate')).toBeInTheDocument();
    expect(screen.getByText('80.00%')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.clickThroughRate')).toBeInTheDocument();
    expect(screen.getByText('70.00%')).toBeInTheDocument();
  });

  it('renders variant comparison table', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={mockVariantMetrics}
        timeSeriesData={mockTimeSeriesData}
      />
    );

    expect(screen.getByText('notifications.abTest.metrics.variantComparison')).toBeInTheDocument();
    expect(screen.getByText('variant-1')).toBeInTheDocument();
    expect(screen.getByText('variant-2')).toBeInTheDocument();
    expect(screen.getAllByText('500')).toHaveLength(2);
    expect(screen.getAllByText('450')).toHaveLength(2);
    expect(screen.getAllByText('400')).toHaveLength(2);
    expect(screen.getAllByText('350')).toHaveLength(2);
    expect(screen.getAllByText('80.00%')).toHaveLength(2);
    expect(screen.getAllByText('70.00%')).toHaveLength(2);
  });

  it('renders time series chart', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={mockVariantMetrics}
        timeSeriesData={mockTimeSeriesData}
      />
    );

    expect(screen.getByText('notifications.abTest.metrics.timeSeries')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.sent')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.delivered')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.opened')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.clicked')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={mockVariantMetrics}
        timeSeriesData={mockTimeSeriesData}
      />
    );

    expect(screen.getByText('1. 1. 2024')).toBeInTheDocument();
    expect(screen.getByText('2. 1. 2024')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <NotificationABTestMetrics
        test={mockTest}
        variantMetrics={[]}
        timeSeriesData={[]}
      />
    );

    expect(screen.getByText('notifications.abTest.metrics.variantComparison')).toBeInTheDocument();
    expect(screen.getByText('notifications.abTest.metrics.timeSeries')).toBeInTheDocument();
  });
}); 